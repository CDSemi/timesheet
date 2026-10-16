import type { Locator, Page } from '@playwright/test';
import { backdropOf, backdropsAbove, contrast, flattenedBackground, focusFromKeyboard, measureFocusRing, over, parseColour, settledStyle, textContrast } from './contrast.ts';
import { expect, newPerson, openAccount, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T01: the theme control of the main navigation. Two states, the device's theme until the
 * first choice, a per-device choice kept in local storage (`timesheet.theme`), applied before the first
 * paint by a same-origin script (the content security policy forbids inline scripts). Desktop: the
 * control is in the account menu under the identity button of the top bar (WP5-UX3-T02; it was in the bar itself);
 * phone: in the More panel. Nothing here depends on the date or the time of day.
 *
 * WP5-UX2-T07: the control is a "Theme" radio group of two native radios, "Light" (sun icon) and "Dark" (moon
 * icon), instead of a pressed "Dark mode" button. The checked radio is the theme in effect (the device's before
 * any choice); the radio is invisible and covers its label, which paints the segment, so style probes read the label.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const STORAGE_KEY = 'timesheet.theme';
/** The computed `--bg` of the two themes (body background): #0e1217 and #edf0f5 (round 3, WP5-UX3-T01; was #12161c and #f6f7f9). */
const BG = { dark: 'rgb(14, 18, 23)', light: 'rgb(237, 240, 245)' } as const;

type Theme = 'light' | 'dark';

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

/** Stores a theme before the app's first script runs, once per tab (a reload keeps what the person pressed). */
async function seedStoredTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript({
    content: `try { if (!sessionStorage.getItem('e2e-theme-seeded')) { localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(theme)}); sessionStorage.setItem('e2e-theme-seeded', '1'); } } catch (error) {}`,
  });
}

const THEMES: readonly Theme[] = ['light', 'dark'];
const OPTION_NAME: Record<Theme, string> = { light: 'Light', dark: 'Dark' };
const MIN_TEXT = 4.5;
const MIN_NON_TEXT = 3;

interface ThemeControl {
  /** The account menu (desktop) or the More panel (phone) that holds the control. */
  panel: Locator;
  group: Locator;
  /** The native radio of each option (invisible, covers its segment). */
  radio: Record<Theme, Locator>;
  /** The label that paints each segment: background, border, text colour and focus ring are read from it. */
  segment: Record<Theme, Locator>;
}

/** The theme control of this viewport: the account menu's on a desktop, the More panel's on a phone (opened if closed). */
async function themeControl(page: Page): Promise<ThemeControl> {
  const panel = await openAccount(page);
  const group = panel.getByRole('radiogroup', { name: 'Theme', exact: true });
  await expect(group).toBeVisible();
  const radio = {
    light: group.getByRole('radio', { name: OPTION_NAME.light, exact: true }),
    dark: group.getByRole('radio', { name: OPTION_NAME.dark, exact: true }),
  };
  await expect(radio.light).toBeVisible();
  await expect(radio.dark).toBeVisible();
  return { panel, group, radio, segment: { light: radio.light.locator('xpath=..'), dark: radio.dark.locator('xpath=..') } };
}

/** Exactly the radio of `theme` is checked. */
async function expectChecked(control: ThemeControl, theme: Theme): Promise<void> {
  for (const option of THEMES) await expect(control.radio[option], `${OPTION_NAME[option]} is ${option === theme ? '' : 'not '}checked`).toBeChecked({ checked: option === theme });
}

/**
 * Runs a settled measurement of `contrast.ts` again, at most twice more, when its own 7 s poll timed out. Each settled read waits 400 ms
 * inside that poll, so a stall of the host for about 20 s (the regate saw one freeze two browsers at once) expired the poll whatever the
 * product did. The measurement and the assertions on its result are unchanged; a state that never settles still fails after the three
 * tries, and any other error is thrown at once (WP5-UX3-FIX3 item 12, R8).
 */
async function surviveStall<T>(measure: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await measure();
    } catch (error) {
      const timedOut = error instanceof Error && /Timeout \d+ms exceeded|is settled/.test(error.message);
      if (!timedOut || attempt === 3) throw error;
    }
  }
}

/** Whether the device can hover (the hover look exists only there). */
async function canHover(page: Page): Promise<boolean> {
  return page.evaluate<boolean>("window.matchMedia('(hover: hover)').matches");
}

interface ThemeState {
  attribute: string | null;
  bodyBackground: string;
  token: string;
  stored: string | null;
}

async function themeState(page: Page): Promise<ThemeState> {
  return page.evaluate<ThemeState>(`({
    attribute: document.documentElement.getAttribute('data-theme'),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    token: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
    stored: (() => { try { return localStorage.getItem(${JSON.stringify(STORAGE_KEY)}); } catch (error) { return 'blocked'; } })(),
  })`);
}

/** Waits for the page to show `theme`: the attribute is the explicit choice, the background is what is painted. */
async function expectPainted(page: Page, theme: Theme, explicit: boolean): Promise<void> {
  await expect.poll(async () => (await themeState(page)).bodyBackground, { message: `the page is painted ${theme}` }).toBe(BG[theme]);
  const state = await themeState(page);
  expect(state.attribute, 'data-theme').toBe(explicit ? theme : null);
}

/* ---- The control: group, names, icons ------------------------------------------------------------------ */

test('the theme control is a "Theme" radio group of two native radios, Light and Dark, with aria-hidden icons', async ({ page, signInThroughUi }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  const control = await themeControl(page);
  // One visible group named "Theme" (the other placement is not displayed at this width); no "Dark mode" button.
  await expect(page.getByRole('radiogroup')).toHaveCount(1);
  await expect(control.group.getByRole('radio')).toHaveCount(2);
  await expect(control.group.getByRole('radio')).toHaveText(['', '']);
  await expect(page.getByRole('button', { name: /dark mode/i })).toHaveCount(0);
  for (const theme of THEMES) {
    // Native radios in one group: a real <input type="radio"> sharing a name, valued with the stored value.
    await expect(control.radio[theme]).toHaveAttribute('type', 'radio');
    await expect(control.radio[theme]).toHaveAttribute('name', /^theme-/);
    await expect(control.radio[theme]).toHaveAttribute('value', theme);
    // The accessible name is the visible text; the icon is decoration.
    await expect(control.segment[theme]).toHaveText(OPTION_NAME[theme]);
    const icon = control.segment[theme].locator('svg');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
    expect(await icon.textContent(), 'the icon carries no text').toBe('');
    const box = await icon.boundingBox();
    expect(box?.width ?? 0).toBeCloseTo(16, 0);
    expect(box?.height ?? 0).toBeCloseTo(16, 0);
  }
  // The sun and the moon are different drawings.
  const sun = await control.segment.light.locator('svg').innerHTML();
  const moon = await control.segment.dark.locator('svg').innerHTML();
  expect(sun).toContain('<circle');
  expect(moon).not.toContain('<circle');
  expect(sun).not.toBe(moon);
});

/* ---- Default: the device decides until the first choice ------------------------------------------------ */

for (const media of ['light', 'dark'] as const) {
  test(`without a stored choice the app follows the device (${media}) and the control shows it`, async ({ page, signInThroughUi }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await signInThroughUi();
    const control = await themeControl(page);
    await expectPainted(page, media, false);
    await expectChecked(control, media);
    expect((await themeState(page)).stored).toBeNull();

    // The device changing its mind is followed live while nothing is stored.
    const other = media === 'dark' ? 'light' : 'dark';
    await page.emulateMedia({ colorScheme: other, reducedMotion: 'reduce' });
    await expectPainted(page, other, false);
    await expectChecked(control, other);
  });

  test(`choosing the other option switches the theme, stores it and survives a reload (${media} device)`, async ({
    page,
    signInThroughUi,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await signInThroughUi();
    const control = await themeControl(page);
    const opposite: Theme = media === 'dark' ? 'light' : 'dark';

    await control.radio[opposite].click();
    await expectPainted(page, opposite, true);
    await expectChecked(control, opposite);
    await page.screenshot({ path: screenshotPath(`t01-theme-${opposite}-${testInfo.project.name}-synthetic.png`), animations: 'disabled' });
    const chosen = await themeState(page);
    expect(chosen.stored).toBe(opposite);
    expect(chosen.token).toBe(opposite === 'dark' ? '#0e1217' : '#edf0f5');

    // The choice persists after a reload (still signed in: the session cookie).
    await page.reload();
    const again = await themeControl(page);
    await expectPainted(page, opposite, true);
    await expectChecked(again, opposite);

    // Choosing the device's theme again stores it, now as an explicit choice.
    await again.radio[media].click();
    await expectPainted(page, media, true);
    await expectChecked(again, media);
    expect((await themeState(page)).stored).toBe(media);
  });
}

/* ---- A stored choice beats the device, in all four combinations ---------------------------------------- */

for (const media of ['light', 'dark'] as const) {
  for (const stored of ['light', 'dark'] as const) {
    test(`a stored ${stored} choice wins on a ${media} device, also on the sign-in page`, async ({ page, signInThroughUi }) => {
      await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
      await seedStoredTheme(page, stored);
      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expectPainted(page, stored, true);

      await signInThroughUi();
      const control = await themeControl(page);
      await expectPainted(page, stored, true);
      await expectChecked(control, stored);
    });
  }
}

/* ---- Before the first paint, without loosening the content security policy ---------------------------- */

const RECORD_AT_DOM_READY = `document.addEventListener('DOMContentLoaded', () => {
  window.__themeAtDomReady = {
    attribute: document.documentElement.getAttribute('data-theme'),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  };
});`;

async function recordedAtDomReady(page: Page): Promise<{ attribute: string | null; bodyBackground: string }> {
  return page.evaluate<{ attribute: string | null; bodyBackground: string }>('window.__themeAtDomReady');
}

for (const [media, stored] of [
  ['light', 'dark'],
  ['dark', 'light'],
] as const) {
  test(`the stored ${stored} theme is applied before first paint on a ${media} device, and only the head script does it`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await seedStoredTheme(page, stored);
    await page.addInitScript({ content: RECORD_AT_DOM_READY });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    // The sign-in page has no theme control, so nothing but the head script can have set the attribute by DOMContentLoaded.
    expect(await recordedAtDomReady(page)).toEqual({ attribute: stored, bodyBackground: BG[stored] });
  });

  test(`negative control: without /theme-init.js the same page is not themed at DOMContentLoaded (${media} device)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await page.route('**/theme-init.js', (route) => route.abort());
    await seedStoredTheme(page, stored);
    await page.addInitScript({ content: RECORD_AT_DOM_READY });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    expect(await recordedAtDomReady(page)).toEqual({ attribute: null, bodyBackground: BG[media] });
  });
}

test('the theme script is a same-origin file: no violation, JavaScript content type, CSP unchanged', async ({ page, signInThroughUi }) => {
  await page.addInitScript({
    content: `window.__cspViolations = []; document.addEventListener('securitypolicyviolation', (event) => window.__cspViolations.push(event.violatedDirective + ' ' + event.blockedURI));`,
  });
  const response = await page.goto('/');
  const policy = response?.headers()['content-security-policy'] ?? '';
  expect(policy, 'the page is served with a content security policy').not.toBe('');
  const directives = new Map(
    policy.split(';').map((part) => {
      const [name = '', ...values] = part.trim().split(/\s+/);
      return [name, values.join(' ')] as const;
    }),
  );
  expect(directives.get('script-src')).toBe("'self'");
  expect(directives.get('style-src')).toBe("'self'");
  expect(directives.get('default-src')).toBe("'self'");
  expect(policy).not.toContain('unsafe-inline');
  expect(policy).not.toContain('unsafe-eval');

  const script = await page.request.get('/theme-init.js');
  expect(script.status()).toBe(200);
  expect(script.headers()['content-type'] ?? '').toMatch(/javascript/);
  expect(await script.text()).toContain(STORAGE_KEY);
  console.log(`theme-init.js headers: content-type=${script.headers()['content-type'] ?? ''} cache-control=${script.headers()['cache-control'] ?? '(none)'} all=${Object.keys(script.headers()).sort().join(',')}`);

  // One blocking classic script in the head; no inline script anywhere.
  const tag = page.locator('head > script[src="/theme-init.js"]');
  await expect(tag).toHaveCount(1);
  expect(await tag.evaluate((element) => [element.hasAttribute('async'), element.hasAttribute('defer'), element.getAttribute('type')])).toEqual([false, false, null]);
  await expect(page.locator('script:not([src])')).toHaveCount(0);

  // Using the control (setting the attribute, storing the choice) triggers no violation.
  await signInThroughUi();
  const control = await themeControl(page);
  await control.radio.dark.check();
  await expectChecked(control, 'dark');
  await expectPainted(page, 'dark', true);
  expect(await page.evaluate('window.__cspViolations')).toEqual([]);
});

/* ---- Hover cannot erase the checked look (the specificity defect of the generic quiet-button hover) ------ */

test('the pointer on the checked segment keeps it checked: a solid accent fill with on-accent text', async ({ page, signInThroughUi }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  const control = await themeControl(page);
  await control.radio.dark.click();
  await expectChecked(control, 'dark');
  const segment = control.segment.dark;
  // The pointer is still on the segment after the click: this is the moment the old toggles lost their state.
  await segment.hover();
  const checkedAndHovered = { background: await settledStyle(segment, 'backgroundColor'), text: await settledStyle(segment, 'color') };
  // Hover rules exist only where the device can hover (WP5-UX2-T02); a touch device keeps the checked rest look.
  if (await canHover(page)) {
    // Dark tokens: --accent-strong #8dbbff under the pointer, --on-accent #0b1220 text.
    expect(checkedAndHovered).toEqual({ background: 'rgb(141, 187, 255)', text: 'rgb(11, 18, 32)' });
  } else {
    // No hover on this device: --accent #6ea8ff, never the stronger hover accent, and the segment stays checked.
    expect(checkedAndHovered).toEqual({ background: 'rgb(110, 168, 255)', text: 'rgb(11, 18, 32)' });
    await expect(control.radio.dark).toBeChecked();
  }
  await page.mouse.move(0, 0);
  // Pointer away: --accent #6ea8ff.
  expect(await settledStyle(segment, 'backgroundColor')).toBe('rgb(110, 168, 255)');
  expect(await textContrast(segment)).toBeGreaterThanOrEqual(MIN_TEXT);
});

/* ---- Blocked storage, and other tabs ------------------------------------------------------------------ */

test('blocked storage does not break the control: the choice lasts for the page', async ({ page, signInThroughUi }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.addInitScript({
    content: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });`,
  });
  await signInThroughUi();
  const control = await themeControl(page);
  await expectPainted(page, 'light', false);
  await expectChecked(control, 'light');

  await control.radio.dark.click();
  await expectPainted(page, 'dark', true);
  await expectChecked(control, 'dark');
  expect((await themeState(page)).stored).toBe('blocked');

  await control.radio.light.click();
  await expectPainted(page, 'light', true);
  await expectChecked(control, 'light');
});

test('a storage event keeps a second tab in step', async ({ page, signInThroughUi }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  const control = await themeControl(page);

  const second = await page.context().newPage();
  second.on('pageerror', (error) => {
    throw error;
  });
  await second.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await second.goto('/#/timesheet');
  const secondControl = await themeControl(second);
  await expectPainted(second, 'light', false);
  await expectChecked(secondControl, 'light');

  await control.radio.dark.click();
  await expectPainted(page, 'dark', true);
  await expectPainted(second, 'dark', true);
  await expectChecked(secondControl, 'dark');

  await secondControl.radio.light.click();
  await expectPainted(page, 'light', true);
  await expectChecked(control, 'light');
  await second.close();
});

/* ---- Keyboard and contrast, light, dark and the manual override both ways ---------------------------- */

const CASES: ReadonlyArray<{ name: string; media: Theme; stored: Theme | null }> = [
  { name: 'light device, no choice', media: 'light', stored: null },
  { name: 'dark device, no choice', media: 'dark', stored: null },
  { name: 'light device, manual dark', media: 'light', stored: 'dark' },
  { name: 'dark device, manual light', media: 'dark', stored: 'light' },
];

for (const { name, media, stored } of CASES) {
  test(`keyboard: Tab reaches the group once, the arrow keys switch the theme, Space chooses a focused radio (${name})`, async ({
    page,
    signInThroughUi,
    isMobile,
  }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    if (stored !== null) await seedStoredTheme(page, stored);
    await signInThroughUi();
    const control = await themeControl(page);
    const effective: Theme = stored ?? media;
    const other: Theme = effective === 'dark' ? 'light' : 'dark';
    await expectPainted(page, effective, stored !== null);
    await expectChecked(control, effective);

    // Tab reaches the group at its checked radio (one tab stop), and the next Tab leaves it for Sign out.
    const before = control.panel.getByRole('link').last();
    await before.focus();
    await page.keyboard.press('Tab');
    await expect(control.radio[effective], 'Tab lands on the checked radio').toBeFocused();
    await page.keyboard.press('Tab');
    await expect(control.panel.getByRole('button', { name: 'Sign out', exact: true }), 'the group is one tab stop').toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(control.radio[effective], 'Shift+Tab returns to the checked radio').toBeFocused();

    // An arrow key moves the choice to the other radio (the group of two wraps) and switches the theme at once.
    await page.keyboard.press('ArrowRight');
    await expect(control.radio[other]).toBeFocused();
    await expectChecked(control, other);
    await expectPainted(page, other, true);
    expect((await themeState(page)).stored).toBe(other);
    await page.keyboard.press('ArrowLeft');
    await expect(control.radio[effective]).toBeFocused();
    await expectChecked(control, effective);
    await expectPainted(page, effective, true);
    expect((await themeState(page)).stored).toBe(effective);

    // Space on a focused, unchecked radio chooses it; Enter does not (as in any native radio group).
    await control.radio[other].focus();
    await page.keyboard.press('Space');
    await expectChecked(control, other);
    await expectPainted(page, other, true);
    await control.radio[effective].focus();
    await page.keyboard.press('Enter');
    await expectChecked(control, other);
    await expectPainted(page, other, true);
    console.log(`theme control keyboard ${name} ${isMobile ? 'mobile' : 'desktop'}: Tab, Shift+Tab, arrows and Space verified`);
  });

  test(`contrast of the checked and the unchecked segment: rest, hover and focus (${name})`, async ({ page, signInThroughUi, isMobile }) => {
    // About 32 (phone) to 44 (desktop) settled reads of 400 ms each already take 15 to 25 s of the default 30 s, so a host stall of about
    // 20 s (seen once in the regate) failed the test whatever the product did. An explicit budget; no wait or assertion is changed.
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    if (stored !== null) await seedStoredTheme(page, stored);
    await signInThroughUi();
    const control = await themeControl(page);
    const effective: Theme = stored ?? media;
    const other: Theme = effective === 'dark' ? 'light' : 'dark';
    await expectPainted(page, effective, stored !== null);
    const hover = await canHover(page);

    /** The segment's indicator against the surface behind it: its fill when checked, else its boundary. */
    const indicator = async (segment: Locator, checked: boolean): Promise<number> =>
      surviveStall(async () => {
        const backdrop = backdropOf(await backdropsAbove(segment));
        const colour = checked ? await flattenedBackground(segment) : over(parseColour(await settledStyle(segment, 'borderTopColor')), backdrop);
        return contrast(colour, backdrop);
      });

    const measured: string[] = [];
    // Two states: the one in effect now, then (after choosing the other) the opposite one.
    for (const turn of [0, 1]) {
      const checkedTheme = turn === 0 ? effective : other;
      await expectChecked(control, checkedTheme);
      for (const theme of THEMES) {
        const segment = control.segment[theme];
        const checked = theme === checkedTheme;
        const label = `${checked ? 'checked' : 'unchecked'} ${OPTION_NAME[theme]}`;
        await page.mouse.move(0, 0);

        const restText = await surviveStall(() => textContrast(segment));
        const restIndicator = await indicator(segment, checked);
        expect(restText, `${label}: text at rest`).toBeGreaterThanOrEqual(MIN_TEXT);
        expect(restIndicator, `${label}: boundary or fill at rest`).toBeGreaterThanOrEqual(MIN_NON_TEXT);

        let hovered = 'no hover on this device';
        if (hover) {
          await segment.hover();
          const hoverText = await surviveStall(() => textContrast(segment));
          const hoverIndicator = await indicator(segment, checked);
          expect(hoverText, `${label}: text hovered`).toBeGreaterThanOrEqual(MIN_TEXT);
          expect(hoverIndicator, `${label}: boundary or fill hovered`).toBeGreaterThanOrEqual(MIN_NON_TEXT);
          hovered = `text ${hoverText.toFixed(2)} boundary ${hoverIndicator.toFixed(2)}`;
          await page.mouse.move(0, 0);
        }

        await surviveStall(() => focusFromKeyboard(control.radio[theme], segment));
        const ring = await surviveStall(() => measureFocusRing(segment));
        expect(ring.ringAgainstBackdrop, `${label}: focus ring against the surface (${ring.layers})`).toBeGreaterThanOrEqual(MIN_NON_TEXT);
        expect(ring.ringAgainstGap, `${label}: focus ring against its gap (${ring.layers})`).toBeGreaterThanOrEqual(MIN_NON_TEXT);
        if (checked) expect(ring.gapAgainstFill ?? 0, `${label}: focus gap against the accent fill (${ring.layers})`).toBeGreaterThanOrEqual(MIN_NON_TEXT);
        const focusText = await surviveStall(() => textContrast(segment));
        expect(focusText, `${label}: text focused`).toBeGreaterThanOrEqual(MIN_TEXT);
        await control.radio[theme].evaluate((element) => element.blur());
        measured.push(
          `${label}: rest text ${restText.toFixed(2)} boundary ${restIndicator.toFixed(2)}; hover ${hovered}; focus ring ${ring.ringAgainstBackdrop.toFixed(2)} gap ${ring.gapAgainstFill?.toFixed(2) ?? 'n/a'} text ${focusText.toFixed(2)}`,
        );
      }
      if (turn === 0) {
        await control.radio[other].check();
        await expectPainted(page, other, true);
      }
    }
    console.log(`theme control contrast ${name} ${isMobile ? 'mobile' : 'desktop'}:\n  ${measured.join('\n  ')}`);
  });
}

/* ---- Screenshots for the record: the control in the bar and in the More panel, light and dark ------------ */

test('screenshots: the theme control in the bar or the More panel, light and dark, an unchecked segment hovered and focused', async ({
  page,
  signInThroughUi,
  isMobile,
}, testInfo) => {
  await signInThroughUi();
  for (const media of THEMES) {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    const control = await themeControl(page);
    await expectPainted(page, media, false);
    await page.mouse.move(0, 0);
    // The surface that holds the control: the account menu on a desktop, the More panel on a phone.
    await control.panel.screenshot({ path: screenshotPath(`t07-${isMobile ? 'more' : 'menu'}-${media}-${testInfo.project.name}-synthetic.png`), animations: 'disabled' });
    if (isMobile) continue;
    const unchecked: Theme = media === 'light' ? 'dark' : 'light';
    const segment = control.segment[unchecked];
    /** The group with room around it for the focus ring. */
    const closeUp = async (state: string): Promise<void> => {
      const box = await control.group.boundingBox();
      expect(box).not.toBeNull();
      await page.screenshot({
        path: screenshotPath(`t07-segment-${state}-${media}-${testInfo.project.name}-synthetic.png`),
        animations: 'disabled',
        clip: { x: (box?.x ?? 0) - 8, y: (box?.y ?? 0) - 8, width: (box?.width ?? 0) + 16, height: (box?.height ?? 0) + 16 },
      });
    };
    await segment.hover();
    await settledStyle(segment, 'backgroundColor');
    await closeUp('hover');
    await page.mouse.move(0, 0);
    await focusFromKeyboard(control.radio[unchecked], segment);
    await closeUp('focus');
    await control.radio[unchecked].evaluate((element) => element.blur());
  }
});

/* ---- Phone: the control in the More panel costs the first screen nothing, and the panel fits ------------- */

test.describe('phone: first screen budget and the More panel with the theme control', () => {
  // Both projects run these at the phone's size (the layout follows the width), so none is skipped.
  /** The first day row against the tab bar, and the compact bar, measured; the theme control is not on the first screen. */
  async function expectBudget(page: Page, label: string, share: boolean): Promise<void> {
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const first = await page.locator('[data-day]').first().boundingBox();
    const tabs = await page.locator('.shell-tabs').boundingBox();
    const shellBar = await page.locator('.shell-bar').boundingBox();
    const rowBottom = (first?.y ?? 0) + (first?.height ?? 0);
    expect(rowBottom, `${label}: bottom of the first day row is at or above the tab bar`).toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
    // WP5-UX2-T09: the phone bar holds Check in/out. Without a share it is one row of a 44px target (60px with the bar padding);
    // with a share the switcher wraps to a second 44px row (112px). Either way the measured --shell-bar-size equals the rendered bar (AX-01).
    expect(shellBar?.height ?? 0, share ? `${label}: the clock row plus the switcher row` : `${label}: the compact shell bar is one row`).toBeLessThanOrEqual(
      share ? 112.5 : 60,
    );
    const measured = await page.evaluate<number>("parseFloat(document.documentElement.style.getPropertyValue('--shell-bar-size'))");
    expect(measured, `${label}: --shell-bar-size equals the rendered bar`).toBeCloseTo(shellBar?.height ?? 0, 1);
    expect(await page.evaluate('window.scrollY')).toBe(0);
    await expect(page.locator('.shell-bar .theme-switch').filter({ visible: true })).toHaveCount(0);
    console.log(`first screen 390x844 ${label}: first day row bottom ${rowBottom} of tab bar top ${tabs?.y}, shell bar ${shellBar?.height}px`);
  }

  for (const [zoneState, zone] of [
    ['with the zone note', 'Asia/Ho_Chi_Minh'],
    ['without the zone note', 'America/Los_Angeles'],
  ] as const) {
    test.describe(zoneState, () => {
      test.use({ timezoneId: zone });

      test('no received share', async ({ page, signInThroughUi }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await signInThroughUi();
        await expect(page.locator('[data-zone-note]')).toHaveCount(zone === 'Asia/Ho_Chi_Minh' ? 1 : 0);
        await expectBudget(page, `no share, ${zoneState}`, false);
      });

      test('a received share', async ({ page, adminSeed, builtServer, signInPageAs }) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: 390, height: 844 });
        const me =await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Grantee', signature: 'none' });
        const owner = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Owner', signature: 'none' });
        await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: { timesheets: 'view', ot_read: false, pdf_download: false } }, 201);
        await signInPageAs(me.account, '#/timesheet');
        await expect(page.getByRole('combobox', { name: 'Shared with me' })).toBeVisible();
        await expect(page.locator('[data-zone-note]')).toHaveCount(zone === 'Asia/Ho_Chi_Minh' ? 1 : 0);
        await expectBudget(page, `received share, ${zoneState}`, true);
      });
    });
  }

  for (const width of [390, 375, 360, 320]) {
    for (const role of ['employee', 'admin'] as const) {
      test(`the More panel with the theme control fits at ${width}px (${role}): 44px targets, inside the screen, no sideways scroll`, async ({
        page,
        builtServer,
        signInPageAs,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await signInPageAs(builtServer.credentials[role], '#/timesheet');
        const nav = page.getByRole('navigation', { name: 'Main' });
        await nav.getByRole('button', { name: 'More' }).click();
        const panel = page.locator('#more-panel');
        const group = panel.getByRole('radiogroup', { name: 'Theme', exact: true });
        await expect(group).toBeVisible();
        await expect(group.getByRole('radio')).toHaveCount(2);
        const panelBox = await panel.boundingBox();
        const viewport = await page.evaluate<{ client: number; scroll: number }>('({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })');
        expect(panelBox, 'More panel box').not.toBeNull();
        expect(panelBox?.x ?? -1, 'panel starts inside the screen').toBeGreaterThanOrEqual(0);
        expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0), 'panel ends inside the screen').toBeLessThanOrEqual(viewport.client + 0.5);
        expect(panelBox?.y ?? -1, 'panel top is on the screen').toBeGreaterThanOrEqual(0);
        expect(viewport.scroll, 'no horizontal scroll (scrollWidth against clientWidth)').toBeLessThanOrEqual(viewport.client);
        const heights: number[] = [];
        // Links, buttons, and both the radios (the real targets) and their segments, inside the panel.
        for (const target of await panel.locator('a, button, label.theme-option, input[type="radio"]').all()) {
          const box = await target.boundingBox();
          const name = (await target.textContent())?.trim() || (await target.getAttribute('value')) || '';
          expect(box?.height ?? 0, `${name} height`).toBeGreaterThanOrEqual(44);
          expect(box?.width ?? 0, `${name} width`).toBeGreaterThanOrEqual(44);
          heights.push(Math.round(box?.height ?? 0));
        }
        const groupBox = await group.boundingBox();
        expect((groupBox?.x ?? -1) + (groupBox?.width ?? 0), 'the theme control ends inside the panel').toBeLessThanOrEqual((panelBox?.x ?? 0) + (panelBox?.width ?? 0) + 0.5);
        expect(groupBox?.x ?? -1, 'the theme control starts inside the panel').toBeGreaterThanOrEqual(panelBox?.x ?? 0);
        console.log(`More panel ${role} ${width}px: x ${panelBox?.x} y ${panelBox?.y} w ${panelBox?.width} h ${panelBox?.height}, theme control w ${groupBox?.width} h ${groupBox?.height}, targets ${heights.join('/')}, clientWidth ${viewport.client} scrollWidth ${viewport.scroll}`);
      });
    }
  }
});
