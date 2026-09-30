import { getConnInfo } from '@hono/node-server/conninfo';
import { type Context, Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { verifyAgainstDummy, verifyPassword } from '../auth/passwords.ts';
import { createAuthSession, revokeAuthSession, SESSION_COOKIE, type SessionUser } from '../auth/sessions.ts';
import { nowEpoch } from '../clock.ts';
import { requireUser } from '../http/auth.ts';
import { ApiError } from '../http/errors.ts';
import { loginBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { recordAudit } from '../services/audit.ts';
import { findUserByEmail, normalizeEmail } from '../services/users.ts';
import type { AppDeps, AppEnv } from '../types.ts';

function clientAddress(c: Context): string {
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    // No socket (e.g. in-process tests). Proxy headers are never trusted as identity.
    return 'unknown';
  }
}

export function userJson(user: Pick<SessionUser, 'id' | 'email' | 'displayName' | 'role'>) {
  return { id: user.id, email: user.email, display_name: user.displayName, role: user.role };
}

export function authRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();

  app.post('/login', async (c) => {
    const body = await readJson(c, loginBody);
    const address = clientAddress(c);
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
