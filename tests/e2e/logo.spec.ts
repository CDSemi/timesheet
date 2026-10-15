import type { Page } from '@playwright/test';
import { expect, screenshotPath, test } from './fixtures.ts';

/*
 * WP5-UX2-T05: the brand of the shell bar is the traced C&D logo (a 36px image, decorative), named once by
 * a visually hidden text, and the same file is the favicon. Both viewports, light and dark, with the
 * device's theme and with the manual choice both ways. Nothing here depends on the date or the time of day.
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
  await expect(brand.locator('.sr-only')).toHaveText(BRAND_NAME);
  expect(await page.getByRole('img', { name: /C&D|Semi/ }).count()).toBe(0);
  // The brand is not a link and adds no tab stop.
  await expect(brand.locator('a, button')).toHaveCount(0);
}

test('the shell brand is the logo image with one hidden name, and the favicon is the same file', async ({ page, signInThroughUi }, testInfo) => {
  await recordViolations(page);
  await signInThroughUi();
  await expectLogo(page);

  // The logo does not change the bar: 56px on a desktop, the 52px compact bar on a phone.
  const barHeight = (await page.locator('header.shell-bar').boundingBox())?.height ?? 0;
  console.log(`shell bar height ${testInfo.project.name}: ${barHeight}px`);
  expect(barHeight).toBe(testInfo.project.name === 'mobile' ? 52 : 56);

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
  test(`the logo keeps its size, name and file in ${scenario.name}`, async ({ page, signInThroughUi }, testInfo) => {
    await page.emulateMedia({ colorScheme: scenario.media, reducedMotion: 'reduce' });
    if (scenario.stored !== null) await seedStoredTheme(page, scenario.stored);
    await recordViolations(page);
    await signInThroughUi();
    await expectLogo(page);
    const painted = scenario.stored ?? scenario.media;
    await expect(page.locator('body')).toHaveCSS('background-color', painted === 'dark' ? 'rgb(18, 22, 28)' : 'rgb(246, 247, 249)');
    expect(await violations(page), 'no Content-Security-Policy violation').toEqual([]);
    if (scenario.stored !== null || scenario.name === 'dark device') {
      await page.locator('header.shell-bar').screenshot({ path: screenshotPath(`logo-bar-${scenario.name.replaceAll(' ', '-')}-${testInfo.project.name}-synthetic.png`) });
    }
  });
}
