import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { addDays } from '../domain/dates.ts';
import { formatDuration } from '../domain/format.ts';
import {
  api,
  ApiRequestError,
  type CurrentPeriods,
  type DayBatchPreview,
  type DayBatchResult,
  type DayCategory,
  type Period,
  type Session,
  type TimesheetView,
  type User,
} from './api.ts';
import { BatchBar } from './components/BatchBar.tsx';
import { BatchDialog } from './components/BatchDialog.tsx';
import { ClockBar } from './components/ClockBar.tsx';
import { ClockOutDialog } from './components/ClockOutDialog.tsx';
import { DayList } from './components/DayList.tsx';
import { batchEntries, staleDates, staleReloadMessage } from './components/dayModel.ts';
import { describeError } from './components/errors.ts';
import { displayZone } from './components/format.ts';
import { OpenDay } from './components/OpenDay.tsx';
import { PeriodHeader } from './components/PeriodHeader.tsx';
import { TimesheetGrid } from './components/TimesheetGrid.tsx';
import { DayEditor } from './DayEditor.tsx';

/** The documented layout breakpoint: the grid from 768px up, the day list below it. */
const DESKTOP_QUERY = '(min-width: 768px)';

/** True when the grid should render. Exactly one of grid and list is ever in the page. */
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

export function TimesheetScreen({ user }: { user: User }) {
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

  const report = (caught: unknown) => setMessage(describeError(caught));

  useEffect(() => {
    api<CurrentPeriods>('GET', '/api/periods/current')
      .then((response) => {
        setPeriods(response);
        setPayrollDate(response.current.payroll_date);
      })
      .catch(report);
  }, []);

  const load = useCallback(() => {
    if (payrollDate === null) return;
    api<TimesheetView>('GET', `/api/timesheets/${payrollDate}`)
      .then(setView)
      .catch((caught: unknown) => setMessage(describeError(caught)));
    // The server's date can move on while the page stays open, so it is read again with the period.
    api<CurrentPeriods>('GET', '/api/periods/current')
      .then(setPeriods)
      .catch(() => undefined);
  }, [payrollDate]);

  useEffect(load, [load]);

  async function move(direction: -1 | 1) {
    if (view === null) return;
    const date = direction < 0 ? addDays(view.period.period_start, -1) : addDays(view.period.period_end, 1);
    try {
      const response = await api<{ periods: Period[] }>('GET', `/api/periods?from=${date}&to=${date}`);
      setPayrollDate(response.periods[0]?.payroll_date ?? payrollDate);
      setSelected(new Set());
      setStaleNotice(null);
      setNotice(null);
    } catch (caught) {
      report(caught);
    }
  }

  /** Finds the running session in the loaded period, else in the current and in-progress periods. */
  async function findRunningSession(): Promise<Session | undefined> {
    const running = (sheet: TimesheetView) =>
      sheet.days.flatMap((day) => day.sessions).find((session) => session.end_utc === null);
    const shown = view === null ? undefined : running(view);
    if (shown !== undefined) return shown;
    const known = await api<CurrentPeriods>('GET', '/api/periods/current');
    const payrollDates = [...new Set([known.current.payroll_date, known.in_progress.payroll_date])];
    for (const date of payrollDates) {
      if (date === view?.period.payroll_date) continue;
      const found = running(await api<TimesheetView>('GET', `/api/timesheets/${date}`));
      if (found !== undefined) return found;
    }
    return undefined;
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
      const running = await findRunningSession();
      if (running === undefined) setMessage('No running session found; reload the page.');
      else setClockOutSession(running);
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
      setPreview(await api<DayBatchPreview>('POST', '/api/days/batch', { mode: 'preview', entries }));
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
      const result = await api<DayBatchResult>('POST', '/api/days/batch', {
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
          <h1>Timesheet</h1>
          <p className="muted">{user.display_name}</p>
        </div>
      </header>

      {view !== null && (
        <section className="card stack">
          <PeriodHeader view={view} zone={displayZone} onMove={move} />
          <ClockBar onClockIn={() => void clockIn()} onClockOut={() => void openClockOut()} />
          <OpenDay onOpen={setEditDate} />
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

          <BatchBar
            selectedCount={selected.size}
            category={category}
            busy={busy}
            onCategory={setCategory}
            onSelectAll={() => setSelected(new Set(view.days.map((day) => day.work_date)))}
            onClear={() => setSelected(new Set())}
            onPreview={previewBatch}
          />

          {desktop ? (
            <TimesheetGrid
              days={view.days}
              zone={displayZone}
              todayLocal={todayLocal}
              selected={selected}
              onToggle={toggle}
              onEdit={setEditDate}
            />
          ) : (
            <DayList
              days={view.days}
              zone={displayZone}
              todayLocal={todayLocal}
              selected={selected}
              onToggle={toggle}
              onEdit={setEditDate}
            />
          )}
          <p className="muted">
            *Provisional OT credit: {formatDuration(view.totals.provisional_credited_minutes)}; days pending OT evidence:{' '}
            {view.totals.pending_days}. Credits post only when a revision is finalized (WP3).
          </p>
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
        />
      )}

      {clockOutSession !== null && (
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
