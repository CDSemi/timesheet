import type { Migration } from '../migrations.ts';

/*
 * WP4-T09: workbook import batches (docs/03 Records `imports`, "Imports, opening balance and retention"; docs/07
 * "Workbook import"; owner decisions F-1 (a) and F-2 (a), 2026-10-05).
 *
 * One row per uploaded workbook of one owner. The idempotency key is owner + source SHA-256 + mapping version
 * (`imports_idempotency`): the same upload of the same owner under the same mapping is always the same batch, so a
 * repeated preview returns the existing row and a repeated commit finds it already committed.
 *
 * - The source bytes live only in the private file store under the opaque `storage_key` (the same alphabet as
 *   `attachments.storage_key`); no column holds workbook content except the derived report.
 * - `report_json` is the preview report written once at preview time (mapped days with their source cells, the
 *   reader's findings and the conflict plan seen then). It never changes.
 * - A batch moves from `preview` to `committed` exactly once; the commit records the owner's explicit decisions and
 *   the result (counts and the created timesheet ids). A committed row refuses every UPDATE and no row is ever
 *   deleted, so the batch history is immutable.
 * - Composite (id, user_id) uniqueness lets later rows refer to a batch only within its owner.
 *
 * Migrations 0001-0011 are never edited.
 */
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";
const sha256 = (column: string) => `(length(${column}) = 64 AND ${column} NOT GLOB '*[^0-9a-f]*')`;

const sql = `
CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  source_sha256 TEXT NOT NULL CHECK ${sha256('source_sha256')},
  mapping_version INTEGER NOT NULL CHECK (mapping_version >= 1),
  state TEXT NOT NULL CHECK (state IN ('preview', 'committed')),
  storage_key TEXT NOT NULL UNIQUE
    CHECK (length(storage_key) BETWEEN 16 AND 128 AND storage_key NOT GLOB '*[^A-Za-z0-9_-]*'),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  report_json TEXT NOT NULL CHECK (json_valid(report_json) AND json_type(report_json) = 'object'),
  decisions_json TEXT CHECK (decisions_json IS NULL OR (json_valid(decisions_json) AND json_type(decisions_json) = 'array')),
  result_json TEXT CHECK (result_json IS NULL OR (json_valid(result_json) AND json_type(result_json) = 'object')),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  committed_at TEXT CHECK (committed_at IS NULL OR committed_at GLOB ${UTC}),
  UNIQUE (id, user_id),
  CHECK ((state = 'committed') = (committed_at IS NOT NULL)),
  CHECK ((state = 'committed') = (decisions_json IS NOT NULL)),
  CHECK ((state = 'committed') = (result_json IS NOT NULL))
) STRICT;
CREATE UNIQUE INDEX imports_idempotency ON imports(user_id, source_sha256, mapping_version);
CREATE INDEX imports_user_created ON imports(user_id, created_at);

-- The identity, the stored source and the preview report never change.
CREATE TRIGGER imports_identity
BEFORE UPDATE OF id, user_id, source_sha256, mapping_version, storage_key, size_bytes, report_json, created_at ON imports
BEGIN SELECT RAISE(ABORT, 'immutable_import'); END;
-- A batch is committed once (preview -> committed) and is immutable afterwards.
CREATE TRIGGER imports_commit_once BEFORE UPDATE ON imports
WHEN OLD.state <> 'preview' OR NEW.state <> 'committed'
BEGIN SELECT RAISE(ABORT, 'immutable_import'); END;
CREATE TRIGGER imports_no_delete BEFORE DELETE ON imports
BEGIN SELECT RAISE(ABORT, 'immutable_import'); END;
`;

export const migration0012: Migration = { version: 12, name: 'imports', sql };
