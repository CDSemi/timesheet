import type { DayView } from '../api.ts';
import { CompletenessBadge, PendingOtBadge } from './DayStatus.tsx';
import { weekGroups } from './dayModel.ts';
import { minutesText, sessionText } from './format.ts';

/** Desktop two-week grid: one table, one body per Monday to Sunday week. */
export function TimesheetGrid({
  days,
  zone,
  todayLocal,
  selected,
  onToggle,
  onEdit,
}: {
  days: readonly DayView[];
  zone: string;
  todayLocal: string | null;
  selected: ReadonlySet<string>;
  onToggle: (workDate: string) => void;
  onEdit: (workDate: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            <th>
              <span className="sr-only">Select</span>
            </th>
            <th>Accounting date</th>
            <th>Category</th>
            <th>Sessions ({zone})</th>
            <th>Regular</th>
            <th>Off-calendar</th>
            <th>Credit*</th>
            <th>Completeness</th>
            <th>Pending OT</th>
            <th>
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        {weekGroups(days, todayLocal).map((group) => (
          <tbody key={group.weekStart}>
            {group.days.map((day, index) => (
              <tr
                key={day.workDate}
                data-day={day.workDate}
                className={`${day.nonworking ? 'nonworking' : ''} ${index === 0 ? 'week-start' : ''}`}
              >
                <td>
                  <label className="pick">
                    <input
                      type="checkbox"
                      checked={selected.has(day.workDate)}
                      onChange={() => onToggle(day.workDate)}
                      aria-label={`Select ${day.workDate}`}
                    />
                  </label>
                </td>
                <td>
                  {index === 0 && <span className="week-tag">Week of {group.weekStart}</span>}
                  <span className="mono">
                    {day.weekday} {day.workDate}
                  </span>
                  <span className="muted cal-note">{day.calendarLabel}</span>
                </td>
                <td>{day.category}</td>
                <td className="sessions">
                  {day.sessions.length === 0 ? (
                    <span className="muted">none</span>
                  ) : (
                    day.sessions.map((session) => (
                      <div key={session.id} className="mono">
                        {sessionText(session, day.workDate, zone)}
                      </div>
                    ))
                  )}
                </td>
                <td className="mono">{minutesText(day.regularMinutes)}</td>
                <td className="mono">{minutesText(day.offCalendarMinutes)}</td>
                <td className="mono">{minutesText(day.creditedMinutes)}</td>
                <td>
                  <CompletenessBadge day={day} />
                </td>
                <td>
                  <PendingOtBadge day={day} />
                </td>
                <td>
                  <button type="button" className="secondary" onClick={() => onEdit(day.workDate)} aria-label={`Edit ${day.workDate}`}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
