import { randomUUID } from 'node:crypto';
import type { CivilDate } from '../../domain/dates.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import type { DeficitDebitResult, PostResult } from './ledger.ts';

/*
 * The ledger outcome of every proposal of a finalized revision (R4, owner decision F-2).
 *
 * A finalization asks the ledger service (ledger.ts, the only writer of ot_ledger) to post
 * each computable credit and each authorized deficit debit, then records here what
 * happened to every proposal, including the variants that append nothing:
 * - `posted`: the ledger entry the proposal produced (or the existing entry of an
 *   identical earlier posting) is linked;
 * - `pending_insufficient_balance`: the available balance could not cover the debit, so the
 *   ledger appended nothing (R-05: never silently negative);
 * - `waived`: the employee chose not to deduct a choose-mode deficit at sign-off;
 * - `pending_choice` and `unchanged` belong to the automatic and correction paths.
 *
 * F-2 (owner, 2026-10-04): a pending line stays a recorded, immutable line of its revision.
 * It is shown on the review and OT screens and is re-evaluated only by a later finalized
 * revision (a correction or a late review); no background job or other process posts it.
 * The "current" pending lines of a timesheet are therefore those of its finalized revision.
 *
 * Every query is scoped by the owner's user id; rows are append-only (database triggers
 * refuse UPDATE and DELETE).
 */

export type RevisionLineKind = 'credit' | 'deficit_debit' | 'correction';
export type RevisionLineOutcome = 'posted' | 'unchanged' | 'pending_insufficient_balance' | 'pending_choice' | 'waived';

export interface RevisionLedgerLine {
  id: string;
  revisionId: string;
  workDate: CivilDate;
  lineKind: RevisionLineKind;
  /** Signed proposal: credits positive, debits negative. */
  proposedMinutes: number;
  outcome: RevisionLineOutcome;
  ledgerEntryId: string | null;
  createdAt: string;
}

export interface LineOutcome {
  outcome: RevisionLineOutcome;
  ledgerEntryId: string | null;
}

interface LineRow {
  id: string;
  revision_id: string;
  work_date: string;
  line_kind: RevisionLineKind;
  proposed_minutes: number;
  outcome: RevisionLineOutcome;
  ledger_entry_id: string | null;
  created_at: string;
}

const LINE_COLUMNS = 'id, revision_id, work_date, line_kind, proposed_minutes, outcome, ledger_entry_id, created_at';
const LINE_ORDER = `ORDER BY work_date, CASE line_kind WHEN 'credit' THEN 0 WHEN 'deficit_debit' THEN 1 ELSE 2 END`;

function toLine(row: LineRow): RevisionLedgerLine {
  return {
    id: row.id,
    revisionId: row.revision_id,
    workDate: row.work_date,
    lineKind: row.line_kind,
    proposedMinutes: row.proposed_minutes,
    outcome: row.outcome,
    ledgerEntryId: row.ledger_entry_id,
    createdAt: row.created_at,
  };
}

/** A credit posting always yields an entry: a new one, or the identical earlier one. */
export function creditOutcome(result: PostResult): LineOutcome {
  return { outcome: 'posted', ledgerEntryId: result.entry.id };
}

/** A deficit debit either yields an entry or stays pending because the balance cannot cover it. */
export function deficitDebitOutcome(result: DeficitDebitResult): LineOutcome {
  if (result.status === 'pending') return { outcome: 'pending_insufficient_balance', ledgerEntryId: null };
  return { outcome: 'posted', ledgerEntryId: result.entry.id };
}

export interface NewRevisionLine {
  userId: string;
  revisionId: string;
  workDate: CivilDate;
  lineKind: RevisionLineKind;
  proposedMinutes: number;
  result: LineOutcome;
}

/** Appends one immutable line; call inside the finalization transaction. */
export function recordRevisionLine(db: Db, clock: Clock, line: NewRevisionLine): RevisionLedgerLine {
  const row: LineRow = {
    id: randomUUID(),
    revision_id: line.revisionId,
    work_date: line.workDate,
    line_kind: line.lineKind,
    proposed_minutes: line.proposedMinutes,
    outcome: line.result.outcome,
    ledger_entry_id: line.result.ledgerEntryId,
    created_at: nowUtc(clock),
  };
  db.prepare(
    `INSERT INTO revision_ledger_lines (id, user_id, revision_id, work_date, line_kind, proposed_minutes, outcome,
       ledger_entry_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(row.id, line.userId, row.revision_id, row.work_date, row.line_kind, row.proposed_minutes, row.outcome, row.ledger_entry_id, row.created_at);
  return toLine(row);
}

/** The owner's lines of one revision, by date (credit before debit on the same date). */
export function listRevisionLines(db: Db, userId: string, revisionId: string): RevisionLedgerLine[] {
  const rows = db
    .prepare(`SELECT ${LINE_COLUMNS} FROM revision_ledger_lines WHERE user_id = ? AND revision_id = ? ${LINE_ORDER}`)
    .all(userId, revisionId) as LineRow[];
  return rows.map(toLine);
}

export interface PendingRevisionLine extends RevisionLedgerLine {
  revisionNo: number;
  payrollDate: CivilDate;
}

/**
 * F-2: the owner's pending lines that are still current, i.e. those of each timesheet's
 * finalized revision. A later finalized revision supersedes the lines of earlier ones.
 */
export function currentPendingLines(db: Db, userId: string): PendingRevisionLine[] {
  const rows = db
    .prepare(
      `SELECT l.id, l.revision_id, l.work_date, l.line_kind, l.proposed_minutes, l.outcome, l.ledger_entry_id, l.created_at,
              r.revision_no, p.payroll_date
         FROM revision_ledger_lines l
         JOIN timesheet_revisions r ON r.id = l.revision_id AND r.user_id = l.user_id
         JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id AND t.finalized_revision_no = r.revision_no
         JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE l.user_id = ? AND l.outcome IN ('pending_insufficient_balance', 'pending_choice')
        ORDER BY l.work_date, l.line_kind`,
    )
    .all(userId) as Array<LineRow & { revision_no: number; payroll_date: string }>;
  return rows.map((row) => ({ ...toLine(row), revisionNo: row.revision_no, payrollDate: row.payroll_date }));
}

export function revisionLineJson(line: RevisionLedgerLine) {
  return {
    id: line.id,
    revision_id: line.revisionId,
    work_date: line.workDate,
    line_kind: line.lineKind,
    proposed_minutes: line.proposedMinutes,
    outcome: line.outcome,
    ledger_entry_id: line.ledgerEntryId,
  };
}

export function pendingLineJson(line: PendingRevisionLine) {
  return { ...revisionLineJson(line), revision_no: line.revisionNo, payroll_date: line.payrollDate };
}

/** Line counts by outcome for audit payloads (no minutes, dates or personal content). */
export function outcomeCounts(lines: readonly RevisionLedgerLine[]) {
  const countOf = (outcome: RevisionLineOutcome) => lines.filter((line) => line.outcome === outcome).length;
  return { posted: countOf('posted'), pending_insufficient_balance: countOf('pending_insufficient_balance'), waived: countOf('waived') };
}
