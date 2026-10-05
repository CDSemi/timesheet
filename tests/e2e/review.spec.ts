import { crc32, deflateSync } from 'node:zlib';
import { type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { formatDuration } from '../../src/domain/format.ts';
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
 * Review and sign-off screen on both viewports: the exact review content, the sign-off, a stale
 * review that leads to a fresh one, the deep link through the sign-in form, and the refusals.
 * Every test gets its own synthetic account (created over the admin API), so signing a period
 * off never changes what another test sees. Data are synthetic (example.invalid addresses, a
 * generated image, days relative to today). The signature is uploaded over HTTP because the
 * upload screen belongs to a later task.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  // A CSP violation shows up as a console error; the signed-out probe (401) and the refusals
  // these tests provoke on purpose (404, 409, 422) are the only expected resource errors.
  page.on('console', (message) => {
    const expected = /status of (401|404|409|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

/* ---- Synthetic image and account ------------------------------------------------------- */

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 160x48 PNG (dark strokes on white) generated at test time; no image file is committed. */
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
      const stroke = Math.abs(y - (24 + Math.round(14 * Math.sin(x / 9)))) <= 1;
      if (stroke) row.fill(0x2a, 1 + x * 3, 4 + x * 3);
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

/** Uploads the signature image as the account (the route takes a raw image body, not JSON). */
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

interface Reviewer {
  account: CreatedAccount;
  api: SeedClient;
  payrollDate: string;
  /** Past free workdays of the displayed period, newest first. */
  days: string[];
}

interface ReviewOptions {
  deficitMode?: 'ignore' | 'auto_deduct' | 'choose_at_signoff';
  /** Recipients saved in the submission settings (the default has none). */
  to?: string[];
}

/** A fresh account with a policy, recipients and a saved signature, plus the period it will review. */
async function newReviewer(adminSeed: SeedClient, server: BuiltServer, options: ReviewOptions = {}): Promise<Reviewer> {
  const account = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Reviewer' });
  const api = await new SeedClient(server.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call(
    'POST',
    '/api/policies',
    { ...starterPolicyBody(addDays(todayLocal, -400)), deficit_mode: options.deficitMode ?? 'ignore' },
    201,
  );
  await api.call(
    'POST',
    '/api/settings/submission',
    { expected_seq: 0, to: options.to ?? ['payroll@example.invalid'], cc: [], auto_submit: false },
    201,
  );
  await uploadSignature(server, account);
  const days = await api.displayedPeriodFreeWorkdays();
  return { account, api, payrollDate: currentPayrollDate, days };
}

interface ApiReview {
  payload: {
    days: Array<{ work_date: string; calculation: { regular_minutes: number | null; nonworking_minutes: number | null; credited_minutes: number | null } | null }>;
    totals: { credited_minutes: number; pending_days: number };
    ot_proposals: Array<{ work_date: string; credited_minutes: number }>;
    deficit_proposals: Array<{ work_date: string; mode: string; deficit_minutes: number }>;
    unresolved_inputs: Array<{ work_date: string; reason: string }>;
    recipients: { to: string[]; subject: string };
  };
  payload_hash: string;
  expected_version: number;
}

interface ApiFinalization {
  finalized_revision_no: number | null;
  revision: { revision_no: number; review_state: string; origin: string; send_requested: boolean } | null;
  signoff: { signer_name: string } | null;
}

const reviewPath = (payrollDate: string) => `/api/timesheets/${payrollDate}/review`;
const finalizationPath = (payrollDate: string) => `/api/timesheets/${payrollDate}/finalization`;

async function signInAt(page: Page, reviewer: Reviewer, hash: string) {
  await page.goto(`/${hash}`);
  await page.getByLabel('Email').fill(reviewer.account.email);
  await page.getByLabel('Password').fill(reviewer.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** Every period holds days without a record, so the review lists missing evidence and asks for this. */
async function acknowledge(page: Page) {
  await page.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ }).check();
}

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

/* ---- Tests ------------------------------------------------------------------------------ */

test('the review shows the server content for all 14 days, then the sign-off submits it', async ({
  page,
  adminSeed,
  builtServer,
}, testInfo) => {
  const project = testInfo.project.name;
  const reviewer = await newReviewer(adminSeed, builtServer);
  expect(reviewer.days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(2);
  const [completeDay = '', pendingDay = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(completeDay);
  await reviewer.api.seedUnconfirmedBreaksDay(pendingDay);
  const api = await reviewer.api.call<ApiReview>('GET', reviewPath(reviewer.payrollDate));

  // From the timesheet: the header shows Draft and links to the review.
  await signInAt(page, reviewer, '');
  await expect(page.locator('[data-status="review"]')).toHaveText('Draft');
  await page.locator(`[data-review-link="${reviewer.payrollDate}"]`).click();
  await expect(page).toHaveURL(new RegExp(`#/review/${reviewer.payrollDate}$`));
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  // The review belongs under Timesheet in the navigation.
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');

  // Exactly the server payload: 14 days, and every figure on screen is the server's own number.
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  for (const day of api.payload.days) {
    const row = page.locator(`[data-review-day="${day.work_date}"]`);
    for (const [label, minutes] of [
      ['Regular', day.calculation?.regular_minutes ?? null],
      ['Off-calendar', day.calculation?.nonworking_minutes ?? null],
      ['Credit', day.calculation?.credited_minutes ?? null],
    ] as const) {
      const cell = row.locator(`td[data-label="${label}"]`);
      await expect(cell, `${day.work_date} ${label}`).toHaveText(minutes === null ? 'none' : formatDuration(minutes));
    }
  }
  const completeRow = page.locator(`[data-review-day="${completeDay}"]`);
  await expect(completeRow).toContainText('complete');
  await expect(completeRow).toContainText('3 breaks');
  const pendingRow = page.locator(`[data-review-day="${pendingDay}"]`);
  await expect(pendingRow).toContainText('breaks unconfirmed');
  await expect(page.locator('[data-total="credited"] dd')).toHaveAttribute('data-minutes', String(api.payload.totals.credited_minutes));

  // Missing evidence, recipients and the rendered email, the signature preview.
  await expect(page.locator(`[data-unresolved="${pendingDay}"]`)).toContainText('Breaks not confirmed');
  await expect(page.locator('[data-envelope="to"] dd')).toHaveText('payroll@example.invalid');
  await expect(page.locator('[data-envelope="subject"]')).toHaveText(api.payload.recipients.subject);
  const signature = page.getByRole('img', { name: 'Your saved signature image' });
  await expect(signature).toBeVisible();
  const decoded = await page.evaluate<number>("document.querySelector('img.signature-preview').naturalWidth");
  expect(decoded, 'signature image decoded').toBeGreaterThan(0);

  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await page.screenshot({ path: screenshotPath(`review-${project}-synthetic.png`), fullPage: true });
  await page.evaluate('window.scrollTo(0, 0)');
  await page.screenshot({ path: screenshotPath(`review-top-${project}-synthetic.png`) });
  await page.getByRole('form', { name: 'Sign off' }).screenshot({ path: screenshotPath(`review-form-${project}-synthetic.png`) });

  // Required name and acknowledgement are checked before anything is sent.
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByText('Enter your name to sign off.')).toBeVisible();
  await expect(page.getByLabel('Your name')).toBeFocused();
  await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true');
  expect(posts, 'nothing is sent while the name is missing').toEqual([]);

  await page.getByLabel('Your name').fill('Synthetic Reviewer');
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByText('Acknowledge the incomplete evidence to submit with it.')).toBeVisible();
  expect(posts, 'nothing is sent while the acknowledgement is missing').toEqual([]);

  await acknowledge(page);
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Submitted' })).toBeVisible();
  expect(posts.filter((url) => url.endsWith('/signoff')), 'one sign-off request').toHaveLength(1);
  await expect(page.locator('[data-status="review"]')).toHaveText('Submitted manually');
  await expect(page.getByRole('button', { name: 'Sign off & Submit' })).toHaveCount(0);

  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.finalized_revision_no).toBe(1);
  expect(finalized.revision).toMatchObject({ revision_no: 1, review_state: 'signed', origin: 'employee', send_requested: true });
  expect(finalized.signoff?.signer_name).toBe('Synthetic Reviewer');
  await page.screenshot({ path: screenshotPath(`review-signed-${project}-synthetic.png`), fullPage: true });

  // Back on the timesheet the header carries the review and delivery status from the server.
  await page.getByRole('link', { name: 'Back to the timesheet' }).first().click();
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
  await expect(page.locator('[data-status="review"]')).toHaveText('Submitted manually');
  await expect(page.locator('[data-status="delivery"]')).toBeVisible();
  await expect(page.locator(`[data-review-link="${reviewer.payrollDate}"]`)).toHaveText('Review or correct');
  await page.screenshot({ path: screenshotPath(`review-status-${project}-synthetic.png`) });
});

test('a stale review leads to a fresh review and nothing is submitted twice', async ({ page, adminSeed, builtServer }, testInfo) => {
  const project = testInfo.project.name;
  const reviewer = await newReviewer(adminSeed, builtServer, { deficitMode: 'choose_at_signoff' });
  expect(reviewer.days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(2);
  const [shortDay = '', fullDay = ''] = reviewer.days;
  // A complete three-hour day against an eight-hour requirement: a deficit the employee decides.
  await reviewer.api.createSession(shortDay, '09:00', '12:00', []);
  await reviewer.api.seedCompleteDay(fullDay);
  const first = await reviewer.api.call<ApiReview>('GET', reviewPath(reviewer.payrollDate));
  const deficit = first.payload.deficit_proposals.find((item) => item.work_date === shortDay);
  expect(deficit, 'a choose-mode deficit on the short day').toMatchObject({ mode: 'choose_at_signoff' });

  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const deficitBox = page.locator(`[data-deficit="${shortDay}"]`);
  await expect(deficitBox).toContainText(formatDuration(deficit?.deficit_minutes ?? 0));
  await expect(deficitBox.getByRole('radio', { name: 'Deduct from my OT balance' })).not.toBeChecked();

  // The deficit choice is required before sign-off.
  await page.getByLabel('Your name').fill('Synthetic Reviewer');
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByText(`Choose deduct or waive for ${shortDay}.`)).toBeVisible();
  await deficitBox.getByRole('radio', { name: 'Deduct from my OT balance' }).check();
  await acknowledge(page);

  // Behind the page's back, the day changes: the reviewed hash and version no longer match.
  await reviewer.api.putDay(fullDay, { notes: 'Changed after the review was opened' });
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();

  const notice = page.locator('[data-notice="stale"]');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('Nothing was submitted');
  await expect(notice).toBeFocused();
  await expect(page.locator(`[data-review-day="${fullDay}"]`)).toContainText('Changed after the review was opened');
  // The old choice belonged to the old review; the typed name stays.
  await expect(deficitBox.getByRole('radio', { name: 'Deduct from my OT balance' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ })).not.toBeChecked();
  await expect(page.getByLabel('Your name')).toHaveValue('Synthetic Reviewer');
  const afterConflict = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(afterConflict.finalized_revision_no, 'the stale sign-off submitted nothing').toBeNull();
  await page.screenshot({ path: screenshotPath(`review-stale-${project}-synthetic.png`), fullPage: true });

  // Sign off again on the fresh review.
  await deficitBox.getByRole('radio', { name: 'Waive the deficit' }).check();
  await acknowledge(page);
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Submitted' })).toBeVisible();
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision).toMatchObject({ revision_no: 1, review_state: 'signed' });

  // A second window that still shows the old review cannot submit a second revision: 409.
  const replay = await reviewer.api.call<{ error: { code: string } }>(
    'POST',
    `/api/timesheets/${reviewer.payrollDate}/signoff`,
    {
      expected_version: first.expected_version,
      reviewed_hash: first.payload_hash,
      signer_name: 'Synthetic Reviewer',
      deficit_choices: [{ work_date: shortDay, choice: 'deduct' }],
      incomplete_evidence_acknowledged: true,
    },
    409,
  );
  expect(replay.error.code).toBe('already_finalized');
  const still = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(still.revision?.revision_no).toBe(1);
});

/** Another window signs the displayed review off first; returns what that window sent. */
async function signOffElsewhere(reviewer: Reviewer): Promise<void> {
  const current = await reviewer.api.call<ApiReview>('GET', reviewPath(reviewer.payrollDate));
  await reviewer.api.call(
    'POST',
    `/api/timesheets/${reviewer.payrollDate}/signoff`,
    { expected_version: current.expected_version, reviewed_hash: current.payload_hash, signer_name: 'Synthetic Reviewer', incomplete_evidence_acknowledged: true },
    201,
  );
}

test('a period finalized in another window reloads with a clear message and no second revision', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);

  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator(`[data-review-day="${day}"]`)).toContainText('complete');
  await signOffElsewhere(reviewer);

  // A different request than the one already recorded (another name): refused, never a second revision.
  await page.getByLabel('Your name').fill('Synthetic Reviewer Junior');
  await acknowledge(page);
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  const notice = page.locator('[data-notice="stale"]');
  await expect(notice).toContainText('already submitted');
  await expect(notice).toContainText('Nothing was submitted twice');
  // The fresh review now offers a correction: a reason and an explicit email choice.
  await expect(page.locator('[data-mode="correction"]')).toBeVisible();
  await expect(page.getByLabel('Reason for the correction')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Send the email' })).not.toBeChecked();
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision?.revision_no, 'still the one revision').toBe(1);
  expect(finalized.signoff?.signer_name).toBe('Synthetic Reviewer');
});

test('an identical sign-off repeated from a second window is recognised and creates nothing', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);

  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator(`[data-review-day="${day}"]`)).toContainText('complete');
  await signOffElsewhere(reviewer);

  await page.getByLabel('Your name').fill('Synthetic Reviewer');
  await acknowledge(page);
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.locator('[data-result="replayed"]')).toContainText('Nothing new was created');
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision?.revision_no, 'still the one revision').toBe(1);
});

test('a refusal from the server names the missing field', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);
  await page.route('**/api/timesheets/*/signoff', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'signer_name_required', message: 'Sign-off requires the employee name' } }),
    }),
  );
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await page.getByLabel('Your name').fill('Synthetic Reviewer');
  await acknowledge(page);
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByText('Enter your name to sign off.')).toBeVisible();
  await expect(page.getByLabel('Your name')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Submitted' })).toHaveCount(0);
});

test('a missing signature image blocks the sign-off and says where to add it', async ({ page, adminSeed, builtServer }) => {
  // An account that never uploaded an image.
  const account = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Unsigned' });
  const api = await new SeedClient(builtServer.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  await signInAt(page, { account, api, payrollDate: currentPayrollDate, days: [] }, `#/review/${currentPayrollDate}`);
  await expect(page.getByText('No signature image is saved. Upload one in Settings before you sign off.')).toBeVisible();
  await page.getByLabel('Your name').fill('Synthetic Unsigned');
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByText('Upload a signature image in Settings before you sign off.').first()).toBeVisible();
  const finalized = await api.call<ApiFinalization>('GET', finalizationPath(currentPayrollDate));
  expect(finalized.finalized_revision_no).toBeNull();
});

test('the deep link survives the sign-in form and carries no token', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);
  const link = `#/review/${reviewer.payrollDate}`;

  await page.goto(`/${link}`);
  // Signed out: the sign-in form, and the address is untouched.
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${link}$`));
  await page.getByLabel('Email').fill(reviewer.account.email);
  await page.getByLabel('Password').fill(reviewer.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  const url = new URL(page.url());
  expect(url.hash).toBe(link);
  expect(url.search, 'no query string').toBe('');
  expect(`${url.pathname}${url.search}${url.hash}`, 'no token or identifier in the address').not.toMatch(/token|key|secret|session/i);

  // Reloading the page keeps the same review (the session cookie, not the address, carries the login).
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
});

test('an address that is not a payroll date of this account is refused without data', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, '#/review/2020-01-01');
  await expect(page.getByText('No such period for your account.')).toBeVisible();
  await expect(page.locator('[data-review-day]')).toHaveCount(0);

  // Something that is not a date at all falls back to the timesheet, like any unknown address.
  await page.evaluate("window.location.hash = '#/review/not-a-date'");
  await expect(page).toHaveURL(/#\/timesheet$/);
});

test("the review shows the signed-in account's own data and an unknown image id is refused", async ({ page, adminSeed, builtServer, employeeSeed }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const other = await employeeSeed.today();
  // The page's own session is the reviewer's; the seeded employee's data never appear.
  await signInAt(page, reviewer, `#/review/${other.currentPayrollDate}`);
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  await expect(page.locator('[data-envelope="to"] dd')).toHaveText('payroll@example.invalid');
  await expect(page.getByText('Name on file: Synthetic Reviewer.')).toBeVisible();
  const status = await page.evaluate<number>(
    "fetch('/api/signatures/00000000-0000-4000-8000-000000000000').then((response) => response.status)",
  );
  expect(status).toBe(404);
});

test('mobile: the review fits the width and every control is at least 44px', async ({ page, adminSeed, builtServer }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  const reviewer = await newReviewer(adminSeed, builtServer, { deficitMode: 'choose_at_signoff' });
  const [shortDay = '', pendingDay = ''] = reviewer.days;
  await reviewer.api.createSession(shortDay, '09:00', '12:00', []);
  await reviewer.api.seedUnconfirmedBreaksDay(pendingDay);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  await expect(page.locator(`[data-deficit="${shortDay}"]`)).toBeVisible();
  await expectNoSidewaysScroll(page);

  const targets = page.locator('button, a[href], input:not([type="checkbox"]):not([type="radio"]), textarea, label.inline');
  const count = await targets.count();
  expect(count).toBeGreaterThan(5);
  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    const box = await target.boundingBox();
    const name = (await target.textContent())?.trim() || (await target.getAttribute('aria-label')) || `target ${index}`;
    expect(box, name).not.toBeNull();
    expect(box?.height ?? 0, `${name} height`).toBeGreaterThanOrEqual(44);
  }
});
