import { formatUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { OutboundAdapter } from '../mail/outbound.ts';
import { getAutomationActivation } from '../services/automation.ts';
import { buildReminderMessage, JOB_SEND_REMINDER, prepareReminder, runReminderScan } from '../services/notifications.ts';
import { enqueueJob, type Job, JobError } from './jobStore.ts';
import type { JobHandler } from './runner.ts';

/*
 * The reminder jobs (docs/05 "Reminders and review links", WP3-T11).
 *
 * - `reminder_scan`: the runner enqueues one scan job per five-minute bucket (the business key makes
 *   that idempotent, also across several runners), and only while the system activation instant is
 *   set (F-4): before the owner's pilot no row is written at all. The handler runs the scan in
 *   bounded batches outside any runner transaction. Reminders are advisory, so a five-minute
 *   bucket is precise enough and keeps the retained job rows to a tenth of a per-minute scan.
 * - `send_reminder`: one job per decided notice. It rebuilds the notice at send time, sends it
 *   through the same outbound adapters as submissions (capture by default) to the employee's own
 *   address only, and classifies the adapter outcome: accepted ends the job; a temporary failure
 *   retries through the job store; a permanent failure or an uncertain outcome needs visible
 *   intervention and is never resent automatically. The capture folder is keyed by the job id, so
 *   a job that runs again after a crash finds its message already captured and counts as sent.
 */

export { JOB_SEND_REMINDER };

export const JOB_REMINDER_SCAN = 'reminder_scan';

/** The scan bucket width; a scan job exists once per bucket. */
export const REMINDER_SCAN_INTERVAL_MINUTES = 5;

/** Batches handled by one scan job. */
export const MAX_REMINDER_BATCHES_PER_JOB = 8;

/** Enqueues this bucket's scan job when automation is activated; returns null (writing nothing) otherwise. */
export function enqueueReminderScan(db: Db, clock: Clock): { job: Job; created: boolean } | null {
  if (getAutomationActivation(db).activeFrom === null) return null;
  const width = REMINDER_SCAN_INTERVAL_MINUTES * 60;
  const bucket = formatUtcInstant(Math.floor(nowEpoch(clock) / width) * width);
  return enqueueJob(db, clock, { kind: JOB_REMINDER_SCAN, businessKey: `${JOB_REMINDER_SCAN}:${bucket}` });
}

export interface ReminderScanDeps {
  db: Db;
  clock: Clock;
  /** Notices decided per batch; defaults to the service's bound. */
  batchSize?: number;
}

export function createReminderScanHandler(deps: ReminderScanDeps): JobHandler {
  const { db, clock } = deps;
  return async ({ renewLease }) => {
    for (let batch = 0; batch < MAX_REMINDER_BATCHES_PER_JOB; batch += 1) {
      const summary = runReminderScan(db, clock, deps.batchSize === undefined ? {} : { batchSize: deps.batchSize });
      if (!summary.remaining) return;
      renewLease();
    }
  };
}

export interface SendReminderDeps {
  db: Db;
  clock: Clock;
  outbound: OutboundAdapter;
  /** MAIL_FROM; null blocks every notice with the visible fault `sender_missing`. */
  senderAddress: string | null;
  /** Origin plus optional path prefix of the deep links (config `publicBaseUrl`). */
  publicBaseUrl: string;
}

export function createSendReminderHandler(deps: SendReminderDeps): JobHandler {
  const { db, clock, outbound } = deps;
  return async ({ job }) => {
    const notice = prepareReminder(db, clock, job, deps.publicBaseUrl);
    // No longer relevant (finalized, deadline passed, review done, account or automation off): nothing is sent.
    if (notice === null) return;
    const message = await buildReminderMessage({ senderAddress: deps.senderAddress, jobId: job.id, date: clock.now(), notice });
    let outcome;
    try {
      outcome = await outbound.send(message, { attemptId: job.id });
    } catch {
      // Adapters classify their own failures; an unexpected throw may come after the transfer began.
      throw new JobError('delivery_uncertain', { permanent: true });
    }
    if (outcome.kind === 'accepted') return;
    // The capture adapter writes a folder atomically: an existing one means this very job was captured before.
    if (outcome.kind === 'uncertain' && outcome.code === 'capture_exists') return;
    if (outcome.kind === 'failed_temporary') throw new JobError(outcome.code);
    if (outcome.kind === 'failed_permanent') throw new JobError(outcome.code, { permanent: true });
    throw new JobError('delivery_uncertain', { permanent: true });
  };
}
