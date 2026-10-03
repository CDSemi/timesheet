import { randomUUID } from 'node:crypto';
import { type CalendarDateRule, type CalendarVersion, validateCalendarRules } from '../../domain/calendar.ts';
import { type CivilDate, diffDays } from '../../domain/dates.ts';
import {
  currentPayPeriod,
  type PayrollException,
  type PayrollScheduleRules,
  payPeriodAt,
  validatePayrollExceptions,
  validatePayrollSchedule,
} from '../../domain/periods.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import { localDateOf } from '../../domain/zones.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { countFinalizedTimesheets, findPayPeriodRow, refreshPayPeriodRow } from './periods.ts';

export interface CalendarRecord {
  id: string;
  name: string;
  schedule: PayrollScheduleRules;
}

interface CalendarRow {
  id: string;
  name: string;
  reporting_zone: string;
  payroll_anchor_date: string;
  cycle_days: number;
  period_start_offset_days: number;
  period_end_offset_days: number;
  due_offset_days: number;
  due_local_time: string;
}

export function getCalendar(db: Db, calendarId: string): CalendarRecord {
  const row = db.prepare('SELECT * FROM calendars WHERE id = ?').get(calendarId) as CalendarRow | undefined;
  if (row === undefined) throw new Error(`Calendar ${calendarId} is missing`);
  return {
    id: row.id,
    name: row.name,
    schedule: {
      reportingZone: row.reporting_zone,
      anchorPayrollDate: row.payroll_anchor_date,
      cycleDays: row.cycle_days,
      periodStartOffsetDays: row.period_start_offset_days,
      periodEndOffsetDays: row.period_end_offset_days,
      dueOffsetDays: row.due_offset_days,
      dueLocalTime: row.due_local_time,
    },
  };
}

export function listCalendarVersions(db: Db, calendarId: string): CalendarVersion[] {
  const rows = db
    .prepare('SELECT id, seq, effective_from, weekdays, dates FROM calendar_versions WHERE calendar_id = ? ORDER BY seq')
    .all(calendarId) as Array<{ id: string; seq: number; effective_from: string; weekdays: string; dates: string }>;
  return rows.map((row) => ({
    id: row.id,
    seq: row.seq,
    effectiveFrom: row.effective_from,
    weekdays: JSON.parse(row.weekdays) as number[],
    dates: JSON.parse(row.dates) as CalendarDateRule[],
  }));
}

export function listPayrollExceptions(db: Db, calendarId: string): PayrollException[] {
  const rows = db
    .prepare(
      `SELECT nominal_payroll_date, payroll_date, due_local_date, due_local_time
         FROM payroll_exceptions WHERE calendar_id = ? ORDER BY nominal_payroll_date`,
    )
    .all(calendarId) as Array<{
    nominal_payroll_date: string;
    payroll_date: string;
    due_local_date: string | null;
    due_local_time: string | null;
  }>;
  return rows.map((row) => ({
    nominalPayrollDate: row.nominal_payroll_date,
    payrollDate: row.payroll_date,
    dueLocalDate: row.due_local_date,
    dueLocalTime: row.due_local_time,
  }));
}

export function createCalendar(
  db: Db,
  clock: Clock,
  input: { name: string; schedule: PayrollScheduleRules },
  actorUserId: string | null,
): string {
  validatePayrollSchedule(input.schedule);
  const id = randomUUID();
  const s = input.schedule;
  db.transaction(() => {
    db.prepare(
      `INSERT INTO calendars (id, name, reporting_zone, payroll_anchor_date, cycle_days, period_start_offset_days,
         period_end_offset_days, due_offset_days, due_local_time, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.name,
      s.reportingZone,
      s.anchorPayrollDate,
      s.cycleDays,
      s.periodStartOffsetDays,
      s.periodEndOffsetDays,
      s.dueOffsetDays,
      s.dueLocalTime,
      nowUtc(clock),
    );
    recordAudit(db, clock, {
      actorUserId,
      ownerUserId: null,
      operation: 'calendar.create',
      entityType: 'calendar',
      entityId: id,
      after: { name: input.name, schedule: s },
    });
  }).immediate();
  return id;
}

/**
 * The earliest date a new effective-dated version may start: the first day of the
 * current pay period (R-07). Earlier dates would rewrite old periods retroactively.
 */
export function prospectiveBoundary(clock: Clock, schedule: PayrollScheduleRules, exceptions: PayrollException[]): CivilDate {
  const today = localDateOf(schedule.reportingZone, nowEpoch(clock));
  return currentPayPeriod(schedule, today, exceptions).periodStart;
}

export function assertProspective(effectiveFrom: CivilDate, boundary: CivilDate, isFirstVersion: boolean): void {
  if (!isFirstVersion && effectiveFrom < boundary) {
    throw new ApiError(
      422,
      'retroactive_change',
      `New versions must take effect on or after ${boundary}; retroactive corrections need an explicit documented procedure`,
      { earliest_effective_from: boundary },
    );
  }
}

/** Extra context for the single audit event of a version (an import records why and what). */
export interface CalendarVersionAudit {
  reason?: string | null;
  /** Stored under `import` in the event's after-state. */
  importSummary?: Record<string, unknown>;
}

/**
 * Appends an immutable calendar version (holidays/closures and weekdays) and one audit event.
 * It may run inside a caller's transaction, where it becomes a savepoint.
 */
export function createCalendarVersion(
  db: Db,
  clock: Clock,
  input: { calendarId: string; effectiveFrom: CivilDate; weekdays: number[]; dates: CalendarDateRule[]; note?: string },
  actorUserId: string | null,
  audit: CalendarVersionAudit = {},
): CalendarVersion {
  validateCalendarRules(input);
  return db
    .transaction(() => {
      const calendar = getCalendar(db, input.calendarId);
      const existing = listCalendarVersions(db, input.calendarId);
      const boundary = prospectiveBoundary(clock, calendar.schedule, listPayrollExceptions(db, input.calendarId));
      assertProspective(input.effectiveFrom, boundary, existing.length === 0);
      const version: CalendarVersion = {
        id: randomUUID(),
        seq: (existing.at(-1)?.seq ?? 0) + 1,
        effectiveFrom: input.effectiveFrom,
        weekdays: [...input.weekdays].sort((a, b) => a - b),
        dates: [...input.dates].sort((a, b) => (a.date < b.date ? -1 : 1)),
      };
      db.prepare(
        `INSERT INTO calendar_versions (id, calendar_id, seq, effective_from, weekdays, dates, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        version.id,
        input.calendarId,
        version.seq,
        version.effectiveFrom,
        JSON.stringify(version.weekdays),
        JSON.stringify(version.dates),
        input.note ?? null,
        actorUserId,
        nowUtc(clock),
      );
      recordAudit(db, clock, {
        actorUserId,
        ownerUserId: null,
        operation: 'calendar_version.create',
        entityType: 'calendar_version',
        entityId: version.id,
        reason: audit.reason ?? null,
        after: audit.importSummary === undefined ? version : { ...version, import: audit.importSummary },
      });
      return version;
    })
    .immediate();
}

/** True when a calendar row exists (administration addresses a calendar by id). */
export function calendarExists(db: Db, calendarId: string): boolean {
  return db.prepare('SELECT 1 FROM calendars WHERE id = ?').get(calendarId) !== undefined;
}

/** The version with the latest effective date (and sequence): the one every future day follows. */
export function latestCalendarVersion(versions: readonly CalendarVersion[]): CalendarVersion | undefined {
  return effectiveVersionOn(versions, '2999-12-31');
}

export interface CalendarWarning {
  code: 'next_year_calendar_missing';
  /** The year whose company calendar dates are missing. */
  year: number;
  /** First accounting date (in the reporting zone) from which the warning applies. */
  warn_from: CivilDate;
  message: string;
}

/**
 * E-12: from 1 October (reporting zone) warn when the calendar in force at the end of next
 * year holds no holiday or closure date in that year. The clock is injected, never read here.
 */
export function calendarWarnings(clock: Clock, schedule: PayrollScheduleRules, versions: readonly CalendarVersion[]): CalendarWarning[] {
  const today = localDateOf(schedule.reportingZone, nowEpoch(clock));
  const thisYear = Number(today.slice(0, 4));
  const warnFrom = `${thisYear}-10-01`;
  if (today < warnFrom) return [];
  const nextYear = thisYear + 1;
  const inForce = effectiveVersionOn(versions, `${nextYear}-12-31`);
  if (inForce?.dates.some((rule) => rule.date.startsWith(`${nextYear}-`)) === true) return [];
  return [
    {
      code: 'next_year_calendar_missing',
      year: nextYear,
      warn_from: warnFrom,
      message: `No company holiday or closure dates are set for ${nextYear}; import them before the first affected period.`,
    },
  ];
}

export interface PayrollExceptionInput {
  calendarId: string;
  nominalPayrollDate: CivilDate;
  payrollDate: CivilDate;
  dueLocalDate: CivilDate | null;
  dueLocalTime: string | null;
  reason: string;
}

export interface PayrollExceptionRecord {
  calendar_id: string;
  nominal_payroll_date: CivilDate;
  payroll_date: CivilDate;
  due_local_date: CivilDate | null;
  due_local_time: string | null;
  reason: string;
  created_at: string;
}

/**
 * Admin payroll exception (FR-13, E-10). The reason is required. In one transaction it records
 * the exception, refreshes the stored pay_periods row when one exists and no finalized
 * timesheet references it (otherwise 409 period_finalized and nothing changes), and writes one
 * audit event with the before/after of the row.
 */
export function createPayrollException(
  db: Db,
  clock: Clock,
  input: PayrollExceptionInput,
  actorUserId: string,
): { exception: PayrollExceptionRecord; refreshedPayPeriod: boolean } {
  const reason = input.reason.trim();
  if (reason === '') throw new ApiError(422, 'reason_required', 'A reason is required for a payroll exception');
  return db
    .transaction(() => {
      if (!calendarExists(db, input.calendarId)) throw notFound('Calendar');
      const calendar = getCalendar(db, input.calendarId);
      const existing = listPayrollExceptions(db, input.calendarId);
      if (existing.some((item) => item.nominalPayrollDate === input.nominalPayrollDate)) {
        throw new ApiError(409, 'payroll_exception_exists', `An exception for ${input.nominalPayrollDate} already exists`);
      }
      const candidate: PayrollException = {
        nominalPayrollDate: input.nominalPayrollDate,
        payrollDate: input.payrollDate,
        dueLocalDate: input.dueLocalDate,
        dueLocalTime: input.dueLocalTime,
      };
      const all = [...existing, candidate];
      validatePayrollExceptions(calendar.schedule, all);
      const index = diffDays(input.nominalPayrollDate, calendar.schedule.anchorPayrollDate) / calendar.schedule.cycleDays;
      const period = payPeriodAt(calendar.schedule, index, all);
      const stored = findPayPeriodRow(db, input.calendarId, index);
      if (stored !== undefined && countFinalizedTimesheets(db, stored.id) > 0) {
        throw new ApiError(
          409,
          'period_finalized',
          'A finalized timesheet references this pay period, so its payroll or due date cannot change',
          { period_start: stored.period_start, period_end: stored.period_end },
        );
      }
      const createdAt = nowUtc(clock);
      db.prepare(
        `INSERT INTO payroll_exceptions (calendar_id, nominal_payroll_date, payroll_date, due_local_date, due_local_time,
           reason, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        input.calendarId,
        input.nominalPayrollDate,
        input.payrollDate,
        input.dueLocalDate,
        input.dueLocalTime,
        reason,
        actorUserId,
        createdAt,
      );
      const refreshed = stored === undefined ? undefined : refreshPayPeriodRow(db, stored.id, period);
      const exception: PayrollExceptionRecord = {
        calendar_id: input.calendarId,
        nominal_payroll_date: input.nominalPayrollDate,
        payroll_date: input.payrollDate,
        due_local_date: input.dueLocalDate,
        due_local_time: input.dueLocalTime,
        reason,
        created_at: createdAt,
      };
      recordAudit(db, clock, {
        actorUserId,
        ownerUserId: null,
        operation: 'payroll_exception.create',
        entityType: 'payroll_exception',
        entityId: `${input.calendarId}:${input.nominalPayrollDate}`,
        reason,
        before: stored ?? null,
        after: { ...exception, refreshed_pay_period: refreshed !== undefined, pay_period: refreshed ?? null },
      });
      return { exception, refreshedPayPeriod: refreshed !== undefined };
    })
    .immediate();
}
