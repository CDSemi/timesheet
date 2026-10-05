import { Hono } from 'hono';
import { z } from 'zod';
import { type PersonalRouterOptions, requireUser } from '../http/auth.ts';
import { ApiError } from '../http/errors.ts';
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
import { decideDelivery, decisionJson, deliveryJson, listDeliveries } from '../services/deliveries.ts';
import { buildReviewPayload, reviewPayloadJson } from '../services/reviewPayload.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** The owner's explicit decision on an uncertain delivery attempt (docs/05). */
const deliveryDecisionBody = z.strictObject({ decision: z.enum(['mark_delivered', 'resend']) });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Review and submission routes, built by a factory so the same handlers can be mounted behind a
 * different access guard. Every handler takes the owner from the request context's subject (the
 * session user with the default guard); no route accepts a user id, and an administrator has no
 * access to another user's payload, revision or sign-off. The review and status GETs write
 * nothing (no row, no audit event).
 * The sign-off POST is the only writer of a first revision: one transaction that binds the
 * reviewed payload, records the real sign-off, posts through the ledger service and enqueues
 * the PDF and send jobs (services/finalization.ts). The revision, late-review and resend
 * POSTs follow the same rules for later revisions (corrections post only differences, a
 * late review posts zero delta, a resend never moves the ledger). The delivery history GET
 * writes nothing; the decision POST records the owner's one decision on an uncertain attempt
 * (mark delivered, or resend as a new attempt on the same revision) and posts nothing.
 */
export function submissionRoutes(deps: AppDeps, options: PersonalRouterOptions = {}) {
  const app = new Hono<AppEnv>();
  const auth = options.access ?? requireUser(deps);

  app.get('/timesheets/:payrollDate/review', auth, (c) =>
    c.json(reviewPayloadJson(buildReviewPayload(deps.db, deps.clock, c.get('subject'), c.req.param('payrollDate')))),
  );

  app.post('/timesheets/:payrollDate/signoff', auth, async (c) => {
    const body = await readJson(c, signoffBody);
    const result = signOffTimesheet({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('payrollDate'), {
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
    const result = reviseTimesheet({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('payrollDate'), {
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
    const result = reviseTimesheet({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('payrollDate'), {
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
    c.json(finalizationStatusJson(getFinalizationStatus(deps.db, c.get('subject'), c.req.param('payrollDate')))),
  );

  // F-2: the owner's pending lines that are still current (for the review and OT screens).
  app.get('/revisions/pending-lines', auth, (c) => c.json({ lines: listCurrentPendingLines(deps.db, c.get('subject').id) }));

  // Same-revision resend: a new delivery attempt on the unchanged PDF; no ledger or revision change.
  app.post('/revisions/:id/resend', auth, async (c) => {
    const body = await readJson(c, resendBody);
    const result = resendRevision({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('id'), {
      ...(body.to === undefined ? {} : { to: body.to }),
      ...(body.cc === undefined ? {} : { cc: body.cc }),
      ...(body.template_version === undefined ? {} : { templateVersion: body.template_version }),
    });
    return c.json(resendJson(result), 201);
  });

  // The owner's delivery attempts (newest first), optionally of one revision; redacted, no body.
  app.get('/deliveries', auth, (c) => {
    const revisionId = c.req.query('revision_id');
    if (revisionId !== undefined && !UUID.test(revisionId)) throw new ApiError(422, 'validation_error', 'revision_id must be an id');
    const records = listDeliveries(deps.db, c.get('subject').id, revisionId === undefined ? {} : { revisionId });
    return c.json({ deliveries: records.map(deliveryJson) });
  });

  // The explicit decision on an uncertain attempt: mark delivered, or resend once as a new attempt.
  app.post('/deliveries/:id/decision', auth, async (c) => {
    const body = await readJson(c, deliveryDecisionBody);
    const result = decideDelivery({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('id'), body.decision);
    return c.json(decisionJson(result), result.resend === null ? 200 : 201);
  });

  return app;
}
