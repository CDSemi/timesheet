/*
 * Pure seed-day selection for the browser specs (no Playwright import, so a unit test can run it).
 *
 * The page opens on the period `currentPayPeriod` returns: the one with the earliest payroll date on
 * or after today. For the default schedule (period P-18..P-5, due P-3) the period that CONTAINS today
 * is a different, later one on the five days P-4..P (Monday through the payroll Friday, inclusive):
 * the previous period stays on screen through its payroll date. A day taken from the in-progress
 * period is then not on the page. These helpers only ever return days of the period the page shows.
 */

import { addDays } from '../../src/domain/dates.ts';

/** The slice of one timesheet day the selection reads. */
export interface SeedDayFacts {
  work_date: string;
  classification: { day_class: 'normal' | 'nonworking' } | null;
  sessions: readonly unknown[];
}

/** Past normal workdays without a session in the displayed period's own days, newest first. */
export function freeWorkdaysOfDisplayedPeriod(days: readonly SeedDayFacts[], todayLocal: string): string[] {
  return days
    .filter((day) => day.work_date < todayLocal && day.classification?.day_class === 'normal' && day.sessions.length === 0)
    .map((day) => day.work_date)
    .sort()
    .reverse();
}

/** The slice of the displayed period (`/api/periods/current`, `current`) the deadline scenarios read. */
export interface DeadlinePeriodFacts {
  payroll_date: string;
  nominal_payroll_date: string;
  period_start: string;
  due_at_utc: string;
}

/** A later deadline for one period, as the admin payroll-exception route takes it (the payroll date itself stays). */
export interface LaterDeadline {
  due_local_date: string;
  due_local_time: string;
}

/**
 * WP5-UX-AB8-01: the deadline scenarios (automatic submission, automatic PDFs) need the displayed period to be due
 * LATER than the activation they record a minute from now (docs/05 line 26 makes a period eligible only when its due is
 * on or after the activation). The page keeps a period on screen from its due time through its payroll date, so for
 * about three days of every cycle its deadline is behind. The next period (in progress) is no substitute: the history
 * window of the page ends at the displayed period, so the scenario's history facts exist only for the displayed one.
 *
 * Returns null when the deadline is already more than `marginMs` ahead (nothing to change), else the deadline of
 * tomorrow at noon in the reporting zone, to be recorded for the displayed period through the supported admin payroll
 * exception (test database only). That is always at least half a day ahead.
 */
export function laterDeadlineFor(current: DeadlinePeriodFacts, todayLocal: string, nowMs: number, marginMs: number): LaterDeadline | null {
  if (Date.parse(current.due_at_utc) > nowMs + marginMs) return null;
  return { due_local_date: addDays(todayLocal, 1), due_local_time: '12:00' };
}

/**
 * Dates of an import year that lie after `lastBlockedDate` (the displayed period's last day, whose days another spec may
 * have finalized) and are distinct, one per nominal date: the nominal date when it already qualifies, else the first free day after.
 * WP5-UX-AB8-03: an import effective from the displayed period's start must neither touch that period nor drop a date as past.
 */
export function importDatesAfter(nominals: readonly string[], lastBlockedDate: string): string[] {
  const taken = new Set<string>();
  return nominals.map((nominal) => {
    let date = nominal > lastBlockedDate ? nominal : addDays(lastBlockedDate, 1);
    while (taken.has(date)) date = addDays(date, 1);
    taken.add(date);
    return date;
  });
}

/** The newest such day, or a clear failure: a seed is never skipped or silently taken from another period. */
export function displayedPeriodSeedDay(days: readonly SeedDayFacts[], todayLocal: string, payrollDate: string): string {
  const [first] = freeWorkdaysOfDisplayedPeriod(days, todayLocal);
  if (first === undefined) {
    throw new Error(
      `The displayed period (payroll ${payrollDate}) has no past normal workday without a session on ${todayLocal}; ` +
        'every past workday is a holiday or already has a session; a seed is never taken from another period.',
    );
  }
  return first;
}
