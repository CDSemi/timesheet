import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate, MigrationError } from '../../src/server/db/migrations.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { MutableClock } from '../support/testApp.ts';

const EXPECTED_TABLES = [
  'audit_events',
  'auth_sessions',
  'calendar_versions',
  'calendars',
  'day_entries',
  'pay_periods',
  'payroll_exceptions',
  'schema_migrations',
  'session_breaks',
  'timesheets',
  'users',
  'work_policies',
  'work_sessions',
];

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
    expect(migrate(db)).toEqual({ applied: [1], version: 1 });
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .pluck()
      .all();
    expect(tables).toEqual(EXPECTED_TABLES);
    expect(db.pragma('user_version', { simple: true })).toBe(1);
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    expect(db.pragma('busy_timeout', { simple: true })).toBe(5000);
    expect(db.pragma('synchronous', { simple: true })).toBe(2);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    const recorded = db.prepare('SELECT version, name, checksum FROM schema_migrations').get() as {
      version: number;
      name: string;
      checksum: string;
    };
    const sql = MIGRATIONS[0]?.sql ?? '';
    expect(recorded).toEqual({ version: 1, name: 'initial', checksum: createHash('sha256').update(sql).digest('hex') });
    const strictTables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND sql LIKE '%) STRICT' ORDER BY name")
      .pluck()
      .all();
    expect(strictTables).toEqual(EXPECTED_TABLES);
  });

  it('is idempotent: a second run applies nothing', () => {
    migrate(db);
    expect(migrate(db)).toEqual({ applied: [], version: 1 });
  });

  it('refuses a database whose applied migration checksum changed', () => {
    migrate(db);
    db.prepare("UPDATE schema_migrations SET checksum = 'tampered' WHERE version = 1").run();
    expect(() => migrate(db)).toThrow(MigrationError);
  });

  it('refuses a database newer than the application (no silent downgrade)', () => {
    migrate(db);
    db.prepare("INSERT INTO schema_migrations VALUES (2, 'future', 'x', '2026-09-29T00:00:00Z')").run();
    expect(() => migrate(db)).toThrow(/newer than this application/);
  });

  it('rolls back a failing migration completely', () => {
    const broken = [...MIGRATIONS, { version: 2, name: 'broken', sql: 'CREATE TABLE ok_table (x INTEGER); SELECT * FROM missing_table;' }];
    migrate(db);
    expect(() => migrate(db, broken)).toThrow();
    expect(db.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'ok_table'").pluck().get()).toBe(0);
    expect(db.pragma('user_version', { simple: true })).toBe(1);
  });

  it('also migrates an in-memory database', () => {
    const memory = openDatabase(':memory:');
    try {
      expect(migrate(memory).version).toBe(1);
    } finally {
      memory.close();
    }
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
