import type { Page } from '@playwright/test';
import { createAccountByAdminApi, expect, SeedClient, screenshotPath, test } from './fixtures.ts';

/*
 * The "not set up" flag of the administrator's account list (owner decision F-3 (a), WP4-T07B), through the real UI of the
 * BUILT server on both viewports. Two synthetic accounts are created over the admin API: one never saves its submission
 * settings and one does. The list must flag only the first, with a boolean-derived sentence that names no setting, period
 * or date, and the page must not scroll sideways on the mobile viewport.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('console', (message) => {
    expect(message.type() === 'error' && !/status of (401|403)/.test(message.text()), `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const TO = 'payroll-users@example.invalid';

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

test('the account list flags an account that never saved its submission settings', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  const project = testInfo.project.name;
  const never = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Never Configured' });
  const saved = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Configured' });
  const api = await new SeedClient(builtServer.origin).signIn(saved.email, saved.password);
  await api.call('POST', '/api/settings/submission', { expected_seq: 0, to: [TO], cc: [], auto_submit: false }, 201);

  await signInPageAs(builtServer.credentials.admin, '#/admin');
  await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();

  const neverRow = page.locator(`[data-user-email="${never.email}"]`);
  const savedRow = page.locator(`[data-user-email="${saved.email}"]`);
  await expect(neverRow).toHaveCount(1);
  await expect(savedRow).toHaveCount(1);

  // The flag only on the account without saved settings, and its meaning in plain words.
  await expect(neverRow.locator('[data-flag="not-set-up"]')).toHaveText('Not set up');
  await expect(neverRow.locator('[data-flag-detail="not-set-up"]')).toContainText('has not saved submission settings yet');
  await expect(savedRow.locator('[data-flag="not-set-up"]')).toHaveCount(0);
  await expect(savedRow.locator('[data-flag-detail="not-set-up"]')).toHaveCount(0);

  // The flag shows no setting value: not the saved recipient address, on any row.
  expect(await page.locator('main').innerText()).not.toContain(TO);

  // The API carries a boolean only, with the account fields.
  const listed = await adminSeed.call<{ users: Array<{ id: string; not_set_up: unknown }> }>('GET', '/api/admin/users');
  expect(listed.users.find((user) => user.id === never.id)?.not_set_up).toBe(true);
  expect(listed.users.find((user) => user.id === saved.id)?.not_set_up).toBe(false);

  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await neverRow.scrollIntoViewIfNeeded();
  await page.screenshot({ path: screenshotPath(`admin-users-not-set-up-${project}-synthetic.png`) });
});
