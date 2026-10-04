import { ApiRequestError, type AdminUser, type CalendarWarning } from '../api.ts';
import { describeError } from './errors.ts';

/*
 * Pure display logic of the Admin screen. The server decides every refusal; this module only
 * turns its codes into plain sentences, so an admin sees what to do next, not a bare code.
 */

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 256;

/** The server's password length rule, mirrored so that a short password is named before sending. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return `The temporary password must have ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function detailText(caught: ApiRequestError, key: string): string | null {
  const value = caught.details?.[key];
  return typeof value === 'string' ? value : null;
}

/** A clear sentence for the refusals the brief names, the server's own message otherwise; the code stays visible. */
export function refusalMessage(caught: unknown): string {
  if (!(caught instanceof ApiRequestError)) return describeError(caught);
  const code = caught.code;
  const earliest = detailText(caught, 'earliest_effective_from');
  const latest = detailText(caught, 'latest_effective_from');
  const sentences: Record<string, string> = {
    cannot_deactivate_self: 'You cannot deactivate your own account. Ask another administrator to do it.',
    last_active_admin: 'At least one active administrator must remain, so this change was refused.',
    calendar_in_use: 'The calendar cannot change because this account already has timesheet data. Its periods stay on the calendar they were created on.',
    unknown_calendar: 'That calendar does not exist.',
    email_in_use: 'An account with this email already exists.',
    weak_password: 'The temporary password must have 12 to 256 characters.',
    invalid_email: 'Enter a valid email address.',
    invalid_display_name: 'Enter a display name of 1 to 120 characters.',
    stale_preview: 'The calendar or the request changed since the preview. Preview it again, then commit.',
    retroactive_change: `A new version cannot take effect before ${earliest ?? 'the start of the current pay period'}. Choose that date or a later one.`,
    effective_from_before_latest_version: `A later version already starts on ${latest ?? 'a later date'}. Choose that date or a later one.`,
    finalized_period_affected: 'The change would alter days of a finalized timesheet. Choose a later effective date.',
    invalid_holiday_import: 'The holiday CSV has problems. Preview it, fix the listed rows and try again.',
    payroll_exception_exists: 'An exception for that payroll date already exists.',
    period_finalized: 'A finalized timesheet uses this pay period, so its payroll or due date cannot change.',
    reason_required: 'A reason is required.',
    forbidden: 'This account is not allowed to use this screen.',
  };
  const sentence = sentences[code];
  return sentence === undefined ? describeError(caught) : `${sentence} (${code})`;
}

export interface CalendarOption {
  id: string;
  label: string;
}

/**
 * The calendars an admin can pick. The server has no calendar list for admins, so the options
 * are the admin's own calendar (named) plus every calendar id that an account already uses.
 */
export function calendarOptions(users: readonly Pick<AdminUser, 'calendar_id'>[], own: { id: string; name: string }): CalendarOption[] {
  const options: CalendarOption[] = [{ id: own.id, label: own.name }];
  for (const user of users) {
    if (!options.some((option) => option.id === user.calendar_id)) {
      options.push({ id: user.calendar_id, label: `Calendar ${user.calendar_id.slice(0, 8)}` });
    }
  }
  return options;
}

/** The import year: the year the server warns about, else the year of the server's today. */
export function defaultImportYear(todayLocal: string, warnings: readonly CalendarWarning[]): number {
  return warnings[0]?.year ?? Number(todayLocal.slice(0, 4));
}

/** One CSV row problem as a sentence with its line. */
export function issueText(issue: { line: number; message: string; value?: string }): string {
  return `Line ${issue.line}: ${issue.message}${issue.value === undefined ? '' : ` (${issue.value})`}`;
}

/** Reads a chosen CSV file as text; a non-CSV name or a file over the server limit is named, not sent. */
export const CSV_MAX_CHARS = 50_000;

export function csvFileProblem(name: string, size: number): string | null {
  if (!name.toLowerCase().endsWith('.csv')) return 'Choose a .csv file, or paste the rows.';
  if (size > CSV_MAX_CHARS) return `The file is larger than ${CSV_MAX_CHARS} characters; split it by year.`;
  return null;
}
