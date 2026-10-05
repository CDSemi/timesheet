import { Hono } from 'hono';
import { requireUser } from '../http/auth.ts';
import { correctionRevisionBody, lateReviewBody, resendBody, signoffBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import {
  finalizationStatusJson,
  getFinalizationStatus,
  listCurrentPendingLines,
  resendJson,
  resendRevision,
  reviseTimesheet,
  signOffJson,
  signOffTimesheet,
} from '../services/finalization.ts';
import { buildReviewPayload, reviewPayloadJson } from '../services/reviewPayload.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/**
 * Review and submission routes. Every handler derives the owner from the session; no route
 * accepts a user id, and an administrator has no access to another user's payload,
 * revision or sign-off. The review and status GETs write nothing (no row, no audit event).
 * The sign-off POST is the only writer of a first revision: one transaction that binds the
 * reviewed payload, records the real sign-off, posts through the ledger service and enqueues
 * the PDF and send jobs (services/finalization.ts). The revision, late-review and resend
 * POSTs follow the same rules for later revisions (corrections post only differences, a
 * late review posts zero delta, a resend never moves the ledger).
 */
export function submissionRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  app.get('/timesheets/:payrollDate/review', auth, (c) =>
    c.json(reviewPayloadJson(buildReviewPayload(deps.db, deps.clock, c.get('user'), c.req.param('payrollDate')))),
  );

  app.post('/timesheets/:payrollDate/signoff', auth, async (c) => {
    const body = await readJson(c, signoffBody);
    const result = signOffTimesheet({ db: deps.db, clock: deps.clock, user: c.get('user') }, c.req.param('payrollDate'), {
      expectedVersion: body.expected_version,
      reviewedHash: body.reviewed_hash,
      signerName: body.signer_name,
      deficitChoices: (body.deficit_choices ?? []).map((item) => ({ workDate: item.work_date, choice: item.choice })),
      incompleteEvidenceAcknowledged: body.incomplete_evidence_acknowledged ?? false,
    });
    return c.json(signOffJson(result), result.status === 'created' ? 201 : 200);
  });

  // A correction revision of a finalized period: a reason, a genuine sign-off, only differences posted.
  app.post('/timesheets/:payrollDate/revisions', auth, async (c) => {
    const body = await readJson(c, correctionRevisionBody);
    const result = reviseTimesheet({ db: deps.db, clock: deps.clock, user: c.get('user') }, c.req.param('payrollDate'), {
      kind: 'correction',
      reason: body.reason,
      sendEmail: body.send_email,
      expectedVersion: body.expected_version,
      reviewedHash: body.reviewed_hash,
      signerName: body.signer_name,
      deficitChoices: (body.deficit_choices ?? []).map((item) => ({ workDate: item.work_date, choice: item.choice })),
      incompleteEvidenceAcknowledged: body.incomplete_evidence_acknowledged ?? false,
    });
    return c.json(signOffJson(result), result.status === 'created' ? 201 : 200);
  });

  // The owner's late review of an automatic revision: a signed revision with zero ledger delta.
  app.post('/timesheets/:payrollDate/late-review', auth, async (c) => {
    const body = await readJson(c, lateReviewBody);
    const result = reviseTimesheet({ db: deps.db, clock: deps.clock, user: c.get('user') }, c.req.param('payrollDate'), {
      kind: 'late_review',
      reason: null,
      sendEmail: body.send_email,
      expectedVersion: body.expected_version,
      reviewedHash: body.reviewed_hash,
      signerName: body.signer_name,
      deficitChoices: (body.deficit_choices ?? []).map((item) => ({ workDate: item.work_date, choice: item.choice })),
      incompleteEvidenceAcknowledged: body.incomplete_evidence_acknowledged ?? false,
    });
    return c.json(signOffJson(result), result.status === 'created' ? 201 : 200);
  });

  // The finalized revision of a period with its sign-off, ledger lines (pending ones included, F-2) and jobs.
  app.get('/timesheets/:payrollDate/finalization', auth, (c) =>
    c.json(finalizationStatusJson(getFinalizationStatus(deps.db, c.get('user'), c.req.param('payrollDate')))),
  );

  // F-2: the owner's pending lines that are still current (for the review and OT screens).
  app.get('/revisions/pending-lines', auth, (c) => c.json({ lines: listCurrentPendingLines(deps.db, c.get('user').id) }));

  // Same-revision resend: a new delivery attempt on the unchanged PDF; no ledger or revision change.
  app.post('/revisions/:id/resend', auth, async (c) => {
    const body = await readJson(c, resendBody);
    const result = resendRevision({ db: deps.db, clock: deps.clock, user: c.get('user') }, c.req.param('id'), {
      ...(body.to === undefined ? {} : { to: body.to }),
      ...(body.cc === undefined ? {} : { cc: body.cc }),
      ...(body.template_version === undefined ? {} : { templateVersion: body.template_version }),
    });
    return c.json(resendJson(result), 201);
  });

  return app;
}
