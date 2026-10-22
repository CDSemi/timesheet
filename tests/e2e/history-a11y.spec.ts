import { focusFromKeyboard, parseLayers, settledStyle, tokenColour } from './contrast.ts';
import { expect, newPerson, test } from './fixtures.ts';

/*
 * WP5-UX5-FIX1 (round-5 gate, finding 3; WCAG 2.1.1 Keyboard, axe `scrollable-region-focusable`): the tables of the recorded
 * changes on History are wider than their box (a created session lists its whole JSON), so the box scrolls sideways. A scrolling
 * box with nothing focusable inside has no keyboard stop. While a `.table-wrap` overflows it is a named region with a tab stop
 * (`TableWrap`); while it fits it is a plain box. Synthetic account and days, both projects (1280px and 390px windows).
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

interface WrapFacts {
  overflows: boolean;
  role: string | null;
  tabindex: string | null;
  label: string | null;
}

test('every overflowing table box on History is a named region with a keyboard stop, and a box that fits is a plain box', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(120_000);
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Table Region', signature: 'none' });
  const free = await person.api.displayedPeriodFreeWorkdays();
  expect(free.length, 'two free workdays to record sessions on').toBeGreaterThanOrEqual(2);
  for (const day of free.slice(0, 2)) await person.api.seedCompleteDay(day);
  await signInPageAs(person.account, '#/history');
  await expect(page.locator('[data-operation]').first()).toBeVisible();

  const boxes = page.locator('.table-wrap');
  await expect(boxes.first()).toBeVisible();
  const facts = async (): Promise<WrapFacts[]> =>
    boxes.evaluateAll((elements) =>
      elements.map((element) => ({
        overflows: element.scrollWidth > element.clientWidth,
        role: element.getAttribute('role'),
        tabindex: element.getAttribute('tabindex'),
        label: element.getAttribute('aria-label'),
      })),
    );
  // The boxes settle after the first paint (the overflow is measured when the page lays out): wait for the region count to match.
  await expect
    .poll(async () => {
      const read = await facts();
      return read.filter((box) => box.overflows).length > 0 && read.every((box) => (box.overflows ? box.role === 'region' : box.role === null));
    }, { message: 'every overflowing box becomes a region' })
    .toBe(true);

  const read = await facts();
  const overflowing = read.filter((box) => box.overflows);
  expect(overflowing.length, 'the premise: a created session lists values wider than the box, so at least one box scrolls sideways').toBeGreaterThanOrEqual(1);
  for (const box of overflowing) {
    expect(box.role, 'an overflowing box is a region').toBe('region');
    expect(box.tabindex, 'and has a keyboard stop').toBe('0');
    expect(box.label, 'and is named for what it lists').toMatch(/^Changes for .+/);
  }
  for (const box of read.filter((candidate) => !candidate.overflows)) {
    expect([box.role, box.tabindex, box.label], 'a box that fits is a plain box (no extra tab stop or landmark)').toEqual([null, null, null]);
  }
  await expect(page.getByRole('region', { name: /^Changes for / }), 'the regions are in the accessibility tree by name').toHaveCount(overflowing.length);

  // Reachable and usable with the keyboard: it takes focus, the arrow keys scroll it, and the shared accent ring shows (light and dark).
  const region = page.getByRole('region', { name: /^Changes for / }).first();
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await focusFromKeyboard(region);
    const layers = parseLayers(await settledStyle(region, 'boxShadow'));
    const accent = await tokenColour(page, '--accent');
    expect(layers.some((layer) => layer.inset && layer.colour.slice(0, 3).join() === accent.slice(0, 3).join()), `${scheme}: the focus ring is the shared inset accent ring`).toBe(true);
  }
  const before = await region.evaluate((element) => element.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((element) => element.scrollLeft), { message: 'ArrowRight scrolls the focused region sideways' }).toBeGreaterThan(before);
});
