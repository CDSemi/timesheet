import { type KeyboardEvent, type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import type { LeaveKind } from '../api.ts';
import { editorTitle } from './dayEditorModel.ts';
import { invalidLeaveParts, LEAVE_MAX_HOURS, type LeaveInput, leaveInputOf, type LeaveParts, parseLeaveInput } from './leaveInputModel.ts';
import { LEAVE_KINDS, leaveHint } from './sessionModel.ts';

const KIND_TEXT: Record<LeaveKind, string> = { vacation: 'Vacation', sick: 'Sick', ot: 'OT' };

/**
 * The "Partial leave" sub-dialog of the Day editor (WP5-UX5-T05B, U5-25, mockup B5): the leave hours, minutes and kind with the
 * hint, a modal on the `BreakSubDialog` pattern. It edits a local copy of the day-fields draft. Done hands the copy back
 * (`onDone`) only when the two fields can be read; a refusal is shown here, beside the fields, and the dialog stays. Nothing is
 * sent to the server from here: the Day editor's "Save day fields" does that, so its unsaved-edit guard and its reason field keep
 * working. Cancel and Escape drop the copy, "Remove leave" hands back no leave, and the caller decides what the draft becomes.
 *
 * Nested-dialog rules (WP5-UX-B3-01): one modal on top; this dialog handles its own `cancel` event and its Escape key, so neither
 * reaches the Day editor. On unmount, focus returns to the control that opened it (Change or Add), unless that control is gone.
 * Enter in a field is Done. The notes of the day are not part of the leave and stay in the Day editor (owner answer B5).
 */
export function LeaveDialog({
  workDate,
  leave,
  leaveKind,
  hasLeave,
  opener,
  onDone,
  onCancel,
  onRemove,
}: {
  workDate: string;
  /** The leave of the day-fields draft when the dialog opened. */
  leave: LeaveInput;
  leaveKind: LeaveKind | '';
  /** True when the draft holds leave now: "Remove leave" has something to remove. */
  hasLeave: boolean;
  /** The Change or Add button that opened the dialog; it gets focus back when the dialog goes away. */
  opener: HTMLElement | null;
  onDone: (leave: LeaveInput, leaveKind: LeaveKind | '') => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const hoursField = useRef<HTMLInputElement>(null);
  const minutesField = useRef<HTMLInputElement>(null);
  const opened = useRef(opener);
  const [hours, setHours] = useState(leave.hours);
  const [minutes, setMinutes] = useState(leave.minutes);
  const [kind, setKind] = useState<LeaveKind | ''>(leaveKind);
  // The browser's bad-input flags follow the last keystroke of each field, as the old inline fields did.
  const [bad, setBad] = useState({ hours: false, minutes: false });
  const [refusal, setRefusal] = useState<{ message: string; parts: LeaveParts } | null>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hint = leaveHint({ hours, minutes, hoursBad: bad.hours, minutesBad: bad.minutes });

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    hoursField.current?.focus();
    const returnTo = opened.current;
    return () => {
      // The dialog is already out of the document here, so the editor behind it is no longer inert.
      if (returnTo !== null && returnTo.isConnected) returnTo.focus();
    };
  }, []);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Escape belongs to this dialog alone: the browser closes it through `cancel`, and no outer handler sees the key.
    if (event.key === 'Escape') event.stopPropagation();
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // The fields themselves are asked now: the browser raises no change event for every unreadable keystroke (a lone "e"), so the
    // state alone can miss it. A malformed part never reaches the draft.
    const asked: LeaveInput = {
      hours,
      minutes,
      hoursBad: hoursField.current?.validity.badInput === true,
      minutesBad: minutesField.current?.validity.badInput === true,
    };
    const parsed = parseLeaveInput(asked);
    if (!parsed.ok) {
      setRefusal({ message: parsed.message, parts: invalidLeaveParts(asked) });
      return;
    }
    // The draft takes the leave in its canonical fields ("" and "0" both read 0; a kind means nothing without leave), so typing
    // the same leave again is no edit and the summary row and the saved day agree.
    onDone(leaveInputOf(parsed.minutes), parsed.minutes === 0 ? '' : kind);
  }

  /** The invalid-state attributes of one leave field while the refusal is shown. */
  function fieldState(invalid: boolean) {
    return invalid && refusal !== null ? { 'aria-invalid': true as const, 'aria-describedby': `${hintId} ${errorId}` } : { 'aria-describedby': hintId };
  }

  return (
    <dialog
      ref={dialog}
      className="dialog break-dialog leave-dialog"
      aria-labelledby={`${id}-title`}
      data-leave-dialog
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
    >
      {/* noValidate keeps the browser's own popups out: the fields are read by parseLeaveInput, which also sees the bad-input flag. */}
      <form onSubmit={submit} noValidate>
        <div className="confirm-head leave-dialog-head">
          <h2 id={`${id}-title`}>Partial leave</h2>
          <p className="muted">{editorTitle(workDate)}</p>
        </div>
        <div className="break-dialog-body">
          <div className="leave-grid">
            <label>
              Leave hours
              <input
                ref={hoursField}
                type="number"
                inputMode="numeric"
                min={0}
                max={LEAVE_MAX_HOURS}
                step={1}
                value={hours}
                onChange={(event) => {
                  setHours(event.target.value);
                  setBad({ ...bad, hours: event.target.validity.badInput });
                  setRefusal(null);
                }}
                {...fieldState(refusal?.parts.hours === true)}
              />
            </label>
            <label>
              Leave minutes
              <input
                ref={minutesField}
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                step={1}
                value={minutes}
                onChange={(event) => {
                  setMinutes(event.target.value);
                  setBad({ ...bad, minutes: event.target.validity.badInput });
                  setRefusal(null);
                }}
                {...fieldState(refusal?.parts.minutes === true)}
              />
            </label>
            <label>
              Leave kind
              <select value={kind} onChange={(event) => setKind(event.target.value as LeaveKind | '')}>
                <option value="">Not set</option>
                {LEAVE_KINDS.map((item) => (
                  <option key={item} value={item}>
                    {KIND_TEXT[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p id={hintId} className="muted hint">
            {hint === null ? 'Hours and minutes, at most 24h 00m.' : `Leave ${hint}.`} A kind is required with leave. It never reserves or spends OT.
          </p>
          {refusal !== null && (
            <p id={errorId} className="error" role="alert">
              {refusal.message}
            </p>
          )}
        </div>
        <div className="break-dialog-foot">
          <button type="button" className="quiet quiet-danger break-dialog-remove" disabled={!hasLeave} onClick={onRemove}>
            Remove leave
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
