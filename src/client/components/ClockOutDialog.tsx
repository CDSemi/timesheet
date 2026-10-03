import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { api, ApiRequestError, type PolicyVersion, type Session } from '../api.ts';
import { BreaksEditor, newRowKey } from './BreaksEditor.tsx';
import { describeError, isStaleVersion } from './errors.ts';
import { instantText } from './format.ts';
import {
  buildClockOutRequest,
  draftFromSession,
  breaksGap,
  policyOn,
  resolveStart,
  type SessionDraft,
  suggestedRows,
} from './sessionModel.ts';

/**
 * Clock out with break confirmation (R-01, R-02). The running session's version goes with the
 * request, so a session changed elsewhere answers 409 stale_version instead of being overwritten.
 * Suggested breaks shift with the arrival; unconfirmed breaks keep the day pending OT. The server
 * ends the session at its own current second.
 */
export function ClockOutDialog({
  session,
  displayZone,
  onDone,
  onStale,
  onClose,
}: {
  session: Session;
  displayZone: string;
  onDone: () => void;
  /** Called after a stale-version answer when the user chooses to reload. */
  onStale: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<SessionDraft>(() => draftFromSession(session));
  const [policies, setPolicies] = useState<PolicyVersion[] | null>(null);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [reasonNeeded, setReasonNeeded] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (element !== null && !element.open) element.showModal();
    api<{ policies: PolicyVersion[] }>('GET', '/api/policies')
      .then((response) => setPolicies(response.policies))
      .catch(() => setPolicies([]));
  }, []);

  const policy = policies === null ? undefined : policyOn(policies, session.work_date);
  const gap = breaksGap(draft);
  const submitLabel =
    draft.mode === 'pending'
      ? 'Clock out, breaks unconfirmed'
      : draft.mode === 'none'
        ? 'Clock out, no breaks taken'
        : 'Clock out with these breaks';

  function suggest() {
    setError(null);
    if (policy === undefined) {
      setSuggestNote('No work policy is effective on this date, so no breaks can be suggested.');
      return;
    }
    const start = resolveStart(draft);
    if (!start.ok) {
      setSuggestNote(start.message);
      return;
    }
    setSuggestNote('Suggested from your arrival. A break that ends later than the Clock out time is refused.');
    setDraft({ ...draft, breaks: suggestedRows(start.utc, draft.zone, policy.breaks, () => newRowKey()), mode: 'pending' });
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (gap !== null) return;
    setBusy(true);
    setError(null);
    try {
      await api('POST', '/api/clock/out', buildClockOutRequest(draft, session.version, reason));
      onDone();
    } catch (caught) {
      if (isStaleVersion(caught)) setStale(true);
      else {
        if (caught instanceof ApiRequestError && caught.code === 'reason_required') setReasonNeeded(true);
        setError(describeError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} className="dialog dialog-wide" aria-labelledby="clock-out-title" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <h2 id="clock-out-title">Clock out</h2>
        <p>
          Running since <span className="mono">{instantText(session.start_utc, displayZone)}</span> ({displayZone}), accounting
          date <span className="mono">{session.work_date}</span>, entered in {session.input_zone}.
        </p>
        <BreaksEditor
          idPrefix="clock-out"
          defaultDate={draft.start.date}
          rows={draft.breaks}
          mode={draft.mode}
          suggestNote={suggestNote}
          onChange={(breaks, mode) => setDraft({ ...draft, breaks, mode })}
          onSuggest={suggest}
        />
        {reasonNeeded && (
          <label>
            Reason for editing an old or finalized period
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={500} required />
          </label>
        )}
        {stale && (
          <div className="stale" role="alert">
            <p>This session changed since it was loaded. Nothing was saved. Reload to review the latest session, then clock out again.</p>
            <button type="button" onClick={onStale}>
              Reload
            </button>
          </div>
        )}
        {error !== null && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {gap !== null && <p className="muted hint">{gap}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>
            Cancel
          </button>
          <button type="submit" disabled={busy || stale || gap !== null}>
            {submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
