import { type ChildProcess, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAuthSession, SESSION_COOKIE } from '../../src/server/auth/sessions.ts';
import { systemClock } from '../../src/server/clock.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { enqueueJob } from '../../src/server/jobs/jobStore.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T08 restart and multi-process checks (AC-08, docs/05 "Durable delivery"):
 * - separate runner processes, each with its own SQLite connection, claim every job once;
 * - a runner process killed before the PDF write, between the temporary write and the rename,
 *   and after the rename resumes (after the lease expires) without duplicate files, attachment
 *   rows or ledger rows;
 * - the run-jobs CLI is refused in production and runs the PDF job deterministically otherwise;
 * - the server entry passes DATA_DIR to the app and starts the in-process runner.
 * Children are started with process.execPath and load the TypeScript sources directly. All
 * data is synthetic; files live in the test context's temporary directory.
 */

let t: TestContext;
let employee: string;
/** Live children and their exit promises, so a failed test never leaves a process holding the database. */
const children = new Map<ChildProcess, Promise<unknown>>();

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
});

afterEach(async () => {
  const running = [...children.entries()];
  for (const [child] of running) child.kill();
  await Promise.all(running.map(([, exited]) => exited));
  children.clear();
  t.close();
});

const PAYROLL = '2026-10-02';
const SRC = new URL('../../src/server/', import.meta.url);
const CLI = fileURLToPath(new URL('cli.ts', SRC));
const SERVER = fileURLToPath(new URL('index.ts', SRC));
const workDir = () => dirname(t.config.databasePath);
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const listDir = (path: string) => (existsSync(path) ? readdirSync(path) : []);

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

/** A child runner: claims with the production store or runs the PDF job, pausing at a crash point. */
const CHILD = String.raw`
const src = process.env.T_SRC;
const { writeFileSync, existsSync } = await import('node:fs');
const { join } = await import('node:path');
const { openDatabase } = await import(new URL('db/database.ts', src).href);
const db = openDatabase(process.env.T_DB);
const clock = { now: () => new Date(process.env.T_NOW) };
if (process.env.T_MODE === 'claim') {
  const { claimNextJob } = await import(new URL('jobs/jobStore.ts', src).href);
  writeFileSync(join(process.env.T_MARKS, 'ready-' + process.env.T_OWNER), '');
  const go = join(process.env.T_MARKS, 'go');
  const deadline = Date.now() + 20000;
  while (!existsSync(go)) { if (Date.now() > deadline) throw new Error('no start signal'); }
  const claimed = [];
  for (;;) {
    const job = claimNextJob(db, clock, { owner: process.env.T_OWNER, kinds: ['test_job'], leaseSeconds: 600 });
    if (job === null) break;
    claimed.push(job.id);
  }
  db.close();
  process.stdout.write(JSON.stringify(claimed));
} else {
  const { FileStore } = await import(new URL('files/fileStore.ts', src).href);
  const { runJobsOnce } = await import(new URL('jobs/runner.ts', src).href);
  const { createPdfJobHandler } = await import(new URL('jobs/pdfJob.ts', src).href);
  const files = new FileStore(process.env.T_DATA);
  const pause = (point) => {
    if (process.env.T_CRASH !== point) return;
    writeFileSync(join(process.env.T_MARKS, point), '');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60000);
    throw new Error('the child was not killed');
  };
  const hooks = { beforeWrite: () => pause('before-write'), beforeRename: () => pause('before-rename'), afterRename: () => pause('after-rename') };
  const handlers = { render_pdf: createPdfJobHandler({ db, clock, files, hooks }) };
  const summary = await runJobsOnce({ db, clock, owner: process.env.T_OWNER, leaseSeconds: 60, handlers });
  db.close();
  process.stdout.write(JSON.stringify(summary));
}
`;

interface ChildResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

function start(args: string[], env: Record<string, string | undefined>): { child: ChildProcess; done: Promise<ChildResult> } {
  const merged: Record<string, string | undefined> = { ...process.env, ...env };
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete merged[key];
  const child = spawn(process.execPath, args, { env: merged, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout?.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk));
  child.stderr?.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
  const done = new Promise<ChildResult>((resolve) => {
    child.on('exit', (code, signal) => {
      children.delete(child);
      // Let the pipes drain before resolving.
      setImmediate(() => resolve({ code, signal, stdout, stderr }));
    });
  });
  children.set(child, done);
  return { child, done };
}

function startChild(env: Record<string, string>) {
  return start(['--input-type=module', '-e', CHILD], { T_SRC: SRC.href, T_DB: t.config.databasePath, ...env });
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function addSession(date: string, from: string, to: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** A signed revision whose signature lives in `dataDir`; returns the revision and its PDF job. */
async function signedRevision(dataDir: string) {
  await addSession('2026-09-15', '09:00', '18:00');
  await addSession('2026-09-20', '10:00', '12:00'); // first Sunday
  const signature = saveSignature(t.db, t.clock, new FileStore(dataDir), t.userIds.employee, makePng(40, 12), 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
  expect(review.status, JSON.stringify(review.body)).toBe(200);
  const response = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie: employee,
    body: {
      expected_version: review.body.expected_version,
      reviewed_hash: review.body.payload_hash,
      signer_name: 'Example Employee',
      incomplete_evidence_acknowledged: true,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  const revisionId = response.body.revision.id as string;
  const pdfJobId = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'render_pdf'").pluck().get(revisionId) as string;
  return { revisionId, pdfJobId, signature };
}

function ledgerState() {
  return {
    ledger: count('SELECT count(*) FROM ot_ledger'),
    lines: count('SELECT count(*) FROM revision_ledger_lines'),
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    attempts: count('SELECT count(*) FROM delivery_attempts'),
  };
}

// ---------------------------------------------------------------------------------------

describe('separate runner processes', () => {
  it('claim every job exactly once', async () => {
    const marks = join(workDir(), 'marks-claim');
    mkdirSync(marks);
    const ids = Array.from({ length: 40 }, (_, index) => enqueueJob(t.db, t.clock, { kind: 'test_job', businessKey: `test:race:${index}` }).job.id);
    const owners = ['runner-1', 'runner-2', 'runner-3'];
    const runs = owners.map((owner) => startChild({ T_MODE: 'claim', T_OWNER: owner, T_MARKS: marks, T_NOW: '2026-09-29T20:00:00Z' }));
    await waitFor(() => owners.every((owner) => existsSync(join(marks, `ready-${owner}`))), 'runner processes');
    writeFileSync(join(marks, 'go'), '');
    const results = await Promise.all(runs.map((run) => run.done));
    for (const result of results) expect(result.code, result.stderr).toBe(0);
    const claimed = results.flatMap((result) => JSON.parse(result.stdout) as string[]);
    expect(claimed).toHaveLength(ids.length);
    expect(new Set(claimed)).toEqual(new Set(ids));
    const rows = t.db.prepare("SELECT lease_owner, attempts FROM jobs WHERE kind = 'test_job'").all() as Array<{ lease_owner: string; attempts: number }>;
    expect(rows.every((row) => row.attempts === 1 && owners.includes(row.lease_owner))).toBe(true);
  });
});

describe('a runner process killed during the PDF job', () => {
  for (const point of ['before-write', 'before-rename', 'after-rename'] as const) {
    it(`resumes after a kill ${point.replace('-', ' ')} without duplicate files or ledger rows`, async () => {
      const dataDir = join(workDir(), 'private-data');
      const marks = join(workDir(), `marks-${point}`);
      mkdirSync(marks);
      const { revisionId, pdfJobId } = await signedRevision(dataDir);
      const before = ledgerState();
      const filesDir = join(dataDir, 'files');
      const signatureFiles = listDir(filesDir);
      expect(signatureFiles).toHaveLength(1);

      // First runner: killed at the crash point while it holds the lease.
      const first = startChild({ T_MODE: 'pdf', T_OWNER: 'runner-crash', T_DATA: dataDir, T_MARKS: marks, T_CRASH: point, T_NOW: '2026-09-29T20:05:00Z' });
      await waitFor(() => existsSync(join(marks, point)), `the ${point} pause`);
      first.child.kill('SIGKILL');
      const killed = await first.done;
      expect(killed.code === 0).toBe(false);
      expect(t.db.prepare('SELECT state, lease_owner, attempts FROM jobs WHERE id = ?').get(pdfJobId)).toEqual({ state: 'leased', lease_owner: 'runner-crash', attempts: 1 });
      expect(t.db.prepare('SELECT state FROM revision_files WHERE revision_id = ?').pluck().get(revisionId)).toBe('pending');
      expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(0);
      const filesAfterCrash = listDir(filesDir).length;
      expect(filesAfterCrash).toBe(point === 'after-rename' ? 2 : 1);
      expect(listDir(join(dataDir, 'tmp'))).toHaveLength(point === 'before-rename' ? 1 : 0);

      // Before the lease expires nobody takes the job.
      const early = await startChild({ T_MODE: 'pdf', T_OWNER: 'runner-early', T_DATA: dataDir, T_MARKS: marks, T_NOW: '2026-09-29T20:05:59Z' }).done;
      expect(early.code, early.stderr).toBe(0);
      expect(JSON.parse(early.stdout)).toMatchObject({ claimed: 0 });

      // A restarted runner reclaims the expired lease and finishes the same snapshot.
      const resumed = await startChild({ T_MODE: 'pdf', T_OWNER: 'runner-resume', T_DATA: dataDir, T_MARKS: marks, T_NOW: '2026-09-29T20:06:00Z' }).done;
      expect(resumed.code, resumed.stderr).toBe(0);
      expect(JSON.parse(resumed.stdout)).toEqual({ claimed: 1, succeeded: 1, retried: 0, intervention: 0, lost: 0 });
      expect(t.db.prepare('SELECT state, attempts, lease_owner FROM jobs WHERE id = ?').get(pdfJobId)).toEqual({ state: 'succeeded', attempts: 2, lease_owner: null });

      const pdfs = t.db.prepare("SELECT storage_key, sha256 FROM attachments WHERE kind = 'pdf'").all() as Array<{ storage_key: string; sha256: string }>;
      expect(pdfs).toHaveLength(1);
      const [pdf] = pdfs;
      expect(t.db.prepare('SELECT state, attachment_id IS NOT NULL AS linked FROM revision_files WHERE revision_id = ?').get(revisionId)).toEqual({ state: 'ready', linked: 1 });
      // One signature file and exactly one PDF file, both referenced.
      const names = listDir(filesDir).sort();
      expect(names).toEqual([...signatureFiles, pdf?.storage_key].sort());
      expect(sha(readFileSync(join(filesDir, pdf?.storage_key ?? '')))).toBe(pdf?.sha256);
      // Nothing posted twice; nothing sent.
      expect(ledgerState()).toEqual(before);
      expect(t.db.prepare("SELECT state, attempts FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(revisionId)).toEqual({ state: 'queued', attempts: 0 });
      // A stale temporary file is left for the file store's orphan sweep, never renamed later.
      const swept = new FileStore(dataDir).sweep({ isReferenced: (key) => names.includes(key), minAgeMs: 0, now: new Date(Date.now() + 60_000) });
      expect(swept).toMatchObject({ removedUnreferenced: 0, keptReferenced: 2, removedTemporary: point === 'before-rename' ? 1 : 0 });
    });
  }
});

describe('run-jobs CLI', () => {
  it('is refused in production and touches nothing', async () => {
    const { pdfJobId } = await signedRevision(join(workDir(), 'private-data'));
    const result = await start([CLI, 'run-jobs', '--once', '--now', '2026-09-29T20:05:00Z'], {
      NODE_ENV: 'production',
      APP_ORIGINS: 'https://timesheet.example.invalid',
      PUBLIC_BASE_URL: 'https://timesheet.example.invalid',
      DATABASE_PATH: t.config.databasePath,
      DATA_DIR: join(workDir(), 'private-data'),
    }).done;
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Refusing to run jobs from the CLI when NODE_ENV=production');
    expect(t.db.prepare('SELECT state, attempts FROM jobs WHERE id = ?').get(pdfJobId)).toEqual({ state: 'queued', attempts: 0 });
    expect(t.db.prepare('SELECT runner_heartbeat_at FROM operations_state').pluck().get()).toBeNull();
  });

  it('rejects a missing --once or an invalid --now', async () => {
    const env = { NODE_ENV: undefined, DATABASE_PATH: t.config.databasePath, DATA_DIR: join(workDir(), 'private-data') };
    for (const args of [['run-jobs', '--now', '2026-09-29T20:05:00Z'], ['run-jobs', '--once'], ['run-jobs', '--once', '--now', '2026-09-29 20:05']]) {
      const result = await start([CLI, ...args], env).done;
      expect(result.code, args.join(' ')).toBe(2);
      expect(result.stderr).toContain('Usage');
    }
    expect(count("SELECT count(*) FROM jobs WHERE state <> 'queued'")).toBe(0);
  });

  it('runs the due PDF job once at the given instant into DATA_DIR', async () => {
    const dataDir = join(workDir(), 'override-data');
    const { revisionId, pdfJobId } = await signedRevision(dataDir);
    const before = ledgerState();
    const env = { NODE_ENV: undefined, DATABASE_PATH: t.config.databasePath, DATA_DIR: dataDir, OUTBOUND_MODE: undefined, MAIL_FROM: undefined };
    const result = await start([CLI, 'run-jobs', '--once', '--now', '2026-09-29T20:05:00Z'], env).done;
    expect(result.code, result.stderr).toBe(0);
    // WP3-T09: the send job is registered too. Claimed before the PDF it waits (pdf_not_ready);
    // claimed after it, the unset MAIL_FROM blocks it with the visible fault sender_missing.
    const summary = JSON.parse(result.stdout) as Record<string, number>;
    expect(summary).toMatchObject({ claimed: 2, succeeded: 1, lost: 0 });
    expect((summary.retried ?? 0) + (summary.intervention ?? 0)).toBe(1);
    expect(t.db.prepare('SELECT state, attempts, updated_at FROM jobs WHERE id = ?').get(pdfJobId)).toEqual({ state: 'succeeded', attempts: 1, updated_at: '2026-09-29T20:05:00Z' });
    const key = t.db
      .prepare("SELECT a.storage_key FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ? AND f.state = 'ready'")
      .pluck()
      .get(revisionId) as string;
    expect(existsSync(join(dataDir, 'files', key))).toBe(true);
    expect(existsSync(join(workDir(), 'private-data', 'files', key))).toBe(false);
    expect(ledgerState()).toMatchObject({ ledger: before.ledger, lines: before.lines, revisions: before.revisions });
    const send = t.db.prepare("SELECT state, last_error FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(revisionId);
    expect([{ state: 'queued', last_error: 'pdf_not_ready' }, { state: 'intervention', last_error: 'sender_missing' }]).toContainEqual(send);
    expect(count("SELECT count(*) FROM delivery_attempts WHERE state = 'accepted'")).toBe(0);
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    expect(result.stdout + result.stderr).not.toMatch(/Example Employee|example\.invalid/);
  });
});

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

async function startServer(env: Record<string, string | undefined>) {
  const port = await freePort();
  const run = start([SERVER], { NODE_ENV: undefined, HOST: '127.0.0.1', PORT: String(port), DATABASE_PATH: t.config.databasePath, STATIC_DIR: undefined, ...env });
  let output = '';
  run.child.stdout?.on('data', (chunk: string) => (output += chunk));
  await waitFor(() => output.includes('Timesheet listening'), 'the server to listen');
  // The server runs on the system clock, so its session is created on the system clock too.
  const session = createAuthSession(t.db, systemClock, t.userIds.employee, 3600);
  return { ...run, base: `http://127.0.0.1:${port}`, cookie: `${SESSION_COOKIE}=${session.token}` };
}

describe('server entry', () => {
  it('passes DATA_DIR to the file store and starts the in-process runner', async () => {
    const dataDir = join(workDir(), 'server-data');
    const { revisionId, signature } = await signedRevision(dataDir);
    const server = await startServer({ DATA_DIR: dataDir, JOB_RUNNER: undefined, OUTBOUND_MODE: undefined, MAIL_FROM: undefined });
    try {
      // The signature route reads from DATA_DIR (the default beside the database is empty).
      const image = await fetch(`${server.base}/api/signatures/${signature.id}`, { headers: { cookie: server.cookie } });
      expect(image.status).toBe(200);
      expect(sha(new Uint8Array(await image.arrayBuffer()))).toBe(signature.sha256);
      // The runner started with the server: heartbeat and the PDF in DATA_DIR.
      await waitFor(() => t.db.prepare('SELECT state FROM revision_files WHERE revision_id = ?').pluck().get(revisionId) === 'ready', 'the PDF job');
      expect(t.db.prepare('SELECT runner_heartbeat_at IS NOT NULL FROM operations_state').pluck().get()).toBe(1);
      const key = t.db.prepare("SELECT storage_key FROM attachments WHERE kind = 'pdf'").pluck().get() as string;
      expect(existsSync(join(dataDir, 'files', key))).toBe(true);
      // WP3-T09: the send job is registered too; without MAIL_FROM it is never sent (it waits or shows sender_missing).
      expect(t.db.prepare("SELECT state FROM jobs WHERE revision_id = ? AND kind = 'send_email'").pluck().get(revisionId)).not.toBe('succeeded');
      expect(count("SELECT count(*) FROM delivery_attempts WHERE state = 'accepted'")).toBe(0);
    } finally {
      server.child.kill();
      await server.done;
    }
  });

  it('does not start the runner when JOB_RUNNER=off', async () => {
    const dataDir = join(workDir(), 'server-data');
    const { pdfJobId } = await signedRevision(dataDir);
    const server = await startServer({ DATA_DIR: dataDir, JOB_RUNNER: 'off' });
    try {
      const health = await fetch(`${server.base}/api/auth/me`, { headers: { cookie: server.cookie } });
      expect(health.status).toBe(200);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      expect(t.db.prepare('SELECT state, attempts FROM jobs WHERE id = ?').get(pdfJobId)).toEqual({ state: 'queued', attempts: 0 });
      expect(t.db.prepare('SELECT runner_heartbeat_at FROM operations_state').pluck().get()).toBeNull();
    } finally {
      server.child.kill();
      await server.done;
    }
  });
});
