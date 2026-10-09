import type { DayView } from '../api.ts';
import { toDayDisplay } from './dayModel.ts';
import { CompletenessBadge } from './DayStatus.tsx';
import { dayFigures } from './sessionModel.ts';

/**
 * The figures the server computed for the day, in hours and minutes and in plain words: worked on
 * a workday (raw regular, R), worked on a day off (raw off-calendar, O), eligible and credited OT
 * and the deficit. Expected finish is the one derived value: it comes from the shared domain
 * function, is shown in the display zone and is labelled as derived and display only. Nothing here
 * is computed from the browser clock. What the day still needs is the editor's banner.
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
    <section className="editor-section stack" aria-label="Day figures">
      <h3>Figures (computed by the server)</h3>
      <dl className="facts figures">
        <div>
          <dt>Check</dt>
          <dd data-figure="status">
            <CompletenessBadge day={display} />
          </dd>
        </div>
        <div>
          <dt data-figure-label="expected-finish">Expected finish (derived)</dt>
          <dd data-figure="expected-finish">{expectedFinish ?? 'none yet'}</dd>
        </div>
        <div>
          <dt>Worked on a workday</dt>
          <dd data-figure="regular">{figures.rawRegular}</dd>
        </div>
        <div>
          <dt>Worked on a day off</dt>
          <dd data-figure="off-calendar">{figures.rawOffCalendar}</dd>
        </div>
        <div>
          <dt>Eligible for OT</dt>
          <dd data-figure="eligible">{figures.eligible}</dd>
        </div>
        <div>
          <dt>OT credit</dt>
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
    </section>
  );
}
