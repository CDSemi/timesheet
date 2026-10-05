import type { DeliveryRecord } from '../api.ts';
import { attemptFault, attemptStateText, decisionText } from './deliveryModel.ts';
import { displayZone, instantText } from './format.ts';
import type { Tone } from './reviewModel.ts';

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

const ATTEMPT_TONE: Record<DeliveryRecord['state'], Tone> = {
  preparing: 'neutral',
  sending: 'neutral',
  accepted: 'ok',
  failed_temporary: 'warn',
  failed_permanent: 'error',
  uncertain: 'warn',
};

/**
 * The delivery attempts of one revision, newest first, each with its state in words and, for a
 * failed or uncertain one, the redacted fault code (never provider text, an address or a message).
 * An uncertain attempt without a decision offers the two explicit choices; nothing is resent on its own.
 */
export function DeliveryAttempts({
  attempts,
  recipientsLabel,
  busy,
  onDecide,
}: {
  attempts: readonly DeliveryRecord[];
  recipientsLabel: string;
  busy: boolean;
  onDecide: (attempt: DeliveryRecord, action: 'mark_delivered' | 'resend_uncertain', trigger: HTMLElement) => void;
}) {
  if (attempts.length === 0) {
    return <p className="muted hint">No delivery attempt has been made for this revision.</p>;
  }
  return (
    <ul className="plain attempt-list" aria-label={`Delivery attempts, ${recipientsLabel}`}>
      {attempts.map((attempt, index) => {
        const fault = attemptFault(attempt);
        const decision = decisionText(attempt.decision);
        return (
          <li key={attempt.id} className="attempt" data-attempt={attempts.length - index} data-attempt-state={attempt.state}>
            <div className="history-head">
              <strong>Attempt {attempts.length - index}</strong>
              <span className={`badge ${TONE_CLASS[ATTEMPT_TONE[attempt.state]]}`} data-attempt-badge={attempt.state}>
                {attemptStateText(attempt.state)}
              </span>
              <time className="mono muted" dateTime={attempt.started_at}>
                {instantText(attempt.started_at, displayZone)}
              </time>
              {fault !== null && (
                <span className="muted">
                  Fault code <code data-fault-code={fault}>{fault}</code>
                </span>
              )}
              {decision !== null && <span className="muted">{decision}</span>}
            </div>
            {attempt.decision_required && (
              <div className="stack">
                <p className="notice" role="status">
                  The mail server may or may not have accepted this message. Nothing is resent automatically: choose what happens next.
                </p>
                <div className="button-row">
                  <button type="button" disabled={busy} onClick={(event) => onDecide(attempt, 'mark_delivered', event.currentTarget)}>
                    Mark as delivered
                  </button>
                  <button type="button" className="secondary" disabled={busy} onClick={(event) => onDecide(attempt, 'resend_uncertain', event.currentTarget)}>
                    Resend the PDF
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
