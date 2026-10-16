import type { Locator, Page } from '@playwright/test';
import { formatHoursMinutes } from '../../src/domain/format.ts';
import {
  backdropOf,
  backdropsAbove,
  computedStyle,
  contrast,
  over,
  paintedPixel,
  parseColour,
  parseLayers,
  readPseudo,
  type Rgba,
  sameColour,
  settledPseudo,
  settledStyle,
  tokenColour,
} from './contrast.ts';
import { ANY_DAY_BUTTON_NAME, dayButtonName, namedDayButton } from './dayButton.ts';
import { expect, screenshotPath, type SeedClient, test } from './fixtures.ts';

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

/**
 * WP5-UX-AB8-02: days a test seeded on the worker-shared employee. They are released after the test, pass or fail, so
 * a short displayed period (3 past workdays on 2026-11-28..30) keeps its free workdays for the specs that follow.
 */
const seededDays: string[] = [];

test.afterEach(async ({ employeeSeed }) => {
  for (const workDate of seededDays.splice(0)) await employeeSeed.clearSessions(workDate);
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
 * bottom tab bar (the approved mockup A2: period card, then the sheet; since WP5-UX2-T09 the check in/out control is in the top bar, not in the page). Checked with
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
  console.log(`BUDGET landing zoneNote=${(await page.locator('[data-zone-note]').count()) > 0} firstRowBottom=${(row?.y ?? 0) + (row?.height ?? 0)} tabBarTop=${tabs?.y}`);
  expect((row?.y ?? 0) + (row?.height ?? 0), 'bottom of the first day row is at or above the tab bar').toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
  expect(tabs?.y ?? 0, 'the tab bar sits on the bottom edge').toBeGreaterThan((viewport?.height ?? 0) / 2);
  // Nothing was scrolled to get here.
  expect(await page.evaluate('window.scrollY')).toBe(0);
}

test('the period card keeps its tab order equal to its visual reading order: Previous, Next, Today, then Review', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const bar = page.locator('.period-bar');
  const previous = bar.getByRole('button', { name: 'Previous period' });
  const next = bar.getByRole('button', { name: 'Next period' });
  // WP5-UX2-T04: Today sits between Next and Review on every layout (Current period, when shown, follows it).
  const today = bar.getByRole('button', { name: 'Today', exact: true });
  const review = bar.locator('[data-review-link]');
  await expect(bar.getByRole('button', { name: 'Current period', exact: true }), 'Current period is not shown on the opening period').toHaveCount(0);
  await previous.focus();
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(today).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(review).toBeFocused();
  // Visual order: top to bottom, then left to right (no overlap of rows is assumed within 4px).
  const boxes = [await previous.boundingBox(), await next.boundingBox(), await today.boundingBox(), await review.boundingBox()];
  for (const box of boxes) expect(box, 'control box').not.toBeNull();
  const [a, b, c, d] = boxes;
  const before = (first: typeof a, second: typeof a) =>
    (first?.y ?? 0) + 4 < (second?.y ?? 0) || (Math.abs((first?.y ?? 0) - (second?.y ?? 0)) <= 4 && (first?.x ?? 0) < (second?.x ?? 0));
  expect(before(a, b), 'Previous comes before Next visually').toBe(true);
  expect(before(b, c), 'Next comes before Today visually').toBe(true);
  expect(before(c, d), 'Today comes before Review visually').toBe(true);
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

  /*
   * WP5-UX-B2-01: the "Open a day" date field keeps at least a full date wide (--date-field-min)
   * on narrow phones; the row wraps instead of squeezing the value ("10/09/202", "10/0").
   * WP5-UX-B3 O-5 and R-7: the width a full date needs is measured, not assumed. A date input's
   * scrollWidth never exceeds its clientWidth in Chromium, so the clipping is checked against the
   * text width of the shown value (and of the empty field's "mm/dd/yyyy") in the field's own font,
   * plus its padding and borders, plus DATE_FIELD_CHROME: the date input's inner field padding and
   * calendar icon, measured in Edge (15px font) as the narrowest field that shows the text whole
   * (10/09/2026: clipped at 117px, whole at 118px; mm/dd/yyyy: clipped at 125px, whole at 126px).
   */
  const DATE_FIELD_CHROME = 23.5;
  for (const width of [390, 375, 360, 320]) {
    test(`the Open a day date field shows a full date at ${width}px`, async ({ page, signInThroughUi }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await signInThroughUi();
      await expect(page.locator('[data-day]')).toHaveCount(14);
      const field = page.getByLabel('Open a day');
      // The width a text needs inside this field: its glyphs in the field's font, padding, borders and the date chrome.
      const needed = (text: string) =>
        page.evaluate<number>(`(() => {
          const input = document.querySelector('.tools .open-day input');
          const style = getComputedStyle(input);
          const probe = document.createElement('span');
          Object.assign(probe.style, {
            position: 'absolute',
            whiteSpace: 'pre',
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontVariantNumeric: style.fontVariantNumeric,
            letterSpacing: style.letterSpacing,
          });
          probe.textContent = ${JSON.stringify(text)};
          document.body.append(probe);
          const glyphs = probe.getBoundingClientRect().width;
          probe.remove();
          const frame = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'];
          return glyphs + frame.reduce((sum, side) => sum + parseFloat(style[side]), 0) + ${DATE_FIELD_CHROME};
        })()`);
      const shownValue = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(2026, 9, 9));
      expect(shownValue).toBe('10/09/2026');
      const placeholderNeed = await needed('mm/dd/yyyy');
      const valueNeed = await needed(shownValue);
      expect(valueNeed, 'the measured need of a full date').toBeGreaterThan(100);
      const empty = await field.boundingBox();
      expect(empty, 'empty date field box').not.toBeNull();
      expect(empty?.width ?? 0, 'the empty field shows "mm/dd/yyyy" whole').toBeGreaterThanOrEqual(placeholderNeed);
      await field.fill('2026-10-09');
      await expect(field).toHaveValue('2026-10-09');
      const box = await field.boundingBox();
      expect(box, 'date field box').not.toBeNull();
      const minimum = await page.evaluate<number>(
        "(() => { const probe = document.createElement('div'); probe.style.width = 'var(--date-field-min)'; document.body.append(probe); const px = probe.getBoundingClientRect().width; probe.remove(); return px; })()",
      );
      expect(minimum, 'the --date-field-min token covers the measured need of the empty field and of a full date').toBeGreaterThanOrEqual(Math.max(placeholderNeed, valueNeed));
      expect(box?.width ?? 0, 'the date field is at least a full date wide').toBeGreaterThanOrEqual(minimum - 0.5);
      expect(box?.width ?? 0, 'the date value is not clipped (its measured need)').toBeGreaterThanOrEqual(valueNeed);
      expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'no horizontal scroll').toBe(true);
      const tools = await page.locator('.tools .open-day').boundingBox();
      await page.locator('.tools .open-day').screenshot({ path: screenshotPath(`fix4-open-day-w${width}-synthetic.png`) });
      testInfo.annotations.push({ type: 'open-day-field', description: `width ${width}: field ${box?.width}px, row bottom ${(tools?.y ?? 0) + (tools?.height ?? 0)}` });
    });
  }
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
  seededDays.push(completeDay, pendingDay);
  await employeeSeed.seedCompleteDay(completeDay);
  await employeeSeed.seedUnconfirmedBreaksDay(pendingDay);
  const { reportingZone, currentPayrollDate } = await employeeSeed.today();
  const sheet = await employeeSeed.call<{
    period: { due_local_date: string; period_start: string; due_at_utc: string };
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
  // The Excel form: title and fields, two Monday to Sunday bands of seven days, Overtime Total, signature lines.
  const form = page.getByRole('article', { name: 'Timesheet form' });
  // WP5-UX2-T06: the company name is in the top bar (visually hidden, once) and is not repeated on the sheet; the PDF keeps it.
  await expect(form).not.toContainText('C&D Semiconductor Services, Inc.');
  await expect(form.locator('.company')).toHaveCount(0);
  await expect(page.getByText('C&D Semiconductor Services, Inc.', { exact: true })).toHaveCount(1);
  const formHead = form.locator('header.form-head');
  await expect(formHead).toContainText('Time sheet for salaried exempt employees');
  for (const field of ['Employee:', 'Payroll Date:', 'Period:']) await expect(formHead.getByText(field, { exact: true })).toHaveCount(1);
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
  // WP5-UX-B4-02: the display-zone due time is in the US format of the bar ("Wed 10/14/2026, 07:00"), computed here by the test runtime.
  const dueParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: displayZone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(sheet.period.due_at_utc))
      .map((part) => [part.type, part.value]),
  );
  const dueInDisplayZone = `${dueParts.weekday} ${dueParts.month}/${dueParts.day}/${dueParts.year}, ${dueParts.hour}:${dueParts.minute}`;
  await expect(page.locator('[data-zone-note] dd').nth(2)).toHaveText(dueInDisplayZone);
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
  await expect(namedDayButton(page, start, 'Edit')).toBeVisible();
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
  const details = page.getByRole('switch', { name: 'Show details' });
  await expect(details).not.toBeChecked();
  await expect(page.locator('[data-detail]')).toHaveCount(0);
  await details.click();
  await expect(details).toBeChecked();
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

/* ---- WP5-UX2-T03: the day open in the Day editor is marked; the Today bar and the batch ring are painted ---------------------
 *
 * Every date comes from the server (`/api/periods/current`, the displayed period's sheet) and the displayed period, never from the
 * device clock. A branch that depends on whether today lies in the shown period asserts both facts: the applicable branch is
 * chosen from server values and the other asserts the opposite.
 */

interface ShownSheet {
  days: Array<{ work_date: string; classification: { day_class: 'normal' | 'nonworking' } | null }>;
}

/** The displayed period as the server reports it, with today's accounting date and its non-working days. */
async function shownPeriod(employeeSeed: SeedClient) {
  const { todayLocal, currentPayrollDate } = await employeeSeed.today();
  const sheet = await employeeSeed.call<ShownSheet>('GET', `/api/timesheets/${currentPayrollDate}`);
  const dates = sheet.days.map((day) => day.work_date);
  const nonworking = sheet.days.filter((day) => day.classification?.day_class === 'nonworking').map((day) => day.work_date);
  return { todayLocal, dates, todayShown: dates.includes(todayLocal), nonworking };
}

/** Makes today's column or row appear: asserts both facts of the branch (today in the shown period or not) and steps to the next period when needed. */
async function showToday(page: Page, employeeSeed: SeedClient): Promise<string> {
  const { todayLocal, todayShown } = await shownPeriod(employeeSeed);
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await expect(page.locator(`[data-day="${todayLocal}"]`)).toHaveCount(todayShown ? 1 : 0);
  await expect(page.locator('[data-sheet] .today-tag')).toHaveCount(todayShown ? 1 : 0);
  if (!todayShown) await page.getByRole('button', { name: 'Next period' }).click();
  await expect(page.locator(`[data-day="${todayLocal}"].today`)).toHaveCount(1);
  await expect(page.locator('[data-sheet] .today-tag')).toHaveCount(1);
  return todayLocal;
}

const dayButtonOf = (page: Page, workDate: string) => namedDayButton(page, workDate, 'Edit');
const markedDays = (page: Page) => page.locator('[data-sheet] [data-day][data-editing]');
const currentButtons = (page: Page) => page.locator('[data-sheet] [aria-current]');
const editorDialog = (page: Page) => page.getByRole('dialog', { name: /Day editor/ });

async function openDay(page: Page, workDate: string) {
  await dayButtonOf(page, workDate).click();
  await expect(editorDialog(page)).toBeVisible();
}

async function expectMarkedOnly(page: Page, workDate: string) {
  await expect(markedDays(page)).toHaveCount(1);
  await expect(markedDays(page)).toHaveAttribute('data-day', workDate);
  await expect(markedDays(page)).toHaveAttribute('data-editing', 'true');
  await expect(currentButtons(page)).toHaveCount(1);
  await expect(dayButtonOf(page, workDate)).toHaveAttribute('aria-current', 'true');
}

async function expectNoMarker(page: Page) {
  await expect(markedDays(page)).toHaveCount(0);
  await expect(page.locator('[data-sheet] [data-editing]')).toHaveCount(0);
  await expect(currentButtons(page)).toHaveCount(0);
  await expect(page.locator('[data-sheet] .editing, [data-sheet] .editing-detail')).toHaveCount(0);
}

interface Appearance {
  name: string;
  scheme: 'light' | 'dark';
  /** A manual choice (`data-theme` on <html>), or null while the page follows the device. */
  theme: 'light' | 'dark' | null;
}

/** Both themes, and the manual choice both ways over the opposite device setting. */
const APPEARANCES: Appearance[] = [
  { name: 'light', scheme: 'light', theme: null },
  { name: 'dark', scheme: 'dark', theme: null },
  { name: 'dark chosen on a light device', scheme: 'light', theme: 'dark' },
  { name: 'light chosen on a dark device', scheme: 'dark', theme: 'light' },
];

async function applyAppearance(page: Page, appearance: Appearance) {
  await page.emulateMedia({ colorScheme: appearance.scheme });
  await page.locator('html').evaluate((root, theme) => {
    if (theme === null) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, appearance.theme);
  await page.mouse.move(0, 0);
  // The colour transitions take 300 ms (--duration); later reads of computed colours are immediate.
  await page.waitForTimeout(450);
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** A desktop column: the column box and the box of each cell (the pseudo-element layers are not children). */
async function columnBoxes(host: Locator): Promise<{ host: Box; cells: Array<{ className: string; box: Box }> }> {
  return host.evaluate((element) => {
    const box = (target: typeof element) => {
      const rect = target.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return { host: box(element), cells: [...element.children].map((child) => ({ className: child.className, box: box(child) })) };
  });
}

/** Scrolls so the element's top sits below the sticky bars, and the pointer is off the sheet. */
async function bringIntoView(page: Page, target: Locator) {
  await target.evaluate((element) => element.ownerDocument.defaultView?.scrollBy(0, element.getBoundingClientRect().top - 140));
  await page.mouse.move(0, 0);
}

const sameRgb = (a: Rgba, b: Rgba, tolerance = 3) => sameColour(a, b, tolerance);

/** The painted colour near the top-left corner of a column's OT cell: no text is there, so it is the column's own surface. */
async function otCorner(page: Page, column: Locator): Promise<Rgba> {
  await bringIntoView(page, column);
  const ot = (await columnBoxes(column)).cells.find((cell) => cell.className.includes('d-ot'))?.box;
  expect(ot, 'the OT cell of the column').toBeDefined();
  return paintedPixel(page, Math.ceil(ot?.left ?? 0) + 8, Math.ceil(ot?.top ?? 0) + 2);
}

test('the day open in the Day editor is marked on that day only, moves with the editor, goes with it, and no button name changes', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  // Nothing is open: no day carries the marker and no day button carries aria-current.
  await expectNoMarker(page);
  const buttons = page.locator('[data-sheet] [data-day-button]');
  await expect(buttons).toHaveCount(14);

  await openDay(page, first);
  await expectMarkedOnly(page, first);
  // The accessible names are unchanged (docs/04 line 48, SC 2.5.3): aria-current names the state, the name stays.
  await expect(dayButtonOf(page, first)).toHaveAccessibleName(dayButtonName('Edit', first));
  for (const button of await buttons.all()) await expect(button).toHaveAccessibleName(ANY_DAY_BUTTON_NAME);
  // No other ARIA state is added to the button or its column.
  await expect(dayButtonOf(page, first)).not.toHaveAttribute('aria-expanded', /.*/);
  await expect(dayButtonOf(page, first)).not.toHaveAttribute('aria-controls', /.*/);

  // The marker moves when another day opens: from the sheet beside the panel on a desktop, after the modal sheet closes on a phone.
  if (!desktop) {
    await page.keyboard.press('Escape');
    await expect(editorDialog(page)).toHaveCount(0);
    await expectNoMarker(page);
  }
  await dayButtonOf(page, second).click();
  await expect(editorDialog(page)).toBeVisible();
  await expectMarkedOnly(page, second);
  await expect(dayButtonOf(page, first)).not.toHaveAttribute('aria-current', /.*/);

  // Escape removes the marker, and focus returns to the day's button as before.
  await page.keyboard.press('Escape');
  await expect(editorDialog(page)).toHaveCount(0);
  await expectNoMarker(page);
  await expect(dayButtonOf(page, second)).toBeFocused();

  // So does the Close button.
  await openDay(page, first);
  await expectMarkedOnly(page, first);
  await editorDialog(page).getByRole('button', { name: 'Close', exact: true }).click();
  await expect(editorDialog(page)).toHaveCount(0);
  await expectNoMarker(page);
  await expect(dayButtonOf(page, first)).toBeFocused();
  for (const button of await buttons.all()) await expect(button).toHaveAccessibleName(ANY_DAY_BUTTON_NAME);
});

test('the marker stays with the editor across Show details and a period change, and is absent while its date is not on the sheet', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const { dates } = await shownPeriod(employeeSeed);
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const lastShown = dates.at(-1) ?? '';
  // A date after the shown period, from the server's last date (calendar arithmetic only, no clock).
  const elsewhere = new Date(Date.UTC(Number(lastShown.slice(0, 4)), Number(lastShown.slice(5, 7)) - 1, Number(lastShown.slice(8, 10)) + 30)).toISOString().slice(0, 10);
  expect(dates, 'the date outside the sheet is not on it').not.toContain(elsewhere);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  // A phone's modal sheet makes the toolbar inert, so its switch is set first there; on a desktop the panel is beside the sheet.
  if (!desktop) await page.getByRole('switch', { name: 'Show details' }).check();
  await openDay(page, date);
  await expectMarkedOnly(page, date);

  // Show details re-renders the sheet; the marker is kept and the layer still covers the whole column.
  if (desktop) await page.getByRole('switch', { name: 'Show details' }).check();
  await expect(page.locator('[data-detail]')).toHaveCount(28);
  await expectMarkedOnly(page, date);

  if (!desktop) {
    // The modal sheet makes the page behind inert, so a phone cannot change the period or the day while it is open.
    await expect(page.getByRole('button', { name: 'Next period' }).click({ trial: true, timeout: 1500 })).rejects.toThrow(/intercepts pointer events/);
    await page.keyboard.press('Escape');
    await expectNoMarker(page);
    return;
  }
  await page.getByRole('button', { name: 'Next period' }).click();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  // The editor stays open on its date (existing behaviour) but the date is not on the sheet: no column is marked.
  await expect(page.locator(`[data-day="${date}"]`)).toHaveCount(0);
  await expect(editorDialog(page)).toBeVisible();
  await expectNoMarker(page);
  // Back on the period that shows the date, the marker is back.
  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(page.locator(`[data-day="${date}"]`)).toHaveCount(1);
  await expectMarkedOnly(page, date);
  // Open day takes any date: outside the sheet nothing is marked, on the sheet the marker follows.
  await page.getByLabel('Open a day').fill(elsewhere);
  await page.getByRole('button', { name: 'Open day', exact: true }).click();
  await expect(editorDialog(page).getByRole('heading', { level: 2 })).toHaveText(new RegExp(`${elsewhere}$`));
  await expectNoMarker(page);
  await page.getByLabel('Open a day').fill(date);
  await page.getByRole('button', { name: 'Open day', exact: true }).click();
  await expect(editorDialog(page).getByRole('heading', { level: 2 })).toHaveText(new RegExp(`${date}$`));
  await expectMarkedOnly(page, date);
});

test('desktop: the layers of the editing column cover the head and every row, with or without Show details; the phone row is framed', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await openDay(page, first);
  await expectMarkedOnly(page, first);
  const accentColour = await tokenColour(page, '--accent');
  const fillToken = await tokenColour(page, '--day-editing');
  expect(fillToken[3], 'the editing fill is translucent').toBeGreaterThan(0.05);
  expect(fillToken[3]).toBeLessThan(0.2);

  if (desktop) {
    const column = page.locator(`[data-day="${first}"]`);
    for (const details of [false, true]) {
      if (details) await page.getByRole('switch', { name: 'Show details' }).check();
      await expect(page.locator('[data-detail]')).toHaveCount(details ? 28 : 0);
      await page.mouse.move(0, 0);
      const before = await settledPseudo(column, '::before');
      const after = await settledPseudo(column, '::after');
      // The fill is a layer behind the cells, the same size as the column's padding box and out of the grid flow.
      expect(before.content).toBe('""');
      expect(before.position).toBe('absolute');
      expect(before.zIndex).toBe('-1');
      expect(before.top).toBe('0px');
      expect(Math.abs(before.width - before.hostClientWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(before.height - before.hostClientHeight)).toBeLessThanOrEqual(1);
      expect(sameRgb(parseColour(before.backgroundColor), fillToken, 0), `fill ${before.backgroundColor}`).toBe(true);
      expect(Math.abs(parseColour(before.backgroundColor)[3] - fillToken[3])).toBeLessThan(0.01);
      // The side rails are a layer over the cells that never takes the pointer.
      expect(after.content).toBe('""');
      expect(after.position).toBe('absolute');
      expect(after.pointerEvents).toBe('none');
      expect(Number(after.zIndex)).toBeGreaterThan(0);
      expect(Math.abs(after.width - after.hostClientWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(after.height - after.hostClientHeight)).toBeLessThanOrEqual(1);
      expect([after.borderStartWidth, after.borderEndWidth]).toEqual([2, 2]);
      expect(sameRgb(parseColour(after.borderStartColor), accentColour, 0)).toBe(true);
      expect(sameRgb(parseColour(after.borderEndColor), accentColour, 0)).toBe(true);
      // The layers span from the top of the day head to the bottom of the last row (the subgrid is not disturbed).
      const boxes = await columnBoxes(column);
      expect(boxes.cells.length, 'cells of the column').toBe(details ? 8 : 6);
      const head = boxes.cells[0]?.box;
      const last = boxes.cells.at(-1)?.box;
      expect(Math.abs((head?.top ?? 0) - boxes.host.top)).toBeLessThanOrEqual(1);
      expect(Math.abs((last?.bottom ?? 0) - boxes.host.bottom)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(after.hostClientHeight - ((last?.bottom ?? 0) - (head?.top ?? 0)))).toBeLessThanOrEqual(1.5);
      // The head carries the underline that joins the rails.
      const underline = parseLayers(await settledStyle(column.locator('.d-day'), 'boxShadow'));
      expect(underline.map((layer) => [layer.inset, layer.offsetY])).toEqual([[true, -3]]);
      expect(sameRgb(underline[0]?.colour ?? [0, 0, 0, 0], accentColour, 0)).toBe(true);
      // No other column has a layer.
      expect((await settledPseudo(page.locator(`[data-day="${second}"]`), '::after')).content).toBe('none');
      expect((await settledPseudo(page.locator(`[data-day="${second}"]`), '::before')).content).toBe('none');
    }
  } else {
    // Phone: the row is framed by inset 2px accent shadows over a fill layer that sits above the cell colours.
    for (const details of [false, true]) {
      if (details) {
        await page.keyboard.press('Escape');
        await page.getByRole('switch', { name: 'Show details' }).check();
        await openDay(page, first);
      }
      await expectMarkedOnly(page, first);
      const cells = page.locator(`tr[data-day="${first}"] > td`);
      await expect(cells).toHaveCount(4);
      // The visual record: the framed row above the bottom sheet (the part of the page the sheet does not cover), light and dark.
      await page.locator(`tr[data-day="${first}"]`).evaluate((row) => row.ownerDocument.defaultView?.scrollBy(0, row.getBoundingClientRect().top - 60));
      for (const appearance of [APPEARANCES[0], APPEARANCES[1]] as Appearance[]) {
        await applyAppearance(page, appearance);
        await page.screenshot({ path: screenshotPath(`editing-row${details ? '-details' : ''}-phone-${appearance.name}-synthetic.png`), animations: 'disabled' });
      }
      await applyAppearance(page, APPEARANCES[0] as Appearance);
      for (const index of [0, 1, 2, 3]) {
        const cell = cells.nth(index);
        const frame = parseLayers(await settledStyle(cell, 'boxShadow')).filter((layer) => layer.colour[3] > 0);
        const sides = frame.map((layer) => `${layer.inset ? 'inset' : 'outset'} ${layer.offsetX},${layer.offsetY}`).sort();
        const expected = [
          ...(index === 0 ? ['inset 2,0'] : []),
          ...(index === 3 ? ['inset -2,0'] : []),
          'inset 0,2',
          ...(details ? [] : ['inset 0,-2']),
        ].sort();
        expect(sides, `frame of cell ${index} (details ${details})`).toEqual(expected);
        for (const layer of frame) expect(sameRgb(layer.colour, accentColour, 0)).toBe(true);
        const image = await settledStyle(cell, 'backgroundImage');
        expect(image.startsWith('linear-gradient('), `the fill layer is the top background layer of cell ${index}: ${image}`).toBe(true);
        expect(sameRgb(parseColour(image), fillToken, 0)).toBe(true);
      }
      if (details) {
        const detail = page.locator(`tr[data-day="${first}"] + tr.sheet-detail-row.editing-detail > td`);
        await expect(detail).toHaveCount(1);
        const closing = parseLayers(await settledStyle(detail, 'boxShadow')).filter((layer) => layer.colour[3] > 0);
        expect(closing.map((layer) => `${layer.offsetX},${layer.offsetY}`).sort()).toEqual(['-2,0', '0,-2', '2,0']);
        // Only the editing day's detail row joins the frame.
        await expect(page.locator('tr.editing-detail')).toHaveCount(1);
      } else {
        await expect(page.locator('tr.editing-detail')).toHaveCount(0);
      }
    }
    // The fill sits above the hatching of a non-working day (a layered background, not a replaced one).
    await page.keyboard.press('Escape');
    const { nonworking } = await shownPeriod(employeeSeed);
    const off = nonworking[0] ?? '';
    expect(off, 'a non-working day in the shown period').not.toBe('');
    await openDay(page, off);
    const hatched = await settledStyle(page.locator(`tr[data-day="${off}"] > td`).nth(1), 'backgroundImage');
    expect(hatched).toMatch(/^linear-gradient\(.*\), repeating-linear-gradient\(/);
  }
});

/**
 * The colour actually painted: rails over the opaque day head and over an attention cell (they used to be hidden there), the
 * fill behind the cells, and the Today bar over the head. Read from screenshots in both themes (desktop only: on a phone the
 * modal sheet and its scrim cover the page while the editor is open).
 */
test('desktop: the rails are painted over every cell, the fill behind them, and a neighbouring day is left alone, in both themes', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  if (project !== 'desktop') {
    // The phone has no column. The row frame is measured in the previous test; here the row is painted in the closed state.
    await expectNoMarker(page);
    return;
  }
  await openDay(page, first);
  await expectMarkedOnly(page, first);
  for (const details of [false, true]) {
    if (details) await page.getByRole('switch', { name: 'Show details' }).check();
    for (const appearance of APPEARANCES) {
      await applyAppearance(page, appearance);
      const accent = await tokenColour(page, '--accent');
      const fill = await tokenColour(page, '--day-editing');
      const column = page.locator(`[data-day="${first}"]`);
      const neighbour = page.locator(`[data-day="${second}"]`);
      await bringIntoView(page, column);
      await settledPseudo(column, '::before');
      const boxes = await columnBoxes(column);
      const left = Math.ceil(boxes.host.left);
      const right = Math.floor(boxes.host.right - 2);
      // The attention cell (a past workday without a session) is among the cells, and so is the head.
      expect(boxes.cells.some((cell) => cell.className.includes('attention')), 'an attention cell in the column').toBe(true);
      for (const cell of boxes.cells) {
        const y = Math.floor(cell.box.top + cell.box.height / 2);
        expect(sameRgb(await paintedPixel(page, left, y), accent), `${appearance.name}: left rail over "${cell.className}" (details ${details})`).toBe(true);
        expect(sameRgb(await paintedPixel(page, right, y), accent), `${appearance.name}: right rail over "${cell.className}" (details ${details})`).toBe(true);
      }
      // The rail is a layer over the cell, not a property of it: the same pixel of the neighbouring day is not accent.
      await bringIntoView(page, neighbour);
      const other = await columnBoxes(neighbour);
      const otherHead = other.cells[0]?.box;
      expect(sameRgb(await paintedPixel(page, Math.ceil(other.host.left), Math.floor((otherHead?.top ?? 0) + (otherHead?.height ?? 0) / 2)), accent)).toBe(false);
      // The fill is behind the cells: a corner of the OT cell is the neighbour's colour with the fill over it.
      const bare = await otCorner(page, neighbour);
      const filled = await otCorner(page, column);
      const expected = over(fill, bare);
      expect(sameRgb(filled, expected, 4), `${appearance.name}: fill ${filled.join(',')} over ${bare.join(',')} should be about ${expected.map(Math.round).join(',')}`).toBe(true);
      expect(sameRgb(filled, bare, 0), `${appearance.name}: the fill changes the pixel`).toBe(false);
    }
  }
  // The visual record: the column with and without the detail rows, light and dark.
  const column = page.locator(`[data-day="${first}"]`);
  for (const details of [false, true]) {
    const toggle = page.getByRole('switch', { name: 'Show details' });
    await (details ? toggle.check() : toggle.uncheck());
    for (const appearance of [APPEARANCES[0], APPEARANCES[1]] as Appearance[]) {
      await applyAppearance(page, appearance);
      await bringIntoView(page, column);
      await page.screenshot({ path: screenshotPath(`editing-column${details ? '-details' : ''}-desktop-${appearance.name}-synthetic.png`), animations: 'disabled' });
    }
  }
});

/** The page never scrolls sideways: the root element's scroll width equals its client width (R-B7-2: measured, not assumed). */
async function expectNoSidewaysScroll(page: Page, label: string) {
  const root = await page.locator('html').evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(root.client, `${label}: the root has a width`).toBeGreaterThan(0);
  expect(root.scroll, `${label}: scrollWidth ${root.scroll} against clientWidth ${root.client}`).toBe(root.client);
}

for (const width of [390, 375, 360, 320]) {
  test(`no sideways scroll at ${width}px with detail rows, the selection ring, and the editing frame`, async ({ page, employeeSeed, signInThroughUi }) => {
    await page.setViewportSize({ width, height: 844 });
    const [first = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await expect(page.locator('[data-sheet="phone"]')).toHaveCount(1);
    await page.getByRole('switch', { name: 'Show details' }).check();
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByLabel(`Select ${first}`).check();
    await expectNoSidewaysScroll(page, `selected, details on, ${width}px`);
    await page.getByRole('button', { name: 'Change several days' }).click();
    await openDay(page, first);
    await expectMarkedOnly(page, first);
    await expectNoSidewaysScroll(page, `editing frame with the details row, ${width}px`);
    const dialogOverflow = await editorDialog(page).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(dialogOverflow, `the editor sheet does not scroll sideways at ${width}px`).toBe(0);
    await page.keyboard.press('Escape');
    await expectNoSidewaysScroll(page, `closed again, ${width}px`);
  });
}

test('an open label picker list stays above the neighbouring columns, also in the editing column', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const [first = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  // The column layers make each desktop column its own stacking context; the open picker raises its column so the list is not
  // painted under the next column. The editing column is the isolated column with the most layers.
  if (desktop) {
    await openDay(page, first);
    await expectMarkedOnly(page, first);
  }
  const trigger = page.locator(`[data-label-picker="${first}"] .label-trigger`);
  await trigger.click();
  const list = page.locator(`[data-label-picker="${first}"] .label-list`);
  await expect(list).toBeVisible();
  await list.scrollIntoViewIfNeeded();
  const covered = await list.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const doc = element.ownerDocument;
    const points = [0.1, 0.5, 0.9].flatMap((x) => [0.15, 0.5, 0.85].map((y) => [box.left + box.width * x, box.top + box.height * y] as const));
    return points.filter(([x, y]) => doc.elementFromPoint(x, y)?.closest('.label-list') === null).length;
  });
  expect(covered, 'points of the open list that another element covers').toBe(0);
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
});

test('the batch-selection ring is unbroken at the day head and at an attention cell, in both themes', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Change several days' }).click();
  await page.getByLabel(`Select ${first}`).check();
  const unit = page.locator(`[data-day="${first}"]`);
  await expect(unit).toHaveClass(/\bselected\b/);
  await expect(page.locator('[data-day].selected')).toHaveCount(1);
  if (!desktop) {
    // A phone row keeps its tint (the ring is a column property); nothing else about batch selection changes.
    await expect(page.getByLabel(`Select ${first}`)).toBeChecked();
    await expect(page.getByLabel(`Select ${second}`)).not.toBeChecked();
    return;
  }
  for (const appearance of APPEARANCES) {
    await applyAppearance(page, appearance);
    const accent = await tokenColour(page, '--accent');
    const after = await settledPseudo(unit, '::after');
    expect(after.pointerEvents).toBe('none');
    const rings = parseLayers(after.boxShadow).filter((layer) => layer.colour[3] > 0);
    expect(rings.map((layer) => [layer.inset, layer.offsetX, layer.offsetY, layer.spread])).toEqual([[true, 0, 0, 2]]);
    // The old place of the ring, the column's own shadow, is gone: it was painted under the opaque head and attention cell.
    expect(await settledStyle(unit, 'boxShadow')).toBe('none');
    await bringIntoView(page, unit);
    const boxes = await columnBoxes(unit);
    const left = Math.ceil(boxes.host.left);
    const right = Math.floor(boxes.host.right - 2);
    for (const cell of boxes.cells) {
      const y = Math.floor(cell.box.top + cell.box.height / 2);
      expect(sameRgb(await paintedPixel(page, left, y), accent), `${appearance.name}: left ring over "${cell.className}"`).toBe(true);
      expect(sameRgb(await paintedPixel(page, right, y), accent), `${appearance.name}: right ring over "${cell.className}"`).toBe(true);
    }
    const head = boxes.cells[0]?.box;
    const middle = Math.floor((head?.left ?? 0) + (head?.width ?? 0) / 2);
    expect(sameRgb(await paintedPixel(page, middle, Math.ceil(boxes.host.top)), accent), `${appearance.name}: top ring over the head`).toBe(true);
    const last = boxes.cells.at(-1)?.box;
    expect(sameRgb(await paintedPixel(page, middle, Math.floor((last?.bottom ?? 0) - 1)), accent), `${appearance.name}: bottom ring`).toBe(true);
  }
  await applyAppearance(page, APPEARANCES[0] as Appearance);
  await bringIntoView(page, unit);
  await page.screenshot({ path: screenshotPath('batch-ring-desktop-light-synthetic.png'), animations: 'disabled' });
});

test('the Today bar is painted over the day head, with the Today tag, and stays with batch selection and the editing marker', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  await signInThroughUi();
  const today = await showToday(page, employeeSeed);
  const unit = page.locator(`[data-day="${today}"]`);
  await expect(unit).toHaveClass(/\btoday\b/);
  await expect(unit.locator('.today-tag')).toBeVisible();
  await expect(page.locator('[data-day].today')).toHaveCount(1);

  if (desktop) {
    for (const appearance of APPEARANCES) {
      await applyAppearance(page, appearance);
      const accent = await tokenColour(page, '--accent');
      const headBackground = parseColour(await settledStyle(unit.locator('.d-day'), 'backgroundColor'));
      expect(sameRgb(headBackground, accent, 20), 'the head is not accent coloured itself').toBe(false);
      await bringIntoView(page, unit);
      // The bar is a layer over the head, not a shadow of the column: the column itself has none.
      expect(await settledStyle(unit, 'boxShadow')).toBe('none');
      const bar = parseLayers((await settledPseudo(unit, '::after')).boxShadow).filter((layer) => layer.colour[3] > 0);
      expect(bar.map((layer) => [layer.inset, layer.offsetX, layer.offsetY, layer.spread])).toEqual([[true, 0, 3, 0]]);
      const boxes = await columnBoxes(unit);
      const head = boxes.cells[0]?.box;
      const middle = Math.floor((head?.left ?? 0) + (head?.width ?? 0) / 2);
      const top = Math.ceil(boxes.host.top);
      // The bar is 3px; layout may place its edge between pixels, so the two rows that it covers whole are accent, and the
      // row below it is the head colour again.
      for (const row of [0, 1]) expect(sameRgb(await paintedPixel(page, middle, top + row), accent), `${appearance.name}: Today bar row ${row} over the head`).toBe(true);
      expect(sameRgb(await paintedPixel(page, middle, top + 4), accent), `${appearance.name}: the head under the bar is not accent`).toBe(false);
    }
    await applyAppearance(page, APPEARANCES[0] as Appearance);

    // With batch selection: the bar and the ring together; the ring is unbroken at the head.
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByLabel(`Select ${today}`).check();
    await expect(unit).toHaveClass(/\bselected\b/);
    const both = parseLayers((await settledPseudo(unit, '::after')).boxShadow).filter((layer) => layer.colour[3] > 0);
    expect(both.map((layer) => [layer.inset, layer.offsetY, layer.spread]).sort()).toEqual([
      [true, 0, 2],
      [true, 3, 0],
    ]);
    await bringIntoView(page, unit);
    const accent = await tokenColour(page, '--accent');
    const selectedBoxes = await columnBoxes(unit);
    const selectedHead = selectedBoxes.cells[0]?.box;
    const centre = Math.floor((selectedHead?.left ?? 0) + (selectedHead?.width ?? 0) / 2);
    const rowY = Math.floor((selectedHead?.top ?? 0) + (selectedHead?.height ?? 0) / 2);
    expect(sameRgb(await paintedPixel(page, centre, Math.ceil(selectedBoxes.host.top) + 1), accent), 'Today bar with batch selection').toBe(true);
    expect(sameRgb(await paintedPixel(page, Math.ceil(selectedBoxes.host.left), rowY), accent), 'ring over the head').toBe(true);
    await page.screenshot({ path: screenshotPath('today-bar-batch-desktop-light-synthetic.png'), animations: 'disabled' });
    await applyAppearance(page, APPEARANCES[1] as Appearance);
    await bringIntoView(page, unit);
    await page.screenshot({ path: screenshotPath('today-bar-batch-desktop-dark-synthetic.png'), animations: 'disabled' });
    await applyAppearance(page, APPEARANCES[0] as Appearance);

    // With the editor open as well: all three markers on one column.
    await openDay(page, today);
    await expect(unit).toHaveClass(/\btoday\b/);
    await expect(unit).toHaveClass(/\bselected\b/);
    await expect(unit).toHaveClass(/\bediting\b/);
    const all = await settledPseudo(unit, '::after');
    expect([all.borderStartWidth, all.borderEndWidth]).toEqual([2, 2]);
    expect(
      parseLayers(all.boxShadow)
        .filter((layer) => layer.colour[3] > 0)
        .map((layer) => [layer.offsetY, layer.spread])
        .sort(),
    ).toEqual([
      [0, 2],
      [3, 0],
    ]);
    await expectMarkedOnly(page, today);
    await bringIntoView(page, unit);
    const allBoxes = await columnBoxes(unit);
    const allHead = allBoxes.cells[0]?.box;
    const allCentre = Math.floor((allHead?.left ?? 0) + (allHead?.width ?? 0) / 2);
    expect(sameRgb(await paintedPixel(page, allCentre, Math.ceil(allBoxes.host.top)), accent), 'Today bar with all three markers').toBe(true);
    // The head underline is the lowest rows of the head.
    expect(sameRgb(await paintedPixel(page, allCentre, Math.floor((allHead?.bottom ?? 0) - 2)), accent), 'head underline').toBe(true);
    await unit.locator('.today-tag').waitFor();
  } else {
    // A phone row: the Today bar is the 3px leading rail of the first cell.
    await bringIntoView(page, unit);
    const first = unit.locator(':scope > td').first();
    const rail = parseLayers(await settledStyle(first, 'boxShadow')).filter((layer) => layer.colour[3] > 0);
    expect(rail.map((layer) => [layer.inset, layer.offsetX, layer.offsetY])).toEqual([[true, 3, 0]]);
    const accent = await tokenColour(page, '--accent');
    const box = await first.boundingBox();
    expect(box, 'first cell box').not.toBeNull();
    const y = Math.floor((box?.y ?? 0) + (box?.height ?? 0) / 2);
    expect(sameRgb(await paintedPixel(page, Math.ceil(box?.x ?? 0), y), accent), 'Today rail painted').toBe(true);
    // Together with batch selection the rail stays.
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByLabel(`Select ${today}`).check();
    await expect(unit).toHaveClass(/\bselected\b/);
    await bringIntoView(page, unit);
    const kept = parseLayers(await settledStyle(first, 'boxShadow')).filter((layer) => layer.colour[3] > 0);
    expect(kept.map((layer) => [layer.inset, layer.offsetX, layer.offsetY])).toEqual([[true, 3, 0]]);
    const selectedBox = await first.boundingBox();
    expect(sameRgb(await paintedPixel(page, Math.ceil(selectedBox?.x ?? 0), Math.floor((selectedBox?.y ?? 0) + (selectedBox?.height ?? 0) / 2)), accent), 'Today rail with selection').toBe(true);
    // And with the editor open: the 3px rail leads, with the 2px frame above and below.
    await page.getByRole('button', { name: 'Change several days' }).click();
    await openDay(page, today);
    await expectMarkedOnly(page, today);
    const framed = parseLayers(await settledStyle(first, 'boxShadow'))
      .filter((layer) => layer.colour[3] > 0)
      .map((layer) => `${layer.offsetX},${layer.offsetY}`)
      .sort();
    expect(framed).toEqual(['0,-2', '0,2', '3,0']);
  }
});

interface EditingSurfaces {
  /** The colour of the rails (the frame on a phone). */
  rail: Rgba;
  /** What lies under a body cell: the card or the non-working tint, with the editing fill over it. */
  bodies: Rgba[];
  /** Opaque cells that the rails cross: the day head (desktop). */
  heads: Rgba[];
  /** The amber cell, with the fill over it on a phone (the fill is behind the cell on a desktop). */
  attention: Rgba[];
}

/** The surfaces of the day open in the editor, composited from the computed styles of the cells and layers. */
async function editingSurfaces(page: Page, desktop: boolean, workDate: string): Promise<EditingSurfaces> {
  await page.mouse.move(0, 0);
  if (desktop) {
    const host = page.locator(`[data-day="${workDate}"]`);
    const base = over(parseColour(await computedStyle(host, 'backgroundColor')), backdropOf(await backdropsAbove(host)));
    const fill = parseColour((await readPseudo(host, '::before')).backgroundColor);
    const rail = parseColour((await readPseudo(host, '::after')).borderStartColor);
    const head = over(parseColour(await computedStyle(host.locator('.d-day'), 'backgroundColor')), base);
    const attention = host.locator('.d-time.attention');
    return {
      rail,
      bodies: [over(fill, base)],
      heads: [head],
      attention: (await attention.count()) === 0 ? [] : [over(parseColour(await computedStyle(attention, 'backgroundColor')), base)],
    };
  }
  const cells = page.locator(`tr[data-day="${workDate}"] > td`);
  const rails = parseLayers(await computedStyle(cells.first(), 'boxShadow')).filter((layer) => layer.colour[3] > 0);
  const surfaces: Rgba[] = [];
  const amber: Rgba[] = [];
  for (const cell of await cells.all()) {
    const under = over(parseColour(await computedStyle(cell, 'backgroundColor')), backdropOf(await backdropsAbove(cell)));
    const surface = over(parseColour(await computedStyle(cell, 'backgroundImage')), under);
    if (((await cell.getAttribute('class')) ?? '').includes('attention')) amber.push(surface);
    else surfaces.push(surface);
  }
  // On a phone every cell that is not amber is a body cell (the fill is a background layer of the cell itself).
  return { rail: rails[0]?.colour ?? [0, 0, 0, 0], bodies: surfaces, heads: [], attention: amber };
}

test('rails and text keep their contrast on every surface of the editing day: card, non-working, head and amber, in both themes and both manual choices', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const [workday = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const { nonworking } = await shownPeriod(employeeSeed);
  const dayOff = nonworking[0] ?? '';
  expect(dayOff, 'a non-working day in the shown period').not.toBe('');
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const notes: string[] = [];
  for (const [index, workDate] of [workday, dayOff].entries()) {
    if (index > 0 && !desktop) await page.keyboard.press('Escape');
    await openDay(page, workDate);
    await expectMarkedOnly(page, workDate);
    for (const appearance of APPEARANCES) {
      await applyAppearance(page, appearance);
      const surfaces = await editingSurfaces(page, desktop, workDate);
      // SC 1.4.11: the rails (frame) against every surface they cross are at least 3:1.
      const crossed = [...surfaces.bodies, ...surfaces.heads, ...surfaces.attention];
      const railMin = Math.min(...crossed.map((surface) => contrast(surfaces.rail, surface)));
      expect(railMin, `${appearance.name}, ${workDate}: rail against its worst surface`).toBeGreaterThanOrEqual(3);
      // SC 1.4.3: text on the worst body surface (the non-working tint with the fill over it) is at least 4.5:1.
      let textMin = Infinity;
      for (const token of ['--text', '--muted', '--ok', '--warn', '--error', '--accent']) {
        const colour = await tokenColour(page, token);
        for (const surface of surfaces.bodies) textMin = Math.min(textMin, contrast(colour, surface));
        for (const surface of surfaces.bodies) expect(contrast(colour, surface), `${appearance.name}, ${workDate}: ${token} on ${surface.map(Math.round).join(',')}`).toBeGreaterThanOrEqual(4.5);
      }
      const ink = await tokenColour(page, '--attention-ink');
      for (const surface of surfaces.attention) {
        expect(contrast(ink, surface), `${appearance.name}, ${workDate}: attention text on the amber cell`).toBeGreaterThanOrEqual(4.5);
      }
      notes.push(`${appearance.name} ${workDate === dayOff ? 'non-working' : 'workday'}: rail ${railMin.toFixed(2)}:1, text ${textMin.toFixed(2)}:1`);
    }
  }
  await applyAppearance(page, APPEARANCES[0] as Appearance);
  testInfo.annotations.push({ type: 'editing-contrast', description: notes.join('; ') });
  for (const note of notes) console.log(`editing contrast (${testInfo.project.name}) ${note}`);
});

/* ---- WP5-UX3-T04: the pills, the meta row, "Open a day" and the toolbar (U-09 .. U-12, U-18) -----------------------------------
 *
 * Every date comes from the server and the displayed period. The pills are probed with one element of each kind appended to the period
 * title, because "in progress" shows on the five window days only; the displayed pills (old, current, future, or in progress) are read
 * as they are and compared with their probe.
 */

const PILL_KINDS = ['old', 'current', 'future', 'in-progress', 'neutral'] as const;

test('the pills: each ink is at least 4.5:1 on its fill, the five fills differ, the words stay, and the displayed pill is its kind (four theme situations)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  // The displayed pills carry words: the opening period is "current"; Previous is "old". Next is "future", or "in progress" on a window day.
  const title = page.locator('.period-title');
  const periods = await employeeSeed.periodsCurrent();
  const inWindow = periods.current.payroll_date !== periods.in_progress.payroll_date;
  await expect(title.locator('.badge.current')).toHaveText('current');
  await page.getByRole('button', { name: 'Next period' }).click();
  await expect(title.locator(inWindow ? '.badge.in-progress' : '.badge.future')).toHaveText(inWindow ? 'in progress' : 'future');
  await expect(title.locator(inWindow ? '.badge.future' : '.badge.in-progress')).toHaveCount(0);
  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(title.locator('.badge.current')).toHaveText('current');
  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(title.locator('.badge.old')).toHaveText('old');
  // One probe of each kind, in the same container, so the same cascade applies (a neutral pill is a plain badge in the title).
  await title.evaluate((element, kinds) => {
    for (const kind of kinds) {
      const probe = element.ownerDocument.createElement('span');
      probe.className = kind === 'neutral' ? 'badge' : `badge ${kind}`;
      probe.dataset.pillProbe = kind;
      probe.textContent = kind === 'neutral' ? 'Draft' : kind.replace('-', ' ');
      element.append(probe);
    }
  }, PILL_KINDS);
  const probe = (kind: string) => title.locator(`[data-pill-probe="${kind}"]`);
  const measured: string[] = [];
  for (const appearance of APPEARANCES) {
    await applyAppearance(page, appearance);
    const fills: Rgba[] = [];
    for (const kind of PILL_KINDS) {
      const pill = probe(kind);
      const fill = over(parseColour(await computedStyle(pill, 'backgroundColor')), backdropOf(await backdropsAbove(pill)));
      const ink = parseColour(await computedStyle(pill, 'color'));
      const ratio = contrast(over(ink, fill), fill);
      expect(fill[3], `${appearance.name}: the ${kind} pill fill is opaque`).toBe(1);
      expect(ratio, `${appearance.name}: ${kind} ink on its fill`).toBeGreaterThanOrEqual(4.5);
      // The pill is a pill (round corners) with a visible outline, and its words are real text.
      const shape = await pill.evaluate((element) => {
        const style = element.ownerDocument.defaultView?.getComputedStyle(element);
        return { radius: style?.borderTopLeftRadius ?? '', border: style?.borderTopWidth ?? '' };
      });
      expect(parseFloat(shape.radius), `${kind}: the pill radius`).toBeGreaterThan(50);
      expect(shape.border, `${kind}: an outline`).toBe('1px');
      await expect(pill).not.toHaveText('');
      fills.push(fill);
      measured.push(`${appearance.name} ${kind} ${ratio.toFixed(2)}:1`);
    }
    // The five fills differ (the colour is never the only cue, but it is not one colour either).
    for (const [index, fill] of fills.entries()) {
      for (const other of fills.slice(index + 1)) expect(sameColour(fill, other, 3), `${appearance.name}: two pill fills are the same colour`).toBe(false);
    }
    // The displayed "old" pill is the old probe, painted the same.
    const shown = title.locator('.badge.old').first();
    expect(parseColour(await computedStyle(shown, 'backgroundColor'))).toEqual(parseColour(await computedStyle(probe('old'), 'backgroundColor')));
    expect(parseColour(await computedStyle(shown, 'color'))).toEqual(parseColour(await computedStyle(probe('old'), 'color')));
  }
  await applyAppearance(page, APPEARANCES[0] as Appearance);
  testInfo.annotations.push({ type: 'pill-contrast', description: measured.join('; ') });
  console.log(`pill contrast (${testInfo.project.name}) ${measured.join('; ')}`);
});

test('desktop: the meta line is under the title row of the card on one row at 1280 and wraps, without overflow, when its three parts do not fit', async ({
  page,
  signInThroughUi,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The two-row period card is the 768px and wider layout');
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const card = page.locator('section.period-bar');
  const meta = card.locator('.period-meta');
  const parts = meta.locator(':scope > span');
  await expect(parts).toHaveCount(3);
  const tops = async () => Promise.all((await parts.all()).map(async (part) => (await part.boundingBox())?.y ?? Number.NaN));
  const rowGap = async () =>
    meta.evaluate((element) => {
      const style = element.ownerDocument.defaultView?.getComputedStyle(element);
      return { row: parseFloat(style?.rowGap ?? 'NaN'), column: parseFloat(style?.columnGap ?? 'NaN') };
    });
  // Row 1 (the buttons and the dates) is above the meta line, which spans the card under a hairline.
  await page.setViewportSize({ width: 1280, height: 800 });
  const cardBox = await card.boundingBox();
  const metaBox = await meta.boundingBox();
  const firstRow = await card.getByRole('button', { name: 'Today', exact: true }).boundingBox();
  expect(metaBox?.y ?? 0, 'the meta line is under the first row').toBeGreaterThan((firstRow?.y ?? 0) + (firstRow?.height ?? 0));
  expect((metaBox?.width ?? 0) + 2 * 16, 'the meta line spans the width of the card').toBeGreaterThanOrEqual((cardBox?.width ?? 0) - 1);
  const rule = await meta.evaluate((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return { width: style?.borderTopWidth ?? '', style: style?.borderTopStyle ?? '' };
  });
  expect(rule, 'a hairline above the meta line').toEqual({ width: '1px', style: 'solid' });
  expect(await rowGap(), 'gap 4px 28px (B4)').toEqual({ row: 4, column: 28 });
  const wide = await tops();
  expect(Math.max(...wide) - Math.min(...wide), 'one row at 1280').toBeLessThanOrEqual(2);
  // The natural width of the three parts and their gaps is the most the line can need.
  const need = (await Promise.all((await parts.all()).map(async (part) => (await part.boundingBox())?.width ?? 0))).reduce((sum, width) => sum + width, 0) + 2 * 28;
  console.log(`META natural width ${need}px of a card inner ${(metaBox?.width ?? 0) - 0}px at 1280`);
  for (const width of [820, 768]) {
    await page.setViewportSize({ width, height: 800 });
    const inner = (await meta.boundingBox())?.width ?? 0;
    const rows = new Set((await tops()).map((top) => Math.round(top)));
    console.log(`META width=${width} inner=${inner} rows=${rows.size} need=${need}`);
    // The parts wrap exactly when they do not fit on one line: more than one row if and only if the line needs more than the card gives.
    if (need > inner) expect(rows.size, `${width}px: the parts wrap onto a second row`).toBeGreaterThan(1);
    else expect(rows.size, `${width}px: the parts fit one row`).toBe(1);
    // Wrapped or not, nothing leaves the card and nothing scrolls sideways.
    for (const part of await parts.all()) {
      const box = await part.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0), `${width}px: a part stays inside the card`).toBeLessThanOrEqual(((await card.boundingBox())?.x ?? 0) + ((await card.boundingBox())?.width ?? 0) + 0.5);
    }
    expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), `${width}px: no sideways scroll`).toBe(true);
  }
});

test.describe('a long display zone name', () => {
  // The "Times in {zone}" part grows with the zone name, so the three parts of the meta line (payroll date, due, times) need more than the
  // card gives at 820px while they still fit on one row at 1280px: the deterministic case of "one row at 1280, wrapped at 820".
  test.use({ timezoneId: 'America/North_Dakota/New_Salem' });

  test('desktop: the meta line is one row at 1280 and wraps onto a second row at 820 and 768, inside the card', async ({ page, signInThroughUi }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The two-row period card is the 768px and wider layout');
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const card = page.locator('section.period-bar');
    const parts = card.locator('.period-meta > span');
    await expect(parts).toHaveCount(3);
    await expect(parts.nth(2)).toHaveText('Times in America/North_Dakota/New_Salem');
    const tops = async () => Promise.all((await parts.all()).map(async (part) => Math.round((await part.boundingBox())?.y ?? Number.NaN)));
    await page.setViewportSize({ width: 1280, height: 800 });
    const wide = await tops();
    expect(new Set(wide).size, 'one row at 1280').toBe(1);
    const need = (await Promise.all((await parts.all()).map(async (part) => (await part.boundingBox())?.width ?? 0))).reduce((sum, width) => sum + width, 0) + 2 * 28;
    for (const width of [820, 768]) {
      await page.setViewportSize({ width, height: 800 });
      const cardBox = await card.boundingBox();
      const inner = (cardBox?.width ?? 0) - 2 * 16;
      // The precondition of the case: the three parts need more than the card gives.
      expect(need, `${width}px: the parts need more than the ${inner}px the card gives`).toBeGreaterThan(inner);
      const rows = new Set(await tops());
      console.log(`META long zone width=${width} inner=${inner} need=${need} rows=${rows.size}`);
      expect(rows.size, `${width}px: the parts wrap onto a second row`).toBe(2);
      for (const part of await parts.all()) {
        const box = await part.boundingBox();
        expect((box?.x ?? 0) + (box?.width ?? 0), `${width}px: a part stays inside the card`).toBeLessThanOrEqual((cardBox?.x ?? 0) + (cardBox?.width ?? 0) + 0.5);
      }
      expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), `${width}px: no sideways scroll`).toBe(true);
    }
    await page.setViewportSize({ width: 820, height: 800 });
    await card.screenshot({ path: screenshotPath('period-card-meta-wrapped-w820-synthetic.png'), animations: 'disabled' });
  });
});

test('"Open a day": the words, the date field and the button share one row; the words are hidden below 21rem and the field is still named', async ({
  page,
  signInThroughUi,
}, testInfo) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const row = page.locator('.tools .open-day');
  const text = row.locator('.open-day-text');
  const field = page.getByLabel('Open a day');
  const button = row.getByRole('button', { name: 'Open day', exact: true });
  await expect(field).toHaveCount(1);
  const threshold = await page.evaluate<number>("parseFloat(getComputedStyle(document.documentElement).fontSize) * 21");
  const widths = testInfo.project.name === 'desktop' ? [1280, 1024, 768] : [600, 390, 375, 360, 320];
  const lines: string[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const [rowBox, fieldBox, buttonBox] = [await row.boundingBox(), await field.boundingBox(), await button.boundingBox()];
    expect(rowBox && fieldBox && buttonBox, `${width}px: the row is painted`).toBeTruthy();
    // One row: the field and the button are centred on the same line (the control heights can differ by a few pixels).
    const centre = (box: { y: number; height: number } | null) => (box?.y ?? 0) + (box?.height ?? 0) / 2;
    expect(Math.abs(centre(fieldBox) - centre(buttonBox)), `${width}px: the field and the button share a row`).toBeLessThanOrEqual(3);
    expect((fieldBox?.x ?? 0) + (fieldBox?.width ?? 0), `${width}px: the button is right of the field`).toBeLessThanOrEqual((buttonBox?.x ?? 0) + 0.5);
    expect((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0), `${width}px: the button is inside the row`).toBeLessThanOrEqual((rowBox?.x ?? 0) + (rowBox?.width ?? 0) + 0.5);
    const hidden = (rowBox?.width ?? 0) < threshold;
    const textBox = await text.boundingBox();
    if (hidden) {
      // Visually hidden (a 1px clipped box), never removed: the label still names the field.
      expect(textBox?.width ?? 99, `${width}px: the words are hidden`).toBeLessThanOrEqual(1.5);
    } else {
      expect(textBox?.width ?? 0, `${width}px: the words are shown`).toBeGreaterThan(40);
      expect(Math.abs(centre(textBox) - centre(fieldBox)), `${width}px: the words share the row`).toBeLessThanOrEqual(6);
      expect((textBox?.x ?? 0) + (textBox?.width ?? 0), `${width}px: the words come before the field`).toBeLessThanOrEqual((fieldBox?.x ?? 0) + 0.5);
    }
    await expect(field, `${width}px: the field is named`).toHaveAccessibleName('Open a day');
    expect(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), `${width}px: no sideways scroll`).toBe(true);
    lines.push(`${width}: row ${rowBox?.width}px, words ${hidden ? 'hidden' : 'shown'}, field ${fieldBox?.width}px`);
  }
  console.log(`OPENDAY (${testInfo.project.name}) ${lines.join('; ')}`);
  if (testInfo.project.name === 'mobile') {
    // The sheet area has no card padding since T01, so the row is the viewport less the 32px page padding: 358px at 390 and 328px at 360
    // (both at least 21rem = 315px: words, field and button fit, so the words show) and 288px at 320 (below it: the words are hidden).
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      expect((await row.boundingBox())?.width ?? 0, `${width}px: the row`).toBeCloseTo(width - 32, 0);
      expect((await text.boundingBox())?.width ?? 0, `${width}px: the words are shown`).toBeGreaterThan(40);
    }
    await page.setViewportSize({ width: 320, height: 844 });
    expect((await row.boundingBox())?.width ?? 0, '320px: the row').toBeCloseTo(288, 0);
    expect((await text.boundingBox())?.width ?? 99, '320px: the words are hidden').toBeLessThanOrEqual(1.5);
  } else {
    for (const width of [1280, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect((await text.boundingBox())?.width ?? 0, `${width}px: the words are shown on a wide screen`).toBeGreaterThan(40);
    }
  }
});

test('desktop toolbar: the gap between "Show details" and "Change several days" is the token with a 1px separator, and the button is outlined until pressed', async ({
  page,
  signInThroughUi,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The group gap is the 768px and wider toolbar; a phone keeps the tight gap');
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const tokenPx = await page.evaluate<number>(
    "(() => { const probe = document.createElement('div'); probe.style.width = 'var(--toolbar-group-gap)'; document.body.append(probe); const px = probe.getBoundingClientRect().width; probe.remove(); return px; })()",
  );
  expect(tokenPx, 'the token is 24px').toBe(24);
  const batch = page.getByRole('button', { name: 'Change several days', exact: true });
  const details = page.locator('.tools-right label.switch');
  for (const width of [1280, 1024, 768]) {
    await page.setViewportSize({ width, height: 800 });
    const [detailsBox, batchBox] = [await details.boundingBox(), await batch.boundingBox()];
    expect(Math.abs((batchBox?.x ?? 0) - ((detailsBox?.x ?? 0) + (detailsBox?.width ?? 0)) - tokenPx), `${width}px: the gap equals the token`).toBeLessThanOrEqual(0.5);
    const centre = (box: { y: number; height: number } | null) => (box?.y ?? 0) + (box?.height ?? 0) / 2;
    expect(Math.abs(centre(detailsBox) - centre(batchBox)), `${width}px: one row`).toBeLessThanOrEqual(2);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  // The separator: a 1px --line rule in the middle of the gap, as tall as the button.
  const separator = await batch.evaluate((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element, '::before');
    const host = element.getBoundingClientRect();
    return { content: style?.content ?? '', width: style?.width ?? '', background: style?.backgroundColor ?? '', height: parseFloat(style?.height ?? '0'), hostHeight: host.height };
  });
  expect(separator.content).not.toBe('none');
  expect(separator.width).toBe('1px');
  expect(parseColour(separator.background), 'the separator is the line token').toEqual(await tokenColour(page, '--line'));
  expect(Math.abs(separator.height - (separator.hostHeight - 2)), 'as tall as the button').toBeLessThanOrEqual(1);
  // Outlined secondary at rest (its edge is visible), the solid accent when pressed (the round-2 rule).
  await expect(batch).toHaveClass(/\bsecondary\b/);
  await expect(batch).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.move(0, 0);
  const rest = {
    border: parseColour(await settledStyle(batch, 'borderTopColor')),
    fill: parseColour(await settledStyle(batch, 'backgroundColor')),
  };
  expect(rest.border[3], 'a visible outline at rest').toBeGreaterThan(0.3);
  const card = await tokenColour(page, '--card');
  expect(sameColour(rest.fill, card, 3), 'the resting fill is the card colour').toBe(true);
  await batch.click();
  await expect(batch).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(0, 0);
  const accent = await tokenColour(page, '--accent');
  expect(sameColour(parseColour(await settledStyle(batch, 'backgroundColor')), accent, 3), 'pressed is the solid accent').toBe(true);
  await page.screenshot({ path: screenshotPath('toolbar-desktop-pressed-synthetic.png'), clip: { x: 0, y: 0, width: 1280, height: 520 }, animations: 'disabled' });
});
