import { isCivilDate, isoWeekday } from '../../domain/dates.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import type {
  ReviewSnapshot,
  SnapshotDay,
  SnapshotDeficitProposal,
  SnapshotReservation,
  SnapshotSession,
  SnapshotUnresolved,
} from '../../domain/snapshot.ts';
import { formatHoursMinutes } from '../../domain/format.ts';
import { formatInZone } from '../../domain/zones.ts';
import {
  ApiRequestError,
  type DeliveryAttempt,
  type FinalizationJob,
  type FinalizationResponse,
  type ReviewResponse,
  type RevisionSummary,
} from '../api.ts';
import { describeError } from './errors.ts';
import { WEEKDAYS } from './dayModel.ts';
import { minutesText, usDate, usShortDate } from './format.ts';
import { breaksNote, hm, NO_TIMES_TEXT, type SheetCheck, type SheetDay, type SheetOt, type SheetWeek, sessionRange, sheetLabel, weeksOf } from './sheetModel.ts';

/*
 * Pure logic for the review and sign-off screen. Every business value on that screen (minutes,
 * credits, deficits, balances, recipients, the rendered email) comes from the server's review
 * payload and is only worded here. Nothing in this module adds, rounds or recomputes a minute
 * count, and nothing reads the device clock or the device zone.
 */

/* ---- Deep link ---------------------------------------------------------------- */

const REVIEW_PREFIX = '#/review/';

/** The address of a review. It carries a payroll date and nothing else (no token, no id). */
export function reviewHash(payrollDate: string): string {
  return `${REVIEW_PREFIX}${payrollDate}`;
}

/** The payroll date of a `#/review/{date}` hash; null for anything that is not exactly that. */
export function parseReviewHash(hash: string): string | null {
  if (!hash.startsWith(REVIEW_PREFIX)) return null;
  const date = hash.slice(REVIEW_PREFIX.length);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && isCivilDate(date) ? date : null;
}

/* ---- What the sign-off does ----------------------------------------------------- */

/**
 * `signoff`: the first sign-off of a period. `late_review`: the owner's review of an automatic
 * submission (zero ledger change). `correction`: a reasoned new revision of a signed period.
 */
export type ReviewMode = 'signoff' | 'late_review' | 'correction';

export function reviewMode(revision: Pick<RevisionSummary, 'origin' | 'review_state'> | null): ReviewMode {
  if (revision === null) return 'signoff';
  return revision.origin === 'deadline' && revision.review_state === 'pending' ? 'late_review' : 'correction';
}

export function modeEndpoint(mode: ReviewMode, payrollDate: string): string {
  const base = `/api/timesheets/${payrollDate}`;
  if (mode === 'signoff') return `${base}/signoff`;
  return mode === 'late_review' ? `${base}/late-review` : `${base}/revisions`;
}

/* ---- The sign-off form ------------------------------------------------------------ */

export type DeficitChoice = 'deduct' | 'waive';

/*
 * The signer is the signed-in person (owner decision F-5 b): the server records the account's display name, so the
 * form has no name field, and the saved signature image is optional (its absence is a hint, not a blocker). Signing never
 * sends (WP5-UX5-T01b), so the form has no email choice either: the Send card sends, with its own reason rule (B-A2).
 */
export interface FormState {
  acknowledged: boolean;
  /** One choice per choose-mode deficit day, keyed by work date. */
  choices: Readonly<Record<string, DeficitChoice>>;
  /** The reason of a correction revision (correction mode only). */
  reason: string;
}

export type FieldKey = 'acknowledgement' | 'deficit_choices' | 'reason';

export interface Blocker {
  field: FieldKey;
  message: string;
}

const MAX_REASON = 2000;

/** Days with a deficit that the employee decides at sign-off. */
export function deficitChoiceDays(payload: ReviewSnapshot): SnapshotDeficitProposal[] {
  return payload.deficit_proposals.filter((item) => item.mode === 'choose_at_signoff');
}

/** What is still missing before the sign-off can be sent, in the order the form shows it. */
export function submitBlockers(payload: ReviewSnapshot, mode: ReviewMode, form: FormState): Blocker[] {
  const blockers: Blocker[] = [];
  if (payload.unresolved_inputs.length > 0 && !form.acknowledged) {
    blockers.push({ field: 'acknowledgement', message: 'Acknowledge the incomplete evidence to submit with it.' });
  }
  const missing = deficitChoiceDays(payload).filter((item) => form.choices[item.work_date] === undefined);
  if (missing.length > 0) {
    blockers.push({ field: 'deficit_choices', message: `Choose deduct or waive for ${missing.map((item) => item.work_date).join(', ')}.` });
  }
  if (mode === 'correction') {
    const reason = form.reason.trim();
    if (reason === '') blockers.push({ field: 'reason', message: 'Give the reason for this correction.' });
    else if (reason.length > MAX_REASON) blockers.push({ field: 'reason', message: `The reason must be at most ${MAX_REASON} characters.` });
  }
  return blockers;
}

/**
 * The request body: bound to the hash and the version of the review the person saw. Choices
 * are sent only for days that are choose-mode days in that review, in date order. Signing never sends
 * (WP5-UX5-T01b), so a correction or a late review always says `send_email: false`; the Send card sends.
 */
export function buildSubmitBody(review: ReviewResponse, mode: ReviewMode, form: FormState): Record<string, unknown> {
  const days = deficitChoiceDays(review.payload)
    .map((item) => item.work_date)
    .sort();
  const body: Record<string, unknown> = {
    expected_version: review.expected_version,
    reviewed_hash: review.payload_hash,
    deficit_choices: days.flatMap((workDate) => {
      const choice = form.choices[workDate];
      return choice === undefined ? [] : [{ work_date: workDate, choice }];
    }),
    incomplete_evidence_acknowledged: review.payload.unresolved_inputs.length > 0 && form.acknowledged,
  };
  if (mode === 'correction') body.reason = form.reason.trim();
  if (mode !== 'signoff') body.send_email = false;
  return body;
}

/** After a stale review the acknowledgement and choices belonged to the old content; typed text stays. */
export function resetAfterStale(form: FormState): FormState {
  return { ...form, acknowledged: false, choices: {} };
}

/* ---- Refusals ------------------------------------------------------------------------ */

export type SubmitFailure =
  | { kind: 'stale'; message: string }
  | { kind: 'field'; field: FieldKey; message: string }
  | { kind: 'refused'; message: string }
  | { kind: 'other'; message: string };

const STALE_MESSAGE =
  'The timesheet or the review changed after you opened it. Nothing was submitted. The review below is up to date: check it and sign off again.';

const FIELD_FOR_CODE: Record<string, { field: FieldKey; message: string }> = {
  acknowledgement_required: { field: 'acknowledgement', message: 'Acknowledge the incomplete evidence to submit with it.' },
  deficit_choice_required: { field: 'deficit_choices', message: 'Choose deduct or waive for every deficit day.' },
  unexpected_deficit_choice: { field: 'deficit_choices', message: 'A deficit choice no longer applies. Review the choices again.' },
  duplicate_deficit_choice: { field: 'deficit_choices', message: 'Each deficit day takes one choice.' },
  reason_required: { field: 'reason', message: 'Give the reason for this correction.' },
  invalid_reason: { field: 'reason', message: 'The reason is too long.' },
};

/**
 * Turns a failed submit into what the screen does next. A 409 about the version, the reviewed
 * hash or the period state means the review is out of date: reload it, never retry blindly. A 422
 * names the field that is missing.
 */
export function classifySubmitError(caught: unknown): SubmitFailure {
  if (!(caught instanceof ApiRequestError)) return { kind: 'other', message: describeError(caught) };
  if (caught.status === 409) {
    if (caught.code === 'already_finalized') {
      return { kind: 'stale', message: 'This period was already submitted, in another window or automatically. Nothing was submitted twice. The review below is up to date.' };
    }
    if (['stale_version', 'stale_review', 'not_finalized', 'no_pending_review'].includes(caught.code)) {
      return { kind: 'stale', message: STALE_MESSAGE };
    }
    if (caught.code === 'content_changed') {
      return { kind: 'refused', message: 'The content differs from the automatic submission. Record it as a correction with a reason instead.' };
    }
  }
  if (caught.status === 422) {
    const field = FIELD_FOR_CODE[caught.code];
    if (field !== undefined) return { kind: 'field', ...field };
  }
  return { kind: 'other', message: describeError(caught) };
}

/* ---- Status from server fields -------------------------------------------------------- */

export type Tone = 'neutral' | 'ok' | 'warn' | 'error';

export type PeriodStatusKey = 'draft' | 'signed' | 'submitted_manual' | 'submitted_auto_pending' | 'reviewed_late' | 'corrected';

export interface PeriodStatus {
  key: PeriodStatusKey;
  text: string;
  tone: Tone;
}

/**
 * Review status of a period, from the finalization fields the server returns. A period counts as submitted once a send exists
 * (owner decision H-1 a): a manual revision whose send job is not there yet is only "Signed", and the delivery chip says "Not sent
 * yet". Callers that pass no `jobs` (a status read that has no job list) get the submitted words, as before.
 */
export function periodStatus(finalization: Pick<FinalizationResponse, 'finalized_revision_no' | 'revision'> & { jobs?: readonly FinalizationJob[] }): PeriodStatus {
  const revision = finalization.revision;
  if (revision === null || finalization.finalized_revision_no === null) return { key: 'draft', text: 'Draft', tone: 'neutral' };
  if (revision.revision_kind === 'correction') return { key: 'corrected', text: `Corrected (revision ${revision.revision_no})`, tone: 'ok' };
  if (revision.revision_kind === 'late_review') return { key: 'reviewed_late', text: 'Submitted automatically, reviewed by you later', tone: 'ok' };
  if (revision.origin === 'deadline' && revision.review_state === 'pending') {
    return { key: 'submitted_auto_pending', text: 'Submitted automatically, review pending', tone: 'warn' };
  }
  if (finalization.jobs !== undefined && !finalization.jobs.some((job) => job.kind === 'send_email')) return { key: 'signed', text: 'Signed', tone: 'ok' };
  return { key: 'submitted_manual', text: 'Submitted manually', tone: 'ok' };
}

/** The wording of the link from the timesheet to the review, by period status. */
export function reviewLinkLabel(status: PeriodStatus | null): string {
  switch (status?.key) {
    case 'submitted_auto_pending':
      return 'Review now';
    case 'signed':
    case 'submitted_manual':
    case 'reviewed_late':
    case 'corrected':
      return 'Review or correct';
    default:
      return 'Review & sign off';
  }
}

/** True when a period's last day is before today's accounting date (both `YYYY-MM-DD`; `todayLocal` is the server's `today_local`, never the device clock). */
export function periodEnded(periodEnd: string, todayLocal: string | null): boolean {
  return todayLocal !== null && periodEnd < todayLocal;
}

/**
 * True when any revision of the period has a send (owner decision H-1 a), from server fields only: a send job or a delivery attempt
 * of the current revision, or a delivery attempt of an earlier revision (`earlierSend`, from the revision list). A send that is queued
 * for an earlier revision and has no attempt yet is not visible to the client.
 */
export function periodHasSend(finalization: Pick<FinalizationResponse, 'jobs'>, attempts: readonly unknown[], earlierSend: boolean): boolean {
  return earlierSend || attempts.length > 0 || finalization.jobs.some((job) => job.kind === 'send_email');
}

/** The review link of the period card: its words, and whether it is the primary button. */
export interface ReviewLinkView {
  label: string;
  primary: boolean;
}

/**
 * The review link of the period card (U5-14, owner answers F-2 a and H-1 a). It is the primary button while the shown period is the
 * person's own, ended (`ended`: its last day is before today's accounting date), not imported, and still needs the person:
 * - no revision yet (draft): "Review & sign off";
 * - an automatic revision with the review pending: "Review now";
 * - signed and no revision of the period has a send yet: "Review & send".
 * Once any revision has a send (`sendExists`) it is the quiet link "Review or correct", also for a later signed correction that is not
 * sent yet (the Review page's Send card still offers that send). A future or in-progress period, and a state that did not load, keep
 * the quiet link. The caller handles a shared view (no link) and an imported period (a disabled link).
 */
export function reviewLinkView(input: { status: PeriodStatus | null; sendExists: boolean; ended: boolean }): ReviewLinkView {
  const { status, sendExists, ended } = input;
  if (status === null) return { label: 'Review & sign off', primary: false };
  switch (status.key) {
    case 'draft':
      return { label: 'Review & sign off', primary: ended };
    case 'submitted_auto_pending':
      return { label: 'Review now', primary: ended };
    case 'submitted_manual':
      return { label: 'Review or correct', primary: false };
    default:
      return sendExists ? { label: 'Review or correct', primary: false } : { label: 'Review & send', primary: ended };
  }
}

export type DeliveryKey =
  | 'not_sent'
  | 'queued'
  | 'attention'
  | 'sending'
  | 'accepted'
  | 'retrying'
  | 'failed'
  | 'uncertain'
  | 'marked_delivered';

export interface DeliveryStatus {
  key: DeliveryKey;
  text: string;
  tone: Tone;
}

/**
 * Delivery state of a revision's email. The newest attempt decides; before any attempt exists the
 * send job's state does, and a revision without a send job is "Not sent yet" (signing never sends,
 * WP5-UX5-T01b: the owner sends separately).
 */
export function deliveryStatus(
  revision: Pick<RevisionSummary, 'id'> | null,
  jobs: readonly FinalizationJob[],
  attempts: readonly DeliveryAttempt[],
): DeliveryStatus | null {
  if (revision === null) return null;
  const latest = attempts[0];
  if (latest !== undefined) {
    switch (latest.state) {
      case 'accepted':
        return { key: 'accepted', text: 'Email accepted by the mail server', tone: 'ok' };
      case 'preparing':
      case 'sending':
        return { key: 'sending', text: 'Email is being sent', tone: 'neutral' };
      case 'failed_temporary':
        return { key: 'retrying', text: 'Delivery failed, retrying', tone: 'warn' };
      case 'failed_permanent':
        return { key: 'failed', text: 'Delivery failed', tone: 'error' };
      case 'uncertain':
        return latest.decision_required
          ? { key: 'uncertain', text: 'Delivery uncertain: your decision is needed', tone: 'warn' }
          : { key: 'marked_delivered', text: 'Delivery uncertain, decision recorded', tone: 'neutral' };
    }
  }
  const sends = jobs.filter((job) => job.kind === 'send_email');
  if (sends.length === 0) return { key: 'not_sent', text: 'Not sent yet', tone: 'neutral' };
  // The server lists a revision's jobs oldest first within a kind: the last send job is the newest send.
  if (sends.at(-1)?.state === 'intervention') return { key: 'attention', text: 'Email needs attention', tone: 'error' };
  return { key: 'queued', text: 'Email queued', tone: 'neutral' };
}

/* ---- Content wording ------------------------------------------------------------------ */

/** Unconsumed OT-leave reservations whose use is due (E-3: recording the use is the employee's own action). */
export function dueReservations(payload: ReviewSnapshot): SnapshotReservation[] {
  return payload.ot_leave_reservations.filter((item) => item.use_due && item.reserved_minutes > 0);
}

const UNRESOLVED_TEXT: Record<string, string> = {
  open_session: 'Open session: OT stays pending',
  unconfirmed_breaks: 'Breaks not confirmed: OT stays pending',
  no_records: 'No record on a day with expected attendance',
};

export function unresolvedText(item: SnapshotUnresolved): string {
  if (item.reason === 'calculation_error') return item.detail === null ? 'Calculation problem' : `Calculation problem (${item.detail})`;
  return UNRESOLVED_TEXT[item.reason] ?? item.reason.replaceAll('_', ' ');
}

const DECISION_TEXT: Record<string, string> = {
  ignored: 'Ignored by policy',
  authorized: 'Deducted from the OT balance',
  insufficient_balance: 'Balance too low: the deduction stays pending',
  pending: 'Waiting for your choice',
  declined: 'Waived',
  incomplete: 'Not decided: the day is incomplete',
};

/** The engine's decision for a deficit day in words (a choose-mode day is decided by the form instead). */
export function deficitDecisionText(item: SnapshotDeficitProposal): string {
  return DECISION_TEXT[item.decision] ?? item.decision.replaceAll('_', ' ');
}

function wallTime(instant: string, zone: string): { date: string; time: string } {
  const text = formatInZone(zone, parseUtcInstant(instant));
  return { date: text.slice(0, 10), time: text.slice(11, 16) };
}

/**
 * One session as the person reviews it: wall times in the saved reporting zone (the zone of the
 * PDF), never the device zone. A note names the local dates when the session crosses midnight
 * or sits on another local date than its accounting date.
 */
export function sessionLine(session: Pick<SnapshotSession, 'start_utc' | 'end_utc' | 'breaks_confirmed' | 'breaks'>, workDate: string, zone: string): string {
  const start = wallTime(session.start_utc, zone);
  if (session.end_utc === null) return `${start.time} to running, ${breaksText(session)}`;
  const end = wallTime(session.end_utc, zone);
  const note = start.date !== workDate || end.date !== start.date ? ` (${start.date} to ${end.date})` : '';
  return `${start.time} to ${end.time}${note}, ${breaksText(session)}`;
}

function breaksText(session: Pick<SnapshotSession, 'breaks_confirmed' | 'breaks'>): string {
  if (!session.breaks_confirmed) return 'breaks unconfirmed';
  if (session.breaks.length === 0) return 'no breaks';
  return session.breaks.length === 1 ? '1 break' : `${session.breaks.length} breaks`;
}

/* ---- One day of the review --------------------------------------------------------------- */

export type DayStatusKey = 'complete' | 'open_session' | 'confirm_breaks' | 'missing' | 'not_expected' | 'error';
export type DayStatusShape = 'circle' | 'diamond' | 'square' | 'triangle' | 'bar';

export interface ReviewDayRow {
  workDate: string;
  weekday: string;
  calendar: string;
  nonworking: boolean;
  category: string;
  /** The leave in words, or null; the minutes are the server's own value. */
  leave: string | null;
  wfh: boolean;
  notes: string;
  sessions: Array<{ id: string; text: string }>;
  regular: number | null;
  offCalendar: number | null;
  credited: number | null;
  status: { key: DayStatusKey; text: string; shape: DayStatusShape };
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function dayStatus(day: SnapshotDay): ReviewDayRow['status'] {
  if (day.calculation_error !== null) return { key: 'error', text: 'calculation problem', shape: 'triangle' };
  switch (day.completeness) {
    case 'complete':
      return { key: 'complete', text: 'complete', shape: 'circle' };
    case 'incomplete':
      return { key: 'open_session', text: 'open session', shape: 'diamond' };
    case 'incomplete_breaks':
      return { key: 'confirm_breaks', text: 'confirm breaks', shape: 'diamond' };
    default:
      return day.attendance_expected
        ? { key: 'missing', text: 'missing record', shape: 'square' }
        : { key: 'not_expected', text: 'not expected', shape: 'bar' };
  }
}

/** One day of the payload as display values. Minutes are passed through exactly as the server sent them. */
export function reviewDayRow(day: SnapshotDay, zone: string): ReviewDayRow {
  const calendar = day.holiday_name ?? (day.day_class === null ? 'unclassified' : day.day_class === 'normal' ? 'Work day' : 'Non-working day');
  return {
    workDate: day.work_date,
    weekday: WEEKDAY_NAMES[isoWeekday(day.work_date) - 1] ?? '',
    calendar,
    nonworking: day.day_class === 'nonworking',
    category: day.category ?? 'none',
    leave: day.leave_minutes > 0 ? `${day.leave_kind ?? 'leave'} leave ${minutesText(day.leave_minutes)}` : null,
    wfh: day.wfh,
    notes: day.notes,
    sessions: day.sessions.map((session) => ({ id: session.id, text: sessionLine(session, day.work_date, zone) })),
    regular: day.calculation?.regular_minutes ?? null,
    offCalendar: day.calculation?.nonworking_minutes ?? null,
    credited: day.calculation?.credited_minutes ?? null,
    status: dayStatus(day),
  };
}

/* ---- The page header and the Preview card ------------------------------------------------- */

/** The period of the page title in words, every part in the reporting zone that owns it (nothing is converted). */
export interface PeriodDescription {
  /** `Mon 10/12/2026 -> Sun 10/25/2026` (the arrow is the page's own; screen readers get " to " from the markup). */
  start: string;
  end: string;
  payroll: string;
  due: string;
  zone: string;
}

/** `Mon 10/12/2026`, an accounting date with its weekday. */
export function weekdayDate(date: string): string {
  return `${WEEKDAYS[isoWeekday(date) - 1] ?? ''} ${usDate(date)}`;
}

export function periodDescription(period: Pick<ReviewSnapshot['period'], 'period_start' | 'period_end' | 'payroll_date' | 'due_local_date' | 'due_local_time'>, zone: string): PeriodDescription {
  return {
    start: weekdayDate(period.period_start),
    end: weekdayDate(period.period_end),
    payroll: weekdayDate(period.payroll_date),
    due: `${weekdayDate(period.due_local_date)}, ${period.due_local_time}`,
    zone,
  };
}

/** The date a sign-off carries on the PDF: the real sign instant (UTC) as an accounting date in the saved reporting zone, `MM/DD/YYYY` (R-07). */
export function signedDate(signedAt: string, zone: string): string {
  return usDate(formatInZone(zone, parseUtcInstant(signedAt)).slice(0, 10));
}

/** The one muted line at the end of the page (U5-32); the saved reporting zone, never a literal. */
export function zoneNote(zone: string): string {
  return `Dates are accounting dates in ${zone}. Session times are shown in that zone, as on the PDF.`;
}

/** The text of the check card for each mode (U5-28). */
export const MODE_INTRO: Record<ReviewMode, string> = {
  signoff: 'Check every day, then sign off. Signing off locks this period and posts your OT credits; you send the PDF to payroll afterwards, below.',
  late_review:
    'This period was submitted automatically at the deadline and is waiting for your review. Signing records your review and changes no OT balance; sending is separate, below.',
  correction:
    'This period is already signed. A change is recorded as a correction revision with a reason, and only the differences post to the OT ledger; you send the corrected PDF afterwards, below.',
};

/** The words of the sign-off button for each mode. */
export const SIGNOFF_LABEL: Record<ReviewMode, string> = { signoff: 'Sign off', late_review: 'Sign off review', correction: 'Sign correction' };

/** The title of the sign-off dialog for each mode. */
export const SIGNOFF_TITLE: Record<ReviewMode, string> = {
  signoff: 'Sign off confirmation',
  late_review: 'Sign off the review',
  correction: 'Sign the correction',
};

/** What the dialog says the sign-off does and does not do, for each mode. */
export const SIGNOFF_NOTE: Record<ReviewMode, string> = {
  signoff: 'Signing off locks this period and posts the credits. It sends nothing: you send the PDF afterwards from "Send to payroll".',
  late_review: 'Signing records your review of the automatic submission. It changes no OT balance and sends nothing.',
  correction: 'Signing records a correction revision with your reason and posts only the differences. It sends nothing: you send the corrected PDF afterwards from "Send to payroll".',
};

/** The two pieces of the dialog's signature preview: the saved image (when there is one) and the name. */
export function signatureSummary(payload: Pick<ReviewSnapshot, 'signature'>): { image: string | null; text: string } {
  return payload.signature === null
    ? { image: null, text: 'your name only' }
    : { image: `/api/signatures/${payload.signature.attachment_id}`, text: 'your saved image and your name' };
}

/** The OT total of the dialog summary, as h:mm (the payload's own number). */
export function otTotalText(creditedMinutes: number): string {
  return formatHoursMinutes(creditedMinutes);
}

/* ---- The review payload on the sheet ------------------------------------------------------- */

/** The Check cell of a payload day: the same words and shapes as the Timesheet page, from the payload's own status. */
function reviewCheck(day: SnapshotDay): SheetCheck | null {
  if (day.calculation_error !== null) return { key: 'error', text: 'Calculation problem', shape: 'triangle' };
  switch (day.completeness) {
    case 'complete':
      return { key: 'complete', text: 'Complete', shape: 'circle' };
    case 'incomplete':
      return day.sessions.some((session) => session.end_utc === null)
        ? { key: 'running', text: 'Running', shape: 'live' }
        : { key: 'open_session', text: 'Open session', shape: 'diamond' };
    case 'incomplete_breaks':
      return { key: 'confirm_breaks', text: 'Confirm breaks', shape: 'diamond' };
    default:
      if (!day.attendance_expected) return null;
      // "No times" is the slashed ring, as on the Timesheet page (U-16); "Missing record" keeps its square.
      return day.sessions.length === 0
        ? { key: 'missing', text: NO_TIMES_TEXT, shape: 'slashed' }
        : { key: 'missing', text: 'Missing record', shape: 'square' };
  }
}

/** The OT cell by the PDF rule, from the payload: credited h:mm of a complete day, "pending", "n/a" or blank. */
function reviewOt(day: SnapshotDay): SheetOt {
  if (day.calculation_error !== null) return { kind: 'na', text: 'n/a' };
  const credited = day.calculation?.credited_minutes ?? null;
  if (day.completeness === 'complete' && credited !== null) return { kind: 'minutes', text: formatHoursMinutes(credited) };
  if (day.completeness === 'incomplete' || day.completeness === 'incomplete_breaks') return { kind: 'pending', text: 'pending' };
  return { kind: 'blank', text: '' };
}

/**
 * One day of the review payload as a sheet day: dates are the accounting dates, session times the
 * reporting zone (the zone of the PDF), every minute figure is the payload's own number as h:mm.
 * The note is shown in full here because the person signs what the note says.
 */
export function reviewSheetDay(day: SnapshotDay, zone: string): SheetDay {
  const weekday = WEEKDAYS[isoWeekday(day.work_date) - 1] ?? '';
  const check = reviewCheck(day);
  const noTimes = check?.key === 'missing' && day.sessions.length === 0;
  const label = sheetLabel({
    category: day.category,
    classification: day.day_class === null ? null : { name: day.holiday_name },
    wfh: day.wfh,
    leave_minutes: day.leave_minutes,
    leave_kind: day.leave_kind,
    entry: null,
  });
  return {
    workDate: day.work_date,
    weekday,
    dateText: usShortDate(day.work_date),
    name: `${weekday} ${day.work_date}`,
    today: false,
    nonworking: day.day_class === 'nonworking',
    label,
    time: {
      ranges: day.sessions.map((session) => sessionRange(session, day.work_date, zone)),
      note: noTimes ? 'no times yet' : breaksNote(day.sessions),
      attention: check?.key === 'missing' || check?.key === 'confirm_breaks',
    },
    ot: reviewOt(day),
    check,
    details: { regular: hm(day.calculation?.regular_minutes), offCalendar: hm(day.calculation?.nonworking_minutes) },
    noteText: day.notes,
  };
}

/** The payload's days in Monday to Sunday weeks, as the sheet shows them. */
export function reviewSheetWeeks(days: readonly SnapshotDay[], zone: string): SheetWeek[] {
  return weeksOf(days, (day) => reviewSheetDay(day, zone));
}
