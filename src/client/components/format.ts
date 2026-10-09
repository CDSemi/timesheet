import { formatDuration } from '../../domain/format.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone } from '../../domain/zones.ts';
import type { Period, Session } from '../api.ts';

/** The viewer's current zone; it changes display only, never the saved accounting date. */
export const displayZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Hours and minutes (1h 30m), or the word `none` when the server has no value. */
export function minutesText(value: number | null | undefined): string {
  return value === null || value === undefined ? 'none' : formatDuration(value);
}

function localTime(instant: string, zone: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(11, 16);
}

function localDate(instant: string, zone: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(0, 10);
}

/** An accounting date `YYYY-MM-DD` as the US form date `MM/DD/YYYY`, as the Excel form and the PDF print it. */
export function usDate(date: string): string {
  return `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
}

/** An accounting date `YYYY-MM-DD` as the short US form `MM/DD`, the date cell of the sheet. */
export function usShortDate(date: string): string {
  return `${date.slice(5, 7)}/${date.slice(8, 10)}`;
}

/** A period as a range in words, for example `2026-09-28 to 2026-10-11`. */
export function periodRange(period: Pick<Period, 'period_start' | 'period_end'>): string {
  return `${period.period_start} to ${period.period_end}`;
}

/** A UTC instant as `YYYY-MM-DD HH:MM` in the given zone. */
export function instantText(instant: string, zone: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(0, 16).replace('T', ' ');
}

/**
 * One session in the display zone. A note names the local dates when the session crosses
 * midnight or sits on another local date than its accounting date.
 */
export function sessionText(session: Session, workDate: string, zone: string): string {
  const start = localTime(session.start_utc, zone);
  if (session.end_utc === null) return `${start} to running`;
  const startDate = localDate(session.start_utc, zone);
  const endDate = localDate(session.end_utc, zone);
  const dateNote = startDate !== workDate || endDate !== startDate ? ` (${startDate} to ${endDate})` : '';
  const breaks = session.breaks_confirmed ? `${session.breaks.length} break(s)` : 'breaks unconfirmed';
  return `${start} to ${localTime(session.end_utc, zone)}${dateNote}, ${breaks}`;
}
