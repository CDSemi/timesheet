import { randomUUID } from 'node:crypto';
import { formatUtcInstant } from '../../domain/instants.ts';
import type { PayPeriod } from '../../domain/periods.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';

export function periodJson(period: PayPeriod) {
  return {
    payroll_date: period.payrollDate,
    nominal_payroll_date: period.nominalPayrollDate,
    period_start: period.periodStart,
    period_end: period.periodEnd,
    due_local_date: period.dueLocalDate,
    due_local_time: period.dueLocalTime,
    due_at_utc: formatUtcInstant(period.dueAtUtc),
    is_exception: period.isException,
  };
}

/** Materializes the shared pay-period row on first use and returns its id. */
export function ensurePayPeriodRow(db: Db, clock: Clock, calendarId: string, period: PayPeriod): string {
  const existing = db
    .prepare('SELECT id FROM pay_periods WHERE calendar_id = ? AND period_index = ?')
    .get(calendarId, period.index) as { id: string } | undefined;
  if (existing !== undefined) return existing.id;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO pay_periods (id, calendar_id, period_index, nominal_payroll_date, payroll_date, period_start, period_end,
       due_local_date, due_local_time, due_at_utc, is_exception, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    calendarId,
    period.index,
    period.nominalPayrollDate,
    period.payrollDate,
    period.periodStart,
    period.periodEnd,
    period.dueLocalDate,
    period.dueLocalTime,
    formatUtcInstant(period.dueAtUtc),
    period.isException ? 1 : 0,
    nowUtc(clock),
  );
  return id;
}
