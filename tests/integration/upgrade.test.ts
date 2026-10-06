import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, type Migration, migrate, MigrationError } from '../../src/server/db/migrations.ts';
import { buildSchemaV6, WP3_MIGRATIONS, WP3_SCHEMA_VERSION } from '../support/schemaV6.ts';

/*
 * WP4-T12A: the upgrade path of a populated database from schema 6 (the accepted WP3 build) to the latest schema
 * (docs/07 "Backup, restore and upgrades": apply versioned migrations once; an older binary never runs on a newer
 * schema; AC-11). The old database is built with the project's own migrations 1-6 and the real services (see
 * tests/support/schemaV6.ts). Nothing here pins the target number: it is derived from the migration list, so migrations
 * added later are covered as well. Synthetic data only; the directories are temporary.
 */

const LATEST = MIGRATIONS.length;
const PENDING = MIGRATIONS.filter((migration) => migration.version > WP3_SCHEMA_VERSION).map((migration) => migration.version);

const scratch = (): string => mkdtempSync(join(tmpdir(), 'timesheet-upgrade-'));

interface TableShape {
  name: string;
  columns: string[];
}

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

function tableShapes(db: Db): TableShape[] {
  const names = db.prepare<[], { name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  return names.map(({ name }) => ({
    name,
    columns: db.prepare<[string], { name: string }>('SELECT name FROM pragma_table_info(?) ORDER BY cid').all(name).map((column) => column.name),
  }));
}

/** Row count and a digest of every row (restricted to the given columns, in insertion order) of one table. */
function tableDigest(db: Db, table: TableShape): { rows: number; digest: string } {
  const rows = db.prepare(`SELECT ${table.columns.map((column) => `"${column}"`).join(', ')} FROM "${table.name}" ORDER BY rowid`).all();
  return { rows: rows.length, digest: sha256(JSON.stringify(rows)) };
}

interface Capture {
  shapes: TableShape[];
  digests: Record<string, { rows: number; digest: string }>;
  foreignKeys: Record<string, string[]>;
  triggers: string[];
  indexes: string[];
  migrations: unknown[];
  balances: unknown[];
  revisions: unknown[];
}

function capture(db: Db, shapes: TableShape[] = tableShapes(db)): Capture {
  return {
    shapes,
    digests: Object.fromEntries(shapes.map((shape) => [shape.name, tableDigest(db, shape)])),
    foreignKeys: Object.fromEntries(
      shapes.map((shape) => [
        shape.name,
        db
          .prepare<[string], { table: string; from: string; to: string | null }>('SELECT "table", "from", "to" FROM pragma_foreign_key_list(?) ORDER BY id, seq')
          .all(shape.name)
          .map((key) => `${key.from} -> ${key.table}.${key.to ?? ''}`),
      ]),
    ),
    triggers: db.prepare<[], { name: string }>("SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name").pluck().all() as unknown as string[],
    indexes: db.prepare<[], { name: string }>("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name").pluck().all() as unknown as string[],
    migrations: db.prepare('SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version').all(),
    balances: db.prepare('SELECT user_id, count(*) AS entries, sum(delta_minutes) AS minutes FROM ot_ledger GROUP BY user_id ORDER BY user_id').all(),
    revisions: db.prepare('SELECT user_id, count(*) AS revisions FROM timesheet_revisions GROUP BY user_id ORDER BY user_id').all(),
  };
}

/** The bookkeeping table legitimately grows with every applied migration; it is compared separately. */
const withoutBookkeeping = (digests: Capture['digests']): Capture['digests'] =>
  Object.fromEntries(Object.entries(digests).filter(([name]) => name !== 'schema_migrations'));

const version = (db: Db): number => Number(db.prepare('SELECT max(version) FROM schema_migrations').pluck().get());

describe('upgrade of a populated schema 6 database to the latest schema (AC-11)', () => {
  let dir: string;
  let db: Db;
  let before: Capture;
  let applied: { applied: number[]; version: number };

  beforeAll(async () => {
    dir = scratch();
    const fixture = await buildSchemaV6(dir);
    db = openDatabase(fixture.databasePath);
    expect(version(db)).toBe(WP3_SCHEMA_VERSION);
    before = capture(db);
    applied = migrate(db);
  });

  afterAll(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('starts from a really populated version 6 database', () => {
    expect(WP3_MIGRATIONS.map((migration) => migration.version)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const table of ['users', 'work_sessions', 'timesheet_revisions', 'signoffs', 'ot_ledger', 'jobs', 'delivery_attempts', 'attachments', 'audit_events']) {
      expect(before.digests[table]?.rows, table).toBeGreaterThan(0);
    }
    expect(before.triggers.length).toBeGreaterThan(10);
    expect(before.revisions).toHaveLength(1);
  });

  it('applies exactly the migrations after version 6, once, up to the latest', () => {
    expect(PENDING.length).toBeGreaterThan(0);
    expect(applied).toEqual({ applied: PENDING, version: LATEST });
    expect(version(db)).toBe(LATEST);
    expect(db.pragma('user_version', { simple: true })).toBe(LATEST);
    const after = capture(db, before.shapes);
    // The six applied migrations keep their name, checksum and application instant; the new ones follow.
    expect(after.migrations.slice(0, WP3_SCHEMA_VERSION)).toEqual(before.migrations);
    expect(after.migrations.map((row) => (row as { version: number }).version)).toEqual(MIGRATIONS.map((migration) => migration.version));
  });

  it('keeps every row of every version 6 table, column for column', () => {
    const after = capture(db, before.shapes);
    expect(withoutBookkeeping(after.digests)).toEqual(withoutBookkeeping(before.digests));
    const present = new Set(tableShapes(db).map((shape) => shape.name));
    for (const shape of before.shapes) expect(present.has(shape.name), shape.name).toBe(true);
  });

  it('keeps every foreign key and trigger, and the database is consistent', () => {
    const after = capture(db, before.shapes);
    for (const [table, keys] of Object.entries(before.foreignKeys)) {
      const current = capture(db, tableShapes(db)).foreignKeys[table] ?? [];
      for (const key of keys) expect(current, `${table}: ${key}`).toContain(key);
    }
    for (const trigger of before.triggers) expect(after.triggers, trigger).toContain(trigger);
    for (const index of before.indexes) expect(after.indexes, index).toContain(index);
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(db.pragma('foreign_key_check')).toEqual([]);
  });

  it('still refuses to rewrite or delete immutable history', () => {
    const refused = (sql: string): void => expect(() => db.prepare(sql).run(), sql).toThrow();
    refused('UPDATE ot_ledger SET delta_minutes = delta_minutes + 1');
    refused('DELETE FROM ot_ledger');
    refused('DELETE FROM timesheet_revisions');
    refused('DELETE FROM signoffs');
    refused('DELETE FROM audit_events');
    refused('DELETE FROM jobs');
    refused('DELETE FROM delivery_attempts');
    expect(withoutBookkeeping(capture(db, before.shapes).digests)).toEqual(withoutBookkeeping(before.digests));
  });

  it('keeps the representative OT balances and revision counts', () => {
    const after = capture(db, before.shapes);
    expect(after.balances).toEqual(before.balances);
    expect(after.revisions).toEqual(before.revisions);
    // Non-trivial: the sign-offs posted OT credits, so the compared balances are not zero.
    expect((before.balances as Array<{ minutes: number }>).some((row) => row.minutes > 0)).toBe(true);
  });

  it('a rerun applies nothing and changes nothing', () => {
    const everything = capture(db);
    expect(migrate(db)).toEqual({ applied: [], version: LATEST });
    expect(migrate(db)).toEqual({ applied: [], version: LATEST });
    expect(capture(db, everything.shapes)).toEqual(everything);
  });

  it('refuses a binary older than the database and changes nothing', () => {
    const everything = capture(db);
    expect(() => migrate(db, WP3_MIGRATIONS)).toThrow(MigrationError);
    expect(() => migrate(db, WP3_MIGRATIONS)).toThrow(/newer than this application/);
    expect(version(db)).toBe(LATEST);
    expect(capture(db, everything.shapes)).toEqual(everything);
    expect(db.inTransaction).toBe(false);
  });
});

describe('a database at a schema newer than the binary (docs/07: an older binary never runs on a newer schema)', () => {
  it('is refused before anything is applied or written', () => {
    const dir = scratch();
    const database = openDatabase(join(dir, 'newer.db'));
    try {
      expect(migrate(database)).toMatchObject({ version: LATEST });
      database.prepare("INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, 'from_a_newer_release', 'x', '2026-10-05T00:00:00Z')").run(LATEST + 1);
      const everything = capture(database);
      expect(() => migrate(database)).toThrow(MigrationError);
      expect(() => migrate(database)).toThrow(/newer than this application/);
      expect(capture(database, everything.shapes)).toEqual(everything);
      expect(database.inTransaction).toBe(false);
    } finally {
      database.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('a failed upgrade of a populated schema 6 database', () => {
  let dir: string;
  let original: string;

  beforeAll(async () => {
    dir = scratch();
    const fixture = await buildSchemaV6(dir);
    original = join(dir, 'schema6.db');
    cpSync(fixture.databasePath, original);
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('rolls back completely and a retry with the real migrations then succeeds', () => {
    const path = join(dir, 'failing.db');
    cpSync(original, path);
    const database = openDatabase(path);
    try {
      const everything = capture(database);
      const broken: Migration = {
        version: WP3_SCHEMA_VERSION + 1,
        name: 'broken_probe',
        sql: 'CREATE TABLE upgrade_probe (id INTEGER PRIMARY KEY); INSERT INTO table_that_does_not_exist VALUES (1);',
      };
      expect(() => migrate(database, [...WP3_MIGRATIONS, broken])).toThrow();
      expect(database.inTransaction).toBe(false);
      expect(version(database)).toBe(WP3_SCHEMA_VERSION);
      expect(database.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'upgrade_probe'").pluck().get()).toBe(0);
      expect(capture(database, everything.shapes)).toEqual(everything);
      expect(migrate(database)).toEqual({ applied: PENDING, version: LATEST });
      expect(database.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(database.pragma('foreign_key_check')).toEqual([]);
    } finally {
      database.close();
    }
  });
});
