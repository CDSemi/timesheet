import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync,
  constants,
  copyFileSync,
  createReadStream,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { performance } from 'node:perf_hooks';
import Database from 'better-sqlite3';
import { type Clock, nowUtc } from '../clock.ts';
import { openDatabase, writeTransaction } from '../db/database.ts';
import { FileStore, isStorageKey } from '../files/fileStore.ts';
import {
  BACKUP_DATABASE_NAME,
  BACKUP_FILES_DIR,
  type BackupFileKind,
  type BackupManifest,
  buildManifest,
  MANIFEST_FILE_NAME,
  serializeManifest,
} from './manifest.ts';

/*
 * Consistent backup while the application keeps writing (WP4-T05; docs/07 "Backup, restore and upgrades", AC-11).
 *
 * Consistency approach (no pause): the database is copied with SQLite's online backup API from this module's OWN
 * read-only connection, in ONE backup step (all pages at once), so the copy is one read transaction: a single
 * point-in-time image that includes the WAL, never the live main file alone. Private files need no pause because of
 * the file store contract (O7, docs/03 "Atomicity and snapshots"): a file is written to `tmp/`, flushed and renamed to
 * its final key BEFORE the row that refers to it commits, files are immutable, and a referenced file is never removed.
 * So every storage key the snapshot refers to already exists, complete, when the snapshot is taken, and stays. The keys
 * are read from the COPY (not the live database), each file is copied and its copy is hashed and compared with the
 * SHA-256 and size recorded in the snapshot; files and rows written after the snapshot are simply not part of it.
 *
 * The copy is then checked (`PRAGMA integrity_check`, `PRAGMA foreign_key_check`) and turned into a single
 * self-contained file (journal_mode DELETE, no -wal or -shm). Everything is written into a hidden staging folder
 * inside the target, flushed, and renamed to its final name in one step, so a backup folder either is complete with
 * its `manifest.json` or does not exist; a failed attempt removes exactly the files it created. The outcome and its
 * time are recorded in `operations_state` (migration 0009) of the live database, never inside the snapshot.
 *
 * The target must lie outside the private data directory (DATA_DIR). Nothing here prints or stores a path, a name or
 * an email address; failures carry a fixed code only. Pruning old backups lives in prune.ts (owner decision F-5).
 */

/** A fault of an attempted backup; recorded in operations_state as the fault code. */
export type BackupFaultCode =
  | 'database_unavailable'
  | 'integrity_check_failed'
  | 'foreign_key_violation'
  | 'file_missing'
  | 'file_size_mismatch'
  | 'file_hash_mismatch'
  | 'write_failed';

/** A refusal before anything is read or written; not recorded as an attempt. */
export type BackupRefusalCode = 'target_inside_data_dir' | 'target_unusable';

const MESSAGES: Record<BackupFaultCode | BackupRefusalCode, string> = {
  target_inside_data_dir: 'The backup target must be outside the private data directory (DATA_DIR)',
  target_unusable: 'The backup target cannot be created or is not a directory',
  database_unavailable: 'The database could not be opened or copied',
  integrity_check_failed: 'The database copy failed its integrity check',
  foreign_key_violation: 'The database copy has foreign key violations',
  file_missing: 'A file the database refers to is missing from the private data directory',
  file_size_mismatch: 'A copied file does not have the size recorded in the database',
  file_hash_mismatch: 'A copied file does not match the SHA-256 recorded in the database',
  write_failed: 'The backup could not be written to the target',
};

const REFUSALS: ReadonlySet<string> = new Set<BackupRefusalCode>(['target_inside_data_dir', 'target_unusable']);

export class BackupError extends Error {
  readonly code: BackupFaultCode | BackupRefusalCode;

  constructor(code: BackupFaultCode | BackupRefusalCode, options?: { cause?: unknown }) {
    super(MESSAGES[code], options);
    this.name = 'BackupError';
    this.code = code;
  }

  /** True for a refusal of the request (exit 2), false for a failed attempt (exit 1). */
  get refusal(): boolean {
    return REFUSALS.has(this.code);
  }
}

/** Test seams; production passes none. */
export interface BackupHooks {
  /** Runs after the database snapshot is taken and before its files are read or copied. */
  afterSnapshot?: () => void | Promise<void>;
}

export interface BackupRequest {
  /** The live SQLite database (DATABASE_PATH). */
  databasePath: string;
  /** The private data directory (DATA_DIR); its `files/` holds the referenced objects. */
  dataDir: string;
  /** Directory that receives the backup folder; created if missing; must be outside `dataDir`. */
  targetDir: string;
  clock: Clock;
  /** Defaults to the version in package.json. */
  appVersion?: string;
  hooks?: BackupHooks;
}

export interface BackupResult {
  /** Absolute path of the finished backup folder (for the caller; never printed by the CLI). */
  directory: string;
  /** Folder name: `timesheet-backup-<UTC instant>-<random>`. */
  name: string;
  manifest: BackupManifest;
  durationMs: number;
  /** False when the live database has no backup status columns yet (schema older than 9) or the write failed. */
  statusRecorded: boolean;
}

/** Copy every remaining page in one backup step, so the copy is a single read transaction of the source. */
const ALL_REMAINING_PAGES = 0x7fffffff;
const BUSY_TIMEOUT_MS = 5000;
const VERSION_PATTERN = /^\d+\.\d+\.\d+[0-9A-Za-z.+-]*$/;

/** The application version from package.json (two levels above `server/ops` in both src/ and dist/). */
export function readAppVersion(): string {
  try {
    const parsed: unknown = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
    const version = typeof parsed === 'object' && parsed !== null && 'version' in parsed ? parsed.version : undefined;
    if (typeof version === 'string' && VERSION_PATTERN.test(version)) return version;
  } catch {
    // fall through
  }
  return 'unknown';
}

/** The real path of `path`, resolving links of its existing part (the rest may not exist yet). */
function canonical(path: string): string {
  let current = resolve(path);
  const rest: string[] = [];
  for (;;) {
    try {
      return join(realpathSync.native(current), ...rest);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
      const parent = dirname(current);
      if (parent === current) return resolve(path);
      rest.unshift(basename(current));
      current = parent;
    }
  }
}

/** True when `child` is `parent` or lies below it (case-insensitive on Windows through `path.relative`). */
function isInside(child: string, parent: string): boolean {
  const between = relative(parent, child);
  return between === '' || (between !== '..' && !between.startsWith(`..${sep}`) && !isAbsolute(between));
}

function prepareTarget(targetDir: string, dataDir: string): string {
  let target: string;
  let data: string;
  try {
    target = canonical(targetDir);
    data = canonical(dataDir);
  } catch (error) {
    throw new BackupError('target_unusable', { cause: error });
  }
  if (isInside(target, data)) throw new BackupError('target_inside_data_dir');
  try {
    mkdirSync(target, { recursive: true, mode: 0o700 });
    if (!statSync(target).isDirectory()) throw new Error('not a directory');
    target = canonical(target);
  } catch (error) {
    throw new BackupError('target_unusable', { cause: error });
  }
  if (isInside(target, data)) throw new BackupError('target_inside_data_dir');
  return target;
}

function errorCode(error: unknown): string | undefined {
  return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}

function fsyncFile(path: string): void {
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Flushes a directory entry change (the rename) where the platform supports it; Windows does not. */
function fsyncDirectory(path: string): void {
  if (process.platform === 'win32') return;
  const fd = openSync(path, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

async function hashFile(path: string): Promise<{ sha256: string; sizeBytes: number }> {
  const hash = createHash('sha256');
  let sizeBytes = 0;
  for await (const chunk of createReadStream(path)) {
    const bytes = chunk as Buffer;
    hash.update(bytes);
    sizeBytes += bytes.length;
  }
  return { sha256: hash.digest('hex'), sizeBytes };
}

/** The online backup of the live database into `destination`, from a fresh read-only connection. */
async function snapshotDatabase(databasePath: string, destination: string): Promise<void> {
  if (!existsSync(databasePath)) throw new BackupError('database_unavailable');
  let source: Database.Database | undefined;
  try {
    source = new Database(databasePath, { readonly: true, fileMustExist: true });
    source.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
    await source.backup(destination, { progress: () => ALL_REMAINING_PAGES });
  } catch (error) {
    throw new BackupError('database_unavailable', { cause: error });
  } finally {
    source?.close();
  }
}

interface SnapshotFile {
  storage_key: string;
  kind: BackupFileKind;
  sha256: string;
  size_bytes: number;
}

/** Checks the copy, makes it a single file and reads its schema version and referenced files. */
function inspectCopy(path: string): { schemaVersion: number; files: SnapshotFile[] } {
  let copy: Database.Database | undefined;
  try {
    copy = new Database(path, { fileMustExist: true });
    copy.pragma('journal_mode = DELETE');
    const integrity = copy.pragma('integrity_check') as Array<{ integrity_check: string }>;
    if (integrity.length !== 1 || integrity[0]?.integrity_check !== 'ok') throw new BackupError('integrity_check_failed');
    if ((copy.pragma('foreign_key_check') as unknown[]).length > 0) throw new BackupError('foreign_key_violation');
    const schemaVersion = Number(copy.prepare('SELECT coalesce(max(version), 0) FROM schema_migrations').pluck().get());
    const hasAttachments = copy.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'attachments'").pluck().get() === 1;
    const files = hasAttachments
      ? copy.prepare<[], SnapshotFile>('SELECT storage_key, kind, sha256, size_bytes FROM attachments ORDER BY storage_key').all()
      : [];
    for (const file of files) {
      if (!isStorageKey(file.storage_key)) throw new BackupError('integrity_check_failed');
    }
    return { schemaVersion, files };
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError('database_unavailable', { cause: error });
  } finally {
    copy?.close();
  }
}

/** Copies one referenced file, then hashes the COPY and compares it with the snapshot's record. */
async function copyVerified(store: FileStore, file: SnapshotFile, destination: string, created: string[]): Promise<void> {
  const source = store.pathOf(file.storage_key);
  try {
    copyFileSync(source, destination, constants.COPYFILE_EXCL);
  } catch (error) {
    if (errorCode(error) === 'ENOENT' && !existsSync(source)) throw new BackupError('file_missing', { cause: error });
    throw new BackupError('write_failed', { cause: error });
  }
  created.push(destination);
  const copied = await hashFile(destination);
  if (copied.sizeBytes !== file.size_bytes) throw new BackupError('file_size_mismatch');
  if (copied.sha256 !== file.sha256) throw new BackupError('file_hash_mismatch');
  fsyncFile(destination);
}

function writeNewFile(path: string, text: string): void {
  const bytes = Buffer.from(text, 'utf8');
  const fd = openSync(path, 'wx', 0o600);
  try {
    let written = 0;
    while (written < bytes.length) written += writeSync(fd, bytes, written, bytes.length - written);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Removes exactly what a failed attempt created: its files, then its (now empty) folders. */
function removeStaging(staging: string, created: readonly string[]): void {
  for (const path of [...created].reverse()) {
    try {
      unlinkSync(path);
    } catch {
      // never created or already gone
    }
  }
  for (const folder of [join(staging, BACKUP_FILES_DIR), staging]) {
    try {
      rmdirSync(folder);
    } catch {
      // never created, or not empty because something else wrote there: left for the operator
    }
  }
}

/**
 * Records the outcome of an attempt in the live database. Returns false (and records nothing) when the database does
 * not exist or has no backup status columns yet (schema older than migration 0009), or when the write fails: the
 * backup itself is never undone because its status could not be written.
 */
function recordStatus(databasePath: string, clock: Clock, fault: BackupFaultCode | null): boolean {
  if (!existsSync(databasePath)) return false;
  let db: ReturnType<typeof openDatabase> | undefined;
  try {
    db = openDatabase(databasePath);
    const live = db;
    const columns = live.prepare("SELECT name FROM pragma_table_info('operations_state')").pluck().all();
    if (!columns.includes('backup_last_outcome')) return false;
    const at = nowUtc(clock);
    writeTransaction(live, () => {
      if (fault === null) {
        live
          .prepare(
            `UPDATE operations_state SET backup_last_attempt_at = ?, backup_last_outcome = 'succeeded', backup_last_fault_code = NULL,
               backup_last_success_at = ? WHERE id = 1`,
          )
          .run(at, at);
      } else {
        live
          .prepare("UPDATE operations_state SET backup_last_attempt_at = ?, backup_last_outcome = 'failed', backup_last_fault_code = ? WHERE id = 1")
          .run(at, fault);
      }
    });
    return true;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

/** Takes one backup into a new folder under `request.targetDir`; see the module comment for the guarantees. */
export async function createBackup(request: BackupRequest): Promise<BackupResult> {
  const started = performance.now();
  const target = prepareTarget(request.targetDir, request.dataDir);
  const createdAt = nowUtc(request.clock);
  const name = `timesheet-backup-${createdAt.replace(/[-:]/g, '')}-${randomBytes(4).toString('hex')}`;
  const staging = join(target, `.partial-${name}`);
  const directory = join(target, name);
  const databaseCopy = join(staging, BACKUP_DATABASE_NAME);
  // Files this attempt creates, removed again if it fails (SQLite side files included in case it stopped midway).
  const created: string[] = [databaseCopy, `${databaseCopy}-wal`, `${databaseCopy}-shm`, `${databaseCopy}-journal`];
  let manifest: BackupManifest;
  try {
    try {
      mkdirSync(staging, { mode: 0o700 });
      mkdirSync(join(staging, BACKUP_FILES_DIR), { mode: 0o700 });
    } catch (error) {
      throw new BackupError('write_failed', { cause: error });
    }
    await snapshotDatabase(request.databasePath, databaseCopy);
    await request.hooks?.afterSnapshot?.();
    const snapshot = inspectCopy(databaseCopy);

    const store = new FileStore(request.dataDir);
    for (const file of snapshot.files) {
      await copyVerified(store, file, join(staging, BACKUP_FILES_DIR, file.storage_key), created);
    }
    fsyncFile(databaseCopy);
    const database = await hashFile(databaseCopy);
    manifest = buildManifest({
      appVersion: request.appVersion ?? readAppVersion(),
      schemaVersion: snapshot.schemaVersion,
      createdAt,
      database,
      files: snapshot.files.map((file) => ({ storageKey: file.storage_key, kind: file.kind, sha256: file.sha256, sizeBytes: file.size_bytes })),
    });
    const manifestPath = join(staging, MANIFEST_FILE_NAME);
    try {
      created.push(manifestPath);
      writeNewFile(manifestPath, serializeManifest(manifest));
      fsyncDirectory(join(staging, BACKUP_FILES_DIR));
      fsyncDirectory(staging);
      renameSync(staging, directory);
      fsyncDirectory(target);
    } catch (error) {
      throw new BackupError('write_failed', { cause: error });
    }
  } catch (error) {
    removeStaging(staging, created);
    const failure = error instanceof BackupError ? error : new BackupError('write_failed', { cause: error });
    if (!failure.refusal) recordStatus(request.databasePath, request.clock, failure.code as BackupFaultCode);
    throw failure;
  }
  const statusRecorded = recordStatus(request.databasePath, request.clock, null);
  return { directory, name, manifest, durationMs: Math.round(performance.now() - started), statusRecorded };
}
