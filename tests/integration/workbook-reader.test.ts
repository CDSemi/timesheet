import { strToU8 } from 'fflate';
import { afterAll, describe, expect, it } from 'vitest';
import { addDays } from '../../src/domain/dates.ts';
import { mapWorkbook, MAX_FINDING_SOURCES, MAX_FINDINGS_PER_CODE, previewWorkbook, type Finding, type FindingCode, type WorkbookPreview } from '../../src/server/import/templateMapping.ts';
import {
  DEFAULT_READER_LIMITS,
  FORMULA_CACHE_NOTE,
  readWorkbook,
  WorkbookRejectedError,
  type ReadCell,
  type ReaderLimits,
  type ReadWorkbook,
  type WorkbookRejectionCode,
} from '../../src/server/import/xlsxReader.ts';
import {
  buildNamedSheetWorkbook,
  buildSyntheticWorkbook,
  paddedSheetXml,
  pack,
  patchEntry,
  readTemplateBytes,
  sha256Hex,
  TEMPLATE_SHA256,
  unpack,
  withEntry,
  withText,
} from '../support/syntheticWorkbook.ts';

/*
 * WP4-T08 (AC-12, docs/07 workbook preview rules): safe workbook reader, mapping v1 and the synthetic dated-sheet
 * generator. All workbooks are built in memory from the tracked sanitized template; nothing is written to disk. The
 * payroll dates are fixed 2026 values from the template's own payroll calendar, so no test depends on the season
 * or reads the wall clock.
 */

const MIB = 1024 * 1024;

function findings(preview: WorkbookPreview, code: FindingCode): Finding[] {
  return preview.findings.filter((finding) => finding.code === code);
}

function rejection(action: () => unknown): WorkbookRejectionCode | null {
  try {
    action();
  } catch (error) {
    if (error instanceof WorkbookRejectedError) return error.code;
    throw error;
  }
  return null;
}

function reject(bytes: Uint8Array, limits: Partial<ReaderLimits> = {}): WorkbookRejectionCode | null {
  return rejection(() => readWorkbook(bytes, limits));
}

const PERIODS = [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-23' }, { payrollDate: '2026-02-06' }] as const;

afterAll(() => {
  // The tracked template is only ever read; its hash must be the published one after every test in this file.
  expect(sha256Hex(readTemplateBytes())).toBe(TEMPLATE_SHA256);
});

describe('tracked template (read only)', () => {
  it('keeps the published SHA-256 and is cloned in memory only', () => {
    const before = sha256Hex(readTemplateBytes());
    expect(before).toBe(TEMPLATE_SHA256);
    buildSyntheticWorkbook({ periods: [...PERIODS] });
    expect(sha256Hex(readTemplateBytes())).toBe(TEMPLATE_SHA256);
  });

  it('previews the three support sheets and reports every README defect with cell provenance', () => {
    const preview = previewWorkbook(readTemplateBytes());
    expect(preview.mappingVersion).toBe(1);
    expect(preview.sourceSha256).toBe(TEMPLATE_SHA256);
    expect(preview.sheets.map((sheet) => [sheet.name, sheet.role])).toEqual([
      ['Working Infos', 'support_working_infos'],
      ['Holiday Dates', 'support_holidays'],
      ['Timesheet', 'form_template'],
    ]);
    expect(preview.periods).toEqual([]);
    expect(preview.holidays).toHaveLength(9);
    expect(preview.payrollCalendar).toEqual({ count: 340, first: '2022-12-30', last: '2035-12-28' });

    const hours = findings(preview, 'formula_hours_8_5');
    expect(hours).toHaveLength(1);
    expect(hours[0]?.sources).toHaveLength(14);
    expect(hours[0]?.sources).toContain('Timesheet!B16');
    expect(hours[0]?.sources).toContain('Timesheet!Z23');

    const sunday = findings(preview, 'weekly_total_omits_sunday');
    expect(sunday).toHaveLength(1);
    expect(sunday[0]?.sources).toEqual(['Timesheet!X24', 'Timesheet!Z16', 'Timesheet!Z23']);

    expect(findings(preview, 'today_signature_date').map((finding) => finding.sources)).toEqual([['Timesheet!W26']]);
    expect(findings(preview, 'volatile_today_formula')[0]?.sources).toEqual(['Timesheet!I10']);

    const floating = findings(preview, 'floating_holiday');
    expect(floating.map((finding) => finding.details)).toEqual([
      { date: '2026-01-02', label: 'Floating Holiday' },
      { date: '2026-11-27', label: 'Floating Holiday' },
    ]);
    expect(floating[0]?.sources).toEqual(['Holiday Dates!A3', 'Holiday Dates!B3']);
    expect(preview.holidays.filter((holiday) => holiday.floating).map((holiday) => holiday.source)).toEqual(['Holiday Dates!A3', 'Holiday Dates!A9']);
    expect(preview.clean).toBe(true);
  });

  it('never evaluates formulas and labels cached results as not authoritative', () => {
    const workbook = readWorkbook(readTemplateBytes());
    const timesheet = workbook.sheets.find((sheet) => sheet.name === 'Timesheet');
    const signature = timesheet?.cells.get('W26');
    expect(signature?.provenance).toBe('Timesheet!W26');
    expect(signature?.formula).toBe('TODAY()');
    expect(signature?.value).toBeNull();
    expect(signature?.type).toBe('blank');
    expect(typeof signature?.cachedValue).toBe('number');
    expect(signature?.cacheNote).toBe(FORMULA_CACHE_NOTE);
    expect(FORMULA_CACHE_NOTE).toBe('formula cache, not authoritative');
    // A plain value carries no cache note.
    const label = workbook.sheets[1]?.cells.get('B3');
    expect(label?.value).toBe('Floating Holiday');
    expect(label?.cacheNote).toBeNull();
  });
});

describe('synthetic dated sheets', () => {
  it('maps dated sheets with labels, clocks and the period dates implied by the payroll date', () => {
    const bytes = buildSyntheticWorkbook({
      periods: [
        {
          payrollDate: '2026-01-09',
          employee: 'Test Person Alpha (alpha@example.invalid)',
          days: {
            0: { start: 8 * 60, end: 17 * 60 + 30 },
            2: { label: 'Work from home' },
            3: { label: 'Vacation' },
            4: { label: 'Off Day (Overtime Used)' },
            7: { label: 'Sick Day' },
            8: { label: 'Shutdown' },
          },
        },
        { payrollDate: '2026-01-23' },
      ],
    });
    const preview = previewWorkbook(bytes);
    expect(preview.periods.map((period) => [period.sheetName, period.payrollDate])).toEqual([
      ['2026.01.09', '2026-01-09'],
      ['2026.01.23', '2026-01-23'],
    ]);
    const period = preview.periods[0];
    expect(period?.employee?.value).toBe('Test Person Alpha (alpha@example.invalid)');
    expect(period?.employee?.source).toBe('2026.01.09!I8');
    expect(period?.days).toHaveLength(14);
    expect(period?.days[0]?.date).toEqual({ value: '2025-12-22', source: '2026.01.09!B13', fromFormulaCache: false });
    expect(period?.days[13]?.date?.value).toBe('2026-01-04');
    expect(period?.days[0]?.startMinutes?.value).toBe(480);
    expect(period?.days[0]?.endMinutes?.value).toBe(1050);
    expect(period?.days[0]?.endMinutes?.source).toBe('2026.01.09!D15');
    expect(period?.days[1]?.label?.value).toBe('Worked');
    expect(period?.days[1]?.mapping).toEqual({ category: 'worked' });
    expect(period?.days[2]?.mapping).toEqual({ category: 'worked', workFromHome: true });
    expect(period?.days[3]?.mapping).toEqual({ category: 'leave', leaveKind: 'vacation' });
    expect(period?.days[4]?.mapping).toEqual({ category: 'leave', leaveKind: 'ot' });
    expect(period?.days[7]?.mapping).toEqual({ category: 'leave', leaveKind: 'sick' });
    expect(period?.days[8]?.mapping).toEqual({ category: 'shutdown' });
    expect(period?.days[5]?.label).toBeNull(); // weekend left blank
    expect(findings(preview, 'unknown_label')).toEqual([]);
  });

  it('accepts a holiday-table name as a holiday label and a floating one with a floating finding', () => {
    const preview = previewWorkbook(
      buildSyntheticWorkbook({
        periods: [{ payrollDate: '2026-01-09', days: { 8: { label: "New Year's Day" }, 9: { label: 'Floating Holiday' } } }],
      }),
    );
    expect(findings(preview, 'unknown_label')).toEqual([]);
    expect(preview.periods[0]?.days[8]?.mapping).toEqual({ category: 'holiday' });
    expect(preview.periods[0]?.days[8]?.holidayName).toBe("New Year's Day");
    expect(preview.periods[0]?.days[9]?.holidayName).toBe('Floating Holiday');
    expect(findings(preview, 'floating_holiday')).toHaveLength(2);
  });

  it('flags an unknown label at its cell and blocks a clean preview', () => {
    const preview = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', days: { 2: { label: 'Teleported' } } }] }));
    const unknown = findings(preview, 'unknown_label');
    expect(unknown).toHaveLength(1);
    expect(unknown[0]?.sources).toEqual(['2026.01.09!J14']);
    expect(unknown[0]?.severity).toBe('error');
    expect(unknown[0]?.details).toEqual({ label: 'Teleported' });
    expect(preview.periods[0]?.days[2]?.mapping).toBeNull();
    expect(preview.clean).toBe(false);
  });

  it('flags a duplicate payroll date, whether the sheet names differ or are identical', () => {
    const differentNames = previewWorkbook(
      buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-09', sheetName: '2026-01-09' }] }),
    );
    const payroll = differentNames.findings.filter((finding) => finding.code === 'duplicate_date' && finding.details?.scope === 'payroll_date');
    expect(payroll).toHaveLength(1);
    expect(payroll[0]?.sources).toEqual(['2026.01.09', '2026-01-09']);
    expect(differentNames.clean).toBe(false);

    const sameName = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-09' }] }));
    expect(sameName.findings.some((finding) => finding.code === 'duplicate_date' && finding.details?.scope === 'payroll_date')).toBe(true);
  });

  it('flags a date that appears on two payroll sheets or twice on one sheet', () => {
    const overlap = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-16' }] }));
    const days = overlap.findings.filter((finding) => finding.code === 'duplicate_date' && finding.details?.scope === 'day');
    expect(days).toHaveLength(7);
    expect(days.every((finding) => finding.sources[0]?.startsWith('2026.01.09!') && finding.sources[1]?.startsWith('2026.01.16!'))).toBe(true);

    const inside = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', days: { 1: { date: '2025-12-22' } } }] }));
    const repeated = inside.findings.filter((finding) => finding.code === 'duplicate_date');
    expect(repeated).toHaveLength(1);
    expect(repeated[0]?.sources).toEqual(['2026.01.09!B13', '2026.01.09!F13']);
    expect(findings(inside, 'day_date_unexpected')[0]?.sources).toEqual(['2026.01.09!F13']);
  });

  it('does not map a sheet whose name is not a payroll date and keeps it reported', () => {
    const preview = previewWorkbook(buildNamedSheetWorkbook(['Notes', '2026.13.40', '2026.01.09 (2)', '2026-01-09']));
    const unmapped = findings(preview, 'sheet_name_not_payroll_date');
    expect(unmapped.map((finding) => finding.sources)).toEqual([['Notes'], ['2026.13.40'], ['2026.01.09 (2)']]);
    expect(preview.sheets.filter((sheet) => sheet.role === 'unmapped').map((sheet) => sheet.name)).toEqual(['Notes', '2026.13.40', '2026.01.09 (2)']);
    expect(preview.periods.map((period) => period.sheetName)).toEqual(['2026-01-09']);
  });

  it('detects the three inherited formula defects on a dated sheet, and none once they are corrected', () => {
    const inherited = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }] }));
    const own = (code: FindingCode) => findings(inherited, code).find((finding) => finding.sources.every((source) => source.startsWith('2026.01.09!')));
    expect(own('formula_hours_8_5')?.sources).toContain('2026.01.09!B16');
    expect(own('weekly_total_omits_sunday')?.sources).toEqual(['2026.01.09!X24', '2026.01.09!Z16', '2026.01.09!Z23']);
    expect(own('today_signature_date')?.sources).toEqual(['2026.01.09!W26']);

    const corrected = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', cleanFormulas: true }] }));
    for (const code of ['formula_hours_8_5', 'weekly_total_omits_sunday', 'today_signature_date', 'volatile_today_formula'] as const) {
      expect(findings(corrected, code).filter((finding) => finding.sources.some((source) => source.startsWith('2026.01.09!')))).toEqual([]);
    }
  });

  it('reports values taken from a formula cache and a payroll cell that disagrees with the sheet name', () => {
    const preview = previewWorkbook(
      buildSyntheticWorkbook({
        periods: [{ payrollDate: '2026-01-09', payrollCellDate: '2026-01-23', days: { 0: { labelFormulaCache: 'Worked' } } }],
      }),
    );
    expect(preview.periods[0]?.days[0]?.label).toEqual({ value: 'Worked', source: '2026.01.09!B14', fromFormulaCache: true });
    const cache = findings(preview, 'formula_cache_not_authoritative');
    expect(cache).toHaveLength(1);
    expect(cache[0]?.sources).toContain('2026.01.09!B14');
    expect(findings(preview, 'payroll_cell_mismatch')[0]?.sources).toEqual(['2026.01.09!I10']);
    expect(preview.periods[0]?.payrollDate).toBe('2026-01-09');
  });

  it('flags a half-filled clock pair and a payroll date outside the workbook calendar', () => {
    const preview = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-10', days: { 0: { start: 480 } } }] }));
    expect(findings(preview, 'time_pair_incomplete')[0]?.sources).toEqual(['2026.01.10!B15', '2026.01.10!D15']);
    expect(findings(preview, 'payroll_date_not_in_calendar')[0]?.sources).toEqual(['2026.01.10']);
  });

  it('reports hidden sheets', () => {
    const preview = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', hidden: true }] }));
    expect(findings(preview, 'hidden_sheet')[0]?.sources).toEqual(['2026.01.09']);
    expect(preview.sheets.at(-1)?.hidden).toBe(true);
  });
});

describe('reader limits and hostile packages', () => {
  const template = readTemplateBytes();
  const entriesOfTemplate = unpack(template);

  it('rejects data that is not a ZIP package or is not a workbook', () => {
    expect(reject(strToU8('not a zip file at all, just some text'))).toBe('not_a_zip');
    expect(reject(template.subarray(0, template.length - 40))).toBe('not_a_zip');
    const { 'xl/workbook.xml': _removed, ...rest } = entriesOfTemplate;
    expect(_removed).toBeDefined();
    expect(reject(pack(rest))).toBe('not_a_workbook');
  });

  it('rejects a package larger than the compressed-size limit', () => {
    expect(reject(template, { maxCompressedBytes: 1000 })).toBe('package_too_large');
    expect(reject(template)).toBeNull();
  });

  it('rejects a package with too many entries', () => {
    const many: Record<string, Uint8Array> = { ...entriesOfTemplate };
    for (let index = 0; index < 300; index += 1) many[`customXml/extra${index}.xml`] = strToU8('<x/>');
    expect(reject(pack(many))).toBe('too_many_entries');
    expect(reject(template, { maxEntries: 10 })).toBe('too_many_entries');
  });

  it('rejects a zip bomb: an entry whose declared inflated size is over the per-entry limit', () => {
    const bomb = withEntry(template, 'xl/sharedStrings.xml', new Uint8Array(20 * MIB));
    expect(bomb.length).toBeLessThan(200 * 1024);
    expect(reject(bomb)).toBe('entry_too_large');
  });

  it('rejects an oversized entry whose header lies about its inflated size, before it is fully inflated', () => {
    const honest = withEntry(template, 'xl/sharedStrings.xml', new Uint8Array(4 * MIB));
    const lying = patchEntry(honest, 'xl/sharedStrings.xml', { uncompressedSize: 1000 });
    expect(reject(lying, { maxEntryInflatedBytes: 64 * 1024 })).toBe('entry_too_large');
    // The same lie against the default limits: the 64 MiB bomb is stopped at the 4 MiB per-part cap (WP4-FIXB), well
    // before the 16 MiB per-entry cap that used to stop it.
    const big = patchEntry(withEntry(template, 'xl/sharedStrings.xml', new Uint8Array(64 * MIB)), 'xl/sharedStrings.xml', { uncompressedSize: 1000 });
    expect(big.length).toBeLessThan(200 * 1024);
    expect(reject(big)).toBe('part_too_large');
  });

  it('rejects a package whose entries together inflate beyond the total limit', () => {
    const sheet = paddedSheetXml(300 * 1024);
    const heavy = pack({
      ...entriesOfTemplate,
      'xl/worksheets/sheet1.xml': strToU8(sheet),
      'xl/worksheets/sheet2.xml': strToU8(sheet),
      'xl/worksheets/sheet3.xml': strToU8(sheet),
    });
    const limits = { maxEntryInflatedBytes: 512 * 1024, maxTotalInflatedBytes: 600 * 1024 };
    expect(reject(heavy, limits)).toBe('total_too_large');
    // Headers claiming tiny sizes do not hide it: the real output is counted against the same total.
    let lying = heavy;
    for (const part of ['sheet1', 'sheet2', 'sheet3']) lying = patchEntry(lying, `xl/worksheets/${part}.xml`, { uncompressedSize: 100 });
    expect(reject(lying, { maxEntryInflatedBytes: 512 * 1024, maxTotalInflatedBytes: 200 * 1024 })).toBe('total_too_large');
    expect(reject(heavy, { maxEntryInflatedBytes: 512 * 1024 })).toBeNull();
  });

  it('rejects an entry whose size or checksum does not match its header', () => {
    expect(reject(patchEntry(template, 'xl/sharedStrings.xml', { crc: 0x12345678 }))).toBe('entry_integrity');
    expect(reject(patchEntry(template, 'xl/sharedStrings.xml', { uncompressedSize: 5 }))).toBe('entry_integrity');
  });

  it('rejects encrypted entries', () => {
    expect(reject(patchEntry(template, 'xl/workbook.xml', { flags: 1 }))).toBe('unsupported_zip');
  });

  const BILLION_LAUGHS =
    '<?xml version="1.0"?><!DOCTYPE sst [<!ENTITY a "AAAAAAAAAA"><!ENTITY b "&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;"><!ENTITY c "&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;">]>' +
    '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>&c;</t></si></sst>';

  it('rejects a DOCTYPE or entity payload in any parsed part, including a UTF-16 one', () => {
    expect(reject(withText(template, 'xl/sharedStrings.xml', () => BILLION_LAUGHS))).toBe('doctype_forbidden');
    expect(reject(withText(template, 'xl/worksheets/sheet2.xml', (xml) => `<!DOCTYPE worksheet [<!ENTITY x SYSTEM "file:///nonexistent">]>${xml ?? ''}`))).toBe('doctype_forbidden');
    expect(reject(withText(template, 'xl/workbook.xml', (xml) => (xml ?? '').replace('<workbook ', '<!ENTITY y "z"><workbook ')))).toBe('doctype_forbidden');
    const utf16 = new Uint8Array(2 + BILLION_LAUGHS.length * 2);
    utf16.set([0xff, 0xfe]);
    utf16.set(new Uint8Array(Buffer.from(BILLION_LAUGHS, 'utf16le')), 2);
    expect(reject(withEntry(template, 'xl/sharedStrings.xml', utf16))).toBe('doctype_forbidden');
  });

  it('decodes the predefined entities exactly once and leaves unknown references literal', () => {
    const literal = 'A &lt; B &amp;amp; &xxe; &#x41; C&D';
    const preview = previewWorkbook(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', employee: literal }] }));
    expect(preview.periods[0]?.employee?.value).toBe(literal);
    // A numeric reference and the five predefined entities are decoded once when they are written as markup.
    const rewritten = withText(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09', employee: 'MARK' }] }), 'xl/worksheets/sheet100.xml', (xml) =>
      (xml ?? '').replace('MARK', '&#x41;&amp;&lt;&gt;&quot;&apos;&xxe;'),
    );
    expect(previewWorkbook(rewritten).periods[0]?.employee?.value).toBe('A&<>"\'&xxe;');
  });

  it('rejects macro-bearing packages by entry name or content type', () => {
    expect(reject(withEntry(template, 'xl/vbaProject.bin', strToU8('not really a macro')))).toBe('macro_content');
    expect(reject(withEntry(template, 'xl/macrosheets/sheet1.xml', strToU8('<x/>')))).toBe('macro_content');
    const macroEnabled = withText(template, '[Content_Types].xml', (xml) =>
      (xml ?? '').replace('spreadsheetml.sheet.main+xml', 'ms-excel.sheet.macroEnabled.main+xml'),
    );
    expect(reject(macroEnabled)).toBe('macro_content');
    const vbaType = withText(template, '[Content_Types].xml', (xml) =>
      (xml ?? '').replace('</Types>', '<Override PartName="/xl/other.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>'),
    );
    expect(reject(vbaType)).toBe('macro_content');
  });

  it('ignores external links: they are listed, never opened or followed', () => {
    const withLink = withText(
      withEntry(template, 'xl/externalLinks/externalLink1.xml', strToU8(`<?xml version="1.0"?><!DOCTYPE x [<!ENTITY e "boom">]><externalLink>&e;</externalLink>`)),
      'xl/_rels/workbook.xml.rels',
      (xml) =>
        (xml ?? '').replace(
          '</Relationships>',
          '<Relationship Id="rIdExt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink" Target="file:///C:/does/not/exist.xlsx" TargetMode="External"/></Relationships>',
        ),
    );
    const preview = previewWorkbook(withLink);
    expect(findings(preview, 'external_link_ignored').map((finding) => finding.sources[0])).toContain('xl/externalLinks/externalLink1.xml');
    expect(preview.sheets).toHaveLength(3);
  });

  it('does not run anything when a formula is hostile: it stays text with a cached value', () => {
    const hostile = withText(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }] }), 'xl/worksheets/sheet100.xml', (xml) =>
      (xml ?? '').replace('</sheetData>', '<row r="40"><c r="A40" t="str"><f>cmd|\' /C calc\'!A0</f><v>cached</v></c></row></sheetData>'),
    );
    expect(previewWorkbook(hostile).periods).toHaveLength(1);
    const cell = readWorkbook(hostile).sheets.at(-1)?.cells.get('A40');
    expect(cell?.formula).toBe("cmd|' /C calc'!A0");
    expect(cell?.value).toBeNull();
    expect(cell?.cachedValue).toBe('cached');
    expect(cell?.cacheNote).toBe(FORMULA_CACHE_NOTE);
  });

  it('only ever fails with a typed rejection when bytes of a valid package are corrupted (deterministic)', () => {
    const base = buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }] });
    let seed = 20_260_105;
    const next = (): number => {
      seed = (Math.imul(seed, 1_103_515_245) + 12_345) >>> 0;
      return seed;
    };
    for (let round = 0; round < 300; round += 1) {
      const mutated = new Uint8Array(base);
      for (let flips = 0; flips < 1 + (round % 4); flips += 1) mutated[next() % mutated.length] = next() & 0xff;
      expect(() => rejection(() => readWorkbook(mutated))).not.toThrow();
    }
  });

  it('keeps the tracked template unchanged after the hostile cases', () => {
    expect(sha256Hex(readTemplateBytes())).toBe(TEMPLATE_SHA256);
  });
});

/*
 * WP4-FIXB (audit findings WP4-B-01 and WP4-B-02). A small upload inside the old limits made the parser build a
 * DOM of up to 48 MiB of XML (8 s, +900 MiB, a blocked event loop) and a 2.7 MB upload stored 12 MiB of findings.
 * The refusal code is the main assertion everywhere; the wall-clock bounds are generous (the old cost was seconds
 * to tens of seconds), so they stay stable on a slow runner.
 */
describe('parse cost and report size are bounded (WP4-B-01)', () => {
  const template = readTemplateBytes();
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const SHEET_PARTS = ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml'];

  /** A worksheet of about `bytes` characters made of one repeated cell (or any repeated fragment) in one row. */
  function repeatedSheet(fragment: string, bytes: number, wrapper: { open: string; close: string } = { open: '<row r="1">', close: '</row>' }): string {
    const head = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${wrapper.open}`;
    const tail = `${wrapper.close}</sheetData></worksheet>`;
    return head + fragment.repeat(Math.floor((bytes - head.length - tail.length) / fragment.length)) + tail;
  }

  function withSheets(parts: readonly string[], xml: string): Uint8Array {
    return pack({ ...unpack(template), ...Object.fromEntries(parts.map((part) => [part, strToU8(xml)])) });
  }

  function timed(action: () => unknown): { code: WorkbookRejectionCode | null; ms: number } {
    const started = performance.now();
    const code = rejection(action);
    return { code, ms: performance.now() - started };
  }

  it('refuses the 65 KB package of three 15.8 MiB empty-cell sheets as an oversized part, quickly (P1b, P6)', () => {
    const bytes = withSheets(SHEET_PARTS, repeatedSheet('<c/>', 15.8 * MIB));
    expect(bytes.length).toBeLessThan(100 * 1024);
    const outcome = timed(() => previewWorkbook(bytes));
    expect(outcome.code).toBe('part_too_large');
    expect(outcome.ms).toBeLessThan(3000); // 8.5 s and +900 MiB before the fix
  });

  it('refuses sheets of <c><v>1</v></c> cells before it allocates for them (P1b)', () => {
    const bytes = withSheets(SHEET_PARTS, repeatedSheet('<c><v>1</v></c>', 15.8 * MIB));
    expect(bytes.length).toBeLessThan(150 * 1024);
    const outcome = timed(() => previewWorkbook(bytes));
    expect(outcome.code).toBe('part_too_large');
    expect(outcome.ms).toBeLessThan(3000);
  });

  it('counts element openings before parsing, so a part under the size limit cannot hide a huge tree', () => {
    // Each part is about 3.5 MiB: under the 4 MiB part limit, far over the element, cell and row limits.
    const junk = withSheets(SHEET_PARTS, repeatedSheet('<a/>', 3.5 * MIB, { open: '', close: '' }));
    expect(rejection(() => readWorkbook(junk))).toBe('too_many_elements');
    const cells = withSheets(SHEET_PARTS, repeatedSheet('<c/>', 3.5 * MIB));
    expect(rejection(() => readWorkbook(cells))).toBe('too_many_cells');
    const rows = withSheets(SHEET_PARTS, repeatedSheet('<row/>', 3.5 * MIB, { open: '', close: '' }));
    expect(rejection(() => readWorkbook(rows))).toBe('too_many_rows');
    const strings = `<?xml version="1.0"?><sst xmlns="${NS}">${'<si/>'.repeat(60_000)}</sst>`;
    expect(rejection(() => readWorkbook(withEntry(template, 'xl/sharedStrings.xml', strToU8(strings))))).toBe('too_many_shared_strings');
  });

  it('also sees namespace-prefixed cells and rows', () => {
    const prefixed = `<?xml version="1.0"?><x:worksheet xmlns:x="${NS}"><x:sheetData><x:row r="1">${'<x:c/>'.repeat(60_000)}</x:row></x:sheetData></x:worksheet>`;
    expect(rejection(() => readWorkbook(withEntry(template, 'xl/worksheets/sheet3.xml', strToU8(prefixed))))).toBe('too_many_cells');
  });

  it('applies each new limit when it is lowered (part size, elements, rows, total XML, total elements)', () => {
    expect(reject(template, { maxPartXmlBytes: 10_000 })).toBe('part_too_large');
    expect(reject(template, { maxPartElements: 100 })).toBe('too_many_elements');
    expect(reject(template, { maxRowsPerSheet: 10 })).toBe('too_many_rows');
    expect(reject(template, { maxTotalXmlBytes: 20_000 })).toBe('total_xml_too_large');
    expect(reject(template, { maxTotalElements: 1500 })).toBe('too_many_elements');
    expect(reject(template)).toBeNull();
  });

  it('bounds the total XML parsed per package, not only each part', () => {
    // Five worksheets of 3.9 MiB each pass the part limit (4 MiB) and the inflated budget (48 MiB), not the 16 MiB total.
    const periods = [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-23' }] as const;
    const parts = ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml', 'xl/worksheets/sheet100.xml', 'xl/worksheets/sheet101.xml'];
    const entries = unpack(buildSyntheticWorkbook({ periods: [...periods] }));
    for (const part of parts) entries[part] = strToU8(paddedSheetXml(3.9 * MIB));
    expect(reject(pack(entries))).toBe('total_xml_too_large');
  });

  it('keeps the template and a realistic workbook of 60 dated sheets far inside every limit', () => {
    expect(reject(template)).toBeNull();
    const periods = Array.from({ length: 60 }, (_, index) => ({ payrollDate: addDays('2026-01-09', 14 * index) }));
    const bytes = buildSyntheticWorkbook({ periods });
    const preview = previewWorkbook(bytes);
    expect(preview.periods).toHaveLength(60);
    // Measured on this package: the largest part is about 29 KB and 1 400 elements; the limits are 4 MiB and 200 000.
    const workbook = readWorkbook(bytes);
    expect(workbook.inflatedBytes).toBeLessThan(DEFAULT_READER_LIMITS.maxTotalXmlBytes / 8);
  });

  it('refuses the 2.7 MB formula-heavy package of the audit (3 x 199 000 formula cells)', () => {
    const rows = Array.from({ length: 199_000 }, (_, index) => `<row r="${index + 1}"><c r="AA${index + 1}"><f>8.5</f></c></row>`).join('');
    const xml = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${rows}</sheetData></worksheet>`;
    const entries = unpack(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-23' }, { payrollDate: '2026-02-06' }] }));
    for (let index = 0; index < 3; index += 1) entries[`xl/worksheets/sheet${100 + index}.xml`] = strToU8(xml);
    const bytes = pack(entries);
    expect(bytes.length).toBeLessThan(3 * MIB);
    const outcome = timed(() => previewWorkbook(bytes));
    expect(outcome.code).toBe('part_too_large');
    expect(outcome.ms).toBeLessThan(3000);
  });

  it('caps the stored findings: the first sources of a finding plus a total count, whatever the cell count', () => {
    // 3 x 40 000 formula cells (2 000 rows of 20) fit every limit; before the fix they gave one source per cell.
    const rows = Array.from({ length: 2000 }, (_, row) => `<row r="${row + 1}">${Array.from({ length: 20 }, (_, col) => `<c r="${String.fromCharCode(65 + col)}${row + 1}"><f>8.5</f></c>`).join('')}</row>`).join('');
    const xml = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${rows}</sheetData></worksheet>`;
    const entries = unpack(buildSyntheticWorkbook({ periods: [{ payrollDate: '2026-01-09' }, { payrollDate: '2026-01-23' }, { payrollDate: '2026-02-06' }] }));
    for (let index = 0; index < 3; index += 1) entries[`xl/worksheets/sheet${100 + index}.xml`] = strToU8(xml);
    const preview = previewWorkbook(pack(entries));
    const hours = findings(preview, 'formula_hours_8_5').filter((finding) => finding.sourceCount >= 40_000); // the template's own sheet has 14
    expect(hours).toHaveLength(3);
    for (const finding of hours) expect(finding.sources).toHaveLength(MAX_FINDING_SOURCES);
    for (const finding of preview.findings) expect(finding.sources.length).toBeLessThanOrEqual(MAX_FINDING_SOURCES);
    expect(JSON.stringify(preview.findings).length).toBeLessThan(64 * 1024); // 12.2 MiB at 3 x 199 000 before the fix
  });

  it('keeps small findings whole: the count equals the listed sources', () => {
    const preview = previewWorkbook(readTemplateBytes());
    for (const finding of preview.findings) expect(finding.sourceCount).toBe(finding.sources.length);
  });

  it('collapses a flood of one kind of finding into a bounded list with a truthful summary', () => {
    const rows = Array.from({ length: 1500 }, (_, index) => `<row r="${index + 2}"><c r="A${index + 2}" t="inlineStr"><is><t>not a date</t></is></c></row>`).join('');
    const xml = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${rows}</sheetData></worksheet>`;
    const preview = previewWorkbook(withEntry(template, 'xl/worksheets/sheet2.xml', strToU8(xml)));
    const invalid = findings(preview, 'invalid_date_cell');
    expect(invalid.length).toBeLessThanOrEqual(MAX_FINDINGS_PER_CODE + 1);
    expect(invalid.reduce((sum, finding) => sum + finding.sourceCount, 0)).toBe(1500);
    expect(preview.summary.errors).toBe(1500);
    expect(preview.clean).toBe(false);
  });

  it('refuses a holiday table with more rows than any calendar has', () => {
    const rows = Array.from({ length: 2500 }, (_, index) => `<row r="${index + 2}"><c r="A${index + 2}"><v>46023</v></c><c r="B${index + 2}" t="inlineStr"><is><t>Day ${index}</t></is></c></row>`).join('');
    const xml = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${rows}</sheetData></worksheet>`;
    expect(rejection(() => previewWorkbook(withEntry(template, 'xl/worksheets/sheet2.xml', strToU8(xml))))).toBe('too_many_holidays');
  });
});

describe('Holiday Dates sheet inside the cell limit never crashes the mapping (WP4-B-02)', () => {
  const template = readTemplateBytes();
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

  function holidaySheet(rows: string): Uint8Array {
    const xml = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${rows}</sheetData></worksheet>`;
    return withEntry(template, 'xl/worksheets/sheet2.xml', strToU8(xml));
  }

  const RAISED: Partial<ReaderLimits> = { maxCellsPerSheet: 200_000, maxRowsPerSheet: 200_000, maxPartElements: 1_000_000, maxPartXmlBytes: 16 * MIB, maxTotalElements: 2_000_000 };

  it('previews a sheet of 150 000 cells in column C instead of overflowing the stack (the audit gave a 500)', () => {
    const rows = Array.from({ length: 150_000 }, (_, index) => `<row r="${index + 1}"><c r="C${index + 1}"><v>1</v></c></row>`).join('');
    const started = performance.now();
    const preview = previewWorkbook(holidaySheet(rows), RAISED);
    expect(preview.holidays).toEqual([]);
    expect(performance.now() - started).toBeLessThan(5000);
  });

  it('refuses the same sheet with a typed 422 reason under the default limits', () => {
    const cells = Array.from({ length: 150_000 }, () => '<c r="C1"/>').join('');
    expect(rejection(() => previewWorkbook(holidaySheet(`<row r="1">${cells}</row>`)))).toBe('too_many_cells');
  });

  it('reads a far sparse row without walking every row number before it', () => {
    const preview = previewWorkbook(holidaySheet('<row r="9999999"><c r="A9999999"><v>46023</v></c><c r="B9999999" t="inlineStr"><is><t>Far Day</t></is></c></row>'));
    expect(preview.holidays).toEqual([{ date: '2026-01-01', name: 'Far Day', floating: false, source: 'Holiday Dates!A9999999' }]);
  });

  /** A Holiday Dates sheet whose cell map counts every lookup, built without the reader. */
  function countingWorkbook(cells: Array<[string, string | number]>): { workbook: ReadWorkbook; lookups: () => number } {
    let lookups = 0;
    const map = new Map<string, ReadCell>();
    for (const [address, value] of cells) {
      map.set(address, {
        sheet: 'Holiday Dates',
        address,
        provenance: `Holiday Dates!${address}`,
        type: typeof value === 'number' ? 'number' : 'string',
        value,
        formula: null,
        cachedValue: null,
        cacheNote: null,
      });
    }
    const counting = new Map(map);
    const get = counting.get.bind(counting);
    counting.get = (key: string) => {
      lookups += 1;
      return get(key);
    };
    return {
      workbook: { sheets: [{ name: 'Holiday Dates', part: '', kind: 'worksheet', hidden: false, cells: counting }], notes: [], date1904: false, entryCount: 0, inflatedBytes: 0 },
      lookups: () => lookups,
    };
  }

  it('maps 150 000 cells without a spread over the cell list and without a loop up to the largest row', () => {
    const cells: Array<[string, string | number]> = [];
    for (let row = 1; row <= 150_000; row += 1) cells.push([`C${row}`, 1]);
    cells.push(['A9999999', 46023], ['B9999999', 'Far Day']);
    const { workbook, lookups } = countingWorkbook(cells);
    const preview = mapWorkbook(workbook, { sha256: '0'.repeat(64), bytes: 0 });
    expect(preview.holidays.map((holiday) => holiday.name)).toEqual(['Far Day']);
    // Only the rows that exist are looked at: a walk over 9 999 997 row numbers made about 20 million lookups.
    expect(lookups()).toBeLessThan(1000);
  });
});
