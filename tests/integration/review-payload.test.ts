import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canonicalHash } from '../../src/domain/canonical.ts';
import { datesBetween } from '../../src/domain/dates.ts';
import { parseUtcInstant } from '../../src/domain/instants.ts';
import { localDateOf } from '../../src/domain/zones.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createCalendar, createCalendarVersion } from '../../src/server/services/calendars.ts';
import { postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { createUser } from '../../src/server/services/users.ts';
import { dateTimeIn, instantOfWallTime } from '../client/zoneOracle.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T04: the review payload. Today is 2026-09-29 (LA 13:00): the current period is
 * 2026-09-14 ... 2026-09-27 with payroll date 2026-10-02 (Monday to Sunday twice). The seed
 * policy is B=480, N=30, M=30 with deficit mode `ignore`. All data is synthetic
 * (example.invalid); wall times are derived with the zone oracle, never as fixed offsets.
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
const END = '2026-09-27';
const reviewPath = (payrollDate = PAYROLL) => `/api/timesheets/${payrollDate}/review`;
const SETTINGS = '/api/settings/submission';

const SEED_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

const totalChanges = () => Number(t.db.prepare('SELECT total_changes()').pluck().get());
const auditRows = () => count('SELECT count(*) FROM audit_events');

async function review(who = employee, payrollDate = PAYROLL) {
  return t.request('GET', reviewPath(payrollDate), { cookie: who });
}

async function payloadOf(who = employee, payrollDate = PAYROLL) {
  const response = await review(who, payrollDate);
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body;
}

async function hashOf(who = employee): Promise<string> {
  return (await payloadOf(who)).payload_hash;
}

async function addSession(date: string, from: string, to: string, extra: Record<string, unknown> = {}, who = employee) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: {
      start: la(`${date}T${from}`),
      end: la(`${date}T${to}`),
      input_zone: LA,
      breaks: [],
      breaks_confirmed: true,
      ...extra,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.session as { id: string; version: number };
}

function dayOf(body: { payload: { days: Array<{ work_date: string }> } }, date: string) {
  const day = body.payload.days.find((item) => item.work_date === date);
  if (day === undefined) throw new Error(`No payload day ${date}`);
  return day as any;
}

// --- synthetic signature image (generated here; no image file is committed) -------------

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function makePng(fill: number): Buffer {
  const width = 8;
  const height = 8;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Array.from({ length: height }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, fill)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Stores a signature through the production service (the raw-body route has its own tests). */
function uploadSignature(fill: number) {
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  const saved = saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(fill), 'image/png');
  return Promise.resolve({ id: saved.id, sha256: saved.sha256 });
}

async function saveSettings(overrides: Record<string, unknown> = {}, expectedSeq = 0) {
  const response = await t.request('POST', SETTINGS, {
    cookie: employee,
    body: { expected_seq: expectedSeq, to: ['payroll@example.invalid'], cc: [], auto_submit: true, ...overrides },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.settings as { seq: number };
}

function policyRules(overrides: Record<string, unknown> = {}) {
  return {
    effective_from: START,
    required_minutes: 480,
    threshold_minutes: 30,
    rounding_step_minutes: 30,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: SEED_BREAKS,
    deficit_mode: 'ignore',
    note: 'Synthetic review test policy',
    ...overrides,
  };
}

async function newPolicy(overrides: Record<string, unknown> = {}) {
  const response = await t.request('POST', '/api/policies', { cookie: employee, body: policyRules(overrides) });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.policy as { id: string };
}

function credit(minutes: number, key = 'review-test-credit') {
  postCredit(
    { db: t.db, clock: t.clock },
    { userId: t.userIds.employee, sourceKey: key, actorUserId: null, origin: 'system', reason: 'Synthetic review test credit', workDate: '2026-09-01', minutes },
  );
}

// ---------------------------------------------------------------------------------------

describe('payload content', () => {
  it('lists the 14 days of the period with the zone, employee, policy and calendar versions', async () => {
    const policies = await t.request('GET', '/api/policies', { cookie: employee });
    const calendar = await t.request('GET', '/api/calendar', { cookie: employee });
    const body = await payloadOf();
    const payload = body.payload;
    expect(payload.schema).toBe('timesheet-review');
    expect(payload.schema_version).toBe(2);
    expect(payload.days.map((day: { work_date: string }) => day.work_date)).toEqual(datesBetween(START, END));
    expect(payload.days).toHaveLength(14);
    expect(payload.period).toMatchObject({ payroll_date: PAYROLL, period_start: START, period_end: END, due_local_time: '17:00' });
    expect(payload.reporting_zone).toBe(LA);
    expect(payload.employee).toEqual({ name: 'Example Employee' });
    expect(payload.policy.version_ids).toEqual([policies.body.policies[0].id]);
    expect(payload.calendar.id).toBe(calendar.body.id);
    expect(payload.calendar.version_ids).toEqual(calendar.body.versions.map((version: { id: string }) => version.id));
    expect(payload.submission).toMatchObject({ revision_no: 1, sign_off_status: 'Submitted' });
    expect(payload.submission.id).toMatch(/^TS-20261002-[0-9a-f]{10}$/);
    expect(body.payload_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(body.expected_version).toBe(0);
    // The hash is the SHA-256 of the canonical bytes of exactly this payload.
    expect(canonicalHash(payload)).toBe(body.payload_hash);
  });

  it('carries day category, leave, sessions, breaks and the engine minutes unchanged', async () => {
    const created = await t.request('POST', '/api/days/2026-09-15/sessions', {
      cookie: employee,
      body: {
        start: la('2026-09-15T09:00'),
        end: la('2026-09-15T18:30'),
        input_zone: LA,
        breaks: [{ start: la('2026-09-15T12:00'), end: la('2026-09-15T12:30'), counts_as_work: false }],
        breaks_confirmed: true,
      },
    });
    expect(created.status).toBe(201);
    const entry = await t.request('PUT', '/api/days/2026-09-16', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 240, leave_kind: 'vacation', wfh: true, notes: 'Synthetic note' },
    });
    expect(entry.status, JSON.stringify(entry.body)).toBe(200);
    const sheet = await t.request('GET', `/api/timesheets/${PAYROLL}`, { cookie: employee });
    const body = await payloadOf();
    const worked = dayOf(body, '2026-09-15');
    expect(worked.completeness).toBe('complete');
    expect(worked.sessions).toHaveLength(1);
    expect(worked.sessions[0]).toMatchObject({ start_utc: created.body.session.start_utc, end_utc: created.body.session.end_utc, breaks_confirmed: true });
    expect(worked.sessions[0].breaks).toHaveLength(1);
    expect(dayOf(body, '2026-09-16')).toMatchObject({ category: 'Vacation', leave_minutes: 240, leave_kind: 'vacation', wfh: true, notes: 'Synthetic note' });
    // Every minute value is the engine's value from the timesheet view.
    for (const day of sheet.body.days) {
      const mine = dayOf(body, day.work_date);
      const calc = day.calculation;
      expect(mine.calculation, day.work_date).toEqual(
        calc === null
          ? null
          : {
              regular_minutes: calc.regular_minutes,
              nonworking_minutes: calc.nonworking_minutes,
              normal_excess_minutes: calc.normal_excess_minutes,
              eligible_minutes: calc.eligible_minutes,
              credited_minutes: calc.credited_minutes,
            },
      );
      expect(mine.category).toBe(day.category);
    }
    expect(body.payload.totals).toEqual({
      credited_minutes: sheet.body.totals.provisional_credited_minutes,
      pending_days: sheet.body.totals.pending_days,
    });
    expect(body.expected_version).toBe(sheet.body.timesheet.version);
  });

  it('proposes OT per day from the engine credit', async () => {
    await addSession('2026-09-15', '09:00', '18:00'); // 540 regular, 60 over B, N=30 activates, M=30 -> 60 credited
    await addSession('2026-09-26', '10:00', '12:00'); // Saturday: 120 off-calendar minutes -> 120 credited
    const body = await payloadOf();
    expect(body.payload.ot_proposals).toEqual([
      expect.objectContaining({ work_date: '2026-09-15', credited_minutes: 60, eligible_minutes: 60 }),
      expect.objectContaining({ work_date: '2026-09-26', credited_minutes: 120, eligible_minutes: 120 }),
    ]);
    expect(body.payload.totals.credited_minutes).toBe(180);
    // Both Sundays of the period are part of the 14 days (the total must include them).
    expect(body.payload.days.filter((day: { work_date: string }) => ['2026-09-20', '2026-09-27'].includes(day.work_date))).toHaveLength(2);
  });

  it('lists unresolved inputs: unconfirmed breaks and open sessions credit nothing', async () => {
    await addSession('2026-09-15', '09:00', '19:00', { breaks_confirmed: false });
    await t.request('POST', '/api/days/2026-09-16/sessions', {
      cookie: employee,
      body: { start: la('2026-09-16T09:00'), end: null, input_zone: LA, breaks: [], breaks_confirmed: false },
    });
    const body = await payloadOf();
    expect(body.payload.unresolved_inputs).toEqual(
      expect.arrayContaining([
        { work_date: '2026-09-15', reason: 'unconfirmed_breaks', detail: null },
        { work_date: '2026-09-16', reason: 'open_session', detail: null },
      ]),
    );
    expect(dayOf(body, '2026-09-15').completeness).toBe('incomplete_breaks');
    expect(dayOf(body, '2026-09-16').completeness).toBe('incomplete');
    expect(body.payload.ot_proposals).toEqual([]);
    // A normal weekday without any record has an unknown deficit: also unresolved.
    expect(body.payload.unresolved_inputs).toEqual(expect.arrayContaining([{ work_date: '2026-09-17', reason: 'no_records', detail: null }]));
  });

  it('proposes deficits with the policy mode and the balance each decision saw', async () => {
    await addSession('2026-09-15', '09:00', '13:00'); // 240 regular -> deficit 240
    await addSession('2026-09-16', '09:00', '13:00'); // deficit 240
    // Mode ignore (the seed policy): proposed but never debited.
    let body = await payloadOf();
    expect(body.payload.deficit_proposals.map((item: any) => [item.work_date, item.mode, item.deficit_minutes, item.decision, item.debit_minutes])).toEqual([
      ['2026-09-15', 'ignore', 240, 'ignored', 0],
      ['2026-09-16', 'ignore', 240, 'ignored', 0],
    ]);
    // auto_deduct with no balance: the debit stays pending (R-05), nothing is overdrawn.
    await newPolicy({ deficit_mode: 'auto_deduct' });
    body = await payloadOf();
    expect(body.payload.deficit_proposals.map((item: any) => [item.mode, item.decision, item.debit_minutes, item.available_minutes_before])).toEqual([
      ['auto_deduct', 'insufficient_balance', 0, 0],
      ['auto_deduct', 'insufficient_balance', 0, 0],
    ]);
    // With 300 minutes, the first day is authorized and the second sees the 60 that remain.
    credit(300);
    body = await payloadOf();
    expect(body.payload.deficit_proposals.map((item: any) => [item.decision, item.debit_minutes, item.available_minutes_before])).toEqual([
      ['authorized', 240, 300],
      ['insufficient_balance', 0, 60],
    ]);
    // choose_at_signoff: no choice yet, so the debit is pending for the employee's decision.
    await newPolicy({ deficit_mode: 'choose_at_signoff', note: 'Synthetic choose mode' });
    body = await payloadOf();
    expect(body.payload.deficit_proposals.map((item: any) => [item.mode, item.decision, item.debit_minutes])).toEqual([
      ['choose_at_signoff', 'pending', 0],
      ['choose_at_signoff', 'pending', 0],
    ]);
  });

  it('flags unconsumed OT-leave reservations (E-3) and drops a cancelled one', async () => {
    credit(900);
    const inside = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: {
        request_key: 'review-leave-inside',
        leave_date: '2026-09-23',
        requested_minutes: 240,
        permission: { approver_name: 'Example Manager', approval_date: '2026-09-22', evidence_ref: 'Synthetic permission reference' },
      },
    });
    expect(inside.status, JSON.stringify(inside.body)).toBe(201);
    const later = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: {
        request_key: 'review-leave-later',
        leave_date: '2026-10-20',
        requested_minutes: 120,
        permission: { approver_name: 'Example Manager', approval_date: '2026-09-22', evidence_ref: 'Synthetic permission reference' },
      },
    });
    expect(later.status).toBe(201);
    let body = await payloadOf();
    expect(body.payload.ot_leave_reservations).toEqual([
      { request_id: inside.body.request.id, leave_date: '2026-09-23', approved_minutes: 240, reserved_minutes: 240, consumed_minutes: 0, use_due: true },
      { request_id: later.body.request.id, leave_date: '2026-10-20', approved_minutes: 120, reserved_minutes: 120, consumed_minutes: 0, use_due: false },
    ]);
    const cancelled = await t.request('POST', `/api/ot/leave/${inside.body.request.id}/cancel`, {
      cookie: employee,
      body: { expected_version: inside.body.request.version },
    });
    expect(cancelled.status, JSON.stringify(cancelled.body)).toBe(200);
    body = await payloadOf();
    expect(body.payload.ot_leave_reservations.map((item: { request_id: string }) => item.request_id)).toEqual([later.body.request.id]);
  });

  it('shows recipients with the rendered subject and body, the signature reference and the template flags', async () => {
    let body = await payloadOf();
    expect(body.payload.recipients).toMatchObject({ to: [], cc: [], template_version: 1 });
    expect(body.payload.signature).toBeNull();
    expect(body.payload.auto_image).toEqual({ authorized: false, attachment_id: null });
    expect(body.payload.auto_note).toEqual({ enabled: false, text: 'Automatic submission' });
    expect(body.payload.show_ot_on_pdf).toBe(true);

    const signature = await uploadSignature(0x30);
    await saveSettings({
      to: ['payroll@example.invalid'],
      cc: ['manager@example.invalid'],
      subject_template: 'Timesheet {PayrollDate} - {EmployeeName} - r{Revision} - {SignOffStatus}',
      body_template: 'Hello {EmployeeName}, {PeriodStart} to {PeriodEnd}, {SubmissionId}, <b>{Revision}</b>',
      show_ot_on_pdf: false,
    });
    body = await payloadOf();
    const submissionId = body.payload.submission.id;
    expect(body.payload.recipients).toEqual({
      to: ['payroll@example.invalid'],
      cc: ['manager@example.invalid'],
      subject: 'Timesheet 2026-10-02 - Example Employee - r1 - Submitted',
      body_text: `Hello Example Employee, 2026-09-14 to 2026-09-27, ${submissionId}, <b>1</b>`,
      body_html: `Hello Example Employee, 2026-09-14 to 2026-09-27, ${submissionId}, &lt;b&gt;1&lt;/b&gt;`,
      template_version: 1,
    });
    // The reference is the attachment id and hash, never the bytes.
    expect(body.payload.signature).toEqual({ attachment_id: signature.id, sha256: signature.sha256 });
    expect(body.payload.show_ot_on_pdf).toBe(false);
    expect(JSON.stringify(body)).not.toContain(makePng(0x30).toString('base64'));
  });

  it('carries no credential, token, password or file path', async () => {
    await uploadSignature(0x31);
    await saveSettings();
    const text = JSON.stringify(await payloadOf());
    expect(text).not.toMatch(/password|token|secret|cookie|storage_key|private-data|authorization/i);
  });

  it('does not depend on the clock or the zone of the device', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    const first = await payloadOf();
    t.clock.advanceSeconds(3 * 3600);
    employee = await t.login('employee');
    const later = await payloadOf();
    expect(later.payload_hash).toBe(first.payload_hash);
    expect(later.payload).toEqual(first.payload);
  });
});

describe('hash sensitivity', () => {
  it('is identical for an unchanged state, repeated', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    const a = await hashOf();
    expect(await hashOf()).toBe(a);
    expect(await hashOf()).toBe(a);
  });

  it('changes on every kind of day edit', async () => {
    const session = await addSession('2026-09-15', '09:00', '18:00');
    const seen = new Set<string>([await hashOf()]);
    const expectChange = async (label: string) => {
      const next = await hashOf();
      expect(seen.has(next), label).toBe(false);
      seen.add(next);
    };
    const updated = await t.request('PUT', `/api/sessions/${session.id}`, {
      cookie: employee,
      body: {
        start: la('2026-09-15T09:00'),
        end: la('2026-09-15T18:15'),
        input_zone: LA,
        breaks: [],
        breaks_confirmed: true,
        expected_version: session.version,
      },
    });
    expect(updated.status, JSON.stringify(updated.body)).toBe(200);
    await expectChange('session end time');
    await addSession('2026-09-17', '09:00', '17:00');
    await expectChange('new session on another day');
    const label = await t.request('PUT', '/api/days/2026-09-18', {
      cookie: employee,
      body: { category: 'Off', leave_minutes: 0, wfh: false, notes: '' },
    });
    expect(label.status, JSON.stringify(label.body)).toBe(200);
    await expectChange('category');
    const leave = await t.request('PUT', '/api/days/2026-09-18', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 480, leave_kind: 'vacation', wfh: false, notes: '', expected_version: label.body.entry.version },
    });
    expect(leave.status, JSON.stringify(leave.body)).toBe(200);
    await expectChange('leave minutes and kind');
    const notes = await t.request('PUT', '/api/days/2026-09-18', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 480, leave_kind: 'vacation', wfh: false, notes: 'Synthetic change', expected_version: leave.body.entry.version },
    });
    expect(notes.status).toBe(200);
    await expectChange('notes');
    const wfh = await t.request('PUT', '/api/days/2026-09-18', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 480, leave_kind: 'vacation', wfh: true, notes: 'Synthetic change', expected_version: notes.body.entry.version },
    });
    expect(wfh.status).toBe(200);
    await expectChange('work-from-home flag');
    const removed = await t.request('DELETE', `/api/sessions/${session.id}`, { cookie: employee, body: { expected_version: updated.body.session.version } });
    expect(removed.status, JSON.stringify(removed.body)).toBe(200);
    await expectChange('deleted session');
  });

  it('changes on a recipient, a template, a flag and a signature change', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    const seen = new Set<string>([await hashOf()]);
    const expectChange = async (label: string) => {
      const next = await hashOf();
      expect(seen.has(next), label).toBe(false);
      seen.add(next);
    };
    let seq = (await saveSettings({ to: ['payroll@example.invalid'] })).seq;
    await expectChange('first recipient');
    seq = (await saveSettings({ to: ['payroll@example.invalid', 'second@example.invalid'] }, seq)).seq;
    await expectChange('another recipient');
    seq = (await saveSettings({ to: ['payroll@example.invalid', 'second@example.invalid'], cc: ['copy@example.invalid'] }, seq)).seq;
    await expectChange('cc recipient');
    seq = (await saveSettings({ to: ['payroll@example.invalid', 'second@example.invalid'], cc: ['copy@example.invalid'], subject_template: 'Synthetic {PayrollDate}' }, seq)).seq;
    await expectChange('subject template');
    seq = (await saveSettings({ to: ['payroll@example.invalid', 'second@example.invalid'], cc: ['copy@example.invalid'], subject_template: 'Synthetic {PayrollDate}', body_template: 'Synthetic body {EmployeeName}' }, seq)).seq;
    await expectChange('body template');
    seq = (await saveSettings({ to: ['payroll@example.invalid', 'second@example.invalid'], cc: ['copy@example.invalid'], subject_template: 'Synthetic {PayrollDate}', body_template: 'Synthetic body {EmployeeName}', show_ot_on_pdf: false }, seq)).seq;
    await expectChange('show OT flag');
    const first = await uploadSignature(0x40);
    await expectChange('first signature');
    await uploadSignature(0x41);
    await expectChange('replaced signature');
    const authorize = await t.request('POST', `${SETTINGS}/auto-image/authorize`, {
      cookie: employee,
      body: { expected_seq: seq, signature_attachment_id: first.id },
    });
    expect(authorize.status, JSON.stringify(authorize.body)).toBe(201);
    await expectChange('automatic image authorization');
  });

  it('changes on a policy version or a calendar version change, even with identical rules', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    const before = await payloadOf();
    const policy = await newPolicy(); // identical rules, a new immutable version
    const afterPolicy = await payloadOf();
    expect(afterPolicy.payload.policy.version_ids).toEqual([policy.id]);
    expect(afterPolicy.payload_hash).not.toBe(before.payload_hash);
    const calendar = await t.request('GET', '/api/calendar', { cookie: employee });
    const created = createCalendarVersion(
      t.db,
      t.clock,
      { calendarId: t.calendarId, effectiveFrom: START, weekdays: [1, 2, 3, 4, 5], dates: [], note: 'Synthetic review test calendar version' },
      t.userIds.admin,
    );
    const afterCalendar = await payloadOf();
    expect(afterCalendar.payload.calendar.version_ids).toEqual([created.id]);
    expect(calendar.body.versions.map((version: { id: string }) => version.id)).not.toContain(created.id);
    expect(afterCalendar.payload_hash).not.toBe(afterPolicy.payload_hash);
  });

  it('changes when the balance changes a deficit decision', async () => {
    await addSession('2026-09-15', '09:00', '13:00');
    await newPolicy({ deficit_mode: 'auto_deduct' });
    const noBalance = await payloadOf();
    credit(300);
    const funded = await payloadOf();
    expect(noBalance.payload.deficit_proposals[0].decision).toBe('insufficient_balance');
    expect(funded.payload.deficit_proposals[0].decision).toBe('authorized');
    expect(funded.payload_hash).not.toBe(noBalance.payload_hash);
  });
});

describe('Unicode and canonical stability end to end', () => {
  it('gives the same hash for canonically equivalent employee names', async () => {
    const setName = (name: string) => t.db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(name, t.userIds.employee);
    const composed = String.fromCodePoint(...[0x4e, 0x67, 0x75, 0x79, 0x1ec5, 0x6e, 0x20, 0x56, 0x103, 0x6e, 0x20, 0xc1]); // precomposed Vietnamese letters
    const decomposed = composed.normalize('NFD');
    expect(decomposed).not.toBe(composed);
    setName(composed);
    const a = await hashOf();
    setName(decomposed);
    const b = await hashOf();
    expect(b).toBe(a);
    setName(String.fromCodePoint(...[0x4e, 0x67, 0x75, 0x79, 0x1ec5, 0x6e, 0x20, 0x56, 0x103, 0x6e, 0x20, 0x42]));
    expect(await hashOf()).not.toBe(a);
  });
});

describe('GET writes nothing', () => {
  it('leaves every row, the audit log and the data untouched', async () => {
    await addSession('2026-09-15', '09:00', '18:00');
    await uploadSignature(0x50);
    await saveSettings();
    await review(); // warm-up: the session activity stamp may move once per minute
    const changes = totalChanges();
    const audits = auditRows();
    const tables = ['pay_periods', 'timesheets', 'day_entries', 'work_sessions', 'ot_ledger', 'attachments', 'submission_settings', 'timesheet_revisions', 'jobs'];
    const rows = tables.map((table) => count(`SELECT count(*) FROM ${table}`));
    // This period, a period with no stored row yet, and the other users.
    for (const date of [PAYROLL, '2026-10-16', '2026-09-18', '2026-11-13']) {
      const response = await review(employee, date);
      expect([200, 404], date).toContain(response.status);
    }
    expect((await review(admin)).status).toBe(200);
    expect(totalChanges()).toBe(changes);
    expect(auditRows()).toBe(audits);
    expect(tables.map((table) => count(`SELECT count(*) FROM ${table}`))).toEqual(rows);
  });

  it('does not create the pay period or timesheet row of a period nobody edited', async () => {
    const periods = count('SELECT count(*) FROM pay_periods');
    const sheets = count('SELECT count(*) FROM timesheets');
    const response = await review(employee, '2026-10-16');
    expect(response.status).toBe(200);
    expect(response.body.expected_version).toBe(0);
    expect(count('SELECT count(*) FROM pay_periods')).toBe(periods);
    expect(count('SELECT count(*) FROM timesheets')).toBe(sheets);
  });

  it('is read-only: only GET is routed', async () => {
    const before = totalChanges();
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await t.request(method, reviewPath(), { cookie: employee, body: {} });
      expect([404, 405], method).toContain(response.status);
    }
    expect(totalChanges()).toBe(before);
  });
});

describe('ownership', () => {
  it('requires a signed-in user', async () => {
    const response = await t.request('GET', reviewPath());
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('unauthenticated');
  });

  it('answers 404 for a payroll date of another owner, and 422 for a malformed date', async () => {
    // A second calendar whose payroll dates fall a week later: another owner's date is "not found".
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
    const userId = await createUser(t.db, t.clock, { email: 'other@example.invalid', displayName: 'Other Employee', role: 'employee', password, calendarId: other }, null);
    createPolicyVersion(
      t.db,
      t.clock,
      {
        userId,
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
      userId,
    );
    const login = await t.request('POST', '/api/auth/login', { body: { email: 'other@example.invalid', password } });
    const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
    const foreign = await review(cookie, PAYROLL);
    expect(foreign.status).toBe(404);
    expect(foreign.body.error.code).toBe('not_found');
    expect(JSON.stringify(foreign.body)).not.toContain('Example Employee');
    expect((await review(cookie, '2026-10-09')).status).toBe(200);
    expect((await review(employee, '2026-10-09')).status).toBe(404);
    expect((await review(employee, '2026-10-03')).status).toBe(404);
    expect((await review(employee, '2026-13-45')).status).toBe(422);
    expect((await review(employee, 'not-a-date')).status).toBe(422);
  });

  it('never shows data of another user, also not to an administrator on the same calendar', async () => {
    const session = await addSession('2026-09-15', '09:00', '18:00');
    await addSession('2026-09-16', '09:00', '13:00', {}, admin);
    await uploadSignature(0x60);
    await saveSettings({ to: ['employee-only@example.invalid'], subject_template: 'EMPLOYEE-ONLY {PayrollDate}' });
    const mine = await payloadOf(employee);
    const theirs = await payloadOf(admin);
    expect(theirs.payload.employee.name).toBe('Example Admin');
    expect(theirs.payload.signature).toBeNull();
    expect(theirs.payload.recipients.to).toEqual([]);
    expect(theirs.payload.recipients.subject).not.toContain('EMPLOYEE-ONLY');
    expect(dayOf(theirs, '2026-09-15').sessions).toEqual([]);
    expect(JSON.stringify(theirs)).not.toContain(session.id);
    expect(JSON.stringify(theirs)).not.toContain('employee-only@example.invalid');
    expect(JSON.stringify(mine)).not.toContain('Example Admin');
    expect(theirs.payload.submission.id).not.toBe(mine.payload.submission.id);
    expect(theirs.payload_hash).not.toBe(mine.payload_hash);
  });
});

describe('device zone', () => {
  it('does not regroup the period when a session was entered in another zone', async () => {
    const date = '2026-09-16';
    const start = instantOfWallTime(date, '17:30', LA).replace('.000Z', 'Z');
    const end = instantOfWallTime(date, '18:30', LA).replace('.000Z', 'Z');
    const deviceZone = 'Asia/Ho_Chi_Minh';
    // Precondition: in the device zone the same instants fall on the next calendar day.
    expect(dateTimeIn(start, deviceZone).slice(0, 10)).not.toBe(date);
    const created = await t.request('POST', `/api/days/${date}/sessions`, {
      cookie: employee,
      body: { start, end, input_zone: deviceZone, breaks: [], breaks_confirmed: true },
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const body = await payloadOf();
    const withDeviceZone = body.payload_hash;
    expect(body.payload.days.map((day: { work_date: string }) => day.work_date)).toEqual(datesBetween(START, END));
    // The session stays on its accounting date in the reporting zone.
    expect(dayOf(body, date).sessions).toHaveLength(1);
    expect(dayOf(body, '2026-09-17').sessions).toEqual([]);
    expect(localDateOf(body.payload.reporting_zone, parseUtcInstant(dayOf(body, date).sessions[0].start_utc))).toBe(date);
    // Re-entering the same instants with the reporting zone as the input zone changes nothing in the payload.
    const resaved = await t.request('PUT', `/api/sessions/${created.body.session.id}`, {
      cookie: employee,
      body: { start, end, input_zone: LA, breaks: [], breaks_confirmed: true, expected_version: created.body.session.version },
    });
    expect(resaved.status, JSON.stringify(resaved.body)).toBe(200);
    expect(await hashOf()).toBe(withDeviceZone);
  });
});

describe('automatic presentation: the note and SignOffStatus (WP3-T07B)', () => {
  // "Nop tu dong" with Vietnamese diacritics, built from code points so this file stays ASCII.
  const NOTE_VI = `N${String.fromCodePoint(0x1ed9)}p t${String.fromCodePoint(0x1ef1)} ${String.fromCodePoint(0x111)}${String.fromCodePoint(0x1ed9)}ng`;
  const SUBJECT = 'Timesheet {PayrollDate} - {EmployeeName} - {SignOffStatus}';
  const BODY = 'Status: {SignOffStatus}.';

  function owner(): SessionUser {
    const row = t.db.prepare('SELECT id, email, display_name, role, calendar_id FROM users WHERE id = ?').get(t.userIds.employee) as {
      id: string;
      email: string;
      display_name: string;
      role: SessionUser['role'];
      calendar_id: string;
    };
    return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'test' };
  }

  const automatic = () => buildReviewPayload(t.db, t.clock, owner(), PAYROLL, 'automatic');
  const manual = () => buildReviewPayload(t.db, t.clock, owner(), PAYROLL, 'manual');

  it('freezes the note from the effective settings, and a note change changes the reviewed hash', async () => {
    await saveSettings({ subject_template: SUBJECT, body_template: BODY });
    const off = await payloadOf();
    expect(off.payload.auto_note).toEqual({ enabled: false, text: 'Automatic submission' });
    await saveSettings({ auto_note_enabled: true, auto_note_text: NOTE_VI }, 1);
    const on = await payloadOf();
    expect(on.payload.auto_note).toEqual({ enabled: true, text: NOTE_VI });
    expect(on.payload_hash).not.toBe(off.payload_hash);
    await saveSettings({ auto_note_text: 'Other note' }, 2);
    expect((await payloadOf()).payload_hash).not.toBe(on.payload_hash);
  });

  it('gives a manual submission "Submitted" whatever the note setting', async () => {
    await saveSettings({ subject_template: SUBJECT, body_template: BODY, auto_note_enabled: true, auto_note_text: NOTE_VI });
    const body = await payloadOf();
    expect(body.payload.submission.sign_off_status).toBe('Submitted');
    expect(body.payload.recipients.subject).toBe('Timesheet 2026-10-02 - Example Employee - Submitted');
    expect(body.payload.recipients.body_text).toBe('Status: Submitted.');
    // The direct builder agrees with the route.
    expect(manual().payload).toEqual(body.payload);
  });

  it('gives an automatic submission with the note off exactly the manual payload: no origin is recorded in it', async () => {
    await saveSettings({ subject_template: SUBJECT, body_template: BODY });
    const auto = automatic();
    expect(auto.payload.submission.sign_off_status).toBe('Submitted');
    expect(auto.payload.recipients.subject).toBe('Timesheet 2026-10-02 - Example Employee - Submitted');
    expect(auto.payload).toEqual(manual().payload);
    expect(auto.payloadHash).toBe(manual().payloadHash);
    // What leaves the system (status, subject, bodies) names no origin; the frozen note setting itself is internal.
    const outgoing = JSON.stringify([auto.payload.submission, auto.payload.recipients]);
    expect(outgoing).not.toMatch(/Signed by|pending|automatic|review/i);
  });

  it('gives an automatic submission with the note on the note text in the status, subject and bodies', async () => {
    await saveSettings({ subject_template: SUBJECT, body_template: BODY, auto_note_enabled: true, auto_note_text: NOTE_VI });
    const auto = automatic();
    expect(auto.payload.auto_note).toEqual({ enabled: true, text: NOTE_VI });
    expect(auto.payload.submission.sign_off_status).toBe(NOTE_VI);
    expect(auto.payload.recipients.subject).toBe(`Timesheet 2026-10-02 - Example Employee - ${NOTE_VI}`);
    expect(auto.payload.recipients.body_text).toBe(`Status: ${NOTE_VI}.`);
    expect(auto.payload.recipients.body_html).toBe(`Status: ${NOTE_VI}.`);
    expect(auto.payloadHash).not.toBe(manual().payloadHash);
  });

  it('escapes a note with markup in the HTML body and keeps the subject on one line', async () => {
    await saveSettings({ subject_template: SUBJECT, body_template: BODY, auto_note_enabled: true, auto_note_text: 'Sent <b>by</b> schedule & co' });
    const auto = automatic();
    expect(auto.payload.recipients.body_html).toBe('Status: Sent &lt;b&gt;by&lt;/b&gt; schedule &amp; co.');
    expect(auto.payload.recipients.subject).not.toMatch(/[\r\n]/);
  });
});
