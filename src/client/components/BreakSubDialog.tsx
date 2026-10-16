import { type KeyboardEvent, type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import { breakLabel, type BreakRowDraft, breakRowEnd, resolveBreakRow } from './breakRowsModel.ts';
import { usShortDate } from './format.ts';
import { editField, gapReplacement, type TimeProblem } from './sessionModel.ts';
import { TimeProblemPrompt } from './TimeProblemPrompt.tsx';

/** The computed end as "Ends 12:30 (America/Los_Angeles)", with the date when the break ends on a later local date. */
function endsText(row: BreakRowDraft, index: number, zone: string): string | null {
  const end = breakRowEnd(row, index, zone);
  if (end === null) return null;
  const clock = end.time.slice(0, 5);
  const when = end.date === row.start.date ? clock : `${usShortDate(end.date)} ${clock}`;
  return `Ends ${when} (${zone.trim()})`;
}

/** True while the edit differs from the row it started from (date, time, minutes or the chosen fold). */
function changed(edit: BreakRowDraft, row: BreakRowDraft): boolean {
  return (
    edit.start.date !== row.start.date || edit.start.time !== row.start.time || edit.start.fold !== row.start.fold || edit.minutes !== row.minutes
  );
}

/**
 * The "Break n" sub-dialog (WP5-UX3-T08B, owner decision N-1): the third modal level (Day editor, session dialog, this), opened
 * from a break chip. It edits a local copy of the row: the date (only when the session crosses midnight or has no end), the
 * start time and the minutes, with the computed end and the gap or fold question inline (not a fourth dialog). Done hands the
 * edited copy back (`onDone`); nothing is sent to the server from here, the session's Save does that. Cancel and Escape discard
 * the copy, and "Remove break" removes the row. The caller decides where focus goes next.
 *
 * Nested-dialog rules (WP5-UX-B3-01): one modal on top; this dialog handles its own `cancel` event and its Escape key, so
 * neither reaches the session dialog or the Day editor. Enter in a field is Done.
 */
export function BreakSubDialog({
  row,
  index,
  zone,
  showDate,
  message,
  onDone,
  onCancel,
  onRemove,
}: {
  row: BreakRowDraft;
  index: number;
  zone: string;
  /** True when the session crosses local midnight or has no end: the row then has its own date. */
  showDate: boolean;
  /** Why the row could not be saved (a refused Save), shown until the person changes it. */
  message: string | null;
  onDone: (edited: BreakRowDraft) => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const first = useRef<HTMLInputElement | null>(null);
  const time = useRef<HTMLInputElement | null>(null);
  const [edit, setEdit] = useState<BreakRowDraft>(row);
  const label = breakLabel(index);
  const touched = changed(edit, row);

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    first.current?.focus();
  }, []);

  // The gap or fold question stays on screen after a choice (a fold answer settles the start, so the plain resolution would drop the
  // prompt, and its radios, the moment one is picked): it is read with the fold not yet chosen, until the time itself changes.
  const asked = resolveBreakRow(edit.start.offset === null ? { ...edit, start: { ...edit.start, fold: null } } : edit, index, zone);
  const problem: TimeProblem | null = !asked.ok ? asked.error.problem : null;
  const ends = endsText(edit, index, zone);
  const shownMessage = message !== null && !touched && problem === null ? message : null;
  const messageId = `${id}-message`;

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Escape belongs to this dialog alone: the browser closes it through `cancel`, and no outer handler sees the key.
    if (event.key === 'Escape') event.stopPropagation();
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onDone(edit);
  }

  return (
    <dialog
      ref={dialog}
      className="dialog break-dialog"
      aria-labelledby={`${id}-title`}
      data-break-dialog={index + 1}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
    >
      <form onSubmit={submit} noValidate>
        <div className="confirm-head">
          <h2 id={`${id}-title`}>{label}</h2>
        </div>
        <div className="break-dialog-body">
          {showDate && (
            <label>
              Date
              <input
                ref={first}
                type="date"
                value={edit.start.date}
                onChange={(event) => setEdit({ ...edit, start: editField(edit.start, { date: event.target.value }), edited: true })}
                aria-describedby={shownMessage === null ? undefined : messageId}
                required
              />
            </label>
          )}
          <label>
            Start time
            <input
              ref={(element) => {
                time.current = element;
                if (!showDate) first.current = element;
              }}
              type="time"
              step={edit.start.time.length > 5 ? 1 : 60}
              value={edit.start.time}
              onChange={(event) => setEdit({ ...edit, start: editField(edit.start, { time: event.target.value }), edited: true })}
              aria-describedby={shownMessage === null ? undefined : messageId}
              required
            />
          </label>
          <label>
            Minutes
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={720}
              step={1}
              placeholder="total mins"
              value={edit.minutes}
              onChange={(event) => setEdit({ ...edit, minutes: event.target.value, edited: true })}
              aria-describedby={shownMessage === null ? undefined : messageId}
              required
            />
          </label>
          {ends !== null && <p className="break-ends muted">{ends}</p>}
          {problem !== null && (
            <TimeProblemPrompt
              problem={problem}
              chosen={edit.start.offset === null ? edit.start.fold : null}
              label={label}
              onFold={(fold) => setEdit({ ...edit, start: { ...edit.start, fold } })}
              onGap={() => {
                setEdit({ ...edit, start: gapReplacement(problem), edited: true });
                // The button that was pressed goes with the question; focus moves to the start time it replaced.
                time.current?.focus();
              }}
            />
          )}
          {shownMessage !== null && (
            <p className="break-message break-error" id={messageId}>
              {shownMessage}
            </p>
          )}
        </div>
        <div className="break-dialog-foot">
          <button type="button" className="quiet quiet-danger break-dialog-remove" onClick={onRemove}>
            Remove break
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Done</button>
        </div>
      </form>
    </dialog>
  );
}
