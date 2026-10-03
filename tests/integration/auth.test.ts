import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from '../support/testApp.ts';

let t: TestContext;

beforeEach(async () => {
  t = await createTestContext();
});

afterEach(() => t.close());

/** Every implemented endpoint behind authentication. */
const PROTECTED: Array<[string, string, unknown?]> = [
  ['GET', '/api/auth/me'],
  ['POST', '/api/auth/logout', {}],
  ['GET', '/api/calendar'],
  ['GET', '/api/periods/current'],
  ['GET', '/api/periods?from=2026-09-01&to=2026-10-31'],
  ['GET', '/api/timesheets/2026-10-02'],
  ['GET', '/api/days/2026-09-21'],
  ['PUT', '/api/days/2026-09-21', { category: 'Worked', leave_minutes: 0, wfh: false, notes: '' }],
  ['POST', '/api/days/2026-09-21/sessions', {}],
  ['GET', '/api/sessions/any-id'],
  ['PUT', '/api/sessions/any-id', {}],
  ['DELETE', '/api/sessions/any-id', { expected_version: 1 }],
  ['POST', '/api/clock/in', { input_zone: 'America/Los_Angeles' }],
  ['POST', '/api/clock/out', { breaks: [], breaks_confirmed: true, expected_version: 1 }],
  ['GET', '/api/policies'],
  ['POST', '/api/policies', {}],
];

describe('local login and server sessions (FR-01)', () => {
  it('signs in with an HttpOnly SameSite=Strict cookie and never returns secrets', async () => {
    const response = await t.request('POST', '/api/auth/login', {
      body: { email: 'EMPLOYEE@example.invalid ', password: 'wrong-password-xyz' },
    });
    expect(response.status).toBe(401);
    const success = await t.loginResponse('employee');
    expect(success.status).toBe(200);
    const setCookie = success.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/^ts_session=[A-Za-z0-9_-]{43};/);
    expect(setCookie).toMatch(/; HttpOnly/);
    expect(setCookie).toMatch(/; SameSite=Strict/);
    expect(setCookie).toMatch(/; Path=\//);
    expect(setCookie).toMatch(/; Max-Age=43200/);
    const cookie = await t.login('employee');
    const raw = (await t.request('GET', '/api/auth/me', { cookie })).body;
    expect(raw).toEqual({
      user: { id: t.userIds.employee, email: t.emails.employee, display_name: 'Example Employee', role: 'employee' },
    });
    const login = await t.request('POST', '/api/auth/login', {
      body: { email: t.emails.admin, password: 'not-the-password' },
    });
    expect(JSON.stringify(login.body)).not.toMatch(/scrypt|password_hash/);
  });

  it('sets cookie attributes and stores only a hash of the session token', async () => {
    const cookie = await t.login('admin');
    const setCookie = (
      await t.request('POST', '/api/auth/login', { body: { email: t.emails.admin, password: 'x'.repeat(12) } })
    ).headers.get('set-cookie');
    expect(setCookie).toBeNull();
    const token = cookie.split('=')[1] ?? '';
    const stored = t.db.prepare('SELECT token_hash FROM auth_sessions WHERE user_id = ?').pluck().get(t.userIds.admin);
    expect(stored).toBe(createHash('sha256').update(token).digest('hex'));
    expect(stored).not.toBe(token);
    const hash = t.db.prepare('SELECT password_hash FROM users WHERE id = ?').pluck().get(t.userIds.admin);
    expect(String(hash)).toMatch(/^scrypt\$15\$8\$1\$/);
  });

  it('marks the cookie Secure and sends HSTS when secure cookies are configured', async () => {
    const secure = await createTestContext('2026-09-29T20:00:00Z', { cookieSecure: true });
    try {
      const response = await secure.loginResponse('admin');
      expect(response.headers.get('set-cookie')).toMatch(/; Secure/);
      expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
    } finally {
      secure.close();
    }
  });

  it('returns the same error for unknown accounts and wrong passwords', async () => {
    const unknown = await t.request('POST', '/api/auth/login', { body: { email: 'nobody@example.invalid', password: 'whatever-123456' } });
    const wrong = await t.request('POST', '/api/auth/login', { body: { email: t.emails.admin, password: 'whatever-123456' } });
    expect([unknown.status, wrong.status]).toEqual([401, 401]);
    expect(unknown.body).toEqual(wrong.body);
  });

  it('rate-limits repeated failures, including a later correct password, until the window passes', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const failed = await t.request('POST', '/api/auth/login', { body: { email: t.emails.employee, password: 'bad-password-000' } });
      expect(failed.status).toBe(401);
    }
    const blocked = await t.request('POST', '/api/auth/login', { body: { email: t.emails.employee, password: 'bad-password-000' } });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('rate_limited');
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    await expect(t.login('employee')).rejects.toThrow(/rate_limited/);
    t.clock.advanceSeconds(15 * 60);
    await expect(t.login('employee')).resolves.toMatch(/^ts_session=/);
  });

  it('revokes the server session on logout', async () => {
    const cookie = await t.login('employee');
    expect((await t.request('POST', '/api/auth/logout', { cookie })).status).toBe(200);
    expect((await t.request('GET', '/api/auth/me', { cookie })).status).toBe(401);
  });

  it('expires sessions after their lifetime', async () => {
    const cookie = await t.login('employee');
    t.clock.advanceSeconds(t.config.sessionTtlSeconds + 1);
    expect((await t.request('GET', '/api/auth/me', { cookie })).status).toBe(401);
  });

  it('blocks a deactivated user, including existing sessions', async () => {
    const cookie = await t.login('employee');
    t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id = ?").run(t.userIds.employee);
    expect((await t.request('GET', '/api/auth/me', { cookie })).status).toBe(401);
    await expect(t.login('employee')).rejects.toThrow(/invalid_credentials/);
  });

  it('requires authentication on every implemented private endpoint', async () => {
    for (const [method, path, body] of PROTECTED) {
      const response = await t.request(method, path, { body });
      expect(response.status, `${method} ${path}`).toBe(401);
      expect(response.body.error.code).toBe('unauthenticated');
    }
  });
});

describe('CSRF/origin protection and HTTP hygiene', () => {
  it('rejects state-changing requests without an allowed Origin', async () => {
    const cookie = await t.login('employee');
    const body = { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' };
    const missing = await t.request('PUT', '/api/days/2026-09-21', { cookie, body, origin: null });
    const foreign = await t.request('PUT', '/api/days/2026-09-21', { cookie, body, origin: 'https://evil.example' });
    const crossSite = await t.request('PUT', '/api/days/2026-09-21', {
      cookie,
      body,
      headers: { 'sec-fetch-site': 'cross-site' },
    });
    expect([missing.status, foreign.status, crossSite.status]).toEqual([403, 403, 403]);
    expect(missing.body.error.code).toBe('origin_rejected');
    const loginWithoutOrigin = await t.request('POST', '/api/auth/login', {
      origin: null,
      body: { email: t.emails.admin, password: 'x'.repeat(12) },
    });
    expect(loginWithoutOrigin.status).toBe(403);
  });

  it('rejects form-encoded bodies that a cross-site HTML form could send', async () => {
    const cookie = await t.login('employee');
    const response = await t.request('PUT', '/api/days/2026-09-21', {
      cookie,
      body: 'category=Vacation',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    expect(response.status).toBe(415);
  });

  it('serves a health check without personal data and private responses with no-store', async () => {
    const health = await t.request('GET', '/api/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok' });
    const cookie = await t.login('employee');
    const me = await t.request('GET', '/api/auth/me', { cookie });
    expect(me.headers.get('cache-control')).toBe('no-store');
    expect(me.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(me.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('returns JSON 404 for unknown API paths once signed in', async () => {
    const cookie = await t.login('employee');
    const response = await t.request('GET', '/api/nothing-here', { cookie });
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('not_found');
  });

  it('records login and logout in the audit trail', async () => {
    const cookie = await t.login('admin');
    await t.request('POST', '/api/auth/logout', { cookie });
    const operations = t.db
      .prepare('SELECT operation FROM audit_events WHERE actor_user_id = ? ORDER BY rowid')
      .pluck()
      .all(t.userIds.admin);
    expect(operations).toEqual(expect.arrayContaining(['auth.login', 'auth.logout']));
  });
});
