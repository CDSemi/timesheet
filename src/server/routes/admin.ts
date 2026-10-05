import { Hono } from 'hono';
import { z } from 'zod';
import { requireAdmin } from '../http/auth.ts';
import { ApiError, notFound } from '../http/errors.ts';
import {
  adminPayrollExceptionBody,
  adminUserCreateBody,
  adminUserStatusBody,
  adminUserUpdateBody,
  holidayImportCommitBody,
  holidayImportPreviewBody,
} from '../http/schemas.ts';
import { normalizeReason, readJson } from '../http/validation.ts';
import { activationJson, getAutomationActivation, setAutomationActivation } from '../services/automation.ts';
import { createPayrollException } from '../services/calendars.ts';
import { calendarVersionJson, commitHolidayImport, previewHolidayImport } from '../services/holidayImport.ts';
import {
  DEFAULT_SUBMISSION_LIMIT,
  deliverySetupOf,
  getOperationsStatus,
  listSubmissionStatus,
  MAX_SUBMISSION_LIMIT,
  operationsStatusJson,
  submissionStatusJson,
} from '../services/operationsStatus.ts';
import { adminRevokeShare, listAllShares } from '../services/shares.ts';
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

/**
 * The system activation instant (F-4, WP3-T10): a UTC instant, or null to clear it, with a
 * required reason. Strict like every request contract, so no user id or other field is accepted.
 */
const automationActivationBody = z.strictObject({
  active_from: z.string().max(40).nullable(),
  reason: z.string().max(1000),
});

/** An administrator's revocation of a sharing grant: an optional reason only. */
const shareRevokeBody = z.strictObject({ reason: z.string().max(500).optional() });

function parseSubmissionLimit(value: string | undefined): number {
  if (value === undefined) return DEFAULT_SUBMISSION_LIMIT;
  const limit = /^\d{1,4}$/.test(value) ? Number(value) : Number.NaN;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SUBMISSION_LIMIT) {
    throw new ApiError(422, 'invalid_limit', `limit must be a whole number from 1 to ${MAX_SUBMISSION_LIMIT}`);
  }
  return limit;
}

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
 *
 * Operations status (F-3, F-Q3 (b), WP3-T13D): two read-only routes backed by one service with a
 * column allowlist. The administrator sees the pipeline (sender, runner heartbeat, activation, job
 * and delivery totals; per person and period the revision, PDF and delivery states, redacted fault
 * codes and recipient addresses) and never a person's timesheet details, templates or message content.
 *
 * Calendar administration (FR-13, AC-05) is company configuration, not personal data: the
 * holiday CSV preview/commit and payroll exceptions return calendar-only fields (dates, names,
 * versions and the admin's own input) and no employee-derived count, never a user's rows.
 *
 * Sharing grants (FR-17, WP3-T13B): the administrator lists every grant (owner and grantee names,
 * items, instants) and may revoke one, audited with a reason. There is deliberately no route that
 * creates a grant or uses one: only an owner shares, and an administrator reaches another person's
 * timesheet only through that person's grant, like anyone else.
 */
export function adminRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  // Applies to every /api/admin/* path, including unknown ones: 401 anonymous, 403 employee.
  app.use('*', requireAdmin(deps));

  // Operations status: reads only; nothing here can change a record.
  app.get('/operations', (c) =>
    c.json({
      operations: operationsStatusJson(getOperationsStatus(deps.db, deps.clock, deliverySetupOf(deps.delivery))),
    }),
  );

  app.get('/submissions', (c) =>
    c.json({ submissions: submissionStatusJson(listSubmissionStatus(deps.db, { limit: parseSubmissionLimit(c.req.query('limit')) })) }),
  );

  app.get('/users', (c) => c.json({ users: listUsers(deps.db).map(accountJson) }));

  app.get('/shares', (c) => c.json({ shares: listAllShares(deps.db) }));

  app.post('/shares/:id/revoke', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, shareRevokeBody);
    const share = adminRevokeShare(deps.db, deps.clock, {
      actorUserId: actor.id,
      shareId: c.req.param('id'),
      reason: normalizeReason(body.reason),
    });
    return c.json({ share });
  });

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

  // Holiday CSV: preview writes nothing; commit needs the preview hash (E-4, AC-05, R-07).
  app.post('/calendar/import/preview', async (c) => {
    const body = await readJson(c, holidayImportPreviewBody);
    return c.json(
      previewHolidayImport(deps.db, deps.clock, {
        calendarId: body.calendar_id,
        year: body.year,
        effectiveFrom: body.effective_from,
        csv: body.csv,
        removeDates: body.remove_dates ?? [],
      }),
    );
  });

  app.post('/calendar/import/commit', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, holidayImportCommitBody);
    const result = commitHolidayImport(
      deps.db,
      deps.clock,
      {
        calendarId: body.calendar_id,
        year: body.year,
        effectiveFrom: body.effective_from,
        csv: body.csv,
        removeDates: body.remove_dates ?? [],
        previewHash: body.preview_hash,
        note: normalizeReason(body.note),
      },
      actor.id,
    );
    // An identical re-commit is a no-op: 200, nothing written.
    return c.json(
      { committed: result.committed, unchanged: !result.committed, version: calendarVersionJson(result.version), preview_hash: result.previewHash },
      result.committed ? 201 : 200,
    );
  });

  // Payroll exception with a required reason; refreshes an unfinalized stored period (E-10).
  app.post('/payroll-exceptions', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, adminPayrollExceptionBody);
    const result = createPayrollException(
      deps.db,
      deps.clock,
      {
        calendarId: body.calendar_id,
        nominalPayrollDate: body.nominal_payroll_date,
        payrollDate: body.payroll_date,
        dueLocalDate: body.due_local_date ?? null,
        dueLocalTime: body.due_local_time ?? null,
        reason: body.reason,
      },
      actor.id,
    );
    // The answer is the exception alone: whether a stored period was refreshed would reveal whether
    // anyone on the calendar has a timesheet there (WP2-A2-02).
    return c.json({ payroll_exception: result.exception }, 201);
  });

  // Automation activation (F-4): the one system-wide instant before which nothing is submitted
  // automatically. Only the instant, who recorded it and when are visible here, never a person's data.
  app.get('/automation', (c) => c.json({ automation: activationJson(getAutomationActivation(deps.db)) }));

  app.put('/automation/activation', async (c) => {
    const actor = c.get('user');
    const body = await readJson(c, automationActivationBody);
    const activation = setAutomationActivation(deps.db, deps.clock, {
      actorUserId: actor.id,
      activeFrom: body.active_from,
      reason: body.reason,
    });
    return c.json({ automation: activationJson(activation) });
  });

  return app;
}
