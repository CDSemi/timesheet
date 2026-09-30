import type { DateClassification } from './calendar.ts';

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
