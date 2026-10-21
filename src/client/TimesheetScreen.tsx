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
import { ConfirmDialog } from './components/ConfirmDialog.tsx';
import { dayPeriodPill } from './components/dayEditorModel.ts';
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
import { useEditorLayout } from './components/useEditorLayout.ts';
import { DayEditor } from './DayEditor.tsx';

/*
 * The documented layout breakpoint (DESKTOP_QUERY, shared with the check in/out control): the 7-column sheet from
 * 768px up, one table per week below it. From 768px the Day editor is a non-modal drawer; whether it stands beside the
 * sheet (the page reserves its room) or floats over it is the rule of useEditorLayout, never a literal width.
 */

/** Which window edge the drawer is flush with: always the right beside the sheet; floating, away from the edited column so the column stays visible. */
type DockSide = 'left' | 'right';

/** The text of the polite status after the open day's button closed the Day editor. */
const EDITOR_CLOSED_TEXT = 'Day editor closed';

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

/** True when `inner` lies wholly within `outer`: a control in this position behind the drawer is entirely hidden (WCAG 2.2 SC 2.4.11). */
function whollyCovered(inner: DOMRect, outer: DOMRect): boolean {
  return inner.width > 0 && inner.height > 0 && inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom;
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
  // The Day editor's layout (U4-07): beside the sheet when the window leaves the sheet its minimum width, else floating. The media query
  // decides the phone (a classic scrollbar makes the model's width up to 15px narrower than the query's), so a sliver reads as floating.
  const beside = useEditorLayout() === 'beside' && desktop;
  const floating = desktop && !beside;
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
  /** "Show worked hours" of the toolbar: the worked-on-a-workday and worked-on-a-day-off rows of the sheet. */
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
  /** True while the open editor holds day fields or a reason that are not saved (reported by the editor). */
  const editorDirty = useRef(false);
  const reportEditorDirty = useCallback((dirty: boolean) => {
    editorDirty.current = dirty;
  }, []);
  /**
   * The action waiting for the answer to "Discard your changes?" (a switch, an unselect, Close or Escape, Today, a period step): what
   * it does once the edits are dropped, and the control to give focus back to when the person keeps editing.
   */
  const [discard, setDiscard] = useState<{ proceed: () => void; keep?: () => void; opener: HTMLElement | null } | null>(null);
  /** Raised to remount the open editor from the saved day (the forms and the reason start again) when a navigation drops the edits. */
  const [editorEpoch, setEditorEpoch] = useState(0);
  /** The polite status after the open day's button closed the editor; cleared when an editor opens. */
  const [editorStatus, setEditorStatus] = useState('');
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

  // The floating drawer docks away from the edited column. A layout effect runs before the editor's own effect shows the dialog,
  // so the column is scrolled into view first. The side is read again when the edited day or the mode changes; the editor itself
  // stays mounted across a mode change.
  const [dockSide, setDockSide] = useState<DockSide>('right');
  useLayoutEffect(() => {
    if (editDate === null || !floating) return;
    setDockSide(dockAwayFrom(editDate));
  }, [editDate, floating]);

  // SC 2.4.11: the floating drawer does not make the page inert, so a control behind it can take focus. When it does and its box
  // lies wholly under the drawer, the drawer docks to the other edge: a focused control is never entirely hidden. The box is read
  // after the frame, when the browser has scrolled the control into view. Controls in dialogs (they sit above the drawer) are skipped.
  useEffect(() => {
    if (editDate === null || !floating) return;
    let frame = 0;
    const redock = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest('dialog') !== null) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const panel = document.querySelector<HTMLElement>('[data-day-editor]');
        if (panel === null || !target.isConnected) return;
        if (whollyCovered(target.getBoundingClientRect(), panel.getBoundingClientRect())) setDockSide((side) => (side === 'left' ? 'right' : 'left'));
      });
    };
    document.addEventListener('focusin', redock);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', redock);
    };
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

  /** "Previous period" and "Next period": a step to another period asks first when the open editor holds unsaved edits (Discard restarts it from its saved day). */
  function move(direction: -1 | 1) {
    askBeforeDropping(() => {
      if (editorDirty.current) restartEditor();
      void moveNow(direction);
    });
  }

  async function moveNow(direction: -1 | 1) {
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
      if (!jump.away) {
        // The fresh answer decides, not the button's look: the sheet already shows today (and the open editor is on it), so nothing
        // moves. Only the periods are renewed, so the Today tag and the buttons follow the server's date.
        setPeriods(fresh);
        if (wasAway) setJumpStatus(announced);
        return;
      }
      // The jump moves the sheet to another period and an open editor to today: with unsaved edits it asks first (addendum 1).
      // Keep editing leaves everything as it was, the hidden announcement included.
      askBeforeDropping(() => {
        setPeriods(fresh);
        setJumpStatus(null);
        setPayrollDate(jump.targetPayrollDate);
        setSelected(new Set());
        setStaleNotice(null);
        setNotice(null);
        if (jump.moveEditorTo !== null) {
          editorDirty.current = false;
          setEditDate(jump.moveEditorTo);
        } else if (editorDirty.current) {
          restartEditor();
        }
        scrollToToday.current = fresh.today_local;
        setJumpCount((count) => count + 1);
        setJumpStatus(todayStatusText(fresh.today_local, fresh.in_progress));
      }, () => {
        if (wasAway) setJumpStatus(announced);
      });
    } catch (caught) {
      report(caught);
    }
  }

  /** "Current period": returns to the R-07 current period the page opens on. It only navigates; an open editor stays as it is (after the discard question when it holds unsaved edits, which Discard drops). */
  function jumpToCurrent() {
    askBeforeDropping(() => {
      if (editorDirty.current) restartEditor();
      void jumpToCurrentNow();
    });
  }

  async function jumpToCurrentNow() {
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

  /**
   * The one guard of the Day editor (U4-05, addendum 1). Edits that are not saved are never dropped silently: every action that
   * would change the open day, close the editor or move the sheet to another period runs `proceed` at once when nothing is unsaved,
   * and otherwise first asks "Discard your changes?" and waits. Keep editing changes nothing; Discard drops the edits and goes ahead.
   * Actions that stay on the same day and period (saving, reloading) are not guarded.
   */
  function askBeforeDropping(proceed: () => void, keep?: () => void) {
    if (editDate === null || !editorDirty.current) {
      proceed();
      return;
    }
    const opener = document.activeElement;
    setDiscard({ proceed, ...(keep === undefined ? {} : { keep }), opener: opener instanceof HTMLElement ? opener : null });
  }

  /** "Keep editing" of the question: nothing changes; an action that touched hidden state before asking puts it back. */
  function keepEditing() {
    discard?.keep?.();
    setDiscard(null);
  }

  /** The open editor starts again from the saved day: a navigation dropped its edits but leaves it open on its day. */
  function restartEditor() {
    editorDirty.current = false;
    setEditorEpoch((count) => count + 1);
  }

  /**
   * Opens the Day editor on a day, or switches the open editor to it (U4-05); opening the day that is already open changes nothing.
   */
  function openEditor(workDate: string) {
    if (workDate === editDate) return;
    // What was pressed, read now: after a "Discard" the active element is the question's own button.
    const pressed = document.activeElement;
    askBeforeDropping(() => {
      editorDirty.current = false;
      editorOpener.current = pressed;
      setEditorStatus('');
      setEditDate(workDate);
    });
  }

  function closeEditor() {
    if (editDate !== null) returnFocusTo.current = editDate;
    editorDirty.current = false;
    setEditDate(null);
  }

  /** The editor's Close button and Escape. */
  function requestClose() {
    askBeforeDropping(closeEditor);
  }

  /** A press on the open day's own button: closes the editor (after the discard question when it holds unsaved edits) and says so. */
  function unselectEditor() {
    if (editDate === null) return;
    askBeforeDropping(() => {
      closeEditor();
      setEditorStatus(EDITOR_CLOSED_TEXT);
    });
  }

  /** "Discard" of the question: the action that was waiting goes ahead and the edits are dropped. */
  function confirmDiscard() {
    if (discard === null) return;
    const { proceed } = discard;
    setDiscard(null);
    proceed();
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
          onCurrent: jumpToCurrent,
          status: notice === null ? jumpStatus : null,
        };

  return (
    <div>
      {/* The title row (U-07, U-08): the title on the left, check in/out on the right from 768px. No name line under the title. */}
      {/* Round 4 (U4-03): the toolbar, messages, batch bar and sheet stand on one paper surface; the title row and the period card stay outside it. */}
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
        <div className={`sheet-area${editDate !== null && beside ? ' with-editor' : ''}`} data-editor-layout={desktop ? (beside ? 'beside' : 'floating') : 'bottom-sheet'}>
          {/*
            A persistent live region (SC 4.1.3), as the period bar's: present from load, empty until the open day's button closed the editor.
            It stands before the paper, so the paper stays the last block of the sheet area and the drawer follows it in the DOM.
          */}
          <p className="sr-only" aria-live="polite" aria-atomic="true" data-editor-status>
            {editorStatus}
          </p>
          <section className="card stack sheet-main paper" data-paper="timesheet">
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
                onUnselect: unselectEditor,
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
              key={`${editDate}:${editorEpoch}`}
              workDate={editDate}
              displayZone={displayZone}
              reportingZone={view.reporting_zone}
              todayLocal={todayLocal}
              bottomSheet={!desktop}
              dockSide={beside ? 'right' : dockSide}
              refresh={editorRefresh}
              periodPill={dayPeriodPill(editDate, view.period, periods)}
              onChanged={load}
              onClose={requestClose}
              onDirtyChange={reportEditorDirty}
              request={request}
              readOnly={!canEdit || imported}
            />
          )}
        </div>
      )}

      {discard !== null && (
        <ConfirmDialog
          title="Discard your changes?"
          message="The day fields or the reason you typed are not saved. Keep editing to go back to them, or discard them to continue."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          tone="danger"
          opener={discard.opener}
          onConfirm={confirmDiscard}
          onCancel={keepEditing}
        />
      )}

      {preview !== null && view !== null && (
        <BatchDialog
          preview={preview}
          days={view.days}
          zone={displayZone}
          error={dialogError}
          busy={busy}
          title={previewSource.kind === 'label' ? `Review category change for ${previewSource.entry.work_date}` : undefined}
          onCommit={commitBatch}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
