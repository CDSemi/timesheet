import { type KeyboardEvent, useEffect, useId, useRef } from 'react';

/**
 * A modal alert with one OK button (WP5-UX4-T03, U4-15): "This session was not saved" and the reason, shown where it cannot fall
 * below the fold of a scrolling dialog body. A message per line (the break rows are listed by "Break n"), an optional hint under
 * them, and OK, which takes the initial focus; Escape and the browser's close request mean OK. Unlike `ConfirmDialog` it never asks
 * anything and has no second button, so a person can only acknowledge it.
 *
 * Nested-dialog rules (WP5-UX-B3-01), as for `ConfirmDialog`: at most one modal on top; this dialog handles its own `cancel` event,
 * keeps its Escape from reaching the dialogs below, and is mounted only while it is open. It returns no focus itself: the caller
 * moves focus to the first marked row or field, else to its Save button, once this dialog is gone (that control is behind it
 * while it is open).
 */
export function AlertDialog({ title, messages, hint, onClose }: { title: string; messages: readonly string[]; hint?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const ok = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    ok.current?.focus();
  }, []);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Escape belongs to this dialog alone: the browser closes it through `cancel`, and no outer handler sees the key.
    if (event.key === 'Escape') event.stopPropagation();
  }

  const messageIds = messages.map((_, index) => `${id}-message-${index}`);

  return (
    <dialog
      ref={dialog}
      role="alertdialog"
      className="dialog confirm-dialog alert-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={messageIds.join(' ')}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <div className="confirm-head alert-head">
        <span className="shape shape-triangle alert-shape" aria-hidden="true" />
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className="confirm-body stack alert-body">
        {messages.length === 1 ? (
          <p id={messageIds[0]} className="confirm-message">
            {messages[0]}
          </p>
        ) : (
          <ul className="plain alert-messages">
            {messages.map((message, index) => (
              <li key={messageIds[index]} id={messageIds[index]} className="confirm-message">
                {message}
              </li>
            ))}
          </ul>
        )}
        {hint !== undefined && <p className="muted hint">{hint}</p>}
      </div>
      <div className="confirm-foot">
        <button ref={ok} type="button" onClick={onClose}>
          OK
        </button>
      </div>
    </dialog>
  );
}
