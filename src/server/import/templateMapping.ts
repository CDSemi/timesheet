import { createHash } from 'node:crypto';
import { addDays, fromDayNumber, isCivilDate, type CivilDate } from '../../domain/dates.ts';
import { readWorkbook, type ReadCell, type ReaderLimits, type ReadSheet, type ReadWorkbook, WorkbookRejectedError } from './xlsxReader.ts';

/*
 * Template mapping, version 1 (WP4-T08). Turns a read workbook into a structured preview model: the dated payroll
 * sheets, their day labels and clock cells, the holiday table and a list of findings with `sheet!A1` provenance.
 * It writes nothing (the import commit is WP4-T09) and decides nothing: unknown labels, duplicate dates and the
 * known template defects are reported for an explicit owner decision.
 *
 * Layout of a dated payroll sheet, copied from the tracked template's `Timesheet` sheet:
 *  - payroll date in I10 (the sheet name is the authoritative payroll date; I10 is only cross-checked);
 *  - two weeks of seven days, Monday to Sunday, in columns B, F, J, N, R, V, Z (four columns per day);
 *  - week 1: date row 13, label row 14, clock row 15; week 2: date row 20, label row 21, clock row 22; the start
 *    cell is the first column of the day and the end cell the third (B/D, F/H, ...);
 *  - the period is Monday = payroll date - 18 through Sunday = payroll date - 5.
 * Values read from a formula cell are cached results: they are used only when nothing else is available and are
 * always reported as "formula cache, not authoritative".
 */

export const MAPPING_VERSION = 1;

export type FindingSeverity = 'error' | 'warning' | 'info';

/** At most this many sources are kept per finding; the rest are only counted. */
export const MAX_FINDING_SOURCES = 20;
/** At most this many findings of one code are listed; further ones are folded into one summary finding. */
export const MAX_FINDINGS_PER_CODE = 25;
/** A holiday table has about ten rows a year; more than this is not a holiday table and is refused. */
export const MAX_HOLIDAY_ROWS = 2000;

export type FindingCode =
  | 'formula_hours_8_5'
  | 'weekly_total_omits_sunday'
  | 'today_signature_date'
  | 'volatile_today_formula'
  | 'floating_holiday'
  | 'unknown_label'
  | 'duplicate_date'
  | 'sheet_name_not_payroll_date'
  | 'payroll_date_not_in_calendar'
  | 'payroll_cell_mismatch'
  | 'day_date_unexpected'
  | 'invalid_date_cell'
  | 'time_cell_unparsed'
  | 'time_pair_incomplete'
  | 'formula_cache_not_authoritative'
  | 'hidden_sheet'
  | 'external_link_ignored'
  | 'date_system_1904';

export type Finding = {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  /**
   * Cell-level provenance, `sheet!A1`; sheet-level findings name the sheet only. At most `MAX_FINDING_SOURCES` are
   * listed (the first ones in document order); `sourceCount` is the true number, so the report stays small whatever
   * the cell count (WP4-B-01).
   */
  sources: string[];
  /** How many sources the finding has in all (>= `sources.length`). */
  sourceCount: number;
  /** Small structured facts for the preview; never free-form workbook content beyond the cell text itself. */
  details?: Record<string, string | number | boolean>;
};

/** A finding as the mapping produces it; `finalizeFindings` caps it and adds `sourceCount`. */
type RawFinding = Omit<Finding, 'sourceCount'>;

/**
 * Bounds the report (WP4-B-01): every finding lists at most `MAX_FINDING_SOURCES` sources plus the true count, and
 * more than `MAX_FINDINGS_PER_CODE` findings of one code (one per holiday row, for instance) are folded into one
 * summary finding of that code, whose count is the sum. Counting (`summary`) is done by the caller on the
 * uncapped list, so the totals stay true. Order and severity are kept.
 */
function finalizeFindings(raw: readonly RawFinding[]): Finding[] {
  const kept = new Map<FindingCode, number>();
  const folded = new Map<FindingCode, { first: RawFinding; findings: number; sources: string[]; sourceCount: number }>();
  const result: Finding[] = [];
  for (const finding of raw) {
    const listed = kept.get(finding.code) ?? 0;
    if (listed < MAX_FINDINGS_PER_CODE) {
      kept.set(finding.code, listed + 1);
      result.push({ ...finding, sources: finding.sources.slice(0, MAX_FINDING_SOURCES), sourceCount: finding.sources.length });
      continue;
    }
    const summary = folded.get(finding.code) ?? { first: finding, findings: 0, sources: [], sourceCount: 0 };
    summary.findings += 1;
    summary.sourceCount += finding.sources.length;
    for (const source of finding.sources) if (summary.sources.length < MAX_FINDING_SOURCES) summary.sources.push(source);
    folded.set(finding.code, summary);
  }
  for (const [code, summary] of folded) {
    result.push({
      code,
      severity: summary.first.severity,
      message: `${summary.findings} more findings of this kind are not listed one by one. ${summary.first.message}`,
      sources: summary.sources,
      sourceCount: summary.sourceCount,
      details: { omitted_findings: summary.findings },
    });
  }
  return result;
}

export type DayCategory = 'worked' | 'holiday' | 'shutdown' | 'leave';
export type LeaveKind = 'vacation' | 'sick' | 'ot';

export type LabelMapping = { category: DayCategory; leaveKind?: LeaveKind; workFromHome?: boolean };

/** Day labels of the template's "Working Info" list (Working Infos!A3:A9), compared case-insensitively. */
export const KNOWN_DAY_LABELS: ReadonlyMap<string, LabelMapping> = new Map<string, LabelMapping>([
  ['worked', { category: 'worked' }],
  ['work from home', { category: 'worked', workFromHome: true }],
  ['holiday', { category: 'holiday' }],
  ['shutdown', { category: 'shutdown' }],
  ['vacation', { category: 'leave', leaveKind: 'vacation' }],
  ['sick day', { category: 'leave', leaveKind: 'sick' }],
  ['off day (overtime used)', { category: 'leave', leaveKind: 'ot' }],
]);

export type SheetRole = 'support_working_infos' | 'support_holidays' | 'form_template' | 'payroll_period' | 'unmapped';

export type SheetSummary = {
  name: string;
  role: SheetRole;
  /** Present for `payroll_period` sheets: the date in the sheet name. */
  payrollDate?: CivilDate;
  hidden: boolean;
};

export type CellReference<T> = { value: T; source: string; fromFormulaCache: boolean };

export type DayPreview = {
  /** 0..13: Monday of week 1 to Sunday of week 2. */
  index: number;
  /** Date from the sheet's date cell, or `null` when that cell is blank or invalid. */
  date: CellReference<CivilDate> | null;
  /** The date this slot should have given the payroll date in the sheet name. */
  expectedDate: CivilDate;
  /** Raw label text as written. */
  label: CellReference<string> | null;
  /** Mapped label, or `null` for a blank or unknown label. */
  mapping: LabelMapping | null;
  holidayName: string | null;
  /** Minutes since midnight; `null` when blank. */
  startMinutes: CellReference<number> | null;
  endMinutes: CellReference<number> | null;
};

export type PeriodPreview = {
  sheetName: string;
  payrollDate: CivilDate;
  employee: CellReference<string> | null;
  days: DayPreview[];
};

export type HolidayPreview = { date: CivilDate; name: string; floating: boolean; source: string };

export type WorkbookPreview = {
  mappingVersion: typeof MAPPING_VERSION;
  sourceSha256: string;
  sourceBytes: number;
  sheets: SheetSummary[];
  periods: PeriodPreview[];
  holidays: HolidayPreview[];
  payrollCalendar: { count: number; first: CivilDate | null; last: CivilDate | null };
  findings: Finding[];
  summary: { errors: number; warnings: number; infos: number };
  /** False when any finding has severity `error`; the owner must decide before an import can commit. */
  clean: boolean;
};

const WORKING_INFOS = 'Working Infos';
const HOLIDAY_DATES = 'Holiday Dates';
const FORM_TEMPLATE = 'Timesheet';
const SHEET_NAME_DATE = /^(\d{4})[.-](\d{2})[.-](\d{2})$/;
const DAY_COLUMNS = [2, 6, 10, 14, 18, 22, 26]; // B F J N R V Z
const WEEKS = [
  { dateRow: 13, labelRow: 14, clockRow: 15 },
  { dateRow: 20, labelRow: 21, clockRow: 22 },
] as const;
const MAX_CLOCK_MINUTES = 48 * 60;
/** A date (column A) or name (column B) cell of the holiday table. */
const HOLIDAY_TABLE_CELL = /^[AB]([1-9]\d*)$/;

// ---------------------------------------------------------------------------------------------------------------------
// Cell helpers

function columnLetters(number: number): string {
  let value = number;
  let letters = '';
  while (value > 0) {
    letters = String.fromCharCode(65 + ((value - 1) % 26)) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
}

function columnNumber(letters: string): number {
  let value = 0;
  for (const letter of letters) value = value * 26 + (letter.charCodeAt(0) - 64);
  return value;
}

type Picked = { cell: ReadCell; fromFormulaCache: boolean };

/** The stored value of a cell, or its cache when it is a formula; blank cells and empty caches give `null`. */
function pick(sheet: ReadSheet, address: string): Picked | null {
  const cell = sheet.cells.get(address);
  if (cell === undefined) return null;
  if (cell.formula !== null) {
    if (cell.cachedValue === null || cell.cachedValue === '') return null;
    return { cell, fromFormulaCache: true };
  }
  if (cell.value === null || cell.value === '') return null;
  return { cell, fromFormulaCache: false };
}

function pickedValue(picked: Picked): string | number | boolean | null {
  return picked.fromFormulaCache ? picked.cell.cachedValue : picked.cell.value;
}

function serialToDate(serial: number, date1904: boolean): CivilDate | null {
  if (!Number.isInteger(serial)) return null;
  const adjusted = date1904 ? serial + 1462 : serial;
  if (adjusted < 61 || adjusted > 2_958_465) return null;
  const date = fromDayNumber(adjusted - 25_569);
  return isCivilDate(date) ? date : null;
}

function readDate(picked: Picked, date1904: boolean): CivilDate | null {
  const value = pickedValue(picked);
  if (typeof value === 'number') return serialToDate(value, date1904);
  if (typeof value === 'string') {
    const text = value.trim().replace(/^(\d{4})[./](\d{2})[./](\d{2})$/, '$1-$2-$3');
    return isCivilDate(text) ? text : null;
  }
  return null;
}

function readMinutes(picked: Picked): number | null {
  const value = pickedValue(picked);
  if (typeof value === 'number') {
    const minutes = Math.round(value * 1440);
    return value >= 0 && minutes <= MAX_CLOCK_MINUTES ? minutes : null;
  }
  if (typeof value === 'string') {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (match) {
      const minutes = Number(match[1]) * 60 + Number(match[2]);
      return Number(match[2]) < 60 ? minutes : null;
    }
  }
  return null;
}

function reference<T>(picked: Picked, value: T): CellReference<T> {
  return { value, source: picked.cell.provenance, fromFormulaCache: picked.fromFormulaCache };
}

function dateFromSheetName(name: string): CivilDate | null {
  const match = SHEET_NAME_DATE.exec(name.trim());
  if (!match) return null;
  const date = `${match[1]}-${match[2]}-${match[3]}`;
  return isCivilDate(date) ? date : null;
}

// ---------------------------------------------------------------------------------------------------------------------
// Formula defect detection (README of reference/inputs)

const HOURS_8_5 = /(?:^|[^\d.])8\.5(?![\d.])/;
const VOLATILE_NOW = /\b(?:TODAY|NOW)\s*\(/i;
const RANGE = /\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)/g;

function stripStrings(formula: string): string {
  return formula.replace(/"(?:[^"]|"")*"/g, '""');
}

function sundayCoverage(formula: string, row: number): boolean {
  const sunday = columnNumber('Z');
  for (const match of stripStrings(formula).matchAll(RANGE)) {
    const first = columnNumber(match[1] ?? '');
    const last = columnNumber(match[3] ?? '');
    const topRow = Number(match[2]);
    const bottomRow = Number(match[4]);
    if (topRow <= row && row <= bottomRow && Math.min(first, last) <= sunday && sunday <= Math.max(first, last)) return true;
  }
  return false;
}

function detectFormulaDefects(sheet: ReadSheet): RawFinding[] {
  const findings: RawFinding[] = [];
  const hours: string[] = [];
  const volatile: string[] = [];
  for (const cell of sheet.cells.values()) {
    if (cell.formula === null || cell.formula === '') continue;
    const body = stripStrings(cell.formula);
    if (HOURS_8_5.test(body)) hours.push(cell.provenance);
    if (VOLATILE_NOW.test(body) && cell.address !== 'W26') volatile.push(cell.provenance);
  }
  if (hours.length > 0) {
    findings.push({
      code: 'formula_hours_8_5',
      severity: 'warning',
      message: 'Daily formulas subtract a fixed 8.5 hours; the inherited formula is not a business rule and is not imported as one.',
      sources: hours,
    });
  }

  const total = sheet.cells.get('X24');
  if (total?.formula) {
    const missing = [16, 23].filter((row) => !sundayCoverage(total.formula ?? '', row));
    if (missing.length > 0) {
      findings.push({
        code: 'weekly_total_omits_sunday',
        severity: 'warning',
        message: 'The overtime total in X24 leaves out the Sunday cells; daily hours for Sunday are not part of the cached total.',
        sources: [total.provenance, ...missing.map((row) => `${sheet.name}!Z${row}`)],
      });
    }
  }

  const signature = sheet.cells.get('W26');
  if (signature?.formula && VOLATILE_NOW.test(stripStrings(signature.formula))) {
    findings.push({
      code: 'today_signature_date',
      severity: 'warning',
      message: 'The signature date W26 is TODAY(): it changes every time the file is opened and is not a true signature date.',
      sources: [signature.provenance],
    });
  }
  if (volatile.length > 0) {
    findings.push({
      code: 'volatile_today_formula',
      severity: 'info',
      message: 'These cells depend on TODAY() or NOW(); their cached values depend on the day the file was last calculated.',
      sources: volatile,
    });
  }
  return findings;
}

// ---------------------------------------------------------------------------------------------------------------------
// Support sheets

function readHolidays(sheet: ReadSheet, date1904: boolean, findings: RawFinding[]): HolidayPreview[] {
  const holidays: HolidayPreview[] = [];
  const seen = new Map<CivilDate, string>();
  // Visit only the rows that have a date or name cell, in row order. The row numbers come from the cells that exist,
  // never from a spread over the cell list (a stack overflow at about 100 000 cells) and never from a loop up to
  // the largest row number (one cell at A9999999 made it run ten million times); WP4-B-02.
  const rowSet = new Set<number>();
  for (const address of sheet.cells.keys()) {
    const match = HOLIDAY_TABLE_CELL.exec(address);
    const row = match === null ? 0 : Number(match[1]);
    if (row >= 2) rowSet.add(row);
  }
  if (rowSet.size > MAX_HOLIDAY_ROWS) {
    throw new WorkbookRejectedError('too_many_holidays', `The holiday table has more than ${MAX_HOLIDAY_ROWS} rows`);
  }
  const rows = [...rowSet].sort((a, b) => a - b);
  for (const row of rows) {
    const dateCell = pick(sheet, `A${row}`);
    const nameCell = pick(sheet, `B${row}`);
    if (dateCell === null && nameCell === null) continue;
    const date = dateCell === null ? null : readDate(dateCell, date1904);
    const name = nameCell === null ? '' : String(pickedValue(nameCell)).trim();
    if (dateCell === null || date === null) {
      findings.push({
        code: 'invalid_date_cell',
        severity: 'error',
        message: 'A holiday row has no valid date.',
        sources: [dateCell?.cell.provenance ?? `${sheet.name}!A${row}`],
      });
      continue;
    }
    const floating = /floating/i.test(name);
    const source = dateCell.cell.provenance;
    const earlier = seen.get(date);
    if (earlier !== undefined) {
      findings.push({
        code: 'duplicate_date',
        severity: 'error',
        message: 'The same holiday date is listed more than once.',
        sources: [earlier, source],
        details: { scope: 'holiday', date },
      });
    } else {
      seen.set(date, source);
    }
    if (floating) {
      findings.push({
        code: 'floating_holiday',
        severity: 'warning',
        message: 'A floating holiday is not a fixed company holiday; the owner decides whether it counts as one.',
        sources: [source, nameCell?.cell.provenance ?? `${sheet.name}!B${row}`],
        details: { date, label: name },
      });
    }
    holidays.push({ date, name, floating, source });
  }
  return holidays;
}

function readPayrollCalendar(sheet: ReadSheet, date1904: boolean): CivilDate[] {
  const dates: CivilDate[] = [];
  for (let row = 13; ; row += 1) {
    const cell = sheet.cells.get(`A${row}`);
    if (cell === undefined) break;
    const picked = pick(sheet, `A${row}`);
    if (picked === null) continue;
    const date = readDate(picked, date1904);
    if (date !== null) dates.push(date);
  }
  return dates;
}

// ---------------------------------------------------------------------------------------------------------------------
// Payroll period sheets

type PeriodContext = {
  date1904: boolean;
  holidayNames: ReadonlyMap<string, HolidayPreview>;
  payrollCalendar: ReadonlySet<CivilDate>;
  findings: RawFinding[];
};

function readPeriod(sheet: ReadSheet, payrollDate: CivilDate, context: PeriodContext): PeriodPreview {
  const { findings } = context;
  const cacheSources: string[] = [];
  const track = <T>(ref: CellReference<T>): CellReference<T> => {
    if (ref.fromFormulaCache) cacheSources.push(ref.source);
    return ref;
  };

  const payrollCell = pick(sheet, 'I10');
  if (payrollCell !== null) {
    const cellDate = readDate(payrollCell, context.date1904);
    if (payrollCell.fromFormulaCache) cacheSources.push(payrollCell.cell.provenance);
    if (cellDate === null || cellDate !== payrollDate) {
      findings.push({
        code: 'payroll_cell_mismatch',
        severity: 'error',
        message: 'The payroll date cell does not match the payroll date in the sheet name; the sheet name is used.',
        sources: [payrollCell.cell.provenance],
        details: { sheetName: sheet.name, payrollDate },
      });
    }
  }
  const employeePick = pick(sheet, 'I8');
  const employee = employeePick === null ? null : track(reference(employeePick, String(pickedValue(employeePick)).trim()));

  const periodStart = addDays(payrollDate, -18);
  const days: DayPreview[] = [];
  const seenDates = new Map<CivilDate, string>();
  for (let index = 0; index < 14; index += 1) {
    const week = WEEKS[Math.floor(index / 7)];
    const column = DAY_COLUMNS[index % 7];
    if (week === undefined || column === undefined) continue;
    const expectedDate = addDays(periodStart, index);
    const dateAddress = `${columnLetters(column)}${week.dateRow}`;

    const datePick = pick(sheet, dateAddress);
    let date: CellReference<CivilDate> | null = null;
    if (datePick !== null) {
      const parsed = readDate(datePick, context.date1904);
      if (parsed === null) {
        findings.push({
          code: 'invalid_date_cell',
          severity: 'error',
          message: 'A day date cell is not a valid date.',
          sources: [datePick.cell.provenance],
        });
      } else {
        date = track(reference(datePick, parsed));
        if (parsed !== expectedDate) {
          findings.push({
            code: 'day_date_unexpected',
            severity: 'error',
            message: 'The day date does not fall where the payroll date places it (Monday = payroll date - 18).',
            sources: [datePick.cell.provenance],
            details: { found: parsed, expected: expectedDate },
          });
        }
        const earlier = seenDates.get(parsed);
        if (earlier !== undefined) {
          findings.push({
            code: 'duplicate_date',
            severity: 'error',
            message: 'The same date appears twice in one payroll sheet.',
            sources: [earlier, datePick.cell.provenance],
            details: { scope: 'day', date: parsed },
          });
        } else {
          seenDates.set(parsed, datePick.cell.provenance);
        }
      }
    }

    const labelPick = pick(sheet, `${columnLetters(column)}${week.labelRow}`);
    let label: CellReference<string> | null = null;
    let mapping: LabelMapping | null = null;
    let holidayName: string | null = null;
    if (labelPick !== null) {
      const text = String(pickedValue(labelPick)).trim();
      label = track(reference(labelPick, text));
      const known = KNOWN_DAY_LABELS.get(text.toLowerCase());
      const holiday = context.holidayNames.get(text.toLowerCase());
      if (known !== undefined) {
        mapping = known;
      } else if (holiday !== undefined) {
        mapping = { category: 'holiday' };
        holidayName = holiday.name;
      } else {
        findings.push({
          code: 'unknown_label',
          severity: 'error',
          message: 'The day label is not in the template label list or the holiday table.',
          sources: [labelPick.cell.provenance],
          details: { label: text },
        });
      }
    }

    const startAddress = `${columnLetters(column)}${week.clockRow}`;
    const endAddress = `${columnLetters(column + 2)}${week.clockRow}`;
    const clocks = [startAddress, endAddress].map((address) => {
      const picked = pick(sheet, address);
      if (picked === null) return null;
      const minutes = readMinutes(picked);
      if (minutes === null) {
        findings.push({
          code: 'time_cell_unparsed',
          severity: 'error',
          message: 'A clock cell is not a time of day.',
          sources: [picked.cell.provenance],
        });
        return null;
      }
      return track(reference(picked, minutes));
    });
    const [startMinutes = null, endMinutes = null] = clocks;
    const startBlank = pick(sheet, startAddress) === null;
    const endBlank = pick(sheet, endAddress) === null;
    if (startBlank !== endBlank) {
      findings.push({
        code: 'time_pair_incomplete',
        severity: 'warning',
        message: 'Only one of the start and end clock cells is filled.',
        sources: [`${sheet.name}!${startAddress}`, `${sheet.name}!${endAddress}`],
      });
    }

    days.push({ index, date, expectedDate, label, mapping, holidayName, startMinutes, endMinutes });
  }

  if (!context.payrollCalendar.has(payrollDate) && context.payrollCalendar.size > 0) {
    findings.push({
      code: 'payroll_date_not_in_calendar',
      severity: 'warning',
      message: 'The payroll date in the sheet name is not in the Working Infos payroll calendar.',
      sources: [sheet.name],
      details: { payrollDate },
    });
  }
  if (cacheSources.length > 0) {
    findings.push({
      code: 'formula_cache_not_authoritative',
      severity: 'info',
      message: 'Some mapped values are formula cache, not authoritative; they are shown as read and never recalculated.',
      sources: cacheSources,
    });
  }
  return { sheetName: sheet.name, payrollDate, employee, days };
}

// ---------------------------------------------------------------------------------------------------------------------

/** Build the preview model from an already read workbook. Pure: no I/O, no clock, no database. */
export function mapWorkbook(workbook: ReadWorkbook, source: { sha256: string; bytes: number }): WorkbookPreview {
  const findings: RawFinding[] = [];
  const sheets: SheetSummary[] = [];
  const periods: PeriodPreview[] = [];

  if (workbook.date1904) {
    findings.push({
      code: 'date_system_1904',
      severity: 'warning',
      message: 'The workbook uses the 1904 date system; serial dates were shifted accordingly.',
      sources: ['xl/workbook.xml'],
    });
  }
  for (const note of workbook.notes) {
    if (note.code === 'external_link_ignored') {
      findings.push({ code: 'external_link_ignored', severity: 'info', message: 'An external link was ignored and not followed.', sources: [note.part] });
    }
  }

  const working = workbook.sheets.find((sheet) => sheet.name === WORKING_INFOS && sheet.kind === 'worksheet');
  const holidaySheet = workbook.sheets.find((sheet) => sheet.name === HOLIDAY_DATES && sheet.kind === 'worksheet');
  const calendarDates = working === undefined ? [] : readPayrollCalendar(working, workbook.date1904);
  const holidays = holidaySheet === undefined ? [] : readHolidays(holidaySheet, workbook.date1904, findings);
  const holidayNames = new Map<string, HolidayPreview>();
  for (const holiday of holidays) if (!holidayNames.has(holiday.name.toLowerCase())) holidayNames.set(holiday.name.toLowerCase(), holiday);
  const context: PeriodContext = { date1904: workbook.date1904, holidayNames, payrollCalendar: new Set(calendarDates), findings };

  const payrollSheets = new Map<CivilDate, string[]>();
  for (const sheet of workbook.sheets) {
    const base = { name: sheet.name, hidden: sheet.hidden };
    if (sheet.hidden) {
      findings.push({ code: 'hidden_sheet', severity: 'info', message: 'The sheet is hidden.', sources: [sheet.name] });
    }
    if (sheet.kind !== 'worksheet') {
      sheets.push({ ...base, role: 'unmapped' });
      continue;
    }
    if (sheet.name === WORKING_INFOS) {
      sheets.push({ ...base, role: 'support_working_infos' });
    } else if (sheet.name === HOLIDAY_DATES) {
      sheets.push({ ...base, role: 'support_holidays' });
    } else if (sheet.name === FORM_TEMPLATE) {
      sheets.push({ ...base, role: 'form_template' });
      findings.push(...detectFormulaDefects(sheet));
    } else {
      const payrollDate = dateFromSheetName(sheet.name);
      if (payrollDate === null) {
        sheets.push({ ...base, role: 'unmapped' });
        findings.push({
          code: 'sheet_name_not_payroll_date',
          severity: 'warning',
          message: 'The sheet name is not a payroll date (YYYY.MM.DD); the sheet is not mapped and stays in the source.',
          sources: [sheet.name],
        });
        continue;
      }
      sheets.push({ ...base, role: 'payroll_period', payrollDate });
      payrollSheets.set(payrollDate, [...(payrollSheets.get(payrollDate) ?? []), sheet.name]);
      findings.push(...detectFormulaDefects(sheet));
      periods.push(readPeriod(sheet, payrollDate, context));
    }
  }

  for (const [payrollDate, names] of payrollSheets) {
    if (names.length > 1) {
      findings.push({
        code: 'duplicate_date',
        severity: 'error',
        message: 'More than one sheet carries the same payroll date.',
        sources: names,
        details: { scope: 'payroll_date', date: payrollDate },
      });
    }
  }
  // The same day on two different payroll sheets (overlapping periods).
  const dayOwners = new Map<CivilDate, { sheetName: string; source: string }>();
  for (const period of periods) {
    for (const day of period.days) {
      if (day.date === null) continue;
      const owner = dayOwners.get(day.date.value);
      if (owner === undefined) {
        dayOwners.set(day.date.value, { sheetName: period.sheetName, source: day.date.source });
      } else if (owner.sheetName !== period.sheetName) {
        findings.push({
          code: 'duplicate_date',
          severity: 'error',
          message: 'The same date appears on two payroll sheets.',
          sources: [owner.source, day.date.source],
          details: { scope: 'day', date: day.date.value },
        });
      }
    }
  }

  // The totals are counted before the report is capped, so they stay true however many findings are folded.
  const summary = {
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    infos: findings.filter((finding) => finding.severity === 'info').length,
  };
  const sortedCalendar = [...calendarDates].sort();
  return {
    mappingVersion: MAPPING_VERSION,
    sourceSha256: source.sha256,
    sourceBytes: source.bytes,
    sheets,
    periods,
    holidays,
    payrollCalendar: { count: calendarDates.length, first: sortedCalendar[0] ?? null, last: sortedCalendar.at(-1) ?? null },
    findings: finalizeFindings(findings),
    summary,
    clean: summary.errors === 0,
  };
}

/** Read an untrusted workbook and produce the preview model. Rejected packages throw `WorkbookRejectedError`. */
export function previewWorkbook(bytes: Uint8Array, limits: Partial<ReaderLimits> = {}): WorkbookPreview {
  const workbook = readWorkbook(bytes, limits);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return mapWorkbook(workbook, { sha256, bytes: bytes.length });
}
