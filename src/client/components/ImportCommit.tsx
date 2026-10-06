import { useEffect, useRef } from 'react';
import type { ImportDecisionAction, ImportPlan } from '../api.ts';
import { commitCounts, IMPORTED_STATUS_TEXT } from '../importModel.ts';

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

/**
 * The commit step: a button, then an inline confirmation that names exactly what will be written and what will be
 * skipped. Nothing is committed until the confirm button is pressed; the confirmation takes focus when it opens.
 */
export function ImportCommit({
  plan,
  decisions,
  confirming,
  busy,
  error,
  onAsk,
  onConfirm,
  onCancel,
}: {
  plan: ImportPlan;
  decisions: Readonly<Record<string, ImportDecisionAction>>;
  confirming: boolean;
  busy: boolean;
  error: string | null;
  onAsk: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (confirming) panel.current?.focus();
  }, [confirming]);
  const counts = commitCounts(plan, decisions);

  if (!confirming) {
    return (
      <section className="card stack" aria-label="Commit the import" data-import-commit="ask">
        <h2>Commit</h2>
        <p className="hint">Nothing is saved until you commit. You will see a summary first.</p>
        {error !== null && (
          <p className="error" role="alert" data-error="import">
            {error}
          </p>
        )}
        <div className="button-row">
          <button type="button" onClick={onAsk} disabled={busy}>
            Review and commit
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card stack" aria-label="Commit the import" data-import-commit="confirm">
      <div
        className="confirm-panel stack"
        role="group"
        aria-labelledby="import-confirm-title"
        tabIndex={-1}
        ref={panel}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) onCancel();
        }}
      >
        <h4 id="import-confirm-title">Commit this import?</h4>
        <p data-confirm-summary>
          {counts.importedDays === 0
            ? 'No day will be imported: every day is skipped.'
            : `${plural(counts.importedDays, 'day')} in ${plural(counts.periods, 'period')} will be saved as "${IMPORTED_STATUS_TEXT}".`}{' '}
          {plural(counts.skippedDays, 'day')} will be skipped by decision.
        </p>
        <p>Imported periods are read-only history: they cannot be edited, signed or submitted, and they send nothing. This cannot be undone here.</p>
        {error !== null && (
          <p className="error" role="alert" data-error="import">
            {error}
          </p>
        )}
        <div className="button-row">
          <button type="button" disabled={busy} onClick={onConfirm}>
            Confirm import
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={onCancel}>
            Back to the preview
          </button>
        </div>
      </div>
    </section>
  );
}
