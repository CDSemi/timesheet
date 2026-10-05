import type { ReviewSnapshot, SnapshotDeficitProposal } from '../../domain/snapshot.ts';
import { minutesText } from './format.ts';
import { type DeficitChoice, deficitDecisionText, dueReservations, unresolvedText } from './reviewModel.ts';

/**
 * What the review found beyond the plain days: OT proposals, deficits (a choice where the policy
 * asks for one), missing evidence, and OT-leave reservations that are due. Every figure is the
 * server's; the only inputs here are the employee's own choices.
 */

export function ReviewOtProposals({ payload }: { payload: ReviewSnapshot }) {
  return (
    <section className="card stack" aria-labelledby="review-ot-title">
      <h2 id="review-ot-title">OT proposals</h2>
      {payload.ot_proposals.length === 0 ? (
        <p className="muted">No complete day earns OT credit in this period.</p>
      ) : (
        <ul className="plain" aria-label="OT credit proposed per day">
          {payload.ot_proposals.map((item) => (
            <li key={item.work_date} className="review-line" data-ot-proposal={item.work_date}>
              <span className="mono">{item.work_date}</span>
              <span data-minutes={item.credited_minutes}>{minutesText(item.credited_minutes)} credit</span>
              <span className="muted">from {minutesText(item.eligible_minutes)} eligible</span>
            </li>
          ))}
        </ul>
      )}
      <p className="muted hint">Credits post to the OT ledger only when you sign off. Days with missing evidence stay pending and post nothing.</p>
    </section>
  );
}

export function ReviewDeficits({
  proposals,
  choices,
  onChoose,
  error,
}: {
  proposals: readonly SnapshotDeficitProposal[];
  choices: Readonly<Record<string, DeficitChoice>>;
  onChoose: (workDate: string, choice: DeficitChoice) => void;
  error: string | null;
}) {
  if (proposals.length === 0) return null;
  return (
    <section className="card stack" aria-labelledby="review-deficit-title" id="review-field-deficit_choices" tabIndex={-1}>
      <h2 id="review-deficit-title">Deficit days</h2>
      <ul className="plain review-deficits">
        {proposals.map((item) => (
          <li key={item.work_date} className="review-deficit" data-deficit={item.work_date}>
            <div className="review-line">
              <span className="mono">{item.work_date}</span>
              <span data-minutes={item.deficit_minutes}>{minutesText(item.deficit_minutes)} short</span>
              <span className="muted">OT balance then {minutesText(item.available_minutes_before)}</span>
            </div>
            {item.mode === 'choose_at_signoff' ? (
              <fieldset className="mode-list choice-set" aria-describedby={error === null ? undefined : 'review-error-deficit_choices'}>
                <legend>Deficit of {item.work_date}</legend>
                <label className="inline">
                  <input
                    type="radio"
                    name={`deficit-${item.work_date}`}
                    checked={choices[item.work_date] === 'deduct'}
                    onChange={() => onChoose(item.work_date, 'deduct')}
                  />
                  Deduct from my OT balance
                </label>
                <label className="inline">
                  <input
                    type="radio"
                    name={`deficit-${item.work_date}`}
                    checked={choices[item.work_date] === 'waive'}
                    onChange={() => onChoose(item.work_date, 'waive')}
                  />
                  Waive the deficit
                </label>
              </fieldset>
            ) : (
              <p className="muted">
                {deficitDecisionText(item)}
                {item.debit_minutes > 0 ? ` (${minutesText(item.debit_minutes)})` : ''}
              </p>
            )}
          </li>
        ))}
      </ul>
      {error !== null && (
        <p className="error" id="review-error-deficit_choices">
          {error}
        </p>
      )}
    </section>
  );
}

export function ReviewEvidence({
  payload,
  acknowledged,
  onAcknowledge,
  error,
}: {
  payload: ReviewSnapshot;
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
  error: string | null;
}) {
  if (payload.unresolved_inputs.length === 0) return null;
  return (
    <section className="card stack" aria-labelledby="review-evidence-title">
      <h2 id="review-evidence-title">Missing evidence</h2>
      <ul className="plain" aria-label="Unresolved inputs">
        {payload.unresolved_inputs.map((item) => (
          <li key={`${item.work_date}-${item.reason}`} className="review-line" data-unresolved={item.work_date}>
            <span className="mono">{item.work_date}</span>
            <span className="status status-pending">
              <span className="shape shape-diamond" aria-hidden="true" />
              {unresolvedText(item)}
            </span>
          </li>
        ))}
      </ul>
      <label className="inline">
        <input
          id="review-field-acknowledgement"
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => onAcknowledge(event.target.checked)}
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : 'review-error-acknowledgement'}
        />
        I acknowledge the incomplete evidence above. OT stays pending for those days and I submit my attendance anyway.
      </label>
      {error !== null && (
        <p className="error" id="review-error-acknowledgement">
          {error}
        </p>
      )}
    </section>
  );
}

export function ReviewReservations({ payload }: { payload: ReviewSnapshot }) {
  const due = dueReservations(payload);
  const others = payload.ot_leave_reservations.filter((item) => item.reserved_minutes > 0 && !item.use_due);
  if (due.length === 0 && others.length === 0) return null;
  return (
    <section className="card stack" aria-labelledby="review-reserved-title">
      <h2 id="review-reserved-title">Reserved OT leave</h2>
      <ul className="plain" aria-label="Unconsumed OT-leave reservations">
        {[...due, ...others].map((item) => (
          <li key={item.request_id} className="review-line" data-reservation={item.request_id}>
            <span className="mono">{item.leave_date}</span>
            <span data-minutes={item.reserved_minutes}>{minutesText(item.reserved_minutes)} reserved</span>
            {item.use_due ? (
              <span className="status status-pending">
                <span className="shape shape-diamond" aria-hidden="true" />
                Use is due: <a href="#/ot">record it on the OT screen</a>
              </span>
            ) : (
              <span className="muted">leave date not reached</span>
            )}
          </li>
        ))}
      </ul>
      <p className="muted hint">Signing off never spends or releases reserved OT. Only your own &quot;Record use&quot; action does.</p>
    </section>
  );
}
