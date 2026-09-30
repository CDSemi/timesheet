import { describe, expect, it } from 'vitest';
import { computeDailyOvertime } from '../../src/domain/overtime.ts';
import { type OvertimeRule, validateOvertimeRule } from '../../src/domain/policy.ts';
import { expectDomainError, loadFixture, type OvertimeFixtureFile, type OvertimePolicyFixture } from '../support/fixtures.ts';

const fixture = loadFixture<OvertimeFixtureFile>('overtime_cases.json');

function rule(policy: OvertimePolicyFixture): OvertimeRule {
  return {
    requiredMinutes: policy.required_minutes,
    thresholdMinutes: policy.threshold_minutes,
    roundingStepMinutes: policy.rounding_step_minutes,
  };
}

describe('fixtures/overtime_cases.json (R-04)', () => {
  it('contains the 33 named scenarios and the documented default comparison/rounding modes', () => {
    const total =
      fixture.cases.length + fixture.daily_separation_cases.length + fixture.invalid_policy_cases.length;
    expect(total).toBe(33);
    expect(fixture.default_policy.threshold_comparison).toBe('strictly_greater');
    expect(fixture.default_policy.rounding_mode).toBe('nearest_midpoint_down');
  });

  for (const testCase of fixture.cases) {
    it(`${testCase.id}: R=${testCase.input.regular_minutes} O=${testCase.input.nonworking_minutes}`, () => {
      const policy = rule({ ...fixture.default_policy, ...testCase.input.policy_override });
      expect(computeDailyOvertime(testCase.input.regular_minutes, testCase.input.nonworking_minutes, policy)).toEqual({
        normalExcessMinutes: testCase.expected.normal_excess_minutes,
        eligibleMinutes: testCase.expected.eligible_minutes,
        creditedMinutes: testCase.expected.credited_minutes,
      });
    });
  }

  for (const testCase of fixture.daily_separation_cases) {
    it(`${testCase.id}: each work date is rounded alone, never netted across days`, () => {
      const policy = rule(fixture.default_policy);
      const daily = testCase.days.map(
        (day) => computeDailyOvertime(day.regular_minutes, day.nonworking_minutes, policy).creditedMinutes,
      );
      expect(daily).toEqual(testCase.expected.daily_credited_minutes);
      expect(daily.reduce((sum, value) => sum + value, 0)).toBe(testCase.expected.period_credited_minutes);
    });
  }

  for (const testCase of fixture.invalid_policy_cases) {
    it(`${testCase.id}: rejects ${testCase.expected_error}`, () => {
      expectDomainError(() => validateOvertimeRule(rule(testCase.input)), testCase.expected_error);
      expectDomainError(() => computeDailyOvertime(480, 0, rule(testCase.input)), testCase.expected_error);
    });
  }
});
