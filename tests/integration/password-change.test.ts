import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHARED_ROUTES } from '../../src/server/routes/shares.ts';
import { createUser } from '../../src/server/services/users.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * WP5-UX4-T04, owner decision D-9 b: POST /api/auth/password, the signed-in user's own password change. Only the
 * session user (never through a share), behind the origin check; a wrong current password is 403
 * current_password_incorrect (never 401) and counts on the sign-in limiter per user and client address (429 with
 * Retry-After); a new password outside 12-256 characters is 422 weak_password and an unchanged one 422
 * password_unchanged. The new hash, the revocation of the user's other sessions (this one is kept) and the audit event
 * auth.password_change (no secret) are one transaction. Every account and password here is synthetic (example.invalid).
 */

const PASSWORD_PATH = '/api/auth/password';

interface Person {
  id: string;
  email: string;
  password: string;
}

let t: TestContext;
let person: Person;

/** A fresh synthetic password of the given length. */
function syntheticPassword(length = 24): string {
  return randomBytes(length).toString('base64url').slice(0, length);
}

async function newPerson(email: string): Promise<Person> {
  const password = syntheticPassword();
  const id = await createUser(t.db, t.clock, { email, displayName: 'Synthetic Password Person', role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  return { id, email, password };
}

async function signIn(email: string, password: string): Promise<string> {
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (cookie === undefined) throw new Error('No session cookie');
  return cookie;
}

function change(cookie: string | undefined, currentPassword: string, newPassword: string, origin?: string | null) {
  return t.request('POST', PASSWORD_PATH, {
    ...(cookie === undefined ? {} : { cookie }),
    ...(origin === undefined ? {} : { origin }),
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

const storedHash = (id: string) => t.db.prepare('SELECT password_hash FROM users WHERE id = ?').pluck().get(id) as string;
const passwordAudits = () => t.db.prepare("SELECT * FROM audit_events WHERE operation = 'auth.password_change' ORDER BY rowid").all() as Array<Record<string, unknown>>;
const me = (cookie: string) => t.request('GET', '/api/auth/me', { cookie });

beforeEach(async () => {
  t = await createTestContext('2026-10-20T20:00:00Z');
  person = await newPerson('password-person@example.invalid');
});

afterEach(() => {
  vi.restoreAllMocks();
  t.close();
});

describe('POST /api/auth/password (D-9 b)', () => {
  it('changes the password, keeps this session, revokes the other sessions and audits without a secret', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) => vi.spyOn(console, method).mockImplementation(() => undefined));
    const here = await signIn(person.email, person.password);
    const phone = await signIn(person.email, person.password);
    const laptop = await signIn(person.email, person.password);
    const someoneElse = await t.login('employee');
    const oldHash = storedHash(person.id);
    const next = syntheticPassword(20);

    const response = await change(here, person.password, next);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toEqual({ changed: true, sessions_revoked: 2 });
    expect(storedHash(person.id)).not.toBe(oldHash);

    // This session stays signed in; the other two are revoked; another user's session is untouched.
    expect((await me(here)).status).toBe(200);
    expect((await me(phone)).status).toBe(401);
    expect((await me(laptop)).status).toBe(401);
    expect((await me(someoneElse)).status).toBe(200);
    // The old password no longer signs in; the new one does.
    expect((await t.request('POST', '/api/auth/login', { body: { email: person.email, password: person.password } })).status).toBe(401);
    await signIn(person.email, next);

    const audits = passwordAudits();
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ actor_user_id: person.id, owner_user_id: person.id, entity_type: 'user', entity_id: person.id, before_json: null });
    expect(JSON.parse(String(audits[0]?.after_json))).toEqual({ sessions_revoked: 2 });

    // No password and no hash in the response, the audit trail or any log line.
    const newHash = storedHash(person.id);
    const audit = JSON.stringify(t.db.prepare('SELECT * FROM audit_events').all());
    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    const replied = JSON.stringify(response.body) + [...response.headers.entries()].join('\n');
    for (const secret of [person.password, next, oldHash, newHash, oldHash.split('$')[5] ?? oldHash, newHash.split('$')[5] ?? newHash]) {
      expect(audit).not.toContain(secret);
      expect(logged).not.toContain(secret);
      expect(replied).not.toContain(secret);
    }
  });

  it('answers 403 current_password_incorrect (never 401) for a wrong current password, then 429 with Retry-After', async () => {
    const here = await signIn(person.email, person.password);
    const oldHash = storedHash(person.id);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const wrong = await change(here, `wrong-${syntheticPassword(16)}`, syntheticPassword(20));
      expect(wrong.status, `attempt ${attempt}`).toBe(403);
      expect(wrong.body.error.code).toBe('current_password_incorrect');
    }
    // The session is still valid: a wrong current password is not a lost session.
    expect((await me(here)).status).toBe(200);
    const limited = await change(here, person.password, syntheticPassword(20));
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('rate_limited');
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(storedHash(person.id)).toBe(oldHash);
    expect(passwordAudits()).toHaveLength(0);

    // The limiter key is this user (per client address): another person at the same address is not limited, and the
    // limited person can still sign in (a separate account key).
    const other = await newPerson('password-other@example.invalid');
    const otherCookie = await signIn(other.email, other.password);
    expect((await change(otherCookie, other.password, syntheticPassword(20))).status).toBe(200);
    await signIn(person.email, person.password);

    // After the window the limited person can change the password again.
    t.clock.advanceSeconds(15 * 60);
    expect((await change(here, person.password, syntheticPassword(20))).status).toBe(200);
  });

  it('answers 422 weak_password outside 12-256 characters and 422 password_unchanged for the same password, changing nothing', async () => {
    const here = await signIn(person.email, person.password);
    const other = await signIn(person.email, person.password);
    const oldHash = storedHash(person.id);
    const short = await change(here, person.password, syntheticPassword(11));
    expect(short.status).toBe(422);
    expect(short.body.error.code).toBe('weak_password');
    const empty = await change(here, person.password, '');
    expect(empty.body.error.code).toBe('weak_password');
    // Over 256 characters the request contract itself refuses it (zod, max 256).
    const long = await change(here, person.password, 'x'.repeat(257));
    expect(long.status).toBe(422);
    const same = await change(here, person.password, person.password);
    expect(same.status).toBe(422);
    expect(same.body.error.code).toBe('password_unchanged');
    expect(storedHash(person.id)).toBe(oldHash);
    expect(passwordAudits()).toHaveLength(0);
    expect((await me(other)).status).toBe(200);
    // Exactly 12 and exactly 256 characters are accepted.
    const twelve = syntheticPassword(12);
    expect((await change(here, person.password, twelve)).status).toBe(200);
    expect((await change(here, twelve, 'p'.repeat(256))).status).toBe(200);
  });

  it('treats a canonically equal new password as unchanged', async () => {
    const composed = 'Synthetic-café-passphrase';
    const decomposed = 'Synthetic-café-passphrase';
    const id = await createUser(t.db, t.clock, { email: 'unicode@example.invalid', displayName: 'Synthetic Unicode', role: 'employee', password: composed, calendarId: t.calendarId }, t.userIds.admin);
    const cookie = await signIn('unicode@example.invalid', composed);
    const response = await change(cookie, composed, decomposed);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('password_unchanged');
    expect(passwordAudits().filter((row) => row.owner_user_id === id)).toHaveLength(0);
  });

  it('answers 401 without a session and 403 for a foreign origin, changing nothing', async () => {
    const here = await signIn(person.email, person.password);
    const oldHash = storedHash(person.id);
    const anonymous = await change(undefined, person.password, syntheticPassword(20));
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe('unauthenticated');
    const foreign = await change(here, person.password, syntheticPassword(20), 'https://attacker.example.invalid');
    expect(foreign.status).toBe(403);
    expect(foreign.body.error.code).toBe('origin_rejected');
    const missing = await change(here, person.password, syntheticPassword(20), null);
    expect(missing.status).toBe(403);
    // Unknown fields such as a user id are refused: the account is always the session's.
    const named = await t.request('POST', PASSWORD_PATH, {
      cookie: here,
      body: { current_password: person.password, new_password: syntheticPassword(20), user_id: t.userIds.employee },
    });
    expect(named.status).toBe(422);
    expect(storedHash(person.id)).toBe(oldHash);
    expect(passwordAudits()).toHaveLength(0);
  });

  it('is never reachable through a share: no shared route, and the shared mount answers 404', async () => {
    expect(SHARED_ROUTES.some((route) => route.path.includes('password') || route.path.includes('auth'))).toBe(false);
    const owner = await t.login('employee');
    expect((await t.request('POST', '/api/shares', { cookie: owner, body: { grantee_email: person.email, items: { timesheets: 'edit', ot_read: true, pdf_download: true } } })).status).toBe(201);
    const grantee = await signIn(person.email, person.password);
    const ownerHash = storedHash(t.userIds.employee);
    for (const path of [`/api/shared/${t.userIds.employee}/auth/password`, `/api/shared/${t.userIds.employee}/password`]) {
      const response = await t.request('POST', path, { cookie: grantee, body: { current_password: person.password, new_password: syntheticPassword(20) } });
      expect(response.status, path).toBe(404);
    }
    expect(storedHash(t.userIds.employee)).toBe(ownerHash);
    expect(passwordAudits()).toHaveLength(0);
  });
});
