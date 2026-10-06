import type { DayView } from '../api.ts';
import { CompletenessBadge, PendingOtBadge } from './DayStatus.tsx';
import { weekGroups } from './dayModel.ts';
import type { GridStatus } from './deliveryModel.ts';
import { minutesText, sessionText } from './format.ts';
import { SubmissionStatusLine } from './SubmissionStatus.tsx';

/**
 * Desktop two-week grid: one table, one body per Monday to Sunday week. Its caption is the
 * period's review and delivery status from the server's fields (null while they load).
 */
export function TimesheetGrid({
  days,
  zone,
  todayLocal,
  selected,
  onToggle,
  onEdit,
  status,
  editable = true,
  locked = false,
}: {
  days: readonly DayView[];
  zone: string;
  todayLocal: string | null;
  selected: ReadonlySet<string>;
  onToggle: (workDate: string) => void;
  onEdit: (workDate: string) => void;
  status: GridStatus | null;
  /** False in a view-only shared view: no selection column, and the row button only opens the day to read. */
  editable?: boolean;
  /** True for an imported period (F-2): the selection boxes are disabled and the row button only opens the day to read. */
  locked?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table className="grid">
        {status !== null && (
          <caption className="grid-caption">
            <SubmissionStatusLine status={status} />
          </caption>
        )}
        <thead>
          <tr>
            {editable && (
              <th>
                <span className="sr-only">Select</span>
              </th>
            )}
            <th>Accounting date</th>
            <th>Category</th>
            <th>Sessions ({zone})</th>
            <th>Regular</th>
            <th>Off-calendar</th>
            <th>Credit*</th>
            <th>Completeness</th>
            <th>Pending OT</th>
            <th>
              <span className="sr-only">{editable ? 'Edit' : 'View'}</span>
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
                {editable && (
                  <td>
                    <label className="pick">
                      <input
                        type="checkbox"
                        checked={selected.has(day.workDate)}
                        onChange={() => onToggle(day.workDate)}
                        disabled={locked}
                        aria-label={`Select ${day.workDate}`}
                      />
                    </label>
                  </td>
                )}
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
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => onEdit(day.workDate)}
                    aria-label={`${editable && !locked ? 'Edit' : 'View'} ${day.workDate}`}
                  >
                    {editable && !locked ? 'Edit' : 'View'}
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
