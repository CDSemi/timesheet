import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { type Page, test as base, expect } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { syntheticSignaturePng } from '../../src/server/seed.ts';

/*
 * Browser-test harness. One worker gets one BUILT server (dist/) on a free loopback port and a
 * fresh SQLite file in a temporary directory outside the repository (and so outside Dropbox).
 * Seed passwords are generated at run time and live only in this process and the child
 * environment. Data are created over HTTP, relative to the real clock: production code has
 * no clock override, and a test never seeds today or a future day (a session cannot end in
 * the future). All child Node processes use process.execPath, never a bare `node`.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const READY_ATTEMPTS = 100;

export type Role = 'employee' | 'admin';

export interface BuiltServer {
  origin: string;
  credentials: Record<Role, { email: string; password: string }>;
  /** The temporary SQLite file; only the test-only credit seeding opens it besides the server. */
  databasePath: string;
  /** The private data directory (files, signatures, PDFs, mail capture), beside the database and outside the repository. */
  dataDir: string;
  /** The environment of the server process, for the CLI run against the same database (never logged). */
  env: NodeJS.ProcessEnv;
}

/** The synthetic capture sender of every harness server (example.invalid; nothing is ever sent). */
export const CAPTURE_SENDER = 'timesheet-capture@example.invalid';

export const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR ?? join(tmpdir(), 'timesheet-e2e-screenshots');

/** Where a named screenshot goes; names must end in `-synthetic.png` (privacy hook). */
export function screenshotPath(name: string): string {
  if (!name.endsWith('-synthetic.png')) throw new Error(`Screenshot ${name} must end in -synthetic.png`);
  return join(SCREENSHOT_DIR, name);
}

function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => (typeof address === 'object' && address !== null ? resolvePort(address.port) : reject(new Error('No port'))));
    });
  });
}

function runCli(command: string, env: NodeJS.ProcessEnv): void {
  const result = spawnSync(process.execPath, ['dist/server/cli.js', command], { cwd: REPO_ROOT, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`cli ${command} failed with ${result.status}: ${result.stderr}`);
}

async function waitUntilHealthy(origin: string, child: ChildProcess): Promise<void> {
  for (let attempt = 0; attempt < READY_ATTEMPTS; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Built server exited early with ${child.exitCode}`);
    try {
      if ((await fetch(`${origin}/api/health`)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error('Built server did not become healthy');
}

interface StartOptions {
  /** False switches the server's own job runner off (JOB_RUNNER=off): the CLI `run-jobs` then drives every job. */
  runner?: boolean;
}

async function startBuiltServer(options: StartOptions = {}): Promise<{ server: BuiltServer; stop: () => Promise<void> }> {
  const work = mkdtempSync(join(tmpdir(), 'timesheet-e2e-'));
  const fromRepo = relative(REPO_ROOT, work);
  // On Windows a different drive makes relative() return an absolute path.
  if (!isAbsolute(fromRepo) && !fromRepo.startsWith('..')) throw new Error('The test database must live outside the repository');
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const credentials = {
    employee: { email: 'employee@example.invalid', password: randomBytes(18).toString('base64url') },
    admin: { email: 'admin@example.invalid', password: randomBytes(18).toString('base64url') },
  };
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'development',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_PATH: join(work, 'timesheet.db'),
    APP_ORIGINS: origin,
    // Capture mode with a synthetic sender, so a first delivery attempt is `accepted` into the capture folder.
    OUTBOUND_MODE: 'capture',
    MAIL_FROM: CAPTURE_SENDER,
    DATA_DIR: join(work, 'private-data'),
    ...(options.runner === false ? { JOB_RUNNER: 'off' } : {}),
    SEED_ADMIN_PASSWORD: credentials.admin.password,
    SEED_EMPLOYEE_PASSWORD: credentials.employee.password,
  };
  let child: ChildProcess | undefined;
  const stop = async () => {
    if (child !== undefined && child.exitCode === null) {
      const exited = new Promise((resolveExit) => child?.once('exit', resolveExit));
      child.kill();
      await exited;
    }
    rmSync(work, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  };
  try {
    runCli('migrate', env);
    runCli('seed', env);
    child = spawn(process.execPath, ['dist/server/index.js'], { cwd: REPO_ROOT, env, stdio: 'ignore' });
    await waitUntilHealthy(origin, child);
  } catch (error) {
    await stop();
    throw error;
  }
  return { server: { origin, credentials, databasePath: env.DATABASE_PATH ?? '', dataDir: join(work, 'private-data'), env }, stop };
}

/* ---- Deterministic job runs and capture inspection ------------------------------- */

export interface RunSummary {
  claimed: number;
  succeeded: number;
  retried: number;
  intervention: number;
  lost: number;
}

/** A UTC instant in the form the CLI takes (whole seconds, trailing Z). */
export function utcInstant(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Runs every due job once at the fixed instant `now` through the production CLI
 * (`run-jobs --once --now`) against the server's database and capture folder. Nothing runs in the
 * background: the CLI migrates, runs the due jobs and exits. Capture mode only.
 */
export function runJobsAt(server: BuiltServer, now: Date): RunSummary {
  const result = spawnSync(process.execPath, ['dist/server/cli.js', 'run-jobs', '--once', '--now', utcInstant(now)], {
    cwd: REPO_ROOT,
    env: server.env,
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`run-jobs failed with ${result.status}: ${result.stderr}`);
  return JSON.parse(result.stdout) as RunSummary;
}

/**
 * Drains the runner at `start`, then at later instants: the PDF job and the send job of a revision are
 * enqueued in the same second (a send claimed before its PDF is retried a minute later), and the
 * reminder scan runs once per five-minute bucket, so the notices that follow a submission need passes
 * in a later bucket.
 */
export function drainJobsFrom(server: BuiltServer, start: Date): RunSummary[] {
  return [0, 120, 240, 600, 720, 840].map((offsetSeconds) => runJobsAt(server, new Date(start.getTime() + offsetSeconds * 1000)));
}

export interface CapturedMessage {
  files: string[];
  /** The decoded message text (headers and quoted-printable or plain body; attachments left encoded). */
  eml: string;
  metadata: Record<string, unknown>;
  /** The captured attachment, or null when the message has none. */
  pdf: Buffer | null;
}

/** Reads the capture folder of a delivery attempt (private data directory, never served over HTTP). */
export function readCapture(server: BuiltServer, attemptId: string): CapturedMessage {
  const folder = join(server.dataDir, 'mail-capture', attemptId);
  const files = readdirSync(folder).sort();
  return {
    files,
    eml: readFileSync(join(folder, 'message.eml'), 'utf8'),
    metadata: JSON.parse(readFileSync(join(folder, 'metadata.json'), 'utf8')) as Record<string, unknown>,
    pdf: files.includes('attachment.pdf') ? readFileSync(join(folder, 'attachment.pdf')) : null,
  };
}

/* ---- Test-only credit seeding ------------------------------------------------ */

/*
 * By design no public route creates an OT credit (WP3 finalization will). So that the OT specs
 * have an available balance, a child process (process.execPath) posts one synthetic credit
 * through the internal ledger service of the BUILT server code, into the temporary database.
 * SQLite WAL plus the 5 s busy timeout make this safe next to the running server. This is test
 * code only: no production route or flag exists, and nothing infers an opening balance.
 */
const SEED_CREDIT_SCRIPT = `
const [dbUrl, ledgerUrl, clockUrl] = process.argv.slice(1, 4);
const { openDatabase } = await import(dbUrl);
const { postCredit } = await import(ledgerUrl);
const { systemClock } = await import(clockUrl);
const env = process.env;
const db = openDatabase(env.SEED_DB_PATH);
try {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(env.SEED_USER_EMAIL);
  if (user === undefined) throw new Error('seed user not found');
  const result = postCredit({ db, clock: systemClock }, {
    userId: user.id,
    sourceKey: env.SEED_SOURCE_KEY,
    actorUserId: null,
    origin: 'system',
    reason: env.SEED_REASON,
    workDate: env.SEED_WORK_DATE,
    minutes: Number(env.SEED_MINUTES),
  });
  process.stdout.write(result.status);
} finally {
  db.close();
}
`;

/** Posts one synthetic credit of `minutes` for the synthetic employee; each call has its own setup key. */
export function seedCredit(server: BuiltServer, minutes: number, workDate = '2020-01-06'): void {
  const dist = (file: string) => pathToFileURL(join(REPO_ROOT, 'dist', 'server', file)).href;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', SEED_CREDIT_SCRIPT, dist('db/database.js'), dist('services/ledger.js'), dist('clock.js')],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        SEED_DB_PATH: server.databasePath,
        SEED_USER_EMAIL: server.credentials.employee.email,
        SEED_SOURCE_KEY: `e2e-setup-credit-${randomBytes(8).toString('hex')}`,
        SEED_REASON: 'Synthetic e2e setup credit (test only)',
        SEED_WORK_DATE: workDate,
        SEED_MINUTES: String(minutes),
      },
    },
  );
  if (result.status !== 0) throw new Error(`credit seeding failed with ${result.status}: ${result.stderr}`);
  expect(result.stdout, 'credit seeding status').toBe('posted');
}

/* ---- Test-only second calendar ------------------------------------------------ */

/*
 * No public route creates a calendar (the admin API configures the existing one), yet the
 * calendar_in_use refusal needs a second calendar to move an account to. As with the credit
 * seeding above, a child process (process.execPath) calls the internal service of the BUILT server
 * code, here createCalendar, with a copy of the existing schedule. Test code only.
 */
const SEED_CALENDAR_SCRIPT = `
const [dbUrl, calendarsUrl, clockUrl] = process.argv.slice(1, 4);
const { openDatabase } = await import(dbUrl);
const { createCalendar } = await import(calendarsUrl);
const { systemClock } = await import(clockUrl);
const env = process.env;
const db = openDatabase(env.SEED_DB_PATH);
try {
  process.stdout.write(createCalendar(db, systemClock, { name: env.SEED_CALENDAR_NAME, schedule: JSON.parse(env.SEED_SCHEDULE) }, null));
} finally {
  db.close();
}
`;

export interface CalendarSchedule {
  reportingZone: string;
  anchorPayrollDate: string;
  cycleDays: number;
  periodStartOffsetDays: number;
  periodEndOffsetDays: number;
  dueOffsetDays: number;
  dueLocalTime: string;
}

/** Creates a second calendar with the given schedule in the temporary database and returns its id. */
export function seedSecondCalendar(server: BuiltServer, schedule: CalendarSchedule): string {
  const dist = (file: string) => pathToFileURL(join(REPO_ROOT, 'dist', 'server', file)).href;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', SEED_CALENDAR_SCRIPT, dist('db/database.js'), dist('services/calendars.js'), dist('clock.js')],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        SEED_DB_PATH: server.databasePath,
        SEED_CALENDAR_NAME: 'Second calendar (synthetic)',
        SEED_SCHEDULE: JSON.stringify(schedule),
      },
    },
  );
  if (result.status !== 0) throw new Error(`calendar seeding failed with ${result.status}: ${result.stderr}`);
  expect(result.stdout, 'calendar seeding id').not.toBe('');
  return result.stdout;
}

/* ---- Seeding over HTTP ----------------------------------------------------- */

interface PeriodsResponse {
  reporting_zone: string;
  today_local: string;
  current: { payroll_date: string };
  in_progress: { payroll_date: string };
}

/** The slice of a day view the specs read back through the API. */
export interface SeededDay {
  work_date: string;
  category: string;
  category_source: string;
  leave_minutes: number;
  leave_kind: string | null;
  wfh: boolean;
  notes?: string;
  ot_leave: { kind_minutes: number; consumed_minutes: number; reversed_minutes: number; mismatch: boolean };
  entry: { version: number; notes: string } | null;
  calculation: { status: string; regular_minutes: number | null; credited_minutes: number | null } | null;
  sessions: Array<{
    id: string;
    source: string;
    start_utc: string;
    end_utc: string | null;
    input_zone: string;
    breaks_confirmed: boolean;
    breaks: Array<{ id: string; start_utc: string; end_utc: string }>;
    version: number;
  }>;
}

interface TimesheetResponse {
  reason_required: boolean;
  days: Array<{ work_date: string; classification: { day_class: 'normal' | 'nonworking' } | null; sessions: unknown[] }>;
}

export class SeedClient {
  readonly origin: string;
  private cookie = '';

  constructor(origin: string) {
    this.origin = origin;
  }

  async signIn(email: string, password: string): Promise<this> {
    const response = await this.raw('POST', '/api/auth/login', { email, password });
    this.cookie = (response.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
    expect(response.status, 'seed sign-in').toBe(200);
    return this;
  }

  private raw(method: string, path: string, body?: unknown): Promise<Response> {
    const headers: Record<string, string> = { origin: this.origin };
    if (this.cookie !== '') headers.cookie = this.cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    return fetch(`${this.origin}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  }

  /**
   * Uploads a generated signature image as this account (the route takes a raw image body). With
   * `authorizeAutoImage` the upload also records the explicit automatic-image consent (settings must exist).
   */
  async uploadSignature(png: Buffer, authorizeAutoImage = false): Promise<string> {
    const headers: Record<string, string> = { origin: this.origin, 'content-type': 'image/png' };
    if (this.cookie !== '') headers.cookie = this.cookie;
    const query = authorizeAutoImage ? '?authorize_auto_image=true' : '';
    const response = await fetch(`${this.origin}/api/signatures${query}`, { method: 'POST', headers, body: new Uint8Array(png) });
    expect(response.status, 'signature upload').toBe(201);
    return ((await response.json()) as { signature: { id: string } }).signature.id;
  }

  /** A binary GET (a PDF download) as this account: status, the headers and the bytes. */
  async download(path: string): Promise<{ status: number; headers: Headers; body: Buffer }> {
    const response = await this.raw('GET', path);
    return { status: response.status, headers: response.headers, body: Buffer.from(await response.arrayBuffer()) };
  }

  async call<T>(method: string, path: string, body?: unknown, expectedStatus = 200): Promise<T> {
    const response = await this.raw(method, path, body);
    const text = await response.text();
    expect(response.status, `${method} ${path}: ${text}`).toBe(expectedStatus);
    return JSON.parse(text) as T;
  }

  /**
   * Past normal workdays without a recorded session, newest first, from the periods the API
   * reports for today. Periods that need an edit reason are skipped, so a seed never needs one.
   */
  async pastFreeWorkdays(): Promise<string[]> {
    const periods = await this.call<PeriodsResponse>('GET', '/api/periods/current');
    const payrollDates = [...new Set([periods.in_progress.payroll_date, periods.current.payroll_date])];
    const found: string[] = [];
    for (const payrollDate of payrollDates) {
      const sheet = await this.call<TimesheetResponse>('GET', `/api/timesheets/${payrollDate}`);
      if (sheet.reason_required) continue;
      for (const day of sheet.days) {
        if (day.work_date < periods.today_local && day.classification?.day_class === 'normal' && day.sessions.length === 0) {
          found.push(day.work_date);
        }
      }
    }
    return [...new Set(found)].sort().reverse();
  }

  /** Today in the reporting zone, the reporting zone itself and the payroll date of the displayed period. */
  async today(): Promise<{ todayLocal: string; reportingZone: string; currentPayrollDate: string }> {
    const periods = await this.call<PeriodsResponse>('GET', '/api/periods/current');
    return { todayLocal: periods.today_local, reportingZone: periods.reporting_zone, currentPayrollDate: periods.current.payroll_date };
  }

  /**
   * Past normal workdays without a session in the period the app displays first (the current
   * payroll period), newest first. Unlike pastFreeWorkdays it never returns another period's days.
   */
  async displayedPeriodFreeWorkdays(): Promise<string[]> {
    const { todayLocal, currentPayrollDate } = await this.today();
    const sheet = await this.call<TimesheetResponse>('GET', `/api/timesheets/${currentPayrollDate}`);
    return sheet.days
      .filter((day) => day.work_date < todayLocal && day.classification?.day_class === 'normal' && day.sessions.length === 0)
      .map((day) => day.work_date)
      .sort()
      .reverse();
  }

  async dayView(workDate: string): Promise<SeededDay> {
    return this.call<SeededDay>('GET', `/api/days/${workDate}`);
  }

  /** Deletes every session of a date (a test's cleanup); the reason covers old periods. */
  async clearSessions(workDate: string, reason = 'e2e cleanup'): Promise<void> {
    for (const session of (await this.dayView(workDate)).sessions) {
      await this.call('DELETE', `/api/sessions/${session.id}`, { expected_version: session.version, reason });
    }
  }

  /** Saves a day entry as the employee (a change made behind the UI's back, or a seed). */
  async putDay(workDate: string, fields: Record<string, unknown>): Promise<void> {
    const day = await this.dayView(workDate);
    await this.call('PUT', `/api/days/${workDate}`, {
      category: 'Worked',
      leave_minutes: 0,
      leave_kind: null,
      wfh: false,
      notes: '',
      reason: 'e2e seed',
      ...fields,
      expected_version: day.entry?.version ?? null,
    });
  }

  /** Puts a day entry back to a plain worked day without leave (a test's cleanup). */
  async resetDay(workDate: string): Promise<void> {
    await this.putDay(workDate, {});
  }

  /** Clock in and straight out (breaks confirmed none): a clock-source session today. */
  async seedClockSessionToday(): Promise<{ workDate: string; sessionId: string }> {
    const started = await this.call<{ session: { id: string; work_date: string; version: number } }>(
      'POST',
      '/api/clock/in',
      { input_zone: 'America/Los_Angeles' },
      201,
    );
    // A session needs a positive length; wait past one second before ending it.
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_500));
    await this.call('POST', '/api/clock/out', {
      breaks: [],
      breaks_confirmed: true,
      expected_version: started.session.version,
    });
    return { workDate: started.session.work_date, sessionId: started.session.id };
  }

  /** Commits a batch category change as the employee (a change made behind the UI's back). */
  async commitCategory(workDate: string, category: string, expectedVersion: number | null): Promise<void> {
    await this.call('POST', '/api/days/batch', {
      mode: 'commit',
      entries: [{ work_date: workDate, category, expected_version: expectedVersion }],
    });
  }

  /** A manual session in America/Los_Angeles with the given breaks (all unpaid). */
  async createSession(
    workDate: string,
    start: string,
    end: string,
    breaks: ReadonlyArray<readonly [string, string]> | null,
  ): Promise<void> {
    const at = (time: string) => ({ local: `${workDate}T${time}`, zone: 'America/Los_Angeles' });
    await this.call(
      'POST',
      `/api/days/${workDate}/sessions`,
      {
        start: at(start),
        end: at(end),
        input_zone: 'America/Los_Angeles',
        breaks_confirmed: breaks !== null,
        breaks: (breaks ?? []).map(([from, to]) => ({ start: at(from), end: at(to), counts_as_work: false })),
      },
      201,
    );
  }

  /** 09:00-18:00 with three unpaid breaks (the smoke-test day): 8 h regular on a normal day. */
  async seedCompleteDay(workDate: string): Promise<void> {
    await this.createSession(workDate, '09:00', '18:00', [
      ['11:00', '11:15'],
      ['13:00', '13:30'],
      ['15:30', '15:45'],
    ]);
  }

  /** A day whose breaks were never confirmed: it counts as pending evidence, not complete. */
  async seedUnconfirmedBreaksDay(workDate: string): Promise<void> {
    await this.createSession(workDate, '09:00', '18:30', null);
  }
}

/* ---- Admin-created accounts and in-page requests ------------------------------- */

export interface CreatedAccount {
  id: string;
  email: string;
  displayName: string;
  /** Generated at run time; it lives only in this process. */
  password: string;
}

/** The synthetic starting policy of the Settings screen (8 h required, three unpaid breaks, 9 h reference day). */
export function starterPolicyBody(effectiveFrom: string): Record<string, unknown> {
  return {
    effective_from: effectiveFrom,
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
    deficit_mode: 'ignore',
  };
}

/** Creates an account through the admin API with a run-time generated temporary password. */
export async function createAccountByAdminApi(
  admin: SeedClient,
  options: { role?: 'employee' | 'admin'; calendarId?: string; displayName?: string } = {},
): Promise<CreatedAccount> {
  const calendar = await admin.call<{ id: string }>('GET', '/api/calendar');
  const email = `synthetic-${randomBytes(5).toString('hex')}@example.invalid`;
  const password = randomBytes(18).toString('base64url');
  const displayName = options.displayName ?? 'Synthetic Person';
  const created = await admin.call<{ user: { id: string } }>(
    'POST',
    '/api/admin/users',
    {
      email,
      display_name: displayName,
      role: options.role ?? 'employee',
      password,
      calendar_id: options.calendarId ?? calendar.id,
    },
    201,
  );
  return { id: created.user.id, email, displayName, password };
}

/* ---- A synthetic person with settings and a signature ----------------------------- */

export interface Person {
  account: CreatedAccount;
  api: SeedClient;
  todayLocal: string;
  /** The payroll date of the period the app displays first (the current, not yet due period). */
  payrollDate: string;
}

export interface PersonOptions {
  displayName?: string;
  to?: string[];
  cc?: string[];
  /** The auto-submit switch (default off, so a manual flow is never swept by the deadline scan). */
  autoSubmit?: boolean;
  autoNote?: { enabled: boolean; text?: string };
  /** A generated signature image; `authorized` also records the consent for automatic submissions. */
  signature?: 'saved' | 'authorized' | 'none';
  /** The signature image phase (each value is a different file). */
  signaturePhase?: number;
}

/**
 * A fresh account (admin API) with a starting policy, saved submission settings on example.invalid and
 * optionally a generated signature. Everything is over HTTP; the synthetic PNG is generated at run time.
 */
export async function newPerson(adminSeed: SeedClient, server: BuiltServer, options: PersonOptions = {}): Promise<Person> {
  const account = await createAccountByAdminApi(adminSeed, { displayName: options.displayName ?? 'Synthetic Person' });
  const api = await new SeedClient(server.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  await api.call(
    'POST',
    '/api/settings/submission',
    {
      expected_seq: 0,
      to: options.to ?? ['payroll-synthetic@example.invalid'],
      cc: options.cc ?? [],
      auto_submit: options.autoSubmit ?? false,
      ...(options.autoNote === undefined
        ? {}
        : { auto_note_enabled: options.autoNote.enabled, ...(options.autoNote.text === undefined ? {} : { auto_note_text: options.autoNote.text }) }),
    },
    201,
  );
  const signature = options.signature ?? 'saved';
  if (signature !== 'none') await api.uploadSignature(syntheticSignaturePng(options.signaturePhase ?? 9), signature === 'authorized');
  return { account, api, todayLocal, payrollDate: currentPayrollDate };
}

/** The HTTP status of a same-origin request made by the page itself, with the page's own session cookie. */
export async function statusInPage(page: Page, method: string, path: string, body?: unknown): Promise<number> {
  const init = {
    method,
    credentials: 'same-origin',
    ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  };
  return page.evaluate<number>(`fetch(${JSON.stringify(path)}, ${JSON.stringify(init)}).then((response) => response.status)`);
}

/* ---- Fixtures --------------------------------------------------------------- */

interface WorkerFixtures {
  builtServer: BuiltServer;
}

interface TestFixtures {
  /** Seeds data as the synthetic employee, over HTTP. */
  employeeSeed: SeedClient;
  /** Seeds data as the synthetic admin, over HTTP. */
  adminSeed: SeedClient;
  /**
   * A fresh built server of this test alone (own database, own data directory), for flows that change
   * system-wide state: the automation activation and a run-jobs clock that jumps past a deadline.
   * The shared worker server must never see those. Its own job runner is off, so the CLI `run-jobs`
   * is the only runner (deterministic, no lease race). Stopped and removed after the test.
   */
  privateServer: BuiltServer;
  /** Signs the page in through the real login form. */
  signInThroughUi: () => Promise<void>;
  /** Signs the page in through the real login form as any account; an optional hash (`#/settings`) is the first screen. */
  signInPageAs: (credentials: { email: string; password: string }, startHash?: string) => Promise<void>;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  builtServer: [
    // Playwright requires the first fixture argument to be an object pattern.
    async ({}, use) => {
      const { server, stop } = await startBuiltServer();
      try {
        await use(server);
      } finally {
        await stop();
      }
    },
    { scope: 'worker', timeout: 60_000 },
  ],
  baseURL: async ({ builtServer }, use) => {
    await use(builtServer.origin);
  },
  privateServer: [
    async ({}, use) => {
      const { server, stop } = await startBuiltServer({ runner: false });
      try {
        await use(server);
      } finally {
        await stop();
      }
    },
    { timeout: 60_000 },
  ],
  employeeSeed: async ({ builtServer }, use) => {
    const { email, password } = builtServer.credentials.employee;
    await use(await new SeedClient(builtServer.origin).signIn(email, password));
  },
  adminSeed: async ({ builtServer }, use) => {
    const { email, password } = builtServer.credentials.admin;
    await use(await new SeedClient(builtServer.origin).signIn(email, password));
  },
  signInPageAs: async ({ page }, use) => {
    await use(async ({ email, password }, startHash = '') => {
      // The hash survives the sign-in, so a screen can be the first one the app renders.
      await page.goto(`/${startHash}`);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();
    });
  },
  signInThroughUi: async ({ page, builtServer }, use) => {
    await use(async () => {
      const { email, password } = builtServer.credentials.employee;
      await page.goto('/');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();
    });
  },
});

export { expect };
