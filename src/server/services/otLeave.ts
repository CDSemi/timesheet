import { randomUUID } from 'node:crypto';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import {
  canReserve,
  type LeaveCounters,
  type LedgerBalance,
  openLeaveCounters,
  otLeaveCostMinutes,
  planLeaveCancel,
  planLeaveReversal,
  planLeaveUse,
} from '../../domain/ledger.ts';
import { assertTimeZone, localDateOf } from '../../domain/zones.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound, staleVersion } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { getBalance, type LedgerEntry } from './ledger.ts';
import { importedPeriodError } from './workbookImport.ts';

/*
 * Internal OT leave service (R-06; owner decisions E-2/E-3, coordinator decisions
 * E-5/E-7). There is no HTTP route here; the WP2 OT/leave router calls these functions
 * with the session user as both owner and actor.
 *
 * - Reserve records the manager permission (name/identity, date, text evidence, origin
 *   `self_recorded`) and reserves the approved minutes in one BEGIN IMMEDIATE
 *   transaction after checking the available balance, so two connections can never both
 *   reserve the same minutes. Insufficient balance is 409 `insufficient_balance` and
 *   creates nothing (E-5).
 * - Record use is the only way to consume (E-3): explicit, on or after the leave date in
 *   the owner's saved reporting zone, X <= reserved, partial allowed, idempotent by key.
 *   The unused remainder stays reserved until it is used or cancelled. A leave date inside
 *   an imported period is refused with 409 `imported_period` (F-2: imported history posts
 *   no ledger event).
 * - Cancel releases the unused reserved minutes; it posts nothing.
 * - Reverse gives already used minutes back with a compensating positive ledger delta
 *   linked to the request.
 *
 * A day label or leave_kind never calls into this service (E-2, LG-10). All arithmetic is
 * the pure engine in domain/ledger.ts; balances come from the ledger service. Every
 * function is owner-scoped by `userId` (another owner's request is not found), runs in a
 * short IMMEDIATE transaction (a savepoint inside a caller's transaction), and audits
 * every change. Retries with the same key return the stored result and append nothing.
 */

export interface OtLeaveContext {
  db: Db;
  clock: Clock;
}

export type ApprovalOrigin = 'self_recorded' | 'authenticated';

export interface OtLeaveRequest {
  id: string;
  userId: string;
  requestKey: string;
  leaveDate: CivilDate;
  requestedMinutes: number;
  approvedMinutes: number;
  reservedMinutes: number;
  consumedMinutes: number;
  releasedMinutes: number;
  reversedMinutes: number;
  approverName: string;
  approverIdentity: string | null;
  approvalDate: CivilDate;
  /** E-7: a text reference to the permission evidence (no files in WP2). */
  evidenceRef: string;
  approvalOrigin: ApprovalOrigin;
  note: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/** The manager permission the employee records (E-7: text evidence reference). */
export interface RecordedPermission {
  approverName: string;
  approverIdentity?: string | null;
  approvalDate: CivilDate;
  evidenceRef: string;
}

export interface ReserveOtLeaveInput {
  /** Owner of the balance and the request. */
  userId: string;
  actorUserId: string;
  /** Idempotency key, unique per owner. */
  requestKey: string;
  leaveDate: CivilDate;
  /** Leave minutes requested for the date; converts 1:1 to OT minutes. */
  requestedMinutes: number;
  /** Minutes the manager approved; defaults to the requested minutes. */
  approvedMinutes?: number;
  permission: RecordedPermission;
  note?: string | null;
}

export interface RecordOtLeaveUseInput {
  userId: string;
  actorUserId: string;
  requestId: string;
  /** Idempotency key of this use, unique per request. */
  useKey: string;
  minutes: number;
  expectedVersion?: number;
}

export interface CancelOtLeaveInput {
  userId: string;
  actorUserId: string;
  requestId: string;
  reason?: string | null;
  expectedVersion?: number;
}

export interface ReverseOtLeaveUseInput {
  userId: string;
  actorUserId: string;
  requestId: string;
  /** Idempotency key of this reversal, unique per request. */
  reversalKey: string;
  minutes: number;
  /** Reversing posted minutes always needs a reason (R-07). */
  reason: string;
  expectedVersion?: number;
}

export interface ReserveOtLeaveResult {
  status: 'reserved' | 'duplicate';
  request: OtLeaveRequest;
  balance: LedgerBalance;
}

export interface LeaveLedgerResult<Status extends string> {
  status: Status | 'duplicate';
  request: OtLeaveRequest;
  entry: LedgerEntry;
  balance: LedgerBalance;
}

export interface CancelOtLeaveResult {
  /** `unchanged`: nothing was reserved any more (for example a retried cancel). */
  status: 'cancelled' | 'unchanged';
  releasedMinutes: number;
  request: OtLeaveRequest;
  balance: LedgerBalance;
}

interface LeaveRow {
  id: string;
  user_id: string;
  request_key: string;
  leave_date: string;
  requested_minutes: number;
  approved_minutes: number;
  reserved_minutes: number;
  consumed_minutes: number;
  released_minutes: number;
  reversed_minutes: number;
  approver_name: string;
  approver_identity: string | null;
  approval_date: string;
  evidence_ref: string;
  approval_origin: ApprovalOrigin;
  approved_by_user_id: string | null;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
}

interface LedgerRow {
  id: string;
  user_id: string;
  entry_type: LedgerEntry['entryType'];
  delta_minutes: number;
  source_key: string;
  source_ref: string | null;
  corrects_entry_id: string | null;
  leave_request_id: string | null;
  work_date: string | null;
  actor_user_id: string | null;
  origin: LedgerEntry['origin'];
  reason: string | null;
  reconciliation_required: number;
  posted_at: string;
  /** Absent on a schema before migration 0013. */
  as_of_date?: string | null;
  evidence_ref?: string | null;
}

const MAX_KEY_LENGTH = 120;
const MAX_NAME_LENGTH = 200;
const MAX_IDENTITY_LENGTH = 320;
const MAX_TEXT_LENGTH = 2000;

function toRequest(row: LeaveRow): OtLeaveRequest {
  return {
    id: row.id,
    userId: row.user_id,
    requestKey: row.request_key,
    leaveDate: row.leave_date,
    requestedMinutes: row.requested_minutes,
    approvedMinutes: row.approved_minutes,
    reservedMinutes: row.reserved_minutes,
    consumedMinutes: row.consumed_minutes,
    releasedMinutes: row.released_minutes,
    reversedMinutes: row.reversed_minutes,
    approverName: row.approver_name,
    approverIdentity: row.approver_identity,
    approvalDate: row.approval_date,
    evidenceRef: row.evidence_ref,
    approvalOrigin: row.approval_origin,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

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
    asOfDate: row.as_of_date ?? null,
    evidenceRef: row.evidence_ref ?? null,
  };
}

function countersOf(request: OtLeaveRequest): LeaveCounters {
  return {
    approvedMinutes: request.approvedMinutes,
    reservedMinutes: request.reservedMinutes,
    consumedMinutes: request.consumedMinutes,
    releasedMinutes: request.releasedMinutes,
    reversedMinutes: request.reversedMinutes,
  };
}

/** Audit snapshot of a request (snake_case like other audit payloads). */
function requestJson(request: OtLeaveRequest) {
  return {
    id: request.id,
    request_key: request.requestKey,
    leave_date: request.leaveDate,
    requested_minutes: request.requestedMinutes,
    approved_minutes: request.approvedMinutes,
    reserved_minutes: request.reservedMinutes,
    consumed_minutes: request.consumedMinutes,
    released_minutes: request.releasedMinutes,
    reversed_minutes: request.reversedMinutes,
    approver_name: request.approverName,
    approver_identity: request.approverIdentity,
    approval_date: request.approvalDate,
    evidence_ref: request.evidenceRef,
    approval_origin: request.approvalOrigin,
    version: request.version,
  };
}

function entryJson(entry: LedgerEntry) {
  return {
    id: entry.id,
    entry_type: entry.entryType,
    delta_minutes: entry.deltaMinutes,
    source_key: entry.sourceKey,
    leave_request_id: entry.leaveRequestId,
    work_date: entry.workDate,
    origin: entry.origin,
  };
}

function normalizeKey(value: string, code: string, field: string): string {
  const key = typeof value === 'string' ? value.trim() : '';
  if (key === '' || key.length > MAX_KEY_LENGTH) {
    throw new ApiError(422, code, `${field} must be 1–${MAX_KEY_LENGTH} characters`);
  }
  return key;
}

function requireActor(actorUserId: string): string {
  if (typeof actorUserId !== 'string' || actorUserId === '') {
    throw new ApiError(422, 'actor_required', 'An OT leave action needs the acting user');
  }
  return actorUserId;
}

function optionalText(value: string | null | undefined, max: number, code: string, field: string): string | null {
  const text = value?.trim() ?? '';
  if (text.length > max) throw new ApiError(422, code, `${field} must be at most ${max} characters`);
  return text === '' ? null : text;
}

function assertExpectedVersion(value: number | undefined): void {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 1)) {
    throw new ApiError(422, 'invalid_expected_version', 'expectedVersion must be a positive whole number');
  }
}

function findRequest(db: Db, userId: string, requestId: string): OtLeaveRequest | undefined {
  const row = db.prepare('SELECT * FROM ot_leave_requests WHERE id = ? AND user_id = ?').get(requestId, userId) as
    | LeaveRow
    | undefined;
  return row === undefined ? undefined : toRequest(row);
}

/** Another owner's request is indistinguishable from a missing one. */
function requireRequest(db: Db, userId: string, requestId: string): OtLeaveRequest {
  const request = typeof requestId === 'string' ? findRequest(db, userId, requestId) : undefined;
  if (request === undefined) throw notFound('OT leave request');
  return request;
}

function findEntryByKey(db: Db, userId: string, sourceKey: string): LedgerEntry | undefined {
  const row = db.prepare('SELECT * FROM ot_ledger WHERE user_id = ? AND source_key = ?').get(userId, sourceKey) as
    | LedgerRow
    | undefined;
  return row === undefined ? undefined : toEntry(row);
}

/** Today's accounting date in the owner's saved reporting zone (device zones never matter). */
function todayForOwner(db: Db, clock: Clock, userId: string): CivilDate {
  const zone = db
    .prepare('SELECT c.reporting_zone FROM users u JOIN calendars c ON c.id = u.calendar_id WHERE u.id = ?')
    .pluck()
    .get(userId) as string | undefined;
  if (zone === undefined) throw notFound('User');
  return localDateOf(assertTimeZone(zone, 'reporting_zone'), nowEpoch(clock));
}

/**
 * F-2: true when the owner's timesheet of the period holding `date` is imported history
 * (`imported_unverified = 1`). Whole rows are read, so a schema before migration 0004 (no
 * flag yet) reads "not imported", like `isImportedTimesheet`.
 */
function insideImportedPeriod(db: Db, userId: string, date: CivilDate): boolean {
  const rows = db
    .prepare(
      `SELECT t.* FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE t.user_id = ? AND p.period_start <= ? AND p.period_end >= ?`,
    )
    .all(userId, date, date) as Array<{ imported_unverified?: number }>;
  return rows.some((row) => row.imported_unverified === 1);
}

/** Writes new counters with an optimistic version check; the schema enforces forward-only counters. */
function updateCounters(ctx: OtLeaveContext, request: OtLeaveRequest, counters: LeaveCounters): OtLeaveRequest {
  const updatedAt = nowUtc(ctx.clock);
  const result = ctx.db
    .prepare(
      `UPDATE ot_leave_requests
          SET reserved_minutes = ?, consumed_minutes = ?, released_minutes = ?, reversed_minutes = ?,
              updated_at = ?, version = version + 1
        WHERE id = ? AND user_id = ? AND version = ?`,
    )
    .run(
      counters.reservedMinutes,
      counters.consumedMinutes,
      counters.releasedMinutes,
      counters.reversedMinutes,
      updatedAt,
      request.id,
      request.userId,
      request.version,
    );
  if (result.changes !== 1) throw staleVersion();
  return {
    ...request,
    reservedMinutes: counters.reservedMinutes,
    consumedMinutes: counters.consumedMinutes,
    releasedMinutes: counters.releasedMinutes,
    reversedMinutes: counters.reversedMinutes,
    updatedAt,
    version: request.version + 1,
  };
}

function appendLeaveEntry(
  ctx: OtLeaveContext,
  request: OtLeaveRequest,
  values: { entryType: 'leave_consumption' | 'leave_reversal'; deltaMinutes: number; sourceKey: string; actorUserId: string; reason: string | null },
): LedgerEntry {
  const entry: LedgerEntry = {
    id: randomUUID(),
    userId: request.userId,
    entryType: values.entryType,
    deltaMinutes: values.deltaMinutes,
    sourceKey: values.sourceKey,
    sourceRef: null,
    correctsEntryId: null,
    leaveRequestId: request.id,
    workDate: request.leaveDate,
    actorUserId: values.actorUserId,
    origin: 'manual',
    reason: values.reason,
    reconciliationRequired: false,
    postedAt: nowUtc(ctx.clock),
    asOfDate: null,
    evidenceRef: null,
  };
  ctx.db
    .prepare(
      `INSERT INTO ot_ledger (id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
         leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .run(
      entry.id,
      entry.userId,
      entry.entryType,
      entry.deltaMinutes,
      entry.sourceKey,
      entry.leaveRequestId,
      entry.workDate,
      entry.actorUserId,
      entry.origin,
      entry.reason,
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

function auditRequest(
  ctx: OtLeaveContext,
  actorUserId: string,
  operation: string,
  before: OtLeaveRequest | null,
  after: OtLeaveRequest,
  reason: string | null = null,
): void {
  recordAudit(ctx.db, ctx.clock, {
    actorUserId,
    ownerUserId: after.userId,
    operation,
    entityType: 'ot_leave_request',
    entityId: after.id,
    reason,
    before: before === null ? undefined : requestJson(before),
    after: requestJson(after),
  });
}

function useSourceKey(requestId: string, useKey: string): string {
  return `ot_leave_use:${requestId}:${useKey}`;
}

function reversalSourceKey(requestId: string, reversalKey: string): string {
  return `ot_leave_reversal:${requestId}:${reversalKey}`;
}

function sourceKeyConflict(): ApiError {
  return new ApiError(409, 'source_key_conflict', 'This key was already used with different values');
}

function checkVersion(request: OtLeaveRequest, expectedVersion: number | undefined): void {
  if (expectedVersion !== undefined && expectedVersion !== request.version) throw staleVersion();
}

/**
 * Records the manager permission and reserves the approved minutes atomically. A retry
 * with the same request key and values returns the stored request (status `duplicate`).
 */
export function reserveOtLeave(ctx: OtLeaveContext, input: ReserveOtLeaveInput): ReserveOtLeaveResult {
  const actorUserId = requireActor(input.actorUserId);
  const requestKey = normalizeKey(input.requestKey, 'invalid_request_key', 'requestKey');
  const leaveDate = assertCivilDate(input.leaveDate, 'leaveDate');
  // Leave minutes convert 1:1 to OT minutes (480 for eight hours).
  const requestedMinutes = otLeaveCostMinutes(input.requestedMinutes);
  const approvedMinutes = input.approvedMinutes === undefined ? requestedMinutes : otLeaveCostMinutes(input.approvedMinutes);
  if (approvedMinutes > requestedMinutes) {
    throw new ApiError(422, 'invalid_approved_minutes', 'Approved minutes cannot exceed the requested minutes');
  }
  const permission = input.permission as Partial<RecordedPermission> | undefined;
  const approverName = optionalText(permission?.approverName, MAX_NAME_LENGTH, 'invalid_approver_name', 'approverName');
  const evidenceRef = optionalText(permission?.evidenceRef, MAX_TEXT_LENGTH, 'invalid_evidence_ref', 'evidenceRef');
  if (approverName === null || evidenceRef === null || permission?.approvalDate === undefined) {
    throw new ApiError(422, 'approval_required', 'Reserving OT leave needs the recorded manager permission and its evidence');
  }
  const approvalDate = assertCivilDate(permission.approvalDate, 'approvalDate');
  const approverIdentity = optionalText(permission.approverIdentity, MAX_IDENTITY_LENGTH, 'invalid_approver_identity', 'approverIdentity');
  const note = optionalText(input.note, MAX_TEXT_LENGTH, 'invalid_note', 'note');
  const counters = openLeaveCounters(approvedMinutes);

  return writeTransaction(ctx.db, () => {
    const existingRow = ctx.db
      .prepare('SELECT * FROM ot_leave_requests WHERE user_id = ? AND request_key = ?')
      .get(input.userId, requestKey) as LeaveRow | undefined;
    if (existingRow !== undefined) {
      const existing = toRequest(existingRow);
      const same =
        existing.leaveDate === leaveDate &&
        existing.requestedMinutes === requestedMinutes &&
        existing.approvedMinutes === approvedMinutes &&
        existing.approverName === approverName &&
        existing.approverIdentity === approverIdentity &&
        existing.approvalDate === approvalDate &&
        existing.evidenceRef === evidenceRef;
      if (!same) throw new ApiError(409, 'request_key_conflict', 'This leave request was already recorded with different values');
      return { status: 'duplicate', request: existing, balance: getBalance(ctx.db, input.userId) };
    }
    const balance = getBalance(ctx.db, input.userId);
    if (!canReserve(balance.availableMinutes, counters.reservedMinutes)) {
      throw new ApiError(409, 'insufficient_balance', 'The available OT balance does not cover this leave', {
        available_minutes: balance.availableMinutes,
        requested_minutes: counters.reservedMinutes,
      });
    }
    const now = nowUtc(ctx.clock);
    const request: OtLeaveRequest = {
      id: randomUUID(),
      userId: input.userId,
      requestKey,
      leaveDate,
      requestedMinutes,
      approvedMinutes,
      reservedMinutes: counters.reservedMinutes,
      consumedMinutes: 0,
      releasedMinutes: 0,
      reversedMinutes: 0,
      approverName,
      approverIdentity,
      approvalDate,
      evidenceRef,
      approvalOrigin: 'self_recorded',
      note,
      createdBy: actorUserId,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    ctx.db
      .prepare(
        `INSERT INTO ot_leave_requests (id, user_id, request_key, leave_date, requested_minutes, approved_minutes,
           reserved_minutes, consumed_minutes, released_minutes, reversed_minutes, approver_name, approver_identity,
           approval_date, evidence_ref, approval_origin, approved_by_user_id, note, created_by, created_at, updated_at, version)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, 'self_recorded', NULL, ?, ?, ?, ?, 1)`,
      )
      .run(
        request.id,
        request.userId,
        request.requestKey,
        request.leaveDate,
        request.requestedMinutes,
        request.approvedMinutes,
        request.reservedMinutes,
        request.approverName,
        request.approverIdentity,
        request.approvalDate,
        request.evidenceRef,
        request.note,
        request.createdBy,
        request.createdAt,
        request.updatedAt,
      );
    auditRequest(ctx, actorUserId, 'ot_leave.reserve', null, request);
    return { status: 'reserved', request, balance: getBalance(ctx.db, input.userId) };
  });
}

/**
 * The employee's explicit "record use" (E-3): consumes `minutes` <= reserved on or after
 * the leave date and posts a linked negative delta. The remainder stays reserved. A retry
 * with the same use key returns the stored entry and appends nothing.
 */
export function recordOtLeaveUse(ctx: OtLeaveContext, input: RecordOtLeaveUseInput): LeaveLedgerResult<'used'> {
  const actorUserId = requireActor(input.actorUserId);
  const useKey = normalizeKey(input.useKey, 'invalid_use_key', 'useKey');
  assertExpectedVersion(input.expectedVersion);
  return writeTransaction(ctx.db, () => {
    const request = requireRequest(ctx.db, input.userId, input.requestId);
    const sourceKey = useSourceKey(request.id, useKey);
    const existing = findEntryByKey(ctx.db, input.userId, sourceKey);
    if (existing !== undefined) {
      const same = existing.entryType === 'leave_consumption' && existing.leaveRequestId === request.id && existing.deltaMinutes === -input.minutes;
      if (!same) throw sourceKeyConflict();
      return { status: 'duplicate', request, entry: existing, balance: getBalance(ctx.db, input.userId) };
    }
    checkVersion(request, input.expectedVersion);
    // F-2: an imported period is read-only history and posts no ledger event.
    if (insideImportedPeriod(ctx.db, input.userId, request.leaveDate)) throw importedPeriodError();
    const plan = planLeaveUse(countersOf(request), input.minutes);
    if (todayForOwner(ctx.db, ctx.clock, input.userId) < request.leaveDate) {
      throw new ApiError(409, 'before_leave_date', 'OT leave can be recorded as used on or after the leave date', {
        leave_date: request.leaveDate,
      });
    }
    if (!plan.ok) {
      throw new ApiError(409, 'exceeds_reserved', 'The use exceeds the minutes still reserved', { reserved_minutes: plan.limitMinutes });
    }
    const updated = updateCounters(ctx, request, plan.counters);
    auditRequest(ctx, actorUserId, 'ot_leave.use', request, updated);
    const entry = appendLeaveEntry(ctx, updated, {
      entryType: 'leave_consumption',
      deltaMinutes: plan.deltaMinutes,
      sourceKey,
      actorUserId,
      reason: null,
    });
    return { status: 'used', request: updated, entry, balance: getBalance(ctx.db, input.userId) };
  });
}

/** Releases the still-reserved minutes. Nothing reserved any more is `unchanged` (no write). */
export function cancelOtLeave(ctx: OtLeaveContext, input: CancelOtLeaveInput): CancelOtLeaveResult {
  const actorUserId = requireActor(input.actorUserId);
  const reason = optionalText(input.reason, MAX_TEXT_LENGTH, 'invalid_reason', 'reason');
  assertExpectedVersion(input.expectedVersion);
  return writeTransaction(ctx.db, () => {
    const request = requireRequest(ctx.db, input.userId, input.requestId);
    // A stale version is refused first, also when nothing is reserved any more.
    checkVersion(request, input.expectedVersion);
    const plan = planLeaveCancel(countersOf(request));
    if (plan.releasedMinutes === 0) {
      return { status: 'unchanged', releasedMinutes: 0, request, balance: getBalance(ctx.db, input.userId) };
    }
    const updated = updateCounters(ctx, request, plan.counters);
    auditRequest(ctx, actorUserId, 'ot_leave.cancel', request, updated, reason);
    return { status: 'cancelled', releasedMinutes: plan.releasedMinutes, request: updated, balance: getBalance(ctx.db, input.userId) };
  });
}

/**
 * Gives already used minutes back with a compensating positive delta linked to the
 * request. A retry with the same reversal key returns the stored entry.
 */
export function reverseOtLeaveUse(ctx: OtLeaveContext, input: ReverseOtLeaveUseInput): LeaveLedgerResult<'reversed'> {
  const actorUserId = requireActor(input.actorUserId);
  const reversalKey = normalizeKey(input.reversalKey, 'invalid_reversal_key', 'reversalKey');
  const reason = optionalText(input.reason, MAX_TEXT_LENGTH, 'invalid_reason', 'reason');
  if (reason === null) throw new ApiError(422, 'reason_required', 'Reversing used OT leave requires a reason');
  assertExpectedVersion(input.expectedVersion);
  return writeTransaction(ctx.db, () => {
    const request = requireRequest(ctx.db, input.userId, input.requestId);
    const sourceKey = reversalSourceKey(request.id, reversalKey);
    const existing = findEntryByKey(ctx.db, input.userId, sourceKey);
    if (existing !== undefined) {
      const same = existing.entryType === 'leave_reversal' && existing.leaveRequestId === request.id && existing.deltaMinutes === input.minutes;
      if (!same) throw sourceKeyConflict();
      return { status: 'duplicate', request, entry: existing, balance: getBalance(ctx.db, input.userId) };
    }
    checkVersion(request, input.expectedVersion);
    const plan = planLeaveReversal(countersOf(request), input.minutes);
    if (!plan.ok) {
      throw new ApiError(409, 'exceeds_reversible', 'The reversal exceeds the used minutes not yet reversed', {
        reversible_minutes: plan.limitMinutes,
      });
    }
    const updated = updateCounters(ctx, request, plan.counters);
    auditRequest(ctx, actorUserId, 'ot_leave.reverse', request, updated, reason);
    const entry = appendLeaveEntry(ctx, updated, {
      entryType: 'leave_reversal',
      deltaMinutes: plan.deltaMinutes,
      sourceKey,
      actorUserId,
      reason,
    });
    return { status: 'reversed', request: updated, entry, balance: getBalance(ctx.db, input.userId) };
  });
}

/** The owner's request, or undefined when it is missing or belongs to someone else. */
export function getOtLeaveRequest(db: Db, userId: string, requestId: string): OtLeaveRequest | undefined {
  return findRequest(db, userId, requestId);
}

/** The owner's requests by leave date, then creation order. */
export function listOtLeaveRequests(db: Db, userId: string): OtLeaveRequest[] {
  const rows = db.prepare('SELECT * FROM ot_leave_requests WHERE user_id = ? ORDER BY leave_date, rowid').all(userId) as LeaveRow[];
  return rows.map(toRequest);
}
