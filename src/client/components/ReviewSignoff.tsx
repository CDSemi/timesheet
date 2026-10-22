import { type FieldKey, type FormState, MAX_SEND_REASON, type ReviewMode } from './reviewModel.ts';

/**
 * The sign-off form: the account name that will be recorded and printed (not editable, owner decision
 * F-5 b), the reason and the email choice a revision needs, and the one submit button. Labels sit above
 * their inputs and each error sits below its field; the first missing field takes focus when a submit
 * is refused.
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
      <p id="review-signer" data-signer>
        You sign as <strong>{employeeName}</strong>, the name of your account.
      </p>

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

      {mode === 'late_review' && form.sendEmail === true && (
        <>
          {/* The automatic copy was sent at the deadline, so another copy needs the owner's reason (B-A2). */}
          <label>
            Reason for sending another copy
            <textarea
              id="review-field-reason"
              rows={2}
              value={form.reason}
              maxLength={MAX_SEND_REASON}
              aria-invalid={errors.reason !== undefined}
              aria-describedby={errors.reason === undefined ? 'review-hint-reason' : 'review-hint-reason review-error-reason'}
              onChange={(event) => onChange({ ...form, reason: event.target.value })}
            />
          </label>
          <p className="hint" id="review-hint-reason">
            Stored with the send and in your history; it is not added to the email.
          </p>
          {errors.reason !== undefined && (
            <p className="error" id="review-error-reason">
              {errors.reason}
            </p>
          )}
        </>
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
