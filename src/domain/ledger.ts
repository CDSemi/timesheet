import { DomainError } from './errors.ts';
import { assertWholeMinutes } from './overtime.ts';

/*
 * R-06 OT ledger arithmetic, pure and storage-free. The ledger is a list of signed
 * integer deltas: posted = sum(deltas); available = posted − active reservations. A
 * posted value is corrected by its difference (new − old), so history is never
 * rewritten. A truthful correction may make the balance negative; it is kept and
 * flagged for reconciliation rather than hidden (LG-08). New debits never overdraw
 * silently (R-05): they need available ≥ debit.
 */

export interface LedgerBalance {
  /** Sum of all posted signed deltas. */
  postedMinutes: number;
  /** Minutes held by active (approved, not yet consumed or released) reservations. */
  reservedMinutes: number;
  /** postedMinutes − reservedMinutes; what a new reservation or debit may use. */
  availableMinutes: number;
  /** The posted balance is below zero. */
  negative: boolean;
  /** Posted or available is below zero: a person must reconcile the balance. */
  reconciliationRequired: boolean;
}

function assertSignedMinutes(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new DomainError('invalid_minutes', `${field} must be a whole number of minutes`, { field });
  }
}

function assertPositiveMinutes(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new DomainError('invalid_minutes', `${field} must be a positive whole number of minutes`, { field });
  }
}

function safeSum(values: readonly number[], field: string): number {
  let total = 0;
  for (const value of values) {
    total += value;
    assertSignedMinutes(total, field);
  }
  return total;
}

/** posted = sum(signed deltas); an empty ledger is zero. */
export function postedBalance(deltas: readonly number[]): number {
  deltas.forEach((delta) => assertSignedMinutes(delta, 'deltaMinutes'));
  return safeSum(deltas, 'postedMinutes');
}

/** Total of active reservations; each reservation is a non-negative magnitude. */
export function reservedBalance(reservations: readonly number[]): number {
  reservations.forEach((minutes) => assertWholeMinutes(minutes, 'reservedMinutes'));
  return safeSum(reservations, 'reservedMinutes');
}

/** available = posted − active reservations. */
export function availableBalance(postedMinutes: number, reservedMinutes: number): number {
  assertSignedMinutes(postedMinutes, 'postedMinutes');
  assertWholeMinutes(reservedMinutes, 'reservedMinutes');
  return postedMinutes - reservedMinutes;
}

export function summarizeBalance(deltas: readonly number[], reservations: readonly number[]): LedgerBalance {
  const postedMinutes = postedBalance(deltas);
  const reservedMinutes = reservedBalance(reservations);
  const availableMinutes = availableBalance(postedMinutes, reservedMinutes);
  return {
    postedMinutes,
    reservedMinutes,
    availableMinutes,
    negative: postedMinutes < 0,
    reconciliationRequired: postedMinutes < 0 || availableMinutes < 0,
  };
}

/**
 * Delta that corrects a posted magnitude: new − old (old 60 → new 90 posts +30). Both
 * values are non-negative magnitudes of the same kind; zero means nothing to post.
 */
export function correctionDelta(previousMinutes: number, correctedMinutes: number): number {
  assertWholeMinutes(previousMinutes, 'previousMinutes');
  assertWholeMinutes(correctedMinutes, 'correctedMinutes');
  return correctedMinutes - previousMinutes;
}

/** A new debit posts only when the available balance covers it (R-05: no silent overdraft). */
export function canDebit(availableMinutes: number, debitMinutes: number): boolean {
  assertSignedMinutes(availableMinutes, 'availableMinutes');
  assertPositiveMinutes(debitMinutes, 'debitMinutes');
  return availableMinutes >= debitMinutes;
}

/*
 * R-06 OT leave lifecycle (owner decisions E-2/E-3). An approved leave request reserves
 * its approved minutes. Only an explicit "record use" moves reserved minutes to consumed
 * (a negative ledger delta); partial use keeps the remainder reserved. Cancel releases
 * the unused reserved minutes. A reversal gives already used minutes back with a
 * compensating positive delta. Counters only move forward and always satisfy
 * approved = reserved + consumed + released and reversed <= consumed.
 */

/** Longest leave on one date, in minutes (one civil day). */
export const MAX_LEAVE_MINUTES = 1440;

export interface LeaveCounters {
  approvedMinutes: number;
  /** Still held against the available balance. */
  reservedMinutes: number;
  /** Used through "record use"; posted as negative ledger deltas. */
  consumedMinutes: number;
  /** Given back unused by a cancellation. */
  releasedMinutes: number;
  /** Consumed minutes given back by compensating positive deltas. */
  reversedMinutes: number;
}

export type LeavePlan =
  | { ok: true; counters: LeaveCounters; deltaMinutes: number }
  | { ok: false; reason: 'exceeds_reserved' | 'exceeds_reversible'; limitMinutes: number };

function assertLeaveMinutes(value: unknown, field: string): asserts value is number {
  assertPositiveMinutes(value, field);
  if (value > MAX_LEAVE_MINUTES) {
    throw new DomainError('invalid_minutes', `${field} must be at most ${MAX_LEAVE_MINUTES} minutes`, { field });
  }
}

function assertLeaveCounters(counters: LeaveCounters): void {
  assertLeaveMinutes(counters.approvedMinutes, 'approvedMinutes');
  assertWholeMinutes(counters.reservedMinutes, 'reservedMinutes');
  assertWholeMinutes(counters.consumedMinutes, 'consumedMinutes');
  assertWholeMinutes(counters.releasedMinutes, 'releasedMinutes');
  assertWholeMinutes(counters.reversedMinutes, 'reversedMinutes');
  if (counters.reservedMinutes + counters.consumedMinutes + counters.releasedMinutes !== counters.approvedMinutes) {
    throw new DomainError('invalid_minutes', 'Leave counters must satisfy approved = reserved + consumed + released');
  }
  if (counters.reversedMinutes > counters.consumedMinutes) {
    throw new DomainError('invalid_minutes', 'Reversed leave minutes cannot exceed consumed minutes');
  }
}

/** OT leave converts 1:1: leave minutes cost the same OT minutes (eight hours = 480, not 510). */
export function otLeaveCostMinutes(leaveMinutes: number): number {
  assertLeaveMinutes(leaveMinutes, 'leaveMinutes');
  return leaveMinutes;
}

/** A reservation is accepted only when the available balance covers it (E-5: never overdrawn). */
export function canReserve(availableMinutes: number, minutes: number): boolean {
  assertSignedMinutes(availableMinutes, 'availableMinutes');
  assertPositiveMinutes(minutes, 'minutes');
  return availableMinutes >= minutes;
}

/** An approved request starts with all approved minutes reserved. */
export function openLeaveCounters(approvedMinutes: number): LeaveCounters {
  assertLeaveMinutes(approvedMinutes, 'approvedMinutes');
  return { approvedMinutes, reservedMinutes: approvedMinutes, consumedMinutes: 0, releasedMinutes: 0, reversedMinutes: 0 };
}

/** "Record use" of `minutes` reserved minutes: posts −minutes; the remainder stays reserved. */
export function planLeaveUse(counters: LeaveCounters, minutes: number): LeavePlan {
  assertLeaveCounters(counters);
  assertPositiveMinutes(minutes, 'minutes');
  if (minutes > counters.reservedMinutes) {
    return { ok: false, reason: 'exceeds_reserved', limitMinutes: counters.reservedMinutes };
  }
  return {
    ok: true,
    deltaMinutes: -otLeaveCostMinutes(minutes),
    counters: {
      ...counters,
      reservedMinutes: counters.reservedMinutes - minutes,
      consumedMinutes: counters.consumedMinutes + minutes,
    },
  };
}

/** Cancel releases every still-reserved minute; consumed minutes are unaffected. */
export function planLeaveCancel(counters: LeaveCounters): { counters: LeaveCounters; releasedMinutes: number } {
  assertLeaveCounters(counters);
  const releasedMinutes = counters.reservedMinutes;
  return {
    releasedMinutes,
    counters: { ...counters, reservedMinutes: 0, releasedMinutes: counters.releasedMinutes + releasedMinutes },
  };
}

/** Reversal gives back up to consumed − reversed used minutes with a compensating +delta. */
export function planLeaveReversal(counters: LeaveCounters, minutes: number): LeavePlan {
  assertLeaveCounters(counters);
  assertPositiveMinutes(minutes, 'minutes');
  const reversible = counters.consumedMinutes - counters.reversedMinutes;
  if (minutes > reversible) return { ok: false, reason: 'exceeds_reversible', limitMinutes: reversible };
  return {
    ok: true,
    deltaMinutes: otLeaveCostMinutes(minutes),
    counters: { ...counters, reversedMinutes: counters.reversedMinutes + minutes },
  };
}
