import { type DayCategory, defaultCategory, isAttendanceExpected } from '../../domain/attendance.ts';
import { type CalendarVersion, classifyDate, type DateClassification } from '../../domain/calendar.ts';
import { assertCivilDate, type CivilDate, datesBetween } from '../../domain/dates.ts';
import { computeDeficitMinutes } from '../../domain/deficit.ts';
import { editReasonRequirement, type EditReasonRequirement } from '../../domain/editReason.ts';
import { isDomainError } from '../../domain/errors.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import type { SessionInterval } from '../../domain/intervals.ts';
import {
  type PayPeriod,
  type PayrollException,
  payPeriodContaining,
  payPeriodForPayrollDate,
} from '../../domain/periods.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import { computeWorkDay, type WorkDayResult } from '../../domain/workday.ts';
import { localDateOf } from '../../domain/zones.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowEpoch } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { type CalendarRecord, getCalendar, listCalendarVersions, listPayrollExceptions } from './calendars.ts';
import { periodJson } from './periods.ts';
import { listPolicyVersions, type PolicyVersion } from './policies.ts';

/*
 * Read side of a user's timesheet. Every query is scoped by the authenticated user's
 * id; a record owned by someone else is simply not found. All calculations go through
 * the pure domain engine (computeWorkDay) with the policy effective on the work date
 * and the calendar versions effective on each segment date.
 */

export interface UserScope {
  userId: string;
  calendar: CalendarRecord;
  calendarVersions: CalendarVersion[];
  exceptions: PayrollException[];
  policies: PolicyVersion[];
}

export function loadScope(db: Db, user: Pick<SessionUser, 'id' | 'calendarId'>): UserScope {
  return {
    userId: user.id,
    calendar: getCalendar(db, user.calendarId),
    calendarVersions: listCalendarVersions(db, user.calendarId),
    exceptions: listPayrollExceptions(db, user.calendarId),
    policies: listPolicyVersions(db, user.id),
  };
}

export interface BreakRow {
  id: string;
  session_id: string;
  start_utc: string;
  end_utc: string;
  counts_as_work: number;
}

export interface SessionRow {
  id: string;
  user_id: string;
  work_date: string;
  start_utc: string;
  end_utc: string | null;
  input_zone: string;
  source: 'manual' | 'clock';
  breaks_confirmed: number;
  version: number;
}

export interface StoredSession extends SessionRow {
  breaks: BreakRow[];
}

export interface DayEntryRow {
  id: string;
  user_id: string;
  timesheet_id: string;
  work_date: string;
  category: DayCategory;
  leave_minutes: number;
  wfh: number;
  notes: string;
  version: number;
}

export interface TimesheetRow {
  id: string;
  user_id: string;
  pay_period_id: string;
  version: number;
  finalized_revision_no: number | null;
}

function attachBreaks(db: Db, userId: string, sessions: SessionRow[]): StoredSession[] {
  if (sessions.length === 0) return [];
  const placeholders = sessions.map(() => '?').join(',');
  const breaks = db
    .prepare(
      `SELECT id, session_id, start_utc, end_utc, counts_as_work FROM session_breaks
        WHERE user_id = ? AND session_id IN (${placeholders}) ORDER BY start_utc`,
    )
    .all(userId, ...sessions.map((session) => session.id)) as BreakRow[];
  return sessions.map((session) => ({ ...session, breaks: breaks.filter((item) => item.session_id === session.id) }));
}

const SESSION_COLUMNS = 'id, user_id, work_date, start_utc, end_utc, input_zone, source, breaks_confirmed, version';

export function loadSessions(db: Db, userId: string, from: CivilDate, to: CivilDate): StoredSession[] {
  const rows = db
    .prepare(
      `SELECT ${SESSION_COLUMNS} FROM work_sessions
        WHERE user_id = ? AND work_date BETWEEN ? AND ? ORDER BY start_utc`,
    )
    .all(userId, from, to) as SessionRow[];
  return attachBreaks(db, userId, rows);
}

export function findSession(db: Db, userId: string, sessionId: string): StoredSession | undefined {
  const row = db
    .prepare(`SELECT ${SESSION_COLUMNS} FROM work_sessions WHERE id = ? AND user_id = ?`)
    .get(sessionId, userId) as SessionRow | undefined;
  return row === undefined ? undefined : attachBreaks(db, userId, [row])[0];
}

export function findOpenSession(db: Db, userId: string): StoredSession | undefined {
  const row = db
    .prepare(
      `SELECT ${SESSION_COLUMNS} FROM work_sessions WHERE user_id = ? AND end_utc IS NULL ORDER BY start_utc DESC LIMIT 1`,
    )
    .get(userId) as SessionRow | undefined;
  return row === undefined ? undefined : attachBreaks(db, userId, [row])[0];
}

export function findDayEntry(db: Db, userId: string, workDate: CivilDate): DayEntryRow | undefined {
  return db.prepare('SELECT * FROM day_entries WHERE user_id = ? AND work_date = ?').get(userId, workDate) as
    | DayEntryRow
    | undefined;
}

function loadDayEntries(db: Db, userId: string, from: CivilDate, to: CivilDate): DayEntryRow[] {
  return db
    .prepare('SELECT * FROM day_entries WHERE user_id = ? AND work_date BETWEEN ? AND ?')
    .all(userId, from, to) as DayEntryRow[];
}

export function findTimesheet(db: Db, scope: UserScope, period: PayPeriod): TimesheetRow | undefined {
  return db
    .prepare(
      `SELECT t.id, t.user_id, t.pay_period_id, t.version, t.finalized_revision_no
         FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE t.user_id = ? AND p.calendar_id = ? AND p.period_index = ?`,
    )
    .get(scope.userId, scope.calendar.id, period.index) as TimesheetRow | undefined;
}

export function todayInReportingZone(clock: Clock, scope: UserScope): CivilDate {
  return localDateOf(scope.calendar.schedule.reportingZone, nowEpoch(clock));
}

export function periodForDate(scope: UserScope, workDate: CivilDate): PayPeriod {
  return payPeriodContaining(scope.calendar.schedule, workDate, scope.exceptions);
}

export function editRequirementFor(
  clock: Clock,
  scope: UserScope,
  period: PayPeriod,
  timesheet: TimesheetRow | undefined,
): EditReasonRequirement {
  return editReasonRequirement({
    schedule: scope.calendar.schedule,
    exceptions: scope.exceptions,
    todayLocal: todayInReportingZone(clock, scope),
    targetPeriodIndex: period.index,
    finalized: timesheet?.finalized_revision_no !== null && timesheet?.finalized_revision_no !== undefined,
  });
}

export function toSessionInterval(session: StoredSession): SessionInterval {
  return {
    startUtc: parseUtcInstant(session.start_utc),
    endUtc: session.end_utc === null ? null : parseUtcInstant(session.end_utc),
    breaksConfirmed: session.breaks_confirmed === 1,
    breaks: session.breaks.map((item) => ({
      startUtc: parseUtcInstant(item.start_utc),
      endUtc: parseUtcInstant(item.end_utc),
      countsAsWork: item.counts_as_work === 1,
      confirmed: true,
    })),
  };
}

export function sessionJson(session: StoredSession) {
  return {
    id: session.id,
    work_date: session.work_date,
    start_utc: session.start_utc,
    end_utc: session.end_utc,
    input_zone: session.input_zone,
    source: session.source,
    breaks_confirmed: session.breaks_confirmed === 1,
    version: session.version,
    breaks: session.breaks.map((item) => ({
      id: item.id,
      start_utc: item.start_utc,
      end_utc: item.end_utc,
      counts_as_work: item.counts_as_work === 1,
    })),
  };
}

export function dayEntryJson(entry: DayEntryRow) {
  return {
    id: entry.id,
    work_date: entry.work_date,
    category: entry.category,
    leave_minutes: entry.leave_minutes,
    wfh: entry.wfh === 1,
    notes: entry.notes,
    version: entry.version,
  };
}

export function calculationJson(result: WorkDayResult) {
  return {
    status: result.status,
    provisional: true,
    policy_version_id: result.policyVersionId,
    gross_seconds: result.grossSeconds,
    excluded_break_seconds: result.excludedBreakSeconds,
    regular_seconds: result.regularSeconds,
    nonworking_seconds: result.nonworkingSeconds,
    regular_minutes: result.regularMinutes,
    nonworking_minutes: result.nonworkingMinutes,
    normal_excess_minutes: result.normalExcessMinutes,
    eligible_minutes: result.eligibleMinutes,
    credited_minutes: result.creditedMinutes,
    segments: result.segments.map((segment) => ({
      local_date: segment.localDate,
      day_class: segment.dayClass,
      reason: segment.reason,
      calendar_version_id: segment.calendarVersionId,
      seconds: segment.seconds,
    })),
  };
}

function classificationJson(classification: DateClassification) {
  return {
    day_class: classification.dayClass,
    reason: classification.reason,
    name: classification.name ?? null,
    calendar_version_id: classification.calendarVersionId,
  };
}

function buildDayView(
  scope: UserScope,
  workDate: CivilDate,
  sessions: StoredSession[],
  entry: DayEntryRow | undefined,
  requirement: EditReasonRequirement,
) {
  let classification: DateClassification | null = null;
  let result: WorkDayResult | null = null;
  let calculationError: string | null = null;
  try {
    classification = classifyDate(scope.calendarVersions, workDate);
    const policy = effectiveVersionOn(scope.policies, workDate);
    if (policy === undefined) {
      calculationError = 'policy_missing';
    } else {
      result = computeWorkDay({
        workDate,
        reportingZone: scope.calendar.schedule.reportingZone,
        policy: {
          id: policy.id,
          requiredMinutes: policy.requiredMinutes,
          thresholdMinutes: policy.thresholdMinutes,
          roundingStepMinutes: policy.roundingStepMinutes,
        },
        calendarVersions: scope.calendarVersions,
        sessions: sessions.map(toSessionInterval),
      });
    }
  } catch (error) {
    if (!isDomainError(error)) throw error;
    calculationError = error.code;
  }
  const fallbackCategory = classification === null ? null : defaultCategory(classification);
  const category = entry?.category ?? fallbackCategory;
  const attendanceExpected = classification !== null && category !== null && isAttendanceExpected(classification, category);
  const policy = effectiveVersionOn(scope.policies, workDate);
  const deficitMinutes =
    classification === null || policy === undefined || result === null
      ? null
      : computeDeficitMinutes({
          requiredMinutes: policy.requiredMinutes,
          regularMinutes: result.regularMinutes,
          nonworkingMinutes: result.nonworkingMinutes,
          leaveMinutes: entry?.leave_minutes ?? 0,
          normalWorkDate: classification.dayClass === 'normal',
          attendanceExpected,
          recordsComplete: result.status === 'complete',
        });
  return {
    work_date: workDate,
    classification: classification === null ? null : classificationJson(classification),
    default_category: fallbackCategory,
    category,
    attendance_expected: attendanceExpected,
    entry: entry === undefined ? null : dayEntryJson(entry),
    sessions: sessions.map(sessionJson),
    calculation: result === null ? null : calculationJson(result),
    calculation_error: calculationError,
    deficit_minutes: deficitMinutes,
    edit: { period_relation: requirement.relation, reason_required: requirement.reasonRequired },
  };
}

export type DayView = ReturnType<typeof buildDayView>;

export function getDayView(db: Db, clock: Clock, user: SessionUser, workDateInput: string): DayView {
  const workDate = assertCivilDate(workDateInput, 'work_date');
  const scope = loadScope(db, user);
  const period = periodForDate(scope, workDate);
  const requirement = editRequirementFor(clock, scope, period, findTimesheet(db, scope, period));
  return buildDayView(
    scope,
    workDate,
    loadSessions(db, user.id, workDate, workDate),
    findDayEntry(db, user.id, workDate),
    requirement,
  );
}

export function getTimesheetView(db: Db, clock: Clock, user: SessionUser, payrollDate: string) {
  const scope = loadScope(db, user);
  const period = payPeriodForPayrollDate(scope.calendar.schedule, assertCivilDate(payrollDate, 'payroll_date'), scope.exceptions);
  const timesheet = findTimesheet(db, scope, period);
  const requirement = editRequirementFor(clock, scope, period, timesheet);
  const sessions = loadSessions(db, user.id, period.periodStart, period.periodEnd);
  const entries = loadDayEntries(db, user.id, period.periodStart, period.periodEnd);
  const days = datesBetween(period.periodStart, period.periodEnd).map((date) =>
    buildDayView(
      scope,
      date,
      sessions.filter((session) => session.work_date === date),
      entries.find((entry) => entry.work_date === date),
      requirement,
    ),
  );
  const completeDays = days.filter((day) => day.calculation?.status === 'complete');
  return {
    reporting_zone: scope.calendar.schedule.reportingZone,
    period: { ...periodJson(period), relation: requirement.relation },
    current_payroll_date: requirement.currentPayrollDate,
    timesheet: {
      id: timesheet?.id ?? null,
      version: timesheet?.version ?? 0,
      finalized: timesheet?.finalized_revision_no !== null && timesheet?.finalized_revision_no !== undefined,
    },
    reason_required: requirement.reasonRequired,
    days,
    totals: {
      provisional_credited_minutes: completeDays.reduce((sum, day) => sum + (day.calculation?.credited_minutes ?? 0), 0),
      pending_days: days.filter((day) => day.calculation !== null && ['incomplete', 'incomplete_breaks'].includes(day.calculation.status)).length,
    },
  };
}
