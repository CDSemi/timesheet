import { addDays, isoWeekday } from '../../domain/dates.ts';
import type { BatchConflict, DayBatchEntry, DayCategory, DayView, Session, TimesheetView } from '../api.ts';

/*
 * Pure presentation logic for the timesheet views. It maps fields the server already computed
 * (calculation.status, attendance_expected, regular/credited minutes) to display states and
 * groups days into weeks. It never derives business minutes, completeness rules or overtime.
 */

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type Completeness = 'complete' | 'open_session' | 'confirm_breaks' | 'missing' | 'not_expected' | 'error';

/** Status shapes; each is always drawn next to its text, never alone. */
export type StatusShape = 'circle' | 'diamond' | 'square' | 'triangle' | 'bar';

export interface CompletenessDisplay {
  completeness: Completeness;
  text: string;
  shape: StatusShape;
}

/** Maps the server's calculation status and attendance expectation to a display state. */
export function completenessOf(day: DayView): CompletenessDisplay {
  if (day.calculation_error !== null) {
    return { completeness: 'error', text: day.calculation_error.replace(/_/g, ' '), shape: 'triangle' };
  }
  switch (day.calculation?.status) {
    case 'complete':
      return { completeness: 'complete', text: 'complete', shape: 'circle' };
    case 'incomplete':
      return { completeness: 'open_session', text: 'open session', shape: 'diamond' };
    case 'incomplete_breaks':
      return { completeness: 'confirm_breaks', text: 'confirm breaks', shape: 'diamond' };
    default:
      return day.attendance_expected
        ? { completeness: 'missing', text: 'missing record', shape: 'square' }
        : { completeness: 'not_expected', text: 'not expected', shape: 'bar' };
  }
}

/**
 * OT that is still waiting for evidence. This mirrors how the server counts `totals.pending_days`
 * (an open session or unconfirmed breaks); a missing record is shown as missing, not as pending OT.
 */
export function isPendingOt(day: DayView): boolean {
  const status = day.calculation?.status;
  return status === 'incomplete' || status === 'incomplete_breaks';
}

export interface DayDisplay {
  workDate: string;
  weekday: string;
  /** The category label, or `none` when the calendar cannot classify the date. */
  category: string;
  categoryExplicit: boolean;
  calendarLabel: string;
  nonworking: boolean;
  status: CompletenessDisplay;
  pendingOt: boolean;
  sessions: Session[];
  regularMinutes: number | null;
  offCalendarMinutes: number | null;
  creditedMinutes: number | null;
  /** Version of the stored day entry; null while the day only has its calendar default. */
  entryVersion: number | null;
}

function calendarLabelOf(day: DayView): string {
  const classification = day.classification;
  if (classification === null) return 'unclassified';
  if (classification.name !== null) return classification.name;
  return classification.day_class === 'normal' ? 'Work day' : 'Non-working day';
}

export function toDayDisplay(day: DayView): DayDisplay {
  return {
    workDate: day.work_date,
    weekday: WEEKDAYS[isoWeekday(day.work_date) - 1] ?? '',
    category: day.category ?? 'none',
    categoryExplicit: day.category_source === 'explicit',
    calendarLabel: calendarLabelOf(day),
    nonworking: day.classification?.day_class === 'nonworking',
    status: completenessOf(day),
    pendingOt: isPendingOt(day),
    sessions: day.sessions,
    regularMinutes: day.calculation?.regular_minutes ?? null,
    offCalendarMinutes: day.calculation?.nonworking_minutes ?? null,
    creditedMinutes: day.calculation?.credited_minutes ?? null,
    entryVersion: day.entry?.version ?? null,
  };
}

export interface WeekGroup {
  /** The Monday that starts the week. */
  weekStart: string;
  days: DayDisplay[];
}

/** Groups consecutive days into Monday to Sunday weeks (a two-week period gives two groups). */
export function weekGroups(days: readonly DayView[]): WeekGroup[] {
  const groups: WeekGroup[] = [];
  for (const day of days) {
    const weekStart = addDays(day.work_date, -(isoWeekday(day.work_date) - 1));
    let group = groups.at(-1);
    if (group?.weekStart !== weekStart) {
      group = { weekStart, days: [] };
      groups.push(group);
    }
    group.days.push(toDayDisplay(day));
  }
  return groups;
}

/** The only review status the server provides before WP3: draft or finalized. */
export function reviewStatus(timesheet: TimesheetView['timesheet']): 'Draft' | 'Finalized' {
  return timesheet.finalized ? 'Finalized' : 'Draft';
}

/** One batch entry per selected date, in date order, each carrying the version the caller saw. */
export function batchEntries(days: readonly DayView[], selected: ReadonlySet<string>, category: DayCategory): DayBatchEntry[] {
  return days
    .filter((day) => selected.has(day.work_date))
    .map((day) => ({ work_date: day.work_date, category, expected_version: day.entry?.version ?? null }));
}

export interface ConflictDetail {
  conflict: BatchConflict;
  /** The recorded sessions of that date, joined from the loaded period by work_date. */
  sessions: Session[];
}

/** The server reports conflicts by count and id; the sessions come from the loaded days. */
export function conflictDetails(conflicts: readonly BatchConflict[], days: readonly DayView[]): ConflictDetail[] {
  return conflicts.map((conflict) => ({
    conflict,
    sessions: days.find((day) => day.work_date === conflict.work_date)?.sessions ?? [],
  }));
}

/** The dates a 409 stale_version names in `error.details.work_dates`. */
export function staleDates(details: Record<string, unknown> | undefined): string[] {
  const dates = details?.work_dates;
  return Array.isArray(dates) ? dates.filter((item): item is string => typeof item === 'string') : [];
}

export function staleReloadMessage(dates: readonly string[]): string {
  const named = dates.length === 0 ? 'Some dates' : dates.join(', ');
  return `${named} changed since this period was loaded. Nothing was saved. Reload the period, review the new labels and try again.`;
}
