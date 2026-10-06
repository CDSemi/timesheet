import { strToU8 } from 'fflate';
import { afterAll, describe, expect, it } from 'vitest';
import { previewWorkbook, type Finding, type FindingCode, type WorkbookPreview } from '../../src/server/import/templateMapping.ts';
import { FORMULA_CACHE_NOTE, readWorkbook, WorkbookRejectedError, type ReaderLimits, type WorkbookRejectionCode } from '../../src/server/import/xlsxReader.ts';
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
    // The same lie against the default limits: the 64 MiB bomb is stopped at the 16 MiB per-entry cap.
    const big = patchEntry(withEntry(template, 'xl/sharedStrings.xml', new Uint8Array(64 * MIB)), 'xl/sharedStrings.xml', { uncompressedSize: 1000 });
    expect(big.length).toBeLessThan(200 * 1024);
    expect(reject(big)).toBe('entry_too_large');
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
