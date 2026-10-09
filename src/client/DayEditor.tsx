import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type DayView, ownRequest, type PolicyVersion, type Requester, type Session, type SessionResponse } from './api.ts';
import { dayBanner, type QuickBreaks, quickBreaksOf, quickBreaksRequest } from './components/dayEditorModel.ts';
import { DayFieldsForm } from './components/DayFieldsForm.tsx';
import { DayFigures } from './components/DayFigures.tsx';
import { describeError, isStaleVersion } from './components/errors.ts';
import { sessionText } from './components/format.ts';
import { expectedFinishText, inputZoneChoices, policyOn } from './components/sessionModel.ts';
import { SessionForm } from './components/SessionForm.tsx';
import { WEEKDAYS } from './components/dayModel.ts';
import { formatDuration } from '../domain/format.ts';
import { isoWeekday } from '../domain/dates.ts';

type Editing = { kind: 'none' } | { kind: 'new' } | { kind: 'edit'; sessionId: string };

const LEAVE_KIND_TEXT = { vacation: 'vacation', sick: 'sick', ot: 'OT' } as const;

/**
 * Day editor (WP5-UX-T04, owner decision E-3 a). On a desktop it is a non-modal side panel beside
 * the sheet, so the sheet stays usable; on a phone (`modal`) it is a modal bottom sheet that traps
 * focus. Both are one native `<dialog>` named by its heading ("Day editor ..."): focus moves to the
 * heading on open, Escape and Close end it, and the caller returns focus to the day's button.
 *
 * Order inside: the banner of what the day still needs, the times (sessions and breaks, with a
 * one-tap confirmation of suggested or listed breaks), label and leave, then the server's figures.
 * Every write carries the version the editor loaded and, for an old or finalized period, a reason;
 * a stale version reloads the day and says so. In a view-only shared view or an imported period
 * (`readOnly`) the editor only shows the day: the reason, the add, edit and delete controls and the
 * day fields form are absent, not disabled.
 */
export function DayEditor({
  workDate,
  displayZone,
  reportingZone,
  todayLocal,
  modal,
  refresh = 0,
  onChanged,
  onClose,
  request = ownRequest,
  readOnly = false,
}: {
  workDate: string;
  displayZone: string;
  reportingZone: string;
  todayLocal: string | null;
  /** True below 768px: a modal bottom sheet. False: the non-modal side panel. */
  modal: boolean;
  /** Raised by the page after it changed this day elsewhere (the label picker or a batch): the editor reloads. */
  refresh?: number;
  /** Called after every successful write so the period behind the editor can refresh. */
  onChanged: () => void;
  /** Ends the editor; the caller unmounts it and returns focus to the day's button. */
  onClose: () => void;
  /** The route set every read and write goes through: the caller's own by default, a share's for an owner. */
  request?: Requester;
  /** True for a share without edit rights or an imported period: nothing in the editor can change the day. */
  readOnly?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const timesHeading = useRef<HTMLHeadingElement>(null);
  const [day, setDay] = useState<DayView | null>(null);
  const [policies, setPolicies] = useState<PolicyVersion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({ kind: 'none' });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quickBusy, setQuickBusy] = useState(false);
  /** Remounts the forms after a reload, so they start from the reloaded day. */
  const [generation, setGeneration] = useState(0);
  const firstRefresh = useRef(refresh);

  // Opens the panel (non-modal) or the bottom sheet (modal) and moves focus to the heading. A switch
  // between the two while open (the window crossed 768px) re-opens the same element in the other mode.
  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (element.open) {
      if (element.matches(':modal') === modal) return;
      element.close();
    }
    if (modal) element.showModal();
    else element.show();
    heading.current?.focus();
  }, [modal]);

  const load = useCallback(async () => {
    try {
      const [loaded, policyList] = await Promise.all([
        request<DayView>('GET', `/days/${workDate}`),
        request<{ policies: PolicyVersion[] }>('GET', '/policies'),
      ]);
      setDay(loaded);
      setPolicies(policyList.policies);
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }, [workDate, request]);

  useEffect(() => {
    void load();
  }, [load]);

  // The page changed this day behind the editor: read it again and restart the forms from it.
  useEffect(() => {
    if (refresh === firstRefresh.current) return;
    firstRefresh.current = refresh;
    void load().then(() => setGeneration((value) => value + 1));
  }, [refresh, load]);

  // R-07: a new session is typed in the current display zone unless the user picks another.
  const zones = useMemo(() => inputZoneChoices(displayZone, reportingZone), [displayZone, reportingZone]);
  const policy = policyOn(policies, workDate);
  const reasonRequired = day?.edit.reason_required ?? false;
  const reasonMissing = reasonRequired && reason.trim() === '';

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
      const response = await request<{ deleted: boolean; day: DayView }>('DELETE', `/sessions/${session.id}`, body);
      setDeleting(null);
      saved(response.day, 'Session deleted.');
    } catch (caught) {
      setDeleting(null);
      if (isStaleVersion(caught)) stale();
      else setActionError(describeError(caught));
    }
  }

  /** The one-tap break confirmation: the same session update the form sends, with the loaded version. */
  async function confirmQuick(session: Session, quick: QuickBreaks, choice: 'confirm' | 'none') {
    if (reasonMissing) return;
    setQuickBusy(true);
    setActionError(null);
    try {
      const response = await request<SessionResponse>('PUT', `/sessions/${session.id}`, quickBreaksRequest(session, quick, choice, reason));
      saved(response.day, choice === 'confirm' ? 'Breaks confirmed.' : 'Confirmed: no breaks taken.');
      timesHeading.current?.focus();
    } catch (caught) {
      if (isStaleVersion(caught)) stale();
      else setActionError(describeError(caught));
    } finally {
      setQuickBusy(false);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }

  const weekday = WEEKDAYS[isoWeekday(workDate) - 1] ?? '';
  const editingSession =
    editing.kind === 'edit' ? day?.sessions.find((session) => session.id === editing.sessionId) : undefined;
  const banner = day === null ? null : dayBanner(day);

  return (
    <dialog
      ref={dialog}
      className={`day-panel ${modal ? 'day-panel-sheet' : 'day-panel-side'}`}
      aria-labelledby="day-editor-title"
      data-day-editor={workDate}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {modal && <div className="sheet-handle" aria-hidden="true" />}
      <header className="editor-head">
        <div className="editor-title">
          <h2 id="day-editor-title" ref={heading} tabIndex={-1}>
            {readOnly ? 'Day' : 'Day editor'} <span className="mono">{`${weekday} ${workDate}`}</span>
          </h2>
          {day !== null && (
            <p className="muted hint">
              {readOnly
                ? `Accounting date ${workDate} in the reporting zone ${reportingZone}. Times are shown in ${displayZone}. Period: ${day.edit.period_relation}.`
                : `Accounting date ${workDate} in the reporting zone ${reportingZone}. Times below are typed in an input zone you choose; they are shown in ${displayZone} elsewhere. Period: ${day.edit.period_relation}.`}
            </p>
          )}
        </div>
        <button type="button" className="quiet" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="editor-body stack">
        {loadError !== null && (
          <p className="error" role="alert">
            {loadError}
          </p>
        )}
        {day === null && loadError === null && <p className="muted">Loading the day...</p>}

        {day !== null && (
          <>
            {banner !== null && (
              <p className={`editor-banner banner-${banner.tone}`} data-banner={banner.tone}>
                <span className={`shape ${banner.tone === 'error' ? 'shape-triangle' : 'shape-diamond'}`} aria-hidden="true" />
                <span>{banner.text}</span>
              </p>
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

            {reasonRequired && !readOnly && (
              <label className="editor-reason">
                Reason for editing an old or finalized period
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={500} required />
              </label>
            )}

            <section className="editor-section stack" aria-labelledby="day-editor-times">
              <h3 id="day-editor-times" ref={timesHeading} tabIndex={-1}>
                Times <span className="muted hint">shown in {displayZone}</span>
              </h3>
              {day.sessions.length === 0 && <p className="muted">No session recorded for this day.</p>}
              <ul className="plain session-list">
                {day.sessions.map((session) => {
                  const quick = readOnly || editing.kind !== 'none' ? null : quickBreaksOf(session, policy, displayZone);
                  const text = sessionText(session, workDate, displayZone);
                  return (
                    <li key={session.id} className="session-item" data-session={session.id}>
                      <div className="session-line">
                        <span className="mono session-time">{text}</span>
                        {!readOnly && (
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
                        )}
                      </div>
                      <span className="muted hint">
                        {session.source} session, entered in {session.input_zone}
                        {session.end_utc === null ? '' : `, ${session.breaks.length} break(s) recorded`}
                      </span>
                      {quick !== null && (
                        <div className="quick-breaks" role="group" aria-label={`Breaks of the session ${text}`} data-quick-breaks={quick.kind}>
                          {quick.chips.length > 0 && (
                            <ul className="plain break-chips" aria-label={quick.kind === 'suggested' ? 'Suggested breaks' : 'Listed breaks'}>
                              {quick.chips.map((chip, index) => (
                                <li key={`${index}-${chip}`} className="mono break-chip">
                                  {chip}
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="muted hint">
                            {quick.kind === 'suggested'
                              ? 'Suggested from the session start. Nothing is saved until you confirm.'
                              : quick.kind === 'listed'
                                ? 'Listed with the session but not confirmed yet.'
                                : 'No suggested break fits this session. Edit it to list the breaks you took.'}
                          </p>
                          <div className="quick-actions">
                            {quick.kind !== 'none' && (
                              <button type="button" disabled={quickBusy || reasonMissing} onClick={() => void confirmQuick(session, quick, 'confirm')}>
                                {quick.kind === 'suggested' ? 'Confirm suggested breaks' : 'Confirm breaks as listed'}
                              </button>
                            )}
                            <button type="button" className="secondary" disabled={quickBusy || reasonMissing} onClick={() => void confirmQuick(session, quick, 'none')}>
                              No breaks taken
                            </button>
                          </div>
                          {reasonMissing && <p className="muted hint">Enter a reason for this old period above to confirm.</p>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!readOnly && editing.kind === 'none' && (
                <div className="button-row">
                  <button type="button" className="secondary" onClick={() => startEditing({ kind: 'new' })}>
                    Add session
                  </button>
                </div>
              )}
              {!readOnly && editing.kind === 'new' && (
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
                  request={request}
                />
              )}
              {!readOnly && editingSession !== undefined && (
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
                  request={request}
                />
              )}
            </section>

            {readOnly ? (
              <section className="editor-section stack" aria-label="Day fields">
                <h3>Label and leave</h3>
                <dl className="facts" data-day-fields="read-only">
                  <div>
                    <dt>Label</dt>
                    <dd>{day.category ?? 'none'}</dd>
                  </div>
                  <div>
                    <dt>Partial leave</dt>
                    <dd>
                      {day.leave_minutes === 0
                        ? 'none'
                        : `${formatDuration(day.leave_minutes)}${day.leave_kind === null ? '' : ` (${LEAVE_KIND_TEXT[day.leave_kind]})`}`}
                    </dd>
                  </div>
                  <div>
                    <dt>Worked from home</dt>
                    <dd>{day.wfh ? 'yes' : 'no'}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{day.entry?.notes === undefined || day.entry.notes === '' ? 'none' : day.entry.notes}</dd>
                  </div>
                </dl>
              </section>
            ) : (
              <DayFieldsForm
                key={`fields-${generation}`}
                day={day}
                reason={reason}
                reasonRequired={reasonRequired}
                onSaved={(next) => saved(next, 'Day fields saved.')}
                onStale={stale}
                request={request}
              />
            )}

            <DayFigures day={day} todayLocal={todayLocal} expectedFinish={expectedFinishText(day.sessions, policy, displayZone)} />
          </>
        )}
      </div>
    </dialog>
  );
}
