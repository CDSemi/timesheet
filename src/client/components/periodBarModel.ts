import { isoWeekday } from '../../domain/dates.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone } from '../../domain/zones.ts';
import type { Period, Session, TimesheetView } from '../api.ts';
import { usDate, usShortDate } from './format.ts';

/*
 * Display-only helpers of the period bar and the clock panel. They format server fields (dates,
 * instants, sessions) as words; none of them computes worked, break, credited or OT minutes.
 */

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** The short weekday name of an accounting date `YYYY-MM-DD`, for example `Tue`. */
export function weekdayName(date: string): string {
  return WEEKDAYS[isoWeekday(date) - 1] ?? '';
}

/**
 * The due date in words, in the reporting zone that owns it: `Due Tue 12/08/2026, 17:00 (America/Los_Angeles)`.
 * The date and time are the server's `due_local_*` fields; nothing is converted here.
 */
export function dueInWords(period: Pick<Period, 'due_local_date' | 'due_local_time'>, reportingZone: string): string {
  const { label, value } = dueParts(period, reportingZone);
  return `${label} ${value}`;
}

/** The due line in two parts: the label word `Due` (shown in the label style) and the value `Tue 12/08/2026, 17:00 (America/Los_Angeles)`. Their text joined by one space is `dueInWords`. */
export function dueParts(period: Pick<Period, 'due_local_date' | 'due_local_time'>, reportingZone: string): { label: string; value: string } {
  return {
    label: 'Due',
    value: `${weekdayName(period.due_local_date)} ${usDate(period.due_local_date)}, ${period.due_local_time} (${reportingZone})`,
  };
}

/**
 * The short form of the review link's label, shown on a phone only when the full label does not fit on one line beside the other buttons
 * (the accessible name stays the full label, which contains the short text). `Review & sign off` becomes `Sign off`; `Review now` and
 * `Review or correct` become `Review`, the one word that names the action of both (the review screen is where a correction is made).
 */
export function reviewShortLabel(label: string): string {
  if (label === 'Review & sign off') return 'Sign off';
  if (label === 'Review now' || label === 'Review or correct') return 'Review';
  return label;
}

/** What the pill of a period says and how it is coloured. `in-progress` is the fifth hue of the pill set; `neutral` is the grey one. */
export type PeriodPillKind = 'old' | 'current' | 'future' | 'in-progress' | 'neutral';

/** The visible word of each pill kind. The relation words are the server's own; the hue is never the only cue. */
export const PERIOD_PILL_WORDS: Record<PeriodPillKind, string> = {
  old: 'old',
  current: 'current',
  future: 'future',
  'in-progress': 'in progress',
  neutral: '',
};

/**
 * The pill of the shown period, from the server's values only (G-5 b; never the device clock or the display zone). It is the
 * server's relation (`old`, `current`, `future`), except in the five window days after a period ends: there `current` is the ended
 * period and `in_progress` the one that contains today, and the period whose payroll date equals `in_progress` reads `in progress`.
 * The edit-reason rules still use the server's own relation (that period stays `future` for them). A period without a relation is
 * `neutral`. A shared view passes the owner's periods, so both views follow one rule.
 */
export function periodPillKind(
  period: Pick<Period, 'payroll_date' | 'relation'>,
  periods: { current: Pick<Period, 'payroll_date'>; in_progress: Pick<Period, 'payroll_date'> } | null,
): PeriodPillKind {
  if (periods !== null && periods.in_progress.payroll_date !== periods.current.payroll_date && period.payroll_date === periods.in_progress.payroll_date) {
    return 'in-progress';
  }
  return period.relation ?? 'neutral';
}

/** The due instant in the display zone, formatted like the bar: `Wed 10/14/2026, 07:00`. Display only; the instant and zone are unchanged. */
export function dueInZoneText(dueAtUtc: string, zone: string): string {
  const local = formatInZone(zone, parseUtcInstant(dueAtUtc));
  const date = local.slice(0, 10);
  return `${weekdayName(date)} ${usDate(date)}, ${local.slice(11, 16)}`;
}

/** The compact line that always names the zone this browser shows times in, for example `Times in Asia/Saigon`. */
export function viewingZoneText(displayZone: string): string {
  return `Times in ${displayZone}`;
}

/** The longer zone note (both zones and the accounting-date explanation) shows only when the browser's display zone differs from the saved reporting zone. */
export function zoneNoteVisible(reportingZone: string, displayZone: string): boolean {
  return reportingZone !== displayZone;
}

/** The running session (no end yet) of a loaded period, if any. */
export function runningSessionOf(view: Pick<TimesheetView, 'days'>): Session | undefined {
  return view.days.flatMap((day) => day.sessions).find((session) => session.end_utc === null);
}

export interface ClockedInText {
  /** The local clock time of the start in the display zone, `HH:MM`. */
  time: string;
  /** The local date of the start in the display zone, for example `Thu 12/03`. */
  day: string;
}

/** When the running session began, in the display zone (instants are shown in the device zone). */
export function clockedInText(session: Pick<Session, 'start_utc'>, zone: string): ClockedInText {
  const local = formatInZone(zone, parseUtcInstant(session.start_utc));
  const date = local.slice(0, 10);
  return { time: local.slice(11, 16), day: `${weekdayName(date)} ${usShortDate(date)}` };
}
