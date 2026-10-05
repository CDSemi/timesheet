import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { type FinalizationContext, type ResendResult, resendJson, resendRevision } from './finalization.ts';

/*
 * Delivery history and the uncertain-outcome decision (docs/05 "Durable delivery", AC-08).
 *
 * - Every read and write is scoped to the session owner; another user's attempt is
 *   indistinguishable from a missing one (404). Responses carry the owner's own frozen
 *   envelope (recipients, subject) and redacted provider data only: no body, no PDF bytes, no
 *   credential and no storage key.
 * - `recoverInterruptedSends` turns a `sending` attempt whose job lease has expired (or whose
 *   job is no longer leased) into `uncertain`: the process died while the server may have
 *   accepted the message, so it is never resent blindly. An expired lease of that job moves the
 *   job to intervention, so it is not reclaimed.
 * - `decideDelivery` records the owner's one explicit decision on an uncertain attempt: mark it
 *   delivered (stored as `treat_as_accepted`; the attempt stays `uncertain` with the decision)
 *   or resend it, which closes the attempt and creates a new send job and attempt on the same
 *   revision through the T06 same-revision resend, in the same transaction. One open attempt
 *   per revision is kept by the schema; the ledger and the revision are never touched.
 */

export const UNCERTAIN_LEASE_EXPIRED = 'lease_expired_while_sending';

/** Marks interrupted `sending` attempts uncertain; returns how many changed. */
export function recoverInterruptedSends(db: Db, clock: Clock): number {
  return writeTransaction(db, () => {
    const now = nowUtc(clock);
    const stale = db
      .prepare(
        `SELECT a.id AS attempt_id, j.id AS job_id, j.state AS job_state, j.lease_expires_at
           FROM delivery_attempts a
           JOIN jobs j ON j.id = a.job_id AND j.user_id = a.user_id
          WHERE a.state = 'sending' AND (j.state <> 'leased' OR j.lease_expires_at <= ?)`,
      )
      .all(now) as Array<{ attempt_id: string; job_id: string; job_state: string; lease_expires_at: string | null }>;
    for (const row of stale) {
      db.prepare(
        `UPDATE delivery_attempts SET state = 'uncertain', provider_response = ?, updated_at = ?
          WHERE id = ? AND state = 'sending'`,
      ).run(UNCERTAIN_LEASE_EXPIRED, now, row.attempt_id);
      if (row.job_state === 'leased') {
        db.prepare(
          `UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = 'delivery_uncertain', updated_at = ?
            WHERE id = ? AND state = 'leased' AND lease_expires_at <= ?`,
        ).run(now, row.job_id, now);
      }
    }
    return stale.length;
  });
}

type StoredDecision = 'resend' | 'treat_as_accepted' | 'abandon';
export type DeliveryDecision = 'mark_delivered' | 'resend';

const DECISION_OUT: Record<StoredDecision, string> = { resend: 'resend', treat_as_accepted: 'mark_delivered', abandon: 'abandon' };

interface AttemptRow {
  id: string;
  job_id: string;
  revision_id: string | null;
  revision_no: number | null;
  payroll_date: string | null;
  attempt_no: number;
  channel: string;
  envelope_json: string;
  message_id: string;
  provider_message_id: string | null;
  state: string;
  provider_response: string | null;
  accepted_at: string | null;
  decision: StoredDecision | null;
  decided_at: string | null;
  started_at: string;
  updated_at: string;
  job_state: string;
  job_last_error: string | null;
}

const ATTEMPT_SELECT = `
  SELECT a.id, a.job_id, a.revision_id, r.revision_no, p.payroll_date, a.attempt_no, a.channel, a.envelope_json,
         a.message_id, a.provider_message_id, a.state, a.provider_response, a.accepted_at, a.decision, a.decided_at,
         a.started_at, a.updated_at, j.state AS job_state, j.last_error AS job_last_error
    FROM delivery_attempts a
    JOIN jobs j ON j.id = a.job_id AND j.user_id = a.user_id
    LEFT JOIN timesheet_revisions r ON r.id = a.revision_id AND r.user_id = a.user_id
    LEFT JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
    LEFT JOIN pay_periods p ON p.id = t.pay_period_id`;

export interface DeliveryRecord {
  id: string;
  jobId: string;
  revisionId: string | null;
  revisionNo: number | null;
  payrollDate: string | null;
  attemptNo: number;
  channel: string;
  to: string[];
  cc: string[];
  subject: string | null;
  messageId: string;
  providerMessageId: string | null;
  state: string;
  providerResponse: string | null;
  acceptedAt: string | null;
  decision: string | null;
  decidedAt: string | null;
  decisionRequired: boolean;
  startedAt: string;
  updatedAt: string;
  job: { state: string; lastError: string | null };
}

const stringList = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

function toRecord(row: AttemptRow): DeliveryRecord {
  const envelope = JSON.parse(row.envelope_json) as Record<string, unknown>;
  return {
    id: row.id,
    jobId: row.job_id,
    revisionId: row.revision_id,
    revisionNo: row.revision_no,
    payrollDate: row.payroll_date,
    attemptNo: row.attempt_no,
    channel: row.channel,
    to: stringList(envelope.to),
    cc: stringList(envelope.cc),
    subject: typeof envelope.subject === 'string' ? envelope.subject : null,
    messageId: row.message_id,
    providerMessageId: row.provider_message_id,
    state: row.state,
    providerResponse: row.provider_response,
    acceptedAt: row.accepted_at,
    decision: row.decision === null ? null : DECISION_OUT[row.decision],
    decidedAt: row.decided_at,
    decisionRequired: row.state === 'uncertain' && row.decision === null,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    job: { state: row.job_state, lastError: row.job_last_error },
  };
}

/** The owner's delivery attempts, newest first; optionally of one revision. Writes nothing. */
export function listDeliveries(db: Db, userId: string, filter: { revisionId?: string } = {}): DeliveryRecord[] {
  const rows =
    filter.revisionId === undefined
      ? (db.prepare(`${ATTEMPT_SELECT} WHERE a.user_id = ? ORDER BY a.started_at DESC, a.attempt_no DESC, a.id`).all(userId) as AttemptRow[])
      : (db
          .prepare(`${ATTEMPT_SELECT} WHERE a.user_id = ? AND a.revision_id = ? ORDER BY a.started_at DESC, a.attempt_no DESC, a.id`)
          .all(userId, filter.revisionId) as AttemptRow[]);
  return rows.map(toRecord);
}

function loadAttempt(db: Db, userId: string, attemptId: string): DeliveryRecord | null {
  const row = db.prepare(`${ATTEMPT_SELECT} WHERE a.id = ? AND a.user_id = ?`).get(attemptId, userId) as AttemptRow | undefined;
  return row === undefined ? null : toRecord(row);
}

export interface DecisionResult {
  attempt: DeliveryRecord;
  resend: ResendResult | null;
}

/** The owner's explicit decision on an uncertain attempt (see the module comment). */
export function decideDelivery(ctx: FinalizationContext, attemptId: string, decision: DeliveryDecision): DecisionResult {
  const { db, clock, user } = ctx;
  return writeTransaction(db, (): DecisionResult => {
    recoverInterruptedSends(db, clock);
    const current = loadAttempt(db, user.id, attemptId);
    if (current === null) throw notFound('Delivery attempt');
    if (current.decision !== null) {
      throw new ApiError(409, 'delivery_decision_recorded', 'A decision was already recorded for this delivery attempt');
    }
    if (current.state !== 'uncertain') {
      throw new ApiError(409, 'delivery_not_uncertain', 'Only an uncertain delivery attempt takes a decision', { state: current.state });
    }
    const stored: StoredDecision = decision === 'resend' ? 'resend' : 'treat_as_accepted';
    const now = nowUtc(clock);
    const changed = db
      .prepare(
        `UPDATE delivery_attempts SET decision = ?, decision_actor_user_id = ?, decided_at = ?, updated_at = ?
          WHERE id = ? AND user_id = ? AND state = 'uncertain' AND decision IS NULL`,
      )
      .run(stored, user.id, now, now, attemptId, user.id).changes;
    if (changed !== 1) throw new ApiError(409, 'delivery_decision_recorded', 'A decision was already recorded for this delivery attempt');
    let resend: ResendResult | null = null;
    if (decision === 'resend') {
      if (current.revisionId === null) throw new ApiError(409, 'delivery_not_resendable', 'This delivery attempt has no revision to resend');
      // The T06 same-revision resend: the frozen envelope and PDF, a new job and a preparing attempt.
      resend = resendRevision(ctx, current.revisionId, {});
    }
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: 'delivery.decision',
      entityType: 'delivery_attempt',
      entityId: attemptId,
      before: { state: current.state, decision: null },
      after: {
        state: current.state,
        decision: stored,
        resend_job_id: resend?.job.id ?? null,
        resend_attempt_id: resend?.attempt.id ?? null,
      },
    });
    const attempt = loadAttempt(db, user.id, attemptId);
    if (attempt === null) throw notFound('Delivery attempt');
    return { attempt, resend };
  });
}

export function deliveryJson(record: DeliveryRecord) {
  return {
    id: record.id,
    job_id: record.jobId,
    revision_id: record.revisionId,
    revision_no: record.revisionNo,
    payroll_date: record.payrollDate,
    attempt_no: record.attemptNo,
    channel: record.channel,
    to: record.to,
    cc: record.cc,
    subject: record.subject,
    message_id: record.messageId,
    provider_message_id: record.providerMessageId,
    state: record.state,
    provider_response: record.providerResponse,
    accepted_at: record.acceptedAt,
    decision: record.decision,
    decided_at: record.decidedAt,
    decision_required: record.decisionRequired,
    started_at: record.startedAt,
    updated_at: record.updatedAt,
    job: { state: record.job.state, last_error: record.job.lastError },
  };
}

export function decisionJson(result: DecisionResult) {
  return { attempt: deliveryJson(result.attempt), resend: result.resend === null ? null : resendJson(result.resend) };
}
