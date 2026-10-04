import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import type { SignOffInput } from '../../src/server/services/finalization.ts';
import { getBalance, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { callWindowsOverlap, type RaceOp, type RaceOutcome, RacePool } from '../support/concurrency.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T05 under real concurrency (AC-03 WP3 part, AC-06). Each round races worker threads,
 * each with its own connection to the same WAL database file, released together by a
 * barrier (tests/support/concurrency.ts), and calls the production sign-off service. A fresh
 * synthetic owner per round starts from a known state: an opening balance of 300 minutes,
 * an auto_deduct policy, one day with a 60-minute credit (2026-09-15) and one day with a
 * 240-minute deficit (2026-09-16). This file runs inside `npm test` and `npm run verify`.
 */

const NOW = '2026-09-29T20:00:00Z';
const PAYROLL = '2026-10-02';
const ROUNDS = 20;
const EXTRA_ROUNDS = 10;

let t: TestContext;
let pool: RacePool;

beforeAll(async () => {
  t = await createTestContext(NOW);
  pool = await RacePool.start(2);
});

afterAll(async () => {
  await pool.close();
  t.close();
});

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 8x8 PNG generated at test time (no image file is committed). */
function makePng(fill: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(8, 0);
  header.writeUInt32BE(8, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Array.from({ length: 8 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(24, fill)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function sessionBody(date: string, from: string, to: string, reason?: string) {
  return {
    start: la(`${date}T${from}`),
    end: la(`${date}T${to}`),
    input_zone: LA,
    breaks: [],
    breaks_confirmed: true,
    ...(reason === undefined ? {} : { reason }),
  };
}

interface Owner {
  user: SessionUser;
  hash: string;
  version: number;
}

/** A fresh synthetic owner with a policy, an opening balance, two edited days and a signature. */
function newOwner(round: number): Owner {
  const id = randomUUID();
  const ctx = { db: t.db, clock: t.clock };
  t.db
    .prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, 'Synthetic Racer', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
    )
    .run(id, `racer-${id}@example.invalid`, t.calendarId, NOW, NOW);
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
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  saveSignature(t.db, t.clock, files, id, makePng(round % 200), 'image/png');
  const review = buildReviewPayload(t.db, t.clock, user, PAYROLL);
  return { user, hash: review.payloadHash, version: review.expectedVersion };
}

function signOffOp(owner: Owner, signerName: string): RaceOp {
  const input: SignOffInput = {
    expectedVersion: owner.version,
    reviewedHash: owner.hash,
    signerName,
    deficitChoices: [],
    incompleteEvidenceAcknowledged: true,
  };
  return { kind: 'signOff', input: { userId: owner.user.id, payrollDate: PAYROLL, input } };
}

function race(ops: RaceOp[]): Promise<RaceOutcome[]> {
  return pool.race(t.config.databasePath, NOW, ops);
}

function labels(outcomes: readonly RaceOutcome[]): string[] {
  return outcomes.map((outcome) => (outcome.ok ? outcome.status : `${outcome.httpStatus ?? '-'} ${outcome.code}`)).sort();
}

function tally(distribution: Map<string, number>, outcomes: readonly RaceOutcome[]): void {
  const key = labels(outcomes).join(' + ');
  distribution.set(key, (distribution.get(key) ?? 0) + 1);
}

function report(name: string, rounds: number, overlapping: number, distribution: Map<string, number>): void {
  const kinds = [...distribution.entries()].map(([key, value]) => `${key} x${value}`).join('; ');
  console.info(`[race] ${name}: ${rounds} rounds, overlapping call windows ${overlapping}/${rounds}, outcomes: ${kinds}`);
}

function count(sql: string, userId: string): number {
  return Number(t.db.prepare(sql).pluck().get(userId));
}

/** Exactly one finalization of the owner's period: one revision, sign-off, ledger set and job set. */
function expectSingleFinalization(owner: Owner, round: number): void {
  const userId = owner.user.id;
  const label = `round ${round}`;
  expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', userId), label).toBe(1);
  expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', userId), label).toBe(1);
  const entries = listLedgerEntries(t.db, userId).filter((entry) => entry.sourceKey !== 'opening-balance');
  expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey]), label).toEqual([
    ['2026-09-16', 'deficit_debit', -240, 'finalization:day:2026-09-16:deficit_debit'],
    ['2026-09-15', 'credit', 60, 'finalization:day:2026-09-15:credit'],
  ]);
  const lines = t.db
    .prepare('SELECT work_date, line_kind, proposed_minutes, outcome FROM revision_ledger_lines WHERE user_id = ? ORDER BY work_date')
    .all(userId);
  expect(lines, label).toEqual([
    { work_date: '2026-09-15', line_kind: 'credit', proposed_minutes: 60, outcome: 'posted' },
    { work_date: '2026-09-16', line_kind: 'deficit_debit', proposed_minutes: -240, outcome: 'posted' },
  ]);
  expect(t.db.prepare('SELECT kind FROM jobs WHERE user_id = ? ORDER BY kind').pluck().all(userId), label).toEqual(['render_pdf', 'send_email']);
  expect(count('SELECT finalized_revision_no FROM timesheets WHERE user_id = ?', userId), label).toBe(1);
  expect(getBalance(t.db, userId).postedMinutes, label).toBe(300 - 240 + 60);
}

describe('concurrent sign-offs (AC-03, WP3)', () => {
  it(`two different sign-offs of the same period: one wins, the other gets 409 (${ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < ROUNDS; round += 1) {
      const owner = newOwner(round);
      const outcomes = await race([signOffOp(owner, 'Synthetic Racer'), signOffOp(owner, 'Synthetic Racer B')]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(new Set(outcomes.map((outcome) => outcome.racer)).size).toBe(2);
      expect(labels(outcomes), `round ${round}`).toEqual(['409 already_finalized', 'created']);
      expectSingleFinalization(owner, round);
      // The stored signer is the winner's.
      const winner = outcomes.findIndex((outcome) => outcome.ok);
      const signer = t.db.prepare('SELECT signer_name FROM signoffs WHERE user_id = ?').pluck().get(owner.user.id);
      expect(signer).toBe(winner === 0 ? 'Synthetic Racer' : 'Synthetic Racer B');
    }
    report('sign-off vs different sign-off', ROUNDS, overlapping, distribution);
    // The barrier releases both racers together, so their calls really overlap in most rounds.
    expect(overlapping).toBeGreaterThan(ROUNDS / 2);
  });

  it(`two identical sign-offs (a concurrent retry): one creates, the other replays (${EXTRA_ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < EXTRA_ROUNDS; round += 1) {
      const owner = newOwner(100 + round);
      const op = signOffOp(owner, 'Synthetic Racer');
      const outcomes = await race([op, op]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      expect(labels(outcomes), `round ${round}`).toEqual(['created', 'replayed']);
      expectSingleFinalization(owner, round);
    }
    report('sign-off vs identical sign-off', EXTRA_ROUNDS, overlapping, distribution);
  });

  it(`a sign-off racing a day edit: either the edit wins and the sign-off is stale, or the sign-off binds the reviewed content (${EXTRA_ROUNDS} rounds)`, async () => {
    const distribution = new Map<string, number>();
    let overlapping = 0;
    for (let round = 0; round < EXTRA_ROUNDS; round += 1) {
      const owner = newOwner(150 + round);
      const edit: RaceOp = {
        kind: 'createSession',
        input: { userId: owner.user.id, workDate: '2026-09-17', body: sessionBody('2026-09-17', '09:00', '18:00', 'Synthetic concurrent edit') },
      };
      const outcomes = await race([signOffOp(owner, 'Synthetic Racer'), edit]);
      tally(distribution, outcomes);
      if (callWindowsOverlap(outcomes)) overlapping += 1;
      const [signed, edited] = outcomes as [RaceOutcome, RaceOutcome];
      expect(edited.ok, `round ${round}`).toBe(true);
      if (signed.ok) {
        // The sign-off committed first: the revision holds exactly the reviewed content.
        expect(signed.status).toBe('created');
        expectSingleFinalization(owner, round);
        const payload = t.db.prepare('SELECT payload_sha256 FROM timesheet_revisions WHERE user_id = ?').pluck().get(owner.user.id);
        expect(payload).toBe(owner.hash);
      } else {
        // The edit committed first: the reviewed content is stale and nothing is finalized.
        expect([signed.httpStatus, signed.code], `round ${round}`).toEqual([409, 'stale_version']);
        expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', owner.user.id)).toBe(0);
        expect(count('SELECT count(*) FROM jobs WHERE user_id = ?', owner.user.id)).toBe(0);
        expect(listLedgerEntries(t.db, owner.user.id).map((entry) => entry.sourceKey)).toEqual(['opening-balance']);
      }
    }
    report('sign-off vs day edit', EXTRA_ROUNDS, overlapping, distribution);
  });
});
