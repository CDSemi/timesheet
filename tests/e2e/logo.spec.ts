import type { BrowserContext, Page } from '@playwright/test';
import { contrast, flattenedBackground, parseColour, type Rgba } from './contrast.ts';
import { expect, expectSheetAt, newPerson, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T05: the brand of the shell bar is the traced C&D logo (a 36px image, decorative), named once by
 * a visually hidden text, and the same file is the favicon. Both viewports, light and dark, with the
 * device's theme and with the manual choice both ways. Nothing here depends on the date or the time of day.
 *
 * WP5-UX2-T06 adds the two-line wordmark (inline SVG outlines, decorative), its theme colours and the space between
 * the brand and the menu (--shell-brand-gap). WP5-UX3-T02 (owner decision U-06) changes the rule: the wordmark shows
 * from 1024px and is hidden below 1280px while the "Shared with me" switcher is in the bar, because the navigation
 * has only three entries and the person sits in one identity button truncated at 14rem; the bar stays one row.
 *
 * WP5-UX5-T04 (U5-02) changes it again: the wordmark shows whenever it fits (bar container queries, documented literals in styles.css), on
 * the phone bar too: from 414px with the check in/out group, from 852px on the desktop bar without a share, from 1280px with one. The
 * sweeps at the end of this file check every width from 320 to 1440px in both themes.
 */
const DEVICE = { locale: 'en-US', timezoneId: 'America/Los_Angeles' } as const;
test.use(DEVICE);

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
  /** The identity button of the user group (WP5-UX3-T02): its box, the text block's width and whether the name is cut by an ellipsis. */
  identity: { left: number; right: number; top: number; bottom: number; width: number; height: number; textWidth: number; nameClipped: boolean } | null;
  /** The unused room of the bar's flexible middle (the menu cell less its links), in px: how much wider the user group could grow. */
  slack: number;
  /** The brand-to-menu gap token as the bar resolves it (it is 24px, and 32px where the wordmark shows). */
  brandGap: number;
  /** The widths of the bar's parts in px, for the log (brand, menu, switcher, user group). */
  parts: string;
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
        identity: (() => {
          const control = bar.querySelector('button.identity');
          if (control === null || control.getClientRects().length === 0) return null;
          const box = rect(control);
          const text = rect(control.querySelector('.identity-text'));
          const clipped = (selector) => { const element = control.querySelector(selector); return element.scrollWidth > element.clientWidth; };
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height, textWidth: text.width, nameClipped: clipped('.identity-name') };
        })(),
        // WP5-UX5-T04: the wordmark rule sets the gap on the menu (the bar is the size container, so it cannot style itself).
        brandGap: parseFloat(getComputedStyle(bar.querySelector('.shell-nav')).getPropertyValue('--shell-brand-gap')),
        parts: ['.shell-brand', '.shell-nav', '.shell-switcher', '.shell-user'].map((selector) => { const element = bar.querySelector(selector); return selector + ' ' + (element === null ? '-' : Math.round(rect(element).width)); }).join(', '),
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

/**
 * The bar at one viewport width, as the wordmark rule of WP5-UX3-T02 (U-06) defines it: one row of at most 64px (56px
 * here: the 38px identity button fits the 40px of content), no horizontal overflow, the identity button inside the bar.
 * With the wordmark: logo, wordmark a token's distance on, the menu 32px (--shell-brand-gap) further right. Without it:
 * the logo only and the 24px gap.
 */
async function expectBar(page: Page, label: string, wordmark: boolean): Promise<BarFacts> {
  const facts = await barFacts(page);
  console.log(`bar parts at ${label}: ${facts.parts}; bar ${facts.bar.height}px`);
  expect(facts.bar.height, `${label}: the bar stays one row (at most 64px)`).toBeLessThanOrEqual(64);
  expect(facts.bar.height, `${label}: the bar is one 56px row`).toBeCloseTo(56, 0);
  expect(facts.scrollWidth, `${label}: no horizontal overflow`).toBeLessThanOrEqual(facts.innerWidth);
  expect(facts.userRight, `${label}: the user group stays inside the viewport`).toBeLessThanOrEqual(facts.innerWidth);
  // The identity button is on the bar's one row (inside it, vertically) and ends inside the viewport.
  expect(facts.identity, `${label}: the identity button is in the bar`).not.toBeNull();
  expect(facts.identity?.top ?? 0, `${label}: the identity button starts inside the bar`).toBeGreaterThanOrEqual(facts.bar.top);
  expect(facts.identity?.bottom ?? Number.POSITIVE_INFINITY, `${label}: the identity button ends inside the bar`).toBeLessThanOrEqual(facts.bar.top + facts.bar.height);
  expect(facts.identity?.right ?? Number.POSITIVE_INFINITY, `${label}: the identity button ends inside the viewport`).toBeLessThanOrEqual(facts.innerWidth);
  expect(facts.logo.width).toBeCloseTo(36, 0);
  expect(facts.logo.height).toBeCloseTo(36, 0);
  const mark = facts.wordmark;
  expect(mark?.visible, `${label}: the wordmark is ${wordmark ? 'displayed' : 'hidden'}`).toBe(wordmark);
  if (wordmark) {
    expect(mark?.width ?? 0, `${label}: the wordmark is about 150px wide`).toBeGreaterThanOrEqual(148);
    expect(mark?.width ?? 0).toBeLessThanOrEqual(155);
    expect(mark?.height ?? 0, `${label}: two lines, about 28px high`).toBeGreaterThanOrEqual(26);
    expect(mark?.height ?? 0).toBeLessThanOrEqual(30);
    // Vertically centred in the bar, a token's distance from the logo, and the menu one brand gap further on.
    expect(Math.abs((mark?.centreY ?? 0) - (facts.bar.top + facts.bar.height / 2))).toBeLessThanOrEqual(1);
    expect((mark?.left ?? 0) - facts.logo.right, `${label}: logo to wordmark`).toBeCloseTo(await tokenPx(page, '--shell-brand-inner-gap'), 1);
    await expect(page.locator('header.shell-bar svg.wordmark path')).toHaveCount(2);
  } else {
    expect(mark?.width, `${label}: no wordmark box`).toBe(0);
    expect(facts.brandRight, `${label}: the brand is the logo only`).toBeCloseTo(facts.logo.right, 1);
  }
  expect(facts.brandGap, `${label}: the brand-to-menu token`).toBe(wordmark ? 32 : 24);
  expect(facts.navLeft - facts.brandRight, `${label}: brand to menu`).toBeCloseTo(facts.brandGap, 1);
  // The name is announced exactly once, by the visually hidden text.
  await expect(page.getByText(BRAND_NAME, { exact: true })).toHaveCount(1);
  expect(await page.getByRole('img', { name: /C&D|Semi/ }).count()).toBe(0);
  return facts;
}

/** A display name far longer than the identity button's 14rem: the name is cut by an ellipsis, never wrapped or overflowing. */
const LONG_NAME = 'Synthetic Reader With An Exceptionally Long Display Name';

test('the wordmark rule: from 852px of bar without a share (U5-02), hidden below 1280px while the Shared with me switcher is in the bar; one row, no overflow, a long name truncated', async ({ page, adminSeed, builtServer, signInPageAs, isMobile }) => {
  test.skip(isMobile, 'The wordmark is a desktop-width brand; the phone shows the logo only (next test)');
  test.setTimeout(120_000);
  const me = await newPerson(adminSeed, builtServer, { displayName: LONG_NAME, signature: 'none' });
  const owner = await newPerson(adminSeed, builtServer, { displayName: OWNER_NAME, signature: 'none' });
  await recordViolations(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await signInPageAs(me.account);
  await expect(page.locator('header.shell-bar')).toBeVisible();
  await expect(page.locator('header.shell-bar .shell-switcher')).toHaveCount(0);
  const identityMax = await tokenPx(page, '--identity-max');
  expect(identityMax, '--identity-max is 14rem of the 15px root').toBeCloseTo(210, 0);

  // Without a share the wordmark shows from 852px of bar (U5-02: it was 1024px; the bar needs 14rem of identity, the three links and the brand
  // with the 32px gap); below it (768, 851) the logo only with the 24px gap. The sweep tests below check every width.
  for (const width of [768, 851]) {
    await page.setViewportSize({ width, height: 800 });
    const facts = await barFacts(page);
    expect(facts.wordmark?.visible, `no wordmark at ${width}px`).toBe(false);
    expect(facts.scrollWidth, `no horizontal overflow at ${width}px`).toBeLessThanOrEqual(facts.innerWidth);
    expect(facts.brandGap, `the narrow-width gap at ${width}px`).toBe(24);
    expect(facts.navLeft - facts.brandRight, `brand to menu at ${width}px`).toBeCloseTo(24, 1);
  }
  for (const width of [852, 1023, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    const facts = await expectBar(page, `${width}px without a share`, true);
    // The long name and the long email are cut at --identity-max, never wider.
    expect(facts.identity?.textWidth ?? 0, `${width}px: the identity text is at most 14rem`).toBeLessThanOrEqual(identityMax + 0.5);
    expect(facts.identity?.nameClipped, `${width}px: the long name is cut by an ellipsis`).toBe(true);
    console.log(`bar ${width}px without a share: ${facts.bar.height}px high, wordmark ${facts.wordmark?.width}x${facts.wordmark?.height}, brand to menu ${facts.navLeft - facts.brandRight}px, identity ${facts.identity?.width}x${facts.identity?.height} (text ${facts.identity?.textWidth}), spare room ${facts.slack.toFixed(1)}px`);
    if (width === 1024 || width === 1440) await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`wordmark-bar-${width}-noshare-synthetic.png`) });
  }

  // With a share the switcher needs room: hidden from 1024 to 1279, shown from 1280.
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: SHARE_ITEMS }, 201);
  await page.reload();
  await expect(page.locator('header.shell-bar .shell-switcher')).toBeVisible();
  for (const [width, shown] of [
    [1024, false],
    [1150, false],
    [1279, false],
    [1280, true],
    [1440, true],
    [1920, true],
  ] as const) {
    await page.setViewportSize({ width, height: 800 });
    const facts = await expectBar(page, `${width}px with a share`, shown);
    expect(facts.identity?.textWidth ?? 0, `${width}px with a share: the identity text is at most 14rem`).toBeLessThanOrEqual(identityMax + 0.5);
    console.log(`bar ${width}px with a share: ${facts.bar.height}px high, wordmark ${shown ? `${facts.wordmark?.width}x${facts.wordmark?.height}` : 'hidden'}, brand to menu ${facts.navLeft - facts.brandRight}px, identity ${facts.identity?.width}x${facts.identity?.height}, user group right edge ${facts.userRight} of ${facts.innerWidth}`);
    if (width === 1279 || width === 1280) await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`wordmark-bar-${width}-share-synthetic.png`) });
  }
  expect(await violations(page), 'no Content-Security-Policy violation').toEqual([]);
});

test('at 390px the phone bar shows only the logo (the wordmark joins from 414px, see the sweeps) and no identity button', async ({ page, adminSeed, builtServer, signInPageAs }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The phone bar only; the desktop rule is the test above');
  const me = await newPerson(adminSeed, builtServer, { displayName: READER_NAME, signature: 'none' });
  await signInPageAs(me.account);
  await expect(page.locator('header.shell-bar')).toBeVisible();
  // 390px: the compact bar holds the logo (and the clock); the navigation and the account live in the bottom tab bar.
  const phone = await barFacts(page);
  expect(phone.wordmark?.visible, 'no wordmark on a phone').toBe(false);
  expect(phone.wordmark?.width).toBe(0);
  expect(phone.brandRight).toBeCloseTo(phone.logo.right, 1);
  expect(phone.scrollWidth).toBeLessThanOrEqual(phone.innerWidth);
  expect(phone.identity, 'no identity button or avatar in the phone bar').toBeNull();
  await expect(page.locator('header.shell-bar .avatar').filter({ visible: true })).toHaveCount(0);
  await expect(page.getByText(BRAND_NAME, { exact: true })).toHaveCount(1);
});

/* ---- WP5-UX5-T04 (U5-02): the wordmark shows whenever it fits ------------------------------------------------------------------ */

/** The bar as the browser laid it out in one state: the wordmark as it is, forced shown or forced hidden (see `sweepRow`). */
interface BarMeasure {
  visible: boolean;
  height: number;
  overflow: boolean;
  /** The right edge of the wordmark, or 0 when it is not displayed. */
  markRight: number;
  barRight: number;
  clockWidth: number | null;
  switcherWidth: number | null;
  brandRight: number;
  clockLeft: number | null;
  /** The free room in the menu cell of the desktop bar (its right edge less the last link's), or null on the phone bar. */
  navRoom: number | null;
  /** Boxes of the items that share the bar's row, left to right, for the overlap check: [name, left, right, top, bottom]. */
  items: Array<[string, number, number, number, number]>;
}

interface SweepRow {
  width: number;
  actual: BarMeasure;
  shown: BarMeasure;
  hidden: BarMeasure;
}

/**
 * One width of the bar in three states. A state is forced through the element's own style (the CSSOM; a `<style>` element is blocked
 * by the page's CSP): the wordmark `display: block` with the 32px brand gap that goes with it, or `display: none` with the 24px one.
 */
const SWEEP_ROW_SCRIPT = `(async () => {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const bar = document.querySelector('header.shell-bar');
  const mark = bar.querySelector('svg.wordmark');
  const nav = bar.querySelector('.shell-nav');
  const rect = (element) => element.getBoundingClientRect();
  const measure = (force) => {
    const markWas = mark.style.cssText;
    const navWas = nav.style.cssText;
    if (force !== null) {
      mark.style.setProperty('display', force ? 'block' : 'none', 'important');
      nav.style.setProperty('--shell-brand-gap', force ? '32px' : '24px');
    }
    const clock = bar.querySelector('.bar-clock');
    const switcher = bar.querySelector('.shell-switcher');
    const user = bar.querySelector('.shell-user');
    const desktop = getComputedStyle(nav).display !== 'none';
    const links = [...nav.querySelectorAll('a')];
    const lastLink = links[links.length - 1];
    const items = [];
    const add = (name, element) => {
      if (element === null || element === undefined || getComputedStyle(element).display === 'none') return;
      const box = rect(element);
      items.push([name, box.left, box.right, box.top, box.bottom]);
    };
    add('brand', bar.querySelector('.shell-brand'));
    add('clock', clock);
    if (desktop) add('menu', lastLink);
    add('switcher', switcher);
    add('user', user);
    const markBox = rect(mark);
    const result = {
      visible: getComputedStyle(mark).display !== 'none',
      height: rect(bar).height,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      markRight: markBox.width === 0 ? 0 : markBox.right,
      barRight: rect(bar).right - Number.parseFloat(getComputedStyle(bar).paddingRight),
      clockWidth: clock === null ? null : rect(clock).width,
      switcherWidth: switcher === null ? null : rect(switcher).width,
      brandRight: rect(bar.querySelector('.shell-brand')).right,
      clockLeft: clock === null ? null : rect(clock).left,
      navRoom: desktop && lastLink !== undefined ? rect(nav).right - rect(lastLink).right : null,
      items,
    };
    mark.style.cssText = markWas;
    nav.style.cssText = navWas;
    return result;
  };
  return { actual: measure(null), shown: measure(true), hidden: measure(false) };
})()`;

async function sweepRow(page: Page): Promise<Omit<SweepRow, 'width'>> {
  return page.evaluate<Omit<SweepRow, 'width'>>(SWEEP_ROW_SCRIPT);
}

/**
 * Whether the wordmark would fit at this width, from the browser's own layout with it forced shown against forced hidden: the bar keeps
 * its height (the wordmark adds no row), nothing overflows, the group beside it keeps the width it has without it, and 8px are left over
 * (beside the logo on the phone bar, where the switcher takes what is free, the switcher keeps 8px more than its 16rem basis; in the
 * menu cell of the desktop bar).
 */
function wordmarkFits(row: Omit<SweepRow, 'width'>, phone: boolean): boolean {
  const { shown, hidden } = row;
  if (shown.height !== hidden.height || shown.overflow) return false;
  if (shown.clockWidth !== null && hidden.clockWidth !== null && shown.clockWidth < hidden.clockWidth - 0.5) return false;
  let room: number;
  if (!phone) room = shown.navRoom ?? 0;
  else if (shown.switcherWidth !== null && hidden.height < 100) room = shown.switcherWidth - 240;
  else room = shown.clockLeft === null ? 100 : shown.clockLeft - shown.brandRight - 12;
  return room >= 8;
}

/** Items of one row of the bar must not overlap, and the wordmark must end inside the bar. */
function expectNoOverlap(width: number, state: BarMeasure): void {
  const items = [...state.items].sort((a, b) => a[1] - b[1]);
  for (const [index, item] of items.entries()) {
    const next = items[index + 1];
    if (next === undefined) continue;
    const sameRow = item[3] < next[4] - 1 && next[3] < item[4] - 1;
    if (sameRow) expect(item[2], `${width}px: ${item[0]} ends before ${next[0]} starts`).toBeLessThanOrEqual(next[1] + 0.5);
  }
  if (state.visible) expect(state.markRight, `${width}px: the wordmark ends inside the bar`).toBeLessThanOrEqual(state.barRight + 0.5);
  expect(state.overflow, `${width}px: nothing overflows the window`).toBe(false);
}

interface SweepOptions {
  /** True for the "Shared with me" bar of a desktop width: the bound is the fixed 1280px, not the measured room (the switcher's width depends on the owners' names). */
  fixedDesktopBound: boolean;
  /** The colour scheme of the person's screens: every extra window of the sweep emulates it with reduced motion. */
  scheme: 'light' | 'dark';
  /** Waits until the screen under test is ready in a window: the conditions the test awaited on its own page before the sweep. */
  ready: (view: Page) => Promise<void>;
}

/**
 * The windows that measure the sweep side by side: the test's own page and three more, each in a browser context of its own, each one a
 * quarter of the widths. Never as tabs of one context: with the host busy a second tab of a context gets a frame only now and then (the
 * rAF of every step then takes a second and more), where a context of its own keeps its frames.
 */
const SWEEP_WINDOWS = 4;
const SWEEP_FIRST = 320;
const SWEEP_LAST = 1440;

/** Another window for the sweep: a context of the test's browser, signed in as the test's page is, on the same screen, device and colour scheme. */
async function openSweepWindow(page: Page, options: SweepOptions): Promise<{ context: BrowserContext; view: Page }> {
  const browser = page.context().browser();
  if (browser === null) throw new Error('The sweep needs the browser of the test to open its other windows');
  const context = await browser.newContext({
    ...DEVICE,
    storageState: await page.context().storageState(),
    viewport: { width: 600, height: 800 },
    colorScheme: options.scheme,
    reducedMotion: 'reduce',
  });
  const view = await context.newPage();
  view.on('pageerror', (error) => {
    throw error;
  });
  await view.goto(page.url());
  await options.ready(view);
  return { context, view };
}

/** One window's share of the sweep: every width from `from` to `to`, in 1px steps. */
async function sweepRange(page: Page, from: number, to: number): Promise<SweepRow[]> {
  const rows: SweepRow[] = [];
  for (let width = from; width <= to; width += 1) {
    await page.setViewportSize({ width, height: 800 });
    // React swaps the week sheet one rendering update after the CSS follows the width: below 480px the 7-column grid (865px wide) would
    // still overflow the window in the row measured here.
    await expectSheetAt(page, width);
    rows.push({ width, ...(await sweepRow(page)) });
  }
  return rows;
}

/**
 * Sweeps the bar from 320 to 1440px in 1px steps and checks the rule of U5-02: the wordmark is displayed exactly when it fits with 8px
 * of slack (to the pixel of the literal thresholds), never overlaps or clips, and never adds a row. Returns the widths where it shows.
 * The 1,121 widths are split into SWEEP_WINDOWS runs of consecutive widths, measured at the same time in as many windows; every width is
 * measured by the same script in the same way, and the rows are put back in width order before any check.
 */
async function sweepWordmark(page: Page, options: SweepOptions): Promise<number[]> {
  const others: Array<{ context: BrowserContext; view: Page }> = [];
  let rows: SweepRow[];
  try {
    for (let index = 1; index < SWEEP_WINDOWS; index += 1) others.push(await openSweepWindow(page, options));
    const views = [page, ...others.map((other) => other.view)];
    const share = Math.ceil((SWEEP_LAST - SWEEP_FIRST + 1) / SWEEP_WINDOWS);
    const parts = await Promise.all(
      views.map((view, index) => sweepRange(view, SWEEP_FIRST + index * share, Math.min(SWEEP_LAST, SWEEP_FIRST + (index + 1) * share - 1))),
    );
    rows = parts.flat();
  } finally {
    for (const other of others) await other.context.close();
  }
  expect(
    rows.map((row) => row.width),
    'every width from 320 to 1440px was measured once, in order',
  ).toEqual(Array.from({ length: SWEEP_LAST - SWEEP_FIRST + 1 }, (_, index) => SWEEP_FIRST + index));
  const shows = rows.map((row) => row.actual.visible);
  const fits = rows.map((row) => (row.width >= 768 && options.fixedDesktopBound ? row.width >= 1280 : wordmarkFits(row, row.width < 768)));
  for (const [index, row] of rows.entries()) {
    expectNoOverlap(row.width, row.actual);
    if (row.actual.visible) expect(row.actual.height, `${row.width}px: the wordmark adds no row`).toBe(row.hidden.height);
    // The literal thresholds are accurate to a pixel: a mismatch is allowed only where the neighbouring width agrees.
    if (shows[index] !== fits[index]) {
      const neighbour = shows[index] === fits[index - 1] || shows[index] === fits[index + 1];
      expect(neighbour, `${row.width}px: the wordmark is ${shows[index] ? 'shown' : 'hidden'} but ${fits[index] ? 'fits' : 'does not fit'}`).toBe(true);
    }
  }
  return rows.filter((row) => row.actual.visible).map((row) => row.width);
}

for (const scheme of ['light', 'dark'] as const) {
  test(`the wordmark shows whenever it fits, 320 to 1440px in 1px steps, on the person's own screens (${scheme})`, async ({ page, adminSeed, builtServer, signInPageAs, isMobile }) => {
    test.skip(isMobile, 'The sweep resizes the window of the desktop project');
    test.setTimeout(240_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    const me = await newPerson(adminSeed, builtServer, { displayName: LONG_NAME, signature: 'none' });
    await page.setViewportSize({ width: 600, height: 800 });
    await signInPageAs(me.account);
    const ready = async (view: Page) => {
      await expect(view.locator('.bar-clock')).toBeVisible();
    };
    await ready(page);
    const shown = await sweepWordmark(page, { fixedDesktopBound: false, scheme, ready });
    // The documented literals: from 414px of bar with the check in/out group, from 852px without it on the desktop bar.
    const phone = shown.filter((width) => width < 768);
    const desktop = shown.filter((width) => width >= 768);
    expect(Math.min(...phone), 'the phone bar shows it from 414px').toBe(414);
    expect(Math.max(...phone), 'and up to 767px').toBe(767);
    expect(Math.min(...desktop), 'the desktop bar shows it from 852px').toBe(852);
    expect(Math.max(...desktop)).toBe(1440);
    expect(shown.length).toBe(phone.length + desktop.length);
  });

  test(`with a "Shared with me" switcher the wordmark never adds a row: hidden where it would push the switcher down, shown from 1280px on the desktop bar (${scheme})`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
    isMobile,
  }) => {
    test.skip(isMobile, 'The sweep resizes the window of the desktop project');
    test.setTimeout(240_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    const me = await newPerson(adminSeed, builtServer, { displayName: LONG_NAME, signature: 'none' });
    const owner = await newPerson(adminSeed, builtServer, { displayName: OWNER_NAME, signature: 'none' });
    await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: SHARE_ITEMS }, 201);
    await page.setViewportSize({ width: 600, height: 800 });
    await signInPageAs(me.account);
    const ready = async (view: Page) => {
      await expect(view.locator('.bar-clock')).toBeVisible();
      await expect(view.locator('header.shell-bar .shell-switcher')).toBeVisible();
    };
    await ready(page);
    const shown = await sweepWordmark(page, { fixedDesktopBound: true, scheme, ready });
    // Own view with the switcher: shown from 414px up to 494px (the switcher is on its own row anyway), hidden from 495 to 665px (it would
    // wrap the switcher), shown again from 666px; on the desktop bar from 1280px.
    const phone = shown.filter((width) => width < 768);
    expect(phone.filter((width) => width < 600).sort((a, b) => a - b), 'the narrow range of the phone bar').toEqual(Array.from({ length: 495 - 414 }, (_, index) => 414 + index));
    expect(Math.min(...phone.filter((width) => width >= 600)), 'shown again from 666px').toBe(666);
    expect(Math.min(...shown.filter((width) => width >= 768)), 'the desktop bar shows it from 1280px').toBe(1280);
  });

  // The shared view is a test of its own (it was the second sweep of the test above): each sweep has the whole timeout to itself.
  test(`in a shared view the wordmark never adds a row: shown from 492px, and from 1280px on the desktop bar (${scheme})`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
    isMobile,
  }) => {
    test.skip(isMobile, 'The sweep resizes the window of the desktop project');
    test.setTimeout(240_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    const me = await newPerson(adminSeed, builtServer, { displayName: LONG_NAME, signature: 'none' });
    const owner = await newPerson(adminSeed, builtServer, { displayName: OWNER_NAME, signature: 'none' });
    await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items: SHARE_ITEMS }, 201);
    await page.setViewportSize({ width: 600, height: 800 });
    await signInPageAs(me.account);
    await expect(page.locator('.bar-clock')).toBeVisible();
    await expect(page.locator('header.shell-bar .shell-switcher')).toBeVisible();
    // A shared view has no check in/out group: the brand and the switcher share the row, so the wordmark shows from 492px.
    await page.goto(`/#/shared/${owner.account.id}/timesheet`);
    const sharedReady = async (view: Page) => {
      await expect(view.locator('.share-bar')).toBeVisible();
      await expect(view.locator('.bar-clock')).toHaveCount(0);
    };
    await sharedReady(page);
    const sharedShown = await sweepWordmark(page, { fixedDesktopBound: true, scheme, ready: sharedReady });
    expect(Math.min(...sharedShown), 'a shared view shows the wordmark from 492px').toBe(492);
    expect(Math.min(...sharedShown.filter((width) => width >= 768)), 'and on the desktop bar from 1280px').toBe(1280);
  });
}
