import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { listLedgerEntries, postCorrection, postCredit } from '../../src/server/services/ledger.ts';
import { createTestContext, la, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T04: the OT summary, ledger and leave HTTP API (R-06, FR-09, FR-14, AC-01). Every
 * route derives the owner from the session; an admin has no access to employee data and
 * no route posts a credit or debit.
 */

let t: TestContext;
let employee: string;
let admin: string;

// 2026-10-02 11:00 in the America/Los_Angeles reporting zone.
beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

function credit(userId: string, minutes: number, key = 'opening-balance', workDate = '2026-09-21') {
  postCredit(
    { db: t.db, clock: t.clock },
    { userId, sourceKey: key, minutes, workDate, actorUserId: null, origin: 'system' },
  );
}

function permission(extra: Record<string, unknown> = {}) {
  return {
    approver_name: 'Synthetic Manager',
    approver_identity: 'manager@example.invalid',
    approval_date: '2026-09-30',
    evidence_ref: 'Synthetic chat reference 0001',
    ...extra,
  };
}

function reserveBody(requestKey: string, minutes: number, leaveDate = '2026-10-01', extra: Record<string, unknown> = {}) {
  return { request_key: requestKey, leave_date: leaveDate, requested_minutes: minutes, permission: permission(), ...extra };
}

async function reserve(cookie: string, requestKey: string, minutes: number, leaveDate = '2026-10-01') {
  const response = await t.request('POST', '/api/ot/leave', { cookie, body: reserveBody(requestKey, minutes, leaveDate) });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.request as { id: string; version: number };
}

function count(sql: string, ...params: unknown[]): number {
  return t.db.prepare(sql).pluck().get(...params) as number;
}

describe('GET /api/ot/summary', () => {
  it('starts at zero', async () => {
    const response = await t.request('GET', '/api/ot/summary', { cookie: employee });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      posted_minutes: 0,
      provisional_minutes: 0,
      provisional_periods: [],
      reserved_minutes: 0,
      available_minutes: 0,
      negative: false,
      reconciliation_required: false,
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps posted, provisional (E-6), reserved and available apart', async () => {
    credit(t.userIds.employee, 500);
    await reserve(employee, 'leave-a', 120);
    // Complete day 2026-09-29: 09:00-18:16 with no breaks is R 556 and credits 90 minutes.
    const session = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie: employee,
      body: { start: la('2026-09-29T09:00'), end: la('2026-09-29T18:16'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(session.status).toBe(201);
    // An incomplete (open) day on another date is never provisional credit.
    const open = await t.request('POST', '/api/days/2026-09-30/sessions', {
      cookie: employee,
      body: { start: la('2026-09-30T09:00'), end: null, input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: false },
    });
    expect(open.status).toBe(201);

    const response = await t.request('GET', '/api/ot/summary', { cookie: employee });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      posted_minutes: 500,
      reserved_minutes: 120,
      available_minutes: 380,
      provisional_minutes: 90,
      negative: false,
    });
    expect(response.body.provisional_periods).toHaveLength(1);
    const [period] = response.body.provisional_periods;
    expect(period).toMatchObject({ credited_minutes: 90, complete_days: 1, pending_days: 1 });
    expect(period.period_start <= '2026-09-29' && '2026-09-29' <= period.period_end).toBe(true);
    expect(typeof period.payroll_date).toBe('string');
    // Provisional minutes never enter the posted or available balance.
    expect(count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', t.userIds.employee)).toBe(1);
  });

  it('raises the negative flag for a truthful correction below zero (LG-08)', async () => {
    const ctx = { db: t.db, clock: t.clock };
    credit(t.userIds.employee, 100);
    const reserved = await reserve(employee, 'leave-neg', 100);
    const used = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-1', minutes: 100, expected_version: reserved.version },
    });
    expect(used.status).toBe(200);
    const original = listLedgerEntries(t.db, t.userIds.employee)[0];
    postCorrection(ctx, {
      userId: t.userIds.employee,
      sourceKey: 'correction-1',
      originalEntryId: original?.id ?? '',
      correctedMinutes: 40,
      actorUserId: t.userIds.employee,
      origin: 'manual',
      reason: 'Synthetic recalculation',
    });
    const response = await t.request('GET', '/api/ot/summary', { cookie: employee });
    expect(response.body).toMatchObject({ posted_minutes: -60, negative: true, reconciliation_required: true });
  });

  it('requires a session', async () => {
    const response = await t.request('GET', '/api/ot/summary');
    expect(response.status).toBe(401);
  });
});

describe('GET /api/ot/ledger', () => {
  it('lists only the caller’s entries in posting order, with the balance', async () => {
    credit(t.userIds.employee, 300);
    credit(t.userIds.admin, 999, 'admin-opening');
    const reserved = await reserve(employee, 'leave-l', 60);
    await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-l', minutes: 60, expected_version: reserved.version },
    });
    const response = await t.request('GET', '/api/ot/ledger', { cookie: employee });
    expect(response.status).toBe(200);
    expect(response.body.entries.map((entry: { entry_type: string; delta_minutes: number }) => [entry.entry_type, entry.delta_minutes])).toEqual([
      ['credit', 300],
      ['leave_consumption', -60],
    ]);
    expect(response.body.entries[1]).toMatchObject({ leave_request_id: reserved.id, work_date: '2026-10-01', origin: 'manual' });
    expect(response.body.balance).toMatchObject({ posted_minutes: 240, reserved_minutes: 0, available_minutes: 240 });
    expect(JSON.stringify(response.body)).not.toContain(t.userIds.admin);

    const adminView = await t.request('GET', '/api/ot/ledger', { cookie: admin });
    expect(adminView.body.entries.map((entry: { delta_minutes: number }) => entry.delta_minutes)).toEqual([999]);
  });

  it('ignores a client-supplied owner parameter', async () => {
    credit(t.userIds.employee, 300);
    const response = await t.request('GET', `/api/ot/ledger?user_id=${t.userIds.employee}`, { cookie: admin });
    expect(response.status).toBe(200);
    expect(response.body.entries).toEqual([]);
  });
});

describe('POST/GET /api/ot/leave', () => {
  it('records the permission and reserves 1:1 minutes (201), then lists it', async () => {
    credit(t.userIds.employee, 600);
    const response = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: reserveBody('leave-1', 480, '2026-10-01', { note: 'Synthetic note' }),
    });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('reserved');
    expect(response.body.request).toMatchObject({
      leave_date: '2026-10-01',
      requested_minutes: 480,
      approved_minutes: 480,
      reserved_minutes: 480,
      consumed_minutes: 0,
      approver_name: 'Synthetic Manager',
      approval_date: '2026-09-30',
      evidence_ref: 'Synthetic chat reference 0001',
      approval_origin: 'self_recorded',
      note: 'Synthetic note',
      version: 1,
    });
    expect(response.body.balance).toMatchObject({ posted_minutes: 600, reserved_minutes: 480, available_minutes: 120 });
    expect(JSON.stringify(response.body)).not.toContain(t.userIds.employee);

    const list = await t.request('GET', '/api/ot/leave', { cookie: employee });
    expect(list.status).toBe(200);
    expect(list.body.requests).toHaveLength(1);
    expect(list.body.requests[0]).toMatchObject({ id: response.body.request.id, reserved_minutes: 480, reversible_minutes: 0 });
    expect(list.body.balance).toMatchObject({ available_minutes: 120 });
  });

  it('is idempotent per request key (200 duplicate) and refuses a changed payload (409)', async () => {
    credit(t.userIds.employee, 600);
    const first = await t.request('POST', '/api/ot/leave', { cookie: employee, body: reserveBody('leave-2', 100) });
    const again = await t.request('POST', '/api/ot/leave', { cookie: employee, body: reserveBody('leave-2', 100) });
    expect(again.status).toBe(200);
    expect(again.body.status).toBe('duplicate');
    expect(again.body.request.id).toBe(first.body.request.id);
    const changed = await t.request('POST', '/api/ot/leave', { cookie: employee, body: reserveBody('leave-2', 200) });
    expect(changed.status).toBe(409);
    expect(changed.body.error.code).toBe('request_key_conflict');
    expect(count('SELECT count(*) FROM ot_leave_requests WHERE user_id = ?', t.userIds.employee)).toBe(1);
  });

  it('rejects insufficient balance with 409 and creates nothing (E-5)', async () => {
    credit(t.userIds.employee, 100);
    const response = await t.request('POST', '/api/ot/leave', { cookie: employee, body: reserveBody('leave-3', 101) });
    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: 'insufficient_balance', details: { available_minutes: 100, requested_minutes: 101 } });
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
  });

  it('needs the recorded permission and rejects owner or unknown fields', async () => {
    credit(t.userIds.employee, 600);
    const noEvidence = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: reserveBody('leave-4', 60, '2026-10-01', { permission: permission({ evidence_ref: '  ' }) }),
    });
    expect(noEvidence.status).toBe(422);
    expect(noEvidence.body.error.code).toBe('approval_required');
    const noPermission = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: { request_key: 'leave-5', leave_date: '2026-10-01', requested_minutes: 60 },
    });
    expect(noPermission.status).toBe(422);
    const withOwner = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: reserveBody('leave-6', 60, '2026-10-01', { user_id: t.userIds.admin }),
    });
    expect(withOwner.status).toBe(422);
    expect(withOwner.body.error.code).toBe('validation_error');
    const approvedOrigin = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: reserveBody('leave-7', 60, '2026-10-01', { approval_origin: 'authenticated' }),
    });
    expect(approvedOrigin.status).toBe(422);
    const fractional = await t.request('POST', '/api/ot/leave', { cookie: employee, body: reserveBody('leave-8', 60.5) });
    expect(fractional.status).toBe(422);
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
  });

  it('records the session user as both actor and owner', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-9', 120);
    await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-9', minutes: 20, expected_version: 1 },
    });
    const rows = t.db
      .prepare(`SELECT DISTINCT actor_user_id, owner_user_id FROM audit_events WHERE entity_type = 'ot_leave_request' OR operation LIKE 'ot_ledger.leave_%'`)
      .all();
    expect(rows).toEqual([{ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee }]);
    expect(count('SELECT count(*) FROM ot_leave_requests WHERE created_by <> user_id')).toBe(0);
    expect(count('SELECT count(*) FROM ot_ledger WHERE actor_user_id IS NOT NULL AND actor_user_id <> user_id')).toBe(0);
  });
});

describe('POST /api/ot/leave/:id/consume (record use, E-3)', () => {
  it('posts a partial linked debit and keeps the remainder reserved', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-c1', 480);
    const used = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c1', minutes: 180, expected_version: 1 },
    });
    expect(used.status).toBe(200);
    expect(used.body.status).toBe('used');
    expect(used.body.request).toMatchObject({ reserved_minutes: 300, consumed_minutes: 180, reversible_minutes: 180, version: 2 });
    expect(used.body.entry).toMatchObject({ entry_type: 'leave_consumption', delta_minutes: -180, leave_request_id: reserved.id });
    expect(used.body.balance).toMatchObject({ posted_minutes: 420, reserved_minutes: 300, available_minutes: 120 });

    const retry = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c1', minutes: 180, expected_version: 1 },
    });
    expect(retry.status).toBe(200);
    expect(retry.body.status).toBe('duplicate');
    expect(count('SELECT count(*) FROM ot_ledger WHERE leave_request_id = ?', reserved.id)).toBe(1);
  });

  it('refuses stale versions, over-use and use before the leave date', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-c2', 100);
    const stale = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c2', minutes: 10, expected_version: 7 },
    });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
    const over = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c3', minutes: 101, expected_version: 1 },
    });
    expect(over.status).toBe(409);
    expect(over.body.error.code).toBe('exceeds_reserved');
    const future = await reserve(employee, 'leave-c3', 60, '2026-10-20');
    const early = await t.request('POST', `/api/ot/leave/${future.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c4', minutes: 60, expected_version: 1 },
    });
    expect(early.status).toBe(409);
    expect(early.body.error.code).toBe('before_leave_date');
    const missingVersion = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-c5', minutes: 10 },
    });
    expect(missingVersion.status).toBe(422);
    expect(count('SELECT count(*) FROM ot_ledger WHERE leave_request_id IS NOT NULL')).toBe(0);
  });
});

describe('POST /api/ot/leave/:id/cancel and /reverse', () => {
  it('cancel releases the unused reservation and retries are unchanged', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-x1', 200);
    const used = await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-x1', minutes: 50, expected_version: 1 },
    });
    const cancelled = await t.request('POST', `/api/ot/leave/${reserved.id}/cancel`, {
      cookie: employee,
      body: { expected_version: used.body.request.version, reason: 'Synthetic plan change' },
    });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body).toMatchObject({ status: 'cancelled', released_minutes: 150 });
    expect(cancelled.body.request).toMatchObject({ reserved_minutes: 0, released_minutes: 150, consumed_minutes: 50 });
    expect(cancelled.body.balance).toMatchObject({ posted_minutes: 550, reserved_minutes: 0, available_minutes: 550 });
    const again = await t.request('POST', `/api/ot/leave/${reserved.id}/cancel`, {
      cookie: employee,
      body: { expected_version: cancelled.body.request.version },
    });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ status: 'unchanged', released_minutes: 0 });
  });

  it('cancel with a stale version is refused while minutes are still reserved', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-x2', 100);
    const stale = await t.request('POST', `/api/ot/leave/${reserved.id}/cancel`, { cookie: employee, body: { expected_version: 9 } });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
  });

  it('reverse gives used minutes back with a reason and a linked positive delta', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-r1', 300);
    await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-r1', minutes: 300, expected_version: 1 },
    });
    const noReason = await t.request('POST', `/api/ot/leave/${reserved.id}/reverse`, {
      cookie: employee,
      body: { reversal_key: 'rev-1', minutes: 100, expected_version: 2 },
    });
    expect(noReason.status).toBe(422);
    const reversed = await t.request('POST', `/api/ot/leave/${reserved.id}/reverse`, {
      cookie: employee,
      body: { reversal_key: 'rev-1', minutes: 100, reason: 'Synthetic correction of use', expected_version: 2 },
    });
    expect(reversed.status).toBe(200);
    expect(reversed.body.status).toBe('reversed');
    expect(reversed.body.entry).toMatchObject({ entry_type: 'leave_reversal', delta_minutes: 100, leave_request_id: reserved.id });
    expect(reversed.body.request).toMatchObject({ reversed_minutes: 100, reversible_minutes: 200, version: 3 });
    expect(reversed.body.balance).toMatchObject({ posted_minutes: 400, available_minutes: 400 });
    const over = await t.request('POST', `/api/ot/leave/${reserved.id}/reverse`, {
      cookie: employee,
      body: { reversal_key: 'rev-2', minutes: 201, reason: 'Too much', expected_version: 3 },
    });
    expect(over.status).toBe(409);
    expect(over.body.error.code).toBe('exceeds_reversible');
  });
});

describe('two-user ID swap on every OT route (AC-01)', () => {
  it('returns 404 for another user’s request on consume, cancel and reverse, also for admins', async () => {
    credit(t.userIds.employee, 600);
    const reserved = await reserve(employee, 'leave-s1', 300);
    await t.request('POST', `/api/ot/leave/${reserved.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-s1', minutes: 100, expected_version: 1 },
    });
    const before = {
      request: t.db.prepare('SELECT * FROM ot_leave_requests').all(),
      ledger: t.db.prepare('SELECT * FROM ot_ledger').all(),
      audit: count('SELECT count(*) FROM audit_events'),
    };
    const attempts: Array<[string, unknown]> = [
      ['consume', { use_key: 'swap-use', minutes: 10, expected_version: 2 }],
      ['cancel', { expected_version: 2, reason: 'swap attempt' }],
      ['reverse', { reversal_key: 'swap-rev', minutes: 10, reason: 'swap attempt', expected_version: 2 }],
    ];
    for (const [action, body] of attempts) {
      const response = await t.request('POST', `/api/ot/leave/${reserved.id}/${action}`, { cookie: admin, body });
      expect(response.status, action).toBe(404);
      expect(response.body.error.code).toBe('not_found');
    }
    // The employee also cannot touch a request owned by the admin.
    credit(t.userIds.admin, 400, 'admin-opening');
    const adminRequest = await reserve(admin, 'admin-leave', 100);
    for (const [action, body] of attempts) {
      const response = await t.request('POST', `/api/ot/leave/${adminRequest.id}/${action}`, { cookie: employee, body });
      expect(response.status, action).toBe(404);
    }
    const unknown = await t.request('POST', '/api/ot/leave/00000000-0000-4000-8000-000000000000/cancel', {
      cookie: employee,
      body: { expected_version: 1 },
    });
    expect(unknown.status).toBe(404);
    expect(t.db.prepare('SELECT * FROM ot_leave_requests WHERE user_id = ?').all(t.userIds.employee)).toEqual(
      (before.request as Array<{ user_id: string }>).filter((row) => row.user_id === t.userIds.employee),
    );
    expect((t.db.prepare('SELECT * FROM ot_ledger WHERE user_id = ?').all(t.userIds.employee) as unknown[]).length).toBe(
      (before.ledger as Array<{ user_id: string }>).filter((row) => row.user_id === t.userIds.employee).length,
    );
    expect(count('SELECT count(*) FROM audit_events WHERE operation LIKE ?', 'ot_leave.%') >= 1).toBe(true);
  });

  it('shows an admin only the admin’s own summary, ledger and requests', async () => {
    credit(t.userIds.employee, 600);
    await reserve(employee, 'leave-s2', 300);
    for (const path of ['/api/ot/summary', '/api/ot/ledger', '/api/ot/leave']) {
      const response = await t.request('GET', path, { cookie: admin });
      expect(response.status, path).toBe(200);
      expect(JSON.stringify(response.body), path).not.toContain('Synthetic Manager');
    }
    const summary = await t.request('GET', '/api/ot/summary', { cookie: admin });
    expect(summary.body).toMatchObject({ posted_minutes: 0, reserved_minutes: 0, available_minutes: 0 });
    const list = await t.request('GET', '/api/ot/leave', { cookie: admin });
    expect(list.body.requests).toEqual([]);
  });
});

describe('CSRF and origin checks on every OT POST', () => {
  const routes = [
    ['/api/ot/leave', reserveBody('csrf-key', 10)],
    ['/api/ot/leave/00000000-0000-4000-8000-000000000001/consume', { use_key: 'k', minutes: 1, expected_version: 1 }],
    ['/api/ot/leave/00000000-0000-4000-8000-000000000001/cancel', { expected_version: 1 }],
    ['/api/ot/leave/00000000-0000-4000-8000-000000000001/reverse', { reversal_key: 'k', minutes: 1, reason: 'r', expected_version: 1 }],
  ] as const;

  it.each(routes)('%s rejects a missing, foreign or cross-site origin and non-JSON bodies', async (path, body) => {
    credit(t.userIds.employee, 100);
    const missing = await t.request('POST', path, { cookie: employee, body, origin: null });
    expect(missing.status).toBe(403);
    expect(missing.body.error.code).toBe('origin_rejected');
    const foreign = await t.request('POST', path, { cookie: employee, body, origin: 'https://evil.example.invalid' });
    expect(foreign.status).toBe(403);
    const crossSite = await t.request('POST', path, { cookie: employee, body, headers: { 'sec-fetch-site': 'cross-site' } });
    expect(crossSite.status).toBe(403);
    const form = await t.request('POST', path, {
      cookie: employee,
      body: 'a=b',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    expect(form.status).toBe(415);
    const anonymous = await t.request('POST', path, { body, origin: ORIGIN });
    expect(anonymous.status).toBe(401);
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
  });
});

describe('route inventory: no route posts a credit or debit', () => {
  function appRoutes() {
    const app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
    const seen = new Set<string>();
    for (const route of app.routes) {
      if (route.method !== 'ALL') seen.add(`${route.method} ${route.path}`);
    }
    return [...seen].sort();
  }

  it('exposes exactly the reviewed OT, history and evidence routes', () => {
    const routes = appRoutes().filter((route) => /\/api\/(ot|history)/.test(route));
    expect(routes).toEqual(
      [
        'GET /api/history',
        'GET /api/ot/evidence.csv',
        'GET /api/ot/ledger',
        'GET /api/ot/leave',
        'GET /api/ot/summary',
        'POST /api/ot/leave',
        'POST /api/ot/leave/:id/cancel',
        'POST /api/ot/leave/:id/consume',
        'POST /api/ot/leave/:id/reverse',
      ].sort(),
    );
  });

  it('has no state-changing route outside the reviewed allowlist and none that names a posting', () => {
    const mutating = appRoutes().filter((route) => !route.startsWith('GET '));
    expect(mutating).toEqual(
      [
        'DELETE /api/sessions/:id',
        // Account administration only (WP2-T07); reviewed in isolation.test.ts.
        'PATCH /api/admin/users/:id',
        'POST /api/admin/users',
        'POST /api/admin/users/:id/deactivate',
        'POST /api/admin/users/:id/reactivate',
        // Company calendar administration (WP2-T08): preview writes nothing, commit needs its hash.
        'POST /api/admin/calendar/import/commit',
        'POST /api/admin/calendar/import/preview',
        'POST /api/admin/payroll-exceptions',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/clock/in',
        'POST /api/clock/out',
        'POST /api/days/:workDate/sessions',
        'POST /api/days/batch',
        'POST /api/ot/leave',
        'POST /api/ot/leave/:id/cancel',
        'POST /api/ot/leave/:id/consume',
        'POST /api/ot/leave/:id/reverse',
        'POST /api/policies',
        // Dry run: validates like POST /api/policies but writes nothing (WP2-T06).
        'POST /api/policies/preview',
        // Personal submission settings (WP3-T03): append-only versions and audited image authorization; the preview writes nothing; none posts a ledger entry.
        'POST /api/settings/submission',
        'POST /api/settings/submission/auto-image/authorize',
        'POST /api/settings/submission/auto-image/revoke',
        'POST /api/settings/submission/preview',
        // Raw PNG/JPEG signature upload (WP3-T02): stores a private image, posts nothing.
        'POST /api/signatures',
        // Manual sign-off finalization (WP3-T05): posts only through the ledger service inside its transaction.
        'POST /api/timesheets/:payrollDate/signoff',
        // Correction revisions, late review and same-revision resend (WP3-T06): they post only differences or nothing, and only through the ledger service.
        'POST /api/revisions/:id/resend',
        'POST /api/timesheets/:payrollDate/late-review',
        'POST /api/timesheets/:payrollDate/revisions',
        'PUT /api/days/:workDate',
        'PUT /api/sessions/:id',
      ].sort(),
    );
    for (const route of appRoutes()) {
      const path = route.slice(route.indexOf(' ') + 1);
      expect(path, route).not.toMatch(/credit|debit|correction|adjust|posting/i);
    }
    const ledgerRoutes = appRoutes().filter((route) => route.includes('/ot/ledger'));
    expect(ledgerRoutes).toEqual(['GET /api/ot/ledger']);
  });

  it('never imports a ledger posting function into an HTTP router', () => {
    const dir = join(import.meta.dirname, '../../src/server/routes');
    const files = readdirSync(dir).filter((name) => name.endsWith('.ts'));
    expect(files).toEqual(expect.arrayContaining(['ot.ts', 'history.ts']));
    for (const name of files) {
      const source = readFileSync(join(dir, name), 'utf8');
      expect(source, name).not.toMatch(/\b(postCredit|postCorrection|postDeficitDebit)\b/);
    }
    // The leave router may only call the reviewed owner-scoped lifecycle functions.
    const ot = readFileSync(join(dir, 'ot.ts'), 'utf8');
    expect(ot).toMatch(/reserveOtLeave/);
    expect(ot).not.toMatch(/INSERT\s+INTO\s+ot_ledger/i);
  });
});
