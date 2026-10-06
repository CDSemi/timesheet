import { type AdminUser, ApiRequestError, type CalendarWarning, type OperationsStatus } from '../api.ts';
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

/* ---- Operations status (WP4-T07) ----------------------------------------------------------- */

/** A backup older than this is flagged: a daily backup plus two hours of slack. */
export const BACKUP_WARN_SECONDS = 26 * 3600;

export type StatusTone = 'neutral' | 'ok' | 'warn' | 'error';

const MINUTE = 60;
const HOUR = 3600;
const TWO_DAYS = 48 * HOUR;
const DAY = 24 * HOUR;

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/** An age in the largest whole unit that stays readable: minutes, then hours up to two days, then days. */
function ageText(seconds: number): string {
  if (seconds < MINUTE) return 'less than a minute';
  if (seconds < HOUR) return plural(Math.floor(seconds / MINUTE), 'minute');
  if (seconds < TWO_DAYS) return plural(Math.floor(seconds / HOUR), 'hour');
  return plural(Math.floor(seconds / DAY), 'day');
}

export interface BackupSummary {
  text: string;
  tone: StatusTone;
  /** A second, smaller line: the reason for a warning or the redacted fault code. */
  detail: string | null;
}

/** The backup line of the status panel. The server only reports data; every judgement about it is made here. */
export function backupSummary(backup: OperationsStatus['backup']): BackupSummary {
  if (backup.outcome === 'failed') return { text: 'Last backup attempt failed', tone: 'error', detail: backup.fault_code ?? 'unclassified' };
  if (backup.outcome === 'never' || backup.age_seconds === null) return { text: 'No backup recorded', tone: 'warn', detail: null };
  const text = `Last backup ${ageText(backup.age_seconds)} ago`;
  if (backup.age_seconds > BACKUP_WARN_SECONDS) return { text, tone: 'warn', detail: 'Older than 26 hours' };
  return { text, tone: 'ok', detail: null };
}

const BYTE_UNITS = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'] as const;
const BYTES_PER_UNIT = 1024;

/** Binary units; whole bytes below 1 KiB, one decimal above. */
export function byteText(bytes: number): string {
  if (bytes < BYTES_PER_UNIT) return `${bytes} B`;
  let value = bytes;
  let unit = 'B';
  for (const next of BYTE_UNITS) {
    if (value < BYTES_PER_UNIT) break;
    value /= BYTES_PER_UNIT;
    unit = next;
  }
  return `${value.toFixed(1)} ${unit}`;
}

/** Free space of the data volume as a sentence, or Unknown when the server could not read it. */
export function diskSummary(disk: OperationsStatus['disk']): string {
  const { free_bytes: free, total_bytes: total } = disk;
  if (free === null || total === null || total <= 0) return 'Unknown';
  return `${byteText(free)} free of ${byteText(total)} (${Math.round((free / total) * 100)}% free)`;
}

export interface OutboundBanner {
  headline: string;
  reason: string;
  counts: Array<{ label: string; value: number }>;
  action: string;
}

/** The pause banner: why delivery is paused and how many sends wait; null while delivery is active. */
export function outboundBanner(outbound: OperationsStatus['outbound']): OutboundBanner | null {
  if (!outbound.paused) return null;
  return {
    headline: 'Outbound delivery is paused',
    reason:
      outbound.reason === 'restored'
        ? 'This instance was restored from a backup, so nothing is sent until the held sends are reconciled.'
        : `Paused: ${outbound.reason ?? 'unspecified'}.`,
    counts: [
      { label: 'Held for reconciliation', value: outbound.held_send_jobs },
      { label: 'Waiting', value: outbound.queued_send_jobs },
      { label: 'Awaiting a decision', value: outbound.awaiting_decision },
    ],
    action: 'Release or drop the held sends, then resume, with the server command cli.js outbound.',
  };
}
