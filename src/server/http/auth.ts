import { AsyncLocalStorage } from 'node:async_hooks';
import type { Context, MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { findSessionUser, SESSION_COOKIE, type SessionUser } from '../auth/sessions.ts';
import type { Db } from '../db/database.ts';
import { grantScope, noShare, requireShareAccess, resolveActiveShare, type ShareAccess, shareAllows } from '../services/shares.ts';
import type { UserAccount } from '../services/users.ts';
import type { AppDeps, AppEnv } from '../types.ts';
import { ApiError } from './errors.ts';

function sessionUser(deps: AppDeps, c: Context<AppEnv>): SessionUser {
  const token = getCookie(c, SESSION_COOKIE);
  const user = token === undefined ? null : findSessionUser(deps.db, deps.clock, token);
  if (user === null) throw new ApiError(401, 'unauthenticated', 'Sign in required');
  return user;
}

/**
 * Resolves the signed-in user from the session cookie; nothing else identifies a caller. On the
 * personal routes the session user is also the actor and the subject: everybody acts on their own
 * timesheet there. Shared access to another owner's timesheet exists only under /api/shared
 * (`requireShare`).
 */
export function requireUser(deps: AppDeps) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = sessionUser(deps, c);
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

/** The owner whose shared timesheet a request concerns, built from the owner's account, never from the session. */
function ownerPrincipal(owner: UserAccount): SessionUser {
  return {
    id: owner.id,
    email: owner.email,
    displayName: owner.display_name,
    role: owner.role,
    calendarId: owner.calendar_id,
    // The owner has no session in this request; nothing on a shared route reads it.
    sessionId: 'shared-access',
  };
}

interface ShareScope {
  ownerUserId: string;
  granteeUserId: string;
  access: ShareAccess;
}

/** The share a shared request was admitted under, for the re-check inside its write transactions. */
const shareScope = new AsyncLocalStorage<ShareScope>();

/**
 * Guard of one route under /api/shared/:ownerId (FR-17, AC-16). The session user is the actor
 * (the grantee); the subject is the owner named in the path. The share is resolved live from the
 * database on every request and both accounts must be active: no share, a revoked share, an
 * inactive account or a wrong owner is 404 (nothing reveals whether the owner exists); a share
 * without the route's item is 403 `grant_scope`. The request then runs inside a share scope, so
 * every transaction it opens through `shareCheckedDb` re-checks the same share first.
 */
export function requireShare(deps: AppDeps, access: ShareAccess) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = sessionUser(deps, c);
    const share = resolveActiveShare(deps.db, c.req.param('ownerId') ?? '', user.id);
    if (share === null) throw noShare();
    if (!shareAllows(share.items, access)) throw grantScope();
    c.set('user', user);
    c.set('actor', user);
    c.set('subject', ownerPrincipal(share.owner));
    await shareScope.run({ ownerUserId: share.owner.id, granteeUserId: user.id, access }, next);
  });
}

function recheckShare(db: Db): void {
  const scope = shareScope.getStore();
  // Fail closed: this database is only handed to routers behind `requireShare`.
  if (scope === undefined) throw new Error('A shared request opened a transaction outside its share guard');
  requireShareAccess(db, scope.ownerUserId, scope.granteeUserId, scope.access);
}

/**
 * The database as seen by the routers mounted under /api/shared: identical, except that every
 * transaction first re-checks the request's share inside the same transaction (the revocation
 * race: a share revoked, reduced or suspended after the guard admitted the request refuses the
 * write before anything is written, and the whole transaction rolls back).
 */
export function shareCheckedDb(db: Db): Db {
  const transaction = <F extends Parameters<Db['transaction']>[0]>(work: F) =>
    db.transaction(((...params: Parameters<F>) => {
      recheckShare(db);
      return work(...params);
    }) as F);
  return new Proxy(db, {
    get(target, property) {
      if (property === 'transaction') return transaction;
      const value: unknown = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

/**
 * Administrator-only routes (account administration). The role is read live from the
 * database with the session, so a demotion or deactivation applies immediately. The admin
 * role is not blanket access: private timesheet data stays owner-only on its own routes, and an
 * administrator reaches another person's timesheet only through that person's share.
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
