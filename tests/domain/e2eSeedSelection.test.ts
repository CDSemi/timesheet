import { describe, expect, it } from 'vitest';
import { addDays, diffDays } from '../../src/domain/dates.ts';
import { currentPayPeriod, type PayPeriod, type PayrollScheduleRules, payPeriodContaining } from '../../src/domain/periods.ts';
import { localDateOf, resolveLocalDateTimeCompatible } from '../../src/domain/zones.ts';
import { displayedPeriodSeedDay, type SeedDayFacts } from '../e2e/displayedSeed.ts';

/*
 * WP5-UX-FIX9 (B7-01 / A7-01): the browser specs must seed a day of the period the page displays.
 * The page shows currentPayPeriod(today): the earliest payroll date on or after today, so the
 * previous period stays on screen through its payroll date (the window P-4..P for the default
 * schedule: the Monday after the period ends up to and including the payroll Friday, the due
 * Tuesday P-3 inside it). The in-progress period (the one containing today) is a different one then.
 *
 * This steps the reporting-zone "today" through four consecutive periods, at four wall times each
 * day (including the due Tuesday just before and after 17:00), and checks the invariant with the
 * production period functions. The old choice (the first of the in-progress and displayed periods'
 * free days, newest first, as SeedClient.pastFreeWorkdays returns) is the negative control: it must
 * leave the displayed period on the window days.
 */

const LA = 'America/Los_Angeles';
const SCHEDULE: PayrollScheduleRules = {
  anchorPayrollDate: '2026-10-02',
  cycleDays: 14,
  periodStartOffsetDays: -18,
  periodEndOffsetDays: -5,
  dueOffsetDays: -3,
  dueLocalTime: '17:00',
  reportingZone: LA,
};
const MONDAY = '2026-10-05';

function daysOf(period: PayPeriod, holidays: readonly string[] = []): SeedDayFacts[] {
  const days: SeedDayFacts[] = [];
  for (let date = period.periodStart; date <= period.periodEnd; date = addDays(date, 1)) {
    const weekday = ((diffDays(date, MONDAY) % 7) + 7) % 7;
    const normal = weekday < 5 && !holidays.includes(date);
    days.push({ work_date: date, classification: { day_class: normal ? 'normal' : 'nonworking' }, sessions: [] });
  }
  return days;
}

/** The old SeedClient.pastFreeWorkdays()[0]: in-progress and displayed periods merged, newest first. */
function legacySeed(today: string, holidays: readonly string[]): string | undefined {
  const periods = [payPeriodContaining(SCHEDULE, today), currentPayPeriod(SCHEDULE, today)];
  const found = periods.flatMap((period) =>
    daysOf(period, holidays)
      .filter((day) => day.work_date < today && day.classification?.day_class === 'normal')
      .map((day) => day.work_date),
  );
  return [...new Set(found)].sort().reverse()[0];
}

/** The new choice: only the displayed period's days. */
function displayedSeed(today: string, holidays: readonly string[]): string {
  const displayed = currentPayPeriod(SCHEDULE, today);
  return displayedPeriodSeedDay(daysOf(displayed, holidays), today, displayed.payrollDate);
}

interface Step {
  instant: number;
  today: string;
}

/** Four wall times per day from 2026-09-14 (a period start) for 56 days: four whole periods. */
function steps(): Step[] {
  const out: Step[] = [];
  for (let offset = 0; offset < 56; offset += 1) {
    const date = addDays('2026-09-14', offset);
    for (const time of ['00:30', '16:59', '17:00', '23:59']) {
      const instant = resolveLocalDateTimeCompatible(`${date}T${time}`, LA);
      out.push({ instant, today: localDateOf(LA, instant) });
    }
  }
  return out;
}

describe('the browser specs seed from the displayed period', () => {
  it('derives the window from the domain: in-progress differs from displayed on P-4..P', () => {
    const window: string[] = [];
    for (const { today } of steps()) {
      const displayed = currentPayPeriod(SCHEDULE, today);
      const inProgress = payPeriodContaining(SCHEDULE, today);
      if (displayed.payrollDate !== inProgress.payrollDate) window.push(today);
      expect(displayed.payrollDate >= today).toBe(true);
      expect(diffDays(displayed.payrollDate, today) <= 4 || displayed.payrollDate === inProgress.payrollDate).toBe(true);
    }
    const unique = [...new Set(window)];
    // Four windows of five days (Monday .. payroll Friday, inclusive): 09-14, 09-28, 10-12, 10-26.
    expect(unique.length).toBe(20);
    expect(unique).toContain('2026-10-12');
    expect(unique).toContain('2026-10-13'); // the due Tuesday, before and after 17:00
    expect(unique).toContain('2026-10-16'); // the payroll date
    expect(unique).not.toContain('2026-10-17');
    expect(unique).not.toContain('2026-10-11');
  });

  it('always seeds inside the displayed period, on every step of four periods', () => {
    for (const { today } of steps()) {
      const displayed = currentPayPeriod(SCHEDULE, today);
      // The page switches to a period only after the previous payroll date, so it always has past weekdays here.
      const seed = displayedSeed(today, []);
      expect(seed >= displayed.periodStart && seed <= displayed.periodEnd, `${today}: ${seed} in ${displayed.periodStart}..${displayed.periodEnd}`).toBe(true);
      expect(seed < today).toBe(true);
    }
  });

  it('the old choice leaves the displayed period during the window (negative control)', () => {
    const outside: string[] = [];
    for (const { today } of steps()) {
      const displayed = currentPayPeriod(SCHEDULE, today);
      const legacy = legacySeed(today, []);
      if (legacy !== undefined && (legacy < displayed.periodStart || legacy > displayed.periodEnd)) outside.push(today);
    }
    const unique = [...new Set(outside)];
    // P-3 (the due Tuesday) .. P (the payroll date) in each of the four windows; P-4 has no past in-progress day yet.
    expect(unique).toContain('2026-10-13');
    expect(unique).toContain('2026-10-16');
    expect(unique.length).toBe(16);
    expect(legacySeed('2026-10-13', [])).toBe('2026-10-12');
    expect(displayedSeed('2026-10-13', [])).toBe('2026-10-09');
  });

  it('skips a holiday and fails clearly when the displayed period has no past normal workday', () => {
    // Payroll 2026-10-02 displays 09-14..09-27 from Saturday 09-19 (the day after the previous payroll date).
    expect(displayedSeed('2026-09-19', [])).toBe('2026-09-18');
    expect(displayedSeed('2026-09-22', ['2026-09-21'])).toBe('2026-09-18');
    const allHolidays = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'];
    expect(() => displayedSeed('2026-09-19', allHolidays)).toThrow(
      /displayed period \(payroll 2026-10-02\) has no past normal workday without a session on 2026-09-19/,
    );
  });
});
