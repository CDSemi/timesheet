import type { Migration } from '../migrations.ts';

/*
 * WP4-T02: the recorded "through a share" marker (WP3 carry 15 / R7, FR-14, FR-17, AC-16, docs/03 "Records").
 *
 * `audit_events.via_share_id` names the share a grantee acted under. It is NULL for every event written
 * outside /api/shared/:ownerId, so an act is "through a share" because it says so, not because its actor
 * and operation code look like one (the inference of sharedActs.ts now serves rows written before this
 * migration only: a NULL marker and an `occurred_at` earlier than this migration's `applied_at`).
 *
 * The column is added with ALTER TABLE ADD COLUMN: no stored row is rewritten, the append-only triggers
 * (`audit_events_no_update`, `audit_events_no_delete`) stay as they are and every existing row reads NULL.
 * The insert trigger keeps a marker honest: it must name a share from the event's owner to the event's actor,
 * so a marker can never attribute an act to a person the share was not granted to.
 *
 * Migrations 0001-0006 are never edited; a later change is a later migration.
 */
const sql = `
ALTER TABLE audit_events ADD COLUMN via_share_id TEXT REFERENCES timesheet_shares(id);
CREATE TRIGGER audit_events_via_share_consistent BEFORE INSERT ON audit_events
WHEN NEW.via_share_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM timesheet_shares s
   WHERE s.id = NEW.via_share_id AND s.owner_user_id = NEW.owner_user_id AND s.grantee_user_id = NEW.actor_user_id
)
BEGIN SELECT RAISE(ABORT, 'audit_via_share_mismatch'); END;
`;

export const migration0007: Migration = { version: 7, name: 'audit_access', sql };
