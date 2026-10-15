import type { Session } from '../api.ts';
import { clockedInText } from './periodBarModel.ts';

/**
 * Check in/out: one button chosen from the running session. Checked out shows "Check in"; checked in
 * shows "Checked in since HH:MM" with a live dot (static: a ringed shape, not an animation) and
 * "Check out", which opens the break confirmation dialog. `running` is undefined while the first
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
    <section className="card clock-panel" aria-label="Check in and out" data-clock={running === undefined ? 'checking' : since === null ? 'out' : 'in'}>
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
      {since === null ? (
        <button type="button" className="clock-button" onClick={onClockIn} disabled={running === undefined}>
          Check in
        </button>
      ) : (
        <button type="button" className="clock-button" onClick={onClockOut}>
          Check out
        </button>
      )}
    </section>
  );
}
