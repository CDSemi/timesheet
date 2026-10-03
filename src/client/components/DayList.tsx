import type { DayView } from '../api.ts';
import { CompletenessBadge, PendingOtBadge } from './DayStatus.tsx';
import { weekGroups } from './dayModel.ts';
import { minutesText, sessionText } from './format.ts';

/** Mobile day list: one card per day, grouped by week, with the same facts as the desktop grid. */
export function DayList({
  days,
  zone,
  selected,
  onToggle,
}: {
  days: readonly DayView[];
  zone: string;
  selected: ReadonlySet<string>;
  onToggle: (workDate: string) => void;
}) {
  return (
    <div className="day-list">
      {weekGroups(days).map((group) => (
        <section key={group.weekStart} aria-label={`Week of ${group.weekStart}`}>
          <h2 className="week-tag">Week of {group.weekStart}</h2>
          <ul className="plain">
            {group.days.map((day) => (
              <li key={day.workDate} data-day={day.workDate} className={`day-item ${day.nonworking ? 'nonworking' : ''}`}>
                <label className="pick">
                  <input
                    type="checkbox"
                    checked={selected.has(day.workDate)}
                    onChange={() => onToggle(day.workDate)}
                    aria-label={`Select ${day.workDate}`}
                  />
                </label>
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
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
