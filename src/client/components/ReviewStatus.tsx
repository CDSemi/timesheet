import { useEffect, useState } from 'react';
import { api, type DeliveryAttempt, type FinalizationResponse, type RevisionListItem } from '../api.ts';
import { reviewShortLabel } from './periodBarModel.ts';
import {
  deliveryStatus,
  type DeliveryStatus,
  periodEnded,
  periodHasSend,
  periodStatus,
  type PeriodStatus,
  reviewHash,
  type ReviewLinkView,
  reviewLinkView,
  type Tone,
} from './reviewModel.ts';

/** What the server says about the finalization and the email of one period. */
export interface PeriodState {
  finalization: FinalizationResponse;
  attempts: DeliveryAttempt[];
  /** True when an earlier revision of the period has a delivery attempt (owner decision H-1 a); read only for a corrected period. */
  earlierSend?: boolean;
}

/**
 * Loads the finalization state and, once a revision exists, its delivery attempts; for a revision after the first also whether an
 * earlier revision of the period was sent (the revision list's delivery state). Read-only. A revision list that cannot be read counts as
 * "an earlier send exists", so the review link stays the quiet one rather than pressing for a send that may already have gone out.
 */
export async function loadPeriodState(payrollDate: string): Promise<PeriodState> {
  const finalization = await api<FinalizationResponse>('GET', `/api/timesheets/${payrollDate}/finalization`);
  const revision = finalization.revision;
  if (revision === null) return { finalization, attempts: [] };
  const deliveries = await api<{ deliveries: DeliveryAttempt[] }>('GET', `/api/deliveries?revision_id=${revision.id}`);
  if (revision.revision_no <= 1) return { finalization, attempts: deliveries.deliveries };
  const earlierSend = await api<{ revisions: RevisionListItem[] }>('GET', '/api/revisions').then(
    (list) => list.revisions.some((item) => item.payroll_date === payrollDate && item.revision_no < revision.revision_no && item.delivery_state !== null),
    () => true,
  );
  return { finalization, attempts: deliveries.deliveries, earlierSend };
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

/**
 * One status pill with its words. `attr` is the data attribute that names it: the page's own chips use `data-status`; a second copy of
 * the same chips on one page (the Preview and Send card headers) uses another name, so each name still marks exactly one element.
 */
function StatusBadge({ status, name, attr }: { status: PeriodStatus | DeliveryStatus; name: string; attr: string }) {
  const marks = { [attr]: name, 'data-status-key': status.key };
  return (
    <span className={`badge ${TONE_CLASS[status.tone]}`} {...marks}>
      {status.text}
    </span>
  );
}

/** Review and delivery state of a period as two badges, from server fields only. */
export function ReviewBadges({ state, fallback, attr = 'data-status' }: { state: PeriodState | null; fallback: string; attr?: string }) {
  if (state === null) return <span className="badge">{fallback}</span>;
  const period = periodStatus(state.finalization);
  const delivery = deliveryStatus(state.finalization.revision, state.finalization.jobs, state.attempts);
  return (
    <>
      <StatusBadge status={period} name="review" attr={attr} />
      {delivery !== null && <StatusBadge status={delivery} name="delivery" attr={attr} />}
    </>
  );
}

/** The delivery state of the current revision as one badge (the Send card), or nothing for a period that has no revision. */
export function DeliveryBadge({ state, attr }: { state: PeriodState | null; attr: string }) {
  if (state === null) return null;
  const delivery = deliveryStatus(state.finalization.revision, state.finalization.jobs, state.attempts);
  return delivery === null ? null : <StatusBadge status={delivery} name="delivery" attr={attr} />;
}

/** The review link's words and weight for a period state: the one source of the period card's link and of the signature line's link. */
export function reviewLinkOf(state: PeriodState | null, periodEnd: string, todayLocal: string | null): ReviewLinkView {
  return reviewLinkView({
    status: state === null ? null : periodStatus(state.finalization),
    sendExists: state !== null && periodHasSend(state.finalization, state.attempts, state.earlierSend === true),
    ended: periodEnded(periodEnd, todayLocal),
  });
}

/**
 * The link from the timesheet to the review of a period; the wording and the style follow the period state (U5-14): the primary
 * button (`data-review-primary`) while the period is ended and still needs the person, else the quiet link.
 */
export function ReviewLink({ payrollDate, periodEnd, todayLocal, state }: { payrollDate: string; periodEnd: string; todayLocal: string | null; state: PeriodState | null }) {
  const { label, primary } = reviewLinkOf(state, periodEnd, todayLocal);
  // The text content is the full label. On a phone the style sheet may show `data-short` instead (a pseudo-element) when the full label
  // does not fit on one line; `aria-label` keeps the accessible name the full label either way (it contains the short text, SC 2.5.3).
  return (
    <a
      className={`button-link review-link${primary ? ' primary' : ''}`}
      href={reviewHash(payrollDate)}
      data-review-link={payrollDate}
      data-review-primary={primary ? 'true' : undefined}
      aria-label={label}
      {...reviewLabelAttributes(label)}
    >
      <span className="review-full">{label}</span>
    </a>
  );
}

/** The attributes the style sheet reads to pick the full or the short label: the short text, and whether the full label is a long one. */
export function reviewLabelAttributes(label: string): { 'data-short': string; 'data-label-size': 'long' | 'short' } {
  return { 'data-short': reviewShortLabel(label), 'data-label-size': label.length > REVIEW_LONG_LABEL ? 'long' : 'short' };
}

/** Labels longer than this many characters ("Review & sign off", "Review or correct") need the wider threshold; "Review now" the narrow one. */
const REVIEW_LONG_LABEL = 12;
