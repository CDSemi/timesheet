import { addDays, diffDays, isoWeekday } from '../../domain/dates.ts';
import { formatHoursMinutes } from '../../domain/format.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone, localDateOf } from '../../domain/zones.ts';
import type { DayView, FinalizationResponse, Session, TimesheetView } from '../api.ts';
import { completenessOf, type StatusShape, WEEKDAYS } from './dayModel.ts';
import { usDate, usShortDate } from './format.ts';

/*
 * Pure display mapping of the timesheet sheet: the Excel form's rows (Day, Date, Label, Time, OT)
 * plus a Check row, filled from the server's day view (WP5-UX-PLAN section B). Every minute shown
 * is a server field formatted as h:mm; nothing here adds, subtracts or compares minutes, derives a
 * status from the device clock, or reproduces a workbook formula (no 8.5-hour daily OT, no
 * Sunday-less or decimal total, no TODAY() date, no seeded weekend times). Dates are the saved
 * accounting dates; session times are shown in the display zone (R-07).
 */

/** The form header, as on the Excel template and the PDF. */
export const SHEET_COMPANY = 'C&D Semiconductor Services, Inc.';
export const SHEET_TITLE = 'Time sheet for salaried exempt employees';

/** The visual row names; each cell repeats its row name for screen readers. */
export const SHEET_ROWS = { day: 'Day', date: 'Date', label: 'Label', time: 'Time', ot: 'OT (h:mm)', check: 'Check' } as const;
export const DETAIL_ROWS = { regular: 'Worked on a workday', offCalendar: 'Worked on a day off' } as const;

export type CheckKey = 'complete' | 'running' | 'open_session' | 'confirm_breaks' | 'missing' | 'upcoming' | 'error';

/** The Check cell: words plus a shape (never colour alone). Blank days have no check. */
export interface SheetCheck {
  key: CheckKey;
  text: string;
  /** `live` is the running-session marker; it is static under reduced motion. */
  shape: StatusShape | 'live';
}

export interface SheetLabel {
  /** The day label: the category, the holiday name, or "Work from home". Empty when the calendar has none. */
  main: string;
  /** Smaller lines under the label: holiday, leave, WFH outside Worked. */
  lines: string[];
  /** True when the day carries a note (the text itself stays in the day editor). */
  note: boolean;
}

export interface SheetRange {
  key: string;
  /** `HH:MM-HH:MM` in the display zone, `+N` when the end is N local days later, or just `HH:MM` while running. */
  text: string;
  /** The local start date `MM/DD` when it is not the accounting date (another zone, or after midnight). */
  startDate: string | null;
}

export interface SheetTime {
  ranges: SheetRange[];
  /** A short note under the times: breaks, running, or that times are missing. */
  note: string | null;
  /** The cell needs the person's input (unconfirmed breaks or no times on an expected day). */
  attention: boolean;
}

export type OtKind = 'minutes' | 'pending' | 'na' | 'blank';

/** The OT cell by the PDF rule: credited h:mm of a complete day, "pending", "n/a" or blank. */
export interface SheetOt {
  kind: OtKind;
  text: string;
}

export interface SheetDay {
  workDate: string;
  weekday: string;
  /** `MM/DD`, the date cell. */
  dateText: string;
  /** The accessible name of the day, for example `Mon 2026-11-23`. */
  name: string;
  today: boolean;
  /** A non-working day of the server calendar (weekend, holiday, closure); never inferred from the weekday. */
  nonworking: boolean;
  label: SheetLabel;
  time: SheetTime;
  ot: SheetOt;
  check: SheetCheck | null;
  /** The "Show details" rows, h:mm of the server's minutes; blank when the server has no value. */
  details: { regular: string; offCalendar: string };
}

export interface SheetWeek {
  /** 1 for the first week of the period, 2 for the second. */
  index: number;
  /** `MM/DD/YYYY - MM/DD/YYYY`, as the PDF's week heading. */
  rangeText: string;
  /** The accessible range, for example `11/23/2026 to 11/29/2026`. */
  rangeName: string;
  days: SheetDay[];
}

const LEAVE_WORD = { vacation: 'Vacation', sick: 'Sick', ot: 'OT' } as const;

const hm = (minutes: number | null | undefined): string => (minutes === null || minutes === undefined ? '' : formatHoursMinutes(minutes));

/** The label cell: holiday name in the cell, WFH as "Work from home", leave as a second line. */
export function sheetLabel(day: DayView): SheetLabel {
  const category = day.category ?? '';
  const holiday = day.classification?.name ?? null;
  const lines: string[] = [];
  let main: string = category;
  if (holiday !== null && holiday !== '') {
    if (category === 'Holiday') {
      main = holiday;
      lines.push('Holiday');
    } else {
      lines.push(holiday);
    }
  }
  if (day.wfh) {
    if (category === 'Worked') main = 'Work from home';
    else lines.push('Work from home');
  }
  if (day.leave_minutes > 0) {
    const kind = day.leave_kind === null ? null : LEAVE_WORD[day.leave_kind];
    // A vacation or sick day already says what the leave is; any other day names the kind.
    const named = kind === null || kind === category ? 'Leave' : `${kind} leave`;
    lines.push(`${named} ${formatHoursMinutes(day.leave_minutes)}`);
  }
  if (day.category === null && day.classification === null) lines.push('Not in the calendar');
  return { main, lines, note: (day.entry?.notes ?? '') !== '' };
}

function localParts(instant: string, zone: string): { date: string; time: string } {
  const seconds = parseUtcInstant(instant);
  return { date: localDateOf(zone, seconds), time: formatInZone(zone, seconds).slice(11, 16) };
}

/** One session as the PDF prints it, but in the display zone: `08:00-17:00`, `22:00-06:00+1`, or `08:12` while running. */
export function sessionRange(session: Session, workDate: string, zone: string): SheetRange {
  const start = localParts(session.start_utc, zone);
  const startDate = start.date === workDate ? null : usShortDate(start.date);
  if (session.end_utc === null) return { key: session.id, text: start.time, startDate };
  const end = localParts(session.end_utc, zone);
  const later = diffDays(end.date, start.date);
  return { key: session.id, text: `${start.time}-${end.time}${later > 0 ? `+${later}` : ''}`, startDate };
}

function breaksNote(sessions: readonly Session[]): string | null {
  if (sessions.length === 0) return null;
  if (sessions.some((session) => session.end_utc === null)) return 'running';
  if (sessions.some((session) => !session.breaks_confirmed)) return 'breaks not confirmed';
  const count = sessions.reduce((sum, session) => sum + session.breaks.length, 0);
  if (count === 0) return 'no breaks';
  return count === 1 ? '1 break' : `${count} breaks`;
}

/** The OT cell, the same rule as the PDF's OT row (timesheetPdf.ts `otCellText`). */
export function sheetOt(day: DayView): SheetOt {
  if (day.calculation_error !== null) return { kind: 'na', text: 'n/a' };
  const status = day.calculation?.status;
  const credited = day.calculation?.credited_minutes ?? null;
  if (status === 'complete' && credited !== null) return { kind: 'minutes', text: formatHoursMinutes(credited) };
  if (status === 'incomplete' || status === 'incomplete_breaks') return { kind: 'pending', text: 'pending' };
  return { kind: 'blank', text: '' };
}

/** The Check cell from the server's calculation status; a day that needs nothing is blank. */
export function sheetCheck(day: DayView, todayLocal: string | null): SheetCheck | null {
  const status = completenessOf(day, todayLocal);
  switch (status.completeness) {
    case 'complete':
      return { key: 'complete', text: 'Complete', shape: 'circle' };
    case 'open_session':
      return day.sessions.some((session) => session.end_utc === null)
        ? { key: 'running', text: 'Running', shape: 'live' }
        : { key: 'open_session', text: 'Open session', shape: 'diamond' };
    case 'confirm_breaks':
      return { key: 'confirm_breaks', text: 'Confirm breaks', shape: 'diamond' };
    case 'missing':
      // The server has no calculation for an expected day: normally no times at all.
      return { key: 'missing', text: day.sessions.length === 0 ? 'No times' : 'Missing record', shape: 'square' };
    case 'upcoming':
      return { key: 'upcoming', text: 'Upcoming', shape: 'bar' };
    case 'error':
      return { key: 'error', text: 'Calculation problem', shape: 'triangle' };
    case 'not_expected':
      return null;
  }
}

export function sheetDay(day: DayView, zone: string, todayLocal: string | null): SheetDay {
  const weekday = WEEKDAYS[isoWeekday(day.work_date) - 1] ?? '';
  const check = sheetCheck(day, todayLocal);
  const missing = check?.key === 'missing' && day.sessions.length === 0;
  return {
    workDate: day.work_date,
    weekday,
    dateText: usShortDate(day.work_date),
    name: `${weekday} ${day.work_date}`,
    today: todayLocal !== null && day.work_date === todayLocal,
    nonworking: day.classification?.day_class === 'nonworking',
    label: sheetLabel(day),
    time: {
      ranges: day.sessions.map((session) => sessionRange(session, day.work_date, zone)),
      note: missing ? 'no times yet' : breaksNote(day.sessions),
      attention: check?.key === 'missing' || check?.key === 'confirm_breaks',
    },
    ot: sheetOt(day),
    check,
    details: { regular: hm(day.calculation?.regular_minutes), offCalendar: hm(day.calculation?.nonworking_minutes) },
  };
}

/** Consecutive days grouped into Monday to Sunday weeks, numbered from 1 (a two-week period gives two). */
export function sheetWeeks(days: readonly DayView[], zone: string, todayLocal: string | null): SheetWeek[] {
  const weeks: Array<{ monday: string; days: DayView[] }> = [];
  for (const day of days) {
    const monday = addDays(day.work_date, -(isoWeekday(day.work_date) - 1));
    const last = weeks.at(-1);
    if (last?.monday === monday) last.days.push(day);
    else weeks.push({ monday, days: [day] });
  }
  return weeks.map((week, index) => {
    const first = week.days[0]?.work_date ?? week.monday;
    const end = week.days.at(-1)?.work_date ?? week.monday;
    return {
      index: index + 1,
      rangeText: `${usDate(first)} - ${usDate(end)}`,
      rangeName: `${usDate(first)} to ${usDate(end)}`,
      days: week.days.map((day) => sheetDay(day, zone, todayLocal)),
    };
  });
}

/** "Overtime Total :" from the server's provisional total, and the pending note (the PDF's wording, counted). */
export function overtimeTotal(totals: TimesheetView['totals']): { text: string; pendingNote: string | null } {
  const pending = totals.pending_days;
  const pendingNote =
    pending === 0 ? null : pending === 1 ? '1 day with OT pending is not in the total.' : `${pending} days with OT pending are not in the total.`;
  return { text: formatHoursMinutes(totals.provisional_credited_minutes), pendingNote };
}

export interface SignatureLines {
  /** What the employee signature line says: never the signature image. */
  employee: string;
  /** The signature date `MM/DD/YYYY` in the reporting zone, or empty. */
  date: string;
  signed: boolean;
}

function reportingDate(instant: string, zone: string): string {
  try {
    return usDate(localDateOf(zone, parseUtcInstant(instant)));
  } catch {
    return '';
  }
}

/**
 * The employee signature line from the finalization state: the signer's name and the sign-off date,
 * or the automatic submission with its submission date (the date the PDF prints), or "Not signed
 * yet". Dates are in the reporting zone; there is no TODAY() date.
 */
export function signatureLines(finalization: FinalizationResponse, reportingZone: string): SignatureLines {
  const revision = finalization.revision;
  if (revision === null || finalization.finalized_revision_no === null) return { employee: 'Not signed yet', date: '', signed: false };
  if (finalization.signoff !== null) {
    return { employee: `Signed by ${finalization.signoff.signer_name}`, date: reportingDate(finalization.signoff.signed_at, reportingZone), signed: true };
  }
  const text = revision.origin === 'deadline' && revision.review_state === 'pending' ? 'Submitted automatically, review pending' : 'Submitted';
  return { employee: text, date: reportingDate(revision.created_at, reportingZone), signed: false };
}
