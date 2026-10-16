import {
  breakLabel,
  type BreakRowDraft,
  breakRowEnd,
  type BreakRowPatch,
  chooseBreakRowFold,
  editBreakRow,
  parseBreakMinutes,
  type SessionDialogDraft,
} from './breakRowsModel.ts';
import { usDate } from './format.ts';
import { editField } from './sessionModel.ts';

/*
 * Display model of the break list of the session dialog (WP5-UX3-T08B, owner decisions Q6 b and N-1). Pure: nothing here reads
 * the device clock, the device zone or the DOM. It decides when a break row has its own date field, keeps the hidden row dates on
 * the session date, builds the text of a break chip, and picks the list layout from a measured width.
 */

/**
 * Owner answer Q6 (b): a break row has its own date field only when the session crosses local midnight in the input zone (its
 * start and end dates differ) or has no end yet (the end date is empty, or there is no start date to follow). Otherwise a break
 * is on the session's date and no date field is shown. Both dates are the typed civil dates `YYYY-MM-DD` of the input zone.
 */
export function breakDateVisible(startDate: string, endDate: string): boolean {
  return startDate === '' || endDate === '' || startDate !== endDate;
}

/**
 * While no date field is shown, every row's date is the session's start date, also after the session date or the input zone
 * changed. A row on another date is moved to it as a changed row (its pin is dropped, as for a typed date); a draft whose rows
 * already follow, or whose date field is shown, is returned as it is.
 */
export function followSessionDate(draft: SessionDialogDraft): SessionDialogDraft {
  if (breakDateVisible(draft.start.date, draft.end.date)) return draft;
  const date = draft.start.date;
  if (draft.rows.every((row) => row.start.date === date)) return draft;
  return {
    ...draft,
    rows: draft.rows.map((row) => (row.start.date === date ? row : { ...row, start: editField(row.start, { date }), edited: true })),
  };
}

/**
 * Applies what the "Break n" sub-dialog edited to the session draft with the T06 functions, changing only what differs (a row
 * that was not touched keeps its pinned instants): a new date or time drops the pin and the fold, new minutes keep the start, and
 * the fold chosen in the sub-dialog is set after the start. A draft without that row is returned as it is.
 */
export function applyBreakEdit(draft: SessionDialogDraft, key: string, edited: BreakRowDraft): SessionDialogDraft {
  const row = draft.rows.find((item) => item.key === key);
  if (row === undefined) return draft;
  const patch: BreakRowPatch = {};
  if (edited.start.date !== row.start.date) patch.date = edited.start.date;
  if (edited.start.time !== row.start.time) patch.time = edited.start.time;
  if (edited.minutes !== row.minutes) patch.minutes = edited.minutes;
  const startMoved = patch.date !== undefined || patch.time !== undefined;
  let next = startMoved || patch.minutes !== undefined ? editBreakRow(draft, key, patch) : draft;
  if (edited.start.fold !== null && (startMoved || edited.start.fold !== row.start.fold)) next = chooseBreakRowFold(next, key, edited.start.fold);
  return next;
}

/** The parts of a chip: `text` is what is shown, `spoken` reads the arrow as "to" for a screen reader. */
export interface BreakChipText {
  /** "Break 1" */
  label: string;
  /** The start as shown: `10:00`, or `10/12/2026 23:40` for an overnight session; null while the row has no time. */
  start: string | null;
  /** The computed end time (24-hour, no date); null while the row cannot be resolved. */
  end: string | null;
  /** Why there is no end ("minutes missing"), or null. */
  problem: string | null;
  /** `Break 1 · 10:00 → 10:15` or `Break 3 · 14:30, minutes missing`. */
  text: string;
  /** The same with "to" instead of the arrow. */
  spoken: string;
}

function missingPieces(row: BreakRowDraft, overnight: boolean): string[] {
  const missing: string[] = [];
  if (overnight && row.start.date === '') missing.push('date');
  if (row.start.time === '') missing.push('start time');
  if (row.minutes.trim() === '') missing.push('minutes');
  return missing;
}

/**
 * The text of a break chip, 24-hour: `Break 1 · 10:00 → 10:15`, and for an overnight session (the date field is shown)
 * `Break 2 · 10/12/2026 23:40 → 00:10`. A row that cannot be resolved says why, for example `Break 3 · 14:30, minutes missing`.
 */
export function breakChipText(row: BreakRowDraft, index: number, zone: string, overnight: boolean): BreakChipText {
  const label = breakLabel(index);
  const time = row.start.time;
  const start = time === '' ? null : overnight && row.start.date !== '' ? `${usDate(row.start.date)} ${time}` : time;
  const end = breakRowEnd(row, index, zone);
  if (end !== null) {
    const endTime = end.time;
    return {
      label,
      start,
      end: endTime,
      problem: null,
      text: `${label} · ${start ?? ''} → ${endTime}`,
      spoken: `${label} · ${start ?? ''} to ${endTime}`,
    };
  }
  const missing = missingPieces(row, overnight);
  let problem: string;
  if (missing.length > 0) problem = `${missing.join(' and ')} missing`;
  else if (!parseBreakMinutes(row.minutes).ok) problem = 'minutes not valid';
  else problem = 'check the start time';
  const text = `${label} · ${start === null ? problem : `${start}, ${problem}`}`;
  return { label, start, end: null, problem, text, spoken: text };
}

/*
 * The list layout by the width of the break list (the one-line row from 42rem is a CSS container query on the same width). The
 * fields line of a two-line row ([date], start time, minutes, remove) stays on one line while the list is at least as wide as the
 * flex bases of its parts plus the fixed pixels, measured in the mobile project (WP5-UX3-T08B, 15px root):
 *   same-day row: time 6.8rem + minutes 5.6rem = 12.4rem, plus remove 44px + 2 gaps of 8px + the strip's 12px/8px padding and
 *                 2px border (22px) = 82px; at 15px 268px (17.9rem); the probe kept one line at 272px and wrapped at 264px;
 *   overnight row: the date 7.6rem too = 20rem, plus 44px + 3 gaps of 8px + 22px = 90px; at 15px 390px (26rem); one line at
 *                 392px, wrapped at 384px.
 * Below that width each break is a chip that opens the "Break n" sub-dialog. The rem parts mirror --break-time-w, --break-min-w
 * and --break-date-w, so a different root font size moves the threshold with the fields.
 */
export const ROW_FIELDS_REM_SAME_DAY = 12.4;
export const ROW_FIELDS_REM_OVERNIGHT = 20;
export const ROW_FIXED_PX_SAME_DAY = 82;
export const ROW_FIXED_PX_OVERNIGHT = 90;

export type BreakListLayout = 'rows' | 'chips';

/** The least list width, in pixels, at which the fields of a row share one line. */
export function breakRowsMinWidth(remPx: number, dateVisible: boolean): number {
  return dateVisible ? ROW_FIELDS_REM_OVERNIGHT * remPx + ROW_FIXED_PX_OVERNIGHT : ROW_FIELDS_REM_SAME_DAY * remPx + ROW_FIXED_PX_SAME_DAY;
}

/** `rows` while the list is wide enough for the rows of this session, else `chips`. */
export function breakListLayout(widthPx: number, remPx: number, dateVisible: boolean): BreakListLayout {
  return widthPx < breakRowsMinWidth(remPx, dateVisible) ? 'chips' : 'rows';
}
