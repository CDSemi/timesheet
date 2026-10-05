import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiRequestError, type ReviewResponse, type SignOffResponse } from './api.ts';
import { describeError } from './components/errors.ts';
import { instantText, periodRange } from './components/format.ts';
import { granteeChangeText } from './components/granteeChangesModel.ts';
import { ReviewDays } from './components/ReviewDays.tsx';
import { ReviewEnvelope } from './components/ReviewEnvelope.tsx';
import { ReviewDeficits, ReviewEvidence, ReviewOtProposals, ReviewReservations } from './components/ReviewFindings.tsx';
import { ReviewSignoff } from './components/ReviewSignoff.tsx';
import { loadPeriodState, type PeriodState, ReviewBadges } from './components/ReviewStatus.tsx';
import {
  type Blocker,
  buildSubmitBody,
  classifySubmitError,
  type FieldKey,
  type FormState,
  modeEndpoint,
  resetAfterStale,
  reviewMode,
  type ReviewMode,
  submitBlockers,
} from './components/reviewModel.ts';

const EMPTY_FORM: FormState = { signerName: '', acknowledged: false, choices: {}, reason: '', sendEmail: null };

type Phase = { kind: 'loading' } | { kind: 'ready' } | { kind: 'missing' } | { kind: 'failed'; message: string };

const MODE_INTRO: Record<ReviewMode, string> = {
  signoff: 'Check every day, then sign off. Signing off posts your OT credits and sends the PDF to the recipients below.',
  late_review:
    'This period was submitted automatically at the deadline and is waiting for your review. Signing records your review. It changes no OT balance.',
  correction:
    'This period is already submitted. A change is recorded as a correction revision with a reason, and only the differences post to the OT ledger.',
};

/**
 * The owner's review and sign-off screen (`#/review/{payrollDate}`). The page shows the server's
 * review payload as it is and posts the hash and the version it displayed. If anything changed
 * since, the server refuses with a 409 and nothing is submitted: the screen then reloads a fresh
 * review and says so. A 422 names the missing field.
 */
export function ReviewScreen({ payrollDate }: { payrollDate: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [period, setPeriod] = useState<PeriodState | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [shown, setShown] = useState<Blocker[]>([]);
  const [notice, setNotice] = useState<{ kind: 'stale' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<SignOffResponse | null>(null);
  const submitting = useRef(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async () => {
    try {
      const [fresh, state] = await Promise.all([
        api<ReviewResponse>('GET', `/api/timesheets/${payrollDate}/review`),
        loadPeriodState(payrollDate),
      ]);
      setReview(fresh);
      setPeriod(state);
      setPhase({ kind: 'ready' });
    } catch (caught) {
      setPhase(caught instanceof ApiRequestError && caught.status === 404 ? { kind: 'missing' } : { kind: 'failed', message: describeError(caught) });
    }
  }, [payrollDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (phase.kind === 'ready') headingRef.current?.focus();
  }, [phase.kind]);

  useEffect(() => {
    if (notice !== null) noticeRef.current?.focus();
  }, [notice]);

  const errors: Partial<Record<FieldKey, string>> = {};
  for (const item of shown) errors[item.field] = item.message;

  function focusField(field: FieldKey) {
    document.getElementById(`review-field-${field}`)?.focus();
  }

  async function submit() {
    if (review === null || submitting.current) return;
    const mode = reviewMode(period?.finalization.revision ?? null);
    const blockers = submitBlockers(review.payload, mode, form);
    setNotice(null);
    if (blockers.length > 0) {
      setShown(blockers);
      const first = blockers[0];
      if (first !== undefined) queueMicrotask(() => focusField(first.field));
      return;
    }
    // One request at a time: a second click or Enter while one is in flight is ignored.
    submitting.current = true;
    setBusy(true);
    setShown([]);
    try {
      const result = await api<SignOffResponse>('POST', modeEndpoint(mode, payrollDate), buildSubmitBody(review, mode, form));
      setDone(result);
      setPeriod(await loadPeriodState(payrollDate).catch(() => period));
    } catch (caught) {
      const failure = classifySubmitError(caught);
      if (failure.kind === 'stale') {
        setForm((current) => resetAfterStale(current));
        setNotice({ kind: 'stale', message: failure.message });
        await load();
      } else if (failure.kind === 'field') {
        setShown([{ field: failure.field, message: failure.message }]);
        queueMicrotask(() => focusField(failure.field));
      } else {
        setNotice({ kind: 'error', message: failure.message });
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (phase.kind === 'loading') return <p className="muted">Loading review…</p>;
  if (phase.kind === 'missing') {
    return (
      <section className="card stack" aria-labelledby="review-title">
        <h1 id="review-title">Review and sign off</h1>
        <p className="error" role="alert">
          No such period for your account.
        </p>
        <a className="button-link" href="#/timesheet">
          Back to the timesheet
        </a>
      </section>
    );
  }
  if (phase.kind === 'failed' || review === null) {
    return (
      <section className="card stack" aria-labelledby="review-title">
        <h1 id="review-title">Review and sign off</h1>
        <p className="error" role="alert">
          {phase.kind === 'failed' ? phase.message : 'The review could not be loaded.'}
        </p>
        <button type="button" className="secondary" onClick={() => void load()}>
          Try again
        </button>
      </section>
    );
  }

  const { payload } = review;
  const mode = reviewMode(period?.finalization.revision ?? null);
  return (
    <div className="review-screen stack">
      <header className="toolbar">
        <div>
          <h1 id="review-title" tabIndex={-1} ref={headingRef}>
            Review and sign off
          </h1>
          <p className="muted">
            <span className="mono">{periodRange(payload.period)}</span>, payroll date <span className="mono">{payload.period.payroll_date}</span>, submission{' '}
            <span className="mono">{payload.submission.id}</span>
          </p>
        </div>
        <div className="period-title" aria-label="Status">
          <ReviewBadges state={period} fallback="Draft" />
        </div>
      </header>

      {notice !== null && (
        <div className={notice.kind === 'stale' ? 'stale' : 'stale error-box'} role="alert" tabIndex={-1} ref={noticeRef} data-notice={notice.kind}>
          <p>{notice.message}</p>
        </div>
      )}

      {done !== null && (
        <section className="card stack" aria-labelledby="review-done-title" data-result={done.status}>
          <h2 id="review-done-title">{done.status === 'replayed' ? 'Already submitted' : 'Submitted'}</h2>
          <p className="notice-ok" role="status">
            {done.status === 'replayed'
              ? 'This sign-off was already recorded. Nothing new was created.'
              : `Revision ${done.revision?.revision_no ?? ''} is signed and queued for the PDF${done.revision?.send_requested === true ? ' and the email' : ''}.`}
          </p>
          {done.signoff !== null && (
            <p className="muted">
              Signed by {done.signoff.signer_name} at <span className="mono">{instantText(done.signoff.signed_at, payload.reporting_zone)}</span> ({payload.reporting_zone}).
            </p>
          )}
          <div className="button-row">
            <a className="button-link" href="#/timesheet">
              Back to the timesheet
            </a>
            <a className="button-link" href="#/history">
              History
            </a>
          </div>
        </section>
      )}

      {done === null && (
        <p className="card muted" data-mode={mode}>
          {MODE_INTRO[mode]}
        </p>
      )}

      {done === null && review.grantee_changes.length > 0 && (
        <section className="card stack review-grantee-changes" aria-labelledby="review-grantee-changes-title" data-grantee-changes>
          <h2 id="review-grantee-changes-title">Changed by someone you share with</h2>
          <ul className="plain">
            {review.grantee_changes.map((change) => (
              <li key={`${change.display_name}:${change.work_dates.join(',')}`} data-grantee-change>
                {granteeChangeText(change)}
              </li>
            ))}
          </ul>
          <p className="hint">Check these days before you sign. This note is not part of what you sign, and it is not in the PDF.</p>
        </section>
      )}

      <ReviewDays days={payload.days} zone={payload.reporting_zone} totalCredited={payload.totals.credited_minutes} pendingDays={payload.totals.pending_days} />
      <ReviewOtProposals payload={payload} />
      <ReviewDeficits
        proposals={payload.deficit_proposals}
        choices={form.choices}
        onChoose={(workDate, choice) => setForm({ ...form, choices: { ...form.choices, [workDate]: choice } })}
        error={errors.deficit_choices ?? null}
      />
      <ReviewEvidence
        payload={payload}
        acknowledged={form.acknowledged}
        onAcknowledge={(value) => setForm({ ...form, acknowledged: value })}
        error={errors.acknowledgement ?? null}
      />
      <ReviewReservations payload={payload} />
      <ReviewEnvelope payload={payload} error={errors.signature ?? null} />

      {done === null && (
        <ReviewSignoff
          mode={mode}
          employeeName={payload.employee.name}
          form={form}
          errors={errors}
          busy={busy}
          onChange={setForm}
          onSubmit={() => void submit()}
        />
      )}
    </div>
  );
}
