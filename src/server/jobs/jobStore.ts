import { randomBytes, randomUUID } from 'node:crypto';
import { formatUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';

/*
 * Durable job store (docs/03 "Atomicity and snapshots", docs/05 "Durable delivery").
 *
 * - Enqueueing is idempotent on the unique business key: a second enqueue of the same key
 *   returns the existing job and changes nothing.
 * - A runner claims one due job with a single `UPDATE ... RETURNING` inside BEGIN IMMEDIATE:
 *   the job becomes `leased` with the runner's lease owner and expiry, and the attempt counter
 *   moves forward. A queued job is due at `next_run_at`; a leased job whose lease expired (its
 *   runner died) is due again and is reclaimed as a new attempt.
 * - The lease holder renews, completes or fails the job; every write checks the lease owner,
 *   so a runner that lost its lease changes nothing.
 * - Failures retry after 1, 5, 15 and 60 minutes; the fifth failed attempt, a permanent
 *   failure or an expired lease on the last attempt needs visible intervention.
 * - Errors are stored as a redacted code only (never a message, recipient or content).
 * - The runner heartbeat lives in the single operations_state row.
 * - Outbound pause (WP4-T06, migration 0010): while operations_state holds `outbound_paused_at`, a claim never leases a
 *   job of `OUTBOUND_JOB_KINDS` (the jobs that hand a message to the outbound adapter, capture included), whatever kinds
 *   the runner asks for. The pause is read inside the claim's own transaction, so no attempt is spent and nothing is
 *   sent from the moment it is set; other kinds (PDF rendering, the scans) are claimed as usual.
 * All instants are UTC strings from the injectable clock at second precision.
 */

export const RETRY_DELAYS_MINUTES: readonly number[] = Object.freeze([1, 5, 15, 60]);
/** The first attempt plus one retry per delay. */
export const MAX_ATTEMPTS = RETRY_DELAYS_MINUTES.length + 1;
export const DEFAULT_LEASE_SECONDS = 120;

/**
 * Job kinds that hand a message to the outbound adapter (finalization.ts `JOB_SEND_EMAIL`, notifications.ts
 * `JOB_SEND_REMINDER`; restore.test.ts pins the equality). None of them is claimed while outbound delivery is paused.
 */
export const OUTBOUND_JOB_KINDS: readonly string[] = Object.freeze(['send_email', 'send_reminder']);

/**
 * The code a restore (ops/restore.ts) writes on what it marks for explicit reconciliation: the provider response of an
 * attempt made `uncertain` and the last error of a send job held in intervention (migration 0010 allows a `preparing`
 * attempt to become `uncertain` with this code only).
 */
export const RECONCILE_AFTER_RESTORE = 'reconcile_after_restore';

export type JobState = 'queued' | 'leased' | 'succeeded' | 'intervention' | 'cancelled';
/** Routing identifiers only (docs/03): never message content, personal text or secrets. */
export type JobPayload = Record<string, string | number | boolean | null>;

export interface Job {
  id: string;
  userId: string | null;
  revisionId: string | null;
  kind: string;
  businessKey: string;
  payload: JobPayload;
  state: JobState;
  attempts: number;
  nextRunAt: string;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JobRow {
  id: string;
  user_id: string | null;
  revision_id: string | null;
  kind: string;
  business_key: string;
  payload_json: string;
  state: JobState;
  attempts: number;
  next_run_at: string;
  lease_owner: string | null;
  lease_expires_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

const ERROR_CODE = /^[a-z][a-z0-9_]{0,59}$/;
const KIND = /^[a-z_]{1,40}$/;
const OWNER = /^[A-Za-z0-9._:-]{1,100}$/;

/**
 * A job failure with a fixed, non-personal code. `permanent` failures cannot succeed by
 * retrying (for example an integrity mismatch) and go to intervention at once.
 */
export class JobError extends Error {
  readonly code: string;
  readonly permanent: boolean;

  constructor(code: string, options: { permanent?: boolean; cause?: unknown } = {}) {
    if (!ERROR_CODE.test(code)) throw new Error('A job error code is a lowercase identifier');
    super(code, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'JobError';
    this.code = code;
    this.permanent = options.permanent ?? false;
  }
}

/** The only text a job row ever stores about a failure. */
export function redactJobError(error: unknown): string {
  return error instanceof JobError && ERROR_CODE.test(error.code) ? error.code : 'internal_error';
}

/** An opaque runner identity for leases and the heartbeat (no host or user name). */
export function newRunnerInstance(): string {
  return `runner-${randomBytes(6).toString('hex')}`;
}

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    userId: row.user_id,
    revisionId: row.revision_id,
    kind: row.kind,
    businessKey: row.business_key,
    payload: JSON.parse(row.payload_json) as JobPayload,
    state: row.state,
    attempts: row.attempts,
    nextRunAt: row.next_run_at,
    leaseOwner: row.lease_owner,
    leaseExpiresAt: row.lease_expires_at,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function utcAfter(clock: Clock, seconds: number): string {
  return formatUtcInstant(nowEpoch(clock) + seconds);
}

function checkOwner(owner: string): void {
  if (!OWNER.test(owner)) throw new Error('Invalid lease owner');
}

function checkLease(seconds: number): void {
  if (!Number.isSafeInteger(seconds) || seconds < 1) throw new Error('The lease is a positive number of seconds');
}

export function getJob(db: Db, id: string): Job | null {
  const row = db.prepare<[string], JobRow>('SELECT * FROM jobs WHERE id = ?').get(id);
  return row === undefined ? null : toJob(row);
}

export interface EnqueueInput {
  kind: string;
  businessKey: string;
  userId?: string | null;
  revisionId?: string | null;
  payload?: JobPayload;
  /** First run instant (UTC); defaults to now. */
  runAt?: string;
}

/**
 * Inserts a queued job unless its business key exists. Safe inside a caller's transaction
 * (one statement). Returns the stored job and whether this call created it.
 */
export function enqueueJob(db: Db, clock: Clock, input: EnqueueInput): { job: Job; created: boolean } {
  if (!KIND.test(input.kind)) throw new Error('Invalid job kind');
  const now = formatUtcInstant(nowEpoch(clock));
  const inserted = db
    .prepare(
      `INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?)
       ON CONFLICT (business_key) DO NOTHING`,
    )
    .run(
      randomUUID(),
      input.userId ?? null,
      input.revisionId ?? null,
      input.kind,
      input.businessKey,
      JSON.stringify(input.payload ?? {}),
      input.runAt ?? now,
      now,
      now,
    );
  const row = db.prepare<[string], JobRow>('SELECT * FROM jobs WHERE business_key = ?').get(input.businessKey);
  if (row === undefined) throw new Error('The enqueued job is missing');
  return { job: toJob(row), created: inserted.changes === 1 };
}

export interface ClaimOptions {
  owner: string;
  /** Only these kinds are claimed (the kinds the runner has handlers for). */
  kinds: readonly string[];
  leaseSeconds?: number;
}

export interface OutboundPause {
  /** UTC instant the pause was set. */
  pausedAt: string;
  /** Lowercase code, for example `restored`. */
  reason: string;
}

/** The outbound pause recorded in operations_state, or null when outbound delivery is not paused. */
export function getOutboundPause(db: Db): OutboundPause | null {
  const row = db
    .prepare<[], { outbound_paused_at: string | null; outbound_paused_reason: string | null }>(
      'SELECT outbound_paused_at, outbound_paused_reason FROM operations_state WHERE id = 1',
    )
    .get();
  if (row === undefined || row.outbound_paused_at === null || row.outbound_paused_reason === null) return null;
  return { pausedAt: row.outbound_paused_at, reason: row.outbound_paused_reason };
}

/**
 * Atomically leases the next due job of the given kinds, or returns null. A leased job whose
 * lease expired is reclaimed as a new attempt, unless it already used its last attempt: then it
 * moves to intervention with the code `lease_expired`. While outbound delivery is paused, the
 * outbound kinds are left out (neither claimed nor swept), so no attempt is spent on them.
 */
export function claimNextJob(db: Db, clock: Clock, options: ClaimOptions): Job | null {
  checkOwner(options.owner);
  const leaseSeconds = options.leaseSeconds ?? DEFAULT_LEASE_SECONDS;
  checkLease(leaseSeconds);
  if (options.kinds.length === 0) return null;
  for (const kind of options.kinds) if (!KIND.test(kind)) throw new Error('Invalid job kind');
  return writeTransaction(db, (): Job | null => {
    const kinds = getOutboundPause(db) === null ? options.kinds : options.kinds.filter((kind) => !OUTBOUND_JOB_KINDS.includes(kind));
    if (kinds.length === 0) return null;
    const kindList = kinds.map(() => '?').join(', ');
    const now = formatUtcInstant(nowEpoch(clock));
    db.prepare(
      `UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = 'lease_expired', updated_at = ?
        WHERE state = 'leased' AND lease_expires_at <= ? AND attempts >= ? AND kind IN (${kindList})`,
    ).run(now, now, MAX_ATTEMPTS, ...kinds);
    const row = db
      .prepare(
        `UPDATE jobs SET state = 'leased', lease_owner = ?, lease_expires_at = ?, attempts = attempts + 1, updated_at = ?
          WHERE id = (
            SELECT id FROM jobs
             WHERE kind IN (${kindList})
               AND ((state = 'queued' AND next_run_at <= ?) OR (state = 'leased' AND lease_expires_at <= ?))
             ORDER BY next_run_at, created_at, id
             LIMIT 1)
        RETURNING *`,
      )
      .get(options.owner, utcAfter(clock, leaseSeconds), now, ...kinds, now, now) as JobRow | undefined;
    return row === undefined ? null : toJob(row);
  });
}

/** Extends a lease the owner still holds; false when the lease expired or moved to another runner. */
export function renewLease(db: Db, clock: Clock, jobId: string, owner: string, leaseSeconds = DEFAULT_LEASE_SECONDS): boolean {
  checkLease(leaseSeconds);
  const now = formatUtcInstant(nowEpoch(clock));
  const result = db
    .prepare(
      `UPDATE jobs SET lease_expires_at = ?, updated_at = ?
        WHERE id = ? AND state = 'leased' AND lease_owner = ? AND lease_expires_at > ?`,
    )
    .run(utcAfter(clock, leaseSeconds), now, jobId, owner, now);
  return result.changes === 1;
}

/** Marks the job succeeded; false when this runner no longer holds the lease. */
export function completeJob(db: Db, clock: Clock, jobId: string, owner: string): boolean {
  const now = formatUtcInstant(nowEpoch(clock));
  const result = db
    .prepare(
      `UPDATE jobs SET state = 'succeeded', lease_owner = NULL, lease_expires_at = NULL, last_error = NULL, updated_at = ?
        WHERE id = ? AND state = 'leased' AND lease_owner = ?`,
    )
    .run(now, jobId, owner);
  return result.changes === 1;
}

export type FailOutcome = { state: 'queued'; nextRunAt: string } | { state: 'intervention' } | { state: 'lost' };

/**
 * Records a failed attempt with a redacted code: queued again after the next retry delay, or
 * intervention after the last attempt or for a permanent failure. `lost` when this runner no
 * longer holds the lease (nothing is written).
 */
export function failJob(db: Db, clock: Clock, jobId: string, owner: string, error: unknown): FailOutcome {
  const code = redactJobError(error);
  const permanent = error instanceof JobError && error.permanent;
  return writeTransaction(db, (): FailOutcome => {
    const now = formatUtcInstant(nowEpoch(clock));
    const row = db
      .prepare<[string, string], { attempts: number }>("SELECT attempts FROM jobs WHERE id = ? AND state = 'leased' AND lease_owner = ?")
      .get(jobId, owner);
    if (row === undefined) return { state: 'lost' };
    const delay = RETRY_DELAYS_MINUTES[row.attempts - 1];
    if (permanent || row.attempts >= MAX_ATTEMPTS || delay === undefined) {
      db.prepare(
        `UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = ?, updated_at = ?
          WHERE id = ?`,
      ).run(code, now, jobId);
      return { state: 'intervention' };
    }
    const nextRunAt = utcAfter(clock, delay * 60);
    db.prepare(
      `UPDATE jobs SET state = 'queued', lease_owner = NULL, lease_expires_at = NULL, next_run_at = ?, last_error = ?, updated_at = ?
        WHERE id = ?`,
    ).run(nextRunAt, code, now, jobId);
    return { state: 'queued', nextRunAt };
  });
}

/** Writes the runner heartbeat (instant and opaque instance) to the single operations row. */
export function recordHeartbeat(db: Db, clock: Clock, instance: string): void {
  checkOwner(instance);
  db.prepare('UPDATE operations_state SET runner_heartbeat_at = ?, runner_instance = ? WHERE id = 1').run(formatUtcInstant(nowEpoch(clock)), instance);
}
