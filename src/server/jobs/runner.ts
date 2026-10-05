import type { Clock } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
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

/*
 * Job runner (docs/03, docs/05 "Durable delivery"). `runJobsOnce` writes the heartbeat, then
 * claims and runs due jobs of the kinds it has handlers for until none is due (or `maxJobs`).
 * Each handler runs outside any database transaction; its lease is renewed while it works.
 * `startJobRunner` is the in-process loop the server entry starts; tests and the run-jobs CLI
 * call `runJobsOnce` directly with an injected clock, so nothing runs in the background there.
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

/** The production handlers: the PDF job now; later job kinds register here. */
export function createJobHandlers(deps: { db: Db; clock: Clock; files: FileStore }): JobHandlers {
  return { [JOB_RENDER_PDF]: createPdfJobHandler(deps) };
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
