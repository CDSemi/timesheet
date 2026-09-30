import { randomUUID } from 'node:crypto';
import { type CalendarDateRule, type CalendarVersion, validateCalendarRules } from '../../domain/calendar.ts';
import type { CivilDate } from '../../domain/dates.ts';
import {
  currentPayPeriod,
  type PayrollException,
  type PayrollScheduleRules,
  validatePayrollSchedule,
} from '../../domain/periods.ts';
import { localDateOf } from '../../domain/zones.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
import { recordAudit } from './audit.ts';

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

/** Appends an immutable calendar version (holidays/closures and weekdays). */
export function createCalendarVersion(
  db: Db,
  clock: Clock,
  input: { calendarId: string; effectiveFrom: CivilDate; weekdays: number[]; dates: CalendarDateRule[]; note?: string },
  actorUserId: string | null,
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
        after: version,
      });
      return version;
    })
    .immediate();
}
