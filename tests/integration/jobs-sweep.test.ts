import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { OUTBOUND_JOB_KINDS } from '../../src/server/jobs/jobStore.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import {
  createSweepJobHandler,
  enqueueOrphanSweep,
  JOB_ORPHAN_SWEEP,
  ORPHAN_GRACE_MS,
  type OrphanSweepCounts,
} from '../../src/server/jobs/sweepJob.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T07: the daily orphan sweep job (WP3 carry item 4). Synthetic files in a temporary data directory;
 * the clock is injected, so no test reads the wall clock. The sweep never removes a file an attachments row refers to,
 * is enqueued once per UTC day, reports counts only and is not held back by the outbound pause.
 */

const NOW = '2026-10-04T12:00:00Z';
const DAY_SECONDS = 24 * 3600;

let t: TestContext;
let root: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext(NOW);
  root = mkdtempSync(join(tmpdir(), 'timesheet-sweep-'));
  files = new FileStore(root);
});

afterEach(() => {
  t.close();
  rmSync(root, { recursive: true, force: true });
});

const synthetic = (text: string) => new TextEncoder().encode(text);
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

function age(path: string, seconds: number): void {
  const when = new Date(t.clock.now().getTime() - seconds * 1000);
  utimesSync(path, when, when);
}

function reference(storageKey: string, bytes: Uint8Array): void {
  t.db
    .prepare(
      `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
       VALUES (?, ?, 'signature', ?, ?, 'image/png', ?, 1, 1, '2026-10-04T00:00:00Z')`,
    )
    .run(`att-${storageKey.slice(0, 8)}`, t.userIds.employee, storageKey, sha256(bytes), bytes.length);
}

function sweepRunner(reports: OrphanSweepCounts[] = []) {
  return (owner = 'runner-sweep') =>
    runJobsOnce({
      db: t.db,
      clock: t.clock,
      owner,
      handlers: { [JOB_ORPHAN_SWEEP]: createSweepJobHandler({ db: t.db, clock: t.clock, files, onResult: (counts) => reports.push(counts) }) },
    });
}

const sweepJobs = () => t.db.prepare('SELECT business_key, state FROM jobs WHERE kind = ? ORDER BY business_key').all(JOB_ORPHAN_SWEEP) as Array<{ business_key: string; state: string }>;

describe('the sweep job', () => {
  it('removes an unreferenced old file and an old temporary file, and never a referenced file', async () => {
    const referencedBytes = synthetic('referenced-signature');
    const referenced = files.put(referencedBytes);
    reference(referenced.storageKey, referencedBytes);
    const orphan = files.put(synthetic('orphan-object'));
    const freshOrphan = files.put(synthetic('fresh-orphan-object'));
    mkdirSync(join(root, 'tmp'), { recursive: true });
    const staleTmp = join(root, 'tmp', 'stale.tmp');
    writeFileSync(staleTmp, 'partial');
    age(files.pathOf(referenced.storageKey), 90 * DAY_SECONDS); // very old, still referenced
    age(files.pathOf(orphan.storageKey), 2 * DAY_SECONDS);
    age(files.pathOf(freshOrphan.storageKey), 60); // inside the grace
    age(staleTmp, 2 * DAY_SECONDS);

    const reports: OrphanSweepCounts[] = [];
    const summary = await sweepRunner(reports)();

    expect(summary).toMatchObject({ claimed: 1, succeeded: 1, intervention: 0, retried: 0 });
    expect(existsSync(files.pathOf(referenced.storageKey))).toBe(true);
    expect(existsSync(files.pathOf(orphan.storageKey))).toBe(false);
    expect(existsSync(files.pathOf(freshOrphan.storageKey))).toBe(true);
    expect(existsSync(staleTmp)).toBe(false);
    expect(reports).toEqual([{ removedTemporary: 1, removedUnreferenced: 1, keptReferenced: 1 }]);
  });

  it('keeps every referenced file even when it is older than any grace', async () => {
    const keys = ['one', 'two', 'three'].map((name) => {
      const bytes = synthetic(`referenced-${name}`);
      const stored = files.put(bytes);
      reference(stored.storageKey, bytes);
      age(files.pathOf(stored.storageKey), 400 * DAY_SECONDS);
      return stored.storageKey;
    });
    await sweepRunner()();
    for (const key of keys) expect(existsSync(files.pathOf(key)), key).toBe(true);
  });

  it('uses a grace of one day: a file just under it stays, a file at it goes', async () => {
    const young = files.put(synthetic('young-orphan'));
    const old = files.put(synthetic('old-orphan'));
    expect(ORPHAN_GRACE_MS).toBe(DAY_SECONDS * 1000);
    age(files.pathOf(young.storageKey), DAY_SECONDS - 1);
    age(files.pathOf(old.storageKey), DAY_SECONDS);
    await sweepRunner()();
    expect(existsSync(files.pathOf(young.storageKey))).toBe(true);
    expect(existsSync(files.pathOf(old.storageKey))).toBe(false);
  });

  it('reports counts only: no key, path, name or hash leaves the handler', async () => {
    const orphan = files.put(synthetic('orphan-for-report'));
    age(files.pathOf(orphan.storageKey), 2 * DAY_SECONDS);
    const reports: OrphanSweepCounts[] = [];
    await sweepRunner(reports)();
    expect(reports).toHaveLength(1);
    expect(Object.keys(reports[0] ?? {}).sort()).toEqual(['keptReferenced', 'removedTemporary', 'removedUnreferenced']);
    for (const value of Object.values(reports[0] ?? {})) expect(typeof value).toBe('number');
    const stored = t.db.prepare('SELECT payload_json, last_error FROM jobs WHERE kind = ?').get(JOB_ORPHAN_SWEEP) as { payload_json: string; last_error: string | null };
    expect(stored).toEqual({ payload_json: '{}', last_error: null });
  });
});

describe('the schedule', () => {
  it('enqueues one job per UTC day with a day business key and creates nothing twice', () => {
    expect(enqueueOrphanSweep(t.db, t.clock).created).toBe(true);
    expect(enqueueOrphanSweep(t.db, t.clock).created).toBe(false);
    t.clock.advanceSeconds(3600);
    expect(enqueueOrphanSweep(t.db, t.clock).created).toBe(false);
    expect(sweepJobs()).toEqual([{ business_key: 'orphan_sweep:2026-10-04', state: 'queued' }]);
    t.clock.set('2026-10-05T00:00:00Z');
    expect(enqueueOrphanSweep(t.db, t.clock).created).toBe(true);
    expect(sweepJobs().map((job) => job.business_key)).toEqual(['orphan_sweep:2026-10-04', 'orphan_sweep:2026-10-05']);
  });

  it('is scheduled by the runner pass: many passes and runners in one day run it once, the next day once more', async () => {
    const run = sweepRunner();
    await run('runner-a');
    await run('runner-b');
    t.clock.advanceSeconds(15);
    await run('runner-a');
    expect(sweepJobs()).toEqual([{ business_key: 'orphan_sweep:2026-10-04', state: 'succeeded' }]);
    t.clock.set('2026-10-05T00:00:30Z');
    await run('runner-b');
    expect(sweepJobs()).toEqual([
      { business_key: 'orphan_sweep:2026-10-04', state: 'succeeded' },
      { business_key: 'orphan_sweep:2026-10-05', state: 'succeeded' },
    ]);
  });

  it('is registered among the production handlers', () => {
    const delivery = { senderAddress: null, outbound: { mode: 'capture' as const }, publicBaseUrl: 'https://timesheet.example.invalid' };
    expect(Object.keys(createJobHandlers({ db: t.db, clock: t.clock, files, delivery }))).toContain(JOB_ORPHAN_SWEEP);
  });

  it('is not scheduled by a runner that has no sweep handler', async () => {
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-none', handlers: {} });
    expect(sweepJobs()).toEqual([]);
  });

  it('is not an outbound job, so the outbound pause never holds it back', async () => {
    expect(OUTBOUND_JOB_KINDS).not.toContain(JOB_ORPHAN_SWEEP);
    t.db.prepare("UPDATE operations_state SET outbound_paused_at = '2026-10-04T11:00:00Z', outbound_paused_reason = 'restored' WHERE id = 1").run();
    const orphan = files.put(synthetic('orphan-while-paused'));
    age(files.pathOf(orphan.storageKey), 2 * DAY_SECONDS);
    const summary = await sweepRunner()();
    expect(summary.succeeded).toBe(1);
    expect(existsSync(files.pathOf(orphan.storageKey))).toBe(false);
  });
});
