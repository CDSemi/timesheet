/** Hours and minutes, never decimal hours (1h 30m, not 1.30). */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? '−' : '';
  const total = Math.abs(Math.trunc(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours === 0 ? `${sign}${rest}m` : `${sign}${hours}h ${String(rest).padStart(2, '0')}m`;
}

/**
 * Whole minutes as `h:mm`, the form the timesheet PDF prints (90 -> "1:30", 5 -> "0:05"). Display
 * only: it formats a value the server computed and computes none. For every whole, non-negative
 * minute count the text equals the PDF's `formatHoursMinutes`; a negative value (the sheet never
 * receives one) keeps its sign as `formatDuration` does, and a fraction is truncated, so a
 * screen never fails on an unexpected value.
 */
export function formatHoursMinutes(minutes: number): string {
  const sign = minutes < 0 ? '−' : '';
  const total = Math.abs(Math.trunc(minutes));
  return `${sign}${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
