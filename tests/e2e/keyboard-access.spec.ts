import type { Page } from '@playwright/test';
import { dayButton, dayButtonName } from './dayButton.ts';
import { type BuiltServer, expect, newPerson, type Person, type SeedClient, test } from './fixtures.ts';

/*
 * WP5-UX-FIX7: the WCAG 2.2 AA keyboard and screen-reader items of the accessibility sweep
 * (WP5-UX-A11Y-SWEEP, WP5-UX-AX-01 and AX-05 to AX-10; AX-02 to AX-04 are in focus-ring.spec.ts),
 * through the real UI of the BUILT server. Every test creates its own synthetic accounts over the
 * admin API (example.invalid); nothing is sent anywhere.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

const ME = 'Synthetic Keyboard User';
const OWNER = 'Synthetic Sharing Owner';

interface World {
  me: Person;
  owner: Person;
  /** A complete past day of `me` in the displayed period (a session with three confirmed breaks). */
  complete: string;
}

/** `me` with a complete day, and `owner` who shares timesheets (view only) with `me`; `mutual` adds the share back. */
async function newWorld(adminSeed: SeedClient, server: BuiltServer, options: { mutual?: boolean } = {}): Promise<World> {
  const me = await newPerson(adminSeed, server, { displayName: ME, signature: 'none' });
  const owner = await newPerson(adminSeed, server, { displayName: OWNER, signature: 'none' });
  const [complete = '', unconfirmed = ''] = await me.api.displayedPeriodFreeWorkdays();
  expect(complete, 'a past free workday in the displayed period').not.toBe('');
  await me.api.seedCompleteDay(complete);
  if (unconfirmed !== '') await me.api.seedUnconfirmedBreaksDay(unconfirmed);
  const [ownerDay = ''] = await owner.api.displayedPeriodFreeWorkdays();
  if (ownerDay !== '') await owner.api.seedCompleteDay(ownerDay);
  const items = { timesheets: 'view', ot_read: false, pdf_download: false };
  await owner.api.call('POST', '/api/shares', { grantee_email: me.account.email, items }, 201);
  if (options.mutual === true) await me.api.call('POST', '/api/shares', { grantee_email: owner.account.email, items }, 201);
  return { me, owner, complete };
}

/* ---- Colour maths (WCAG 2.x relative luminance) -------------------------------------------------- */

type Rgba = [number, number, number, number];

function parseColour(text: string): Rgba {
  const numbers = (/rgba?\(([^)]*)\)/.exec(text)?.[1] ?? '').split(/[\s,/]+/).filter((part) => part !== '').map(Number);
  const [r = 0, g = 0, b = 0, a = 1] = numbers;
  return [r, g, b, a];
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

/** Composites a list of CSS colours, nearest first, over white. */
function composite(nearestFirst: string[]): Rgba {
  return nearestFirst.reduceRight<Rgba>((below, css) => over(parseColour(css), below), [255, 255, 255, 1]);
}

/* ---- WP5-UX-AX-01: Shift+Tab never stops on a control hidden under sticky content (SC 2.4.11) ------- */

interface Stop {
  key: number;
  name: string;
  visible: number;
  covers: string[];
  inside: boolean;
}

/*
 * The page scripts below are plain JavaScript strings: the test project has no DOM library, as in
 * day-editor.spec.ts (focusHiddenByPanel).
 */

/** The focused element: a stable key, its name, and how many of 25 sample points show it on top (elementFromPoint). */
async function focusedStop(page: Page, scope: string): Promise<Stop | null> {
  return page.evaluate<Stop | null>(`(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || active === document.body) return null;
    window.walkKeys = window.walkKeys || new WeakMap();
    let key = window.walkKeys.get(active);
    if (key === undefined) {
      window.walkNext = (window.walkNext || 0) + 1;
      key = window.walkNext;
      window.walkKeys.set(active, key);
    }
    const labels = active.labels ? [...active.labels] : [];
    const rect = active.getBoundingClientRect();
    let visible = 0;
    const covers = new Set();
    for (let i = 0; i < 5; i += 1) {
      for (let j = 0; j < 5; j += 1) {
        const x = rect.left + 1 + ((rect.width - 2) * (i + 0.5)) / 5;
        const y = rect.top + 1 + ((rect.height - 2) * (j + 0.5)) / 5;
        if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) {
          covers.add('outside the viewport');
          continue;
        }
        const hit = document.elementFromPoint(x, y);
        if (hit !== null && (active.contains(hit) || labels.some((label) => label.contains(hit)))) visible += 1;
        else if (hit !== null) {
          const cover = hit.closest('.shell-bar, .shell-tabs, .share-bar, .editor-head, dialog') || hit;
          covers.add(cover.tagName.toLowerCase() + '.' + String(cover.className).split(' ')[0]);
        }
      }
    }
    const name = (active.getAttribute('aria-label') || active.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60);
    return { key, name: active.tagName.toLowerCase() + ' "' + name + '"', visible, covers: [...covers], inside: active.closest(${JSON.stringify(scope)}) !== null };
  })()`);
}

/** Focuses the last visible focusable control inside `scope` (the browser scrolls it into view). */
async function focusLast(page: Page, scope: string): Promise<void> {
  const found = await page.evaluate<boolean>(`(() => {
    const root = document.querySelector(${JSON.stringify(scope)});
    const candidates = root === null ? [] : [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
    const last = candidates.filter((element) => element.getClientRects().length > 0).at(-1);
    if (last === undefined) return false;
    last.focus();
    return document.activeElement === last;
  })()`);
  expect(found, `a focusable control in ${scope}`).toBe(true);
}

/**
 * Shift+Tab from the last control of `scope` until focus leaves it (or cycles): every stop must show at
 * least one of its 25 sample points (SC 2.4.11). Returns the hidden stops and the number of stops.
 */
async function walkBackward(page: Page, scope: string, label: string): Promise<{ stops: number; hidden: string[] }> {
  await focusLast(page, scope);
  const seen = new Set<number>();
  const hidden: string[] = [];
  let last: number | undefined;
  let repeats = 0;
  for (let index = 0; index < 160; index += 1) {
    const stop = await focusedStop(page, scope);
    if (stop === null || !stop.inside) break;
    // A date or time input keeps focus while Shift+Tab moves through its segments.
    if (stop.key === last && repeats < 6) {
      repeats += 1;
    } else {
      if (stop.key !== last && seen.has(stop.key)) break;
      repeats = 0;
      last = stop.key;
      seen.add(stop.key);
      if (stop.visible === 0) hidden.push(`${label}: ${stop.name} under ${stop.covers.join(', ')}`);
    }
    await page.keyboard.press('Shift+Tab');
  }
  return { stops: seen.size, hidden };
}

async function walkScreens(page: Page, world: World, signInPageAs: (credentials: { email: string; password: string }, startHash?: string) => Promise<void>, width: number) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signInPageAs(world.me.account, '#/timesheet');
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await expect(page.getByRole('button', { name: /^Clock (in|out)$/ })).toBeVisible();
  const results = [await walkBackward(page, 'body', `${width} Timesheet`)];

  await page.goto('/#/settings');
  await expect(page.locator('[data-settings="sharing"]')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Shares I received' })).toBeVisible();
  results.push(await walkBackward(page, 'body', `${width} Settings`));

  await page.goto(`/#/shared/${world.owner.account.id}`);
  await expect(page.locator('[data-share-bar]')).toBeVisible();
  await expect(page.locator('[data-day]')).toHaveCount(14);
  results.push(await walkBackward(page, 'body', `${width} shared view`));

  await page.goto('/#/timesheet');
  // A click on the day's time cell opens the editor (selected by data-day, not by any name).
  await page.locator(`[data-day="${world.complete}"] :is(.d-time, .t-time)`).click();
  const editor = page.locator(`dialog[data-day-editor="${world.complete}"]`);
  await expect(editor.getByRole('heading', { name: /^Times/ })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Save day fields' })).toBeVisible();
  results.push(await walkBackward(page, `dialog[data-day-editor="${world.complete}"]`, `${width} day editor`));

  const hidden = results.flatMap((result) => result.hidden);
  console.log(`AX-01 ${width}px: stops ${results.map((result) => result.stops).join('/')} (Timesheet/Settings/shared/editor), hidden ${hidden.length}`);
  expect(results.every((result) => result.stops > 5), 'each walk reached several stops').toBe(true);
  expect(hidden, 'stops entirely hidden by sticky or fixed content').toEqual([]);
}

test.describe('WP5-UX-AX-01 on the desktop project', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop widths');
  for (const size of [
    { width: 1280, height: 800 },
    { width: 768, height: 1024 },
  ]) {
    test(`Shift+Tab never stops on a hidden control at ${size.width}px: Timesheet, Settings, shared view, day editor`, async ({ page, adminSeed, builtServer, signInPageAs }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(size);
      await walkScreens(page, await newWorld(adminSeed, builtServer), signInPageAs, size.width);
    });
  }
});

test.describe('WP5-UX-AX-01 on the mobile project', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone widths');
  for (const size of [
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    test(`Shift+Tab never stops on a hidden control at ${size.width}px: Timesheet, Settings, shared view, day editor`, async ({ page, adminSeed, builtServer, signInPageAs }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(size);
      await walkScreens(page, await newWorld(adminSeed, builtServer), signInPageAs, size.width);
    });
  }
});

/* ---- WP5-UX-AX-05: label in name (SC 2.5.3) ------------------------------------------------------- */

test('WP5-UX-AX-05: each day button and "End share" carry their visible text in the accessible name', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(90_000);
  const world = await newWorld(adminSeed, builtServer);
  const check = async (verb: 'Edit' | 'View') => {
    const days = page.locator('[data-day]');
    await expect(days).toHaveCount(14);
    const dates = await days.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-day') ?? ''));
    for (const date of dates) {
      const button = dayButton(page, date);
      await expect(button).toHaveCount(1);
      const visible = (await button.innerText()).replace(/\s+/g, ' ').trim();
      await expect(button, `the day button of ${date}`).toHaveAccessibleName(`${verb} ${visible} (${date})`);
      await expect(button).toHaveAccessibleName(dayButtonName(verb, date));
    }
  };
  await signInPageAs(world.me.account, '#/timesheet');
  await check('Edit');
  await page.goto(`/#/shared/${world.owner.account.id}`);
  await expect(page.locator('[data-share-bar]')).toBeVisible();
  await check('View');

  // The owner's "End share" button: visible "End share", name "End share with {name}".
  const more = page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' });
  if (await more.isVisible()) await more.click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await signInPageAs(world.owner.account, '#/settings');
  const end = page.getByRole('list', { name: 'Shares I gave' }).getByRole('button', { name: `End share with ${ME}`, exact: true });
  await expect(end).toBeVisible();
  await expect(end).toHaveText('End share');
});

/* ---- WP5-UX-AX-06: choosing in "Shared with me" does not change the screen (SC 3.2.2) --------------- */

test('WP5-UX-AX-06: the "Shared with me" choice changes nothing until Open is pressed', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  const world = await newWorld(adminSeed, builtServer);
  const ownerId = world.owner.account.id;
  await signInPageAs(world.me.account, '#/timesheet');
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  const select = page.getByRole('combobox', { name: 'Shared with me' });
  const open = page.getByRole('form', { name: 'Shared with me' }).getByRole('button', { name: 'Open', exact: true });
  await select.focus();
  await page.keyboard.press('ArrowDown');
  await expect(select).toHaveValue(ownerId);
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
  await expect(page.locator('[data-share-bar]')).toHaveCount(0);

  // The explicit Open goes to the chosen person's shared items; the choice stays on that person.
  await page.keyboard.press('Tab');
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`#/shared/${ownerId}`));
  await expect(page.locator('[data-share-bar]')).toBeVisible();
  await expect(page.getByRole('heading', { name: `${OWNER}'s timesheet` })).toBeVisible();
  await expect(select).toHaveValue(ownerId);

  // "My timesheets" stays an entry: choosing it changes nothing, Open returns.
  await select.selectOption({ label: 'My timesheets' });
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(new RegExp(`#/shared/${ownerId}`));
  await open.click();
  await expect(page).toHaveURL(/#\/timesheet$/);
  await expect(page.getByRole('heading', { name: 'Timesheet', exact: true })).toBeVisible();
});

/* ---- WP5-UX-AX-07: status messages (SC 4.1.3) --------------------------------------------------- */

test('WP5-UX-AX-07: a failed sign-in is an alert and a share form problem is a status message', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(builtServer.credentials.employee.email);
  await page.getByLabel('Password').fill('wrong-synthetic-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect');

  const person = await newPerson(adminSeed, builtServer, { displayName: ME, signature: 'none' });
  await signInPageAs(person.account, '#/settings');
  const form = page.getByRole('form', { name: 'Share my timesheets' });
  await form.getByRole('radio', { name: 'None' }).check();
  await expect(form.getByRole('status')).toHaveText('Turn on at least one shared item.');
});

/* ---- WP5-UX-AX-08: focus order after a dialog or an inline step closes (SC 2.4.3) ----------------- */

test('WP5-UX-AX-08: the batch review returns focus to "Preview changes" and moves focus to each step heading', async ({ page, adminSeed, builtServer, signInPageAs }) => {
  test.setTimeout(90_000);
  const world = await newWorld(adminSeed, builtServer);
  await signInPageAs(world.me.account, '#/timesheet');
  await expect(page.locator('[data-day]')).toHaveCount(14);
  await page.getByRole('button', { name: 'Change several days' }).click();
  await page.getByRole('checkbox', { name: `Select ${world.complete}` }).check();
  await page.getByLabel('Category for selected days').selectOption('Off');
  const preview = page.getByRole('button', { name: 'Preview changes' });
  const dialog = page.getByRole('dialog');
  const openReview = async () => {
    await preview.focus();
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('heading', { name: 'Review category change' })).toBeVisible();
  };

  await openReview();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(preview, 'after Escape').toBeFocused();

  await openReview();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(preview, 'after Cancel').toBeFocused();

  await openReview();
  await dialog.getByRole('button', { name: 'Review conflicts' }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('heading', { name: 'Recorded work conflicts with the new label' }), 'the conflicts step heading').toBeFocused();
  await dialog.getByRole('button', { name: 'Back', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('heading', { name: 'Review category change' }), 'the review step heading').toBeFocused();
  await page.keyboard.press('Escape');
  await expect(preview, 'after Escape from the second visit').toBeFocused();

  // Nothing was saved: the day keeps its category and its session.
  const day = await world.me.api.dayView(world.complete);
  expect(day.category).toBe('Worked');
  expect(day.sessions).toHaveLength(1);
});

test('WP5-UX-AX-08: the sharing rows in Settings return focus to the button that opened a confirmation or a change', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}) => {
  test.setTimeout(90_000);
  const world = await newWorld(adminSeed, builtServer, { mutual: true });
  await signInPageAs(world.me.account, '#/settings');
  const given = page.getByRole('list', { name: 'Shares I gave' });
  const received = page.getByRole('list', { name: 'Shares I received' });
  const end = given.getByRole('button', { name: /^End shar(e|ing) with / });
  const change = given.getByRole('button', { name: /^Change items shared with / });
  const leave = received.getByRole('button', { name: /^Leave .*shared items$/ });
  const confirm = page.locator('[data-confirm="share"]');

  for (const [opener, how] of [
    [end, 'Escape'],
    [end, 'Cancel'],
    [leave, 'Escape'],
    [leave, 'Cancel'],
  ] as const) {
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(confirm).toBeFocused();
    if (how === 'Escape') await page.keyboard.press('Escape');
    else {
      await confirm.getByRole('button', { name: 'Cancel', exact: true }).focus();
      await page.keyboard.press('Enter');
    }
    await expect(confirm).toHaveCount(0);
    await expect(opener, `${how} returns focus`).toBeFocused();
  }

  await change.focus();
  await page.keyboard.press('Enter');
  await expect(given.getByRole('group', { name: /^Change items shared with / }), 'the change step takes focus').toBeFocused();
  await given.getByRole('button', { name: 'Cancel', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(change, 'Cancel returns focus').toBeFocused();

  // Nothing changed: both shares still exist.
  const shares = await world.me.api.call<{ given: unknown[]; received: unknown[] }>('GET', '/api/shares');
  expect([shares.given.length, shares.received.length]).toEqual([1, 1]);
});

/* ---- WP5-UX-AX-09: "Complete" text contrast on a selected row (SC 1.4.3) ------------------------- */

for (const colorScheme of ['light', 'dark'] as const) {
  test(`WP5-UX-AX-09: the "Complete" status text reaches 4.5:1 on a selected batch row and on every surface (${colorScheme})`, async ({
    page,
    adminSeed,
    builtServer,
    signInPageAs,
  }) => {
    const world = await newWorld(adminSeed, builtServer);
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await signInPageAs(world.me.account, '#/timesheet');
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByRole('checkbox', { name: `Select ${world.complete}` }).check();
    const status = page.locator(`[data-day="${world.complete}"] .status-complete`).first();
    await expect(status).toHaveText(/Complete/);
    const rendered = await status.evaluate((element) => {
      const view = element.ownerDocument.defaultView;
      const chain = [element];
      for (let node = element.parentElement; node; node = node.parentElement) chain.push(node);
      return { colour: view?.getComputedStyle(element).color ?? '', backdrops: chain.map((node) => view?.getComputedStyle(node).backgroundColor ?? '') };
    });
    const background = composite(rendered.backdrops);
    const ratio = contrast(over(parseColour(rendered.colour), background), background);
    expect(ratio, `"Complete" ${rendered.colour} on ${JSON.stringify(rendered.backdrops.slice(0, 4))}`).toBeGreaterThanOrEqual(4.5);

    // The status token against every surface it can be drawn on, a selected row included.
    const tokens = await page.locator('body').evaluate((body) => {
      const probe = body.ownerDocument.createElement('div');
      body.append(probe);
      const read = (value: string) => {
        probe.style.backgroundColor = value;
        const computed = body.ownerDocument.defaultView?.getComputedStyle(probe).backgroundColor ?? '';
        probe.style.backgroundColor = '';
        return computed;
      };
      const result = {
        ok: read('var(--ok)'),
        selected: read('var(--day-selected)'),
        surfaces: ['--card', '--bg', '--off', '--sheet-head', '--sheet-head-off', '--day-nonworking', '--attention-bg'].map((token) => ({ token, colour: read(`var(${token})`) })),
      };
      probe.remove();
      return result;
    });
    const ok = parseColour(tokens.ok);
    const ratios: Record<string, number> = {};
    for (const { token, colour } of tokens.surfaces) {
      for (const [name, stack] of [
        [token, [colour]],
        [`--day-selected over ${token}`, [tokens.selected, colour]],
      ] as const) {
        const surface = composite([...stack]);
        const value = contrast(over(ok, surface), surface);
        expect(value, `--ok ${tokens.ok} on ${name}`).toBeGreaterThanOrEqual(4.5);
        ratios[name] = Math.round(value * 100) / 100;
      }
    }
    console.log(`AX-09 ${colorScheme}: rendered ${ratio.toFixed(2)}; --ok ${JSON.stringify(ratios)}`);
  });
}

/* ---- WP5-UX-AX-10: the phone batch row reflows at 320px (SC 1.4.10) ------------------------------- */

test.describe('WP5-UX-AX-10 on the mobile project', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone widths');
  for (const size of [
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    test(`in batch mode at ${size.width}px each day button stays inside its cell and clear of the label`, async ({ page, adminSeed, builtServer, signInPageAs }) => {
      const world = await newWorld(adminSeed, builtServer);
      await page.setViewportSize(size);
      await signInPageAs(world.me.account, '#/timesheet');
      await expect(page.locator('[data-day]')).toHaveCount(14);
      await page.getByRole('button', { name: 'Change several days' }).click();
      await expect(page.getByRole('group', { name: 'Batch category edit' })).toBeVisible();
      const rows = await page.locator('tr.sheet-row[data-day]').evaluateAll((elements) =>
        elements.map((row) => {
          const box = (selector: string) => {
            const rect = row.querySelector(selector)?.getBoundingClientRect();
            return rect === undefined ? null : { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
          };
          return { day: row.getAttribute('data-day'), button: box('button.sheet-day-button'), cell: box('td.t-day'), label: box('td.t-label'), pick: box('label.pick') };
        }),
      );
      expect(rows).toHaveLength(14);
      const problems: string[] = [];
      for (const { day, button, cell, label, pick } of rows) {
        if (button === null || cell === null || label === null || pick === null) {
          problems.push(`${day}: missing part`);
          continue;
        }
        if (button.right > cell.right + 0.5) problems.push(`${day}: day button ${(button.right - cell.right).toFixed(1)}px outside its cell`);
        if (button.right > label.left + 0.5) problems.push(`${day}: day button ${(button.right - label.left).toFixed(1)}px over the label cell`);
        if (pick.width < 44 || pick.height < 44) problems.push(`${day}: selection target ${pick.width}x${pick.height}`);
      }
      expect(problems).toEqual([]);
      const widths = await page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
      expect(widths.scroll, 'no sideways scroll').toBeLessThanOrEqual(widths.inner);
    });
  }
});
