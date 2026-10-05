import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { runDeadlineScan, setAutomationActivation } from '../../src/server/services/automation.ts';
import { postCredit } from '../../src/server/services/ledger.ts';
import { saveSubmissionSettings } from '../../src/server/services/submissionSettings.ts';
import { createUser } from '../../src/server/services/users.ts';
import { createTestContext, la, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * E-13: WP2 history is the user's own audit trail plus the policy and calendar versions
 * (AC-04, FR-14). Revisions, PDFs and delivery attempts belong to WP3. WP3-T13B (FR-17, AC-16):
 * an event performed under a share shows the grantee's display name in the owner's history;
 * every other event by someone else stays unattributed.
 */

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

async function createSession(cookie: string, date: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie,
    body: { start: la(`${date}T09:00`), end: la(`${date}T17:00`), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
  });
  expect(response.status).toBe(201);
  return response.body.session.id as string;
}

describe('GET /api/history', () => {
  it('returns the caller’s audit events newest first with parsed before/after snapshots', async () => {
    const sessionId = await createSession(employee, '2026-09-22');
    postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'opening', minutes: 200, workDate: '2026-09-21', actorUserId: null, origin: 'system' },
    );
    const reserved = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: {
        request_key: 'history-leave',
        leave_date: '2026-10-01',
        requested_minutes: 60,
        permission: { approver_name: 'Synthetic Manager', approval_date: '2026-09-30', evidence_ref: 'Synthetic reference' },
      },
    });
    expect(reserved.status).toBe(201);

    const response = await t.request('GET', '/api/history', { cookie: employee });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const events = response.body.audit_events as Array<Record<string, any>>;
    const operations = events.map((event) => event.operation);
    expect(operations).toContain('auth.login');
    expect(operations).toContain('ot_leave.reserve');
    expect(operations.some((operation) => operation.startsWith('work_session.') || operation.includes('session'))).toBe(true);
    expect(operations).toContain('ot_ledger.credit');
    // Newest first.
    const times = events.map((event) => event.occurred_at as string);
    expect(times).toEqual([...times].sort().reverse());
    const reserve = events.find((event) => event.operation === 'ot_leave.reserve');
    expect(reserve).toMatchObject({
      entity_type: 'ot_leave_request',
      entity_id: reserved.body.request.id,
      actor_is_self: true,
      via_share: false,
      actor_display_name: null,
      before: null,
    });
    expect(reserve?.after).toMatchObject({ approved_minutes: 60, reserved_minutes: 60, evidence_ref: 'Synthetic reference' });
    expect(events.some((event) => event.entity_id === sessionId)).toBe(true);
    // Every event belongs to the caller; without a share nobody else is ever named.
    for (const event of events) {
      expect(event.actor_is_self === true || event.actor_user_id === null).toBe(true);
      expect(event.via_share, event.operation).toBe(false);
      expect(event.actor_display_name, event.operation).toBeNull();
    }
    expect(JSON.stringify(response.body)).not.toContain(t.userIds.admin);
  });

  it('includes the policy and calendar versions of the caller', async () => {
    const response = await t.request('GET', '/api/history', { cookie: employee });
    expect(response.body.policy_versions).toHaveLength(1);
    expect(response.body.policy_versions[0]).toMatchObject({ seq: 1, required_minutes: expect.any(Number), effective_from: expect.any(String) });
    expect(response.body.calendar_versions.length).toBeGreaterThanOrEqual(1);
    expect(response.body.calendar_versions[0]).toMatchObject({ seq: 1, effective_from: expect.any(String), weekdays: expect.any(Array) });
    const created = await t.request('POST', '/api/policies', {
      cookie: employee,
      body: {
        effective_from: '2026-10-12',
        required_minutes: 450,
        threshold_minutes: 0,
        rounding_step_minutes: 15,
        reference_start: '08:00',
        reference_end: '15:30',
        breaks: [],
        deficit_mode: 'ignore',
        note: 'Synthetic change',
      },
    });
    expect(created.status).toBe(201);
    const after = await t.request('GET', '/api/history', { cookie: employee });
    expect(after.body.policy_versions.map((policy: { seq: number }) => policy.seq)).toEqual([1, 2]);
    expect(after.body.audit_events.map((event: { operation: string }) => event.operation)).toContain('work_policy.create');
    expect(JSON.stringify(after.body)).not.toContain(t.userIds.admin);
  });

  it('never shows another user’s events or versions, admin included', async () => {
    const employeeSession = await createSession(employee, '2026-09-22');
    await createSession(admin, '2026-09-23');
    const adminPolicy = await t.request('POST', '/api/policies', {
      cookie: admin,
      body: {
        effective_from: '2026-10-12',
        required_minutes: 300,
        threshold_minutes: 0,
        rounding_step_minutes: 15,
        reference_start: '08:00',
        reference_end: '13:00',
        breaks: [],
        deficit_mode: 'ignore',
        note: 'Admin private policy note',
      },
    });
    expect(adminPolicy.status).toBe(201);

    const adminView = await t.request('GET', `/api/history?user_id=${t.userIds.employee}`, { cookie: admin });
    expect(adminView.status).toBe(200);
    expect(JSON.stringify(adminView.body)).not.toContain(employeeSession);
    expect(JSON.stringify(adminView.body)).not.toContain(t.userIds.employee);
    for (const event of adminView.body.audit_events as Array<{ actor_user_id: string | null }>) {
      expect([t.userIds.admin, null]).toContain(event.actor_user_id);
    }
    const employeeView = await t.request('GET', '/api/history', { cookie: employee });
    expect(JSON.stringify(employeeView.body)).not.toContain('Admin private policy note');
    expect(employeeView.body.policy_versions).toHaveLength(1);
  });

  it('ADV-A-04: the page cursor is a per-user ordinal and reveals nothing about other users’ events', async () => {
    await t.loginResponse('employee');
    for (let index = 0; index < 7; index += 1) await t.loginResponse('admin');
    await t.loginResponse('employee');
    const ownTotal = t.db.prepare('SELECT count(*) FROM audit_events WHERE owner_user_id = ?').pluck().get(t.userIds.employee) as number;
    const globalTotal = t.db.prepare('SELECT count(*) FROM audit_events').pluck().get() as number;
    expect(globalTotal).toBeGreaterThanOrEqual(ownTotal + 7);

    const cursors: string[] = [];
    const seen: string[] = [];
    let before: string | null = null;
    for (let page = 0; page < ownTotal + 2; page += 1) {
      const query: string = before === null ? '?limit=1' : `?limit=1&before=${before}`;
      const response = await t.request('GET', `/api/history${query}`, { cookie: employee });
      expect(response.status).toBe(200);
      const events = response.body.audit_events as Array<{ id: string }>;
      seen.push(...events.map((event) => event.id));
      before = response.body.next_before as string | null;
      if (before === null) break;
      cursors.push(before);
    }
    // Every own event exactly once, newest first, and nothing else.
    expect(seen).toHaveLength(ownTotal);
    expect(new Set(seen).size).toBe(ownTotal);
    // The cursors count only the user’s own events: consecutive ordinals from the newest down to 2.
    expect(cursors).toHaveLength(ownTotal - 1);
    const numbers = cursors.map(Number);
    expect(numbers).toEqual(Array.from({ length: ownTotal - 1 }, (_, index) => ownTotal - index));
    expect(Math.max(...numbers)).toBe(ownTotal);
  });

  it('ADV-A-04: a cursor from the global sequence selects nothing of another user’s events', async () => {
    for (let index = 0; index < 5; index += 1) await t.loginResponse('admin');
    const own = t.db.prepare('SELECT count(*) FROM audit_events WHERE owner_user_id = ?').pluck().get(t.userIds.employee) as number;
    const first = await t.request('GET', `/api/history?limit=500&before=${own + 1000}`, { cookie: employee });
    expect(first.status).toBe(200);
    expect(first.body.audit_events).toHaveLength(own);
    expect(first.body.next_before).toBeNull();
    const none = await t.request('GET', '/api/history?before=1', { cookie: employee });
    expect(none.body.audit_events).toHaveLength(0);
  });

  it('does not expose shared-calendar audit events that have no owner', async () => {
    const response = await t.request('GET', '/api/history', { cookie: employee });
    const operations = (response.body.audit_events as Array<{ operation: string }>).map((event) => event.operation);
    expect(operations).not.toContain('calendar.create');
    expect(operations).not.toContain('calendar_version.create');
  });

  it('pages with limit and before, and validates both', async () => {
    for (const date of ['2026-09-22', '2026-09-23', '2026-09-24']) await createSession(employee, date);
    const first = await t.request('GET', '/api/history?limit=2', { cookie: employee });
    expect(first.status).toBe(200);
    expect(first.body.audit_events).toHaveLength(2);
    expect(typeof first.body.next_before).toBe('string');
    const second = await t.request('GET', `/api/history?limit=2&before=${encodeURIComponent(first.body.next_before)}`, { cookie: employee });
    expect(second.status).toBe(200);
    const firstIds = first.body.audit_events.map((event: { id: string }) => event.id);
    const secondIds = second.body.audit_events.map((event: { id: string }) => event.id);
    expect(secondIds.length).toBeGreaterThan(0);
    expect(secondIds.filter((id: string) => firstIds.includes(id))).toEqual([]);
    for (const query of ['limit=0', 'limit=501', 'limit=abc', 'before=zzz']) {
      const bad = await t.request('GET', `/api/history?${query}`, { cookie: employee });
      expect(bad.status, query).toBe(422);
    }
  });

  async function addGrantee(): Promise<{ id: string; cookie: string }> {
    const password = randomBytes(18).toString('base64url');
    const id = await createUser(
      t.db,
      t.clock,
      { email: 'grantee@example.invalid', displayName: 'Synthetic Grantee', role: 'employee', password, calendarId: t.calendarId },
      t.userIds.admin,
    );
    const login = await t.request('POST', '/api/auth/login', { body: { email: 'grantee@example.invalid', password } });
    expect(login.status).toBe(200);
    return { id, cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '' };
  }

  it('names the grantee for events performed under a share and nobody else (WP3-T13B)', async () => {
    const grantee = await addGrantee();
    const items = { timesheets: 'edit', ot_read: false, pdf_download: false };
    const granted = await t.request('POST', '/api/shares', { cookie: employee, body: { grantee_email: 'grantee@example.invalid', items } });
    expect(granted.status, JSON.stringify(granted.body)).toBe(201);
    // The administrator also holds a share of the employee, yet account administration is never done under a share.
    const toAdmin = await t.request('POST', '/api/shares', { cookie: employee, body: { grantee_email: t.emails.admin, items } });
    expect(toAdmin.status, JSON.stringify(toAdmin.body)).toBe(201);
    t.clock.advanceSeconds(60);
    const shared = await t.request('POST', `/api/shared/${t.userIds.employee}/days/2026-09-22/sessions`, {
      cookie: grantee.cookie,
      body: { start: la('2026-09-22T09:00'), end: la('2026-09-22T17:00'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(shared.status, JSON.stringify(shared.body)).toBe(201);
    const renamed = await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: { display_name: 'Renamed Employee' } });
    expect(renamed.status).toBe(200);

    const response = await t.request('GET', '/api/history', { cookie: employee });
    expect(response.status).toBe(200);
    const events = response.body.audit_events as Array<Record<string, any>>;
    const created = events.find((event) => event.operation === 'work_session.create');
    expect(created).toMatchObject({
      entity_id: shared.body.session.id,
      actor_is_self: false,
      actor_user_id: null,
      via_share: true,
      actor_display_name: 'Synthetic Grantee',
    });
    const update = events.find((event) => event.operation === 'user.update');
    expect(update).toMatchObject({ actor_is_self: false, actor_user_id: null, via_share: false, actor_display_name: null });
    const grant = events.find((event) => event.operation === 'share.grant');
    expect(grant).toMatchObject({ actor_is_self: true, via_share: false, actor_display_name: null });
    // The grantee is named, never identified.
    const text = JSON.stringify(response.body);
    expect(text).not.toContain(grantee.id);
    expect(text).not.toContain(t.userIds.admin);
    expect(text).not.toContain('grantee@example.invalid');
    // The grantee's own history holds none of the owner's events.
    const own = await t.request('GET', '/api/history', { cookie: grantee.cookie });
    expect(JSON.stringify(own.body)).not.toContain(shared.body.session.id);
  });

  const UNATTRIBUTED = { actor_is_self: false, actor_user_id: null, via_share: false, actor_display_name: null };
  const VIEW = { timesheets: 'view', ot_read: false, pdf_download: false };

  async function shareWith(email: string, items: Record<string, unknown> = VIEW): Promise<string> {
    const response = await t.request('POST', '/api/shares', { cookie: employee, body: { grantee_email: email, items } });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    return response.body.share.id as string;
  }

  async function historyEvents(): Promise<Array<Record<string, any>>> {
    const response = await t.request('GET', '/api/history', { cookie: employee });
    expect(response.status).toBe(200);
    return response.body.audit_events as Array<Record<string, any>>;
  }

  it('WP3-C-02: a grantee leaving the share is not an act under it and stays unattributed', async () => {
    const grantee = await addGrantee();
    const id = await shareWith('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    expect((await t.request('POST', `/api/shares/${id}/revoke`, { cookie: grantee.cookie, body: {} })).status).toBe(200);
    const left = (await historyEvents()).find((event) => event.operation === 'share.revoke');
    expect(left).toMatchObject(UNATTRIBUTED);
    expect(left?.after).toEqual({ revoked_by_role: 'grantee' });
  });

  it('WP3-C-02: an administrator who also holds a share keeps an admin-route revocation as an admin act', async () => {
    await addGrantee();
    const granteeShare = await shareWith('grantee@example.invalid');
    await shareWith(t.emails.admin);
    t.clock.advanceSeconds(60);
    const revoked = await t.request('POST', `/api/admin/shares/${granteeShare}/revoke`, { cookie: admin, body: { reason: 'Synthetic security reason' } });
    expect(revoked.status, JSON.stringify(revoked.body)).toBe(200);
    const response = await t.request('GET', '/api/history', { cookie: employee });
    const event = (response.body.audit_events as Array<Record<string, any>>).find((row) => row.operation === 'share.revoke');
    expect(event).toMatchObject(UNATTRIBUTED);
    expect(event?.after).toEqual({ revoked_by_role: 'admin' });
    expect(JSON.stringify(response.body)).not.toContain(t.userIds.admin);
  });

  it('WP3-C-02: an act in the same second as a later grant to its actor is not attributed retroactively', async () => {
    await addGrantee();
    const granteeShare = await shareWith('grantee@example.invalid');
    // One clock reading for all three steps: the admin revokes, then the owner grants the admin a share.
    const revoked = await t.request('POST', `/api/admin/shares/${granteeShare}/revoke`, { cookie: admin, body: {} });
    expect(revoked.status, JSON.stringify(revoked.body)).toBe(200);
    await shareWith(t.emails.admin);
    const events = await historyEvents();
    const revocation = events.find((event) => event.operation === 'share.revoke');
    const grantToAdmin = events.filter((event) => event.operation === 'share.grant').at(0);
    expect(revocation?.occurred_at).toBe(grantToAdmin?.occurred_at);
    expect(revocation).toMatchObject(UNATTRIBUTED);
  });

  it('WP3-C-02: every write a share can make is attributed, and nothing recorded outside /api/shared is', async () => {
    const grantee = await addGrantee();
    await shareWith('grantee@example.invalid', { timesheets: 'edit', ot_read: false, pdf_download: false });
    await shareWith(t.emails.admin, { timesheets: 'edit', ot_read: false, pdf_download: false });
    t.clock.advanceSeconds(60);
    const base = `/api/shared/${t.userIds.employee}`;
    const body = (date: string) => ({ start: la(`${date}T09:00`), end: la(`${date}T17:00`), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true });
    const created = await t.request('POST', `${base}/days/2026-09-22/sessions`, { cookie: grantee.cookie, body: body('2026-09-22') });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const sessionId = created.body.session.id as string;
    const updated = await t.request('PUT', `${base}/sessions/${sessionId}`, {
      cookie: grantee.cookie,
      body: { ...body('2026-09-22'), expected_version: 1 },
    });
    expect(updated.status, JSON.stringify(updated.body)).toBe(200);
    const day = await t.request('PUT', `${base}/days/2026-09-23`, {
      cookie: grantee.cookie,
      body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' },
    });
    expect(day.status, JSON.stringify(day.body)).toBe(200);
    const batch = await t.request('POST', `${base}/days/batch`, {
      cookie: grantee.cookie,
      body: { mode: 'commit', entries: [{ work_date: '2026-09-24', category: 'Sick', expected_version: null }] },
    });
    expect(batch.status, JSON.stringify(batch.body)).toBe(200);
    const deleted = await t.request('DELETE', `${base}/sessions/${sessionId}`, { cookie: grantee.cookie, body: { expected_version: 2 } });
    expect(deleted.status, JSON.stringify(deleted.body)).toBe(200);

    const events = await historyEvents();
    const written = events.filter((event) => event.entity_type === 'work_session' || event.entity_type === 'day_entry');
    expect(written.map((event) => event.operation).sort()).toEqual([
      'day_entry.create',
      'day_entry.create',
      'day_entry.create',
      'work_session.create',
      'work_session.delete',
      'work_session.update',
    ]);
    for (const event of written) {
      expect(event, event.operation).toMatchObject({ actor_is_self: false, actor_user_id: null, via_share: true, actor_display_name: 'Synthetic Grantee' });
    }
    // Everything else by another person (the grant to the grantee is the owner's own act) stays unattributed.
    for (const event of events.filter((row) => !written.includes(row))) expect(event.via_share, event.operation).toBe(false);
  });

  it('WP3-RBC-01: every event without an actor is a system event, whatever its operation (the automatic OT credit and debit)', async () => {
    // Auto-submit saved and activated, then a Monday with one OT hour; the deadline pass submits automatically (P2: due 2026-10-14T00:00Z).
    saveSubmissionSettings(t.db, t.clock, t.userIds.employee, { expectedSeq: 0, to: ['payroll@example.invalid'], autoSubmit: true });
    setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-10-03T00:00:00Z', reason: 'Synthetic pilot activation' });
    t.clock.set('2026-10-06T01:00:00Z');
    employee = await t.login('employee');
    admin = await t.login('admin');
    const worked = await t.request('POST', '/api/days/2026-10-05/sessions', {
      cookie: employee,
      body: { start: la('2026-10-05T09:00'), end: la('2026-10-05T18:00'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(worked.status, JSON.stringify(worked.body)).toBe(201);
    t.clock.set('2026-10-14T00:05:00Z');
    runDeadlineScan(t.db, t.clock);
    expect(t.db.prepare('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?').pluck().get(t.userIds.employee)).toBe(1);
    employee = await t.login('employee');
    admin = await t.login('admin');

    const events = (await t.request('GET', '/api/history', { cookie: employee })).body.audit_events as Array<Record<string, any>>;
    const credit = events.find((event) => event.operation === 'ot_ledger.credit');
    expect(credit, 'the automatic credit is in the owner history').toBeDefined();
    // The actor-less posting is flagged as a system event by the server, not recognised by its name on the client.
    expect(credit).toMatchObject({ actor_is_self: false, actor_user_id: null, actor_is_system: true, via_share: false, actor_display_name: null });
    const auto = events.find((event) => event.operation === 'timesheet.auto_finalize');
    expect(auto).toMatchObject({ actor_is_system: true, actor_is_self: false });
    // The flag is exactly "no actor": every event with an actor, the owner's own or another person's, is not a system event.
    const noActor = t.db.prepare('SELECT id FROM audit_events WHERE owner_user_id = ? AND actor_user_id IS NULL').pluck().all(t.userIds.employee) as string[];
    expect(noActor.length).toBeGreaterThan(1);
    for (const event of events) expect(event.actor_is_system, event.operation).toBe(noActor.includes(event.id as string));
    expect(events.some((event) => event.operation === 'auth.login' && event.actor_is_system === false && event.actor_is_self === true)).toBe(true);
    // An administrator act on the account is another person's, never "system".
    await t.request('PATCH', `/api/admin/users/${t.userIds.employee}`, { cookie: admin, body: { display_name: 'Renamed Employee' } });
    const after = (await t.request('GET', '/api/history', { cookie: employee })).body.audit_events as Array<Record<string, any>>;
    expect(after.find((event) => event.operation === 'user.update')).toMatchObject({ actor_is_system: false, actor_is_self: false, actor_user_id: null });
    // No identifier of anyone else leaves the server.
    expect(JSON.stringify(after)).not.toContain(t.userIds.admin);
  });

  it('is read-only, immutable and requires a session', async () => {
    const anonymous = await t.request('GET', '/api/history');
    expect(anonymous.status).toBe(401);
    const before = t.db.prepare('SELECT count(*) FROM audit_events').pluck().get();
    await t.request('GET', '/api/history', { cookie: employee });
    expect(t.db.prepare('SELECT count(*) FROM audit_events').pluck().get()).toBe(before);
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const response = await t.request(method, '/api/history', { cookie: employee, body: {}, origin: ORIGIN });
      expect(response.status, method).toBe(404);
    }
  });
});
