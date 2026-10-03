import type { DateClassification } from './calendar.ts';
import { assertWholeMinutes } from './overtime.ts';

/*
 * Attendance labels (FR-03/FR-04). A label is a planned/declared attendance category,
 * not an actual clock record, and it never changes calendar classification.
 */

export type DayCategory = 'Worked' | 'Off' | 'Vacation' | 'Sick' | 'Holiday' | 'Shutdown';
export const DAY_CATEGORIES: readonly DayCategory[] = ['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown'];

/**
 * Default label: Worked on scheduled weekdays, Holiday on company holidays, Off
 * otherwise. A company closure defaults to Shutdown (interpretation recorded in the
 * WP1 handoff; FR-03 names only holidays).
 */
export function defaultCategory(classification: DateClassification): DayCategory {
  switch (classification.reason) {
    case 'holiday':
      return 'Holiday';
    case 'closure':
      return 'Shutdown';
    case 'scheduled_weekday':
      return 'Worked';
    case 'unscheduled_weekday':
      return 'Off';
  }
}

/** Attendance is expected only for Worked on a normal calendar work date (R-05). */
export function isAttendanceExpected(classification: Pick<DateClassification, 'dayClass'>, category: DayCategory): boolean {
  return classification.dayClass === 'normal' && category === 'Worked';
}

/*
 * Category source (WP2 plan observation 2). A label the system defaulted from the
 * calendar when a session created the day entry is 'default'; a label the employee chose
 * is 'explicit'. A default entry takes its label from the calendar at read time, so a
 * holiday import never needs to write employee rows; an explicit label is never replaced.
 */

export type CategorySource = 'default' | 'explicit';
export const CATEGORY_SOURCES: readonly CategorySource[] = ['default', 'explicit'];

/**
 * The label a day shows. `calendarDefault` is null when the calendar cannot classify the
 * date; the stored label is then the only information left.
 */
export function resolveDayCategory(
  source: CategorySource,
  stored: DayCategory,
  calendarDefault: DayCategory | null,
): DayCategory {
  return source === 'explicit' || calendarDefault === null ? stored : calendarDefault;
}

/*
 * Leave (owner decision E-2). A day entry carries leave minutes with a kind. There is no
 * OT-funded category; L is the leave minutes the employee entered, whatever the kind.
 * Changing a kind or a label never reserves or spends OT.
 */

export type LeaveKind = 'vacation' | 'sick' | 'ot';
export const LEAVE_KINDS: readonly LeaveKind[] = ['vacation', 'sick', 'ot'];

export type LeaveIssueCode =
  | 'invalid_leave_kind'
  | 'leave_kind_required'
  | 'leave_kind_without_minutes'
  | 'leave_exceeds_required';

export interface LeaveIssue {
  code: LeaveIssueCode;
  message: string;
  details: Record<string, unknown>;
}

export interface LeaveInput {
  leaveMinutes: number;
  leaveKind: LeaveKind | null;
  /** B, the required minutes of the policy effective on the work date. */
  requiredMinutes: number;
}

/**
 * Checks partial leave against the effective B. Fractional or negative minutes throw the
 * shared `invalid_minutes` DomainError; every other problem is returned as an issue so a
 * batch preview can report it per date.
 */
export function validateLeave(input: LeaveInput): LeaveIssue | null {
  assertWholeMinutes(input.leaveMinutes, 'leaveMinutes');
  if (input.leaveKind !== null && !LEAVE_KINDS.includes(input.leaveKind)) {
    return {
      code: 'invalid_leave_kind',
      message: `leave_kind must be one of ${LEAVE_KINDS.join(', ')}`,
      details: { allowed: [...LEAVE_KINDS] },
    };
  }
  if (input.leaveMinutes === 0) {
    return input.leaveKind === null
      ? null
      : { code: 'leave_kind_without_minutes', message: 'A leave kind needs leave minutes', details: {} };
  }
  if (input.leaveKind === null) {
    return {
      code: 'leave_kind_required',
      message: 'Leave minutes need a kind: vacation, sick or ot',
      details: { allowed: [...LEAVE_KINDS] },
    };
  }
  if (input.leaveMinutes > input.requiredMinutes) {
    return {
      code: 'leave_exceeds_required',
      message: `Leave cannot exceed the ${input.requiredMinutes} required minutes of the day`,
      details: { leave_minutes: input.leaveMinutes, required_minutes: input.requiredMinutes },
    };
  }
  return null;
}
