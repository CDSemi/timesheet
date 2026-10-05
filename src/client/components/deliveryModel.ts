import { addDays } from '../../domain/dates.ts';
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
} from '../api.ts';
import { describeError } from './errors.ts';
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
}

function recipientsText(recipients: RecipientAddresses | null): string {
  if (recipients === null) return 'your saved recipients';
  const to = recipients.to.length === 0 ? 'no one' : recipients.to.join(', ');
  return recipients.cc.length === 0 ? to : `${to} (copy: ${recipients.cc.join(', ')})`;
}

/**
 * What the owner is asked to confirm before a decision or a resend is sent. Marking as delivered
 * changes no mail; a resend names the recipients and the double-delivery risk of an uncertain attempt.
 */
export function confirmationFor(action: DeliveryAction, recipients: RecipientAddresses | null): Confirmation {
  const cancelLabel = 'Cancel';
  switch (action) {
    case 'mark_delivered':
      return {
        action,
        title: 'Mark as delivered?',
        message:
          'Choose this only if you know the recipients received the email. The attempt stays recorded as uncertain with your decision, and nothing is sent.',
        confirmLabel: 'Mark as delivered',
        cancelLabel,
      };
    case 'resend_uncertain':
      return {
        action,
        title: 'Resend the same PDF?',
        message: `The same PDF and message go to ${recipientsText(recipients)}. If the first attempt did arrive, the recipients may receive it twice.`,
        confirmLabel: 'Resend now',
        cancelLabel,
      };
    default:
      return {
        action: 'resend',
        title: 'Send this revision again?',
        message: `A new delivery attempt sends the same PDF to ${recipientsText(recipients)}. No revision, sign-off or OT balance changes.`,
        confirmLabel: 'Send again',
        cancelLabel,
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
      return 'A delivery of this revision is already in progress.';
    case 'pdf_not_ready':
      return 'The PDF of this revision is not ready yet.';
    case 'revision_superseded':
      return 'A newer revision exists, so only that one can be resent. The list was refreshed.';
    case 'envelope_changed':
      return 'The recipients or template differ from this revision. Record a correction instead.';
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

const SAFE_PDF_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}\.pdf$/;

/** The saved file name from a Content-Disposition header; anything unexpected becomes `timesheet.pdf`. */
export function filenameFromDisposition(header: string | null): string {
  const name = header === null ? undefined : /filename="([^"]*)"/.exec(header)?.[1];
  return name !== undefined && SAFE_PDF_NAME.test(name) ? name : 'timesheet.pdf';
}
