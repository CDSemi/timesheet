import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canonicalHash } from '../../src/domain/canonical.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createCalendar, createCalendarVersion } from '../../src/server/services/calendars.ts';
import { getBalance, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T05: manual sign-off finalization (AC-06, AC-03 WP3 part, R-05, R-06, FR-10, R4 and
 * the owner's F-2 decision). Today is 2026-09-29 (LA 13:00): the current period is
 * 2026-09-14 ... 2026-09-27 with payroll date 2026-10-02. The seed policy is B=480, N=30,
 * M=30 with deficit mode `ignore`. Data is synthetic (example.invalid); wall times are
 * local inputs in the reporting zone, never fixed UTC offsets.
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
const signoffPath = (payrollDate = PAYROLL) => `/api/timesheets/${payrollDate}/signoff`;
const SIGNER = 'Example Employee';

const SEED_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

/** Every table finalization may write, plus the audit log and the timesheet finalization column. */
function writeState() {
  return {
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    signoffs: count('SELECT count(*) FROM signoffs'),
    lines: count('SELECT count(*) FROM revision_ledger_lines'),
    ledger: count('SELECT count(*) FROM ot_ledger'),
    jobs: count('SELECT count(*) FROM jobs'),
    files: count('SELECT count(*) FROM revision_files'),
    audit: count('SELECT count(*) FROM audit_events'),
    finalized: count('SELECT count(*) FROM timesheets WHERE finalized_revision_no IS NOT NULL'),
    timesheets: count('SELECT count(*) FROM timesheets'),
  };
}

async function review(who = employee, payrollDate = PAYROLL) {
  const response = await t.request('GET', `/api/timesheets/${payrollDate}/review`, { cookie: who });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body as { payload: any; payload_hash: string; expected_version: number };
}

interface SignoffOverrides {
  expected_version?: number;
  reviewed_hash?: string;
  signer_name?: string;
  deficit_choices?: Array<{ work_date: string; choice: string }>;
  incomplete_evidence_acknowledged?: boolean;
}

/** A sign-off request built from a fresh review unless the caller overrides fields. */
async function signoffBody(overrides: SignoffOverrides = {}, who = employee) {
  const current = await review(who);
  return {
    expected_version: current.expected_version,
    reviewed_hash: current.payload_hash,
    signer_name: SIGNER,
    incomplete_evidence_acknowledged: true,
    ...overrides,
  };
}

function signoff(body: unknown, who = employee, payrollDate = PAYROLL) {
  return t.request('POST', signoffPath(payrollDate), { cookie: who, body });
}

async function addSession(date: string, from: string, to: string, extra: Record<string, unknown> = {}, who = employee) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true, ...extra },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.session as { id: string; version: number };
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

/** Stores a signature through the production service (the upload route has its own tests). */
function uploadSignature(fill: number, userId = t.userIds.employee) {
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  const saved = saveSignature(t.db, t.clock, files, userId, makePng(fill), 'image/png');
  return { id: saved.id, sha256: saved.sha256 };
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
      note: 'Synthetic finalization test policy',
      ...overrides,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** An opening balance posted outside the period (system origin), like earlier finalized work. */
function openingCredit(minutes: number, key = 'synthetic-opening-balance') {
  postCredit(
    { db: t.db, clock: t.clock },
    { userId: t.userIds.employee, sourceKey: key, actorUserId: null, origin: 'system', reason: 'Synthetic opening balance', workDate: '2026-09-01', minutes },
  );
}

function periodEntries(userId = t.userIds.employee) {
  return listLedgerEntries(t.db, userId).filter((entry) => entry.workDate !== null && entry.workDate >= START);
}

function linesOf(body: any) {
  return (body.ledger_lines as any[]).map((line) => [line.work_date, line.line_kind, line.proposed_minutes, line.outcome]);
}

// ---------------------------------------------------------------------------------------

describe('sign-off transaction', () => {
  it('creates the signed revision, the real sign-off, the ledger postings, the lines and the jobs in one step', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    await addSession('2026-09-26', '10:00', '12:00'); // Saturday: 120 credited
    const signature = uploadSignature(0x40);
    const current = await review();
    // The sign-off time is the time of the request, not of the review.
    t.clock.advanceSeconds(95);
    const response = await signoff({
      expected_version: current.expected_version,
      reviewed_hash: current.payload_hash,
      signer_name: `  ${SIGNER}  `,
      incomplete_evidence_acknowledged: true,
    });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const body = response.body;
    expect(body.status).toBe('created');
    expect(body.finalized_revision_no).toBe(1);
    expect(body.revision).toMatchObject({
      revision_no: 1,
      revision_kind: 'original',
      origin: 'employee',
      review_state: 'signed',
      payload_sha256: current.payload_hash,
      reviewed_sha256: current.payload_hash,
      timesheet_version: current.expected_version,
      send_requested: true,
    });
    expect(body.signoff).toEqual({
      signer_name: SIGNER,
      signed_at: '2026-09-29T20:01:35Z',
      reviewed_sha256: current.payload_hash,
      signature_attachment_id: signature.id,
    });

    // Immutable revision: the stored payload is exactly the reviewed payload.
    const revision = t.db.prepare('SELECT * FROM timesheet_revisions').get() as any;
    expect(revision.user_id).toBe(t.userIds.employee);
    expect(revision.actor_user_id).toBe(t.userIds.employee);
    expect(revision.created_at).toBe('2026-09-29T20:01:35Z');
    expect(canonicalHash(JSON.parse(revision.payload_json))).toBe(current.payload_hash);
    expect(JSON.parse(revision.payload_json)).toEqual(current.payload);
    const stored = t.db.prepare('SELECT * FROM signoffs').get() as any;
    expect(stored).toMatchObject({ revision_id: revision.id, user_id: t.userIds.employee, signer_name: SIGNER, signed_at: '2026-09-29T20:01:35Z' });

    // Credits are posted through the ledger with revision-independent day keys.
    const entries = periodEntries();
    expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.sourceRef, entry.origin, entry.actorUserId])).toEqual([
      ['2026-09-15', 'credit', 60, 'finalization:day:2026-09-15:credit', revision.id, 'manual', t.userIds.employee],
      ['2026-09-26', 'credit', 120, 'finalization:day:2026-09-26:credit', revision.id, 'manual', t.userIds.employee],
    ]);
    expect(linesOf(body)).toEqual([
      ['2026-09-15', 'credit', 60, 'posted'],
      ['2026-09-26', 'credit', 120, 'posted'],
    ]);
    const lineRows = t.db.prepare('SELECT work_date, ledger_entry_id, revision_id FROM revision_ledger_lines ORDER BY work_date').all() as any[];
    expect(lineRows.map((row) => row.ledger_entry_id)).toEqual(entries.map((entry) => entry.id));
    expect(new Set(lineRows.map((row) => row.revision_id))).toEqual(new Set([revision.id]));

    // The period is finalized in the same transaction; the version moves on.
    const sheet = t.db.prepare('SELECT finalized_revision_no, version FROM timesheets WHERE user_id = ?').get(t.userIds.employee) as any;
    expect(sheet).toEqual({ finalized_revision_no: 1, version: current.expected_version + 1 });

    // PDF and send work is enqueued (rows only; the runner is a later task).
    const jobs = t.db.prepare('SELECT * FROM jobs ORDER BY kind').all() as any[];
    expect(jobs.map((job) => [job.kind, job.state, job.attempts, job.business_key, job.revision_id, job.user_id, JSON.parse(job.payload_json)])).toEqual([
      ['render_pdf', 'queued', 0, `revision:${revision.id}:render_pdf`, revision.id, t.userIds.employee, { revision_id: revision.id }],
      ['send_email', 'queued', 0, `revision:${revision.id}:send_email:initial`, revision.id, t.userIds.employee, { revision_id: revision.id }],
    ]);
    expect(jobs.every((job) => job.next_run_at === '2026-09-29T20:01:35Z')).toBe(true);
    expect(body.jobs.map((job: any) => [job.kind, job.state])).toEqual([
      ['render_pdf', 'queued'],
      ['send_email', 'queued'],
    ]);
    expect(count('SELECT count(*) FROM delivery_attempts')).toBe(0);

    // The audit event names ids, hashes and counts, never the signer, recipients or content.
    const audit = t.db.prepare("SELECT * FROM audit_events WHERE operation = 'timesheet.signoff'").all() as any[];
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee, entity_type: 'timesheet_revision', entity_id: revision.id });
    const after = JSON.parse(audit[0].after_json);
    expect(after).toMatchObject({ revision_id: revision.id, revision_no: 1, payload_sha256: current.payload_hash, signed_at: '2026-09-29T20:01:35Z', finalized_revision_no: 1 });
    expect(after.ledger_lines).toEqual({ posted: 2, pending_insufficient_balance: 0, waived: 0 });
    expect(audit[0].after_json + (audit[0].before_json ?? '')).not.toMatch(/Example Employee|example\.invalid|Synthetic/);

    // A fresh review now shows the finalized revision and the next revision number.
    const after2 = await review();
    expect(after2.payload.timesheet.finalized_revision_no).toBe(1);
    expect(after2.payload.submission.revision_no).toBe(2);
  });

  it('finalizes a period with no saved entries, creating its timesheet row', async () => {
    uploadSignature(0x41);
    const current = await review();
    expect(current.expected_version).toBe(0);
    const before = writeState();
    const response = await signoff({ expected_version: 0, reviewed_hash: current.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.ledger_lines).toEqual([]);
    const after = writeState();
    expect(after).toMatchObject({ revisions: before.revisions + 1, timesheets: before.timesheets + 1, finalized: before.finalized + 1, jobs: before.jobs + 2, ledger: before.ledger });
    expect(response.body.revision.timesheet_version).toBe(1);
  });

  it('rolls everything back when a posting fails inside the transaction', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 60 credited
    await addSession('2026-09-16', '09:00', '18:00'); // 60 credited
    uploadSignature(0x42);
    // A conflicting entry already holds the second day's key with another value.
    postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'finalization:day:2026-09-16:credit', actorUserId: null, origin: 'system', reason: 'Synthetic conflict', workDate: '2026-09-16', minutes: 15 },
    );
    const body = await signoffBody();
    const before = writeState();
    const response = await signoff(body);
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.error.code).toBe('source_key_conflict');
    // Nothing of the failed sign-off remains: not the first day's credit, revision, lines, jobs or audit.
    expect(writeState()).toEqual(before);
    expect(periodEntries().map((entry) => entry.sourceKey)).toEqual(['finalization:day:2026-09-16:credit']);
  });
});

describe('required name, image and acknowledgement (AC-06)', () => {
  it('refuses a blank or missing signer name with 422 and writes nothing', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x43);
    const before = writeState();
    const blank = await signoff(await signoffBody({ signer_name: '   ' }));
    expect(blank.status).toBe(422);
    expect(blank.body.error.code).toBe('signer_name_required');
    const control = await signoff(await signoffBody({ signer_name: 'Example\nEmployee' }));
    expect(control.status).toBe(422);
    expect(control.body.error.code).toBe('invalid_signer_name');
    const { signer_name: _omitted, ...missing } = await signoffBody();
    const absent = await signoff(missing);
    expect(absent.status).toBe(422);
    expect(writeState()).toEqual(before);
  });

  it('refuses a sign-off without a signature image with 422 and writes nothing', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    const before = writeState();
    const response = await signoff(await signoffBody());
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.error.code).toBe('signature_required');
    expect(writeState()).toEqual(before);
  });

  it('requires the explicit acknowledgement when evidence is incomplete', async () => {
    await addSession('2026-09-15', '09:00', '19:00', { breaks_confirmed: false });
    uploadSignature(0x44);
    const current = await review();
    expect(current.payload.unresolved_inputs.length).toBeGreaterThan(0);
    const before = writeState();
    const refused = await signoff(await signoffBody({ incomplete_evidence_acknowledged: false }));
    expect(refused.status).toBe(422);
    expect(refused.body.error.code).toBe('acknowledgement_required');
    const { incomplete_evidence_acknowledged: _omitted, ...withoutFlag } = await signoffBody();
    expect((await signoff(withoutFlag)).status).toBe(422);
    expect(writeState()).toEqual(before);
    // With the acknowledgement the incomplete day stays pending: no hours are invented.
    const accepted = await signoff(await signoffBody());
    expect(accepted.status, JSON.stringify(accepted.body)).toBe(201);
    expect(accepted.body.ledger_lines).toEqual([]);
    expect(periodEntries()).toEqual([]);
  });
});

describe('stale review (AC-06: a concurrent edit causes a conflict)', () => {
  it('answers 409 for a stale expected version and writes nothing', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x45);
    const current = await review();
    const before = writeState();
    const response = await signoff(await signoffBody({ expected_version: current.expected_version - 1 }));
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('stale_version');
    expect(response.body.error.details).toEqual({ fresh_review_required: true });
    expect(writeState()).toEqual(before);
  });

  it('answers 409 when a day was edited after the review, and writes nothing', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x46);
    const reviewed = await review();
    // A concurrent edit (another tab) changes the content and the version after the review.
    await addSession('2026-09-16', '09:00', '18:00');
    const before = writeState();
    const stale = await signoff({ expected_version: reviewed.expected_version, reviewed_hash: reviewed.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true });
    expect(stale.status).toBe(409);
    expect(stale.body.error.details).toEqual({ fresh_review_required: true });
    // The old hash with the new version is also refused: the content changed.
    const fresh = await review();
    const staleHash = await signoff({ expected_version: fresh.expected_version, reviewed_hash: reviewed.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true });
    expect(staleHash.status).toBe(409);
    expect(staleHash.body.error.code).toBe('stale_review');
    expect(writeState()).toEqual(before);
    // A fresh review signs.
    expect((await signoff(await signoffBody())).status).toBe(201);
  });

  it('answers 409 when the signature changed after the review (same timesheet version)', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x47);
    const reviewed = await review();
    uploadSignature(0x48);
    const before = writeState();
    const response = await signoff({ expected_version: reviewed.expected_version, reviewed_hash: reviewed.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('stale_review');
    expect(writeState()).toEqual(before);
  });
});

describe('deficits (R-05) and pending lines (R4, owner decision F-2)', () => {
  it('choose mode: a chosen debit posts, a waived one is recorded as waived, and every choose day needs a choice', async () => {
    await newPolicy({ deficit_mode: 'choose_at_signoff' });
    openingCredit(300);
    await addSession('2026-09-15', '09:00', '13:00'); // deficit 240
    await addSession('2026-09-16', '09:00', '13:00'); // deficit 240
    uploadSignature(0x49);
    const before = writeState();
    const none = await signoff(await signoffBody());
    expect(none.status).toBe(422);
    expect(none.body.error.code).toBe('deficit_choice_required');
    expect(none.body.error.details).toEqual({ work_dates: ['2026-09-15', '2026-09-16'] });
    const partial = await signoff(await signoffBody({ deficit_choices: [{ work_date: '2026-09-15', choice: 'deduct' }] }));
    expect(partial.status).toBe(422);
    expect(partial.body.error.details).toEqual({ work_dates: ['2026-09-16'] });
    const unexpected = await signoff(
      await signoffBody({
        deficit_choices: [
          { work_date: '2026-09-15', choice: 'deduct' },
          { work_date: '2026-09-16', choice: 'waive' },
          { work_date: '2026-09-17', choice: 'waive' },
        ],
      }),
    );
    expect(unexpected.status).toBe(422);
    expect(unexpected.body.error.code).toBe('unexpected_deficit_choice');
    const duplicate = await signoff(
      await signoffBody({
        deficit_choices: [
          { work_date: '2026-09-15', choice: 'deduct' },
          { work_date: '2026-09-15', choice: 'waive' },
        ],
      }),
    );
    expect(duplicate.status).toBe(422);
    expect(writeState()).toEqual(before);

    const response = await signoff(
      await signoffBody({
        deficit_choices: [
          { work_date: '2026-09-16', choice: 'waive' },
          { work_date: '2026-09-15', choice: 'deduct' },
        ],
      }),
    );
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(linesOf(response.body)).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'posted'],
      ['2026-09-16', 'deficit_debit', -240, 'waived'],
    ]);
    const entries = periodEntries();
    expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey])).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'finalization:day:2026-09-15:deficit_debit'],
    ]);
    const waived = t.db.prepare("SELECT ledger_entry_id FROM revision_ledger_lines WHERE outcome = 'waived'").get() as any;
    expect(waived.ledger_entry_id).toBeNull();
    expect(getBalance(t.db, t.userIds.employee).postedMinutes).toBe(60);
  });

  it('refuses a choice in a mode without choices', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    openingCredit(600);
    await addSession('2026-09-15', '09:00', '13:00');
    uploadSignature(0x4a);
    const response = await signoff(await signoffBody({ deficit_choices: [{ work_date: '2026-09-15', choice: 'waive' }] }));
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('unexpected_deficit_choice');
  });

  it('keeps a debit the balance cannot cover pending, persists the line and never posts it in the background', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    openingCredit(300);
    await addSession('2026-09-15', '09:00', '13:00'); // deficit 240: covered
    await addSession('2026-09-16', '09:00', '13:00'); // deficit 240: 60 left, stays pending
    await addSession('2026-09-17', '09:00', '18:00'); // 60 credited (a known credit still posts)
    uploadSignature(0x4b);
    const current = await review();
    expect(current.payload.deficit_proposals.map((item: any) => item.decision)).toEqual(['authorized', 'insufficient_balance']);
    const response = await signoff(await signoffBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(linesOf(response.body)).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'posted'],
      ['2026-09-16', 'deficit_debit', -240, 'pending_insufficient_balance'],
      ['2026-09-17', 'credit', 60, 'posted'],
    ]);
    expect(periodEntries().map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes])).toEqual([
      ['2026-09-15', 'deficit_debit', -240],
      ['2026-09-17', 'credit', 60],
    ]);
    // Never silently negative: 300 - 240 + 60.
    expect(getBalance(t.db, t.userIds.employee)).toMatchObject({ postedMinutes: 120, availableMinutes: 120, negative: false });
    const pendingRow = t.db.prepare("SELECT * FROM revision_ledger_lines WHERE outcome = 'pending_insufficient_balance'").get() as any;
    expect(pendingRow).toMatchObject({ work_date: '2026-09-16', line_kind: 'deficit_debit', proposed_minutes: -240, ledger_entry_id: null });

    // F-2: the pending line is shown for the review and OT screens.
    const status = await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`, { cookie: employee });
    expect(status.status).toBe(200);
    expect(status.body.finalized_revision_no).toBe(1);
    expect(linesOf(status.body)).toEqual(linesOf(response.body));
    const pending = await t.request('GET', '/api/revisions/pending-lines', { cookie: employee });
    expect(pending.status).toBe(200);
    expect(pending.body.lines).toEqual([
      expect.objectContaining({ payroll_date: PAYROLL, revision_no: 1, work_date: '2026-09-16', line_kind: 'deficit_debit', proposed_minutes: -240, outcome: 'pending_insufficient_balance' }),
    ]);
    // Another user sees none of it.
    expect((await t.request('GET', '/api/revisions/pending-lines', { cookie: admin })).body.lines).toEqual([]);

    // F-2: no background process posts it later, even when the balance would now cover it.
    openingCredit(900, 'synthetic-later-credit');
    t.clock.advanceSeconds(7 * 24 * 3600);
    expect(periodEntries().filter((entry) => entry.workDate === '2026-09-16')).toEqual([]);
    expect(count("SELECT count(*) FROM jobs WHERE kind NOT IN ('render_pdf', 'send_email')")).toBe(0);
    expect(count("SELECT count(*) FROM revision_ledger_lines WHERE outcome = 'pending_insufficient_balance'")).toBe(1);
  });

  it('binds each debit to the balance the review showed: credits of the same period post after the debits', async () => {
    await newPolicy({ deficit_mode: 'auto_deduct' });
    await addSession('2026-09-15', '09:00', '13:00'); // deficit 240 with no balance
    await addSession('2026-09-26', '08:00', '14:00'); // Saturday: 360 credited
    uploadSignature(0x54);
    const current = await review();
    expect(current.payload.deficit_proposals.map((item: any) => [item.decision, item.available_minutes_before])).toEqual([['insufficient_balance', 0]]);
    const response = await signoff(await signoffBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(linesOf(response.body)).toEqual([
      ['2026-09-15', 'deficit_debit', -240, 'pending_insufficient_balance'],
      ['2026-09-26', 'credit', 360, 'posted'],
    ]);
    expect(getBalance(t.db, t.userIds.employee).postedMinutes).toBe(360);
  });

  it('records no line for a deficit in ignore mode', async () => {
    await addSession('2026-09-15', '09:00', '13:00'); // deficit 240, mode ignore
    uploadSignature(0x4c);
    const response = await signoff(await signoffBody());
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.ledger_lines).toEqual([]);
    expect(periodEntries()).toEqual([]);
  });
});

describe('idempotency and provisional minutes', () => {
  it('an identical retry returns the same revision and writes nothing; a different one is a conflict', async () => {
    await newPolicy({ deficit_mode: 'choose_at_signoff' });
    openingCredit(300);
    await addSession('2026-09-15', '09:00', '13:00');
    await addSession('2026-09-17', '09:00', '18:00');
    uploadSignature(0x4d);
    const body = await signoffBody({ deficit_choices: [{ work_date: '2026-09-15', choice: 'deduct' }] });
    const first = await signoff(body);
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    const afterFirst = writeState();
    t.clock.advanceSeconds(30);
    const retry = await signoff(body);
    expect(retry.status, JSON.stringify(retry.body)).toBe(200);
    expect(retry.body.status).toBe('replayed');
    expect(retry.body.revision).toEqual(first.body.revision);
    expect(retry.body.signoff).toEqual(first.body.signoff);
    expect(retry.body.ledger_lines).toEqual(first.body.ledger_lines);
    expect(retry.body.jobs).toEqual(first.body.jobs);
    expect(writeState()).toEqual(afterFirst);

    for (const changed of [
      { ...body, signer_name: 'Example Employee Again' },
      { ...body, deficit_choices: [{ work_date: '2026-09-15', choice: 'waive' }] },
      { ...body, reviewed_hash: 'a'.repeat(64) },
    ]) {
      const response = await signoff(changed);
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('already_finalized');
      expect(response.body.error.details).toEqual({ fresh_review_required: true });
    }
    expect(writeState()).toEqual(afterFirst);
  });

  it('posted plus provisional minutes never double count', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 60
    await addSession('2026-09-26', '10:00', '12:00'); // 120
    uploadSignature(0x4e);
    const beforeSummary = await t.request('GET', '/api/ot/summary', { cookie: employee });
    expect(beforeSummary.body).toMatchObject({ posted_minutes: 0, provisional_minutes: 180 });
    expect((await signoff(await signoffBody())).status).toBe(201);
    const afterSummary = await t.request('GET', '/api/ot/summary', { cookie: employee });
    expect(afterSummary.body).toMatchObject({ posted_minutes: 180, provisional_minutes: 0 });
    expect(afterSummary.body.provisional_periods).toEqual([]);
    expect(afterSummary.body.posted_minutes + afterSummary.body.provisional_minutes).toBe(
      beforeSummary.body.posted_minutes + beforeSummary.body.provisional_minutes,
    );
  });
});

describe('ownership', () => {
  it('answers 404 for a payroll date of another owner and writes nothing', async () => {
    // A second calendar whose payroll dates fall a week later.
    const other = createCalendar(
      t.db,
      t.clock,
      {
        name: 'Other calendar (synthetic)',
        schedule: {
          reportingZone: LA,
          anchorPayrollDate: '2026-10-09',
          cycleDays: 14,
          periodStartOffsetDays: -18,
          periodEndOffsetDays: -5,
          dueOffsetDays: -3,
          dueLocalTime: '17:00',
        },
      },
      null,
    );
    createCalendarVersion(t.db, t.clock, { calendarId: other, effectiveFrom: '2026-01-01', weekdays: [1, 2, 3, 4, 5], dates: [], note: 'Synthetic' }, null);
    const password = randomBytes(18).toString('base64url');
    const otherId = await createUser(t.db, t.clock, { email: 'other@example.invalid', displayName: 'Other Employee', role: 'employee', password, calendarId: other }, null);
    createPolicyVersion(
      t.db,
      t.clock,
      {
        userId: otherId,
        calendarId: other,
        effectiveFrom: '2026-01-01',
        note: 'Synthetic',
        rules: {
          requiredMinutes: 480,
          thresholdMinutes: 30,
          roundingStepMinutes: 30,
          referenceStart: '08:00',
          referenceEnd: '17:00',
          deficitMode: 'ignore',
          breaks: SEED_BREAKS.map((item) => ({ startOffsetMinutes: item.start_offset_minutes, durationMinutes: item.duration_minutes, countsAsWork: item.counts_as_work })),
        },
      },
      otherId,
    );
    uploadSignature(0x4f, otherId);
    const login = await t.request('POST', '/api/auth/login', { body: { email: 'other@example.invalid', password } });
    const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x50);
    const body = await signoffBody();
    const before = writeState();
    const foreign = await signoff(body, cookie);
    expect(foreign.status).toBe(404);
    expect(foreign.body.error.code).toBe('not_found');
    expect(JSON.stringify(foreign.body)).not.toContain('Example Employee');
    expect((await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`, { cookie })).status).toBe(404);
    expect(writeState()).toEqual(before);
    // The employee cannot use the other owner's payroll date either.
    expect((await signoff(body, employee, '2026-10-09')).status).toBe(404);
    expect((await signoff(body, employee, 'not-a-date')).status).toBe(422);
    expect(writeState()).toEqual(before);
  });

  it('an administrator on the same calendar cannot sign the employee timesheet', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    uploadSignature(0x51);
    uploadSignature(0x52, t.userIds.admin);
    const body = await signoffBody();
    const before = writeState();
    // The admin's own payload differs, so the employee's reviewed hash never matches it.
    const response = await signoff(body, admin);
    expect(response.status).toBe(409);
    expect(writeState()).toEqual(before);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND finalized_revision_no IS NOT NULL', t.userIds.employee)).toBe(0);
  });

  it('requires a signed-in user and an allowed origin', async () => {
    const body = { expected_version: 0, reviewed_hash: 'a'.repeat(64), signer_name: SIGNER };
    expect((await t.request('POST', signoffPath(), { body })).status).toBe(401);
    expect((await t.request('POST', signoffPath(), { cookie: employee, body, origin: 'http://evil.example.invalid' })).status).toBe(403);
    expect((await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`)).status).toBe(401);
    expect((await t.request('GET', '/api/revisions/pending-lines')).status).toBe(401);
  });

  it('rejects unknown fields such as user_id', async () => {
    uploadSignature(0x53);
    const response = await signoff({ ...(await signoffBody()), user_id: t.userIds.admin });
    expect(response.status).toBe(422);
    expect(writeState().revisions).toBe(0);
  });
});

describe('read side', () => {
  it('the finalization status GET writes nothing and reports an unfinalized period', async () => {
    const totalChanges = () => Number(t.db.prepare('SELECT total_changes()').pluck().get());
    const before = writeState();
    const changes = totalChanges();
    const response = await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`, { cookie: employee });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ payroll_date: PAYROLL, finalized_revision_no: null, revision: null, signoff: null, ledger_lines: [], jobs: [] });
    await t.request('GET', '/api/revisions/pending-lines', { cookie: employee });
    expect(totalChanges()).toBe(changes);
    expect(writeState()).toEqual(before);
  });
});
