import { type SubmitEvent, useId, useState } from 'react';
import { ApiRequestError, type DayView, ownRequest, type PolicyVersion, type Requester, type Session, type SessionResponse } from '../api.ts';
import { BreaksEditor, newRowKey } from './BreaksEditor.tsx';
import { describeError, isStaleVersion } from './errors.ts';
import { LocalTimeField } from './LocalTimeField.tsx';
import {
  applyFold,
  applyGapReplacement,
  buildSessionRequest,
  changeZone,
  draftFromSession,
  draftGap,
  newSessionDraft,
  problemApplies,
  resolveStart,
  type SessionDraft,
  suggestedRows,
  type TimeProblem,
  timeProblemOf,
} from './sessionModel.ts';
import { TimeProblemPrompt } from './TimeProblemPrompt.tsx';

/**
 * Manual session form: an explicit input zone, a start and an end that each carry their own
 * date (so overnight work has an explicit end date), breaks, and a way to resolve a repeated
 * or missing local time. The body is exactly the server contract; the server resolves the UTC
 * instants and checks every rule.
 */
export function SessionForm({
  workDate,
  session,
  zones,
  policy,
  reason,
  reasonRequired,
  onSaved,
  onStale,
  onCancel,
  request = ownRequest,
}: {
  workDate: string;
  /** The session being edited; absent for a new one. */
  session?: Session;
  /** Zones offered for the input zone (any IANA zone can be typed); the first is the default (the current display zone, R-07). */
  zones: readonly string[];
  policy: PolicyVersion | undefined;
  reason: string;
  reasonRequired: boolean;
  onSaved: (day: DayView) => void;
  onStale: () => void;
  onCancel: () => void;
  /** The route set the write goes through: the caller's own by default, a share's when editing for an owner. */
  request?: Requester;
}) {
  const formId = useId();
  const [draft, setDraft] = useState<SessionDraft>(() =>
    session === undefined ? newSessionDraft(workDate, zones[0] ?? 'UTC') : draftFromSession(session),
  );
  const [problem, setProblem] = useState<TimeProblem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const gap = draftGap(draft);
  const reasonMissing = reasonRequired && reason.trim() === '';
  const overnight = draft.end.date !== '' && draft.start.date !== '' && draft.end.date > draft.start.date;

  function change(next: SessionDraft) {
    setDraft(next);
    if (problem !== null && !problemApplies(next, problem)) setProblem(null);
  }

  function suggest() {
    setError(null);
    if (policy === undefined) {
      setSuggestNote('No work policy is effective on this date, so no breaks can be suggested.');
      return;
    }
    const start = resolveStart(draft);
    if (!start.ok) {
      setProblem(start.problem);
      setSuggestNote(start.problem === null ? start.message : null);
      return;
    }
    setProblem(null);
    setSuggestNote('Suggested from this session start. They are not confirmed until you confirm them.');
    setDraft({ ...draft, breaks: suggestedRows(start.utc, draft.zone, policy.breaks, () => newRowKey()), mode: 'pending' });
  }

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (gap !== null || reasonMissing) return;
    setBusy(true);
    setError(null);
    try {
      const body = buildSessionRequest(draft, { expectedVersion: session?.version, reason });
      const response =
        session === undefined
          ? await request<SessionResponse>('POST', `/days/${workDate}/sessions`, body)
          : await request<SessionResponse>('PUT', `/sessions/${session.id}`, body);
      onSaved(response.day);
    } catch (caught) {
      if (isStaleVersion(caught)) {
        onStale();
      } else {
        const found = caught instanceof ApiRequestError ? timeProblemOf(caught.code, caught.details) : null;
        if (found !== null && problemApplies(draft, found)) setProblem(found);
        else setError(describeError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="editor-form stack" onSubmit={save} aria-label={session === undefined ? 'New session' : 'Edit session'}>
      <h3>{session === undefined ? 'New session' : 'Edit session'}</h3>
      <label>
        Input zone
        <input
          type="text"
          list={`${formId}-zones`}
          value={draft.zone}
          onChange={(event) => {
            // The typed wall times are read again in the new zone; an earlier question named the old one.
            setProblem(null);
            setDraft(changeZone(draft, event.target.value));
          }}
          spellCheck={false}
          required
        />
        <span className="muted hint">
          The IANA zone the times below are typed in. It is saved with the session and never regroups the day.
        </span>
      </label>
      <datalist id={`${formId}-zones`}>
        {zones.map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>
      <div className="time-pair">
        <LocalTimeField label="Start" field={draft.start} onChange={(start) => change({ ...draft, start })} />
        <LocalTimeField label="End" field={draft.end} onChange={(end) => change({ ...draft, end })} />
      </div>
      {overnight && (
        <p className="muted hint" data-overnight>
          Overnight: this session ends on {draft.end.date}. It stays on accounting date {workDate}.
        </p>
      )}
      {problem !== null && (
        <TimeProblemPrompt
          problem={problem}
          draft={draft}
          onFold={(fold) => change(applyFold(draft, problem, fold))}
          onGap={() => {
            change(applyGapReplacement(draft, problem));
            setProblem(null);
          }}
        />
      )}
      <BreaksEditor
        idPrefix={formId}
        defaultDate={draft.start.date}
        rows={draft.breaks}
        mode={draft.mode}
        suggestNote={suggestNote}
        onChange={(breaks, mode) => change({ ...draft, breaks, mode })}
        onSuggest={suggest}
      />
      {error !== null && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {reasonMissing && <p className="muted hint">Enter a reason for this old period above to save.</p>}
      {gap !== null && <p className="muted hint">{gap}</p>}
      <div className="button-row">
        <button type="submit" disabled={busy || gap !== null || reasonMissing}>
          {session === undefined ? 'Save session' : 'Save changes'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
