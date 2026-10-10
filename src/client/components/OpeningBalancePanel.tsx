import { useCallback, useEffect, useRef, useState } from 'react';
import {
  api,
  ApiRequestError,
  type OpeningBalanceCorrectionRequest,
  type OpeningBalanceRequest,
  type OpeningBalanceResult,
  type OpeningBalanceState,
} from '../api.ts';
import { openingBalanceErrorMessage, signedMinutesText } from '../importModel.ts';
import { displayZone, instantText, minutesText } from './format.ts';
import { OpeningBalanceForm, type OpeningSubmission } from './OpeningBalanceForm.tsx';

type Notice = { tone: 'ok' | 'warn'; text: string };

const RESULT_TEXT: Record<OpeningBalanceResult['status'], string> = {
  posted: 'Recorded in your OT ledger.',
  duplicate: 'Already recorded: an opening balance with these values exists. Nothing new was posted.',
  unchanged: 'No change: the opening balance already has this value. Nothing was posted.',
};

/** Errors after which the stored opening balance is read again, because the screen showed an old one. */
const RELOAD_CODES = new Set(['stale_version', 'opening_balance_exists']);

/**
 * The owner's opening OT balance (F-3): the one OT carried in from before the app. It is recorded once, as signed
 * minutes with an as-of date, a reason and evidence, and is changed only by a reasoned correction. It is never
 * taken from workbook formulas, and an imported workbook posts no OT.
 */
export function OpeningBalancePanel() {
  const [state, setState] = useState<OpeningBalanceState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const correctButton = useRef<HTMLButtonElement>(null);
  /** Set by Cancel: "Correct the opening balance" gets focus back once it is shown again (WP5-UX-AX-08). */
  const returnToCorrect = useRef(false);

  useEffect(() => {
    if (correcting || !returnToCorrect.current) return;
    returnToCorrect.current = false;
    correctButton.current?.focus();
  }, [correcting]);

  const load = useCallback(async () => {
    try {
      setState(await api<OpeningBalanceState>('GET', '/api/ot/opening-balance'));
      setLoadError(null);
    } catch (caught) {
      setLoadError(openingBalanceErrorMessage(caught));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (notice !== null) noticeRef.current?.focus();
  }, [notice]);

  /** Sends the first entry or the correction; returns an error message for the form, or null when it is handled here. */
  async function submit(submission: OpeningSubmission): Promise<string | null> {
    const opening = state?.opening_balance ?? null;
    try {
      const result =
        opening === null
          ? await api<OpeningBalanceResult>('POST', '/api/ot/opening-balance', {
              minutes: submission.minutes,
              as_of_date: submission.asOfDate,
              reason: submission.reason,
              evidence_ref: submission.evidence,
              expected_version: 0,
            } satisfies OpeningBalanceRequest)
          : await api<OpeningBalanceResult>('PUT', '/api/ot/opening-balance', {
              minutes: submission.minutes,
              reason: submission.reason,
              evidence_ref: submission.evidence,
              expected_version: opening.version,
            } satisfies OpeningBalanceCorrectionRequest);
      setState({ opening_balance: result.opening_balance, balance: result.balance });
      setCorrecting(false);
      setNotice({ tone: result.status === 'posted' ? 'ok' : 'warn', text: RESULT_TEXT[result.status] });
      return null;
    } catch (caught) {
      const message = openingBalanceErrorMessage(caught);
      if (caught instanceof ApiRequestError && RELOAD_CODES.has(caught.code)) {
        await load();
        setCorrecting(false);
        setNotice({ tone: 'warn', text: message });
        return null;
      }
      return message;
    }
  }

  const opening = state?.opening_balance ?? null;

  return (
    <section className="card stack" aria-label="Opening OT balance" data-opening-balance={opening === null ? 'none' : 'recorded'}>
      <h2>Opening OT balance</h2>
      <p className="muted">
        The opening balance is the only OT you carry in from before this app. Enter it yourself, with an as-of date, a reason and evidence. It is never read from
        workbook formulas, and an imported workbook posts no OT. It is recorded once; a later change is a reasoned correction.
      </p>
      {notice !== null && (
        <p className={notice.tone === 'ok' ? 'notice-ok' : 'notice'} role="status" tabIndex={-1} ref={noticeRef} data-opening-notice>
          {notice.text}
        </p>
      )}
      {loadError !== null && (
        <p className="error" role="alert">
          {loadError}
        </p>
      )}
      {state === null && loadError === null && <p className="muted">Loading…</p>}
      {state !== null && opening === null && (
        <OpeningBalanceForm mode="post" opening={null} postedMinutes={state.balance.posted_minutes} onSubmit={submit} />
      )}
      {state !== null && opening !== null && (
        <>
          <dl className="facts" data-opening-current={opening.minutes}>
            <div>
              <dt>Opening balance</dt>
              <dd>{signedMinutesText(opening.minutes)}</dd>
            </div>
            <div>
              <dt>As of</dt>
              <dd>{opening.as_of_date ?? 'none'}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{opening.reason ?? 'none'}</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>{opening.evidence_ref ?? 'none'}</dd>
            </div>
            <div>
              <dt>Recorded</dt>
              <dd>{instantText(opening.posted_at, displayZone)}</dd>
            </div>
            <div>
              <dt>Posted OT balance</dt>
              <dd>{minutesText(state.balance.posted_minutes)}</dd>
            </div>
          </dl>
          {opening.corrections.length > 0 && (
            <ul className="plain" aria-label="Corrections of the opening balance">
              {opening.corrections.map((correction) => (
                <li key={correction.id} className="ot-line" data-opening-correction>
                  <span className="mono">{instantText(correction.posted_at, displayZone)}</span>
                  <span className="mono">{signedMinutesText(correction.delta_minutes)}</span>
                  <span className="muted">{correction.reason ?? 'none'}</span>
                  <span className="muted">Evidence: {correction.evidence_ref ?? 'none'}</span>
                </li>
              ))}
            </ul>
          )}
          {correcting ? (
            <OpeningBalanceForm
              mode="correct"
              opening={opening}
              postedMinutes={state.balance.posted_minutes}
              onSubmit={submit}
              onCancel={() => {
                returnToCorrect.current = true;
                setCorrecting(false);
              }}
            />
          ) : (
            <div className="button-row">
              <button ref={correctButton} type="button" className="secondary" onClick={() => setCorrecting(true)}>
                Correct the opening balance
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
