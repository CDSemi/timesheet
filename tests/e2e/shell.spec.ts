import type { Page } from '@playwright/test';
import { expect, newPerson, screenshotPath, test } from './fixtures.ts';

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
  await expect(nav.getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/#\/timesheet$/);
  if (project === 'mobile') {
    // Phone: three tabs and "More"; the less frequent entries and Sign out open from it.
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History']);
    const more = nav.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History', 'Settings', 'Import']);
    await expect(nav.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Dark mode', exact: true })).toBeVisible();
    await page.screenshot({ path: screenshotPath(`shell-more-${project}-synthetic.png`) });
    await page.keyboard.press('Escape');
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(more).toBeFocused();
    // Each tab is at least 56x44 px.
    for (const tab of [...(await nav.getByRole('link').all()), more]) {
      const box = await tab.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(56);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
  } else {
    // Desktop: the top bar lists the main screens (Import is a link inside Settings) and has Sign out.
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History', 'Settings']);
    await expect(page.getByRole('banner').getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('button', { name: 'Dark mode', exact: true })).toBeVisible();
  }
});

test('the Dark mode toggle: first control of the top bar group on a desktop, between the entries and Sign out in More on a phone', async ({
  page,
  signInThroughUi,
  isMobile,
}) => {
  await signInThroughUi();
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
  if (isMobile) {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('button', { name: 'More' }).click();
    const panel = page.locator('#more-panel');
    await expect(panel.getByRole('button')).toHaveText(['Dark mode', 'Sign out']);
    const toggle = panel.getByRole('button', { name: 'Dark mode', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', /^(true|false)$/);
    // The toggle sits after the last entry (Settings, Import) and before Sign out; a 44px target.
    const toggleBox = await toggle.boundingBox();
    const lastLink = await panel.getByRole('link').last().boundingBox();
    const signOut = await panel.getByRole('button', { name: 'Sign out' }).boundingBox();
    expect(toggleBox?.y ?? 0).toBeGreaterThan(lastLink?.y ?? Number.POSITIVE_INFINITY);
    expect(toggleBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(signOut?.y ?? 0);
    expect(toggleBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(toggleBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    // The compact phone top bar has no theme control.
    await expect(page.locator('.shell-bar').getByRole('button', { name: 'Dark mode' })).toHaveCount(0);
  } else {
    const group = page.locator('.shell-user');
    await expect(group.getByRole('button')).toHaveText(['Dark mode', 'Sign out']);
    const toggleBox = await group.getByRole('button', { name: 'Dark mode', exact: true }).boundingBox();
    const nameBox = await group.locator('.muted').boundingBox();
    expect(toggleBox?.x ?? Number.POSITIVE_INFINITY).toBeLessThan(nameBox?.x ?? 0);
    // The More panel exists on a phone only.
    await expect(page.locator('#more-panel')).toHaveCount(0);
  }
});

/** The text of the focused control, or `select` for the sharing switcher's list. */
async function focusedLabel(page: Page): Promise<string> {
  return page.evaluate<string>(
    "(() => { const element = document.activeElement; return element === null ? '' : element.tagName === 'SELECT' ? 'select' : (element.textContent ?? '').trim(); })()",
  );
}

test('desktop Tab order: navigation links, Dark mode, Sign out', async ({ page, signInThroughUi }) => {
  // The top bar is the desktop layout: both projects use a desktop-sized window here.
  await page.setViewportSize({ width: 1280, height: 800 });
  await signInThroughUi();
  const nav = page.getByRole('banner').getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'Timesheet' }).focus();
  const order: string[] = [];
  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press('Tab');
    order.push(await focusedLabel(page));
  }
  expect(order.slice(0, 5)).toEqual(['Overtime', 'History', 'Settings', 'Dark mode', 'Sign out']);
});

test('desktop Tab order with the sharing switcher: navigation links, switcher, Dark mode, Sign out', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const me = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Tab Order User', signature: 'none' });
  const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Tab Order Owner', signature: 'none' });
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  await signInPageAs(me.account, '#/timesheet');
  await expect(page.getByRole('combobox', { name: 'Shared with me' })).toBeVisible();
  const nav = page.getByRole('banner').getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'Timesheet' }).focus();
  const order: string[] = [];
  for (let step = 0; step < 7; step += 1) {
    await page.keyboard.press('Tab');
    order.push(await focusedLabel(page));
  }
  expect(order).toEqual(['Overtime', 'History', 'Settings', 'select', 'Open', 'Dark mode', 'Sign out']);
});

test('an unknown hash falls back to the timesheet route', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await page.evaluate("window.location.hash = '#/does-not-exist'");
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('link', { name: 'Timesheet' })).toHaveAttribute('aria-current', 'page');
});

test('the existing timesheet view works inside the shell', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  // A day of the period the page displays (it fails clearly when that period has no past free workday).
  const workDate = await employeeSeed.displayedSeedDay();
  // WP5-UX-AB8-02: the employee is shared by the worker's specs; release the day so a short period keeps its free workdays.
  try {
    await employeeSeed.seedCompleteDay(workDate);

    await signInThroughUi();
    await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
    const row = page.locator(`[data-day="${workDate}"]`);
    await expect(row).toContainText('Complete');
    await expect(row.locator('[data-check="complete"]')).toHaveCount(1);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    // The worked minutes of the sheet's detail row (Show details), as h:mm.
    await page.getByRole('switch', { name: 'Show details' }).check();
    await expect(page.locator(`[data-detail="regular"][data-detail-day="${workDate}"]`)).toHaveText('8:00');

    await page.screenshot({ path: screenshotPath(`timesheet-${testInfo.project.name}-synthetic.png`), fullPage: true });
  } finally {
    await employeeSeed.clearSessions(workDate);
  }
});

test('mobile: no horizontal overflow and tap targets of at least 44px', async ({ page, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  await signInThroughUi();
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();

  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);

  // Only rendered controls are tap targets: the desktop bar is not displayed on a phone.
  const targets = page.locator('button, a[href], input:not([type="checkbox"]), label.inline').filter({ visible: true });
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
