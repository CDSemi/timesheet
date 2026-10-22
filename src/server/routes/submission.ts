import { createHash } from 'node:crypto';
import { type Context, Hono } from 'hono';
import { defaultPdfVariant, isPdfVariant, pdfRowsOf, pdfVariant, type PdfVariant, type ReviewSnapshot } from '../../domain/snapshot.ts';
import { nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { type PersonalRouterOptions, requireUser } from '../http/auth.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { correctionRevisionBody, deliveryDecisionBody, lateReviewBody, resendBody, sendBody, signoffBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { JobError } from '../jobs/jobStore.ts';
import { loadRevisionRow, renderRevisionPdf } from '../jobs/pdfJob.ts';
import { renderTimesheetPdf } from '../pdf/timesheetPdf.ts';
import {
  decideDelivery,
  decisionJson,
  deliveryJson,
  listDeliveries,
  readyPdfOf,
  resendRevision,
  sendDraft,
  sendDraftJson,
  sendResultJson,
  sendRevision,
} from '../services/deliveries.ts';
import { finalizationStatusJson, getFinalizationStatus, listCurrentPendingLines, reviseTimesheet, signOffJson, signOffTimesheet } from '../services/finalization.ts';
import { buildReviewPayload, reviewPayloadJson } from '../services/reviewPayload.ts';
import { granteeChangesForReview } from '../services/sharedActs.ts';
import type { AppDeps, AppEnv } from '../types.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PAYROLL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The text printed where the signer's name goes on an unsigned preview (no image, never a signature). */
export const PREVIEW_SIGNER_TEXT = 'Preview, not signed';

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
 * with it (WP3-T13B). `sharedPdf` marks the shared mount: there the PDF route ignores its variant
 * query and never renders (WP5-UX5-T01b).
 */
export interface SubmissionRouterOptions extends PersonalRouterOptions {
  files?: FileStore;
  beforePdfSend?: (c: Context<AppEnv>, revision: PdfDownload) => void;
  sharedPdf?: boolean;
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

/** SQL: the sign-off default variant of revision `r` (time rows on, OT rows as its snapshot froze them). */
const DEFAULT_VARIANT_SQL = "CASE WHEN json_extract(r.payload_json, '$.show_ot_on_pdf') = 0 THEN 't1o0' ELSE 't1o1' END";

/**
 * Every revision of one owner as status metadata only: number, kind, origin and review state as
 * recorded, the supersedes link, the state of the sign-off default PDF and the state of the latest
 * delivery attempt. No payload, hash, envelope, recipient, signer or signature leaves here, and nothing is written.
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
         LEFT JOIN revision_files f ON f.revision_id = r.id AND f.user_id = r.user_id AND f.kind = 'pdf' AND f.variant = ${DEFAULT_VARIANT_SQL}
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

/** The sanitized download name: only the payroll date and the revision number, never an id or a key. */
function pdfFilename(row: { payroll_date: string; revision_no: number }): string {
  const date = PAYROLL_DATE.test(row.payroll_date) ? row.payroll_date : 'period';
  return `timesheet-${date}-r${Math.trunc(row.revision_no)}.pdf`;
}

/** A `0`/`1` query flag, or the fallback when absent; anything else is 422. */
function flagQuery(value: string | undefined, name: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (value === '1') return true;
  if (value === '0') return false;
  throw new ApiError(422, 'validation_error', `${name} must be 0 or 1`);
}

function dispositionQuery(value: string | undefined): 'inline' | 'attachment' {
  if (value === undefined || value === 'attachment') return 'attachment';
  if (value === 'inline') return 'inline';
  throw new ApiError(422, 'validation_error', 'disposition must be inline or attachment');
}

function pdfResponse(c: Context<AppEnv>, bytes: Uint8Array, disposition: 'inline' | 'attachment', filename: string): Response {
  return c.body(new Uint8Array(bytes), 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${disposition}; filename="${filename}"`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
}

/**
 * Review and submission routes, built by a factory so the same handlers can be mounted behind a
 * different access guard. Every handler takes the owner from the request context's subject (the
 * session user with the default guard); no route accepts a user id, and an administrator has no
 * access to another user's payload, revision or sign-off. The review and status GETs write
 * nothing (no row, no audit event).
 * The sign-off POST is the only writer of a first revision: one transaction that binds the
 * reviewed payload, records the real sign-off, posts through the ledger service and enqueues
 * the PDF job; it sends nothing (WP5-UX5-T01b). The revision and late-review POSTs follow the same
 * rules for later revisions (corrections post only differences, a late review posts zero delta).
 * Sending is its own act: the send-draft GET (writes nothing) gives the Send card defaults; the send
 * POST records one immutable send of the current revision with its envelope, subject, body, PDF row
 * switches and, once a copy counts as sent, the owner's reason (services/deliveries.ts); the resend
 * POST is the same send with the previous send's values. None of them moves the ledger. The delivery
 * history GET writes nothing; the decision POST records the owner's one decision on an uncertain
 * attempt (mark delivered, or resend with a reason as another send of the same revision).
 * The PDF download is owner-only on this mount: the revision is looked up for the subject, so another
 * user's id (an administrator's included) is "not found"; `time` and `ot` choose the variant (default:
 * the sign-off variant), a variant not stored yet is rendered on request (no network, atomic write);
 * the bytes come from the private store only, are re-checked against the recorded hash, and are sent
 * `no-store` with a sanitized filename. On the shared mount the query is ignored: the variant of the
 * latest send (or the sign-off variant) is served if stored, else 409; a grantee never triggers a render.
 * The unsigned preview GET renders the current review payload and writes nothing.
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

  // The Send card defaults of a revision and whether a copy already counts as sent (writes nothing).
  app.get('/revisions/:id/send-draft', auth, (c) => {
    const id = c.req.param('id');
    if (!UUID.test(id)) throw notFound('Revision');
    return c.json(sendDraftJson(sendDraft(deps.db, c.get('subject'), id, deps.delivery?.senderAddress ?? null)));
  });

  // One send of the current revision: its own immutable record, the send job and the variant PDF job.
  app.post('/revisions/:id/send', auth, async (c) => {
    const id = c.req.param('id');
    if (!UUID.test(id)) throw notFound('Revision');
    const body = await readJson(c, sendBody);
    const result = sendRevision({ db: deps.db, clock: deps.clock, user: c.get('subject') }, id, {
      requestKey: body.request_key,
      to: body.to,
      cc: body.cc,
      subject: body.subject,
      bodyText: body.body_text,
      timeRows: body.time_rows,
      otRows: body.ot_rows,
      reason: body.reason,
    });
    return c.json(sendResultJson(result), result.status === 'created' ? 201 : 200);
  });

  // The same send again with the previous send's values; no ledger or revision change.
  app.post('/revisions/:id/resend', auth, async (c) => {
    const id = c.req.param('id');
    if (!UUID.test(id)) throw notFound('Revision');
    const body = await readJson(c, resendBody);
    const result = resendRevision({ db: deps.db, clock: deps.clock, user: c.get('subject') }, id, {
      to: body.to,
      cc: body.cc,
      templateVersion: body.template_version,
      reason: body.reason,
      requestKey: body.request_key,
    });
    return c.json(sendResultJson(result), result.status === 'created' ? 201 : 200);
  });

  // The owner's delivery attempts (newest first), optionally of one revision; redacted, no body.
  app.get('/deliveries', auth, (c) => {
    const revisionId = c.req.query('revision_id');
    if (revisionId !== undefined && !UUID.test(revisionId)) throw new ApiError(422, 'validation_error', 'revision_id must be an id');
    const records = listDeliveries(deps.db, c.get('subject').id, revisionId === undefined ? {} : { revisionId });
    return c.json({ deliveries: records.map(deliveryJson) });
  });

  // The explicit decision on an uncertain attempt: mark delivered, or resend once (with a reason) as another send.
  app.post('/deliveries/:id/decision', auth, async (c) => {
    const body = await readJson(c, deliveryDecisionBody);
    const result = decideDelivery({ db: deps.db, clock: deps.clock, user: c.get('subject') }, c.req.param('id'), body.decision, body.reason);
    return c.json(decisionJson(result), result.resend === null ? 200 : 201);
  });

  const files = options.files;
  if (files !== undefined) {
    app.get('/revisions/:id/pdf', auth, async (c) => {
      const id = c.req.param('id');
      if (!UUID.test(id)) throw notFound('Revision');
      const ownerId = c.get('subject').id;
      const revision = loadRevisionRow(deps.db, ownerId, id);
      if (revision === undefined) throw notFound('Revision');
      const meta = deps.db
        .prepare<[string, string], { payroll_date: string }>(
          `SELECT p.payroll_date FROM timesheet_revisions r
             JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
             JOIN pay_periods p ON p.id = t.pay_period_id
            WHERE r.id = ? AND r.user_id = ?`,
        )
        .get(id, ownerId);
      if (meta === undefined) throw notFound('Revision');
      const snapshot = JSON.parse(revision.payload_json) as ReviewSnapshot;
      const fallback = defaultPdfVariant(snapshot);
      let variant: PdfVariant;
      let disposition: 'inline' | 'attachment' = 'attachment';
      if (options.sharedPdf === true) {
        // The shared mount ignores the query: the variant of the latest send, else the sign-off variant; never a render.
        const latest = deps.db
          .prepare<[string, string], { pdf_variant: string }>('SELECT pdf_variant FROM revision_sends WHERE revision_id = ? AND user_id = ? ORDER BY send_no DESC LIMIT 1')
          .get(id, ownerId);
        variant = latest !== undefined && isPdfVariant(latest.pdf_variant) ? latest.pdf_variant : fallback;
      } else {
        const rows = pdfRowsOf(fallback);
        variant = pdfVariant({ time: flagQuery(c.req.query('time'), 'time', rows.time), ot: flagQuery(c.req.query('ot'), 'ot', rows.ot) });
        disposition = dispositionQuery(c.req.query('disposition'));
        if (readyPdfOf(deps.db, ownerId, id, variant) === undefined) {
          try {
            await renderRevisionPdf({ db: deps.db, clock: deps.clock, files }, revision, variant);
          } catch (error) {
            if (error instanceof JobError) throw new ApiError(409, 'pdf_not_ready', 'This PDF could not be prepared yet; try again later');
            throw error;
          }
        }
      }
      const pdf = readyPdfOf(deps.db, ownerId, id, variant);
      if (pdf === undefined) throw new ApiError(409, 'pdf_not_ready', 'The final PDF of this revision is not ready yet');
      let bytes: Buffer;
      try {
        bytes = files.read(pdf.storage_key);
      } catch {
        throw new ApiError(500, 'internal_error', 'Internal server error');
      }
      if (createHash('sha256').update(bytes).digest('hex') !== pdf.sha256) {
        throw new ApiError(500, 'internal_error', 'Internal server error');
      }
      const row = { payroll_date: meta.payroll_date, revision_no: revision.revision_no };
      options.beforePdfSend?.(c, { id, payrollDate: row.payroll_date, revisionNo: row.revision_no });
      return pdfResponse(c, bytes, disposition, pdfFilename(row));
    });
  }

  // An unsigned preview of the current review (B2): rendered on request, written nowhere, never signed.
  app.get('/timesheets/:payrollDate/pdf-preview', auth, async (c) => {
    const payrollDate = c.req.param('payrollDate');
    const result = buildReviewPayload(deps.db, deps.clock, c.get('subject'), payrollDate);
    const payload = result.payload;
    const rows = { time: flagQuery(c.req.query('time'), 'time', true), ot: flagQuery(c.req.query('ot'), 'ot', payload.show_ot_on_pdf) };
    const bytes = await renderTimesheetPdf({
      snapshot: payload,
      submissionId: payload.submission.id,
      revisionNo: payload.submission.revision_no,
      origin: 'manual',
      signedAt: nowUtc(deps.clock),
      automaticSubmittedAt: null,
      signerName: PREVIEW_SIGNER_TEXT,
      signatureImage: null,
      rows,
    });
    const date = PAYROLL_DATE.test(payload.period.payroll_date) ? payload.period.payroll_date : 'period';
    return pdfResponse(c, bytes, 'inline', `timesheet-${date}-preview.pdf`);
  });

  return app;
}
