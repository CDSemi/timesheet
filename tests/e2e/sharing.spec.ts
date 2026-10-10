import { randomBytes } from 'node:crypto';
import { crc32, deflateSync } from 'node:zlib';
import { type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { dayButtonName, namedDayButton } from './dayButton.ts';
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
 * Timesheet sharing through the real UI of the BUILT server (WP3-T13C, FR-17, AC-16): Settings,
 * Sharing, the "Shared with me" switcher, the persistent owner bar, view-only and edit shares,
 * the OT and PDF items, the next request after a revocation, and the administrator who sees no
 * timesheet details. Every test creates its own synthetic accounts over the admin API. The people
 * are on example.invalid; the signature image is generated at test time. The in-process runner
 * renders the PDF, so the PDF test waits for it; nothing is sent anywhere.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  // The refusals these tests provoke on purpose (403 a share without the item, 404 a share that ended
  // or a path that is never shared, 401 signed out) are the only expected resource messages.
  page.on('console', (message) => {
    const expected = /status of (401|403|404|409|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const TO = 'payroll-sharing@example.invalid';

/* ---- Synthetic accounts and data ---------------------------------------------------------------- */

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 160x48 PNG (dark strokes on white), generated at test time. */
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

interface Person {
  account: CreatedAccount;
  api: SeedClient;
  payrollDate: string;
}

/** A fresh account with a policy; `signoff` also saves recipients and a signature image (a sign-off needs both). */
async function newPerson(adminSeed: SeedClient, server: BuiltServer, displayName: string, options: { signoff?: boolean } = {}): Promise<Person> {
  const account = await createAccountByAdminApi(adminSeed, { displayName });
  const api = await new SeedClient(server.origin).signIn(account.email, account.password);
  const { todayLocal, currentPayrollDate } = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(addDays(todayLocal, -400)), 201);
  if (options.signoff === true) {
    await api.call('POST', '/api/settings/submission', { expected_seq: 0, to: [TO], cc: [], auto_submit: false }, 201);
    const login = await fetch(`${server.origin}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });
    const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
    const upload = await fetch(`${server.origin}/api/signatures`, {
      method: 'POST',
      headers: { 'content-type': 'image/png', origin: server.origin, cookie },
      body: new Uint8Array(signaturePng()),
    });
    expect(upload.status, 'signature upload').toBe(201);
  }
  return { account, api, payrollDate: currentPayrollDate };
}

/** A complete past day in the displayed period with a private synthetic note; returns the date and the note. */
async function seedOwnerDay(owner: Person): Promise<{ workDay: string; note: string }> {
  const [workDay = ''] = await owner.api.displayedPeriodFreeWorkdays();
  expect(workDay, 'a past free workday in the displayed period').not.toBe('');
  await owner.api.seedCompleteDay(workDay);
  const note = `private-synthetic-${randomBytes(6).toString('hex')}`;
  await owner.api.putDay(workDay, { notes: note });
  return { workDay, note };
}

interface ApiShare {
  id: string;
  items: { timesheets: string; ot_read: boolean; pdf_download: boolean };
}

async function givenShareId(owner: Person): Promise<string> {
  const { given } = await owner.api.call<{ given: ApiShare[] }>('GET', '/api/shares');
  const [first] = given;
  if (first === undefined) throw new Error('the owner has no given share');
  return first.id;
}

const grantByApi = (owner: Person, grantee: Person, items: ApiShare['items']) =>
  owner.api.call('POST', '/api/shares', { grantee_email: grantee.account.email, items }, 201);

/** On a phone Settings and Sign out sit under "More" in the tab bar; opens it when it is shown and closed. */
async function openMoreOnPhone(page: Page) {
  const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
  if (!(await more.isVisible())) return;
  if ((await more.getAttribute('aria-expanded')) !== 'true') await more.click();
}

/** Signs the current person out and signs the next one in; an optional hash is the first screen. */
async function switchUser(page: Page, signIn: (credentials: { email: string; password: string }, startHash?: string) => Promise<void>, who: { email: string; password: string }, startHash: string) {
  await openMoreOnPhone(page);
  const signOut = page.getByRole('button', { name: 'Sign out' });
  if (await signOut.isVisible()) {
    await signOut.click();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  }
  await signIn(who, startHash);
}

/** Every /api request the page makes from now on, as `METHOD /path`. */
function recordApiRequests(page: Page): { list: string[]; reset: () => void } {
  const list: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith('/api/')) list.push(`${request.method()} ${pathname}`);
  });
  return { list, reset: () => list.splice(0, list.length) };
}

/** Inside a shared view the only own-data calls are the shares list and the session probe; everything else is /api/shared/:ownerId. */
function expectOnlySharedRequests(list: readonly string[], ownerId: string) {
  const outside = list.filter((entry) => {
    const path = entry.slice(entry.indexOf(' ') + 1);
    return !path.startsWith(`/api/shared/${ownerId}/`) && path !== '/api/shares' && path !== '/api/auth/me';
  });
  expect(outside, 'requests outside /api/shared/:ownerId').toEqual([]);
  expect(list.some((entry) => entry.includes(`/api/shared/${ownerId}/`)), 'at least one shared request').toBe(true);
}

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

const switcher = (page: Page) => page.locator('.shell-switcher select');
const bar = (page: Page) => page.locator('[data-share-bar]');

/* ---- Settings, Sharing, and a view-only share ----------------------------------------------------- */

test('Settings, Sharing: the form defaults, the PDF note, a view-only grantee without any edit control, only /api/shared requests, and leaving', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(120_000);
  const project = testInfo.project.name;
  const owner = await newPerson(adminSeed, builtServer, 'Synthetic Owner');
  const grantee = await newPerson(adminSeed, builtServer, 'Synthetic Grantee');
  const { workDay, note } = await seedOwnerDay(owner);

  // The owner grants by exact email; the form starts with timesheets view on, OT off and PDF off.
  await signInPageAs(owner.account, '#/settings');
  const form = page.getByRole('form', { name: 'Share my timesheets' });
  await expect(form).toBeVisible();
  await expect(form.getByRole('radio', { name: 'View only' })).toBeChecked();
  await expect(form.getByRole('radio', { name: 'None' })).not.toBeChecked();
  await expect(form.getByRole('radio', { name: 'Can edit' })).not.toBeChecked();
  await expect(form.getByRole('switch', { name: 'OT summary and ledger (read only)' })).not.toBeChecked();
  const pdfSwitch = form.getByRole('switch', { name: 'Final PDF downloads' });
  await expect(pdfSwitch).not.toBeChecked();
  await expect(form.getByText('PDFs contain your signature image')).toBeVisible();
  await expect(pdfSwitch).toHaveAccessibleDescription('PDFs contain your signature image');

  // An unknown address is refused in words; nothing is created.
  await form.getByLabel('Account email').fill(`nobody-${randomBytes(4).toString('hex')}@example.invalid`);
  await form.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(form.locator('[data-error="share-grant"]')).toHaveText('No active account can receive a share at this address.');
  // With every item off the form refuses before asking the server.
  await form.getByLabel('Account email').fill(grantee.account.email);
  await form.getByRole('radio', { name: 'None' }).check();
  await expect(form.getByText('Turn on at least one shared item.')).toBeVisible();
  await expect(form.getByRole('button', { name: 'Share', exact: true })).toBeDisabled();
  await form.getByRole('radio', { name: 'View only' }).check();
  await form.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.locator('[data-status="share"]')).toHaveText('Shared with Synthetic Grantee.');
  const given = page.getByRole('list', { name: 'Shares I gave' });
  await expect(given.getByText('Timesheets: view only')).toBeVisible();
  await expect(given.getByText('Final PDF downloads')).toHaveCount(0);
  await page.locator('[data-settings="sharing"]').screenshot({ path: screenshotPath(`sharing-settings-${project}-synthetic.png`) });
  await expectNoSidewaysScroll(page);

  // The grantee opens the owner's timesheets from "Shared with me".
  const recorded = recordApiRequests(page);
  await switchUser(page, signInPageAs, grantee.account, '#/timesheet');
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await switcher(page).selectOption({ label: 'Synthetic Owner' });
  // WP5-UX-AX-06: the choice alone changes nothing; the explicit Open goes there.
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await page.getByRole('form', { name: 'Shared with me' }).getByRole('button', { name: 'Open', exact: true }).click();
  await expect(bar(page).locator('[data-share-bar-title]')).toHaveText("Viewing Synthetic Owner's timesheets - view only");
  await expect(bar(page).getByText('Timesheets: view only')).toBeVisible();
  await expect(page.getByRole('heading', { name: "Synthetic Owner's timesheet" })).toBeVisible();
  await expect(page.locator(`[data-day="${workDay}"]`).first()).toBeVisible();
  recorded.reset();

  // Nothing that changes data is on the page: absent, not disabled.
  for (const name of ['Clock in', 'Clock out', 'Change several days', 'Open day', 'Preview changes', 'Select all', 'Clear']) {
    await expect(page.getByRole('button', { name, exact: true }), name).toHaveCount(0);
  }
  await expect(page.getByLabel('Open a day')).toHaveCount(0);
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: dayButtonName('Edit', workDay) })).toHaveCount(0);
  // The label cells are plain text: no in-cell label picker without edit rights.
  await expect(page.locator('[data-label-picker]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Label for / })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /review/i })).toHaveCount(0);
  // The owner's signature lines and review state are not part of a shared view.
  await expect(page.locator('[data-signature], [data-sheet-review-link]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Shared views' }).getByRole('link')).toHaveText(['Timesheet', 'Revisions']);

  // A read-only day: the figures and fields are shown, and no add, edit, delete or save control exists.
  await page.screenshot({ path: screenshotPath(`sharing-view-only-${project}-synthetic.png`), animations: 'disabled' });
  await namedDayButton(page, workDay, 'View').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: new RegExp(`Day .*${workDay}`) })).toBeVisible();
  await expect(dialog.locator('[data-day-fields="read-only"]')).toContainText(note);
  for (const name of ['Add session', 'Save day fields', 'Confirm delete']) {
    await expect(dialog.getByRole('button', { name }), name).toHaveCount(0);
  }
  await expect(dialog.getByRole('button', { name: /^(Edit|Delete) session/ })).toHaveCount(0);
  await expect(dialog.locator('textarea')).toHaveCount(0);
  await page.screenshot({ path: screenshotPath(`sharing-view-only-day-${project}-synthetic.png`), animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Next period' }).click();
  await expect(page.getByRole('heading', { name: "Synthetic Owner's timesheet" })).toBeVisible();
  await expectNoSidewaysScroll(page);
  expectOnlySharedRequests(recorded.list, owner.account.id);

  // The server refuses what the share does not hold, whatever the page shows.
  const shared = `/api/shared/${owner.account.id}`;
  expect(await statusInPage(page, 'PUT', `${shared}/days/${workDay}`, { category: 'Worked', leave_minutes: 0, leave_kind: null, wfh: false, notes: 'x', expected_version: null })).toBe(403);
  expect(await statusInPage(page, 'POST', `${shared}/clock/in`, { input_zone: 'America/Los_Angeles' })).toBe(404);
  expect(await statusInPage(page, 'GET', `${shared}/ot/summary`)).toBe(403);
  expect(await statusInPage(page, 'GET', `${shared}/settings/submission`)).toBe(404);
  expect(await statusInPage(page, 'GET', '/api/shares')).toBe(200);
  // A view address of an item the share does not hold falls back to the first view it does hold.
  await page.evaluate(`window.location.hash = '#/shared/${owner.account.id}/ot'`);
  await expect(bar(page).locator('[data-share-bar-title]')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Shared views' }).getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-shared-view="ot"]')).toHaveCount(0);

  // Leaving takes effect on the next request and removes the switcher.
  await openMoreOnPhone(page);
  await page.getByRole('link', { name: 'Settings' }).click();
  const received = page.getByRole('list', { name: 'Shares I received' });
  await expect(received.getByText('Timesheets: view only')).toBeVisible();
  await received.getByRole('button', { name: "Leave Synthetic Owner's shared items" }).click();
  const confirm = page.getByRole('group', { name: "Leave Synthetic Owner's shared items?" });
  await expect(confirm).toBeFocused();
  await confirm.getByRole('button', { name: 'Leave', exact: true }).click();
  await expect(page.locator('[data-status="share"]')).toHaveText("You left Synthetic Owner's shared items.");
  await expect(switcher(page)).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `${shared}/timesheets/${owner.payrollDate}`)).toBe(404);
});

/* ---- Edit: a change to edit, and the edit is attributed in the owner's history --------------------- */

test('the owner changes the share to edit; the grantee edits a day without Clock in/out and the owner History names the grantee', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(120_000);
  const project = testInfo.project.name;
  const owner = await newPerson(adminSeed, builtServer, 'Synthetic Owner');
  const grantee = await newPerson(adminSeed, builtServer, 'Synthetic Grantee');
  const { workDay } = await seedOwnerDay(owner);
  await grantByApi(owner, grantee, { timesheets: 'view', ot_read: false, pdf_download: false });

  // The owner changes the items in Settings (a change of items revokes and replaces the share in one step).
  await signInPageAs(owner.account, '#/settings');
  const row = page.getByRole('list', { name: 'Shares I gave' }).locator('li', { hasText: 'Synthetic Grantee' });
  await row.getByRole('button', { name: 'Change items shared with Synthetic Grantee' }).click();
  await row.getByRole('radio', { name: 'Can edit' }).check();
  await row.getByRole('button', { name: 'Save items' }).click();
  await expect(page.locator('[data-status="share"]')).toContainText('The items shared with Synthetic Grantee were changed.');
  await expect(row.getByText('Timesheets: can edit')).toBeVisible();

  const recorded = recordApiRequests(page);
  await switchUser(page, signInPageAs, grantee.account, `#/shared/${owner.account.id}/timesheet`);
  await expect(bar(page).locator('[data-share-bar-title]')).toHaveText("Viewing Synthetic Owner's timesheets - can edit");
  await expect(page.getByRole('heading', { name: "Synthetic Owner's timesheet" })).toBeVisible();
  // Edit rights show the edit controls (batch mode is opened first), but still no Clock in/out and no review.
  await expect(page.getByRole('button', { name: 'Preview changes' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Change several days' }).click();
  await expect(page.getByRole('button', { name: 'Preview changes' })).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('button', { name: 'Preview changes' })).toHaveCount(0);
  await expect(page.getByLabel('Open a day')).toBeVisible();
  await expect(namedDayButton(page, workDay, 'Edit')).toBeVisible();
  for (const name of ['Clock in', 'Clock out']) await expect(page.getByRole('button', { name, exact: true }), name).toHaveCount(0);
  await expect(page.getByRole('link', { name: /review/i })).toHaveCount(0);
  await expect(page.locator('[data-signature], [data-sheet-review-link]')).toHaveCount(0);
  recorded.reset();

  // The in-cell label picker writes through the share as well (a one-entry batch preview, then its
  // commit, under /api/shared/:ownerId). It runs on the same day before the notes edit, which stays
  // the newest change; "Work from home" keeps the category Worked, so no conflict review is needed.
  await page.getByRole('button', { name: new RegExp(`^Label for ${workDay}`) }).click();
  await page.getByRole('listbox', { name: `Label for ${workDay}` }).getByRole('option', { name: 'Work from home', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  expect(await owner.api.dayView(workDay)).toMatchObject({ category: 'Worked', wfh: true });
  expect(recorded.list.filter((entry) => entry.endsWith('/days/batch'))).toEqual([
    `POST /api/shared/${owner.account.id}/days/batch`,
    `POST /api/shared/${owner.account.id}/days/batch`,
  ]);

  const grantedNote = `edited-by-grantee-${randomBytes(4).toString('hex')}`;
  await page.screenshot({ path: screenshotPath(`sharing-edit-${project}-synthetic.png`), animations: 'disabled' });
  await namedDayButton(page, workDay, 'Edit').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: new RegExp(`Day editor .*${workDay}`) })).toBeVisible();
  await dialog.getByLabel('Notes').fill(grantedNote);
  await dialog.getByRole('button', { name: 'Save day fields' }).click();
  await expect(dialog.getByText('Day fields saved.')).toBeVisible();
  await page.screenshot({ path: screenshotPath(`sharing-edit-day-${project}-synthetic.png`), animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Close' }).click();
  // Focus returns to the day's button.
  await expect(namedDayButton(page, workDay, 'Edit')).toBeFocused();
  expectOnlySharedRequests(recorded.list, owner.account.id);
  expect((await owner.api.dayView(workDay)).entry?.notes).toBe(grantedNote);
  // The server also refuses the live clock for an edit share.
  expect(await statusInPage(page, 'POST', `/api/shared/${owner.account.id}/clock/in`, { input_zone: 'America/Los_Angeles' })).toBe(404);
  // The review hint belongs to the owner: the shared view and the review route show and serve none (WP3-C-01).
  await expect(page.locator('[data-grantee-changes]')).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `/api/shared/${owner.account.id}/timesheets/${owner.payrollDate}/review`)).toBe(404);

  // The owner's History names the grantee for that change.
  await switchUser(page, signInPageAs, owner.account, '#/history');
  const attributed = page.locator('[data-via-share="true"]').first();
  await expect(attributed.locator('[data-history-actor="grantee"]')).toHaveText('Changed by Synthetic Grantee (shared access)');
  await expect(attributed).toContainText(grantedNote);
  await expect(page.locator('[data-via-share="false"] [data-history-actor="grantee"]')).toHaveCount(0);
  await page.locator('[data-via-share="true"]').first().screenshot({ path: screenshotPath(`sharing-history-${project}-synthetic.png`) });

  // The owner's Review says which days were last changed by the grantee, before Sign off (WP3-C-01).
  await page.goto(`#/review/${owner.payrollDate}`);
  await expect(page.getByRole('heading', { name: 'Review and sign off' })).toBeVisible();
  const hint = page.locator('[data-grantee-changes]');
  await expect(hint).toBeVisible();
  await expect(hint.locator('[data-grantee-change]')).toHaveText('1 day last changed by Synthetic Grantee');
  await expect(hint).toContainText('not part of what you sign');
  // Visible without scrolling on a phone as well: it sits above the day table and the sign-off form.
  await expect(hint).toBeInViewport();
  await page.screenshot({ path: screenshotPath(`sharing-review-hint-${project}-synthetic.png`), animations: 'disabled' });
  // The owner's own change takes the day over: the hint goes once the owner changes that day again.
  await owner.api.putDay(workDay, { notes: `${grantedNote}-owner` });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review and sign off' })).toBeVisible();
  await expect(page.locator('[data-grantee-changes]')).toHaveCount(0);
});

/* ---- OT and PDF items on and off ----------------------------------------------------------------- */

test('the OT and PDF items: read-only OT, a revision list with a PDF download, and both absent again when switched off', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(300_000);
  const project = testInfo.project.name;
  const owner = await newPerson(adminSeed, builtServer, 'Synthetic Owner', { signoff: true });
  const grantee = await newPerson(adminSeed, builtServer, 'Synthetic Grantee');
  await seedOwnerDay(owner);
  const review = await owner.api.call<{ expected_version: number; payload_hash: string }>('GET', `/api/timesheets/${owner.payrollDate}/review`);
  const signed = await owner.api.call<{ revision: { id: string } }>(
    'POST',
    `/api/timesheets/${owner.payrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: 'Synthetic Owner', incomplete_evidence_acknowledged: true },
    201,
  );
  const revisionId = signed.revision.id;
  // The runner (every 15 s) renders the PDF; the revision list reports its state.
  await expect
    .poll(async () => (await owner.api.call<{ revisions: Array<{ id: string; pdf_state: string | null }> }>('GET', '/api/revisions')).revisions.find((item) => item.id === revisionId)?.pdf_state, {
      timeout: 170_000,
      intervals: [2_000],
      message: 'the PDF of the signed revision is ready',
    })
    .toBe('ready');

  const shareItems = { timesheets: 'view', ot_read: true, pdf_download: true };
  await grantByApi(owner, grantee, shareItems);
  const shareId = await givenShareId(owner);
  const base = `/api/shared/${owner.account.id}`;
  const recorded = recordApiRequests(page);
  await switchUser(page, signInPageAs, grantee.account, `#/shared/${owner.account.id}/ot`);

  // OT item: the balances and the ledger, with no leave form, no action and no export.
  await expect(bar(page).getByText('OT summary and ledger (read only)')).toBeVisible();
  await expect(bar(page).getByText('Final PDF downloads')).toBeVisible();
  await expect(page.locator('[data-shared-view="ot"]')).toBeVisible();
  recorded.reset();
  await expect(page.getByRole('region', { name: 'OT balances' })).toBeVisible();
  await expect(page.locator('[data-balance="available"]')).toBeVisible();
  for (const name of ['Reserve leave', 'Record use', 'Cancel request', 'Reverse use']) await expect(page.getByRole('button', { name }), name).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Download evidence CSV' })).toHaveCount(0);
  await page.screenshot({ path: screenshotPath(`sharing-ot-${project}-synthetic.png`), fullPage: true, animations: 'disabled' });
  expect(await statusInPage(page, 'POST', `${base}/ot/leave`, {})).toBe(404);

  // PDF item: the revision status list and the download.
  await bar(page).getByRole('link', { name: 'Revisions' }).click();
  const card = page.locator(`[data-revision="${revisionId}"]`);
  await expect(card).toBeVisible();
  await expect(card.locator('[data-revision-badge="number"]')).toHaveText('Revision 1');
  await expect(card.locator('[data-revision-badge="review"]')).toHaveText('Signed');
  await expect(card.locator('[data-revision-badge="pdf"]')).toHaveText('PDF ready');
  await expect(card).not.toContainText('@');
  await page.screenshot({ path: screenshotPath(`sharing-revisions-${project}-synthetic.png`), fullPage: true, animations: 'disabled' });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    card.getByRole('button', { name: /^Download PDF/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^timesheet-\d{4}-\d{2}-\d{2}-r1\.pdf$/);
  await expect(card.getByText(/^Downloaded timesheet-/)).toBeVisible();
  expectOnlySharedRequests(recorded.list, owner.account.id);

  // The owner turns OT and PDF off: on the grantee's next request both are gone, in the page and at the server.
  await owner.api.call('PUT', `/api/shares/${shareId}`, { items: { timesheets: 'view', ot_read: false, pdf_download: false } });
  await page.reload();
  await expect(bar(page).locator('[data-share-bar-title]')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Shared views' }).getByRole('link')).toHaveText(['Timesheet', 'Revisions']);
  await expect(bar(page).getByText('OT summary and ledger (read only)')).toHaveCount(0);
  await bar(page).getByRole('link', { name: 'Revisions' }).click();
  await expect(page.locator(`[data-revision="${revisionId}"]`)).toBeVisible();
  await expect(page.getByRole('button', { name: /^Download PDF/ })).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `${base}/revisions/${revisionId}/pdf`)).toBe(403);
  expect(await statusInPage(page, 'GET', `${base}/ot/ledger`)).toBe(403);

  // PDF only: the revision list and the download, with no timesheet.
  // A change of items replaces the share row, so its id is read again.
  await owner.api.call('PUT', `/api/shares/${await givenShareId(owner)}`, { items: { timesheets: 'none', ot_read: false, pdf_download: true } });
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Shared views' }).getByRole('link')).toHaveText(['Revisions']);
  await expect(bar(page).locator('[data-share-bar-title]')).toHaveText("Viewing Synthetic Owner's shared items");
  await expect(page.getByRole('button', { name: /^Download PDF/ })).toBeVisible();
  expect(await statusInPage(page, 'GET', `${base}/timesheets/${owner.payrollDate}`)).toBe(403);
});

/* ---- Revocation on the next request, and the administrator -------------------------------------- */

test('a revoked share ends on the grantee next request with a clear message and the own view; the administrator sees no timesheet details', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(120_000);
  const project = testInfo.project.name;
  const owner = await newPerson(adminSeed, builtServer, 'Synthetic Owner');
  const grantee = await newPerson(adminSeed, builtServer, 'Synthetic Grantee');
  const { workDay, note } = await seedOwnerDay(owner);
  await grantByApi(owner, grantee, { timesheets: 'view', ot_read: false, pdf_download: false });
  const shareId = await givenShareId(owner);

  await signInPageAs(grantee.account, `#/shared/${owner.account.id}/timesheet`);
  await expect(bar(page).locator('[data-share-bar-title]')).toHaveText("Viewing Synthetic Owner's timesheets - view only");
  await expect(page.locator(`[data-day="${workDay}"]`).first()).toBeVisible();

  // The owner ends the share while the grantee has the page open; nothing changes until the next request.
  await owner.api.call('POST', `/api/shares/${shareId}/revoke`, {});
  await expect(bar(page)).toBeVisible();
  await page.getByRole('button', { name: 'Next period' }).click();
  const flash = page.locator('[data-flash="share-ended"]');
  await expect(flash).toContainText("Access to Synthetic Owner's timesheets has ended. You are back in your own timesheets.");
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(bar(page)).toHaveCount(0);
  await expect(switcher(page)).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(note);
  await page.screenshot({ path: screenshotPath(`sharing-revoked-${project}-synthetic.png`), animations: 'disabled' });
  await flash.getByRole('button', { name: 'Dismiss' }).click();
  await expect(flash).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `/api/shared/${owner.account.id}/days/${workDay}`)).toBe(404);

  // A deep link without a share leads home with a message too (here for the administrator).
  await switchUser(page, signInPageAs, builtServer.credentials.admin, `#/shared/${owner.account.id}/timesheet`);
  await expect(page.locator('[data-flash="share-ended"]')).toContainText('That shared view is not available. You are back in your own timesheets.');
  expect(await page.content()).not.toContain(note);
  expect(await statusInPage(page, 'GET', `/api/shared/${owner.account.id}/timesheets/${owner.payrollDate}`)).toBe(404);
  expect(await statusInPage(page, 'GET', `/api/shared/${owner.account.id}/days/${workDay}`)).toBe(404);
  // The administrator's share list names no timesheet content.
  const adminShares = JSON.stringify(await adminSeed.call('GET', '/api/admin/shares'));
  expect(adminShares).not.toContain(note);
  expect(adminShares).not.toContain(workDay);
});

/* ---- WP5-UX-B6-01: the phone first screen holds with a received share (docs/04 line 48) ---------------- */

test.describe('phone first screen with a received share', () => {
  test.skip(({ isMobile }) => !isMobile, 'The first-screen budget is the 390x844 phone');

  for (const [situation, zone] of [
    ['the zone note shown', 'Asia/Ho_Chi_Minh'],
    ['the viewing zone equal to the reporting zone', 'America/Los_Angeles'],
  ] as const) {
    test.describe(situation, () => {
      test.use({ timezoneId: zone });

      test('the first day row is fully visible above the tab bar and the shell bar stays one row', async ({
        page,
        adminSeed,
        builtServer,
        signInPageAs,
      }) => {
        test.setTimeout(120_000);
        const owner = await newPerson(adminSeed, builtServer, 'Synthetic Owner');
        const grantee = await newPerson(adminSeed, builtServer, 'Synthetic Grantee');
        await grantByApi(owner, grantee, { timesheets: 'view', ot_read: false, pdf_download: false });
        await signInPageAs(grantee.account, '#/timesheet');
        await expect(page.locator('[data-day]')).toHaveCount(14);
        await expect(switcher(page)).toBeVisible();
        if (zone === 'Asia/Ho_Chi_Minh') await expect(page.locator('[data-zone-note]')).toBeVisible();
        else await expect(page.locator('[data-zone-note]')).toHaveCount(0);
        const first = await page.locator('[data-day]').first().boundingBox();
        const tabs = await page.locator('.shell-tabs').boundingBox();
        const shellBar = await page.locator('.shell-bar').boundingBox();
        expect(first, 'first day row box').not.toBeNull();
        expect(tabs, 'tab bar box').not.toBeNull();
        expect(shellBar, 'shell bar box').not.toBeNull();
        expect((first?.y ?? 0) + (first?.height ?? 0), 'bottom of the first day row is at or above the tab bar').toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
        expect(shellBar?.height ?? 0, 'the compact shell bar is one row').toBeLessThanOrEqual(60);
        expect(await page.evaluate('window.scrollY')).toBe(0);
        // The switcher keeps its visible label, its 44px targets and its place inside the bar.
        const select = page.getByRole('combobox', { name: 'Shared with me' });
        const open = page.getByRole('form', { name: 'Shared with me' }).getByRole('button', { name: 'Open', exact: true });
        for (const box of [await select.boundingBox(), await open.boundingBox()]) {
          expect(box?.height ?? 0, 'target height').toBeGreaterThanOrEqual(44);
          expect(box?.width ?? 0, 'target width').toBeGreaterThanOrEqual(44);
          expect((box?.y ?? 0) + (box?.height ?? 0), 'inside the shell bar').toBeLessThanOrEqual((shellBar?.y ?? 0) + (shellBar?.height ?? 0) + 0.5);
        }
        await expect(page.locator('.shell-switcher label')).toContainText('Shared with me');
        await expectNoSidewaysScroll(page);
      });
    });
  }
});
