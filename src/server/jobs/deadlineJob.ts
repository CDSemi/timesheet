import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { getAutomationActivation, runDeadlineScan } from '../services/automation.ts';
import { enqueueJob, type Job } from './jobStore.ts';
import type { JobHandler } from './runner.ts';

/*
 * The deadline job (docs/05 "Deadline and recovery", WP3-T10). The runner enqueues one scan job per
 * UTC minute (the business key makes that idempotent, also across several runners), and only
 * while the system activation instant is set (F-4): before the owner's pilot no row is written
 * at all. The handler runs the scan in bounded batches, oldest deadline first, outside any
 * runner transaction; each period is finalized in its own IMMEDIATE transaction by the service,
 * so a crash or a lease loss at any point leaves every period either fully finalized or untouched
 * and the next scan continues. The PDF and send jobs it enqueues run through the same runner.
 *
 * Recovery after downtime needs no special case: the scan derives every passed deadline from
 * the saved calendar, so the first scan after a restart works through the backlog, at most
 * `MAX_BATCHES_PER_JOB` batches per job (the rest waits for the next minute's job).
 */

export const JOB_DEADLINE_SCAN = 'deadline_scan';

/** Batches handled by one scan job; with the default batch size that is a bounded 200 periods. */
export const MAX_BATCHES_PER_JOB = 8;

/** Enqueues this minute's scan job when automation is activated; returns null (writing nothing) otherwise. */
export function enqueueDeadlineScan(db: Db, clock: Clock): { job: Job; created: boolean } | null {
  if (getAutomationActivation(db).activeFrom === null) return null;
  const minute = nowUtc(clock).slice(0, 16);
  return enqueueJob(db, clock, { kind: JOB_DEADLINE_SCAN, businessKey: `${JOB_DEADLINE_SCAN}:${minute}` });
}

export interface DeadlineJobDeps {
  db: Db;
  clock: Clock;
  /** Periods acted on per batch; defaults to the service's bound. */
  batchSize?: number;
}

export function createDeadlineJobHandler(deps: DeadlineJobDeps): JobHandler {
  const { db, clock } = deps;
  return async ({ renewLease }) => {
    for (let batch = 0; batch < MAX_BATCHES_PER_JOB; batch += 1) {
      const summary = runDeadlineScan(db, clock, deps.batchSize === undefined ? {} : { batchSize: deps.batchSize });
      if (!summary.remaining) return;
      renewLease();
    }
  };
}
