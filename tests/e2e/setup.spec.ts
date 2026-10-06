import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { screenshotPath } from './fixtures.ts';

/*
 * First-time setup (WP4-T03). A fresh instance as the operator leaves it after `cli.js bootstrap --config`:
 * the company calendar and default policy exist, there is no administrator and one setup token was printed to
 * the terminal. The page offers the Setup screen, the token is typed by hand and goes nowhere but the one POST,
 * the administrator then signs in, and the Setup screen never returns. Own server and database per test, all
 * synthetic (example.invalid); the token and the password live only in this process.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

const OWNER_FILE = {
  schema_version: 1,
  calendar: { name: 'Synthetic company calendar', reporting_zone: 'America/Los_Angeles', normal_weekdays_iso: [1, 2, 3, 4, 5], effective_from: '2026-01-01' },
  holidays: [{ date: '2026-01-01', name: "New Year's Day" }],
  policy: {
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
    deficit_mode: 'ignore',
  },
  payroll: { anchor_payroll_date: '2026-10-02', cycle_days: 14, period_start_offset_days: -18, period_end_offset_days: -5, due_offset_days: -3, due_local_time: '17:00' },
};

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

interface SetupServer {
  origin: string;
  token: string;
  stop: () => Promise<void>;
}

/** Migrates, bootstraps from the owner file (the token is read from the CLI output, as an operator would), then serves. */
async function startUnconfiguredAdminServer(): Promise<SetupServer> {
  const work = mkdtempSync(join(tmpdir(), 'timesheet-e2e-setup-'));
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'development',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_PATH: join(work, 'timesheet.db'),
    APP_ORIGINS: origin,
    OUTBOUND_MODE: 'capture',
    MAIL_FROM: 'timesheet-capture@example.invalid',
    DATA_DIR: join(work, 'private-data'),
    JOB_RUNNER: 'off',
  };
  const file = join(work, 'company.json');
  writeFileSync(file, JSON.stringify(OWNER_FILE));
  const cli = (...args: string[]) => spawnSync(process.execPath, ['dist/server/cli.js', ...args], { cwd: REPO_ROOT, env, encoding: 'utf8' });
  const migrated = cli('migrate');
  if (migrated.status !== 0) throw new Error(`migrate failed: ${migrated.stderr}`);
  const bootstrapped = cli('bootstrap', '--config', file);
  if (bootstrapped.status !== 0) throw new Error(`bootstrap failed: ${bootstrapped.stderr}`);
  const token = bootstrapped.stdout.match(/\b[A-Z2-7]{5}(?:-[A-Z2-7]{5}){7}\b/)?.[0];
  if (token === undefined) throw new Error('bootstrap printed no setup token');
  const child: ChildProcess = spawn(process.execPath, ['dist/server/index.js'], { cwd: REPO_ROOT, env, stdio: 'ignore' });
  const stop = async () => {
    if (child.exitCode === null) {
      const exited = new Promise((resolveExit) => child.once('exit', resolveExit));
      child.kill();
      await exited;
    }
    rmSync(work, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  };
  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (child.exitCode !== null) throw new Error(`Built server exited early with ${child.exitCode}`);
      try {
        if ((await fetch(`${origin}/api/health`)).ok) return { origin, token, stop };
      } catch {
        // Not listening yet.
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
    throw new Error('Built server did not become healthy');
  } catch (error) {
    await stop();
    throw error;
  }
}

test('first-time setup creates the administrator once and never returns', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const project = testInfo.project.name;
  const server = await startUnconfiguredAdminServer();
  const password = randomBytes(18).toString('base64url');
  const email = 'first.admin@example.invalid';
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('console', (message) => {
    const unexpected = message.type() === 'error' && !message.text().includes('status of 401') && !message.text().includes('status of 403');
    expect(unexpected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
  try {
    await page.goto(`${server.origin}/`);
    await expect(page.getByRole('heading', { name: 'First-time setup' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    // The sign-in form is not offered next to it.
    await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0);
    await page.screenshot({ path: screenshotPath(`setup-${project}-synthetic.png`) });

    // A wrong token gets one plain refusal.
    await page.getByLabel('Setup token').fill('AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-FFFFF-GGGGG-HHHHH');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Display name').fill('Synthetic First Admin');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);
    await page.getByRole('button', { name: 'Create administrator' }).click();
    await expect(page.getByRole('alert')).toContainText('Setup is not available');
    await expect(page.getByRole('alert')).not.toContainText(/expired|wrong|used/i);

    // The right token, typed by hand (lower case and without dashes is accepted).
    await page.getByLabel('Setup token').fill(server.token.replaceAll('-', '').toLowerCase());
    await page.getByRole('button', { name: 'Create administrator' }).click();
    await expect(page.getByRole('status')).toContainText('Administrator created');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // The token reached the server only in the POST body: not in a URL, not in browser storage.
    expect(requests.filter((url) => url.includes(server.token) || url.includes(server.token.replaceAll('-', '')))).toEqual([]);
    expect(page.url()).not.toContain(server.token);
    const storage = await page.evaluate("JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie])");
    expect(storage).not.toContain(server.token.replaceAll('-', '').slice(0, 10));

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('button', { name: 'Sign out' })).toBeVisible();

    // Setup is closed for good: a fresh visit shows the sign-in form, and the status says so.
    await page.getByRole('banner').getByRole('button', { name: 'Sign out' }).click();
    await page.goto(`${server.origin}/`);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'First-time setup' })).toHaveCount(0);
    const status = await page.evaluate("fetch('/api/auth/setup').then((response) => response.json())");
    expect(status).toEqual({ available: false });
  } finally {
    await server.stop();
  }
});
