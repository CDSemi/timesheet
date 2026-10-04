import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, type DayView, type PolicyVersion, type Session } from './api.ts';
import { DayFieldsForm } from './components/DayFieldsForm.tsx';
import { DayFigures } from './components/DayFigures.tsx';
import { describeError, isStaleVersion } from './components/errors.ts';
import { sessionText } from './components/format.ts';
import { expectedFinishText, inputZoneChoices, policyOn } from './components/sessionModel.ts';
import { SessionForm } from './components/SessionForm.tsx';
import { WEEKDAYS } from './components/dayModel.ts';
import { isoWeekday } from '../domain/dates.ts';

type Editing = { kind: 'none' } | { kind: 'new' } | { kind: 'edit'; sessionId: string };

/**
 * Day editor: actual sessions with an explicit input zone and end date, breaks, category,
 * partial leave with its kind, WFH and the server's figures. It is a native modal dialog,
 * like the batch dialog. Every write carries the version the editor loaded and, for an old or
 * finalized period, a reason; a stale version reloads the day and says so.
 */
export function DayEditor({
  workDate,
  displayZone,
  reportingZone,
  todayLocal,
  onChanged,
  onClose,
}: {
  workDate: string;
  displayZone: string;
  reportingZone: string;
  todayLocal: string | null;
  /** Called after every successful write so the period behind the dialog can refresh. */
  onChanged: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [day, setDay] = useState<DayView | null>(null);
  const [policies, setPolicies] = useState<PolicyVersion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({ kind: 'none' });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  /** Remounts the forms after a reload, so they start from the reloaded day. */
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (element !== null && !element.open) element.showModal();
  }, []);

  const load = useCallback(async () => {
    try {
      const [loaded, policyList] = await Promise.all([
        api<DayView>('GET', `/api/days/${workDate}`),
        api<{ policies: PolicyVersion[] }>('GET', '/api/policies'),
      ]);
      setDay(loaded);
      setPolicies(policyList.policies);
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }, [workDate]);

  useEffect(() => {
    void load();
  }, [load]);

  // R-07: a new session is typed in the current display zone unless the user picks another.
  const zones = useMemo(() => inputZoneChoices(displayZone, reportingZone), [displayZone, reportingZone]);
  const policy = policyOn(policies, workDate);
  const reasonRequired = day?.edit.reason_required ?? false;

  function saved(next: DayView, text: string) {
    setDay(next);
    setEditing({ kind: 'none' });
    setStaleNotice(false);
    setActionError(null);
    setNotice(text);
    onChanged();
  }

  function startEditing(next: Editing) {
    setNotice(null);
    setActionError(null);
    setEditing(next);
  }

  function stale() {
    setStaleNotice(true);
    setNotice(null);
    setEditing({ kind: 'none' });
  }

  async function reload() {
    setStaleNotice(false);
    setActionError(null);
    setNotice(null);
    await load();
    setGeneration((value) => value + 1);
    onChanged();
  }

  async function remove(session: Session) {
    setActionError(null);
    try {
      const body: { expected_version: number; reason?: string } = { expected_version: session.version };
      if (reason.trim() !== '') body.reason = reason.trim();
      const response = await api<{ deleted: boolean; day: DayView }>('DELETE', `/api/sessions/${session.id}`, body);
      setDeleting(null);
      saved(response.day, 'Session deleted.');
    } catch (caught) {
      setDeleting(null);
      if (isStaleVersion(caught)) stale();
      else setActionError(describeError(caught));
    }
  }

  const weekday = WEEKDAYS[isoWeekday(workDate) - 1] ?? '';
  const editingSession =
    editing.kind === 'edit' ? day?.sessions.find((session) => session.id === editing.sessionId) : undefined;

  return (
    <dialog ref={dialog} className="dialog dialog-wide" aria-labelledby="day-editor-title" onClose={onClose}>
      <div className="stack">
        <header className="editor-head">
          <h2 id="day-editor-title">
            Day editor <span className="mono">{`${weekday} ${workDate}`}</span>
          </h2>
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </header>

        {loadError !== null && (
          <p className="error" role="alert">
            {loadError}
          </p>
        )}
        {day === null && loadError === null && <p className="muted">Loading the day...</p>}

        {day !== null && (
          <>
            <p className="muted hint">
              Accounting date {workDate} in the reporting zone {reportingZone}. Times below are typed in an input zone you choose;
              they are shown in {displayZone} elsewhere. Period: {day.edit.period_relation}.
            </p>

            {reasonRequired && (
              <label>
                Reason for editing an old or finalized period
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={500} required />
              </label>
            )}

            {staleNotice && (
              <div className="stale" role="alert">
                <p>This day changed since it was loaded. Nothing was saved. Reload the day to see the latest data, then repeat your edit.</p>
                <button type="button" onClick={() => void reload()}>
                  Reload day
                </button>
              </div>
            )}
            {notice !== null && (
              <p className="notice-ok" role="status">
                {notice}
              </p>
            )}
            {actionError !== null && (
              <p className="error" role="alert">
                {actionError}
              </p>
            )}

            <DayFigures day={day} todayLocal={todayLocal} expectedFinish={expectedFinishText(day.sessions, policy, displayZone)} />

            <section className="stack" aria-label="Sessions">
              <h3>Sessions</h3>
              {day.sessions.length === 0 && <p className="muted">No session recorded for this day.</p>}
              <ul className="plain session-list">
                {day.sessions.map((session) => (
                  <li key={session.id} className="session-item" data-session={session.id}>
                    <span className="mono">{sessionText(session, workDate, displayZone)}</span>
                    <span className="muted hint">
                      {session.source} session, entered in {session.input_zone}
                      {session.end_utc === null ? '' : `, ${session.breaks.length} break(s) recorded`}
                    </span>
                    <span className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => startEditing({ kind: 'edit', sessionId: session.id })}
                        aria-label={`Edit session ${session.id}`}
                      >
                        Edit
                      </button>
                      {deleting === session.id ? (
                        <button type="button" onClick={() => void remove(session)}>
                          Confirm delete
                        </button>
                      ) : (
                        <button type="button" className="secondary" onClick={() => setDeleting(session.id)} aria-label={`Delete session ${session.id}`}>
                          Delete
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {editing.kind === 'none' && (
                <div className="button-row">
                  <button type="button" onClick={() => startEditing({ kind: 'new' })}>
                    Add session
                  </button>
                </div>
              )}
              {editing.kind === 'new' && (
                <SessionForm
                  key={`new-${generation}`}
                  workDate={workDate}
                  zones={zones}
                  policy={policy}
                  reason={reason}
                  reasonRequired={reasonRequired}
                  onSaved={(next) => saved(next, 'Session saved.')}
                  onStale={stale}
                  onCancel={() => setEditing({ kind: 'none' })}
                />
              )}
              {editingSession !== undefined && (
                <SessionForm
                  key={`${editingSession.id}-${editingSession.version}-${generation}`}
                  workDate={workDate}
                  session={editingSession}
                  zones={zones}
                  policy={policy}
                  reason={reason}
                  reasonRequired={reasonRequired}
                  onSaved={(next) => saved(next, 'Session saved.')}
                  onStale={stale}
                  onCancel={() => setEditing({ kind: 'none' })}
                />
              )}
            </section>

            <DayFieldsForm
              key={`fields-${generation}`}
              day={day}
              reason={reason}
              reasonRequired={reasonRequired}
              onSaved={(next) => saved(next, 'Day fields saved.')}
              onStale={stale}
            />
          </>
        )}
      </div>
    </dialog>
  );
}
