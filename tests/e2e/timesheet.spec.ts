import type { Page } from '@playwright/test';
import { expect, screenshotPath, test } from './fixtures.ts';

/*
 * Two-week grid (desktop), day list (mobile) and batch category edit, on both projects.
 * The browser zone differs from the reporting zone on purpose, so both zones are visible.
 * Data are synthetic and relative to today; every assertion derives its dates from the API.
 */
test.use({ locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh' });

test.beforeEach(({ page }) => {
  // A CSP violation shows up as a console error. The signed-out probe answers 401 by design and
  // the stale-version test makes the server answer 409 on purpose; nothing else is expected.
  page.on('console', (message) => {
    const expected = /status of (401|409)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

function dayRow(page: Page, workDate: string) {
  return page.locator(`[data-day="${workDate}"]`);
}

/** Picks the days to select, failing clearly when the period has too few past workdays. */
function need(days: string[], count: number): string[] {
  expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(count);
  return days;
}

test('shows 14 days with due date, completeness, pending OT, both zones and accounting dates', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  await page.goto('/');
  // The browser reports its own name for the emulated zone (Asia/Saigon for Asia/Ho_Chi_Minh).
  const displayZone = await page.evaluate<string>('Intl.DateTimeFormat().resolvedOptions().timeZone');
  const free = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  const [completeDay, pendingDay] = [free[0] ?? '', free[1] ?? ''];
  await employeeSeed.seedCompleteDay(completeDay);
  await employeeSeed.seedUnconfirmedBreaksDay(pendingDay);
  const { reportingZone, currentPayrollDate } = await employeeSeed.today();
  const sheet = await employeeSeed.call<{ period: { due_local_date: string; period_start: string } }>(
    'GET',
    `/api/timesheets/${currentPayrollDate}`,
  );

  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);

  // Exactly one of the grid and the list renders, chosen by the 768px media query.
  const isDesktop = project === 'desktop';
  await expect(page.locator('table.grid')).toHaveCount(isDesktop ? 1 : 0);
  await expect(page.locator('.day-list')).toHaveCount(isDesktop ? 0 : 1);

  // Zones, due date in both zones, accounting dates, and the server-provided review status.
  await expect(page.getByText('Reporting zone', { exact: true })).toBeVisible();
  await expect(page.getByText('Display zone', { exact: true })).toBeVisible();
  await expect(page.locator('.facts')).toContainText(reportingZone);
  await expect(page.locator('.facts')).toContainText(displayZone);
  await expect(page.getByText(`Due, your time (${displayZone})`)).toBeVisible();
  await expect(page.locator('.facts')).toContainText(sheet.period.due_local_date);
  await expect(page.locator('.period-title')).toContainText('Draft');
  await expect(page.locator('.period-title .badge.current')).toBeVisible();
  await expect(dayRow(page, sheet.period.period_start)).toContainText(sheet.period.period_start);
  await expect(page.getByText('accounting dates', { exact: false }).first()).toBeVisible();

  // A complete day shows complete and 8h 00m; unconfirmed breaks show pending OT.
  await expect(dayRow(page, completeDay)).toContainText('complete');
  await expect(dayRow(page, completeDay)).toContainText('8h 00m');
  await expect(dayRow(page, completeDay)).not.toContainText('pending OT');
  await expect(dayRow(page, pendingDay)).toContainText('confirm breaks');
  await expect(dayRow(page, pendingDay)).toContainText('pending OT');
  // Status is text plus a shape, never colour alone.
  await expect(dayRow(page, pendingDay).locator('.status .shape').first()).toBeAttached();
  // No em dash or en dash placeholder anywhere on the screen.
  expect(await page.locator('main').innerText()).not.toMatch(/[–—]/);

  if (!isDesktop) {
    const widths = await page.evaluate<{ scroll: number; inner: number }>(
      '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
    );
    expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
    const targets = page.locator('button, a[href], select, input:not([type="checkbox"]), label.pick, label.inline');
    const count = await targets.count();
    expect(count).toBeGreaterThan(20);
    for (let index = 0; index < count; index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box, `target ${index}`).not.toBeNull();
      expect(box?.height ?? 0, `target ${index} height`).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0, `target ${index} width`).toBeGreaterThanOrEqual(44);
    }
  }

  await page.screenshot({ path: screenshotPath(`timesheet-view-${project}-synthetic.png`), fullPage: true });
});

test('batch edit: preview, conflict dialog for a clock session, confirmed commit', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const { workDate, sessionId } = await employeeSeed.seedClockSessionToday();
  const before = await employeeSeed.dayView(workDate);
  expect(before.sessions.map((session) => session.source)).toEqual(['clock']);

  await signInThroughUi();
  // Today can sit in the next period when the current one is the earlier, still unpaid one.
  await expect(page.locator('[data-day]')).toHaveCount(14);
  if ((await dayRow(page, workDate).count()) === 0) await page.getByRole('button', { name: 'Next period' }).click();
  await expect(dayRow(page, workDate)).toBeVisible();

  await page.getByLabel(`Select ${workDate}`).check();
  await expect(page.getByText('1 day selected')).toBeVisible();
  await page.getByLabel('Category for selected days').selectOption('Vacation');
  await page.getByRole('button', { name: 'Preview changes' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Review category change' })).toBeVisible();
  await expect(dialog.locator(`[data-preview-date="${workDate}"]`)).toContainText('to Vacation');
  // Nothing is saved by a preview.
  expect((await employeeSeed.dayView(workDate)).category).toBe(before.category);

  await dialog.getByRole('button', { name: 'Review conflicts' }).click();
  await expect(dialog.getByRole('heading', { name: 'Recorded work conflicts with the new label' })).toBeVisible();
  await expect(dialog.locator(`[data-conflict-date="${workDate}"]`)).toContainText('clock session');
  const commit = dialog.getByRole('button', { name: 'Confirm and commit' });
  await expect(commit).toBeDisabled();
  await page.screenshot({ path: screenshotPath(`batch-conflict-${testInfo.project.name}-synthetic.png`) });
  await dialog.getByLabel('I confirm the label change for these dates').check();
  await commit.click();

  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  await expect(dialog).toHaveCount(0);
  const after = await employeeSeed.dayView(workDate);
  expect(after.category).toBe('Vacation');
  expect(after.sessions).toEqual(before.sessions);
  expect(after.sessions[0]?.id).toBe(sessionId);
});

test('batch edit: an old period asks for a reason and commits with it', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  await signInThroughUi();
  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(page.locator('.period-title .badge.old')).toBeVisible();
  await expect(page.getByText('Edits to this period require a reason.')).toBeVisible();

  const target = page.locator('[data-day]').nth(2);
  const workDate = (await target.getAttribute('data-day')) ?? '';
  expect(workDate).not.toBe('');
  await page.getByLabel(`Select ${workDate}`).check();
  await page.getByLabel('Category for selected days').selectOption('Sick');
  await page.getByRole('button', { name: 'Preview changes' }).click();

  const dialog = page.getByRole('dialog');
  const reason = dialog.getByLabel(/Reason for editing an old or finalized period/);
  await expect(reason).toBeVisible();
  const commit = dialog.getByRole('button', { name: 'Commit changes' });
  await expect(commit).toBeDisabled();
  await page.screenshot({ path: screenshotPath(`batch-reason-${testInfo.project.name}-synthetic.png`) });
  await reason.fill('Corrected after payroll review (synthetic test)');
  await expect(commit).toBeEnabled();
  await commit.click();

  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  expect((await employeeSeed.dayView(workDate)).category).toBe('Sick');
  await expect(dayRow(page, workDate)).toContainText('Sick');
});

test('batch edit: a stale version shows the reload message naming the date', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const free = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const workDate = free.at(-1) ?? '';
  await signInThroughUi();
  await page.getByLabel(`Select ${workDate}`).check();
  await page.getByLabel('Category for selected days').selectOption('Sick');
  await page.getByRole('button', { name: 'Preview changes' }).click();

  const dialog = page.getByRole('dialog');
  const commit = dialog.getByRole('button', { name: 'Commit changes' });
  await expect(commit).toBeEnabled();

  // Another session changes the same day between preview and commit.
  await employeeSeed.commitCategory(workDate, 'Vacation', null);
  await commit.click();

  const alert = page.getByRole('alert').filter({ hasText: 'changed since this period was loaded' });
  await expect(alert).toContainText(workDate);
  await expect(alert).toContainText('Nothing was saved');
  await expect(dialog).toHaveCount(0);
  expect((await employeeSeed.dayView(workDate)).category).toBe('Vacation');

  await alert.getByRole('button', { name: 'Reload period' }).click();
  await expect(alert).toHaveCount(0);
  await expect(dayRow(page, workDate)).toContainText('Vacation');
});
