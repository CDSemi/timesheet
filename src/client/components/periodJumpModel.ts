import type { Period } from '../api.ts';
import { usDate } from './format.ts';
import { weekdayName } from './periodBarModel.ts';

/*
 * The two jump buttons of the period bar (WP5-UX2-T04). Both use only the server's period objects and
 * its `today_local` (the accounting date in the timesheet's saved reporting zone): nothing here reads
 * the device clock or the display zone, and nothing does calendar arithmetic. The only date comparison
 * is whether the shown period's own dates contain `today`.
 */

type PeriodDates = Pick<Period, 'payroll_date' | 'period_start' | 'period_end'>;

/** True when the accounting date lies inside the period's own first and last day (ISO dates compare as text). */
export function periodContains(period: Pick<Period, 'period_start' | 'period_end'>, date: string): boolean {
  return period.period_start <= date && date <= period.period_end;
}

export interface TodayJump {
  /** The payroll date of the period to load: the period the server says is in progress, which contains `today`. */
  targetPayrollDate: string;
  /** True when the button is active: the sheet shows another period than today's, or the open editor is on another date. */
  away: boolean;
  /** The date the open Day editor moves to (today), or null when no editor is open or it is already on today. */
  moveEditorTo: string | null;
}

/**
 * "Today": opens the period that contains the server's `today_local` and moves an open Day editor to
 * that date. `current` is accepted so a caller passes the server's pair unchanged; the target is never
 * `current` (during the five days after a period ends `current` is the ended period, not today's).
 */
export function todayJump(input: {
  today: string;
  current: PeriodDates;
  inProgress: PeriodDates;
  shown: PeriodDates;
  editDate: string | null;
}): TodayJump {
  const { today, inProgress, shown, editDate } = input;
  const editorElsewhere = editDate !== null && editDate !== today;
  return {
    targetPayrollDate: inProgress.payroll_date,
    away: !periodContains(shown, today) || editorElsewhere,
    moveEditorTo: editorElsewhere ? today : null,
  };
}

export interface CurrentPeriodJump {
  /** The payroll date of the R-07 current period: the period the page opens on. */
  targetPayrollDate: string;
  /** Shown only while `current` differs from the period in progress and the sheet shows another period than `current`. */
  visible: boolean;
}

/** "Current period": returns to the R-07 `current` period, only while it is a different period from today's and not on screen. */
export function currentPeriodJump(input: { current: PeriodDates; inProgress: PeriodDates; shown: PeriodDates }): CurrentPeriodJump {
  const { current, inProgress, shown } = input;
  return {
    targetPayrollDate: current.payroll_date,
    visible: current.payroll_date !== inProgress.payroll_date && shown.payroll_date !== current.payroll_date,
  };
}

/** The status line after "Today": `Showing today, Wed 10/14/2026, in the period 10/12/2026 to 10/25/2026`. */
export function todayStatusText(today: string, period: Pick<Period, 'period_start' | 'period_end'>): string {
  return `Showing today, ${weekdayName(today)} ${usDate(today)}, in the period ${usDate(period.period_start)} to ${usDate(period.period_end)}`;
}

/** The status line after "Current period": `Showing the current period 09/28/2026 to 10/11/2026`. */
export function currentStatusText(period: Pick<Period, 'period_start' | 'period_end'>): string {
  return `Showing the current period ${usDate(period.period_start)} to ${usDate(period.period_end)}`;
}

/** The hidden description of "Today": it says why the button is inactive, or what it opens. */
export function todayDescription(away: boolean): string {
  return away ? "Opens the period that contains today's date" : 'Already showing today';
}

/** The hidden description of "Current period". */
export const CURRENT_PERIOD_DESCRIPTION = 'Returns to the period this page opens on, for review and sign-off';
