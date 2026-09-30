import { isCivilDate } from './dates.ts';
import { DomainError } from './errors.ts';

/** A UTC instant as integer seconds since the Unix epoch (second precision, R-01). */
export type EpochSeconds = number;

const UTC_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?Z$/;

/**
 * Parses `YYYY-MM-DDTHH:MM:SSZ`. A fractional part is accepted only when it is zero,
 * so sub-second input is rejected instead of being silently truncated.
 */
export function parseUtcInstant(value: unknown, field = 'instant'): EpochSeconds {
  const match = typeof value === 'string' ? UTC_PATTERN.exec(value) : null;
  const fail = (): never => {
    throw new DomainError('invalid_instant', `${field} must be a UTC instant such as 2026-09-21T16:00:00Z`, {
      field,
    });
  };
  if (!match) return fail();
  const [, date, hh, mm, ss, fraction] = match;
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);
  if (!isCivilDate(date) || hour > 23 || minute > 59 || second > 59) return fail();
  if (fraction !== undefined && /[1-9]/.test(fraction)) return fail();
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return Date.UTC(year, month - 1, day, hour, minute, second) / 1000;
}

export function formatUtcInstant(instant: EpochSeconds): string {
  if (!Number.isSafeInteger(instant)) {
    throw new DomainError('invalid_instant', 'Instant must be whole epoch seconds');
  }
  return new Date(instant * 1000).toISOString().replace('.000Z', 'Z');
}

/** Truncates a JavaScript Date to whole seconds, as a live clock stores it. */
export function epochSecondsOf(date: Date): EpochSeconds {
  return Math.floor(date.getTime() / 1000);
}
