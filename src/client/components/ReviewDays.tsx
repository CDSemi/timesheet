import type { SnapshotDay } from '../../domain/snapshot.ts';
import { minutesText } from './format.ts';
import { reviewDayRow } from './reviewModel.ts';

/**
 * The days of the period exactly as the review payload holds them: categories, session times
 * (in the reporting zone, the zone of the PDF) and the minutes the server's engine computed. One
 * semantic table; below 768px each row becomes a labelled block, so nothing scrolls sideways.
 */
export function ReviewDays({
  days,
  zone,
  totalCredited,
  pendingDays,
}: {
  days: readonly SnapshotDay[];
  zone: string;
  totalCredited: number;
  pendingDays: number;
}) {
  const rows = days.map((day) => reviewDayRow(day, zone));
  return (
    <section className="card stack" aria-labelledby="review-days-title">
      <h2 id="review-days-title">Days</h2>
      <p className="muted hint">
        Dates are accounting dates in the reporting zone ({zone}). Session times are shown in that zone, as on the PDF. Minutes are the
        server&apos;s figures.
      </p>
      <table className="review-table">
        <caption className="sr-only">The {rows.length} days of the period</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Sessions</th>
            <th scope="col">Regular</th>
            <th scope="col">Off-calendar</th>
            <th scope="col">Credit</th>
            <th scope="col">Completeness</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.workDate} data-review-day={row.workDate} className={row.nonworking ? 'nonworking' : undefined}>
              <th scope="row" className="review-date">
                <span className="mono">
                  {row.weekday} {row.workDate}
                </span>
                <span className="muted cal-note">{row.calendar}</span>
              </th>
              <td data-label="Category">
                <span>{row.category}</span>
                {row.leave !== null && <span className="muted cal-note">{row.leave}</span>}
                {row.wfh && <span className="muted cal-note">Working from home</span>}
                {row.notes !== '' && <span className="muted cal-note review-note">Note: {row.notes}</span>}
              </td>
              <td data-label="Sessions" className="review-sessions">
                {row.sessions.length === 0 ? (
                  <span className="muted">none</span>
                ) : (
                  row.sessions.map((session) => (
                    <span key={session.id} className="mono">
                      {session.text}
                    </span>
                  ))
                )}
              </td>
              <td data-label="Regular" data-minutes={row.regular ?? undefined}>
                <span className="mono">{minutesText(row.regular)}</span>
              </td>
              <td data-label="Off-calendar" data-minutes={row.offCalendar ?? undefined}>
                <span className="mono">{minutesText(row.offCalendar)}</span>
              </td>
              <td data-label="Credit" data-minutes={row.credited ?? undefined}>
                <span className="mono">{minutesText(row.credited)}</span>
              </td>
              <td data-label="Completeness">
                <span className={`status status-${row.status.key}`}>
                  <span className={`shape shape-${row.status.shape}`} aria-hidden="true" />
                  {row.status.text}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="facts" aria-label="Period totals from the server">
        <div data-total="credited">
          <dt>OT credit if signed now</dt>
          <dd data-minutes={totalCredited}>{minutesText(totalCredited)}</dd>
        </div>
        <div data-total="pending">
          <dt>Days pending OT evidence</dt>
          <dd>{pendingDays}</dd>
        </div>
      </dl>
    </section>
  );
}
