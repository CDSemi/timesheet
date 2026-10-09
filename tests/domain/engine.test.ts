import { describe, expect, it } from 'vitest';
import { defaultCategory } from '../../src/domain/attendance.ts';
import { expectedFinishUtc, suggestBreaks } from '../../src/domain/breaks.ts';
import { type CalendarVersion, classifyDate } from '../../src/domain/calendar.ts';
import { addDays, diffDays, isoWeekday } from '../../src/domain/dates.ts';
import { decideDeficit } from '../../src/domain/deficit.ts';
import { formatDuration, formatHoursMinutes } from '../../src/domain/format.ts';
import { formatUtcInstant, parseUtcInstant } from '../../src/domain/instants.ts';
import type { SessionInterval } from '../../src/domain/intervals.ts';
import { roundToStepMidpointDown } from '../../src/domain/overtime.ts';
import {
  currentPayPeriod,
  type PayrollScheduleRules,
  payPeriodContaining,
  payPeriodForPayrollDate,
  payPeriodsOverlapping,
  validatePayrollSchedule,
} from '../../src/domain/periods.ts';
import { excludedBreakMinutes, validateWorkPolicyRules, type WorkPolicyRules } from '../../src/domain/policy.ts';
import { effectiveVersionOn } from '../../src/domain/versions.ts';
import { computeWorkDay } from '../../src/domain/workday.ts';
import {
  formatInZone,
  localDateOf,
  resolveLocalDateTime,
  splitAtLocalMidnights,
  startOfLocalDay,
} from '../../src/domain/zones.ts';
import { formatHoursMinutes as pdfHoursMinutes } from '../../src/server/pdf/layout.ts';
import { expectDomainError } from '../support/fixtures.ts';

const LA = 'America/Los_Angeles';
const utc = parseUtcInstant;
const at = (local: string) => resolveLocalDateTime(local, LA).utc;

const calendar2026: CalendarVersion = {
  id: 'cal-2026',
  seq: 1,
  effectiveFrom: '2026-01-01',
  weekdays: [1, 2, 3, 4, 5],
  dates: [
    { date: '2026-07-03', kind: 'holiday', name: 'Observed Independence Day' },
    { date: '2026-09-07', kind: 'holiday', name: 'Labor Day' },
    { date: '2026-12-24', kind: 'closure', name: 'Winter closure' },
  ],
};

const defaultPolicy = { id: 'policy-1', requiredMinutes: 480, thresholdMinutes: 30, roundingStepMinutes: 30 };

function closed(start: string, end: string, breaks: Array<[string, string]> = []): SessionInterval {
  return {
    startUtc: at(start),
    endUtc: at(end),
    breaksConfirmed: true,
    breaks: breaks.map(([from, to]) => ({ startUtc: at(from), endUtc: at(to), countsAsWork: false, confirmed: true })),
  };
}

function day(workDate: string, sessions: SessionInterval[], calendar: CalendarVersion[] = [calendar2026]) {
  return computeWorkDay({ workDate, reportingZone: LA, policy: defaultPolicy, calendarVersions: calendar, sessions });
}

describe('midpoint-down rounding (R-04)', () => {
  it('matches an independent nearest-multiple search with ties going down', () => {
    for (const step of [1, 2, 7, 15, 30, 60]) {
      for (let total = 0; total <= 400; total += 1) {
        const lower = Math.floor(total / step) * step;
        const upper = lower + step;
        const expected = upper - total < total - lower ? upper : lower;
        expect(roundToStepMidpointDown(total, step), `T=${total} M=${step}`).toBe(expected);
      }
    }
  });
});

describe('flexible arrival (R-02)', () => {
  const rules = [
    { startOffsetMinutes: 120, durationMinutes: 15, countsAsWork: false },
    { startOffsetMinutes: 240, durationMinutes: 30, countsAsWork: false },
    { startOffsetMinutes: 390, durationMinutes: 15, countsAsWork: false },
  ];

  it('shifts suggested breaks with a 09:00 first clock-in to 11:00, 13:00 and 15:30', () => {
    const suggested = suggestBreaks(at('2026-09-21T09:00'), rules);
    expect(suggested.map((item) => formatInZone(LA, item.startUtc).slice(11, 16))).toEqual(['11:00', '13:00', '15:30']);
    expect(suggested.map((item) => formatInZone(LA, item.endUtc).slice(11, 16))).toEqual(['11:15', '13:30', '15:45']);
    expect(suggested.every((item) => !item.confirmed)).toBe(true);
  });

  it('expects 16:00/17:00/18:00 finishes for 07:00/08:00/09:00 starts with 60 excluded minutes', () => {
    const finish = (start: string) =>
      formatInZone(LA, expectedFinishUtc(at(start), 480, excludedBreakMinutes(rules))).slice(11, 16);
    expect([finish('2026-09-21T07:00'), finish('2026-09-21T08:00'), finish('2026-09-21T09:00')]).toEqual([
      '16:00',
      '17:00',
      '18:00',
    ]);
  });

  it('creates no OT or deficit from reference clock time alone (07:00–16:00 is a normal day)', () => {
    const result = day('2026-09-21', [
      closed('2026-09-21T07:00', '2026-09-21T16:00', [
        ['2026-09-21T09:00', '2026-09-21T09:15'],
        ['2026-09-21T11:00', '2026-09-21T11:30'],
        ['2026-09-21T13:30', '2026-09-21T13:45'],
      ]),
    ]);
    expect([result.regularMinutes, result.eligibleMinutes, result.creditedMinutes]).toEqual([480, 0, 0]);
  });

  it('keeps a day pending while suggested breaks are unconfirmed and never deducts them', () => {
    const start = at('2026-09-21T09:00');
    const withSuggestions: SessionInterval = {
      startUtc: start,
      endUtc: at('2026-09-21T18:00'),
      breaksConfirmed: true,
      breaks: suggestBreaks(start, rules),
    };
    const result = day('2026-09-21', [withSuggestions]);
    expect(result.status).toBe('incomplete_breaks');
    expect(result.creditedMinutes).toBeNull();
  });
});

describe('seconds aggregation (R-01)', () => {
  it('sums live-clock seconds across sessions and floors the daily aggregate once', () => {
    // 09:00:10–12:00:40 (3h00m30s) + 13:00:05–18:00:44 (5h00m39s) = 8h01m09s → 481 whole minutes.
    // Flooring each session first would give 180 + 300 = 480 instead.
    const result = day('2026-09-21', [
      closed('2026-09-21T09:00:10', '2026-09-21T12:00:40'),
      closed('2026-09-21T13:00:05', '2026-09-21T18:00:44'),
    ]);
    expect(result.regularSeconds).toBe(28_869);
    expect(result.regularMinutes).toBe(481);
    expect([result.eligibleMinutes, result.creditedMinutes]).toEqual([0, 0]);
  });
});

describe('mixed overnight shifts (R-03)', () => {
  it('adds a day session and an overnight weekend tail to one Friday work date', () => {
    // Fri 08:00–12:00 (240 R) + Fri 22:00–Sat 01:30 (120 R + 90 O): E=0 so A=0; T=90 → 90.
    const result = day('2026-09-25', [
      closed('2026-09-25T08:00', '2026-09-25T12:00'),
      closed('2026-09-25T22:00', '2026-09-26T01:30'),
    ]);
    expect([result.regularMinutes, result.nonworkingMinutes, result.eligibleMinutes, result.creditedMinutes]).toEqual([
      360, 90, 90, 90,
    ]);
    expect(result.segments.map((segment) => [segment.localDate, segment.dayClass, segment.seconds])).toEqual([
      ['2026-09-25', 'normal', 360 * 60],
      ['2026-09-26', 'nonworking', 90 * 60],
    ]);
  });

  it('splits a weekday shift running into a company holiday', () => {
    // Thu 2026-07-02 22:00 → Fri 2026-07-03 (holiday) 02:00: R=120, O=120 → credit 120.
    const result = day('2026-07-02', [closed('2026-07-02T22:00', '2026-07-03T02:00')]);
    expect([result.regularMinutes, result.nonworkingMinutes, result.creditedMinutes]).toEqual([120, 120, 120]);
    expect(result.segments[1]?.reason).toBe('holiday');
  });

  it('counts elapsed time across the fall-back night (Sat 22:00 PDT → Sun 03:00 PST = 6h)', () => {
    const session: SessionInterval = {
      startUtc: utc('2026-11-01T05:00:00Z'),
      endUtc: utc('2026-11-01T11:00:00Z'),
      breaks: [],
      breaksConfirmed: true,
    };
    const result = day('2026-10-31', [session]);
    expect(result.segments.map((segment) => [segment.localDate, segment.seconds / 3600])).toEqual([
      ['2026-10-31', 2],
      ['2026-11-01', 4],
    ]);
    expect([result.nonworkingMinutes, result.creditedMinutes]).toEqual([360, 360]);
  });

  it('counts elapsed time across the spring-forward night (Sat 22:00 PST → Sun 04:00 PDT = 5h)', () => {
    const result = day('2026-03-07', [closed('2026-03-07T22:00', '2026-03-08T04:00')]);
    expect(result.grossSeconds).toBe(5 * 3600);
    expect([result.nonworkingMinutes, result.creditedMinutes]).toEqual([300, 300]);
  });
});

describe('historical versions (R-03, R-07)', () => {
  it('classifies each overnight segment with the calendar version effective on that segment date', () => {
    const saturdayScheduled: CalendarVersion = { ...calendar2026, id: 'cal-v2', seq: 2, effectiveFrom: '2026-09-26', weekdays: [1, 2, 3, 4, 5, 6] };
    const result = day('2026-09-25', [closed('2026-09-25T22:00', '2026-09-26T02:00')], [calendar2026, saturdayScheduled]);
    expect(result.segments.map((segment) => [segment.calendarVersionId, segment.dayClass])).toEqual([
      ['cal-2026', 'normal'],
      ['cal-v2', 'normal'],
    ]);
    expect([result.regularMinutes, result.nonworkingMinutes]).toEqual([240, 0]);
  });

  it('selects the version effective on a date; a later seq supersedes the same effective date', () => {
    const versions = [
      { id: 'a', effectiveFrom: '2026-01-01', seq: 1 },
      { id: 'b', effectiveFrom: '2026-10-01', seq: 2 },
      { id: 'c', effectiveFrom: '2026-10-01', seq: 3 },
    ];
    expect(effectiveVersionOn(versions, '2025-12-31')).toBeUndefined();
    expect(effectiveVersionOn(versions, '2026-09-30')?.id).toBe('a');
    expect(effectiveVersionOn(versions, '2026-10-01')?.id).toBe('c');
  });

  it('records the policy version used for the work date in the result', () => {
    const result = computeWorkDay({
      workDate: '2026-09-21',
      reportingZone: LA,
      policy: { id: 'policy-old', requiredMinutes: 480, thresholdMinutes: 60, roundingStepMinutes: 15 },
      calendarVersions: [calendar2026],
      sessions: [closed('2026-09-21T08:00', '2026-09-21T17:52')],
    });
    // R=592, E=112 > N=60, credited nearest 15 → 105 (112 = 7×15 + 7, 2×7 < 15).
    expect([result.policyVersionId, result.eligibleMinutes, result.creditedMinutes]).toEqual(['policy-old', 112, 105]);
  });

  it('reports a missing calendar version instead of guessing', () => {
    expectDomainError(() => day('2025-12-31', [closed('2025-12-31T09:00', '2025-12-31T10:00')]), 'calendar_missing');
  });
});

describe('calendar labels (FR-03, R-03)', () => {
  it('defaults Worked/Holiday/Shutdown/Off from the company calendar', () => {
    expect(defaultCategory(classifyDate([calendar2026], '2026-09-21'))).toBe('Worked');
    expect(defaultCategory(classifyDate([calendar2026], '2026-09-07'))).toBe('Holiday');
    expect(defaultCategory(classifyDate([calendar2026], '2026-12-24'))).toBe('Shutdown');
    expect(defaultCategory(classifyDate([calendar2026], '2026-09-26'))).toBe('Off');
  });
});

describe('IANA zone boundaries', () => {
  it('knows the 23- and 25-hour Los Angeles days of 2026', () => {
    expect(formatUtcInstant(startOfLocalDay(LA, '2026-03-08'))).toBe('2026-03-08T08:00:00Z');
    expect(startOfLocalDay(LA, '2026-03-09') - startOfLocalDay(LA, '2026-03-08')).toBe(23 * 3600);
    expect(startOfLocalDay(LA, '2026-11-02') - startOfLocalDay(LA, '2026-11-01')).toBe(25 * 3600);
  });

  it('starts a day at the transition when local midnight is skipped (America/Santiago, 2026-09-06)', () => {
    const zone = 'America/Santiago';
    // Data assumption: Chile springs forward from 00:00 to 01:00 on the first Sunday after Sep 2.
    expectDomainError(() => resolveLocalDateTime('2026-09-06T00:00', zone), 'nonexistent_local_time');
    const start = startOfLocalDay(zone, '2026-09-06');
    expect(localDateOf(zone, start)).toBe('2026-09-06');
    expect(localDateOf(zone, start - 1)).toBe('2026-09-05');
    expect(formatInZone(zone, start)).toBe('2026-09-06T01:00:00-03:00');
  });

  it('splits an interval at every local midnight it crosses', () => {
    const pieces = splitAtLocalMidnights(LA, at('2026-09-25T20:00'), at('2026-09-27T01:00'));
    expect(pieces.map((piece) => [piece.date, (piece.endUtc - piece.startUtc) / 3600])).toEqual([
      ['2026-09-25', 4],
      ['2026-09-26', 24],
      ['2026-09-27', 1],
    ]);
  });

  it('accepts an explicit valid offset for an ambiguous time and rejects a wrong one', () => {
    expect(formatUtcInstant(resolveLocalDateTime('2026-11-01T01:30', LA, { offset: '-08:00' }).utc)).toBe(
      '2026-11-01T09:30:00Z',
    );
    expectDomainError(() => resolveLocalDateTime('2026-11-01T01:30', LA, { offset: '-05:00' }), 'offset_mismatch');
    expectDomainError(() => resolveLocalDateTime('2026-09-21T09:00', 'Mars/Olympus'), 'invalid_time_zone');
    expectDomainError(() => resolveLocalDateTime('2026-09-21T24:00', LA), 'invalid_local_time');
  });

  it('keeps second precision and rejects sub-second UTC input', () => {
    expect(formatUtcInstant(utc('2026-09-21T16:00:00.000Z'))).toBe('2026-09-21T16:00:00Z');
    expectDomainError(() => utc('2026-09-21T16:00:00.500Z'), 'invalid_instant');
    expectDomainError(() => utc('2026-09-21T16:00:00+07:00'), 'invalid_instant');
  });
});

describe('pay periods (FR-02)', () => {
  const schedule: PayrollScheduleRules = {
    anchorPayrollDate: '2026-10-02',
    cycleDays: 14,
    periodStartOffsetDays: -18,
    periodEndOffsetDays: -5,
    dueOffsetDays: -3,
    dueLocalTime: '17:00',
    reportingZone: LA,
  };

  it('tiles 14-day Monday–Sunday periods with Friday payroll and Tuesday due dates', () => {
    const periods = payPeriodsOverlapping(schedule, '2026-01-01', '2026-12-31');
    expect(periods.length).toBeGreaterThanOrEqual(26);
    periods.forEach((period, index) => {
      expect(diffDays(period.periodEnd, period.periodStart)).toBe(13);
      expect([isoWeekday(period.periodStart), isoWeekday(period.periodEnd)]).toEqual([1, 7]);
      expect([isoWeekday(period.payrollDate), isoWeekday(period.dueLocalDate)]).toEqual([5, 2]);
      const next = periods[index + 1];
      if (next !== undefined) expect(next.periodStart).toBe(addDays(period.periodEnd, 1));
    });
  });

  it('resolves 17:00 due times on both sides of DST', () => {
    expect(formatUtcInstant(payPeriodForPayrollDate(schedule, '2026-03-06').dueAtUtc)).toBe('2026-03-04T01:00:00Z');
    expect(formatUtcInstant(payPeriodForPayrollDate(schedule, '2026-03-20').dueAtUtc)).toBe('2026-03-18T00:00:00Z');
    expect(formatUtcInstant(payPeriodForPayrollDate(schedule, '2026-11-13').dueAtUtc)).toBe('2026-11-11T01:00:00Z');
  });

  it('finds the containing and the current period (earliest payroll on/after today)', () => {
    expect(payPeriodContaining(schedule, '2026-09-29').payrollDate).toBe('2026-10-16');
    expect(currentPayPeriod(schedule, '2026-09-29').payrollDate).toBe('2026-10-02');
    expect(currentPayPeriod(schedule, '2026-10-02').payrollDate).toBe('2026-10-02');
    expect(currentPayPeriod(schedule, '2026-10-03').payrollDate).toBe('2026-10-16');
  });

  it('applies an explicit payroll-date exception without moving the period or deadline', () => {
    const exceptions = [{ nominalPayrollDate: '2026-12-25', payrollDate: '2026-12-24' }];
    const moved = payPeriodForPayrollDate(schedule, '2026-12-24', exceptions);
    expect([moved.periodStart, moved.periodEnd, moved.dueLocalDate, moved.isException]).toEqual([
      '2026-12-07',
      '2026-12-20',
      '2026-12-22',
      true,
    ]);
    expectDomainError(() => payPeriodForPayrollDate(schedule, '2026-12-25', exceptions), 'unknown_payroll_date');
    expect(currentPayPeriod(schedule, '2026-12-24', exceptions).payrollDate).toBe('2026-12-24');
    expect(currentPayPeriod(schedule, '2026-12-25', exceptions).payrollDate).toBe('2027-01-08');
  });

  it('rejects schedules whose periods would not tile', () => {
    expectDomainError(() => validatePayrollSchedule({ ...schedule, periodEndOffsetDays: -4 }), 'invalid_payroll_schedule');
    expectDomainError(() => validatePayrollSchedule({ ...schedule, dueLocalTime: '5pm' }), 'invalid_clock_time');
  });
});

describe('work policy validation (R-02)', () => {
  const example: WorkPolicyRules = {
    requiredMinutes: 480,
    thresholdMinutes: 30,
    roundingStepMinutes: 30,
    referenceStart: '08:00',
    referenceEnd: '17:00',
    deficitMode: 'ignore',
    breaks: [
      { startOffsetMinutes: 120, durationMinutes: 15, countsAsWork: false },
      { startOffsetMinutes: 240, durationMinutes: 30, countsAsWork: false },
      { startOffsetMinutes: 390, durationMinutes: 15, countsAsWork: false },
    ],
  };

  it('accepts the example policy, a night reference and a paid break', () => {
    expect(() => validateWorkPolicyRules(example)).not.toThrow();
    expect(() => validateWorkPolicyRules({ ...example, referenceStart: '22:00', referenceEnd: '07:00' })).not.toThrow();
    expect(() =>
      validateWorkPolicyRules({
        ...example,
        referenceEnd: '16:00',
        breaks: [{ startOffsetMinutes: 120, durationMinutes: 15, countsAsWork: true }],
      }),
    ).not.toThrow();
  });

  it('rejects inconsistent reference durations and misplaced breaks', () => {
    expectDomainError(() => validateWorkPolicyRules({ ...example, referenceEnd: '16:30' }), 'inconsistent_reference_schedule');
    expectDomainError(
      () =>
        validateWorkPolicyRules({
          ...example,
          breaks: [
            { startOffsetMinutes: 120, durationMinutes: 45, countsAsWork: false },
            { startOffsetMinutes: 150, durationMinutes: 15, countsAsWork: false },
          ],
        }),
      'overlapping_break_rules',
    );
    expectDomainError(
      () =>
        validateWorkPolicyRules({
          ...example,
          breaks: [{ startOffsetMinutes: 520, durationMinutes: 60, countsAsWork: false }],
        }),
      'break_rule_outside_reference',
    );
    expectDomainError(
      () => validateWorkPolicyRules({ ...example, deficitMode: 'sometimes' as WorkPolicyRules['deficitMode'] }),
      'invalid_deficit_mode',
    );
  });
});

describe('deficit decisions beyond the fixtures (R-05)', () => {
  const base = {
    requiredMinutes: 480,
    regularMinutes: 420,
    nonworkingMinutes: 0,
    leaveMinutes: 0,
    normalWorkDate: true,
    attendanceExpected: true,
    recordsComplete: true,
    finalizationOrigin: 'manual' as const,
    availableMinutes: 600,
  };

  it('leaves a manual choose-at-sign-off deficit pending until a choice is made', () => {
    expect(decideDeficit({ ...base, mode: 'choose_at_signoff' }).decision).toBe('pending');
  });

  it('never debits more than the available balance', () => {
    expect(
      decideDeficit({ ...base, mode: 'choose_at_signoff', manualChoice: 'deduct', availableMinutes: 59 }),
    ).toEqual({ deficitMinutes: 60, debitMinutes: 0, decision: 'insufficient_balance' });
  });

  it('caps attendance-fulfilling leave at B', () => {
    expect(decideDeficit({ ...base, mode: 'auto_deduct', regularMinutes: 0, leaveMinutes: 600 }).decision).toBe(
      'not_applicable',
    );
  });
});

describe('display formatting', () => {
  it('shows hours and minutes, never decimal hours', () => {
    expect([formatDuration(90), formatDuration(45), formatDuration(480), formatDuration(-60)]).toEqual([
      '1h 30m',
      '45m',
      '8h 00m',
      '−1h 00m',
    ]);
  });

  it('shows h:mm exactly as the timesheet PDF prints it', () => {
    expect([0, 5, 59, 60, 90, 135, 330, 600, 1439, 6000].map(formatHoursMinutes)).toEqual([
      '0:00',
      '0:05',
      '0:59',
      '1:00',
      '1:30',
      '2:15',
      '5:30',
      '10:00',
      '23:59',
      '100:00',
    ]);
    // The app and the PDF print the same text for every whole minute count the PDF accepts.
    for (let minutes = 0; minutes <= 3000; minutes += 1) expect(formatHoursMinutes(minutes)).toBe(pdfHoursMinutes(minutes));
    // Display only: an unexpected value never throws on a screen.
    expect([formatHoursMinutes(-60), formatHoursMinutes(90.9)]).toEqual(['−1:00', '1:30']);
  });
});
