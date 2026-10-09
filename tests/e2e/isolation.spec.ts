import { randomBytes } from 'node:crypto';
import { type Page } from '@playwright/test';
import {
  type CreatedAccount,
  createAccountByAdminApi,
  expect,
  SeedClient,
  screenshotPath,
  starterPolicyBody,
  statusInPage,
  test,
  type BuiltServer,
} from './fixtures.ts';

/*
 * Isolation through the real UI. Employee 1 (the seeded employee) owns a day with a private
 * synthetic note. A second employee, created over the admin API, and the admin each try to reach
 * it: by hash swap, by an API id swap made from the page with the page's own session, and through
 * every admin screen. The server answers 404 for a foreign id and 403 on admin routes for an
 * employee; hiding the Admin entry is only a convenience. Refusals are expected, so a 4xx
 * resource message is not a console failure.
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

interface Owner {
  workDate: string;
  sessionId: string;
  sessionVersion: number;
  note: string;
}

/** Employee 1 gets a complete day and a private note; the helper undoes it afterwards. */
/** On a phone Settings, Import, Admin and Sign out sit under "More" in the tab bar; opens it when shown and closed. */
async function openMoreOnPhone(page: Page) {
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
  if (!(await more.isVisible())) return;
  if ((await more.getAttribute('aria-expanded')) !== 'true') await more.click();
}

async function seedOwner(employee: SeedClient): Promise<Owner> {
  const [workDate] = await employee.pastFreeWorkdays();
  expect(workDate, 'a past free workday').toBeDefined();
  if (workDate === undefined) throw new Error('no free workday');
  await employee.seedCompleteDay(workDate);
  const note = `private-synthetic-${randomBytes(6).toString('hex')}`;
  await employee.putDay(workDate, { notes: note });
  const day = await employee.dayView(workDate);
  const session = day.sessions[0];
  if (session === undefined) throw new Error('the seeded session is missing');
  return { workDate, sessionId: session.id, sessionVersion: session.version, note };
}

async function releaseOwner(employee: SeedClient, owner: Owner): Promise<void> {
  await employee.clearSessions(owner.workDate);
  await employee.resetDay(owner.workDate);
}

async function secondEmployee(admin: SeedClient, server: BuiltServer): Promise<{ account: CreatedAccount; api: SeedClient }> {
  const account = await createAccountByAdminApi(admin, { displayName: 'Synthetic Neighbour' });
  const api = await new SeedClient(server.origin).signIn(account.email, account.password);
  const periods = await api.today();
  await api.call('POST', '/api/policies', starterPolicyBody(periods.currentPayrollDate), 201);
  return { account, api };
}

/** Every way the page can reach employee 1's session by id, as the session of someone else. */
async function expectForeignSessionRefused(page: Parameters<typeof statusInPage>[0], owner: Owner) {
  const path = `/api/sessions/${owner.sessionId}`;
  expect(await statusInPage(page, 'GET', path)).toBe(404);
  expect(
    await statusInPage(page, 'PUT', path, {
      start: { local: `${owner.workDate}T10:00`, zone: 'America/Los_Angeles' },
      end: { local: `${owner.workDate}T11:00`, zone: 'America/Los_Angeles' },
      input_zone: 'America/Los_Angeles',
      breaks: [],
      breaks_confirmed: true,
      expected_version: owner.sessionVersion,
    }),
  ).toBe(404);
  expect(await statusInPage(page, 'DELETE', path, { expected_version: owner.sessionVersion, reason: 'synthetic probe' })).toBe(404);
}

test('a second employee cannot reach employee 1 by hash swap or by id swap', async (
  { page, builtServer, adminSeed, employeeSeed, signInPageAs },
  testInfo,
) => {
  const owner = await seedOwner(employeeSeed);
  try {
    const { account, api } = await secondEmployee(adminSeed, builtServer);
    await signInPageAs(account);
    await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();

    // Employee 1's date is in the displayed period for employee 2 too, with nothing recorded.
    const row = page.locator(`[data-day="${owner.workDate}"]`);
    await expect(row).toBeVisible();
    await expect(row).not.toContainText('Complete');
    await expect(row.locator('[data-check="complete"]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(owner.note);

    // Hash swap: no route takes an id, and the admin route falls back to the employee's own timesheet.
    for (const hash of ['#/admin', '#/admin/users', `#/timesheet/${owner.sessionId}`, `#/sessions/${owner.sessionId}`]) {
      await page.evaluate(`window.location.hash = ${JSON.stringify(hash)}`);
      await expect(page).toHaveURL(/#\/timesheet$/);
      await expect(page.locator('main')).not.toContainText(owner.note);
    }
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Admin' })).toHaveCount(0);

    // API id swap from the page, with the page's own session.
    await expectForeignSessionRefused(page, owner);
    const day = await statusInPage(page, 'GET', `/api/days/${owner.workDate}`);
    expect(day).toBe(200);
    const own = await api.dayView(owner.workDate);
    expect(own.sessions, 'the day route answers about the caller, not the owner').toHaveLength(0);
    expect(own.notes ?? own.entry?.notes ?? '').not.toBe(owner.note);

    // Admin routes answer 403 to an employee, for reads and writes, known paths and unknown ones.
    expect(await statusInPage(page, 'GET', '/api/admin/users')).toBe(403);
    expect(await statusInPage(page, 'POST', '/api/admin/users', {})).toBe(403);
    expect(await statusInPage(page, 'POST', '/api/admin/calendar/import/preview', {})).toBe(403);
    expect(await statusInPage(page, 'POST', '/api/admin/payroll-exceptions', {})).toBe(403);
    expect(await statusInPage(page, 'GET', '/api/admin/timesheets')).toBe(403);
    await page.screenshot({ path: screenshotPath(`isolation-employee2-${testInfo.project.name}-synthetic.png`), fullPage: true });

    // Employee 1's data are untouched by every attempt above.
    const intact = await employeeSeed.dayView(owner.workDate);
    expect(intact.sessions).toHaveLength(1);
    expect(intact.sessions[0]?.version).toBe(owner.sessionVersion);
    expect(intact.entry?.notes).toBe(owner.note);
  } finally {
    await releaseOwner(employeeSeed, owner);
  }
});

test('an admin cannot open employee data through any admin screen', async (
  { page, builtServer, adminSeed, employeeSeed, signInPageAs },
  testInfo,
) => {
  const owner = await seedOwner(employeeSeed);
  try {
    await signInPageAs(builtServer.credentials.admin);
    await openMoreOnPhone(page);
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Administration', level: 1 })).toBeVisible();
    await expect(page.locator('li.user-row').first()).toBeVisible();

    // The Admin screen holds account and configuration data only.
    const main = page.locator('main');
    await expect(main).not.toContainText(owner.note);
    await expect(main).not.toContainText(owner.sessionId);
    for (const forbidden of ['Clock in', 'Daily evidence', 'Reserve OT leave']) {
      await expect(main.getByText(forbidden)).toHaveCount(0);
    }
    await page.screenshot({ path: screenshotPath(`isolation-admin-${testInfo.project.name}-synthetic.png`), fullPage: true });

    // The account list carries account fields only.
    const users = await adminSeed.call<{ users: Array<Record<string, unknown>> }>('GET', '/api/admin/users');
    const fields = new Set(users.users.flatMap((user) => Object.keys(user)));
    expect([...fields].sort()).toEqual(['calendar_id', 'created_at', 'display_name', 'email', 'id', 'not_set_up', 'role', 'status', 'updated_at']);
    expect(JSON.stringify(users)).not.toContain(owner.note);

    // No admin route returns another person's records, and admin is no blanket access to a foreign id.
    for (const path of [
      `/api/admin/timesheets/${owner.workDate}`,
      `/api/admin/users/${users.users[0]?.id}/timesheets`,
      '/api/admin/ot/ledger',
      '/api/admin/history',
      '/api/admin/exports',
    ]) {
      expect(await statusInPage(page, 'GET', path), path).toBe(404);
    }
    await expectForeignSessionRefused(page, owner);

    // The admin's own timesheet shows nothing of employee 1.
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Timesheet' }).click();
    await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
    await expect(page.locator('main')).not.toContainText(owner.note);
    await expect(page.locator(`[data-day="${owner.workDate}"]`)).not.toContainText('Complete');
    await expect(page.locator(`[data-day="${owner.workDate}"] [data-check="complete"]`)).toHaveCount(0);

    const intact = await employeeSeed.dayView(owner.workDate);
    expect(intact.sessions).toHaveLength(1);
    expect(intact.entry?.notes).toBe(owner.note);
  } finally {
    await releaseOwner(employeeSeed, owner);
  }
});

test('an employee sees no Admin entry and the server refuses the admin routes', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  const nav = page.getByRole('navigation', { name: 'Main' });
  await openMoreOnPhone(page);
  await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Admin' })).toHaveCount(0);
  await page.evaluate("window.location.hash = '#/admin'");
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('heading', { name: 'Administration' })).toHaveCount(0);
  expect(await statusInPage(page, 'GET', '/api/admin/users')).toBe(403);
  expect(await statusInPage(page, 'PATCH', '/api/admin/users/anything', { display_name: 'Synthetic Takeover' })).toBe(403);
  expect(await statusInPage(page, 'POST', '/api/admin/users/anything/deactivate', {})).toBe(403);
});
