import { randomUUID } from 'node:crypto';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { DomainError } from '../../domain/errors.ts';
import { canDebit, correctionDelta, type LedgerBalance, summarizeBalance } from '../../domain/ledger.ts';
import { assertWholeMinutes } from '../../domain/overtime.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { normalizeReason } from '../http/validation.ts';
import { recordAudit } from './audit.ts';

/*
 * Internal OT ledger service (R-06, R-05 debit outcome). There is deliberately no HTTP
 * route: WP3 finalization calls these functions inside its own transaction, and the
 * WP2 leave service builds on them. Every function is owner-scoped by `userId`, runs in
 * a short IMMEDIATE transaction (a savepoint when the caller already holds one, so a
 * caller failure rolls the posting back), appends only, and records an audit event for
 * each appended entry.
 *
 * Idempotency: `sourceKey` is unique per user. Repeating a posting with the same key
 * and the same payload returns the existing entry (status `duplicate`) and appends
 * nothing; the same key with a different payload is a `source_key_conflict`.
 */

export interface LedgerContext {
  db: Db;
  clock: Clock;
}

export type LedgerEntryType = 'credit' | 'deficit_debit' | 'correction' | 'leave_consumption' | 'leave_reversal';

/** `manual`: a person's action; `automatic`: unattended finalization; `system`: setup/maintenance. */
export type LedgerOrigin = 'manual' | 'automatic' | 'system';

export interface LedgerEntry {
  id: string;
  userId: string;
  entryType: LedgerEntryType;
  deltaMinutes: number;
  sourceKey: string;
  sourceRef: string | null;
  correctsEntryId: string | null;
  leaveRequestId: string | null;
  workDate: CivilDate | null;
  actorUserId: string | null;
  origin: LedgerOrigin;
  reason: string | null;
  reconciliationRequired: boolean;
  postedAt: string;
}

interface PostingInput {
  /** Owner of the balance. */
  userId: string;
  /** Unique per user; identifies the source event (for example timesheet, revision and day). */
  sourceKey: string;
  /** Opaque reference to the source record (future WP3 revision ID). */
  sourceRef?: string | null;
  actorUserId: string | null;
  origin: LedgerOrigin;
  reason?: string | null;
}

export interface CreditInput extends PostingInput {
  workDate: CivilDate;
  /** Credited minutes for the day; positive whole minutes. */
  minutes: number;
}

export interface CorrectionInput extends PostingInput {
  /** The original credit or deficit debit; corrections always link to the original. */
  originalEntryId: string;
  /** The corrected magnitude, in the original's unit (credited or debited minutes). */
  correctedMinutes: number;
  /** Optional guard: the magnitude the caller believes is currently posted. */
  expectedPreviousMinutes?: number;
  /** Corrections of posted values always need a reason (R-07). */
  reason: string;
}

export interface DeficitDebitInput extends PostingInput {
  workDate: CivilDate;
  /** Positive magnitude of an authorized deficit; posts as a negative delta. */
  debitMinutes: number;
}

export interface PostResult {
  status: 'posted' | 'duplicate';
  entry: LedgerEntry;
  balance: LedgerBalance;
}

export type CorrectionResult =
  | {
      status: 'posted' | 'duplicate';
      entry: LedgerEntry;
      deltaMinutes: number;
      reconciliationRequired: boolean;
      balance: LedgerBalance;
    }
  | {
      /** The corrected value equals the posted value: nothing is appended (LG-09). */
      status: 'unchanged';
      entry: null;
      deltaMinutes: 0;
      reconciliationRequired: boolean;
      balance: LedgerBalance;
    }
  | {
      /**
       * R-05: raising a deficit debit by more than the available balance stays pending;
       * nothing is appended and the balance is never silently overdrawn.
       */
      status: 'pending';
      reason: 'insufficient_balance';
      entry: null;
      deltaMinutes: 0;
      debitIncreaseMinutes: number;
      availableMinutes: number;
      reconciliationRequired: boolean;
      balance: LedgerBalance;
    };

export type DeficitDebitResult =
  | PostResult
  | {
      /** R-05: the proposed debit stays pending; the balance is never silently overdrawn. */
      status: 'pending';
      reason: 'insufficient_balance';
      entry: null;
      debitMinutes: number;
      availableMinutes: number;
      balance: LedgerBalance;
    };

interface LedgerRow {
  id: string;
  user_id: string;
  entry_type: LedgerEntryType;
  delta_minutes: number;
  source_key: string;
  source_ref: string | null;
  corrects_entry_id: string | null;
  leave_request_id: string | null;
  work_date: string | null;
  actor_user_id: string | null;
  origin: LedgerOrigin;
  reason: string | null;
  reconciliation_required: number;
  posted_at: string;
}

const ORIGINS: ReadonlySet<string> = new Set<LedgerOrigin>(['manual', 'automatic', 'system']);
const MAX_KEY_LENGTH = 200;
const MAX_REASON_LENGTH = 2000;

function toEntry(row: LedgerRow): LedgerEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryType: row.entry_type,
    deltaMinutes: row.delta_minutes,
    sourceKey: row.source_key,
    sourceRef: row.source_ref,
    correctsEntryId: row.corrects_entry_id,
    leaveRequestId: row.leave_request_id,
    workDate: row.work_date,
    actorUserId: row.actor_user_id,
    origin: row.origin,
    reason: row.reason,
    reconciliationRequired: row.reconciliation_required === 1,
    postedAt: row.posted_at,
  };
}

/** Audit snapshot of an appended entry (snake_case like other audit payloads). */
function entryJson(entry: LedgerEntry) {
  return {
    id: entry.id,
    entry_type: entry.entryType,
    delta_minutes: entry.deltaMinutes,
    source_key: entry.sourceKey,
    source_ref: entry.sourceRef,
    corrects_entry_id: entry.correctsEntryId,
    leave_request_id: entry.leaveRequestId,
    work_date: entry.workDate,
    origin: entry.origin,
    reconciliation_required: entry.reconciliationRequired,
  };
}

interface NormalizedPosting {
  userId: string;
  sourceKey: string;
  sourceRef: string | null;
  actorUserId: string | null;
  origin: LedgerOrigin;
  reason: string | null;
}

function normalizePosting(input: PostingInput): NormalizedPosting {
  const sourceKey = input.sourceKey.trim();
  if (sourceKey === '' || sourceKey.length > MAX_KEY_LENGTH) {
    throw new ApiError(422, 'invalid_source_key', `sourceKey must be 1–${MAX_KEY_LENGTH} characters`);
  }
  const sourceRef = input.sourceRef?.trim() ?? '';
  if (sourceRef.length > MAX_KEY_LENGTH) {
    throw new ApiError(422, 'invalid_source_ref', `sourceRef must be at most ${MAX_KEY_LENGTH} characters`);
  }
  if (!ORIGINS.has(input.origin)) throw new ApiError(422, 'invalid_origin', 'Unknown ledger origin');
  if (input.origin === 'manual' && input.actorUserId === null) {
    throw new ApiError(422, 'actor_required', 'A manual ledger posting needs the acting user');
  }
  const reason = normalizeReason(input.reason);
  if (reason !== null && reason.length > MAX_REASON_LENGTH) {
    throw new ApiError(422, 'invalid_reason', `reason must be at most ${MAX_REASON_LENGTH} characters`);
  }
  return {
    userId: input.userId,
    sourceKey,
    sourceRef: sourceRef === '' ? null : sourceRef,
    actorUserId: input.actorUserId,
    origin: input.origin,
    reason,
  };
}

function findByKey(db: Db, userId: string, sourceKey: string): LedgerEntry | undefined {
  const row = db.prepare('SELECT * FROM ot_ledger WHERE user_id = ? AND source_key = ?').get(userId, sourceKey) as
    | LedgerRow
    | undefined;
  return row === undefined ? undefined : toEntry(row);
}

function sourceKeyConflict(): ApiError {
  return new ApiError(409, 'source_key_conflict', 'This source event was already posted with different values');
}

/** Owner-scoped balance from the pure engine: posted = sum(deltas), available = posted − reserved. */
function balanceOf(db: Db, userId: string, extraDelta?: number): LedgerBalance {
  const deltas = db.prepare('SELECT delta_minutes FROM ot_ledger WHERE user_id = ? ORDER BY rowid').pluck().all(userId) as number[];
  const reservations = db
    .prepare('SELECT reserved_minutes FROM ot_leave_requests WHERE user_id = ? AND reserved_minutes > 0')
    .pluck()
    .all(userId) as number[];
  return summarizeBalance(extraDelta === undefined ? deltas : [...deltas, extraDelta], reservations);
}

interface NewEntry {
  entryType: LedgerEntryType;
  deltaMinutes: number;
  workDate: CivilDate | null;
  correctsEntryId?: string | null;
  reconciliationRequired?: boolean;
}

function appendEntry(ctx: LedgerContext, posting: NormalizedPosting, values: NewEntry): LedgerEntry {
  const entry: LedgerEntry = {
    id: randomUUID(),
    userId: posting.userId,
    entryType: values.entryType,
    deltaMinutes: values.deltaMinutes,
    sourceKey: posting.sourceKey,
    sourceRef: posting.sourceRef,
    correctsEntryId: values.correctsEntryId ?? null,
    leaveRequestId: null,
    workDate: values.workDate,
    actorUserId: posting.actorUserId,
    origin: posting.origin,
    reason: posting.reason,
    reconciliationRequired: values.reconciliationRequired ?? false,
    postedAt: nowUtc(ctx.clock),
  };
  ctx.db
    .prepare(
      `INSERT INTO ot_ledger (id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
         leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      entry.id,
      entry.userId,
      entry.entryType,
      entry.deltaMinutes,
      entry.sourceKey,
      entry.sourceRef,
      entry.correctsEntryId,
      entry.leaveRequestId,
      entry.workDate,
      entry.actorUserId,
      entry.origin,
      entry.reason,
      entry.reconciliationRequired ? 1 : 0,
      entry.postedAt,
    );
  recordAudit(ctx.db, ctx.clock, {
    actorUserId: entry.actorUserId,
    ownerUserId: entry.userId,
    operation: `ot_ledger.${entry.entryType}`,
    entityType: 'ot_ledger',
    entityId: entry.id,
    reason: entry.reason,
    after: entryJson(entry),
  });
  return entry;
}

function assertPositiveMinutes(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new DomainError('invalid_minutes', `${field} must be a positive whole number of minutes`, { field });
  }
}

/**
 * Posts a day's credited minutes once. A retry with the same source key and payload
 * returns the existing entry and appends nothing (LG-01).
 */
export function postCredit(ctx: LedgerContext, input: CreditInput): PostResult {
  const posting = normalizePosting(input);
  const workDate = assertCivilDate(input.workDate, 'workDate');
  assertPositiveMinutes(input.minutes, 'minutes');
  return writeTransaction(ctx.db, () => {
    const existing = findByKey(ctx.db, posting.userId, posting.sourceKey);
    if (existing !== undefined) {
      const same =
        existing.entryType === 'credit' &&
        existing.deltaMinutes === input.minutes &&
        existing.workDate === workDate &&
        existing.sourceRef === posting.sourceRef;
      if (!same) throw sourceKeyConflict();
      return { status: 'duplicate', entry: existing, balance: balanceOf(ctx.db, posting.userId) };
    }
    const entry = appendEntry(ctx, posting, { entryType: 'credit', deltaMinutes: input.minutes, workDate });
    return { status: 'posted', entry, balance: balanceOf(ctx.db, posting.userId) };
  });
}

/**
 * Corrects a posted credit or deficit debit by its difference, linked to the original
 * (old 60 → new 90 posts +30, LG-02). The previous value is the original plus all
 * earlier corrections. An unchanged value appends nothing (LG-09). A truthful
 * correction of a spent credit that makes the balance negative is kept and flagged
 * (LG-08). Raising a deficit debit is a new debit of the increase: when the available
 * balance cannot cover it the result is `pending` and nothing is appended (R-05).
 * A retry with the same key must ask for the same corrected value, else `source_key_conflict`.
 */
export function postCorrection(ctx: LedgerContext, input: CorrectionInput): CorrectionResult {
  const posting = normalizePosting(input);
  if (posting.reason === null) {
    throw new ApiError(422, 'reason_required', 'Correcting a posted ledger value requires a reason');
  }
  assertWholeMinutes(input.correctedMinutes, 'correctedMinutes');
  if (input.expectedPreviousMinutes !== undefined) assertWholeMinutes(input.expectedPreviousMinutes, 'expectedPreviousMinutes');
  return writeTransaction(ctx.db, () => {
    const original = ctx.db
      .prepare('SELECT * FROM ot_ledger WHERE id = ? AND user_id = ?')
      .get(input.originalEntryId, posting.userId) as LedgerRow | undefined;
    // Another user's entry is indistinguishable from a missing one.
    if (original === undefined) throw notFound('Ledger entry');

    const existing = findByKey(ctx.db, posting.userId, posting.sourceKey);
    if (existing !== undefined) {
      if (existing.entryType !== 'correction' || existing.correctsEntryId !== original.id) throw sourceKeyConflict();
      // The retry must ask for the value this entry produced: the original plus all corrections up to it.
      const throughExisting = ctx.db
        .prepare(
          `SELECT delta_minutes FROM ot_ledger
            WHERE user_id = ? AND corrects_entry_id = ? AND rowid <= (SELECT rowid FROM ot_ledger WHERE id = ?)`,
        )
        .pluck()
        .all(posting.userId, original.id, existing.id) as number[];
      const impliedMinutes = Math.abs(throughExisting.reduce((total, delta) => total + delta, original.delta_minutes));
      if (impliedMinutes !== input.correctedMinutes) throw sourceKeyConflict();
      return {
        status: 'duplicate',
        entry: existing,
        deltaMinutes: existing.deltaMinutes,
        reconciliationRequired: existing.reconciliationRequired,
        balance: balanceOf(ctx.db, posting.userId),
      };
    }

    if (original.entry_type !== 'credit' && original.entry_type !== 'deficit_debit') {
      throw new ApiError(422, 'invalid_correction_target', 'Only an original credit or deficit debit can be corrected');
    }
    // Credits are positive deltas; debits are negative deltas of a positive magnitude.
    const sign = original.entry_type === 'credit' ? 1 : -1;
    const earlier = ctx.db
      .prepare('SELECT delta_minutes FROM ot_ledger WHERE user_id = ? AND corrects_entry_id = ? ORDER BY rowid')
      .pluck()
      .all(posting.userId, original.id) as number[];
    const previousMinutes = sign * earlier.reduce((total, delta) => total + delta, original.delta_minutes);
    if (input.expectedPreviousMinutes !== undefined && input.expectedPreviousMinutes !== previousMinutes) {
      throw new ApiError(409, 'stale_correction', 'The posted value changed since it was loaded', {
        posted_minutes: previousMinutes,
      });
    }
    const deltaMinutes = sign * correctionDelta(previousMinutes, input.correctedMinutes);
    if (deltaMinutes === 0) {
      const balance = balanceOf(ctx.db, posting.userId);
      return { status: 'unchanged', entry: null, deltaMinutes: 0, reconciliationRequired: balance.reconciliationRequired, balance };
    }
    if (original.entry_type === 'deficit_debit' && deltaMinutes < 0) {
      // R-05: raising a debit is a new debit of the increase; it needs the available balance.
      const available = balanceOf(ctx.db, posting.userId);
      if (!canDebit(available.availableMinutes, -deltaMinutes)) {
        return {
          status: 'pending',
          reason: 'insufficient_balance',
          entry: null,
          deltaMinutes: 0,
          debitIncreaseMinutes: -deltaMinutes,
          availableMinutes: available.availableMinutes,
          reconciliationRequired: available.reconciliationRequired,
          balance: available,
        };
      }
    }
    const projected = balanceOf(ctx.db, posting.userId, deltaMinutes);
    const entry = appendEntry(ctx, posting, {
      entryType: 'correction',
      deltaMinutes,
      workDate: original.work_date,
      correctsEntryId: original.id,
      reconciliationRequired: projected.reconciliationRequired,
    });
    return {
      status: 'posted',
      entry,
      deltaMinutes,
      reconciliationRequired: projected.reconciliationRequired,
      balance: balanceOf(ctx.db, posting.userId),
    };
  });
}

/**
 * Posts an authorized deficit as a negative delta when the available balance covers it.
 * Otherwise the debit stays pending and nothing is appended (R-05); known credits are
 * unaffected. A retry with the same source key returns the existing entry.
 */
export function postDeficitDebit(ctx: LedgerContext, input: DeficitDebitInput): DeficitDebitResult {
  const posting = normalizePosting(input);
  const workDate = assertCivilDate(input.workDate, 'workDate');
  assertPositiveMinutes(input.debitMinutes, 'debitMinutes');
  return writeTransaction(ctx.db, () => {
    const existing = findByKey(ctx.db, posting.userId, posting.sourceKey);
    if (existing !== undefined) {
      const same =
        existing.entryType === 'deficit_debit' &&
        existing.deltaMinutes === -input.debitMinutes &&
        existing.workDate === workDate &&
        existing.sourceRef === posting.sourceRef;
      if (!same) throw sourceKeyConflict();
      return { status: 'duplicate', entry: existing, balance: balanceOf(ctx.db, posting.userId) };
    }
    const balance = balanceOf(ctx.db, posting.userId);
    if (!canDebit(balance.availableMinutes, input.debitMinutes)) {
      return {
        status: 'pending',
        reason: 'insufficient_balance',
        entry: null,
        debitMinutes: input.debitMinutes,
        availableMinutes: balance.availableMinutes,
        balance,
      };
    }
    const entry = appendEntry(ctx, posting, { entryType: 'deficit_debit', deltaMinutes: -input.debitMinutes, workDate });
    return { status: 'posted', entry, balance: balanceOf(ctx.db, posting.userId) };
  });
}

/** The owner's posted, reserved and available minutes with negative/reconciliation flags. */
export function getBalance(db: Db, userId: string): LedgerBalance {
  return balanceOf(db, userId);
}

/** The owner's ledger entries in posting order. */
export function listLedgerEntries(db: Db, userId: string): LedgerEntry[] {
  const rows = db.prepare('SELECT * FROM ot_ledger WHERE user_id = ? ORDER BY rowid').all(userId) as LedgerRow[];
  return rows.map(toEntry);
}
