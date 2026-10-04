import { useState } from 'react';
import type { OtLeaveRequest } from '../api.ts';
import { describeError, isStaleVersion } from './errors.ts';
import { minutesText } from './format.ts';
import { canCancel, canRecordUse, canReverse, parseMinutes, useHint } from './otModel.ts';
import { useAttemptKey } from './useAttemptKey.ts';

export interface LeaveActions {
  recordUse: (request: OtLeaveRequest, minutes: number, useKey: string) => Promise<void>;
  cancel: (request: OtLeaveRequest, reason: string) => Promise<void>;
  reverse: (request: OtLeaveRequest, minutes: number, reason: string, reversalKey: string) => Promise<void>;
}

function Counter({ label, minutes, name }: { label: string; minutes: number; name: string }) {
  return (
    <div data-counter={name}>
      <dt>{label}</dt>
      <dd data-minutes={minutes}>{minutesText(minutes)}</dd>
    </div>
  );
}

/**
 * One leave request: the permission record, the server's counters and the explicit actions.
 * Every action sends the version the row was loaded with; a stale version reloads the screen.
 */
export function LeaveRow({
  request,
  todayLocal,
  busy,
  actions,
}: {
  request: OtLeaveRequest;
  todayLocal: string;
  busy: boolean;
  actions: LeaveActions;
}) {
  const [useMinutes, setUseMinutes] = useState(String(request.reserved_minutes));
  const [reverseMinutes, setReverseMinutes] = useState(String(request.reversible_minutes));
  const [reverseReason, setReverseReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const useKey = useAttemptKey();
  const reverseKey = useAttemptKey();

  // A new version means the server's counters moved: offer fresh defaults for the next action.
  const [seenVersion, setSeenVersion] = useState(request.version);
  if (seenVersion !== request.version) {
    setSeenVersion(request.version);
    setUseMinutes(String(request.reserved_minutes));
    setReverseMinutes(String(request.reversible_minutes));
    setReverseReason('');
    setCancelReason('');
  }

  async function attempt(work: () => Promise<void>) {
    setError(null);
    try {
      await work();
    } catch (caught) {
      setError(isStaleVersion(caught) ? 'This request changed elsewhere. The list was reloaded; check it and try again.' : describeError(caught));
    }
  }

  const useValue = parseMinutes(useMinutes);
  const reverseValue = parseMinutes(reverseMinutes);
  const hint = useHint(request, todayLocal);

  return (
    <li className="ot-leave" data-leave-id={request.id} data-leave-date={request.leave_date}>
      <div className="ot-leave-head">
        <h3 className="mono">{request.leave_date}</h3>
        <span className="muted">
          Permission from {request.approver_name} on {request.approval_date}: {request.evidence_ref}
        </span>
      </div>
      <dl className="facts ot-counters">
        <Counter label="Approved" minutes={request.approved_minutes} name="approved" />
        <Counter label="Reserved" minutes={request.reserved_minutes} name="reserved" />
        <Counter label="Used" minutes={request.consumed_minutes} name="consumed" />
        <Counter label="Released" minutes={request.released_minutes} name="released" />
        <Counter label="Reversed" minutes={request.reversed_minutes} name="reversed" />
      </dl>
      <div className="ot-actions">
        {canRecordUse(request, todayLocal) && (
          <form
            key={`use-${request.version}`}
            className="ot-action"
            aria-label={`Record use for ${request.leave_date}`}
            onSubmit={(event) => {
              event.preventDefault();
              if (useValue === null || busy) return;
              void attempt(async () => {
                await actions.recordUse(request, useValue, useKey.keyFor(`${request.id}:${useValue}`));
                useKey.settle();
              });
            }}
          >
            <label>
              Minutes used
              <input inputMode="numeric" value={useMinutes} onChange={(event) => setUseMinutes(event.target.value)} />
            </label>
            <button type="submit" disabled={useValue === null || busy}>
              Record use
            </button>
          </form>
        )}
        {hint !== null && (
          <p className="hint" data-hint="use-later">
            {hint}
          </p>
        )}
        {canCancel(request) && (
          <form
            key={`cancel-${request.version}`}
            className="ot-action"
            aria-label={`Cancel remaining for ${request.leave_date}`}
            onSubmit={(event) => {
              event.preventDefault();
              if (busy) return;
              void attempt(() => actions.cancel(request, cancelReason.trim()));
            }}
          >
            <label>
              Reason (optional)
              <input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} maxLength={2000} />
            </label>
            <button type="submit" className="secondary" disabled={busy}>
              Cancel remaining
            </button>
          </form>
        )}
        {canReverse(request) && (
          <form
            key={`reverse-${request.version}`}
            className="ot-action"
            aria-label={`Reverse use for ${request.leave_date}`}
            onSubmit={(event) => {
              event.preventDefault();
              if (reverseValue === null || reverseReason.trim() === '' || busy) return;
              void attempt(async () => {
                await actions.reverse(request, reverseValue, reverseReason.trim(), reverseKey.keyFor(`${request.id}:${reverseValue}:${reverseReason}`));
                reverseKey.settle();
              });
            }}
          >
            <label>
              Minutes to give back
              <input inputMode="numeric" value={reverseMinutes} onChange={(event) => setReverseMinutes(event.target.value)} />
            </label>
            <label>
              Reason (required)
              <input value={reverseReason} onChange={(event) => setReverseReason(event.target.value)} maxLength={2000} />
            </label>
            <button type="submit" className="secondary" disabled={reverseValue === null || reverseReason.trim() === '' || busy}>
              Reverse use
            </button>
          </form>
        )}
      </div>
      {error !== null && (
        <p className="error" role="alert" data-error="leave">
          {error}
        </p>
      )}
    </li>
  );
}
