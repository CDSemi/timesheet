import type { TimesheetView } from '../api.ts';
import { reviewStatus } from './dayModel.ts';
import { gridStatus } from './deliveryModel.ts';
import { usDate } from './format.ts';
import { ImportedBadge, ImportedNote } from './ImportStatus.tsx';
import { dueInWords, dueInZoneText, viewingZoneText, weekdayName, zoneNoteVisible } from './periodBarModel.ts';
import { type PeriodState, ReviewLink } from './ReviewStatus.tsx';
import { SubmissionStatusLine } from './SubmissionStatus.tsx';

/**
 * The period bar: which period, when it is due, its one status group and the way to review and sign.
 * The reporting zone owns the accounting dates and the due time; the display zone is only where this
 * browser shows instants. The bar always names the display zone ("Times in ..."); the longer zone note
 * with both zones appears only when the two differ.
 */
export function PeriodBar({
  view,
  zone,
  onMove,
  own = true,
  state,
}: {
  view: TimesheetView;
  zone: string;
  onMove: (direction: -1 | 1) => void;
  /** False in a shared view: the review state and its link belong to the owner. */
  own?: boolean;
  /** The period's finalization and delivery state (own, not imported); null while loading or when not asked. */
  state: PeriodState | null;
}) {
  const { period } = view;
  // F-2: an imported period is read-only history. It has no review or delivery state, and its sign and submit are off.
  const imported = view.timesheet.imported_unverified;
  const status = state === null ? null : gridStatus(state);
  return (
    <section className="card period-bar" aria-label="Pay period">
      <button type="button" className="secondary period-step" onClick={() => onMove(-1)} aria-label="Previous period">
        &lt;
      </button>
      <div className="period-main">
        <div className="period-title">
          <strong className="period-name">
            {usDate(period.period_start)} to {usDate(period.period_end)}
          </strong>
          <span className={`badge ${period.relation ?? ''}`}>{period.relation}</span>
          {imported ? <ImportedBadge /> : status !== null ? <SubmissionStatusLine status={status} /> : <span className="badge">{reviewStatus(view.timesheet)}</span>}
        </div>
        <p className="period-meta">
          <span>
            Payroll date{' '}
            <b>
              {weekdayName(period.payroll_date)} {usDate(period.payroll_date)}
            </b>
          </span>
          <span data-period-due={period.payroll_date}>
            <b>{dueInWords(period, view.reporting_zone)}</b>
          </span>
          <span data-period-zone={zone}>{viewingZoneText(zone)}</span>
        </p>
        {zoneNoteVisible(view.reporting_zone, zone) && (
          <div className="zone-note" data-zone-note>
            <dl className="facts">
              <div>
                <dt>Reporting zone</dt>
                <dd>{view.reporting_zone}</dd>
              </div>
              <div>
                <dt>Display zone</dt>
                <dd>{zone}</dd>
              </div>
              <div>
                <dt>Due, your time ({zone})</dt>
                <dd>{dueInZoneText(period.due_at_utc, zone)}</dd>
              </div>
            </dl>
            <p className="muted hint">Dates are accounting dates in the reporting zone. Session times are shown in the display zone.</p>
          </div>
        )}
        {imported && <ImportedNote id="imported-reason" />}
        {!imported && view.reason_required && <span className="notice">Edits to this period require a reason.</span>}
      </div>
      {/* DOM order is the reading and tab order on every layout: previous, next, then the review link. */}
      <div className="period-actions">
        <button type="button" className="secondary period-step" onClick={() => onMove(1)} aria-label="Next period">
          &gt;
        </button>
        {own &&
          (imported ? (
            <button type="button" className="secondary" disabled aria-describedby="imported-reason" data-review-link-disabled={period.payroll_date}>
              Review &amp; sign off
            </button>
          ) : (
            <ReviewLink payrollDate={period.payroll_date} state={state} />
          ))}
      </div>
    </section>
  );
}
