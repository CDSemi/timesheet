import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCalendarVersion, listCalendarVersions } from '../../src/server/services/calendars.ts';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T05: day-entry workspace service. Category source (default rows read their label
 * from the calendar, explicit rows never change), partial leave against the effective B,
 * WFH, and POST /api/days/batch (preview, confirmed conflicts, per-date versions, reasons,
 * one transaction, one audit event per changed entry). Today is 2026-09-29 (LA 13:00): the
 * current period is 2026-09-14…2026-09-27 (payroll 2026-10-02), 2026-09-08…09-13 is old.
 */

let t: TestContext;
let cookie: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  cookie = await t.login('employee');
});

afterEach(() => t.close());

const CURRENT_A = '2026-09-21';
const CURRENT_B = '2026-09-22';
const CURRENT_C = '2026-09-23';
const OLD = '2026-09-09';
const FUTURE = '2026-10-01';

function sessionBody(date: string, from: string, to: string) {
  return {
    start: la(`${date}T${from}`),
    end: la(`${date}T${to}`),
    input_zone: 'America/Los_Angeles',
    breaks: [],
    breaks_confirmed: true,
  };
}

async function addSession(date: string, from: string, to: string, extra: Record<string, unknown> = {}) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie,
    body: { ...sessionBody(date, from, to), ...extra },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body as { session: { id: string; version: number }; day: any };
}

const dayBody = (category: string, extra: Record<string, unknown> = {}) => ({
  category,
  leave_minutes: 0,
  wfh: false,
  notes: '',
  ...extra,
});

function batch(body: unknown, who: string | undefined = cookie) {
  return t.request('POST', '/api/days/batch', { cookie: who, body });
}

const change = (work_date: string, category: string, extra: Record<string, unknown> = {}) => ({
  work_date,
  category,
  ...extra,
});

function count(sql: string, ...params: unknown[]): number {
  return t.db.prepare(sql).pluck().get(...params) as number;
}

function dayEntryAudits(userId: string = t.userIds.employee) {
  return t.db
    .prepare(
      `SELECT operation, entity_id, reason, before_json, after_json, actor_user_id, owner_user_id FROM audit_events
        WHERE entity_type = 'day_entry' AND owner_user_id = ? ORDER BY rowid`,
    )
    .all(userId) as Array<{
    operation: string;
    entity_id: string;
    reason: string | null;
    before_json: string | null;
    after_json: string | null;
    actor_user_id: string;
    owner_user_id: string;
  }>;
}

function entryRows(userId: string = t.userIds.employee) {
  return t.db.prepare('SELECT * FROM day_entries WHERE user_id = ? ORDER BY work_date').all(userId) as Array<Record<string, unknown>>;
}

async function getDay(date: string) {
  const response = await t.request('GET', `/api/days/${date}`, { cookie });
  expect(response.status).toBe(200);
  return response.body;
}

describe('category source (plan observation 2, AC-05 groundwork)', () => {
  it('a session creates a default-source row; the calendar can relabel it later without writing', async () => {
    await addSession(CURRENT_B, '09:00', '12:00');
    expect(entryRows()).toMatchObject([{ work_date: CURRENT_B, category_source: 'default' }]);
    const before = await getDay(CURRENT_B);
    expect(before).toMatchObject({ category: 'Worked', category_source: 'default', attendance_expected: true });
    expect(before.entry).toMatchObject({ category: 'Worked', category_source: 'default', leave_kind: null });
    const rowBefore = entryRows();
    const auditsBefore = dayEntryAudits().length;

    // An admin-side calendar change (here the service directly) makes 2026-09-22 a holiday.
    const latest = listCalendarVersions(t.db, t.calendarId).at(-1);
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: '2026-09-14',
        weekdays: [...(latest?.weekdays ?? [1, 2, 3, 4, 5])],
        dates: [...(latest?.dates ?? []), { date: CURRENT_B, kind: 'holiday', name: 'Synthetic company holiday' }],
      },
      t.userIds.admin,
    );

    const after = await getDay(CURRENT_B);
    expect(after).toMatchObject({ category: 'Holiday', category_source: 'default', attendance_expected: false });
    // The import never writes employee rows: the stored row and the audit trail are untouched.
    expect(entryRows()).toEqual(rowBefore);
    expect(dayEntryAudits()).toHaveLength(auditsBefore);
  });

  it('an explicit row keeps its label when the calendar later changes', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_C}`, { cookie, body: dayBody('Worked') });
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject({ category: 'Worked', category_source: 'explicit' });
    const latest = listCalendarVersions(t.db, t.calendarId).at(-1);
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: '2026-09-14',
        weekdays: [...(latest?.weekdays ?? [1, 2, 3, 4, 5])],
        dates: [...(latest?.dates ?? []), { date: CURRENT_C, kind: 'holiday', name: 'Synthetic company holiday' }],
      },
      t.userIds.admin,
    );
    const after = await getDay(CURRENT_C);
    expect(after).toMatchObject({ category: 'Worked', category_source: 'explicit', default_category: 'Holiday' });
  });

  it('saving a day over a default row makes it explicit and audits the effective label', async () => {
    await addSession(CURRENT_A, '09:00', '12:00');
    const first = await getDay(CURRENT_A);
    const saved = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { expected_version: first.entry.version }),
    });
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject({ category_source: 'explicit' });
    const update = dayEntryAudits().find((row) => row.operation === 'day_entry.update');
    expect(JSON.parse(update?.before_json ?? '{}')).toMatchObject({ category: 'Worked', category_source: 'default' });
    expect(JSON.parse(update?.after_json ?? '{}')).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });
});

describe('partial leave, leave kind and WFH (R-05, owner decision E-2)', () => {
  it('240 work + 240 leave: no deficit and no OT, and leave never counts as work', async () => {
    await addSession(CURRENT_A, '09:00', '13:00');
    const first = await getDay(CURRENT_A);
    const saved = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 240, leave_kind: 'vacation', expected_version: first.entry.version }),
    });
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject({
      leave_minutes: 240,
      leave_kind: 'vacation',
      deficit_minutes: 0,
      attendance_expected: true,
    });
    expect(saved.body.entry).toMatchObject({ leave_minutes: 240, leave_kind: 'vacation' });
    expect(saved.body.calculation).toMatchObject({ regular_minutes: 240, eligible_minutes: 0, credited_minutes: 0 });
  });

  it('without the leave the same four hours leave a 240-minute deficit', async () => {
    await addSession(CURRENT_A, '09:00', '13:00');
    const view = await getDay(CURRENT_A);
    expect(view).toMatchObject({ leave_minutes: 0, leave_kind: null, deficit_minutes: 240 });
  });

  it('rejects leave above the effective B, a missing kind and a kind without minutes (422)', async () => {
    const over = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 481, leave_kind: 'vacation' }),
    });
    expect(over.status).toBe(422);
    expect(over.body.error).toMatchObject({ code: 'leave_exceeds_required', details: { leave_minutes: 481, required_minutes: 480 } });
    const noKind = await t.request('PUT', `/api/days/${CURRENT_A}`, { cookie, body: dayBody('Worked', { leave_minutes: 60 }) });
    expect(noKind.status).toBe(422);
    expect(noKind.body.error.code).toBe('leave_kind_required');
    const noMinutes = await t.request('PUT', `/api/days/${CURRENT_A}`, { cookie, body: dayBody('Worked', { leave_kind: 'sick' }) });
    expect(noMinutes.status).toBe(422);
    expect(noMinutes.body.error.code).toBe('leave_kind_without_minutes');
    const category = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('OT-funded leave', { leave_minutes: 60, leave_kind: 'ot' }),
    });
    expect(category.status).toBe(422);
    const kind = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 60, leave_kind: 'ot-funded' }),
    });
    expect(kind.status).toBe(422);
    expect(entryRows()).toEqual([]);
  });

  it('validates against the B effective on the work date, not the default 480', async () => {
    const policy = (await t.request('GET', '/api/policies', { cookie })).body.policies[0];
    const created = await t.request('POST', '/api/policies', {
      cookie,
      body: {
        effective_from: '2026-09-14',
        required_minutes: 360,
        threshold_minutes: policy.threshold_minutes,
        rounding_step_minutes: policy.rounding_step_minutes,
        reference_start: '09:00',
        reference_end: '16:00',
        breaks: [{ start_offset_minutes: 180, duration_minutes: 60, counts_as_work: false }],
        deficit_mode: 'ignore',
      },
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const over = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 361, leave_kind: 'vacation' }),
    });
    expect(over.status).toBe(422);
    expect(over.body.error).toMatchObject({ code: 'leave_exceeds_required', details: { required_minutes: 360 } });
    const ok = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 360, leave_kind: 'vacation' }),
    });
    expect(ok.status).toBe(200);
  });

  it('WFH is a stored location flag: it never changes the attendance or the minutes', async () => {
    await addSession(CURRENT_A, '09:00', '18:00', { breaks: [{ start: la(`${CURRENT_A}T12:00`), end: la(`${CURRENT_A}T13:00`), counts_as_work: false }] });
    const office = await getDay(CURRENT_A);
    const saved = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie,
      body: dayBody('Worked', { wfh: true, notes: 'Synthetic home day', expected_version: office.entry.version }),
    });
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject({ wfh: true, category: 'Worked', attendance_expected: true, deficit_minutes: 0 });
    expect(saved.body.entry).toMatchObject({ wfh: true, notes: 'Synthetic home day' });
    expect(saved.body.calculation).toEqual(office.calculation);
    const listed = await t.request('GET', '/api/timesheets/2026-10-02', { cookie });
    expect(listed.body.days.find((day: any) => day.work_date === CURRENT_A)).toMatchObject({ wfh: true });
  });

  it('a day without an entry exposes neutral leave, WFH and OT-leave fields', async () => {
    const view = await getDay(CURRENT_B);
    expect(view).toMatchObject({
      category_source: 'default',
      leave_minutes: 0,
      leave_kind: null,
      wfh: false,
      ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    });
  });
});

describe('POST /api/days/batch: preview', () => {
  it('previews creates, updates and unchanged entries without writing anything', async () => {
    const existing = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    expect(existing.status).toBe(200);
    const rowsBefore = entryRows();
    const auditsBefore = dayEntryAudits().length;
    const timesheetsBefore = t.db.prepare('SELECT * FROM timesheets').all();

    const preview = await batch({
      mode: 'preview',
      entries: [
        change(CURRENT_A, 'Vacation', { expected_version: null }),
        change(CURRENT_B, 'Sick', { expected_version: existing.body.entry.version }),
        change(CURRENT_C, 'Worked', { expected_version: null }),
      ],
    });
    expect(preview.status, JSON.stringify(preview.body)).toBe(200);
    expect(preview.body).toMatchObject({ mode: 'preview', can_commit: true, changed_count: 3, reason_required: false });
    expect(preview.body.entries.map((item: any) => [item.work_date, item.status])).toEqual([
      [CURRENT_A, 'create'],
      [CURRENT_B, 'update'],
      [CURRENT_C, 'create'],
    ]);
    expect(preview.body.entries[1]).toMatchObject({
      current_version: 1,
      before: { category: 'Vacation' },
      after: { category: 'Sick' },
    });
    expect(entryRows()).toEqual(rowsBefore);
    expect(dayEntryAudits()).toHaveLength(auditsBefore);
    expect(t.db.prepare('SELECT * FROM timesheets').all()).toEqual(timesheetsBefore);
  });

  it('reports an identical entry as unchanged', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const preview = await batch({
      mode: 'preview',
      entries: [change(CURRENT_B, 'Vacation', { expected_version: saved.body.entry.version })],
    });
    expect(preview.body).toMatchObject({ changed_count: 0 });
    expect(preview.body.entries[0].status).toBe('unchanged');
  });

  it('flags stale versions and invalid entries per date instead of failing the preview', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const preview = await batch({
      mode: 'preview',
      entries: [
        change(CURRENT_B, 'Sick', { expected_version: saved.body.entry.version + 5 }),
        change(CURRENT_A, 'Worked', { leave_minutes: 600, leave_kind: 'vacation' }),
      ],
    });
    expect(preview.status).toBe(200);
    expect(preview.body.can_commit).toBe(false);
    expect(preview.body.entries[0]).toMatchObject({ work_date: CURRENT_B, status: 'stale', current_version: 1 });
    expect(preview.body.entries[1]).toMatchObject({ work_date: CURRENT_A, status: 'invalid', error: { code: 'leave_exceeds_required' } });
  });

  it('marks old dates as reason-required in the preview', async () => {
    const preview = await batch({ mode: 'preview', entries: [change(OLD, 'Vacation'), change(CURRENT_A, 'Vacation')] });
    expect(preview.body).toMatchObject({ reason_required: true, reason_required_dates: [OLD] });
    expect(preview.body.entries[0]).toMatchObject({ period_relation: 'old', reason_required: true });
    expect(preview.body.entries[1]).toMatchObject({ period_relation: 'current', reason_required: false });
  });
});

describe('POST /api/days/batch: commit', () => {
  it('applies a batch across old and current periods with one reason and one audit event per changed entry', async () => {
    const existing = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const auditsBefore = dayEntryAudits().length;
    const body = {
      mode: 'commit',
      reason: 'Synthetic correction of old attendance',
      entries: [
        change(OLD, 'Sick', { expected_version: null }),
        change(CURRENT_A, 'Vacation', { expected_version: null }),
        change(CURRENT_B, 'Off', { expected_version: existing.body.entry.version, wfh: true }),
        change(FUTURE, 'Vacation', { expected_version: null }),
      ],
    };
    const response = await batch(body);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toMatchObject({ mode: 'commit', changed: [OLD, CURRENT_A, CURRENT_B, FUTURE], unchanged: [] });
    expect(response.body.days.map((day: any) => [day.work_date, day.category, day.category_source])).toEqual([
      [OLD, 'Sick', 'explicit'],
      [CURRENT_A, 'Vacation', 'explicit'],
      [CURRENT_B, 'Off', 'explicit'],
      [FUTURE, 'Vacation', 'explicit'],
    ]);
    expect(response.body.days[2]).toMatchObject({ wfh: true, entry: { version: 2 } });

    const audits = dayEntryAudits().slice(auditsBefore);
    expect(audits).toHaveLength(4);
    expect(audits.map((row) => row.operation)).toEqual([
      'day_entry.create',
      'day_entry.create',
      'day_entry.update',
      'day_entry.create',
    ]);
    for (const row of audits) {
      expect(row).toMatchObject({
        reason: 'Synthetic correction of old attendance',
        actor_user_id: t.userIds.employee,
        owner_user_id: t.userIds.employee,
      });
    }
    expect(JSON.parse(audits[2]?.before_json ?? '{}')).toMatchObject({ category: 'Vacation', version: 1 });
    expect(JSON.parse(audits[2]?.after_json ?? '{}')).toMatchObject({ category: 'Off', version: 2, wfh: true });
    // Each date lands in its own timesheet period (old, current and future).
    const periods = t.db.prepare('SELECT DISTINCT timesheet_id FROM day_entries WHERE user_id = ?').all(t.userIds.employee);
    expect(periods).toHaveLength(3);
  });

  it('requires a reason when any date is old and writes nothing without it', async () => {
    const before = { rows: entryRows(), audits: dayEntryAudits().length, timesheets: count('SELECT count(*) FROM timesheets') };
    const response = await batch({
      mode: 'commit',
      entries: [change(CURRENT_A, 'Vacation', { expected_version: null }), change(OLD, 'Sick', { expected_version: null })],
    });
    expect(response.status).toBe(422);
    expect(response.body.error).toMatchObject({ code: 'reason_required', details: { work_dates: [OLD] } });
    const blank = await batch({
      mode: 'commit',
      reason: '   ',
      entries: [change(OLD, 'Sick', { expected_version: null })],
    });
    expect(blank.status).toBe(422);
    expect(entryRows()).toEqual(before.rows);
    expect(dayEntryAudits()).toHaveLength(before.audits);
    expect(count('SELECT count(*) FROM timesheets')).toBe(before.timesheets);
  });

  it('needs no reason for current and future dates', async () => {
    const response = await batch({
      mode: 'commit',
      entries: [change(CURRENT_A, 'Vacation', { expected_version: null }), change(FUTURE, 'Off', { expected_version: null })],
    });
    expect(response.status).toBe(200);
    expect(dayEntryAudits().map((row) => row.reason)).toEqual([null, null]);
  });

  it('is atomic: one stale date rolls back every date (409 stale_version)', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const before = { rows: entryRows(), audits: dayEntryAudits().length };
    const response = await batch({
      mode: 'commit',
      entries: [
        change(CURRENT_A, 'Sick', { expected_version: null }),
        change(CURRENT_B, 'Sick', { expected_version: saved.body.entry.version + 1 }),
      ],
    });
    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: 'stale_version', details: { work_dates: [CURRENT_B] } });
    expect(entryRows()).toEqual(before.rows);
    expect(dayEntryAudits()).toHaveLength(before.audits);
  });

  it('treats a missing expected_version on an existing entry and a version on a missing entry as stale', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    expect(saved.status).toBe(200);
    const missing = await batch({ mode: 'commit', entries: [change(CURRENT_B, 'Sick')] });
    expect(missing.status).toBe(409);
    expect(missing.body.error.code).toBe('stale_version');
    const phantom = await batch({ mode: 'commit', entries: [change(CURRENT_A, 'Sick', { expected_version: 1 })] });
    expect(phantom.status).toBe(409);
    expect(phantom.body.error.code).toBe('stale_version');
  });

  it('a concurrent edit between preview and commit makes the commit stale', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const version = saved.body.entry.version;
    const preview = await batch({ mode: 'preview', entries: [change(CURRENT_B, 'Sick', { expected_version: version })] });
    expect(preview.body.entries[0].status).toBe('update');
    const other = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Off', { expected_version: version }) });
    expect(other.status).toBe(200);
    const commit = await batch({ mode: 'commit', entries: [change(CURRENT_B, 'Sick', { expected_version: version })] });
    expect(commit.status).toBe(409);
    expect(entryRows()[0]).toMatchObject({ category: 'Off', version: 2 });
  });

  it('is atomic for validation errors too (leave above B on one date)', async () => {
    const before = entryRows();
    const response = await batch({
      mode: 'commit',
      entries: [
        change(CURRENT_A, 'Vacation', { expected_version: null }),
        change(CURRENT_B, 'Worked', { expected_version: null, leave_minutes: 481, leave_kind: 'vacation' }),
      ],
    });
    expect(response.status).toBe(422);
    expect(response.body.error).toMatchObject({ code: 'batch_invalid', details: { errors: [{ work_date: CURRENT_B, code: 'leave_exceeds_required' }] } });
    expect(entryRows()).toEqual(before);
  });

  it('skips unchanged entries: no version bump and no audit event', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, { cookie, body: dayBody('Vacation') });
    const audits = dayEntryAudits().length;
    const response = await batch({
      mode: 'commit',
      entries: [
        change(CURRENT_B, 'Vacation', { expected_version: saved.body.entry.version }),
        change(CURRENT_A, 'Vacation', { expected_version: null }),
      ],
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ changed: [CURRENT_A], unchanged: [CURRENT_B] });
    expect(dayEntryAudits()).toHaveLength(audits + 1);
    expect(entryRows().find((row) => row.work_date === CURRENT_B)).toMatchObject({ version: 1 });
  });

  it('keeps the other fields of an existing entry when a batch entry omits them', async () => {
    const saved = await t.request('PUT', `/api/days/${CURRENT_B}`, {
      cookie,
      body: dayBody('Worked', { leave_minutes: 120, leave_kind: 'ot', wfh: true, notes: 'Synthetic note' }),
    });
    const response = await batch({
      mode: 'commit',
      entries: [change(CURRENT_B, 'Vacation', { expected_version: saved.body.entry.version })],
    });
    expect(response.status).toBe(200);
    expect(response.body.days[0].entry).toMatchObject({
      category: 'Vacation',
      leave_minutes: 120,
      leave_kind: 'ot',
      wfh: true,
      notes: 'Synthetic note',
    });
  });

  it('rejects duplicate dates, an empty batch, unknown fields and a mode that is not preview or commit', async () => {
    const duplicate = await batch({ mode: 'commit', entries: [change(CURRENT_A, 'Off'), change(CURRENT_A, 'Sick')] });
    expect(duplicate.status).toBe(422);
    expect(duplicate.body.error.code).toBe('duplicate_date');
    expect((await batch({ mode: 'commit', entries: [] })).status).toBe(422);
    expect((await batch({ mode: 'apply', entries: [change(CURRENT_A, 'Off')] })).status).toBe(422);
    expect((await batch({ mode: 'commit', entries: [change(CURRENT_A, 'Off', { user_id: t.userIds.admin })] })).status).toBe(422);
    expect((await batch({ mode: 'commit', user_id: t.userIds.admin, entries: [change(CURRENT_A, 'Off')] })).status).toBe(422);
    expect((await batch({ mode: 'commit', entries: [change('2026-02-30', 'Off')] })).status).toBe(422);
    expect((await batch({ mode: 'commit', entries: [change(CURRENT_A, 'OT-funded leave')] })).status).toBe(422);
    const tooMany = Array.from({ length: 63 }, (_, index) => change(`2026-08-${String((index % 28) + 1).padStart(2, '0')}`, 'Off'));
    expect((await batch({ mode: 'commit', entries: tooMany })).status).toBe(422);
    expect(entryRows()).toEqual([]);
  });
});

describe('POST /api/days/batch: conflicts with recorded work', () => {
  it('reports sessions and clock evidence, requires confirmation and never deletes a session', async () => {
    const manual = await addSession(CURRENT_A, '09:00', '12:00');
    const clockIn = await t.request('POST', '/api/clock/in', { cookie, body: { input_zone: 'America/Los_Angeles' } });
    expect(clockIn.status).toBe(201);
    t.clock.advanceSeconds(3600);
    const clockDate = clockIn.body.day.work_date as string;
    const clockOut = await t.request('POST', '/api/clock/out', {
      cookie,
      body: { breaks_confirmed: false, expected_version: clockIn.body.session.version },
    });
    expect(clockOut.status).toBe(200);
    const sessionsBefore = t.db.prepare('SELECT id, version, start_utc, end_utc, source FROM work_sessions ORDER BY id').all();
    expect(sessionsBefore).toHaveLength(2);
    const sessionIds = sessionsBefore.map((row: any) => row.id).sort();

    const entries = [
      change(CURRENT_A, 'Vacation', { expected_version: (await getDay(CURRENT_A)).entry.version }),
      change(clockDate, 'Sick', { expected_version: (await getDay(clockDate)).entry.version }),
      change(CURRENT_C, 'Off', { expected_version: null }),
    ];
    const preview = await batch({ mode: 'preview', entries });
    expect(preview.status).toBe(200);
    expect(preview.body.requires_conflict_confirmation).toBe(true);
    expect(preview.body.conflicts).toEqual([
      expect.objectContaining({
        work_date: CURRENT_A,
        session_count: 1,
        clock_session_count: 0,
        session_ids: [manual.session.id],
        current_category: 'Worked',
        new_category: 'Vacation',
      }),
      expect.objectContaining({ work_date: clockDate, session_count: 1, clock_session_count: 1, new_category: 'Sick' }),
    ]);
    expect(preview.body.entries.map((item: any) => item.conflict)).toEqual([true, true, false]);

    const before = { rows: entryRows(), audits: dayEntryAudits().length };
    const refused = await batch({ mode: 'commit', entries });
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('conflicts_require_confirmation');
    expect(refused.body.error.details.conflicts).toHaveLength(2);
    const notConfirmed = await batch({ mode: 'commit', confirm_conflicts: false, entries });
    expect(notConfirmed.status).toBe(409);
    expect(entryRows()).toEqual(before.rows);
    expect(dayEntryAudits()).toHaveLength(before.audits);

    const confirmed = await batch({ mode: 'commit', confirm_conflicts: true, entries });
    expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
    // The recorded work stays exactly as it was; the label changed and the minutes still compute.
    expect(t.db.prepare('SELECT id, version, start_utc, end_utc, source FROM work_sessions ORDER BY id').all()).toEqual(sessionsBefore);
    expect(confirmed.body.days[0]).toMatchObject({ category: 'Vacation', sessions: [{ id: manual.session.id }] });
    expect(confirmed.body.days[0].calculation).toMatchObject({ status: 'complete', regular_minutes: 180 });
    expect(sessionIds).toHaveLength(2);
  });

  it('does not flag a Worked label or an already-effective label on a date with sessions', async () => {
    await addSession(CURRENT_A, '09:00', '12:00');
    const entry = (await getDay(CURRENT_A)).entry;
    const preview = await batch({
      mode: 'preview',
      entries: [change(CURRENT_A, 'Worked', { expected_version: entry.version, wfh: true })],
    });
    expect(preview.body.conflicts).toEqual([]);
    expect(preview.body.requires_conflict_confirmation).toBe(false);
    const commit = await batch({
      mode: 'commit',
      entries: [change(CURRENT_A, 'Worked', { expected_version: entry.version, wfh: true })],
    });
    expect(commit.status).toBe(200);
  });

  it('an old date with sessions needs both the reason and the confirmation', async () => {
    await addSession(OLD, '09:00', '12:00', { reason: 'Synthetic backfill' });
    const entry = (await getDay(OLD)).entry;
    const entries = [change(OLD, 'Sick', { expected_version: entry.version })];
    const noReason = await batch({ mode: 'commit', confirm_conflicts: true, entries });
    expect(noReason.status).toBe(422);
    expect(noReason.body.error.code).toBe('reason_required');
    const noConfirm = await batch({ mode: 'commit', reason: 'Synthetic fix', entries });
    expect(noConfirm.status).toBe(409);
    const ok = await batch({ mode: 'commit', reason: 'Synthetic fix', confirm_conflicts: true, entries });
    expect(ok.status).toBe(200);
    expect(count('SELECT count(*) FROM work_sessions WHERE user_id = ?', t.userIds.employee)).toBe(1);
  });
});

describe('POST /api/days/batch: ownership and isolation', () => {
  it('works only on the caller\'s own entries; another user\'s entries are untouched and invisible', async () => {
    const admin = await t.login('admin');
    const adminSaved = await t.request('PUT', `/api/days/${CURRENT_A}`, {
      cookie: admin,
      body: dayBody('Vacation', { notes: 'admin private note' }),
    });
    expect(adminSaved.status).toBe(200);
    const adminRows = entryRows(t.userIds.admin);
    const adminAudits = dayEntryAudits(t.userIds.admin);

    // The employee's expected_version cannot target the admin's entry: it is simply stale.
    const probe = await batch({ mode: 'commit', entries: [change(CURRENT_A, 'Sick', { expected_version: adminSaved.body.entry.version })] });
    expect(probe.status).toBe(409);
    expect(JSON.stringify(probe.body)).not.toContain('admin private note');
    const preview = await batch({ mode: 'preview', entries: [change(CURRENT_A, 'Sick', { expected_version: null })] });
    expect(preview.body.entries[0]).toMatchObject({ status: 'create', current_version: null, before: null });
    expect(JSON.stringify(preview.body)).not.toContain('admin private note');

    // A create for the same date writes the employee's own row only.
    const created = await batch({ mode: 'commit', entries: [change(CURRENT_A, 'Sick', { expected_version: null })] });
    expect(created.status).toBe(200);
    expect(entryRows(t.userIds.admin)).toEqual(adminRows);
    expect(dayEntryAudits(t.userIds.admin)).toEqual(adminAudits);
    expect(entryRows()).toMatchObject([{ work_date: CURRENT_A, category: 'Sick', user_id: t.userIds.employee }]);
    // The admin can use the same endpoint on their own data only.
    const adminBatch = await batch(
      { mode: 'commit', entries: [change(CURRENT_A, 'Off', { expected_version: adminSaved.body.entry.version })] },
      admin,
    );
    expect(adminBatch.status).toBe(200);
    expect(entryRows()).toMatchObject([{ category: 'Sick' }]);
  });

  it('requires a session and a same-origin JSON request', async () => {
    const body = { mode: 'preview', entries: [change(CURRENT_A, 'Off')] };
    expect((await t.request('POST', '/api/days/batch', { body })).status).toBe(401);
    const crossOrigin = await t.request('POST', '/api/days/batch', { cookie, body, origin: 'http://evil.example.invalid' });
    expect(crossOrigin.status).toBe(403);
    const form = await t.request('POST', '/api/days/batch', {
      cookie,
      body: 'mode=preview',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    expect(form.status).toBe(415);
  });
});
