import { useCallback, useEffect, useRef, useState } from 'react';
import {
  api,
  ApiRequestError,
  type CurrentPeriods,
  type ReviewResponse,
  type SendDraft,
  type SignOffResponse,
  type SubmissionSettings,
  type TimesheetView,
} from './api.ts';
import { AlertDialog } from './components/AlertDialog.tsx';
import { sendCardState, sendFormFromDraft, sendFormFromReview } from './components/deliveryModel.ts';
import { describeError } from './components/errors.ts';
import { granteeChangeText } from './components/granteeChangesModel.ts';
import { IMPORTED_STATUS_TEXT } from './importModel.ts';
import { ImportedBadge } from './components/ImportStatus.tsx';
import { PERIOD_PILL_WORDS, periodPillKind, type PeriodPillKind } from './components/periodBarModel.ts';
import { ReviewDays, type SignedLine } from './components/ReviewDays.tsx';
import { DeliveryBadge, loadPeriodState, type PeriodState, ReviewBadges } from './components/ReviewStatus.tsx';
import {
  type Blocker,
  buildSubmitBody,
  classifySubmitError,
  type FieldKey,
  type FormState,
  MODE_INTRO,
  modeEndpoint,
  periodDescription,
  resetAfterStale,
  reviewMode,
  signedDate,
  SIGNOFF_LABEL,
  submitBlockers,
  zoneNote,
} from './components/reviewModel.ts';
import { SendCard } from './components/SendCard.tsx';
import { SignoffDialog } from './components/SignoffDialog.tsx';

const EMPTY_FORM: FormState = { acknowledged: false, choices: {}, reason: '' };

type Phase = { kind: 'loading' } | { kind: 'ready' } | { kind: 'missing' } | { kind: 'failed'; message: string };

/** What the page holds beyond the review payload: the period's state, the clock of the reporting zone and the send defaults. */
interface Around {
  period: PeriodState;
  draft: SendDraft | null;
}

/** The send draft of the current revision, or null when there is none to read (no revision yet, an imported period or a failed read). */
async function readDraft(state: PeriodState, imported: boolean): Promise<SendDraft | null> {
  const revision = state.finalization.revision;
  if (revision === null || imported) return null;
  return api<SendDraft>('GET', `/api/revisions/${revision.id}/send-draft`).catch(() => null);
}

/**
 * The owner's "Review and sign off" page (`#/review/{payrollDate}`), one column at every width: the title with its chips, a check card,
 * the Preview of exactly what the review payload holds (with the Sign off button in the Employee Signature line), the Send card, and
 * one note on the zone. Signing off and sending are two acts (WP5-UX5-T01b): the Sign off dialog signs and sends nothing; the Send card
 * sends the signed revision with its own envelope, PDF rows and, for another copy, the owner's reason. The page shows the server's review
 * payload as it is and posts the hash and the version it displayed. If anything changed since, the server refuses with a 409 and nothing
 * is signed: the page then reloads a fresh review and says so. A 422 names the missing field.
 */
export function ReviewScreen({ payrollDate }: { payrollDate: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [around, setAround] = useState<Around | null>(null);
  // F-2: an imported period is read-only history; its sign-off is shown but disabled, with the reason.
  const [imported, setImported] = useState(false);
  const [pill, setPill] = useState<PeriodPillKind>('neutral');
  const [today, setToday] = useState<string | null>(null);
  const [defaultTime, setDefaultTime] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [shown, setShown] = useState<Blocker[]>([]);
  const [notice, setNotice] = useState<{ kind: 'stale' | 'error'; message: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Set by a sign-off made in this window: the page then shows the signed footer and no second Sign off button.
  const [justSigned, setJustSigned] = useState<{ status: SignOffResponse['status']; revisionNo: number | null } | null>(null);
  const submitting = useRef(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const signButton = useRef<HTMLButtonElement>(null);
  const sendHeading = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async () => {
    try {
      const [fresh, state, sheet, current, saved] = await Promise.all([
        api<ReviewResponse>('GET', `/api/timesheets/${payrollDate}/review`),
        loadPeriodState(payrollDate),
        api<TimesheetView>('GET', `/api/timesheets/${payrollDate}`),
        api<CurrentPeriods>('GET', '/api/periods/current').catch(() => null),
        api<{ settings: SubmissionSettings }>('GET', '/api/settings/submission')
          .then((answer) => answer.settings)
          .catch(() => null),
      ]);
      const isImported = sheet.timesheet.imported_unverified;
      const draft = await readDraft(state, isImported);
      setReview(fresh);
      setAround({ period: state, draft });
      setImported(isImported);
      setPill(periodPillKind(sheet.period, current));
      setToday(current?.today_local ?? null);
      setDefaultTime(saved?.show_time_on_pdf ?? true);
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

  // The alert is modal (the page behind it is inert): once it is gone focus returns to the Sign off button that started the act.
  const refused = refusal !== null;
  const wasRefused = useRef(false);
  useEffect(() => {
    if (refused) {
      wasRefused.current = true;
    } else if (wasRefused.current) {
      wasRefused.current = false;
      signButton.current?.focus();
    }
  }, [refused]);

  // After a sign-off the next act is sending: focus moves to the Send card once the dialog and the Sign off button are gone.
  const signedRevision = justSigned?.revisionNo ?? null;
  useEffect(() => {
    if (justSigned !== null) sendHeading.current?.focus();
  }, [justSigned, signedRevision]);

  /** Reads the period state and the send draft again (after a send, or after a refusal that shows the page is stale). */
  const refreshAround = useCallback(async () => {
    const state = await loadPeriodState(payrollDate);
    const draft = await readDraft(state, imported);
    setAround({ period: state, draft });
  }, [payrollDate, imported]);

  const errors: Partial<Record<FieldKey, string>> = {};
  for (const item of shown) errors[item.field] = item.message;

  function openSignoff() {
    setShown([]);
    setNotice(null);
    setDialogOpen(true);
  }

  function cancelSignoff() {
    if (busy) return;
    setDialogOpen(false);
    setShown([]);
  }

  async function submit() {
    if (review === null || around === null || submitting.current) return;
    const mode = reviewMode(around.period.finalization.revision);
    const blockers = submitBlockers(review.payload, mode, form);
    setNotice(null);
    if (blockers.length > 0) {
      setShown(blockers);
      return;
    }
    // One request at a time: a second click or Enter while one is in flight is ignored.
    submitting.current = true;
    setBusy(true);
    setShown([]);
    try {
      const result = await api<SignOffResponse>('POST', modeEndpoint(mode, payrollDate), buildSubmitBody(review, mode, form));
      setDialogOpen(false);
      setJustSigned({ status: result.status, revisionNo: result.revision?.revision_no ?? null });
      await refreshAround().catch(() => undefined);
    } catch (caught) {
      const failure = classifySubmitError(caught);
      if (failure.kind === 'stale') {
        setDialogOpen(false);
        setForm((current) => resetAfterStale(current));
        setNotice({ kind: 'stale', message: failure.message });
        await load();
      } else if (failure.kind === 'field') {
        // Stays in the dialog: the missing field is marked and takes focus.
        setShown([{ field: failure.field, message: failure.message }]);
      } else {
        // A refusal of the server: nothing was signed. The alert says so; the person's choices are kept.
        setDialogOpen(false);
        setRefusal(failure.message);
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
  if (phase.kind === 'failed' || review === null || around === null) {
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
  const finalization = around.period.finalization;
  const revision = finalization.revision;
  const mode = reviewMode(revision);
  const description = periodDescription(payload.period, payload.reporting_zone);
  const signoff = finalization.signoff;
  const signed: SignedLine | null =
    revision !== null && signoff !== null
      ? { name: signoff.signer_name, date: signedDate(signoff.signed_at, payload.reporting_zone), imageId: signoff.signature_attachment_id ?? null }
      : null;
  const canSign = !imported && justSigned === null;
  const sendState = sendCardState({
    signed: revision !== null,
    imported,
    current: around.draft?.current ?? true,
    copySentBefore: around.draft?.copy_sent_before != null,
  });
  const baseline =
    around.draft === null
      ? sendFormFromReview(payload.recipients, { time: defaultTime, ot: payload.show_ot_on_pdf })
      : sendFormFromDraft(around.draft);
  // The same chips under the title and in the Preview header; each copy names its elements by its own data attribute.
  const statusChips = (attr: string) =>
    imported ? (
      attr === 'data-status' ? (
        <ImportedBadge />
      ) : (
        <span className="badge badge-warn" {...{ [attr]: 'imported' }}>
          {IMPORTED_STATUS_TEXT}
        </span>
      )
    ) : (
      <ReviewBadges state={around.period} fallback="Draft" attr={attr} />
    );
  const pillWords = PERIOD_PILL_WORDS[pill];

  return (
    <div className="review-screen stack">
      <header className="review-head">
        <h1 id="review-title" tabIndex={-1} ref={headingRef}>
          Review and sign off
        </h1>
        <p className="muted review-desc" data-review-desc>
          Pay period <b>{description.start}</b>
          <span className="range-arrow" aria-hidden="true">
            {' '}
            {'→'}{' '}
          </span>
          <span className="sr-only"> to </span>
          <b>{description.end}</b> · payroll date <b>{description.payroll}</b> · due <b>{description.due}</b> ({description.zone})
        </p>
        <div className="review-chips" role="group" aria-label="Status" data-review-chips>
          {pill !== 'neutral' && <span className={`badge ${pill}`}>{pillWords}</span>}
          {statusChips('data-status')}
        </div>
      </header>

      {notice !== null && (
        <div className={notice.kind === 'stale' ? 'stale' : 'stale error-box'} role="alert" tabIndex={-1} ref={noticeRef} data-notice={notice.kind}>
          <p>{notice.message}</p>
        </div>
      )}

      <section className="card check-card" aria-label="Before you sign" data-mode={mode}>
        {justSigned !== null ? (
          <p className="notice-ok" role="status" data-result={justSigned.status}>
            {justSigned.status === 'replayed'
              ? 'This sign-off was already recorded. Nothing new was created. Send the PDF to payroll below.'
              : `Signed. Revision ${justSigned.revisionNo ?? ''} is recorded and the OT credits are posted. Send the PDF to payroll below.`}
          </p>
        ) : (
          <p data-intro>{imported ? 'This period is imported history. Nothing here is signed or sent.' : MODE_INTRO[mode]}</p>
        )}
        <a className="button-link back-link" href="#/timesheet" aria-label="Back to the timesheet">
          <span className="back-full">Back to the timesheet</span>
          <span className="back-short" aria-hidden="true">
            Back
          </span>
        </a>
      </section>

      {justSigned === null && review.grantee_changes.length > 0 && (
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

      <ReviewDays
        payload={payload}
        chips={statusChips('data-preview-status')}
        signed={signed}
        signLabel={SIGNOFF_LABEL[mode]}
        canSign={canSign}
        imported={imported}
        signButtonRef={signButton}
        onSignOff={openSignoff}
      />

      {!imported && (
        <SendCard
          payrollDate={payrollDate}
          revisionId={revision?.id ?? null}
          state={sendState}
          baseline={baseline}
          draft={around.draft}
          zone={payload.reporting_zone}
          headingRef={sendHeading}
          chips={revision === null ? <span className="badge">Sign off first</span> : <DeliveryBadge state={around.period} attr="data-send-chip" />}
          onChanged={refreshAround}
        />
      )}

      <p className="muted hint review-zone-note" data-zone-note>
        {zoneNote(payload.reporting_zone)}
      </p>

      {dialogOpen && (
        <SignoffDialog
          mode={mode}
          payload={payload}
          today={today ?? payload.period.payroll_date}
          form={form}
          errors={errors}
          busy={busy}
          opener={signButton.current}
          onChange={setForm}
          onCancel={cancelSignoff}
          onSubmit={() => void submit()}
        />
      )}
      {refusal !== null && (
        <AlertDialog
          title="Not signed off"
          messages={[refusal]}
          hint="Nothing was signed. Your choices are kept: open Sign off to try again."
          onClose={() => setRefusal(null)}
        />
      )}
    </div>
  );
}
