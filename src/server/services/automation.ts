import { addDays, diffDays } from '../../domain/dates.ts';
import { isDomainError } from '../../domain/errors.ts';
import { type EpochSeconds, formatUtcInstant, parseUtcInstant } from '../../domain/instants.ts';
import { type PayPeriod, payPeriodAt } from '../../domain/periods.ts';
import { localDateOf } from '../../domain/zones.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
import { normalizeReason } from '../http/validation.ts';
import { recordAudit } from './audit.ts';
import { getCalendar, listPayrollExceptions } from './calendars.ts';
import { finalizeAutomatically } from './finalization.ts';
import { ensurePayPeriodRow } from './periods.ts';

/*
 * Deadline automation (docs/05 "Deadline and recovery", AC-07, the owner's F-1 and F-4
 * decisions). Two parts:
 *
 * - The activation boundary (F-4): one system-wide instant `operations_state.automation_active_from`,
 *   NULL until the owner's pilot. Nothing is finalized, recorded as overdue or queued while it
 *   is NULL. An administrator records or clears it through an audited route; the instant may
 *   not lie in the past, so recording it can never sweep up history.
 * - The deadline scan: a pure database pass (no network, no file) that finds every period whose
 *   deadline has passed, oldest deadline first, and either finalizes it automatically or records
 *   it as overdue. The scan is the same code for the normal tick and for recovery after downtime:
 *   it re-derives every deadline from the saved calendar with the production zone functions,
 *   never from a counter, so a missed tick loses nothing and the work per call is bounded.
 *
 * A period is eligible for automatic finalization when all of these hold, re-checked inside the
 * finalization transaction so a concurrent change by anyone else is seen:
 * - the owner is an active account and the activation instant is set;
 * - the deadline is on or after the activation instant and has passed;
 * - the timesheet (when one exists) is unfinalized and not `imported_unverified`;
 * - the auto-submit switch that governs the deadline is on. Each saved version of a user's
 *   settings applies to deadlines on or after its own effective instant, so the governing
 *   version is the newest one whose effective instant is not after the deadline; a deadline
 *   before every version has no governing switch and is never touched. A user who never saved
 *   settings has the default (on).
 * A period governed by an off switch gets one overdue record (an audit event, no export, no
 * revision); the employee can still sign off manually. An eligible period with no saved entries
 * is still submitted with the default labels (F-1; the transaction creates the timesheet row).
 *
 * Every candidate runs in its own transaction: one failing period never blocks the others, its
 * failure is recorded once as a code (no message, no personal content) and it is retried by the
 * next scan.
 */

export const DEFAULT_BATCH_SIZE = 25;
const MAX_REASON = 1000;

export const ACTIVATION_AUDIT_OPERATION = 'automation.activation';
export const OVERDUE_AUDIT_OPERATION = 'deadline.overdue';
export const FAILURE_AUDIT_OPERATION = 'deadline.finalize_failed';

/* ------------------------------------------------------------ activation ---- */

export interface AutomationActivation {
  /** The system-wide activation instant (UTC), or null until the owner's pilot. */
  activeFrom: string | null;
  recordedAt: string | null;
  recordedBy: string | null;
}

interface ActivationRow {
  automation_active_from: string | null;
  automation_recorded_at: string | null;
  automation_recorded_by: string | null;
}

export function getAutomationActivation(db: Db): AutomationActivation {
  const row = db
    .prepare<[], ActivationRow>('SELECT automation_active_from, automation_recorded_at, automation_recorded_by FROM operations_state WHERE id = 1')
    .get();
  if (row === undefined) throw new Error('The operations state row is missing');
  return { activeFrom: row.automation_active_from, recordedAt: row.automation_recorded_at, recordedBy: row.automation_recorded_by };
}

export interface SetActivationInput {
  actorUserId: string;
  /** A UTC instant such as 2026-10-05T00:00:00Z, or null to clear the activation. */
  activeFrom: string | null;
  /** Required and non-blank. */
  reason: string | null;
}

/**
 * Records or clears the activation instant (audited, one IMMEDIATE transaction). Recording the
 * value that is already stored changes nothing. An instant before the current time is refused
 * (`activation_in_past`): periods already due must never be swept into automation by accident.
 * The audit event carries the instant only, never any timesheet detail.
 */
export function setAutomationActivation(db: Db, clock: Clock, input: SetActivationInput): AutomationActivation {
  const reason = normalizeReason(input.reason);
  if (reason === null) throw new ApiError(422, 'reason_required', 'Recording or clearing the activation needs a reason');
  if (reason.length > MAX_REASON) throw new ApiError(422, 'invalid_reason', `The reason must be at most ${MAX_REASON} characters`);
  // A malformed instant is a domain error (422 invalid_instant); the canonical text is what is stored.
  const requested: EpochSeconds | null = input.activeFrom === null ? null : parseUtcInstant(input.activeFrom, 'active_from');
  const canonical = requested === null ? null : formatUtcInstant(requested);
  return writeTransaction(db, (): AutomationActivation => {
    const previous = getAutomationActivation(db);
    if (previous.activeFrom === canonical) return previous;
    if (requested !== null && requested < nowEpoch(clock)) {
      throw new ApiError(422, 'activation_in_past', 'The activation instant cannot be before the current time');
    }
    const now = nowUtc(clock);
    db.prepare('UPDATE operations_state SET automation_active_from = ?, automation_recorded_at = ?, automation_recorded_by = ? WHERE id = 1').run(
      canonical,
      now,
      input.actorUserId,
    );
    recordAudit(db, clock, {
      actorUserId: input.actorUserId,
      ownerUserId: null,
      operation: ACTIVATION_AUDIT_OPERATION,
      entityType: 'operations_state',
      entityId: '1',
      reason,
      before: { active_from: previous.activeFrom },
      after: { active_from: canonical },
    });
    return getAutomationActivation(db);
  });
}

export function activationJson(activation: AutomationActivation) {
  return { active_from: activation.activeFrom, recorded_at: activation.recordedAt, recorded_by: activation.recordedBy };
}

/* ----------------------------------------------------------- eligibility ---- */

type SkipReason = 'not_active' | 'inactive_user' | 'before_activation' | 'not_due' | 'finalized' | 'imported' | 'before_effective' | 'overdue_recorded';

type Verdict = { kind: 'finalize' } | { kind: 'overdue' } | { kind: 'skip'; reason: SkipReason };

interface Candidate {
  user: SessionUser;
  period: PayPeriod;
}

interface TimesheetState {
  finalized_revision_no: number | null;
  imported_unverified: number;
}

/** The switch governing a deadline, or null when no saved version applies yet. */
function governingSwitch(db: Db, userId: string, dueAt: string): { autoSubmit: boolean } | null {
  const row = db
    .prepare<[string, string], { auto_submit: number }>(
      'SELECT auto_submit FROM submission_settings WHERE user_id = ? AND auto_submit_effective_from <= ? ORDER BY seq DESC LIMIT 1',
    )
    .get(userId, dueAt);
  if (row !== undefined) return { autoSubmit: row.auto_submit === 1 };
  const saved = db.prepare<[string], { one: number }>('SELECT 1 AS one FROM submission_settings WHERE user_id = ? LIMIT 1').get(userId);
  // A user who never saved settings has the default, which is on.
  return saved === undefined ? { autoSubmit: true } : null;
}

function overdueRecorded(db: Db, userId: string, payPeriodId: string | undefined): boolean {
  if (payPeriodId === undefined) return false;
  return db
    .prepare<[string, string, string], { one: number }>(
      "SELECT 1 AS one FROM audit_events WHERE owner_user_id = ? AND operation = ? AND entity_type = 'pay_period' AND entity_id = ? LIMIT 1",
    )
    .get(userId, OVERDUE_AUDIT_OPERATION, payPeriodId) !== undefined;
}

function storedPeriodId(db: Db, calendarId: string, period: PayPeriod): string | undefined {
  return db.prepare<[string, number], { id: string }>('SELECT id FROM pay_periods WHERE calendar_id = ? AND period_index = ?').get(calendarId, period.index)?.id;
}

/** Decides what the scan does with one period right now (reads only; owner-scoped by `candidate.user.id`). */
function assessPeriod(db: Db, clock: Clock, candidate: Candidate): Verdict {
  const { user, period } = candidate;
  const status = db.prepare<[string], { status: string }>('SELECT status FROM users WHERE id = ?').get(user.id)?.status;
  if (status !== 'active') return { kind: 'skip', reason: 'inactive_user' };
  const { activeFrom } = getAutomationActivation(db);
  if (activeFrom === null) return { kind: 'skip', reason: 'not_active' };
  if (period.dueAtUtc < parseUtcInstant(activeFrom)) return { kind: 'skip', reason: 'before_activation' };
  if (period.dueAtUtc > nowEpoch(clock)) return { kind: 'skip', reason: 'not_due' };
  const timesheet = db
    .prepare<[string, string, number], TimesheetState>(
      `SELECT t.finalized_revision_no, t.imported_unverified
         FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE t.user_id = ? AND p.calendar_id = ? AND p.period_index = ?`,
    )
    .get(user.id, user.calendarId, period.index);
  if (timesheet !== undefined && timesheet.finalized_revision_no !== null) return { kind: 'skip', reason: 'finalized' };
  if (timesheet !== undefined && timesheet.imported_unverified === 1) return { kind: 'skip', reason: 'imported' };
  const governing = governingSwitch(db, user.id, formatUtcInstant(period.dueAtUtc));
  if (governing === null) return { kind: 'skip', reason: 'before_effective' };
  if (governing.autoSubmit) return { kind: 'finalize' };
  if (overdueRecorded(db, user.id, storedPeriodId(db, user.calendarId, period))) return { kind: 'skip', reason: 'overdue_recorded' };
  return { kind: 'overdue' };
}

/* ------------------------------------------------------------ candidates ---- */

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: SessionUser['role'];
  calendar_id: string;
}

/** The synthetic owner of an automatic action: the job acts for the owner but has no session. */
function ownerOf(row: UserRow): SessionUser {
  return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'deadline-job' };
}

/**
 * Every period of every active account whose deadline lies between the activation instant and
 * now, oldest deadline first (ties by account id, then period index). The deadline itself comes
 * from `payPeriodAt`, i.e. from the saved reporting zone with the production zone functions.
 */
function listCandidates(db: Db, clock: Clock, activeFrom: EpochSeconds): Candidate[] {
  const now = nowEpoch(clock);
  const users = db.prepare<[], UserRow>("SELECT id, email, display_name, role, calendar_id FROM users WHERE status = 'active' ORDER BY id").all();
  const candidates: Candidate[] = [];
  const calendars = new Map<string, { schedule: ReturnType<typeof getCalendar>['schedule']; exceptions: ReturnType<typeof listPayrollExceptions>; indices: number[] }>();
  for (const row of users) {
    let calendar = calendars.get(row.calendar_id);
    if (calendar === undefined) {
      const { schedule } = getCalendar(db, row.calendar_id);
      const exceptions = listPayrollExceptions(db, row.calendar_id);
      // The due date is the nominal payroll date plus a fixed offset, so the periods due in a date
      // range are found from the range itself; one period of slack covers zone and exception drift,
      // and every exception is listed explicitly because it may move a deadline anywhere.
      const indexDueOn = (instant: EpochSeconds): number =>
        Math.floor(diffDays(addDays(localDateOf(schedule.reportingZone, instant), -schedule.dueOffsetDays), schedule.anchorPayrollDate) / schedule.cycleDays);
      const indices = new Set<number>();
      for (let index = indexDueOn(activeFrom) - 1; index <= indexDueOn(now) + 1; index += 1) indices.add(index);
      for (const exception of exceptions) {
        indices.add(diffDays(exception.nominalPayrollDate, schedule.anchorPayrollDate) / schedule.cycleDays);
      }
      calendar = { schedule, exceptions, indices: [...indices] };
      calendars.set(row.calendar_id, calendar);
    }
    const owner = ownerOf(row);
    for (const index of calendar.indices) {
      const period = payPeriodAt(calendar.schedule, index, calendar.exceptions);
      if (period.dueAtUtc >= activeFrom && period.dueAtUtc <= now) candidates.push({ user: owner, period });
    }
  }
  return candidates.sort((a, b) => a.period.dueAtUtc - b.period.dueAtUtc || (a.user.id < b.user.id ? -1 : a.user.id > b.user.id ? 1 : 0) || a.period.index - b.period.index);
}

/* ------------------------------------------------------------------ scan ---- */

export interface ScanOptions {
  /** The most periods acted on in this call (finalized, recorded or failed); the rest wait for the next call. */
  batchSize?: number;
}

export interface ScanSummary {
  /** False while the activation instant is null: nothing was read or written. */
  activated: boolean;
  /** Periods whose deadline lies between the activation instant and now. */
  examined: number;
  finalized: number;
  overdueRecorded: number;
  /** Periods that needed nothing (finalized, imported, recorded before) or changed under the scan. */
  skipped: number;
  failed: number;
  /** True when the batch was full and more periods are waiting. */
  remaining: boolean;
}

function failureCode(error: unknown): string {
  const code = error instanceof ApiError || isDomainError(error) ? error.code : error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : 'internal_error';
  return /^[A-Za-z0-9_.:-]{1,60}$/.test(code) ? code : 'internal_error';
}

/** Records the failure of one period once (a code only); never lets the recording itself stop the scan. */
function recordFailure(db: Db, clock: Clock, candidate: Candidate, error: unknown): void {
  try {
    writeTransaction(db, () => {
      const payPeriodId = ensurePayPeriodRow(db, clock, candidate.user.calendarId, candidate.period);
      const known = db
        .prepare<[string, string, string], { one: number }>(
          "SELECT 1 AS one FROM audit_events WHERE owner_user_id = ? AND operation = ? AND entity_type = 'pay_period' AND entity_id = ? LIMIT 1",
        )
        .get(candidate.user.id, FAILURE_AUDIT_OPERATION, payPeriodId);
      if (known !== undefined) return;
      recordAudit(db, clock, {
        actorUserId: null,
        ownerUserId: candidate.user.id,
        operation: FAILURE_AUDIT_OPERATION,
        entityType: 'pay_period',
        entityId: payPeriodId,
        after: { payroll_date: candidate.period.payrollDate, code: failureCode(error) },
      });
    });
  } catch {
    // The next scan retries the period and records the failure again.
  }
}

/** Writes the overdue record of a period governed by an off switch; false when it changed meanwhile. */
function recordOverdue(db: Db, clock: Clock, candidate: Candidate): boolean {
  return writeTransaction(db, (): boolean => {
    if (assessPeriod(db, clock, candidate).kind !== 'overdue') return false;
    const payPeriodId = ensurePayPeriodRow(db, clock, candidate.user.calendarId, candidate.period);
    recordAudit(db, clock, {
      actorUserId: null,
      ownerUserId: candidate.user.id,
      operation: OVERDUE_AUDIT_OPERATION,
      entityType: 'pay_period',
      entityId: payPeriodId,
      after: { payroll_date: candidate.period.payrollDate, due_at_utc: formatUtcInstant(candidate.period.dueAtUtc), reason: 'auto_submit_off' },
    });
    return true;
  });
}

/**
 * One scan: finalizes or records, oldest deadline first, at most `batchSize` periods. It writes
 * nothing while the activation instant is null. Safe to run at any time and from several runners
 * at once: every action re-checks eligibility inside its own transaction.
 */
export function runDeadlineScan(db: Db, clock: Clock, options: ScanOptions = {}): ScanSummary {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) throw new Error('The batch size is a positive whole number');
  const summary: ScanSummary = { activated: false, examined: 0, finalized: 0, overdueRecorded: 0, skipped: 0, failed: 0, remaining: false };
  const { activeFrom } = getAutomationActivation(db);
  if (activeFrom === null) return summary;
  summary.activated = true;
  const candidates = listCandidates(db, clock, parseUtcInstant(activeFrom));
  summary.examined = candidates.length;
  let acted = 0;
  for (const candidate of candidates) {
    const verdict = assessPeriod(db, clock, candidate);
    if (verdict.kind === 'skip') {
      summary.skipped += 1;
      continue;
    }
    if (acted >= batchSize) {
      summary.remaining = true;
      break;
    }
    acted += 1;
    try {
      if (verdict.kind === 'overdue') {
        if (recordOverdue(db, clock, candidate)) summary.overdueRecorded += 1;
        else summary.skipped += 1;
        continue;
      }
      const result = finalizeAutomatically(
        { db, clock, owner: candidate.user },
        {
          payrollDate: candidate.period.payrollDate,
          authorize: () => {
            const current = assessPeriod(db, clock, candidate);
            return current.kind === 'finalize' ? null : current.kind === 'skip' ? current.reason : 'switch_off';
          },
        },
      );
      if (result.status === 'created') summary.finalized += 1;
      else summary.skipped += 1;
    } catch (error) {
      summary.failed += 1;
      recordFailure(db, clock, candidate, error);
    }
  }
  return summary;
}

/* --------------------------------------------------------- overdue notice ---- */

export interface OverdueRecord {
  payrollDate: string;
  dueAt: string;
  reason: 'auto_submit_off';
  recordedAt: string;
}

/** The owner's overdue records (periods governed by an off switch), oldest first. Owner-scoped. */
export function listOverdueRecords(db: Db, userId: string): OverdueRecord[] {
  const rows = db
    .prepare<[string, string], { occurred_at: string; after_json: string }>(
      "SELECT occurred_at, after_json FROM audit_events WHERE owner_user_id = ? AND operation = ? AND entity_type = 'pay_period' ORDER BY rowid",
    )
    .all(userId, OVERDUE_AUDIT_OPERATION);
  return rows.map((row) => {
    const after = JSON.parse(row.after_json) as { payroll_date: string; due_at_utc: string; reason: 'auto_submit_off' };
    return { payrollDate: after.payroll_date, dueAt: after.due_at_utc, reason: after.reason, recordedAt: row.occurred_at };
  });
}
