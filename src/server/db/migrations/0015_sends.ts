import type { Migration } from '../migrations.ts';

// Same text formats as migrations 0001, 0004 and 0014: second-precision UTC instants.
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";
const flag = (column: string) => `${column} IN (0, 1)`;
const jsonArray = (column: string) => `(json_valid(${column}) AND json_type(${column}) = 'array')`;
const noLineBreak = (column: string) => `(instr(${column}, char(10)) = 0 AND instr(${column}, char(13)) = 0)`;

/*
 * The sign-off/send split: each send is its own immutable record (WP5-UX5-T01b; owner decisions F-2 a, F-3 b and
 * F-4 of 2026-10-21; docs/03 "Records", docs/05 "Durable delivery").
 *
 * 1. `revision_files` gains `variant`: which rows the PDF prints, `t<time rows><OT rows>` (`t1o1`, `t1o0`, `t0o1`,
 *    `t0o0`). A revision keeps at most one file per variant: the unique key becomes `(revision_id, kind, variant)`.
 *    The column needs a new unique key, so the table is rebuilt with SQLite's documented twelve-step procedure, as
 *    migrations 0013 and 0014 did (https://www.sqlite.org/lang_altertable.html#otheralter): new table, rows copied with
 *    their rowid, old table dropped, new one renamed, every trigger recreated. No other table refers to
 *    `revision_files`, and it has no index besides the unique keys the new definition declares itself. Existing rows
 *    get the variant they were rendered with: the time row was always printed, and the OT rows followed the
 *    snapshot's `show_ot_on_pdf`, so `t1o0` when that is false and `t1o1` otherwise. The identity trigger now also
 *    freezes `variant`; the three other triggers are recreated byte for byte.
 * 2. `revision_sends`: one immutable row per send of a revision (envelope, subject, bodies, the two row switches, the
 *    PDF variant, the optional reason for another copy, the send job). Insert-only (no-update and no-delete
 *    triggers); its job must be a `send_email` job of the same revision. Every existing `send_email` job gets one row
 *    (backfill): the envelope, subject and bodies of its revision's snapshot (`recipients`, what that job sends),
 *    `send_no` by job creation order within the revision, origin `deadline` for the initial send of an automatic
 *    revision and `employee` (the owner) otherwise, the derived variant, no reason, `request_key`
 *    `migrated:<job id>`. A revision sent before the upgrade therefore counts as sent: the deadline scan never sends
 *    it again and the reason rule sees its delivery attempts.
 * 3. `submission_settings.show_time_on_pdf`: the Settings default of the "Time rows on the PDF" switch (on), like
 *    `show_ot_on_pdf`. Versions stay append-only.
 *
 * The runner applies the migration inside one BEGIN EXCLUSIVE transaction with foreign key enforcement off and runs
 * `PRAGMA foreign_key_check` before COMMIT. Migrations 0001-0014 are never edited.
 */
const sql = `
CREATE TABLE revision_files_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pdf')),
  -- Which rows the PDF prints: t<time rows 0/1>o<OT rows 0/1>.
  variant TEXT NOT NULL CHECK (variant IN ('t1o1', 't1o0', 't0o1', 't0o0')),
  state TEXT NOT NULL CHECK (state IN ('pending', 'ready', 'failed')),
  attachment_id TEXT,
  -- Redacted error code/summary only.
  last_error TEXT CHECK (last_error IS NULL OR length(last_error) <= 500),
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB ${UTC}),
  UNIQUE (revision_id, kind, variant),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (attachment_id, user_id) REFERENCES attachments(id, user_id),
  CHECK ((state = 'ready') = (attachment_id IS NOT NULL))
) STRICT;

INSERT INTO revision_files_new (rowid, id, user_id, revision_id, kind, variant, state, attachment_id, last_error, created_at, updated_at)
SELECT f.rowid, f.id, f.user_id, f.revision_id, f.kind,
       COALESCE((SELECT CASE WHEN json_extract(r.payload_json, '$.show_ot_on_pdf') = 0 THEN 't1o0' ELSE 't1o1' END
                   FROM timesheet_revisions r WHERE r.id = f.revision_id AND r.user_id = f.user_id), 't1o1'),
       f.state, f.attachment_id, f.last_error, f.created_at, f.updated_at
FROM revision_files f ORDER BY f.rowid;

DROP TABLE revision_files;
ALTER TABLE revision_files_new RENAME TO revision_files;

CREATE TRIGGER revision_files_pdf_insert BEFORE INSERT ON revision_files
WHEN NEW.attachment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.attachment_id AND a.kind = 'pdf')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER revision_files_pdf_update BEFORE UPDATE OF attachment_id ON revision_files
WHEN NEW.attachment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.attachment_id AND a.kind = 'pdf')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER revision_files_identity BEFORE UPDATE ON revision_files
WHEN NEW.id IS NOT OLD.id OR NEW.user_id IS NOT OLD.user_id OR NEW.revision_id IS NOT OLD.revision_id
  OR NEW.kind IS NOT OLD.kind OR NEW.variant IS NOT OLD.variant OR NEW.created_at IS NOT OLD.created_at OR OLD.state = 'ready'
BEGIN SELECT RAISE(ABORT, 'immutable_revision_file'); END;
CREATE TRIGGER revision_files_no_delete BEFORE DELETE ON revision_files
BEGIN SELECT RAISE(ABORT, 'immutable_revision_file'); END;

-- One send of a revision: what one copy contained. Owner-private like other rendered email content.
CREATE TABLE revision_sends (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL,
  send_no INTEGER NOT NULL CHECK (send_no >= 1),
  -- The client's idempotency key (or migrated:<job id> for a send made before this migration).
  request_key TEXT NOT NULL CHECK (length(request_key) BETWEEN 8 AND 200 AND ${noLineBreak('request_key')}),
  origin TEXT NOT NULL CHECK (origin IN ('employee', 'deadline')),
  actor_user_id TEXT REFERENCES users(id),
  to_json TEXT NOT NULL CHECK ${jsonArray('to_json')},
  cc_json TEXT NOT NULL CHECK ${jsonArray('cc_json')},
  subject TEXT NOT NULL CHECK (length(subject) <= 1000 AND ${noLineBreak('subject')}),
  body_text TEXT NOT NULL CHECK (length(body_text) <= 100000),
  body_html TEXT NOT NULL CHECK (length(body_html) <= 400000),
  time_rows INTEGER NOT NULL CHECK (${flag('time_rows')}),
  ot_rows INTEGER NOT NULL CHECK (${flag('ot_rows')}),
  pdf_variant TEXT NOT NULL CHECK (pdf_variant = 't' || time_rows || 'o' || ot_rows),
  -- The owner's reason for another copy (B-A2): 2-500 characters, never in the email.
  reason TEXT CHECK (reason IS NULL OR length(reason) BETWEEN 2 AND 500),
  job_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL CHECK (created_at GLOB ${UTC}),
  UNIQUE (revision_id, send_no),
  UNIQUE (user_id, request_key),
  UNIQUE (id, user_id),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (job_id, user_id) REFERENCES jobs(id, user_id),
  CHECK ((origin = 'deadline') = (actor_user_id IS NULL)),
  CHECK (origin <> 'deadline' OR reason IS NULL)
) STRICT;
CREATE INDEX revision_sends_user ON revision_sends(user_id, created_at);
CREATE TRIGGER revision_sends_job BEFORE INSERT ON revision_sends
WHEN NOT EXISTS (
  SELECT 1 FROM jobs j WHERE j.id = NEW.job_id AND j.user_id = NEW.user_id AND j.revision_id = NEW.revision_id AND j.kind = 'send_email'
)
BEGIN SELECT RAISE(ABORT, 'send_job_mismatch'); END;
CREATE TRIGGER revision_sends_no_update BEFORE UPDATE ON revision_sends
BEGIN SELECT RAISE(ABORT, 'immutable_revision_send'); END;
CREATE TRIGGER revision_sends_no_delete BEFORE DELETE ON revision_sends
BEGIN SELECT RAISE(ABORT, 'immutable_revision_send'); END;

INSERT INTO revision_sends (id, user_id, revision_id, send_no, request_key, origin, actor_user_id, to_json, cc_json,
  subject, body_text, body_html, time_rows, ot_rows, pdf_variant, reason, job_id, created_at)
SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-'
         || substr('89ab', 1 + abs(random() % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
       j.user_id, j.revision_id,
       ROW_NUMBER() OVER (PARTITION BY j.revision_id ORDER BY j.created_at, j.rowid),
       'migrated:' || j.id,
       CASE WHEN r.origin = 'deadline' AND j.business_key = 'revision:' || r.id || ':send_email:initial' THEN 'deadline' ELSE 'employee' END,
       CASE WHEN r.origin = 'deadline' AND j.business_key = 'revision:' || r.id || ':send_email:initial' THEN NULL ELSE j.user_id END,
       COALESCE(json(json_extract(r.payload_json, '$.recipients.to')), '[]'),
       COALESCE(json(json_extract(r.payload_json, '$.recipients.cc')), '[]'),
       COALESCE(json_extract(r.payload_json, '$.recipients.subject'), ''),
       COALESCE(json_extract(r.payload_json, '$.recipients.body_text'), ''),
       COALESCE(json_extract(r.payload_json, '$.recipients.body_html'), ''),
       1,
       CASE WHEN json_extract(r.payload_json, '$.show_ot_on_pdf') = 0 THEN 0 ELSE 1 END,
       CASE WHEN json_extract(r.payload_json, '$.show_ot_on_pdf') = 0 THEN 't1o0' ELSE 't1o1' END,
       NULL, j.id, j.created_at
FROM jobs j
JOIN timesheet_revisions r ON r.id = j.revision_id AND r.user_id = j.user_id
WHERE j.kind = 'send_email'
ORDER BY j.created_at, j.rowid;

ALTER TABLE submission_settings ADD COLUMN show_time_on_pdf INTEGER NOT NULL DEFAULT 1 CHECK (show_time_on_pdf IN (0, 1));
`;

export const migration0015: Migration = { version: 15, name: 'sends', sql };
