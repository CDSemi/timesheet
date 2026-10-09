import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { type Locator, type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import {
  type BuiltServer,
  type CreatedAccount,
  createAccountByAdminApi,
  expect,
  SeedClient,
  screenshotPath,
  starterPolicyBody,
  statusInPage,
  test,
} from './fixtures.ts';

/*
 * History and delivery, submission settings and the signature upload on both viewports, through
 * the real UI of the BUILT server (WP3-T13). Every test gets its own synthetic account (created
 * over the admin API), so what one test submits never changes what another sees. The in-process
 * runner renders the PDF and delivers in capture mode, so nothing leaves the machine. Addresses
 * are on example.invalid and every image is generated at test time.
 *
 * Two things are stood in for, and said so where they are used: an uncertain delivery attempt (the
 * state a crashed sender leaves) is written straight into the temporary database by a child
 * process, because no route creates one; and the server's answer is mocked for an automatic
 * submission (the deadline automation belongs to the later end-to-end task) and for the refusal of
 * an upload whose consent cannot be recorded (the server side of that is covered by the T07B tests).
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  // A CSP violation shows up as a console error. The refusals these tests provoke on purpose
  // (401 signed out, 404 a foreign id or no signature yet, 409, 422) are the only expected ones.
  page.on('console', (message) => {
    const expected = /status of (401|404|409|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const TO = 'payroll-history@example.invalid';
const CC = 'manager-history@example.invalid';

/* ---- Synthetic images and accounts --------------------------------------------------------------- */

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 160x48 PNG (dark strokes on white); `phase` makes every image a different file. */
function signaturePng(phase = 9): Buffer {
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
      if (Math.abs(y - (24 + Math.round(14 * Math.sin(x / phase)))) <= 1) row.fill(0x2a, 1 + x * 3, 4 + x * 3);
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

async function uploadSignatureOverHttp(server: BuiltServer, account: CreatedAccount): Promise<string> {
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
  return ((await upload.json()) as { signature: { id: string } }).signature.id;
}

interface Person {
  account: CreatedAccount;
  api: SeedClient;
  payrollDate: string;
}

interface PersonOptions {
  displayName?: string;
  /** Save recipients (and so a first settings version); the default has none. */
  settings?: boolean;
  signature?: boolean;
}

/** A fresh account with a policy, and optionally saved settings and a signature image. */
async function newPerson(adminSeed: SeedClient, server: BuiltServer, options: PersonOptions = {}): Promise<Person> {
  const account = await createAccountByAdminApi(adminSeed, { displayName: options.displayName ?? 'Synthetic History Person' });
  const api = await new SeedClient(server.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  if (options.settings === true) {
    await api.call('POST', '/api/settings/submission', { expected_seq: 0, to: [TO], cc: [CC], auto_submit: false }, 201);
  }
  if (options.signature === true) await uploadSignatureOverHttp(server, account);
  return { account, api, payrollDate: currentPayrollDate };
}

/** Signs the person's displayed period off over HTTP and returns the revision id. */
async function signOffPeriod(person: Person): Promise<string> {
  const [workDay = ''] = await person.api.displayedPeriodFreeWorkdays();
  expect(workDay, 'a past free workday in the displayed period').not.toBe('');
  await person.api.seedCompleteDay(workDay);
  const review = await person.api.call<{ expected_version: number; payload_hash: string }>('GET', `/api/timesheets/${person.payrollDate}/review`);
  const done = await person.api.call<{ revision: { id: string } }>(
    'POST',
    `/api/timesheets/${person.payrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: 'Synthetic Person', incomplete_evidence_acknowledged: true },
    201,
  );
  return done.revision.id;
}

interface ApiAttempt {
  id: string;
  state: string;
  decision: string | null;
  decision_required: boolean;
}

const attemptsOf = async (person: Person, revisionId: string): Promise<ApiAttempt[]> =>
  (await person.api.call<{ deliveries: ApiAttempt[] }>('GET', `/api/deliveries?revision_id=${revisionId}`)).deliveries;

/**
 * The runner (every 15 s) renders the PDF and then makes the delivery attempt. The harness configures a
 * synthetic capture sender (MAIL_FROM on example.invalid, OUTBOUND_MODE capture), so a first attempt ends
 * `accepted` into the capture folder. A final state is still waited for, and the tests word whichever final
 * state happened, so a regression in either direction shows as a changed assertion, not a hang.
 */
async function waitForFinal(person: Person, revisionId: string, count: number): Promise<void> {
  await expect
    .poll(async () => (await attemptsOf(person, revisionId)).filter((item) => item.state === 'accepted' || item.state === 'failed_permanent').length, {
      timeout: 170_000,
      intervals: [2_000],
      message: `${count} final delivery attempt(s)`,
    })
    .toBeGreaterThanOrEqual(count);
}

const OUTCOME: Record<string, { badge: string; attempt: string }> = {
  accepted: { badge: 'Email accepted by the mail server', attempt: 'Accepted by the mail server' },
  failed_permanent: { badge: 'Delivery failed', attempt: 'Failed' },
};

/*
 * Test-only: an uncertain delivery attempt is what a sender that died after handing the message
 * to the mail server leaves behind. No route creates one, so a child process (process.execPath)
 * writes it into the temporary database of the BUILT server through its own database module: a
 * send job that needs intervention and an attempt that went sending, then uncertain.
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

async function seedUncertainAttempt(server: BuiltServer, revisionId: string): Promise<string> {
  // Attempts are ordered by their start second: wait past it so the seeded attempt is the newest.
  await new Promise((resolveWait) => setTimeout(resolveWait, 1_500));
  const databaseModule = pathToFileURL(join(REPO_ROOT, 'dist', 'server', 'db', 'database.js')).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', SEED_UNCERTAIN_SCRIPT, databaseModule], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, SEED_DB_PATH: server.databasePath, SEED_REVISION_ID: revisionId },
  });
  if (result.status !== 0) throw new Error(`uncertain-attempt seeding failed with ${result.status}: ${result.stderr}`);
  expect(result.stdout, 'seeded attempt id').not.toBe('');
  return result.stdout;
}

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

/** On a phone every control the person presses is at least 44px tall. */
async function expectTapTargets(controls: Locator[]) {
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box?.height ?? 0, 'tap target height').toBeGreaterThanOrEqual(44);
  }
}

const card = (page: Page, revisionId: string) => page.locator(`[data-revision="${revisionId}"]`);

/* ---- History and delivery ------------------------------------------------------------------------- */

test('history shows the signed revision with its PDF and delivery; download, explicit resend, and the decision on an uncertain delivery', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(420_000);
  const project = testInfo.project.name;
  const person = await newPerson(adminSeed, builtServer, { settings: true, signature: true });
  const revisionId = await signOffPeriod(person);
  await waitForFinal(person, revisionId, 1);
  const firstState = (await attemptsOf(person, revisionId)).at(-1)?.state ?? '';
  const outcome = OUTCOME[firstState];
  if (outcome === undefined) throw new Error(`unexpected first delivery state ${firstState}`);
  expect(firstState, 'a configured capture sender: the first attempt is accepted').toBe('accepted');

  // The period status sits in the sheet, above the week bands (the desktop sheet, or the phone tables).
  await signInPageAs(person.account, '#/timesheet');
  const status = page.locator('[data-grid-status="line"]');
  await expect(status).toHaveCount(1);
  await expect(status.locator('[data-grid-status="review"]')).toHaveText('Submitted manually');
  await expect(status.locator('[data-grid-status="revision"]')).toHaveText('Revision 1');
  await expect(status.locator('[data-grid-status="pdf"]')).toHaveText('PDF ready');
  await expect(status.locator('[data-grid-status="delivery"]')).toHaveText(outcome.badge);
  const layout = project === 'desktop' ? 'desktop' : 'phone';
  await expect(page.locator(`[data-sheet="${layout}"] [data-grid-status="line"]`)).toHaveCount(1);
  await expect(page.locator(`[data-sheet]:not([data-sheet="${layout}"])`)).toHaveCount(0);
  // The signature line of the sheet names the signer; never an image on the Timesheet page.
  await expect(page.locator('[data-signature="employee"]')).toContainText('Signed by');
  await expect(page.locator('[data-sheet] img')).toHaveCount(0);
  await page.screenshot({ path: screenshotPath(`history-grid-status-${project}-synthetic.png`) });
  await status.getByRole('link', { name: 'Open in History' }).click();
  await expect(page).toHaveURL(/#\/history$/);

  // Reading the history writes nothing.
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') writes.push(`${request.method()} ${request.url()}`);
  });
  await expect(page.getByRole('heading', { name: 'History', level: 1 })).toBeVisible();
  const revision = card(page, revisionId);
  await expect(revision).toBeVisible();
  await expect(revision.locator('[data-revision-badge="number"]')).toHaveText('Revision 1');
  await expect(revision.locator('[data-revision-badge="review"]')).toHaveText('Signed');
  await expect(revision.locator('[data-revision-badge="pdf"]')).toHaveText('PDF ready');
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText(outcome.badge);
  await expect(revision.locator('[data-fact="origin"]')).toHaveText('Signed by you');
  await expect(revision.locator('[data-fact="signed"]')).toContainText('Synthetic Person');
  await expect(revision.locator('[data-fact="recipients"]')).toHaveText(`${TO} (copy: ${CC})`);
  await expect(revision.locator('[data-attempt]')).toHaveCount(1);
  await expect(revision.locator(`[data-attempt-state="${firstState}"]`)).toContainText(outcome.attempt);
  if (firstState === 'failed_permanent') await expect(revision.locator('[data-attempt-state="failed_permanent"] [data-fault-code]')).toHaveText(/^[a-z][a-z0-9_]*$/);
  else await expect(revision.locator('[data-fault-code]')).toHaveCount(0);
  expect(writes, 'opening the history sends no write request').toEqual([]);

  // The reasoned correction entry point leads to the review of the period.
  await expect(revision.locator(`[data-correction-link="${person.payrollDate}"]`)).toHaveText('Correct this period');
  await expect(revision.locator(`[data-correction-link="${person.payrollDate}"]`)).toHaveAttribute('href', `#/review/${person.payrollDate}`);

  // The PDF downloads as an attachment with the sanitized name, and it is a PDF.
  const downloading = page.waitForEvent('download');
  await revision.getByRole('button', { name: /^Download PDF/ }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe(`timesheet-${person.payrollDate}-r1.pdf`);
  const saved = await download.path();
  expect(readFileSync(saved).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  await expect(revision.locator('[data-revision-message="ok"]')).toContainText(`Downloaded timesheet-${person.payrollDate}-r1.pdf`);

  // Resend is explicit: a confirmation first, and cancelling sends nothing.
  const resend = revision.getByRole('button', { name: /^Resend email/ });
  await expect(resend).toBeEnabled();
  await resend.click();
  const confirm = revision.locator('[data-confirm="resend"]');
  await expect(confirm).toBeVisible();
  await expect(confirm).toBeFocused();
  await expect(confirm).toContainText(TO);
  await expect(confirm).toContainText('No revision, sign-off or OT balance changes');
  await confirm.getByRole('button', { name: 'Cancel' }).click();
  await expect(confirm).toHaveCount(0);
  await expect(resend).toBeFocused();
  expect((await attemptsOf(person, revisionId)).length, 'cancelling a resend sends nothing').toBe(1);

  await resend.click();
  await confirm.getByRole('button', { name: 'Send again' }).click();
  await expect(revision.locator('[data-revision-message="ok"]')).toContainText('A new delivery attempt was queued');
  await waitForFinal(person, revisionId, 2);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(revision.locator('[data-attempt]')).toHaveCount(2);

  // An uncertain attempt (written by the test-only seed) needs the owner's decision, with a confirmation.
  await seedUncertainAttempt(builtServer, revisionId);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText('Delivery uncertain: your decision is needed');
  await expect(revision.locator('[data-attempt-state="uncertain"]')).toContainText('Uncertain');
  await expect(revision.locator('[data-fault-code="lease_expired_while_sending"]')).toHaveCount(1);
  await expect(revision.getByRole('button', { name: /^Resend email/ })).toBeDisabled();
  await expect(revision).toContainText('Decide on the uncertain delivery first.');
  await page.locator('[data-history="submissions"]').screenshot({ path: screenshotPath(`history-submissions-${project}-synthetic.png`) });
  if (project === 'mobile') {
    await expectNoSidewaysScroll(page);
    await expectTapTargets([
      revision.getByRole('button', { name: /^Download PDF/ }),
      revision.getByRole('button', { name: 'Mark as delivered' }),
      revision.getByRole('button', { name: 'Resend the PDF' }),
    ]);
  }

  await revision.getByRole('button', { name: 'Mark as delivered' }).click();
  const markConfirm = revision.locator('[data-confirm="mark_delivered"]');
  await expect(markConfirm).toBeVisible();
  await expect(markConfirm).toBeFocused();
  await expect(markConfirm).toContainText('nothing is sent');
  await page.locator('[data-history="submissions"]').screenshot({ path: screenshotPath(`history-decision-${project}-synthetic.png`) });
  await markConfirm.getByRole('button', { name: 'Cancel' }).click();
  await expect(markConfirm).toHaveCount(0);
  expect((await attemptsOf(person, revisionId)).filter((item) => item.decision !== null), 'cancelling records no decision').toEqual([]);

  await revision.getByRole('button', { name: 'Mark as delivered' }).click();
  await markConfirm.getByRole('button', { name: 'Mark as delivered' }).click();
  await expect(revision.locator('[data-revision-message="ok"]')).toContainText('Recorded: you marked this attempt as delivered');
  await expect(revision.locator('[data-attempt-state="uncertain"]')).toContainText('You marked it as delivered');
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText('Delivery uncertain, decision recorded');
  await expect(revision.getByRole('button', { name: /^Resend email/ })).toBeEnabled();
  const decided = (await attemptsOf(person, revisionId)).filter((item) => item.state === 'uncertain');
  expect(decided.map((item) => [item.decision, item.decision_required])).toEqual([['mark_delivered', false]]);
});

test('an uncertain delivery can be resolved by resending the same PDF, after a confirmation that names the recipients', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(420_000);
  const person = await newPerson(adminSeed, builtServer, { settings: true, signature: true });
  const revisionId = await signOffPeriod(person);
  await waitForFinal(person, revisionId, 1);
  await seedUncertainAttempt(builtServer, revisionId);

  await signInPageAs(person.account, '#/history');
  const revision = card(page, revisionId);
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText('Delivery uncertain: your decision is needed');
  await revision.getByRole('button', { name: 'Resend the PDF' }).click();
  const confirm = revision.locator('[data-confirm="resend_uncertain"]');
  await expect(confirm).toContainText(TO);
  await expect(confirm).toContainText('may receive it twice');
  await confirm.getByRole('button', { name: 'Resend now' }).click();
  await expect(revision.locator('[data-revision-message="ok"]')).toContainText('queued for another delivery attempt');

  // The new attempt is delivered by the runner; the uncertain one keeps the owner's decision.
  await waitForFinal(person, revisionId, 2);
  const attempts = await attemptsOf(person, revisionId);
  expect(attempts.find((item) => item.state === 'uncertain')).toMatchObject({ decision: 'resend', decision_required: false });
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(revision.locator('[data-attempt-state="uncertain"]')).toContainText('You chose to resend');
  await expect(revision.locator('[data-attempt-state="accepted"], [data-attempt-state="failed_permanent"]')).toHaveCount(2);
});

test('an automatic submission reads "review pending" on the employee own screens (server fields mocked)', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(120_000);
  const person = await newPerson(adminSeed, builtServer, { settings: true, signature: true });
  const revisionId = await signOffPeriod(person);
  // The deadline automation is the later end-to-end task: the real finalization answer is changed to what
  // the server records for an automatic submission (origin deadline, review pending, no sign-off).
  await page.route('**/api/timesheets/*/finalization', async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as { revision: Record<string, unknown> | null; signoff: unknown };
    if (body.revision !== null) {
      body.revision = { ...body.revision, origin: 'deadline', review_state: 'pending' };
      body.signoff = null;
    }
    await route.fulfill({ status: response.status(), contentType: 'application/json', json: body });
  });
  await signInPageAs(person.account, '#/history');
  const revision = card(page, revisionId);
  await expect(revision.locator('[data-fact="origin"]')).toHaveText('Submitted automatically');
  await expect(revision.locator('[data-revision-badge="review"]')).toHaveText('Review pending');
  await expect(revision.locator('[data-fact="signed"]')).toHaveText('Not signed yet');
  await expect(revision.locator(`[data-correction-link="${person.payrollDate}"]`)).toHaveText('Review now');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Timesheet' }).click();
  await expect(page.locator('[data-grid-status="review"]')).toHaveText('Submitted automatically, review pending');
  await expect(page.locator('[data-grid-status="review"]')).toHaveAttribute('data-grid-status-key', 'submitted_auto_pending');
});

test('another account sees none of it: an empty history and a 404 for a foreign revision PDF', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(120_000);
  const owner = await newPerson(adminSeed, builtServer, { settings: true, signature: true, displayName: 'Synthetic Owner' });
  const revisionId = await signOffPeriod(owner);
  const other = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Bystander' });
  await signInPageAs(other.account, '#/history');
  await expect(page.locator('[data-history-empty="true"]')).toBeVisible();
  await expect(card(page, revisionId)).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `/api/revisions/${revisionId}/pdf`)).toBe(404);
  expect(await statusInPage(page, 'GET', '/api/revisions/00000000-0000-4000-8000-000000000000/pdf')).toBe(404);
});

/* ---- Submission settings ------------------------------------------------------------------------------ */

interface ApiSettings {
  settings: {
    seq: number;
    is_default: boolean;
    recipients: { to: string[]; cc: string[] };
    auto_submit: boolean;
    auto_note: { enabled: boolean; text: string };
    auto_image: { authorized: boolean; signature_attachment_id: string | null };
  };
}

const settingsOf = (person: Person) => person.api.call<ApiSettings>('GET', '/api/settings/submission').then((answer) => answer.settings);

test('settings: recipients, the automatic note line with its limits, the preview, and the auto-submit rule', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  test.setTimeout(120_000);
  const project = testInfo.project.name;
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Settings Owner' });
  await signInPageAs(person.account, '#/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  const form = page.getByRole('form', { name: 'Submission and email' });
  await expect(form).toBeVisible();

  // Defaults: nothing saved, the note line off with its default text, the rule says it is not saved.
  await expect(form.locator('[data-setting-rule="auto-submit"]')).toContainText('Not saved yet');
  await expect(form.getByRole('checkbox', { name: 'Add a note line to automatic submissions' })).not.toBeChecked();
  await expect(form.getByLabel('Note text')).toHaveValue('Automatic submission');
  await expect(form.getByLabel('Note text')).toBeDisabled();
  await expect(page.locator('[data-submission="image-option"]')).toHaveAttribute('data-image-state', 'no_signature');

  // A recipient is required; nothing is saved without one.
  await form.getByRole('button', { name: 'Save settings' }).click();
  await expect(form.locator('#submission-error-to')).toHaveText('Enter at least one recipient address.');
  await expect(form.getByLabel('Recipients (To)')).toBeFocused();
  expect((await settingsOf(person)).is_default).toBe(true);

  // The note text is one line of 1 to 120 characters: the limit is named, and nothing is saved.
  await form.getByLabel('Recipients (To)').fill(TO);
  await form.getByRole('checkbox', { name: 'Add a note line to automatic submissions' }).check();
  await form.getByLabel('Note text').fill('x'.repeat(121));
  await form.getByRole('button', { name: 'Save settings' }).click();
  await expect(form.locator('#submission-error-note')).toContainText('1 to 120');
  await expect(form.getByLabel('Note text')).toBeFocused();
  expect((await settingsOf(person)).is_default).toBe(true);

  await form.getByLabel('Note text').fill('Filed by the system');
  await form.getByRole('button', { name: 'Save settings' }).click();
  await expect(form.locator('[data-status-note="submission-saved"]')).toContainText('saved as version 1');
  expect(await settingsOf(person)).toMatchObject({ seq: 1, is_default: false, recipients: { to: [TO], cc: [] }, auto_note: { enabled: true, text: 'Filed by the system' } });
  await expect(form.getByRole('button', { name: 'Save settings' })).toBeDisabled();

  // The preview is the server's rendering: the note line appears in an automatic submission only.
  await form.getByRole('radio', { name: 'An automatic submission' }).check();
  await form.getByRole('button', { name: 'Preview email' }).click();
  const preview = page.locator('[data-submission="preview"]');
  await expect(preview).toHaveAttribute('data-preview-as', 'automatic');
  await expect(preview.locator('[data-preview-field="sign-off-status"]')).toHaveText('Filed by the system');
  await expect(preview.locator('[data-preview-field="subject"]')).toContainText('Filed by the system');
  await form.getByRole('radio', { name: 'A manual sign-off' }).check();
  await form.getByRole('button', { name: 'Preview email' }).click();
  await expect(preview).toHaveAttribute('data-preview-as', 'manual');
  await expect(preview.locator('[data-preview-field="sign-off-status"]')).toHaveText('Submitted');
  await expect(preview.locator('[data-preview-field="subject"]')).not.toContainText('Filed by the system');

  // The auto-submit switch states its effective rule, and offers the overdue choice only when it changes.
  await expect(form.locator('[data-setting-rule="auto-submit"]')).toContainText('Automatic submission is on');
  await expect(form.getByRole('checkbox', { name: /Also apply this change to drafts that are already overdue/ })).toHaveCount(0);
  await form.getByRole('checkbox', { name: /Submit automatically at the deadline/ }).uncheck();
  await expect(form.getByRole('checkbox', { name: /Also apply this change to drafts that are already overdue/ })).toBeVisible();
  await form.getByRole('button', { name: 'Save settings' }).click();
  await expect(form.locator('[data-status-note="submission-saved"]')).toContainText('saved as version 2');
  await expect(form.locator('[data-setting-rule="auto-submit"]')).toContainText('Automatic submission is off');
  expect((await settingsOf(person)).auto_submit).toBe(false);

  await page.screenshot({ path: screenshotPath(`settings-submission-${project}-synthetic.png`), fullPage: true });
  if (project === 'mobile') {
    await expectNoSidewaysScroll(page);
    await expectTapTargets([form.getByRole('button', { name: 'Preview email' }), form.getByRole('checkbox', { name: 'Add a note line to automatic submissions' }).locator('xpath=ancestor::label')]);
  }
});

/* ---- Signature upload and the automatic-image consent ---------------------------------------------------- */

test('signature upload: the consent is pre-selected, never dropped, and each outcome says what was recorded', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  test.setTimeout(180_000);
  const project = testInfo.project.name;
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Signer' });
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/signatures')) uploads.push(new URL(request.url()).search);
  });
  await signInPageAs(person.account, '#/settings');
  const upload = page.getByRole('form', { name: 'Signature image' });
  const consent = upload.getByRole('checkbox', { name: 'Use this image on automatic submissions' });
  const image = page.locator('[data-submission="image-option"]');
  await expect(upload).toBeVisible();
  await expect(consent).toBeChecked();
  await expect(upload.locator('[data-signature-state="none"]')).toBeVisible();

  // Settings were never saved: the ticked consent cannot be recorded, so the step order is shown and
  // the upload button waits. Uploading without authorizing is the honest alternative.
  await upload.getByLabel('Choose a PNG or JPEG image').setInputFiles({ name: 'signature-one.png', mimeType: 'image/png', buffer: signaturePng(9) });
  await expect(upload.locator('[data-signature-state="chosen"] img')).toBeVisible();
  await expect(upload.locator('[data-signature-step="settings-first"]')).toContainText('Save them first');
  await expect(upload.getByRole('button', { name: 'Upload signature' })).toBeDisabled();
  await page.screenshot({ path: screenshotPath(`settings-signature-step-${project}-synthetic.png`), fullPage: true });
  await upload.getByRole('button', { name: 'Go to submission settings' }).click();
  await expect(page.locator('#submission-title')).toBeFocused();
  await upload.getByRole('button', { name: 'Upload without authorizing' }).click();
  await expect(upload.locator('[data-upload-message="ok"]')).toContainText('will not print an image');
  expect(uploads).toEqual(['?authorize_auto_image=false']);
  const first = await person.api.call<{ signature: { id: string } }>('GET', '/api/signatures/current');
  expect((await settingsOf(person)).is_default, 'the unticked path stores no settings').toBe(true);
  await expect(upload.locator('[data-signature-state="saved"] img')).toBeVisible();
  await expect(image).toHaveAttribute('data-image-state', 'settings_required');

  // Save the settings, then authorize the saved image: one explicit, audited act.
  const form = page.getByRole('form', { name: 'Submission and email' });
  await form.getByLabel('Recipients (To)').fill(TO);
  await form.getByRole('button', { name: 'Save settings' }).click();
  await expect(form.locator('[data-status-note="submission-saved"]')).toBeVisible();
  await expect(image).toHaveAttribute('data-image-state', 'not_authorized');
  await image.getByRole('button', { name: 'Include my signature image on automatic submissions' }).click();
  await expect(image.locator('[data-status-note="image-option"]')).toContainText('Authorized');
  await expect(image).toHaveAttribute('data-image-state', 'authorized');
  expect((await settingsOf(person)).auto_image).toMatchObject({ authorized: true, signature_attachment_id: first.signature.id });

  // A second upload, consent still pre-selected and now recordable: one request, one transaction.
  await upload.getByLabel('Choose a PNG or JPEG image').setInputFiles({ name: 'signature-two.png', mimeType: 'image/png', buffer: signaturePng(7) });
  await expect(consent).toBeChecked();
  await expect(upload.locator('[data-signature-step="settings-first"]')).toHaveCount(0);
  await upload.getByRole('button', { name: 'Upload signature' }).click();
  await expect(upload.locator('[data-upload-message="ok"]')).toContainText('authorized for automatic submissions');
  expect(uploads.at(-1)).toBe('?authorize_auto_image=true');
  const second = await person.api.call<{ signature: { id: string } }>('GET', '/api/signatures/current');
  expect(second.signature.id).not.toBe(first.signature.id);
  expect((await settingsOf(person)).auto_image.signature_attachment_id).toBe(second.signature.id);
  await expect(image).toHaveAttribute('data-image-state', 'authorized');

  // A third upload with the option unticked records nothing: the older image stays authorized, and the
  // new one is offered for re-authorization.
  await upload.getByLabel('Choose a PNG or JPEG image').setInputFiles({ name: 'signature-three.png', mimeType: 'image/png', buffer: signaturePng(12) });
  await consent.uncheck();
  await upload.getByRole('button', { name: 'Upload signature' }).click();
  await expect(upload.locator('[data-upload-message="ok"]')).toContainText('will not print an image until you authorize one');
  expect(uploads.at(-1)).toBe('?authorize_auto_image=false');
  const third = await person.api.call<{ signature: { id: string } }>('GET', '/api/signatures/current');
  expect((await settingsOf(person)).auto_image.signature_attachment_id, 'unticked: the authorization did not move').toBe(second.signature.id);
  await expect(image).toHaveAttribute('data-image-state', 'authorized_other');
  await expect(consent).toBeChecked();
  await page.screenshot({ path: screenshotPath(`settings-signature-${project}-synthetic.png`), fullPage: true });
  await image.getByRole('button', { name: 'Use my new image on automatic submissions' }).click();
  await expect(image).toHaveAttribute('data-image-state', 'authorized');
  expect((await settingsOf(person)).auto_image.signature_attachment_id).toBe(third.signature.id);

  // The authorization can be taken back.
  await image.getByRole('button', { name: 'Stop including my image' }).click();
  await expect(image.locator('[data-status-note="image-option"]')).toContainText('revoked');
  await expect(image).toHaveAttribute('data-image-state', 'not_authorized');
  expect((await settingsOf(person)).auto_image.authorized).toBe(false);
  if (project === 'mobile') await expectNoSidewaysScroll(page);
});

test('a refused consent is never dropped: the 422 submission_settings_required keeps the file and the option and shows the step order (server answer mocked)', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(120_000);
  // Settings exist, so the form offers the authorizing upload; the server answer is then mocked as the T07B
  // route gives it when the saved settings are missing (the route itself is covered by its own tests).
  const person = await newPerson(adminSeed, builtServer, { settings: true, displayName: 'Synthetic Refused Signer' });
  await page.route('**/api/signatures?authorize_auto_image=true', async (route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      json: { error: { code: 'submission_settings_required', message: 'Save the submission settings before authorizing the signature image' } },
    });
  });
  await signInPageAs(person.account, '#/settings');
  const upload = page.getByRole('form', { name: 'Signature image' });
  await upload.getByLabel('Choose a PNG or JPEG image').setInputFiles({ name: 'signature.png', mimeType: 'image/png', buffer: signaturePng(9) });
  await expect(upload.getByRole('checkbox', { name: 'Use this image on automatic submissions' })).toBeChecked();
  await upload.getByRole('button', { name: 'Upload signature' }).click();
  await expect(upload.locator('[data-upload-message="step"]')).toContainText('not uploaded');
  await expect(upload.locator('[data-upload-message="step"]')).toContainText('nothing was authorized');
  await expect(upload.locator('[data-upload-message="step"]')).toContainText('Save your submission settings first');
  // Nothing is lost silently: the file is still chosen, the consent still ticked, and nothing was stored.
  await expect(upload.locator('[data-signature-state="chosen"] img')).toBeVisible();
  await expect(upload.getByRole('checkbox', { name: 'Use this image on automatic submissions' })).toBeChecked();
  expect((await person.api.call<{ signature: unknown }>('GET', '/api/signatures/current')).signature).toBeNull();
});
