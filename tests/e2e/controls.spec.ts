import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { computedStyle, contrast, flattenedBackground, parseColour, parseLayers, textContrast, tokenColour } from './contrast.ts';
import { expect, newPerson, SCREENSHOT_DIR, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX4-T01 (round 4, owner answer F-5): the paper sheet, the title gap, the stronger week header and first column, the round
 * switches, the select arrow and the centred checkboxes. Every number is read from the browser's computed style or layout; nothing
 * here depends on the date or the time of day. The paper holds the toolbar, the sheet and its footer; the title row and the period
 * card stay outside. A control scan walks the screens that carry switches, selects and checkboxes.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

type Theme = 'light' | 'dark';
const THEMES: readonly Theme[] = ['light', 'dark'];
/** The least step between the page and the paper (the round-3 card step). */
const CARD_STEP = 1.12;
/** WCAG 2.2 SC 1.4.11 (non-text) and SC 1.4.3 (text). */
const NON_TEXT = 3;
const TEXT = 4.5;
const round = (value: number) => Math.round(value * 100) / 100;

function record(testInfo: { project: { name: string } }, name: string, lines: string[]): void {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  appendFileSync(join(SCREENSHOT_DIR, `controls-${testInfo.project.name}-${name}.txt`), `${lines.join('\n')}\n`, 'utf8');
}

async function openTimesheet(page: Page, theme: Theme, signIn: () => Promise<void>): Promise<void> {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await signIn();
  await expect(page.locator('[data-day]')).toHaveCount(14);
}

async function boxOf(locator: Locator): Promise<{ top: number; bottom: number; left: number; right: number; width: number; height: number }> {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height };
  });
}

async function px(locator: Locator, property: string): Promise<number> {
  return locator.evaluate((element, name) => parseFloat(element.ownerDocument.defaultView?.getComputedStyle(element).getPropertyValue(name) ?? '0'), property);
}

/* ---- Title gap (U4-02, owner: 32px) ------------------------------------------------------------------------------------ */

for (const theme of THEMES) {
  test(`the title row is 32px above the period card at 768, 1024, 1440 and 1920 and the head is unchanged on a phone (${theme})`, async ({ page, signInThroughUi }, testInfo) => {
    await openTimesheet(page, theme, signInThroughUi);
    const lines = [`# ${testInfo.project.name} / ${theme}: title gap`];
    for (const width of [768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const head = page.locator('header.page-head');
      const card = page.locator('.workbar');
      await expect(head).toBeVisible();
      const gap = (await boxOf(card)).top - (await boxOf(head)).bottom;
      lines.push(`${width}px: period card top - title row bottom = ${round(gap)}px`);
      expect(gap, `title row to period card at ${width}px`).toBeCloseTo(32, 0);
      expect(await px(head, 'margin-bottom'), `title row margin at ${width}px`).toBe(32);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await px(page.locator('header.page-head'), 'margin-bottom'), 'below 768px the head keeps no extra gap').toBe(0);
    record(testInfo, 'title-gap', lines);
  });
}

test('Review and sign off: the title row is 32px above the next block from 768px and keeps its gap on a phone', async ({ page, signInThroughUi, employeeSeed }, testInfo) => {
  const { currentPayrollDate } = await employeeSeed.today();
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.evaluate(`window.location.hash = '#/review/${currentPayrollDate}'`);
  const head = page.locator('header.review-head');
  await expect(head).toBeVisible();
  await expect(page.locator('[data-paper="review"]')).toBeVisible();
  const lines = [`# ${testInfo.project.name}: review title gap`];
  for (const width of [768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const next = head.locator('xpath=following-sibling::*[1]');
    const gap = (await boxOf(next)).top - (await boxOf(head)).bottom;
    lines.push(`${width}px: next block top - title row bottom = ${round(gap)}px`);
    expect(gap, `review title row to the next block at ${width}px`).toBeCloseTo(32, 0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const phoneMargin = await px(head, 'margin-bottom');
  lines.push(`390px: head margin ${phoneMargin}px (unchanged: the toolbar's 12px)`);
  expect(phoneMargin, 'below 768px the head keeps its own 12px margin').toBe(12);
  record(testInfo, 'title-gap', lines);
});

/* ---- The paper sheet (U4-03) ------------------------------------------------------------------------------------------ */

for (const theme of THEMES) {
  test(`Timesheet: one paper holds the toolbar, the sheet and the footer; the title row and the period card stay outside (${theme})`, async ({ page, signInThroughUi }, testInfo) => {
    await openTimesheet(page, theme, signInThroughUi);
    const lines = [`# ${testInfo.project.name} / ${theme}: Timesheet paper`];
    const paper = page.locator('[data-paper]');
    await expect(paper).toHaveCount(1);
    await expect(paper).toHaveAttribute('data-paper', 'timesheet');
    for (const inside of ['.tools', 'header.form-head', '.legend', '.ot-total', '.signatures', '.sheet-footer']) {
      await expect(paper.locator(inside), `the paper holds ${inside}`).toHaveCount(1);
    }
    await expect(paper.locator('section.sheet-week'), 'the paper holds both week sheets').toHaveCount(2);
    await expect(paper.locator('h1'), 'the title row stays outside the paper').toHaveCount(0);
    await expect(paper.locator('.period-bar'), 'the period card stays outside the paper').toHaveCount(0);
    await expect(page.locator('[data-paper] ~ *, .workbar [data-paper]')).toHaveCount(0);

    for (const width of [1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const pageBackground = parseColour(await computedStyle(page.locator('body'), 'backgroundColor'));
      const fill = await flattenedBackground(paper);
      const card = await tokenColour(page, '--card');
      expect(round(contrast(fill, card)), `the paper is the card colour at ${width}px`).toBeLessThan(1.01);
      const step = contrast(fill, pageBackground);
      lines.push(`${width}px: paper on page ${round(step)}:1`);
      expect(step, `the paper steps from the page at ${width}px`).toBeGreaterThanOrEqual(CARD_STEP);
      const style = await paper.evaluate((element) => {
        const computed = element.ownerDocument.defaultView?.getComputedStyle(element);
        return { shadow: computed?.boxShadow ?? '', radius: computed?.borderTopLeftRadius ?? '', pad: computed?.paddingLeft ?? '', overflow: computed?.overflow ?? '' };
      });
      const layers = parseLayers(style.shadow);
      expect(layers.length, `the paper carries a ring and soft layers (${style.shadow})`).toBeGreaterThanOrEqual(3);
      expect(layers.some((layer) => !layer.inset && layer.spread === 1 && layer.offsetX === 0 && layer.offsetY === 0), 'the paper has the hairline ring').toBe(true);
      expect(style.radius, 'the paper corner is on the radius scale').toBe('12px');
      expect(style.pad, 'the paper padding').toBe('16px');
      expect(style.overflow, 'the paper clips nothing').toBe('visible');
      lines.push(`${width}px: paper box-shadow ${style.shadow}; radius ${style.radius}; padding ${style.pad}`);
      // The week sheets and the footer lose only their own outer shadow; the frame and the header strip stay.
      for (const inner of ['section.sheet-week', '.sheet-footer']) {
        for (const element of await page.locator(inner).all()) {
          expect(await computedStyle(element, 'boxShadow'), `${inner} inside the paper has no shadow of its own`).toBe('none');
        }
      }
      expect(await px(page.locator('.week-grid').first(), 'border-top-width'), 'the week frame stays').toBe(1);
      await expect(page.locator('.week-bar').first()).toBeVisible();
      // Containment: every part lies inside the paper's box.
      const outer = await boxOf(paper);
      for (const inside of ['.tools', 'header.form-head', 'section.sheet-week', '.sheet-footer']) {
        for (const element of await paper.locator(inside).all()) {
          const box = await boxOf(element);
          expect(box.left, `${inside} left at ${width}px`).toBeGreaterThanOrEqual(outer.left + 15.5);
          expect(box.right, `${inside} right at ${width}px`).toBeLessThanOrEqual(outer.right - 15.5);
          expect(box.top, `${inside} top at ${width}px`).toBeGreaterThanOrEqual(outer.top);
          expect(box.bottom, `${inside} bottom at ${width}px`).toBeLessThanOrEqual(outer.bottom);
        }
      }
      const head = await boxOf(page.locator('header.page-head'));
      const bar = await boxOf(page.locator('.workbar'));
      expect(head.bottom, 'the title row is above the paper').toBeLessThanOrEqual(outer.top);
      expect(bar.bottom, 'the period card is above the paper').toBeLessThanOrEqual(outer.top);
    }
    record(testInfo, 'paper', lines);
    if (testInfo.project.name === 'desktop' && theme === 'light') await page.screenshot({ path: screenshotPath('ux4-t01-paper-timesheet-1440-light-synthetic.png'), fullPage: true, animations: 'disabled' });
    if (testInfo.project.name === 'desktop' && theme === 'dark') await page.screenshot({ path: screenshotPath('ux4-t01-paper-timesheet-1440-dark-synthetic.png'), fullPage: true, animations: 'disabled' });
  });
}

// WP5-UX5-T04 (U5-22): below 480px the period card and the paper stand 8px from each window edge (they were full-bleed below 768px), the
// paper keeps the card corner and pads 8px, so the table keeps its width.
test('Timesheet in the compact form: the period card and the paper stand 8px from the window edges with the card corner, the table keeps its width and nothing scrolls sideways', async ({ page, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The compact form is measured on the 390x844 phone');
  await openTimesheet(page, 'light', signInThroughUi);
  const lines = [`# ${testInfo.project.name}: compact paper`];
  for (const width of [320, 360, 390, 479]) {
    await page.setViewportSize({ width, height: 844 });
    const paper = page.locator('[data-paper="timesheet"]');
    const box = await boxOf(paper);
    const card = await boxOf(page.locator('section.period-bar'));
    expect(card.left, `the period card is 8px from the left edge at ${width}px`).toBeCloseTo(8, 0);
    expect(card.right, `the period card is 8px from the right edge at ${width}px`).toBeCloseTo(width - 8, 0);
    expect(box.left, `the paper is 8px from the left edge at ${width}px`).toBeCloseTo(8, 0);
    expect(box.right, `the paper is 8px from the right edge at ${width}px`).toBeCloseTo(width - 8, 0);
    expect(await paper.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).borderTopLeftRadius), 'the compact paper has the card corner').toBe('12px');
    expect(await paper.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).paddingLeft), 'and 8px of padding').toBe('8px');
    const table = await boxOf(page.locator('.sheet-table').first());
    // The table keeps the width it had before: the 8px edge and the 8px padding on each side leave the window less 32px (358px at 390px).
    lines.push(`${width}px: card ${round(card.width)}px, paper ${round(box.width)}px, table ${round(table.width)}px`);
    expect(table.width, `the table width at ${width}px`).toBeCloseTo(width - 32, 0);
    if (width === 390) expect(Math.abs(table.width - 358), 'the table is 358px at 390px').toBeLessThanOrEqual(1);
    const widths = await page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
    expect(widths.scroll, `no sideways scroll at ${width}px`).toBeLessThanOrEqual(widths.inner);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const row = await boxOf(page.locator('[data-day]').first());
  const tabs = await boxOf(page.getByRole('navigation', { name: 'Main' }));
  lines.push(`390x844: first day row bottom ${round(row.bottom)}px, tab bar top ${round(tabs.top)}px`);
  expect(row.bottom, 'the first day row is above the tab bar').toBeLessThanOrEqual(tabs.top + 0.5);
  record(testInfo, 'paper', lines);
  await page.screenshot({ path: screenshotPath('ux4-t01-paper-timesheet-390-synthetic.png'), animations: 'disabled' });
});

for (const theme of THEMES) {
  test(`Review and sign off: the Preview card holds the sheet in one column at every width (${theme})`, async ({ page, signInThroughUi, employeeSeed }, testInfo) => {
    const { currentPayrollDate } = await employeeSeed.today();
    await openTimesheet(page, theme, signInThroughUi);
    await page.evaluate(`window.location.hash = '#/review/${currentPayrollDate}'`);
    const paper = page.locator('[data-paper]');
    await expect(paper).toHaveCount(1);
    await expect(paper).toHaveAttribute('data-paper', 'review');
    const lines = [`# ${testInfo.project.name} / ${theme}: Review paper`];
    // WP5-UX5-T03: "What you sign" and its hint are gone; the card has a header bar ("Preview") and the sheet, and the checklist is gone
    // (it moved into the Sign off dialog), so there is one column at every width.
    await expect(paper.getByRole('heading', { name: 'Preview', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What you sign' })).toHaveCount(0);
    await expect(paper.locator('article.sheet')).toHaveCount(1);
    await expect(paper.locator('section.sheet-week')).toHaveCount(2);
    await expect(paper.locator('.sheet-footer')).toHaveCount(1);
    await expect(paper.locator('h1')).toHaveCount(0);
    await expect(page.locator('.review-checklist, .review-layout, [data-step]'), 'no checklist and no second column').toHaveCount(0);

    const desktop = testInfo.project.name === 'desktop';
    for (const width of desktop ? [1440, 1330, 1280, 1024] : [390]) {
      await page.setViewportSize({ width, height: 900 });
      const pageBackground = parseColour(await computedStyle(page.locator('body'), 'backgroundColor'));
      const step = contrast(await flattenedBackground(paper), pageBackground);
      lines.push(`${width}px: paper on page ${round(step)}:1`);
      expect(step, `the review paper steps from the page at ${width}px`).toBeGreaterThanOrEqual(CARD_STEP);
      const style = await paper.evaluate((element) => {
        const view = element.ownerDocument.defaultView;
        const computed = view?.getComputedStyle(element);
        const body = element.querySelector('.preview-body');
        return { shadow: computed?.boxShadow ?? '', radius: computed?.borderTopLeftRadius ?? '', pad: body === null ? '' : (view?.getComputedStyle(body).paddingLeft ?? '') };
      });
      expect(parseLayers(style.shadow).length, `the review paper is raised (${style.shadow})`).toBeGreaterThanOrEqual(3);
      // WP5-UX5-T04 (U5-22): the card corner at every width; the body pads 16px, and 8px in the compact form (below 480px).
      expect(style.radius).toBe('12px');
      expect(style.pad).toBe(width < 480 ? '8px' : '16px');
      for (const inner of ['section.sheet-week', '.sheet-footer']) {
        for (const element of await page.locator(inner).all()) expect(await computedStyle(element, 'boxShadow')).toBe('none');
      }
      const outer = await boxOf(paper);
      // One column: the Send card follows the Preview, whatever the width.
      expect((await boxOf(page.locator('[data-send-card]'))).top, `the Send card follows the Preview at ${width}px`).toBeGreaterThanOrEqual(outer.bottom - 1);
      for (const inside of ['header.form-head', 'section.sheet-week', '.sheet-footer']) {
        for (const element of await paper.locator(inside).all()) {
          const box = await boxOf(element);
          expect(box.left, `${inside} left`).toBeGreaterThanOrEqual(outer.left);
          expect(box.right, `${inside} right`).toBeLessThanOrEqual(outer.right);
        }
      }
      // The seven columns never spill out of their week card.
      if (width >= 930) {
        for (const card of await paper.locator('section.sheet-week').all()) {
          const room = await card.evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));
          lines.push(`${width}px: week card scrollWidth ${room.scroll}, clientWidth ${room.client}`);
          expect(room.scroll, `the week card needs no sideways scroll at ${width}px`).toBeLessThanOrEqual(room.client);
          expect((await boxOf(card.locator('.week-grid'))).right, `the week grid stays inside the paper at ${width}px`).toBeLessThanOrEqual(outer.right - 15.5);
        }
      }
      if (width === 390) {
        expect(outer.left, 'the compact Preview card is 8px from the left edge').toBeCloseTo(8, 0);
        expect(outer.right, 'and 8px from the right edge').toBeCloseTo(382, 0);
        const widths = await page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
        expect(widths.scroll, 'no sideways scroll').toBeLessThanOrEqual(widths.inner);
      }
    }
    record(testInfo, 'paper', lines);
    if (desktop && theme === 'light') {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({ path: screenshotPath('ux4-t01-paper-review-1440-light-synthetic.png'), fullPage: true, animations: 'disabled' });
    }
  });
}

/* ---- The week header row and the first column (owner F-5) ----------------------------------------------------------- */

for (const theme of THEMES) {
  test(`the week header row and the first column are a step stronger than the date cells and keep their text at 4.5:1 (${theme})`, async ({ page, signInThroughUi }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The first column belongs to the seven-column sheet');
    await openTimesheet(page, theme, signInThroughUi);
    await page.setViewportSize({ width: 1440, height: 900 });
    const lines = [`# ${testInfo.project.name} / ${theme}: week emphasis`];
    // The date cell is the unfilled card of the week sheet: the stronger fills must step away from it.
    const date = page.locator('.sheet-day:not(.nonworking):not(.today) > .d-date').first();
    const dateFill = await flattenedBackground(date);
    for (const [name, locator, textLocators] of [
      ['week header row', page.locator('.week-bar').first(), [page.locator('.week-bar strong').first(), page.locator('.week-bar .mono').first()]],
      [
        'first column',
        page.locator('.row-labels').first(),
        [page.locator('.row-labels > div').nth(0), page.locator('.row-labels > div').nth(2), page.locator('.row-labels > div').nth(5)],
      ],
    ] as const) {
      const fill = await flattenedBackground(locator);
      const step = contrast(fill, dateFill);
      lines.push(`${name} fill against the date cell: ${round(step)}:1`);
      expect(step, `${name} differs visibly from the date cell`).toBeGreaterThanOrEqual(1.2);
      const token = await tokenColour(page, '--sheet-head');
      expect(contrast(fill, token), `${name} is stronger than the plain header strip --sheet-head`).toBeGreaterThan(1.05);
      for (const text of textLocators) {
        const ratio = await textContrast(text);
        lines.push(`${name} text: ${round(ratio)}:1`);
        expect(ratio, `${name} text contrast`).toBeGreaterThanOrEqual(TEXT);
      }
    }
    // The worked rows (Show worked hours) belong to the first column too.
    await page.getByRole('switch', { name: 'Show worked hours' }).check();
    await expect(page.locator('.row-labels').first().locator('> div')).toHaveCount(8);
    const worked = page.locator('.row-labels').first().locator('> div').nth(7);
    const workedFill = await flattenedBackground(worked);
    expect(contrast(workedFill, dateFill), 'the worked rows of the first column').toBeGreaterThanOrEqual(1.2);
    expect(await textContrast(worked), 'the worked row name').toBeGreaterThanOrEqual(TEXT);
    record(testInfo, 'week-emphasis', lines);
  });
}

/* ---- The control scan (U4-04, U4-08, U4-09) -------------------------------------------------------------------------- */

interface SwitchFact {
  name: string;
  appearance: string;
  radius: number;
  height: number;
  image: string;
}
interface SelectFact {
  name: string;
  appearance: string;
  arrowRight: number;
  arrowLayers: number;
  padEnd: number;
  noUrl: boolean;
}
interface CheckboxFact {
  name: string;
  delta: number;
  wfhDelta: number | null;
}

/** Everything the scan reads from the visible controls of the current screen, in one browser call. */
const SCAN_SCRIPT = String.raw`(() => {
  const visible = (element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };
  const words = (text) => (text || '').trim().replace(/\s+/g, ' ');
  const nameOf = (element) => {
    const aria = element.getAttribute('aria-label');
    if (aria) return aria;
    const label = element.closest('label');
    if (label === null) return element.tagName;
    const own = [...label.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join(' ');
    return words(own).slice(0, 60);
  };
  const switches = [...document.querySelectorAll('[role="switch"]')].filter(visible).map((element) => {
    const style = getComputedStyle(element);
    return { name: nameOf(element), appearance: style.appearance, radius: parseFloat(style.borderTopLeftRadius), height: element.getBoundingClientRect().height, image: style.backgroundImage };
  });
  const selects = [...document.querySelectorAll('select')].filter(visible).map((element) => {
    const style = getComputedStyle(element);
    const positions = style.backgroundPositionX.split(/,(?![^(]*\))/).map((part) => part.trim());
    const last = positions[positions.length - 1] || '';
    const match = /calc\(100% - ([\d.]+)px\)/.exec(last);
    const border = parseFloat(style.borderRightWidth);
    return {
      name: nameOf(element),
      appearance: style.appearance,
      arrowRight: match === null ? Number.NaN : parseFloat(match[1]) + border,
      arrowLayers: positions.length,
      padEnd: parseFloat(style.paddingRight),
      noUrl: !style.backgroundImage.includes('url('),
    };
  });
  const checkboxes = [];
  for (const element of document.querySelectorAll('input[type="checkbox"]:not([role="switch"])')) {
    const label = element.closest('label');
    if (!visible(element) || label === null) continue;
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    let first = null;
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if ((node.textContent || '').trim() !== '') {
        first = node;
        break;
      }
    }
    if (first === null) continue;
    const range = document.createRange();
    range.selectNodeContents(first);
    const line = range.getClientRects()[0];
    if (line === undefined) continue;
    const box = element.getBoundingClientRect();
    const centre = box.top + box.height / 2;
    let wfhDelta = null;
    if (label.classList.contains('label-wfh')) {
      const select = label.parentElement ? label.parentElement.querySelector('select') : null;
      if (select !== null) {
        const selectBox = select.getBoundingClientRect();
        // Only when they share a row (the box wraps below the select on a very narrow row).
        if (box.top < selectBox.bottom) wfhDelta = Math.abs(centre - (selectBox.top + selectBox.height / 2));
      }
    }
    checkboxes.push({ name: nameOf(element), delta: Math.abs(centre - (line.top + line.height / 2)), wfhDelta });
  }
  return { switches, selects, checkboxes };
})()`;

async function scan(page: Page): Promise<{ switches: SwitchFact[]; selects: SelectFact[]; checkboxes: CheckboxFact[] }> {
  return page.evaluate<{ switches: SwitchFact[]; selects: SelectFact[]; checkboxes: CheckboxFact[] }>(SCAN_SCRIPT);
}

/** Asserts the three promises on one scan and writes the numbers to the evidence file. */
async function expectControls(
  page: Page,
  where: string,
  facts: Awaited<ReturnType<typeof scan>>,
  lines: string[],
  minimum: { switches?: number; selects?: number; checkboxes?: number } = {},
): Promise<void> {
  expect(facts.switches.length, `${where}: switches found`).toBeGreaterThanOrEqual(minimum.switches ?? 0);
  expect(facts.selects.length, `${where}: selects found`).toBeGreaterThanOrEqual(minimum.selects ?? 0);
  expect(facts.checkboxes.length, `${where}: checkboxes found`).toBeGreaterThanOrEqual(minimum.checkboxes ?? 0);
  for (const item of facts.switches) {
    lines.push(`${where}: switch "${item.name}" radius ${item.radius}px height ${item.height}px appearance ${item.appearance}`);
    expect(item.appearance, `${where}: ${item.name} is drawn by the style sheet`).toBe('none');
    expect(item.radius, `${where}: switch "${item.name}" is round (radius >= height / 2)`).toBeGreaterThanOrEqual(item.height / 2);
    expect(item.image, `${where}: switch "${item.name}" has a round thumb`).toContain('radial-gradient');
  }
  const muted = await tokenColour(page, '--muted');
  const field = await tokenColour(page, '--field-bg');
  const arrowContrast = contrast(muted, field);
  for (const item of facts.selects) {
    lines.push(`${where}: select "${item.name}" arrow ${round(item.arrowRight)}px from the edge, end padding ${item.padEnd}px, arrow contrast ${round(arrowContrast)}:1`);
    expect(item.appearance, `${where}: select "${item.name}" has no native arrow`).toBe('none');
    expect(item.noUrl, `${where}: select "${item.name}" draws the arrow without url()`).toBe(true);
    expect(item.arrowLayers, `${where}: two gradient layers draw the chevron`).toBe(2);
    expect(Math.abs(item.arrowRight - 12), `${where}: select "${item.name}" arrow edge distance ${item.arrowRight}`).toBeLessThanOrEqual(1);
    expect(item.padEnd, `${where}: text stays clear of the arrow`).toBeGreaterThanOrEqual(12 + 14 + 8);
  }
  expect(arrowContrast, `${where}: the arrow against the field`).toBeGreaterThanOrEqual(NON_TEXT);
  for (const item of facts.checkboxes) {
    lines.push(`${where}: checkbox "${item.name}" ${round(item.delta)}px off its first text line${item.wfhDelta === null ? '' : `, ${round(item.wfhDelta)}px off the Category field`}`);
    expect(item.delta, `${where}: checkbox "${item.name}" is centred on its first text line`).toBeLessThanOrEqual(1);
    if (item.wfhDelta !== null) expect(item.wfhDelta, `${where}: the WFH checkbox is centred on the Category field`).toBeLessThanOrEqual(1);
  }
}

for (const theme of THEMES) {
  test(`Timesheet, Day editor, session and Check out dialogs: round switch, 12px select arrow, centred checkboxes (${theme})`, async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
    const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Controls' });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signInPageAs(person.account);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const lines = [`# ${testInfo.project.name} / ${theme}: controls on Timesheet`];
    const phone = testInfo.project.name === 'mobile';
    if (!phone) await page.setViewportSize({ width: 1440, height: 900 });

    // The toolbar: the switch.
    await expectControls(page, 'toolbar', await scan(page), lines, { switches: 1 });
    // Batch mode: the category select and the selection boxes.
    await page.getByRole('button', { name: 'Change several days', exact: true }).click();
    await expectControls(page, 'batch bar', await scan(page), lines, { selects: 1 });
    await page.getByRole('button', { name: 'Change several days', exact: true }).click();

    // The Day editor: Category and WFH, leave kind.
    await page.locator('[data-day-button]').first().click();
    const editor = page.getByRole('dialog').first();
    await expect(editor.getByRole('checkbox', { name: /Worked from home/ })).toBeVisible();
    await expectControls(page, 'Day editor', await scan(page), lines, { selects: 2, checkboxes: 1 });
    // The WFH box against the Category select, measured directly as well (the promise of U4-09).
    const wfh = editor.getByRole('checkbox', { name: /Worked from home/ });
    const select = editor.locator('.label-select select');
    const wfhBox = await boxOf(wfh);
    const selectBox = await boxOf(select);
    const delta = Math.abs(wfhBox.top + wfhBox.height / 2 - (selectBox.top + selectBox.height / 2));
    lines.push(`WFH checkbox centre - Category field centre = ${round(delta)}px`);
    expect(delta, 'WFH centred on the Category field').toBeLessThanOrEqual(1);
    if (testInfo.project.name === 'desktop' || phone) await page.screenshot({ path: screenshotPath(`ux4-t01-controls-${testInfo.project.name}-${theme}-synthetic.png`), animations: 'disabled' });

    // The session dialog: the zone select, if any, and "Confirm no breaks taken".
    await editor.getByRole('button', { name: 'Add session' }).click();
    const sessionDialog = page.getByRole('dialog').last();
    await expect(sessionDialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).toBeVisible();
    await expectControls(page, 'session dialog', await scan(page), lines, { checkboxes: 1 });
    record(testInfo, 'controls-timesheet', lines);
  });
}

test('Check out dialog: the select arrows are 12px from the edge and the checkboxes are centred', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Closer' });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await signInPageAs(person.account);
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Check in' }).click();
  await page.getByRole('button', { name: 'Check out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Check out', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).toBeVisible();
  const lines = [`# ${testInfo.project.name}: controls in the Check out dialog`];
  await expectControls(page, 'Check out dialog', await scan(page), lines, { checkboxes: 1 });
  record(testInfo, 'controls-check-out', lines);
});

test('Settings and Administration: round sharing switches, 12px select arrows, centred checkboxes', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Settings' });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  const lines = [`# ${testInfo.project.name}: controls on Settings and Administration`];
  await signInPageAs(person.account, '#/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expectControls(page, 'Settings', await scan(page), lines, { switches: 2, selects: 1, checkboxes: 3 });
  record(testInfo, 'controls-settings', lines);
});

test('forced colours: a select keeps the native arrow (no gradient chevron)', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Forced' });
  await page.emulateMedia({ forcedColors: 'active' });
  await signInPageAs(person.account, '#/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  const select = page.locator('select').first();
  await expect(select).toBeVisible();
  const style = await select.evaluate((element) => {
    const computed = element.ownerDocument.defaultView?.getComputedStyle(element);
    return { appearance: computed?.appearance ?? '', image: computed?.backgroundImage ?? '' };
  });
  record(testInfo, 'forced-colours', [`# ${testInfo.project.name}: select in forced colours`, `appearance ${style.appearance}; background-image ${style.image}`]);
  expect(style.appearance, 'the native arrow returns in forced colours').toBe('auto');
  expect(style.image, 'no gradient chevron in forced colours').toBe('none');
});

test('Administration: select arrows are 12px from the edge and checkboxes are centred', async ({ page, builtServer, signInPageAs }, testInfo) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  const lines = [`# ${testInfo.project.name}: controls on Administration`];
  await signInPageAs(builtServer.credentials.admin, '#/settings/admin');
  await expect(page.getByRole('heading', { name: /Administration/, level: 1 })).toBeVisible();
  await expectControls(page, 'Administration', await scan(page), lines, { selects: 1 });
  record(testInfo, 'controls-admin', lines);
});

/* ---- The arrow and the stronger fills in the light, dark and both manual themes ----------------------------------------- */

const SITUATIONS: ReadonlyArray<{ name: string; media: Theme; stored: Theme | null }> = [
  { name: 'light device', media: 'light', stored: null },
  { name: 'dark device', media: 'dark', stored: null },
  { name: 'light device, manual dark', media: 'light', stored: 'dark' },
  { name: 'dark device, manual light', media: 'dark', stored: 'light' },
];

for (const situation of SITUATIONS) {
  test(`the select arrow is 3:1 on the field and the stronger week fills are 4.5:1 for their text (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
    await page.emulateMedia({ colorScheme: situation.media, reducedMotion: 'reduce' });
    if (situation.stored !== null) {
      await page.addInitScript({ content: `try { if (!sessionStorage.getItem('e2e-theme-seeded')) { localStorage.setItem('timesheet.theme', ${JSON.stringify(situation.stored)}); sessionStorage.setItem('e2e-theme-seeded', '1'); } } catch (error) {}` });
    }
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const lines = [`# ${testInfo.project.name} / ${situation.name}: tokens`];
    const arrow = contrast(await tokenColour(page, '--muted'), await tokenColour(page, '--field-bg'));
    lines.push(`select arrow (--muted) on --field-bg ${round(arrow)}:1`);
    expect(arrow, 'the arrow against the field').toBeGreaterThanOrEqual(NON_TEXT);
    const strong = await tokenColour(page, '--sheet-head-strong');
    const card = await tokenColour(page, '--card');
    for (const [name, text] of [['--text', await tokenColour(page, '--text')], ['--muted', await tokenColour(page, '--muted')]] as const) {
      const ratio = contrast(text, strong);
      lines.push(`${name} on --sheet-head-strong ${round(ratio)}:1`);
      expect(ratio, `${name} on the stronger fill`).toBeGreaterThanOrEqual(TEXT);
    }
    const step = contrast(strong, card);
    lines.push(`--sheet-head-strong against the date cell (--card) ${round(step)}:1`);
    expect(step, 'the stronger fill differs from the date cell').toBeGreaterThanOrEqual(1.2);
    record(testInfo, 'tokens', lines);
  });
}
