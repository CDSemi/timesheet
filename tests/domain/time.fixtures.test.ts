import { describe, expect, it } from 'vitest';
import { isAttendanceExpected } from '../../src/domain/attendance.ts';
import { type CalendarVersion, classifyDate } from '../../src/domain/calendar.ts';
import { editReasonRequirement } from '../../src/domain/editReason.ts';
import { formatUtcInstant, parseUtcInstant } from '../../src/domain/instants.ts';
import { type SessionInterval, validateSessionShape, validateUserIntervals } from '../../src/domain/intervals.ts';
import { type PayrollScheduleRules, payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import { computeWorkDay, provisionalCredits } from '../../src/domain/workday.ts';
import { formatInZone, formatOffset, localDateOf, resolveLocalDateTime } from '../../src/domain/zones.ts';
import {
  expectDomainError,
  type FixtureSession,
  type IntervalCase,
  loadFixture,
  type TimeFixtureFile,
} from '../support/fixtures.ts';

const fixture = loadFixture<TimeFixtureFile>('time_cases.json');
const defaults = fixture.defaults;

const calendar: CalendarVersion[] = [
  {
    id: 'fixture-calendar',
    seq: 1,
    effectiveFrom: '1900-01-01',
    weekdays: defaults.normal_weekdays_iso,
    dates: defaults.holidays.map((date) => ({ date, kind: 'holiday' as const, name: 'Fixture holiday' })),
  },
];

const policy = {
  id: 'fixture-policy',
  requiredMinutes: defaults.required_minutes,
  thresholdMinutes: defaults.threshold_minutes,
  roundingStepMinutes: defaults.rounding_step_minutes,
};

/** Payroll rules from 01_PRODUCT_REQUIREMENTS: P−18…P−5, due P−3, seed anchor 2026-10-02. */
function schedule(overrides: Partial<PayrollScheduleRules> = {}): PayrollScheduleRules {
  return {
    anchorPayrollDate: '2026-10-02',
    cycleDays: 14,
    periodStartOffsetDays: -18,
    periodEndOffsetDays: -5,
    dueOffsetDays: -3,
    dueLocalTime: '17:00',
    reportingZone: defaults.reporting_zone,
    ...overrides,
  };
}

function toSession(session: FixtureSession, breaksConfirmed: boolean): SessionInterval {
  return {
    startUtc: parseUtcInstant(session.start_utc),
    endUtc: session.end_utc === null ? null : parseUtcInstant(session.end_utc),
    breaksConfirmed,
    breaks: session.breaks.map((item) => ({
      startUtc: parseUtcInstant(item.start_utc),
      endUtc: parseUtcInstant(item.end_utc),
      countsAsWork: item.counts_as_work,
      confirmed: item.confirmed,
    })),
  };
}

function computeIntervalCase(testCase: IntervalCase) {
  const breaksConfirmed = testCase.input.breaks_confirmed ?? defaults.breaks_confirmed;
  return computeWorkDay({
    workDate: testCase.input.work_date,
    reportingZone: defaults.reporting_zone,
    policy,
    calendarVersions: calendar,
    sessions: testCase.input.sessions.map((session) => toSession(session, breaksConfirmed)),
  });
}

describe('fixtures/time_cases.json (R-01…R-07)', () => {
  it('contains the 32 named scenarios', () => {
    expect(fixture.cases).toHaveLength(32);
  });

  for (const testCase of fixture.cases) {
    switch (testCase.kind) {
      case 'interval_calculation':
        it(`${testCase.id}: interval calculation`, () => {
          const result = computeIntervalCase(testCase);
          expect(result.status).toBe('complete');
          expect({
            regular: result.regularMinutes,
            nonworking: result.nonworkingMinutes,
            eligible: result.eligibleMinutes,
            credited: result.creditedMinutes,
          }).toEqual({
            regular: testCase.expected.regular_minutes,
            nonworking: testCase.expected.nonworking_minutes,
            eligible: testCase.expected.eligible_minutes,
            credited: testCase.expected.credited_minutes,
          });
          if (testCase.input.attendance_expected !== undefined && testCase.input.category !== undefined) {
            // A personal Off label keeps the normal calendar classification (TM-29).
            const classification = classifyDate(calendar, testCase.input.work_date);
            expect(classification.dayClass).toBe('normal');
            expect(isAttendanceExpected(classification, testCase.input.category as 'Off')).toBe(
              testCase.input.attendance_expected,
            );
          }
        });
        break;
      case 'incomplete':
      case 'incomplete_breaks':
        it(`${testCase.id}: ${testCase.kind} creates no credit and no ledger event`, () => {
          const result = computeIntervalCase(testCase);
          expect(result.status).toBe(testCase.expected.calculation_status);
          expect(result.creditedMinutes).toBe(testCase.expected.credited_minutes);
          expect(result.regularMinutes).toBeNull();
          expect(provisionalCredits(result)).toHaveLength(testCase.expected.ledger_events ?? -1);
        });
        break;
      case 'validation':
        it(`${testCase.id}: rejects ${testCase.expected_error}`, () => {
          const records = testCase.input.records ?? testCase.input.sessions ?? [];
          expectDomainError(() => {
            const sessions = records.map((record) => toSession(record, true));
            sessions.forEach((session, index) => validateSessionShape(session, String(index)));
            validateUserIntervals(sessions.map((session) => ({ startUtc: session.startUtc, endUtc: session.endUtc })));
          }, testCase.expected_error);
        });
        break;
      case 'local_time_resolution':
        it(`${testCase.id}: ${testCase.input.local} ${testCase.input.zone} fold=${String(testCase.input.fold)}`, () => {
          const resolve = () =>
            resolveLocalDateTime(testCase.input.local, testCase.input.zone, { fold: testCase.input.fold });
          if (testCase.expected_error !== undefined) {
            expectDomainError(resolve, testCase.expected_error);
            return;
          }
          const resolved = resolve();
          expect(formatUtcInstant(resolved.utc)).toBe(testCase.expected?.utc);
          expect(formatOffset(resolved.offsetSeconds)).toBe(testCase.expected?.offset);
        });
        break;
      case 'display':
        it(`${testCase.id}: display zone changes the shown time, never the accounting date`, () => {
          const instant = parseUtcInstant(testCase.input.instant_utc);
          for (const zone of testCase.input.zones) {
            expect(formatInZone(zone, instant)).toBe(testCase.expected.local_by_zone[zone]);
          }
          // The saved work date stays unchanged even where the viewer's local date differs.
          expect(localDateOf('Asia/Ho_Chi_Minh', instant)).not.toBe(testCase.input.work_date);
          expect(testCase.input.work_date).toBe(testCase.expected.work_date);
        });
        break;
      case 'pay_period':
        it(`${testCase.id}: payroll ${testCase.input.payroll_date}`, () => {
          const period = payPeriodForPayrollDate(
            schedule({ dueLocalTime: testCase.input.due_local_time }),
            testCase.input.payroll_date,
          );
          expect({
            period_start: period.periodStart,
            period_end: period.periodEnd,
            due_local_date: period.dueLocalDate,
            due_at_utc: formatUtcInstant(period.dueAtUtc),
          }).toEqual(testCase.expected);
        });
        break;
      case 'edit_reason':
        it(`${testCase.id}: target payroll ${testCase.input.target_payroll_date}, finalized=${String(testCase.input.finalized)}`, () => {
          const rules = schedule({
            anchorPayrollDate: testCase.input.anchor_payroll_date,
            cycleDays: testCase.input.cycle_days,
          });
          const todayLocal = localDateOf(defaults.reporting_zone, parseUtcInstant(testCase.input.now_utc));
          const target = payPeriodForPayrollDate(rules, testCase.input.target_payroll_date);
          const requirement = editReasonRequirement({
            schedule: rules,
            todayLocal,
            targetPeriodIndex: target.index,
            finalized: testCase.input.finalized,
          });
          expect({
            current_payroll_date: requirement.currentPayrollDate,
            reason_required: requirement.reasonRequired,
          }).toEqual(testCase.expected);
        });
        break;
    }
  }
});
