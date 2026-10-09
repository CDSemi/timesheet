import { useSyncExternalStore } from 'react';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';
import { reviewSheetWeeks } from './reviewModel.ts';
import { ReviewSheet } from './TimesheetSheet.tsx';

/** The documented layout breakpoint of the sheet: seven columns from 768px, one table per week below it. */
const DESKTOP_QUERY = '(min-width: 768px)';

/** True when the desktop sheet should render. Exactly one of the two layouts is ever in the page. */
function useDesktop(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );
}

/**
 * The days of the period exactly as the review payload holds them, on the read-only sheet: the
 * layout of the Excel form and the PDF the person signs. Categories, session times (in the
 * reporting zone, the zone of the PDF) and the minutes the server's engine computed are the
 * payload's own; nothing is recomputed here.
 */
export function ReviewDays({ payload }: { payload: ReviewSnapshot }) {
  const desktop = useDesktop();
  const zone = payload.reporting_zone;
  return (
    <section className="card review-sheet-block stack" aria-labelledby="review-days-title">
      <div className="stack review-sheet-intro">
        <h2 id="review-days-title">What you sign</h2>
        <p className="muted hint">
          Dates are accounting dates in the reporting zone ({zone}). Session times are shown in that zone, as on the PDF. Minutes are the
          server&apos;s figures.
        </p>
      </div>
      <ReviewSheet
        weeks={reviewSheetWeeks(payload.days, zone)}
        employeeName={payload.employee.name}
        period={payload.period}
        desktop={desktop}
        totalCredited={payload.totals.credited_minutes}
        pendingDays={payload.totals.pending_days}
      />
    </section>
  );
}
