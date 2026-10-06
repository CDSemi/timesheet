import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { verifyAgainstDummy, verifyPassword } from '../auth/passwords.ts';
import { createAuthSession, revokeAuthSession, SESSION_COOKIE, type SessionUser } from '../auth/sessions.ts';
import { nowEpoch } from '../clock.ts';
import { requireUser } from '../http/auth.ts';
import { resolveClientAddress } from '../http/clientAddress.ts';
import { ApiError } from '../http/errors.ts';
import { bootstrapBody, loginBody } from '../http/schemas.ts';
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

export function authRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();

  app.post('/login', async (c) => {
    const body = await readJson(c, loginBody);
    const address = resolveClientAddress(c, deps.config.trustedProxyAddresses ?? []);
    const account = normalizeEmail(body.email);
    const now = nowEpoch(deps.clock);
    const decision = deps.loginLimiter.check(address, account, now);
    if (!decision.allowed) {
      c.header('Retry-After', String(decision.retryAfterSeconds));
      throw new ApiError(429, 'rate_limited', 'Too many failed sign-in attempts; try again later');
    }
    const user = findUserByEmail(deps.db, account);
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

  return app;
}
