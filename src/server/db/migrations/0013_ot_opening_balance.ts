import type { Migration } from '../migrations.ts';

// Same text formats as migrations 0001 and 0002: accounting dates and second-precision UTC instants.
const DATE = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'";
const UTC = "'[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]Z'";

/*
 * WP4-T10: the explicit opening OT balance (owner decision F-3 (a), 2026-10-05; docs/03 "Imports, opening balance and
 * retention", docs/07 "Workbook import", docs/02 R-06).
 *
 * The opening balance is the ledger entry type `opening_balance`: signed, non-zero minutes with an as-of date, a
 * reason and an evidence reference. It is the only OT carry-in, one per user (`ot_ledger_one_opening_balance`), and
 * it changes only through a reasoned `correction` linked to it, which may carry its own evidence reference. Two
 * columns are added: `as_of_date` (set only on the opening balance; it is not a work date, so the entry is never
 * counted as a row of a pay period) and `evidence_ref` (only on an opening balance and on corrections).
 *
 * The entry type is a CHECK constraint, so the table is rebuilt with SQLite's documented twelve-step procedure
 * (https://www.sqlite.org/lang_altertable.html#otheralter): create the new table under a temporary name, copy every
 * row with its rowid (the service orders by rowid), drop the old table, rename the new one, then recreate every
 * index and trigger. The runner applies migrations inside one BEGIN EXCLUSIVE transaction with foreign key
 * enforcement switched off before the transaction (step 1: inside a transaction the pragma is a no-op, and with
 * enforcement on, the implicit DELETE of DROP TABLE would count every referencing row of `revision_ledger_lines` and
 * of the self-reference as a deferred violation that no rename clears, so even `defer_foreign_keys` cannot commit).
 * The runner runs `PRAGMA foreign_key_check` before COMMIT (step 10) and rolls everything back on any violation.
 *
 * - The new table names `ot_ledger` in its self-reference, so after the rename the composite foreign keys are the
 *   same as before; `revision_ledger_lines` refers to the table by name and is not touched.
 * - The append-only triggers and the three indexes are recreated byte for byte; the correction-target trigger also
 *   accepts the opening balance as an original (a correction chain still always points at the original).
 *
 * Migrations 0001-0012 are never edited.
 */
const sql = `
CREATE TABLE ot_ledger_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN
    ('credit', 'deficit_debit', 'correction', 'leave_consumption', 'leave_reversal', 'opening_balance')),
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
  -- F-3: the accounting date the opening balance is stated at (not a work date).
  as_of_date TEXT CHECK (as_of_date IS NULL OR as_of_date GLOB ${DATE}),
  -- F-3: a text reference to the evidence of an opening balance or of its correction.
  evidence_ref TEXT CHECK (evidence_ref IS NULL OR length(trim(evidence_ref)) BETWEEN 1 AND 2000),
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
  CHECK (entry_type = 'correction' OR reconciliation_required = 0),
  CHECK ((entry_type = 'opening_balance') = (as_of_date IS NOT NULL)),
  CHECK (entry_type <> 'opening_balance' OR (
    origin = 'manual' AND work_date IS NULL AND evidence_ref IS NOT NULL
    AND reason IS NOT NULL AND length(trim(reason)) > 0)),
  CHECK (entry_type IN ('opening_balance', 'correction') OR evidence_ref IS NULL)
) STRICT;

INSERT INTO ot_ledger_new (rowid, id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
  leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at, as_of_date, evidence_ref)
SELECT rowid, id, user_id, entry_type, delta_minutes, source_key, source_ref, corrects_entry_id,
  leave_request_id, work_date, actor_user_id, origin, reason, reconciliation_required, posted_at, NULL, NULL
FROM ot_ledger ORDER BY rowid;

DROP TABLE ot_ledger;
ALTER TABLE ot_ledger_new RENAME TO ot_ledger;

CREATE INDEX ot_ledger_user_date ON ot_ledger(user_id, work_date);
CREATE INDEX ot_ledger_corrects ON ot_ledger(corrects_entry_id);
CREATE INDEX ot_ledger_leave ON ot_ledger(leave_request_id);
-- F-3: one opening balance per user, whatever its source key.
CREATE UNIQUE INDEX ot_ledger_one_opening_balance ON ot_ledger(user_id) WHERE entry_type = 'opening_balance';

-- Only original postings are corrected; a correction chain always points at the original.
CREATE TRIGGER ot_ledger_correction_target BEFORE INSERT ON ot_ledger
WHEN NEW.corrects_entry_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM ot_ledger o
  WHERE o.id = NEW.corrects_entry_id AND o.user_id = NEW.user_id
    AND o.entry_type IN ('credit', 'deficit_debit', 'opening_balance')
)
BEGIN SELECT RAISE(ABORT, 'invalid_correction_target'); END;

CREATE TRIGGER ot_ledger_no_update BEFORE UPDATE ON ot_ledger
BEGIN SELECT RAISE(ABORT, 'immutable_ledger_entry'); END;
CREATE TRIGGER ot_ledger_no_delete BEFORE DELETE ON ot_ledger
BEGIN SELECT RAISE(ABORT, 'immutable_ledger_entry'); END;
`;

export const migration0013: Migration = { version: 13, name: 'ot_opening_balance', sql };
