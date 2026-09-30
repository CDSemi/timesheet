/** Hours and minutes, never decimal hours (1h 30m, not 1.30). */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? '−' : '';
  const total = Math.abs(Math.trunc(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours === 0 ? `${sign}${rest}m` : `${sign}${hours}h ${String(rest).padStart(2, '0')}m`;
}
