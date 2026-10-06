/*
 * The backup manifest (WP4-T05, docs/07 "Backup, restore and upgrades").
 *
 * `manifest.json` describes one backup folder: the application and schema versions, the UTC instant the database
 * snapshot was taken, the integrity result of the copy, and the SHA-256 and size of the database copy and of every
 * private file the snapshot refers to. It holds no names, email addresses or host paths of people: files are listed
 * only by their opaque storage key (the generated alphabet of the file store), their kind and their hash and size.
 * Every key below is written by name (no row is spread into it), so a column added later never leaks into a backup
 * description. `MANIFEST_KEY_PATHS` is the exact allowlist the privacy test asserts.
 */

export const MANIFEST_FORMAT = 'timesheet-backup';
export const MANIFEST_FORMAT_VERSION = 1;
export const MANIFEST_FILE_NAME = 'manifest.json';
/** Name of the database copy inside a backup folder. */
export const BACKUP_DATABASE_NAME = 'timesheet.db';
/** Folder of the file copies inside a backup folder (the same layout as the private data directory). */
export const BACKUP_FILES_DIR = 'files';

/** `signature` and `pdf` are `attachments` rows; `import` is the private source workbook of an `imports` row (WP4-T09B). */
export type BackupFileKind = 'signature' | 'pdf' | 'import';

/**
 * The SQL that lists every private file a database refers to, as (storage_key, kind, sha256, size_bytes) ordered by
 * storage key: the `attachments` rows plus, when the schema has the `imports` table (migration 0012), each batch's
 * stored source with its `source_sha256` and `size_bytes`. Backup and restore both use it, so they cannot disagree
 * about which files a snapshot refers to; a schema without `imports` (older than 12) lists attachments only.
 */
export function referencedFilesSql(hasImports: boolean): string {
  const attachments = 'SELECT storage_key, kind, sha256, size_bytes FROM attachments';
  const imports = "SELECT storage_key, 'import' AS kind, source_sha256 AS sha256, size_bytes FROM imports";
  return `${hasImports ? `${attachments} UNION ALL ${imports}` : attachments} ORDER BY storage_key`;
}

export interface ManifestFile {
  storage_key: string;
  kind: BackupFileKind;
  sha256: string;
  size_bytes: number;
}

export interface BackupManifest {
  format: typeof MANIFEST_FORMAT;
  format_version: typeof MANIFEST_FORMAT_VERSION;
  app_version: string;
  schema_version: number;
  /** The UTC instant of the database snapshot (seconds precision). */
  created_at: string;
  integrity: {
    integrity_check: 'ok';
    foreign_key_violations: 0;
    /** Files whose copy was hashed and matched the SHA-256 and size recorded in the snapshot. */
    files_verified: number;
  };
  database: { name: typeof BACKUP_DATABASE_NAME; sha256: string; size_bytes: number };
  files: ManifestFile[];
}

/** Every key path a manifest may contain (`files[]` stands for each element of the file list). */
export const MANIFEST_KEY_PATHS: readonly string[] = [
  'app_version',
  'created_at',
  'database',
  'database.name',
  'database.sha256',
  'database.size_bytes',
  'files',
  'files[].kind',
  'files[].sha256',
  'files[].size_bytes',
  'files[].storage_key',
  'format',
  'format_version',
  'integrity',
  'integrity.files_verified',
  'integrity.foreign_key_violations',
  'integrity.integrity_check',
  'schema_version',
];

export interface ManifestInput {
  appVersion: string;
  schemaVersion: number;
  createdAt: string;
  database: { sha256: string; sizeBytes: number };
  files: ReadonlyArray<{ storageKey: string; kind: BackupFileKind; sha256: string; sizeBytes: number }>;
}

/** Builds the manifest field by field; files are sorted by storage key so equal backups describe themselves equally. */
export function buildManifest(input: ManifestInput): BackupManifest {
  const files = [...input.files]
    .sort((a, b) => (a.storageKey < b.storageKey ? -1 : a.storageKey > b.storageKey ? 1 : 0))
    .map((file): ManifestFile => ({ storage_key: file.storageKey, kind: file.kind, sha256: file.sha256, size_bytes: file.sizeBytes }));
  return {
    format: MANIFEST_FORMAT,
    format_version: MANIFEST_FORMAT_VERSION,
    app_version: input.appVersion,
    schema_version: input.schemaVersion,
    created_at: input.createdAt,
    integrity: { integrity_check: 'ok', foreign_key_violations: 0, files_verified: files.length },
    database: { name: BACKUP_DATABASE_NAME, sha256: input.database.sha256, size_bytes: input.database.sizeBytes },
    files,
  };
}

/** The serialized manifest: two-space JSON with a final newline (LF). */
export function serializeManifest(manifest: BackupManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** Counts only, for the command line and the drill: no key, hash or path. */
export function manifestSummary(manifest: BackupManifest): { schema_version: number; files: number; signatures: number; pdfs: number; database_bytes: number } {
  return {
    schema_version: manifest.schema_version,
    files: manifest.files.length,
    signatures: manifest.files.filter((file) => file.kind === 'signature').length,
    pdfs: manifest.files.filter((file) => file.kind === 'pdf').length,
    database_bytes: manifest.database.size_bytes,
  };
}
