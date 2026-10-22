import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import type { Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import {
  type BuiltServer,
  type CreatedAccount,
  createAccountByAdminApi,
  expect,
  openAccount,
  SeedClient,
  screenshotPath,
  starterPolicyBody,
  test,
} from './fixtures.ts';

/*
 * The administrator operations status on both viewports (F-3, F-Q3 (b), WP3-T13D), through the
 * real UI of the BUILT server. A synthetic employee is created over the admin API, signs a period
 * off over HTTP (signature uploaded over HTTP, as in the review spec) and the in-process runner
 * renders the PDF and attempts the delivery in capture mode. The page must then show the pipeline
 * states, a redacted fault code and the recipient addresses, and none of the employee's private
 * content (a note, a session time, the email subject or body).
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('console', (message) => {
    expect(message.type() === 'error' && !/status of (401|403)/.test(message.text()), `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const NOTE = 'SYNTH-E2E-NOTE-5521';
const TO = 'payroll-status@example.invalid';
const CC = 'manager-status@example.invalid';

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 160x48 PNG generated at test time; no image file is committed. */
function signaturePng(): Buffer {
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
      if (Math.abs(y - (24 + Math.round(14 * Math.sin(x / 9)))) <= 1) row.fill(0x2a, 1 + x * 3, 4 + x * 3);
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

async function uploadSignature(server: BuiltServer, account: CreatedAccount): Promise<void> {
  const login = await fetch(`${server.origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: server.origin },
    body: JSON.stringify({ email: account.email, password: account.password }),
  });
  expect(login.status, 'account sign-in').toBe(200);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
  const upload = await fetch(`${server.origin}/api/signatures`, {
    method: 'POST',
    headers: { 'content-type': 'image/png', origin: server.origin, cookie },
    body: new Uint8Array(signaturePng()),
  });
  expect(upload.status, 'signature upload').toBe(201);
}

/** WP5-UX5-T01b: signing sends nothing; the person sends the signed revision with the send draft's defaults. */
async function sendSigned(api: SeedClient, revisionId: string): Promise<void> {
  const draft = await api.call<{ to: string[]; cc: string[]; subject: string; body_text: string; time_rows: boolean; ot_rows: boolean }>(
    'GET',
    `/api/revisions/${revisionId}/send-draft`,
  );
  await api.call(
    'POST',
    `/api/revisions/${revisionId}/send`,
    { request_key: randomUUID(), to: draft.to, cc: draft.cc, subject: draft.subject, body_text: draft.body_text, time_rows: draft.time_rows, ot_rows: draft.ot_rows },
    201,
  );
}

interface ApiSubmission {
  user_id: string;
  pdf: { state: string; fault_code: string | null };
  delivery: { state: string; fault_code: string | null; job_fault_code: string | null };
  recipients: { effective: { to: string[]; cc: string[] }; frozen: { to: string[]; cc: string[] } | null };
}

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

test('the admin sees pipeline states, a fault code and recipients, and no timesheet detail', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  test.setTimeout(180_000);
  const project = testInfo.project.name;
  const account = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Operator Alpha' });
  const api = await new SeedClient(builtServer.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  await api.call('POST', '/api/settings/submission', { expected_seq: 0, to: [TO], cc: [CC], auto_submit: false }, 201);
  await uploadSignature(builtServer, account);
  const [noteDay = '', workDay = ''] = await api.displayedPeriodFreeWorkdays();
  expect(workDay, 'two past free workdays in the displayed period').not.toBe('');
  await api.putDay(noteDay, { notes: NOTE });
  await api.seedCompleteDay(workDay);
  const review = await api.call<{ expected_version: number; payload_hash: string }>('GET', `/api/timesheets/${currentPayrollDate}/review`);
  const signedOff = await api.call<{ revision: { id: string } }>(
    'POST',
    `/api/timesheets/${currentPayrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: 'Synthetic Operator', incomplete_evidence_acknowledged: true },
    201,
  );
  await sendSigned(api, signedOff.revision.id);

  // The runner renders the PDF and attempts the delivery; wait for a final delivery state.
  const mine = async () => {
    const response = await adminSeed.call<{ submissions: ApiSubmission[] }>('GET', '/api/admin/submissions?limit=500');
    return response.submissions.find((row) => row.user_id === account.id);
  };
  await expect
    .poll(async () => (await mine())?.delivery.state, { timeout: 150_000, intervals: [2_000], message: 'a final delivery state' })
    .toMatch(/^(accepted|failed_permanent)$/);
  const row = await mine();
  if (row === undefined) throw new Error('the submission row is missing');
  expect(row.pdf).toEqual({ state: 'ready', fault_code: null });
  expect(row.recipients.effective).toEqual({ to: [TO], cc: [CC] });
  expect(row.recipients.frozen).toEqual({ to: [TO], cc: [CC] });

  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
  const status = page.getByRole('region', { name: 'Operations status' });
  await expect(status).toBeVisible();

  // System status: the server's own values.
  await expect(status.locator('[data-fact="sender"]')).toHaveText(/^(Configured|Not configured)$/);
  await expect(status.locator('[data-fact="mode"]')).toHaveText('Capture only (nothing leaves the server)');
  await expect(status.locator('[data-fact="runner"] [data-status="runner"]')).toHaveText('Running');
  await expect(status.locator('[data-fact="activation"]')).toHaveText('Not activated');
  await expect(status.locator('[data-delivery-state]')).toHaveCount(6);
  await expect(status.locator('[data-job-state]')).toHaveCount(5);

  // The person and period row.
  const table = page.getByRole('region', { name: 'Submissions and delivery' });
  const personRow = table.locator(`[data-submission-user="${account.id}"]`);
  await expect(personRow).toHaveCount(1);
  await expect(personRow).toContainText('Synthetic Operator Alpha');
  await expect(personRow).toContainText(currentPayrollDate);
  await expect(personRow.locator('[data-status="review"]')).toHaveText('Signed');
  await expect(personRow.locator('[data-status="pdf"]')).toHaveText('PDF ready');
  if (row.delivery.state === 'accepted') {
    await expect(personRow.locator('[data-status="delivery"]')).toHaveText('Delivered');
  } else {
    await expect(personRow.locator('[data-status="delivery"]')).toHaveText('Failed');
    await expect(personRow).toContainText(row.delivery.fault_code ?? 'unclassified');
  }
  await expect(personRow.locator('[data-recipients="effective"]')).toContainText(`To ${TO}; Cc ${CC}`);
  await expect(personRow.locator('[data-recipients="frozen"]')).toContainText(`To ${TO}; Cc ${CC}`);

  // No timesheet detail: not the note, not the session time, not the email text.
  const text = (await page.locator('main').innerText()).toLowerCase();
  for (const needle of [NOTE.toLowerCase(), 'subject', 'timesheet for', 'message-id']) {
    expect(text, `the page must not show ${needle}`).not.toContain(needle);
  }

  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await status.scrollIntoViewIfNeeded();
  await status.screenshot({ path: screenshotPath(`admin-status-panel-${project}-synthetic.png`) });
  await personRow.scrollIntoViewIfNeeded();
  await table.screenshot({ path: screenshotPath(`admin-status-table-${project}-synthetic.png`) });
  await page.screenshot({ path: screenshotPath(`admin-status-pipeline-${project}-synthetic.png`), fullPage: true });

  // Refresh keeps the same data and the page stays read-only: no write request is sent.
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') writes.push(`${request.method()} ${request.url()}`);
  });
  await status.getByRole('button', { name: 'Refresh' }).click();
  await expect(status.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  await expect(personRow).toHaveCount(1);
  expect(writes, 'refreshing sends no write request').toEqual([]);
});

/*
 * Test-only (as in history-settings.spec.ts): an uncertain delivery attempt is what a sender that died after handing the message to
 * the mail server leaves behind. No route creates one, so a child process writes it into the temporary database of the BUILT server
 * through its own database module: a send job that needs intervention and an attempt that went sending, then uncertain with the
 * fault code `lease_expired_while_sending`, copying the envelope of the person's last attempt.
 */
const SEED_UNCERTAIN_SCRIPT = `
const [dbUrl] = process.argv.slice(1, 2);
const { openDatabase } = await import(dbUrl);
const { randomUUID } = await import('node:crypto');
const env = process.env;
const db = openDatabase(env.SEED_DB_PATH);
try {
  const last = db.prepare('SELECT user_id, envelope_json, attachment_id FROM delivery_attempts WHERE revision_id = ? ORDER BY started_at DESC LIMIT 1').get(env.SEED_REVISION_ID);
  if (last === undefined) throw new Error('no delivery attempt to copy the envelope from');
  const now = new Date().toISOString().replace(/\\.\\d{3}Z$/, 'Z');
  const jobId = randomUUID();
  const attemptId = randomUUID();
  db.prepare("INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, last_error, created_at, updated_at) VALUES (?, ?, ?, 'send_email', ?, ?, 'intervention', 1, ?, 'delivery_uncertain', ?, ?)").run(jobId, last.user_id, env.SEED_REVISION_ID, 'e2e-uncertain:' + jobId, JSON.stringify({ revision_id: env.SEED_REVISION_ID }), now, now, now);
  db.prepare("INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, channel, envelope_json, attachment_id, message_id, state, started_at, updated_at) VALUES (?, ?, ?, ?, 1, 'email', ?, ?, ?, 'sending', ?, ?)").run(attemptId, jobId, last.user_id, env.SEED_REVISION_ID, last.envelope_json, last.attachment_id, '<e2e-' + attemptId + '@timesheet.invalid>', now, now);
  db.prepare("UPDATE delivery_attempts SET state = 'uncertain', provider_response = 'lease_expired_while_sending', updated_at = ? WHERE id = ?").run(now, attemptId);
  process.stdout.write(attemptId);
} finally {
  db.close();
}
`;

function seedUncertainAttempt(databasePath: string, revisionId: string): string {
  const root = resolve(import.meta.dirname, '..', '..');
  const databaseModule = pathToFileURL(join(root, 'dist', 'server', 'db', 'database.js')).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', SEED_UNCERTAIN_SCRIPT, databaseModule], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, SEED_DB_PATH: databasePath, SEED_REVISION_ID: revisionId },
  });
  if (result.status !== 0) throw new Error(`uncertain-attempt seeding failed with ${result.status}: ${result.stderr}`);
  expect(result.stdout, 'seeded attempt id').not.toBe('');
  return result.stdout;
}

/*
 * WP5-UX3-FIX3 item 6: the longest words of the "Submissions and delivery" rows, the delivery state "Delivery recorded as uncertain" and
 * the fault code `lease_expired_while_sending`, stay inside the card at 390 and 320px: the badge and the code wrap, so the table wrapper
 * does not scroll sideways (a scrollable region with no keyboard access, axe scrollable-region-focusable) and the page does not either.
 * The uncertain attempt is written by the test-only seed above, after a real sign-off and a delivered first attempt; the employee then
 * records the decision "mark delivered" through the API, which turns the badge from "Decision needed" into the long state under test.
 */
test('phone Administration: a long delivery state and a long fault code stay inside the card, with no sideways scroll at 390 and 320px', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(180_000);
  const project = testInfo.project.name;
  const account = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Operator Beta' });
  const api = await new SeedClient(builtServer.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  await api.call('POST', '/api/settings/submission', { expected_seq: 0, to: [TO], cc: [CC], auto_submit: false }, 201);
  await uploadSignature(builtServer, account);
  const [workDay = ''] = await api.displayedPeriodFreeWorkdays();
  expect(workDay, 'a past free workday in the displayed period').not.toBe('');
  await api.seedCompleteDay(workDay);
  const review = await api.call<{ expected_version: number; payload_hash: string }>('GET', `/api/timesheets/${currentPayrollDate}/review`);
  const signed = await api.call<{ revision: { id: string } }>(
    'POST',
    `/api/timesheets/${currentPayrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: 'Synthetic Operator', incomplete_evidence_acknowledged: true },
    201,
  );
  await sendSigned(api, signed.revision.id);
  const mine = async () => (await adminSeed.call<{ submissions: ApiSubmission[] }>('GET', '/api/admin/submissions?limit=500')).submissions.find((row) => row.user_id === account.id);
  await expect
    .poll(async () => (await mine())?.delivery.state, { timeout: 150_000, intervals: [2_000], message: 'a final first delivery state' })
    .toMatch(/^(accepted|failed_permanent)$/);
  // Attempts are ordered by their start second: wait past it so the seeded attempt is the newest.
  await new Promise((resolveWait) => setTimeout(resolveWait, 1_500));
  const attemptId = seedUncertainAttempt(builtServer.databasePath, signed.revision.id);
  await expect.poll(async () => (await mine())?.delivery.state, { message: 'the seeded uncertain state is the latest' }).toBe('uncertain');
  await api.call('POST', `/api/deliveries/${attemptId}/decision`, { decision: 'mark_delivered' });

  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
  const card = page.getByRole('region', { name: 'Submissions and delivery' });
  const personRow = card.locator(`[data-submission-user="${account.id}"]`);
  await expect(personRow).toHaveCount(1);
  await expect(personRow.locator('[data-status="delivery"]')).toHaveText('Delivery recorded as uncertain');
  await expect(personRow.locator('.ops-code').filter({ hasText: 'lease_expired_while_sending' })).toHaveCount(1);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await personRow.scrollIntoViewIfNeeded();
    const wrap = card.locator('.table-wrap');
    const scroll = await wrap.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
    expect(scroll.scroll, `${width}px: the table wrapper has nothing to scroll sideways (${scroll.scroll} against ${scroll.client})`).toBeLessThanOrEqual(scroll.client);
    // Every word of the row (cells, badges, codes) ends inside the card.
    const outside = await card.evaluate((element, userId) => {
      const right = element.getBoundingClientRect().right;
      const row = element.querySelector(`[data-submission-user="${userId}"]`);
      if (row === null) return ['row missing'];
      return [...row.querySelectorAll('th, td, td *')]
        .filter((item) => item.getBoundingClientRect().right > right + 0.5)
        .map((item) => `${item.tagName.toLowerCase()}.${item.className} ends at ${item.getBoundingClientRect().right.toFixed(1)} past ${right.toFixed(1)}`);
    }, account.id);
    expect(outside, `${width}px: no part of the row lies past the card`).toEqual([]);
    await expectNoSidewaysScroll(page);
    await card.screenshot({ path: screenshotPath(`admin-submissions-uncertain-${width}-${project}-synthetic.png`) });
  }
});

test('an employee cannot read the status routes and the Admin screen is not offered', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Admin' })).toHaveCount(0);
  // The administration entry is in the account menu (More on a phone) for administrators only.
  const account = await openAccount(page);
  await expect(account.getByRole('link', { name: 'Settings' })).toBeVisible();
  await expect(account.getByRole('link', { name: /^Admin/ })).toHaveCount(0);
  for (const path of ['/api/admin/operations', '/api/admin/submissions']) {
    const status = await page.evaluate<number>(`fetch(${JSON.stringify(path)}, { credentials: 'same-origin' }).then((response) => response.status)`);
    expect(status, path).toBe(403);
  }
});

/*
 * Test-only: a restored instance is paused with its backed-up sends held for reconciliation, and has an old backup. No route
 * creates that state (a restore does, from the command line), so a child process writes it into the temporary database of the
 * BUILT server through its own database module: a backup recorded 30 hours ago, the pause with the reason `restored`, three
 * send jobs held for reconciliation and one reminder waiting. Counts only; no person is involved.
 */
const SEED_PAUSED_SCRIPT = `
const [dbUrl] = process.argv.slice(1, 2);
const { openDatabase } = await import(dbUrl);
const { randomUUID } = await import('node:crypto');
const db = openDatabase(process.env.SEED_DB_PATH);
const utc = (date) => date.toISOString().slice(0, 19) + 'Z';
try {
  const now = new Date();
  const backupAt = utc(new Date(now.getTime() - 30 * 3600 * 1000));
  db.prepare("UPDATE operations_state SET backup_last_outcome = 'succeeded', backup_last_attempt_at = ?, backup_last_success_at = ? WHERE id = 1").run(backupAt, backupAt);
  db.prepare("UPDATE operations_state SET outbound_paused_at = ?, outbound_paused_reason = 'restored' WHERE id = 1").run(utc(now));
  const insert = db.prepare("INSERT INTO jobs (id, kind, business_key, payload_json, state, attempts, next_run_at, last_error, created_at, updated_at) VALUES (?, ?, ?, '{}', ?, 0, ?, ?, ?, ?)");
  for (let index = 0; index < 3; index += 1) {
    const id = randomUUID();
    insert.run(id, 'send_email', 'e2e-held:' + id, 'intervention', utc(now), 'reconcile_after_restore', utc(now), utc(now));
  }
  const waiting = randomUUID();
  insert.run(waiting, 'send_reminder', 'e2e-waiting:' + waiting, 'queued', utc(now), null, utc(now), utc(now));
} finally {
  db.close();
}
`;

function seedPausedInstance(databasePath: string): void {
  const databaseModule = pathToFileURL(join(resolve(import.meta.dirname, '..', '..'), 'dist', 'server', 'db', 'database.js')).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', SEED_PAUSED_SCRIPT, databaseModule], {
    cwd: resolve(import.meta.dirname, '..', '..'),
    encoding: 'utf8',
    env: { ...process.env, SEED_DB_PATH: databasePath },
  });
  if (result.status !== 0) throw new Error(`paused-instance seeding failed with ${result.status}: ${result.stderr}`);
}

test('a paused instance shows why, how many sends are held, an old backup and the disk space', async ({ page, privateServer }, testInfo) => {
  const project = testInfo.project.name;
  seedPausedInstance(privateServer.databasePath);
  await page.goto(`${privateServer.origin}/#/settings/admin`);
  await page.getByLabel('Email').fill(privateServer.credentials.admin.email);
  await page.getByLabel('Password').fill(privateServer.credentials.admin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();

  const status = page.getByRole('region', { name: 'Operations status' });
  const banner = status.getByRole('status', { name: 'Outbound delivery paused' });
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('heading', { name: 'Outbound delivery is paused' })).toBeVisible();
  await expect(banner.locator('[data-pause="reason"]')).toContainText('restored from a backup');
  await expect(banner.locator('[data-pause-count="Held for reconciliation"]')).toHaveText('3');
  await expect(banner.locator('[data-pause-count="Waiting"]')).toHaveText('1');
  await expect(banner.locator('[data-pause-count="Awaiting a decision"]')).toHaveText('0');

  // The backup is 30 hours old: a warning with text, not only colour.
  const backup = status.locator('[data-fact="backup"] [data-status="backup"]');
  await expect(backup).toHaveText('Last backup 30 hours ago');
  await expect(backup).toHaveClass(/badge-warn/);
  await expect(status.locator('[data-fact="backup"]')).toContainText('Older than 26 hours');
  await expect(status.locator('[data-fact="disk"]')).toHaveText(/ free of .+ \(\d+% free\)/);
  await expect(status.locator('[data-fact="mode"]')).toHaveText('Capture only (nothing leaves the server)');

  // Nothing of a person: counts and codes only.
  const text = (await status.innerText()).toLowerCase();
  for (const needle of ['@', 'e2e-held', 'private-data']) expect(text, `the panel must not show ${needle}`).not.toContain(needle);

  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await status.scrollIntoViewIfNeeded();
  await status.screenshot({ path: screenshotPath(`admin-status-${project}-synthetic.png`) });
});
