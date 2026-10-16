import type { Page } from '@playwright/test';
import { contrast, flattenedBackground, parseColour, type Rgba } from './contrast.ts';
import { expect, newPerson, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T05: the brand of the shell bar is the traced C&D logo (a 36px image, decorative), named once by
 * a visually hidden text, and the same file is the favicon. Both viewports, light and dark, with the
 * device's theme and with the manual choice both ways. Nothing here depends on the date or the time of day.
 *
 * WP5-UX2-T06 adds the two-line wordmark (inline SVG outlines, decorative, from 1440px), its theme colours and
 * the space between the brand and the menu (--shell-brand-gap). The breakpoint is 1440px, not 1280px: with a
 * "Shared with me" switcher and a 20-character name the one-row bar needs 1408px once the wordmark is in.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const BRAND_NAME = 'C&D Semiconductor Services, Inc.';
const STORAGE_KEY = 'timesheet.theme';

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

/** Records every Content-Security-Policy violation of the page so a blocked logo or favicon is a failure. */
async function recordViolations(page: Page): Promise<void> {
  await page.addInitScript({
    content: `window.__cspViolations = []; document.addEventListener('securitypolicyviolation', (event) => window.__cspViolations.push(event.violatedDirective + ' ' + event.blockedURI));`,
  });
}

async function violations(page: Page): Promise<string[]> {
  return page.evaluate<string[]>('window.__cspViolations');
}

/** Stores a theme before the app's first script runs (once per tab). */
async function seedStoredTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript({
    content: `try { if (!sessionStorage.getItem('e2e-theme-seeded')) { localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(theme)}); sessionStorage.setItem('e2e-theme-seeded', '1'); } } catch (error) {}`,
  });
}

async function expectLogo(page: Page): Promise<void> {
  const brand = page.locator('header.shell-bar .shell-brand');
  const logo = brand.locator('img');
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('alt', '');
  await expect(logo).toHaveAttribute('src', '/cd-logo.svg');
  // The file decoded (a blocked or broken image has no natural size) and renders at 36px.
  await expect.poll(() => page.evaluate<number>(`(() => { const image = document.querySelector('header.shell-bar .shell-brand img'); return image !== null && image.complete ? image.naturalWidth : 0; })()`), { message: 'the logo decoded' }).toBeGreaterThan(0);
  const box = await logo.boundingBox();
  expect(box?.width ?? 0).toBeCloseTo(36, 0);
  expect(box?.height ?? 0).toBeCloseTo(36, 0);
  // Decorative image, one accessible name: the hidden text, announced once.
  await expect(brand.locator('img[alt=""]')).toHaveCount(1);
  // The wordmark graphic is in the page at every width, decorative, and carries no text of its own.
  const wordmark = brand.locator('svg.wordmark');
  await expect(wordmark).toHaveCount(1);
  await expect(wordmark).toHaveAttribute('aria-hidden', 'true');
  await expect(wordmark).toHaveAttribute('focusable', 'false');
  await expect(wordmark.locator('path')).toHaveCount(2);
  expect(await wordmark.textContent()).toBe('');
  await expect(brand.locator('.sr-only')).toHaveText(BRAND_NAME);
  expect(await page.getByRole('img', { name: /C&D|Semi/ }).count()).toBe(0);
  // The brand is not a link and adds no tab stop.
  await expect(brand.locator('a, button')).toHaveCount(0);
}

/** The painted fill of one wordmark line as an opaque colour. */
async function wordmarkFill(page: Page, line: 'main' | 'sub'): Promise<Rgba> {
  const text = await page.evaluate<string>(`getComputedStyle(document.querySelector('header.shell-bar svg.wordmark .wordmark-${line}')).fill`);
  return parseColour(text);
}

/**
 * Both wordmark lines against the bar: the owner's brand colours in the light theme (re-sampled from the image),
 * the lighter tints (the accent and the muted text colour) in the dark theme, and at least 4.5:1 on the bar either way.
 */
async function expectWordmarkColours(page: Page, painted: 'light' | 'dark'): Promise<void> {
  const expected: Record<'main' | 'sub', Rgba> =
    painted === 'dark' ? { main: [110, 168, 255, 1], sub: [154, 165, 180, 1] } : { main: [0, 110, 186, 1], sub: [76, 79, 87, 1] };
  for (const line of ['main', 'sub'] as const) {
    await expect.poll(async () => (await wordmarkFill(page, line)).join(','), { message: `${line} fill in the ${painted} theme` }).toBe(expected[line].join(','));
  }
  const bar = await flattenedBackground(page.locator('header.shell-bar'));
  for (const line of ['main', 'sub'] as const) {
    const ratio = contrast(await wordmarkFill(page, line), bar);
    console.log(`wordmark ${line} on the bar, ${painted}: ${ratio.toFixed(2)}:1`);
    expect(ratio, `${line} against the bar in the ${painted} theme`).toBeGreaterThanOrEqual(4.5);
  }
}

/** A token's length in px, read from a probe element so a `var()` chain resolves exactly as the page does. */
async function tokenPx(page: Page, token: string): Promise<number> {
  return page.evaluate<number>(
    `(() => { const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;width:var(${token})'; document.body.append(probe); const width = probe.getBoundingClientRect().width; probe.remove(); return width; })()`,
  );
}

interface BarFacts {
  bar: { height: number; top: number };
  scrollWidth: number;
  innerWidth: number;
  brandRight: number;
  logo: { left: number; right: number; width: number; height: number };
  wordmark: { left: number; width: number; height: number; centreY: number; visible: boolean } | null;
  navLeft: number;
  userRight: number;
  /** The Light/Dark theme control in the user group (WP5-UX2-T07). */
  theme: { left: number; right: number; top: number; bottom: number; width: number; height: number } | null;
  /** The unused room of the bar's flexible middle (the menu cell less its links), in px: how much wider the user group could grow. */
  slack: number;
}

/** The geometry of the shell bar as the browser laid it out (the bar, the brand, the wordmark, the menu). */
async function barFacts(page: Page): Promise<BarFacts> {
  return page.evaluate<BarFacts>(
    `(() => {
      const rect = (element) => element.getBoundingClientRect();
      const bar = document.querySelector('header.shell-bar');
      const brand = bar.querySelector('.shell-brand');
      const logo = rect(brand.querySelector('img'));
      const mark = brand.querySelector('svg.wordmark');
      const markBox = rect(mark);
      const visible = getComputedStyle(mark).display !== 'none';
      return {
        bar: { height: rect(bar).height, top: rect(bar).top },
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        brandRight: rect(brand).right,
        logo: { left: logo.left, right: logo.right, width: logo.width, height: logo.height },
        wordmark: { left: markBox.left, width: markBox.width, height: markBox.height, centreY: markBox.top + markBox.height / 2, visible },
        navLeft: rect(bar.querySelector('.shell-nav')).left,
        userRight: rect(bar.querySelector('.shell-user')).right,
        slack: (() => { const nav = bar.querySelector('.shell-nav'); const links = nav.querySelectorAll('a'); const last = links[links.length - 1]; return rect(nav).right - rect(last).right; })(),
        theme: (() => { const control = bar.querySelector('.theme-switch'); if (control === null) return null; const box = rect(control); return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height }; })(),
      };
    })()`,
  );
}

test('the shell brand is the logo image with one hidden name, and the favicon is the same file', async ({ page, signInThroughUi }, testInfo) => {
  await recordViolations(page);
  await signInThroughUi();
  await expectLogo(page);

  // The logo does not change the bar: 56px on a desktop. The phone bar is 60px (8 + 44 + 8): since WP5-UX2-T09 it holds the 44px Check in/out
  // target beside the logo, which is what sets its height (the 36px logo alone would keep the 52px compact bar).
  const barHeight = (await page.locator('header.shell-bar').boundingBox())?.height ?? 0;
  console.log(`shell bar height ${testInfo.project.name}: ${barHeight}px`);
  expect(barHeight).toBe(testInfo.project.name === 'mobile' ? 60 : 56);

  // The name appears exactly once in the shell bar and nowhere else as a standalone element on this route.
  await expect(page.locator('header.shell-bar').getByText(BRAND_NAME, { exact: true })).toHaveCount(1);
  await page.goto('/#/history');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'History' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText(BRAND_NAME, { exact: true })).toHaveCount(1);

  // The favicon link points at the same vector file.
  const icon = page.locator('head link[rel="icon"]');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');
  await expect(icon).toHaveAttribute('href', '/cd-logo.svg');

  // Served by the existing static path, as SVG.
  const response = await page.request.get('/cd-logo.svg');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] ?? '').toContain('image/svg+xml');
  const body = await response.text();
  expect(body).toContain('viewBox="0 0 512 512"');
  expect(Buffer.byteLength(body)).toBeLessThan(20 * 1024);

  expect(await violations(page), 'no Content-Security-Policy violation').toEqual([]);
  await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`logo-bar-${testInfo.project.name}-synthetic.png`) });
});

for (const scenario of [
  { name: 'light device', media: 'light', stored: null },
  { name: 'dark device', media: 'dark', stored: null },
  { name: 'manual dark on a light device', media: 'light', stored: 'dark' },
  { name: 'manual light on a dark device', media: 'dark', stored: 'light' },
] as const) {
  test(`the logo keeps its size, name and file, and the wordmark its colours, in ${scenario.name}`, async ({ page, signInThroughUi }, testInfo) => {
    await page.emulateMedia({ colorScheme: scenario.media, reducedMotion: 'reduce' });
    if (scenario.stored !== null) await seedStoredTheme(page, scenario.stored);
    await recordViolations(page);
    await signInThroughUi();
    await expectLogo(page);
    const painted = scenario.stored ?? scenario.media;
    await expect(page.locator('body')).toHaveCSS('background-color', painted === 'dark' ? 'rgb(14, 18, 23)' : 'rgb(237, 240, 245)');
    await expectWordmarkColours(page, painted);
    expect(await violations(page), 'no Content-Security-Policy violation').toEqual([]);
    if (scenario.stored !== null || scenario.name === 'dark device') {
      await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`logo-bar-${scenario.name.replaceAll(' ', '-')}-${testInfo.project.name}-synthetic.png`) });
    }
  });
}

const SHARE_ITEMS = { timesheets: 'view', ot_read: false, pdf_download: false };
/**
 * A 24-character display name for the reader (the user group is the widest part of the bar) and a short owner name:
 * the "Shared with me" switcher is as wide as its longest owner, and a long owner name wraps a bar of this width
 * whatever the brand looks like, which is not what these tests measure.
 */
const READER_NAME = 'Synthetic Tab Order User';
const OWNER_NAME = 'Synthetic Owner';

/** The one-row bar of 1440px and wider: logo, wordmark, the menu 32px further right, nothing wrapped or overflowing. */
async function expectWordmarkBar(page: Page): Promise<BarFacts> {
  const facts = await barFacts(page);
  expect(facts.bar.height, 'the bar stays one 56px row').toBeCloseTo(56, 0);
  expect(facts.scrollWidth, 'no horizontal overflow').toBeLessThanOrEqual(facts.innerWidth);
  expect(facts.userRight, 'the user group stays inside the viewport').toBeLessThanOrEqual(facts.innerWidth);
  // The Light/Dark control is on the bar's one row (inside it, vertically), 36px high like the buttons beside it.
  expect(facts.theme, 'the theme control is in the bar').not.toBeNull();
  expect(facts.theme?.top ?? 0, 'the theme control starts inside the bar').toBeGreaterThanOrEqual(facts.bar.top);
  expect(facts.theme?.bottom ?? Number.POSITIVE_INFINITY, 'the theme control ends inside the bar').toBeLessThanOrEqual(facts.bar.top + facts.bar.height);
  expect(facts.theme?.height ?? 0, 'the theme control is a 36px control').toBeCloseTo(36, 0);
  expect(facts.theme?.right ?? Number.POSITIVE_INFINITY, 'the theme control ends inside the viewport').toBeLessThanOrEqual(facts.innerWidth);
  expect(facts.logo.width).toBeCloseTo(36, 0);
  expect(facts.logo.height).toBeCloseTo(36, 0);
  const mark = facts.wordmark;
  expect(mark?.visible, 'the wordmark is displayed').toBe(true);
  expect(mark?.width ?? 0, 'the wordmark is about 150px wide').toBeGreaterThanOrEqual(148);
  expect(mark?.width ?? 0).toBeLessThanOrEqual(155);
  expect(mark?.height ?? 0, 'two lines, about 28px high').toBeGreaterThanOrEqual(26);
  expect(mark?.height ?? 0).toBeLessThanOrEqual(30);
  // Vertically centred in the bar, a token's distance from the logo, and the menu one brand gap further on.
  expect(Math.abs((mark?.centreY ?? 0) - (facts.bar.top + facts.bar.height / 2))).toBeLessThanOrEqual(1);
  expect((mark?.left ?? 0) - facts.logo.right).toBeCloseTo(await tokenPx(page, '--shell-brand-inner-gap'), 1);
  expect(facts.navLeft - facts.brandRight).toBeCloseTo(await tokenPx(page, '--shell-brand-gap'), 1);
  expect(await tokenPx(page, '--shell-brand-gap')).toBe(32);
  await expect(page.locator('header.shell-bar svg.wordmark path')).toHaveCount(2);
  // The name is announced exactly once, by the visually hidden text.
  await expect(page.getByText(BRAND_NAME, { exact: true })).toHaveCount(1);
  expect(await page.getByRole('img', { name: /C&D|Semi/ }).count()).toBe(0);
  return facts;
}

test('the wordmark shows from 1440px beside the logo in one 56px row, with and without a received share', async ({ page, adminSeed, builtServer, signInPageAs, isMobile }) => {
  test.skip(isMobile, 'The wordmark is a desktop-width brand; the phone and narrow widths show the logo only (next test)');
  const me = await newPerson(adminSeed, builtServer, { displayName: READER_NAME, signature: 'none' });
  const owner = await newPerson(adminSeed, builtServer, { displayName: OWNER_NAME, signature: 'none' });
  await recordViolations(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await signInPageAs(me.account);
  await expect(page.locator('header.shell-bar')).toBeVisible();
  await expect(page.locator('header.shell-bar .shell-switcher')).toHaveCount(0);
  const alone = await expectWordmarkBar(page);
  console.log(`wordmark 1440 without a share: bar ${alone.bar.height}px, wordmark ${alone.wordmark?.width}x${alone.wordmark?.height}, brand to menu ${alone.navLeft - alone.brandRight}px, theme control ${alone.theme?.width}x${alone.theme?.height}, spare room ${alone.slack.toFixed(1)}px`);
  await page.locator('header.shell-bar').screenshot({ path: screenshotPath('wordmark-bar-1440-noshare-synthetic.png') });

  // The longest names live in the user group: add a "Shared with me" switcher and the bar must still be one row.
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: SHARE_ITEMS }, 201);
  await page.reload();
  await expect(page.locator('header.shell-bar .shell-switcher')).toBeVisible();
  const shared = await expectWordmarkBar(page);
  console.log(`wordmark 1440 with a share: bar ${shared.bar.height}px, wordmark ${shared.wordmark?.width}x${shared.wordmark?.height}, brand to menu ${shared.navLeft - shared.brandRight}px`);
  await page.locator('header.shell-bar').screenshot({ path: screenshotPath('wordmark-bar-1440-share-synthetic.png') });
  console.log(`theme control 1440 with a share: ${shared.theme?.width}x${shared.theme?.height}, user group right edge ${shared.userRight} of ${shared.innerWidth}, spare room ${shared.slack.toFixed(1)}px`);

  // Wider than the breakpoint the bar stays one row too (1600, with the share).
  await page.setViewportSize({ width: 1600, height: 800 });
  const wide = await expectWordmarkBar(page);
  console.log(`wordmark 1600 with a share: bar ${wide.bar.height}px, theme control ${wide.theme?.width}x${wide.theme?.height}, user group right edge ${wide.userRight} of ${wide.innerWidth}, spare room ${wide.slack.toFixed(1)}px`);
  expect(await violations(page), 'no Content-Security-Policy violation').toEqual([]);
});

test('below 1440px and on a phone only the logo shows, and the brand-to-menu gap equals its token', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  const me = await newPerson(adminSeed, builtServer, { displayName: READER_NAME, signature: 'none' });
  const owner = await newPerson(adminSeed, builtServer, { displayName: OWNER_NAME, signature: 'none' });
  await signInPageAs(me.account);
  await expect(page.locator('header.shell-bar')).toBeVisible();

  if (testInfo.project.name === 'mobile') {
    // 390px: the compact bar holds the logo only; the navigation lives in the bottom tab bar.
    const phone = await barFacts(page);
    expect(phone.wordmark?.visible, 'no wordmark on a phone').toBe(false);
    expect(phone.wordmark?.width).toBe(0);
    expect(phone.brandRight).toBeCloseTo(phone.logo.right, 1);
    expect(phone.scrollWidth).toBeLessThanOrEqual(phone.innerWidth);
    await expect(page.getByText(BRAND_NAME, { exact: true })).toHaveCount(1);
    return;
  }

  // Desktop project: 1439, 1280, 1024 and 768 show the logo only, with the narrow-width gap (24px).
  for (const withShare of [false, true]) {
    if (withShare) {
      await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: SHARE_ITEMS }, 201);
      await page.reload();
      await expect(page.locator('header.shell-bar .shell-switcher')).toBeVisible();
    }
    for (const width of [1439, 1280, 1024, 768]) {
      await page.setViewportSize({ width, height: 800 });
      const facts = await barFacts(page);
      const label = `${width}px ${withShare ? 'with' : 'without'} a share`;
      expect(facts.wordmark?.visible, `no wordmark at ${label}`).toBe(false);
      expect(facts.wordmark?.width, `no wordmark box at ${label}`).toBe(0);
      expect(facts.brandRight, `the brand is the logo only at ${label}`).toBeCloseTo(facts.logo.right, 1);
      expect(facts.scrollWidth, `no horizontal overflow at ${label}`).toBeLessThanOrEqual(facts.innerWidth);
      expect(facts.navLeft - facts.brandRight, `brand to menu at ${label}`).toBeCloseTo(await tokenPx(page, '--shell-brand-gap'), 1);
      expect(await tokenPx(page, '--shell-brand-gap'), `the narrow-width gap at ${label}`).toBe(24);
      // One row where the bar had room before this slice: 1280 with and without a share, 1024 without one.
      if (width >= 1280 || (width === 1024 && !withShare)) expect(facts.bar.height, `one row at ${label}`).toBeCloseTo(56, 0);
      console.log(`bar ${label}: ${facts.bar.height}px high, brand to menu ${facts.navLeft - facts.brandRight}px, theme control ${facts.theme?.width}x${facts.theme?.height}, spare room ${facts.slack.toFixed(1)}px`);
      if (width === 1280 || width === 1024) {
        await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`bar-${width}-${withShare ? 'share' : 'noshare'}-synthetic.png`) });
      }
    }
  }
});
