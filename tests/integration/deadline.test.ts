import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { type PayPeriod, payPeriodAt, payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import type { ReviewSnapshot } from '../../src/domain/snapshot.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { JOB_DEADLINE_SCAN } from '../../src/server/jobs/deadlineJob.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import {
  getAutomationActivation,
  listOverdueRecords,
  OVERDUE_AUDIT_OPERATION,
  runDeadlineScan,
  setAutomationActivation,
} from '../../src/server/services/automation.ts';
import { createPayrollException, getCalendar, listPayrollExceptions } from '../../src/server/services/calendars.ts';
import { finalizeAutomatically, signOffTimesheet } from '../../src/server/services/finalization.ts';
import { getBalance, listLedgerEntries, postCredit } from '../../src/server/services/ledger.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { ensurePayPeriodRow } from '../../src/server/services/periods.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { authorizeAutoImage, saveSubmissionSettings } from '../../src/server/services/submissionSettings.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { makePng, readPdf } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T10: deadline automation and the activation boundary (AC-07, docs/05 "Deadline and
 * recovery", R-05 choose mode, R-06 automatic origin, the owner's F-1 and F-4 decisions).
 * Everything is synthetic (example.invalid, capture mode). The synthetic calendar has the
 * payroll dates 2026-10-02, -16, -30 and 2026-11-13 (a Friday every 14 days) with the due
 * rule "payroll - 3 days at 17:00 America/Los_Angeles", so the first three deadlines fall in
 * daylight time and the last one after the 2026-11-01 change to standard time. The expected
 * UTC instants below are also recomputed with the production zone functions, so the tests
 * stay correct in any season of the machine running them (the clock is always injected).
 */

const EARLY = '2026-09-20T12:00:00Z';
const TO = ['payroll@example.invalid'];
const SENDER = 'timesheet@example.invalid';

const P1 = { payroll: '2026-10-02', dueAt: '2026-09-30T00:00:00Z' }; // 17:00 PDT
const P2 = { payroll: '2026-10-16', dueAt: '2026-10-14T00:00:00Z' };
const P3 = { payroll: '2026-10-30', dueAt: '2026-10-28T00:00:00Z' };
const P4 = { payroll: '2026-11-13', dueAt: '2026-11-11T01:00:00Z' }; // 17:00 PST

let t: TestContext;
let dataDir: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext(EARLY);
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  // The seeded accounts stay out of the way: every test creates the synthetic employees it needs.
  setSeededStatus('deactivated');
});

afterEach(() => t.close());

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

function setSeededStatus(status: 'active' | 'deactivated'): void {
  t.db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)').run(status, t.userIds.admin, t.userIds.employee);
}

type Mode = 'ignore' | 'auto_deduct' | 'choose_at_signoff';

/** A fresh synthetic employee with a known policy (B 480, N 30, M 30, 08:00-16:00, no breaks). */
function newUser(mode: Mode = 'ignore', balance = 0, createdAt = EARLY): SessionUser {
  const id = randomUUID();
  t.db
    .prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, 'Synthetic Employee', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
    )
    .run(id, `user-${id}@example.invalid`, t.calendarId, createdAt, createdAt);
  createPolicyVersion(
    t.db,
    t.clock,
    {
      userId: id,
      calendarId: t.calendarId,
      effectiveFrom: '2026-01-01',
      note: 'Synthetic deadline policy',
      rules: {
        requiredMinutes: 480,
        thresholdMinutes: 30,
        roundingStepMinutes: 30,
        referenceStart: '08:00',
        referenceEnd: '16:00',
        deficitMode: mode,
        breaks: [],
      },
    },
    id,
  );
  if (balance > 0) {
    postCredit({ db: t.db, clock: t.clock }, { userId: id, sourceKey: 'opening-balance', minutes: balance, workDate: '2026-09-01', actorUserId: null, origin: 'system' });
  }
  return { id, email: `user-${id}@example.invalid`, displayName: 'Synthetic Employee', role: 'employee', calendarId: t.calendarId, sessionId: 'test' };
}

/**
 * A synthetic employee who saved the submission settings with auto-submit on at the current instant: since the
 * owner decision H-Q1 (a) (2026-10-05) only such an account is ever automated. Its switch governs every deadline
 * after that instant (the clock is the account's creation instant for the helper's default).
 */
function configuredUser(mode: Mode = 'ignore', balance = 0, createdAt = EARLY): SessionUser {
  const user = newUser(mode, balance, createdAt);
  saveSubmissionSettings(t.db, t.clock, user.id, { expectedSeq: 0, to: TO, autoSubmit: true });
  return user;
}

function work(user: SessionUser, date: string, from: string, to: string): void {
  createSession({ db: t.db, clock: t.clock, user }, date, {
    start: la(`${date}T${from}`),
    end: la(`${date}T${to}`),
    input_zone: LA,
    breaks: [],
    breaks_confirmed: true,
  });
}

function activate(instant: string | null, reason = 'Synthetic pilot activation'): void {
  setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: instant, reason });
}

function saveSettings(user: SessionUser, options: { autoSubmit?: boolean; applyToOverdue?: boolean; expectedSeq?: number } = {}) {
  return saveSubmissionSettings(t.db, t.clock, user.id, {
    expectedSeq: options.expectedSeq ?? 0,
    to: TO,
    autoSubmit: options.autoSubmit ?? true,
    ...(options.applyToOverdue === undefined ? {} : { applyToOverdueDrafts: options.applyToOverdue }),
  });
}

function scan(options: { batchSize?: number } = {}) {
  return runDeadlineScan(t.db, t.clock, options);
}

interface RevisionRow {
  id: string;
  revision_no: number;
  revision_kind: string;
  origin: string;
  review_state: string;
  actor_user_id: string | null;
  reviewed_sha256: string | null;
  send_requested: number;
  supersedes_revision_id: string | null;
  payload_json: string;
  timesheet_id: string;
}

function revisions(user: SessionUser): RevisionRow[] {
  return t.db.prepare('SELECT * FROM timesheet_revisions WHERE user_id = ? ORDER BY rowid').all(user.id) as RevisionRow[];
}

function snapshotOf(row: RevisionRow): ReviewSnapshot {
  return JSON.parse(row.payload_json) as ReviewSnapshot;
}

function ledger(user: SessionUser) {
  return listLedgerEntries(t.db, user.id).filter((entry) => entry.sourceKey !== 'opening-balance');
}

function lines(user: SessionUser) {
  return t.db
    .prepare('SELECT work_date, line_kind, proposed_minutes, outcome, ledger_entry_id FROM revision_ledger_lines WHERE user_id = ? ORDER BY work_date, line_kind')
    .all(user.id) as Array<{ work_date: string; line_kind: string; proposed_minutes: number; outcome: string; ledger_entry_id: string | null }>;
}

function jobKinds(user: SessionUser): string[] {
  return t.db.prepare('SELECT kind FROM jobs WHERE user_id = ? ORDER BY kind').pluck().all(user.id) as string[];
}

function schedule() {
  return getCalendar(t.db, t.calendarId).schedule;
}

function period(payroll: string): PayPeriod {
  return payPeriodForPayrollDate(schedule(), payroll, []);
}

function runnerHandlers() {
  const delivery = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER }, { databasePath: t.config.databasePath, port: 3000, production: false });
  return createJobHandlers({ db: t.db, clock: t.clock, files, delivery });
}

/**
 * Runs the production runner until the queue is quiet. Jobs enqueued in the same second tie-break by id,
 * so a send claimed before its PDF is retried one minute later: each pass therefore advances the clock.
 * Returns the number of jobs that needed intervention.
 */
async function drain(): Promise<number> {
  let intervention = 0;
  for (let pass = 0; pass < 3; pass += 1) {
    intervention += (await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers: runnerHandlers() })).intervention;
    t.clock.advanceSeconds(120);
  }
  return intervention;
}

/** The attempts of the user whose message exists in the capture folder (capture mode only; nothing leaves the host). */
function capturedAttempts(user: SessionUser): string[] {
  const ids = t.db.prepare('SELECT id FROM delivery_attempts WHERE user_id = ?').pluck().all(user.id) as string[];
  return ids.filter((id) => existsSync(join(captureFolder(dataDir, id), 'message.eml')));
}

describe('deadlines are computed with the production zone functions (season independent)', () => {
  it('matches the expected UTC instants on both sides of the autumn change', () => {
    for (const item of [P1, P2, P3, P4]) {
      expect(formatUtcInstant(period(item.payroll).dueAtUtc), item.payroll).toBe(item.dueAt);
    }
    // The same local rule gives a different UTC offset in standard time: 17:00 PDT is 00:00Z, 17:00 PST is 01:00Z.
    expect(formatUtcInstant(payPeriodAt(schedule(), 0).dueAtUtc).slice(11)).toBe('00:00:00Z');
    expect(formatUtcInstant(payPeriodAt(schedule(), 3).dueAtUtc).slice(11)).toBe('01:00:00Z');
  });

  it('finalizes exactly at the deadline instant in daylight time and in standard time', () => {
    const user = configuredUser();
    activate('2026-10-15T00:00:00Z'); // after the P2 deadline, so only P3 and P4 are eligible
    for (const item of [P3, P4]) {
      const due = period(item.payroll).dueAtUtc;
      t.clock.set(formatUtcInstant(due - 1));
      expect(scan().finalized, `${item.payroll} one second before`).toBe(0);
      expect(revisions(user).filter((row) => snapshotOf(row).period.payroll_date === item.payroll)).toHaveLength(0);
      t.clock.set(formatUtcInstant(due));
      scan();
      expect(
        revisions(user).filter((row) => snapshotOf(row).period.payroll_date === item.payroll),
        `${item.payroll} at the deadline`,
      ).toHaveLength(1);
    }
  });
});

describe('a payroll exception that moves the deadline', () => {
  it('uses the exception deadline, computed in the reporting zone, and the moved payroll date', () => {
    const user = configuredUser();
    createPayrollException(
      t.db,
      t.clock,
      { calendarId: t.calendarId, nominalPayrollDate: P1.payroll, payrollDate: '2026-10-01', dueLocalDate: '2026-10-05', dueLocalTime: '12:00', reason: 'Synthetic holiday shift' },
      t.userIds.admin,
    );
    activate('2026-09-21T00:00:00Z');
    const moved = payPeriodAt(schedule(), 0, listPayrollExceptions(t.db, t.calendarId));
    expect(formatUtcInstant(moved.dueAtUtc)).toBe('2026-10-05T19:00:00Z'); // 12:00 PDT
    t.clock.set('2026-09-30T00:05:00Z'); // after the nominal deadline, before the exception deadline
    expect(scan().finalized).toBe(0);
    t.clock.set('2026-10-05T18:59:59Z');
    expect(scan().finalized).toBe(0);
    t.clock.set('2026-10-05T19:00:00Z');
    expect(scan().finalized).toBe(1);
    const [revision] = revisions(user);
    expect(revision && snapshotOf(revision).period).toMatchObject({ payroll_date: '2026-10-01', nominal_payroll_date: P1.payroll, due_at_utc: '2026-10-05T19:00:00Z', is_exception: true });
  });
});

describe('activation boundary (F-4)', () => {
  it('finalizes nothing while the activation instant is null, even for an account whose auto-submit is on', () => {
    // WP3-FIX3 (WP3-RBC2-01): the account saved auto-submit on (H-Q1 (a)), so only the F-4 activation guard holds it back.
    const user = configuredUser();
    expect(count('SELECT count(*) FROM submission_settings WHERE user_id = ?', user.id)).toBeGreaterThan(0);
    work(user, '2026-09-15', '09:00', '18:00');
    t.clock.set('2026-10-20T12:00:00Z');
    const before = {
      revisions: count('SELECT count(*) FROM timesheet_revisions'),
      timesheets: count('SELECT count(*) FROM timesheets'),
      jobs: count('SELECT count(*) FROM jobs'),
      audit: count('SELECT count(*) FROM audit_events'),
      ledger: count('SELECT count(*) FROM ot_ledger'),
    };
    expect(getAutomationActivation(t.db)).toEqual({ activeFrom: null, recordedAt: null, recordedBy: null });
    expect(scan()).toMatchObject({ activated: false, finalized: 0, overdueRecorded: 0 });
    expect(count('SELECT count(*) FROM timesheet_revisions')).toBe(before.revisions);
    expect(count('SELECT count(*) FROM timesheets')).toBe(before.timesheets);
    expect(count('SELECT count(*) FROM jobs')).toBe(before.jobs);
    expect(count('SELECT count(*) FROM audit_events')).toBe(before.audit);
    expect(count('SELECT count(*) FROM ot_ledger')).toBe(before.ledger);
  });

  it('does not touch a period due before the activation instant and finalizes the next one', () => {
    const user = configuredUser();
    activate('2026-10-01T00:00:00Z');
    t.clock.set('2026-10-29T12:00:00Z');
    expect(scan().finalized).toBe(2);
    const payrolls = revisions(user).map((row) => snapshotOf(row).period.payroll_date);
    expect(payrolls).toEqual([P2.payroll, P3.payroll]);
    // P1 was due 2026-09-30, before the activation: no revision, no row and no overdue record.
    expect(count('SELECT count(*) FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id WHERE t.user_id = ? AND p.payroll_date = ?', user.id, P1.payroll)).toBe(0);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
  });

  it('treats a period due exactly at the activation instant as eligible', () => {
    const user = configuredUser();
    activate(P1.dueAt);
    t.clock.set(P1.dueAt);
    scan();
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll]);
  });

  it('respects the user’s own effective instant: a period due before it is not auto-submitted', () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-10-05T12:00:00Z');
    saveSettings(user); // auto-submit on, effective 2026-10-05
    t.clock.set('2026-10-29T12:00:00Z');
    scan();
    // P1 was due 2026-09-30, before the user's switch took effect; P2 and P3 follow it.
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P2.payroll, P3.payroll]);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
  });

  it('applies the switch that governed each period when the switch changed in between', () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    const first = saveSettings(user); // on from 2026-09-21
    t.clock.set('2026-10-10T12:00:00Z');
    saveSettings(user, { autoSubmit: false, expectedSeq: first.seq }); // off from 2026-10-10
    t.clock.set('2026-10-20T12:00:00Z');
    scan();
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll]);
    expect(listOverdueRecords(t.db, user.id).map((row) => row.payrollDate)).toEqual([P2.payroll]);
  });
});

describe('account creation bound (WP3-B-01, docs/05 "Deadline and recovery", F-4)', () => {
  const P5 = { payroll: '2026-11-27', dueAt: '2026-11-26T01:00:00Z' }; // 17:00 PST

  it('never submits a period whose deadline passed before the account existed, even with the explicit overdue choice', () => {
    activate('2026-10-01T00:00:00Z');
    // The account is created after P1..P4 are all due; it saves auto-submit on and explicitly applies it to overdue drafts.
    t.clock.set('2026-11-12T00:00:00Z');
    const late = newUser('ignore', 0, '2026-11-12T00:00:00Z');
    saveSettings(late, { applyToOverdue: true });
    t.clock.set('2026-11-12T00:00:30Z');
    const summary = scan();
    expect(summary.finalized).toBe(0);
    expect(revisions(late)).toEqual([]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', late.id)).toBe(0);
    expect(jobKinds(late)).toEqual([]);
    expect(ledger(late)).toEqual([]);
    expect(listOverdueRecords(t.db, late.id)).toEqual([]);
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND (operation LIKE 'deadline.%' OR operation LIKE 'timesheet.%')", late.id)).toBe(0);
    // Later passes before the next deadline change nothing either.
    t.clock.set('2026-11-20T12:00:00Z');
    expect(scan().finalized).toBe(0);
    expect(revisions(late)).toEqual([]);
  });

  it('still automates the first deadline after the account was created, with the default labels (F-1)', () => {
    activate('2026-10-01T00:00:00Z');
    t.clock.set('2026-11-12T00:00:00Z');
    const late = configuredUser('ignore', 0, '2026-11-12T00:00:00Z');
    t.clock.set(P5.dueAt);
    expect(scan().finalized).toBe(1);
    const rows = revisions(late);
    expect(rows.map((row) => [snapshotOf(row).period.payroll_date, row.origin, row.review_state])).toEqual([[P5.payroll, 'deadline', 'pending']]);
  });

  it('automates the period in which the account was created when its deadline is still ahead', () => {
    activate('2026-10-01T00:00:00Z');
    // P4 starts 2026-10-26 and is due 2026-11-11T01:00Z; the account appears in the middle of it and saves its settings.
    t.clock.set('2026-11-05T00:00:00Z');
    const mid = configuredUser('ignore', 0, '2026-11-05T00:00:00Z');
    t.clock.set(P4.dueAt);
    expect(scan().finalized).toBe(1);
    expect(revisions(mid).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P4.payroll]);
  });

  it('never puts the auto-submit effective instant of saved settings before the account existed', () => {
    activate('2026-10-01T00:00:00Z');
    const created = '2026-10-20T00:00:00Z';
    t.clock.set(created);
    const user = newUser('ignore', 0, created);
    t.clock.set('2026-10-21T00:00:00Z');
    const off = saveSettings(user, { autoSubmit: false });
    t.clock.set('2026-10-21T01:00:00Z');
    const on = saveSettings(user, { autoSubmit: true, expectedSeq: off.seq });
    t.clock.set('2026-10-21T02:00:00Z');
    const off2 = saveSettings(user, { autoSubmit: false, expectedSeq: on.seq });
    t.clock.set('2026-10-21T03:00:00Z');
    // The explicit "apply to overdue drafts" choice reaches back, but never before the account existed.
    saveSettings(user, { autoSubmit: true, applyToOverdue: true, expectedSeq: off2.seq });
    t.clock.set('2026-10-29T00:00:00Z');
    expect(scan().finalized).toBe(1);
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P3.payroll]);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
    const accountCreated = t.db.prepare('SELECT created_at FROM users WHERE id = ?').pluck().get(user.id) as string;
    const effective = t.db.prepare('SELECT seq, auto_submit_effective_from FROM submission_settings WHERE user_id = ? ORDER BY seq').all(user.id) as Array<{
      seq: number;
      auto_submit_effective_from: string;
    }>;
    expect(effective).toHaveLength(4);
    // The three ordinary saves take effect at their own instant, never before the account existed.
    for (const row of effective.slice(0, 3)) expect(row.auto_submit_effective_from >= accountCreated).toBe(true);
  });
});

describe('setup bound (owner decision H-Q1 (a), 2026-10-05, docs/05 "Deadline and recovery", D-09)', () => {
  const PERIODS = [P1, P2, P3, P4];

  /** Everything an automatic submission could leave behind for the user: nothing of it may exist. */
  function expectNothingAutomated(user: SessionUser, when: string): void {
    expect(revisions(user), when).toEqual([]);
    // The user's own work may have created a draft; no automatic act ever finalizes one.
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND finalized_revision_no IS NOT NULL', user.id), when).toBe(0);
    expect(jobKinds(user), when).toEqual([]);
    expect(ledger(user), when).toEqual([]);
    expect(listOverdueRecords(t.db, user.id), when).toEqual([]);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', user.id), when).toBe(0);
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND (operation LIKE 'deadline.%' OR operation LIKE 'timesheet.%')", user.id), when).toBe(0);
  }

  it('never automates an account that never saved its submission settings, at and after every deadline', async () => {
    const user = newUser(); // created before the activation; it has days of work, an OT hour, and never saves settings
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    for (const item of PERIODS) {
      const due = period(item.payroll).dueAtUtc;
      for (const instant of [due - 1, due, due + 1, due + 3600]) {
        t.clock.set(formatUtcInstant(instant));
        expect(scan(), `${item.payroll} at ${formatUtcInstant(instant)}`).toMatchObject({ activated: true, finalized: 0, overdueRecorded: 0, failed: 0 });
        expectNothingAutomated(user, `${item.payroll} at ${formatUtcInstant(instant)}`);
      }
    }
    // The production runner path (the scan job, the PDF and send jobs) does nothing for it either: no delivery is attempted.
    t.clock.set('2026-11-20T12:00:00Z');
    expect(await drain()).toBe(0);
    expectNothingAutomated(user, 'after the runner passes');
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    expect(capturedAttempts(user)).toEqual([]);
  });

  it('automates only the deadlines after the settings were saved with auto-submit on, when the account saves them mid-period', () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set(formatUtcInstant(period(P1.payroll).dueAtUtc + 3600));
    expect(scan().finalized).toBe(0); // P1 passed while the account was not set up
    t.clock.set('2026-10-05T12:00:00Z'); // inside P2 (due 2026-10-14T00:00Z)
    saveSettings(user); // auto-submit on, effective now
    expect(scan().finalized).toBe(0); // the saved settings do not reach back to P1
    t.clock.set(formatUtcInstant(period(P2.payroll).dueAtUtc - 1));
    expect(scan().finalized).toBe(0);
    t.clock.set(formatUtcInstant(period(P2.payroll).dueAtUtc));
    expect(scan().finalized).toBe(1);
    t.clock.set('2026-10-29T12:00:00Z');
    expect(scan().finalized).toBe(1);
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P2.payroll, P3.payroll]);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
    // P1 stays the user's own draft (the work entered above): no revision, no finalization.
    expect(
      count('SELECT count(*) FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id WHERE t.user_id = ? AND p.payroll_date = ? AND t.finalized_revision_no IS NOT NULL', user.id, P1.payroll),
    ).toBe(0);
  });

  it('keeps the explicit apply-to-overdue choice: it submits the overdue periods, still clamped by the account creation', () => {
    activate('2026-09-21T00:00:00Z');
    // Created before every deadline: the choice reaches P1, P2 and P3.
    const early = newUser();
    // Created between the P1 and P2 deadlines: the choice never reaches P1.
    t.clock.set('2026-10-05T12:00:00Z');
    const later = newUser('ignore', 0, '2026-10-05T12:00:00Z');
    t.clock.set('2026-10-29T12:00:00Z');
    expect(scan().finalized).toBe(0); // neither has saved settings: nothing is automated
    saveSettings(early, { applyToOverdue: true });
    saveSettings(later, { applyToOverdue: true });
    expect(scan().finalized).toBe(5);
    expect(revisions(early).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll, P2.payroll, P3.payroll]);
    expect(revisions(later).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P2.payroll, P3.payroll]);
  });

  it('without the overdue choice a first save never reaches periods that fell due before it', () => {
    const user = newUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-10-29T12:00:00Z');
    expect(scan().finalized).toBe(0);
    saveSettings(user); // P1, P2 and P3 are all overdue; no overdue choice
    expect(scan().finalized).toBe(0);
    expectNothingAutomated(user, 'after the plain save');
    t.clock.set(P4.dueAt);
    expect(scan().finalized).toBe(1);
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P4.payroll]);
  });

  it('still records the overdue period for an account that saved auto-submit off, and nothing for one that never saved', () => {
    const off = newUser();
    const never = newUser();
    activate('2026-09-21T00:00:00Z');
    saveSettings(off, { autoSubmit: false });
    t.clock.set('2026-10-05T12:00:00Z');
    expect(scan()).toMatchObject({ finalized: 0, overdueRecorded: 1 }); // P1, governed by the off switch saved before it
    t.clock.set(formatUtcInstant(period(P2.payroll).dueAtUtc));
    expect(scan()).toMatchObject({ finalized: 0, overdueRecorded: 1 }); // P2
    expect(listOverdueRecords(t.db, off.id).map((row) => row.payrollDate)).toEqual([P1.payroll, P2.payroll]);
    expectNothingAutomated(never, 'the account that never saved');
  });
});

describe('switch on: automatic finalization (R-05, R-06, F-1)', () => {
  it('creates an automatic, pending, unsigned revision with credits, jobs and an audit event', () => {
    const user = newUser('ignore');
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    saveSettings(user);
    t.clock.set('2026-09-30T00:05:00Z');
    const versionBefore = count('SELECT version FROM timesheets WHERE user_id = ?', user.id);
    const summary = scan();
    expect(summary.finalized).toBe(1);
    const [revision, ...rest] = revisions(user);
    expect(rest).toHaveLength(0);
    expect(revision).toMatchObject({
      revision_no: 1,
      revision_kind: 'original',
      origin: 'deadline',
      review_state: 'pending',
      actor_user_id: null,
      reviewed_sha256: null,
      send_requested: 1,
      supersedes_revision_id: null,
    });
    if (revision === undefined) throw new Error('no revision');
    // signed_at stays empty: there is no sign-off row at all.
    expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', user.id)).toBe(0);
    // The timesheet points at the revision and its version moved.
    expect(t.db.prepare('SELECT finalized_revision_no, version FROM timesheets WHERE user_id = ?').get(user.id)).toEqual({ finalized_revision_no: 1, version: versionBefore + 1 });
    // The computable credit posted once through the ledger with the automatic origin and no actor.
    const snapshot = snapshotOf(revision);
    expect(snapshot.ot_proposals.map((item) => [item.work_date, item.credited_minutes])).toEqual([['2026-09-15', 60]]);
    const entries = ledger(user);
    expect(entries.map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.sourceKey, entry.origin, entry.actorUserId])).toEqual([
      ['2026-09-15', 'credit', 60, 'finalization:day:2026-09-15:credit', 'automatic', null],
    ]);
    expect(lines(user)).toEqual([{ work_date: '2026-09-15', line_kind: 'credit', proposed_minutes: 60, outcome: 'posted', ledger_entry_id: entries[0]?.id }]);
    expect(jobKinds(user)).toEqual(['render_pdf', 'send_email']);
    const audit = t.db.prepare("SELECT actor_user_id, owner_user_id, after_json FROM audit_events WHERE owner_user_id = ? AND operation = 'timesheet.auto_finalize'").all(user.id) as Array<{
      actor_user_id: string | null;
      owner_user_id: string;
      after_json: string;
    }>;
    expect(audit).toHaveLength(1);
    expect(audit[0]?.actor_user_id).toBeNull();
    expect(JSON.parse(audit[0]?.after_json ?? '{}')).toMatchObject({ revision_id: revision.id, origin: 'deadline', review_state: 'pending', signed_at: null, finalized_revision_no: 1 });
    // A rerun changes nothing.
    const again = scan();
    expect(again.finalized).toBe(0);
    expect(revisions(user)).toHaveLength(1);
    expect(ledger(user)).toHaveLength(1);
  });

  it('records a choose-mode deficit as pending_choice and posts no debit', () => {
    const user = configuredUser('choose_at_signoff', 300);
    work(user, '2026-09-16', '09:00', '13:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(lines(user)).toEqual([{ work_date: '2026-09-16', line_kind: 'deficit_debit', proposed_minutes: -240, outcome: 'pending_choice', ledger_entry_id: null }]);
    expect(ledger(user)).toEqual([]);
    expect(getBalance(t.db, user.id).postedMinutes).toBe(300);
    const pending = t.db
      .prepare("SELECT count(*) FROM revision_ledger_lines l JOIN timesheet_revisions r ON r.id = l.revision_id WHERE l.user_id = ? AND r.origin = 'deadline' AND l.outcome = 'pending_choice'")
      .pluck()
      .get(user.id);
    expect(pending).toBe(1);
  });

  it('posts an auto-deduct debit through the ledger with the automatic origin', () => {
    const user = configuredUser('auto_deduct', 300);
    work(user, '2026-09-16', '09:00', '13:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(ledger(user).map((entry) => [entry.workDate, entry.entryType, entry.deltaMinutes, entry.origin, entry.actorUserId])).toEqual([
      ['2026-09-16', 'deficit_debit', -240, 'automatic', null],
    ]);
    expect(lines(user).map((line) => line.outcome)).toEqual(['posted']);
    expect(getBalance(t.db, user.id).postedMinutes).toBe(60);
  });

  it('keeps an auto-deduct debit pending when the balance cannot cover it', () => {
    const user = configuredUser('auto_deduct', 100);
    work(user, '2026-09-16', '09:00', '13:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(ledger(user)).toEqual([]);
    expect(lines(user).map((line) => [line.line_kind, line.outcome])).toEqual([['deficit_debit', 'pending_insufficient_balance']]);
    expect(getBalance(t.db, user.id).postedMinutes).toBe(100);
  });

  it('posts nothing for an incomplete day and still submits the period', () => {
    const user = configuredUser('auto_deduct', 300);
    // An open session (no end): the day stays unresolved, never invented hours.
    createSession({ db: t.db, clock: t.clock, user }, '2026-09-16', {
      start: la('2026-09-16T09:00'),
      end: null,
      input_zone: LA,
      breaks: [],
      breaks_confirmed: false,
    });
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    const [revision] = revisions(user);
    if (revision === undefined) throw new Error('no revision');
    expect(snapshotOf(revision).unresolved_inputs.map((item) => [item.work_date, item.reason])).toContainEqual(['2026-09-16', 'open_session']);
    expect(ledger(user)).toEqual([]);
    expect(lines(user)).toEqual([]);
  });

  it('carries the signature image only when the user authorized it, and never writes a sign-off', async () => {
    const authorized = newUser();
    const plain = newUser();
    for (const user of [authorized, plain]) work(user, '2026-09-15', '09:00', '18:00');
    saveSignature(t.db, t.clock, files, authorized.id, makePng(40, 12), 'image/png');
    saveSignature(t.db, t.clock, files, plain.id, makePng(40, 12), 'image/png');
    const settings = saveSettings(authorized);
    const signature = t.db.prepare("SELECT id FROM attachments WHERE user_id = ? AND kind = 'signature'").pluck().get(authorized.id) as string;
    authorizeAutoImage(t.db, t.clock, authorized.id, { expectedSeq: settings.seq, signatureAttachmentId: signature });
    saveSettings(plain);
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    t.clock.set('2026-09-30T00:10:00Z');
    expect(await drain()).toBe(0);
    const images = async (user: SessionUser): Promise<number> => {
      const revision = revisions(user)[0];
      if (revision === undefined) throw new Error('no revision');
      const pdf = t.db
        .prepare("SELECT a.storage_key FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ? AND f.state = 'ready'")
        .pluck()
        .get(revision.id) as string;
      const content = await readPdf(new Uint8Array(files.read(pdf)));
      return content.pages.reduce((total, page) => total + page.images.length, 0);
    };
    expect(snapshotOf(revisions(authorized)[0] as RevisionRow).auto_image.authorized).toBe(true);
    expect(snapshotOf(revisions(plain)[0] as RevisionRow).auto_image.authorized).toBe(false);
    expect(await images(authorized)).toBe(1);
    expect(await images(plain)).toBe(0);
    for (const user of [authorized, plain]) {
      expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', user.id)).toBe(0);
      expect(revisions(user)[0]).toMatchObject({ review_state: 'pending', origin: 'deadline' });
    }
  });
});

describe('the automatic entry point (finalizeAutomatically)', () => {
  it('honors the in-transaction authorization: a refusal writes nothing, and a second call after success is skipped', () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    const ctx = { db: t.db, clock: t.clock, owner: user };
    const rows = () => ({
      revisions: count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', user.id),
      ledger: count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', user.id),
      jobs: count('SELECT count(*) FROM jobs WHERE user_id = ?', user.id),
      audit: count('SELECT count(*) FROM audit_events WHERE owner_user_id = ?', user.id),
    });
    const before = rows();
    expect(finalizeAutomatically(ctx, { payrollDate: P1.payroll, authorize: () => 'switch_off' })).toEqual({ status: 'skipped', reason: 'switch_off' });
    expect(rows()).toEqual(before);
    const created = finalizeAutomatically(ctx, { payrollDate: P1.payroll, authorize: () => null });
    expect(created).toMatchObject({ status: 'created', finalizedRevisionNo: 1, revision: { origin: 'deadline', reviewState: 'pending', revisionKind: 'original' }, signoff: null });
    const after = rows();
    expect(after.revisions).toBe(1);
    // Asked again (a racing scan that passed its own check earlier), it finds the period finalized and writes nothing.
    expect(finalizeAutomatically(ctx, { payrollDate: P1.payroll, authorize: () => null })).toEqual({ status: 'skipped', reason: 'already_finalized' });
    expect(rows()).toEqual(after);
  });

  it('refuses a payroll date that is not one of the owner’s own and creates nothing', () => {
    const user = newUser();
    expect(() => finalizeAutomatically({ db: t.db, clock: t.clock, owner: user }, { payrollDate: '2026-10-03', authorize: () => null })).toThrow();
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(0);
  });
});

describe('an eligible period with no saved entries is still submitted (F-1)', () => {
  it('creates the timesheet with the default labels, zero OT, no deficit and one revision', async () => {
    const user = newUser('auto_deduct', 300);
    saveSettings(user);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(0);
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(1);
    const [revision, ...rest] = revisions(user);
    expect(rest).toHaveLength(0);
    if (revision === undefined) throw new Error('no revision');
    expect(revision).toMatchObject({ revision_no: 1, origin: 'deadline', review_state: 'pending' });
    const snapshot = snapshotOf(revision);
    expect(snapshot.days).toHaveLength(14);
    // The FR-03 defaults: every label is the calendar default, nothing is recorded, nothing is calculated.
    expect(snapshot.days.every((day) => day.category_source === 'default' && day.sessions.length === 0 && day.completeness === 'no_records')).toBe(true);
    expect(snapshot.days.filter((day) => day.category === 'Worked').length).toBeGreaterThan(5);
    expect(snapshot.ot_proposals).toEqual([]);
    expect(snapshot.deficit_proposals).toEqual([]);
    expect(snapshot.totals.credited_minutes).toBe(0);
    expect(snapshot.unresolved_inputs.every((item) => item.reason === 'no_records')).toBe(true);
    expect(ledger(user)).toEqual([]);
    expect(lines(user)).toEqual([]);
    expect(getBalance(t.db, user.id).postedMinutes).toBe(300);
    expect(jobKinds(user)).toEqual(['render_pdf', 'send_email']);
    expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', user.id)).toBe(0);
    // The PDF renders and the submission is captured once.
    t.clock.set('2026-09-30T00:10:00Z');
    expect(await drain()).toBe(0);
    expect(count("SELECT count(*) FROM delivery_attempts WHERE user_id = ? AND state = 'accepted'", user.id)).toBe(1);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', user.id)).toBe(1);
  });
});

describe('switch off: overdue state and notice record, nothing finalized', () => {
  it('records the overdue period once and exports nothing', () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    saveSettings(user, { autoSubmit: false });
    t.clock.set('2026-09-30T00:05:00Z');
    const summary = scan();
    expect(summary.overdueRecorded).toBe(1);
    expect(revisions(user)).toEqual([]);
    expect(jobKinds(user)).toEqual([]);
    expect(ledger(user)).toEqual([]);
    expect(t.db.prepare('SELECT finalized_revision_no FROM timesheets WHERE user_id = ?').all(user.id)).toEqual([{ finalized_revision_no: null }]);
    const records = listOverdueRecords(t.db, user.id);
    expect(records).toEqual([{ payrollDate: P1.payroll, dueAt: P1.dueAt, reason: 'auto_submit_off', recordedAt: '2026-09-30T00:05:00Z' }]);
    const event = t.db.prepare('SELECT actor_user_id, owner_user_id, entity_type FROM audit_events WHERE owner_user_id = ? AND operation = ?').all(user.id, OVERDUE_AUDIT_OPERATION);
    expect(event).toEqual([{ actor_user_id: null, owner_user_id: user.id, entity_type: 'pay_period' }]);
    // A second scan records nothing new (one record per user and period).
    t.clock.set('2026-09-30T00:10:00Z');
    expect(scan().overdueRecorded).toBe(0);
    expect(listOverdueRecords(t.db, user.id)).toHaveLength(1);
  });

  it('submits the overdue period after the user explicitly applies the switch to overdue drafts', () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    const off = saveSettings(user, { autoSubmit: false });
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(revisions(user)).toEqual([]);
    // Turning the switch on without the explicit choice does not reach back to the overdue draft.
    t.clock.set('2026-09-30T01:00:00Z');
    const on = saveSettings(user, { autoSubmit: true, expectedSeq: off.seq });
    scan();
    expect(revisions(user)).toEqual([]);
    // The explicit choice does (a new switch change applied to overdue drafts).
    t.clock.set('2026-09-30T02:00:00Z');
    const off2 = saveSettings(user, { autoSubmit: false, expectedSeq: on.seq });
    t.clock.set('2026-09-30T03:00:00Z');
    saveSettings(user, { autoSubmit: true, applyToOverdue: true, expectedSeq: off2.seq });
    scan();
    expect(revisions(user)).toHaveLength(1);
    expect(listOverdueRecords(t.db, user.id)).toHaveLength(1);
  });

  it('never records or finalizes a deactivated user', () => {
    const user = configuredUser();
    t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id = ?").run(user.id);
    const other = configuredUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    expect(scan().finalized).toBe(1);
    expect(revisions(user)).toEqual([]);
    expect(revisions(other)).toHaveLength(1);
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND (operation LIKE 'deadline.%' OR operation LIKE 'timesheet.%')", user.id)).toBe(0);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(0);
  });
});

describe('imported and already finalized periods', () => {
  /** An imported_unverified timesheet row for the first period of the user (WP3-FIX3: kept as a helper for both halves). */
  function importPeriodOne(user: SessionUser): void {
    const payPeriodId = ensurePayPeriodRow(t.db, t.clock, t.calendarId, period(P1.payroll));
    t.db
      .prepare('INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at, imported_unverified) VALUES (?, ?, ?, 1, ?, ?, 1)')
      .run(randomUUID(), user.id, payPeriodId, EARLY, EARLY);
  }

  it('never auto-submits an imported_unverified timesheet of an account whose auto-submit is on, and records no overdue state', () => {
    // WP3-FIX3 (WP3-RBC2-01): with auto-submit on only the imported-period exclusion holds the period back.
    const user = configuredUser();
    activate('2026-09-21T00:00:00Z');
    importPeriodOne(user);
    t.clock.set('2026-09-30T00:05:00Z');
    expect(scan()).toMatchObject({ activated: true, finalized: 0, overdueRecorded: 0 });
    expect(revisions(user)).toEqual([]);
    expect(jobKinds(user)).toEqual([]);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND finalized_revision_no IS NOT NULL', user.id)).toBe(0);
  });

  it('does not mark an imported_unverified timesheet overdue when auto-submit was saved off before the deadline', () => {
    const user = newUser();
    const on = saveSettings(user); // on, effective at the account creation
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-21T12:00:00Z');
    saveSettings(user, { autoSubmit: false, expectedSeq: on.seq }); // off well before the deadline
    importPeriodOne(user);
    t.clock.set('2026-09-30T00:05:00Z');
    expect(scan()).toMatchObject({ finalized: 0, overdueRecorded: 0 });
    expect(revisions(user)).toEqual([]);
    expect(jobKinds(user)).toEqual([]);
    expect(listOverdueRecords(t.db, user.id)).toEqual([]);
  });

  it('leaves a manually signed period alone: one revision, one ledger set and the existing jobs continue', async () => {
    const user = newUser('ignore');
    work(user, '2026-09-15', '09:00', '18:00');
    saveSignature(t.db, t.clock, files, user.id, makePng(40, 12), 'image/png');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    const review = buildReviewPayload(t.db, t.clock, user, P1.payroll);
    const signed = signOffTimesheet({ db: t.db, clock: t.clock, user }, P1.payroll, {
      expectedVersion: review.expectedVersion,
      reviewedHash: review.payloadHash,
      signerName: 'Synthetic Employee',
      deficitChoices: [],
      incompleteEvidenceAcknowledged: true,
    });
    expect(signed.status).toBe('created');
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    expect(revisions(user)).toHaveLength(1);
    expect(revisions(user)[0]).toMatchObject({ origin: 'employee', review_state: 'signed' });
    expect(ledger(user)).toHaveLength(1);
    expect(jobKinds(user)).toEqual(['render_pdf', 'send_email']);
    // The existing jobs run to completion exactly once.
    t.clock.set('2026-09-30T00:10:00Z');
    expect(await drain()).toBe(0);
    expect(count("SELECT count(*) FROM delivery_attempts WHERE user_id = ? AND state = 'accepted'", user.id)).toBe(1);
    expect(revisions(user)).toHaveLength(1);
  });
});

describe('the scan re-assesses every period just before acting (guard sweep, WP3-FIX3)', () => {
  // listCandidates already filters these cases, so each guard in assessPeriod is only reachable when the state changes
  // after the candidate list was built; a trigger or a clock that moves after the first finalization does exactly that.
  it('skips the later periods of an account deactivated while the scan runs (inactive_user)', () => {
    const user = configuredUser();
    activate('2026-09-21T00:00:00Z');
    t.db.exec(`CREATE TEMP TRIGGER deactivate_after_first AFTER INSERT ON timesheet_revisions BEGIN UPDATE users SET status = 'deactivated' WHERE id = NEW.user_id; END`);
    t.clock.set('2026-10-15T00:00:00Z');
    expect(scan()).toMatchObject({ finalized: 1 });
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(1);
  });

  it('skips a period that falls before an activation instant moved forward while the scan runs (before_activation)', () => {
    const user = configuredUser();
    activate('2026-09-21T00:00:00Z');
    t.db.exec(`CREATE TEMP TRIGGER move_activation AFTER INSERT ON timesheet_revisions BEGIN UPDATE operations_state SET automation_active_from = '2026-10-14T00:00:01Z' WHERE id = 1; END`);
    t.clock.set('2026-10-15T00:00:00Z');
    expect(scan()).toMatchObject({ finalized: 1 });
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(1);
  });

  it('skips a period whose deadline is still ahead of the clock when it is acted on (not_due)', () => {
    const user = configuredUser();
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-10-15T00:00:00Z');
    // The candidate list is built at 2026-10-15; once the first revision exists the clock reads a time before P2 is due.
    const wound = new Date('2026-10-01T00:00:00Z');
    const clock = { now: () => (count('SELECT count(*) FROM timesheet_revisions') > 0 ? wound : t.clock.now()) };
    expect(runDeadlineScan(t.db, clock)).toMatchObject({ finalized: 1 });
    expect(revisions(user).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ?', user.id)).toBe(1);
  });
});

describe('a manual sign-off after the automatic submission', () => {
  it('is refused as already finalized and changes nothing (the late review is a separate flow)', () => {
    const user = newUser('ignore');
    work(user, '2026-09-15', '09:00', '18:00');
    saveSignature(t.db, t.clock, files, user.id, makePng(40, 12), 'image/png');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    const review = buildReviewPayload(t.db, t.clock, user, P1.payroll);
    t.clock.set('2026-09-30T00:05:00Z');
    scan();
    const before = { revisions: revisions(user).length, ledger: ledger(user).length, jobs: jobKinds(user).length };
    let failure: unknown;
    try {
      signOffTimesheet({ db: t.db, clock: t.clock, user }, P1.payroll, {
        expectedVersion: review.expectedVersion,
        reviewedHash: review.payloadHash,
        signerName: 'Synthetic Employee',
        deficitChoices: [],
        incompleteEvidenceAcknowledged: true,
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({ status: 409, code: 'already_finalized' });
    expect({ revisions: revisions(user).length, ledger: ledger(user).length, jobs: jobKinds(user).length }).toEqual(before);
    expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', user.id)).toBe(0);
  });
});

describe('recovery after downtime', () => {
  it('processes missed deadlines chronologically in bounded batches', () => {
    const user = configuredUser();
    activate('2026-09-21T00:00:00Z');
    // The runner was down for six weeks: four deadlines passed (two in daylight time, one just before and one after the change).
    t.clock.set('2026-11-12T12:00:00Z');
    const payrolls = () => revisions(user).map((row) => snapshotOf(row).period.payroll_date);
    const first = scan({ batchSize: 2 });
    expect(first).toMatchObject({ finalized: 2, remaining: true });
    expect(payrolls()).toEqual([P1.payroll, P2.payroll]);
    const second = scan({ batchSize: 2 });
    expect(second).toMatchObject({ finalized: 2, remaining: false });
    expect(payrolls()).toEqual([P1.payroll, P2.payroll, P3.payroll, P4.payroll]);
    // Chronological by deadline, one revision per period, and a rerun finds nothing.
    const dueOrder = revisions(user).map((row) => snapshotOf(row).period.due_at_utc);
    expect(dueOrder).toEqual([P1.dueAt, P2.dueAt, P3.dueAt, P4.dueAt]);
    expect(scan({ batchSize: 2 })).toMatchObject({ finalized: 0, remaining: false });
    expect(revisions(user)).toHaveLength(4);
  });

  it('orders several owners by deadline first and never starves an older period behind a newer one', () => {
    const early = configuredUser();
    const late = newUser();
    activate('2026-09-21T00:00:00Z');
    // `late` joined the switch after P1: only its P2 deadline is eligible, `early` has P1 and P2.
    t.clock.set('2026-10-05T12:00:00Z');
    saveSettings(late);
    t.clock.set('2026-10-15T12:00:00Z');
    expect(scan({ batchSize: 2 })).toMatchObject({ finalized: 2, remaining: true });
    // The oldest deadline is always handled first; the other two periods share the P2 deadline.
    const order = () =>
      (t.db.prepare('SELECT user_id, payload_json FROM timesheet_revisions ORDER BY rowid').all() as Array<{ user_id: string; payload_json: string }>).map(
        (row) => [row.user_id === early.id ? 'early' : 'late', (JSON.parse(row.payload_json) as ReviewSnapshot).period.payroll_date],
      );
    expect(order()[0]).toEqual(['early', P1.payroll]);
    expect(order()).toHaveLength(2);
    expect(scan({ batchSize: 2 })).toMatchObject({ finalized: 1, remaining: false });
    expect(order().slice(1).map((item) => item[1])).toEqual([P2.payroll, P2.payroll]);
    expect(revisions(early).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P1.payroll, P2.payroll]);
    expect(revisions(late).map((row) => snapshotOf(row).period.payroll_date)).toEqual([P2.payroll]);
  });
});

describe('the runner registration', () => {
  it('queues no scan job while the activation instant is null, and one per minute afterwards', async () => {
    const handlers = runnerHandlers();
    expect(Object.keys(handlers)).toContain(JOB_DEADLINE_SCAN);
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(count('SELECT count(*) FROM jobs WHERE kind = ?', JOB_DEADLINE_SCAN)).toBe(0);
    activate('2026-09-21T00:00:00Z');
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(count('SELECT count(*) FROM jobs WHERE kind = ?', JOB_DEADLINE_SCAN)).toBe(1);
    t.clock.advanceSeconds(60);
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(count('SELECT count(*) FROM jobs WHERE kind = ?', JOB_DEADLINE_SCAN)).toBe(2);
    expect(count("SELECT count(*) FROM jobs WHERE kind = ? AND state = 'succeeded'", JOB_DEADLINE_SCAN)).toBe(2);
  });

  it('runs the scan, the PDF job and the send job through the runner and sends once', async () => {
    const user = newUser();
    work(user, '2026-09-15', '09:00', '18:00');
    saveSettings(user);
    activate('2026-09-21T00:00:00Z');
    t.clock.set('2026-09-30T00:05:00Z');
    const handlers = runnerHandlers();
    const first = await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(first.intervention).toBe(0);
    expect(revisions(user)).toHaveLength(1);
    // The scan, the PDF job and the send job were all claimed in this one pass (jobs enqueued in the same
    // second tie-break by id, so a send claimed before its PDF is retried by the store one minute later).
    expect(first.claimed).toBeGreaterThanOrEqual(3);
    t.clock.advanceSeconds(120);
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(count("SELECT count(*) FROM delivery_attempts WHERE user_id = ? AND state = 'accepted'", user.id)).toBe(1);
    t.clock.advanceSeconds(120);
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-test', handlers });
    expect(revisions(user)).toHaveLength(1);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', user.id)).toBe(1);
    expect(capturedAttempts(user)).toHaveLength(1);
  });
});

describe('a failure rolls the automatic finalization back (transaction rollback)', () => {
  it('leaves no row behind, records the failure once and finalizes after the cause is gone', () => {
    const user = configuredUser('auto_deduct', 300);
    activate('2026-09-21T00:00:00Z');
    t.db.exec("CREATE TRIGGER synthetic_job_failure BEFORE INSERT ON jobs BEGIN SELECT RAISE(ABORT, 'synthetic_failure'); END");
    t.clock.set('2026-09-30T00:05:00Z');
    const first = scan();
    expect(first.failed).toBeGreaterThanOrEqual(1);
    for (const table of ['timesheets', 'timesheet_revisions', 'revision_ledger_lines', 'ot_ledger']) {
      expect(count(`SELECT count(*) FROM ${table} WHERE user_id = ? AND ${table === 'ot_ledger' ? "source_key <> 'opening-balance'" : '1 = 1'}`, user.id), table).toBe(0);
    }
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND operation = 'timesheet.auto_finalize'", user.id)).toBe(0);
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND operation = 'deadline.finalize_failed'", user.id)).toBe(1);
    scan();
    expect(count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND operation = 'deadline.finalize_failed'", user.id)).toBe(1);
    t.db.exec('DROP TRIGGER synthetic_job_failure');
    expect(scan().failed).toBe(0);
    expect(revisions(user)).toHaveLength(1);
  });
});

describe('activation instant service', () => {
  it('records, replays and clears the instant with an audit event that carries no timesheet detail', () => {
    activate('2026-09-21T00:00:00Z');
    expect(getAutomationActivation(t.db)).toEqual({ activeFrom: '2026-09-21T00:00:00Z', recordedAt: EARLY, recordedBy: t.userIds.admin });
    const audit = () => t.db.prepare("SELECT actor_user_id, owner_user_id, reason, before_json, after_json FROM audit_events WHERE operation = 'automation.activation' ORDER BY rowid").all() as Array<{
      actor_user_id: string | null;
      owner_user_id: string | null;
      reason: string | null;
      before_json: string | null;
      after_json: string | null;
    }>;
    expect(audit()).toHaveLength(1);
    expect(audit()[0]).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: null, reason: 'Synthetic pilot activation' });
    expect(JSON.parse(audit()[0]?.before_json ?? 'null')).toEqual({ active_from: null });
    expect(JSON.parse(audit()[0]?.after_json ?? 'null')).toEqual({ active_from: '2026-09-21T00:00:00Z' });
    activate('2026-09-21T00:00:00Z'); // identical: nothing new
    expect(audit()).toHaveLength(1);
    activate(null, 'Synthetic pause');
    expect(getAutomationActivation(t.db).activeFrom).toBeNull();
    expect(audit()).toHaveLength(2);
    // Cleared again: nothing is finalized.
    t.clock.set('2026-10-20T12:00:00Z');
    expect(scan().activated).toBe(false);
  });

  it('refuses an instant in the past, a malformed instant and a blank reason', () => {
    for (const bad of ['2026-09-20T11:59:59Z', '2026-09-21', '2026-09-21T00:00:00+02:00', 'tomorrow']) {
      expect(() => activate(bad), bad).toThrow();
    }
    expect(() => activate('2026-09-21T00:00:00Z', '   ')).toThrow();
    expect(getAutomationActivation(t.db).activeFrom).toBeNull();
    expect(count("SELECT count(*) FROM audit_events WHERE operation = 'automation.activation'")).toBe(0);
    // The current instant itself is allowed.
    activate(EARLY);
    expect(getAutomationActivation(t.db).activeFrom).toBe(EARLY);
  });
});

describe('admin activation route', () => {
  it('is admin only, strict, audited and returns no timesheet detail', async () => {
    setSeededStatus('active');
    const anonymous = await t.request('PUT', '/api/admin/automation/activation', { body: { active_from: '2026-09-21T00:00:00Z', reason: 'Synthetic' } });
    expect(anonymous.status).toBe(401);
    const employee = await t.login('employee');
    const forbidden = await t.request('PUT', '/api/admin/automation/activation', { cookie: employee, body: { active_from: '2026-09-21T00:00:00Z', reason: 'Synthetic' } });
    expect(forbidden.status).toBe(403);
    expect((await t.request('GET', '/api/admin/automation', { cookie: employee })).status).toBe(403);
    expect(getAutomationActivation(t.db).activeFrom).toBeNull();

    const admin = await t.login('admin');
    expect((await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: '2026-09-21T00:00:00Z', reason: 'Synthetic' }, origin: 'http://evil.example' })).status).toBe(403);
    const strict = await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: '2026-09-21T00:00:00Z', reason: 'Synthetic', user_id: t.userIds.employee } });
    expect(strict.status).toBe(422);
    const past = await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: '2026-09-19T00:00:00Z', reason: 'Synthetic' } });
    expect(past.status).toBe(422);
    expect(past.body.error.code).toBe('activation_in_past');
    const blank = await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: '2026-09-21T00:00:00Z', reason: ' ' } });
    expect(blank.status).toBe(422);

    const set = await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: '2026-09-21T00:00:00Z', reason: 'Synthetic pilot' } });
    expect(set.status).toBe(200);
    expect(set.body).toEqual({ automation: { active_from: '2026-09-21T00:00:00Z', recorded_at: EARLY, recorded_by: t.userIds.admin } });
    const read = await t.request('GET', '/api/admin/automation', { cookie: admin });
    expect(read.status).toBe(200);
    expect(read.body).toEqual(set.body);
    const event = t.db.prepare("SELECT actor_user_id, owner_user_id, reason FROM audit_events WHERE operation = 'automation.activation'").all();
    expect(event).toEqual([{ actor_user_id: t.userIds.admin, owner_user_id: null, reason: 'Synthetic pilot' }]);
    const cleared = await t.request('PUT', '/api/admin/automation/activation', { cookie: admin, body: { active_from: null, reason: 'Synthetic pause' } });
    expect(cleared.status).toBe(200);
    expect(cleared.body.automation.active_from).toBeNull();
    expect(count("SELECT count(*) FROM audit_events WHERE operation = 'automation.activation'")).toBe(2);
    // The history of the employee never shows the system-wide activation.
    const history = await t.request('GET', '/api/history', { cookie: employee });
    expect(JSON.stringify(history.body)).not.toContain('automation.activation');
  });
});
