import { isCivilDate } from '../../domain/dates.ts';
import { isValidEmailAddress, normalizeRecipients, validateBodyTemplate, validateSubjectTemplate } from '../../domain/emailTemplate.ts';
import { isDomainError } from '../../domain/errors.ts';
import { HOLIDAY_CSV_MAX_NAME_LENGTH, HOLIDAY_CSV_MAX_ROWS } from '../../domain/holidayCsv.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { DEFICIT_MODES, parseClockTime, validateWorkPolicyRules } from '../../domain/policy.ts';
import { checkAutoNoteText } from '../../domain/snapshot.ts';
import { isValidTimeZone } from '../../domain/zones.ts';
import type { CalendarInfo, DeficitMode, PolicyBreak, PolicyRequest, PolicyVersion, SubmissionSettings, SubmissionSettingsRequest } from '../api.ts';
import { DEFICIT_MODE_LABELS } from './policyModel.ts';
import type { Theme } from './themeModel.ts';

/*
 * The settings file (WP5-UX4-T05, U4-01; owner answers F-3 (a) and F-4 (a)). Two scopes, both built and read only in the person's
 * browser from the answers of existing routes:
 *   - "personal": the signed-in person's work policy, submission settings and, optionally, the theme of this device;
 *   - "company": for administrators, the calendar (working weekdays, holidays and closures, payroll exceptions).
 * Pure logic: no React, no DOM, no request. Everything the file may hold is a fixed allowlist of keys per scope; the builders copy
 * those keys one by one (a field the server answers with is never spread into the file), and the reader refuses an unknown
 * format, schema version or key before any preview. The file never holds the signature image or the automatic-image
 * authorization, a secret, any timesheet data or `apply_to_overdue_drafts`.
 */

export const SETTINGS_FILE_FORMAT = 'timesheet-settings';
export const SETTINGS_FILE_SCHEMA_VERSION = 1;
/**
 * The version recorded in the file. The client has no other source of it; `tests/client/settingsFileModel.test.ts` compares it with
 * the version in package.json, so a release that forgets to move it fails there.
 */
export const APP_VERSION = '0.1.0';
/** A larger file is not a settings file (a full company calendar is a few tens of kilobytes). */
export const SETTINGS_FILE_MAX_BYTES = 200_000;
const MAX_PROBLEMS = 8;
const MAX_EXCEPTIONS = 100;

/** The keys each object of a file may carry; nothing else is ever written and anything else is refused on reading. */
export const ALLOWED_KEYS = {
  file: ['format', 'schema_version', 'app_version', 'exported_at', 'scope', 'data'],
  personal: ['work_policy', 'submission', 'theme'],
  work_policy: ['required_minutes', 'threshold_minutes', 'rounding_step_minutes', 'reference_start', 'reference_end', 'breaks', 'deficit_mode'],
  policy_break: ['start_offset_minutes', 'duration_minutes', 'counts_as_work'],
  submission: [
    'to',
    'cc',
    'subject_template',
    'body_template',
    'show_ot_on_pdf',
    'reminder_offsets_minutes',
    'auto_note_enabled',
    'auto_note_text',
    'auto_submit',
  ],
  company: ['reporting_zone', 'payroll', 'weekdays', 'holidays', 'payroll_exceptions'],
  payroll: ['cycle_days', 'anchor_payroll_date', 'period_start_offset_days', 'period_end_offset_days', 'due_offset_days', 'due_local_time'],
  holiday: ['date', 'name', 'kind'],
  payroll_exception: ['nominal_payroll_date', 'payroll_date', 'due_local_date', 'due_local_time'],
} as const;

export type FileScope = 'personal' | 'company';

export interface PolicyData {
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  reference_start: string;
  reference_end: string;
  breaks: PolicyBreak[];
  deficit_mode: DeficitMode;
}

export interface SubmissionData {
  to: string[];
  cc: string[];
  subject_template: string;
  body_template: string;
  show_ot_on_pdf: boolean;
  reminder_offsets_minutes: number[];
  auto_note_enabled: boolean;
  auto_note_text: string;
  auto_submit: boolean;
}

export interface PersonalData {
  work_policy?: PolicyData;
  submission?: SubmissionData;
  theme?: Theme;
}

export interface HolidayRow {
  date: string;
  name: string;
  kind: 'holiday' | 'closure';
}

export interface ExceptionRow {
  nominal_payroll_date: string;
  payroll_date: string;
  due_local_date: string | null;
  due_local_time: string | null;
}

export interface PayrollData {
  cycle_days: number;
  anchor_payroll_date: string;
  period_start_offset_days: number;
  period_end_offset_days: number;
  due_offset_days: number;
  due_local_time: string;
}

export interface CompanyData {
  reporting_zone: string;
  payroll: PayrollData;
  weekdays: number[];
  holidays: HolidayRow[];
  payroll_exceptions: ExceptionRow[];
}

interface FileHead {
  format: typeof SETTINGS_FILE_FORMAT;
  schema_version: typeof SETTINGS_FILE_SCHEMA_VERSION;
  app_version: string;
  /** A UTC instant (never a local time). */
  exported_at: string;
}

export type PersonalFile = FileHead & { scope: 'personal'; data: PersonalData };
export type CompanyFile = FileHead & { scope: 'company'; data: CompanyData };
export type SettingsFile = PersonalFile | CompanyFile;

/** `timesheet-settings-<date>.json`, or `timesheet-company-calendar-<date>.json`; the date is an accounting date. */
export function settingsFileName(scope: FileScope, date: string): string {
  return scope === 'personal' ? `timesheet-settings-${date}.json` : `timesheet-company-calendar-${date}.json`;
}

/** The file text: indented JSON with a final newline. */
export function serializeSettingsFile(file: SettingsFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

/* ---- Building (export) ------------------------------------------------------------------------ */

const head = (exportedAt: string): FileHead => ({
  format: SETTINGS_FILE_FORMAT,
  schema_version: SETTINGS_FILE_SCHEMA_VERSION,
  app_version: APP_VERSION,
  exported_at: exportedAt,
});

function policyData(policy: PolicyVersion): PolicyData {
  return {
    required_minutes: policy.required_minutes,
    threshold_minutes: policy.threshold_minutes,
    rounding_step_minutes: policy.rounding_step_minutes,
    reference_start: policy.reference_start,
    reference_end: policy.reference_end,
    breaks: policy.breaks.map((item) => ({
      start_offset_minutes: item.start_offset_minutes,
      duration_minutes: item.duration_minutes,
      counts_as_work: item.counts_as_work,
    })),
    deficit_mode: policy.deficit_mode ?? 'ignore',
  };
}

function submissionData(settings: SubmissionSettings): SubmissionData {
  return {
    to: [...settings.recipients.to],
    cc: [...settings.recipients.cc],
    subject_template: settings.subject_template,
    body_template: settings.body_template,
    show_ot_on_pdf: settings.show_ot_on_pdf,
    reminder_offsets_minutes: [...settings.reminder_offsets_minutes],
    auto_note_enabled: settings.auto_note.enabled,
    auto_note_text: settings.auto_note.text,
    auto_submit: settings.auto_submit,
  };
}

export interface PersonalSource {
  /** The newest policy version, when the person has one. */
  policy: PolicyVersion | undefined;
  submission: SubmissionSettings;
  /** The theme of this device to include; null leaves it out. */
  theme: Theme | null;
  exportedAt: string;
}

/**
 * The personal file, or null when there is nothing to export (no policy version and submission settings never saved). Only the
 * allowlisted keys are copied: the signature, the automatic-image authorization, ids and instants of a settings version and
 * every other field of the answers stay behind.
 */
export function buildPersonalFile(source: PersonalSource): PersonalFile | null {
  const data: PersonalData = {};
  if (source.policy !== undefined) data.work_policy = policyData(source.policy);
  if (!source.submission.is_default) data.submission = submissionData(source.submission);
  if (data.work_policy === undefined && data.submission === undefined) return null;
  if (source.theme !== null) data.theme = source.theme;
  return { ...head(source.exportedAt), scope: 'personal', data };
}

/** The newest version of a calendar (the highest `seq`), the one a new import is merged into. */
export function newestCalendarVersion(calendar: Pick<CalendarInfo, 'versions'>): CalendarInfo['versions'][number] | undefined {
  return [...calendar.versions].sort((a, b) => b.seq - a.seq)[0];
}

/** The company file of the calendar as the server reports it (its newest version), or null when it has no version. */
export function buildCompanyFile(calendar: CalendarInfo, exportedAt: string): CompanyFile | null {
  const newest = newestCalendarVersion(calendar);
  if (newest === undefined) return null;
  return {
    ...head(exportedAt),
    scope: 'company',
    data: {
      reporting_zone: calendar.reporting_zone,
      payroll: {
        cycle_days: calendar.payroll.cycle_days,
        anchor_payroll_date: calendar.payroll.anchor_payroll_date,
        period_start_offset_days: calendar.payroll.period_start_offset_days,
        period_end_offset_days: calendar.payroll.period_end_offset_days,
        due_offset_days: calendar.payroll.due_offset_days,
        due_local_time: calendar.payroll.due_local_time,
      },
      weekdays: [...newest.weekdays].sort((a, b) => a - b),
      holidays: newest.dates.map((rule) => ({ date: rule.date, name: rule.name, kind: rule.kind })),
      payroll_exceptions: calendar.payroll_exceptions.map((item) => ({
        nominal_payroll_date: item.nominal_payroll_date,
        payroll_date: item.payroll_date,
        due_local_date: item.due_local_date,
        due_local_time: item.due_local_time,
      })),
    },
  };
}

/* ---- Reading (import) ------------------------------------------------------------------------- */

export type ParseResult = { ok: true; file: SettingsFile } | { ok: false; problems: string[] };

type Allowed = readonly string[];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** A key echoed in a message: short and printable, so a hostile file cannot flood the screen. */
function shown(text: string): string {
  const clean = [...text].map((char) => (char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? '?' : char)).join('');
  return clean.length > 40 ? `${clean.slice(0, 39)}…` : clean;
}

class Reader {
  readonly problems: string[] = [];

  add(message: string): void {
    if (this.problems.length < MAX_PROBLEMS) this.problems.push(message);
  }

  /** The object when it is one with only the allowed keys; otherwise a problem and null. */
  object(value: unknown, allowed: Allowed, path: string): Record<string, unknown> | null {
    if (!isRecord(value)) {
      this.add(`${path} must be an object.`);
      return null;
    }
    const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
    for (const key of unknown) this.add(`${path}.${shown(key)} is not a setting this app knows. The file was not read.`);
    return unknown.length === 0 ? value : null;
  }

  integer(value: unknown, path: string, min: number, max: number): number | null {
    if (typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max) return value;
    this.add(`${path} must be a whole number from ${min} to ${max}.`);
    return null;
  }

  boolean(value: unknown, path: string): boolean | null {
    if (typeof value === 'boolean') return value;
    this.add(`${path} must be true or false.`);
    return null;
  }

  string(value: unknown, path: string, max: number): string | null {
    if (typeof value === 'string' && value.length <= max) return value;
    this.add(`${path} must be text of at most ${max} characters.`);
    return null;
  }

  array(value: unknown, path: string, max: number): unknown[] | null {
    if (Array.isArray(value) && value.length <= max) return value;
    this.add(`${path} must be a list of at most ${max} items.`);
    return null;
  }

  date(value: unknown, path: string): string | null {
    if (isCivilDate(value)) return value;
    this.add(`${path} must be a real date as YYYY-MM-DD.`);
    return null;
  }

  clock(value: unknown, path: string): string | null {
    try {
      parseClockTime(value, path);
      return value as string;
    } catch (caught) {
      if (!isDomainError(caught)) throw caught;
      this.add(`${path} must be a clock time as HH:MM (00:00 to 23:59).`);
      return null;
    }
  }

  /** Runs a check of the domain rules; its message (English, never an address or text of the file) becomes the problem. */
  rule(path: string, check: () => void): boolean {
    try {
      check();
      return true;
    } catch (caught) {
      if (caught instanceof Error) this.add(`${path}: ${caught.message}.`);
      else throw caught;
      return false;
    }
  }
}

function readPolicy(reader: Reader, value: unknown): PolicyData | null {
  const path = 'data.work_policy';
  const record = reader.object(value, ALLOWED_KEYS.work_policy, path);
  if (record === null) return null;
  const before = reader.problems.length;
  const required = reader.integer(record.required_minutes, `${path}.required_minutes`, 1, 1440);
  const threshold = reader.integer(record.threshold_minutes, `${path}.threshold_minutes`, 0, 1440);
  const rounding = reader.integer(record.rounding_step_minutes, `${path}.rounding_step_minutes`, 1, 1440);
  const start = reader.clock(record.reference_start, `${path}.reference_start`);
  const end = reader.clock(record.reference_end, `${path}.reference_end`);
  const mode = DEFICIT_MODES.find((item) => item === record.deficit_mode);
  if (mode === undefined) reader.add(`${path}.deficit_mode must be one of ${DEFICIT_MODES.join(', ')}.`);
  const breaks: PolicyBreak[] = [];
  for (const [index, item] of (reader.array(record.breaks, `${path}.breaks`, 10) ?? []).entries()) {
    const row = reader.object(item, ALLOWED_KEYS.policy_break, `${path}.breaks[${index}]`);
    if (row === null) continue;
    const offset = reader.integer(row.start_offset_minutes, `${path}.breaks[${index}].start_offset_minutes`, 0, 1440);
    const duration = reader.integer(row.duration_minutes, `${path}.breaks[${index}].duration_minutes`, 1, 1440);
    const counts = reader.boolean(row.counts_as_work, `${path}.breaks[${index}].counts_as_work`);
    if (offset !== null && duration !== null && counts !== null) breaks.push({ start_offset_minutes: offset, duration_minutes: duration, counts_as_work: counts });
  }
  if (!Array.isArray(record.breaks) || reader.problems.length > before) return null;
  if (required === null || threshold === null || rounding === null || start === null || end === null || mode === undefined) return null;
  const ok = reader.rule(path, () =>
    validateWorkPolicyRules({
      requiredMinutes: required,
      thresholdMinutes: threshold,
      roundingStepMinutes: rounding,
      referenceStart: start,
      referenceEnd: end,
      breaks: breaks.map((item) => ({ startOffsetMinutes: item.start_offset_minutes, durationMinutes: item.duration_minutes, countsAsWork: item.counts_as_work })),
      deficitMode: mode,
    }),
  );
  return ok
    ? { required_minutes: required, threshold_minutes: threshold, rounding_step_minutes: rounding, reference_start: start, reference_end: end, breaks, deficit_mode: mode }
    : null;
}

function readAddresses(reader: Reader, value: unknown, path: string): string[] | null {
  const list = reader.array(value, `${path}`, 40);
  if (list === null) return null;
  const addresses: string[] = [];
  for (const [index, item] of list.entries()) {
    if (typeof item !== 'string' || !isValidEmailAddress(item.trim())) {
      reader.add(`${path}[${index}] is not a valid email address.`);
      return null;
    }
    addresses.push(item.trim());
  }
  return addresses;
}

function readSubmission(reader: Reader, value: unknown): SubmissionData | null {
  const path = 'data.submission';
  const record = reader.object(value, ALLOWED_KEYS.submission, path);
  if (record === null) return null;
  const before = reader.problems.length;
  const to = readAddresses(reader, record.to, `${path}.to`);
  const cc = readAddresses(reader, record.cc, `${path}.cc`);
  const subject = reader.string(record.subject_template, `${path}.subject_template`, 600);
  const body = reader.string(record.body_template, `${path}.body_template`, 12_000);
  const showOt = reader.boolean(record.show_ot_on_pdf, `${path}.show_ot_on_pdf`);
  const offsets: number[] = [];
  for (const [index, item] of (reader.array(record.reminder_offsets_minutes, `${path}.reminder_offsets_minutes`, 5) ?? []).entries()) {
    const minutes = reader.integer(item, `${path}.reminder_offsets_minutes[${index}]`, 1, 20_160);
    if (minutes !== null) offsets.push(minutes);
  }
  const noteEnabled = reader.boolean(record.auto_note_enabled, `${path}.auto_note_enabled`);
  const noteText = reader.string(record.auto_note_text, `${path}.auto_note_text`, 400);
  const autoSubmit = reader.boolean(record.auto_submit, `${path}.auto_submit`);
  if (reader.problems.length > before) return null;
  if (to === null || cc === null || subject === null || body === null || showOt === null || noteEnabled === null || noteText === null || autoSubmit === null) return null;
  const valid =
    reader.rule(`${path}.recipients`, () => normalizeRecipients(to, cc)) &&
    reader.rule(`${path}.subject_template`, () => validateSubjectTemplate(subject)) &&
    reader.rule(`${path}.body_template`, () => validateBodyTemplate(body)) &&
    (!noteEnabled ||
      reader.rule(`${path}.auto_note_text`, () => {
        const checked = checkAutoNoteText(noteText);
        if (!checked.ok) throw new Error(checked.message);
      }));
  return valid
    ? {
        to,
        cc,
        subject_template: subject,
        body_template: body,
        show_ot_on_pdf: showOt,
        reminder_offsets_minutes: offsets,
        auto_note_enabled: noteEnabled,
        auto_note_text: noteText,
        auto_submit: autoSubmit,
      }
    : null;
}

function readPersonal(reader: Reader, value: unknown): PersonalData | null {
  const record = reader.object(value, ALLOWED_KEYS.personal, 'data');
  if (record === null) return null;
  const data: PersonalData = {};
  if (record.work_policy !== undefined) {
    const policy = readPolicy(reader, record.work_policy);
    if (policy !== null) data.work_policy = policy;
  }
  if (record.submission !== undefined) {
    const submission = readSubmission(reader, record.submission);
    if (submission !== null) data.submission = submission;
  }
  if (record.theme !== undefined) {
    if (record.theme === 'light' || record.theme === 'dark') data.theme = record.theme;
    else reader.add("data.theme must be 'light' or 'dark'.");
  }
  if (reader.problems.length > 0) return null;
  if (data.work_policy === undefined && data.submission === undefined) {
    reader.add('The file holds neither a work policy nor submission settings.');
    return null;
  }
  return data;
}

/** A holiday name the server's CSV reader accepts: one line, no control character, not a spreadsheet formula. */
function holidayNameProblem(name: string): string | null {
  if (name.trim() === '') return 'a name is required';
  if (name.trim().length > HOLIDAY_CSV_MAX_NAME_LENGTH) return `use at most ${HOLIDAY_CSV_MAX_NAME_LENGTH} characters`;
  if ([...name].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return 'the name holds a control character or a line break';
  if ('=+-@'.includes(name.trim().charAt(0))) return 'the name starts with a character a spreadsheet runs as a formula';
  return null;
}

function readCompany(reader: Reader, value: unknown): CompanyData | null {
  const path = 'data';
  const record = reader.object(value, ALLOWED_KEYS.company, path);
  if (record === null) return null;
  const before = reader.problems.length;
  const zone = typeof record.reporting_zone === 'string' && isValidTimeZone(record.reporting_zone) ? record.reporting_zone : null;
  if (zone === null) reader.add(`${path}.reporting_zone must be an IANA time zone such as America/Los_Angeles.`);

  let payroll: PayrollData | null = null;
  const payrollRecord = reader.object(record.payroll, ALLOWED_KEYS.payroll, `${path}.payroll`);
  if (payrollRecord !== null) {
    const cycle = reader.integer(payrollRecord.cycle_days, `${path}.payroll.cycle_days`, 1, 366);
    const anchor = reader.date(payrollRecord.anchor_payroll_date, `${path}.payroll.anchor_payroll_date`);
    const startOffset = reader.integer(payrollRecord.period_start_offset_days, `${path}.payroll.period_start_offset_days`, -366, 366);
    const endOffset = reader.integer(payrollRecord.period_end_offset_days, `${path}.payroll.period_end_offset_days`, -366, 366);
    const dueOffset = reader.integer(payrollRecord.due_offset_days, `${path}.payroll.due_offset_days`, -366, 366);
    const dueTime = reader.clock(payrollRecord.due_local_time, `${path}.payroll.due_local_time`);
    if (cycle !== null && anchor !== null && startOffset !== null && endOffset !== null && dueOffset !== null && dueTime !== null) {
      payroll = {
        cycle_days: cycle,
        anchor_payroll_date: anchor,
        period_start_offset_days: startOffset,
        period_end_offset_days: endOffset,
        due_offset_days: dueOffset,
        due_local_time: dueTime,
      };
    }
  }

  const weekdays: number[] = [];
  for (const [index, item] of (reader.array(record.weekdays, `${path}.weekdays`, 7) ?? []).entries()) {
    const day = reader.integer(item, `${path}.weekdays[${index}]`, 1, 7);
    if (day !== null) weekdays.push(day);
  }
  if (Array.isArray(record.weekdays) && (weekdays.length === 0 || new Set(weekdays).size !== weekdays.length)) {
    reader.add(`${path}.weekdays must list each working weekday once, 1 (Monday) to 7 (Sunday).`);
  }

  const holidays: HolidayRow[] = [];
  const seen = new Set<string>();
  for (const [index, item] of (reader.array(record.holidays, `${path}.holidays`, HOLIDAY_CSV_MAX_ROWS * 4) ?? []).entries()) {
    const row = reader.object(item, ALLOWED_KEYS.holiday, `${path}.holidays[${index}]`);
    if (row === null) continue;
    const date = reader.date(row.date, `${path}.holidays[${index}].date`);
    const name = reader.string(row.name, `${path}.holidays[${index}].name`, 400);
    const kind = row.kind === 'holiday' || row.kind === 'closure' ? row.kind : null;
    if (kind === null) reader.add(`${path}.holidays[${index}].kind must be holiday or closure.`);
    if (name !== null) {
      const problem = holidayNameProblem(name);
      if (problem !== null) reader.add(`${path}.holidays[${index}].name: ${problem}.`);
    }
    if (date !== null && seen.has(date)) reader.add(`${path}.holidays lists ${date} twice.`);
    if (date !== null) seen.add(date);
    if (date !== null && name !== null && kind !== null) holidays.push({ date, name: name.trim(), kind });
  }
  if (Object.values(countByYear(holidays)).some((count) => count > HOLIDAY_CSV_MAX_ROWS)) {
    reader.add(`${path}.holidays lists more than ${HOLIDAY_CSV_MAX_ROWS} dates in one year.`);
  }

  const exceptions: ExceptionRow[] = [];
  for (const [index, item] of (reader.array(record.payroll_exceptions, `${path}.payroll_exceptions`, MAX_EXCEPTIONS) ?? []).entries()) {
    const row = reader.object(item, ALLOWED_KEYS.payroll_exception, `${path}.payroll_exceptions[${index}]`);
    if (row === null) continue;
    const nominal = reader.date(row.nominal_payroll_date, `${path}.payroll_exceptions[${index}].nominal_payroll_date`);
    const actual = reader.date(row.payroll_date, `${path}.payroll_exceptions[${index}].payroll_date`);
    const dueDate = row.due_local_date === null ? null : reader.date(row.due_local_date, `${path}.payroll_exceptions[${index}].due_local_date`);
    const dueTime = row.due_local_time === null ? null : reader.clock(row.due_local_time, `${path}.payroll_exceptions[${index}].due_local_time`);
    if (nominal !== null && actual !== null && (row.due_local_date === null || dueDate !== null) && (row.due_local_time === null || dueTime !== null)) {
      exceptions.push({ nominal_payroll_date: nominal, payroll_date: actual, due_local_date: dueDate, due_local_time: dueTime });
    }
  }
  if (new Set(exceptions.map((item) => item.nominal_payroll_date)).size !== exceptions.length) {
    reader.add(`${path}.payroll_exceptions lists a payroll date twice.`);
  }

  if (reader.problems.length > before || zone === null || payroll === null) return null;
  return { reporting_zone: zone, payroll, weekdays, holidays, payroll_exceptions: exceptions };
}

/** Why a chosen file is not read at all (before its text is): the name and the size. */
export function settingsFileProblem(name: string, size: number): string | null {
  if (!name.toLowerCase().endsWith('.json')) return 'Choose a settings file (.json) exported from this app.';
  if (size > SETTINGS_FILE_MAX_BYTES) return 'This file is too large to be a settings file.';
  return null;
}

/**
 * Reads the text of a settings file. An unknown format, schema version or key, a wrong scope, an invalid value or time is
 * refused with a message each (up to eight), before any request or preview; a refused file is never partly applied.
 */
export function parseSettingsFile(text: string, expected: FileScope): ParseResult {
  if (text.length > SETTINGS_FILE_MAX_BYTES) return { ok: false, problems: ['This file is too large to be a settings file.'] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, problems: ['The file is not valid JSON, so it cannot be a settings file.'] };
  }
  const reader = new Reader();
  if (!isRecord(parsed)) return { ok: false, problems: ['The file is not a settings file: its top level is not an object.'] };
  if (parsed.format !== SETTINGS_FILE_FORMAT) return { ok: false, problems: [`The file is not a settings file of this app (its format is not "${SETTINGS_FILE_FORMAT}").`] };
  if (parsed.schema_version !== SETTINGS_FILE_SCHEMA_VERSION) {
    return {
      ok: false,
      problems: [`This file uses schema version ${typeof parsed.schema_version === 'number' ? String(parsed.schema_version) : 'unknown'}; this app reads version ${SETTINGS_FILE_SCHEMA_VERSION} only.`],
    };
  }
  if (reader.object(parsed, ALLOWED_KEYS.file, 'file') === null) return { ok: false, problems: reader.problems };
  const appVersion = typeof parsed.app_version === 'string' && /^[0-9A-Za-z.+-]{1,40}$/.test(parsed.app_version) ? parsed.app_version : null;
  if (appVersion === null) reader.add('app_version must be a short version text such as 0.1.0.');
  const exportedAt = reader.rule('exported_at', () => parseUtcInstant(parsed.exported_at, 'exported_at')) ? (parsed.exported_at as string) : null;
  if (parsed.scope !== 'personal' && parsed.scope !== 'company') {
    reader.add('scope must be personal or company.');
  } else if (parsed.scope !== expected) {
    return {
      ok: false,
      problems: [expected === 'personal' ? 'This is a company calendar file. Import it under Administration, not in your personal settings.' : 'This is a personal settings file. Import it in Settings, not as a company calendar.'],
    };
  }
  if (reader.problems.length > 0 || appVersion === null || exportedAt === null) return { ok: false, problems: reader.problems };
  if (expected === 'personal') {
    const data = readPersonal(reader, parsed.data);
    if (data === null) return { ok: false, problems: reader.problems };
    return { ok: true, file: { format: SETTINGS_FILE_FORMAT, schema_version: SETTINGS_FILE_SCHEMA_VERSION, app_version: appVersion, exported_at: exportedAt, scope: 'personal', data } };
  }
  const data = readCompany(reader, parsed.data);
  if (data === null) return { ok: false, problems: reader.problems };
  return { ok: true, file: { format: SETTINGS_FILE_FORMAT, schema_version: SETTINGS_FILE_SCHEMA_VERSION, app_version: appVersion, exported_at: exportedAt, scope: 'company', data } };
}

/* ---- The personal import: comparison and the requests ----------------------------------------- */

export interface ComparisonRow {
  key: string;
  label: string;
  now: string;
  file: string;
  changed: boolean;
}

export interface ComparisonGroup {
  id: 'work_policy' | 'submission' | 'theme' | 'calendar';
  title: string;
  rows: ComparisonRow[];
  /** True when applying the group writes something (a new version, or the theme). */
  changed: boolean;
}

/** What this person has now, read from the existing routes. */
export interface PersonalCurrent {
  policy: PolicyVersion | undefined;
  submission: SubmissionSettings;
  /** The theme in effect on this device. */
  theme: Theme;
}

const minutes = (value: number): string => `${value} min`;

function offsetText(value: number): string {
  return value % 60 === 0 ? `${value / 60} h` : `${value} min`;
}

const offsetsText = (offsets: readonly number[]): string => (offsets.length === 0 ? 'none' : offsets.map(offsetText).join(', '));
const listText = (items: readonly string[]): string => (items.length === 0 ? 'none' : items.join(', '));

function breaksText(breaks: readonly PolicyBreak[]): string {
  if (breaks.length === 0) return 'none';
  return [...breaks]
    .sort((a, b) => a.start_offset_minutes - b.start_offset_minutes)
    .map((item) => `${item.duration_minutes} min at +${item.start_offset_minutes} min${item.counts_as_work ? ' (paid)' : ''}`)
    .join('; ');
}

/** A long template as a one-line excerpt, so the table stays readable; the full text is compared, not the excerpt. */
function excerpt(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length > 90 ? `${oneLine.slice(0, 89)}…` : oneLine === '' ? 'empty' : oneLine;
}

function row(key: string, label: string, now: string, file: string, changed = now !== file): ComparisonRow {
  return { key, label, now, file, changed };
}

function currentPolicyData(policy: PolicyVersion | undefined): PolicyData | null {
  return policy === undefined ? null : policyData(policy);
}

const sortedBreaks = (breaks: readonly PolicyBreak[]): PolicyBreak[] => [...breaks].sort((a, b) => a.start_offset_minutes - b.start_offset_minutes);

function samePolicy(a: PolicyData | null, b: PolicyData): boolean {
  if (a === null) return false;
  return JSON.stringify({ ...a, breaks: sortedBreaks(a.breaks) }) === JSON.stringify({ ...b, breaks: sortedBreaks(b.breaks) });
}

/**
 * The automatic submission value a file leads to. A file never switches it on by itself: "on" in the file takes effect only with
 * the separate tick (or when it is already on); "off" in the file switches it off.
 */
export function resolveAutoSubmit(fileValue: boolean, currentValue: boolean, tick: boolean): boolean {
  return fileValue ? tick || currentValue : false;
}

function effectiveSubmission(file: SubmissionData, current: SubmissionSettings, tick: boolean): SubmissionData {
  return { ...file, auto_submit: resolveAutoSubmit(file.auto_submit, current.auto_submit, tick) };
}

function sameSubmission(a: SubmissionData, b: SubmissionData): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** True when a tick is meaningful: the file asks for automatic submission and it is off now. */
export function offersAutoSubmitTick(data: PersonalData, current: PersonalCurrent): boolean {
  return data.submission?.auto_submit === true && !current.submission.auto_submit;
}

/** The comparison "Now / In the file" of the groups the file holds, and which of them would write. */
export function personalComparison(data: PersonalData, current: PersonalCurrent, tick: boolean): ComparisonGroup[] {
  const groups: ComparisonGroup[] = [];
  const policy = data.work_policy;
  if (policy !== undefined) {
    const now = currentPolicyData(current.policy);
    const rows = [
      row('required', 'Required time per day', now === null ? 'no version yet' : minutes(now.required_minutes), minutes(policy.required_minutes)),
      row('threshold', 'Threshold (N)', now === null ? 'no version yet' : minutes(now.threshold_minutes), minutes(policy.threshold_minutes)),
      row('rounding', 'Rounding step (M)', now === null ? 'no version yet' : minutes(now.rounding_step_minutes), minutes(policy.rounding_step_minutes)),
      row(
        'reference',
        'Reference hours',
        now === null ? 'no version yet' : `${now.reference_start}-${now.reference_end}`,
        `${policy.reference_start}-${policy.reference_end}`,
      ),
      row('breaks', 'Breaks', now === null ? 'no version yet' : breaksText(now.breaks), breaksText(policy.breaks)),
      row('deficit', 'When a day falls short', now === null ? 'no version yet' : DEFICIT_MODE_LABELS[now.deficit_mode], DEFICIT_MODE_LABELS[policy.deficit_mode]),
    ];
    groups.push({ id: 'work_policy', title: 'Work policy (a new version)', rows, changed: !samePolicy(now, policy) });
  }
  const submission = data.submission;
  if (submission !== undefined) {
    const now = submissionData(current.submission);
    const saved = current.submission.is_default ? ' (not saved yet)' : '';
    const effective = effectiveSubmission(submission, current.submission, tick);
    const rows = [
      row('to', 'To', listText(now.to) + (now.to.length === 0 ? saved : ''), listText(submission.to)),
      row('cc', 'Cc', listText(now.cc), listText(submission.cc)),
      row('subject', 'Subject template', excerpt(now.subject_template), excerpt(submission.subject_template), now.subject_template !== submission.subject_template),
      row('body', 'Body template', excerpt(now.body_template), excerpt(submission.body_template), now.body_template !== submission.body_template),
      row('reminders', 'Reminders before the deadline', offsetsText(now.reminder_offsets_minutes), offsetsText(submission.reminder_offsets_minutes)),
      row('show_ot', 'Show OT on the PDF', now.show_ot_on_pdf ? 'Yes' : 'No', submission.show_ot_on_pdf ? 'Yes' : 'No'),
      row('note', 'Automatic note line', now.auto_note_enabled ? 'On' : 'Off', submission.auto_note_enabled ? 'On' : 'Off'),
      row('note_text', 'Automatic note text', excerpt(now.auto_note_text), excerpt(submission.auto_note_text), now.auto_note_text !== submission.auto_note_text),
      row('auto_submit', 'Automatic submission', now.auto_submit ? 'On' : 'Off', submission.auto_submit ? 'On in the file' : 'Off', now.auto_submit !== submission.auto_submit),
    ];
    groups.push({ id: 'submission', title: 'Email and reminders (a new version)', rows, changed: !sameSubmission(effective, now) });
  }
  if (data.theme !== undefined) {
    const label = (theme: Theme) => (theme === 'dark' ? 'Dark' : 'Light');
    groups.push({
      id: 'theme',
      title: 'This device',
      rows: [row('theme', 'Theme on this device', label(current.theme), label(data.theme))],
      changed: current.theme !== data.theme,
    });
  }
  return groups;
}

/** The note a policy version gets from the file: the file's name, as one printable line. */
export function importNote(fileName: string): string {
  const clean = [...fileName].map((char) => (char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? ' ' : char)).join('').trim();
  return `Imported from settings file ${clean.length > 120 ? `${clean.slice(0, 119)}…` : clean}`;
}

/** The body of POST /api/policies (and of its preview): the file's rules from the chosen date. */
export function buildPolicyRequest(policy: PolicyData, effectiveFrom: string, fileName: string): PolicyRequest {
  return {
    effective_from: effectiveFrom,
    required_minutes: policy.required_minutes,
    threshold_minutes: policy.threshold_minutes,
    rounding_step_minutes: policy.rounding_step_minutes,
    reference_start: policy.reference_start,
    reference_end: policy.reference_end,
    breaks: policy.breaks.map((item) => ({ ...item })),
    deficit_mode: policy.deficit_mode,
    note: importNote(fileName),
  };
}

/**
 * The body of POST /api/settings/submission, bound to the version that was shown. `auto_submit` follows `resolveAutoSubmit`;
 * `apply_to_overdue_drafts` is never sent; the note text is left out while the note line is off and its text is not usable.
 */
export function buildSubmissionRequest(file: SubmissionData, current: SubmissionSettings, tick: boolean): SubmissionSettingsRequest {
  const note = checkAutoNoteText(file.auto_note_text);
  return {
    expected_seq: current.seq,
    to: file.to,
    cc: file.cc,
    subject_template: file.subject_template,
    body_template: file.body_template,
    auto_submit: resolveAutoSubmit(file.auto_submit, current.auto_submit, tick),
    auto_note_enabled: file.auto_note_enabled,
    ...(note.ok ? { auto_note_text: note.text } : {}),
    show_ot_on_pdf: file.show_ot_on_pdf,
    reminder_offsets_minutes: file.reminder_offsets_minutes,
  };
}

export interface PersonalPlan {
  groups: ComparisonGroup[];
  policy: PolicyRequest | null;
  submission: SubmissionSettingsRequest | null;
  theme: Theme | null;
  /** The number of writes (policy version, submission version, theme); zero means nothing in the file differs. */
  changeCount: number;
}

/** What a confirmation would write: only the groups that differ, as requests built from the file and the shown versions. */
export function planPersonalImport(data: PersonalData, current: PersonalCurrent, options: { tick: boolean; effectiveFrom: string; fileName: string }): PersonalPlan {
  const groups = personalComparison(data, current, options.tick);
  const changed = (id: ComparisonGroup['id']) => groups.find((group) => group.id === id)?.changed === true;
  const policy = data.work_policy !== undefined && changed('work_policy') ? buildPolicyRequest(data.work_policy, options.effectiveFrom, options.fileName) : null;
  const submission = data.submission !== undefined && changed('submission') ? buildSubmissionRequest(data.submission, current.submission, options.tick) : null;
  const theme = data.theme !== undefined && changed('theme') ? data.theme : null;
  return { groups, policy, submission, theme, changeCount: [policy, submission, theme].filter((item) => item !== null).length };
}

/** The default "applies from" date: the first day after the pay period that contains today (earlier days keep their policy, R-07). */
export function nextPeriodStart(inProgressPeriodEnd: string): string {
  const [year = 0, month = 1, day = 1] = inProgressPeriodEnd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

/* ---- The company import ------------------------------------------------------------------------ */

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function weekdaysText(weekdays: readonly number[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_NAMES[day - 1] ?? String(day))
    .join(', ');
}

/**
 * Why the file cannot be applied to this calendar, in words. A calendar's reporting zone and payroll schedule are immutable, and
 * no route changes working weekdays, so a file whose values differ is refused rather than applied in part.
 */
export function companyCalendarProblems(data: CompanyData, calendar: CalendarInfo): string[] {
  const problems: string[] = [];
  if (data.reporting_zone !== calendar.reporting_zone) {
    problems.push(`The file's reporting zone (${data.reporting_zone}) is not this calendar's (${calendar.reporting_zone}). A calendar's zone never changes, so the file was refused.`);
  }
  const labels: Array<[keyof PayrollData, string]> = [
    ['cycle_days', 'cycle length'],
    ['anchor_payroll_date', 'anchor payroll date'],
    ['period_start_offset_days', 'period start offset'],
    ['period_end_offset_days', 'period end offset'],
    ['due_offset_days', 'due offset'],
    ['due_local_time', 'due time'],
  ];
  const differing = labels.filter(([key]) => data.payroll[key] !== calendar.payroll[key]).map(([, label]) => label);
  if (differing.length > 0) {
    problems.push(`The file's payroll schedule differs from this calendar's (${differing.join(', ')}). The schedule never changes, so the file was refused.`);
  }
  const newest = newestCalendarVersion(calendar);
  if (newest !== undefined && weekdaysText(newest.weekdays) !== weekdaysText(data.weekdays)) {
    problems.push(`The file's working weekdays (${weekdaysText(data.weekdays)}) differ from this calendar's (${weekdaysText(newest.weekdays)}). Importing cannot change weekdays, so the file was refused.`);
  }
  return problems;
}

function countByYear(rows: readonly HolidayRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of rows) counts[item.date.slice(0, 4)] = (counts[item.date.slice(0, 4)] ?? 0) + 1;
  return counts;
}

/** The years the file lists dates for, oldest first. */
export function companyYears(data: CompanyData): number[] {
  return Object.keys(countByYear(data.holidays))
    .map(Number)
    .sort((a, b) => a - b);
}

/** The year to offer first: the earliest listed year that is not before today's year, else the last listed year. */
export function defaultCompanyYear(years: readonly number[], todayYear: number): number | null {
  return years.find((year) => year >= todayYear) ?? years.at(-1) ?? null;
}

/** The file's dates of one year as the holiday CSV the existing import reads (`date,name,kind`). */
export function holidayCsvForYear(data: CompanyData, year: number): string {
  const quote = (text: string) => (/[",]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text);
  const lines = data.holidays
    .filter((item) => item.date.startsWith(`${year}-`))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((item) => `${item.date},${quote(item.name)},${item.kind}`);
  return `date,name,kind\n${lines.join('\n')}\n`;
}

/** The dates of one year in the calendar's newest version, as the company file would hold them. */
export function calendarDatesForYear(calendar: CalendarInfo, year: number): HolidayRow[] {
  const newest = newestCalendarVersion(calendar);
  return (newest?.dates ?? []).filter((item) => item.date.startsWith(`${year}-`)).map((item) => ({ date: item.date, name: item.name, kind: item.kind }));
}

export interface ExceptionPlan {
  /** Not on the calendar yet: each is recorded once through the payroll-exception route. */
  add: ExceptionRow[];
  /** Already there, identical. */
  same: number;
  /** Already there with other values: an exception cannot be edited, so it is kept as it is. */
  differing: ExceptionRow[];
}

export function planExceptions(file: readonly ExceptionRow[], current: CalendarInfo['payroll_exceptions']): ExceptionPlan {
  const plan: ExceptionPlan = { add: [], same: 0, differing: [] };
  for (const item of file) {
    const existing = current.find((candidate) => candidate.nominal_payroll_date === item.nominal_payroll_date);
    if (existing === undefined) plan.add.push(item);
    else if (
      existing.payroll_date === item.payroll_date &&
      existing.due_local_date === item.due_local_date &&
      existing.due_local_time === item.due_local_time
    ) {
      plan.same += 1;
    } else {
      plan.differing.push(item);
    }
  }
  return plan;
}

/** The body of POST /api/admin/payroll-exceptions for one exception of the file; the reason names the file. */
export function exceptionRequest(item: ExceptionRow, calendarId: string, fileName: string) {
  return {
    calendar_id: calendarId,
    nominal_payroll_date: item.nominal_payroll_date,
    payroll_date: item.payroll_date,
    due_local_date: item.due_local_date,
    due_local_time: item.due_local_time,
    reason: importNote(fileName),
  };
}

/** Every key path of a value (arrays as `[]`), for the tests of the allowlist and the privacy of a file. */
export function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return [...new Set(value.flatMap((item) => keyPaths(item, `${prefix}[]`)))];
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => [`${prefix}${prefix === '' ? '' : '.'}${key}`, ...keyPaths(child, `${prefix}${prefix === '' ? '' : '.'}${key}`)]);
}
