import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';
import { crc32, deflateSync } from 'node:zlib';
import { isDomainError } from '../../src/domain/errors.ts';
import type { Clock } from '../../src/server/clock.ts';
import { openDatabase } from '../../src/server/db/database.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler, JOB_RENDER_PDF } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { ApiError } from '../../src/server/http/errors.ts';
import type { SessionBody } from '../../src/server/http/schemas.ts';
import { type SignOffInput, signOffTimesheet } from '../../src/server/services/finalization.ts';
import { runDeadlineScan } from '../../src/server/services/automation.ts';
import { getBalance, postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import {
  type CancelOtLeaveInput,
  cancelOtLeave,
  type RecordOtLeaveUseInput,
  recordOtLeaveUse,
  type ReserveOtLeaveInput,
  type ReverseOtLeaveUseInput,
  reserveOtLeave,
  reverseOtLeaveUse,
} from '../../src/server/services/otLeave.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';

/*
 * Multi-connection race harness for AC-03 (R-06 "prevent concurrent double spending") and
 * the WP3 sign-off finalization (AC-03 WP3 part, AC-06 concurrent edit).
 *
 * better-sqlite3 is synchronous, so two calls on one in-process connection serialize
 * trivially and prove nothing. Each racer here is a separate worker thread that opens its
 * OWN connection to the SAME WAL database file through the production `openDatabase`
 * (WAL, busy_timeout, foreign keys) and calls the production service directly (Node 24
 * loads the TypeScript sources with type stripping). A SharedArrayBuffer barrier releases
 * all racers at the same instant after every connection is open and ready, so the calls
 * genuinely contend for the SQLite write lock.
 *
 * The same file is the worker entry: when loaded as a worker with the harness role it
 * serves race rounds, with the writer role it runs the background writer loop (WP4-T05,
 * below); when imported by a test it only exports the pool and the writer handle.
 */

const WORKER_ROLE = 'timesheet-ot-leave-racer';
const BARRIER_TIMEOUT_MS = 10_000;
// Int32 slots of the per-round control buffer.
const GO = 0;
const CONTROL_ARRIVED = 1;

export interface UnsafeReserveControlInput {
  userId: string;
  requestKey: string;
  minutes: number;
}

/** A manual sign-off of `payrollDate` by the owner `userId` (WP3-T05). */
export interface SignOffRaceInput {
  userId: string;
  payrollDate: string;
  input: SignOffInput;
}

/** A day edit by the owner `userId`: one new session on `workDate`. */
export interface CreateSessionRaceInput {
  userId: string;
  workDate: string;
  body: SessionBody;
}

/** One pass of the deadline scan (WP3-T10): finalizes every eligible overdue period it finds. */
export interface DeadlineRaceInput {
  batchSize?: number;
}

/** One racer's operation. `unsafeReserveControl` is the harness self-check, never production code. */
export type RaceOp =
  | { kind: 'reserve'; input: ReserveOtLeaveInput }
  | { kind: 'use'; input: RecordOtLeaveUseInput }
  | { kind: 'cancel'; input: CancelOtLeaveInput }
  | { kind: 'reverse'; input: ReverseOtLeaveUseInput }
  | { kind: 'signOff'; input: SignOffRaceInput }
  | { kind: 'createSession'; input: CreateSessionRaceInput }
  | { kind: 'deadline'; input: DeadlineRaceInput }
  | { kind: 'unsafeReserveControl'; input: UnsafeReserveControlInput };

export type RaceOutcome = (
  | { ok: true; status: string }
  | { ok: false; status: 'error'; code: string; httpStatus: number | null; message: string }
) & {
  /** Index of the racer thread that ran the operation. */
  racer: number;
  /** Wall-clock milliseconds with sub-millisecond precision, comparable across threads. */
  startedAtMs: number;
  finishedAtMs: number;
};

interface RoundMessage {
  type: 'round';
  dbPath: string;
  nowIso: string;
  op: RaceOp;
  control: SharedArrayBuffer;
  racers: number;
  /** Milliseconds this racer waits after the barrier release before its call (0 for none). */
  delayMs: number;
}

type WorkerMessage = { type: 'ready' } | { type: 'done'; outcome: RaceOutcome } | { type: 'failed'; message: string };

function wallMs(): number {
  return performance.timeOrigin + performance.now();
}

function describeError(error: unknown): { code: string; httpStatus: number | null; message: string } {
  if (error instanceof ApiError) return { code: error.code, httpStatus: error.status, message: error.message };
  if (isDomainError(error)) return { code: error.code, httpStatus: 422, message: error.message };
  if (error instanceof Error) {
    const code = 'code' in error && typeof error.code === 'string' ? error.code : error.name;
    return { code, httpStatus: null, message: error.message };
  }
  return { code: 'unknown', httpStatus: null, message: String(error) };
}

/** Blocks until every racer has arrived at `slot` (worker threads may block). */
function arriveAndWait(control: Int32Array, slot: number, racers: number): void {
  Atomics.add(control, slot, 1);
  Atomics.notify(control, slot);
  const deadline = Date.now() + BARRIER_TIMEOUT_MS;
  for (;;) {
    const arrived = Atomics.load(control, slot);
    if (arrived >= racers) return;
    if (Date.now() > deadline) throw new Error('barrier_timeout');
    Atomics.wait(control, slot, arrived, 50);
  }
}

/**
 * Harness self-check: a deliberately broken check-then-insert with no transaction. Every
 * racer reads the available balance, waits until all racers have read, then inserts. If
 * the racers really run concurrently on separate connections, all of them "succeed" and
 * double-book, which shows that the harness can observe a race.
 */
function unsafeReserveControl(db: ReturnType<typeof openDatabase>, input: UnsafeReserveControlInput, nowIso: string, control: Int32Array, racers: number): string {
  const available = getBalance(db, input.userId).availableMinutes;
  arriveAndWait(control, CONTROL_ARRIVED, racers);
  if (available < input.minutes) return 'rejected';
  db.prepare(
    `INSERT INTO ot_leave_requests (id, user_id, request_key, leave_date, requested_minutes, approved_minutes,
       reserved_minutes, approver_name, approval_date, evidence_ref, approval_origin, created_by, created_at, updated_at)
     VALUES (?, ?, ?, '2026-10-01', ?, ?, ?, 'Example Manager', '2026-09-30', 'Synthetic control', 'self_recorded', ?, ?, ?)`,
  ).run(randomUUID(), input.userId, input.requestKey, input.minutes, input.minutes, input.minutes, input.userId, nowIso, nowIso);
  return 'reserved';
}

/** The session user of `userId`, read from the racer's own connection (the HTTP layer is not involved). */
function sessionUserOf(db: ReturnType<typeof openDatabase>, userId: string): SessionUser {
  const row = db
    .prepare('SELECT id, email, display_name, role, calendar_id FROM users WHERE id = ?')
    .get(userId) as { id: string; email: string; display_name: string; role: SessionUser['role']; calendar_id: string } | undefined;
  if (row === undefined) throw new Error('Unknown racer user');
  return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'racer' };
}

function runOp(message: RoundMessage, control: Int32Array): RaceOutcome {
  const clock: Clock = { now: () => new Date(message.nowIso) };
  const db = openDatabase(message.dbPath);
  let startedAtMs = 0;
  try {
    const ctx = { db, clock };
    const { op } = message;
    const user = op.kind === 'signOff' || op.kind === 'createSession' ? sessionUserOf(db, op.input.userId) : null;
    // Touch the file so the connection is fully open before the barrier releases.
    db.prepare('SELECT count(*) FROM ot_leave_requests').pluck().get();
    parentPort?.postMessage({ type: 'ready' } satisfies WorkerMessage);
    const released = Atomics.wait(control, GO, 0, BARRIER_TIMEOUT_MS);
    if (released === 'timed-out') throw new Error('barrier_timeout');
    if (message.delayMs > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)), 0, 0, message.delayMs);
    startedAtMs = wallMs();
    let status: string;
    switch (op.kind) {
      case 'reserve':
        status = reserveOtLeave(ctx, op.input).status;
        break;
      case 'use':
        status = recordOtLeaveUse(ctx, op.input).status;
        break;
      case 'cancel':
        status = cancelOtLeave(ctx, op.input).status;
        break;
      case 'reverse':
        status = reverseOtLeaveUse(ctx, op.input).status;
        break;
      case 'signOff':
        status = signOffTimesheet({ db, clock, user: user as SessionUser }, op.input.payrollDate, op.input.input).status;
        break;
      case 'createSession':
        createSession({ db, clock, user: user as SessionUser }, op.input.workDate, op.input.body);
        status = 'session_created';
        break;
      case 'deadline': {
        const summary = runDeadlineScan(db, clock, op.input.batchSize === undefined ? {} : { batchSize: op.input.batchSize });
        status = `finalized:${summary.finalized}`;
        break;
      }
      case 'unsafeReserveControl':
        status = unsafeReserveControl(db, op.input, message.nowIso, control, message.racers);
        break;
    }
    return { ok: true, status, racer: racerIndex(), startedAtMs, finishedAtMs: wallMs() };
  } catch (error) {
    return { ok: false, status: 'error', ...describeError(error), racer: racerIndex(), startedAtMs, finishedAtMs: wallMs() };
  } finally {
    db.close();
  }
}

function racerIndex(): number {
  return (workerData as { index: number }).index;
}

function serveRounds(): void {
  parentPort?.on('message', (message: RoundMessage) => {
    try {
      const outcome = runOp(message, new Int32Array(message.control));
      parentPort?.postMessage({ type: 'done', outcome } satisfies WorkerMessage);
    } catch (error) {
      parentPort?.postMessage({ type: 'failed', message: describeError(error).message } satisfies WorkerMessage);
    }
  });
}

if (!isMainThread && (workerData as { role?: string } | null)?.role === WORKER_ROLE) serveRounds();

function nextMessage(worker: Worker): Promise<WorkerMessage> {
  return new Promise((resolve, reject) => {
    const onMessage = (message: WorkerMessage) => {
      worker.off('error', onError);
      resolve(message);
    };
    const onError = (error: Error) => {
      worker.off('message', onMessage);
      reject(error);
    };
    worker.once('message', onMessage);
    worker.once('error', onError);
  });
}

async function expectMessage<T extends WorkerMessage['type']>(worker: Worker, type: T): Promise<Extract<WorkerMessage, { type: T }>> {
  const message = await nextMessage(worker);
  if (message.type === 'failed') throw new Error(`Racer failed: ${message.message}`);
  if (message.type !== type) throw new Error(`Expected ${type} from racer, got ${message.type}`);
  return message as Extract<WorkerMessage, { type: T }>;
}

/** A pool of racer threads; each round gives racer i the operation ops[i]. */
export class RacePool {
  private readonly workers: Worker[];

  private constructor(workers: Worker[]) {
    this.workers = workers;
  }

  static async start(size: number): Promise<RacePool> {
    if (!Number.isInteger(size) || size < 2) throw new Error('A race needs at least two racers');
    const workers = Array.from(
      { length: size },
      (_, index) => new Worker(new URL(import.meta.url), { workerData: { role: WORKER_ROLE, index } }),
    );
    await Promise.all(workers.map((worker) => new Promise<void>((resolve, reject) => {
      worker.once('online', () => resolve());
      worker.once('error', reject);
    })));
    return new RacePool(workers);
  }

  get size(): number {
    return this.workers.length;
  }

  /**
   * Runs one round: every racer opens its own connection to `dbPath`, reports ready, and
   * all are released together. Returns the outcomes in `ops` order. `startDelaysMs[i]` (optional)
   * holds racer i back that many milliseconds after the release, to sweep the interleavings.
   */
  async race(dbPath: string, nowIso: string, ops: readonly RaceOp[], startDelaysMs: readonly number[] = []): Promise<RaceOutcome[]> {
    if (ops.length < 2 || ops.length > this.workers.length) throw new Error(`A round needs 2–${this.workers.length} operations`);
    const control = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
    const flags = new Int32Array(control);
    const racers = this.workers.slice(0, ops.length);
    const ready = racers.map((worker) => expectMessage(worker, 'ready'));
    racers.forEach((worker, index) => {
      const message: RoundMessage = { type: 'round', dbPath, nowIso, op: ops[index] as RaceOp, control, racers: ops.length, delayMs: startDelaysMs[index] ?? 0 };
      worker.postMessage(message);
    });
    await Promise.all(ready);
    const done = racers.map((worker) => expectMessage(worker, 'done'));
    Atomics.store(flags, GO, 1);
    Atomics.notify(flags, GO);
    return (await Promise.all(done)).map((message) => message.outcome);
  }

  async close(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.terminate()));
  }
}

/** True when every racer's call window overlaps every other's (all started before any finished). */
export function callWindowsOverlap(outcomes: readonly RaceOutcome[]): boolean {
  const latestStart = Math.max(...outcomes.map((outcome) => outcome.startedAtMs));
  const earliestFinish = Math.min(...outcomes.map((outcome) => outcome.finishedAtMs));
  return latestStart < earliestFinish;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Background writer loop (WP4-T05, AC-11 "backup while writes occur").
 *
 * One worker thread with its OWN production connection (`openDatabase`: WAL, busy timeout, foreign keys) and its own
 * `FileStore` on the SAME database file and private data directory as the test. Until the test sets the stop flag it
 * repeats one iteration of real production writes for a fresh synthetic owner: the account row, a work policy, an
 * opening ledger credit, two day edits (new work sessions), a signature image (file renamed into the store before its
 * attachment row commits), a manual sign-off (revision, sign-off, ledger events, jobs in one transaction), the PDF job
 * (render, file rename, then the PDF attachment row) and one more ledger post. After every committed step it bumps a
 * shared counter, so the test can wait for writes to happen at a chosen moment (for example between the database
 * snapshot and the file copy of a backup) without sharing a connection or a clock.
 * ------------------------------------------------------------------------------------------------------------------ */

const WRITER_ROLE = 'timesheet-backup-writer';
// Int32 slots of the writer control buffer.
const WRITER_STOP = 0;
const WRITER_COMMITS = 1;
const WRITER_SLOTS = 2;

export interface WriterLoopInput {
  dbPath: string;
  dataDir: string;
  nowIso: string;
  calendarId: string;
  payrollDate: string;
}

export interface WriterSummary {
  iterations: number;
  commits: number;
  owners: number;
  sessions: number;
  signatures: number;
  finalizations: number;
  pdfs: number;
  ledgerPosts: number;
  errors: string[];
}

type WriterMessage = { type: 'started' } | { type: 'stopped'; summary: WriterSummary } | { type: 'failed'; message: string };

interface WriterStart extends WriterLoopInput {
  type: 'writeLoop';
  control: SharedArrayBuffer;
}

const WRITER_ZONE = 'America/Los_Angeles';

function writerPngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 8x8 PNG generated at run time (no image file is committed). */
function writerPng(fill: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(8, 0);
  header.writeUInt32BE(8, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Array.from({ length: 8 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(24, fill)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    writerPngChunk('IHDR', header),
    writerPngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    writerPngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function writerSession(date: string, from: string, to: string): SessionBody {
  return {
    start: { local: `${date}T${from}`, zone: WRITER_ZONE },
    end: { local: `${date}T${to}`, zone: WRITER_ZONE },
    input_zone: WRITER_ZONE,
    breaks: [],
    breaks_confirmed: true,
  };
}

async function writeLoop(message: WriterStart): Promise<WriterSummary> {
  const flags = new Int32Array(message.control);
  const clock: Clock = { now: () => new Date(message.nowIso) };
  const db = openDatabase(message.dbPath);
  const files = new FileStore(message.dataDir);
  const handlers = { [JOB_RENDER_PDF]: createPdfJobHandler({ db, clock, files }) };
  const summary: WriterSummary = { iterations: 0, commits: 0, owners: 0, sessions: 0, signatures: 0, finalizations: 0, pdfs: 0, ledgerPosts: 0, errors: [] };
  const committed = () => {
    summary.commits += 1;
    Atomics.add(flags, WRITER_COMMITS, 1);
    Atomics.notify(flags, WRITER_COMMITS);
  };
  parentPort?.postMessage({ type: 'started' } satisfies WriterMessage);
  try {
    while (Atomics.load(flags, WRITER_STOP) === 0) {
      summary.iterations += 1;
      const round = summary.iterations;
      try {
        const id = randomUUID();
        const email = `writer-${id}@example.invalid`;
        db.prepare(
          `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
           VALUES (?, ?, 'Synthetic Writer', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
        ).run(id, email, message.calendarId, message.nowIso, message.nowIso);
        summary.owners += 1;
        committed();
        createPolicyVersion(
          db,
          clock,
          {
            userId: id,
            calendarId: message.calendarId,
            effectiveFrom: '2026-01-01',
            note: 'Synthetic writer policy',
            rules: {
              requiredMinutes: 480,
              thresholdMinutes: 30,
              roundingStepMinutes: 30,
              referenceStart: '08:00',
              referenceEnd: '16:00',
              deficitMode: 'auto_deduct',
              breaks: [],
            },
          },
          id,
        );
        committed();
        postCredit({ db, clock }, { userId: id, sourceKey: 'opening-balance', minutes: 300, workDate: '2026-09-01', actorUserId: null, origin: 'system' });
        summary.ledgerPosts += 1;
        committed();
        const user: SessionUser = { id, email, displayName: 'Synthetic Writer', role: 'employee', calendarId: message.calendarId, sessionId: 'writer' };
        createSession({ db, clock, user }, '2026-09-15', writerSession('2026-09-15', '09:00', '18:00'));
        summary.sessions += 1;
        committed();
        createSession({ db, clock, user }, '2026-09-16', writerSession('2026-09-16', '09:00', '13:00'));
        summary.sessions += 1;
        committed();
        saveSignature(db, clock, files, id, writerPng(round % 200), 'image/png');
        summary.signatures += 1;
        committed();
        const review = buildReviewPayload(db, clock, user, message.payrollDate);
        signOffTimesheet({ db, clock, user }, message.payrollDate, {
          expectedVersion: review.expectedVersion,
          reviewedHash: review.payloadHash,
          signerName: 'Synthetic Writer',
          deficitChoices: [],
          incompleteEvidenceAcknowledged: true,
        });
        summary.finalizations += 1;
        committed();
        const run = await runJobsOnce({ db, clock, handlers });
        summary.pdfs += run.succeeded;
        if (run.succeeded !== 1) summary.errors.push(`round ${round}: pdf job ${JSON.stringify(run)}`);
        committed();
        postCredit({ db, clock }, { userId: id, sourceKey: `writer-extra-${round}`, minutes: 15, workDate: '2026-09-20', actorUserId: id, origin: 'manual' });
        summary.ledgerPosts += 1;
        committed();
      } catch (error) {
        const described = describeError(error);
        summary.errors.push(`round ${round}: ${described.code} ${described.message}`);
      }
    }
  } finally {
    db.close();
  }
  return summary;
}

function serveWriter(): void {
  parentPort?.once('message', (message: WriterStart) => {
    writeLoop(message).then(
      (summary) => parentPort?.postMessage({ type: 'stopped', summary } satisfies WriterMessage),
      (error: unknown) => parentPort?.postMessage({ type: 'failed', message: describeError(error).message } satisfies WriterMessage),
    );
  });
}

if (!isMainThread && (workerData as { role?: string } | null)?.role === WRITER_ROLE) serveWriter();

function nextWriterMessage(worker: Worker): Promise<WriterMessage> {
  return new Promise((resolve, reject) => {
    const onMessage = (message: WriterMessage) => {
      worker.off('error', onError);
      resolve(message);
    };
    const onError = (error: Error) => {
      worker.off('message', onMessage);
      reject(error);
    };
    worker.once('message', onMessage);
    worker.once('error', onError);
  });
}

/** Handle of a running writer loop; `stop()` ends it after the current step and returns what it did. */
export class BackgroundWriter {
  private readonly worker: Worker;
  private readonly flags: Int32Array;
  private readonly finished: Promise<WriterMessage>;

  private constructor(worker: Worker, flags: Int32Array, finished: Promise<WriterMessage>) {
    this.worker = worker;
    this.flags = flags;
    this.finished = finished;
  }

  static async start(input: WriterLoopInput): Promise<BackgroundWriter> {
    const worker = new Worker(new URL(import.meta.url), { workerData: { role: WRITER_ROLE, index: 0 } });
    const control = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * WRITER_SLOTS);
    const started = nextWriterMessage(worker);
    worker.postMessage({ type: 'writeLoop', ...input, control } satisfies WriterStart);
    const first = await started;
    if (first.type !== 'started') throw new Error(`Writer did not start: ${JSON.stringify(first)}`);
    return new BackgroundWriter(worker, new Int32Array(control), nextWriterMessage(worker));
  }

  /** Committed steps so far (read across threads). */
  get commits(): number {
    return Atomics.load(this.flags, WRITER_COMMITS);
  }

  /** Resolves once at least `target` steps have committed; rejects after `timeoutMs`. Never blocks the event loop. */
  async waitForCommits(target: number, timeoutMs = 20_000): Promise<number> {
    const deadline = Date.now() + timeoutMs;
    while (this.commits < target) {
      if (Date.now() > deadline) throw new Error(`The writer reached ${this.commits} of ${target} commits in ${timeoutMs} ms`);
      await new Promise((done) => setTimeout(done, 5));
    }
    return this.commits;
  }

  async stop(): Promise<WriterSummary> {
    Atomics.store(this.flags, WRITER_STOP, 1);
    const message = await this.finished;
    await this.worker.terminate();
    if (message.type !== 'stopped') throw new Error(`Writer failed: ${JSON.stringify(message)}`);
    return message.summary;
  }
}
