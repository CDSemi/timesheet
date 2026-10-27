import { addDays } from '../../domain/dates.ts';
import { isValidEmailAddress, normalizeRecipients } from '../../domain/emailTemplate.ts';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';
import {
  ApiRequestError,
  type DeliveryAttempt,
  type DeliveryDecisionChoice,
  type DeliveryRecord,
  type FinalizationJob,
  type FinalizationResponse,
  type Period,
  type RecipientAddresses,
  type RevisionListItem,
  type RevisionSummary,
  type SendDraft,
} from '../api.ts';
import { describeError } from './errors.ts';
import { instantText } from './format.ts';
import { type DeliveryStatus, deliveryStatus, periodStatus, type PeriodStatus, type Tone } from './reviewModel.ts';

/*
 * Pure logic of the history and delivery screen (WP3-T13). Every state it words (origin, review
 * state, PDF and delivery state, the fault code) is a field the server sent; nothing here
 * recomputes a minute, a deadline or a state, and nothing reads the device clock or zone. The
 * employee's own screens say "review pending" for an automatic submission: the system tracks that
 * origin, and only the outgoing PDF and email leave the indicator out.
 */

/* ---- PDF state ------------------------------------------------------------------------ */

export type PdfState = 'ready' | 'pending' | 'failed';

/** The PDF state of the current revision, read from its render job. */
export function pdfStateOf(jobs: readonly FinalizationJob[]): PdfState {
  const render = jobs.find((job) => job.kind === 'render_pdf');
  if (render?.state === 'succeeded') return 'ready';
  if (render?.state === 'intervention' || render?.state === 'cancelled') return 'failed';
  return 'pending';
}

const PDF_TEXT: Record<PdfState, string> = {
  ready: 'PDF ready',
  pending: 'PDF is being prepared',
  failed: 'PDF needs attention',
};

export const pdfStateText = (state: PdfState): string => PDF_TEXT[state];

/* ---- Origin and review state -------------------------------------------------------------- */

/** The PDF state the revision list reports for a revision; a missing PDF row is still being prepared. */
export const listedPdfState = (state: RevisionListItem['pdf_state']): PdfState => state ?? 'pending';

export function revisionOriginText(revision: Pick<RevisionSummary, 'revision_kind' | 'origin'>): string {
  if (revision.revision_kind === 'late_review') return 'Automatic submission, reviewed by you later';
  if (revision.revision_kind === 'correction') return 'Correction signed by you';
  return revision.origin === 'deadline' ? 'Submitted automatically' : 'Signed by you';
}

export function revisionReviewText(revision: Pick<RevisionSummary, 'review_state'>): { text: string; tone: Tone } {
  return revision.review_state === 'pending' ? { text: 'Review pending', tone: 'warn' } : { text: 'Signed', tone: 'ok' };
}

/* ---- Delivery attempts ----------------------------------------------------------------------- */

const ATTEMPT_TEXT: Record<DeliveryRecord['state'], string> = {
  preparing: 'Preparing',
  sending: 'Sending',
  accepted: 'Accepted by the mail server',
  failed_temporary: 'Failed, will retry',
  failed_permanent: 'Failed',
  uncertain: 'Uncertain',
};

export const attemptStateText = (state: DeliveryRecord['state']): string => ATTEMPT_TEXT[state];

const DECISION_TEXT: Record<'mark_delivered' | 'resend' | 'abandon', string> = {
  mark_delivered: 'You marked it as delivered',
  resend: 'You chose to resend',
  abandon: 'Given up',
};

export function decisionText(decision: DeliveryRecord['decision']): string | null {
  return decision === null ? null : DECISION_TEXT[decision];
}

const FAULT_CODE = /^[a-z][a-z0-9_]{0,59}$/;
const SMTP_REPLY = /^[2-5][0-9]{2}$/;

/**
 * The redacted fault class of a stored error or provider text, the same rule as the administrator
 * status: its leading lowercase code, or the numeric SMTP reply as `smtp_<reply>`, or
 * `unclassified`. The rest of the text is dropped, so an address or a message never reaches the page.
 */
export function faultCodeOf(text: string | null): string | null {
  if (text === null) return null;
  const token = text.trim().split(/\s+/, 1)[0] ?? '';
  if (FAULT_CODE.test(token)) return token;
  if (SMTP_REPLY.test(token)) return `smtp_${token}`;
  return 'unclassified';
}

/** A fault code for a failed or uncertain attempt only; an accepted attempt shows none. */
export function attemptFault(attempt: Pick<DeliveryRecord, 'state' | 'provider_response' | 'job'>): string | null {
  if (attempt.state !== 'failed_temporary' && attempt.state !== 'failed_permanent' && attempt.state !== 'uncertain') return null;
  return faultCodeOf(attempt.provider_response ?? attempt.job.last_error);
}

/* ---- Revision rows ---------------------------------------------------------------------------- */

/** A pay period of the owner with the finalization state the server reports for it. */
export interface HistoryPeriod {
  period: Pick<Period, 'payroll_date' | 'period_start' | 'period_end'>;
  finalization: FinalizationResponse;
}

export interface RevisionRow {
  key: string;
  revisionId: string;
  payrollDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  revisionNo: number;
  /** True for the period's current (finalized) revision, the only one that can be resent or corrected. */
  current: boolean;
  /** True when a later revision replaced this one (the revision list's supersedes link). */
  superseded: boolean;
  /** The server's revision summary; known for the current revision only (it comes with the finalization). */
  revision: RevisionSummary | null;
  /** The revision list's status row; the source of every other revision's origin, review state and PDF. */
  listed: RevisionListItem | null;
  signoff: FinalizationResponse['signoff'];
  pdf: PdfState;
  jobs: FinalizationJob[];
  /** Newest first, as the server sends them. */
  attempts: DeliveryRecord[];
  /** The frozen envelope of the newest attempt; null before any attempt. */
  recipients: RecipientAddresses | null;
}

const recipientsOf = (attempts: readonly DeliveryRecord[]): RecipientAddresses | null => {
  const newest = attempts[0];
  return newest === undefined ? null : { to: newest.to, cc: newest.cc };
};

/** The revisions of loaded windows: those whose payroll date is on or after `since` (no upper bound). */
export function revisionsSince(revisions: readonly RevisionListItem[], since: string): RevisionListItem[] {
  return revisions.filter((item) => item.payroll_date >= since);
}

/** Origin of a row in words, from the finalization summary when known, else from the revision list. */
export function rowOrigin(row: RevisionRow): string | null {
  const source = row.revision ?? row.listed;
  return source === null ? null : revisionOriginText(source);
}

/** Review state of a row in words, from the finalization summary when known, else from the revision list. */
export function rowReview(row: RevisionRow): { text: string; tone: Tone } | null {
  const source = row.revision ?? row.listed;
  return source === null ? null : revisionReviewText(source);
}

/**
 * The owner's revisions as list rows: every revision `GET /api/revisions` lists (the caller passes
 * the ones in the loaded windows), newest period first. A period's current revision is enriched from
 * its finalization (jobs, sign-off, correction reason); every other revision, superseded or not,
 * takes its origin, review state and PDF state from the list itself. Delivery attempts attach by
 * revision id; they never create a row.
 */
export function buildRevisionRows(
  periods: readonly HistoryPeriod[],
  deliveries: readonly DeliveryRecord[],
  revisions: readonly RevisionListItem[],
): RevisionRow[] {
  const rows: RevisionRow[] = [];
  const shown = new Set<string>();
  const listedById = new Map(revisions.map((item) => [item.id, item]));
  const supersededIds = new Set(revisions.flatMap((item) => (item.supersedes_revision_id === null ? [] : [item.supersedes_revision_id])));
  const byRevision = (revisionId: string) => deliveries.filter((item) => item.revision_id === revisionId);
  const periodOf = (payrollDate: string) => periods.find((item) => item.period.payroll_date === payrollDate)?.period ?? null;

  for (const { period, finalization } of periods) {
    const revision = finalization.revision;
    if (revision === null || finalization.finalized_revision_no === null) continue;
    const attempts = byRevision(revision.id);
    shown.add(revision.id);
    rows.push({
      key: revision.id,
      revisionId: revision.id,
      payrollDate: period.payroll_date,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      revisionNo: revision.revision_no,
      current: true,
      superseded: false,
      revision,
      listed: listedById.get(revision.id) ?? null,
      signoff: finalization.signoff,
      pdf: pdfStateOf(finalization.jobs),
      jobs: finalization.jobs,
      attempts,
      recipients: recipientsOf(attempts),
    });
  }

  for (const item of revisions) {
    if (shown.has(item.id)) continue;
    shown.add(item.id);
    const attempts = byRevision(item.id);
    const window = periodOf(item.payroll_date);
    rows.push({
      key: item.id,
      revisionId: item.id,
      payrollDate: item.payroll_date,
      periodStart: window?.period_start ?? null,
      periodEnd: window?.period_end ?? null,
      revisionNo: item.revision_no,
      current: false,
      superseded: supersededIds.has(item.id),
      revision: null,
      listed: item,
      signoff: null,
      pdf: listedPdfState(item.pdf_state),
      jobs: [],
      attempts,
      recipients: recipientsOf(attempts),
    });
  }

  return rows.sort((a, b) => b.payrollDate.localeCompare(a.payrollDate) || Number(b.current) - Number(a.current) || b.revisionNo - a.revisionNo);
}

/* ---- Resend and the uncertain decision ----------------------------------------------------- */

export interface ResendState {
  /** Whether the row offers a resend at all (the current revision only). */
  available: boolean;
  enabled: boolean;
  /** Why it is disabled, in words; null when enabled or unavailable. */
  reason: string | null;
}

/** Mirrors the server's refusals (docs/05), so the button says why it waits before a request is made. */
export function resendState(row: RevisionRow): ResendState {
  if (!row.current) return { available: false, enabled: false, reason: null };
  const wait = (reason: string): ResendState => ({ available: true, enabled: false, reason });
  if (row.pdf !== 'ready') return wait('The PDF is not ready yet.');
  if (row.attempts.some((item) => item.decision_required)) return wait('Decide on the uncertain delivery first.');
  const running = row.attempts.some((item) => item.state === 'preparing' || item.state === 'sending');
  const waiting = row.jobs.some((item) => item.kind === 'send_email' && (item.state === 'queued' || item.state === 'leased'));
  if (running || waiting) return wait('A delivery of this revision is in progress.');
  return { available: true, enabled: true, reason: null };
}

/** The attempt that still needs the owner's decision (uncertain, none recorded), or null. */
export function pendingDecision(row: RevisionRow): DeliveryRecord | null {
  return row.attempts.find((item) => item.decision_required) ?? null;
}

export type DeliveryAction = DeliveryDecisionChoice | 'resend_uncertain' | 'resend';

export interface Confirmation {
  action: DeliveryAction;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** True when the server's reason rule applies (B-A2): a copy of the period already counts as sent. */
  reasonRequired: boolean;
}

/** The owner's reason for another copy: 2-500 characters (the server checks the exact rule). */
export const MIN_COPY_REASON = 2;
export const MAX_COPY_REASON = 500;

/**
 * Whether a copy of the row's period already counts as sent (B-A2, mirrored from the server, which decides): an attempt
 * of any revision of the same payroll date was accepted or is uncertain, whatever was decided later.
 */
export function copyCounts(row: Pick<RevisionRow, 'payrollDate'>, deliveries: readonly DeliveryRecord[]): boolean {
  return deliveries.some((item) => item.payroll_date === row.payrollDate && (item.state === 'accepted' || item.state === 'uncertain'));
}

/** The reason field's problem in words, or null when the text can be sent. */
export function copyReasonProblem(text: string): string | null {
  const length = [...text.trim()].length;
  if (length === 0) return 'Give the reason for sending another copy.';
  if (length < MIN_COPY_REASON || length > MAX_COPY_REASON) return `The reason must have ${MIN_COPY_REASON} to ${MAX_COPY_REASON} characters.`;
  return null;
}

function recipientsText(recipients: RecipientAddresses | null): string {
  if (recipients === null) return 'your saved recipients';
  const to = recipients.to.length === 0 ? 'no one' : recipients.to.join(', ');
  return recipients.cc.length === 0 ? to : `${to} (copy: ${recipients.cc.join(', ')})`;
}

/**
 * What the owner is asked to confirm before a decision or a resend is sent. Marking as delivered
 * changes no mail; a resend names the recipients and the double-delivery risk of an uncertain attempt.
 * Once a copy counts as sent (`copySent`), another copy needs a typed reason (owner decision F-4,
 * B-A2); an uncertain attempt always counts, so its resend always asks for one.
 */
export function confirmationFor(action: DeliveryAction, recipients: RecipientAddresses | null, copySent = false): Confirmation {
  const cancelLabel = 'Cancel';
  const reasonNote = ' Give a reason: it is kept with the send and in your history, and it is not added to the email.';
  switch (action) {
    case 'mark_delivered':
      return {
        action,
        title: 'Mark as delivered?',
        message:
          'Choose this only if you know the recipients received the email. The attempt stays recorded as uncertain with your decision, and nothing is sent.',
        confirmLabel: 'Mark as delivered',
        cancelLabel,
        reasonRequired: false,
      };
    case 'resend_uncertain':
      return {
        action,
        title: 'Resend the same PDF?',
        message: `The same PDF and message go to ${recipientsText(recipients)}. If the first attempt did arrive, the recipients may receive it twice.${reasonNote}`,
        confirmLabel: 'Resend now',
        cancelLabel,
        reasonRequired: true,
      };
    default:
      return copySent
        ? {
            action: 'resend',
            title: 'Send another copy?',
            message: `A copy of this period was already sent. Another copy sends the same PDF and message to ${recipientsText(recipients)}. No revision, sign-off or OT balance changes.${reasonNote}`,
            confirmLabel: 'Send another copy',
            cancelLabel,
            reasonRequired: true,
          }
        : {
            action: 'resend',
            title: 'Send this revision again?',
            message: `A new delivery attempt sends the same PDF to ${recipientsText(recipients)}. No revision, sign-off or OT balance changes.`,
            confirmLabel: 'Send again',
            cancelLabel,
            reasonRequired: false,
          };
  }
}

const codeOf = (caught: unknown): string | null => (caught instanceof ApiRequestError ? caught.code : null);

/** A refused decision in words; the list is reloaded after every refusal. */
export function decisionFailureText(caught: unknown): string {
  switch (codeOf(caught)) {
    case 'delivery_decision_recorded':
      return 'A decision was already recorded for this attempt. The list was refreshed.';
    case 'delivery_not_uncertain':
      return 'This attempt is no longer uncertain, so it takes no decision. The list was refreshed.';
    case 'delivery_not_resendable':
      return 'This attempt has no revision to resend.';
    case 'reason_required':
      return 'This copy may have arrived. Give the reason for sending another one.';
    case 'invalid_reason':
      return `The reason must have ${MIN_COPY_REASON} to ${MAX_COPY_REASON} characters without control characters.`;
    case 'not_found':
      return 'That delivery attempt could not be found. The list was refreshed.';
    default:
      return describeError(caught);
  }
}

/** A refused resend in words. */
export function resendFailureText(caught: unknown): string {
  switch (codeOf(caught)) {
    case 'delivery_uncertain':
      return 'A delivery attempt is uncertain. Record your decision on it before you resend.';
    case 'delivery_in_progress':
      return 'A delivery of this period is already in progress.';
    case 'pdf_not_ready':
      return 'The PDF of this revision is not ready yet.';
    case 'revision_superseded':
      return 'A newer revision exists, so only that one can be resent. The list was refreshed.';
    case 'envelope_changed':
      return 'The recipients or template differ from this revision. Record a correction instead.';
    case 'reason_required':
      return 'A copy of this period was already sent. Give the reason for sending another one.';
    case 'invalid_reason':
      return `The reason must have ${MIN_COPY_REASON} to ${MAX_COPY_REASON} characters without control characters.`;
    case 'recipients_required':
      return 'No recipient is set. Add one in Settings, then send again.';
    default:
      return describeError(caught);
  }
}

/** The entry point to a reasoned correction (the review screen asks for the reason); null for an earlier revision. */
export function correctionLinkLabel(row: RevisionRow): string | null {
  if (!row.current || row.revision === null) return null;
  return row.revision.origin === 'deadline' && row.revision.review_state === 'pending' ? 'Review now' : 'Correct this period';
}

/* ---- Period status next to the timesheet grid ------------------------------------------------- */

export interface GridStatus {
  review: PeriodStatus;
  delivery: DeliveryStatus | null;
  pdf: PdfState | null;
  revisionNo: number | null;
  /** True once a revision exists, so the history has something to show. */
  submitted: boolean;
}

/** Review, PDF and delivery state of a period, from the finalization and delivery fields only. */
export function gridStatus(state: { finalization: FinalizationResponse; attempts: readonly DeliveryAttempt[] }): GridStatus {
  const { finalization, attempts } = state;
  const revision = finalization.revision;
  const submitted = revision !== null && finalization.finalized_revision_no !== null;
  return {
    review: periodStatus(finalization),
    delivery: deliveryStatus(revision, finalization.jobs, attempts),
    pdf: submitted ? pdfStateOf(finalization.jobs) : null,
    revisionNo: submitted ? revision.revision_no : null,
    submitted,
  };
}

/* ---- Windows and file names --------------------------------------------------------------------- */

/** About half a year of periods per page of history. */
const WINDOW_DAYS = 182;

/** The `index`-th window walking back from the end of the current period; windows never overlap. */
export function historyWindow(currentPeriodEnd: string, index: number): { from: string; to: string } {
  const to = addDays(currentPeriodEnd, -WINDOW_DAYS * index);
  return { from: addDays(to, -(WINDOW_DAYS - 1)), to };
}

/* ---- The Send card (WP5-UX5-T03) -------------------------------------------------------------------- */

/**
 * What the Send card holds for one send: the envelope as typed (addresses one per line, or separated by commas, semicolons or
 * spaces), the subject, the message body and the two PDF row switches. The defaults come from Settings (the send draft); each send
 * may change them, and the signed timesheet never changes (owner decisions F-3 b and F-4).
 */
export interface SendForm {
  to: string;
  cc: string;
  subject: string;
  body: string;
  time: boolean;
  ot: boolean;
}

export const MAX_SEND_SUBJECT = 300;
export const MAX_SEND_BODY = 20_000;

const addressesText = (list: readonly string[]): string => list.join(', ');

/** The defaults of a revision's send: the envelope and both switches the server proposed (Settings). */
export function sendFormFromDraft(draft: Pick<SendDraft, 'to' | 'cc' | 'subject' | 'body_text' | 'time_rows' | 'ot_rows'>): SendForm {
  return { to: addressesText(draft.to), cc: addressesText(draft.cc), subject: draft.subject, body: draft.body_text, time: draft.time_rows, ot: draft.ot_rows };
}

/**
 * The defaults before the sign-off, when no revision (and so no send draft) exists yet: the envelope the review payload renders
 * from the same Settings templates, the OT switch of the payload and the Settings default of the time switch.
 */
export function sendFormFromReview(recipients: Pick<ReviewSnapshot['recipients'], 'to' | 'cc' | 'subject' | 'body_text'>, rows: { time: boolean; ot: boolean }): SendForm {
  return { to: addressesText(recipients.to), cc: addressesText(recipients.cc), subject: recipients.subject, body: recipients.body_text, time: rows.time, ot: rows.ot };
}

export const sameSendForm = (a: SendForm, b: SendForm): boolean =>
  a.to === b.to && a.cc === b.cc && a.subject === b.subject && a.body === b.body && a.time === b.time && a.ot === b.ot;

export interface SendProblem {
  field: 'to' | 'cc' | 'subject' | 'body';
  message: string;
}

function addressesOf(text: string): string[] {
  return text.split(/[\s,;]+/).filter((item) => item !== '');
}

/** The problems of the typed envelope in words, the same rules the server applies (it stays the authority). */
export function sendProblems(form: SendForm): SendProblem[] {
  const problems: SendProblem[] = [];
  const to = addressesOf(form.to);
  const cc = addressesOf(form.cc);
  const badTo = to.find((item) => !isValidEmailAddress(item));
  const badCc = cc.find((item) => !isValidEmailAddress(item));
  if (to.length === 0) problems.push({ field: 'to', message: 'Enter at least one recipient address.' });
  else if (badTo !== undefined) problems.push({ field: 'to', message: `The recipient address "${badTo}" is not a valid email address.` });
  if (badCc !== undefined) problems.push({ field: 'cc', message: `The copy address "${badCc}" is not a valid email address.` });
  if (to.length > 0 && badTo === undefined && badCc === undefined) {
    try {
      normalizeRecipients(to, cc);
    } catch (caught) {
      problems.push({ field: 'to', message: caught instanceof Error ? caught.message : 'The recipients cannot be used.' });
    }
  }
  const subject = form.subject.normalize('NFC').trim();
  if (subject === '') problems.push({ field: 'subject', message: 'Enter a subject.' });
  else if ([...subject].length > MAX_SEND_SUBJECT || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(subject)) {
    problems.push({ field: 'subject', message: `The subject must be one line of at most ${MAX_SEND_SUBJECT} characters.` });
  }
  if (form.body.trim() === '') problems.push({ field: 'body', message: 'Enter the message.' });
  else if ([...form.body].length > MAX_SEND_BODY) problems.push({ field: 'body', message: `The message must have at most ${MAX_SEND_BODY} characters.` });
  return problems;
}

/** The body of POST /api/revisions/:id/send for exactly what the card shows; `reason` only when the owner gave one. */
export function buildSendRequest(form: SendForm, requestKey: string, reason: string | null): Record<string, unknown> {
  return {
    request_key: requestKey,
    to: addressesOf(form.to),
    cc: addressesOf(form.cc),
    subject: form.subject.trim(),
    body_text: form.body,
    time_rows: form.time,
    ot_rows: form.ot,
    ...(reason === null ? {} : { reason }),
  };
}

/**
 * The attempt key of one send: the same while the same revision, envelope, switches and reason are retried (a lost response
 * replays, it is never a second send), and a different one as soon as anything differs.
 */
export function sendAttemptSignature(revisionId: string, form: SendForm, reason: string | null): string {
  return JSON.stringify([revisionId, form, reason]);
}

export type SendCardMode = 'sign_first' | 'send' | 'another_copy' | 'locked';

export interface SendCardState {
  mode: SendCardMode;
  /** The Send button's words. */
  label: string;
  /** Why the button is disabled, in words; null when it is enabled. */
  hint: string | null;
}

/**
 * Which Send button the card shows. Before the sign-off it is disabled and says "Sign off first"; once a copy of the period counts
 * as sent it reads "Send another copy..." and asks for the owner's reason first (B-A2). An imported period, a shared view and a
 * superseded revision have none.
 */
export function sendCardState(input: { signed: boolean; imported: boolean; current: boolean; copySentBefore: boolean }): SendCardState {
  if (input.imported) return { mode: 'locked', label: 'Send', hint: 'An imported period is history and cannot be sent.' };
  if (!input.signed) return { mode: 'sign_first', label: 'Send', hint: 'Sign off first' };
  if (!input.current) return { mode: 'locked', label: 'Send', hint: 'A newer revision exists; only the current revision can be sent.' };
  return input.copySentBefore ? { mode: 'another_copy', label: 'Send another copy...', hint: null } : { mode: 'send', label: 'Send', hint: null };
}

/** The earlier copy the reason dialog names: when it went, to whom and how it ended. */
export function earlierCopyText(copy: NonNullable<SendDraft['copy_sent_before']>, zone: string): string {
  const to = copy.to.length === 0 ? 'no one' : copy.to.join(', ');
  const state = copy.state === 'accepted' ? 'was accepted by the mail server' : 'may have arrived (the delivery is recorded as uncertain)';
  return `An earlier copy went to ${to}${copy.cc.length === 0 ? '' : ` (copy: ${copy.cc.join(', ')})`} on ${instantText(copy.sent_at, zone)} and ${state}.`;
}

export type SendFailure =
  | { kind: 'reason'; message: string }
  | { kind: 'field'; field: SendProblem['field']; message: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'other'; message: string };

/**
 * A refused send in words. A 422 `reason_required` opens the reason dialog; a field code marks its field; a 409 (an attempt is open or
 * uncertain, a send job is waiting, the revision was superseded) says so and is never retried blindly.
 */
export function sendFailure(caught: unknown): SendFailure {
  if (!(caught instanceof ApiRequestError)) return { kind: 'other', message: describeError(caught) };
  switch (caught.code) {
    case 'reason_required':
      return { kind: 'reason', message: 'A copy of this period was already sent. Give the reason for sending another one.' };
    case 'invalid_reason':
      return { kind: 'reason', message: `The reason must have ${MIN_COPY_REASON} to ${MAX_COPY_REASON} characters without control characters.` };
    case 'recipients_required':
      return { kind: 'field', field: 'to', message: 'Enter at least one recipient address.' };
    case 'invalid_subject':
      return { kind: 'field', field: 'subject', message: `The subject must be one line of at most ${MAX_SEND_SUBJECT} characters.` };
    case 'invalid_body':
      return { kind: 'field', field: 'body', message: `The message must have 1 to ${MAX_SEND_BODY} characters without control characters.` };
    case 'delivery_in_progress':
      return { kind: 'conflict', message: 'A delivery of this period is already in progress or waiting. Nothing was sent again; follow it in History.' };
    case 'delivery_uncertain':
      return { kind: 'conflict', message: 'A delivery attempt of this revision is uncertain. Record your decision on it in History before you send again.' };
    case 'revision_superseded':
      return { kind: 'conflict', message: 'A newer revision exists, so only that one can be sent. The page was refreshed.' };
    case 'request_key_reused':
      return { kind: 'conflict', message: 'This send was already recorded with different values. Nothing was sent again; check History.' };
    default:
      return caught.status === 409 ? { kind: 'conflict', message: describeError(caught) } : { kind: 'other', message: describeError(caught) };
  }
}

const SAFE_PDF_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}\.pdf$/;

/** The saved file name from a Content-Disposition header; anything unexpected becomes `timesheet.pdf`. */
export function filenameFromDisposition(header: string | null): string {
  const name = header === null ? undefined : /filename="([^"]*)"/.exec(header)?.[1];
  return name !== undefined && SAFE_PDF_NAME.test(name) ? name : 'timesheet.pdf';
}
