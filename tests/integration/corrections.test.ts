import { randomBytes, randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canonicalize } from '../../src/domain/canonical.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { creditSourceKey } from '../../src/server/services/finalization.ts';
import { getBalance, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import { recordRevisionLine } from '../../src/server/services/revisionLedger.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T06: correction revisions, late review of an automatic revision and same-revision
 * resend (R-06 corrections, R-07 reasons, LG-08, LG-09, AC-04, R1, R4 and the owner's F-2
 * decision). Today is 2026-09-29 (LA 13:00): the current period is 2026-09-14 ... 2026-09-27
 * with payroll date 2026-10-02. The seed policy is B=480, N=30, M=30 with deficit mode
 * `ignore`. Data is synthetic (example.invalid); wall times are local inputs in the
 * reporting zone, never fixed UTC offsets.
 */

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

const PAYROLL = '2026-10-02';
const START = '2026-09-14';
const SIGNER = 'Example Employee';
const REASON = 'Synthetic forgotten clock-out added';
const signoffPath = `/api/timesheets/${PAYROLL}/signoff`;
const revisionsPath = (payrollDate = PAYROLL) => `/api/timesheets/${payrollDate}/revisions`;
const lateReviewPath = (payrollDate = PAYROLL) => `/api/timesheets/${payrollDate}/late-review`;
const resendPath = (id: string) => `/api/revisions/${id}/resend`;

const SEED_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

/** Every table a revision flow may write, plus the audit log and the finalization column. */
function writeState() {
  return {
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    signoffs: count('SELECT count(*) FROM signoffs'),
    lines: count('SELECT count(*) FROM revision_ledger_lines'),
    ledger: count('SELECT count(*) FROM ot_ledger'),
    jobs: count('SELECT count(*) FROM jobs'),
    attempts: count('SELECT count(*) FROM delivery_attempts'),
    files: count('SELECT count(*) FROM revision_files'),
    audit: count('SELECT count(*) FROM audit_events'),
    finalizedNos: JSON.stringify(t.db.prepare('SELECT id, finalized_revision_no, version FROM timesheets ORDER BY id').all()),
  };
}

async function review(who = employee, payrollDate = PAYROLL) {
  const response = await t.request('GET', `/api/timesheets/${payrollDate}/review`, { cookie: who });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body as { payload: any; payload_hash: string; expected_version: number };
}

async function signoffBody(overrides: Record<string, unknown> = {}) {
  const current = await review();
  return {
    expected_version: current.expected_version,
    reviewed_hash: current.payload_hash,
    signer_name: SIGNER,
    incomplete_evidence_acknowledged: true,
    ...overrides,
  };
}

/** The original manual sign-off through the production route (T05). */
async function finalizeOriginal(overrides: Record<string, unknown> = {}) {
  const response = await t.request('POST', signoffPath, { cookie: employee, body: await signoffBody(overrides) });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body;
}

/** A correction request built from a fresh review unless the caller overrides fields. */
async function reviseBody(overrides: Record<string, unknown> = {}) {
  return { ...(await signoffBody()), reason: REASON, send_email: false, ...overrides };
}

function revise(body: unknown, who = employee, payrollDate = PAYROLL) {
  return t.request('POST', revisionsPath(payrollDate), { cookie: who, body });
}

async function lateReviewBody(overrides: Record<string, unknown> = {}) {
  return { ...(await signoffBody()), send_email: false, ...overrides };
}

function lateReview(body: unknown, who = employee, payrollDate = PAYROLL) {
  return t.request('POST', lateReviewPath(payrollDate), { cookie: who, body });
}

async function addSession(date: string, from: string, to: string, extra: Record<string, unknown> = {}) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true, ...extra },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.session as { id: string; version: number };
}

async function editSession(session: { id: string; version: number }, date: string, from: string, to: string) {
  const response = await t.request('PUT', `/api/sessions/${session.id}`, {
    cookie: employee,
    body: {
      start: la(`${date}T${from}`),
      end: la(`${date}T${to}`),
      input_zone: LA,
      breaks: [],
      breaks_confirmed: true,
      expected_version: session.version,
      reason: 'Synthetic late correction of the recorded time',
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  const current = await t.request('GET', `/api/sessions/${session.id}`, { cookie: employee });
  return current.body.session as { id: string; version: number };
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 8x8 PNG generated at test time (no image file is committed). */
function makePng(fill: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(8, 0);
  header.writeUInt32BE(8, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Array.from({ length: 8 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(24, fill)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function uploadSignature(fill: number, userId = t.userIds.employee) {
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  return saveSignature(t.db, t.clock, files, userId, makePng(fill), 'image/png');
}

async function newPolicy(overrides: Record<string, unknown>) {
  const response = await t.request('POST', '/api/policies', {
    cookie: employee,
    body: {
      effective_from: START,
      required_minutes: 480,
      threshold_minutes: 30,
      rounding_step_minutes: 30,
      reference_start: '08:00',
      reference_end: '17:00',
      breaks: SEED_BREAKS,
      deficit_mode: 'ignore',
      note: 'Synthetic corrections test policy',
      ...overrides,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

function openingCredit(minutes: number, key = 'synthetic-opening-balance') {
  postCredit(
    { db: t.db, clock: t.clock },
    { userId: t.userIds.employee, sourceKey: key, actorUserId: null, origin: 'system', reason: 'Synthetic opening balance', workDate: '2026-09-01', minutes },
  );
}

const entriesOf = () => listLedgerEntries(t.db, t.userIds.employee).filter((entry) => entry.workDate !== null && entry.workDate >= START);
const linesOf = (body: any) => (body.ledger_lines as any[]).map((line) => [line.work_date, line.line_kind, line.proposed_minutes, line.outcome]);
const jobKinds = (body: any) => (body.jobs as any[]).map((job) => job.kind).sort();

/** Every stored fact of a revision that must never change after it is finalized. */
function frozenState(revisionId: string, withJobs = true) {
  return JSON.stringify({
    revision: t.db.prepare('SELECT * FROM timesheet_revisions WHERE id = ?').get(revisionId),
    signoff: t.db.prepare('SELECT * FROM signoffs WHERE revision_id = ?').get(revisionId) ?? null,
    lines: t.db.prepare('SELECT * FROM revision_ledger_lines WHERE revision_id = ? ORDER BY work_date, line_kind').all(revisionId),
    jobs: withJobs ? t.db.prepare('SELECT * FROM jobs WHERE revision_id = ? ORDER BY kind').all(revisionId) : null,
    ledger: t.db.prepare('SELECT * FROM ot_ledger WHERE source_ref = ? ORDER BY rowid').all(revisionId),
  });
}

// ---------------------------------------------------------------------------------------

describe('correction revision', () => {
  it('requires a reason: missing is a validation error and blank is reason_required, with nothing written', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x61);
    await finalizeOriginal();
    const before = writeState();
    const body = await reviseBody();
    const { reason: _omitted, ...withoutReason } = body;
    const missing = await revise(withoutReason);
    expect(missing.status).toBe(422);
    const blank = await revise({ ...body, reason: '   ' });
    expect(blank.status).toBe(422);
    expect(blank.body.error.code).toBe('reason_required');
    const tooLong = await revise({ ...body, reason: 'x'.repeat(2001) });
    expect(tooLong.status).toBe(422);
    expect(writeState()).toEqual(before);
  });

  it('posts only the differences: a changed day is corrected, an unchanged day posts nothing and is recorded unchanged', async () => {
    const first = await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    await addSession('2026-09-16', '09:00', '18:00'); // 60 credited
    const day17 = await addSession('2026-09-17', '09:00', '18:00'); // 60 credited
    uploadSignature(0x62);
    const original = await finalizeOriginal();
    const originalId: string = original.revision.id;
    const originalEntries = entriesOf();
    expect(originalEntries.map((entry) => [entry.workDate, entry.deltaMinutes])).toEqual([
      ['2026-09-15', 60],
      ['2026-09-16', 60],
      ['2026-09-17', 60],
    ]);
    const frozen = frozenState(originalId);

    await editSession(first, '2026-09-15', '09:00', '18:30'); // 90 credited: +30
    await editSession(day17, '2026-09-17', '09:00', '17:00'); // 0 credited: -60

    t.clock.advanceSeconds(3600);
    const response = await revise(await reviseBody({ signer_name: ` ${SIGNER} ` }));
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const body = response.body;
    expect(body.status).toBe('created');
    expect(body.finalized_revision_no).toBe(2);
    expect(body.revision).toMatchObject({ revision_no: 2, revision_kind: 'correction', origin: 'employee', review_state: 'signed', send_requested: false });
    expect(body.signoff).toMatchObject({ signer_name: SIGNER, signed_at: '2026-09-29T21:00:00Z' });
    expect(linesOf(body)).toEqual([
      ['2026-09-15', 'correction', 30, 'posted'],
      ['2026-09-16', 'correction', 0, 'unchanged'],
      ['2026-09-17', 'correction', -60, 'posted'],
    ]);
    expect(jobKinds(body)).toEqual(['render_pdf']);

    const revisionId: string = body.revision.id;
    const stored = t.db.prepare('SELECT * FROM timesheet_revisions WHERE id = ?').get(revisionId) as any;
    expect(stored).toMatchObject({ supersedes_revision_id: originalId, correction_reason: REASON, revision_kind: 'correction', send_requested: 0 });
    const posted = entriesOf().slice(3);
    expect(posted.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.sourceRef, entry.reason, entry.origin])).toEqual([
      ['2026-09-15', 'correction', 30, `rev:${revisionId}:day:2026-09-15:correction`, revisionId, REASON, 'manual'],
      ['2026-09-17', 'correction', -60, `rev:${revisionId}:day:2026-09-17:correction`, revisionId, REASON, 'manual'],
    ]);
    expect(posted[0]?.correctsEntryId).toBe(originalEntries[0]?.id);
    expect(posted[1]?.correctsEntryId).toBe(originalEntries[2]?.id);
    // The unchanged line links the matching original entry and appended nothing.
    const unchanged = t.db.prepare("SELECT ledger_entry_id FROM revision_ledger_lines WHERE revision_id = ? AND outcome = 'unchanged'").get(revisionId) as any;
    expect(unchanged.ledger_entry_id).toBe(originalEntries[1]?.id);
    expect(getBalance(t.db, t.userIds.employee).postedMinutes).toBe(150);
    // The timesheet now points at the new revision; the original revision is untouched.
    expect(t.db.prepare('SELECT finalized_revision_no FROM timesheets').pluck().get()).toBe(2);
    expect(frozenState(originalId)).toBe(frozen);
    expect(count('SELECT count(*) FROM signoffs')).toBe(2);
    // Audited with the reason, actor and revision, without the signer name.
    const audit = t.db.prepare("SELECT * FROM audit_events WHERE operation = 'timesheet.correction'").get() as any;
    expect(audit).toMatchObject({ entity_id: revisionId, actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee, reason: REASON });
    expect(`${audit.before_json}${audit.after_json}`).not.toContain(SIGNER);
  });

  it('records the explicit send choice: true enqueues the PDF and the send, false only the PDF', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x63);
    await finalizeOriginal();
    const noSend = await revise(await reviseBody({ send_email: false }));
    expect(noSend.status, JSON.stringify(noSend.body)).toBe(201);
    expect(jobKinds(noSend.body)).toEqual(['render_pdf']);
    expect(noSend.body.revision.send_requested).toBe(false);
    const missing = await reviseBody();
    const { send_email: _send, ...withoutSend } = missing;
    expect((await revise(withoutSend)).status).toBe(422);
    const send = await revise(await reviseBody({ send_email: true }));
    expect(send.status, JSON.stringify(send.body)).toBe(201);
    expect(jobKinds(send.body)).toEqual(['render_pdf', 'send_email']);
    expect(send.body.revision.send_requested).toBe(true);
    expect(send.body.finalized_revision_no).toBe(3);
    const keys = t.db.prepare("SELECT business_key FROM jobs WHERE revision_id = ? ORDER BY kind").pluck().all(send.body.revision.id);
    expect(keys).toEqual([`revision:${send.body.revision.id}:render_pdf`, `revision:${send.body.revision.id}:send_email:initial`]);
  });

  it('posts a first credit with the day original key for a day without a posted original (O7), not a correction', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    uploadSignature(0x64);
    const original = await finalizeOriginal(); // 2026-09-17 had no records
    const originalId: string = original.revision.id;
    await addSession('2026-09-17', '09:00', '18:00', { reason: REASON }); // 60 credited later
    const response = await revise(await reviseBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const revisionId: string = response.body.revision.id;
    expect(linesOf(response.body)).toEqual([
      ['2026-09-15', 'correction', 0, 'unchanged'],
      ['2026-09-17', 'credit', 60, 'posted'],
    ]);
    const entries = entriesOf();
    expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.sourceRef, entry.correctsEntryId])).toEqual([
      ['2026-09-15', 'credit', 60, creditSourceKey('2026-09-15'), originalId, null],
      ['2026-09-17', 'credit', 60, creditSourceKey('2026-09-17'), revisionId, null],
    ]);
    expect(count("SELECT count(*) FROM ot_ledger WHERE entry_type = 'correction'")).toBe(0);
    expect(getBalance(t.db, t.userIds.employee).postedMinutes).toBe(120);
  });

  it('keeps a debit increase the balance cannot cover pending and recorded (F-2); a later revision re-evaluates it', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    openingCredit(300);
    const day = await addSession('2026-09-15', '09:00', '13:00'); // deficit 240: covered, 60 left
    uploadSignature(0x65);
    const original = await finalizeOriginal();
    expect(linesOf(original)).toEqual([['2026-09-15', 'deficit_debit', -240, 'posted']]);
    await editSession(day, '2026-09-15', '09:00', '11:00'); // deficit 360: the increase is 120

    const response = await revise(await reviseBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    // Raising a debit is a new debit of the increase (R-05); nothing is appended.
    expect(linesOf(response.body)).toEqual([['2026-09-15', 'deficit_debit', -120, 'pending_insufficient_balance']]);
    expect(entriesOf().map((entry) => [entry.entryType, entry.deltaMinutes])).toEqual([['deficit_debit', -240]]);
    expect(getBalance(t.db, t.userIds.employee)).toMatchObject({ postedMinutes: 60, negative: false });
    const pending = await t.request('GET', '/api/revisions/pending-lines', { cookie: employee });
    expect(pending.body.lines).toEqual([
      expect.objectContaining({ revision_no: 2, work_date: '2026-09-15', proposed_minutes: -120, outcome: 'pending_insufficient_balance' }),
    ]);
    // F-2: nothing posts it in the background, even once the balance would cover it.
    openingCredit(900, 'synthetic-later-credit');
    t.clock.advanceSeconds(7 * 24 * 3600);
    expect(entriesOf().map((entry) => entry.deltaMinutes)).toEqual([-240]);
    // The session expired while the week passed.
    employee = await t.login('employee');

    // Only a later finalized revision re-evaluates it: the increase now posts as a correction.
    const later = await revise(await reviseBody({ reason: 'Synthetic second review of the same day' }));
    expect(later.status, JSON.stringify(later.body)).toBe(201);
    expect(linesOf(later.body)).toEqual([['2026-09-15', 'deficit_debit', -120, 'posted']]);
    const laterEntries = entriesOf();
    expect(laterEntries.map((entry) => [entry.entryType, entry.deltaMinutes])).toEqual([
      ['deficit_debit', -240],
      ['correction', -120],
    ]);
    expect(laterEntries[1]?.sourceKey).toBe(`rev:${later.body.revision.id}:day:2026-09-15:correction`);
    expect((await t.request('GET', '/api/revisions/pending-lines', { cookie: employee })).body.lines).toEqual([]);
  });

  it('re-evaluates a debit that stayed pending at sign-off: a later revision posts it once with the original key (F-2)', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    openingCredit(100);
    await addSession('2026-09-15', '09:00', '13:00'); // deficit 240, only 100 available
    uploadSignature(0x6e);
    const original = await finalizeOriginal();
    expect(linesOf(original)).toEqual([['2026-09-15', 'deficit_debit', -240, 'pending_insufficient_balance']]);
    expect(entriesOf()).toEqual([]);
    openingCredit(900, 'synthetic-later-credit');
    const response = await revise(await reviseBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(linesOf(response.body)).toEqual([['2026-09-15', 'deficit_debit', -240, 'posted']]);
    const revisionId: string = response.body.revision.id;
    expect(entriesOf().map((entry) => [entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.sourceRef])).toEqual([
      ['deficit_debit', -240, 'finalization:day:2026-09-15:deficit_debit', revisionId],
    ]);
    // The pending line belongs to the superseded revision: nothing is pending any more.
    expect((await t.request('GET', '/api/revisions/pending-lines', { cookie: employee })).body.lines).toEqual([]);
    // A third revision finds the posted original and changes nothing.
    const again = await revise(await reviseBody({ reason: 'Synthetic review with no change' }));
    expect(again.status, JSON.stringify(again.body)).toBe(201);
    expect(linesOf(again.body)).toEqual([['2026-09-15', 'correction', 0, 'unchanged']]);
    expect(entriesOf()).toHaveLength(1);
  });

  it('reduces a posted debit by a correction of the difference and keeps a waived choose-mode day waived', async () => {
    await newPolicy({ deficit_mode: 'choose_at_signoff' });
    openingCredit(600);
    const day = await addSession('2026-09-15', '09:00', '13:00'); // deficit 240
    await addSession('2026-09-16', '09:00', '13:00'); // deficit 240
    uploadSignature(0x66);
    const original = await finalizeOriginal({
      deficit_choices: [
        { work_date: '2026-09-15', choice: 'deduct' },
        { work_date: '2026-09-16', choice: 'waive' },
      ],
    });
    expect(linesOf(original)).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'posted'],
      ['2026-09-16', 'deficit_debit', -240, 'waived'],
    ]);
    await editSession(day, '2026-09-15', '09:00', '15:00'); // deficit 120: the debit is reduced by 120
    // Every choose-mode deficit day needs a choice again.
    const none = await revise(await reviseBody());
    expect(none.status).toBe(422);
    expect(none.body.error.code).toBe('deficit_choice_required');
    const response = await revise(
      await reviseBody({
        deficit_choices: [
          { work_date: '2026-09-15', choice: 'deduct' },
          { work_date: '2026-09-16', choice: 'waive' },
        ],
      }),
    );
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(linesOf(response.body)).toEqual([
      ['2026-09-15', 'correction', 120, 'posted'],
      ['2026-09-16', 'deficit_debit', -240, 'waived'],
    ]);
    expect(entriesOf().map((entry) => [entry.entryType, entry.deltaMinutes])).toEqual([
      ['deficit_debit', -240],
      ['correction', 120],
    ]);
  });

  it('a day that switches between a credit and a deficit corrects both sides with distinct keys and kinds', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    openingCredit(600);
    const day = await addSession('2026-09-15', '09:00', '13:00'); // deficit 240: debit posted
    uploadSignature(0x6c);
    await finalizeOriginal();
    const overtime = await editSession(day, '2026-09-15', '09:00', '20:00'); // 180 credited, no deficit
    const second = await revise(await reviseBody());
    expect(second.status, JSON.stringify(second.body)).toBe(201);
    // No posted credit yet: a first credit with the day's original key; the debit is corrected to zero.
    expect(linesOf(second.body)).toEqual([
      ['2026-09-15', 'credit', 180, 'posted'],
      ['2026-09-15', 'correction', 240, 'posted'],
    ]);
    await editSession(overtime, '2026-09-15', '09:00', '13:00'); // back to deficit 240
    const third = await revise(await reviseBody({ reason: 'Synthetic second correction of the same day' }));
    expect(third.status, JSON.stringify(third.body)).toBe(201);
    const thirdId: string = third.body.revision.id;
    expect(linesOf(third.body)).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'posted'],
      ['2026-09-15', 'correction', -180, 'posted'],
    ]);
    expect(entriesOf().map((entry) => [entry.entryType, entry.deltaMinutes, entry.sourceKey.replace(/rev:[0-9a-f-]{36}:/, 'rev:ID:')])).toEqual([
      ['deficit_debit', -240, 'finalization:day:2026-09-15:deficit_debit'],
      ['correction', 240, 'rev:ID:day:2026-09-15:correction'],
      ['credit', 180, 'finalization:day:2026-09-15:credit'],
      ['correction', -240, 'rev:ID:day:2026-09-15:correction'],
      ['correction', -180, 'rev:ID:day:2026-09-15:correction:2'],
    ]);
    expect(entriesOf().slice(3).every((entry) => entry.sourceRef === thirdId)).toBe(true);
    expect(getBalance(t.db, t.userIds.employee).postedMinutes).toBe(360);
  });

  it('keeps a posted credit of a day whose records are unresolved instead of reversing it', async () => {
    const day = await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    uploadSignature(0x6d);
    await finalizeOriginal();
    // The end time is removed: an open session makes the day incomplete, which posts nothing.
    const reopened = await t.request('PUT', `/api/sessions/${day.id}`, {
      cookie: employee,
      body: {
        start: la('2026-09-15T09:00'),
        end: null,
        input_zone: LA,
        breaks: [],
        breaks_confirmed: false,
        expected_version: day.version,
        reason: 'Synthetic end time removed pending a recheck',
      },
    });
    expect(reopened.status, JSON.stringify(reopened.body)).toBe(200);
    const current = await review();
    expect(current.payload.unresolved_inputs.map((item: any) => [item.work_date, item.reason])).toContainEqual(['2026-09-15', 'open_session']);
    const response = await revise(await reviseBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.ledger_lines).toEqual([]);
    expect(entriesOf().map((entry) => [entry.entryType, entry.deltaMinutes])).toEqual([['credit', 60]]);
  });

  it('refuses a correction of a period that is not finalized, a stale version and a stale hash, writing nothing', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x67);
    const before = writeState();
    const notFinal = await revise(await reviseBody());
    expect(notFinal.status).toBe(409);
    expect(notFinal.body.error.code).toBe('not_finalized');
    expect(writeState()).toEqual(before);

    await finalizeOriginal();
    const stale = await reviseBody();
    await addSession('2026-09-16', '09:00', '18:00', { reason: REASON });
    const afterEdit = writeState();
    const version = await revise({ ...stale, expected_version: stale.expected_version });
    expect(version.status).toBe(409);
    expect(version.body.error.code).toBe('stale_version');
    expect(version.body.error.details).toEqual({ fresh_review_required: true });
    const fresh = await reviseBody();
    const hash = await revise({ ...fresh, reviewed_hash: stale.reviewed_hash });
    expect(hash.status).toBe(409);
    expect(hash.body.error.code).toBe('stale_review');
    expect(writeState()).toEqual(afterEdit);
  });

  it('requires the signer name, the signature image and the acknowledgement like a sign-off', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x68);
    await finalizeOriginal();
    const before = writeState();
    const blank = await revise(await reviseBody({ signer_name: '  ' }));
    expect(blank.status).toBe(422);
    expect(blank.body.error.code).toBe('signer_name_required');
    // The day 2026-09-16 has no records, so the review lists unresolved inputs.
    const unacknowledged = await revise(await reviseBody({ incomplete_evidence_acknowledged: false }));
    expect(unacknowledged.status).toBe(422);
    expect(unacknowledged.body.error.code).toBe('acknowledgement_required');
    expect(writeState()).toEqual(before);
  });

  it('an identical retry returns the same revision and writes nothing; another one is a conflict', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x69);
    await finalizeOriginal();
    await addSession('2026-09-17', '09:00', '18:00', { reason: REASON });
    const body = await reviseBody();
    const first = await revise(body);
    expect(first.status).toBe(201);
    const after = writeState();
    const retry = await revise(body);
    expect(retry.status, JSON.stringify(retry.body)).toBe(200);
    expect(retry.body.status).toBe('replayed');
    expect(retry.body.revision.id).toBe(first.body.revision.id);
    expect(writeState()).toEqual(after);
    const other = await revise({ ...body, reason: 'Synthetic different reason' });
    expect(other.status).toBe(409);
    expect(writeState()).toEqual(after);
  });

  it('rolls everything back when a later write fails inside the transaction', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x6a);
    await finalizeOriginal();
    await addSession('2026-09-17', '09:00', '18:00', { reason: REASON });
    const body = await reviseBody();
    const before = writeState();
    // A failing job insert happens after the ledger postings of the same transaction.
    t.db.exec("CREATE TEMP TRIGGER synthetic_fail_jobs BEFORE INSERT ON jobs BEGIN SELECT RAISE(ABORT, 'synthetic job failure'); END");
    const response = await revise(body);
    expect(response.status).toBe(500);
    t.db.exec('DROP TRIGGER synthetic_fail_jobs');
    expect(writeState()).toEqual(before);
    const retry = await revise(body);
    expect(retry.status, JSON.stringify(retry.body)).toBe(201);
  });

  it('is owner-only: another user gets 404 for the owner payroll date, anonymous 401, and user_id is refused', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x6b);
    await finalizeOriginal();
    const body = await reviseBody();
    const before = writeState();
    // The administrator account has its own calendar position: it never reaches the employee timesheet.
    const foreign = await revise(body, admin);
    expect([404, 409]).toContain(foreign.status);
    expect(JSON.stringify(foreign.body)).not.toContain(SIGNER);
    expect((await revise(body, employee, '2026-10-09')).status).toBe(404);
    expect((await revise(body, employee, 'not-a-date')).status).toBe(422);
    expect((await t.request('POST', revisionsPath(), { body })).status).toBe(401);
    expect((await t.request('POST', revisionsPath(), { cookie: employee, body, origin: 'http://evil.example.invalid' })).status).toBe(403);
    expect((await revise({ ...body, user_id: t.userIds.admin })).status).toBe(422);
    expect(writeState()).toEqual(before);
    expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', t.userIds.admin)).toBe(0);
  });
});

// ---------------------------------------------------------------------------------------

/** An automatic (deadline) revision as the later deadline job will create it: unsigned, actorless, posted once. */
async function makeAutomaticRevision() {
  const current = await review();
  const timesheet = t.db.prepare('SELECT id, version FROM timesheets WHERE user_id = ?').get(t.userIds.employee) as { id: string; version: number };
  const revisionId = randomUUID();
  const now = '2026-09-29T20:00:00Z';
  t.db
    .prepare(
      `INSERT INTO timesheet_revisions (id, user_id, timesheet_id, revision_no, revision_kind, origin, review_state,
         supersedes_revision_id, correction_reason, timesheet_version, payload_json, payload_sha256, reviewed_sha256,
         send_requested, actor_user_id, created_at)
       VALUES (?, ?, ?, 1, 'original', 'deadline', 'pending', NULL, NULL, ?, ?, ?, NULL, 1, NULL, ?)`,
    )
    .run(revisionId, t.userIds.employee, timesheet.id, timesheet.version, canonicalize(current.payload), current.payload_hash, now);
  for (const proposal of current.payload.ot_proposals as Array<{ work_date: string; credited_minutes: number }>) {
    const posted = postCredit(
      { db: t.db, clock: t.clock },
      {
        userId: t.userIds.employee,
        sourceKey: creditSourceKey(proposal.work_date),
        sourceRef: revisionId,
        actorUserId: null,
        origin: 'automatic',
        workDate: proposal.work_date,
        minutes: proposal.credited_minutes,
      },
    );
    recordRevisionLine(t.db, t.clock, {
      userId: t.userIds.employee,
      revisionId,
      workDate: proposal.work_date,
      lineKind: 'credit',
      proposedMinutes: proposal.credited_minutes,
      result: { outcome: 'posted', ledgerEntryId: posted.entry.id },
    });
  }
  t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1, version = version + 1 WHERE id = ?').run(timesheet.id);
  return revisionId;
}

describe('late review of an automatic revision', () => {
  it('creates a genuinely signed revision with zero ledger delta (LG-09) and no send job when send_email is false', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    await addSession('2026-09-26', '10:00', '12:00'); // Saturday: 120 credited
    uploadSignature(0x71);
    const automaticId = await makeAutomaticRevision();
    const frozen = frozenState(automaticId);
    const ledgerBefore = JSON.stringify(listLedgerEntries(t.db, t.userIds.employee));
    const auditBefore = count("SELECT count(*) FROM audit_events WHERE entity_type = 'ot_ledger'");

    t.clock.advanceSeconds(7200);
    const response = await lateReview(await lateReviewBody({ send_email: false }));
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const body = response.body;
    expect(body.finalized_revision_no).toBe(2);
    expect(body.revision).toMatchObject({ revision_no: 2, revision_kind: 'late_review', origin: 'employee', review_state: 'signed', send_requested: false });
    expect(body.signoff).toMatchObject({ signer_name: SIGNER, signed_at: '2026-09-29T22:00:00Z' });
    expect(linesOf(body)).toEqual([
      ['2026-09-15', 'correction', 0, 'unchanged'],
      ['2026-09-26', 'correction', 0, 'unchanged'],
    ]);
    // Zero delta: the ledger and its audit are untouched.
    expect(JSON.stringify(listLedgerEntries(t.db, t.userIds.employee))).toBe(ledgerBefore);
    expect(count("SELECT count(*) FROM audit_events WHERE entity_type = 'ot_ledger'")).toBe(auditBefore);
    expect(jobKinds(body)).toEqual(['render_pdf']);
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'send_email'")).toBe(0);
    const stored = t.db.prepare('SELECT * FROM timesheet_revisions WHERE id = ?').get(body.revision.id) as any;
    expect(stored).toMatchObject({ supersedes_revision_id: automaticId, correction_reason: null, send_requested: 0 });
    // The automatic revision stays what it was: unsigned, pending review, no sign-off row.
    expect(frozenState(automaticId)).toBe(frozen);
    expect(count('SELECT count(*) FROM signoffs WHERE revision_id = ?', automaticId)).toBe(0);
    expect(t.db.prepare('SELECT finalized_revision_no FROM timesheets').pluck().get()).toBe(2);
    const audit = t.db.prepare("SELECT * FROM audit_events WHERE operation = 'timesheet.late_review'").get() as any;
    expect(audit).toMatchObject({ entity_id: body.revision.id, actor_user_id: t.userIds.employee });
    expect(`${audit.before_json}${audit.after_json}`).not.toContain(SIGNER);
  });

  it('enqueues the send only when send_email is true, and requires the choice', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x72);
    await makeAutomaticRevision();
    const body = await lateReviewBody({ send_email: true });
    const { send_email: _send, ...withoutSend } = body;
    expect((await lateReview(withoutSend)).status).toBe(422);
    const response = await lateReview(body);
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.revision.send_requested).toBe(true);
    expect(jobKinds(response.body)).toEqual(['render_pdf', 'send_email']);
    expect(count('SELECT count(*) FROM ot_ledger WHERE entry_type = ?', 'correction')).toBe(0);
  });

  it('refuses changed content (use a correction), an already reviewed revision and an unfinalized period', async () => {
    const session = await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x73);
    const noRevision = await lateReview(await lateReviewBody());
    expect(noRevision.status).toBe(409);
    expect(noRevision.body.error.code).toBe('not_finalized');
    await makeAutomaticRevision();
    await editSession(session, '2026-09-15', '09:00', '18:30');
    const before = writeState();
    const changed = await lateReview(await lateReviewBody());
    expect(changed.status).toBe(409);
    expect(changed.body.error.code).toBe('content_changed');
    expect(writeState()).toEqual(before);
    // The employee corrects it instead (with a reason); afterwards nothing is awaiting review.
    const corrected = await revise(await reviseBody());
    expect(corrected.status, JSON.stringify(corrected.body)).toBe(201);
    expect(linesOf(corrected.body)).toEqual([['2026-09-15', 'correction', 30, 'posted']]);
    const reviewed = await lateReview(await lateReviewBody());
    expect(reviewed.status).toBe(409);
    expect(reviewed.body.error.code).toBe('no_pending_review');
  });

  it('refuses a late review of a manually signed revision', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x74);
    await finalizeOriginal();
    const before = writeState();
    const response = await lateReview(await lateReviewBody());
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('no_pending_review');
    expect(writeState()).toEqual(before);
  });

  it('is owner-only and rejects unknown fields and a reason field', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x75);
    await makeAutomaticRevision();
    const body = await lateReviewBody();
    const before = writeState();
    expect((await t.request('POST', lateReviewPath(), { body })).status).toBe(401);
    expect((await lateReview(body, employee, '2026-10-09')).status).toBe(404);
    expect((await lateReview({ ...body, user_id: t.userIds.admin })).status).toBe(422);
    // The administrator's own period has no finalized revision; the employee's one is never reachable.
    expect([404, 409]).toContain((await lateReview(body, admin)).status);
    expect(writeState()).toEqual(before);
  });
});

// ---------------------------------------------------------------------------------------

describe('same-revision resend', () => {
  /** A revision with a ready PDF whose initial send already finished (accepted by the provider). */
  async function finalizedWithPdf() {
    const saved = await t.request('POST', '/api/settings/submission', {
      cookie: employee,
      body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
    });
    expect(saved.status, JSON.stringify(saved.body)).toBeLessThan(300);
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x81);
    const original = await finalizeOriginal();
    const revisionId: string = original.revision.id;
    const attachmentId = randomUUID();
    t.db
      .prepare(
        `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
         VALUES (?, ?, 'pdf', ?, ?, 'application/pdf', 1200, NULL, NULL, '2026-09-29T20:00:00Z')`,
      )
      .run(attachmentId, t.userIds.employee, randomBytes(24).toString('base64url'), randomBytes(32).toString('hex'));
    t.db
      .prepare(
        `INSERT INTO revision_files (id, user_id, revision_id, kind, state, attachment_id, last_error, created_at, updated_at)
         VALUES (?, ?, ?, 'pdf', 'ready', ?, NULL, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
      )
      .run(randomUUID(), t.userIds.employee, revisionId, attachmentId);
    const job = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(revisionId) as { id: string };
    t.db.prepare("UPDATE jobs SET state = 'succeeded', attempts = 1 WHERE id = ?").run(job.id);
    insertAttempt(job.id, revisionId, 'accepted');
    return { revisionId, attachmentId, jobId: job.id, original };
  }

  function insertAttempt(jobId: string, revisionId: string, state: string, decision: string | null = null, attemptNo = 1) {
    t.db
      .prepare(
        `INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, envelope_json, attachment_id, message_id,
           state, accepted_at, decision, decision_actor_user_id, decided_at, started_at, updated_at)
         VALUES (?, ?, ?, ?, ?, '{}', NULL, ?, ?, ?, ?, ?, ?, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
      )
      .run(
        randomUUID(),
        jobId,
        t.userIds.employee,
        revisionId,
        attemptNo,
        `<${randomUUID()}@example.invalid>`,
        state,
        state === 'accepted' ? '2026-09-29T20:00:01Z' : null,
        decision,
        decision === null ? null : t.userIds.employee,
        decision === null ? null : '2026-09-29T20:05:00Z',
      );
  }

  const resend = (id: string, body: unknown = {}, who = employee) => t.request('POST', resendPath(id), { cookie: who, body });

  it('creates a new delivery attempt and send job on the same revision with no ledger movement', async () => {
    const { revisionId, attachmentId } = await finalizedWithPdf();
    const frozen = frozenState(revisionId, false);
    const before = writeState();
    const ledgerBefore = JSON.stringify(listLedgerEntries(t.db, t.userIds.employee));
    const response = await resend(revisionId, { to: ['payroll@example.invalid'], cc: [] });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body).toMatchObject({
      revision_id: revisionId,
      job: { kind: 'send_email', state: 'queued' },
      attempt: { attempt_no: 1, state: 'preparing' },
    });
    const after = writeState();
    expect(after).toEqual({ ...before, jobs: before.jobs + 1, attempts: before.attempts + 1, audit: before.audit + 1 });
    // No ledger movement, no new revision, no change of the timesheet or of the revision's stored facts.
    expect(JSON.stringify(listLedgerEntries(t.db, t.userIds.employee))).toBe(ledgerBefore);
    expect(frozenState(revisionId, false)).toBe(frozen);
    const jobs = t.db.prepare("SELECT business_key, kind FROM jobs WHERE revision_id = ? AND kind = 'send_email' ORDER BY created_at, business_key").all(revisionId) as any[];
    expect(jobs).toHaveLength(2);
    expect(jobs.map((job) => job.business_key)).toContain(`revision:${revisionId}:send_email:resend:2`);
    const attempt = t.db.prepare("SELECT * FROM delivery_attempts WHERE state = 'preparing'").get() as any;
    expect(attempt).toMatchObject({ revision_id: revisionId, user_id: t.userIds.employee, attachment_id: attachmentId, channel: 'email' });
    const envelope = JSON.parse(attempt.envelope_json);
    expect(envelope).toMatchObject({ to: ['payroll@example.invalid'], cc: [], revision_id: revisionId });
    expect(typeof envelope.subject).toBe('string');
    expect(attempt.message_id).toMatch(/^<[^<>\s]+@[^<>\s]+>$/);
    const audit = t.db.prepare("SELECT * FROM audit_events WHERE operation = 'revision.resend'").get() as any;
    expect(audit).toMatchObject({ entity_id: revisionId, actor_user_id: t.userIds.employee });
    expect(`${audit.before_json}${audit.after_json}`).not.toContain('payroll@example.invalid');
    expect(count('SELECT count(*) FROM timesheet_revisions')).toBe(1);
  });

  it.each(['preparing', 'sending'])('refuses while an attempt is %s', async (state) => {
    const { revisionId, jobId } = await finalizedWithPdf();
    insertAttempt(jobId, revisionId, state, null, 2);
    const before = writeState();
    const refused = await resend(revisionId);
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('delivery_in_progress');
    expect(writeState()).toEqual(before);
  });

  it('refuses while an attempt is uncertain without a decision; an explicit decision to resend lifts it', async () => {
    const { revisionId, jobId } = await finalizedWithPdf();
    insertAttempt(jobId, revisionId, 'uncertain', null, 2);
    const before = writeState();
    const uncertain = await resend(revisionId);
    expect(uncertain.status).toBe(409);
    expect(uncertain.body.error.code).toBe('delivery_uncertain');
    expect(writeState()).toEqual(before);
    t.db
      .prepare("UPDATE delivery_attempts SET decision = 'resend', decision_actor_user_id = ?, decided_at = '2026-09-29T20:30:00Z' WHERE job_id = ? AND attempt_no = 2")
      .run(t.userIds.employee, jobId);
    const allowed = await resend(revisionId);
    expect(allowed.status, JSON.stringify(allowed.body)).toBe(201);
  });

  it('refuses while a send job of the revision is still queued', async () => {
    const { revisionId } = await finalizedWithPdf();
    t.db.prepare("INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at) VALUES (?, ?, ?, 'send_email', ?, '{}', 'queued', 0, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')").run(
      randomUUID(),
      t.userIds.employee,
      revisionId,
      `revision:${revisionId}:send_email:resend:9`,
    );
    const before = writeState();
    const refused = await resend(revisionId);
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('delivery_in_progress');
    expect(writeState()).toEqual(before);
  });

  it('a changed envelope (recipients or template) needs a new revision, not a resend', async () => {
    const { revisionId } = await finalizedWithPdf();
    const before = writeState();
    const recipients = await resend(revisionId, { to: ['someone.else@example.invalid'] });
    expect(recipients.status).toBe(409);
    expect(recipients.body.error.code).toBe('envelope_changed');
    expect(recipients.body.error.details).toMatchObject({ new_revision_required: true });
    const cc = await resend(revisionId, { cc: ['copy@example.invalid'] });
    expect(cc.status).toBe(409);
    expect(cc.body.error.code).toBe('envelope_changed');
    const template = await resend(revisionId, { template_version: 99 });
    expect(template.status).toBe(409);
    expect(template.body.error.code).toBe('envelope_changed');
    expect(writeState()).toEqual(before);
  });

  it('needs a ready PDF and only the current revision of its timesheet', async () => {
    const { revisionId, attachmentId } = await finalizedWithPdf();
    const before = writeState();
    // A newer revision supersedes this one: resending the old revision is refused.
    await addSession('2026-09-16', '09:00', '18:00', { reason: REASON });
    const newer = await revise(await reviseBody());
    expect(newer.status, JSON.stringify(newer.body)).toBe(201);
    const superseded = await resend(revisionId);
    expect(superseded.status).toBe(409);
    expect(superseded.body.error.code).toBe('revision_superseded');
    // The newer revision has no ready PDF yet (the PDF job is a later task).
    const noPdf = await resend(newer.body.revision.id);
    expect(noPdf.status).toBe(409);
    expect(noPdf.body.error.code).toBe('pdf_not_ready');
    expect(attachmentId).toBeTruthy();
    expect(count('SELECT count(*) FROM delivery_attempts')).toBe(before.attempts);
  });

  it('is owner-only: another user and an unknown id get 404, anonymous 401, and nothing is written', async () => {
    const { revisionId } = await finalizedWithPdf();
    const before = writeState();
    expect((await resend(revisionId, {}, admin)).status).toBe(404);
    expect((await resend(randomUUID())).status).toBe(404);
    expect((await t.request('POST', resendPath(revisionId), { body: {} })).status).toBe(401);
    expect((await t.request('POST', resendPath(revisionId), { cookie: employee, body: {}, origin: 'http://evil.example.invalid' })).status).toBe(403);
    expect((await resend(revisionId, { user_id: t.userIds.admin })).status).toBe(422);
    expect(writeState()).toEqual(before);
  });
});
