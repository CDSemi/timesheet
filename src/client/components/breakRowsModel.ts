import { suggestBreaks } from '../../domain/breaks.ts';
import { addDays, isCivilDate } from '../../domain/dates.ts';
import { isDomainError } from '../../domain/errors.ts';
import { type EpochSeconds, parseUtcInstant } from '../../domain/instants.ts';
import { parseClockTime } from '../../domain/policy.ts';
import { isValidTimeZone, resolveLocalDateTime, resolveLocalDateTimeCompatible } from '../../domain/zones.ts';
import type { BreakRequest, ClockOutRequest, PolicyVersion, Session, SessionRequest } from '../api.ts';
import {
  draftFromSession,
  draftGap,
  editField,
  emptyField,
  fieldFromInstant,
  fieldIsFilled,
  fieldLocal,
  gapReplacement,
  type LocalField,
  problemText,
  type TimeProblem,
  timeProblemOf,
  toBreakRules,
  toLocalInput,
} from './sessionModel.ts';

/*
 * Pure model of the break rows of the session dialog and the Check out dialog (WP5-UX3, U-21 and
 * U-23..U-26). A break is typed as a start date, a start time and its minutes; the end is never
 * typed. The end instant is the start instant plus the minutes in elapsed UTC seconds (R-07), and
 * it is sent as its local time pinned by its explicit offset, so it can never fall into a DST gap
 * or fold. The request bodies keep the existing server contract (`SessionRequest`,
 * `ClockOutRequest`); the server still checks every rule and owns every business figure.
 *
 * Nothing here reads the device clock or the device zone: "past day" is decided by comparing the
 * accounting date with the server's `today_local`, and every zone is an explicit IANA name.
 */

export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 720;

/** saved: loaded from the server; suggested: placed from the policy; new: added by the person. */
export type BreakRowOrigin = 'saved' | 'suggested' | 'new';

/** The exact instants of a saved or suggested break and the input zone they were shown in. */
export interface PinnedBreak {
  zone: string;
  startUtc: EpochSeconds;
  endUtc: EpochSeconds;
}

export interface BreakRowDraft {
  key: string;
  origin: BreakRowOrigin;
  /**
   * The start as shown: date, time, the chosen fold of a repeated local time, and the offset that
   * pins a saved or suggested start (dropped as soon as the date or time is typed again).
   */
  start: LocalField;
  /** The minutes as typed; whole minutes from 1 to 720 are valid. */
  minutes: string;
  countsAsWork: boolean;
  pinned: PinnedBreak | null;
  /** True once the person changed this row's date, time or minutes. */
  edited: boolean;
}

export interface SessionDialogDraft {
  zone: string;
  start: LocalField;
  end: LocalField;
  rows: BreakRowDraft[];
  /** "Confirm no breaks taken". While ticked the rows are kept but neither checked nor sent. */
  noBreaks: boolean;
  /** True once the person added, removed or changed any break row; suggestions then stop re-shifting. */
  breaksEdited: boolean;
}

export function breakLabel(index: number): string {
  return `Break ${index + 1}`;
}

/* ---- Rows ------------------------------------------------------------------------------------ */

/** The elapsed whole minutes of a saved break, from its server instants (display only, not a business figure). */
export function savedBreakMinutes(startUtc: string, endUtc: string): number {
  return elapsedMinutes(parseUtcInstant(startUtc), parseUtcInstant(endUtc));
}

function elapsedMinutes(startUtc: EpochSeconds, endUtc: EpochSeconds): number {
  return Math.floor((endUtc - startUtc) / 60);
}

function pinnedRow(
  key: string,
  origin: 'saved' | 'suggested',
  zone: string,
  startUtc: EpochSeconds,
  endUtc: EpochSeconds,
  countsAsWork: boolean,
): BreakRowDraft {
  return {
    key,
    origin,
    start: fieldFromInstant(zone, startUtc),
    minutes: String(elapsedMinutes(startUtc, endUtc)),
    countsAsWork,
    pinned: { zone, startUtc, endUtc },
    edited: false,
  };
}

/** The saved breaks of a session as rows pinned in its input zone (the same keys the old form used). */
export function rowsFromSession(session: Session): BreakRowDraft[] {
  return session.breaks.map((item, index) =>
    pinnedRow(
      `saved-${session.id}-${index}`,
      'saved',
      session.input_zone,
      parseUtcInstant(item.start_utc),
      parseUtcInstant(item.end_utc),
      item.counts_as_work,
    ),
  );
}

export function newBreakRow(key: string, date: string): BreakRowDraft {
  return { key, origin: 'new', start: emptyField(date), minutes: '', countsAsWork: false, pinned: null, edited: false };
}

/** True while a row still sends its pinned instants: saved or suggested, unchanged, same input zone. */
export function rowKeepsPin(row: BreakRowDraft, zone: string): boolean {
  return row.pinned !== null && !row.edited && row.pinned.zone === zone.trim();
}

export function newSessionDialogDraft(workDate: string, zone: string): SessionDialogDraft {
  return { zone, start: emptyField(workDate), end: emptyField(workDate), rows: [], noBreaks: false, breaksEdited: false };
}

/** The dialog draft of a saved session; an unchanged save sends every saved instant again. */
export function sessionDialogDraftFromSession(session: Session): SessionDialogDraft {
  const base = draftFromSession(session);
  return {
    zone: base.zone,
    start: base.start,
    end: base.end,
    rows: rowsFromSession(session),
    noBreaks: session.breaks_confirmed && session.breaks.length === 0,
    breaksEdited: false,
  };
}

function mapRow(draft: SessionDialogDraft, key: string, change: (row: BreakRowDraft) => BreakRowDraft): SessionDialogDraft {
  return { ...draft, rows: draft.rows.map((row) => (row.key === key ? change(row) : row)), breaksEdited: true };
}

export interface BreakRowPatch {
  date?: string;
  time?: string;
  minutes?: string;
}

/** A typed change. A new date or time drops the pin and the fold; new minutes keep the start as it is. */
export function editBreakRow(draft: SessionDialogDraft, key: string, patch: BreakRowPatch): SessionDialogDraft {
  return mapRow(draft, key, (row) => {
    const local: { date?: string; time?: string } = {};
    if (patch.date !== undefined) local.date = patch.date;
    if (patch.time !== undefined) local.time = patch.time;
    const start = local.date !== undefined || local.time !== undefined ? editField(row.start, local) : row.start;
    return { ...row, start, minutes: patch.minutes ?? row.minutes, edited: true };
  });
}

/** The fold chosen for a repeated local start (0 = earlier, 1 = later instant). */
export function chooseBreakRowFold(draft: SessionDialogDraft, key: string, fold: 0 | 1): SessionDialogDraft {
  return mapRow(draft, key, (row) => ({ ...row, start: { ...row.start, fold } }));
}

/** Replaces a start inside a DST gap by the first valid local time after it (the shared resolver). */
export function replaceBreakRowGap(draft: SessionDialogDraft, key: string, problem: TimeProblem): SessionDialogDraft {
  return mapRow(draft, key, (row) => ({ ...row, start: gapReplacement(problem), edited: true }));
}

export function addBreakRow(draft: SessionDialogDraft, key: string): SessionDialogDraft {
  return { ...draft, rows: [...draft.rows, newBreakRow(key, draft.start.date)], breaksEdited: true };
}

export function removeBreakRow(draft: SessionDialogDraft, key: string): SessionDialogDraft {
  return { ...draft, rows: draft.rows.filter((row) => row.key !== key), breaksEdited: true };
}

export function setNoBreaks(draft: SessionDialogDraft, noBreaks: boolean): SessionDialogDraft {
  return { ...draft, noBreaks };
}

/**
 * Selects another input zone (R-07), as `changeZone` does for the old form: the shown wall clocks
 * stay and are read again in the new zone, so offsets and folds are dropped. Pinned rows stop
 * sending their pin until the original zone is selected again. The same zone returns the draft.
 */
export function changeDialogZone(draft: SessionDialogDraft, zone: string): SessionDialogDraft {
  if (zone === draft.zone) return draft;
  const unpin = (field: LocalField): LocalField => ({ ...field, fold: null, offset: null });
  return {
    ...draft,
    zone,
    start: unpin(draft.start),
    end: unpin(draft.end),
    rows: draft.rows.map((row) => ({ ...row, start: unpin(row.start) })),
  };
}

/* ---- Resolution and row checks --------------------------------------------------------------- */

export type BreakMinutes = { ok: true; minutes: number } | { ok: false; message: string };

/** Whole minutes from 1 to 720; anything else (empty, 0, 721, 1.5, text) is refused. */
export function parseBreakMinutes(text: string): BreakMinutes {
  const trimmed = text.trim();
  const value = /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
  if (!Number.isInteger(value) || value < MIN_BREAK_MINUTES || value > MAX_BREAK_MINUTES) {
    return { ok: false, message: `Enter whole minutes from ${MIN_BREAK_MINUTES} to ${MAX_BREAK_MINUTES}.` };
  }
  return { ok: true, minutes: value };
}

export type BreakRowErrorKind =
  | 'incomplete'
  | 'minutes'
  | 'gap'
  | 'ambiguous'
  | 'invalid_time'
  | 'before_start'
  | 'after_end'
  | 'overlap'
  | 'server';

export interface BreakRowError {
  index: number;
  key: string;
  /** "Break n", the name the row shows. */
  label: string;
  kind: BreakRowErrorKind;
  message: string;
  /** The gap or fold question of the row's start, for the existing time prompt. */
  problem: TimeProblem | null;
}

export interface ResolvedBreakRow {
  index: number;
  key: string;
  startUtc: EpochSeconds;
  endUtc: EpochSeconds;
  request: BreakRequest;
}

type FieldResolution = { ok: true; utc: EpochSeconds } | { ok: false; problem: TimeProblem | null; message: string };

function resolveField(field: LocalField, zone: string): FieldResolution {
  try {
    const options = field.offset !== null ? { offset: field.offset } : { fold: field.fold };
    return { ok: true, utc: resolveLocalDateTime(fieldLocal(field), zone, options).utc };
  } catch (caught) {
    if (isDomainError(caught)) {
      const problem = timeProblemOf(caught.code, caught.details === undefined ? undefined : { ...caught.details });
      return { ok: false, problem, message: problem === null ? caught.message : problemText(problem) };
    }
    throw caught;
  }
}

export type BreakRowResolution = { ok: true; row: ResolvedBreakRow } | { ok: false; error: BreakRowError };

/**
 * One row to its request part. An untouched saved or suggested row sends its pinned instants
 * exactly as before. Otherwise the start is resolved in the input zone with the shared resolver
 * (a missing local time gives the gap question, a repeated one the fold question), the end instant
 * is the start instant plus the minutes in elapsed seconds (R-07), and the end is sent as its local
 * time with its explicit offset.
 */
export function resolveBreakRow(row: BreakRowDraft, index: number, inputZone: string): BreakRowResolution {
  const zone = inputZone.trim();
  const label = breakLabel(index);
  const fail = (kind: BreakRowErrorKind, message: string, problem: TimeProblem | null = null): BreakRowResolution => ({
    ok: false,
    error: { index, key: row.key, label, kind, message: `${label}: ${message}`, problem },
  });
  if (row.pinned !== null && rowKeepsPin(row, zone)) {
    const { startUtc, endUtc } = row.pinned;
    return {
      ok: true,
      row: {
        index,
        key: row.key,
        startUtc,
        endUtc,
        request: {
          start: toLocalInput(fieldFromInstant(zone, startUtc), zone),
          end: toLocalInput(fieldFromInstant(zone, endUtc), zone),
          counts_as_work: row.countsAsWork,
        },
      },
    };
  }
  if (!fieldIsFilled(row.start)) return fail('incomplete', 'enter the start date and time.');
  const minutes = parseBreakMinutes(row.minutes);
  if (!minutes.ok) return fail('minutes', minutes.message);
  const start = resolveField(row.start, zone);
  if (!start.ok) {
    const kind = start.problem === null ? 'invalid_time' : start.problem.kind;
    return fail(kind, start.message, start.problem);
  }
  const endUtc = start.utc + minutes.minutes * 60;
  return {
    ok: true,
    row: {
      index,
      key: row.key,
      startUtc: start.utc,
      endUtc,
      request: {
        start: toLocalInput(row.start, zone),
        end: toLocalInput(fieldFromInstant(zone, endUtc), zone),
        counts_as_work: row.countsAsWork,
      },
    },
  };
}

/** The computed end of a row ("ends 10:15"), in the input zone; null while the row cannot be resolved. */
export function breakRowEnd(row: BreakRowDraft, index: number, inputZone: string): LocalField | null {
  const resolved = resolveBreakRow(row, index, inputZone);
  return resolved.ok ? fieldFromInstant(inputZone.trim(), resolved.row.endUtc) : null;
}

/** The session interval the rows must lie in; `endUtc` is null for a running session. */
export interface SessionBounds {
  startUtc: EpochSeconds;
  endUtc: EpochSeconds | null;
}

export interface BreakRowsCheck {
  resolved: ResolvedBreakRow[];
  errors: BreakRowError[];
}

/**
 * Every row resolved and checked before sending, by instant comparison only: a break that starts
 * before the session, ends after a closed session or overlaps an earlier listed row gets a row
 * message. A break across local midnight is valid. At most one message per row.
 */
export function checkBreakRows(rows: readonly BreakRowDraft[], inputZone: string, bounds: SessionBounds | null): BreakRowsCheck {
  const resolved: ResolvedBreakRow[] = [];
  const errors: BreakRowError[] = [];
  rows.forEach((row, index) => {
    const result = resolveBreakRow(row, index, inputZone);
    if (!result.ok) {
      errors.push(result.error);
      return;
    }
    const item = result.row;
    const label = breakLabel(index);
    const fail = (kind: BreakRowErrorKind, message: string) =>
      errors.push({ index, key: row.key, label, kind, message: `${label} ${message}`, problem: null });
    const earlier = resolved.find((other) => other.startUtc < item.endUtc && item.startUtc < other.endUtc);
    if (bounds !== null && item.startUtc < bounds.startUtc) fail('before_start', 'starts before the session starts.');
    else if (bounds !== null && bounds.endUtc !== null && item.endUtc > bounds.endUtc) fail('after_end', 'ends after the session ends.');
    else if (earlier !== undefined) fail('overlap', `overlaps ${breakLabel(earlier.index)}.`);
    resolved.push(item);
  });
  return { resolved: resolved.filter((item) => !errors.some((error) => error.index === item.index)), errors };
}

/**
 * How Save and Check out treat the breaks. Session dialog: `allowUnconfirmed` is the owner's G-4
 * choice for an empty list with the box unticked (true: save with breaks unknown; false: block).
 * Check out keeps E-1: an empty unticked list omits `breaks` (the saved rows stay, unconfirmed), except
 * when the dialog started with saved rows (`hadSavedRows`) and the person removed them all: the empty
 * unconfirmed list is then sent, the complete set, which replaces the rows the dialog no longer shows.
 */
export type BreaksSaveMode = { kind: 'session'; allowUnconfirmed: boolean } | { kind: 'checkout'; hadSavedRows?: boolean };

export const UNCONFIRMED_BLOCKED_MESSAGE = 'List the breaks you took, or tick "Confirm no breaks taken".';

export type BreaksPayload =
  | { ok: true; breaks: BreakRequest[] | undefined; breaksConfirmed: boolean }
  | { ok: false; message: string | null; rowErrors: BreakRowError[] };

export function breaksPayload(
  input: { rows: readonly BreakRowDraft[]; noBreaks: boolean; zone: string; bounds: SessionBounds | null },
  mode: BreaksSaveMode,
): BreaksPayload {
  if (input.noBreaks) return { ok: true, breaks: [], breaksConfirmed: true };
  if (input.rows.length === 0) {
    if (mode.kind === 'checkout') return { ok: true, breaks: mode.hadSavedRows === true ? [] : undefined, breaksConfirmed: false };
    if (mode.allowUnconfirmed) return { ok: true, breaks: [], breaksConfirmed: false };
    return { ok: false, message: UNCONFIRMED_BLOCKED_MESSAGE, rowErrors: [] };
  }
  const checked = checkBreakRows(input.rows, input.zone, input.bounds);
  if (checked.errors.length > 0) return { ok: false, message: null, rowErrors: checked.errors };
  return { ok: true, breaks: checked.resolved.map((item) => item.request), breaksConfirmed: true };
}

export type SessionDialogBuild =
  | { ok: true; request: SessionRequest }
  | { ok: false; message: string | null; problem: TimeProblem | null; rowErrors: BreakRowError[] };

/**
 * The body of POST /api/days/:date/sessions or PUT /api/sessions/:id from the session dialog, in
 * the existing `SessionRequest` shape. Listed rows or the ticked box confirm the breaks (Save is
 * the confirmation, U-25); an empty unticked list follows `allowUnconfirmed` (G-4).
 */
export function buildSessionDialogRequest(
  draft: SessionDialogDraft,
  options: { allowUnconfirmed: boolean; expectedVersion?: number; reason?: string },
): SessionDialogBuild {
  const zone = draft.zone.trim();
  const gap = draftGap({ zone, start: draft.start, end: draft.end, breaks: [], mode: 'none' });
  if (gap !== null) return { ok: false, message: gap, problem: null, rowErrors: [] };
  const start = resolveField(draft.start, zone);
  if (!start.ok) return { ok: false, message: start.message, problem: start.problem, rowErrors: [] };
  const end = resolveField(draft.end, zone);
  if (!end.ok) return { ok: false, message: end.message, problem: end.problem, rowErrors: [] };
  const payload = breaksPayload(
    { rows: draft.rows, noBreaks: draft.noBreaks, zone, bounds: { startUtc: start.utc, endUtc: end.utc } },
    { kind: 'session', allowUnconfirmed: options.allowUnconfirmed },
  );
  if (!payload.ok) return { ok: false, message: payload.message, problem: null, rowErrors: payload.rowErrors };
  const request: SessionRequest = {
    start: toLocalInput(draft.start, zone),
    end: toLocalInput(draft.end, zone),
    input_zone: zone,
    breaks: payload.breaks ?? [],
    breaks_confirmed: payload.breaksConfirmed,
  };
  if (options.expectedVersion !== undefined) request.expected_version = options.expectedVersion;
  const reason = options.reason?.trim() ?? '';
  if (reason !== '') request.reason = reason;
  return { ok: true, request };
}

export type CheckOutBuild = { ok: true; request: ClockOutRequest } | { ok: false; message: string | null; rowErrors: BreakRowError[] };

/**
 * The POST /api/clock/out body (E-1): a listed set or the ticked box confirms and replaces the
 * saved rows. An empty unticked list means "no break confirmed": when the dialog started without
 * saved rows it omits `breaks`, so the breaks stay unconfirmed; when it started with saved rows (the
 * person removed them all) it sends the empty unconfirmed list, the complete set, which replaces them
 * (WP5-UX3-FIX3 item 7: the dialog shows no rows, so the server must keep none). The rows are
 * typed in the session's input zone and checked against its start (it has no end yet).
 */
export function buildCheckOutDialogRequest(input: {
  session: Session;
  rows: readonly BreakRowDraft[];
  noBreaks: boolean;
  expectedVersion: number;
  reason?: string;
}): CheckOutBuild {
  const { session } = input;
  const bounds: SessionBounds = {
    startUtc: parseUtcInstant(session.start_utc),
    endUtc: session.end_utc === null ? null : parseUtcInstant(session.end_utc),
  };
  const payload = breaksPayload(
    { rows: input.rows, noBreaks: input.noBreaks, zone: session.input_zone, bounds },
    { kind: 'checkout', hadSavedRows: session.breaks.length > 0 },
  );
  if (!payload.ok) return { ok: false, message: payload.message, rowErrors: payload.rowErrors };
  const request: ClockOutRequest =
    payload.breaks === undefined
      ? { breaks_confirmed: false, expected_version: input.expectedVersion }
      : { breaks: payload.breaks, breaks_confirmed: payload.breaksConfirmed, expected_version: input.expectedVersion };
  const reason = input.reason?.trim() ?? '';
  if (reason !== '') request.reason = reason;
  return { ok: true, request };
}

const SERVER_ROW_MESSAGES: Readonly<Record<string, string>> = {
  break_outside_session: 'lies outside the session.',
  overlapping_breaks: 'overlaps another break.',
  future_break: 'ends later than five minutes from now. Only breaks already taken can be saved.',
};

/**
 * Maps a server refusal that names a break (`break_index` in its details) to the row it was sent
 * from. Rows are sent in list order, and none are sent while "Confirm no breaks taken" is ticked.
 * Null when the code is not a break code or the index names no sent row.
 */
export function serverBreakRowError(
  code: string,
  details: Readonly<Record<string, unknown>> | undefined,
  sent: { rows: readonly BreakRowDraft[]; noBreaks: boolean },
): BreakRowError | null {
  const text = SERVER_ROW_MESSAGES[code];
  const index = details?.break_index;
  const rows = sent.noBreaks ? [] : sent.rows;
  if (text === undefined || typeof index !== 'number' || !Number.isInteger(index)) return null;
  const row = rows[index];
  if (row === undefined) return null;
  const label = breakLabel(index);
  return { index, key: row.key, label, kind: 'server', message: `${label} ${text}`, problem: null };
}

/* ---- Pre-fill (U-23) ------------------------------------------------------------------------- */

export interface ReferenceHours {
  start: LocalField;
  end: LocalField;
  startUtc: EpochSeconds;
  endUtc: EpochSeconds;
}

/**
 * The policy's reference start and end as wall-clock times on the accounting date in the saved
 * reporting zone (resolved as configured schedule times: a repeated time takes the earlier instant,
 * a missing one moves forward by the gap), shown in the input zone pinned by offset. The end is on
 * the next date when its clock time is not after the start's. Null without a policy or valid zones.
 */
export function referenceHours(
  policy: PolicyVersion | undefined,
  workDate: string,
  reportingZone: string,
  inputZone: string,
): ReferenceHours | null {
  if (policy === undefined || !isCivilDate(workDate) || !isValidTimeZone(reportingZone) || !isValidTimeZone(inputZone)) return null;
  let startClock: number;
  let endClock: number;
  try {
    startClock = parseClockTime(policy.reference_start);
    endClock = parseClockTime(policy.reference_end);
  } catch (caught) {
    if (isDomainError(caught)) return null;
    throw caught;
  }
  const endDate = endClock > startClock ? workDate : addDays(workDate, 1);
  const startUtc = resolveLocalDateTimeCompatible(`${workDate}T${policy.reference_start}`, reportingZone);
  const endUtc = resolveLocalDateTimeCompatible(`${endDate}T${policy.reference_end}`, reportingZone);
  return { start: fieldFromInstant(inputZone, startUtc), end: fieldFromInstant(inputZone, endUtc), startUtc, endUtc };
}

export interface SuggestionContext {
  workDate: string;
  /** `today_local` as the server reports it (never the device clock); null while unknown. */
  todayLocal: string | null;
  policy: PolicyVersion | undefined;
  keyOf: (index: number) => string;
}

/**
 * The policy's suggested breaks shifted by the session start (the shared `suggestBreaks`), only
 * for an accounting date before the server's today and only those lying inside the session. For
 * today and later dates there are none, so no future break is ever offered.
 */
export function pastDaySuggestedRows(context: SuggestionContext, session: { startUtc: EpochSeconds; endUtc: EpochSeconds }, zone: string): BreakRowDraft[] {
  const { workDate, todayLocal, policy } = context;
  if (policy === undefined || todayLocal === null || !isCivilDate(workDate) || !isCivilDate(todayLocal)) return [];
  if (!(workDate < todayLocal)) return [];
  return suggestBreaks(session.startUtc, toBreakRules(policy.breaks))
    .filter((item) => item.startUtc >= session.startUtc && item.endUtc <= session.endUtc)
    .map((item, index) => pinnedRow(context.keyOf(index), 'suggested', zone, item.startUtc, item.endUtc, item.countsAsWork));
}

/**
 * The policy's suggested breaks shifted by a start instant (the shared `suggestBreaks`), keeping only those that lie inside the
 * session (all of them while it has no end yet), as untouched "suggested" rows pinned in the input zone. Unlike
 * `pastDaySuggestedRows` it has no past-day rule: it serves "Suggest breaks" and "Confirm breaks", which the person asks for
 * (the server still refuses a break that has not happened). Row keys come from `keyOf(index)`.
 */
export function suggestionRows(
  policy: PolicyVersion,
  startUtc: EpochSeconds,
  endUtc: EpochSeconds | null,
  zone: string,
  keyOf: (index: number) => string,
): BreakRowDraft[] {
  return suggestBreaks(startUtc, toBreakRules(policy.breaks))
    .filter((item) => item.startUtc >= startUtc && (endUtc === null || item.endUtc <= endUtc))
    .map((item, index) => pinnedRow(keyOf(index), 'suggested', zone, item.startUtc, item.endUtc, item.countsAsWork));
}

/**
 * The rows the session dialog opens with when "Confirm breaks" is pressed on a saved session (docs/04: the saved rows, or, when it
 * has none, the suggested breaks that lie inside the session; WP5-UX3-FIX3 item 8). Only an ended session whose breaks are not
 * confirmed and that has no saved row is offered suggestions, each one that fits (`suggestionRows`), so a 09:00-14:00 session gets
 * the first two of three and a session that fits none gets nothing, which Save then asks about through the G-4 notice. The saved
 * rows themselves come from `sessionDialogDraftFromSession`; this function returns none for a session that has them.
 */
export function confirmBreaksRows(session: Session, policy: PolicyVersion | undefined, keyOf: (index: number) => string): BreakRowDraft[] {
  if (policy === undefined || session.end_utc === null || session.breaks_confirmed || session.breaks.length > 0) return [];
  return suggestionRows(policy, parseUtcInstant(session.start_utc), parseUtcInstant(session.end_utc), session.input_zone, keyOf);
}

/**
 * Places the suggestions again from the current start and end, until the person edits a break
 * row: a draft whose rows were changed, or that holds any row not suggested, is returned as it is,
 * and so is one whose start or end cannot be resolved yet. The caller decides when to call it.
 */
export function reshiftSuggestions(draft: SessionDialogDraft, context: SuggestionContext): SessionDialogDraft {
  if (draft.breaksEdited || draft.rows.some((row) => row.origin !== 'suggested')) return draft;
  const zone = draft.zone.trim();
  if (!fieldIsFilled(draft.start) || !fieldIsFilled(draft.end)) return draft;
  const start = resolveField(draft.start, zone);
  const end = resolveField(draft.end, zone);
  if (!start.ok || !end.ok) return draft;
  return { ...draft, rows: pastDaySuggestedRows(context, { startUtc: start.utc, endUtc: end.utc }, zone) };
}

/** Sets the start and end to the reference hours (the caller decides whether this is automatic or a button). */
export function applyReferenceHours(draft: SessionDialogDraft, hours: ReferenceHours): SessionDialogDraft {
  return { ...draft, start: hours.start, end: hours.end };
}

/* ---- Save confirmation and Cancel ------------------------------------------------------------ */

export interface BreaksSummary {
  text: string;
  /** False only when nothing is confirmed (the sentence "Saving confirms these breaks..." is left out). */
  confirms: boolean;
}

/** The Breaks line of the Save confirmation: "3 breaks (15, 30, 15 min)", "No breaks taken" or not confirmed. */
export function breaksSummary(rows: readonly BreakRowDraft[], noBreaks: boolean): BreaksSummary {
  if (noBreaks) return { text: 'No breaks taken', confirms: true };
  if (rows.length === 0) return { text: 'Breaks not confirmed: OT for this day stays pending', confirms: false };
  const minutes = rows.map((row) => minutesKey(row.minutes));
  return { text: `${rows.length} ${rows.length === 1 ? 'break' : 'breaks'} (${minutes.join(', ')} min)`, confirms: true };
}

/** `9:00`, `09:00` and `09:00:00` are the same time; anything else compares as typed. */
function timeKey(text: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  if (match === null) return text.trim();
  return `${(match[1] ?? '').padStart(2, '0')}:${match[2] ?? ''}:${match[3] ?? '00'}`;
}

/** `015` and `15` are the same minutes; anything else compares as typed (trimmed). */
function minutesKey(text: string): string {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

function fieldKey(field: LocalField): string {
  return `${field.date}|${timeKey(field.time)}|${field.fold ?? ''}`;
}

/**
 * Whether Cancel must ask "Discard your changes?". Compared: the zone (trimmed), start and end
 * (date, time, fold), the box, and the rows in order (date, time, fold, minutes, counts as work).
 * Ignored as cosmetic: `9:00` vs `09:00` vs `09:00:00`, `015` vs `15` minutes, surrounding spaces,
 * row keys and origins, a pinning offset of an unchanged wall time, and the hidden rows while the
 * box is ticked in both states (nothing of them would be saved).
 */
export function sessionDialogIsDirty(initial: SessionDialogDraft, current: SessionDialogDraft): boolean {
  if (initial.zone.trim() !== current.zone.trim()) return true;
  if (fieldKey(initial.start) !== fieldKey(current.start) || fieldKey(initial.end) !== fieldKey(current.end)) return true;
  if (initial.noBreaks !== current.noBreaks) return true;
  if (initial.noBreaks && current.noBreaks) return false;
  const rowKey = (row: BreakRowDraft) => `${fieldKey(row.start)}|${minutesKey(row.minutes)}|${row.countsAsWork ? 1 : 0}`;
  if (initial.rows.length !== current.rows.length) return true;
  return initial.rows.some((row, index) => {
    const other = current.rows[index];
    return other === undefined || rowKey(row) !== rowKey(other);
  });
}
