import { createHash } from 'node:crypto';
import {
  closeSync,
  constants,
  copyFileSync,
  createReadStream,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import Database from 'better-sqlite3';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, openDatabase, writeTransaction } from '../db/database.ts';
import { MIGRATIONS, migrate } from '../db/migrations.ts';
import { isStorageKey } from '../files/fileStore.ts';
import { getOutboundPause, OUTBOUND_JOB_KINDS, RECONCILE_AFTER_RESTORE } from '../jobs/jobStore.ts';
import { recordAudit } from '../services/audit.ts';
import { JOB_SEND_EMAIL } from '../services/finalization.ts';
import { JOB_SEND_REMINDER } from '../services/notifications.ts';
import { getOutboundStatus, type OutboundCounts } from '../services/operationsStatus.ts';
import {
  BACKUP_DATABASE_NAME,
  BACKUP_FILES_DIR,
  type BackupManifest,
  MANIFEST_FILE_NAME,
  MANIFEST_FORMAT,
  MANIFEST_FORMAT_VERSION,
  MANIFEST_KEY_PATHS,
  type ManifestFile,
  manifestSummary,
} from './manifest.ts';

/*
 * Isolated restore and outbound reconciliation (WP4-T06; docs/07 "Backup, restore and upgrades", AC-11, AC-15, AC-08).
 *
 * `restoreBackup` turns one backup folder (WP4-T05: `manifest.json`, `timesheet.db`, `files/<key>`) into a new, isolated
 * instance directory laid out like the container's /data volume: `<target>/timesheet.db` and
 * `<target>/private-data/files/<key>` (DATABASE_PATH and DATA_DIR of the restored instance). In order:
 * 1. The target must be empty or absent, must not be or lie inside the live private data directory (DATA_DIR), must not
 *    contain it or the live database, and must not lie inside the backup folder. Nothing is ever written to the live
 *    DATA_DIR or the live database, and nothing is written at all before every check of step 2 passed.
 * 2. The manifest is parsed with its exact key allowlist; a schema newer than this application is refused; the database
 *    copy and every listed file are hashed in the backup folder and compared with the manifest (SHA-256 and size).
 * 3. The database and the files are copied with exclusive creation; every COPY is hashed again.
 * 4. The copied database must pass `integrity_check` and `foreign_key_check`, record the manifest's schema version and
 *    list exactly the manifest's files as attachments. Then pending migrations are applied (an older backup is upgraded
 *    once, through the same versioned migrations as any start).
 * 5. One transaction sets the outbound pause (`restored`) and marks for explicit reconciliation what the source may
 *    have sent after the snapshot: every `sending` or `preparing` attempt becomes `uncertain` with the code
 *    `reconcile_after_restore` (the owner decides: mark delivered, or resend once - AC-08), and EVERY queued or leased
 *    outbound job of the backup (`send_email`, `send_reminder`; coordinator decision, WP4-T06 attempt 2) moves to
 *    intervention with the same code: held, never claimed and never sent automatically, also after the resume. Jobs
 *    created after the restore (a new manual send) are not held; they only wait for the resume. A system audit event
 *    records the counts.
 * A failure removes exactly the files and folders this attempt created. Results carry counts only: no path, name,
 * address, storage key or hash is returned for printing (`restoreSummaryJson`).
 *
 * Rollback mode (WP4-T12A, `keepSchema`): the copy is NOT migrated, so the previous build can run on it after an upgrade
 * went wrong (docs/07: "Downgrade binaries only with compatible schema; otherwise restore the paired DB/files"). A schema
 * older than the outbound pause (migration 10) has no pause columns, so the pause cannot be recorded, and the old state
 * flow has no `preparing` -> `uncertain` transition. The restore then refuses unless the operator confirms
 * (`confirmUnpaused`), and does what that schema allows: every queued or leased outbound job moves to intervention (the
 * previous build's runner never claims it) and every `sending` attempt becomes `uncertain` for the owner's decision; a
 * `preparing` attempt stays as it is, its job being held. Mail that went out after the snapshot is therefore never sent
 * again by the restored copy. Jobs created later (by the scans or by an operator) are not held: the operator starts the
 * previous build with JOB_RUNNER=off until reconciliation is done (printed as a warning by `cli.js restore`). A backup
 * that has the pause behaves exactly as without the mode.
 *
 * `resumeOutbound` clears the pause only while no attempt awaits its decision (uncertain without a decision), and
 * records a system audit event. Never run the source and the restored instance's queues at the same time (runbook).
 *
 * Held jobs leave the hold only through an explicit operator step, after the operator checked the source mailbox or its
 * capture (`cli.js outbound release|drop`). `releaseHeldJob` (by id) and `releaseAllHeldJobs` (bulk, after the preview
 * of `listHeldJobs`) put a held job back in the queue under the normal AC-08 rules: a job whose latest attempt is
 * uncertain is never released (its attempt takes the owner's decision instead), and a send job is not released while
 * another attempt of its revision is open or a later send of the same revision exists (so a send the owner already
 * repeated is never sent twice). `dropHeldReminder` cancels a held reminder instead. Each step is one IMMEDIATE
 * transaction with a system audit event (job id and kind only).
 */

export { RECONCILE_AFTER_RESTORE };

/** Database file name inside a restored instance directory (DATABASE_PATH = <target>/timesheet.db). */
export const RESTORED_DATABASE_NAME = 'timesheet.db';
/** Private data directory inside a restored instance directory (DATA_DIR = <target>/private-data). */
export const RESTORED_DATA_DIR = 'private-data';
/** Reason code of the pause a restore sets. */
export const PAUSE_REASON_RESTORED = 'restored';

/** A refusal of the target (exit 2): nothing was read from the backup or written. */
export type RestoreRefusalCode =
  | 'target_not_empty'
  | 'target_inside_data_dir'
  | 'target_is_live'
  | 'target_inside_backup'
  | 'target_unusable'
  | 'unpaused_schema_unconfirmed';

/** A backup that failed a check, or a copy that could not be completed (exit 1); nothing remains in the target. */
export type RestoreFaultCode =
  | 'backup_unreadable'
  | 'manifest_invalid'
  | 'schema_newer'
  | 'database_hash_mismatch'
  | 'file_missing'
  | 'file_size_mismatch'
  | 'file_hash_mismatch'
  | 'integrity_check_failed'
  | 'foreign_key_violation'
  | 'schema_mismatch'
  | 'attachments_mismatch'
  | 'write_failed';

const MESSAGES: Record<RestoreRefusalCode | RestoreFaultCode, string> = {
  target_not_empty: 'The restore target must be an empty or new directory',
  target_inside_data_dir: 'The restore target must be outside the live private data directory (DATA_DIR)',
  target_is_live: 'The restore target must not hold the live database or the live private data directory',
  target_inside_backup: 'The restore target must be outside the backup folder',
  target_unusable: 'The restore target cannot be created or is not a directory',
  unpaused_schema_unconfirmed:
    'The backup schema predates the outbound pause, so the restored copy cannot be paused; its backed-up send jobs are held, but confirm that the previous build will be started with JOB_RUNNER=off until reconciliation',
  backup_unreadable: 'The backup folder or its manifest cannot be read',
  manifest_invalid: 'The backup manifest is not a valid timesheet backup manifest',
  schema_newer: 'The backup has a newer database schema than this application',
  database_hash_mismatch: 'The database copy does not match the SHA-256 and size in the manifest',
  file_missing: 'A file listed in the manifest is missing from the backup',
  file_size_mismatch: 'A file does not have the size recorded in the manifest',
  file_hash_mismatch: 'A file does not match the SHA-256 recorded in the manifest',
  integrity_check_failed: 'The restored database failed its integrity check',
  foreign_key_violation: 'The restored database has foreign key violations',
  schema_mismatch: 'The restored database schema does not match the manifest or this application',
  attachments_mismatch: 'The restored database does not refer to exactly the files in the manifest',
  write_failed: 'The restore could not be written to the target',
};

const REFUSALS: ReadonlySet<string> = new Set<RestoreRefusalCode>([
  'target_not_empty',
  'target_inside_data_dir',
  'target_is_live',
  'target_inside_backup',
  'target_unusable',
  'unpaused_schema_unconfirmed',
]);

export class RestoreError extends Error {
  readonly code: RestoreRefusalCode | RestoreFaultCode;

  constructor(code: RestoreRefusalCode | RestoreFaultCode, options?: { cause?: unknown }) {
    super(MESSAGES[code], options);
    this.name = 'RestoreError';
    this.code = code;
  }

  /** True for a refusal of the target (exit 2), false for a backup that failed a check or a failed copy (exit 1). */
  get refusal(): boolean {
    return REFUSALS.has(this.code);
  }
}

export interface RestoreRequest {
  /** The backup folder (holds `manifest.json`). */
  fromDir: string;
  /** The new instance directory: absent or empty. */
  toDir: string;
  /** The live private data directory (DATA_DIR of the running configuration); never written. */
  liveDataDir: string;
  /** The live database (DATABASE_PATH of the running configuration); never opened or written. */
  liveDatabasePath: string;
  clock: Clock;
  /** Rollback mode: restore the schema as the backup has it (no migration); see the module comment. */
  keepSchema?: boolean;
  /** Required with `keepSchema` when the backup's schema has no outbound pause: the operator accepts the limits. */
  confirmUnpaused?: boolean;
}

export interface RestoreReconciliation {
  attemptsMarkedUncertain: number;
  sendJobsHeld: number;
}

export interface RestoreResult {
  /** Absolute paths of the restored instance (for the caller; never printed by the CLI). */
  databasePath: string;
  dataDir: string;
  manifest: BackupManifest;
  schema: { backup: number; restored: number; applied: number[] };
  /** Null only in rollback mode on a schema without the outbound pause. */
  pause: { pausedAt: string; reason: string } | null;
  reconciliation: RestoreReconciliation;
  outbound: OutboundCounts;
  counts: { users: number; revisions: number; ledgerEntries: number; attachments: number };
}

const MAX_MANIFEST_BYTES = 64 * 1024 * 1024;
const SHA256 = /^[0-9a-f]{64}$/;
const UTC_INSTANT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\dZ$/;
const VERSION_PATTERN = /^[0-9A-Za-z.+-]{1,64}$/;

/* ---------------------------------------------------------------------------------------- paths ---- */

/** The real path of `path`, resolving links of its existing part (the rest may not exist yet). */
function canonical(path: string): string {
  let current = resolve(path);
  const rest: string[] = [];
  for (;;) {
    try {
      return join(realpathSync.native(current), ...rest);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
      const parent = dirname(current);
      if (parent === current) return resolve(path);
      rest.unshift(basename(current));
      current = parent;
    }
  }
}

/** True when `child` is `parent` or lies below it (case-insensitive on Windows through `path.relative`). */
function isInside(child: string, parent: string): boolean {
  const between = relative(parent, child);
  return between === '' || (between !== '..' && !between.startsWith(`..${sep}`) && !isAbsolute(between));
}

interface TargetPlan {
  target: string;
  /** False when the target already existed (it is then empty and is kept on failure). */
  create: boolean;
}

function planTarget(request: RestoreRequest, backup: string): TargetPlan {
  let target: string;
  let dataDir: string;
  let liveDatabase: string;
  try {
    target = canonical(request.toDir);
    dataDir = canonical(request.liveDataDir);
    liveDatabase = canonical(request.liveDatabasePath);
  } catch (error) {
    throw new RestoreError('target_unusable', { cause: error });
  }
  if (isInside(target, dataDir)) throw new RestoreError('target_inside_data_dir');
  if (isInside(dataDir, target) || isInside(liveDatabase, target)) throw new RestoreError('target_is_live');
  if (isInside(target, backup)) throw new RestoreError('target_inside_backup');
  if (!existsSync(target)) return { target, create: true };
  try {
    if (!statSync(target).isDirectory()) throw new RestoreError('target_unusable');
    if (readdirSync(target).length > 0) throw new RestoreError('target_not_empty');
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError('target_unusable', { cause: error });
  }
  return { target, create: false };
}

/* ------------------------------------------------------------------------------------- manifest ---- */

function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => keyPaths(item, `${prefix}[]`));
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return [path, ...keyPaths(child, path)];
  });
}

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

function isManifestFile(value: unknown): value is ManifestFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Record<string, unknown>;
  return (
    typeof file.storage_key === 'string' &&
    isStorageKey(file.storage_key) &&
    (file.kind === 'signature' || file.kind === 'pdf') &&
    typeof file.sha256 === 'string' &&
    SHA256.test(file.sha256) &&
    isCount(file.size_bytes)
  );
}

/** Parses a manifest: exact key paths (WP4-T05 allowlist), types, values and a unique sorted file list. */
export function parseManifest(text: string): BackupManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new RestoreError('manifest_invalid', { cause: error });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new RestoreError('manifest_invalid');
  const paths = new Set(keyPaths(parsed));
  const allowed = new Set(MANIFEST_KEY_PATHS);
  for (const path of paths) if (!allowed.has(path)) throw new RestoreError('manifest_invalid');
  const manifest = parsed as Record<string, unknown>;
  const integrity = manifest.integrity as Record<string, unknown> | undefined;
  const database = manifest.database as Record<string, unknown> | undefined;
  const files = manifest.files;
  const valid =
    manifest.format === MANIFEST_FORMAT &&
    manifest.format_version === MANIFEST_FORMAT_VERSION &&
    typeof manifest.app_version === 'string' &&
    VERSION_PATTERN.test(manifest.app_version) &&
    isCount(manifest.schema_version) &&
    manifest.schema_version >= 1 &&
    typeof manifest.created_at === 'string' &&
    UTC_INSTANT.test(manifest.created_at) &&
    typeof integrity === 'object' &&
    integrity !== null &&
    integrity.integrity_check === 'ok' &&
    integrity.foreign_key_violations === 0 &&
    typeof database === 'object' &&
    database !== null &&
    database.name === BACKUP_DATABASE_NAME &&
    typeof database.sha256 === 'string' &&
    SHA256.test(database.sha256) &&
    isCount(database.size_bytes) &&
    Array.isArray(files) &&
    files.every(isManifestFile) &&
    integrity.files_verified === files.length;
  if (!valid) throw new RestoreError('manifest_invalid');
  const keys = (files as ManifestFile[]).map((file) => file.storage_key);
  if (new Set(keys).size !== keys.length) throw new RestoreError('manifest_invalid');
  return parsed as BackupManifest;
}

function readManifest(backup: string): BackupManifest {
  const path = join(backup, MANIFEST_FILE_NAME);
  let text: string;
  try {
    if (statSync(path).size > MAX_MANIFEST_BYTES) throw new RestoreError('manifest_invalid');
    text = readFileSync(path, 'utf8');
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError('backup_unreadable', { cause: error });
  }
  return parseManifest(text);
}

/* -------------------------------------------------------------------------------------- hashing ---- */

async function hashFile(path: string): Promise<{ sha256: string; sizeBytes: number }> {
  const hash = createHash('sha256');
  let sizeBytes = 0;
  for await (const chunk of createReadStream(path)) {
    const bytes = chunk as Buffer;
    hash.update(bytes);
    sizeBytes += bytes.length;
  }
  return { sha256: hash.digest('hex'), sizeBytes };
}

/** Hashes `path` and compares it with the expected SHA-256 and size; `missing` when the file does not exist. */
async function verifyFile(
  path: string,
  expected: { sha256: string; size_bytes: number },
  codes: { missing: RestoreFaultCode; size: RestoreFaultCode; hash: RestoreFaultCode },
): Promise<void> {
  let actual: { sha256: string; sizeBytes: number };
  try {
    if (!statSync(path).isFile()) throw new RestoreError(codes.missing);
    actual = await hashFile(path);
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError(codes.missing, { cause: error });
  }
  if (actual.sizeBytes !== expected.size_bytes) throw new RestoreError(codes.size);
  if (actual.sha256 !== expected.sha256) throw new RestoreError(codes.hash);
}

const DATABASE_CODES = { missing: 'backup_unreadable', size: 'database_hash_mismatch', hash: 'database_hash_mismatch' } as const;
const FILE_CODES = { missing: 'file_missing', size: 'file_size_mismatch', hash: 'file_hash_mismatch' } as const;

function fsyncFile(path: string): void {
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/* ------------------------------------------------------------------------------ reconciliation ---- */

/** The schema version that introduced the outbound pause (found by its migration name, not pinned). */
const OUTBOUND_PAUSE_SCHEMA_VERSION = MIGRATIONS.find((migration) => migration.name === 'outbound_pause')?.version ?? 0;

/** True when a database at `schemaVersion` has the outbound pause columns and the matching attempt state flow. */
export const schemaHasOutboundPause = (schemaVersion: number): boolean => OUTBOUND_PAUSE_SCHEMA_VERSION > 0 && schemaVersion >= OUTBOUND_PAUSE_SCHEMA_VERSION;

/** The counts of getOutboundStatus that do not need the pause columns (a schema older than the pause has none). */
function outboundCountsWithoutPause(db: Db): OutboundCounts {
  const kindList = OUTBOUND_JOB_KINDS.map(() => '?').join(', ');
  const jobs = (state: string, extra: string, ...params: string[]): number =>
    Number(db.prepare(`SELECT count(*) FROM jobs WHERE kind IN (${kindList}) AND state = '${state}'${extra}`).pluck().get(...OUTBOUND_JOB_KINDS, ...params));
  return {
    awaitingDecision: Number(db.prepare("SELECT count(*) FROM delivery_attempts WHERE state = 'uncertain' AND decision IS NULL").pluck().get()),
    queuedSendJobs: jobs('queued', ''),
    heldSendJobs: jobs('intervention', ' AND last_error = ?', RECONCILE_AFTER_RESTORE),
  };
}

/**
 * Sets the outbound pause and marks what a restored copy cannot know the outcome of (see the module comment, step 5).
 * One IMMEDIATE transaction; audited as a system event with counts only.
 */
export function reconcileRestoredCopy(db: Db, clock: Clock, backup: { createdAt: string; schemaVersion: number }): RestoreReconciliation {
  // A schema older than the pause (rollback mode, never migrated) has no pause columns and no preparing -> uncertain
  // transition. The copy's own version decides: a default restore has been migrated before it gets here.
  const pauseSupported = schemaHasOutboundPause(Number(db.prepare('SELECT coalesce(max(version), 0) FROM schema_migrations').pluck().get()));
  return writeTransaction(db, (): RestoreReconciliation => {
    const now = nowUtc(clock);
    const before = pauseSupported ? getOutboundPause(db) : null;
    const open = db
      .prepare<[], { id: string; job_id: string; state: 'preparing' | 'sending' }>(
        `SELECT id, job_id, state FROM delivery_attempts WHERE state IN (${pauseSupported ? "'preparing', 'sending'" : "'sending'"}) ORDER BY started_at, id`,
      )
      .all();
    const markAttempt = db.prepare("UPDATE delivery_attempts SET state = 'uncertain', provider_response = ?, updated_at = ? WHERE id = ? AND state = ?");
    let attemptsMarkedUncertain = 0;
    for (const attempt of open) attemptsMarkedUncertain += markAttempt.run(RECONCILE_AFTER_RESTORE, now, attempt.id, attempt.state).changes;

    const kindList = OUTBOUND_JOB_KINDS.map(() => '?').join(', ');
    const holdJob = db.prepare(
      `UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = ?, updated_at = ?
        WHERE id = ? AND state IN ('queued', 'leased')`,
    );
    // Every queued or leased outbound job of the backup, which includes the jobs of the attempts marked above (on a
    // schema without the pause, a `preparing` attempt keeps its state while its job is held below).
    const toHold = new Set<string>(open.map((attempt) => attempt.job_id));
    for (const job of db
      .prepare<string[], { id: string }>(`SELECT id FROM jobs WHERE state IN ('queued', 'leased') AND kind IN (${kindList})`)
      .all(...OUTBOUND_JOB_KINDS)) {
      toHold.add(job.id);
    }
    let sendJobsHeld = 0;
    for (const jobId of [...toHold].sort()) sendJobsHeld += holdJob.run(RECONCILE_AFTER_RESTORE, now, jobId).changes;

    if (pauseSupported) {
      db.prepare('UPDATE operations_state SET outbound_paused_at = ?, outbound_paused_reason = ? WHERE id = 1').run(now, PAUSE_REASON_RESTORED);
    }
    recordAudit(db, clock, {
      actorUserId: null,
      ownerUserId: null,
      operation: 'operations.restore',
      entityType: 'operations_state',
      entityId: '1',
      before: { outbound_paused_at: before?.pausedAt ?? null, outbound_paused_reason: before?.reason ?? null },
      after: {
        outbound_paused_at: pauseSupported ? now : null,
        outbound_paused_reason: pauseSupported ? PAUSE_REASON_RESTORED : null,
        outbound_pause_supported: pauseSupported,
        backup_created_at: backup.createdAt,
        backup_schema_version: backup.schemaVersion,
        attempts_marked_uncertain: attemptsMarkedUncertain,
        send_jobs_held: sendJobsHeld,
      },
    });
    return { attemptsMarkedUncertain, sendJobsHeld };
  });
}

export type ResumeOutcome = 'resumed' | 'not_paused' | 'refused';

export interface ResumeResult extends OutboundCounts {
  outcome: ResumeOutcome;
}

/**
 * Clears the outbound pause when no delivery attempt awaits its decision (`refused` otherwise; `not_paused` when there
 * is no pause). One IMMEDIATE transaction, audited as a system event with counts only.
 */
export function resumeOutbound(db: Db, clock: Clock): ResumeResult {
  return writeTransaction(db, (): ResumeResult => {
    const status = getOutboundStatus(db);
    const counts: OutboundCounts = { awaitingDecision: status.awaitingDecision, queuedSendJobs: status.queuedSendJobs, heldSendJobs: status.heldSendJobs };
    if (status.pausedAt === null) return { outcome: 'not_paused', ...counts };
    if (counts.awaitingDecision > 0) return { outcome: 'refused', ...counts };
    db.prepare('UPDATE operations_state SET outbound_paused_at = NULL, outbound_paused_reason = NULL WHERE id = 1').run();
    recordAudit(db, clock, {
      actorUserId: null,
      ownerUserId: null,
      operation: 'operations.outbound_resume',
      entityType: 'operations_state',
      entityId: '1',
      before: { outbound_paused_at: status.pausedAt, outbound_paused_reason: status.reason },
      after: { outbound_paused_at: null, outbound_paused_reason: null, queued_send_jobs: counts.queuedSendJobs, held_send_jobs: counts.heldSendJobs },
    });
    return { outcome: 'resumed', ...counts };
  });
}

/* -------------------------------------------------------------------------------- held jobs ---- */

/** Why a held job cannot be released now (`null`: releasable). */
export type ReleaseBlocker = 'attempt_uncertain' | 'delivery_attempt_open' | 'superseded_by_later_send';
export type ReleaseRefusal = ReleaseBlocker | 'not_held' | 'not_a_reminder';

/** Last error a dropped reminder keeps (a lowercase code, like every stored job error). */
export const DROPPED_AFTER_RESTORE = 'dropped_after_restore';

export interface HeldJob {
  id: string;
  kind: string;
  attempts: number;
  createdAt: string;
  blocker: ReleaseBlocker | null;
}

interface HeldRow {
  id: string;
  kind: string;
  user_id: string | null;
  revision_id: string | null;
  attempts: number;
  created_at: string;
  rowid: number;
}

const HELD_SELECT = `SELECT id, kind, user_id, revision_id, attempts, created_at, rowid FROM jobs
  WHERE state = 'intervention' AND last_error = ? AND kind IN (${OUTBOUND_JOB_KINDS.map(() => '?').join(', ')})`;

function heldRow(db: Db, jobId: string): HeldRow | undefined {
  return db.prepare<string[], HeldRow>(`${HELD_SELECT} AND id = ?`).get(RECONCILE_AFTER_RESTORE, ...OUTBOUND_JOB_KINDS, jobId);
}

/** The AC-08 checks of a release (see the module comment); reminders have no attempt and no blocker. */
function blockerOf(db: Db, job: HeldRow): ReleaseBlocker | null {
  if (job.kind !== JOB_SEND_EMAIL || job.user_id === null) return null;
  const latest = db
    .prepare<[string, string], { state: string }>('SELECT state FROM delivery_attempts WHERE job_id = ? AND user_id = ? ORDER BY attempt_no DESC LIMIT 1')
    .get(job.id, job.user_id);
  if (latest?.state === 'uncertain') return 'attempt_uncertain';
  if (job.revision_id === null) return null;
  const open = db
    .prepare<[string, string, string], { one: number }>(
      `SELECT 1 AS one FROM delivery_attempts WHERE revision_id = ? AND user_id = ? AND job_id <> ?
         AND (state IN ('preparing', 'sending') OR (state = 'uncertain' AND decision IS NULL)) LIMIT 1`,
    )
    .get(job.revision_id, job.user_id, job.id);
  if (open !== undefined) return 'delivery_attempt_open';
  const later = db
    .prepare<[string, string, string, number], { one: number }>(
      `SELECT 1 AS one FROM jobs WHERE revision_id = ? AND user_id = ? AND kind = ? AND rowid > ? AND state IN ('queued', 'leased', 'succeeded') LIMIT 1`,
    )
    .get(job.revision_id, job.user_id, job.kind, job.rowid);
  return later === undefined ? null : 'superseded_by_later_send';
}

/** Every job a restore holds, oldest first, with what blocks its release. Ids and kinds only; writes nothing. */
export function listHeldJobs(db: Db): HeldJob[] {
  return db
    .prepare<string[], HeldRow>(`${HELD_SELECT} ORDER BY created_at, rowid`)
    .all(RECONCILE_AFTER_RESTORE, ...OUTBOUND_JOB_KINDS)
    .map((row) => ({ id: row.id, kind: row.kind, attempts: row.attempts, createdAt: row.created_at, blocker: blockerOf(db, row) }));
}

function auditHeld(db: Db, clock: Clock, operation: 'operations.held_job_release' | 'operations.held_job_drop', job: HeldRow, state: string): void {
  recordAudit(db, clock, {
    actorUserId: null,
    ownerUserId: null,
    operation,
    entityType: 'job',
    entityId: job.id,
    before: { state: 'intervention', last_error: RECONCILE_AFTER_RESTORE },
    after: { state, kind: job.kind, attempts: job.attempts },
  });
}

/** Releases one held job back to the queue, inside the caller's transaction. */
function releaseRow(db: Db, clock: Clock, job: HeldRow): void {
  const now = nowUtc(clock);
  const changed = db
    .prepare(
      `UPDATE jobs SET state = 'queued', next_run_at = ?, last_error = NULL, updated_at = ?
        WHERE id = ? AND state = 'intervention' AND last_error = ?`,
    )
    .run(now, now, job.id, RECONCILE_AFTER_RESTORE).changes;
  if (changed !== 1) throw new Error('The held job changed during its release');
  auditHeld(db, clock, 'operations.held_job_release', job, 'queued');
}

export type ReleaseResult = { outcome: 'released' } | { outcome: 'refused'; code: ReleaseRefusal };

/** Releases one held job (by id) after the operator's reconciliation; audited. */
export function releaseHeldJob(db: Db, clock: Clock, jobId: string): ReleaseResult {
  return writeTransaction(db, (): ReleaseResult => {
    const job = heldRow(db, jobId);
    if (job === undefined) return { outcome: 'refused', code: 'not_held' };
    const blocker = blockerOf(db, job);
    if (blocker !== null) return { outcome: 'refused', code: blocker };
    releaseRow(db, clock, job);
    return { outcome: 'released' };
  });
}

export interface BulkReleaseResult {
  released: number;
  /** Held jobs left in place, by blocker. */
  refused: Partial<Record<ReleaseBlocker, number>>;
}

/** Releases every releasable held job (one transaction; each release audited); the blocked ones stay held. */
export function releaseAllHeldJobs(db: Db, clock: Clock): BulkReleaseResult {
  return writeTransaction(db, (): BulkReleaseResult => {
    const result: BulkReleaseResult = { released: 0, refused: {} };
    for (const job of db.prepare<string[], HeldRow>(`${HELD_SELECT} ORDER BY created_at, rowid`).all(RECONCILE_AFTER_RESTORE, ...OUTBOUND_JOB_KINDS)) {
      const blocker = blockerOf(db, job);
      if (blocker === null) {
        releaseRow(db, clock, job);
        result.released += 1;
      } else {
        result.refused[blocker] = (result.refused[blocker] ?? 0) + 1;
      }
    }
    return result;
  });
}

export type DropResult = { outcome: 'dropped' } | { outcome: 'refused'; code: 'not_held' | 'not_a_reminder' };

/** Cancels one held reminder instead of releasing it (it is never sent); audited. Send jobs cannot be dropped. */
export function dropHeldReminder(db: Db, clock: Clock, jobId: string): DropResult {
  return writeTransaction(db, (): DropResult => {
    const job = heldRow(db, jobId);
    if (job === undefined) return { outcome: 'refused', code: 'not_held' };
    if (job.kind !== JOB_SEND_REMINDER) return { outcome: 'refused', code: 'not_a_reminder' };
    const now = nowUtc(clock);
    db.prepare(
      `UPDATE jobs SET state = 'cancelled', last_error = ?, updated_at = ? WHERE id = ? AND state = 'intervention' AND last_error = ?`,
    ).run(DROPPED_AFTER_RESTORE, now, job.id, RECONCILE_AFTER_RESTORE);
    auditHeld(db, clock, 'operations.held_job_drop', job, 'cancelled');
    return { outcome: 'dropped' };
  });
}

/** The `outbound release` preview: counts by blocker and the held jobs (id, kind, attempts, blocker only). */
export function heldJobsJson(jobs: readonly HeldJob[]) {
  const blocked: Partial<Record<ReleaseBlocker, number>> = {};
  for (const job of jobs) if (job.blocker !== null) blocked[job.blocker] = (blocked[job.blocker] ?? 0) + 1;
  return {
    held: jobs.length,
    releasable: jobs.filter((job) => job.blocker === null).length,
    blocked,
    jobs: jobs.map((job) => ({ id: job.id, kind: job.kind, attempts: job.attempts, created_at: job.createdAt, blocker: job.blocker })),
  };
}

export function resumeJson(result: ResumeResult) {
  return {
    outcome: result.outcome,
    awaiting_decision: result.awaitingDecision,
    queued_send_jobs: result.queuedSendJobs,
    held_send_jobs: result.heldSendJobs,
  };
}

/* ------------------------------------------------------------------------------------- restore ---- */

/** Checks the copied database before anything is migrated or written to it (step 4). */
function inspectCopy(path: string, manifest: BackupManifest): void {
  let copy: Database.Database | undefined;
  try {
    copy = new Database(path, { fileMustExist: true });
    const integrity = copy.pragma('integrity_check') as Array<{ integrity_check: string }>;
    if (integrity.length !== 1 || integrity[0]?.integrity_check !== 'ok') throw new RestoreError('integrity_check_failed');
    if ((copy.pragma('foreign_key_check') as unknown[]).length > 0) throw new RestoreError('foreign_key_violation');
    const version = Number(copy.prepare('SELECT coalesce(max(version), 0) FROM schema_migrations').pluck().get());
    if (version > MIGRATIONS.length) throw new RestoreError('schema_newer');
    if (version !== manifest.schema_version) throw new RestoreError('schema_mismatch');
    const rows = copy.prepare<[], ManifestFile>('SELECT storage_key, kind, sha256, size_bytes FROM attachments ORDER BY storage_key').all();
    const listed = [...manifest.files].sort((a, b) => (a.storage_key < b.storage_key ? -1 : a.storage_key > b.storage_key ? 1 : 0));
    const same =
      rows.length === listed.length &&
      rows.every((row, index) => {
        const file = listed[index];
        return file !== undefined && row.storage_key === file.storage_key && row.kind === file.kind && row.sha256 === file.sha256 && row.size_bytes === file.size_bytes;
      });
    if (!same) throw new RestoreError('attachments_mismatch');
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError('integrity_check_failed', { cause: error });
  } finally {
    copy?.close();
  }
}

/** Removes exactly what a failed attempt created: its files, then its (now empty) folders, newest first. */
function removeCreated(files: readonly string[], folders: readonly string[]): void {
  for (const path of [...files].reverse()) {
    try {
      unlinkSync(path);
    } catch {
      // never created or already gone
    }
  }
  for (const folder of [...folders].reverse()) {
    try {
      rmdirSync(folder);
    } catch {
      // never created, or not empty because something else wrote there: left for the operator
    }
  }
}

function countOf(db: Db, sql: string): number {
  return Number(db.prepare(sql).pluck().get());
}

/** Restores one backup folder into a new isolated instance directory; see the module comment for the guarantees. */
export async function restoreBackup(request: RestoreRequest): Promise<RestoreResult> {
  let backup: string;
  try {
    backup = canonical(request.fromDir);
  } catch (error) {
    throw new RestoreError('backup_unreadable', { cause: error });
  }
  const plan = planTarget(request, backup);

  // 2. Verify the backup in place (read only).
  const manifest = readManifest(backup);
  if (manifest.schema_version > MIGRATIONS.length) throw new RestoreError('schema_newer');
  // Rollback mode keeps the schema; without the pause columns that needs the operator's confirmation, before any write.
  const keepSchema = request.keepSchema === true;
  const pauseSupported = !keepSchema || schemaHasOutboundPause(manifest.schema_version);
  if (!pauseSupported && request.confirmUnpaused !== true) throw new RestoreError('unpaused_schema_unconfirmed');
  await verifyFile(join(backup, BACKUP_DATABASE_NAME), manifest.database, DATABASE_CODES);
  for (const file of manifest.files) await verifyFile(join(backup, BACKUP_FILES_DIR, file.storage_key), file, FILE_CODES);

  // 3-5. Copy, check, migrate and reconcile; a failure removes what this attempt created.
  const databasePath = join(plan.target, RESTORED_DATABASE_NAME);
  const dataDir = join(plan.target, RESTORED_DATA_DIR);
  const filesDir = join(dataDir, 'files');
  const createdFolders: string[] = [];
  const createdFiles: string[] = [databasePath, `${databasePath}-wal`, `${databasePath}-shm`, `${databasePath}-journal`];
  let db: Db | undefined;
  try {
    try {
      if (plan.create) {
        mkdirSync(plan.target, { recursive: true, mode: 0o700 });
        createdFolders.push(plan.target);
      }
      if (readdirSync(plan.target).length > 0) throw new RestoreError('target_not_empty');
      for (const folder of [dataDir, filesDir]) {
        mkdirSync(folder, { mode: 0o700 });
        createdFolders.push(folder);
      }
      copyFileSync(join(backup, BACKUP_DATABASE_NAME), databasePath, constants.COPYFILE_EXCL);
    } catch (error) {
      if (error instanceof RestoreError) throw error;
      throw new RestoreError('write_failed', { cause: error });
    }
    await verifyFile(databasePath, manifest.database, DATABASE_CODES);
    for (const file of manifest.files) {
      const destination = join(filesDir, file.storage_key);
      try {
        copyFileSync(join(backup, BACKUP_FILES_DIR, file.storage_key), destination, constants.COPYFILE_EXCL);
      } catch (error) {
        throw new RestoreError('write_failed', { cause: error });
      }
      createdFiles.push(destination);
      await verifyFile(destination, file, FILE_CODES);
      fsyncFile(destination);
    }

    inspectCopy(databasePath, manifest);
    db = openDatabase(databasePath);
    let applied: number[] = [];
    if (!keepSchema) {
      try {
        applied = migrate(db, MIGRATIONS, request.clock.now()).applied;
      } catch (error) {
        throw new RestoreError('schema_mismatch', { cause: error });
      }
    }
    const reconciliation = reconcileRestoredCopy(db, request.clock, { createdAt: manifest.created_at, schemaVersion: manifest.schema_version });
    if (db.pragma('integrity_check', { simple: true }) !== 'ok') throw new RestoreError('integrity_check_failed');
    if ((db.pragma('foreign_key_check') as unknown[]).length > 0) throw new RestoreError('foreign_key_violation');
    const pause = pauseSupported ? getOutboundPause(db) : null;
    if (pauseSupported && pause === null) throw new RestoreError('write_failed');
    const status = pauseSupported ? getOutboundStatus(db) : outboundCountsWithoutPause(db);
    const result: RestoreResult = {
      databasePath,
      dataDir,
      manifest,
      schema: { backup: manifest.schema_version, restored: Number(db.prepare('SELECT max(version) FROM schema_migrations').pluck().get()), applied },
      pause,
      reconciliation,
      outbound: { awaitingDecision: status.awaitingDecision, queuedSendJobs: status.queuedSendJobs, heldSendJobs: status.heldSendJobs },
      counts: {
        users: countOf(db, 'SELECT count(*) FROM users'),
        revisions: countOf(db, 'SELECT count(*) FROM timesheet_revisions'),
        ledgerEntries: countOf(db, 'SELECT count(*) FROM ot_ledger'),
        attachments: countOf(db, 'SELECT count(*) FROM attachments'),
      },
    };
    db.close();
    db = undefined;
    fsyncFile(databasePath);
    return result;
  } catch (error) {
    db?.close();
    removeCreated(createdFiles, createdFolders);
    throw error instanceof RestoreError ? error : new RestoreError('write_failed', { cause: error });
  }
}

/** What `cli.js restore` prints: counts and the manifest check only (no path, key, hash, name or address). */
export function restoreSummaryJson(result: RestoreResult) {
  return {
    outcome: 'restored' as const,
    manifest: { verified: true as const, ...manifestSummary(result.manifest) },
    schema: { backup: result.schema.backup, restored: result.schema.restored, applied: result.schema.applied },
    outbound: { paused: result.pause !== null, reason: result.pause?.reason ?? null },
    reconciliation: {
      attempts_marked_uncertain: result.reconciliation.attemptsMarkedUncertain,
      send_jobs_held: result.reconciliation.sendJobsHeld,
      queued_send_jobs: result.outbound.queuedSendJobs,
      awaiting_decision: result.outbound.awaitingDecision,
    },
    counts: {
      users: result.counts.users,
      revisions: result.counts.revisions,
      ledger_entries: result.counts.ledgerEntries,
      attachments: result.counts.attachments,
    },
  };
}
