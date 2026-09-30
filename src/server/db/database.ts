import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

export type Db = Database.Database;

/**
 * Opens the single local SQLite database with the invariants from doc 03: foreign keys,
 * WAL, a busy timeout and full synchronous commits for ledger-grade durability.
 */
export function openDatabase(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

/** Runs `work` in a short BEGIN IMMEDIATE transaction (no network calls inside). */
export function writeTransaction<T>(db: Db, work: () => T): T {
  return db.transaction(work).immediate();
}
