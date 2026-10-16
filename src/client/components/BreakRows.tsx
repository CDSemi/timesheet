import { type RefObject, useEffect, useId, useRef } from 'react';
import { breakLabel, type BreakRowDraft, type BreakRowError, type BreakRowPatch, breakRowEnd } from './breakRowsModel.ts';
import { usShortDate } from './format.ts';
import type { TimeProblem } from './sessionModel.ts';
import { TimeProblemPrompt } from './TimeProblemPrompt.tsx';

/** Where focus goes after the list changed: the new row, a row's remove button, or "Add break". */
type FocusAfter = { kind: 'new' } | { kind: 'remove'; key: string } | { kind: 'add' };

/** "ends 10:15", or "ends 10/13 00:15" when the break ends on a later local date than it starts. */
function endText(row: BreakRowDraft, index: number, zone: string): string | null {
  const end = breakRowEnd(row, index, zone);
  if (end === null) return null;
  const clock = end.time.slice(0, 5);
  return end.date === row.start.date ? `ends ${clock}` : `ends ${usShortDate(end.date)} ${clock}`;
}

/**
 * The break area of the session dialog (WP5-UX3-T08, owner decisions U-21 and U-24): one "Confirm no breaks taken" box, the
 * list of breaks, "Suggest breaks" and "Add break". A break is its start date, its start time and its minutes; the end is
 * computed (`breakRowEnd`) and shown as text. A pre-filled suggestion carries a "suggested" tag until its row is changed.
 * Ticking the box hides and disables the rows; they stay in the draft and come back when it is unticked.
 *
 * The rows are a size container: one line from 42rem, two lines from 25.5rem ("Break n" with its end, then date, time, minutes
 * and remove), and below that the second line wraps where it must (the phone chips are slice T08B). Every change goes through
 * the T06 model (`editBreakRow`, `addBreakRow`, `removeBreakRow`, `setNoBreaks`) in the dialog; nothing is sent from here.
 */
export function BreakRows({
  rows,
  noBreaks,
  zone,
  errors,
  note,
  addBreak,
  onEdit,
  onAdd,
  onRemove,
  onNoBreaks,
  onSuggest,
  onFold,
  onGap,
}: {
  rows: readonly BreakRowDraft[];
  noBreaks: boolean;
  /** The input zone the rows are typed in. */
  zone: string;
  /** The message of each row that cannot be saved as it is, by row key. */
  errors: ReadonlyMap<string, BreakRowError>;
  /** What "Suggest breaks" did (or why it could not), shown under the buttons. */
  note: string | null;
  /** The "Add break" button, so the dialog can return focus to it (G-4 "Go back and add breaks"). */
  addBreak: RefObject<HTMLButtonElement | null>;
  onEdit: (key: string, patch: BreakRowPatch) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onNoBreaks: (noBreaks: boolean) => void;
  onSuggest: () => void;
  onFold: (key: string, fold: 0 | 1) => void;
  onGap: (key: string, problem: TimeProblem) => void;
}) {
  const id = useId();
  const elements = useRef(new Map<string, HTMLElement>());
  const focusAfter = useRef<FocusAfter | null>(null);

  // After an add or a remove, focus stays in the list (SC 2.4.3): the new row's date, the next row's remove button, or Add break.
  useEffect(() => {
    const after = focusAfter.current;
    if (after === null) return;
    focusAfter.current = null;
    if (after.kind === 'new') {
      const last = rows.at(-1);
      if (last !== undefined) elements.current.get(`${last.key}:date`)?.focus();
    } else if (after.kind === 'remove') {
      elements.current.get(`${after.key}:remove`)?.focus();
    } else {
      addBreak.current?.focus();
    }
  }, [rows, addBreak]);

  const keep = (name: string) => (element: HTMLElement | null) => {
    if (element === null) elements.current.delete(name);
    else elements.current.set(name, element);
  };

  function remove(index: number, key: string) {
    const next = rows[index + 1] ?? rows[index - 1];
    focusAfter.current = next === undefined ? { kind: 'add' } : { kind: 'remove', key: next.key };
    onRemove(key);
  }

  return (
    <div className="break-area">
      <label className="inline break-none">
        <input type="checkbox" checked={noBreaks} onChange={(event) => onNoBreaks(event.target.checked)} />
        Confirm no breaks taken
      </label>
      {!noBreaks && rows.length === 0 && <p className="muted hint">No breaks listed.</p>}
      {!noBreaks && rows.length > 0 && (
        <ul className="plain break-entries" aria-label="Break list">
          {rows.map((row, index) => {
            const label = breakLabel(index);
            const error = errors.get(row.key);
            const errorId = `${id}-error-${row.key}`;
            const invalid = error !== undefined;
            const describedBy = invalid && error.problem === null ? errorId : undefined;
            const end = endText(row, index, zone);
            const suggested = row.origin === 'suggested' && !row.edited;
            return (
              <li key={row.key} className={invalid ? 'break-entry has-error' : 'break-entry'} data-break={index + 1} data-origin={row.origin}>
                <div className="break-entry-head">
                  <span className="break-num">{label}</span>
                  <span className="break-info">
                    {end !== null && <span className="break-end">{end}</span>}
                    {suggested && <span className="break-tag">suggested</span>}
                  </span>
                </div>
                <div className="break-entry-fields">
                  <label className="break-field break-date">
                    <span className="sr-only">{label} date</span>
                    <input
                      ref={keep(`${row.key}:date`)}
                      type="date"
                      value={row.start.date}
                      onChange={(event) => onEdit(row.key, { date: event.target.value })}
                      aria-invalid={invalid || undefined}
                      aria-describedby={describedBy}
                      required
                    />
                  </label>
                  <label className="break-field break-time">
                    <span className="sr-only">{label} start time</span>
                    <input
                      type="time"
                      step={row.start.time.length > 5 ? 1 : 60}
                      value={row.start.time}
                      onChange={(event) => onEdit(row.key, { time: event.target.value })}
                      aria-invalid={invalid || undefined}
                      aria-describedby={describedBy}
                      required
                    />
                  </label>
                  <label className="break-field break-minutes">
                    <span className="sr-only">{label} minutes</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={720}
                      step={1}
                      placeholder="total mins"
                      value={row.minutes}
                      onChange={(event) => onEdit(row.key, { minutes: event.target.value })}
                      aria-invalid={invalid || undefined}
                      aria-describedby={describedBy}
                      required
                    />
                  </label>
                  <button
                    ref={keep(`${row.key}:remove`)}
                    type="button"
                    className="quiet icon-button break-remove"
                    aria-label={`Remove break ${index + 1}`}
                    onClick={() => remove(index, row.key)}
                  >
                    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {error !== undefined && error.problem !== null && (
                  <div className="break-message">
                    <TimeProblemPrompt
                      problem={error.problem}
                      chosen={row.start.offset === null ? row.start.fold : null}
                      label={label}
                      onFold={(fold) => onFold(row.key, fold)}
                      onGap={() => {
                        if (error.problem !== null) onGap(row.key, error.problem);
                      }}
                    />
                  </div>
                )}
                {error !== undefined && error.problem === null && (
                  <p className="break-message break-error" id={errorId}>
                    {error.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="button-row break-actions">
        <button type="button" className="secondary" onClick={onSuggest} disabled={noBreaks}>
          Suggest breaks
        </button>
        <button
          ref={addBreak}
          type="button"
          className="secondary"
          disabled={noBreaks}
          onClick={() => {
            focusAfter.current = { kind: 'new' };
            onAdd();
          }}
        >
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add break
        </button>
      </div>
      {note !== null && (
        <p className="muted hint" role="status">
          {note}
        </p>
      )}
      <p className="muted hint">
        Saving confirms the breaks listed here. Leave the list empty and the box unticked if you do not know yet: OT for the day then stays
        pending.
      </p>
    </div>
  );
}
