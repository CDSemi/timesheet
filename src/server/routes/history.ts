import { Hono } from 'hono';
import { requireUser } from '../http/auth.ts';
import { getHistory } from '../services/history.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** The caller's own audit trail plus policy and calendar versions (E-13). Read-only. */
export function historyRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  app.get('/', auth, (c) =>
    c.json(getHistory(deps.db, c.get('user'), { limit: c.req.query('limit'), before: c.req.query('before') })),
  );

  return app;
}
