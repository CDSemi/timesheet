import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, datesBetween } from '../../src/domain/dates.ts';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { sealReviewSnapshot, type ReviewSnapshot, type SnapshotDay } from '../../src/domain/snapshot.ts';
import { startOfLocalDay } from '../../src/domain/zones.ts';
import { fitImage, fitText, formatHoursMinutes, SIGNATURE_BOX, timesheetPdfFileName, wrapText } from '../../src/server/pdf/layout.ts';
import { PdfRenderError, renderTimesheetPdf, type TimesheetPdfInput } from '../../src/server/pdf/timesheetPdf.ts';
import { instantOfWallTime } from '../client/zoneOracle.ts';
import { makePng, readPdf, type PdfContent } from '../support/pdfText.ts';

/*
 * WP3-T07 and WP3-T07B: the timesheet PDF renderer (AC-10, FR-11) and the automatic-submission
 * presentation (no automatic indicator, optional note line, image only when authorized). All data is synthetic; instants are derived
 * with the zone oracle (never a fixed offset); images are generated at test time and nothing is
 * written to disk. Expected strings are spelled out, never produced by the formatter under test.
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
    day_class: 'working',
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
    day_class: 'non_working',
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

/** A manual revision: the stored sign-off name and instant and the validated image (all required). */
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
    const items = content.pages[0]?.items.map((item) => item.text) ?? [];
    for (const date of US_DATES) expect(items.filter((item) => item === date), date).toHaveLength(1);
    for (const name of WEEKDAYS) expect(items.filter((item) => item === name), name).toHaveLength(2);
    expect(items.filter((item) => item === 'WEEK 1')).toHaveLength(1);
    expect(items.filter((item) => item === 'WEEK 2')).toHaveLength(1);
    expect(items.filter((item) => item === 'Worked').length).toBeGreaterThan(0);
    expect(items).toContain('Off');
    expect(items).toContain('08:30-17:15');
  });

  it('shows the submission and revision identifiers in the header and the footer', async () => {
    const { content } = await render(manual({ revisionNo: 3 }));
    expect(content.text).toContain('Submission TS-2026-10-02-0123456789');
    expect(content.lines).toContain('Revision 3');
    expect(content.lines).toContain('TS-2026-10-02-0123456789 | Revision 3');
    expect(content.text).not.toMatch(/manual|automatic|sign-off/i);
  });

  it('totals the credited minutes of all 14 days with OT only on the two Sundays', async () => {
    const snapshot = snapshotWith();
    expect(snapshot.totals.credited_minutes).toBe(195);
    const credited = snapshot.days.filter((day) => (day.calculation?.credited_minutes ?? 0) > 0).map((day) => day.work_date);
    expect(credited).toEqual(['2026-09-20', '2026-09-27']);
    const { content } = await render(manual({ snapshot }));
    expect(content.lines).toContain('Overtime Total : 3:15 h:mm');
    const otRows = content.lines.filter((line) => line.startsWith('OT (h:mm)'));
    expect(otRows).toHaveLength(2);
    const cells = otRows.flatMap((row) => row.split(' ').filter((token) => /^\d+:\d{2}$/.test(token)));
    expect(cells).toEqual(['0:00', '0:00', '0:00', '0:00', '0:00', '2:15', '0:00', '0:00', '0:00', '0:00', '0:00', '1:00']);
  });

  it('prints OT as h:mm only, with no decimal hours anywhere', async () => {
    const { content } = await render(manual());
    expect(content.text).not.toMatch(/\d\.\d/);
    expect(content.text).toContain('2:15');
    expect(content.text).toContain('1:00');
  });

  it('hides the OT rows and the total when Show OT on PDF is off', async () => {
    const off = (await render(manual({ snapshot: snapshotWith({ show_ot_on_pdf: false }) }))).content;
    expect(off.text).not.toContain('OT (h:mm)');
    expect(off.text).not.toContain('Overtime Total');
    expect(off.text).not.toContain('2:15');
    expect(off.text).not.toContain('3:15');
    expect(off.text).toContain('Category');
    const on = (await render(manual())).content;
    expect(on.text).toContain('OT (h:mm)');
    expect(on.text).toContain('Overtime Total');
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
    // payroll date, period start and end, four week-range dates, 14 day dates and the sign date; the manager date is blank.
    expect(dateMatches(content)).toHaveLength(22);
    const labels = (page?.items ?? []).filter((item) => item.text === 'Date' && item.x > 400);
    expect(labels).toHaveLength(2);
  });

  it('prints the stored sign-off name (not the profile name) under the signature line of a manual revision', async () => {
    const { content } = await render(manual({ signerName: 'Dr. Sam Q. Signer' }));
    const page = content.pages[0];
    const signer = page?.items.find((item) => item.text === 'Dr. Sam Q. Signer');
    const label = page?.items.find((item) => item.text === 'Employee Signature');
    expect(signer).toBeDefined();
    expect(signer?.y).toBeLessThan(label?.y ?? 0); // below the signature line label
    expect(content.text).toContain('Employee: Alex Example'); // the header keeps the employee name of the snapshot
    expect(content.lines.filter((line) => line.includes('Alex Example'))).toHaveLength(1);
    expect(content.lines.filter((line) => line.includes('Dr. Sam Q. Signer'))).toHaveLength(1);
  });

  it('refuses a manual revision without a sign-off instant, a name or an image, and one that carries an automatic instant', async () => {
    await expect(renderTimesheetPdf(manual({ signedAt: null }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ signatureImage: null }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ signerName: '   ' }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ automaticSubmittedAt: SIGN_INSTANT }))).rejects.toThrow(PdfRenderError);
    await expect(renderTimesheetPdf(manual({ signedAt: '2026-10-07 22:30' }))).rejects.toThrow();
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
    const name = (page?.items ?? []).filter((item) => item.text === 'Alex Example' && item.y < (label?.y ?? 0));
    expect(name).toHaveLength(1);
    const date = page?.items.find((item) => item.text === SIGN_DATE);
    expect(date?.x).toBeGreaterThan(400);
    expect(dateMatches(content)).toHaveLength(22);
  });

  it('has exactly the extracted text and layout of the manual PDF for the same snapshot, name and date (image aside)', async () => {
    const manualPdf = await render(manual());
    const plain = await render(automatic());
    const authorized = snapshotWith({ auto_image: { authorized: true, attachment_id: 'att-1' } });
    const withImage = await render(automatic({ snapshot: authorized, signatureImage: makePng(120, 40) }));
    expect(plain.content.text).toBe(manualPdf.content.text);
    expect(plain.content.pages[0]?.items).toEqual(manualPdf.content.pages[0]?.items);
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
    const noteItems = (page?.items ?? []).filter((item) => item.y > 700 && item.y < 740 && item.text !== 'TIME SHEET FOR SALARIED EXEMPT EMPLOYEES');
    expect(noteItems.length).toBeGreaterThan(0);
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
    expect((image?.x ?? 0) + (image?.width ?? 0)).toBeLessThanOrEqual(36 + 2 + SIGNATURE_BOX.width + 0.01);
    // Above the signature line (top coordinate 594 -> y 198) and no higher than the box.
    expect(image?.y).toBeGreaterThanOrEqual(198 - 0.01);
    expect((image?.y ?? 0) + (image?.height ?? 0)).toBeLessThanOrEqual(198 + 2 + SIGNATURE_BOX.height + 0.01);
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
    const categoryY = items.find((item) => item.text === 'Category')?.y ?? 0;
    const timeY = items.find((item) => item.text === 'Time')?.y ?? 0;
    expect(categoryY).toBeGreaterThan(timeY);
    const column = (612 - 72 - 56) / 7;
    const inCategoryRow = items.filter((item) => item.y <= categoryY + 3 && item.y > timeY + 3 && item.x > 36 + 56 - 1);
    expect(inCategoryRow.length).toBeGreaterThan(8);
    for (const item of inCategoryRow) {
      const index = Math.floor((item.x - (36 + 56) + 0.5) / column);
      const start = 36 + 56 + index * column;
      expect(item.x, item.text).toBeGreaterThanOrEqual(start - 0.5);
      expect(item.x + item.width, item.text).toBeLessThanOrEqual(start + column + 0.5);
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
    expect(items).toContain('22:00-02:00+1');
    expect(items).toContain('09:05-');
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
