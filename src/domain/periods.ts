import { addDays, assertCivilDate, type CivilDate, diffDays } from './dates.ts';
import { DomainError } from './errors.ts';
import type { EpochSeconds } from './instants.ts';
import { parseClockTime } from './policy.ts';
import { assertTimeZone, resolveLocalDateTimeCompatible } from './zones.ts';

/*
 * Pay periods (FR-02). Payroll dates repeat every `cycleDays` from the anchor. For
 * payroll P the period is P+periodStartOffset … P+periodEndOffset inclusive (default
 * P−18 … P−5) and the due date is P+dueOffset (default P−3, Tuesday) at the saved
 * local time in the reporting zone. Explicit exceptions may move a payroll date or
 * its due date; period boundaries stay nominal so periods keep tiling without gaps.
 */

export interface PayrollScheduleRules {
  anchorPayrollDate: CivilDate;
  cycleDays: number;
  periodStartOffsetDays: number;
  periodEndOffsetDays: number;
  dueOffsetDays: number;
  /** `HH:MM` in the reporting zone. */
  dueLocalTime: string;
  reportingZone: string;
}

export interface PayrollException {
  nominalPayrollDate: CivilDate;
  payrollDate: CivilDate;
  /** Defaults to the nominal due date; exceptions never move a deadline implicitly. */
  dueLocalDate?: CivilDate | null;
  dueLocalTime?: string | null;
}

export interface PayPeriod {
  /** Cycle index relative to the anchor payroll (anchor = 0). */
  index: number;
  nominalPayrollDate: CivilDate;
  payrollDate: CivilDate;
  periodStart: CivilDate;
  periodEnd: CivilDate;
  dueLocalDate: CivilDate;
  dueLocalTime: string;
  dueAtUtc: EpochSeconds;
  isException: boolean;
}

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

export function validatePayrollSchedule(schedule: PayrollScheduleRules): void {
  assertCivilDate(schedule.anchorPayrollDate, 'anchorPayrollDate');
  assertTimeZone(schedule.reportingZone, 'reportingZone');
  parseClockTime(schedule.dueLocalTime, 'dueLocalTime');
  const offsetsValid = [schedule.periodStartOffsetDays, schedule.periodEndOffsetDays, schedule.dueOffsetDays].every(
    (value) => isIntegerBetween(value, -366, 366),
  );
  if (!isIntegerBetween(schedule.cycleDays, 1, 366) || !offsetsValid) {
    throw new DomainError('invalid_payroll_schedule', 'Cycle and offsets must be whole days');
  }
  if (schedule.periodEndOffsetDays - schedule.periodStartOffsetDays + 1 !== schedule.cycleDays) {
    throw new DomainError('invalid_payroll_schedule', 'A period must span exactly one cycle so periods tile');
  }
}

export function validatePayrollExceptions(
  schedule: PayrollScheduleRules,
  exceptions: readonly PayrollException[],
): void {
  const seen = new Set<CivilDate>();
  for (const exception of exceptions) {
    assertCivilDate(exception.nominalPayrollDate, 'nominalPayrollDate');
    assertCivilDate(exception.payrollDate, 'payrollDate');
    if (diffDays(exception.nominalPayrollDate, schedule.anchorPayrollDate) % schedule.cycleDays !== 0) {
      throw new DomainError('invalid_payroll_exception', `${exception.nominalPayrollDate} is not a scheduled payroll date`);
    }
    if (Math.abs(diffDays(exception.payrollDate, exception.nominalPayrollDate)) * 2 >= schedule.cycleDays) {
      throw new DomainError('invalid_payroll_exception', 'A payroll exception must stay within half a cycle');
    }
    if (exception.dueLocalDate !== undefined && exception.dueLocalDate !== null) {
      assertCivilDate(exception.dueLocalDate, 'dueLocalDate');
    }
    if (exception.dueLocalTime !== undefined && exception.dueLocalTime !== null) {
      parseClockTime(exception.dueLocalTime, 'dueLocalTime');
    }
    if (seen.has(exception.nominalPayrollDate)) {
      throw new DomainError('invalid_payroll_exception', `Duplicate exception for ${exception.nominalPayrollDate}`);
    }
    seen.add(exception.nominalPayrollDate);
  }
}

export function payPeriodAt(
  schedule: PayrollScheduleRules,
  index: number,
  exceptions: readonly PayrollException[] = [],
): PayPeriod {
  const nominalPayrollDate = addDays(schedule.anchorPayrollDate, index * schedule.cycleDays);
  const exception = exceptions.find((item) => item.nominalPayrollDate === nominalPayrollDate);
  const dueLocalDate = exception?.dueLocalDate ?? addDays(nominalPayrollDate, schedule.dueOffsetDays);
  const dueLocalTime = exception?.dueLocalTime ?? schedule.dueLocalTime;
  return {
    index,
    nominalPayrollDate,
    payrollDate: exception?.payrollDate ?? nominalPayrollDate,
    periodStart: addDays(nominalPayrollDate, schedule.periodStartOffsetDays),
    periodEnd: addDays(nominalPayrollDate, schedule.periodEndOffsetDays),
    dueLocalDate,
    dueLocalTime,
    dueAtUtc: resolveLocalDateTimeCompatible(`${dueLocalDate}T${dueLocalTime}`, schedule.reportingZone),
    isException: exception !== undefined,
  };
}

export function payPeriodIndexContaining(schedule: PayrollScheduleRules, date: CivilDate): number {
  const firstStart = addDays(schedule.anchorPayrollDate, schedule.periodStartOffsetDays);
  return Math.floor(diffDays(date, firstStart) / schedule.cycleDays);
}

export function payPeriodContaining(
  schedule: PayrollScheduleRules,
  date: CivilDate,
  exceptions: readonly PayrollException[] = [],
): PayPeriod {
  return payPeriodAt(schedule, payPeriodIndexContaining(schedule, assertCivilDate(date)), exceptions);
}

/** Looks up a period by its configured (possibly exception-moved) payroll date. */
export function payPeriodForPayrollDate(
  schedule: PayrollScheduleRules,
  payrollDate: CivilDate,
  exceptions: readonly PayrollException[] = [],
): PayPeriod {
  assertCivilDate(payrollDate, 'payrollDate');
  const moved = exceptions.find((item) => item.payrollDate === payrollDate);
  const nominal = moved?.nominalPayrollDate ?? payrollDate;
  const offset = diffDays(nominal, schedule.anchorPayrollDate);
  if (offset % schedule.cycleDays !== 0) {
    throw new DomainError('unknown_payroll_date', `${payrollDate} is not a configured payroll date`);
  }
  const period = payPeriodAt(schedule, offset / schedule.cycleDays, exceptions);
  if (period.payrollDate !== payrollDate) {
    throw new DomainError('unknown_payroll_date', `${payrollDate} was moved by a payroll exception`);
  }
  return period;
}

/** R-07: the current period has the earliest configured payroll date on/after today. */
export function currentPayPeriod(
  schedule: PayrollScheduleRules,
  todayLocal: CivilDate,
  exceptions: readonly PayrollException[] = [],
): PayPeriod {
  const firstOnOrAfter = Math.ceil(diffDays(assertCivilDate(todayLocal), schedule.anchorPayrollDate) / schedule.cycleDays);
  let current: PayPeriod | undefined;
  for (const index of [firstOnOrAfter - 1, firstOnOrAfter, firstOnOrAfter + 1]) {
    const candidate = payPeriodAt(schedule, index, exceptions);
    if (candidate.payrollDate >= todayLocal && (current === undefined || candidate.payrollDate < current.payrollDate)) {
      current = candidate;
    }
  }
  if (current === undefined) throw new DomainError('invalid_payroll_schedule', 'No payroll date on or after today');
  return current;
}

/** Periods overlapping the inclusive date range. */
export function payPeriodsOverlapping(
  schedule: PayrollScheduleRules,
  from: CivilDate,
  to: CivilDate,
  exceptions: readonly PayrollException[] = [],
): PayPeriod[] {
  const periods: PayPeriod[] = [];
  const last = payPeriodIndexContaining(schedule, assertCivilDate(to, 'to'));
  for (let index = payPeriodIndexContaining(schedule, assertCivilDate(from, 'from')); index <= last; index += 1) {
    periods.push(payPeriodAt(schedule, index, exceptions));
  }
  return periods;
}
