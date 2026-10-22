import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef } from 'react';
import type { ComparisonGroup } from './settingsFileModel.ts';
import { TableWrap } from './TableWrap.tsx';

/**
 * The preview of an imported settings file (WP5-UX4-T05): a modal dialog with the file's description, the content that
 * follows, and two buttons, Cancel first. The heading takes the initial focus, so the top of the comparison is in view and a
 * keypress on opening never confirms. It follows the rules of the other dialogs (WP5-UX-B3-01): it handles its own `cancel`
 * event (Escape and the browser's close request mean Cancel), keeps its Escape from reaching anything below, is mounted only
 * while it is open, and returns focus to the control that opened it unless that control is gone.
 */
export function SettingsTransferDialog({
  title,
  description,
  confirmLabel,
  confirmDisabled,
  busy,
  opener,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  /** The file's name, format and origin; also the dialog's description. */
  description: string;
  confirmLabel: string;
  confirmDisabled: boolean;
  busy: boolean;
  opener: HTMLElement | null;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const returnTo = useRef(opener);

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    heading.current?.focus();
    const target = returnTo.current;
    return () => {
      if (target !== null && target.isConnected) target.focus();
    };
  }, []);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') event.stopPropagation();
  }

  return (
    <dialog
      ref={dialog}
      className="dialog confirm-dialog dialog-wide transfer-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
    >
      <div className="confirm-head">
        <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
          {title}
        </h2>
        <p id={`${id}-description`} className="hint muted transfer-file">
          {description}
        </p>
      </div>
      <div className="confirm-body stack">{children}</div>
      <div className="confirm-foot">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" disabled={confirmDisabled || busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

/**
 * "Now / In the file": a real table with column and row headers, one body per group. A changed value shows the word
 * "changed" beside it as well as a heavier weight, and an unchanged one reads "same", so nothing is told by colour alone.
 */
export function ComparisonTable({ groups, caption }: { groups: readonly ComparisonGroup[]; caption: string }) {
  return (
    <TableWrap label={caption}>
      <table className="transfer-table" data-comparison="true">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Setting</th>
            <th scope="col">Now</th>
            <th scope="col">In the file</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.id} data-group={group.id} data-group-changed={String(group.changed)}>
            <tr className="transfer-group">
              <th scope="rowgroup" colSpan={3}>
                {group.title}
              </th>
            </tr>
            {group.rows.map((item) => (
              <tr key={item.key} data-row={item.key} data-changed={String(item.changed)}>
                <th scope="row">{item.label}</th>
                <td>{item.now}</td>
                {item.changed ? (
                  <td className="transfer-changed">
                    <strong>{item.file}</strong> <span className="transfer-flag">changed</span>
                  </td>
                ) : (
                  <td className="muted">same</td>
                )}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </TableWrap>
  );
}
