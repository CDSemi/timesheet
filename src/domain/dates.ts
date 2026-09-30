import { DomainError } from './errors.ts';

/** Accounting (civil) date without a zone, formatted `YYYY-MM-DD`. */
export type CivilDate = string;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SECONDS_PER_DAY = 86_400;
const MIN_YEAR = 1900;
const MAX_YEAR = 2999;

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function pad4(value: number): string {
  return String(value).padStart(4, '0');
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isCivilDate(value: unknown): value is CivilDate {
  if (typeof value !== 'string') return false;
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

export function assertCivilDate(value: unknown, field = 'date'): CivilDate {
  if (!isCivilDate(value)) {
    throw new DomainError('invalid_date', `${field} must be a valid YYYY-MM-DD date`, { field });
  }
  return value;
}

/** Whole days since 1970-01-01 for a validated civil date. */
export function toDayNumber(date: CivilDate): number {
  const match = DATE_PATTERN.exec(date);
  if (!match) throw new DomainError('invalid_date', `Invalid date ${date}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / (SECONDS_PER_DAY * 1000);
}

export function fromDayNumber(dayNumber: number): CivilDate {
  const value = new Date(dayNumber * SECONDS_PER_DAY * 1000);
  return `${pad4(value.getUTCFullYear())}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}`;
}

export function addDays(date: CivilDate, days: number): CivilDate {
  return fromDayNumber(toDayNumber(date) + days);
}

/** `later - earlier` in whole days. */
export function diffDays(later: CivilDate, earlier: CivilDate): number {
  return toDayNumber(later) - toDayNumber(earlier);
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(date: CivilDate): number {
  const weekday = new Date(toDayNumber(date) * SECONDS_PER_DAY * 1000).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

/** Inclusive list of dates from `start` to `end`. */
export function datesBetween(start: CivilDate, end: CivilDate): CivilDate[] {
  const result: CivilDate[] = [];
  for (let day = toDayNumber(start), last = toDayNumber(end); day <= last; day += 1) {
    result.push(fromDayNumber(day));
  }
  return result;
}
