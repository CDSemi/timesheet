import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, DEFAULT_BREAKS_0900, la, type TestContext } from '../support/testApp.ts';

/*
 * AC-01 for WP1 endpoints: two users cannot read or change each other's times, day
 * entries, policies or sessions by swapping identifiers. The admin role grants no
 * access to private timesheet data.
 */

let t: TestContext;
let admin: string;
let employee: string;
let employeeSessionId: string;
let adminSessionId: string;

function nineToSix(date: string) {
  return {
    start: la(`${date}T09:00`),
    end: la(`${date}T18:00`),
    input_zone: 'America/Los_Angeles',
    breaks: DEFAULT_BREAKS_0900.map((item) => ({
      start: { ...item.start, local: item.start.local.replace('2026-09-21', date) },
      end: { ...item.end, local: item.end.local.replace('2026-09-21', date) },
      counts_as_work: item.counts_as_work,
    })),
    breaks_confirmed: true,
  };
}

beforeEach(async () => {
  t = await createTestContext();
  admin = await t.login('admin');
  employee = await t.login('employee');
  const created = await t.request('POST', '/api/days/2026-09-21/sessions', { cookie: employee, body: nineToSix('2026-09-21') });
  expect(created.status).toBe(201);
  employeeSessionId = created.body.session.id;
  const adminCreated = await t.request('POST', '/api/days/2026-09-22/sessions', { cookie: admin, body: nineToSix('2026-09-22') });
  expect(adminCreated.status).toBe(201);
  adminSessionId = adminCreated.body.session.id;
});

afterEach(() => t.close());

function sessionRow(id: string) {
  return t.db.prepare('SELECT user_id, start_utc, end_utc, version FROM work_sessions WHERE id = ?').get(id);
}

describe('two-user isolation (AC-01)', () => {
  it('hides another user’s session from direct reads, updates and deletes — also for admins', async () => {
    const before = sessionRow(employeeSessionId);
    const attempts: Array<[string, unknown?]> = [
      ['GET'],
      ['PUT', { ...nineToSix('2026-09-21'), start: la('2026-09-21T07:00'), expected_version: 1, reason: 'swap attempt' }],
      ['DELETE', { expected_version: 1, reason: 'swap attempt' }],
    ];
    for (const [method, body] of attempts) {
      const response = await t.request(method, `/api/sessions/${employeeSessionId}`, { cookie: admin, body });
      expect(response.status, `${method} as admin`).toBe(404);
      expect(response.body.error.code).toBe('not_found');
    }
    for (const [method, body] of attempts) {
      const response = await t.request(method, `/api/sessions/${adminSessionId}`, { cookie: employee, body });
      expect(response.status, `${method} as employee`).toBe(404);
    }
    expect(sessionRow(employeeSessionId)).toEqual(before);
    expect(sessionRow(adminSessionId)).toMatchObject({ version: 1 });
  });

  it('keeps timesheet and day views per user', async () => {
    const employeeSheet = await t.request('GET', '/api/timesheets/2026-10-02', { cookie: employee });
    const adminSheet = await t.request('GET', '/api/timesheets/2026-10-02', { cookie: admin });
    const sessionIds = (sheet: typeof employeeSheet) =>
      sheet.body.days.flatMap((day: { sessions: Array<{ id: string }> }) => day.sessions.map((session) => session.id));
    expect(sessionIds(employeeSheet)).toEqual([employeeSessionId]);
    expect(sessionIds(adminSheet)).toEqual([adminSessionId]);
    expect(employeeSheet.body.timesheet.id).not.toBe(adminSheet.body.timesheet.id);
    const employeeDay = await t.request('GET', '/api/days/2026-09-22', { cookie: employee });
    expect(employeeDay.body.sessions).toEqual([]);
    expect(employeeDay.body.entry).toBeNull();
  });

  it('validates overlap per user, so another user’s times neither block nor leak', async () => {
    const overlapping = await t.request('POST', '/api/days/2026-09-22/sessions', {
      cookie: employee,
      body: nineToSix('2026-09-22'),
    });
    expect(overlapping.status).toBe(201);
  });

  it('rejects client-supplied owner fields instead of trusting them', async () => {
    const withUserId = await t.request('POST', '/api/days/2026-09-23/sessions', {
      cookie: employee,
      body: { ...nineToSix('2026-09-23'), user_id: t.userIds.admin },
    });
    expect(withUserId.status).toBe(422);
    expect(withUserId.body.error.code).toBe('validation_error');
    const dayWithOwner = await t.request('PUT', '/api/days/2026-09-23', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '', owner_user_id: t.userIds.admin },
    });
    expect(dayWithOwner.status).toBe(422);
    expect(t.db.prepare('SELECT count(*) FROM day_entries WHERE work_date = ?').pluck().get('2026-09-23')).toBe(0);
  });

  it('keeps day entries private per user', async () => {
    const put = await t.request('PUT', '/api/days/2026-09-24', {
      cookie: admin,
      body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: 'admin private note' },
    });
    expect(put.status).toBe(200);
    const employeeView = await t.request('GET', '/api/days/2026-09-24', { cookie: employee });
    expect(employeeView.body.entry).toBeNull();
    expect(JSON.stringify(employeeView.body)).not.toContain('admin private note');
    // The employee's own write creates a separate row, never touching the admin's entry.
    const own = await t.request('PUT', '/api/days/2026-09-24', {
      cookie: employee,
      body: { category: 'Sick', leave_minutes: 0, wfh: false, notes: '' },
    });
    expect(own.body.entry.category).toBe('Sick');
    const adminView = await t.request('GET', '/api/days/2026-09-24', { cookie: admin });
    expect(adminView.body.entry).toMatchObject({ category: 'Vacation', notes: 'admin private note', version: 1 });
  });

  it('keeps policy versions per user', async () => {
    const created = await t.request('POST', '/api/policies', {
      cookie: admin,
      body: {
        effective_from: '2026-10-05',
        required_minutes: 480,
        threshold_minutes: 0,
        rounding_step_minutes: 15,
        reference_start: '08:00',
        reference_end: '17:00',
        breaks: [
          { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
          { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
          { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
        ],
        deficit_mode: 'ignore',
      },
    });
    expect(created.status).toBe(201);
    const employeePolicies = await t.request('GET', '/api/policies', { cookie: employee });
    expect(employeePolicies.body.policies).toHaveLength(1);
    expect(employeePolicies.body.policies.map((policy: { id: string }) => policy.id)).not.toContain(created.body.policy.id);
  });

  it('never lets one user clock out another user’s running session', async () => {
    t.clock.set('2026-09-29T16:00:00Z');
    const clockIn = await t.request('POST', '/api/clock/in', { cookie: admin, body: { input_zone: 'America/Los_Angeles' } });
    expect(clockIn.status).toBe(201);
    t.clock.set('2026-09-29T18:00:00Z');
    const clockOut = await t.request('POST', '/api/clock/out', {
      cookie: employee,
      body: { breaks: [], breaks_confirmed: true, expected_version: 1 },
    });
    expect(clockOut.status).toBe(409);
    expect(clockOut.body.error.code).toBe('no_open_session');
    expect(sessionRow(clockIn.body.session.id)).toMatchObject({ end_utc: null });
  });

  it('attributes audit events to the acting owner', async () => {
    const rows = t.db
      .prepare('SELECT DISTINCT actor_user_id, owner_user_id FROM audit_events WHERE entity_id = ?')
      .all(employeeSessionId);
    expect(rows).toEqual([{ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee }]);
  });
});
