import type { CalendarDateKind, CalendarDateRule } from './calendar.ts';
import { type CivilDate, isCivilDate } from './dates.ts';

/*
 * Holiday CSV (FR-13, AC-05, E-4). The format is `date,name[,kind]` with an optional
 * header row. Parsing and diffing are pure: nothing here reads a database, a clock or a
 * file. A parsed row never carries a cell that a spreadsheet could execute as a formula.
 */

export const HOLIDAY_CSV_MAX_ROWS = 500;
export const HOLIDAY_CSV_MAX_NAME_LENGTH = 120;
const MAX_ECHOED_VALUE_LENGTH = 80;
const KINDS: readonly CalendarDateKind[] = ['holiday', 'closure'];
/** First characters a spreadsheet treats as the start of a formula or a control cell. */
const FORMULA_LEADERS = new Set(['=', '+', '-', '@', '\t', '\r']);

export type HolidayCsvIssueCode =
  | 'invalid_date'
  | 'duplicate_date'
  | 'empty_name'
  | 'name_too_long'
  | 'invalid_name'
  | 'invalid_kind'
  | 'out_of_year'
  | 'formula_cell'
  | 'wrong_column_count'
  | 'unterminated_quote'
  | 'too_many_rows';

export interface HolidayCsvIssue {
  /** 1-based physical line where the row starts. */
  line: number;
  code: HolidayCsvIssueCode;
  message: string;
  field?: 'date' | 'name' | 'kind';
  /** The offending cell, truncated; never used to build a row. */
  value?: string;
  /** For a duplicate: the line of the first occurrence. */
  firstLine?: number;
}

export interface HolidayCsvRow {
  line: number;
  date: CivilDate;
  name: string;
  kind: CalendarDateKind;
}

export interface HolidayCsvParse {
  /** Rows without any issue, in file order. */
  rows: HolidayCsvRow[];
  issues: HolidayCsvIssue[];
}

interface RawRow {
  line: number;
  cells: string[];
  unterminated: boolean;
}

/** Splits RFC 4180-style text: quoted cells may hold commas, quotes and line breaks. */
function splitRows(text: string): RawRow[] {
  const rows: RawRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;
  let rowHasContent = false;

  const endCell = () => {
    cells.push(cell);
    cell = '';
  };
  const endRow = () => {
    endCell();
    if (rowHasContent) rows.push({ line: rowLine, cells, unterminated: false });
    cells = [];
    rowHasContent = false;
  };

  const source = text.startsWith('﻿') ? text.slice(1) : text;
  for (let index = 0; index < source.length; index += 1) {
    const char = source.charAt(index);
    if (inQuotes) {
      if (char === '"') {
        if (source.charAt(index + 1) === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        if (char === '\n') line += 1;
        cell += char;
      }
      continue;
    }
    if (char === '"' && cell.trim() === '') {
      if (!rowHasContent) rowLine = line;
      cell = '';
      inQuotes = true;
      rowHasContent = true;
    } else if (char === ',') {
      if (!rowHasContent) rowLine = line;
      rowHasContent = true;
      endCell();
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source.charAt(index + 1) === '\n') index += 1;
      endRow();
      line += 1;
    } else {
      if (!rowHasContent) rowLine = line;
      if (char.trim() !== '') rowHasContent = true;
      cell += char;
    }
  }
  if (inQuotes) {
    rows.push({ line: rowLine, cells: [], unterminated: true });
    return rows;
  }
  endRow();
  return rows;
}

const echo = (value: string): string => (value.length > MAX_ECHOED_VALUE_LENGTH ? `${value.slice(0, MAX_ECHOED_VALUE_LENGTH - 1)}…` : value);

const isBlankRow = (cells: readonly string[]): boolean => cells.every((cell) => cell.trim() === '');

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;

/**
 * Parses holiday CSV text for one calendar year. It never throws: every problem becomes an
 * issue and the offending row is left out of `rows`, so a caller can show all problems at
 * once and refuse to commit while any exist.
 */
export function parseHolidayCsv(text: string, options: { year: number }): HolidayCsvParse {
  const rows: HolidayCsvRow[] = [];
  const issues: HolidayCsvIssue[] = [];
  const firstLineOfDate = new Map<CivilDate, number>();
  let headerChecked = false;
  let dataRows = 0;

  for (const raw of splitRows(text)) {
    if (raw.unterminated) {
      issues.push({ line: raw.line, code: 'unterminated_quote', message: 'A quoted cell is never closed' });
      break;
    }
    if (isBlankRow(raw.cells)) continue;
    if (!headerChecked) {
      headerChecked = true;
      if ((raw.cells[0] ?? '').trim().toLowerCase() === 'date') continue;
    }
    dataRows += 1;
    if (dataRows > HOLIDAY_CSV_MAX_ROWS) {
      issues.push({
        line: raw.line,
        code: 'too_many_rows',
        message: `At most ${HOLIDAY_CSV_MAX_ROWS} rows can be imported at once`,
      });
      break;
    }
    if (raw.cells.length < 2 || raw.cells.length > 3) {
      issues.push({
        line: raw.line,
        code: 'wrong_column_count',
        message: 'Use date,name or date,name,kind',
        value: String(raw.cells.length),
      });
      continue;
    }
    const [dateCell = '', nameCell = '', kindCell] = raw.cells;
    const before = issues.length;
    const fields = [
      ['date', dateCell],
      ['name', nameCell],
      ...(kindCell === undefined ? [] : ([['kind', kindCell]] as const)),
    ] as const;
    const formulaFields = new Set<string>();
    for (const [field, cell] of fields) {
      if (cell !== '' && FORMULA_LEADERS.has(cell.charAt(0))) {
        formulaFields.add(field);
        issues.push({
          line: raw.line,
          code: 'formula_cell',
          field,
          message: `The ${field} cell starts with a character a spreadsheet runs as a formula`,
          value: echo(cell),
        });
      }
    }

    const date = dateCell.trim();
    let validDate = false;
    if (!formulaFields.has('date')) {
      if (isCivilDate(date)) {
        validDate = true;
        if (Number(date.slice(0, 4)) !== options.year) {
          issues.push({
            line: raw.line,
            code: 'out_of_year',
            field: 'date',
            message: `The date is outside ${options.year}`,
            value: date,
          });
        }
        const first = firstLineOfDate.get(date);
        if (first === undefined) {
          firstLineOfDate.set(date, raw.line);
        } else {
          issues.push({
            line: raw.line,
            code: 'duplicate_date',
            field: 'date',
            message: `${date} already appears on line ${first}`,
            value: date,
            firstLine: first,
          });
        }
      } else {
        issues.push({
          line: raw.line,
          code: 'invalid_date',
          field: 'date',
          message: 'Use a real date as YYYY-MM-DD',
          value: echo(date),
        });
      }
    }

    const name = nameCell.trim();
    if (!formulaFields.has('name')) {
      if (name === '') {
        issues.push({ line: raw.line, code: 'empty_name', field: 'name', message: 'A name is required' });
      } else if (CONTROL_CHARACTERS.test(name)) {
        issues.push({
          line: raw.line,
          code: 'invalid_name',
          field: 'name',
          message: 'The name holds a control character or a line break',
          value: echo(name),
        });
      } else if (name.length > HOLIDAY_CSV_MAX_NAME_LENGTH) {
        issues.push({
          line: raw.line,
          code: 'name_too_long',
          field: 'name',
          message: `Use at most ${HOLIDAY_CSV_MAX_NAME_LENGTH} characters`,
          value: echo(name),
        });
      }
    }

    const kindText = kindCell === undefined || kindCell.trim() === '' ? 'holiday' : kindCell.trim().toLowerCase();
    const kind = KINDS.find((item) => item === kindText);
    if (kindCell !== undefined && !formulaFields.has('kind') && kind === undefined) {
      issues.push({
        line: raw.line,
        code: 'invalid_kind',
        field: 'kind',
        message: `The kind must be ${KINDS.join(' or ')}`,
        value: echo(kindCell.trim()),
      });
    }

    if (issues.length === before && validDate && kind !== undefined) {
      rows.push({ line: raw.line, date, name, kind });
    }
  }
  return { rows, issues };
}

/* Diff against the effective version (E-4). */

export interface HolidayRuleLike {
  date: CivilDate;
  name: string;
  kind: CalendarDateKind;
}

export interface HolidayChange {
  date: CivilDate;
  before: { name: string; kind: CalendarDateKind };
  after: { name: string; kind: CalendarDateKind };
}

export type RemovalProblemCode = 'remove_not_found' | 'remove_conflicts_with_csv' | 'remove_before_effective_from';

export interface HolidayDiff {
  added: CalendarDateRule[];
  renamed: HolidayChange[];
  kindChanged: HolidayChange[];
  /** Dates removed because the caller listed them explicitly. */
  removed: CalendarDateRule[];
  unchanged: CalendarDateRule[];
  /** Base dates the CSV does not list and nobody removed: manual dates stay (E-4). */
  kept: CalendarDateRule[];
  /** CSV rows before the effective date; applying them would not change past days. */
  ignoredPast: HolidayRuleLike[];
  removalProblems: Array<{ date: CivilDate; code: RemovalProblemCode; message: string }>;
  /** The complete date rules of the resulting version, sorted by date. */
  next: CalendarDateRule[];
}

const byDate = <T extends { date: CivilDate }>(a: T, b: T): number => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

/**
 * Merges CSV rows into the effective version's dates. A date the CSV does not list is kept;
 * only dates in `removeDates` go away. Rows before `effectiveFrom` are ignored, so the
 * classification of past dates cannot change. Removal problems leave the date in place.
 */
export function diffHolidayDates(
  base: readonly CalendarDateRule[],
  rows: readonly HolidayRuleLike[],
  removeDates: readonly CivilDate[],
  effectiveFrom: CivilDate,
): HolidayDiff {
  const baseByDate = new Map(base.map((rule) => [rule.date, rule]));
  const csvDates = new Set(rows.map((row) => row.date));
  const diff: HolidayDiff = {
    added: [],
    renamed: [],
    kindChanged: [],
    removed: [],
    unchanged: [],
    kept: [],
    ignoredPast: [],
    removalProblems: [],
    next: [],
  };
  const next = new Map(baseByDate);

  for (const row of [...rows].sort(byDate)) {
    if (row.date < effectiveFrom) {
      diff.ignoredPast.push({ date: row.date, name: row.name, kind: row.kind });
      continue;
    }
    const existing = baseByDate.get(row.date);
    const rule: CalendarDateRule = { date: row.date, kind: row.kind, name: row.name };
    if (existing === undefined) {
      diff.added.push(rule);
      next.set(row.date, rule);
    } else if (existing.name !== row.name) {
      diff.renamed.push({
        date: row.date,
        before: { name: existing.name, kind: existing.kind },
        after: { name: row.name, kind: row.kind },
      });
      next.set(row.date, rule);
    } else if (existing.kind !== row.kind) {
      diff.kindChanged.push({
        date: row.date,
        before: { name: existing.name, kind: existing.kind },
        after: { name: row.name, kind: row.kind },
      });
      next.set(row.date, rule);
    } else {
      diff.unchanged.push(existing);
    }
  }

  const removeSeen = new Set<CivilDate>();
  for (const date of removeDates) {
    if (removeSeen.has(date)) continue;
    removeSeen.add(date);
    const existing = baseByDate.get(date);
    if (existing === undefined) {
      diff.removalProblems.push({ date, code: 'remove_not_found', message: `${date} is not in the current calendar` });
    } else if (csvDates.has(date)) {
      diff.removalProblems.push({
        date,
        code: 'remove_conflicts_with_csv',
        message: `${date} is both listed in the CSV and marked for removal`,
      });
    } else if (date < effectiveFrom) {
      diff.removalProblems.push({
        date,
        code: 'remove_before_effective_from',
        message: `${date} is before the effective date; past days are never changed`,
      });
    } else {
      diff.removed.push(existing);
      next.delete(date);
    }
  }

  const removedDates = new Set(diff.removed.map((rule) => rule.date));
  diff.kept = base.filter((rule) => !csvDates.has(rule.date) && !removedDates.has(rule.date)).sort(byDate);
  diff.next = [...next.values()].sort(byDate);
  return diff;
}
