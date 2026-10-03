import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { findSessionUser, SESSION_COOKIE } from '../auth/sessions.ts';
import type { AppDeps, AppEnv } from '../types.ts';
import { ApiError } from './errors.ts';

/** Resolves the signed-in user from the session cookie; nothing else identifies a caller. */
export function requireUser(deps: AppDeps) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    const user = token === undefined ? null : findSessionUser(deps.db, deps.clock, token);
    if (user === null) throw new ApiError(401, 'unauthenticated', 'Sign in required');
    c.set('user', user);
    await next();
  });
}

/**
 * Administrator-only routes (account administration). The role is read live from the
 * database with the session, so a demotion or deactivation applies immediately. The admin
 * role is not blanket access: private timesheet data stays owner-only on its own routes.
 */
export function requireAdmin(deps: AppDeps) {
  const authenticate = requireUser(deps);
  return createMiddleware<AppEnv>(async (c, next) => {
    await authenticate(c, async () => {
      if (c.get('user').role !== 'admin') throw new ApiError(403, 'forbidden', 'Administrator access required');
      await next();
    });
  });
}
