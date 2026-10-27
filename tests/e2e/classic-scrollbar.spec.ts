import type { Page } from '@playwright/test';
import { namedDayButton } from './dayButton.ts';
import { expect, test } from './fixtures.ts';

/*
 * WP5-UX4-FIX2 (F-UX4A-1): the Day editor layout with a CLASSIC scrollbar. Playwright's headless browsers hide scrollbars
 * (`--hide-scrollbars`), so every other spec measures a window without one. Windows desktop browsers draw a 15px
 * scrollbar, and a rule that read `clientWidth` flapped between beside and floating at about 60 changes a second when the
 * page was taller than the window in one mode and shorter in the other (the scrollbar came and went with the mode).
 * Here the flag is dropped, so the scrollbar is drawn. The rule must depend on the window size alone: one layout per
 * size, one change per crossing of the switch, and the switch where the classic scrollbar puts it (token need + gutter).
 * R5 b: the rule takes the window width less the classic scrollbar width (measured with an off-screen `overflow: scroll` box),
 * so the root is not forced to scroll: a page shorter than the window draws no vertical track.
 */
test.use({ locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh', launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

/** The window width without a scrollbar from which the editor stands beside the sheet (docs/04: 1330px). */
const BESIDE_NEED = 1330;

test.skip(({ isMobile }) => isMobile, 'The beside/floating rule is a desktop-project behaviour; the phone project has overlay scrollbars');

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

const area = (page: Page) => page.locator('.sheet-area');

/** The width the browser takes for a classic scrollbar (innerWidth less clientWidth). */
const scrollbarOf = (page: Page) => page.evaluate<number>('window.innerWidth - document.documentElement.clientWidth');

/** Counts the layout attribute changes of the sheet area for `ms` and returns the layouts seen. */
function watchLayout(page: Page, ms: number): Promise<{ changes: number; layouts: string[] }> {
  // A string script: the test project has no DOM types.
  return page.evaluate<{ changes: number; layouts: string[] }>(`new Promise((resolve) => {
    const target = document.querySelector('.sheet-area');
    const seen = new Set([target.getAttribute('data-editor-layout')]);
    let changes = 0;
    const observer = new MutationObserver(() => {
      changes += 1;
      seen.add(target.getAttribute('data-editor-layout'));
    });
    observer.observe(target, { attributes: true, attributeFilter: ['data-editor-layout'] });
    setTimeout(() => {
      observer.disconnect();
      resolve({ changes, layouts: [...seen] });
    }, ${ms});
  })`);
}

async function openDay(page: Page, date: string): Promise<void> {
  await namedDayButton(page, date, 'Edit').click();
  await expect(page.getByRole('dialog', { name: /Day editor/ })).toBeVisible();
}

test.describe('the Day editor layout with a classic scrollbar', () => {
  test('one window size gives one layout: no change in 1.5 s at 1335, 1340 and 1344 wide, at any height around the two page heights', async ({
    page,
    employeeSeed,
    signInThroughUi,
  }) => {
    test.setTimeout(120_000);
    const days = await employeeSeed.displayedPeriodFreeWorkdays();
    expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(1);
    await page.setViewportSize({ width: 1440, height: 800 });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await openDay(page, days[0] ?? '');
    // The browser really draws a classic scrollbar here (a short window scrolls); without one the test proves nothing.
    expect(await scrollbarOf(page), 'a classic scrollbar is drawn').toBeGreaterThan(0);

    for (const width of [1335, 1340, 1344]) {
      // The window is narrower than the switch point (1345 with a 15px scrollbar), so the editor floats at every height.
      // The two page heights (floating, beside) lie between 1340 and 1480 for the seeded sheet; the sweep covers the band in steps of 10.
      for (const height of [1300, ...Array.from({ length: 15 }, (_, index) => 1340 + 10 * index), 1500]) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(150);
        // 1.5 s at the two heights the audit used, 0.4 s in between (a flap runs at about 60 changes a second).
        const watched = await watchLayout(page, height === 1370 || height === 1400 ? 1500 : 400);
        expect(watched, `${width}x${height}: the layout does not change`).toEqual({ changes: 0, layouts: ['floating'] });
      }
    }
    await expect(area(page)).toHaveAttribute('data-editor-layout', 'floating');
    // R5 b: the rule subtracts the classic scrollbar width whether or not the page draws a track. A window taller than the page draws
    // no vertical track (the root is not forced to scroll), yet the layout is the one a track would give: floating, below 1345.
    await page.setViewportSize({ width: 1340, height: 3000 });
    await page.waitForTimeout(150);
    expect(await scrollbarOf(page), 'a short page draws no vertical track: clientWidth equals innerWidth').toBe(0);
    await expect(area(page)).toHaveAttribute('data-editor-layout', 'floating');
    const watchedShort = await watchLayout(page, 1500);
    expect(watchedShort, '1340x3000: the layout does not change').toEqual({ changes: 0, layouts: ['floating'] });
  });

  test('the switch point is the token need plus the scrollbar gutter, and a sweep across it changes the layout once per crossing', async ({
    page,
    employeeSeed,
    signInThroughUi,
  }) => {
    test.setTimeout(120_000);
    const days = await employeeSeed.displayedPeriodFreeWorkdays();
    expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(1);
    await page.setViewportSize({ width: 1440, height: 700 });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await openDay(page, days[0] ?? '');
    const scrollbar = await scrollbarOf(page);
    expect(scrollbar, 'a classic scrollbar is drawn').toBeGreaterThan(0);
    const switchWidth = BESIDE_NEED + scrollbar;

    const layoutAt = async (width: number) => {
      await page.setViewportSize({ width, height: 700 });
      await page.waitForTimeout(100);
      return (await area(page).getAttribute('data-editor-layout')) ?? '';
    };
    await expect.poll(() => layoutAt(switchWidth - 1), { message: `${switchWidth - 1}px (window) floats` }).toBe('floating');
    await expect.poll(() => layoutAt(switchWidth), { message: `${switchWidth}px (window) is beside` }).toBe('beside');

    await page.evaluate(`(() => {
      const target = document.querySelector('.sheet-area');
      window.__layoutLog = [];
      new MutationObserver(() => window.__layoutLog.push(target.getAttribute('data-editor-layout'))).observe(target, { attributes: true, attributeFilter: ['data-editor-layout'] });
    })()`);
    const up = Array.from({ length: 13 }, (_, index) => switchWidth - 6 + index);
    for (const [direction, widths] of [
      ['up', up],
      ['down', [...up].reverse()],
    ] as const) {
      await layoutAt(widths[0] ?? 0);
      await page.evaluate('window.__layoutLog = []');
      for (const width of widths.slice(1)) await layoutAt(width);
      const log = await page.evaluate<string[]>('window.__layoutLog');
      expect(log, `going ${direction} across ${switchWidth}px changes the layout exactly once`).toEqual([direction === 'up' ? 'beside' : 'floating']);
    }
  });
});

/*
 * WP5-UX5 F-UX5A-3 (owner answer F-7 a): a press outside closes the drawer, but a press on an element's own scrollbar scrolls that
 * element; it is not a press on the page. Between 480 and 929px a week card scrolls sideways and draws a classic scrollbar under it.
 */
test.describe('a press on a scrollbar with the Day editor open', () => {
  test('a press-drag on a week card\'s own scrollbar scrolls the card and leaves the drawer open; a press on plain page still closes it', async ({
    page,
    employeeSeed,
    signInThroughUi,
  }) => {
    test.setTimeout(120_000);
    const days = await employeeSeed.displayedPeriodFreeWorkdays();
    expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(1);
    await page.setViewportSize({ width: 900, height: 900 });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await openDay(page, days[0] ?? '');
    const editor = page.getByRole('dialog', { name: /Day editor/ });
    // The scrollbar of the first week card that scrolls sideways and has its track in view.
    const bar = await page.evaluate<{ x: number; y: number } | null>(`(() => {
      for (const week of document.querySelectorAll('.sheet-week')) {
        const box = week.getBoundingClientRect();
        const track = week.offsetHeight - week.clientHeight;
        const y = box.top + week.clientTop + week.clientHeight + Math.max(1, track / 2);
        if (week.scrollWidth > week.clientWidth && track > 0 && box.top > 0 && y < window.innerHeight) return { x: box.right - 60, y };
      }
      return null;
    })()`);
    expect(bar, 'a week card with a sideways scrollbar in view').not.toBeNull();
    const at = bar ?? { x: 0, y: 0 };
    const scrolled = () => page.evaluate<number>(`[...document.querySelectorAll('.sheet-week')].reduce((sum, week) => sum + week.scrollLeft, 0)`);
    expect(await scrolled()).toBe(0);
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.mouse.move(at.x + 120, at.y, { steps: 5 });
    await page.mouse.up();
    expect(await scrolled(), 'the press-drag moved the scrollbar thumb').toBeGreaterThan(0);
    await expect(editor, 'a scrollbar press is not a press on the page').toBeVisible();
    // Plain page, away from the drawer, still closes it.
    const width = await page.evaluate<number>('document.documentElement.clientWidth');
    await page.mouse.click((await editor.getAttribute('data-side')) === 'left' ? width - 4 : 4, 300);
    await expect(editor).toHaveCount(0);
  });
});
