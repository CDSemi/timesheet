import type { DeliveryRecord } from '../api.ts';
import { DeliveryAttempts } from './DeliveryAttempts.tsx';
import { DeliveryConfirm } from './DeliveryConfirm.tsx';
import {
  confirmationFor,
  correctionLinkLabel,
  type DeliveryAction,
  pdfStateText,
  resendState,
  type RevisionRow,
  rowOrigin,
  rowReview,
} from './deliveryModel.ts';
import { displayZone, instantText } from './format.ts';
import { deliveryStatus, reviewHash, type Tone } from './reviewModel.ts';

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

/** What the card is asking the owner to confirm, if anything. */
export interface PendingAction {
  action: DeliveryAction;
  attemptId: string | null;
}

/**
 * One immutable revision of a period: its origin and review state as the system records them (an
 * automatic submission reads "review pending" here), the PDF, the delivery attempts, and the three
 * things the owner can do: download the PDF, resend it, or record a reasoned correction. Resend and
 * the uncertain decision both ask for a confirmation first.
 */
export function DeliveryRevision({
  row,
  busy,
  pending,
  message,
  confirmError,
  onDownload,
  onResend,
  onDecide,
  onConfirm,
  onCancel,
}: {
  row: RevisionRow;
  busy: boolean;
  pending: PendingAction | null;
  /** The outcome or the refusal of the last action on this revision. */
  message: { tone: 'ok' | 'error'; text: string } | null;
  confirmError: string | null;
  onDownload: (row: RevisionRow) => void;
  onResend: (row: RevisionRow, trigger: HTMLElement) => void;
  onDecide: (row: RevisionRow, attempt: DeliveryRecord, action: 'mark_delivered' | 'resend_uncertain', trigger: HTMLElement) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const resend = resendState(row);
  const correction = correctionLinkLabel(row);
  const review = rowReview(row);
  const origin = rowOrigin(row);
  const recorded = row.revision?.created_at ?? row.listed?.finalized_at ?? null;
  const delivery = row.current ? deliveryStatus(row.revision, row.jobs, row.attempts) : null;
  const period = row.periodStart === null || row.periodEnd === null ? `Payroll date ${row.payrollDate}` : `${row.periodStart} to ${row.periodEnd}`;
  const label = `payroll date ${row.payrollDate}, revision ${row.revisionNo}`;
  const canDownload = row.pdf === 'ready';
  const reasonId = `resend-reason-${row.key}`;

  return (
    <li className="history-item revision" data-revision={row.revisionId} data-payroll={row.payrollDate} data-current={row.current}>
      <div className="history-head">
        <h3 tabIndex={-1}>Period {period}</h3>
        <span className="mono muted">payroll {row.payrollDate}</span>
        <span className="badge" data-revision-badge="number">
          Revision {row.revisionNo}
        </span>
        {row.superseded && (
          <span className="badge" data-revision-badge="superseded">
            Superseded
          </span>
        )}
        {review !== null && (
          <span className={`badge ${TONE_CLASS[review.tone]}`} data-revision-badge="review">
            {review.text}
          </span>
        )}
        <span className={`badge ${row.pdf === 'ready' ? 'badge-ok' : row.pdf === 'failed' ? 'badge-error' : ''}`} data-revision-badge="pdf">
          {pdfStateText(row.pdf)}
        </span>
        {delivery !== null && (
          <span className={`badge ${TONE_CLASS[delivery.tone]}`} data-revision-badge="delivery">
            {delivery.text}
          </span>
        )}
      </div>

      <dl className="facts">
        {origin !== null && (
          <div>
            <dt>Origin</dt>
            <dd data-fact="origin">{origin}</dd>
          </div>
        )}
        {recorded !== null && (
          <div>
            <dt>Recorded</dt>
            <dd>{instantText(recorded, displayZone)}</dd>
          </div>
        )}
        {row.revision !== null && (
          <>
            <div>
              <dt>Signed</dt>
              <dd data-fact="signed">
                {row.signoff === null ? 'Not signed yet' : `${row.signoff.signer_name}, ${instantText(row.signoff.signed_at, displayZone)}`}
              </dd>
            </div>
            {row.revision.correction_reason !== null && (
              <div>
                <dt>Reason</dt>
                <dd data-fact="reason">{row.revision.correction_reason}</dd>
              </div>
            )}
          </>
        )}
        <div>
          <dt>Recipients</dt>
          <dd data-fact="recipients">
            {row.recipients === null
              ? 'not sent yet'
              : row.recipients.cc.length === 0
                ? row.recipients.to.join(', ')
                : `${row.recipients.to.join(', ')} (copy: ${row.recipients.cc.join(', ')})`}
          </dd>
        </div>
      </dl>

      <div className="button-row">
        <button type="button" disabled={busy || !canDownload} onClick={() => onDownload(row)} aria-label={`Download PDF, ${label}`}>
          Download PDF
        </button>
        {resend.available && (
          <button
            type="button"
            className="secondary"
            disabled={busy || !resend.enabled}
            aria-describedby={resend.reason === null ? undefined : reasonId}
            aria-label={`Resend email, ${label}`}
            onClick={(event) => onResend(row, event.currentTarget)}
          >
            Resend email
          </button>
        )}
        {correction !== null && (
          <a className="button-link" href={reviewHash(row.payrollDate)} data-correction-link={row.payrollDate} aria-label={`${correction}, ${label}`}>
            {correction}
          </a>
        )}
      </div>
      {resend.reason !== null && (
        <p className="muted hint" id={reasonId}>
          {resend.reason}
        </p>
      )}
      {message !== null && (
        <p className={message.tone === 'ok' ? 'notice-ok' : 'error'} role={message.tone === 'ok' ? 'status' : 'alert'} data-revision-message={message.tone}>
          {message.text}
        </p>
      )}

      {pending !== null && (
        <DeliveryConfirm
          confirmation={confirmationFor(pending.action, row.recipients)}
          busy={busy}
          error={confirmError}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}

      <DeliveryAttempts
        attempts={row.attempts}
        recipientsLabel={label}
        busy={busy}
        onDecide={(attempt, action, trigger) => onDecide(row, attempt, action, trigger)}
      />
    </li>
  );
}
