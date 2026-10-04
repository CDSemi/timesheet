import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';
import { isDomainError } from '../../src/domain/errors.ts';
import type { Clock } from '../../src/server/clock.ts';
import { openDatabase } from '../../src/server/db/database.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { ApiError } from '../../src/server/http/errors.ts';
import type { SessionBody } from '../../src/server/http/schemas.ts';
import { type SignOffInput, signOffTimesheet } from '../../src/server/services/finalization.ts';
import { getBalance } from '../../src/server/services/ledger.ts';
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
 * serves race rounds; when imported by a test it only exports the pool.
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

/** One racer's operation. `unsafeReserveControl` is the harness self-check, never production code. */
export type RaceOp =
  | { kind: 'reserve'; input: ReserveOtLeaveInput }
  | { kind: 'use'; input: RecordOtLeaveUseInput }
  | { kind: 'cancel'; input: CancelOtLeaveInput }
  | { kind: 'reverse'; input: ReverseOtLeaveUseInput }
  | { kind: 'signOff'; input: SignOffRaceInput }
  | { kind: 'createSession'; input: CreateSessionRaceInput }
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
   * all are released together. Returns the outcomes in `ops` order.
   */
  async race(dbPath: string, nowIso: string, ops: readonly RaceOp[]): Promise<RaceOutcome[]> {
    if (ops.length < 2 || ops.length > this.workers.length) throw new Error(`A round needs 2–${this.workers.length} operations`);
    const control = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
    const flags = new Int32Array(control);
    const racers = this.workers.slice(0, ops.length);
    const ready = racers.map((worker) => expectMessage(worker, 'ready'));
    racers.forEach((worker, index) => {
      const message: RoundMessage = { type: 'round', dbPath, nowIso, op: ops[index] as RaceOp, control, racers: ops.length };
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
