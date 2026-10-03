import { expectedFinishUtc, suggestBreaks } from '../../domain/breaks.ts';
import { isDomainError } from '../../domain/errors.ts';
import { formatDuration } from '../../domain/format.ts';
import { type EpochSeconds, parseUtcInstant } from '../../domain/instants.ts';
import { type BreakRule, excludedBreakMinutes } from '../../domain/policy.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import { formatInZone, resolveLocalDateTime, resolveLocalDateTimeCompatible } from '../../domain/zones.ts';
import type {
  BreakRequest,
  ClockOutRequest,
  DayCategory,
  DayEntryRequest,
  DayView,
  LeaveKind,
  LocalInstantInput,
  PolicyBreak,
  PolicyVersion,
  Session,
  SessionRequest,
} from '../api.ts';
import { completenessOf, type CompletenessDisplay } from './dayModel.ts';
import { minutesText } from './format.ts';

/*
 * Pure logic of the day editor. The server owns every business figure (raw, eligible and
 * credited minutes, validation, UTC instants): this module only builds request bodies in the
 * exact shape of the server contract and maps server answers to display states. Where the
 * editor shows a suggestion or the expected finish it calls the shared domain functions
 * (suggestBreaks, expectedFinishUtc), never a second formula. The device clock is not used.
 */

/** A local date and time typed in an explicit input zone, plus how a repeated time was resolved. */
export interface LocalField {
  date: string;
  /** `HH:MM`, or `HH:MM:SS` when a live clock kept seconds. */
  time: string;
  /** 0 = earlier, 1 = later instant of a repeated (DST fold) local time; null = not chosen. */
  fold: 0 | 1 | null;
  /** An explicit UTC offset that pins the instant (a saved or suggested time); null otherwise. */
  offset: string | null;
}

export interface BreakRow {
  key: string;
  start: LocalField;
  end: LocalField;
  countsAsWork: boolean;
}

/**
 * pending: breaks unknown, the day stays pending OT (E-1, R-02). confirmed: the listed breaks
 * are the actual ones. none: the employee explicitly confirms that no break was taken.
 */
export type BreaksMode = 'pending' | 'confirmed' | 'none';

export interface SessionDraft {
  zone: string;
  start: LocalField;
  end: LocalField;
  breaks: BreakRow[];
  mode: BreaksMode;
}

export function emptyField(date: string): LocalField {
  return { date, time: '', fold: null, offset: null };
}

export function newSessionDraft(workDate: string, zone: string): SessionDraft {
  return { zone, start: emptyField(workDate), end: emptyField(workDate), breaks: [], mode: 'pending' };
}

/** A typed change clears the fold or offset, because they described the previous local time. */
export function editField(field: LocalField, patch: Partial<Pick<LocalField, 'date' | 'time'>>): LocalField {
  return { ...field, ...patch, fold: null, offset: null };
}

export function fieldLocal(field: LocalField): string {
  return `${field.date}T${field.time}`;
}

export function fieldIsFilled(field: LocalField): boolean {
  return field.date !== '' && field.time !== '';
}

/** The local fields of an instant in a zone, pinned by the offset it had then. */
export function fieldFromInstant(zone: string, instant: EpochSeconds): LocalField {
  const text = formatInZone(zone, instant);
  const seconds = text.slice(17, 19);
  return {
    date: text.slice(0, 10),
    time: seconds === '00' ? text.slice(11, 16) : text.slice(11, 19),
    fold: null,
    offset: text.slice(19),
  };
}

export function toLocalInput(field: LocalField, zone: string): LocalInstantInput {
  const input: LocalInstantInput = { local: fieldLocal(field), zone };
  if (field.offset !== null) input.offset = field.offset;
  else if (field.fold !== null) input.fold = field.fold;
  return input;
}

function breakRequests(draft: SessionDraft): BreakRequest[] {
  if (draft.mode === 'none') return [];
  return draft.breaks.map((row) => ({
    start: toLocalInput(row.start, draft.zone),
    end: toLocalInput(row.end, draft.zone),
    counts_as_work: row.countsAsWork,
  }));
}

/**
 * The first reason a draft cannot be sent yet (an empty field), or null. This is not business
 * validation: the server still checks every rule and its answer is shown as it comes.
 */
export function draftGap(draft: SessionDraft): string | null {
  if (draft.zone.trim() === '') return 'Enter the input zone.';
  if (!fieldIsFilled(draft.start)) return 'Enter the start date and time.';
  if (!fieldIsFilled(draft.end)) return 'Enter the end date and time.';
  return breaksGap(draft);
}

/** An empty field in a listed break (a Clock out has no end to check, only its breaks). */
export function breaksGap(draft: SessionDraft): string | null {
  if (draft.mode !== 'none' && draft.breaks.some((row) => !fieldIsFilled(row.start) || !fieldIsFilled(row.end))) {
    return 'Complete every break or remove it.';
  }
  return null;
}

/** The sessions endpoints take the same body; an update adds the version the editor loaded. */
export function buildSessionRequest(draft: SessionDraft, options: { expectedVersion?: number; reason?: string } = {}): SessionRequest {
  const request: SessionRequest = {
    start: toLocalInput(draft.start, draft.zone),
    end: toLocalInput(draft.end, draft.zone),
    input_zone: draft.zone.trim(),
    breaks: breakRequests(draft),
    breaks_confirmed: draft.mode !== 'pending',
  };
  if (options.expectedVersion !== undefined) request.expected_version = options.expectedVersion;
  const reason = options.reason?.trim() ?? '';
  if (reason !== '') request.reason = reason;
  return request;
}

/**
 * Clock out body (E-1). Confirmed or none sends the complete list; pending omits it, which keeps
 * the saved rows and leaves the breaks unknown.
 */
export function buildClockOutRequest(draft: SessionDraft, expectedVersion: number, reason?: string): ClockOutRequest {
  const request: ClockOutRequest =
    draft.mode === 'pending'
      ? { breaks_confirmed: false, expected_version: expectedVersion }
      : { breaks: breakRequests(draft), breaks_confirmed: true, expected_version: expectedVersion };
  const text = reason?.trim() ?? '';
  if (text !== '') request.reason = text;
  return request;
}

/** The editor form for a saved session; each time carries its offset, so a resave never asks again. */
export function draftFromSession(session: Session): SessionDraft {
  const zone = session.input_zone;
  const start = parseUtcInstant(session.start_utc);
  const end = session.end_utc === null ? null : parseUtcInstant(session.end_utc);
  const rows = session.breaks.map((item, index) => ({
    key: `saved-${session.id}-${index}`,
    start: fieldFromInstant(zone, parseUtcInstant(item.start_utc)),
    end: fieldFromInstant(zone, parseUtcInstant(item.end_utc)),
    countsAsWork: item.counts_as_work,
  }));
  return {
    zone,
    start: fieldFromInstant(zone, start),
    end: end === null ? emptyField(fieldFromInstant(zone, start).date) : fieldFromInstant(zone, end),
    breaks: rows,
    mode: !session.breaks_confirmed ? 'pending' : rows.length === 0 ? 'none' : 'confirmed',
  };
}

/* ---- Time problems the server (or the shared resolver) reports ---------------------------- */

export type TimeProblem =
  | { kind: 'ambiguous'; local: string; zone: string; offsets: string[] }
  | { kind: 'gap'; local: string; zone: string };

/**
 * Maps the error codes `ambiguous_local_time` and `nonexistent_local_time` (with their details)
 * to a problem the form can ask about. The `offsets` of an ambiguous time are listed earlier
 * instant first, so index 0 is fold 0.
 */
export function timeProblemOf(code: string, details: Record<string, unknown> | undefined): TimeProblem | null {
  const local = details?.local;
  const zone = details?.zone;
  if (typeof local !== 'string' || typeof zone !== 'string') return null;
  if (code === 'nonexistent_local_time') return { kind: 'gap', local, zone };
  if (code !== 'ambiguous_local_time') return null;
  const offsets = details?.offsets;
  if (!Array.isArray(offsets) || offsets.length !== 2 || !offsets.every((item) => typeof item === 'string')) return null;
  return { kind: 'ambiguous', local, zone, offsets: offsets as string[] };
}

type Edge = 'start' | 'end';

function mapFields(draft: SessionDraft, change: (field: LocalField, where: Edge | 'break') => LocalField): SessionDraft {
  return {
    ...draft,
    start: change(draft.start, 'start'),
    end: change(draft.end, 'end'),
    breaks: draft.breaks.map((row) => ({ ...row, start: change(row.start, 'break'), end: change(row.end, 'break') })),
  };
}

/** True while some field still holds the local time the problem names and has no pinned instant. */
export function problemApplies(draft: SessionDraft, problem: TimeProblem): boolean {
  let found = false;
  mapFields(draft, (field) => {
    if (fieldLocal(field) === problem.local && field.offset === null) found = true;
    return field;
  });
  return found;
}

/** The fold currently chosen for the fields that hold the ambiguous time (null = none yet). */
export function chosenFold(draft: SessionDraft, problem: TimeProblem): 0 | 1 | null {
  let chosen: 0 | 1 | null = null;
  mapFields(draft, (field) => {
    if (fieldLocal(field) === problem.local && field.offset === null && field.fold !== null) chosen = field.fold;
    return field;
  });
  return chosen;
}

export function applyFold(draft: SessionDraft, problem: TimeProblem, fold: 0 | 1): SessionDraft {
  return mapFields(draft, (field) =>
    fieldLocal(field) === problem.local && field.offset === null ? { ...field, fold } : field,
  );
}

/** The first valid local time after a DST gap, from the shared resolver (the same one the server uses for schedules). */
export function gapReplacement(problem: TimeProblem): LocalField {
  return fieldFromInstant(problem.zone, resolveLocalDateTimeCompatible(problem.local, problem.zone));
}

export function applyGapReplacement(draft: SessionDraft, problem: TimeProblem): SessionDraft {
  const replacement = gapReplacement(problem);
  return mapFields(draft, (field) => (fieldLocal(field) === problem.local && field.offset === null ? replacement : field));
}

export function problemText(problem: TimeProblem): string {
  if (problem.kind === 'gap') {
    return `${problem.local.replace('T', ' ')} does not exist in ${problem.zone}: clocks skip forward at that time.`;
  }
  return `${problem.local.replace('T', ' ')} happens twice in ${problem.zone}: clocks go back at that time.`;
}

/* ---- Break suggestions (R-02) -------------------------------------------------------------- */

export type StartResolution =
  | { ok: true; utc: EpochSeconds }
  | { ok: false; problem: TimeProblem | null; message: string };

/** Resolves the typed start with the shared resolver, to place break suggestions from the arrival. */
export function resolveStart(draft: SessionDraft): StartResolution {
  if (!fieldIsFilled(draft.start)) return { ok: false, problem: null, message: 'Enter the start date and time first.' };
  try {
    const options =
      draft.start.offset !== null ? { offset: draft.start.offset } : { fold: draft.start.fold };
    return { ok: true, utc: resolveLocalDateTime(fieldLocal(draft.start), draft.zone, options).utc };
  } catch (caught) {
    if (isDomainError(caught)) {
      const problem = timeProblemOf(caught.code, caught.details === undefined ? undefined : { ...caught.details });
      return { ok: false, problem, message: caught.message };
    }
    throw caught;
  }
}

export function toBreakRules(breaks: readonly PolicyBreak[]): BreakRule[] {
  return breaks.map((item) => ({
    startOffsetMinutes: item.start_offset_minutes,
    durationMinutes: item.duration_minutes,
    countsAsWork: item.counts_as_work,
  }));
}

/** Suggested breaks shifted by the arrival; the rows are pinned by offset and stay unconfirmed. */
export function suggestedRows(
  startUtc: EpochSeconds,
  zone: string,
  breaks: readonly PolicyBreak[],
  keyOf: (index: number) => string,
): BreakRow[] {
  return suggestBreaks(startUtc, toBreakRules(breaks)).map((item, index) => ({
    key: keyOf(index),
    start: fieldFromInstant(zone, item.startUtc),
    end: fieldFromInstant(zone, item.endUtc),
    countsAsWork: item.countsAsWork,
  }));
}

/* ---- Policy based figures ------------------------------------------------------------------ */

/** The policy version effective on a date, from the list the server returns. */
export function policyOn(policies: readonly PolicyVersion[], workDate: string): PolicyVersion | undefined {
  const found = effectiveVersionOn(
    policies.map((policy) => ({ policy, effectiveFrom: policy.effective_from, seq: policy.seq })),
    workDate,
  );
  return found?.policy;
}

/**
 * Expected finish = actual start + required work + excluded breaks (R-02), by the shared domain
 * function, shown in the first session's input zone. Null while there is no session or policy.
 */
export function expectedFinishText(sessions: readonly Session[], policy: PolicyVersion | undefined): string | null {
  const first = [...sessions].sort((a, b) => (a.start_utc < b.start_utc ? -1 : 1))[0];
  if (first === undefined || policy === undefined) return null;
  const finish = expectedFinishUtc(
    parseUtcInstant(first.start_utc),
    policy.required_minutes,
    excludedBreakMinutes(toBreakRules(policy.breaks)),
  );
  return `${formatInZone(first.input_zone, finish).slice(0, 16).replace('T', ' ')} (${first.input_zone})`;
}

/* ---- Server figures and notices ------------------------------------------------------------ */

export interface DayFigures {
  status: CompletenessDisplay;
  rawRegular: string;
  rawOffCalendar: string;
  eligible: string;
  credited: string;
  deficit: string;
}

/** The figures exactly as the server computed them, in hours and minutes. */
export function dayFigures(day: DayView, todayLocal: string | null): DayFigures {
  const calculation = day.calculation;
  return {
    status: completenessOf(day, todayLocal),
    rawRegular: minutesText(calculation?.regular_minutes),
    rawOffCalendar: minutesText(calculation?.nonworking_minutes),
    eligible: minutesText(calculation?.eligible_minutes),
    credited: minutesText(calculation?.credited_minutes),
    deficit: minutesText(day.deficit_minutes),
  };
}

/**
 * E-2: a non-blocking notice when the day's OT-kind leave minutes differ from the consumed OT
 * leave of the linked requests. It only informs; nothing is spent, reserved or released here.
 */
export function otMismatchNotice(day: DayView): string | null {
  const leave = day.ot_leave;
  if (!leave.mismatch) return null;
  const used = leave.consumed_minutes - leave.reversed_minutes;
  return (
    `OT leave on this day is ${formatDuration(leave.kind_minutes)}, but consumed OT leave is ${formatDuration(used)}. ` +
    'This is informational: nothing is spent, reserved or released from this screen.'
  );
}

/* ---- Day fields ---------------------------------------------------------------------------- */

export const CATEGORIES: readonly DayCategory[] = ['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown'];
export const LEAVE_KINDS: readonly LeaveKind[] = ['vacation', 'sick', 'ot'];

export interface DayFieldsDraft {
  category: DayCategory;
  /** Text of the minutes field; parsed when saving. */
  leaveMinutes: string;
  /** Empty until a kind is chosen. */
  leaveKind: LeaveKind | '';
  wfh: boolean;
  notes: string;
}

export function dayFieldsDraft(day: DayView): DayFieldsDraft {
  return {
    category: day.category ?? 'Worked',
    leaveMinutes: String(day.leave_minutes),
    leaveKind: day.leave_kind ?? '',
    wfh: day.wfh,
    notes: day.entry?.notes ?? '',
  };
}

export type DayEntryBuild = { ok: true; request: DayEntryRequest } | { ok: false; message: string };

/** The kind is sent only with leave minutes; the server answers `leave_kind_required` when it is missing. */
export function buildDayEntryRequest(draft: DayFieldsDraft, expectedVersion: number | null, reason?: string): DayEntryBuild {
  const text = draft.leaveMinutes.trim();
  const minutes = text === '' ? 0 : Number(text);
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) {
    return { ok: false, message: 'Enter leave as whole minutes from 0 to 1440.' };
  }
  const request: DayEntryRequest = {
    category: draft.category,
    leave_minutes: minutes,
    leave_kind: minutes > 0 && draft.leaveKind !== '' ? draft.leaveKind : null,
    wfh: draft.wfh,
    notes: draft.notes,
    expected_version: expectedVersion,
  };
  const why = reason?.trim() ?? '';
  if (why !== '') request.reason = why;
  return { ok: true, request };
}

/** The leave minutes the field holds, in hours and minutes, for a hint; null when it is not a whole number. */
export function leaveHint(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const minutes = Number(trimmed);
  return Number.isInteger(minutes) && minutes >= 0 ? formatDuration(minutes) : null;
}
