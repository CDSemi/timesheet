import { ApiRequestError, type DayCategory } from '../api.ts';
import { CATEGORIES } from './sessionModel.ts';

/** A one-line message for a failed request: the server's own message and its code. */
export function describeError(caught: unknown): string {
  return caught instanceof ApiRequestError ? `${caught.message} (${caught.code})` : 'Request failed';
}

/** A 409 stale_version: the record changed since the editor loaded it. */
export function isStaleVersion(caught: unknown): boolean {
  return caught instanceof ApiRequestError && caught.status === 409 && caught.code === 'stale_version';
}

/** A calendar default that changed under an open editor: what the form showed (null: none) and what the calendar gives now. */
export interface DefaultChange {
  workDate: string;
  expected: DayCategory | null;
  current: DayCategory;
}

const isCategory = (value: unknown): value is DayCategory => CATEGORIES.some((category) => category === value);

/**
 * A 409 default_changed of PUT /days/:date (R-UX5I2-3) with the shape the notice needs; null for any other failure, so the
 * caller falls back to the generic message. The batch commit's answer (work_dates, changes) is not this shape.
 */
export function defaultChangeOf(caught: unknown): DefaultChange | null {
  if (!(caught instanceof ApiRequestError) || caught.status !== 409 || caught.code !== 'default_changed') return null;
  const details = caught.details;
  if (details === undefined) return null;
  const { work_date: workDate, expected_default: expected, current_default: current } = details;
  if (typeof workDate !== 'string' || !isCategory(current)) return null;
  if (expected !== null && !isCategory(expected)) return null;
  return { workDate, expected, current };
}
