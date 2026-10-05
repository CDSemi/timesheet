import { useEffect, useState } from 'react';
import { api, type DeliveryAttempt, type FinalizationResponse } from '../api.ts';
import { deliveryStatus, type DeliveryStatus, periodStatus, type PeriodStatus, reviewHash, reviewLinkLabel, type Tone } from './reviewModel.ts';

/** What the server says about the finalization and the email of one period. */
export interface PeriodState {
  finalization: FinalizationResponse;
  attempts: DeliveryAttempt[];
}

/** Loads the finalization state and, once a revision exists, its delivery attempts. Read-only. */
export async function loadPeriodState(payrollDate: string): Promise<PeriodState> {
  const finalization = await api<FinalizationResponse>('GET', `/api/timesheets/${payrollDate}/finalization`);
  if (finalization.revision === null) return { finalization, attempts: [] };
  const deliveries = await api<{ deliveries: DeliveryAttempt[] }>('GET', `/api/deliveries?revision_id=${finalization.revision.id}`);
  return { finalization, attempts: deliveries.deliveries };
}

/**
 * The period state for a payroll date, read again whenever `refreshKey` changes (the timesheet
 * version, so an edit or a sign-off updates the badges). null while loading or when the server
 * could not be asked; the caller then shows its own fallback.
 */
export function usePeriodState(payrollDate: string, refreshKey: unknown, enabled = true): PeriodState | null {
  const [state, setState] = useState<{ payrollDate: string; value: PeriodState } | null>(null);

  useEffect(() => {
    // The finalization and delivery routes are the caller's own: a shared view never asks them.
    if (!enabled) return;
    let current = true;
    loadPeriodState(payrollDate)
      .then((value) => {
        if (current) setState({ payrollDate, value });
      })
      .catch(() => {
        if (current) setState(null);
      });
    return () => {
      current = false;
    };
  }, [payrollDate, refreshKey, enabled]);

  return enabled && state !== null && state.payrollDate === payrollDate ? state.value : null;
}

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

function StatusBadge({ status, name }: { status: PeriodStatus | DeliveryStatus; name: string }) {
  return (
    <span className={`badge ${TONE_CLASS[status.tone]}`} data-status={name} data-status-key={status.key}>
      {status.text}
    </span>
  );
}

/** Review and delivery state of a period as two badges, from server fields only. */
export function ReviewBadges({ state, fallback }: { state: PeriodState | null; fallback: string }) {
  if (state === null) return <span className="badge">{fallback}</span>;
  const period = periodStatus(state.finalization);
  const delivery = deliveryStatus(state.finalization.revision, state.finalization.jobs, state.attempts);
  return (
    <>
      <StatusBadge status={period} name="review" />
      {delivery !== null && <StatusBadge status={delivery} name="delivery" />}
    </>
  );
}

/** The link from the timesheet to the review of a period; the wording follows the period state. */
export function ReviewLink({ payrollDate, state }: { payrollDate: string; state: PeriodState | null }) {
  const label = reviewLinkLabel(state === null ? null : periodStatus(state.finalization));
  return (
    <a className="button-link" href={reviewHash(payrollDate)} data-review-link={payrollDate}>
      {label}
    </a>
  );
}
