import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getBalance, type LedgerContext, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import {
  getOtLeaveRequest,
  listOtLeaveRequests,
  recordOtLeaveUse,
  type ReserveOtLeaveInput,
  reserveOtLeave,
} from '../../src/server/services/otLeave.ts';
import { callWindowsOverlap, type RaceOp, type RaceOutcome, RacePool } from '../support/concurrency.ts';
import { type LedgerFixtureFile, ledgerScenario, loadFixture } from '../support/fixtures.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * AC-03 / LG-07: concurrent double spending is prevented transactionally (R-06). Every
 * round races separate worker threads, each with its own connection to the same WAL
 * database file, released together by a barrier (tests/support/concurrency.ts). Each race
 * kind repeats at least 20 times in one run. This file runs inside `npm test` and
 * therefore inside `npm run verify`.
 */

const NOW = '2026-10-02T18:00:00Z';
const LEAVE_DATE = '2026-10-01';
const ROUNDS = 20;
const LG07_ROUNDS = 25;

const fixture = loadFixture<LedgerFixtureFile>('ledger_cases.json');

let t: TestContext;
let ctx: LedgerContext;
let pool: RacePool;

beforeAll(async () => {
  t = await createTestContext(NOW);
  ctx = { db: t.db, clock: t.clock };
  pool = await RacePool.start(4);
});

afterAll(async () => {
  await pool.close();
  t.close();
});

/** A fresh synthetic owner per round, so each round starts from its own opening balance. */
function newOwner(openingMinutes: number): string {
  const id = randomUUID();
  t.db
    .prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, 'Synthetic Racer', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
    )
    .run(id, `racer-${id}@example.invalid`, t.calendarId, NOW, NOW);
  postCredit(ctx, { userId: id, sourceKey: 'opening-balance', minutes: openingMinutes, workDate: '2026-09-21', actorUserId: null, origin: 'system' });
  return id;
}

function reserveInput(userId: string, requestKey: string, minutes: number): ReserveOtLeaveInput {
  return {
    userId,
    actorUserId: userId,
    requestKey,
    leaveDate: LEAVE_DATE,
    requestedMinutes: minutes,
    permission: {
      approverName: 'Example Manager',
      approverIdentity: 'manager@example.invalid',
      approvalDate: '2026-09-30',
      evidenceRef: 'Synthetic chat reference',
    },
  };
}

function newDeltas(userId: string): number[] {
  return listLedgerEntries(t.db, userId)
    .filter((entry) => entry.sourceKey !== 'opening-balance')
    .map((entry) => entry.deltaMinutes);
}

function race(ops: RaceOp[]): Promise<RaceOutcome[]> {
  return pool.race(t.config.databasePath, NOW, ops);
}

/** Outcome labels sorted, e.g. ['409 insufficient_balance', 'reserved']. */
function labels(outcomes: readonly RaceOutcome[]): string[] {
  return outcomes.map((outcome) => (outcome.ok ? outcome.status : `${outcome.httpStatus ?? '-'} ${outcome.code}`)).sort();
}

function report(name: string, rounds: number, overlapping: number, distribution: Map<string, number>): void {
  const kinds = [...distribution.entries()].map(([key, value]) => `${key} x${value}`).join('; ');
  console.info(`[race] ${name}: ${rounds} rounds, overlapping call windows ${overlapping}/${rounds}, outcomes: ${kinds}`);
}

function tally(distribution: Map<string, number>, outcomes: readonly RaceOutcome[]): void {
  const key = labels(outcomes).join(' + ');
  distribution.set(key, (distribution.get(key) ?? 0) + 1);
}

describe('harness self-check', () => {
  it('a deliberately unsafe check-then-insert double-books, so the racers really run concurrently', async () => {
    const rounds = 5;
    for (let round = 0; round < rounds; round += 1) {
      const owner = newOwner(100);
      const outcomes = await race([
        { kind: 'unsafeReserveControl', input: { userId: owner, requestKey: 'a', minutes: 80 } },
        { kind: 'unsafeReserveControl', input: { userId: owner, requestKey: 'b', minutes: 80 } },
      ]);
      expect(labels(outcomes), `round ${round}`).toEqual(['reserved', 'reserved']);
      expect(new Set(outcomes.map((outcome) => outcome.racer)).size).toBe(2);
      // The broken path over-commits: 160 reserved against 100 posted.
      expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 100, reservedMinutes: 160, availableMinutes: -60 });
    }
  });
});

describe('LG-07 concurrent reservations (AC-03)', () => {
  it(`exactly one of two 80-minute reservations wins at opening balance 100 (${LG07_ROUNDS} rounds)`, async () => {
    const scenario = ledgerScenario(fixture, 'LG-07');
    const event = scenario.events[0] as { requests?: Array<{ request_id: string; minutes: number }> } | undefined;
    const requests = event?.requests ?? [];
    expect(requests).toHaveLength(2);
    const expected = scenario.expected as typeof scenario.expected & { successful_requests: number; rejected_or_pending_requests: number };
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < LG07_ROUNDS; round += 1) {
      const owner = newOwner(scenario.opening_balance_minutes);
      const outcomes = await race(
        requests.map((request) => ({ kind: 'reserve' as const, input: reserveInput(owner, request.request_id, request.minutes) })),
      );
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(outcomes.filter((outcome) => outcome.ok && outcome.status === 'reserved'), `round ${round}`).toHaveLength(
        expected.successful_requests,
      );
      const rejected = outcomes.filter((outcome) => !outcome.ok);
      expect(rejected, `round ${round}`).toHaveLength(expected.rejected_or_pending_requests);
      expect(labels(rejected)).toEqual(['409 insufficient_balance']);
      expect(listOtLeaveRequests(t.db, owner)).toHaveLength(1);
      expect(newDeltas(owner)).toEqual(scenario.expected.new_deltas);
      expect(getBalance(t.db, owner)).toMatchObject({
        postedMinutes: scenario.expected.balance_minutes,
        reservedMinutes: scenario.expected.reserved_minutes,
        availableMinutes: scenario.expected.available_minutes,
      });
    }
    report('LG-07 reserve 80 vs 80 at 100', LG07_ROUNDS, overlapping, distribution);
  });

  it(`four racers reserving 80 at opening balance 200: exactly two win (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(200);
      const outcomes = await race(['a', 'b', 'c', 'd'].map((key) => ({ kind: 'reserve' as const, input: reserveInput(owner, key, 80) })));
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['409 insufficient_balance', '409 insufficient_balance', 'reserved', 'reserved']);
      expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 200, reservedMinutes: 160, availableMinutes: 40 });
    }
    report('reserve 4 x 80 at 200', ROUNDS, overlapping, distribution);
  });

  it(`a concurrent retry of the same request key creates one request (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(100);
      const op: RaceOp = { kind: 'reserve', input: reserveInput(owner, 'same-key', 80) };
      const outcomes = await race([op, op]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['duplicate', 'reserved']);
      expect(listOtLeaveRequests(t.db, owner)).toHaveLength(1);
      expect(getBalance(t.db, owner).reservedMinutes).toBe(80);
    }
    report('reserve same key twice', ROUNDS, overlapping, distribution);
  });
});

describe('concurrent use, cancel and reverse (AC-03)', () => {
  function reservedRequest(owner: string, minutes: number): string {
    return reserveOtLeave(ctx, reserveInput(owner, 'leave', minutes)).request.id;
  }

  it(`two uses of 80 against a 120 reservation: exactly one is recorded (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(600);
      const requestId = reservedRequest(owner, 120);
      const outcomes = await race(
        ['use-a', 'use-b'].map((useKey) => ({ kind: 'use' as const, input: { userId: owner, actorUserId: owner, requestId, useKey, minutes: 80 } })),
      );
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['409 exceeds_reserved', 'used']);
      expect(newDeltas(owner)).toEqual([-80]);
      expect(getOtLeaveRequest(t.db, owner, requestId)).toMatchObject({ reservedMinutes: 40, consumedMinutes: 80, version: 2 });
      expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 520, reservedMinutes: 40, availableMinutes: 480 });
    }
    report('use 80 vs 80 of 120', ROUNDS, overlapping, distribution);
  });

  it(`a concurrent retry of the same use key posts once (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(600);
      const requestId = reservedRequest(owner, 120);
      const op: RaceOp = { kind: 'use', input: { userId: owner, actorUserId: owner, requestId, useKey: 'same-use', minutes: 80 } };
      const outcomes = await race([op, op]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['duplicate', 'used']);
      expect(newDeltas(owner)).toEqual([-80]);
      expect(getOtLeaveRequest(t.db, owner, requestId)).toMatchObject({ reservedMinutes: 40, consumedMinutes: 80 });
    }
    report('use same key twice', ROUNDS, overlapping, distribution);
  });

  it(`cancel racing a full use: one wins and the counters and ledger agree (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(600);
      const requestId = reservedRequest(owner, 120);
      const outcomes = await race([
        { kind: 'cancel', input: { userId: owner, actorUserId: owner, requestId } },
        { kind: 'use', input: { userId: owner, actorUserId: owner, requestId, useKey: 'use', minutes: 120 } },
      ]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      const request = getOtLeaveRequest(t.db, owner, requestId);
      const outcome = labels(outcomes);
      if (outcome.includes('cancelled')) {
        expect(outcome, `round ${round}`).toEqual(['409 exceeds_reserved', 'cancelled']);
        expect(request).toMatchObject({ reservedMinutes: 0, consumedMinutes: 0, releasedMinutes: 120 });
        expect(newDeltas(owner)).toEqual([]);
        expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 600, availableMinutes: 600 });
      } else {
        expect(outcome, `round ${round}`).toEqual(['unchanged', 'used']);
        expect(request).toMatchObject({ reservedMinutes: 0, consumedMinutes: 120, releasedMinutes: 0 });
        expect(newDeltas(owner)).toEqual([-120]);
        expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 480, availableMinutes: 480 });
      }
    }
    report('cancel vs use 120 of 120', ROUNDS, overlapping, distribution);
  });

  it(`two reversals of 120 used minutes: exactly one posts the compensating delta (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(600);
      const requestId = reservedRequest(owner, 120);
      recordOtLeaveUse(ctx, { userId: owner, actorUserId: owner, requestId, useKey: 'use', minutes: 120 });
      const outcomes = await race(
        ['reverse-a', 'reverse-b'].map((reversalKey) => ({
          kind: 'reverse' as const,
          input: { userId: owner, actorUserId: owner, requestId, reversalKey, minutes: 120, reason: 'Synthetic reversal' },
        })),
      );
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['409 exceeds_reversible', 'reversed']);
      expect(newDeltas(owner)).toEqual([-120, 120]);
      expect(getOtLeaveRequest(t.db, owner, requestId)).toMatchObject({ consumedMinutes: 120, reversedMinutes: 120 });
      expect(getBalance(t.db, owner)).toMatchObject({ postedMinutes: 600, reservedMinutes: 0, availableMinutes: 600 });
    }
    report('reverse 120 vs 120 of 120 used', ROUNDS, overlapping, distribution);
  });
});
