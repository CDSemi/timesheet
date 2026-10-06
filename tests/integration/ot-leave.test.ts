import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import { writeTransaction } from '../../src/server/db/database.ts';
import { ApiError } from '../../src/server/http/errors.ts';
import { getCalendar } from '../../src/server/services/calendars.ts';
import { getBalance, listLedgerEntries, postCorrection, postCredit } from '../../src/server/services/ledger.ts';
import {
  cancelOtLeave,
  getOtLeaveRequest,
  listOtLeaveRequests,
  type OtLeaveContext,
  recordOtLeaveUse,
  type ReserveOtLeaveInput,
  reserveOtLeave,
  reverseOtLeaveUse,
} from '../../src/server/services/otLeave.ts';
import { ensurePayPeriodRow } from '../../src/server/services/periods.ts';
import { expectDomainError, type LedgerFixtureFile, ledgerScenario, loadFixture } from '../support/fixtures.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * R-06 OT leave lifecycle on the production services and a real SQLite file (owner
 * decisions E-2/E-3, coordinator decisions E-5/E-7). Multi-connection races are in
 * ot-leave-concurrency.test.ts.
 */

const fixture = loadFixture<LedgerFixtureFile>('ledger_cases.json');

let t: TestContext;
let ctx: OtLeaveContext;
let employee: string;
let admin: string;

// 2026-10-02 11:00 in the America/Los_Angeles reporting zone.
beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  ctx = { db: t.db, clock: t.clock };
  employee = t.userIds.employee;
  admin = t.userIds.admin;
});

afterEach(() => t.close());

function expectApiError(action: () => unknown, status: number, code: string): ApiError | undefined {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  expect(thrown, `expected ApiError ${code}`).toBeInstanceOf(ApiError);
  if (!(thrown instanceof ApiError)) return undefined;
  expect({ status: thrown.status, code: thrown.code }).toEqual({ status, code });
  return thrown;
}

/** Fixture setup: the opening balance is one system credit and is excluded from new deltas. */
function openBalance(userId: string, minutes: number): void {
  postCredit(ctx, { userId, sourceKey: 'opening-balance', minutes, workDate: '2026-09-21', actorUserId: null, origin: 'system' });
}

/** Deltas posted after the opening balance, in posting order. */
function newDeltas(userId: string): number[] {
  return listLedgerEntries(t.db, userId)
    .filter((entry) => entry.sourceKey !== 'opening-balance')
    .map((entry) => entry.deltaMinutes);
}

function count(sql: string, ...params: unknown[]): number {
  return t.db.prepare(sql).pluck().get(...params) as number;
}

function reserveInput(userId: string, requestKey: string, minutes: number, leaveDate = '2026-10-01'): ReserveOtLeaveInput {
  return {
    userId,
    actorUserId: userId,
    requestKey,
    leaveDate,
    requestedMinutes: minutes,
    permission: {
      approverName: 'Example Manager',
      approverIdentity: 'manager@example.invalid',
      approvalDate: '2026-09-30',
      evidenceRef: 'Synthetic chat message 2026-09-30 10:15',
    },
  };
}

function reserve(userId: string, requestKey: string, minutes: number, leaveDate?: string) {
  return reserveOtLeave(ctx, reserveInput(userId, requestKey, minutes, leaveDate));
}

function use(userId: string, requestId: string, useKey: string, minutes: number) {
  return recordOtLeaveUse(ctx, { userId, actorUserId: userId, requestId, useKey, minutes });
}

function reverse(userId: string, requestId: string, reversalKey: string, minutes: number) {
  return reverseOtLeaveUse(ctx, { userId, actorUserId: userId, requestId, reversalKey, minutes, reason: 'Leave day worked after all' });
}

describe('recorded manager permission and atomic reservation (R-06, E-5, E-7)', () => {
  it('LG-04: approval reserves the approved minutes without posting a delta', () => {
    const scenario = ledgerScenario(fixture, 'LG-04');
    openBalance(employee, scenario.opening_balance_minutes);
    const result = reserve(employee, 'leave2', scenario.events[0]?.minutes ?? 0);
    expect(result.status).toBe('reserved');
    expect(newDeltas(employee)).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      reservedMinutes: scenario.expected.reserved_minutes,
      availableMinutes: scenario.expected.available_minutes,
    });
    expect(result.balance.availableMinutes).toBe(scenario.expected.available_minutes);
  });

  it('stores the permission facts with origin self_recorded and a text evidence reference', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-facts', 480);
    expect(request).toMatchObject({
      userId: employee,
      requestKey: 'leave-facts',
      leaveDate: '2026-10-01',
      requestedMinutes: 480,
      approvedMinutes: 480,
      reservedMinutes: 480,
      consumedMinutes: 0,
      releasedMinutes: 0,
      reversedMinutes: 0,
      approverName: 'Example Manager',
      approverIdentity: 'manager@example.invalid',
      approvalDate: '2026-09-30',
      evidenceRef: 'Synthetic chat message 2026-09-30 10:15',
      approvalOrigin: 'self_recorded',
      createdBy: employee,
      createdAt: '2026-10-02T18:00:00Z',
      version: 1,
    });
    expect(getOtLeaveRequest(t.db, employee, request.id)).toEqual(request);
    expect(count("SELECT count(*) FROM audit_events WHERE entity_id = ? AND operation = 'ot_leave.reserve'", request.id)).toBe(1);
  });

  it('reserves a manager-approved amount smaller than the requested amount', () => {
    openBalance(employee, 600);
    const { request, balance } = reserveOtLeave(ctx, { ...reserveInput(employee, 'leave-partial-approval', 480), approvedMinutes: 240 });
    expect(request).toMatchObject({ requestedMinutes: 480, approvedMinutes: 240, reservedMinutes: 240 });
    expect(balance).toMatchObject({ reservedMinutes: 240, availableMinutes: 360 });
  });

  it('E-5: insufficient available balance returns 409 insufficient_balance and creates nothing', () => {
    openBalance(employee, 100);
    reserve(employee, 'a', 80);
    const audits = count('SELECT count(*) FROM audit_events');
    const error = expectApiError(() => reserve(employee, 'b', 80), 409, 'insufficient_balance');
    expect(error?.details).toEqual({ available_minutes: 20, requested_minutes: 80 });
    expect(listOtLeaveRequests(t.db, employee).map((request) => request.requestKey)).toEqual(['a']);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 100, reservedMinutes: 80, availableMinutes: 20 });
  });

  it('a retried reservation with the same key returns the existing request and appends nothing', () => {
    openBalance(employee, 600);
    const first = reserve(employee, 'leave-retry', 120);
    const audits = count('SELECT count(*) FROM audit_events');
    const again = reserve(employee, 'leave-retry', 120);
    expect(again.status).toBe('duplicate');
    expect(again.request).toEqual(first.request);
    expect(count('SELECT count(*) FROM ot_leave_requests WHERE user_id = ?', employee)).toBe(1);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    expect(getBalance(t.db, employee).reservedMinutes).toBe(120);
  });

  it('a retry stays a duplicate even when the balance no longer covers it', () => {
    openBalance(employee, 120);
    reserve(employee, 'leave-full', 120);
    expect(reserve(employee, 'leave-full', 120).status).toBe('duplicate');
  });

  it('a reused request key with different values is request_key_conflict', () => {
    openBalance(employee, 600);
    reserve(employee, 'leave-conflict', 120);
    expectApiError(() => reserve(employee, 'leave-conflict', 240), 409, 'request_key_conflict');
    expectApiError(() => reserve(employee, 'leave-conflict', 120, '2026-10-09'), 409, 'request_key_conflict');
    expect(count('SELECT count(*) FROM ot_leave_requests WHERE user_id = ?', employee)).toBe(1);
  });

  it('LG-10 (approval_required): a reservation without a recorded permission is refused', () => {
    openBalance(employee, 600);
    const base = reserveInput(employee, 'leave-no-permission', 480);
    expectApiError(() => reserveOtLeave(ctx, { ...base, permission: { ...base.permission, approverName: '  ' } }), 422, 'approval_required');
    expectApiError(() => reserveOtLeave(ctx, { ...base, permission: { ...base.permission, evidenceRef: '' } }), 422, 'approval_required');
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
  });

  it('validates minutes, dates and the approved amount', () => {
    openBalance(employee, 6000);
    expectDomainError(() => reserve(employee, 'zero', 0), 'invalid_minutes');
    expectDomainError(() => reserve(employee, 'fraction', 1.5), 'invalid_minutes');
    expectDomainError(() => reserve(employee, 'too-long', 1441), 'invalid_minutes');
    expectDomainError(() => reserve(employee, 'bad-date', 60, '2026-02-30'), 'invalid_date');
    expectApiError(
      () => reserveOtLeave(ctx, { ...reserveInput(employee, 'over-approved', 120), approvedMinutes: 121 }),
      422,
      'invalid_approved_minutes',
    );
    expectApiError(() => reserve(employee, ' ', 60), 422, 'invalid_request_key');
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
  });
});

describe('explicit, idempotent record use (owner decision E-3)', () => {
  it('LG-03: using the full reservation posts one -480 delta; the retry appends nothing', () => {
    const scenario = ledgerScenario(fixture, 'LG-03');
    openBalance(employee, scenario.opening_balance_minutes);
    const { request } = reserve(employee, 'leave1', 480);
    const used = use(employee, request.id, 'use-1', 480);
    expect(used.status).toBe('used');
    expect(used.entry).toMatchObject({
      entryType: 'leave_consumption',
      deltaMinutes: -480,
      leaveRequestId: request.id,
      workDate: '2026-10-01',
      actorUserId: employee,
      origin: 'manual',
    });
    const audits = count('SELECT count(*) FROM audit_events');
    const retry = use(employee, request.id, 'use-1', 480);
    expect(retry.status).toBe('duplicate');
    expect(retry.entry.id).toBe(used.entry.id);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    expect(newDeltas(employee)).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      reservedMinutes: scenario.expected.reserved_minutes,
      availableMinutes: scenario.expected.available_minutes,
    });
    expect(getOtLeaveRequest(t.db, employee, request.id)).toMatchObject({ reservedMinutes: 0, consumedMinutes: 480, version: 2 });
  });

  it('eight hours of leave costs 480 minutes, not 510 (1:1)', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-8h', 8 * 60);
    use(employee, request.id, 'use-8h', 8 * 60);
    expect(newDeltas(employee)).toEqual([-480]);
    expect(getBalance(t.db, employee).postedMinutes).toBe(120);
  });

  it('partial use keeps the unused remainder reserved until it is used or cancelled', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-partial', 480);
    const first = use(employee, request.id, 'morning', 180);
    expect(first.request).toMatchObject({ reservedMinutes: 300, consumedMinutes: 180 });
    expect(first.balance).toMatchObject({ postedMinutes: 420, reservedMinutes: 300, availableMinutes: 120 });
    const second = use(employee, request.id, 'afternoon', 300);
    expect(second.request).toMatchObject({ reservedMinutes: 0, consumedMinutes: 480 });
    expect(newDeltas(employee)).toEqual([-180, -300]);
    expectApiError(() => use(employee, request.id, 'extra', 1), 409, 'exceeds_reserved');
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 120, reservedMinutes: 0, availableMinutes: 120 });
  });

  it('use beyond the remaining reservation is exceeds_reserved and changes nothing', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-over', 120);
    const error = expectApiError(() => use(employee, request.id, 'too-much', 121), 409, 'exceeds_reserved');
    expect(error?.details).toEqual({ reserved_minutes: 120 });
    expect(newDeltas(employee)).toEqual([]);
    expect(getOtLeaveRequest(t.db, employee, request.id)).toMatchObject({ reservedMinutes: 120, version: 1 });
  });

  it('use is allowed only on or after the leave date in the saved reporting zone', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-future', 120, '2026-10-05');
    // 2026-10-04 23:59 in Los Angeles is still before the leave date.
    t.clock.set('2026-10-05T06:59:00Z');
    expectApiError(() => use(employee, request.id, 'early', 120), 409, 'before_leave_date');
    expect(newDeltas(employee)).toEqual([]);
    // 2026-10-05 00:00 in Los Angeles: the leave date has started.
    t.clock.set('2026-10-05T07:00:00Z');
    expect(use(employee, request.id, 'on-the-day', 120).status).toBe('used');
  });

  it('a reused use key with different minutes is source_key_conflict', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-key', 240);
    use(employee, request.id, 'use-key', 60);
    expectApiError(() => use(employee, request.id, 'use-key', 90), 409, 'source_key_conflict');
    expect(newDeltas(employee)).toEqual([-60]);
  });

  it('the same use key on another request of the same owner is a separate use', () => {
    openBalance(employee, 600);
    const one = reserve(employee, 'leave-one', 60).request;
    const two = reserve(employee, 'leave-two', 60).request;
    use(employee, one.id, 'use', 60);
    expect(use(employee, two.id, 'use', 60).status).toBe('used');
    expect(newDeltas(employee)).toEqual([-60, -60]);
  });

  it('a stale expected version is refused before anything changes', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-version', 240);
    use(employee, request.id, 'first', 60);
    expectApiError(
      () => recordOtLeaveUse(ctx, { userId: employee, actorUserId: employee, requestId: request.id, useKey: 'second', minutes: 60, expectedVersion: 1 }),
      409,
      'stale_version',
    );
    expect(newDeltas(employee)).toEqual([-60]);
  });

  it('a later truthful correction that leaves the balance short keeps the used leave and flags reconciliation', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-then-correct', 480);
    use(employee, request.id, 'use', 480);
    const opening = listLedgerEntries(t.db, employee)[0];
    if (opening === undefined) throw new Error('opening credit missing');
    const corrected = postCorrection(ctx, {
      userId: employee,
      sourceKey: 'opening-correction',
      originalEntryId: opening.id,
      correctedMinutes: 300,
      actorUserId: admin,
      origin: 'manual',
      reason: 'Synthetic correction',
    });
    expect(corrected.reconciliationRequired).toBe(true);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: -180, negative: true });
    expect(newDeltas(employee)).toEqual([-480, -300]);
  });
});

describe('cancel and reverse (R-06)', () => {
  it('LG-05: cancelling an unused reservation releases it and posts nothing; a retry is unchanged', () => {
    const scenario = ledgerScenario(fixture, 'LG-05');
    openBalance(employee, scenario.opening_balance_minutes);
    const { request } = reserve(employee, 'leave3', 120);
    const cancelled = cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id });
    expect(cancelled).toMatchObject({ status: 'cancelled', releasedMinutes: 120 });
    expect(cancelled.request).toMatchObject({ reservedMinutes: 0, releasedMinutes: 120, version: 2 });
    const audits = count('SELECT count(*) FROM audit_events');
    const retry = cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id });
    expect(retry).toMatchObject({ status: 'unchanged', releasedMinutes: 0 });
    expect(retry.request.version).toBe(2);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    expect(newDeltas(employee)).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      reservedMinutes: scenario.expected.reserved_minutes,
      availableMinutes: scenario.expected.available_minutes,
    });
  });

  it('ADV-A-03: a stale expected version is refused on cancel even when nothing is reserved any more', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-stale-cancel', 120);
    use(employee, request.id, 'use-all', 120);
    // Fully used: version 2, nothing left to release. A cancel based on version 1 is stale.
    const audits = count('SELECT count(*) FROM audit_events');
    expectApiError(
      () => cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id, expectedVersion: 1 }),
      409,
      'stale_version',
    );
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    // The current version and an omitted version still answer unchanged.
    expect(cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id, expectedVersion: 2 }).status).toBe('unchanged');
    expect(cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id }).status).toBe('unchanged');
    // A cancelled request is stale for an old version as well.
    const second = reserve(employee, 'leave-stale-cancel-2', 60).request;
    cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: second.id, expectedVersion: 1 });
    expectApiError(
      () => cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: second.id, expectedVersion: 1 }),
      409,
      'stale_version',
    );
  });

  it('cancel after partial use releases only the unused remainder', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-cancel-partial', 480);
    use(employee, request.id, 'part', 180);
    const cancelled = cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id, reason: 'Back early' });
    expect(cancelled.releasedMinutes).toBe(300);
    expect(cancelled.request).toMatchObject({ reservedMinutes: 0, consumedMinutes: 180, releasedMinutes: 300 });
    expect(newDeltas(employee)).toEqual([-180]);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 420, reservedMinutes: 0, availableMinutes: 420 });
    expectApiError(() => use(employee, request.id, 'after-cancel', 1), 409, 'exceeds_reserved');
  });

  it('LG-06: reversing used leave posts a linked compensating +delta; the retry appends nothing', () => {
    const scenario = ledgerScenario(fixture, 'LG-06');
    openBalance(employee, scenario.opening_balance_minutes);
    const { request } = reserve(employee, 'leave4', 120);
    const used = use(employee, request.id, 'use', 120);
    const reversed = reverse(employee, request.id, 'reverse-1', 120);
    expect(reversed.status).toBe('reversed');
    expect(reversed.entry).toMatchObject({
      entryType: 'leave_reversal',
      deltaMinutes: 120,
      leaveRequestId: request.id,
      reason: 'Leave day worked after all',
    });
    expect(reversed.entry.id).not.toBe(used.entry.id);
    expect(reversed.request).toMatchObject({ consumedMinutes: 120, reversedMinutes: 120, version: 3 });
    expect(reverse(employee, request.id, 'reverse-1', 120).status).toBe('duplicate');
    expect(newDeltas(employee)).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      reservedMinutes: scenario.expected.reserved_minutes,
      availableMinutes: scenario.expected.available_minutes,
    });
  });

  it('partial reversal is allowed; reversing more than used minus reversed is exceeds_reversible', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-reverse-partial', 120);
    use(employee, request.id, 'use', 120);
    reverse(employee, request.id, 'first-half', 60);
    const error = expectApiError(() => reverse(employee, request.id, 'too-much', 61), 409, 'exceeds_reversible');
    expect(error?.details).toEqual({ reversible_minutes: 60 });
    expect(newDeltas(employee)).toEqual([-120, 60]);
  });

  it('reversal requires a reason', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-reverse-reason', 120);
    use(employee, request.id, 'use', 120);
    expectApiError(
      () => reverseOtLeaveUse(ctx, { userId: employee, actorUserId: employee, requestId: request.id, reversalKey: 'r', minutes: 60, reason: ' ' }),
      422,
      'reason_required',
    );
    expect(newDeltas(employee)).toEqual([-120]);
  });

  it('reversing unused leave is exceeds_reversible (cancel releases unused minutes instead)', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-reverse-unused', 120);
    expectApiError(() => reverse(employee, request.id, 'nothing-used', 60), 409, 'exceeds_reversible');
  });
});

describe('ownership, rollback and audit', () => {
  it("another user's request is not found and nothing changes", () => {
    openBalance(employee, 600);
    openBalance(admin, 600);
    const { request } = reserve(employee, 'leave-owned', 120);
    use(employee, request.id, 'use', 60);
    expectApiError(() => use(admin, request.id, 'steal', 60), 404, 'not_found');
    expectApiError(() => cancelOtLeave(ctx, { userId: admin, actorUserId: admin, requestId: request.id }), 404, 'not_found');
    expectApiError(() => reverse(admin, request.id, 'steal', 60), 404, 'not_found');
    expect(getOtLeaveRequest(t.db, admin, request.id)).toBeUndefined();
    expect(listOtLeaveRequests(t.db, admin)).toEqual([]);
    expect(getOtLeaveRequest(t.db, employee, request.id)).toMatchObject({ reservedMinutes: 60, consumedMinutes: 60, version: 2 });
    expect(getBalance(t.db, admin)).toMatchObject({ postedMinutes: 600, reservedMinutes: 0 });
  });

  it("one owner's reservations never reduce another owner's available balance", () => {
    openBalance(employee, 100);
    openBalance(admin, 100);
    reserve(employee, 'mine', 80);
    expect(reserve(admin, 'mine', 80).status).toBe('reserved');
    expect(getBalance(t.db, admin).availableMinutes).toBe(20);
  });

  it('a failure after the counter update rolls the use back (no counters, ledger or audit change)', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-rollback', 120);
    const audits = count('SELECT count(*) FROM audit_events');
    // Connection-local fault injection: the ledger insert fails after the counters moved.
    t.db.exec(
      "CREATE TEMP TRIGGER inject_ledger_failure BEFORE INSERT ON main.ot_ledger BEGIN SELECT RAISE(ABORT, 'injected_failure'); END",
    );
    expect(() => use(employee, request.id, 'use', 120)).toThrow('injected_failure');
    t.db.exec('DROP TRIGGER temp.inject_ledger_failure');
    expect(getOtLeaveRequest(t.db, employee, request.id)).toMatchObject({ reservedMinutes: 120, consumedMinutes: 0, version: 1 });
    expect(newDeltas(employee)).toEqual([]);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audits);
    expect(use(employee, request.id, 'use', 120).status).toBe('used');
  });

  it("a caller's failing outer transaction rolls back a reservation made inside it", () => {
    openBalance(employee, 600);
    expect(() =>
      writeTransaction(t.db, () => {
        reserve(employee, 'leave-outer', 120);
        throw new Error('caller failed');
      }),
    ).toThrow('caller failed');
    expect(listOtLeaveRequests(t.db, employee)).toEqual([]);
    expect(getBalance(t.db, employee).reservedMinutes).toBe(0);
  });

  it('audits each state change with before/after and links ledger entries to the request', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-audit', 240);
    use(employee, request.id, 'use', 120);
    cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id, reason: 'Plans changed' });
    reverse(employee, request.id, 'reverse', 60);
    const operations = t.db
      .prepare("SELECT operation FROM audit_events WHERE owner_user_id = ? AND operation LIKE 'ot_%' ORDER BY rowid")
      .pluck()
      .all(employee);
    expect(operations).toEqual([
      'ot_ledger.credit',
      'ot_leave.reserve',
      'ot_leave.use',
      'ot_ledger.leave_consumption',
      'ot_leave.cancel',
      'ot_leave.reverse',
      'ot_ledger.leave_reversal',
    ]);
    const cancel = t.db
      .prepare("SELECT actor_user_id, reason, before_json, after_json FROM audit_events WHERE operation = 'ot_leave.cancel'")
      .get() as { actor_user_id: string; reason: string; before_json: string; after_json: string };
    expect(cancel.actor_user_id).toBe(employee);
    expect(cancel.reason).toBe('Plans changed');
    expect(JSON.parse(cancel.before_json)).toMatchObject({ reserved_minutes: 120, released_minutes: 0 });
    expect(JSON.parse(cancel.after_json)).toMatchObject({ reserved_minutes: 0, released_minutes: 120 });
  });
});

describe('LG-10: a day label or leave change never reserves or spends OT (owner decision E-2)', () => {
  it('changing the day to leave minutes (including leave_kind ot) posts nothing and reserves nothing', async () => {
    const scenario = ledgerScenario(fixture, 'LG-10');
    openBalance(employee, scenario.opening_balance_minutes);
    const event = scenario.events[0] as { leave_kind?: string; leave_minutes?: number; approval_recorded?: boolean } | undefined;
    expect(event?.approval_recorded).toBe(false);
    expect(event?.leave_kind).toBe('ot');
    const cookie = await t.login('employee');
    const put = await t.request('PUT', '/api/days/2026-10-01', {
      cookie,
      body: { category: 'Vacation', leave_minutes: event?.leave_minutes ?? 0, leave_kind: event?.leave_kind, wfh: false, notes: '' },
    });
    expect(put.status).toBe(200);
    expect(put.body).toMatchObject({ leave_kind: 'ot', leave_minutes: 480 });
    // Relabel the category, then switch the kind to vacation and back to ot: nothing moves.
    let version: number = put.body.entry.version;
    for (const [category, leaveKind] of [['Off', 'ot'], ['Vacation', 'vacation'], ['Sick', 'sick'], ['Worked', 'ot']] as const) {
      const response = await t.request('PUT', '/api/days/2026-10-01', {
        cookie,
        body: { category, leave_minutes: event?.leave_minutes ?? 0, leave_kind: leaveKind, wfh: false, notes: '', expected_version: version },
      });
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ category, leave_kind: leaveKind });
      version = response.body.entry.version;
    }
    expect(newDeltas(employee)).toEqual(scenario.expected.new_deltas);
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      reservedMinutes: scenario.expected.reserved_minutes,
    });
  });

  it('a batch relabel to leave_kind ot also posts and reserves nothing', async () => {
    openBalance(employee, 600);
    const cookie = await t.login('employee');
    const batch = await t.request('POST', '/api/days/batch', {
      cookie,
      body: {
        mode: 'commit',
        entries: [
          { work_date: '2026-10-01', category: 'Vacation', leave_minutes: 480, leave_kind: 'ot', expected_version: null },
          { work_date: '2026-10-02', category: 'Off', leave_minutes: 240, leave_kind: 'ot', expected_version: null },
        ],
      },
    });
    expect(batch.status).toBe(200);
    expect(newDeltas(employee)).toEqual([]);
    expect(count('SELECT count(*) FROM ot_leave_requests')).toBe(0);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 600, reservedMinutes: 0 });
  });

  it('exposes the OT-kind minutes next to the linked request so the UI can warn; a mismatch never changes a balance', async () => {
    openBalance(employee, 600);
    const cookie = await t.login('employee');
    const { request } = reserve(employee, 'leave-warn', 480);
    const day = async () => (await t.request('GET', '/api/days/2026-10-01', { cookie })).body;
    // Reserved but not used: OT-kind minutes (none yet) differ from the consumed 0 only once minutes are entered.
    expect((await day()).ot_leave).toEqual({ kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false });
    const saved = await t.request('PUT', '/api/days/2026-10-01', {
      cookie,
      body: { category: 'Vacation', leave_minutes: 480, leave_kind: 'ot', wfh: false, notes: '' },
    });
    expect(saved.body.ot_leave).toEqual({ kind_minutes: 480, consumed_minutes: 0, reversed_minutes: 0, mismatch: true });
    use(employee, request.id, 'use-warn', 480);
    expect((await day()).ot_leave).toEqual({ kind_minutes: 480, consumed_minutes: 480, reversed_minutes: 0, mismatch: false });
    const lowered = await t.request('PUT', '/api/days/2026-10-01', {
      cookie,
      body: { category: 'Vacation', leave_minutes: 240, leave_kind: 'ot', wfh: false, notes: '', expected_version: saved.body.entry.version },
    });
    expect(lowered.body.ot_leave).toEqual({ kind_minutes: 240, consumed_minutes: 480, reversed_minutes: 0, mismatch: true });
    // Other kinds never count as OT-kind minutes.
    const vacation = await t.request('PUT', '/api/days/2026-10-01', {
      cookie,
      body: { category: 'Vacation', leave_minutes: 480, leave_kind: 'vacation', wfh: false, notes: '', expected_version: lowered.body.entry.version },
    });
    expect(vacation.body.ot_leave).toEqual({ kind_minutes: 0, consumed_minutes: 480, reversed_minutes: 0, mismatch: true });
    // The warning is informational: only the explicit record-use action moved the balance.
    expect(newDeltas(employee)).toEqual([-480]);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 120, reservedMinutes: 0 });
    reverse(employee, request.id, 'rev-warn', 480);
    expect((await day()).ot_leave).toMatchObject({ consumed_minutes: 480, reversed_minutes: 480 });
  });

  it('a reservation on the same date still needs a recorded permission, and reserving never spends', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-label-date', 480);
    expect(newDeltas(employee)).toEqual([]);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 600, reservedMinutes: 480 });
    expect(request.approvalOrigin).toBe('self_recorded');
  });
});

describe('R1 (WP4-FIXB): an imported period is read-only history for OT leave (F-2)', () => {
  const PAYROLL = '2026-10-02'; // 2026-09-14 .. 2026-09-27
  const INSIDE = '2026-09-21';
  const OUTSIDE = '2026-09-28';

  /** What a committed workbook import leaves for the period: a timesheet row flagged imported_unverified. */
  function markImported(payrollDate: string): void {
    const period = payPeriodForPayrollDate(getCalendar(t.db, t.calendarId).schedule, payrollDate, []);
    const periodId = ensurePayPeriodRow(t.db, t.clock, t.calendarId, period);
    t.db
      .prepare(
        `INSERT INTO timesheets (id, user_id, pay_period_id, version, imported_unverified, created_at, updated_at)
         VALUES ('synthetic-imported-timesheet', ?, ?, 1, 1, '2026-10-02T00:00:00Z', '2026-10-02T00:00:00Z')`,
      )
      .run(employee, periodId);
  }

  it('red-first: reserving OT leave dated inside an imported period is 409 imported_period and creates nothing', () => {
    openBalance(employee, 600);
    markImported(PAYROLL);
    const before = { requests: count('SELECT count(*) FROM ot_leave_requests'), audits: count('SELECT count(*) FROM audit_events') };
    expectApiError(() => reserve(employee, 'leave-inside-imported', 120, INSIDE), 409, 'imported_period');
    expect({ requests: count('SELECT count(*) FROM ot_leave_requests'), audits: count('SELECT count(*) FROM audit_events') }).toEqual(before);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 600, reservedMinutes: 0 });
    // The refusal is for the imported period only: a date outside it, and another owner's date, are reserved as before.
    expect(reserve(employee, 'leave-outside-imported', 120, OUTSIDE).status).toBe('reserved');
    openBalance(admin, 600);
    expect(reserve(admin, 'leave-admin-same-date', 120, INSIDE).status).toBe('reserved');
  });

  it('keeps refusing the use of a reservation that predates an imported period (defence in depth)', () => {
    openBalance(employee, 600);
    const { request } = reserve(employee, 'leave-before-import', 120, INSIDE);
    markImported(PAYROLL);
    expectApiError(() => use(employee, request.id, 'use-1', 60), 409, 'imported_period');
    expect(newDeltas(employee)).toEqual([]);
    // Cancelling the reservation stays possible: it posts nothing.
    expect(cancelOtLeave(ctx, { userId: employee, actorUserId: employee, requestId: request.id }).status).toBe('cancelled');
  });
});
