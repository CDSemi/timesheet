import type { Locator, Page } from '@playwright/test';
import { focusFromKeyboard, measureFocusRing, settledStyle, textContrast } from './contrast.ts';
import { expect, newPerson, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T01: the Dark mode toggle of the main navigation. Two states, the device's theme until the
 * first press, a per-device choice kept in local storage (`timesheet.theme`), applied before the first
 * paint by a same-origin script (the content security policy forbids inline scripts). Desktop: the
 * toggle is in the top bar; phone: in the More panel. Nothing here depends on the date or the time of day.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const STORAGE_KEY = 'timesheet.theme';
/** The computed `--bg` of the two themes (body background): #12161c and #f6f7f9. */
const BG = { dark: 'rgb(18, 22, 28)', light: 'rgb(246, 247, 249)' } as const;

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

/** The toggle of this viewport: the top bar's on a desktop, the More panel's on a phone (opened if closed). */
async function themeToggle(page: Page, isMobile: boolean): Promise<Locator> {
  if (isMobile) {
    const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
    await expect(more).toBeVisible();
    if ((await more.getAttribute('aria-expanded')) !== 'true') await more.click();
  }
  const toggle = page.getByRole('button', { name: 'Dark mode', exact: true });
  await expect(toggle).toBeVisible();
  return toggle;
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

/* ---- Default: the device decides until the first press ---------------------------------------------- */

for (const media of ['light', 'dark'] as const) {
  test(`without a stored choice the app follows the device (${media}) and the toggle shows it`, async ({ page, signInThroughUi, isMobile }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await signInThroughUi();
    const toggle = await themeToggle(page, isMobile);
    await expectPainted(page, media, false);
    await expect(toggle).toHaveAttribute('aria-pressed', String(media === 'dark'));
    expect((await themeState(page)).stored).toBeNull();

    // The device changing its mind is followed live while nothing is stored.
    const other = media === 'dark' ? 'light' : 'dark';
    await page.emulateMedia({ colorScheme: other, reducedMotion: 'reduce' });
    await expectPainted(page, other, false);
    await expect(toggle).toHaveAttribute('aria-pressed', String(other === 'dark'));
  });

  test(`the toggle switches the theme, stores the opposite of the effective one and survives a reload (${media} device)`, async ({
    page,
    signInThroughUi,
    isMobile,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    await signInThroughUi();
    const toggle = await themeToggle(page, isMobile);
    const opposite: Theme = media === 'dark' ? 'light' : 'dark';

    await toggle.click();
    await expectPainted(page, opposite, true);
    await expect(toggle).toHaveAttribute('aria-pressed', String(opposite === 'dark'));
    await page.screenshot({ path: screenshotPath(`t01-theme-${opposite}-${testInfo.project.name}-synthetic.png`), animations: 'disabled' });
    const pressed = await themeState(page);
    expect(pressed.stored).toBe(opposite);
    expect(pressed.token).toBe(opposite === 'dark' ? '#12161c' : '#f6f7f9');

    // The choice persists after a reload (still signed in: the session cookie).
    await page.reload();
    const again = await themeToggle(page, isMobile);
    await expectPainted(page, opposite, true);
    await expect(again).toHaveAttribute('aria-pressed', String(opposite === 'dark'));

    // A second press goes back to the device's theme, now as an explicit choice.
    await again.click();
    await expectPainted(page, media, true);
    await expect(again).toHaveAttribute('aria-pressed', String(media === 'dark'));
    expect((await themeState(page)).stored).toBe(media);
  });
}

/* ---- A stored choice beats the device, in all four combinations ---------------------------------------- */

for (const media of ['light', 'dark'] as const) {
  for (const stored of ['light', 'dark'] as const) {
    test(`a stored ${stored} choice wins on a ${media} device, also on the sign-in page`, async ({ page, signInThroughUi, isMobile }) => {
      await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
      await seedStoredTheme(page, stored);
      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expectPainted(page, stored, true);

      await signInThroughUi();
      const toggle = await themeToggle(page, isMobile);
      await expectPainted(page, stored, true);
      await expect(toggle).toHaveAttribute('aria-pressed', String(stored === 'dark'));
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
    // The sign-in page has no toggle, so nothing but the head script can have set the attribute by DOMContentLoaded.
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

test('the theme script is a same-origin file: no violation, JavaScript content type, CSP unchanged', async ({ page, signInThroughUi, isMobile }) => {
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

  // Using the toggle (setting the attribute, storing the choice) triggers no violation.
  await signInThroughUi();
  const toggle = await themeToggle(page, isMobile);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', /true|false/);
  expect(await page.evaluate('window.__cspViolations')).toEqual([]);
});

/* ---- Hover cannot erase the pressed look (the specificity defect of the generic quiet-button hover) ---- */

test('the pointer on the pressed toggle keeps it pressed: a solid accent fill with on-accent text', async ({ page, signInThroughUi, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  const toggle = await themeToggle(page, isMobile);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  // The pointer is still on the button after the click: this is the moment the old toggles lost their state.
  await toggle.hover();
  const pressedAndHovered = { background: await settledStyle(toggle, 'backgroundColor'), text: await settledStyle(toggle, 'color') };
  // Dark tokens: --accent-strong #8dbbff under the pointer, --on-accent #0b1220 text.
  expect(pressedAndHovered).toEqual({ background: 'rgb(141, 187, 255)', text: 'rgb(11, 18, 32)' });
  await page.mouse.move(0, 0);
  // Pointer away: --accent #6ea8ff.
  expect(await settledStyle(toggle, 'backgroundColor')).toBe('rgb(110, 168, 255)');
  expect(await textContrast(toggle)).toBeGreaterThanOrEqual(4.5);
});

/* ---- Blocked storage, and other tabs ------------------------------------------------------------------ */

test('blocked storage does not break the toggle: the choice lasts for the page', async ({ page, signInThroughUi, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.addInitScript({
    content: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });`,
  });
  await signInThroughUi();
  const toggle = await themeToggle(page, isMobile);
  await expectPainted(page, 'light', false);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expectPainted(page, 'dark', true);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect((await themeState(page)).stored).toBe('blocked');

  await toggle.click();
  await expectPainted(page, 'light', true);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('a storage event keeps a second tab in step', async ({ page, signInThroughUi, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await signInThroughUi();
  const toggle = await themeToggle(page, isMobile);

  const second = await page.context().newPage();
  second.on('pageerror', (error) => {
    throw error;
  });
  await second.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await second.goto('/#/timesheet');
  const secondToggle = await themeToggle(second, isMobile);
  await expectPainted(second, 'light', false);
  await expect(secondToggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expectPainted(page, 'dark', true);
  await expectPainted(second, 'dark', true);
  await expect(secondToggle).toHaveAttribute('aria-pressed', 'true');

  await secondToggle.click();
  await expectPainted(page, 'light', true);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
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
  test(`keyboard and contrast of the toggle, pressed and not pressed (${name})`, async ({ page, signInThroughUi, isMobile }) => {
    await page.emulateMedia({ colorScheme: media, reducedMotion: 'reduce' });
    if (stored !== null) await seedStoredTheme(page, stored);
    await signInThroughUi();
    const toggle = await themeToggle(page, isMobile);
    const effective: Theme = stored ?? media;
    await expectPainted(page, effective, stored !== null);

    const measured: string[] = [];
    // Two states: the one in effect now, then (after Enter) the opposite one.
    for (const turn of [0, 1]) {
      const pressed = (effective === 'dark') !== (turn === 1);
      await expect(toggle).toHaveAttribute('aria-pressed', String(pressed));
      await focusFromKeyboard(toggle);
      const ring = await measureFocusRing(toggle);
      expect(ring.ringAgainstBackdrop, `focus ring against the surface (${ring.layers})`).toBeGreaterThanOrEqual(3);
      expect(ring.ringAgainstGap, `focus ring against its gap (${ring.layers})`).toBeGreaterThanOrEqual(3);
      if (pressed) expect(ring.gapAgainstFill, `focus gap against the pressed fill (${ring.layers})`).toBeGreaterThanOrEqual(3);
      const text = await textContrast(toggle);
      expect(text, `text of the ${pressed ? 'pressed' : 'unpressed'} toggle`).toBeGreaterThanOrEqual(4.5);
      measured.push(`${pressed ? 'pressed' : 'unpressed'} ring ${ring.ringAgainstBackdrop.toFixed(2)} gap ${ring.gapAgainstFill?.toFixed(2) ?? 'n/a'} text ${text.toFixed(2)}`);
      if (turn === 0) {
        // Enter toggles (the keyboard path); the second turn measures the opposite state.
        await page.keyboard.press('Enter');
        await expectPainted(page, effective === 'dark' ? 'light' : 'dark', true);
      }
    }
    // Space toggles back.
    await focusFromKeyboard(toggle);
    await page.keyboard.press('Space');
    await expectPainted(page, effective, true);
    console.log(`theme toggle contrast ${name} ${isMobile ? 'mobile' : 'desktop'}: ${measured.join('; ')}`);
  });
}

/* ---- Phone: the toggle in the More panel costs the first screen nothing, and the panel fits ------------- */

test.describe('phone: first screen budget and the More panel with the toggle', () => {
  // Both projects run these at the phone's size (the layout follows the width), so none is skipped.
  /** The first day row against the tab bar, and the compact bar, measured; the toggle is not on the first screen. */
  async function expectBudget(page: Page, label: string): Promise<void> {
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const first = await page.locator('[data-day]').first().boundingBox();
    const tabs = await page.locator('.shell-tabs').boundingBox();
    const shellBar = await page.locator('.shell-bar').boundingBox();
    const rowBottom = (first?.y ?? 0) + (first?.height ?? 0);
    expect(rowBottom, `${label}: bottom of the first day row is at or above the tab bar`).toBeLessThanOrEqual((tabs?.y ?? 0) + 0.5);
    expect(shellBar?.height ?? 0, `${label}: the compact shell bar is one row`).toBeLessThanOrEqual(60);
    expect(await page.evaluate('window.scrollY')).toBe(0);
    await expect(page.locator('.shell-bar').getByRole('button', { name: 'Dark mode' })).toHaveCount(0);
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
        await expectBudget(page, `no share, ${zoneState}`);
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
        await expectBudget(page, `received share, ${zoneState}`);
      });
    });
  }

  for (const width of [390, 375, 360, 320]) {
    for (const role of ['employee', 'admin'] as const) {
      test(`the More panel with the toggle fits at ${width}px (${role}): 44px targets, inside the screen, no sideways scroll`, async ({
        page,
        builtServer,
        signInPageAs,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await signInPageAs(builtServer.credentials[role], '#/timesheet');
        const nav = page.getByRole('navigation', { name: 'Main' });
        await nav.getByRole('button', { name: 'More' }).click();
        const panel = page.locator('#more-panel');
        await expect(panel.getByRole('button', { name: 'Dark mode', exact: true })).toBeVisible();
        const panelBox = await panel.boundingBox();
        const viewport = await page.evaluate<{ client: number; scroll: number }>('({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })');
        expect(panelBox, 'More panel box').not.toBeNull();
        expect(panelBox?.x ?? -1, 'panel starts inside the screen').toBeGreaterThanOrEqual(0);
        expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0), 'panel ends inside the screen').toBeLessThanOrEqual(viewport.client + 0.5);
        expect(panelBox?.y ?? -1, 'panel top is on the screen').toBeGreaterThanOrEqual(0);
        expect(viewport.scroll, 'no horizontal scroll (scrollWidth against clientWidth)').toBeLessThanOrEqual(viewport.client);
        const heights: number[] = [];
        for (const target of await panel.locator('a, button').all()) {
          const box = await target.boundingBox();
          const name = (await target.textContent())?.trim() ?? '';
          expect(box?.height ?? 0, `${name} height`).toBeGreaterThanOrEqual(44);
          expect(box?.width ?? 0, `${name} width`).toBeGreaterThanOrEqual(44);
          heights.push(Math.round(box?.height ?? 0));
        }
        console.log(`More panel ${role} ${width}px: x ${panelBox?.x} y ${panelBox?.y} w ${panelBox?.width} h ${panelBox?.height}, targets ${heights.join('/')}, clientWidth ${viewport.client} scrollWidth ${viewport.scroll}`);
      });
    }
  }
});
