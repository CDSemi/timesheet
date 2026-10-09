/*
 * Partial leave typed as hours and minutes (docs/04 "Use hours/minutes"). This is an input unit
 * conversion only: the two fields become the same integer `leave_minutes` the day endpoint has
 * always taken, with the same limit of 0 to 1440 minutes. No business figure is computed here;
 * the server still validates the day and owns every calculation.
 */

/** The largest leave a day can carry, in minutes (the API limit, unchanged). */
export const LEAVE_MAX_MINUTES = 1440;
export const LEAVE_MAX_HOURS = LEAVE_MAX_MINUTES / 60;
const MINUTES_PER_HOUR = 60;

/** The text of the two leave fields; parsed when the day is saved. */
export interface LeaveInput {
  hours: string;
  minutes: string;
}

export type LeaveParse = { ok: true; minutes: number } | { ok: false; message: string };

export const LEAVE_INPUT_MESSAGE = 'Enter leave as whole hours (0 to 24) and minutes (0 to 59), at most 24h 00m.';

/** The fields for a stored number of leave minutes: 240 gives 4 and 0, 90 gives 1 and 30. */
export function leaveInputOf(totalMinutes: number): LeaveInput {
  const whole = Math.max(0, Math.trunc(totalMinutes));
  return { hours: String(Math.floor(whole / MINUTES_PER_HOUR)), minutes: String(whole % MINUTES_PER_HOUR) };
}

function wholeNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/**
 * The integer leave minutes of the two fields. Empty fields count as 0. Hours must be whole and
 * 0 to 24, minutes whole and 0 to 59, and the total at most 1440 (24h 00m), as the API requires.
 */
export function parseLeaveInput(input: LeaveInput): LeaveParse {
  const hours = wholeNumber(input.hours);
  const minutes = wholeNumber(input.minutes);
  if (hours === null || minutes === null || hours > LEAVE_MAX_HOURS || minutes >= MINUTES_PER_HOUR) {
    return { ok: false, message: LEAVE_INPUT_MESSAGE };
  }
  const total = hours * MINUTES_PER_HOUR + minutes;
  if (total > LEAVE_MAX_MINUTES) return { ok: false, message: LEAVE_INPUT_MESSAGE };
  return { ok: true, minutes: total };
}
