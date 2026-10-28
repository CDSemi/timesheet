import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { computedStyle, contrast, flattenedBackground, parseColour, parseLayers, textContrast, tokenColour } from './contrast.ts';
import { expect, expectLayoutAt, newPerson, SCREENSHOT_DIR, screenshotPath, test } from './fixtures.ts';

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
      // From the phone's 390px the check in/out group leaves the top bar for the title row one rendering update after the CSS.
      await expectLayoutAt(page, width);
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
    await expectLayoutAt(page, width);
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
    // The worked rows (Worked hours) belong to the first column too.
    await page.getByRole('switch', { name: 'Worked hours' }).check();
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
  imageLayers: number;
  conic: boolean;
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
      imageLayers: (() => { let depth = 0; let count = 1; for (const char of style.backgroundImage) { if (char === "(") depth += 1; else if (char === ")") depth -= 1; else if (char === "," && depth === 0) count += 1; } return style.backgroundImage === "none" ? 0 : count; })(),
      conic: style.backgroundImage.startsWith('conic-gradient('),
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
    // U5-03: one layer, so there is no interior tile edge for a fractional device-pixel ratio to rasterise as a light column.
    expect(item.arrowLayers, `${where}: one position`).toBe(1);
    expect(item.imageLayers, `${where}: background-image has exactly one layer`).toBe(1);
    expect(item.conic, `${where}: the layer is the conic-gradient chevron`).toBe(true);
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
    // WP5-UX5-T05B (U5-25): the leave kind select moved into the Partial leave dialog, so the editor itself holds the Category select
    // (one); the dialog is scanned next, where the kind select is the second one on the page.
    await expectControls(page, 'Day editor', await scan(page), lines, { selects: 1, checkboxes: 1 });
    await editor.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Partial leave', exact: true }).getByLabel('Leave kind')).toBeVisible();
    await expectControls(page, 'Partial leave dialog', await scan(page), lines, { selects: 2 });
    await page.getByRole('dialog', { name: 'Partial leave', exact: true }).getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Partial leave', exact: true })).toHaveCount(0);
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

/* ---- WP5-UX5-T05A (U5-03): the select chevron is one layer, so it has no light seam at a fractional device pixel ratio ---------- */

/** The device pixel ratios of the owner's display scaling: 100%, 125%, 150%, 175% and 200%. */
const DEVICE_PIXEL_RATIOS = [1, 1.25, 1.5, 1.75, 2] as const;
/** The number of layers of a computed `background-image` (the commas outside any parentheses, plus one; `none` has none). */
function topLevelLayers(value: string): number {
  if (value === 'none') return 0;
  let depth = 0;
  let count = 1;
  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) count += 1;
  }
  return count;
}

/** The most an interior column of the arrow's top row may be lighter (less inked) than both neighbours, in luminance levels. */
const SEAM_LEVELS = 8;

interface ArrowProfile {
  found: boolean;
  /** The first row that holds the arrow (an ink of at least 24 levels), in screenshot pixels. */
  row: number;
  /** The ink of each column of that row: its luminance distance from the field. */
  ink: number[];
  /** The largest amount by which an interior column has less ink than both of its neighbours. */
  dip: number;
  width: number;
}

/** Decodes a screenshot of the select's arrow in the page and reads the luminance profile across the arrow's top row. */
const ARROW_SCRIPT = String.raw`(async (base64) => {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const luminance = (x, y) => {
    const at = (y * width + x) * 4;
    return 0.2126 * data[at] + 0.7152 * data[at + 1] + 0.0722 * data[at + 2];
  };
  const field = luminance(1, Math.floor(height / 2));
  const ink = (x, y) => Math.abs(luminance(x, y) - field);
  let row = -1;
  for (let y = 0; y < height && row < 0; y += 1) {
    for (let x = 0; x < width; x += 1) if (ink(x, y) >= 24) { row = y; break; }
  }
  if (row < 0) return { found: false, row, ink: [], dip: 0, width: 0 };
  const line = Array.from({ length: width }, (_, x) => ink(x, row));
  const peak = Math.max(...line);
  const first = line.findIndex((value) => value >= peak / 2);
  const last = line.length - 1 - [...line].reverse().findIndex((value) => value >= peak / 2);
  let dip = 0;
  for (let x = first + 1; x < last; x += 1) dip = Math.max(dip, Math.min(line[x - 1], line[x + 1]) - line[x]);
  return { found: true, row, ink: line.slice(first, last + 1).map((value) => Math.round(value)), dip, width: last - first + 1 };
})`;

/** The animation frames in a row for which the select must keep its place in the document before it is measured. */
const SETTLED_FRAMES = 6;
/** Resolves true once the element's box in the document is unchanged for SETTLED_FRAMES frames in a row; false after 600 frames (about 10 s). */
const SETTLED_SCRIPT = String.raw`(async (element) => {
  const place = () => {
    const box = element.getBoundingClientRect();
    return [box.left + window.scrollX, box.top + window.scrollY, box.width, box.height].join(' ');
  };
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
  let last = place();
  let still = 0;
  for (let count = 0; count < 600 && still < ${SETTLED_FRAMES}; count += 1) {
    await frame();
    const now = place();
    still = now === last ? still + 1 : 0;
    last = now;
  }
  return still >= ${SETTLED_FRAMES};
})`;

/**
 * WP5-UX5-FIX3: the Settings sections above the first select each show a "Loading…" placeholder until their own request has
 * answered, and the swap moves the select (by half a pixel at the measured widths). A screenshot taken in that window can miss
 * the arrow. So the clip is only measured once no placeholder is left and the select has kept its place for several frames.
 */
async function settledSelect(page: Page): Promise<void> {
  await expect(page.getByText(/^Loading/), 'the Settings sections have finished loading').toHaveCount(0);
  await expect.poll(() => page.evaluate<boolean>(`${SETTLED_SCRIPT}(document.querySelector('select'))`), { message: 'the first select keeps its place for six frames' }).toBe(true);
}

for (const theme of THEMES) {
  test(`the select chevron is one layer with no light seam at device pixel ratios 1, 1.25, 1.5, 1.75 and 2 (${theme})`, async ({ page, browser, adminSeed, builtServer, signInPageAs }, testInfo) => {
    test.setTimeout(120_000);
    const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Seam' });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signInPageAs(person.account, '#/settings');
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
    const select = page.locator('select').first();
    await select.scrollIntoViewIfNeeded();
    const layers = await select.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).backgroundImage ?? '');
    expect(topLevelLayers(layers), 'background-image has exactly one layer').toBe(1);
    expect(layers.startsWith('conic-gradient('), `the layer is the conic chevron: ${layers}`).toBe(true);
    // Each ratio is its own browser context (the signed-in session carried over), so the page is rasterised at that device pixel ratio.
    const origin = new URL(page.url()).origin;
    const state = await page.context().storageState();
    const lines = [`# ${testInfo.project.name} / ${theme}: the arrow's top row`];
    for (const ratio of DEVICE_PIXEL_RATIOS) {
      const context = await browser.newContext({
        storageState: state,
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: ratio,
        colorScheme: theme,
        reducedMotion: 'reduce',
        locale: 'en-US',
        timezoneId: 'America/Los_Angeles',
      });
      try {
        const scaled = await context.newPage();
        await scaled.goto(`${origin}/#/settings`);
        await expect(scaled.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
        expect(await scaled.evaluate<number>('window.devicePixelRatio'), `the page runs at ${ratio}`).toBe(ratio);
        const field = scaled.locator('select').first();
        await settledSelect(scaled);
        await field.scrollIntoViewIfNeeded();
        const box = await field.boundingBox();
        expect(box, `the select is on the screen at ${ratio}`).not.toBeNull();
        // 24px around the arrow (it ends 12px from the border and is 12px wide), clear of the top and bottom borders of the field.
        const clip = { x: (box?.x ?? 0) + (box?.width ?? 0) - 30, y: (box?.y ?? 0) + 4, width: 24, height: (box?.height ?? 0) - 8 };
        const png = await scaled.screenshot({ clip, animations: 'disabled', type: 'png', path: screenshotPath(`seam-${testInfo.project.name}-${theme}-dpr${ratio}-synthetic.png`) });
        const profile = await scaled.evaluate<ArrowProfile>(`${ARROW_SCRIPT}(${JSON.stringify(png.toString('base64'))})`);
        lines.push(`dpr ${ratio}: top row ${profile.row}, ${profile.width} columns, largest dip ${round(profile.dip)} levels, ink ${profile.ink.join(' ')}`);
        expect(profile.found, `dpr ${ratio}: the arrow is on the screenshot`).toBe(true);
        expect(profile.width, `dpr ${ratio}: the top row spans the arrow`).toBeGreaterThanOrEqual(Math.floor(8 * ratio));
        expect(profile.dip, `dpr ${ratio}, ${theme}: no interior column is lighter than both neighbours by more than ${SEAM_LEVELS} levels (${profile.ink.join(' ')})`).toBeLessThanOrEqual(SEAM_LEVELS);
      } finally {
        await context.close();
      }
    }
    record(testInfo, 'seam', lines);
  });
}

/* ---- WP5-UX5-T05A (U5-05, owner decision F-1 a): the sub-buttons are 36px high; the 44px target stays as a hit area where controls are 44px ---- */

interface SubButtonFacts {
  name: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
  /** The element under a point 3px above and 3px below the visible box, centred: is it the button (or inside it)? */
  hitAbove: boolean;
  hitBelow: boolean;
}

/** Reads one sub-button's visible box and whether the points just outside it still belong to it (its ::before hit area). */
async function subButtonFacts(button: Locator, name: string): Promise<SubButtonFacts> {
  await expect(button, `${name} is on the page`).toHaveCount(1);
  await button.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  return button.evaluate((element, label) => {
    const box = element.getBoundingClientRect();
    const at = (y: number) => {
      const hit = element.ownerDocument.elementFromPoint(box.left + box.width / 2, y);
      return hit !== null && (hit === element || element.contains(hit));
    };
    return { name: label, top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height, hitAbove: at(box.top - 3), hitBelow: at(box.bottom + 3) };
  }, name);
}

test('Edit, Delete, Add session, Add (partial leave), Suggest breaks, Add break and Save day fields (from 768px; the sheet foot below it is 44px) are 36px high everywhere; the 44px hit area stays below 768px and with a coarse pointer; rows keep 8px apart', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  test.setTimeout(180_000);
  const lines = [`# ${testInfo.project.name}: sub-buttons`];
  const days = (await employeeSeed.displayedPeriodFreeWorkdays()).slice(0, 1);
  expect(days.length, 'a free past workday in the displayed period').toBe(1);
  const [date = ''] = days;
  try {
    await employeeSeed.seedCompleteDay(date);
    const sessionId = (await employeeSeed.dayView(date)).sessions[0]?.id ?? '';
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    for (const width of [1280, 1024, 768, 767, 700, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.reload();
      await expect(page.locator('[data-day]')).toHaveCount(14);
      const coarse = await page.evaluate<boolean>("matchMedia('(pointer: coarse)').matches");
      const hitArea = coarse || width < 768;
      await page.getByLabel('Open a day').fill(date);
      await page.getByRole('button', { name: 'Open day', exact: true }).click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      // WP5-UX5-T05B (U5-26): the bottom sheet (below 768px) has no figures section; the drawer keeps it.
      const figures = editor.getByRole('heading', { name: 'Figures (computed by the server)' });
      if (width >= 768) await expect(figures).toBeVisible();
      else {
        await expect(editor.getByRole('heading', { name: 'Times' })).toBeVisible();
        await expect(figures).toHaveCount(0);
      }
      const where = `${width}px (${coarse ? 'coarse' : 'fine'} pointer, hit area ${hitArea ? 'expected' : 'not expected'})`;
      const facts: SubButtonFacts[] = [];
      facts.push(await subButtonFacts(editor.getByRole('button', { name: 'Add session', exact: true }), 'Add session'));
      const edit = await subButtonFacts(editor.getByRole('button', { name: `Edit session ${sessionId}` }), 'Edit');
      const remove = await subButtonFacts(editor.getByRole('button', { name: `Delete session ${sessionId}` }), 'Delete');
      facts.push(edit, remove);
      // WP5-UX5-T05B (U5-25): the partial leave's Add (or Change) button is a sub-button too.
      facts.push(await subButtonFacts(editor.getByRole('button', { name: 'Add', exact: true }), 'Add partial leave'));
      // Below 768px "Save day fields" is the foot of the bottom sheet (U5-26): the full-width 44px button of a dialog foot, checked apart.
      const save = editor.getByRole('button', { name: 'Save day fields' });
      if (width >= 768) facts.push(await subButtonFacts(save, 'Save day fields'));
      else {
        const foot = await subButtonFacts(save, 'Save day fields');
        const footBox = await editor.locator('[data-editor-foot]').boundingBox();
        lines.push(`${width}px: Save day fields in the foot ${round(foot.height)}px high, ${round(foot.right - foot.left)}px wide in a foot ${round(footBox?.width ?? 0)}px wide`);
        expect(Math.abs(foot.height - 44), `${width}px: the foot's Save day fields is 44px high, not ${foot.height}`).toBeLessThanOrEqual(0.5);
        expect(foot.right - foot.left, `${width}px: the foot's Save day fields is full width (the foot less its 16px sides)`).toBeGreaterThanOrEqual((footBox?.width ?? 0) - 32 - 1);
      }
      // The two buttons of a row keep 8px apart (or sit in separate rows 8px apart), so their 44px hit areas never overlap.
      const apart = (first: SubButtonFacts, second: SubButtonFacts) => {
        const sideways = second.left - first.right;
        const stacked = second.top - first.bottom;
        return Math.max(sideways, stacked);
      };
      lines.push(`${where}: Edit to Delete ${round(apart(edit, remove))}px`);
      expect(apart(edit, remove), `${where}: Edit and Delete keep 8px apart`).toBeGreaterThanOrEqual(8 - 0.5);
      // The session dialog: Suggest breaks and Add break.
      await editor.getByRole('button', { name: 'Add session', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await expect(dialog.getByRole('button', { name: 'Add break', exact: true })).toBeVisible();
      const suggest = await subButtonFacts(dialog.getByRole('button', { name: 'Suggest breaks', exact: true }), 'Suggest breaks');
      const add = await subButtonFacts(dialog.getByRole('button', { name: 'Add break', exact: true }), 'Add break');
      facts.push(suggest, add);
      lines.push(`${where}: Suggest breaks to Add break ${round(apart(suggest, add))}px`);
      expect(apart(suggest, add), `${where}: Suggest breaks and Add break keep 8px apart`).toBeGreaterThanOrEqual(8 - 0.5);
      for (const item of facts) {
        lines.push(`${where}: ${item.name} ${round(item.height)}px high, hit above ${item.hitAbove}, below ${item.hitBelow}`);
        expect(Math.abs(item.height - 36), `${where}: ${item.name} is 36px high, not ${item.height}`).toBeLessThanOrEqual(0.5);
        if (hitArea) {
          expect(item.hitAbove, `${where}: ${item.name} keeps its hit area 3px above the box`).toBe(true);
          expect(item.hitBelow, `${where}: ${item.name} keeps its hit area 3px below the box`).toBe(true);
        } else {
          expect(item.hitAbove, `${where}: ${item.name} has no hit area above its 36px box with a fine pointer`).toBe(false);
        }
      }
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      const discard = page.getByRole('alertdialog', { name: 'Discard your changes?' });
      if (await discard.isVisible()) await discard.getByRole('button', { name: 'Discard' }).click();
    }
    record(testInfo, 'sub-buttons', lines);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});
