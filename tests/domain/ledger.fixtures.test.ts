import { describe, expect, it } from 'vitest';
import {
  availableBalance,
  canDebit,
  correctionDelta,
  postedBalance,
  reservedBalance,
  summarizeBalance,
} from '../../src/domain/ledger.ts';
import { expectDomainError, type LedgerFixtureFile, ledgerScenario, loadFixture } from '../support/fixtures.ts';

const fixture = loadFixture<LedgerFixtureFile>('ledger_cases.json');

// Pure R-06 arithmetic. The transactional behaviour of the same scenarios (idempotent
// posting, linked corrections, negative balances) runs against the production services
// on real SQLite in tests/integration/ledger.test.ts.
describe('pure ledger balance (R-06)', () => {
  it('posted balance is the sum of signed deltas; an empty ledger is zero', () => {
    expect(postedBalance([])).toBe(0);
    expect(postedBalance([60, 30, -120])).toBe(-30);
  });

  it('available balance is posted minus active reservations', () => {
    expect(reservedBalance([])).toBe(0);
    expect(reservedBalance([120, 80])).toBe(200);
    expect(availableBalance(600, 120)).toBe(480);
    expect(summarizeBalance([600], [120])).toEqual({
      postedMinutes: 600,
      reservedMinutes: 120,
      availableMinutes: 480,
      negative: false,
      reconciliationRequired: false,
    });
  });

  it('flags a negative posted balance and an over-committed reservation for reconciliation', () => {
    expect(summarizeBalance([60, -60, -60], [])).toMatchObject({ postedMinutes: -60, negative: true, reconciliationRequired: true });
    // Posted stays positive, but active reservations exceed it after a truthful correction.
    expect(summarizeBalance([100, -60], [80])).toMatchObject({
      postedMinutes: 40,
      availableMinutes: -40,
      negative: false,
      reconciliationRequired: true,
    });
  });

  it('correction delta is new minus old', () => {
    expect(correctionDelta(60, 90)).toBe(30);
    expect(correctionDelta(60, 0)).toBe(-60);
    expect(correctionDelta(60, 60)).toBe(0);
  });

  it('a debit is allowed only when available covers it exactly or more (R-05)', () => {
    expect(canDebit(60, 60)).toBe(true);
    expect(canDebit(30, 60)).toBe(false);
    expect(canDebit(-10, 1)).toBe(false);
  });

  it('rejects fractional, unsafe or negative magnitudes with invalid_minutes', () => {
    expectDomainError(() => postedBalance([1.5]), 'invalid_minutes');
    expectDomainError(() => postedBalance([Number.MAX_SAFE_INTEGER + 1]), 'invalid_minutes');
    expectDomainError(() => reservedBalance([-1]), 'invalid_minutes');
    expectDomainError(() => correctionDelta(-1, 0), 'invalid_minutes');
    expectDomainError(() => correctionDelta(0, 0.5), 'invalid_minutes');
    expectDomainError(() => canDebit(10, 0), 'invalid_minutes');
  });
});

describe('reference/fixtures/ledger_cases.json ledger arithmetic', () => {
  it('LG-01: a single 60-minute credit makes a balance of 60', () => {
    const scenario = ledgerScenario(fixture, 'LG-01');
    expect(postedBalance([scenario.opening_balance_minutes, ...scenario.expected.new_deltas])).toBe(
      scenario.expected.balance_minutes,
    );
  });

  for (const id of ['LG-02', 'LG-08']) {
    it(`${id}: the correction posts new minus old and the balance follows`, () => {
      const scenario = ledgerScenario(fixture, id);
      const event = scenario.events[0];
      if (event?.previous_minutes === undefined || event.corrected_minutes === undefined) {
        throw new Error(`${id} has no correction event`);
      }
      const delta = correctionDelta(event.previous_minutes, event.corrected_minutes);
      expect([delta]).toEqual(scenario.expected.new_deltas);
      const balance = summarizeBalance([scenario.opening_balance_minutes, delta], []);
      expect(balance.postedMinutes).toBe(scenario.expected.balance_minutes);
      expect(balance.reconciliationRequired).toBe(scenario.expected.reconciliation_required ?? false);
    });
  }

  it('LG-09 (zero-delta part): an unchanged revision has a zero correction delta and no new delta', () => {
    const scenario = ledgerScenario(fixture, 'LG-09');
    const previous = scenario.events[0]?.previous_credit_minutes;
    if (previous === undefined) throw new Error('LG-09 has no previous credit');
    expect(correctionDelta(previous, previous)).toBe(0);
    expect(scenario.expected.new_deltas).toEqual([]);
    expect(postedBalance([scenario.opening_balance_minutes])).toBe(scenario.expected.balance_minutes);
  });

  it('every scenario that states reserved and available minutes satisfies available = posted − reserved', () => {
    const stated = fixture.ledger_scenarios.filter(
      (scenario) => scenario.expected.reserved_minutes !== undefined && scenario.expected.available_minutes !== undefined,
    );
    expect(stated.map((scenario) => scenario.id)).toEqual(['LG-03', 'LG-04', 'LG-05', 'LG-06', 'LG-07']);
    for (const scenario of stated) {
      expect(availableBalance(scenario.expected.balance_minutes, scenario.expected.reserved_minutes ?? 0), scenario.id).toBe(
        scenario.expected.available_minutes,
      );
    }
  });
});
