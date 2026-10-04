import { expect, screenshotPath, test } from './fixtures.ts';

/*
 * Shell smoke on both viewports: sign in, the app shell with its hash route, and the existing
 * two-week timesheet view inside it. A fixed browser zone and locale keep the screenshots
 * stable; the data are synthetic (example.invalid accounts, dates relative to today).
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  // A Content-Security-Policy violation (for example an inline style) shows up as a console error.
  // The signed-out probe GET /api/auth/me answers 401 by design; that one resource error is expected.
  page.on('console', (message) => {
    const unexpected = message.type() === 'error' && !message.text().includes('status of 401');
    expect(unexpected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

test('sign-in form, then the shell on the timesheet route', async ({ page, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Timesheet' })).toBeVisible();
  await page.screenshot({ path: screenshotPath(`login-${project}-synthetic.png`) });

  await signInThroughUi();

  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(nav.getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('banner').getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('an unknown hash falls back to the timesheet route', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await page.evaluate("window.location.hash = '#/does-not-exist'");
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');
});

test('the existing timesheet view works inside the shell', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const [workDate] = await employeeSeed.pastFreeWorkdays();
  expect(workDate, 'a past workday with no session in the current periods').toBeDefined();
  if (workDate === undefined) return;
  await employeeSeed.seedCompleteDay(workDate);

  await signInThroughUi();
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
  const row = page.locator(`[data-day="${workDate}"]`);
  await expect(row).toContainText('complete');
  await expect(row).toContainText('8h 00m');
  await expect(page.locator('[data-day]')).toHaveCount(14);

  await page.screenshot({ path: screenshotPath(`timesheet-${testInfo.project.name}-synthetic.png`), fullPage: true });
});

test('mobile: no horizontal overflow and tap targets of at least 44px', async ({ page, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  await signInThroughUi();
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();

  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);

  const targets = page.locator('button, a[href], input:not([type="checkbox"]), label.inline');
  const count = await targets.count();
  expect(count).toBeGreaterThan(4);
  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    const box = await target.boundingBox();
    const name = (await target.textContent())?.trim() || (await target.getAttribute('aria-label')) || `target ${index}`;
    expect(box, name).not.toBeNull();
    expect(box?.height ?? 0, `${name} height`).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0, `${name} width`).toBeGreaterThanOrEqual(44);
  }
});
