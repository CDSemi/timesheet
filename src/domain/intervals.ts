import { DomainError } from './errors.ts';
import type { EpochSeconds } from './instants.ts';

/*
 * R-01 interval rules: half-open [start, end), end after start, breaks inside their
 * session and non-overlapping, and no overlap between one user's sessions across all
 * work dates. An open session (end = null) extends indefinitely for overlap checks.
 */

export interface BreakInterval {
  startUtc: EpochSeconds;
  endUtc: EpochSeconds;
  /** A break that counts as work is recorded but not subtracted. */
  countsAsWork: boolean;
  /** Unconfirmed (suggested) break information keeps the day pending. */
  confirmed: boolean;
}

export interface SessionInterval {
  startUtc: EpochSeconds;
  endUtc: EpochSeconds | null;
  breaks: readonly BreakInterval[];
  /** True once actual breaks, or explicitly none, were confirmed; false means unknown. */
  breaksConfirmed: boolean;
}

export interface UserInterval {
  /** Caller-defined identifier reported in the error details. */
  key?: string;
  startUtc: EpochSeconds;
  endUtc: EpochSeconds | null;
}

function assertInstant(value: unknown, field: string): void {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new DomainError('invalid_instant', `${field} must be whole epoch seconds`, { field });
  }
}

export function validateSessionShape(session: SessionInterval, key?: string): void {
  assertInstant(session.startUtc, 'startUtc');
  if (session.endUtc !== null) assertInstant(session.endUtc, 'endUtc');
  if (session.endUtc !== null && session.endUtc <= session.startUtc) {
    throw new DomainError('end_not_after_start', 'A session must end after it starts', { session: key });
  }
  const breaks = [...session.breaks].sort((a, b) => a.startUtc - b.startUtc);
  for (const item of breaks) {
    assertInstant(item.startUtc, 'break.startUtc');
    assertInstant(item.endUtc, 'break.endUtc');
    if (item.endUtc <= item.startUtc) {
      throw new DomainError('end_not_after_start', 'A break must end after it starts', { session: key });
    }
    if (item.startUtc < session.startUtc || (session.endUtc !== null && item.endUtc > session.endUtc)) {
      throw new DomainError('break_outside_session', 'Breaks must lie inside their work session', { session: key });
    }
  }
  for (let index = 1; index < breaks.length; index += 1) {
    const previous = breaks[index - 1];
    const current = breaks[index];
    if (previous !== undefined && current !== undefined && current.startUtc < previous.endUtc) {
      throw new DomainError('overlapping_breaks', 'Breaks in a session must not overlap', { session: key });
    }
  }
}

export function validateUserIntervals(intervals: readonly UserInterval[]): void {
  const sorted = [...intervals].sort((a, b) => a.startUtc - b.startUtc);
  let latestEnd = Number.NEGATIVE_INFINITY;
  let latestOwner: UserInterval | undefined;
  for (const interval of sorted) {
    if (latestOwner !== undefined && interval.startUtc < latestEnd) {
      throw new DomainError('overlapping_user_intervals', 'Work sessions of one user must not overlap', {
        existing: latestOwner.key,
        conflicting: interval.key,
      });
    }
    const end = interval.endUtc ?? Number.POSITIVE_INFINITY;
    if (end > latestEnd) {
      latestEnd = end;
      latestOwner = interval;
    }
  }
}

/** Net working intervals of a closed session: the session minus excluded breaks. */
export function netWorkIntervals(session: SessionInterval): Array<[EpochSeconds, EpochSeconds]> {
  if (session.endUtc === null) throw new DomainError('end_not_after_start', 'An open session has no net work yet');
  const excluded = session.breaks
    .filter((item) => !item.countsAsWork)
    .sort((a, b) => a.startUtc - b.startUtc);
  const result: Array<[EpochSeconds, EpochSeconds]> = [];
  let cursor = session.startUtc;
  for (const item of excluded) {
    if (item.startUtc > cursor) result.push([cursor, item.startUtc]);
    cursor = Math.max(cursor, item.endUtc);
  }
  if (cursor < session.endUtc) result.push([cursor, session.endUtc]);
  return result;
}

export function excludedBreakSeconds(session: SessionInterval): number {
  return session.breaks.reduce((total, item) => total + (item.countsAsWork ? 0 : item.endUtc - item.startUtc), 0);
}
