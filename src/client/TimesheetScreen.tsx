import { useCallback, useEffect, useState } from 'react';
import { addDays, isoWeekday } from '../domain/dates.ts';
import { formatDuration } from '../domain/format.ts';
import { parseUtcInstant } from '../domain/instants.ts';
import { formatInZone } from '../domain/zones.ts';
import { api, ApiRequestError, type DayView, type Period, type Session, type TimesheetView, type User } from './api.ts';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The viewer's current zone; it changes display only, never the saved accounting date. */
const displayZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function localTime(instant: string, zone: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(11, 19);
}

function localDate(instant: string, zone: string): string {
  return formatInZone(zone, parseUtcInstant(instant)).slice(0, 10);
}

function minutes(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : formatDuration(value);
}

function sessionLabel(session: Session, workDate: string): string {
  const start = `${localTime(session.start_utc, displayZone)}`;
  if (session.end_utc === null) return `${start} → running`;
  const endDate = localDate(session.end_utc, displayZone);
  const startDate = localDate(session.start_utc, displayZone);
  const end = localTime(session.end_utc, displayZone);
  const dateNote = startDate !== workDate || endDate !== startDate ? ` (${startDate}→${endDate})` : '';
  const breaks = session.breaks_confirmed ? `${session.breaks.length} break(s)` : 'breaks unconfirmed';
  return `${start}–${end}${dateNote}, ${breaks}`;
}

function calendarLabel(day: DayView): string {
  const classification = day.classification;
  if (classification === null) return '—';
  if (classification.name !== null) return classification.name;
  return classification.day_class === 'normal' ? 'Work day' : 'Non-working day';
}

function statusLabel(day: DayView): string {
  if (day.calculation_error !== null) return day.calculation_error.replace(/_/g, ' ');
  switch (day.calculation?.status) {
    case 'complete':
      return 'complete';
    case 'incomplete':
      return 'open session';
    case 'incomplete_breaks':
      return 'confirm breaks';
    default:
      return '';
  }
}

export function TimesheetScreen({ user }: { user: User }) {
  const [payrollDate, setPayrollDate] = useState<string | null>(null);
  const [view, setView] = useState<TimesheetView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [noBreaks, setNoBreaks] = useState(false);

  const report = (caught: unknown) =>
    setMessage(caught instanceof ApiRequestError ? `${caught.message} (${caught.code})` : 'Request failed');

  useEffect(() => {
    api<{ current: Period }>('GET', '/api/periods/current')
      .then((response) => setPayrollDate(response.current.payroll_date))
      .catch(report);
  }, []);

  const load = useCallback(() => {
    if (payrollDate === null) return;
    api<TimesheetView>('GET', `/api/timesheets/${payrollDate}`).then(setView).catch(report);
  }, [payrollDate]);

  useEffect(load, [load]);

  async function move(direction: -1 | 1) {
    if (view === null) return;
    const date = direction < 0 ? addDays(view.period.period_start, -1) : addDays(view.period.period_end, 1);
    try {
      const response = await api<{ periods: Period[] }>('GET', `/api/periods?from=${date}&to=${date}`);
      setPayrollDate(response.periods[0]?.payroll_date ?? payrollDate);
    } catch (caught) {
      report(caught);
    }
  }

  /** Finds the running session in the loaded period, else in the current period. */
  async function findRunningSession(): Promise<Session | undefined> {
    const running = (sheet: TimesheetView) =>
      sheet.days.flatMap((day) => day.sessions).find((session) => session.end_utc === null);
    const shown = view === null ? undefined : running(view);
    if (shown !== undefined || view === null) return shown;
    const current = await api<TimesheetView>('GET', `/api/timesheets/${view.current_payroll_date}`);
    return running(current);
  }

  async function clock(action: 'in' | 'out') {
    setMessage(null);
    try {
      if (action === 'in') {
        await api('POST', '/api/clock/in', { input_zone: displayZone });
      } else {
        const running = await findRunningSession();
        if (running === undefined) {
          setMessage('No running session found; reload the page.');
          return;
        }
        // The version makes a stale Clock out fail with 409. Unticked breaks are sent as
        // unknown by omitting the list, so saved breaks are kept; ticking confirms none.
        const body = noBreaks
          ? { breaks: [], breaks_confirmed: true, expected_version: running.version }
          : { breaks_confirmed: false, expected_version: running.version };
        await api('POST', '/api/clock/out', body);
      }
      load();
    } catch (caught) {
      report(caught);
    }
  }

  return (
    <div>
      <header className="toolbar">
        <div>
          <h1>Timesheet</h1>
          <p className="muted">
            {user.display_name} · reporting zone {view?.reporting_zone ?? '…'} · display zone {displayZone}
          </p>
        </div>
      </header>

      {view !== null && (
        <section className="card">
          <div className="toolbar">
            <button type="button" className="secondary" onClick={() => move(-1)} aria-label="Previous period">
              ◀
            </button>
            <div className="period">
              <strong>
                {view.period.period_start} – {view.period.period_end}
              </strong>
              <span className={`badge ${view.period.relation ?? ''}`}>{view.period.relation}</span>
              <span className="muted">
                payroll {view.period.payroll_date} · due {view.period.due_local_date} {view.period.due_local_time} (
                {view.reporting_zone}) = {formatInZone(displayZone, parseUtcInstant(view.period.due_at_utc)).slice(0, 16).replace('T', ' ')}{' '}
                your time
              </span>
              {view.reason_required && <span className="notice">Edits to this period require a reason.</span>}
            </div>
            <button type="button" className="secondary" onClick={() => move(1)} aria-label="Next period">
              ▶
            </button>
          </div>

          <div className="toolbar">
            <button type="button" onClick={() => clock('in')}>
              Clock in
            </button>
            <label className="inline">
              <input type="checkbox" checked={noBreaks} onChange={(e) => setNoBreaks(e.target.checked)} />
              No unpaid breaks taken
            </label>
            <button type="button" onClick={() => clock('out')}>
              Clock out
            </button>
          </div>
          {message !== null && <p className="error">{message}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Calendar</th>
                  <th>Label</th>
                  <th>Sessions ({displayZone})</th>
                  <th>Regular</th>
                  <th>Off-calendar</th>
                  <th>Eligible</th>
                  <th>Credit*</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {view.days.map((day) => (
                  <tr key={day.work_date} className={day.classification?.day_class === 'nonworking' ? 'nonworking' : ''}>
                    <td>
                      {WEEKDAYS[isoWeekday(day.work_date) - 1]} {day.work_date}
                    </td>
                    <td>{calendarLabel(day)}</td>
                    <td>{day.category ?? '—'}</td>
                    <td>
                      {day.sessions.length === 0
                        ? '—'
                        : day.sessions.map((session) => <div key={session.id}>{sessionLabel(session, day.work_date)}</div>)}
                    </td>
                    <td>{minutes(day.calculation?.regular_minutes)}</td>
                    <td>{minutes(day.calculation?.nonworking_minutes)}</td>
                    <td>{minutes(day.calculation?.eligible_minutes)}</td>
                    <td>{minutes(day.calculation?.credited_minutes)}</td>
                    <td>{statusLabel(day)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">
            *Provisional OT credit: {formatDuration(view.totals.provisional_credited_minutes)}; days pending evidence:{' '}
            {view.totals.pending_days}. Credits post only when a revision is finalized (WP3).
          </p>
        </section>
      )}
    </div>
  );
}
