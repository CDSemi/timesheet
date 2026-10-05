import { crc32, deflateSync } from 'node:zlib';
import type { Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import {
  type BuiltServer,
  type CreatedAccount,
  createAccountByAdminApi,
  expect,
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
  await api.call(
    'POST',
    `/api/timesheets/${currentPayrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: 'Synthetic Operator', incomplete_evidence_acknowledged: true },
    201,
  );

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

  await signInPageAs(builtServer.credentials.admin, '#/admin');
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
  await page.screenshot({ path: screenshotPath(`admin-status-${project}-synthetic.png`), fullPage: true });

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

test('an employee cannot read the status routes and the Admin screen is not offered', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Admin' })).toHaveCount(0);
  for (const path of ['/api/admin/operations', '/api/admin/submissions']) {
    const status = await page.evaluate<number>(`fetch(${JSON.stringify(path)}, { credentials: 'same-origin' }).then((response) => response.status)`);
    expect(status, path).toBe(403);
  }
});
