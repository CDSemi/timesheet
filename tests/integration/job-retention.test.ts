import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate } from '../../src/server/db/migrations.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { JOB_DEADLINE_SCAN } from '../../src/server/jobs/deadlineJob.ts';
import { OUTBOUND_JOB_KINDS } from '../../src/server/jobs/jobStore.ts';
import { JOB_REMINDER_SCAN } from '../../src/server/jobs/reminderJob.ts';
import {
  createRetentionJobHandler,
  enqueueJobRetention,
  JOB_RETENTION,
  RETENTION_DAYS,
  type RetentionCounts,
  retentionLine,
} from '../../src/server/jobs/retentionJob.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T07B (owner decision F-4 (a), migration 0011): only succeeded `deadline_scan` and `reminder_scan` job rows that
 * finished more than 30 days ago, and that no other table refers to, may be deleted, through a narrow exception to the
 * `jobs_no_delete` trigger that only the daily retention job opens. The clock is injected, so no test reads the wall
 * clock or depends on the season. Rows are synthetic; every other delete stays refused by the trigger itself.
 */

const NOW = '2026-10-20T12:00:00Z';
const DAY = 24 * 3600;

let t: TestContext;
let sequence = 0;

beforeEach(async () => {
  t = await createTestContext(NOW);
  sequence = 0;
});

afterEach(() => {
  t.close();
});

/** An instant `seconds` before the injected clock's now, as a UTC string. */
function before(seconds: number): string {
  return new Date(t.clock.now().getTime() - seconds * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

interface JobSeed {
  kind: string;
  state?: 'queued' | 'succeeded' | 'intervention' | 'cancelled';
  /** How long before the injected now the job last changed (finished). */
  ageSeconds: number;
  userId?: string | null;
}

/** Inserts a synthetic job row directly (an INSERT is not guarded); returns its id. */
function seedJob(seed: JobSeed): string {
  sequence += 1;
  const id = `job-ret-${sequence}`;
  const finished = before(seed.ageSeconds);
  t.db
    .prepare(
      `INSERT INTO jobs (id, user_id, kind, business_key, payload_json, state, attempts, next_run_at, last_error, created_at, updated_at)
       VALUES (?, ?, ?, ?, '{}', ?, 1, ?, ?, ?, ?)`,
    )
    .run(
      id,
      seed.userId ?? null,
      seed.kind,
      `${seed.kind}:synthetic-${sequence}`,
      seed.state ?? 'succeeded',
      finished,
      seed.state === 'intervention' ? 'synthetic_failure' : null,
      finished,
      finished,
    );
  return id;
}

/** A stored pay period of the test calendar, so a reminder occurrence can name it. */
function seedPeriod(): string {
  t.db
    .prepare(
      `INSERT INTO pay_periods VALUES ('period-ret-1', ?, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27',
         '2026-09-29', '17:00', '2026-09-30T00:00:00Z', 0, '2026-09-01T00:00:00Z')`,
    )
    .run(t.calendarId);
  return 'period-ret-1';
}

const exists = (id: string) => t.db.prepare('SELECT 1 FROM jobs WHERE id = ?').get(id) !== undefined;
const retentionJobs = () =>
  t.db.prepare('SELECT business_key, state FROM jobs WHERE kind = ? ORDER BY business_key').all(JOB_RETENTION) as Array<{ business_key: string; state: string }>;

function retentionRunner(reports: RetentionCounts[] = []) {
  return (owner = 'runner-retention') =>
    runJobsOnce({
      db: t.db,
      clock: t.clock,
      owner,
      handlers: { [JOB_RETENTION]: createRetentionJobHandler({ db: t.db, clock: t.clock, onResult: (counts) => reports.push(counts) }) },
    });
}

/** The narrow window the retention job opens around its delete (migration 0011). */
function openWindow(asOf: string): void {
  t.db.prepare('UPDATE job_retention_window SET as_of = ? WHERE id = 1').run(asOf);
}

describe('the retention job (F-4 (a))', () => {
  it('deletes a succeeded scan job older than 30 days and keeps one 29 days old', async () => {
    const oldDeadline = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 31 * DAY });
    const oldReminder = seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 45 * DAY });
    const youngDeadline = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 29 * DAY });
    const youngReminder = seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 29 * DAY + 23 * 3600 });
    const reports: RetentionCounts[] = [];
    const summary = await retentionRunner(reports)();
    expect(summary).toMatchObject({ claimed: 1, succeeded: 1 });
    expect(exists(oldDeadline)).toBe(false);
    expect(exists(oldReminder)).toBe(false);
    expect(exists(youngDeadline)).toBe(true);
    expect(exists(youngReminder)).toBe(true);
    expect(reports).toEqual([{ deletedScanJobs: 2 }]);
  });

  it('treats exactly 30 days as not yet more than 30 days', async () => {
    expect(RETENTION_DAYS).toBe(30);
    const exactly = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 30 * DAY });
    const justOver = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 30 * DAY + 1 });
    await retentionRunner()();
    expect(exists(exactly)).toBe(true);
    expect(exists(justOver)).toBe(false);
  });

  it('takes the cut-off from the injected clock, not the wall clock', async () => {
    const row = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 29 * DAY });
    await retentionRunner()();
    expect(exists(row)).toBe(true);
    // Two days later by the injected clock the same row is 31 days old and a new day's job runs.
    t.clock.advanceSeconds(2 * DAY);
    await retentionRunner()();
    expect(exists(row)).toBe(false);
  });

  it('never deletes a failed, cancelled or queued scan job, or any other kind, however old', async () => {
    const kept = [
      seedJob({ kind: JOB_DEADLINE_SCAN, state: 'intervention', ageSeconds: 90 * DAY }),
      seedJob({ kind: JOB_REMINDER_SCAN, state: 'cancelled', ageSeconds: 90 * DAY }),
      seedJob({ kind: JOB_DEADLINE_SCAN, state: 'queued', ageSeconds: 90 * DAY }),
      seedJob({ kind: 'send_email', ageSeconds: 90 * DAY }),
      seedJob({ kind: 'send_reminder', ageSeconds: 90 * DAY }),
      seedJob({ kind: 'render_pdf', ageSeconds: 90 * DAY }),
      seedJob({ kind: 'orphan_sweep', ageSeconds: 90 * DAY }),
      seedJob({ kind: 'job_retention', ageSeconds: 90 * DAY }),
    ];
    const summary = await retentionRunner()();
    expect(summary.succeeded).toBe(1);
    for (const id of kept) expect(exists(id), id).toBe(true);
  });

  it('keeps a scan job another table refers to and still succeeds', async () => {
    const referenced = seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 60 * DAY, userId: t.userIds.employee });
    const free = seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 60 * DAY, userId: t.userIds.employee });
    const period = seedPeriod();
    t.db
      .prepare(
        `INSERT INTO reminder_occurrences (id, user_id, pay_period_id, kind, occurrence_key, disposition, job_id, decided_at)
         VALUES ('occ-ret-1', ?, ?, 'before_due', 'synthetic', 'enqueued', ?, ?)`,
      )
      .run(t.userIds.employee, period, referenced, before(60 * DAY));
    const reports: RetentionCounts[] = [];
    const summary = await retentionRunner(reports)();
    expect(summary).toMatchObject({ succeeded: 1, intervention: 0, retried: 0 });
    expect(exists(referenced)).toBe(true);
    expect(exists(free)).toBe(false);
    expect(reports).toEqual([{ deletedScanJobs: 1 }]);
  });

  it('is idempotent per UTC day: a day has one job and a closed job never runs again', async () => {
    const first = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 40 * DAY });
    const run = retentionRunner();
    expect((await run()).claimed).toBe(1);
    expect(exists(first)).toBe(false);
    const later = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 40 * DAY });
    t.clock.advanceSeconds(3600);
    expect((await run()).claimed).toBe(0);
    expect(exists(later)).toBe(true);
    expect(retentionJobs()).toEqual([{ business_key: 'job_retention:2026-10-20', state: 'succeeded' }]);
    expect(enqueueJobRetention(t.db, t.clock)).toMatchObject({ created: false });
    // The next UTC day yields one more job, which removes what has become eligible since.
    t.clock.set('2026-10-21T00:00:01Z');
    expect((await run()).claimed).toBe(1);
    expect(exists(later)).toBe(false);
    expect(retentionJobs().map((job) => job.business_key)).toEqual(['job_retention:2026-10-20', 'job_retention:2026-10-21']);
  });

  it('is not scheduled by a runner without the handler, and is not an outbound job', async () => {
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-none', handlers: {} });
    expect(retentionJobs()).toEqual([]);
    expect(OUTBOUND_JOB_KINDS).not.toContain(JOB_RETENTION);
    t.db.prepare("UPDATE operations_state SET outbound_paused_at = '2026-10-20T11:00:00Z', outbound_paused_reason = 'restored' WHERE id = 1").run();
    const old = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 40 * DAY });
    await retentionRunner()();
    expect(exists(old)).toBe(false);
  });

  it('is registered among the production handlers', () => {
    const root = mkdtempSync(join(tmpdir(), 'timesheet-retention-'));
    try {
      const delivery = { senderAddress: null, outbound: { mode: 'capture' as const }, publicBaseUrl: 'https://timesheet.example.invalid' };
      expect(Object.keys(createJobHandlers({ db: t.db, clock: t.clock, files: new FileStore(root), delivery }))).toContain(JOB_RETENTION);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('records counts only: the run time and the number deleted, and closes the window', async () => {
    seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 40 * DAY });
    seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 40 * DAY });
    seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 5 * DAY });
    await retentionRunner()();
    expect(t.db.prepare('SELECT job_retention_last_run_at AS at, job_retention_last_deleted AS deleted FROM operations_state WHERE id = 1').get()).toEqual({
      at: NOW,
      deleted: 2,
    });
    expect(t.db.prepare('SELECT as_of FROM job_retention_window WHERE id = 1').pluck().get()).toBeNull();
    expect(retentionLine({ deletedScanJobs: 2 })).toBe('Job retention: deleted_scan_jobs=2');
  });
});

describe('the jobs_no_delete trigger after migration 0011', () => {
  const refused = (id: string) => expect(() => t.db.prepare('DELETE FROM jobs WHERE id = ?').run(id)).toThrow(/immutable_job/);

  it('refuses a direct DELETE of an eligible-looking row while the window is closed', () => {
    const old = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 90 * DAY });
    refused(old);
    expect(exists(old)).toBe(true);
  });

  it('refuses every other delete even while the window is open', () => {
    const rows = {
      failedScan: seedJob({ kind: JOB_DEADLINE_SCAN, state: 'intervention', ageSeconds: 90 * DAY }),
      queuedScan: seedJob({ kind: JOB_REMINDER_SCAN, state: 'queued', ageSeconds: 90 * DAY }),
      send: seedJob({ kind: 'send_email', ageSeconds: 90 * DAY }),
      reminderSend: seedJob({ kind: 'send_reminder', ageSeconds: 90 * DAY }),
      pdf: seedJob({ kind: 'render_pdf', ageSeconds: 90 * DAY }),
      sweep: seedJob({ kind: 'orphan_sweep', ageSeconds: 90 * DAY }),
      retention: seedJob({ kind: 'job_retention', ageSeconds: 90 * DAY }),
      recentScan: seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 29 * DAY }),
      exactlyThirty: seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 30 * DAY }),
    };
    openWindow(NOW);
    for (const [name, id] of Object.entries(rows)) {
      expect(() => t.db.prepare('DELETE FROM jobs WHERE id = ?').run(id), name).toThrow(/immutable_job/);
      expect(exists(id), name).toBe(true);
    }
    expect(() => t.db.prepare('DELETE FROM jobs').run()).toThrow(/immutable_job/);
  });

  it('refuses a scan job a reminder occurrence refers to even while the window is open', async () => {
    const referenced = seedJob({ kind: JOB_REMINDER_SCAN, ageSeconds: 90 * DAY, userId: t.userIds.employee });
    const period = seedPeriod();
    t.db
      .prepare(
        `INSERT INTO reminder_occurrences (id, user_id, pay_period_id, kind, occurrence_key, disposition, job_id, decided_at)
         VALUES ('occ-ret-2', ?, ?, 'overdue', 'synthetic', 'enqueued', ?, ?)`,
      )
      .run(t.userIds.employee, period, referenced, before(90 * DAY));
    openWindow(NOW);
    refused(referenced);
  });

  it('allows an eligible row only while the window is open, with the cut-off computed from its instant', () => {
    const eligible = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 31 * DAY });
    refused(eligible);
    openWindow(NOW);
    expect(t.db.prepare('DELETE FROM jobs WHERE id = ?').run(eligible).changes).toBe(1);
    t.db.prepare('UPDATE job_retention_window SET as_of = NULL WHERE id = 1').run();
    const another = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 31 * DAY });
    refused(another);
  });

  it('keeps the other job guards: identity and closed rows still refuse UPDATE', () => {
    const closed = seedJob({ kind: JOB_DEADLINE_SCAN, ageSeconds: 31 * DAY });
    expect(() => t.db.prepare("UPDATE jobs SET business_key = 'other' WHERE id = ?").run(closed)).toThrow(/immutable_job|job_closed/);
    expect(() => t.db.prepare("UPDATE jobs SET last_error = 'x' WHERE id = ?").run(closed)).toThrow(/job_closed/);
  });

  it('keeps the window a single row that cannot be deleted or added to', () => {
    expect(() => t.db.prepare('DELETE FROM job_retention_window').run()).toThrow();
    expect(() => t.db.prepare('INSERT INTO job_retention_window (id, as_of) VALUES (2, NULL)').run()).toThrow();
    expect(() => t.db.prepare("UPDATE job_retention_window SET as_of = 'not-a-date' WHERE id = 1").run()).toThrow();
  });
});

describe('migration 0011', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'timesheet-m11-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('is the next migration, named and checksummed like the others', () => {
    expect(MIGRATIONS[10]).toMatchObject({ version: 11, name: 'job_retention' });
  });

  it('applies on a fresh database from 1 to the latest (12)', () => {
    const db = openDatabase(join(dir, 'fresh.db'));
    try {
      expect(migrate(db, MIGRATIONS, new Date('2026-10-20T12:00:00Z')).version).toBe(12);
      expect(db.pragma('user_version', { simple: true })).toBe(12);
      expect(db.prepare('SELECT count(*) FROM job_retention_window').pluck().get()).toBe(1);
    } finally {
      db.close();
    }
  });

  it('upgrades a populated version 10 database, keeping every job row, and the exception then applies', () => {
    const db = openDatabase(join(dir, 'upgrade.db'));
    try {
      migrate(db, MIGRATIONS.filter((migration) => migration.version <= 10), new Date('2026-10-04T12:00:00Z'));
      const insert = db.prepare(
        `INSERT INTO jobs (id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
         VALUES (?, ?, ?, '{}', ?, 1, '2026-08-01T00:00:00Z', '2026-08-01T00:00:00Z', '2026-08-01T00:00:00Z')`,
      );
      insert.run('old-scan', JOB_DEADLINE_SCAN, 'deadline_scan:old', 'succeeded');
      insert.run('old-send', 'send_email', 'send_email:old', 'succeeded');
      expect(() => db.prepare("DELETE FROM jobs WHERE id = 'old-scan'").run()).toThrow(/immutable_job/);
      expect(migrate(db, MIGRATIONS, new Date('2026-10-20T12:00:00Z'))).toEqual({ applied: [11, 12], version: 12 });
      expect(db.prepare('SELECT id FROM jobs ORDER BY id').pluck().all()).toEqual(['old-scan', 'old-send']);
      // Closed: the migration alone deletes nothing, and the same guards hold.
      expect(() => db.prepare("DELETE FROM jobs WHERE id = 'old-scan'").run()).toThrow(/immutable_job/);
      db.prepare("UPDATE job_retention_window SET as_of = '2026-10-20T12:00:00Z' WHERE id = 1").run();
      expect(db.prepare("DELETE FROM jobs WHERE id = 'old-scan'").run().changes).toBe(1);
      expect(() => db.prepare("DELETE FROM jobs WHERE id = 'old-send'").run()).toThrow(/immutable_job/);
    } finally {
      db.close();
    }
  });
});
