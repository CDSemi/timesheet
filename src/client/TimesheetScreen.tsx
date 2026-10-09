import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { addDays } from '../domain/dates.ts';
import {
  api,
  ApiRequestError,
  type CurrentPeriods,
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
import { OpenDay } from './components/OpenDay.tsx';
import { PeriodBar } from './components/PeriodBar.tsx';
import { runningSessionOf } from './components/periodBarModel.ts';
import { usePeriodState } from './components/ReviewStatus.tsx';
import { TimesheetSheet } from './components/TimesheetSheet.tsx';
import { DayEditor } from './DayEditor.tsx';

/** The documented layout breakpoint: the 7-column sheet from 768px up, one table per week below it. */
const DESKTOP_QUERY = '(min-width: 768px)';

/** True when the desktop sheet should render. Exactly one of the two layouts is ever in the page. */
function useDesktop(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );
}

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
  const desktop = useDesktop();
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
    setMessage(null);
    setNotice(null);
    setStaleNotice(null);
    setDialogError(null);
    setBusy(true);
    try {
      const entries = batchEntries(view.days, selected, category);
      setPreview(await request<DayBatchPreview>('POST', '/days/batch', { mode: 'preview', entries }));
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(false);
    }
  }

  async function commitBatch(input: { reason: string; confirmConflicts: boolean }) {
    if (view === null) return;
    setDialogError(null);
    setBusy(true);
    try {
      const entries = batchEntries(view.days, selected, category);
      const result = await request<DayBatchResult>('POST', '/days/batch', {
        mode: 'commit',
        entries,
        ...(input.reason === '' ? {} : { reason: input.reason }),
        ...(input.confirmConflicts ? { confirm_conflicts: true } : {}),
      });
      setPreview(null);
      setSelected(new Set());
      setNotice(`Saved ${result.changed.length} ${result.changed.length === 1 ? 'day' : 'days'}.`);
      load();
    } catch (caught) {
      if (caught instanceof ApiRequestError && caught.status === 409 && caught.code === 'stale_version') {
        setPreview(null);
        setStaleNotice(staleReloadMessage(staleDates(caught.details)));
      } else {
        setDialogError(describeError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  function reload() {
    setStaleNotice(null);
    setSelected(new Set());
    load();
  }

  const todayLocal = periods?.today_local ?? null;

  return (
    <div>
      <header className="toolbar">
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
        <section className="card stack">
          <div className="tools">
            <div className="tools-left">{canEdit && <OpenDay onOpen={setEditDate} />}</div>
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
          {message !== null && <p className="error">{message}</p>}
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
            actions={{ selected, onToggle: toggle, onEdit: setEditDate, editable: canEdit, selecting: batchOn, locked: imported }}
            details={details}
            finalization={periodState?.finalization ?? null}
            signatures={own && !imported}
          />
        </section>
      )}

      {preview !== null && view !== null && (
        <BatchDialog
          preview={preview}
          days={view.days}
          zone={displayZone}
          error={dialogError}
          busy={busy}
          onCommit={commitBatch}
          onClose={() => setPreview(null)}
        />
      )}

      {editDate !== null && view !== null && (
        <DayEditor
          key={editDate}
          workDate={editDate}
          displayZone={displayZone}
          reportingZone={view.reporting_zone}
          todayLocal={todayLocal}
          onChanged={load}
          onClose={() => setEditDate(null)}
          request={request}
          readOnly={!canEdit || imported}
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
