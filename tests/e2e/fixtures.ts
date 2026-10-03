import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { test as base, expect } from '@playwright/test';

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
}

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

async function startBuiltServer(): Promise<{ server: BuiltServer; stop: () => Promise<void> }> {
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
  return { server: { origin, credentials }, stop };
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

/* ---- Fixtures --------------------------------------------------------------- */

interface WorkerFixtures {
  builtServer: BuiltServer;
}

interface TestFixtures {
  /** Seeds data as the synthetic employee, over HTTP. */
  employeeSeed: SeedClient;
  /** Signs the page in through the real login form. */
  signInThroughUi: () => Promise<void>;
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
  employeeSeed: async ({ builtServer }, use) => {
    const { email, password } = builtServer.credentials.employee;
    await use(await new SeedClient(builtServer.origin).signIn(email, password));
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
