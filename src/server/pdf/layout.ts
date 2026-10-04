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
export const SIGNATURE_BOX = { width: 210, height: 54 } as const;

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
