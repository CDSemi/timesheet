import type { Session } from '../api.ts';
import { useClock } from './ClockProvider.tsx';
import { clockedInText } from './periodBarModel.ts';

/** What the check in/out control shows: waiting for the first check, checked out, or checked in. */
export function clockPhase(running: Session | null | undefined): 'checking' | 'out' | 'in' {
  return running === undefined ? 'checking' : running === null ? 'out' : 'in';
}

/**
 * The status words of the check in/out control, shared by the desktop title row and the phone's bar so the
 * two never differ. Checked in shows "Checked in since HH:MM" with a live dot (static: a ringed shape,
 * not an animation) and the date line. `running` is undefined while the first check is on its way.
 */
export function ClockStatus({ running, zone }: { running: Session | null | undefined; zone: string }) {
  const since = running === null || running === undefined ? null : clockedInText(running, zone);
  return (
    <div className="clock-state" aria-live="polite">
      {since === null ? (
        <span className="clock-now">{running === undefined ? 'Checking your status' : 'Checked out'}</span>
      ) : (
        <>
          <span className="clock-now">
            <span className="shape shape-circle live-dot" aria-hidden="true" />
            Checked in since {since.time}
          </span>
          <span className="muted hint">{since.day}, session running</span>
        </>
      )}
    </div>
  );
}

/**
 * The one button, chosen from the running session: "Check in" when checked out (waiting while the
 * first check is on its way instead of guessing), "Check out" when checked in (it opens the break
 * confirmation dialog).
 */
export function ClockButton({
  running,
  onCheckIn,
  onCheckOut,
}: {
  running: Session | null | undefined;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  return running === null || running === undefined ? (
    <button type="button" className="clock-button" onClick={onCheckIn} disabled={running === undefined}>
      Check in
    </button>
  ) : (
    <button type="button" className="clock-button" onClick={onCheckOut}>
      Check out
    </button>
  );
}

/**
 * Check in/out as a compact group on the right of the Timesheet page's title row (768px and wider): the status words right-aligned
 * over the date line, then the one button. It is not a card. It reads the one clock state of the ClockProvider and renders nothing
 * without it (a shared view has no provider state). Below 768px the same state shows in the top bar instead (BarClock); the two are
 * never rendered together.
 */
export function ClockPanel() {
  const clock = useClock();
  if (clock === null) return null;
  const { running, zone, error } = clock;
  return (
    <section className="clock-group" aria-label="Check in and out" data-clock={clockPhase(running)}>
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
