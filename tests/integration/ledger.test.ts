import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeTransaction } from '../../src/server/db/database.ts';
import { ApiError } from '../../src/server/http/errors.ts';
import {
  getBalance,
  type LedgerContext,
  listLedgerEntries,
  postCorrection,
  postCredit,
  postDeficitDebit,
} from '../../src/server/services/ledger.ts';
import { expectDomainError, type LedgerFixtureFile, ledgerScenario, loadFixture } from '../support/fixtures.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

const fixture = loadFixture<LedgerFixtureFile>('ledger_cases.json');

let t: TestContext;
let ctx: LedgerContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  ctx = { db: t.db, clock: t.clock };
  employee = t.userIds.employee;
  admin = t.userIds.admin;
});

afterEach(() => t.close());

function ledgerRows(userId: string): number {
  return t.db.prepare('SELECT count(*) FROM ot_ledger WHERE user_id = ?').pluck().get(userId) as number;
}

function ledgerAudits(userId: string): number {
  return t.db
    .prepare("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND entity_type = 'ot_ledger'")
    .pluck()
    .get(userId) as number;
}

function expectApiError(action: () => unknown, status: number, code: string): void {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  expect(thrown, `expected ApiError ${code}`).toBeInstanceOf(ApiError);
  if (thrown instanceof ApiError) expect({ status: thrown.status, code: thrown.code }).toEqual({ status, code });
}

const manual = (actor: string) => ({ actorUserId: actor, origin: 'manual' as const });

function credit(userId: string, sourceKey: string, minutes: number, workDate = '2026-09-21') {
  return postCredit(ctx, { userId, sourceKey, minutes, workDate, sourceRef: 'revision-r1', ...manual(userId) });
}

/** Inserts an active reservation directly; the reservation service is WP2-T03. */
function insertReservation(userId: string, id: string, reservedMinutes: number): void {
  t.db
    .prepare(
      `INSERT INTO ot_leave_requests (id, user_id, request_key, leave_date, requested_minutes, approved_minutes,
         reserved_minutes, consumed_minutes, released_minutes, reversed_minutes, approver_name, approver_identity,
         approval_date, evidence_ref, approval_origin, approved_by_user_id, note, created_by, created_at, updated_at, version)
       VALUES (?, ?, ?, '2026-10-05', ?, ?, ?, 0, 0, 0, 'Example Manager', 'manager@example.invalid', '2026-10-01',
         'synthetic chat reference', 'self_recorded', NULL, NULL, ?, '2026-10-02T18:00:00Z', '2026-10-02T18:00:00Z', 1)`,
    )
    .run(id, userId, `key-${id}`, reservedMinutes, reservedMinutes, reservedMinutes, userId);
}

describe('LG-01 idempotent credit posting (R-06, AC-03 posting)', () => {
  it('posts the first finalize credit once; the retry returns the same entry and appends nothing', () => {
    const scenario = ledgerScenario(fixture, 'LG-01');
    const [first, retry] = scenario.events;
    if (first?.source_key === undefined || first.minutes === undefined || retry?.source_key === undefined || retry.minutes === undefined) {
      throw new Error('LG-01 events missing');
    }
    const posted = credit(employee, first.source_key, first.minutes);
    expect(posted.status).toBe('posted');
    const again = credit(employee, retry.source_key, retry.minutes);
    expect(again.status).toBe('duplicate');
    expect(again.entry.id).toBe(posted.entry.id);
    expect(listLedgerEntries(t.db, employee).map((entry) => entry.deltaMinutes)).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee).postedMinutes).toBe(scenario.expected.balance_minutes);
    expect(ledgerRows(employee)).toBe(1);
    // One audit event for the one posting; the duplicate writes nothing.
    expect(ledgerAudits(employee)).toBe(1);
  });

  it('stores the posting facts: signed delta, type, key, opaque source_ref, work date, actor and origin', () => {
    const posted = credit(employee, 'ts1-r1-day1', 60);
    expect(posted.entry).toMatchObject({
      userId: employee,
      entryType: 'credit',
      deltaMinutes: 60,
      sourceKey: 'ts1-r1-day1',
      sourceRef: 'revision-r1',
      correctsEntryId: null,
      leaveRequestId: null,
      workDate: '2026-09-21',
      actorUserId: employee,
      origin: 'manual',
      reconciliationRequired: false,
      postedAt: '2026-10-02T18:00:00Z',
    });
    expect(posted.balance).toMatchObject({ postedMinutes: 60, availableMinutes: 60 });
  });

  it('refuses a reused key with a different payload as source_key_conflict and appends nothing', () => {
    credit(employee, 'ts1-r1-day1', 60);
    expectApiError(() => credit(employee, 'ts1-r1-day1', 90), 409, 'source_key_conflict');
    expectApiError(() => credit(employee, 'ts1-r1-day1', 60, '2026-09-22'), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(1);
    expect(getBalance(t.db, employee).postedMinutes).toBe(60);
  });

  it('scopes source keys per user: the same key for another user is a separate posting', () => {
    credit(employee, 'ts1-r1-day1', 60);
    const other = credit(admin, 'ts1-r1-day1', 30);
    expect(other.status).toBe('posted');
    expect(getBalance(t.db, employee).postedMinutes).toBe(60);
    expect(getBalance(t.db, admin).postedMinutes).toBe(30);
    expect(listLedgerEntries(t.db, admin).map((entry) => entry.userId)).toEqual([admin]);
  });

  it('rejects non-positive or fractional credits and posts nothing', () => {
    expectDomainError(() => credit(employee, 'zero', 0), 'invalid_minutes');
    expectDomainError(() => credit(employee, 'fraction', 1.5), 'invalid_minutes');
    expect(ledgerRows(employee)).toBe(0);
  });

  it('a manual posting requires an actor', () => {
    expectApiError(
      () => postCredit(ctx, { userId: employee, sourceKey: 'k', minutes: 30, workDate: '2026-09-21', actorUserId: null, origin: 'manual' }),
      422,
      'actor_required',
    );
    const automatic = postCredit(ctx, {
      userId: employee,
      sourceKey: 'k',
      minutes: 30,
      workDate: '2026-09-21',
      actorUserId: null,
      origin: 'automatic',
    });
    expect(automatic.entry).toMatchObject({ actorUserId: null, origin: 'automatic' });
  });

  it('rolls back with the caller transaction: an outer failure leaves no entry and no audit event', () => {
    expect(() =>
      writeTransaction(t.db, () => {
        credit(employee, 'ts1-r1-day1', 60);
        throw new Error('synthetic failure after posting, before finalization commits');
      }),
    ).toThrow(/synthetic failure/);
    expect(ledgerRows(employee)).toBe(0);
    expect(ledgerAudits(employee)).toBe(0);
    // The same key posts normally afterwards.
    expect(credit(employee, 'ts1-r1-day1', 60).status).toBe('posted');
  });
});

describe('LG-02 correction by difference (R-06)', () => {
  it('correcting a posted 60 to 90 posts +30 linked to the original; the balance is 90', () => {
    const scenario = ledgerScenario(fixture, 'LG-02');
    const event = scenario.events[0];
    if (event?.previous_minutes === undefined || event.corrected_minutes === undefined) throw new Error('LG-02 event missing');
    const original = credit(employee, 'ts1-r1-day1', scenario.opening_balance_minutes);
    const correction = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: event.corrected_minutes,
      expectedPreviousMinutes: event.previous_minutes,
      sourceKey: 'ts1-r2-day1',
      sourceRef: 'revision-r2',
      reason: 'Synthetic forgotten clock-out corrected',
      ...manual(employee),
    });
    expect(correction.status).toBe('posted');
    expect(correction.deltaMinutes).toBe(30);
    expect(correction.entry).toMatchObject({
      entryType: 'correction',
      deltaMinutes: 30,
      correctsEntryId: original.entry.id,
      workDate: '2026-09-21',
      sourceRef: 'revision-r2',
      reason: 'Synthetic forgotten clock-out corrected',
    });
    const newDeltas = listLedgerEntries(t.db, employee)
      .slice(1)
      .map((entry) => entry.deltaMinutes);
    expect(newDeltas).toEqual(scenario.expected.new_deltas);
    expect(getBalance(t.db, employee).postedMinutes).toBe(scenario.expected.balance_minutes);
  });

  it('a retried correction returns the existing entry; a later correction uses the corrected value as old', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const input = {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: 90,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic correction',
      ...manual(employee),
    };
    const first = postCorrection(ctx, input);
    const retry = postCorrection(ctx, input);
    expect(retry.status).toBe('duplicate');
    expect(retry.entry?.id).toBe(first.entry?.id);
    const second = postCorrection(ctx, { ...input, correctedMinutes: 70, sourceKey: 'ts1-r3-day1' });
    expect(second.deltaMinutes).toBe(-20);
    expect(second.entry?.correctsEntryId).toBe(original.entry.id);
    expect(listLedgerEntries(t.db, employee).map((entry) => entry.deltaMinutes)).toEqual([60, 30, -20]);
    expect(getBalance(t.db, employee).postedMinutes).toBe(70);
  });

  it('ADV-A-01: the same correction key with a different corrected value is source_key_conflict; an identical retry still returns the entry', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const input = {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: 90,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic correction',
      ...manual(employee),
    };
    const first = postCorrection(ctx, input);
    expectApiError(() => postCorrection(ctx, { ...input, correctedMinutes: 120 }), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(2);
    // The identical retry is still a duplicate, also after a later correction changed the current value.
    postCorrection(ctx, { ...input, correctedMinutes: 70, sourceKey: 'ts1-r3-day1' });
    const retry = postCorrection(ctx, input);
    expect(retry.status).toBe('duplicate');
    expect(retry.entry?.id).toBe(first.entry?.id);
    expectApiError(() => postCorrection(ctx, { ...input, correctedMinutes: 70 }), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(3);
  });

  it('ADV-A-01: a conflicting retry of a deficit-debit correction is also source_key_conflict', () => {
    credit(employee, 'credit-1', 120);
    const debit = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 60, workDate: '2026-09-22', ...manual(employee) });
    if (debit.status === 'pending') throw new Error('debit unexpectedly pending');
    const input = {
      userId: employee,
      originalEntryId: debit.entry.id,
      correctedMinutes: 15,
      sourceKey: 'debit-1-r2',
      reason: 'Synthetic deficit corrected',
      ...manual(employee),
    };
    postCorrection(ctx, input);
    expect(postCorrection(ctx, input).status).toBe('duplicate');
    expectApiError(() => postCorrection(ctx, { ...input, correctedMinutes: 20 }), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(3);
  });

  it('R1: the same correction key with a different source reference is source_key_conflict and appends nothing', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const input = {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: 90,
      sourceKey: 'rev:revision-r2:day:2026-09-21:correction',
      sourceRef: 'revision-r2',
      reason: 'Synthetic correction',
      ...manual(employee),
    };
    const first = postCorrection(ctx, input);
    // A retry of another revision (or another source) must not silently take over the posted entry.
    expectApiError(() => postCorrection(ctx, { ...input, sourceRef: 'revision-r3' }), 409, 'source_key_conflict');
    expectApiError(() => postCorrection(ctx, { ...input, sourceRef: undefined }), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(2);
    const retry = postCorrection(ctx, input);
    expect(retry.status).toBe('duplicate');
    expect(retry.entry?.id).toBe(first.entry?.id);
    expect(ledgerRows(employee)).toBe(2);
  });

  it('R1: a deficit-debit correction retry with a different source reference is also source_key_conflict', () => {
    credit(employee, 'credit-1', 120);
    const debit = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 60, workDate: '2026-09-22', ...manual(employee) });
    if (debit.status === 'pending') throw new Error('debit unexpectedly pending');
    const input = {
      userId: employee,
      originalEntryId: debit.entry.id,
      correctedMinutes: 15,
      sourceKey: 'rev:revision-r2:day:2026-09-22:correction',
      sourceRef: 'revision-r2',
      reason: 'Synthetic deficit corrected',
      ...manual(employee),
    };
    postCorrection(ctx, input);
    expectApiError(() => postCorrection(ctx, { ...input, sourceRef: 'revision-r3' }), 409, 'source_key_conflict');
    expect(ledgerRows(employee)).toBe(3);
  });

  it('refuses a stale expected previous value with 409 and appends nothing', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    expectApiError(
      () =>
        postCorrection(ctx, {
          userId: employee,
          originalEntryId: original.entry.id,
          correctedMinutes: 90,
          expectedPreviousMinutes: 45,
          sourceKey: 'ts1-r2-day1',
          reason: 'Synthetic correction',
          ...manual(employee),
        }),
      409,
      'stale_correction',
    );
    expect(ledgerRows(employee)).toBe(1);
  });

  it('requires a reason, refuses another user’s entry (404) and refuses correcting a correction', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const base = { userId: employee, originalEntryId: original.entry.id, correctedMinutes: 90, sourceKey: 'c1', ...manual(employee) };
    expectApiError(() => postCorrection(ctx, { ...base, reason: '   ' }), 422, 'reason_required');
    // Owner scoping: the admin cannot correct the employee's entry by ID.
    expectApiError(
      () => postCorrection(ctx, { ...base, userId: admin, actorUserId: admin, reason: 'Synthetic swap attempt' }),
      404,
      'not_found',
    );
    const correction = postCorrection(ctx, { ...base, reason: 'Synthetic correction' });
    expectApiError(
      () =>
        postCorrection(ctx, {
          ...base,
          originalEntryId: correction.entry?.id ?? '',
          sourceKey: 'c2',
          reason: 'Synthetic correction of a correction',
        }),
      422,
      'invalid_correction_target',
    );
    expect(listLedgerEntries(t.db, employee).map((entry) => entry.deltaMinutes)).toEqual([60, 30]);
    expect(ledgerRows(admin)).toBe(0);
  });

  it('corrects a posted deficit debit by its difference in debit minutes', () => {
    credit(employee, 'credit-1', 120);
    const debit = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 60, workDate: '2026-09-22', ...manual(employee) });
    if (debit.status === 'pending') throw new Error('debit unexpectedly pending');
    const correction = postCorrection(ctx, {
      userId: employee,
      originalEntryId: debit.entry.id,
      correctedMinutes: 15,
      sourceKey: 'debit-1-r2',
      reason: 'Synthetic deficit corrected',
      ...manual(employee),
    });
    expect(correction.deltaMinutes).toBe(45);
    expect(getBalance(t.db, employee).postedMinutes).toBe(120 - 15);
  });
});

describe('LG-08 truthful negative correction is kept and flagged', () => {
  it('correcting an already spent 60 credit to 0 posts −60, keeps −60 and requires reconciliation', () => {
    const scenario = ledgerScenario(fixture, 'LG-08');
    const event = scenario.events[0];
    if (event?.previous_minutes === undefined || event.corrected_minutes === undefined) throw new Error('LG-08 event missing');
    expect(event.previous_credit_already_spent).toBe(true);
    // Setup: the 60 credit was posted and then spent, so the opening balance is 0.
    const original = credit(employee, 'ts1-r1-day1', event.previous_minutes);
    const spend = postDeficitDebit(ctx, {
      userId: employee,
      sourceKey: 'ts1-r1-day2-debit',
      debitMinutes: event.previous_minutes,
      workDate: '2026-09-22',
      ...manual(employee),
    });
    expect(spend.status).toBe('posted');
    expect(getBalance(t.db, employee).postedMinutes).toBe(scenario.opening_balance_minutes);
    const before = ledgerRows(employee);

    const correction = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: event.corrected_minutes,
      expectedPreviousMinutes: event.previous_minutes,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic: day was not worked',
      ...manual(employee),
    });
    expect(correction.status).toBe('posted');
    const newDeltas = listLedgerEntries(t.db, employee)
      .slice(before)
      .map((entry) => entry.deltaMinutes);
    expect(newDeltas).toEqual(scenario.expected.new_deltas);
    expect(correction.reconciliationRequired).toBe(scenario.expected.reconciliation_required);
    expect(correction.entry?.reconciliationRequired).toBe(true);
    expect(correction.balance).toMatchObject({ postedMinutes: scenario.expected.balance_minutes, negative: true });
    expect(getBalance(t.db, employee)).toMatchObject({
      postedMinutes: scenario.expected.balance_minutes,
      negative: true,
      reconciliationRequired: true,
    });
  });

  it('a correction that leaves the balance non-negative is not flagged', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const correction = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: 30,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic correction',
      ...manual(employee),
    });
    expect(correction.reconciliationRequired).toBe(false);
    expect(correction.entry?.reconciliationRequired).toBe(false);
  });
});

describe('LG-09 zero-delta correction', () => {
  it('an unchanged revision posts no delta and leaves the balance at 60', () => {
    const scenario = ledgerScenario(fixture, 'LG-09');
    const previous = scenario.events[0]?.previous_credit_minutes;
    if (previous === undefined) throw new Error('LG-09 event missing');
    const original = credit(employee, 'ts1-r1-day1', previous);
    const before = ledgerRows(employee);
    const audits = ledgerAudits(employee);
    const unchanged = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: previous,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic late review of an unchanged automatic revision',
      actorUserId: employee,
      origin: 'manual',
    });
    expect(unchanged).toMatchObject({ status: 'unchanged', entry: null, deltaMinutes: 0 });
    expect(ledgerRows(employee) - before).toBe(scenario.expected.new_deltas.length);
    expect(ledgerAudits(employee)).toBe(audits);
    expect(getBalance(t.db, employee).postedMinutes).toBe(scenario.expected.balance_minutes);
  });
});

describe('ADV-A-02 correction that increases a deficit debit applies R-05', () => {
  function debitOf(minutes: number) {
    const debit = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: minutes, workDate: '2026-09-22', ...manual(employee) });
    if (debit.status === 'pending') throw new Error('debit unexpectedly pending');
    return debit.entry;
  }
  const raise = (originalEntryId: string, correctedMinutes: number, sourceKey = 'debit-1-r2') =>
    postCorrection(ctx, { userId: employee, originalEntryId, correctedMinutes, sourceKey, reason: 'Synthetic deficit raised', ...manual(employee) });

  it('an increase the available balance cannot cover stays pending: no entry, no negative balance', () => {
    credit(employee, 'credit-1', 60);
    const debit = debitOf(60);
    const before = { rows: ledgerRows(employee), audits: ledgerAudits(employee) };
    const result = raise(debit.id, 90);
    expect(result).toMatchObject({
      status: 'pending',
      reason: 'insufficient_balance',
      entry: null,
      deltaMinutes: 0,
      debitIncreaseMinutes: 30,
      availableMinutes: 0,
    });
    expect(ledgerRows(employee)).toBe(before.rows);
    expect(ledgerAudits(employee)).toBe(before.audits);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 0, negative: false, reconciliationRequired: false });
  });

  it('only the increase is checked and reservations reduce what it may use', () => {
    credit(employee, 'credit-1', 100);
    const debit = debitOf(40);
    insertReservation(employee, 'leave-a', 50);
    // posted 60, reserved 50, available 10.
    expect(raise(debit.id, 60).status).toBe('pending');
    const exact = raise(debit.id, 50);
    expect(exact).toMatchObject({ status: 'posted', deltaMinutes: -10 });
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 50, reservedMinutes: 50, availableMinutes: 0, negative: false });
  });

  it('a pending increase retried after more credit arrives posts once', () => {
    credit(employee, 'credit-1', 60);
    const debit = debitOf(60);
    expect(raise(debit.id, 90).status).toBe('pending');
    credit(employee, 'credit-2', 30, '2026-09-23');
    const posted = raise(debit.id, 90);
    expect(posted).toMatchObject({ status: 'posted', deltaMinutes: -30 });
    expect(raise(debit.id, 90).status).toBe('duplicate');
    expect(getBalance(t.db, employee).postedMinutes).toBe(0);
  });

  it('reducing a debit and reducing a spent credit are not blocked (a truthful credit correction may go negative)', () => {
    credit(employee, 'credit-1', 60);
    const debit = debitOf(60);
    expect(raise(debit.id, 20).status).toBe('posted');
    const original = listLedgerEntries(t.db, employee)[0];
    if (original === undefined) throw new Error('credit missing');
    const lower = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.id,
      correctedMinutes: 0,
      sourceKey: 'credit-1-r2',
      reason: 'Synthetic: day was not worked',
      ...manual(employee),
    });
    expect(lower).toMatchObject({ status: 'posted', deltaMinutes: -60, reconciliationRequired: true });
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: -20, negative: true, reconciliationRequired: true });
  });
});

describe('R-05 deficit debit outcome', () => {
  it('insufficient available balance returns pending with no entry (no silent overdraft)', () => {
    credit(employee, 'credit-1', 30);
    const result = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 60, workDate: '2026-09-22', ...manual(employee) });
    expect(result).toMatchObject({
      status: 'pending',
      reason: 'insufficient_balance',
      entry: null,
      debitMinutes: 60,
      availableMinutes: 30,
    });
    expect(ledgerRows(employee)).toBe(1);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 30, negative: false });
  });

  it('active reservations reduce what a debit may use', () => {
    credit(employee, 'credit-1', 100);
    insertReservation(employee, 'leave-a', 80);
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 100, reservedMinutes: 80, availableMinutes: 20 });
    const pending = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 30, workDate: '2026-09-22', ...manual(employee) });
    expect(pending).toMatchObject({ status: 'pending', availableMinutes: 20 });
    const exact = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-2', debitMinutes: 20, workDate: '2026-09-23', ...manual(employee) });
    expect(exact.status).toBe('posted');
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: 80, reservedMinutes: 80, availableMinutes: 0 });
  });

  it('a sufficient balance posts the exact debit as a negative delta once; a retry returns it', () => {
    credit(employee, 'credit-1', 120);
    const input = { userId: employee, sourceKey: 'ts1-r1-day3-debit', debitMinutes: 61, workDate: '2026-09-23', ...manual(employee) };
    const posted = postDeficitDebit(ctx, input);
    if (posted.status === 'pending') throw new Error('debit unexpectedly pending');
    expect(posted.entry).toMatchObject({ entryType: 'deficit_debit', deltaMinutes: -61, workDate: '2026-09-23' });
    const retry = postDeficitDebit(ctx, input);
    expect(retry.status).toBe('duplicate');
    expect(retry.entry?.id).toBe(posted.entry.id);
    expect(getBalance(t.db, employee).postedMinutes).toBe(59);
    expect(ledgerRows(employee)).toBe(2);
  });

  it('another user’s balance never funds a debit', () => {
    credit(admin, 'credit-1', 600);
    const result = postDeficitDebit(ctx, { userId: employee, sourceKey: 'debit-1', debitMinutes: 10, workDate: '2026-09-22', ...manual(employee) });
    expect(result.status).toBe('pending');
    expect(ledgerRows(employee)).toBe(0);
  });
});

describe('append-only and versioned storage (triggers)', () => {
  it('rejects UPDATE and DELETE on ledger entries', () => {
    credit(employee, 'ts1-r1-day1', 60);
    expect(() => t.db.prepare('UPDATE ot_ledger SET delta_minutes = 600').run()).toThrow(/immutable_ledger_entry/);
    expect(() => t.db.prepare("UPDATE ot_ledger SET reason = 'x'").run()).toThrow(/immutable_ledger_entry/);
    expect(() => t.db.prepare('DELETE FROM ot_ledger').run()).toThrow(/immutable_ledger_entry/);
    expect(getBalance(t.db, employee).postedMinutes).toBe(60);
  });

  it('enforces delta sign, links and per-user unique keys in the schema itself', () => {
    const original = credit(employee, 'ts1-r1-day1', 60);
    const insert = (values: { type: string; delta: number; key: string; corrects?: string | null; user?: string; reason?: string | null }) =>
      t.db
        .prepare(
          `INSERT INTO ot_ledger (id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
             leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?, NULL, '2026-09-21', NULL, 'system', ?, 0, '2026-10-02T18:00:00Z')`,
        )
        .run(`raw-${values.key}`, values.user ?? employee, values.type, values.delta, values.key, values.corrects ?? null, values.reason ?? null);
    expect(() => insert({ type: 'credit', delta: -5, key: 'neg-credit' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ type: 'deficit_debit', delta: 5, key: 'pos-debit' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ type: 'credit', delta: 0, key: 'zero' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ type: 'credit', delta: 5, key: 'ts1-r1-day1' })).toThrow(/UNIQUE constraint failed/);
    expect(() => insert({ type: 'correction', delta: 5, key: 'unlinked', reason: 'x' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ type: 'correction', delta: 5, key: 'no-reason', corrects: original.entry.id })).toThrow(/CHECK constraint failed/);
    // A correction cannot link to another user's entry (the BEFORE INSERT trigger fires
    // before the composite foreign key, which guards the same link).
    expect(() => insert({ type: 'correction', delta: 5, key: 'cross', corrects: original.entry.id, user: admin, reason: 'x' })).toThrow(
      /invalid_correction_target/,
    );
    // Nor to a correction, nor to a missing entry.
    const correction = postCorrection(ctx, {
      userId: employee,
      originalEntryId: original.entry.id,
      correctedMinutes: 90,
      sourceKey: 'ts1-r2-day1',
      reason: 'Synthetic correction',
      ...manual(employee),
    });
    expect(() => insert({ type: 'correction', delta: 5, key: 'chain', corrects: correction.entry?.id ?? '', reason: 'x' })).toThrow(
      /invalid_correction_target/,
    );
    expect(() => insert({ type: 'correction', delta: 5, key: 'missing', corrects: 'no-such-entry', reason: 'x' })).toThrow(
      /invalid_correction_target/,
    );
    expect(ledgerRows(employee)).toBe(2);
  });

  it('red-first: holds one opening balance per user with its as-of date, reason and evidence, immutable and correctable (F-3)', () => {
    const insert = (values: {
      id: string;
      type?: string;
      delta?: number;
      key?: string;
      user?: string;
      workDate?: string | null;
      asOf?: string | null;
      evidence?: string | null;
      reason?: string | null;
      corrects?: string | null;
    }) =>
      t.db
        .prepare(
          `INSERT INTO ot_ledger (id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
             leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at, as_of_date, evidence_ref)
           VALUES (?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, 'manual', ?, 0, '2026-10-02T18:00:00Z', ?, ?)`,
        )
        .run(
          values.id,
          values.user ?? employee,
          values.type ?? 'opening_balance',
          values.delta ?? -45,
          values.key ?? values.id,
          values.corrects ?? null,
          values.workDate ?? null,
          values.user ?? employee,
          values.reason === undefined ? 'Synthetic carried-in balance' : values.reason,
          values.asOf === undefined ? '2026-08-30' : values.asOf,
          values.evidence === undefined ? 'Synthetic letter' : values.evidence,
        );
    insert({ id: 'opening-1', key: 'opening_balance' });
    expect(getBalance(t.db, employee)).toMatchObject({ postedMinutes: -45, negative: true });
    // Every fact is required; an opening balance has no work date and only it carries an as-of date.
    expect(() => insert({ id: 'no-as-of', user: admin, asOf: null })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'bad-as-of', user: admin, asOf: '30/08/2026' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'no-evidence', user: admin, evidence: null })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'blank-evidence', user: admin, evidence: '  ' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'no-reason', user: admin, reason: null })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'with-day', user: admin, workDate: '2026-08-30' })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'zero', user: admin, delta: 0 })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'credit-as-of', user: admin, type: 'credit', delta: 5, workDate: '2026-09-21', evidence: null })).toThrow(/CHECK constraint failed/);
    expect(() => insert({ id: 'credit-evidence', user: admin, type: 'credit', delta: 5, workDate: '2026-09-21', asOf: null })).toThrow(/CHECK constraint failed/);
    // One per user, whatever the key.
    expect(() => insert({ id: 'opening-2', key: 'another-opening-key' })).toThrow(/UNIQUE constraint failed/);
    insert({ id: 'opening-admin', user: admin, key: 'opening_balance', delta: 30 });
    // A correction may target the opening balance (and keeps its evidence); the chain still ends at the original.
    insert({ id: 'opening-fix', type: 'correction', delta: 75, key: 'opening_balance:correction:1', asOf: null, corrects: 'opening-1', reason: 'Synthetic recount' });
    expect(() =>
      insert({ id: 'opening-chain', type: 'correction', delta: 5, key: 'chain', asOf: null, corrects: 'opening-fix', reason: 'Synthetic recount' }),
    ).toThrow(/invalid_correction_target/);
    expect(getBalance(t.db, employee).postedMinutes).toBe(30);
    // The rebuilt table keeps its append-only triggers for the new rows too.
    expect(() => t.db.prepare("UPDATE ot_ledger SET evidence_ref = 'x' WHERE id = 'opening-1'").run()).toThrow(/immutable_ledger_entry/);
    expect(() => t.db.prepare("DELETE FROM ot_ledger WHERE id = 'opening-1'").run()).toThrow(/immutable_ledger_entry/);
    expect(listLedgerEntries(t.db, employee).map((entry) => [entry.entryType, entry.deltaMinutes, entry.asOfDate, entry.evidenceRef])).toEqual([
      ['opening_balance', -45, '2026-08-30', 'Synthetic letter'],
      ['correction', 75, null, 'Synthetic letter'],
    ]);
  });

  it('keeps leave requests undeletable, with immutable permission facts, monotonic counters and +1 versions', () => {
    insertReservation(employee, 'leave-a', 120);
    expect(() => t.db.prepare('DELETE FROM ot_leave_requests').run()).toThrow(/immutable_leave_request/);
    expect(() => t.db.prepare("UPDATE ot_leave_requests SET approver_name = 'Someone else', version = version + 1").run()).toThrow(
      /immutable_leave_request/,
    );
    expect(() => t.db.prepare('UPDATE ot_leave_requests SET approved_minutes = 60, reserved_minutes = 60, version = version + 1').run()).toThrow(
      /immutable_leave_request/,
    );
    // Partial consumption without a version bump is refused.
    expect(() => t.db.prepare('UPDATE ot_leave_requests SET reserved_minutes = 60, consumed_minutes = 60').run()).toThrow(
      /immutable_leave_request_version/,
    );
    // A versioned partial consumption is accepted: 120 approved = 60 reserved + 60 consumed.
    t.db.prepare("UPDATE ot_leave_requests SET reserved_minutes = 60, consumed_minutes = 60, version = version + 1, updated_at = '2026-10-05T18:00:00Z'").run();
    // Counters never move backwards.
    expect(() => t.db.prepare('UPDATE ot_leave_requests SET reserved_minutes = 120, consumed_minutes = 0, version = version + 1').run()).toThrow(
      /immutable_leave_request_counters/,
    );
    // Conservation: approved = reserved + consumed + released.
    expect(() => t.db.prepare('UPDATE ot_leave_requests SET reserved_minutes = 0, version = version + 1').run()).toThrow(
      /CHECK constraint failed/,
    );
    // Reversal cannot exceed consumption.
    expect(() => t.db.prepare('UPDATE ot_leave_requests SET reversed_minutes = 61, version = version + 1').run()).toThrow(
      /CHECK constraint failed/,
    );
    expect(t.db.prepare('SELECT reserved_minutes, consumed_minutes, version FROM ot_leave_requests').get()).toEqual({
      reserved_minutes: 60,
      consumed_minutes: 60,
      version: 2,
    });
    expect(getBalance(t.db, employee)).toMatchObject({ reservedMinutes: 60 });
  });
});
