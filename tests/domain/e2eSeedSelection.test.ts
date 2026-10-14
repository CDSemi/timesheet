import { describe, expect, it } from 'vitest';
import { addDays, diffDays } from '../../src/domain/dates.ts';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import {
  currentPayPeriod,
  type PayPeriod,
  type PayrollException,
  type PayrollScheduleRules,
  payPeriodAt,
  payPeriodContaining,
} from '../../src/domain/periods.ts';
import { localDateOf, resolveLocalDateTimeCompatible } from '../../src/domain/zones.ts';
import {
  type DeadlinePeriodFacts,
  displayedPeriodSeedDay,
  importDatesAfter,
  laterDeadlineFor,
  type SeedDayFacts,
} from '../e2e/displayedSeed.ts';

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

/*
 * WP5-UX-AB8-01: the deadline scenarios (automatic submission, automatic PDFs) need the displayed period to be due after
 * the activation they record. The page keeps the period on screen from its due Tuesday (P-3) 17:00 through the payroll
 * date P, so for about three days of every cycle its deadline is behind and a later one is recorded for it.
 */
const MARGIN_MS = 120_000;

function factsOf(period: PayPeriod): DeadlinePeriodFacts {
  return {
    payroll_date: period.payrollDate,
    nominal_payroll_date: period.nominalPayrollDate,
    period_start: period.periodStart,
    due_at_utc: formatUtcInstant(period.dueAtUtc),
  };
}

/** The displayed period at an instant, with the later deadline applied as the admin payroll exception records it. */
function displayedWithLater(today: string, later: { due_local_date: string; due_local_time: string }): PayPeriod {
  const displayed = currentPayPeriod(SCHEDULE, today);
  const exception: PayrollException = {
    nominalPayrollDate: displayed.nominalPayrollDate,
    payrollDate: displayed.payrollDate,
    dueLocalDate: later.due_local_date,
    dueLocalTime: later.due_local_time,
  };
  return payPeriodAt(SCHEDULE, displayed.index, [exception]);
}

describe('the deadline scenarios have a displayed period that is still due later', () => {
  it('records nothing while the deadline is ahead; otherwise a deadline that is ahead for the same period, on every step', () => {
    const recorded: string[] = [];
    for (const { instant, today } of steps()) {
      const displayed = currentPayPeriod(SCHEDULE, today);
      const nowMs = instant * 1000;
      const later = laterDeadlineFor(factsOf(displayed), today, nowMs, MARGIN_MS);
      if (later === null) {
        expect(Date.parse(formatUtcInstant(displayed.dueAtUtc)) > nowMs + MARGIN_MS, `${today}: the natural deadline is ahead`).toBe(true);
        continue;
      }
      recorded.push(today);
      const moved = displayedWithLater(today, later);
      expect(moved.payrollDate, `${today}: the payroll date is kept`).toBe(displayed.payrollDate);
      expect(moved.periodStart, `${today}: the period is kept`).toBe(displayed.periodStart);
      expect(moved.dueAtUtc * 1000 > nowMs + 12 * 3_600_000, `${today}: the recorded deadline is at least 12 hours ahead`).toBe(true);
    }
    // The negative control: without the recorded deadline these steps fail (the due Tuesday from 17:00 through the payroll date).
    const unique = [...new Set(recorded)];
    expect(unique).toContain('2026-10-13');
    expect(unique).toContain('2026-10-16');
    expect(unique).not.toContain('2026-10-12');
    expect(unique).not.toContain('2026-10-17');
  });

  it('switches at the margin around the due time of the due Tuesday', () => {
    const laterAt = (date: string, time: string) => {
      const instant = resolveLocalDateTimeCompatible(`${date}T${time}`, LA);
      const today = localDateOf(LA, instant);
      return laterDeadlineFor(factsOf(currentPayPeriod(SCHEDULE, today)), today, instant * 1000, MARGIN_MS);
    };
    // Payroll Friday 2026-10-16, due Tuesday 2026-10-13 17:00 Los Angeles time.
    expect(laterAt('2026-10-13', '12:00')).toBeNull();
    expect(laterAt('2026-10-13', '16:57')).toBeNull();
    expect(laterAt('2026-10-13', '16:59')).toEqual({ due_local_date: '2026-10-14', due_local_time: '12:00' });
    expect(laterAt('2026-10-16', '23:59')).toEqual({ due_local_date: '2026-10-17', due_local_time: '12:00' });
    expect(laterAt('2026-10-17', '10:00')).toBeNull();
  });
});

describe('the holiday import dates stay clear of the displayed period (WP5-UX-AB8-03)', () => {
  const nominals = ['2027-01-01', '2027-07-04', '2027-03-03'];

  it('keeps the nominal dates when they already follow the period', () => {
    expect(importDatesAfter(nominals, '2026-10-11')).toEqual(nominals);
  });

  it('moves a date inside or before the period to the first free day after it, never onto another date', () => {
    // The period 2026-12-21..2027-01-03 spans New Year.
    expect(importDatesAfter(nominals, '2027-01-03')).toEqual(['2027-01-04', '2027-07-04', '2027-03-03']);
    // Every nominal date is behind the period: consecutive free days in order.
    expect(importDatesAfter(nominals, '2027-09-30')).toEqual(['2027-10-01', '2027-10-02', '2027-10-03']);
    // A shifted date meets a nominal one.
    expect(importDatesAfter(nominals, '2027-07-01')).toEqual(['2027-07-02', '2027-07-04', '2027-07-03']);
  });
});
