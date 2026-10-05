import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { type PayPeriod, payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { enqueueJob, getJob } from '../../src/server/jobs/jobStore.ts';
import { createReminderScanHandler, createSendReminderHandler, JOB_REMINDER_SCAN, JOB_SEND_REMINDER } from '../../src/server/jobs/reminderJob.ts';
import { createJobHandlers, type JobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import type { OutboundAdapter, SendOutcome } from '../../src/server/mail/outbound.ts';
import { runDeadlineScan, setAutomationActivation } from '../../src/server/services/automation.ts';
import { createPayrollException, getCalendar, listPayrollExceptions } from '../../src/server/services/calendars.ts';
import { reviseTimesheet, signOffTimesheet } from '../../src/server/services/finalization.ts';
import { runReminderScan } from '../../src/server/services/notifications.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { saveSubmissionSettings } from '../../src/server/services/submissionSettings.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { makePng } from '../support/pdfText.ts';
import { dateTimeIn, instantOfWallTime } from '../client/zoneOracle.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T11: reminders and outcome notices (docs/05 "Reminders and review links", AC-09, the owner's
 * F-1 / F-4 decisions and the F-1 outcome decision: the employee's own notice says the review is
 * pending). Everything is synthetic (example.invalid, capture mode). The synthetic calendar has the
 * payroll dates 2026-10-02, -16, -30 ... (every 14 days) with the due rule "payroll - 3 days at
 * 17:00 America/Los_Angeles". Deadlines are always taken from the production pay-period functions or
 * from the independent zone oracle, never from a fixed UTC offset, so the tests hold in any season.
 */

const EARLY = '2026-09-20T12:00:00Z';
const TO = ['payroll@example.invalid'];
const SENDER = 'timesheet@example.invalid';
const BASE = 'https://timesheet.example.invalid/app';
const H = 3600;

const P1 = '2026-10-02'; // due 2026-09-30 17:00 local
const P2 = '2026-10-16';
const P3 = '2026-10-30';

let t: TestContext;
let dataDir: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext(EARLY);
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  t.db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)').run('deactivated', t.userIds.admin, t.userIds.employee);
});

afterEach(() => t.close());

const count = (sql: string, ...params: string[]): number => Number(t.db.prepare(sql).pluck().get(...params));
const at = (instant: number): string => formatUtcInstant(instant);

function newUser(): SessionUser {
  const id = randomUUID();
  t.db
    .prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, 'Synthetic Employee', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
    )
    .run(id, `user-${id}@example.invalid`, t.calendarId, EARLY, EARLY);
  createPolicyVersion(
    t.db,
    t.clock,
    {
      userId: id,
      calendarId: t.calendarId,
      effectiveFrom: '2026-01-01',
      note: 'Synthetic reminder policy',
      rules: { requiredMinutes: 480, thresholdMinutes: 30, roundingStepMinutes: 30, referenceStart: '08:00', referenceEnd: '16:00', deficitMode: 'ignore', breaks: [] },
    },
    id,
  );
  return { id, email: `user-${id}@example.invalid`, displayName: 'Synthetic Employee', role: 'employee', calendarId: t.calendarId, sessionId: 'test' };
}

function work(user: SessionUser, date: string, from: string, to: string): void {
  createSession({ db: t.db, clock: t.clock, user }, date, { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true });
}

function activate(instant: string | null): void {
  setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: instant, reason: 'Synthetic pilot activation' });
}

function saveSettings(user: SessionUser, options: { autoSubmit?: boolean; offsets?: number[]; expectedSeq?: number } = {}) {
  return saveSubmissionSettings(t.db, t.clock, user.id, {
    expectedSeq: options.expectedSeq ?? 0,
    to: TO,
    autoSubmit: options.autoSubmit ?? true,
    ...(options.offsets === undefined ? {} : { reminderOffsetsMinutes: options.offsets }),
  });
}

function schedule() {
  return getCalendar(t.db, t.calendarId).schedule;
}

function periodOf(payroll: string): PayPeriod {
  return payPeriodForPayrollDate(schedule(), payroll, listPayrollExceptions(t.db, t.calendarId));
}

const dueOf = (payroll: string): number => periodOf(payroll).dueAtUtc;

function deliveryConfig(env: Record<string, string> = {}) {
  return loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER, PUBLIC_BASE_URL: BASE, ...env }, { databasePath: t.config.databasePath, port: 3000, production: false });
}

function handlers(env: Record<string, string> = {}): JobHandlers {
  return createJobHandlers({ db: t.db, clock: t.clock, files, delivery: deliveryConfig(env) });
}

/** The production reminder handlers only, so a pass never runs the deadline scan or the submission jobs. */
function reminderHandlers(): JobHandlers {
  const all = handlers();
  const pick = (kind: string) => {
    const handler = all[kind];
    if (handler === undefined) throw new Error(`Handler ${kind} is not registered`);
    return handler;
  };
  return { [JOB_REMINDER_SCAN]: pick(JOB_REMINDER_SCAN), [JOB_SEND_REMINDER]: pick(JOB_SEND_REMINDER) };
}

/** One production runner pass at the current clock; the default is the reminder jobs alone. */
async function pass(custom: JobHandlers = reminderHandlers()) {
  return runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers: custom });
}

function setClock(instant: number): void {
  t.clock.set(at(instant));
}

interface ReminderJobRow {
  id: string;
  user_id: string;
  revision_id: string | null;
  state: string;
  attempts: number;
  last_error: string | null;
  payload_json: string;
}

function reminderJobs(user?: SessionUser): ReminderJobRow[] {
  const rows = t.db.prepare("SELECT id, user_id, revision_id, state, attempts, last_error, payload_json FROM jobs WHERE kind = 'send_reminder' ORDER BY created_at, id").all() as ReminderJobRow[];
  return user === undefined ? rows : rows.filter((row) => row.user_id === user.id);
}

interface Occurrence {
  kind: string;
  occurrence_key: string;
  disposition: string;
  job_id: string | null;
  decided_at: string;
}

function occurrences(user: SessionUser): Occurrence[] {
  return t.db.prepare('SELECT kind, occurrence_key, disposition, job_id, decided_at FROM reminder_occurrences WHERE user_id = ? ORDER BY decided_at, occurrence_key').all(user.id) as Occurrence[];
}

interface Captured {
  jobId: string;
  userId: string;
  subject: string;
  to: string;
  headers: string;
  text: string;
  raw: string;
  envelopeTo: string[];
  envelopeFrom: string;
}

function decodeBody(headers: string, body: string): string {
  const encoding = /^content-transfer-encoding:\s*(\S+)/im.exec(headers)?.[1]?.toLowerCase();
  if (encoding === 'quoted-printable') {
    return body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)));
  }
  if (encoding === 'base64') return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
  return body;
}

/** The captured reminder messages (nothing leaves the host; capture folders are keyed by job id). */
function captured(user?: SessionUser): Captured[] {
  const result: Captured[] = [];
  for (const job of reminderJobs(user)) {
    const folder = captureFolder(dataDir, job.id);
    if (!existsSync(join(folder, 'message.eml'))) continue;
    const raw = readFileSync(join(folder, 'message.eml'), 'utf8');
    const metadata = JSON.parse(readFileSync(join(folder, 'metadata.json'), 'utf8')) as { envelope: { from: string; to: string[] } };
    const split = raw.indexOf('\r\n\r\n');
    const headers = raw.slice(0, split).replace(/\r\n[ \t]+/g, ' ');
    const header = (name: string) => new RegExp(`^${name}:\\s*(.*)$`, 'im').exec(headers)?.[1] ?? '';
    result.push({
      jobId: job.id,
      userId: job.user_id,
      subject: header('subject'),
      to: header('to'),
      headers,
      text: decodeBody(headers, raw.slice(split + 4)),
      raw,
      envelopeTo: metadata.envelope.to,
      envelopeFrom: metadata.envelope.from,
    });
  }
  return result;
}

const link = (payroll: string): string => `${BASE}/#/review/${payroll}`;

describe('registration and activation (F-4)', () => {
  it('registers the scan and send handlers and queues no scan while the activation instant is null', async () => {
    const handler = handlers();
    expect(Object.keys(handler)).toEqual(expect.arrayContaining([JOB_REMINDER_SCAN, JOB_SEND_REMINDER]));
    newUser();
    setClock(dueOf(P1) - 3 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ activated: false, enqueued: 0 });
    await pass(handler);
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'reminder_scan'")).toBe(0);
    expect(count('SELECT count(*) FROM reminder_occurrences')).toBe(0);
    expect(reminderJobs()).toEqual([]);
  });

  it('queues at most one scan job per five-minute bucket once activated', async () => {
    newUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-22T12:00:30Z');
    await pass();
    t.clock.set('2026-09-22T12:03:10Z');
    await pass();
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'reminder_scan'")).toBe(1);
    t.clock.set('2026-09-22T12:05:00Z');
    await pass();
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'reminder_scan'")).toBe(2);
    expect(count("SELECT count(*) FROM jobs WHERE kind = 'reminder_scan' AND state = 'succeeded'")).toBe(2);
  });

  it('sends the reminder through the registered runner jobs end to end', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    await pass(handlers()); // the full production registry: PDF, send, deadline scan and reminders
    const [message, ...rest] = captured(user);
    expect(rest).toEqual([]);
    expect(message?.subject).toMatch(/due in about 24 hours/i);
    expect(reminderJobs(user).map((job) => job.state)).toEqual(['succeeded']);
  });
});

// A deadline on the Sunday of a DST change puts the change between the 24 h reminder and the deadline.
const DST_CASES = [
  { label: 'clocks go back (autumn)', payroll: P3, dueDate: '2026-11-01', dueTime: '12:00' },
  { label: 'clocks go forward (spring)', payroll: '2027-03-05', dueDate: '2027-03-14', dueTime: '12:00' },
];

describe('24 h and 2 h reminders in a week with a DST change (production zone functions)', () => {
  for (const item of DST_CASES) {
    it(`fires at exactly 24 h and 2 h of elapsed time before the deadline: ${item.label}`, async () => {
      const user = newUser();
      createPayrollException(
        t.db,
        t.clock,
        { calendarId: t.calendarId, nominalPayrollDate: item.payroll, payrollDate: item.payroll, dueLocalDate: item.dueDate, dueLocalTime: item.dueTime, reason: 'Synthetic deadline shift' },
        t.userIds.admin,
      );
      activate('2026-09-21T00:00:00Z');
      const due = dueOf(item.payroll);
      // The production deadline equals the independent oracle's instant for the saved local time.
      expect(at(due)).toBe(instantOfWallTime(item.dueDate, item.dueTime, LA).replace('.000Z', 'Z'));

      setClock(due - 24 * H - 1);
      expect(runReminderScan(t.db, t.clock)).toMatchObject({ activated: true, enqueued: 0, collapsed: 0 });
      setClock(due - 24 * H);
      expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 1, collapsed: 0 });
      await pass();
      setClock(due - 2 * H - 1);
      expect(runReminderScan(t.db, t.clock).enqueued).toBe(0);
      setClock(due - 2 * H);
      await pass();

      const rows = occurrences(user);
      expect(rows.map((row) => [row.kind, row.disposition, row.decided_at])).toEqual([
        ['before_due', 'enqueued', at(due - 24 * H)],
        ['before_due', 'enqueued', at(due - 2 * H)],
      ]);
      // Elapsed 24 h: the wall clock of the first reminder is one hour off the deadline's across the change.
      expect(dateTimeIn(at(due - 24 * H), LA).slice(11)).not.toBe(item.dueTime);
      const messages = captured(user);
      expect(messages.map((message) => message.subject.match(/about (\d+) hours?/)?.[1])).toEqual(['24', '2']);
      for (const message of messages) {
        expect(message.text).toContain(`${item.dueDate} ${item.dueTime} (${LA}, UTC`);
        expect(message.text).toContain(link(item.payroll));
      }
    });
  }
});

describe('dedupe by user, period and occurrence', () => {
  it('records one decision per occurrence and a rerun sends nothing new', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P1);
    setClock(due - 24 * H);
    const first = runReminderScan(t.db, t.clock);
    expect(first).toMatchObject({ enqueued: 1, failed: 0 });
    for (let index = 0; index < 3; index += 1) {
      expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0, collapsed: 0, failed: 0 });
    }
    await pass();
    for (const minutes of [10, 20, 30, 600]) {
      setClock(due - 24 * H + minutes * 60);
      await pass();
    }
    expect(reminderJobs(user)).toHaveLength(1);
    expect(captured(user)).toHaveLength(1);
    expect(occurrences(user)).toHaveLength(1);
    // The duplicate business key never creates a second job either.
    const key = t.db.prepare("SELECT business_key FROM jobs WHERE kind = 'send_reminder'").pluck().get() as string;
    expect(enqueueJob(t.db, t.clock, { kind: 'send_reminder', businessKey: key, userId: user.id }).created).toBe(false);
  });

  it('dedupes per user: two employees each get their own single reminder', async () => {
    const one = newUser();
    const two = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    await pass();
    await pass();
    expect(captured(one)).toHaveLength(1);
    expect(captured(two)).toHaveLength(1);
    expect(captured(one)[0]?.to).toContain(one.email);
    expect(captured(two)[0]?.to).toContain(two.email);
    expect(captured(one)[0]?.raw).not.toContain(two.email);
    expect(captured(two)[0]?.raw).not.toContain(one.email);
  });

  it('rolls back the job when the occurrence cannot be recorded, so nothing half-queued remains', () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    t.db.exec("CREATE TRIGGER synthetic_occurrence_failure BEFORE INSERT ON reminder_occurrences BEGIN SELECT RAISE(ABORT, 'synthetic_failure'); END;");
    const failed = runReminderScan(t.db, t.clock);
    expect(failed).toMatchObject({ enqueued: 0, failed: 1 });
    expect(reminderJobs(user)).toEqual([]);
    expect(count('SELECT count(*) FROM reminder_occurrences')).toBe(0);
    t.db.exec('DROP TRIGGER synthetic_occurrence_failure');
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 1, failed: 0 });
    expect(reminderJobs(user)).toHaveLength(1);
  });
});

describe('stop after finalization', () => {
  function finalizeManually(user: SessionUser, payroll: string) {
    saveSignature(t.db, t.clock, files, user.id, makePng(40, 12), 'image/png');
    const review = buildReviewPayload(t.db, t.clock, user, payroll);
    return signOffTimesheet({ db: t.db, clock: t.clock, user }, payroll, {
      expectedVersion: review.expectedVersion,
      reviewedHash: review.payloadHash,
      signerName: 'Synthetic Employee',
      deficitChoices: [],
      incompleteEvidenceAcknowledged: true,
    });
  }

  it('sends no 2 h reminder to an employee who signed off after the 24 h reminder', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P1);
    setClock(due - 24 * H);
    await pass();
    expect(captured(user)).toHaveLength(1);
    setClock(due - 3 * H);
    expect(finalizeManually(user, P1).status).toBe('created');
    setClock(due - 2 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0, collapsed: 0 });
    await pass();
    expect(captured(user)).toHaveLength(1);
    expect(occurrences(user)).toHaveLength(1);
  });

  it('sends nothing for a reminder that was queued before the period was finalized', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P1);
    setClock(due - 2 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 1 });
    finalizeManually(user, P1);
    await pass();
    expect(captured(user)).toEqual([]);
    expect(reminderJobs(user).map((job) => job.state)).toEqual(['succeeded']);
  });

  it('keeps reminding an employee whose other period is unfinalized (per-period scope)', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 3 * H);
    finalizeManually(user, P1);
    setClock(dueOf(P2) - 24 * H);
    await pass();
    const messages = captured(user);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.text).toContain(link(P2));
  });
});

describe('overdue warning (auto-submit off) and outcome notice (auto-submit on)', () => {
  it('warns about an overdue period only when auto-submit is off, once, to the employee only', async () => {
    const off = newUser();
    const on = newUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    saveSettings(off, { autoSubmit: false });
    saveSettings(on, { autoSubmit: true });
    setClock(dueOf(P1) + 5 * 60);
    expect(runDeadlineScan(t.db, t.clock)).toMatchObject({ finalized: 1, overdueRecorded: 1 });
    await pass();
    await pass();
    const overdue = captured(off);
    expect(overdue).toHaveLength(1);
    expect(overdue[0]?.subject).toMatch(/overdue/i);
    expect(overdue[0]?.text).toMatch(/not submitted automatically/i);
    expect(overdue[0]?.text).toContain(link(P1));
    expect(overdue[0]?.envelopeTo).toEqual([off.email]);
    expect(occurrences(off).map((row) => [row.kind, row.disposition])).toEqual([['overdue', 'enqueued']]);
    // The auto-submit user gets the outcome notice and no overdue warning.
    expect(captured(on).map((message) => message.subject)).toEqual([expect.stringMatching(/submitted automatically/i)]);
    expect(occurrences(on).map((row) => row.kind)).toEqual(['outcome_notice']);
    // Later scans stay quiet.
    setClock(dueOf(P1) + 3 * H);
    await pass();
    expect(captured(off)).toHaveLength(1);
    expect(captured(on)).toHaveLength(1);
  });

  it('stops the overdue warning once the employee signs off the overdue period', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    saveSettings(user, { autoSubmit: false });
    setClock(dueOf(P1) + 5 * 60);
    expect(runDeadlineScan(t.db, t.clock).overdueRecorded).toBe(1);
    saveSignature(t.db, t.clock, files, user.id, makePng(40, 12), 'image/png');
    const review = buildReviewPayload(t.db, t.clock, user, P1);
    signOffTimesheet({ db: t.db, clock: t.clock, user }, P1, {
      expectedVersion: review.expectedVersion,
      reviewedHash: review.payloadHash,
      signerName: 'Synthetic Employee',
      deficitChoices: [],
      incompleteEvidenceAcknowledged: true,
    });
    await pass();
    expect(captured(user)).toEqual([]);
    expect(occurrences(user).map((row) => [row.kind, row.disposition])).toEqual([['overdue', 'suppressed']]);
  });

  it('sends the outcome notice to the employee only: submitted automatically, review pending, login-required link', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user); // the payroll recipient is payroll@example.invalid
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) + 60);
    expect(runDeadlineScan(t.db, t.clock).finalized).toBe(1);
    setClock(dueOf(P1) + 6 * 60);
    await pass();
    await pass();
    const [notice, ...rest] = captured(user);
    expect(rest).toEqual([]);
    if (notice === undefined) throw new Error('no outcome notice');
    expect(notice.subject).toMatch(/submitted automatically/i);
    expect(notice.text).toMatch(/submitted automatically/i);
    expect(notice.text).toMatch(/review is pending/i);
    expect(notice.text).toContain(link(P1));
    expect(notice.to).toContain(user.email);
    expect(notice.envelopeTo).toEqual([user.email]);
    expect(notice.envelopeFrom).toBe(SENDER);
    expect(notice.headers).not.toMatch(/^(cc|bcc):/im);
    // The payroll recipients never see the notice or any part of it.
    expect(notice.raw).not.toContain('payroll@example.invalid');
    // The job is routed by the revision of the automatic submission.
    const job = reminderJobs(user)[0];
    expect(job?.revision_id).toBe(t.db.prepare("SELECT id FROM timesheet_revisions WHERE user_id = ? AND origin = 'deadline'").pluck().get(user.id));
    expect(occurrences(user).map((row) => [row.kind, row.disposition])).toEqual([['outcome_notice', 'enqueued']]);
  });

  it('runs end to end in the production runner: the submission goes to payroll, the outcome notice only to the employee', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) + 30);
    for (let index = 0; index < 4; index += 1) {
      await pass(handlers());
      t.clock.advanceSeconds(120);
    }
    // The submission itself: one captured attempt addressed to the payroll recipient.
    const attempts = t.db.prepare("SELECT id FROM delivery_attempts WHERE user_id = ? AND state = 'accepted'").pluck().all(user.id) as string[];
    expect(attempts).toHaveLength(1);
    const submission = readFileSync(join(captureFolder(dataDir, attempts[0] ?? ''), 'metadata.json'), 'utf8');
    expect(JSON.parse(submission).envelope.to).toEqual(TO);
    // The notice: the employee's own address, never the payroll recipient.
    const notices = captured(user);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.envelopeTo).toEqual([user.email]);
    expect(notices[0]?.text).toMatch(/review is pending/i);
    expect(reminderJobs(user).map((job) => job.state)).toEqual(['succeeded']);
  });

  it('sends the outcome notice once per automatic revision and none for a manual sign-off', async () => {
    const auto = newUser();
    const manual = newUser();
    work(manual, '2026-09-15', '09:00', '18:00');
    saveSettings(auto);
    saveSettings(manual);
    activate('2026-09-21T00:00:00Z');
    saveSignature(t.db, t.clock, files, manual.id, makePng(40, 12), 'image/png');
    const review = buildReviewPayload(t.db, t.clock, manual, P1);
    signOffTimesheet({ db: t.db, clock: t.clock, user: manual }, P1, {
      expectedVersion: review.expectedVersion,
      reviewedHash: review.payloadHash,
      signerName: 'Synthetic Employee',
      deficitChoices: [],
      incompleteEvidenceAcknowledged: true,
    });
    setClock(dueOf(P1) + 60);
    runDeadlineScan(t.db, t.clock);
    for (let index = 0; index < 3; index += 1) {
      setClock(dueOf(P1) + (index + 1) * 600);
      await pass();
    }
    expect(captured(auto)).toHaveLength(1);
    expect(captured(manual)).toEqual([]);
  });

  it('sends no outcome notice once the employee already reviewed the automatic revision (late review)', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) + 60);
    expect(runDeadlineScan(t.db, t.clock).finalized).toBe(1);
    saveSignature(t.db, t.clock, files, user.id, makePng(40, 12), 'image/png');
    const review = buildReviewPayload(t.db, t.clock, user, P1);
    reviseTimesheet({ db: t.db, clock: t.clock, user }, P1, {
      kind: 'late_review',
      reason: null,
      sendEmail: false,
      expectedVersion: review.expectedVersion,
      reviewedHash: review.payloadHash,
      signerName: 'Synthetic Employee',
      deficitChoices: [],
      incompleteEvidenceAcknowledged: true,
    });
    setClock(dueOf(P1) + 6 * 60);
    await pass();
    expect(captured(user)).toEqual([]);
  });
});

describe('missed notices collapse into one current notice after downtime', () => {
  it('sends only the 2 h notice and records the 24 h one as collapsed when the runner was down for both', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P2);
    setClock(due - 100 * 60); // 1 h 40 min left; both reminder instants have passed
    const summary = runReminderScan(t.db, t.clock);
    expect(summary).toMatchObject({ enqueued: 1, collapsed: 1 });
    await pass();
    const messages = captured(user);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.subject).toMatch(/due in about 2 hours/i);
    expect(occurrences(user).map((row) => [row.occurrence_key, row.disposition, row.job_id === null]).sort()).toEqual([
      ['offset-120', 'enqueued', false],
      ['offset-1440', 'collapsed', true],
    ]);
    // Neither a rerun nor the passing of the later instants sends anything more.
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0, collapsed: 0 });
    setClock(due - 30 * 60);
    await pass();
    expect(captured(user)).toHaveLength(1);
  });

  it('sends the 24 h notice with the real time left when only that reminder was missed', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P2);
    setClock(due - 10 * H);
    await pass();
    expect(captured(user).map((message) => message.subject)).toEqual([expect.stringMatching(/due in about 10 hours/i)]);
    setClock(due - 2 * H);
    await pass();
    expect(captured(user)).toHaveLength(2);
    expect(occurrences(user).map((row) => row.disposition)).toEqual(['enqueued', 'enqueued']);
  });

  it('sends no pre-deadline notice for a deadline that already passed during the downtime', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P2) + 1);
    await pass();
    expect(captured(user)).toEqual([]);
    expect(occurrences(user)).toEqual([]);
  });
});

describe('nothing before activation or for imported periods', () => {
  it('sends nothing while the clock is before the activation instant, then one current notice at it', async () => {
    const user = newUser();
    const due = dueOf(P3);
    const activation = due - 30 * 60;
    activate(at(activation));
    setClock(due - 2 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0, collapsed: 0 });
    await pass();
    expect(captured(user)).toEqual([]);
    setClock(activation);
    await pass();
    expect(captured(user)).toHaveLength(1);
    expect(occurrences(user).map((row) => row.disposition).sort()).toEqual(['collapsed', 'enqueued']);
  });

  it('sends nothing for a period whose deadline is before the activation instant', async () => {
    const user = newUser();
    const dueP2 = dueOf(P2);
    activate(at(dueP2 + 60)); // activation after the P2 deadline; the clock is still earlier
    t.clock.set(at(dueP2 - 3 * H));
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0 });
    expect(captured(user)).toEqual([]);
  });

  it('sends no reminder for an imported (unverified) period and no outcome notice', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    t.db.prepare('UPDATE timesheets SET imported_unverified = 1 WHERE user_id = ?').run(user.id);
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 3 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0 });
    await pass();
    setClock(dueOf(P1) + 60);
    runDeadlineScan(t.db, t.clock);
    await pass();
    expect(captured(user)).toEqual([]);
    expect(occurrences(user)).toEqual([]);
  });

  it('sends nothing to a deactivated account', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id = ?").run(user.id);
    setClock(dueOf(P1) - 3 * H);
    expect(runReminderScan(t.db, t.clock)).toMatchObject({ enqueued: 0 });
    expect(captured(user)).toEqual([]);
  });
});

describe('per-user reminder offsets', () => {
  it('uses the offsets saved in the submission settings', async () => {
    const user = newUser();
    saveSettings(user, { offsets: [60] });
    activate('2026-09-21T00:00:00Z');
    const due = dueOf(P1);
    setClock(due - 24 * H);
    await pass();
    setClock(due - 2 * H);
    await pass();
    expect(captured(user)).toEqual([]);
    setClock(due - 60 * 60);
    await pass();
    expect(captured(user).map((message) => message.subject)).toEqual([expect.stringMatching(/due in about 1 hour/i)]);
  });

  it('sends no pre-deadline notice when the offsets list is empty', async () => {
    const user = newUser();
    saveSettings(user, { offsets: [] });
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 3 * H);
    await pass();
    expect(captured(user)).toEqual([]);
  });
});

describe('links and recipients (AC-09)', () => {
  it('uses login-required deep links with the payroll date only, never a token or personal data', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user, { autoSubmit: true });
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    await pass();
    setClock(dueOf(P1) - 2 * H);
    await pass();
    setClock(dueOf(P1) + 60);
    runDeadlineScan(t.db, t.clock);
    setClock(dueOf(P1) + 6 * 60);
    await pass();
    const messages = captured(user);
    expect(messages).toHaveLength(3);
    const local = user.email.split('@')[0] ?? '';
    for (const message of messages) {
      const urls = message.text.match(/https?:\/\/\S+/g) ?? [];
      expect(urls).toEqual([link(P1)]);
      expect(urls[0]).toMatch(/^https:\/\/timesheet\.example\.invalid\/app\/#\/review\/\d{4}-\d{2}-\d{2}$/);
      expect(urls[0]).not.toContain('?');
      expect(urls[0]).not.toContain(user.id);
      expect(urls[0]).not.toContain(local);
      expect(urls[0]).not.toMatch(/token|magic|key|session/i);
      expect(message.text).not.toMatch(/token|magic link/i);
      expect(message.subject).not.toContain('@');
    }
  });

  it('addresses every captured message to the employee’s own address only', async () => {
    const one = newUser();
    const two = newUser();
    saveSettings(one);
    saveSettings(two);
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    await pass();
    setClock(dueOf(P1) + 60);
    runDeadlineScan(t.db, t.clock);
    setClock(dueOf(P1) + 6 * 60);
    await pass();
    const all = captured();
    expect(all).toHaveLength(4);
    for (const message of all) {
      const owner = message.userId === one.id ? one : two;
      expect(message.envelopeTo).toEqual([owner.email]);
      expect(message.to).toContain(owner.email);
      expect(message.headers).not.toMatch(/^(cc|bcc):/im);
      expect(message.raw).not.toContain('payroll@example.invalid');
      expect(message.raw).not.toContain((owner === one ? two : one).email);
    }
  });

  it('keeps the job payload to routing identifiers only', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    runReminderScan(t.db, t.clock);
    const [job] = reminderJobs(user);
    const payload = JSON.parse(job?.payload_json ?? '{}') as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(['kind', 'occurrence_key', 'pay_period_id']);
    expect(job?.payload_json).not.toContain('@');
    expect(job?.payload_json).not.toContain(user.email);
  });
});

describe('delivery outcomes of the reminder send job', () => {
  function stub(outcome: SendOutcome): { adapter: OutboundAdapter; calls: () => number } {
    let calls = 0;
    return {
      adapter: {
        mode: 'capture',
        send() {
          calls += 1;
          return Promise.resolve(outcome);
        },
      },
      calls: () => calls,
    };
  }

  function withAdapter(adapter: OutboundAdapter, sender: string | null = SENDER): JobHandlers {
    return {
      [JOB_REMINDER_SCAN]: createReminderScanHandler({ db: t.db, clock: t.clock }),
      [JOB_SEND_REMINDER]: createSendReminderHandler({ db: t.db, clock: t.clock, outbound: adapter, senderAddress: sender, publicBaseUrl: BASE }),
    };
  }

  async function queueOne(): Promise<void> {
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    runReminderScan(t.db, t.clock);
  }

  it('retries a temporary failure and does not send twice after acceptance', async () => {
    const user = newUser();
    await queueOne();
    const temporary = stub({ kind: 'failed_temporary', code: 'stub_temporary', providerResponse: null });
    await pass(withAdapter(temporary.adapter));
    const [job] = reminderJobs(user);
    expect(job).toMatchObject({ state: 'queued', attempts: 1, last_error: 'stub_temporary' });
    const accepted = stub({ kind: 'accepted', providerMessageId: null, providerResponse: 'stub' });
    t.clock.advanceSeconds(2 * 60);
    await pass(withAdapter(accepted.adapter));
    expect(reminderJobs(user)[0]).toMatchObject({ state: 'succeeded', attempts: 2 });
    t.clock.advanceSeconds(10 * 60);
    await pass(withAdapter(accepted.adapter));
    expect(accepted.calls()).toBe(1);
  });

  it('needs intervention for a permanent failure and never resends an uncertain outcome', async () => {
    const user = newUser();
    await queueOne();
    const uncertain = stub({ kind: 'uncertain', code: 'stub_lost', providerResponse: null });
    await pass(withAdapter(uncertain.adapter));
    expect(reminderJobs(user)[0]).toMatchObject({ state: 'intervention', last_error: 'delivery_uncertain' });
    t.clock.advanceSeconds(3600);
    await pass(withAdapter(uncertain.adapter));
    expect(uncertain.calls()).toBe(1);

    const other = newUser();
    setClock(dueOf(P2) - 24 * H);
    runReminderScan(t.db, t.clock);
    const permanent = stub({ kind: 'failed_permanent', code: 'stub_rejected', providerResponse: null });
    await pass(withAdapter(permanent.adapter));
    expect(reminderJobs(other).at(-1)).toMatchObject({ state: 'intervention', last_error: 'stub_rejected' });
  });

  it('blocks with a visible fault, never a send, when the sender is missing', async () => {
    const user = newUser();
    await queueOne();
    const never = stub({ kind: 'accepted', providerMessageId: null, providerResponse: 'stub' });
    await pass(withAdapter(never.adapter, null));
    expect(reminderJobs(user)[0]).toMatchObject({ state: 'intervention', last_error: 'sender_missing' });
    expect(never.calls()).toBe(0);
  });

  it('treats an already captured message as sent when the same job runs again after a crash', async () => {
    const user = newUser();
    await queueOne();
    await pass();
    expect(captured(user)).toHaveLength(1);
    const job = getJob(t.db, reminderJobs(user)[0]?.id ?? '');
    if (job === null) throw new Error('no job');
    const handler = handlers()[JOB_SEND_REMINDER];
    await expect(handler?.({ job: { ...job, state: 'leased', leaseOwner: 'runner-test' }, renewLease: () => true })).resolves.toBeUndefined();
    expect(captured(user)).toHaveLength(1);
  });

  it('refuses a job whose occurrence does not exist and sends nothing', async () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    runReminderScan(t.db, t.clock);
    const periodId = t.db.prepare('SELECT pay_period_id FROM reminder_occurrences WHERE user_id = ?').pluck().get(user.id) as string;
    const { job } = enqueueJob(t.db, t.clock, {
      kind: JOB_SEND_REMINDER,
      businessKey: `forged:${randomUUID()}`,
      userId: user.id,
      payload: { pay_period_id: periodId, kind: 'before_due', occurrence_key: 'offset-5' },
    });
    await pass();
    expect(getJob(t.db, job.id)).toMatchObject({ state: 'intervention', lastError: 'occurrence_missing' });
    expect(existsSync(join(captureFolder(dataDir, job.id), 'message.eml'))).toBe(false);
  });

  it('refuses a job that borrows another employee’s decision (owner scoping)', async () => {
    const owner = newUser();
    activate('2026-09-21T00:00:00Z');
    setClock(dueOf(P1) - 24 * H);
    runReminderScan(t.db, t.clock);
    const periodId = t.db.prepare('SELECT pay_period_id FROM reminder_occurrences WHERE user_id = ?').pluck().get(owner.id) as string;
    const other = newUser(); // created after the scan, so it has no decision of its own yet
    const { job } = enqueueJob(t.db, t.clock, {
      kind: JOB_SEND_REMINDER,
      businessKey: `forged:${randomUUID()}`,
      userId: other.id,
      payload: { pay_period_id: periodId, kind: 'before_due', occurrence_key: 'offset-1440' },
    });
    await pass();
    expect(getJob(t.db, job.id)).toMatchObject({ state: 'intervention', lastError: 'occurrence_missing' });
    expect(existsSync(join(captureFolder(dataDir, job.id), 'message.eml'))).toBe(false);
    expect(captured(owner)).toHaveLength(1);
    // The runner's own scan gave the second employee a decision of its own: exactly one message, never the forged one.
    expect(captured(other).map((message) => message.jobId)).not.toContain(job.id);
    expect(captured(other)).toHaveLength(1);
  });
});
