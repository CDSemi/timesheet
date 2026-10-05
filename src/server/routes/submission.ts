import { createHash } from 'node:crypto';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import type { Db } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { type PersonalRouterOptions, requireUser } from '../http/auth.ts';
import { ApiError, notFound } from '../http/errors.ts';
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
import { granteeChangesForReview } from '../services/sharedActs.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** The owner's explicit decision on an uncertain delivery attempt (docs/05). */
const deliveryDecisionBody = z.strictObject({ decision: z.enum(['mark_delivered', 'resend']) });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PAYROLL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The revision whose final PDF is about to be sent. */
export interface PdfDownload {
  id: string;
  payrollDate: string;
  revisionNo: number;
}

/**
 * Options of the submission router: the personal-router guard plus the private file store the PDF
 * download reads from. Without a store the download route is not registered (a router built only
 * to probe the other routes needs none); the application always passes it. `beforePdfSend` runs
 * after every check passed and before the bytes leave; it may refuse by throwing. The owner's own
 * route has none (an owner download writes nothing); the shared mount audits each grantee download
 * with it (WP3-T13B).
 */
export interface SubmissionRouterOptions extends PersonalRouterOptions {
  files?: FileStore;
  beforePdfSend?: (c: Context<AppEnv>, revision: PdfDownload) => void;
}

interface RevisionStatusRow {
  id: string;
  payroll_date: string;
  revision_no: number;
  revision_kind: string;
  origin: string;
  review_state: string;
  supersedes_revision_id: string | null;
  created_at: string;
  pdf_state: string | null;
  delivery_state: string | null;
}

const MAX_REVISIONS = 1000;

/**
 * Every revision of one owner as status metadata only: number, kind, origin and review state as
 * recorded, the supersedes link, the PDF state and the state of the latest delivery attempt. No
 * payload, hash, envelope, recipient, signer or signature leaves here, and nothing is written.
 */
function listRevisionStatus(db: Db, ownerUserId: string) {
  const rows = db
    .prepare<[string, number], RevisionStatusRow>(
      `SELECT r.id, p.payroll_date, r.revision_no, r.revision_kind, r.origin, r.review_state, r.supersedes_revision_id,
              r.created_at, f.state AS pdf_state,
              (SELECT d.state FROM delivery_attempts d
                WHERE d.revision_id = r.id AND d.user_id = r.user_id
                ORDER BY d.started_at DESC, d.rowid DESC LIMIT 1) AS delivery_state
         FROM timesheet_revisions r
         JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
         JOIN pay_periods p ON p.id = t.pay_period_id
         LEFT JOIN revision_files f ON f.revision_id = r.id AND f.user_id = r.user_id AND f.kind = 'pdf'
        WHERE r.user_id = ?
        ORDER BY p.payroll_date DESC, r.revision_no DESC
        LIMIT ?`,
    )
    .all(ownerUserId, MAX_REVISIONS);
  return rows.map((row) => ({
    id: row.id,
    payroll_date: row.payroll_date,
    revision_no: row.revision_no,
    revision_kind: row.revision_kind,
    origin: row.origin,
    review_state: row.review_state,
    supersedes_revision_id: row.supersedes_revision_id,
    finalized_at: row.created_at,
    pdf_state: row.pdf_state,
    delivery_state: row.delivery_state,
  }));
}

interface PdfRow {
  revision_no: number;
  payroll_date: string;
  state: string | null;
  storage_key: string | null;
  sha256: string | null;
}

/** The sanitized download name: only the payroll date and the revision number, never an id or a key. */
function pdfFilename(row: Pick<PdfRow, 'payroll_date' | 'revision_no'>): string {
  const date = PAYROLL_DATE.test(row.payroll_date) ? row.payroll_date : 'period';
  return `timesheet-${date}-r${Math.trunc(row.revision_no)}.pdf`;
}

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
 * The PDF download is owner-only: the revision is looked up for the subject, so another user's id
 * (an administrator's included) is "not found"; a PDF that is not ready is 409; the bytes come from
 * the private store only, are re-checked against the recorded hash, and are sent `no-store` as an
 * attachment with a sanitized filename. Nothing is written on the owner's route.
 * The revision list GET is the owner's status metadata of every revision (the history lists them
 * all); it writes nothing.
 */
export function submissionRoutes(deps: AppDeps, options: SubmissionRouterOptions = {}) {
  const app = new Hono<AppEnv>();
  const auth = options.access ?? requireUser(deps);

  // `grantee_changes` is the owner's own hint (WP3-C-01), read from the audit next to the payload and never
  // part of it: it is outside the snapshot, its hash and the PDF. Only the owner acting for themselves gets it.
  app.get('/timesheets/:payrollDate/review', auth, (c) => {
    const subject = c.get('subject');
    const payrollDate = c.req.param('payrollDate');
    const result = buildReviewPayload(deps.db, deps.clock, subject, payrollDate);
    const own = c.get('actor').id === subject.id;
    return c.json({ ...reviewPayloadJson(result), grantee_changes: own ? granteeChangesForReview(deps.db, subject, payrollDate) : [] });
  });

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

  // Status metadata of every revision of the owner, newest period first (WP3-T13 carry item).
  app.get('/revisions', auth, (c) => c.json({ revisions: listRevisionStatus(deps.db, c.get('subject').id) }));

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

  const files = options.files;
  if (files !== undefined) {
    app.get('/revisions/:id/pdf', auth, (c) => {
      const id = c.req.param('id');
      if (!UUID.test(id)) throw notFound('Revision');
      const row = deps.db
        .prepare<[string, string], PdfRow>(
          `SELECT r.revision_no, p.payroll_date, f.state, a.storage_key, a.sha256
             FROM timesheet_revisions r
             JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
             JOIN pay_periods p ON p.id = t.pay_period_id
             LEFT JOIN revision_files f ON f.revision_id = r.id AND f.user_id = r.user_id AND f.kind = 'pdf'
             LEFT JOIN attachments a ON a.id = f.attachment_id AND a.user_id = f.user_id AND a.kind = 'pdf'
            WHERE r.id = ? AND r.user_id = ?`,
        )
        .get(id, c.get('subject').id);
      if (row === undefined) throw notFound('Revision');
      if (row.state !== 'ready' || row.storage_key === null || row.sha256 === null) {
        throw new ApiError(409, 'pdf_not_ready', 'The final PDF of this revision is not ready yet');
      }
      let bytes: Buffer;
      try {
        bytes = files.read(row.storage_key);
      } catch {
        throw new ApiError(500, 'internal_error', 'Internal server error');
      }
      if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) {
        throw new ApiError(500, 'internal_error', 'Internal server error');
      }
      options.beforePdfSend?.(c, { id, payrollDate: row.payroll_date, revisionNo: row.revision_no });
      return c.body(new Uint8Array(bytes), 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFilename(row)}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
    });
  }

  return app;
}
