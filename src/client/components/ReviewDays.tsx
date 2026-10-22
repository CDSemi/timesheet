import type { ReactNode, Ref } from 'react';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';
import { ImportedNote } from './ImportStatus.tsx';
import { SHEET_QUERY } from './layoutQueries.ts';
import { reviewSheetWeeks } from './reviewModel.ts';
import { ReviewSheet, SignatureRows } from './TimesheetSheet.tsx';
import { useMedia } from './useMedia.ts';

/** What the Employee Signature line shows once the period is signed: the saved image when there was one, the name, the date. */
export interface SignedLine {
  name: string;
  /** The sign date in the reporting zone, as the PDF prints it (`MM/DD/YYYY`). */
  date: string;
  /** The attachment of the image placed on the PDF; null: the name alone signed (F-5 b). */
  imageId: string | null;
}

/** The signed content of the Employee Signature line: the image (owner only, same-origin route), the name and a "Signed" mark in words and a shape. */
export function SignedMark({ line }: { line: SignedLine }) {
  return (
    <span className="signed-mark" data-signed-line>
      {line.imageId !== null && <img className="signed-image" src={`/api/signatures/${line.imageId}`} alt="Your saved signature image" />}
      <span className="signed-name" data-signer-name>
        {line.name}
      </span>
      <span className="status status-complete" data-signed-seal>
        <span className="shape shape-circle" aria-hidden="true" />
        Signed
      </span>
    </span>
  );
}

/**
 * The preview card of the Review page (U5-29): a header bar with "Preview" and the status chips, then the sheet exactly as the review
 * payload holds it (categories, session times in the reporting zone, the server's minutes). The Employee Signature line carries the
 * Sign off button, or after the sign-off the signed image, name, date and "Signed" mark. An imported period shows the same line with a
 * disabled button and the reason: it is history and is never signed.
 */
export function ReviewDays({
  payload,
  chips,
  signed,
  signLabel,
  canSign,
  imported,
  signButtonRef,
  onSignOff,
}: {
  payload: ReviewSnapshot;
  chips: ReactNode;
  signed: SignedLine | null;
  signLabel: string;
  /** Whether the Sign off button is offered at all (not after a sign-off in this window). */
  canSign: boolean;
  imported: boolean;
  signButtonRef: Ref<HTMLButtonElement>;
  onSignOff: () => void;
}) {
  // The 7-column sheet from 480px, the 4-column table per week below it (the same SHEET_QUERY as the Timesheet page).
  const desktop = useMedia(SHEET_QUERY);
  const zone = payload.reporting_zone;
  const rows = (
    <SignatureRows
      employee={signed === null ? null : <SignedMark line={signed} />}
      employeeDate={signed?.date ?? ''}
      manager="Not used yet"
      action={
        canSign || imported ? (
          <button
            type="button"
            ref={signButtonRef}
            data-sign-off
            disabled={imported}
            aria-describedby={imported ? 'imported-reason' : undefined}
            onClick={onSignOff}
          >
            {signLabel}
          </button>
        ) : undefined
      }
    />
  );
  return (
    <section className="review-preview" data-paper="review" aria-labelledby="review-preview-title">
      <div className="preview-bar">
        <h2 id="review-preview-title">Preview</h2>
        <div className="preview-chips" role="group" aria-label="Status">
          {chips}
        </div>
      </div>
      <div className="preview-body">
        <ReviewSheet
          weeks={reviewSheetWeeks(payload.days, zone)}
          employeeName={payload.employee.name}
          period={payload.period}
          desktop={desktop}
          totalCredited={payload.totals.credited_minutes}
          pendingDays={payload.totals.pending_days}
          signature={
            imported ? (
              <div className="stack" data-imported-lock>
                <ImportedNote id="imported-reason" />
                {rows}
              </div>
            ) : (
              rows
            )
          }
        />
      </div>
    </section>
  );
}
