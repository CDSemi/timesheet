import type { Locator, Page } from '@playwright/test';
import { ANY_DAY_BUTTON_NAME } from './dayButton.ts';
import { expect, newPerson, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX-B4-01: the shared focus indicator is a UI component boundary under WCAG 2.2 SC 1.4.11
 * (with 2.4.7), so the ring colour that touches the outside must reach 3:1 against the surface it
 * sits on. The check reads the real computed box-shadow of a focused button, link, phone tab and
 * sheet date, and the shared token against every surface token, in the light and the dark theme.
 * Data are synthetic; nothing is computed by the application.
 */
test.use({ locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh' });

const MINIMUM_RATIO = 3;

type Rgba = [number, number, number, number];

interface Layer {
  colour: Rgba;
  inset: boolean;
  spread: number;
}

function parseColour(text: string): Rgba {
  const numbers = (/rgba?\(([^)]*)\)/.exec(text)?.[1] ?? '').split(/[\s,/]+/).filter((part) => part !== '').map(Number);
  const [r = 0, g = 0, b = 0, a = 1] = numbers;
  return [r, g, b, a];
}

function parseLayers(boxShadow: string): Layer[] {
  if (boxShadow === 'none') return [];
  return boxShadow.split(/,\s*(?=rgba?\()/).map((layer) => {
    const lengths = (layer.replace(/rgba?\([^)]*\)/, '').match(/-?\d+(\.\d+)?px/g) ?? []).map(parseFloat);
    return { colour: parseColour(layer), inset: layer.includes('inset'), spread: lengths[3] ?? 0 };
  });
}

/** The layer that touches the outside edge of the indicator: the widest outset layer, or the thinnest inset one. */
function outermost(layers: Layer[]): Layer | undefined {
  const outset = layers.filter((layer) => !layer.inset);
  if (outset.length > 0) return outset.reduce((a, b) => (b.spread > a.spread ? b : a));
  return layers.length === 0 ? undefined : layers.reduce((a, b) => (b.spread < a.spread ? b : a));
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  if (alpha === 0) return [0, 0, 0, 0];
  const mix = (index: 0 | 1 | 2) => (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha;
  return [mix(0), mix(1), mix(2), alpha];
}

function luminance([r, g, b]: Rgba): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** The ring as it is painted: composited over the surface it sits on. */
function ringOn(ring: Rgba, surface: Rgba): Rgba {
  return over(ring, over(surface, [255, 255, 255, 1]));
}

interface Probe {
  boxShadow: string;
  /** The background colours from the focused element's parent up to the page, nearest first. */
  backdrops: string[];
}

async function focusedProbe(locator: Locator): Promise<Probe> {
  await locator.scrollIntoViewIfNeeded();
  await locator.page().keyboard.press('Shift');
  await locator.focus();
  await expect(locator).toBeFocused();
  // Wait until the shared transition has finished: the ring is painted and unchanged over two reads.
  const read = async () => locator.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).boxShadow ?? 'none');
  await expect
    .poll(
      async () => {
        const first = await read();
        await locator.page().waitForTimeout(400);
        const second = await read();
        return first === second && (outermost(parseLayers(second))?.spread ?? 0) > 0;
      },
      { message: 'the focus ring is painted and settled' },
    )
    .toBe(true);
  return locator.evaluate((element) => {
    const style = (node: typeof element) => element.ownerDocument.defaultView?.getComputedStyle(node);
    const backdrops: string[] = [];
    for (let node = element.parentElement; node; node = node.parentElement) backdrops.push(style(node)?.backgroundColor ?? '');
    return { boxShadow: style(element)?.boxShadow ?? 'none', backdrops };
  });
}

function backdropOf(backdrops: string[]): Rgba {
  // Composite from the page up to the focused element's parent; the root canvas is white or the body colour.
  return backdrops.reduceRight<Rgba>((below, css) => over(parseColour(css), below), [255, 255, 255, 1]);
}

function expectRing(name: string, probe: Probe): number {
  const ring = outermost(parseLayers(probe.boxShadow));
  expect(ring, `${name} paints a focus ring (${probe.boxShadow})`).toBeDefined();
  if (ring === undefined) return 0;
  const ratio = contrast(ringOn(ring.colour, backdropOf(probe.backdrops)), backdropOf(probe.backdrops));
  expect(ratio, `${name} ring ${probe.boxShadow} against its backdrop`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
  return ratio;
}

/** The computed box-shadow once the shared transition has finished (unchanged over two reads). */
async function settledShadow(locator: Locator): Promise<string> {
  const read = async () => locator.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).boxShadow ?? 'none');
  let settled = await read();
  await expect
    .poll(
      async () => {
        const first = await read();
        await locator.page().waitForTimeout(400);
        settled = await read();
        return first === settled;
      },
      { message: 'the box-shadow is settled' },
    )
    .toBe(true);
  return settled;
}

/** The background colours from the element (itself included or not) up to the page, nearest first. */
async function backdropsOf(locator: Locator, includeSelf: boolean): Promise<string[]> {
  return locator.evaluate((element, self) => {
    const view = element.ownerDocument.defaultView;
    const backdrops: string[] = [];
    for (let node = self ? element : element.parentElement; node; node = node.parentElement) backdrops.push(view?.getComputedStyle(node).backgroundColor ?? '');
    return backdrops;
  }, includeSelf);
}

/**
 * An inset ring (`--focus-ring-inset`): the thinnest inset layer touches the element's edge, so it must
 * reach 3:1 against each surface beside it (the element's own surface and the one outside its edge).
 */
function expectInsetRing(name: string, boxShadow: string, surfaces: string[][]): number {
  const inset = parseLayers(boxShadow).filter((layer) => layer.inset && layer.spread > 0);
  const edge = inset.length === 0 ? undefined : inset.reduce((a, b) => (b.spread < a.spread ? b : a));
  expect(edge, `${name} paints an inset focus ring (${boxShadow})`).toBeDefined();
  if (edge === undefined) return 0;
  let lowest = Number.POSITIVE_INFINITY;
  for (const backdrops of surfaces) {
    const surface = backdropOf(backdrops);
    const ratio = contrast(ringOn(edge.colour, surface), surface);
    expect(ratio, `${name} inset ring ${boxShadow} against ${JSON.stringify(backdrops.slice(0, 3))}`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
    lowest = Math.min(lowest, ratio);
  }
  return lowest;
}

/** Every surface token the shared ring can sit on, and the token ring painted on each. */
async function surfaceRatios(page: Page): Promise<Record<string, number>> {
  const raw = await page.locator('body').evaluate((body) => {
    const surfaces = ['--card', '--bg', '--sheet-head', '--sheet-head-off', '--day-nonworking', '--off', '--attention-bg'];
    const probe = body.ownerDocument.createElement('div');
    body.append(probe);
    const read = (property: 'backgroundColor' | 'boxShadow', value: string) => {
      probe.style[property] = value;
      const computed = body.ownerDocument.defaultView?.getComputedStyle(probe)[property] ?? '';
      probe.style[property] = '';
      return computed;
    };
    const result = { ring: read('boxShadow', 'var(--focus-ring)'), surfaces: surfaces.map((token) => ({ token, colour: read('backgroundColor', `var(${token})`) })) };
    probe.remove();
    return result;
  });
  const ring = outermost(parseLayers(raw.ring));
  expect(ring, `the shared --focus-ring token paints a ring (${raw.ring})`).toBeDefined();
  const ratios: Record<string, number> = {};
  for (const { token, colour } of raw.surfaces) {
    const surface = parseColour(colour);
    const ratio = ring === undefined ? 0 : contrast(ringOn(ring.colour, surface), over(surface, [255, 255, 255, 1]));
    expect(ratio, `--focus-ring ${raw.ring} against ${token}`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
    ratios[token] = Math.round(ratio * 100) / 100;
  }
  return ratios;
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the shared focus ring reaches 3:1 on every surface and on real controls (${colorScheme})`, async ({ page, signInThroughUi }, testInfo) => {
    const project = testInfo.project.name;
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);

    const tokenRatios = await surfaceRatios(page);
    const measured: Record<string, number> = {};
    const nav = page.getByRole('navigation', { name: 'Main' });
    const sheetDate = page.locator('[data-day] [data-day-button]').first();
    await expect(sheetDate).toHaveAccessibleName(ANY_DAY_BUTTON_NAME);
    const controls: Array<[string, Locator]> = [
      ['button', page.getByRole('button', { name: 'Clock in' })],
      ['link', nav.getByRole('link', { name: 'Overtime' })],
      ['sheet date', sheetDate],
    ];
    if (project === 'mobile') controls.push(['phone tab', nav.getByRole('link', { name: 'History' })]);
    for (const [name, locator] of controls) {
      const probe = await focusedProbe(locator);
      measured[name] = Math.round(expectRing(name, probe) * 100) / 100;
      // Six synthetic screenshots in all: button, sheet date and phone tab, light and dark, on the phone project.
      if (project === 'mobile' && name !== 'link') {
        await page.screenshot({ path: screenshotPath(`fix6-focus-${name.replace(' ', '-')}-${colorScheme}-synthetic.png`), animations: 'disabled' });
      }
    }
    console.log(`focus-ring contrast ${project} ${colorScheme}: tokens ${JSON.stringify(tokenRatios)} controls ${JSON.stringify(measured)}`);
  });

  /*
   * WP5-UX-AX-02 (SC 1.4.11 and 2.4.7): with the label picker open from the keyboard, the focused list
   * shows the ring and the active option (what Enter picks) shows an inset ring of at least 3:1.
   */
  test(`WP5-UX-AX-02: the open label picker shows a ring on the list and on the active option (${colorScheme})`, async ({ page, signInThroughUi }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const trigger = page.locator('[data-label-picker] button').first();
    await trigger.scrollIntoViewIfNeeded();
    await page.keyboard.press('Shift');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const list = page.getByRole('listbox');
    await expect(list).toBeFocused();
    await page.keyboard.press('ArrowDown');
    expect(await list.evaluate((element) => element.matches(':focus-visible')), 'the list is focused from the keyboard').toBe(true);
    const listRatio = expectRing('label list', { boxShadow: await settledShadow(list), backdrops: await backdropsOf(list, false) });
    const active = list.locator('.label-option.active');
    await expect(active).toHaveCount(1);
    const optionRatio = expectInsetRing('active label option', await settledShadow(active), [await backdropsOf(active, true), await backdropsOf(active, false)]);
    console.log(`label picker ring ${colorScheme}: list ${listRatio.toFixed(2)} active option ${optionRatio.toFixed(2)}`);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  /*
   * WP5-UX-AX-03 (SC 2.4.7): a scrolling day editor is a keyboard stop of its own (the browser makes a
   * scroll container focusable); reached with Shift+Tab from Close it shows an inset ring.
   */
  test(`WP5-UX-AX-03: the day editor dialog shows an inset ring when it is the keyboard stop (${colorScheme})`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
  }) => {
    const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Ring Person', signature: 'none' });
    const [day = ''] = await person.api.displayedPeriodFreeWorkdays();
    expect(day, 'a past free workday in the displayed period').not.toBe('');
    await person.api.seedCompleteDay(day);
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInPageAs(person.account, '#/timesheet');
    // A click on the day's time cell opens the editor (selected by data-day, not by any name).
    await page.locator(`[data-day="${day}"] :is(.d-time, .t-time)`).click();
    const editor = page.locator(`dialog[data-day-editor="${day}"]`);
    await expect(editor.getByRole('heading', { name: /^Times/ })).toBeVisible();
    expect(await editor.evaluate((element) => element.scrollHeight > element.clientHeight), 'the editor scrolls').toBe(true);
    await page.keyboard.press('Shift');
    await editor.getByRole('button', { name: 'Close', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    expect(await editor.evaluate((element) => element === element.ownerDocument.activeElement && element.matches(':focus-visible')), 'the dialog is the keyboard stop').toBe(true);
    const ratio = expectInsetRing('day editor dialog', await settledShadow(editor), [await backdropsOf(editor, true)]);
    console.log(`day editor dialog ring ${colorScheme}: ${ratio.toFixed(2)}`);
  });

  /*
   * WP5-UX-B5 R-12 (SC 2.4.7), needed for the sweep's "no stop without a ring": Shift+Tab into a date
   * field lands on the browser's own picker button inside it; the field still shows the shared ring.
   */
  test(`R-12: a date field reached with Shift+Tab shows the focus ring (${colorScheme})`, async ({ page, signInThroughUi, isMobile }) => {
    test.skip(isMobile, 'The touch layout focuses the field itself (it already matches :focus-visible)');
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const field = page.getByLabel('Open a day');
    await expect(page.getByRole('button', { name: 'Open day', exact: true })).toBeDisabled();
    await page.keyboard.press('Shift');
    await page.getByRole('button', { name: 'Show details', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(field).toBeFocused();
    const ratio = expectRing('date field', { boxShadow: await settledShadow(field), backdrops: await backdropsOf(field, false) });
    console.log(`date field ring after Shift+Tab ${colorScheme}: ${ratio.toFixed(2)}`);
  });

  /*
   * WP5-UX-AX-04 (SC 2.4.7 and 1.4.11): a pressed toolbar toggle ("Show details", "Change several days")
   * keeps the focus ring when it takes keyboard focus; its pressed state alone is not a ring.
   */
  test(`WP5-UX-AX-04: a pressed toolbar toggle still shows the focus ring (${colorScheme})`, async ({ page, signInThroughUi }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    for (const name of ['Show details', 'Change several days']) {
      const toggle = page.getByRole('button', { name, exact: true });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await page.mouse.move(0, 0);
      await toggle.evaluate((element) => element.blur());
      const pressedOnly = await settledShadow(toggle);
      const probe = await focusedProbe(toggle);
      expect(probe.boxShadow, `${name}: focused and pressed differs from pressed only`).not.toBe(pressedOnly);
      const outset = parseLayers(probe.boxShadow).filter((layer) => !layer.inset && layer.spread > 0);
      expect(outset.length, `${name} paints an outer focus ring (${probe.boxShadow})`).toBeGreaterThan(0);
      expectRing(`pressed ${name}`, probe);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    }
  });
}
