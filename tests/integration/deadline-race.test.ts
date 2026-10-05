import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { setAutomationActivation } from '../../src/server/services/automation.ts';
import type { SignOffInput } from '../../src/server/services/finalization.ts';
import { getBalance, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { saveSubmissionSettings } from '../../src/server/services/submissionSettings.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { callWindowsOverlap, type RaceOp, type RaceOutcome, RacePool } from '../support/concurrency.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T10 under real concurrency (AC-03 WP3 part, AC-07, docs/05 "Manual/deadline race: one
 * transaction wins; the other reloads"). Each round races two worker threads, each with its own
 * connection to the same WAL database file, released together by a barrier
 * (tests/support/concurrency.ts). One racer signs the period off manually, the other runs the
 * production deadline scan, so the deadline has passed for the whole round (the injected clock
 * is 17:30 PDT, half an hour after the first deadline). A fresh synthetic owner per round
 * starts from a known state: an opening balance of 300 minutes, an auto_deduct policy, one day
 * with a 60-minute credit (2026-09-15) and one with a 240-minute deficit (2026-09-16). Whoever
 * wins, the period has exactly one revision, one ledger set and one send. This file runs
 * inside `npm test` and `npm run verify`.
 */

const EARLY = '2026-09-20T12:00:00Z';
const NOW = '2026-09-30T00:30:00Z';
const PAYROLL = '2026-10-02';
const ROUNDS = 20;
const SCAN_ROUNDS = 10;
/**
 * Milliseconds the manual racer waits after the barrier release, cycled over the rounds. The scan reads
 * before it opens its write transaction, so with no delay the sign-off usually wins; the longer delays let
 * the deadline job win, and the test asserts that both outcomes occurred.
 */
const MANUAL_DELAYS_MS = [0, 2, 5, 10, 20, 40, 80, 120];

let t: TestContext;
let pool: RacePool;
let dataDir: string;
let files: FileStore;

beforeAll(async () => {
  t = await createTestContext(EARLY);
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  // The seeded accounts stay out of the way; every round creates its own synthetic owner.
  t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id IN (?, ?)").run(t.userIds.admin, t.userIds.employee);
  setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-09-21T00:00:00Z', reason: 'Synthetic race activation' });
  t.clock.set(NOW);
  pool = await RacePool.start(2);
});

afterAll(async () => {
  await pool.close();
  t.close();
});

interface Owner {
  user: SessionUser;
  hash: string;
  version: number;
}

function sessionBody(date: string, from: string, to: string) {
  return { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true };
}

/** A fresh synthetic owner with a policy, an opening balance, two edited days, a signature and settings. */
function newOwner(round: number): Owner {
  const id = randomUUID();
  const ctx = { db: t.db, clock: t.clock };
  t.db
    .prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, 'Synthetic Racer', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
    )
    .run(id, `racer-${id}@example.invalid`, t.calendarId, EARLY, EARLY);
  createPolicyVersion(
    t.db,
    t.clock,
    {
      userId: id,
      calendarId: t.calendarId,
      effectiveFrom: '2026-01-01',
      note: 'Synthetic race policy',
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
  postCredit(ctx, { userId: id, sourceKey: 'opening-balance', minutes: 300, workDate: '2026-09-01', actorUserId: null, origin: 'system' });
  const user: SessionUser = { id, email: `racer-${id}@example.invalid`, displayName: 'Synthetic Racer', role: 'employee', calendarId: t.calendarId, sessionId: 'racer' };
  createSession({ ...ctx, user }, '2026-09-15', sessionBody('2026-09-15', '09:00', '18:00'));
  createSession({ ...ctx, user }, '2026-09-16', sessionBody('2026-09-16', '09:00', '13:00'));
  saveSignature(t.db, t.clock, files, id, makePng(24 + (round % 8), 12), 'image/png');
  // Auto-submit on and effective before the deadline (the switch was saved at the early instant).
  const now = t.clock.now();
  t.clock.set(EARLY);
  saveSubmissionSettings(t.db, t.clock, id, { expectedSeq: 0, to: ['payroll@example.invalid'], autoSubmit: true });
  t.clock.set(now.toISOString());
  const review = buildReviewPayload(t.db, t.clock, user, PAYROLL);
  return { user, hash: review.payloadHash, version: review.expectedVersion };
}

function signOffOp(owner: Owner): RaceOp {
  const input: SignOffInput = {
    expectedVersion: owner.version,
    reviewedHash: owner.hash,
    signerName: 'Synthetic Racer',
    deficitChoices: [],
    incompleteEvidenceAcknowledged: true,
  };
  return { kind: 'signOff', input: { userId: owner.user.id, payrollDate: PAYROLL, input } };
}

const deadlineOp: RaceOp = { kind: 'deadline', input: {} };

function race(ops: RaceOp[], startDelaysMs: readonly number[] = []): Promise<RaceOutcome[]> {
  return pool.race(t.config.databasePath, NOW, ops, startDelaysMs);
}

function label(outcome: RaceOutcome): string {
  return outcome.ok ? outcome.status : `${outcome.httpStatus ?? '-'} ${outcome.code}`;
}

function count(sql: string, userId: string): number {
  return Number(t.db.prepare(sql).pluck().get(userId));
}

function runnerHandlers() {
  const delivery = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: 'timesheet@example.invalid' }, { databasePath: t.config.databasePath, port: 3000, production: false });
  return createJobHandlers({ db: t.db, clock: t.clock, files, delivery });
}

/** Exactly one finalization of the owner's period: one revision, one ledger set, one job set, one send. */
async function expectSingleFinalization(owner: Owner, round: number, origin: 'employee' | 'deadline'): Promise<void> {
  const userId = owner.user.id;
  const tag = `round ${round}`;
  const revisions = t.db.prepare('SELECT revision_no, origin, review_state, actor_user_id FROM timesheet_revisions WHERE user_id = ?').all(userId);
  expect(revisions, tag).toEqual([
    origin === 'employee'
      ? { revision_no: 1, origin: 'employee', review_state: 'signed', actor_user_id: userId }
      : { revision_no: 1, origin: 'deadline', review_state: 'pending', actor_user_id: null },
  ]);
  expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', userId), tag).toBe(origin === 'employee' ? 1 : 0);
  const ledgerOrigin = origin === 'employee' ? 'manual' : 'automatic';
  const entries = listLedgerEntries(t.db, userId).filter((entry) => entry.sourceKey !== 'opening-balance');
  expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.origin]), tag).toEqual([
    ['2026-09-16', 'deficit_debit', -240, 'finalization:day:2026-09-16:deficit_debit', ledgerOrigin],
    ['2026-09-15', 'credit', 60, 'finalization:day:2026-09-15:credit', ledgerOrigin],
  ]);
  const lines = t.db
    .prepare('SELECT work_date, line_kind, proposed_minutes, outcome FROM revision_ledger_lines WHERE user_id = ? ORDER BY work_date')
    .all(userId);
  expect(lines, tag).toEqual([
    { work_date: '2026-09-15', line_kind: 'credit', proposed_minutes: 60, outcome: 'posted' },
    { work_date: '2026-09-16', line_kind: 'deficit_debit', proposed_minutes: -240, outcome: 'posted' },
  ]);
  expect(t.db.prepare("SELECT kind FROM jobs WHERE user_id = ? AND kind <> 'deadline_scan' ORDER BY kind").pluck().all(userId), tag).toEqual(['render_pdf', 'send_email']);
  expect(count('SELECT finalized_revision_no FROM timesheets WHERE user_id = ?', userId), tag).toBe(1);
  expect(getBalance(t.db, userId).postedMinutes, tag).toBe(300 - 240 + 60);
  // One send: the runner renders the PDF and delivers the captured message exactly once, even when run twice.
  // Jobs enqueued in the same second tie-break by id, so a send claimed before its PDF is retried one minute
  // later: three passes, each two minutes after the last, drain the queue.
  const handlers = runnerHandlers();
  let intervention = 0;
  for (let pass = 0; pass < 3; pass += 1) {
    intervention += (await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-race', handlers })).intervention;
    t.clock.advanceSeconds(120);
  }
  t.clock.set(NOW);
  expect(intervention, tag).toBe(0);
  expect(count("SELECT count(*) FROM delivery_attempts WHERE user_id = ? AND state = 'accepted'", userId), tag).toBe(1);
  expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', userId), tag).toBe(1);
  expect(count("SELECT count(*) FROM revision_files WHERE user_id = ? AND state = 'ready'", userId), tag).toBe(1);
}

describe('manual sign-off racing the deadline job (AC-07, WP3-T10)', () => {
  it(`exactly one revision, one ledger set and one send, whichever side wins (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    let overlapExpected = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(round);
      const delay = MANUAL_DELAYS_MS[round % MANUAL_DELAYS_MS.length] ?? 0;
      const outcomes = await race([signOffOp(owner), deadlineOp], [delay, 0]);
      const [manual, deadline] = outcomes as [RaceOutcome, RaceOutcome];
      if (delay <= 5) {
        overlapExpected += 1;
        if (callWindowsOverlap(outcomes)) overlapping += 1;
      }
      expect(new Set(outcomes.map((outcome) => outcome.racer)).size).toBe(2);
      const key = `${label(manual)} + ${label(deadline)}`;
      distribution.set(key, (distribution.get(key) ?? 0) + 1);
      if (manual.ok) {
        // The manual sign-off won: the deadline job reloaded, found the period finalized and did nothing.
        expect([label(manual), label(deadline)], `round ${round}`).toEqual(['created', 'finalized:0']);
        await expectSingleFinalization(owner, round, 'employee');
      } else {
        // The deadline job won: the late manual sign-off is refused as already finalized.
        expect([label(manual), label(deadline)], `round ${round}`).toEqual(['409 already_finalized', 'finalized:1']);
        await expectSingleFinalization(owner, round, 'deadline');
      }
    }
    const kinds = [...distribution.entries()].map(([key, value]) => `${key} x${value}`).join('; ');
    console.info(`[race] sign-off vs deadline job: ${ROUNDS} rounds, overlapping call windows ${overlapping}/${overlapExpected} (delay <= 5 ms), outcomes: ${kinds}`);
    // The barrier releases both racers together, so with a short delay their calls really overlap in most rounds.
    expect(overlapping).toBeGreaterThan(overlapExpected / 2);
    // Both orders happened: the sign-off won some rounds and the deadline job won others.
    expect([...distribution.keys()].some((key) => key.startsWith('created'))).toBe(true);
    expect([...distribution.keys()].some((key) => key.startsWith('409 already_finalized'))).toBe(true);
  });

  it(`two deadline scans at once: one revision, one ledger set and one send (${SCAN_ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    for (let round = 0; round < SCAN_ROUNDS; round += 1) {
      const owner = newOwner(100 + round);
      const outcomes = await race([deadlineOp, deadlineOp]);
      const key = outcomes.map(label).sort().join(' + ');
      distribution.set(key, (distribution.get(key) ?? 0) + 1);
      expect(outcomes.map(label).sort(), `round ${round}`).toEqual(['finalized:0', 'finalized:1']);
      await expectSingleFinalization(owner, round, 'deadline');
    }
    const kinds = [...distribution.entries()].map(([key, value]) => `${key} x${value}`).join('; ');
    console.info(`[race] deadline scan vs deadline scan: ${SCAN_ROUNDS} rounds, outcomes: ${kinds}`);
  });
});
