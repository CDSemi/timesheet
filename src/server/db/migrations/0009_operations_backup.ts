import type { Migration } from '../migrations.ts';

/*
 * WP4-T05: backup status (docs/07 "Backup, restore and upgrades" and "Maintenance": the administrator status shows
 * backup success).
 *
 * The single operations_state row gains the result of the latest `cli.js backup`: when the attempt ended, whether it
 * succeeded, the redacted fault code of a failure and when the latest success ended (kept when a later attempt fails).
 * No path, storage key, hash or count of anyone's records is stored. A trigger keeps the four values consistent:
 * nothing recorded, a success (no fault code, success time equal to the attempt time) or a failure (a lowercase code).
 * Existing rows stay as they are (all four values NULL: no backup recorded). Migrations 0001-0008 are never edited.
 */
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";
const nullableUtc = (column: string) => `(${column} IS NULL OR ${column} GLOB ${UTC})`;

const sql = `
ALTER TABLE operations_state ADD COLUMN backup_last_attempt_at TEXT CHECK ${nullableUtc('backup_last_attempt_at')};
ALTER TABLE operations_state ADD COLUMN backup_last_outcome TEXT
  CHECK (backup_last_outcome IS NULL OR backup_last_outcome IN ('succeeded', 'failed'));
ALTER TABLE operations_state ADD COLUMN backup_last_fault_code TEXT
  CHECK (backup_last_fault_code IS NULL OR (length(backup_last_fault_code) BETWEEN 1 AND 60
    AND backup_last_fault_code GLOB '[a-z]*' AND backup_last_fault_code NOT GLOB '*[^a-z0-9_]*'));
ALTER TABLE operations_state ADD COLUMN backup_last_success_at TEXT CHECK ${nullableUtc('backup_last_success_at')};

CREATE TRIGGER operations_state_backup_shape
BEFORE UPDATE OF backup_last_attempt_at, backup_last_outcome, backup_last_fault_code, backup_last_success_at ON operations_state
WHEN NOT (
  (NEW.backup_last_outcome IS NULL AND NEW.backup_last_attempt_at IS NULL AND NEW.backup_last_fault_code IS NULL
    AND NEW.backup_last_success_at IS NULL)
  OR (NEW.backup_last_outcome = 'succeeded' AND NEW.backup_last_attempt_at IS NOT NULL AND NEW.backup_last_fault_code IS NULL
    AND NEW.backup_last_success_at IS NOT NULL AND NEW.backup_last_success_at = NEW.backup_last_attempt_at)
  OR (NEW.backup_last_outcome = 'failed' AND NEW.backup_last_attempt_at IS NOT NULL AND NEW.backup_last_fault_code IS NOT NULL)
)
BEGIN SELECT RAISE(ABORT, 'invalid_backup_status'); END;
`;

export const migration0009: Migration = { version: 9, name: 'operations_backup', sql };
