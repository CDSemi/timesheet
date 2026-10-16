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

/**
 * WP5-UX3-T05B: below 1360px the Day editor floats as a modal panel and the page behind is inert. A desktop test that works on the
 * sheet while the editor is open therefore runs in a window where the editor stands beside the sheet (the project's own window is 1280px).
 * 1445px, not 1440: with the page uncapped to 1600px the seven columns are then exactly 129px wide, so a column's left and right edges
 * fall on whole pixels and the pixel probes of the editing frame (a 1px inset ring cut by the run's clip-path) read it exactly. At a
 * fractional column edge the clip softens that ring's outer pixel, which those probes were never written for.
 */
const EDITOR_BESIDE_SHEET = { width: 1445, height: 800 };

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
  await expect(dialog.getByRole('heading', { name: 'Recorded work conflicts with the new category' })).toBeVisible();
  await expect(dialog.locator(`[data-conflict-date="${workDate}"]`)).toContainText('clock session');
  const commit = dialog.getByRole('button', { name: 'Confirm and commit' });
  await expect(commit).toBeDisabled();
  await page.screenshot({ path: screenshotPath(`batch-conflict-${testInfo.project.name}-synthetic.png`) });
  await dialog.getByLabel('I confirm the category change for these dates').check();
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
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
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
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
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

/**
 * Round 3 (U-13, U-14, G-1 b): a column is lifted while it is selected for a batch change or open in the Day editor. The look of a
 * lifted column is read from its computed style; the tokens are read from the page, so no colour or shadow value is typed here.
 */
const LIFT_MATRIX = 'matrix(1, 0, 0, 1, 0, -3)';

/** The computed box-shadow of a shadow token, as the browser prints it, so a column's shadow can be compared with it exactly. */
async function tokenShadow(page: Page, token: string): Promise<string> {
  return page.locator('body').evaluate((body, name) => {
    const probe = body.ownerDocument.createElement('span');
    probe.style.boxShadow = `var(${name})`;
    body.append(probe);
    const shadow = body.ownerDocument.defaultView?.getComputedStyle(probe).boxShadow ?? '';
    probe.remove();
    return shadow;
  }, token);
}

interface LiftLook {
  lift: string | null;
  transform: string;
  boxShadow: string;
  backgroundColor: string;
  backgroundImage: string;
  clipPath: string;
  zIndex: string;
  /** Top-left, top-right, bottom-right, bottom-left. */
  radii: [string, string, string, string];
  transitionDuration: string;
}

async function readLook(column: Locator): Promise<LiftLook> {
  return column.evaluate((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return {
      lift: element.getAttribute('data-lift'),
      transform: style?.transform ?? '',
      boxShadow: style?.boxShadow ?? '',
      backgroundColor: style?.backgroundColor ?? '',
      backgroundImage: style?.backgroundImage ?? '',
      clipPath: style?.clipPath ?? '',
      zIndex: style?.zIndex ?? '',
      radii: [style?.borderTopLeftRadius ?? '', style?.borderTopRightRadius ?? '', style?.borderBottomRightRadius ?? '', style?.borderBottomLeftRadius ?? ''] as [string, string, string, string],
      transitionDuration: style?.transitionDuration ?? '',
    };
  });
}

/** A column's look once it has not changed over two reads 400 ms apart (the raise and the colours transition). */
async function settledLook(column: Locator): Promise<LiftLook> {
  let settled = await readLook(column);
  await expect
    .poll(
      async () => {
        const first = await readLook(column);
        await column.page().waitForTimeout(400);
        settled = await readLook(column);
        return JSON.stringify(first) === JSON.stringify(settled);
      },
      { message: 'the column look is settled' },
    )
    .toBe(true);
  return settled;
}

/** What the run position of a lifted column looks like: its clip (the shadow is cut at an inner edge) and its corners (4px on outer corners only). */
const RUN_LOOK = {
  single: { clip: 'none', radii: ['4px', '4px', '4px', '4px'] },
  start: { clip: 'inset(-32px 0px -32px -32px)', radii: ['4px', '0px', '0px', '4px'] },
  mid: { clip: 'inset(-32px 0px)', radii: ['0px', '0px', '0px', '0px'] },
  end: { clip: 'inset(-32px -32px -32px 0px)', radii: ['0px', '4px', '4px', '0px'] },
} as const;

/** A lifted column: raised by --lift-y, casting --elev-lift, above its neighbours, with the corners and the clip of its run position. */
async function expectLifted(page: Page, look: LiftLook, run: keyof typeof RUN_LOOK, label: string) {
  expect(look.lift, `${label}: run position`).toBe(run);
  expect(look.transform, `${label}: raised by --lift-y`).toBe(LIFT_MATRIX);
  expect(look.boxShadow, `${label}: casts --elev-lift`).toBe(await tokenShadow(page, '--elev-lift'));
  expect(look.zIndex, `${label}: above its neighbours`).toBe('1');
  expect(look.clipPath, `${label}: clip of the shadow`).toBe(RUN_LOOK[run].clip);
  expect(look.radii, `${label}: corners (4px on the run's outer corners only)`).toEqual(RUN_LOOK[run].radii);
}

/**
 * True when a pixel of the area (x0..x1, y0..y1, rounded outwards) has the colour: a 1px edge lands on either side of a
 * fractional box edge, so a single pixel is not a reliable probe of it.
 */
async function paintedWithin(page: Page, [x0, x1]: [number, number], [y0, y1]: [number, number], colour: Rgba): Promise<boolean> {
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y += 1) {
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x += 1) if (sameRgb(await paintedPixel(page, x, y), colour, 3)) return true;
  }
  return false;
}

/** The colour of the first colour stop of a background image (a one-colour gradient is a layer), or null when there is none. */
function imageStop(image: string): Rgba | null {
  const stop = /rgba?\([^)]*\)/.exec(image);
  return stop === null ? null : parseColour(stop[0]);
}

test('the day open in the Day editor is a lifted column with an inset 1px accent frame and a filled Day cell (no underline, rails or column fill); the phone row has a 1px frame', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(60_000);
  const desktop = testInfo.project.name === 'desktop';
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await openDay(page, first);
  await expectMarkedOnly(page, first);
  const accentColour = await tokenColour(page, '--accent');
  const headFill = await tokenColour(page, '--day-editing-head');
  const card = await tokenColour(page, '--card');
  expect(headFill[3], 'the Day-cell fill is opaque').toBe(1);

  if (desktop) {
    const column = page.locator(`[data-day="${first}"]`);
    for (const details of [false, true]) {
      if (details) await page.getByRole('switch', { name: 'Show details' }).check();
      await expect(page.locator('[data-detail]')).toHaveCount(details ? 28 : 0);
      await page.mouse.move(0, 0);
      const look = await settledLook(column);
      // Lifted like any lifted column: alone, so a run of one with all four corners at 4px, on the card.
      await expectLifted(page, look, 'single', `editing column (details ${details})`);
      expect(sameRgb(parseColour(look.backgroundColor), card, 0), `the lifted column is on the card: ${look.backgroundColor}`).toBe(true);
      // The old whole-column fill is gone; the frame is a layer over the cells inside the column's box (never clipped).
      expect((await settledPseudo(column, '::before')).content, 'no whole-column fill layer').toBe('none');
      const after = await settledPseudo(column, '::after');
      expect(after.content).toBe('""');
      expect(after.position).toBe('absolute');
      expect(after.pointerEvents).toBe('none');
      expect(Number(after.zIndex)).toBeGreaterThan(0);
      expect(Math.abs(after.width - after.hostClientWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(after.height - after.hostClientHeight)).toBeLessThanOrEqual(1);
      // No side rails: the layer has no border; its one shadow layer is the 1px accent frame, inset.
      expect([after.borderStartWidth, after.borderEndWidth], 'no 2px side rails').toEqual([0, 0]);
      const frame = parseLayers(after.boxShadow).filter((layer) => layer.colour[3] > 0);
      expect(frame.map((layer) => [layer.inset, layer.offsetX, layer.offsetY, layer.spread]), 'one inset 1px frame').toEqual([[true, 0, 0, 1]]);
      expect(sameRgb(frame[0]?.colour ?? [0, 0, 0, 0], accentColour, 0)).toBe(true);
      // The Day cell is filled with --day-editing-head and carries no underline.
      const head = column.locator('.d-day');
      expect(sameRgb(parseColour(await settledStyle(head, 'backgroundColor')), headFill, 0), 'Day cell fill').toBe(true);
      expect(await settledStyle(head, 'boxShadow'), 'no 3px underline under the Day cell').toBe('none');
      // The layer spans from the top of the day head to the bottom of the last row (the subgrid is not disturbed).
      const boxes = await columnBoxes(column);
      expect(boxes.cells.length, 'cells of the column').toBe(details ? 8 : 6);
      const topCell = boxes.cells[0]?.box;
      const last = boxes.cells.at(-1)?.box;
      expect(Math.abs((topCell?.top ?? 0) - boxes.host.top)).toBeLessThanOrEqual(1);
      expect(Math.abs((last?.bottom ?? 0) - boxes.host.bottom)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(after.hostClientHeight - ((last?.bottom ?? 0) - (topCell?.top ?? 0)))).toBeLessThanOrEqual(1.5);
      // No other column is lifted or framed.
      const neighbour = page.locator(`[data-day="${second}"]`);
      const other = await settledLook(neighbour);
      expect([other.lift, other.transform, other.boxShadow, other.clipPath]).toEqual([null, 'none', 'none', 'none']);
      expect((await settledPseudo(neighbour, '::after')).content).toBe('none');
      // The lifted column stands 3px higher than its neighbour (the raise, measured on the boxes).
      const [lifted, flat] = [await columnBoxes(column), await columnBoxes(neighbour)];
      expect(Math.round((flat.host.top - lifted.host.top) * 10) / 10, 'the column is raised by --lift-y').toBe(3);
    }
  } else {
    // Phone: no lift in a table row. The row has a 1px accent frame (inset shadows) and a filled Day cell; the hatching stays.
    for (const details of [false, true]) {
      if (details) {
        await page.keyboard.press('Escape');
        await page.getByRole('switch', { name: 'Show details' }).check();
        await openDay(page, first);
      }
      await expectMarkedOnly(page, first);
      await expect(page.locator(`tr[data-day="${first}"]`)).not.toHaveAttribute('data-lift', /.*/);
      expect(await settledStyle(page.locator(`tr[data-day="${first}"]`), 'boxShadow'), 'a row is not lifted').toBe('none');
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
          ...(index === 0 ? ['inset 1,0'] : []),
          ...(index === 3 ? ['inset -1,0'] : []),
          'inset 0,1',
          ...(details ? [] : ['inset 0,-1']),
        ].sort();
        expect(sides, `frame of cell ${index} (details ${details})`).toEqual(expected);
        for (const layer of frame) expect(sameRgb(layer.colour, accentColour, 0)).toBe(true);
        // No whole-row fill layer: a workday cell has no background image; only the Day cell is filled.
        expect(await settledStyle(cell, 'backgroundImage'), `no fill layer over cell ${index}`).toBe('none');
        const fill = parseColour(await settledStyle(cell, 'backgroundColor'));
        expect(sameRgb(fill, headFill, 0) && fill[3] === 1, `cell ${index} is ${index === 0 ? '' : 'not '}filled with --day-editing-head`).toBe(index === 0);
      }
      if (details) {
        const detail = page.locator(`tr[data-day="${first}"] + tr.sheet-detail-row.editing-detail > td`);
        await expect(detail).toHaveCount(1);
        const closing = parseLayers(await settledStyle(detail, 'boxShadow')).filter((layer) => layer.colour[3] > 0);
        expect(closing.map((layer) => `${layer.offsetX},${layer.offsetY}`).sort()).toEqual(['-1,0', '0,-1', '1,0']);
        // Only the editing day's detail row joins the frame.
        await expect(page.locator('tr.editing-detail')).toHaveCount(1);
      } else {
        await expect(page.locator('tr.editing-detail')).toHaveCount(0);
      }
    }
    // The hatching of a non-working day stays on the cells, and the Day cell is filled over its colour.
    await page.keyboard.press('Escape');
    const { nonworking } = await shownPeriod(employeeSeed);
    const off = nonworking[0] ?? '';
    expect(off, 'a non-working day in the shown period').not.toBe('');
    await openDay(page, off);
    const offCells = page.locator(`tr[data-day="${off}"] > td`);
    for (const index of [0, 1]) expect(await settledStyle(offCells.nth(index), 'backgroundImage'), `hatching on cell ${index}`).toMatch(/^repeating-linear-gradient\(/);
    expect(sameRgb(parseColour(await settledStyle(offCells.first(), 'backgroundColor')), headFill, 0), 'the Day cell of a non-working row is filled').toBe(true);
  }
});

/**
 * The colour actually painted: the 1px frame over the opaque day head and over an attention cell, the Day-cell fill, and no
 * underline, rails or column fill. Read from screenshots in both themes (desktop only: on a phone the modal sheet and its scrim
 * cover the page while the editor is open).
 */
test('desktop: the inset frame and the Day-cell fill are painted over every cell, there is no underline, rail or column fill, and a neighbouring day is left alone, in both themes', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(120_000);
  const project = testInfo.project.name;
  if (project === 'desktop') await page.setViewportSize(EDITOR_BESIDE_SHEET);
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
      const headFill = await tokenColour(page, '--day-editing-head');
      const column = page.locator(`[data-day="${first}"]`);
      const neighbour = page.locator(`[data-day="${second}"]`);
      await bringIntoView(page, column);
      await settledLook(column);
      const boxes = await columnBoxes(column);
      // The attention cell (a past workday without a session) is among the cells, and so is the head.
      expect(boxes.cells.some((cell) => cell.className.includes('attention')), 'an attention cell in the column').toBe(true);
      for (const cell of boxes.cells) {
        const y = Math.floor(cell.box.top + cell.box.height / 2);
        expect(await paintedWithin(page, [boxes.host.left, boxes.host.left + 1], [y, y], accent), `${appearance.name}: left frame over "${cell.className}" (details ${details})`).toBe(true);
        expect(await paintedWithin(page, [boxes.host.right - 3, boxes.host.right - 1], [y, y], accent), `${appearance.name}: right frame over "${cell.className}" (details ${details})`).toBe(true);
        // No 2px rail: the pixels three and four columns in are the cell's own colour, not accent.
        expect(await paintedWithin(page, [boxes.host.left + 3, boxes.host.left + 4], [y, y], accent), `${appearance.name}: no rail beside the frame over "${cell.className}"`).toBe(false);
      }
      const head = boxes.cells[0]?.box;
      const headMiddle = Math.floor((head?.top ?? 0) + (head?.height ?? 0) / 2);
      const middle = Math.floor((head?.left ?? 0) + (head?.width ?? 0) / 2);
      // The top and bottom edges of the frame are painted too (the layer is inset in the column's box, never clipped).
      expect(await paintedWithin(page, [middle, middle], [boxes.host.top, boxes.host.top + 1], accent), `${appearance.name}: top frame over the head`).toBe(true);
      const last = boxes.cells.at(-1)?.box;
      expect(await paintedWithin(page, [middle, middle], [(last?.bottom ?? 0) - 2, (last?.bottom ?? 0) - 1], accent), `${appearance.name}: bottom frame`).toBe(true);
      // The Day cell is filled (a corner of the head, where no text is) and has no underline.
      expect(sameRgb(await paintedPixel(page, Math.ceil(boxes.host.left) + 4, headMiddle), headFill, 3), `${appearance.name}: the Day cell is filled`).toBe(true);
      expect(sameRgb(await paintedPixel(page, middle, Math.floor((head?.top ?? 0) + (head?.height ?? 0) - 2)), accent), `${appearance.name}: no underline under the Day cell`).toBe(false);
      // The frame is a layer over the column, not a property of the cells: the same pixels of the neighbouring day are not accent.
      await bringIntoView(page, neighbour);
      const other = await columnBoxes(neighbour);
      const otherHead = other.cells[0]?.box;
      const otherY = Math.floor((otherHead?.top ?? 0) + (otherHead?.height ?? 0) / 2);
      expect(sameRgb(await paintedPixel(page, Math.ceil(other.host.left), otherY), accent), `${appearance.name}: neighbour head edge`).toBe(false);
      // Nothing fills the column body: its OT corner is the neighbour's, the card colour.
      const bare = await otCorner(page, neighbour);
      const filled = await otCorner(page, column);
      expect(sameRgb(filled, bare, 3), `${appearance.name}: the open column has no fill over its body: ${filled.join(',')} against ${bare.join(',')}`).toBe(true);
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
  test(`no sideways scroll at ${width}px with detail rows, the selection tint, and the editing frame`, async ({ page, employeeSeed, signInThroughUi }) => {
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
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
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

test('a batch-selected column is lifted with the selection tint and the checked box, with no ring, in both themes; a phone row keeps its tint without a lift', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(90_000);
  const desktop = testInfo.project.name === 'desktop';
  const [first = '', second = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Change several days' }).click();
  await page.getByLabel(`Select ${first}`).check();
  const unit = page.locator(`[data-day="${first}"]`);
  await expect(unit).toHaveClass(/\bselected\b/);
  await expect(page.locator('[data-day].selected')).toHaveCount(1);
  // The checked selection box stays the state indicator, on both layouts.
  await expect(page.getByLabel(`Select ${first}`)).toBeChecked();
  await expect(page.getByLabel(`Select ${second}`)).not.toBeChecked();
  if (!desktop) {
    // A phone row is tinted and has no lift: a table row does not rise.
    await expect(unit).not.toHaveAttribute('data-lift', /.*/);
    expect(await settledStyle(unit, 'boxShadow'), 'a row is not lifted').toBe('none');
    const tint = await tokenColour(page, '--day-selected');
    const dayCell = unit.locator(':scope > td').first();
    expect(sameRgb(parseColour(await settledStyle(dayCell, 'backgroundColor')), tint, 0), 'the row carries the selection tint').toBe(true);
    expect(Math.abs(parseColour(await settledStyle(dayCell, 'backgroundColor'))[3] - tint[3])).toBeLessThan(0.01);
    return;
  }
  for (const appearance of APPEARANCES) {
    await applyAppearance(page, appearance);
    const tint = await tokenColour(page, '--day-selected');
    const accent = await tokenColour(page, '--accent');
    const card = await tokenColour(page, '--card');
    const look = await settledLook(unit);
    await expectLifted(page, look, 'single', `${appearance.name}: selected column`);
    // The card background with the tint over it (a gradient layer), so the column reads as raised.
    expect(sameRgb(parseColour(look.backgroundColor), card, 0), `${appearance.name}: card background ${look.backgroundColor}`).toBe(true);
    const layer = imageStop(look.backgroundImage);
    expect(layer, `${appearance.name}: tint layer ${look.backgroundImage}`).not.toBeNull();
    expect(sameRgb(layer ?? [0, 0, 0, 0], tint, 0)).toBe(true);
    expect(Math.abs((layer?.[3] ?? 0) - tint[3])).toBeLessThan(0.01);
    // No ring: the 2px inset accent layer is gone (a selected column that is not today has no marker layer at all).
    expect((await settledPseudo(unit, '::after')).content, `${appearance.name}: no ring layer`).toBe('none');
    await bringIntoView(page, unit);
    const boxes = await columnBoxes(unit);
    for (const cell of boxes.cells) {
      const y = Math.floor(cell.box.top + cell.box.height / 2);
      expect(await paintedWithin(page, [boxes.host.left, boxes.host.left + 2], [y, y], accent), `${appearance.name}: no accent ring at the left edge over "${cell.className}"`).toBe(false);
      expect(await paintedWithin(page, [boxes.host.right - 3, boxes.host.right - 1], [y, y], accent), `${appearance.name}: no accent ring at the right edge over "${cell.className}"`).toBe(false);
    }
    // The tint is painted over the card: the OT corner of the column differs from the unselected neighbour's by the tint.
    const bare = await otCorner(page, page.locator(`[data-day="${second}"]`));
    const tinted = await otCorner(page, unit);
    const expected = over(tint, bare);
    expect(sameRgb(tinted, expected, 4), `${appearance.name}: tint ${tinted.join(',')} over ${bare.join(',')} should be about ${expected.map(Math.round).join(',')}`).toBe(true);
    expect(sameRgb(tinted, bare, 0), `${appearance.name}: the tint changes the pixel`).toBe(false);
  }
  await applyAppearance(page, APPEARANCES[0] as Appearance);
  await bringIntoView(page, unit);
  await page.screenshot({ path: screenshotPath('batch-lift-desktop-light-synthetic.png'), animations: 'disabled' });
});

test('the Today bar is painted over the day head, with the Today tag, and stays with batch selection and the editing marker', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(90_000);
  const desktop = testInfo.project.name === 'desktop';
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
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

    // With batch selection: the column is lifted and the bar stays over the head; the ring is gone.
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByLabel(`Select ${today}`).check();
    await expect(unit).toHaveClass(/\bselected\b/);
    await expectLifted(page, await settledLook(unit), 'single', 'today, selected');
    const both = parseLayers((await settledPseudo(unit, '::after')).boxShadow).filter((layer) => layer.colour[3] > 0);
    expect(both.map((layer) => [layer.inset, layer.offsetY, layer.spread]), 'the Today bar alone: no batch ring layer').toEqual([[true, 3, 0]]);
    await bringIntoView(page, unit);
    const accent = await tokenColour(page, '--accent');
    const selectedBoxes = await columnBoxes(unit);
    const selectedHead = selectedBoxes.cells[0]?.box;
    const centre = Math.floor((selectedHead?.left ?? 0) + (selectedHead?.width ?? 0) / 2);
    const rowY = Math.floor((selectedHead?.top ?? 0) + (selectedHead?.height ?? 0) / 2);
    expect(await paintedWithin(page, [centre, centre], [selectedBoxes.host.top, selectedBoxes.host.top + 1], accent), 'Today bar with batch selection').toBe(true);
    expect(await paintedWithin(page, [selectedBoxes.host.left, selectedBoxes.host.left + 2], [rowY, rowY], accent), 'no ring over the head').toBe(false);
    await page.screenshot({ path: screenshotPath('today-bar-batch-desktop-light-synthetic.png'), animations: 'disabled' });
    await applyAppearance(page, APPEARANCES[1] as Appearance);
    await bringIntoView(page, unit);
    await page.screenshot({ path: screenshotPath('today-bar-batch-desktop-dark-synthetic.png'), animations: 'disabled' });
    await applyAppearance(page, APPEARANCES[0] as Appearance);

    // With the editor open as well: all three states on one column (tint, lift, frame, head fill, checked box, and the Today bar).
    await openDay(page, today);
    await expect(unit).toHaveClass(/\btoday\b/);
    await expect(unit).toHaveClass(/\bselected\b/);
    await expect(unit).toHaveClass(/\bediting\b/);
    await expect(page.getByLabel(`Select ${today}`)).toBeChecked();
    await expectLifted(page, await settledLook(unit), 'single', 'today, selected and open');
    const all = await settledPseudo(unit, '::after');
    expect([all.borderStartWidth, all.borderEndWidth], 'no rails').toEqual([0, 0]);
    expect(
      parseLayers(all.boxShadow)
        .filter((layer) => layer.colour[3] > 0)
        .map((layer) => [layer.offsetY, layer.spread])
        .sort(),
    ).toEqual([
      [0, 1],
      [3, 0],
    ]);
    await expectMarkedOnly(page, today);
    await bringIntoView(page, unit);
    const headFill = await tokenColour(page, '--day-editing-head');
    const allBoxes = await columnBoxes(unit);
    const allHead = allBoxes.cells[0]?.box;
    const allCentre = Math.floor((allHead?.left ?? 0) + (allHead?.width ?? 0) / 2);
    expect(await paintedWithin(page, [allCentre, allCentre], [allBoxes.host.top, allBoxes.host.top + 1], accent), 'Today bar with all three states').toBe(true);
    // The Day cell is filled under the bar, and there is no underline.
    expect(sameRgb(await paintedPixel(page, Math.ceil(allBoxes.host.left) + 4, Math.floor((allHead?.top ?? 0) + (allHead?.height ?? 0) / 2)), headFill, 3), 'Day cell fill').toBe(true);
    expect(sameRgb(await paintedPixel(page, allCentre, Math.floor((allHead?.bottom ?? 0) - 2)), accent), 'no underline under the Day cell').toBe(false);
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
    // And with the editor open: the 3px rail leads, with the 1px frame above and below.
    await page.getByRole('button', { name: 'Change several days' }).click();
    await openDay(page, today);
    await expectMarkedOnly(page, today);
    const framed = parseLayers(await settledStyle(first, 'boxShadow'))
      .filter((layer) => layer.colour[3] > 0)
      .map((layer) => `${layer.offsetX},${layer.offsetY}`)
      .sort();
    expect(framed).toEqual(['0,-1', '0,1', '3,0']);
  }
});

interface EditingSurfaces {
  /** The colour of the 1px frame. */
  frame: Rgba;
  /** What lies under a body cell: the card or the non-working tint. */
  bodies: Rgba[];
  /** The Day cell, filled with --day-editing-head. */
  heads: Rgba[];
  /** The amber cell. */
  attention: Rgba[];
}

/** The surfaces of the day open in the editor, composited from the computed styles of the cells and layers. */
async function editingSurfaces(page: Page, desktop: boolean, workDate: string): Promise<EditingSurfaces> {
  await page.mouse.move(0, 0);
  if (desktop) {
    const host = page.locator(`[data-day="${workDate}"]`);
    // The lifted column has its own opaque surface: the card, or the non-working tint.
    const base = over(parseColour(await computedStyle(host, 'backgroundColor')), backdropOf(await backdropsAbove(host)));
    const frame = parseLayers((await readPseudo(host, '::after')).boxShadow).filter((layer) => layer.colour[3] > 0);
    const head = over(parseColour(await computedStyle(host.locator('.d-day'), 'backgroundColor')), base);
    const attention = host.locator('.d-time.attention');
    return {
      frame: frame[0]?.colour ?? [0, 0, 0, 0],
      bodies: [base],
      heads: [head],
      attention: (await attention.count()) === 0 ? [] : [over(parseColour(await computedStyle(attention, 'backgroundColor')), base)],
    };
  }
  const cells = page.locator(`tr[data-day="${workDate}"] > td`);
  const frame = parseLayers(await computedStyle(cells.first(), 'boxShadow')).filter((layer) => layer.colour[3] > 0);
  const bodies: Rgba[] = [];
  const heads: Rgba[] = [];
  const amber: Rgba[] = [];
  for (const [index, cell] of (await cells.all()).entries()) {
    const under = over(parseColour(await computedStyle(cell, 'backgroundColor')), backdropOf(await backdropsAbove(cell)));
    // A hatching layer is nearly transparent; a cell without an image is just its colour.
    const image = imageStop(await computedStyle(cell, 'backgroundImage'));
    const surface = image === null ? under : over(image, under);
    if (((await cell.getAttribute('class')) ?? '').includes('attention')) amber.push(surface);
    else if (index === 0) heads.push(surface);
    else bodies.push(surface);
  }
  return { frame: frame[0]?.colour ?? [0, 0, 0, 0], bodies, heads, attention: amber };
}

test('the frame and text keep their contrast on every surface of the editing day: card, non-working, Day cell and amber, in both themes and both manual choices', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(90_000);
  const desktop = testInfo.project.name === 'desktop';
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
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
      // The 1px frame is inset, so it sits on the column's own surfaces; they settle after the raise and the colours transition.
      if (desktop) await settledLook(page.locator(`[data-day="${workDate}"]`));
      const surfaces = await editingSurfaces(page, desktop, workDate);
      // SC 1.4.11: the frame against every surface it crosses is at least 3:1.
      const crossed = [...surfaces.bodies, ...surfaces.heads, ...surfaces.attention];
      expect(surfaces.frame[3], `${appearance.name}, ${workDate}: a frame is painted`).toBeGreaterThan(0);
      const frameMin = Math.min(...crossed.map((surface) => contrast(surfaces.frame, surface)));
      expect(frameMin, `${appearance.name}, ${workDate}: frame against its worst surface`).toBeGreaterThanOrEqual(3);
      // SC 1.4.3: text on the worst body surface (the non-working tint) is at least 4.5:1.
      let textMin = Infinity;
      for (const token of ['--text', '--muted', '--ok', '--warn', '--error', '--accent']) {
        const colour = await tokenColour(page, token);
        for (const surface of surfaces.bodies) textMin = Math.min(textMin, contrast(colour, surface));
        for (const surface of surfaces.bodies) expect(contrast(colour, surface), `${appearance.name}, ${workDate}: ${token} on ${surface.map(Math.round).join(',')}`).toBeGreaterThanOrEqual(4.5);
      }
      // The Day cell carries the day name and the date (a phone's date is muted text): both read on its fill.
      for (const token of desktop ? ['--text'] : ['--text', '--muted']) {
        const headText = await tokenColour(page, token);
        for (const surface of surfaces.heads) expect(contrast(headText, surface), `${appearance.name}, ${workDate}: ${token} on the Day-cell fill ${surface.map(Math.round).join(',')}`).toBeGreaterThanOrEqual(4.5);
      }
      const ink = await tokenColour(page, '--attention-ink');
      for (const surface of surfaces.attention) {
        expect(contrast(ink, surface), `${appearance.name}, ${workDate}: attention text on the amber cell`).toBeGreaterThanOrEqual(4.5);
      }
      notes.push(`${appearance.name} ${workDate === dayOff ? 'non-working' : 'workday'}: frame ${frameMin.toFixed(2)}:1, text ${textMin.toFixed(2)}:1`);
    }
  }
  await applyAppearance(page, APPEARANCES[0] as Appearance);
  testInfo.annotations.push({ type: 'editing-contrast', description: notes.join('; ') });
  for (const note of notes) console.log(`editing contrast (${testInfo.project.name}) ${note}`);
});


/* ---- WP5-UX3-T05: lift runs, picker above a lifted neighbour, widths, reduced motion, the names (U-13 .. U-16, R-UX2A-4, R-UX2A2-3) ------ */

test('lifted columns form runs: one shadow around the group, 4px corners on the outer corners only, no shadow on a lifted neighbour, a gap ends the run', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(90_000);
  const desktop = testInfo.project.name === 'desktop';
  if (desktop) await page.setViewportSize(EDITOR_BESIDE_SHEET);
  const { dates } = await shownPeriod(employeeSeed);
  // The first band is Monday to Sunday: Mon, Tue and Wed form a run, Thu is a gap, Fri stands alone.
  const [monday = '', tuesday = '', wednesday = '', thursday = '', friday = ''] = dates;
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Change several days' }).click();
  for (const date of [monday, tuesday, wednesday, friday]) await page.getByLabel(`Select ${date}`).check();
  await expect(page.locator('[data-day].selected')).toHaveCount(4);
  if (!desktop) {
    // A table row does not lift: no run position anywhere on the phone.
    await expect(page.locator('[data-lift]')).toHaveCount(0);
    return;
  }
  const column = (date: string) => page.locator(`[data-day="${date}"]`);
  await page.mouse.move(0, 0);
  const looks = {
    monday: await settledLook(column(monday)),
    tuesday: await settledLook(column(tuesday)),
    wednesday: await settledLook(column(wednesday)),
    thursday: await settledLook(column(thursday)),
    friday: await settledLook(column(friday)),
  };
  await expectLifted(page, looks.monday, 'start', 'Monday (run start)');
  await expectLifted(page, looks.tuesday, 'mid', 'Tuesday (run middle)');
  await expectLifted(page, looks.wednesday, 'end', 'Wednesday (run end)');
  await expectLifted(page, looks.friday, 'single', 'Friday (alone after a gap)');
  expect([looks.thursday.lift, looks.thursday.transform, looks.thursday.boxShadow], 'the gap day is not lifted').toEqual([null, 'none', 'none']);
  // The editor column beside the run takes its place in it: opening Tuesday adds the frame to the middle of the run, nothing else changes.
  await openDay(page, tuesday);
  await expectMarkedOnly(page, tuesday);
  await expectLifted(page, await settledLook(column(tuesday)), 'mid', 'Tuesday, open (inside the run)');
  await expectLifted(page, await settledLook(column(monday)), 'start', 'Monday, with Tuesday open');
  await expectLifted(page, await settledLook(column(wednesday)), 'end', 'Wednesday, with Tuesday open');
  // The frame sits on the inset layer, so the clip of the run's inner edges never cuts it: both inner edges of the open middle
  // column are accent, over the head and over the body.
  await page.mouse.move(0, 0);
  await bringIntoView(page, column(tuesday));
  const accent = await tokenColour(page, '--accent');
  const openBoxes = await columnBoxes(column(tuesday));
  for (const cell of [openBoxes.cells[0], openBoxes.cells[2]]) {
    const cellY = Math.floor((cell?.box.top ?? 0) + (cell?.box.height ?? 0) / 2);
    expect(await paintedWithin(page, [openBoxes.host.left, openBoxes.host.left + 1], [cellY, cellY], accent), `frame at the left inner edge over "${cell?.className}"`).toBe(true);
    expect(await paintedWithin(page, [openBoxes.host.right - 3, openBoxes.host.right - 1], [cellY, cellY], accent), `frame at the right inner edge over "${cell?.className}"`).toBe(true);
  }

  // Painted: the group has one shadow outside and none on a neighbour. Monday's right edge is under Tuesday's shadow when the
  // shadows overlap: a pixel near that edge differs from the same column's own colour farther in.
  await page.mouse.move(0, 0);
  await bringIntoView(page, column(monday));
  const mondayBoxes = await columnBoxes(column(monday));
  const ot = mondayBoxes.cells.find((cell) => cell.className.includes('d-ot'))?.box;
  expect(ot, 'the OT cell of Monday').toBeDefined();
  const y = Math.floor((ot?.top ?? 0) + (ot?.height ?? 0) / 2);
  const inside = await paintedPixel(page, Math.ceil(mondayBoxes.host.left) + 6, y);
  const atSeam = await paintedPixel(page, Math.floor(mondayBoxes.host.right) - 4, y);
  expect(sameRgb(atSeam, inside, 2), `Monday near the seam ${atSeam.join(',')} is its own colour ${inside.join(',')}: Tuesday's shadow is not on it`).toBe(true);
  // The shadow outside the group is there: left of Monday (the row-label column) is darker than that column's plain surface.
  const surface = await tokenColour(page, '--sheet-head');
  const outside = await paintedPixel(page, Math.floor(mondayBoxes.host.left) - 4, y);
  expect(sameRgb(outside, surface, 1), `left of the run ${outside.join(',')} carries the group's shadow, not the plain ${surface.map(Math.round).join(',')}`).toBe(false);
  await page.screenshot({ path: screenshotPath('lift-runs-desktop-light-synthetic.png'), animations: 'disabled' });
});

test('an open label picker stays above a lifted neighbour: the list of one column covers the open (lifted) column beside it', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The lifted editing column and the picker are the desktop sheet');
  await page.setViewportSize(EDITOR_BESIDE_SHEET);
  const { dates } = await shownPeriod(employeeSeed);
  // Tuesday's list opens to the right over Wednesday, which is the open (lifted) column.
  const [, tuesday = '', wednesday = ''] = dates;
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await openDay(page, wednesday);
  await expectMarkedOnly(page, wednesday);
  await page.mouse.move(0, 0);
  const open = page.locator(`[data-day="${wednesday}"]`);
  expect((await settledLook(open)).zIndex, 'the open column is lifted (layer 1)').toBe('1');
  await page.locator(`[data-label-picker="${tuesday}"] .label-trigger`).click();
  const list = page.locator(`[data-label-picker="${tuesday}"] .label-list`);
  await expect(list).toBeVisible();
  const raised = await page.locator(`[data-day="${tuesday}"]`).evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).zIndex);
  expect(raised, 'the column with the open list is above the lifted layer').toBe('2');
  const [listBox, openBox] = [await list.boundingBox(), await open.boundingBox()];
  expect((listBox?.x ?? 0) + (listBox?.width ?? 0), 'the list reaches over the lifted column').toBeGreaterThan((openBox?.x ?? 0) + 8);
  const covered = await list.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const doc = element.ownerDocument;
    const points = [0.1, 0.5, 0.9].flatMap((x) => [0.15, 0.5, 0.85].map((y) => [box.left + box.width * x, box.top + box.height * y] as const));
    return points.filter(([x, y]) => doc.elementFromPoint(x, y)?.closest('.label-list') === null).length;
  });
  expect(covered, 'points of the open list that the lifted column covers').toBe(0);
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
});

for (const width of [768, 1024, 1280]) {
  test(`no sideways scroll at ${width}px with a lifted run of three and the editing column`, async ({ page, employeeSeed, signInThroughUi }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    const { dates } = await shownPeriod(employeeSeed);
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await expect(page.locator('[data-sheet="desktop"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Change several days' }).click();
    for (const date of dates.slice(0, 3)) await page.getByLabel(`Select ${date}`).check();
    await expect(page.locator('[data-day][data-lift]')).toHaveCount(3);
    await expectNoSidewaysScroll(page, `a lifted run of three, ${width}px`);
    await openDay(page, dates[1] ?? '');
    await expect(page.locator('[data-day][data-editing][data-lift="mid"]')).toHaveCount(1);
    await expectNoSidewaysScroll(page, `the editing column inside the run, ${width}px`);
    await page.keyboard.press('Escape');
    await expectNoSidewaysScroll(page, `the run alone again, ${width}px`);
  });
}

test('reduced motion: a lifted column is static, its transition lasts no longer than 0.01 ms', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'A table row has no lift');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const [first = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Change several days' }).click();
  await page.getByLabel(`Select ${first}`).check();
  const unit = page.locator(`[data-day="${first}"]`);
  // The raise is applied at once (no animation to wait for), and every transitioned property is at most 0.01 ms.
  await expect.poll(async () => (await readLook(unit)).transform, { timeout: 1500 }).toBe(LIFT_MATRIX);
  const durations = (await readLook(unit)).transitionDuration.split(',').map((part) => parseFloat(part));
  expect(durations.length, 'the column transitions its properties').toBeGreaterThan(0);
  for (const seconds of durations) expect(seconds, `transition duration ${seconds}s`).toBeLessThanOrEqual(0.00001);
});

test('the rows are named Category and Status; a picker is named by every visible line of its cell (G-2 a, U-16, R-UX2A2-3)', async ({ page, signInThroughUi }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  if (desktop) {
    for (const week of await page.locator('.sheet-week .row-labels').all()) {
      await expect(week.locator(':scope > div')).toHaveText(['Day', 'Date', 'Category', 'Time', 'OT (h:mm)', 'Status']);
    }
    // The screen-reader row name of the status cell is "Status".
    const named = page.locator('[data-cell="check"] .sr-only').first();
    await expect(named).toHaveText('Status:');
  } else {
    await expect(page.locator('.sheet-table').first().locator('thead th')).toHaveText(['Day', 'Category', 'Time', 'OT']);
  }
  await expect(page.locator('.sheet').getByText('Label', { exact: true })).toHaveCount(0);
  // Every picker: "Category for {date}: " and each line the cell shows (the label, the lines under it, the note marker), in order.
  const triggers = await page.locator('[data-label-picker] button.label-trigger').evaluateAll((buttons) =>
    buttons.map((button) => ({
      name: button.getAttribute('aria-label') ?? '',
      date: button.closest('[data-label-picker]')?.getAttribute('data-label-picker') ?? '',
      hasLabel: button.querySelector('.cell-main') !== null,
      lines: [...button.querySelectorAll('.cell-main, .cell-sub, .cell-note')].map((line) => (line.textContent ?? '').trim()),
    })),
  );
  expect(triggers, 'a picker for each day').toHaveLength(14);
  for (const trigger of triggers) {
    // A cell without a label shows only its lines; the name says "not set" in the label's place.
    const parts = trigger.hasLabel ? trigger.lines : ['not set', ...trigger.lines];
    expect(trigger.name, `picker name of ${trigger.date}`).toBe(`Category for ${trigger.date}: ${parts.join(', ')}`);
  }
});

test('the day buttons are named by their visible text, so the name contains the label (SC 2.5.3, axe label-content-name-mismatch, R-UX2A-4)', async ({ page, signInThroughUi }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const buttons = await page.locator('[data-sheet] [data-day-button]').evaluateAll((elements) =>
    elements.map((element) => ({ visible: element.textContent ?? '', name: element.getAttribute('aria-label') ?? '' })),
  );
  expect(buttons).toHaveLength(14);
  // axe compares the visible text with the accessible name without case and punctuation; the same rule here.
  const plain = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  for (const button of buttons) {
    expect(plain(button.name), `the name "${button.name}" contains the visible text "${button.visible}"`).toContain(plain(button.visible));
    // The phone button shows the weekday and the date: a real space separates them ("Mon 09/28", not "Mon09/28").
    expect(button.visible, 'the visible text of the day button').toMatch(desktop ? /^\d{2}\/\d{2}$/ : /^[A-Z][a-z]{2} \d{2}\/\d{2}$/);
  }
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
