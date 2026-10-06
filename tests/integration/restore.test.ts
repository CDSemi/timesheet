import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { createAuthSession, SESSION_COOKIE } from '../../src/server/auth/sessions.ts';
import type { Clock } from '../../src/server/clock.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate } from '../../src/server/db/migrations.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { claimNextJob, enqueueJob, getOutboundPause, type Job, OUTBOUND_JOB_KINDS } from '../../src/server/jobs/jobStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { JOB_SEND_REMINDER } from '../../src/server/jobs/reminderJob.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler, JOB_SEND_EMAIL } from '../../src/server/jobs/sendJob.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import { createOutboundAdapter } from '../../src/server/mail/outbound.ts';
import { createBackup } from '../../src/server/ops/backup.ts';
import { MANIFEST_FILE_NAME } from '../../src/server/ops/manifest.ts';
import {
  dropHeldReminder,
  listHeldJobs,
  RECONCILE_AFTER_RESTORE,
  releaseAllHeldJobs,
  releaseHeldJob,
  RESTORED_DATA_DIR,
  RESTORED_DATABASE_NAME,
  RestoreError,
  type RestoreResult,
  restoreBackup,
  restoreSummaryJson,
  resumeOutbound,
} from '../../src/server/ops/restore.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { setAutomationActivation } from '../../src/server/services/automation.ts';
import { getBalance } from '../../src/server/services/ledger.ts';
import { getOutboundStatus, outboundStatusJson } from '../../src/server/services/operationsStatus.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { makePng } from '../support/pdfText.ts';
import { buildSchemaV6, type SchemaV6Fixture, WP3_SCHEMA_VERSION } from '../support/schemaV6.ts';
import { createTestContext, la, LA, MutableClock, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T06: outbound pause, isolated restore and reconciliation (AC-15, AC-11, AC-08; docs/07 "Backup, restore and
 * upgrades": restore into an isolated directory with sending paused, reconcile pending/uncertain jobs before enabling
 * delivery, never resend accepted mail automatically).
 *
 * The source instance holds, at the moment of its backup: a send job leased by a runner that is inside the network call
 * (attempt `sending`), a send job leased by a runner that prepared its attempt (`preparing`), a queued send job of a
 * revision whose PDF is ready, a revision whose PDF job has not run yet, a leased and a queued reminder job, and the
 * automation activation. The backup is restored into an empty directory and the restored copy is checked: verified
 * hashes, balances and revision counts equal to the source, outbound paused (`restored`), every interrupted send marked
 * for explicit reconciliation, and a runner pass that renders PDFs and runs the scans but claims no send job, spends no
 * attempt and captures nothing. Resume is refused while an attempt awaits its decision; one explicit decision resends
 * exactly once after the resume. All data is synthetic; directories are temporary.
 */

const NOW = '2026-09-29T20:00:00Z';
const LATER = '2026-09-29T21:00:00Z';
const SENDER = 'timesheet@example.invalid';
const LATEST = MIGRATIONS.length;
const repo = fileURLToPath(new URL('../..', import.meta.url));

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const scratch = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));
const dataDirOf = (t: TestContext): string => join(dirname(t.config.databasePath), 'private-data');

function count(db: Db, sql: string, ...params: string[]): number {
  return Number(db.prepare(sql).pluck().get(...params));
}

function captureRunner(db: Db, clock: Clock, dataDir: string) {
  const delivery = loadDeliveryConfig({ MAIL_FROM: SENDER, DATA_DIR: dataDir }, { databasePath: join(dataDir, '..', 'unused.db'), port: 3000, production: false });
  return (owner: string) => runJobsOnce({ db, clock, owner, leaseSeconds: 600, handlers: createJobHandlers({ db, clock, files: new FileStore(dataDir), delivery }) });
}

interface JobRow {
  id: string;
  kind: string;
  state: string;
  attempts: number;
  last_error: string | null;
}

const jobsOf = (db: Db): JobRow[] => db.prepare<[], JobRow>('SELECT id, kind, state, attempts, last_error FROM jobs ORDER BY created_at, id').all();
const sendJobs = (db: Db): JobRow[] => jobsOf(db).filter((job) => OUTBOUND_JOB_KINDS.includes(job.kind));
const attemptsOf = (db: Db) =>
  db
    .prepare<[], { id: string; revision_id: string; state: string; decision: string | null; provider_response: string | null }>(
      'SELECT id, revision_id, state, decision, provider_response FROM delivery_attempts ORDER BY started_at, revision_id, attempt_no',
    )
    .all();

/** Per-user balances and revision counts: what the restored copy must equal. */
function businessState(db: Db) {
  const users = db.prepare<[], { id: string }>('SELECT id FROM users ORDER BY id').all();
  return {
    balances: users.map((user) => ({ user: user.id, balance: getBalance(db, user.id) })),
    revisions: db.prepare('SELECT user_id, count(*) AS revisions FROM timesheet_revisions GROUP BY user_id ORDER BY user_id').all(),
    ledger: db.prepare('SELECT id, user_id, delta_minutes FROM ot_ledger ORDER BY rowid').all(),
    signoffs: count(db, 'SELECT count(*) FROM signoffs'),
    attachments: db.prepare('SELECT storage_key, sha256, size_bytes FROM attachments ORDER BY storage_key').all(),
  };
}

/* ------------------------------------------------------------------------------------- source instance ---- */

interface Source {
  t: TestContext;
  employee: string;
  revisions: { sending: string; preparing: string; queued: string; pdfPending: string };
  backupDir: string;
  backupsRoot: string;
}

async function addSession(t: TestContext, cookie: string, date: string, from: string, to: string): Promise<void> {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie,
    body: {
      start: la(`${date}T${from}`),
      end: la(`${date}T${to}`),
      input_zone: LA,
      breaks: [],
      breaks_confirmed: true,
      // Days before the current period (2026-09-14 onwards) are old periods: an edit needs a reason.
      ...(date < '2026-09-14' ? { reason: 'Synthetic late entry for the restore test' } : {}),
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

async function signOff(t: TestContext, cookie: string, payrollDate: string): Promise<string> {
  const review = await t.request('GET', `/api/timesheets/${payrollDate}/review`, { cookie });
  expect(review.status, JSON.stringify(review.body)).toBe(200);
  const response = await t.request('POST', `/api/timesheets/${payrollDate}/signoff`, {
    cookie,
    body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, signer_name: 'Example Employee', incomplete_evidence_acknowledged: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.revision.id as string;
}

class SimulatedCrash extends Error {}

/** Claims the next due send job as a source runner and runs the send handler until the crash point. */
async function crashDuringSend(t: TestContext, files: FileStore, point: 'afterPrepare' | 'beforeSend'): Promise<Job> {
  const job = claimNextJob(t.db, t.clock, { owner: `runner-source-${point.toLowerCase()}`, kinds: [JOB_SEND_EMAIL], leaseSeconds: 600 });
  if (job === null) throw new Error('no send job due');
  const outbound = createOutboundAdapter({ mode: 'capture' }, { dataDir: dataDirOf(t) });
  const crash = () => {
    throw new SimulatedCrash(point);
  };
  const handler = createSendJobHandler({ db: t.db, clock: t.clock, files, outbound, senderAddress: SENDER, hooks: { [point]: crash } });
  await expect(handler({ job, renewLease: () => true })).rejects.toBeInstanceOf(SimulatedCrash);
  return job;
}

async function buildSource(): Promise<Source> {
  const t = await createTestContext(NOW);
  const employee = await t.login('employee');
  const files = new FileStore(dataDirOf(t));
  const pdfPass = () => runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-source-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie: employee,
    body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: ['manager@example.invalid'], auto_submit: false },
  });
  expect(settings.status, JSON.stringify(settings.body)).toBeLessThan(300);
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');

  // 1. A runner died inside the network call: attempt `sending`, job leased.
  await addSession(t, employee, '2026-09-15', '09:00', '18:30');
  const sending = await signOff(t, employee, '2026-10-02');
  await pdfPass();
  await crashDuringSend(t, files, 'beforeSend');
  // 2. A runner died after preparing its attempt: attempt `preparing`, job leased.
  t.clock.set('2026-09-29T20:01:00Z');
  await addSession(t, employee, '2026-09-02', '09:00', '19:00');
  const preparing = await signOff(t, employee, '2026-09-18');
  await pdfPass();
  await crashDuringSend(t, files, 'afterPrepare');
  // 3. A queued send whose PDF is ready.
  t.clock.set('2026-09-29T20:02:00Z');
  await addSession(t, employee, '2026-08-19', '08:30', '18:00');
  const queued = await signOff(t, employee, '2026-09-04');
  await pdfPass();
  // 4. A finalized revision whose PDF job has not run yet.
  t.clock.set('2026-09-29T20:03:00Z');
  await addSession(t, employee, '2026-08-05', '09:00', '18:00');
  const pdfPending = await signOff(t, employee, '2026-08-21');
  // 5. Reminders: one leased by the dead runner, one queued.
  enqueueJob(t.db, t.clock, { kind: JOB_SEND_REMINDER, businessKey: 'synthetic:reminder:leased', userId: t.userIds.employee });
  enqueueJob(t.db, t.clock, { kind: JOB_SEND_REMINDER, businessKey: 'synthetic:reminder:queued', userId: t.userIds.employee, runAt: '2026-09-29T20:03:30Z' });
  expect(claimNextJob(t.db, t.clock, { owner: 'runner-source-reminder', kinds: [JOB_SEND_REMINDER], leaseSeconds: 600 })?.businessKey).toBe('synthetic:reminder:leased');
  // 6. Automation is active in the source (the restored scans run, but must not send).
  setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-09-29T20:03:00Z', reason: 'Synthetic pilot activation' });

  // The source's own state at the backup: what a runner left behind when the host stopped.
  expect(attemptsOf(t.db).map((attempt) => [attempt.revision_id, attempt.state])).toEqual([
    [sending, 'sending'],
    [preparing, 'preparing'],
  ]);
  expect(existsSync(join(dataDirOf(t), 'mail-capture'))).toBe(false);

  t.clock.set('2026-09-29T20:04:00Z');
  const backupsRoot = scratch('timesheet-t06-backups-');
  const backup = await createBackup({ databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: backupsRoot, clock: t.clock });
  return { t, employee, revisions: { sending, preparing, queued, pdfPending }, backupDir: backup.directory, backupsRoot };
}

function restoreRequest(source: Source, toDir: string, overrides: { fromDir?: string; clock?: Clock } = {}) {
  return {
    fromDir: overrides.fromDir ?? source.backupDir,
    toDir,
    liveDataDir: dataDirOf(source.t),
    liveDatabasePath: source.t.config.databasePath,
    clock: overrides.clock ?? new MutableClock(LATER),
  };
}

/* ---------------------------------------------------------------------------------------------- tests ---- */

describe('isolated restore with outbound paused (AC-15, AC-11)', () => {
  let source: Source;
  let target: string;
  let result: RestoreResult;
  let restored: Db;
  let listing: string[];
  const clock = new MutableClock(LATER);

  beforeAll(async () => {
    source = await buildSource();
    target = join(scratch('timesheet-t06-restore-'), 'instance');
    result = await restoreBackup(restoreRequest(source, target, { clock }));
    // Before this test opens it: a single closed database file (no -wal or -shm left behind) and the data directory.
    listing = readdirSync(target).sort();
    restored = openDatabase(join(target, RESTORED_DATABASE_NAME));
  });

  afterAll(() => {
    restored.close();
    source.t.close();
    rmSync(dirname(target), { recursive: true, force: true });
    rmSync(source.backupsRoot, { recursive: true, force: true });
  });

  it('copies the verified database and files into the empty target only', () => {
    expect(listing).toEqual([RESTORED_DATABASE_NAME, RESTORED_DATA_DIR].sort());
    expect(readdirSync(join(target, RESTORED_DATA_DIR))).toEqual(['files']);
    const manifest = JSON.parse(readFileSync(join(source.backupDir, MANIFEST_FILE_NAME), 'utf8')) as { files: Array<{ storage_key: string; sha256: string }> };
    expect(readdirSync(join(target, RESTORED_DATA_DIR, 'files')).sort()).toEqual(manifest.files.map((file) => file.storage_key).sort());
    for (const file of manifest.files) expect(sha256(readFileSync(join(target, RESTORED_DATA_DIR, 'files', file.storage_key)))).toBe(file.sha256);
    expect(restored.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(restored.pragma('foreign_key_check')).toEqual([]);
    expect(restored.prepare('SELECT max(version) FROM schema_migrations').pluck().get()).toBe(LATEST);
    // The live data directory gained nothing: its files are exactly the source's attachments, and nothing was captured.
    expect(readdirSync(join(dataDirOf(source.t), 'files')).sort()).toEqual(manifest.files.map((file) => file.storage_key).sort());
    expect(existsSync(join(dataDirOf(source.t), 'mail-capture'))).toBe(false);
  });

  it('keeps balances and revision counts equal to the source', () => {
    expect(businessState(restored)).toEqual(businessState(source.t.db));
    expect(count(restored, 'SELECT count(*) FROM timesheet_revisions')).toBe(4);
    // Non-trivial: the four sign-offs posted OT credits, so the compared balance is not zero.
    expect(count(restored, 'SELECT count(*) FROM ot_ledger')).toBeGreaterThan(0);
    expect(getBalance(restored, source.t.userIds.employee).postedMinutes).toBeGreaterThan(0);
  });

  it('pauses outbound delivery with reason restored, marks every interrupted send for an explicit decision and holds every backed-up send job', () => {
    expect(getOutboundPause(restored)).toEqual({ pausedAt: LATER, reason: 'restored' });
    const attempts = attemptsOf(restored);
    expect(attempts.map((attempt) => [attempt.revision_id, attempt.state, attempt.decision, attempt.provider_response])).toEqual([
      [source.revisions.sending, 'uncertain', null, RECONCILE_AFTER_RESTORE],
      [source.revisions.preparing, 'uncertain', null, RECONCILE_AFTER_RESTORE],
    ]);
    const sends = Object.fromEntries(
      restored
        .prepare<[], { revision_id: string | null; business_key: string; state: string; attempts: number; last_error: string | null }>(
          "SELECT revision_id, business_key, state, attempts, last_error FROM jobs WHERE kind IN ('send_email', 'send_reminder')",
        )
        .all()
        .map((job) => [job.revision_id ?? job.business_key, { state: job.state, attempts: job.attempts, last_error: job.last_error }]),
    );
    expect(sends).toEqual({
      [source.revisions.sending]: { state: 'intervention', attempts: 1, last_error: RECONCILE_AFTER_RESTORE },
      [source.revisions.preparing]: { state: 'intervention', attempts: 1, last_error: RECONCILE_AFTER_RESTORE },
      // Attempt 2 (coordinator decision): queued jobs of the backup are held too; the source may have sent them after the snapshot.
      [source.revisions.queued]: { state: 'intervention', attempts: 0, last_error: RECONCILE_AFTER_RESTORE },
      [source.revisions.pdfPending]: { state: 'intervention', attempts: 0, last_error: RECONCILE_AFTER_RESTORE },
      'synthetic:reminder:leased': { state: 'intervention', attempts: 1, last_error: RECONCILE_AFTER_RESTORE },
      'synthetic:reminder:queued': { state: 'intervention', attempts: 0, last_error: RECONCILE_AFTER_RESTORE },
    });
    expect(outboundStatusJson(getOutboundStatus(restored))).toEqual({
      paused: true,
      paused_at: LATER,
      reason: 'restored',
      awaiting_decision: 2,
      queued_send_jobs: 0,
      held_send_jobs: 6,
    });
    // The source itself is untouched by the restore.
    expect(getOutboundPause(source.t.db)).toBeNull();
    expect(attemptsOf(source.t.db).map((attempt) => attempt.state)).toEqual(['sending', 'preparing']);
  });

  it('reports counts and the manifest check only', () => {
    const summary = restoreSummaryJson(result);
    const attachments = count(source.t.db, 'SELECT count(*) FROM attachments');
    expect(attachments).toBeGreaterThanOrEqual(4);
    expect(summary).toEqual({
      outcome: 'restored',
      manifest: { verified: true, schema_version: LATEST, files: attachments, signatures: attachments - 3, pdfs: 3, database_bytes: expect.any(Number) },
      schema: { backup: LATEST, restored: LATEST, applied: [] },
      outbound: { paused: true, reason: 'restored' },
      reconciliation: { attempts_marked_uncertain: 2, send_jobs_held: 6, queued_send_jobs: 0, awaiting_decision: 2 },
      counts: { users: 2, revisions: 4, ledger_entries: count(source.t.db, 'SELECT count(*) FROM ot_ledger'), attachments },
    });
    const text = JSON.stringify(summary);
    for (const value of [source.t.emails.employee, source.t.emails.admin, '@', target, source.backupDir, 'Example']) expect(text.includes(value), value).toBe(false);
  });

  it('a runner pass while paused renders the pending PDF and runs the scans, but claims no send job, spends no attempt and sends nothing', async () => {
    const sendsBefore = sendJobs(restored);
    const attemptsBefore = attemptsOf(restored);
    const summary = await captureRunner(restored, clock, join(target, RESTORED_DATA_DIR))('runner-restored');
    expect(summary.lost).toBe(0);
    const jobs = jobsOf(restored);
    expect(jobs.filter((job) => job.kind === 'render_pdf').every((job) => job.state === 'succeeded')).toBe(true);
    expect(restored.prepare("SELECT state FROM revision_files WHERE revision_id = ? AND kind = 'pdf'").pluck().get(source.revisions.pdfPending)).toBe('ready');
    expect(jobs.filter((job) => job.kind === 'deadline_scan' || job.kind === 'reminder_scan').map((job) => job.state)).toContain('succeeded');
    // Every send job keeps its state and attempt counter; reminders a scan decided now wait queued, unclaimed.
    const sendsAfter = sendJobs(restored);
    expect(sendsAfter.filter((job) => sendsBefore.some((before) => before.id === job.id))).toEqual(sendsBefore);
    expect(sendsAfter.filter((job) => !sendsBefore.some((before) => before.id === job.id)).every((job) => job.state === 'queued' && job.attempts === 0)).toBe(true);
    expect(attemptsOf(restored)).toEqual(attemptsBefore);
    expect(existsSync(join(target, RESTORED_DATA_DIR, 'mail-capture'))).toBe(false);
    // A second pass much later changes nothing either.
    clock.set('2026-09-30T09:00:00Z');
    await captureRunner(restored, clock, join(target, RESTORED_DATA_DIR))('runner-restored-2');
    expect(sendJobs(restored).filter((job) => sendsBefore.some((before) => before.id === job.id))).toEqual(sendsBefore);
    expect(existsSync(join(target, RESTORED_DATA_DIR, 'mail-capture'))).toBe(false);
  });

  it('refuses to resume while attempts await a decision; one explicit decision each, then resume; a resend goes out exactly once (AC-08)', async () => {
    const refused = resumeOutbound(restored, clock);
    expect(refused).toMatchObject({ outcome: 'refused', awaitingDecision: 2 });
    expect(getOutboundPause(restored)).not.toBeNull();
    expect(count(restored, "SELECT count(*) FROM audit_events WHERE operation = 'operations.outbound_resume'")).toBe(0);

    // The owner decides through the restored instance's own API (her session row was restored too).
    const app = createApp({ db: restored, clock, config: source.t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
    const session = createAuthSession(restored, clock, source.t.userIds.employee, 3600);
    const decide = async (attemptId: string, decision: 'mark_delivered' | 'resend') => {
      const response = await app.request(`/api/deliveries/${attemptId}/decision`, {
        method: 'POST',
        headers: { origin: 'http://localhost:3000', cookie: `${SESSION_COOKIE}=${session.token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      return { status: response.status, body: (await response.json()) as Record<string, unknown> };
    };
    const [sendingAttempt, preparingAttempt] = attemptsOf(restored);
    expect((await decide(sendingAttempt?.id ?? '', 'mark_delivered')).status).toBe(200);
    expect(resumeOutbound(restored, clock)).toMatchObject({ outcome: 'refused', awaitingDecision: 1 });
    expect((await decide(preparingAttempt?.id ?? '', 'resend')).status).toBe(201);

    // Still paused: the new resend attempt waits, nothing is claimed.
    const runner = captureRunner(restored, clock, join(target, RESTORED_DATA_DIR));
    await runner('runner-before-resume');
    expect(restored.prepare("SELECT state, attempts FROM jobs WHERE revision_id = ? AND business_key LIKE '%:resend:%'").get(source.revisions.preparing)).toEqual({ state: 'queued', attempts: 0 });
    expect(existsSync(join(target, RESTORED_DATA_DIR, 'mail-capture'))).toBe(false);

    clock.set('2026-09-30T10:00:00Z');
    const resumed = resumeOutbound(restored, clock);
    expect(resumed).toMatchObject({ outcome: 'resumed', awaitingDecision: 0 });
    expect(getOutboundPause(restored)).toBeNull();
    const audit = restored
      .prepare<[], { actor_user_id: string | null; owner_user_id: string | null; entity_type: string; before_json: string; after_json: string }>(
        "SELECT actor_user_id, owner_user_id, entity_type, before_json, after_json FROM audit_events WHERE operation = 'operations.outbound_resume'",
      )
      .all();
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor_user_id: null, owner_user_id: null, entity_type: 'operations_state' });
    expect(JSON.parse(audit[0]?.before_json ?? 'null')).toEqual({ outbound_paused_at: LATER, outbound_paused_reason: 'restored' });
    expect(JSON.parse(audit[0]?.after_json ?? 'null')).toMatchObject({ outbound_paused_at: null, outbound_paused_reason: null });

    // After the resume: only the explicit resend (a job created after the restore) goes out. Nothing from the backup is
    // sent automatically (attempt 2): the queued sends of the backup stay held, and the decided attempts are never resent.
    await runner('runner-after-resume');
    await runner('runner-after-resume-2');
    const byRevision = (revisionId: string) =>
      attemptsOf(restored)
        .filter((attempt) => attempt.revision_id === revisionId)
        .map((attempt) => [attempt.state, attempt.decision]);
    expect(byRevision(source.revisions.sending)).toEqual([['uncertain', 'treat_as_accepted']]);
    expect(byRevision(source.revisions.preparing)).toEqual([
      ['uncertain', 'resend'],
      ['accepted', null],
    ]);
    expect(byRevision(source.revisions.queued)).toEqual([]);
    expect(byRevision(source.revisions.pdfPending)).toEqual([]);
    const heldIds = (kind: string) =>
      restored
        .prepare<[string, string, string], { id: string }>('SELECT id FROM jobs WHERE kind = ? AND state = ? AND last_error = ? ORDER BY business_key')
        .all(kind, 'intervention', RECONCILE_AFTER_RESTORE)
        .map((row) => row.id);
    expect(heldIds(JOB_SEND_EMAIL)).toHaveLength(4);
    expect(heldIds(JOB_SEND_REMINDER)).toHaveLength(2);
    expect(resumeOutbound(restored, clock)).toMatchObject({ outcome: 'not_paused' });
  });

  it('releases a held send only by an explicit, audited operator step; it goes out exactly once; a dropped reminder never runs', async () => {
    const jobOf = (revisionId: string) =>
      restored.prepare<[string], { id: string }>("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email' ORDER BY created_at, business_key LIMIT 1").get(revisionId)?.id ?? '';
    const reminderOf = (key: string) => restored.prepare<[string], { id: string }>('SELECT id FROM jobs WHERE business_key = ?').get(key)?.id ?? '';
    const listed = listHeldJobs(restored);
    expect(listed.map((job) => `${job.kind}:${job.blocker ?? 'releasable'}`).sort()).toEqual(
      [
        `${JOB_SEND_EMAIL}:attempt_uncertain`,
        `${JOB_SEND_EMAIL}:attempt_uncertain`,
        `${JOB_SEND_EMAIL}:releasable`,
        `${JOB_SEND_EMAIL}:releasable`,
        `${JOB_SEND_REMINDER}:releasable`,
        `${JOB_SEND_REMINDER}:releasable`,
      ].sort(),
    );

    // AC-08: a job whose attempt is uncertain is never released; its attempt takes the owner's decision instead.
    expect(releaseHeldJob(restored, clock, jobOf(source.revisions.sending))).toEqual({ outcome: 'refused', code: 'attempt_uncertain' });
    expect(releaseHeldJob(restored, clock, jobOf(source.revisions.preparing))).toEqual({ outcome: 'refused', code: 'attempt_uncertain' });
    expect(releaseHeldJob(restored, clock, 'no-such-job')).toEqual({ outcome: 'refused', code: 'not_held' });

    // One release by id: the send goes out exactly once, however many passes run.
    clock.set('2026-09-30T11:00:00Z');
    const queuedJob = jobOf(source.revisions.queued);
    expect(releaseHeldJob(restored, clock, queuedJob)).toEqual({ outcome: 'released' });
    expect(releaseHeldJob(restored, clock, queuedJob)).toEqual({ outcome: 'refused', code: 'not_held' });
    const sentReminders: string[] = [];
    const delivery = loadDeliveryConfig({ MAIL_FROM: SENDER, DATA_DIR: join(target, RESTORED_DATA_DIR) }, { databasePath: join(target, 'unused.db'), port: 3000, production: false });
    const handlers = {
      ...createJobHandlers({ db: restored, clock, files: new FileStore(join(target, RESTORED_DATA_DIR)), delivery }),
      // Records which reminder job reached the send step (the synthetic reminders carry no occurrence of their own).
      [JOB_SEND_REMINDER]: ({ job }: { job: Job }) => {
        sentReminders.push(job.id);
        return Promise.resolve();
      },
    };
    const pass = (owner: string) => runJobsOnce({ db: restored, clock, owner, leaseSeconds: 600, handlers });
    await pass('runner-release-1');
    await pass('runner-release-2');
    const states = (revisionId: string) =>
      attemptsOf(restored)
        .filter((attempt) => attempt.revision_id === revisionId)
        .map((attempt) => attempt.state);
    expect(states(source.revisions.queued)).toEqual(['accepted']);
    expect(states(source.revisions.pdfPending)).toEqual([]);
    expect(sentReminders).toEqual([]);

    // The owner repeats a held send herself (a job created after the restore): the held job is then never released, so
    // the same revision is not sent twice.
    const app = createApp({ db: restored, clock, config: source.t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
    const session = createAuthSession(restored, clock, source.t.userIds.employee, 3600);
    const resend = await app.request(`/api/revisions/${source.revisions.pdfPending}/resend`, {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', cookie: `${SESSION_COOKIE}=${session.token}`, 'content-type': 'application/json' },
      body: '{}',
    });
    expect(resend.status).toBe(201);
    const heldPdfPending = jobOf(source.revisions.pdfPending);
    expect(releaseHeldJob(restored, clock, heldPdfPending)).toEqual({ outcome: 'refused', code: 'delivery_attempt_open' });
    await pass('runner-owner-resend');
    expect(states(source.revisions.pdfPending)).toEqual(['accepted']);
    expect(releaseHeldJob(restored, clock, heldPdfPending)).toEqual({ outcome: 'refused', code: 'superseded_by_later_send' });

    // A held reminder may be dropped instead (it never runs); a send job cannot be dropped.
    const droppedReminder = reminderOf('synthetic:reminder:queued');
    expect(dropHeldReminder(restored, clock, jobOf(source.revisions.pdfPending))).toEqual({ outcome: 'refused', code: 'not_a_reminder' });
    expect(dropHeldReminder(restored, clock, droppedReminder)).toEqual({ outcome: 'dropped' });
    expect(dropHeldReminder(restored, clock, droppedReminder)).toEqual({ outcome: 'refused', code: 'not_held' });
    expect(restored.prepare('SELECT state, last_error FROM jobs WHERE id = ?').get(droppedReminder)).toEqual({ state: 'cancelled', last_error: 'dropped_after_restore' });

    // Bulk release of what remains releasable; the jobs of uncertain attempts and the repeated send stay held.
    expect(releaseAllHeldJobs(restored, clock)).toEqual({ released: 1, refused: { attempt_uncertain: 2, superseded_by_later_send: 1 } });
    await pass('runner-release-3');
    await pass('runner-release-4');
    expect(states(source.revisions.pdfPending)).toEqual(['accepted']);
    expect(states(source.revisions.queued)).toEqual(['accepted']);
    expect(sentReminders).toEqual([reminderOf('synthetic:reminder:leased')]);
    expect(sentReminders).not.toContain(droppedReminder);

    // Every step is audited as an operator (system) event with no actor and no personal value.
    const audits = restored
      .prepare<[], { operation: string; actor_user_id: string | null; entity_type: string; entity_id: string; after_json: string }>(
        "SELECT operation, actor_user_id, entity_type, entity_id, after_json FROM audit_events WHERE operation LIKE 'operations.held_job_%' ORDER BY rowid",
      )
      .all();
    expect(audits.map((row) => [row.operation, row.entity_id])).toEqual([
      ['operations.held_job_release', queuedJob],
      ['operations.held_job_drop', droppedReminder],
      ['operations.held_job_release', reminderOf('synthetic:reminder:leased')],
    ]);
    for (const row of audits) {
      expect(row).toMatchObject({ actor_user_id: null, entity_type: 'job' });
      expect(row.after_json.includes('@')).toBe(false);
    }
    // Exactly three accepted attempts were captured (the two owner resends and the released send); the uncertain ones never were.
    const accepted = attemptsOf(restored).filter((attempt) => attempt.state === 'accepted');
    expect(accepted).toHaveLength(3);
    const captured = readdirSync(join(target, RESTORED_DATA_DIR, 'mail-capture')).sort();
    expect(captured.filter((name) => attemptsOf(restored).some((attempt) => attempt.id === name)).sort()).toEqual(accepted.map((attempt) => attempt.id).sort());
    for (const attempt of accepted) expect(existsSync(captureFolder(join(target, RESTORED_DATA_DIR), attempt.id))).toBe(true);
    expect(listHeldJobs(restored).map((job) => job.blocker).sort()).toEqual(['attempt_uncertain', 'attempt_uncertain', 'superseded_by_later_send']);
  });
});

describe('restore refusals', () => {
  let t: TestContext;
  let backupsRoot: string;
  let backupDir: string;
  let work: string;

  beforeAll(async () => {
    t = await createTestContext(NOW);
    saveSignature(t.db, t.clock, new FileStore(dataDirOf(t)), t.userIds.employee, makePng(30, 8), 'image/png');
    backupsRoot = scratch('timesheet-t06-backups-');
    backupDir = (await createBackup({ databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: backupsRoot, clock: t.clock })).directory;
    work = scratch('timesheet-t06-refusals-');
  });

  afterAll(() => {
    t.close();
    rmSync(backupsRoot, { recursive: true, force: true });
    rmSync(work, { recursive: true, force: true });
  });

  const request = (fromDir: string, toDir: string) => ({ fromDir, toDir, liveDataDir: dataDirOf(t), liveDatabasePath: t.config.databasePath, clock: t.clock });

  async function refusal(fromDir: string, toDir: string): Promise<RestoreError> {
    const error = await restoreBackup(request(fromDir, toDir)).then(
      () => null,
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(RestoreError);
    return error as RestoreError;
  }

  /** A tampered copy of the backup folder (the original stays intact). */
  function tamperedCopy(name: string, change: (folder: string) => void): string {
    const folder = join(work, name);
    cpSync(backupDir, folder, { recursive: true });
    change(folder);
    return folder;
  }

  function flipLastByte(path: string): void {
    const bytes = readFileSync(path);
    bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
    writeFileSync(path, bytes);
  }

  it('refuses a file whose bytes do not match the manifest and leaves the target empty', async () => {
    const folder = tamperedCopy('file-hash', (copy) => {
      const [key] = readdirSync(join(copy, 'files'));
      flipLastByte(join(copy, 'files', key ?? ''));
    });
    const to = join(work, 'target-file-hash');
    mkdirSync(to);
    expect((await refusal(folder, to)).code).toBe('file_hash_mismatch');
    expect(readdirSync(to)).toEqual([]);
  });

  it('refuses a database copy that does not match the manifest', async () => {
    const folder = tamperedCopy('db-hash', (copy) => flipLastByte(join(copy, 'timesheet.db')));
    const to = join(work, 'target-db-hash');
    expect((await refusal(folder, to)).code).toBe('database_hash_mismatch');
    expect(existsSync(to) ? readdirSync(to) : []).toEqual([]);
  });

  it('refuses a manifest with an unknown key or a missing file', async () => {
    const extra = tamperedCopy('manifest-extra', (copy) => {
      const manifest = JSON.parse(readFileSync(join(copy, MANIFEST_FILE_NAME), 'utf8')) as Record<string, unknown>;
      writeFileSync(join(copy, MANIFEST_FILE_NAME), JSON.stringify({ ...manifest, owner_email: 'someone@example.invalid' }));
    });
    expect((await refusal(extra, join(work, 'target-extra'))).code).toBe('manifest_invalid');
    const missing = tamperedCopy('file-missing', (copy) => {
      const [key] = readdirSync(join(copy, 'files'));
      rmSync(join(copy, 'files', key ?? ''));
    });
    expect((await refusal(missing, join(work, 'target-missing'))).code).toBe('file_missing');
  });

  it('refuses a backup of a newer schema than this application', async () => {
    const newer = await createTestContext(NOW);
    try {
      newer.db.prepare("INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, 'future', 'x', ?)").run(LATEST + 1, NOW);
      const root = join(work, 'newer-backups');
      const backup = await createBackup({ databasePath: newer.config.databasePath, dataDir: dataDirOf(newer), targetDir: root, clock: newer.clock });
      expect(backup.manifest.schema_version).toBe(LATEST + 1);
      const to = join(work, 'target-newer');
      expect((await refusal(backup.directory, to)).code).toBe('schema_newer');
      expect(existsSync(to) ? readdirSync(to) : []).toEqual([]);
    } finally {
      newer.close();
    }
  });

  it('refuses a non-empty target and a target inside the live data directory, writing nothing', async () => {
    const busy = join(work, 'target-busy');
    mkdirSync(busy);
    writeFileSync(join(busy, 'keep.txt'), 'synthetic');
    expect((await refusal(backupDir, busy)).code).toBe('target_not_empty');
    expect(readdirSync(busy)).toEqual(['keep.txt']);
    expect(readFileSync(join(busy, 'keep.txt'), 'utf8')).toBe('synthetic');

    for (const inside of [dataDirOf(t), join(dataDirOf(t), 'restore')]) {
      expect((await refusal(backupDir, inside)).code).toBe('target_inside_data_dir');
    }
    expect(existsSync(join(dataDirOf(t), 'restore'))).toBe(false);
    // The live database's own directory is never a restore target either.
    expect((await refusal(backupDir, dirname(t.config.databasePath))).code).toMatch(/^target_(?:not_empty|is_live)$/);
  });
});

describe('restore of a version 9 backup (upgrade on restore)', () => {
  it('applies migration 10, pauses outbound and keeps every balance', async () => {
    const dir = scratch('timesheet-t06-v9-');
    try {
      const databasePath = join(dir, 'live', 'timesheet.db');
      const dataDir = join(dir, 'live', 'private-data');
      const db = openDatabase(databasePath);
      const clock = new MutableClock(NOW);
      try {
        expect(migrate(db, MIGRATIONS.filter((migration) => migration.version <= 9))).toMatchObject({ version: 9 });
        await seedSynthetic(db, clock, {
          files: new FileStore(dataDir),
          passwords: { admin: randomBytes(12).toString('hex'), employee: randomBytes(12).toString('hex'), employee2: randomBytes(12).toString('hex') },
          sampleData: true,
        });
      } finally {
        db.close();
      }
      const backup = await createBackup({ databasePath, dataDir, targetDir: join(dir, 'backups'), clock });
      expect(backup.manifest.schema_version).toBe(9);
      const result = await restoreBackup({ fromDir: backup.directory, toDir: join(dir, 'restored'), liveDataDir: dataDir, liveDatabasePath: databasePath, clock });
      expect(restoreSummaryJson(result).schema).toEqual({ backup: 9, restored: LATEST, applied: MIGRATIONS.filter((migration) => migration.version > 9).map((migration) => migration.version) });
      const source = openDatabase(databasePath);
      const copy = openDatabase(join(dir, 'restored', RESTORED_DATABASE_NAME));
      try {
        expect(businessState(copy)).toEqual(businessState(source));
        expect(getOutboundPause(copy)).toEqual({ pausedAt: NOW, reason: 'restored' });
        expect(copy.pragma('integrity_check', { simple: true })).toBe('ok');
        expect(copy.pragma('foreign_key_check')).toEqual([]);
        expect(migrate(copy)).toEqual({ applied: [], version: LATEST });
      } finally {
        copy.close();
        source.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('the claim while outbound delivery is paused', () => {
  it('leaves exactly the outbound kinds out, spends no attempt on them, and claims them again after the resume', async () => {
    expect([...OUTBOUND_JOB_KINDS].sort()).toEqual([JOB_SEND_EMAIL, JOB_SEND_REMINDER].sort());
    const t = await createTestContext(NOW);
    try {
      const kinds = [JOB_SEND_EMAIL, JOB_SEND_REMINDER, 'test_job'];
      for (const kind of kinds) enqueueJob(t.db, t.clock, { kind, businessKey: `synthetic:claim:${kind}`, userId: t.userIds.employee });
      t.db.prepare("UPDATE operations_state SET outbound_paused_at = ?, outbound_paused_reason = 'restored' WHERE id = 1").run(NOW);
      expect(claimNextJob(t.db, t.clock, { owner: 'runner-claim', kinds: [JOB_SEND_EMAIL, JOB_SEND_REMINDER] })).toBeNull();
      expect(claimNextJob(t.db, t.clock, { owner: 'runner-claim', kinds })?.kind).toBe('test_job');
      expect(claimNextJob(t.db, t.clock, { owner: 'runner-claim', kinds })).toBeNull();
      expect(t.db.prepare('SELECT kind, state, attempts FROM jobs WHERE kind <> ? ORDER BY kind').all('test_job')).toEqual([
        { kind: JOB_SEND_EMAIL, state: 'queued', attempts: 0 },
        { kind: JOB_SEND_REMINDER, state: 'queued', attempts: 0 },
      ]);
      expect(resumeOutbound(t.db, t.clock)).toMatchObject({ outcome: 'resumed', queuedSendJobs: 2 });
      const claimed = [claimNextJob(t.db, t.clock, { owner: 'runner-claim', kinds }), claimNextJob(t.db, t.clock, { owner: 'runner-claim', kinds })];
      expect(claimed.map((job) => job?.kind).sort()).toEqual([JOB_SEND_EMAIL, JOB_SEND_REMINDER].sort());
    } finally {
      t.close();
    }
  });
});

describe('migration 0010 (outbound pause)', () => {
  let dir: string;

  beforeAll(() => {
    dir = scratch('timesheet-migrate-0010-');
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  const PAUSE_COLUMNS = ['outbound_paused_at', 'outbound_paused_reason'];
  const columns = (db: Db): string[] => (db.pragma('table_info(operations_state)') as Array<{ name: string }>).map((column) => column.name);

  it('applies fresh 1 to 10, is consistent and a rerun applies nothing', () => {
    const db = openDatabase(join(dir, 'fresh.db'));
    try {
      expect(MIGRATIONS.map((migration) => migration.version)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(MIGRATIONS.at(-1)?.name).toBe('outbound_pause');
      expect(migrate(db)).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], version: 10 });
      expect(db.pragma('user_version', { simple: true })).toBe(10);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(db.pragma('foreign_key_check')).toEqual([]);
      expect(columns(db).slice(-2)).toEqual(PAUSE_COLUMNS);
      expect(getOutboundPause(db)).toBeNull();
      expect(migrate(db)).toEqual({ applied: [], version: 10 });
    } finally {
      db.close();
    }
  });

  it('upgrades a populated version 9 database, keeps every row and starts not paused', async () => {
    const db = openDatabase(join(dir, 'v9.db'));
    try {
      expect(migrate(db, MIGRATIONS.filter((migration) => migration.version <= 9))).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8, 9], version: 9 });
      await seedSynthetic(db, new MutableClock(NOW), {
        passwords: { admin: randomBytes(12).toString('hex'), employee: randomBytes(12).toString('hex'), employee2: randomBytes(12).toString('hex') },
        sampleData: true,
      });
      db.prepare(
        "UPDATE operations_state SET runner_heartbeat_at = ?, runner_instance = 'runner-v9', backup_last_attempt_at = ?, backup_last_outcome = 'succeeded', backup_last_success_at = ? WHERE id = 1",
      ).run(NOW, NOW, NOW);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").pluck().all() as string[];
      const snapshot = () => Object.fromEntries(tables.map((name) => [name, db.prepare(`SELECT * FROM ${name} ORDER BY rowid`).all()]));
      const before = snapshot();
      expect(migrate(db, MIGRATIONS, new Date('2026-10-05T18:00:00Z'))).toEqual({ applied: [10], version: 10 });
      const after = snapshot();
      const strip = (rows: unknown[]) => (rows as Array<Record<string, unknown>>).map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !PAUSE_COLUMNS.includes(key))));
      for (const name of tables) {
        if (name === 'schema_migrations') expect(after[name]?.slice(0, 9), name).toEqual(before[name]);
        else expect(strip(after[name] ?? []), name).toEqual(before[name]);
      }
      expect(db.prepare('SELECT outbound_paused_at, outbound_paused_reason, runner_instance, backup_last_outcome FROM operations_state').all()).toEqual([
        { outbound_paused_at: null, outbound_paused_reason: null, runner_instance: 'runner-v9', backup_last_outcome: 'succeeded' },
      ]);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(db.pragma('foreign_key_check')).toEqual([]);
      expect(migrate(db)).toEqual({ applied: [], version: 10 });
    } finally {
      db.close();
    }
  });

  it('refuses an inconsistent pause and a preparing attempt made uncertain without the restore reconciliation code', async () => {
    const db = openDatabase(join(dir, 'shape.db'));
    try {
      migrate(db);
      const update = db.prepare('UPDATE operations_state SET outbound_paused_at = ?, outbound_paused_reason = ? WHERE id = 1');
      for (const bad of [
        [NOW, null], // a pause without a reason
        [null, 'restored'], // a reason without a pause
        ['now', 'restored'], // not a UTC instant
        [NOW, 'Restored by /data'], // not a lowercase code
      ]) {
        expect(() => update.run(...bad), JSON.stringify(bad)).toThrow();
      }
      update.run(NOW, 'restored');
      update.run(null, null);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    } finally {
      db.close();
    }
    const t = await createTestContext(NOW);
    try {
      const job = enqueueJob(t.db, t.clock, { kind: JOB_SEND_EMAIL, businessKey: 'synthetic:attempt', userId: t.userIds.employee }).job;
      t.db.prepare(
        `INSERT INTO delivery_attempts (id, job_id, user_id, attempt_no, envelope_json, message_id, state, started_at, updated_at)
         VALUES ('a-synthetic', ?, ?, 1, '{}', '<synthetic@example.invalid>', 'preparing', ?, ?)`,
      ).run(job.id, t.userIds.employee, NOW, NOW);
      const toUncertain = t.db.prepare("UPDATE delivery_attempts SET state = 'uncertain', provider_response = ? WHERE id = 'a-synthetic'");
      expect(() => toUncertain.run('lease_expired_while_sending')).toThrow(/invalid_delivery_transition/);
      expect(() => toUncertain.run(null)).toThrow(/invalid_delivery_transition/);
      toUncertain.run(RECONCILE_AFTER_RESTORE);
      expect(t.db.prepare("SELECT state FROM delivery_attempts WHERE id = 'a-synthetic'").pluck().get()).toBe('uncertain');
    } finally {
      t.close();
    }
  });
});

describe('cli.js restore and cli.js outbound resume', () => {
  let t: TestContext;
  let backupsRoot: string;
  let backupDir: string;
  let work: string;

  beforeAll(async () => {
    t = await createTestContext(NOW);
    saveSignature(t.db, t.clock, new FileStore(dataDirOf(t)), t.userIds.employee, makePng(20, 10), 'image/png');
    backupsRoot = scratch('timesheet-t06-backups-');
    backupDir = (await createBackup({ databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: backupsRoot, clock: t.clock })).directory;
    work = scratch('timesheet-t06-cli-');
  });

  afterAll(() => {
    t.close();
    rmSync(backupsRoot, { recursive: true, force: true });
    rmSync(work, { recursive: true, force: true });
  });

  function cli(args: string[], env: { DATABASE_PATH: string; DATA_DIR: string }) {
    const result = spawnSync(process.execPath, ['src/server/cli.ts', ...args], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'production', APP_ORIGINS: 'https://timesheet.example.invalid', PUBLIC_BASE_URL: 'https://timesheet.example.invalid', ...env },
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  }

  it('restores in production, prints counts and the manifest check only, and refuses bad arguments', () => {
    const live = { DATABASE_PATH: t.config.databasePath, DATA_DIR: dataDirOf(t) };
    const to = join(work, 'restored');
    const ok = cli(['restore', '--from', backupDir, '--to', to], live);
    expect(ok.stderr).toBe('');
    expect(ok.status).toBe(0);
    const printed = JSON.parse(ok.stdout) as Record<string, unknown>;
    expect(Object.keys(printed).sort()).toEqual(['counts', 'manifest', 'outbound', 'outcome', 'reconciliation', 'schema']);
    expect(printed).toMatchObject({ outcome: 'restored', manifest: { verified: true, files: 1, signatures: 1, pdfs: 0 }, outbound: { paused: true, reason: 'restored' } });
    for (const value of [t.emails.employee, to, backupDir, dataDirOf(t), '@']) expect(ok.stdout.includes(value), value).toBe(false);

    const again = cli(['restore', '--from', backupDir, '--to', to], live);
    expect(again.status).toBe(2);
    expect(again.stderr).toMatch(/target_not_empty/);
    expect(again.stderr.includes(to)).toBe(false);
    expect(cli(['restore', '--from', backupDir], live).status).toBe(2);
    expect(cli(['restore', '--to', join(work, 'x')], live).status).toBe(2);
    expect(cli(['restore', '--from', backupDir, '--to', join(work, 'y'), '--force'], live).status).toBe(2);
  });

  it('outbound resume needs --confirm, then clears the pause of the restored instance once', () => {
    const restoredLive = { DATABASE_PATH: join(work, 'restored', RESTORED_DATABASE_NAME), DATA_DIR: join(work, 'restored', RESTORED_DATA_DIR) };
    const preview = cli(['outbound', 'resume'], restoredLive);
    expect(preview.status).toBe(2);
    expect(JSON.parse(preview.stdout)).toEqual({ outcome: 'confirmation_required', paused: true, reason: 'restored', awaiting_decision: 0, queued_send_jobs: 0, held_send_jobs: 0 });
    const resumed = cli(['outbound', 'resume', '--confirm'], restoredLive);
    expect(resumed.stderr).toBe('');
    expect(resumed.status).toBe(0);
    expect(JSON.parse(resumed.stdout)).toEqual({ outcome: 'resumed', awaiting_decision: 0, queued_send_jobs: 0, held_send_jobs: 0 });
    const twice = cli(['outbound', 'resume', '--confirm'], restoredLive);
    expect(twice.status).toBe(0);
    expect(JSON.parse(twice.stdout)).toMatchObject({ outcome: 'not_paused' });
    expect(cli(['outbound', 'pause'], restoredLive).status).toBe(2);
    const db = openDatabase(restoredLive.DATABASE_PATH);
    try {
      expect(getOutboundPause(db)).toBeNull();
      expect(count(db, "SELECT count(*) FROM audit_events WHERE operation = 'operations.outbound_resume' AND actor_user_id IS NULL")).toBe(1);
    } finally {
      db.close();
    }
  });

  it('outbound resume --confirm is refused (exit 1) while an attempt awaits its decision', () => {
    const db = openDatabase(join(work, 'restored', RESTORED_DATABASE_NAME));
    try {
      const job = enqueueJob(db, t.clock, { kind: JOB_SEND_EMAIL, businessKey: 'synthetic:cli:uncertain', userId: t.userIds.employee }).job;
      db.prepare(
        `INSERT INTO delivery_attempts (id, job_id, user_id, attempt_no, envelope_json, message_id, state, started_at, updated_at)
         VALUES ('a-cli', ?, ?, 1, '{}', '<cli@example.invalid>', 'preparing', ?, ?)`,
      ).run(job.id, t.userIds.employee, NOW, NOW);
      db.prepare("UPDATE delivery_attempts SET state = 'uncertain', provider_response = ? WHERE id = 'a-cli'").run(RECONCILE_AFTER_RESTORE);
      db.prepare("UPDATE operations_state SET outbound_paused_at = ?, outbound_paused_reason = 'restored' WHERE id = 1").run(NOW);
    } finally {
      db.close();
    }
    const restoredLive = { DATABASE_PATH: join(work, 'restored', RESTORED_DATABASE_NAME), DATA_DIR: join(work, 'restored', RESTORED_DATA_DIR) };
    const refused = cli(['outbound', 'resume', '--confirm'], restoredLive);
    expect(refused.status).toBe(1);
    expect(JSON.parse(refused.stdout)).toMatchObject({ outcome: 'refused', awaiting_decision: 1 });
    expect(refused.stdout.includes('@')).toBe(false);
  });

  it('outbound release previews the held jobs, releases one or all with --confirm, and drops a held reminder (exit codes, counts)', () => {
    const live = { DATABASE_PATH: join(work, 'restored', RESTORED_DATABASE_NAME), DATA_DIR: join(work, 'restored', RESTORED_DATA_DIR) };
    const db = openDatabase(live.DATABASE_PATH);
    let reminders: string[];
    let uncertainJob: string;
    try {
      reminders = ['synthetic:cli:reminder:1', 'synthetic:cli:reminder:2'].map(
        (businessKey) => enqueueJob(db, t.clock, { kind: JOB_SEND_REMINDER, businessKey, userId: t.userIds.employee }).job.id,
      );
      uncertainJob = db.prepare("SELECT id FROM jobs WHERE business_key = 'synthetic:cli:uncertain'").pluck().get() as string;
      // Held as a restore holds them.
      db.prepare("UPDATE jobs SET state = 'intervention', last_error = ? WHERE kind IN ('send_email', 'send_reminder')").run(RECONCILE_AFTER_RESTORE);
    } finally {
      db.close();
    }
    const preview = cli(['outbound', 'release'], live);
    expect(preview.status).toBe(2);
    const listed = JSON.parse(preview.stdout) as { outcome: string; held: number; releasable: number; blocked: Record<string, number>; jobs: Array<{ id: string; kind: string; blocker: string | null }> };
    expect(listed).toMatchObject({ outcome: 'confirmation_required', held: 3, releasable: 2, blocked: { attempt_uncertain: 1 } });
    expect(listed.jobs.map((job) => job.id).sort()).toEqual([...reminders, uncertainJob].sort());
    expect(preview.stdout.includes('@')).toBe(false);
    expect(cli(['outbound', 'release', '--all'], live).status).toBe(2);
    expect(cli(['outbound', 'release', '--job', reminders[0] ?? ''], live).status).toBe(2);
    expect(cli(['outbound', 'release', '--job'], live).status).toBe(2);

    const dropped = cli(['outbound', 'drop', '--job', reminders[0] ?? '', '--confirm'], live);
    expect(dropped.status).toBe(0);
    expect(JSON.parse(dropped.stdout)).toEqual({ outcome: 'dropped' });
    const notReminder = cli(['outbound', 'drop', '--job', uncertainJob, '--confirm'], live);
    expect(notReminder.status).toBe(1);
    expect(JSON.parse(notReminder.stdout)).toEqual({ outcome: 'refused', code: 'not_a_reminder' });
    const blocked = cli(['outbound', 'release', '--job', uncertainJob, '--confirm'], live);
    expect(blocked.status).toBe(1);
    expect(JSON.parse(blocked.stdout)).toEqual({ outcome: 'refused', code: 'attempt_uncertain' });
    const all = cli(['outbound', 'release', '--all', '--confirm'], live);
    expect(all.status).toBe(0);
    expect(JSON.parse(all.stdout)).toEqual({ outcome: 'released', released: 1, refused: { attempt_uncertain: 1 } });
    const check = openDatabase(live.DATABASE_PATH);
    try {
      expect(check.prepare('SELECT state FROM jobs WHERE id = ?').pluck().get(reminders[0])).toBe('cancelled');
      expect(check.prepare('SELECT state FROM jobs WHERE id = ?').pluck().get(reminders[1])).toBe('queued');
      expect(check.prepare('SELECT state FROM jobs WHERE id = ?').pluck().get(uncertainJob)).toBe('intervention');
      expect(count(check, "SELECT count(*) FROM audit_events WHERE operation IN ('operations.held_job_release', 'operations.held_job_drop') AND actor_user_id IS NULL")).toBe(2);
    } finally {
      check.close();
    }
  });
});

/*
 * WP4-T12A: restore of a backup whose schema predates the outbound pause (migration 10), without upgrading it, so that the
 * previous build can run on it (rollback after an upgrade; docs/07 "Downgrade binaries only with compatible schema;
 * otherwise restore the paired DB/files ... accepted mail must not be automatically sent again").
 *
 * A schema without the pause columns cannot hold a persistent pause. The restore therefore refuses unless the operator
 * confirms that, and then does everything the schema allows: it never migrates the copy, holds every queued or leased
 * outbound job of the backup (the previous build never claims a job in intervention) and marks every `sending` attempt
 * uncertain for the owner's explicit decision (AC-08). Counts and the manifest check are printed, never a path or person.
 */
describe('restore of a pre-pause backup without upgrading it (rollback)', () => {
  let dir: string;
  let fixture: SchemaV6Fixture;
  let backupDir: string;
  let source: Db;
  const clock = new MutableClock(LATER);

  beforeAll(async () => {
    dir = scratch('timesheet-t12a-rollback-');
    fixture = await buildSchemaV6(dir);
    backupDir = (await createBackup({ databasePath: fixture.databasePath, dataDir: fixture.dataDir, targetDir: join(dir, 'backups'), clock: new MutableClock(NOW) })).directory;
    source = openDatabase(fixture.databasePath);
  });

  afterAll(() => {
    source.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const request = (toDir: string, options: { keepSchema?: boolean; confirmUnpaused?: boolean } = {}) => ({
    fromDir: backupDir,
    toDir,
    liveDataDir: fixture.dataDir,
    liveDatabasePath: fixture.databasePath,
    clock,
    ...options,
  });

  it('backs up the old schema read-only (version 6 in the manifest, source untouched)', () => {
    expect(JSON.parse(readFileSync(join(backupDir, MANIFEST_FILE_NAME), 'utf8')).schema_version).toBe(WP3_SCHEMA_VERSION);
    expect(source.prepare('SELECT max(version) FROM schema_migrations').pluck().get()).toBe(WP3_SCHEMA_VERSION);
  });

  it('refuses without the operator confirmation, writing nothing', async () => {
    const to = join(dir, 'unconfirmed');
    const error = await restoreBackup(request(to, { keepSchema: true })).then(
      () => null,
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(RestoreError);
    expect((error as RestoreError).code).toBe('unpaused_schema_unconfirmed');
    expect((error as RestoreError).refusal).toBe(true);
    expect(existsSync(to)).toBe(false);
  });

  it('with the confirmation keeps schema 6, holds every backed-up outbound job and marks the interrupted send for a decision', async () => {
    const to = join(dir, 'restored');
    const result = await restoreBackup(request(to, { keepSchema: true, confirmUnpaused: true }));
    expect(result.pause).toBeNull();
    expect(result.schema).toEqual({ backup: WP3_SCHEMA_VERSION, restored: WP3_SCHEMA_VERSION, applied: [] });
    const restored = openDatabase(join(to, RESTORED_DATABASE_NAME));
    try {
      expect(restored.prepare('SELECT max(version) FROM schema_migrations').pluck().get()).toBe(WP3_SCHEMA_VERSION);
      expect(restored.pragma('user_version', { simple: true })).toBe(WP3_SCHEMA_VERSION);
      expect(restored.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(restored.pragma('foreign_key_check')).toEqual([]);
      // No column of a later migration appeared: the previous build runs on it unchanged.
      expect(restored.prepare("SELECT count(*) FROM pragma_table_info('operations_state') WHERE name LIKE 'outbound_paused%'").pluck().get()).toBe(0);
      expect(businessState(restored)).toEqual(businessState(source));
      expect(count(restored, 'SELECT count(*) FROM timesheet_revisions')).toBe(2);

      const sends = restored
        .prepare<[], { revision_id: string | null; business_key: string; kind: string; state: string; attempts: number; last_error: string | null }>(
          "SELECT revision_id, business_key, kind, state, attempts, last_error FROM jobs WHERE kind IN ('send_email', 'send_reminder') ORDER BY created_at, id",
        )
        .all();
      expect(Object.fromEntries(sends.map((job) => [job.revision_id ?? job.business_key, [job.state, job.attempts, job.last_error]]))).toEqual({
        [fixture.revisions.sending]: ['intervention', 1, RECONCILE_AFTER_RESTORE],
        [fixture.revisions.queued]: ['intervention', 0, RECONCILE_AFTER_RESTORE],
        [fixture.reminderBusinessKey]: ['intervention', 0, RECONCILE_AFTER_RESTORE],
      });
      // Nothing is claimable by the previous build's runner: no outbound job is queued or leased.
      expect(count(restored, "SELECT count(*) FROM jobs WHERE kind IN ('send_email', 'send_reminder') AND state IN ('queued', 'leased')")).toBe(0);
      // Non-outbound work is untouched: the PDF jobs stay queued.
      expect(count(restored, "SELECT count(*) FROM jobs WHERE kind = 'render_pdf' AND state = 'queued'")).toBe(2);
      expect(attemptsOf(restored).map((attempt) => [attempt.revision_id, attempt.state, attempt.decision, attempt.provider_response])).toEqual([
        [fixture.revisions.sending, 'uncertain', null, RECONCILE_AFTER_RESTORE],
      ]);
      expect(count(restored, "SELECT count(*) FROM audit_events WHERE operation = 'operations.restore' AND actor_user_id IS NULL")).toBe(1);
      // The source is untouched.
      expect(sendJobs(source).map((job) => job.state).sort()).toEqual(['leased', 'queued', 'queued']);
      expect(attemptsOf(source).map((attempt) => attempt.state)).toEqual(['sending']);
    } finally {
      restored.close();
    }

    const summary = restoreSummaryJson(result);
    expect(summary).toEqual({
      outcome: 'restored',
      manifest: { verified: true, schema_version: WP3_SCHEMA_VERSION, files: 1, signatures: 1, pdfs: 0, database_bytes: expect.any(Number) },
      schema: { backup: WP3_SCHEMA_VERSION, restored: WP3_SCHEMA_VERSION, applied: [] },
      outbound: { paused: false, reason: null },
      reconciliation: { attempts_marked_uncertain: 1, send_jobs_held: 3, queued_send_jobs: 0, awaiting_decision: 1 },
      counts: { users: 3, revisions: 2, ledger_entries: count(source, 'SELECT count(*) FROM ot_ledger'), attachments: 1 },
    });
    const text = JSON.stringify(summary);
    for (const value of ['@', to, backupDir, 'Example']) expect(text.includes(value), value).toBe(false);
  });

  it('is the same as a normal restore when the backup already has the pause: paused, no confirmation needed', async () => {
    const t = await createTestContext(NOW);
    try {
      const backup = await createBackup({ databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: join(dir, 'current-backups'), clock: t.clock });
      const to = join(dir, 'restored-current');
      const result = await restoreBackup({ fromDir: backup.directory, toDir: to, liveDataDir: dataDirOf(t), liveDatabasePath: t.config.databasePath, clock, keepSchema: true });
      expect(result.pause).toEqual({ pausedAt: LATER, reason: 'restored' });
      expect(restoreSummaryJson(result).outbound).toEqual({ paused: true, reason: 'restored' });
    } finally {
      t.close();
    }
  });

  it('a normal restore of the same backup still upgrades it and pauses (the default is unchanged)', async () => {
    const result = await restoreBackup(request(join(dir, 'restored-upgraded')));
    expect(result.schema).toEqual({
      backup: WP3_SCHEMA_VERSION,
      restored: LATEST,
      applied: MIGRATIONS.filter((migration) => migration.version > WP3_SCHEMA_VERSION).map((migration) => migration.version),
    });
    expect(result.pause).toEqual({ pausedAt: LATER, reason: 'restored' });
  });

  it('cli.js restore --keep-schema needs --confirm, warns on stderr, and prints counts only', () => {
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      APP_ORIGINS: 'https://timesheet.example.invalid',
      PUBLIC_BASE_URL: 'https://timesheet.example.invalid',
      DATABASE_PATH: fixture.databasePath,
      DATA_DIR: fixture.dataDir,
    };
    const run = (args: string[]) => {
      const result = spawnSync(process.execPath, ['src/server/cli.ts', ...args], { cwd: repo, encoding: 'utf8', env });
      return { status: result.status, stdout: result.stdout, stderr: result.stderr };
    };
    const to = join(dir, 'cli-restored');
    const refused = run(['restore', '--from', backupDir, '--to', to, '--keep-schema']);
    expect(refused.status).toBe(2);
    expect(refused.stderr).toMatch(/unpaused_schema_unconfirmed/);
    expect(refused.stdout).toBe('');
    expect(existsSync(to)).toBe(false);
    // --confirm alone is a usage error, not a way to skip a check.
    expect(run(['restore', '--from', backupDir, '--to', to, '--confirm']).status).toBe(2);
    expect(existsSync(to)).toBe(false);
    const ok = run(['restore', '--from', backupDir, '--to', to, '--keep-schema', '--confirm']);
    expect(ok.status).toBe(0);
    expect(ok.stderr).toMatch(/WARNING/);
    expect(ok.stderr).toMatch(/JOB_RUNNER=off/);
    const printed = JSON.parse(ok.stdout) as Record<string, unknown>;
    expect(Object.keys(printed).sort()).toEqual(['counts', 'manifest', 'outbound', 'outcome', 'reconciliation', 'schema']);
    expect(printed).toMatchObject({ outcome: 'restored', schema: { backup: WP3_SCHEMA_VERSION, restored: WP3_SCHEMA_VERSION, applied: [] }, outbound: { paused: false, reason: null } });
    for (const value of [to, backupDir, fixture.dataDir, '@']) expect(`${ok.stdout}${ok.stderr}`.includes(value), value).toBe(false);
  });
});
