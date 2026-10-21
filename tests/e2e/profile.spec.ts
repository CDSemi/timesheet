import type { Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { createAccountByAdminApi, expect, openAccount, SeedClient, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX4-T04, owner decision D-9 b: the "Change password" card on the Profile page. The browser checks the
 * confirmation and the length before sending; the server answers a wrong current password with 403 (the page stays
 * signed in); a success keeps this session and signs out the account's other sessions. Accounts and passwords are
 * synthetic and generated at run time (example.invalid). Only one wrong attempt is made, so the shared sign-in limiter
 * of the worker server is not approached.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const card = (page: Page) => page.getByRole('region', { name: 'Change password' });
const field = (page: Page, label: string) => card(page).getByLabel(label, { exact: true });

async function fill(page: Page, current: string, next: string, confirm: string) {
  await field(page, 'Current password').fill(current);
  await field(page, 'New password').fill(next);
  await field(page, 'Confirm new password').fill(confirm);
  await card(page).getByRole('button', { name: 'Change password' }).click();
}

test('Change password: browser checks, a wrong current password, then success that keeps this session only', async ({ page, builtServer, adminSeed, signInPageAs }, testInfo) => {
  const person = await createAccountByAdminApi(adminSeed, { displayName: 'Synthetic Password Person' });
  const otherDevice = await new SeedClient(builtServer.origin).signIn(person.email, person.password);
  const sent: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/auth/password') sent.push(request.method());
  });

  await signInPageAs(person, '#/settings/profile');
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();
  await expect(card(page).getByRole('heading', { name: 'Change password' })).toBeVisible();
  await expect(field(page, 'Current password')).toHaveAttribute('autocomplete', 'current-password');
  await expect(field(page, 'New password')).toHaveAttribute('autocomplete', 'new-password');
  await expect(field(page, 'Confirm new password')).toHaveAttribute('autocomplete', 'new-password');
  for (const label of ['Current password', 'New password', 'Confirm new password']) await expect(field(page, label)).toHaveAttribute('type', 'password');

  const next = `Synthetic-${randomBytes(9).toString('base64url')}`;
  const error = card(page).locator('[data-error="password"]');

  // The browser checks the confirmation and the length; nothing is sent.
  await fill(page, person.password, next, `${next}x`);
  await expect(error).toHaveText('The new password and its confirmation differ. Type them again.');
  await expect(error).toHaveAttribute('role', 'alert');
  await fill(page, person.password, 'short-11ch', 'short-11ch');
  await expect(error).toHaveText('The new password must have 12 to 256 characters.');
  expect(sent).toEqual([]);

  // A wrong current password is the server's 403: the page stays signed in and says so.
  await fill(page, `wrong-${person.password}`, next, next);
  await expect(error).toHaveText('The current password is not correct. Nothing was changed.');
  expect(sent).toEqual(['POST']);
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();

  // Success: a notice, the fields cleared, this session kept, the other one signed out.
  await fill(page, person.password, next, next);
  const notice = card(page).locator('[data-password-notice]');
  await expect(notice).toHaveText('Password changed. You stay signed in here; your other sign-ins were signed out.');
  await expect(notice).toBeFocused();
  await expect(error).toHaveCount(0);
  for (const label of ['Current password', 'New password', 'Confirm new password']) await expect(field(page, label)).toHaveValue('');
  expect(sent).toEqual(['POST', 'POST']);
  await page.screenshot({ path: screenshotPath(`profile-password-${testInfo.project.name}-synthetic.png`), fullPage: true });
  await otherDevice.call('GET', '/api/auth/me', undefined, 401);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();

  // The new password signs in; the old one does not.
  await (await openAccount(page)).getByRole('button', { name: 'Sign out' }).click();
  await signInPageAs({ email: person.email, password: person.password }, '#/settings/profile');
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect');
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toHaveCount(0);
  await signInPageAs({ email: person.email, password: next }, '#/settings/profile');
  await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();
});
