import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler } from '../../src/server/jobs/sendJob.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import { createOutboundAdapter, type OutboundAdapter, type SendOutcome } from '../../src/server/mail/outbound.ts';
import { listOverdueRecords, runDeadlineScan, setAutomationActivation } from '../../src/server/services/automation.ts';
import { getBalance } from '../../src/server/services/ledger.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { callWindowsOverlap, RacePool } from '../support/concurrency.ts';
import { makePng, readPdf } from '../support/pdfText.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP5-UX5-T01b: signing and sending are separate acts, and every send is its own immutable record (owner decisions
 * F-2 a, F-3 b, F-4 of 2026-10-21; plan Addendum 1 B-A1, B-A2, B-A4). Covered here: the sign-off enqueues no send; the
 * send draft; the send route (idempotency by request key, the 409 refusals, the owner's reason rule and its counting,
 * two concurrent sends); the PDF variants (all four, one page each, stored once, rendered on request for the owner,
 * never for a grantee); the unsigned preview; the send job building the message from its own record; the deadline's
 * automatic send of a draft and of a signed revision that was never sent. Synthetic data only (example.invalid),
 * local mail capture only.
 */

const PAYROLL = '2026-10-02';
const SENDER = 'timesheet@example.invalid';
const TO = ['payroll@example.invalid'];
const CC = ['manager@example.invalid'];

let t: TestContext;
let employee: string;
let dataDir: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
});

afterEach(() => t.close());

const count = (sql: string, ...params: string[]): number => Number(t.db.prepare(sql).pluck().get(...params));
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function saveSettings(overrides: Record<string, unknown> = {}) {
  const response = await t.request('POST', '/api/settings/submission', { cookie: employee, body: { expected_seq: 0, to: TO, cc: CC, auto_submit: false, ...overrides } });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

async function addSession(date: string, from: string, to: string, reason?: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true, ...(reason === undefined ? {} : { reason }) },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** The employee's signed revision of PAYROLL (settings with optional overrides, one session, a saved image). */
async function signed(settings: Record<string, unknown> = {}): Promise<string> {
  await saveSettings(settings);
  await addSession('2026-09-15', '09:00', '18:00');
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
  const response = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie: employee,
    body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.revision.id as string;
}

async function draftOf(revisionId: string, cookie = employee) {
  const response = await t.request('GET', `/api/revisions/${revisionId}/send-draft`, { cookie });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body;
}

/** A send request body from the draft's defaults, with overrides. */
async function sendBody(revisionId: string, overrides: Record<string, unknown> = {}) {
  const draft = await draftOf(revisionId);
  return {
    request_key: randomUUID(),
    to: draft.to,
    cc: draft.cc,
    subject: draft.subject,
    body_text: draft.body_text,
    time_rows: draft.time_rows,
    ot_rows: draft.ot_rows,
    ...overrides,
  };
}

const postSend = (revisionId: string, body: unknown, cookie = employee) => t.request('POST', `/api/revisions/${revisionId}/send`, { cookie, body });

function runPdf() {
  return runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
}

function runSend(outbound: OutboundAdapter = createOutboundAdapter({ mode: 'capture' }, { dataDir })) {
  return runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-send', handlers: { send_email: createSendJobHandler({ db: t.db, clock: t.clock, files, outbound, senderAddress: SENDER }) } });
}

const fixed = (outcome: SendOutcome): OutboundAdapter => ({ mode: 'capture', send: () => Promise.resolve(outcome) });

function writeState() {
  return {
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    sends: count('SELECT count(*) FROM revision_sends'),
    jobs: count('SELECT count(*) FROM jobs'),
    attempts: count('SELECT count(*) FROM delivery_attempts'),
    files: count('SELECT count(*) FROM revision_files'),
    ledger: count('SELECT count(*) FROM ot_ledger'),
    audit: count('SELECT count(*) FROM audit_events'),
  };
}

describe('sign-off and the send record', () => {
  it('signs off without sending; the draft gives the Settings defaults; a send writes its record, its job and its audit only', async () => {
    const revisionId = await signed();
    expect(t.db.prepare('SELECT kind, business_key FROM jobs WHERE revision_id = ?').all(revisionId)).toEqual([
      { kind: 'render_pdf', business_key: `revision:${revisionId}:render_pdf` },
    ]);
    expect(count('SELECT count(*) FROM revision_sends')).toBe(0);
    expect(t.db.prepare('SELECT send_requested FROM timesheet_revisions WHERE id = ?').pluck().get(revisionId)).toBe(0);

    const draft = await draftOf(revisionId);
    const snapshot = JSON.parse(t.db.prepare('SELECT payload_json FROM timesheet_revisions WHERE id = ?').pluck().get(revisionId) as string);
    expect(draft).toMatchObject({
      revision_id: revisionId,
      revision_no: 1,
      current: true,
      sender: null,
      to: TO,
      cc: CC,
      subject: snapshot.recipients.subject,
      body_text: snapshot.recipients.body_text,
      time_rows: true,
      ot_rows: true,
      copy_sent_before: null,
      reason_required: false,
      previous_send: null,
    });

    const before = writeState();
    const ledger = JSON.stringify(getBalance(t.db, t.userIds.employee));
    const body = await sendBody(revisionId);
    const response = await postSend(revisionId, body);
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body).toMatchObject({
      status: 'created',
      send: { revision_id: revisionId, send_no: 1, origin: 'employee', to: TO, cc: CC, time_rows: true, ot_rows: true, pdf_variant: 't1o1', reason: null },
      job: { kind: 'send_email' },
    });
    const sendId = response.body.send.id as string;
    // The PDF of the default variant is already queued by the sign-off, so the send adds only its own job.
    expect(writeState()).toEqual({ ...before, sends: 1, jobs: before.jobs + 1, audit: before.audit + 1 });
    expect(t.db.prepare("SELECT business_key, payload_json, state FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(revisionId)).toEqual({
      business_key: `send:${sendId}`,
      payload_json: JSON.stringify({ revision_id: revisionId, send_id: sendId }),
      state: 'queued',
    });
    expect(JSON.stringify(getBalance(t.db, t.userIds.employee))).toBe(ledger);
    const audit = t.db.prepare("SELECT actor_user_id, owner_user_id, reason, after_json FROM audit_events WHERE operation = 'revision.send'").get() as Record<string, string | null>;
    expect(audit).toMatchObject({ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee, reason: null });
    expect(JSON.parse(audit.after_json ?? '{}')).toMatchObject({ send_id: sendId, send_no: 1, pdf_variant: 't1o1', to_count: 1, cc_count: 1, copy_counted_before: false });
    expect(audit.after_json).not.toContain('example.invalid');
    // The record is immutable.
    expect(() => t.db.prepare("UPDATE revision_sends SET subject = 'Changed'").run()).toThrow(/immutable_revision_send/);
  });

  // F-UX5B-5 (plan B-A1): the Settings time switch is the default of the send draft and of the deadline sends, never of the
  // sign-off's own PDF, which stays the sign-off default (time rows on, OT rows as the snapshot froze them).
  it('the Settings time switch reaches the send draft, not the PDF job and file of the sign-off', async () => {
    const revisionId = await signed({ show_time_on_pdf: false });
    expect((await draftOf(revisionId)).time_rows).toBe(false);
    expect(t.db.prepare("SELECT business_key, payload_json FROM jobs WHERE revision_id = ? AND kind = 'render_pdf'").all(revisionId)).toEqual([
      { business_key: `revision:${revisionId}:render_pdf`, payload_json: JSON.stringify({ revision_id: revisionId, variant: 't1o1' }) },
    ]);
    await runPdf();
    expect(t.db.prepare("SELECT variant, state FROM revision_files WHERE revision_id = ? AND kind = 'pdf'").all(revisionId)).toEqual([{ variant: 't1o1', state: 'ready' }]);
    // Sending with the draft's default renders the other variant next to it; the sign-off file is untouched.
    const sent = await postSend(revisionId, await sendBody(revisionId));
    expect(sent.status, JSON.stringify(sent.body)).toBe(201);
    expect(sent.body.send).toMatchObject({ time_rows: false, ot_rows: true, pdf_variant: 't0o1' });
    expect(t.db.prepare("SELECT variant FROM revision_files WHERE revision_id = ? AND kind = 'pdf' AND state = 'ready'").pluck().all(revisionId)).toEqual(['t1o1']);
  });

  it('is idempotent by request key: the same body replays, another body under the key is 409, and nothing more is written', async () => {
    const revisionId = await signed();
    const body = await sendBody(revisionId);
    const first = await postSend(revisionId, body);
    expect(first.status).toBe(201);
    const before = writeState();
    const replay = await postSend(revisionId, body);
    expect(replay.status).toBe(200);
    expect(replay.body).toMatchObject({ status: 'replayed', send: { id: first.body.send.id } });
    // A retry after a lost response may arrive while the first send's job still waits: it still replays.
    expect(writeState()).toEqual(before);
    const other = await postSend(revisionId, { ...body, subject: 'A different subject' });
    expect(other.status).toBe(409);
    expect(other.body.error.code).toBe('request_key_reused');
    expect(writeState()).toEqual(before);
  });

  it('validates the envelope, subject, body and reason of a send (422, nothing written)', async () => {
    const revisionId = await signed();
    const before = writeState();
    const cases: Array<[Record<string, unknown>, string]> = [
      [{ to: [] }, 'recipients_required'],
      [{ to: ['not an address'] }, 'invalid_recipient'],
      [{ subject: '   ' }, 'invalid_subject'],
      [{ subject: 'Line one\nBcc: x@example.invalid' }, 'invalid_subject'],
      [{ subject: 'x'.repeat(301) }, 'invalid_subject'],
      [{ body_text: ' \n ' }, 'invalid_body'],
      [{ body_text: 'x'.repeat(20_001) }, 'invalid_body'],
      [{ reason: 'x' }, 'invalid_reason'],
      [{ reason: 'x'.repeat(501) }, 'invalid_reason'],
      [{ reason: 'Two\u0007bells' }, 'invalid_reason'],
      [{ request_key: 'short' }, 'validation_error'],
      [{ user_id: t.userIds.admin }, 'validation_error'],
    ];
    for (const [overrides, code] of cases) {
      const response = await postSend(revisionId, await sendBody(revisionId, overrides));
      expect(response.status, JSON.stringify(overrides)).toBe(422);
      expect(response.body.error.code, JSON.stringify(overrides)).toBe(code);
    }
    expect(writeState()).toEqual(before);
    // Accepted shapes: a reason with a line feed is trimmed and kept; the subject is trimmed.
    const ok = await postSend(revisionId, await sendBody(revisionId, { subject: '  Edited subject  ', reason: '  First line\nsecond line  ' }));
    expect(ok.status, JSON.stringify(ok.body)).toBe(201);
    expect(ok.body.send).toMatchObject({ subject: 'Edited subject', reason: 'First line\nsecond line' });
  });

  it('refuses another send while a send job waits, an attempt is open or uncertain without a decision, for a superseded revision and for another user', async () => {
    const revisionId = await signed();
    expect((await postSend(revisionId, await sendBody(revisionId))).status).toBe(201);
    const waiting = await postSend(revisionId, await sendBody(revisionId, { reason: 'Synthetic second copy' }));
    expect(waiting.status).toBe(409);
    expect(waiting.body.error.code).toBe('delivery_in_progress');
    // An attempt left `preparing` by a runner that stopped before the network: still in progress.
    await runPdf();
    const job = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email'").pluck().get(revisionId) as string;
    t.db.prepare("UPDATE jobs SET state = 'intervention' WHERE id = ?").run(job);
    const attempt = randomUUID();
    t.db
      .prepare(
        `INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, channel, envelope_json, attachment_id, message_id, state, started_at, updated_at)
         VALUES (?, ?, ?, ?, 1, 'email', '{}', NULL, ?, 'preparing', '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
      )
      .run(attempt, job, t.userIds.employee, revisionId, `<${attempt}@timesheet.invalid>`);
    const open = await postSend(revisionId, await sendBody(revisionId, { reason: 'Synthetic second copy' }));
    expect(open.status).toBe(409);
    expect(open.body.error.code).toBe('delivery_in_progress');
    t.db.prepare("UPDATE delivery_attempts SET state = 'sending' WHERE id = ?").run(attempt);
    t.db.prepare("UPDATE delivery_attempts SET state = 'uncertain' WHERE id = ?").run(attempt);
    const uncertain = await postSend(revisionId, await sendBody(revisionId, { reason: 'Synthetic second copy' }));
    expect(uncertain.status).toBe(409);
    expect(uncertain.body.error.code).toBe('delivery_uncertain');
    // Another user's revision is not found, like a missing one; nothing is written.
    const admin = await t.login('admin');
    const before = writeState();
    expect((await postSend(revisionId, await sendBody(revisionId), admin)).status).toBe(404);
    expect((await t.request('GET', `/api/revisions/${revisionId}/send-draft`, { cookie: admin })).status).toBe(404);
    expect((await postSend(randomUUID(), await sendBody(revisionId))).status).toBe(404);
    expect(writeState()).toEqual(before);
    // A correction supersedes the revision: only the current one can be sent.
    t.db.prepare("UPDATE delivery_attempts SET decision = 'treat_as_accepted', decision_actor_user_id = ?, decided_at = '2026-09-29T20:05:00Z' WHERE id = ?").run(t.userIds.employee, attempt);
    await addSession('2026-09-16', '09:00', '18:00', 'Synthetic forgotten day');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    const correction = await t.request('POST', `/api/timesheets/${PAYROLL}/revisions`, {
      cookie: employee,
      body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true, reason: 'Synthetic added day', send_email: false },
    });
    expect(correction.status, JSON.stringify(correction.body)).toBe(201);
    const superseded = await postSend(revisionId, await sendBody(revisionId, { reason: 'Synthetic old copy' }));
    expect(superseded.status).toBe(409);
    expect(superseded.body.error.code).toBe('revision_superseded');
  });
});

describe('a send that still waits for an older revision (R-UX5B-1)', () => {
  it("blocks the correction's send until the older revision's job has run, and then the reason rule applies", async () => {
    const first = await signed();
    expect((await postSend(first, await sendBody(first))).status).toBe(201); // revision 1's send job waits
    await addSession('2026-09-16', '09:00', '18:00', 'Synthetic forgotten day');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    const correction = await t.request('POST', `/api/timesheets/${PAYROLL}/revisions`, {
      cookie: employee,
      body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true, reason: 'Synthetic added day', send_email: false },
    });
    expect(correction.status, JSON.stringify(correction.body)).toBe(201);
    const second = correction.body.revision.id as string;
    const before = writeState();
    const blocked = await postSend(second, await sendBody(second));
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.code).toBe('delivery_in_progress');
    expect(writeState()).toEqual(before);
    // The older send is delivered first; only then can the correction be sent, and that copy needs a reason.
    await runPdf();
    await runSend();
    expect(t.db.prepare("SELECT state FROM delivery_attempts WHERE revision_id = ?").pluck().all(first)).toEqual(['accepted']);
    const noReason = await postSend(second, await sendBody(second));
    expect(noReason.status).toBe(422);
    expect(noReason.body.error.code).toBe('reason_required');
    const sent = await postSend(second, await sendBody(second, { reason: 'Synthetic corrected copy' }));
    expect(sent.status, JSON.stringify(sent.body)).toBe(201);
  });
});

describe("the owner's reason rule (B-A2)", () => {
  /** Sends the revision once with the draft defaults and runs its job against `outbound`. */
  async function sendOnce(revisionId: string, outbound: OutboundAdapter, extra: Record<string, unknown> = {}) {
    const response = await postSend(revisionId, await sendBody(revisionId, extra));
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    await runPdf();
    await runSend(outbound);
    return response.body.send.id as string;
  }

  it('an accepted copy counts: another send needs a reason, stored on the send and in the audit, never in the email', async () => {
    const revisionId = await signed();
    await sendOnce(revisionId, createOutboundAdapter({ mode: 'capture' }, { dataDir }));
    const draft = await draftOf(revisionId);
    expect(draft).toMatchObject({ reason_required: true, copy_sent_before: { state: 'accepted', to: TO, cc: CC } });
    expect(draft.previous_send).toMatchObject({ send_no: 1, subject: draft.subject });
    const before = writeState();
    const refused = await postSend(revisionId, await sendBody(revisionId));
    expect(refused.status).toBe(422);
    expect(refused.body.error).toMatchObject({ code: 'reason_required', details: { copy_sent_before: { state: 'accepted' } } });
    expect(writeState()).toEqual(before);
    const reason = 'Payroll asked for the copy again';
    t.clock.advanceSeconds(60);
    const second = await sendOnce(revisionId, createOutboundAdapter({ mode: 'capture' }, { dataDir }), { reason });
    expect(t.db.prepare('SELECT send_no, reason FROM revision_sends WHERE id = ?').get(second)).toEqual({ send_no: 2, reason });
    expect(t.db.prepare("SELECT reason FROM audit_events WHERE operation = 'revision.send' ORDER BY rowid DESC LIMIT 1").pluck().get()).toBe(reason);
    const attempts = t.db.prepare("SELECT id FROM delivery_attempts WHERE revision_id = ? AND state = 'accepted' ORDER BY started_at").pluck().all(revisionId) as string[];
    expect(attempts).toHaveLength(2);
    // Quoted-printable breaks a long line ("Reason: Payroll asked for =" / "the copy again"), so join the soft breaks before
    // looking for the reason; a positive control proves the joined text is the message body (F-UX5B-5, mutant M11).
    const body = String(t.db.prepare('SELECT body_text FROM revision_sends WHERE id = ?').pluck().get(second));
    for (const attempt of attempts) {
      const message = readFileSync(join(captureFolder(dataDir, attempt), 'message.eml'), 'utf8').replace(/=\r?\n/g, '');
      expect(message).toContain(body.split('\n')[0] ?? '?');
      expect(message).not.toContain('asked for the copy again');
      expect(message).not.toMatch(/Reason:/i);
    }
  });

  it('an uncertain copy counts whatever was decided; a copy whose attempts all failed permanently does not', async () => {
    const revisionId = await signed();
    await sendOnce(revisionId, fixed({ kind: 'failed_permanent', code: 'smtp_envelope_rejected_permanent', providerResponse: '550' }));
    expect((await draftOf(revisionId)).reason_required).toBe(false);
    // Retrying a failed first send needs no reason.
    t.clock.advanceSeconds(60);
    await sendOnce(revisionId, fixed({ kind: 'uncertain', code: 'smtp_connection_lost_after_data', providerResponse: null }));
    const uncertain = t.db.prepare("SELECT id FROM delivery_attempts WHERE revision_id = ? AND state = 'uncertain'").pluck().get(revisionId) as string;
    const decided = await t.request('POST', `/api/deliveries/${uncertain}/decision`, { cookie: employee, body: { decision: 'mark_delivered' } });
    expect(decided.status).toBe(200);
    expect((await draftOf(revisionId)).copy_sent_before).toMatchObject({ state: 'uncertain' });
    const refused = await postSend(revisionId, await sendBody(revisionId));
    expect(refused.status).toBe(422);
    expect(refused.body.error.code).toBe('reason_required');
  });

  it('the resend decision on an uncertain attempt needs the reason too', async () => {
    const revisionId = await signed();
    await sendOnce(revisionId, fixed({ kind: 'uncertain', code: 'smtp_connection_lost_after_data', providerResponse: null }));
    const uncertain = t.db.prepare("SELECT id FROM delivery_attempts WHERE revision_id = ? AND state = 'uncertain'").pluck().get(revisionId) as string;
    const before = writeState();
    const refused = await t.request('POST', `/api/deliveries/${uncertain}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(refused.status).toBe(422);
    expect(refused.body.error.code).toBe('reason_required');
    expect(writeState()).toEqual(before);
    expect(t.db.prepare('SELECT decision FROM delivery_attempts WHERE id = ?').pluck().get(uncertain)).toBeNull();
    const accepted = await t.request('POST', `/api/deliveries/${uncertain}/decision`, { cookie: employee, body: { decision: 'resend', reason: 'It may not have arrived' } });
    expect(accepted.status, JSON.stringify(accepted.body)).toBe(201);
    expect(accepted.body.resend.send).toMatchObject({ send_no: 2, reason: 'It may not have arrived' });
  });

  it('counts a copy of the period across its revisions: a correction sent after an accepted copy needs a reason', async () => {
    const revisionId = await signed();
    await sendOnce(revisionId, createOutboundAdapter({ mode: 'capture' }, { dataDir }));
    await addSession('2026-09-16', '09:00', '18:00', 'Synthetic forgotten day');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    const correction = await t.request('POST', `/api/timesheets/${PAYROLL}/revisions`, {
      cookie: employee,
      body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true, reason: 'Synthetic added day', send_email: true },
    });
    expect(correction.status).toBe(201);
    const correctionId = correction.body.revision.id as string;
    expect((await draftOf(correctionId)).reason_required).toBe(true);
    expect((await postSend(correctionId, await sendBody(correctionId))).body.error.code).toBe('reason_required');
    expect((await postSend(correctionId, await sendBody(correctionId, { reason: 'Corrected copy' }))).status).toBe(201);
  });
});

describe('the PDF variants (F-3 b)', () => {
  async function pdf(path: string, cookie = employee) {
    const response = await t.request('GET', path, { cookie });
    return response;
  }

  async function bytesOf(path: string) {
    const response = await fetchRaw(path, employee);
    expect(response.status, path).toBe(200);
    return response.bytes;
  }

  it('renders each of the four variants on request, one page each, stores each once, and drops only the chosen rows', async () => {
    const revisionId = await signed();
    const byVariant = new Map<string, Buffer>();
    for (const [time, ot] of [['1', '1'], ['1', '0'], ['0', '1'], ['0', '0']] as const) {
      const bytes = await bytesOf(`/api/revisions/${revisionId}/pdf?time=${time}&ot=${ot}`);
      const printed = await readPdf(new Uint8Array(bytes));
      expect(printed.pages, `t${time}o${ot}`).toHaveLength(1);
      expect(['09:00', '18:00'].every((clock) => printed.pages[0]?.items.some((item) => item.text === clock)), `time rows t${time}o${ot}`).toBe(time === '1');
      expect(printed.text.includes('VERTIME'), `OT rows t${time}o${ot}`).toBe(ot === '1'); // the small-capitals total line
      // Every variant carries the same signed facts.
      expect(printed.text).toContain('Example Employee');
      byVariant.set(`t${time}o${ot}`, bytes);
    }
    expect(new Set([...byVariant.values()].map((bytes) => sha(bytes))).size).toBe(4);
    expect(t.db.prepare("SELECT variant FROM revision_files WHERE revision_id = ? AND state = 'ready' ORDER BY variant").pluck().all(revisionId)).toEqual(['t0o0', 't0o1', 't1o0', 't1o1']);
    const attachments = count("SELECT count(*) FROM attachments WHERE kind = 'pdf'");
    // Stored once: a second request returns the same bytes and writes nothing; the default needs no query.
    const files0 = writeState();
    expect((await bytesOf(`/api/revisions/${revisionId}/pdf?time=0&ot=1`)).equals(byVariant.get('t0o1') ?? Buffer.alloc(0))).toBe(true);
    expect((await bytesOf(`/api/revisions/${revisionId}/pdf`)).equals(byVariant.get('t1o1') ?? Buffer.alloc(0))).toBe(true);
    expect(writeState()).toEqual(files0);
    expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(attachments);
    // The sign-off's own PDF job then finds its variant ready and writes nothing new.
    await runPdf();
    expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(attachments);
    // Inline disposition for a preview; a bad query is refused.
    const inline = await fetchRaw(`/api/revisions/${revisionId}/pdf?time=1&ot=1&disposition=inline`, employee);
    expect(inline.headers.get('content-disposition')).toBe('inline; filename="timesheet-2026-10-02-r1.pdf"');
    expect((await pdf(`/api/revisions/${revisionId}/pdf?time=2`)).status).toBe(422);
    expect((await pdf(`/api/revisions/${revisionId}/pdf?disposition=download`)).status).toBe(422);
  });

  it('the unsigned preview renders the current review with the chosen rows and writes nothing', async () => {
    await saveSettings();
    await addSession('2026-09-15', '09:00', '18:00');
    const before = writeState();
    const preview = await fetchRaw(`/api/timesheets/${PAYROLL}/pdf-preview?time=0&ot=1`, employee);
    expect(preview.status).toBe(200);
    expect(preview.headers.get('cache-control')).toBe('no-store');
    expect(preview.headers.get('content-disposition')).toBe('inline; filename="timesheet-2026-10-02-preview.pdf"');
    const printed = await readPdf(new Uint8Array(preview.bytes));
    expect(printed.pages).toHaveLength(1);
    expect(printed.text).toContain('Preview, not signed');
    expect(printed.pages[0]?.items.some((item) => item.text === '09:00')).toBe(false);
    expect(printed.text).toContain('VERTIME'); // the OVERTIME TOTAL line in small capitals
    expect(printed.pages[0]?.images).toHaveLength(0);
    expect(writeState()).toEqual(before);
    expect(existsSync(dataDir) ? readdirSync(dataDir, { recursive: true }) : []).toEqual([]);
  });

  it('the shared PDF route ignores the variant query and never renders: the latest send\'s variant, else the sign-off variant', async () => {
    const revisionId = await signed();
    const password = randomBytes(18).toString('base64url');
    await createUser(t.db, t.clock, { email: 'grantee@example.invalid', displayName: 'Synthetic Grantee', role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
    const login = await t.request('POST', '/api/auth/login', { body: { email: 'grantee@example.invalid', password } });
    const grantee = login.headers.get('set-cookie')?.split(';')[0] ?? '';
    const granted = await t.request('POST', '/api/shares', { cookie: employee, body: { grantee_email: 'grantee@example.invalid', items: { timesheets: 'none', ot_read: false, pdf_download: true } } });
    expect(granted.status).toBe(201);
    const shared = (query: string) => fetchRaw(`/api/shared/${t.userIds.employee}/revisions/${revisionId}/pdf${query}`, grantee);

    // Before the PDF job ran: 409, and no file row, PDF or attachment is created by the grantee's request.
    const before = writeState();
    const pending = await shared('?time=0&ot=0');
    expect(pending.status).toBe(409);
    expect(writeState()).toEqual({ ...before, audit: before.audit });
    expect(count('SELECT count(*) FROM revision_files')).toBe(0);

    // After the sign-off PDF: the default variant, whatever the query says, and still nothing rendered for it.
    await runPdf();
    const stored = count("SELECT count(*) FROM attachments WHERE kind = 'pdf'");
    const plain = await shared('');
    const asked = await shared('?time=0&ot=0&disposition=inline');
    expect(plain.status).toBe(200);
    expect(asked.status).toBe(200);
    expect(asked.bytes.equals(plain.bytes)).toBe(true);
    expect(asked.headers.get('content-disposition')).toContain('attachment;');
    expect(count("SELECT count(*) FROM attachments WHERE kind = 'pdf'")).toBe(stored);
    expect(t.db.prepare('SELECT variant FROM revision_files WHERE revision_id = ?').pluck().all(revisionId)).toEqual(['t1o1']);

    // After a send without the time rows: the grantee gets that variant (once it is stored), not the query's.
    expect((await postSend(revisionId, await sendBody(revisionId, { time_rows: false }))).status).toBe(201);
    expect((await shared('?time=1&ot=1')).status).toBe(409);
    await runPdf();
    const sentVariant = await shared('?time=1&ot=1');
    expect(sentVariant.status).toBe(200);
    const owner = await fetchRaw(`/api/revisions/${revisionId}/pdf?time=0&ot=1`, employee);
    expect(sentVariant.bytes.equals(owner.bytes)).toBe(true);
    expect(sentVariant.bytes.equals(plain.bytes)).toBe(false);
    // The shared mount has no draft, send or preview route.
    expect((await t.request('GET', `/api/shared/${t.userIds.employee}/revisions/${revisionId}/send-draft`, { cookie: grantee })).status).toBe(404);
    expect((await t.request('POST', `/api/shared/${t.userIds.employee}/revisions/${revisionId}/send`, { cookie: grantee, body: await sendBody(revisionId) })).status).toBe(404);
    expect((await t.request('GET', `/api/shared/${t.userIds.employee}/timesheets/${PAYROLL}/pdf-preview`, { cookie: grantee })).status).toBe(404);
  });
});

describe('the send job builds the message from its own record', () => {
  it('sends the envelope, subject, body and PDF variant of the send, not the snapshot or the current Settings', async () => {
    const revisionId = await signed();
    const body = await sendBody(revisionId, {
      to: ['someone.else@example.invalid'],
      cc: [],
      subject: 'Synthetic edited subject',
      body_text: 'Synthetic edited body <b>kept as text</b>',
      time_rows: false,
      ot_rows: false,
    });
    const response = await postSend(revisionId, body);
    expect(response.status).toBe(201);
    // The send waits for its own variant: claimed before the PDF it retries without an attempt.
    expect(await runSend()).toMatchObject({ claimed: 1, retried: 1 });
    expect(count('SELECT count(*) FROM delivery_attempts')).toBe(0);
    await runPdf();
    await runPdf();
    t.clock.advanceSeconds(120);
    expect(await runSend()).toMatchObject({ claimed: 1, succeeded: 1 });
    const attempt = t.db.prepare('SELECT id, envelope_json, attachment_id FROM delivery_attempts WHERE revision_id = ?').get(revisionId) as { id: string; envelope_json: string; attachment_id: string };
    expect(JSON.parse(attempt.envelope_json)).toMatchObject({ send_id: response.body.send.id, to: ['someone.else@example.invalid'], cc: [], subject: 'Synthetic edited subject' });
    const variant = t.db.prepare('SELECT variant FROM revision_files WHERE attachment_id = ?').pluck().get(attempt.attachment_id);
    expect(variant).toBe('t0o0');
    const eml = readFileSync(join(captureFolder(dataDir, attempt.id), 'message.eml'), 'utf8');
    expect(eml).toMatch(/^To: someone\.else@example\.invalid$/m);
    expect(eml).not.toMatch(/^Cc:/m);
    expect(eml).toMatch(/^Subject: Synthetic edited subject$/m);
    expect(eml).toContain('&lt;b&gt;kept as text&lt;/b&gt;');
    const snapshot = JSON.parse(t.db.prepare('SELECT payload_json FROM timesheet_revisions WHERE id = ?').pluck().get(revisionId) as string);
    expect(eml).not.toContain(snapshot.recipients.subject);
    expect(eml).not.toContain('payroll@example.invalid');
    const attached = readFileSync(join(captureFolder(dataDir, attempt.id), 'attachment.pdf'));
    const printed = await readPdf(new Uint8Array(attached));
    expect(printed.pages).toHaveLength(1);
    expect(printed.pages[0]?.items.some((item) => item.text === '09:00')).toBe(false);
    expect(printed.text).not.toContain('VERTIME');
  });
});

describe('the deadline and automatic sends (F-2 a)', () => {
  async function setUpAutomation(autoSubmit: boolean) {
    await saveSettings({ auto_submit: autoSubmit });
    setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-09-29T21:00:00Z', reason: 'Synthetic activation' });
  }

  it('finalizes an eligible draft automatically and sends it through a send record with origin deadline', async () => {
    await setUpAutomation(true);
    await addSession('2026-09-15', '09:00', '18:00');
    t.clock.set('2026-09-30T06:00:00Z');
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ finalized: 1, sentSigned: 0 });
    const revision = t.db.prepare('SELECT id, origin, review_state FROM timesheet_revisions WHERE user_id = ?').get(t.userIds.employee) as { id: string; origin: string; review_state: string };
    expect(revision).toMatchObject({ origin: 'deadline', review_state: 'pending' });
    const send = t.db.prepare('SELECT origin, actor_user_id, reason, send_no, to_json, time_rows, ot_rows, pdf_variant FROM revision_sends WHERE revision_id = ?').all(revision.id);
    expect(send).toEqual([{ origin: 'deadline', actor_user_id: null, reason: null, send_no: 1, to_json: JSON.stringify(TO), time_rows: 1, ot_rows: 1, pdf_variant: 't1o1' }]);
    expect(t.db.prepare('SELECT kind FROM jobs WHERE revision_id = ? ORDER BY kind').pluck().all(revision.id)).toEqual(['render_pdf', 'send_email']);
  });

  it('sends a signed revision that was never sent when auto-submit is on, once, with no new revision or ledger change', async () => {
    await setUpAutomation(true);
    const revisionId = await (async () => {
      await addSession('2026-09-15', '09:00', '18:00');
      saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
      const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
      const response = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
        cookie: employee,
        body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true },
      });
      expect(response.status).toBe(201);
      return response.body.revision.id as string;
    })();
    const ledger = JSON.stringify(getBalance(t.db, t.userIds.employee));
    t.clock.set('2026-09-30T06:00:00Z');
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ finalized: 0, sentSigned: 1, overdueRecorded: 0 });
    expect(count('SELECT count(*) FROM timesheet_revisions')).toBe(1);
    expect(JSON.stringify(getBalance(t.db, t.userIds.employee))).toBe(ledger);
    expect(t.db.prepare('SELECT origin, actor_user_id, reason, request_key FROM revision_sends WHERE revision_id = ?').all(revisionId)).toEqual([
      { origin: 'deadline', actor_user_id: null, reason: null, request_key: `deadline:${revisionId}` },
    ]);
    const audit = t.db.prepare("SELECT actor_user_id, after_json FROM audit_events WHERE operation = 'deadline.send_signed'").all() as Array<{ actor_user_id: string | null; after_json: string }>;
    expect(audit).toHaveLength(1);
    expect(audit[0]?.actor_user_id).toBeNull();
    expect(audit[0]?.after_json).not.toContain('example.invalid');
    // The next scans leave the sent period alone.
    t.clock.advanceSeconds(3600);
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ sentSigned: 0 });
    expect(count('SELECT count(*) FROM revision_sends')).toBe(1);
  });

  it('records a signed revision that was never sent as overdue when auto-submit is off, and sends nothing', async () => {
    await setUpAutomation(false);
    await addSession('2026-09-15', '09:00', '18:00');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    const response = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
      cookie: employee,
      body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, incomplete_evidence_acknowledged: true },
    });
    expect(response.status).toBe(201);
    t.clock.set('2026-09-30T06:00:00Z');
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ finalized: 0, sentSigned: 0, overdueRecorded: 1 });
    expect(count('SELECT count(*) FROM revision_sends')).toBe(0);
    expect(listOverdueRecords(t.db, t.userIds.employee)).toEqual([expect.objectContaining({ payrollDate: PAYROLL, reason: 'auto_submit_off' })]);
    // Once is enough: a later scan records nothing more.
    t.clock.advanceSeconds(3600);
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ overdueRecorded: 0, sentSigned: 0 });
  });
});

describe('two concurrent sends (separate connections, released together)', () => {
  let pool: RacePool;

  beforeAll(async () => {
    pool = await RacePool.start(2);
  });

  afterAll(async () => {
    await pool.close();
  });

  async function sendInput(revisionId: string, reason?: string) {
    const draft = await draftOf(revisionId);
    return {
      requestKey: randomUUID(),
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject,
      bodyText: draft.body_text,
      timeRows: draft.time_rows,
      otRows: draft.ot_rows,
      ...(reason === undefined ? {} : { reason }),
    };
  }

  const label = (outcome: { ok: boolean; status: string; code?: string }) => (outcome.ok ? outcome.status : (outcome.code ?? 'error'));

  it('lets exactly one of two sends through, and neither skips the reason rule once a copy counts', async () => {
    const revisionId = await signed();
    const userId = t.userIds.employee;
    const race = async (reasons: [string | undefined, string | undefined]) => {
      const ops = await Promise.all(reasons.map(async (reason) => ({ kind: 'send' as const, input: { userId, revisionId, input: await sendInput(revisionId, reason) } })));
      return pool.race(t.config.databasePath, t.clock.now().toISOString(), ops);
    };

    // No copy yet: one send is created, the other finds its job waiting.
    const first = await race([undefined, undefined]);
    expect(first.map(label).sort()).toEqual(['created', 'delivery_in_progress']);
    expect(count('SELECT count(*) FROM revision_sends')).toBe(1);
    await runPdf();
    await runSend();
    expect(count("SELECT count(*) FROM delivery_attempts WHERE state = 'accepted'")).toBe(1);

    // The copy counts now: two sends without a reason both meet the rule inside their transactions.
    const unreasoned = await race([undefined, undefined]);
    expect(unreasoned.map(label)).toEqual(['reason_required', 'reason_required']);
    expect(count('SELECT count(*) FROM revision_sends')).toBe(1);

    // With reasons: still exactly one more send.
    const reasoned = await race(['Synthetic copy for payroll', 'Synthetic copy for the manager']);
    expect(reasoned.map(label).sort()).toEqual(['created', 'delivery_in_progress']);
    expect(t.db.prepare('SELECT send_no, reason IS NOT NULL AS reasoned FROM revision_sends ORDER BY send_no').all()).toEqual([
      { send_no: 1, reasoned: 0 },
      { send_no: 2, reasoned: 1 },
    ]);
    console.info(`[race] two sends: overlapping call windows ${[first, unreasoned, reasoned].filter((outcomes) => callWindowsOverlap(outcomes)).length}/3`);
  });
});

/** A raw request through the application (status, headers and the exact bytes). */
async function fetchRaw(path: string, cookie: string): Promise<{ status: number; headers: Headers; bytes: Buffer }> {
  const app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
  const response = await app.request(path, { method: 'GET', headers: { origin: ORIGIN, cookie } });
  return { status: response.status, headers: response.headers, bytes: Buffer.from(await response.arrayBuffer()) };
}
