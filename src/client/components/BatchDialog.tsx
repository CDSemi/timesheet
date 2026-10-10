import { useEffect, useRef, useState } from 'react';
import type { DayBatchPreview, DayView } from '../api.ts';
import { conflictDetails } from './dayModel.ts';
import { sessionText } from './format.ts';

const STATUS_TEXT: Record<DayBatchPreview['entries'][number]['status'], string> = {
  create: 'new label',
  update: 'label change',
  unchanged: 'no change',
  stale: 'changed elsewhere',
  invalid: 'not valid',
};

/**
 * Native modal dialog for a batch edit. Step one previews every date and asks for the reason
 * when the server requires one; step two lists the recorded sessions of conflicting dates and
 * needs an explicit confirmation. Sessions are never changed by a label edit. The in-cell label
 * picker uses the same dialog for its one-entry preview (single-day use, with its own title).
 */
export function BatchDialog({
  preview,
  days,
  zone,
  error,
  busy,
  title = 'Review category change',
  onCommit,
  onClose,
}: {
  preview: DayBatchPreview;
  days: readonly DayView[];
  zone: string;
  error: string | null;
  busy: boolean;
  /** The first step's heading; a single-day label pick names its date. */
  title?: string;
  onCommit: (input: { reason: string; confirmConflicts: boolean }) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<'review' | 'conflicts'>('review');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  /**
   * True after the first step change. The headings take focus only from then on, so on open the
   * dialog still focuses its first control as before.
   */
  const [stepChanged, setStepChanged] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (element !== null && !element.open) element.showModal();
  }, []);

  // A step change replaces the dialog's content: focus moves to the new step's heading, never to the page (WP5-UX-AX-08).
  useEffect(() => {
    if (stepChanged) heading.current?.focus();
  }, [step, stepChanged]);

  function goTo(next: 'review' | 'conflicts') {
    setStepChanged(true);
    setStep(next);
  }

  const needsReason = preview.reason_required;
  const reasonMissing = needsReason && reason.trim() === '';
  const hasConflicts = preview.requires_conflict_confirmation;
  const canContinue = preview.can_commit && preview.changed_count > 0 && !reasonMissing;
  const details = conflictDetails(preview.conflicts, days);
  const submit = (confirmConflicts: boolean) => onCommit({ reason: reason.trim(), confirmConflicts });

  return (
    <dialog ref={dialog} className="dialog" aria-labelledby="batch-title" onClose={onClose}>
      {step === 'review' ? (
        <div className="stack">
          <h2 id="batch-title" ref={heading} tabIndex={stepChanged ? -1 : undefined}>
            {title}
          </h2>
          <p>
            {preview.changed_count} {preview.changed_count === 1 ? 'day' : 'days'} will change. Nothing is saved until you commit.
          </p>
          <ul className="plain preview-list">
            {preview.entries.map((entry) => (
              <li key={entry.work_date} data-preview-date={entry.work_date}>
                <span className="mono">{entry.work_date}</span>
                <span>
                  {days.find((day) => day.work_date === entry.work_date)?.category ?? 'none'} to {entry.after.category}
                </span>
                <span className="muted">
                  {STATUS_TEXT[entry.status]}
                  {entry.status === 'invalid' && entry.error !== null ? `: ${entry.error.message}` : ''}
                </span>
              </li>
            ))}
          </ul>
          {!preview.can_commit && (
            <p className="error" role="alert">
              Some dates changed elsewhere or are not valid. Close this window and reload the period.
            </p>
          )}
          {needsReason && (
            <label>
              Reason for editing an old or finalized period ({preview.reason_required_dates.join(', ')})
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} maxLength={500} required />
            </label>
          )}
          {error !== null && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            {hasConflicts ? (
              <button type="button" onClick={() => goTo('conflicts')} disabled={!canContinue}>
                Review conflicts
              </button>
            ) : (
              <button type="button" onClick={() => submit(false)} disabled={!canContinue || busy}>
                Commit changes
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="stack">
          <h2 id="batch-title" ref={heading} tabIndex={stepChanged ? -1 : undefined}>
            Recorded work conflicts with the new label
          </h2>
          <p>No work session is edited or deleted. Only the day label changes.</p>
          <ul className="plain conflict-list">
            {details.map(({ conflict, sessions }) => (
              <li key={conflict.work_date} data-conflict-date={conflict.work_date}>
                <strong className="mono">{conflict.work_date}</strong>{' '}
                <span>
                  {conflict.current_category ?? 'none'} to {conflict.new_category}
                </span>
                <ul className="plain">
                  {sessions.map((session) => (
                    <li key={session.id} className="mono">
                      {session.source} session, {sessionText(session, conflict.work_date, zone)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <label className="inline">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            I confirm the label change for these dates
          </label>
          {error !== null && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={() => goTo('review')}>
              Back
            </button>
            <button type="button" onClick={() => submit(true)} disabled={!confirmed || busy}>
              Confirm and commit
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
