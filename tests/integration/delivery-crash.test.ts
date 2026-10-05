import { type ChildProcess, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler } from '../../src/server/jobs/sendJob.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import { createOutboundAdapter } from '../../src/server/mail/outbound.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { makePng } from '../support/pdfText.ts';
import { type SmtpSink, startSmtpSink } from '../support/smtpSink.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T09 crash checks (AC-08, docs/05 "Process/connection lost after possible acceptance"):
 * a runner process is killed while it sends - after the SMTP sink received the whole message
 * but before it answered, and (capture mode) after `sending` was committed. The attempt stays
 * `sending` while the lease is valid, becomes `uncertain` once the lease expired (on the next
 * runner pass or in the decision route), and a restarted runner sends nothing. Only an explicit
 * decision resends, once, as a new attempt. Children start with process.execPath and load the
 * TypeScript sources; their SMTP configuration is an explicit object built inside the child (the
 * child's process environment carries no sending flag). All data is synthetic.
 */

const PAYROLL = '2026-10-02';
const SENDER = 'timesheet@example.invalid';
const SMTP_USER = `synthetic-user-${randomBytes(6).toString('hex')}`;
const SECRET = `synthetic-secret-${randomBytes(12).toString('hex')}`;
const SRC = new URL('../../src/server/', import.meta.url);

let t: TestContext;
let employee: string;
let dataDir: string;
let files: FileStore;
const sinks: SmtpSink[] = [];
const children = new Map<ChildProcess, Promise<unknown>>();

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
});

afterEach(async () => {
  const running = [...children.entries()];
  for (const [child] of running) child.kill();
  await Promise.all(running.map(([, exited]) => exited));
  children.clear();
  await Promise.all(sinks.splice(0).map((sink) => sink.close()));
  t.close();
});

/** A child runner with only the send handler; it may pause before or right after `sending` is committed. */
const CHILD = String.raw`
const src = process.env.T_SRC;
const { writeFileSync } = await import('node:fs');
const { join } = await import('node:path');
const { openDatabase } = await import(new URL('db/database.ts', src).href);
const { FileStore } = await import(new URL('files/fileStore.ts', src).href);
const { runJobsOnce } = await import(new URL('jobs/runner.ts', src).href);
const { createSendJobHandler } = await import(new URL('jobs/sendJob.ts', src).href);
const { createOutboundAdapter } = await import(new URL('mail/outbound.ts', src).href);
const { loadDeliveryConfig } = await import(new URL('config.ts', src).href);
const db = openDatabase(process.env.T_DB);
const clock = { now: () => new Date(process.env.T_NOW) };
const files = new FileStore(process.env.T_DATA);
// An explicit configuration object for this test child only (loopback sink, synthetic credentials).
const env = process.env.T_OUTBOUND === 'smtp'
  ? { OUTBOUND_MODE: 'smtp', PRODUCTION_SENDING_ENABLED: 'true', SMTP_HOST: '127.0.0.1', SMTP_PORT: process.env.T_SMTP_PORT,
      SMTP_SECURITY: 'starttls', SMTP_USER: process.env.T_SMTP_USER, SMTP_PASSWORD: process.env.T_SMTP_PASSWORD,
      MAIL_FROM: process.env.T_SENDER, DATA_DIR: process.env.T_DATA }
  : { MAIL_FROM: process.env.T_SENDER, DATA_DIR: process.env.T_DATA };
const delivery = loadDeliveryConfig(env, { databasePath: process.env.T_DB, port: 3000, production: false });
const ca = Buffer.from(process.env.T_CA ?? '', 'base64').toString('utf8');
const outbound = createOutboundAdapter(delivery.outbound, { dataDir: process.env.T_DATA, smtp: { trustedCa: ca } });
const pause = (point) => {
  if (process.env.T_PAUSE !== point) return;
  writeFileSync(join(process.env.T_MARKS, point), '');
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60000);
  throw new Error('the child was not killed');
};
const hooks = { afterPrepare: () => pause('after-prepare'), beforeSend: () => pause('before-send') };
const handler = createSendJobHandler({ db, clock, files, outbound, senderAddress: delivery.senderAddress, hooks });
const summary = await runJobsOnce({ db, clock, owner: process.env.T_OWNER, leaseSeconds: 60, handlers: { send_email: handler } });
db.close();
process.stdout.write(JSON.stringify(summary));
`;

interface ChildResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

function startChild(env: Record<string, string>): { child: ChildProcess; done: Promise<ChildResult> } {
  const merged: Record<string, string | undefined> = { ...process.env, T_SRC: SRC.href, T_DB: t.config.databasePath, T_DATA: dataDir, T_SENDER: SENDER, ...env };
  const child = spawn(process.execPath, ['--input-type=module', '-e', CHILD], { env: merged, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout?.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk));
  child.stderr?.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
  const done = new Promise<ChildResult>((resolve) => {
    child.on('exit', (code, signal) => {
      children.delete(child);
      setImmediate(() => resolve({ code, signal, stdout, stderr }));
    });
  });
  children.set(child, done);
  return { child, done };
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

async function finalized() {
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie: employee,
    body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: ['manager@example.invalid'], auto_submit: false },
  });
  expect(settings.status, JSON.stringify(settings.body)).toBeLessThan(300);
  const session = await t.request('POST', '/api/days/2026-09-15/sessions', {
    cookie: employee,
    body: { start: la('2026-09-15T09:00'), end: la('2026-09-15T18:00'), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(session.status, JSON.stringify(session.body)).toBe(201);
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
  const signoff = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie: employee,
    body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, signer_name: 'Example Employee', incomplete_evidence_acknowledged: true },
  });
  expect(signoff.status, JSON.stringify(signoff.body)).toBe(201);
  const revisionId = signoff.body.revision.id as string;
  await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
  const sendJobId = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email'").pluck().get(revisionId) as string;
  return { revisionId, sendJobId };
}

function attemptRows(revisionId: string) {
  return t.db.prepare('SELECT id, state, decision, provider_response, message_id FROM delivery_attempts WHERE revision_id = ? ORDER BY started_at, attempt_no').all(revisionId) as Array<{
    id: string;
    state: string;
    decision: string | null;
    provider_response: string | null;
    message_id: string;
  }>;
}

function ledgerState() {
  return { ledger: count('SELECT count(*) FROM ot_ledger'), lines: count('SELECT count(*) FROM revision_ledger_lines'), revisions: count('SELECT count(*) FROM timesheet_revisions') };
}

function smtpRunner(sink: SmtpSink) {
  const config = loadDeliveryConfig(
    {
      OUTBOUND_MODE: 'smtp',
      PRODUCTION_SENDING_ENABLED: 'true',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(sink.port),
      SMTP_SECURITY: 'starttls',
      SMTP_USER,
      SMTP_PASSWORD: SECRET,
      MAIL_FROM: SENDER,
      DATA_DIR: dataDir,
    },
    { databasePath: t.config.databasePath, port: 3000, production: false },
  );
  const outbound = createOutboundAdapter(config.outbound, { dataDir, smtp: { trustedCa: sink.ca } });
  return (owner: string) =>
    runJobsOnce({ db: t.db, clock: t.clock, owner, leaseSeconds: 60, handlers: { send_email: createSendJobHandler({ db: t.db, clock: t.clock, files, outbound, senderAddress: SENDER }) } });
}

describe('a runner process killed during the send', () => {
  it('SMTP: killed after the sink received the message leaves the attempt uncertain; a restart sends nothing', async () => {
    const sink = await startSmtpSink({ behaviour: 'hang_after_data', auth: { user: SMTP_USER, pass: SECRET } });
    sinks.push(sink);
    const { revisionId, sendJobId } = await finalized();
    const before = ledgerState();

    const received = sink.nextMessage();
    const first = startChild({
      T_OUTBOUND: 'smtp',
      T_OWNER: 'runner-crash',
      T_NOW: '2026-09-29T20:05:00Z',
      T_SMTP_PORT: String(sink.port),
      T_SMTP_USER: SMTP_USER,
      T_SMTP_PASSWORD: SECRET,
      T_CA: Buffer.from(sink.ca, 'utf8').toString('base64'),
    });
    await received;
    first.child.kill('SIGKILL');
    const killed = await first.done;
    expect(killed.code === 0).toBe(false);
    expect(killed.stdout + killed.stderr).not.toContain(SECRET);
    expect(sink.messages).toHaveLength(1);
    expect(attemptRows(revisionId).map((row) => row.state)).toEqual(['sending']);
    expect(t.db.prepare('SELECT state, lease_owner, attempts FROM jobs WHERE id = ?').get(sendJobId)).toEqual({ state: 'leased', lease_owner: 'runner-crash', attempts: 1 });

    // While the lease is valid nobody takes the job and the attempt stays `sending`.
    sink.setBehaviour('accept');
    const run = smtpRunner(sink);
    t.clock.set('2026-09-29T20:05:59Z');
    expect(await run('runner-early')).toMatchObject({ claimed: 0 });
    expect(attemptRows(revisionId).map((row) => row.state)).toEqual(['sending']);

    // After the lease expired the restarted runner marks it uncertain and sends nothing.
    t.clock.set('2026-09-29T20:06:00Z');
    expect(await run('runner-restart')).toEqual({ claimed: 1, succeeded: 0, retried: 0, intervention: 1, lost: 0 });
    expect(attemptRows(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['uncertain', 'lease_expired_while_sending']]);
    expect(t.db.prepare('SELECT state, last_error FROM jobs WHERE id = ?').get(sendJobId)).toEqual({ state: 'intervention', last_error: 'delivery_uncertain' });
    t.clock.set('2026-09-29T23:00:00Z');
    expect(await run('runner-later')).toMatchObject({ claimed: 0 });
    expect(sink.transactions).toBe(1);
    expect(sink.messages).toHaveLength(1);

    // One explicit decision resends once, as a new attempt on the same revision.
    const [uncertain] = attemptRows(revisionId);
    const decided = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(decided.status, JSON.stringify(decided.body)).toBe(201);
    expect(await run('runner-resend')).toMatchObject({ claimed: 1, succeeded: 1 });
    const rows = attemptRows(revisionId);
    expect(rows.map((row) => [row.state, row.decision])).toEqual([
      ['uncertain', 'resend'],
      ['accepted', null],
    ]);
    expect(sink.messages).toHaveLength(2);
    expect(sink.messages[1]?.raw.toString('latin1')).toContain(`Message-ID: ${rows[1]?.message_id}`);
    expect(ledgerState()).toEqual(before);
  });

  it('capture: killed before `sending` was committed; the restart reuses the prepared attempt and sends once', async () => {
    const marks = join(dirname(t.config.databasePath), 'marks-prepare');
    mkdirSync(marks);
    const { revisionId, sendJobId } = await finalized();
    const first = startChild({ T_OUTBOUND: 'capture', T_OWNER: 'runner-crash', T_NOW: '2026-09-29T20:05:00Z', T_PAUSE: 'after-prepare', T_MARKS: marks });
    await waitFor(() => existsSync(join(marks, 'after-prepare')), 'the after-prepare pause');
    first.child.kill('SIGKILL');
    expect((await first.done).code === 0).toBe(false);
    const [prepared] = attemptRows(revisionId);
    expect(prepared?.state).toBe('preparing');

    // Nothing was handed to the network, so the reclaimed job sends the same attempt (same Message-ID) once.
    const restarted = await startChild({ T_OUTBOUND: 'capture', T_OWNER: 'runner-restart', T_NOW: '2026-09-29T20:06:00Z' }).done;
    expect(restarted.code, restarted.stderr).toBe(0);
    expect(JSON.parse(restarted.stdout)).toEqual({ claimed: 1, succeeded: 1, retried: 0, intervention: 0, lost: 0 });
    const rows = attemptRows(revisionId);
    expect(rows.map((row) => [row.id, row.state, row.message_id])).toEqual([[prepared?.id, 'accepted', prepared?.message_id]]);
    expect(t.db.prepare('SELECT state, attempts FROM jobs WHERE id = ?').get(sendJobId)).toEqual({ state: 'succeeded', attempts: 2 });
    expect(existsSync(captureFolder(dataDir, prepared?.id ?? ''))).toBe(true);
  });

  it('capture: killed after `sending` was committed; the decision route recovers the expired lease', async () => {
    const marks = join(dirname(t.config.databasePath), 'marks-capture');
    mkdirSync(marks);
    const { revisionId, sendJobId } = await finalized();
    const before = ledgerState();
    const first = startChild({ T_OUTBOUND: 'capture', T_OWNER: 'runner-crash', T_NOW: '2026-09-29T20:05:00Z', T_PAUSE: 'before-send', T_MARKS: marks });
    await waitFor(() => existsSync(join(marks, 'before-send')), 'the before-send pause');
    first.child.kill('SIGKILL');
    expect((await first.done).code === 0).toBe(false);
    const [sending] = attemptRows(revisionId);
    expect(sending?.state).toBe('sending');
    expect(existsSync(captureFolder(dataDir, sending?.id ?? ''))).toBe(false);

    // Before the lease expires a decision is refused (the attempt is not uncertain yet).
    t.clock.set('2026-09-29T20:05:30Z');
    const early = await t.request('POST', `/api/deliveries/${sending?.id}/decision`, { cookie: employee, body: { decision: 'mark_delivered' } });
    expect(early.status).toBe(409);
    expect(early.body.error).toMatchObject({ code: 'delivery_not_uncertain', details: { state: 'sending' } });

    // After it expired, the route itself records the uncertain outcome and the owner's decision.
    t.clock.set('2026-09-29T20:06:00Z');
    const decided = await t.request('POST', `/api/deliveries/${sending?.id}/decision`, { cookie: employee, body: { decision: 'mark_delivered' } });
    expect(decided.status, JSON.stringify(decided.body)).toBe(200);
    expect(decided.body.attempt).toMatchObject({ state: 'uncertain', provider_response: 'lease_expired_while_sending', decision: 'mark_delivered' });
    expect(t.db.prepare('SELECT state, last_error FROM jobs WHERE id = ?').get(sendJobId)).toEqual({ state: 'intervention', last_error: 'delivery_uncertain' });

    // A restarted runner sends nothing.
    const restarted = await startChild({ T_OUTBOUND: 'capture', T_OWNER: 'runner-restart', T_NOW: '2026-09-29T21:00:00Z' }).done;
    expect(restarted.code, restarted.stderr).toBe(0);
    expect(JSON.parse(restarted.stdout)).toMatchObject({ claimed: 0 });
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    expect(attemptRows(revisionId)).toHaveLength(1);
    expect(ledgerState()).toEqual(before);
  });
});
