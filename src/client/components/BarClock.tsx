import { ClockButton, clockPhase, ClockStatus } from './ClockPanel.tsx';
import { DESKTOP_QUERY, useClock, useMedia } from './ClockProvider.tsx';

/**
 * Check in/out in the top bar of the phone (below 768px): the status words and the one button, on every
 * screen of the person's own timesheets, so "Check out" is never a page away. It reads the one state of the
 * ClockProvider (the same dialog, the same running session); from 768px the card in the Timesheet page shows
 * instead, and the two are never rendered together. A shared view has no provider state, so this renders
 * nothing there and never appears to check in for the owner (F-Q5).
 */
export function BarClock() {
  const clock = useClock();
  const desktop = useMedia(DESKTOP_QUERY);
  if (clock === null || desktop) return null;
  const { running, zone, error } = clock;
  return (
    <section className="bar-clock" aria-label="Check in and out" data-clock={clockPhase(running)}>
      <ClockStatus running={running} zone={zone} />
      <ClockButton running={running} onCheckIn={() => void clock.checkIn()} onCheckOut={() => void clock.openCheckOut()} />
      {error !== null && (
        <p className="error clock-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
