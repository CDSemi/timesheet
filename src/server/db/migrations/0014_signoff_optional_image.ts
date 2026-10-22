import type { Migration } from '../migrations.ts';

// Same text formats as migrations 0001 and 0004: second-precision UTC instants and lowercase SHA-256 hex.
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

/*
 * WP5-UX5-T01a: the signature image is optional (owner decision F-5 b, 2026-10-21; docs/03 "Records", docs/04 "Email
 * and PDF", docs/05 "Manual path", AC-06). A manual sign-off records the account's display name and, when one is
 * saved, the signature image. Without a saved image the sign-off carries the name only, so
 * `signoffs.signature_attachment_id` becomes nullable.
 *
 * The column is declared NOT NULL in migration 0004, so the table is rebuilt with SQLite's documented twelve-step
 * procedure, as migration 0013 did for `ot_ledger`
 * (https://www.sqlite.org/lang_altertable.html#otheralter): create the new table under a temporary name, copy every
 * row with its rowid, drop the old table, rename the new one, then recreate every trigger. The runner applies the
 * migration inside one BEGIN EXCLUSIVE transaction with foreign key enforcement switched off before it, and runs
 * `PRAGMA foreign_key_check` before COMMIT, rolling everything back on a violation. No other table refers to
 * `signoffs`, and the table has no index besides the two unique ones the new definition declares itself.
 *
 * - Existing rows are copied unchanged (id, owner, revision, name, instant, reviewed hash and image reference).
 * - The image-kind trigger now applies only when an image is present (`NEW.signature_attachment_id IS NOT NULL`); a
 *   referenced attachment must still be a `signature`. The foreign key to `attachments` is not enforced for NULL.
 * - The revision-signed trigger and the two immutability triggers are recreated byte for byte: a sign-off row is
 *   still insert-only and still needs a signed revision with the same reviewed hash.
 *
 * Migrations 0001-0013 are never edited.
 */
const sql = `
CREATE TABLE signoffs_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL UNIQUE,
  signer_name TEXT NOT NULL CHECK (length(trim(signer_name)) BETWEEN 1 AND 200),
  signed_at TEXT NOT NULL CHECK (signed_at GLOB ${UTC}),
  reviewed_sha256 TEXT NOT NULL CHECK (length(reviewed_sha256) = 64 AND reviewed_sha256 NOT GLOB '*[^0-9a-f]*'),
  -- F-5 b: NULL when the person had no saved signature image; the sign-off then carries the name only.
  signature_attachment_id TEXT,
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (signature_attachment_id, user_id) REFERENCES attachments(id, user_id)
) STRICT;

INSERT INTO signoffs_new (rowid, id, user_id, revision_id, signer_name, signed_at, reviewed_sha256, signature_attachment_id)
SELECT rowid, id, user_id, revision_id, signer_name, signed_at, reviewed_sha256, signature_attachment_id
FROM signoffs ORDER BY rowid;

DROP TABLE signoffs;
ALTER TABLE signoffs_new RENAME TO signoffs;

CREATE TRIGGER signoffs_revision_signed BEFORE INSERT ON signoffs
WHEN NOT EXISTS (
  SELECT 1 FROM timesheet_revisions r
  WHERE r.id = NEW.revision_id AND r.review_state = 'signed' AND r.reviewed_sha256 = NEW.reviewed_sha256
)
BEGIN SELECT RAISE(ABORT, 'signoff_revision_mismatch'); END;
CREATE TRIGGER signoffs_image_kind BEFORE INSERT ON signoffs
WHEN NEW.signature_attachment_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.signature_attachment_id AND a.kind = 'signature')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER signoffs_no_update BEFORE UPDATE ON signoffs
BEGIN SELECT RAISE(ABORT, 'immutable_signoff'); END;
CREATE TRIGGER signoffs_no_delete BEFORE DELETE ON signoffs
BEGIN SELECT RAISE(ABORT, 'immutable_signoff'); END;
`;

export const migration0014: Migration = { version: 14, name: 'signoff_optional_image', sql };
