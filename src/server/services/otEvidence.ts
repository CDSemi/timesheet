import { type CivilDate, datesBetween } from '../../domain/dates.ts';
import { payPeriodsOverlapping } from '../../domain/periods.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { listLedgerEntries } from './ledger.ts';
import { listOtLeaveRequests } from './otLeave.ts';
import { policyJson } from './policies.ts';
import {
  getTimesheetView,
  loadScope,
  loadSessions,
  periodForDate,
  type StoredSession,
  type UserScope,
} from './timesheets.ts';

/*
 * Read-only OT evidence for one owner: the provisional-credit summary (E-6) and the
 * evidence export (docs/05:56). Every query is scoped by the session user's id; nothing
 * here writes, posts or accepts a user id. Day arithmetic is the single production
 * engine (the timesheet view that calls computeWorkDay), never re-implemented here.
 */

type TimesheetView = ReturnType<typeof getTimesheetView>;

export interface ProvisionalPeriod {
  payroll_date: string;
  period_start: CivilDate;
  period_end: CivilDate;
  /** Credited minutes of complete days in this unfinalized period. */
  credited_minutes: number;
  complete_days: number;
  /** Days with sessions that are incomplete (open or unconfirmed breaks) and credit nothing yet. */
  pending_days: number;
}

export interface ProvisionalSummary {
  minutes: number;
  periods: ProvisionalPeriod[];
}

function periodViews(db: Db, clock: Clock, user: SessionUser, scope: UserScope, from: CivilDate, to: CivilDate): TimesheetView[] {
  const { schedule } = scope.calendar;
  return payPeriodsOverlapping(schedule, from, to, scope.exceptions).map((period) =>
    getTimesheetView(db, clock, user, period.payrollDate),
  );
}

/**
 * E-6: provisional = credited minutes of complete days in unfinalized periods, shown per
 * period. Provisional minutes are never part of the posted, reserved or available balance.
 */
export function provisionalSummary(db: Db, clock: Clock, user: SessionUser): ProvisionalSummary {
  const scope = loadScope(db, user);
  const workDates = db
    .prepare('SELECT DISTINCT work_date FROM work_sessions WHERE user_id = ? ORDER BY work_date')
    .pluck()
    .all(user.id) as CivilDate[];
  const payrollDates = new Map<number, string>();
  for (const workDate of workDates) {
    const period = periodForDate(scope, workDate);
    payrollDates.set(period.index, period.payrollDate);
  }
  const periods: ProvisionalPeriod[] = [];
  for (const payrollDate of payrollDates.values()) {
    const view = getTimesheetView(db, clock, user, payrollDate);
    if (view.timesheet.finalized) continue;
    periods.push({
      payroll_date: view.period.payroll_date,
      period_start: view.period.period_start,
      period_end: view.period.period_end,
      credited_minutes: view.totals.provisional_credited_minutes,
      complete_days: view.days.filter((day) => day.calculation?.status === 'complete').length,
      pending_days: view.totals.pending_days,
    });
  }
  periods.sort((a, b) => a.period_start.localeCompare(b.period_start));
  return { minutes: periods.reduce((sum, period) => sum + period.credited_minutes, 0), periods };
}

/* ---------------------------------------------------------------- CSV ---- */

export type CsvValue = string | number | boolean | null | undefined;

/** Cells that a spreadsheet may read as a formula: = + - @, a tab, a CR (and LF). */
const FORMULA_TRIGGER = /^[=+\-@\t\r\n]/;

/** Text starting with a formula trigger is prefixed with an apostrophe so it stays text. */
export function neutralizeCsvText(text: string): string {
  return FORMULA_TRIGGER.test(text) ? `'${text}` : text;
}

/**
 * One RFC 4180 cell. All text is neutralized first, then quoted when needed. Numbers and
 * booleans produced by this server are literal (a signed integer is not a formula);
 * free text never is.
 */
export function csvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const text = neutralizeCsvText(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(values: readonly CsvValue[]): string {
  return values.map(csvCell).join(',');
}

function safeFilenamePart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_').replace(/\.{2,}/g, '_').slice(0, 40);
}

/** A download name from a fixed alphabet; user input never reaches the header unescaped. */
export function evidenceFilename(from: string, to: string): string {
  return `ot-evidence_${safeFilenamePart(from)}_${safeFilenamePart(to)}.csv`;
}

interface CsvSection {
  name: string;
  header: readonly string[];
  rows: ReadonlyArray<readonly CsvValue[]>;
}

function renderSections(sections: readonly CsvSection[]): string {
  const blocks = sections.map((section) =>
    [csvRow(['#section', section.name]), csvRow(section.header), ...section.rows.map(csvRow)].join('\n'),
  );
  // One blank line between sections and a single final newline.
  return `${blocks.join('\n\n')}\n`;
}

function breakRows(sessions: readonly StoredSession[]): CsvValue[][] {
  return sessions.flatMap((session) =>
    session.breaks.map((item) => [
      session.work_date,
      session.id,
      item.id,
      item.start_utc,
      item.end_utc,
      item.counts_as_work === 1,
    ]),
  );
}

/**
 * The separate OT evidence export (never attached to payroll email automatically): raw
 * intervals and breaks, the policy versions in force, daily raw/eligible/credited
 * minutes, ledger adjustments and the recorded leave permission, for the owner's range.
 */
export function buildEvidenceCsv(db: Db, clock: Clock, user: SessionUser, from: CivilDate, to: CivilDate): string {
  const scope = loadScope(db, user);
  const sessions = loadSessions(db, user.id, from, to);

  const baseline = effectiveVersionOn(scope.policies, from);
  const policies = scope.policies.filter(
    (policy) => policy.id === baseline?.id || (policy.effectiveFrom > from && policy.effectiveFrom <= to),
  );

  const dailyRows: CsvValue[][] = [];
  for (const view of periodViews(db, clock, user, scope, from, to)) {
    for (const day of view.days) {
      if (day.work_date < from || day.work_date > to) continue;
      const calculation = day.calculation;
      dailyRows.push([
        day.work_date,
        day.classification?.day_class ?? null,
        day.classification?.reason ?? null,
        day.classification?.calendar_version_id ?? null,
        day.category,
        day.entry?.leave_minutes ?? 0,
        day.entry?.wfh ?? false,
        calculation?.status ?? day.calculation_error,
        calculation?.policy_version_id ?? null,
        calculation?.gross_seconds ?? null,
        calculation?.excluded_break_seconds ?? null,
        calculation?.regular_minutes ?? null,
        calculation?.nonworking_minutes ?? null,
        calculation?.normal_excess_minutes ?? null,
        calculation?.eligible_minutes ?? null,
        calculation?.credited_minutes ?? null,
        view.period.payroll_date,
        view.timesheet.finalized,
      ]);
    }
  }

  const ledgerRows = listLedgerEntries(db, user.id)
    .filter((entry) => entry.workDate === null || (entry.workDate >= from && entry.workDate <= to))
    .map((entry) => [
      entry.id,
      entry.entryType,
      entry.deltaMinutes,
      entry.workDate,
      entry.postedAt,
      entry.sourceKey,
      entry.sourceRef,
      entry.correctsEntryId,
      entry.leaveRequestId,
      entry.origin,
      entry.reason,
      entry.reconciliationRequired,
    ]);

  const leaveRows = listOtLeaveRequests(db, user.id)
    .filter((request) => request.leaveDate >= from && request.leaveDate <= to)
    .map((request) => [
      request.id,
      request.leaveDate,
      request.requestedMinutes,
      request.approvedMinutes,
      request.reservedMinutes,
      request.consumedMinutes,
      request.releasedMinutes,
      request.reversedMinutes,
      request.approverName,
      request.approverIdentity,
      request.approvalDate,
      request.evidenceRef,
      request.approvalOrigin,
      request.note,
      request.createdAt,
    ]);

  return renderSections([
    {
      name: 'export',
      header: ['from', 'to', 'reporting_zone', 'generated_at_utc', 'days'],
      rows: [[from, to, scope.calendar.schedule.reportingZone, nowUtc(clock), datesBetween(from, to).length]],
    },
    {
      name: 'policy_versions',
      header: [
        'id',
        'seq',
        'effective_from',
        'required_minutes',
        'threshold_minutes',
        'rounding_step_minutes',
        'reference_start',
        'reference_end',
        'deficit_mode',
        'breaks',
        'note',
        'created_at',
      ],
      rows: policies.map((policy) => {
        const json = policyJson(policy);
        return [
          json.id,
          json.seq,
          json.effective_from,
          json.required_minutes,
          json.threshold_minutes,
          json.rounding_step_minutes,
          json.reference_start,
          json.reference_end,
          json.deficit_mode,
          JSON.stringify(json.breaks),
          json.note,
          json.created_at,
        ];
      }),
    },
    {
      name: 'intervals',
      header: ['work_date', 'session_id', 'source', 'input_zone', 'start_utc', 'end_utc', 'breaks_confirmed', 'version'],
      rows: sessions.map((session) => [
        session.work_date,
        session.id,
        session.source,
        session.input_zone,
        session.start_utc,
        session.end_utc,
        session.breaks_confirmed === 1,
        session.version,
      ]),
    },
    {
      name: 'breaks',
      header: ['work_date', 'session_id', 'break_id', 'start_utc', 'end_utc', 'counts_as_work'],
      rows: breakRows(sessions),
    },
    {
      name: 'daily',
      header: [
        'work_date',
        'day_class',
        'day_class_reason',
        'calendar_version_id',
        'category',
        'leave_minutes',
        'wfh',
        'calculation_status',
        'policy_version_id',
        'gross_seconds',
        'excluded_break_seconds',
        'regular_minutes',
        'nonworking_minutes',
        'normal_excess_minutes',
        'eligible_minutes',
        'credited_minutes',
        'period_payroll_date',
        'period_finalized',
      ],
      rows: dailyRows,
    },
    {
      name: 'ledger',
      header: [
        'id',
        'entry_type',
        'delta_minutes',
        'work_date',
        'posted_at',
        'source_key',
        'source_ref',
        'corrects_entry_id',
        'leave_request_id',
        'origin',
        'reason',
        'reconciliation_required',
      ],
      rows: ledgerRows,
    },
    {
      name: 'leave_permissions',
      header: [
        'id',
        'leave_date',
        'requested_minutes',
        'approved_minutes',
        'reserved_minutes',
        'consumed_minutes',
        'released_minutes',
        'reversed_minutes',
        'approver_name',
        'approver_identity',
        'approval_date',
        'evidence_ref',
        'approval_origin',
        'note',
        'created_at',
      ],
      rows: leaveRows,
    },
  ]);
}
