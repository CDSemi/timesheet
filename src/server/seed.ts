import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { SessionUser, UserRole } from './auth/sessions.ts';
import type { Clock } from './clock.ts';
import type { Db } from './db/database.ts';
import type { FileStore } from './files/fileStore.ts';
import { createCalendar, createCalendarVersion } from './services/calendars.ts';
import { postCredit } from './services/ledger.ts';
import { reserveOtLeave } from './services/otLeave.ts';
import { createPolicyVersion } from './services/policies.ts';
import { saveSignature } from './services/signatures.ts';
import { saveSubmissionSettings } from './services/submissionSettings.ts';
import { createSession } from './services/timesheetCommands.ts';
import { createUser, findUserByEmail } from './services/users.ts';

/*
 * Synthetic development/test data only: one company calendar from the example files and
 * three isolated example.invalid accounts (one admin, two employees). Optional sample data
 * (CLI seed only) gives the second employee a few sessions, one recorded OT leave request
 * and one setup credit posted through the internal ledger service with an explicit
 * synthetic setup key and reason. No opening balance is inferred. When a file store is
 * given, the sample data also saves synthetic submission settings (recipients on
 * example.invalid, automatic submission off) and a generated synthetic signature image for
 * that employee. The sender address is configuration, not data: set MAIL_FROM to an
 * example.invalid address and keep OUTBOUND_MODE at its default (capture) so the first
 * attempts are captured, never sent. Never used for production bootstrap.
 */

const POLICY_EXAMPLE = new URL('../../reference/examples/policy.example.json', import.meta.url);
const HOLIDAYS_EXAMPLE = new URL('../../reference/examples/holidays.2026.example.json', import.meta.url);

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

export type SeedAccountKey = 'admin' | 'employee' | 'employee2';

export const SEED_ACCOUNTS: ReadonlyArray<{ key: SeedAccountKey; email: string; displayName: string; role: UserRole }> = [
  { key: 'admin', email: 'admin@example.invalid', displayName: 'Example Admin', role: 'admin' },
  { key: 'employee', email: 'employee@example.invalid', displayName: 'Example Employee', role: 'employee' },
  { key: 'employee2', email: 'employee2@example.invalid', displayName: 'Example Employee Two', role: 'employee' },
];

export interface SeedOptions {
  /** Passwords come from the environment; an account without one gets a random one-time password. */
  passwords?: Partial<Record<SeedAccountKey, string>>;
  /**
   * Development dataset (CLI seed): also create employee2@example.invalid with sample sessions, a
   * leave request and a setup credit. Off by default so the integration tests keep two accounts.
   */
  sampleData?: boolean;
  /** The private file store; with sample data, the sample employee also gets a synthetic signature image. */
  files?: FileStore;
}

export interface SeedResult {
  created: boolean;
  calendarId: string | null;
  users: Array<{ id: string; email: string; role: UserRole; generatedPassword: string | null }>;
  /** Present only when sample data was written. */
  sample?: { sessions: number; leaveRequests: number; creditMinutes: number; submissionSettings: boolean; signature: boolean };
}

/** Setup credit and leave sizes of the sample data, in minutes. */
const SAMPLE_CREDIT_MINUTES = 600;
const SAMPLE_LEAVE_MINUTES = 240;

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/**
 * A generated synthetic signature: a 160x48 PNG with one dark wave on white. No image file is
 * committed; `phase` makes each image a different file.
 */
export function syntheticSignaturePng(phase = 9): Buffer {
  const width = 160;
  const height = 48;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3, 0xff);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      if (Math.abs(y - (24 + Math.round(14 * Math.sin(x / phase)))) <= 1) row.fill(0x2a, 1 + x * 3, 4 + x * 3);
    }
    rows.push(row);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function civilDateIn(zone: string, instant: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isWeekday(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day >= 1 && day <= 5;
}

const SAMPLE_SHAPES: ReadonlyArray<{ start: string; end: string }> = [
  { start: '09:00', end: '17:30' },
  { start: '08:30', end: '19:00' },
  { start: '09:00', end: '17:30' },
];

/**
 * Sample data for one employee, all through the production services: up to three recent
 * weekday sessions (relative to the clock), one setup credit posted with an explicit
 * synthetic key and reason, and one OT leave request for a weekday about two weeks ahead.
 */
function seedSampleData(db: Db, clock: Clock, zone: string, employee: SessionUser, files: FileStore | undefined): NonNullable<SeedResult['sample']> {
  const now = clock.now();
  const today = civilDateIn(zone, now);
  const recent: string[] = [];
  for (let back = 1; back <= 14 && recent.length < SAMPLE_SHAPES.length; back += 1) {
    const date = civilDateIn(zone, new Date(now.getTime() - back * 86_400_000));
    if (isWeekday(date)) recent.push(date);
  }
  const at = (date: string, time: string) => ({ local: `${date}T${time}`, zone });
  recent.forEach((date, index) => {
    const shape = SAMPLE_SHAPES[index] ?? SAMPLE_SHAPES[0];
    if (shape === undefined) return;
    createSession({ db, clock, user: employee }, date, {
      start: at(date, shape.start),
      end: at(date, shape.end),
      input_zone: zone,
      breaks_confirmed: true,
      breaks: [{ start: at(date, '12:00'), end: at(date, '12:30'), counts_as_work: false }],
      reason: 'Synthetic seed sample session (development data only)',
    });
  });
  postCredit(
    { db, clock },
    {
      userId: employee.id,
      sourceKey: 'seed-setup-credit-employee2',
      actorUserId: null,
      origin: 'system',
      reason: 'Synthetic seed setup credit (development data only; not inferred from any timesheet)',
      workDate: recent[recent.length - 1] ?? today,
      minutes: SAMPLE_CREDIT_MINUTES,
    },
  );
  let leaveDate = today;
  for (let ahead = 14; ahead <= 20; ahead += 1) {
    leaveDate = civilDateIn(zone, new Date(now.getTime() + ahead * 86_400_000));
    if (isWeekday(leaveDate)) break;
  }
  reserveOtLeave(
    { db, clock },
    {
      userId: employee.id,
      actorUserId: employee.id,
      requestKey: 'seed-leave-employee2',
      leaveDate,
      requestedMinutes: SAMPLE_LEAVE_MINUTES,
      permission: {
        approverName: 'Example Manager',
        approvalDate: today,
        evidenceRef: 'Synthetic permission reference (seed only)',
      },
      note: 'Synthetic seed leave request',
    },
  );
  // Submission settings and a signature image, through the production services (needs the file store).
  if (files !== undefined) {
    saveSubmissionSettings(db, clock, employee.id, {
      expectedSeq: 0,
      to: ['payroll@example.invalid'],
      cc: ['manager@example.invalid'],
      autoSubmit: false,
    });
    saveSignature(db, clock, files, employee.id, syntheticSignaturePng(), 'image/png');
  }
  return {
    sessions: recent.length,
    leaveRequests: 1,
    creditMinutes: SAMPLE_CREDIT_MINUTES,
    submissionSettings: files !== undefined,
    signature: files !== undefined,
  };
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
      note: 'Synthetic seed from reference/examples/holidays.2026.example.json',
    },
    null,
  );
  const users: SeedResult['users'] = [];
  const sessionUsers = new Map<SeedAccountKey, SessionUser>();
  for (const account of SEED_ACCOUNTS) {
    if (account.key === 'employee2' && options.sampleData !== true) continue;
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
        note: 'Synthetic seed from reference/examples/policy.example.json',
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
    sessionUsers.set(account.key, {
      id,
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      calendarId,
      sessionId: 'seed',
    });
  }
  const sampleOwner = sessionUsers.get('employee2');
  if (options.sampleData === true && sampleOwner !== undefined) {
    return { created: true, calendarId, users, sample: seedSampleData(db, clock, example.calendar.reporting_zone, sampleOwner, options.files) };
  }
  return { created: true, calendarId, users };
}
