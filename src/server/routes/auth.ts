import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import {
  hashPassword,
  isAcceptablePassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  verifyAgainstDummy,
  verifyPassword,
} from '../auth/passwords.ts';
import { createAuthSession, revokeAuthSession, revokeOtherAuthSessions, SESSION_COOKIE, type SessionUser } from '../auth/sessions.ts';
import { nowEpoch, nowUtc } from '../clock.ts';
import { requireUser } from '../http/auth.ts';
import { resolveClientAddress } from '../http/clientAddress.ts';
import { ApiError } from '../http/errors.ts';
import { bootstrapBody, loginBody, passwordChangeBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { recordAudit } from '../services/audit.ts';
import { completeSetup, setupAvailable } from '../services/bootstrap.ts';
import { findUserByEmail, normalizeEmail } from '../services/users.ts';
import type { AppDeps, AppEnv } from '../types.ts';

export function userJson(user: Pick<SessionUser, 'id' | 'email' | 'displayName' | 'role'>) {
  return { id: user.id, email: user.email, display_name: user.displayName, role: user.role };
}

/** The limiter account of every setup attempt (not an email, so an address cannot be varied around the limit). */
const SETUP_LIMIT_KEY = 'setup:first-administrator';

/** The prefix of every sign-in limiter account: a typed email is never read as a `password:` or `setup:` key of the same limiter. */
const SIGN_IN_LIMIT_PREFIX = 'login:';

/** 403, never 401: the session is valid, only the typed current password is not (the client keeps the user signed in). */
const currentPasswordIncorrect = (): ApiError => new ApiError(403, 'current_password_incorrect', 'The current password is not correct');

export function authRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();

  app.post('/login', async (c) => {
    const body = await readJson(c, loginBody);
    const address = resolveClientAddress(c, deps.config.trustedProxyAddresses ?? []);
    const email = normalizeEmail(body.email);
    // The limiter's account part for sign-in. The prefix keeps the typed text out of the other key spaces of the same
    // limiter (`password:<user id>` of the password change, `setup:...`): no sign-in input can address their buckets.
    const account = `${SIGN_IN_LIMIT_PREFIX}${email}`;
    const now = nowEpoch(deps.clock);
    const decision = deps.loginLimiter.check(address, account, now);
    if (!decision.allowed) {
      c.header('Retry-After', String(decision.retryAfterSeconds));
      throw new ApiError(429, 'rate_limited', 'Too many failed sign-in attempts; try again later');
    }
    const user = findUserByEmail(deps.db, email);
    const valid =
      user === undefined ? await verifyAgainstDummy(body.password) : await verifyPassword(body.password, user.password_hash);
    if (user === undefined || !valid || user.status !== 'active') {
      deps.loginLimiter.recordFailure(address, account, now);
      throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect');
    }
    deps.loginLimiter.recordSuccess(address, account);
    const session = deps.db
      .transaction(() => {
        const created = createAuthSession(deps.db, deps.clock, user.id, deps.config.sessionTtlSeconds);
        recordAudit(deps.db, deps.clock, {
          actorUserId: user.id,
          ownerUserId: user.id,
          operation: 'auth.login',
          entityType: 'user',
          entityId: user.id,
        });
        return created;
      })
      .immediate();
    setCookie(c, SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: deps.config.cookieSecure,
      sameSite: 'Strict',
      path: '/',
      maxAge: deps.config.sessionTtlSeconds,
    });
    return c.json({ user: userJson({ id: user.id, email: user.email, displayName: user.display_name, role: user.role }) });
  });

  // Whether the Setup screen is on offer: the instance was configured by the CLI and has no administrator yet.
  // A read only: it never consumes, shows or hints at the setup token, and says nothing about its expiry.
  app.get('/setup', (c) => c.json({ available: setupAvailable(deps.db) }));

  // The first administrator (WP4-T03). Every refusal is one and the same 403 (see services/bootstrap.ts), failures
  // count against the same limiter as sign-in, and the token travels only in this body: never a URL, never logged.
  app.post('/bootstrap', async (c) => {
    const body = await readJson(c, bootstrapBody);
    const address = resolveClientAddress(c, deps.config.trustedProxyAddresses ?? []);
    const now = nowEpoch(deps.clock);
    const decision = deps.loginLimiter.check(address, SETUP_LIMIT_KEY, now);
    if (!decision.allowed) {
      c.header('Retry-After', String(decision.retryAfterSeconds));
      throw new ApiError(429, 'rate_limited', 'Too many failed setup attempts; try again later');
    }
    try {
      const user = await completeSetup(deps.db, deps.clock, {
        token: body.token,
        email: body.email,
        displayName: body.display_name,
        password: body.password,
      });
      deps.loginLimiter.recordSuccess(address, SETUP_LIMIT_KEY);
      return c.json({ user: userJson(user) }, 201);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'setup_unavailable') deps.loginLimiter.recordFailure(address, SETUP_LIMIT_KEY, now);
      throw error;
    }
  });

  app.post('/logout', requireUser(deps), (c) => {
    const user = c.get('user');
    deps.db
      .transaction(() => {
        revokeAuthSession(deps.db, deps.clock, user.sessionId);
        recordAudit(deps.db, deps.clock, {
          actorUserId: user.id,
          ownerUserId: user.id,
          operation: 'auth.logout',
          entityType: 'user',
          entityId: user.id,
        });
      })
      .immediate();
    deleteCookie(c, SESSION_COOKIE, { path: '/', secure: deps.config.cookieSecure });
    return c.json({ signed_out: true });
  });

  app.get('/me', requireUser(deps), (c) => c.json({ user: userJson(c.get('user')) }));

  /*
   * The signed-in user's own password change (D-9 b). Only the session user, never through a share (this router is not
   * in SHARED_ROUTES) and behind the same origin check as every write. A wrong current password is 403, not 401 (the
   * session stays valid), and counts on the sign-in limiter under `password:<user id>` per client address; sign-in keys carry
   * the `login:` prefix, so no sign-in input can address this bucket (F-UX4B-1), and the per-address bucket stays shared. The new
   * hash, the revocation of every other session of the user and the audit event (no secret) are one transaction;
   * this session stays signed in. The administrator's temporary password (E-11) is a separate path and is unchanged.
   */
  app.post('/password', requireUser(deps), async (c) => {
    const user = c.get('user');
    const body = await readJson(c, passwordChangeBody);
    const address = resolveClientAddress(c, deps.config.trustedProxyAddresses ?? []);
    const limitKey = `password:${user.id}`;
    const now = nowEpoch(deps.clock);
    const decision = deps.loginLimiter.check(address, limitKey, now);
    if (!decision.allowed) {
      c.header('Retry-After', String(decision.retryAfterSeconds));
      throw new ApiError(429, 'rate_limited', 'Too many wrong current passwords; try again later');
    }
    const storedHash = deps.db.prepare("SELECT password_hash FROM users WHERE id = ? AND status = 'active'").pluck().get(user.id) as
      | string
      | undefined;
    if (storedHash === undefined || !(await verifyPassword(body.current_password, storedHash))) {
      deps.loginLimiter.recordFailure(address, limitKey, now);
      throw currentPasswordIncorrect();
    }
    deps.loginLimiter.recordSuccess(address, limitKey);
    if (!isAcceptablePassword(body.new_password)) {
      throw new ApiError(422, 'weak_password', `Passwords must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters`);
    }
    // The same normalization as the hash, so a new password that would hash like the current one counts as unchanged.
    if (body.new_password.normalize('NFKC') === body.current_password.normalize('NFKC')) {
      throw new ApiError(422, 'password_unchanged', 'The new password must differ from the current one');
    }
    const newHash = await hashPassword(body.new_password);
    const sessionsRevoked = deps.db
      .transaction(() => {
        // Conditional on the hash just verified: a password changed meanwhile makes the current one wrong.
        const updated = deps.db
          .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND password_hash = ? AND status = 'active'")
          .run(newHash, nowUtc(deps.clock), user.id, storedHash);
        if (updated.changes !== 1) throw currentPasswordIncorrect();
        const revoked = revokeOtherAuthSessions(deps.db, deps.clock, user.id, user.sessionId);
        recordAudit(deps.db, deps.clock, {
          actorUserId: user.id,
          ownerUserId: user.id,
          operation: 'auth.password_change',
          entityType: 'user',
          entityId: user.id,
          after: { sessions_revoked: revoked },
        });
        return revoked;
      })
      .immediate();
    return c.json({ changed: true, sessions_revoked: sessionsRevoked });
  });

  return app;
}
