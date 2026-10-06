import { statfsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { getOutboundPause, OUTBOUND_JOB_KINDS, RECONCILE_AFTER_RESTORE } from '../jobs/jobStore.ts';
import { DEFAULT_INTERVAL_MS } from '../jobs/runner.ts';
import type { DeliveryConfig } from '../types.ts';
import { activationJson, getAutomationActivation } from './automation.ts';

/*
 * Administrator operations status (F-3, F-Q3 (b), WP3-T13D): what the administrator may see of
 * the submission and delivery pipeline without seeing anyone's timesheet details.
 *
 * Every field returned here is named in this file (a column allowlist): nothing is spread from a
 * row, so a column added to a table later is never exposed by accident. Never read or returned:
 * day entries, work sessions, breaks, leave, notes, calculations, personal policies, OT ledger
 * lines or balances, review payloads and snapshots (`payload_json`), PDFs, signature images,
 * templates, subject or body, the Message-ID, raw provider responses, audit payloads (so A3-01's
 * `refreshed_pay_period` never appears) and anything derived from day entries or sessions
 * (WP2-A-01). The recipient addresses of the effective settings and of the frozen envelopes are
 * the one personal-looking value the owner allowed (F-Q3 (b)); only `to` and `cc` are read from
 * the envelope, never its subject.
 *
 * Reads only: this module never writes a row, so an administrator view cannot change a record.
 * Rows come from submitted revisions (`timesheet_revisions`), so a period is listed once it has
 * a revision; whether anyone has a draft is not shown, because a draft row is derived from the
 * person's entries.
 */

/** A runner is "stale" when its heartbeat is older than eight passes of the in-process loop. */
export const HEARTBEAT_STALE_SECONDS = (DEFAULT_INTERVAL_MS / 1000) * 8;

export const DEFAULT_SUBMISSION_LIMIT = 100;
export const MAX_SUBMISSION_LIMIT = 500;

const JOB_STATES = ['queued', 'leased', 'succeeded', 'intervention', 'cancelled'] as const;
const DELIVERY_STATES = ['preparing', 'sending', 'accepted', 'failed_temporary', 'failed_permanent', 'uncertain'] as const;
const MAX_ADDRESSES = 100;
const MAX_ADDRESS_LENGTH = 320;

/* ------------------------------------------------------------- redaction ---- */

const FAULT_CODE = /^[a-z][a-z0-9_]{0,59}$/;
const SMTP_REPLY = /^[2-5][0-9]{2}$/;

/**
 * The redacted fault class of a stored error or provider text: its leading lowercase code, or
 * the numeric SMTP reply as `smtp_<reply>`, or `unclassified`. The rest of the text is dropped.
 */
export function faultCode(text: string | null): string | null {
  if (text === null) return null;
  const token = text.trim().split(/\s+/, 1)[0] ?? '';
  if (FAULT_CODE.test(token)) return token;
  if (SMTP_REPLY.test(token)) return `smtp_${token}`;
  return 'unclassified';
}

function addressList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && item.length <= MAX_ADDRESS_LENGTH)
    .slice(0, MAX_ADDRESSES);
}

function recipientsOf(json: string | null): { to: string[]; cc: string[] } | null {
  if (json === null) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    return { to: addressList(record.to), cc: addressList(record.cc) };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------- system status ---- */

export interface DeliverySetup {
  /** Whether a sender address is configured; null when no delivery configuration was provided. */
  senderConfigured: boolean | null;
  outboundMode: 'capture' | 'smtp' | 'unknown';
}

/**
 * The sender and outbound mode of the delivery configuration the server was started with
 * (`AppDeps.delivery`, built once by `loadDeliveryConfig`); this module never reads the
 * environment. Only a flag and the mode leave this function, never the address or any SMTP
 * setting. Without a configuration the setup is reported as unknown.
 */
export function deliverySetupOf(delivery: Pick<DeliveryConfig, 'senderAddress' | 'outbound'> | undefined): DeliverySetup {
  if (delivery === undefined) return { senderConfigured: null, outboundMode: 'unknown' };
  return { senderConfigured: delivery.senderAddress !== null, outboundMode: delivery.outbound.mode };
}

export interface DataVolume {
  /** Bytes available to this process on the data volume; null when the volume cannot be read. */
  freeBytes: number | null;
  totalBytes: number | null;
}

/**
 * The free and total space of the volume that holds the private data directory (WP4-T07, `fs.statfs`). The directory
 * may not exist yet (nothing was ever stored), so the nearest existing parent, which is on the same volume, is read.
 * Byte counts only: never the path.
 */
export function readDataVolume(dataDir: string | null): DataVolume {
  const unknown: DataVolume = { freeBytes: null, totalBytes: null };
  if (dataDir === null) return unknown;
  let path = dataDir;
  for (let depth = 0; depth < 8; depth += 1) {
    try {
      const stats = statfsSync(path);
      return { freeBytes: Number(stats.bavail) * Number(stats.bsize), totalBytes: Number(stats.blocks) * Number(stats.bsize) };
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      const parent = dirname(path);
      if (code !== 'ENOENT' || parent === path) return unknown;
      path = parent;
    }
  }
  return unknown;
}

/**
 * The private data directory whose volume the status reports: the configured one, else the default beside the
 * database (the same default as `createApp`); null for an in-memory database, which has no data directory.
 */
export function statusDataDir(delivery: Pick<DeliveryConfig, 'dataDir'> | undefined, databasePath: string): string | null {
  if (delivery !== undefined) return delivery.dataDir;
  return databasePath === ':memory:' ? null : join(dirname(resolve(databasePath)), 'private-data');
}

export interface OperationsStatus {
  sender: DeliverySetup;
  runner: { heartbeatAt: string | null; state: 'never' | 'running' | 'stale' };
  activation: ReturnType<typeof activationJson>;
  backup: BackupStatus & { ageSeconds: number | null };
  disk: DataVolume;
  outbound: OutboundStatus;
  retention: RetentionStatus;
  jobs: Record<(typeof JOB_STATES)[number], number>;
  deliveries: Record<(typeof DELIVERY_STATES)[number], number>;
}

function totals<S extends string>(db: Db, sql: string, states: readonly S[]): Record<S, number> {
  const out = Object.fromEntries(states.map((state) => [state, 0])) as Record<S, number>;
  for (const row of db.prepare<[], { state: string; total: number }>(sql).all()) {
    if ((states as readonly string[]).includes(row.state)) out[row.state as S] = row.total;
  }
  return out;
}

/** Whole seconds since the last successful backup by the injected clock; null when none was recorded. */
function backupAgeSeconds(clock: Clock, lastSuccessAt: string | null): number | null {
  return lastSuccessAt === null ? null : Math.max(0, nowEpoch(clock) - parseUtcInstant(lastSuccessAt));
}

export function getOperationsStatus(db: Db, clock: Clock, sender: DeliverySetup, dataDir: string | null = null): OperationsStatus {
  const heartbeatAt =
    db.prepare<[], { runner_heartbeat_at: string | null }>('SELECT runner_heartbeat_at FROM operations_state WHERE id = 1').get()
      ?.runner_heartbeat_at ?? null;
  const runnerState =
    heartbeatAt === null ? 'never' : nowEpoch(clock) - parseUtcInstant(heartbeatAt) > HEARTBEAT_STALE_SECONDS ? 'stale' : 'running';
  const backup = getBackupStatus(db);
  return {
    sender,
    runner: { heartbeatAt, state: runnerState },
    activation: activationJson(getAutomationActivation(db)),
    backup: { ...backup, ageSeconds: backupAgeSeconds(clock, backup.lastSuccessAt) },
    disk: readDataVolume(dataDir),
    outbound: getOutboundStatus(db),
    retention: getRetentionStatus(db),
    jobs: totals(db, 'SELECT state, count(*) AS total FROM jobs GROUP BY state', JOB_STATES),
    deliveries: totals(db, 'SELECT state, count(*) AS total FROM delivery_attempts GROUP BY state', DELIVERY_STATES),
  };
}

export function operationsStatusJson(status: OperationsStatus) {
  return {
    sender: { configured: status.sender.senderConfigured, outbound_mode: status.sender.outboundMode },
    runner: { heartbeat_at: status.runner.heartbeatAt, state: status.runner.state },
    activation: status.activation,
    backup: { ...backupStatusJson(status.backup), age_seconds: status.backup.ageSeconds },
    disk: { free_bytes: status.disk.freeBytes, total_bytes: status.disk.totalBytes },
    outbound: outboundStatusJson(status.outbound),
    retention: retentionStatusJson(status.retention),
    jobs: status.jobs,
    deliveries: status.deliveries,
  };
}

/* ---------------------------------------------------------- backup status ---- */

/*
 * The result of the latest `cli.js backup` (WP4-T05, migration 0009), as data; the administrator status (WP4-T07)
 * adds its age to it in `operationsStatusJson`. Only an outcome, a redacted fault code and two
 * UTC instants exist: never a path, a storage key, a hash or a count of anyone's records.
 */

export const BACKUP_OUTCOMES = ['succeeded', 'failed'] as const;

export interface BackupStatus {
  outcome: (typeof BACKUP_OUTCOMES)[number] | 'never';
  /** When the latest backup attempt ended (success or failure). */
  lastAttemptAt: string | null;
  /** When the latest successful backup ended; kept when a later attempt fails. */
  lastSuccessAt: string | null;
  /** The fault code of a failed latest attempt (lowercase code, see `faultCode`); null otherwise. */
  faultCode: string | null;
}

interface BackupStatusRow {
  backup_last_outcome: string | null;
  backup_last_attempt_at: string | null;
  backup_last_success_at: string | null;
  backup_last_fault_code: string | null;
}

export function getBackupStatus(db: Db): BackupStatus {
  const row = db
    .prepare<[], BackupStatusRow>(
      'SELECT backup_last_outcome, backup_last_attempt_at, backup_last_success_at, backup_last_fault_code FROM operations_state WHERE id = 1',
    )
    .get();
  const outcome = (BACKUP_OUTCOMES as readonly string[]).includes(row?.backup_last_outcome ?? '')
    ? (row?.backup_last_outcome as (typeof BACKUP_OUTCOMES)[number])
    : 'never';
  return {
    outcome,
    lastAttemptAt: row?.backup_last_attempt_at ?? null,
    lastSuccessAt: row?.backup_last_success_at ?? null,
    faultCode: outcome === 'failed' ? faultCode(row?.backup_last_fault_code ?? null) : null,
  };
}

export function backupStatusJson(status: BackupStatus) {
  return {
    outcome: status.outcome,
    last_attempt_at: status.lastAttemptAt,
    last_success_at: status.lastSuccessAt,
    fault_code: status.faultCode,
  };
}

/* --------------------------------------------------------- outbound status ---- */

/*
 * The outbound pause (WP4-T06, migration 0010) and what awaits reconciliation, as data; the administrator status (WP4-T07) shows
 * it through `operationsStatusJson`. Counts and a lowercase reason only:
 * never a recipient, a job or attempt id, a revision or a name.
 */

export interface OutboundCounts {
  /** Delivery attempts that are uncertain without the owner's decision (AC-08); resume is refused while any remain. */
  awaitingDecision: number;
  /** Outbound jobs (send_email, send_reminder) waiting queued; they are claimed once delivery is not paused. */
  queuedSendJobs: number;
  /** Outbound jobs a restore held in intervention for reconciliation; never claimed again. */
  heldSendJobs: number;
}

export interface OutboundStatus extends OutboundCounts {
  paused: boolean;
  pausedAt: string | null;
  reason: string | null;
}

export function getOutboundStatus(db: Db): OutboundStatus {
  const pause = getOutboundPause(db);
  const kindList = OUTBOUND_JOB_KINDS.map(() => '?').join(', ');
  const queued = db.prepare<string[], { total: number }>(`SELECT count(*) AS total FROM jobs WHERE kind IN (${kindList}) AND state = 'queued'`);
  const held = db.prepare<string[], { total: number }>(`SELECT count(*) AS total FROM jobs WHERE kind IN (${kindList}) AND state = 'intervention' AND last_error = ?`);
  return {
    paused: pause !== null,
    pausedAt: pause?.pausedAt ?? null,
    reason: pause?.reason ?? null,
    awaitingDecision: Number(db.prepare("SELECT count(*) FROM delivery_attempts WHERE state = 'uncertain' AND decision IS NULL").pluck().get()),
    queuedSendJobs: queued.get(...OUTBOUND_JOB_KINDS)?.total ?? 0,
    heldSendJobs: held.get(...OUTBOUND_JOB_KINDS, RECONCILE_AFTER_RESTORE)?.total ?? 0,
  };
}

export function outboundStatusJson(status: OutboundStatus) {
  return {
    paused: status.paused,
    paused_at: status.pausedAt,
    reason: status.reason,
    awaiting_decision: status.awaitingDecision,
    queued_send_jobs: status.queuedSendJobs,
    held_send_jobs: status.heldSendJobs,
  };
}

/* ------------------------------------------------------- retention status ---- */

/*
 * The result of the latest daily job-row retention (WP4-T07B, migration 0011, owner decision F-4 (a)): when it ran and how many
 * succeeded scan job rows it deleted. A UTC instant and a count only: never a job id, a business key or a user.
 */

export interface RetentionStatus {
  /** When the latest retention run ended; null before the first run. */
  lastRunAt: string | null;
  /** How many job rows that run deleted; null before the first run. */
  lastDeleted: number | null;
}

export function getRetentionStatus(db: Db): RetentionStatus {
  const row = db
    .prepare<[], { job_retention_last_run_at: string | null; job_retention_last_deleted: number | null }>(
      'SELECT job_retention_last_run_at, job_retention_last_deleted FROM operations_state WHERE id = 1',
    )
    .get();
  return { lastRunAt: row?.job_retention_last_run_at ?? null, lastDeleted: row?.job_retention_last_deleted ?? null };
}

export function retentionStatusJson(status: RetentionStatus) {
  return { last_run_at: status.lastRunAt, last_deleted: status.lastDeleted };
}

/* ------------------------------------------------------- submission status ---- */

interface RevisionRow {
  revision_id: string;
  user_id: string;
  display_name: string;
  payroll_date: string;
  period_start: string;
  period_end: string;
  due_at_utc: string;
  revision_no: number;
  origin: 'employee' | 'deadline';
  review_state: 'pending' | 'signed';
  send_requested: number;
  finalized_at: string;
  pdf_state: 'pending' | 'ready' | 'failed' | null;
  pdf_error: string | null;
}

interface AttemptRow {
  attempt_count: number;
  state: (typeof DELIVERY_STATES)[number];
  provider_response: string | null;
  accepted_at: string | null;
  decision: string | null;
  envelope_json: string;
}

export interface SubmissionStatus {
  userId: string;
  displayName: string;
  period: { payrollDate: string; periodStart: string; periodEnd: string; dueAt: string };
  revision: { no: number; origin: 'employee' | 'deadline'; reviewState: 'pending' | 'signed'; finalizedAt: string; sendRequested: boolean };
  pdf: { state: 'pending' | 'ready' | 'failed' | 'none'; faultCode: string | null };
  delivery: {
    state: (typeof DELIVERY_STATES)[number] | 'none';
    attempts: number;
    acceptedAt: string | null;
    faultCode: string | null;
    decisionRequired: boolean;
    jobState: (typeof JOB_STATES)[number] | 'none';
    jobFaultCode: string | null;
  };
  recipients: { effective: { to: string[]; cc: string[] }; frozen: { to: string[]; cc: string[] } | null };
}

/**
 * The latest revision of every timesheet with its PDF and delivery state and recipient addresses,
 * most recent deadline first. Every join is on the (id, user_id) pair of the owner of the revision.
 */
export function listSubmissionStatus(db: Db, options: { limit?: number } = {}): SubmissionStatus[] {
  const limit = options.limit ?? DEFAULT_SUBMISSION_LIMIT;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_SUBMISSION_LIMIT) throw new Error('The limit is a whole number from 1 to the maximum');
  const revisions = db
    .prepare<[number], RevisionRow>(
      `SELECT r.id AS revision_id, r.user_id, u.display_name, p.payroll_date, p.period_start, p.period_end, p.due_at_utc,
              r.revision_no, r.origin, r.review_state, r.send_requested, r.created_at AS finalized_at,
              f.state AS pdf_state, f.last_error AS pdf_error
         FROM timesheet_revisions r
         JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
         JOIN pay_periods p ON p.id = t.pay_period_id
         JOIN users u ON u.id = r.user_id
         LEFT JOIN revision_files f ON f.revision_id = r.id AND f.user_id = r.user_id AND f.kind = 'pdf'
        WHERE r.revision_no = (SELECT max(x.revision_no) FROM timesheet_revisions x WHERE x.timesheet_id = r.timesheet_id AND x.user_id = r.user_id)
        ORDER BY p.due_at_utc DESC, u.display_name, r.id
        LIMIT ?`,
    )
    .all(limit);
  const latestAttempt = db.prepare<[string, string], AttemptRow>(
    `SELECT (SELECT count(*) FROM delivery_attempts c WHERE c.revision_id = a.revision_id AND c.user_id = a.user_id) AS attempt_count,
            a.state, a.provider_response, a.accepted_at, a.decision, a.envelope_json
       FROM delivery_attempts a
      WHERE a.revision_id = ? AND a.user_id = ?
      ORDER BY a.started_at DESC, a.attempt_no DESC
      LIMIT 1`,
  );
  const latestJob = db.prepare<[string, string], { state: (typeof JOB_STATES)[number]; last_error: string | null }>(
    `SELECT state, last_error FROM jobs WHERE revision_id = ? AND user_id = ? AND kind = 'send_email' ORDER BY created_at DESC, rowid DESC LIMIT 1`,
  );
  const settings = db.prepare<[string], { recipients_to: string; recipients_cc: string }>(
    'SELECT recipients_to, recipients_cc FROM submission_settings WHERE user_id = ? ORDER BY seq DESC LIMIT 1',
  );
  return revisions.map((row): SubmissionStatus => {
    const attempt = latestAttempt.get(row.revision_id, row.user_id);
    const job = latestJob.get(row.revision_id, row.user_id);
    const saved = settings.get(row.user_id);
    const faulty = attempt !== undefined && (attempt.state === 'failed_temporary' || attempt.state === 'failed_permanent' || attempt.state === 'uncertain');
    const frozen = attempt === undefined ? null : recipientsOf(attempt.envelope_json);
    return {
      userId: row.user_id,
      displayName: row.display_name,
      period: { payrollDate: row.payroll_date, periodStart: row.period_start, periodEnd: row.period_end, dueAt: row.due_at_utc },
      revision: {
        no: row.revision_no,
        origin: row.origin,
        reviewState: row.review_state,
        finalizedAt: row.finalized_at,
        sendRequested: row.send_requested === 1,
      },
      pdf: { state: row.pdf_state ?? 'none', faultCode: row.pdf_state === 'failed' ? faultCode(row.pdf_error) : null },
      delivery: {
        state: attempt?.state ?? 'none',
        attempts: attempt?.attempt_count ?? 0,
        acceptedAt: attempt?.accepted_at ?? null,
        faultCode: faulty ? faultCode(attempt.provider_response) : null,
        decisionRequired: attempt?.state === 'uncertain' && attempt.decision === null,
        jobState: job?.state ?? 'none',
        jobFaultCode: job?.state === 'intervention' || job?.state === 'queued' ? faultCode(job.last_error) : null,
      },
      recipients: {
        effective: saved === undefined ? { to: [], cc: [] } : { to: addressList(safeJson(saved.recipients_to)), cc: addressList(safeJson(saved.recipients_cc)) },
        frozen,
      },
    };
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export function submissionStatusJson(rows: readonly SubmissionStatus[]) {
  return rows.map((row) => ({
    user_id: row.userId,
    display_name: row.displayName,
    period: {
      payroll_date: row.period.payrollDate,
      period_start: row.period.periodStart,
      period_end: row.period.periodEnd,
      due_at: row.period.dueAt,
    },
    revision: {
      no: row.revision.no,
      origin: row.revision.origin,
      review_state: row.revision.reviewState,
      finalized_at: row.revision.finalizedAt,
      send_requested: row.revision.sendRequested,
    },
    pdf: { state: row.pdf.state, fault_code: row.pdf.faultCode },
    delivery: {
      state: row.delivery.state,
      attempts: row.delivery.attempts,
      accepted_at: row.delivery.acceptedAt,
      fault_code: row.delivery.faultCode,
      decision_required: row.delivery.decisionRequired,
      job_state: row.delivery.jobState,
      job_fault_code: row.delivery.jobFaultCode,
    },
    recipients: {
      effective: { to: row.recipients.effective.to, cc: row.recipients.effective.cc },
      frozen: row.recipients.frozen === null ? null : { to: row.recipients.frozen.to, cc: row.recipients.frozen.cc },
    },
  }));
}
