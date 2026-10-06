import { Hono } from 'hono';
import { z } from 'zod';
import { LoginRateLimiter } from '../auth/rateLimit.ts';
import { nowEpoch } from '../clock.ts';
import type { FileStore } from '../files/fileStore.ts';
import { requireShare, requireUser, shareCheckedDb } from '../http/auth.ts';
import { ApiError } from '../http/errors.ts';
import { normalizeReason, readJson } from '../http/validation.ts';
import {
  changeShare,
  grantShare,
  listGivenShares,
  listReceivedShares,
  recordSharedPdfDownload,
  revokeOwnShare,
  type ShareAccess,
  type ShareItems,
} from '../services/shares.ts';
import type { AppDeps, AppEnv } from '../types.ts';
import { apiRoutes } from './api.ts';
import { otRoutes } from './ot.ts';
import { submissionRoutes } from './submission.ts';

/* ---- The caller's own shares: /api/shares ------------------------------------------------------ */

const itemsBody = z.strictObject({
  timesheets: z.enum(['none', 'view', 'edit']),
  ot_read: z.boolean(),
  pdf_download: z.boolean(),
});
const grantBody = z.strictObject({ grantee_email: z.string().max(320), items: itemsBody });
const changeBody = z.strictObject({ items: itemsBody });
/** Revocation by the owner, the grantee leaving, or an administrator: an optional reason only. */
export const shareRevokeBody = z.strictObject({ reason: z.string().max(500).optional() });

function itemsOf(body: z.infer<typeof itemsBody>): ShareItems {
  return { timesheets: body.timesheets, otRead: body.ot_read, pdfDownload: body.pdf_download };
}

/** Failed grantee lookups (unknown or inactive address) allowed per account and window. */
export const GRANTEE_LOOKUP_LIMITS = { windowSeconds: 15 * 60, maxFailuresPerAccount: 10, maxFailuresPerAddress: 10 };
const GRANT_BUCKET = 'share-grant';

/**
 * The signed-in user's shares (FR-17). Everything here acts on the caller's own timesheets: a grant
 * or change always has the caller as owner, so a grantee can never pass on another owner's share.
 * The owner lists given shares, grants by exact account email, changes items and revokes; the
 * grantee lists received shares and may leave one. Repeated `grantee_not_found` answers are
 * rate-limited per account, so the form cannot be used to probe addresses.
 */
export function sharesRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);
  const limiter = new LoginRateLimiter(GRANTEE_LOOKUP_LIMITS);

  app.get('/', auth, (c) => {
    const me = c.get('user');
    return c.json({ given: listGivenShares(deps.db, me.id), received: listReceivedShares(deps.db, me.id) });
  });

  app.post('/', auth, async (c) => {
    const me = c.get('user');
    const body = await readJson(c, grantBody);
    const now = nowEpoch(deps.clock);
    const decision = limiter.check(me.id, GRANT_BUCKET, now);
    if (!decision.allowed) {
      c.header('Retry-After', String(decision.retryAfterSeconds));
      throw new ApiError(429, 'rate_limited', 'Too many addresses without an account; try again later');
    }
    try {
      const share = grantShare(deps.db, deps.clock, { ownerUserId: me.id, granteeEmail: body.grantee_email, items: itemsOf(body.items) });
      return c.json({ share }, 201);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'grantee_not_found') limiter.recordFailure(me.id, GRANT_BUCKET, now);
      throw error;
    }
  });

  app.put('/:id', auth, async (c) => {
    const body = await readJson(c, changeBody);
    return c.json(changeShare(deps.db, deps.clock, { ownerUserId: c.get('user').id, shareId: c.req.param('id'), items: itemsOf(body.items) }));
  });

  app.post('/:id/revoke', auth, async (c) => {
    const body = await readJson(c, shareRevokeBody);
    const revoked = revokeOwnShare(deps.db, deps.clock, {
      actorUserId: c.get('user').id,
      shareId: c.req.param('id'),
      reason: normalizeReason(body.reason),
    });
    return c.json({ revoked });
  });

  return app;
}

/* ---- Delegated access: /api/shared/:ownerId ---------------------------------------------------- */

type SharedRouter = 'api' | 'ot' | 'submission';

/**
 * The allowlist (WP3-REQ C as amended by WP3-REQ2 item 4): every route a share can ever reach, the
 * personal router it comes from and the share item it needs. Paths are relative to the router;
 * the OT router is mounted under /ot. Nothing else is mounted under /api/shared: Clock in/out,
 * policy changes, review, sign-off, corrections, late review, finalization detail, resend,
 * deliveries and their decisions, submission settings, auto-image, signatures, leave requests,
 * the evidence export, history and the shares API itself stay owner-only.
 */
export const SHARED_ROUTES: ReadonlyArray<{ router: SharedRouter; method: string; path: string; access: ShareAccess }> = [
  { router: 'api', method: 'GET', path: '/calendar', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/periods/current', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/periods', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/timesheets/:payrollDate', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/days/:workDate', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/sessions/:id', access: 'timesheets_view' },
  { router: 'api', method: 'GET', path: '/policies', access: 'timesheets_view' },
  // Manual edits only (F-Q5 (a)): never Clock in/out for the owner.
  { router: 'api', method: 'PUT', path: '/days/:workDate', access: 'timesheets_edit' },
  { router: 'api', method: 'POST', path: '/days/:workDate/sessions', access: 'timesheets_edit' },
  { router: 'api', method: 'PUT', path: '/sessions/:id', access: 'timesheets_edit' },
  { router: 'api', method: 'DELETE', path: '/sessions/:id', access: 'timesheets_edit' },
  { router: 'api', method: 'POST', path: '/days/batch', access: 'timesheets_edit' },
  // Read-only OT (F-Q4 (b)); leave requests and the evidence export are never shared.
  { router: 'ot', method: 'GET', path: '/summary', access: 'ot_read' },
  { router: 'ot', method: 'GET', path: '/ledger', access: 'ot_read' },
  { router: 'submission', method: 'GET', path: '/revisions/pending-lines', access: 'ot_read' },
  { router: 'submission', method: 'GET', path: '/revisions', access: 'revision_list' },
  // Final PDFs (F-Q4 (b)): every grantee download is audited and re-checked before the bytes leave.
  { router: 'submission', method: 'GET', path: '/revisions/:id/pdf', access: 'pdf_download' },
];

/** A router holding only the wanted routes of `router`, each with its guard and handler, in order. */
function pick(router: Hono<AppEnv>, wanted: ReadonlyArray<{ method: string; path: string }>): Hono<AppEnv> {
  const keys = new Set(wanted.map((route) => `${route.method} ${route.path}`));
  const picked = new Hono<AppEnv>();
  const found = new Set<string>();
  for (const route of router.routes) {
    const key = `${route.method} ${route.path}`;
    if (!keys.has(key)) continue;
    picked.on(route.method, route.path, route.handler);
    found.add(key);
  }
  // Fail loudly at startup if a factory no longer registers an allowlisted route.
  const missing = [...keys].filter((key) => !found.has(key));
  if (missing.length > 0) throw new Error(`Shared routes missing from their router: ${missing.join(', ')}`);
  return picked;
}

/**
 * The routes under /api/shared/:ownerId (FR-17, AC-16): the T13A router factories built behind
 * `requireShare` with the item each route needs, reduced to the allowlist. The routers see a
 * database whose transactions re-check the share first, so a write races no revocation. The
 * existing /api routes stay self-only and unchanged.
 */
export function sharedRoutes(deps: AppDeps, files?: FileStore) {
  const checked: AppDeps = { ...deps, db: shareCheckedDb(deps.db) };
  const build: Record<SharedRouter, (access: ShareAccess) => Hono<AppEnv>> = {
    api: (access) => apiRoutes(checked, { access: requireShare(deps, access) }),
    ot: (access) => otRoutes(checked, { access: requireShare(deps, access) }),
    submission: (access) =>
      submissionRoutes(checked, {
        access: requireShare(deps, access),
        ...(files === undefined ? {} : { files }),
        beforePdfSend: (c, revision) => {
          // Hono answers a HEAD through the GET handler and discards the body. A HEAD hands over no bytes, so it
          // is not a download and writes no audit event (WP4-T02, WP3_REVIEW_C R1). The guard has already checked
          // the share and its PDF item for the request, so it still gets the same refusals as a GET.
          if (c.req.method === 'HEAD') return;
          recordSharedPdfDownload(deps.db, deps.clock, {
            ownerUserId: c.get('subject').id,
            granteeUserId: c.get('actor').id,
            revisionId: revision.id,
            payrollDate: revision.payrollDate,
            revisionNo: revision.revisionNo,
          });
        },
      }),
  };
  const app = new Hono<AppEnv>();
  const groups = new Map<string, typeof SHARED_ROUTES>();
  for (const route of SHARED_ROUTES) {
    if (route.path.endsWith('/pdf') && files === undefined) continue;
    const key = `${route.router} ${route.access}`;
    groups.set(key, [...(groups.get(key) ?? []), route]);
  }
  for (const routes of groups.values()) {
    const first = routes[0];
    if (first === undefined) continue;
    app.route(first.router === 'ot' ? '/ot' : '/', pick(build[first.router](first.access), routes));
  }
  return app;
}
