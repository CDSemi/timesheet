import type { Clock } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { createOutboundAdapter } from '../mail/outbound.ts';
import { recoverInterruptedSends } from '../services/deliveries.ts';
import type { DeliveryConfig } from '../types.ts';
import { createDeadlineJobHandler, enqueueDeadlineScan, JOB_DEADLINE_SCAN } from './deadlineJob.ts';
import {
  claimNextJob,
  completeJob,
  DEFAULT_LEASE_SECONDS,
  failJob,
  type Job,
  newRunnerInstance,
  recordHeartbeat,
  redactJobError,
  renewLease,
} from './jobStore.ts';
import { createPdfJobHandler, JOB_RENDER_PDF } from './pdfJob.ts';
import { createReminderScanHandler, createSendReminderHandler, enqueueReminderScan, JOB_REMINDER_SCAN, JOB_SEND_REMINDER } from './reminderJob.ts';
import { createRetentionJobHandler, enqueueJobRetention, JOB_RETENTION, type RetentionCounts, retentionLine } from './retentionJob.ts';
import { createSendJobHandler, JOB_SEND_EMAIL } from './sendJob.ts';
import { createSweepJobHandler, enqueueOrphanSweep, JOB_ORPHAN_SWEEP, type OrphanSweepCounts, sweepLine } from './sweepJob.ts';

/*
 * Job runner (docs/03, docs/05 "Durable delivery"). `runJobsOnce` writes the heartbeat, then
 * claims and runs due jobs of the kinds it has handlers for until none is due (or `maxJobs`).
 * Each handler runs outside any database transaction; its lease is renewed while it works.
 * Every pass that owns the send handler first recovers interrupted sends (WP3-B-02): a send whose
 * runner died after `sending` was committed becomes `uncertain` with the owner's decision prompt on
 * every attempt, including the last one, whose expired lease the claim sweep would otherwise move
 * straight to intervention without ever running the handler (the attempt would stay `sending`).
 * `startJobRunner` is the in-process loop the server entry starts; tests and the run-jobs CLI
 * call `runJobsOnce` directly with an injected clock, so nothing runs in the background there.
 * While outbound delivery is paused (WP4-T06, operations_state), the claim (jobStore.ts `claimNextJob`)
 * leaves the outbound kinds out: the pass still renders PDFs and runs the scans, but no send or
 * reminder job is leased, no attempt is spent and nothing reaches the outbound adapter.
 * A pass that owns the sweep handler also enqueues today's orphan sweep (WP4-T07): one job per UTC day, idempotent, not an
 * outbound kind, so the pause never holds it back. Likewise it enqueues today's job-row retention (WP4-T07B, F-4 (a)): one
 * job per UTC day that deletes succeeded scan job rows finished more than 30 days ago, and counts only.
 */

export interface JobContext {
  job: Job;
  /** Extends this runner's lease; false when the lease was lost. */
  renewLease: () => boolean;
}

export type JobHandler = (context: JobContext) => Promise<void>;
export type JobHandlers = Readonly<Record<string, JobHandler>>;

export interface RunnerOptions {
  db: Db;
  clock: Clock;
  handlers: JobHandlers;
  /** Lease owner and heartbeat instance; a fresh opaque id by default. */
  owner?: string;
  leaseSeconds?: number;
  /** Upper bound of jobs handled in one pass. */
  maxJobs?: number;
}

export interface RunSummary {
  claimed: number;
  succeeded: number;
  retried: number;
  intervention: number;
  /** Jobs whose lease moved to another runner before this one finished. */
  lost: number;
}

const DEFAULT_MAX_JOBS = 100;
export const DEFAULT_INTERVAL_MS = 15_000;

/**
 * The production handlers: the PDF job, the send job, the deadline scan, the reminder scan and
 * send jobs the daily orphan sweep and the daily job-row retention (their counts are printed as one line when they removed something); later job kinds register here. The send jobs use the configured outbound mode (capture
 * by default, under the files' private data directory) and the configured sender; reminders link
 * to the configured public base URL.
 */
export function createJobHandlers(deps: {
  db: Db;
  clock: Clock;
  files: FileStore;
  delivery: Pick<DeliveryConfig, 'senderAddress' | 'outbound' | 'publicBaseUrl'>;
  /** Receives the counts of every orphan sweep; by default a sweep that removed something prints one counts-only line. */
  onSweep?: (counts: OrphanSweepCounts) => void;
  /** Receives the counts of every job-row retention run; by default a run that deleted something prints one counts-only line. */
  onRetention?: (counts: RetentionCounts) => void;
}): JobHandlers {
  const { db, clock, files, delivery } = deps;
  const outbound = createOutboundAdapter(delivery.outbound, { dataDir: files.root });
  return {
    [JOB_RENDER_PDF]: createPdfJobHandler({ db, clock, files }),
    [JOB_SEND_EMAIL]: createSendJobHandler({ db, clock, files, outbound, senderAddress: delivery.senderAddress }),
    [JOB_DEADLINE_SCAN]: createDeadlineJobHandler({ db, clock }),
    [JOB_REMINDER_SCAN]: createReminderScanHandler({ db, clock }),
    [JOB_SEND_REMINDER]: createSendReminderHandler({ db, clock, outbound, senderAddress: delivery.senderAddress, publicBaseUrl: delivery.publicBaseUrl }),
    [JOB_RETENTION]: createRetentionJobHandler({
      db,
      clock,
      onResult:
        deps.onRetention ??
        ((counts) => {
          if (counts.deletedScanJobs > 0) console.log(retentionLine(counts));
        }),
    }),
    [JOB_ORPHAN_SWEEP]: createSweepJobHandler({
      db,
      clock,
      files,
      onResult:
        deps.onSweep ??
        ((counts) => {
          if (counts.removedTemporary + counts.removedUnreferenced > 0) console.log(sweepLine(counts));
        }),
    }),
  };
}

/** One pass: heartbeat, then claim and run due jobs until none is due. */
export async function runJobsOnce(options: RunnerOptions): Promise<RunSummary> {
  const { db, clock, handlers } = options;
  const owner = options.owner ?? newRunnerInstance();
  const leaseSeconds = options.leaseSeconds ?? DEFAULT_LEASE_SECONDS;
  const maxJobs = options.maxJobs ?? DEFAULT_MAX_JOBS;
  const kinds = Object.keys(handlers);
  const summary: RunSummary = { claimed: 0, succeeded: 0, retried: 0, intervention: 0, lost: 0 };
  recordHeartbeat(db, clock, owner);
  // This minute's deadline scan (idempotent; nothing at all while the activation instant is null).
  if (kinds.includes(JOB_DEADLINE_SCAN)) enqueueDeadlineScan(db, clock);
  // This bucket's reminder scan (idempotent; nothing at all while the activation instant is null).
  if (kinds.includes(JOB_REMINDER_SCAN)) enqueueReminderScan(db, clock);
  // Today's orphan sweep (idempotent on the UTC day; not gated by the activation instant or the outbound pause).
  if (kinds.includes(JOB_ORPHAN_SWEEP)) enqueueOrphanSweep(db, clock);
  // Today's job-row retention (idempotent on the UTC day; not gated by the activation instant or the outbound pause).
  if (kinds.includes(JOB_RETENTION)) enqueueJobRetention(db, clock);

  // Before the claim sweep below can end the job of a dead runner (docs/05 failure table: uncertain, never resent).
  if (kinds.includes(JOB_SEND_EMAIL)) recoverInterruptedSends(db, clock);

  while (summary.claimed < maxJobs) {
    const job = claimNextJob(db, clock, { owner, kinds, leaseSeconds });
    if (job === null) break;
    summary.claimed += 1;
    const handler = handlers[job.kind];
    const renew = () => renewLease(db, clock, job.id, owner, leaseSeconds);
    // Renew at a third of the lease while the handler works (real time; harmless with a fixed clock).
    const renewal = setInterval(renew, Math.max(1, Math.floor((leaseSeconds * 1000) / 3)));
    renewal.unref();
    try {
      if (handler === undefined) throw new Error('No handler for the claimed job kind');
      await handler({ job, renewLease: renew });
      clearInterval(renewal);
      if (completeJob(db, clock, job.id, owner)) summary.succeeded += 1;
      else summary.lost += 1;
    } catch (error) {
      clearInterval(renewal);
      const outcome = failJob(db, clock, job.id, owner, error);
      if (outcome.state === 'queued') summary.retried += 1;
      else if (outcome.state === 'intervention') summary.intervention += 1;
      else summary.lost += 1;
    }
  }
  return summary;
}

export interface JobRunner {
  /** Stops scheduling and waits for the pass in progress. */
  stop(): Promise<void>;
}

/**
 * The in-process loop: a pass now and then every `intervalMs` (discovery within a minute on a
 * healthy host). A failed pass is reported with a redacted code and the loop continues.
 */
export function startJobRunner(
  options: RunnerOptions & { intervalMs?: number; onError?: (code: string) => void },
): JobRunner {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const owner = options.owner ?? newRunnerInstance();
  const report = options.onError ?? ((code: string) => console.error(`Job runner pass failed: ${code}`));
  let stopped = false;
  let timer: NodeJS.Timeout | null = null;
  let current: Promise<void> = Promise.resolve();

  const tick = (): void => {
    timer = null;
    current = runJobsOnce({ ...options, owner })
      .then(
        () => undefined,
        (error: unknown) => report(redactJobError(error)),
      )
      .finally(() => {
        if (!stopped) {
          timer = setTimeout(tick, intervalMs);
          timer.unref();
        }
      });
  };
  tick();

  return {
    async stop() {
      stopped = true;
      if (timer !== null) clearTimeout(timer);
      timer = null;
      await current;
    },
  };
}
