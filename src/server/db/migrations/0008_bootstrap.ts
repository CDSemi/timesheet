import type { Migration } from '../migrations.ts';

/*
 * WP4-T03: production bootstrap (docs/07 "Initial deployment", FR-01, O5).
 *
 * `bootstrap_state` is the one-row record of a configured instance: the company calendar the operator's file
 * created, the default work policy that file carried (applied to the first administrator when setup completes)
 * and the single-use setup token. The token itself is never stored: `token_hash` is the SHA-256 of the
 * normalized token, `token_expires_at` is 60 minutes after `token_issued_at`, and `token_used_at` plus a NULL
 * `token_hash` record that the one administrator was created (`admin_user_id`).
 *
 * The row is the only place that says "this instance was bootstrapped": it is never deleted, the configuration
 * columns never change, `admin_user_id` is write-once, and once an administrator is recorded no token can be
 * stored again, so a bootstrap can never be opened a second time from SQL either. Application code adds the
 * rest (any administrator row also closes the setup). Migrations 0001-0007 are never edited.
 */
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

const sql = `
CREATE TABLE bootstrap_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  calendar_id TEXT NOT NULL REFERENCES calendars(id),
  default_policy TEXT NOT NULL CHECK (json_valid(default_policy) AND json_type(default_policy) = 'object'),
  configured_at TEXT NOT NULL CHECK (configured_at GLOB ${UTC}),
  token_hash TEXT CHECK (token_hash IS NULL OR length(token_hash) = 64),
  token_issued_at TEXT CHECK (token_issued_at IS NULL OR token_issued_at GLOB ${UTC}),
  token_expires_at TEXT CHECK (token_expires_at IS NULL OR token_expires_at GLOB ${UTC}),
  token_used_at TEXT CHECK (token_used_at IS NULL OR token_used_at GLOB ${UTC}),
  admin_user_id TEXT REFERENCES users(id),
  CHECK ((token_hash IS NULL) OR (token_issued_at IS NOT NULL AND token_expires_at IS NOT NULL))
) STRICT;

CREATE TRIGGER bootstrap_state_no_delete BEFORE DELETE ON bootstrap_state
BEGIN SELECT RAISE(ABORT, 'immutable_bootstrap_state'); END;
CREATE TRIGGER bootstrap_state_config_immutable BEFORE UPDATE OF id, calendar_id, default_policy, configured_at ON bootstrap_state
BEGIN SELECT RAISE(ABORT, 'immutable_bootstrap_state'); END;
CREATE TRIGGER bootstrap_state_admin_once BEFORE UPDATE OF admin_user_id ON bootstrap_state
WHEN OLD.admin_user_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'immutable_bootstrap_state'); END;
CREATE TRIGGER bootstrap_state_closed BEFORE UPDATE OF token_hash ON bootstrap_state
WHEN NEW.token_hash IS NOT NULL AND OLD.admin_user_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'bootstrap_closed'); END;
`;

export const migration0008: Migration = { version: 8, name: 'bootstrap', sql };
