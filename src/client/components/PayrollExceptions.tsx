import { type SubmitEvent, useState } from 'react';
import { api, type CalendarInfo, type PayrollExceptionRequest } from '../api.ts';
import { type CalendarOption, refusalMessage } from './adminModel.ts';

/**
 * Payroll exception (FR-13, E-10): one changed payroll date, with a required reason. The server
 * refreshes an unfinalized stored period and refuses a finalized one; its answer is shown as is.
 */
export function PayrollExceptions({
  calendars,
  exceptions,
  onCreated,
}: {
  calendars: CalendarOption[];
  exceptions: CalendarInfo['payroll_exceptions'];
  onCreated: () => Promise<void>;
}) {
  const [calendarId, setCalendarId] = useState(calendars[0]?.id ?? '');
  const [nominal, setNominal] = useState('');
  const [payrollDate, setPayrollDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = calendarId !== '' && nominal !== '' && payrollDate !== '' && reason.trim() !== '';

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    setDone(null);
    const request: PayrollExceptionRequest = {
      calendar_id: calendarId,
      nominal_payroll_date: nominal,
      payroll_date: payrollDate,
      due_local_date: dueDate === '' ? null : dueDate,
      due_local_time: dueTime === '' ? null : dueTime,
      reason: reason.trim(),
    };
    try {
      await api('POST', '/api/admin/payroll-exceptions', request);
      setDone(`Exception recorded: the payroll of ${nominal} is paid on ${payrollDate}.`);
      setReason('');
      setNominal('');
      setPayrollDate('');
      setDueDate('');
      setDueTime('');
      await onCreated();
    } catch (caught) {
      setError(refusalMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" aria-label="Payroll exception" onSubmit={submit}>
      <h2>Payroll exception</h2>
      <p className="hint muted">Use it when a payroll date moves, for example around a closure. The reason is kept in the history.</p>
      <div className="field-grid">
        <label>
          Calendar
          <select value={calendarId} onChange={(event) => setCalendarId(event.target.value)}>
            {calendars.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Scheduled payroll date
          <input type="date" value={nominal} onChange={(event) => setNominal(event.target.value)} required />
        </label>
        <label>
          Actual payroll date
          <input type="date" value={payrollDate} onChange={(event) => setPayrollDate(event.target.value)} required />
        </label>
        <label>
          Due date (optional)
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label>
          Due time (optional)
          <input type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} />
        </label>
      </div>
      <label>
        Reason (required)
        <input value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} required />
      </label>
      {error !== null && (
        <p className="error" role="alert" data-error="payroll-exception">
          {error}
        </p>
      )}
      {done !== null && (
        <p className="notice-ok" role="status" data-status="payroll-exception-created">
          {done}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={!valid || busy}>
          Record exception
        </button>
      </div>
      {exceptions.length > 0 && (
        <ul className="plain" aria-label="Recorded payroll exceptions">
          {exceptions.map((item) => (
            <li key={item.nominal_payroll_date} className="ot-line" data-exception={item.nominal_payroll_date}>
              <span className="mono">{item.nominal_payroll_date}</span>
              <span>paid on {item.payroll_date}</span>
              {item.due_local_date !== null && (
                <span className="muted">
                  due {item.due_local_date} {item.due_local_time ?? ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
