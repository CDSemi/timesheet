import { useRef } from 'react';
import type { CurrentPeriods, TimesheetView } from '../api.ts';
import { reviewStatus } from './dayModel.ts';
import { gridStatus } from './deliveryModel.ts';
import { usDate } from './format.ts';
import { ImportedBadge, ImportedNote } from './ImportStatus.tsx';
import { PERIOD_PILL_WORDS, dueInZoneText, dueParts, periodPillKind, reviewShortLabel, viewingZoneText, weekdayName, zoneNoteVisible } from './periodBarModel.ts';
import { CURRENT_PERIOD_DESCRIPTION, todayDescription } from './periodJumpModel.ts';
import { type PeriodState, ReviewLink } from './ReviewStatus.tsx';
import { SubmissionStatusLine } from './SubmissionStatus.tsx';

/** What the two jump buttons need, all derived by the screen from the server's periods and `today_local`. */
export interface PeriodJumps {
  /** True when "Today" is active; false renders it `aria-disabled` (focusable, dimmed with colours; a press only re-reads the server's date). */
  todayAway: boolean;
  /** True when "Current period" is rendered at all. */
  currentVisible: boolean;
  onToday: () => void;
  /** `moveFocus` puts focus on Today; the screen calls it only when the jump goes ahead (a "Keep editing" leaves focus on "Current period"). */
  onCurrent: (moveFocus: () => void) => void;
  /** The visually hidden status line after the last jump, or null before any. */
  status: string | null;
}

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
  jumps,
  periods = null,
}: {
  view: TimesheetView;
  zone: string;
  onMove: (direction: -1 | 1) => void;
  /** False in a shared view: the review state and its link belong to the owner. */
  own?: boolean;
  /** The period's finalization and delivery state (own, not imported); null while loading or when not asked. */
  state: PeriodState | null;
  /** "Today" and "Current period"; absent until the server's periods are known. */
  jumps?: PeriodJumps;
  /** The server's current and in-progress periods (the owner's, in a shared view): they decide the "in progress" pill. Null until known. */
  periods?: Pick<CurrentPeriods, 'current' | 'in_progress'> | null;
}) {
  const todayButton = useRef<HTMLButtonElement>(null);
  const { period } = view;
  const pill = periodPillKind(period, periods);
  const due = dueParts(period, view.reporting_zone);
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
            {usDate(period.period_start)}
            {/* The arrow is decoration in the label colour; screen readers read the hidden " to " (the text stays "10/12/2026 to 10/25/2026"). */}
            <span className="range-arrow" aria-hidden="true">
              →
            </span>
            {/* A break opportunity: on the narrowest phones the end date moves to a second line instead of running under the arrow button. */}
            <wbr />
            <span className="sr-only"> to </span>
            {usDate(period.period_end)}
          </strong>
          {/* The pill carries its words (never colour alone): the server's relation, or "in progress" in the five window days. */}
          {pill !== 'neutral' && <span className={`badge ${pill}`}>{PERIOD_PILL_WORDS[pill]}</span>}
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
            {/* "Due" is a label like "Payroll date"; the text content stays `Due Tue 12/08/2026, 17:00 (zone)` (dueInWords). */}
            {due.label} <b>{due.value}</b>
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
      {/* DOM order is the reading and tab order on every layout: previous, next, Today, Current period (when shown), then the review link. */}
      <div className="period-actions">
        <button type="button" className="secondary period-step" onClick={() => onMove(1)} aria-label="Next period">
          &gt;
        </button>
        <div className="period-cta" data-current={jumps?.currentVisible === true ? 'shown' : undefined}>
          {jumps !== undefined && (
            <>
              <button
                type="button"
                className="secondary period-jump"
                aria-disabled={jumps.todayAway ? undefined : 'true'}
                aria-describedby="period-today-note"
                onClick={() => {
                  // Also while inactive: the page may have stayed open past midnight, so the screen re-reads the server's periods and
                  // decides from the fresh answer (it jumps only when the sheet no longer shows today).
                  jumps.onToday();
                }}
                data-period-today
                ref={todayButton}
              >
                Today
              </button>
              <span id="period-today-note" className="sr-only">
                {todayDescription(jumps.todayAway)}
              </span>
              {jumps.currentVisible && (
                <>
                  <button
                    type="button"
                    className="secondary period-jump"
                    aria-describedby="period-current-note"
                    onClick={() => {
                      // The button leaves the page once the current period is shown, so focus goes to the next logical control first,
                      // but only when the jump goes ahead: after "Keep editing" focus stays on this button.
                      jumps.onCurrent(() => todayButton.current?.focus());
                    }}
                    data-period-current
                    aria-label="Current period"
                    data-short="Current"
                  >
                    {/* On the narrowest phones the style sheet hides this text and draws the short form (data-short); the name stays "Current period" (SC 2.5.3). */}
                    <span className="jump-full">Current period</span>
                  </button>
                  <span id="period-current-note" className="sr-only">
                    {CURRENT_PERIOD_DESCRIPTION}
                  </span>
                </>
              )}
            </>
          )}
          {own &&
            (imported ? (
              <button
                type="button"
                className="secondary review-link"
                disabled
                aria-describedby="imported-reason"
                aria-label="Review & sign off"
                data-short={reviewShortLabel('Review & sign off')}
                data-label-size="long"
                data-review-link-disabled={period.payroll_date}
              >
                <span className="review-full">Review &amp; sign off</span>
              </button>
            ) : (
              <ReviewLink payrollDate={period.payroll_date} state={state} />
            ))}
        </div>
      </div>
      {/* A persistent live region (SC 4.1.3): present from load, empty until a jump, so the inserted text is announced. No role="status": the saved notice keeps that role. */}
      {jumps !== undefined && (
        <p className="sr-only" aria-live="polite" aria-atomic="true" data-period-jump-status>
          {jumps.status ?? ''}
        </p>
      )}
    </section>
  );
}
