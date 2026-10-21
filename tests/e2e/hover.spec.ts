import type { Locator, Page } from '@playwright/test';
import {
  backdropOf,
  backdropsAbove,
  contrast,
  flattenedBackground,
  imageColour,
  over,
  parseColour,
  parseLayers,
  type Rgba,
  settledStyle,
  textContrast,
} from './contrast.ts';
import { expect, openAccount, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T02: a hover that can be seen, a pressed look that hover cannot erase, the "Show worked hours" slide
 * switch, and the lighter label-picker selection. Every number is read from the browser's computed style
 * (WCAG 2.x relative luminance); nothing is computed by the application. Hover rules exist only where the
 * device can hover, so the desktop project measures them and the mobile project proves a tap leaves none
 * behind. Four theme situations are covered: a light device, a dark device, and the manual choice both ways.
 * Nothing here depends on the date or the time of day.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const STORAGE_KEY = 'timesheet.theme';
/** The project rule for a visible hover: the hover background differs from rest by at least this ratio. */
const HOVER_DELTA = 1.2;
/** WCAG 2.2 SC 1.4.11: state indicators and component boundaries. */
const NON_TEXT = 3;
/** WCAG 2.2 SC 1.4.3. */
const TEXT = 4.5;

type Theme = 'light' | 'dark';

interface Situation {
  name: string;
  media: Theme;
  stored: Theme | null;
}

const SITUATIONS: readonly Situation[] = [
  { name: 'light device', media: 'light', stored: null },
  { name: 'dark device', media: 'dark', stored: null },
  { name: 'light device, manual dark', media: 'light', stored: 'dark' },
  { name: 'dark device, manual light', media: 'dark', stored: 'light' },
];

/** Stores a theme before the app's first script runs, once per tab. */
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

/** A design token as the browser resolves it for this theme (read through a probe element). */
async function tokenColour(page: Page, token: string): Promise<Rgba> {
  const css = await page.locator('body').evaluate((body, name) => {
    const probe = body.ownerDocument.createElement('div');
    probe.style.backgroundColor = `var(${name})`;
    body.append(probe);
    const colour = body.ownerDocument.defaultView?.getComputedStyle(probe).backgroundColor ?? '';
    probe.remove();
    return colour;
  }, token);
  return parseColour(css);
}

function expectColour(actual: Rgba, expected: Rgba, label: string): void {
  const [ar, ag, ab, aa] = actual;
  const [er, eg, eb, ea] = expected;
  for (const [channel, got, want] of [
    ['red', ar, er],
    ['green', ag, eg],
    ['blue', ab, eb],
  ] as const) {
    expect(Math.abs(got - want), `${label}: ${channel} is ${got}, expected ${want}`).toBeLessThanOrEqual(1.5);
  }
  expect(Math.abs(aa - ea), `${label}: alpha is ${aa}, expected ${ea}`).toBeLessThanOrEqual(0.01);
}

const round = (value: number) => Math.round(value * 100) / 100;

async function canHover(page: Page): Promise<boolean> {
  return page.evaluate<boolean>("window.matchMedia('(hover: hover)').matches");
}

/* ---- Hover is clearly visible on every toggle-type control (desktop) ------------------------------------- */

interface Control {
  name: string;
  /** A control with a boundary shows an accent boundary on hover (3:1 against its surface). */
  boundary: boolean;
  /** A control with text keeps it readable (4.5:1) on the hover fill. */
  text: boolean;
  /** A control inside the account menu opens it first (the menu is the last thing the loop touches). */
  find: (page: Page) => Locator | Promise<Locator>;
}

/*
 * WP5-UX3-T02: Sign out left the top bar for the account menu, so the bar's own quiet button (the identity button) and
 * two entries of the opened menu (the Sign out button and the Settings link) carry the hover criterion that the bar's
 * Sign out carried before; the criterion itself is unchanged (a visible fill, an accent boundary where there is one, readable text).
 */
const CONTROLS: readonly Control[] = [
  { name: 'quiet button (Change several days)', boundary: true, text: true, find: (page) => page.getByRole('button', { name: 'Change several days', exact: true }) },
  { name: 'secondary button (Next period)', boundary: true, text: true, find: (page) => page.getByRole('button', { name: 'Next period', exact: true }) },
  { name: 'identity button (bar)', boundary: true, text: true, find: (page) => page.getByRole('banner').getByRole('button', { name: /, account menu$/ }) },
  { name: 'navigation link (Overtime)', boundary: false, text: true, find: (page) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Overtime', exact: true }) },
  { name: 'switch track (Show worked hours)', boundary: true, text: false, find: (page) => page.getByRole('switch', { name: 'Show worked hours', exact: true }) },
  { name: 'menu button (Sign out)', boundary: true, text: true, find: async (page) => (await openAccount(page)).getByRole('button', { name: 'Sign out', exact: true }) },
  { name: 'menu link (Settings)', boundary: false, text: true, find: async (page) => (await openAccount(page)).getByRole('link', { name: 'Settings', exact: true }) },
];

for (const situation of SITUATIONS) {
  // A device that can hover (the desktop project) measures the hover; a touch device (the mobile project) proves that a tap leaves none.
  test(`hover differs from rest by at least ${HOVER_DELTA}:1 and shows an accent boundary; a tap leaves none (${situation.name})`, async ({ page, signInThroughUi }) => {
    await prepare(page, situation, signInThroughUi);
    if (!(await canHover(page))) {
      await expectNoStickyHover(page, situation.name);
      return;
    }
    const measured: string[] = [];
    for (const control of CONTROLS) {
      const locator = await control.find(page);
      await locator.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const surface = backdropOf(await backdropsAbove(locator));
      const rest = await flattenedBackground(locator);
      await locator.hover();
      const hovered = await flattenedBackground(locator);
      const delta = contrast(rest, hovered);
      expect(delta, `${control.name}: hover background against rest (${situation.name})`).toBeGreaterThanOrEqual(HOVER_DELTA);
      let boundary = 'n/a';
      if (control.boundary) {
        const edge = over(parseColour(await settledStyle(locator, 'borderTopColor')), surface);
        const ratio = contrast(edge, surface);
        expect(ratio, `${control.name}: accent boundary on hover against its surface (${situation.name})`).toBeGreaterThanOrEqual(NON_TEXT);
        boundary = round(ratio).toString();
      }
      let text = 'n/a';
      if (control.text) {
        const ratio = await textContrast(locator);
        expect(ratio, `${control.name}: text on the hover fill (${situation.name})`).toBeGreaterThanOrEqual(TEXT);
        text = round(ratio).toString();
      }
      measured.push(`${control.name}: hover/rest ${round(delta)} boundary ${boundary} text ${text}`);
    }
    console.log(`hover ${situation.name}: ${measured.join('; ')}`);
  });

  test(`the phone tab hovers with the same fill; a tap leaves none (${situation.name})`, async ({ page, signInThroughUi }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await prepare(page, situation, signInThroughUi);
    const tab = page.locator('.shell-tabs a.tab:not([aria-current])').first();
    await expect(tab).toBeVisible();
    if (!(await canHover(page))) {
      // Touch: the More tab is never current, so a sticky hover would show on it after the tap.
      const more = page.locator('.shell-tabs button.tab');
      const rest = { background: await settledStyle(more, 'backgroundColor'), shadow: await settledStyle(more, 'boxShadow') };
      await more.tap();
      await expect(more).toHaveAttribute('aria-expanded', 'true');
      expect({ background: await settledStyle(more, 'backgroundColor'), shadow: await settledStyle(more, 'boxShadow') }, `the More tab after a tap equals rest (${situation.name})`).toEqual(rest);
      return;
    }
    await page.mouse.move(0, 0);
    const rest = await flattenedBackground(tab);
    await tab.hover();
    const hovered = await flattenedBackground(tab);
    const delta = contrast(rest, hovered);
    expect(delta, `phone tab hover background against rest (${situation.name})`).toBeGreaterThanOrEqual(HOVER_DELTA);
    const text = await textContrast(tab);
    expect(text, `phone tab text on the hover fill (${situation.name})`).toBeGreaterThanOrEqual(TEXT);
    // The current tab keeps its look under the pointer: accent text and the 2px rule.
    const current = page.locator('.shell-tabs a.tab[aria-current]');
    const currentRest = await settledStyle(current, 'color');
    await current.hover();
    expect(await settledStyle(current, 'color'), 'the current tab keeps its accent text under the pointer').toBe(currentRest);
    console.log(`hover phone tab ${situation.name}: hover/rest ${round(delta)} text ${round(text)}`);
  });

  /*
   * The pressed look: a solid accent fill that hover cannot erase (the generic quiet-button hover used to win
   * over the pressed rule, so the pressed toggle looked unpressed under the pointer that had just clicked it).
   */
  test(`a pressed toggle keeps its pressed look while hovered, and hover and pressed differ by 3:1 (${situation.name})`, async ({ page, signInThroughUi }) => {
    await prepare(page, situation, signInThroughUi);
    const toggle = page.getByRole('button', { name: 'Change several days', exact: true });
    const accent = await tokenColour(page, '--accent');
    const accentStrong = await tokenColour(page, '--accent-strong');
    const onAccent = await tokenColour(page, '--on-accent');
    const surface = backdropOf(await backdropsAbove(toggle));

    if (!(await canHover(page))) {
      // Touch: the tap presses it to the pressed rest look (never the pressed hover look) and the second tap releases it.
      const rest = await flattenedBackground(toggle);
      await toggle.tap();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expectColour(await flattenedBackground(toggle), accent, 'pressed background after a tap is --accent, not --accent-strong');
      expectColour(parseColour(await settledStyle(toggle, 'color')), onAccent, 'pressed text after a tap is --on-accent');
      expect(contrast(await flattenedBackground(toggle), surface), 'pressed fill against its surface').toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(await flattenedBackground(toggle), rest), 'pressed against unpressed').toBeGreaterThanOrEqual(NON_TEXT);
      await toggle.tap();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expectColour(await flattenedBackground(toggle), rest, 'unpressed background after the second tap equals rest');
      return;
    }

    await toggle.hover();
    const hoveredUnpressed = await flattenedBackground(toggle);
    // Pressing with the pointer still on the button: this is the moment the old toggle lost its state.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const hoveredPressed = await flattenedBackground(toggle);
    expectColour(hoveredPressed, accentStrong, 'pressed and hovered background is --accent-strong');
    expectColour(parseColour(await settledStyle(toggle, 'color')), onAccent, 'pressed and hovered text is --on-accent');
    expectColour(parseColour(await settledStyle(toggle, 'borderTopColor')), accentStrong, 'pressed and hovered border is --accent-strong');

    await page.mouse.move(0, 0);
    const restPressed = await flattenedBackground(toggle);
    expectColour(restPressed, accent, 'pressed background at rest is --accent');
    expect(await textContrast(toggle), 'pressed text on the accent fill').toBeGreaterThanOrEqual(TEXT);
    expect(contrast(restPressed, surface), 'pressed fill against its surface').toBeGreaterThanOrEqual(NON_TEXT);

    const pressedVsHover = contrast(restPressed, hoveredUnpressed);
    const pressedHoverVsHover = contrast(hoveredPressed, hoveredUnpressed);
    expect(pressedVsHover, 'pressed against the unpressed hover fill').toBeGreaterThanOrEqual(NON_TEXT);
    expect(pressedHoverVsHover, 'pressed and hovered against the unpressed hover fill').toBeGreaterThanOrEqual(NON_TEXT);

    // Pressing again returns to the unpressed look (hover back to the tint).
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.hover();
    expectColour(await flattenedBackground(toggle), hoveredUnpressed, 'unpressed hover is the tint again');
    console.log(
      `pressed ${situation.name}: pressed/hover-fill ${round(pressedVsHover)} pressed-hover/hover-fill ${round(pressedHoverVsHover)} pressed/surface ${round(contrast(restPressed, surface))}`,
    );
  });

  /* The pressed toggle keeps the shared focus ring on its accent fill, also under the pointer (the AX-04 special case is gone). */
  test(`the focus ring stays visible on the pressed accent fill, also under the pointer (${situation.name})`, async ({ page, signInThroughUi }) => {
    await prepare(page, situation, signInThroughUi);
    const toggle = page.getByRole('button', { name: 'Change several days', exact: true });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    await toggle.evaluate((element) => element.blur());
    await page.keyboard.press('Shift');
    await toggle.focus();
    await expect(toggle).toBeFocused();
    const ring = await ringOf(toggle);
    expect(ring.outside, 'ring against the surface').toBeGreaterThanOrEqual(NON_TEXT);
    expect(ring.insideGap, 'ring against its card gap').toBeGreaterThanOrEqual(NON_TEXT);
    expect(ring.gapOnFill, 'card gap against the accent fill').toBeGreaterThanOrEqual(NON_TEXT);
    let hovered = 'n/a (no hover)';
    if (await canHover(page)) {
      await toggle.hover();
      const under = await ringOf(toggle);
      expect(under.outside, 'ring against the surface under the pointer').toBeGreaterThanOrEqual(NON_TEXT);
      expect(under.gapOnFill, 'card gap against the accent fill under the pointer').toBeGreaterThanOrEqual(NON_TEXT);
      hovered = `${round(under.outside)}/${round(under.gapOnFill)}`;
    }
    console.log(`pressed focus ring ${situation.name}: ring/surface ${round(ring.outside)} ring/gap ${round(ring.insideGap)} gap/fill ${round(ring.gapOnFill)}; under the pointer ${hovered}`);
  });
}

/** The focus ring of a control as painted: ring and gap layers read from the computed shadow. */
async function ringOf(locator: Locator): Promise<{ outside: number; insideGap: number; gapOnFill: number }> {
  const boxShadow = await settledStyle(locator, 'boxShadow');
  const surface = backdropOf(await backdropsAbove(locator));
  const fill = await flattenedBackground(locator);
  const outset = parseLayers(boxShadow).filter((layer) => !layer.inset && layer.spread > 0);
  expect(outset.length, `a focus ring is painted (${boxShadow})`).toBeGreaterThanOrEqual(2);
  const ring = outset.reduce((a, b) => (b.spread > a.spread ? b : a));
  const gap = outset.reduce((a, b) => (b.spread < a.spread ? b : a));
  const ringColour = over(ring.colour, surface);
  const gapColour = over(gap.colour, surface);
  return { outside: contrast(ringColour, surface), insideGap: contrast(ringColour, gapColour), gapOnFill: contrast(gapColour, fill) };
}

/* ---- Touch: a tap leaves no hover behind ------------------------------------------------------------------- */

/** On a device that cannot hover (the mobile project) a tap on each control kind leaves its resting look, never a sticky hover. */
async function expectNoStickyHover(page: Page, situation: string): Promise<void> {
  expect(await canHover(page), `a touch device does not match (hover: hover) (${situation})`).toBe(false);
  const quiet = page.getByRole('button', { name: 'Change several days', exact: true });
  const secondary = page.getByRole('button', { name: 'Next period', exact: true });
  const accent = await tokenColour(page, '--accent');
  for (const [name, control] of [
    ['quiet button', quiet],
    ['secondary button', secondary],
  ] as const) {
    const restBackground = await settledStyle(control, 'backgroundColor');
    const restBorder = await settledStyle(control, 'borderTopColor');
    const restShadow = await settledStyle(control, 'boxShadow');
    await control.tap();
    if (name === 'quiet button') {
      // Pressed by the tap: the pressed rest look, never the pressed hover (--accent-strong).
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      expectColour(parseColour(await settledStyle(control, 'backgroundColor')), accent, 'pressed background after a tap is --accent');
      await control.tap();
      await expect(control).toHaveAttribute('aria-pressed', 'false');
    }
    expect(await settledStyle(control, 'backgroundColor'), `${name}: background after a tap equals rest`).toBe(restBackground);
    expect(await settledStyle(control, 'borderTopColor'), `${name}: border after a tap equals rest`).toBe(restBorder);
    expect(await settledStyle(control, 'boxShadow'), `${name}: shadow after a tap equals rest`).toBe(restShadow);
  }
  // The switch keeps no hover track either.
  const details = page.getByRole('switch', { name: 'Show worked hours', exact: true });
  const trackRest = await settledStyle(details, 'backgroundColor');
  const borderRest = await settledStyle(details, 'borderTopColor');
  await details.tap();
  await details.tap();
  await expect(details).not.toBeChecked();
  expect(await settledStyle(details, 'backgroundColor'), 'switch track after two taps equals rest').toBe(trackRest);
  expect(await settledStyle(details, 'borderTopColor'), 'switch border after two taps equals rest').toBe(borderRest);
  // The sheet's Category picker keeps no hover look after a tap either (WP5-UX3-FIX3 item 2): tap opens the list, a second tap closes it.
  const picker = page.locator('[data-label-picker] button[aria-label^="Category for"]').first();
  await picker.scrollIntoViewIfNeeded();
  const pickerRest = { background: await settledStyle(picker, 'backgroundColor'), border: await settledStyle(picker, 'borderTopColor'), shadow: await settledStyle(picker, 'boxShadow') };
  await picker.tap();
  await expect(picker).toHaveAttribute('aria-expanded', 'true');
  await picker.tap();
  await expect(picker).toHaveAttribute('aria-expanded', 'false');
  expect(await settledStyle(picker, 'backgroundColor'), `Category picker: background after a tap equals rest (${situation})`).toBe(pickerRest.background);
  expect(await settledStyle(picker, 'borderTopColor'), `Category picker: border after a tap equals rest (${situation})`).toBe(pickerRest.border);
  expect(await settledStyle(picker, 'boxShadow'), `Category picker: shadow after a tap equals rest (${situation})`).toBe(pickerRest.shadow);
}

/* ---- The "Show worked hours" slide switch ----------------------------------------------------------------------- */

test('Show worked hours is a native switch: role, off at load, Space and click toggle it, 0 and 14 detail rows', async ({ page, signInThroughUi }) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const details = page.getByRole('switch', { name: 'Show worked hours', exact: true });
  await expect(details).toBeVisible();
  expect(await details.evaluate((element) => [element.tagName, element.getAttribute('type'), element.getAttribute('role')])).toEqual(['INPUT', 'checkbox', 'switch']);
  // The visible text is the label of the switch, and it never changes with the state.
  const label = page.locator('label.inline.switch');
  await expect(label).toHaveCount(1);
  await expect(label).toHaveText('Show worked hours');
  await expect(page.getByText('Show worked hours', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show worked hours' })).toHaveCount(0);

  await expect(details).not.toBeChecked();
  await expect(page.locator('[data-detail]')).toHaveCount(0);

  await page.keyboard.press('Shift');
  await details.focus();
  await page.keyboard.press('Space');
  await expect(details).toBeChecked();
  await expect(page.locator('[data-detail="regular"]')).toHaveCount(14);
  await expect(label).toHaveText('Show worked hours');

  await details.click();
  await expect(details).not.toBeChecked();
  await expect(page.locator('[data-detail]')).toHaveCount(0);

  // A click on the visible text toggles it too (the label is the target).
  await label.click();
  await expect(details).toBeChecked();
  await expect(page.locator('[data-detail="regular"]')).toHaveCount(14);
  // It is not persisted: a reload starts it off again, as before.
  await page.reload();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await expect(page.getByRole('switch', { name: 'Show worked hours', exact: true })).not.toBeChecked();
});

for (const situation of SITUATIONS) {
  test(`every state of the Show worked hours switch reaches 3:1 (${situation.name})`, async ({ page, signInThroughUi }) => {
    await prepare(page, situation, signInThroughUi);
    const details = page.getByRole('switch', { name: 'Show worked hours', exact: true });
    const hover = await canHover(page);
    const measured: string[] = [];

    /** Boundary against the surface, thumb against the track, and where the thumb sits. */
    async function states(label: string, expectedThumb: string, edge: 'border' | 'track'): Promise<void> {
      const surface = backdropOf(await backdropsAbove(details));
      const track = await flattenedBackground(details);
      const border = over(parseColour(await settledStyle(details, 'borderTopColor')), surface);
      const thumb = await imageColour(details);
      await expect
        .poll(async () => details.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).backgroundPositionX ?? ''), { message: `${label}: the thumb has moved` })
        .toBe(expectedThumb);
      // The boundary of the component: the border when it is off, the accent track itself when it is on.
      const boundary = contrast(edge === 'border' ? border : track, surface);
      const thumbOnTrack = contrast(over(thumb, track), track);
      expect(boundary, `${label}: boundary against the surface (${situation.name})`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(thumbOnTrack, `${label}: thumb against the track (${situation.name})`).toBeGreaterThanOrEqual(NON_TEXT);
      measured.push(`${label} boundary ${round(boundary)} thumb ${round(thumbOnTrack)}`);
    }

    await page.mouse.move(0, 0);
    await states('off', '3px', 'border');
    if (hover) {
      await details.hover();
      await states('off hover', '3px', 'border');
      // The hover boundary is the accent.
      const surface = backdropOf(await backdropsAbove(details));
      expect(contrast(over(parseColour(await settledStyle(details, 'borderTopColor')), surface), surface), 'off hover: accent border').toBeGreaterThanOrEqual(NON_TEXT);
    }
    await details.check();
    await page.mouse.move(0, 0);
    await states('on', '21px', 'track');
    if (hover) {
      await details.hover();
      await states('on hover', '21px', 'track');
    }
    // Disabled is an inactive component (exempt from 1.4.3 and 1.4.11): it is dimmed and shows the not-allowed cursor.
    await page.mouse.move(0, 0);
    await details.evaluate((element) => element.setAttribute('disabled', ''));
    await expect
      .poll(
        async () =>
          details.evaluate((element) => {
            const style = element.ownerDocument.defaultView?.getComputedStyle(element);
            return { opacity: style?.opacity ?? '', cursor: style?.cursor ?? '' };
          }),
        { message: 'the disabled switch is dimmed and shows the not-allowed cursor' },
      )
      .toEqual({ opacity: '0.6', cursor: 'not-allowed' });
    console.log(`switch ${situation.name}: ${measured.join('; ')}`);
  });
}

for (const width of [390, 375, 360, 320]) {
  test(`phone ${width}px: the switch label is a 44px target and the tools row fits without sideways scroll`, async ({ page, signInThroughUi }) => {
    await page.setViewportSize({ width, height: 844 });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const label = page.locator('label.inline.switch');
    const button = page.getByRole('button', { name: 'Change several days', exact: true });
    const labelBox = await label.boundingBox();
    const buttonBox = await button.boundingBox();
    const inputBox = await page.getByRole('switch', { name: 'Show worked hours', exact: true }).boundingBox();
    const viewport = await page.evaluate<{ client: number; scroll: number }>('({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })');
    expect(labelBox?.height ?? 0, 'switch label height').toBeGreaterThanOrEqual(44);
    expect(labelBox?.width ?? 0, 'switch label width').toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height ?? 0, 'Change several days height').toBeGreaterThanOrEqual(44);
    expect(inputBox?.height ?? 0, 'switch track height (SC 2.5.8, 24px)').toBeGreaterThanOrEqual(24);
    expect((labelBox?.x ?? -1) + (labelBox?.width ?? 0), 'label inside the screen').toBeLessThanOrEqual(viewport.client + 0.5);
    expect((buttonBox?.x ?? -1) + (buttonBox?.width ?? 0), 'button inside the screen').toBeLessThanOrEqual(viewport.client + 0.5);
    expect(viewport.scroll, 'no horizontal scroll (scrollWidth against clientWidth)').toBeLessThanOrEqual(viewport.client);
    const sameRow = Math.abs((labelBox?.y ?? 0) - (buttonBox?.y ?? 0)) < 4;
    if (width >= 390) expect(sameRow, 'at 390px the switch and the button share one row').toBe(true);
    console.log(
      `tools row ${width}px: label ${labelBox?.width}x${labelBox?.height}, button ${buttonBox?.width}x${buttonBox?.height}, track ${inputBox?.width}x${inputBox?.height}, one row ${sameRow}, clientWidth ${viewport.client} scrollWidth ${viewport.scroll}`,
    );
  });
}

/* ---- The label picker: a lighter selection that is still obvious ------------------------------------------- */

for (const situation of SITUATIONS) {
  test(`the label picker: 1px open line, rail on the active option, check on the current value (${situation.name})`, async ({
    page,
    signInThroughUi,
    isMobile,
  }) => {
    await prepare(page, situation, signInThroughUi);
    const trigger = page.locator('[data-label-picker] button[aria-label^="Category for"]:not([aria-label$="not set"])').first();
    await trigger.scrollIntoViewIfNeeded();
    await page.keyboard.press('Shift');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const list = page.getByRole('listbox');
    await expect(list).toBeFocused();
    const options = list.getByRole('option');
    const current = list.locator('[aria-selected="true"]');
    await expect(current, 'the day has a current value').toHaveCount(1);

    // The keyboard cursor sits on an option that is not the current value.
    await page.keyboard.press('Home');
    if ((await options.first().getAttribute('aria-selected')) === 'true') await page.keyboard.press('ArrowDown');
    const active = list.locator('.label-option.active');
    await expect(active).toHaveCount(1);
    await expect(active).not.toHaveAttribute('aria-selected', 'true');

    // 1. The open trigger carries a single 1px accent line (it was 2px) and a turned caret.
    const surface = backdropOf(await backdropsAbove(trigger));
    const triggerLayers = parseLayers(await settledStyle(trigger, 'boxShadow'));
    expect(triggerLayers, 'the open trigger has one shadow layer').toHaveLength(1);
    expect(triggerLayers[0]?.inset, 'the open trigger line is inset').toBe(true);
    expect(triggerLayers[0]?.spread, 'the open trigger line is 1px').toBe(1);
    const line = triggerLayers[0]?.colour ?? [0, 0, 0, 1];
    expect(contrast(over(line, surface), surface), 'the open trigger line against its surface').toBeGreaterThanOrEqual(NON_TEXT);
    await expect
      .poll(async () => trigger.locator('.label-caret').evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).transform ?? ''), { message: 'the caret has turned' })
      .toMatch(/^matrix\(-1, (-?0|-?[\d.e-]+), (-?0|-?[\d.e-]+), -1, 0, 0\)$/);

    // 2. The active option: the hover tint and a 3px leading rail, no frame.
    const card = backdropOf(await backdropsAbove(active));
    const tint = await tokenColour(page, '--hover-fill');
    const fill = await flattenedBackground(active);
    expectColour(fill, over(tint, card), 'the active option is filled with --hover-fill');
    const layers = parseLayers(await settledStyle(active, 'boxShadow'));
    expect(layers, 'the active option has exactly one layer: the rail').toHaveLength(1);
    expect(layers[0]?.inset, 'the rail is inset').toBe(true);
    expect(layers[0]?.offsetX, 'the rail is 3px wide').toBe(3);
    expect(layers.filter((layer) => layer.spread > 0), 'no frame around the active option').toHaveLength(0);
    const rail = over(layers[0]?.colour ?? [0, 0, 0, 1], fill);
    const railOnFill = contrast(rail, fill);
    const railOnCard = contrast(rail, card);
    expect(railOnFill, 'the rail against the option fill').toBeGreaterThanOrEqual(NON_TEXT);
    expect(railOnCard, 'the rail against the card').toBeGreaterThanOrEqual(NON_TEXT);
    expect(await textContrast(active), 'the active option text on its fill').toBeGreaterThanOrEqual(TEXT);

    // 3. The current value: accent text, weight 600 and a check shape, so it is not shown by colour alone.
    const accent = await tokenColour(page, '--accent');
    expectColour(parseColour(await settledStyle(current, 'color')), accent, 'the current value is accent text');
    expect(await current.evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element).fontWeight)).toBe('600');
    const check = await current.evaluate((element) => {
      const style = element.ownerDocument.defaultView?.getComputedStyle(element, '::after');
      return { content: style?.content ?? '', width: style?.width ?? '', height: style?.height ?? '', borderRight: style?.borderRightWidth ?? '', borderBottom: style?.borderBottomWidth ?? '', colour: style?.borderRightColor ?? '' };
    });
    expect(check.content, 'the check shape exists').not.toBe('none');
    expect([check.width, check.height, check.borderRight, check.borderBottom]).toEqual(['5px', '10px', '2px', '2px']);
    expect(contrast(over(parseColour(check.colour), card), card), 'the check against the card').toBeGreaterThanOrEqual(NON_TEXT);
    // The other options carry no check.
    const others = list.locator('[role="option"]:not([aria-selected="true"])');
    expect(await others.first().evaluate((element) => element.ownerDocument.defaultView?.getComputedStyle(element, '::after').content)).toBe('none');
    expect(await textContrast(current), 'the current value text on the card').toBeGreaterThanOrEqual(TEXT);

    // 4. Phone: every option stays a 44px target.
    if (isMobile) {
      for (const option of await options.all()) expect((await option.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    // 5. Where the device can hover, the pointer moves the active option with the same tint and rail, and a resting option stays plain.
    let pointer = 'n/a (no hover)';
    if (await canHover(page)) {
      const third = options.nth(2);
      await third.hover();
      await expect(third).toHaveClass(/active/);
      await expect(list.locator('.label-option.active')).toHaveCount(1);
      const resting = options.nth(3);
      await expect(resting).not.toHaveClass(/active/);
      const delta = contrast(await flattenedBackground(resting), await flattenedBackground(third));
      expect(delta, 'the option under the pointer against a resting option').toBeGreaterThanOrEqual(HOVER_DELTA);
      expect(parseLayers(await settledStyle(third, 'boxShadow')).map((layer) => [layer.inset, layer.offsetX, layer.spread])).toEqual([[true, 3, 0]]);
      pointer = `${round(delta)}:1`;
      await page.mouse.move(0, 0);
    }
    // Keyboard behaviour is unchanged.
    await page.keyboard.press('End');
    await expect(options.last()).toHaveClass(/active/);
    await page.keyboard.press('Escape');
    await expect(list).toHaveCount(0);
    await expect(trigger).toBeFocused();
    console.log(
      `label picker ${situation.name}: trigger line 1px, rail 3px on fill ${round(railOnFill)} on card ${round(railOnCard)}, check ${round(contrast(over(parseColour(check.colour), card), card))}, option under the pointer ${pointer}`,
    );
  });
}

/* ---- Every hover rule of the style sheet (WP5-UX3-FIX2 item 11, WP5-UX3-FIX3 item 2, AGENTS UI rule 3) ------- */

/**
 * Hover rules that may stay outside `@media (hover: hover)`: only reset rules that paint nothing new, each with its reason. There is
 * none: the read-only sheet's two reset rules sit inside the media block too, so a tap can never leave a tint behind.
 */
const UNGATED_HOVER_ALLOWLIST: ReadonlyArray<{ selector: string; reason: string }> = [];

/**
 * Every `:hover` rule of the page's parsed style sheets, split two ways: by the text of its enclosing media conditions (`ungated` has no
 * `(hover: hover)` in any of them) and by what the browser says now (`applying` lists the rules whose enclosing media conditions ALL
 * match on this device, so a hover look can paint here).
 */
async function collectHoverRules(page: Page): Promise<{ ungated: string[]; gated: string[]; applying: string[] }> {
  return page.evaluate<{ ungated: string[]; gated: string[]; applying: string[] }>(`(() => {
    const result = { ungated: [], gated: [], applying: [] };
    const visit = (list, hoverOnly, applies) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSMediaRule) {
          visit(rule.cssRules, hoverOnly || /hover:\\s*hover/.test(rule.media.mediaText), applies && window.matchMedia(rule.media.mediaText).matches);
        } else if (rule instanceof CSSStyleRule) {
          if (rule.selectorText.includes(':hover')) {
            (hoverOnly ? result.gated : result.ungated).push(rule.selectorText);
            if (applies) result.applying.push(rule.selectorText);
          }
        } else if (rule instanceof CSSGroupingRule) {
          visit(rule.cssRules, hoverOnly, applies);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules, false, true);
    return result;
  })()`);
}

/**
 * A tap must not leave a hover look on a touch screen: EVERY rule of the application's style sheet whose selector uses `:hover`
 * (the day column tint, the lifted column's tint, the Category picker, the form fields, the table rows, the button links and the
 * rest) sits inside `@media (hover: hover)`, except the explicit allowlist above. The browser's own parsed style sheets are read, so
 * the check does not depend on a device and a new ungated hover rule fails here at once.
 */
test('every hover rule of the style sheet exists only under (hover: hover); where the device can hover, a day column tints under the pointer', async ({
  page,
  signInThroughUi,
}) => {
  await signInThroughUi();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const rules = await collectHoverRules(page);
  const allowed = new Set(UNGATED_HOVER_ALLOWLIST.map((entry) => entry.selector));
  expect(
    rules.ungated.filter((selector) => !allowed.has(selector)),
    'hover rules outside (hover: hover)',
  ).toEqual([]);
  expect(rules.gated.length, 'the style sheet has gated hover rules to scan').toBeGreaterThan(20);
  for (const needle of ['.sheet .label-trigger', 'input:hover', 'tbody tr:hover', '.button-link:hover', '.sheet-review .sheet-day']) {
    expect(
      rules.gated.some((selector) => selector.includes(needle)),
      `the hover rule "${needle}" is a gated hover rule`,
    ).toBe(true);
  }
  expect(rules.gated.some((selector) => selector.includes('[data-lift]')), 'the lifted column tint is a gated hover rule').toBe(true);
  expect(rules.gated.some((selector) => !selector.includes('[data-lift]') && !selector.includes('.sheet-date')), 'the day column tint is a gated hover rule').toBe(true);

  if (await canHover(page)) {
    // A day column that is neither lifted nor selected tints under the pointer and returns to rest when it leaves.
    const day = page.locator('.sheet-day[data-day]:not([data-lift]):not(.selected):not(.nonworking)').first();
    await page.mouse.move(0, 0);
    const rest = await settledStyle(day, 'backgroundColor');
    await day.hover({ position: { x: 4, y: 4 } });
    expect(await settledStyle(day, 'backgroundColor'), 'a hovered day column differs from rest').not.toBe(rest);
    await page.mouse.move(0, 0);
    expect(await settledStyle(day, 'backgroundColor'), 'the day column returns to rest').toBe(rest);
  }
});

/**
 * WP5-UX3-FIX4 item 4: the scan above judges the TEXT of the media conditions. A touch screen (hover none, pointer coarse) judges what
 * the browser matches: no hover rule may apply there, whatever its condition says (for example `(hover: hover), (pointer: coarse)` is
 * textually gated and still applies on a phone). The touch device is the mobile project's own, and a touch context on the desktop project.
 */
test.describe('a touch screen', () => {
  test.use({ hasTouch: true });

  test('no hover rule of the style sheet applies where the device cannot hover', async ({ page, signInThroughUi }) => {
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    expect(
      await page.evaluate<{ hover: boolean; coarse: boolean }>(
        "({ hover: window.matchMedia('(hover: none)').matches, coarse: window.matchMedia('(pointer: coarse)').matches })",
      ),
      'the page is a touch screen: it cannot hover and its pointer is coarse',
    ).toEqual({ hover: true, coarse: true });
    const rules = await collectHoverRules(page);
    expect(rules.gated.length + rules.ungated.length, 'the style sheet has hover rules to judge').toBeGreaterThan(20);
    const allowed = new Set(UNGATED_HOVER_ALLOWLIST.map((entry) => entry.selector));
    expect(
      rules.applying.filter((selector) => !allowed.has(selector)),
      'hover rules that apply on a touch screen',
    ).toEqual([]);
  });
});

/* ---- The focus ring under the pointer (WP5-UX3-FIX3 item 1, SC 2.4.7) ------------------------------------- */

/** True when the element is focused, matches `:focus-visible` and has the pointer over it (the precondition of the ring checks). */
async function focusedAndHovered(locator: Locator): Promise<{ focus: boolean; focusVisible: boolean; hover: boolean }> {
  return locator.evaluate((element) => ({
    focus: element === element.ownerDocument.activeElement,
    focusVisible: element.matches(':focus-visible'),
    hover: element.matches(':hover'),
  }));
}

/**
 * Keyboard focus puts the shared ring on a control, and the pointer resting on that control must not take it away. Compared with
 * the same focused control while the pointer is elsewhere: the ring is painted, equal to the pointer-away ring, and meets 3:1.
 */
async function expectRingUnderPointer(page: Page, control: Locator, kind: 'shared' | 'inset' | 'inset-gap', label: string): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await control.evaluate((element) => element.blur());
  await page.keyboard.press('Shift');
  await control.focus();
  await expect(control).toBeFocused();
  const away = await settledStyle(control, 'boxShadow');
  await control.hover();
  const state = await focusedAndHovered(control);
  expect(state, `${label}: focused by keyboard with the pointer on it`).toEqual({ focus: true, focusVisible: true, hover: true });
  const under = await settledStyle(control, 'boxShadow');
  expect(under, `${label}: the ring under the pointer equals the ring with the pointer away`).toBe(away);
  const layers = parseLayers(under);
  const surface = backdropOf(await backdropsAbove(control));
  if (kind === 'shared') {
    const outset = layers.filter((layer) => !layer.inset && layer.spread > 0);
    expect(outset.length, `${label}: the shared ring has its card gap and its accent ring (${under})`).toBeGreaterThanOrEqual(2);
    const ring = outset.reduce((a, b) => (b.spread > a.spread ? b : a));
    expect(ring.spread, `${label}: the shared ring is 3px`).toBe(3);
    expect(contrast(over(ring.colour, surface), surface), `${label}: ring against its surface`).toBeGreaterThanOrEqual(NON_TEXT);
  } else if (kind === 'inset-gap') {
    // The shared inset ring (`--focus-ring-inset`): a 2px accent ring and a 3px card-coloured gap layer inside the control.
    expect(layers, `${label}: the inset ring and its gap layer (${under})`).toHaveLength(2);
    expect(layers.map((layer) => [layer.inset, layer.spread]), `${label}: inset 2px ring, then inset 3px gap`).toEqual([[true, 2], [true, 3]]);
    const fill = await flattenedBackground(control);
    expect(contrast(over(layers[0]?.colour ?? [0, 0, 0, 1], fill), fill), `${label}: inset ring against the hovered fill`).toBeGreaterThanOrEqual(NON_TEXT);
  } else {
    expect(layers, `${label}: one inset ring layer (${under})`).toHaveLength(1);
    expect(layers[0]?.inset, `${label}: the ring is inset`).toBe(true);
    expect(layers[0]?.spread, `${label}: the inset ring is 2px`).toBe(2);
    const fill = await flattenedBackground(control);
    expect(contrast(over(layers[0]?.colour ?? [0, 0, 0, 1], fill), fill), `${label}: inset ring against the hovered fill`).toBeGreaterThanOrEqual(NON_TEXT);
  }
  await page.mouse.move(0, 0);
}

for (const situation of SITUATIONS.slice(0, 2)) {
  test(`the keyboard focus ring stays under the pointer on the sheet's date button, Category picker and phone day button, also after Escape returns focus from the Day editor (${situation.name})`, async ({
    page,
    signInThroughUi,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepare(page, situation, signInThroughUi);
    // A touch device has no pointer resting on a control: the mobile project proves the tap side in the hover tests above.
    if (!(await canHover(page))) return;
    const day = page.locator('.sheet-day[data-day]:not(.nonworking)').first();
    const date = day.locator('[data-day-button]');
    const picker = day.locator('[data-label-picker] button[aria-label^="Category for"]');
    await expectRingUnderPointer(page, date, 'shared', `date button (${situation.name})`);
    await expectRingUnderPointer(page, picker, 'inset', `Category picker (${situation.name})`);
    // A button link (the period bar's review link) keeps the shared ring under the pointer (WP5-UX3-FIX4 item 2: `.button-link:focus-visible:hover`).
    await expectRingUnderPointer(page, page.locator('.period-cta a.button-link[data-review-link]'), 'shared', `button link (${situation.name})`);

    // Click the date (the editor opens beside the sheet at 1440), then Escape: focus returns to the date button, pointer still on it.
    const workDate = (await day.getAttribute('data-day')) ?? '';
    await date.click();
    const editor = page.getByRole('dialog', { name: new RegExp(`^Day editor .*${workDate}`) });
    await expect(editor).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
    await expect(date).toBeFocused();
    await date.hover();
    expect(await focusedAndHovered(date), `date button after Escape (${situation.name})`).toEqual({ focus: true, focusVisible: true, hover: true });
    const afterEscape = await settledStyle(date, 'boxShadow');
    const outset = parseLayers(afterEscape).filter((layer) => !layer.inset && layer.spread > 0);
    expect(outset.length, `a ring is painted on the date button after the Escape return (${afterEscape})`).toBeGreaterThanOrEqual(2);
    const surface = backdropOf(await backdropsAbove(date));
    const ring = outset.reduce((a, b) => (b.spread > a.spread ? b : a));
    expect(contrast(over(ring.colour, surface), surface), `ring after the Escape return (${situation.name})`).toBeGreaterThanOrEqual(NON_TEXT);
    await page.mouse.move(0, 0);

    // A phone-width window on a device that can hover: the day button of the phone table keeps the shared ring too.
    await page.setViewportSize({ width: 390, height: 844 });
    // Only the phone table's day button has the sheet-day-button class, so the visibility wait cannot resolve the desktop sheet button before the media-query layout swap.
    const phoneDay = page.locator('[data-day]:not(.nonworking) .sheet-day-button').first();
    await expect(phoneDay).toBeVisible();
    await expectRingUnderPointer(page, phoneDay, 'shared', `phone day button (${situation.name})`);
    // A tab that is not the current one keeps its inset ring under the pointer (WP5-UX3-FIX4 item 2: `.shell-tabs .tab:focus-visible:hover`).
    await expectRingUnderPointer(page, page.locator('.shell-tabs a.tab:not([aria-current])').first(), 'inset-gap', `phone tab (${situation.name})`);
    console.log(`ring under the pointer ${situation.name}: date, Category picker, button link, phone day button, phone tab and the Escape return keep their ring`);
  });
}

/* ---- Synthetic captures for the record: hover, pressed, the switch and the picker, light and dark ---------- */

for (const theme of ['light', 'dark'] as const) {
  test(`synthetic captures of the controls (${theme})`, async ({ page, signInThroughUi }, testInfo) => {
    const project = testInfo.project.name;
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signInThroughUi();
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const tools = page.locator('.tools');
    const toggle = page.getByRole('button', { name: 'Change several days', exact: true });
    const details = page.getByRole('switch', { name: 'Show worked hours', exact: true });

    // Pressed with the pointer still on it where the device can hover (pressed and hovered); pressed alone on a touch device.
    await details.check();
    await toggle.click();
    await toggle.hover();
    await flattenedBackground(toggle);
    await tools.screenshot({ path: screenshotPath(`t02-tools-pressed-hover-${theme}-${project}-synthetic.png`), animations: 'disabled' });

    await toggle.click();
    await page.mouse.move(0, 0);
    await details.uncheck();
    await details.hover();
    await flattenedBackground(details);
    await tools.screenshot({ path: screenshotPath(`t02-switch-off-hover-${theme}-${project}-synthetic.png`), animations: 'disabled' });
    await page.mouse.move(0, 0);

    const trigger = page.locator('[data-label-picker] button[aria-label^="Category for"]:not([aria-label$="not set"])').first();
    await trigger.scrollIntoViewIfNeeded();
    await page.keyboard.press('Shift');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const list = page.getByRole('listbox');
    await expect(list).toBeFocused();
    await page.keyboard.press('Home');
    if ((await list.getByRole('option').first().getAttribute('aria-selected')) === 'true') await page.keyboard.press('ArrowDown');
    await expect(list.locator('.label-option.active')).toHaveCount(1);
    await settledStyle(list.locator('.label-option.active'), 'backgroundColor');
    const triggerBox = await trigger.boundingBox();
    const listBox = await list.boundingBox();
    if (triggerBox !== null && listBox !== null) {
      const x = Math.max(0, Math.min(triggerBox.x, listBox.x) - 12);
      const y = Math.max(0, triggerBox.y - 12);
      const right = Math.max(triggerBox.x + triggerBox.width, listBox.x + listBox.width) + 12;
      const bottom = listBox.y + listBox.height + 12;
      await page.screenshot({ path: screenshotPath(`t02-picker-open-${theme}-${project}-synthetic.png`), clip: { x, y, width: right - x, height: bottom - y }, animations: 'disabled' });
    }
    await page.keyboard.press('Escape');
  });
}
