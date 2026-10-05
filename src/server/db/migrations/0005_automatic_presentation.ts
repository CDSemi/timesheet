import type { Migration } from '../migrations.ts';

/*
 * WP3-T07B: the optional note line of an automatic submission (owner decision of 2026-10-04,
 * docs/04 defaults and "Email and PDF", docs/05, R-07).
 *
 * Two columns on the append-only per-user settings versions: whether the note line is shown
 * (default off) and its one-line text (default "Automatic submission"). The image option stays
 * the explicit, audited auto-image authorization of migration 0004, which this migration does
 * not touch. Existing versions read as "note off, default text"; nothing is rewritten, so the
 * immutability triggers of 0004 stay as they are (ALTER TABLE ADD COLUMN fires no UPDATE trigger).
 *
 * The text is bounded to 1-120 characters (length() counts characters, not bytes) and refuses a
 * line break; NFC form, trimming, control characters and braces are checked by the application
 * (src/domain/snapshot.ts checkAutoNoteText) before a version is written.
 *
 * Migrations 0001-0004 are never edited; a later change is a later migration.
 */
const sql = `
ALTER TABLE submission_settings ADD COLUMN auto_note_enabled INTEGER NOT NULL DEFAULT 0
  CHECK (auto_note_enabled IN (0, 1));
ALTER TABLE submission_settings ADD COLUMN auto_note_text TEXT NOT NULL DEFAULT 'Automatic submission'
  CHECK (length(auto_note_text) BETWEEN 1 AND 120
    AND instr(auto_note_text, char(10)) = 0 AND instr(auto_note_text, char(13)) = 0);
`;

export const migration0005: Migration = { version: 5, name: 'automatic_presentation', sql };
