import type { Session } from '../api.ts';
import { clockedInText } from './periodBarModel.ts';

/**
 * The clock: one button chosen from the running session. Clocked out shows "Clock in"; clocked in
 * shows "Clocked in since HH:MM" with a live dot (static: a ringed shape, not an animation) and
 * "Clock out", which opens the break confirmation dialog. `running` is undefined while the first
 * check is still on its way; the button then waits instead of guessing.
 */
export function ClockPanel({
  running,
  zone,
  onClockIn,
  onClockOut,
}: {
  running: Session | null | undefined;
  zone: string;
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  const since = running === null || running === undefined ? null : clockedInText(running, zone);
  return (
    <section className="card clock-panel" aria-label="Clock" data-clock={running === undefined ? 'checking' : since === null ? 'out' : 'in'}>
      <div className="clock-state" aria-live="polite">
        {since === null ? (
          <span className="clock-now">{running === undefined ? 'Checking the clock' : 'Clocked out'}</span>
        ) : (
          <>
            <span className="clock-now">
              <span className="shape shape-circle live-dot" aria-hidden="true" />
              Clocked in since {since.time}
            </span>
            <span className="muted hint">{since.day}, session running</span>
          </>
        )}
      </div>
      {since === null ? (
        <button type="button" className="clock-button" onClick={onClockIn} disabled={running === undefined}>
          Clock in
        </button>
      ) : (
        <button type="button" className="clock-button" onClick={onClockOut}>
          Clock out
        </button>
      )}
    </section>
  );
}
