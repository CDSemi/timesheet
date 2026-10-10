import { type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import type { OpeningBalance } from '../api.ts';
import {
  openingBalanceErrorMessage,
  type OpeningFormValues,
  openingFormProblems,
  parseSignedMinutes,
  resultingPosted,
  type SignChoice,
  signedMinutesText,
  splitSignedMinutes,
} from '../importModel.ts';
import { minutesText } from './format.ts';

/** What the form hands over once the owner confirmed it: the signed minutes and the text fields, trimmed. */
export interface OpeningSubmission {
  minutes: number;
  asOfDate: string;
  reason: string;
  evidence: string;
}

const SIGN_TEXT: Record<SignChoice, string> = {
  credit: 'Add to my OT balance (+)',
  debit: 'Subtract from my OT balance (−)',
};

/**
 * The explicit opening OT balance (F-3) or its reasoned correction: an explicit sign, hours and minutes, an as-of date
 * (first entry only), a reason and an evidence reference, then a confirmation step that shows the resulting posted
 * balance. `onSubmit` resolves to an error message, or null when it succeeded or handled the refusal itself.
 */
export function OpeningBalanceForm({
  mode,
  opening,
  postedMinutes,
  onSubmit,
  onCancel,
}: {
  mode: 'post' | 'correct';
  opening: OpeningBalance | null;
  postedMinutes: number;
  onSubmit: (submission: OpeningSubmission) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const correcting = mode === 'correct';
  const [values, setValues] = useState<OpeningFormValues>(() => ({
    ...(correcting && opening !== null ? splitSignedMinutes(opening.minutes) : { sign: 'credit' as const, hours: '', minutes: '' }),
    asOfDate: '',
    reason: '',
    evidence: '',
  }));
  const [shown, setShown] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmPanel = useRef<HTMLDivElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  /** Set by "Back to edit" or Escape: the button that opened the confirmation gets focus back (WP5-UX-AX-08). */
  const returnToReview = useRef(false);
  const ids = { minutes: useId(), asOf: useId(), reason: useId(), evidence: useId() };

  useEffect(() => {
    if (step === 'confirm') confirmPanel.current?.focus();
    else if (returnToReview.current) {
      returnToReview.current = false;
      reviewButton.current?.focus();
    }
  }, [step]);

  function backToEdit() {
    returnToReview.current = true;
    setStep('edit');
  }

  const parsed = parseSignedMinutes(values);
  const set = (change: Partial<OpeningFormValues>) => setValues((current) => ({ ...current, ...change }));

  function review(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const problems = openingFormProblems(values, { needsAsOfDate: !correcting });
    setShown(problems);
    setError(null);
    if (Object.keys(problems).length === 0) setStep('confirm');
  }

  async function confirm() {
    if ('error' in parsed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const message = await onSubmit({ minutes: parsed.minutes, asOfDate: values.asOfDate, reason: values.reason.trim(), evidence: values.evidence.trim() });
      if (message !== null) setError(message);
    } catch (caught) {
      setError(openingBalanceErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (step === 'confirm' && !('error' in parsed)) {
    const current = opening?.minutes ?? 0;
    return (
      <div
        className="confirm-panel stack"
        role="group"
        aria-labelledby="opening-confirm-title"
        tabIndex={-1}
        ref={confirmPanel}
        data-confirm={mode}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) backToEdit();
        }}
      >
        <h4 id="opening-confirm-title">{correcting ? 'Record this correction?' : 'Record this opening balance?'}</h4>
        <dl className="facts">
          {correcting && (
            <div>
              <dt>Opening balance changes</dt>
              <dd data-confirm-change>
                {signedMinutesText(current)} to {signedMinutesText(parsed.minutes)}
              </dd>
            </div>
          )}
          {!correcting && (
            <>
              <div>
                <dt>Opening balance</dt>
                <dd data-confirm-value>{signedMinutesText(parsed.minutes)}</dd>
              </div>
              <div>
                <dt>As of</dt>
                <dd>{values.asOfDate}</dd>
              </div>
            </>
          )}
          <div>
            <dt>Posted OT balance after this entry</dt>
            <dd data-confirm-result={resultingPosted(postedMinutes, current, parsed.minutes)}>
              {minutesText(resultingPosted(postedMinutes, current, parsed.minutes))} (now {minutesText(postedMinutes)})
            </dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{values.reason.trim()}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{values.evidence.trim()}</dd>
          </div>
        </dl>
        <p className="hint">
          This is written to your OT ledger. An entry cannot be edited or deleted; a later change is a reasoned correction. Posting the same values again
          changes nothing.
        </p>
        {error !== null && (
          <p className="error" role="alert" data-error="opening">
            {error}
          </p>
        )}
        <div className="button-row">
          <button type="button" disabled={busy} onClick={() => void confirm()}>
            {correcting ? 'Confirm correction' : 'Confirm and post'}
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={backToEdit}>
            Back to edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="stack" noValidate onSubmit={review} aria-label={correcting ? 'Correct the opening balance' : 'Record the opening balance'}>
      <fieldset className="choice-set">
        <legend>{correcting ? 'New value of the opening balance' : 'Opening balance'}</legend>
        <div className="mode-list">
          {(['credit', 'debit'] as const).map((sign) => (
            <label key={sign} className="inline">
              <input type="radio" name={`opening-sign-${mode}`} checked={values.sign === sign} onChange={() => set({ sign })} data-sign={sign} />
              {SIGN_TEXT[sign]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field-grid">
        <label>
          Hours
          <input
            inputMode="numeric"
            value={values.hours}
            onChange={(event) => set({ hours: event.target.value })}
            aria-invalid={shown.minutes !== undefined}
            aria-describedby={shown.minutes === undefined ? undefined : ids.minutes}
            data-field="hours"
          />
        </label>
        <label>
          Minutes (0 to 59)
          <input
            inputMode="numeric"
            value={values.minutes}
            onChange={(event) => set({ minutes: event.target.value })}
            aria-invalid={shown.minutes !== undefined}
            aria-describedby={shown.minutes === undefined ? undefined : ids.minutes}
            data-field="minutes"
          />
        </label>
        {!correcting && (
          <label>
            As-of date
            <input
              type="date"
              value={values.asOfDate}
              onChange={(event) => set({ asOfDate: event.target.value })}
              aria-invalid={shown.asOfDate !== undefined}
              aria-describedby={shown.asOfDate === undefined ? undefined : ids.asOf}
            />
          </label>
        )}
      </div>
      {shown.minutes !== undefined && (
        <p className="error" id={ids.minutes}>
          {shown.minutes}
        </p>
      )}
      {shown.asOfDate !== undefined && (
        <p className="error" id={ids.asOf}>
          {shown.asOfDate}
        </p>
      )}
      <label>
        {correcting ? 'Reason for the correction' : 'Reason'}
        <textarea
          rows={3}
          value={values.reason}
          maxLength={2000}
          onChange={(event) => set({ reason: event.target.value })}
          aria-invalid={shown.reason !== undefined}
          aria-describedby={shown.reason === undefined ? undefined : ids.reason}
          data-field="reason"
        />
      </label>
      {shown.reason !== undefined && (
        <p className="error" id={ids.reason}>
          {shown.reason}
        </p>
      )}
      <label>
        Evidence reference (text, for example a message, document or ticket)
        <input
          value={values.evidence}
          maxLength={2000}
          onChange={(event) => set({ evidence: event.target.value })}
          aria-invalid={shown.evidence !== undefined}
          aria-describedby={shown.evidence === undefined ? undefined : ids.evidence}
          data-field="evidence"
        />
      </label>
      {shown.evidence !== undefined && (
        <p className="error" id={ids.evidence}>
          {shown.evidence}
        </p>
      )}
      <div className="button-row">
        <button ref={reviewButton} type="submit">
          Review before posting
        </button>
        {onCancel !== undefined && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
