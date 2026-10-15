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
    await expect(nav.getByRole('radiogroup', { name: 'Theme', exact: true })).toBeVisible();
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
    await expect(page.getByRole('banner').getByRole('radiogroup', { name: 'Theme', exact: true })).toBeVisible();
  }
});

test('the Theme control: first control of the top bar group on a desktop, between the entries and Sign out in More on a phone', async ({
  page,
  signInThroughUi,
  isMobile,
}) => {
  await signInThroughUi();
  await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();
  if (isMobile) {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('button', { name: 'More' }).click();
    const panel = page.locator('#more-panel');
    await expect(panel.getByRole('button')).toHaveText(['Sign out']);
    const control = panel.getByRole('radiogroup', { name: 'Theme', exact: true });
    await expect(control.getByRole('radio')).toHaveCount(2);
    await expect(control.locator('label')).toHaveText(['Light', 'Dark']);
    await expect(control.getByRole('radio', { checked: true })).toHaveCount(1);
    // The control sits after the last entry (Settings, Import) and before Sign out; 44px targets.
    const controlBox = await control.boundingBox();
    const lastLink = await panel.getByRole('link').last().boundingBox();
    const signOut = await panel.getByRole('button', { name: 'Sign out' }).boundingBox();
    expect(controlBox?.y ?? 0).toBeGreaterThan(lastLink?.y ?? Number.POSITIVE_INFINITY);
    expect(controlBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(signOut?.y ?? 0);
    for (const radio of await control.getByRole('radio').all()) {
      const box = await radio.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
    // The compact phone top bar has no theme control.
    await expect(page.locator('.shell-bar .theme-switch').filter({ visible: true })).toHaveCount(0);
  } else {
    const group = page.locator('.shell-user');
    await expect(group.getByRole('button')).toHaveText(['Sign out']);
    const control = group.getByRole('radiogroup', { name: 'Theme', exact: true });
    await expect(control.locator('label')).toHaveText(['Light', 'Dark']);
    await expect(control.getByRole('radio', { checked: true })).toHaveCount(1);
    const controlBox = await control.boundingBox();
    const nameBox = await group.locator('.muted').boundingBox();
    expect(controlBox?.x ?? Number.POSITIVE_INFINITY).toBeLessThan(nameBox?.x ?? 0);
    // The More panel exists on a phone only.
    await expect(page.locator('#more-panel')).toHaveCount(0);
  }
});

/*
 * WP5-UX2-T09: Check in/out. Below 768px the status and the one button live in the top bar on every one of
 * the person's own screens (one ClockProvider state, one check-out dialog); from 768px the card stays in the
 * Timesheet page. The two are never rendered together, and a shared view has neither (F-Q5).
 */
const CHECK_CONTROL = /^Check (in|out)$/;
const CHECK_NAMES = ['Check in', 'Check out', 'Clock in', 'Clock out'];

test('Check in/out: in the top bar on every own screen of a phone, as the card in the Timesheet page on a desktop; focus returns to the bar button', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
  isMobile,
}, testInfo) => {
  test.setTimeout(90_000);
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Clock Person', signature: 'none' });
  await signInPageAs(person.account, '#/ot');
  const barGroup = page.getByRole('banner').getByRole('region', { name: 'Check in and out' });
  const card = page.locator('.clock-panel');
  const control = page.getByRole('button', { name: CHECK_CONTROL });

  if (!isMobile) {
    // Desktop: the bar never holds the control; the card is in the Timesheet page only.
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeVisible();
    await expect(control).toHaveCount(0);
    await expect(barGroup).toHaveCount(0);
    await page.goto('/#/timesheet');
    await expect(card).toBeVisible();
    await expect(card.getByRole('button', { name: 'Check in', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Check in and out' })).toHaveCount(1);
    await expect(barGroup).toHaveCount(0);
    await page.screenshot({ path: screenshotPath('clock-desktop-unchanged-synthetic.png'), animations: 'disabled' });
    return;
  }

  // Phone, on Overtime: the card is gone from every page; the bar holds the words and the button.
  await expect(barGroup).toBeVisible();
  await expect(barGroup).toContainText('Checked out');
  await expect(card).toHaveCount(0);
  await expect(control).toHaveCount(1);
  await page.getByRole('banner').getByRole('button', { name: 'Check in', exact: true }).click();
  await expect(barGroup).toContainText('Checked in since');
  await expect(barGroup.getByRole('button', { name: 'Check out', exact: true })).toBeVisible();
  await expect(control).toHaveCount(1);
  await page.screenshot({ path: screenshotPath(`clock-bar-${testInfo.project.name}-checked-in-synthetic.png`), animations: 'disabled' });

  // The state follows the person to History without a second control.
  await page.goto('/#/history');
  await expect(page.getByRole('heading', { name: 'History', exact: true })).toBeVisible();
  await expect(barGroup).toContainText('Checked in since');
  await expect(card).toHaveCount(0);

  // The one dialog opens from the bar; closing it returns focus to the bar button.
  const checkOut = barGroup.getByRole('button', { name: 'Check out', exact: true });
  await checkOut.click();
  const dialog = page.getByRole('dialog', { name: 'Check out' });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: screenshotPath(`clock-bar-${testInfo.project.name}-dialog-synthetic.png`), animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(checkOut).toBeFocused();

  // Checking out from the bar ends the session, flips the bar to Check in and puts focus on the bar button again.
  await page.waitForTimeout(1_500);
  await checkOut.click();
  await dialog.getByRole('radio', { name: /No breaks taken/ }).check();
  await dialog.getByRole('button', { name: 'Check out, no breaks taken' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(barGroup).toContainText('Checked out');
  const checkIn = barGroup.getByRole('button', { name: 'Check in', exact: true });
  await expect(checkIn).toBeVisible();
  await expect(checkIn).toBeFocused();

  // Checking in works from History as well.
  await checkIn.click();
  await expect(barGroup).toContainText('Checked in since');
  await expect(card).toHaveCount(0);

  // Back on the Timesheet page the card is still absent and the one bar control reflects the running session.
  await page.goto('/#/timesheet');
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await expect(card).toHaveCount(0);
  await expect(barGroup).toContainText('Checked in since');
  await expect(control).toHaveCount(1);
});

for (const hash of ['', '/timesheet', '/ot', '/revisions']) {
  test(`a shared view${hash === '' ? '' : ` (${hash.slice(1)})`} has no Check in or Check out control, and makes no clock or own-period request`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
  }) => {
    test.setTimeout(90_000);
    const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Clock Owner', signature: 'none' });
    const me = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Clock Grantee', signature: 'none' });
    await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: true, pdf_download: true } }, 201);
    // The grantee is checked in on their own account: nothing of that may show beside the owner's timesheets.
    await me.api.call('POST', '/api/clock/in', { input_zone: 'America/Los_Angeles' }, 201);
    await signInPageAs(me.account, '#/timesheet');
    await expect(page.getByRole('combobox', { name: 'Shared with me' })).toBeVisible();
    // The own Timesheet page and its clock state have finished loading before the requests are counted.
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');
    await page.waitForLoadState('networkidle');
    const requests: string[] = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (pathname.startsWith('/api/')) requests.push(`${request.method()} ${pathname}`);
    });
    await page.evaluate(`window.location.hash = '#/shared/${owner.account.id}${hash}'`);
    await expect(page.locator('[data-share-bar]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Synthetic Clock Owner/ }).first()).toBeVisible();
    for (const name of CHECK_NAMES) await expect(page.getByRole('button', { name }), name).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(Check|Clock) (in|out)/ })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Check in and out' })).toHaveCount(0);
    await expect(page.locator('.clock-panel, .bar-clock')).toHaveCount(0);
    // The state is not read in a shared view: no clock call and none of the person's own period reads.
    await page.waitForTimeout(500);
    const own = requests.filter((entry) => /\/api\/(clock|periods\/current|timesheets\/)/.test(entry) && !entry.includes('/api/shared/'));
    expect(own, 'own clock and period requests in a shared view').toEqual([]);
    // Back to the person's own screens the control returns (a phone: in the bar; a desktop: in the Timesheet page card).
    await page.evaluate("window.location.hash = '#/timesheet'");
    await expect(page.getByRole('button', { name: CHECK_CONTROL })).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');
  });
}

for (const width of [390, 375, 360, 320]) {
  for (const withShare of [false, true]) {
    test(`phone bar at ${width}px${withShare ? ' with a received share' : ''}: clock in the bar, the measured bar size, 44px targets, no sideways scroll`, async ({
      page,
      adminSeed,
      builtServer,
      signInPageAs,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'The phone bar only');
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 844 });
      const me = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Bar Person', signature: 'none' });
      if (withShare) {
        const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Bar Owner', signature: 'none' });
        await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
      }
      await me.api.call('POST', '/api/clock/in', { input_zone: 'America/Los_Angeles' }, 201);
      await signInPageAs(me.account, '#/history');
      const group = page.getByRole('banner').getByRole('region', { name: 'Check in and out' });
      await expect(group).toContainText('Checked in since');
      if (withShare) await expect(page.getByRole('combobox', { name: 'Shared with me' })).toBeVisible();
      const measured = await page.evaluate<{ bar: number; property: number; scroll: number; client: number }>(`(() => {
        const bar = document.querySelector('.shell-bar').getBoundingClientRect().height;
        const property = parseFloat(document.documentElement.style.getPropertyValue('--shell-bar-size'));
        return { bar, property, scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth };
      })()`);
      // AX-01: the scroll padding follows the measured height of the taller bar.
      expect(measured.property, '--shell-bar-size equals the rendered bar').toBeCloseTo(measured.bar, 1);
      expect(measured.scroll, 'no horizontal scroll').toBeLessThanOrEqual(measured.client);
      const button = await group.getByRole('button', { name: 'Check out', exact: true }).boundingBox();
      const bar = await page.locator('.shell-bar').boundingBox();
      const logo = await page.locator('.shell-brand img').boundingBox();
      const groupBox = await group.boundingBox();
      expect(button?.height ?? 0, 'Check out height').toBeGreaterThanOrEqual(44);
      expect(button?.width ?? 0, 'Check out width').toBeGreaterThanOrEqual(44);
      // The logo and the group share the first row; the group sits at the right and inside the bar.
      expect(Math.abs((logo?.y ?? 0) + (logo?.height ?? 0) / 2 - ((button?.y ?? 0) + (button?.height ?? 0) / 2)), 'logo and button centred on one row').toBeLessThanOrEqual(8);
      expect((groupBox?.x ?? 0) + (groupBox?.width ?? 0), 'group inside the bar').toBeLessThanOrEqual((bar?.x ?? 0) + (bar?.width ?? 0));
      expect((groupBox?.x ?? 0), 'group right of the logo').toBeGreaterThanOrEqual((logo?.x ?? 0) + (logo?.width ?? 0));
      if (withShare) {
        // The switcher wraps to a second row under the logo and the group; its targets keep 44px.
        const select = await page.getByRole('combobox', { name: 'Shared with me' }).boundingBox();
        expect(select?.y ?? 0, 'switcher on its own row').toBeGreaterThanOrEqual((button?.y ?? 0) + (button?.height ?? 0) - 1);
        expect(select?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(measured.bar, 'two rows of 44px targets').toBeLessThanOrEqual(112.5);
      } else {
        expect(measured.bar, 'one row of a 44px target').toBeLessThanOrEqual(60.5);
      }
      console.log(`BAR width=${width} share=${withShare} bar.h=${measured.bar} --shell-bar-size=${measured.property} group.w=${groupBox?.width} button=${button?.width}x${button?.height}`);
      if (width === 390 || width === 320) {
        await page.screenshot({ path: screenshotPath(`clock-bar-${width}${withShare ? '-share' : ''}-synthetic.png`), clip: { x: 0, y: 0, width, height: Math.ceil(measured.bar) + 8 }, animations: 'disabled' });
      }
    });
  }
}

/** The text of the focused control, `select` for the sharing switcher's list, or the group name (`Theme`) for a radio. */
async function focusedLabel(page: Page): Promise<string> {
  return page.evaluate<string>(
    "(() => { const element = document.activeElement; if (element === null) return ''; if (element.tagName === 'SELECT') return 'select'; if (element instanceof HTMLInputElement && element.type === 'radio') return element.closest('[role=radiogroup]')?.getAttribute('aria-label') ?? 'radio'; return (element.textContent ?? '').trim(); })()",
  );
}

test('desktop Tab order: navigation links, Theme (one stop), Sign out', async ({ page, signInThroughUi }) => {
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
  expect(order.slice(0, 5)).toEqual(['Overtime', 'History', 'Settings', 'Theme', 'Sign out']);
});

test('desktop Tab order with the sharing switcher: navigation links, switcher, Theme, Sign out', async ({
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
  expect(order).toEqual(['Overtime', 'History', 'Settings', 'select', 'Open', 'Theme', 'Sign out']);
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
    await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();
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
  await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();

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
