import { crc32, deflateSync } from 'node:zlib';
import { type Locator, type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { formatDuration, formatHoursMinutes } from '../../src/domain/format.ts';
import { paintedSurface, type Rgba, sameColour, tokenColour } from './contrast.ts';
import {
  type BuiltServer,
  type CreatedAccount,
  createAccountByAdminApi,
  expect,
  expectLayoutAt,
  SeedClient,
  screenshotPath,
  starterPolicyBody,
  test,
} from './fixtures.ts';

/*
 * Review and sign-off page on both viewports (WP5-UX5-T03): the title and its chips, the check card, the Preview with its
 * signature rows and the Sign off dialog, the Send card, one column at every width. The exact review content, the sign-off (which
 * sends nothing), a stale review that leads to a fresh one, the refusals, the deep link through the sign-in form.
 * Every test gets its own synthetic account (created over the admin API), so signing a period off never changes what another test
 * sees. Data are synthetic (example.invalid addresses, a generated image, days relative to today). The signature is uploaded over HTTP
 * because the upload screen belongs to a later task. Sending itself (capture, reasons, variants) is in submission.spec.ts.
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
    days: Array<{ work_date: string; completeness: string; calculation: { regular_minutes: number | null; nonworking_minutes: number | null; credited_minutes: number | null } | null }>;
    totals: { credited_minutes: number; pending_days: number };
    ot_proposals: Array<{ work_date: string; credited_minutes: number }>;
    deficit_proposals: Array<{ work_date: string; mode: string; deficit_minutes: number }>;
    unresolved_inputs: Array<{ work_date: string; reason: string }>;
    recipients: { to: string[]; subject: string };
    submission: { id: string };
  };
  payload_hash: string;
  expected_version: number;
}

interface ApiFinalization {
  finalized_revision_no: number | null;
  revision: { revision_no: number; review_state: string; origin: string; send_requested: boolean } | null;
  signoff: { signer_name: string; signature_attachment_id: string | null } | null;
  jobs: Array<{ kind: string; state: string }>;
}

const reviewPath = (payrollDate: string) => `/api/timesheets/${payrollDate}/review`;
const finalizationPath = (payrollDate: string) => `/api/timesheets/${payrollDate}/finalization`;

async function signInAt(page: Page, reviewer: Reviewer, hash: string) {
  await page.goto(`/${hash}`);
  await page.getByLabel('Email').fill(reviewer.account.email);
  await page.getByLabel('Password').fill(reviewer.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** Opens the Sign off dialog from the Employee Signature line and returns it. */
async function openSignoff(page: Page): Promise<Locator> {
  await page.locator('[data-sign-off]').click();
  const dialog = page.getByRole('dialog', { name: 'Sign off confirmation' });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Every period holds days without a record, so the review lists missing evidence and asks for this (in the dialog). */
async function acknowledge(dialog: Locator) {
  await dialog.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ }).check();
}

/** The Sign off button of the dialog (the footer button has the same words, so the dialog scopes it). */
const confirmSignoff = (dialog: Locator) => dialog.getByRole('button', { name: 'Sign off', exact: true });

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

async function rect(locator: Locator): Promise<Rect> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error('The element has no box');
  return { left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height, width: box.width, height: box.height };
}

/** A computed style value of an element (the test compiler has no DOM library, so the window comes from the element itself). */
function styleOf(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, name) => element.ownerDocument.defaultView?.getComputedStyle(element).getPropertyValue(name) ?? '', property);
}

/** Today's accounting date in the reporting zone as the PDF prints it (MM/DD/YYYY). */
function todayInLosAngeles(): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/* ---- Tests ------------------------------------------------------------------------------ */

test('the review shows the server content for all 14 days, then the sign-off signs it and sends nothing', async ({
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
  if (project === 'desktop') await page.setViewportSize({ width: 1440, height: 900 });

  // From the timesheet: the header shows Draft and links to the review.
  await signInAt(page, reviewer, '');
  await expect(page.locator('[data-status="review"]')).toHaveText('Draft');
  await page.locator(`[data-review-link="${reviewer.payrollDate}"]`).click();
  await expect(page).toHaveURL(new RegExp(`#/review/${reviewer.payrollDate}$`));
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  // The review belongs under Timesheet in the navigation.
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');

  // U5-27: the description names the period, the payroll date and the due time in the reporting zone; no submission id; the chips sit under it.
  const description = page.locator('[data-review-desc]');
  await expect(description).toContainText('Pay period');
  await expect(description).toContainText('payroll date');
  await expect(description).toContainText('due');
  await expect(description).toContainText('(America/Los_Angeles)');
  // The submission id stays on the PDF and in the email text (the Send card's message), not in the title or its description.
  await expect(page.locator('.review-head')).not.toContainText(api.payload.submission.id);
  await expect(page.locator('.review-head')).not.toContainText(/submission/i);
  await expect(page.locator('.check-card')).not.toContainText(api.payload.submission.id);
  await expect(page.locator('.review-preview')).not.toContainText(api.payload.submission.id);
  const chips = page.locator('[data-review-chips]');
  const descBox = await rect(description);
  const chipsBox = await rect(chips);
  expect(chipsBox.top, 'the chips are under the description').toBeGreaterThanOrEqual(descBox.bottom - 1);
  expect(Math.abs(chipsBox.left - descBox.left), 'the chips are left-aligned with the description').toBeLessThanOrEqual(1);
  await expect(chips.locator('.badge.current, .badge.in-progress, .badge.old, .badge.future').first()).toBeVisible();

  // Exactly the server payload: 14 days, and every figure on screen is the server's own number.
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  // U5-29: the Preview card carries the company line (one line, hidden when it does not fit), the title and the fields.
  const preview = page.getByRole('region', { name: 'Preview' });
  await expect(preview.getByRole('heading', { name: 'Preview', level: 2 })).toBeVisible();
  const reviewForm = page.getByRole('article', { name: 'Timesheet preview' });
  await expect(reviewForm.locator('header.form-head')).toContainText('Time sheet for salaried exempt employees');
  for (const field of ['Employee:', 'Payroll Date:', 'Period:']) await expect(reviewForm.locator('header.form-head').getByText(field, { exact: true })).toHaveCount(1);
  // At 1440px the company line fits and shows; whether it fits on a phone is the next test's measurement.
  if (project === 'desktop') await expect(reviewForm.locator('.review-company')).toBeVisible();
  for (const day of api.payload.days) {
    const row = page.locator(`[data-review-day="${day.work_date}"]`);
    // The detail rows are always on in the review: worked on a workday / on a day off, as h:mm.
    for (const [detail, minutes] of [
      ['regular', day.calculation?.regular_minutes ?? null],
      ['off-calendar', day.calculation?.nonworking_minutes ?? null],
    ] as const) {
      const cell = page.locator(`[data-detail="${detail}"][data-detail-day="${day.work_date}"]`);
      await expect(cell, `${day.work_date} ${detail}`).toHaveText(minutes === null ? '' : formatHoursMinutes(minutes));
    }
    // The OT cell follows the PDF rule: the credit of a complete day, "pending" while evidence is open, else blank.
    const credited = day.calculation?.credited_minutes ?? null;
    const ot = row.locator('[data-ot]');
    if (day.completeness === 'complete' && credited !== null) await expect(ot, `${day.work_date} OT`).toHaveText(formatHoursMinutes(credited));
    else if (day.completeness === 'incomplete' || day.completeness === 'incomplete_breaks') await expect(ot, `${day.work_date} OT`).toHaveText('pending');
    else await expect(ot, `${day.work_date} OT`).toHaveCount(0);
  }
  // WP5-UX3-T07 (U-16): an expected day without a record reads "No times" with the slashed ring, the same shape as on the Timesheet page.
  const noTimes = page.locator('[data-review-day] [data-check="missing"]:visible');
  expect(await noTimes.count(), 'the period holds expected days without a record').toBeGreaterThan(0);
  for (const badge of await noTimes.all()) {
    await expect(badge).toContainText('No times');
    await expect(badge.locator('.shape')).toHaveClass(/\bshape-slashed\b/);
    await expect(badge.locator('.shape')).not.toHaveClass(/\bshape-square\b/);
  }
  const completeRow = page.locator(`[data-review-day="${completeDay}"]`);
  await expect(completeRow).toContainText('Complete');
  await expect(completeRow).toContainText('3 breaks');
  const pendingRow = page.locator(`[data-review-day="${pendingDay}"]`);
  await expect(pendingRow).toContainText('breaks not confirmed');
  await expect(page.locator('[data-ot-total]')).toHaveAttribute('data-ot-total', String(api.payload.totals.credited_minutes));

  // U5-32: "What you sign" and its hint are gone; one muted note ends the page and names the saved zone.
  await expect(page.getByRole('heading', { name: 'What you sign' })).toHaveCount(0);
  await expect(page.locator('[data-zone-note]')).toHaveText('Dates are accounting dates in America/Los_Angeles. Session times are shown in that zone, as on the PDF.');

  // U5-31: before the sign-off the Send card holds the defaults of the review and Settings, Send is disabled and says why, Save PDF waits.
  const send = page.locator('[data-send-card]');
  await expect(send.getByRole('heading', { name: 'Send to payroll' })).toBeVisible();
  await expect(send.locator('#send-field-to')).toHaveValue('payroll@example.invalid');
  await expect(send.locator('#send-field-subject')).toHaveValue(api.payload.recipients.subject);
  await expect(send.getByRole('switch', { name: 'Time rows on the PDF' })).toBeChecked();
  await expect(send.getByRole('switch', { name: 'OT rows on the PDF' })).toBeChecked();
  await expect(send.locator('[data-send]')).toBeDisabled();
  await expect(send.locator('#send-hint')).toHaveText('Sign off first');
  await expect(send.locator('[data-save-pdf]')).toBeDisabled();
  await expect(send.locator('[data-send-status] .badge')).toHaveText('Sign off first');
  // PDF Preview before the sign-off is the unsigned preview of the current switches (a link that opens in a new tab).
  await expect(send.locator('[data-pdf-preview]')).toHaveAttribute('href', `/api/timesheets/${reviewer.payrollDate}/pdf-preview?time=1&ot=1`);
  await send.getByRole('switch', { name: 'OT rows on the PDF' }).uncheck();
  await expect(send.locator('[data-pdf-preview]')).toHaveAttribute('href', `/api/timesheets/${reviewer.payrollDate}/pdf-preview?time=1&ot=0`);
  await send.getByRole('button', { name: 'Reset to the Settings defaults' }).click();
  await expect(send.getByRole('switch', { name: 'OT rows on the PDF' })).toBeChecked();

  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await page.screenshot({ path: screenshotPath(`review-${project}-synthetic.png`), fullPage: true });
  await page.evaluate('window.scrollTo(0, 0)');
  await page.screenshot({ path: screenshotPath(`review-top-${project}-synthetic.png`) });

  // U5-30: the Sign off dialog holds the summary and everything the review found. The signer is the account (F-5 b): no typed name.
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  const dialog = await openSignoff(page);
  await expect(page.getByLabel('Your name')).toHaveCount(0);
  await expect(dialog.locator('[data-signer]')).toHaveText('Synthetic Reviewer (you)');
  await expect(dialog.locator('[data-summary="date"]')).toContainText(`Today, ${todayInLosAngeles()} (America/Los_Angeles)`);
  await expect(dialog.locator('[data-summary="ot"] dd')).toHaveAttribute('data-minutes', String(api.payload.totals.credited_minutes));
  await expect(dialog.locator('[data-summary="ot"] dd')).toContainText(`${formatHoursMinutes(api.payload.totals.credited_minutes)} h:mm credited when you sign off`);
  await expect(dialog.locator('[data-summary="signature"] dd')).toHaveText('your saved image and your name');
  const previewImage = dialog.locator('[data-signature-preview] img.signed-image');
  await expect(previewImage).toBeVisible();
  expect(await previewImage.evaluate((image) => (image as unknown as { naturalWidth: number }).naturalWidth), 'signature image decoded').toBeGreaterThan(0);
  await expect(dialog.locator(`[data-unresolved="${pendingDay}"]`)).toContainText('Breaks not confirmed');
  // Everything the review found is in the dialog: the OT proposals, the missing evidence with its acknowledgement.
  await expect(dialog.getByRole('heading', { name: 'OT proposals' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Missing evidence' })).toBeVisible();
  await expect(dialog.getByText('Signing off locks this period and posts the credits. It sends nothing')).toBeVisible();
  await page.screenshot({ path: screenshotPath(`review-dialog-${project}-synthetic.png`) });

  // The acknowledgement is checked before anything is sent: the blocker is inline, next to its field, and focused.
  await confirmSignoff(dialog).click();
  await expect(dialog.getByText('Acknowledge the incomplete evidence to submit with it.')).toBeVisible();
  await expect(dialog.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ })).toBeFocused();
  expect(posts, 'nothing is sent while the acknowledgement is missing').toEqual([]);

  // Cancel leaves nothing signed and returns focus to the Sign off button.
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-sign-off]')).toBeFocused();
  expect(posts).toEqual([]);

  const signing = await openSignoff(page);
  await acknowledge(signing);
  await confirmSignoff(signing).click();
  await expect(signing).toHaveCount(0);
  // The signed footer: the saved image, the name, the date and "Signed" in words; no second Sign off button.
  const result = page.locator('[data-result="created"]');
  await expect(result).toContainText('Signed.');
  const signed = page.locator('[data-signed-line]');
  await expect(signed).toContainText('Synthetic Reviewer');
  await expect(signed.locator('[data-signed-seal]')).toHaveText('Signed');
  await expect(page.locator('[data-signature="employee-date"]')).toHaveText(todayInLosAngeles());
  const footerImage = signed.locator('img.signed-image');
  await expect(footerImage).toBeVisible();
  expect(await footerImage.evaluate((image) => (image as unknown as { naturalWidth: number }).naturalWidth), 'footer image decoded').toBeGreaterThan(0);
  await expect(page.locator('[data-sign-off]')).toHaveCount(0);
  // Signing sends nothing (WP5-UX5-T01b): one sign-off request, no send request, the chips say Signed and Not sent yet.
  expect(posts.filter((url) => url.endsWith('/signoff')), 'one sign-off request').toHaveLength(1);
  expect(posts.filter((url) => url.endsWith('/send')), 'signing sends nothing').toHaveLength(0);
  await expect(page.locator('[data-status="review"]')).toHaveText('Signed');
  await expect(page.locator('[data-status="delivery"]')).toHaveText('Not sent yet');
  await expect(send.locator('[data-send-chip]')).toHaveText('Not sent yet');
  // Focus moves to the next act: the Send card.
  await expect(send.getByRole('heading', { name: 'Send to payroll' })).toBeFocused();
  // Send and Save PDF are enabled now; PDF Preview is the revision's own PDF for the switches.
  await expect(send.locator('[data-send]')).toBeEnabled();
  await expect(send.locator('[data-save-pdf]')).toBeEnabled();
  await expect(send.locator('#send-hint')).toHaveCount(0);
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.finalized_revision_no).toBe(1);
  // `send_requested` is "requested at finalization": a sign-off requests no send; the send is its own record and job.
  expect(finalized.revision).toMatchObject({ revision_no: 1, review_state: 'signed', origin: 'employee', send_requested: false });
  expect(finalized.jobs.map((job) => job.kind), 'only the PDF job: no send job exists').toEqual(['render_pdf']);
  expect(finalized.signoff).toMatchObject({ signer_name: 'Synthetic Reviewer', signature_attachment_id: expect.any(String) });
  await expect(send.locator('[data-pdf-preview]')).toHaveAttribute('href', new RegExp(`^/api/revisions/[0-9a-f-]+/pdf\\?time=1&ot=1&disposition=inline$`));
  // The PDF of the signed revision is the owner's: the page's own session downloads it with the chosen switches.
  const downloading = page.waitForEvent('download');
  await send.locator('[data-save-pdf]').click();
  expect((await downloading).suggestedFilename()).toMatch(/\.pdf$/);
  await page.screenshot({ path: screenshotPath(`review-signed-${project}-synthetic.png`), fullPage: true });

  // Back on the timesheet the header carries the review and delivery status from the server.
  await page.getByRole('link', { name: 'Back to the timesheet' }).first().click();
  await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();
  await expect(page.locator('[data-status="review"]')).toHaveText('Signed');
  await expect(page.locator('[data-status="delivery"]')).toHaveText('Not sent yet');
  // WP5-UX5-T04 (U5-14, owner answer F-2 a): signed and no revision of the period sent yet, the link asks for the send ("Review & send").
  await expect(page.locator(`[data-review-link="${reviewer.payrollDate}"]`)).toHaveText('Review & send');
  await page.screenshot({ path: screenshotPath(`review-status-${project}-synthetic.png`) });
});

// WP5-UX5-T04 (F-6 a): the compact padding of the check card moves with the sheet query, from 768px to 480px (12px below 480px).
test('the check card: the period card padding, "Back" below 480px with the full accessible name, text and button centred and 16px apart', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const card = page.locator('.check-card');
  await expect(card).toBeVisible();
  const text = card.locator('p');
  const back = card.getByRole('link', { name: 'Back to the timesheet' });
  await expect(text).toHaveText('Check every day, then sign off. Signing off locks this period and posts your OT credits; you send the PDF to payroll afterwards, below.');
  for (const [width, padding, label] of [
    [1440, '16px', 'Back to the timesheet'],
    [768, '16px', 'Back to the timesheet'],
    [767, '16px', 'Back to the timesheet'],
    [480, '16px', 'Back to the timesheet'],
    [479, '12px', 'Back'],
    [390, '12px', 'Back'],
    [320, '12px', 'Back'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await expectLayoutAt(page, width);
    expect(await styleOf(card, 'padding-left'), `padding at ${width}px`).toBe(padding);
    expect((await back.innerText()).trim(), `the visible words at ${width}px`).toBe(label);
    // The accessible name stays the full text, whatever is shown (SC 2.5.3: it contains the visible text).
    await expect(back).toHaveAccessibleName('Back to the timesheet');
    const cardBox = await rect(card);
    const textBox = await rect(text);
    const backBox = await rect(back);
    const middle = (box: Rect) => box.top + box.height / 2;
    expect(Math.abs(middle(textBox) - middle(cardBox)), `the text is vertically centred at ${width}px`).toBeLessThanOrEqual(1.5);
    expect(Math.abs(middle(backBox) - middle(cardBox)), `the button is vertically centred at ${width}px`).toBeLessThanOrEqual(1.5);
    expect(backBox.left - textBox.right, `the gap between the text and the button at ${width}px`).toBeGreaterThanOrEqual(15.5);
    if (width < 768) expect(backBox.height, `Back is a 44px target at ${width}px`).toBeGreaterThanOrEqual(44);
    await expectNoSidewaysScroll(page);
  }
});

// WP5-UX5-T04 (F-6 a): the Preview card's sheet follows the sheet breakpoint like the Timesheet page (one query, 480px), while the shell
// (the tab bar, the dialogs, the 44px rule) keeps 768px.
test('the Preview sheet follows the sheet breakpoint: the 4-column table below 480px, the 7-column grid from 480px, exactly one layout in the DOM, the tab bar below 768px, no page sideways scroll', async ({
  page,
  adminSeed,
  builtServer,
  isMobile,
}) => {
  test.skip(isMobile, 'The widths are set by the test (desktop project)');
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const paper = page.locator('[data-paper="review"]');
  await expect(paper).toBeVisible();
  for (const width of [320, 390, 479, 480, 600, 767, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const compact = width < 480;
    await expect(paper.locator('[data-sheet="phone"]'), `${width}px: the phone table in the Preview`).toHaveCount(compact ? 1 : 0);
    await expect(paper.locator('[data-sheet="desktop"]'), `${width}px: the 7-column grid in the Preview`).toHaveCount(compact ? 0 : 1);
    await expect(paper.locator(compact ? '.sheet-table' : '.week-grid').first(), `${width}px: the layout in the DOM is displayed`).toBeVisible();
    await expect(page.locator('.shell-tabs'), `${width}px: the tab bar`).toBeVisible({ visible: width < 768 });
    await expectNoSidewaysScroll(page);
  }
});

// WP5-UX5-FIX9 (WCAG 2.1.1, axe scrollable-region-focusable): a read-only week card that scrolls sideways (480 to 929px) is a keyboard stop.
test('the Preview week cards that scroll sideways are named keyboard stops that ArrowRight scrolls; a window wide enough adds no stop', async ({
  page,
  adminSeed,
  builtServer,
  isMobile,
}) => {
  test.skip(isMobile, 'The widths are set by the test (desktop project)');
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const paper = page.locator('[data-paper="review"]');
  await expect(paper).toBeVisible();
  const cards = paper.locator('.sheet-week');
  for (const width of [480, 600, 768, 900]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(cards, `${width}px: two week cards`).toHaveCount(2);
    for (const index of [0, 1]) {
      const card = cards.nth(index);
      await expect(card, `${width}px: week ${index + 1} scrolls sideways`).toHaveAttribute('tabindex', '0');
      await card.focus();
      await expect(card, `${width}px: week ${index + 1} is reached by keyboard focus`).toBeFocused();
      await expect(card, `${width}px: week ${index + 1} has its name`).toHaveAccessibleName(new RegExp(`^Week ${index + 1}, `));
      await card.evaluate((element) => {
        element.scrollLeft = 0;
      });
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => card.evaluate((element) => element.scrollLeft), `${width}px: ArrowRight scrolls week ${index + 1}`).toBeGreaterThan(0);
    }
  }
  for (const width of [1100, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(cards, `${width}px: two week cards`).toHaveCount(2);
    for (const index of [0, 1]) await expect(cards.nth(index), `${width}px: week ${index + 1} fits, so it takes no tab stop`).not.toHaveAttribute('tabindex', /.*/);
  }
});

/**
 * The CSS pixels of the shared focus ring that are not painted, read from a screenshot (so a layer the day columns cover, or a ring
 * that is invisible, is seen; computed styles cannot show that). The ring is 2px of `--accent` at the outer edge of the card's visible
 * box: for each of the four edges, twelve points along it, on the first pixel row or column inside the box. Empty means all four edges
 * are painted.
 */
async function missingRingPixels(page: Page, card: Locator, accent: Rgba): Promise<string[]> {
  const box = await card.boundingBox();
  if (box === null) return ['the card has no box'];
  const [left, top, right, bottom] = [Math.ceil(box.x), Math.ceil(box.y), Math.floor(box.x + box.width), Math.floor(box.y + box.height)];
  const viewport = page.viewportSize();
  if (top < 0 || bottom > (viewport?.height ?? 0)) return [`the card (${top}-${bottom}) is not wholly in the viewport`];
  const surface = await paintedSurface(page);
  const missing: string[] = [];
  for (let step = 1; step <= 12; step += 1) {
    const along = (from: number, to: number) => Math.floor(from + 8 + ((to - from - 16) * step) / 13);
    const points: Array<[string, number, number]> = [
      ['top', along(left, right), top],
      ['bottom', along(left, right), bottom - 1],
      ['left', left, along(top, bottom)],
      ['right', right - 1, along(top, bottom)],
    ];
    for (const [edge, x, y] of points) if (!sameColour(surface.at(x, y), accent, 3)) missing.push(`${edge} at ${x},${y}`);
  }
  return missing;
}

// WP5-UX5-FIX11 (F-UX5A2-1, mutant MA8; mutant MA9): the ring is painted on all four edges, in both themes, whatever the card's scroll
// position, and taking focus does not move the card (the focus handler leaves the card itself alone).
test('the Preview week card that scrolls sideways shows the shared focus ring on all four edges at 768px, in both themes and also scrolled, and focusing it does not scroll it', async ({
  page,
  adminSeed,
  builtServer,
  isMobile,
}) => {
  test.skip(isMobile, 'The widths are set by the test (desktop project)');
  test.setTimeout(90_000);
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  await page.setViewportSize({ width: 768, height: 1000 });
  const card = page.locator('[data-paper="review"] .sheet-week').first();
  await expect(card).toHaveAttribute('tabindex', '0');
  const range = await card.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(range, 'the card scrolls sideways at 768px').toBeGreaterThan(80);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    const accent = await tokenColour(page, '--accent');
    for (const scrollLeft of [0, 60, range]) {
      await card.evaluate((element, value) => {
        element.blur();
        element.scrollLeft = value;
      }, scrollLeft);
      // Put the whole card in view, below the sticky shell, then take focus the way the keyboard does.
      await card.evaluate((element) => element.ownerDocument.defaultView?.scrollBy(0, element.getBoundingClientRect().top - 120));
      const where = `${scheme}, scrolled ${scrollLeft}px`;
      await expect.poll(() => card.evaluate((element) => element.scrollLeft), `${where}: the scroll position is set`).toBeCloseTo(scrollLeft, 0);
      const before = await card.evaluate((element) => element.scrollLeft);
      // Not focused: no ring on the top edge (the same pixels are accent only while the card has focus).
      await expect.poll(async () => (await missingRingPixels(page, card, accent)).length, { message: `${where}: no ring while the card has no focus`, timeout: 5000 }).toBeGreaterThan(40);
      await page.keyboard.press('Shift');
      await card.focus();
      await expect(card, `${where}: the card has focus`).toBeFocused();
      await expect.poll(() => card.evaluate((element) => element.matches(':focus-visible')), `${where}: the focus is a keyboard focus`).toBe(true);
      expect(await card.evaluate((element) => [element.scrollLeft, element.scrollTop]), `${where}: taking focus does not move the card`).toEqual([before, 0]);
      await card.evaluate((element) => element.ownerDocument.defaultView?.scrollBy(0, element.getBoundingClientRect().top - 120));
      await expect.poll(() => missingRingPixels(page, card, accent), { message: `${where}: the ring is painted on every edge`, timeout: 5000 }).toEqual([]);
    }
    await card.evaluate((element) => element.blur());
  }
});

test('the Preview header: line 1 is hidden, never wrapped, when it does not fit; line 2 wraps by word; the fields sit 12px below', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const company = page.locator('.review-company');
  const title = page.locator('[data-review-title]');
  const fields = page.locator('.review-form-head .form-fields');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(company).toBeVisible();
  await expect(company).toHaveText('C&D Semiconductor Services, Inc.');
  const wide = await rect(company);
  const lineHeight = Number.parseFloat(await styleOf(company, 'line-height'));
  expect(wide.height, 'line 1 is one line').toBeLessThanOrEqual(lineHeight + 1);
  expect(await styleOf(company, 'text-align'), 'line 1 is centred').toBe('center');
  expect((await rect(fields)).top - (await rect(title)).bottom, 'the fields start 12px below the title').toBeGreaterThanOrEqual(12 - 0.5);
  // The line is shown exactly while its max-content width fits the room it has, and is then one line; otherwise it is hidden and
  // takes no room, never wrapped onto a second line. The measure is the text's own width (a nowrap span), read at each width.
  for (const width of [1440, 768, 390, 340, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const fit = await company.evaluate((element) => {
      const text = element.querySelector('span')?.getBoundingClientRect().width ?? 0;
      return { text, room: element.getBoundingClientRect().width };
    });
    if (fit.text <= fit.room) {
      await expect(company, `line 1 fits at ${width}px (${fit.text} in ${fit.room})`).toBeVisible();
      expect((await rect(company)).height, `line 1 is one line at ${width}px`).toBeLessThanOrEqual(lineHeight + 1);
    } else {
      await expect(company, `line 1 does not fit at ${width}px (${fit.text} in ${fit.room}): it is hidden, not wrapped`).toBeHidden();
      expect(await company.evaluate((element) => element.getBoundingClientRect().height), `line 1 takes no room at ${width}px`).toBe(0);
    }
  }
  // Narrow: the company line is hidden, not wrapped onto a second line; the title wraps by word and never splits one.
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 320) {
      await expect(company, `line 1 is hidden at ${width}px`).toBeHidden();
      expect(await company.evaluate((element) => element.getBoundingClientRect().height), `line 1 takes no room at ${width}px`).toBe(0);
    }
    const box = await rect(title);
    const titleLine = Number.parseFloat(await styleOf(title, 'line-height'));
    expect(box.height, `line 2 wraps at ${width}px`).toBeGreaterThan(titleLine * 1.5);
    expect(await title.evaluate((element) => element.scrollWidth <= element.clientWidth + 1), `line 2 stays inside at ${width}px`).toBe(true);
    // By word: the first line of the wrapped title ends at a word boundary (no word is cut).
    const lines = await title.evaluate((element) => {
      const range = element.ownerDocument.createRange();
      const node = element.firstChild;
      if (node === null) return [] as string[];
      const text = node.textContent ?? '';
      const rows: string[] = [];
      let current = '';
      let top = -1;
      for (let index = 0; index < text.length; index += 1) {
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rectangle = range.getBoundingClientRect();
        if (rectangle.height === 0) continue;
        if (top !== -1 && rectangle.top > top + 4) {
          rows.push(current.trim());
          current = '';
        }
        top = rectangle.top;
        current += text[index];
      }
      rows.push(current.trim());
      return rows;
    });
    const words = 'Time sheet for salaried exempt employees'.toUpperCase().split(' ');
    for (const row of lines) for (const word of row.split(' ')) expect(words, `"${word}" is a whole word at ${width}px`).toContain(word.toUpperCase());
    expect(lines.length, `the title takes several lines at ${width}px`).toBeGreaterThan(1);
  }
});

test('one column at every width: the cards stack and share the same left and right edge', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  await expect(page.locator('.review-layout')).toHaveCount(0);
  await expect(page.locator('.review-checklist, [data-step]')).toHaveCount(0);
  for (const width of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expectLayoutAt(page, width);
    const cardsInOrder = [page.locator('.check-card'), page.locator('.review-preview'), page.locator('[data-send-card]'), page.locator('[data-zone-note]')];
    let previousBottom = -Infinity;
    for (const element of cardsInOrder) {
      const box = await rect(element);
      expect(box.top, `each block starts below the one before at ${width}px`).toBeGreaterThanOrEqual(previousBottom - 1);
      previousBottom = box.bottom;
    }
    const check = await rect(page.locator('.check-card'));
    const send = await rect(page.locator('[data-send-card]'));
    expect(Math.abs(check.left - send.left), `the cards share the left edge at ${width}px`).toBeLessThanOrEqual(1);
    expect(Math.abs(check.right - send.right), `the cards share the right edge at ${width}px`).toBeLessThanOrEqual(1);
    if (width >= 1440) expect(check.width, 'the page keeps its 1200px cap at 1440px: no second column, no widening').toBeLessThanOrEqual(1200);
    await expectNoSidewaysScroll(page);
  }
});

/** The signature rows measured on the B11 PDF mockup page and in layout.ts, as fractions of the content width (see styles.css). */
const B11 = { inset: 23.75 / 675, line: 185 / 675, gap: 300 / 675, date: 92.5 / 675, right: 73.75 / 675 };
/** `src/server/pdf/layout.ts` (points, content 540): lines 19 in, 148 long, date 74 long and 59 before the right edge. */
const PDF_LAYOUT = { inset: 19 / 540, line: 148 / 540, gap: 240 / 540, date: 74 / 540, right: 59 / 540 };

test('the mockup and the PDF geometry agree within 1% of the content width (the source of the tokens)', () => {
  for (const key of Object.keys(B11) as Array<keyof typeof B11>) expect(Math.abs(B11[key] - PDF_LAYOUT[key]), key).toBeLessThanOrEqual(0.01);
});

/** Measures the two signature rows inside `scope` and checks the owner's rules; returns the measured fractions. */
async function expectSignatureGeometry(scope: Locator, width: number, options: { button: Locator | null; exactFractions: boolean }) {
  const group = scope.locator('.review-signatures');
  // The saved signature image of the Sign off dialog's preview grows the employee line when it arrives (the name wraps under it by
  // 23.25px): wait until every image in the rows has loaded, so the four lines are read from one settled layout.
  for (const image of await group.locator('img').all()) {
    await expect
      .poll(() => image.evaluate((element) => (element as unknown as { complete: boolean; naturalWidth: number }).complete && (element as unknown as { naturalWidth: number }).naturalWidth > 0), {
        message: 'the signature image has loaded',
      })
      .toBe(true);
  }
  const content = await rect(group);
  const line = async (name: string) => rect(group.locator(`[data-sig-line="${name}"]`));
  const employee = await line('employee');
  const employeeDate = await line('employee-date');
  const manager = await line('manager');
  const managerDate = await line('manager-date');
  // Two rows at every width: the manager row is below the employee row, and each row's two lines are side by side.
  expect(manager.top, `two rows at ${width}px`).toBeGreaterThan(employee.bottom);
  expect(employeeDate.left, `the Date line is beside the signature line at ${width}px`).toBeGreaterThan(employee.right);
  expect(managerDate.left).toBeGreaterThan(manager.right);
  // The y of the two lines of a row are equal within 1px.
  expect(Math.abs(employee.bottom - employeeDate.bottom), `row 1 lines align at ${width}px`).toBeLessThanOrEqual(1);
  expect(Math.abs(manager.bottom - managerDate.bottom), `row 2 lines align at ${width}px`).toBeLessThanOrEqual(1);
  // The four lines align by column: equal x and width.
  expect(Math.abs(employee.left - manager.left), `signature lines share x at ${width}px`).toBeLessThanOrEqual(1);
  expect(Math.abs(employee.width - manager.width), `signature lines share width at ${width}px`).toBeLessThanOrEqual(1);
  expect(Math.abs(employeeDate.left - managerDate.left), `Date lines share x at ${width}px`).toBeLessThanOrEqual(1);
  expect(Math.abs(employeeDate.width - managerDate.width), `Date lines share width at ${width}px`).toBeLessThanOrEqual(1);
  // Nothing leaves the content box.
  expect(employee.left).toBeGreaterThanOrEqual(content.left - 0.5);
  expect(employeeDate.right).toBeLessThanOrEqual(content.right + 0.5);
  const measured = {
    inset: (employee.left - content.left) / content.width,
    line: employee.width / content.width,
    gap: (employeeDate.left - employee.right) / content.width,
    date: employeeDate.width / content.width,
    right: (content.right - employeeDate.right) / content.width,
  };
  if (options.exactFractions) {
    // The fractions are the B11 values within 1% of the content width (and so the PDF's own).
    for (const key of Object.keys(measured) as Array<keyof typeof measured>) {
      expect(Math.abs(measured[key] - B11[key]), `${key} fraction at ${width}px (measured ${measured[key].toFixed(4)}, B11 ${B11[key].toFixed(4)})`).toBeLessThanOrEqual(0.01);
    }
  } else {
    // Narrow rule: the lines keep a minimum readable length (9rem and 5.5rem of the 15px root: 135px and 82.5px).
    expect(employee.width, `the signature line keeps its minimum at ${width}px`).toBeGreaterThanOrEqual(134);
    expect(employeeDate.width, `the Date line keeps its minimum at ${width}px`).toBeGreaterThanOrEqual(82);
  }
  if (options.button !== null) {
    const button = await rect(options.button);
    expect(Math.abs(button.right - (employee.right - 8)), `Sign off sits 8px inside the end of its line at ${width}px`).toBeLessThanOrEqual(1);
    expect(button.bottom, 'the button stands on the line').toBeLessThanOrEqual(employee.bottom + 0.5);
  }
  return measured;
}

test('signature rows: the PDF block insets and proportions, lines aligned by row and column, Sign off 8px inside its line, two rows at every width', async ({
  page,
  adminSeed,
  builtServer,
}, testInfo) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  const lines: string[] = [`# ${testInfo.project.name}: signature rows`];
  let unsignedHeight: number | null = null;
  for (const width of [1440, 768, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectLayoutAt(page, width);
    const footer = page.locator('.review-preview .sheet-footer');
    await footer.scrollIntoViewIfNeeded();
    const measured = await expectSignatureGeometry(footer, width, { button: page.locator('[data-sign-off]'), exactFractions: width >= 768 });
    // WP5-UX5-FIX11 (mutant MA1): the unsigned lines are as high at every width. The empty content block of the Employee line takes no
    // room (`.rsig-content:empty`); as a flex item with a gap it made both lines 5px higher below 768px (52 to 57px).
    for (const name of ['employee', 'employee-date']) {
      const height = (await rect(footer.locator(`[data-sig-line="${name}"]`))).height;
      unsignedHeight ??= height;
      expect(Math.abs(height - unsignedHeight), `the unsigned ${name} line is ${unsignedHeight}px high at ${width}px (measured ${height})`).toBeLessThanOrEqual(0.5);
    }
    lines.push(`${width}px: ${JSON.stringify(Object.fromEntries(Object.entries(measured).map(([key, value]) => [key, Number(value.toFixed(4))])))}`);
    await expectNoSidewaysScroll(page);
    if (width < 768) expect((await rect(page.locator('[data-sign-off]'))).height, `Sign off is a 44px target at ${width}px`).toBeGreaterThanOrEqual(44);
  }
  // The tokens are custom properties of the rows, the PDF's own fractions.
  const tokens = await page.locator('.review-signatures').evaluate((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return ['--sig-inset', '--sig-line', '--sig-date', '--sig-right'].map((name) => style?.getPropertyValue(name).trim() ?? '');
  });
  expect(tokens).toEqual(['3.519%', '27.407%', '13.704%', '10.926%']);
  // The Sign off dialog's signature preview takes the same geometry.
  if (testInfo.project.name === 'desktop') {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openSignoff(page);
    await expectSignatureGeometry(dialog.locator('[data-signature-preview]'), 1440, { button: null, exactFractions: true });
  }
  testInfo.annotations.push({ type: 'signature-geometry', description: lines.join('\n') });
});

test('a signed period opened again (reloaded): the signed image, name and mark stay readable and uncovered beside Sign correction, and the four lines stay aligned', async ({
  page,
  adminSeed,
  builtServer,
}) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  const signing = await openSignoff(page);
  await acknowledge(signing);
  await confirmSignoff(signing).click();
  await expect(page.locator('[data-result="created"]')).toContainText('Signed.');
  // A later visit (to send the PDF, say): the page loads already signed, so the Employee Signature line holds the signed mark and the
  // correction button together. The sign-off of this window left no second button; a reload does.
  await page.reload();
  await expect(page.locator('[data-review-day]')).toHaveCount(14);
  const button = page.locator('[data-sign-off]');
  await expect(button).toHaveText('Sign correction');
  const signed = page.locator('[data-signed-line]');
  await expect(signed).toContainText('Synthetic Reviewer');
  for (const width of [1440, 768, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectLayoutAt(page, width);
    const footer = page.locator('.review-preview .sheet-footer');
    await footer.scrollIntoViewIfNeeded();
    // The four lines align by row and by column, the insets are the PDF's at 768px and wider, and the button stands 8px inside its line.
    await expectSignatureGeometry(footer, width, { button, exactFractions: width >= 768 });
    await expectNoSidewaysScroll(page);
    // The button covers neither the image, nor the name, nor the "Signed" mark.
    const pressed = await rect(button);
    const parts = { image: signed.locator('img.signed-image'), name: signed.locator('[data-signer-name]'), seal: signed.locator('[data-signed-seal]') };
    for (const [part, locator] of Object.entries(parts)) {
      const box = await rect(locator);
      const overlaps = box.left < pressed.right - 0.5 && pressed.left < box.right - 0.5 && box.top < pressed.bottom - 0.5 && pressed.top < box.bottom - 0.5;
      expect(overlaps, `the ${part} is not covered by Sign correction at ${width}px`).toBe(false);
    }
    // Readable: the image keeps at least 100px, and the name wraps by words into at most three lines instead of letters (21px wide, ten lines).
    expect((await rect(parts.image)).width, `the saved image keeps its width at ${width}px`).toBeGreaterThanOrEqual(100);
    expect((await rect(parts.name)).height, `the name takes at most three lines at ${width}px`).toBeLessThanOrEqual(3 * 20);
  }
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
  let dialog = await openSignoff(page);
  const deficitBox = dialog.locator(`[data-deficit="${shortDay}"]`);
  await expect(deficitBox).toContainText(formatDuration(deficit?.deficit_minutes ?? 0));
  await expect(deficitBox.getByRole('radio', { name: 'Deduct from my OT balance' })).not.toBeChecked();

  // The deficit choice is required before sign-off.
  await confirmSignoff(dialog).click();
  await expect(dialog.getByText(`Choose deduct or waive for ${shortDay}.`)).toBeVisible();
  await deficitBox.getByRole('radio', { name: 'Deduct from my OT balance' }).check();
  await acknowledge(dialog);

  // Behind the page's back, the day changes: the reviewed hash and version no longer match.
  await reviewer.api.putDay(fullDay, { notes: 'Changed after the review was opened' });
  await confirmSignoff(dialog).click();

  const notice = page.locator('[data-notice="stale"]');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('Nothing was submitted');
  await expect(notice).toBeFocused();
  // Nothing is signed: the dialog is closed, the page shows the fresh review and the Sign off button again.
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-review-day="' + fullDay + '"]')).toContainText('Changed after the review was opened');
  await expect(page.locator('[data-sign-off]')).toBeVisible();
  const afterConflict = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(afterConflict.finalized_revision_no, 'the stale sign-off submitted nothing').toBeNull();
  await page.screenshot({ path: screenshotPath(`review-stale-${project}-synthetic.png`), fullPage: true });

  // The old choice belonged to the old review.
  dialog = await openSignoff(page);
  await expect(dialog.locator(`[data-deficit="${shortDay}"]`).getByRole('radio', { name: 'Deduct from my OT balance' })).not.toBeChecked();
  await expect(dialog.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ })).not.toBeChecked();

  // Sign off again on the fresh review.
  await dialog.locator(`[data-deficit="${shortDay}"]`).getByRole('radio', { name: 'Waive the deficit' }).check();
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  await expect(page.locator('[data-result="created"]')).toContainText('Signed.');
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision).toMatchObject({ revision_no: 1, review_state: 'signed' });

  // A second window that still shows the old review cannot submit a second revision: 409.
  const replay = await reviewer.api.call<{ error: { code: string } }>(
    'POST',
    `/api/timesheets/${reviewer.payrollDate}/signoff`,
    {
      expected_version: first.expected_version,
      reviewed_hash: first.payload_hash,
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
    { expected_version: current.expected_version, reviewed_hash: current.payload_hash, incomplete_evidence_acknowledged: true },
    201,
  );
}

test('a period finalized in another window reloads with a clear message and no second revision', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);

  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator(`[data-review-day="${day}"]`)).toContainText('Complete');
  // A different request than the one already recorded (the content changed before the other window signed):
  // refused, never a second revision. A typed name cannot make a request different any more (F-5 b).
  await reviewer.api.putDay(day, { notes: 'Changed before the other window signed' });
  await signOffElsewhere(reviewer);
  const dialog = await openSignoff(page);
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  const notice = page.locator('[data-notice="stale"]');
  await expect(notice).toContainText('already submitted');
  await expect(notice).toContainText('Nothing was submitted twice');
  // The fresh review now offers a correction: a reason, and no email choice (signing never sends).
  await expect(page.locator('[data-mode="correction"]')).toBeVisible();
  await expect(page.locator('[data-intro]')).toContainText('A change is recorded as a correction revision with a reason');
  await expect(page.locator('[data-sign-off]')).toHaveText('Sign correction');
  const correction = page.getByRole('dialog', { name: 'Sign the correction' });
  await page.locator('[data-sign-off]').click();
  await expect(correction.getByLabel('Reason for the correction')).toBeVisible();
  await expect(correction.getByRole('radio', { name: 'Send the email' })).toHaveCount(0);
  await expect(correction.getByText('It sends nothing')).toBeVisible();
  // A correction needs its reason before anything is sent.
  await acknowledge(correction);
  await correction.getByRole('button', { name: 'Sign correction' }).click();
  await expect(correction.getByText('Give the reason for this correction.')).toBeVisible();
  await expect(correction.getByLabel('Reason for the correction')).toBeFocused();
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision?.revision_no, 'still the one revision').toBe(1);
  expect(finalized.signoff?.signer_name).toBe('Synthetic Reviewer');
});

test('an identical sign-off repeated from a second window is recognised and creates nothing', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);

  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  await expect(page.locator(`[data-review-day="${day}"]`)).toContainText('Complete');
  await signOffElsewhere(reviewer);

  const dialog = await openSignoff(page);
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  await expect(page.locator('[data-result="replayed"]')).toContainText('Nothing new was created');
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.revision?.revision_no, 'still the one revision').toBe(1);
});

test('a refusal from the server names the missing field inside the dialog', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);
  await page.route('**/api/timesheets/*/signoff', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'acknowledgement_required', message: 'Acknowledge the incomplete evidence before signing off' } }),
    }),
  );
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const dialog = await openSignoff(page);
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  await expect(dialog.locator('#review-error-acknowledgement')).toHaveText('Acknowledge the incomplete evidence to submit with it.');
  await expect(dialog.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ })).toBeFocused();
  await expect(page.locator('[data-result]')).toHaveCount(0);
});

test('a server refusal opens "Not signed off", signs nothing and keeps the choices', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  const [day = ''] = reviewer.days;
  await reviewer.api.seedCompleteDay(day);
  await page.route('**/api/timesheets/*/signoff', (route) =>
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'period_not_signable', message: 'This period cannot be signed right now' } }),
    }),
  );
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const dialog = await openSignoff(page);
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  const alert = page.getByRole('alertdialog', { name: 'Not signed off' });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('This period cannot be signed right now');
  await expect(alert).toContainText('Nothing was signed');
  await expect(alert.getByRole('button', { name: 'OK' })).toBeFocused();
  await alert.getByRole('button', { name: 'OK' }).click();
  await expect(alert).toHaveCount(0);
  // Nothing is signed: no signed line, the Sign off button is back and holds focus, and the server has no revision.
  await expect(page.locator('[data-signed-line]')).toHaveCount(0);
  await expect(page.locator('[data-sign-off]')).toBeFocused();
  const finalized = await reviewer.api.call<ApiFinalization>('GET', finalizationPath(reviewer.payrollDate));
  expect(finalized.finalized_revision_no).toBeNull();
  // The choices are kept: the acknowledgement is still ticked when the dialog opens again.
  const again = await openSignoff(page);
  await expect(again.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ })).toBeChecked();
});

test('without a saved signature image the sign-off still goes, by name alone, and the dialog says where to add one (F-5 b)', async ({ page, adminSeed, builtServer }, testInfo) => {
  // An account that never uploaded an image and saved no recipients.
  const account = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Unsigned' });
  const api = await new SeedClient(builtServer.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  await signInAt(page, { account, api, payrollDate: currentPayrollDate, days: [] }, `#/review/${currentPayrollDate}`);
  const dialog = await openSignoff(page);
  // No error and no image: a short line and a link to Settings; no typed-name field; the recorded name is shown.
  await expect(dialog.locator('[data-signature="name-only"]')).toContainText('your name only');
  const link = dialog.getByRole('link', { name: 'Add a signature image in Settings.' });
  await expect(link).toHaveAttribute('href', '#/settings');
  if (testInfo.project.name === 'mobile') await expectNoSidewaysScroll(page);
  await expect(dialog.getByRole('img', { name: 'Your saved signature image' })).toHaveCount(0);
  await expect(page.getByLabel('Your name')).toHaveCount(0);
  await expect(dialog.locator('[data-signer]')).toHaveText('Synthetic Unsigned (you)');
  await acknowledge(dialog);
  await confirmSignoff(dialog).click();
  // The signed footer shows the name, the date and "Signed", and no image.
  const signed = page.locator('[data-signed-line]');
  await expect(signed).toContainText('Synthetic Unsigned');
  await expect(signed.locator('[data-signed-seal]')).toHaveText('Signed');
  await expect(signed.locator('img')).toHaveCount(0);
  await expect(page.locator('[data-signature="employee-date"]')).toHaveText(todayInLosAngeles());
  const finalized = await api.call<ApiFinalization>('GET', finalizationPath(currentPayrollDate));
  expect(finalized.finalized_revision_no).toBe(1);
  expect(finalized.revision).toMatchObject({ revision_no: 1, review_state: 'signed', origin: 'employee', send_requested: false });
  expect(finalized.jobs.map((job) => job.kind)).toEqual(['render_pdf']);
  expect(finalized.signoff).toEqual({ signer_name: 'Synthetic Unsigned', signature_attachment_id: null, signed_at: expect.any(String), reviewed_sha256: expect.any(String) });
  // This account saved no recipients: the card says so next to the field and sends nothing.
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.locator('[data-send]').click();
  await expect(page.locator('#send-error-to')).toHaveText('Enter at least one recipient address.');
  await expect(page.locator('#send-field-to')).toBeFocused();
  expect(posts.filter((url) => url.endsWith('/send')), 'a send with no recipient is not requested').toEqual([]);
});

test('Send stays disabled before the sign-off whatever is typed, and a send with an invalid address makes no request', async ({ page, adminSeed, builtServer }) => {
  const reviewer = await newReviewer(adminSeed, builtServer);
  await signInAt(page, reviewer, `#/review/${reviewer.payrollDate}`);
  const send = page.locator('[data-send-card]');
  await expect(send.locator('[data-send]')).toBeDisabled();
  await send.locator('#send-field-to').fill('typed@example.invalid');
  await send.locator('#send-field-subject').fill('Typed subject');
  await expect(send.locator('[data-send]')).toBeDisabled();
  await expect(send.locator('[data-send]')).toHaveAccessibleDescription('Sign off first');
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await send.locator('[data-send]').click({ force: true }).catch(() => undefined);
  expect(posts.filter((url) => url.endsWith('/send')), 'a disabled Send posts nothing').toEqual([]);
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
  await expect(page.locator('#send-field-to')).toHaveValue('payroll@example.invalid');
  await expect(page.getByRole('article', { name: 'Timesheet preview' })).toContainText('Synthetic Reviewer');
  const dialog = await openSignoff(page);
  await expect(dialog.locator('[data-signer]')).toContainText('Synthetic Reviewer');
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
  await expectNoSidewaysScroll(page);

  // Only rendered controls are tap targets: the desktop bar (display none below 768px) is excluded.
  const targets = page
    .locator('button, a[href], input:not([type="checkbox"]):not([type="radio"]), textarea, label.inline')
    .filter({ visible: true });
  const count = await targets.count();
  expect(count).toBeGreaterThan(5);
  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    const box = await target.boundingBox();
    const name = (await target.textContent())?.trim() || (await target.getAttribute('aria-label')) || `target ${index}`;
    expect(box, name).not.toBeNull();
    expect(box?.height ?? 0, `${name} height`).toBeGreaterThanOrEqual(44);
  }
  // The dialog's own controls are tap targets too: its checkboxes, radios and both buttons.
  const dialog = await openSignoff(page);
  await expectNoSidewaysScroll(page);
  for (const control of [dialog.getByRole('button', { name: 'Cancel' }), confirmSignoff(dialog), dialog.getByRole('checkbox', { name: /I acknowledge/ }).locator('xpath=ancestor::label')]) {
    expect((await rect(control)).height, 'a dialog control is at least 44px').toBeGreaterThanOrEqual(44);
  }
});
