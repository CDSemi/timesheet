import { Hono } from 'hono';
import { requireAdmin } from '../http/auth.ts';
import { notFound } from '../http/errors.ts';
import { adminUserCreateBody, adminUserStatusBody, adminUserUpdateBody } from '../http/schemas.ts';
import { normalizeReason, readJson } from '../http/validation.ts';
import {
  createUser,
  deactivateUser,
  getUserAccount,
  listUsers,
  reactivateUser,
  type UserAccount,
  updateUser,
} from '../services/users.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** Account fields only: never the password hash and never another user's private data. */
function accountJson(account: UserAccount) {
  return {
    id: account.id,
    email: account.email,
    display_name: account.display_name,
    role: account.role,
    status: account.status,
    calendar_id: account.calendar_id,
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
}

/**
 * User administration (FR-01). Every route requires an administrator and is account
 * administration only: there is deliberately no admin route that returns timesheets, the
 * OT ledger, leave, history or exports of another user (admin is not blanket access to
 * private data; a future manager role needs explicit assignment). The admin-set temporary
 * password (E-11) is hashed on creation and is never returned, logged or audited. There is
 * no password reset route: FR-01 and E-11 do not require one.
 */
export function adminRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  // Applies to every /api/admin/* path, including unknown ones: 401 anonymous, 403 employee.
  app.use('*', requireAdmin(deps));

  app.get('/users', (c) => c.json({ users: listUsers(deps.db).map(accountJson) }));

  app.post('/users', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, adminUserCreateBody);
    const id = await createUser(
      deps.db,
      deps.clock,
      {
        email: body.email,
        displayName: body.display_name,
        role: body.role,
        password: body.password,
        calendarId: body.calendar_id,
      },
      actor.id,
    );
    const account = getUserAccount(deps.db, id);
    if (account === undefined) throw notFound('User');
    return c.json({ user: accountJson(account) }, 201);
  });

  app.patch('/users/:id', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, adminUserUpdateBody);
    const account = updateUser(deps.db, deps.clock, {
      actorUserId: actor.id,
      userId: c.req.param('id'),
      ...(body.display_name === undefined ? {} : { displayName: body.display_name }),
      ...(body.role === undefined ? {} : { role: body.role }),
      ...(body.calendar_id === undefined ? {} : { calendarId: body.calendar_id }),
    });
    return c.json({ user: accountJson(account) });
  });

  app.post('/users/:id/deactivate', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, adminUserStatusBody);
    const account = deactivateUser(deps.db, deps.clock, {
      actorUserId: actor.id,
      userId: c.req.param('id'),
      reason: normalizeReason(body.reason),
    });
    return c.json({ user: accountJson(account) });
  });

  app.post('/users/:id/reactivate', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, adminUserStatusBody);
    const account = reactivateUser(deps.db, deps.clock, {
      actorUserId: actor.id,
      userId: c.req.param('id'),
      reason: normalizeReason(body.reason),
    });
    return c.json({ user: accountJson(account) });
  });

  return app;
}
