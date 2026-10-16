import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef } from 'react';
import type { ConfirmFact } from './dayEditorModel.ts';

/**
 * A modal confirmation (`alertdialog`): a title, the facts it is about, a sentence, optional extra content (the reason
 * field of an old period), and two buttons. Cancel comes first and takes the initial focus, so Enter or Space on opening
 * never confirms by accident; the confirming button is `danger` for a deletion. Written for reuse (the session dialog's
 * save and discard prompts, WP5-UX3-T08).
 *
 * Nested-dialog rules (WP5-UX-B3-01): at most one modal on top; this dialog handles its own `cancel` event (the Escape
 * key and the browser's close request), stops it from reaching the dialog it sits in, and stops an Escape keydown from
 * bubbling to the Day editor's own key handler. It is mounted only while it is open, and on unmount returns focus to
 * the control that opened it unless that control is gone (the caller then moves focus where it belongs).
 */
export function ConfirmDialog({
  title,
  message,
  facts,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  confirmDisabled = false,
  busy = false,
  opener,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  /** The sentence under the facts; it is also the dialog's description. */
  message: string;
  facts?: readonly ConfirmFact[];
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` paints the confirming button with the destructive colour. */
  tone?: 'primary' | 'danger';
  /** True while a required field (the reason) is empty. */
  confirmDisabled?: boolean;
  busy?: boolean;
  /** The control to return focus to when the dialog goes away, if it still exists then. */
  opener?: HTMLElement | null;
  onConfirm: () => void;
  onCancel: () => void;
  /** Extra content between the sentence and the buttons. */
  children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const messageId = `${id}-message`;
  const opened = useRef(opener);

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    cancel.current?.focus();
    const returnTo = opened.current;
    return () => {
      // The dialog is already out of the document here, so the page behind is no longer inert.
      if (returnTo !== null && returnTo !== undefined && returnTo.isConnected) returnTo.focus();
    };
  }, []);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Escape belongs to this dialog alone: the browser closes it through `cancel`, and no outer handler sees the key.
    if (event.key === 'Escape') event.stopPropagation();
  }

  return (
    <dialog
      ref={dialog}
      role="alertdialog"
      className="dialog confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
    >
      <div className="confirm-head">
        <h2 id={titleId}>{title}</h2>
      </div>
      <div className="confirm-body stack">
        {facts !== undefined && facts.length > 0 && (
          <dl className="confirm-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p id={messageId} className="confirm-message">
          {message}
        </p>
        {children}
      </div>
      <div className="confirm-foot">
        <button ref={cancel} type="button" className="secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className={tone === 'danger' ? 'danger' : undefined} disabled={confirmDisabled || busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
