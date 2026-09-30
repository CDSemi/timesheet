import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { UserRole } from './auth/sessions.ts';
import type { Clock } from './clock.ts';
import type { Db } from './db/database.ts';
import { createCalendar, createCalendarVersion } from './services/calendars.ts';
import { createPolicyVersion } from './services/policies.ts';
import { createUser, findUserByEmail } from './services/users.ts';

/*
 * Synthetic development/test data only: one company calendar from the example files
 * and two isolated example.invalid accounts. Never used for production bootstrap.
 */

const POLICY_EXAMPLE = new URL('../../examples/policy.example.json', import.meta.url);
const HOLIDAYS_EXAMPLE = new URL('../../examples/holidays.2026.example.json', import.meta.url);

interface PolicyExample {
  calendar: { reporting_zone: string; normal_weekdays_iso: number[] };
  policy: {
    effective_from: string;
    required_minutes: number;
    threshold_minutes: number;
    rounding_step_minutes: number;
    reference_start: string;
    reference_end: string;
    breaks: Array<{ start_offset_minutes: number; duration_minutes: number; counts_as_work: boolean }>;
    deficit_mode: 'ignore' | 'auto_deduct' | 'choose_at_signoff';
  };
  payroll: {
    anchor_payroll_date: string;
    cycle_days: number;
    period_start_offset_days: number;
    period_end_offset_days: number;
    due_offset_days: number;
    due_local_time: string;
  };
}

interface HolidaysExample {
  holidays: Array<{ date: string; name: string }>;
}

export const SEED_ACCOUNTS: ReadonlyArray<{ key: 'admin' | 'employee'; email: string; displayName: string; role: UserRole }> = [
  { key: 'admin', email: 'admin@example.invalid', displayName: 'Example Admin', role: 'admin' },
  { key: 'employee', email: 'employee@example.invalid', displayName: 'Example Employee', role: 'employee' },
];

export interface SeedOptions {
  passwords?: Partial<Record<'admin' | 'employee', string>>;
}

export interface SeedResult {
  created: boolean;
  calendarId: string | null;
  users: Array<{ id: string; email: string; role: UserRole; generatedPassword: string | null }>;
}

export async function seedSynthetic(db: Db, clock: Clock, options: SeedOptions = {}): Promise<SeedResult> {
  const existing = SEED_ACCOUNTS.map((account) => findUserByEmail(db, account.email));
  if (existing.some((user) => user !== undefined)) {
    return {
      created: false,
      calendarId: existing.find((user) => user !== undefined)?.calendar_id ?? null,
      users: existing.flatMap((user) =>
        user === undefined ? [] : [{ id: user.id, email: user.email, role: user.role, generatedPassword: null }],
      ),
    };
  }
  const example = JSON.parse(readFileSync(POLICY_EXAMPLE, 'utf8')) as PolicyExample;
  const holidays = JSON.parse(readFileSync(HOLIDAYS_EXAMPLE, 'utf8')) as HolidaysExample;
  const calendarId = createCalendar(
    db,
    clock,
    {
      name: 'Company calendar (synthetic)',
      schedule: {
        reportingZone: example.calendar.reporting_zone,
        anchorPayrollDate: example.payroll.anchor_payroll_date,
        cycleDays: example.payroll.cycle_days,
        periodStartOffsetDays: example.payroll.period_start_offset_days,
        periodEndOffsetDays: example.payroll.period_end_offset_days,
        dueOffsetDays: example.payroll.due_offset_days,
        dueLocalTime: example.payroll.due_local_time,
      },
    },
    null,
  );
  createCalendarVersion(
    db,
    clock,
    {
      calendarId,
      effectiveFrom: '2026-01-01',
      weekdays: example.calendar.normal_weekdays_iso,
      dates: holidays.holidays.map((holiday) => ({ date: holiday.date, kind: 'holiday' as const, name: holiday.name })),
      note: 'Synthetic seed from examples/holidays.2026.example.json',
    },
    null,
  );
  const users: SeedResult['users'] = [];
  for (const account of SEED_ACCOUNTS) {
    const supplied = options.passwords?.[account.key];
    const password = supplied ?? randomBytes(18).toString('base64url');
    const id = await createUser(
      db,
      clock,
      { email: account.email, displayName: account.displayName, role: account.role, password, calendarId },
      null,
    );
    const policy = example.policy;
    createPolicyVersion(
      db,
      clock,
      {
        userId: id,
        calendarId,
        effectiveFrom: policy.effective_from,
        note: 'Synthetic seed from examples/policy.example.json',
        rules: {
          requiredMinutes: policy.required_minutes,
          thresholdMinutes: policy.threshold_minutes,
          roundingStepMinutes: policy.rounding_step_minutes,
          referenceStart: policy.reference_start,
          referenceEnd: policy.reference_end,
          deficitMode: policy.deficit_mode,
          breaks: policy.breaks.map((item) => ({
            startOffsetMinutes: item.start_offset_minutes,
            durationMinutes: item.duration_minutes,
            countsAsWork: item.counts_as_work,
          })),
        },
      },
      id,
    );
    users.push({ id, email: account.email, role: account.role, generatedPassword: supplied === undefined ? password : null });
  }
  return { created: true, calendarId, users };
}
