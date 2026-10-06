import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { setAutomationActivation, listOverdueRecords } from '../../src/server/services/automation.ts';
import { createCalendar, createCalendarVersion, getCalendar } from '../../src/server/services/calendars.ts';
import { getBalance } from '../../src/server/services/ledger.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { RacePool } from '../support/concurrency.ts';
import { makePng, readPdf } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';
import { capturedIds, CRASH_EXIT_CODE, hm, listCaptured, runCrashRunner, sha256Hex } from './ac13-support.ts';

/*
 * AC-13 (docs/06): the integrated two-week scenario, the historical correction, approved partial OT use and
 * the overdue case, as one repeatable test (WP5-AC13; it turns the WP5-ASSESS-A probe into a committed test).
 *
 * Fixed synthetic data, no wall clock, no machine zone, no sleeps, no port: the clock is injected, the zone is the
 * saved reporting zone America/Los_Angeles (PDT in this window), the app runs in process, the jobs run through the
 * production runner and the mail goes to the capture folder. The period is payroll 2026-10-09: 2026-09-23 ... 2026-10-06,
 * due 2026-10-08 17:00 PDT = 2026-10-09T00:00:00Z. Policy B=480, N=30, M=30. Alice (choose-at-sign-off deficit mode)
 * is the main actor; Bob (auto-submit off) checks isolation and the overdue case.
 */

const NOW0 = '2026-10-06T21:30:00Z'; // Tuesday 14:30 PDT, the last date of the period
const P1 = '2026-10-09';
const P1_DUE = '2026-10-09T00:00:00Z';
const SENDER = 'timesheet-pilot-sender@example.invalid';
const ALICE = { email: 'alice.synthetic@example.invalid', name: 'Nguyễn Thị Alice Synthetic', to: 'payroll-a@example.invalid', cc: 'manager-a@example.invalid' };
const BOB = { email: 'bob.synthetic@example.invalid', name: 'Bob Synthetic', to: 'payroll-b@example.invalid' };
const HOLIDAY = '2026-09-30';
const BREAKS: Array<[string, string]> = [
  ['10:00', '10:15'],
  ['12:00', '12:30'],
  ['14:30', '14:45'],
];
const LATE_BREAKS: Array<[string, string]> = [
  ['11:00', '11:15'],
  ['13:00', '13:30'],
  ['15:30', '15:45'],
];

let t: TestContext;
let dataDir: string;
let files: FileStore;
let pool: RacePool | undefined;

beforeEach(async () => {
  t = await createTestContext(NOW0);
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  // The seeded accounts stay out of the way: this scenario creates its own two users.
  t.db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)').run('deactivated', t.userIds.admin, t.userIds.employee);
});

afterEach(async () => {
  await pool?.close();
  pool = undefined;
  t.close();
});

const count = (sql: string, ...params: string[]): number => Number(t.db.prepare(sql).pluck().get(...params));

/** Row counts of every table: a refused or read-only call must leave all of them as they were. */
function tableCounts(): Record<string, number> {
  const names = t.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").pluck().all() as string[];
  return Object.fromEntries(names.map((name) => [name, Number(t.db.prepare(`SELECT count(*) FROM "${name}"`).pluck().get())]));
}

async function login(email: string, password: string): Promise<string> {
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(response.status, 'login').toBe(200);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (cookie === undefined) throw new Error('No session cookie');
  return cookie;
}

async function call(cookie: string, method: string, path: string, body?: unknown, expected?: number) {
  const response = await t.request(method, path, body === undefined ? { cookie } : { cookie, body });
  if (expected !== undefined) expect(response.status, `${method} ${path}: ${JSON.stringify(response.body)}`).toBe(expected);
  return response;
}

const at = (date: string, time: string) => la(`${date}T${time}`);

async function addSession(cookie: string, date: string, start: string, end: string, breaks: Array<[string, string]> | null, endDate = date) {
  const response = await call(
    cookie,
    'POST',
    `/api/days/${date}/sessions`,
    {
      start: at(date, start),
      end: at(endDate, end),
      input_zone: LA,
      breaks_confirmed: breaks !== null,
      breaks: (breaks ?? []).map(([from, to]) => ({ start: at(date, from), end: at(date, to), counts_as_work: false })),
    },
    201,
  );
  return response.body.session as { id: string; version: number };
}

const policyBody = (mode: 'ignore' | 'choose_at_signoff') => ({
  effective_from: '2026-01-01',
  required_minutes: 480,
  threshold_minutes: 30,
  rounding_step_minutes: 30,
  reference_start: '08:00',
  reference_end: '17:00',
  breaks: [
    { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
    { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
    { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
  ],
  deficit_mode: mode,
});

/** One production runner pass per step; each step moves the injected clock on, so a retried job is due again. */
async function runPasses(handlers: ReturnType<typeof createJobHandlers>, passes = 4, stepSeconds = 120) {
  const summaries = [];
  for (let pass = 0; pass < passes; pass += 1) {
    summaries.push(await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-ac13', handlers }));
    t.clock.advanceSeconds(stepSeconds);
  }
  return summaries;
}

function productionHandlers() {
  const delivery = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER, PUBLIC_BASE_URL: 'https://timesheet.example.invalid' }, { databasePath: t.config.databasePath, port: 3000, production: false });
  return createJobHandlers({ db: t.db, clock: t.clock, files, delivery });
}

describe('AC-13 integrated scenario', () => {
  it('runs two weeks of entries, sign-off, send, restart, correction, partial OT use, isolation and an overdue deadline', async () => {
    /* ------------------------------------------------------------------ setup: calendar, users, policy, settings */
    const calendarId = createCalendar(
      t.db,
      t.clock,
      {
        name: 'Synthetic payroll calendar',
        schedule: { reportingZone: LA, anchorPayrollDate: P1, cycleDays: 14, periodStartOffsetDays: -16, periodEndOffsetDays: -3, dueOffsetDays: -1, dueLocalTime: '17:00' },
      },
      null,
    );
    createCalendarVersion(t.db, t.clock, { calendarId, effectiveFrom: '2026-01-01', weekdays: [1, 2, 3, 4, 5], dates: [{ date: HOLIDAY, kind: 'holiday', name: 'Synthetic company day' }], note: 'Synthetic' }, null);
    const credentials: Record<'alice' | 'bob', { id: string; cookie: string }> = { alice: { id: '', cookie: '' }, bob: { id: '', cookie: '' } };
    for (const [key, person, mode] of [['alice', ALICE, 'choose_at_signoff'], ['bob', BOB, 'ignore']] as const) {
      // A per-run random credential, never a literal.
      const password = randomBytes(18).toString('base64url');
      const id = await createUser(t.db, t.clock, { email: person.email, displayName: person.name, role: 'employee', password, calendarId }, null);
      credentials[key] = { id, cookie: await login(person.email, password) };
      await call(credentials[key].cookie, 'POST', '/api/policies', policyBody(mode), 201);
    }
    const a = credentials.alice.cookie;
    const b = credentials.bob.cookie;
    await call(a, 'POST', '/api/settings/submission', { expected_seq: 0, to: [ALICE.to], cc: [ALICE.cc], auto_submit: false }, 201);
    await call(b, 'POST', '/api/settings/submission', { expected_seq: 0, to: [BOB.to], auto_submit: false }, 201);
    const signature = saveSignature(t.db, t.clock, files, credentials.alice.id, makePng(40, 12), 'image/png');
    const current = await call(a, 'GET', '/api/periods/current', undefined, 200);
    expect(current.body.current).toMatchObject({ payroll_date: P1, period_start: '2026-09-23', period_end: '2026-10-06' });
    await call(a, 'POST', '/api/ot/opening-balance', { minutes: 90, as_of_date: '2026-09-01', reason: 'Synthetic opening balance', evidence_ref: 'Synthetic evidence reference', expected_version: 0 }, 201);

    /* ------------------------------------------------------------------ fourteen dates of entries (Alice) */
    await addSession(a, '2026-09-23', '08:00', '17:00', BREAKS); // E 0
    await addSession(a, '2026-09-24', '09:00', '18:30', LATE_BREAKS); // flexible start, E 30 (not above N)
    await addSession(a, '2026-09-25', '08:00', '17:31', BREAKS); // E 31 -> 30
    const sunday1 = await addSession(a, '2026-09-27', '10:00', '12:00', []); // Sunday: 120 non-working
    await addSession(a, '2026-09-28', '08:00', '17:45', BREAKS); // E 45 -> 30
    await addSession(a, '2026-09-29', '08:00', '17:46', BREAKS); // E 46 -> 60
    // 2026-09-30 is the company holiday: no entry.
    await addSession(a, '2026-10-01', '08:00', '12:15', [['10:00', '10:15']]); // 4 h of work ...
    const leave = await call(a, 'GET', '/api/days/2026-10-01', undefined, 200);
    await call(a, 'PUT', '/api/days/2026-10-01', { category: 'Worked', leave_minutes: 240, leave_kind: 'vacation', wfh: false, notes: 'Synthetic: 4 h work and 4 h vacation', expected_version: leave.body.entry?.version ?? null }, 200); // ... plus 4 h of leave
    await addSession(a, '2026-10-02', '08:00', '17:00', BREAKS);
    await addSession(a, '2026-10-02', '22:00', '02:00', [], '2026-10-03'); // overnight Friday into Saturday
    const sunday2 = await addSession(a, '2026-10-04', '13:00', '13:16', []); // Sunday: 16 minutes, non-working
    await addSession(a, '2026-10-05', '08:00', '16:00', BREAKS); // deficit day: 7 h
    await addSession(a, '2026-10-06', '06:00', '10:15', null); // unknown breaks
    // A live Clock in / Clock out later the same day (the injected clock moves, the session keeps the accounting date).
    t.clock.set('2026-10-06T19:00:00Z');
    const clockIn = await call(a, 'POST', '/api/clock/in', { input_zone: LA }, 201);
    t.clock.set('2026-10-06T21:00:00Z');
    await call(a, 'POST', '/api/clock/out', { breaks: [], breaks_confirmed: true, expected_version: clockIn.body.session.version }, 200);
    expect(clockIn.body.session.work_date).toBe('2026-10-06');
    expect(count("SELECT count(*) FROM work_sessions WHERE user_id = ? AND source = 'clock'", credentials.alice.id)).toBe(1);
    t.clock.set(NOW0);
    // Bob: one ordinary weekday in the same period.
    await addSession(b, '2026-09-28', '08:00', '17:00', BREAKS);

    const sheet = await call(a, 'GET', `/api/timesheets/${P1}`, undefined, 200);
    const days = Object.fromEntries((sheet.body.days as any[]).map((day) => [day.work_date, day]));
    expect(Object.keys(days)).toHaveLength(14);
    const expectedCredits: Record<string, number> = {
      '2026-09-23': 0, '2026-09-24': 0, '2026-09-25': 30, '2026-09-27': 120, '2026-09-28': 30, '2026-09-29': 60,
      '2026-10-01': 0, '2026-10-02': 240, '2026-10-04': 30, '2026-10-05': 0,
    };
    for (const [date, minutes] of Object.entries(expectedCredits)) expect(days[date].calculation.credited_minutes, `credit ${date}`).toBe(minutes);
    expect(days['2026-10-02'].calculation).toMatchObject({ regular_minutes: 600, nonworking_minutes: 120 }); // Friday keeps the overnight
    expect(days['2026-10-03'].sessions).toEqual([]);
    expect(days[HOLIDAY].classification).toMatchObject({ day_class: 'nonworking' });
    expect(days['2026-10-01'].deficit_minutes).toBe(0); // 4 h work + 4 h leave
    expect(days['2026-10-05'].deficit_minutes).toBe(60);
    expect(days['2026-10-06'].calculation.status).not.toBe('complete'); // unknown breaks: incomplete, not zero

    /* ------------------------------------------------------------------ review and sign-off */
    const review = await call(a, 'GET', `/api/timesheets/${P1}/review`, undefined, 200);
    const payload = review.body.payload;
    expect(payload.days).toHaveLength(14);
    expect(payload.totals.credited_minutes).toBe(510);
    expect(hm(payload.totals.credited_minutes)).toBe('8:30');
    expect(payload.deficit_proposals.map((d: any) => [d.work_date, d.deficit_minutes])).toEqual([['2026-10-05', 60]]);
    expect(payload.unresolved_inputs.some((u: any) => u.work_date === '2026-10-06')).toBe(true);
    expect(payload.recipients.to).toEqual([ALICE.to]);
    expect(payload.recipients.cc).toEqual([ALICE.cc]);
    const signBody = {
      expected_version: review.body.expected_version,
      reviewed_hash: review.body.payload_hash,
      signer_name: ALICE.name,
      deficit_choices: [{ work_date: '2026-10-05', choice: 'deduct' }],
      incomplete_evidence_acknowledged: true,
    };
    // Refused sign-offs write nothing.
    const beforeRefusals = tableCounts();
    expect((await call(a, 'POST', `/api/timesheets/${P1}/signoff`, { ...signBody, deficit_choices: [] })).status).toBe(422);
    expect((await call(a, 'POST', `/api/timesheets/${P1}/signoff`, { ...signBody, incomplete_evidence_acknowledged: false })).status).toBe(422);
    expect((await call(a, 'POST', `/api/timesheets/${P1}/signoff`, { ...signBody, signer_name: '  ' })).status).toBe(422);
    expect((await call(a, 'POST', `/api/timesheets/${P1}/signoff`, { ...signBody, reviewed_hash: '0'.repeat(64) })).status).toBe(409);
    expect(tableCounts()).toEqual(beforeRefusals);
    // Two identical sign-offs at once: one creates the revision, the other replays or conflicts; never two.
    const [first, second] = await Promise.all([call(a, 'POST', `/api/timesheets/${P1}/signoff`, signBody), call(a, 'POST', `/api/timesheets/${P1}/signoff`, signBody)]);
    expect([first.status, second.status].filter((status) => status === 201)).toHaveLength(1);
    const created = first.status === 201 ? first : second;
    expect(created.body).toMatchObject({ status: 'created', finalized_revision_no: 1 });
    expect(created.body.revision).toMatchObject({ revision_no: 1, revision_kind: 'original', origin: 'employee', review_state: 'signed', payload_sha256: review.body.payload_hash });
    expect(created.body.signoff).toMatchObject({ signer_name: ALICE.name, signed_at: NOW0, reviewed_sha256: review.body.payload_hash, signature_attachment_id: signature.id });
    const retry = await call(a, 'POST', `/api/timesheets/${P1}/signoff`, signBody, 200);
    expect(retry.body.status).toBe('replayed');
    const r1 = created.body.revision.id as string;
    expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', credentials.alice.id)).toBe(1);
    expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', credentials.alice.id)).toBe(1);

    // The ledger posts exactly once: opening 90, six credits, one deficit debit of 60.
    const ledger1 = (await call(a, 'GET', '/api/ot/ledger', undefined, 200)).body;
    const credits = ledger1.entries.filter((entry: any) => entry.entry_type === 'credit').map((entry: any) => [entry.work_date, entry.delta_minutes]).sort();
    expect(credits).toEqual([['2026-09-25', 30], ['2026-09-27', 120], ['2026-09-28', 30], ['2026-09-29', 60], ['2026-10-02', 240], ['2026-10-04', 30]]);
    expect(ledger1.entries.filter((entry: any) => entry.delta_minutes < 0).map((entry: any) => [entry.work_date, entry.delta_minutes])).toEqual([['2026-10-05', -60]]);
    expect(ledger1.balance.posted_minutes).toBe(540);
    const ledgerRows = count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', credentials.alice.id);
    expect(ledgerRows).toBe(8);
    const queued = t.db.prepare("SELECT kind FROM jobs WHERE revision_id = ? AND state = 'queued' ORDER BY kind").pluck().all(r1);
    expect(queued).toEqual(['render_pdf', 'send_email']);

    /* ------------------------------------------------------------------ restart around the send: no blind resend */
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
    expect(t.db.prepare("SELECT state FROM revision_files WHERE revision_id = ? AND kind = 'pdf'").pluck().get(r1)).toBe('ready');
    // A runner process commits `sending` and dies before the mail is handed over.
    t.clock.set('2026-10-06T21:31:00Z');
    const crashed = await runCrashRunner({ folder: dirname(t.config.databasePath), databasePath: t.config.databasePath, dataDir, sender: SENDER, owner: 'runner-crash', nowIso: '2026-10-06T21:31:00Z' });
    expect(crashed.code, crashed.stderr).toBe(CRASH_EXIT_CODE);
    const attemptsOf = (revisionId: string) => t.db.prepare('SELECT id, state, decision, provider_response FROM delivery_attempts WHERE revision_id = ? ORDER BY attempt_no').all(revisionId) as Array<{ id: string; state: string; decision: string | null; provider_response: string | null }>;
    expect(attemptsOf(r1).map((attempt) => attempt.state)).toEqual(['sending']);
    expect(capturedIds(dataDir)).toEqual([]);
    // The restarted runner (a new pass after the lease expired) marks it uncertain and sends nothing, then or later.
    const restartHandlers = productionHandlers();
    t.clock.set('2026-10-06T21:33:00Z');
    await runPasses(restartHandlers, 3);
    expect(attemptsOf(r1).map((attempt) => [attempt.state, attempt.provider_response])).toEqual([['uncertain', 'lease_expired_while_sending']]);
    expect(capturedIds(dataDir)).toEqual([]);
    expect(t.db.prepare("SELECT state, last_error FROM jobs WHERE revision_id = ? AND kind = 'send_email'").get(r1)).toEqual({ state: 'intervention', last_error: 'delivery_uncertain' });
    const blocked = await call(a, 'POST', `/api/revisions/${r1}/resend`, {});
    expect(blocked.status).toBe(409);
    expect(attemptsOf(r1)).toHaveLength(1);
    // Only the owner's explicit decision resends, once, as a new attempt.
    const uncertainId = (attemptsOf(r1)[0] as { id: string }).id;
    await call(a, 'POST', `/api/deliveries/${uncertainId}/decision`, { decision: 'resend' }, 201);
    await runPasses(restartHandlers, 3);
    const attemptsR1 = attemptsOf(r1);
    expect(attemptsR1.map((attempt) => [attempt.state, attempt.decision])).toEqual([['uncertain', 'resend'], ['accepted', null]]);
    // The captured message: one submission, the PDF and the exact recipients.
    const captured = listCaptured(dataDir);
    expect(captured.map((message) => message.id)).toEqual([(attemptsR1[1] as { id: string }).id]);
    const [mail] = captured;
    expect(mail?.metadata.envelope).toEqual({ from: SENDER, to: [ALICE.to, ALICE.cc] });
    expect(mail?.eml).not.toMatch(/^bcc:/im);
    const storedPdf = t.db.prepare("SELECT a.sha256 AS sha256, a.storage_key AS key FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ? AND f.kind = 'pdf'").get(r1) as { sha256: string; key: string };
    expect(mail?.pdf).not.toBeNull();
    expect(sha256Hex(mail?.pdf ?? new Uint8Array())).toBe(storedPdf.sha256);
    expect(mail?.metadata.pdf_sha256).toBe(storedPdf.sha256);
    const r1Pdf = await readPdf(new Uint8Array(mail?.pdf ?? []));
    expect(r1Pdf.text).toContain(hm(510)); // the credited OT total 8:30
    expect(r1Pdf.text).toContain(ALICE.name);
    // Neither the restart nor the decision moved the ledger or created a revision.
    expect(count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', credentials.alice.id)).toBe(ledgerRows);
    expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', credentials.alice.id)).toBe(1);

    /* ------------------------------------------------------------------ historical correction */
    const r1Row = t.db.prepare('SELECT payload_json, payload_sha256, created_at FROM timesheet_revisions WHERE id = ?').get(r1);
    const jobsBefore = count('SELECT count(*) FROM jobs');
    const attemptsBefore = count('SELECT count(*) FROM delivery_attempts');
    const editBody = { start: at('2026-10-04', '13:00'), end: at('2026-10-04', '13:46'), input_zone: LA, breaks: [], breaks_confirmed: true, expected_version: sunday2.version };
    const editNoReason = await call(a, 'PUT', `/api/sessions/${sunday2.id}`, editBody);
    expect(editNoReason.status).toBe(422);
    await call(a, 'PUT', `/api/sessions/${sunday2.id}`, { ...editBody, reason: 'Synthetic correction: the Sunday session ended at 13:46' }, 200);
    await runPasses(restartHandlers, 2);
    // An edit sends nothing: no job, attempt or capture.
    expect(count('SELECT count(*) FROM jobs')).toBe(jobsBefore);
    expect(count('SELECT count(*) FROM delivery_attempts')).toBe(attemptsBefore);
    expect(capturedIds(dataDir)).toHaveLength(1);
    const review2 = await call(a, 'GET', `/api/timesheets/${P1}/review`, undefined, 200);
    expect(review2.body.payload.totals.credited_minutes).toBe(540);
    expect(hm(review2.body.payload.totals.credited_minutes)).toBe('9:00');
    const correctionBody = { expected_version: review2.body.expected_version, reviewed_hash: review2.body.payload_hash, signer_name: ALICE.name, deficit_choices: [{ work_date: '2026-10-05', choice: 'deduct' }], incomplete_evidence_acknowledged: true, send_email: false };
    expect((await call(a, 'POST', `/api/timesheets/${P1}/revisions`, { ...correctionBody, reason: ' ' })).status).toBe(422);
    const correction = await call(a, 'POST', `/api/timesheets/${P1}/revisions`, { ...correctionBody, reason: 'Synthetic correction of the 2026-10-04 Sunday end time' }, 201);
    const r2 = correction.body.revision.id as string;
    expect(correction.body.revision).toMatchObject({ revision_no: 2, supersedes_revision_id: r1 });
    // Only the difference posts: one +30 entry that corrects the original 10-04 credit.
    const ledger2 = (await call(a, 'GET', '/api/ot/ledger', undefined, 200)).body;
    const added = ledger2.entries.filter((entry: any) => !ledger1.entries.some((old: any) => old.id === entry.id));
    const originalSunday = ledger1.entries.find((entry: any) => entry.entry_type === 'credit' && entry.work_date === '2026-10-04');
    expect(added.map((entry: any) => [entry.work_date, entry.delta_minutes, entry.corrects_entry_id])).toEqual([['2026-10-04', 30, originalSunday.id]]);
    expect(ledger2.balance.posted_minutes).toBe(570);
    // The original is kept, byte for byte, with its own sign-off, and the correction sent nothing.
    expect(t.db.prepare('SELECT payload_json, payload_sha256, created_at FROM timesheet_revisions WHERE id = ?').get(r1)).toEqual(r1Row);
    expect(count('SELECT count(*) FROM signoffs WHERE user_id = ?', credentials.alice.id)).toBe(2);
    expect(count('SELECT count(*) FROM timesheet_revisions WHERE user_id = ?', credentials.alice.id)).toBe(2);
    await runPasses(restartHandlers, 3);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE revision_id = ?', r2)).toBe(0);
    expect(capturedIds(dataDir)).toHaveLength(1);
    expect(attemptsOf(r1)).toHaveLength(2);
    const r2Key = t.db.prepare("SELECT a.storage_key FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ? AND f.kind = 'pdf' AND f.state = 'ready'").pluck().get(r2) as string;
    expect((await readPdf(new Uint8Array(files.read(r2Key)))).text).toContain('9:00');

    /* ------------------------------------------------------------------ approved partial OT use and a concurrent double spend */
    const permission = { approver_name: 'Synthetic Manager', approver_identity: ALICE.cc, approval_date: '2026-10-01', evidence_ref: 'Synthetic chat reference' };
    const reserveBody = { request_key: 'ac13-leave-1', leave_date: '2026-10-06', requested_minutes: 240, permission, note: 'Synthetic OT leave' };
    const reserve = await call(a, 'POST', '/api/ot/leave', reserveBody, 201);
    expect(reserve.body.balance).toMatchObject({ posted_minutes: 570, reserved_minutes: 240, available_minutes: 330 });
    expect((await call(a, 'POST', '/api/ot/leave', reserveBody)).status).toBe(200); // the same key replays
    const leaveId = reserve.body.request.id as string;
    const use = { use_key: 'ac13-use-1', minutes: 180, expected_version: reserve.body.request.version };
    const used = await call(a, 'POST', `/api/ot/leave/${leaveId}/consume`, use, 200);
    expect(used.body.balance).toMatchObject({ posted_minutes: 390, reserved_minutes: 60, available_minutes: 330 });
    expect((await call(a, 'POST', `/api/ot/leave/${leaveId}/consume`, use)).body.balance.posted_minutes).toBe(390); // the same use key spends once
    const cancelled = await call(a, 'POST', `/api/ot/leave/${leaveId}/cancel`, { expected_version: used.body.request.version, reason: 'Synthetic: the remainder is not needed' }, 200);
    expect(cancelled.body).toMatchObject({ released_minutes: 60, balance: { posted_minutes: 390, reserved_minutes: 0, available_minutes: 390 } });
    // Two connections each spend 80 of a 100 reservation at the same instant: exactly one is recorded.
    const second2 = await call(a, 'POST', '/api/ot/leave', { request_key: 'ac13-leave-2', leave_date: '2026-10-05', requested_minutes: 100, permission }, 201);
    const secondId = second2.body.request.id as string;
    pool = await RacePool.start(2);
    const outcomes = await pool.race(
      t.config.databasePath,
      NOW0,
      ['ac13-race-a', 'ac13-race-b'].map((useKey) => ({ kind: 'use' as const, input: { userId: credentials.alice.id, actorUserId: credentials.alice.id, requestId: secondId, useKey, minutes: 80 } })),
    );
    expect(outcomes.map((outcome) => (outcome.ok ? outcome.status : `${outcome.httpStatus} ${outcome.code}`)).sort()).toEqual(['409 exceeds_reserved', 'used']);
    expect(getBalance(t.db, credentials.alice.id)).toMatchObject({ postedMinutes: 310, reservedMinutes: 20, availableMinutes: 290 });
    const leaves = (await call(a, 'GET', '/api/ot/leave', undefined, 200)).body;
    expect(leaves.requests.find((request: any) => request.id === secondId).consumed_minutes).toBe(80);
    const ledger3 = (await call(a, 'GET', '/api/ot/ledger', undefined, 200)).body;
    expect(ledger3.entries.filter((entry: any) => entry.delta_minutes < 0).map((entry: any) => entry.delta_minutes).sort((x: number, y: number) => x - y)).toEqual([-180, -80, -60]);

    /* ------------------------------------------------------------------ second-user isolation: swapped identifiers */
    const aliceSession = sunday1.id;
    const aliceAttempt = (attemptsOf(r1)[1] as { id: string }).id;
    const swaps: Array<[string, string, unknown?]> = [
      ['GET', `/api/sessions/${aliceSession}`],
      ['PUT', `/api/sessions/${aliceSession}`, { start: at('2026-09-27', '10:00'), end: at('2026-09-27', '11:00'), input_zone: LA, breaks: [], breaks_confirmed: true, expected_version: 1, reason: 'swap attempt' }],
      ['DELETE', `/api/sessions/${aliceSession}`, { expected_version: 1, reason: 'swap attempt' }],
      ['GET', `/api/revisions/${r1}/pdf`],
      ['POST', `/api/revisions/${r2}/resend`, {}],
      ['POST', `/api/deliveries/${aliceAttempt}/decision`, { decision: 'resend' }],
      ['GET', `/api/signatures/${signature.id}`],
      ['POST', `/api/ot/leave/${leaveId}/cancel`, { expected_version: 1 }],
      ['POST', `/api/ot/leave/${secondId}/consume`, { use_key: 'swap', minutes: 1, expected_version: 1 }],
      ['GET', `/api/shared/${credentials.alice.id}/timesheets/${P1}`],
      ['GET', `/api/shared/${credentials.alice.id}/revisions/${r1}/pdf`],
    ];
    const beforeSwaps = tableCounts();
    const capturesBeforeSwaps = capturedIds(dataDir);
    for (const [method, path, body] of swaps) {
      const response = await call(b, method, path, body);
      expect([403, 404], `Bob ${method} ${path}`).toContain(response.status);
    }
    expect(tableCounts()).toEqual(beforeSwaps);
    expect(capturedIds(dataDir)).toEqual(capturesBeforeSwaps);
    expect((await call(b, 'GET', `/api/deliveries?revision_id=${r1}`, undefined, 200)).body.deliveries).toEqual([]);
    expect((await call(b, 'GET', '/api/revisions', undefined, 200)).body.revisions).toEqual([]);
    expect((await call(b, 'GET', '/api/ot/ledger', undefined, 200)).body.entries).toEqual([]);
    expect((await call(b, 'GET', `/api/timesheets/${P1}/finalization`, undefined, 200)).body.revision ?? null).toBeNull();

    /* ------------------------------------------------------------------ overdue: warning with auto-submit off, no send */
    const schedule = getCalendar(t.db, calendarId).schedule;
    expect(formatUtcInstant(payPeriodForPayrollDate(schedule, P1, []).dueAtUtc)).toBe(P1_DUE);
    setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-10-07T00:00:00Z', reason: 'Synthetic pilot activation' });
    const capturesBeforeDeadline = capturedIds(dataDir);
    const revisionsBefore = count('SELECT count(*) FROM timesheet_revisions');
    const alicePasses = count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', credentials.alice.id);
    // The deadline run happens at a recorded instant: five minutes after the due instant.
    t.clock.set('2026-10-09T00:05:00Z');
    await runPasses(restartHandlers, 4);
    expect(listOverdueRecords(t.db, credentials.bob.id)).toEqual([{ payrollDate: P1, dueAt: P1_DUE, reason: 'auto_submit_off', recordedAt: '2026-10-09T00:05:00Z' }]);
    expect(listOverdueRecords(t.db, credentials.alice.id)).toEqual([]); // Alice's period is finalized
    // No automatic revision, PDF job or send for anybody; the only new message is Bob's own warning.
    expect(count("SELECT count(*) FROM timesheet_revisions WHERE origin = 'deadline'")).toBe(0);
    expect(count('SELECT count(*) FROM timesheet_revisions')).toBe(revisionsBefore);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', credentials.bob.id)).toBe(0);
    expect(count('SELECT count(*) FROM delivery_attempts WHERE user_id = ?', credentials.alice.id)).toBe(alicePasses);
    expect(count("SELECT count(*) FROM jobs WHERE user_id = ? AND kind IN ('render_pdf', 'send_email')", credentials.bob.id)).toBe(0);
    const warnings = listCaptured(dataDir).filter((message) => !capturesBeforeDeadline.includes(message.id));
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.metadata.envelope.to).toEqual([BOB.email]);
    expect(warnings[0]?.pdf).toBeNull();
    expect(warnings[0]?.eml).toMatch(/overdue/i);
    // A later pass records nothing twice and sends nothing more.
    t.clock.set('2026-10-09T01:00:00Z');
    await runPasses(restartHandlers, 2);
    expect(listOverdueRecords(t.db, credentials.bob.id)).toHaveLength(1);
    expect(listCaptured(dataDir)).toHaveLength(capturesBeforeDeadline.length + 1);
    expect(count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', credentials.bob.id)).toBe(0);
  });
});
