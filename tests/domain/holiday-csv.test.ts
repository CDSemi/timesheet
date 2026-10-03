import { describe, expect, it } from 'vitest';
import type { CalendarDateRule } from '../../src/domain/calendar.ts';
import {
  diffHolidayDates,
  HOLIDAY_CSV_MAX_NAME_LENGTH,
  HOLIDAY_CSV_MAX_ROWS,
  parseHolidayCsv,
} from '../../src/domain/holidayCsv.ts';

/*
 * WP2-T08 holiday CSV (FR-13, AC-05): a pure parser for `date,name[,kind]` and a pure diff
 * against the effective version. Inputs are inline strings only; no CSV file exists.
 */

const codes = (text: string, year = 2027) => parseHolidayCsv(text, { year }).issues.map((issue) => issue.code);

describe('parseHolidayCsv rows', () => {
  it('reads date,name and the optional kind, skipping a header, blank lines, a BOM and CRLF', () => {
    const text = '﻿date,name,kind\r\n2027-01-01,New Year\r\n\r\n2027-07-05,"Founders, Day",closure\r\n';
    const parsed = parseHolidayCsv(text, { year: 2027 });
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      { line: 2, date: '2027-01-01', name: 'New Year', kind: 'holiday' },
      { line: 4, date: '2027-07-05', name: 'Founders, Day', kind: 'closure' },
    ]);
  });

  it('unquotes doubled quotes and trims cells', () => {
    const parsed = parseHolidayCsv(' 2027-11-25 , "The ""Big"" Day" , holiday \n', { year: 2027 });
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([{ line: 1, date: '2027-11-25', name: 'The "Big" Day', kind: 'holiday' }]);
  });

  it('accepts a lone CR as a line break outside quotes', () => {
    const parsed = parseHolidayCsv('2027-01-01,A\r2027-01-02,B', { year: 2027 });
    expect(parsed.rows.map((row) => row.date)).toEqual(['2027-01-01', '2027-01-02']);
  });

  it('reports nothing for an empty or header-only text', () => {
    expect(parseHolidayCsv('', { year: 2027 })).toEqual({ rows: [], issues: [] });
    expect(parseHolidayCsv('date,name\n', { year: 2027 })).toEqual({ rows: [], issues: [] });
  });
});

describe('parseHolidayCsv validation', () => {
  it('flags invalid dates without throwing', () => {
    const parsed = parseHolidayCsv('2027-02-30,Nope\n2027/03/01,Slashes\n,Blank\nnot-a-date,Text\n2027-13-01,Month', {
      year: 2027,
    });
    expect(parsed.rows).toEqual([]);
    expect(parsed.issues.map((issue) => [issue.line, issue.code])).toEqual([
      [1, 'invalid_date'],
      [2, 'invalid_date'],
      [3, 'invalid_date'],
      [4, 'invalid_date'],
      [5, 'invalid_date'],
    ]);
  });

  it('flags a duplicate date at its second occurrence and keeps the first row', () => {
    const parsed = parseHolidayCsv('2027-01-01,One\n2027-01-01,Two\n2027-01-02,Three', { year: 2027 });
    expect(parsed.issues).toEqual([
      expect.objectContaining({ line: 2, code: 'duplicate_date', value: '2027-01-01', firstLine: 1 }),
    ]);
    expect(parsed.rows.map((row) => row.name)).toEqual(['One', 'Three']);
  });

  it('flags empty names, including whitespace and a missing column', () => {
    expect(codes('2027-01-01,\n2027-01-02,   \n2027-01-03')).toEqual(['empty_name', 'empty_name', 'wrong_column_count']);
  });

  it('flags rows outside the import year', () => {
    const parsed = parseHolidayCsv('2026-12-31,Last year\n2027-06-01,Fine\n2028-01-01,Next year', { year: 2027 });
    expect(parsed.issues.map((issue) => [issue.line, issue.code])).toEqual([
      [1, 'out_of_year'],
      [3, 'out_of_year'],
    ]);
    expect(parsed.rows.map((row) => row.date)).toEqual(['2027-06-01']);
  });

  it('flags an unknown kind and wrong column counts', () => {
    expect(codes('2027-01-01,A,festival\n2027-01-02,B,holiday,extra\n2027-01-03')).toEqual([
      'invalid_kind',
      'wrong_column_count',
      'wrong_column_count',
    ]);
  });

  it('flags control characters and over-long names', () => {
    const long = 'x'.repeat(HOLIDAY_CSV_MAX_NAME_LENGTH + 1);
    expect(codes(`2027-01-01,"Line\nBreak"\n2027-01-02,${long}\n2027-01-03,${'y'.repeat(HOLIDAY_CSV_MAX_NAME_LENGTH)}`)).toEqual([
      'invalid_name',
      'name_too_long',
    ]);
  });

  it('flags an unterminated quote and keeps reading nothing after it', () => {
    const parsed = parseHolidayCsv('2027-01-01,"Open name\n2027-01-02,Later', { year: 2027 });
    expect(parsed.issues.map((issue) => [issue.line, issue.code])).toEqual([[1, 'unterminated_quote']]);
    expect(parsed.rows).toEqual([]);
  });

  it('stops after the row limit with one issue', () => {
    const lines = Array.from({ length: HOLIDAY_CSV_MAX_ROWS + 5 }, (_, index) => `2027-01-01,Row ${index}`);
    const parsed = parseHolidayCsv(lines.join('\n'), { year: 2027 });
    expect(parsed.issues.filter((issue) => issue.code === 'too_many_rows')).toHaveLength(1);
  });
});

describe('parseHolidayCsv formula-leading cells (spreadsheet injection)', () => {
  it.each([
    ['equals', '=1+1'],
    ['plus', '+SUM(A1)'],
    ['minus', '-2+3'],
    ['at', '@cmd'],
    ['tab', '\tpadded'],
  ])('rejects a name starting with %s', (_label, name) => {
    const parsed = parseHolidayCsv(`2027-01-01,"${name}"\n2027-01-02,Safe`, { year: 2027 });
    expect(parsed.issues).toEqual([expect.objectContaining({ line: 1, code: 'formula_cell', field: 'name' })]);
    expect(parsed.rows.map((row) => row.name)).toEqual(['Safe']);
  });

  it('rejects a quoted name starting with a CR', () => {
    const parsed = parseHolidayCsv('2027-01-01,"\r=1+1"', { year: 2027 });
    expect(parsed.issues.map((issue) => issue.code)).toContain('formula_cell');
    expect(parsed.rows).toEqual([]);
  });

  it('rejects a formula in the date and kind cells and never copies it into a row', () => {
    const parsed = parseHolidayCsv('=2027-01-01,A\n2027-01-02,B,@kind', { year: 2027 });
    expect(parsed.issues.filter((issue) => issue.code === 'formula_cell').map((issue) => issue.field)).toEqual(['date', 'kind']);
    expect(parsed.rows).toEqual([]);
  });

  it('allows a leading operator after the first character', () => {
    const parsed = parseHolidayCsv('2027-01-01,Day = off', { year: 2027 });
    expect(parsed.issues).toEqual([]);
  });

  it('truncates echoed values in issues', () => {
    const parsed = parseHolidayCsv(`=${'z'.repeat(500)},A`, { year: 2027 });
    for (const issue of parsed.issues) expect((issue.value ?? '').length).toBeLessThanOrEqual(80);
  });
});

describe('diffHolidayDates', () => {
  const base: CalendarDateRule[] = [
    { date: '2027-01-01', kind: 'holiday', name: 'New Year' },
    { date: '2027-03-15', kind: 'holiday', name: 'Manual Friday' },
    { date: '2027-05-31', kind: 'holiday', name: 'Memorial' },
    { date: '2027-12-24', kind: 'closure', name: 'Holiday closure' },
  ];
  const row = (date: string, name: string, kind: 'holiday' | 'closure' = 'holiday') => ({ date, name, kind });

  it('adds, renames and changes kinds, and keeps base dates the CSV does not list', () => {
    const diff = diffHolidayDates(
      base,
      [row('2027-01-01', 'New Year'), row('2027-05-31', 'Memorial Day'), row('2027-07-05', 'Independence'), row('2027-12-24', 'Holiday closure', 'holiday')],
      [],
      '2027-01-01',
    );
    expect(diff.added).toEqual([row('2027-07-05', 'Independence')]);
    expect(diff.renamed).toEqual([
      { date: '2027-05-31', before: { name: 'Memorial', kind: 'holiday' }, after: { name: 'Memorial Day', kind: 'holiday' } },
    ]);
    expect(diff.kindChanged).toEqual([
      { date: '2027-12-24', before: { name: 'Holiday closure', kind: 'closure' }, after: { name: 'Holiday closure', kind: 'holiday' } },
    ]);
    expect(diff.unchanged.map((item) => item.date)).toEqual(['2027-01-01']);
    // E-4: the manual date the CSV does not list stays.
    expect(diff.kept.map((item) => item.date)).toEqual(['2027-03-15']);
    expect(diff.removed).toEqual([]);
    expect(diff.next.map((item) => item.date)).toEqual(['2027-01-01', '2027-03-15', '2027-05-31', '2027-07-05', '2027-12-24']);
  });

  it('removes a date only when it is listed explicitly', () => {
    const diff = diffHolidayDates(base, [row('2027-01-01', 'New Year')], ['2027-03-15'], '2027-01-01');
    expect(diff.removed.map((item) => item.date)).toEqual(['2027-03-15']);
    expect(diff.next.map((item) => item.date)).not.toContain('2027-03-15');
    expect(diff.kept.map((item) => item.date)).toEqual(['2027-05-31', '2027-12-24']);
  });

  it('reports removal problems without applying them', () => {
    const diff = diffHolidayDates(base, [row('2027-05-31', 'Memorial')], ['2027-02-02', '2027-05-31', '2027-01-01'], '2027-02-01');
    expect(diff.removalProblems.map((item) => [item.date, item.code])).toEqual([
      ['2027-02-02', 'remove_not_found'],
      ['2027-05-31', 'remove_conflicts_with_csv'],
      ['2027-01-01', 'remove_before_effective_from'],
    ]);
    expect(diff.removed).toEqual([]);
    expect(diff.next.map((item) => item.date)).toEqual(base.map((item) => item.date));
  });

  it('ignores CSV dates before the effective date so past classification cannot move', () => {
    const diff = diffHolidayDates(base, [row('2027-01-01', 'Renamed Past'), row('2027-02-01', 'Past added'), row('2027-08-01', 'Future')], [], '2027-06-01');
    expect(diff.ignoredPast.map((item) => item.date)).toEqual(['2027-01-01', '2027-02-01']);
    expect(diff.added.map((item) => item.date)).toEqual(['2027-08-01']);
    expect(diff.renamed).toEqual([]);
    expect(diff.next.find((item) => item.date === '2027-01-01')?.name).toBe('New Year');
    expect(diff.next.map((item) => item.date)).not.toContain('2027-02-01');
  });

  it('is identical for the same input in any CSV order', () => {
    const a = diffHolidayDates(base, [row('2027-07-05', 'I'), row('2027-08-01', 'F')], [], '2027-01-01');
    const b = diffHolidayDates(base, [row('2027-08-01', 'F'), row('2027-07-05', 'I')], [], '2027-01-01');
    expect(a.next).toEqual(b.next);
  });
});
