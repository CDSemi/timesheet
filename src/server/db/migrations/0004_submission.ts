import type { Migration } from '../migrations.ts';

// Same text formats as migrations 0001-0003, plus lowercase SHA-256 hex digests.
const DATE = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'";
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";
const sha256 = (column: string) => `(length(${column}) = 64 AND ${column} NOT GLOB '*[^0-9a-f]*')`;
const utc = (column: string) => `${column} GLOB ${UTC}`;
const nullableUtc = (column: string) => `(${column} IS NULL OR ${column} GLOB ${UTC})`;
const flag = (column: string) => `${column} IN (0, 1)`;
const noLineBreak = (column: string) => `(instr(${column}, char(10)) = 0 AND instr(${column}, char(13)) = 0)`;
const jsonArray = (column: string) => `(json_valid(${column}) AND json_type(${column}) = 'array')`;
const jsonObject = (column: string) => `(json_valid(${column}) AND json_type(${column}) = 'object')`;

/*
 * WP3 submission, finalization and delivery records (docs/03 Records, Atomicity and
 * snapshots; docs/05).
 *
 * Every owned row carries user_id and links to other owned rows through composite
 * (id, user_id) foreign keys, so a row can never point at another user's timesheet,
 * revision, attachment, ledger entry or job. Immutable history (attachments, settings
 * versions, revisions, sign-offs, revision ledger lines, reminder occurrences) refuses
 * UPDATE and DELETE through triggers. Mutable operational rows (revision files, jobs,
 * delivery attempts, the operations row) refuse DELETE and only move forward.
 *
 * No column stores a secret, a credential, a token or an image/PDF body: file content
 * lives in the private file store and a row holds only an opaque key, type, size and
 * SHA-256. SMTP settings come from the environment and are never persisted.
 *
 * Design points that follow pending owner decisions (planner recommendations):
 * - F-4: automation is gated by one system-wide operations_state.automation_active_from
 *   (NULL until the owner records activation) combined with each user's
 *   submission_settings.auto_submit_effective_from.
 * - F-2: a pending deficit debit stays an immutable revision_ledger_lines row of its
 *   revision; only a later finalized revision re-evaluates it. A different decision is
 *   applied by a later migration, never by editing this one.
 */
const sql = `
-- Private file metadata (signature images and final PDFs). The bytes live in the private
-- file store under the opaque storage_key; the key admits no path characters.
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL CHECK (kind IN ('signature', 'pdf')),
  storage_key TEXT NOT NULL UNIQUE
    CHECK (length(storage_key) BETWEEN 16 AND 128 AND storage_key NOT GLOB '*[^A-Za-z0-9_-]*'),
  sha256 TEXT NOT NULL CHECK ${sha256('sha256')},
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'application/pdf')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  width_px INTEGER CHECK (width_px IS NULL OR width_px > 0),
  height_px INTEGER CHECK (height_px IS NULL OR height_px > 0),
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  UNIQUE (id, user_id),
  CHECK (kind <> 'pdf' OR (mime_type = 'application/pdf' AND width_px IS NULL AND height_px IS NULL)),
  CHECK (kind <> 'signature' OR (mime_type IN ('image/png', 'image/jpeg') AND width_px IS NOT NULL AND height_px IS NOT NULL))
) STRICT;
-- The current signature of a user is the latest signature attachment; earlier ones stay
-- referenced by archived sign-offs and authorizations.
CREATE INDEX attachments_user_kind ON attachments(user_id, kind, created_at);
CREATE TRIGGER attachments_no_update BEFORE UPDATE ON attachments
BEGIN SELECT RAISE(ABORT, 'immutable_attachment'); END;
CREATE TRIGGER attachments_no_delete BEFORE DELETE ON attachments
BEGIN SELECT RAISE(ABORT, 'immutable_attachment'); END;

-- Per-user submission settings, append-only versions (highest seq is current). The
-- auto-submit value applies to periods whose due_at is on or after
-- auto_submit_effective_from (F-4); changes default to future periods.
CREATE TABLE submission_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  seq INTEGER NOT NULL CHECK (seq >= 1),
  recipients_to TEXT NOT NULL CHECK ${jsonArray('recipients_to')},
  recipients_cc TEXT NOT NULL CHECK ${jsonArray('recipients_cc')},
  subject_template TEXT NOT NULL CHECK (length(subject_template) BETWEEN 1 AND 500 AND ${noLineBreak('subject_template')}),
  body_template TEXT NOT NULL CHECK (length(body_template) BETWEEN 1 AND 10000),
  template_version INTEGER NOT NULL CHECK (template_version >= 1),
  auto_submit INTEGER NOT NULL CHECK (${flag('auto_submit')}),
  auto_submit_effective_from TEXT NOT NULL CHECK (${utc('auto_submit_effective_from')}),
  -- Explicit prior authorization to include one immutable signature image on automatic
  -- submissions; off by default and never a review event.
  auto_image_authorized INTEGER NOT NULL DEFAULT 0 CHECK (${flag('auto_image_authorized')}),
  auto_image_attachment_id TEXT,
  auto_image_authorized_at TEXT CHECK ${nullableUtc('auto_image_authorized_at')},
  show_ot_on_pdf INTEGER NOT NULL DEFAULT 1 CHECK (${flag('show_ot_on_pdf')}),
  reminder_offsets_minutes TEXT NOT NULL CHECK ${jsonArray('reminder_offsets_minutes')},
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  UNIQUE (user_id, seq),
  FOREIGN KEY (auto_image_attachment_id, user_id) REFERENCES attachments(id, user_id),
  CHECK ((auto_image_authorized = 1) = (auto_image_attachment_id IS NOT NULL)),
  CHECK ((auto_image_authorized = 1) = (auto_image_authorized_at IS NOT NULL))
) STRICT;
CREATE INDEX submission_settings_effective ON submission_settings(user_id, auto_submit_effective_from);
CREATE TRIGGER submission_settings_image_kind BEFORE INSERT ON submission_settings
WHEN NEW.auto_image_attachment_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM attachments a WHERE a.id = NEW.auto_image_attachment_id AND a.kind = 'signature'
)
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER submission_settings_no_update BEFORE UPDATE ON submission_settings
BEGIN SELECT RAISE(ABORT, 'immutable_submission_settings'); END;
CREATE TRIGGER submission_settings_no_delete BEFORE DELETE ON submission_settings
BEGIN SELECT RAISE(ABORT, 'immutable_submission_settings'); END;

-- Immutable finalized revisions with the canonical payload and its hash. An automatic
-- (deadline) revision is the original, unsigned and actorless; a signed revision binds
-- the reviewed hash to the payload hash. Revisions form one linear chain per timesheet.
CREATE TABLE timesheet_revisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  timesheet_id TEXT NOT NULL,
  revision_no INTEGER NOT NULL CHECK (revision_no >= 1),
  revision_kind TEXT NOT NULL CHECK (revision_kind IN ('original', 'correction', 'late_review')),
  origin TEXT NOT NULL CHECK (origin IN ('employee', 'deadline')),
  review_state TEXT NOT NULL CHECK (review_state IN ('pending', 'signed')),
  supersedes_revision_id TEXT,
  correction_reason TEXT CHECK (correction_reason IS NULL OR length(correction_reason) <= 2000),
  -- timesheets.version observed by the finalizing transaction.
  timesheet_version INTEGER NOT NULL CHECK (timesheet_version >= 1),
  payload_json TEXT NOT NULL CHECK ${jsonObject('payload_json')},
  payload_sha256 TEXT NOT NULL CHECK ${sha256('payload_sha256')},
  reviewed_sha256 TEXT CHECK (reviewed_sha256 IS NULL OR ${sha256('reviewed_sha256')}),
  -- The explicit choice to email this revision (a correction or late review never resends silently).
  send_requested INTEGER NOT NULL CHECK (${flag('send_requested')}),
  actor_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  UNIQUE (timesheet_id, revision_no),
  UNIQUE (id, user_id),
  FOREIGN KEY (timesheet_id, user_id) REFERENCES timesheets(id, user_id),
  FOREIGN KEY (supersedes_revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  CHECK ((revision_kind = 'original') = (supersedes_revision_id IS NULL)),
  CHECK ((revision_kind = 'original') = (revision_no = 1)),
  CHECK (revision_kind <> 'correction' OR (correction_reason IS NOT NULL AND length(trim(correction_reason)) > 0)),
  CHECK (revision_kind <> 'late_review' OR review_state = 'signed'),
  CHECK (origin <> 'deadline' OR (revision_kind = 'original' AND review_state = 'pending' AND actor_user_id IS NULL)),
  CHECK (origin <> 'employee' OR actor_user_id IS NOT NULL),
  CHECK ((review_state = 'signed') = (reviewed_sha256 IS NOT NULL)),
  CHECK (reviewed_sha256 IS NULL OR reviewed_sha256 = payload_sha256)
) STRICT;
CREATE INDEX timesheet_revisions_user ON timesheet_revisions(user_id, created_at);
CREATE TRIGGER timesheet_revisions_supersedes BEFORE INSERT ON timesheet_revisions
WHEN NEW.supersedes_revision_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM timesheet_revisions p
  WHERE p.id = NEW.supersedes_revision_id AND p.timesheet_id = NEW.timesheet_id
    AND p.revision_no + 1 = NEW.revision_no
)
BEGIN SELECT RAISE(ABORT, 'invalid_revision_supersedes'); END;
CREATE TRIGGER timesheet_revisions_no_update BEFORE UPDATE ON timesheet_revisions
BEGIN SELECT RAISE(ABORT, 'immutable_revision'); END;
CREATE TRIGGER timesheet_revisions_no_delete BEFORE DELETE ON timesheet_revisions
BEGIN SELECT RAISE(ABORT, 'immutable_revision'); END;

-- The real employee sign-off of one signed revision: name, actual signed_at, the
-- reviewed hash and the signature image used. Absent on automatic revisions.
CREATE TABLE signoffs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL UNIQUE,
  signer_name TEXT NOT NULL CHECK (length(trim(signer_name)) BETWEEN 1 AND 200),
  signed_at TEXT NOT NULL CHECK (${utc('signed_at')}),
  reviewed_sha256 TEXT NOT NULL CHECK ${sha256('reviewed_sha256')},
  signature_attachment_id TEXT NOT NULL,
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (signature_attachment_id, user_id) REFERENCES attachments(id, user_id)
) STRICT;
CREATE TRIGGER signoffs_revision_signed BEFORE INSERT ON signoffs
WHEN NOT EXISTS (
  SELECT 1 FROM timesheet_revisions r
  WHERE r.id = NEW.revision_id AND r.review_state = 'signed' AND r.reviewed_sha256 = NEW.reviewed_sha256
)
BEGIN SELECT RAISE(ABORT, 'signoff_revision_mismatch'); END;
CREATE TRIGGER signoffs_image_kind BEFORE INSERT ON signoffs
WHEN NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.signature_attachment_id AND a.kind = 'signature')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER signoffs_no_update BEFORE UPDATE ON signoffs
BEGIN SELECT RAISE(ABORT, 'immutable_signoff'); END;
CREATE TRIGGER signoffs_no_delete BEFORE DELETE ON signoffs
BEGIN SELECT RAISE(ABORT, 'immutable_signoff'); END;

-- Every OT proposal of a revision and what happened to it (R4): posted (linked ledger
-- entry), unchanged (nothing appended; may link the matching entry), pending because the
-- balance was insufficient, pending a deficit choice (automatic choose mode), or waived.
-- proposed_minutes is the signed delta: credits positive, debits negative, corrections
-- the difference (zero when unchanged).
CREATE TABLE revision_ledger_lines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL,
  work_date TEXT NOT NULL CHECK (work_date GLOB ${DATE}),
  line_kind TEXT NOT NULL CHECK (line_kind IN ('credit', 'deficit_debit', 'correction')),
  proposed_minutes INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN
    ('posted', 'unchanged', 'pending_insufficient_balance', 'pending_choice', 'waived')),
  ledger_entry_id TEXT,
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  UNIQUE (revision_id, work_date, line_kind),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (ledger_entry_id, user_id) REFERENCES ot_ledger(id, user_id),
  CHECK (line_kind <> 'credit' OR proposed_minutes > 0),
  CHECK (line_kind <> 'deficit_debit' OR proposed_minutes < 0),
  CHECK (outcome <> 'posted' OR ledger_entry_id IS NOT NULL),
  CHECK (outcome NOT IN ('pending_insufficient_balance', 'pending_choice', 'waived') OR ledger_entry_id IS NULL),
  CHECK (outcome NOT IN ('pending_choice', 'waived') OR line_kind = 'deficit_debit'),
  CHECK (outcome <> 'pending_insufficient_balance' OR line_kind IN ('deficit_debit', 'correction'))
) STRICT;
CREATE INDEX revision_ledger_lines_user_date ON revision_ledger_lines(user_id, work_date);
CREATE INDEX revision_ledger_lines_entry ON revision_ledger_lines(ledger_entry_id);
CREATE TRIGGER revision_ledger_lines_no_update BEFORE UPDATE ON revision_ledger_lines
BEGIN SELECT RAISE(ABORT, 'immutable_revision_ledger_line'); END;
CREATE TRIGGER revision_ledger_lines_no_delete BEFORE DELETE ON revision_ledger_lines
BEGIN SELECT RAISE(ABORT, 'immutable_revision_ledger_line'); END;

-- The final PDF of a revision: pending -> ready | failed, failed -> pending | ready;
-- ready is final and always points at an immutable PDF attachment.
CREATE TABLE revision_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pdf')),
  state TEXT NOT NULL CHECK (state IN ('pending', 'ready', 'failed')),
  attachment_id TEXT,
  -- Redacted error code/summary only.
  last_error TEXT CHECK (last_error IS NULL OR length(last_error) <= 500),
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  updated_at TEXT NOT NULL CHECK (${utc('updated_at')}),
  UNIQUE (revision_id, kind),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (attachment_id, user_id) REFERENCES attachments(id, user_id),
  CHECK ((state = 'ready') = (attachment_id IS NOT NULL))
) STRICT;
CREATE TRIGGER revision_files_pdf_insert BEFORE INSERT ON revision_files
WHEN NEW.attachment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.attachment_id AND a.kind = 'pdf')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER revision_files_pdf_update BEFORE UPDATE OF attachment_id ON revision_files
WHEN NEW.attachment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.attachment_id AND a.kind = 'pdf')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER revision_files_identity BEFORE UPDATE ON revision_files
WHEN NEW.id IS NOT OLD.id OR NEW.user_id IS NOT OLD.user_id OR NEW.revision_id IS NOT OLD.revision_id
  OR NEW.kind IS NOT OLD.kind OR NEW.created_at IS NOT OLD.created_at OR OLD.state = 'ready'
BEGIN SELECT RAISE(ABORT, 'immutable_revision_file'); END;
CREATE TRIGGER revision_files_no_delete BEFORE DELETE ON revision_files
BEGIN SELECT RAISE(ABORT, 'immutable_revision_file'); END;

-- Durable jobs (outbox). business_key makes enqueueing idempotent. A leased job carries
-- its lease; succeeded and cancelled are final; attempts never decrease. kind is a
-- lowercase identifier (not an enumeration) so later job kinds need no table rebuild.
-- payload_json holds routing IDs only, never message content or secrets.
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  revision_id TEXT,
  kind TEXT NOT NULL CHECK (length(kind) BETWEEN 1 AND 40 AND kind NOT GLOB '*[^a-z_]*'),
  business_key TEXT NOT NULL UNIQUE CHECK (length(business_key) BETWEEN 1 AND 200),
  payload_json TEXT NOT NULL DEFAULT '{}' CHECK (length(payload_json) <= 4000 AND ${jsonObject('payload_json')}),
  state TEXT NOT NULL CHECK (state IN ('queued', 'leased', 'succeeded', 'intervention', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_run_at TEXT NOT NULL CHECK (${utc('next_run_at')}),
  lease_owner TEXT CHECK (lease_owner IS NULL OR length(lease_owner) BETWEEN 1 AND 100),
  lease_expires_at TEXT CHECK ${nullableUtc('lease_expires_at')},
  -- Redacted error code/summary only (no credentials, recipients or message body).
  last_error TEXT CHECK (last_error IS NULL OR length(last_error) <= 500),
  created_at TEXT NOT NULL CHECK (${utc('created_at')}),
  updated_at TEXT NOT NULL CHECK (${utc('updated_at')}),
  UNIQUE (id, user_id),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  CHECK (revision_id IS NULL OR user_id IS NOT NULL),
  CHECK ((state = 'leased') = (lease_owner IS NOT NULL)),
  CHECK ((state = 'leased') = (lease_expires_at IS NOT NULL))
) STRICT;
CREATE INDEX jobs_due ON jobs(state, next_run_at);
CREATE INDEX jobs_revision ON jobs(revision_id);
CREATE INDEX jobs_user ON jobs(user_id);
CREATE TRIGGER jobs_identity BEFORE UPDATE ON jobs
WHEN NEW.id IS NOT OLD.id OR NEW.user_id IS NOT OLD.user_id OR NEW.revision_id IS NOT OLD.revision_id
  OR NEW.kind IS NOT OLD.kind OR NEW.business_key IS NOT OLD.business_key
  OR NEW.payload_json IS NOT OLD.payload_json OR NEW.created_at IS NOT OLD.created_at
BEGIN SELECT RAISE(ABORT, 'immutable_job'); END;
CREATE TRIGGER jobs_closed BEFORE UPDATE ON jobs
WHEN OLD.state IN ('succeeded', 'cancelled')
BEGIN SELECT RAISE(ABORT, 'job_closed'); END;
CREATE TRIGGER jobs_attempts_forward BEFORE UPDATE OF attempts ON jobs
WHEN NEW.attempts < OLD.attempts
BEGIN SELECT RAISE(ABORT, 'job_attempts_regression'); END;
CREATE TRIGGER jobs_no_delete BEFORE DELETE ON jobs
BEGIN SELECT RAISE(ABORT, 'immutable_job'); END;

-- One delivery attempt of a job with its frozen envelope (recipients, subject, Message-ID,
-- attachment hash; never credentials). State is committed as 'sending' before the network
-- call; uncertain is never retried automatically and takes one explicit decision.
CREATE TABLE delivery_attempts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  revision_id TEXT,
  attempt_no INTEGER NOT NULL CHECK (attempt_no >= 1),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'ntfy')),
  envelope_json TEXT NOT NULL CHECK (length(envelope_json) <= 20000 AND ${jsonObject('envelope_json')}),
  attachment_id TEXT,
  message_id TEXT NOT NULL CHECK (length(message_id) BETWEEN 3 AND 300 AND ${noLineBreak('message_id')}),
  provider_message_id TEXT CHECK (provider_message_id IS NULL OR (length(provider_message_id) <= 300 AND ${noLineBreak('provider_message_id')})),
  state TEXT NOT NULL CHECK (state IN
    ('preparing', 'sending', 'accepted', 'failed_temporary', 'failed_permanent', 'uncertain')),
  -- Redacted provider response only.
  provider_response TEXT CHECK (provider_response IS NULL OR length(provider_response) <= 1000),
  accepted_at TEXT CHECK ${nullableUtc('accepted_at')},
  decision TEXT CHECK (decision IS NULL OR decision IN ('resend', 'treat_as_accepted', 'abandon')),
  decision_actor_user_id TEXT REFERENCES users(id),
  decided_at TEXT CHECK ${nullableUtc('decided_at')},
  started_at TEXT NOT NULL CHECK (${utc('started_at')}),
  updated_at TEXT NOT NULL CHECK (${utc('updated_at')}),
  UNIQUE (job_id, attempt_no),
  FOREIGN KEY (job_id, user_id) REFERENCES jobs(id, user_id),
  FOREIGN KEY (revision_id, user_id) REFERENCES timesheet_revisions(id, user_id),
  FOREIGN KEY (attachment_id, user_id) REFERENCES attachments(id, user_id),
  CHECK ((state = 'accepted') = (accepted_at IS NOT NULL)),
  CHECK ((decision IS NULL) = (decided_at IS NULL)),
  CHECK ((decision IS NULL) = (decision_actor_user_id IS NULL)),
  CHECK (decision IS NULL OR state IN ('uncertain', 'failed_permanent'))
) STRICT;
CREATE INDEX delivery_attempts_state ON delivery_attempts(state);
CREATE INDEX delivery_attempts_user ON delivery_attempts(user_id, started_at);
-- At most one open attempt per revision: preparing, sending, or uncertain without a decision.
CREATE UNIQUE INDEX delivery_attempts_one_open_per_revision ON delivery_attempts(revision_id)
WHERE revision_id IS NOT NULL AND (state IN ('preparing', 'sending') OR (state = 'uncertain' AND decision IS NULL));
CREATE TRIGGER delivery_attempts_attachment_kind BEFORE INSERT ON delivery_attempts
WHEN NEW.attachment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.id = NEW.attachment_id AND a.kind = 'pdf')
BEGIN SELECT RAISE(ABORT, 'attachment_kind_mismatch'); END;
CREATE TRIGGER delivery_attempts_frozen BEFORE UPDATE ON delivery_attempts
WHEN NEW.id IS NOT OLD.id OR NEW.job_id IS NOT OLD.job_id OR NEW.user_id IS NOT OLD.user_id
  OR NEW.revision_id IS NOT OLD.revision_id OR NEW.attempt_no IS NOT OLD.attempt_no
  OR NEW.channel IS NOT OLD.channel OR NEW.envelope_json IS NOT OLD.envelope_json
  OR NEW.attachment_id IS NOT OLD.attachment_id OR NEW.message_id IS NOT OLD.message_id
  OR NEW.started_at IS NOT OLD.started_at
BEGIN SELECT RAISE(ABORT, 'immutable_delivery_attempt'); END;
CREATE TRIGGER delivery_attempts_state_flow BEFORE UPDATE OF state ON delivery_attempts
WHEN NEW.state IS NOT OLD.state AND NOT (
  (OLD.state = 'preparing' AND NEW.state IN ('sending', 'failed_temporary', 'failed_permanent'))
  OR (OLD.state = 'sending' AND NEW.state IN ('accepted', 'failed_temporary', 'failed_permanent', 'uncertain'))
  OR (OLD.state = 'uncertain' AND OLD.decision IS NULL AND NEW.state = 'accepted')
)
BEGIN SELECT RAISE(ABORT, 'invalid_delivery_transition'); END;
CREATE TRIGGER delivery_attempts_decision_once BEFORE UPDATE OF decision, decision_actor_user_id, decided_at ON delivery_attempts
WHEN OLD.decision IS NOT NULL AND (NEW.decision IS NOT OLD.decision
  OR NEW.decision_actor_user_id IS NOT OLD.decision_actor_user_id OR NEW.decided_at IS NOT OLD.decided_at)
BEGIN SELECT RAISE(ABORT, 'immutable_delivery_decision'); END;
CREATE TRIGGER delivery_attempts_no_delete BEFORE DELETE ON delivery_attempts
BEGIN SELECT RAISE(ABORT, 'immutable_delivery_attempt'); END;

-- One recorded decision per user, period, reminder kind and occurrence (dedupe). A
-- collapsed or suppressed occurrence has no job.
CREATE TABLE reminder_occurrences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pay_period_id TEXT NOT NULL REFERENCES pay_periods(id),
  kind TEXT NOT NULL CHECK (kind IN ('before_due', 'overdue', 'outcome_notice')),
  occurrence_key TEXT NOT NULL CHECK (length(occurrence_key) BETWEEN 1 AND 200),
  disposition TEXT NOT NULL CHECK (disposition IN ('enqueued', 'collapsed', 'suppressed')),
  job_id TEXT,
  decided_at TEXT NOT NULL CHECK (${utc('decided_at')}),
  UNIQUE (user_id, pay_period_id, kind, occurrence_key),
  FOREIGN KEY (job_id, user_id) REFERENCES jobs(id, user_id),
  CHECK ((disposition = 'enqueued') = (job_id IS NOT NULL))
) STRICT;
CREATE TRIGGER reminder_occurrences_no_update BEFORE UPDATE ON reminder_occurrences
BEGIN SELECT RAISE(ABORT, 'immutable_reminder_occurrence'); END;
CREATE TRIGGER reminder_occurrences_no_delete BEFORE DELETE ON reminder_occurrences
BEGIN SELECT RAISE(ABORT, 'immutable_reminder_occurrence'); END;

-- Single system row. automation_active_from stays NULL until the owner records activation
-- (F-4); only periods with due_at on or after it are eligible for automatic submission.
CREATE TABLE operations_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  automation_active_from TEXT CHECK ${nullableUtc('automation_active_from')},
  automation_recorded_at TEXT CHECK ${nullableUtc('automation_recorded_at')},
  automation_recorded_by TEXT REFERENCES users(id),
  runner_heartbeat_at TEXT CHECK ${nullableUtc('runner_heartbeat_at')},
  runner_instance TEXT CHECK (runner_instance IS NULL OR length(runner_instance) BETWEEN 1 AND 100),
  CHECK (automation_active_from IS NULL OR automation_recorded_at IS NOT NULL)
) STRICT;
INSERT INTO operations_state (id) VALUES (1);
CREATE TRIGGER operations_state_no_delete BEFORE DELETE ON operations_state
BEGIN SELECT RAISE(ABORT, 'immutable_operations_state'); END;

-- WP4 imported history is never reminded, automatically finalized or sent.
ALTER TABLE timesheets ADD COLUMN imported_unverified INTEGER NOT NULL DEFAULT 0
  CHECK (imported_unverified IN (0, 1));
`;

export const migration0004: Migration = { version: 4, name: 'submission', sql };
