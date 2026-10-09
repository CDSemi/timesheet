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
import { minutesText, usShortDate } from './format.ts';
import { breaksNote, hm, type SheetCheck, type SheetDay, type SheetOt, type SheetWeek, sessionRange, sheetLabel, weeksOf } from './sheetModel.ts';

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

export interface FormState {
  signerName: string;
  acknowledged: boolean;
  /** One choice per choose-mode deficit day, keyed by work date. */
  choices: Readonly<Record<string, DeficitChoice>>;
  reason: string;
  /** The explicit email choice of a revision; null until the person picks one. */
  sendEmail: boolean | null;
}

export type FieldKey = 'signer_name' | 'signature' | 'acknowledgement' | 'deficit_choices' | 'reason' | 'send_email';

export interface Blocker {
  field: FieldKey;
  message: string;
}

/** The name limits the server enforces (one line, at most 200 characters). */
const MAX_NAME = 200;
const MAX_REASON = 2000;

/** Days with a deficit that the employee decides at sign-off. */
export function deficitChoiceDays(payload: ReviewSnapshot): SnapshotDeficitProposal[] {
  return payload.deficit_proposals.filter((item) => item.mode === 'choose_at_signoff');
}

/** What is still missing before the sign-off can be sent, in the order the form shows it. */
export function submitBlockers(payload: ReviewSnapshot, mode: ReviewMode, form: FormState): Blocker[] {
  const blockers: Blocker[] = [];
  const name = form.signerName.trim();
  if (name === '') blockers.push({ field: 'signer_name', message: 'Enter your name to sign off.' });
  else if (name.length > MAX_NAME || /[\r\n]/.test(name)) {
    blockers.push({ field: 'signer_name', message: `The name must be one line of at most ${MAX_NAME} characters.` });
  }
  if (payload.signature === null) {
    blockers.push({ field: 'signature', message: 'Upload a signature image in Settings before you sign off.' });
  }
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
  if (mode !== 'signoff' && form.sendEmail === null) {
    blockers.push({ field: 'send_email', message: 'Choose whether to email this revision to the recipients.' });
  }
  return blockers;
}

/**
 * The request body: bound to the hash and the version of the review the person saw. Choices
 * are sent only for days that are choose-mode days in that review, in date order.
 */
export function buildSubmitBody(review: ReviewResponse, mode: ReviewMode, form: FormState): Record<string, unknown> {
  const days = deficitChoiceDays(review.payload)
    .map((item) => item.work_date)
    .sort();
  const body: Record<string, unknown> = {
    expected_version: review.expected_version,
    reviewed_hash: review.payload_hash,
    signer_name: form.signerName.trim(),
    deficit_choices: days.flatMap((workDate) => {
      const choice = form.choices[workDate];
      return choice === undefined ? [] : [{ work_date: workDate, choice }];
    }),
    incomplete_evidence_acknowledged: review.payload.unresolved_inputs.length > 0 && form.acknowledged,
  };
  if (mode === 'correction') body.reason = form.reason.trim();
  if (mode !== 'signoff') body.send_email = form.sendEmail === true;
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
  signer_name_required: { field: 'signer_name', message: 'Enter your name to sign off.' },
  invalid_signer_name: { field: 'signer_name', message: 'The name must be one line of at most 200 characters.' },
  signature_required: { field: 'signature', message: 'Upload a signature image in Settings before you sign off.' },
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

export type PeriodStatusKey = 'draft' | 'submitted_manual' | 'submitted_auto_pending' | 'reviewed_late' | 'corrected';

export interface PeriodStatus {
  key: PeriodStatusKey;
  text: string;
  tone: Tone;
}

/** Review status of a period, from the finalization fields the server returns. */
export function periodStatus(finalization: Pick<FinalizationResponse, 'finalized_revision_no' | 'revision'>): PeriodStatus {
  const revision = finalization.revision;
  if (revision === null || finalization.finalized_revision_no === null) return { key: 'draft', text: 'Draft', tone: 'neutral' };
  if (revision.revision_kind === 'correction') return { key: 'corrected', text: `Corrected (revision ${revision.revision_no})`, tone: 'ok' };
  if (revision.revision_kind === 'late_review') return { key: 'reviewed_late', text: 'Submitted automatically, reviewed by you later', tone: 'ok' };
  if (revision.origin === 'deadline' && revision.review_state === 'pending') {
    return { key: 'submitted_auto_pending', text: 'Submitted automatically, review pending', tone: 'warn' };
  }
  return { key: 'submitted_manual', text: 'Submitted manually', tone: 'ok' };
}

/** The wording of the link from the timesheet to the review, by period status. */
export function reviewLinkLabel(status: PeriodStatus | null): string {
  switch (status?.key) {
    case 'submitted_auto_pending':
      return 'Review now';
    case 'submitted_manual':
    case 'reviewed_late':
    case 'corrected':
      return 'Review or correct';
    default:
      return 'Review & sign off';
  }
}

export type DeliveryKey =
  | 'not_requested'
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
 * send job's state and the revision's own send choice do.
 */
export function deliveryStatus(
  revision: Pick<RevisionSummary, 'send_requested'> | null,
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
  if (!revision.send_requested) return { key: 'not_requested', text: 'Email not requested', tone: 'neutral' };
  const send = jobs.find((job) => job.kind === 'send_email');
  if (send?.state === 'intervention') return { key: 'attention', text: 'Email needs attention', tone: 'error' };
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

/* ---- The checklist beside the sheet ------------------------------------------------------ */

export interface ChecklistStep {
  key: 'attention' | 'email' | 'sign';
  title: string;
  /** The state in words (never colour alone). */
  state: string;
}

/**
 * The three steps of the review in order, each with its state in words. Only counts and presence
 * checks of the payload and the form: the person's choices, no business figure.
 */
export function checklistSteps(payload: ReviewSnapshot, form: FormState, imported: boolean): ChecklistStep[] {
  const evidence = payload.unresolved_inputs.length;
  const undecided = deficitChoiceDays(payload).filter((item) => form.choices[item.work_date] === undefined).length;
  let attention = 'Nothing to resolve';
  if (evidence > 0 && !form.acknowledged) attention = evidence === 1 ? '1 day needs your acknowledgement' : `${evidence} days need your acknowledgement`;
  else if (undecided > 0) attention = undecided === 1 ? '1 deficit day needs your choice' : `${undecided} deficit days need your choice`;
  else if (evidence > 0) attention = 'Acknowledged';
  const email =
    payload.signature === null ? 'No signature image saved' : payload.recipients.to.length === 0 ? 'No recipient set' : 'Recipients and signature ready';
  return [
    { key: 'attention', title: 'Days that need attention', state: attention },
    { key: 'email', title: 'Email and PDF', state: email },
    { key: 'sign', title: 'Sign', state: imported ? 'Locked: imported history' : 'Waiting for your signature' },
  ];
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
      return { key: 'missing', text: day.sessions.length === 0 ? 'No times' : 'Missing record', shape: 'square' };
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
