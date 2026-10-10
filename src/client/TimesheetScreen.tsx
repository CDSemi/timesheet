import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { addDays } from '../domain/dates.ts';
import {
  api,
  ApiRequestError,
  type CurrentPeriods,
  type DayBatchEntry,
  type DayBatchPreview,
  type DayBatchResult,
  type DayCategory,
  ownRequest,
  type Period,
  type Requester,
  type Session,
  type TimesheetView,
  type User,
} from './api.ts';
import { BatchBar } from './components/BatchBar.tsx';
import { BatchDialog } from './components/BatchDialog.tsx';
import { ClockOutDialog } from './components/ClockOutDialog.tsx';
import { ClockPanel } from './components/ClockPanel.tsx';
import { batchEntries, staleDates, staleReloadMessage } from './components/dayModel.ts';
import { describeError } from './components/errors.ts';
import { displayZone } from './components/format.ts';
import { currentLabelChoice, type LabelChoice, labelEntry, labelPreviewOutcome } from './components/labelPickerModel.ts';
import { OpenDay } from './components/OpenDay.tsx';
import { PeriodBar } from './components/PeriodBar.tsx';
import { runningSessionOf } from './components/periodBarModel.ts';
import { usePeriodState } from './components/ReviewStatus.tsx';
import { TimesheetSheet } from './components/TimesheetSheet.tsx';
import { DayEditor } from './DayEditor.tsx';

/** The documented layout breakpoint: the 7-column sheet from 768px up, one table per week below it. */
const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * From this width the day editor is a non-modal panel in its own column beside the sheet. Below it
 * the editor is modal (a side panel from 768px, a bottom sheet below that), so it never covers a
 * control that can still take focus.
 */
const WIDE_QUERY = '(min-width: 1200px)';

/** True while a media query matches; the layouts below are chosen with it, never both at once. */
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
  );
}

/**
 * Moves focus back to a day's own button (found by the day's `data-day`, never by its accessible
 * name) after the day editor closed; when that day is not on the sheet (opened through "Open a day"),
 * to what opened it.
 */
function focusDay(workDate: string, opener: Element | null) {
  const button = document.querySelector<HTMLElement>(`[data-day="${workDate}"] [data-day-button]`);
  if (button !== null) button.focus();
  else if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
}

/** Moves focus back to an element after a dialog closed, when it is still on the page and enabled. */
function focusIfAvailable(element: HTMLElement | null) {
  if (element !== null && element.isConnected && !element.matches(':disabled')) element.focus();
}

/** Moves focus back to a day's label picker after its review dialog closed. */
function focusLabelPicker(workDate: string) {
  document.querySelector<HTMLElement>(`[data-label-picker="${workDate}"] button`)?.focus();
}

/** What the open batch review dialog commits: the batch selection, or the one entry of an in-cell label pick. */
type PreviewSource = { kind: 'batch' } | { kind: 'label'; entry: DayBatchEntry };

/** Finds the running session in the shown period, else in the current and in-progress periods. */
async function findRunningSession(shown: TimesheetView | null): Promise<Session | undefined> {
  const inShown = shown === null ? undefined : runningSessionOf(shown);
  if (inShown !== undefined) return inShown;
  const known = await api<CurrentPeriods>('GET', '/api/periods/current');
  const payrollDates = [...new Set([known.current.payroll_date, known.in_progress.payroll_date])];
  for (const date of payrollDates) {
    if (date === shown?.period.payroll_date) continue;
    const found = runningSessionOf(await api<TimesheetView>('GET', `/api/timesheets/${date}`));
    if (found !== undefined) return found;
  }
  return undefined;
}

/**
 * Another person's timesheets, opened through a share (FR-17). Every read and write goes through
 * `request` (below `/api/shared/:ownerId`). Clock in/out, the review and the submission status are
 * the owner's own: they are absent here, and the batch and day edit controls are absent without an
 * edit share (never merely disabled).
 */
export interface SharedMode {
  ownerName: string;
  canEdit: boolean;
  request: Requester;
}

export function TimesheetScreen({ user, shared }: { user: User; shared?: SharedMode }) {
  const own = shared === undefined;
  const request: Requester = shared?.request ?? ownRequest;
  const canEdit = shared === undefined || shared.canEdit;
  const desktop = useMedia(DESKTOP_QUERY);
  const wide = useMedia(WIDE_QUERY);
  const [payrollDate, setPayrollDate] = useState<string | null>(null);
  /** The server's current local date and periods; days after that date show as upcoming. */
  const [periods, setPeriods] = useState<CurrentPeriods | null>(null);
  const [view, setView] = useState<TimesheetView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [category, setCategory] = useState<DayCategory>('Off');
  const [preview, setPreview] = useState<DayBatchPreview | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [clockOutSession, setClockOutSession] = useState<Session | null>(null);
  // Review and delivery status of the shown period, from the server's fields; re-read with every edit.
  // A shared view has no status line: the finalization and delivery routes are the owner's own.
  // F-2: an imported period is read-only history with no review or delivery state, so it has no status line.
  const imported = view?.timesheet.imported_unverified === true;
  // The same finalization and delivery reads as before; the sheet also takes its signature lines from them.
  const periodState = usePeriodState(view?.period.payroll_date ?? '', view?.timesheet.version, own && !imported && view !== null);
  /** "Show details" of the toolbar: the worked-on-a-workday and worked-on-a-day-off rows of the sheet. */
  const [details, setDetails] = useState(false);
  /** Batch mode ("Change several days"): the selection boxes and the batch bar show only while it is on. */
  const [batchMode, setBatchMode] = useState(false);
  // An imported period keeps its locked batch controls and the reason visible (F-2).
  const batchOn = canEdit && (batchMode || imported);
  /** The running session found in the loaded periods: undefined until the first check, null when clocked out. */
  const [running, setRunning] = useState<Session | null | undefined>(undefined);
  /** What the open review dialog commits (the batch selection, or one in-cell label pick). */
  const [previewSource, setPreviewSource] = useState<PreviewSource>({ kind: 'batch' });
  /** The date whose in-cell label pick is being previewed or committed. */
  const [labelBusy, setLabelBusy] = useState<string | null>(null);
  /** Raised after a label or batch commit changed the day open in the editor, so the editor reloads it. */
  const [editorRefresh, setEditorRefresh] = useState(0);
  /** The element that opened the day editor, and the date whose button gets focus back when it closes. */
  const editorOpener = useRef<Element | null>(null);
  const returnFocusTo = useRef<string | null>(null);
  /** The date whose label picker gets focus back when its review dialog closes. */
  const returnToPicker = useRef<string | null>(null);
  /** What opened the batch review ("Preview changes"); it gets focus back when the review is cancelled. */
  const batchOpener = useRef<HTMLElement | null>(null);
  const returnToBatchOpener = useRef(false);

  const report = (caught: unknown) => setMessage(describeError(caught));

  useEffect(() => {
    request<CurrentPeriods>('GET', '/periods/current')
      .then((response) => {
        setPeriods(response);
        setPayrollDate(response.current.payroll_date);
      })
      .catch(report);
  }, [request]);

  const load = useCallback(() => {
    if (payrollDate === null) return;
    request<TimesheetView>('GET', `/timesheets/${payrollDate}`)
      .then(setView)
      .catch((caught: unknown) => setMessage(describeError(caught)));
    // The server's date can move on while the page stays open, so it is read again with the period.
    request<CurrentPeriods>('GET', '/periods/current')
      .then(setPeriods)
      .catch(() => undefined);
  }, [payrollDate, request]);

  useEffect(load, [load]);

  // The clock shows one button, chosen from the running session; it is looked up again with every load.
  useEffect(() => {
    if (!own || view === null) return;
    let current = true;
    findRunningSession(view)
      .then((found) => {
        if (current) setRunning(found ?? null);
      })
      .catch(() => {
        if (current) setRunning(null);
      });
    return () => {
      current = false;
    };
  }, [own, view]);

  async function move(direction: -1 | 1) {
    if (view === null) return;
    const date = direction < 0 ? addDays(view.period.period_start, -1) : addDays(view.period.period_end, 1);
    try {
      const response = await request<{ periods: Period[] }>('GET', `/periods?from=${date}&to=${date}`);
      setPayrollDate(response.periods[0]?.payroll_date ?? payrollDate);
      setSelected(new Set());
      setStaleNotice(null);
      setNotice(null);
    } catch (caught) {
      report(caught);
    }
  }

  async function clockIn() {
    setMessage(null);
    try {
      await api('POST', '/api/clock/in', { input_zone: displayZone });
      load();
    } catch (caught) {
      report(caught);
    }
  }

  async function openClockOut() {
    setMessage(null);
    try {
      const found = await findRunningSession(view);
      if (found === undefined) setMessage('No running session found; reload the page.');
      else setClockOutSession(found);
    } catch (caught) {
      report(caught);
    }
  }

  function toggle(workDate: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(workDate)) next.add(workDate);
      return next;
    });
  }

  async function previewBatch() {
    if (view === null) return;
    // Read before the busy state disables the button and the browser drops its focus.
    batchOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMessage(null);
    setNotice(null);
    setStaleNotice(null);
    setDialogError(null);
    setBusy(true);
    try {
      const entries = batchEntries(view.days, selected, category);
      setPreviewSource({ kind: 'batch' });
      setPreview(await request<DayBatchPreview>('POST', '/days/batch', { mode: 'preview', entries }));
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(false);
    }
  }

  /**
   * The batch commit, the same for the batch bar and an in-cell label pick. `inDialog` says where an
   * error is shown: in the review dialog, or above the sheet for a pick committed straight away.
   */
  async function sendCommit(entries: DayBatchEntry[], input: { reason: string; confirmConflicts: boolean }, inDialog: boolean) {
    setDialogError(null);
    setBusy(true);
    try {
      const result = await request<DayBatchResult>('POST', '/days/batch', {
        mode: 'commit',
        entries,
        ...(input.reason === '' ? {} : { reason: input.reason }),
        ...(input.confirmConflicts ? { confirm_conflicts: true } : {}),
      });
      setPreview(null);
      setSelected(new Set());
      setNotice(`Saved ${result.changed.length} ${result.changed.length === 1 ? 'day' : 'days'}.`);
      if (editDate !== null && result.changed.includes(editDate)) setEditorRefresh((value) => value + 1);
      load();
    } catch (caught) {
      if (caught instanceof ApiRequestError && caught.status === 409 && caught.code === 'stale_version') {
        setPreview(null);
        setStaleNotice(staleReloadMessage(staleDates(caught.details)));
      } else if (inDialog) {
        setDialogError(describeError(caught));
      } else {
        report(caught);
      }
    } finally {
      setBusy(false);
    }
  }

  async function commitBatch(input: { reason: string; confirmConflicts: boolean }) {
    if (view === null) return;
    if (previewSource.kind === 'label') returnToPicker.current = previewSource.entry.work_date;
    const entries = previewSource.kind === 'label' ? [previewSource.entry] : batchEntries(view.days, selected, category);
    await sendCommit(entries, input, true);
  }

  /**
   * An in-cell label pick (E-3 a): a one-entry batch preview, then the commit of the same entry. A
   * date that needs a reason, has recorded work or cannot change opens the review dialog, which asks
   * for the reason and the conflict confirmation exactly as for several days (docs/04, AC-04).
   */
  async function pickLabel(workDate: string, choice: LabelChoice) {
    const day = view?.days.find((item) => item.work_date === workDate);
    if (day === undefined) return;
    const entry = labelEntry(day, choice);
    setMessage(null);
    setNotice(null);
    setStaleNotice(null);
    setDialogError(null);
    setLabelBusy(workDate);
    try {
      const result = await request<DayBatchPreview>('POST', '/days/batch', { mode: 'preview', entries: [entry] });
      const outcome = labelPreviewOutcome(result);
      if (outcome === 'unchanged') {
        setNotice(`No change: ${workDate} is already ${choice}.`);
      } else if (outcome === 'commit') {
        await sendCommit([entry], { reason: '', confirmConflicts: false }, false);
      } else {
        setPreviewSource({ kind: 'label', entry });
        setPreview(result);
      }
    } catch (caught) {
      report(caught);
    } finally {
      setLabelBusy(null);
    }
  }

  function closePreview() {
    if (previewSource.kind === 'label') returnToPicker.current = previewSource.entry.work_date;
    else returnToBatchOpener.current = true;
    setPreview(null);
  }

  // After a review dialog is gone (the page is no longer inert), focus goes back to what opened it:
  // a label pick's picker, or "Preview changes" after a cancelled batch review (WP5-UX-AX-08).
  useEffect(() => {
    if (preview !== null) return;
    const date = returnToPicker.current;
    if (date !== null) {
      returnToPicker.current = null;
      focusLabelPicker(date);
    }
    if (returnToBatchOpener.current) {
      returnToBatchOpener.current = false;
      focusIfAvailable(batchOpener.current);
    }
  }, [preview]);

  function openEditor(workDate: string) {
    editorOpener.current = document.activeElement;
    setEditDate(workDate);
  }

  function closeEditor() {
    if (editDate !== null) returnFocusTo.current = editDate;
    setEditDate(null);
  }

  // After the editor is gone (a modal sheet no longer makes the page inert), focus goes back to the day.
  useEffect(() => {
    const date = returnFocusTo.current;
    if (editDate !== null || date === null) return;
    returnFocusTo.current = null;
    focusDay(date, editorOpener.current);
  }, [editDate]);

  function reload() {
    setStaleNotice(null);
    setSelected(new Set());
    load();
  }

  const todayLocal = periods?.today_local ?? null;

  return (
    <div>
      <header className="toolbar page-head">
        <div>
          <h1>{shared === undefined ? 'Timesheet' : `${shared.ownerName}'s timesheet`}</h1>
          <p className="muted">{shared === undefined ? user.display_name : `Signed in as ${user.display_name}`}</p>
        </div>
      </header>

      {view !== null && (
        <div className="workbar">
          <PeriodBar view={view} zone={displayZone} onMove={move} own={own} state={periodState} />
          {own && <ClockPanel running={running} zone={displayZone} onClockIn={() => void clockIn()} onClockOut={() => void openClockOut()} />}
        </div>
      )}

      {view !== null && (
        <div className={`sheet-area${editDate !== null && wide ? ' with-editor' : ''}`}>
          <section className="card stack">
            <div className="tools">
              <div className="tools-left">{canEdit && <OpenDay onOpen={openEditor} />}</div>
              <div className="tools-right">
                <button type="button" className="quiet" aria-pressed={details} onClick={() => setDetails((on) => !on)}>
                  Show details
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="quiet"
                    aria-pressed={batchOn}
                    disabled={imported}
                    aria-describedby={imported ? 'imported-reason' : undefined}
                    onClick={() => {
                      setBatchMode((on) => !on);
                      setSelected(new Set());
                    }}
                  >
                    Change several days
                  </button>
                )}
              </div>
            </div>
            {message !== null && (
              <p className="error" role="alert">
                {message}
              </p>
            )}
            {notice !== null && (
              <p className="notice-ok" role="status">
                {notice}
              </p>
            )}
            {staleNotice !== null && (
              <div className="stale" role="alert">
                <p>{staleNotice}</p>
                <button type="button" onClick={reload}>
                  Reload period
                </button>
              </div>
            )}

            {batchOn && (
              <BatchBar
                selectedCount={selected.size}
                category={category}
                busy={busy}
                onCategory={setCategory}
                onSelectAll={() => setSelected(new Set(view.days.map((day) => day.work_date)))}
                onClear={() => setSelected(new Set())}
                onPreview={previewBatch}
                onDone={() => {
                  setBatchMode(false);
                  setSelected(new Set());
                }}
                locked={imported}
              />
            )}

            <TimesheetSheet
              view={view}
              employeeName={shared === undefined ? user.display_name : shared.ownerName}
              zone={displayZone}
              todayLocal={todayLocal}
              desktop={desktop}
              actions={{
                selected,
                onToggle: toggle,
                onEdit: openEditor,
                editable: canEdit,
                selecting: batchOn,
                locked: imported,
                label: {
                  choiceOf: (workDate) => {
                    const day = view.days.find((item) => item.work_date === workDate);
                    return day === undefined ? null : currentLabelChoice(day);
                  },
                  onPick: (workDate, choice) => void pickLabel(workDate, choice),
                  busyDate: labelBusy,
                },
              }}
              details={details}
              finalization={periodState?.finalization ?? null}
              signatures={own && !imported}
            />
          </section>

          {editDate !== null && (
            <DayEditor
              key={editDate}
              workDate={editDate}
              displayZone={displayZone}
              reportingZone={view.reporting_zone}
              todayLocal={todayLocal}
              modal={!wide}
              bottomSheet={!desktop}
              refresh={editorRefresh}
              onChanged={load}
              onClose={closeEditor}
              request={request}
              readOnly={!canEdit || imported}
            />
          )}
        </div>
      )}

      {preview !== null && view !== null && (
        <BatchDialog
          preview={preview}
          days={view.days}
          zone={displayZone}
          error={dialogError}
          busy={busy}
          title={previewSource.kind === 'label' ? `Review label change for ${previewSource.entry.work_date}` : undefined}
          onCommit={commitBatch}
          onClose={closePreview}
        />
      )}

      {own && clockOutSession !== null && (
        <ClockOutDialog
          session={clockOutSession}
          displayZone={displayZone}
          onDone={() => {
            setClockOutSession(null);
            setNotice('Clocked out.');
            load();
          }}
          onStale={() => {
            setClockOutSession(null);
            setNotice('The running session changed elsewhere; it was reloaded. Clock out again to review it.');
            load();
          }}
          onClose={() => setClockOutSession(null)}
        />
      )}
    </div>
  );
}
