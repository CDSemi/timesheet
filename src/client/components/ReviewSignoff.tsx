import type { FieldKey, FormState, ReviewMode } from './reviewModel.ts';

/**
 * The sign-off form: the name that goes on the PDF, the reason and the email choice a revision
 * needs, and the one submit button. Labels sit above their inputs and each error sits below its
 * field; the first missing field takes focus when a submit is refused.
 */
export function ReviewSignoff({
  mode,
  employeeName,
  form,
  errors,
  busy,
  onChange,
  onSubmit,
}: {
  mode: ReviewMode;
  employeeName: string;
  form: FormState;
  errors: Partial<Record<FieldKey, string>>;
  busy: boolean;
  onChange: (next: FormState) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="card stack"
      aria-labelledby="review-signoff-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 id="review-signoff-title">Sign off</h2>
      <label>
        Your name
        <input
          id="review-field-signer_name"
          type="text"
          autoComplete="name"
          value={form.signerName}
          maxLength={400}
          aria-invalid={errors.signer_name !== undefined}
          aria-describedby={`review-hint-signer_name${errors.signer_name === undefined ? '' : ' review-error-signer_name'}`}
          onChange={(event) => onChange({ ...form, signerName: event.target.value })}
        />
      </label>
      <p className="muted hint" id="review-hint-signer_name">
        Type your name as it should appear on the PDF. Name on file: {employeeName}.
      </p>
      {errors.signer_name !== undefined && (
        <p className="error" id="review-error-signer_name">
          {errors.signer_name}
        </p>
      )}

      {mode === 'correction' && (
        <>
          <label>
            Reason for the correction
            <textarea
              id="review-field-reason"
              rows={3}
              value={form.reason}
              maxLength={2000}
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
        </>
      )}

      {mode !== 'signoff' && (
        <fieldset className="mode-list choice-set" id="review-field-send_email" tabIndex={-1}>
          <legend>Email this revision to the recipients?</legend>
          <label className="inline">
            <input type="radio" name="send-email" checked={form.sendEmail === true} onChange={() => onChange({ ...form, sendEmail: true })} />
            Send the email
          </label>
          <label className="inline">
            <input type="radio" name="send-email" checked={form.sendEmail === false} onChange={() => onChange({ ...form, sendEmail: false })} />
            Save the PDF only
          </label>
          {errors.send_email !== undefined && (
            <p className="error" id="review-error-send_email">
              {errors.send_email}
            </p>
          )}
        </fieldset>
      )}

      <div className="button-row">
        <button type="submit" disabled={busy}>
          Sign off &amp; Submit
        </button>
        <a className="button-link" href="#/timesheet">
          Back to the timesheet
        </a>
      </div>
      {busy && (
        <p className="muted" role="status">
          Submitting. Do not close this page.
        </p>
      )}
    </form>
  );
}
