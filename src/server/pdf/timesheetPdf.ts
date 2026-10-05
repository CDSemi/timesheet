import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFImage, type PDFPage, rgb } from 'pdf-lib';
import { addDays } from '../../domain/dates.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { autoNoteOf, normalizeReviewSnapshot, type ReviewSnapshot, type SnapshotDay } from '../../domain/snapshot.ts';
import { assertTimeZone, formatInZone, localDateOf } from '../../domain/zones.ts';
import { loadPdfFontBytes } from './fonts.ts';
import {
  CONTENT_WIDTH,
  cleanText,
  fitImage,
  fitText,
  formatHoursMinutes,
  formatUsDate,
  MARGIN,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PdfRenderError,
  SIGNATURE_BOX,
  weekdayName,
} from './layout.ts';

/*
 * The timesheet PDF (docs/04 "Email and PDF", AC-10): a pure function from the frozen review
 * snapshot plus revision metadata to PDF bytes. It computes no business minutes: every minute it
 * prints is a value of the snapshot (the engine's credited minutes and total), formatted as h:mm.
 * The output is deterministic: pdf-lib is created without automatic dates or producer stamps, the
 * dates come from the snapshot, and pdf-lib's resource names come from a seeded generator, so the
 * same input gives identical bytes.
 *
 * Presentation (owner decision of 2026-10-04, docs/04 "Email and PDF"): manual and automatic
 * revisions look the same. Nothing printed names the origin: no banner, no origin word in the
 * header or the footer, no pending wording. The signature block prints the signer name and one
 * date, the local date in the snapshot's saved reporting zone of the real sign-off instant
 * (manual) or of the automatic revision's submission instant (automatic; its `signed_at` stays
 * empty and is never an input). The signature image of an automatic revision is placed only when
 * the snapshot records the user's authorization; the optional note line (automatic only, only
 * when the user turned it on) is the one line where the banner used to be. A version 1 snapshot
 * has no note and renders with it off.
 */

export { PdfRenderError, SIGNATURE_BOX, timesheetPdfFileName } from './layout.ts';

export type PdfOrigin = 'manual' | 'automatic';

export type TimesheetPdfInput = {
  snapshot: ReviewSnapshot;
  submissionId: string;
  revisionNo: number;
  origin: PdfOrigin;
  /** The real employee sign-off instant (UTC) of a manual revision; null for an automatic revision. */
  signedAt: string | null;
  /** The creation instant (UTC) of an automatic revision, printed as its date; null for a manual revision. */
  automaticSubmittedAt: string | null;
  /** The name printed under the signature line: the stored sign-off name (manual) or the employee name (automatic). */
  signerName: string;
  /** The validated signature image (PNG or JPEG bytes): required for a manual revision, allowed for an automatic one only when authorized. */
  signatureImage: Uint8Array | null;
};

const COMPANY = 'C&D Semiconductor Services, Inc.';
const TITLE = 'TIME SHEET FOR SALARIED EXEMPT EMPLOYEES';
const DAYS_PER_WEEK = 7;
const LABEL_COLUMN = 56;
const DAY_COLUMN = (CONTENT_WIDTH - LABEL_COLUMN) / DAYS_PER_WEEK;

const INK = rgb(0.09, 0.1, 0.12);
const MUTED = rgb(0.38, 0.4, 0.44);
const RULE = rgb(0.55, 0.58, 0.62);
const HEAD_FILL = rgb(0.9, 0.92, 0.95);
const LABEL_FILL = rgb(0.95, 0.96, 0.97);

type Fonts = { regular: PDFFont; bold: PDFFont; supported: ReadonlySet<number> };

const top = (value: number): number => PAGE_HEIGHT - value;

/** Plain text the embedded font can draw: control characters become spaces, unsupported characters `?`. */
function printable(fonts: Fonts, text: string): string {
  let result = '';
  for (const char of cleanText(text)) {
    const code = char.codePointAt(0) ?? 0;
    result += fonts.supported.has(code) ? char : '?';
  }
  return result;
}

function measurer(font: PDFFont): (text: string, size: number) => number {
  return (text, size) => font.widthOfTextAtSize(text, size);
}

class Canvas {
  readonly page: PDFPage;
  readonly fonts: Fonts;

  constructor(page: PDFPage, fonts: Fonts) {
    this.page = page;
    this.fonts = fonts;
  }

  text(value: string, x: number, topY: number, size: number, bold = false, color = INK): void {
    const text = printable(this.fonts, value);
    if (text === '') return;
    this.page.drawText(text, { x, y: top(topY) - size * 0.95, size, font: bold ? this.fonts.bold : this.fonts.regular, color });
  }

  /** Text wrapped or shrunk to the box; returns the lines' bottom edge (top coordinates). */
  fitted(value: string, box: { x: number; top: number; width: number; maxLines: number }, maxSize: number, minSize: number, options: { bold?: boolean; align?: 'left' | 'center'; color?: ReturnType<typeof rgb> } = {}): number {
    const font = options.bold === true ? this.fonts.bold : this.fonts.regular;
    const fit = fitText(printable(this.fonts, value), maxSize, minSize, box.width, box.maxLines, measurer(font));
    const lineHeight = fit.size * 1.22;
    fit.lines.forEach((line, index) => {
      const width = font.widthOfTextAtSize(line, fit.size);
      const x = options.align === 'center' ? box.x + (box.width - width) / 2 : box.x;
      this.page.drawText(line, {
        x,
        y: top(box.top + index * lineHeight) - fit.size * 0.95,
        size: fit.size,
        font,
        color: options.color ?? INK,
      });
    });
    return box.top + fit.lines.length * lineHeight;
  }

  rect(x: number, topY: number, width: number, height: number, fill?: ReturnType<typeof rgb>): void {
    this.page.drawRectangle({
      x,
      y: top(topY + height),
      width,
      height,
      borderColor: RULE,
      borderWidth: 0.6,
      ...(fill === undefined ? {} : { color: fill }),
    });
  }

  line(x1: number, x2: number, topY: number): void {
    this.page.drawLine({ start: { x: x1, y: top(topY) }, end: { x: x2, y: top(topY) }, thickness: 0.7, color: INK });
  }
}

/** The session time ranges of a day in the reporting zone, e.g. "08:30-17:15" (or "-" end when open). */
function sessionRanges(day: SnapshotDay, zone: string): string[] {
  return day.sessions.map((session) => {
    const start = parseUtcInstant(session.start_utc);
    const startLocal = formatInZone(zone, start);
    if (session.end_utc === null) return `${startLocal.slice(11, 16)}-`;
    const end = parseUtcInstant(session.end_utc);
    const endLocal = formatInZone(zone, end);
    const nextDay = localDateOf(zone, end) !== localDateOf(zone, start) ? '+1' : '';
    return `${startLocal.slice(11, 16)}-${endLocal.slice(11, 16)}${nextDay}`;
  });
}

/** The OT cell: the snapshot's credited minutes of a complete day, otherwise a short marker. */
function otCellText(day: SnapshotDay): string {
  if (day.completeness === 'complete' && day.calculation?.credited_minutes !== null && day.calculation !== null) {
    return formatHoursMinutes(day.calculation.credited_minutes ?? 0);
  }
  if (day.completeness === 'incomplete' || day.completeness === 'incomplete_breaks') return 'pending';
  if (day.completeness === 'calculation_error') return 'n/a';
  return '';
}

function categoryCellText(day: SnapshotDay): string {
  const category = day.category ?? '';
  return day.holiday_name !== null && day.holiday_name !== '' ? `${category}: ${day.holiday_name}` : category;
}

type Rows = { weekday: number; date: number; category: number; time: number; ot: number };
const ROWS: Rows = { weekday: 14, date: 14, category: 36, time: 46, ot: 18 };
const WEEK_HEADING = 16;

function drawWeek(canvas: Canvas, snapshot: ReviewSnapshot, days: SnapshotDay[], weekNumber: number, topY: number, showOt: boolean): number {
  const first = days[0];
  const last = days[days.length - 1];
  if (first === undefined || last === undefined) throw new PdfRenderError('A week needs seven days');
  canvas.rect(MARGIN, topY, CONTENT_WIDTH, WEEK_HEADING, HEAD_FILL);
  canvas.text(`WEEK ${weekNumber}`, MARGIN + 5, topY + 3.5, 8.5, true);
  canvas.text(`${formatUsDate(first.work_date)} - ${formatUsDate(last.work_date)}`, MARGIN + 70, topY + 3.5, 8.5);
  let y = topY + WEEK_HEADING;

  const labelRow = (label: string, height: number): void => {
    canvas.rect(MARGIN, y, LABEL_COLUMN, height, LABEL_FILL);
    canvas.fitted(label, { x: MARGIN + 4, top: y + 3.5, width: LABEL_COLUMN - 8, maxLines: 1 }, 8, 6, { bold: true });
  };
  const cells = (height: number, paint: (day: SnapshotDay, x: number) => void, fill?: ReturnType<typeof rgb>): void => {
    days.forEach((day, index) => {
      const x = MARGIN + LABEL_COLUMN + index * DAY_COLUMN;
      canvas.rect(x, y, DAY_COLUMN, height, fill);
      paint(day, x);
    });
  };
  const inner = (x: number, topOffset: number, maxLines: number) => ({ x: x + 3, top: y + topOffset, width: DAY_COLUMN - 6, maxLines });

  labelRow('Day', ROWS.weekday);
  cells(ROWS.weekday, (day, x) => canvas.fitted(weekdayName(day.work_date), inner(x, 3, 1), 8, 6, { bold: true, align: 'center' }), HEAD_FILL);
  y += ROWS.weekday;

  labelRow('Date', ROWS.date);
  cells(ROWS.date, (day, x) => canvas.fitted(formatUsDate(day.work_date), inner(x, 3, 1), 8, 6, { align: 'center' }));
  y += ROWS.date;

  labelRow('Category', ROWS.category);
  cells(ROWS.category, (day, x) => canvas.fitted(categoryCellText(day), inner(x, 3.5, 3), 8, 5.5, { align: 'center' }));
  y += ROWS.category;

  labelRow('Time', ROWS.time);
  cells(ROWS.time, (day, x) => {
    const ranges = sessionRanges(day, snapshot.reporting_zone);
    const shown = ranges.length > 4 ? [...ranges.slice(0, 3), `+${ranges.length - 3} more`] : ranges;
    shown.forEach((range, index) => canvas.fitted(range, inner(x, 3.5 + index * 10.5, 1), 7.5, 5.5, { align: 'center' }));
  });
  y += ROWS.time;

  if (showOt) {
    labelRow('OT (h:mm)', ROWS.ot);
    cells(ROWS.ot, (day, x) => canvas.fitted(otCellText(day), inner(x, 3.5, 1), 8.5, 6, { bold: true, align: 'center' }));
    y += ROWS.ot;
  }
  return y;
}

/** Detects PNG or JPEG from the magic bytes; anything else is refused. */
async function embedSignature(doc: PDFDocument, bytes: Uint8Array): Promise<PDFImage> {
  const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isPng) return doc.embedPng(bytes);
  if (isJpeg) return doc.embedJpg(bytes);
  throw new PdfRenderError('The signature image must be a PNG or a JPEG');
}

export async function renderTimesheetPdf(input: TimesheetPdfInput): Promise<Uint8Array> {
  const snapshot = normalizeReviewSnapshot(input.snapshot);
  if (snapshot.days.length !== 2 * DAYS_PER_WEEK) throw new PdfRenderError('A timesheet has exactly 14 days');
  snapshot.days.forEach((day, index) => {
    if (day.work_date !== addDays(snapshot.period.period_start, index)) {
      throw new PdfRenderError('The 14 days must be consecutive from the period start');
    }
  });
  if (!Number.isSafeInteger(input.revisionNo) || input.revisionNo < 1) {
    throw new PdfRenderError('Revision number must be a positive whole number');
  }
  if (cleanText(input.signerName) === '') throw new PdfRenderError('The signature block needs the signer name');
  let printedInstant: string;
  if (input.origin === 'manual') {
    if (input.signedAt === null) throw new PdfRenderError('A manual revision needs its real sign-off instant');
    if (input.automaticSubmittedAt !== null) throw new PdfRenderError('A manual revision has no automatic submission instant');
    if (input.signatureImage === null) throw new PdfRenderError('A manual revision needs its signature image');
    printedInstant = input.signedAt;
  } else {
    if (input.signedAt !== null) throw new PdfRenderError('An automatic revision has no real sign-off instant');
    if (input.automaticSubmittedAt === null) throw new PdfRenderError('An automatic revision needs its submission instant');
    if (input.signatureImage !== null && !snapshot.auto_image.authorized) {
      throw new PdfRenderError('The signature image is not authorized for automatic submissions');
    }
    printedInstant = input.automaticSubmittedAt;
  }
  const zone = assertTimeZone(snapshot.reporting_zone, 'reporting_zone');
  const signDate = formatUsDate(localDateOf(zone, parseUtcInstant(printedInstant, 'signature date')));
  const autoNote = input.origin === 'automatic' ? autoNoteOf(snapshot) : null;
  const showOt = snapshot.show_ot_on_pdf;

  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.registerFontkit(fontkit);
  const fontBytes = await loadPdfFontBytes();
  const regular = await doc.embedFont(fontBytes.regular, { subset: true, customName: 'AAAAAA+DejaVuSans' });
  const bold = await doc.embedFont(fontBytes.bold, { subset: true, customName: 'BAAAAA+DejaVuSans-Bold' });
  const fonts: Fonts = { regular, bold, supported: new Set(regular.getCharacterSet()) };

  const creation = new Date(parseUtcInstant(snapshot.period.due_at_utc) * 1000);
  doc.setTitle(`Timesheet ${snapshot.period.payroll_date} ${input.submissionId} revision ${input.revisionNo}`);
  doc.setSubject(input.submissionId);
  doc.setCreator('C&D timesheet');
  doc.setProducer('C&D timesheet (pdf-lib)');
  doc.setCreationDate(creation);
  doc.setModificationDate(creation);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const canvas = new Canvas(page, fonts);
  const right = MARGIN + CONTENT_WIDTH;

  // Header: company, title, submission and revision identifiers (no origin wording).
  canvas.text(COMPANY, MARGIN, 36, 15, true);
  canvas.text(TITLE, MARGIN, 58, 11, true);
  const idLine = `Submission ${input.submissionId}`;
  const revisionLine = `Revision ${input.revisionNo}`;
  for (const [index, line] of [idLine, revisionLine].entries()) {
    const fit = fitText(printable(fonts, line), 8, 5.5, 230, 1, measurer(regular));
    const text = fit.lines[0] ?? '';
    canvas.text(text, right - regular.widthOfTextAtSize(text, fit.size), 38 + index * 11, fit.size, false, MUTED);
  }

  let y = 80;
  if (autoNote?.enabled === true) {
    // The user's own optional note, one plain line; it takes the place of nothing else on the page.
    canvas.fitted(autoNote.text, { x: MARGIN, top: y, width: CONTENT_WIDTH, maxLines: 1 }, 9, 6, { color: MUTED });
    y += 18;
  }

  // Employee, payroll date and period.
  canvas.text('Employee:', MARGIN, y + 2, 9, true);
  const employeeBottom = canvas.fitted(snapshot.employee.name, { x: MARGIN + 58, top: y + 1.5, width: 270, maxLines: 2 }, 10.5, 6.5, { bold: true });
  canvas.text('Payroll Date:', MARGIN + 350, y + 2, 9, true);
  canvas.text(formatUsDate(snapshot.period.payroll_date), MARGIN + 424, y + 1.5, 10.5, true);
  y = Math.max(y + 16, employeeBottom + 3);
  canvas.text('Period:', MARGIN, y + 1, 8.5, true, MUTED);
  canvas.text(`${formatUsDate(snapshot.period.period_start)} - ${formatUsDate(snapshot.period.period_end)}`, MARGIN + 58, y + 1, 8.5, false, MUTED);
  y += 20;

  // Two Monday-Sunday blocks with the 14 dates.
  const weekOne = snapshot.days.slice(0, DAYS_PER_WEEK);
  const weekTwo = snapshot.days.slice(DAYS_PER_WEEK);
  y = drawWeek(canvas, snapshot, weekOne, 1, y, showOt) + 10;
  y = drawWeek(canvas, snapshot, weekTwo, 2, y, showOt) + 6;

  if (showOt) {
    const total = formatHoursMinutes(snapshot.totals.credited_minutes);
    canvas.rect(MARGIN + CONTENT_WIDTH - 210, y, 210, 22, HEAD_FILL);
    canvas.text('Overtime Total :', MARGIN + CONTENT_WIDTH - 204, y + 5.5, 9.5, true);
    canvas.text(`${total} h:mm`, MARGIN + CONTENT_WIDTH - 98, y + 5, 10.5, true);
    if (snapshot.totals.pending_days > 0) {
      const pending = `${snapshot.totals.pending_days} day(s) with OT pending are not in the total.`;
      canvas.text(pending, MARGIN, y + 7, 7.5, false, MUTED);
    }
  }

  // Employee signature (bounded image, signer name and date), blank manager signature.
  const lineTop = 594;
  const dateX = MARGIN + 380;
  if (input.signatureImage !== null) {
    const image = await embedSignature(doc, input.signatureImage);
    const placed = fitImage(image.width, image.height, SIGNATURE_BOX.width, SIGNATURE_BOX.height);
    page.drawImage(image, { x: MARGIN + 2, y: top(lineTop) + 2, width: placed.width, height: placed.height });
  }
  canvas.line(MARGIN, MARGIN + 300, lineTop);
  canvas.text('Employee Signature', MARGIN, lineTop + 4, 8, false, MUTED);
  canvas.fitted(input.signerName, { x: MARGIN, top: lineTop + 15, width: 300, maxLines: 1 }, 10, 6.5, { bold: true });
  canvas.line(dateX, right, lineTop);
  canvas.text('Date', dateX, lineTop + 4, 8, false, MUTED);
  canvas.text(signDate, dateX + 2, lineTop - 15, 10.5, true);

  const managerTop = 672;
  canvas.line(MARGIN, MARGIN + 300, managerTop);
  canvas.text('Manager Signature', MARGIN, managerTop + 4, 8, false, MUTED);
  canvas.line(dateX, right, managerTop);
  canvas.text('Date', dateX, managerTop + 4, 8, false, MUTED);

  // Footer on the page: identifiers again, so a detached page stays traceable.
  const footer = `${input.submissionId}  |  Revision ${input.revisionNo}`;
  canvas.text(footer, MARGIN, 756, 7, false, MUTED);

  return doc.save({ useObjectStreams: false });
}
