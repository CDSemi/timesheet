import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { textContrast } from './contrast.ts';
import {
  type BuiltServer,
  createAccountByAdminApi,
  expect,
  newPerson,
  type Person,
  SeedClient,
  screenshotPath,
  starterPolicyBody,
  statusInPage,
  test,
} from './fixtures.ts';

/*
 * WP5-UX4-T05, U4-01 (owner answers F-3 (a) and F-4 (a)): the personal settings file and the company calendar file. The file is
 * made and read in the browser; the import always previews ("Now / In the file"), needs one confirmation and writes through the
 * existing routes. Accounts are synthetic (example.invalid, run-time passwords). Exported files are read in memory only: no
 * file is written into the repository or into the evidence.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('console', (message) => {
    const unexpected = message.type() === 'error' && !/status of 4\d\d/.test(message.text());
    expect(unexpected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const PACKAGE_VERSION = (JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'package.json'), 'utf8')) as { version: string }).version;

const card = (page: Page) => page.getByRole('region', { name: 'Export and import settings' });
const fileInput = (page: Page) => page.getByLabel('Import settings from a file (.json)');
const importDialog = (page: Page) => page.getByRole('dialog', { name: 'Import settings' });
const refusal = (page: Page) => page.getByRole('alertdialog', { name: 'This file cannot be imported' });

interface PolicyRow {
  seq: number;
  note: string | null;
  deficit_mode: string;
  effective_from: string;
}
interface Submission {
  seq: number;
  auto_submit: boolean;
  recipients: { to: string[]; cc: string[] };
  auto_image: { authorized: boolean };
  reminder_offsets_minutes: number[];
}

const policiesOf = async (person: Person): Promise<PolicyRow[]> => (await person.api.call<{ policies: PolicyRow[] }>('GET', '/api/policies')).policies;
const submissionOf = async (person: Person): Promise<Submission> => (await person.api.call<{ settings: Submission }>('GET', '/api/settings/submission')).settings;

/** Runs `trigger`, waits for the download it causes and reads the file in memory (Playwright keeps it in its own temporary folder). */
async function downloaded(page: Page, trigger: () => Promise<void>): Promise<{ name: string; text: string }> {
  const [download] = await Promise.all([page.waitForEvent('download'), trigger()]);
  return { name: download.suggestedFilename(), text: readFileSync(await download.path(), 'utf8') };
}

const asFile = (name: string, text: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(text) });

/**
 * A synthetic account with everything the file must NOT hold, and a second policy version, reminders and automatic submission on:
 * a signature image with its automatic-image authorization, a recorded session, an opening OT balance and a sharing grant.
 */
async function seedSource(adminSeed: SeedClient, server: BuiltServer): Promise<{ person: Person; signatureId: string }> {
  const person = await newPerson(adminSeed, server, {
    displayName: 'Synthetic Source Person',
    to: ['payroll-synthetic@example.invalid'],
    cc: ['manager-synthetic@example.invalid'],
    autoSubmit: true,
    autoNote: { enabled: true, text: 'Submitted automatically (synthetic)' },
    signature: 'authorized',
  });
  const periods = await person.api.periodsCurrent();
  await person.api.call('POST', '/api/policies', { ...starterPolicyBody(periods.current.period_start), deficit_mode: 'choose_at_signoff' }, 201);
  const saved = await submissionOf(person);
  await person.api.call(
    'POST',
    '/api/settings/submission',
    { expected_seq: saved.seq, to: saved.recipients.to, cc: saved.recipients.cc, auto_submit: true, show_ot_on_pdf: true, reminder_offsets_minutes: [2880, 90] },
    201,
  );
  await person.api.seedCompleteDay(await person.api.displayedSeedDay());
  await person.api.call(
    'POST',
    '/api/ot/opening-balance',
    { minutes: 90, as_of_date: addDays(periods.today_local, -30), reason: 'Synthetic opening balance', expected_version: 0 },
    201,
  );
  const reader = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Reader' });
  await person.api.call('POST', '/api/shares', { grantee_email: reader.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  const signatureId = (await person.api.call<{ signature: { id: string } }>('GET', '/api/signatures/current')).signature.id;
  return { person, signatureId };
}

async function openSettings(page: Page, signInPageAs: (credentials: { email: string; password: string }, startHash?: string) => Promise<void>, who: { email: string; password: string }) {
  await signInPageAs(who, '#/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(card(page)).toBeVisible();
}

/** Every request that changes data, so a test can show that a refused or cancelled import wrote nothing. */
function recordWrites(page: Page): string[] {
  const writes: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (request.method() !== 'GET' && path.startsWith('/api/')) writes.push(`${request.method()} ${path}`);
  });
  return writes;
}

test('export: the file holds the allowlisted keys only, with no signature, authorization, session, ledger or share', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const { person, signatureId } = await seedSource(adminSeed, builtServer);
  await openSettings(page, signInPageAs, person.account);
  const section = card(page);
  await expect(section.getByRole('heading', { name: 'Export and import settings' })).toBeVisible();
  await expect(section).toContainText('Never included: timesheets, sessions, OT balance, passwords, your signature image or its authorization.');
  await expect(section).toContainText('Keep it private.');
  await page.screenshot({ path: screenshotPath(`settings-export-${testInfo.project.name}-synthetic.png`), fullPage: true });

  const first = await downloaded(page, () => section.getByRole('button', { name: 'Export settings' }).click());
  expect(first.name).toMatch(/^timesheet-settings-\d{4}-\d{2}-\d{2}\.json$/);
  const file = JSON.parse(first.text) as Record<string, unknown> & { data: Record<string, Record<string, unknown>> };
  expect(Object.keys(file).sort()).toEqual(['app_version', 'data', 'exported_at', 'format', 'schema_version', 'scope']);
  expect(file).toMatchObject({ format: 'timesheet-settings', schema_version: 1, app_version: PACKAGE_VERSION, scope: 'personal' });
  expect(file.exported_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  expect(Object.keys(file.data).sort()).toEqual(['submission', 'theme', 'work_policy']);
  expect(Object.keys(file.data.work_policy ?? {}).sort()).toEqual(
    ['breaks', 'deficit_mode', 'reference_end', 'reference_start', 'required_minutes', 'rounding_step_minutes', 'threshold_minutes'].sort(),
  );
  expect(Object.keys(file.data.submission ?? {}).sort()).toEqual(
    ['auto_note_enabled', 'auto_note_text', 'auto_submit', 'body_template', 'cc', 'reminder_offsets_minutes', 'show_ot_on_pdf', 'show_time_on_pdf', 'subject_template', 'to'].sort(),
  );
  expect(file.data.work_policy?.deficit_mode).toBe('choose_at_signoff');
  expect(file.data.submission).toMatchObject({ to: ['payroll-synthetic@example.invalid'], reminder_offsets_minutes: [2880, 90], auto_submit: true, show_ot_on_pdf: true, show_time_on_pdf: true });
  // Nothing of the account that is not a setting: the signature, its authorization, the person, the session, the balance, the share.
  for (const forbidden of [signatureId, 'auto_image', 'authorized', 'sha256', 'attachment', 'apply_to_overdue_drafts', person.account.email, person.account.id, 'Synthetic Source Person', 'Synthetic Reader', 'opening', 'ledger', 'session', 'grantee']) {
    expect(first.text, `the file must not contain "${forbidden}"`).not.toContain(forbidden);
  }
  await expect(section.locator('[data-transfer="notice"]')).toContainText(`Downloaded ${first.name}`);
  await expect(section.locator('[data-transfer="notice"]')).toContainText('Keep it private');

  // Without the theme tick, no theme key.
  await section.getByLabel('Include the theme of this device in the file').uncheck();
  const second = await downloaded(page, () => section.getByRole('button', { name: 'Export settings' }).click());
  expect(Object.keys((JSON.parse(second.text) as { data: object }).data).sort()).toEqual(['submission', 'work_policy']);
});

test('import into a second account: comparison, nothing written before the confirmation, one version per group, auto-submit only with its tick', async ({
  page,
  builtServer,
  adminSeed,
  signInPageAs,
}, testInfo) => {
  const project = testInfo.project.name;
  const { person: source } = await seedSource(adminSeed, builtServer);
  await openSettings(page, signInPageAs, source.account);
  const exported = await downloaded(page, () => card(page).getByRole('button', { name: 'Export settings' }).click());
  // A new page load: the sign-in form only shows after a full load (the old session's screen would stay under a hash change).
  await page.goto('about:blank');
  await page.context().clearCookies();

  const target = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Target Person', to: ['other-synthetic@example.invalid'], signature: 'none' });
  const policiesBefore = await policiesOf(target);
  const submissionBefore = await submissionOf(target);
  expect(submissionBefore.auto_submit).toBe(false);
  const periods = await target.api.periodsCurrent();
  const writes = recordWrites(page);
  // This device is in dark mode, the file says light: the theme is a third change, applied to this device only.
  await page.emulateMedia({ colorScheme: 'dark' });
  await openSettings(page, signInPageAs, target.account);
  writes.length = 0;

  // The file input has a visible label and is reachable by keyboard.
  await expect(card(page).getByText('Import settings from a file (.json)')).toBeVisible();
  await fileInput(page).focus();
  await expect(fileInput(page)).toBeFocused();

  await fileInput(page).setInputFiles(asFile(exported.name, exported.text));
  const dialog = importDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`${exported.name} · format 1 · exported `);
  await expect(dialog).toContainText(`from ${PACKAGE_VERSION}`);
  const table = dialog.getByRole('table', { name: 'Your current settings and the settings in the file' });
  await expect(table.getByRole('columnheader')).toHaveText(['Setting', 'Now', 'In the file']);
  await expect(table.locator('tr[data-row="to"]')).toContainText('other-synthetic@example.invalid');
  await expect(table.locator('tr[data-row="to"]')).toContainText('payroll-synthetic@example.invalid');
  await expect(table.locator('tr[data-row="to"]')).toHaveAttribute('data-changed', 'true');
  await expect(table.locator('tr[data-row="to"]').getByText('changed')).toBeVisible();
  await expect(table.locator('tr[data-row="breaks"]')).toHaveAttribute('data-changed', 'false');
  await expect(table.locator('tr[data-row="breaks"]')).toContainText('same');
  await expect(table.locator('tr[data-row="deficit"]')).toContainText('Choose at sign-off');
  await expect(table.locator('tr[data-row="reminders"]')).toContainText('48 h, 90 min');
  await expect(table.locator('tr[data-row="auto_submit"]')).toContainText('On in the file');
  await expect(table.locator('tr[data-row="theme"]')).toContainText('Light');
  // Group headings and row headers are headers of the table.
  await expect(table.getByRole('rowheader', { name: 'Work policy (a new version)' })).toBeVisible();
  await expect(table.getByRole('rowheader', { name: 'Reminders before the deadline' })).toBeVisible();

  // The tick is unticked; the date defaults to the first day after the period that contains today; the server's policy preview shows.
  const tick = dialog.getByLabel('Also turn automatic submission on');
  await expect(tick).not.toBeChecked();
  await expect(dialog.locator('[data-transfer="auto-submit-note"]')).toContainText('never switches it on by itself');
  const date = dialog.getByLabel('The work policy applies from');
  await expect(date).toHaveValue(addDays((await target.api.periodsCurrent()).in_progress.period_end, 1));
  await expect(dialog.getByRole('region', { name: 'Policy preview' })).toBeVisible();
  const confirm = dialog.getByRole('button', { name: 'Import 3 changes' });
  await expect(confirm).toBeEnabled();
  await dialog.screenshot({ path: screenshotPath(`settings-import-comparison-${project}-synthetic.png`) });
  await dialog.locator('label', { hasText: 'Also turn automatic submission on' }).screenshot({ path: screenshotPath(`settings-import-tick-${project}-synthetic.png`) });

  // Nothing is written before the confirmation, and Cancel writes nothing.
  expect(writes.filter((write) => write !== 'POST /api/policies/preview')).toEqual([]);
  expect(await policiesOf(target)).toHaveLength(policiesBefore.length);
  expect((await submissionOf(target)).seq).toBe(submissionBefore.seq);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(fileInput(page)).toBeFocused();
  expect(writes.filter((write) => write !== 'POST /api/policies/preview')).toEqual([]);
  expect(await policiesOf(target)).toHaveLength(policiesBefore.length);

  // Confirm without the tick: exactly one new policy version and one new settings version; auto-submit and the authorization stay off.
  writes.length = 0;
  await fileInput(page).setInputFiles(asFile(exported.name, exported.text));
  await expect(dialog.getByRole('region', { name: 'Policy preview' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Import 3 changes' }).click();
  await expect(card(page).locator('[data-transfer="notice"]')).toContainText(`Imported from ${exported.name}`);
  await expect(dialog).toHaveCount(0);
  expect(writes.filter((write) => write.startsWith('POST') && !write.endsWith('/preview')).sort()).toEqual(['POST /api/policies', 'POST /api/settings/submission']);
  const policiesAfter = await policiesOf(target);
  expect(policiesAfter).toHaveLength(policiesBefore.length + 1);
  expect(policiesAfter.at(-1)).toMatchObject({ deficit_mode: 'choose_at_signoff', effective_from: addDays(periods.in_progress.period_end, 1) });
  expect(policiesAfter.at(-1)?.note).toBe(`Imported from settings file ${exported.name}`);
  const submissionAfter = await submissionOf(target);
  expect(submissionAfter.seq).toBe(submissionBefore.seq + 1);
  expect(submissionAfter.recipients.to).toEqual(['payroll-synthetic@example.invalid']);
  expect(submissionAfter.reminder_offsets_minutes).toEqual([2880, 90]);
  expect(submissionAfter.auto_submit, 'a file never switches automatic submission on by itself').toBe(false);
  expect(submissionAfter.auto_image.authorized).toBe(false);
  // The theme of the file is applied to this device only.
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate("window.localStorage.getItem('timesheet.theme')")).toBe('light');
  // The screen shows the new versions without a reload.
  await expect(page.locator('[data-policy-seq]')).toHaveCount(policiesAfter.length);
  await expect(page.locator('#submission-field-to')).toHaveValue('payroll-synthetic@example.invalid');

  // The same file again: only automatic submission differs, and without the tick there is nothing to write.
  writes.length = 0;
  await fileInput(page).setInputFiles(asFile(exported.name, exported.text));
  await expect(dialog.locator('tr[data-row="auto_submit"]')).toHaveAttribute('data-changed', 'true');
  await expect(dialog.locator('[data-transfer="no-change"]')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Import 0 changes' })).toBeDisabled();
  await dialog.getByLabel('Also turn automatic submission on').check();
  await expect(dialog.locator('[data-transfer="no-change"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Import 1 change' }).click();
  await expect(card(page).locator('[data-transfer="notice"]')).toContainText('submission settings version');
  expect((await policiesOf(target)).length).toBe(policiesAfter.length);
  const ticked = await submissionOf(target);
  expect(ticked.seq).toBe(submissionAfter.seq + 1);
  expect(ticked.auto_submit).toBe(true);
  expect(ticked.auto_image.authorized).toBe(false);
});

test('a tampered or foreign file is refused with a message and nothing is written', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Refusal Person', signature: 'none' });
  const policiesBefore = await policiesOf(person);
  const submissionBefore = await submissionOf(person);
  const valid = {
    format: 'timesheet-settings',
    schema_version: 1,
    app_version: PACKAGE_VERSION,
    exported_at: '2026-10-20T16:40:00Z',
    scope: 'personal',
    data: {
      work_policy: {
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
      submission: {
        to: ['payroll-synthetic@example.invalid'],
        cc: [],
        subject_template: 'Timesheet {PeriodStart} to {PeriodEnd}',
        body_template: 'Please find the timesheet of {EmployeeName}.',
        show_ot_on_pdf: false,
        reminder_offsets_minutes: [1440],
        auto_note_enabled: false,
        auto_note_text: 'Submitted automatically',
        auto_submit: false,
      },
    },
  };
  const clone = () => JSON.parse(JSON.stringify(valid)) as typeof valid & Record<string, unknown>;
  const cases: Array<{ label: string; text: string; message: string }> = [
    { label: 'unknown key', text: JSON.stringify({ ...clone(), data: { ...valid.data, submission: { ...valid.data.submission, auto_image: { authorized: true } } } }), message: 'data.submission.auto_image' },
    { label: 'wrong version', text: JSON.stringify({ ...clone(), schema_version: 2 }), message: 'schema version 2' },
    { label: 'invalid time', text: JSON.stringify({ ...clone(), data: { ...valid.data, work_policy: { ...valid.data.work_policy, reference_start: '25:99' } } }), message: 'reference_start' },
    { label: 'wrong format', text: JSON.stringify({ ...clone(), format: 'something-else' }), message: 'not a settings file of this app' },
    { label: 'not JSON', text: 'this is not json', message: 'not valid JSON' },
  ];
  const writes = recordWrites(page);
  await openSettings(page, signInPageAs, person.account);
  writes.length = 0;
  for (const item of cases) {
    await fileInput(page).setInputFiles(asFile('timesheet-settings-tampered.json', item.text));
    await expect(refusal(page), item.label).toBeVisible();
    await expect(refusal(page)).toContainText(item.message);
    await expect(refusal(page)).toContainText('Nothing was changed.');
    await expect(importDialog(page)).toHaveCount(0);
    if (item.label === 'unknown key') await page.screenshot({ path: screenshotPath(`settings-import-refused-${testInfo.project.name}-synthetic.png`) });
    await refusal(page).getByRole('button', { name: 'OK' }).click();
    await expect(refusal(page)).toHaveCount(0);
    await expect(fileInput(page)).toBeFocused();
  }
  // A file of the wrong kind and a wrong extension are refused too.
  await fileInput(page).setInputFiles({ name: 'settings.csv', mimeType: 'text/csv', buffer: Buffer.from('a,b') });
  await expect(refusal(page)).toContainText('Choose a settings file (.json)');
  await refusal(page).getByRole('button', { name: 'OK' }).click();
  await fileInput(page).setInputFiles(asFile('company.json', JSON.stringify({ ...clone(), scope: 'company' })));
  await expect(refusal(page)).toContainText('company calendar file');
  await refusal(page).getByRole('button', { name: 'OK' }).click();

  expect(writes, 'a refused file writes nothing and asks for no preview').toEqual([]);
  expect(await policiesOf(person)).toHaveLength(policiesBefore.length);
  expect((await submissionOf(person)).seq).toBe(submissionBefore.seq);
  // The valid base file itself is accepted up to the preview (it is not refused for being a test file).
  await fileInput(page).setInputFiles(asFile('timesheet-settings-valid.json', JSON.stringify(valid)));
  await expect(importDialog(page)).toBeVisible();
});

test('the preview dialog is accessible in both themes: a real table, a labelled dialog, readable text, Escape returns focus', async ({ page, builtServer, adminSeed, signInPageAs }) => {
  const { person: source } = await seedSource(adminSeed, builtServer);
  await openSettings(page, signInPageAs, source.account);
  const exported = await downloaded(page, () => card(page).getByRole('button', { name: 'Export settings' }).click());
  // A new page load: the sign-in form only shows after a full load (the old session's screen would stay under a hash change).
  await page.goto('about:blank');
  await page.context().clearCookies();
  const target = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Theme Person', to: ['other-synthetic@example.invalid'], signature: 'none' });
  await openSettings(page, signInPageAs, target.account);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await fileInput(page).setInputFiles(asFile(exported.name, exported.text));
    const dialog = importDialog(page);
    await expect(dialog).toBeVisible();
    // A modal dialog with a name and a description; the focus starts on its heading.
    await expect(dialog).toHaveAttribute('aria-labelledby', /.+/);
    await expect(dialog).toHaveAttribute('aria-describedby', /.+/);
    await expect(dialog.getByRole('heading', { name: 'Import settings', level: 2 })).toBeFocused();
    await expect(dialog).toHaveJSProperty('open', true);
    expect(await page.evaluate("document.querySelector('dialog[open]')?.matches(':modal') ?? false")).toBe(true);
    // A real table: header cells with scope, a caption, row headers.
    const table = dialog.getByRole('table');
    await expect(table.locator('thead th[scope="col"]')).toHaveCount(3);
    await expect(table.locator('caption')).toHaveCount(1);
    await expect(table.locator('tbody th[scope="row"]').first()).toBeVisible();
    // Keyboard: Tab reaches the tick, the date and the buttons, in the dialog only.
    await page.keyboard.press('Tab');
    await expect(dialog.getByLabel('Also turn automatic submission on')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByLabel('The work policy applies from')).toBeFocused();
    // Text is readable (4.5:1) in this theme: row headers, values, "same", the word "changed", the group heading.
    for (const target of [
      table.locator('tbody th[scope="row"]').first(),
      table.locator('tr[data-row="to"] td').first(),
      table.locator('tr[data-row="breaks"] td.muted'),
      table.locator('tr[data-row="to"] .transfer-flag'),
      table.locator('tr.transfer-group th').first(),
      dialog.locator('.transfer-file'),
    ] as Locator[]) {
      expect(await textContrast(target.first()), `${scheme}: ${await target.first().innerText()}`).toBeGreaterThanOrEqual(4.5);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(fileInput(page)).toBeFocused();
  }
});

test('company calendar file: export, a foreign zone is refused, an import previews and commits one calendar version and the payroll exception', async ({
  page,
  privateServer,
}, testInfo) => {
  const server = privateServer;
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  interface ApiCalendar {
    id: string;
    reporting_zone: string;
    versions: Array<{ seq: number; effective_from: string; weekdays: number[]; dates: Array<{ date: string; name: string; kind: string }> }>;
    payroll_exceptions: Array<{ nominal_payroll_date: string; payroll_date: string }>;
  }
  const calendar = () => admin.call<ApiCalendar>('GET', '/api/calendar');
  const before = await calendar();
  const periods = await admin.periodsCurrent();
  const writes = recordWrites(page);

  await page.goto(`${server.origin}/#/settings/admin`);
  await page.getByLabel('Email').fill(server.credentials.admin.email);
  await page.getByLabel('Password').fill(server.credentials.admin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
  const section = page.getByRole('region', { name: 'Company calendar file' });
  await expect(section).toBeVisible();
  await expect(section).toContainText('Keep it private.');
  const companyInput = section.getByLabel('Import a company calendar file (.json)');

  // Export: the allowlisted keys only, no person and no timesheet data.
  const exported = await downloaded(page, () => section.getByRole('button', { name: 'Export company calendar' }).click());
  expect(exported.name).toMatch(/^timesheet-company-calendar-\d{4}-\d{2}-\d{2}\.json$/);
  const file = JSON.parse(exported.text) as { scope: string; data: Record<string, unknown> & { holidays: Array<{ date: string; name: string; kind: string }>; payroll_exceptions: unknown[] } };
  expect(file.scope).toBe('company');
  expect(Object.keys(file.data).sort()).toEqual(['holidays', 'payroll', 'payroll_exceptions', 'reporting_zone', 'weekdays']);
  expect(file.data.reporting_zone).toBe(before.reporting_zone);
  expect(file.data.holidays).toHaveLength(before.versions.at(-1)?.dates.length ?? -1);
  for (const forbidden of ['email', 'display_name', 'password', 'session', 'ledger', 'example.invalid']) expect(exported.text).not.toContain(forbidden);

  // A foreign reporting zone and a different payroll schedule are refused, and nothing is written.
  writes.length = 0;
  const foreign = JSON.parse(exported.text) as { data: { reporting_zone: string; payroll: { cycle_days: number } } };
  foreign.data.reporting_zone = before.reporting_zone === 'Asia/Tokyo' ? 'Europe/Paris' : 'Asia/Tokyo';
  await companyInput.setInputFiles(asFile('timesheet-company-calendar-foreign.json', JSON.stringify(foreign)));
  await expect(refusal(page)).toContainText('reporting zone');
  await expect(refusal(page)).toContainText('never changes, so the file was refused');
  await refusal(page).getByRole('button', { name: 'OK' }).click();
  const schedule = JSON.parse(exported.text) as { data: { payroll: { cycle_days: number } } };
  schedule.data.payroll.cycle_days += 7;
  await companyInput.setInputFiles(asFile('timesheet-company-calendar-schedule.json', JSON.stringify(schedule)));
  await expect(refusal(page)).toContainText('payroll schedule');
  await refusal(page).getByRole('button', { name: 'OK' }).click();
  await companyInput.setInputFiles(asFile('timesheet-company-calendar-personal.json', JSON.stringify({ ...JSON.parse(exported.text), scope: 'personal' })));
  await expect(refusal(page)).toBeVisible();
  await refusal(page).getByRole('button', { name: 'OK' }).click();
  expect(writes).toEqual([]);
  expect((await calendar()).versions).toHaveLength(before.versions.length);

  // An import with one new date and one new payroll exception: a preview first, then one confirmation.
  const taken = new Set(before.versions.at(-1)?.dates.map((item) => item.date) ?? []);
  let newDate = addDays(periods.current.period_end, 20);
  while (taken.has(newDate)) newDate = addDays(newDate, 1);
  const future = await admin.call<{ periods: Array<{ nominal_payroll_date: string; payroll_date: string; period_start: string }> }>(
    'GET',
    `/api/periods?from=${addDays(periods.in_progress.period_end, 1)}&to=${addDays(periods.in_progress.period_end, 30)}`,
  );
  const nominal = future.periods.find((item) => item.period_start > periods.current.period_end)?.nominal_payroll_date ?? '';
  expect(nominal, 'a future payroll date to move').not.toBe('');
  const moved = addDays(nominal, 1);
  const changed = JSON.parse(exported.text) as typeof file;
  changed.data.holidays.push({ date: newDate, name: 'Synthetic Company Day', kind: 'closure' });
  changed.data.payroll_exceptions.push({ nominal_payroll_date: nominal, payroll_date: moved, due_local_date: null, due_local_time: null });
  await companyInput.setInputFiles(asFile('timesheet-company-calendar-new.json', JSON.stringify(changed)));
  const dialog = page.getByRole('dialog', { name: 'Import company calendar' });
  await expect(dialog).toBeVisible();
  const year = Number(newDate.slice(0, 4));
  if (new Set(changed.data.holidays.map((item) => item.date.slice(0, 4))).size > 1) await dialog.getByLabel('Year to import').selectOption(String(year));
  await expect(dialog.getByLabel('Effective from')).toHaveValue(periods.current.period_start);
  const table = dialog.getByRole('table', { name: 'The calendar now and the calendar in the file' });
  await expect(table.getByRole('columnheader')).toHaveText(['Setting', 'Now', 'In the file']);
  await expect(table.locator('tr[data-row="zone"]')).toHaveAttribute('data-changed', 'false');
  await expect(table.locator('tr[data-row="dates"]')).toHaveAttribute('data-changed', 'true');
  await expect(table.locator('tr[data-row="exceptions"]')).toContainText('1 new');
  await expect(dialog.locator('[data-preview-ready="true"]')).toContainText('1 date added or changed');
  await expect(dialog.locator('[data-diff="added"]')).toContainText(newDate);
  await expect(dialog.getByRole('button', { name: 'Import 2 changes' })).toBeEnabled();
  await dialog.screenshot({ path: screenshotPath(`settings-import-company-${testInfo.project.name}-synthetic.png`) });
  // Nothing is written by the preview or by cancelling.
  expect(writes.filter((write) => write !== 'POST /api/admin/calendar/import/preview')).toEqual([]);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await calendar()).versions).toHaveLength(before.versions.length);

  await companyInput.setInputFiles(asFile('timesheet-company-calendar-new.json', JSON.stringify(changed)));
  if (new Set(changed.data.holidays.map((item) => item.date.slice(0, 4))).size > 1) await dialog.getByLabel('Year to import').selectOption(String(year));
  await expect(dialog.locator('[data-preview-ready="true"]')).toBeVisible();
  await dialog.getByRole('button', { name: 'Import 2 changes' }).click();
  await expect(section.locator('[data-transfer="notice"]')).toContainText('Imported from timesheet-company-calendar-new.json');
  const after = await calendar();
  expect(after.versions).toHaveLength(before.versions.length + 1);
  expect(after.versions.at(-1)?.dates.map((item) => item.date)).toContain(newDate);
  expect(after.versions.at(-1)?.dates).toHaveLength((before.versions.at(-1)?.dates.length ?? 0) + 1);
  expect(after.payroll_exceptions.map((item) => item.nominal_payroll_date)).toContain(nominal);
  expect(writes.filter((write) => !write.endsWith('/preview')).sort()).toEqual(['POST /api/admin/calendar/import/commit', 'POST /api/admin/payroll-exceptions']);
});

test('an employee sees no company file controls and the server still refuses the admin routes', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Employee View', signature: 'none' });
  const adminRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/admin/')) adminRequests.push(`${request.method()} ${request.url()}`);
  });
  await openSettings(page, signInPageAs, person.account);
  await expect(fileInput(page)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Company calendar file' })).toHaveCount(0);
  await expect(page.getByText('Company calendar file')).toHaveCount(0);
  await expect(page.getByLabel('Import a company calendar file (.json)')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export company calendar' })).toHaveCount(0);
  await page.screenshot({ path: screenshotPath(`settings-employee-no-company-${testInfo.project.name}-synthetic.png`), fullPage: true });
  // The Administration address is not reachable for an employee, and no admin route is asked on the way.
  await page.evaluate("window.location.hash = '#/settings/admin'");
  await expect(page).toHaveURL(/#\/timesheet$/);
  await page.waitForLoadState('networkidle');
  expect(adminRequests, 'admin requests made by an employee page').toEqual([]);
  // The server answers 403 whatever the screen shows.
  expect(await statusInPage(page, 'GET', '/api/admin/users')).toBe(403);
  const calendar = await person.api.call<{ id: string }>('GET', '/api/calendar');
  expect(
    await statusInPage(page, 'POST', '/api/admin/calendar/import/preview', {
      calendar_id: calendar.id,
      year: 2030,
      effective_from: '2030-01-01',
      csv: 'date,name,kind\n2030-01-01,Synthetic,holiday\n',
      remove_dates: [],
    }),
  ).toBe(403);
  expect(
    await statusInPage(page, 'POST', '/api/admin/payroll-exceptions', {
      calendar_id: calendar.id,
      nominal_payroll_date: '2030-01-04',
      payroll_date: '2030-01-03',
      reason: 'Synthetic refusal check',
    }),
  ).toBe(403);
});
