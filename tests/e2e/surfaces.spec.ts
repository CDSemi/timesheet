import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { backdropOf, backdropsAbove, computedStyle, contrast, flattenedBackground, focusFromKeyboard, measureFocusRing, parseColour, parseLayers, tokenColour } from './contrast.ts';
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
  test(`the page, the period bar, the week bands and the footer are separate surfaces: week bands and footer square and raised (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
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

    const surfaces: { name: string; locator: Locator }[] = [
      { name: 'period bar', locator: periodBar },
      { name: 'week 1', locator: weeks.nth(0) },
      { name: 'week 2', locator: weeks.nth(1) },
      { name: 'footer', locator: footer },
    ];
    for (const surface of surfaces) {
      const fill = await flattenedBackground(surface.locator);
      const ratio = contrast(fill, pageBackground);
      lines.push(`card on page: ${surface.name} ${round(ratio)}:1`);
      expect(ratio, `${surface.name} against the page (${situation.name})`).toBeGreaterThanOrEqual(CARD_STEP);
      const style = await computed(surface.locator, ['box-shadow', ...CORNERS]);
      expect(style['box-shadow'], `${surface.name} is raised`).not.toBe('none');
      const layers = parseLayers(style['box-shadow'] ?? 'none');
      expect(layers.length, `${surface.name} carries a ring and soft layers (${style['box-shadow']})`).toBeGreaterThanOrEqual(3);
      expect(
        layers.some((layer) => !layer.inset && layer.spread === 1 && layer.offsetX === 0 && layer.offsetY === 0),
        `${surface.name} has the 1px hairline ring`,
      ).toBe(true);
      lines.push(`${surface.name} box-shadow ${style['box-shadow']}`);
    }

    // The week bands and the footer are square; the period bar follows the radius scale (12px).
    for (const surface of surfaces.slice(1)) {
      const corners = await computed(surface.locator, CORNERS);
      for (const corner of CORNERS) expect(corners[corner], `${surface.name} ${corner}`).toBe('0px');
    }
    const barCorners = await computed(periodBar, CORNERS);
    for (const corner of CORNERS) expect(barCorners[corner], `period bar ${corner}`).toBe('12px');

    // The footer is its own card: it holds the legend and the Overtime Total (and the signature lines on the owner's own sheet),
    // and it is not nested in a week band or in another raised card.
    await expect(footer.locator('.legend')).toHaveCount(1);
    await expect(footer.locator('.ot-total')).toHaveCount(1);
    await expect(footer.locator('.signatures')).toHaveCount(1);
    expect(await footer.evaluate((element) => element.closest('.sheet-week') === null && element.parentElement?.classList.contains('sheet') === true)).toBe(true);

    // The tokens behind the surfaces, as this theme resolves them (evidence for the contrast table).
    const card = await tokenColour(page, '--card');
    for (const token of ['--panel-head', '--row-alt', '--sheet-head']) lines.push(`${token} on card ${round(contrast(await tokenColour(page, token), card))}:1`);

    // The toolbar and the form header sit on the page: nothing painted behind them but the page.
    for (const name of ['.tools', 'header.form-head']) {
      const backdrop = backdropOf(await backdropsAbove(page.locator(name)));
      const ratio = contrast(backdrop, pageBackground);
      lines.push(`${name} backdrop against the page ${round(ratio)}:1`);
      expect(ratio, `${name} stands on the page`).toBeLessThan(1.01);
    }
    const main = page.locator('.sheet-area > .sheet-main');
    expect((await computed(main, ['box-shadow']))['box-shadow'], 'the sheet column has no surface of its own').toBe('none');
    expect(parseColour(await computedStyle(main, 'backgroundColor'))[3], 'the sheet column is transparent').toBe(0);

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
    { name: 'switch (Show details)', locator: page.getByRole('switch', { name: 'Show details', exact: true }) },
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
