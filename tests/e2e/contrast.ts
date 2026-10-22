import { inflateSync } from 'node:zlib';
import { expect, type Locator, type Page } from '@playwright/test';

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
  /** The horizontal offset in px: the width of a one-sided rail such as `inset 3px 0 0 colour`. */
  offsetX: number;
  /** The vertical offset in px: the height of a one-sided bar such as `inset 0 3px 0 colour` (negative from the bottom). */
  offsetY: number;
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
    return { colour: parseColour(layer), inset: layer.includes('inset'), spread: lengths[3] ?? 0, offsetX: lengths[0] ?? 0, offsetY: lengths[1] ?? 0 };
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

/** The computed properties the probes read. */
export type StyleProperty = 'boxShadow' | 'color' | 'backgroundColor' | 'borderTopColor' | 'backgroundImage';

/**
 * The computed value of one property once no transition or animation is running on the element (WP5-UX4-FIX3, item 4; moved here from
 * `hover.spec.ts` in WP5-UX5-T05A so every spec shares it). The wait is the browser's own: `getAnimations()` flushes pending style
 * changes, so a transition that a hover, a tap or a theme change has just started is seen, and the `finished` promises of the running
 * ones are awaited; two animation frames then let the last style apply. No wall-clock timer or poll is involved. The earlier helper read
 * twice 400 ms apart inside a 7 s poll, which cost about 0.4 s per call and ran out when the worker side stalled for 24 s in the full
 * run of WP5-UX4-REGATE2 (the trace shows the browser's 400 ms timer done in 403 ms, and the next read reaching the browser 24 s later).
 */
export async function settledStyle(locator: Locator, property: StyleProperty): Promise<string> {
  return locator.evaluate(async (element, name) => {
    // The test project has no DOM types: the few members used here are declared by shape.
    interface Animated {
      ownerDocument: {
        defaultView: { requestAnimationFrame: (callback: () => void) => number; getComputedStyle: (target: unknown) => Record<string, string> } | null;
      };
      getAnimations: () => Array<{ playState: string; finished: Promise<unknown> }>;
    }
    const target = element as unknown as Animated;
    const view = target.ownerDocument.defaultView;
    if (view === null) return '';
    const frame = () => new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
    for (let round = 0; round < 20; round += 1) {
      const running = target.getAnimations().filter((animation) => animation.playState !== 'finished');
      if (running.length === 0) break;
      await Promise.allSettled(running.map((animation) => animation.finished));
    }
    await frame();
    await frame();
    return view.getComputedStyle(target)[name] ?? '';
  }, property);
}

/** One immediate read of a computed property, for callers that have already waited for the colour transitions (300 ms). */
export async function computedStyle(locator: Locator, property: StyleProperty): Promise<string> {
  return locator.evaluate((element, name) => element.ownerDocument.defaultView?.getComputedStyle(element)[name] ?? '', property);
}

/**
 * Focuses the element the way the keyboard does (so `:focus-visible` matches), then waits until its ring is painted and
 * settled. `painted` is the element that paints the ring when it is not the focused one (the label of an invisible radio).
 */
export async function focusFromKeyboard(locator: Locator, painted: Locator = locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await locator.page().keyboard.press('Shift');
  await locator.focus();
  await expect(locator).toBeFocused();
  await expect.poll(async () => (parseLayers(await settledStyle(painted, 'boxShadow')).length > 0 ? 'ring' : 'none')).toBe('ring');
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

/** The settled background of a control, flattened over the surfaces behind it (opaque). */
export async function flattenedBackground(locator: Locator): Promise<Rgba> {
  const fill = parseColour(await settledStyle(locator, 'backgroundColor'));
  return over(fill, backdropOf(await backdropsAbove(locator)));
}

/** The colour of the first gradient stop painted as the background image (the switch thumb is a one-colour gradient). */
export async function imageColour(locator: Locator): Promise<Rgba> {
  return parseColour(await settledStyle(locator, 'backgroundImage'));
}

/** The computed style of a `::before` or `::after` layer of an element, with the host's padding box. */
export interface PseudoStyle {
  content: string;
  position: string;
  top: string;
  /** Used size of the layer in px; for an absolute layer with `inset: 0` it equals the host's padding box. */
  width: number;
  height: number;
  zIndex: string;
  pointerEvents: string;
  backgroundColor: string;
  boxShadow: string;
  borderStartWidth: number;
  borderEndWidth: number;
  borderStartColor: string;
  borderEndColor: string;
  hostClientWidth: number;
  hostClientHeight: number;
}

/** One read of a pseudo-element's computed style (`none` content means the layer does not exist). */
export async function readPseudo(locator: Locator, pseudo: '::before' | '::after'): Promise<PseudoStyle> {
  return locator.evaluate((element, which) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element, which);
    const pixels = (value: string | undefined) => parseFloat(value ?? '0');
    return {
      content: style?.content ?? 'none',
      position: style?.position ?? '',
      top: style?.top ?? '',
      width: pixels(style?.width),
      height: pixels(style?.height),
      zIndex: style?.zIndex ?? '',
      pointerEvents: style?.pointerEvents ?? '',
      backgroundColor: style?.backgroundColor ?? '',
      boxShadow: style?.boxShadow ?? '',
      borderStartWidth: pixels(style?.borderInlineStartWidth),
      borderEndWidth: pixels(style?.borderInlineEndWidth),
      borderStartColor: style?.borderInlineStartColor ?? '',
      borderEndColor: style?.borderInlineEndColor ?? '',
      hostClientWidth: element.clientWidth,
      hostClientHeight: element.clientHeight,
    };
  }, pseudo);
}

/**
 * A pseudo-element's computed style once no transition or animation is running on the element or its pseudo-elements: the same
 * event-based wait as `settledStyle` (the browser's own `getAnimations({ subtree: true })`, then two animation frames), not a poll.
 */
export async function settledPseudo(locator: Locator, pseudo: '::before' | '::after'): Promise<PseudoStyle> {
  await locator.evaluate(async (element) => {
    // The test project has no DOM types: the few members used here are declared by shape.
    interface Animated {
      ownerDocument: { defaultView: { requestAnimationFrame: (callback: () => void) => number } | null };
      getAnimations: (options: { subtree: boolean }) => Array<{ playState: string; finished: Promise<unknown> }>;
    }
    const target = element as unknown as Animated;
    const view = target.ownerDocument.defaultView;
    if (view === null) return;
    const frame = () => new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
    for (let round = 0; round < 20; round += 1) {
      const running = target.getAnimations({ subtree: true }).filter((animation) => animation.playState !== 'finished');
      if (running.length === 0) break;
      await Promise.allSettled(running.map((animation) => animation.finished));
    }
    await frame();
    await frame();
  });
  return readPseudo(locator, pseudo);
}

/** The colour a CSS custom property resolves to (probed on a detached-style element, read from its computed colour). */
export async function tokenColour(page: Page, token: string): Promise<Rgba> {
  const text = await page.locator('body').evaluate((body, name) => {
    const probe = body.ownerDocument.createElement('span');
    probe.style.color = `var(${name})`;
    body.append(probe);
    const colour = body.ownerDocument.defaultView?.getComputedStyle(probe).color ?? '';
    probe.remove();
    return colour;
  }, token);
  return parseColour(text);
}

/**
 * The colour actually painted at one CSS pixel of the viewport, read from a screenshot (so an overlay
 * that hides another layer, or a layer that is not painted at all, is seen; computed styles cannot show that).
 * `x` and `y` are viewport coordinates (`getBoundingClientRect`). The pointer is moved off the page first
 * so no hover tint is painted. A 1x1 PNG has one pixel, so every PNG filter returns the raw bytes.
 */
export async function paintedPixel(page: Page, x: number, y: number): Promise<Rgba> {
  await page.mouse.move(0, 0);
  const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 }, scale: 'css', animations: 'disabled', caret: 'hide' });
  const data: Buffer[] = [];
  let colourType = 0;
  for (let offset = 8; offset < png.length; ) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('latin1', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      expect(body.readUInt8(8), 'PNG bit depth').toBe(8);
      colourType = body.readUInt8(9);
    }
    if (type === 'IDAT') data.push(body);
    offset += 12 + length;
  }
  expect([2, 6], `PNG colour type ${colourType}`).toContain(colourType);
  const raw = inflateSync(Buffer.concat(data));
  return [raw.readUInt8(1), raw.readUInt8(2), raw.readUInt8(3), colourType === 6 ? raw.readUInt8(4) / 255 : 1];
}

/** True when two opaque colours differ by at most `tolerance` on every channel. */
export function sameColour(a: Rgba, b: Rgba, tolerance = 3): boolean {
  return [0, 1, 2].every((index) => Math.abs((a[index] ?? 0) - (b[index] ?? 0)) <= tolerance);
}

/** The text colour of a control against its own fill composited over what is behind it. */
export async function textContrast(locator: Locator): Promise<number> {
  const text = parseColour(await settledStyle(locator, 'color'));
  const fill = parseColour(await settledStyle(locator, 'backgroundColor'));
  const backdrop = backdropOf(await backdropsAbove(locator));
  return contrast(over(text, over(fill, backdrop)), over(fill, backdrop));
}
