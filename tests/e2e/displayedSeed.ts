/*
 * Pure seed-day selection for the browser specs (no Playwright import, so a unit test can run it).
 *
 * The page opens on the period `currentPayPeriod` returns: the one with the earliest payroll date on
 * or after today. For the default schedule (period P-18..P-5, due P-3) the period that CONTAINS today
 * is a different, later one on the five days P-4..P (Monday through the payroll Friday, inclusive):
 * the previous period stays on screen through its payroll date. A day taken from the in-progress
 * period is then not on the page. These helpers only ever return days of the period the page shows.
 */

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
