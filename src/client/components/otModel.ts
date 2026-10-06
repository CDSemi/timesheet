import { ApiRequestError, type DayView, type HistoryEvent, type OtLeaveRequest } from '../api.ts';
import { minutesText } from './format.ts';

/*
 * Pure display logic for the OT and History screens. No balance or ledger arithmetic lives
 * here: balances, counters and flags come from the server, and this module only decides what
 * to offer and how to word it.
 */

/**
 * E-3: "record use" is explicit and offered only on or after the leave date, in the server's
 * accounting date (today_local), and only while minutes are still reserved. The server enforces
 * the same rule (409 before_leave_date); hiding the action is a courtesy.
 */
export function canRecordUse(request: Pick<OtLeaveRequest, 'leave_date' | 'reserved_minutes'>, todayLocal: string): boolean {
  return request.reserved_minutes > 0 && request.leave_date <= todayLocal;
}

export function canCancel(request: Pick<OtLeaveRequest, 'reserved_minutes'>): boolean {
  return request.reserved_minutes > 0;
}

export function canReverse(request: Pick<OtLeaveRequest, 'reversible_minutes'>): boolean {
  return request.reversible_minutes > 0;
}

/** Why record use is not offered, for a request that still has reserved minutes. */
export function useHint(request: Pick<OtLeaveRequest, 'leave_date' | 'reserved_minutes'>, todayLocal: string): string | null {
  if (request.reserved_minutes <= 0) return null;
  return request.leave_date > todayLocal ? `Use can be recorded from ${request.leave_date}.` : null;
}

/** A positive whole number of minutes from a text field, or null. */
export function parseMinutes(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d{1,5}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value > 0 ? value : null;
}

/** E-5: the insufficient-balance refusal in words; nothing was reserved. */
export function insufficientBalanceMessage(caught: unknown): string | null {
  if (!(caught instanceof ApiRequestError) || caught.status !== 409 || caught.code !== 'insufficient_balance') return null;
  const available = caught.details?.available_minutes;
  const needed = caught.details?.requested_minutes;
  const figures =
    typeof available === 'number' && typeof needed === 'number'
      ? ` ${minutesText(available)} available, ${minutesText(needed)} needed.`
      : '';
  return `Not enough available OT balance.${figures} Nothing was reserved.`;
}

export interface MismatchDay {
  work_date: string;
  kind_minutes: number;
  net_consumed_minutes: number;
}

/**
 * E-2: days whose OT-kind leave minutes differ from the request minutes still in use
 * (consumed minus reversed). This only informs; nothing is spent or released automatically.
 */
export function mismatchDays(days: readonly DayView[]): MismatchDay[] {
  const found = new Map<string, MismatchDay>();
  for (const day of days) {
    if (!day.ot_leave.mismatch) continue;
    found.set(day.work_date, {
      work_date: day.work_date,
      kind_minutes: day.ot_leave.kind_minutes,
      net_consumed_minutes: day.ot_leave.consumed_minutes - day.ot_leave.reversed_minutes,
    });
  }
  return [...found.values()].sort((a, b) => a.work_date.localeCompare(b.work_date));
}

export function mismatchText(day: MismatchDay): string {
  return `${day.work_date}: the day is labelled ${minutesText(day.kind_minutes)} of OT leave, but ${minutesText(day.net_consumed_minutes)} of OT is recorded as used. Nothing is spent automatically; use Record use on the leave request if needed.`;
}

/* ---- History ----------------------------------------------------------------- */

const OPERATION_TEXT: Record<string, string> = {
  'ot_leave.reserve': 'OT leave reserved',
  'ot_leave.use': 'OT leave use recorded',
  'ot_leave.cancel': 'OT leave cancelled',
  'ot_leave.reverse': 'OT leave use reversed',
  'ot_ledger.credit': 'OT credit posted',
  'ot_ledger.leave_consumption': 'Ledger: leave consumption',
  'ot_ledger.leave_reversal': 'Ledger: leave reversal',
  'ot_ledger.correction': 'OT credit corrected',
  'ot_ledger.deficit_debit': 'Deficit debit posted',
  'ot_ledger.opening_balance': 'Opening OT balance recorded',
  'import.preview': 'Workbook previewed',
  'import.commit': 'Workbook import committed',
  'timesheet.import': 'Period imported from a workbook',
  'day_entry.import': 'Day imported from a workbook',
  'auth.login': 'Signed in',
  'auth.logout': 'Signed out',
  'calendar.create': 'Calendar created',
  'calendar_version.create': 'Calendar rules changed',
  'payroll_exception.create': 'Payroll date exception added',
  'day_entry.create': 'Day entry created',
  'day_entry.update': 'Day entry changed',
  'work_session.create': 'Work session added',
  'work_session.update': 'Work session changed',
  'work_session.delete': 'Work session removed',
  'work_session.clock_in': 'Clocked in',
  'work_session.clock_out': 'Clocked out',
  'work_policy.create': 'Work policy saved',
  'signature.upload': 'Signature uploaded',
  'submission_settings.update': 'Submission settings saved',
  'submission_settings.auto_image_authorize': 'Automatic signature image authorized',
  'submission_settings.auto_image_revoke': 'Automatic signature image revoked',
  'timesheet.signoff': 'Timesheet signed off',
  'timesheet.auto_finalize': 'Submitted automatically',
  'timesheet.correction': 'Correction signed',
  'timesheet.late_review': 'Late review signed',
  'revision.resend': 'Revision resent',
  'delivery.decision': 'Delivery decision recorded',
  'deadline.overdue': 'Deadline passed with automatic submission off',
  'deadline.finalize_failed': 'Automatic submission could not complete',
  'automation.activation': 'Automatic submission activation changed',
  'user.create': 'Account created',
  'user.update': 'Account changed',
  'user.deactivate': 'Account deactivated',
  'user.reactivate': 'Account reactivated',
};

/** The plain label of an operation this screen has no name for (never the stored code). */
export const UNKNOWN_OPERATION_TEXT = 'Other change';

/** A readable label for an audit operation; an unknown operation gets a neutral plain label, not its stored code. */
export function operationText(operation: string): string {
  return OPERATION_TEXT[operation] ?? UNKNOWN_OPERATION_TEXT;
}

export interface FieldChange {
  field: string;
  before: string;
  after: string;
}

/** A snapshot value as text; the word `none` stands for an empty value. */
export function valueText(value: unknown): string {
  if (value === null || value === undefined) return 'none';
  if (typeof value === 'string') return value === '' ? 'none' : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/**
 * The fields that differ between the stored before and after snapshots. With no `before`
 * (a creation) every `after` field is listed against `none`; with no `after` (a removal)
 * every `before` field is listed.
 */
export function changedFields(before: HistoryEvent['before'], after: HistoryEvent['after']): FieldChange[] {
  const names = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  const changes: FieldChange[] = [];
  for (const field of names) {
    const was = before?.[field];
    const now = after?.[field];
    if (before !== null && after !== null && JSON.stringify(was) === JSON.stringify(now)) continue;
    changes.push({ field, before: valueText(was), after: valueText(now) });
  }
  return changes;
}
