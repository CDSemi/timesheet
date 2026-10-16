import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { addDays } from '../domain/dates.ts';
import {
  ApiRequestError,
  type CurrentPeriods,
  type DayBatchEntry,
  type DayBatchPreview,
  type DayBatchResult,
  type DayCategory,
  ownRequest,
  type Period,
  type Requester,
  type TimesheetView,
  type User,
} from './api.ts';
import { BatchBar } from './components/BatchBar.tsx';
import { BatchDialog } from './components/BatchDialog.tsx';
import { ClockPanel } from './components/ClockPanel.tsx';
import { DESKTOP_QUERY, useClock, useMedia } from './components/ClockProvider.tsx';
import { batchEntries, staleDates, staleReloadMessage } from './components/dayModel.ts';
import { describeError } from './components/errors.ts';
import { displayZone } from './components/format.ts';
import { currentLabelChoice, type LabelChoice, labelEntry, labelPreviewOutcome } from './components/labelPickerModel.ts';
import { OpenDay } from './components/OpenDay.tsx';
import { PeriodBar, type PeriodJumps } from './components/PeriodBar.tsx';
import { currentPeriodJump, currentStatusText, todayJump, todayStatusText } from './components/periodJumpModel.ts';
import { usePeriodState } from './components/ReviewStatus.tsx';
import { ShowDetailsSwitch } from './components/ShowDetailsSwitch.tsx';
import { TimesheetSheet } from './components/TimesheetSheet.tsx';
import { DayEditor } from './DayEditor.tsx';

/*
 * The documented layout breakpoint (DESKTOP_QUERY, shared with the check in/out control): the 7-column sheet from
 * 768px up, one table per week below it.
 */

/**
 * From this width the day editor is a non-modal panel in its own column beside the sheet, which keeps its
 * seven columns at their readable width. 1360px is the same literal as the media query in styles.css (a media
 * query cannot read a custom property). Below it the editor is modal and floats (a side panel from 768px, a
 * bottom sheet below that), so it never covers a control that can still take focus.
 */
const WIDE_QUERY = '(min-width: 1360px)';

/** Which side the floating (modal) side panel docks on: away from the edited column, so the column stays visible. */
type DockSide = 'left' | 'right';

/**
 * Scrolls the edited column into view (vertically; a sideways scroll only when the sheet itself scrolls sideways) and
 * returns the side away from it: the panel goes left when the column's centre is right of the window's centre. A date
 * that is not on the sheet (opened through "Open a day") leaves the panel on the right.
 */
function dockAwayFrom(workDate: string): DockSide {
  const column = document.querySelector<HTMLElement>(`[data-day="${workDate}"]`);
  if (column === null) return 'right';
  column.scrollIntoView({ block: 'nearest' });
  const box = column.getBoundingClientRect();
  return box.left + box.width / 2 > document.documentElement.clientWidth / 2 ? 'left' : 'right';
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

/**
 * Another person's timesheets, opened through a share (FR-17). Every read and write goes through
 * `request` (below `/api/shared/:ownerId`). Check in/out, the review and the submission status are
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
  // The one check in/out state (null in a shared view, which has none). The desktop title row shows it here; below 768px the top bar does.
  const clock = useClock();
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
  /** The visually hidden status line after "Today" or "Current period"; cleared by anything else that changes the sheet. */
  const [jumpStatus, setJumpStatus] = useState<string | null>(null);
  /** Raised by "Today" so the effect below scrolls today's day into view once; an ordinary reload never scrolls. */
  const [jumpCount, setJumpCount] = useState(0);
  const scrollToToday = useRef<string | null>(null);

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

  // The server's date moves on while the page stays open (midnight in the reporting zone). The periods are read again when the window
  // regains focus or the tab becomes visible, so "Today" and the Today tag do not go stale; the person's own view and a shared view
  // both read through `request` (the share's requester in a shared view). One read at a time: the browser fires both events together.
  const refreshing = useRef(false);
  useEffect(() => {
    const refresh = () => {
      if (refreshing.current) return;
      refreshing.current = true;
      request<CurrentPeriods>('GET', '/periods/current')
        .then(setPeriods)
        .catch(() => undefined)
        .finally(() => {
          refreshing.current = false;
        });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [request]);

  // The floating side panel (a modal editor on a desktop-width window narrower than WIDE_QUERY) docks away from the edited
  // column. A layout effect runs before the editor's own effect shows the dialog, so the column is scrolled into view first.
  // The side is read again when the edited day or the mode changes; the editor itself stays mounted across a mode change.
  const floating = desktop && !wide;
  const [dockSide, setDockSide] = useState<DockSide>('right');
  useLayoutEffect(() => {
    if (editDate === null || !floating) return;
    setDockSide(dockAwayFrom(editDate));
  }, [editDate, floating]);

  // The clock state looks the running session up again with every load: this page reports the period it loaded.
  const reportView = clock?.reportView;
  useEffect(() => {
    if (!own || view === null || reportView === undefined) return;
    reportView(view);
    return () => reportView(null);
  }, [own, view, reportView]);

  // An action of the clock (check in, check out) reloads the period; the check-out confirmation shows as this page's saved notice.
  const seenVersion = useRef(clock?.version ?? 0);
  const clockVersion = clock?.version;
  useEffect(() => {
    if (clockVersion === undefined || clockVersion === seenVersion.current) return;
    seenVersion.current = clockVersion;
    load();
  }, [clockVersion, load]);
  const clockNotice = clock?.notice ?? null;
  const seenNotice = useRef(clockNotice?.id ?? 0);
  useEffect(() => {
    if (clockNotice === null || clockNotice.id === seenNotice.current) return;
    seenNotice.current = clockNotice.id;
    setNotice(clockNotice.text);
  }, [clockNotice]);

  async function move(direction: -1 | 1) {
    if (view === null) return;
    const date = direction < 0 ? addDays(view.period.period_start, -1) : addDays(view.period.period_end, 1);
    try {
      const response = await request<{ periods: Period[] }>('GET', `/periods?from=${date}&to=${date}`);
      setPayrollDate(response.periods[0]?.payroll_date ?? payrollDate);
      setSelected(new Set());
      setStaleNotice(null);
      setNotice(null);
      setJumpStatus(null);
      scrollToToday.current = null;
    } catch (caught) {
      report(caught);
    }
  }

  /**
   * "Today": re-reads the server's periods, opens the period that contains its `today_local` (the
   * accounting date in the saved reporting zone, never the device clock), moves an open Day editor to
   * that date and scrolls today's day into view. Everything comes from the model and the server.
   * A press on the inactive button (`wasAway` false) re-reads the same way: the page may have stayed open past the reporting
   * zone's midnight, so only the fresh answer says whether the sheet still shows today.
   */
  async function jumpToToday(wasAway: boolean) {
    if (view === null) return;
    // An active press clears the old announcement first, so the same text is read again; an inactive press must leave it alone.
    const announced = jumpStatus;
    if (wasAway) setJumpStatus(null);
    try {
      const fresh = await request<CurrentPeriods>('GET', '/periods/current');
      const jump = todayJump({ today: fresh.today_local, current: fresh.current, inProgress: fresh.in_progress, shown: view.period, editDate });
      setPeriods(fresh);
      if (!jump.away) {
        // The fresh answer decides, not the button's look: the sheet already shows today (and the open editor is on it), so nothing
        // moves. Only the periods are renewed, so the Today tag and the buttons follow the server's date.
        if (wasAway) setJumpStatus(announced);
        return;
      }
      setJumpStatus(null);
      setPayrollDate(jump.targetPayrollDate);
      setSelected(new Set());
      setStaleNotice(null);
      setNotice(null);
      if (jump.moveEditorTo !== null) setEditDate(jump.moveEditorTo);
      scrollToToday.current = fresh.today_local;
      setJumpCount((count) => count + 1);
      setJumpStatus(todayStatusText(fresh.today_local, fresh.in_progress));
    } catch (caught) {
      report(caught);
    }
  }

  /** "Current period": returns to the R-07 current period the page opens on. It only navigates; an open editor stays as it is. */
  async function jumpToCurrent() {
    if (view === null) return;
    setJumpStatus(null);
    try {
      const fresh = await request<CurrentPeriods>('GET', '/periods/current');
      const jump = currentPeriodJump({ current: fresh.current, inProgress: fresh.in_progress, shown: view.period });
      setPeriods(fresh);
      setPayrollDate(jump.targetPayrollDate);
      setSelected(new Set());
      setStaleNotice(null);
      setNotice(null);
      scrollToToday.current = null;
      setJumpStatus(currentStatusText(fresh.current));
    } catch (caught) {
      report(caught);
    }
  }

  // After "Today", today's day (a desktop column or a phone row) is scrolled into view once its period is on the sheet.
  useEffect(() => {
    const date = scrollToToday.current;
    if (date === null || view === null) return;
    const element = document.querySelector<HTMLElement>(`[data-day="${date}"]`);
    if (element === null) return;
    scrollToToday.current = null;
    element.scrollIntoView({ block: 'nearest' });
  }, [jumpCount, view]);

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
  // The two jump buttons come from the server's periods and today's accounting date, compared with the shown period. A saved notice
  // (the other status line of this screen) replaces the jump status, so two status lines never stand side by side.
  const todayAway = periods === null || view === null ? false : todayJump({ today: periods.today_local, current: periods.current, inProgress: periods.in_progress, shown: view.period, editDate }).away;
  const jumps: PeriodJumps | undefined =
    periods === null || view === null
      ? undefined
      : {
          todayAway,
          currentVisible: currentPeriodJump({ current: periods.current, inProgress: periods.in_progress, shown: view.period }).visible,
          onToday: () => void jumpToToday(todayAway),
          onCurrent: () => void jumpToCurrent(),
          status: notice === null ? jumpStatus : null,
        };

  return (
    <div>
      {/* The title row (U-07, U-08): the title on the left, check in/out on the right from 768px. No name line under the title. */}
      <header className="toolbar page-head">
        <h1>{shared === undefined ? 'Timesheet' : `${shared.ownerName}'s timesheet`}</h1>
        {own && desktop && <ClockPanel />}
      </header>

      {view !== null && (
        <div className="workbar">
          <PeriodBar view={view} zone={displayZone} onMove={move} own={own} state={periodState} jumps={jumps} periods={periods} />
        </div>
      )}

      {view !== null && (
        <div className={`sheet-area${editDate !== null && wide ? ' with-editor' : ''}`}>
          <section className="card stack sheet-main">
            <div className="tools">
              <div className="tools-left">{canEdit && <OpenDay onOpen={openEditor} />}</div>
              <div className="tools-right">
                <ShowDetailsSwitch checked={details} onChange={setDetails} />
                {canEdit && (
                  <button
                    type="button"
                    className="secondary"
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
                editing: editDate,
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
              dockSide={dockSide}
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
    </div>
  );
}
