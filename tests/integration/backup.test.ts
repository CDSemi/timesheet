import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate } from '../../src/server/db/migrations.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { BackupError, type BackupResult, createBackup } from '../../src/server/ops/backup.ts';
import { BACKUP_DATABASE_NAME, BACKUP_FILES_DIR, type BackupManifest, MANIFEST_FILE_NAME, MANIFEST_KEY_PATHS } from '../../src/server/ops/manifest.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { backupStatusJson, getBackupStatus } from '../../src/server/services/operationsStatus.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { commitImport, previewImport } from '../../src/server/services/workbookImport.ts';
import { BackgroundWriter, type WriterSummary } from '../support/concurrency.ts';
import { buildSyntheticWorkbook } from '../support/syntheticWorkbook.ts';
import { createTestContext, MutableClock, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T05: a consistent backup taken while writes continue (AC-11, docs/07 "Backup, restore and upgrades").
 *
 * A worker thread (tests/support/concurrency.ts) keeps writing through the production services on its own connection
 * and file store: finalizations that produce signature images and PDFs, day edits and ledger posts. The backup runs on
 * the test thread at the same time. Each backup is then restored into an isolated directory and checked against the
 * live source: integrity and foreign keys, every referenced file present with its recorded SHA-256, and the OT ledger
 * equal to the source at the snapshot. The ledger is append-only, so "the source at the snapshot" is the source's
 * ledger up to the copy's last row, and the copy must hold at least every row committed before the backup began.
 */

const NOW = '2026-09-29T20:00:00Z';
const PAYROLL = '2026-10-02';
const BACKUP_ROUNDS = 3;
const SHA256 = /^[0-9a-f]{64}$/;

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

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

function dataDirOf(t: TestContext): string {
  return join(dirname(t.config.databasePath), 'private-data');
}

function scratch(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

/** Every key path of a JSON value; array elements collapse into `name[]`. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => keyPaths(item, `${prefix}[]`));
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return [path, ...keyPaths(child, path)];
  });
}

function readManifest(directory: string): BackupManifest {
  return JSON.parse(readFileSync(join(directory, MANIFEST_FILE_NAME), 'utf8')) as BackupManifest;
}

interface LedgerRow {
  rowid: number;
  id: string;
  user_id: string;
  delta_minutes: number;
}

function ledgerRows(db: Db, maxRowid = Number.MAX_SAFE_INTEGER): LedgerRow[] {
  return db.prepare<[number], LedgerRow>('SELECT rowid, id, user_id, delta_minutes FROM ot_ledger WHERE rowid <= ? ORDER BY rowid').all(maxRowid);
}

const sumOf = (rows: readonly LedgerRow[]): number => rows.reduce((total, row) => total + row.delta_minutes, 0);

interface SourceMark {
  ledgerMaxRowid: number;
  attachments: number;
  revisions: number;
}

function markOf(db: Db): SourceMark {
  return {
    ledgerMaxRowid: Number(db.prepare('SELECT coalesce(max(rowid), 0) FROM ot_ledger').pluck().get()),
    attachments: Number(db.prepare('SELECT count(*) FROM attachments').pluck().get()),
    revisions: Number(db.prepare('SELECT count(*) FROM timesheet_revisions').pluck().get()),
  };
}

/**
 * Restores a backup folder into a fresh isolated directory (database copy plus `files/`), opens it with the production
 * `openDatabase` and checks it against the live source and the mark taken just before the backup began.
 */
function verifyRestored(source: Db, backup: BackupResult, before: SourceMark): { files: number; ledgerRows: number; ledgerSum: number; ledgerMaxRowid: number } {
  const manifest = readManifest(backup.directory);
  expect(manifest).toEqual(backup.manifest);
  const restoreDir = scratch('timesheet-restore-');
  try {
    // Isolated restore: copy the database and the listed files only.
    const restoredDb = join(restoreDir, 'restored.db');
    const dbBytes = readFileSync(join(backup.directory, BACKUP_DATABASE_NAME));
    expect(sha256(dbBytes)).toBe(manifest.database.sha256);
    expect(dbBytes.length).toBe(manifest.database.size_bytes);
    copyFileSync(join(backup.directory, BACKUP_DATABASE_NAME), restoredDb);
    const restoredFiles = new FileStore(join(restoreDir, 'private-data'));
    mkdirSync(join(restoreDir, 'private-data', 'files'), { recursive: true });
    const copiedKeys = readdirSync(join(backup.directory, BACKUP_FILES_DIR)).sort();
    expect(copiedKeys).toEqual(manifest.files.map((file) => file.storage_key));
    for (const key of copiedKeys) copyFileSync(join(backup.directory, BACKUP_FILES_DIR, key), restoredFiles.pathOf(key));

    const copy = openDatabase(restoredDb);
    try {
      expect(copy.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(copy.pragma('foreign_key_check')).toEqual([]);
      expect(copy.prepare('SELECT max(version) FROM schema_migrations').pluck().get()).toBe(MIGRATIONS.length);
      expect(manifest.schema_version).toBe(MIGRATIONS.length);

      // Every referenced file is present and matches the SHA-256 and size recorded in the snapshot.
      const attachments = copy
        .prepare<[], { storage_key: string; kind: string; sha256: string; size_bytes: number }>(
          'SELECT storage_key, kind, sha256, size_bytes FROM attachments ORDER BY storage_key',
        )
        .all();
      expect(attachments.length).toBeGreaterThan(0);
      expect(manifest.files).toEqual(attachments);
      for (const row of attachments) {
        const bytes = restoredFiles.read(row.storage_key);
        expect(sha256(bytes), row.kind).toBe(row.sha256);
        expect(bytes.length).toBe(row.size_bytes);
      }

      // Freshness: everything committed before the backup began is in the snapshot.
      const copyMark = markOf(copy);
      expect(copyMark.ledgerMaxRowid).toBeGreaterThanOrEqual(before.ledgerMaxRowid);
      expect(copyMark.attachments).toBeGreaterThanOrEqual(before.attachments);
      expect(copyMark.revisions).toBeGreaterThanOrEqual(before.revisions);

      // The ledger equals the source at the snapshot: the same rows in the same order, so the same sums per owner.
      const copied = ledgerRows(copy);
      const sourceAtSnapshot = ledgerRows(source, copyMark.ledgerMaxRowid);
      expect(copied).toEqual(sourceAtSnapshot);
      expect(sumOf(copied)).toBe(sumOf(sourceAtSnapshot));
      // Every finalized revision in the copy has its ledger lines and its jobs (one transaction, never torn).
      expect(
        copy
          .prepare(
            `SELECT count(*) FROM timesheet_revisions r
              WHERE NOT EXISTS (SELECT 1 FROM revision_ledger_lines l WHERE l.revision_id = r.id AND l.user_id = r.user_id)
                 OR NOT EXISTS (SELECT 1 FROM jobs j WHERE j.revision_id = r.id AND j.user_id = r.user_id AND j.kind = 'render_pdf')`,
          )
          .pluck()
          .get(),
      ).toBe(0);
      return { files: attachments.length, ledgerRows: copied.length, ledgerSum: sumOf(copied), ledgerMaxRowid: copyMark.ledgerMaxRowid };
    } finally {
      copy.close();
    }
  } finally {
    rmSync(restoreDir, { recursive: true, force: true });
  }
}

describe('backup while a writer loop runs (AC-11)', () => {
  let t: TestContext;
  let writer: BackgroundWriter | null = null;
  let target: string;

  beforeAll(async () => {
    t = await createTestContext(NOW);
    target = scratch('timesheet-backups-');
    writer = await BackgroundWriter.start({ dbPath: t.config.databasePath, dataDir: dataDirOf(t), nowIso: NOW, calendarId: t.calendarId, payrollDate: PAYROLL });
  });

  afterAll(async () => {
    if (writer !== null) await writer.stop();
    t.close();
    rmSync(target, { recursive: true, force: true });
  });

  it(`takes ${BACKUP_ROUNDS} consistent backups while finalizations, PDFs, signatures, day edits and ledger posts continue`, async () => {
    const running = writer;
    if (running === null) throw new Error('writer not started');
    // Let the writer build up history (several finalizations with PDFs) before the first backup.
    await running.waitForCommits(30);
    const results: Array<{ files: number; ledgerRows: number; writesDuringBackup: number; writesAfterSnapshot: number }> = [];
    for (let round = 0; round < BACKUP_ROUNDS; round += 1) {
      const before = markOf(t.db);
      const commitsBefore = running.commits;
      let commitsAtSnapshot = 0;
      let commitsAfterWait = 0;
      const backup = await createBackup({
        databasePath: t.config.databasePath,
        dataDir: dataDirOf(t),
        targetDir: target,
        clock: t.clock,
        hooks: {
          // Writes land between the database snapshot and the file copy: new rows and files that the snapshot
          // does not refer to, while the snapshot's files are being copied.
          afterSnapshot: async () => {
            commitsAtSnapshot = running.commits;
            commitsAfterWait = await running.waitForCommits(commitsAtSnapshot + 3);
          },
        },
      });
      const commitsAfter = running.commits;
      const verified = verifyRestored(t.db, backup, before);
      results.push({ files: verified.files, ledgerRows: verified.ledgerRows, writesDuringBackup: commitsAfter - commitsBefore, writesAfterSnapshot: commitsAfterWait - commitsAtSnapshot });
      expect(commitsAfter - commitsBefore).toBeGreaterThanOrEqual(3);
      // The source moved on after the snapshot, so the copy is a real point-in-time image, not the end state.
      expect(markOf(t.db).ledgerMaxRowid).toBeGreaterThan(verified.ledgerMaxRowid);
    }
    const summary: WriterSummary = await running.stop();
    writer = null;
    console.info(`[backup-under-writes] ${JSON.stringify({ results, writer: { ...summary, errors: summary.errors.length } })}`);
    expect(summary.errors).toEqual([]);
    expect(summary.finalizations).toBeGreaterThanOrEqual(3);
    expect(summary.pdfs).toBeGreaterThanOrEqual(3);
    expect(summary.signatures).toBeGreaterThanOrEqual(3);
    // Backups never collide and leave no partial folder behind.
    const folders = readdirSync(target).sort();
    expect(folders).toHaveLength(BACKUP_ROUNDS);
    for (const folder of folders) expect(folder).toMatch(/^timesheet-backup-\d{8}T\d{6}Z-[0-9a-f]{8}$/);
    // Success and its time are recorded in operations_state.
    expect(backupStatusJson(getBackupStatus(t.db))).toEqual({ outcome: 'succeeded', last_attempt_at: NOW, last_success_at: NOW, fault_code: null });
  });
});

describe('backup refusals, failures and status', () => {
  let t: TestContext;
  let target: string;

  beforeAll(async () => {
    t = await createTestContext(NOW);
    target = scratch('timesheet-backups-');
  });

  afterAll(() => {
    t.close();
    rmSync(target, { recursive: true, force: true });
  });

  function request(overrides: { targetDir?: string } = {}) {
    return { databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: overrides.targetDir ?? target, clock: t.clock };
  }

  it('starts with no backup recorded', () => {
    expect(backupStatusJson(getBackupStatus(t.db))).toEqual({ outcome: 'never', last_attempt_at: null, last_success_at: null, fault_code: null });
  });

  it('refuses a target inside the private data directory and writes nothing', async () => {
    const files = new FileStore(dataDirOf(t));
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(7), 'image/png');
    for (const inside of [dataDirOf(t), join(dataDirOf(t), 'backups'), join(dataDirOf(t), 'files', '..', 'nested')]) {
      await expect(createBackup(request({ targetDir: inside }))).rejects.toMatchObject({ name: 'BackupError', code: 'target_inside_data_dir' });
    }
    expect(existsSync(join(dataDirOf(t), 'backups'))).toBe(false);
    expect(existsSync(join(dataDirOf(t), 'nested'))).toBe(false);
    expect(getBackupStatus(t.db).outcome).toBe('never');
  });

  it('records success, then a hash mismatch fails the backup, keeps the last success and leaves no partial folder', async () => {
    const ok = await createBackup(request());
    expect(ok.manifest.files.length).toBeGreaterThan(0);
    expect(ok.statusRecorded).toBe(true);
    expect(readdirSync(target)).toEqual([ok.name]);

    // A referenced file whose bytes no longer match the recorded SHA-256 (same size: only hashing can tell).
    const row = t.db.prepare<[], { storage_key: string }>("SELECT storage_key FROM attachments WHERE kind = 'signature' ORDER BY created_at LIMIT 1").get();
    if (row === undefined) throw new Error('no signature');
    const path = new FileStore(dataDirOf(t)).pathOf(row.storage_key);
    const original = readFileSync(path);
    const tampered = Buffer.from(original);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] ?? 0) ^ 0xff;
    writeFileSync(path, tampered);
    t.clock.set('2026-09-29T21:00:00Z');
    try {
      const failure = await createBackup(request()).then(
        () => null,
        (error: unknown) => error,
      );
      expect(failure).toBeInstanceOf(BackupError);
      expect((failure as BackupError).code).toBe('file_hash_mismatch');
      expect(backupStatusJson(getBackupStatus(t.db))).toEqual({
        outcome: 'failed',
        last_attempt_at: '2026-09-29T21:00:00Z',
        last_success_at: NOW,
        fault_code: 'file_hash_mismatch',
      });
      expect(readdirSync(target)).toEqual([ok.name]);

      // A missing referenced file fails the same way with its own code.
      writeFileSync(path, original);
      const moved = `${path}.moved`;
      copyFileSync(path, moved);
      rmSync(path);
      const missing = await createBackup(request()).then(
        () => null,
        (error: unknown) => error,
      );
      copyFileSync(moved, path);
      rmSync(moved);
      expect((missing as BackupError).code).toBe('file_missing');
      expect(readdirSync(target)).toEqual([ok.name]);

      // Restored bytes: the next backup succeeds again and records the new time.
      t.clock.set('2026-09-29T22:00:00Z');
      const again = await createBackup(request());
      expect(backupStatusJson(getBackupStatus(t.db))).toEqual({
        outcome: 'succeeded',
        last_attempt_at: '2026-09-29T22:00:00Z',
        last_success_at: '2026-09-29T22:00:00Z',
        fault_code: null,
      });
      expect(readdirSync(target).sort()).toEqual([ok.name, again.name].sort());
    } finally {
      writeFileSync(path, original);
      t.clock.set(NOW);
    }
  });

  it('writes a manifest and a status with exactly the allowed keys and nothing personal', async () => {
    const backup = await createBackup(request());
    const manifest = readManifest(backup.directory);
    expect([...new Set(keyPaths(manifest))].sort()).toEqual([...MANIFEST_KEY_PATHS].sort());
    expect(Object.keys(backupStatusJson(getBackupStatus(t.db))).sort()).toEqual(['fault_code', 'last_attempt_at', 'last_success_at', 'outcome']);
    const text = readFileSync(join(backup.directory, MANIFEST_FILE_NAME), 'utf8');
    expect(text.includes('\r')).toBe(false);
    for (const value of [t.emails.admin, t.emails.employee, '@', dataDirOf(t), target, dirname(t.config.databasePath), 'Synthetic']) {
      expect(text.includes(value), value).toBe(false);
    }
    expect(manifest).toMatchObject({ format: 'timesheet-backup', format_version: 1, created_at: NOW, schema_version: MIGRATIONS.length });
    expect(manifest.app_version).toMatch(/^\d+\.\d+\.\d+/);
    expect(manifest.database.sha256).toMatch(SHA256);
    for (const file of manifest.files) {
      expect(file.storage_key).toMatch(/^[A-Za-z0-9_-]{16,128}$/);
      expect(file.sha256).toMatch(SHA256);
    }
    // The backup folder holds the database copy, the files and the manifest only (no -wal, -shm or journal).
    expect(readdirSync(backup.directory).sort()).toEqual([BACKUP_FILES_DIR, MANIFEST_FILE_NAME, BACKUP_DATABASE_NAME].sort());
    expect(statSync(join(backup.directory, BACKUP_DATABASE_NAME)).size).toBe(manifest.database.size_bytes);
  });
});

describe('migration 0009 (backup status in operations_state)', () => {
  const BACKUP_COLUMNS = ['backup_last_attempt_at', 'backup_last_outcome', 'backup_last_fault_code', 'backup_last_success_at'];
  /** The migrations up to 0009, so these tests keep pinning what 0009 did on its own after later migrations (WP4-T06). */
  const UP_TO_9 = MIGRATIONS.filter((migration) => migration.version <= 9);
  let dir: string;

  beforeAll(() => {
    dir = scratch('timesheet-migrate-0009-');
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function columns(db: Db): string[] {
    return (db.pragma('table_info(operations_state)') as Array<{ name: string }>).map((column) => column.name);
  }

  it('applies fresh 1 to 9, is consistent and a rerun applies nothing', () => {
    const db = openDatabase(join(dir, 'fresh.db'));
    try {
      expect(UP_TO_9.map((migration) => migration.version)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(UP_TO_9.at(-1)?.name).toBe('operations_backup');
      expect(migrate(db, UP_TO_9)).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8, 9], version: 9 });
      expect(db.pragma('user_version', { simple: true })).toBe(9);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(db.pragma('foreign_key_check')).toEqual([]);
      expect(columns(db).slice(-4)).toEqual(BACKUP_COLUMNS);
      expect(migrate(db, UP_TO_9)).toEqual({ applied: [], version: 9 });
    } finally {
      db.close();
    }
  });

  it('upgrades a populated version 8 database, keeps every row and starts with no backup recorded', async () => {
    const db = openDatabase(join(dir, 'v8.db'));
    try {
      expect(migrate(db, MIGRATIONS.filter((migration) => migration.version <= 8))).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8], version: 8 });
      const clock = new MutableClock(NOW);
      await seedSynthetic(db, clock, {
        passwords: { admin: randomBytes(12).toString('hex'), employee: randomBytes(12).toString('hex'), employee2: randomBytes(12).toString('hex') },
        sampleData: true,
      });
      db.prepare("UPDATE operations_state SET runner_heartbeat_at = ?, runner_instance = 'runner-v8' WHERE id = 1").run(NOW);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").pluck().all() as string[];
      const snapshot = () => Object.fromEntries(tables.map((name) => [name, db.prepare(`SELECT * FROM ${name} ORDER BY rowid`).all()]));
      const before = snapshot();
      expect(migrate(db, UP_TO_9, new Date('2026-10-05T18:00:00Z'))).toEqual({ applied: [9], version: 9 });
      const after = snapshot();
      const strip = (rows: unknown[]) => (rows as Array<Record<string, unknown>>).map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !BACKUP_COLUMNS.includes(key))));
      for (const name of tables) {
        if (name === 'schema_migrations') expect(after[name]?.slice(0, 8), name).toEqual(before[name]);
        else expect(strip(after[name] ?? []), name).toEqual(before[name]);
      }
      expect(db.prepare('SELECT backup_last_attempt_at, backup_last_outcome, backup_last_fault_code, backup_last_success_at, runner_instance FROM operations_state').all()).toEqual([
        { backup_last_attempt_at: null, backup_last_outcome: null, backup_last_fault_code: null, backup_last_success_at: null, runner_instance: 'runner-v8' },
      ]);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(db.pragma('foreign_key_check')).toEqual([]);
      expect(migrate(db, UP_TO_9)).toEqual({ applied: [], version: 9 });
    } finally {
      db.close();
    }
  });

  it('refuses an inconsistent backup status shape', () => {
    const db = openDatabase(join(dir, 'shape.db'));
    try {
      migrate(db);
      const update = db.prepare(
        'UPDATE operations_state SET backup_last_attempt_at = ?, backup_last_outcome = ?, backup_last_fault_code = ?, backup_last_success_at = ? WHERE id = 1',
      );
      for (const bad of [
        [NOW, 'succeeded', 'file_missing', NOW], // success with a fault code
        [NOW, 'succeeded', null, null], // success without its time
        [NOW, 'failed', null, null], // failure without a fault code
        [null, 'failed', 'file_missing', null], // outcome without a time
        [NOW, 'unknown', null, null], // unknown outcome
        ['now', 'failed', 'file_missing', null], // not a UTC instant
        [NOW, 'failed', 'File Missing /data', null], // not a redacted code
      ]) {
        expect(() => update.run(...bad), JSON.stringify(bad)).toThrow();
      }
      update.run(NOW, 'succeeded', null, NOW);
      update.run('2026-09-30T20:00:00Z', 'failed', 'file_missing', NOW);
      expect(db.pragma('integrity_check', { simple: true })).toBe('ok');
    } finally {
      db.close();
    }
  });
});

describe('cli.js backup', () => {
  const repo = fileURLToPath(new URL('../..', import.meta.url));
  let t: TestContext;
  let target: string;

  beforeAll(async () => {
    t = await createTestContext(NOW);
    saveSignature(t.db, t.clock, new FileStore(dataDirOf(t)), t.userIds.employee, makePng(9), 'image/png');
    target = scratch('timesheet-backups-');
  });

  afterAll(() => {
    t.close();
    rmSync(target, { recursive: true, force: true });
  });

  function cli(args: string[]) {
    const result = spawnSync(process.execPath, ['src/server/cli.ts', 'backup', ...args], {
      cwd: repo,
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        APP_ORIGINS: 'https://timesheet.example.invalid',
        PUBLIC_BASE_URL: 'https://timesheet.example.invalid',
        DATABASE_PATH: t.config.databasePath,
        DATA_DIR: dataDirOf(t),
      },
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  }

  it('runs in production, prints counts only and refuses a target inside DATA_DIR', () => {
    const ok = cli(['--to', target]);
    expect(ok.stderr).toBe('');
    expect(ok.status).toBe(0);
    const printed = JSON.parse(ok.stdout) as Record<string, unknown>;
    expect(Object.keys(printed).sort()).toEqual(['backup', 'database_bytes', 'duration_ms', 'files', 'outcome', 'pdfs', 'schema_version', 'signatures', 'status_recorded']);
    expect(printed).toMatchObject({ outcome: 'succeeded', files: 1, signatures: 1, pdfs: 0, schema_version: MIGRATIONS.length, status_recorded: true });
    expect(readdirSync(target)).toEqual([printed.backup]);
    for (const value of [t.emails.employee, target, dataDirOf(t)]) expect(ok.stdout.includes(value)).toBe(false);

    const refused = cli(['--to', join(dataDirOf(t), 'backups')]);
    expect(refused.status).toBe(2);
    expect(refused.stderr).toMatch(/outside the private data directory/);
    expect(refused.stderr.includes(dataDirOf(t))).toBe(false);
    expect(cli([]).status).toBe(2);
    expect(cli(['--to']).status).toBe(2);
    expect(cli(['--to', target, '--keep-all']).status).toBe(2);
    expect(cli(['--to', target, '--prune', '--dry-run']).status).toBe(2);
  });
});

/* ------------------------------------------------------------------ import sources (WP4-T09B) ---- */

const IMPORT_NOW = '2026-12-15T20:00:00Z';
const IMPORT_PERIODS = ['2026-09-04', '2026-09-18'] as const;

interface StoredImport {
  id: string;
  storageKey: string;
  sha256: string;
  sizeBytes: number;
}

/** Previews one synthetic workbook per payroll date for the seeded employee and commits the first (the other stays a preview). */
function addImports(t: TestContext, payrollDates: readonly string[]): StoredImport[] {
  const employee: SessionUser = {
    id: t.userIds.employee,
    email: t.emails.employee,
    displayName: 'Synthetic Employee',
    role: 'employee',
    calendarId: t.calendarId,
    sessionId: 'test',
  };
  const ctx = { db: t.db, clock: t.clock, files: new FileStore(dataDirOf(t)), user: employee };
  const batches = payrollDates.map((payrollDate) => previewImport(ctx, buildSyntheticWorkbook({ periods: [{ payrollDate }] })).batch);
  const first = batches[0];
  if (first === undefined) throw new Error('no batch');
  commitImport({ db: t.db, clock: t.clock, user: employee }, first.id, []);
  return batches.map((batch) => {
    const row = t.db.prepare<[string], { storage_key: string; source_sha256: string; size_bytes: number }>('SELECT storage_key, source_sha256, size_bytes FROM imports WHERE id = ?').get(batch.id);
    if (row === undefined) throw new Error('no imports row');
    return { id: batch.id, storageKey: row.storage_key, sha256: row.source_sha256, sizeBytes: row.size_bytes };
  });
}

describe('backup of the private workbook import sources (WP4-T09B, AC-11)', () => {
  let t: TestContext;
  let target: string;
  let stored: StoredImport[];

  beforeAll(async () => {
    t = await createTestContext(IMPORT_NOW);
    saveSignature(t.db, t.clock, new FileStore(dataDirOf(t)), t.userIds.employee, makePng(11), 'image/png');
    stored = addImports(t, IMPORT_PERIODS);
    target = scratch('timesheet-backups-');
  });

  afterAll(() => {
    t.close();
    rmSync(target, { recursive: true, force: true });
  });

  const request = () => ({ databasePath: t.config.databasePath, dataDir: dataDirOf(t), targetDir: target, clock: t.clock });

  /** Runs a backup that must fail and returns its error. */
  async function failure(): Promise<BackupError> {
    const error = await createBackup(request()).then(
      () => null,
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(BackupError);
    return error as BackupError;
  }

  it('copies the source of every batch (committed and preview) with the recorded hash and size, and lists it with hash and size only', async () => {
    expect(stored).toHaveLength(2);
    expect(t.db.prepare("SELECT state FROM imports ORDER BY created_at, rowid").pluck().all()).toEqual(['committed', 'preview']);
    const backup = await createBackup(request());
    const imports = backup.manifest.files.filter((file) => file.kind === 'import');
    expect(imports).toEqual(
      [...stored].sort((a, b) => (a.storageKey < b.storageKey ? -1 : 1)).map((item) => ({ storage_key: item.storageKey, kind: 'import', sha256: item.sha256, size_bytes: item.sizeBytes })),
    );
    expect(backup.manifest.files).toHaveLength(3); // the signature and the two sources
    expect(backup.manifest.integrity.files_verified).toBe(3);
    expect(readdirSync(join(backup.directory, BACKUP_FILES_DIR)).sort()).toEqual(backup.manifest.files.map((file) => file.storage_key));
    for (const item of stored) {
      const bytes = readFileSync(join(backup.directory, BACKUP_FILES_DIR, item.storageKey));
      expect(sha256(bytes)).toBe(item.sha256);
      expect(bytes.length).toBe(item.sizeBytes);
    }
    // The manifest key allowlist is unchanged and exact; nothing about the owner, the workbook or any path appears.
    const manifest = readManifest(backup.directory);
    expect([...new Set(keyPaths(manifest))].sort()).toEqual([...MANIFEST_KEY_PATHS].sort());
    const text = readFileSync(join(backup.directory, MANIFEST_FILE_NAME), 'utf8');
    for (const value of [t.emails.employee, '@', dataDirOf(t), target, 'Synthetic', '.xlsx', 'Timesheet']) expect(text.includes(value), value).toBe(false);
  });

  it('fails the backup, as for attachments, when an import source is tampered with, changed in size or missing', async () => {
    const [first] = stored;
    if (first === undefined) throw new Error('no import');
    const path = new FileStore(dataDirOf(t)).pathOf(first.storageKey);
    const original = readFileSync(path);
    const before = readdirSync(target).length;
    try {
      const flipped = Buffer.from(original);
      flipped[flipped.length - 1] = (flipped[flipped.length - 1] ?? 0) ^ 0xff;
      writeFileSync(path, flipped);
      expect((await failure()).code).toBe('file_hash_mismatch');

      writeFileSync(path, Buffer.concat([original, Buffer.from([0])]));
      expect((await failure()).code).toBe('file_size_mismatch');

      rmSync(path);
      expect((await failure()).code).toBe('file_missing');
      expect(backupStatusJson(getBackupStatus(t.db))).toMatchObject({ outcome: 'failed', fault_code: 'file_missing' });
      expect(readdirSync(target).length).toBe(before); // no partial folder
    } finally {
      writeFileSync(path, original);
    }
    expect((await createBackup(request())).manifest.files.filter((file) => file.kind === 'import')).toHaveLength(2);
  });

  it('still backs up a schema older than the imports table (version 11: attachments only)', async () => {
    const dir = scratch('timesheet-backup-v11-');
    try {
      const databasePath = join(dir, 'v11.db');
      const db = openDatabase(databasePath);
      try {
        migrate(db, MIGRATIONS.slice(0, 11), new Date('2026-10-01T00:00:00Z'));
        const clock = new MutableClock(NOW);
        const seed = await seedSynthetic(db, clock, { passwords: { admin: randomBytes(12).toString('hex'), employee: randomBytes(12).toString('hex') } });
        const employee = seed.users.find((user) => user.role === 'employee');
        if (employee === undefined) throw new Error('no employee');
        saveSignature(db, clock, new FileStore(join(dir, 'private-data')), employee.id, makePng(13), 'image/png');
        expect(db.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'imports'").pluck().get()).toBe(0);
      } finally {
        db.close();
      }
      const backup = await createBackup({ databasePath, dataDir: join(dir, 'private-data'), targetDir: join(dir, 'backups'), clock: new MutableClock(NOW) });
      expect(backup.manifest.schema_version).toBe(11);
      expect(backup.manifest.files.map((file) => file.kind)).toEqual(['signature']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
