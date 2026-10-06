import type { DayView } from '../api.ts';
import { CompletenessBadge, PendingOtBadge } from './DayStatus.tsx';
import { weekGroups } from './dayModel.ts';
import { minutesText, sessionText } from './format.ts';

/** Mobile day list: one card per day, grouped by week, with the same facts as the desktop grid. */
export function DayList({
  days,
  zone,
  todayLocal,
  selected,
  onToggle,
  onEdit,
  editable = true,
  locked = false,
}: {
  days: readonly DayView[];
  zone: string;
  todayLocal: string | null;
  selected: ReadonlySet<string>;
  onToggle: (workDate: string) => void;
  onEdit: (workDate: string) => void;
  /** False in a view-only shared view: no selection box, and the day button only opens the day to read. */
  editable?: boolean;
  /** True for an imported period (F-2): the selection boxes are disabled and the day button only opens the day to read. */
  locked?: boolean;
}) {
  return (
    <div className="day-list">
      {weekGroups(days, todayLocal).map((group) => (
        <section key={group.weekStart} aria-label={`Week of ${group.weekStart}`}>
          <h2 className="week-tag">Week of {group.weekStart}</h2>
          <ul className="plain">
            {group.days.map((day) => (
              <li key={day.workDate} data-day={day.workDate} className={`day-item ${day.nonworking ? 'nonworking' : ''}`}>
                {editable && (
                  <label className="pick">
                    <input
                      type="checkbox"
                      checked={selected.has(day.workDate)}
                      onChange={() => onToggle(day.workDate)}
                      disabled={locked}
                      aria-label={`Select ${day.workDate}`}
                    />
                  </label>
                )}
                <div className="day-body">
                  <div className="day-head">
                    <span className="mono">
                      {day.weekday} {day.workDate}
                    </span>
                    <span className="muted">accounting date, {day.calendarLabel}</span>
                  </div>
                  <div className="day-line">
                    <span>{day.category}</span>
                    <CompletenessBadge day={day} />
                    {day.pendingOt && <PendingOtBadge day={day} />}
                  </div>
                  {day.sessions.map((session) => (
                    <div key={session.id} className="mono muted">
                      {sessionText(session, day.workDate, zone)}
                    </div>
                  ))}
                  <div className="day-minutes mono">
                    <span>Regular {minutesText(day.regularMinutes)}</span>
                    <span>Off-calendar {minutesText(day.offCalendarMinutes)}</span>
                    <span>Credit {minutesText(day.creditedMinutes)}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => onEdit(day.workDate)}
                      aria-label={`${editable && !locked ? 'Edit' : 'View'} ${day.workDate}`}
                    >
                      {editable && !locked ? 'Edit day' : 'View day'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
