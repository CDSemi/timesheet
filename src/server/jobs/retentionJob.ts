import { formatUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { JOB_DEADLINE_SCAN } from './deadlineJob.ts';
import { enqueueJob, type Job } from './jobStore.ts';
import { JOB_REMINDER_SCAN } from './reminderJob.ts';
import type { JobHandler } from './runner.ts';

/*
 * The daily job-row retention (owner decision F-4 (a), WP4-T07B, migration 0011; docs/03 "Imports, opening balance and
 * retention"). The deadline and reminder scans each leave a job row per run, and nothing reads a succeeded scan row
 * afterwards. This job deletes exactly those rows and nothing else.
 *
 * - Eligible: a `deadline_scan` or `reminder_scan` job in state `succeeded` that finished (`updated_at`) MORE than 30
 *   days before the injected clock's now, and that no `delivery_attempts` or `reminder_occurrences` row refers to.
 *   Delivery, PDF, send, sweep and retention jobs, failed or queued scans and every referenced row are never touched.
 * - The guard is the `jobs_no_delete` trigger itself (migration 0011): it refuses every other DELETE, and it allows an
 *   eligible row only while `job_retention_window.as_of` holds an instant. This job sets that instant to the injected
 *   clock's now inside each delete transaction and clears it in the same transaction, so a rolled-back chunk leaves
 *   the window closed. The 30 days are in the trigger, not here, so this code cannot widen them; the `WHERE` below
 *   mirrors the trigger only to skip rows the trigger would refuse (a referenced row must not abort a whole batch).
 * - The runner enqueues one job per UTC day (`job_retention:<YYYY-MM-DD>`); the unique business key makes that
 *   idempotent across passes and runners, and a closed job is never run again, so a day's retention runs once. The next
 *   day's run takes whatever became eligible since. It is not an outbound job, so the outbound pause never holds it back.
 * - It deletes in bounded chunks, each its own short transaction, renewing its lease between chunks.
 * - It reports and records counts only (when it ran, how many rows it deleted): never a key, id or user.
 */

export const JOB_RETENTION = 'job_retention';

/** A scan job row is kept until it finished more than this many days ago (the trigger holds the same constant). */
export const RETENTION_DAYS = 30;

/** Job kinds the retention may delete; the migration 0011 trigger names the same two. */
export const RETENTION_KINDS: readonly string[] = Object.freeze([JOB_DEADLINE_SCAN, JOB_REMINDER_SCAN]);

/** Rows deleted per transaction. */
export const RETENTION_CHUNK = 1000;

/** What one retention run did, as counts only. */
export interface RetentionCounts {
  deletedScanJobs: number;
}

/** Enqueues today's (UTC) retention job; the same day yields the same job and creates nothing. */
export function enqueueJobRetention(db: Db, clock: Clock): { job: Job; created: boolean } {
  const day = nowUtc(clock).slice(0, 10);
  return enqueueJob(db, clock, { kind: JOB_RETENTION, businessKey: `${JOB_RETENTION}:${day}` });
}

/** One line for the server log: the count, never an identifier. */
export function retentionLine(counts: RetentionCounts): string {
  return `Job retention: deleted_scan_jobs=${counts.deletedScanJobs}`;
}

/**
 * Deletes the eligible rows in chunks and records the counts on the operations row. The cut-off comes from the injected
 * clock only. Returns the number of rows deleted.
 */
export function deleteExpiredScanJobs(db: Db, clock: Clock, renewLease: () => boolean = () => true): number {
  const now = formatUtcInstant(nowEpoch(clock));
  const cutoff = formatUtcInstant(nowEpoch(clock) - RETENTION_DAYS * 24 * 3600);
  const kindList = RETENTION_KINDS.map(() => '?').join(', ');
  const openWindow = db.prepare('UPDATE job_retention_window SET as_of = ? WHERE id = 1');
  const closeWindow = db.prepare('UPDATE job_retention_window SET as_of = NULL WHERE id = 1');
  const deleteChunk = db.prepare(
    `DELETE FROM jobs WHERE id IN (
       SELECT j.id FROM jobs j
        WHERE j.kind IN (${kindList}) AND j.state = 'succeeded' AND j.updated_at < ?
          AND NOT EXISTS (SELECT 1 FROM delivery_attempts a WHERE a.job_id = j.id)
          AND NOT EXISTS (SELECT 1 FROM reminder_occurrences o WHERE o.job_id = j.id)
        LIMIT ?)`,
  );
  let deleted = 0;
  for (;;) {
    const removed = writeTransaction(db, () => {
      openWindow.run(now);
      const { changes } = deleteChunk.run(...RETENTION_KINDS, cutoff, RETENTION_CHUNK);
      closeWindow.run();
      return changes;
    });
    deleted += removed;
    if (removed < RETENTION_CHUNK) break;
    renewLease();
  }
  db.prepare('UPDATE operations_state SET job_retention_last_run_at = ?, job_retention_last_deleted = ? WHERE id = 1').run(now, deleted);
  return deleted;
}

export interface RetentionJobDeps {
  db: Db;
  clock: Clock;
  /** Receives the counts of each run; the production wiring prints them as one line when something was deleted. */
  onResult?: (counts: RetentionCounts) => void;
}

export function createRetentionJobHandler(deps: RetentionJobDeps): JobHandler {
  const { db, clock } = deps;
  return ({ renewLease }) => {
    deps.onResult?.({ deletedScanJobs: deleteExpiredScanJobs(db, clock, renewLease) });
    return Promise.resolve();
  };
}
