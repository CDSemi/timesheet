import { DomainError } from './errors.ts';
import { type OvertimeRule, validateOvertimeRule } from './policy.ts';

/*
 * R-04 daily formula. N activates weekday eligibility (it is not deducted); all
 * off-calendar minutes are eligible without B or N; the total is rounded once per
 * work date to the nearest multiple of M with an exact midpoint rounding down.
 */

export interface DailyOvertime {
  /** E = max(0, R − B). */
  normalExcessMinutes: number;
  /** T = A + O, before rounding. */
  eligibleMinutes: number;
  /** Provisional credit until finalization. */
  creditedMinutes: number;
}

export function assertWholeMinutes(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new DomainError('invalid_minutes', `${field} must be a non-negative whole number of minutes`, { field });
  }
}

/**
 * Nearest multiple of `step`; an exact midpoint rounds down. With q = floor(T/M),
 * r = T mod M: credit = M × (q + 1 if 2r > M else q). Integer-only, unlike Math.round.
 */
export function roundToStepMidpointDown(totalMinutes: number, stepMinutes: number): number {
  assertWholeMinutes(totalMinutes, 'totalMinutes');
  if (!Number.isSafeInteger(stepMinutes) || stepMinutes < 1) {
    throw new DomainError('invalid_rounding_step', 'Rounding step must be a positive whole number of minutes');
  }
  const quotient = Math.floor(totalMinutes / stepMinutes);
  const remainder = totalMinutes - quotient * stepMinutes;
  return stepMinutes * (2 * remainder > stepMinutes ? quotient + 1 : quotient);
}

export function computeDailyOvertime(
  regularMinutes: number,
  nonworkingMinutes: number,
  rule: OvertimeRule,
): DailyOvertime {
  validateOvertimeRule(rule);
  assertWholeMinutes(regularMinutes, 'regularMinutes');
  assertWholeMinutes(nonworkingMinutes, 'nonworkingMinutes');
  const normalExcessMinutes = Math.max(0, regularMinutes - rule.requiredMinutes);
  const activatedMinutes = normalExcessMinutes > rule.thresholdMinutes ? normalExcessMinutes : 0;
  const eligibleMinutes = activatedMinutes + nonworkingMinutes;
  return {
    normalExcessMinutes,
    eligibleMinutes,
    creditedMinutes: roundToStepMidpointDown(eligibleMinutes, rule.roundingStepMinutes),
  };
}
