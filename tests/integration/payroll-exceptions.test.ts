import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T08 (FR-13, E-10, WP1 limitation, WP1_RECHECK risk 6): an admin creates a payroll
 * exception with a required reason. When the shared pay_periods row already exists it is
 * refreshed in the same transaction, unless a finalized timesheet references it (then the
 * exception is refused). Finalization is simulated with the existing schema column only.
 * Today is 2026-10-09 (LA 13:00): payroll 2026-10-16 is the current one, its period is
 * 2026-09-28…2026-10-11 (cycle index 1) and its default due is Tuesday 2026-10-13 17:00.
 */

let t: TestContext;
let admin: string;
let employee: string;

const PATH = '/api/admin/payroll-exceptions';

beforeEach(async () => {
  t = await createTestContext('2026-10-09T20:00:00Z');
  admin = await t.login('admin');
  employee = await t.login('employee');
});

afterEach(() => t.close());

function exceptionBody(overrides: Record<string, unknown> = {}) {
  return {
    calendar_id: t.calendarId,
    nominal_payroll_date: '2026-10-16',
    payroll_date: '2026-10-15',
    due_local_date: '2026-10-14',
    due_local_time: '12:00',
    reason: 'Synthetic bank holiday moves payroll',
    ...overrides,
  };
}

async function addSession(who: string, date: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: { start: la(`${date}T09:00`), end: la(`${date}T17:00`), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

const periodRow = () =>
  t.db
    .prepare(
      `SELECT id, period_index, nominal_payroll_date, payroll_date, period_start, period_end, due_local_date,
              due_local_time, due_at_utc, is_exception
         FROM pay_periods WHERE period_index = 1`,
    )
    .get() as Record<string, unknown> | undefined;
const exceptionRows = () => t.db.prepare('SELECT * FROM payroll_exceptions').all();
const auditRows = () =>
  t.db.prepare("SELECT * FROM audit_events WHERE operation = 'payroll_exception.create'").all() as Array<{
    actor_user_id: string;
    owner_user_id: string | null;
    entity_type: string;
    reason: string | null;
    before_json: string | null;
    after_json: string | null;
  }>;
const auditCount = () => t.db.prepare('SELECT count(*) FROM audit_events').pluck().get() as number;

describe('access control', () => {
  it('answers 401 without a session and 403 to an employee, changing nothing', async () => {
    const anonymous = await t.request('POST', PATH, { body: exceptionBody() });
    expect(anonymous.status).toBe(401);
    const forbidden = await t.request('POST', PATH, { cookie: employee, body: exceptionBody() });
    expect(forbidden.status).toBe(403);
    expect(exceptionRows()).toEqual([]);
    expect(auditRows()).toEqual([]);
  });

  it('rejects a missing Origin, unknown fields and an unknown calendar', async () => {
    expect((await t.request('POST', PATH, { cookie: admin, body: exceptionBody(), origin: null })).status).toBe(403);
    const extra = await t.request('POST', PATH, { cookie: admin, body: { ...exceptionBody(), created_by: t.userIds.employee } });
    expect(extra.status).toBe(422);
    const unknown = await t.request('POST', PATH, { cookie: admin, body: exceptionBody({ calendar_id: 'no-such-calendar' }) });
    expect(unknown.status).toBe(404);
    expect(exceptionRows()).toEqual([]);
  });
});

describe('creating an exception', () => {
  it('stores the exception with its reason, audits it and shows it on the calendar read', async () => {
    const response = await t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.payroll_exception).toMatchObject({
      calendar_id: t.calendarId,
      nominal_payroll_date: '2026-10-16',
      payroll_date: '2026-10-15',
      due_local_date: '2026-10-14',
      due_local_time: '12:00',
      reason: 'Synthetic bank holiday moves payroll',
    });
    expect(Object.keys(response.body)).toEqual(['payroll_exception']);
    expect(exceptionRows()).toMatchObject([{ nominal_payroll_date: '2026-10-16', created_by: t.userIds.admin }]);

    const audits = auditRows();
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      actor_user_id: t.userIds.admin,
      owner_user_id: null,
      entity_type: 'payroll_exception',
      reason: 'Synthetic bank holiday moves payroll',
    });
    expect(audits[0]?.before_json).toBeNull();
    expect(JSON.parse(audits[0]?.after_json ?? '{}')).toMatchObject({ payroll_date: '2026-10-15', refreshed_pay_period: false });

    const calendar = await t.request('GET', '/api/calendar', { cookie: employee });
    expect(calendar.body.payroll_exceptions).toEqual([
      { nominal_payroll_date: '2026-10-16', payroll_date: '2026-10-15', due_local_date: '2026-10-14', due_local_time: '12:00' },
    ]);
    const current = await t.request('GET', '/api/periods/current', { cookie: employee });
    expect(current.body.current).toMatchObject({ payroll_date: '2026-10-15', is_exception: true, period_start: '2026-09-28' });
  });

  it('requires a reason and validates the exception without writing', async () => {
    const withoutReason = exceptionBody();
    delete (withoutReason as Record<string, unknown>).reason;
    const cases: Array<[string, Record<string, unknown>, number, string]> = [
      ['missing reason', withoutReason, 422, 'validation_error'],
      ['blank reason', exceptionBody({ reason: '   ' }), 422, 'reason_required'],
      ['not a payroll date', exceptionBody({ nominal_payroll_date: '2026-10-17' }), 422, 'invalid_payroll_exception'],
      ['moved more than half a cycle', exceptionBody({ payroll_date: '2026-10-24' }), 422, 'invalid_payroll_exception'],
      ['invalid date', exceptionBody({ payroll_date: '2026-02-30' }), 422, 'invalid_date'],
    ];
    for (const [label, body, status, code] of cases) {
      const response = await t.request('POST', PATH, { cookie: admin, body });
      expect(response.status, label).toBe(status);
      expect(response.body.error.code, label).toBe(code);
    }
    const badTime = await t.request('POST', PATH, { cookie: admin, body: exceptionBody({ due_local_time: '25:00' }) });
    expect(badTime.status).toBe(422);
    expect(exceptionRows()).toEqual([]);
    expect(auditRows()).toEqual([]);
  });

  it('refuses a second exception for the same payroll date', async () => {
    expect((await t.request('POST', PATH, { cookie: admin, body: exceptionBody() })).status).toBe(201);
    const duplicate = await t.request('POST', PATH, { cookie: admin, body: exceptionBody({ payroll_date: '2026-10-14' }) });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('payroll_exception_exists');
    expect(exceptionRows()).toHaveLength(1);
    expect(auditRows()).toHaveLength(1);
  });

  it('uses the exception when the period row is first created later', async () => {
    expect(periodRow()).toBeUndefined();
    expect((await t.request('POST', PATH, { cookie: admin, body: exceptionBody() })).status).toBe(201);
    await addSession(employee, '2026-10-07');
    expect(periodRow()).toMatchObject({ payroll_date: '2026-10-15', due_local_date: '2026-10-14', is_exception: 1 });
  });
});

describe('stored pay_periods rows (E-10)', () => {
  it('refreshes an unfinalized stored row in the same transaction, keeping its id and period', async () => {
    await addSession(employee, '2026-10-07');
    await addSession(admin, '2026-10-07');
    const before = periodRow();
    expect(before).toMatchObject({ payroll_date: '2026-10-16', due_local_date: '2026-10-13', due_local_time: '17:00', is_exception: 0 });
    const timesheetsBefore = t.db.prepare('SELECT id, pay_period_id, version FROM timesheets ORDER BY id').all();

    const response = await t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(Object.keys(response.body)).toEqual(['payroll_exception']);

    const after = periodRow();
    expect(after).toMatchObject({
      id: before?.id,
      period_start: '2026-09-28',
      period_end: '2026-10-11',
      nominal_payroll_date: '2026-10-16',
      payroll_date: '2026-10-15',
      due_local_date: '2026-10-14',
      due_local_time: '12:00',
      due_at_utc: '2026-10-14T19:00:00Z',
      is_exception: 1,
    });
    // Timesheets stay bound to the same row; they are not rewritten.
    expect(t.db.prepare('SELECT id, pay_period_id, version FROM timesheets ORDER BY id').all()).toEqual(timesheetsBefore);

    // The stored row now equals what the engine computes, and the old payroll date is gone.
    const view = await t.request('GET', '/api/timesheets/2026-10-15', { cookie: employee });
    expect(view.status).toBe(200);
    expect(view.body.period).toMatchObject({ payroll_date: '2026-10-15', due_at_utc: after?.due_at_utc, is_exception: true });
    expect(view.body.days.some((day: { sessions: unknown[] }) => day.sessions.length === 1)).toBe(true);
    expect((await t.request('GET', '/api/timesheets/2026-10-16', { cookie: employee })).status).toBe(422);

    const audit = auditRows()[0];
    expect(JSON.parse(audit?.before_json ?? '{}')).toMatchObject({ payroll_date: '2026-10-16', due_local_date: '2026-10-13' });
    expect(JSON.parse(audit?.after_json ?? '{}')).toMatchObject({ payroll_date: '2026-10-15', refreshed_pay_period: true });
  });

  it('answers the same success body whether or not employees have timesheets in the period (WP2-A2-02)', async () => {
    const request = () => t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    // Fixture A: nobody has a timesheet, so no pay_periods row exists.
    expect(periodRow()).toBeUndefined();
    const without = await request();
    expect(without.status, JSON.stringify(without.body)).toBe(201);
    expect(periodRow()).toBeUndefined();

    // Fixture B: the same request on a fresh database after two users have edited the period.
    const other = await createTestContext('2026-10-09T20:00:00Z');
    try {
      const otherAdmin = await other.login('admin');
      const otherEmployee = await other.login('employee');
      for (const who of [otherAdmin, otherEmployee]) {
        const added = await other.request('POST', '/api/days/2026-10-07/sessions', {
          cookie: who,
          body: { start: la('2026-10-07T09:00'), end: la('2026-10-07T17:00'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
        });
        expect(added.status, JSON.stringify(added.body)).toBe(201);
      }
      expect(other.db.prepare('SELECT count(*) FROM pay_periods').pluck().get()).toBe(1);
      const withTimesheets = await other.request('POST', PATH, {
        cookie: otherAdmin,
        body: { ...exceptionBody(), calendar_id: other.calendarId },
      });
      expect(withTimesheets.status, JSON.stringify(withTimesheets.body)).toBe(201);
      // The stored row really was refreshed in fixture B, yet the response says nothing about it.
      expect(other.db.prepare('SELECT is_exception FROM pay_periods').pluck().get()).toBe(1);
      const stripped = (body: Record<string, unknown>, calendarId: string) =>
        JSON.parse(JSON.stringify(body).replaceAll(calendarId, '<calendar>')) as Record<string, unknown>;
      expect(stripped(withTimesheets.body, other.calendarId)).toEqual(stripped(without.body, t.calendarId));
      expect(Object.keys(withTimesheets.body)).toEqual(['payroll_exception']);
    } finally {
      await other.close();
    }
  });

  it('refreshes the due date alone when only the deadline moves', async () => {
    await addSession(employee, '2026-10-07');
    const response = await t.request('POST', PATH, {
      cookie: admin,
      body: exceptionBody({ payroll_date: '2026-10-16', due_local_date: '2026-10-15', due_local_time: null }),
    });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(periodRow()).toMatchObject({ payroll_date: '2026-10-16', due_local_date: '2026-10-15', due_local_time: '17:00', is_exception: 1 });
  });

  it('refuses when a finalized timesheet references the row and changes nothing', async () => {
    await addSession(employee, '2026-10-07');
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1 WHERE user_id = ?').run(t.userIds.employee);
    const before = periodRow();
    const audits = auditCount();
    const response = await t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('period_finalized');
    expect(periodRow()).toEqual(before);
    expect(exceptionRows()).toEqual([]);
    expect(auditCount()).toBe(audits);
  });

  it('refuses when any user’s finalized timesheet references the row, even if the others are drafts', async () => {
    await addSession(employee, '2026-10-07');
    await addSession(admin, '2026-10-07');
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 2 WHERE user_id = ?').run(t.userIds.admin);
    const response = await t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('period_finalized');
    expect(exceptionRows()).toEqual([]);
  });

  it('does not touch a finalized period when the exception belongs to another period', async () => {
    await addSession(employee, '2026-10-07');
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1 WHERE user_id = ?').run(t.userIds.employee);
    const before = periodRow();
    const response = await t.request('POST', PATH, {
      cookie: admin,
      body: exceptionBody({ nominal_payroll_date: '2026-10-30', payroll_date: '2026-10-29', due_local_date: null, due_local_time: null }),
    });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(Object.keys(response.body)).toEqual(['payroll_exception']);
    expect(periodRow()).toEqual(before);
  });

  it('rolls back the exception and the refreshed row when the audit event cannot be written', async () => {
    await addSession(employee, '2026-10-07');
    const before = periodRow();
    t.db.exec(
      "CREATE TRIGGER test_force_audit_failure BEFORE INSERT ON audit_events WHEN NEW.operation = 'payroll_exception.create' BEGIN SELECT RAISE(ABORT, 'forced_audit_failure'); END",
    );
    const response = await t.request('POST', PATH, { cookie: admin, body: exceptionBody() });
    expect(response.status).toBe(500);
    expect(periodRow()).toEqual(before);
    expect(exceptionRows()).toEqual([]);
  });
});
