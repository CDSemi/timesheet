import type { Locator, Page } from '@playwright/test';
import { parseColour, textContrast, tokenColour } from './contrast.ts';
import { expect, newPerson, openAccount, screenshotPath, test } from './fixtures.ts';

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
    // Phone: three tabs and "More"; the account entries (Profile, Settings, Import) and Sign out open from it.
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History']);
    const more = nav.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History', 'Profile', 'Settings', 'Import']);
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
    // Desktop: the top bar lists the three main screens only; Settings, Theme and Sign out are in the account
    // menu under the identity button (the same items are still reachable, one step further).
    await expect(nav.getByRole('link')).toHaveText(['Timesheet', 'Overtime', 'History']);
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
    await expect(banner.getByRole('radiogroup', { name: 'Theme', exact: true })).toHaveCount(0);
    await expect(banner.getByRole('link', { name: 'Settings' })).toHaveCount(0);
    const account = await openAccount(page);
    await expect(account.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(account.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(account.getByRole('radiogroup', { name: 'Theme', exact: true })).toBeVisible();
    await account.screenshot({ path: screenshotPath(`shell-account-menu-${project}-synthetic.png`), animations: 'disabled' });
  }
});

/*
 * WP5-UX3-T02 (owner decisions U-03 to U-05): the identity block at the right end of the bar from 768px (display name
 * over email, then the initials avatar and a chevron) discloses the account menu: header, Profile, Settings,
 * Administration (administrators), Theme, Sign out. On a phone the same content is the "More" panel and the bar has
 * no avatar. The synthetic seed accounts are "Example Employee" (employee@example.invalid) and "Example Admin".
 */
const EMPLOYEE = { name: 'Example Employee', email: 'employee@example.invalid', initials: 'EE' } as const;

interface IdentityLook {
  nameWeight: number;
  nameSize: number;
  emailSize: number;
  nameColour: string;
  emailColour: string;
  nameRight: number;
  emailRight: number;
  avatarLeft: number;
  avatarWidth: number;
  avatarHeight: number;
  avatarRadius: number;
  button: number;
  inner: number;
}

test('the account menu (desktop) and the More panel (phone): header, entries, Theme between the entries and Sign out, 44px targets on a phone', async ({
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
    // The header (the former "more-who" line): avatar, full name and email; no role line for an employee.
    const head = panel.locator('.account-head');
    await expect(head.locator('.account-name')).toHaveText(EMPLOYEE.name);
    await expect(head.locator('.account-email')).toHaveText(EMPLOYEE.email);
    await expect(head.locator('.avatar')).toHaveText(EMPLOYEE.initials);
    await expect(head.locator('.avatar')).toHaveAttribute('aria-hidden', 'true');
    await expect(panel.getByText('Administrator')).toHaveCount(0);
    await expect(panel.getByRole('link')).toHaveText(['Profile', 'Settings', 'Import']);
    await expect(panel.getByRole('button')).toHaveText(['Sign out']);
    const control = panel.getByRole('radiogroup', { name: 'Theme', exact: true });
    await expect(control.getByRole('radio')).toHaveCount(2);
    await expect(control.locator('label')).toHaveText(['Light', 'Dark']);
    await expect(control.getByRole('radio', { checked: true })).toHaveCount(1);
    // The control sits after the last entry (Profile, Settings, Import) and before Sign out; 44px targets.
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
    // The compact phone top bar has no theme control, no identity button and no avatar (the first screen pays nothing).
    await expect(page.locator('.shell-bar .theme-switch').filter({ visible: true })).toHaveCount(0);
    await expect(page.locator('.shell-bar button.identity').filter({ visible: true })).toHaveCount(0);
    await expect(page.locator('.shell-bar .avatar').filter({ visible: true })).toHaveCount(0);
    return;
  }

  const banner = page.getByRole('banner');
  const identity = banner.getByRole('button', { name: /, account menu$/ });
  // One button: its accessible name is the visible name and email plus a hidden ", account menu" (SC 2.5.3).
  await expect(identity).toHaveCount(1);
  await expect(identity).toHaveAccessibleName(new RegExp(`^${EMPLOYEE.name}\\s+employee@example\\.invalid\\s*,\\s*account menu$`));
  await expect(identity.locator('.identity-name')).toHaveText(EMPLOYEE.name);
  await expect(identity.locator('.identity-email')).toHaveText(EMPLOYEE.email);
  await expect(identity.locator('.avatar')).toHaveText(EMPLOYEE.initials);
  await expect(identity.locator('.avatar')).toHaveAttribute('aria-hidden', 'true');
  await expect(identity.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(identity.locator('img')).toHaveCount(0);
  await expect(identity).toHaveAttribute('aria-expanded', 'false');
  await expect(identity).toHaveAttribute('aria-controls', 'account-menu');
  await expect(page.locator('#account-menu')).toHaveCount(0);
  // The name is bold in the text colour, the email smaller in the muted colour, both right-aligned before the 36px avatar.
  const look = await page.evaluate<IdentityLook>(`(() => {
    const button = document.querySelector('header.shell-bar button.identity');
    const part = (selector) => {
      const element = button.querySelector(selector);
      return { css: getComputedStyle(element), box: element.getBoundingClientRect() };
    };
    const name = part('.identity-name');
    const email = part('.identity-email');
    const avatar = part('.avatar');
    return {
      nameWeight: Number(name.css.fontWeight),
      nameSize: parseFloat(name.css.fontSize),
      emailSize: parseFloat(email.css.fontSize),
      nameColour: name.css.color,
      emailColour: email.css.color,
      nameRight: name.box.right,
      emailRight: email.box.right,
      avatarLeft: avatar.box.left,
      avatarWidth: avatar.box.width,
      avatarHeight: avatar.box.height,
      avatarRadius: parseFloat(avatar.css.borderTopLeftRadius),
      button: button.getBoundingClientRect().right,
      inner: window.innerWidth,
    };
  })()`);
  expect(look.nameWeight, 'the display name is bold').toBeGreaterThanOrEqual(600);
  expect(look.emailSize, 'the email is smaller than the name').toBeLessThan(look.nameSize);
  expect(parseColour(look.nameColour), 'the name is in the text colour').toEqual(await tokenColour(page, '--text'));
  expect(parseColour(look.emailColour), 'the email is in the muted colour').toEqual(await tokenColour(page, '--muted'));
  expect(Math.abs(look.nameRight - look.emailRight), 'name and email are right-aligned to one edge').toBeLessThanOrEqual(1);
  expect(look.nameRight, 'the text ends before the avatar').toBeLessThanOrEqual(look.avatarLeft);
  expect(look.avatarWidth).toBeCloseTo(36, 0);
  expect(look.avatarHeight).toBeCloseTo(36, 0);
  expect(look.avatarRadius, 'the avatar is round').toBeGreaterThanOrEqual(18);
  expect(look.button, 'the button is at the right end of the bar').toBeGreaterThan(look.inner - 48);

  await identity.click();
  const panel = page.locator('#account-menu');
  await expect(panel).toBeVisible();
  await expect(identity).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('.account-head .account-name')).toHaveText(EMPLOYEE.name);
  await expect(panel.locator('.account-head .account-email')).toHaveText(EMPLOYEE.email);
  await expect(panel.locator('.account-head .avatar')).toHaveText(EMPLOYEE.initials);
  await expect(panel.getByText('Administrator')).toHaveCount(0);
  await expect(panel.getByRole('link')).toHaveText(['Profile', 'Settings']);
  await expect(panel.getByRole('button')).toHaveText(['Sign out']);
  const control = panel.getByRole('radiogroup', { name: 'Theme', exact: true });
  await expect(control.locator('label')).toHaveText(['Light', 'Dark']);
  await expect(control.getByRole('radio', { checked: true })).toHaveCount(1);
  // Order from the top: header, Profile, Settings, Theme, Sign out.
  const ys = [
    await panel.locator('.account-head').boundingBox(),
    await panel.getByRole('link', { name: 'Profile' }).boundingBox(),
    await panel.getByRole('link', { name: 'Settings' }).boundingBox(),
    await control.boundingBox(),
    await panel.getByRole('button', { name: 'Sign out' }).boundingBox(),
  ].map((box) => box?.y ?? Number.NaN);
  expect([...ys].sort((a, b) => a - b), 'header, Profile, Settings, Theme, Sign out in that order').toEqual(ys);
  // Right-aligned under the button, inside the viewport and below the identity button.
  const panelBox = await panel.boundingBox();
  const buttonBox = await identity.boundingBox();
  expect(Math.abs((panelBox?.x ?? 0) + (panelBox?.width ?? 0) - ((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0)))).toBeLessThanOrEqual(1);
  expect(panelBox?.y ?? 0, 'the menu opens below the button, never under the sticky bar').toBeGreaterThanOrEqual((buttonBox?.y ?? 0) + (buttonBox?.height ?? 0));
  expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0)).toBeLessThanOrEqual(look.inner);
  // The menu is painted above the page: its centre hits the panel, not what is under it.
  const onTop = await page.evaluate<boolean>(`(() => {
    const panel = document.querySelector('#account-menu');
    const rect = panel.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit !== null && panel.contains(hit);
  })()`);
  expect(onTop, 'the menu is above the page content').toBe(true);
  // Clicking the button again closes it.
  await identity.click();
  await expect(panel).toHaveCount(0);
  await expect(identity).toHaveAttribute('aria-expanded', 'false');
  // The More panel exists on a phone only.
  await expect(page.locator('#more-panel')).toHaveCount(0);
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
  // WP5-UX3-T04 (U-07): the desktop group is no longer a card; it sits in the title row of the Timesheet page (`.clock-group`).
  // `.clock-panel` (the removed card) must not exist in any state; on a phone neither element exists in the page.
  const card = page.locator('.clock-group');
  const control = page.getByRole('button', { name: CHECK_CONTROL });

  if (!isMobile) {
    // Desktop: the bar never holds the control; the group is in the Timesheet page's title row only.
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeVisible();
    await expect(control).toHaveCount(0);
    await expect(barGroup).toHaveCount(0);
    await page.goto('/#/timesheet');
    await expect(card).toBeVisible();
    await expect(page.locator('.clock-panel')).toHaveCount(0);
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
  await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
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
    await expect(page.locator('.clock-panel, .clock-group, .bar-clock')).toHaveCount(0);
    // The state is not read in a shared view: no clock call and none of the person's own period reads.
    await page.waitForTimeout(500);
    const own = requests.filter((entry) => /\/api\/(clock|periods\/current|timesheets\/)/.test(entry) && !entry.includes('/api/shared/'));
    expect(own, 'own clock and period requests in a shared view').toEqual([]);
    // Back to the person's own screens the control returns (a phone: in the bar; a desktop: in the Timesheet page's title row).
    await page.evaluate("window.location.hash = '#/timesheet'");
    await expect(page.getByRole('button', { name: CHECK_CONTROL })).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');
  });
}

/*
 * WP5-UX3-T04 (U-07, U-08): the title row of the Timesheet page. From 768px the check in/out group sits on the right of the h1 in the same
 * row box (no card around it); a phone keeps the top-bar group and the visually hidden page head; a shared view has no check in/out. There
 * is no name line under the title in the own view or in a shared view (the shared h1 still says "{owner}'s timesheet").
 */
test('the title row: check in/out right of the h1 on a desktop (no card), the phone head unchanged, and no name line under the title', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
  isMobile,
}, testInfo) => {
  test.setTimeout(90_000);
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Title Person', signature: 'none' });
  await signInPageAs(person.account, '#/timesheet');
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const head = page.locator('.page-head');
  const heading = head.getByRole('heading', { name: 'Timesheet', level: 1 });
  await expect(heading).toHaveCount(1);
  // U-08: nothing under the title but the heading itself and, from 768px, the check in/out group; the person's name is not printed there.
  await expect(head.locator('p')).toHaveCount(0);
  await expect(head).not.toContainText('Synthetic Title Person');
  await expect(head).not.toContainText('Signed in as');
  await expect(page.locator('.clock-panel')).toHaveCount(0);

  if (isMobile) {
    // A phone: the page head is visually hidden (a 1px clipped box), the clock lives in the top bar only.
    await expect(page.locator('.clock-group')).toHaveCount(0);
    const box = await head.boundingBox();
    expect(box?.height ?? 99, 'the phone page head is visually hidden').toBeLessThanOrEqual(1.5);
    await expect(page.getByRole('banner').getByRole('region', { name: 'Check in and out' })).toBeVisible();
    return;
  }

  const group = head.getByRole('region', { name: 'Check in and out' });
  await expect(group).toBeVisible();
  await expect(page.getByRole('banner').getByRole('region', { name: 'Check in and out' })).toHaveCount(0);
  const measure = async () => {
    const [headBox, titleBox, groupBox, buttonBox] = await Promise.all([
      head.boundingBox(),
      heading.boundingBox(),
      group.boundingBox(),
      group.getByRole('button').boundingBox(),
    ]);
    expect(headBox, 'head box').not.toBeNull();
    expect(titleBox, 'title box').not.toBeNull();
    expect(groupBox, 'group box').not.toBeNull();
    expect(buttonBox, 'button box').not.toBeNull();
    return { headBox: headBox as NonNullable<typeof headBox>, titleBox: titleBox as NonNullable<typeof titleBox>, groupBox: groupBox as NonNullable<typeof groupBox>, buttonBox: buttonBox as NonNullable<typeof buttonBox> };
  };
  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    const { headBox, titleBox, groupBox, buttonBox } = await measure();
    // The same row box: the group starts right of the h1's right edge, and the two share vertical space inside the head.
    expect(groupBox.x, `${width}px: the group is right of the title`).toBeGreaterThanOrEqual(titleBox.x + titleBox.width);
    const overlap = Math.min(titleBox.y + titleBox.height, groupBox.y + groupBox.height) - Math.max(titleBox.y, groupBox.y);
    expect(overlap, `${width}px: the title and the group share the row`).toBeGreaterThan(0);
    expect(groupBox.y, `${width}px: the group is inside the head`).toBeGreaterThanOrEqual(headBox.y - 0.5);
    expect(groupBox.y + groupBox.height, `${width}px: the group is inside the head`).toBeLessThanOrEqual(headBox.y + headBox.height + 0.5);
    // Right-aligned: the group ends at the head's right edge.
    expect(Math.abs(groupBox.x + groupBox.width - (headBox.x + headBox.width)), `${width}px: the group is right-aligned`).toBeLessThanOrEqual(1);
    // The compact button: 38px on a pointer device (44px is the touch size, tested by the generic 44px rule).
    expect(buttonBox.height, `${width}px: the compact button`).toBeCloseTo(38, 0);
    // Not a card: no surface of its own.
    const surface = await group.evaluate((element) => {
      const style = element.ownerDocument.defaultView?.getComputedStyle(element);
      return { shadow: style?.boxShadow ?? '', background: style?.backgroundColor ?? '', padding: style?.paddingTop ?? '' };
    });
    expect(surface.shadow, `${width}px: no card shadow`).toBe('none');
    expect(surface.background, `${width}px: no card fill`).toBe('rgba(0, 0, 0, 0)');
    expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), `${width}px: no sideways scroll`).toBe(true);
    // The period card is full width: its right edge is the head's right edge.
    const period = await page.locator('.period-bar').boundingBox();
    expect(Math.abs((period?.x ?? 0) + (period?.width ?? 0) - (headBox.x + headBox.width)), `${width}px: the period card is full width`).toBeLessThanOrEqual(1);
  }

  // Checked in: the status words are right-aligned over the date line, beside the button.
  await group.getByRole('button', { name: 'Check in', exact: true }).click();
  await expect(group).toContainText('Checked in since');
  const now = await group.locator('.clock-now').boundingBox();
  const line = await group.locator('.clock-state .hint').boundingBox();
  const button = await group.getByRole('button', { name: 'Check out', exact: true }).boundingBox();
  expect(now && line && button, 'status words and button are painted').toBeTruthy();
  expect(Math.abs((now?.x ?? 0) + (now?.width ?? 0) - ((line?.x ?? 0) + (line?.width ?? 0))), 'the status words and the date line share their right edge').toBeLessThanOrEqual(1);
  expect((now?.x ?? 0) + (now?.width ?? 0), 'the words end left of the button').toBeLessThanOrEqual(button?.x ?? 0);
  expect(line?.y ?? 0, 'the date line is under the words').toBeGreaterThan((now?.y ?? 0) + (now?.height ?? 0) - 1);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('.page-head').screenshot({ path: screenshotPath(`title-row-${testInfo.project.name}-checked-in-synthetic.png`), animations: 'disabled' });
  await page.waitForTimeout(1_500);
  await group.getByRole('button', { name: 'Check out', exact: true }).click();
  await page.getByRole('dialog', { name: 'Check out' }).getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
  await page.getByRole('dialog', { name: 'Check out' }).getByRole('button', { name: 'Check out, no breaks taken' }).click();
  await expect(group).toContainText('Checked out');
});

test('a shared view has no check in/out in the title row and no name line under its title', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(90_000);
  const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Title Owner', signature: 'none' });
  const me = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Title Grantee', signature: 'none' });
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  await signInPageAs(me.account, `#/shared/${owner.account.id}/timesheet`);
  await expect(page.locator('[data-share-bar]')).toBeVisible();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const head = page.locator('.page-head');
  await expect(head.getByRole('heading', { name: "Synthetic Title Owner's timesheet", level: 1 })).toHaveCount(1);
  await expect(head.locator('p')).toHaveCount(0);
  await expect(head).not.toContainText('Signed in as');
  await expect(head).not.toContainText('Synthetic Title Grantee');
  await expect(head.locator('.clock-group, .clock-panel, button')).toHaveCount(0);
  await expect(page.locator('.clock-group, .clock-panel, .bar-clock')).toHaveCount(0);
});

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
      // AX-01: the scroll padding follows the measured height of the taller bar. The ResizeObserver stores the property one to a few
      // frames after the bar changes size (WP5-UX5-DIAG1), so the difference is read in ONE round trip and retried (same 0.05px tolerance).
      await expect
        .poll(
          () =>
            page.evaluate<number>(
              "Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--shell-bar-size')) - document.querySelector('.shell-bar').getBoundingClientRect().height)",
            ),
          { message: '--shell-bar-size equals the rendered bar' },
        )
        .toBeLessThan(0.05);
      const measured = await page.evaluate<{ bar: number; property: number; scroll: number; client: number }>(`(() => {
        const bar = document.querySelector('.shell-bar').getBoundingClientRect().height;
        const property = parseFloat(document.documentElement.style.getPropertyValue('--shell-bar-size'));
        return { bar, property, scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth };
      })()`);
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

/** The identity button of the bar: the visible name and email plus the hidden ", account menu". */
const identityButton = (page: Page): Locator => page.getByRole('banner').getByRole('button', { name: /, account menu$/ });

test('desktop Tab order: navigation links, then the identity button (the menu entries are not stops while it is closed)', async ({ page, signInThroughUi }) => {
  // The top bar is the desktop layout: both projects use a desktop-sized window here.
  await page.setViewportSize({ width: 1280, height: 800 });
  await signInThroughUi();
  const nav = page.getByRole('banner').getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'Timesheet' }).focus();
  const order: string[] = [];
  for (let step = 0; step < 3; step += 1) {
    await page.keyboard.press('Tab');
    order.push(await focusedLabel(page));
  }
  expect(order.slice(0, 2)).toEqual(['Overtime', 'History']);
  expect(order[2], 'the identity button follows the navigation').toContain(EMPLOYEE.name);
  await expect(identityButton(page)).toBeFocused();
});

test('desktop Tab order with the sharing switcher: navigation links, switcher, identity button', async ({
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
  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press('Tab');
    order.push(await focusedLabel(page));
  }
  expect(order.slice(0, 4)).toEqual(['Overtime', 'History', 'select', 'Open']);
  expect(order[4], 'the identity button follows the switcher').toContain('Synthetic Tab Order User');
  await expect(identityButton(page)).toBeFocused();
});

/**
 * The menu from the keyboard (U-04): Enter or Space on the button opens it and moves focus to the first entry; Tab and
 * Shift+Tab walk Profile, Settings, (Administration), Theme (one stop), Sign out; Escape closes it and returns focus to
 * the button; Tab past the last entry, a press outside and a change of the address close it.
 */
for (const role of ['employee', 'admin'] as const) {
  test(`the account menu from the keyboard: open, Tab order, Escape returns focus, outside press and address change close it (${role})`, async ({
    page,
    builtServer,
    signInPageAs,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signInPageAs(builtServer.credentials[role]);
    await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
    const identity = identityButton(page);
    const panel = page.locator('#account-menu');
    const entries = role === 'admin' ? ['Profile', 'Settings', 'Administration'] : ['Profile', 'Settings'];

    // Enter opens it and focus goes to the first entry; the header names the role of an administrator only.
    await identity.focus();
    await page.keyboard.press('Enter');
    await expect(identity).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByRole('link', { name: 'Profile' })).toBeFocused();
    await expect(panel.getByText('Administrator')).toHaveCount(role === 'admin' ? 1 : 0);
    // Tab walks the entries, the Theme group as one stop (its checked radio), then Sign out.
    const order = ['Profile'];
    for (let step = 0; step < entries.length + 1; step += 1) {
      await page.keyboard.press('Tab');
      order.push(await focusedLabel(page));
    }
    expect(order).toEqual([...entries, 'Theme', 'Sign out']);
    // Shift+Tab walks back to the button through the same stops.
    for (let step = 0; step < entries.length + 2; step += 1) await page.keyboard.press('Shift+Tab');
    await expect(identity).toBeFocused();
    await expect(identity).toHaveAttribute('aria-expanded', 'true');

    // Escape closes it and returns focus to the button, also from the last entry and from the Theme radio.
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(identity).toHaveAttribute('aria-expanded', 'false');
    await expect(identity).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(panel.getByRole('link', { name: 'Profile' })).toBeFocused();
    await panel.getByRole('button', { name: 'Sign out' }).focus();
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(identity).toBeFocused();
    await page.keyboard.press('Space');
    await expect(identity).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByRole('link', { name: 'Profile' })).toBeFocused();
    await panel.getByRole('radio', { checked: true }).focus();
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(identity).toBeFocused();

    // Tab past the last entry closes it (focus has left it).
    await page.keyboard.press('Enter');
    await panel.getByRole('button', { name: 'Sign out' }).focus();
    await page.keyboard.press('Tab');
    await expect(panel).toHaveCount(0);
    await expect(identity).toHaveAttribute('aria-expanded', 'false');

    // A pointer press outside closes it; opening with the pointer leaves focus on the button.
    await identity.click();
    await expect(panel).toBeVisible();
    await expect(identity).toBeFocused();
    await page.getByRole('heading', { name: 'Timesheet', exact: true }).click();
    await expect(panel).toHaveCount(0);
    await expect(identity).toHaveAttribute('aria-expanded', 'false');

    // A change of the address closes it.
    await identity.click();
    await expect(panel).toBeVisible();
    await page.evaluate("window.location.hash = '#/ot'");
    await expect(page).toHaveURL(/#\/ot$/);
    await expect(panel).toHaveCount(0);
    await expect(identity).toHaveAttribute('aria-expanded', 'false');

    // An entry used by keyboard closes the panel and moves focus to the heading of the page it opens (WP5-UX3-FIX2 item 1).
    const heading = (name: string) => page.getByRole('heading', { name, level: 1 });
    await identity.focus();
    await page.keyboard.press('Enter');
    await expect(panel.getByRole('link', { name: 'Profile' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/settings\/profile$/);
    await expect(panel).toHaveCount(0);
    await expect(heading('Profile')).toBeFocused();
    await identity.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('link', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(panel).toHaveCount(0);
    await expect(heading('Settings')).toBeFocused();
    if (role === 'admin') {
      // Administration loads on demand: focus lands on its heading once the screen is there.
      await identity.focus();
      await page.keyboard.press('Enter');
      await panel.getByRole('link', { name: 'Administration' }).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#\/settings\/admin$/);
      await expect(heading('Administration')).toBeFocused();
    }

    // The entry of the page that is already shown changes no route: focus returns to the identity button.
    const current = role === 'admin' ? 'Administration' : 'Settings';
    await identity.focus();
    await page.keyboard.press('Enter');
    await panel.getByRole('link', { name: current }).focus();
    await expect(panel.getByRole('link', { name: current })).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('Enter');
    await expect(panel).toHaveCount(0);
    await expect(identity).toHaveAttribute('aria-expanded', 'false');
    await expect(identity).toBeFocused();

    // A pointer user sees no change: the heading takes focus, but not a visible focus ring.
    await identity.click();
    await panel.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/#\/settings\/profile$/);
    await expect(panel).toHaveCount(0);
    await expect(heading('Profile')).toBeFocused();
    expect(await page.evaluate<boolean>("document.activeElement?.matches(':focus-visible') ?? false"), 'no focus ring after a pointer press').toBe(false);
  });
}

/**
 * The phone's More panel follows the same rule as the desktop menu (WP5-UX3-FIX2 item 1): an entry used by keyboard closes the
 * panel and moves focus to the heading of the new page; the entry of the page already shown returns focus to More.
 */
for (const role of ['employee', 'admin'] as const) {
  test(`the More panel from the keyboard: an entry moves focus to the new page's heading, the shown page's entry returns it to More (${role})`, async ({
    page,
    builtServer,
    signInPageAs,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signInPageAs(builtServer.credentials[role], '#/timesheet');
    await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
    const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
    const panel = page.locator('#more-panel');
    const heading = (name: string) => page.getByRole('heading', { name, level: 1 });
    const useEntry = async (name: string) => {
      await more.focus();
      await page.keyboard.press('Enter');
      await expect(panel).toBeVisible();
      await panel.getByRole('link', { name, exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(panel).toHaveCount(0);
    };

    await useEntry('Profile');
    await expect(page).toHaveURL(/#\/settings\/profile$/);
    await expect(heading('Profile')).toBeFocused();
    await useEntry('Settings');
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(heading('Settings')).toBeFocused();
    await useEntry('Import');
    await expect(page).toHaveURL(/#\/import$/);
    await expect(heading('Import and opening balance')).toBeFocused();
    if (role === 'admin') {
      await useEntry('Administration');
      await expect(page).toHaveURL(/#\/settings\/admin$/);
      await expect(heading('Administration')).toBeFocused();
    }

    // The page already shown: the route does not change, so focus returns to More and the panel is closed.
    const current = role === 'admin' ? 'Administration' : 'Import';
    await useEntry(current);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(more).toBeFocused();

    // Escape inside the opened panel closes it and returns focus to More, as Escape does in the desktop menu (WP5-UX3-FIX3 item 5).
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await panel.getByRole('link', { name: current, exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(more).toBeFocused();
    // From the last entry too (Sign out is not a link), so the focus return is not tied to one entry.
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Sign out' }).focus();
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(more).toBeFocused();
  });
}

/**
 * WP5-UX3-FIX4 item 1: the More panel closes when keyboard focus leaves the tab bar, as the desktop menu does ("Tab past Sign out").
 * An open panel left behind would cover the controls that take focus next (WCAG 2.2 SC 2.4.11). Escape, a press on More, a press
 * outside and a page change keep working. The window is a phone width on both projects (the desktop project is a narrow window).
 */
test('the More panel closes when focus leaves it: Tab past Sign out, then the next control is not hidden; a press on More still toggles it', async ({
  page,
  builtServer,
  signInPageAs,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInPageAs(builtServer.credentials.employee, '#/timesheet');
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
  const panel = page.locator('#more-panel');

  // Tab past the last entry: the panel closes (focus has left the tab bar) and More stays a closed toggle.
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Sign out' }).focus();
  await page.keyboard.press('Tab');
  await expect(panel).toHaveCount(0);
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  // The next stop is a control of the page, and nothing paints over it.
  await page.keyboard.press('Tab');
  await expect(panel).toHaveCount(0);
  const next = await page.locator(':focus').evaluate((active) => {
    const box = active.getBoundingClientRect();
    const top = active.ownerDocument.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return { name: active.tagName.toLowerCase(), visible: box.width > 0 && box.height > 0 && top !== null && active.contains(top) };
  });
  expect(next.name, 'focus lands on a control after the panel closed').not.toBe('body');
  expect(next.visible, 'the control focused next is not hidden').toBe(true);

  // Shift+Tab out of the first stop of the bar (backwards) leaves too: open it again with the keyboard, go back past the first tab.
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.getByRole('navigation', { name: 'Main' }).locator('a.tab').first().focus();
  await page.keyboard.press('Shift+Tab');
  await expect(panel).toHaveCount(0);

  // Focus moving between the bar's own controls keeps it open; a press on More toggles it without a flicker (close, then open again).
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await panel.getByRole('link', { name: 'Settings', exact: true }).focus();
  await more.click();
  await expect(panel).toHaveCount(0);
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await more.click();
  await expect(panel).toBeVisible();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await panel.getByRole('link', { name: 'Settings', exact: true }).focus();
  await expect(panel).toBeVisible();
});

/*
 * The identity block always shows the signed-in user, also while a shared timesheet is on screen (the owner is named
 * by the page title and the share bar); on a phone the same user is in the More panel header.
 */
test('a shared view keeps the signed-in user in the bar (the identity button, or the More header on a phone), never the owner', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(90_000);
  const me = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Bar Grantee', signature: 'none' });
  const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Bar Owner', signature: 'none' });
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  await signInPageAs(me.account, `#/shared/${owner.account.id}`);
  await expect(page.locator('[data-share-bar]')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Synthetic Bar Owner/ }).first()).toBeVisible();
  const account = await openAccount(page);
  await expect(account.locator('.account-head .account-name')).toHaveText('Synthetic Bar Grantee');
  await expect(account.locator('.account-head .account-email')).toHaveText(me.account.email);
  await expect(account).not.toContainText('Synthetic Bar Owner');
  if (!(await page.locator('#more-panel').isVisible())) {
    const identity = identityButton(page);
    await expect(identity.locator('.identity-name')).toHaveText('Synthetic Bar Grantee');
    await expect(identity.locator('.identity-email')).toHaveText(me.account.email);
    await expect(identity).not.toContainText('Synthetic Bar Owner');
  }
});

/** Four theme situations as the round-2 specs use them: a light and a dark device, and the manual choice both ways. */
const SITUATIONS: ReadonlyArray<{ name: string; media: 'light' | 'dark'; stored: 'light' | 'dark' | null }> = [
  { name: 'light device', media: 'light', stored: null },
  { name: 'dark device', media: 'dark', stored: null },
  { name: 'light device, manual dark', media: 'light', stored: 'dark' },
  { name: 'dark device, manual light', media: 'dark', stored: 'light' },
];

for (const situation of SITUATIONS) {
  test(`the identity block and the menu header keep 4.5:1 text contrast: name, email, avatar initials, role (${situation.name})`, async ({ page, builtServer, signInPageAs, isMobile }) => {
    test.skip(isMobile, 'The identity button is a desktop-width control; the phone header is checked with the More panel');
    await page.emulateMedia({ colorScheme: situation.media, reducedMotion: 'reduce' });
    if (situation.stored !== null) {
      await page.addInitScript({
        content: `try { if (!sessionStorage.getItem('e2e-theme-seeded')) { localStorage.setItem('timesheet.theme', ${JSON.stringify(situation.stored)}); sessionStorage.setItem('e2e-theme-seeded', '1'); } } catch (error) {}`,
      });
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await signInPageAs(builtServer.credentials.admin);
    const identity = identityButton(page);
    await expect(identity).toBeVisible();
    const measured: string[] = [];
    const check = async (label: string, locator: Locator) => {
      const ratio = await textContrast(locator);
      expect(ratio, `${label} (${situation.name})`).toBeGreaterThanOrEqual(4.5);
      measured.push(`${label} ${ratio.toFixed(2)}`);
    };
    await check('bar name', identity.locator('.identity-name'));
    await check('bar email', identity.locator('.identity-email'));
    await check('bar avatar initials', identity.locator('.avatar'));
    // Under the pointer the button gains a tint: the email still reads on it.
    if (await page.evaluate<boolean>("window.matchMedia('(hover: hover)').matches")) {
      await identity.hover();
      await check('bar email, hovered', identity.locator('.identity-email'));
      await page.mouse.move(0, 0);
    }
    await identity.click();
    const panel = page.locator('#account-menu');
    await expect(panel).toBeVisible();
    await check('menu name', panel.locator('.account-name'));
    await check('menu email', panel.locator('.account-email'));
    await check('menu role', panel.locator('.account-role'));
    await check('menu avatar initials', panel.locator('.avatar'));
    await check('menu Profile', panel.getByRole('link', { name: 'Profile' }));
    await check('menu Sign out', panel.getByRole('button', { name: 'Sign out' }));
    console.log(`identity contrast ${situation.name}: ${measured.join('; ')}`);
  });
}

/* A display name far longer than 14rem is cut by an ellipsis: no wrapping, no overflow, the bar stays one row. */
for (const width of [1024, 1280]) {
  test(`a long display name is truncated in the identity button at ${width}px: one bar row, no horizontal overflow, the menu header shows it in full`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
    isMobile,
  }) => {
    test.skip(isMobile, 'The identity button is a desktop-width control');
    const longName = 'Synthetic Person With An Exceptionally Long Display Name For Truncation';
    const me = await newPerson(adminSeed, builtServer, { displayName: longName, signature: 'none' });
    await page.setViewportSize({ width, height: 800 });
    await signInPageAs(me.account, '#/timesheet');
    const identity = identityButton(page);
    await expect(identity).toBeVisible();
    const facts = await page.evaluate<{ bar: number; scroll: number; inner: number; text: number; max: number; nameClipped: boolean; right: number }>(`(() => {
      const bar = document.querySelector('header.shell-bar');
      const button = bar.querySelector('button.identity');
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--identity-max)';
      document.body.append(probe);
      const max = probe.getBoundingClientRect().width;
      probe.remove();
      const clipped = (selector) => { const element = button.querySelector(selector); return element.scrollWidth > element.clientWidth; };
      return {
        bar: bar.getBoundingClientRect().height,
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
        text: button.querySelector('.identity-text').getBoundingClientRect().width,
        max,
        nameClipped: clipped('.identity-name'),
        right: button.getBoundingClientRect().right,
      };
    })()`);
    expect(facts.max, '--identity-max is 14rem').toBeCloseTo(210, 0);
    expect(facts.text, 'the identity text never exceeds --identity-max').toBeLessThanOrEqual(facts.max + 0.5);
    expect(facts.nameClipped, 'the long name is cut by an ellipsis').toBe(true);
    expect(facts.bar, 'the bar stays one row (at most 64px)').toBeLessThanOrEqual(64);
    expect(facts.scroll, 'no horizontal overflow').toBeLessThanOrEqual(facts.inner);
    expect(facts.right, 'the button ends inside the viewport').toBeLessThanOrEqual(facts.inner);
    // The accessible name still carries the full visible text (SC 2.5.3), and the menu header wraps it in full.
    await expect(identity).toHaveAccessibleName(new RegExp(`^${longName}\\s+${me.account.email.replace(/[.]/g, '\\.')}\\s*,\\s*account menu$`));
    await identity.click();
    const head = page.locator('#account-menu .account-head');
    await expect(head.locator('.account-name')).toHaveText(longName);
    await expect(head.locator('.account-email')).toHaveText(me.account.email);
    const panelFits = await page.evaluate<boolean>(`(() => { const panel = document.querySelector('#account-menu'); return panel.scrollWidth <= panel.clientWidth && panel.getBoundingClientRect().right <= window.innerWidth; })()`);
    expect(panelFits, 'the menu holds the long name without sideways scroll').toBe(true);
    console.log(`identity long name ${width}px: bar ${facts.bar}px, text ${facts.text}px of ${facts.max}px, button right edge ${facts.right} of ${facts.inner}`);
  });
}

/* ---- The phone's More panel holds the same account content and fits every phone width --------------- */

for (const width of [390, 375, 360, 320]) {
  for (const role of ['employee', 'admin'] as const) {
    test(`the More panel at ${width}px (${role}): header, Profile, Settings, Import${role === 'admin' ? ', Administration' : ''}, Theme, Sign out; 44px targets and inside the screen`, async ({
      page,
      builtServer,
      signInPageAs,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await signInPageAs(builtServer.credentials[role], '#/timesheet');
      const panel = await openAccount(page);
      await expect(page.locator('#more-panel')).toBeVisible();
      await expect(panel.locator('.account-head .account-name')).toHaveText(role === 'admin' ? 'Example Admin' : EMPLOYEE.name);
      await expect(panel.locator('.account-head .account-email')).toHaveText(`${role}@example.invalid`);
      await expect(panel.locator('.account-head .avatar')).toHaveText(role === 'admin' ? 'EA' : EMPLOYEE.initials);
      await expect(panel.getByText('Administrator')).toHaveCount(role === 'admin' ? 1 : 0);
      await expect(panel.getByRole('link')).toHaveText(role === 'admin' ? ['Profile', 'Settings', 'Import', 'Administration'] : ['Profile', 'Settings', 'Import']);
      await expect(panel.getByRole('radiogroup', { name: 'Theme', exact: true })).toBeVisible();
      await expect(panel.getByRole('button')).toHaveText(['Sign out']);
      await expect(page.locator('.shell-bar .avatar').filter({ visible: true }), 'no avatar in the phone bar').toHaveCount(0);
      const viewport = await page.evaluate<{ client: number; scroll: number }>('({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })');
      const box = await panel.boundingBox();
      expect(box?.x ?? -1, 'the panel starts inside the screen').toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0), 'the panel ends inside the screen').toBeLessThanOrEqual(viewport.client + 0.5);
      expect(box?.y ?? -1, 'the panel top is on the screen').toBeGreaterThanOrEqual(0);
      expect(viewport.scroll, 'no horizontal scroll').toBeLessThanOrEqual(viewport.client);
      const sizes: string[] = [];
      for (const target of await panel.locator('a, button, label.theme-option, input[type="radio"]').all()) {
        const rect = await target.boundingBox();
        const label = (await target.textContent())?.trim() || (await target.getAttribute('value')) || 'target';
        expect(rect?.height ?? 0, `${label} height`).toBeGreaterThanOrEqual(44);
        expect(rect?.width ?? 0, `${label} width`).toBeGreaterThanOrEqual(44);
        sizes.push(`${Math.round(rect?.width ?? 0)}x${Math.round(rect?.height ?? 0)}`);
      }
      console.log(`More panel ${role} ${width}px: x ${box?.x} y ${box?.y} w ${box?.width} h ${box?.height}, targets ${sizes.join('/')}`);
      if (role === 'admin' && (width === 390 || width === 320)) await page.screenshot({ path: screenshotPath(`more-panel-admin-${width}-synthetic.png`), animations: 'disabled' });
    });
  }
}

/* ---- Every screen stays reachable through the menu or More (Settings, Import, Administration, Sign out) -- */

test('every screen stays reachable: an employee reaches Settings and Import, an administrator Administration, both Sign out (menu on a desktop, More on a phone)', async ({
  page,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(90_000);
  const phone = testInfo.project.name === 'mobile';
  await signInPageAs(builtServer.credentials.employee, '#/timesheet');
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await (await openAccount(page)).getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/#\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  if (phone) {
    await (await openAccount(page)).getByRole('link', { name: 'Import' }).click();
  } else {
    // The desktop reaches Import from Settings; the menu keeps Profile, Settings and Administration.
    await page.getByRole('link', { name: 'Import from Excel' }).click();
  }
  await expect(page).toHaveURL(/#\/import$/);
  await expect(page.getByRole('heading', { name: 'Import and opening balance' })).toBeVisible();
  await (await openAccount(page)).getByRole('link', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();
  await expect((await openAccount(page)).getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  await signInPageAs(builtServer.credentials.admin, '#/timesheet');
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await (await openAccount(page)).getByRole('link', { name: 'Administration' }).click();
  await expect(page).toHaveURL(/#\/settings\/admin$/);
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
  // The account area marks the screen being shown.
  await expect((await openAccount(page)).getByRole('link', { name: 'Administration' })).toHaveAttribute('aria-current', 'page');
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
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
    // The worked minutes of the sheet's detail row (Worked hours), as h:mm.
    await page.getByRole('switch', { name: 'Worked hours' }).check();
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

/*
 * WP5-UX3-FIX3 item 3: a touch screen of 768px or more (a tablet in landscape) shows the top bar with a coarse pointer, and every
 * control of the bar is then at least 44px high (AGENTS UI rule 3, docs/04 "Visual standard"). The identity button used to keep its own
 * 36px minimum (a more specific selector than the touch rule), so it measured 38px.
 */
test.describe('WP5-UX3-FIX3: with a coarse pointer the top bar has no control under 44px', () => {
  test.use({ hasTouch: true, isMobile: false, viewport: { width: 1024, height: 900 } });

  test('1024x900 with touch: the identity button, the navigation links and the switcher are at least 44px high', async ({ page, signInThroughUi }) => {
    await signInThroughUi();
    const identity = identityButton(page);
    await expect(identity).toBeVisible();
    expect(await page.evaluate<boolean>("window.matchMedia('(pointer: coarse)').matches"), 'the window reports a coarse pointer').toBe(true);
    const bar = page.getByRole('banner');
    const controls = await bar.locator('a, button, select, input:not([type="checkbox"]):not([type="radio"])').evaluateAll((elements) =>
      elements
        .map((element) => ({ name: (element.textContent ?? '').trim().slice(0, 30) || element.getAttribute('aria-label') || element.tagName, box: element.getBoundingClientRect() }))
        .filter((item) => item.box.width > 0 && item.box.height > 0)
        .map((item) => ({ name: item.name, height: item.box.height })),
    );
    expect(controls.length, 'the bar has the navigation links and the identity button').toBeGreaterThanOrEqual(4);
    for (const control of controls) expect(control.height, `${control.name} is at least 44px high`).toBeGreaterThanOrEqual(43.9);
    const box = await identity.boundingBox();
    expect(box?.height ?? 0, 'the identity button').toBeGreaterThanOrEqual(43.9);
    console.log(`bar controls with a coarse pointer: ${controls.map((item) => `${item.name} ${item.height}`).join('; ')}`);
  });
});

/*
 * WP5-UX3-FIX3 item 4: the Sign out entry has the same icon gap (12px, --space-3) and the same vertical alignment as Profile and
 * Settings, in the desktop menu and in the phone More panel (the entry is a button, which used to be display: block, so the gap did nothing).
 */
for (const { name, width, height } of [
  { name: 'account menu at 1280', width: 1280, height: 800 },
  { name: 'phone More panel at 390', width: 390, height: 844 },
] as const) {
  test(`Sign out keeps the 12px icon gap and the vertical alignment of Profile and Settings (${name})`, async ({ page, signInThroughUi }) => {
    await page.setViewportSize({ width, height });
    await signInThroughUi();
    const panel = await openAccount(page);
    const measure = async (entry: Locator) =>
      entry.evaluate((element) => {
        const icon = element.querySelector('svg')?.getBoundingClientRect();
        const text = [...element.childNodes].find((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '');
        if (icon === undefined || text === undefined) return null;
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(text);
        const words = range.getBoundingClientRect();
        const entry = element.getBoundingClientRect();
        return {
          gap: words.left - icon.right,
          offset: icon.top + icon.height / 2 - (words.top + words.height / 2),
          iconStart: icon.left - entry.left,
          wordsStart: words.left - entry.left,
        };
      });
    const profile = await measure(panel.getByRole('link', { name: 'Profile', exact: true }));
    const settings = await measure(panel.getByRole('link', { name: 'Settings', exact: true }));
    const signOut = await measure(panel.getByRole('button', { name: 'Sign out', exact: true }));
    expect(profile, 'Profile has an icon and words').not.toBeNull();
    expect(signOut, 'Sign out has an icon and words').not.toBeNull();
    for (const [label, entry] of [['Profile', profile], ['Settings', settings], ['Sign out', signOut]] as const) {
      expect(entry?.gap ?? -1, `${label}: the icon gap is 12px`).toBeGreaterThanOrEqual(11.5);
      expect(entry?.gap ?? 99, `${label}: the icon gap is 12px`).toBeLessThanOrEqual(12.5);
      expect(Math.abs(entry?.offset ?? 99), `${label}: the icon centre is level with the words`).toBeLessThanOrEqual(1.5);
    }
    expect(Math.abs((signOut?.offset ?? 99) - (profile?.offset ?? 0)), 'Sign out aligns like Profile').toBeLessThanOrEqual(1);
    // WP5-UX3-FIX4 item 3: the icon and the words start at the same inline position inside the entry as Profile's (12px and 42px).
    for (const [label, entry] of [['Settings', settings], ['Sign out', signOut]] as const) {
      expect(Math.abs((entry?.iconStart ?? 99) - (profile?.iconStart ?? 0)), `${label}: the icon starts where Profile's does`).toBeLessThanOrEqual(0.5);
      expect(Math.abs((entry?.wordsStart ?? 99) - (profile?.wordsStart ?? 0)), `${label}: the words start where Profile's do`).toBeLessThanOrEqual(0.5);
    }
    console.log(`account entries (${name}): Profile ${JSON.stringify(profile)}; Settings ${JSON.stringify(settings)}; Sign out ${JSON.stringify(signOut)}`);
  });
}
