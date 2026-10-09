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
  return `Due ${weekdayName(period.due_local_date)} ${usDate(period.due_local_date)}, ${period.due_local_time} (${reportingZone})`;
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
