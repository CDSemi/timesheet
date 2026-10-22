import { assertCivilDate, isoWeekday } from '../../domain/dates.ts';

/*
 * Pure geometry and text helpers for the timesheet PDF (docs/04 "Email and PDF"). Nothing
 * here depends on pdf-lib or on the clock, and nothing computes a business minute: the
 * renderer only formats values that the production engine already put in the snapshot.
 */

/** US Letter portrait, in PDF points. */
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;
export const MARGIN = 36;
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

/** The bounded signature image area (points). The image is scaled into it, aspect ratio kept. */
export const SIGNATURE_BOX = { width: 152, height: 54 } as const;

/*
 * The one-page geometry (WP5-UX5-T02, plan Addendum 2 "C, revised"). Every value is in points and, unless a name says
 * "baseline", a distance from the TOP of the page (the renderer flips it). `pdfLayout` spreads the height of a hidden
 * row over the category row, so a week table is always WEEK_TABLE_HEIGHT tall and the page never overflows.
 */
export const WEEK_TABLE_HEIGHT = 136;
export const LEFT_COLUMN = 19;
export const FIELD_INDENT = 54;
const HEAD_ROW = 34;
const TIME_ROW = 16;
const TIME_STACK_ROW = 12;
const OT_ROW = 17;
/** The most session lines stacked in a time cell; a day with more shows the first three and "+n more". */
export const MAX_SESSION_LINES = 4;
const FOOTER_BASELINE = 753;

export type PdfLayoutInput = {
  /** Print the session time rows. */
  timeRows: boolean;
  /** Print the OT rows. */
  otRows: boolean;
  /** The most sessions any day of the period has (stacked time lines); 1 when omitted, at most MAX_SESSION_LINES. */
  sessionLines?: number | undefined;
};

export type RowBand = { top: number; height: number };

export type WeekLayout = {
  top: number;
  height: number;
  bottom: number;
  left: number;
  leftColumn: number;
  /** The x of the first day column and the width of one. */
  daysLeft: number;
  dayWidth: number;
  right: number;
  head: RowBand;
  category: RowBand;
  /** The stacked time cells; `lines` rows of `lineHeight` each, or null when hidden. */
  time: (RowBand & { lines: number; lineHeight: number }) | null;
  ot: RowBand | null;
  /** The cell of the vertical "OT" label: the time and OT rows together (or the OT row alone). */
  otLabel: RowBand | null;
};

export type PdfLayout = {
  header: { logoTop: number; logoSize: number; wordmarkHeight: number; wordmarkTop: number; revisionBaseline: number; idBaseline: number };
  titles: { companyBaseline: number; titleBaseline: number };
  noteBaseline: number;
  fields: { left: number; rightEdge: number; employeeBaseline: number; periodBaseline: number };
  weeks: [WeekLayout, WeekLayout];
  total: { baseline: number; rightEdge: number };
  signature: {
    employeeLine: { x1: number; x2: number; y: number };
    employeeDateLine: { x1: number; x2: number; y: number };
    managerLine: { x1: number; x2: number; y: number };
    managerDateLine: { x1: number; x2: number; y: number };
    imageBottom: number;
    captionBaseline: number;
    textBaseline: number;
  };
  footer: { ruleY: number; baseline: number };
  /** The lowest printed edge; always above PAGE_HEIGHT - MARGIN. */
  bottom: number;
};

function weekLayout(top: number, input: { timeRows: boolean; otRows: boolean; sessionLines: number }): WeekLayout {
  const lines = Math.min(MAX_SESSION_LINES, Math.max(1, Math.trunc(input.sessionLines)));
  const lineHeight = lines === 1 ? TIME_ROW : TIME_STACK_ROW;
  const timeHeight = input.timeRows ? lines * lineHeight : 0;
  const otHeight = input.otRows ? OT_ROW : 0;
  const categoryHeight = WEEK_TABLE_HEIGHT - HEAD_ROW - timeHeight - otHeight;
  const head = { top, height: HEAD_ROW };
  const category = { top: top + HEAD_ROW, height: categoryHeight };
  const time = input.timeRows ? { top: category.top + categoryHeight, height: timeHeight, lines, lineHeight } : null;
  const ot = input.otRows ? { top: category.top + categoryHeight + timeHeight, height: otHeight } : null;
  const otLabel = timeHeight + otHeight > 0 ? { top: category.top + categoryHeight, height: timeHeight + otHeight } : null;
  const daysLeft = MARGIN + LEFT_COLUMN;
  return {
    top,
    height: WEEK_TABLE_HEIGHT,
    bottom: top + WEEK_TABLE_HEIGHT,
    left: MARGIN,
    leftColumn: LEFT_COLUMN,
    daysLeft,
    dayWidth: (CONTENT_WIDTH - LEFT_COLUMN) / 7,
    right: MARGIN + CONTENT_WIDTH,
    head,
    category,
    time,
    ot,
    otLabel,
  };
}

/** The page geometry of one variant. Pure: it depends on the two row switches and the stacked session lines only. */
export function pdfLayout(input: PdfLayoutInput): PdfLayout {
  const resolved = { timeRows: input.timeRows, otRows: input.otRows, sessionLines: input.sessionLines ?? 1 };
  const weeks: [WeekLayout, WeekLayout] = [weekLayout(192, resolved), weekLayout(358, resolved)];
  const footerBottom = FOOTER_BASELINE + 2;
  return {
    header: { logoTop: 29, logoSize: 32, wordmarkHeight: 17.6, wordmarkTop: 36.2, revisionBaseline: 38, idBaseline: 48 },
    titles: { companyBaseline: 84, titleBaseline: 112 },
    noteBaseline: 127,
    fields: { left: MARGIN + FIELD_INDENT, rightEdge: PAGE_WIDTH - MARGIN - FIELD_INDENT, employeeBaseline: 148, periodBaseline: 173 },
    weeks,
    total: { baseline: 524, rightEdge: MARGIN + CONTENT_WIDTH - 35 },
    signature: {
      employeeLine: { x1: 55, x2: 203, y: 600 },
      employeeDateLine: { x1: 443, x2: 517, y: 600 },
      managerLine: { x1: 55, x2: 203, y: 680 },
      managerDateLine: { x1: 443, x2: 517, y: 680 },
      imageBottom: 598,
      captionBaseline: 16,
      textBaseline: -4,
    },
    footer: { ruleY: 744, baseline: FOOTER_BASELINE },
    bottom: footerBottom,
  };
}

/**
 * The origin of text rotated 90 degrees (reading upward) so that it is centred in a cell both ways: `x` is the baseline
 * (glyph tops point left), `y` is the start of the text in the PDF's own bottom-up coordinates.
 */
export function rotatedLabelOrigin(cell: { x: number; top: number; width: number; height: number }, textWidth: number, capHeight: number): { x: number; y: number } {
  return { x: cell.x + cell.width / 2 + capHeight / 2, y: PAGE_HEIGHT - (cell.top + cell.height / 2) - textWidth / 2 };
}

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export class PdfRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfRenderError';
  }
}

/** Whole minutes as h:mm (never decimal hours): 90 -> "1:30", 5 -> "0:05". */
export function formatHoursMinutes(minutes: number): string {
  if (!Number.isSafeInteger(minutes) || minutes < 0) {
    throw new PdfRenderError('Minutes must be a non-negative whole number');
  }
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

/** `YYYY-MM-DD` as the US form date `MM/DD/YYYY`. */
export function formatUsDate(date: string): string {
  const valid = assertCivilDate(date);
  return `${valid.slice(5, 7)}/${valid.slice(8, 10)}/${valid.slice(0, 4)}`;
}

export function weekdayName(date: string): string {
  return WEEKDAY_NAMES[isoWeekday(date) - 1] ?? 'Monday';
}

/*
 * Control characters, line and paragraph separators, zero-width and bidirectional controls are
 * replaced by a plain space. Free text on the sheet (names, categories, holiday names) never
 * changes the layout or hides text.
 */
const UNSAFE_TEXT = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;

export function cleanText(text: string): string {
  return text.normalize('NFC').replace(UNSAFE_TEXT, ' ').replace(/\s+/g, ' ').trim();
}

export type MeasureText = (text: string, size: number) => number;

function splitLongWord(word: string, size: number, maxWidth: number, measure: MeasureText): string[] {
  const parts: string[] = [];
  let current = '';
  for (const char of word) {
    if (current !== '' && measure(current + char, size) > maxWidth) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current !== '') parts.push(current);
  return parts;
}

/** Greedy word wrap; a word wider than the line is broken by character. Empty text gives no line. */
export function wrapText(text: string, size: number, maxWidth: number, measure: MeasureText): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of cleanText(text).split(' ')) {
    if (word === '') continue;
    const candidate = line === '' ? word : `${line} ${word}`;
    if (measure(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line !== '') lines.push(line);
    if (measure(word, size) <= maxWidth) {
      line = word;
      continue;
    }
    const pieces = splitLongWord(word, size, maxWidth, measure);
    line = pieces.pop() ?? '';
    lines.push(...pieces);
  }
  if (line !== '') lines.push(line);
  return lines;
}

export type FittedText = { lines: string[]; size: number; truncated: boolean };

/** Truncates a line with an ellipsis until it fits the width. */
function ellipsize(line: string, size: number, maxWidth: number, measure: MeasureText): string {
  const ellipsis = String.fromCodePoint(0x2026);
  if (measure(line, size) <= maxWidth) return line;
  const chars = [...line];
  while (chars.length > 0 && measure(chars.join('') + ellipsis, size) > maxWidth) chars.pop();
  return chars.join('') + ellipsis;
}

/**
 * Wraps text into at most `maxLines` lines inside `maxWidth`, shrinking the size from `maxSize`
 * to `minSize` first. At the minimum size the text that still does not fit is cut with an
 * ellipsis (and reported as truncated) so no line ever leaves the cell.
 */
export function fitText(
  text: string,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number,
  measure: MeasureText,
): FittedText {
  for (let size = maxSize; size >= minSize; size -= 0.5) {
    const lines = wrapText(text, size, maxWidth, measure);
    if (lines.length <= maxLines) return { lines, size, truncated: false };
  }
  const lines = wrapText(text, minSize, maxWidth, measure);
  const kept = lines.slice(0, maxLines);
  const last = kept.length - 1;
  if (last >= 0) {
    kept[last] = ellipsize(`${kept[last] ?? ''} ${lines.slice(maxLines).join(' ')}`.trim(), minSize, maxWidth, measure);
  }
  return { lines: kept, size: minSize, truncated: true };
}

export type ImagePlacement = { width: number; height: number };

/** Scales an image into the box keeping its aspect ratio; never zero-sized, never beyond the box. */
export function fitImage(imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number): ImagePlacement {
  if (!(imageWidth > 0) || !(imageHeight > 0)) throw new PdfRenderError('The signature image has no size');
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  return { width: imageWidth * scale, height: imageHeight * scale };
}

/**
 * A download/attachment name that is safe on every platform and in headers: ASCII letters, digits
 * and underscores only; Vietnamese and other accents are reduced to the base letter.
 */
export function sanitizeFileNamePart(value: string, fallback: string, maxLength = 40): string {
  const ascii = value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(new RegExp(String.fromCodePoint(0x111), 'g'), 'd')
    .replace(new RegExp(String.fromCodePoint(0x110), 'g'), 'D')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength)
    .replace(/_+$/g, '');
  return ascii === '' ? fallback : ascii;
}

export function timesheetPdfFileName(input: { employeeName: string; payrollDate: string; revisionNo: number }): string {
  const payroll = assertCivilDate(input.payrollDate, 'payrollDate');
  if (!Number.isSafeInteger(input.revisionNo) || input.revisionNo < 1) {
    throw new PdfRenderError('Revision number must be a positive whole number');
  }
  return `Timesheet_${sanitizeFileNamePart(input.employeeName, 'employee')}_${payroll}_r${input.revisionNo}.pdf`;
}
