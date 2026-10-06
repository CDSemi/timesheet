import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate, MigrationError, migrationChecksum } from '../../src/server/db/migrations.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { getHistory } from '../../src/server/services/history.ts';
import { getBalance, postCredit } from '../../src/server/services/ledger.ts';
import { granteeChangesForReview } from '../../src/server/services/sharedActs.ts';
import { MutableClock } from '../support/testApp.ts';

const EXPECTED_TABLES = [
  'attachments',
  'audit_events',
  'auth_sessions',
  'bootstrap_state',
  'calendar_versions',
  'calendars',
  'day_entries',
  'delivery_attempts',
  'jobs',
  'operations_state',
  'ot_leave_requests',
  'ot_ledger',
  'pay_periods',
  'payroll_exceptions',
  'reminder_occurrences',
  'revision_files',
  'revision_ledger_lines',
  'schema_migrations',
  'session_breaks',
  'signoffs',
  'submission_settings',
  'timesheet_revisions',
  'timesheet_shares',
  'timesheets',
  'users',
  'work_policies',
  'work_sessions',
];

/** Tables created by migrations 0001-0005 (before 0006 adds the share records and 0008 the bootstrap state). */
const V5_TABLES = EXPECTED_TABLES.filter((name) => name !== 'timesheet_shares' && name !== 'bootstrap_state');

/** Tables created by migrations 0001-0003 (the schema of the accepted WP2 source 5fafeae). */
const V3_TABLES = [
  'audit_events',
  'auth_sessions',
  'calendar_versions',
  'calendars',
  'day_entries',
  'ot_leave_requests',
  'ot_ledger',
  'pay_periods',
  'payroll_exceptions',
  'schema_migrations',
  'session_breaks',
  'timesheets',
  'users',
  'work_policies',
  'work_sessions',
];

/** Columns of timesheets before migration 0004 adds imported_unverified. */
const V3_TIMESHEET_COLUMNS = 'id, user_id, pay_period_id, version, finalized_revision_no, created_at, updated_at';

/** Columns of audit_events before migration 0007 adds via_share_id. */
const V6_AUDIT_COLUMNS = 'id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json';

/** Latest schema version; every migration is applied in order from 1. */
const LATEST = MIGRATIONS.length;
const ALL_VERSIONS = MIGRATIONS.map((migration) => migration.version);

/** The migrations of the WP4-T02 schema (0001-0007), for the tests that pin what 0006 and 0007 did on their own. */
const UP_TO_7 = MIGRATIONS.filter((migration) => migration.version <= 7);

let dir: string;
let db: Db;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'timesheet-migrate-'));
  db = openDatabase(join(dir, 'fresh.db'));
});

afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function expectSqliteError(action: () => unknown, pattern: RegExp): void {
  expect(action).toThrow(pattern);
}

describe('fresh SQLite migrations', () => {
  it('applies every migration to an empty file database with the required pragmas', () => {
    expect(LATEST).toBe(9);
    expect(migrate(db)).toEqual({ applied: ALL_VERSIONS, version: LATEST });
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .pluck()
      .all();
    expect(tables).toEqual(EXPECTED_TABLES);
    expect(db.pragma('user_version', { simple: true })).toBe(LATEST);
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    expect(db.pragma('busy_timeout', { simple: true })).toBe(5000);
    expect(db.pragma('synchronous', { simple: true })).toBe(2);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    const recorded = db.prepare('SELECT version, name, checksum FROM schema_migrations ORDER BY version').all();
    expect(recorded).toEqual(
      MIGRATIONS.map((migration) => ({
        version: migration.version,
        name: migration.name,
        checksum: createHash('sha256').update(migration.sql).digest('hex'),
      })),
    );
    expect(MIGRATIONS.map((migration) => migration.name)).toEqual([
      'initial',
      'ot_ledger',
      'day_entry_source',
      'submission',
      'automatic_presentation',
      'timesheet_shares',
      'audit_access',
      'bootstrap',
      'operations_backup',
    ]);
    const strictTables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND sql LIKE '%) STRICT' ORDER BY name")
      .pluck()
      .all();
    expect(strictTables).toEqual(EXPECTED_TABLES);
  });

  it('is idempotent: a second run applies nothing', () => {
    migrate(db);
    expect(migrate(db)).toEqual({ applied: [], version: LATEST });
  });

  it('refuses a database whose applied migration checksum changed', () => {
    migrate(db);
    db.prepare("UPDATE schema_migrations SET checksum = 'tampered' WHERE version = 1").run();
    expect(() => migrate(db)).toThrow(MigrationError);
  });

  it('refuses a database newer than the application (no silent downgrade)', () => {
    migrate(db);
    db.prepare("INSERT INTO schema_migrations VALUES (?, 'future', 'x', '2026-09-29T00:00:00Z')").run(LATEST + 1);
    expect(() => migrate(db)).toThrow(/newer than this application/);
  });

  it('rolls back a failing migration completely', () => {
    const broken = [
      ...MIGRATIONS,
      { version: LATEST + 1, name: 'broken', sql: 'CREATE TABLE ok_table (x INTEGER); SELECT * FROM missing_table;' },
    ];
    migrate(db);
    expect(() => migrate(db, broken)).toThrow();
    expect(db.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'ok_table'").pluck().get()).toBe(0);
    expect(db.pragma('user_version', { simple: true })).toBe(LATEST);
  });

  it('also migrates an in-memory database', () => {
    const memory = openDatabase(':memory:');
    try {
      expect(migrate(memory).version).toBe(LATEST);
    } finally {
      memory.close();
    }
  });
});

describe('committed migrations', () => {
  // Checksums recorded by databases created at WP1 (0001), the accepted WP2 source 5fafeae (0002, 0003), WP3-T01 (0004)
  // and WP3-T07B (0005).
  it.each([
    [1, 'initial', '1c0b248d74c4d83a11282dee28aaf056ae083fb12e0d5b5534cfebd7f2f0c9b5'],
    [2, 'ot_ledger', 'e9a6b285ba8fa97883e6481c700b2c0ac4d0bd9b9ee4f75acfd93b551d9da0c3'],
    [3, 'day_entry_source', '773cbb3dd33936b276353f12296cf679729188bd2bebd4b8c8f34e10c0bace06'],
    [4, 'submission', '73563328032f2d909d16f572130dca14f42804b661fd463daca474c45486457c'],
    [5, 'automatic_presentation', 'e21e195ffc60d71b89a6f032bbf3dca62fb873f1919d934fe0b63b873ebfa14d'],
    [6, 'timesheet_shares', '0a18bceb3d7e3ab05b89c7eed9ef5fe47eba140de9b0d10f30683ecbed5fa261'],
    [7, 'audit_access', '3a3ba17476499ca3ed4e471695aa503ae8c0672a308861067c57996b491a8cc9'],
    [8, 'bootstrap', 'f4234f30b8642cd6c66c3d7490c85d426296f797cb79a7b525525f19d2556cde'],
  ])('never edits migration %i (%s): its checksum stays pinned', (version, name, checksum) => {
    const migration = MIGRATIONS.find((item) => item.version === version);
    if (migration === undefined) throw new Error(`migration ${version} missing`);
    expect(migration.name).toBe(name);
    expect(migrationChecksum(migration)).toBe(checksum);
  });
});

describe('upgrade from a populated WP1 (version 1) database', () => {
  const WP1_TABLES = V3_TABLES.filter((name) => !name.startsWith('ot_'));
  const AT = '2026-09-29T20:00:00Z';
  const WP1_DAY_ENTRY_COLUMNS =
    'id, user_id, timesheet_id, work_date, category, leave_minutes, wfh, notes, version, created_at, updated_at';

  /** Every row of every WP1 table, in storage order, for a before/after comparison. */
  function snapshot(target: Db): Record<string, unknown[]> {
    return Object.fromEntries(
      WP1_TABLES.map((name) => [
        name,
        // 0003 adds columns to day_entries, 0004 to timesheets and 0007 to audit_events; the WP1 columns are compared by name.
        target
          .prepare(
            `SELECT ${name === 'day_entries' ? WP1_DAY_ENTRY_COLUMNS : name === 'timesheets' ? V3_TIMESHEET_COLUMNS : name === 'audit_events' ? V6_AUDIT_COLUMNS : '*'} FROM ${name} ORDER BY rowid`,
          )
          .all(),
      ]),
    );
  }

  it('applies 0002-0009, keeps every WP1 row unchanged and leaves a consistent, usable schema', async () => {
    const wp1 = MIGRATIONS.filter((migration) => migration.version === 1);
    expect(migrate(db, wp1)).toEqual({ applied: [1], version: 1 });
    const seed = await seedSynthetic(db, new MutableClock(AT), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass' },
    });
    const employee = seed.users.find((user) => user.role === 'employee')?.id ?? '';
    db.prepare(
      `INSERT INTO pay_periods VALUES ('p1', ?, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27',
         '2026-09-29', '17:00', '2026-09-30T00:00:00Z', 0, ?)`,
    ).run(seed.calendarId, AT);
    db.prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES ('ts1', ?, 'p1', 3, ?, ?)`,
    ).run(employee, AT, AT);
    db.prepare(
      `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, leave_minutes, wfh, notes, version, created_at, updated_at)
       VALUES ('d1', ?, 'ts1', '2026-09-21', 'Worked', 120, 1, 'Synthetic note', 2, ?, ?)`,
    ).run(employee, AT, AT);
    db.prepare(
      `INSERT INTO work_sessions (id, user_id, work_date, start_utc, end_utc, input_zone, source, breaks_confirmed, created_at, updated_at)
       VALUES ('s1', ?, '2026-09-21', '2026-09-21T16:00:00Z', '2026-09-22T01:00:00Z', 'America/Los_Angeles', 'clock', 1, ?, ?)`,
    ).run(employee, AT, AT);
    db.prepare(
      `INSERT INTO session_breaks (id, session_id, user_id, start_utc, end_utc, counts_as_work)
       VALUES ('b1', 's1', ?, '2026-09-21T20:00:00Z', '2026-09-21T20:30:00Z', 0)`,
    ).run(employee);
    db.prepare(
      `INSERT INTO audit_events (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json)
       VALUES ('a1', ?, ?, ?, 'session.create', 'work_session', 's1', NULL, NULL, '{"id":"s1"}')`,
    ).run(AT, employee, employee);
    const before = snapshot(db);
    for (const name of ['users', 'calendar_versions', 'work_policies', 'timesheets', 'day_entries', 'work_sessions', 'session_breaks']) {
      expect(before[name]?.length, name).toBeGreaterThan(0);
    }

    expect(migrate(db, MIGRATIONS, new Date('2026-10-02T18:00:00Z'))).toEqual({ applied: [2, 3, 4, 5, 6, 7, 8, 9], version: 9 });

    const after = snapshot(db);
    // schema_migrations gains exactly one row; WP1 rows (including migration 1's record) are unchanged.
    expect(after.schema_migrations?.slice(0, 1)).toEqual(before.schema_migrations);
    expect(after.schema_migrations?.slice(1)).toEqual([
      expect.objectContaining({ version: 2, name: 'ot_ledger', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 3, name: 'day_entry_source', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 4, name: 'submission', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 5, name: 'automatic_presentation', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 6, name: 'timesheet_shares', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 7, name: 'audit_access', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 8, name: 'bootstrap', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 9, name: 'operations_backup', applied_at: '2026-10-02T18:00:00Z' }),
    ]);
    expect({ ...after, schema_migrations: [] }).toEqual({ ...before, schema_migrations: [] });
    // WP1 rows are conservatively explicit (an employee may have chosen the label) and carry no leave kind.
    expect(db.prepare('SELECT id, leave_minutes, category_source, leave_kind FROM day_entries').all()).toEqual([
      { id: 'd1', leave_minutes: 120, category_source: 'explicit', leave_kind: null },
    ]);
    expect(db.pragma('user_version', { simple: true })).toBe(9);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
    expect(db.prepare('SELECT count(*) FROM ot_ledger').pluck().get()).toBe(0);
    expect(db.prepare('SELECT count(*) FROM ot_leave_requests').pluck().get()).toBe(0);

    // Existing WP1 users can post immediately after the upgrade.
    postCredit(
      { db, clock: new MutableClock('2026-10-02T18:00:00Z') },
      { userId: employee, sourceKey: 'upgrade-check', minutes: 30, workDate: '2026-09-21', actorUserId: employee, origin: 'manual' },
    );
    expect(getBalance(db, employee).postedMinutes).toBe(30);
    expect(migrate(db)).toEqual({ applied: [], version: 9 });
    // The upgraded row stays editable: leave minutes now need a kind, and the row stays usable by work sessions.
    db.prepare("UPDATE day_entries SET leave_kind = 'ot', version = version + 1 WHERE id = 'd1'").run();
    expect(db.prepare("SELECT s.id FROM work_sessions s JOIN day_entries d ON d.user_id = s.user_id AND d.work_date = s.work_date WHERE d.id = 'd1'").pluck().all()).toEqual(['s1']);
  });

  it('also upgrades a version 2 database that already holds WP2 ledger rows', async () => {
    const upToLedger = MIGRATIONS.filter((migration) => migration.version <= 2);
    expect(migrate(db, upToLedger)).toEqual({ applied: [1, 2], version: 2 });
    const seed = await seedSynthetic(db, new MutableClock(AT), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass' },
    });
    const employee = seed.users.find((user) => user.role === 'employee')?.id ?? '';
    postCredit(
      { db, clock: new MutableClock(AT) },
      { userId: employee, sourceKey: 'before-upgrade', minutes: 45, workDate: '2026-09-21', actorUserId: employee, origin: 'manual' },
    );
    expect(migrate(db, MIGRATIONS)).toEqual({ applied: [3, 4, 5, 6, 7, 8, 9], version: 9 });
    expect(getBalance(db, employee).postedMinutes).toBe(45);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
  });
});

describe('schema invariants', () => {
  let ids: { admin: string; employee: string; calendar: string };

  beforeEach(async () => {
    migrate(db);
    const seed = await seedSynthetic(db, new MutableClock('2026-09-29T20:00:00Z'), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass' },
    });
    ids = {
      admin: seed.users.find((user) => user.role === 'admin')?.id ?? '',
      employee: seed.users.find((user) => user.role === 'employee')?.id ?? '',
      calendar: seed.calendarId ?? '',
    };
  });

  function insertTimesheet(userId: string): string {
    const periodId = `period-${userId}`;
    db.prepare(
      `INSERT OR IGNORE INTO pay_periods VALUES ('p1', ?, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27',
         '2026-09-29', '17:00', '2026-09-30T00:00:00Z', 0, '2026-09-29T20:00:00Z')`,
    ).run(ids.calendar);
    db.prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, created_at, updated_at)
       VALUES (?, ?, 'p1', '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
    ).run(periodId, userId);
    return periodId;
  }

  function insertDay(userId: string, timesheetId: string, date: string): void {
    db.prepare(
      `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Worked', '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
    ).run(`day-${userId}-${date}`, userId, timesheetId, date);
  }

  function insertSession(id: string, userId: string, date: string, start: string, end: string | null): void {
    db.prepare(
      `INSERT INTO work_sessions (id, user_id, work_date, start_utc, end_utc, input_zone, source, breaks_confirmed,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'America/Los_Angeles', 'manual', 1, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
    ).run(id, userId, date, start, end);
  }

  it('enforces STRICT column types (no fractional minutes)', () => {
    expectSqliteError(
      () =>
        db
          .prepare(
            `INSERT INTO work_policies (id, user_id, seq, effective_from, required_minutes, threshold_minutes,
               rounding_step_minutes, reference_start, reference_end, breaks, deficit_mode, created_by, created_at)
             VALUES ('x', ?, 9, '2026-10-01', 480, 30, 7.5, '08:00', '17:00', '[]', 'ignore', ?, '2026-09-29T20:00:00Z')`,
          )
          .run(ids.employee, ids.employee),
      /cannot store REAL value in INTEGER column/,
    );
  });

  it('constrains the day-entry category source and leave kind (migration 0003)', () => {
    const sheet = insertTimesheet(ids.employee);
    const insert = (id: string, date: string, source: string, leaveMinutes: number, leaveKind: string | null) =>
      db
        .prepare(
          `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, leave_minutes, category_source,
             leave_kind, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'Worked', ?, ?, ?, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
        )
        .run(id, ids.employee, sheet, date, leaveMinutes, source, leaveKind);
    // Omitted columns default to the conservative explicit source and no leave kind.
    insertDay(ids.employee, sheet, '2026-09-21');
    expect(db.prepare('SELECT category_source, leave_kind FROM day_entries').get()).toEqual({
      category_source: 'explicit',
      leave_kind: null,
    });
    insert('d-default', '2026-09-22', 'default', 0, null);
    insert('d-ot', '2026-09-23', 'explicit', 60, 'ot');
    expectSqliteError(() => insert('d-source', '2026-09-24', 'imported', 0, null), /CHECK constraint failed/);
    expectSqliteError(() => insert('d-kind', '2026-09-25', 'explicit', 60, 'ot-funded'), /CHECK constraint failed/);
    expectSqliteError(() => insert('d-orphan', '2026-09-28', 'explicit', 0, 'vacation'), /leave_kind_without_minutes/);
    expectSqliteError(
      () => db.prepare("UPDATE day_entries SET leave_minutes = 0 WHERE id = 'd-ot'").run(),
      /leave_kind_without_minutes/,
    );
  });

  it('keeps policy/calendar versions, audit events and the payroll rhythm immutable', () => {
    expectSqliteError(() => db.prepare('UPDATE work_policies SET threshold_minutes = 0').run(), /immutable_policy_version/);
    expectSqliteError(() => db.prepare('DELETE FROM work_policies').run(), /immutable_policy_version/);
    expectSqliteError(() => db.prepare("UPDATE calendar_versions SET weekdays = '[1]'").run(), /immutable_calendar_version/);
    expectSqliteError(() => db.prepare('DELETE FROM calendar_versions').run(), /immutable_calendar_version/);
    expectSqliteError(() => db.prepare("UPDATE audit_events SET reason = 'x'").run(), /immutable_audit_event/);
    expectSqliteError(() => db.prepare('DELETE FROM audit_events').run(), /immutable_audit_event/);
    expectSqliteError(
      () => db.prepare("UPDATE calendars SET reporting_zone = 'Asia/Ho_Chi_Minh'").run(),
      /immutable_payroll_schedule/,
    );
  });

  it('binds every day entry, session and break to one owner through composite foreign keys', () => {
    const adminSheet = insertTimesheet(ids.admin);
    insertDay(ids.admin, adminSheet, '2026-09-21');
    // A day entry of one user cannot point at another user's timesheet.
    expectSqliteError(() => insertDay(ids.employee, adminSheet, '2026-09-21'), /FOREIGN KEY constraint failed/);
    // A session needs its owner's own day entry for that date.
    expectSqliteError(
      () => insertSession('s-emp', ids.employee, '2026-09-21', '2026-09-21T16:00:00Z', '2026-09-21T17:00:00Z'),
      /FOREIGN KEY constraint failed/,
    );
    insertSession('s-admin', ids.admin, '2026-09-21', '2026-09-21T16:00:00Z', '2026-09-21T17:00:00Z');
    // A break row cannot claim another user's session.
    expectSqliteError(
      () =>
        db
          .prepare(
            `INSERT INTO session_breaks (id, session_id, user_id, start_utc, end_utc, counts_as_work)
             VALUES ('b1', 's-admin', ?, '2026-09-21T16:10:00Z', '2026-09-21T16:20:00Z', 0)`,
          )
          .run(ids.employee),
      /break_outside_session|FOREIGN KEY/,
    );
    expectSqliteError(() => db.prepare("UPDATE work_sessions SET user_id = ? WHERE id = 's-admin'").run(ids.employee), /immutable_session_owner/);
  });

  it('rejects overlapping sessions of the same user in the database, even across work dates', () => {
    const adminSheet = insertTimesheet(ids.admin);
    insertDay(ids.admin, adminSheet, '2026-09-21');
    insertDay(ids.admin, adminSheet, '2026-09-22');
    insertSession('a1', ids.admin, '2026-09-21', '2026-09-21T15:00:00Z', '2026-09-21T17:00:00Z');
    expectSqliteError(
      () => insertSession('a2', ids.admin, '2026-09-22', '2026-09-21T16:00:00Z', '2026-09-21T18:00:00Z'),
      /overlapping_user_intervals/,
    );
    // Half-open intervals: touching end/start is allowed.
    insertSession('a3', ids.admin, '2026-09-21', '2026-09-21T17:00:00Z', '2026-09-21T18:00:00Z');
    // An open session blocks anything after its start.
    insertSession('a4', ids.admin, '2026-09-22', '2026-09-22T15:00:00Z', null);
    expectSqliteError(
      () => insertSession('a5', ids.admin, '2026-09-22', '2026-09-22T20:00:00Z', '2026-09-22T21:00:00Z'),
      /overlapping_user_intervals/,
    );
    // Another user's identical interval is independent.
    const employeeSheet = `period-${ids.employee}`;
    db.prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, created_at, updated_at)
       VALUES (?, ?, 'p1', '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')`,
    ).run(employeeSheet, ids.employee);
    insertDay(ids.employee, employeeSheet, '2026-09-21');
    insertSession('e1', ids.employee, '2026-09-21', '2026-09-21T15:00:00Z', '2026-09-21T17:00:00Z');
  });
});

describe('upgrade from a populated version 3 database (accepted WP2 source 5fafeae)', () => {
  const AT = '2026-09-29T20:00:00Z';

  /** Every row of every version 3 table, in storage order, for a before/after comparison. */
  function snapshotV3(target: Db): Record<string, unknown[]> {
    return Object.fromEntries(
      V3_TABLES.filter((name) => name !== 'schema_migrations').map((name) => [
        name,
        target.prepare(`SELECT ${name === 'timesheets' ? V3_TIMESHEET_COLUMNS : name === 'audit_events' ? V6_AUDIT_COLUMNS : '*'} FROM ${name} ORDER BY rowid`).all(),
      ]),
    );
  }

  it('applies 0004-0009 with unchanged rows and counts, a consistent schema and safe defaults', async () => {
    // 0001-0003 are byte-identical to 5fafeae (checksums pinned above), so this builds the same schema.
    const v3 = MIGRATIONS.filter((migration) => migration.version <= 3);
    expect(migrate(db, v3)).toEqual({ applied: [1, 2, 3], version: 3 });
    const clock = new MutableClock(AT);
    const seed = await seedSynthetic(db, clock, {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass', employee2: 'synthetic-employee2-pass' },
      sampleData: true,
    });
    const employee = seed.users.find((user) => user.role === 'employee')?.id ?? '';
    postCredit(
      { db, clock },
      { userId: employee, sourceKey: 'v3-credit', minutes: 45, workDate: '2026-09-21', actorUserId: employee, origin: 'manual' },
    );
    const before = snapshotV3(db);
    for (const name of ['users', 'timesheets', 'day_entries', 'work_sessions', 'session_breaks', 'ot_ledger', 'ot_leave_requests']) {
      expect(before[name]?.length, name).toBeGreaterThan(0);
    }
    const balances = seed.users.map((user) => getBalance(db, user.id));

    expect(migrate(db, MIGRATIONS, new Date('2026-10-04T18:00:00Z'))).toEqual({ applied: [4, 5, 6, 7, 8, 9], version: 9 });

    expect(snapshotV3(db)).toEqual(before);
    expect(seed.users.map((user) => getBalance(db, user.id))).toEqual(balances);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
    expect(db.pragma('user_version', { simple: true })).toBe(9);
    // Existing timesheets are not imported history; automation stays inactive until the owner records it.
    expect(db.prepare('SELECT DISTINCT imported_unverified FROM timesheets').pluck().all()).toEqual([0]);
    expect(db.prepare('SELECT * FROM operations_state').all()).toEqual([
      {
        id: 1,
        automation_active_from: null,
        automation_recorded_at: null,
        automation_recorded_by: null,
        runner_heartbeat_at: null,
        runner_instance: null,
        backup_last_attempt_at: null,
        backup_last_outcome: null,
        backup_last_fault_code: null,
        backup_last_success_at: null,
      },
    ]);
    for (const name of EXPECTED_TABLES.filter((table) => !V3_TABLES.includes(table) && table !== 'operations_state')) {
      expect(db.prepare(`SELECT count(*) FROM ${name}`).pluck().get(), name).toBe(0);
    }
    expect(migrate(db)).toEqual({ applied: [], version: 9 });
  });
});

describe('schema invariants', () => {
  const AT = '2026-10-02T18:00:00Z';
  const HASH_A = 'a'.repeat(64);
  const HASH_B = 'b'.repeat(64);
  let employee: string;
  let admin: string;
  let ledgerEntryId: string;

  type Row = Record<string, string | number | null>;

  function insert(table: string, row: Row): void {
    const columns = Object.keys(row);
    db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).run(
      ...Object.values(row),
    );
  }

  function attachment(id: string, userId: string, overrides: Row = {}): void {
    insert('attachments', {
      id,
      user_id: userId,
      kind: 'signature',
      storage_key: `key_${id}_0123456789abcdef`,
      sha256: HASH_A,
      mime_type: 'image/png',
      size_bytes: 2048,
      width_px: 600,
      height_px: 200,
      created_at: AT,
      ...overrides,
    });
  }

  function pdfAttachment(id: string, userId: string, overrides: Row = {}): void {
    attachment(id, userId, { kind: 'pdf', mime_type: 'application/pdf', width_px: null, height_px: null, ...overrides });
  }

  function revision(id: string, userId: string, timesheetId: string, overrides: Row = {}): void {
    insert('timesheet_revisions', {
      id,
      user_id: userId,
      timesheet_id: timesheetId,
      revision_no: 1,
      revision_kind: 'original',
      origin: 'employee',
      review_state: 'signed',
      supersedes_revision_id: null,
      correction_reason: null,
      timesheet_version: 3,
      payload_json: '{"days":[]}',
      payload_sha256: HASH_A,
      reviewed_sha256: HASH_A,
      send_requested: 1,
      actor_user_id: userId,
      created_at: AT,
      ...overrides,
    });
  }

  function correction(id: string, userId: string, timesheetId: string, overrides: Row = {}): void {
    revision(id, userId, timesheetId, {
      revision_no: 2,
      revision_kind: 'correction',
      supersedes_revision_id: 'rev-emp-1',
      correction_reason: 'Synthetic correction',
      ...overrides,
    });
  }

  function signoff(id: string, revisionId: string, overrides: Row = {}): void {
    insert('signoffs', {
      id,
      user_id: employee,
      revision_id: revisionId,
      signer_name: 'Example Employee',
      signed_at: AT,
      reviewed_sha256: HASH_A,
      signature_attachment_id: 'sig-emp',
      ...overrides,
    });
  }

  function job(id: string, userId: string | null, overrides: Row = {}): void {
    insert('jobs', {
      id,
      user_id: userId,
      revision_id: null,
      kind: 'send_submission',
      business_key: `business:${id}`,
      payload_json: '{}',
      state: 'queued',
      attempts: 0,
      next_run_at: AT,
      lease_owner: null,
      lease_expires_at: null,
      last_error: null,
      created_at: AT,
      updated_at: AT,
      ...overrides,
    });
  }

  function attempt(id: string, jobId: string, userId: string, overrides: Row = {}): void {
    insert('delivery_attempts', {
      id,
      job_id: jobId,
      user_id: userId,
      revision_id: 'rev-emp-1',
      attempt_no: 1,
      channel: 'email',
      envelope_json: '{"to":["manager@example.invalid"]}',
      attachment_id: 'pdf-emp',
      message_id: '<rev-emp-1.1@example.invalid>',
      provider_message_id: null,
      state: 'preparing',
      provider_response: null,
      accepted_at: null,
      decision: null,
      decision_actor_user_id: null,
      decided_at: null,
      started_at: AT,
      updated_at: AT,
      ...overrides,
    });
  }

  function settings(id: string, userId: string, seq: number, overrides: Row = {}): void {
    insert('submission_settings', {
      id,
      user_id: userId,
      seq,
      recipients_to: '["manager@example.invalid"]',
      recipients_cc: '[]',
      subject_template: 'Timesheet {EmployeeName} {PayrollDate} r{Revision}',
      body_template: 'Hello,\n\nAttached.\n{EmployeeName}',
      template_version: 1,
      auto_submit: 1,
      auto_submit_effective_from: AT,
      auto_image_authorized: 0,
      auto_image_attachment_id: null,
      auto_image_authorized_at: null,
      show_ot_on_pdf: 1,
      reminder_offsets_minutes: '[1440,120]',
      created_by: userId,
      created_at: AT,
      ...overrides,
    });
  }

  function ledgerLine(id: string, overrides: Row = {}): void {
    insert('revision_ledger_lines', {
      id,
      user_id: employee,
      revision_id: 'rev-emp-1',
      work_date: '2026-09-21',
      line_kind: 'credit',
      proposed_minutes: 30,
      outcome: 'posted',
      ledger_entry_id: ledgerEntryId,
      created_at: AT,
      ...overrides,
    });
  }

  function revisionFile(id: string, userId: string, overrides: Row = {}): void {
    insert('revision_files', {
      id,
      user_id: userId,
      revision_id: 'rev-emp-1',
      kind: 'pdf',
      state: 'pending',
      attachment_id: null,
      last_error: null,
      created_at: AT,
      updated_at: AT,
      ...overrides,
    });
  }

  function occurrence(id: string, userId: string, overrides: Row = {}): void {
    insert('reminder_occurrences', {
      id,
      user_id: userId,
      pay_period_id: 'p1',
      kind: 'before_due',
      occurrence_key: 'before_due:120',
      disposition: 'collapsed',
      job_id: null,
      decided_at: AT,
      ...overrides,
    });
  }

  beforeEach(async () => {
    migrate(db);
    const clock = new MutableClock(AT);
    const seed = await seedSynthetic(db, clock, {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass' },
    });
    employee = seed.users.find((user) => user.role === 'employee')?.id ?? '';
    admin = seed.users.find((user) => user.role === 'admin')?.id ?? '';
    const period = db.prepare(
      `INSERT INTO pay_periods VALUES (?, ?, ?, ?, ?, ?, ?, ?, '17:00', ?, 0, ?)`,
    );
    period.run('p1', seed.calendarId, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27', '2026-09-29', '2026-09-30T00:00:00Z', AT);
    period.run('p2', seed.calendarId, 1, '2026-10-16', '2026-10-16', '2026-09-28', '2026-10-11', '2026-10-13', '2026-10-14T00:00:00Z', AT);
    const sheet = db.prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES (?, ?, ?, 3, ?, ?)`,
    );
    sheet.run('ts-emp', employee, 'p1', AT, AT);
    sheet.run('ts-emp-p2', employee, 'p2', AT, AT);
    sheet.run('ts-adm', admin, 'p1', AT, AT);
    sheet.run('ts-adm-p2', admin, 'p2', AT, AT);
    attachment('sig-emp', employee);
    attachment('sig-adm', admin);
    pdfAttachment('pdf-emp', employee, { sha256: HASH_B });
    revision('rev-emp-1', employee, 'ts-emp');
    revision('rev-adm-1', admin, 'ts-adm');
    const credit = postCredit(
      { db, clock },
      { userId: employee, sourceKey: 'orig:ts-emp:2026-09-21:credit', minutes: 30, workDate: '2026-09-21', actorUserId: employee, origin: 'manual' },
    );
    ledgerEntryId = credit.entry.id;
  });

  it('creates STRICT tables whose columns hold no secret, credential or image body', () => {
    const added = V5_TABLES.filter((name) => !V3_TABLES.includes(name));
    expect(added).toHaveLength(10);
    for (const table of added) {
      const columns = db.prepare('SELECT name, type FROM pragma_table_info(?)').all(table) as Array<{ name: string; type: string }>;
      expect(columns.length, table).toBeGreaterThan(0);
      for (const column of columns) {
        expect(['TEXT', 'INTEGER'], `${table}.${column.name}`).toContain(column.type);
        expect(column.name, `${table}.${column.name}`).not.toMatch(/pass|secret|token|credential|smtp|blob|image_data|bytes_b64/);
      }
    }
    expect(db.prepare("SELECT name FROM pragma_table_info('timesheets')").pluck().all()).toContain('imported_unverified');
  });

  it('keeps timesheets.imported_unverified a 0/1 flag defaulting to 0', () => {
    expect(db.prepare("SELECT imported_unverified FROM timesheets WHERE id = 'ts-emp'").pluck().get()).toBe(0);
    expectSqliteError(
      () => db.prepare("UPDATE timesheets SET imported_unverified = 2 WHERE id = 'ts-emp'").run(),
      /CHECK constraint failed/,
    );
    db.prepare("UPDATE timesheets SET imported_unverified = 1 WHERE id = 'ts-adm'").run();
  });

  it('refuses UPDATE and DELETE on every immutable table', () => {
    settings('set-emp-1', employee, 1);
    signoff('so-emp-1', 'rev-emp-1');
    ledgerLine('line-1');
    job('job-rem', employee, { kind: 'send_reminder', business_key: 'reminder:emp:p1:before_due:1440' });
    occurrence('rem-1', employee, { occurrence_key: 'before_due:1440', disposition: 'enqueued', job_id: 'job-rem' });
    const cases: Array<[string, string, RegExp]> = [
      ['attachments', 'size_bytes = 1', /immutable_attachment/],
      ['submission_settings', 'auto_submit = 0', /immutable_submission_settings/],
      ['timesheet_revisions', "correction_reason = 'x'", /immutable_revision/],
      ['signoffs', "signer_name = 'Other'", /immutable_signoff/],
      ['revision_ledger_lines', 'proposed_minutes = 99', /immutable_revision_ledger_line/],
      ['reminder_occurrences', "disposition = 'suppressed'", /immutable_reminder_occurrence/],
    ];
    for (const [table, assignment, pattern] of cases) {
      expect(db.prepare(`SELECT count(*) FROM ${table}`).pluck().get(), table).toBeGreaterThan(0);
      expectSqliteError(() => db.prepare(`UPDATE ${table} SET ${assignment}`).run(), pattern);
      expectSqliteError(() => db.prepare(`DELETE FROM ${table}`).run(), pattern);
    }
  });

  it('refuses DELETE on the mutable delivery history and the operations row', () => {
    revisionFile('rf-1', employee);
    job('job-1', employee, { revision_id: 'rev-emp-1' });
    attempt('att-1', 'job-1', employee);
    expectSqliteError(() => db.prepare('DELETE FROM revision_files').run(), /immutable_revision_file/);
    expectSqliteError(() => db.prepare('DELETE FROM jobs').run(), /immutable_job/);
    expectSqliteError(() => db.prepare('DELETE FROM delivery_attempts').run(), /immutable_delivery_attempt/);
    expectSqliteError(() => db.prepare('DELETE FROM operations_state').run(), /immutable_operations_state/);
  });

  it('enforces the unique business keys', () => {
    // Revision number per timesheet.
    expectSqliteError(
      () => revision('rev-emp-dup', employee, 'ts-emp'),
      /UNIQUE constraint failed: timesheet_revisions.timesheet_id, timesheet_revisions.revision_no/,
    );
    // One sign-off per revision.
    signoff('so-1', 'rev-emp-1');
    expectSqliteError(() => signoff('so-2', 'rev-emp-1'), /UNIQUE constraint failed: signoffs.revision_id/);
    // Job business key.
    job('job-a', employee, { business_key: 'send:rev-emp-1:1' });
    expectSqliteError(() => job('job-b', employee, { business_key: 'send:rev-emp-1:1' }), /UNIQUE constraint failed: jobs.business_key/);
    // Reminder occurrence per user, period, kind and occurrence key.
    occurrence('rem-a', employee);
    expectSqliteError(() => occurrence('rem-b', employee), /UNIQUE constraint failed: reminder_occurrences.user_id/);
    occurrence('rem-c', employee, { occurrence_key: 'before_due:1440' });
    // One ledger line per revision, date and kind.
    ledgerLine('line-a');
    expectSqliteError(() => ledgerLine('line-b'), /UNIQUE constraint failed: revision_ledger_lines.revision_id/);
    // One file per revision and kind; one settings version number per user.
    revisionFile('rf-a', employee);
    expectSqliteError(() => revisionFile('rf-b', employee), /UNIQUE constraint failed: revision_files.revision_id/);
    settings('set-a', employee, 1);
    expectSqliteError(() => settings('set-b', employee, 1), /UNIQUE constraint failed: submission_settings.user_id, submission_settings.seq/);
    // Opaque storage keys are unique and cannot carry path characters.
    expectSqliteError(
      () => attachment('sig-dup', employee, { storage_key: 'key_sig-emp_0123456789abcdef' }),
      /UNIQUE constraint failed: attachments.storage_key/,
    );
    expectSqliteError(() => attachment('sig-path', employee, { storage_key: '../escape/0123456789abcdef' }), /CHECK constraint failed/);
    expectSqliteError(() => attachment('sig-short', employee, { storage_key: 'short' }), /CHECK constraint failed/);
    // Attempt number per job, and only one open attempt per revision.
    job('job-send', employee, { revision_id: 'rev-emp-1', business_key: 'send:rev-emp-1:2' });
    attempt('att-1', 'job-send', employee);
    expectSqliteError(
      () => attempt('att-dup', 'job-send', employee, { revision_id: null }),
      /UNIQUE constraint failed: delivery_attempts.job_id, delivery_attempts.attempt_no/,
    );
    expectSqliteError(
      () => attempt('att-2', 'job-send', employee, { attempt_no: 2 }),
      /UNIQUE constraint failed: delivery_attempts.revision_id/,
    );
  });

  it('binds every row to one owner through composite foreign keys', () => {
    const fk = /FOREIGN KEY constraint failed/;
    // A revision cannot point at another user's timesheet; a sign-off cannot use another user's image or revision.
    expectSqliteError(() => revision('rev-x', employee, 'ts-adm-p2'), fk);
    expectSqliteError(() => signoff('so-x', 'rev-emp-1', { signature_attachment_id: 'sig-adm' }), fk);
    expectSqliteError(() => signoff('so-y', 'rev-adm-1'), fk);
    expectSqliteError(
      () => settings('set-x', employee, 1, { auto_image_authorized: 1, auto_image_attachment_id: 'sig-adm', auto_image_authorized_at: AT }),
      fk,
    );
    expectSqliteError(() => ledgerLine('line-x', { user_id: admin, revision_id: 'rev-adm-1' }), fk);
    expectSqliteError(() => job('job-x', admin, { revision_id: 'rev-emp-1' }), fk);
    job('job-emp', employee, { revision_id: 'rev-emp-1' });
    expectSqliteError(() => attempt('att-x', 'job-emp', admin, { revision_id: null, attachment_id: null }), fk);
    pdfAttachment('pdf-adm', admin);
    expectSqliteError(() => attempt('att-y', 'job-emp', employee, { attachment_id: 'pdf-adm' }), fk);
    expectSqliteError(() => revisionFile('rf-x', admin), fk);
    expectSqliteError(() => occurrence('rem-x', admin, { kind: 'overdue', occurrence_key: 'overdue', disposition: 'enqueued', job_id: 'job-emp' }), fk);
    // A revision-linked job needs its owner, so the composite key is always enforced.
    expectSqliteError(() => job('job-orphan', null, { revision_id: 'rev-emp-1' }), /CHECK constraint failed/);
    // System jobs without an owner are allowed.
    job('job-system', null, { kind: 'deadline_scan' });
  });

  it('persists every revision ledger outcome, including the R4 pending variants', () => {
    correction('rev-emp-2', employee, 'ts-emp');
    ledgerLine('l-posted');
    ledgerLine('l-pending-balance', { work_date: '2026-09-22', line_kind: 'deficit_debit', proposed_minutes: -45, outcome: 'pending_insufficient_balance', ledger_entry_id: null });
    ledgerLine('l-pending-choice', { work_date: '2026-09-23', line_kind: 'deficit_debit', proposed_minutes: -15, outcome: 'pending_choice', ledger_entry_id: null });
    ledgerLine('l-waived', { work_date: '2026-09-24', line_kind: 'deficit_debit', proposed_minutes: -20, outcome: 'waived', ledger_entry_id: null });
    ledgerLine('l-unchanged', { revision_id: 'rev-emp-2', line_kind: 'correction', proposed_minutes: 0, outcome: 'unchanged', ledger_entry_id: null });
    ledgerLine('l-correction-pending', { revision_id: 'rev-emp-2', work_date: '2026-09-22', line_kind: 'correction', proposed_minutes: -10, outcome: 'pending_insufficient_balance', ledger_entry_id: null });
    expect(db.prepare('SELECT outcome FROM revision_ledger_lines ORDER BY rowid').pluck().all()).toEqual([
      'posted',
      'pending_insufficient_balance',
      'pending_choice',
      'waived',
      'unchanged',
      'pending_insufficient_balance',
    ]);
    // Outcome shape rules.
    const check = /CHECK constraint failed/;
    expectSqliteError(() => ledgerLine('l-bad-outcome', { work_date: '2026-09-25', outcome: 'duplicate' }), check);
    expectSqliteError(() => ledgerLine('l-posted-unlinked', { work_date: '2026-09-25', ledger_entry_id: null }), check);
    expectSqliteError(
      () => ledgerLine('l-pending-linked', { work_date: '2026-09-25', line_kind: 'deficit_debit', proposed_minutes: -5, outcome: 'pending_choice' }),
      check,
    );
    expectSqliteError(() => ledgerLine('l-waived-credit', { work_date: '2026-09-25', outcome: 'waived', ledger_entry_id: null }), check);
    expectSqliteError(() => ledgerLine('l-choice-credit', { work_date: '2026-09-25', outcome: 'pending_choice', ledger_entry_id: null }), check);
    expectSqliteError(() => ledgerLine('l-negative-credit', { work_date: '2026-09-25', proposed_minutes: -5 }), check);
    expectSqliteError(() => ledgerLine('l-positive-debit', { work_date: '2026-09-25', line_kind: 'deficit_debit', proposed_minutes: 5, outcome: 'waived', ledger_entry_id: null }), check);
  });

  it('keeps revisions, sign-offs and their links consistent', () => {
    const check = /CHECK constraint failed/;
    const automatic = { origin: 'deadline', review_state: 'pending', reviewed_sha256: null, actor_user_id: null } as const;
    // An automatic (deadline) revision is unsigned, actorless and original.
    expectSqliteError(() => revision('rev-auto-signed', employee, 'ts-emp-p2', { ...automatic, review_state: 'signed', reviewed_sha256: HASH_A }), check);
    expectSqliteError(() => revision('rev-auto-actor', employee, 'ts-emp-p2', { ...automatic, actor_user_id: employee }), check);
    expectSqliteError(() => correction('rev-auto-corr', employee, 'ts-emp', automatic), check);
    revision('rev-auto', employee, 'ts-emp-p2', automatic);
    // A sign-off cannot attach to the automatic revision; a late review is a new signed revision.
    expectSqliteError(() => signoff('so-auto', 'rev-auto'), /signoff_revision_mismatch/);
    expectSqliteError(
      () => revision('rev-late-pending', employee, 'ts-emp-p2', { revision_no: 2, revision_kind: 'late_review', supersedes_revision_id: 'rev-auto', review_state: 'pending', reviewed_sha256: null }),
      check,
    );
    revision('rev-late', employee, 'ts-emp-p2', { revision_no: 2, revision_kind: 'late_review', supersedes_revision_id: 'rev-auto', send_requested: 0 });
    signoff('so-late', 'rev-late');
    // A correction needs a reason; a signed revision binds the reviewed hash to the payload hash.
    expectSqliteError(() => correction('rev-no-reason', employee, 'ts-emp', { correction_reason: ' ' }), check);
    expectSqliteError(() => correction('rev-hash', employee, 'ts-emp', { reviewed_sha256: HASH_B }), check);
    expectSqliteError(() => revision('rev-orig-2', employee, 'ts-emp', { revision_no: 2 }), check);
    expectSqliteError(() => revision('rev-bad-json', employee, 'ts-emp-p2', { revision_no: 3, revision_kind: 'correction', supersedes_revision_id: 'rev-late', correction_reason: 'x', payload_json: 'not json' }), check);
    // Supersedes must be the immediate predecessor of the same timesheet.
    expectSqliteError(() => correction('rev-cross', employee, 'ts-emp-p2', { revision_no: 3, supersedes_revision_id: 'rev-emp-1' }), /invalid_revision_supersedes/);
    correction('rev-emp-2', employee, 'ts-emp');
    expectSqliteError(() => correction('rev-emp-gap', employee, 'ts-emp', { revision_no: 4, supersedes_revision_id: 'rev-emp-2' }), /invalid_revision_supersedes/);
    // Sign-off: only on a signed revision with the same reviewed hash, a signature image and a real name.
    expectSqliteError(() => signoff('so-hash', 'rev-emp-1', { reviewed_sha256: HASH_B }), /signoff_revision_mismatch/);
    expectSqliteError(() => signoff('so-pdf', 'rev-emp-1', { signature_attachment_id: 'pdf-emp' }), /attachment_kind_mismatch/);
    expectSqliteError(() => signoff('so-blank', 'rev-emp-1', { signer_name: '  ' }), check);
    expectSqliteError(() => signoff('so-time', 'rev-emp-1', { signed_at: '2026-10-02 18:00' }), check);
    signoff('so-ok', 'rev-emp-1');
  });

  it('constrains attachments, revision files and the auto-image authorization', () => {
    const check = /CHECK constraint failed/;
    expectSqliteError(() => attachment('sig-gif', employee, { mime_type: 'image/gif' }), check);
    expectSqliteError(() => attachment('sig-nosize', employee, { width_px: null }), check);
    expectSqliteError(() => attachment('sig-hash', employee, { sha256: 'Z'.repeat(64) }), check);
    expectSqliteError(() => attachment('sig-empty', employee, { size_bytes: 0 }), check);
    expectSqliteError(() => pdfAttachment('pdf-png', employee, { mime_type: 'image/png' }), check);
    expectSqliteError(() => pdfAttachment('pdf-sized', employee, { width_px: 10, height_px: 10 }), check);
    // Auto-image authorization: all three fields together, and only a signature image.
    expectSqliteError(() => settings('set-half', employee, 1, { auto_image_authorized: 1 }), check);
    expectSqliteError(
      () => settings('set-pdf', employee, 1, { auto_image_authorized: 1, auto_image_attachment_id: 'pdf-emp', auto_image_authorized_at: AT }),
      /attachment_kind_mismatch/,
    );
    expectSqliteError(() => settings('set-crlf', employee, 1, { subject_template: 'Subject\r\nBcc: x@example.invalid' }), check);
    expectSqliteError(() => settings('set-to', employee, 1, { recipients_to: '"manager@example.invalid"' }), check);
    settings('set-ok', employee, 1, { auto_image_authorized: 1, auto_image_attachment_id: 'sig-emp', auto_image_authorized_at: AT });
    // Revision files: ready needs a PDF attachment and is final.
    expectSqliteError(() => revisionFile('rf-ready-null', employee, { state: 'ready' }), check);
    expectSqliteError(() => revisionFile('rf-ready-sig', employee, { state: 'ready', attachment_id: 'sig-emp' }), /attachment_kind_mismatch/);
    revisionFile('rf-1', employee);
    db.prepare("UPDATE revision_files SET state = 'failed', last_error = 'render_failed' WHERE id = 'rf-1'").run();
    db.prepare("UPDATE revision_files SET state = 'pending', last_error = NULL WHERE id = 'rf-1'").run();
    expectSqliteError(
      () => db.prepare("UPDATE revision_files SET state = 'ready', attachment_id = 'sig-emp' WHERE id = 'rf-1'").run(),
      /attachment_kind_mismatch/,
    );
    expectSqliteError(() => db.prepare("UPDATE revision_files SET revision_id = 'rev-adm-1' WHERE id = 'rf-1'").run(), /immutable_revision_file/);
    db.prepare("UPDATE revision_files SET state = 'ready', attachment_id = 'pdf-emp' WHERE id = 'rf-1'").run();
    expectSqliteError(() => db.prepare("UPDATE revision_files SET state = 'failed' WHERE id = 'rf-1'").run(), /immutable_revision_file/);
  });

  it('keeps job identity fixed, leases explicit and closed jobs closed', () => {
    const check = /CHECK constraint failed/;
    job('job-1', employee, { revision_id: 'rev-emp-1' });
    expectSqliteError(() => db.prepare("UPDATE jobs SET business_key = 'other' WHERE id = 'job-1'").run(), /immutable_job/);
    expectSqliteError(() => db.prepare("UPDATE jobs SET state = 'leased' WHERE id = 'job-1'").run(), check);
    db.prepare("UPDATE jobs SET state = 'leased', lease_owner = 'runner-a', lease_expires_at = ?, attempts = 1 WHERE id = 'job-1'").run(AT);
    expectSqliteError(() => db.prepare("UPDATE jobs SET attempts = 0 WHERE id = 'job-1'").run(), /job_attempts_regression/);
    db.prepare("UPDATE jobs SET state = 'intervention', lease_owner = NULL, lease_expires_at = NULL, last_error = 'smtp_auth_rejected' WHERE id = 'job-1'").run();
    db.prepare("UPDATE jobs SET state = 'queued', last_error = NULL WHERE id = 'job-1'").run();
    db.prepare("UPDATE jobs SET state = 'succeeded' WHERE id = 'job-1'").run();
    expectSqliteError(() => db.prepare("UPDATE jobs SET state = 'queued' WHERE id = 'job-1'").run(), /job_closed/);
    expectSqliteError(() => job('job-bad-state', employee, { state: 'sent' }), check);
    expectSqliteError(() => job('job-bad-kind', employee, { kind: 'Send Mail' }), check);
    expectSqliteError(() => job('job-bad-payload', employee, { payload_json: '[]' }), check);
    expectSqliteError(() => job('job-bad-time', employee, { next_run_at: '2026-10-02' }), check);
  });

  it('moves delivery attempts only forward and records an uncertain decision once', () => {
    const check = /CHECK constraint failed/;
    job('job-1', employee, { revision_id: 'rev-emp-1' });
    attempt('att-1', 'job-1', employee);
    expectSqliteError(
      () => db.prepare("UPDATE delivery_attempts SET state = 'accepted', accepted_at = ? WHERE id = 'att-1'").run(AT),
      /invalid_delivery_transition/,
    );
    db.prepare("UPDATE delivery_attempts SET state = 'sending' WHERE id = 'att-1'").run();
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET state = 'preparing' WHERE id = 'att-1'").run(), /invalid_delivery_transition/);
    expectSqliteError(
      () => db.prepare("UPDATE delivery_attempts SET message_id = '<other@example.invalid>' WHERE id = 'att-1'").run(),
      /immutable_delivery_attempt/,
    );
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET state = 'accepted' WHERE id = 'att-1'").run(), check);
    db.prepare("UPDATE delivery_attempts SET state = 'uncertain', provider_response = 'connection_lost_after_data' WHERE id = 'att-1'").run();
    // An uncertain attempt still blocks another open attempt until a decision is recorded.
    expectSqliteError(() => attempt('att-2', 'job-1', employee, { attempt_no: 2 }), /UNIQUE constraint failed: delivery_attempts.revision_id/);
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET decision = 'resend' WHERE id = 'att-1'").run(), check);
    db.prepare("UPDATE delivery_attempts SET decision = 'resend', decision_actor_user_id = ?, decided_at = ? WHERE id = 'att-1'").run(employee, AT);
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET decision = 'abandon' WHERE id = 'att-1'").run(), /immutable_delivery_decision/);
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET state = 'failed_permanent' WHERE id = 'att-1'").run(), /invalid_delivery_transition/);
    attempt('att-2', 'job-1', employee, { attempt_no: 2 });
    db.prepare("UPDATE delivery_attempts SET state = 'sending' WHERE id = 'att-2'").run();
    db.prepare("UPDATE delivery_attempts SET state = 'accepted', accepted_at = ?, provider_message_id = 'capture-1' WHERE id = 'att-2'").run(AT);
    expectSqliteError(() => db.prepare("UPDATE delivery_attempts SET state = 'uncertain' WHERE id = 'att-2'").run(), /invalid_delivery_transition/);
    expectSqliteError(() => attempt('att-bad', 'job-1', employee, { attempt_no: 3, state: 'queued' }), check);
    expectSqliteError(() => attempt('att-crlf', 'job-1', employee, { attempt_no: 3, message_id: '<a@example.invalid>\r\nBcc: y' }), check);
    expectSqliteError(() => attempt('att-env', 'job-1', employee, { attempt_no: 3, envelope_json: '[]' }), check);
  });

  it('holds exactly one operations row with automation inactive by default', () => {
    const check = /CHECK constraint failed/;
    expect(db.prepare('SELECT id, automation_active_from FROM operations_state').all()).toEqual([{ id: 1, automation_active_from: null }]);
    expectSqliteError(() => db.prepare('INSERT INTO operations_state (id) VALUES (2)').run(), check);
    expectSqliteError(() => db.prepare('UPDATE operations_state SET automation_active_from = ?').run(AT), check);
    db.prepare('UPDATE operations_state SET automation_active_from = ?, automation_recorded_at = ?, automation_recorded_by = ?').run(AT, AT, admin);
    db.prepare('UPDATE operations_state SET runner_heartbeat_at = ?, runner_instance = ?').run(AT, 'runner-a');
    expectSqliteError(() => db.prepare("UPDATE operations_state SET runner_heartbeat_at = 'now'").run(), check);
  });
});

describe('migration 0005 automatic presentation', () => {
  const AT = '2026-10-02T18:00:00Z';
  const HASH_A = 'a'.repeat(64);
  /** Columns of submission_settings before migration 0005 adds the note fields. */
  const V4_SETTINGS_COLUMNS =
    'id, user_id, seq, recipients_to, recipients_cc, subject_template, body_template, template_version, auto_submit, ' +
    'auto_submit_effective_from, auto_image_authorized, auto_image_attachment_id, auto_image_authorized_at, show_ot_on_pdf, ' +
    'reminder_offsets_minutes, created_by, created_at';
  // Built from code points so this file stays ASCII: 120 Vietnamese characters of 3 bytes each.
  const VIETNAMESE_120 = String.fromCodePoint(0x1ed9).repeat(120);
  const NOTE_CHECK = /CHECK constraint failed/;

  type Row = Record<string, string | number | null>;

  function insert(table: string, row: Row): void {
    const columns = Object.keys(row);
    db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).run(...Object.values(row));
  }

  function settingsRow(id: string, userId: string, seq: number, overrides: Row = {}): Row {
    return {
      id,
      user_id: userId,
      seq,
      recipients_to: '["manager@example.invalid"]',
      recipients_cc: '[]',
      subject_template: 'Timesheet {EmployeeName} {PayrollDate} r{Revision}',
      body_template: 'Hello,\n\nAttached.\n{EmployeeName}',
      template_version: 1,
      auto_submit: 1,
      auto_submit_effective_from: AT,
      auto_image_authorized: 0,
      auto_image_attachment_id: null,
      auto_image_authorized_at: null,
      show_ot_on_pdf: 1,
      reminder_offsets_minutes: '[1440,120]',
      created_by: userId,
      created_at: AT,
      ...overrides,
    };
  }

  async function seed(target: Db): Promise<{ employee: string; admin: string; calendar: string }> {
    const result = await seedSynthetic(target, new MutableClock(AT), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass' },
    });
    return {
      employee: result.users.find((user) => user.role === 'employee')?.id ?? '',
      admin: result.users.find((user) => user.role === 'admin')?.id ?? '',
      calendar: result.calendarId ?? '',
    };
  }

  it('adds the note flag (off) and the note text ("Automatic submission") with safe defaults', async () => {
    migrate(db);
    const ids = await seed(db);
    insert('submission_settings', settingsRow('set-1', ids.employee, 1));
    expect(
      db.prepare('SELECT auto_note_enabled, auto_note_text FROM submission_settings WHERE id = ?').get('set-1'),
    ).toEqual({ auto_note_enabled: 0, auto_note_text: 'Automatic submission' });
    const columns = db.prepare('SELECT name, type, "notnull", dflt_value FROM pragma_table_info(?)').all('submission_settings') as Array<{
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
    }>;
    expect(columns.filter((column) => column.name.startsWith('auto_note'))).toEqual([
      { name: 'auto_note_enabled', type: 'INTEGER', notnull: 1, dflt_value: '0' },
      { name: 'auto_note_text', type: 'TEXT', notnull: 1, dflt_value: "'Automatic submission'" },
    ]);
  });

  it('constrains the flag to 0/1 and the text to 1-120 characters on one line', async () => {
    migrate(db);
    const ids = await seed(db);
    let seq = 0;
    const attempt = (overrides: Row) => () => insert('submission_settings', settingsRow(`set-${(seq += 1)}`, ids.employee, seq, overrides));
    expect(attempt({ auto_note_enabled: 1, auto_note_text: 'Nop tu dong' })).not.toThrow();
    expect(attempt({ auto_note_enabled: 0, auto_note_text: 'x'.repeat(120) })).not.toThrow();
    // The limit counts characters, not bytes.
    expect(attempt({ auto_note_enabled: 1, auto_note_text: VIETNAMESE_120 })).not.toThrow();
    expectSqliteError(attempt({ auto_note_enabled: 2 }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_enabled: -1 }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: '' }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: 'x'.repeat(121) }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: `${VIETNAMESE_120}x` }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: 'two\nlines' }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: 'carriage\rreturn' }), NOTE_CHECK);
    expectSqliteError(attempt({ auto_note_text: null }), /NOT NULL constraint failed/);
    expect(db.prepare('SELECT count(*) FROM submission_settings').pluck().get()).toBe(3);
  });

  it('keeps settings versions immutable with the new columns', async () => {
    migrate(db);
    const ids = await seed(db);
    insert('submission_settings', settingsRow('set-1', ids.employee, 1, { auto_note_enabled: 1, auto_note_text: 'Nop tu dong' }));
    expectSqliteError(() => db.prepare("UPDATE submission_settings SET auto_note_enabled = 0 WHERE id = 'set-1'").run(), /immutable_submission_settings/);
    expectSqliteError(() => db.prepare("UPDATE submission_settings SET auto_note_text = 'Other' WHERE id = 'set-1'").run(), /immutable_submission_settings/);
    expectSqliteError(() => db.prepare('DELETE FROM submission_settings').run(), /immutable_submission_settings/);
  });

  it('upgrades a populated version 4 database: every row unchanged, new columns defaulted, constraints and triggers live', async () => {
    const v4 = MIGRATIONS.filter((migration) => migration.version <= 4);
    expect(migrate(db, v4)).toEqual({ applied: [1, 2, 3, 4], version: 4 });
    const ids = await seed(db);
    const period = db.prepare(`INSERT INTO pay_periods VALUES (?, ?, ?, ?, ?, ?, ?, ?, '17:00', ?, 0, ?)`);
    period.run('p1', ids.calendar, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27', '2026-09-29', '2026-09-30T00:00:00Z', AT);
    const sheet = db.prepare(`INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES (?, ?, 'p1', 3, ?, ?)`);
    sheet.run('ts-emp', ids.employee, AT, AT);
    sheet.run('ts-adm', ids.admin, AT, AT);
    insert('attachments', {
      id: 'sig-emp',
      user_id: ids.employee,
      kind: 'signature',
      storage_key: 'key_sig_emp_0123456789abcdef',
      sha256: HASH_A,
      mime_type: 'image/png',
      size_bytes: 2048,
      width_px: 600,
      height_px: 200,
      created_at: AT,
    });
    insert('submission_settings', settingsRow('set-emp-1', ids.employee, 1));
    insert(
      'submission_settings',
      settingsRow('set-emp-2', ids.employee, 2, {
        auto_submit: 0,
        auto_image_authorized: 1,
        auto_image_attachment_id: 'sig-emp',
        auto_image_authorized_at: AT,
        show_ot_on_pdf: 0,
        template_version: 2,
      }),
    );
    insert('submission_settings', settingsRow('set-adm-1', ids.admin, 1, { recipients_to: '["payroll@example.invalid"]' }));
    for (const [id, userId, sheetId] of [
      ['rev-emp-1', ids.employee, 'ts-emp'],
      ['rev-adm-1', ids.admin, 'ts-adm'],
    ] as const) {
      insert('timesheet_revisions', {
        id,
        user_id: userId,
        timesheet_id: sheetId,
        revision_no: 1,
        revision_kind: 'original',
        origin: 'employee',
        review_state: 'signed',
        supersedes_revision_id: null,
        correction_reason: null,
        timesheet_version: 3,
        payload_json: '{"days":[]}',
        payload_sha256: HASH_A,
        reviewed_sha256: HASH_A,
        send_requested: 1,
        actor_user_id: userId,
        created_at: AT,
      });
    }
    insert('signoffs', {
      id: 'so-emp-1',
      user_id: ids.employee,
      revision_id: 'rev-emp-1',
      signer_name: 'Example Employee',
      signed_at: AT,
      reviewed_sha256: HASH_A,
      signature_attachment_id: 'sig-emp',
    });

    const tables = V5_TABLES.filter((name) => name !== 'schema_migrations');
    const rowsOf = (): Record<string, unknown[]> =>
      Object.fromEntries(
        tables.map((name) => [name, db.prepare(`SELECT ${name === 'submission_settings' ? V4_SETTINGS_COLUMNS : '*'} FROM ${name} ORDER BY rowid`).all()]),
      );
    const before = rowsOf();
    for (const name of ['users', 'timesheets', 'attachments', 'submission_settings', 'timesheet_revisions', 'signoffs']) {
      expect(before[name]?.length, name).toBeGreaterThan(0);
    }
    const recorded = db.prepare('SELECT * FROM schema_migrations ORDER BY version').all();

    const v5 = MIGRATIONS.filter((migration) => migration.version <= 5);
    expect(migrate(db, v5, new Date('2026-10-05T18:00:00Z'))).toEqual({ applied: [5], version: 5 });

    expect(rowsOf()).toEqual(before);
    expect(db.prepare('SELECT * FROM schema_migrations ORDER BY version').all().slice(0, 4)).toEqual(recorded);
    expect(db.prepare('SELECT version, name, applied_at FROM schema_migrations WHERE version = 5').get()).toEqual({
      version: 5,
      name: 'automatic_presentation',
      applied_at: '2026-10-05T18:00:00Z',
    });
    // Every existing version reads as "note off, default text"; the authorization and the other fields did not move.
    expect(db.prepare('SELECT id, auto_note_enabled, auto_note_text FROM submission_settings ORDER BY rowid').all()).toEqual([
      { id: 'set-emp-1', auto_note_enabled: 0, auto_note_text: 'Automatic submission' },
      { id: 'set-emp-2', auto_note_enabled: 0, auto_note_text: 'Automatic submission' },
      { id: 'set-adm-1', auto_note_enabled: 0, auto_note_text: 'Automatic submission' },
    ]);
    expect(db.prepare("SELECT auto_image_authorized, auto_image_attachment_id FROM submission_settings WHERE id = 'set-emp-2'").get()).toEqual({
      auto_image_authorized: 1,
      auto_image_attachment_id: 'sig-emp',
    });
    expect(db.pragma('user_version', { simple: true })).toBe(5);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
    // The upgraded table accepts a new version with a note, keeps its checks and its immutability triggers.
    insert('submission_settings', settingsRow('set-emp-3', ids.employee, 3, { auto_note_enabled: 1, auto_note_text: 'Nop tu dong' }));
    expectSqliteError(() => insert('submission_settings', settingsRow('set-emp-4', ids.employee, 4, { auto_note_text: 'x'.repeat(121) })), NOTE_CHECK);
    expectSqliteError(() => db.prepare("UPDATE submission_settings SET auto_note_enabled = 1 WHERE id = 'set-emp-1'").run(), /immutable_submission_settings/);
    expectSqliteError(() => db.prepare("DELETE FROM submission_settings WHERE id = 'set-emp-1'").run(), /immutable_submission_settings/);
    expect(migrate(db, v5)).toEqual({ applied: [], version: 5 });
  });
});

describe('migration 0006 timesheet shares', () => {
  const AT = '2026-10-05T18:00:00Z';
  const LATER = '2026-10-06T09:30:00Z';
  const SHARE_ERROR = /immutable_timesheet_share/;
  const CHECK = /CHECK constraint failed/;

  type Row = Record<string, string | number | null>;

  function insert(target: Db, table: string, row: Row): void {
    const columns = Object.keys(row);
    target
      .prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`)
      .run(...Object.values(row));
  }

  async function seed(target: Db): Promise<{ owner: string; grantee: string; admin: string; calendar: string }> {
    const result = await seedSynthetic(target, new MutableClock(AT), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass', employee2: 'synthetic-employee2-pass' },
      sampleData: true,
    });
    const idOf = (email: string) => result.users.find((user) => user.email === email)?.id ?? '';
    return {
      owner: idOf('employee@example.invalid'),
      grantee: idOf('employee2@example.invalid'),
      admin: idOf('admin@example.invalid'),
      calendar: result.calendarId ?? '',
    };
  }

  function share(id: string, owner: string, grantee: string, overrides: Row = {}): Row {
    return {
      id,
      owner_user_id: owner,
      grantee_user_id: grantee,
      timesheets_scope: 'view',
      ot_read: 0,
      pdf_download: 0,
      created_by: owner,
      created_at: AT,
      ...overrides,
    };
  }

  const revoke = (target: Db, id: string, by: string, at = LATER) =>
    target.prepare('UPDATE timesheet_shares SET revoked_by = ?, revoked_at = ? WHERE id = ?').run(by, at, id);

  it('creates one STRICT table with the item columns, the one-active index and the immutability triggers', () => {
    migrate(db);
    const columns = db.prepare('SELECT name, type, "notnull" FROM pragma_table_info(?)').all('timesheet_shares');
    expect(columns).toEqual([
      // A STRICT table's PRIMARY KEY is NOT NULL.
      { name: 'id', type: 'TEXT', notnull: 1 },
      { name: 'owner_user_id', type: 'TEXT', notnull: 1 },
      { name: 'grantee_user_id', type: 'TEXT', notnull: 1 },
      { name: 'timesheets_scope', type: 'TEXT', notnull: 1 },
      { name: 'ot_read', type: 'INTEGER', notnull: 1 },
      { name: 'pdf_download', type: 'INTEGER', notnull: 1 },
      { name: 'created_by', type: 'TEXT', notnull: 1 },
      { name: 'created_at', type: 'TEXT', notnull: 1 },
      { name: 'revoked_by', type: 'TEXT', notnull: 0 },
      { name: 'revoked_at', type: 'TEXT', notnull: 0 },
      { name: 'revoke_reason', type: 'TEXT', notnull: 0 },
    ]);
    const objects = db
      .prepare("SELECT type, name FROM sqlite_master WHERE tbl_name = 'timesheet_shares' AND name NOT LIKE 'sqlite_%' ORDER BY type, name")
      .all();
    expect(objects).toEqual([
      { type: 'index', name: 'timesheet_shares_grantee' },
      { type: 'index', name: 'timesheet_shares_one_active' },
      { type: 'table', name: 'timesheet_shares' },
      { type: 'trigger', name: 'timesheet_shares_fixed' },
      { type: 'trigger', name: 'timesheet_shares_no_delete' },
    ]);
    // No column can hold a token, a password, a signature or timesheet content.
    const names = (columns as Array<{ name: string }>).map((column) => column.name).join(' ');
    expect(names).not.toMatch(/token|password|secret|signature|payload|note|minutes/i);
  });

  it('accepts every valid item set and refuses an empty, self, foreign-created or malformed share', async () => {
    migrate(db);
    const ids = await seed(db);
    let n = 0;
    const attempt = (overrides: Row) => () => {
      n += 1;
      // Each accepted row is revoked at once, which frees the pair for the next attempt.
      insert(db, 'timesheet_shares', share(`sh-${n}`, ids.owner, ids.grantee, overrides));
      revoke(db, `sh-${n}`, ids.owner);
    };
    for (const timesheets of ['none', 'view', 'edit']) {
      for (const otRead of [0, 1]) {
        for (const pdf of [0, 1]) {
          if (timesheets === 'none' && otRead === 0 && pdf === 0) continue;
          expect(attempt({ timesheets_scope: timesheets, ot_read: otRead, pdf_download: pdf }), `${timesheets}/${otRead}/${pdf}`).not.toThrow();
        }
      }
    }
    expect(db.prepare('SELECT count(*) FROM timesheet_shares').pluck().get()).toBe(11);
    expectSqliteError(attempt({ timesheets_scope: 'none', ot_read: 0, pdf_download: 0 }), CHECK);
    expectSqliteError(attempt({ grantee_user_id: ids.owner }), CHECK);
    expectSqliteError(attempt({ created_by: ids.admin }), CHECK);
    expectSqliteError(attempt({ timesheets_scope: 'admin' }), CHECK);
    expectSqliteError(attempt({ ot_read: 2 }), CHECK);
    expectSqliteError(attempt({ pdf_download: -1 }), CHECK);
    expectSqliteError(attempt({ created_at: '2026-10-05 18:00' }), CHECK);
    expectSqliteError(attempt({ grantee_user_id: 'no-such-user' }), /FOREIGN KEY constraint failed/);
    // Revocation fields come as a pair, never before the grant, and a reason needs a revocation.
    expectSqliteError(attempt({ revoked_at: LATER }), CHECK);
    expectSqliteError(attempt({ revoked_by: ids.owner }), CHECK);
    expectSqliteError(attempt({ revoke_reason: 'Synthetic reason' }), CHECK);
    expectSqliteError(attempt({ revoked_by: ids.owner, revoked_at: '2026-10-04T00:00:00Z' }), CHECK);
    expectSqliteError(attempt({ revoked_by: ids.owner, revoked_at: LATER, revoke_reason: 'x'.repeat(501) }), CHECK);
    expectSqliteError(attempt({ revoked_by: ids.owner, revoked_at: LATER, revoke_reason: '' }), CHECK);
    expect(db.prepare('SELECT count(*) FROM timesheet_shares').pluck().get()).toBe(11);
  });

  it('keeps at most one active share per owner and grantee; revoked rows stay as history', async () => {
    migrate(db);
    const ids = await seed(db);
    insert(db, 'timesheet_shares', share('sh-1', ids.owner, ids.grantee));
    expectSqliteError(
      () => insert(db, 'timesheet_shares', share('sh-2', ids.owner, ids.grantee, { timesheets_scope: 'edit' })),
      /UNIQUE constraint failed/,
    );
    // The opposite direction is a different share.
    insert(db, 'timesheet_shares', share('sh-3', ids.grantee, ids.owner, { created_by: ids.grantee }));
    // A change of items is a revocation plus a new row, in one transaction.
    db.transaction(() => {
      revoke(db, 'sh-1', ids.owner);
      insert(db, 'timesheet_shares', share('sh-4', ids.owner, ids.grantee, { timesheets_scope: 'edit', created_at: LATER }));
    })();
    db.prepare('UPDATE timesheet_shares SET revoked_by = ?, revoked_at = ?, revoke_reason = ? WHERE id = ?').run(
      ids.admin,
      LATER,
      'Synthetic reason',
      'sh-4',
    );
    insert(db, 'timesheet_shares', share('sh-5', ids.owner, ids.grantee, { created_at: LATER }));
    expect(
      db
        .prepare('SELECT id FROM timesheet_shares WHERE owner_user_id = ? AND grantee_user_id = ? AND revoked_at IS NULL')
        .pluck()
        .all(ids.owner, ids.grantee),
    ).toEqual(['sh-5']);
    expect(db.prepare('SELECT count(*) FROM timesheet_shares').pluck().get()).toBe(4);
  });

  it('refuses DELETE, any change of identity or items, and a second revocation', async () => {
    migrate(db);
    const ids = await seed(db);
    insert(db, 'timesheet_shares', share('sh-1', ids.owner, ids.grantee, { ot_read: 1 }));
    for (const assignment of [
      "timesheets_scope = 'edit'",
      'ot_read = 0',
      'pdf_download = 1',
      `owner_user_id = '${ids.admin}'`,
      `grantee_user_id = '${ids.admin}'`,
      `created_by = '${ids.grantee}'`,
      "created_at = '2026-10-01T00:00:00Z'",
      "id = 'sh-x'",
    ]) {
      expectSqliteError(() => db.prepare(`UPDATE timesheet_shares SET ${assignment} WHERE id = 'sh-1'`).run(), SHARE_ERROR);
    }
    expectSqliteError(() => db.prepare("DELETE FROM timesheet_shares WHERE id = 'sh-1'").run(), SHARE_ERROR);
    revoke(db, 'sh-1', ids.grantee);
    for (const assignment of [
      `revoked_by = '${ids.owner}'`,
      "revoked_at = '2026-10-07T00:00:00Z'",
      "revoke_reason = 'Later'",
      'revoked_at = NULL, revoked_by = NULL',
    ]) {
      expectSqliteError(() => db.prepare(`UPDATE timesheet_shares SET ${assignment} WHERE id = 'sh-1'`).run(), SHARE_ERROR);
    }
    expectSqliteError(() => db.prepare('DELETE FROM timesheet_shares').run(), SHARE_ERROR);
    expect(db.prepare('SELECT timesheets_scope, ot_read, revoked_by, revoked_at FROM timesheet_shares').all()).toEqual([
      { timesheets_scope: 'view', ot_read: 1, revoked_by: ids.grantee, revoked_at: LATER },
    ]);
  });

  it('upgrades a populated version 5 database: rows, triggers and unique keys unchanged, the new table empty and live', async () => {
    const v5 = MIGRATIONS.filter((migration) => migration.version <= 5);
    expect(migrate(db, v5)).toEqual({ applied: [1, 2, 3, 4, 5], version: 5 });
    const clock = new MutableClock(AT);
    const ids = await seed(db);
    postCredit(
      { db, clock },
      { userId: ids.owner, sourceKey: 'v5-credit', minutes: 45, workDate: '2026-09-21', actorUserId: ids.owner, origin: 'manual' },
    );
    db.prepare(
      `INSERT INTO pay_periods VALUES ('p-v5', ?, 0, '2026-10-02', '2026-10-02', '2026-09-14', '2026-09-27',
         '2026-09-29', '17:00', '2026-09-30T00:00:00Z', 0, ?)`,
    ).run(ids.calendar, AT);
    db.prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES ('ts-v5', ?, 'p-v5', 2, ?, ?)`,
    ).run(ids.owner, AT, AT);
    insert(db, 'timesheet_revisions', {
      id: 'rev-v5',
      user_id: ids.owner,
      timesheet_id: 'ts-v5',
      revision_no: 1,
      revision_kind: 'original',
      origin: 'deadline',
      review_state: 'pending',
      supersedes_revision_id: null,
      correction_reason: null,
      timesheet_version: 2,
      payload_json: '{"days":[]}',
      payload_sha256: 'a'.repeat(64),
      reviewed_sha256: null,
      send_requested: 1,
      actor_user_id: null,
      created_at: AT,
    });
    insert(db, 'submission_settings', {
      id: 'set-v5',
      user_id: ids.owner,
      seq: 1,
      recipients_to: '["payroll@example.invalid"]',
      recipients_cc: '[]',
      subject_template: 'Timesheet {PayrollDate}',
      body_template: 'Attached.',
      template_version: 1,
      auto_submit: 0,
      auto_submit_effective_from: AT,
      reminder_offsets_minutes: '[]',
      created_by: ids.owner,
      created_at: AT,
      auto_note_enabled: 1,
      auto_note_text: 'Synthetic note',
    });
    const tables = V5_TABLES.filter((name) => name !== 'schema_migrations');
    const rowsOf = (): Record<string, unknown[]> =>
      Object.fromEntries(tables.map((name) => [name, db.prepare(`SELECT * FROM ${name} ORDER BY rowid`).all()]));
    const objectsOf = () =>
      db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all();
    const before = rowsOf();
    for (const name of ['users', 'work_sessions', 'ot_ledger', 'ot_leave_requests', 'audit_events', 'timesheet_revisions', 'submission_settings']) {
      expect(before[name]?.length, name).toBeGreaterThan(0);
    }
    const objectsBefore = objectsOf();
    const recorded = db.prepare('SELECT * FROM schema_migrations ORDER BY version').all();
    const balance = getBalance(db, ids.owner);

    expect(migrate(db, MIGRATIONS.filter((migration) => migration.version <= 6), new Date('2026-10-06T18:00:00Z'))).toEqual({ applied: [6], version: 6 });

    expect(rowsOf()).toEqual(before);
    expect(getBalance(db, ids.owner)).toEqual(balance);
    expect(db.prepare('SELECT * FROM schema_migrations ORDER BY version').all().slice(0, 5)).toEqual(recorded);
    expect(db.prepare('SELECT version, name, applied_at FROM schema_migrations WHERE version = 6').get()).toEqual({
      version: 6,
      name: 'timesheet_shares',
      applied_at: '2026-10-06T18:00:00Z',
    });
    // Every earlier table, index and trigger is unchanged; only the share objects are new.
    const objectsAfter = objectsOf() as Array<{ name: string }>;
    expect(objectsAfter.filter((object) => !object.name.startsWith('timesheet_shares'))).toEqual(objectsBefore);
    expect(
      objectsAfter
        .filter((object) => object.name.startsWith('timesheet_shares'))
        .map((object) => object.name)
        .sort(),
    ).toEqual([
      'timesheet_shares',
      'timesheet_shares_fixed',
      'timesheet_shares_grantee',
      'timesheet_shares_no_delete',
      'timesheet_shares_one_active',
    ]);
    expect(db.prepare('SELECT count(*) FROM timesheet_shares').pluck().get()).toBe(0);
    expect(db.pragma('user_version', { simple: true })).toBe(6);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
    // Earlier triggers and unique keys stay live.
    expectSqliteError(() => db.prepare("UPDATE timesheet_revisions SET correction_reason = 'x'").run(), /immutable_revision/);
    expectSqliteError(() => db.prepare('DELETE FROM audit_events').run(), /immutable_audit_event/);
    expectSqliteError(() => db.prepare('UPDATE submission_settings SET auto_note_enabled = 0').run(), /immutable_submission_settings/);
    expectSqliteError(
      () => insert(db, 'submission_settings', { ...(db.prepare("SELECT * FROM submission_settings WHERE id = 'set-v5'").get() as Row), id: 'set-dup' }),
      /UNIQUE constraint failed/,
    );
    // The new table is usable at once and keeps its own rules.
    insert(db, 'timesheet_shares', share('sh-v6', ids.owner, ids.grantee, { pdf_download: 1 }));
    expectSqliteError(() => insert(db, 'timesheet_shares', share('sh-v6b', ids.owner, ids.grantee)), /UNIQUE constraint failed/);
    expectSqliteError(() => db.prepare('DELETE FROM timesheet_shares').run(), SHARE_ERROR);
    expect(migrate(db, UP_TO_7, new Date('2026-10-07T18:00:00Z'))).toEqual({ applied: [7], version: 7 });
  });
});

/*
 * WP4-T02 migration 0007 (FR-14, FR-17, AC-16): the recorded "through a share" marker. The column is added with
 * ALTER TABLE ADD COLUMN, so no stored audit row is rewritten and the append-only triggers stay; rows written before
 * the migration keep the operation-code attribution of the earlier releases, so the owner's History and Review hint
 * read the same for existing data.
 */
describe('migration 0007 audit access marker', () => {
  const AT = '2026-10-04T10:00:00Z';
  const MIGRATED = new Date('2026-10-06T00:00:00Z');
  const AFTER_MIGRATION = '2026-10-07T00:00:00Z';
  const PAYROLL = '2026-10-02';

  /** The attribution rule of a1dc01b (WP3), copied verbatim as the "before" reference; the marker does not exist at version 6. */
  const OLD_CONDITION = (row: string) =>
    `(${row}.actor_user_id IS NOT NULL AND ${row}.actor_user_id <> ${row}.owner_user_id AND ${row}.operation IN ('day_entry.create', 'day_entry.update', 'work_session.create', 'work_session.update', 'work_session.delete', 'share.pdf_download'))`;

  interface Ids {
    owner: string;
    grantee: string;
    admin: string;
    calendar: string;
  }

  async function seedV6(): Promise<Ids> {
    expect(migrate(db, MIGRATIONS.filter((migration) => migration.version <= 6))).toEqual({ applied: [1, 2, 3, 4, 5, 6], version: 6 });
    const result = await seedSynthetic(db, new MutableClock(AT), {
      passwords: { admin: 'synthetic-admin-pass', employee: 'synthetic-employee-pass', employee2: 'synthetic-employee2-pass' },
      sampleData: true,
    });
    const idOf = (email: string) => result.users.find((user) => user.email === email)?.id ?? '';
    return {
      owner: idOf('employee@example.invalid'),
      grantee: idOf('employee2@example.invalid'),
      admin: idOf('admin@example.invalid'),
      calendar: result.calendarId ?? '',
    };
  }

  function event(ids: Ids, id: string, actor: string | null, operation: string, entityType: string, workDate: string | null, at: string): void {
    db.prepare(
      `INSERT INTO audit_events (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`,
    ).run(id, at, actor, ids.owner, operation, entityType, `entity-${id}`, workDate === null ? null : JSON.stringify({ work_date: workDate }));
  }

  /** Legacy-shaped rows of the owner: every combination of actor and operation the old inference distinguished. */
  function populate(ids: Ids): void {
    db.prepare(
      `INSERT INTO timesheet_shares (id, owner_user_id, grantee_user_id, timesheets_scope, ot_read, pdf_download, created_by, created_at)
       VALUES ('share-v6', ?, ?, 'edit', 0, 1, ?, ?)`,
    ).run(ids.owner, ids.grantee, ids.owner, AT);
    event(ids, 'l1-grantee-session', ids.grantee, 'work_session.create', 'work_session', '2026-09-22', '2026-10-04T10:01:00Z');
    event(ids, 'l2-grantee-day', ids.grantee, 'day_entry.update', 'day_entry', '2026-09-23', '2026-10-04T10:02:00Z');
    event(ids, 'l3-admin-day', ids.admin, 'day_entry.update', 'day_entry', '2026-09-24', '2026-10-04T10:03:00Z');
    event(ids, 'l4-owner-session', ids.owner, 'work_session.create', 'work_session', '2026-09-25', '2026-10-04T10:04:00Z');
    event(ids, 'l5-grantee-other', ids.grantee, 'user.update', 'user', null, '2026-10-04T10:05:00Z');
    event(ids, 'l6-system-day', null, 'day_entry.create', 'day_entry', '2026-09-26', '2026-10-04T10:06:00Z');
    event(ids, 'l7-grantee-pdf', ids.grantee, 'share.pdf_download', 'timesheet_revision', null, '2026-10-04T10:07:00Z');
    event(ids, 'l8-grantee-day-later', ids.grantee, 'day_entry.create', 'day_entry', '2026-09-24', '2026-10-04T10:08:00Z');
  }

  type Hint = Array<{ display_name: string; days: number; work_dates: string[] }>;

  /** Who last changed each work day of the period, from per-row attribution flags in storage order (the Review hint's rule). */
  function hintFrom(rows: Array<{ work_date: string | null; shared_actor: string | null }>): Hint {
    const last = new Map<string, string | null>();
    for (const row of rows) {
      if (row.work_date === null || row.work_date < '2026-09-14' || row.work_date > '2026-09-27') continue;
      last.set(row.work_date, row.shared_actor);
    }
    const groups = new Map<string, Hint[number]>();
    for (const [workDate, who] of [...last].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (who === null) continue;
      const group = groups.get(who) ?? { display_name: who, days: 0, work_dates: [] };
      group.days += 1;
      group.work_dates.push(workDate);
      groups.set(who, group);
    }
    return [...groups.values()].sort((a, b) => (a.display_name < b.display_name ? -1 : a.display_name > b.display_name ? 1 : 0));
  }

  it('upgrades a populated version 6 database: rows unchanged, triggers kept, legacy attribution and the Review hint identical', async () => {
    const ids = await seedV6();
    populate(ids);
    const auditRows = () => db.prepare(`SELECT ${V6_AUDIT_COLUMNS} FROM audit_events ORDER BY rowid`).all();
    const objectsOf = () =>
      db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all() as Array<{ name: string }>;
    const rowsBefore = auditRows();
    expect(rowsBefore.length).toBeGreaterThan(8);
    const objectsBefore = objectsOf();
    const ownerEvents = `FROM audit_events a WHERE a.owner_user_id = '${ids.owner}'`;
    // Before: the old inference decides, per row of the owner's history.
    const flagsBefore = new Map(
      (db.prepare(`SELECT a.id, CASE WHEN ${OLD_CONDITION('a')} THEN 1 ELSE 0 END AS shared ${ownerEvents}`).all() as Array<{ id: string; shared: number }>).map(
        (row) => [row.id, row.shared === 1],
      ),
    );
    const hintBefore = hintFrom(
      db
        .prepare(
          `SELECT json_extract(COALESCE(a.after_json, a.before_json), '$.work_date') AS work_date,
                  CASE WHEN ${OLD_CONDITION('a')} THEN (SELECT u.display_name FROM users u WHERE u.id = a.actor_user_id) END AS shared_actor
             ${ownerEvents} AND a.entity_type IN ('day_entry', 'work_session') ORDER BY a.rowid`,
        )
        .all() as Array<{ work_date: string | null; shared_actor: string | null }>,
    );
    expect([...flagsBefore.values()].filter(Boolean).length).toBeGreaterThanOrEqual(5);
    expect(flagsBefore.get('l4-owner-session')).toBe(false);
    expect(flagsBefore.get('l5-grantee-other')).toBe(false);
    expect(hintBefore.length).toBeGreaterThan(0);

    expect(migrate(db, UP_TO_7, MIGRATED)).toEqual({ applied: [7], version: 7 });

    // Stored rows are untouched; the new column reads NULL for every one of them.
    expect(auditRows()).toEqual(rowsBefore);
    expect(db.prepare('SELECT count(*) FROM audit_events WHERE via_share_id IS NOT NULL').pluck().get()).toBe(0);
    // Only the audit table definition changed, plus the one insert trigger; every other object, the append-only triggers included, is identical.
    const objectsAfter = objectsOf();
    expect(objectsAfter.filter((object) => object.name !== 'audit_events' && object.name !== 'audit_events_via_share_consistent')).toEqual(
      objectsBefore.filter((object) => object.name !== 'audit_events'),
    );
    expect(objectsAfter.map((object) => object.name).filter((name) => !objectsBefore.some((object) => object.name === name))).toEqual([
      'audit_events_via_share_consistent',
    ]);
    expect(() => db.prepare("UPDATE audit_events SET reason = 'x'").run()).toThrow(/immutable_audit_event/);
    expect(() => db.prepare('DELETE FROM audit_events').run()).toThrow(/immutable_audit_event/);
    expect(db.prepare('SELECT applied_at FROM schema_migrations WHERE version = 7').pluck().get()).toBe('2026-10-06T00:00:00Z');
    expect(db.pragma('user_version', { simple: true })).toBe(7);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);

    // After: the owner's History and Review hint read exactly as before for every legacy row.
    const owner = { id: ids.owner, calendarId: ids.calendar };
    const history = getHistory(db, owner, { limit: '500' }).audit_events;
    expect(history.length).toBe(flagsBefore.size);
    for (const row of history) expect(row.via_share, row.id).toBe(flagsBefore.get(row.id));
    expect(granteeChangesForReview(db, owner, PAYROLL)).toEqual(hintBefore);

    // New rows follow the marker only: an unmarked row of the same shape after the migration is not a share act,
    // a marked one is, and the earlier rows still read as before.
    event(ids, 'n1-unmarked', ids.grantee, 'work_session.update', 'work_session', '2026-09-22', AFTER_MIGRATION);
    db.prepare(
      `INSERT INTO audit_events (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json, via_share_id)
       VALUES ('n2-marked', ?, ?, ?, 'work_session.update', 'work_session', 'entity-n2', NULL, NULL, '{"work_date":"2026-09-23"}', 'share-v6')`,
    ).run(AFTER_MIGRATION, ids.grantee, ids.owner);
    const later = new Map(getHistory(db, owner, { limit: '500' }).audit_events.map((row) => [row.id, row.via_share]));
    expect(later.get('n1-unmarked')).toBe(false);
    expect(later.get('n2-marked')).toBe(true);
    for (const [id, shared] of flagsBefore) expect(later.get(id), id).toBe(shared);

    expect(migrate(db, UP_TO_7, new Date('2026-10-08T00:00:00Z'))).toEqual({ applied: [], version: 7 });
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
  });

  it('adds one nullable column to a fresh 1 to 7 database and keeps both append-only triggers', () => {
    expect(migrate(db, UP_TO_7)).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7], version: 7 });
    expect(db.prepare("SELECT type, \"notnull\" AS required FROM pragma_table_info('audit_events') WHERE name = 'via_share_id'").get()).toEqual({
      type: 'TEXT',
      required: 0,
    });
    expect(db.prepare("SELECT \"table\", \"to\" FROM pragma_foreign_key_list('audit_events') WHERE \"from\" = 'via_share_id'").get()).toEqual({
      table: 'timesheet_shares',
      to: 'id',
    });
    const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'audit_events' ORDER BY name").pluck().all();
    expect(triggers).toEqual(['audit_events_no_delete', 'audit_events_no_update', 'audit_events_via_share_consistent']);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
    expect(migrate(db, UP_TO_7)).toEqual({ applied: [], version: 7 });
  });
});
