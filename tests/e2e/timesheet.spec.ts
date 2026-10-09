import type { Page } from '@playwright/test';
import { formatHoursMinutes } from '../../src/domain/format.ts';
import { expect, screenshotPath, test } from './fixtures.ts';

/*
 * The Excel-style sheet (two week bands on desktop, a table per week on a phone) and batch
 * category edit, on both projects.
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

/** HH:MM of a UTC instant in a zone, computed by the test runtime (an oracle independent of the app). */
function clockText(instant: string, zone: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(instant));
}

/** Picks the days to select, failing clearly when the period has too few past workdays. */
function need(days: string[], count: number): string[] {
  expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(count);
  return days;
}

test.describe('viewing zone equals the reporting zone', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

  test('the period bar still names the viewing zone, without the longer zone note', async ({ page, employeeSeed, signInThroughUi }) => {
    await page.goto('/');
    const displayZone = await page.evaluate<string>('Intl.DateTimeFormat().resolvedOptions().timeZone');
    const { reportingZone } = await employeeSeed.today();
    expect(displayZone).toBe(reportingZone);
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await expect(page.locator('.period-bar [data-period-zone]')).toHaveText(`Times in ${displayZone}`);
    await expect(page.locator('[data-zone-note]')).toHaveCount(0);
    // Each day is still named by its saved accounting date.
    const first = page.locator('[data-day]').first();
    await expect(first).toHaveAccessibleName(/\d{4}-\d{2}-\d{2}$/);
    // The bar fits the viewport: no horizontal scroll.
    expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth')).toBe(true);
  });
});

/**
 * WP5-UX-B-01: on a phone the first day row must be fully visible on the first screen, above the
 * bottom tab bar (the approved mockup A2: period card, clock card, then the sheet). Checked with
 * the viewing zone equal to the reporting zone and with the longer zone note shown.
 */
async function expectFirstDayAboveTabBar(page: Page) {
  const first = page.locator('[data-day]').first();
  await expect(first).toBeVisible();
  const tabs = await page.locator('.shell-tabs').boundingBox();
  const row = await first.boundingBox();
  const viewport = page.viewportSize();
  expect(tabs, 'tab bar box').not.toBeNull();
  expect(row, 'first day row box').not.toBeNull();
  expect(viewport, 'viewport').not.toBeNull();
  expect((row?.y ?? 0) + (row?.height ?? 0), 'bottom of the first day row is at or above the tab bar').toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
  expect(tabs?.y ?? 0, 'the tab bar sits on the bottom edge').toBeGreaterThan((viewport?.height ?? 0) / 2);
  // Nothing was scrolled to get here.
  expect(await page.evaluate('window.scrollY')).toBe(0);
}

test('the period card keeps its tab order equal to its visual reading order: Previous, Next, then Review', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const bar = page.locator('.period-bar');
  const previous = bar.getByRole('button', { name: 'Previous period' });
  const next = bar.getByRole('button', { name: 'Next period' });
  const review = bar.locator('[data-review-link]');
  await previous.focus();
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(review).toBeFocused();
  // Visual order: top to bottom, then left to right (no overlap of rows is assumed within 4px).
  const boxes = [await previous.boundingBox(), await next.boundingBox(), await review.boundingBox()];
  for (const box of boxes) expect(box, 'control box').not.toBeNull();
  const [a, b, c] = boxes;
  const before = (first: typeof a, second: typeof a) =>
    (first?.y ?? 0) + 4 < (second?.y ?? 0) || (Math.abs((first?.y ?? 0) - (second?.y ?? 0)) <= 4 && (first?.x ?? 0) < (second?.x ?? 0));
  expect(before(a, b), 'Previous comes before Next visually').toBe(true);
  expect(before(b, c), 'Next comes before Review visually').toBe(true);
});

test.describe('phone first screen', () => {
  test.skip(({ isMobile }) => !isMobile, 'The first-screen budget is the 390x844 phone');

  test.describe('viewing zone equals the reporting zone', () => {
    test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

    test('the first day row is fully visible above the tab bar', async ({ page, signInThroughUi }) => {
      await signInThroughUi();
      await expect(page.locator('[data-day]')).toHaveCount(14);
      await expect(page.locator('[data-zone-note]')).toHaveCount(0);
      await expectFirstDayAboveTabBar(page);
    });
  });

  test('the first day row is fully visible above the tab bar with the zone note shown', async ({ page, signInThroughUi }) => {
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await expect(page.locator('[data-zone-note]')).toBeVisible();
    await expectFirstDayAboveTabBar(page);
  });
});

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
  const sheet = await employeeSeed.call<{
    period: { due_local_date: string; period_start: string };
    totals: { provisional_credited_minutes: number; pending_days: number };
  }>('GET', `/api/timesheets/${currentPayrollDate}`);
  const complete = await employeeSeed.dayView(completeDay);
  const completeSession = complete.sessions[0];
  expect(completeSession?.end_utc, 'the seeded complete day has one ended session').toBeTruthy();

  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);

  // Exactly one of the two sheet layouts renders, chosen by the 768px media query.
  const isDesktop = project === 'desktop';
  await expect(page.locator('[data-sheet="desktop"]')).toHaveCount(isDesktop ? 1 : 0);
  await expect(page.locator('[data-sheet="phone"]')).toHaveCount(isDesktop ? 0 : 1);
  // The Excel form: company header, two Monday to Sunday bands of seven days, Overtime Total, signature lines.
  const form = page.getByRole('article', { name: 'Timesheet form' });
  await expect(form).toContainText('C&D Semiconductor Services, Inc.');
  const weeks = form.locator('section.sheet-week');
  await expect(weeks).toHaveCount(2);
  for (const index of [0, 1]) await expect(weeks.nth(index).locator('[data-day]')).toHaveCount(7);
  await expect(form.locator('[data-ot-total]')).toHaveText(formatHoursMinutes(sheet.totals.provisional_credited_minutes));
  await expect(form.getByRole('region', { name: 'Signatures' })).toContainText('Manager Signature');

  // Zones, due date in both zones, accounting dates, and the server-provided review status.
  await expect(page.getByText('Reporting zone', { exact: true })).toBeVisible();
  await expect(page.getByText('Display zone', { exact: true })).toBeVisible();
  await expect(page.locator('.facts')).toContainText(reportingZone);
  await expect(page.locator('.facts')).toContainText(displayZone);
  await expect(page.getByText(`Due, your time (${displayZone})`)).toBeVisible();
  // The zone note shows because the display zone differs from the reporting zone; the due date in words is the reporting-zone fields.
  await expect(page.locator('[data-zone-note]')).toBeVisible();
  // The period bar names the viewing zone compactly, and the reporting zone stays in the note.
  await expect(page.locator('.period-bar [data-period-zone]')).toHaveText(`Times in ${displayZone}`);
  await page.locator('.period-bar').screenshot({ path: screenshotPath(`zone-${project}-synthetic.png`), animations: 'disabled' });
  const dueIso = sheet.period.due_local_date;
  await expect(page.locator('[data-period-due]')).toContainText(`${dueIso.slice(5, 7)}/${dueIso.slice(8, 10)}/${dueIso.slice(0, 4)}`);
  await expect(page.locator('[data-period-due]')).toContainText(reportingZone);
  await expect(page.locator('.period-title')).toContainText('Draft');
  // One status group in the period bar; the sheet no longer repeats it.
  await expect(page.locator('[data-grid-status="line"]')).toHaveCount(1);
  await expect(page.locator('.period-bar [data-grid-status="line"]')).toHaveCount(1);
  await expect(page.locator('[data-sheet] [data-grid-status]')).toHaveCount(0);
  // Batch mode is off: no selection boxes and no batch bar until "Change several days".
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Batch category edit' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Change several days' })).toHaveAttribute('aria-pressed', 'false');
  // The top of the page: period bar, clock panel and toolbar (synthetic data).
  await page.screenshot({ path: screenshotPath(`period-${project}-clocked-out-synthetic.png`), animations: 'disabled' });
  await expect(page.locator('.period-title .badge.current')).toBeVisible();
  // Each day is named by its accounting date (the ISO date); its date cell prints the US form date.
  const start = sheet.period.period_start;
  await expect(dayRow(page, start)).toHaveAccessibleName(new RegExp(`${start}$`));
  await expect(dayRow(page, start)).toContainText(`${start.slice(5, 7)}/${start.slice(8, 10)}`);
  await expect(dayRow(page, start).getByRole('button', { name: `Edit ${start}`, exact: true })).toBeVisible();
  await expect(page.getByText('accounting dates', { exact: false }).first()).toBeVisible();

  // Session times are in the display zone (Asia/Ho_Chi_Minh), not in the reporting zone of the seed (09:00-18:00 LA).
  const range = `${clockText(completeSession?.start_utc ?? '', displayZone)}-${clockText(completeSession?.end_utc ?? '', displayZone)}`;
  await expect(dayRow(page, completeDay)).toContainText(range);
  await expect(dayRow(page, completeDay)).not.toContainText('09:00-18:00');

  // A complete day shows Complete, its server OT as h:mm and, under Show details, 8:00 worked on a workday;
  // unconfirmed breaks show Confirm breaks and pending OT.
  await expect(dayRow(page, completeDay)).toContainText('Complete');
  await expect(dayRow(page, completeDay).locator('[data-ot]')).toHaveText(formatHoursMinutes(complete.calculation?.credited_minutes ?? -1));
  await expect(dayRow(page, completeDay).locator('[data-cell="ot"]')).not.toContainText('pending');
  await expect(dayRow(page, pendingDay)).toContainText('Confirm breaks');
  await expect(dayRow(page, pendingDay).locator('[data-cell="ot"] [data-ot="pending"]')).toHaveText('pending');
  const details = page.getByRole('button', { name: 'Show details' });
  await expect(details).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-detail]')).toHaveCount(0);
  await details.click();
  await expect(details).toHaveAttribute('aria-pressed', 'true');
  const regular = page.locator(`[data-detail="regular"][data-detail-day="${completeDay}"]`);
  await expect(regular).toHaveText(formatHoursMinutes(complete.calculation?.regular_minutes ?? -1));
  await expect(regular).toHaveText('8:00');
  await expect(page.locator('[data-detail="regular"]')).toHaveCount(14);
  // Status is text plus a shape, never colour alone.
  await expect(dayRow(page, pendingDay).locator('.status .shape').first()).toBeAttached();
  // No em dash or en dash placeholder anywhere on the screen, and no "none" placeholder on the sheet.
  expect(await page.locator('main').innerText()).not.toMatch(/[–—]/);
  expect(await form.innerText()).not.toMatch(/\bnone\b/i);

  if (!isDesktop) {
    const widths = await page.evaluate<{ scroll: number; inner: number }>(
      '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
    );
    expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
    // Only rendered controls are tap targets: the desktop bar is not displayed below 768px.
    const targets = page
      .locator('button, a[href], select, input:not([type="checkbox"]), label.pick, label.inline')
      .filter({ visible: true });
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
  // The sheet in both themes (synthetic data), for the visual record.
  // `animations: 'disabled'` finishes the colour transitions of the theme switch before the capture.
  await page.screenshot({ path: screenshotPath(`sheet-${project}-light-synthetic.png`), fullPage: true, animations: 'disabled' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: screenshotPath(`sheet-${project}-dark-synthetic.png`), fullPage: true, animations: 'disabled' });
});

test('batch edit: preview, conflict dialog for a clock session, confirmed commit', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  // Other specs of the same worker may have left clock sessions today; start this test from none.
  await employeeSeed.clearSessions((await employeeSeed.today()).todayLocal);
  const { workDate, sessionId } = await employeeSeed.seedClockSessionToday();
  const before = await employeeSeed.dayView(workDate);
  expect(before.sessions.map((session) => session.source)).toEqual(['clock']);

  await signInThroughUi();
  // Today can sit in the next period when the current one is the earlier, still unpaid one.
  await expect(page.locator('[data-day]')).toHaveCount(14);
  if ((await dayRow(page, workDate).count()) === 0) await page.getByRole('button', { name: 'Next period' }).click();
  await expect(dayRow(page, workDate)).toBeVisible();

  await page.getByRole('button', { name: 'Change several days' }).click();
  await page.getByLabel(`Select ${workDate}`).check();
  await expect(page.getByText('1 day selected')).toBeVisible();
  await page.evaluate('window.scrollTo(0, 0)');
  await page.screenshot({ path: screenshotPath(`batch-mode-${testInfo.project.name}-synthetic.png`), animations: 'disabled' });
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
  await page.getByRole('button', { name: 'Change several days' }).click();
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
  await page.getByRole('button', { name: 'Change several days' }).click();
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
