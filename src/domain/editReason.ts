import type { CivilDate } from './dates.ts';
import { currentPayPeriod, type PayrollException, type PayrollScheduleRules } from './periods.ts';

/*
 * R-07 edit reasons. Current/future drafts need no reason; an old period (payroll
 * before the current one, even if still unsent) or any finalized timesheet does.
 * Every edit is audited regardless.
 */

export type PeriodRelation = 'old' | 'current' | 'future';

export interface EditReasonInput {
  schedule: PayrollScheduleRules;
  exceptions?: readonly PayrollException[];
  /** Today's date in the saved reporting zone. */
  todayLocal: CivilDate;
  targetPeriodIndex: number;
  finalized: boolean;
}

export interface EditReasonRequirement {
  currentPayrollDate: CivilDate;
  currentPeriodIndex: number;
  relation: PeriodRelation;
  reasonRequired: boolean;
}

export function editReasonRequirement(input: EditReasonInput): EditReasonRequirement {
  const current = currentPayPeriod(input.schedule, input.todayLocal, input.exceptions);
  const relation: PeriodRelation =
    input.targetPeriodIndex < current.index ? 'old' : input.targetPeriodIndex === current.index ? 'current' : 'future';
  return {
    currentPayrollDate: current.payrollDate,
    currentPeriodIndex: current.index,
    relation,
    reasonRequired: input.finalized || relation === 'old',
  };
}
