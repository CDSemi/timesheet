import { IMPORTED_PERIOD_REASON, IMPORTED_STATUS_TEXT } from '../importModel.ts';

/** The status of a period that was imported from a workbook (F-2): history, never signed or submitted. */
export function ImportedBadge() {
  return (
    <span className="badge badge-warn" data-status="imported">
      {IMPORTED_STATUS_TEXT}
    </span>
  );
}

/** The short reason shown next to the disabled edit, sign and submit controls of an imported period. */
export function ImportedNote({ id }: { id?: string }) {
  return (
    <p className="notice" id={id} role="note" data-imported-note>
      {IMPORTED_PERIOD_REASON}
    </p>
  );
}
