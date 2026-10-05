import type { Migration } from '../migrations.ts';

const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

/*
 * WP3-T13B: owner-granted sharing of one's own timesheets, item by item (FR-17, AC-16, docs/03
 * "timesheet_shares", owner decisions F-3, F-Q4 (b) and F-Q5 (a) of 2026-10-04).
 *
 * A row is one grant from an owner to a grantee with three items: timesheets (none, view or edit),
 * read-only OT summary and ledger, and final PDF downloads. At least one item is on. Only the owner
 * creates a share (created_by = owner), so an administrator can never create one, and a share
 * covers the owner's own timesheets only (never transitive). At most one share per owner and
 * grantee is active (partial UNIQUE index). Rows are never deleted; identity and items are fixed;
 * the revocation (by the owner, the grantee leaving, or an administrator) is set once. A change of
 * items is a revocation plus a new row in one transaction, so the history of every grant stays.
 *
 * Access is resolved live from this table on every request (both accounts active); the table holds
 * no token, password, signature or timesheet content.
 *
 * Migrations 0001-0005 are never edited; a later change is a later migration.
 */
const sql = `
CREATE TABLE timesheet_shares (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  grantee_user_id TEXT NOT NULL REFERENCES users(id),
  timesheets_scope TEXT NOT NULL CHECK (timesheets_scope IN ('none', 'view', 'edit')),
  ot_read INTEGER NOT NULL CHECK (ot_read IN (0, 1)),
  pdf_download INTEGER NOT NULL CHECK (pdf_download IN (0, 1)),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  revoked_by TEXT REFERENCES users(id),
  revoked_at TEXT CHECK (revoked_at IS NULL OR revoked_at GLOB ${UTC}),
  revoke_reason TEXT CHECK (revoke_reason IS NULL OR length(revoke_reason) BETWEEN 1 AND 500),
  CHECK (owner_user_id <> grantee_user_id),
  CHECK (created_by = owner_user_id),
  CHECK (timesheets_scope <> 'none' OR ot_read = 1 OR pdf_download = 1),
  CHECK ((revoked_at IS NULL) = (revoked_by IS NULL)),
  CHECK (revoke_reason IS NULL OR revoked_at IS NOT NULL),
  CHECK (revoked_at IS NULL OR revoked_at >= created_at)
) STRICT;
CREATE UNIQUE INDEX timesheet_shares_one_active ON timesheet_shares(owner_user_id, grantee_user_id)
WHERE revoked_at IS NULL;
CREATE INDEX timesheet_shares_grantee ON timesheet_shares(grantee_user_id, owner_user_id);
CREATE TRIGGER timesheet_shares_fixed BEFORE UPDATE ON timesheet_shares
WHEN NEW.id IS NOT OLD.id OR NEW.owner_user_id IS NOT OLD.owner_user_id OR NEW.grantee_user_id IS NOT OLD.grantee_user_id
  OR NEW.timesheets_scope IS NOT OLD.timesheets_scope OR NEW.ot_read IS NOT OLD.ot_read
  OR NEW.pdf_download IS NOT OLD.pdf_download OR NEW.created_by IS NOT OLD.created_by
  OR NEW.created_at IS NOT OLD.created_at OR OLD.revoked_at IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'immutable_timesheet_share'); END;
CREATE TRIGGER timesheet_shares_no_delete BEFORE DELETE ON timesheet_shares
BEGIN SELECT RAISE(ABORT, 'immutable_timesheet_share'); END;
`;

export const migration0006: Migration = { version: 6, name: 'timesheet_shares', sql };
