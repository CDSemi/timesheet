import { DomainError } from './errors.ts';

/*
 * Work-policy rules (R-02/R-04). Versions are effective-dated by the caller; this
 * module only validates the rule values and their internal consistency.
 */

export type DeficitMode = 'ignore' | 'auto_deduct' | 'choose_at_signoff';
export const DEFICIT_MODES: readonly DeficitMode[] = ['ignore', 'auto_deduct', 'choose_at_signoff'];

/** B, N and M in integer minutes. */
export interface OvertimeRule {
  requiredMinutes: number;
  thresholdMinutes: number;
  roundingStepMinutes: number;
}

/** A break placed relative to the first clock-in (default suggestions shift with arrival). */
export interface BreakRule {
  startOffsetMinutes: number;
  durationMinutes: number;
  countsAsWork: boolean;
}

export interface WorkPolicyRules extends OvertimeRule {
  /** Reference clock times `HH:MM`; they describe the schedule but never create OT/deficit alone. */
  referenceStart: string;
  referenceEnd: string;
  breaks: readonly BreakRule[];
  deficitMode: DeficitMode;
}

const MINUTES_PER_DAY = 1440;
const CLOCK_PATTERN = /^(\d{2}):(\d{2})$/;

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

/** B > 0, N >= 0, M >= 1, all whole minutes (bounded by one day). */
export function validateOvertimeRule(rule: OvertimeRule): void {
  if (!isIntegerBetween(rule.requiredMinutes, 1, MINUTES_PER_DAY)) {
    throw new DomainError('invalid_required_minutes', 'Required minutes must be a whole number from 1 to 1440');
  }
  if (!isIntegerBetween(rule.thresholdMinutes, 0, MINUTES_PER_DAY)) {
    throw new DomainError('invalid_threshold_minutes', 'Threshold minutes must be a whole number from 0 to 1440');
  }
  if (!isIntegerBetween(rule.roundingStepMinutes, 1, MINUTES_PER_DAY)) {
    throw new DomainError('invalid_rounding_step', 'Rounding step must be a whole number of minutes from 1 to 1440');
  }
}

/** Minutes after midnight for `HH:MM`. */
export function parseClockTime(value: unknown, field = 'time'): number {
  const match = typeof value === 'string' ? CLOCK_PATTERN.exec(value) : null;
  const hours = Number(match?.[1]);
  const minutes = Number(match?.[2]);
  if (!match || hours > 23 || minutes > 59) {
    throw new DomainError('invalid_clock_time', `${field} must be a clock time HH:MM`, { field });
  }
  return hours * 60 + minutes;
}

/** Reference span in minutes; an end at or before the start wraps past midnight. */
export function referenceDurationMinutes(referenceStart: string, referenceEnd: string): number {
  const start = parseClockTime(referenceStart, 'referenceStart');
  const end = parseClockTime(referenceEnd, 'referenceEnd');
  const span = end - start;
  return span > 0 ? span : span + MINUTES_PER_DAY;
}

export function excludedBreakMinutes(breaks: readonly BreakRule[]): number {
  return breaks.reduce((total, rule) => total + (rule.countsAsWork ? 0 : rule.durationMinutes), 0);
}

/**
 * Validates B/N/M, deficit mode, break placement and the R-02 consistency rule:
 * reference duration = required minutes + excluded break minutes.
 */
export function validateWorkPolicyRules(policy: WorkPolicyRules): void {
  validateOvertimeRule(policy);
  if (!DEFICIT_MODES.includes(policy.deficitMode)) {
    throw new DomainError('invalid_deficit_mode', `Deficit mode must be one of ${DEFICIT_MODES.join(', ')}`);
  }
  const referenceMinutes = referenceDurationMinutes(policy.referenceStart, policy.referenceEnd);
  const sorted = [...policy.breaks].sort((a, b) => a.startOffsetMinutes - b.startOffsetMinutes);
  let previousEnd = 0;
  for (const rule of sorted) {
    if (
      !isIntegerBetween(rule.startOffsetMinutes, 0, MINUTES_PER_DAY) ||
      !isIntegerBetween(rule.durationMinutes, 1, MINUTES_PER_DAY) ||
      typeof rule.countsAsWork !== 'boolean'
    ) {
      throw new DomainError('invalid_break_rule', 'Break offsets/durations must be whole minutes; countsAsWork a boolean');
    }
    if (rule.startOffsetMinutes < previousEnd) {
      throw new DomainError('overlapping_break_rules', 'Configured breaks must not overlap');
    }
    if (rule.startOffsetMinutes + rule.durationMinutes > referenceMinutes) {
      throw new DomainError('break_rule_outside_reference', 'Configured breaks must fit inside the reference schedule');
    }
    previousEnd = rule.startOffsetMinutes + rule.durationMinutes;
  }
  const excluded = excludedBreakMinutes(sorted);
  if (referenceMinutes !== policy.requiredMinutes + excluded) {
    throw new DomainError(
      'inconsistent_reference_schedule',
      `Reference ${policy.referenceStart}–${policy.referenceEnd} (${referenceMinutes} min) must equal required ` +
        `${policy.requiredMinutes} min plus excluded breaks ${excluded} min`,
      { referenceMinutes, requiredMinutes: policy.requiredMinutes, excludedBreakMinutes: excluded },
    );
  }
}
