import type { DayView } from '../api.ts';
import { toDayDisplay } from './dayModel.ts';
import { CompletenessBadge } from './DayStatus.tsx';
import { dayFigures } from './sessionModel.ts';

/**
 * The figures the server computed for the day, in hours and minutes: raw regular (R) and
 * off-calendar (O) time, eligible and credited minutes. Expected finish is the one derived value:
 * it comes from the shared domain function, is shown in the display zone and is labelled as
 * derived and display only. Nothing here is computed from the browser clock.
 */
export function DayFigures({
  day,
  todayLocal,
  expectedFinish,
}: {
  day: DayView;
  todayLocal: string | null;
  expectedFinish: string | null;
}) {
  const figures = dayFigures(day, todayLocal);
  const display = toDayDisplay(day, todayLocal);
  return (
    <section className="stack" aria-label="Day figures">
      <h3>Figures from the server</h3>
      <dl className="facts figures">
        <div>
          <dt>Completeness</dt>
          <dd data-figure="status">
            <CompletenessBadge day={display} />
          </dd>
        </div>
        <div>
          <dt data-figure-label="expected-finish">Expected finish (derived)</dt>
          <dd data-figure="expected-finish">{expectedFinish ?? 'none yet'}</dd>
        </div>
        <div>
          <dt>Raw regular (R)</dt>
          <dd data-figure="regular">{figures.rawRegular}</dd>
        </div>
        <div>
          <dt>Raw off-calendar (O)</dt>
          <dd data-figure="off-calendar">{figures.rawOffCalendar}</dd>
        </div>
        <div>
          <dt>Eligible</dt>
          <dd data-figure="eligible">{figures.eligible}</dd>
        </div>
        <div>
          <dt>Credited</dt>
          <dd data-figure="credited">{figures.credited}</dd>
        </div>
        <div>
          <dt>Deficit</dt>
          <dd data-figure="deficit">{figures.deficit}</dd>
        </div>
      </dl>
      {expectedFinish !== null && (
        <p className="muted hint" data-figure-note="expected-finish">
          Expected finish is derived from the first session start, the required work and the excluded breaks of the policy. It is shown in your
          current display zone. Display only; nothing is saved.
        </p>
      )}
      {display.pendingOt && (
        <p className="muted hint">OT for this day stays pending until breaks are confirmed and every session has ended.</p>
      )}
      {day.calculation_error !== null && <p className="error">Calculation: {day.calculation_error.replace(/_/g, ' ')}.</p>}
    </section>
  );
}
