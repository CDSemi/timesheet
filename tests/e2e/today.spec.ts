import type { Locator, Page } from '@playwright/test';
import { backdropOf, backdropsAbove, computedStyle, contrast, focusFromKeyboard, measureFocusRing, over, parseColour, settledStyle } from './contrast.ts';
import { dayButton } from './dayButton.ts';
import { expect, newPerson, type PeriodFacts, type PeriodsCurrent, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T04: the "Today" and "Current period" buttons of the period bar, on both projects.
 *
 * Every date comes from the server (`GET /api/periods/current`, read through `periodsCurrent()`), never from the browser
 * clock or the device zone: the browser runs in Asia/Ho_Chi_Minh on purpose while the saved reporting zone is
 * America/Los_Angeles, so a button that read the device date would show the wrong day. The page opens on the R-07 `current`
 * period; on the five days after a period ends that is the ended period, and the period that contains today is `in_progress`.
 * A branch that depends on this (`window`) is chosen from server values, and the other branch's opposite fact is asserted in
 * the same test; nothing is skipped.
 */
test.use({ locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh' });

test.beforeEach(({ page }) => {
  // A CSP violation shows up as a console error; nothing else is expected on these pages.
  // The signed-out probe answers 401 by design; nothing else is expected.
  page.on('console', (message) => {
    const expected = /status of 401/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

/* ---- Helpers --------------------------------------------------------------------------------------------- */

/** `2026-10-14` as `10/14/2026` (the US form of docs/04), spelled out here as an oracle independent of the app. */
function us(date: string): string {
  return `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
}

/** The weekday of an accounting date, from the runtime (not from the app). */
function weekday(date: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

/** The announced range: the live-region texts keep the word "to". */
const plainRange = (period: PeriodFacts) => `${us(period.period_start)} to ${us(period.period_end)}`;
/**
 * The text content of the period bar title (WP5-UX2-T04 Addendum 2): the two dates, the decorative arrow and the hidden " to ". Screen
 * readers skip the arrow (`aria-hidden`) and read "10/12/2026 to 10/25/2026", which `expectBarRange` checks separately.
 */
const rangeText = (period: PeriodFacts) => `${us(period.period_start)}→ to ${us(period.period_end)}`;
const contains = (period: PeriodFacts, date: string) => period.period_start <= date && date <= period.period_end;
/** True on the five days after a period ends: the period the page opens on is not the one that contains today. */
const isWindow = (periods: PeriodsCurrent) => periods.current.payroll_date !== periods.in_progress.payroll_date;

const bar = (page: Page) => page.locator('.period-bar');
const todayButton = (page: Page) => bar(page).getByRole('button', { name: 'Today', exact: true });
const currentButton = (page: Page) => bar(page).getByRole('button', { name: 'Current period', exact: true });
const reviewLink = (page: Page) => bar(page).locator('[data-review-link]');
const nextButton = (page: Page) => bar(page).getByRole('button', { name: 'Next period', exact: true });
const previousButton = (page: Page) => bar(page).getByRole('button', { name: 'Previous period', exact: true });
const periodName = (page: Page) => bar(page).locator('.period-name');
const jumpStatus = (page: Page) => page.locator('[data-period-jump-status]');
const editor = (page: Page) => page.locator('[data-day-editor]');

async function landOn(page: Page, signIn: () => Promise<void>) {
  await signIn();
  await expect(page.locator('[data-day]')).toHaveCount(14);
}

/** The sheet shows this period (its name in the bar) and, when it contains `today`, only that day carries the Today tag. */
async function expectShown(page: Page, period: PeriodFacts, today: string) {
  await expect(periodName(page)).toHaveText(rangeText(period));
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const showsToday = contains(period, today);
  await expect(page.locator('[data-sheet] .today-tag')).toHaveCount(showsToday ? 1 : 0);
  await expect(page.locator(`[data-day="${today}"]`)).toHaveCount(showsToday ? 1 : 0);
  if (showsToday) await expect(page.locator(`[data-day="${today}"].today`)).toHaveCount(1);
}

/** Today is inactive (aria-disabled, still focusable, with its reason as description) or active. */
async function expectTodayActive(page: Page, active: boolean) {
  const button = todayButton(page);
  if (active) {
    await expect(button).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(button).toHaveAccessibleDescription("Opens the period that contains today's date");
  } else {
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAccessibleDescription('Already showing today');
  }
  // Either way it is a real, focusable button (never `disabled`), and its name is its visible text.
  await expect(button).toHaveJSProperty('disabled', false);
  await expect(button).toHaveAccessibleName('Today');
}

async function expectNoSidewaysScroll(page: Page, where: string) {
  const widths = await page.evaluate<{ scroll: number; client: number }>(
    '({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })',
  );
  expect(widths.scroll, `${where}: no horizontal scroll (scrollWidth ${widths.scroll} <= clientWidth ${widths.client})`).toBeLessThanOrEqual(widths.client);
}

/* ---- Landing ----------------------------------------------------------------------------------------------- */

test('landing: the page opens on the current period, Current period is absent, and Today is inactive exactly when the sheet shows today', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const periods = await employeeSeed.periodsCurrent();
  await landOn(page, signInThroughUi);
  await expectShown(page, periods.current, periods.today_local);
  await expect(currentButton(page)).toHaveCount(0);
  // The announcement region is persistent: present from load, empty until a jump, a polite atomic live region without role="status".
  await expect(jumpStatus(page)).toHaveCount(1);
  await expect(jumpStatus(page)).toHaveText('');
  await expect(jumpStatus(page)).toHaveAttribute('aria-live', 'polite');
  await expect(jumpStatus(page)).toHaveAttribute('aria-atomic', 'true');
  await expect(jumpStatus(page)).not.toHaveAttribute('role', /.*/);
  const showsToday = contains(periods.current, periods.today_local);
  // The branch comes from server values; the other branch's opposite fact is asserted with it.
  if (isWindow(periods)) {
    expect(showsToday, 'in the window the opening period is the ended one and lacks today').toBe(false);
    expect(contains(periods.in_progress, periods.today_local), 'in_progress contains today').toBe(true);
  } else {
    expect(showsToday, 'outside the window the opening period contains today').toBe(true);
    expect(periods.in_progress.payroll_date).toBe(periods.current.payroll_date);
  }
  await expectTodayActive(page, !showsToday);
});

/* ---- Both branches -------------------------------------------------------------------------------------- */

test('Today opens the period that contains today (Current period appears only in the window and returns to the opening period)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const periods = await employeeSeed.periodsCurrent();
  const today = periods.today_local;
  await landOn(page, signInThroughUi);

  if (isWindow(periods)) {
    // Window: the opening period is the ended one. Today opens the period in progress.
    await expect(todayButton(page)).not.toHaveAttribute('aria-disabled', /.*/);
    await todayButton(page).click();
    await expectShown(page, periods.in_progress, today);
    await expect(page.locator(`[data-day="${today}"]`)).toBeInViewport();
    await expect(currentButton(page)).toHaveCount(1);
    await expect(jumpStatus(page)).toHaveText(`Showing today, ${weekday(today)} ${us(today)}, in the period ${plainRange(periods.in_progress)}`);
    await expect(jumpStatus(page)).toHaveAttribute('aria-live', 'polite');
    await expect(jumpStatus(page)).not.toHaveAttribute('role', /.*/);
    await expectTodayActive(page, false);
    // Activating the inactive Today does nothing: the same period stays and the status line is not touched. The click is forced
    // because Playwright treats aria-disabled as not actionable, while a user can still press the focusable button.
    await todayButton(page).click({ force: true });
    await expect(periodName(page)).toHaveText(rangeText(periods.in_progress));
    await expect(jumpStatus(page)).toHaveText(/^Showing today, /);
    // Current period returns to the opening period, then goes; focus moves to Today.
    await expect(currentButton(page)).toHaveAccessibleDescription('Returns to the period this page opens on, for review and sign-off');
    await currentButton(page).click();
    await expectShown(page, periods.current, today);
    await expect(currentButton(page)).toHaveCount(0);
    await expect(todayButton(page)).toBeFocused();
    await expect(jumpStatus(page)).toHaveText(`Showing the current period ${plainRange(periods.current)}`);
    await expectTodayActive(page, true);
    // Going back by the arrows: from the opening period Next reaches the period in progress, where Current period shows.
    await nextButton(page).click();
    await expectShown(page, periods.in_progress, today);
    await expect(currentButton(page)).toHaveCount(1);
    await expectTodayActive(page, false);
    // And Previous from the opening period shows it too, while Today is active.
    await currentButton(page).click();
    await expect(periodName(page)).toHaveText(rangeText(periods.current));
    await previousButton(page).click();
    await expect(currentButton(page)).toHaveCount(1);
    await expectTodayActive(page, true);
    await todayButton(page).click();
    await expectShown(page, periods.in_progress, today);
  } else {
    // Outside the window: the opening period is today's. Today is inactive and does nothing.
    await expectTodayActive(page, false);
    await todayButton(page).click({ force: true });
    await expect(periodName(page)).toHaveText(rangeText(periods.current));
    await expect(jumpStatus(page)).toHaveText('');
    // Next makes Today active; Current period stays at count 0 away from the opening period, too.
    await nextButton(page).click();
    await expect(periodName(page)).not.toHaveText(rangeText(periods.current));
    await expectTodayActive(page, true);
    await expect(currentButton(page)).toHaveCount(0);
    await todayButton(page).click();
    await expectShown(page, periods.current, today);
    await expect(page.locator(`[data-day="${today}"]`)).toBeInViewport();
    await expect(jumpStatus(page)).toHaveText(`Showing today, ${weekday(today)} ${us(today)}, in the period ${plainRange(periods.current)}`);
    await expectTodayActive(page, false);
    await expect(currentButton(page)).toHaveCount(0);
    // Previous: still no Current period outside the window.
    await previousButton(page).click();
    await expect(periodName(page)).not.toHaveText(rangeText(periods.current));
    await expect(currentButton(page)).toHaveCount(0);
    await expectTodayActive(page, true);
  }
});

test('Today and Current period come in the order Previous, Next, Today, Current period, then Review & sign off', async ({ page, employeeSeed, signInThroughUi }) => {
  const periods = await employeeSeed.periodsCurrent();
  await landOn(page, signInThroughUi);
  if (isWindow(periods)) {
    // Reach the state that shows all five controls: the sheet on the period in progress, away from the opening period.
    await nextButton(page).click();
    await expect(currentButton(page)).toHaveCount(1);
  } else {
    await expect(currentButton(page)).toHaveCount(0);
  }
  const order = [previousButton(page), nextButton(page), todayButton(page), ...(isWindow(periods) ? [currentButton(page)] : []), reviewLink(page)];
  await order[0]?.focus();
  for (const control of order.slice(1)) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
  }
  // Visual order is the same: left to right on one row, or top to bottom.
  const boxes = await Promise.all(order.map((control) => control.boundingBox()));
  for (let index = 1; index < boxes.length; index += 1) {
    const before = boxes[index - 1];
    const after = boxes[index];
    expect(before, 'control box').not.toBeNull();
    expect(after, 'control box').not.toBeNull();
    const sameRow = Math.abs((before?.y ?? 0) - (after?.y ?? 0)) <= 4;
    const ordered = sameRow ? (before?.x ?? 0) < (after?.x ?? 0) : (before?.y ?? 0) < (after?.y ?? 0);
    expect(ordered, `control ${index} comes after control ${index - 1} visually`).toBe(true);
  }
  // Names equal the visible text (SC 2.5.3); only the arrows carry a label for their symbols.
  await expect(todayButton(page)).toHaveAccessibleName('Today');
  const review = reviewLink(page);
  expect(await review.textContent()).not.toBeNull();
  await expect(review).toHaveAccessibleName((await review.textContent())?.trim() ?? '');
});

/* ---- The Day editor ---------------------------------------------------------------------------------------- */

test('Today moves an open Day editor to today; Current period leaves the editor as it is', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop';
  const periods = await employeeSeed.periodsCurrent();
  const today = periods.today_local;
  // A day of the opening period other than today.
  const other = today === periods.current.period_start ? periods.current.period_end : periods.current.period_start;
  expect(other, 'the editor starts on another date').not.toBe(today);
  await landOn(page, signInThroughUi);
  await dayButton(page, other).click();
  await expect(editor(page)).toHaveAttribute('data-day-editor', other);

  if (!desktop) {
    // A phone's editor is a modal sheet: the page behind (Today included) is inert, so Today cannot be used until it closes.
    await expect(todayButton(page).click({ trial: true, timeout: 1500 })).rejects.toThrow(/intercepts pointer events/);
    await page.keyboard.press('Escape');
    await expect(editor(page)).toHaveCount(0);
    return;
  }

  // The editor is on another date, so Today is active in both branches (the sheet may already show today).
  await expectTodayActive(page, true);
  await todayButton(page).click();
  await expect(editor(page)).toHaveAttribute('data-day-editor', today);
  await expectShown(page, periods.in_progress, today);
  await expect(page.locator(`[data-sheet] [data-day="${today}"][data-editing]`)).toHaveCount(1);
  // Editor on today and the sheet on today's period: nothing left to do, so Today is inactive.
  await expectTodayActive(page, false);
  await expect(jumpStatus(page)).toHaveText(`Showing today, ${weekday(today)} ${us(today)}, in the period ${plainRange(periods.in_progress)}`);

  if (isWindow(periods)) {
    await expect(currentButton(page)).toHaveCount(1);
    await currentButton(page).click();
    await expect(periodName(page)).toHaveText(rangeText(periods.current));
    // It only navigates: the editor keeps its date, and its day is not on this sheet, so no column is marked.
    await expect(editor(page)).toHaveAttribute('data-day-editor', today);
    await expect(page.locator('[data-sheet] [data-editing]')).toHaveCount(0);
    await expect(currentButton(page)).toHaveCount(0);
    await expect(todayButton(page)).toBeFocused();
    await expect(jumpStatus(page)).toHaveText(`Showing the current period ${plainRange(periods.current)}`);
    await expectTodayActive(page, true);
  } else {
    // Opposite fact outside the window: there is no Current period to press, with the editor open or not.
    await expect(currentButton(page)).toHaveCount(0);
    await previousButton(page).click();
    await expect(currentButton(page)).toHaveCount(0);
    await expect(editor(page)).toHaveAttribute('data-day-editor', today);
  }
});

/* ---- Device zone ------------------------------------------------------------------------------------------- */

test('the device zone never decides: with an Asia/Ho_Chi_Minh device the Today tag carries the server date of the reporting zone', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const periods = await employeeSeed.periodsCurrent();
  const today = periods.today_local;
  await page.goto('/');
  const deviceZone = await page.evaluate<string>('Intl.DateTimeFormat().resolvedOptions().timeZone');
  // The runtime may report the zone under its old name (Asia/Saigon) for the one Playwright was given.
  expect(deviceZone).toMatch(/^Asia\/(Ho_Chi_Minh|Saigon)$/);
  expect(periods.reporting_zone).toBe('America/Los_Angeles');
  await landOn(page, signInThroughUi);
  // The browser's own date in the device zone: recorded, never used. It differs from the server's date for part of every day.
  const deviceDate = await page.evaluate<string>("new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())");
  testInfo.annotations.push({ type: 'dates', description: `server today_local ${today}; device date (not used) ${deviceDate}` });

  if (!contains(periods.current, today)) await todayButton(page).click();
  await expectShown(page, periods.in_progress, today);
  await expect(page.locator('[data-sheet] [data-day].today')).toHaveAttribute('data-day', today);
  await expect(page.locator('[data-sheet] .today-tag')).toHaveCount(1);
  // The period bar names the display zone, and the Today status names the server's date.
  await expect(bar(page).locator('[data-period-zone]')).toHaveText(`Times in ${deviceZone}`);
  if (!contains(periods.current, today)) {
    await expect(jumpStatus(page)).toHaveText(`Showing today, ${weekday(today)} ${us(today)}, in the period ${plainRange(periods.in_progress)}`);
  }
  // The sheet and the arrows stay on the reporting zone's periods whatever the device date is.
  await expect(page.locator('[data-day]').first()).toHaveAttribute('data-day', periods.in_progress.period_start);
});

/* ---- Phone: one row, 44px targets, the budget ------------------------------------------------------------- */

const ROW_TOLERANCE = 2;

/** The short forms of the review link's labels (WP5-UX2-T04 Addendum 2), spelled out here as an oracle independent of the app. */
const SHORT_FORM: Record<string, string> = { 'Review & sign off': 'Sign off', 'Review now': 'Review', 'Review or correct': 'Review' };

/** What the user sees on the review link: its full text, or the short form the style sheet draws when the full text is hidden. */
async function visibleLabel(review: Locator): Promise<string> {
  return review.evaluate((link) => {
    const view = link.ownerDocument.defaultView;
    if (view === null) throw new Error('no window');
    const full = link.querySelector('.review-full');
    if (full !== null && view.getComputedStyle(full).display !== 'none') return full.textContent?.trim() ?? '';
    return view.getComputedStyle(link, '::after').content.replace(/^"|"$/g, '');
  });
}

/** What the user sees on the Current period button: its full text, or the short form the style sheet draws when the full text is hidden (U-17). */
async function visibleJumpLabel(button: Locator): Promise<string> {
  return button.evaluate((element) => {
    const view = element.ownerDocument.defaultView;
    if (view === null) throw new Error('no window');
    const full = element.querySelector('.jump-full');
    if (full !== null && view.getComputedStyle(full).display !== 'none') return full.textContent?.trim() ?? '';
    return view.getComputedStyle(element, '::after').content.replace(/^"|"$/g, '');
  });
}

async function tops(controls: Locator[]): Promise<number[]> {
  return Promise.all(controls.map(async (control) => (await control.boundingBox())?.y ?? Number.NaN));
}

/** Every listed control is at least 44 x 44 css pixels. */
async function expectTargets(controls: Locator[], where: string) {
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box, `${where}: control box`).not.toBeNull();
    expect(box?.height ?? 0, `${where}: target height`).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0, `${where}: target width`).toBeGreaterThanOrEqual(44);
  }
}

/** The state that shows every control of the row: window = the sheet on the period in progress (Current period shown), else away from today. */
async function awayState(page: Page, periods: PeriodsCurrent) {
  if (isWindow(periods)) {
    await nextButton(page).click();
    await expect(periodName(page)).toHaveText(rangeText(periods.in_progress));
    await expect(currentButton(page)).toHaveCount(1);
  } else {
    await nextButton(page).click();
    await expect(periodName(page)).not.toHaveText(rangeText(periods.current));
    await expect(currentButton(page)).toHaveCount(0);
  }
  await expect(page.locator('[data-day]')).toHaveCount(14);
}

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'The one-row layout and the first-screen budget are the 390x844 phone');

  test('landing: Today and Review & sign off share one row, with 44px targets, at 390, 375, 360 and 320', async ({ page, employeeSeed, signInThroughUi }) => {
    const periods = await employeeSeed.periodsCurrent();
    await landOn(page, signInThroughUi);
    for (const width of [390, 375, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const [today, review] = [todayButton(page), reviewLink(page)];
      await expect(today).toBeVisible();
      const [a, b] = await tops([today, review]);
      expect(Math.abs((a ?? 0) - (b ?? 0)), `${width}px: Today and Review share a row`).toBeLessThanOrEqual(ROW_TOLERANCE);
      await expect(currentButton(page)).toHaveCount(0);
      await expectTargets([previousButton(page), nextButton(page), today, review], `landing ${width}px`);
      await expectNoSidewaysScroll(page, `landing ${width}px`);
      const reviewBox = await review.boundingBox();
      // Addendum 2: the full label fits beside Today at every phone width, on one line, and the accessible name is that label.
      const full = ((await review.textContent()) ?? '').trim();
      expect(await visibleLabel(review), `landing ${width}px: the full label is shown`).toBe(full);
      expect(reviewBox?.height ?? 0, `landing ${width}px: one line, 44px high`).toBeLessThanOrEqual(45);
      await expect(review).toHaveAccessibleName(full);
      console.log(`ROW landing width=${width} today.y=${a} review.y=${b} review.h=${reviewBox?.height} review.w=${reviewBox?.width} window=${isWindow(periods)}`);
    }
  });

  test('away: the review link is never wrapped: the short form beside Today and Current period at 390, 375 and 360, "Current" and the short form beside Today at 320, the full label where it fits', async ({
    page,
    employeeSeed,
    signInThroughUi,
  }) => {
    const periods = await employeeSeed.periodsCurrent();
    await landOn(page, signInThroughUi);
    await awayState(page, periods);
    const withCurrent = isWindow(periods);
    // 600px is a wide phone (below the 768px layout): the full label fits beside both buttons. At 320 "Current period" shows as "Current" (U-17)
    // so Today, Current and the review link still share one 44px row (WP5-UX3-T04 replaces the former 320px own-row expectation: stricter, one row fewer).
    for (const width of [600, 390, 375, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const [today, review] = [todayButton(page), reviewLink(page)];
      const controls = withCurrent ? [today, currentButton(page), review] : [today, review];
      await expect(today).toBeVisible();
      const rowTops = await tops(controls);
      const spread = Math.max(...rowTops) - Math.min(...rowTops);
      const reviewBox = await review.boundingBox();
      const full = ((await review.textContent()) ?? '').trim();
      const sharesRow = spread <= ROW_TOLERANCE;
      const shown = await visibleLabel(review);
      // Short only for a long label in the three-button row at 390, 375, 360 and 320; everywhere else the full label is shown.
      const expectShort = withCurrent && (width === 320 || (full.length > 12 && [390, 375, 360].includes(width)));
      if (expectShort) expect(shown, `${width}px: the short form`).toBe(SHORT_FORM[full]);
      else expect(shown, `${width}px: the full label`).toBe(full);
      if (withCurrent) {
        // "Current period" in full from 360 to 600; "Current" only at 320, where the container is 264px (below 18.1rem). The name never changes (SC 2.5.3).
        const currentShown = await visibleJumpLabel(currentButton(page));
        if (width === 320) expect(currentShown, '320px: the short form of Current period').toBe('Current');
        else expect(currentShown, `${width}px: Current period in full`).toBe('Current period');
        await expect(currentButton(page)).toHaveAccessibleName('Current period');
        expect('current period', `${width}px: the name contains the visible text`).toContain(currentShown.toLowerCase());
      }
      expect(sharesRow, `${width}px: all ${controls.length} controls share a row`).toBe(true);
      // One line in every state: 44px high (the 61.5px two-line button is gone).
      expect(reviewBox?.height ?? 0, `${width}px: Review is one line, 44px high`).toBeGreaterThanOrEqual(44);
      expect(reviewBox?.height ?? 0, `${width}px: Review is one line, 44px high`).toBeLessThanOrEqual(45);
      await expectTargets([previousButton(page), nextButton(page), ...controls], `away ${width}px`);
      await expectNoSidewaysScroll(page, `away ${width}px`);
      // The accessible name is the full label whichever text is shown; it contains the visible text (SC 2.5.3).
      await expect(review).toHaveAccessibleName(full);
      expect(full.toLowerCase(), `${width}px: the name contains the visible text`).toContain(shown.toLowerCase());
      if (width === 390 || width === 320) await bar(page).screenshot({ path: screenshotPath(`today-bar-phone-away-w${width}-synthetic.png`), animations: 'disabled' });
      const widths = (await Promise.all(controls.map((control) => control.boundingBox()))).map((box) => box?.width);
      console.log(`ROW away width=${width} tops=${rowTops.join('/')} spread=${spread} widths=${widths.join('/')} review.h=${reviewBox?.height} withCurrent=${withCurrent}`);
    }
  });
});

/*
 * The first-screen budget (docs/04, 390x844) in the away state too (WP5-UX2-T04 Addendum 2: the review link is one line, so the first row of
 * the period in progress, taller on the day it carries the Today tag, still ends above the tab bar). Both zone situations, own timesheet.
 */
for (const [situation, zone] of [
  ['the zone note shown', 'Asia/Ho_Chi_Minh'],
  ['the viewing zone equal to the reporting zone', 'America/Los_Angeles'],
] as const) {
  test.describe(`phone first screen, away state, ${situation}`, () => {
    test.skip(({ isMobile }) => !isMobile, 'The first-screen budget is the 390x844 phone');
    test.use({ timezoneId: zone });

    test('the first day row is fully visible above the tab bar', async ({ page, employeeSeed, signInThroughUi }) => {
      const periods = await employeeSeed.periodsCurrent();
      await landOn(page, signInThroughUi);
      if (zone === 'Asia/Ho_Chi_Minh') await expect(page.locator('[data-zone-note]')).toBeVisible();
      else await expect(page.locator('[data-zone-note]')).toHaveCount(0);
      await awayState(page, periods);
      await page.evaluate('window.scrollTo(0, 0)');
      const first = await page.locator('[data-day]').first().boundingBox();
      const tabs = await page.locator('.shell-tabs').boundingBox();
      expect(first, 'first day row box').not.toBeNull();
      expect(tabs, 'tab bar box').not.toBeNull();
      const bottom = (first?.y ?? 0) + (first?.height ?? 0);
      const tagOnFirst = await page.locator('[data-day]').first().evaluate((row) => row.querySelector('.today-tag') !== null);
      console.log(`BUDGET away zone=${zone} window=${isWindow(periods)} todayTagOnFirstRow=${tagOnFirst} firstRowBottom=${bottom} tabBarTop=${tabs?.y}`);
      expect(bottom, 'bottom of the first day row is at or above the tab bar').toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
      expect(await page.evaluate('window.scrollY')).toBe(0);
    });
  });
}

/* ---- Addendum 2: the Due label, the range arrow ------------------------------------------------------------ */

test('the period bar: "Due" is a label like "Payroll date", and the range arrow is decoration with a hidden " to "', async ({ page, employeeSeed, signInThroughUi }) => {
  const periods = await employeeSeed.periodsCurrent();
  await landOn(page, signInThroughUi);
  const due = bar(page).locator('[data-period-due]');
  const payroll = bar(page).locator('.period-meta > span').first();
  // The text content is unchanged: the label word, then the value.
  await expect(due).toHaveText(/^Due [A-Z][a-z]{2} \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} \(America\/Los_Angeles\)$/);
  const style = (locator: Locator, selector?: string) =>
    locator.evaluate((element, inner) => {
      const target = inner === null ? element : element.querySelector(inner);
      if (target === null) throw new Error('no element');
      const computed = (element.ownerDocument.defaultView ?? (() => { throw new Error('no window'); })()).getComputedStyle(target);
      return { colour: computed.color, weight: computed.fontWeight };
    }, selector ?? null);
  // The word "Due" is the span's own text (outside the bold value), so the span's style is the label's style, as for "Payroll date".
  const dueLabel = await style(due);
  const payrollLabel = await style(payroll);
  expect(dueLabel, 'Due has the label style of Payroll date').toEqual(payrollLabel);
  const dueValue = await style(due, 'b');
  const payrollValue = await style(payroll, 'b');
  expect(dueValue, 'the date and time keep the value style of the Payroll date value').toEqual(payrollValue);
  expect(dueValue.colour, 'the value colour differs from the label colour').not.toBe(dueLabel.colour);
  // The arrow: aria-hidden, in the label colour, with a hidden " to " that screen readers read.
  const arrow = periodName(page).locator('.range-arrow');
  await expect(arrow).toHaveAttribute('aria-hidden', 'true');
  await expect(arrow).toHaveText('→');
  expect((await style(arrow)).colour, 'the arrow has the label colour').toBe(dueLabel.colour);
  const spoken = await periodName(page).evaluate((title) => {
    // The text a screen reader reads: the direct text and the children that are not aria-hidden (the title has no deeper markup).
    return [...title.childNodes]
      .map((child) => (child.nodeType === 3 || (child as typeof title).getAttribute('aria-hidden') !== 'true' ? (child.textContent ?? '') : ''))
      .join('');
  });
  expect(spoken, 'accessible text of the range').toBe(plainRange(periods.current));
  expect(spoken).toContain(' to ');
});

/* ---- WP5-UX2-AUDIT-01: the server date moves on while the page stays open ------------------------------------- */

/**
 * Seconds from this process's clock until midnight in `zone`. The test runner shares the clock the server under test uses (the
 * simulated-clock preload shifts every process by the same constant), so under the preload this is the server's own distance to
 * the reporting-zone midnight. The browser's clock is never read.
 */
function secondsToMidnight(zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date());
  const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value ?? Number.NaN);
  return 86_400 - (part('hour') * 3600 + part('minute') * 60 + part('second'));
}

/** Counts the GET reads of one periods route the page makes from now on. */
function periodReads(page: Page, path: string): { count: () => number; reset: () => void } {
  let reads = 0;
  page.on('request', (request) => {
    if (request.method() === 'GET' && new URL(request.url()).pathname === path) reads += 1;
  });
  return { count: () => reads, reset: () => void (reads = 0) };
}

/** The date of the Today tag on the sheet, or null when the sheet shows another period. */
async function tagDate(page: Page): Promise<string | null> {
  const tagged = page.locator('[data-sheet] [data-day].today');
  return (await tagged.count()) === 0 ? null : tagged.getAttribute('data-day');
}

/** The next response of the server's periods route (set up before the action that causes it). */
const periodsResponse = (page: Page, path: string) => page.waitForResponse((response) => response.request().method() === 'GET' && new URL(response.url()).pathname === path);

test('a page left open across a reporting-zone midnight: a press on Today re-reads the server date and decides from it; a focus refresh moves the Today tag by itself', async ({
  page,
  context,
  employeeSeed,
  signInThroughUi,
}) => {
  test.setTimeout(240_000);
  const before = await employeeSeed.periodsCurrent();
  // Only a run that starts within 90 s of the reporting-zone midnight (the gate runs it under the simulated-clock preload at
  // 23:59:20) can cross it; every other run asserts the inactive press re-read below. No run is skipped.
  const crossing = secondsToMidnight(before.reporting_zone) <= 90;
  await landOn(page, signInThroughUi);
  const shown = before.current;
  // A second tab on the same session is the person who comes back to the page by focus alone, without pressing anything.
  const other = crossing ? await context.newPage() : undefined;
  if (other !== undefined) {
    await other.goto('/');
    await expect(other.locator('[data-day]')).toHaveCount(14);
  }
  const landed = await employeeSeed.periodsCurrent();

  if (other !== undefined && landed.today_local === before.today_local) {
    // The page was signed in before the server date moved on, so both tabs hold the old date. Wait for the new one.
    let after = landed;
    await expect
      .poll(
        async () => {
          after = await employeeSeed.periodsCurrent();
          return after.today_local;
        },
        { message: 'the server date passes the reporting-zone midnight', timeout: 150_000, intervals: [1000] },
      )
      .not.toBe(before.today_local);
    const stillShowsToday = contains(shown, after.today_local);
    // The tab nobody refreshed: no event reached it, so it still holds the old answer and its Today is as it was before midnight.
    if (contains(shown, before.today_local)) await expectTodayActive(page, false);
    await expect(page.locator('[data-sheet] .today-tag')).toHaveCount(contains(shown, before.today_local) ? 1 : 0);
    // A press on the inactive Today re-reads /periods/current and acts on the fresh answer.
    await todayButton(page).click({ force: true });
    if (stillShowsToday) {
      // Fresh state: the shown period still holds today. The sheet and the live region stay, the Today tag follows the server date.
      await expect(periodName(page)).toHaveText(rangeText(shown));
      await expect.poll(() => tagDate(page), { message: 'the pressed tab tags the new date' }).toBe(after.today_local);
      await expect(jumpStatus(page)).toHaveText('');
      await expectTodayActive(page, false);
    } else {
      // Fresh state: today is in another period. The sheet jumps to it, the tag sits on the new date and the jump is announced.
      await expectShown(page, after.in_progress, after.today_local);
      await expect(jumpStatus(page)).toHaveText(`Showing today, ${weekday(after.today_local)} ${us(after.today_local)}, in the period ${plainRange(after.in_progress)}`);
      await expectTodayActive(page, false);
      await expect(page.locator(`[data-day="${after.today_local}"]`)).toBeInViewport();
    }
    // The other tab, which nobody pressed: a focus refresh alone moves the Today tag and the inactive state to the new date, with no reload.
    await other.evaluate("window.dispatchEvent(new Event('focus'))");
    await expect.poll(() => tagDate(other), { message: 'the refreshed tab tags the new date' }).toBe(stillShowsToday ? after.today_local : null);
    await expectTodayActive(other, !stillShowsToday);
    return;
  }

  // The real-clock part (no midnight in reach): a press on the inactive Today still re-reads /periods/current and, because the
  // fresh answer is not away, leaves the sheet and the live region exactly as they are.
  if (isWindow(landed)) {
    await todayButton(page).click();
    await expectShown(page, landed.in_progress, landed.today_local);
  }
  await expectTodayActive(page, false);
  // The jump's own follow-up read of the periods has to be over before reads are counted.
  await page.waitForTimeout(600);
  const name = await periodName(page).textContent();
  const status = await jumpStatus(page).textContent();
  const reads = periodReads(page, '/api/periods/current');
  const read = periodsResponse(page, '/api/periods/current');
  await todayButton(page).click({ force: true });
  await read;
  await page.waitForTimeout(400);
  expect(reads.count(), 'one /periods/current read for one press on the inactive Today').toBe(1);
  expect(await periodName(page).textContent(), 'the period is unchanged').toBe(name);
  expect(await jumpStatus(page).textContent(), 'the live region is untouched').toBe(status);
  await expectTodayActive(page, false);
  expect(await tagDate(page), 'the Today tag stays on the server date').toBe(landed.today_local);
});

/** The refresh triggers shared by the person's own view and a shared view: the window regaining focus, the tab becoming visible. */
async function expectRefreshTriggers(page: Page, path: string, otherPath: string, ownView: boolean) {
  await page.waitForTimeout(600);
  const reads = periodReads(page, path);
  const otherReads = periodReads(page, otherPath);
  // Window focus: exactly one read.
  let read = periodsResponse(page, path);
  await page.evaluate("window.dispatchEvent(new Event('focus'))");
  await read;
  await page.waitForTimeout(300);
  expect(reads.count(), 'window focus reads the periods once').toBe(1);
  // Two focus events in one tick (a browser can fire more than one): one read at a time, not two.
  reads.reset();
  read = periodsResponse(page, path);
  await page.evaluate("(() => { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('focus')); })()");
  await read;
  await page.waitForTimeout(400);
  expect(reads.count(), 'two focus events together read the periods once').toBe(1);
  // The tab becoming visible reads the periods. In the person's own view the check in/out state (WP5-UX2-T09) also reacts to that event:
  // its own lookup reads the periods and the sheet's reload reads them again, so the screen's read is the third. A shared view has no
  // check in/out, so there it is exactly one read.
  reads.reset();
  read = periodsResponse(page, path);
  await page.evaluate("document.dispatchEvent(new Event('visibilitychange'))");
  await read;
  await page.waitForTimeout(500);
  if (ownView) expect(reads.count(), 'a visible tab reads the periods (check in/out lookup, sheet reload, and the screen)').toBeGreaterThanOrEqual(3);
  else expect(reads.count(), 'a visible tab reads the periods once').toBe(1);
  // A hidden tab reads nothing.
  reads.reset();
  await page.evaluate(
    "(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); })()",
  );
  await page.waitForTimeout(600);
  expect(reads.count(), 'a hidden tab reads nothing').toBe(0);
  await page.evaluate("(() => { delete document.visibilityState; })()");
  // Whatever the view, the reads go to its own route only.
  expect(otherReads.count(), `no read of ${otherPath}`).toBe(0);
}

test('the periods are re-read when the window regains focus or the tab becomes visible (the person\'s own view)', async ({ page, signInThroughUi }) => {
  await landOn(page, signInThroughUi);
  await expectRefreshTriggers(page, '/api/periods/current', '/api/shared/none/periods/current', true);
});

test('the periods are re-read through the share when the window regains focus or the tab becomes visible (a shared view)', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(90_000);
  const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Owner', signature: 'none' });
  const grantee = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Grantee', signature: 'none' });
  await owner.api.call('POST', '/api/shares', { grantee_email: grantee.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  await signInPageAs(grantee.account, `#/shared/${owner.account.id}/timesheet`);
  await expect(page.locator('[data-share-bar-title]')).toBeVisible();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await expectRefreshTriggers(page, `/api/shared/${owner.account.id}/periods/current`, '/api/periods/current', false);
});

/* ---- WP5-UX3-T04, G-5 (b): the "in progress" pill ----------------------------------------------------------------- */

/** The period relation pill of the bar (the status badges that follow it are not part of the set). */
const relationPill = (page: Page) => bar(page).locator('.period-title > .badge:is(.old, .current, .future, .in-progress)');

/** The ink of a pill against its fill, in a theme situation (the page is switched like the other specs do: media plus the manual attribute). */
async function pillInkContrast(pill: Locator): Promise<number> {
  const fill = parseColour(await computedStyle(pill, 'backgroundColor'));
  const flat = over(fill, backdropOf(await backdropsAbove(pill)));
  const ink = parseColour(await computedStyle(pill, 'color'));
  return contrast(over(ink, flat), flat);
}

const THEME_SITUATIONS = [
  { name: 'light device', scheme: 'light', theme: null },
  { name: 'dark device', scheme: 'dark', theme: null },
  { name: 'light device, manual dark', scheme: 'light', theme: 'dark' },
  { name: 'dark device, manual light', scheme: 'dark', theme: 'light' },
] as const;

async function showSituation(page: Page, situation: (typeof THEME_SITUATIONS)[number]) {
  await page.emulateMedia({ colorScheme: situation.scheme });
  await page.locator('html').evaluate((root, theme) => {
    if (theme === null) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, situation.theme);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(450);
}

test('the period pill follows the server: "in progress" only for the period that contains today during the five window days, "current" for the period before it', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const periods = await employeeSeed.periodsCurrent();
  const today = periods.today_local;
  await landOn(page, signInThroughUi);
  const pill = relationPill(page);
  const inProgressPills = bar(page).locator('.badge.in-progress');
  // The page opens on the R-07 current period: "current" in both branches, and never "in progress" there.
  await expect(periodName(page)).toHaveText(rangeText(periods.current));
  await expect(pill).toHaveCount(1);
  await expect(pill).toHaveText('current');
  await expect(inProgressPills).toHaveCount(0);

  if (isWindow(periods)) {
    // The five window days: Today opens the period that contains today, and it reads "in progress" (blue), not "future".
    await todayButton(page).click();
    await expectShown(page, periods.in_progress, today);
    await expect(pill).toHaveText('in progress');
    await expect(pill).toHaveClass(/\bin-progress\b/);
    await expect(bar(page).locator('.badge.future')).toHaveCount(0);
    // Its ink keeps 4.5:1 on its fill in the four theme situations.
    for (const situation of THEME_SITUATIONS) {
      await showSituation(page, situation);
      expect(await pillInkContrast(pill), `${situation.name}: the in progress pill`).toBeGreaterThanOrEqual(4.5);
    }
    await showSituation(page, THEME_SITUATIONS[0]);
    // Current period shows the ended period, still "current"; the one before it is "old".
    await currentButton(page).click();
    await expectShown(page, periods.current, today);
    await expect(pill).toHaveText('current');
    await previousButton(page).click();
    await expect(pill).toHaveText('old');
    await expect(inProgressPills).toHaveCount(0);
    // The period after the one in progress is "future".
    await todayButton(page).click();
    await expectShown(page, periods.in_progress, today);
    await nextButton(page).click();
    await expect(pill).toHaveText('future');
    await expect(inProgressPills).toHaveCount(0);
  } else {
    // Outside the window: no "in progress" anywhere, the next period is "future" and the previous one "old". The opposite fact is the window's.
    expect(periods.in_progress.payroll_date, 'outside the window the period with today is the current one').toBe(periods.current.payroll_date);
    await nextButton(page).click();
    await expect(periodName(page)).not.toHaveText(rangeText(periods.current));
    await expect(pill).toHaveText('future');
    await expect(inProgressPills).toHaveCount(0);
    await previousButton(page).click();
    await expect(periodName(page)).toHaveText(rangeText(periods.current));
    await expect(pill).toHaveText('current');
    await previousButton(page).click();
    await expect(pill).toHaveText('old');
    await expect(inProgressPills).toHaveCount(0);
  }
});

test('the inactive Today differs from the active one by more than hue: a dashed border, and the focus ring is the same', async ({ page, employeeSeed, signInThroughUi }) => {
  const periods = await employeeSeed.periodsCurrent();
  await landOn(page, signInThroughUi);
  const read = async (active: boolean) => {
    await expectTodayActive(page, active);
    await page.mouse.move(0, 0);
    const border = await settledStyle(todayButton(page), 'borderTopColor');
    const look = await todayButton(page).evaluate((element) => {
      const style = element.ownerDocument.defaultView?.getComputedStyle(element);
      return { borderStyle: style?.borderTopStyle ?? '', borderWidth: style?.borderTopWidth ?? '' };
    });
    await focusFromKeyboard(todayButton(page));
    const ring = await measureFocusRing(todayButton(page));
    expect(ring.ringAgainstBackdrop, `${active ? 'active' : 'inactive'} Today: the focus ring against the card`).toBeGreaterThanOrEqual(3);
    return { ...look, border, ring: ring.layers };
  };
  let active: Awaited<ReturnType<typeof read>>;
  let inactive: Awaited<ReturnType<typeof read>>;
  if (isWindow(periods)) {
    // The opening period is the ended one: Today is active; after the jump the sheet shows today and Today is inactive.
    active = await read(true);
    await todayButton(page).click();
    await expectShown(page, periods.in_progress, periods.today_local);
    inactive = await read(false);
  } else {
    inactive = await read(false);
    await nextButton(page).click();
    active = await read(true);
  }
  expect(active.borderStyle, 'active Today has a solid border').toBe('solid');
  expect(inactive.borderStyle, 'inactive Today has a dashed border').toBe('dashed');
  expect(inactive.borderWidth).toBe(active.borderWidth);
  expect(inactive.ring, 'the focus ring is the same on both').toBe(active.ring);
});

test('a shared view reads the pill from the periods of the owner: the same "in progress" rule', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(90_000);
  const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Pill Owner', signature: 'none' });
  const grantee = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Pill Grantee', signature: 'none' });
  await owner.api.call('POST', '/api/shares', { grantee_email: grantee.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
  const periods = await owner.api.call<PeriodsCurrent>('GET', '/api/periods/current');
  await signInPageAs(grantee.account, `#/shared/${owner.account.id}/timesheet`);
  await expect(page.locator('[data-share-bar-title]')).toBeVisible();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const pill = relationPill(page);
  await expect(periodName(page)).toHaveText(rangeText(periods.current));
  await expect(pill).toHaveText('current');
  await nextButton(page).click();
  await expect(periodName(page)).not.toHaveText(rangeText(periods.current));
  // The next period after the opening one: "in progress" in the window, "future" otherwise (both facts, from the owner's server values).
  await expect(pill).toHaveText(isWindow(periods) ? 'in progress' : 'future');
  await expect(bar(page).locator(isWindow(periods) ? '.badge.future' : '.badge.in-progress')).toHaveCount(0);
});

/* ---- Desktop widths --------------------------------------------------------------------------------------- */

test.describe('desktop widths', () => {
  test.skip(({ isMobile }) => isMobile, 'The period bar of a desktop is checked at 768 to 1280');

  test('the bar does not overflow in the landing and away states, and the controls keep their order', async ({ page, employeeSeed, signInThroughUi }) => {
    const periods = await employeeSeed.periodsCurrent();
    await landOn(page, signInThroughUi);
    for (const width of [768, 900, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(todayButton(page)).toBeVisible();
      await expectNoSidewaysScroll(page, `landing ${width}px`);
      const barBox = await bar(page).boundingBox();
      const reviewBox = await reviewLink(page).boundingBox();
      expect((reviewBox?.x ?? 0) + (reviewBox?.width ?? 0), `landing ${width}px: Review ends inside the card`).toBeLessThanOrEqual((barBox?.x ?? 0) + (barBox?.width ?? 0) + 0.5);
    }
    await awayState(page, periods);
    for (const width of [768, 900, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(todayButton(page)).toBeVisible();
      await expectNoSidewaysScroll(page, `away ${width}px`);
      const barBox = await bar(page).boundingBox();
      const next = await nextButton(page).boundingBox();
      const today = await todayButton(page).boundingBox();
      const review = await reviewLink(page).boundingBox();
      console.log(`WIDTH away width=${width} next.x=${next?.x} next.y=${next?.y} today.x=${today?.x} today.y=${today?.y} review.x=${review?.x} card.w=${barBox?.width} card.h=${barBox?.height}`);
      if (width === 768 || width === 1280) await bar(page).screenshot({ path: screenshotPath(`today-bar-away-w${width}-synthetic.png`), animations: 'disabled' });
      for (const box of [next, today, review]) {
        expect((box?.x ?? 0) + (box?.width ?? 0), `away ${width}px: inside the card`).toBeLessThanOrEqual((barBox?.x ?? 0) + (barBox?.width ?? 0) + 0.5);
      }
      expect(next?.x ?? 0, `away ${width}px: Next stays left of Today`).toBeLessThan(today?.x ?? 0);
    }
  });
});
