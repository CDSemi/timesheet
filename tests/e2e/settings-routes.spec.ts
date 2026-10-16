import type { Page } from '@playwright/test';
import { createAccountByAdminApi, expect, openAccount, SeedClient, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX3-T03: the Settings sub-pages (Personal, Profile, Administration), the read-only Profile page, the old `#/admin`
 * address, and the lazily loaded Administration and Import screens, on both viewports. Accounts are synthetic
 * (example.invalid, run-time passwords). The server stays the authority on admin data: an employee's page must neither
 * show Administration nor ask for `/api/admin/` at all.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const sections = (page: Page) => page.getByRole('navigation', { name: 'Settings sections' });
const heading = (page: Page, name: string) => page.getByRole('heading', { name, level: 1 });

test('an administrator reaches Administration through the account area, #/settings/admin and the old #/admin', async ({ page, builtServer, signInPageAs }) => {
  // The account menu (desktop) or More (phone).
  await signInPageAs(builtServer.credentials.admin, '#/timesheet');
  await (await openAccount(page)).getByRole('link', { name: 'Administration' }).click();
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(heading(page, 'Administration')).toBeVisible();
  await expect(sections(page).getByRole('link', { name: 'Administration' })).toHaveAttribute('aria-current', 'page');
  await expect((await openAccount(page)).getByRole('link', { name: 'Administration' })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');

  // The new address as the first screen after the sign-in.
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(heading(page, 'Administration')).toBeVisible();

  // The old address as the first screen: the address bar is rewritten.
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await signInPageAs(builtServer.credentials.admin, '#/admin');
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(heading(page, 'Administration')).toBeVisible();
});

test('the old #/admin replaces the address (the back button skips it) for an administrator', async ({ page, builtServer, signInPageAs }) => {
  await signInPageAs(builtServer.credentials.admin, '#/history');
  await expect(page).toHaveURL(/#\/history$/);
  await page.evaluate("window.location.hash = '#/admin'");
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(heading(page, 'Administration')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/history$/);
});

test('the Settings sections nav marks the current page and the back button returns to the previous sub-page', async ({ page, builtServer, signInPageAs }) => {
  await signInPageAs(builtServer.credentials.employee, '#/settings');
  await expect(heading(page, 'Settings')).toBeVisible();
  const nav = sections(page);
  await expect(nav.getByRole('link')).toHaveText(['Personal', 'Profile']);
  await expect(nav.getByRole('link', { name: 'Personal' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Profile' })).not.toHaveAttribute('aria-current', /.*/);

  await nav.getByRole('link', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
  await expect(heading(page, 'Profile')).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Personal' })).not.toHaveAttribute('aria-current', /.*/);
  // The account area marks Profile (and not Settings) while the Profile page is shown.
  const account = await openAccount(page);
  await expect(account.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  await expect(account.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current', /.*/);
  await page.keyboard.press('Escape');

  await page.goBack();
  await expect(page).toHaveURL(/#\/settings$/);
  await expect(heading(page, 'Settings')).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Personal' })).toHaveAttribute('aria-current', 'page');
  await page.goForward();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
  await expect(heading(page, 'Profile')).toBeVisible();

  // An administrator also has the Administration link, last.
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await signInPageAs(builtServer.credentials.admin, '#/settings');
  await expect(sections(page).getByRole('link')).toHaveText(['Personal', 'Profile', 'Administration']);
  await sections(page).getByRole('link', { name: 'Administration' }).click();
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(heading(page, 'Administration')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/settings$/);
  await expect(heading(page, 'Settings')).toBeVisible();
});

test('an employee sees no Administration anywhere and the page makes no /api/admin/ request', async ({ page, builtServer, signInPageAs }) => {
  // The listener is attached before the sign-in and covers the whole visit.
  const adminRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/admin/')) adminRequests.push(`${request.method()} ${request.url()}`);
  });

  // Entering at each admin address as the first screen: the timesheet, no Administration heading.
  for (const start of ['#/settings/admin', '#/admin']) {
    await signInPageAs(builtServer.credentials.employee, start);
    await expect(page).toHaveURL(/#\/timesheet$/);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Administration' })).toHaveCount(0);
    await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  }

  // Moving to them while signed in.
  await signInPageAs(builtServer.credentials.employee, '#/settings');
  await expect(heading(page, 'Settings')).toBeVisible();
  await expect(sections(page).getByRole('link', { name: 'Administration' })).toHaveCount(0);
  await expect((await openAccount(page)).getByRole('link', { name: 'Administration' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  for (const hash of ['#/settings/admin', '#/admin']) {
    await page.evaluate(`window.location.hash = ${JSON.stringify(hash)}`);
    await expect(page).toHaveURL(/#\/timesheet$/);
    await expect(page.getByRole('heading', { name: 'Administration' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Settings sections' })).toHaveCount(0);
  }
  await page.waitForLoadState('networkidle');
  expect(adminRequests, 'admin requests made by an employee page').toEqual([]);
});

test('Profile shows the display name, email, role and reporting zone, read only, with the note', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const person = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Profile Person' });
  const personApi = await new SeedClient(builtServer.origin).signIn(person.email, person.password);
  const periods = await personApi.call<{ reporting_zone: string }>('GET', '/api/periods/current');

  await signInPageAs(person, '#/settings/profile');
  await expect(heading(page, 'Profile')).toBeVisible();
  const facts = page.getByRole('region', { name: 'Your profile' });
  await expect(facts.locator('[data-profile="display-name"]')).toHaveText('Synthetic Profile Person');
  await expect(facts.locator('[data-profile="email"]')).toHaveText(person.email);
  await expect(facts.locator('[data-profile="role"]')).toHaveText('Employee');
  await expect(facts.locator('[data-profile="zone"]')).toHaveText(periods.reporting_zone);
  for (const label of ['Display name', 'Email', 'Role', 'Reporting zone']) await expect(facts.getByText(label, { exact: true })).toBeVisible();
  await expect(page.getByText('An administrator changes display names.')).toBeVisible();
  // Read only: nothing on the page can be edited.
  await expect(page.locator('main').locator('input, textarea, select')).toHaveCount(0);
  await expect(page.locator('main').getByRole('button')).toHaveCount(0);
  await page.screenshot({ path: screenshotPath(`profile-${testInfo.project.name}-synthetic.png`), fullPage: true });

  // An administrator's Profile names the role.
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await signInPageAs(builtServer.credentials.admin, '#/settings/profile');
  await expect(heading(page, 'Profile')).toBeVisible();
  await expect(page.locator('[data-profile="role"]')).toHaveText('Administrator');
  await expect(page.locator('[data-profile="email"]')).toHaveText(builtServer.credentials.admin.email);
});

test('the Settings sections nav and the Profile page fit a 320px screen with 44px targets', async ({ page, builtServer, signInPageAs }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await signInPageAs(builtServer.credentials.admin, '#/settings/profile');
  await expect(heading(page, 'Profile')).toBeVisible();
  const links = await sections(page).getByRole('link').all();
  expect(links).toHaveLength(3);
  for (const link of links) {
    const box = await link.boundingBox();
    expect(box, 'the nav link is rendered').not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect((box?.x ?? -1) >= 0 && (box?.x ?? 0) + (box?.width ?? 0) <= 320, 'inside the screen').toBe(true);
  }
  const widths = await page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
});

test('the Administration and Import screens load on demand: a status while loading, then the screen with its heading', async ({ page, builtServer, signInPageAs }) => {
  const delayed: string[] = [];
  await page.route(/\/assets\/(AdminScreen|ImportScreen)-[^/]+\.js$/, async (route) => {
    delayed.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  await expect(page.getByRole('status').filter({ hasText: 'Loading Administration' })).toBeVisible();
  await expect(heading(page, 'Administration')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Loading Administration' })).toHaveCount(0);

  await page.evaluate("window.location.hash = '#/import'");
  await expect(heading(page, 'Import and opening balance')).toBeVisible();
  expect(delayed.some((path) => /AdminScreen-/.test(path)), 'the Administration chunk was requested').toBe(true);
  expect(delayed.some((path) => /ImportScreen-/.test(path)), 'the Import chunk was requested').toBe(true);
});

test('an employee who never opens Administration or Import does not download their chunks', async ({ page, signInThroughUi }) => {
  const chunks: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (/\/assets\/(AdminScreen|ImportScreen)-/.test(path)) chunks.push(path);
  });
  await signInThroughUi();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await page.evaluate("window.location.hash = '#/settings'");
  await expect(heading(page, 'Settings')).toBeVisible();
  await page.evaluate("window.location.hash = '#/settings/profile'");
  await expect(heading(page, 'Profile')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(chunks).toEqual([]);
});

test('a chunk that cannot be loaded shows a readable error with a retry, never a blank page', async ({ page, builtServer, signInPageAs }) => {
  let blocked = true;
  await page.route(/\/assets\/AdminScreen-[^/]+\.js$/, (route) => (blocked ? route.abort('failed') : route.continue()));
  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  const failure = page.getByRole('alert').filter({ hasText: 'Administration could not be loaded' });
  await expect(failure).toBeVisible();
  // The shell and the Settings sections stay; there is no Administration heading.
  await expect(sections(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();

  // A retry while the chunk is still blocked fails again, with the same message.
  await failure.getByRole('button', { name: 'Try again' }).click();
  await expect(failure).toBeVisible();

  // Once the chunk can be fetched, the retry loads the screen.
  blocked = false;
  await failure.getByRole('button', { name: 'Try again' }).click();
  await expect(heading(page, 'Administration')).toBeVisible();
  await expect(failure).toHaveCount(0);
});

test('a chunk failure on Import shows the same error and a retry', async ({ page, builtServer, signInPageAs }) => {
  let blocked = true;
  await page.route(/\/assets\/ImportScreen-[^/]+\.js$/, (route) => (blocked ? route.abort('failed') : route.continue()));
  await signInPageAs(builtServer.credentials.employee, '#/import');
  const failure = page.getByRole('alert').filter({ hasText: 'Import could not be loaded' });
  await expect(failure).toBeVisible();
  blocked = false;
  await failure.getByRole('button', { name: 'Try again' }).click();
  await expect(heading(page, 'Import and opening balance')).toBeVisible();
});
