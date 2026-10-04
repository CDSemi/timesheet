import { type SubmitEvent, useState } from 'react';
import type { OtReserveRequest } from '../api.ts';
import { describeError } from './errors.ts';
import { insufficientBalanceMessage, parseMinutes } from './otModel.ts';
import { useAttemptKey } from './useAttemptKey.ts';

/**
 * Records the manager permission (E-7: a text reference until the WP3 file store) and reserves
 * the minutes. The request key is kept across retries of the same values, so a lost response
 * cannot reserve twice. Insufficient balance (E-5) is refused by the server and shown in words.
 */
export function ReserveForm({
  todayLocal,
  onReserve,
}: {
  todayLocal: string;
  onReserve: (request: OtReserveRequest) => Promise<void>;
}) {
  const [leaveDate, setLeaveDate] = useState(todayLocal);
  const [minutes, setMinutes] = useState('480');
  const [approver, setApprover] = useState('');
  const [approvalDate, setApprovalDate] = useState(todayLocal);
  const [evidence, setEvidence] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = useAttemptKey();

  const requested = parseMinutes(minutes);
  const valid = requested !== null && approver.trim() !== '' && evidence.trim() !== '' && leaveDate !== '' && approvalDate !== '';

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requested === null || busy) return;
    setBusy(true);
    setError(null);
    const signature = JSON.stringify([leaveDate, requested, approver, approvalDate, evidence, note]);
    try {
      await onReserve({
        request_key: key.keyFor(signature),
        leave_date: leaveDate,
        requested_minutes: requested,
        permission: { approver_name: approver.trim(), approval_date: approvalDate, evidence_ref: evidence.trim() },
        ...(note.trim() === '' ? {} : { note: note.trim() }),
      });
      key.settle();
      setEvidence('');
      setNote('');
    } catch (caught) {
      setError(insufficientBalanceMessage(caught) ?? describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" aria-label="Reserve OT leave" onSubmit={submit}>
      <h2>Reserve OT leave</h2>
      <div className="field-grid">
        <label>
          Leave date
          <input type="date" value={leaveDate} onChange={(event) => setLeaveDate(event.target.value)} required />
        </label>
        <label>
          Minutes of leave
          <input inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} required />
        </label>
        <label>
          Manager who gave permission
          <input value={approver} onChange={(event) => setApprover(event.target.value)} maxLength={200} required />
        </label>
        <label>
          Permission date
          <input type="date" value={approvalDate} onChange={(event) => setApprovalDate(event.target.value)} required />
        </label>
      </div>
      <label>
        Permission reference (text, for example a message or ticket)
        <input value={evidence} onChange={(event) => setEvidence(event.target.value)} maxLength={2000} required />
      </label>
      <label>
        Note (optional)
        <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} />
      </label>
      {error !== null && (
        <p className="error" role="alert" data-error="reserve">
          {error}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={!valid || busy}>
          Reserve leave
        </button>
      </div>
    </form>
  );
}
