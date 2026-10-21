import type { Locator, Page } from '@playwright/test';
import * as shared from './contrast.ts';
import { ANY_DAY_BUTTON_NAME } from './dayButton.ts';
import { expect, newPerson, openAccount, screenshotPath, test } from './fixtures.ts';

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

/** Focuses `locator` from the keyboard and reads the ring from `painted` (another element, such as the label of an invisible radio). */
async function focusedProbe(locator: Locator, painted: Locator = locator): Promise<Probe> {
  await locator.scrollIntoViewIfNeeded();
  await locator.page().keyboard.press('Shift');
  await locator.focus();
  await expect(locator).toBeFocused();
  // Wait until the shared transition has finished: the ring is painted and unchanged over two reads.
  const read = async () => painted.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).boxShadow ?? 'none');
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
  return painted.evaluate((element) => {
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

/**
 * The active label option (WP5-UX2-T02) is a tint plus a leading accent rail, not a frame: a one-sided inset layer at
 * least 2px wide that reaches 3:1 against the option's own fill and against the card behind the list (SC 1.4.11).
 */
async function expectRail(option: Locator): Promise<{ width: number; againstFill: number; againstCard: number }> {
  const boxShadow = await settledShadow(option);
  const card = backdropOf(await backdropsOf(option, false));
  const fill = shared.over(shared.parseColour(await shared.settledStyle(option, 'backgroundColor')), card);
  const layers = shared.parseLayers(boxShadow);
  expect(
    layers.filter((layer) => layer.inset && layer.spread > 0),
    `the active option is not framed (${boxShadow})`,
  ).toHaveLength(0);
  const rail = layers.find((layer) => layer.inset && layer.offsetX > 0);
  expect(rail, `the active option paints a leading rail (${boxShadow})`).toBeDefined();
  if (rail === undefined) return { width: 0, againstFill: 0, againstCard: 0 };
  expect(rail.offsetX, `the rail is at least 2px wide (${boxShadow})`).toBeGreaterThanOrEqual(2);
  const colour = shared.over(rail.colour, fill);
  const againstFill = shared.contrast(colour, fill);
  const againstCard = shared.contrast(colour, card);
  expect(againstFill, `the rail against the option fill (${boxShadow})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
  expect(againstCard, `the rail against the card (${boxShadow})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
  return { width: rail.offsetX, againstFill, againstCard };
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
      ['button', page.getByRole('button', { name: 'Check in' })],
      ['link', nav.getByRole('link', { name: 'Overtime' })],
      ['sheet date', sheetDate],
    ];
    if (project === 'mobile') controls.push(['phone tab', nav.getByRole('link', { name: 'History' })]);
    // WP5-UX3-T02: the identity button of the top bar (the bar is not displayed on a phone).
    else controls.push(['identity button', page.getByRole('banner').getByRole('button', { name: /, account menu$/ })]);
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
    const rail = await expectRail(active);
    console.log(`label picker ring ${colorScheme}: list ${listRatio.toFixed(2)} active option rail ${rail.width}px, against fill ${rail.againstFill.toFixed(2)} against card ${rail.againstCard.toFixed(2)}`);
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
    await page.getByRole('switch', { name: 'Show worked hours', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(field).toBeFocused();
    const ratio = expectRing('date field', { boxShadow: await settledShadow(field), backdrops: await backdropsOf(field, false) });
    console.log(`date field ring after Shift+Tab ${colorScheme}: ${ratio.toFixed(2)}`);
  });

  /*
   * WP5-UX-AX-04 (SC 2.4.7 and 1.4.11): a pressed toggle ("Change several days") and, since WP5-UX2-T07, the
   * checked segment of the Light/Dark theme control (which replaced the pressed "Dark mode" button) keep the focus
   * ring when they take keyboard focus; the pressed or checked state alone is not a ring. WP5-UX2-T02: the pressed
   * look is a solid accent fill and the old pressed-ring special case is gone, so the shared ring itself must stay
   * visible on that fill (its card-coloured gap against the fill and the ring against the gap, 3:1 each).
   * A theme segment is painted by the label of its invisible radio: the radio takes the focus, the label shows the ring.
   * "Show worked hours" is a switch now and has its own test below.
   */
  test(`WP5-UX-AX-04: a pressed toggle and a checked theme segment still show the focus ring (${colorScheme})`, async ({ page, signInThroughUi }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    /** The assertions of one pressed or checked control; `focusTarget` takes the focus and `painted` shows the ring. */
    const expectPressedRing = async (name: string, focusTarget: Locator, painted: Locator): Promise<void> => {
      await page.mouse.move(0, 0);
      await focusTarget.evaluate((element) => element.blur());
      const pressedOnly = await settledShadow(painted);
      const probe = await focusedProbe(focusTarget, painted);
      expect(probe.boxShadow, `${name}: focused and pressed differs from pressed only`).not.toBe(pressedOnly);
      const outset = parseLayers(probe.boxShadow).filter((layer) => !layer.inset && layer.spread > 0);
      expect(outset.length, `${name} paints an outer focus ring (${probe.boxShadow})`).toBeGreaterThan(0);
      expectRing(`pressed ${name}`, probe);
      const ring = await shared.measureFocusRing(painted);
      expect(ring.ringAgainstGap, `pressed ${name}: ring against its gap (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
      expect(ring.gapAgainstFill ?? 0, `pressed ${name}: gap against the accent fill (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
      console.log(`pressed ${name} ring ${colorScheme}: ring/backdrop ${ring.ringAgainstBackdrop.toFixed(2)} ring/gap ${ring.ringAgainstGap.toFixed(2)} gap/fill ${(ring.gapAgainstFill ?? 0).toFixed(2)}`);
    };

    const several = page.getByRole('button', { name: 'Change several days', exact: true });
    await several.click();
    await expect(several).toHaveAttribute('aria-pressed', 'true');
    await expectPressedRing('Change several days', several, several);
    await several.click();
    await expect(several).toHaveAttribute('aria-pressed', 'false');

    // The theme control lives in the account menu (desktop) or the More panel (phone), which is opened if closed.
    await openAccount(page);
    const group = page.getByRole('radiogroup', { name: 'Theme', exact: true });
    for (const option of ['Light', 'Dark']) {
      const radio = group.getByRole('radio', { name: option, exact: true });
      await radio.check();
      await expect(radio).toBeChecked();
      await expectPressedRing(`${option} theme segment`, radio, radio.locator('xpath=..'));
    }
  });

  /* The "Show worked hours" slide switch (WP5-UX2-T02) shows the shared ring in both states, also on its accent track. */
  test(`the Show worked hours switch shows the focus ring unchecked and checked (${colorScheme})`, async ({ page, signInThroughUi }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const details = page.getByRole('switch', { name: 'Show worked hours', exact: true });
    for (const checked of [false, true]) {
      if (checked) await details.check();
      await expect(details).toBeChecked({ checked });
      await page.mouse.move(0, 0);
      await details.evaluate((element) => element.blur());
      const probe = await focusedProbe(details);
      const label = checked ? 'checked' : 'unchecked';
      expectRing(`${label} switch`, probe);
      const ring = await shared.measureFocusRing(details);
      expect(ring.ringAgainstGap, `${label} switch: ring against its gap (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
      if (checked) expect(ring.gapAgainstFill ?? 0, `checked switch: gap against the accent track (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
      console.log(`switch ring ${colorScheme} ${label}: ring/backdrop ${ring.ringAgainstBackdrop.toFixed(2)} ring/gap ${ring.ringAgainstGap.toFixed(2)}`);
    }
  });
}

/*
 * WP5-UX2-AUDIT-03 (owner decision WP5-UX-Q1 a): the inactive Today (`aria-disabled`, still focusable) is dimmed with colour tokens
 * (muted text and the quiet line border), never with element opacity, so the shared focus ring around it is painted at full strength:
 * at least 3:1 against the card in the light and the dark theme and with both manual overrides. The ring is read from the screenshot
 * pixel in the middle of the accent band (the card-coloured 1px gap lies inside it), so a dimmed ring would be seen.
 */
const THEME_SITUATIONS = [
  { name: 'light device', scheme: 'light', stored: null },
  { name: 'dark device', scheme: 'dark', stored: null },
  { name: 'light device, manual dark', scheme: 'light', stored: 'dark' },
  { name: 'dark device, manual light', scheme: 'dark', stored: 'light' },
] as const;

for (const situation of THEME_SITUATIONS) {
  test(`WP5-UX2-AUDIT-03: the focus ring of the inactive Today is painted at 3:1 (${situation.name})`, async ({ page, signInThroughUi }, testInfo) => {
    await page.emulateMedia({ colorScheme: situation.scheme, reducedMotion: 'reduce' });
    if (situation.stored !== null) await page.addInitScript(`try { localStorage.setItem('timesheet.theme', '${situation.stored}'); } catch {}`);
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const today = page.locator('.period-bar').getByRole('button', { name: 'Today', exact: true });
    // On the five days after a period ends the page opens on the ended period and Today is active: pressing it makes it inactive.
    if ((await today.getAttribute('aria-disabled')) !== 'true') {
      await today.focus();
      await page.keyboard.press('Enter');
    }
    await expect(today).toHaveAttribute('aria-disabled', 'true');
    // Calendar-independent focus step: outside that window Today is already inactive on landing and nothing has focus, so start from
    // the button itself, step away and come back by keyboard (it must stay in the tab order while inactive).
    await today.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(today).not.toBeFocused();
    await page.keyboard.press('Tab');
    await expect(today).toBeFocused();
    const ring = await shared.measureFocusRing(today);
    const opacity = await today.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).opacity ?? '');
    const box = await today.boundingBox();
    expect(box, 'the inactive Today has a box').not.toBeNull();
    const card = await shared.tokenColour(page, '--card');
    const accent = await shared.tokenColour(page, '--accent');
    // The shared ring is a 1px card gap, then 2px of accent, outside the border box: sample the middle of the accent band.
    const pixel = await shared.paintedPixel(page, (box?.x ?? 0) - 2.5, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    const painted = shared.contrast(pixel, card);
    const text = await shared.textContrast(today);
    console.log(
      `inactive Today ring ${testInfo.project.name} ${situation.name}: opacity ${opacity}; painted ${pixel.slice(0, 3).join(',')} on ${card.slice(0, 3).join(',')} = ${painted.toFixed(2)}:1; token ring/card ${ring.ringAgainstBackdrop.toFixed(2)}; text ${text.toFixed(2)}:1`,
    );
    // Within anti-aliasing of the sampled sub-pixel (16 per channel): a 0.6-opacity blend would be about 90 away on the red channel.
    expect(shared.sameColour(pixel, accent, 16), `the painted ring ${pixel.slice(0, 3).join(',')} is the full accent ${accent.slice(0, 3).join(',')}`).toBe(true);
    expect(painted, `painted ring ${pixel.slice(0, 3).join(',')} against the card ${card.slice(0, 3).join(',')}`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
    // No element opacity: it would dim the ring with the button (that was 2.70:1 in the light theme at opacity 0.6).
    expect(opacity, 'the inactive Today is dimmed with colours, not with opacity').toBe('1');
    expect(ring.ringAgainstBackdrop, `ring against the card (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
    expect(ring.ringAgainstGap, `ring against its gap (${ring.layers})`).toBeGreaterThanOrEqual(MINIMUM_RATIO);
    // Dimmed by colour, still readable: the muted text keeps 4.5:1 on the card.
    expect(text, 'the inactive Today text against its fill').toBeGreaterThanOrEqual(4.5);
  });
}
