import fontkit from '@pdf-lib/fontkit';
import { decodePDFRawStream, PDFDict, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, datesBetween } from '../../src/domain/dates.ts';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { sealReviewSnapshot, type ReviewSnapshot, type SnapshotDay } from '../../src/domain/snapshot.ts';
import { startOfLocalDay } from '../../src/domain/zones.ts';
import { fitImage, fitText, formatHoursMinutes, pdfLayout, SIGNATURE_BOX, timesheetPdfFileName, wrapText } from '../../src/server/pdf/layout.ts';
import { PdfRenderError, renderTimesheetPdf, type TimesheetPdfInput } from '../../src/server/pdf/timesheetPdf.ts';
import { instantOfWallTime } from '../client/zoneOracle.ts';
import { makePng, readPdf, type PdfContent, type PdfTextItem } from '../support/pdfText.ts';

/*
 * WP3-T07 and WP3-T07B: the timesheet PDF renderer (AC-10, FR-11) and the automatic-submission
 * presentation (no automatic indicator, optional note line, image only when authorized). All data is synthetic; instants are derived
 * with the zone oracle (never a fixed offset); images are generated at test time and nothing is
 * written to disk. Expected strings are spelled out, never produced by the formatter under test.
 *
 * WP5-UX5-T02: the one-page redesign (header with the logo and the revision, two centred titles, Employee/Payroll Date/Period,
 * two week tables with a rotated left column, the overtime total, two signature rows and the copyright footer) and the
 * Indie Flower category cells with their DejaVu Serif Italic fallback. Geometry comes from the pure `pdfLayout` and is
 * unit-tested against plan Addendum 2 in pdf-layout.test.ts; here the text and positions read back from real PDFs are checked.
 */

const ZONE = 'America/Los_Angeles';
const START = '2026-09-14'; // Monday; Sundays are 2026-09-20 and 2026-09-27.
const DATES = datesBetween(START, '2026-09-27');
const US_DATES = [
  '09/14/2026', '09/15/2026', '09/16/2026', '09/17/2026', '09/18/2026', '09/19/2026', '09/20/2026',
  '09/21/2026', '09/22/2026', '09/23/2026', '09/24/2026', '09/25/2026', '09/26/2026', '09/27/2026',
];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const utc = (date: string, time: string): string => instantOfWallTime(date, time, ZONE).replace('.000Z', 'Z');
/** Code points keep these files ASCII whatever tool wrote them. */
const text = (...codePoints: number[]): string => String.fromCodePoint(...codePoints);
// "Nguyen Van Anh Dat" with Vietnamese diacritics (e-tilde, a-breve, A-acute, D-stroke, a-dot-below).
const VIETNAMESE_NAME = `Nguy${text(0x1ec5)}n V${text(0x103)}n ${text(0xc1)}nh ${text(0x110)}${text(0x1ea1)}t`;
const VIETNAMESE_HOLIDAY = `Qu${text(0x1ed1)}c kh${text(0xe1, 0x6e, 0x68)} ${text(0x111)}${text(0x1ea1)}i l${text(0x1ec5)}`;

function weekday(date: string, overrides: Partial<SnapshotDay> = {}): SnapshotDay {
  return {
    work_date: date,
    day_class: 'normal',
    day_class_reason: null,
    holiday_name: null,
    calendar_version_id: 'cv-1',
    category: 'Worked',
    category_source: 'default',
    attendance_expected: true,
    wfh: false,
    notes: 'private note that must not be printed',
    leave_minutes: 0,
    leave_kind: null,
    ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    sessions: [
      {
        id: `s-${date}`,
        start_utc: utc(date, '08:30'),
        end_utc: utc(date, '17:15'),
        source: 'manual',
        breaks_confirmed: true,
        breaks: [],
      },
    ],
    completeness: 'complete',
    policy_version_id: 'pv-1',
    calculation: { regular_minutes: 480, nonworking_minutes: 0, normal_excess_minutes: 0, eligible_minutes: 0, credited_minutes: 0 },
    calculation_error: null,
    ...overrides,
  };
}

function offDay(date: string, credited: number | null): SnapshotDay {
  return weekday(date, {
    day_class: 'nonworking',
    category: 'Off',
    attendance_expected: false,
    sessions: credited === null ? [] : weekday(date).sessions,
    completeness: credited === null ? 'no_records' : 'complete',
    calculation: credited === null ? null : { regular_minutes: 0, nonworking_minutes: credited, normal_excess_minutes: 0, eligible_minutes: credited, credited_minutes: credited },
  });
}

/** OT only on the two Sundays: 2:15 (135 minutes) and 1:00 (60 minutes), total 3:15. */
function snapshotWith(overrides: Partial<ReviewSnapshot> = {}, days?: SnapshotDay[]): ReviewSnapshot {
  const built =
    days ??
    DATES.map((date, index) => {
      if (date === '2026-09-20') return offDay(date, 135);
      if (date === '2026-09-27') return offDay(date, 60);
      if (index === 5 || index === 12) return offDay(date, null);
      return weekday(date);
    });
  const credited = built.reduce((sum, day) => sum + (day.completeness === 'complete' ? (day.calculation?.credited_minutes ?? 0) : 0), 0);
  return {
    schema: 'timesheet-review',
    schema_version: 2,
    employee: { name: 'Alex Example' },
    period: {
      payroll_date: '2026-10-02',
      nominal_payroll_date: '2026-10-02',
      period_start: START,
      period_end: '2026-09-27',
      due_local_date: '2026-09-29',
      due_local_time: '17:00',
      due_at_utc: utc('2026-09-29', '17:00'),
      is_exception: false,
    },
    reporting_zone: ZONE,
    submission: { id: 'TS-2026-10-02-0123456789', revision_no: 1, sign_off_status: 'Submitted' },
    timesheet: { finalized_revision_no: null },
    calendar: { id: 'cal-1', version_ids: ['cv-1'] },
    policy: { version_ids: ['pv-1'] },
    days: built,
    totals: { credited_minutes: credited, pending_days: 0 },
    ot_proposals: [],
    deficit_proposals: [],
    unresolved_inputs: [],
    ot_leave_reservations: [],
    recipients: { to: ['payroll@example.invalid'], cc: [], subject: 's', body_text: 'b', body_html: '<p>b</p>', template_version: 1 },
    signature: null,
    auto_image: { authorized: false, attachment_id: null },
    auto_note: { enabled: false, text: 'Automatic submission' },
    show_ot_on_pdf: true,
    ...overrides,
  };
}

const SIGN_INSTANT = utc('2026-10-07', '22:30');
const SIGN_DATE = '10/07/2026';

/** A manual revision: the stored sign-off name and instant (required) and the validated image (optional, F-5 b). */
function manual(overrides: Partial<TimesheetPdfInput> = {}): TimesheetPdfInput {
  const snapshot = overrides.snapshot ?? snapshotWith();
  return {
    snapshot,
    submissionId: 'TS-2026-10-02-0123456789',
    revisionNo: 1,
    origin: 'manual',
    signedAt: SIGN_INSTANT,
    automaticSubmittedAt: null,
    signerName: snapshot.employee.name,
    signatureImage: makePng(120, 40),
    ...overrides,
  };
}

/** An automatic revision: no sign-off instant, the submission instant, the employee name, no image unless given. */
function automatic(overrides: Partial<TimesheetPdfInput> = {}): TimesheetPdfInput {
  const snapshot = overrides.snapshot ?? snapshotWith();
  return {
    snapshot,
    submissionId: 'TS-2026-10-02-0123456789',
    revisionNo: 1,
    origin: 'automatic',
    signedAt: null,
    automaticSubmittedAt: SIGN_INSTANT,
    signerName: snapshot.employee.name,
    signatureImage: null,
    ...overrides,
  };
}

async function render(input: TimesheetPdfInput): Promise<{ bytes: Uint8Array; content: PdfContent }> {
  const bytes = await renderTimesheetPdf(input);
  return { bytes, content: await readPdf(bytes) };
}

const dateMatches = (content: PdfContent): string[] => content.text.match(/\d{2}\/\d{2}\/\d{4}/g) ?? [];

/* ---- helpers that read the page back through the pure layout ---- */
const FULL = pdfLayout({ timeRows: true, otRows: true });
const PAGE_HEIGHT = 792;
type Band = 'head' | 'category' | 'time' | 'ot';

/** Items whose baseline lies in a band of a week table (top coordinates of the layout, flipped to the PDF's y) and column. */
function bandItems(items: PdfTextItem[], layout: ReturnType<typeof pdfLayout>, weekIndex: 0 | 1, band: Band, column: number | 'left'): PdfTextItem[] {
  const week = layout.weeks[weekIndex];
  const box = week[band];
  if (box === null) return [];
  const yLow = PAGE_HEIGHT - (box.top + box.height);
  const yHigh = PAGE_HEIGHT - box.top;
  const xLow = column === 'left' ? week.left : week.daysLeft + column * week.dayWidth;
  const xHigh = column === 'left' ? week.daysLeft : xLow + week.dayWidth;
  return items.filter((item) => item.y > yLow && item.y < yHigh && item.x >= xLow - 0.5 && item.x < xHigh).sort((a, b) => b.y - a.y || a.x - b.x);
}

/** The text of a cell: its items in reading order, joined without spaces (small capitals are drawn as several runs). */
const cellText = (items: PdfTextItem[]): string => items.map((item) => item.text).join('').replace(/\s+/g, '');

/** What the PDF's operators show: clip paths, filled paths and images of page 1. */
async function pageOperators(bytes: Uint8Array): Promise<{ clip: number; paths: number; images: number }> {
  const task = getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const list = await page.getOperatorList();
    const count = (code: number): number => list.fnArray.filter((fn) => fn === code).length;
    return { clip: count(OPS.clip), paths: count(OPS.constructPath), images: count(OPS.paintImageXObject) };
  } finally {
    await task.destroy();
  }
}

/** How many rectangles page 1 fills with each colour (lower-case hex), read from the operator list. */
async function fillCounts(bytes: Uint8Array): Promise<Map<string, number>> {
  const task = getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const list = await page.getOperatorList();
    const counts = new Map<string, number>();
    let color = '';
    list.fnArray.forEach((fn, index) => {
      const args = list.argsArray[index] as unknown;
      // pdfjs merges a path and its paint operator into constructPath [paintOperator, ...]; a colour is "#rrggbb".
      if (fn === OPS.setFillRGBColor && Array.isArray(args)) {
        color = String((args as unknown[])[0]);
      } else if (fn === OPS.constructPath && Array.isArray(args) && args[0] === OPS.fillStroke) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
      }
    });
    return counts;
  } finally {
    await task.destroy();
  }
}

/** The embedded font programs by name with the number of glyphs of each subset (read with pdf-lib and fontkit). */
async function embeddedFonts(bytes: Uint8Array): Promise<Map<string, number>> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const result = new Map<string, number>();
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue;
    const name = object.get(PDFName.of('FontName'));
    const file = object.lookup(PDFName.of('FontFile2'));
    if (name === undefined || !(file instanceof PDFRawStream)) continue;
    const program = decodePDFRawStream(file).decode();
    result.set(name.toString().replace(/^\//, ''), fontkit.create(Buffer.from(program)).numGlyphs);
  }
  return result;
}

const textItems = (content: PdfContent): PdfTextItem[] => content.pages[0]?.items ?? [];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('layout helpers', () => {
  it('formats minutes as h:mm and never as decimal hours', () => {
    expect(formatHoursMinutes(0)).toBe('0:00');
    expect(formatHoursMinutes(5)).toBe('0:05');
    expect(formatHoursMinutes(59)).toBe('0:59');
    expect(formatHoursMinutes(60)).toBe('1:00');
    expect(formatHoursMinutes(135)).toBe('2:15');
    expect(formatHoursMinutes(195)).toBe('3:15');
    expect(formatHoursMinutes(600)).toBe('10:00');
    expect(formatHoursMinutes(1439)).toBe('23:59');
    expect(() => formatHoursMinutes(-1)).toThrow(PdfRenderError);
    expect(() => formatHoursMinutes(1.5)).toThrow(PdfRenderError);
    expect(() => formatHoursMinutes(Number.NaN)).toThrow(PdfRenderError);
  });

  it('keeps the signature image inside the box with its aspect ratio', () => {
    for (const [width, height] of [[40, 400], [800, 20], [210, 54], [1, 1], [5000, 3000], [3, 2000]] as const) {
      const placed = fitImage(width, height, SIGNATURE_BOX.width, SIGNATURE_BOX.height);
      expect(placed.width).toBeLessThanOrEqual(SIGNATURE_BOX.width + 1e-9);
      expect(placed.height).toBeLessThanOrEqual(SIGNATURE_BOX.height + 1e-9);
      expect(placed.width / placed.height).toBeCloseTo(width / height, 6);
      expect(Math.max(placed.width / SIGNATURE_BOX.width, placed.height / SIGNATURE_BOX.height)).toBeCloseTo(1, 6);
    }
    expect(() => fitImage(0, 10, 100, 50)).toThrow(PdfRenderError);
  });

  it('wraps long words and shrinks, then cuts with an ellipsis, inside the width', () => {
    const measure = (value: string, size: number): number => value.length * size * 0.5;
    const wrapped = wrapText('alpha beta gamma delta', 10, 40, measure);
    expect(wrapped).toEqual(['alpha', 'beta', 'gamma', 'delta']);
    const long = wrapText('x'.repeat(40), 10, 50, measure);
    expect(long.length).toBeGreaterThan(1);
    expect(long.every((line) => measure(line, 10) <= 50)).toBe(true);
    const shrunk = fitText('alpha beta gamma delta', 10, 5, 40, 2, measure);
    expect(shrunk.size).toBeLessThan(10);
    expect(shrunk.lines.length).toBeLessThanOrEqual(2);
    const cut = fitText('x'.repeat(400), 8, 5, 40, 2, measure);
    expect(cut.truncated).toBe(true);
    expect(cut.lines.every((line) => measure(line, cut.size) <= 40)).toBe(true);
  });
});

describe('timesheet PDF content', () => {
  it('draws the header, employee, payroll date and the 14 dates in two Monday-Sunday blocks', async () => {
    const { content } = await render(manual());
    expect(content.pages).toHaveLength(1);
    expect(content.pages[0]?.width).toBe(612);
    expect(content.pages[0]?.height).toBe(792);
    expect(content.text).toContain('C&D Semiconductor Services, Inc.');
    expect(content.text).toContain('TIME SHEET FOR SALARIED EXEMPT EMPLOYEES');
    expect(content.text).toContain('Employee: Alex Example');
    expect(content.text).toContain('Payroll Date: 10/02/2026');
    expect(content.text).toContain('Period: 09/14/2026 - 09/27/2026');
    const items = content.pages[0]?.items.map((item) => item.text) ?? [];
    for (const date of US_DATES) expect(items.filter((item) => item === date), date).toHaveLength(1);
    // Day names are bold simulated small capitals (a full-size first letter, then the rest smaller): read per column.
    for (const weekIndex of [0, 1] as const) {
      WEEKDAYS.forEach((name, column) => {
        const head = bandItems(textItems(content), FULL, weekIndex, 'head', column).filter((item) => !/\d/.test(item.text));
        expect(cellText(head), `week ${weekIndex + 1} column ${column}`).toBe(name.toUpperCase());
        expect(head[0]?.height, 'first letter size').toBeGreaterThan(head[1]?.height ?? 99);
      });
    }
    expect(items.filter((item) => item === 'WEEK')).toHaveLength(2);
    expect(items.filter((item) => item === '1' || item === '2').sort()).toEqual(['1', '2']);
    expect(items.filter((item) => item === 'Worked').length).toBeGreaterThan(0);
    expect(items).toContain('Off');
    expect(items).toContain('08:30');
    expect(items).toContain('17:15');
  });

  it('puts "Revision n" and the submission id on the header line, right-aligned, the id below and smaller, and no instructions anywhere', async () => {
    const { content } = await render(manual({ revisionNo: 3 }));
    const items = textItems(content);
    const revision = items.find((item) => item.text === 'Revision 3');
    const id = items.find((item) => item.text === 'TS-2026-10-02-0123456789');
    expect(revision).toBeDefined();
    expect(id).toBeDefined();
    expect(revision?.y).toBeGreaterThan(PAGE_HEIGHT - 60); // on the header line, above the titles
    expect(id?.y).toBeLessThan(revision?.y ?? 0);
    expect(id?.height).toBeLessThan(revision?.height ?? 0);
    expect((revision?.x ?? 0) + (revision?.width ?? 0)).toBeCloseTo(612 - 36, 0);
    expect((id?.x ?? 0) + (id?.width ?? 0)).toBeCloseTo(612 - 36, 0);
    // The company name on the header line is the drawn wordmark, not text; the title is larger than anything else on top.
    const company = items.find((item) => item.text === 'C&D Semiconductor Services, Inc.');
    expect(company?.y).toBeLessThan(revision?.y ?? 0);
    expect(items.filter((item) => item.y > PAGE_HEIGHT - 60).map((item) => item.text).sort()).toEqual(['Revision 3', 'TS-2026-10-02-0123456789']);
    expect(content.text).not.toMatch(/manual|automatic|sign-off/i);
    // F-8 a: no instructions paragraph. Nothing sits between the second title and the Employee line, and no such word is printed.
    expect(content.text).not.toMatch(/instruction|please|complete this|must be/i);
    const title = items.find((item) => item.text === 'TIME SHEET FOR SALARIED EXEMPT EMPLOYEES');
    const employee = items.find((item) => item.text === 'Employee:');
    const between = items.filter((item) => item.y < (title?.y ?? 0) - 1 && item.y > (employee?.y ?? 1e9) + 1);
    expect(between.map((item) => item.text)).toEqual([]);
  });

  it('draws the C&D logo and the wordmark as vectors on the header line (a clip path, filled outlines, no raster image)', async () => {
    const bytes = await renderTimesheetPdf(manual({ signatureImage: null }));
    const operators = await pageOperators(bytes);
    expect(operators.clip).toBeGreaterThanOrEqual(1);
    expect(operators.paths).toBeGreaterThan(40); // the disc, 16 stripes, three lettering outlines, two wordmark paths and the table
    expect(operators.images).toBe(0);
  });

  it('prints the copyright footer on the left with the year of the payroll date and the internal-use notice on the right, nothing else', async () => {
    const { content } = await render(manual());
    const items = textItems(content);
    const left = items.find((item) => item.text === '© 2026 C&D Semiconductor Services, Inc. All rights reserved.');
    const right = items.find((item) => item.text === 'Internal use by C&D only');
    expect(left).toBeDefined();
    expect(right).toBeDefined();
    expect(left?.x).toBeCloseTo(36, 0);
    expect((right?.x ?? 0) + (right?.width ?? 0)).toBeCloseTo(612 - 36, 0);
    expect(left?.y).toBeCloseTo(right?.y ?? 0, 0);
    expect(left?.y).toBeGreaterThan(PAGE_HEIGHT - 756 - 1); // above the bottom margin
    expect(items.filter((item) => item.y < 60).map((item) => item.text)).toEqual([left?.text, right?.text]);
  });

  it('takes the footer year from the payroll date, not from the clock', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); // only the clock; the PDF reader keeps its timers
    vi.setSystemTime(new Date('2031-03-05T23:59:59Z'));
    const snapshot = snapshotWith();
    const later = snapshotWith({ period: { ...snapshot.period, payroll_date: '2029-10-05' } });
    const { content } = await render(manual({ snapshot: later }));
    expect(content.text).toContain('© 2029 C&D Semiconductor Services, Inc. All rights reserved.');
    expect(content.text).not.toContain('© 2031');
    expect(content.text).not.toContain('© 2026');
  });

  it('tints the Saturday, Sunday and holiday headers and greys their bodies from the server calendar, and no other day', async () => {
    const days = snapshotWith().days.map((day) => (day.work_date === '2026-09-16' ? weekday(day.work_date, { category: 'Holiday', holiday_name: 'Founders Day', day_class: 'nonworking' }) : day));
    const bytes = await renderTimesheetPdf(manual({ snapshot: snapshotWith({}, days) }));
    // The fixture's non-working days are 09/16 (holiday), the Saturdays (Off) and the Sundays: five columns. Each has a
    // peach header cell and four grey body cells (category, two time halves, OT); every other cell is white or head grey.
    const fills = await fillCounts(bytes);
    expect(fills.get('#fce3cc')).toBe(5);
    expect(fills.get('#ebebeb')).toBe(5 * 4);
    expect(fills.get('#ebedf0')).toBe(9); // the nine ordinary day headers
    const { content } = await render(manual({ snapshot: snapshotWith({}, days) }));
    expect(textItems(content).filter((item) => item.text === 'Founders Day')).toHaveLength(1);
  });

  it('totals the credited minutes of all 14 days with OT only on the two Sundays', async () => {
    const snapshot = snapshotWith();
    expect(snapshot.totals.credited_minutes).toBe(195);
    const credited = snapshot.days.filter((day) => (day.calculation?.credited_minutes ?? 0) > 0).map((day) => day.work_date);
    expect(credited).toEqual(['2026-09-20', '2026-09-27']);
    const { content } = await render(manual({ snapshot }));
    // "OVERTIME TOTAL : 3:15 H:MM" in small capitals, right-aligned 35 pt inside the table edge (runs of several sizes).
    const total = textItems(content).filter((item) => Math.abs(item.y - (PAGE_HEIGHT - FULL.total.baseline)) < 0.5 && item.x > 300);
    expect(cellText(total)).toBe('OVERTIMETOTAL:3:15H:MM');
    const last = total[total.length - 1];
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeCloseTo(FULL.total.rightEdge, 0);
    const cells = ([0, 1] as const).flatMap((weekIndex) => WEEKDAYS.map((_, column) => cellText(bandItems(textItems(content), FULL, weekIndex, 'ot', column))));
    expect(cells).toEqual(['0:00', '0:00', '0:00', '0:00', '0:00', '', '2:15', '0:00', '0:00', '0:00', '0:00', '0:00', '', '1:00']);
    expect(textItems(content).filter((item) => item.text === 'OT')).toHaveLength(2); // the rotated labels
  });

  it('prints OT as h:mm only, with no decimal hours anywhere', async () => {
    const { content } = await render(manual());
    expect(content.text).not.toMatch(/\d\.\d/);
    expect(content.text).toContain('2:15');
    expect(content.text).toContain('1:00');
  });

  it('hides the OT rows and the total when Show OT on PDF is off', async () => {
    const off = (await render(manual({ snapshot: snapshotWith({ show_ot_on_pdf: false }) }))).content;
    expect(textItems(off).filter((item) => item.text === 'OT')).toHaveLength(0);
    expect(off.text).not.toContain('VERTIME');
    expect(off.text).not.toContain('2:15');
    expect(off.text).not.toContain('3:15');
    expect(off.text).toContain('WEEK');
    const on = (await render(manual())).content;
    expect(textItems(on).filter((item) => item.text === 'OT')).toHaveLength(2);
    expect(on.text).toContain('VERTIME');
  });

  // WP5-UX5-T01b (owner decision F-3 b): the time rows and the OT rows are chosen for each send. Every variant is one
  // page of the same signed snapshot; only the chosen rows are left out, and the omitted switch keeps the old default.
  it('prints or omits the time rows and the OT rows per variant, each on one page, from the same snapshot', async () => {
    const snapshot = snapshotWith({ show_ot_on_pdf: true });
    const byVariant = new Map<string, PdfContent>();
    for (const time of [true, false]) {
      for (const ot of [true, false]) {
        const { content } = await render(manual({ snapshot, rows: { time, ot } }));
        expect(content.pages, `time ${time} ot ${ot}`).toHaveLength(1);
        const items = textItems(content);
        expect(items.some((item) => item.text === '08:30'), `time ${time} ot ${ot}`).toBe(time);
        expect(items.filter((item) => item.text === 'OT').length, `time ${time} ot ${ot}`).toBe(ot ? 2 : 0);
        expect(content.text.includes('VERTIME'), `time ${time} ot ${ot}`).toBe(ot);
        // The signed facts stay on every variant: the name, the dates, the categories, WEEK and the footer.
        expect(items.filter((item) => item.text === 'WEEK')).toHaveLength(2);
        expect(items.filter((item) => item.text === 'Worked').length).toBeGreaterThan(8);
        expect(content.text).toContain('Internal use by C&D only');
        expect(dateMatches(content).length).toBeGreaterThanOrEqual(14);
        // The table height never changes with the rows: a hidden row's height goes to the category row.
        const layout = pdfLayout({ timeRows: time, otRows: ot });
        expect(layout.weeks[1].bottom - layout.weeks[1].top).toBe(136);
        byVariant.set(`${time}:${ot}`, content);
      }
    }
    // Without a choice the renderer prints the time rows and follows the snapshot's OT switch (the sign-off variant).
    const plain = (await render(manual({ snapshot }))).content;
    expect(plain.text).toBe(byVariant.get('true:true')?.text);
    const offSnapshot = (await render(manual({ snapshot: snapshotWith({ show_ot_on_pdf: false }) }))).content;
    expect(offSnapshot.text.includes('VERTIME')).toBe(false);
    // A send's choice wins over the snapshot's OT switch in both directions.
    const forcedOn = (await render(manual({ snapshot: snapshotWith({ show_ot_on_pdf: false }), rows: { time: true, ot: true } }))).content;
    expect(forcedOn.text).toContain('VERTIME');
  });

  it('keeps four sessions a day with long labels on one page in every variant, every text inside its band above the bottom margin', async () => {
    const times = [['06:00', '08:30'], ['09:00', '11:30'], ['12:00', '14:30'], ['15:00', '17:30']] as const;
    const days = DATES.map((date) =>
      weekday(date, {
        category: 'Holiday',
        holiday_name: 'Independence-Day-observed-by-the-company '.repeat(3),
        sessions: times.map(([from, to], index) => ({ id: `m${index}-${date}`, start_utc: utc(date, from), end_utc: utc(date, to), source: 'manual' as const, breaks_confirmed: true, breaks: [] })),
      }),
    );
    for (const time of [true, false]) {
      for (const ot of [true, false]) {
        const { content } = await render(manual({ snapshot: snapshotWith({}, days), rows: { time, ot } }));
        expect(content.pages, `time ${time} ot ${ot}`).toHaveLength(1);
        const lowest = Math.min(...textItems(content).map((item) => item.y));
        expect(lowest, `time ${time} ot ${ot}`).toBeGreaterThanOrEqual(PAGE_HEIGHT - 756 - 0.5);
      }
    }
  });

  it('stacks the sessions of a day in rows of start and end cells, with "+n more" after three when there are more than four', async () => {
    const make = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        id: `q${count}-${index}`,
        start_utc: utc('2026-09-16', `${String(6 + index * 2).padStart(2, '0')}:00`),
        end_utc: utc('2026-09-16', `${String(6 + index * 2).padStart(2, '0')}:45`),
        source: 'manual' as const,
        breaks_confirmed: true,
        breaks: [],
      }));
    const days = (count: number) => DATES.map((date) => (date === '2026-09-16' ? weekday(date, { sessions: make(count) }) : weekday(date)));
    const three = (await render(manual({ snapshot: snapshotWith({}, days(3)) }))).content;
    const layout = pdfLayout({ timeRows: true, otRows: true, sessionLines: 3 });
    const column = bandItems(textItems(three), layout, 0, 'time', 2).map((item) => item.text);
    expect(column).toEqual(['06:00', '06:45', '08:00', '08:45', '10:00', '10:45']);
    const five = (await render(manual({ snapshot: snapshotWith({}, days(5)) }))).content;
    const stacked = bandItems(textItems(five), pdfLayout({ timeRows: true, otRows: true, sessionLines: 4 }), 0, 'time', 2).map((item) => item.text);
    expect(stacked).toEqual(['06:00', '06:45', '08:00', '08:45', '10:00', '10:45', '+2 more']);
  });

  it('marks days with incomplete OT as pending and says they are outside the total', async () => {
    const days = DATES.map((date) => (date === '2026-09-16' ? weekday(date, { completeness: 'incomplete', calculation: null }) : weekday(date)));
    const snapshot = snapshotWith({}, days);
    snapshot.totals.pending_days = 1;
    const { content } = await render(manual({ snapshot }));
    expect(content.text).toContain('pending');
    expect(content.text).toContain('1 day(s) with OT pending are not in the total.');
  });

  it('prints Vietnamese text intact with an embedded Unicode font', async () => {
    const days = DATES.map((date) => (date === '2026-09-15' ? weekday(date, { category: 'Holiday', holiday_name: VIETNAMESE_HOLIDAY }) : weekday(date)));
    const { content, bytes } = await render(manual({ snapshot: snapshotWith({ employee: { name: VIETNAMESE_NAME } }, days) }));
    expect(content.text).toContain(`Employee: ${VIETNAMESE_NAME}`);
    expect(content.lines.filter((line) => line.includes(VIETNAMESE_NAME)).length).toBeGreaterThanOrEqual(2); // header and signature name
    expect(content.text).toContain(VIETNAMESE_HOLIDAY.split(' ')[0] ?? 'missing');
    expect(Buffer.from(bytes).toString('latin1')).toContain('DejaVuSans');
  });

  it('replaces characters the font cannot draw and control characters instead of failing', async () => {
    const odd = `Odd${text(0x4e2d)}Name${text(0x202e)}${text(0x0a)}Line`;
    const { content } = await render(manual({ snapshot: snapshotWith({ employee: { name: odd } }) }));
    expect(content.text).toContain('Employee: Odd?Name Line');
  });

  it('keeps private notes out of the PDF', async () => {
    const { content } = await render(manual());
    expect(content.text).not.toContain('private note');
  });
});

describe('sign-off and review state', () => {
  it('prints the signer name and the real sign date (reporting zone) for a manual revision', async () => {
    const { content } = await render(manual());
    expect(dateMatches(content)).toContain(SIGN_DATE);
    const page = content.pages[0];
    const signDate = page?.items.find((item) => item.text === SIGN_DATE);
    expect(signDate?.x).toBeGreaterThan(400);
    expect(content.text).not.toContain('Employee review pending');
    expect(content.text).toContain('Employee Signature');
    expect(content.text).toContain('Manager Signature');
    // payroll date, period start and end, 14 day dates and the sign date; the manager date is blank.
    expect(dateMatches(content)).toHaveLength(18);
    const labels = (page?.items ?? []).filter((item) => item.text === 'Date' && item.x > 400);
    expect(labels).toHaveLength(2);
  });

  it('prints the stored sign-off name (not the profile name) under the signature line of a manual revision', async () => {
    const { content } = await render(manual({ signerName: 'Dr. Sam Q. Signer' }));
    const page = content.pages[0];
    const signer = page?.items.find((item) => item.text === 'Dr. Sam Q. Signer');
    const label = page?.items.find((item) => item.text === 'Employee Signature');
    expect(signer).toBeDefined();
    expect(signer?.y).toBeGreaterThan(label?.y ?? 0); // above the signature line, the caption sits under it
    expect(content.text).toContain('Employee: Alex Example'); // the header keeps the employee name of the snapshot
    expect(content.lines.filter((line) => line.includes('Alex Example'))).toHaveLength(1);
    expect(content.lines.filter((line) => line.includes('Dr. Sam Q. Signer'))).toHaveLength(1);
  });

  it('refuses a manual revision without a sign-off instant or a name, and one that carries an automatic instant', async () => {
    await expect(renderTimesheetPdf(manual({ signedAt: null }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ signerName: '   ' }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ automaticSubmittedAt: SIGN_INSTANT }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ signedAt: '2026-10-07 22:30' }))).rejects.toThrow();
  });

  it('prints a manual revision without a saved image with the name alone: no picture, the name and the real sign date (F-5 b)', async () => {
    const { content } = await render(manual({ signatureImage: null }));
    expect(content.pages[0]?.images).toHaveLength(0);
    const names = textItems(content).filter((item) => item.text === 'Alex Example' && item.y < 300);
    expect(names).toHaveLength(1);
    expect(names[0]?.x).toBeCloseTo(55 + 4, 0); // at the start of the signature line
    expect(content.text).toContain('Employee Signature');
    expect(content.text).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('prints a manual revision with a saved image as the image above the line and the name beside it', async () => {
    const { content } = await render(manual({ signatureImage: makePng(300, 100) }));
    const image = content.pages[0]?.images[0];
    expect(content.pages[0]?.images).toHaveLength(1);
    const name = textItems(content).find((item) => item.text === 'Alex Example' && item.y < 300);
    const line = pdfLayout({ timeRows: true, otRows: true }).signature.employeeLine;
    expect(image?.y).toBeGreaterThanOrEqual(PAGE_HEIGHT - line.y - 0.01); // bottom of the image on or above the line
    expect(name?.x).toBeGreaterThan((image?.x ?? 0) + (image?.width ?? 0)); // the name stands beside the picture
  });

  it('refuses an automatic revision that has a sign-off instant or no submission instant', async () => {
    await expect(renderTimesheetPdf(automatic({ signedAt: SIGN_INSTANT }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(automatic({ automaticSubmittedAt: null }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(automatic({ signerName: '' }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(automatic({ automaticSubmittedAt: '2026-10-07 22:30' }))).rejects.toThrow();
  });
});

describe('automatic submission presentation (owner decision 2026-10-04)', () => {
  // "Nop tu dong theo lich" with Vietnamese diacritics, built from code points.
  const NOTE_VI = `N${text(0x1ed9)}p t${text(0x1ef1)} ${text(0x111)}${text(0x1ed9)}ng theo l${text(0x1ecb)}ch`;
  const withNote = (enabled: boolean, noteText = NOTE_VI): ReviewSnapshot => snapshotWith({ auto_note: { enabled, text: noteText } });

  it('with the note off carries no automatic indicator, no pending wording and no note text, but the name and the date', async () => {
    const { content, bytes } = await render(automatic({ snapshot: withNote(false) }));
    const lower = content.text.toLowerCase();
    for (const word of ['automatic', 'pending', 'review', 'unsigned', 'not been', 'system']) expect(lower, word).not.toContain(word);
    expect(content.text).not.toContain(NOTE_VI);
    const raw = Buffer.from(bytes).toString('latin1').toLowerCase();
    expect(raw).not.toContain('automatic');
    expect(raw).not.toContain('pending');
    expect(JSON.stringify(content.info).toLowerCase()).not.toContain('automatic');
    // The signature block prints the employee name and the submission date.
    const page = content.pages[0];
    const label = page?.items.find((item) => item.text === 'Employee Signature');
    const name = (page?.items ?? []).filter((item) => item.text === 'Alex Example' && item.y > (label?.y ?? 0) && item.y < 300);
    expect(name).toHaveLength(1);
    const date = page?.items.find((item) => item.text === SIGN_DATE);
    expect(date?.x).toBeGreaterThan(400);
    expect(dateMatches(content)).toHaveLength(18);
  });

  it('has exactly the extracted text and layout of the manual PDF for the same snapshot, name and date (image aside)', async () => {
    const manualPdf = await render(manual());
    const plain = await render(automatic());
    const authorized = snapshotWith({ auto_image: { authorized: true, attachment_id: 'att-1' } });
    const withImage = await render(automatic({ snapshot: authorized, signatureImage: makePng(120, 40) }));
    expect(plain.content.text).toBe(manualPdf.content.text);
    // Without an image the printed name starts at the line (F-5 b); with one it stands beside the picture, as in the manual PDF.
    const withoutSigner = (items: PdfTextItem[] | undefined) => (items ?? []).filter((item) => !(item.text === 'Alex Example' && item.y < 300));
    expect(withoutSigner(plain.content.pages[0]?.items)).toEqual(withoutSigner(manualPdf.content.pages[0]?.items));
    expect(withImage.content.text).toBe(manualPdf.content.text);
    expect(withImage.content.pages[0]?.items).toEqual(manualPdf.content.pages[0]?.items);
    expect(plain.content.pages[0]?.images).toHaveLength(0);
    expect(withImage.content.pages[0]?.images).toHaveLength(1);
    expect(manualPdf.content.pages[0]?.images).toHaveLength(1);
    expect(plain.content.info).toEqual(manualPdf.content.info);
  });

  it('with the note on shows the custom Vietnamese text once, on its own line between the title and the employee', async () => {
    const { content } = await render(automatic({ snapshot: withNote(true) }));
    const page = content.pages[0];
    const items = page?.items.filter((item) => item.text === NOTE_VI) ?? [];
    expect(items).toHaveLength(1);
    expect(content.lines.filter((line) => line === NOTE_VI)).toHaveLength(1);
    const title = page?.items.find((item) => item.text === 'TIME SHEET FOR SALARIED EXEMPT EMPLOYEES');
    const employee = page?.items.find((item) => item.text === 'Employee:');
    expect(items[0]?.y).toBeLessThan(title?.y ?? 0);
    expect(items[0]?.y).toBeGreaterThan(employee?.y ?? 1e9);
    expect(content.text.toLowerCase()).not.toContain('pending');
    expect(content.text.toLowerCase()).not.toContain('review');
    // Everything else of the page is the note-off PDF.
    const off = await render(automatic({ snapshot: withNote(false) }));
    expect(content.lines.filter((line) => line !== NOTE_VI).length).toBe(off.content.lines.length);
    expect(content.lines.filter((line) => line !== NOTE_VI)).toEqual(off.content.lines);
  });

  it('keeps a 120-character note on one line inside the margins', async () => {
    const long = `${NOTE_VI} `.repeat(6).trim().slice(0, 120).trim();
    expect(long.length).toBeGreaterThan(100);
    const { content } = await render(automatic({ snapshot: withNote(true, long) }));
    const page = content.pages[0];
    const noteItems = (page?.items ?? []).filter((item) => item.text.startsWith(NOTE_VI.slice(0, 8)));
    expect(noteItems).toHaveLength(1);
    for (const item of noteItems) {
      expect(item.x).toBeGreaterThanOrEqual(36 - 0.5);
      expect(item.x + item.width).toBeLessThanOrEqual(612 - 36 + 0.5);
    }
  });

  it('ignores the note on a manual revision', async () => {
    const plain = await render(manual());
    const noted = await render(manual({ snapshot: withNote(true) }));
    expect(noted.content.text).toBe(plain.content.text);
    expect(noted.content.text).not.toContain(NOTE_VI);
  });

  it('renders a version 1 payload (no note field) like a note-off version 2 payload', async () => {
    const { auto_note: _omitted, ...rest } = snapshotWith();
    const v1: ReviewSnapshot = { ...rest, schema_version: 1 };
    const old = await render(automatic({ snapshot: v1 }));
    const current = await render(automatic());
    expect(old.content.text).toBe(current.content.text);
  });

  it('places the image only when the user authorized it', async () => {
    const png = makePng(300, 100);
    await expect(renderTimesheetPdf(automatic({ signatureImage: png }))).rejects.toThrow(PdfRenderError);
    const authorized = snapshotWith({ auto_image: { authorized: true, attachment_id: 'att-1' } });
    const placed = await render(automatic({ snapshot: authorized, signatureImage: png }));
    const images = placed.content.pages[0]?.images ?? [];
    expect(images).toHaveLength(1);
    expect(images[0]?.width).toBeLessThanOrEqual(SIGNATURE_BOX.width + 0.01);
    expect(images[0]?.height).toBeLessThanOrEqual(SIGNATURE_BOX.height + 0.01);
    // Authorized but the image is not handed in: nothing is placed and nothing fails.
    expect((await render(automatic({ snapshot: authorized }))).content.pages[0]?.images).toHaveLength(0);
    // Not authorized and no image: name and date only.
    expect((await render(automatic())).content.pages[0]?.images).toHaveLength(0);
  });

  it('is byte-identical for identical input, whatever the clock or Math.random', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T10:00:00Z'));
    const authorized = snapshotWith({ auto_image: { authorized: true, attachment_id: 'att-1' }, auto_note: { enabled: true, text: NOTE_VI } });
    const first = await renderTimesheetPdf(automatic({ snapshot: authorized, signatureImage: makePng(120, 40) }));
    vi.setSystemTime(new Date('2031-03-05T23:59:59Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.123);
    const second = await renderTimesheetPdf(automatic({ snapshot: authorized, signatureImage: makePng(120, 40) }));
    expect(Buffer.from(second).equals(Buffer.from(first))).toBe(true);
  });
});

describe('printed date comes from the revision instants in the saved reporting zone', () => {
  // Days around the two 2026 US changes: 2026-03-08 has 23 hours, 2026-11-01 has 25 hours in Los Angeles.
  const DST_DAYS: Array<[string, string]> = [
    ['2026-03-07', '03/07/2026'],
    ['2026-03-08', '03/08/2026'],
    ['2026-03-09', '03/09/2026'],
    ['2026-10-31', '10/31/2026'],
    ['2026-11-01', '11/01/2026'],
    ['2026-11-02', '11/02/2026'],
  ];

  async function printed(input: TimesheetPdfInput): Promise<string[]> {
    const { content } = await render(input);
    return (content.pages[0]?.items ?? []).filter((item) => item.x > 400 && /^\d{2}\/\d{2}\/\d{4}$/.test(item.text) && item.y < 250).map((item) => item.text);
  }

  it.each(DST_DAYS)('prints %s for the first and the last second of that local day (manual and automatic)', async (date, expected) => {
    const nextDay = addDays(date, 1);
    const first = formatUtcInstant(startOfLocalDay(ZONE, date));
    const last = formatUtcInstant(startOfLocalDay(ZONE, nextDay) - 1);
    for (const instant of [first, last]) {
      expect(await printed(manual({ signedAt: instant })), `manual ${instant}`).toEqual([expected]);
      expect(await printed(automatic({ automaticSubmittedAt: instant })), `automatic ${instant}`).toEqual([expected]);
    }
  });

  it('follows the saved zone of the snapshot, not the UTC date or the device zone', async () => {
    const instant = '2026-10-07T20:00:00Z'; // 13:00 on 10/07 in Los Angeles, 03:00 on 10/08 in Ho Chi Minh City
    expect(await printed(automatic({ automaticSubmittedAt: instant }))).toEqual(['10/07/2026']);
    const hcm = snapshotWith({ reporting_zone: 'Asia/Ho_Chi_Minh' });
    expect(await printed(automatic({ snapshot: hcm, automaticSubmittedAt: instant }))).toEqual(['10/08/2026']);
    expect(await printed(manual({ snapshot: hcm, signedAt: instant }))).toEqual(['10/08/2026']);
  });

  it('never takes the date from the clock', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-03-05T23:59:59Z'));
    expect(await printed(automatic())).toEqual([SIGN_DATE]);
    expect(await printed(manual())).toEqual([SIGN_DATE]);
  });
});

describe('signature image', () => {
  const placements = async (width: number, height: number) => {
    const { content } = await render(manual({ signatureImage: makePng(width, height) }));
    return content.pages[0]?.images ?? [];
  };

  it.each([
    ['a tall image', 40, 400],
    ['a wide image', 800, 20],
    ['a typical image', 300, 100],
    ['a tiny image', 8, 4],
  ])('places %s inside the bounded box keeping the aspect ratio', async (_label, width, height) => {
    const images = await placements(width, height);
    expect(images).toHaveLength(1);
    const [image] = images;
    expect(image?.width).toBeLessThanOrEqual(SIGNATURE_BOX.width + 0.01);
    expect(image?.height).toBeLessThanOrEqual(SIGNATURE_BOX.height + 0.01);
    expect((image?.width ?? 0) / (image?.height ?? 1)).toBeCloseTo(width / height, 2);
    expect(image?.x).toBeGreaterThanOrEqual(36 - 0.01);
    expect((image?.x ?? 0) + (image?.width ?? 0)).toBeLessThanOrEqual(55 + 2 + SIGNATURE_BOX.width + 0.01);
    // Above the signature line (top coordinate 600 -> y 192) and no higher than the box.
    expect(image?.y).toBeGreaterThanOrEqual(192 - 0.01);
    expect((image?.y ?? 0) + (image?.height ?? 0)).toBeLessThanOrEqual(192 + 2 + SIGNATURE_BOX.height + 0.01);
  });

  it('places no image on an automatic revision without one and refuses bytes that are not PNG or JPEG', async () => {
    expect(await placements(10, 10)).toHaveLength(1);
    const { content } = await render(automatic());
    expect(content.pages[0]?.images).toHaveLength(0);
    await expect(renderTimesheetPdf(manual({ signatureImage: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) }))).rejects.toThrow(PdfRenderError);
  });
});

describe('bounds of long labels', () => {
  const longCategory = `Holiday: ${'Independence-Day-observed-by-the-company '.repeat(4)}${'W'.repeat(60)}`;
  const longName = `${'Extraordinarily-Long-Employee-Name '.repeat(6)}`.trim();

  it('keeps every text item inside the page margins and every category label inside its own column', async () => {
    const days = DATES.map((date) => (date === '2026-09-16' ? weekday(date, { category: 'Holiday', holiday_name: longCategory.slice(9) }) : weekday(date)));
    const { content } = await render(manual({ snapshot: snapshotWith({ employee: { name: longName } }, days) }));
    const page = content.pages[0];
    for (const item of page?.items ?? []) {
      expect(item.x, item.text).toBeGreaterThanOrEqual(36 - 0.5);
      expect(item.x + item.width, item.text).toBeLessThanOrEqual(612 - 36 + 0.5);
    }
    const items = page?.items ?? [];
    // Every category cell's text (the category and the wrapped holiday label) stays inside its own day column and its row.
    const week = FULL.weeks[0];
    const inCategoryRow = items.filter((item) => item.y > PAGE_HEIGHT - (week.category.top + week.category.height) && item.y < PAGE_HEIGHT - week.category.top && item.x > week.daysLeft - 1);
    expect(inCategoryRow.length).toBeGreaterThan(8);
    for (const item of inCategoryRow) {
      const index = Math.floor((item.x - week.daysLeft + 0.5) / week.dayWidth);
      const start = week.daysLeft + index * week.dayWidth;
      expect(item.x, item.text).toBeGreaterThanOrEqual(start - 0.5);
      expect(item.x + item.width, item.text).toBeLessThanOrEqual(start + week.dayWidth + 0.5);
    }
  });

  it('shows overnight sessions with +1 and open sessions with an open end', async () => {
    const days = DATES.map((date) =>
      date === '2026-09-16'
        ? weekday(date, { sessions: [{ id: 'n', start_utc: utc('2026-09-16', '22:00'), end_utc: utc('2026-09-17', '02:00'), source: 'manual', breaks_confirmed: true, breaks: [] }] })
        : date === '2026-09-17'
          ? weekday(date, { completeness: 'incomplete', calculation: null, sessions: [{ id: 'o', start_utc: utc('2026-09-17', '09:05'), end_utc: null, source: 'clock', breaks_confirmed: false, breaks: [] }] })
          : weekday(date),
    );
    const { content } = await render(manual({ snapshot: snapshotWith({}, days) }));
    const items = content.pages[0]?.items.map((item) => item.text) ?? [];
    expect(items).toContain('22:00');
    expect(items).toContain('02:00+1');
    expect(items).toContain('09:05'); // an open session has a start and an empty end cell
    expect(items).not.toContain('09:05-');
  });
});

describe('fonts: Indie Flower for the category cells, DejaVu Serif Italic as the per-cell fallback (ADR 0001)', () => {
  const glyphs = (fonts: Map<string, number>, name: string): number => [...fonts].find(([key]) => key.endsWith(`+${name}`))?.[1] ?? -1;
  const withCategory = (category: string): ReviewSnapshot => snapshotWith({}, DATES.map((date) => (date === '2026-09-16' ? weekday(date, { category }) : weekday(date))));
  // Greek and Cyrillic: DejaVu has them, Indie Flower 2.000 does not ("Vacation" in Russian, "Alpha" in Greek).
  const CYRILLIC = text(0x41e, 0x442, 0x43f, 0x443, 0x441, 0x43a);
  const GREEK = text(0x391, 0x3bb, 0x3c6, 0x3b1);
  const VIETNAMESE_CATEGORY = `Ngh${text(0x1ec9)} ph${text(0xe9)}p`;

  it('embeds Indie Flower, and only a subset of it, next to the four DejaVu faces', async () => {
    const bytes = await renderTimesheetPdf(manual());
    const fonts = await embeddedFonts(bytes);
    for (const name of ['DejaVuSans', 'DejaVuSans-Bold', 'DejaVuSerifCondensed-Bold', 'DejaVuSerif-Italic', 'IndieFlower']) {
      expect(glyphs(fonts, name), name).toBeGreaterThan(0);
    }
    // A subset: the categories Worked and Off need a handful of glyphs of the 569 in the file.
    expect(glyphs(fonts, 'IndieFlower')).toBeGreaterThan(5);
    expect(glyphs(fonts, 'IndieFlower')).toBeLessThan(30);
    expect(bytes.length).toBeLessThan(150_000);
  });

  it('draws a category that Indie Flower lacks a character of in DejaVu Serif Italic for that cell, never as "?"', async () => {
    const baseline = await embeddedFonts(await renderTimesheetPdf(manual({ snapshot: withCategory('Worked') })));
    for (const category of [CYRILLIC, `Worked ${GREEK}`]) {
      const bytes = await renderTimesheetPdf(manual({ snapshot: withCategory(category) }));
      const { content } = await render(manual({ snapshot: withCategory(category) }));
      const cell = bandItems(textItems(content), FULL, 0, 'category', 2).map((item) => item.text);
      expect(cell.join(' '), category).toBe(category); // a long category wraps onto two lines inside the cell
      expect(content.text, category).not.toContain('?');
      const fonts = await embeddedFonts(bytes);
      // The italic face drew it: its subset grew by one glyph per distinct character; Indie Flower's did not grow for it.
      expect(glyphs(fonts, 'DejaVuSerif-Italic'), category).toBeGreaterThan(glyphs(baseline, 'DejaVuSerif-Italic') + 3);
      expect(glyphs(fonts, 'IndieFlower'), category).toBeLessThanOrEqual(glyphs(baseline, 'IndieFlower'));
    }
  });

  it('keeps a Vietnamese category in Indie Flower: the handwriting subset grows and the italic fallback does not', async () => {
    const baseline = await embeddedFonts(await renderTimesheetPdf(manual({ snapshot: withCategory('Worked') })));
    const bytes = await renderTimesheetPdf(manual({ snapshot: withCategory(VIETNAMESE_CATEGORY) }));
    const fonts = await embeddedFonts(bytes);
    expect(glyphs(fonts, 'IndieFlower')).toBeGreaterThan(glyphs(baseline, 'IndieFlower'));
    expect(glyphs(fonts, 'DejaVuSerif-Italic')).toBe(glyphs(baseline, 'DejaVuSerif-Italic'));
    expect((await readPdf(bytes)).text).toContain(VIETNAMESE_CATEGORY);
  });

  it('gives identical bytes for identical input with the committed font (the pinned file is read, not regenerated)', async () => {
    const first = await renderTimesheetPdf(manual({ snapshot: withCategory(CYRILLIC) }));
    const second = await renderTimesheetPdf(manual({ snapshot: withCategory(CYRILLIC) }));
    expect(Buffer.from(second).equals(Buffer.from(first))).toBe(true);
  });
});

describe('determinism and purity', () => {
  it('gives identical bytes for the same input, whatever the clock or Math.random, with and without an image', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T10:00:00Z'));
    const first = await renderTimesheetPdf(manual({ signatureImage: makePng(120, 40) }));
    const plainFirst = await renderTimesheetPdf(automatic());
    vi.setSystemTime(new Date('2031-03-05T23:59:59Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.987);
    await renderTimesheetPdf(manual({ snapshot: snapshotWith({ employee: { name: 'Someone Else' } }) }));
    const second = await renderTimesheetPdf(manual({ signatureImage: makePng(120, 40) }));
    const plainSecond = await renderTimesheetPdf(automatic());
    expect(Buffer.from(second).equals(Buffer.from(first))).toBe(true);
    expect(Buffer.from(plainSecond).equals(Buffer.from(plainFirst))).toBe(true);
    expect(Buffer.from(first).equals(Buffer.from(plainFirst))).toBe(false);
  });

  it('writes metadata from the input only: no current-time creation date', async () => {
    const { content } = await render(manual());
    expect(content.info.Creator).toBe('C&D timesheet');
    const created = String(content.info.CreationDate ?? '');
    const expected = new Date(utc('2026-09-29', '17:00'));
    const stamp = `D:${expected.getUTCFullYear()}${String(expected.getUTCMonth() + 1).padStart(2, '0')}${String(expected.getUTCDate()).padStart(2, '0')}${String(expected.getUTCHours()).padStart(2, '0')}`;
    expect(created.startsWith(stamp)).toBe(true);
    expect(String(content.info.Title)).toContain('TS-2026-10-02-0123456789');
  });

  it('does not change the snapshot it renders and renders a sealed snapshot like a plain one', async () => {
    const snapshot = snapshotWith();
    const before = JSON.stringify(snapshot);
    const plain = await renderTimesheetPdf(manual({ snapshot }));
    expect(JSON.stringify(snapshot)).toBe(before);
    const sealed = await renderTimesheetPdf(manual({ snapshot: sealReviewSnapshot(snapshot).snapshot }));
    expect(Buffer.from(sealed).equals(Buffer.from(plain))).toBe(true);
  });

  it('refuses a snapshot that is not 14 consecutive days or has a bad revision number', async () => {
    const days = snapshotWith().days;
    await expect(renderTimesheetPdf(manual({ snapshot: snapshotWith({}, days.slice(0, 13)) }))).rejects.toThrow(PdfRenderError);
    const gap = days.map((day, index) => (index === 13 ? { ...day, work_date: addDays('2026-09-27', 1) } : day));
    await expect(renderTimesheetPdf(manual({ snapshot: snapshotWith({}, gap) }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ revisionNo: 0 }))).rejects.toThrow(PdfRenderError);
  });
});

describe('file name', () => {
  it('sanitizes the employee name into a safe ASCII name', () => {
    expect(timesheetPdfFileName({ employeeName: VIETNAMESE_NAME, payrollDate: '2026-10-02', revisionNo: 2 })).toBe('Timesheet_Nguyen_Van_Anh_Dat_2026-10-02_r2.pdf');
    expect(timesheetPdfFileName({ employeeName: '../../etc/passwd', payrollDate: '2026-10-02', revisionNo: 1 })).toBe('Timesheet_etc_passwd_2026-10-02_r1.pdf');
    expect(timesheetPdfFileName({ employeeName: 'a"b\r\nc;d\\e:f<g>h|i*j?k\0l', payrollDate: '2026-10-02', revisionNo: 1 })).toBe('Timesheet_a_b_c_d_e_f_g_h_i_j_k_l_2026-10-02_r1.pdf');
    expect(timesheetPdfFileName({ employeeName: '   ', payrollDate: '2026-10-02', revisionNo: 1 })).toBe('Timesheet_employee_2026-10-02_r1.pdf');
    expect(timesheetPdfFileName({ employeeName: text(0x1f600, 0x4e2d), payrollDate: '2026-10-02', revisionNo: 1 })).toBe('Timesheet_employee_2026-10-02_r1.pdf');
    const long = timesheetPdfFileName({ employeeName: 'N'.repeat(300), payrollDate: '2026-10-02', revisionNo: 12 });
    expect(long).toBe(`Timesheet_${'N'.repeat(40)}_2026-10-02_r12.pdf`);
    expect(long).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(() => timesheetPdfFileName({ employeeName: 'x', payrollDate: '2026-13-40', revisionNo: 1 })).toThrow();
    expect(() => timesheetPdfFileName({ employeeName: 'x', payrollDate: '2026-10-02', revisionNo: 0 })).toThrow(PdfRenderError);
  });
});
