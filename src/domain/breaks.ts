import type { EpochSeconds } from './instants.ts';
import type { BreakInterval } from './intervals.ts';
import type { BreakRule } from './policy.ts';

/*
 * R-02 flexible arrival. Suggested breaks shift with the first clock-in and stay
 * unconfirmed until the user confirms actual breaks or none; suggestions are never
 * deducted on their own.
 */

export function suggestBreaks(firstClockInUtc: EpochSeconds, rules: readonly BreakRule[]): BreakInterval[] {
  return rules.map((rule) => ({
    startUtc: firstClockInUtc + rule.startOffsetMinutes * 60,
    endUtc: firstClockInUtc + (rule.startOffsetMinutes + rule.durationMinutes) * 60,
    countsAsWork: rule.countsAsWork,
    confirmed: false,
  }));
}

/** Expected finish = actual start + required work + excluded breaks/interruptions. */
export function expectedFinishUtc(
  startUtc: EpochSeconds,
  requiredMinutes: number,
  excludedBreakMinutes: number,
): EpochSeconds {
  return startUtc + (requiredMinutes + excludedBreakMinutes) * 60;
}
