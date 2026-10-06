import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { createAuthSession, findSessionUser, type SessionUser } from '../../src/server/auth/sessions.ts';
import { handleError } from '../../src/server/http/errors.ts';
import type { DayEntryBody } from '../../src/server/http/schemas.ts';
import { requireUser } from '../../src/server/http/auth.ts';
import { apiRoutes } from '../../src/server/routes/api.ts';
import { otRoutes } from '../../src/server/routes/ot.ts';
import { submissionRoutes } from '../../src/server/routes/submission.ts';
import { getHistory } from '../../src/server/services/history.ts';
import { postCredit } from '../../src/server/services/ledger.ts';
import { granteeChangesForReview } from '../../src/server/services/sharedActs.ts';
import { commitDayBatch, previewDayBatch } from '../../src/server/services/dayEntries.ts';
import { clockIn, createSession, upsertDayEntry } from '../../src/server/services/timesheetCommands.ts';
import type { AppDeps, AppEnv, DeliveryConfig } from '../../src/server/types.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T13A: the actor/subject seam. The actor is the signed-in user who performs an action; the
 * subject is the owner principal whose timesheet the action is about. Today both are the session
 * user on every route (no grants exist), so nothing observable changes. These tests pin the seam
 * itself: the request context carries both, the personal routers take the owner from the subject
 * and the audit attribution from the actor, commands record both ids, no personal router or
 * service reads the session user directly, and the admin status reads the injected delivery
 * configuration. A test-only access guard sets a subject that differs from the actor; it stands in
 * for the later grant resolution and grants nothing. Synthetic data only.
 */

let t: TestContext;
/** Audit rows written by the seed (before the test acts) are not part of what a test asserts. */
let seededAuditRows: number;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  seededAuditRows = Number(t.db.prepare('SELECT max(rowid) FROM audit_events').pluck().get() ?? 0);
});

afterEach(() => {
  vi.unstubAllEnvs();
  t.close();
});

const SERVER = join(import.meta.dirname, '../../src/server');

function deps(delivery?: DeliveryConfig): AppDeps {
  return {
    db: t.db,
    clock: t.clock,
    config: t.config,
    loginLimiter: new LoginRateLimiter(),
    staticDir: null,
    ...(delivery === undefined ? {} : { delivery }),
  };
}

function principalOf(userId: string): SessionUser {
  const { token } = createAuthSession(t.db, t.clock, userId, 3600);
  const user = findSessionUser(t.db, t.clock, token);
  if (user === null) throw new Error('Synthetic session did not resolve');
  return user;
}

/** The personal routers behind a test-only access guard whose subject can differ from the actor. */
function seamApp(actor: SessionUser, subject: SessionUser) {
  const access = createMiddleware<AppEnv>(async (c, next) => {
    c.set('user', actor);
    c.set('actor', actor);
    c.set('subject', subject);
    await next();
  });
  const app = new Hono<AppEnv>();
  app.onError(handleError);
  app.route('/api/ot', otRoutes(deps(), { access }));
  app.route('/api', submissionRoutes(deps(), { access }));
  app.route('/api', apiRoutes(deps(), { access }));
  return (method: string, path: string, body?: unknown) =>
    app.request(path, {
      method,
      headers: { 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
}

const sessionBody = (date: string) => ({
  start: la(`${date}T09:00`),
  end: la(`${date}T12:00`),
  input_zone: LA,
  breaks: [],
  breaks_confirmed: true,
});

const dayBody = (category: DayEntryBody['category']) => ({ category, leave_minutes: 0, wfh: false, notes: '' });

function auditRows(entityType?: string) {
  const sql = `SELECT operation, entity_type, actor_user_id, owner_user_id FROM audit_events WHERE rowid > ? ${
    entityType === undefined ? '' : 'AND entity_type = ?'
  } ORDER BY rowid`;
  const statement = t.db.prepare(sql);
  return (entityType === undefined ? statement.all(seededAuditRows) : statement.all(seededAuditRows, entityType)) as Array<{
    operation: string;
    entity_type: string;
    actor_user_id: string;
    owner_user_id: string;
  }>;
}

describe('the request context carries actor and subject', () => {
  it('sets actor = subject = the session user on every personal route', async () => {
    const cookie = await t.login('employee');
    const seen: Array<{ user: string; actor: string | undefined; subject: string | undefined }> = [];
    const access = createMiddleware<AppEnv>(async (c, next) => {
      await requireUser(deps())(c, async () => {
        seen.push({ user: c.get('user').id, actor: c.get('actor')?.id, subject: c.get('subject')?.id });
        await next();
      });
    });
    const app = new Hono<AppEnv>();
    app.onError(handleError);
    const routers = [otRoutes(deps(), { access }), submissionRoutes(deps(), { access }), apiRoutes(deps(), { access })];
    app.route('/api/ot', routers[0]!);
    app.route('/api', routers[1]!);
    app.route('/api', routers[2]!);

    const routes = new Map<string, { method: string; path: string }>();
    for (const [prefix, router] of [['/api/ot', routers[0]!], ['/api', routers[1]!], ['/api', routers[2]!]] as const) {
      for (const route of router.routes) {
        const path = `${prefix}${route.path === '/' ? '' : route.path}`;
        routes.set(`${route.method} ${path}`, { method: route.method, path });
      }
    }
    expect(routes.size).toBeGreaterThanOrEqual(30);

    for (const { method, path } of routes.values()) {
      const before = seen.length;
      const url = path.replace(/:[A-Za-z]+/g, 'x');
      await app.request(url, {
        method,
        headers: { cookie, 'content-type': 'application/json' },
        ...(method === 'GET' ? {} : { body: '{}' }),
      });
      expect(seen.length, `${method} ${path} reached its access guard`).toBe(before + 1);
      expect(seen.at(-1), `${method} ${path}`).toEqual({
        user: t.userIds.employee,
        actor: t.userIds.employee,
        subject: t.userIds.employee,
      });
    }
  });

  it('keeps the production mounts: an anonymous caller is refused and the session user is both principals', async () => {
    const app = createApp(deps(), { dataDir: join(dirname(t.config.databasePath), 'private-data') });
    const anonymous = await app.request('/api/calendar', { headers: { origin: ORIGIN } });
    expect(anonymous.status).toBe(401);
    const cookie = await t.login('employee');
    const response = await app.request('/api/calendar', { headers: { origin: ORIGIN, cookie } });
    expect(response.status).toBe(200);
  });
});

describe('the personal routers take the owner from the subject and the audit from the actor', () => {
  it('writes the subject own rows and attributes the audit event to the actor (api.ts)', async () => {
    const admin = principalOf(t.userIds.admin);
    const employee = principalOf(t.userIds.employee);
    const request = seamApp(admin, employee);

    const created = await request('POST', '/api/days/2026-09-21/sessions', sessionBody('2026-09-21'));
    expect(created.status, await created.clone().text()).toBe(201);
    const sessionId = ((await created.json()) as { session: { id: string } }).session.id;
    expect((await request('PUT', '/api/days/2026-09-22', dayBody('Vacation'))).status).toBe(200);

    const owners = t.db.prepare('SELECT DISTINCT user_id FROM work_sessions UNION SELECT DISTINCT user_id FROM day_entries').pluck().all();
    expect(owners).toEqual([t.userIds.employee]);
    for (const row of auditRows()) {
      expect(row, row.operation).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: t.userIds.employee });
    }
    expect(auditRows().length).toBeGreaterThanOrEqual(2);

    // The subject's session is found through the seam, and not by the actor's own account.
    expect((await request('GET', `/api/sessions/${sessionId}`)).status).toBe(200);
    const asActorOnly = await t.request('GET', `/api/sessions/${sessionId}`, { cookie: await t.login('admin') });
    expect(asActorOnly.status).toBe(404);
  });

  it('reads the subject OT balance and records leave under the subject with the actor attributed (ot.ts)', async () => {
    postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'opening-balance', minutes: 600, workDate: '2026-09-21', actorUserId: null, origin: 'system' },
    );
    const request = seamApp(principalOf(t.userIds.admin), principalOf(t.userIds.employee));
    const summary = await request('GET', '/api/ot/summary');
    expect(((await summary.json()) as { posted_minutes: number }).posted_minutes).toBe(600);

    const reserve = await request('POST', '/api/ot/leave', {
      request_key: 'synthetic-seam-0001',
      leave_date: '2026-10-01',
      requested_minutes: 120,
      permission: {
        approver_name: 'Synthetic Manager',
        approver_identity: 'manager@example.invalid',
        approval_date: '2026-09-30',
        evidence_ref: 'Synthetic chat reference 0001',
      },
    });
    expect(reserve.status, await reserve.clone().text()).toBe(201);
    const rows = t.db.prepare('SELECT user_id FROM ot_leave_requests').pluck().all();
    expect(rows).toEqual([t.userIds.employee]);
    const leaveAudits = auditRows().filter((row) => row.operation.startsWith('ot_ledger.leave_') || row.entity_type === 'ot_leave_request');
    expect(leaveAudits.length).toBeGreaterThan(0);
    for (const row of leaveAudits) {
      expect(row, row.operation).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: t.userIds.employee });
    }
  });

  it('lists the subject revision status and deliveries, not the actor (submission.ts)', async () => {
    const request = seamApp(principalOf(t.userIds.admin), principalOf(t.userIds.employee));
    for (const path of ['/api/revisions/pending-lines', '/api/deliveries', '/api/timesheets/2026-10-02/finalization']) {
      const response = await request('GET', path);
      expect(response.status, path).toBe(200);
    }
  });
});

describe('commands and audit record actor and subject', () => {
  const employee = () => principalOf(t.userIds.employee);
  const admin = () => principalOf(t.userIds.admin);

  it('records actor_user_id = actor and owner_user_id = subject for single commands', () => {
    const ctx = { db: t.db, clock: t.clock, user: employee(), actor: admin() };
    const created = createSession(ctx, '2026-09-21', sessionBody('2026-09-21'));
    upsertDayEntry(ctx, '2026-09-22', dayBody('Vacation'));
    clockIn(ctx, { input_zone: LA });
    const rows = auditRows();
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const row of rows) {
      expect(row, row.operation).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: t.userIds.employee });
    }
    expect(rows.map((row) => row.operation)).toContain('work_session.create');
    expect(created.session.id).toBeTruthy();
    // Every row the commands wrote belongs to the subject.
    expect(t.db.prepare('SELECT count(*) FROM work_sessions WHERE user_id = ?').pluck().get(t.userIds.admin)).toBe(0);
  });

  it('WP4-T02: an actor other than the owner outside /api/shared leaves the share marker NULL and is not a share act', () => {
    // The migration is pinned before every audit row here, so only the recorded marker can attribute an act.
    t.db.prepare("UPDATE schema_migrations SET applied_at = '2026-09-01T00:00:00Z' WHERE version = 7").run();
    const ctx = { db: t.db, clock: t.clock, user: employee(), actor: admin() };
    createSession(ctx, '2026-09-21', sessionBody('2026-09-21'));
    upsertDayEntry(ctx, '2026-09-22', dayBody('Vacation'));
    const rows = t.db
      .prepare('SELECT id, actor_user_id, via_share_id FROM audit_events WHERE rowid > ? ORDER BY rowid')
      .all(seededAuditRows) as Array<{ id: string; actor_user_id: string; via_share_id: string | null }>;
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (const row of rows) expect(row, row.id).toMatchObject({ actor_user_id: t.userIds.admin, via_share_id: null });
    const history = getHistory(t.db, { id: t.userIds.employee, calendarId: t.calendarId }, {});
    for (const row of rows) {
      expect(history.audit_events.find((event) => event.id === row.id), row.id).toMatchObject({ via_share: false, actor_display_name: null });
    }
    expect(granteeChangesForReview(t.db, { id: t.userIds.employee, calendarId: t.calendarId }, '2026-10-02')).toEqual([]);
  });

  it('records both ids for a committed day batch and writes nothing for a preview', () => {
    const ctx = { db: t.db, clock: t.clock, user: employee(), actor: admin() };
    const body = {
      mode: 'commit' as const,
      entries: [
        { work_date: '2026-09-21', category: 'Vacation' as const, expected_version: null },
        { work_date: '2026-09-22', category: 'Sick' as const, expected_version: null },
      ],
    };
    previewDayBatch(ctx, { ...body, mode: 'preview' });
    expect(auditRows()).toHaveLength(0);
    commitDayBatch(ctx, body);
    const rows = auditRows('day_entry');
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: t.userIds.employee });
    }
  });

  it('defaults the actor to the owner when a caller passes only the subject', () => {
    createSession({ db: t.db, clock: t.clock, user: employee() }, '2026-09-21', sessionBody('2026-09-21'));
    const rows = auditRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row).toMatchObject({ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee });
    }
  });
});

describe('no personal router or service reads the session user for ownership', () => {
  const read = (...parts: string[]) => readFileSync(join(SERVER, ...parts), 'utf8');
  const SESSION_USER_READ = /\.get\(\s*['"`]user['"`]\s*\)/;

  it('keeps c.get(user) out of the personal routers', () => {
    for (const name of ['api.ts', 'ot.ts', 'submission.ts']) {
      expect(read('routes', name), name).not.toMatch(SESSION_USER_READ);
    }
  });

  it('keeps every service free of request-context reads', () => {
    const dir = join(SERVER, 'services');
    for (const name of readdirSync(dir).filter((file) => file.endsWith('.ts'))) {
      const source = readFileSync(join(dir, name), 'utf8');
      expect(source, name).not.toMatch(SESSION_USER_READ);
      expect(source, name).not.toMatch(/from 'hono(\/[a-z-]+)?'/);
    }
  });
});

describe('the admin status reads the injected delivery configuration', () => {
  const dataDir = () => join(dirname(t.config.databasePath), 'private-data');

  async function operations(delivery?: DeliveryConfig) {
    const admin = await t.login('admin');
    const app = createApp(deps(delivery), { dataDir: dataDir() });
    const response = await app.request('/api/admin/operations', { headers: { origin: ORIGIN, cookie: admin } });
    expect(response.status).toBe(200);
    return ((await response.json()) as { operations: { sender: unknown } }).operations;
  }

  const configured = (senderAddress: string | null): DeliveryConfig => ({
    dataDir: dataDir(),
    publicBaseUrl: 'https://timesheet.example.invalid',
    senderAddress,
    outbound: { mode: 'capture' },
  });

  it('reports the configured sender and mode with the process environment unset', async () => {
    vi.stubEnv('MAIL_FROM', undefined);
    vi.stubEnv('OUTBOUND_MODE', undefined);
    expect((await operations(configured('timesheet@example.invalid'))).sender).toEqual({ configured: true, outbound_mode: 'capture' });
    expect((await operations(configured(null))).sender).toEqual({ configured: false, outbound_mode: 'capture' });
  });

  it('ignores the process environment when a configuration is injected, and never echoes the address', async () => {
    vi.stubEnv('MAIL_FROM', 'environment-sender@example.invalid');
    vi.stubEnv('OUTBOUND_MODE', 'smtp');
    const status = await operations(configured(null));
    expect(status.sender).toEqual({ configured: false, outbound_mode: 'capture' });
    const withSender = await operations(configured('timesheet@example.invalid'));
    expect(JSON.stringify(withSender)).not.toContain('example.invalid');
  });

  it('reports an unknown setup when no configuration was provided', async () => {
    vi.stubEnv('MAIL_FROM', 'environment-sender@example.invalid');
    expect((await operations()).sender).toEqual({ configured: null, outbound_mode: 'unknown' });
  });

  it('keeps process.env out of the operations status service and the admin router', () => {
    for (const file of [join('services', 'operationsStatus.ts'), join('routes', 'admin.ts')]) {
      expect(readFileSync(join(SERVER, file), 'utf8'), file).not.toMatch(/process\.env/);
    }
  });
});
