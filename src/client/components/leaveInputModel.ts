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
  /**
   * A number field reports text it cannot read ("2-", "e") as an empty value, the same as an empty
   * field. The form copies the browser's `validity.badInput` here so such text is refused, never read as 0.
   */
  hoursBad?: boolean;
  minutesBad?: boolean;
}

/** Which of the two parts is wrong; both are marked when each is fine alone but the total passes 24h 00m. */
export interface LeaveParts {
  hours: boolean;
  minutes: boolean;
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
  const parts = invalidLeaveParts(input);
  if (parts.hours || parts.minutes) return { ok: false, message: LEAVE_INPUT_MESSAGE };
  // Both parts are valid here, so wholeNumber is never null.
  return { ok: true, minutes: (wholeNumber(input.hours) ?? 0) * MINUTES_PER_HOUR + (wholeNumber(input.minutes) ?? 0) };
}

/** The parts of the input that make it invalid; both false when `parseLeaveInput` accepts it. */
export function invalidLeaveParts(input: LeaveInput): LeaveParts {
  const hours = input.hoursBad === true ? null : wholeNumber(input.hours);
  const minutes = input.minutesBad === true ? null : wholeNumber(input.minutes);
  const hoursWrong = hours === null || hours > LEAVE_MAX_HOURS;
  const minutesWrong = minutes === null || minutes >= MINUTES_PER_HOUR;
  if (hoursWrong || minutesWrong) return { hours: hoursWrong, minutes: minutesWrong };
  const overLimit = hours * MINUTES_PER_HOUR + minutes > LEAVE_MAX_MINUTES;
  return { hours: overLimit, minutes: overLimit };
}
