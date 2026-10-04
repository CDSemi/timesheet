import { Hono } from 'hono';
import { requireUser } from '../http/auth.ts';
import { buildReviewPayload, reviewPayloadJson } from '../services/reviewPayload.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/**
 * Review and submission routes. This task has the read side only: the review payload is a
 * GET that writes nothing (no row, no audit event). Every handler derives the owner from
 * the session; no route accepts a user id, and an administrator has no access to another
 * user's payload. The sign-off (POST) arrives with the finalization task.
 */
export function submissionRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  app.get('/timesheets/:payrollDate/review', auth, (c) =>
    c.json(reviewPayloadJson(buildReviewPayload(deps.db, deps.clock, c.get('user'), c.req.param('payrollDate')))),
  );

  return app;
}
