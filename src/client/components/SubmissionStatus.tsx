import { useEffect, useState } from 'react';
import { gridStatus, type GridStatus, pdfStateText } from './deliveryModel.ts';
import { loadPeriodState } from './ReviewStatus.tsx';
import type { Tone } from './reviewModel.ts';

/**
 * The review and delivery status of the period shown in the timesheet area, read from the server's
 * finalization and delivery fields (T12 carry item). It is re-read whenever `refreshKey` changes
 * (the timesheet version, so an edit or a sign-off updates it). null while loading or when the
 * server could not be asked; nothing is shown then, and the period header keeps its own fallback.
 */
export function useGridStatus(payrollDate: string | null, refreshKey: unknown): GridStatus | null {
  const [state, setState] = useState<{ payrollDate: string; value: GridStatus } | null>(null);

  useEffect(() => {
    if (payrollDate === null) return;
    let current = true;
    loadPeriodState(payrollDate)
      .then((value) => {
        if (current) setState({ payrollDate, value: gridStatus(value) });
      })
      .catch(() => {
        if (current) setState(null);
      });
    return () => {
      current = false;
    };
  }, [payrollDate, refreshKey]);

  return state !== null && state.payrollDate === payrollDate ? state.value : null;
}

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

/** Review, revision, PDF and delivery state of the period as words with badges, plus the way into the history. */
export function SubmissionStatusLine({ status }: { status: GridStatus | null }) {
  if (status === null) return null;
  return (
    <div className="grid-status" role="group" aria-label="Submission status of this period" data-grid-status="line">
      <span className="muted">Period status</span>
      <span className={`badge ${TONE_CLASS[status.review.tone]}`} data-grid-status="review" data-grid-status-key={status.review.key}>
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
        <span className={`badge ${TONE_CLASS[status.delivery.tone]}`} data-grid-status="delivery" data-grid-status-key={status.delivery.key}>
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
