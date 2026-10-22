import fontkit from '@pdf-lib/fontkit';
import {
  appendBezierCurve,
  clip,
  closePath,
  degrees,
  endPath,
  moveTo,
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  popGraphicsState,
  pushGraphicsState,
  rgb,
} from 'pdf-lib';
import { addDays } from '../../domain/dates.ts';
import {
  LOGO_DISC,
  LOGO_LETTER_PATHS,
  LOGO_SIZE,
  LOGO_STRIPE_COLOR,
  LOGO_STRIPES,
  WORDMARK_COLORS,
  WORDMARK_MAIN_PATH,
  WORDMARK_SIZE,
  WORDMARK_SUB_PATH,
} from '../../domain/brand.ts';
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
  MAX_SESSION_LINES,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PdfRenderError,
  pdfLayout,
  rotatedLabelOrigin,
  SIGNATURE_BOX,
  type WeekLayout,
  weekdayName,
} from './layout.ts';

/*
 * The timesheet PDF (docs/04 "Email and PDF", AC-10): a pure function from the frozen review
 * snapshot plus revision metadata to PDF bytes. It computes no business minutes: every minute it
 * prints is a value of the snapshot (the engine's credited minutes and total), formatted as h:mm.
 * The output is deterministic: pdf-lib is created without automatic dates or producer stamps, the
 * dates come from the snapshot, and the embedded fonts carry fixed names, so the same input gives
 * identical bytes.
 *
 * One US Letter page (WP5-UX5-T02, plan Addendum 2): the logo and wordmark and the revision on the header line, two
 * centred title lines, Employee and Payroll Date, Period, two Monday-Sunday week tables, the overtime total, the two
 * signature rows and the copyright footer. All geometry comes from `pdfLayout` (layout.ts). Fonts: DejaVu Sans, Sans
 * Bold, Serif Condensed Bold and Serif Italic from the installed package, and the committed Indie Flower file for the
 * category cells only (ADR 0001); a category with a character Indie Flower lacks is drawn in DejaVu Serif Italic.
 *
 * Presentation (owner decision of 2026-10-04, docs/04 "Email and PDF"): manual and automatic
 * revisions look the same. Nothing printed names the origin: no banner, no origin word in the
 * header or the footer, no pending wording. The signature block prints the signer name and one
 * date, the local date in the snapshot's saved reporting zone of the real sign-off instant
 * (manual) or of the automatic revision's submission instant (automatic; its `signed_at` stays
 * empty and is never an input). The signature image of an automatic revision is placed only when
 * the snapshot records the user's authorization; the optional note line (automatic only, only
 * when the user turned it on) is the one line between the titles and the fields. A version 1
 * snapshot has no note and renders with it off. A manual revision prints its saved signature image
 * when one exists, else the printed name alone (owner decision F-5 b).
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
  /** The name printed above the signature line: the stored sign-off name (manual) or the employee name (automatic). */
  signerName: string;
  /** The validated signature image (PNG or JPEG bytes): optional for a manual revision (null prints the name alone, F-5 b), allowed for an automatic one only when authorized. */
  signatureImage: Uint8Array | null;
  /**
   * Which rows the PDF prints (owner decision F-3 b, chosen for each send): the session time rows and the OT rows
   * with the OT total. Omitted: the time rows and the snapshot's `show_ot_on_pdf` (the sign-off default variant).
   */
  rows?: { time: boolean; ot: boolean } | undefined;
};

const COMPANY = 'C&D Semiconductor Services, Inc.';
const TITLE = 'TIME SHEET FOR SALARIED EXEMPT EMPLOYEES';
const FOOTER_RIGHT = 'Internal use by C&D only';
const DAYS_PER_WEEK = 7;
/** DejaVu cap and digit height as a fraction of the font size (1493 / 2048). */
const CAP_RATIO = 0.729;
/** The simulated small capitals: the rest of each word at this fraction of the first letter's size. */
const SMALL_CAPS_RATIO = 0.8;

const INK = rgb(0.09, 0.1, 0.12);
const MUTED = rgb(0.38, 0.4, 0.44);
const RULE = rgb(0.28, 0.3, 0.34);
const HEAD_FILL = rgb(0.92, 0.93, 0.94);
const LEFT_FILL = rgb(0.88, 0.9, 0.92);
const WEEKEND_HEAD_FILL = rgb(0.99, 0.89, 0.8);
const WEEKEND_BODY_FILL = rgb(0.92, 0.92, 0.92);
const TEAL = rgb(0.055, 0.443, 0.722);

const hex = (value: string) => rgb(Number.parseInt(value.slice(1, 3), 16) / 255, Number.parseInt(value.slice(3, 5), 16) / 255, Number.parseInt(value.slice(5, 7), 16) / 255);

type Face = { font: PDFFont; supported: ReadonlySet<number> };
type Fonts = { sans: Face; sansBold: Face; serif: Face; italic: Face; hand: Face };
type Color = ReturnType<typeof rgb>;

const top = (value: number): number => PAGE_HEIGHT - value;

/** Plain text the face can draw: control characters become spaces, unsupported characters `?`. */
function printable(face: Face, text: string, clean = true): string {
  let result = '';
  for (const char of clean ? cleanText(text) : text) {
    const code = char.codePointAt(0) ?? 0;
    result += face.supported.has(code) ? char : '?';
  }
  return result;
}

const canDraw = (face: Face, text: string): boolean => [...cleanText(text)].every((char) => face.supported.has(char.codePointAt(0) ?? 0));

class Canvas {
  readonly page: PDFPage;
  readonly fonts: Fonts;

  constructor(page: PDFPage, fonts: Fonts) {
    this.page = page;
    this.fonts = fonts;
  }

  /** `clean: false` keeps the spaces at the ends of a run of simulated small capitals (the caller has cleaned the text). */
  width(face: Face, value: string, size: number, clean = true): number {
    return face.font.widthOfTextAtSize(printable(face, value, clean), size);
  }

  /** Draws text with its baseline at `baseline` (top coordinates); returns the width drawn. */
  text(face: Face, value: string, x: number, baseline: number, size: number, color: Color = INK, clean = true): number {
    const text = printable(face, value, clean);
    if (text === '') return 0;
    this.page.drawText(text, { x, y: top(baseline), size, font: face.font, color });
    return face.font.widthOfTextAtSize(text, size);
  }

  centered(face: Face, value: string, centerX: number, baseline: number, size: number, color: Color = INK): void {
    this.text(face, value, centerX - this.width(face, value, size) / 2, baseline, size, color);
  }

  right(face: Face, value: string, rightX: number, baseline: number, size: number, color: Color = INK): void {
    this.text(face, value, rightX - this.width(face, value, size), baseline, size, color);
  }

  /** One line shrunk (never wrapped) to `maxWidth`, then cut with an ellipsis at the minimum size. */
  fitLine(face: Face, value: string, maxWidth: number, maxSize: number, minSize: number): { text: string; size: number } {
    const fit = fitText(printable(face, value), maxSize, minSize, maxWidth, 1, (text, size) => face.font.widthOfTextAtSize(text, size));
    return { text: fit.lines[0] ?? '', size: fit.size };
  }

  /** The runs of simulated small capitals: the first letter of each word at `size`, the rest at the smaller size, all upper case. */
  private smallCapsRuns(value: string, size: number): Array<{ text: string; size: number }> {
    const runs: Array<{ text: string; size: number }> = [];
    let previous = ' ';
    for (const char of cleanText(value).toUpperCase()) {
      const runSize = previous === ' ' && char !== ' ' ? size : size * SMALL_CAPS_RATIO;
      const last = runs[runs.length - 1];
      if (last !== undefined && last.size === runSize) last.text += char;
      else runs.push({ text: char, size: runSize });
      previous = char;
    }
    return runs;
  }

  smallCapsWidth(face: Face, value: string, size: number): number {
    return this.smallCapsRuns(value, size).reduce((sum, run) => sum + this.width(face, run.text, run.size, false), 0);
  }

  /** Small capitals starting at x; returns the width. */
  smallCaps(face: Face, value: string, x: number, baseline: number, size: number, color: Color = INK): number {
    let cursor = x;
    for (const run of this.smallCapsRuns(value, size)) cursor += this.text(face, run.text, cursor, baseline, run.size, color, false);
    return cursor - x;
  }

  /** Text rotated 90 degrees (reading upward), centred in the cell both ways. */
  rotatedCentered(face: Face, value: string, cell: { x: number; top: number; width: number; height: number }, size: number): void {
    const text = printable(face, value);
    if (text === '') return;
    const width = face.font.widthOfTextAtSize(text, size);
    const origin = rotatedLabelOrigin(cell, width, size * CAP_RATIO);
    this.page.drawText(text, { x: origin.x, y: origin.y, size, font: face.font, color: INK, rotate: degrees(90) });
  }

  rect(x: number, topY: number, width: number, height: number, fill?: Color): void {
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

  line(x1: number, x2: number, topY: number, thickness = 0.7, color: Color = INK): void {
    this.page.drawLine({ start: { x: x1, y: top(topY) }, end: { x: x2, y: top(topY) }, thickness, color });
  }
}

/** The C&D logo as vectors (circle, clipped stripes, lettering outlines) with its top-left corner at (x, topY). */
function drawLogo(page: PDFPage, x: number, topY: number, size: number): void {
  const scale = size / LOGO_SIZE;
  const px = (unit: number): number => x + unit * scale;
  const py = (unit: number): number => top(topY + unit * scale);
  const disc = hex(LOGO_DISC.color);
  page.drawCircle({ x: px(LOGO_DISC.cx), y: py(LOGO_DISC.cy), size: LOGO_DISC.radius * scale, color: disc });
  const k = 0.5522847498 * LOGO_DISC.innerRadius * scale;
  const cx = px(LOGO_DISC.cx);
  const cy = py(LOGO_DISC.cy);
  const r = LOGO_DISC.innerRadius * scale;
  page.pushOperators(
    pushGraphicsState(),
    moveTo(cx + r, cy),
    appendBezierCurve(cx + r, cy + k, cx + k, cy + r, cx, cy + r),
    appendBezierCurve(cx - k, cy + r, cx - r, cy + k, cx - r, cy),
    appendBezierCurve(cx - r, cy - k, cx - k, cy - r, cx, cy - r),
    appendBezierCurve(cx + k, cy - r, cx + r, cy - k, cx + r, cy),
    closePath(),
    clip(),
    endPath(),
  );
  const blue = hex(LOGO_STRIPE_COLOR);
  for (const stripeTop of LOGO_STRIPES.tops) {
    page.drawRectangle({ x: px(0), y: py(stripeTop + LOGO_STRIPES.height), width: LOGO_SIZE * scale, height: LOGO_STRIPES.height * scale, color: blue });
  }
  page.drawRectangle({ x: px(0), y: py(LOGO_STRIPES.band.top + LOGO_STRIPES.band.height), width: LOGO_SIZE * scale, height: LOGO_STRIPES.band.height * scale, color: blue });
  page.pushOperators(popGraphicsState());
  for (const path of LOGO_LETTER_PATHS) page.drawSvgPath(path, { x: px(0), y: py(0), scale, color: disc });
}

type SessionTimes = { start: string; end: string };

/** The session start and end times of a day in the reporting zone, e.g. 08:30 and 17:15 (+1 on the next day; an open end is empty). */
function sessionTimes(day: SnapshotDay, zone: string): SessionTimes[] {
  return day.sessions.map((session) => {
    const start = parseUtcInstant(session.start_utc);
    const startLocal = formatInZone(zone, start).slice(11, 16);
    if (session.end_utc === null) return { start: startLocal, end: '' };
    const end = parseUtcInstant(session.end_utc);
    const nextDay = localDateOf(zone, end) !== localDateOf(zone, start) ? '+1' : '';
    return { start: startLocal, end: `${formatInZone(zone, end).slice(11, 16)}${nextDay}` };
  });
}

/** The OT cell: the snapshot's credited minutes of a complete day, otherwise a short marker. */
function otCell(day: SnapshotDay): { text: string; marker: boolean } {
  if (day.completeness === 'complete' && day.calculation?.credited_minutes !== null && day.calculation !== null) {
    return { text: formatHoursMinutes(day.calculation.credited_minutes ?? 0), marker: false };
  }
  if (day.completeness === 'incomplete' || day.completeness === 'incomplete_breaks') return { text: 'pending', marker: true };
  if (day.completeness === 'calculation_error') return { text: 'n/a', marker: true };
  return { text: '', marker: false };
}

/** Saturday, Sunday and holiday columns: every day the server calendar classifies as other than a normal working day. */
const isNonWorking = (day: SnapshotDay): boolean => day.day_class === 'nonworking' || (day.holiday_name !== null && day.holiday_name !== '');

function drawWeek(canvas: Canvas, snapshot: ReviewSnapshot, days: SnapshotDay[], weekNumber: number, layout: WeekLayout): void {
  if (days.length !== DAYS_PER_WEEK) throw new PdfRenderError('A week needs seven days');
  const { fonts } = canvas;
  const columnX = (index: number): number => layout.daysLeft + index * layout.dayWidth;

  // Left column: the week number, WEEK, and OT across the time and OT rows, each centred in its cell.
  canvas.rect(layout.left, layout.head.top, layout.leftColumn, layout.head.height, LEFT_FILL);
  canvas.rotatedCentered(fonts.serif, String(weekNumber), { x: layout.left, top: layout.head.top, width: layout.leftColumn, height: layout.head.height }, 10.5);
  canvas.rect(layout.left, layout.category.top, layout.leftColumn, layout.category.height, LEFT_FILL);
  canvas.rotatedCentered(fonts.serif, 'WEEK', { x: layout.left, top: layout.category.top, width: layout.leftColumn, height: layout.category.height }, 10.5);
  if (layout.otLabel !== null) {
    canvas.rect(layout.left, layout.otLabel.top, layout.leftColumn, layout.otLabel.height, LEFT_FILL);
    if (layout.ot !== null) canvas.rotatedCentered(fonts.serif, 'OT', { x: layout.left, top: layout.otLabel.top, width: layout.leftColumn, height: layout.otLabel.height }, 10.5);
  }

  days.forEach((day, index) => {
    const x = columnX(index);
    const off = isNonWorking(day);
    const bodyFill = off ? WEEKEND_BODY_FILL : undefined;
    const centerX = x + layout.dayWidth / 2;

    // Header: the day name in small capitals (bold) and the date, 22pt apart.
    canvas.rect(x, layout.head.top, layout.dayWidth, layout.head.height, off ? WEEKEND_HEAD_FILL : HEAD_FILL);
    const nameBaseline = layout.head.top + 9.5;
    const name = weekdayName(day.work_date);
    let nameSize = 10;
    while (nameSize > 6 && canvas.smallCapsWidth(fonts.sansBold, name, nameSize) > layout.dayWidth - 6) nameSize -= 0.5;
    canvas.smallCaps(fonts.sansBold, name, centerX - canvas.smallCapsWidth(fonts.sansBold, name, nameSize) / 2, nameBaseline, nameSize);
    canvas.centered(fonts.sans, formatUsDate(day.work_date), centerX, nameBaseline + 22, 11);

    // Category row: the category in the handwriting face, then the holiday name and leave in small type.
    canvas.rect(x, layout.category.top, layout.dayWidth, layout.category.height, bodyFill);
    drawCategory(canvas, day, x, layout);

    if (layout.time !== null) drawTimeCells(canvas, day, snapshot.reporting_zone, x, layout, layout.time, bodyFill);

    if (layout.ot !== null) {
      canvas.rect(x, layout.ot.top, layout.dayWidth, layout.ot.height, bodyFill);
      const cell = otCell(day);
      const baseline = layout.ot.top + layout.ot.height / 2;
      if (cell.marker) canvas.centered(fonts.sans, cell.text, centerX, baseline + 7.5 * CAP_RATIO / 2, 7.5, MUTED);
      else if (cell.text !== '') canvas.centered(fonts.sansBold, cell.text, centerX, baseline + 12 * CAP_RATIO / 2, 12);
    }
  });
}

function drawCategory(canvas: Canvas, day: SnapshotDay, x: number, layout: WeekLayout): void {
  const { fonts } = canvas;
  const width = layout.dayWidth - 6;
  const centerX = x + layout.dayWidth / 2;
  const category = cleanText(day.category ?? '');
  const holiday = day.holiday_name !== null ? cleanText(day.holiday_name) : '';
  const leave = day.leave_minutes > 0 ? `Leave ${formatHoursMinutes(day.leave_minutes)}` : '';
  const subText = [holiday, leave].filter((part) => part !== '').join(' ');
  const face = canDraw(fonts.hand, category) ? fonts.hand : fonts.italic;
  const measureFace = (target: Face) => (text: string, size: number) => target.font.widthOfTextAtSize(text, size);
  const primary = category === '' ? { lines: [] as string[], size: 13 } : fitText(printable(face, category), face === fonts.hand ? 13 : 12, 8, width, subText === '' ? 2 : 1, measureFace(face));
  const sub = subText === '' ? { lines: [] as string[], size: 7 } : fitText(printable(fonts.sans, subText), 7, 5, width, 2, measureFace(fonts.sans));
  const primaryLine = 15;
  const subLine = sub.size * 1.2;
  const block = primary.lines.length * primaryLine + sub.lines.length * subLine + (primary.lines.length > 0 && sub.lines.length > 0 ? 2 : 0);
  let cursor = layout.category.top + (layout.category.height - block) / 2;
  for (const line of primary.lines) {
    canvas.centered(face, line, centerX, cursor + primaryLine * 0.8, primary.size);
    cursor += primaryLine;
  }
  if (primary.lines.length > 0 && sub.lines.length > 0) cursor += 2;
  for (const line of sub.lines) {
    canvas.centered(fonts.sans, line, centerX, cursor + sub.size * 0.9, sub.size, MUTED);
    cursor += subLine;
  }
}

function drawTimeCells(canvas: Canvas, day: SnapshotDay, zone: string, x: number, layout: WeekLayout, time: NonNullable<WeekLayout['time']>, fill: Color | undefined): void {
  const { fonts } = canvas;
  const sessions = sessionTimes(day, zone);
  const overflow = sessions.length > MAX_SESSION_LINES;
  const shown = overflow ? sessions.slice(0, MAX_SESSION_LINES - 1) : sessions;
  const half = layout.dayWidth / 2;
  const size = time.lineHeight >= 16 ? 9.6 : 8;
  for (let row = 0; row < time.lines; row += 1) {
    const rowTop = time.top + row * time.lineHeight;
    const baseline = rowTop + time.lineHeight / 2 + (size * CAP_RATIO) / 2;
    if (overflow && row === time.lines - 1) {
      canvas.rect(x, rowTop, layout.dayWidth, time.lineHeight, fill);
      const more = `+${sessions.length - shown.length} more`;
      const fit = canvas.fitLine(fonts.sans, more, layout.dayWidth - 6, size, 5.5);
      canvas.centered(fonts.sans, fit.text, x + layout.dayWidth / 2, baseline, fit.size);
      continue;
    }
    canvas.rect(x, rowTop, half, time.lineHeight, fill);
    canvas.rect(x + half, rowTop, half, time.lineHeight, fill);
    const session = shown[row];
    if (session === undefined) continue;
    for (const [offset, value] of [session.start, session.end].entries()) {
      if (value === '') continue;
      const fit = canvas.fitLine(fonts.sans, value, half - 3, size, 5.5);
      canvas.centered(fonts.sans, fit.text, x + offset * half + half / 2, baseline, fit.size);
    }
  }
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
    // F-5 b: a manual revision carries its saved signature image when one exists, else the printed name alone.
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
  const showTime = input.rows?.time ?? true;
  const showOt = input.rows?.ot ?? snapshot.show_ot_on_pdf;
  const sessionLines = Math.min(MAX_SESSION_LINES, Math.max(1, ...snapshot.days.map((day) => day.sessions.length)));
  const layout = pdfLayout({ timeRows: showTime, otRows: showOt, sessionLines });

  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.registerFontkit(fontkit);
  const bytes = await loadPdfFontBytes();
  const embed = async (data: Uint8Array, customName: string): Promise<Face> => {
    const font = await doc.embedFont(data, { subset: true, customName });
    return { font, supported: new Set(font.getCharacterSet()) };
  };
  const fonts: Fonts = {
    sans: await embed(bytes.sans, 'AAAAAA+DejaVuSans'),
    sansBold: await embed(bytes.sansBold, 'BAAAAA+DejaVuSans-Bold'),
    serif: await embed(bytes.serifCondensedBold, 'CAAAAA+DejaVuSerifCondensed-Bold'),
    italic: await embed(bytes.serifItalic, 'DAAAAA+DejaVuSerif-Italic'),
    hand: await embed(bytes.hand, 'EAAAAA+IndieFlower'),
  };

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
  const center = PAGE_WIDTH / 2;

  // Header line: the logo and wordmark on the left; "Revision n" in teal with the submission id under it on the right.
  const { header, titles, fields } = layout;
  drawLogo(page, MARGIN, header.logoTop, header.logoSize);
  const wordmarkScale = header.wordmarkHeight / WORDMARK_SIZE.height;
  const wordmarkX = MARGIN + header.logoSize + 7;
  page.drawSvgPath(WORDMARK_MAIN_PATH, { x: wordmarkX, y: top(header.wordmarkTop), scale: wordmarkScale, color: hex(WORDMARK_COLORS.main) });
  page.drawSvgPath(WORDMARK_SUB_PATH, { x: wordmarkX, y: top(header.wordmarkTop), scale: wordmarkScale, color: hex(WORDMARK_COLORS.sub) });
  canvas.right(fonts.sans, `Revision ${input.revisionNo}`, right, header.revisionBaseline, 9, TEAL);
  const id = canvas.fitLine(fonts.sans, input.submissionId, 230, 7.5, 5.5);
  canvas.right(fonts.sans, id.text, right, header.idBaseline, id.size, MUTED);

  // The two title lines, centred.
  canvas.centered(fonts.serif, COMPANY, center, titles.companyBaseline, 17);
  canvas.centered(fonts.serif, TITLE, center, titles.titleBaseline, 18);
  if (autoNote?.enabled === true) {
    // The user's own optional note, one plain line between the titles and the fields.
    const note = canvas.fitLine(fonts.sans, autoNote.text, CONTENT_WIDTH, 9, 6);
    canvas.centered(fonts.sans, note.text, center, layout.noteBaseline, note.size, MUTED);
  }

  // Employee and Payroll Date on one line, Period below: bold labels, underlined values, 54pt inside the margins.
  const labelSize = 10.5;
  const valueSize = 11;
  const underline = (x1: number, x2: number, baseline: number): void => canvas.line(x1, x2, baseline + 2.5, 0.6, INK);
  const payrollValue = formatUsDate(snapshot.period.payroll_date);
  const payrollLabel = 'Payroll Date:';
  const payrollUnderlineWidth = Math.max(canvas.width(fonts.sans, payrollValue, valueSize) + 10, 84);
  const payrollX1 = fields.rightEdge - payrollUnderlineWidth;
  const payrollLabelX = payrollX1 - 6 - canvas.width(fonts.serif, payrollLabel, labelSize);
  canvas.text(fonts.serif, payrollLabel, payrollLabelX, fields.employeeBaseline, labelSize);
  canvas.text(fonts.sans, payrollValue, payrollX1 + 5, fields.employeeBaseline, valueSize);
  underline(payrollX1, fields.rightEdge, fields.employeeBaseline);

  const employeeLabel = 'Employee:';
  const employeeValueX = fields.left + canvas.width(fonts.serif, employeeLabel, labelSize) + 6;
  const employeeMax = payrollLabelX - 14 - employeeValueX - 5;
  const employee = canvas.fitLine(fonts.sans, snapshot.employee.name, employeeMax, valueSize, 6.5);
  canvas.text(fonts.serif, employeeLabel, fields.left, fields.employeeBaseline, labelSize);
  canvas.text(fonts.sans, employee.text, employeeValueX + 5, fields.employeeBaseline, employee.size);
  underline(employeeValueX, employeeValueX + Math.min(Math.max(canvas.width(fonts.sans, employee.text, employee.size) + 10, 120), employeeMax + 5), fields.employeeBaseline);

  const periodLabel = 'Period:';
  const periodValue = `${formatUsDate(snapshot.period.period_start)} - ${formatUsDate(snapshot.period.period_end)}`;
  const periodValueX = fields.left + canvas.width(fonts.serif, periodLabel, labelSize) + 6;
  canvas.text(fonts.serif, periodLabel, fields.left, fields.periodBaseline, labelSize);
  canvas.text(fonts.sans, periodValue, periodValueX + 5, fields.periodBaseline, valueSize);
  underline(periodValueX, periodValueX + Math.max(canvas.width(fonts.sans, periodValue, valueSize) + 10, 120), fields.periodBaseline);

  // Two Monday-Sunday week tables with the 14 dates.
  drawWeek(canvas, snapshot, snapshot.days.slice(0, DAYS_PER_WEEK), 1, layout.weeks[0]);
  drawWeek(canvas, snapshot, snapshot.days.slice(DAYS_PER_WEEK), 2, layout.weeks[1]);

  // Overtime total, right-aligned in small capitals; the pending note on the left.
  if (showOt) {
    const totalSize = 10.5;
    const value = formatHoursMinutes(snapshot.totals.credited_minutes);
    const gap = 12;
    const unitWidth = canvas.smallCapsWidth(fonts.sans, 'h:mm', totalSize);
    const valueWidth = canvas.width(fonts.sans, value, totalSize);
    const labelWidth = canvas.smallCapsWidth(fonts.sans, 'Overtime Total :', totalSize);
    const startX = layout.total.rightEdge - (labelWidth + gap + valueWidth + gap + unitWidth);
    canvas.smallCaps(fonts.sans, 'Overtime Total :', startX, layout.total.baseline, totalSize);
    canvas.text(fonts.sans, value, startX + labelWidth + gap, layout.total.baseline, totalSize);
    canvas.smallCaps(fonts.sans, 'h:mm', startX + labelWidth + gap + valueWidth + gap, layout.total.baseline, totalSize);
    if (snapshot.totals.pending_days > 0) {
      canvas.text(fonts.sans, `${snapshot.totals.pending_days} day(s) with OT pending are not in the total.`, MARGIN, layout.total.baseline, 7.5, MUTED);
    }
  }

  // Employee signature: the image above the line when one exists, the printed name and the date; blank manager row.
  const sig = layout.signature;
  let nameX = sig.employeeLine.x1 + 4;
  if (input.signatureImage !== null) {
    const image = await embedSignature(doc, input.signatureImage);
    const placed = fitImage(image.width, image.height, SIGNATURE_BOX.width, SIGNATURE_BOX.height);
    page.drawImage(image, { x: sig.employeeLine.x1 + 2, y: top(sig.imageBottom), width: placed.width, height: placed.height });
    nameX = sig.employeeLine.x1 + 2 + placed.width + 8;
  }
  const lineMid = (line: { x1: number; x2: number }): number => (line.x1 + line.x2) / 2;
  canvas.line(sig.employeeLine.x1, sig.employeeLine.x2, sig.employeeLine.y);
  canvas.centered(fonts.serif, 'Employee Signature', lineMid(sig.employeeLine), sig.employeeLine.y + sig.captionBaseline, labelSize);
  const signer = canvas.fitLine(fonts.sans, input.signerName, sig.employeeDateLine.x1 - 12 - nameX, 9.5, 6.5);
  canvas.text(fonts.sans, signer.text, nameX, sig.employeeLine.y + sig.textBaseline, signer.size);
  canvas.line(sig.employeeDateLine.x1, sig.employeeDateLine.x2, sig.employeeDateLine.y);
  canvas.centered(fonts.sans, signDate, lineMid(sig.employeeDateLine), sig.employeeDateLine.y + sig.textBaseline, valueSize);
  canvas.centered(fonts.serif, 'Date', lineMid(sig.employeeDateLine), sig.employeeDateLine.y + sig.captionBaseline, labelSize);

  canvas.line(sig.managerLine.x1, sig.managerLine.x2, sig.managerLine.y);
  canvas.centered(fonts.serif, 'Manager Signature', lineMid(sig.managerLine), sig.managerLine.y + sig.captionBaseline, labelSize);
  canvas.line(sig.managerDateLine.x1, sig.managerDateLine.x2, sig.managerDateLine.y);
  canvas.centered(fonts.serif, 'Date', lineMid(sig.managerDateLine), sig.managerDateLine.y + sig.captionBaseline, labelSize);

  // Footer: the copyright (the year of the payroll date, not of the clock) and the internal-use notice.
  canvas.line(MARGIN, right, layout.footer.ruleY, 0.4, RULE);
  canvas.text(fonts.sans, `© ${snapshot.period.payroll_date.slice(0, 4)} C&D Semiconductor Services, Inc. All rights reserved.`, MARGIN, layout.footer.baseline, 7, MUTED);
  canvas.right(fonts.sans, FOOTER_RIGHT, right, layout.footer.baseline, 7, MUTED);

  return doc.save({ useObjectStreams: false, objectsPerTick: Number.POSITIVE_INFINITY });
}
