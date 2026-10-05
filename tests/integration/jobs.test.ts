import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import {
  claimNextJob,
  completeJob,
  enqueueJob,
  failJob,
  JobError,
  MAX_ATTEMPTS,
  RETRY_DELAYS_MINUTES,
  redactJobError,
  renewLease,
} from '../../src/server/jobs/jobStore.ts';
import { createPdfJobHandler, JOB_RENDER_PDF, pdfStorageKey } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { renderTimesheetPdf, type TimesheetPdfInput } from '../../src/server/pdf/timesheetPdf.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T08: durable job store, runner and PDF job (AC-08, docs/03 "Atomicity and snapshots",
 * docs/05 "Durable delivery"). Today is 2026-09-29 (LA 13:00); the current period is
 * 2026-09-14 ... 2026-09-27 with payroll date 2026-10-02. Data is synthetic (example.invalid).
 * Instants are UTC strings produced by the store from the injectable clock; no fixed offset is
 * assumed. Child-process crash and multi-process claim tests are in jobs-restart.test.ts.
 */

let t: TestContext;
let employee: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
});

afterEach(() => t.close());

const PAYROLL = '2026-10-02';
const TEST_KIND = 'test_job';
const OWNER_A = 'runner-a';
const OWNER_B = 'runner-b';

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

function jobRow(id: string): any {
  return t.db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

function plusSeconds(iso: string, seconds: number): string {
  return new Date(new Date(iso).getTime() + seconds * 1000).toISOString().replace('.000Z', 'Z');
}

const nowIso = () => t.clock.now().toISOString().replace('.000Z', 'Z');
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const dataDir = () => join(dirname(t.config.databasePath), 'private-data');
const listDir = (path: string) => (existsSync(path) ? readdirSync(path) : []);

/** Rows the PDF job must never touch (ledger, revisions, sign-offs, lines, audit, attempts). */
function untouchable() {
  return {
    ledger: count('SELECT count(*) FROM ot_ledger'),
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    signoffs: count('SELECT count(*) FROM signoffs'),
    lines: count('SELECT count(*) FROM revision_ledger_lines'),
    attempts: count('SELECT count(*) FROM delivery_attempts'),
    timesheets: t.db.prepare('SELECT id, version, finalized_revision_no FROM timesheets ORDER BY id').all(),
  };
}

async function addSession(date: string, from: string, to: string, reason?: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true, ...(reason === undefined ? {} : { reason }) },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** A signed original revision with OT on a weekday and on the second Sunday; its jobs are queued. */
async function signedRevision(files = new FileStore(dataDir())) {
  await addSession('2026-09-15', '09:00', '18:00');
  await addSession('2026-09-27', '10:00', '12:00');
  const png = makePng(40, 12);
  const signature = saveSignature(t.db, t.clock, files, t.userIds.employee, png, 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
  expect(review.status, JSON.stringify(review.body)).toBe(200);
  t.clock.advanceSeconds(60);
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
  const pdfJob = t.db.prepare("SELECT * FROM jobs WHERE revision_id = ? AND kind = 'render_pdf'").get(revisionId) as any;
  return { revisionId, signature, png, pdfJobId: pdfJob.id as string, files };
}

function pdfHandlers(files: FileStore, render?: (input: TimesheetPdfInput) => Promise<Uint8Array>) {
  return { [JOB_RENDER_PDF]: createPdfJobHandler({ db: t.db, clock: t.clock, files, ...(render === undefined ? {} : { render }) }) };
}

// ---------------------------------------------------------------------------------------

describe('job store', () => {
  it('enqueues a business key once; a duplicate returns the existing job unchanged', () => {
    const first = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:alpha', payload: { n: 1 } });
    t.clock.advanceSeconds(30);
    const second = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:alpha', payload: { n: 2 } });
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.job.id).toBe(first.job.id);
    expect(second.job.payload).toEqual({ n: 1 });
    expect(count("SELECT count(*) FROM jobs WHERE business_key = 'test:alpha'")).toBe(1);
    expect(jobRow(first.job.id)).toMatchObject({ state: 'queued', attempts: 0, next_run_at: '2026-09-29T20:00:00Z' });
  });

  it('a key already enqueued by the sign-off transaction is not enqueued again', async () => {
    const { revisionId, pdfJobId } = await signedRevision();
    const again = enqueueJob(t.db, t.clock, {
      kind: JOB_RENDER_PDF,
      businessKey: `revision:${revisionId}:render_pdf`,
      userId: t.userIds.employee,
      revisionId,
      payload: { revision_id: revisionId },
    });
    expect(again).toMatchObject({ created: false, job: { id: pdfJobId } });
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'render_pdf'")).toBe(1);
  });

  it('claims with an atomic lease that a second connection cannot take until it expires', () => {
    const { job } = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:lease' });
    const other: Db = openDatabase(t.config.databasePath);
    try {
      const claimed = claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND], leaseSeconds: 60 });
      expect(claimed).toMatchObject({ id: job.id, state: 'leased', attempts: 1, leaseOwner: OWNER_A, leaseExpiresAt: '2026-09-29T20:01:00Z' });
      expect(claimNextJob(other, t.clock, { owner: OWNER_B, kinds: [TEST_KIND], leaseSeconds: 60 })).toBeNull();

      // Renewal moves the expiry forward while the lease is still held.
      t.clock.advanceSeconds(45);
      expect(renewLease(t.db, t.clock, job.id, OWNER_A, 60)).toBe(true);
      expect(jobRow(job.id).lease_expires_at).toBe('2026-09-29T20:01:45Z');
      t.clock.advanceSeconds(59);
      expect(claimNextJob(other, t.clock, { owner: OWNER_B, kinds: [TEST_KIND], leaseSeconds: 60 })).toBeNull();

      // Expired: the second runner reclaims it (a new attempt) and the first runner lost it.
      t.clock.advanceSeconds(1);
      const reclaimed = claimNextJob(other, t.clock, { owner: OWNER_B, kinds: [TEST_KIND], leaseSeconds: 60 });
      expect(reclaimed).toMatchObject({ id: job.id, attempts: 2, leaseOwner: OWNER_B, leaseExpiresAt: '2026-09-29T20:02:45Z' });
      expect(renewLease(t.db, t.clock, job.id, OWNER_A, 60)).toBe(false);
      expect(completeJob(t.db, t.clock, job.id, OWNER_A)).toBe(false);
      expect(failJob(t.db, t.clock, job.id, OWNER_A, new JobError('render_failed'))).toEqual({ state: 'lost' });
      expect(jobRow(job.id)).toMatchObject({ state: 'leased', lease_owner: OWNER_B, attempts: 2 });

      expect(completeJob(other, t.clock, job.id, OWNER_B)).toBe(true);
      expect(jobRow(job.id)).toMatchObject({ state: 'succeeded', lease_owner: null, lease_expires_at: null, attempts: 2 });
      t.clock.advanceSeconds(3600);
      expect(claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND], leaseSeconds: 60 })).toBeNull();
    } finally {
      other.close();
    }
  });

  it('retries after 1, 5, 15 and 60 minutes, then moves the job to intervention', () => {
    expect(RETRY_DELAYS_MINUTES).toEqual([1, 5, 15, 60]);
    expect(MAX_ATTEMPTS).toBe(5);
    const { job } = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:retry' });
    const claim = () => claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND], leaseSeconds: 60 });
    for (const [index, delay] of [1, 5, 15, 60].entries()) {
      expect(claim()).toMatchObject({ id: job.id, attempts: index + 1 });
      const failedAt = nowIso();
      const outcome = failJob(t.db, t.clock, job.id, OWNER_A, new JobError('render_failed'));
      const due = plusSeconds(failedAt, delay * 60);
      expect(outcome).toEqual({ state: 'queued', nextRunAt: due });
      expect(jobRow(job.id)).toMatchObject({ state: 'queued', next_run_at: due, last_error: 'render_failed', lease_owner: null, lease_expires_at: null });
      t.clock.advanceSeconds(delay * 60 - 1);
      expect(claim()).toBeNull();
      t.clock.advanceSeconds(1);
    }
    expect(claim()).toMatchObject({ id: job.id, attempts: 5 });
    expect(failJob(t.db, t.clock, job.id, OWNER_A, new JobError('render_failed'))).toEqual({ state: 'intervention' });
    expect(jobRow(job.id)).toMatchObject({ state: 'intervention', attempts: 5, last_error: 'render_failed', lease_owner: null });
    t.clock.advanceSeconds(7 * 24 * 3600);
    expect(claim()).toBeNull();
  });

  it('a permanent failure needs intervention at once', () => {
    const { job } = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:permanent' });
    claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND] });
    expect(failJob(t.db, t.clock, job.id, OWNER_A, new JobError('signature_hash_mismatch', { permanent: true }))).toEqual({ state: 'intervention' });
    expect(jobRow(job.id)).toMatchObject({ state: 'intervention', attempts: 1, last_error: 'signature_hash_mismatch' });
  });

  it('an expired lease on the last attempt goes to intervention instead of a sixth attempt', () => {
    const { job } = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:exhausted' });
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      expect(claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND], leaseSeconds: 60 })).toMatchObject({ attempts: attempt });
      t.clock.advanceSeconds(61); // the runner died holding the lease
    }
    expect(claimNextJob(t.db, t.clock, { owner: OWNER_B, kinds: [TEST_KIND], leaseSeconds: 60 })).toBeNull();
    expect(jobRow(job.id)).toMatchObject({ state: 'intervention', attempts: MAX_ATTEMPTS, last_error: 'lease_expired', lease_owner: null });
  });

  it('stores only a redacted error code, never an error message', () => {
    const { job } = enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:redact' });
    claimNextJob(t.db, t.clock, { owner: OWNER_A, kinds: [TEST_KIND] });
    failJob(t.db, t.clock, job.id, OWNER_A, new Error('Rejected employee@example.invalid (Example Employee) for 2026-10-02'));
    const row = jobRow(job.id);
    expect(row.last_error).toBe('internal_error');
    expect(JSON.stringify(row)).not.toMatch(/example\.invalid|Example Employee|Rejected/);
    expect(redactJobError(new JobError('render_failed'))).toBe('render_failed');
    expect(redactJobError('employee@example.invalid')).toBe('internal_error');
    expect(() => new JobError('Bad Code with employee@example.invalid')).toThrow();
  });

  it('claims only the kinds it has handlers for and records the runner heartbeat', async () => {
    enqueueJob(t.db, t.clock, { kind: 'send_email', businessKey: 'test:other-kind' });
    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-heartbeat', handlers: { [TEST_KIND]: () => Promise.resolve() } });
    expect(summary).toEqual({ claimed: 0, succeeded: 0, retried: 0, intervention: 0, lost: 0 });
    expect(count("SELECT count(*) FROM jobs WHERE state = 'queued' AND attempts = 0")).toBe(1);
    const state = t.db.prepare('SELECT runner_heartbeat_at, runner_instance FROM operations_state WHERE id = 1').get();
    expect(state).toEqual({ runner_heartbeat_at: '2026-09-29T20:00:00Z', runner_instance: 'runner-heartbeat' });
  });

  it('the runner completes, retries and escalates through the store', async () => {
    enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:ok', payload: { mode: 'ok' } });
    enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:flaky', payload: { mode: 'flaky' } });
    enqueueJob(t.db, t.clock, { kind: TEST_KIND, businessKey: 'test:broken', payload: { mode: 'broken' } });
    const handler = ({ job }: { job: { payload: Record<string, unknown> } }) => {
      if (job.payload.mode === 'flaky') return Promise.reject(new JobError('render_failed'));
      if (job.payload.mode === 'broken') return Promise.reject(new JobError('signature_hash_mismatch', { permanent: true }));
      return Promise.resolve();
    };
    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_A, handlers: { [TEST_KIND]: handler } });
    expect(summary).toEqual({ claimed: 3, succeeded: 1, retried: 1, intervention: 1, lost: 0 });
    const states = t.db.prepare('SELECT business_key, state, attempts FROM jobs ORDER BY business_key').all();
    expect(states).toEqual([
      { business_key: 'test:broken', state: 'intervention', attempts: 1 },
      { business_key: 'test:flaky', state: 'queued', attempts: 1 },
      { business_key: 'test:ok', state: 'succeeded', attempts: 1 },
    ]);
  });
});

describe('PDF job', () => {
  it('renders the stored snapshot, writes the file atomically, records hash and state, and posts nothing', async () => {
    const { revisionId, png, pdfJobId, files } = await signedRevision();
    // No runner runs inside the app: the job is still queued after the requests.
    expect(jobRow(pdfJobId)).toMatchObject({ state: 'queued', attempts: 0 });
    // Later changes to the owner's data must not reach the archived PDF.
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(30, 30), 'image/png');
    await addSession('2026-09-16', '09:00', '19:00', 'Synthetic later edit');
    const before = untouchable();
    t.clock.advanceSeconds(10);

    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_A, handlers: pdfHandlers(files) });
    expect(summary).toEqual({ claimed: 1, succeeded: 1, retried: 0, intervention: 0, lost: 0 });
    expect(jobRow(pdfJobId)).toMatchObject({ state: 'succeeded', attempts: 1, last_error: null });

    const file = t.db.prepare('SELECT * FROM revision_files WHERE revision_id = ?').get(revisionId) as any;
    expect(file).toMatchObject({ user_id: t.userIds.employee, kind: 'pdf', state: 'ready', last_error: null });
    const attachment = t.db.prepare('SELECT * FROM attachments WHERE id = ?').get(file.attachment_id) as any;
    expect(attachment).toMatchObject({ user_id: t.userIds.employee, kind: 'pdf', mime_type: 'application/pdf', width_px: null, height_px: null });
    const bytes = readFileSync(files.pathOf(attachment.storage_key));
    expect(attachment.sha256).toBe(sha(bytes));
    expect(attachment.size_bytes).toBe(bytes.length);
    expect(attachment.storage_key).toBe(pdfStorageKey(revisionId, attachment.sha256));
    expect(attachment.storage_key).not.toContain(revisionId);
    expect(listDir(join(files.root, 'tmp'))).toEqual([]);

    // Exactly the bytes of the stored snapshot with the signature reviewed at sign-off.
    const revision = t.db.prepare('SELECT * FROM timesheet_revisions WHERE id = ?').get(revisionId) as any;
    const signoff = t.db.prepare('SELECT * FROM signoffs WHERE revision_id = ?').get(revisionId) as any;
    const snapshot = JSON.parse(revision.payload_json);
    const expected = await renderTimesheetPdf({
      snapshot,
      submissionId: snapshot.submission.id,
      revisionNo: revision.revision_no,
      origin: 'manual',
      signedAt: signoff.signed_at,
      signatureImage: png,
    });
    expect(sha(bytes)).toBe(sha(expected));

    // Nothing posted, no delivery, the send job untouched.
    expect(untouchable()).toEqual(before);
    expect(t.db.prepare("SELECT state, attempts FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(revisionId)).toEqual({ state: 'queued', attempts: 0 });

    // A second pass finds nothing; a duplicate run of the handler writes nothing new.
    t.clock.advanceSeconds(3600);
    expect((await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_B, handlers: pdfHandlers(files) })).claimed).toBe(0);
    const handler = createPdfJobHandler({ db: t.db, clock: t.clock, files });
    const job = { ...(claimShape(pdfJobId) as object) } as Parameters<typeof handler>[0]['job'];
    await handler({ job, renewLease: () => true });
    expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(1);
    expect(listDir(join(files.root, 'files'))).toHaveLength(3); // two signatures and one PDF
  });

  it('a signature hash mismatch fails the job without writing a PDF', async () => {
    const { revisionId, signature, pdfJobId, files } = await signedRevision();
    const key = t.db.prepare('SELECT storage_key FROM attachments WHERE id = ?').pluck().get(signature.id) as string;
    writeFileSync(files.pathOf(key), makePng(41, 12)); // a different valid image under the same key
    const before = untouchable();
    const filesBefore = listDir(join(files.root, 'files')).sort();

    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_A, handlers: pdfHandlers(files) });
    expect(summary).toEqual({ claimed: 1, succeeded: 0, retried: 0, intervention: 1, lost: 0 });
    expect(jobRow(pdfJobId)).toMatchObject({ state: 'intervention', last_error: 'signature_hash_mismatch' });
    expect(t.db.prepare('SELECT state, attachment_id, last_error FROM revision_files WHERE revision_id = ?').get(revisionId)).toEqual({
      state: 'failed',
      attachment_id: null,
      last_error: 'signature_hash_mismatch',
    });
    expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(0);
    expect(listDir(join(files.root, 'files')).sort()).toEqual(filesBefore);
    expect(listDir(join(files.root, 'tmp'))).toEqual([]);
    expect(untouchable()).toEqual(before);
  });

  it('a render failure is retried later with the same snapshot and posts nothing', async () => {
    const { revisionId, pdfJobId, files } = await signedRevision();
    const inputs: TimesheetPdfInput[] = [];
    let calls = 0;
    const flaky = (input: TimesheetPdfInput) => {
      inputs.push(input);
      calls += 1;
      return calls === 1 ? Promise.reject(new Error('renderer crashed for Example Employee')) : renderTimesheetPdf(input);
    };
    const before = untouchable();

    const first = await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_A, handlers: pdfHandlers(files, flaky) });
    expect(first).toEqual({ claimed: 1, succeeded: 0, retried: 1, intervention: 0, lost: 0 });
    expect(jobRow(pdfJobId)).toMatchObject({ state: 'queued', attempts: 1, last_error: 'render_failed', next_run_at: plusSeconds(nowIso(), 60) });
    expect(t.db.prepare('SELECT state, last_error FROM revision_files WHERE revision_id = ?').get(revisionId)).toEqual({ state: 'failed', last_error: 'render_failed' });

    // The owner edits the period meanwhile; the retry still renders the archived snapshot.
    await addSession('2026-09-17', '09:00', '20:00', 'Synthetic later edit');
    t.clock.advanceSeconds(60);
    const second = await runJobsOnce({ db: t.db, clock: t.clock, owner: OWNER_B, handlers: pdfHandlers(files, flaky) });
    expect(second).toEqual({ claimed: 1, succeeded: 1, retried: 0, intervention: 0, lost: 0 });
    expect(jobRow(pdfJobId)).toMatchObject({ state: 'succeeded', attempts: 2 });
    expect(t.db.prepare('SELECT state FROM revision_files WHERE revision_id = ?').pluck().get(revisionId)).toBe('ready');
    expect(inputs).toHaveLength(2);
    expect(inputs[1]).toEqual(inputs[0]);
    expect(untouchable()).toEqual({ ...before, timesheets: untouchable().timesheets });
    expect(count('SELECT count(*) FROM ot_ledger')).toBe(before.ledger);
  });
});

/** The job as the store hands it to a handler (re-read from the row). */
function claimShape(id: string) {
  const row = jobRow(id);
  return {
    id: row.id,
    userId: row.user_id,
    revisionId: row.revision_id,
    kind: row.kind,
    businessKey: row.business_key,
    payload: JSON.parse(row.payload_json),
    state: row.state,
    attempts: row.attempts,
    nextRunAt: row.next_run_at,
    leaseOwner: row.lease_owner,
    leaseExpiresAt: row.lease_expires_at,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
