import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate, MigrationError, migrationChecksum } from '../../src/server/db/migrations.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { getBalance, postCredit } from '../../src/server/services/ledger.ts';
import { MutableClock } from '../support/testApp.ts';

const EXPECTED_TABLES = [
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

/** Latest schema version; every migration is applied in order from 1. */
const LATEST = MIGRATIONS.length;
const ALL_VERSIONS = MIGRATIONS.map((migration) => migration.version);

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
    expect(LATEST).toBe(3);
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
    expect(MIGRATIONS.map((migration) => migration.name)).toEqual(['initial', 'ot_ledger', 'day_entry_source']);
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
  it('never edits migration 0001: its checksum equals the one applied by WP1 databases', () => {
    const initial = MIGRATIONS[0];
    if (initial === undefined) throw new Error('migration 0001 missing');
    expect(migrationChecksum(initial)).toBe('1c0b248d74c4d83a11282dee28aaf056ae083fb12e0d5b5534cfebd7f2f0c9b5');
  });
});

describe('upgrade from a populated WP1 (version 1) database', () => {
  const WP1_TABLES = EXPECTED_TABLES.filter((name) => !name.startsWith('ot_'));
  const AT = '2026-09-29T20:00:00Z';
  const WP1_DAY_ENTRY_COLUMNS =
    'id, user_id, timesheet_id, work_date, category, leave_minutes, wfh, notes, version, created_at, updated_at';

  /** Every row of every WP1 table, in storage order, for a before/after comparison. */
  function snapshot(target: Db): Record<string, unknown[]> {
    return Object.fromEntries(
      WP1_TABLES.map((name) => [
        name,
        // 0003 adds columns to day_entries; the WP1 columns are compared by name below.
        target.prepare(`SELECT ${name === 'day_entries' ? WP1_DAY_ENTRY_COLUMNS : '*'} FROM ${name} ORDER BY rowid`).all(),
      ]),
    );
  }

  it('applies 0002 and 0003, keeps every WP1 row unchanged and leaves a consistent, usable schema', async () => {
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

    expect(migrate(db, MIGRATIONS, new Date('2026-10-02T18:00:00Z'))).toEqual({ applied: [2, 3], version: 3 });

    const after = snapshot(db);
    // schema_migrations gains exactly one row; WP1 rows (including migration 1's record) are unchanged.
    expect(after.schema_migrations?.slice(0, 1)).toEqual(before.schema_migrations);
    expect(after.schema_migrations?.slice(1)).toEqual([
      expect.objectContaining({ version: 2, name: 'ot_ledger', applied_at: '2026-10-02T18:00:00Z' }),
      expect.objectContaining({ version: 3, name: 'day_entry_source', applied_at: '2026-10-02T18:00:00Z' }),
    ]);
    expect({ ...after, schema_migrations: [] }).toEqual({ ...before, schema_migrations: [] });
    // WP1 rows are conservatively explicit (an employee may have chosen the label) and carry no leave kind.
    expect(db.prepare('SELECT id, leave_minutes, category_source, leave_kind FROM day_entries').all()).toEqual([
      { id: 'd1', leave_minutes: 120, category_source: 'explicit', leave_kind: null },
    ]);
    expect(db.pragma('user_version', { simple: true })).toBe(3);
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
    expect(migrate(db)).toEqual({ applied: [], version: 3 });
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
    expect(migrate(db, MIGRATIONS)).toEqual({ applied: [3], version: 3 });
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
