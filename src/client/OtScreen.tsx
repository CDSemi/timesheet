import { useCallback, useEffect, useState } from 'react';
import { addDays, diffDays } from '../domain/dates.ts';
import {
  api,
  type CurrentPeriods,
  type DayView,
  type OtBalance,
  type OtLedgerEntry,
  type OtLeaveRequest,
  type OtReserveRequest,
  type OtSummary,
  type TimesheetView,
} from './api.ts';
import { describeError } from './components/errors.ts';
import { instantText, minutesText, displayZone, periodRange } from './components/format.ts';
import { LeaveRow, type LeaveActions } from './components/LeaveRow.tsx';
import { mismatchDays, mismatchText } from './components/otModel.ts';
import { ReserveForm } from './components/ReserveForm.tsx';

/** The evidence route accepts at most this many days (400); the default window is far inside it. */
const EVIDENCE_MAX_DAYS = 400;

interface OtData {
  summary: OtSummary;
  leave: OtLeaveRequest[];
  ledger: OtLedgerEntry[];
  periods: CurrentPeriods;
  days: DayView[];
}

async function loadAll(): Promise<OtData> {
  const [summary, leave, ledger, periods] = await Promise.all([
    api<OtSummary>('GET', '/api/ot/summary'),
    api<{ requests: OtLeaveRequest[] }>('GET', '/api/ot/leave'),
    api<{ entries: OtLedgerEntry[] }>('GET', '/api/ot/ledger'),
    api<CurrentPeriods>('GET', '/api/periods/current'),
  ]);
  // E-2 mismatch warnings read the day views of the periods the employee is working in.
  const payrollDates = [...new Set([periods.current.payroll_date, periods.in_progress.payroll_date])];
  const sheets = await Promise.all(payrollDates.map((date) => api<TimesheetView>('GET', `/api/timesheets/${date}`)));
  return { summary, leave: leave.requests, ledger: ledger.entries, periods, days: sheets.flatMap((sheet) => sheet.days) };
}

function Balances({ balance, provisional }: { balance: OtBalance; provisional: number }) {
  const figures: Array<{ name: string; label: string; minutes: number }> = [
    { name: 'posted', label: 'Posted', minutes: balance.posted_minutes },
    { name: 'provisional', label: 'Provisional', minutes: provisional },
    { name: 'reserved', label: 'Reserved', minutes: balance.reserved_minutes },
    { name: 'available', label: 'Available', minutes: balance.available_minutes },
  ];
  return (
    <section className="card stack" aria-label="OT balances">
      <h2>OT balance</h2>
      <dl className="ot-balances">
        {figures.map((figure) => (
          <div key={figure.name} data-balance={figure.name}>
            <dt>{figure.label}</dt>
            <dd className="mono" data-minutes={figure.minutes}>
              {minutesText(figure.minutes)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="hint">Provisional minutes come from complete days in open periods. They cannot be spent until the period is finalized.</p>
      {balance.negative && (
        <p className="error" role="status" data-flag="negative">
          The posted balance is negative. A correction made after leave was used caused this; it stays visible until it is settled.
        </p>
      )}
      {balance.reconciliation_required && (
        <p className="notice" role="status" data-flag="reconciliation">
          Reconciliation required: a correction changed minutes that were already spent.
        </p>
      )}
    </section>
  );
}

function EvidencePanel({ data }: { data: OtData }) {
  const today = data.periods.today_local;
  const [from, setFrom] = useState(addDays(today, -60));
  const [to, setTo] = useState(addDays(today, 14));
  const rangeOk = from !== '' && to !== '' && to >= from && diffDays(to, from) <= EVIDENCE_MAX_DAYS;
  const query = new URLSearchParams({ from, to }).toString();

  return (
    <section className="card stack" aria-label="Daily evidence">
      <h2>Daily evidence</h2>
      {data.summary.provisional_periods.length === 0 ? (
        <p className="muted">No open period has complete days yet.</p>
      ) : (
        <ul className="plain" aria-label="Provisional credit by period">
          {data.summary.provisional_periods.map((period) => (
            <li key={period.payroll_date} data-provisional-period={period.payroll_date} className="ot-line">
              <span className="mono">{periodRange(period)}</span>
              <span>
                {minutesText(period.credited_minutes)} from {period.complete_days} complete {period.complete_days === 1 ? 'day' : 'days'}
              </span>
              {period.pending_days > 0 && <span className="muted">{period.pending_days} pending</span>}
            </li>
          ))}
        </ul>
      )}
      {data.ledger.length === 0 ? (
        <p className="muted">The ledger has no entries yet. Credits are posted when a period is finalized.</p>
      ) : (
        <div className="table-wrap">
          <table aria-label="OT ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry</th>
                <th>Minutes</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.map((entry) => (
                <tr key={entry.id} data-ledger-type={entry.entry_type}>
                  <td className="mono">{entry.work_date ?? instantText(entry.posted_at, displayZone)}</td>
                  <td>
                    {entry.entry_type.replaceAll('_', ' ')}
                    {entry.reconciliation_required ? ' (reconcile)' : ''}
                  </td>
                  <td className="mono" data-minutes={entry.delta_minutes}>
                    {entry.delta_minutes > 0 ? '+' : ''}
                    {minutesText(entry.delta_minutes)}
                  </td>
                  <td className="muted">{entry.reason ?? 'none'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="ot-export" role="group" aria-label="Evidence export">
        <label>
          From
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        {rangeOk ? (
          <a className="button-link" href={`/api/ot/evidence.csv?${query}`} download>
            Download evidence CSV
          </a>
        ) : (
          <p className="error" role="status">
            Choose a range of at most {EVIDENCE_MAX_DAYS} days, ending on or after its start.
          </p>
        )}
      </div>
    </section>
  );
}

export function OtScreen() {
  const [data, setData] = useState<OtData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await loadAll());
      setMessage(null);
    } catch (caught) {
      setMessage(describeError(caught));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Runs one action, then reloads everything from the server (also after a refusal, so a stale row refreshes). */
  const perform = useCallback(
    async (work: () => Promise<unknown>) => {
      setBusy(true);
      try {
        await work();
      } finally {
        await reload();
        setBusy(false);
      }
    },
    [reload],
  );

  const actions: LeaveActions = {
    recordUse: (request, minutes, useKey) =>
      perform(() =>
        api('POST', `/api/ot/leave/${request.id}/consume`, { use_key: useKey, minutes, expected_version: request.version }),
      ),
    cancel: (request, reason) =>
      perform(() =>
        api('POST', `/api/ot/leave/${request.id}/cancel`, {
          expected_version: request.version,
          ...(reason === '' ? {} : { reason }),
        }),
      ),
    reverse: (request, minutes, reason, reversalKey) =>
      perform(() =>
        api('POST', `/api/ot/leave/${request.id}/reverse`, {
          reversal_key: reversalKey,
          minutes,
          reason,
          expected_version: request.version,
        }),
      ),
  };

  if (data === null) {
    return message === null ? (
      <p className="muted">Loading…</p>
    ) : (
      <p className="error" role="alert">
        {message}
      </p>
    );
  }

  const warnings = mismatchDays(data.days);
  const todayLocal = data.periods.today_local;
  const reserve = (request: OtReserveRequest) => perform(() => api('POST', '/api/ot/leave', request));

  return (
    <div className="stack ot-screen">
      <h1>Overtime balance and leave</h1>
      {message !== null && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <Balances balance={data.summary} provisional={data.summary.provisional_minutes} />
      {warnings.length > 0 && (
        <section className="warn-box stack" aria-label="Leave label mismatch" data-warning="mismatch">
          <h2>Day label and recorded use differ</h2>
          <ul className="plain">
            {warnings.map((day) => (
              <li key={day.work_date} data-mismatch-date={day.work_date}>
                {mismatchText(day)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <ReserveForm todayLocal={todayLocal} onReserve={reserve} />
      <section className="stack" aria-label="OT leave requests">
        <h2>Leave requests</h2>
        {data.leave.length === 0 ? (
          <p className="muted">No OT leave has been reserved. Reserve leave above once your manager has given permission.</p>
        ) : (
          <ul className="plain ot-leave-list">
            {data.leave.map((request) => (
              <LeaveRow key={request.id} request={request} todayLocal={todayLocal} busy={busy} actions={actions} />
            ))}
          </ul>
        )}
      </section>
      <EvidencePanel data={data} />
    </div>
  );
}
