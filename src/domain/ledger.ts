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
