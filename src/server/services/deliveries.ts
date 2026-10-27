import { randomUUID } from 'node:crypto';
import { canonicalize } from '../../domain/canonical.ts';
import {
  EmailTemplateError,
  escapeHtml,
  normalizeRecipients,
  renderHtmlBody,
  renderSubject,
  renderTextBody,
  type TemplateValues,
} from '../../domain/emailTemplate.ts';
import { defaultPdfVariant, pdfVariant, type PdfRows, type PdfVariant, type ReviewSnapshot } from '../../domain/snapshot.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { enqueueJob } from '../jobs/jobStore.ts';
import { recordAudit } from './audit.ts';
import { submissionSettingsOrDefault } from './submissionSettings.ts';
import { importedPeriodError } from './workbookImport.ts';

/*
 * Sends, delivery history and the uncertain-outcome decision (docs/05 "Durable delivery",
 * "Corrections and resends", AC-08, AC-14; WP5-UX5-T01b, owner decisions F-2 a, F-3 b, F-4).
 *
 * Signing and sending are separate acts. A sign-off (or a correction, or a late review) creates the
 * signed revision and its PDF job only. A **send** is its own immutable `revision_sends` row: the
 * envelope (To, Cc), subject and bodies chosen for that copy, the two PDF row switches (the variant)
 * and, for another copy, the owner's reason. Each send has exactly one `send_email` job (business key
 * `send:<send id>`, routing ids only); the send job builds the message from the row and waits for the
 * variant PDF, which the same transaction enqueues when it is not stored yet.
 *
 * - The owner's send (`sendRevision`, POST /api/revisions/:id/send) runs in one IMMEDIATE transaction:
 *   an identical retry of the same `request_key` replays the stored send (another body under the key is
 *   409 `request_key_reused`); only the period's current revision, never an imported one, can be sent;
 *   an open or undecided uncertain attempt of the revision, or a send job still waiting, is 409; then the
 *   owner's reason rule (B-A2) is checked inside the same transaction, so two concurrent sends cannot
 *   both skip it.
 * - The reason rule: a copy of the period "counts as sent" once any delivery attempt of any of its
 *   revisions was `accepted` or `uncertain` (whatever was decided later: the mail may have arrived); a
 *   send whose attempts all failed permanently does not count. When a copy counts, another send needs a
 *   reason of 2-500 characters (trimmed, NFC, no control character except a line feed), else 422
 *   `reason_required`. The reason is stored on the send and in the audit event, never in the email.
 * - `resendRevision` (POST /api/revisions/:id/resend) and the explicit "resend" decision on an uncertain
 *   attempt are the same send with the previous send's values (the decision needs the reason too).
 * - The automatic paths (the deadline's automatic finalization and the deadline send of a signed
 *   revision, F-2 a) insert a send with origin `deadline`, the Settings envelope and switches and no
 *   reason; they run only for a period that has no send at all.
 *
 * Every read and write is scoped to the session owner; another user's revision or attempt is
 * indistinguishable from a missing one (404). Delivery history carries the owner's own frozen envelope
 * (recipients, subject) and redacted provider data only: no body, no PDF bytes, no credential and no
 * storage key. `recoverInterruptedSends` turns a `sending` attempt whose job lease has expired (or
 * whose job is no longer leased) into `uncertain`: it is never resent blindly. Nothing here posts to
 * the ledger or changes a revision.
 */

export const JOB_RENDER_PDF = 'render_pdf';
export const JOB_SEND_EMAIL = 'send_email';
export const UNCERTAIN_LEASE_EXPIRED = 'lease_expired_while_sending';

/** The owner and the clock of a send; the owner always comes from the session. */
export interface SendContext {
  db: Db;
  clock: Clock;
  user: SessionUser;
}

/* ------------------------------------------------------------------ rules ---- */

export const MAX_SUBJECT_LENGTH = 300;
export const MAX_BODY_LENGTH = 20_000;
export const MIN_SEND_REASON = 2;
export const MAX_SEND_REASON = 500;

const SUBJECT_UNSAFE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
// Control characters except a line feed and a tab, and the Unicode line and paragraph separators.
const BODY_UNSAFE = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\p{Zl}\p{Zp}]/u;
const REASON_UNSAFE = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\p{Zl}\p{Zp}]/u;

const codePoints = (text: string): number => [...text].length;

/** The HTML body of a send: the text escaped, line breaks as `<br>` (the template renderer's rule). */
export function htmlFromText(text: string): string {
  return escapeHtml(text).replaceAll('\n', '<br>\n');
}

/**
 * The owner's reason for another copy: null when absent or blank; otherwise NFC, line breaks as LF,
 * trimmed, 2-500 characters and no control character except a line feed (422 `invalid_reason`).
 */
export function parseSendReason(raw: string | null | undefined): string | null {
  if (raw === undefined || raw === null) return null;
  const text = raw.normalize('NFC').replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim();
  if (text === '') return null;
  const length = codePoints(text);
  if (length < MIN_SEND_REASON || length > MAX_SEND_REASON || REASON_UNSAFE.test(text)) {
    throw new ApiError(422, 'invalid_reason', `The reason must be ${MIN_SEND_REASON}-${MAX_SEND_REASON} characters without control characters`);
  }
  return text;
}

export interface SendEnvelope {
  to: string[];
  cc: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface SendInput {
  requestKey: string;
  to: readonly string[];
  cc: readonly string[];
  subject: string;
  bodyText: string;
  timeRows: boolean;
  otRows: boolean;
  reason?: string | null | undefined;
}

/** Validates and normalizes what the owner typed for one send (422 with an exact code). */
export function normalizeSendEnvelope(input: Pick<SendInput, 'to' | 'cc' | 'subject' | 'bodyText'>): SendEnvelope {
  let recipients: { to: string[]; cc: string[] };
  try {
    recipients = normalizeRecipients(input.to, input.cc);
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      throw new ApiError(422, error.code, error.message, error.details === undefined ? undefined : { ...error.details });
    }
    throw error;
  }
  const subject = input.subject.normalize('NFC').trim();
  if (subject === '' || codePoints(subject) > MAX_SUBJECT_LENGTH || SUBJECT_UNSAFE.test(subject)) {
    throw new ApiError(422, 'invalid_subject', `The subject must be one line of 1-${MAX_SUBJECT_LENGTH} characters`);
  }
  const bodyText = input.bodyText.normalize('NFC').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  if (bodyText.trim() === '' || codePoints(bodyText) > MAX_BODY_LENGTH || BODY_UNSAFE.test(bodyText)) {
    throw new ApiError(422, 'invalid_body', `The message must have 1-${MAX_BODY_LENGTH} characters without control characters`);
  }
  return { to: recipients.to, cc: recipients.cc, subject, bodyText, bodyHtml: htmlFromText(bodyText) };
}

/* ------------------------------------------------------------- send rows ---- */

interface SendRow {
  id: string;
  user_id: string;
  revision_id: string;
  send_no: number;
  request_key: string;
  origin: 'employee' | 'deadline';
  actor_user_id: string | null;
  to_json: string;
  cc_json: string;
  subject: string;
  body_text: string;
  body_html: string;
  time_rows: number;
  ot_rows: number;
  pdf_variant: PdfVariant;
  reason: string | null;
  job_id: string;
  created_at: string;
}

export interface SendRecord {
  id: string;
  userId: string;
  revisionId: string;
  sendNo: number;
  requestKey: string;
  origin: 'employee' | 'deadline';
  actorUserId: string | null;
  to: string[];
  cc: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  timeRows: boolean;
  otRows: boolean;
  pdfVariant: PdfVariant;
  reason: string | null;
  jobId: string;
  createdAt: string;
}

function toSend(row: SendRow): SendRecord {
  return {
    id: row.id,
    userId: row.user_id,
    revisionId: row.revision_id,
    sendNo: row.send_no,
    requestKey: row.request_key,
    origin: row.origin,
    actorUserId: row.actor_user_id,
    to: JSON.parse(row.to_json) as string[],
    cc: JSON.parse(row.cc_json) as string[],
    subject: row.subject,
    bodyText: row.body_text,
    bodyHtml: row.body_html,
    timeRows: row.time_rows === 1,
    otRows: row.ot_rows === 1,
    pdfVariant: row.pdf_variant,
    reason: row.reason,
    jobId: row.job_id,
    createdAt: row.created_at,
  };
}

/** The send of a `send_email` job (every send job has exactly one), scoped to the job's owner. */
export function sendOfJob(db: Db, userId: string, jobId: string): SendRecord | null {
  const row = db.prepare<[string, string], SendRow>('SELECT * FROM revision_sends WHERE job_id = ? AND user_id = ?').get(jobId, userId);
  return row === undefined ? null : toSend(row);
}

/** The owner's sends of one revision, oldest first. */
export function listRevisionSends(db: Db, userId: string, revisionId: string): SendRecord[] {
  return db
    .prepare<[string, string], SendRow>('SELECT * FROM revision_sends WHERE revision_id = ? AND user_id = ? ORDER BY send_no')
    .all(revisionId, userId)
    .map(toSend);
}

/** True once any revision of the timesheet has a send: the period counts as submitted (F-2 a). */
export function periodHasSend(db: Db, userId: string, timesheetId: string): boolean {
  return (
    db
      .prepare<[string, string], { one: number }>(
        `SELECT 1 AS one FROM revision_sends s
           JOIN timesheet_revisions r ON r.id = s.revision_id AND r.user_id = s.user_id
          WHERE r.timesheet_id = ? AND s.user_id = ? LIMIT 1`,
      )
      .get(timesheetId, userId) !== undefined
  );
}

/** The SQL text of a ready PDF of one variant (attachment id, storage key and hash). */
export function readyPdfOf(db: Db, userId: string, revisionId: string, variant: PdfVariant): { attachment_id: string; storage_key: string; sha256: string } | undefined {
  return db
    .prepare<[string, string, string], { attachment_id: string; storage_key: string; sha256: string }>(
      `SELECT f.attachment_id, a.storage_key, a.sha256
         FROM revision_files f
         JOIN attachments a ON a.id = f.attachment_id AND a.user_id = f.user_id
        WHERE f.revision_id = ? AND f.user_id = ? AND f.kind = 'pdf' AND f.variant = ? AND f.state = 'ready' AND a.kind = 'pdf'`,
    )
    .get(revisionId, userId, variant);
}

/**
 * The business key of the PDF job of one variant. The sign-off default variant keeps the key the sign-off has always
 * used, so a send that needs it never enqueues a second job for the same file.
 */
export function pdfJobKey(revisionId: string, variant: PdfVariant, defaultVariant: PdfVariant): string {
  return variant === defaultVariant ? `revision:${revisionId}:${JOB_RENDER_PDF}` : `revision:${revisionId}:${JOB_RENDER_PDF}:${variant}`;
}

/** Enqueues the PDF job of one variant unless the file is ready (idempotent by business key). Caller's transaction. */
export function enqueuePdfVariant(db: Db, clock: Clock, userId: string, revisionId: string, snapshot: Pick<ReviewSnapshot, 'show_ot_on_pdf'>, variant: PdfVariant): void {
  if (readyPdfOf(db, userId, revisionId, variant) !== undefined) return;
  enqueuePdfJob(db, clock, userId, revisionId, snapshot, variant);
}

/** Enqueues the PDF job of one variant (idempotent by business key); a revision just created has no file yet. */
export function enqueuePdfJob(db: Db, clock: Clock, userId: string, revisionId: string, snapshot: Pick<ReviewSnapshot, 'show_ot_on_pdf'>, variant: PdfVariant): void {
  enqueueJob(db, clock, {
    kind: JOB_RENDER_PDF,
    businessKey: pdfJobKey(revisionId, variant, defaultPdfVariant(snapshot)),
    userId,
    revisionId,
    payload: { revision_id: revisionId, variant },
  });
}

export interface NewSend {
  userId: string;
  revisionId: string;
  snapshot: ReviewSnapshot;
  origin: 'employee' | 'deadline';
  actorUserId: string | null;
  requestKey: string;
  envelope: SendEnvelope;
  rows: PdfRows;
  reason: string | null;
}

/**
 * Inserts one send inside the caller's write transaction: the immutable row, its `send_email` job and the PDF job of
 * its variant when that file is not stored yet. No check happens here; the callers own them.
 */
export function insertSend(db: Db, clock: Clock, input: NewSend): SendRecord {
  const now = nowUtc(clock);
  const id = randomUUID();
  const jobId = randomUUID();
  const latest = db
    .prepare<[string, string], { latest: number | null }>('SELECT max(send_no) AS latest FROM revision_sends WHERE revision_id = ? AND user_id = ?')
    .get(input.revisionId, input.userId);
  const sendNo = (latest?.latest ?? 0) + 1;
  const variant = pdfVariant(input.rows);
  db.prepare(
    `INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?)`,
  ).run(jobId, input.userId, input.revisionId, JOB_SEND_EMAIL, `send:${id}`, JSON.stringify({ revision_id: input.revisionId, send_id: id }), now, now, now);
  db.prepare(
    `INSERT INTO revision_sends (id, user_id, revision_id, send_no, request_key, origin, actor_user_id, to_json, cc_json,
       subject, body_text, body_html, time_rows, ot_rows, pdf_variant, reason, job_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.userId,
    input.revisionId,
    sendNo,
    input.requestKey,
    input.origin,
    input.actorUserId,
    JSON.stringify(input.envelope.to),
    JSON.stringify(input.envelope.cc),
    input.envelope.subject,
    input.envelope.bodyText,
    input.envelope.bodyHtml,
    input.rows.time ? 1 : 0,
    input.rows.ot ? 1 : 0,
    variant,
    input.reason,
    jobId,
    now,
  );
  enqueuePdfVariant(db, clock, input.userId, input.revisionId, input.snapshot, variant);
  const row = db.prepare<[string], SendRow>('SELECT * FROM revision_sends WHERE id = ?').get(id);
  if (row === undefined) throw new Error('The new send was not stored');
  return toSend(row);
}

/* ------------------------------------------------------- Settings defaults ---- */

/**
 * The Send card defaults of a revision: To and Cc from the current Settings, subject and body rendered from the current
 * Settings templates with this revision's values, and the two switches from Settings (F-3 b, F-4).
 */
export function settingsDefaults(db: Db, userId: string, snapshot: ReviewSnapshot, revisionNo: number): { envelope: SendEnvelope; rows: PdfRows } {
  const settings = submissionSettingsOrDefault(db, userId);
  const values: TemplateValues = {
    EmployeeName: snapshot.employee.name,
    PeriodStart: snapshot.period.period_start,
    PeriodEnd: snapshot.period.period_end,
    PayrollDate: snapshot.period.payroll_date,
    SignOffStatus: snapshot.submission.sign_off_status,
    SubmissionId: snapshot.submission.id,
    Revision: String(revisionNo),
  };
  return {
    envelope: {
      to: [...settings.recipientsTo],
      cc: [...settings.recipientsCc],
      subject: renderSubject(settings.subjectTemplate, values),
      bodyText: renderTextBody(settings.bodyTemplate, values),
      bodyHtml: renderHtmlBody(settings.bodyTemplate, values),
    },
    rows: { time: settings.showTimeOnPdf, ot: settings.showOtOnPdf },
  };
}

/* ----------------------------------------------------- the reason rule ---- */

export interface CountedCopy {
  sentAt: string;
  to: string[];
  cc: string[];
  state: 'accepted' | 'uncertain';
}

const stringList = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

/**
 * The latest copy of the period that counts as sent (B-A2): an attempt of any of its revisions that was `accepted` or
 * `uncertain`, whatever was decided later. Null when none counts (no attempt, or every attempt failed).
 */
export function countedCopy(db: Db, userId: string, timesheetId: string): CountedCopy | null {
  const row = db
    .prepare<[string, string], { state: 'accepted' | 'uncertain'; envelope_json: string; accepted_at: string | null; started_at: string }>(
      `SELECT a.state, a.envelope_json, a.accepted_at, a.started_at
         FROM delivery_attempts a
         JOIN timesheet_revisions r ON r.id = a.revision_id AND r.user_id = a.user_id
        WHERE a.user_id = ? AND r.timesheet_id = ? AND a.state IN ('accepted', 'uncertain')
        ORDER BY a.started_at DESC, a.attempt_no DESC, a.rowid DESC
        LIMIT 1`,
    )
    .get(userId, timesheetId);
  if (row === undefined) return null;
  const envelope = JSON.parse(row.envelope_json) as Record<string, unknown>;
  return { sentAt: row.accepted_at ?? row.started_at, to: stringList(envelope.to), cc: stringList(envelope.cc), state: row.state };
}

/* ------------------------------------------------------ the owner's send ---- */

interface OwnedRevision {
  id: string;
  revision_no: number;
  timesheet_id: string;
  payload_json: string;
  correction_reason: string | null;
  finalized_revision_no: number | null;
  imported_unverified: number;
}

function ownedRevision(db: Db, userId: string, revisionId: string): OwnedRevision {
  const row = db
    .prepare<[string, string], OwnedRevision>(
      `SELECT r.id, r.revision_no, r.timesheet_id, r.payload_json, r.correction_reason, t.finalized_revision_no, t.imported_unverified
         FROM timesheet_revisions r
         JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
        WHERE r.id = ? AND r.user_id = ?`,
    )
    .get(revisionId, userId);
  // Another user's revision is indistinguishable from a missing one.
  if (row === undefined) throw notFound('Revision');
  return row;
}

/** 409 while an attempt of the revision is open or uncertain without a decision, or a send job still waits. */
function assertNothingInFlight(db: Db, userId: string, revisionId: string): void {
  const open = db
    .prepare<[string, string], { state: string }>(
      `SELECT state FROM delivery_attempts
        WHERE user_id = ? AND revision_id = ? AND (state IN ('preparing', 'sending') OR (state = 'uncertain' AND decision IS NULL))`,
    )
    .all(userId, revisionId);
  if (open.some((attempt) => attempt.state === 'uncertain')) {
    throw new ApiError(409, 'delivery_uncertain', 'A delivery attempt is uncertain; record a decision before sending again');
  }
  // A send job of ANY revision of the period that still waits blocks another send, so a superseded revision's copy cannot
  // arrive after the correction's (R-UX5B-1).
  const waiting = db
    .prepare<[string, string, string], { one: number }>(
      `SELECT 1 AS one FROM jobs j
         JOIN timesheet_revisions r ON r.id = j.revision_id AND r.user_id = j.user_id
         JOIN timesheet_revisions target ON target.timesheet_id = r.timesheet_id AND target.user_id = r.user_id
        WHERE j.user_id = ? AND j.kind = ? AND j.state IN ('queued', 'leased') AND target.id = ? LIMIT 1`,
    )
    .get(userId, JOB_SEND_EMAIL, revisionId);
  if (open.length > 0 || waiting !== undefined) {
    throw new ApiError(409, 'delivery_in_progress', 'A delivery of this period is already in progress');
  }
}

export interface SendResult {
  status: 'created' | 'replayed';
  send: SendRecord;
}

/** True when the stored send is exactly what the retried request asks for. */
function sameSend(send: SendRecord, revisionId: string, envelope: SendEnvelope, rows: PdfRows, reason: string | null): boolean {
  return (
    send.revisionId === revisionId &&
    canonicalize(send.to) === canonicalize(envelope.to) &&
    canonicalize(send.cc) === canonicalize(envelope.cc) &&
    send.subject === envelope.subject &&
    send.bodyText === envelope.bodyText &&
    send.timeRows === rows.time &&
    send.otRows === rows.ot &&
    send.reason === reason
  );
}

interface CheckedSend {
  revisionId: string;
  requestKey: string;
  envelope: SendEnvelope;
  rows: PdfRows;
  reason: string | null;
}

/** The checks and the insert of an owner's send, inside the caller's write transaction (see the module comment). */
function sendWithin(ctx: SendContext, input: CheckedSend, operation: 'revision.send' | 'revision.resend'): SendResult {
  const { db, clock, user } = ctx;
  const revision = ownedRevision(db, user.id, input.revisionId);
  const previous = db.prepare<[string, string], SendRow>('SELECT * FROM revision_sends WHERE user_id = ? AND request_key = ?').get(user.id, input.requestKey);
  if (previous !== undefined) {
    const stored = toSend(previous);
    if (sameSend(stored, input.revisionId, input.envelope, input.rows, input.reason)) return { status: 'replayed', send: stored };
    throw new ApiError(409, 'request_key_reused', 'This request key was used for a different send');
  }
  if (revision.finalized_revision_no !== revision.revision_no) {
    throw new ApiError(409, 'revision_superseded', 'A newer revision exists; only the current revision can be sent');
  }
  if (revision.imported_unverified === 1) throw importedPeriodError();
  assertNothingInFlight(db, user.id, revision.id);
  // B-A2, inside this transaction: once a copy counts as sent, another one needs the owner's reason.
  const counted = countedCopy(db, user.id, revision.timesheet_id);
  if (counted !== null && input.reason === null) {
    throw new ApiError(422, 'reason_required', 'A copy was already sent; give a reason for sending another one', {
      copy_sent_before: { sent_at: counted.sentAt, state: counted.state },
    });
  }
  const snapshot = JSON.parse(revision.payload_json) as ReviewSnapshot;
  const send = insertSend(db, clock, {
    userId: user.id,
    revisionId: revision.id,
    snapshot,
    origin: 'employee',
    actorUserId: user.id,
    requestKey: input.requestKey,
    envelope: input.envelope,
    rows: input.rows,
    reason: input.reason,
  });
  recordAudit(db, clock, {
    actorUserId: user.id,
    ownerUserId: user.id,
    operation,
    entityType: 'timesheet_revision',
    entityId: revision.id,
    reason: input.reason,
    after: {
      revision_id: revision.id,
      send_id: send.id,
      send_no: send.sendNo,
      job_id: send.jobId,
      pdf_variant: send.pdfVariant,
      time_rows: send.timeRows,
      ot_rows: send.otRows,
      to_count: send.to.length,
      cc_count: send.cc.length,
      copy_counted_before: counted !== null,
    },
  });
  return { status: 'created', send };
}

/** POST /api/revisions/:id/send: the owner's send of the current revision (see the module comment). */
export function sendRevision(ctx: SendContext, revisionId: string, input: SendInput): SendResult {
  const envelope = normalizeSendEnvelope(input);
  const reason = parseSendReason(input.reason);
  return writeTransaction(ctx.db, () =>
    sendWithin(ctx, { revisionId, requestKey: input.requestKey, envelope, rows: { time: input.timeRows, ot: input.otRows }, reason }, 'revision.send'),
  );
}

export interface ResendInput {
  /** Optional echo of the recipients the caller expects; a difference from the previous send is 409. */
  to?: readonly string[] | undefined;
  cc?: readonly string[] | undefined;
  templateVersion?: number | undefined;
  reason?: string | null | undefined;
  requestKey?: string | undefined;
}

const addressKey = (list: readonly string[]): string => JSON.stringify(list.map((item) => item.trim().toLowerCase()).sort());

/**
 * The same send again: the values of the revision's previous send (`fromJobId` names it, else its latest send; a
 * revision never sent takes the Settings defaults). Inside the caller's transaction.
 */
function resendWithin(ctx: SendContext, revisionId: string, input: ResendInput, fromJobId: string | null): SendResult {
  const { db, user } = ctx;
  const revision = ownedRevision(db, user.id, revisionId);
  const snapshot = JSON.parse(revision.payload_json) as ReviewSnapshot;
  const sends = listRevisionSends(db, user.id, revisionId);
  const source = sends.find((item) => item.jobId === fromJobId) ?? sends.at(-1) ?? null;
  const base =
    source === null
      ? settingsDefaults(db, user.id, snapshot, revision.revision_no)
      : {
          envelope: { to: source.to, cc: source.cc, subject: source.subject, bodyText: source.bodyText, bodyHtml: source.bodyHtml },
          rows: { time: source.timeRows, ot: source.otRows },
        };
  const changed = [
    ...(input.to !== undefined && addressKey(input.to) !== addressKey(base.envelope.to) ? ['to'] : []),
    ...(input.cc !== undefined && addressKey(input.cc) !== addressKey(base.envelope.cc) ? ['cc'] : []),
    ...(input.templateVersion !== undefined && input.templateVersion !== snapshot.recipients.template_version ? ['template_version'] : []),
  ];
  if (changed.length > 0) {
    throw new ApiError(409, 'envelope_changed', 'The recipients or template differ from the previous send; send with new values instead', {
      fields: changed,
    });
  }
  return sendWithin(
    ctx,
    { revisionId, requestKey: input.requestKey ?? randomUUID(), envelope: base.envelope, rows: base.rows, reason: parseSendReason(input.reason) },
    'revision.resend',
  );
}

/** POST /api/revisions/:id/resend: the send route with the previous send's values. */
export function resendRevision(ctx: SendContext, revisionId: string, input: ResendInput): SendResult {
  return writeTransaction(ctx.db, () => resendWithin(ctx, revisionId, input, null));
}

/* ------------------------------------------------------------- send draft ---- */

export interface SendDraft {
  revisionId: string;
  revisionNo: number;
  current: boolean;
  sender: string | null;
  envelope: SendEnvelope;
  rows: PdfRows;
  copySentBefore: CountedCopy | null;
  previous: SendRecord | null;
  correctionReason: string | null;
}

/** GET /api/revisions/:id/send-draft: the Send card defaults and whether a copy already counts. Writes nothing. */
export function sendDraft(db: Db, user: SessionUser, revisionId: string, sender: string | null): SendDraft {
  return db
    .transaction((): SendDraft => {
      const revision = ownedRevision(db, user.id, revisionId);
      const snapshot = JSON.parse(revision.payload_json) as ReviewSnapshot;
      const defaults = settingsDefaults(db, user.id, snapshot, revision.revision_no);
      return {
        revisionId: revision.id,
        revisionNo: revision.revision_no,
        current: revision.finalized_revision_no === revision.revision_no,
        sender,
        envelope: defaults.envelope,
        rows: defaults.rows,
        copySentBefore: countedCopy(db, user.id, revision.timesheet_id),
        previous: listRevisionSends(db, user.id, revision.id).at(-1) ?? null,
        correctionReason: revision.correction_reason,
      };
    })
    .deferred();
}

/* ----------------------------------------------- the deadline send (F-2 a) ---- */

/**
 * The deadline send of a signed revision that was never sent (F-2 a, inside the caller's transaction): origin
 * `deadline`, the Settings envelope and switches, no reason, audit `deadline.send_signed`. Returns null when the
 * period has a send already (nothing is written).
 */
export function sendSignedAtDeadline(db: Db, clock: Clock, ownerId: string, timesheetId: string): SendRecord | null {
  if (periodHasSend(db, ownerId, timesheetId)) return null;
  const revision = db
    .prepare<[string, string], { id: string; revision_no: number; payload_json: string; review_state: string }>(
      `SELECT r.id, r.revision_no, r.payload_json, r.review_state
         FROM timesheets t JOIN timesheet_revisions r ON r.timesheet_id = t.id AND r.user_id = t.user_id AND r.revision_no = t.finalized_revision_no
        WHERE t.id = ? AND t.user_id = ?`,
    )
    .get(timesheetId, ownerId);
  if (revision === undefined || revision.review_state !== 'signed') return null;
  const snapshot = JSON.parse(revision.payload_json) as ReviewSnapshot;
  const defaults = settingsDefaults(db, ownerId, snapshot, revision.revision_no);
  const send = insertSend(db, clock, {
    userId: ownerId,
    revisionId: revision.id,
    snapshot,
    origin: 'deadline',
    actorUserId: null,
    requestKey: `deadline:${revision.id}`,
    envelope: defaults.envelope,
    rows: defaults.rows,
    reason: null,
  });
  recordAudit(db, clock, {
    actorUserId: null,
    ownerUserId: ownerId,
    operation: 'deadline.send_signed',
    entityType: 'timesheet_revision',
    entityId: revision.id,
    after: {
      revision_id: revision.id,
      revision_no: revision.revision_no,
      send_id: send.id,
      job_id: send.jobId,
      pdf_variant: send.pdfVariant,
      to_count: send.to.length,
      cc_count: send.cc.length,
    },
  });
  return send;
}

/* --------------------------------------------------- delivery history ---- */

/** Marks interrupted `sending` attempts uncertain; returns how many changed. */
export function recoverInterruptedSends(db: Db, clock: Clock): number {
  return writeTransaction(db, () => {
    const now = nowUtc(clock);
    const stale = db
      .prepare(
        `SELECT a.id AS attempt_id, j.id AS job_id, j.state AS job_state, j.lease_expires_at
           FROM delivery_attempts a
           JOIN jobs j ON j.id = a.job_id AND j.user_id = a.user_id
          WHERE a.state = 'sending' AND (j.state <> 'leased' OR j.lease_expires_at <= ?)`,
      )
      .all(now) as Array<{ attempt_id: string; job_id: string; job_state: string; lease_expires_at: string | null }>;
    for (const row of stale) {
      db.prepare(
        `UPDATE delivery_attempts SET state = 'uncertain', provider_response = ?, updated_at = ?
          WHERE id = ? AND state = 'sending'`,
      ).run(UNCERTAIN_LEASE_EXPIRED, now, row.attempt_id);
      if (row.job_state === 'leased') {
        db.prepare(
          `UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = 'delivery_uncertain', updated_at = ?
            WHERE id = ? AND state = 'leased' AND lease_expires_at <= ?`,
        ).run(now, row.job_id, now);
      }
    }
    return stale.length;
  });
}

type StoredDecision = 'resend' | 'treat_as_accepted' | 'abandon';
export type DeliveryDecision = 'mark_delivered' | 'resend';

const DECISION_OUT: Record<StoredDecision, string> = { resend: 'resend', treat_as_accepted: 'mark_delivered', abandon: 'abandon' };

interface AttemptRow {
  id: string;
  job_id: string;
  revision_id: string | null;
  revision_no: number | null;
  payroll_date: string | null;
  attempt_no: number;
  channel: string;
  envelope_json: string;
  message_id: string;
  provider_message_id: string | null;
  state: string;
  provider_response: string | null;
  accepted_at: string | null;
  decision: StoredDecision | null;
  decided_at: string | null;
  started_at: string;
  updated_at: string;
  job_state: string;
  job_last_error: string | null;
}

const ATTEMPT_SELECT = `
  SELECT a.id, a.job_id, a.revision_id, r.revision_no, p.payroll_date, a.attempt_no, a.channel, a.envelope_json,
         a.message_id, a.provider_message_id, a.state, a.provider_response, a.accepted_at, a.decision, a.decided_at,
         a.started_at, a.updated_at, j.state AS job_state, j.last_error AS job_last_error
    FROM delivery_attempts a
    JOIN jobs j ON j.id = a.job_id AND j.user_id = a.user_id
    LEFT JOIN timesheet_revisions r ON r.id = a.revision_id AND r.user_id = a.user_id
    LEFT JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
    LEFT JOIN pay_periods p ON p.id = t.pay_period_id`;

export interface DeliveryRecord {
  id: string;
  jobId: string;
  revisionId: string | null;
  revisionNo: number | null;
  payrollDate: string | null;
  attemptNo: number;
  channel: string;
  to: string[];
  cc: string[];
  subject: string | null;
  messageId: string;
  providerMessageId: string | null;
  state: string;
  providerResponse: string | null;
  acceptedAt: string | null;
  decision: string | null;
  decidedAt: string | null;
  decisionRequired: boolean;
  startedAt: string;
  updatedAt: string;
  job: { state: string; lastError: string | null };
}

function toRecord(row: AttemptRow): DeliveryRecord {
  const envelope = JSON.parse(row.envelope_json) as Record<string, unknown>;
  return {
    id: row.id,
    jobId: row.job_id,
    revisionId: row.revision_id,
    revisionNo: row.revision_no,
    payrollDate: row.payroll_date,
    attemptNo: row.attempt_no,
    channel: row.channel,
    to: stringList(envelope.to),
    cc: stringList(envelope.cc),
    subject: typeof envelope.subject === 'string' ? envelope.subject : null,
    messageId: row.message_id,
    providerMessageId: row.provider_message_id,
    state: row.state,
    providerResponse: row.provider_response,
    acceptedAt: row.accepted_at,
    decision: row.decision === null ? null : DECISION_OUT[row.decision],
    decidedAt: row.decided_at,
    decisionRequired: row.state === 'uncertain' && row.decision === null,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    job: { state: row.job_state, lastError: row.job_last_error },
  };
}

/** The owner's delivery attempts, newest first; optionally of one revision. Writes nothing. */
export function listDeliveries(db: Db, userId: string, filter: { revisionId?: string } = {}): DeliveryRecord[] {
  const rows =
    filter.revisionId === undefined
      ? (db.prepare(`${ATTEMPT_SELECT} WHERE a.user_id = ? ORDER BY a.started_at DESC, a.attempt_no DESC, a.id`).all(userId) as AttemptRow[])
      : (db
          .prepare(`${ATTEMPT_SELECT} WHERE a.user_id = ? AND a.revision_id = ? ORDER BY a.started_at DESC, a.attempt_no DESC, a.id`)
          .all(userId, filter.revisionId) as AttemptRow[]);
  return rows.map(toRecord);
}

function loadAttempt(db: Db, userId: string, attemptId: string): DeliveryRecord | null {
  const row = db.prepare(`${ATTEMPT_SELECT} WHERE a.id = ? AND a.user_id = ?`).get(attemptId, userId) as AttemptRow | undefined;
  return row === undefined ? null : toRecord(row);
}

export interface DecisionResult {
  attempt: DeliveryRecord;
  resend: SendResult | null;
}

/**
 * The owner's one explicit decision on an uncertain attempt: mark it delivered (stored as `treat_as_accepted`; the
 * attempt stays `uncertain` with the decision), or resend it, which records the decision and creates another send of
 * the same revision with the uncertain send's values, in the same transaction. The uncertain attempt makes the copy
 * count (B-A2), so a resend needs the owner's reason. One open attempt per revision is kept by the schema; the ledger
 * and the revision are never touched.
 */
export function decideDelivery(ctx: SendContext, attemptId: string, decision: DeliveryDecision, reasonInput?: string | null): DecisionResult {
  const { db, clock, user } = ctx;
  const reason = parseSendReason(reasonInput);
  return writeTransaction(db, (): DecisionResult => {
    recoverInterruptedSends(db, clock);
    const current = loadAttempt(db, user.id, attemptId);
    if (current === null) throw notFound('Delivery attempt');
    if (current.decision !== null) {
      throw new ApiError(409, 'delivery_decision_recorded', 'A decision was already recorded for this delivery attempt');
    }
    if (current.state !== 'uncertain') {
      throw new ApiError(409, 'delivery_not_uncertain', 'Only an uncertain delivery attempt takes a decision', { state: current.state });
    }
    if (decision === 'resend' && reason === null) {
      throw new ApiError(422, 'reason_required', 'This copy may have arrived; give a reason for sending another one');
    }
    const stored: StoredDecision = decision === 'resend' ? 'resend' : 'treat_as_accepted';
    const now = nowUtc(clock);
    const changed = db
      .prepare(
        `UPDATE delivery_attempts SET decision = ?, decision_actor_user_id = ?, decided_at = ?, updated_at = ?
          WHERE id = ? AND user_id = ? AND state = 'uncertain' AND decision IS NULL`,
      )
      .run(stored, user.id, now, now, attemptId, user.id).changes;
    if (changed !== 1) throw new ApiError(409, 'delivery_decision_recorded', 'A decision was already recorded for this delivery attempt');
    let resend: SendResult | null = null;
    if (decision === 'resend') {
      if (current.revisionId === null) throw new ApiError(409, 'delivery_not_resendable', 'This delivery attempt has no revision to resend');
      resend = resendWithin(ctx, current.revisionId, { reason }, current.jobId);
    }
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: 'delivery.decision',
      entityType: 'delivery_attempt',
      entityId: attemptId,
      reason,
      before: { state: current.state, decision: null },
      after: {
        state: current.state,
        decision: stored,
        resend_send_id: resend?.send.id ?? null,
        resend_job_id: resend?.send.jobId ?? null,
      },
    });
    const attempt = loadAttempt(db, user.id, attemptId);
    if (attempt === null) throw notFound('Delivery attempt');
    return { attempt, resend };
  });
}

/* ------------------------------------------------------------------ JSON ---- */

export function sendJson(send: SendRecord) {
  return {
    id: send.id,
    revision_id: send.revisionId,
    send_no: send.sendNo,
    origin: send.origin,
    to: send.to,
    cc: send.cc,
    subject: send.subject,
    body_text: send.bodyText,
    time_rows: send.timeRows,
    ot_rows: send.otRows,
    pdf_variant: send.pdfVariant,
    reason: send.reason,
    job_id: send.jobId,
    created_at: send.createdAt,
  };
}

export function sendResultJson(result: SendResult) {
  return { status: result.status, send: sendJson(result.send), job: { id: result.send.jobId, kind: JOB_SEND_EMAIL } };
}

export function sendDraftJson(draft: SendDraft) {
  return {
    revision_id: draft.revisionId,
    revision_no: draft.revisionNo,
    current: draft.current,
    sender: draft.sender,
    to: draft.envelope.to,
    cc: draft.envelope.cc,
    subject: draft.envelope.subject,
    body_text: draft.envelope.bodyText,
    time_rows: draft.rows.time,
    ot_rows: draft.rows.ot,
    copy_sent_before:
      draft.copySentBefore === null
        ? null
        : { sent_at: draft.copySentBefore.sentAt, to: draft.copySentBefore.to, cc: draft.copySentBefore.cc, state: draft.copySentBefore.state },
    reason_required: draft.copySentBefore !== null,
    previous_send: draft.previous === null ? null : sendJson(draft.previous),
    correction_reason: draft.correctionReason,
  };
}

export function deliveryJson(record: DeliveryRecord) {
  return {
    id: record.id,
    job_id: record.jobId,
    revision_id: record.revisionId,
    revision_no: record.revisionNo,
    payroll_date: record.payrollDate,
    attempt_no: record.attemptNo,
    channel: record.channel,
    to: record.to,
    cc: record.cc,
    subject: record.subject,
    message_id: record.messageId,
    provider_message_id: record.providerMessageId,
    state: record.state,
    provider_response: record.providerResponse,
    accepted_at: record.acceptedAt,
    decision: record.decision,
    decided_at: record.decidedAt,
    decision_required: record.decisionRequired,
    started_at: record.startedAt,
    updated_at: record.updatedAt,
    job: { state: record.job.state, last_error: record.job.lastError },
  };
}

export function decisionJson(result: DecisionResult) {
  return { attempt: deliveryJson(result.attempt), resend: result.resend === null ? null : sendResultJson(result.resend) };
}
