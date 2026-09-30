import { describe, expect, it } from 'vitest';
import { type DayCategory, isAttendanceExpected } from '../../src/domain/attendance.ts';
import { decideDeficit } from '../../src/domain/deficit.ts';
import { type DeficitFixtureInput, type LedgerFixtureFile, loadFixture } from '../support/fixtures.ts';

const fixture = loadFixture<LedgerFixtureFile>('ledger_cases.json');

// ledger_cases.json holds 16 deficit cases (pure R-05 decisions, WP1 engine) and 10
// ledger scenarios (transactional posting/reservations, WP2 services; not run here).
describe('fixtures/ledger_cases.json deficit_cases (R-05)', () => {
  it('contains 16 deficit cases and 10 ledger scenarios', () => {
    expect(fixture.deficit_cases).toHaveLength(16);
    expect(fixture.ledger_scenarios).toHaveLength(10);
  });

  for (const testCase of fixture.deficit_cases) {
    it(`${testCase.id}: ${testCase.input.mode} → ${testCase.expected.decision}`, () => {
      const input: DeficitFixtureInput = { ...fixture.deficit_defaults, ...testCase.input };
      const outcome = decideDeficit({
        requiredMinutes: input.required_minutes,
        regularMinutes: input.regular_minutes,
        nonworkingMinutes: input.regular_minutes === null ? null : input.nonworking_minutes,
        leaveMinutes: input.leave_minutes,
        normalWorkDate: input.normal_work_date,
        attendanceExpected: input.attendance_expected,
        recordsComplete: input.records_complete,
        mode: input.mode,
        manualChoice: input.manual_choice ?? null,
        finalizationOrigin: input.finalization_origin,
        availableMinutes: input.available_minutes,
      });
      expect({
        deficit_minutes: outcome.deficitMinutes,
        debit_minutes: outcome.debitMinutes,
        decision: outcome.decision,
      }).toEqual(testCase.expected);

      // The fixture's attendance flag agrees with the production label/calendar rule.
      const dayClass = input.normal_work_date ? 'normal' : 'nonworking';
      expect(isAttendanceExpected({ dayClass }, input.category as DayCategory)).toBe(input.attendance_expected);
    });
  }
});
