import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { type CalendarDateRule, validateCalendarRules } from '../../domain/calendar.ts';
import { type PayrollScheduleRules, validatePayrollSchedule } from '../../domain/periods.ts';
import { validateWorkPolicyRules, type WorkPolicyRules } from '../../domain/policy.ts';
import { formatUtcInstant } from '../../domain/instants.ts';
import { hashPassword, isAcceptablePassword } from '../auth/passwords.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { createCalendar, createCalendarVersion } from './calendars.ts';
import { createPolicyVersion } from './policies.ts';
import { normalizeEmail } from './users.ts';

/*
 * Production bootstrap (WP4-T03, docs/07 "Initial deployment"). Two steps, both owner-driven:
 *
 *  1. The operator runs `cli.js bootstrap --config <file>`. The file holds the company calendar, the holidays, the
 *     default work policy and the payroll schedule (the shape of reference/examples, no person). It is validated in
 *     full and applied in one transaction, once. A single-use setup token is then issued: only its SHA-256 is
 *     stored, it expires after 60 minutes, and the CLI prints it once to the operator's terminal.
 *  2. The first administrator opens the Setup screen and posts the token with an email, a name and a password.
 *     The token is consumed in the same transaction that creates the administrator (who also receives the default
 *     policy), so a replay finds nothing to use. From then on the bootstrap is refused for good: any
 *     administrator row, active or not, closes it, and the schema refuses to store a token after that.
 *
 * Every refusal of the HTTP step is one and the same 403, so an expired, replayed, wrong or closed token cannot be
 * told apart. The token is never logged, never put in an audit payload and never returned. The setup is a system
 * event: its audit rows have no actor (RBC-01).
 */

export const SETUP_TOKEN_TTL_SECONDS = 3600;
const TOKEN_BYTES = 25;
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const MAX_DISPLAY_NAME_LENGTH = 120;

/** A refusal of the operator-side steps (CLI); its message is safe to print. */
export class BootstrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootstrapError';
  }
}

/* ---- The owner file ----------------------------------------------------------- */

const dateText = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const clockText = z.string().regex(/^\d{2}:\d{2}$/);
const wholeNumber = z.number().int();

const configSchema = z.strictObject({
  schema_version: z.literal(1),
  calendar: z.strictObject({
    name: z.string().trim().min(1).max(120).optional(),
    reporting_zone: z.string().min(1).max(64),
    normal_weekdays_iso: z.array(z.number().int().min(1).max(7)).min(1).max(7),
    effective_from: dateText.optional(),
  }),
  holidays: z
    .array(z.object({ date: dateText, name: z.string().trim().min(1).max(120), kind: z.enum(['holiday', 'closure']).optional() }))
    .max(400),
  // The example policy file carries descriptive constants beside the rules; they are accepted and ignored.
  policy: z.object({
    effective_from: dateText,
    required_minutes: wholeNumber,
    threshold_minutes: wholeNumber,
    rounding_step_minutes: wholeNumber,
    reference_start: clockText,
    reference_end: clockText,
    breaks: z
      .array(z.strictObject({ start_offset_minutes: wholeNumber, duration_minutes: wholeNumber, counts_as_work: z.boolean() }))
      .max(20),
    deficit_mode: z.enum(['ignore', 'auto_deduct', 'choose_at_signoff']),
  }),
  payroll: z.strictObject({
    anchor_payroll_date: dateText,
    cycle_days: wholeNumber,
    period_start_offset_days: wholeNumber,
    period_end_offset_days: wholeNumber,
    due_offset_days: wholeNumber,
    due_local_time: clockText,
  }),
});

/** The default work policy as stored (and as printed in the audit event); never contains a person. */
export interface StoredDefaultPolicy {
  effective_from: string;
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  reference_start: string;
  reference_end: string;
  breaks: Array<{ start_offset_minutes: number; duration_minutes: number; counts_as_work: boolean }>;
  deficit_mode: WorkPolicyRules['deficitMode'];
}

export interface BootstrapConfig {
  calendar: { name: string; schedule: PayrollScheduleRules; weekdays: number[]; effectiveFrom: string };
  holidays: CalendarDateRule[];
  policy: StoredDefaultPolicy;
}

function rulesOf(policy: StoredDefaultPolicy): WorkPolicyRules {
  return {
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
  };
}

/**
 * Validates the owner file in full (shape, then the same calendar, payroll and policy rules the services apply)
 * before anything is written. A refusal names the failing field and rule and may quote a date or a policy number from
 * the file (for example an invalid holiday date or a minutes mismatch); it never quotes a name, the zone or a secret.
 */
export function parseBootstrapConfig(input: unknown): BootstrapConfig {
  const parsed = configSchema.safeParse(input);
  if (!parsed.success) {
    const where = parsed.error.issues.map((issue) => `${issue.path.join('.') || '(file)'}: ${issue.code}`).join('; ');
    throw new BootstrapError(`The configuration file is invalid (${where})`);
  }
  const file = parsed.data;
  const policy: StoredDefaultPolicy = {
    effective_from: file.policy.effective_from,
    required_minutes: file.policy.required_minutes,
    threshold_minutes: file.policy.threshold_minutes,
    rounding_step_minutes: file.policy.rounding_step_minutes,
    reference_start: file.policy.reference_start,
    reference_end: file.policy.reference_end,
    breaks: file.policy.breaks.map((item) => ({ ...item })),
    deficit_mode: file.policy.deficit_mode,
  };
  const config: BootstrapConfig = {
    calendar: {
      name: file.calendar.name ?? 'Company calendar',
      schedule: {
        reportingZone: file.calendar.reporting_zone,
        anchorPayrollDate: file.payroll.anchor_payroll_date,
        cycleDays: file.payroll.cycle_days,
        periodStartOffsetDays: file.payroll.period_start_offset_days,
        periodEndOffsetDays: file.payroll.period_end_offset_days,
        dueOffsetDays: file.payroll.due_offset_days,
        dueLocalTime: file.payroll.due_local_time,
      },
      weekdays: file.calendar.normal_weekdays_iso,
      effectiveFrom: file.calendar.effective_from ?? file.policy.effective_from,
    },
    holidays: file.holidays.map((holiday) => ({ date: holiday.date, kind: holiday.kind ?? 'holiday', name: holiday.name })),
    policy,
  };
  try {
    validatePayrollSchedule(config.calendar.schedule);
    validateCalendarRules({ effectiveFrom: config.calendar.effectiveFrom, weekdays: config.calendar.weekdays, dates: config.holidays });
    validateWorkPolicyRules(rulesOf(policy));
  } catch (error) {
    throw new BootstrapError(`The configuration file is invalid (${error instanceof Error ? error.message : 'rule check failed'})`);
  }
  return config;
}

/* ---- State ---------------------------------------------------------------------- */

interface StateRow {
  calendar_id: string;
  default_policy: string;
  token_hash: string | null;
  token_expires_at: string | null;
  token_used_at: string | null;
}

const readState = (db: Db): StateRow | undefined =>
  db
    .prepare('SELECT calendar_id, default_policy, token_hash, token_expires_at, token_used_at FROM bootstrap_state WHERE id = 1')
    .get() as StateRow | undefined;

/** True while any administrator exists, active or deactivated: the setup never comes back after the first one. */
const administratorExists = (db: Db): boolean => db.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").get() !== undefined;

/** True when the instance was configured by the CLI and has no administrator yet: the Setup screen is on offer. */
export function setupAvailable(db: Db): boolean {
  return readState(db) !== undefined && !administratorExists(db);
}

/* ---- Step 1: the CLI -------------------------------------------------------------- */

export interface BootstrapResult {
  calendarId: string;
  holidays: number;
}

/**
 * Creates the company calendar (with its holiday version) and records the default policy, once. A database that
 * was bootstrapped before, or already holds a user, is refused. Everything is one transaction: a refusal anywhere
 * (including a rule the services check) leaves no row behind.
 */
export function applyBootstrapConfig(db: Db, clock: Clock, config: BootstrapConfig): BootstrapResult {
  return db
    .transaction(() => {
      if (readState(db) !== undefined || db.prepare('SELECT 1 FROM users LIMIT 1').get() !== undefined) {
        throw new BootstrapError('This database is already bootstrapped; the company calendar is created only once');
      }
      const calendarId = createCalendar(db, clock, { name: config.calendar.name, schedule: config.calendar.schedule }, null);
      createCalendarVersion(
        db,
        clock,
        {
          calendarId,
          effectiveFrom: config.calendar.effectiveFrom,
          weekdays: config.calendar.weekdays,
          dates: config.holidays,
          note: 'Production bootstrap from the operator configuration file',
        },
        null,
      );
      db.prepare('INSERT INTO bootstrap_state (id, calendar_id, default_policy, configured_at) VALUES (1, ?, ?, ?)').run(
        calendarId,
        JSON.stringify(config.policy),
        nowUtc(clock),
      );
      recordAudit(db, clock, {
        actorUserId: null,
        ownerUserId: null,
        operation: 'bootstrap.configure',
        entityType: 'calendar',
        entityId: calendarId,
        after: { calendar_id: calendarId, holidays: config.holidays.length, default_policy: config.policy },
      });
      return { calendarId, holidays: config.holidays.length };
    })
    .immediate();
}

/** `AAAAA-BBBBB-…`: 200 random bits in base32, grouped for hand entry (the alphabet has no 0, 1, 8 or 9). */
function newToken(): string {
  const bytes = randomBytes(TOKEN_BYTES);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  return out.match(/.{5}/g)?.join('-') ?? out;
}

/** What a person types is compared, not how: case, dashes and spaces do not matter. */
function normalizeToken(token: string): string {
  return token.replace(/[\s-]/g, '').toUpperCase();
}

const hashToken = (token: string): string => createHash('sha256').update(normalizeToken(token)).digest('hex');

export interface IssuedSetupToken {
  /** Shown to the operator once; never stored. */
  token: string;
  expiresAt: string;
}

/**
 * Issues the single-use setup token, replacing any earlier one. Only for a configured instance that has no
 * administrator. The audit event names the expiry and nothing else: not the token, not its hash.
 */
export function issueSetupToken(db: Db, clock: Clock): IssuedSetupToken {
  return db
    .transaction(() => {
      if (readState(db) === undefined) throw new BootstrapError('This database is not bootstrapped; run bootstrap --config first');
      if (administratorExists(db)) throw new BootstrapError('An administrator already exists; the setup is closed');
      const token = newToken();
      const issuedAt = nowEpoch(clock);
      const expiresAt = formatUtcInstant(issuedAt + SETUP_TOKEN_TTL_SECONDS);
      db.prepare(
        'UPDATE bootstrap_state SET token_hash = ?, token_issued_at = ?, token_expires_at = ?, token_used_at = NULL WHERE id = 1',
      ).run(hashToken(token), nowUtc(clock), expiresAt);
      recordAudit(db, clock, {
        actorUserId: null,
        ownerUserId: null,
        operation: 'bootstrap.token_issued',
        entityType: 'bootstrap',
        entityId: null,
        after: { expires_at: expiresAt },
      });
      return { token, expiresAt };
    })
    .immediate();
}

/* ---- Step 2: the first administrator ----------------------------------------------- */

const DUMMY_HASH = Buffer.alloc(32);
const refused = (): ApiError => new ApiError(403, 'setup_unavailable', 'Setup is not available');

/** Throws the one refusal unless an unexpired, unused token that matches exists and no administrator does. */
function assertSetupToken(db: Db, clock: Clock, token: string): StateRow {
  const state = readState(db);
  const stored = state?.token_hash ?? null;
  // The comparison always runs, so a missing token costs the same as a wrong one.
  const match = timingSafeEqual(stored === null ? DUMMY_HASH : Buffer.from(stored, 'hex'), Buffer.from(hashToken(token), 'hex'));
  if (
    state === undefined ||
    stored === null ||
    !match ||
    state.token_used_at !== null ||
    state.token_expires_at === null ||
    state.token_expires_at <= nowUtc(clock) ||
    administratorExists(db)
  ) {
    throw refused();
  }
  return state;
}

export interface SetupInput {
  token: string;
  email: string;
  displayName: string;
  password: string;
}

export interface SetupResult {
  id: string;
  email: string;
  displayName: string;
  role: 'admin';
}

/**
 * Creates the first administrator from a valid setup token. The token is checked, the input validated (the
 * password policy of every account), the password hashed, and then token consumption, the administrator, the
 * default policy and the audit event are one transaction that re-checks the token first, so two concurrent
 * requests with the same token create one administrator at most.
 */
export async function completeSetup(db: Db, clock: Clock, input: SetupInput): Promise<SetupResult> {
  assertSetupToken(db, clock, input.token);
  const email = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new ApiError(422, 'invalid_email', 'Invalid email');
  const displayName = input.displayName.trim();
  if (displayName === '' || displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ApiError(422, 'invalid_display_name', `A display name of 1–${MAX_DISPLAY_NAME_LENGTH} characters is required`);
  }
  if (!isAcceptablePassword(input.password)) throw new ApiError(422, 'weak_password', 'Passwords must be 12–256 characters');
  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  return db
    .transaction(() => {
      const state = assertSetupToken(db, clock, input.token);
      const now = nowUtc(clock);
      db.prepare(
        `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', 'active', ?, ?, ?, ?)`,
      ).run(id, email, displayName, passwordHash, state.calendar_id, now, now);
      const policy = JSON.parse(state.default_policy) as StoredDefaultPolicy;
      createPolicyVersion(
        db,
        clock,
        {
          userId: id,
          calendarId: state.calendar_id,
          effectiveFrom: policy.effective_from,
          rules: rulesOf(policy),
          note: 'Default policy from the production bootstrap',
        },
        id,
      );
      db.prepare('UPDATE bootstrap_state SET token_hash = NULL, token_used_at = ?, admin_user_id = ? WHERE id = 1').run(now, id);
      recordAudit(db, clock, {
        actorUserId: null,
        ownerUserId: id,
        operation: 'bootstrap.admin_created',
        entityType: 'user',
        entityId: id,
        after: { email, display_name: displayName, role: 'admin', calendar_id: state.calendar_id },
      });
      return { id, email, displayName, role: 'admin' as const };
    })
    .immediate();
}
