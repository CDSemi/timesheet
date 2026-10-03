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

export interface StoredPayPeriod {
  id: string;
  period_index: number;
  nominal_payroll_date: string;
  payroll_date: string;
  period_start: string;
  period_end: string;
  due_local_date: string;
  due_local_time: string;
  due_at_utc: string;
  is_exception: number;
}

const STORED_PERIOD_COLUMNS =
  'id, period_index, nominal_payroll_date, payroll_date, period_start, period_end, due_local_date, due_local_time, due_at_utc, is_exception';

export function findPayPeriodRow(db: Db, calendarId: string, periodIndex: number): StoredPayPeriod | undefined {
  return db
    .prepare(`SELECT ${STORED_PERIOD_COLUMNS} FROM pay_periods WHERE calendar_id = ? AND period_index = ?`)
    .get(calendarId, periodIndex) as StoredPayPeriod | undefined;
}

/** Finalized timesheets of any user that reference the stored pay-period row (WP3 sets the column). */
export function countFinalizedTimesheets(db: Db, payPeriodId: string): number {
  return db
    .prepare('SELECT count(*) FROM timesheets WHERE pay_period_id = ? AND finalized_revision_no IS NOT NULL')
    .pluck()
    .get(payPeriodId) as number;
}

/**
 * Rewrites the exception-dependent fields of a stored row from the engine's period (E-10).
 * The period start/end, index and nominal payroll date are nominal and never change, so the
 * timesheets bound to the row keep their days. Call it inside the transaction that records
 * the exception, and only after checking that no finalized timesheet references the row.
 */
export function refreshPayPeriodRow(db: Db, rowId: string, period: PayPeriod): StoredPayPeriod {
  db.prepare(
    `UPDATE pay_periods SET payroll_date = ?, due_local_date = ?, due_local_time = ?, due_at_utc = ?, is_exception = ?
      WHERE id = ?`,
  ).run(
    period.payrollDate,
    period.dueLocalDate,
    period.dueLocalTime,
    formatUtcInstant(period.dueAtUtc),
    period.isException ? 1 : 0,
    rowId,
  );
  return db.prepare(`SELECT ${STORED_PERIOD_COLUMNS} FROM pay_periods WHERE id = ?`).get(rowId) as StoredPayPeriod;
}
