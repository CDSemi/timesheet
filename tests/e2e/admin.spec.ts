import { randomBytes } from 'node:crypto';
import { type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import {
  type CalendarSchedule,
  createAccountByAdminApi,
  expect,
  SeedClient,
  screenshotPath,
  seedSecondCalendar,
  test,
} from './fixtures.ts';

/*
 * Settings and Admin screens on both viewports, through the real UI. The second employee and the
 * calendar-bound account are created over the admin API with run-time generated passwords; the
 * holiday CSV is an in-memory buffer named holidays-synthetic.csv (no file is written). Server
 * refusals are expected here, so a 4xx resource message is not a console failure; any other
 * console error (a CSP violation, for example) still fails the test.
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

interface ApiCalendar {
  id: string;
  reporting_zone: string;
  payroll: {
    anchor_payroll_date: string;
    cycle_days: number;
    period_start_offset_days: number;
    period_end_offset_days: number;
    due_offset_days: number;
    due_local_time: string;
  };
  versions: Array<{ seq: number; effective_from: string; dates: Array<{ date: string; name: string }> }>;
  payroll_exceptions: Array<{ nominal_payroll_date: string; payroll_date: string }>;
  warnings: Array<{ code: string; year: number }>;
}

interface ApiPeriods {
  today_local: string;
  current: { payroll_date: string; period_start: string };
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

async function openAdmin(page: Page) {
  await openMoreOnPhone(page);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
}

const userRow = (page: Page, email: string) => page.locator(`li.user-row[data-user-email="${email}"]`);

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
}

test('accounts: create, rename, refusals, deactivate with 401, reactivate', async (
  { page, builtServer, adminSeed, employeeSeed, signInPageAs },
  testInfo,
) => {
  const project = testInfo.project.name;
  const calendar = await adminSeed.call<ApiCalendar>('GET', '/api/calendar');
  // Employee 1 needs recorded data so that its calendar is bound (calendar_in_use).
  const [workDate] = await employeeSeed.pastFreeWorkdays();
  expect(workDate, 'a past free workday for the data-bearing account').toBeDefined();
  if (workDate === undefined) return;
  await employeeSeed.seedCompleteDay(workDate);

  try {
    await signInPageAs(builtServer.credentials.admin);
    await openAdmin(page);

    // Create an account; the temporary password is typed once and never shown again.
    const email = `synthetic-${randomBytes(5).toString('hex')}@example.invalid`;
    const password = randomBytes(18).toString('base64url');
    const form = page.getByRole('form', { name: 'Create account' });
    await form.getByLabel('Email').fill(email);
    await form.getByLabel('Display name').fill('Synthetic Newcomer');
    await form.getByLabel('Temporary password').fill(password);
    await form.getByRole('button', { name: 'Create account' }).click();
    await expect(form.locator('[data-status="user-created"]')).toContainText('not shown again');
    await expect(form.getByLabel('Temporary password')).toHaveValue('');
    expect(await page.content(), 'the password is nowhere in the page').not.toContain(password);
    await expect(userRow(page, email)).toBeVisible();
    await expect(userRow(page, email)).toHaveAttribute('data-user-status', 'active');

    // A weak password is named before anything is sent.
    await form.getByLabel('Temporary password').fill('short');
    await expect(form.getByText('12 to 256 characters')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Create account' })).toBeDisabled();
    await form.getByLabel('Temporary password').fill('');

    // The new account can sign in over the API with the typed password.
    const session = await new SeedClient(builtServer.origin).signIn(email, password);
    await session.call('GET', '/api/auth/me');

    // Edit the display name.
    const row = userRow(page, email);
    await row.getByRole('button', { name: 'Edit' }).click();
    await row.getByLabel('Display name').fill('Synthetic Renamed');
    await row.getByRole('button', { name: 'Save changes' }).click();
    await expect(row.getByRole('heading', { name: 'Synthetic Renamed' })).toBeVisible();
    const afterRename = await adminSeed.call<{ users: Array<{ email: string; display_name: string }> }>('GET', '/api/admin/users');
    expect(afterRename.users.find((item) => item.email === email)?.display_name).toBe('Synthetic Renamed');

    // Server refusals are shown in words, with their code.
    const own = userRow(page, builtServer.credentials.admin.email);
    await own.getByRole('button', { name: 'Deactivate' }).click();
    await expect(own.locator('[data-error="user-row"]')).toContainText('cannot deactivate your own account');
    await expect(own.locator('[data-error="user-row"]')).toContainText('cannot_deactivate_self');

    await own.getByRole('button', { name: 'Edit' }).click();
    await own.getByLabel('Role').selectOption('employee');
    await own.getByRole('button', { name: 'Save changes' }).click();
    await expect(own.locator('[data-error="user-row"]')).toContainText('At least one active administrator');
    await own.getByRole('button', { name: 'Cancel' }).click();

    // calendar_in_use: an account with data cannot move to another calendar. The account on the
    // second calendar makes that calendar selectable (the admin API lists no calendars).
    const schedule: CalendarSchedule = {
      reportingZone: calendar.reporting_zone,
      anchorPayrollDate: calendar.payroll.anchor_payroll_date,
      cycleDays: calendar.payroll.cycle_days,
      periodStartOffsetDays: calendar.payroll.period_start_offset_days,
      periodEndOffsetDays: calendar.payroll.period_end_offset_days,
      dueOffsetDays: calendar.payroll.due_offset_days,
      dueLocalTime: calendar.payroll.due_local_time,
    };
    const secondCalendarId = seedSecondCalendar(builtServer, schedule);
    await createAccountByAdminApi(adminSeed, { calendarId: secondCalendarId, displayName: 'Synthetic On Second Calendar' });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
    const withData = userRow(page, builtServer.credentials.employee.email);
    await withData.getByRole('button', { name: 'Edit' }).click();
    await withData.getByLabel('Calendar').selectOption(secondCalendarId);
    await withData.getByRole('button', { name: 'Save changes' }).click();
    await expect(withData.locator('[data-error="user-row"]')).toContainText('already has timesheet data');
    await expect(withData.locator('[data-error="user-row"]')).toContainText('calendar_in_use');
    const unchanged = await adminSeed.call<{ users: Array<{ email: string; calendar_id: string }> }>('GET', '/api/admin/users');
    expect(unchanged.users.find((item) => item.email === builtServer.credentials.employee.email)?.calendar_id).toBe(calendar.id);
    await page.screenshot({ path: screenshotPath(`admin-accounts-${project}-synthetic.png`), fullPage: true });
    await withData.getByRole('button', { name: 'Cancel' }).click();

    // Deactivate: the existing session answers 401 at once; reactivate lets the person sign in again.
    await row.getByRole('button', { name: 'Deactivate' }).click();
    await expect(row).toHaveAttribute('data-user-status', 'deactivated');
    await expect(row.getByText('Deactivated. Its sessions were signed out.')).toBeVisible();
    await session.call('GET', '/api/auth/me', undefined, 401);
    await row.getByRole('button', { name: 'Reactivate' }).click();
    await expect(row).toHaveAttribute('data-user-status', 'active');
    const again = await new SeedClient(builtServer.origin).signIn(email, password);
    await again.call('GET', '/api/auth/me');

    if (project === 'mobile') await expectNoHorizontalOverflow(page);
  } finally {
    await employeeSeed.clearSessions(workDate);
  }
});

test('settings: preview the effect, then create; the day figures equal the preview', async (
  { page, builtServer, adminSeed, signInPageAs },
  testInfo,
) => {
  const project = testInfo.project.name;
  const person = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Settings Person' });
  const personApi = await new SeedClient(builtServer.origin).signIn(person.email, person.password);
  const periods = await personApi.call<ApiPeriods>('GET', '/api/periods/current');
  const boundary = periods.current.period_start;

  // The settings screen is the first one rendered: an account without a policy has no timesheet yet.
  await signInPageAs(person, '#/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(page.getByText('You have no policy version yet')).toBeVisible();
  await openMoreOnPhone(page);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  if (isPhone(page)) await page.keyboard.press('Escape');

  const form = page.getByRole('form', { name: 'New policy version' });
  await expect(form.getByLabel('Effective from')).toHaveValue(boundary);
  await expect(form.getByRole('button', { name: 'Create version' })).toBeDisabled();
  await form.getByRole('button', { name: 'Preview effect' }).click();
  await expect(form.locator('[data-preview-empty="true"]')).toBeVisible();
  await form.getByRole('button', { name: 'Create version' }).click();
  await expect(form.locator('[data-status="policy-created"]')).toContainText('Version 1 created');
  await expect(page.locator('[data-policy-seq="1"]')).toContainText(`from ${boundary}`);

  // Recorded days of the open period make the second version's effect visible.
  const [workDate] = await personApi.displayedPeriodFreeWorkdays();
  expect(workDate, 'a past free workday in the displayed period').toBeDefined();
  if (workDate === undefined) return;
  const at = (time: string) => ({ local: `${workDate}T${time}`, zone: 'America/Los_Angeles' });
  await personApi.call(
    'POST',
    `/api/days/${workDate}/sessions`,
    {
      start: at('09:00'),
      end: at('19:00'),
      input_zone: 'America/Los_Angeles',
      breaks_confirmed: true,
      breaks: [
        ['11:00', '11:15'],
        ['13:00', '13:30'],
        ['15:30', '15:45'],
      ].map(([from, to]) => ({ start: at(from ?? ''), end: at(to ?? ''), counts_as_work: false })),
    },
    201,
  );
  const before = await personApi.dayView(workDate);
  expect(before.calculation?.credited_minutes, 'the day earns credit under the first version').toBeGreaterThan(0);

  await page.reload();
  await expect(form.getByLabel('Threshold minutes')).toHaveValue('30');
  await form.getByLabel('Threshold minutes').fill('600');
  // Creating needs a preview of exactly these values.
  await expect(form.getByRole('button', { name: 'Create version' })).toBeDisabled();
  await form.getByRole('button', { name: 'Preview effect' }).click();
  const day = form.locator(`[data-preview-day="${workDate}"]`);
  await expect(day).toBeVisible();
  const credited = day.locator('[data-field="credited_minutes"]');
  await expect(credited).toHaveAttribute('data-before', String(before.calculation?.credited_minutes));
  const previewAfter = Number(await credited.getAttribute('data-after'));
  expect(previewAfter).toBe(0);
  await page.screenshot({ path: screenshotPath(`settings-preview-${project}-synthetic.png`), fullPage: true });

  // An edit after the preview retires it.
  await form.getByLabel('Threshold minutes').fill('601');
  await expect(form.getByRole('button', { name: 'Create version' })).toBeDisabled();
  await expect(form.getByText('The values changed after the preview')).toBeVisible();
  await form.getByLabel('Threshold minutes').fill('600');
  await form.getByRole('button', { name: 'Preview effect' }).click();
  await expect(day).toBeVisible();
  await form.getByRole('button', { name: 'Create version' }).click();
  await expect(form.locator('[data-status="policy-created"]')).toContainText('Version 2 created');

  const afterCreate = await personApi.dayView(workDate);
  expect(afterCreate.calculation?.credited_minutes).toBe(previewAfter);
  const policies = await personApi.call<{ policies: Array<{ seq: number; threshold_minutes: number }> }>('GET', '/api/policies');
  expect(policies.policies.map((item) => [item.seq, item.threshold_minutes])).toEqual([
    [1, 30],
    [2, 600],
  ]);

  // A date before the current pay period is refused by the server and shown with the boundary it sent.
  await form.getByLabel('Effective from').fill(addDays(boundary, -14));
  await form.getByRole('button', { name: 'Preview effect' }).click();
  await expect(form.locator('[data-error="policy"]')).toContainText(`before ${boundary}`);
  await expect(form.getByRole('button', { name: 'Create version' })).toBeDisabled();

  await personApi.clearSessions(workDate);
  if (project === 'mobile') await expectNoHorizontalOverflow(page);
});

function csvBuffer(text: string) {
  return { name: 'holidays-synthetic.csv', mimeType: 'text/csv', buffer: Buffer.from(text, 'utf8') };
}

test('holiday CSV: issue, boundary, stale hash, preview diff, commit and no-change re-commit', async (
  { page, builtServer, adminSeed, signInPageAs },
  testInfo,
) => {
  const project = testInfo.project.name;
  const calendar = await adminSeed.call<ApiCalendar>('GET', '/api/calendar');
  const periods = await adminSeed.call<ApiPeriods>('GET', '/api/periods/current');
  const warning = calendar.warnings.find((item) => item.code === 'next_year_calendar_missing');
  // The server clock decides whether the warning exists; the import year follows what the server says.
  const year = warning?.year ?? Number(periods.today_local.slice(0, 4)) + 1;
  const boundary = periods.current.period_start;

  await signInPageAs(builtServer.credentials.admin);
  await openAdmin(page);
  const banner = page.locator('[data-warning="next_year_calendar_missing"]');
  if (warning === undefined) {
    await expect(banner).toHaveCount(0);
  } else {
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(String(warning.year));
  }

  const section = page.getByRole('form', { name: 'Holiday import' });
  await expect(section.getByLabel('Year of the dates')).toHaveValue(String(year));
  await expect(section.getByLabel('Effective from')).toHaveValue(boundary);
  const newYear = `${year}-01-01`;
  const midYear = `${year}-07-04`;

  // An invalid row is shown with its line; commit stays off.
  await section.getByLabel('Or choose a CSV file').setInputFiles(
    csvBuffer(`date,name,kind\n${newYear},Synthetic New Year,holiday\n${year}-13-40,Broken Row,holiday\n${midYear},Synthetic Midyear,closure\n`),
  );
  await expect(section.getByLabel('Paste the CSV rows')).toHaveValue(/Broken Row/);
  await section.getByRole('button', { name: 'Preview import' }).click();
  const issues = section.locator('[data-preview-issues]');
  await expect(issues).toHaveAttribute('data-preview-issues', '1');
  await expect(issues).toContainText('Line 3');
  await expect(section.getByRole('button', { name: 'Commit import' })).toBeDisabled();
  await page.screenshot({ path: screenshotPath(`holiday-issue-${project}-synthetic.png`), fullPage: true });

  // A fixed upload replaces the text and previews the diff.
  const fixed = `date,name,kind\n${newYear},Synthetic New Year,holiday\n${midYear},Synthetic Midyear,closure\n`;
  await section.getByLabel('Or choose a CSV file').setInputFiles(csvBuffer(fixed));
  await expect(section.getByLabel('Paste the CSV rows')).not.toHaveValue(/Broken Row/);

  // The boundary: an effective date before the current pay period is refused in the preview.
  await section.getByLabel('Effective from').fill('2020-01-06');
  await section.getByRole('button', { name: 'Preview import' }).click();
  await expect(section.locator('[data-preview-problem="retroactive_change"]')).toContainText(boundary);
  await expect(section.getByRole('button', { name: 'Commit import' })).toBeDisabled();
  await section.getByLabel('Effective from').fill(boundary);

  await section.getByRole('button', { name: 'Preview import' }).click();
  await expect(section.locator('[data-diff="added"]')).toBeVisible();
  await expect(section.locator(`[data-diff="added"] [data-diff-date="${newYear}"]`)).toBeVisible();
  await expect(section.locator(`[data-diff="added"] [data-diff-date="${midYear}"]`)).toBeVisible();
  await expect(section.locator('[data-diff="counts"]')).toBeVisible();
  await expect(section.locator('[data-preview-can-commit="true"]')).toBeVisible();
  await expect(section.getByRole('button', { name: 'Commit import' })).toBeEnabled();
  await page.screenshot({ path: screenshotPath(`holiday-preview-${project}-synthetic.png`), fullPage: true });

  // The calendar changes behind the preview: the commit is refused as stale and the preview retired.
  const other = `date,name,kind\n${year}-03-03,Synthetic Extra,holiday\n`;
  const body = { calendar_id: calendar.id, year, effective_from: boundary, csv: other, remove_dates: [] };
  const otherPreview = await adminSeed.call<{ preview_hash: string }>('POST', '/api/admin/calendar/import/preview', body);
  await adminSeed.call('POST', '/api/admin/calendar/import/commit', { ...body, preview_hash: otherPreview.preview_hash }, 201);
  await section.getByRole('button', { name: 'Commit import' }).click();
  await expect(section.locator('[data-error="holiday"]')).toContainText('changed since the preview');
  await expect(section.locator('[data-error="holiday"]')).toContainText('stale_preview');
  await expect(section.getByRole('button', { name: 'Commit import' })).toBeDisabled();

  // Preview again (the extra date is now a kept date), commit, then commit again: no change.
  await section.getByRole('button', { name: 'Preview import' }).click();
  await expect(section.locator(`[data-kept-date="${year}-03-03"]`)).toBeAttached();
  await section.getByRole('button', { name: 'Commit import' }).click();
  await expect(section.locator('[data-status="holiday-outcome"]')).toContainText('Committed as calendar version');
  const committed = await adminSeed.call<ApiCalendar>('GET', '/api/calendar');
  const latest = committed.versions.at(-1);
  expect(latest?.dates.map((item) => item.date)).toEqual(expect.arrayContaining([newYear, midYear, `${year}-03-03`]));
  expect(committed.warnings, 'next year has dates now').toEqual([]);
  await expect(banner).toHaveCount(0);

  const versionCount = committed.versions.length;
  await section.getByRole('button', { name: 'Commit import' }).click();
  await expect(section.locator('[data-status="holiday-outcome"]')).toContainText('No change');
  await section.getByRole('button', { name: 'Preview import' }).click();
  await expect(section.locator('[data-preview-no-change="true"]')).toBeVisible();
  expect((await adminSeed.call<ApiCalendar>('GET', '/api/calendar')).versions).toHaveLength(versionCount);

  if (project === 'mobile') await expectNoHorizontalOverflow(page);
});

test('payroll exception needs a reason and is recorded once', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const project = testInfo.project.name;
  const calendar = await adminSeed.call<ApiCalendar>('GET', '/api/calendar');
  const periods = await adminSeed.call<ApiPeriods>('GET', '/api/periods/current');
  const nominal = addDays(periods.current.payroll_date, calendar.payroll.cycle_days * 5);
  const moved = addDays(nominal, 1);

  await signInPageAs(builtServer.credentials.admin);
  await openAdmin(page);
  const form = page.getByRole('form', { name: 'Payroll exception' });
  await form.getByLabel('Scheduled payroll date').fill(nominal);
  await form.getByLabel('Actual payroll date').fill(moved);
  // The reason is required: nothing can be sent without it.
  await expect(form.getByRole('button', { name: 'Record exception' })).toBeDisabled();
  await form.getByLabel('Reason (required)').fill('Synthetic closure week');
  await form.getByRole('button', { name: 'Record exception' }).click();
  await expect(form.locator('[data-status="payroll-exception-created"]')).toContainText(moved);
  await expect(form.locator(`[data-exception="${nominal}"]`)).toContainText(`paid on ${moved}`);
  const stored = await adminSeed.call<ApiCalendar>('GET', '/api/calendar');
  expect(stored.payroll_exceptions).toEqual(expect.arrayContaining([expect.objectContaining({ nominal_payroll_date: nominal, payroll_date: moved })]));

  // The same scheduled date a second time is refused, in words.
  await form.getByLabel('Scheduled payroll date').fill(nominal);
  await form.getByLabel('Actual payroll date').fill(addDays(nominal, 2));
  await form.getByLabel('Reason (required)').fill('Synthetic second attempt');
  await form.getByRole('button', { name: 'Record exception' }).click();
  await expect(form.locator('[data-error="payroll-exception"]')).toContainText('already exists');
  await page.screenshot({ path: screenshotPath(`admin-payroll-${project}-synthetic.png`), fullPage: true });
  if (project === 'mobile') await expectNoHorizontalOverflow(page);
});

test.describe('navigation', () => {
  test('Settings for everyone, Admin for administrators only', async ({ page, builtServer, signInThroughUi, signInPageAs }) => {
    await signInThroughUi();
    const nav = page.getByRole('navigation', { name: 'Main' });
    const phone = isPhone(page);
    // The desktop bar lists Settings (Import is a link inside Settings); the phone's tab bar lists the three
    // frequent screens and "More" holds Settings, Import and, for administrators, Admin.
    const frequent = ['Timesheet', 'Overtime', 'History'];
    if (phone) {
      await expect(nav.getByRole('link')).toHaveText(frequent);
      await openMoreOnPhone(page);
      await expect(nav.getByRole('link')).toHaveText([...frequent, 'Settings', 'Import']);
    } else {
      await expect(nav.getByRole('link')).toHaveText([...frequent, 'Settings']);
    }
    await page.evaluate("window.location.hash = '#/admin'");
    await expect(page).toHaveURL(/#\/timesheet$/);
    await openMoreOnPhone(page);
    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
    await openMoreOnPhone(page);
    await page.getByRole('button', { name: 'Sign out' }).click();

    await signInPageAs(builtServer.credentials.admin);
    if (phone) {
      await openMoreOnPhone(page);
      await expect(nav.getByRole('link')).toHaveText([...frequent, 'Settings', 'Import', 'Admin']);
    } else {
      await expect(nav.getByRole('link')).toHaveText([...frequent, 'Settings', 'Admin']);
    }
  });
});
