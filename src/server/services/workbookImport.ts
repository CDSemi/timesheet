import { createHash, randomUUID } from 'node:crypto';
import type { DayCategory } from '../../domain/attendance.ts';
import { classifyDate } from '../../domain/calendar.ts';
import { addDays, type CivilDate } from '../../domain/dates.ts';
import { isDomainError } from '../../domain/errors.ts';
import { type PayPeriod, payPeriodForPayrollDate } from '../../domain/periods.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { ApiError, notFound } from '../http/errors.ts';
import {
  type CellReference,
  type DayPreview,
  type Finding,
  type LabelMapping,
  MAPPING_VERSION,
  previewWorkbook,
  type WorkbookPreview,
} from '../import/templateMapping.ts';
import { type ReaderLimits, type WorkbookRejectionCode, WorkbookRejectedError } from '../import/xlsxReader.ts';
import { recordAudit } from './audit.ts';
import { ensurePayPeriodRow } from './periods.ts';
import { findTimesheet, loadScope, todayInReportingZone, type UserScope } from './timesheets.ts';

/*
 * Workbook import: preview and commit (WP4-T09; docs/03 "Imports, opening balance and retention"; docs/07 "Workbook
 * import"; owner decisions F-1 (a) and F-2 (a), 2026-10-05; AC-12).
 *
 * Who (F-1): every function takes the owner from the session. A batch is read and committed only by the user who
 * uploaded it; any other id (another user's batch, an administrator's request, a share grantee's request) is
 * indistinguishable from a missing one (404). Nothing here is mounted under /api/shared.
 *
 * Preview reads the upload with the WP4-T08 reader and mapping v1 (formulas are never evaluated), stores the source
 * privately through the file store and stores a report: the mapped days with their source cells, the reader's
 * findings (unknown labels, duplicates, template defects) and the conflict plan against the owner's existing rows.
 * The idempotency key is owner + source SHA-256 + mapping version: the same upload returns the existing batch and
 * stores nothing new. The stored report is bounded (WP4-FIXB2): the mapping keeps at most 200 characters of any cell
 * text, and a report whose JSON (plan included) is over `MAX_REPORT_BYTES`, or that cannot be serialized, is refused
 * as 422 `workbook_rejected` (`report_too_large`); anything else thrown while the untrusted package is read, mapped or
 * turned into a report is 422 `report_failed`, never a 500. A refused upload stores nothing.
 *
 * Commit (one short IMMEDIATE transaction, no network and no file write inside) writes only:
 * - `timesheets` rows with `imported_unverified = 1` (plus the shared `pay_periods` row the timesheet refers to,
 *   through the existing `ensurePayPeriodRow`, when no one has used that period yet);
 * - `day_entries` with `category_source = 'explicit'` (a label only: no leave minutes, no notes);
 * - audit rows with actor = owner;
 * - the batch row's own `preview -> committed` transition.
 * It writes no work session (O12: the template's clock cells are reported, never imported), no ledger event, no
 * revision, sign-off, job or delivery attempt (F-2). A repeated identical commit is a no-op that returns the first
 * result; a different commit of a committed batch is 409 `import_already_committed`.
 *
 * Conflict semantics (the most conservative reading of the plan and docs/07 "Require explicit conflict decisions";
 * recorded in every report as `rules`):
 * - The unit of import is a whole payroll period, because `imported_unverified` is a period flag (F-2: an imported
 *   period is read-only history). A period is imported only when the owner has nothing in it yet: no timesheet row,
 *   day entry, work session, OT leave request or ledger entry dated inside it.
 * - Every labelled day of a period that is not new needs an explicit decision, and the only decision accepted is
 *   `skip`: a finalized, signed or submitted period, an imported period and a draft app period are never
 *   overwritten, and nothing is merged into them. Whether a draft app period may ever receive imported days is an
 *   open owner choice (see the task report); until it is made, the safe default stands.
 * - A period that has not ended yet (its last day is today or later in the reporting zone) is not history: skip only.
 * - A period whose payroll due instant has not passed yet is skip only too (WP4-FIXB, R3): it has ended but is still
 *   the live period, and an imported period can no longer be signed or submitted, so an import must not make it
 *   unsignable. This is stricter than the I-3 default ("not ended"); the owner may reverse it.
 * - A sheet whose payroll date is not one of the owner's calendar periods (or whose period has other bounds): skip
 *   only.
 * - A day the mapping cannot place without a guess (unknown label, a label with no single day category such as
 *   "Off day (overtime used)", a missing or unexpected date cell, a date that appears twice, a date outside the
 *   calendar) needs `skip`.
 * - A floating holiday label, or a label read from a formula cache, maps to one category but is not authoritative:
 *   it needs an explicit decision, `skip` or `import`.
 * - A blank day is not imported and needs no decision; the calendar default shows for it.
 * Without a decision for every listed day the commit is refused (409 `decisions_required`) and nothing is written.
 */

export const XLSX_MEDIA_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * The largest stored report (`imports.report_json`, plan included), in UTF-8 bytes (WP4-FIXB2). Measured stored
 * reports: the tracked template 4 KB, 12 dated sheets 0.11 MiB, 61 dated sheets (the 64-sheet limit) 0.58 MiB, and a
 * flood of 2 000 holidays and 854 labels of capped text 1.4 MiB. Every text in a report is capped, but JSON escaping
 * can still make a hostile one larger (2 000 holiday names of control characters: 2.4 MiB); it is refused, never
 * stored.
 */
export const MAX_REPORT_BYTES = 2 * 1024 * 1024;

/** Lowered limits for tests: the reader's, and the stored-report cap. */
export type PreviewLimits = Partial<ReaderLimits> & { maxReportBytes?: number };

export type DecisionAction = 'skip' | 'import';

export type DayReason =
  | 'finalized_period'
  | 'imported_period'
  | 'existing_app_rows'
  | 'period_not_in_calendar'
  | 'period_not_ended'
  | 'period_not_due'
  | 'unknown_label'
  | 'unsupported_label'
  | 'date_cell_missing'
  | 'date_unexpected'
  | 'duplicate_date'
  | 'outside_calendar'
  | 'floating_holiday'
  | 'label_from_formula_cache';

/** Reasons that still allow an explicit `import`; every other reason allows `skip` only. */
const IMPORTABLE_ON_DECISION: ReadonlySet<DayReason> = new Set(['floating_holiday', 'label_from_formula_cache']);

export type PeriodState = 'new' | 'existing_app_rows' | 'finalized' | 'imported' | 'not_in_calendar' | 'not_ended' | 'not_due';

const PERIOD_REASON: Record<Exclude<PeriodState, 'new'>, DayReason> = {
  existing_app_rows: 'existing_app_rows',
  finalized: 'finalized_period',
  imported: 'imported_period',
  not_in_calendar: 'period_not_in_calendar',
  not_ended: 'period_not_ended',
  not_due: 'period_not_due',
};

/** The conflict semantics, stored in every report so a later reader sees the rules the batch was planned under. */
export const IMPORT_RULES: readonly string[] = [
  'A whole payroll period is imported only when the owner has no timesheet, day entry, work session, OT leave request or ledger entry in it.',
  'Every labelled day of a finalized, imported or draft app period needs an explicit skip decision; such periods are never overwritten or merged.',
  'A period that has not ended in the reporting zone, or whose payroll date is not a period of the owner calendar, is skipped by explicit decision.',
  'A period whose payroll due instant has not passed yet is skipped by explicit decision, so that an import cannot make a live period unsignable.',
  'Unknown labels, labels without a single day category, missing or unexpected dates, duplicate dates and dates outside the calendar need an explicit skip decision.',
  'Floating holiday labels and labels read from a formula cache need an explicit skip or import decision.',
  'Blank days and clock cells are never imported; clock cells stay in the report and the private source.',
  'An imported period is read-only history: no ledger event, no sign-off, no submission and no automation.',
];

/** Text is at most `MAX_TEXT_LENGTH` characters; `truncated` is present only when it was cut. */
type ReportCell<T> = { value: T; source: string; from_formula_cache: boolean; truncated?: true };

export interface ReportDay {
  sheet: string;
  payroll_date: CivilDate;
  index: number;
  /** The slot's date given the payroll date in the sheet name: the date a commit writes. */
  work_date: CivilDate;
  date_cell: ReportCell<CivilDate> | null;
  label: ReportCell<string> | null;
  label_status: 'blank' | 'mapped' | 'unknown' | 'unsupported';
  category: DayCategory | null;
  wfh: boolean;
  holiday_name: string | null;
  floating_holiday: boolean;
  /** Clock cells as minutes since midnight: reported and kept in the source, never imported (O12). */
  start_clock: ReportCell<number> | null;
  end_clock: ReportCell<number> | null;
}

export interface ImportReport {
  mapping_version: number;
  source_sha256: string;
  source_bytes: number;
  sheets: WorkbookPreview['sheets'];
  holidays: WorkbookPreview['holidays'];
  payroll_calendar: WorkbookPreview['payrollCalendar'];
  findings: Finding[];
  summary: WorkbookPreview['summary'];
  clean: boolean;
  /** Only the address of each sheet's employee cell: its text stays in the private source. */
  employee_cells: string[];
  days: ReportDay[];
  rules: readonly string[];
  /** The plan as seen at preview time; a read of a preview batch recomputes it against the current rows. */
  plan: ImportPlan;
}

export interface PlanPeriod {
  sheet: string;
  payroll_date: CivilDate;
  period_start: CivilDate | null;
  period_end: CivilDate | null;
  state: PeriodState;
  existing: { timesheet: boolean; day_entries: number; work_sessions: number; leave_requests: number; ledger_entries: number };
}

export interface PlanDay {
  work_date: CivilDate;
  sheet: string;
  source: string | null;
  category: DayCategory | null;
  wfh: boolean;
  status: 'importable' | 'blank' | 'decision_required';
  reasons: DayReason[];
}

export interface DecisionItem {
  work_date: CivilDate;
  reasons: DayReason[];
  allowed_actions: DecisionAction[];
  sources: string[];
}

export interface ImportPlan {
  periods: PlanPeriod[];
  days: PlanDay[];
  decisions_required: DecisionItem[];
  importable_days: number;
}

export interface Decision {
  work_date: string;
  action: DecisionAction;
}

export interface ImportResult {
  periods: Array<{ payroll_date: CivilDate; timesheet_id: string; day_entries: number }>;
  day_entries: number;
  skipped: CivilDate[];
  imported_on_decision: CivilDate[];
}

export interface ImportContext {
  db: Db;
  clock: Clock;
  files: FileStore;
  /** The owner: always the session user. */
  user: SessionUser;
}

interface ImportRow {
  id: string;
  user_id: string;
  source_sha256: string;
  mapping_version: number;
  state: 'preview' | 'committed';
  storage_key: string;
  size_bytes: number;
  report_json: string;
  decisions_json: string | null;
  result_json: string | null;
  created_at: string;
  committed_at: string | null;
}

const ROW_COLUMNS =
  'id, user_id, source_sha256, mapping_version, state, storage_key, size_bytes, report_json, decisions_json, result_json, created_at, committed_at';

/* ------------------------------------------------------------------ F-2 guard ---- */

export const importedPeriodError = (): ApiError =>
  new ApiError(409, 'imported_period', 'This period was imported from a workbook; it is read-only history and cannot be edited, signed or submitted');

/**
 * True when the owner's timesheet row is imported history (`imported_unverified = 1`). The whole row is read, so a
 * schema older than 0004 (the upgrade tests seed such databases through the current edit services before migrating
 * them) has no flag and reads "not imported"; every migrated database has the column.
 */
export function isImportedTimesheet(db: Db, userId: string, timesheetId: string): boolean {
  const row = db.prepare('SELECT * FROM timesheets WHERE id = ? AND user_id = ?').get(timesheetId, userId) as { imported_unverified?: number } | undefined;
  return row?.imported_unverified === 1;
}

/* ------------------------------------------------------------------ report ---- */

function cell<T>(ref: CellReference<T>): ReportCell<T> {
  const reported: ReportCell<T> = { value: ref.value, source: ref.source, from_formula_cache: ref.fromFormulaCache };
  if (ref.truncated === true) reported.truncated = true;
  return reported;
}

/** Mapping v1 label -> day category. "Off day (overtime used)" has no single category (no OT-funded category). */
function categoryOf(mapping: LabelMapping): DayCategory | null {
  switch (mapping.category) {
    case 'worked':
      return 'Worked';
    case 'holiday':
      return 'Holiday';
    case 'shutdown':
      return 'Shutdown';
    case 'leave':
      if (mapping.leaveKind === 'vacation') return 'Vacation';
      if (mapping.leaveKind === 'sick') return 'Sick';
      return null;
  }
}

function reportDay(sheet: string, payrollDate: CivilDate, day: DayPreview, floating: ReadonlySet<string>): ReportDay {
  const category = day.mapping === null ? null : categoryOf(day.mapping);
  const labelStatus = day.label === null ? 'blank' : day.mapping === null ? 'unknown' : category === null ? 'unsupported' : 'mapped';
  return {
    sheet,
    payroll_date: payrollDate,
    index: day.index,
    work_date: day.expectedDate,
    date_cell: day.date === null ? null : cell(day.date),
    label: day.label === null ? null : cell(day.label),
    label_status: labelStatus,
    category,
    wfh: day.mapping?.workFromHome === true,
    holiday_name: day.holidayName,
    floating_holiday: day.holidayName !== null && floating.has(day.holidayName),
    start_clock: day.startMinutes === null ? null : cell(day.startMinutes),
    end_clock: day.endMinutes === null ? null : cell(day.endMinutes),
  };
}

function buildReport(preview: WorkbookPreview): Omit<ImportReport, 'plan'> {
  const floating = new Set(preview.holidays.filter((holiday) => holiday.floating).map((holiday) => holiday.name));
  return {
    mapping_version: preview.mappingVersion,
    source_sha256: preview.sourceSha256,
    source_bytes: preview.sourceBytes,
    sheets: preview.sheets,
    holidays: preview.holidays,
    payroll_calendar: preview.payrollCalendar,
    findings: preview.findings,
    summary: preview.summary,
    clean: preview.clean,
    employee_cells: preview.periods.flatMap((period) => (period.employee === null ? [] : [period.employee.source])),
    days: preview.periods.flatMap((period) => period.days.map((day) => reportDay(period.sheetName, period.payrollDate, day, floating))),
    rules: IMPORT_RULES,
  };
}

/* ------------------------------------------------------------------ plan ---- */

function countIn(db: Db, sql: string, userId: string, from: CivilDate, to: CivilDate): number {
  return db.prepare(sql).pluck().get(userId, from, to) as number;
}

function planPeriod(db: Db, scope: UserScope, today: CivilDate, nowSeconds: number, sheet: string, payrollDate: CivilDate): PlanPeriod {
  const none = { timesheet: false, day_entries: 0, work_sessions: 0, leave_requests: 0, ledger_entries: 0 };
  let period: PayPeriod;
  try {
    period = payPeriodForPayrollDate(scope.calendar.schedule, payrollDate, scope.exceptions);
  } catch (error) {
    if (!isDomainError(error)) throw error;
    return { sheet, payroll_date: payrollDate, period_start: null, period_end: null, state: 'not_in_calendar', existing: none };
  }
  const base = { sheet, payroll_date: payrollDate, period_start: period.periodStart, period_end: period.periodEnd };
  // The template lays out Monday = payroll - 18 to Sunday = payroll - 5; another calendar shape is never guessed at.
  if (period.periodStart !== addDays(payrollDate, -18) || period.periodEnd !== addDays(payrollDate, -5)) {
    return { ...base, state: 'not_in_calendar', existing: none };
  }
  const timesheet = findTimesheet(db, scope, period);
  const existing = {
    timesheet: timesheet !== undefined,
    day_entries: countIn(db, 'SELECT count(*) FROM day_entries WHERE user_id = ? AND work_date BETWEEN ? AND ?', scope.userId, period.periodStart, period.periodEnd),
    work_sessions: countIn(db, 'SELECT count(*) FROM work_sessions WHERE user_id = ? AND work_date BETWEEN ? AND ?', scope.userId, period.periodStart, period.periodEnd),
    leave_requests: countIn(db, 'SELECT count(*) FROM ot_leave_requests WHERE user_id = ? AND leave_date BETWEEN ? AND ?', scope.userId, period.periodStart, period.periodEnd),
    ledger_entries: countIn(db, 'SELECT count(*) FROM ot_ledger WHERE user_id = ? AND work_date BETWEEN ? AND ?', scope.userId, period.periodStart, period.periodEnd),
  };
  let state: PeriodState;
  if (timesheet?.finalized_revision_no != null) state = 'finalized';
  else if (timesheet !== undefined && isImportedTimesheet(db, scope.userId, timesheet.id)) state = 'imported';
  else if (existing.timesheet || existing.day_entries + existing.work_sessions + existing.leave_requests + existing.ledger_entries > 0) {
    state = 'existing_app_rows';
  } else if (period.periodEnd >= today) state = 'not_ended';
  else if (period.dueAtUtc > nowSeconds) state = 'not_due'; // the due instant itself counts as due (like the deadline scan)
  else state = 'new';
  return { ...base, state, existing };
}

function insideCalendar(scope: UserScope, workDate: CivilDate): boolean {
  try {
    classifyDate(scope.calendarVersions, workDate);
    return true;
  } catch (error) {
    if (!isDomainError(error)) throw error;
    return false;
  }
}

/** The conflict plan of a report against the owner's current rows. Reads only. */
export function buildPlan(db: Db, clock: Clock, scope: UserScope, days: readonly ReportDay[]): ImportPlan {
  const today = todayInReportingZone(clock, scope);
  const nowSeconds = nowEpoch(clock);
  const periods = new Map<string, PlanPeriod>();
  for (const day of days) {
    if (!periods.has(day.sheet)) periods.set(day.sheet, planPeriod(db, scope, today, nowSeconds, day.sheet, day.payroll_date));
  }
  const occurrences = new Map<CivilDate, number>();
  for (const day of days) occurrences.set(day.work_date, (occurrences.get(day.work_date) ?? 0) + 1);

  const planDays: PlanDay[] = days.map((day) => {
    const base = { work_date: day.work_date, sheet: day.sheet, source: day.label?.source ?? null, category: day.category, wfh: day.wfh };
    if (day.label === null) return { ...base, status: 'blank', reasons: [] };
    const reasons: DayReason[] = [];
    const period = periods.get(day.sheet);
    if (period !== undefined && period.state !== 'new') reasons.push(PERIOD_REASON[period.state]);
    if (day.label_status === 'unknown') reasons.push('unknown_label');
    if (day.label_status === 'unsupported') reasons.push('unsupported_label');
    if (day.date_cell === null) reasons.push('date_cell_missing');
    else if (day.date_cell.value !== day.work_date) reasons.push('date_unexpected');
    if ((occurrences.get(day.work_date) ?? 0) > 1) reasons.push('duplicate_date');
    if (!insideCalendar(scope, day.work_date)) reasons.push('outside_calendar');
    if (day.floating_holiday) reasons.push('floating_holiday');
    if (day.label.from_formula_cache) reasons.push('label_from_formula_cache');
    return { ...base, status: reasons.length === 0 ? 'importable' : 'decision_required', reasons };
  });

  const items = new Map<CivilDate, DecisionItem>();
  for (const day of planDays) {
    if (day.status !== 'decision_required') continue;
    const item = items.get(day.work_date) ?? { work_date: day.work_date, reasons: [], allowed_actions: [], sources: [] };
    for (const reason of day.reasons) if (!item.reasons.includes(reason)) item.reasons.push(reason);
    if (day.source !== null) item.sources.push(day.source);
    items.set(day.work_date, item);
  }
  const decisions = [...items.values()]
    .map((item) => ({
      ...item,
      allowed_actions: item.reasons.every((reason) => IMPORTABLE_ON_DECISION.has(reason)) ? (['skip', 'import'] as DecisionAction[]) : (['skip'] as DecisionAction[]),
    }))
    .sort((a, b) => (a.work_date < b.work_date ? -1 : a.work_date > b.work_date ? 1 : 0));

  return {
    periods: [...periods.values()],
    days: planDays,
    decisions_required: decisions,
    importable_days: planDays.filter((day) => day.status === 'importable').length,
  };
}

/* ------------------------------------------------------------------ batches ---- */

function findByKey(db: Db, userId: string, sha256: string, mappingVersion: number): ImportRow | undefined {
  return db
    .prepare(`SELECT ${ROW_COLUMNS} FROM imports WHERE user_id = ? AND source_sha256 = ? AND mapping_version = ?`)
    .get(userId, sha256, mappingVersion) as ImportRow | undefined;
}

/** The owner's batch; another user's id is indistinguishable from a missing one. */
function findOwn(db: Db, userId: string, importId: string): ImportRow | undefined {
  return db.prepare(`SELECT ${ROW_COLUMNS} FROM imports WHERE id = ? AND user_id = ?`).get(importId, userId) as ImportRow | undefined;
}

function requireOwn(db: Db, userId: string, importId: string): ImportRow {
  const row = findOwn(db, userId, importId);
  if (row === undefined) throw notFound('Import');
  return row;
}

function summaryJson(row: ImportRow) {
  return {
    id: row.id,
    state: row.state,
    source_sha256: row.source_sha256,
    mapping_version: row.mapping_version,
    size_bytes: row.size_bytes,
    created_at: row.created_at,
    committed_at: row.committed_at,
  };
}

/** The batch as the owner sees it: the stored report and, for a preview, the plan against the current rows. */
function batchJson(db: Db, clock: Clock, user: SessionUser, row: ImportRow) {
  const report = JSON.parse(row.report_json) as ImportReport;
  const committed = row.state === 'committed';
  return {
    ...summaryJson(row),
    report,
    plan: committed ? null : buildPlan(db, clock, loadScope(db, user), report.days),
    decisions: committed ? (JSON.parse(row.decisions_json ?? '[]') as Decision[]) : null,
    result: committed ? (JSON.parse(row.result_json ?? '{}') as ImportResult) : null,
  };
}

export type ImportBatchJson = ReturnType<typeof batchJson>;

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function workbookRejected(reason: WorkbookRejectionCode): ApiError {
  return new ApiError(422, 'workbook_rejected', 'The workbook cannot be read safely and was not stored', { reason });
}

/** The stored form of a report; 422 `report_too_large` when it is over the cap or cannot be serialized at all. */
function serializeReport(report: Omit<ImportReport, 'plan'> | ImportReport, maxBytes: number): string {
  let json: string;
  try {
    json = JSON.stringify(report);
  } catch (error) {
    throw workbookRejected(error instanceof RangeError ? 'report_too_large' : 'report_failed');
  }
  if (Buffer.byteLength(json, 'utf8') > maxBytes) throw workbookRejected('report_too_large');
  return json;
}

/**
 * Previews an upload of the owner. The same bytes under the same mapping version return the existing batch
 * (`created: false`) and store nothing. A refused package stores nothing and is 422 `workbook_rejected`, and so is a
 * report over `MAX_REPORT_BYTES` or any other failure to read, map or serialize the untrusted package (WP4-FIXB2).
 * `limits` lowers the reader's limits or the report cap, for tests.
 */
export function previewImport(ctx: ImportContext, bytes: Uint8Array, limits: PreviewLimits = {}): { created: boolean; batch: ImportBatchJson } {
  const { db, clock, files, user } = ctx;
  const { maxReportBytes = MAX_REPORT_BYTES, ...readerLimits } = limits;
  if (bytes.length === 0) throw new ApiError(422, 'empty_upload', 'The upload is empty');
  const sha256 = sha256Hex(bytes);
  const known = findByKey(db, user.id, sha256, MAPPING_VERSION);
  if (known !== undefined) return { created: false, batch: batchJson(db, clock, user, known) };

  let preview: WorkbookPreview;
  let report: Omit<ImportReport, 'plan'>;
  try {
    preview = previewWorkbook(bytes, readerLimits);
    report = buildReport(preview);
  } catch (error) {
    // Reading, mapping and building the report are pure functions of the untrusted bytes: whatever they throw is a
    // refusal of the package, never a 500 (the recheck's 4 MiB string x 2 000 holiday names gave one).
    throw workbookRejected(error instanceof WorkbookRejectedError ? error.code : 'report_failed');
  }
  // Checked before the source is stored, so an oversized report writes nothing; checked again below with the plan.
  serializeReport(report, maxReportBytes);
  // The file is complete on disk before any row refers to it; a row that cannot be saved removes it again.
  const stored = files.put(bytes);
  let outcome: { created: boolean; row: ImportRow };
  try {
    outcome = writeTransaction(db, () => {
      const raced = findByKey(db, user.id, sha256, MAPPING_VERSION);
      if (raced !== undefined) return { created: false, row: raced };
      const scope = loadScope(db, user);
      const plan = buildPlan(db, clock, scope, report.days);
      const reportJson = serializeReport({ ...report, plan }, maxReportBytes);
      const id = randomUUID();
      const now = nowUtc(clock);
      db.prepare(
        `INSERT INTO imports (id, user_id, source_sha256, mapping_version, state, storage_key, size_bytes, report_json, created_at)
         VALUES (?, ?, ?, ?, 'preview', ?, ?, ?, ?)`,
      ).run(id, user.id, sha256, MAPPING_VERSION, stored.storageKey, stored.sizeBytes, reportJson, now);
      recordAudit(db, clock, {
        actorUserId: user.id,
        ownerUserId: user.id,
        operation: 'import.preview',
        entityType: 'import',
        entityId: id,
        after: {
          source_sha256: sha256,
          mapping_version: MAPPING_VERSION,
          size_bytes: stored.sizeBytes,
          periods: plan.periods.length,
          importable_days: plan.importable_days,
          decisions_required: plan.decisions_required.length,
          findings: preview.summary,
        },
      });
      return { created: true, row: requireOwn(db, user.id, id) };
    });
  } catch (error) {
    files.discard(stored.storageKey);
    throw error;
  }
  if (!outcome.created) files.discard(stored.storageKey);
  return { created: outcome.created, batch: batchJson(db, clock, user, outcome.row) };
}

export function listImports(db: Db, user: SessionUser) {
  const rows = db.prepare(`SELECT ${ROW_COLUMNS} FROM imports WHERE user_id = ? ORDER BY created_at DESC, rowid DESC`).all(user.id) as ImportRow[];
  return rows.map(summaryJson);
}

export function getImport(db: Db, clock: Clock, user: SessionUser, importId: string): ImportBatchJson {
  return batchJson(db, clock, user, requireOwn(db, user.id, importId));
}

/** Decisions in a stable order (by date), so an identical retry compares equal whatever order it was sent in. */
function canonicalDecisions(decisions: readonly Decision[]): Decision[] {
  const seen = new Set<string>();
  for (const decision of decisions) {
    if (seen.has(decision.work_date)) {
      throw new ApiError(422, 'duplicate_decision', `The decisions list ${decision.work_date} more than once`, { work_date: decision.work_date });
    }
    seen.add(decision.work_date);
  }
  return [...decisions]
    .map((decision) => ({ work_date: decision.work_date, action: decision.action }))
    .sort((a, b) => (a.work_date < b.work_date ? -1 : a.work_date > b.work_date ? 1 : 0));
}

function checkDecisions(plan: ImportPlan, decisions: readonly Decision[]): Map<string, DecisionAction> {
  const required = new Map(plan.decisions_required.map((item) => [item.work_date as string, item]));
  const byDate = new Map<string, DecisionAction>();
  for (const decision of decisions) {
    const item = required.get(decision.work_date);
    if (item === undefined) {
      throw new ApiError(422, 'unknown_decision', `${decision.work_date} needs no decision in this batch`, { work_date: decision.work_date });
    }
    if (!item.allowed_actions.includes(decision.action)) {
      throw new ApiError(422, 'decision_not_allowed', `${decision.work_date} allows only: ${item.allowed_actions.join(', ')}`, {
        work_date: decision.work_date,
        allowed_actions: item.allowed_actions,
        reasons: item.reasons,
      });
    }
    byDate.set(decision.work_date, decision.action);
  }
  const missing = plan.decisions_required.filter((item) => !byDate.has(item.work_date));
  if (missing.length > 0) {
    throw new ApiError(409, 'decisions_required', 'Every listed day needs an explicit decision; nothing was imported', {
      decisions_required: missing,
    });
  }
  return byDate;
}

/**
 * Commits the owner's preview batch with the owner's explicit decisions, in one transaction. An identical retry of
 * a committed batch returns the first result (`replayed`) and writes nothing.
 */
export function commitImport(
  ctx: Omit<ImportContext, 'files'>,
  importId: string,
  input: readonly Decision[],
): { status: 'committed' | 'replayed'; batch: ImportBatchJson } {
  const { db, clock, user } = ctx;
  const decisions = canonicalDecisions(input);
  const decisionsJson = JSON.stringify(decisions);
  const outcome = writeTransaction(db, () => {
    const row = requireOwn(db, user.id, importId);
    if (row.state === 'committed') {
      if (row.decisions_json === decisionsJson) return { status: 'replayed' as const, row };
      throw new ApiError(409, 'import_already_committed', 'This import was already committed with other decisions');
    }
    const report = JSON.parse(row.report_json) as ImportReport;
    const scope = loadScope(db, user);
    const plan = buildPlan(db, clock, scope, report.days);
    const byDate = checkDecisions(plan, decisions);

    const selected = plan.days.filter(
      (day) => day.status === 'importable' || (day.status === 'decision_required' && byDate.get(day.work_date) === 'import'),
    );
    const now = nowUtc(clock);
    const result: ImportResult = {
      periods: [],
      day_entries: 0,
      skipped: decisions.filter((decision) => decision.action === 'skip').map((decision) => decision.work_date),
      imported_on_decision: decisions.filter((decision) => decision.action === 'import').map((decision) => decision.work_date),
    };
    for (const period of plan.periods) {
      const days = selected.filter((day) => day.sheet === period.sheet);
      if (days.length === 0) continue;
      // Only a new period ever has a selected day (every other state allows skip only); checked again here.
      if (period.state !== 'new') throw new Error('An imported day targets a period that is not new');
      const payPeriod = payPeriodForPayrollDate(scope.calendar.schedule, period.payroll_date, scope.exceptions);
      const payPeriodId = ensurePayPeriodRow(db, clock, scope.calendar.id, payPeriod);
      const timesheetId = randomUUID();
      db.prepare(
        `INSERT INTO timesheets (id, user_id, pay_period_id, version, imported_unverified, created_at, updated_at)
         VALUES (?, ?, ?, 1, 1, ?, ?)`,
      ).run(timesheetId, user.id, payPeriodId, now, now);
      recordAudit(db, clock, {
        actorUserId: user.id,
        ownerUserId: user.id,
        operation: 'timesheet.import',
        entityType: 'timesheet',
        entityId: timesheetId,
        after: { import_id: row.id, payroll_date: period.payroll_date, imported_unverified: true, day_entries: days.length },
      });
      const insert = db.prepare(
        `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, category_source, leave_minutes, leave_kind,
           wfh, notes, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'explicit', 0, NULL, ?, '', 1, ?, ?)`,
      );
      for (const day of days) {
        if (day.category === null) throw new Error('An imported day has no category');
        const entryId = randomUUID();
        insert.run(entryId, user.id, timesheetId, day.work_date, day.category, day.wfh ? 1 : 0, now, now);
        recordAudit(db, clock, {
          actorUserId: user.id,
          ownerUserId: user.id,
          operation: 'day_entry.import',
          entityType: 'day_entry',
          entityId: entryId,
          after: {
            import_id: row.id,
            work_date: day.work_date,
            category: day.category,
            category_source: 'explicit',
            leave_minutes: 0,
            leave_kind: null,
            wfh: day.wfh,
            notes: '',
            source: day.source,
          },
        });
      }
      result.periods.push({ payroll_date: period.payroll_date, timesheet_id: timesheetId, day_entries: days.length });
      result.day_entries += days.length;
    }
    const updated = db
      .prepare(
        `UPDATE imports SET state = 'committed', decisions_json = ?, result_json = ?, committed_at = ?
          WHERE id = ? AND user_id = ? AND state = 'preview'`,
      )
      .run(decisionsJson, JSON.stringify(result), now, row.id, user.id);
    if (updated.changes !== 1) throw new Error('The import batch changed during its commit');
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: 'import.commit',
      entityType: 'import',
      entityId: row.id,
      after: {
        source_sha256: row.source_sha256,
        mapping_version: row.mapping_version,
        periods: result.periods.length,
        day_entries: result.day_entries,
        skipped: result.skipped.length,
        imported_on_decision: result.imported_on_decision.length,
      },
    });
    return { status: 'committed' as const, row: requireOwn(db, user.id, row.id) };
  });
  return { status: outcome.status, batch: batchJson(db, clock, user, outcome.row) };
}
