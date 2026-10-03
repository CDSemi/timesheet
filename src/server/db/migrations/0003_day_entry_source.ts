import type { Migration } from '../migrations.ts';

/*
 * Day-entry category source and leave kind (WP2-T05, owner decision E-2).
 *
 * category_source distinguishes a label the system defaulted from the calendar when a
 * work session created the row ('default') from a label the employee chose
 * ('explicit'). A default row takes its label from the calendar at read time, so a
 * holiday import never has to write employee rows; an explicit row is never relabelled.
 * Rows that exist before this migration are backfilled as 'explicit' (the column
 * default), the conservative reading of WP1 data: an employee may have chosen them.
 *
 * leave_kind records what the day's leave minutes are (vacation, sick or ot). It is
 * NULL when there are no leave minutes and for WP1 rows, whose kind was never recorded.
 * It is only a label: it never reserves or spends OT, and there is no OT-funded category.
 *
 * Both columns are added in place (no table rebuild), so every WP1 row and the
 * composite foreign keys that point at day_entries stay untouched.
 */
const sql = `
ALTER TABLE day_entries ADD COLUMN category_source TEXT NOT NULL DEFAULT 'explicit'
  CHECK (category_source IN ('default', 'explicit'));
ALTER TABLE day_entries ADD COLUMN leave_kind TEXT
  CHECK (leave_kind IS NULL OR leave_kind IN ('vacation', 'sick', 'ot'));

-- A kind describes leave minutes, so it cannot exist without them (defense in depth).
CREATE TRIGGER day_entries_leave_kind_insert BEFORE INSERT ON day_entries
WHEN NEW.leave_kind IS NOT NULL AND NEW.leave_minutes = 0
BEGIN SELECT RAISE(ABORT, 'leave_kind_without_minutes'); END;

CREATE TRIGGER day_entries_leave_kind_update BEFORE UPDATE OF leave_minutes, leave_kind ON day_entries
WHEN NEW.leave_kind IS NOT NULL AND NEW.leave_minutes = 0
BEGIN SELECT RAISE(ABORT, 'leave_kind_without_minutes'); END;
`;

export const migration0003: Migration = { version: 3, name: 'day_entry_source', sql };
