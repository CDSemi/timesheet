import type { Migration } from '../migrations.ts';

/*
 * WP4-T07B: job-row retention (owner decision F-4 (a), 2026-10-05; docs/03 "Imports, opening balance and retention").
 * `jobs_no_delete` (migration 0004) refused every DELETE. The deadline and reminder scans write one job row per minute
 * and per five-minute bucket, so those rows grow without bound; nothing else reads them after they succeed.
 *
 * The trigger is rebuilt with one narrow exception. A job row may be deleted only when ALL of these hold:
 * - its kind is `deadline_scan` or `reminder_scan` (never a delivery, PDF or send job, an orphan sweep or the
 *   retention job itself);
 * - it is `succeeded` (a failed, cancelled, queued or leased job is never deleted);
 * - it finished more than 30 days before the retention window's instant (`updated_at` is the finish instant: a
 *   succeeded job refuses every UPDATE, so it never moves again);
 * - no other table refers to it (`delivery_attempts` and `reminder_occurrences` keep their foreign keys);
 * - the retention window is open. `job_retention_window` is one row whose `as_of` is NULL (closed) except inside the
 *   transaction of the daily retention job, which sets it to the injected clock's now, deletes and closes it again. A
 *   trigger cannot see the application's clock, so the instant travels in this row; the 30 days live only here, so a
 *   caller cannot widen them. With the window closed the trigger refuses every DELETE, as before (an unknown
 *   comparison counts as "not allowed": the condition is wrapped in COALESCE, so a NULL never lets a delete through).
 *
 * The last run is recorded as counts only on the single operations_state row: when it ran and how many job rows it
 * deleted. Migrations 0001-0010 are never edited.
 */
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

const sql = `
CREATE TABLE job_retention_window (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  as_of TEXT CHECK (as_of IS NULL OR as_of GLOB ${UTC})
) STRICT;
INSERT INTO job_retention_window (id) VALUES (1);
CREATE TRIGGER job_retention_window_no_delete BEFORE DELETE ON job_retention_window
BEGIN SELECT RAISE(ABORT, 'immutable_job_retention_window'); END;

ALTER TABLE operations_state ADD COLUMN job_retention_last_run_at TEXT
  CHECK (job_retention_last_run_at IS NULL OR job_retention_last_run_at GLOB ${UTC});
ALTER TABLE operations_state ADD COLUMN job_retention_last_deleted INTEGER
  CHECK (job_retention_last_deleted IS NULL OR job_retention_last_deleted >= 0);
CREATE TRIGGER operations_state_job_retention_shape
BEFORE UPDATE OF job_retention_last_run_at, job_retention_last_deleted ON operations_state
WHEN (NEW.job_retention_last_run_at IS NULL) <> (NEW.job_retention_last_deleted IS NULL)
BEGIN SELECT RAISE(ABORT, 'invalid_job_retention_result'); END;

DROP TRIGGER jobs_no_delete;
CREATE TRIGGER jobs_no_delete BEFORE DELETE ON jobs
WHEN COALESCE(
  OLD.kind IN ('deadline_scan', 'reminder_scan')
  AND OLD.state = 'succeeded'
  AND OLD.updated_at < (
    SELECT strftime('%Y-%m-%dT%H:%M:%SZ', as_of, '-30 days') FROM job_retention_window WHERE id = 1 AND as_of IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM delivery_attempts WHERE job_id = OLD.id)
  AND NOT EXISTS (SELECT 1 FROM reminder_occurrences WHERE job_id = OLD.id),
  0) = 0
BEGIN SELECT RAISE(ABORT, 'immutable_job'); END;
`;

export const migration0011: Migration = { version: 11, name: 'job_retention', sql };
