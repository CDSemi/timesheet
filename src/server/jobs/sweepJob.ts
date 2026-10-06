import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { enqueueJob, type Job } from './jobStore.ts';
import type { JobHandler } from './runner.ts';

/*
 * The daily orphan sweep (WP4-T07, WP3 carry item 4). `FileStore.sweep` removes what no database row needs: abandoned
 * temporary files, and finished objects no `attachments` row refers to (a crash between the file write and the row,
 * a rolled-back upload). This job schedules it.
 *
 * - The runner enqueues one job per UTC day (`orphan_sweep:<YYYY-MM-DD>`); the unique business key makes that
 *   idempotent across passes and runners, and a closed job is never run again, so a day's sweep runs once.
 * - A file is removed only when no attachments row refers to its storage key AND it is older than the grace
 *   (`ORPHAN_GRACE_MS`, one day: a write in flight, or a PDF whose row is about to be recorded, is never touched). A referenced
 *   file is never removed, whatever its age; the reference check here is the safety rule the tests pin by mutation.
 * - The job only reads the database. It reports three counts and nothing else (no key, path, name or owner), through
 *   `onResult`; its payload is empty and its error is the redacted code the runner stores for any job.
 * - It is not an outbound job, so the outbound pause never holds it back; only stopping the runner does.
 */

export const JOB_ORPHAN_SWEEP = 'orphan_sweep';

/** How long an unreferenced file or a temporary file must have been untouched before it is removed. */
export const ORPHAN_GRACE_MS = 24 * 3600 * 1000;

/** What one sweep did, as counts only. */
export interface OrphanSweepCounts {
  removedTemporary: number;
  removedUnreferenced: number;
  keptReferenced: number;
}

/** Enqueues today's (UTC) sweep job; the same day yields the same job and creates nothing. */
export function enqueueOrphanSweep(db: Db, clock: Clock): { job: Job; created: boolean } {
  const day = nowUtc(clock).slice(0, 10);
  return enqueueJob(db, clock, { kind: JOB_ORPHAN_SWEEP, businessKey: `${JOB_ORPHAN_SWEEP}:${day}` });
}

export interface SweepJobDeps {
  db: Db;
  clock: Clock;
  files: FileStore;
  /** Receives the counts of each sweep; the production wiring prints them as one line. */
  onResult?: (counts: OrphanSweepCounts) => void;
}

/** One line for the server log: the three counts, never a name. */
export function sweepLine(counts: OrphanSweepCounts): string {
  return `Orphan sweep: removed_temporary=${counts.removedTemporary} removed_unreferenced=${counts.removedUnreferenced} kept_referenced=${counts.keptReferenced}`;
}

export function createSweepJobHandler(deps: SweepJobDeps): JobHandler {
  const { db, clock, files } = deps;
  // A stored workbook import source (WP4-T09, `imports.storage_key`) is referenced exactly like an attachment.
  const referenced = db.prepare<[string, string], { found: number }>(
    'SELECT 1 AS found FROM attachments WHERE storage_key = ? UNION ALL SELECT 1 FROM imports WHERE storage_key = ?',
  );
  return () => {
    const counts = files.sweep({
      isReferenced: (storageKey) => referenced.get(storageKey, storageKey) !== undefined,
      minAgeMs: ORPHAN_GRACE_MS,
      now: clock.now(),
    });
    deps.onResult?.({
      removedTemporary: counts.removedTemporary,
      removedUnreferenced: counts.removedUnreferenced,
      keptReferenced: counts.keptReferenced,
    });
    return Promise.resolve();
  };
}
