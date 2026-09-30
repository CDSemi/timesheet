import { DomainError } from './errors.ts';
import { assertWholeMinutes } from './overtime.ts';
import type { DeficitMode } from './policy.ts';

/*
 * R-05 deficits. Only complete confirmed work on a normal work date with attendance
 * expected can create a deficit: required = max(0, B − min(L, B)),
 * deficit = max(0, required − (R + O)). Debits are exact minutes (no N/M) and are
 * decided at finalization; this module is pure and posts nothing.
 */

export type DeficitDecision =
  | 'not_applicable'
  | 'incomplete'
  | 'ignored'
  | 'authorized'
  | 'declined'
  | 'pending'
  | 'insufficient_balance';

export interface DeficitInput {
  requiredMinutes: number;
  regularMinutes: number | null;
  nonworkingMinutes: number | null;
  /** Attendance-fulfilling leave on that date, capped at B. */
  leaveMinutes: number;
  normalWorkDate: boolean;
  attendanceExpected: boolean;
  recordsComplete: boolean;
}

/** Deficit minutes: 0 when not applicable, null when records are incomplete (unknown). */
export function computeDeficitMinutes(input: DeficitInput): number | null {
  assertWholeMinutes(input.requiredMinutes, 'requiredMinutes');
  assertWholeMinutes(input.leaveMinutes, 'leaveMinutes');
  if (!input.normalWorkDate || !input.attendanceExpected) return 0;
  if (!input.recordsComplete || input.regularMinutes === null || input.nonworkingMinutes === null) return null;
  assertWholeMinutes(input.regularMinutes, 'regularMinutes');
  assertWholeMinutes(input.nonworkingMinutes, 'nonworkingMinutes');
  const required = Math.max(0, input.requiredMinutes - Math.min(input.leaveMinutes, input.requiredMinutes));
  return Math.max(0, required - (input.regularMinutes + input.nonworkingMinutes));
}

export interface DeficitDecisionInput extends DeficitInput {
  mode: DeficitMode;
  /** Explicit choice made during manual review in `choose_at_signoff` mode. */
  manualChoice?: 'deduct' | 'ignore' | null;
  finalizationOrigin: 'manual' | 'automatic';
  /** Available OT balance (posted minus active reservations). */
  availableMinutes: number;
}

export interface DeficitOutcome {
  deficitMinutes: number | null;
  /** Positive magnitude; a later ledger posts it as a negative delta. */
  debitMinutes: number;
  decision: DeficitDecision;
}

export function decideDeficit(input: DeficitDecisionInput): DeficitOutcome {
  const deficitMinutes = computeDeficitMinutes(input);
  if (deficitMinutes === null) return { deficitMinutes, debitMinutes: 0, decision: 'incomplete' };
  if (deficitMinutes === 0) return { deficitMinutes, debitMinutes: 0, decision: 'not_applicable' };
  if (!Number.isSafeInteger(input.availableMinutes)) {
    throw new DomainError('invalid_minutes', 'availableMinutes must be whole minutes');
  }
  const authorize = (): DeficitOutcome =>
    input.availableMinutes >= deficitMinutes
      ? { deficitMinutes, debitMinutes: deficitMinutes, decision: 'authorized' }
      : { deficitMinutes, debitMinutes: 0, decision: 'insufficient_balance' };
  switch (input.mode) {
    case 'ignore':
      return { deficitMinutes, debitMinutes: 0, decision: 'ignored' };
    case 'auto_deduct':
      return authorize();
    case 'choose_at_signoff':
      if (input.finalizationOrigin === 'automatic') return { deficitMinutes, debitMinutes: 0, decision: 'pending' };
      if (input.manualChoice === 'deduct') return authorize();
      if (input.manualChoice === 'ignore') return { deficitMinutes, debitMinutes: 0, decision: 'declined' };
      return { deficitMinutes, debitMinutes: 0, decision: 'pending' };
  }
}
