import { useId } from 'react';
import type { ShareItems, TimesheetsScope } from '../api.ts';
import { PDF_SIGNATURE_NOTE } from './sharingModel.ts';

const SCOPES: ReadonlyArray<{ value: TimesheetsScope; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'view', label: 'View only' },
  { value: 'edit', label: 'Can edit' },
];

/**
 * The per-item switches of a share: timesheets (none, view or edit), the read-only OT summary and
 * ledger, and final PDF downloads. The note that PDFs carry the owner's signature image stands
 * beside the PDF switch and is its accessible description. Clock in/out, sign-off, sending and
 * settings are not items: no share can include them.
 */
export function SharingItemsFields({
  items,
  onChange,
  disabled = false,
}: {
  items: ShareItems;
  onChange: (items: ShareItems) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const noteId = `${id}-pdf-note`;
  return (
    <fieldset className="share-items" disabled={disabled}>
      <legend>Shared items</legend>
      <div className="share-item" role="radiogroup" aria-label="Timesheets">
        <span className="share-item-name">Timesheets</span>
        <div className="share-scope">
          {SCOPES.map((scope) => (
            <label key={scope.value} className="inline">
              <input
                type="radio"
                name={`${id}-timesheets`}
                value={scope.value}
                checked={items.timesheets === scope.value}
                onChange={() => onChange({ ...items, timesheets: scope.value })}
              />
              {scope.label}
            </label>
          ))}
        </div>
      </div>
      <div className="share-item">
        <label className="inline">
          <input type="checkbox" role="switch" checked={items.ot_read} onChange={(event) => onChange({ ...items, ot_read: event.target.checked })} />
          OT summary and ledger (read only)
        </label>
      </div>
      <div className="share-item">
        <label className="inline">
          <input
            type="checkbox"
            role="switch"
            checked={items.pdf_download}
            aria-describedby={noteId}
            onChange={(event) => onChange({ ...items, pdf_download: event.target.checked })}
          />
          Final PDF downloads
        </label>
        <span className="hint share-note" id={noteId}>
          {PDF_SIGNATURE_NOTE}
        </span>
      </div>
    </fieldset>
  );
}
