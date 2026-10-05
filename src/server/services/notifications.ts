import { createHash, randomUUID } from 'node:crypto';
import MailComposer from 'nodemailer/lib/mail-composer';
import { addDays, diffDays } from '../../domain/dates.ts';
import { type EpochSeconds, parseUtcInstant } from '../../domain/instants.ts';
import { type PayPeriod, payPeriodAt } from '../../domain/periods.ts';
import {
  beforeDueKey,
  normalizeReminderOffsets,
  OVERDUE_KEY,
  outcomeKey,
  planPreDeadline,
  REMINDER_KINDS,
  type ReminderKind,
  renderReminder,
  reviewLink,
} from '../../domain/reminders.ts';
import { localDateOf } from '../../domain/zones.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { enqueueJob, type Job, JobError } from '../jobs/jobStore.ts';
import { MESSAGE_ID_DOMAIN, type OutboundMessage } from '../mail/message.ts';
import { getAutomationActivation, OVERDUE_AUDIT_OPERATION } from './automation.ts';
import { getCalendar, listPayrollExceptions } from './calendars.ts';
import { ensurePayPeriodRow, findPayPeriodRow } from './periods.ts';
import { submissionSettingsOrDefault } from './submissionSettings.ts';

/*
 * Reminders and outcome notices (docs/05 "Reminders and review links", AC-09, WP3-T11).
 *
 * Three kinds of notice, all addressed to the employee's own account address and nobody else:
 * - before_due: 24 h and 2 h before the deadline by default (per-user offsets), until the period
 *   is finalized;
 * - overdue: the deadline passed while auto-submit was off (the deadline scan's overdue record),
 *   until the period is finalized;
 * - outcome_notice: after an automatic submission, saying that the period was submitted
 *   automatically and that review is pending (the owner's decision: the system tracks the
 *   automatic origin, and only outgoing payroll artefacts drop the indicator).
 *
 * `runReminderScan` is a pure database pass. For each notice that is due it writes, in one IMMEDIATE
 * transaction, the immutable `reminder_occurrences` decision (unique per user, period, kind and
 * occurrence key) together with the `send_reminder` job it enqueues, so a failure leaves neither
 * and a rerun can never queue a second notice. A notice missed during downtime is recorded as
 * `collapsed` into the one current notice. Nothing is decided while the system activation instant
 * is null or still in the future (F-4), for a deadline before it, for an imported period, for a
 * finalized period or for a deactivated account. Deadlines come from the production pay-period
 * functions in the saved reporting zone; offsets are elapsed time before them (R-07).
 *
 * The send job rebuilds the notice at send time from routing identifiers only (job payloads never
 * hold content) and re-checks that it is still relevant, so a period finalized between queueing and
 * sending sends nothing. Links are the login-required review deep link and nothing else.
 */

export const JOB_SEND_REMINDER = 'send_reminder';

/** Notices decided per scan call; the job loops a bounded number of times. */
export const DEFAULT_REMINDER_BATCH_SIZE = 50;

export interface ReminderScanSummary {
  /** False while the activation instant is null: nothing was read or written. */
  activated: boolean;
  enqueued: number;
  collapsed: number;
  suppressed: number;
  failed: number;
  /** True when the batch was full and more notices may be waiting. */
  remaining: boolean;
}

export interface ReminderScanOptions {
  batchSize?: number;
}

interface UserRow {
  id: string;
  calendar_id: string;
}

interface TimesheetState {
  finalized_revision_no: number | null;
  imported_unverified: number;
}

/** What a period's timesheet allows: finalized and imported periods get no notices. */
function timesheetState(db: Db, userId: string, calendarId: string, periodIndex: number): { finalized: boolean; imported: boolean } {
  const row = db
    .prepare<[string, string, number], TimesheetState>(
      `SELECT t.finalized_revision_no, t.imported_unverified
         FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE t.user_id = ? AND p.calendar_id = ? AND p.period_index = ?`,
    )
    .get(userId, calendarId, periodIndex);
  return { finalized: row !== undefined && row.finalized_revision_no !== null, imported: row !== undefined && row.imported_unverified === 1 };
}

function insertOccurrence(
  db: Db,
  clock: Clock,
  row: { userId: string; payPeriodId: string; kind: ReminderKind; key: string; disposition: 'enqueued' | 'collapsed' | 'suppressed'; jobId: string | null },
): void {
  db.prepare(
    `INSERT INTO reminder_occurrences (id, user_id, pay_period_id, kind, occurrence_key, disposition, job_id, decided_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), row.userId, row.payPeriodId, row.kind, row.key, row.disposition, row.jobId, nowUtc(clock));
}

/** The decision and its job in the caller's transaction; the job's business key repeats the occurrence key. */
function enqueueNotice(db: Db, clock: Clock, row: { userId: string; payPeriodId: string; kind: ReminderKind; key: string; revisionId?: string }): void {
  const { job } = enqueueJob(db, clock, {
    kind: JOB_SEND_REMINDER,
    businessKey: `reminder:${row.userId}:${row.payPeriodId}:${row.kind}:${row.key}`,
    userId: row.userId,
    revisionId: row.revisionId ?? null,
    payload: { pay_period_id: row.payPeriodId, kind: row.kind, occurrence_key: row.key },
  });
  insertOccurrence(db, clock, { ...row, disposition: 'enqueued', jobId: job.id });
}

function occurrenceExists(db: Db, userId: string, payPeriodId: string, kind: ReminderKind, key: string): boolean {
  return (
    db
      .prepare<[string, string, string, string], { one: number }>(
        'SELECT 1 AS one FROM reminder_occurrences WHERE user_id = ? AND pay_period_id = ? AND kind = ? AND occurrence_key = ?',
      )
      .get(userId, payPeriodId, kind, key) !== undefined
  );
}

/* ------------------------------------------------------------ candidates ---- */

interface CalendarCache {
  schedule: ReturnType<typeof getCalendar>['schedule'];
  exceptions: ReturnType<typeof listPayrollExceptions>;
}

/** Periods whose deadline lies in (now, now + horizon]; one period of slack covers zone and exception drift. */
function upcomingPeriods(calendar: CalendarCache, now: EpochSeconds, horizonSeconds: number): PayPeriod[] {
  const { schedule, exceptions } = calendar;
  const indexDueOn = (instant: EpochSeconds): number =>
    Math.floor(diffDays(addDays(localDateOf(schedule.reportingZone, instant), -schedule.dueOffsetDays), schedule.anchorPayrollDate) / schedule.cycleDays);
  const indices = new Set<number>();
  for (let index = indexDueOn(now) - 1; index <= indexDueOn(now + horizonSeconds) + 1; index += 1) indices.add(index);
  for (const exception of exceptions) indices.add(diffDays(exception.nominalPayrollDate, schedule.anchorPayrollDate) / schedule.cycleDays);
  return [...indices]
    .map((index) => payPeriodAt(schedule, index, exceptions))
    .filter((period) => period.dueAtUtc > now && period.dueAtUtc <= now + horizonSeconds)
    .sort((a, b) => a.dueAtUtc - b.dueAtUtc);
}

interface Acted {
  enqueued: number;
  collapsed: number;
  suppressed: number;
}

/** The pre-deadline decision of one period, re-evaluated inside its own transaction. */
function decideBeforeDue(db: Db, clock: Clock, user: UserRow, period: PayPeriod, offsets: readonly number[], activeFrom: EpochSeconds): Acted | null {
  return writeTransaction(db, (): Acted | null => {
    const state = timesheetState(db, user.id, user.calendar_id, period.index);
    if (state.finalized || state.imported) return null;
    const stored = findPayPeriodRow(db, user.calendar_id, period.index);
    const decided = new Set<string>(
      stored === undefined
        ? []
        : db
            .prepare<[string, string], { occurrence_key: string }>(
              "SELECT occurrence_key FROM reminder_occurrences WHERE user_id = ? AND pay_period_id = ? AND kind = 'before_due'",
            )
            .all(user.id, stored.id)
            .map((row) => row.occurrence_key),
    );
    const plan = planPreDeadline({ dueAtUtc: period.dueAtUtc, nowUtc: nowEpoch(clock), offsetsMinutes: offsets, activeFromUtc: activeFrom, decidedKeys: decided });
    if (plan.send === null && plan.collapsed.length === 0) return null;
    const payPeriodId = ensurePayPeriodRow(db, clock, user.calendar_id, period);
    for (const offset of plan.collapsed) {
      insertOccurrence(db, clock, { userId: user.id, payPeriodId, kind: 'before_due', key: beforeDueKey(offset), disposition: 'collapsed', jobId: null });
    }
    if (plan.send !== null) enqueueNotice(db, clock, { userId: user.id, payPeriodId, kind: 'before_due', key: beforeDueKey(plan.send) });
    return { enqueued: plan.send === null ? 0 : 1, collapsed: plan.collapsed.length, suppressed: 0 };
  });
}

interface OverdueRow {
  user_id: string;
  pay_period_id: string;
  calendar_id: string;
  period_index: number;
}

/** The overdue warning of one recorded period; a finalized or imported period is suppressed instead. */
function decideOverdue(db: Db, clock: Clock, row: OverdueRow): Acted | null {
  return writeTransaction(db, (): Acted | null => {
    if (occurrenceExists(db, row.user_id, row.pay_period_id, 'overdue', OVERDUE_KEY)) return null;
    const state = timesheetState(db, row.user_id, row.calendar_id, row.period_index);
    const base = { userId: row.user_id, payPeriodId: row.pay_period_id, kind: 'overdue' as const, key: OVERDUE_KEY };
    if (state.finalized || state.imported) {
      insertOccurrence(db, clock, { ...base, disposition: 'suppressed', jobId: null });
      return { enqueued: 0, collapsed: 0, suppressed: 1 };
    }
    enqueueNotice(db, clock, base);
    return { enqueued: 1, collapsed: 0, suppressed: 0 };
  });
}

interface OutcomeRow {
  revision_id: string;
  user_id: string;
  pay_period_id: string;
}

function reviewIsPending(db: Db, userId: string, revisionId: string): boolean {
  return (
    db
      .prepare<[string, string], { one: number }>(
        `SELECT 1 AS one FROM timesheet_revisions r
          WHERE r.id = ? AND r.user_id = ? AND r.origin = 'deadline'
            AND NOT EXISTS (SELECT 1 FROM timesheet_revisions s WHERE s.timesheet_id = r.timesheet_id AND s.review_state = 'signed')`,
      )
      .get(revisionId, userId) !== undefined
  );
}

/** The outcome notice of one automatic revision whose review is still pending. */
function decideOutcome(db: Db, clock: Clock, row: OutcomeRow): Acted | null {
  return writeTransaction(db, (): Acted | null => {
    const key = outcomeKey(row.revision_id);
    if (occurrenceExists(db, row.user_id, row.pay_period_id, 'outcome_notice', key)) return null;
    if (!reviewIsPending(db, row.user_id, row.revision_id)) return null;
    enqueueNotice(db, clock, { userId: row.user_id, payPeriodId: row.pay_period_id, kind: 'outcome_notice', key, revisionId: row.revision_id });
    return { enqueued: 1, collapsed: 0, suppressed: 0 };
  });
}

/* ------------------------------------------------------------------ scan ---- */

/**
 * One scan: decides and enqueues the notices that are due now. Safe at any time and from several
 * runners at once; every decision is re-checked inside its own transaction. One failing item never
 * blocks the others and is retried by the next scan.
 */
export function runReminderScan(db: Db, clock: Clock, options: ReminderScanOptions = {}): ReminderScanSummary {
  const batchSize = options.batchSize ?? DEFAULT_REMINDER_BATCH_SIZE;
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) throw new Error('The batch size is a positive whole number');
  const summary: ReminderScanSummary = { activated: false, enqueued: 0, collapsed: 0, suppressed: 0, failed: 0, remaining: false };
  const { activeFrom } = getAutomationActivation(db);
  if (activeFrom === null) return summary;
  summary.activated = true;
  const activeFromEpoch = parseUtcInstant(activeFrom);
  const now = nowEpoch(clock);
  if (now < activeFromEpoch) return summary;

  let acted = 0;
  const record = (work: () => Acted | null): boolean => {
    try {
      const result = work();
      if (result === null) return true;
      acted += 1;
      summary.enqueued += result.enqueued;
      summary.collapsed += result.collapsed;
      summary.suppressed += result.suppressed;
    } catch {
      acted += 1;
      summary.failed += 1;
    }
    if (acted >= batchSize) {
      summary.remaining = true;
      return false;
    }
    return true;
  };

  // 1. Notices before the deadline, per active account and upcoming period.
  const users = db.prepare<[], UserRow>("SELECT id, calendar_id FROM users WHERE status = 'active' ORDER BY id").all();
  const calendars = new Map<string, CalendarCache>();
  for (const user of users) {
    const offsets = normalizeReminderOffsets(submissionSettingsOrDefault(db, user.id).reminderOffsetsMinutes);
    const longest = offsets[0];
    if (longest === undefined) continue;
    let calendar = calendars.get(user.calendar_id);
    if (calendar === undefined) {
      calendar = { schedule: getCalendar(db, user.calendar_id).schedule, exceptions: listPayrollExceptions(db, user.calendar_id) };
      calendars.set(user.calendar_id, calendar);
    }
    for (const period of upcomingPeriods(calendar, now, longest * 60)) {
      if (!record(() => decideBeforeDue(db, clock, user, period, offsets, activeFromEpoch))) return summary;
    }
  }

  // 2. The overdue warning of each period the deadline scan recorded as overdue (auto-submit off).
  const overdue = db
    .prepare<[string, string, number], OverdueRow>(
      `SELECT a.owner_user_id AS user_id, a.entity_id AS pay_period_id, p.calendar_id AS calendar_id, p.period_index AS period_index
         FROM audit_events a
         JOIN users u ON u.id = a.owner_user_id AND u.status = 'active'
         JOIN pay_periods p ON p.id = a.entity_id AND p.calendar_id = u.calendar_id
        WHERE a.operation = ? AND a.entity_type = 'pay_period'
          AND NOT EXISTS (SELECT 1 FROM reminder_occurrences o
                           WHERE o.user_id = a.owner_user_id AND o.pay_period_id = a.entity_id AND o.kind = 'overdue' AND o.occurrence_key = ?)
        ORDER BY a.rowid LIMIT ?`,
    )
    .all(OVERDUE_AUDIT_OPERATION, OVERDUE_KEY, Math.max(1, batchSize - acted));
  for (const row of overdue) if (!record(() => decideOverdue(db, clock, row))) return summary;

  // 3. The outcome notice of each automatic revision whose review is still pending.
  const outcomes = db
    .prepare<[number], OutcomeRow>(
      `SELECT r.id AS revision_id, r.user_id AS user_id, t.pay_period_id AS pay_period_id
         FROM timesheet_revisions r
         JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
         JOIN users u ON u.id = r.user_id AND u.status = 'active'
        WHERE r.origin = 'deadline' AND t.imported_unverified = 0
          AND NOT EXISTS (SELECT 1 FROM timesheet_revisions s WHERE s.timesheet_id = r.timesheet_id AND s.review_state = 'signed')
          AND NOT EXISTS (SELECT 1 FROM reminder_occurrences o
                           WHERE o.user_id = r.user_id AND o.pay_period_id = t.pay_period_id AND o.kind = 'outcome_notice'
                             AND o.occurrence_key = 'revision-' || r.id)
        ORDER BY r.created_at, r.id LIMIT ?`,
    )
    .all(Math.max(1, batchSize - acted));
  for (const row of outcomes) if (!record(() => decideOutcome(db, clock, row))) return summary;
  return summary;
}

/* --------------------------------------------------------------- sending ---- */

export interface PreparedReminder {
  /** The employee's own account address: the only recipient. */
  to: string;
  subject: string;
  text: string;
}

interface SendUserRow {
  id: string;
  email: string;
  status: string;
  calendar_id: string;
}

interface SendPeriodRow {
  calendar_id: string;
  period_index: number;
  payroll_date: string;
  period_start: string;
  period_end: string;
  due_at_utc: string;
}

function payloadText(job: Job, field: string): string {
  const value = job.payload[field];
  if (typeof value !== 'string' || value === '') throw new JobError('invalid_job_payload', { permanent: true });
  return value;
}

/**
 * Rebuilds the notice of a `send_reminder` job at send time, or returns null when it is no longer
 * relevant (the period was finalized, the deadline passed, the review is no longer pending, the
 * account was deactivated or the automation was deactivated): then nothing is sent. Throws a
 * permanent job error for a job that does not match its recorded decision, its owner or its period.
 */
export function prepareReminder(db: Db, clock: Clock, job: Job, publicBaseUrl: string): PreparedReminder | null {
  const userId = job.userId;
  if (userId === null) throw new JobError('invalid_job_payload', { permanent: true });
  const payPeriodId = payloadText(job, 'pay_period_id');
  const kindText = payloadText(job, 'kind');
  const key = payloadText(job, 'occurrence_key');
  const kind = REMINDER_KINDS.find((candidate) => candidate === kindText);
  if (kind === undefined) throw new JobError('invalid_job_payload', { permanent: true });

  const occurrence = db
    .prepare<[string, string, string, string], { disposition: string; job_id: string | null }>(
      'SELECT disposition, job_id FROM reminder_occurrences WHERE user_id = ? AND pay_period_id = ? AND kind = ? AND occurrence_key = ?',
    )
    .get(userId, payPeriodId, kind, key);
  if (occurrence === undefined || occurrence.disposition !== 'enqueued' || occurrence.job_id !== job.id) {
    throw new JobError('occurrence_missing', { permanent: true });
  }
  const user = db.prepare<[string], SendUserRow>('SELECT id, email, status, calendar_id FROM users WHERE id = ?').get(userId);
  if (user === undefined) throw new JobError('occurrence_missing', { permanent: true });
  const period = db
    .prepare<[string, string], SendPeriodRow>(
      'SELECT calendar_id, period_index, payroll_date, period_start, period_end, due_at_utc FROM pay_periods WHERE id = ? AND calendar_id = ?',
    )
    .get(payPeriodId, user.calendar_id);
  if (period === undefined) throw new JobError('period_mismatch', { permanent: true });
  if (kind === 'outcome_notice' && (job.revisionId === null || key !== outcomeKey(job.revisionId))) {
    throw new JobError('invalid_job_payload', { permanent: true });
  }

  if (user.status !== 'active' || getAutomationActivation(db).activeFrom === null) return null;
  const state = timesheetState(db, user.id, period.calendar_id, period.period_index);
  if (state.finalized && kind !== 'outcome_notice') return null;
  if (state.imported) return null;
  const now = nowEpoch(clock);
  const due = parseUtcInstant(period.due_at_utc);
  if (kind === 'before_due' && now >= due) return null;
  if (kind === 'outcome_notice' && (job.revisionId === null || !reviewIsPending(db, user.id, job.revisionId))) return null;

  const rendered = renderReminder({
    kind,
    payrollDate: period.payroll_date,
    periodStart: period.period_start,
    periodEnd: period.period_end,
    dueAtUtc: due,
    zone: getCalendar(db, user.calendar_id).schedule.reportingZone,
    nowUtc: now,
    link: reviewLink(publicBaseUrl, period.payroll_date),
  });
  return { to: user.email, subject: rendered.subject, text: rendered.text };
}

// One address: a local part and a dotted domain, no spaces, brackets, commas or line breaks.
const SINGLE_ADDRESS = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/;
const EMPTY_SHA256 = createHash('sha256').update(new Uint8Array(0)).digest('hex');

/**
 * The plain-text message of a notice: one recipient (the employee), the sender from the
 * configuration, a Message-ID derived from the job (stable across retries) and no attachment. The
 * outbound adapters take the same message shape as for submissions; the empty `pdf` field is the
 * "no attachment" value.
 */
export async function buildReminderMessage(source: { senderAddress: string | null; jobId: string; date: Date; notice: PreparedReminder }): Promise<OutboundMessage> {
  const sender = source.senderAddress;
  if (sender === null || sender === '') throw new JobError('sender_missing', { permanent: true });
  if (!SINGLE_ADDRESS.test(sender)) throw new JobError('sender_invalid', { permanent: true });
  if (!SINGLE_ADDRESS.test(source.notice.to)) throw new JobError('recipient_invalid', { permanent: true });
  const messageId = `<${source.jobId}@${MESSAGE_ID_DOMAIN}>`;
  const composer = new MailComposer({
    from: sender,
    to: [source.notice.to],
    subject: source.notice.subject,
    messageId,
    date: source.date,
    text: source.notice.text,
    headers: { 'Auto-Submitted': 'auto-generated' },
    baseBoundary: createHash('sha256').update(messageId).digest('hex').slice(0, 24),
    xMailer: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    newline: '\r\n',
  });
  const raw = await composer.compile().build();
  return { messageId, envelope: { from: sender, to: [source.notice.to] }, raw, pdf: new Uint8Array(0), pdfSha256: EMPTY_SHA256 };
}
