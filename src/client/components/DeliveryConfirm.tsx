import { useEffect, useRef } from 'react';
import type { Confirmation } from './deliveryModel.ts';

/**
 * The confirmation that stands between the owner and a decision or a resend. It is inline (no
 * dialog), takes focus when it opens, and names what will happen; nothing is sent until the
 * confirm button is pressed. A refusal from the server is shown below the buttons.
 */
export function DeliveryConfirm({
  confirmation,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  confirmation: Confirmation;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
  }, []);
  const titleId = `delivery-confirm-${confirmation.action}`;
  return (
    <div
      className="confirm-panel stack"
      role="group"
      aria-labelledby={titleId}
      tabIndex={-1}
      ref={panel}
      data-confirm={confirmation.action}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) onCancel();
      }}
    >
      <h4 id={titleId}>{confirmation.title}</h4>
      <p>{confirmation.message}</p>
      {error !== null && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button type="button" disabled={busy} onClick={onConfirm}>
          {confirmation.confirmLabel}
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={onCancel}>
          {confirmation.cancelLabel}
        </button>
      </div>
    </div>
  );
}
