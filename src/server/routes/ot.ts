import { type Context, Hono } from 'hono';
import { assertCivilDate, diffDays } from '../../domain/dates.ts';
import type { LedgerBalance } from '../../domain/ledger.ts';
import { type PersonalRouterOptions, requireUser } from '../http/auth.ts';
import { ApiError, notFound } from '../http/errors.ts';
import {
  openingBalanceBody,
  openingBalanceCorrectionBody,
  otLeaveCancelBody,
  otLeaveConsumeBody,
  otLeaveCreateBody,
  otLeaveReverseBody,
} from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import {
  correctOpeningBalance,
  getBalance,
  getOpeningBalance,
  type LedgerEntry,
  listLedgerEntries,
  type OpeningBalance,
  postOpeningBalance,
} from '../services/ledger.ts';
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
    as_of_date: entry.asOfDate,
  };
}

/** The owner's opening balance with its evidence (owner-only: never on a shared route). */
function openingJson(opening: OpeningBalance | null) {
  if (opening === null) return null;
  return {
    id: opening.entry.id,
    minutes: opening.minutes,
    original_minutes: opening.entry.deltaMinutes,
    as_of_date: opening.entry.asOfDate,
    reason: opening.entry.reason,
    evidence_ref: opening.entry.evidenceRef,
    version: opening.version,
    posted_at: opening.entry.postedAt,
    corrections: opening.corrections.map((correction) => ({
      id: correction.id,
      delta_minutes: correction.deltaMinutes,
      reason: correction.reason,
      evidence_ref: correction.evidenceRef,
      reconciliation_required: correction.reconciliationRequired,
      posted_at: correction.postedAt,
    })),
  };
}

/**
 * OT balance, ledger, leave lifecycle and evidence export, built by a factory so the same
 * handlers can be mounted behind a different access guard. Every handler passes the request
 * context's subject as the owner and its actor as the actor (the leave service does not check
 * that they are equal; with the default guard both are the session user), no route accepts a
 * user id, and admin role grants no access to other users' data. There is deliberately no
 * route that posts a credit or debit: credits and debits are posted by WP3 finalization inside
 * its own transaction. The only ledger writes reachable here are the owner's explicit leave
 * actions (record use and reverse) and the owner's explicit opening balance and its correction
 * (F-3). The opening balance routes are owner-only: they are not in the share allowlist, and
 * they also refuse (as not found) any request whose actor is not the subject.
 */
export function otRoutes(deps: AppDeps, options: PersonalRouterOptions = {}) {
  const app = new Hono<AppEnv>();
  const auth = options.access ?? requireUser(deps);
  const ctx = { db: deps.db, clock: deps.clock };

  /** F-3: only the owner reads or changes the opening balance; any delegated request is not found. */
  const ownerOnly = (c: Context<AppEnv>) => {
    const user = c.get('subject');
    if (c.get('actor').id !== user.id) throw notFound('Opening balance');
    return user;
  };

  app.get('/summary', auth, (c) => {
    const user = c.get('subject');
    const provisional = provisionalSummary(deps.db, deps.clock, user);
    return c.json({
      ...balanceJson(getBalance(deps.db, user.id)),
      provisional_minutes: provisional.minutes,
      provisional_periods: provisional.periods,
    });
  });

  app.get('/ledger', auth, (c) => {
    const user = c.get('subject');
    return c.json({
      entries: listLedgerEntries(deps.db, user.id).map(entryJson),
      balance: balanceJson(getBalance(deps.db, user.id)),
    });
  });

  app.get('/leave', auth, (c) => {
    const user = c.get('subject');
    return c.json({
      requests: listOtLeaveRequests(deps.db, user.id).map(leaveJson),
      balance: balanceJson(getBalance(deps.db, user.id)),
    });
  });

  app.post('/leave', auth, async (c) => {
    const user = c.get('subject');
    const actor = c.get('actor');
    const body = await readJson(c, otLeaveCreateBody);
    const result = reserveOtLeave(ctx, {
      userId: user.id,
      actorUserId: actor.id,
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
    const user = c.get('subject');
    const actor = c.get('actor');
    const body = await readJson(c, otLeaveConsumeBody);
    const result = recordOtLeaveUse(ctx, {
      userId: user.id,
      actorUserId: actor.id,
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
    const user = c.get('subject');
    const actor = c.get('actor');
    const body = await readJson(c, otLeaveCancelBody);
    const result = cancelOtLeave(ctx, {
      userId: user.id,
      actorUserId: actor.id,
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
    const user = c.get('subject');
    const actor = c.get('actor');
    const body = await readJson(c, otLeaveReverseBody);
    const result = reverseOtLeaveUse(ctx, {
      userId: user.id,
      actorUserId: actor.id,
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

  app.get('/opening-balance', auth, (c) => {
    const user = ownerOnly(c);
    return c.json({ opening_balance: openingJson(getOpeningBalance(deps.db, user.id)), balance: balanceJson(getBalance(deps.db, user.id)) });
  });

  /** F-3: the explicit opening balance, once; a repeat with the same content is a no-op. */
  app.post('/opening-balance', auth, async (c) => {
    const user = ownerOnly(c);
    const body = await readJson(c, openingBalanceBody);
    const result = postOpeningBalance(ctx, {
      userId: user.id,
      actorUserId: user.id,
      minutes: body.minutes,
      asOfDate: body.as_of_date,
      reason: body.reason,
      evidenceRef: body.evidence_ref,
      expectedVersion: body.expected_version,
    });
    return c.json(
      {
        status: result.status,
        entry: result.entry === null ? null : entryJson(result.entry),
        opening_balance: openingJson(result.opening),
        balance: balanceJson(result.balance),
      },
      result.status === 'posted' ? 201 : 200,
    );
  });

  /** F-3: a reasoned correction of the opening balance (one correction entry) against the version the owner saw. */
  app.put('/opening-balance', auth, async (c) => {
    const user = ownerOnly(c);
    const body = await readJson(c, openingBalanceCorrectionBody);
    const result = correctOpeningBalance(ctx, {
      userId: user.id,
      actorUserId: user.id,
      minutes: body.minutes,
      reason: body.reason,
      evidenceRef: body.evidence_ref,
      expectedVersion: body.expected_version,
    });
    return c.json(
      {
        status: result.status,
        entry: result.entry === null ? null : entryJson(result.entry),
        opening_balance: openingJson(result.opening),
        balance: balanceJson(result.balance),
      },
      result.status === 'posted' ? 201 : 200,
    );
  });

  app.get('/evidence.csv', auth, (c) => {
    const user = c.get('subject');
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
