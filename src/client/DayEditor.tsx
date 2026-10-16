import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type DayView, ownRequest, type PolicyVersion, type Requester, type Session } from './api.ts';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';
import { dayBanner, deleteFacts, editorChips, editorTitle } from './components/dayEditorModel.ts';
import { DayFieldsForm } from './components/DayFieldsForm.tsx';
import { DayFigures } from './components/DayFigures.tsx';
import { describeError, isStaleVersion } from './components/errors.ts';
import type { PeriodPillKind } from './components/periodBarModel.ts';
import { SessionDialog } from './components/SessionDialog.tsx';
import { expectedFinishText, inputZoneChoices, policyOn } from './components/sessionModel.ts';
import { SessionList } from './components/SessionList.tsx';
import { useBlockSizeProperty } from './components/useBlockSize.ts';
import { formatDuration } from '../domain/format.ts';

/**
 * The open session dialog and the button that opened it (Add session, Edit or "Confirm breaks"); focus returns there when the
 * dialog closes without a save. `confirm` is set for "Confirm breaks": the dialog then starts with the breaks to confirm.
 */
type Editing =
  | { kind: 'none' }
  | { kind: 'new'; opener: HTMLElement | null }
  | { kind: 'edit'; sessionId: string; opener: HTMLElement | null; confirm: boolean };

const LEAVE_KIND_TEXT = { vacation: 'vacation', sick: 'sick', ot: 'OT' } as const;

/** True while a modal dialog other than the editor itself is open (it owns focus and Escape). */
function otherModalOpen(editor: HTMLDialogElement): boolean {
  return [...document.querySelectorAll('dialog:modal')].some((open) => open !== editor);
}

/**
 * Day editor (WP5-UX-T04, owner decision E-3 a). From 1360px it is a non-modal panel in its own
 * column beside the sheet, so the sheet stays usable at its readable column width. Below that
 * (`modal`) it is modal and traps focus, so the page behind is inert and no focusable control can
 * be hidden by it (WCAG 2.4.11): a floating side panel from 768px, docked away from the edited
 * column (`dockSide`), a bottom sheet below (`bottomSheet`). All are one native `<dialog>`
 * named by its heading ("Day editor ..."): focus moves to the heading on open, Escape closes it
 * wherever focus is (unless a nested dialog takes Escape first) and so does Close; the caller
 * returns focus to the day's button.
 *
 * Order inside: the head (the accounting date, then chips for the period and the zones), the banner
 * of what the day still needs, the times (a card per session with its break table; Add session, Edit
 * and "Confirm breaks" open the session dialog, Delete the delete confirmation), category and leave,
 * then the server's figures. Every write carries the version the editor loaded and, for an old or
 * finalized period, a reason (one reason state, shared by the panel, the session dialog and the
 * delete confirmation); a stale version reloads the day and says so. In a view-only shared view or an
 * imported period (`readOnly`) the editor only shows the day: the reason, the add, edit and delete
 * controls and the day fields form are absent, not disabled.
 *
 * Nested dialogs (WP5-UX-B3-01): the session dialog (with its notice and confirmations) and the delete
 * confirmation are modal dialogs inside this one, one on top at a time. Each owns Escape and focus
 * while it is open, this editor ignores an Escape whose target lies in another dialog, and its switch
 * between modal and non-modal on crossing 1360px waits until no other modal dialog is open.
 */
export function DayEditor({
  workDate,
  displayZone,
  reportingZone,
  todayLocal,
  modal,
  bottomSheet,
  dockSide = 'right',
  refresh = 0,
  periodPill,
  onChanged,
  onClose,
  request = ownRequest,
  readOnly = false,
}: {
  workDate: string;
  displayZone: string;
  reportingZone: string;
  todayLocal: string | null;
  /** True below 1360px: a modal dialog with an inert page. False: the non-modal panel beside the sheet. */
  modal: boolean;
  /** True below 768px: the modal dialog is a bottom sheet. Otherwise a floating side panel. */
  bottomSheet: boolean;
  /** The edge the floating side panel docks to (away from the edited column). Unused by the panel beside the sheet and the bottom sheet. */
  dockSide?: 'left' | 'right';
  /** Raised by the page after it changed this day elsewhere (the label picker or a batch): the editor reloads. */
  refresh?: number;
  /** The pill of the shown period as the period bar draws it (it can say "in progress"); the day's own relation when absent. */
  periodPill?: PeriodPillKind;
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
  const head = useRef<HTMLElement>(null);
  // The sticky head is about 80px tall (more when its chips wrap); the panel's scroll padding follows it (WP5-UX-AX-01).
  useBlockSizeProperty(head, '--editor-head-size', dialog);
  const heading = useRef<HTMLHeadingElement>(null);
  const timesHeading = useRef<HTMLHeadingElement>(null);
  const [day, setDay] = useState<DayView | null>(null);
  const [policies, setPolicies] = useState<PolicyVersion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({ kind: 'none' });
  /** The id of the session whose delete confirmation is open, and the Delete button that opened it. */
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteOpener, setDeleteOpener] = useState<HTMLElement | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  /** Raised after a delete or a session save: focus moves to the Times heading once the page has settled. */
  const [focusTimes, setFocusTimes] = useState(0);
  /** Set when the session dialog closed without a save: focus returns to its opener once the dialog is gone. */
  const [returnFocus, setReturnFocus] = useState<{ target: HTMLElement | null } | null>(null);
  /** Remounts the forms after a reload, so they start from the reloaded day. */
  const [generation, setGeneration] = useState(0);
  const firstRefresh = useRef(refresh);

  // Opens the panel (non-modal) or the bottom sheet (modal) and moves focus to the heading. A switch
  // between the two while open (the window crossed 1360px) re-opens the same element in the other mode.
  // WP5-UX-B3-01: re-showing it while another modal dialog is open (a label review, the check-out
  // dialog) would stack the editor above that dialog and take its focus and its Escape. The switch then
  // waits until no other modal dialog is left (closed or removed), so the open dialog keeps both.
  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    const apply = () => {
      if (element.open) {
        if (element.matches(':modal') === modal) return;
        element.close();
      }
      if (modal) element.showModal();
      else element.show();
      heading.current?.focus();
    };
    if (!element.open || !otherModalOpen(element)) {
      apply();
      return;
    }
    const observer = new MutationObserver(() => {
      if (otherModalOpen(element)) return;
      observer.disconnect();
      apply();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    return () => observer.disconnect();
  }, [modal]);

  // A non-modal panel leaves the sheet focusable, so Escape closes it wherever focus is. A nested
  // modal dialog (a review, the check-out dialog) takes Escape first, and so does a control that
  // already used the key (an open label picker). A modal editor closes through its own handlers.
  useEffect(() => {
    if (modal) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (document.querySelector('dialog:modal') !== null) return;
      onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [modal, onClose]);

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

  // After the page has settled (the confirmation is gone and the list is redrawn) focus goes to the Times heading.
  useEffect(() => {
    if (focusTimes > 0) timesHeading.current?.focus();
  }, [focusTimes]);

  // The session dialog was cancelled or discarded: back to the button that opened it (the Times heading if it is gone).
  useEffect(() => {
    if (returnFocus === null) return;
    const target = returnFocus.target;
    if (target !== null && target.isConnected) target.focus();
    else timesHeading.current?.focus();
  }, [returnFocus]);

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

  function askDelete(session: Session, button: HTMLElement) {
    setNotice(null);
    setActionError(null);
    setDeleteOpener(button);
    setDeleting(session.id);
  }

  /** The delete request of today, sent after the confirmation: the loaded version and, for an old period, the reason. */
  async function remove(session: Session) {
    if (reasonMissing) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      const body: { expected_version: number; reason?: string } = { expected_version: session.version };
      if (reason.trim() !== '') body.reason = reason.trim();
      const response = await request<{ deleted: boolean; day: DayView }>('DELETE', `/sessions/${session.id}`, body);
      setDeleting(null);
      saved(response.day, 'Session deleted.');
      setFocusTimes((value) => value + 1);
    } catch (caught) {
      setDeleting(null);
      if (isStaleVersion(caught)) stale();
      else setActionError(describeError(caught));
    } finally {
      setDeleteBusy(false);
    }
  }

  /** Cancel or Discard in the session dialog: nothing was saved; focus goes back to the button that opened it. */
  function closeSessionDialog() {
    const opener = editing.kind === 'none' ? null : editing.opener;
    setEditing({ kind: 'none' });
    setReturnFocus({ target: opener });
  }

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Escape') return;
    // An Escape typed inside a dialog nested in this one (the session dialog, a confirmation) belongs to that dialog.
    if (event.target instanceof Element && event.target.closest('dialog') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }

  const editingSession =
    editing.kind === 'edit' ? day?.sessions.find((session) => session.id === editing.sessionId) : undefined;
  const deletingSession = deleting === null ? undefined : day?.sessions.find((session) => session.id === deleting);
  const banner = day === null ? null : dayBanner(day);
  const chips =
    day === null
      ? []
      : editorChips({
          relation: day.edit.period_relation,
          ...(periodPill === undefined ? {} : { pill: periodPill }),
          displayZone,
          reportingZone,
          readOnly,
        });

  return (
    <dialog
      ref={dialog}
      className={`day-panel ${bottomSheet ? 'day-panel-sheet' : 'day-panel-side'}`}
      aria-labelledby="day-editor-title"
      data-day-editor={workDate}
      data-side={modal && !bottomSheet ? dockSide : undefined}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {bottomSheet && <div className="sheet-handle" aria-hidden="true" />}
      <header ref={head} className="editor-head">
        <div className="editor-title">
          {/*
            The dialog is named "Day editor Mon 10/12/2026 (2026-10-12)": the role and the ISO date are hidden text around the date as
            the person reads it. The brackets are generated content (.iso-date), so the heading's text still ends with the ISO date.
          */}
          <h2 id="day-editor-title" ref={heading} tabIndex={-1}>
            <span className="sr-only">{readOnly ? 'Day ' : 'Day editor '}</span>
            {editorTitle(workDate)}{' '}
            <span className="sr-only iso-date">{workDate}</span>
          </h2>
          {chips.length > 0 && (
            <ul className="plain editor-chips" aria-label="About this day">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <span className={chip.pill === undefined ? 'chip' : `chip chip-${chip.pill}`} data-chip={chip.key}>
                    {chip.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="quiet icon-button" onClick={onClose} aria-label="Close">
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
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
              <div className="editor-section-head">
                <h3 id="day-editor-times" ref={timesHeading} tabIndex={-1}>
                  Times
                </h3>
                {!readOnly && (
                  <button type="button" className="secondary" onClick={(event) => startEditing({ kind: 'new', opener: event.currentTarget })}>
                    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add session
                  </button>
                )}
              </div>
              {day.sessions.length === 0 && <p className="muted">No session recorded for this day.</p>}
              <SessionList
                sessions={day.sessions}
                workDate={workDate}
                zone={displayZone}
                readOnly={readOnly}
                onEdit={(session, button) => startEditing({ kind: 'edit', sessionId: session.id, opener: button, confirm: false })}
                onConfirmBreaks={(session, button) => startEditing({ kind: 'edit', sessionId: session.id, opener: button, confirm: true })}
                onDelete={askDelete}
              />
            </section>

            {readOnly ? (
              <section className="editor-section stack" aria-label="Day fields">
                <h3>Category and leave</h3>
                <dl className="facts" data-day-fields="read-only">
                  <div>
                    <dt>Category</dt>
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

      {!readOnly && day !== null && (editing.kind === 'new' || editingSession !== undefined) && (
        <SessionDialog
          key={editingSession === undefined ? `new-${generation}` : `${editingSession.id}-${editingSession.version}-${generation}`}
          workDate={workDate}
          reportingZone={reportingZone}
          displayZone={displayZone}
          zones={zones}
          todayLocal={todayLocal}
          policy={policy}
          {...(editingSession === undefined ? {} : { session: editingSession, confirmBreaks: editing.kind === 'edit' && editing.confirm })}
          reason={reason}
          reasonRequired={reasonRequired}
          onReasonChange={setReason}
          onSaved={(next) => {
            saved(next, 'Session saved.');
            setFocusTimes((value) => value + 1);
          }}
          onStale={() => {
            stale();
            setFocusTimes((value) => value + 1);
          }}
          onClose={closeSessionDialog}
          request={request}
        />
      )}

      {!readOnly && deletingSession !== undefined && (
        <ConfirmDialog
          title="Delete this session?"
          message="The session and its breaks are deleted. Worked time and OT of the day are calculated again."
          facts={deleteFacts(deletingSession, workDate, displayZone)}
          confirmLabel="Delete session"
          tone="danger"
          confirmDisabled={reasonMissing}
          busy={deleteBusy}
          opener={deleteOpener}
          onConfirm={() => void remove(deletingSession)}
          onCancel={() => setDeleting(null)}
        >
          {reasonRequired && (
            <label className="editor-reason">
              Reason for editing an old or finalized period
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={500} required />
            </label>
          )}
        </ConfirmDialog>
      )}
    </dialog>
  );
}
