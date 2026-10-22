import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { api, type SendDraft, type SendResponse } from '../api.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { downloadRevisionPdf } from './DeliveryHistory.tsx';
import {
  buildSendRequest,
  copyReasonProblem,
  earlierCopyText,
  MAX_COPY_REASON,
  sameSendForm,
  type SendCardState,
  type SendForm,
  sendAttemptSignature,
  sendFailure,
  type SendProblem,
  sendProblems,
} from './deliveryModel.ts';
import { describeError } from './errors.ts';
import { SETTINGS_HASH } from './routeModel.ts';
import { useAttemptKey } from './useAttemptKey.ts';

/** The address of the PDF for the card's two switches: the unsigned preview before the sign-off, the revision's own PDF after it. */
export function pdfHref(input: { payrollDate: string; revisionId: string | null; time: boolean; ot: boolean; inline: boolean }): string {
  const rows = `time=${input.time ? 1 : 0}&ot=${input.ot ? 1 : 0}`;
  return input.revisionId === null
    ? `/api/timesheets/${input.payrollDate}/pdf-preview?${rows}`
    : `/api/revisions/${input.revisionId}/pdf?${rows}${input.inline ? '&disposition=inline' : ''}`;
}

type Notice = { tone: 'ok' | 'error'; text: string } | null;

/**
 * The Send card (U5-31), the last card of the Review page. Sending is its own act, after the sign-off: the envelope (To, Cc, Subject and the
 * message) and the two PDF row switches are the values of this send, filled from Settings and editable each time (F-3 b, F-4). "PDF
 * Preview" shows the PDF for the switches as they are now (a new tab; before the sign-off it is the unsigned preview), "Save PDF"
 * downloads it once signed, and "Send" records one send of the signed revision. Once a copy of the period counts as sent the button reads
 * "Send another copy..." and a confirmation asks for the reason first (B-A2); a 422 `reason_required` opens the same confirmation. One
 * request key serves one attempt, so a repeated request is a replay and never a second send. A 409 (an open or uncertain attempt, a
 * waiting job) is said in words and nothing is retried. The card sends nothing before the sign-off and is not shown for an imported
 * period.
 */
export function SendCard({
  payrollDate,
  revisionId,
  state,
  baseline,
  draft,
  chips,
  zone,
  headingRef,
  onChanged,
}: {
  payrollDate: string;
  /** The current revision when the period is signed; null before the sign-off. */
  revisionId: string | null;
  state: SendCardState;
  /** The defaults of this send: the send draft after the sign-off, the review payload and Settings before it. */
  baseline: SendForm;
  /** The revision's send draft (sender, whether a copy counts, the reason of a correction); null before the sign-off. */
  draft: SendDraft | null;
  chips: ReactNode;
  zone: string;
  headingRef: Ref<HTMLHeadingElement>;
  /** Called after a send, and after a refusal that shows the page is stale: the page reads the period state and the draft again. */
  onChanged: () => Promise<void>;
}) {
  const [form, setForm] = useState<SendForm>(baseline);
  const [dirty, setDirty] = useState(false);
  const [problems, setProblems] = useState<SendProblem[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const sendKey = useAttemptKey();
  const inFlight = useRef(false);
  const sendButton = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);

  // New defaults (the draft arrived after the sign-off, or Settings changed) replace the form only while the person has not edited it.
  // `baseline` is read through its serialized key: a new object with the same values must not reset anything.
  const baselineKey = JSON.stringify(baseline);
  const latest = useRef(baseline);
  latest.current = baseline;
  useEffect(() => {
    if (!dirty) setForm(latest.current);
  }, [baselineKey, dirty]);

  const signed = revisionId !== null;
  const copyBefore = draft?.copy_sent_before ?? null;
  const problem = (field: SendProblem['field']) => problems.find((item) => item.field === field)?.message;

  function edit(next: SendForm) {
    setForm(next);
    setDirty(!sameSendForm(next, baseline));
    setProblems([]);
    setNotice(null);
  }

  function resetToDefaults() {
    setForm(baseline);
    setDirty(false);
    setProblems([]);
    setNotice(null);
  }

  function focusField(field: SendProblem['field']) {
    document.getElementById(`send-field-${field}`)?.focus();
  }

  async function post(typed: string | null) {
    if (revisionId === null || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const body = buildSendRequest(form, sendKey.keyFor(sendAttemptSignature(revisionId, form, typed)), typed);
      const result = await api<SendResponse>('POST', `/api/revisions/${revisionId}/send`, body);
      sendKey.settle();
      setAsking(false);
      setReason('');
      setReasonError(null);
      setNotice({
        tone: 'ok',
        text:
          result.status === 'replayed'
            ? 'This send was already recorded. Nothing new was queued.'
            : `Send ${result.send.send_no} is queued for ${result.send.to.join(', ')}. Follow it in the status above or in History.`,
      });
      await onChanged();
      sendButton.current?.focus();
    } catch (caught) {
      const failure = sendFailure(caught);
      if (failure.kind === 'reason') {
        setReasonError(failure.message);
        setAsking(true);
      } else if (failure.kind === 'field') {
        setAsking(false);
        setProblems([{ field: failure.field, message: failure.message }]);
        queueMicrotask(() => focusField(failure.field));
      } else {
        setAsking(false);
        setNotice({ tone: 'error', text: failure.message });
        // The situation changed (another window, a runner, a newer revision): read it again, never retry.
        if (failure.kind === 'conflict') await onChanged().catch(() => undefined);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function press() {
    if (state.mode !== 'send' && state.mode !== 'another_copy') return;
    const found = sendProblems(form);
    setProblems(found);
    setNotice(null);
    const first = found[0];
    if (first !== undefined) {
      queueMicrotask(() => focusField(first.field));
      return;
    }
    if (state.mode === 'another_copy') {
      // For a correction revision the field starts with the correction reason; the person may edit it.
      if (reason.trim() === '' && draft?.correction_reason) setReason(draft.correction_reason);
      setReasonError(null);
      setAsking(true);
      return;
    }
    void post(null);
  }

  function confirmReason() {
    const found = copyReasonProblem(reason);
    if (found !== null) {
      setReasonError(found);
      return;
    }
    void post(reason.trim());
  }

  async function savePdf() {
    if (revisionId === null || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const name = await downloadRevisionPdf(revisionId, '/api', { time: form.time, ot: form.ot });
      setNotice({ tone: 'ok', text: `Downloaded ${name}.` });
    } catch (caught) {
      setNotice({ tone: 'error', text: describeError(caught) });
    } finally {
      setSaving(false);
    }
  }

  const disabled = state.mode === 'sign_first' || state.mode === 'locked';
  const hintId = 'send-hint';
  return (
    <section className="send-card" aria-labelledby="send-card-title" data-send-card data-send-mode={state.mode}>
      <div className="preview-bar">
        <h2 id="send-card-title" tabIndex={-1} ref={headingRef}>
          Send to payroll
        </h2>
        <div className="preview-chips" role="group" aria-label="Delivery status" data-send-status>
          {chips}
        </div>
      </div>

      <div className="send-body">
        <div className="send-envelope stack">
          <div className="send-row" data-envelope="from">
            <span className="send-label">From</span>
            <span className="mono send-from" data-envelope-from>
              {draft === null ? 'the sender set on this server' : (draft.sender ?? 'no sender is set on this server')}
            </span>
          </div>
          <div className="send-row">
            <label htmlFor="send-field-to" className="send-label">
              To
            </label>
            <div className="send-field">
              <input
                id="send-field-to"
                type="text"
                className="mono"
                autoComplete="off"
                value={form.to}
                aria-invalid={problem('to') !== undefined}
                aria-describedby={problem('to') === undefined ? undefined : 'send-error-to'}
                onChange={(event) => edit({ ...form, to: event.target.value })}
              />
              {problem('to') !== undefined && (
                <p className="error" id="send-error-to">
                  {problem('to')}
                </p>
              )}
            </div>
          </div>
          <div className="send-row">
            <label htmlFor="send-field-cc" className="send-label">
              Cc
            </label>
            <div className="send-field">
              <input
                id="send-field-cc"
                type="text"
                className="mono"
                autoComplete="off"
                value={form.cc}
                aria-invalid={problem('cc') !== undefined}
                aria-describedby={problem('cc') === undefined ? undefined : 'send-error-cc'}
                onChange={(event) => edit({ ...form, cc: event.target.value })}
              />
              {problem('cc') !== undefined && (
                <p className="error" id="send-error-cc">
                  {problem('cc')}
                </p>
              )}
            </div>
          </div>
          <div className="send-row">
            <label htmlFor="send-field-subject" className="send-label">
              Subject
            </label>
            <div className="send-field">
              <input
                id="send-field-subject"
                type="text"
                autoComplete="off"
                value={form.subject}
                aria-invalid={problem('subject') !== undefined}
                aria-describedby={problem('subject') === undefined ? undefined : 'send-error-subject'}
                onChange={(event) => edit({ ...form, subject: event.target.value })}
              />
              {problem('subject') !== undefined && (
                <p className="error" id="send-error-subject">
                  {problem('subject')}
                </p>
              )}
            </div>
          </div>
          <label htmlFor="send-field-body" className="sr-only">
            Message
          </label>
          <textarea
            id="send-field-body"
            className="send-message"
            rows={7}
            value={form.body}
            aria-invalid={problem('body') !== undefined}
            aria-describedby={problem('body') === undefined ? undefined : 'send-error-body'}
            onChange={(event) => edit({ ...form, body: event.target.value })}
          />
          {problem('body') !== undefined && (
            <p className="error" id="send-error-body">
              {problem('body')}
            </p>
          )}
        </div>

        <div className="send-side stack">
          <label className="inline switch">
            <input type="checkbox" role="switch" className="switch-input" checked={form.time} onChange={(event) => edit({ ...form, time: event.target.checked })} />
            Time rows on the PDF
          </label>
          <label className="inline switch">
            <input type="checkbox" role="switch" className="switch-input" checked={form.ot} onChange={(event) => edit({ ...form, ot: event.target.checked })} />
            OT rows on the PDF
          </label>
          <p className="muted hint">For this send. Defaults come from Settings; the signed timesheet does not change.</p>
          <button type="button" className="quiet send-reset" disabled={!dirty} onClick={resetToDefaults}>
            Reset to the Settings defaults
          </button>
          <a className="send-settings-link" href={SETTINGS_HASH}>
            Change the defaults in Settings
          </a>
        </div>

        <div className="send-actions">
          {notice !== null && (
            <p className={notice.tone === 'ok' ? 'notice-ok send-notice' : 'error send-notice'} role={notice.tone === 'ok' ? 'status' : 'alert'} data-send-notice={notice.tone}>
              {notice.text}
            </p>
          )}
          {state.hint !== null && (
            <p className="muted send-hint" id={hintId}>
              {state.hint}
            </p>
          )}
          <a
            className="button-link"
            href={pdfHref({ payrollDate, revisionId, time: form.time, ot: form.ot, inline: true })}
            target="_blank"
            rel="noopener"
            data-pdf-preview
          >
            PDF Preview
          </a>
          <button type="button" className="secondary" disabled={!signed || saving} onClick={() => void savePdf()} data-save-pdf>
            Save PDF
          </button>
          <button
            ref={sendButton}
            type="button"
            disabled={disabled || busy}
            aria-describedby={state.hint === null ? undefined : hintId}
            onClick={press}
            data-send
          >
            {state.label}
          </button>
        </div>
      </div>

      {asking && (
        <ConfirmDialog
          title="Send another copy?"
          message={`${copyBefore === null ? 'A copy of this period was already sent.' : earlierCopyText(copyBefore, zone)} No revision, sign-off or OT balance changes.`}
          confirmLabel="Send another copy"
          busy={busy}
          opener={sendButton.current}
          onConfirm={confirmReason}
          onCancel={() => {
            setAsking(false);
            setReasonError(null);
          }}
        >
          <label>
            Reason for sending another copy (required)
            <textarea
              id="send-field-reason"
              rows={3}
              value={reason}
              maxLength={MAX_COPY_REASON}
              aria-invalid={reasonError !== null}
              aria-describedby={reasonError === null ? 'send-hint-reason' : 'send-hint-reason send-error-reason'}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(null);
              }}
            />
          </label>
          <p className="muted hint" id="send-hint-reason">
            The reason is kept with this send in your history. It is not added to the email.
          </p>
          {reasonError !== null && (
            <p className="error" id="send-error-reason" role="alert">
              {reasonError}
            </p>
          )}
        </ConfirmDialog>
      )}
    </section>
  );
}
