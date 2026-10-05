import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { findSessionUser, SESSION_COOKIE } from '../auth/sessions.ts';
import type { AppDeps, AppEnv } from '../types.ts';
import { ApiError } from './errors.ts';

/**
 * Resolves the signed-in user from the session cookie; nothing else identifies a caller. The
 * session user is also the actor and the subject: there is no grant yet, so everybody acts on
 * their own timesheet only.
 */
export function requireUser(deps: AppDeps) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    const user = token === undefined ? null : findSessionUser(deps.db, deps.clock, token);
    if (user === null) throw new ApiError(401, 'unauthenticated', 'Sign in required');
    c.set('user', user);
    c.set('actor', user);
    c.set('subject', user);
    await next();
  });
}

/**
 * Options of a personal router factory. `access` is the guard applied to every route of the
 * router; it must set `actor` and `subject` in the context. The default is `requireUser`, which
 * sets both to the session user. A router never decides who the subject is.
 */
export interface PersonalRouterOptions {
  access?: MiddlewareHandler<AppEnv>;
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
