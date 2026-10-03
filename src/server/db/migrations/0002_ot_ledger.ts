import type { Migration } from '../migrations.ts';

// Same text formats as migration 0001: accounting dates and second-precision UTC instants.
const DATE = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'";
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

/*
 * R-06 OT ledger and OT leave requests.
 *
 * ot_ledger is append-only: every balance change is a new signed integer delta, so the
 * posted balance is SUM(delta_minutes) and history is never rewritten. A per-user unique
 * source_key makes posting idempotent (finalization retries never append again). A
 * correction links to the corrected entry and holds only the difference. source_ref is
 * an opaque reference (future WP3 revision IDs) because revisions cannot be retro-fitted
 * as SQLite foreign keys without a table rebuild.
 *
 * ot_leave_requests is versioned: the recorded manager permission and the approved
 * amount are immutable, the minute counters only move forward with
 * approved = reserved + consumed + released, and every update bumps version by one.
 * Active reservations are SUM(reserved_minutes).
 */
const sql = `
CREATE TABLE ot_leave_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  -- Idempotency key for recording the request, unique per user.
  request_key TEXT NOT NULL CHECK (length(request_key) BETWEEN 1 AND 200),
  leave_date TEXT NOT NULL CHECK (leave_date GLOB ${DATE}),
  requested_minutes INTEGER NOT NULL CHECK (requested_minutes BETWEEN 1 AND 1440),
  approved_minutes INTEGER NOT NULL CHECK (approved_minutes BETWEEN 1 AND requested_minutes),
  reserved_minutes INTEGER NOT NULL CHECK (reserved_minutes >= 0),
  consumed_minutes INTEGER NOT NULL DEFAULT 0 CHECK (consumed_minutes >= 0),
  released_minutes INTEGER NOT NULL DEFAULT 0 CHECK (released_minutes >= 0),
  -- Already consumed minutes given back by a compensating ledger delta.
  reversed_minutes INTEGER NOT NULL DEFAULT 0 CHECK (reversed_minutes BETWEEN 0 AND consumed_minutes),
  -- Recorded manager permission: name/identity, date, evidence and origin.
  approver_name TEXT NOT NULL CHECK (length(trim(approver_name)) BETWEEN 1 AND 200),
  approver_identity TEXT CHECK (approver_identity IS NULL OR length(approver_identity) <= 320),
  approval_date TEXT NOT NULL CHECK (approval_date GLOB ${DATE}),
  evidence_ref TEXT NOT NULL CHECK (length(trim(evidence_ref)) BETWEEN 1 AND 2000),
  approval_origin TEXT NOT NULL CHECK (approval_origin IN ('self_recorded', 'authenticated')),
  -- Set only by a future authenticated manager approval.
  approved_by_user_id TEXT REFERENCES users(id),
  note TEXT CHECK (note IS NULL OR length(note) <= 2000),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC}),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  CHECK (reserved_minutes + consumed_minutes + released_minutes = approved_minutes),
  CHECK ((approval_origin = 'authenticated') = (approved_by_user_id IS NOT NULL)),
  UNIQUE (user_id, request_key),
  UNIQUE (id, user_id)
) STRICT;
CREATE INDEX ot_leave_requests_user_date ON ot_leave_requests(user_id, leave_date);

CREATE TRIGGER ot_leave_requests_no_delete BEFORE DELETE ON ot_leave_requests
BEGIN SELECT RAISE(ABORT, 'immutable_leave_request'); END;

CREATE TRIGGER ot_leave_requests_facts_immutable
BEFORE UPDATE OF id, user_id, request_key, leave_date, requested_minutes, approved_minutes, approver_name,
  approver_identity, approval_date, evidence_ref, approval_origin, approved_by_user_id, created_by, created_at
ON ot_leave_requests
WHEN NEW.id IS NOT OLD.id OR NEW.user_id IS NOT OLD.user_id OR NEW.request_key IS NOT OLD.request_key
  OR NEW.leave_date IS NOT OLD.leave_date OR NEW.requested_minutes IS NOT OLD.requested_minutes
  OR NEW.approved_minutes IS NOT OLD.approved_minutes OR NEW.approver_name IS NOT OLD.approver_name
  OR NEW.approver_identity IS NOT OLD.approver_identity OR NEW.approval_date IS NOT OLD.approval_date
  OR NEW.evidence_ref IS NOT OLD.evidence_ref OR NEW.approval_origin IS NOT OLD.approval_origin
  OR NEW.approved_by_user_id IS NOT OLD.approved_by_user_id OR NEW.created_by IS NOT OLD.created_by
  OR NEW.created_at IS NOT OLD.created_at
BEGIN SELECT RAISE(ABORT, 'immutable_leave_request'); END;

CREATE TRIGGER ot_leave_requests_counters_forward BEFORE UPDATE ON ot_leave_requests
WHEN NEW.consumed_minutes < OLD.consumed_minutes OR NEW.released_minutes < OLD.released_minutes
  OR NEW.reversed_minutes < OLD.reversed_minutes
BEGIN SELECT RAISE(ABORT, 'immutable_leave_request_counters'); END;

CREATE TRIGGER ot_leave_requests_version_bump BEFORE UPDATE ON ot_leave_requests
WHEN NEW.version IS NOT OLD.version + 1
BEGIN SELECT RAISE(ABORT, 'immutable_leave_request_version'); END;

CREATE TABLE ot_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN
    ('credit', 'deficit_debit', 'correction', 'leave_consumption', 'leave_reversal')),
  -- Signed integer minutes; a zero delta is never stored (an unchanged value posts nothing).
  delta_minutes INTEGER NOT NULL CHECK (delta_minutes <> 0),
  source_key TEXT NOT NULL CHECK (length(source_key) BETWEEN 1 AND 200),
  source_ref TEXT CHECK (source_ref IS NULL OR length(source_ref) BETWEEN 1 AND 200),
  corrects_entry_id TEXT,
  leave_request_id TEXT,
  work_date TEXT CHECK (work_date IS NULL OR work_date GLOB ${DATE}),
  actor_user_id TEXT REFERENCES users(id),
  origin TEXT NOT NULL CHECK (origin IN ('manual', 'automatic', 'system')),
  reason TEXT CHECK (reason IS NULL OR length(reason) <= 2000),
  -- Posting-time fact: this correction left the balance needing reconciliation (LG-08).
  reconciliation_required INTEGER NOT NULL DEFAULT 0 CHECK (reconciliation_required IN (0, 1)),
  posted_at TEXT NOT NULL CHECK (posted_at GLOB ${UTC}),
  UNIQUE (user_id, source_key),
  UNIQUE (id, user_id),
  -- Links stay within one owner.
  FOREIGN KEY (corrects_entry_id, user_id) REFERENCES ot_ledger(id, user_id),
  FOREIGN KEY (leave_request_id, user_id) REFERENCES ot_leave_requests(id, user_id),
  CHECK (origin <> 'manual' OR actor_user_id IS NOT NULL),
  CHECK (entry_type <> 'credit' OR delta_minutes > 0),
  CHECK (entry_type <> 'deficit_debit' OR delta_minutes < 0),
  CHECK (entry_type <> 'leave_consumption' OR delta_minutes < 0),
  CHECK (entry_type <> 'leave_reversal' OR delta_minutes > 0),
  CHECK ((entry_type = 'correction') = (corrects_entry_id IS NOT NULL)),
  CHECK (entry_type <> 'correction' OR (reason IS NOT NULL AND length(trim(reason)) > 0)),
  CHECK ((entry_type IN ('leave_consumption', 'leave_reversal')) = (leave_request_id IS NOT NULL)),
  CHECK (entry_type NOT IN ('credit', 'deficit_debit') OR work_date IS NOT NULL),
  CHECK (entry_type = 'correction' OR reconciliation_required = 0)
) STRICT;
CREATE INDEX ot_ledger_user_date ON ot_ledger(user_id, work_date);
CREATE INDEX ot_ledger_corrects ON ot_ledger(corrects_entry_id);
CREATE INDEX ot_ledger_leave ON ot_ledger(leave_request_id);

-- Only original postings are corrected; a correction chain always points at the original.
CREATE TRIGGER ot_ledger_correction_target BEFORE INSERT ON ot_ledger
WHEN NEW.corrects_entry_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM ot_ledger o
  WHERE o.id = NEW.corrects_entry_id AND o.user_id = NEW.user_id AND o.entry_type IN ('credit', 'deficit_debit')
)
BEGIN SELECT RAISE(ABORT, 'invalid_correction_target'); END;

CREATE TRIGGER ot_ledger_no_update BEFORE UPDATE ON ot_ledger
BEGIN SELECT RAISE(ABORT, 'immutable_ledger_entry'); END;
CREATE TRIGGER ot_ledger_no_delete BEFORE DELETE ON ot_ledger
BEGIN SELECT RAISE(ABORT, 'immutable_ledger_entry'); END;
`;

export const migration0002: Migration = { version: 2, name: 'ot_ledger', sql };
