import { type GridStatus, pdfStateText } from './deliveryModel.ts';
import type { Tone } from './reviewModel.ts';

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

/**
 * The one status group of a period, in the period bar: review, revision, PDF and delivery state as
 * words with badges (never colour alone), plus the way into the history. It reads the server's
 * finalization and delivery fields (loaded once by the Timesheet page). The review and delivery
 * badges carry both the `data-status` and the `data-grid-status` hooks, so there is exactly one of each.
 */
export function SubmissionStatusLine({ status }: { status: GridStatus }) {
  return (
    <div className="grid-status" role="group" aria-label="Submission status of this period" data-grid-status="line">
      <span
        className={`badge ${TONE_CLASS[status.review.tone]}`}
        data-status="review"
        data-status-key={status.review.key}
        data-grid-status="review"
        data-grid-status-key={status.review.key}
      >
        {status.review.text}
      </span>
      {status.revisionNo !== null && (
        <span className="badge" data-grid-status="revision">
          Revision {status.revisionNo}
        </span>
      )}
      {status.pdf !== null && (
        <span className={`badge ${status.pdf === 'ready' ? 'badge-ok' : status.pdf === 'failed' ? 'badge-error' : ''}`} data-grid-status="pdf" data-grid-status-key={status.pdf}>
          {pdfStateText(status.pdf)}
        </span>
      )}
      {status.delivery !== null && (
        <span
          className={`badge ${TONE_CLASS[status.delivery.tone]}`}
          data-status="delivery"
          data-status-key={status.delivery.key}
          data-grid-status="delivery"
          data-grid-status-key={status.delivery.key}
        >
          {status.delivery.text}
        </span>
      )}
      {status.submitted && (
        <a className="button-link" href="#/history" data-grid-status="history-link">
          Open in History
        </a>
      )}
    </div>
  );
}
