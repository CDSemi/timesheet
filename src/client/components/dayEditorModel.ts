import { isoWeekday } from '../../domain/dates.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone, localDateOf } from '../../domain/zones.ts';
import type { DayView, Period, PeriodRelation, Session } from '../api.ts';
import { savedBreakMinutes } from './breakRowsModel.ts';
import { WEEKDAYS } from './dayModel.ts';
import { usDate, usShortDate } from './format.ts';
import { PERIOD_PILL_WORDS, type PeriodPillKind, periodPillKind, viewingZoneText, zoneNoteVisible } from './periodBarModel.ts';
import { sessionRange } from './sheetModel.ts';

/*
 * Pure logic of the day editor panel (WP5-UX-T04): the banner at its top and the session cards. Nothing here
 * computes business minutes. The breaks "Confirm breaks" opens the session dialog with (`confirmBreaksRows`) and
 * the request are built by the session dialog's model (`breakRowsModel`); the server still checks every rule.
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

/* ---- Header chips (U-19, U-20) ----------------------------------------------------------------------- */

/**
 * The period pill of a day's own period, for the editor chip (G-5 b, WP5-UX3-FIX2): the shown period when it contains the day,
 * else the server's `in_progress` or `current` period when it does, so a day opened through "Open a day" or "Today" reads the same
 * word as the bar shows for its period ("in progress" in the five window days). Undefined when none of them contains the day: the
 * server's own relation of the day then decides. Dates are accounting dates compared as text; nothing reads a clock or a zone.
 */
export function dayPeriodPill(
  date: string,
  shown: Pick<Period, 'payroll_date' | 'period_start' | 'period_end' | 'relation'>,
  periods: { current: Period; in_progress: Period } | null,
): PeriodPillKind | undefined {
  const contains = (period: Pick<Period, 'period_start' | 'period_end'>) => period.period_start <= date && date <= period.period_end;
  if (contains(shown)) return periodPillKind(shown, periods);
  if (periods === null) return undefined;
  if (contains(periods.in_progress)) return periodPillKind(periods.in_progress, periods);
  if (contains(periods.current)) return periodPillKind(periods.current, periods);
  return undefined;
}

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
