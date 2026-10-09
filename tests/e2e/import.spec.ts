import { createHash } from 'node:crypto';
import { type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { buildSyntheticWorkbook } from '../support/syntheticWorkbook.ts';
import { type BuiltServer, expect, newPerson, type Person, screenshotPath, SeedClient, statusInPage, test } from './fixtures.ts';

/*
 * WP4-T11: the workbook import and the opening balance, on both viewports. Every workbook is generated in memory with
 * the WP4-T08 generator from the tracked sanitized template and handed to the page as a buffer; nothing is written to
 * disk or to the repository. Every test gets its own synthetic person (admin API), so an import never changes what
 * another test sees. The imported period is always the one before the period the app shows first, so it has ended
 * whatever day the suite runs on; expected counts come from the server's own plan, never from a calendar.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  // A CSP violation is a console error. The signed-out probe (401) and the refusals these tests provoke on purpose
  // (404, 409, 413, 415, 422) are the only expected resource errors.
  page.on('console', (message) => {
    const expected = /status of (401|404|409|413|415|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** One dated sheet: an unknown label (skip only), a formula-cache label (skip or import) and an OT-used day (skip only). */
function workbookFor(payrollDate: string): Uint8Array {
  return buildSyntheticWorkbook({
    periods: [{ payrollDate, days: { 1: { label: 'Mystery label' }, 2: { labelFormulaCache: 'Holiday' }, 3: { label: 'Off day (overtime used)' } } }],
  });
}

interface Layout {
  payrollDate: string;
  unknownDay: string;
  cacheDay: string;
  offDay: string;
}

function layoutFor(person: Person): Layout {
  const payrollDate = addDays(person.payrollDate, -14);
  const start = addDays(payrollDate, -18);
  return { payrollDate, unknownDay: addDays(start, 1), cacheDay: addDays(start, 2), offDay: addDays(start, 3) };
}

async function freshPerson(builtServer: BuiltServer, adminSeed: SeedClient): Promise<Person> {
  return newPerson(adminSeed, builtServer, { signature: 'none' });
}

function upload(page: Page, bytes: Uint8Array, name = 'synthetic-hours.xlsx') {
  return page.locator('[data-import-file]').setInputFiles({ name, mimeType: XLSX, buffer: Buffer.from(bytes) });
}

interface PlanJson {
  plan: { importable_days: number; decisions_required: Array<{ work_date: string; allowed_actions: string[] }> };
}

/** Signs in over HTTP and uploads the workbook as the person (a setup shortcut for tests about what follows). */
async function importOverApi(server: BuiltServer, person: Person, bytes: Uint8Array, importDays: readonly string[] = []): Promise<string> {
  const login = await fetch(`${server.origin}/api/auth/login`, {
    method: 'POST',
    headers: { origin: server.origin, 'content-type': 'application/json' },
    body: JSON.stringify({ email: person.account.email, password: person.account.password }),
  });
  expect(login.status, 'login').toBe(200);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
  const headers = { origin: server.origin, cookie, 'content-type': XLSX };
  const uploaded = await fetch(`${server.origin}/api/imports`, { method: 'POST', headers, body: Buffer.from(bytes) });
  expect(uploaded.status, 'upload').toBe(201);
  const id = ((await uploaded.json()) as { import: { id: string } }).import.id;
  const committed = await fetch(`${server.origin}/api/imports/${id}/commit`, {
    method: 'POST',
    headers: { origin: server.origin, cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ decisions: await decisionsFor(person, id, importDays) }),
  });
  expect(committed.status, 'commit').toBe(200);
  return id;
}

/** Skip every day that needs a decision, except the listed ones, which are imported (each must allow it). */
async function decisionsFor(person: Person, id: string, importDays: readonly string[]): Promise<Array<{ work_date: string; action: string }>> {
  const answer = await person.api.call<{ import: PlanJson }>('GET', `/api/imports/${id}`);
  return answer.import.plan.decisions_required.map((item) => ({
    work_date: item.work_date,
    action: importDays.includes(item.work_date) && item.allowed_actions.includes('import') ? 'import' : 'skip',
  }));
}

/** Below 768px the shell shows the bottom tab bar, where Settings, Import, Admin and Sign out sit under "More". */
function isPhone(page: Page): boolean {
  return (page.viewportSize()?.width ?? Number.POSITIVE_INFINITY) < 768;
}

/** Opens "More" on a phone (once; an open panel stays open). The desktop bar has nothing to open. */
async function openMoreOnPhone(page: Page) {
  if (!isPhone(page)) return;
  const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
  if ((await more.getAttribute('aria-expanded')) !== 'true') await more.click();
}

test('upload, preview with source cells, decide, confirm and commit; the same workbook is already imported', async (
  { page, context, builtServer, adminSeed, signInPageAs },
  testInfo,
) => {
  const person = await freshPerson(builtServer, adminSeed);
  const layout = layoutFor(person);
  const bytes = workbookFor(layout.payrollDate);
  await signInPageAs(person.account, '#/import');

  const nav = page.getByRole('navigation', { name: 'Main' });
  // Import is its own entry under "More" on a phone; the desktop bar marks Settings, the screen it is reached from.
  await openMoreOnPhone(page);
  await expect(nav.getByRole('link', { name: isPhone(page) ? 'Import' : 'Settings' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Import and opening balance' })).toBeVisible();

  // 1. Upload: only a file is needed; nothing is stored until it is sent.
  await expect(page.getByRole('button', { name: 'Upload and preview' })).toBeDisabled();
  await upload(page, bytes);
  await page.getByRole('button', { name: 'Upload and preview' }).click();
  await expect(page.locator('[data-import-notice="created"]')).toBeVisible();

  // 2. Preview: the source hash is the uploaded bytes' hash, the mapping version and the three template defects show.
  const preview = page.locator('[data-import-preview]');
  await expect(preview.locator('[data-import-sha]')).toHaveText(createHash('sha256').update(bytes).digest('hex'));
  await expect(preview.getByText('Mapping version').locator('xpath=following-sibling::dd')).toHaveText('1');
  for (const code of ['formula_hours_8_5', 'weekly_total_omits_sunday', 'today_signature_date']) {
    await expect(preview.locator(`[data-finding="${code}"]`).first()).toBeVisible();
  }
  await expect(preview.locator(`[data-day="${layout.cacheDay}"]`)).toContainText('Holiday');
  await expect(preview.locator(`[data-day="${layout.unknownDay}"]`)).toContainText('Mystery label');
  await expect(preview.locator(`[data-day="${layout.unknownDay}"]`)).toContainText(/!F14/);
  await expect(preview.locator(`[data-day="${layout.unknownDay}"]`)).toContainText('Needs a decision');
  await expect(preview.locator(`[data-period="${layout.payrollDate}"]`)).toContainText('Ready to import');

  // 3. Decisions: skip is the default, a skip-only day offers nothing else, a formula-cache day may be imported.
  const unknown = page.locator(`[data-decision-date="${layout.unknownDay}"]`);
  await expect(unknown.locator('input[data-action="skip"]')).toBeChecked();
  await expect(unknown.locator('input[data-action="skip"]')).toBeDisabled();
  await expect(unknown.locator('input[data-action="import"]')).toHaveCount(0);
  await expect(page.locator(`[data-decision-date="${layout.offDay}"] input[data-action="import"]`)).toHaveCount(0);
  const cache = page.locator(`[data-decision-date="${layout.cacheDay}"]`);
  await expect(cache.locator('input[data-action="skip"]')).toBeChecked();
  await expect(cache.locator('input[data-action="import"]')).toBeEnabled();
  await page.screenshot({ path: screenshotPath(`import-preview-${testInfo.project.name}-synthetic.png`), fullPage: true });

  const id = (await person.api.call<{ imports: Array<{ id: string; state: string }> }>('GET', '/api/imports')).imports[0]?.id ?? '';
  const plan = (await person.api.call<{ import: PlanJson }>('GET', `/api/imports/${id}`)).import.plan;
  const required = plan.decisions_required.length;
  expect(plan.decisions_required.find((item) => item.work_date === layout.cacheDay)?.allowed_actions).toEqual(['skip', 'import']);
  expect(plan.decisions_required.find((item) => item.work_date === layout.unknownDay)?.allowed_actions).toEqual(['skip']);

  // A second tab holds the same preview with the same decision, for the replay below.
  const second = await context.newPage();
  await second.goto('/#/import');
  await upload(second, bytes);
  await second.getByRole('button', { name: 'Upload and preview' }).click();
  await expect(second.locator('[data-import-notice="existing_preview"]')).toBeVisible();
  await second.locator(`[data-decision-date="${layout.cacheDay}"] input[data-action="import"]`).check();
  await second.getByRole('button', { name: 'Review and commit' }).click();

  // 4. Commit needs a confirmation that names what is written; going back changes nothing.
  await cache.locator('input[data-action="import"]').check();
  await page.getByRole('button', { name: 'Review and commit' }).click();
  const imported = plan.importable_days + 1;
  const summary = page.locator('[data-confirm-summary]');
  await expect(summary).toContainText(`${imported} days in 1 period will be saved as "Imported, unverified".`);
  await expect(summary).toContainText(`${required - 1} day${required - 1 === 1 ? '' : 's'} will be skipped by decision.`);
  await page.getByRole('button', { name: 'Back to the preview' }).click();
  expect((await person.api.call<{ imports: Array<{ state: string }> }>('GET', '/api/imports')).imports[0]?.state).toBe('preview');
  await page.getByRole('button', { name: 'Review and commit' }).click();
  await page.getByRole('button', { name: 'Confirm import' }).click();
  await expect(page.locator('[data-import-notice="committed"]')).toBeVisible();
  await expect(page.locator('[data-import-result]')).toContainText(`${imported} days in 1 period imported as "Imported, unverified"`);
  await expect(page.locator('[data-import-state="committed"]')).toBeVisible();

  const sheet = await person.api.call<{ timesheet: { imported_unverified: boolean; finalized: boolean }; days: Array<{ work_date: string; category: string; sessions: unknown[] }> }>(
    'GET',
    `/api/timesheets/${layout.payrollDate}`,
  );
  expect(sheet.timesheet).toMatchObject({ imported_unverified: true, finalized: false });
  expect(sheet.days.find((day) => day.work_date === layout.cacheDay)?.category).toBe('Holiday');
  expect(sheet.days.flatMap((day) => day.sessions)).toEqual([]);

  // 5. The replay: the second tab commits the identical decisions, and the same file again is already imported.
  await second.getByRole('button', { name: 'Confirm import' }).click();
  await expect(second.locator('[data-import-notice="replayed"]')).toContainText('Already imported');
  await upload(page, bytes);
  await page.getByRole('button', { name: 'Upload and preview' }).click();
  await expect(page.locator('[data-import-notice="already_imported"]')).toContainText('Already imported');
  const after = await person.api.call<{ imports: Array<{ state: string }> }>('GET', '/api/imports');
  expect(after.imports).toHaveLength(1);
  expect(after.imports[0]?.state).toBe('committed');
  const again = await person.api.call<{ days: unknown[]; timesheet: { version: number } }>('GET', `/api/timesheets/${layout.payrollDate}`);
  expect(again.timesheet).toEqual(sheet.timesheet);
  await second.close();
});

test('an imported period shows "Imported, unverified" with edit, sign and submit disabled', async ({ page, builtServer, adminSeed, signInPageAs }) => {
  const person = await freshPerson(builtServer, adminSeed);
  const layout = layoutFor(person);
  await importOverApi(builtServer, person, workbookFor(layout.payrollDate), [layout.cacheDay]);
  await signInPageAs(person.account, '#/timesheet');

  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(page.locator('[data-status="imported"]')).toHaveText('Imported, unverified');
  await expect(page.locator('[data-imported-note]')).toContainText('read-only');
  await expect(page.locator('[data-review-link-disabled]')).toBeDisabled();
  await expect(page.getByRole('link', { name: /Review/ })).toHaveCount(0);
  await expect(page.locator('[data-grid-status="line"]')).toHaveCount(0);
  // An imported period has no signature lines and no review link on the sheet.
  await expect(page.locator('[data-signature], [data-sheet-review-link]')).toHaveCount(0);

  const batch = page.getByRole('group', { name: 'Batch category edit' });
  await expect(batch.getByRole('button', { name: 'Select all' })).toBeDisabled();
  await expect(batch.getByRole('button', { name: 'Preview changes' })).toBeDisabled();
  await expect(batch.getByLabel('Category for selected days')).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: `Select ${layout.cacheDay}` })).toBeDisabled();
  await expect(page.locator(`[data-day="${layout.cacheDay}"]`)).toContainText('Holiday');

  // The day opens to read only, and the server refuses the same edit the disabled controls stand for.
  await page.getByRole('button', { name: `View ${layout.cacheDay}` }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add session' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  const status = await statusInPage(page, 'PUT', `/api/days/${layout.cacheDay}`, {
    category: 'Off',
    leave_minutes: 0,
    wfh: false,
    notes: '',
    reason: 'Synthetic edit',
    expected_version: 1,
  });
  expect(status).toBe(409);

  // The review shows the same status and a disabled sign-off with the reason.
  await page.goto(`/#/review/${layout.payrollDate}`);
  await expect(page.locator('[data-status="imported"]')).toBeVisible();
  const lock = page.locator('[data-imported-lock]');
  await expect(lock.getByRole('button', { name: /Sign off/ })).toBeDisabled();
  await expect(lock).toContainText('cannot be edited, signed or submitted');
});

test('another user cannot see the batch, and an administrator cannot read it either', async ({ page, builtServer, adminSeed, signInPageAs }) => {
  const owner = await freshPerson(builtServer, adminSeed);
  const stranger = await freshPerson(builtServer, adminSeed);
  const id = await importOverApi(builtServer, owner, workbookFor(layoutFor(owner).payrollDate));

  await signInPageAs(stranger.account, '#/import');
  await expect(page.getByRole('heading', { name: 'Import and opening balance' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previous imports' })).toHaveCount(0);
  expect(await statusInPage(page, 'GET', `/api/imports/${id}`)).toBe(404);
  expect(await statusInPage(page, 'POST', `/api/imports/${id}/commit`, { decisions: [] })).toBe(404);
  expect((await stranger.api.call<{ imports: unknown[] }>('GET', '/api/imports')).imports).toEqual([]);
  await adminSeed.call('GET', `/api/imports/${id}`, undefined, 404);
  // The owner still sees it.
  expect((await owner.api.call<{ imports: unknown[] }>('GET', '/api/imports')).imports).toHaveLength(1);
});

test('the upload refuses the wrong file in words, before and after it is sent', async ({ page, builtServer, adminSeed, signInPageAs }) => {
  const person = await freshPerson(builtServer, adminSeed);
  await signInPageAs(person.account, '#/import');
  const input = page.locator('[data-import-file]');
  const send = page.getByRole('button', { name: 'Upload and preview' });

  await input.setInputFiles({ name: 'hours.xlsm', mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12', buffer: Buffer.from('x') });
  await expect(page.locator('[data-error="file"]')).toContainText('.xlsx');
  await expect(send).toBeDisabled();

  await input.setInputFiles({ name: 'big.xlsx', mimeType: XLSX, buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 1) });
  await expect(page.locator('[data-error="file"]')).toContainText('2 MiB');
  await expect(send).toBeDisabled();

  // A file that is not a workbook passes the courtesy check; the server refuses it and stores nothing.
  await input.setInputFiles({ name: 'broken.xlsx', mimeType: XLSX, buffer: Buffer.from('this is not a zip package') });
  await expect(page.locator('[data-error="file"]')).toHaveCount(0);
  await send.click();
  await expect(page.locator('[data-error="upload"]')).toContainText('not a valid .xlsx workbook');
  await expect(page.locator('[data-error="upload"]')).toContainText('not stored');
  expect((await person.api.call<{ imports: unknown[] }>('GET', '/api/imports')).imports).toEqual([]);
});

test('the opening balance: validation, confirmation, a repeat that changes nothing, and a reasoned correction', async (
  { page, context, builtServer, adminSeed, signInPageAs },
  testInfo,
) => {
  const person = await freshPerson(builtServer, adminSeed);
  const other = await freshPerson(builtServer, adminSeed);
  const asOf = addDays(person.todayLocal, -10);
  await signInPageAs(person.account, '#/import');

  const panel = page.getByRole('region', { name: 'Opening OT balance' });
  await expect(panel).toHaveAttribute('data-opening-balance', 'none');
  const form = panel.getByRole('form', { name: 'Record the opening balance' });
  const review = form.getByRole('button', { name: 'Review before posting' });

  // Nothing is complete yet: each missing field is named and nothing is posted.
  await review.click();
  await expect(form).toContainText('Enter at least 1 minute');
  await expect(form).toContainText('Enter the as-of date');
  await expect(form).toContainText('A reason is required.');
  await expect(form).toContainText('An evidence reference is required.');
  await form.getByLabel('Hours').fill('0');
  await form.getByLabel('Minutes (0 to 59)').fill('75');
  await review.click();
  await expect(form).toContainText('Minutes must be a whole number from 0 to 59.');

  await form.getByLabel('Hours').fill('12');
  await form.getByLabel('Minutes (0 to 59)').fill('30');
  await form.getByLabel('As-of date').fill(asOf);
  await form.getByLabel('Reason', { exact: true }).fill('Balance carried over from the previous sheet');
  await form.getByLabel('Evidence reference').fill('Synthetic email 2026-01-05');

  // A second tab, loaded before anything is posted, holds the same values for the repeat.
  const second = await context.newPage();
  await second.goto('/#/import');
  const secondForm = second.getByRole('form', { name: 'Record the opening balance' });
  await secondForm.getByLabel('Hours').fill('12');
  await secondForm.getByLabel('Minutes (0 to 59)').fill('30');
  await secondForm.getByLabel('As-of date').fill(asOf);
  await secondForm.getByLabel('Reason', { exact: true }).fill('Balance carried over from the previous sheet');
  await secondForm.getByLabel('Evidence reference').fill('Synthetic email 2026-01-05');
  await secondForm.getByRole('button', { name: 'Review before posting' }).click();

  await review.click();
  await expect(panel.locator('[data-confirm-value]')).toHaveText('+12h 30m');
  await expect(panel.locator('[data-confirm-result]')).toHaveAttribute('data-confirm-result', '750');
  await page.screenshot({ path: screenshotPath(`opening-balance-${testInfo.project.name}-synthetic.png`), fullPage: true });
  expect((await person.api.call<{ opening_balance: unknown }>('GET', '/api/ot/opening-balance')).opening_balance).toBeNull();
  await panel.getByRole('button', { name: 'Confirm and post' }).click();
  await expect(panel.locator('[data-opening-notice]')).toContainText('Recorded in your OT ledger');
  await expect(panel.locator('[data-opening-current]')).toHaveAttribute('data-opening-current', '750');
  await expect(panel).toContainText('Synthetic email 2026-01-05');

  // The repeat from the stale tab posts nothing.
  await second.getByRole('button', { name: 'Confirm and post' }).click();
  await expect(second.locator('[data-opening-notice]')).toContainText('Already recorded');
  const ledger = await person.api.call<{ entries: Array<{ entry_type: string; delta_minutes: number }> }>('GET', '/api/ot/ledger');
  expect(ledger.entries.filter((entry) => entry.entry_type === 'opening_balance')).toEqual([expect.objectContaining({ delta_minutes: 750 })]);
  expect(ledger.entries).toHaveLength(1);
  await second.close();

  // The correction needs a reason and evidence, shows what changes, and posts one correction entry.
  await panel.getByRole('button', { name: 'Correct the opening balance' }).click();
  const correction = panel.getByRole('form', { name: 'Correct the opening balance' });
  await expect(correction.getByLabel('Hours')).toHaveValue('12');
  await expect(correction.getByLabel('Minutes (0 to 59)')).toHaveValue('30');
  await correction.getByLabel('Hours').fill('10');
  await correction.getByLabel('Minutes (0 to 59)').fill('0');
  await correction.getByRole('button', { name: 'Review before posting' }).click();
  await expect(correction).toContainText('A reason is required.');
  await correction.getByLabel('Reason for the correction').fill('Two hours were counted twice');
  await correction.getByLabel('Evidence reference').fill('Synthetic ticket 42');
  await correction.getByRole('button', { name: 'Review before posting' }).click();
  await expect(panel.locator('[data-confirm-change]')).toHaveText('+12h 30m to +10h 00m');
  await expect(panel.locator('[data-confirm-result]')).toHaveAttribute('data-confirm-result', '600');
  await panel.getByRole('button', { name: 'Confirm correction' }).click();
  await expect(panel.locator('[data-opening-current]')).toHaveAttribute('data-opening-current', '600');
  await expect(panel.locator('[data-opening-correction]')).toHaveCount(1);
  const corrected = await person.api.call<{ entries: Array<{ entry_type: string; delta_minutes: number }> }>('GET', '/api/ot/ledger');
  expect(corrected.entries.map((entry) => [entry.entry_type, entry.delta_minutes])).toEqual([
    ['opening_balance', 750],
    ['correction', -150],
  ]);
  expect((await person.api.call<{ posted_minutes: number }>('GET', '/api/ot/summary')).posted_minutes).toBe(600);

  // The ledger view names both entries.
  await page.goto('/#/ot');
  await expect(page.locator('[data-ledger-type="opening_balance"]')).toContainText('Opening balance');
  await expect(page.locator('[data-ledger-type="correction"]')).toContainText('Opening balance correction');

  // Another person has no opening balance of their own to see.
  expect((await other.api.call<{ opening_balance: unknown }>('GET', '/api/ot/opening-balance')).opening_balance).toBeNull();
});

test('the Import entry is for the signed-in person and is not part of the administrator views', async ({ page, builtServer, signInPageAs }) => {
  await signInPageAs(builtServer.credentials.admin, '#/admin');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await openMoreOnPhone(page);
  await expect(nav.getByRole('link', { name: 'Admin' })).toHaveAttribute('aria-current', 'page');
  if (isPhone(page)) {
    await expect(nav.getByRole('link', { name: 'Import' })).toBeVisible();
  } else {
    // The desktop bar reaches Import through the "Import from Excel" link in Settings.
    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('link', { name: 'Import from Excel' })).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'Import a workbook' })).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Opening OT balance');
});
