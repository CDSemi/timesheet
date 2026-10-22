import { createHash, randomUUID } from 'node:crypto';
import { canonicalize, type CanonicalValue } from '../../domain/canonical.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { buildMessage, frozenEnvelope, MessageError, newMessageId, type OutboundMessage, type SendContent } from '../mail/message.ts';
import type { OutboundAdapter, SendOutcome } from '../mail/outbound.ts';
import { readyPdfOf, recoverInterruptedSends, type SendRecord, sendOfJob, UNCERTAIN_LEASE_EXPIRED } from '../services/deliveries.ts';
import { JOB_SEND_EMAIL } from '../services/finalization.ts';
import { type Job, JobError } from './jobStore.ts';
import { loadSnapshot } from './pdfJob.ts';
import type { JobHandler } from './runner.ts';

/*
 * The send job (docs/05 "Durable delivery" and its failure table, AC-08, AC-14).
 *
 * One `send_email` job is one send: its immutable `revision_sends` row (WP5-UX5-T01b) holds the
 * envelope, subject, bodies and PDF variant chosen for that copy. One run of the job:
 * 1. Interrupted sends of any job (a `sending` attempt whose lease expired) become `uncertain`.
 * 2. The send row of this job and its revision are loaded by job owner and ids; the revision's
 *    canonical payload hash is re-checked.
 * 3. This job's latest attempt decides what may happen: `sending` means a previous runner died
 *    during the network call, so the attempt becomes `uncertain` and nothing is sent;
 *    `uncertain`, `failed_permanent` and `accepted` are final for the job (no automatic resend);
 *    `preparing` (a run that stopped before the network) is reused; none or `failed_temporary`
 *    creates the next attempt with a new stable Message-ID and the envelope frozen from the send.
 *    The send's PDF variant must be `ready`; until then the job retries without creating an attempt.
 * 4. The stored PDF bytes are read and their SHA-256 re-checked against the attachment row and
 *    the frozen envelope; the message is built from the send row only (message.ts), never from the
 *    snapshot's envelope or the current settings. A missing sender or recipient or a hash mismatch
 *    fails the attempt permanently with a visible code.
 * 5. `sending` is committed, then the adapter is called outside any transaction, then the
 *    classified outcome is recorded: accepted (provider id and time), failed_temporary (the job
 *    store retries after 1, 5, 15, 60 minutes), failed_permanent or uncertain (intervention; an
 *    uncertain attempt waits for the owner's explicit decision).
 * Every write checks that this runner still holds the job lease. Nothing posts to the ledger.
 */

export { JOB_SEND_EMAIL };

/** Test seams (crash injection); production passes none. */
export interface SendJobHooks {
  /** Runs once the attempt is `preparing` and checked, before `sending` is committed. */
  afterPrepare?: (attemptId: string) => void;
  /** Runs after `sending` is committed and before the adapter is called. */
  beforeSend?: (attemptId: string) => void;
}

export interface SendJobDeps {
  db: Db;
  clock: Clock;
  files: FileStore;
  outbound: OutboundAdapter;
  /** MAIL_FROM; null blocks every send with the visible fault `sender_missing`. */
  senderAddress: string | null;
  hooks?: SendJobHooks;
}

interface RevisionRow {
  id: string;
  user_id: string;
  revision_no: number;
  payload_json: string;
  payload_sha256: string;
}

interface AttemptRow {
  id: string;
  attempt_no: number;
  state: string;
  envelope_json: string;
  attachment_id: string | null;
  message_id: string;
}

interface PdfRow {
  attachment_id: string;
  storage_key: string;
  sha256: string;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

function holdsLease(db: Db, job: Job): boolean {
  return (
    db
      .prepare("SELECT 1 FROM jobs WHERE id = ? AND state = 'leased' AND lease_owner = ?")
      .get(job.id, job.leaseOwner) !== undefined
  );
}

function latestAttempt(db: Db, job: Job, userId: string): AttemptRow | undefined {
  return db
    .prepare<[string, string], AttemptRow>(
      `SELECT id, attempt_no, state, envelope_json, attachment_id, message_id FROM delivery_attempts
        WHERE job_id = ? AND user_id = ? ORDER BY attempt_no DESC LIMIT 1`,
    )
    .get(job.id, userId);
}

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY');

function contentOf(send: SendRecord): SendContent {
  return { sendId: send.id, to: send.to, cc: send.cc, subject: send.subject, bodyText: send.bodyText, bodyHtml: send.bodyHtml };
}

/** The next attempt of this job, `preparing`, with the envelope frozen from the send and a new Message-ID. */
function createAttempt(db: Db, clock: Clock, job: Job, revision: RevisionRow, send: SendRecord, pdf: PdfRow, attemptNo: number): AttemptRow {
  try {
    return writeTransaction(db, (): AttemptRow => {
      if (!holdsLease(db, job)) throw new JobError('lease_lost');
      const now = nowUtc(clock);
      const row: AttemptRow = {
        id: randomUUID(),
        attempt_no: attemptNo,
        state: 'preparing',
        envelope_json: canonicalize(frozenEnvelope(revision.id, contentOf(send), pdf.sha256) as unknown as CanonicalValue),
        attachment_id: pdf.attachment_id,
        message_id: newMessageId(),
      };
      db.prepare(
        `INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, channel, envelope_json, attachment_id,
           message_id, state, started_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'email', ?, ?, ?, 'preparing', ?, ?)`,
      ).run(row.id, job.id, revision.user_id, revision.id, attemptNo, row.envelope_json, row.attachment_id, row.message_id, now, now);
      return row;
    });
  } catch (error) {
    // Another attempt of this revision is still open (one open attempt per revision).
    if (isUniqueViolation(error)) throw new JobError('delivery_attempt_open', { cause: error });
    throw error;
  }
}

function markUncertain(db: Db, clock: Clock, attemptId: string, response: string): void {
  db.prepare(
    `UPDATE delivery_attempts SET state = 'uncertain', provider_response = ?, updated_at = ? WHERE id = ? AND state = 'sending'`,
  ).run(response, nowUtc(clock), attemptId);
}

/** A failure before the network call: the attempt closes with a redacted code. */
function failBeforeSend(db: Db, clock: Clock, attemptId: string, code: string, permanent: boolean): JobError {
  db.prepare(
    `UPDATE delivery_attempts SET state = ?, provider_response = ?, updated_at = ? WHERE id = ? AND state = 'preparing'`,
  ).run(permanent ? 'failed_permanent' : 'failed_temporary', code, nowUtc(clock), attemptId);
  return new JobError(code, { permanent });
}

function markSending(db: Db, clock: Clock, job: Job, attemptId: string): void {
  writeTransaction(db, () => {
    if (!holdsLease(db, job)) throw new JobError('lease_lost');
    const changed = db
      .prepare(`UPDATE delivery_attempts SET state = 'sending', updated_at = ? WHERE id = ? AND state = 'preparing'`)
      .run(nowUtc(clock), attemptId).changes;
    if (changed !== 1) throw new JobError('attempt_not_preparing', { permanent: true });
  });
}

function responseText(code: string, reply: string | null): string {
  return reply === null ? code : `${code} ${reply}`;
}

/** Records the adapter outcome and returns the job error to raise, if any. */
function recordOutcome(db: Db, clock: Clock, attemptId: string, outcome: SendOutcome): JobError | null {
  return writeTransaction(db, (): JobError | null => {
    const now = nowUtc(clock);
    if (outcome.kind === 'accepted') {
      // A late acceptance also settles an attempt another runner already marked uncertain (no decision yet).
      db.prepare(
        `UPDATE delivery_attempts SET state = 'accepted', provider_message_id = ?, provider_response = ?, accepted_at = ?, updated_at = ?
          WHERE id = ? AND (state = 'sending' OR (state = 'uncertain' AND decision IS NULL))`,
      ).run(outcome.providerMessageId, outcome.providerResponse.slice(0, 1000), now, now, attemptId);
      return null;
    }
    const text = responseText(outcome.code, outcome.providerResponse);
    db.prepare(`UPDATE delivery_attempts SET state = ?, provider_response = ?, updated_at = ? WHERE id = ? AND state = 'sending'`).run(
      outcome.kind,
      text.slice(0, 1000),
      now,
      attemptId,
    );
    if (outcome.kind === 'failed_temporary') return new JobError(outcome.code);
    if (outcome.kind === 'failed_permanent') return new JobError(outcome.code, { permanent: true });
    return new JobError('delivery_uncertain', { permanent: true });
  });
}

/** The fields of a frozen envelope that bind what is sent (an attempt made before the split has no `send_id`). */
const BOUND_FIELDS = ['revision_id', 'to', 'cc', 'subject', 'body_sha256', 'attachment_sha256'] as const;

function envelopeMatches(stored: string, expected: ReturnType<typeof frozenEnvelope>): boolean {
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    if (parsed.send_id !== undefined && parsed.send_id !== expected.send_id) return false;
    return BOUND_FIELDS.every((field) => canonicalize((parsed[field] ?? null) as CanonicalValue) === canonicalize(expected[field] as CanonicalValue));
  } catch {
    return false;
  }
}

export function createSendJobHandler(deps: SendJobDeps): JobHandler {
  const { db, clock, files, outbound } = deps;
  const hooks = deps.hooks ?? {};
  return async ({ job }) => {
    recoverInterruptedSends(db, clock);
    const { revisionId, userId } = job;
    if (revisionId === null || userId === null || job.payload.revision_id !== revisionId || job.leaseOwner === null) {
      throw new JobError('invalid_job_payload', { permanent: true });
    }
    const send = sendOfJob(db, userId, job.id);
    if (send === null || send.revisionId !== revisionId || (job.payload.send_id !== undefined && job.payload.send_id !== send.id)) {
      throw new JobError('send_record_missing', { permanent: true });
    }
    const revision = db
      .prepare<[string, string], RevisionRow>(
        'SELECT id, user_id, revision_no, payload_json, payload_sha256 FROM timesheet_revisions WHERE id = ? AND user_id = ?',
      )
      .get(revisionId, userId);
    if (revision === undefined) throw new JobError('revision_not_found', { permanent: true });
    const snapshot = loadSnapshot(revision);

    const latest = latestAttempt(db, job, userId);
    if (latest?.state === 'sending') {
      // This runner holds the lease now, so the runner that committed `sending` is gone.
      markUncertain(db, clock, latest.id, UNCERTAIN_LEASE_EXPIRED);
      throw new JobError('delivery_uncertain', { permanent: true });
    }
    if (latest?.state === 'uncertain') throw new JobError('delivery_uncertain', { permanent: true });
    if (latest?.state === 'failed_permanent') throw new JobError('delivery_failed_permanent', { permanent: true });
    if (latest?.state === 'accepted') return;

    // The send waits for the PDF of its own variant (rendered by the PDF job its transaction enqueued).
    const pdf = readyPdfOf(db, userId, revisionId, send.pdfVariant);
    if (pdf === undefined) throw new JobError('pdf_not_ready');
    const attempt = latest?.state === 'preparing' ? latest : createAttempt(db, clock, job, revision, send, pdf, (latest?.attempt_no ?? 0) + 1);

    if (attempt.attachment_id !== pdf.attachment_id) throw failBeforeSend(db, clock, attempt.id, 'attachment_mismatch', true);
    if (!envelopeMatches(attempt.envelope_json, frozenEnvelope(revision.id, contentOf(send), pdf.sha256))) {
      throw failBeforeSend(db, clock, attempt.id, 'envelope_mismatch', true);
    }
    let bytes: Buffer;
    try {
      bytes = files.read(pdf.storage_key);
    } catch {
      throw failBeforeSend(db, clock, attempt.id, 'pdf_unreadable', false);
    }
    if (sha256(bytes) !== pdf.sha256) throw failBeforeSend(db, clock, attempt.id, 'pdf_hash_mismatch', true);

    let message: OutboundMessage;
    try {
      message = await buildMessage({
        send: contentOf(send),
        payrollDate: snapshot.period.payroll_date,
        revisionNo: revision.revision_no,
        senderAddress: deps.senderAddress,
        messageId: attempt.message_id,
        date: clock.now(),
        pdf: bytes,
      });
    } catch (error) {
      if (error instanceof MessageError) throw failBeforeSend(db, clock, attempt.id, error.code, true);
      throw failBeforeSend(db, clock, attempt.id, 'message_build_failed', false);
    }

    hooks.afterPrepare?.(attempt.id);
    markSending(db, clock, job, attempt.id);
    hooks.beforeSend?.(attempt.id);
    let outcome: SendOutcome;
    try {
      outcome = await outbound.send(message, { attemptId: attempt.id });
    } catch {
      // Adapters classify their own failures; an unexpected throw may come after the transfer began.
      outcome = { kind: 'uncertain', code: 'adapter_error', providerResponse: null };
    }
    const failure = recordOutcome(db, clock, attempt.id, outcome);
    if (failure !== null) throw failure;
  };
}
