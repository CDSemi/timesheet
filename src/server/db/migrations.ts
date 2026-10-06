import { createHash } from 'node:crypto';
import type { Db } from './database.ts';
import { migration0001 } from './migrations/0001_initial.ts';
import { migration0002 } from './migrations/0002_ot_ledger.ts';
import { migration0003 } from './migrations/0003_day_entry_source.ts';
import { migration0004 } from './migrations/0004_submission.ts';
import { migration0005 } from './migrations/0005_automatic_presentation.ts';
import { migration0006 } from './migrations/0006_timesheet_shares.ts';
import { migration0007 } from './migrations/0007_audit_access.ts';
import { migration0008 } from './migrations/0008_bootstrap.ts';
import { migration0009 } from './migrations/0009_operations_backup.ts';
import { migration0010 } from './migrations/0010_outbound_pause.ts';
import { migration0011 } from './migrations/0011_job_retention.ts';
import { migration0012 } from './migrations/0012_imports.ts';
import { migration0013 } from './migrations/0013_ot_opening_balance.ts';

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

/** Ordered, append-only list. Never edit an applied migration; add a new one. */
export const MIGRATIONS: readonly Migration[] = [
  migration0001,
  migration0002,
  migration0003,
  migration0004,
  migration0005,
  migration0006,
  migration0007,
  migration0008,
  migration0009,
  migration0010,
  migration0011,
  migration0012,
  migration0013,
];

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

export interface MigrationResult {
  applied: number[];
  version: number;
}

export function migrationChecksum(migration: Migration): string {
  return createHash('sha256').update(migration.sql).digest('hex');
}

interface ForeignKeyViolation {
  table: string;
  rowid: number | null;
  parent: string;
  fkid: number;
}

/**
 * Applies pending migrations once, under an exclusive lock, in one transaction. Refuses
 * to run when the database has an unknown (newer) version or an applied migration's
 * checksum changed, so an older binary never runs against a newer schema.
 *
 * Foreign key enforcement is off while the transaction runs and restored afterwards, as
 * SQLite's table-rebuild procedure requires (the pragma is a no-op inside a transaction,
 * and DROP TABLE of a referenced table would otherwise leave deferred violations that no
 * rename clears; migration 0013). Instead, when anything was applied, `foreign_key_check`
 * must report nothing before COMMIT, else the whole run rolls back.
 */
export function migrate(db: Db, migrations: readonly Migration[] = MIGRATIONS, now: Date = new Date()): MigrationResult {
  const ordered = [...migrations].sort((a, b) => a.version - b.version);
  ordered.forEach((migration, index) => {
    if (migration.version !== index + 1) throw new MigrationError('Migration versions must be contiguous from 1');
  });
  const appliedAt = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const foreignKeys = db.pragma('foreign_keys', { simple: true }) === 1;
  if (foreignKeys) db.pragma('foreign_keys = OFF');
  try {
    return migrateLocked(db, ordered, appliedAt);
  } finally {
    if (foreignKeys) db.pragma('foreign_keys = ON');
  }
}

function migrateLocked(db: Db, ordered: readonly Migration[], appliedAt: string): MigrationResult {
  db.exec('BEGIN EXCLUSIVE');
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL
    ) STRICT`);
    const rows = db
      .prepare('SELECT version, checksum FROM schema_migrations ORDER BY version')
      .all() as Array<{ version: number; checksum: string }>;
    for (const row of rows) {
      const known = ordered.find((migration) => migration.version === row.version);
      if (known === undefined) {
        throw new MigrationError(`Database schema version ${row.version} is newer than this application`);
      }
      if (migrationChecksum(known) !== row.checksum) {
        throw new MigrationError(`Applied migration ${row.version} (${known.name}) has a different checksum`);
      }
    }
    const current = rows.at(-1)?.version ?? 0;
    const applied: number[] = [];
    const record = db.prepare('INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)');
    for (const migration of ordered) {
      if (migration.version <= current) continue;
      db.exec(migration.sql);
      record.run(migration.version, migration.name, migrationChecksum(migration), appliedAt);
      applied.push(migration.version);
    }
    if (applied.length > 0) {
      const violations = db.pragma('foreign_key_check') as ForeignKeyViolation[];
      if (violations.length > 0) {
        const tables = [...new Set(violations.map((violation) => violation.table))].sort().join(', ');
        throw new MigrationError(`Migration left ${violations.length} foreign key violation(s) in ${tables}`);
      }
    }
    const version = applied.at(-1) ?? current;
    db.pragma(`user_version = ${version}`);
    db.exec('COMMIT');
    return { applied, version };
  } catch (error) {
    if (db.inTransaction) db.exec('ROLLBACK');
    throw error;
  }
}
