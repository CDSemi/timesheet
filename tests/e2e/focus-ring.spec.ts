import type { Locator, Page } from '@playwright/test';
import { expect, screenshotPath, test } from './fixtures.ts';

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
    const controls: Array<[string, Locator]> = [
      ['button', page.getByRole('button', { name: 'Clock in' })],
      ['link', nav.getByRole('link', { name: 'Overtime' })],
      ['sheet date', page.getByRole('button', { name: /^(Edit|View) \d{4}-\d{2}-\d{2}$/ }).first()],
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
}
