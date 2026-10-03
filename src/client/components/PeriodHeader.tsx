import type { TimesheetView } from '../api.ts';
import { reviewStatus } from './dayModel.ts';
import { instantText, periodRange } from './format.ts';

/**
 * Period navigation with the due date in both zones. The reporting zone owns the accounting
 * dates and the due time; the display zone is only where this browser shows instants.
 */
export function PeriodHeader({
  view,
  zone,
  onMove,
}: {
  view: TimesheetView;
  zone: string;
  onMove: (direction: -1 | 1) => void;
}) {
  const { period } = view;
  return (
    <div className="period-head">
      <button type="button" className="secondary" onClick={() => onMove(-1)} aria-label="Previous period">
        &lt;
      </button>
      <div className="period">
        <div className="period-title">
          <strong>{periodRange(period)}</strong>
          <span className={`badge ${period.relation ?? ''}`}>{period.relation}</span>
          <span className="badge">{reviewStatus(view.timesheet)}</span>
        </div>
        <dl className="facts">
          <div>
            <dt>Payroll date</dt>
            <dd>{period.payroll_date}</dd>
          </div>
          <div>
            <dt>Due ({view.reporting_zone})</dt>
            <dd>
              {period.due_local_date} {period.due_local_time}
            </dd>
          </div>
          <div>
            <dt>Due, your time ({zone})</dt>
            <dd>{instantText(period.due_at_utc, zone)}</dd>
          </div>
          <div>
            <dt>Reporting zone</dt>
            <dd>{view.reporting_zone}</dd>
          </div>
          <div>
            <dt>Display zone</dt>
            <dd>{zone}</dd>
          </div>
        </dl>
        <p className="muted hint">
          Dates are accounting dates in the reporting zone. Session times are shown in the display zone.
        </p>
        {view.reason_required && <span className="notice">Edits to this period require a reason.</span>}
      </div>
      <button type="button" className="secondary" onClick={() => onMove(1)} aria-label="Next period">
        &gt;
      </button>
    </div>
  );
}
