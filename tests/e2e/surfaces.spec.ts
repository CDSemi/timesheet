import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { backdropOf, backdropsAbove, computedStyle, contrast, flattenedBackground, focusFromKeyboard, measureFocusRing, parseColour, parseLayers, tokenColour } from './contrast.ts';
import { SHEET_QUERY, SHELL_QUERY } from '../../src/client/components/layoutQueries.ts';
import { expect, SCREENSHOT_DIR, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX3-T01 (round 3, owner decisions U-01, U-02 and G-1 b): the surfaces of the Timesheet page. The page is a
 * darker surface; the period bar, every week band and the footer are raised cards (the week bands and the footer
 * square, the others on the radius scale); the toolbar and the form header sit on the page. Interactive states
 * change through the shared transition, which is instant under prefers-reduced-motion; no width scrolls sideways.
 * Every number is read from the browser's computed style (WCAG 2.x relative luminance). Four theme situations are
 * covered: a light device, a dark device, and the manual choice both ways. The page shows the period the server
 * opens; nothing here depends on the date or the time of day.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const STORAGE_KEY = 'timesheet.theme';
/** The least step between the page and a raised card (the round-3 promise; the tokens give 1.14 light and 1.15 dark). */
const CARD_STEP = 1.12;
/** WCAG 2.2 SC 1.4.11: the shared focus ring against every surface it sits on. */
const NON_TEXT = 3;
/** 0.01ms in seconds, with room for the browser's rounding of the computed value. */
const REDUCED_SECONDS = 0.00002;

type Theme = 'light' | 'dark';

interface Situation {
  name: string;
  slug: string;
  media: Theme;
  stored: Theme | null;
}

const SITUATIONS: readonly Situation[] = [
  { name: 'light device', slug: 'light', media: 'light', stored: null },
  { name: 'dark device', slug: 'dark', media: 'dark', stored: null },
  { name: 'light device, manual dark', slug: 'manual-dark', media: 'light', stored: 'dark' },
  { name: 'dark device, manual light', slug: 'manual-light', media: 'dark', stored: 'light' },
];

async function seedStoredTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript({
    content: `try { if (!sessionStorage.getItem('e2e-theme-seeded')) { localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(theme)}); sessionStorage.setItem('e2e-theme-seeded', '1'); } } catch (error) {}`,
  });
}

async function prepare(page: Page, situation: Situation, signIn: () => Promise<void>): Promise<void> {
  await page.emulateMedia({ colorScheme: situation.media, reducedMotion: 'reduce' });
  if (situation.stored !== null) await seedStoredTheme(page, situation.stored);
  await signIn();
  await expect(page.locator('[data-day]')).toHaveCount(14);
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Appends measured lines to a masked evidence text file in the screenshot folder (no personal data: tokens and ratios only). */
function record(project: string, situation: Situation, lines: string[]): void {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  appendFileSync(join(SCREENSHOT_DIR, `surfaces-${project}-${situation.slug}.txt`), `${lines.join('\n')}\n`, 'utf8');
}

async function computed(locator: Locator, properties: string[]): Promise<Record<string, string>> {
  return locator.evaluate((element, names) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, style?.getPropertyValue(name) ?? '']));
  }, properties);
}

const CORNERS = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];

for (const situation of SITUATIONS) {
  test(`the page, the period bar and the paper are separate raised surfaces; the week bands and the footer stand square on the paper (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
    await prepare(page, situation, signInThroughUi);
    const project = testInfo.project.name;
    const lines: string[] = [`# ${project} / ${situation.name}: surfaces`];

    const pageBackground = parseColour(await computedStyle(page.locator('body'), 'backgroundColor'));
    expect(pageBackground[3], 'the page background is opaque').toBe(1);

    // Card on page: the period bar, the week bands and the footer each step from the page by at least CARD_STEP.
    const periodBar = page.locator('section.period-bar');
    const weeks = page.locator('section.sheet-week');
    const footer = page.locator('.sheet-footer');
    await expect(periodBar).toHaveCount(1);
    await expect(weeks).toHaveCount(2);
    await expect(footer).toHaveCount(1);

    // Round 4 (U4-03): the toolbar, the week sheets and the footer stand on one paper. The paper and the period bar are the raised
    // surfaces; the week sheets and the footer lose only their own outer shadow inside the paper (the frame and the header strip stay).
    const paper = page.locator('[data-paper="timesheet"]');
    await expect(paper).toHaveCount(1);
    const surfaces: { name: string; locator: Locator; raised: boolean }[] = [
      { name: 'period bar', locator: periodBar, raised: true },
      { name: 'paper', locator: paper, raised: true },
      { name: 'week 1', locator: weeks.nth(0), raised: false },
      { name: 'week 2', locator: weeks.nth(1), raised: false },
      { name: 'footer', locator: footer, raised: false },
    ];
    for (const surface of surfaces) {
      const fill = await flattenedBackground(surface.locator);
      const ratio = contrast(fill, pageBackground);
      lines.push(`card on page: ${surface.name} ${round(ratio)}:1`);
      expect(ratio, `${surface.name} against the page (${situation.name})`).toBeGreaterThanOrEqual(CARD_STEP);
      const style = await computed(surface.locator, ['box-shadow', ...CORNERS]);
      lines.push(`${surface.name} box-shadow ${style['box-shadow']}`);
      if (!surface.raised) {
        expect(style['box-shadow'], `${surface.name} casts no shadow of its own inside the paper`).toBe('none');
        continue;
      }
      expect(style['box-shadow'], `${surface.name} is raised`).not.toBe('none');
      const layers = parseLayers(style['box-shadow'] ?? 'none');
      expect(layers.length, `${surface.name} carries a ring and soft layers (${style['box-shadow']})`).toBeGreaterThanOrEqual(3);
      expect(
        layers.some((layer) => !layer.inset && layer.spread === 1 && layer.offsetX === 0 && layer.offsetY === 0),
        `${surface.name} has the 1px hairline ring`,
      ).toBe(true);
    }

    // The week bands and the footer are square; the period bar and the paper follow the radius scale (12px).
    for (const surface of surfaces.filter((item) => !item.raised)) {
      const corners = await computed(surface.locator, CORNERS);
      for (const corner of CORNERS) expect(corners[corner], `${surface.name} ${corner}`).toBe('0px');
    }
    // WP5-UX5-T04 (U5-22): the compact paper (below 480px) stands 8px from the window edges and keeps the card corner, like the period bar
    // (it was full-bleed and square below 768px).
    for (const surface of surfaces.filter((item) => item.raised)) {
      const corners = await computed(surface.locator, CORNERS);
      for (const corner of CORNERS) expect(corners[corner], `${surface.name} ${corner}`).toBe('12px');
    }

    // The footer holds the legend and the Overtime Total (and the signature lines on the owner's own sheet); it sits in the sheet, inside the paper, and not in a week band.
    await expect(footer.locator('.legend')).toHaveCount(1);
    await expect(footer.locator('.ot-total')).toHaveCount(1);
    await expect(footer.locator('.signatures')).toHaveCount(1);
    expect(await footer.evaluate((element) => element.closest('.sheet-week') === null && element.parentElement?.classList.contains('sheet') === true && element.closest('[data-paper]') !== null)).toBe(true);

    // The tokens behind the surfaces, as this theme resolves them (evidence for the contrast table).
    const card = await tokenColour(page, '--card');
    for (const token of ['--panel-head', '--row-alt', '--sheet-head', '--sheet-head-strong']) lines.push(`${token} on card ${round(contrast(await tokenColour(page, token), card))}:1`);

    // The toolbar and the form header sit on the paper: the surface behind them is the card colour, and the paper is what steps from the page.
    for (const name of ['.tools', 'header.form-head']) {
      const backdrop = backdropOf(await backdropsAbove(page.locator(name)));
      const ratio = contrast(backdrop, card);
      lines.push(`${name} backdrop against the card ${round(ratio)}:1`);
      expect(ratio, `${name} stands on the paper (the card colour)`).toBeLessThan(1.01);
      expect(await page.locator(name).evaluate((element) => element.closest('[data-paper]') !== null), `${name} is inside the paper`).toBe(true);
    }
    const main = page.locator('.sheet-area > .sheet-main');
    expect((await computed(main, ['box-shadow']))['box-shadow'], 'the sheet column is the paper and is raised').not.toBe('none');
    expect(parseColour(await computedStyle(main, 'backgroundColor'))[3], 'the paper is opaque').toBe(1);

    record(project, situation, lines);
    if (project === 'desktop') await page.screenshot({ path: screenshotPath(`t01-surfaces-${situation.slug}-${project}-synthetic.png`), fullPage: true, animations: 'disabled' });
  });

  test(`the shared focus ring reaches 3:1 on the page, the period bar, a week band and the footer (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
    await prepare(page, situation, signInThroughUi);
    const lines: string[] = [`# ${testInfo.project.name} / ${situation.name}: focus ring on each new surface`];
    const targets: { surface: string; control: Locator }[] = [
      { surface: 'page (toolbar)', control: page.getByRole('button', { name: 'Change several days', exact: true }) },
      { surface: 'period bar', control: page.getByRole('button', { name: 'Next period', exact: true }) },
      { surface: 'week band', control: page.locator('[data-day-button]').first() },
      { surface: 'footer', control: page.locator('[data-sheet-review-link]') },
    ];
    for (const { surface, control } of targets) {
      await expect(control).toBeVisible();
      await focusFromKeyboard(control);
      const ring = await measureFocusRing(control);
      lines.push(`${surface}: ring against backdrop ${round(ring.ringAgainstBackdrop)}:1, against gap ${round(ring.ringAgainstGap)}:1, gap against fill ${ring.gapAgainstFill === null ? 'n/a' : round(ring.gapAgainstFill)}:1`);
      expect(ring.ringAgainstBackdrop, `${surface}: ring against the surface (${ring.layers})`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(ring.ringAgainstGap, `${surface}: ring against its gap`).toBeGreaterThanOrEqual(NON_TEXT);
      // The gap layer is the card colour; against a control filled with the card colour it is 1:1 by design (the ring is what carries the 3:1).
    }
    record(testInfo.project.name, situation, lines);
  });
}

/* ---- Motion --------------------------------------------------------------------------------------------- */

/** The computed transition durations of one element, in seconds (one value per listed property). */
async function durations(locator: Locator): Promise<number[]> {
  const text = (await computed(locator, ['transition-duration']))['transition-duration'] ?? '';
  return text.split(',').map((part) => {
    const value = part.trim();
    return value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);
  });
}

test('interactive transitions list the changing properties, are 180ms normally and 0.01ms under prefers-reduced-motion', async ({ page, signInThroughUi }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const controls: { name: string; locator: Locator }[] = [
    { name: 'button (Change several days)', locator: page.getByRole('button', { name: 'Change several days', exact: true }) },
    { name: 'button (Next period)', locator: page.getByRole('button', { name: 'Next period', exact: true }) },
    { name: 'date field (Open a day)', locator: page.getByLabel('Open a day') },
    { name: 'sheet day', locator: page.locator('[data-day]').first() },
    { name: 'switch (Show worked hours)', locator: page.getByRole('switch', { name: 'Show worked hours', exact: true }) },
  ];
  const lines = [`# ${testInfo.project.name}: transitions`];
  for (const control of controls) {
    await expect(control.locator).toBeAttached();
    const properties = (await computed(control.locator, ['transition-property']))['transition-property'] ?? '';
    expect(properties, `${control.name}: the transitioned properties`).not.toMatch(/\ball\b/);
    expect(properties.split(',').map((part) => part.trim()), `${control.name}: the transitioned properties`).toContain('box-shadow');
    const normal = await durations(control.locator);
    expect(normal.length).toBeGreaterThan(0);
    for (const seconds of normal) expect(seconds, `${control.name}: normal duration`).toBeCloseTo(0.18, 3);
    lines.push(`${control.name}: normal ${normal.join('s,')}s; properties ${properties}`);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const control of controls) {
    await expect.poll(async () => Math.max(...(await durations(control.locator))), { message: `${control.name}: reduced-motion duration` }).toBeLessThanOrEqual(REDUCED_SECONDS);
    lines.push(`${control.name}: reduced ${(await durations(control.locator)).join('s,')}s`);
  }
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  appendFileSync(join(SCREENSHOT_DIR, `surfaces-${testInfo.project.name}-motion.txt`), `${lines.join('\n')}\n`, 'utf8');
});

/* ---- No horizontal scroll -------------------------------------------------------------------------------- */

const WIDTHS = [320, 390, 768, 1280, 1440] as const;

for (const situation of SITUATIONS) {
  test(`no horizontal scroll at 320, 390, 768, 1280 and 1440 and every card stays inside the viewport (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
    await prepare(page, situation, signInThroughUi);
    const lines = [`# ${testInfo.project.name} / ${situation.name}: no horizontal scroll`];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('[data-day]')).toHaveCount(14);
      const measure = () => page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
      await expect.poll(async () => (await measure()).scroll - (await measure()).inner, { message: `the page fits ${width}px wide (${situation.name})` }).toBeLessThanOrEqual(0);
      const widths = await measure();
      for (const name of ['section.period-bar', 'section.sheet-week', '.sheet-footer']) {
        const boxes = await page.locator(name).evaluateAll((elements) =>
          elements.map((element) => {
            const box = element.getBoundingClientRect();
            return { left: box.left, right: box.right };
          }),
        );
        expect(boxes.length).toBeGreaterThan(0);
        for (const box of boxes) {
          expect(box.left, `${name} left edge at ${width}px`).toBeGreaterThanOrEqual(0);
          expect(box.right, `${name} right edge at ${width}px`).toBeLessThanOrEqual(widths.inner);
        }
      }
      lines.push(`${width}px: scrollWidth ${widths.scroll} <= innerWidth ${widths.inner}`);
    }
    record(testInfo.project.name, situation, lines);
  });
}

/* ---- WP5-UX5-T04 (U5-01, U5-15, owner decision F-6 a): the two layout breakpoints, 768px (the shell) and 480px (the sheet) ---------- */

/**
 * What one layout looks like at one width of the real page: how many sheet layouts are in the DOM and which, what their styles say
 * (a table that is displayed, a grid that is displayed), which bar the shell shows (the tab bar or the navigation), and whether the page
 * or the week card scrolls sideways.
 */
interface LayoutFacts {
  phone: number;
  desktop: number;
  tables: number;
  grids: number;
  tableDisplay: string;
  gridDisplay: string;
  tabs: string;
  nav: string;
  scroll: number;
  inner: number;
  weekScrolls: boolean;
}

const LAYOUT_FACTS_SCRIPT = `(() => {
  const display = (selector) => {
    const element = document.querySelector(selector);
    return element === null ? 'absent' : getComputedStyle(element).display;
  };
  const week = document.querySelector('.sheet-week');
  return {
    phone: document.querySelectorAll('[data-sheet="phone"]').length,
    desktop: document.querySelectorAll('[data-sheet="desktop"]').length,
    tables: document.querySelectorAll('.sheet-table').length,
    grids: document.querySelectorAll('.week-grid').length,
    tableDisplay: display('.sheet-table'),
    gridDisplay: display('.week-grid'),
    tabs: display('.shell-tabs'),
    nav: display('.shell-nav'),
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
    weekScrolls: week !== null && week.scrollWidth > week.clientWidth + 1,
  };
})()`;

const layoutFacts = (page: Page) => page.evaluate<LayoutFacts>(LAYOUT_FACTS_SCRIPT);

/** One frame of the sweep: the width asked for, the width the frame has, what `matchMedia` says there and what the style sheet's rules did. */
interface FrameRow {
  width: number;
  inner: number;
  shell: boolean;
  sheet: boolean;
  tabs: string;
  head: string;
  title: string;
  paper: string;
  overflow: string;
  checkPadding: string;
}

/** The script that builds one iframe per width of `widths` with the built style sheet and reads the probes (see the test below). */
function frameSweepScript(href: string, widths: number[]): string {
  return `(async () => {
    const out = [];
    for (const width of ${JSON.stringify(widths)}) {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'border:0;height:400px;width:' + width + 'px';
      document.body.append(frame);
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      doc.body.innerHTML = '<header class="page-head"></header><nav class="shell-tabs"></nav><h2 class="form-title"></h2><section class="paper"></section><section class="sheet-week"></section><div class="check-card"></div>';
      await new Promise((resolve, reject) => {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = ${JSON.stringify(href)};
        link.onload = () => resolve(null);
        link.onerror = () => reject(new Error('the style sheet did not load'));
        doc.head.append(link);
      });
      const style = (selector, property) => win.getComputedStyle(doc.querySelector(selector)).getPropertyValue(property);
      out.push({
        width,
        inner: win.innerWidth,
        shell: win.matchMedia(${JSON.stringify(SHELL_QUERY)}).matches,
        sheet: win.matchMedia(${JSON.stringify(SHEET_QUERY)}).matches,
        tabs: style('.shell-tabs', 'display'),
        head: style('.page-head', 'position'),
        title: style('.form-title', 'position'),
        paper: style('.paper', 'margin-inline-start'),
        overflow: style('.sheet-week', 'overflow-x'),
        checkPadding: style('.check-card', 'padding-top'),
      });
      frame.remove();
    }
    return out;
  })()`;
}

test.describe('layout breakpoints (U5-01, U5-15)', () => {
  test.skip(({ isMobile }) => isMobile, 'The width sweeps resize the window of the desktop project');

  test('exactly one sheet layout stands at every width and its styles apply: the 4-column table below 480px, the 7-column grid from 480px; the tab bar below 768px, the navigation from 768px; the page never scrolls sideways', async ({
    page,
    signInThroughUi,
  }) => {
    test.setTimeout(90_000);
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    for (const width of [320, 360, 390, 479, 480, 481, 600, 700, 767, 768, 769, 929, 930, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const compact = width < 480;
      const phoneBar = width < 768;
      // The script follows the media query with a re-render: wait for it, then read the page (the CSS answers at once).
      await expect(page.locator('[data-sheet="phone"]')).toHaveCount(compact ? 1 : 0);
      const facts = await layoutFacts(page);
      expect(facts.phone, `${width}px: the phone sheet in the DOM`).toBe(compact ? 1 : 0);
      expect(facts.desktop, `${width}px: the 7-column sheet in the DOM`).toBe(compact ? 0 : 1);
      expect(facts.tables, `${width}px: two week tables or none`).toBe(compact ? 2 : 0);
      expect(facts.grids, `${width}px: two week grids or none`).toBe(compact ? 0 : 2);
      // The styles of the layout in the DOM apply (a table that is not a table, or a grid that is not a grid, is the hole of U5-15).
      expect(facts[compact ? 'tableDisplay' : 'gridDisplay'], `${width}px: the sheet in the DOM is displayed as its layout`).toBe(compact ? 'table' : 'grid');
      expect(facts.tabs, `${width}px: the tab bar`).toBe(phoneBar ? 'grid' : 'none');
      expect(facts.nav, `${width}px: the navigation of the top bar`).toBe(phoneBar ? 'none' : 'flex');
      expect(facts.scroll, `${width}px: no sideways scroll of the page`).toBeLessThanOrEqual(facts.inner);
      // From 480px the seven columns scroll inside the week card until the page is wide enough: the grid needs 850px (the label column, seven
      // columns of 108px and the hairlines) plus the 32px page padding and the 32px paper padding, so 914px; below 480 the table fits.
      expect(facts.weekScrolls, `${width}px: the week card scrolls sideways only where the seven columns do not fit`).toBe(width >= 480 && width < 914);
    }
  });

  test('at 600px the tab bar and the 7-column grid show together, and the first day row of a 390x844 phone is above the tab bar', async ({ page, signInThroughUi }) => {
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.setViewportSize({ width: 600, height: 900 });
    await expect(page.locator('.shell-tabs')).toBeVisible();
    await expect(page.locator('.week-grid').first()).toBeVisible();
    await expect(page.locator('.sheet-table')).toHaveCount(0);
    expect((await layoutFacts(page)).scroll, 'no page sideways scroll at 600px').toBeLessThanOrEqual(600);
    await page.setViewportSize({ width: 390, height: 844 });
    const first = await page.locator('[data-day]').first().boundingBox();
    const tabs = await page.locator('.shell-tabs').boundingBox();
    expect((first?.y ?? 0) + (first?.height ?? 0), 'the first day row is above the tab bar at 390x844').toBeLessThanOrEqual(tabs?.y ?? 0);
  });
  test('matchMedia and the style sheet switch at the same width: sweeps 470 to 490 and 760 to 776 in 1px steps', async ({ page, builtServer }) => {
    test.setTimeout(120_000);
    // A same-origin page of the spec's own (no CSP): iframes of every width load the built style sheet, so the browser decides the media
    // queries of the frame as it does for a window of that width. A Playwright viewport takes whole pixels and a frame snaps to them (probed
    // in WP5-UX5-T04: a 479.33px frame reads 479, a 479.67px frame 480), so the 1/3px steps and the widths of 125% and 150% display scaling
    // (479.2, 479.33, 767.2, 767.33) are checked on the style sheet's text in tests/client/layoutQueries.test.ts.
    const html = await (await page.request.get('/')).text();
    const href = /href="(\/assets\/[^"]+\.css)"/.exec(html)?.[1];
    expect(href, 'the built style sheet is linked from the page').toBeDefined();
    await page.route(`${builtServer.origin}/zz-breakpoints.html`, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><body></body>' }));
    await page.goto('/zz-breakpoints.html');
    const widths: number[] = [];
    for (const [from, to] of [
      [470, 490],
      [760, 776],
    ] as const) for (let width = from; width <= to; width += 1) widths.push(width);
    const rows = await page.evaluate<FrameRow[]>(frameSweepScript(href ?? '', widths));
    expect(rows.length).toBe(widths.length);
    const mismatches: string[] = [];
    for (const row of rows) {
      const say = (what: string) => mismatches.push(`${row.width}px: ${what}`);
      if (row.inner !== row.width) say(`the frame is ${row.inner}px wide`);
      // The script and the style sheet agree on every width: the shell rules (tab bar, hidden page heading) and the sheet rules (form title,
      // paper margin, check card padding, sideways scroll) apply exactly where the matching query says they do.
      if ((row.tabs === 'grid') !== !row.shell) say(`the tab bar is ${row.tabs} while matchMedia(shell) is ${row.shell}`);
      if ((row.head === 'absolute') !== !row.shell) say(`the page heading is ${row.head} while matchMedia(shell) is ${row.shell}`);
      if ((row.title === 'absolute') !== !row.sheet) say(`the form title is ${row.title} while matchMedia(sheet) is ${row.sheet}`);
      if ((row.paper === '-8px') !== !row.sheet) say(`the paper margin is ${row.paper} while matchMedia(sheet) is ${row.sheet}`);
      if ((row.checkPadding === '12px') !== !row.sheet) say(`the check card padding is ${row.checkPadding} while matchMedia(sheet) is ${row.sheet}`);
      if ((row.overflow === 'auto') !== (row.sheet && row.width < 930)) say(`the week card overflow is ${row.overflow} while matchMedia(sheet) is ${row.sheet}`);
      // Every width is on exactly one side of each breakpoint: the two queries are the two documented values.
      if (row.shell !== row.width >= 768) say(`matchMedia(shell) is ${row.shell}`);
      if (row.sheet !== row.width >= 480) say(`matchMedia(sheet) is ${row.sheet}`);
    }
    expect(mismatches, 'no width where the script and the style sheet disagree').toEqual([]);
  });
});
