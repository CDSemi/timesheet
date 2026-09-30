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
