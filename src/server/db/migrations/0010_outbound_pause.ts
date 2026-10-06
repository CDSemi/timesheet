import type { Migration } from '../migrations.ts';

/*
 * WP4-T06: the outbound pause and the restore reconciliation code (docs/07 "Backup, restore and upgrades": restore into
 * an isolated directory with sending paused; reconcile pending/uncertain jobs before enabling delivery; accepted mail
 * must not be sent again automatically).
 *
 * - The single operations_state row gains `outbound_paused_at` (UTC instant) and `outbound_paused_reason` (a lowercase
 *   code such as `restored`). While they are set the job runner claims no job that hands a message to the outbound
 *   adapter (jobStore.ts `OUTBOUND_JOB_KINDS`). A trigger keeps the pair consistent: both NULL (not paused) or both set.
 *   Existing rows stay as they are (both NULL: not paused).
 * - `delivery_attempts_state_flow` is recreated with one more transition: a `preparing` attempt may become `uncertain`,
 *   but only with the provider response `reconcile_after_restore`. A restored copy cannot know whether the source
 *   instance sent a prepared attempt after its backup was taken, so a restore marks it for the owner's explicit decision
 *   (AC-08) instead of letting a runner send it again. Every other transition is unchanged.
 * Migrations 0001-0009 are never edited.
 */
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

const sql = `
ALTER TABLE operations_state ADD COLUMN outbound_paused_at TEXT
  CHECK (outbound_paused_at IS NULL OR outbound_paused_at GLOB ${UTC});
ALTER TABLE operations_state ADD COLUMN outbound_paused_reason TEXT
  CHECK (outbound_paused_reason IS NULL OR (length(outbound_paused_reason) BETWEEN 1 AND 40
    AND outbound_paused_reason GLOB '[a-z]*' AND outbound_paused_reason NOT GLOB '*[^a-z0-9_]*'));

CREATE TRIGGER operations_state_outbound_pause_shape
BEFORE UPDATE OF outbound_paused_at, outbound_paused_reason ON operations_state
WHEN (NEW.outbound_paused_at IS NULL) <> (NEW.outbound_paused_reason IS NULL)
BEGIN SELECT RAISE(ABORT, 'invalid_outbound_pause'); END;

DROP TRIGGER delivery_attempts_state_flow;
CREATE TRIGGER delivery_attempts_state_flow BEFORE UPDATE OF state ON delivery_attempts
WHEN NEW.state IS NOT OLD.state AND NOT (
  (OLD.state = 'preparing' AND NEW.state IN ('sending', 'failed_temporary', 'failed_permanent'))
  OR (OLD.state = 'preparing' AND NEW.state = 'uncertain' AND NEW.provider_response IS 'reconcile_after_restore')
  OR (OLD.state = 'sending' AND NEW.state IN ('accepted', 'failed_temporary', 'failed_permanent', 'uncertain'))
  OR (OLD.state = 'uncertain' AND OLD.decision IS NULL AND NEW.state = 'accepted')
)
BEGIN SELECT RAISE(ABORT, 'invalid_delivery_transition'); END;
`;

export const migration0010: Migration = { version: 10, name: 'outbound_pause', sql };
