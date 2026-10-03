import { describe, expect, it } from 'vitest';
import {
  availableBalance,
  canDebit,
  canReserve,
  correctionDelta,
  type LeaveCounters,
  openLeaveCounters,
  otLeaveCostMinutes,
  planLeaveCancel,
  planLeaveReversal,
  planLeaveUse,
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

// Pure R-06 OT leave lifecycle arithmetic (owner decisions E-2/E-3). Idempotency,
// atomic reservation and concurrency run on the production services and real SQLite in
// tests/integration/ot-leave.test.ts and tests/integration/ot-leave-concurrency.test.ts.
describe('pure OT leave lifecycle (R-06, E-3)', () => {
  const counters = (partial: Partial<LeaveCounters> & { approvedMinutes: number }): LeaveCounters => ({
    reservedMinutes: 0,
    consumedMinutes: 0,
    releasedMinutes: 0,
    reversedMinutes: 0,
    ...partial,
  });

  it('converts leave minutes 1:1: eight hours of leave costs 480 OT minutes, not 510', () => {
    expect(otLeaveCostMinutes(8 * 60)).toBe(480);
    expect(otLeaveCostMinutes(90)).toBe(90);
    expectDomainError(() => otLeaveCostMinutes(0), 'invalid_minutes');
    expectDomainError(() => otLeaveCostMinutes(1.5), 'invalid_minutes');
    expectDomainError(() => otLeaveCostMinutes(1441), 'invalid_minutes');
  });

  it('a reservation needs available minutes that cover it (E-5)', () => {
    expect(canReserve(100, 80)).toBe(true);
    expect(canReserve(80, 80)).toBe(true);
    expect(canReserve(20, 80)).toBe(false);
    expect(canReserve(-10, 1)).toBe(false);
    expectDomainError(() => canReserve(100, 0), 'invalid_minutes');
  });

  it('an approved request opens fully reserved', () => {
    expect(openLeaveCounters(480)).toEqual(counters({ approvedMinutes: 480, reservedMinutes: 480 }));
    expectDomainError(() => openLeaveCounters(0), 'invalid_minutes');
  });

  it('partial use moves minutes from reserved to consumed and keeps the remainder reserved', () => {
    expect(planLeaveUse(openLeaveCounters(480), 180)).toEqual({
      ok: true,
      deltaMinutes: -180,
      counters: counters({ approvedMinutes: 480, reservedMinutes: 300, consumedMinutes: 180 }),
    });
  });

  it('use beyond the reserved minutes is refused with the limit', () => {
    const start = counters({ approvedMinutes: 480, reservedMinutes: 300, consumedMinutes: 180 });
    expect(planLeaveUse(start, 301)).toEqual({ ok: false, reason: 'exceeds_reserved', limitMinutes: 300 });
    expect(planLeaveUse(counters({ approvedMinutes: 120, releasedMinutes: 120 }), 1)).toEqual({
      ok: false,
      reason: 'exceeds_reserved',
      limitMinutes: 0,
    });
    expectDomainError(() => planLeaveUse(start, 0), 'invalid_minutes');
  });

  it('cancel releases only the unused reserved minutes; consumed minutes stay consumed', () => {
    expect(planLeaveCancel(counters({ approvedMinutes: 480, reservedMinutes: 300, consumedMinutes: 180 }))).toEqual({
      releasedMinutes: 300,
      counters: counters({ approvedMinutes: 480, consumedMinutes: 180, releasedMinutes: 300 }),
    });
    expect(planLeaveCancel(counters({ approvedMinutes: 120, releasedMinutes: 120 })).releasedMinutes).toBe(0);
  });

  it('reversal gives back used minutes with a positive delta, never more than consumed minus reversed', () => {
    expect(planLeaveReversal(counters({ approvedMinutes: 120, consumedMinutes: 120 }), 60)).toEqual({
      ok: true,
      deltaMinutes: 60,
      counters: counters({ approvedMinutes: 120, consumedMinutes: 120, reversedMinutes: 60 }),
    });
    expect(planLeaveReversal(counters({ approvedMinutes: 120, consumedMinutes: 120, reversedMinutes: 60 }), 61)).toEqual({
      ok: false,
      reason: 'exceeds_reversible',
      limitMinutes: 60,
    });
  });

  it('rejects counters that break approved = reserved + consumed + released or reversed <= consumed', () => {
    expectDomainError(() => planLeaveUse(counters({ approvedMinutes: 120, reservedMinutes: 60 }), 10), 'invalid_minutes');
    expectDomainError(
      () => planLeaveReversal(counters({ approvedMinutes: 120, consumedMinutes: 120, reversedMinutes: 121 }), 1),
      'invalid_minutes',
    );
  });
});

describe('reference/fixtures/ledger_cases.json OT leave arithmetic', () => {
  function eventMinutes(id: string, type: string): number {
    const event = ledgerScenario(fixture, id).events.find((item) => item.type === type);
    if (event?.minutes === undefined) throw new Error(`${id} has no ${type} minutes`);
    return event.minutes;
  }

  function expectStated(id: string, deltas: number[], reservedMinutes: number): void {
    const scenario = ledgerScenario(fixture, id);
    expect(deltas, id).toEqual(scenario.expected.new_deltas);
    const balance = summarizeBalance([scenario.opening_balance_minutes, ...deltas], reservedMinutes === 0 ? [] : [reservedMinutes]);
    expect(balance.postedMinutes, id).toBe(scenario.expected.balance_minutes);
    expect(balance.reservedMinutes, id).toBe(scenario.expected.reserved_minutes);
    expect(balance.availableMinutes, id).toBe(scenario.expected.available_minutes);
  }

  it('LG-03: using the full reservation posts one negative delta and clears the reservation', () => {
    const used = planLeaveUse(openLeaveCounters(eventMinutes('LG-03', 'approve_leave')), eventMinutes('LG-03', 'consume_reserved_leave'));
    if (!used.ok) throw new Error('LG-03 use refused');
    // The retry_consumption event appends nothing; its idempotency is a storage concern.
    expectStated('LG-03', [used.deltaMinutes], used.counters.reservedMinutes);
  });

  it('LG-04: approval reserves without posting', () => {
    expectStated('LG-04', [], openLeaveCounters(eventMinutes('LG-04', 'approve_leave')).reservedMinutes);
  });

  it('LG-05: cancelling an unused reservation releases it without posting', () => {
    const cancelled = planLeaveCancel(openLeaveCounters(eventMinutes('LG-05', 'approve_leave')));
    expectStated('LG-05', [], cancelled.counters.reservedMinutes);
  });

  it('LG-06: reversing used leave posts a compensating positive delta', () => {
    const used = planLeaveUse(openLeaveCounters(eventMinutes('LG-06', 'approve_leave')), eventMinutes('LG-06', 'consume_reserved_leave'));
    if (!used.ok) throw new Error('LG-06 use refused');
    const reversed = planLeaveReversal(used.counters, eventMinutes('LG-06', 'reverse_used_leave'));
    if (!reversed.ok) throw new Error('LG-06 reversal refused');
    expectStated('LG-06', [used.deltaMinutes, reversed.deltaMinutes], reversed.counters.reservedMinutes);
  });

  it('LG-07 (serialized arithmetic): after one 80-minute reservation at 100 the second no longer fits', () => {
    const scenario = ledgerScenario(fixture, 'LG-07');
    const event = scenario.events[0] as { requests?: Array<{ request_id: string; minutes: number }> } | undefined;
    const requests = event?.requests ?? [];
    expect(requests).toHaveLength(2);
    let available = scenario.opening_balance_minutes;
    const reserved: number[] = [];
    for (const request of requests) {
      if (canReserve(available, request.minutes)) {
        reserved.push(request.minutes);
        available -= request.minutes;
      }
    }
    expect(reserved).toEqual([80]);
    expectStated('LG-07', [], reserved[0] ?? 0);
  });
});
