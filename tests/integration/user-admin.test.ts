import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { revokeAllAuthSessions } from '../../src/server/auth/sessions.ts';
import { createCalendar, createCalendarVersion } from '../../src/server/services/calendars.ts';
import { deactivateUser, updateUser } from '../../src/server/services/users.ts';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T07 (FR-01, AC-01, E-11): user administration under /api/admin. The admin sets a
 * temporary initial password out of band; no response, audit payload or error may carry
 * password material. Passwords here are generated per run, never literals.
 */

let t: TestContext;
let admin: string;
let employee: string;

const ACCOUNT_KEYS = ['calendar_id', 'created_at', 'display_name', 'email', 'id', 'role', 'status', 'updated_at'];
const freshPassword = () => randomBytes(18).toString('base64url');

beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  admin = await t.login('admin');
  employee = await t.login('employee');
});

afterEach(() => t.close());

function newUserBody(overrides: Record<string, unknown> = {}) {
  const password = freshPassword();
  return {
    password,
    body: {
      email: 'New.Colleague@example.invalid',
      display_name: 'New Colleague',
      role: 'employee',
      password,
      calendar_id: t.calendarId,
      ...overrides,
    },
  };
}

/** Admin-attributed account events; the seed's own (null-actor) creations are excluded. */
function auditRows(entityId?: string) {
  const sql = `SELECT actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json
                 FROM audit_events WHERE operation LIKE 'user.%' AND actor_user_id IS NOT NULL${entityId === undefined ? '' : ' AND entity_id = ?'}
                 ORDER BY occurred_at, rowid`;
  const statement = t.db.prepare(sql);
  return (entityId === undefined ? statement.all() : statement.all(entityId)) as Array<{
    actor_user_id: string | null;
    owner_user_id: string | null;
    operation: string;
    entity_type: string;
    entity_id: string;
    reason: string | null;
    before_json: string | null;
    after_json: string | null;
  }>;
}

function allAuditText() {
  return JSON.stringify(t.db.prepare('SELECT * FROM audit_events').all());
}

function sessionRows(userId: string) {
  return t.db.prepare('SELECT id, revoked_at FROM auth_sessions WHERE user_id = ?').all(userId) as Array<{
    id: string;
    revoked_at: string | null;
  }>;
}

async function createColleague() {
  const { body, password } = newUserBody();
  const created = await t.request('POST', '/api/admin/users', { cookie: admin, body });
  expect(created.status).toBe(201);
  return { id: created.body.user.id as string, email: created.body.user.email as string, password };
}

async function loginAs(email: string, password: string) {
  return t.request('POST', '/api/auth/login', { body: { email, password } });
}

function cookieOf(response: { headers: Headers }) {
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (cookie === undefined) throw new Error('No session cookie');
  return cookie;
}

describe('admin router access (FR-01, AC-01)', () => {
  const ID = '00000000-0000-4000-8000-000000000000';
  const routes: Array<[string, string, unknown?]> = [
    ['GET', '/api/admin/users'],
    ['POST', '/api/admin/users', { email: 'x@example.invalid', display_name: 'X', role: 'employee', password: 'p'.repeat(12), calendar_id: ID }],
    ['PATCH', `/api/admin/users/${ID}`, { display_name: 'Changed' }],
    ['POST', `/api/admin/users/${ID}/deactivate`, {}],
    ['POST', `/api/admin/users/${ID}/reactivate`, {}],
  ];

  it('answers 401 without a session on every admin route and on unknown admin paths', async () => {
    for (const [method, path, body] of routes) {
      const response = await t.request(method, path, { body });
      expect(response.status, `${method} ${path}`).toBe(401);
      expect(response.body.error.code).toBe('unauthenticated');
    }
    expect((await t.request('GET', '/api/admin/unknown')).status).toBe(401);
  });

  it('answers 403 to an employee on every admin route and changes nothing', async () => {
    const users = t.db.prepare('SELECT count(*) FROM users').pluck().get();
    const audit = t.db.prepare('SELECT count(*) FROM audit_events').pluck().get();
    for (const [method, path, body] of routes) {
      const response = await t.request(method, path, { cookie: employee, body });
      expect(response.status, `${method} ${path}`).toBe(403);
      expect(response.body.error.code).toBe('forbidden');
    }
    expect((await t.request('GET', '/api/admin/unknown', { cookie: employee })).status).toBe(403);
    expect(t.db.prepare('SELECT count(*) FROM users').pluck().get()).toBe(users);
    expect(t.db.prepare('SELECT count(*) FROM audit_events').pluck().get()).toBe(audit);
    expect(t.db.prepare('SELECT status, role FROM users WHERE id = ?').get(t.userIds.employee)).toEqual({
      status: 'active',
      role: 'employee',
    });
  });

  it('applies CSRF/origin, content-type and body rules to every mutating admin route', async () => {
    const colleague = await createColleague();
    const mutating: Array<[string, string, unknown]> = [
      ['POST', '/api/admin/users', newUserBody({ email: 'second@example.invalid' }).body],
      ['PATCH', `/api/admin/users/${colleague.id}`, { display_name: 'Changed' }],
      ['POST', `/api/admin/users/${colleague.id}/deactivate`, {}],
      ['POST', `/api/admin/users/${colleague.id}/reactivate`, {}],
    ];
    const users = t.db.prepare('SELECT count(*) FROM users').pluck().get();
    const audit = t.db.prepare('SELECT count(*) FROM audit_events').pluck().get();
    for (const [method, path, body] of mutating) {
      const foreign = await t.request(method, path, { cookie: admin, body, origin: 'https://evil.example.invalid' });
      expect(foreign.status, `${method} ${path} foreign origin`).toBe(403);
      const missing = await t.request(method, path, { cookie: admin, body, origin: null });
      expect(missing.status, `${method} ${path} no origin`).toBe(403);
      const crossSite = await t.request(method, path, { cookie: admin, body, headers: { 'sec-fetch-site': 'cross-site' } });
      expect(crossSite.status, `${method} ${path} cross-site`).toBe(403);
      const form = await t.request(method, path, {
        cookie: admin,
        body: 'a=b',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
      expect(form.status, `${method} ${path} form`).toBe(415);
      const malformed = await t.request(method, path, { cookie: admin, body: '{not json' });
      expect(malformed.status, `${method} ${path} malformed`).toBe(400);
      const huge = await t.request(method, path, { cookie: admin, body: JSON.stringify({ pad: 'x'.repeat(70_000) }) });
      expect(huge.status, `${method} ${path} oversized`).toBe(413);
    }
    expect(t.db.prepare('SELECT count(*) FROM users').pluck().get()).toBe(users);
    expect(t.db.prepare('SELECT count(*) FROM audit_events').pluck().get()).toBe(audit);
    expect(t.db.prepare('SELECT status FROM users WHERE id = ?').pluck().get(colleague.id)).toBe('active');
  });
});

describe('GET /api/admin/users', () => {
  it('lists account fields only, never password material or private timesheet data', async () => {
    const response = await t.request('GET', '/api/admin/users', { cookie: admin });
    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    for (const user of response.body.users) expect(Object.keys(user).sort()).toEqual(ACCOUNT_KEYS);
    const text = JSON.stringify(response.body);
    expect(text).not.toMatch(/password|scrypt\$/i);
    expect(response.body.users.map((user: { email: string }) => user.email).sort()).toEqual(
      [t.emails.admin, t.emails.employee].sort(),
    );
    expect(response.body.users.find((user: { id: string }) => user.id === t.userIds.employee)).toMatchObject({
      display_name: 'Example Employee',
      role: 'employee',
      status: 'active',
      calendar_id: t.calendarId,
    });
  });

  it('shows deactivated accounts with their status', async () => {
    const colleague = await createColleague();
    await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, { cookie: admin, body: {} });
    const list = await t.request('GET', '/api/admin/users', { cookie: admin });
    expect(list.body.users.find((user: { id: string }) => user.id === colleague.id).status).toBe('deactivated');
  });
});

describe('POST /api/admin/users (E-11: admin-set temporary password, never returned)', () => {
  it('creates an active account whose password the admin chose, without echoing it', async () => {
    const { body, password } = newUserBody();
    const created = await t.request('POST', '/api/admin/users', { cookie: admin, body });
    expect(created.status).toBe(201);
    expect(Object.keys(created.body.user).sort()).toEqual(ACCOUNT_KEYS);
    expect(created.body.user).toMatchObject({
      email: 'new.colleague@example.invalid',
      display_name: 'New Colleague',
      role: 'employee',
      status: 'active',
      calendar_id: t.calendarId,
    });
    expect(JSON.stringify(created.body)).not.toContain(password);
    expect(JSON.stringify(created.body)).not.toMatch(/scrypt\$|password/i);
    expect(JSON.stringify([...created.headers.entries()])).not.toContain(password);

    const stored = t.db.prepare('SELECT password_hash FROM users WHERE id = ?').pluck().get(created.body.user.id) as string;
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(stored).not.toContain(password);

    const signedIn = await loginAs('new.colleague@example.invalid', password);
    expect(signedIn.status).toBe(200);
    expect(JSON.stringify(signedIn.body)).not.toContain(password);
    const me = await t.request('GET', '/api/auth/me', { cookie: cookieOf(signedIn) });
    expect(me.body.user.role).toBe('employee');
    expect(me.status).toBe(200);
  });

  it('audits the creation with the account after-state and no password material', async () => {
    const { body, password } = newUserBody({ role: 'admin' });
    const created = await t.request('POST', '/api/admin/users', { cookie: admin, body });
    const [event] = auditRows(created.body.user.id);
    expect(event).toMatchObject({
      actor_user_id: t.userIds.admin,
      owner_user_id: created.body.user.id,
      operation: 'user.create',
      entity_type: 'user',
      before_json: null,
    });
    expect(JSON.parse(event?.after_json ?? 'null')).toEqual({
      email: 'new.colleague@example.invalid',
      display_name: 'New Colleague',
      role: 'admin',
      status: 'active',
      calendar_id: t.calendarId,
    });
    const text = allAuditText();
    expect(text).not.toContain(password);
    expect(text).not.toMatch(/scrypt\$/);
    expect(text).not.toMatch(/password/i);
  });

  it('refuses a duplicate email in any case without a second account or audit event', async () => {
    await createColleague();
    const before = { users: t.db.prepare('SELECT count(*) FROM users').pluck().get(), audit: auditRows().length };
    const duplicate = newUserBody({ email: ' NEW.COLLEAGUE@EXAMPLE.INVALID ' });
    const response = await t.request('POST', '/api/admin/users', { cookie: admin, body: duplicate.body });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('email_in_use');
    expect(JSON.stringify(response.body)).not.toContain(duplicate.password);
    expect(t.db.prepare('SELECT count(*) FROM users').pluck().get()).toBe(before.users);
    expect(auditRows()).toHaveLength(before.audit);
  });

  it('applies the existing password policy and never echoes the rejected value', async () => {
    const short = randomBytes(4).toString('base64url');
    const tooLong = randomBytes(300).toString('base64url');
    for (const password of [short, tooLong]) {
      const { body } = newUserBody({ password });
      const response = await t.request('POST', '/api/admin/users', { cookie: admin, body });
      expect(response.status).toBe(422);
      expect(JSON.stringify(response.body)).not.toContain(password);
    }
    const weak = await t.request('POST', '/api/admin/users', { cookie: admin, body: newUserBody({ password: short }).body });
    expect(weak.body.error.code).toBe('weak_password');
    expect(t.db.prepare('SELECT count(*) FROM users WHERE email = ?').pluck().get('new.colleague@example.invalid')).toBe(0);
    expect(allAuditText()).not.toContain(short);
  });

  it('validates the email, display name, role and calendar and rejects unknown or owner fields', async () => {
    const cases: Array<[Record<string, unknown>, number, string]> = [
      [{ email: 'not-an-email' }, 422, 'invalid_email'],
      [{ display_name: '   ' }, 422, 'invalid_display_name'],
      [{ role: 'owner' }, 422, 'validation_error'],
      [{ calendar_id: '00000000-0000-4000-8000-000000000000' }, 422, 'unknown_calendar'],
      [{ status: 'deactivated' }, 422, 'validation_error'],
      [{ password_hash: 'x'.repeat(20) }, 422, 'validation_error'],
      [{ id: '00000000-0000-4000-8000-000000000001' }, 422, 'validation_error'],
    ];
    for (const [overrides, status, code] of cases) {
      const { body, password } = newUserBody(overrides);
      const response = await t.request('POST', '/api/admin/users', { cookie: admin, body });
      expect(response.status, JSON.stringify(overrides)).toBe(status);
      expect(response.body.error.code, JSON.stringify(overrides)).toBe(code);
      expect(JSON.stringify(response.body)).not.toContain(password);
    }
    expect(t.db.prepare('SELECT count(*) FROM users').pluck().get()).toBe(2);
    expect(auditRows().filter((event) => event.operation === 'user.create')).toHaveLength(0);
  });
});

function secondCalendar(): string {
  const row = t.db.prepare('SELECT * FROM calendars WHERE id = ?').get(t.calendarId) as Record<string, string | number>;
  return createCalendar(
    t.db,
    t.clock,
    {
      name: 'Second calendar (synthetic)',
      schedule: {
        reportingZone: row.reporting_zone as string,
        anchorPayrollDate: row.payroll_anchor_date as string,
        cycleDays: row.cycle_days as number,
        periodStartOffsetDays: row.period_start_offset_days as number,
        periodEndOffsetDays: row.period_end_offset_days as number,
        dueOffsetDays: row.due_offset_days as number,
        dueLocalTime: row.due_local_time as string,
      },
    },
    null,
  );
}

describe('PATCH /api/admin/users/:id', () => {
  it('edits display name, role and calendar and audits the before and after state', async () => {
    const calendarId = secondCalendar();
    const response = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, {
      cookie: admin,
      body: { display_name: '  Renamed Employee ', role: 'admin', calendar_id: calendarId },
    });
    expect(response.status).toBe(200);
    expect(Object.keys(response.body.user).sort()).toEqual(ACCOUNT_KEYS);
    expect(response.body.user).toMatchObject({ display_name: 'Renamed Employee', role: 'admin', calendar_id: calendarId });
    const [event] = auditRows(t.userIds.employee);
    expect(event).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: t.userIds.employee, operation: 'user.update' });
    expect(JSON.parse(event?.before_json ?? 'null')).toEqual({
      email: t.emails.employee,
      display_name: 'Example Employee',
      role: 'employee',
      status: 'active',
      calendar_id: t.calendarId,
    });
    expect(JSON.parse(event?.after_json ?? 'null')).toEqual({
      email: t.emails.employee,
      display_name: 'Renamed Employee',
      role: 'admin',
      status: 'active',
      calendar_id: calendarId,
    });
    expect(allAuditText()).not.toMatch(/scrypt\$|password/i);
    // The role is read live: the employee's existing session now reaches the admin router.
    expect((await t.request('GET', '/api/admin/users', { cookie: employee })).status).toBe(200);
  });

  it('applies a role demotion to existing sessions immediately', async () => {
    const colleague = await createColleague();
    const promoted = await t.request('PATCH', `/api/admin/users/${colleague.id}`, { cookie: admin, body: { role: 'admin' } });
    expect(promoted.status).toBe(200);
    const cookie = cookieOf(await loginAs(colleague.email, colleague.password));
    expect((await t.request('GET', '/api/admin/users', { cookie })).status).toBe(200);
    await t.request('PATCH', `/api/admin/users/${colleague.id}`, { cookie: admin, body: { role: 'employee' } });
    expect((await t.request('GET', '/api/admin/users', { cookie })).status).toBe(403);
  });

  it('refuses an empty edit, unknown fields and other accounts’ credentials', async () => {
    const empty = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: {} });
    expect(empty.status).toBe(422);
    for (const extra of [{ email: 'moved@example.invalid' }, { status: 'deactivated' }, { password: freshPassword() }, { password_hash: 'abc' }]) {
      const response = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, {
        cookie: admin,
        body: { display_name: 'Still Valid', ...extra },
      });
      expect(response.status, JSON.stringify(Object.keys(extra))).toBe(422);
      expect(JSON.stringify(response.body)).not.toContain(Object.values(extra)[0] as string);
    }
    const unknownCalendar = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, {
      cookie: admin,
      body: { calendar_id: '00000000-0000-4000-8000-000000000000' },
    });
    expect(unknownCalendar.body.error.code).toBe('unknown_calendar');
    const blank = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: { display_name: ' ' } });
    expect(blank.status).toBe(422);
    expect(t.db.prepare('SELECT display_name FROM users WHERE id = ?').pluck().get(t.userIds.employee)).toBe('Example Employee');
    expect(auditRows(t.userIds.employee)).toHaveLength(0);
  });

  it('writes no audit event for an edit that changes nothing and 404s for an unknown account', async () => {
    const same = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, {
      cookie: admin,
      body: { display_name: 'Example Employee', role: 'employee' },
    });
    expect(same.status).toBe(200);
    expect(auditRows(t.userIds.employee)).toHaveLength(0);
    const missing = await t.request('PATCH', '/api/admin/users/00000000-0000-4000-8000-000000000000', {
      cookie: admin,
      body: { display_name: 'Nobody' },
    });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('not_found');
  });

  it('refuses to demote the last active admin and keeps the role', async () => {
    const response = await t.request('PATCH', `/api/admin/users/${t.userIds.admin}`, { cookie: admin, body: { role: 'employee' } });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('last_active_admin');
    expect(t.db.prepare('SELECT role FROM users WHERE id = ?').pluck().get(t.userIds.admin)).toBe('admin');
    expect(auditRows(t.userIds.admin)).toHaveLength(0);
    // With a second active admin the same demotion is allowed.
    await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: { role: 'admin' } });
    const allowed = await t.request('PATCH', `/api/admin/users/${t.userIds.admin}`, { cookie: admin, body: { role: 'employee' } });
    expect(allowed.status).toBe(200);
  });

  it('does not count a deactivated admin as a remaining admin', async () => {
    const promoted = await createColleague();
    await t.request('PATCH', `/api/admin/users/${promoted.id}`, { cookie: admin, body: { role: 'admin' } });
    await t.request('POST', `/api/admin/users/${promoted.id}/deactivate`, { cookie: admin, body: {} });
    const response = await t.request('PATCH', `/api/admin/users/${t.userIds.admin}`, { cookie: admin, body: { role: 'employee' } });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('last_active_admin');
  });
});

/*
 * WP2-CALFIX (AGENTS rule 7, R-07): a calendar change would regroup draft periods, orphan stored
 * timesheets and hide finalized ones (WP2-T08 probe), so it is refused with 409 calendar_in_use
 * while the user has any timesheet, day entry, session, ledger entry or leave request.
 */
describe('PATCH /api/admin/users/:id calendar change guard (WP2-CALFIX)', () => {
  const employeeId = () => t.userIds.employee;
  const userRow = () => t.db.prepare('SELECT * FROM users WHERE id = ?').get(employeeId());
  const auditCount = () => t.db.prepare('SELECT count(*) FROM audit_events').pluck().get();

  function insertTimesheetOnly(): void {
    const periodId = 'calfix-period-1';
    t.db
      .prepare(
        `INSERT INTO pay_periods (id, calendar_id, period_index, nominal_payroll_date, payroll_date, period_start, period_end,
           due_local_date, due_local_time, due_at_utc, is_exception, created_at)
         VALUES (?, ?, 9001, '2026-10-16', '2026-10-16', '2026-09-28', '2026-10-11', '2026-10-13', '17:00',
           '2026-10-14T00:00:00Z', 0, '2026-10-02T18:00:00Z')`,
      )
      .run(periodId, t.calendarId);
    t.db
      .prepare(
        `INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at)
         VALUES ('calfix-timesheet-1', ?, ?, 1, '2026-10-02T18:00:00Z', '2026-10-02T18:00:00Z')`,
      )
      .run(employeeId(), periodId);
  }

  /** A day entry cannot exist without its timesheet (composite foreign key), so the API creates both. */
  async function createDayEntry(): Promise<void> {
    const saved = await t.request('PUT', '/api/days/2026-10-01', {
      cookie: employee,
      body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' },
    });
    expect(saved.status).toBe(200);
  }

  /** A session needs its day entry and timesheet; all three kinds exist afterwards. */
  async function createSession(): Promise<void> {
    const saved = await t.request('POST', '/api/days/2026-10-01/sessions', {
      cookie: employee,
      body: { start: la('2026-10-01T09:00'), end: la('2026-10-01T17:00'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(saved.status).toBe(201);
  }

  function insertLedgerEntryOnly(): void {
    t.db
      .prepare(
        `INSERT INTO ot_ledger (id, user_id, entry_type, delta_minutes, source_key, work_date, actor_user_id, origin, posted_at)
         VALUES ('calfix-ledger-1', ?, 'credit', 60, 'calfix-credit-1', '2026-09-21', NULL, 'system', '2026-10-02T18:00:00Z')`,
      )
      .run(employeeId());
  }

  function insertLeaveRequestOnly(): void {
    t.db
      .prepare(
        `INSERT INTO ot_leave_requests (id, user_id, request_key, leave_date, requested_minutes, approved_minutes,
           reserved_minutes, approver_name, approval_date, evidence_ref, approval_origin, created_by, created_at, updated_at)
         VALUES ('calfix-leave-1', ?, 'calfix-key-1', '2026-10-05', 60, 60, 60, 'Example Manager', '2026-10-01',
           'synthetic chat reference', 'self_recorded', ?, '2026-10-02T18:00:00Z', '2026-10-02T18:00:00Z')`,
      )
      .run(employeeId(), employeeId());
  }

  const dataKinds: Array<[string, () => void | Promise<void>]> = [
    ['timesheet', insertTimesheetOnly],
    ['day entry', createDayEntry],
    ['session', createSession],
    ['ledger entry', insertLedgerEntryOnly],
    ['leave request', insertLeaveRequestOnly],
  ];

  it.each(dataKinds)('refuses a calendar change with 409 calendar_in_use when the user has a %s', async (_kind, seed) => {
    await seed();
    const calendarId = secondCalendar();
    const rowBefore = userRow();
    const auditBefore = auditCount();
    t.clock.advanceSeconds(60);
    const response = await t.request('PATCH', `/api/admin/users/${employeeId()}`, { cookie: admin, body: { calendar_id: calendarId } });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('calendar_in_use');
    expect(userRow()).toEqual(rowBefore);
    expect(auditCount()).toBe(auditBefore);
    expect(auditRows(employeeId())).toHaveLength(0);
  });

  it('applies nothing of a combined PATCH that includes a refused calendar change', async () => {
    insertLedgerEntryOnly();
    const calendarId = secondCalendar();
    const rowBefore = userRow();
    const auditBefore = auditCount();
    t.clock.advanceSeconds(60);
    const response = await t.request('PATCH', `/api/admin/users/${employeeId()}`, {
      cookie: admin,
      body: { display_name: 'Should Not Apply', role: 'admin', calendar_id: calendarId },
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('calendar_in_use');
    expect(userRow()).toEqual(rowBefore);
    expect(auditCount()).toBe(auditBefore);
  });

  it('still edits display name and role for a user with data and treats the current calendar id as no change', async () => {
    await createSession();
    insertLedgerEntryOnly();
    insertLeaveRequestOnly();
    const renamed = await t.request('PATCH', `/api/admin/users/${employeeId()}`, {
      cookie: admin,
      body: { display_name: 'Renamed With Data', role: 'admin' },
    });
    expect(renamed.status).toBe(200);
    expect(renamed.body.user).toMatchObject({ display_name: 'Renamed With Data', role: 'admin', calendar_id: t.calendarId });
    expect(auditRows(employeeId())).toHaveLength(1);
    const same = await t.request('PATCH', `/api/admin/users/${employeeId()}`, {
      cookie: admin,
      body: { display_name: 'Renamed Again', calendar_id: t.calendarId },
    });
    expect(same.status).toBe(200);
    expect(same.body.user.calendar_id).toBe(t.calendarId);
    expect(auditRows(employeeId())).toHaveLength(2);
  });

  it('changes the calendar of an account without data and writes one audit event', async () => {
    const colleague = await createColleague();
    const calendarId = secondCalendar();
    const response = await t.request('PATCH', `/api/admin/users/${colleague.id}`, { cookie: admin, body: { calendar_id: calendarId } });
    expect(response.status).toBe(200);
    expect(response.body.user.calendar_id).toBe(calendarId);
    const events = auditRows(colleague.id).filter((event) => event.operation === 'user.update');
    expect(events).toHaveLength(1);
    expect(JSON.parse(events[0]?.after_json ?? 'null')).toMatchObject({ calendar_id: calendarId });
  });

  it('is not blocked by another user’s data (owner scoping)', async () => {
    insertLedgerEntryOnly();
    const colleague = await createColleague();
    const response = await t.request('PATCH', `/api/admin/users/${colleague.id}`, { cookie: admin, body: { calendar_id: secondCalendar() } });
    expect(response.status).toBe(200);
  });

  it('refuses the WP2-T08 probe scenario and leaves the finalized timesheet view unchanged', async () => {
    t.clock.set('2026-10-09T20:00:00Z');
    // Sign-in sessions expire after 12 hours, so sign in again at the new instant.
    admin = await t.login('admin');
    employee = await t.login('employee');
    const calendarB = createCalendar(
      t.db,
      t.clock,
      {
        name: 'Synthetic calendar B',
        schedule: {
          reportingZone: 'Asia/Ho_Chi_Minh',
          anchorPayrollDate: '2026-10-05',
          cycleDays: 14,
          periodStartOffsetDays: -18,
          periodEndOffsetDays: -5,
          dueOffsetDays: -3,
          dueLocalTime: '17:00',
        },
      },
      null,
    );
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: calendarB,
        effectiveFrom: '2026-01-01',
        weekdays: [1, 2, 3, 4, 5],
        dates: [{ date: '2026-10-07', kind: 'holiday', name: 'Synthetic calendar B holiday' }],
      },
      null,
    );
    const post = (date: string, extra: Record<string, unknown> = {}) =>
      t.request('POST', `/api/days/${date}/sessions`, {
        cookie: employee,
        body: { start: la(`${date}T09:00`), end: la(`${date}T17:00`), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true, ...extra },
      });
    expect((await post('2026-10-07')).status).toBe(201);
    expect((await post('2026-09-21', { reason: 'Synthetic backfill for the regression' })).status).toBe(201);
    t.db
      .prepare(
        "UPDATE timesheets SET finalized_revision_no = 1 WHERE user_id = ? AND pay_period_id IN (SELECT id FROM pay_periods WHERE period_start = '2026-09-14')",
      )
      .run(employeeId());
    const view = async () => ({
      finalized: await t.request('GET', '/api/timesheets/2026-10-02', { cookie: employee }),
      draft: await t.request('GET', '/api/timesheets/2026-10-16', { cookie: employee }),
      current: await t.request('GET', '/api/periods/current', { cookie: employee }),
      day: await t.request('GET', '/api/days/2026-10-07', { cookie: employee }),
    });
    const before = await view();
    expect(before.finalized.status).toBe(200);
    expect(before.finalized.body.timesheet).not.toBeNull();
    const rowBefore = userRow();
    const auditBefore = auditCount();

    const response = await t.request('PATCH', `/api/admin/users/${employeeId()}`, { cookie: admin, body: { calendar_id: calendarB } });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('calendar_in_use');

    const after = await view();
    for (const key of ['finalized', 'draft', 'current', 'day'] as const) {
      expect(after[key].status, key).toBe(before[key].status);
      expect(after[key].body, key).toEqual(before[key].body);
    }
    expect(userRow()).toEqual(rowBefore);
    expect(auditCount()).toBe(auditBefore);
  });
});

describe('deactivation and reactivation (sessions are revoked, history is kept)', () => {
  it('revokes every session of the user so existing cookies answer 401, and blocks sign-in', async () => {
    const colleague = await createColleague();
    const first = cookieOf(await loginAs(colleague.email, colleague.password));
    const second = cookieOf(await loginAs(colleague.email, colleague.password));
    expect((await t.request('GET', '/api/auth/me', { cookie: first })).status).toBe(200);
    const otherBefore = sessionRows(t.userIds.employee);

    t.clock.advanceSeconds(60);
    const response = await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, {
      cookie: admin,
      body: { reason: 'Left the company' },
    });
    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ id: colleague.id, status: 'deactivated' });
    expect(Object.keys(response.body.user).sort()).toEqual(ACCOUNT_KEYS);

    for (const cookie of [first, second]) {
      const me = await t.request('GET', '/api/auth/me', { cookie });
      expect(me.status).toBe(401);
      expect((await t.request('GET', '/api/timesheets/2026-10-02', { cookie })).status).toBe(401);
    }
    expect(sessionRows(colleague.id).every((row) => row.revoked_at !== null)).toBe(true);
    const denied = await loginAs(colleague.email, colleague.password);
    expect(denied.status).toBe(401);
    expect(denied.body.error.code).toBe('invalid_credentials');
    // Other users keep their sessions.
    expect(sessionRows(t.userIds.employee)).toEqual(otherBefore);
    expect((await t.request('GET', '/api/auth/me', { cookie: employee })).status).toBe(200);
    expect((await t.request('GET', '/api/auth/me', { cookie: admin })).status).toBe(200);
  });

  it('audits the deactivation with before/after status, the reason and the revoked-session count', async () => {
    const colleague = await createColleague();
    await loginAs(colleague.email, colleague.password);
    await loginAs(colleague.email, colleague.password);
    await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, { cookie: admin, body: { reason: 'Left the company' } });
    const event = auditRows(colleague.id).find((row) => row.operation === 'user.deactivate');
    expect(event).toMatchObject({
      actor_user_id: t.userIds.admin,
      owner_user_id: colleague.id,
      reason: 'Left the company',
    });
    expect(JSON.parse(event?.before_json ?? 'null')).toMatchObject({ status: 'active', role: 'employee' });
    expect(JSON.parse(event?.after_json ?? 'null')).toMatchObject({ status: 'deactivated', sessions_revoked: 2 });
    expect(allAuditText()).not.toContain(colleague.password);
    expect(allAuditText()).not.toMatch(/scrypt\$|password/i);
  });

  it('refuses self-deactivation and keeps the admin signed in', async () => {
    const response = await t.request('POST', `/api/admin/users/${t.userIds.admin}/deactivate`, { cookie: admin, body: {} });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('cannot_deactivate_self');
    expect(t.db.prepare('SELECT status FROM users WHERE id = ?').pluck().get(t.userIds.admin)).toBe('active');
    expect(sessionRows(t.userIds.admin).every((row) => row.revoked_at === null)).toBe(true);
    expect((await t.request('GET', '/api/auth/me', { cookie: admin })).status).toBe(200);
    // Self-deactivation is refused even when other admins exist.
    await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: { role: 'admin' } });
    const again = await t.request('POST', `/api/admin/users/${t.userIds.admin}/deactivate`, { cookie: admin, body: {} });
    expect(again.body.error.code).toBe('cannot_deactivate_self');
    expect(auditRows(t.userIds.admin)).toHaveLength(0);
  });

  it('refuses to deactivate the last active admin at the service level and rolls back', () => {
    const before = { audit: auditRows().length, revoked: sessionRows(t.userIds.admin) };
    expect(() =>
      deactivateUser(t.db, t.clock, { actorUserId: t.userIds.employee, userId: t.userIds.admin, reason: null }),
    ).toThrow(expect.objectContaining({ status: 409, code: 'last_active_admin' }));
    expect(t.db.prepare('SELECT status FROM users WHERE id = ?').pluck().get(t.userIds.admin)).toBe('active');
    expect(auditRows()).toHaveLength(before.audit);
    expect(sessionRows(t.userIds.admin)).toEqual(before.revoked);
  });

  it('lets one admin deactivate another while a third remains, and refuses when none would remain', async () => {
    const second = await createColleague();
    await t.request('PATCH', `/api/admin/users/${second.id}`, { cookie: admin, body: { role: 'admin' } });
    const secondCookie = cookieOf(await loginAs(second.email, second.password));
    const ok = await t.request('POST', `/api/admin/users/${second.id}/deactivate`, { cookie: admin, body: {} });
    expect(ok.status).toBe(200);
    expect((await t.request('GET', '/api/admin/users', { cookie: secondCookie })).status).toBe(401);
    // The first admin is now the only active admin; the deactivated one cannot act.
    expect(() =>
      deactivateUser(t.db, t.clock, { actorUserId: second.id, userId: t.userIds.admin, reason: null }),
    ).toThrow(expect.objectContaining({ code: 'last_active_admin' }));
  });

  it('keeps all of the user’s data and history after deactivation', async () => {
    const created = await t.request('POST', '/api/days/2026-09-21/sessions', {
      cookie: employee,
      body: {
        start: { local: '2026-09-21T09:00', zone: 'America/Los_Angeles' },
        end: { local: '2026-09-21T17:00', zone: 'America/Los_Angeles' },
        input_zone: 'America/Los_Angeles',
        breaks: [],
        breaks_confirmed: true,
      },
    });
    expect(created.status).toBe(201);
    const auditBefore = t.db.prepare('SELECT count(*) FROM audit_events WHERE owner_user_id = ?').pluck().get(t.userIds.employee) as number;
    await t.request('POST', `/api/admin/users/${t.userIds.employee}/deactivate`, { cookie: admin, body: {} });
    expect(t.db.prepare('SELECT count(*) FROM work_sessions WHERE user_id = ?').pluck().get(t.userIds.employee)).toBe(1);
    expect(t.db.prepare('SELECT count(*) FROM audit_events WHERE owner_user_id = ?').pluck().get(t.userIds.employee)).toBe(auditBefore + 1);
  });

  it('is a quiet no-op when the user is already deactivated, and 404s for an unknown account', async () => {
    const colleague = await createColleague();
    await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, { cookie: admin, body: {} });
    const count = auditRows(colleague.id).length;
    const again = await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, { cookie: admin, body: {} });
    expect(again.status).toBe(200);
    expect(again.body.user.status).toBe('deactivated');
    expect(auditRows(colleague.id)).toHaveLength(count);
    for (const action of ['deactivate', 'reactivate']) {
      const missing = await t.request('POST', `/api/admin/users/00000000-0000-4000-8000-000000000000/${action}`, {
        cookie: admin,
        body: {},
      });
      expect(missing.status, action).toBe(404);
    }
  });

  it('reactivates the account without reviving any old session, and sign-in works again', async () => {
    const colleague = await createColleague();
    const old = cookieOf(await loginAs(colleague.email, colleague.password));
    await t.request('POST', `/api/admin/users/${colleague.id}/deactivate`, { cookie: admin, body: {} });
    t.clock.advanceSeconds(120);
    const response = await t.request('POST', `/api/admin/users/${colleague.id}/reactivate`, {
      cookie: admin,
      body: { reason: 'Returned' },
    });
    expect(response.status).toBe(200);
    expect(response.body.user.status).toBe('active');
    expect((await t.request('GET', '/api/auth/me', { cookie: old })).status).toBe(401);
    expect(sessionRows(colleague.id).every((row) => row.revoked_at !== null)).toBe(true);
    const fresh = await loginAs(colleague.email, colleague.password);
    expect(fresh.status).toBe(200);
    expect((await t.request('GET', '/api/auth/me', { cookie: cookieOf(fresh) })).status).toBe(200);
    expect((await t.request('GET', '/api/auth/me', { cookie: old })).status).toBe(401);
    const event = auditRows(colleague.id).find((row) => row.operation === 'user.reactivate');
    expect(event).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: colleague.id, reason: 'Returned' });
    expect(JSON.parse(event?.before_json ?? 'null')).toMatchObject({ status: 'deactivated' });
    expect(JSON.parse(event?.after_json ?? 'null')).toMatchObject({ status: 'active' });
  });

  it('revokes leftover sessions of a deactivated account on reactivation', async () => {
    const colleague = await createColleague();
    const cookie = cookieOf(await loginAs(colleague.email, colleague.password));
    // Simulate an account deactivated outside the service, leaving its session unrevoked.
    t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id = ?").run(colleague.id);
    expect((await t.request('GET', '/api/auth/me', { cookie })).status).toBe(401);
    await t.request('POST', `/api/admin/users/${colleague.id}/reactivate`, { cookie: admin, body: {} });
    expect((await t.request('GET', '/api/auth/me', { cookie })).status).toBe(401);
  });

  it('is a quiet no-op to reactivate an active account', async () => {
    const count = auditRows(t.userIds.employee).length;
    const response = await t.request('POST', `/api/admin/users/${t.userIds.employee}/reactivate`, { cookie: admin, body: {} });
    expect(response.status).toBe(200);
    expect(response.body.user.status).toBe('active');
    expect(auditRows(t.userIds.employee)).toHaveLength(count);
    expect((await t.request('GET', '/api/auth/me', { cookie: employee })).status).toBe(200);
  });
});

describe('transactions and service contracts', () => {
  it('rolls the status change back when the audit write fails', () => {
    t.db.exec(
      `CREATE TRIGGER test_block_deactivate_audit BEFORE INSERT ON audit_events
         WHEN NEW.operation = 'user.deactivate' BEGIN SELECT RAISE(ABORT, 'forced_audit_failure'); END`,
    );
    expect(() =>
      deactivateUser(t.db, t.clock, { actorUserId: t.userIds.admin, userId: t.userIds.employee, reason: null }),
    ).toThrow();
    expect(t.db.prepare('SELECT status FROM users WHERE id = ?').pluck().get(t.userIds.employee)).toBe('active');
    expect(sessionRows(t.userIds.employee).every((row) => row.revoked_at === null)).toBe(true);
  });

  it('rolls an edit back when the audit write fails', () => {
    t.db.exec(
      `CREATE TRIGGER test_block_update_audit BEFORE INSERT ON audit_events
         WHEN NEW.operation = 'user.update' BEGIN SELECT RAISE(ABORT, 'forced_audit_failure'); END`,
    );
    expect(() =>
      updateUser(t.db, t.clock, { actorUserId: t.userIds.admin, userId: t.userIds.employee, displayName: 'Rolled Back' }),
    ).toThrow();
    expect(t.db.prepare('SELECT display_name FROM users WHERE id = ?').pluck().get(t.userIds.employee)).toBe('Example Employee');
  });

  it('counts the sessions that revokeAllAuthSessions revokes', async () => {
    await t.loginResponse('employee');
    expect(revokeAllAuthSessions(t.db, t.clock, t.userIds.employee)).toBe(2);
    expect(revokeAllAuthSessions(t.db, t.clock, t.userIds.employee)).toBe(0);
  });
});
