import { expect, type Locator } from '@playwright/test';

/*
 * Colour maths and computed-style probes for the contrast checks of the e2e specs (WCAG 2.x relative
 * luminance; SC 1.4.3 text, 1.4.11 non-text, 2.4.7 focus visible). The formulas are copied from
 * focus-ring.spec.ts (WP5-UX-B4-01) so that spec stays untouched in this slice. Nothing here is
 * computed by the application: every number is read from the browser's computed style.
 */

export type Rgba = [number, number, number, number];

export interface Layer {
  colour: Rgba;
  inset: boolean;
  spread: number;
}

export function parseColour(text: string): Rgba {
  const numbers = (/rgba?\(([^)]*)\)/.exec(text)?.[1] ?? '').split(/[\s,/]+/).filter((part) => part !== '').map(Number);
  const [r = 0, g = 0, b = 0, a = 1] = numbers;
  return [r, g, b, a];
}

export function parseLayers(boxShadow: string): Layer[] {
  if (boxShadow === 'none') return [];
  return boxShadow.split(/,\s*(?=rgba?\()/).map((layer) => {
    const lengths = (layer.replace(/rgba?\([^)]*\)/, '').match(/-?\d+(\.\d+)?px/g) ?? []).map(parseFloat);
    return { colour: parseColour(layer), inset: layer.includes('inset'), spread: lengths[3] ?? 0 };
  });
}

/** The layer that touches the outside edge of the indicator: the widest outset layer, or the thinnest inset one. */
export function outermost(layers: Layer[]): Layer | undefined {
  const outset = layers.filter((layer) => !layer.inset);
  if (outset.length > 0) return outset.reduce((a, b) => (b.spread > a.spread ? b : a));
  return layers.length === 0 ? undefined : layers.reduce((a, b) => (b.spread < a.spread ? b : a));
}

export function over(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  if (alpha === 0) return [0, 0, 0, 0];
  const mix = (index: 0 | 1 | 2) => (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha;
  return [mix(0), mix(1), mix(2), alpha];
}

export function luminance([r, g, b]: Rgba): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** The colours painted behind an element, composited from the page up to the element's parent, over white. */
export function backdropOf(backdrops: string[]): Rgba {
  return backdrops.reduceRight<Rgba>((below, css) => over(parseColour(css), below), [255, 255, 255, 1]);
}

/** The background colours from an element's parent up to the page, nearest first. */
export async function backdropsAbove(locator: Locator): Promise<string[]> {
  return locator.evaluate((element) => {
    const view = element.ownerDocument.defaultView;
    const backdrops: string[] = [];
    for (let node = element.parentElement; node; node = node.parentElement) backdrops.push(view?.getComputedStyle(node).backgroundColor ?? '');
    return backdrops;
  });
}

/** The computed value of one property of an element, once it has not changed over two reads 400 ms apart. */
export async function settledStyle(locator: Locator, property: 'boxShadow' | 'color' | 'backgroundColor'): Promise<string> {
  const read = async () => locator.evaluate((element, name) => element.ownerDocument.defaultView?.getComputedStyle(element)[name] ?? '', property);
  let settled = await read();
  await expect
    .poll(
      async () => {
        const first = await read();
        await locator.page().waitForTimeout(400);
        settled = await read();
        return first === settled;
      },
      { message: `the computed ${property} is settled` },
    )
    .toBe(true);
  return settled;
}

/** Focuses the element the way the keyboard does (so `:focus-visible` matches), then waits until its ring is painted and settled. */
export async function focusFromKeyboard(locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await locator.page().keyboard.press('Shift');
  await locator.focus();
  await expect(locator).toBeFocused();
  await expect.poll(async () => (parseLayers(await settledStyle(locator, 'boxShadow')).length > 0 ? 'ring' : 'none')).toBe('ring');
}

export interface RingMeasure {
  /** The outer ring colour against the surface behind the control (3:1 needed). */
  ringAgainstBackdrop: number;
  /** The gap layer between the control and the ring against the control's own fill (3:1 needed when the fill is opaque). */
  gapAgainstFill: number | null;
  /** The ring colour against the gap layer (3:1 needed). */
  ringAgainstGap: number;
  layers: string;
}

/**
 * The focus ring of a focused control, as painted: the widest outset layer is the ring, the narrowest
 * is the gap that keeps it visible on a filled control (`--focus-ring`: a 1px card gap in a 2px accent ring).
 */
export async function measureFocusRing(locator: Locator): Promise<RingMeasure> {
  const boxShadow = await settledStyle(locator, 'boxShadow');
  const fill = parseColour(await settledStyle(locator, 'backgroundColor'));
  const backdrop = backdropOf(await backdropsAbove(locator));
  const outset = parseLayers(boxShadow).filter((layer) => !layer.inset && layer.spread > 0);
  expect(outset.length, `a focus ring is painted (${boxShadow})`).toBeGreaterThanOrEqual(2);
  const ring = outset.reduce((a, b) => (b.spread > a.spread ? b : a));
  const gap = outset.reduce((a, b) => (b.spread < a.spread ? b : a));
  const ringColour = over(ring.colour, backdrop);
  const gapColour = over(gap.colour, backdrop);
  const ownFill = over(fill, backdrop);
  return {
    ringAgainstBackdrop: contrast(ringColour, backdrop),
    gapAgainstFill: fill[3] === 1 ? contrast(gapColour, ownFill) : null,
    ringAgainstGap: contrast(ringColour, gapColour),
    layers: boxShadow,
  };
}

/** The text colour of a control against its own fill composited over what is behind it. */
export async function textContrast(locator: Locator): Promise<number> {
  const text = parseColour(await settledStyle(locator, 'color'));
  const fill = parseColour(await settledStyle(locator, 'backgroundColor'));
  const backdrop = backdropOf(await backdropsAbove(locator));
  return contrast(over(text, over(fill, backdrop)), over(fill, backdrop));
}
