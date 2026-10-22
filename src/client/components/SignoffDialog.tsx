import { type KeyboardEvent, useEffect, useId, useRef } from 'react';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';
import { ReviewDeficits, ReviewEvidence, ReviewOtProposals, ReviewReservations } from './ReviewFindings.tsx';
import { usDate } from './format.ts';
import {
  type FieldKey,
  type FormState,
  otTotalText,
  periodDescription,
  type ReviewMode,
  SIGNOFF_LABEL,
  SIGNOFF_NOTE,
  SIGNOFF_TITLE,
  signatureSummary,
  weekdayDate,
} from './reviewModel.ts';
import { SETTINGS_HASH } from './routeModel.ts';
import { SignatureRows } from './TimesheetSheet.tsx';

/** The longest correction reason the server accepts. */
const MAX_CORRECTION_REASON = 2000;

/**
 * The sign-off confirmation (U5-30): a modal that holds everything a person decides before signing: who signs (the account, never a
 * typed name, F-5 b), the date on the PDF, the OT total, a preview of the signature (the saved image and the name, or the name only),
 * and everything the review found (OT proposals, deficit choices, missing evidence with its acknowledgement, reserved OT leave), plus
 * the reason of a correction. It says plainly that signing sends nothing. A missing choice shows inline, next to its field; the first
 * one takes focus. Cancel and Escape leave nothing signed; focus then returns to the Sign off button that opened the dialog.
 *
 * Like the other dialogs it is mounted only while open, handles its own `cancel` event and keeps its Escape from reaching anything
 * below it.
 */
export function SignoffDialog({
  mode,
  payload,
  today,
  form,
  errors,
  busy,
  opener,
  onChange,
  onCancel,
  onSubmit,
}: {
  mode: ReviewMode;
  payload: ReviewSnapshot;
  /** Today in the reporting zone (`YYYY-MM-DD`): the date the PDF will carry. */
  today: string;
  form: FormState;
  errors: Partial<Record<FieldKey, string>>;
  busy: boolean;
  /** The control to return focus to when the dialog goes away, if it still exists then. */
  opener: HTMLElement | null;
  onChange: (next: FormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const opened = useRef(opener);
  const description = periodDescription(payload.period, payload.reporting_zone);
  const signature = signatureSummary(payload);
  const name = payload.employee.name;

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    heading.current?.focus();
    const returnTo = opened.current;
    return () => {
      // The dialog is already out of the document here, so the page behind is no longer inert.
      if (returnTo !== null && returnTo !== undefined && returnTo.isConnected) returnTo.focus();
    };
  }, []);

  // A refused submit names a missing field: the first one takes focus (the field's own id, as before).
  const firstError = (['acknowledgement', 'deficit_choices', 'reason'] as const).find((field) => errors[field] !== undefined);
  const focusedFor = useRef<string | null>(null);
  useEffect(() => {
    if (firstError === undefined) {
      focusedFor.current = null;
      return;
    }
    const key = `${firstError}:${errors[firstError]}`;
    if (focusedFor.current === key) return;
    focusedFor.current = key;
    document.getElementById(`review-field-${firstError}`)?.focus();
  }, [firstError, errors]);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Escape belongs to this dialog alone: the browser closes it through `cancel`, and no outer handler sees the key.
    if (event.key === 'Escape') event.stopPropagation();
  }

  const titleId = `${id}-title`;
  const noteId = `${id}-note`;
  return (
    <dialog
      ref={dialog}
      className="dialog signoff-dialog"
      aria-labelledby={titleId}
      aria-describedby={noteId}
      data-mode={mode}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onCancel();
      }}
    >
      <form
        className="signoff-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) onSubmit();
        }}
      >
        <div className="signoff-head">
          <h2 id={titleId} tabIndex={-1} ref={heading}>
            {SIGNOFF_TITLE[mode]}
          </h2>
          <p className="muted">
            Pay period {weekdayDate(payload.period.period_start)} {'->'} {weekdayDate(payload.period.period_end)} · payroll date {description.payroll}
          </p>
        </div>

        <div className="signoff-body stack">
          <dl className="signoff-summary" aria-label="What you are signing">
            <div data-summary="signer">
              <dt>Signer</dt>
              <dd data-signer>
                {name} (you)
              </dd>
            </div>
            <div data-summary="date">
              <dt>Date on the PDF</dt>
              <dd>
                Today, {usDate(today)} ({payload.reporting_zone})
              </dd>
            </div>
            <div data-summary="ot">
              <dt>Overtime total</dt>
              <dd data-minutes={payload.totals.credited_minutes}>
                {otTotalText(payload.totals.credited_minutes)} h:mm {mode === 'late_review' ? 'recorded; no OT balance changes' : 'credited when you sign off'}
              </dd>
            </div>
            <div data-summary="signature">
              <dt>Signature</dt>
              <dd data-signature={signature.image === null ? 'name-only' : 'image'}>
                {signature.text}
                {signature.image === null && (
                  <>
                    {' '}
                    <a href={SETTINGS_HASH}>Add a signature image in Settings.</a>
                  </>
                )}
              </dd>
            </div>
          </dl>

          <div className="signoff-preview" aria-label="Signature preview" data-signature-preview>
            <SignatureRows
              employee={
                <span className="signed-mark">
                  {signature.image !== null && <img className="signed-image" src={signature.image} alt="Your saved signature image" />}
                  <span className="signed-name">{name}</span>
                </span>
              }
              employeeDate={usDate(today)}
              manager="Not used yet"
            />
          </div>

          <ReviewOtProposals payload={payload} />
          <ReviewDeficits
            proposals={payload.deficit_proposals}
            choices={form.choices}
            onChoose={(workDate, choice) => onChange({ ...form, choices: { ...form.choices, [workDate]: choice } })}
            error={errors.deficit_choices ?? null}
          />
          <ReviewEvidence payload={payload} acknowledged={form.acknowledged} onAcknowledge={(value) => onChange({ ...form, acknowledged: value })} error={errors.acknowledgement ?? null} />
          <ReviewReservations payload={payload} />

          {mode === 'correction' && (
            <div className="stack signoff-reason">
              <label>
                Reason for the correction
                <textarea
                  id="review-field-reason"
                  rows={3}
                  value={form.reason}
                  maxLength={MAX_CORRECTION_REASON}
                  aria-invalid={errors.reason !== undefined}
                  aria-describedby={errors.reason === undefined ? undefined : 'review-error-reason'}
                  onChange={(event) => onChange({ ...form, reason: event.target.value })}
                />
              </label>
              {errors.reason !== undefined && (
                <p className="error" id="review-error-reason">
                  {errors.reason}
                </p>
              )}
            </div>
          )}

          <p className="muted hint" id={noteId} data-signoff-note>
            {SIGNOFF_NOTE[mode]}
          </p>
          {busy && (
            <p className="muted" role="status">
              Signing off. Do not close this page.
            </p>
          )}
        </div>

        <div className="confirm-foot">
          <button type="button" className="secondary" disabled={busy} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={busy} data-confirm-sign>
            {SIGNOFF_LABEL[mode]}
          </button>
        </div>
      </form>
    </dialog>
  );
}
