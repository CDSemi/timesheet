import type { Migration } from '../migrations.ts';

// Text formats enforced in the schema: accounting dates, UTC instants (second
// precision, lexically ordered) and local clock times.
const DATE = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'";
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";
const CLOCK = "'[0-2][0-9]:[0-5][0-9]'";
const OPEN_END = "'9999-12-31T23:59:59Z'";

const sql = `
CREATE TABLE calendars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  reporting_zone TEXT NOT NULL CHECK (length(reporting_zone) > 0),
  payroll_anchor_date TEXT NOT NULL CHECK (payroll_anchor_date GLOB ${DATE}),
  cycle_days INTEGER NOT NULL CHECK (cycle_days BETWEEN 1 AND 366),
  period_start_offset_days INTEGER NOT NULL,
  period_end_offset_days INTEGER NOT NULL,
  due_offset_days INTEGER NOT NULL,
  due_local_time TEXT NOT NULL CHECK (due_local_time GLOB ${CLOCK}),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  CHECK (period_end_offset_days - period_start_offset_days + 1 = cycle_days)
) STRICT;

-- Changing the zone or payroll rhythm would regroup existing timesheets.
CREATE TRIGGER calendars_schedule_immutable
BEFORE UPDATE OF reporting_zone, payroll_anchor_date, cycle_days, period_start_offset_days,
  period_end_offset_days, due_offset_days, due_local_time ON calendars
BEGIN SELECT RAISE(ABORT, 'immutable_payroll_schedule'); END;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (email = lower(trim(email)) AND email LIKE '%_@_%'),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  password_hash TEXT NOT NULL,
  calendar_id TEXT NOT NULL REFERENCES calendars(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC})
) STRICT;

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  expires_at TEXT NOT NULL CHECK (expires_at GLOB ${UTC}),
  last_seen_at TEXT NOT NULL CHECK (last_seen_at GLOB ${UTC}),
  revoked_at TEXT CHECK (revoked_at IS NULL OR revoked_at GLOB ${UTC})
) STRICT;
CREATE INDEX auth_sessions_user ON auth_sessions(user_id);

-- Calendar versions are complete immutable rule sets; a later seq supersedes the same date.
CREATE TABLE calendar_versions (
  id TEXT PRIMARY KEY,
  calendar_id TEXT NOT NULL REFERENCES calendars(id),
  seq INTEGER NOT NULL CHECK (seq >= 1),
  effective_from TEXT NOT NULL CHECK (effective_from GLOB ${DATE}),
  weekdays TEXT NOT NULL CHECK (json_valid(weekdays) AND json_type(weekdays) = 'array'),
  dates TEXT NOT NULL CHECK (json_valid(dates) AND json_type(dates) = 'array'),
  note TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  UNIQUE (calendar_id, seq)
) STRICT;
CREATE INDEX calendar_versions_effective ON calendar_versions(calendar_id, effective_from, seq);
CREATE TRIGGER calendar_versions_no_update BEFORE UPDATE ON calendar_versions
BEGIN SELECT RAISE(ABORT, 'immutable_calendar_version'); END;
CREATE TRIGGER calendar_versions_no_delete BEFORE DELETE ON calendar_versions
BEGIN SELECT RAISE(ABORT, 'immutable_calendar_version'); END;

CREATE TABLE payroll_exceptions (
  calendar_id TEXT NOT NULL REFERENCES calendars(id),
  nominal_payroll_date TEXT NOT NULL CHECK (nominal_payroll_date GLOB ${DATE}),
  payroll_date TEXT NOT NULL CHECK (payroll_date GLOB ${DATE}),
  due_local_date TEXT CHECK (due_local_date IS NULL OR due_local_date GLOB ${DATE}),
  due_local_time TEXT CHECK (due_local_time IS NULL OR due_local_time GLOB ${CLOCK}),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  PRIMARY KEY (calendar_id, nominal_payroll_date),
  UNIQUE (calendar_id, payroll_date)
) STRICT;

-- Personal work policies: effective-dated, append-only, referenced by ID.
CREATE TABLE work_policies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  seq INTEGER NOT NULL CHECK (seq >= 1),
  effective_from TEXT NOT NULL CHECK (effective_from GLOB ${DATE}),
  required_minutes INTEGER NOT NULL CHECK (required_minutes BETWEEN 1 AND 1440),
  threshold_minutes INTEGER NOT NULL CHECK (threshold_minutes BETWEEN 0 AND 1440),
  rounding_step_minutes INTEGER NOT NULL CHECK (rounding_step_minutes BETWEEN 1 AND 1440),
  reference_start TEXT NOT NULL CHECK (reference_start GLOB ${CLOCK}),
  reference_end TEXT NOT NULL CHECK (reference_end GLOB ${CLOCK}),
  breaks TEXT NOT NULL CHECK (json_valid(breaks) AND json_type(breaks) = 'array'),
  deficit_mode TEXT NOT NULL CHECK (deficit_mode IN ('ignore', 'auto_deduct', 'choose_at_signoff')),
  note TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  UNIQUE (user_id, seq)
) STRICT;
CREATE INDEX work_policies_effective ON work_policies(user_id, effective_from, seq);
CREATE TRIGGER work_policies_no_update BEFORE UPDATE ON work_policies
BEGIN SELECT RAISE(ABORT, 'immutable_policy_version'); END;
CREATE TRIGGER work_policies_no_delete BEFORE DELETE ON work_policies
BEGIN SELECT RAISE(ABORT, 'immutable_policy_version'); END;

-- Shared periods carry no per-user signed/sent state.
CREATE TABLE pay_periods (
  id TEXT PRIMARY KEY,
  calendar_id TEXT NOT NULL REFERENCES calendars(id),
  period_index INTEGER NOT NULL,
  nominal_payroll_date TEXT NOT NULL CHECK (nominal_payroll_date GLOB ${DATE}),
  payroll_date TEXT NOT NULL CHECK (payroll_date GLOB ${DATE}),
  period_start TEXT NOT NULL CHECK (period_start GLOB ${DATE}),
  period_end TEXT NOT NULL CHECK (period_end GLOB ${DATE}),
  due_local_date TEXT NOT NULL CHECK (due_local_date GLOB ${DATE}),
  due_local_time TEXT NOT NULL CHECK (due_local_time GLOB ${CLOCK}),
  due_at_utc TEXT NOT NULL CHECK (due_at_utc GLOB ${UTC}),
  is_exception INTEGER NOT NULL CHECK (is_exception IN (0, 1)),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  UNIQUE (calendar_id, payroll_date),
  UNIQUE (calendar_id, period_index),
  UNIQUE (calendar_id, period_start),
  CHECK (period_start <= period_end)
) STRICT;

CREATE TABLE timesheets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pay_period_id TEXT NOT NULL REFERENCES pay_periods(id),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  -- Set by finalization (WP3); non-null means later edits are corrections needing a reason.
  finalized_revision_no INTEGER CHECK (finalized_revision_no IS NULL OR finalized_revision_no >= 1),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC}),
  UNIQUE (user_id, pay_period_id),
  UNIQUE (id, user_id)
) STRICT;

CREATE TABLE day_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  timesheet_id TEXT NOT NULL,
  work_date TEXT NOT NULL CHECK (work_date GLOB ${DATE}),
  category TEXT NOT NULL CHECK (category IN ('Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown')),
  leave_minutes INTEGER NOT NULL DEFAULT 0 CHECK (leave_minutes BETWEEN 0 AND 1440),
  wfh INTEGER NOT NULL DEFAULT 0 CHECK (wfh IN (0, 1)),
  notes TEXT NOT NULL DEFAULT '' CHECK (length(notes) <= 2000),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC}),
  UNIQUE (user_id, work_date),
  -- The owner of a day entry must be the owner of its timesheet.
  FOREIGN KEY (timesheet_id, user_id) REFERENCES timesheets(id, user_id)
) STRICT;

CREATE TABLE work_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  work_date TEXT NOT NULL CHECK (work_date GLOB ${DATE}),
  start_utc TEXT NOT NULL CHECK (start_utc GLOB ${UTC}),
  end_utc TEXT CHECK (end_utc IS NULL OR (end_utc GLOB ${UTC} AND end_utc > start_utc)),
  input_zone TEXT NOT NULL CHECK (length(input_zone) > 0),
  source TEXT NOT NULL CHECK (source IN ('manual', 'clock')),
  breaks_confirmed INTEGER NOT NULL CHECK (breaks_confirmed IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC}),
  UNIQUE (id, user_id),
  -- Sessions attach to the owner's own day entry for that accounting date.
  FOREIGN KEY (user_id, work_date) REFERENCES day_entries(user_id, work_date)
) STRICT;
CREATE INDEX work_sessions_user_start ON work_sessions(user_id, start_utc);
CREATE INDEX work_sessions_user_date ON work_sessions(user_id, work_date);

CREATE TRIGGER work_sessions_owner_immutable BEFORE UPDATE OF user_id, work_date ON work_sessions
BEGIN SELECT RAISE(ABORT, 'immutable_session_owner'); END;

-- Defense in depth for R-01: no overlap across all of one user's work dates.
CREATE TRIGGER work_sessions_no_overlap_insert BEFORE INSERT ON work_sessions
WHEN EXISTS (
  SELECT 1 FROM work_sessions s
  WHERE s.user_id = NEW.user_id
    AND s.start_utc < COALESCE(NEW.end_utc, ${OPEN_END})
    AND COALESCE(s.end_utc, ${OPEN_END}) > NEW.start_utc
)
BEGIN SELECT RAISE(ABORT, 'overlapping_user_intervals'); END;

CREATE TRIGGER work_sessions_no_overlap_update BEFORE UPDATE OF start_utc, end_utc ON work_sessions
WHEN EXISTS (
  SELECT 1 FROM work_sessions s
  WHERE s.user_id = NEW.user_id AND s.id <> NEW.id
    AND s.start_utc < COALESCE(NEW.end_utc, ${OPEN_END})
    AND COALESCE(s.end_utc, ${OPEN_END}) > NEW.start_utc
)
BEGIN SELECT RAISE(ABORT, 'overlapping_user_intervals'); END;

CREATE TABLE session_breaks (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  start_utc TEXT NOT NULL CHECK (start_utc GLOB ${UTC}),
  end_utc TEXT NOT NULL CHECK (end_utc GLOB ${UTC} AND end_utc > start_utc),
  counts_as_work INTEGER NOT NULL CHECK (counts_as_work IN (0, 1)),
  FOREIGN KEY (session_id, user_id) REFERENCES work_sessions(id, user_id) ON DELETE CASCADE
) STRICT;
CREATE INDEX session_breaks_session ON session_breaks(session_id);

CREATE TRIGGER session_breaks_inside_session BEFORE INSERT ON session_breaks
WHEN NOT EXISTS (
  SELECT 1 FROM work_sessions s
  WHERE s.id = NEW.session_id AND s.user_id = NEW.user_id
    AND NEW.start_utc >= s.start_utc AND (s.end_utc IS NULL OR NEW.end_utc <= s.end_utc)
)
BEGIN SELECT RAISE(ABORT, 'break_outside_session'); END;

CREATE TRIGGER session_breaks_no_overlap BEFORE INSERT ON session_breaks
WHEN EXISTS (
  SELECT 1 FROM session_breaks b
  WHERE b.session_id = NEW.session_id AND b.start_utc < NEW.end_utc AND b.end_utc > NEW.start_utc
)
BEGIN SELECT RAISE(ABORT, 'overlapping_breaks'); END;

CREATE TRIGGER work_sessions_breaks_stay_inside AFTER UPDATE OF start_utc, end_utc ON work_sessions
WHEN EXISTS (
  SELECT 1 FROM session_breaks b
  WHERE b.session_id = NEW.id
    AND (b.start_utc < NEW.start_utc OR (NEW.end_utc IS NOT NULL AND b.end_utc > NEW.end_utc))
)
BEGIN SELECT RAISE(ABORT, 'break_outside_session'); END;

-- Append-only audit trail: actor, UTC time, operation, before/after and reason.
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL CHECK (occurred_at GLOB ${UTC}),
  actor_user_id TEXT REFERENCES users(id),
  owner_user_id TEXT REFERENCES users(id),
  operation TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  reason TEXT,
  before_json TEXT CHECK (before_json IS NULL OR json_valid(before_json)),
  after_json TEXT CHECK (after_json IS NULL OR json_valid(after_json))
) STRICT;
CREATE INDEX audit_events_owner ON audit_events(owner_user_id, occurred_at);
CREATE INDEX audit_events_entity ON audit_events(entity_type, entity_id);
CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON audit_events
BEGIN SELECT RAISE(ABORT, 'immutable_audit_event'); END;
CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON audit_events
BEGIN SELECT RAISE(ABORT, 'immutable_audit_event'); END;
`;

export const migration0001: Migration = { version: 1, name: 'initial', sql };
