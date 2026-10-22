import type { Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import type { PeriodFacts, PeriodsCurrent, SeedClient } from './fixtures.ts';

/*
 * A fixed clock for the period card (WP5-UX5-T04, U5-08, U5-14). The server's own clock cannot be moved by a spec, and the card's
 * states depend on it: "Current period" shows only in the five days after a period ends (the server's `current` differs from
 * `in_progress`), and the review link is primary only for an ended period (`period_end < today_local`). The page reads both from
 * `GET /api/periods/current`, so the spec answers that one route itself and leaves every other request real: the sheet, the
 * finalization and the revisions still come from the server. Call before the page loads, or reload afterwards.
 */

/** One period of the periods route in full (the page reads the dates, the due time and the relation word). */
export interface FullPeriod extends PeriodFacts {
  [field: string]: unknown;
}

export interface FullPeriods extends Omit<PeriodsCurrent, 'current' | 'in_progress'> {
  current: FullPeriod;
  in_progress: FullPeriod;
}

/** The period one step before `payrollDate`, as the server numbers it (payroll dates are 14 days apart). */
export async function previousPeriodOf(seed: SeedClient, payrollDate: string): Promise<FullPeriod> {
  const sheet = await seed.call<{ period: FullPeriod }>('GET', `/api/timesheets/${addDays(payrollDate, -14)}`);
  return sheet.period;
}

async function answerPeriods(page: Page, periods: FullPeriods): Promise<void> {
  await page.route('**/api/periods/current', (route) => route.fulfill({ status: 200, contentType: 'application/json', json: periods }));
}

/**
 * Makes the page's periods route answer for a clock inside the window after a period ended: `current` is the period before the
 * server's real current one (so it has ended), `in_progress` the real one. When the real clock is already inside the window nothing
 * is answered here. Returns what the page is told.
 */
export async function insideTheWindow(page: Page, seed: SeedClient): Promise<FullPeriods> {
  const real = await seed.call<FullPeriods>('GET', '/api/periods/current');
  if (real.current.payroll_date !== real.in_progress.payroll_date) return real;
  const periods: FullPeriods = { ...real, current: { ...(await previousPeriodOf(seed, real.current.payroll_date)), relation: 'current' } };
  await answerPeriods(page, periods);
  return periods;
}

/** Makes the page's periods route answer with another accounting date and the real periods: a clock before or after a period's end. */
export async function withToday(page: Page, seed: SeedClient, today: string): Promise<FullPeriods> {
  const real = await seed.call<FullPeriods>('GET', '/api/periods/current');
  const periods: FullPeriods = { ...real, today_local: today };
  await answerPeriods(page, periods);
  return periods;
}
