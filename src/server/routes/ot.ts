import { Hono } from 'hono';
import { assertCivilDate, diffDays } from '../../domain/dates.ts';
import type { LedgerBalance } from '../../domain/ledger.ts';
import { requireUser } from '../http/auth.ts';
import { ApiError } from '../http/errors.ts';
import { otLeaveCancelBody, otLeaveConsumeBody, otLeaveCreateBody, otLeaveReverseBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { getBalance, type LedgerEntry, listLedgerEntries } from '../services/ledger.ts';
import { buildEvidenceCsv, evidenceFilename, provisionalSummary } from '../services/otEvidence.ts';
import {
  cancelOtLeave,
  listOtLeaveRequests,
  type OtLeaveRequest,
  recordOtLeaveUse,
  reserveOtLeave,
  reverseOtLeaveUse,
} from '../services/otLeave.ts';
import type { AppDeps, AppEnv } from '../types.ts';

const MAX_EVIDENCE_RANGE_DAYS = 400;

function balanceJson(balance: LedgerBalance) {
  return {
    posted_minutes: balance.postedMinutes,
    reserved_minutes: balance.reservedMinutes,
    available_minutes: balance.availableMinutes,
    negative: balance.negative,
    reconciliation_required: balance.reconciliationRequired,
  };
}

function leaveJson(request: OtLeaveRequest) {
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
    /** Used minutes that a reversal may still give back. */
    reversible_minutes: request.consumedMinutes - request.reversedMinutes,
    approver_name: request.approverName,
    approver_identity: request.approverIdentity,
    approval_date: request.approvalDate,
    evidence_ref: request.evidenceRef,
    approval_origin: request.approvalOrigin,
    note: request.note,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    version: request.version,
  };
}

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
    reason: entry.reason,
    reconciliation_required: entry.reconciliationRequired,
    posted_at: entry.postedAt,
  };
}

/**
 * OT balance, ledger, leave lifecycle and evidence export. Every handler passes the
 * session user as BOTH owner and actor (the leave service does not check that they are
 * equal), no route accepts a user id, and admin role grants no access to other users'
 * data. There is deliberately no route that posts a credit or debit: credits and debits
 * are posted by WP3 finalization inside its own transaction. The only ledger writes
 * reachable here are the owner's explicit leave actions (record use and reverse).
 */
export function otRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);
  const ctx = { db: deps.db, clock: deps.clock };

  app.get('/summary', auth, (c) => {
    const user = c.get('user');
    const provisional = provisionalSummary(deps.db, deps.clock, user);
    return c.json({
      ...balanceJson(getBalance(deps.db, user.id)),
      provisional_minutes: provisional.minutes,
      provisional_periods: provisional.periods,
    });
  });

  app.get('/ledger', auth, (c) => {
    const user = c.get('user');
    return c.json({
      entries: listLedgerEntries(deps.db, user.id).map(entryJson),
      balance: balanceJson(getBalance(deps.db, user.id)),
    });
  });

  app.get('/leave', auth, (c) => {
    const user = c.get('user');
    return c.json({
      requests: listOtLeaveRequests(deps.db, user.id).map(leaveJson),
      balance: balanceJson(getBalance(deps.db, user.id)),
    });
  });

  app.post('/leave', auth, async (c) => {
    const user = c.get('user');
    const body = await readJson(c, otLeaveCreateBody);
    const result = reserveOtLeave(ctx, {
      userId: user.id,
      actorUserId: user.id,
      requestKey: body.request_key,
      leaveDate: body.leave_date,
      requestedMinutes: body.requested_minutes,
      ...(body.approved_minutes === undefined ? {} : { approvedMinutes: body.approved_minutes }),
      permission: {
        approverName: body.permission.approver_name,
        approverIdentity: body.permission.approver_identity ?? null,
        approvalDate: body.permission.approval_date,
        evidenceRef: body.permission.evidence_ref,
      },
      note: body.note ?? null,
    });
    return c.json(
      { status: result.status, request: leaveJson(result.request), balance: balanceJson(result.balance) },
      result.status === 'reserved' ? 201 : 200,
    );
  });

  /** E-3 "record use": the explicit, idempotent, partial consumption of reserved minutes. */
  app.post('/leave/:id/consume', auth, async (c) => {
    const user = c.get('user');
    const body = await readJson(c, otLeaveConsumeBody);
    const result = recordOtLeaveUse(ctx, {
      userId: user.id,
      actorUserId: user.id,
      requestId: c.req.param('id'),
      useKey: body.use_key,
      minutes: body.minutes,
      expectedVersion: body.expected_version,
    });
    return c.json({
      status: result.status,
      request: leaveJson(result.request),
      entry: entryJson(result.entry),
      balance: balanceJson(result.balance),
    });
  });

  app.post('/leave/:id/cancel', auth, async (c) => {
    const user = c.get('user');
    const body = await readJson(c, otLeaveCancelBody);
    const result = cancelOtLeave(ctx, {
      userId: user.id,
      actorUserId: user.id,
      requestId: c.req.param('id'),
      reason: body.reason ?? null,
      expectedVersion: body.expected_version,
    });
    return c.json({
      status: result.status,
      released_minutes: result.releasedMinutes,
      request: leaveJson(result.request),
      balance: balanceJson(result.balance),
    });
  });

  app.post('/leave/:id/reverse', auth, async (c) => {
    const user = c.get('user');
    const body = await readJson(c, otLeaveReverseBody);
    const result = reverseOtLeaveUse(ctx, {
      userId: user.id,
      actorUserId: user.id,
      requestId: c.req.param('id'),
      reversalKey: body.reversal_key,
      minutes: body.minutes,
      reason: body.reason,
      expectedVersion: body.expected_version,
    });
    return c.json({
      status: result.status,
      request: leaveJson(result.request),
      entry: entryJson(result.entry),
      balance: balanceJson(result.balance),
    });
  });

  app.get('/evidence.csv', auth, (c) => {
    const user = c.get('user');
    const from = assertCivilDate(c.req.query('from'), 'from');
    const to = assertCivilDate(c.req.query('to'), 'to');
    if (to < from || diffDays(to, from) > MAX_EVIDENCE_RANGE_DAYS) {
      throw new ApiError(422, 'invalid_range', `Use a range of at most ${MAX_EVIDENCE_RANGE_DAYS} days`);
    }
    return c.body(buildEvidenceCsv(deps.db, deps.clock, user, from, to), 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${evidenceFilename(from, to)}"`,
      'X-Content-Type-Options': 'nosniff',
    });
  });

  return app;
}
