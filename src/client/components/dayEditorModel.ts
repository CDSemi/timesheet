import { suggestBreaks } from '../../domain/breaks.ts';
import { isoWeekday } from '../../domain/dates.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone, localDateOf } from '../../domain/zones.ts';
import type { DayView, PeriodRelation, PolicyVersion, Session, SessionRequest } from '../api.ts';
import { savedBreakMinutes } from './breakRowsModel.ts';
import { WEEKDAYS } from './dayModel.ts';
import { usDate, usShortDate } from './format.ts';
import { PERIOD_PILL_WORDS, type PeriodPillKind, viewingZoneText, zoneNoteVisible } from './periodBarModel.ts';
import { sessionRange } from './sheetModel.ts';
import {
  type BreakRow,
  buildSessionRequest,
  draftFromSession,
  type SessionDraft,
  suggestedRows,
  toBreakRules,
} from './sessionModel.ts';

/*
 * Pure logic of the day editor panel (WP5-UX-T04): the banner at its top and the one-tap break
 * confirmation of a saved session. Nothing here computes business minutes. The one-tap action
 * builds exactly the body the session form sends after "Suggest breaks" and "Confirm suggested
 * breaks" (PUT /api/sessions/:id with the loaded version); the suggestions come from the shared
 * `suggestBreaks`, and the server still checks every rule.
 */

export interface DayBanner {
  tone: 'attention' | 'error';
  text: string;
}

/** What the day still needs, from the server's calculation status; null when nothing is pending. */
export function dayBanner(day: DayView): DayBanner | null {
  if (day.calculation_error !== null) return { tone: 'error', text: `Calculation: ${day.calculation_error.replace(/_/g, ' ')}.` };
  const pending = 'OT for this day stays pending until breaks are confirmed and every session has ended.';
  switch (day.calculation?.status) {
    case 'incomplete_breaks':
      return { tone: 'attention', text: `Breaks are not confirmed yet. ${pending}` };
    case 'incomplete':
      return { tone: 'attention', text: `A session has no end yet. ${pending}` };
    default:
      return null;
  }
}

/**
 * The breaks a one-tap confirmation would save for a session whose breaks are not confirmed:
 * `listed` = the rows already saved with it, `suggested` = the policy breaks shifted by its start,
 * `none` = nothing to confirm except "no breaks taken" (no policy, no policy breaks, or a suggested
 * break that does not lie inside the session, which the server would refuse).
 */
export interface QuickBreaks {
  kind: 'listed' | 'suggested' | 'none';
  /** The rows sent with a confirmation, pinned by offset in the session's input zone. */
  rows: BreakRow[];
  /** Each break as `HH:MM-HH:MM` in the display zone (R-07). */
  chips: string[];
}

function clock(zone: string, instant: number): string {
  return formatInZone(zone, instant).slice(11, 16);
}

/** Null for a running session or one whose breaks are already confirmed: nothing to offer. */
export function quickBreaksOf(session: Session, policy: PolicyVersion | undefined, displayZone: string): QuickBreaks | null {
  if (session.end_utc === null || session.breaks_confirmed) return null;
  if (session.breaks.length > 0) {
    return {
      kind: 'listed',
      rows: draftFromSession(session).breaks,
      chips: session.breaks.map((item) => `${clock(displayZone, parseUtcInstant(item.start_utc))}-${clock(displayZone, parseUtcInstant(item.end_utc))}`),
    };
  }
  if (policy === undefined || policy.breaks.length === 0) return { kind: 'none', rows: [], chips: [] };
  const start = parseUtcInstant(session.start_utc);
  const end = parseUtcInstant(session.end_utc);
  const suggestions = suggestBreaks(start, toBreakRules(policy.breaks));
  // An instant comparison only: a suggestion outside the session would be refused by the server.
  if (suggestions.some((item) => item.startUtc < start || item.endUtc > end)) return { kind: 'none', rows: [], chips: [] };
  return {
    kind: 'suggested',
    rows: suggestedRows(start, session.input_zone, policy.breaks, (index) => `quick-${session.id}-${index}`),
    chips: suggestions.map((item) => `${clock(displayZone, item.startUtc)}-${clock(displayZone, item.endUtc)}`),
  };
}

/**
 * The session update of a one-tap choice: `confirm` sends the quick rows with breaks confirmed,
 * `none` confirms that no break was taken. Start, end and zone stay as saved (pinned by offset),
 * and the version the editor loaded goes with it.
 */
export function quickBreaksRequest(session: Session, quick: QuickBreaks, choice: 'confirm' | 'none', reason: string): SessionRequest {
  const draft = draftFromSession(session);
  const confirmed = choice === 'confirm' ? { breaks: quick.rows, mode: 'confirmed' as const } : { breaks: [], mode: 'none' as const };
  return buildSessionRequest({ ...draft, ...confirmed }, { expectedVersion: session.version, reason });
}

/**
 * The form draft behind the "Confirm breaks" entry (WP5-UX3-T07): the session as saved, with the breaks the old
 * one-tap rule offered (`quickBreaksOf`) selected as the ones taken. Saving it unchanged sends exactly the body
 * `quickBreaksRequest` built for "confirm" (listed or suggested rows) or, when nothing fits, for "none".
 */
export function confirmBreaksDraft(session: Session, quick: QuickBreaks): SessionDraft {
  const draft = draftFromSession(session);
  return quick.kind === 'none' ? { ...draft, breaks: [], mode: 'none' } : { ...draft, breaks: quick.rows, mode: 'confirmed' };
}

/* ---- Header chips (U-19, U-20) ----------------------------------------------------------------------- */

export interface EditorChip {
  key: 'period' | 'times' | 'day' | 'view-only';
  text: string;
  /** Set on the period chip: the pill colour class (`badge old`, `badge in-progress`, ...). */
  pill?: PeriodPillKind;
}

/**
 * The chips under the title of the panel. The title is the accounting date; the chips name the period and the zones, so
 * the rule that dates belong to the reporting zone stays visible without a long sentence (AGENTS rule 7). `pill` is the
 * period pill of the sheet's period bar (`periodPillKind`, which can say "in progress"); without it the server's own
 * relation of the day decides. "Day in ..." appears only while the display zone differs from the reporting zone, and
 * "View only" while the editor cannot change anything.
 */
export function editorChips(input: { relation: PeriodRelation; pill?: PeriodPillKind; displayZone: string; reportingZone: string; readOnly: boolean }): EditorChip[] {
  const pill = input.pill === undefined || input.pill === 'neutral' ? input.relation : input.pill;
  const chips: EditorChip[] = [{ key: 'period', text: pill === 'in-progress' ? PERIOD_PILL_WORDS[pill] : `${PERIOD_PILL_WORDS[pill]} period`, pill }];
  chips.push({ key: 'times', text: viewingZoneText(input.displayZone) });
  if (zoneNoteVisible(input.reportingZone, input.displayZone)) chips.push({ key: 'day', text: `Day in ${input.reportingZone}` });
  if (input.readOnly) chips.push({ key: 'view-only', text: 'View only' });
  return chips;
}

/** The heading of the panel: `Mon 10/12/2026` (the accounting date, never converted). */
export function editorTitle(workDate: string): string {
  return `${WEEKDAYS[isoWeekday(workDate) - 1] ?? ''} ${usDate(workDate)}`;
}

/* ---- Session cards (U-21, panel part) ---------------------------------------------------------------- */

export type SessionCardState = 'confirmed' | 'none' | 'unconfirmed' | 'running';

export interface SessionCardBreak {
  key: string;
  /** The number of the break in the list, `1` for "Break 1". */
  number: number;
  /** `MM/DD` of the start in the display zone. */
  date: string;
  /** `HH:MM` of the start in the display zone. */
  start: string;
  /** The elapsed whole minutes of the saved interval (`savedBreakMinutes`; a display of the saved break, not a business figure). */
  minutes: number;
}

export interface SessionCard {
  id: string;
  state: SessionCardState;
  stateText: string;
  /** `09:00-17:30`, `22:00-06:00+1`, or the start alone while the session runs, in the display zone. */
  range: string;
  /** `MM/DD` when the session starts on another local date than its accounting date (another zone, or after midnight). */
  startDate: string | null;
  source: string;
  /** The caption of the break table. */
  caption: string;
  /** The listed breaks; empty for a running session (it has no table). */
  breaks: SessionCardBreak[];
  /** The words of an empty table: "No breaks taken" for a session confirmed without breaks, else null. */
  emptyText: string | null;
  /** The attention words of a session whose breaks are not confirmed, else null. */
  attentionText: string | null;
  /** "Running since 08:12" for a running session, else null. */
  runningText: string | null;
}

function localClock(zone: string, instant: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(11, 16);
}

/**
 * One session as a card of the panel, from the server's session and the display zone. Words and the elapsed minutes of the
 * saved breaks only: whether the session counts, and what it is worth, stay the server's (the figures section).
 */
export function sessionCardOf(session: Session, workDate: string, zone: string): SessionCard {
  const range = sessionRange(session, workDate, zone);
  const base = {
    id: session.id,
    range: range.text,
    startDate: range.startDate,
    source: session.source === 'manual' ? `Entered by hand in ${session.input_zone}` : 'Checked in and out',
    caption: `Breaks of ${range.text}`,
  };
  if (session.end_utc === null) {
    return {
      ...base,
      state: 'running',
      stateText: 'Running',
      breaks: [],
      emptyText: null,
      attentionText: null,
      runningText: `Running since ${localClock(zone, session.start_utc)}`,
    };
  }
  const breaks = session.breaks.map((item, index) => ({
    key: item.id,
    number: index + 1,
    date: usShortDate(localDateOf(zone, parseUtcInstant(item.start_utc))),
    start: localClock(zone, item.start_utc),
    minutes: savedBreakMinutes(item.start_utc, item.end_utc),
  }));
  if (!session.breaks_confirmed) {
    return {
      ...base,
      state: 'unconfirmed',
      stateText: 'Breaks not confirmed',
      breaks,
      emptyText: null,
      attentionText: 'OT stays pending until breaks are confirmed.',
      runningText: null,
    };
  }
  const none = breaks.length === 0;
  return {
    ...base,
    state: none ? 'none' : 'confirmed',
    stateText: none ? 'No breaks taken' : 'Breaks confirmed',
    breaks,
    emptyText: none ? 'No breaks taken' : null,
    attentionText: null,
    runningText: null,
  };
}

/** The Breaks line of the delete confirmation, in the words of the Save confirmation: `3 breaks (15, 30, 15 min)`. */
export function cardBreaksText(card: SessionCard): string {
  if (card.state === 'running') return 'Running, no end yet';
  if (card.state === 'none') return 'No breaks taken';
  const count = `${card.breaks.length} ${card.breaks.length === 1 ? 'break' : 'breaks'}`;
  const minutes = ` (${card.breaks.map((item) => item.minutes).join(', ')} min)`;
  if (card.state === 'unconfirmed') return card.breaks.length === 0 ? 'Breaks not confirmed' : `${count}${minutes}, not confirmed`;
  return `${count}${minutes}`;
}

export interface ConfirmFact {
  label: string;
  value: string;
}

/** What the delete confirmation lists: the day, the time in the display zone and the breaks of the session. */
export function deleteFacts(session: Session, workDate: string, zone: string): ConfirmFact[] {
  const card = sessionCardOf(session, workDate, zone);
  return [
    { label: 'Day', value: editorTitle(workDate) },
    { label: 'Time', value: `${card.startDate === null ? '' : `${card.startDate} `}${card.range} (${zone})` },
    { label: 'Breaks', value: cardBreaksText(card) },
  ];
}
