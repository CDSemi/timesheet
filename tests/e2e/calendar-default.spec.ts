import type { Locator, Page, Request } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { backdropOf, backdropsAbove, computedStyle, contrast, focusFromKeyboard, measureFocusRing, over, parseColour, textContrast } from './contrast.ts';
import { type BuiltServer, expect, newPerson, type Person, SeedClient, test } from './fixtures.ts';

/*
 * R-UX5I2-3 (owner decision 2026-11-02): when a day's calendar default changed since the Day editor loaded it (an administrator's holiday
 * import), saving must not silently record the old category over the new default. The server refuses with 409 `default_changed`; the Day
 * editor shows a notice with the owner's two choices, "Use {new default}" and "Save {category} anyway"; the label picker and "Change
 * several days" answer through "Reload period". Every test has a built server of its own (the import changes the calendar of all people on
 * it), a synthetic person of its own, and a past workday of the displayed period: Worked is its default, Holiday the imported one.
 */

const TYPED = 'Synthetic note typed and not saved';
const ELSEWHERE = 'Synthetic note saved on another device';

interface DayFacts {
  work_date: string;
  category: string;
  category_source: string;
  default_category: string | null;
  entry: { version: number; notes: string } | null;
}

const dayOf = (api: SeedClient, date: string) => api.call<DayFacts>('GET', `/api/days/${date}`);

/**
 * An administrator's holiday import, as the Settings screen sends it: the effective date is the earliest one the preview reports (the
 * start of the current pay period), so a sweep at a period boundary never meets the retroactive-change refusal. This spec carries its own
 * helper: the shared fixtures do not have one.
 */
async function importHoliday(admin: SeedClient, date: string, kind: 'holiday' | 'closure' = 'holiday', name = 'Synthetic Admin Holiday'): Promise<void> {
  const calendar = await admin.call<{ id: string }>('GET', '/api/calendar');
  const csv = ['date,name,kind', `${date},${name},${kind}`].join('\n');
  const base = { calendar_id: calendar.id, year: Number(date.slice(0, 4)), csv, remove_dates: [] };
  const first = await admin.call<{ earliest_effective_from: string }>('POST', '/api/admin/calendar/import/preview', { ...base, effective_from: '2099-01-01' });
  const body = { ...base, effective_from: first.earliest_effective_from };
  const preview = await admin.call<{ preview_hash: string | null; can_commit: boolean }>('POST', '/api/admin/calendar/import/preview', body);
  expect(preview.can_commit, 'the import can be committed').toBe(true);
  const done = await admin.call<{ committed: boolean }>('POST', '/api/admin/calendar/import/commit', { ...body, preview_hash: preview.preview_hash }, 201);
  expect(done.committed, 'the import wrote a calendar version').toBe(true);
}

interface Scene {
  admin: SeedClient;
  person: Person;
  /** A past workday of the displayed period: Worked by the calendar until the import makes it a holiday. */
  date: string;
  /** Another such workday, for a test that needs a second date. */
  other: string;
  editor: Locator;
  notes: Locator;
  category: Locator;
  /** The notice of a changed default, in the Day editor. */
  notice: Locator;
  /** Every PUT /api/days/:date the page sent, with its status once answered. */
  puts: Array<{ body: Record<string, unknown>; status: number | null }>;
}

const openEditor = async (page: Page, date: string): Promise<Locator> => {
  await page.getByLabel('Open a day').fill(date);
  await page.getByRole('button', { name: 'Open day', exact: true }).click();
  const editor = page.getByRole('dialog', { name: /Day editor/ });
  await expect(editor).toBeVisible();
  await expect(editor.getByRole('form', { name: 'Day fields' })).toBeVisible();
  return editor;
};

async function signInTo(page: Page, server: BuiltServer, who: { email: string; password: string }, hash = '#/timesheet'): Promise<void> {
  await page.goto(`${server.origin}/${hash}`);
  await page.getByLabel('Email').fill(who.email);
  await page.getByLabel('Password').fill(who.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** A person of this test alone on its private server, signed in, with the editor open on a past workday (with a recorded session or without any entry). */
async function openScene(
  page: Page,
  server: BuiltServer,
  options: { name: string; shape: 'default-entry' | 'no-entry' | 'explicit-entry' },
): Promise<Scene> {
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const person = await newPerson(admin, server, { displayName: `Synthetic ${options.name}`, signature: 'none' });
  const free = await person.api.displayedPeriodFreeWorkdays();
  expect(free.length, 'two past free workdays in the displayed period').toBeGreaterThanOrEqual(2);
  const [date = '', other = ''] = free;
  if (options.shape === 'default-entry') await person.api.seedCompleteDay(date);
  if (options.shape === 'explicit-entry') await person.api.putDay(date, { category: 'Worked' });
  const puts: Scene['puts'] = [];
  page.on('request', (request: Request) => {
    if (request.method() !== 'PUT' || new URL(request.url()).pathname !== `/api/days/${date}`) return;
    const record: Scene['puts'][number] = { body: request.postDataJSON() as Record<string, unknown>, status: null };
    puts.push(record);
    void request.response().then((response) => {
      record.status = response?.status() ?? null;
    });
  });
  await signInTo(page, server, person.account);
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const editor = await openEditor(page, date);
  const form = editor.getByRole('form', { name: 'Day fields' });
  const shown = await dayOf(person.api, date);
  expect(shown, 'the day starts on its calendar default (or the explicit category the shape saved)').toMatchObject({ category: 'Worked', default_category: 'Worked' });
  return {
    admin,
    person,
    date,
    other,
    editor,
    notes: form.getByLabel('Notes'),
    category: form.getByLabel('Category'),
    notice: editor.getByRole('alert').filter({ hasText: 'The calendar default for this day changed' }),
    puts,
  };
}

const saveButton = (editor: Locator) => editor.getByRole('button', { name: 'Save day fields' });
const savedStatus = (editor: Locator) => editor.getByRole('status').filter({ hasText: 'Day fields saved.' });
const staleOf = (editor: Locator) => editor.getByRole('alert').filter({ hasText: 'This day changed since it was loaded' });
const useButton = (notice: Locator, category = 'Holiday') => notice.getByRole('button', { name: `Use ${category}`, exact: true });
const anywayButton = (notice: Locator, category = 'Worked') => notice.getByRole('button', { name: `Save ${category} anyway`, exact: true });

/** The notice has appeared: announced as an alert, naming both defaults, saying nothing was saved, and holding focus. */
async function expectNotice(scene: Scene, from: string, to: string): Promise<void> {
  const { notice } = scene;
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(`The calendar default for this day changed from ${from} to ${to} since it was loaded. Nothing was saved.`);
  await expect(notice).toContainText('Use the new default, or save your category over it.');
  await expect(notice).toBeFocused();
  await expect(notice.getByRole('button')).toHaveText([`Use ${to}`, `Save ${await scene.category.inputValue()} anyway`]);
}

test.describe('R-UX5I2-3: a calendar default that changed under an open Day editor', () => {
  test('W1: a default-sourced day with a typed note: Save is refused with the notice, and "Save Worked anyway" records the category and the note', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W1', shape: 'default-entry' });
    const { admin, person, date, editor, notes, notice, puts } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();

    await expectNotice(scene, 'Worked', 'Holiday');
    expect(puts.map((put) => put.body.default_category), 'the form named the default it showed').toEqual(['Worked']);
    await expect.poll(() => puts[0]?.status).toBe(409);
    // Nothing was written: the entry is still the default-sourced row and the day reads as the new default.
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default', entry: { version: 1, notes: '' } });
    await expect(notes).toHaveValue(TYPED);
    await expect(savedStatus(editor)).toHaveCount(0);

    await anywayButton(notice).click();
    await expect(savedStatus(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(puts.map((put) => put.body.default_category), 'the acknowledgement names the new default').toEqual(['Worked', 'Holiday']);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { version: 2, notes: TYPED } });
    await expect(scene.category).toBeFocused();
  });

  test('W2: "Use Holiday" sends nothing, keeps the typed note, rebases the form, refreshes the sheet and the figures, and Save records the new default', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W2', shape: 'default-entry' });
    const { admin, person, date, editor, notes, category, notice, puts } = scene;
    const desktop = (page.viewportSize()?.width ?? 0) >= 768;
    const offCalendar = editor.locator('[data-figure="off-calendar"]');
    const regular = editor.locator('[data-figure="regular"]');
    const figuresBefore = desktop ? [await regular.innerText(), await offCalendar.innerText()] : [];
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');

    await useButton(notice).click();
    await expect(notice).toHaveCount(0);
    await expect(category).toHaveValue('Holiday');
    await expect(notes).toHaveValue(TYPED);
    await expect(category).toBeFocused();
    expect(puts, 'only the refused save was sent').toHaveLength(1);
    // Other fields are typed, so the status says what is left to save; the hint about the calendar default stays.
    await expect(editor.getByRole('status').filter({ hasText: 'Category set to Holiday, the calendar default now. Save day fields to keep your other changes.' })).toBeVisible();
    await expect(editor.getByText('Calendar default. Saving records it as your choice.')).toBeVisible();
    // The sheet behind shows the new default at once (the page was refreshed), and the figures follow the holiday.
    await expect(page.locator(`[data-day="${date}"]`)).toContainText('Holiday');
    if (desktop) {
      await expect.poll(async () => [await regular.innerText(), await offCalendar.innerText()]).not.toEqual(figuresBefore);
    }
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default', entry: { version: 1 } });

    await saveButton(editor).click();
    await expect(savedStatus(editor)).toBeVisible();
    expect(puts.map((put) => put.body.default_category)).toEqual(['Worked', 'Holiday']);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'explicit', entry: { version: 2, notes: TYPED } });
  });

  test('W2b: "Use Holiday" with nothing else typed says nothing needs saving, and a save is not needed', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W2b', shape: 'default-entry' });
    const { admin, person, date, editor, category, notice } = scene;
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await useButton(notice).click();
    await expect(category).toHaveValue('Holiday');
    await expect(editor.getByRole('status').filter({ hasText: 'Category set to Holiday, the calendar default now. Nothing needs saving.' })).toBeVisible();
    // The day keeps following the calendar: still no person's row.
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default', entry: { version: 1 } });
  });

  test('W2c: after "Use Holiday" the form names the new default, so another category chosen next is saved without a second notice', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W2c', shape: 'default-entry' });
    const { admin, person, date, editor, notes, category, notice, puts } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await useButton(notice).click();
    await category.selectOption('Off');
    await saveButton(editor).click();
    await expect(savedStatus(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(puts.map((put) => [put.body.default_category, put.status])).toEqual([
      ['Worked', 409],
      ['Holiday', 200],
    ]);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Off', category_source: 'explicit', entry: { notes: TYPED } });
  });

  for (const choice of ['use', 'anyway'] as const) {
    test(`W3: a day with no entry: ${choice === 'use' ? '"Use Holiday" then Save' : '"Save Worked anyway"'}`, async ({ page, privateServer }) => {
      test.setTimeout(90_000);
      const scene = await openScene(page, privateServer, { name: `Caldef W3 ${choice}`, shape: 'no-entry' });
      const { admin, person, date, editor, notes, notice, puts } = scene;
      await notes.fill(TYPED);
      await importHoliday(admin, date);
      await saveButton(editor).click();
      await expectNotice(scene, 'Worked', 'Holiday');
      expect(await dayOf(person.api, date), 'no row was written').toMatchObject({ category: 'Holiday', entry: null });
      if (choice === 'use') {
        await useButton(notice).click();
        await saveButton(editor).click();
      } else {
        await anywayButton(notice).click();
      }
      await expect(savedStatus(editor)).toBeVisible();
      expect(puts.map((put) => put.body.expected_version)).toEqual([null, null]);
      expect(await dayOf(person.api, date)).toMatchObject({
        category: choice === 'use' ? 'Holiday' : 'Worked',
        category_source: 'explicit',
        entry: { version: 1, notes: TYPED },
      });
    });
  }

  test.describe('the drawer', () => {
    test.skip(({ isMobile }) => isMobile, 'The follow read and the session write answer are checked on the desktop drawer');

    for (const typed of [true, false]) {
      test(`W4${typed ? 'a' : 'b'}: after a session is deleted in the open editor, ${
        typed
          ? 'a typed note keeps the old category and Save is refused with the notice (FIX19 held branch)'
          : 'with nothing typed the form restarts on the new default and Save is not refused'
      }`, async ({ page, privateServer }) => {
        test.setTimeout(90_000);
        const scene = await openScene(page, privateServer, { name: `Caldef W4 ${typed ? 'typed' : 'clean'}`, shape: 'default-entry' });
        const { admin, person, date, editor, notes, category, notice } = scene;
        if (typed) await notes.fill(TYPED);
        await importHoliday(admin, date);
        await editor.getByRole('button', { name: /^Delete session/ }).first().click();
        await page.getByRole('alertdialog', { name: 'Delete this session?' }).getByRole('button', { name: 'Delete session' }).click();
        await expect(editor.getByRole('status').filter({ hasText: 'Session deleted.' })).toBeVisible();
        if (typed) {
          await expect(category).toHaveValue('Worked');
          await saveButton(editor).click();
          await expectNotice(scene, 'Worked', 'Holiday');
          expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default' });
        } else {
          await expect(category).toHaveValue('Holiday');
          await saveButton(editor).click();
          await expect(savedStatus(editor)).toBeVisible();
          await expect(notice).toHaveCount(0);
          expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'explicit' });
        }
      });
    }

    test('W5: the tab comes back after the import (FIX18 follow): the held day is kept and a typed note makes Save refuse with the notice', async ({ page, privateServer }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 1440, height: 800 });
      const scene = await openScene(page, privateServer, { name: 'Caldef W5', shape: 'no-entry' });
      const { admin, date, editor, notes, category } = scene;
      await notes.fill(TYPED);
      await importHoliday(admin, date);
      const read = page.waitForResponse((response) => response.request().method() === 'GET' && new URL(response.url()).pathname === `/api/days/${date}`);
      await page.evaluate("document.dispatchEvent(new Event('visibilitychange'))");
      await read;
      await page.evaluate('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      await expect(category, 'the held day keeps the category the form showed').toHaveValue('Worked');
      await saveButton(editor).click();
      await expectNotice(scene, 'Worked', 'Holiday');
    });
  });

  test('W6: an explicit entry is never refused, and an import that moves another date raises no notice', async ({ page, privateServer }) => {
    test.setTimeout(120_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W6 explicit', shape: 'explicit-entry' });
    const { admin, person, date, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expect(savedStatus(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { notes: TYPED } });
  });

  test('W6b: an import that changes another date raises no notice', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W6 other date', shape: 'default-entry' });
    const { admin, person, date, other, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, other);
    await saveButton(editor).click();
    await expect(savedStatus(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { notes: TYPED } });
  });

  test('W7a: after "Use Holiday" with nothing else typed, Escape closes without "Discard your changes?"', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W7a', shape: 'default-entry' });
    const { admin, date, editor, notice } = scene;
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await useButton(notice).click();
    await expect(scene.category).toHaveValue('Holiday');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog', { name: 'Discard your changes?' })).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: /Day editor/ })).toHaveCount(0);
  });

  test('W7b: after "Use Holiday" with a note typed, Escape asks "Discard your changes?"', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W7b', shape: 'default-entry' });
    const { admin, date, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await useButton(notice).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog', { name: 'Discard your changes?' })).toBeVisible();
  });

  test('W8: on the phone the notice is in the sheet, in view and focused, both buttons are 44px high, the foot Save stays in view, and "Save anyway" works', async ({ page, privateServer }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'The bottom sheet is the phone project');
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W8', shape: 'default-entry' });
    const { admin, person, date, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    const foot = editor.locator('[data-editor-foot]');
    await expect(foot.getByRole('button', { name: 'Save day fields' })).toBeVisible();
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await expect(notice).toBeInViewport();
    await expect(foot.getByRole('button', { name: 'Save day fields' })).toBeInViewport();
    for (const button of [useButton(notice), anywayButton(notice)]) {
      const box = await button.boundingBox();
      expect(box?.height ?? 0, 'a 44px target below 768px').toBeGreaterThanOrEqual(44);
      await expect(button).toBeInViewport();
    }
    await anywayButton(notice).click();
    await expect(savedStatus(editor)).toBeVisible();
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { notes: TYPED } });
  });

  test('W11: the notice and its two buttons are readable in the light theme and in both dark sets', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W11', shape: 'default-entry' });
    const { admin, date, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    const paragraph = notice.locator('p');
    const sets: Array<[string, () => Promise<void>]> = [
      ['light', async () => page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })],
      ['dark (system setting)', async () => page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })],
      [
        'dark (chosen)',
        async () => {
          await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
          await page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')");
        },
      ],
    ];
    for (const [name, apply] of sets) {
      await page.evaluate("document.documentElement.removeAttribute('data-theme')");
      await apply();
      expect(await textContrast(paragraph), `${name}: the notice text`).toBeGreaterThanOrEqual(4.5);
      for (const button of [useButton(notice), anywayButton(notice)]) {
        const label = await button.innerText();
        expect(await textContrast(button), `${name}: ${label} text`).toBeGreaterThanOrEqual(4.5);
        // The primary button's fill against what is behind it (3:1, SC 1.4.11). The secondary button is the app's text-on-surface look; its text
        // contrast is the one above, and its focus ring is measured with the primary one.
        if (!label.startsWith('Use')) {
          const backdrop = backdropOf(await backdropsAbove(button));
          const fill = parseColour(await computedStyle(button, 'backgroundColor'));
          expect(contrast(over(fill, backdrop), backdrop), `${name}: ${label} fill`).toBeGreaterThanOrEqual(3);
        }
        await focusFromKeyboard(button);
        const ring = await measureFocusRing(button);
        expect(ring.ringAgainstBackdrop, `${name}: ${label} focus ring`).toBeGreaterThanOrEqual(3);
      }
    }
    await page.evaluate("document.documentElement.removeAttribute('data-theme')");
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  });

  test('W12: a second change after the notice: "Save Worked anyway" is refused again with a notice naming the newest default', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W12', shape: 'default-entry' });
    const { admin, person, date, editor, notes, notice, puts } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    // The holiday becomes a company closure while the notice is open.
    await importHoliday(admin, date, 'closure');
    await anywayButton(notice).click();
    await expect(notice).toContainText('changed from Holiday to Shutdown since it was loaded');
    await expect(notice).toBeFocused();
    await expect(savedStatus(editor)).toHaveCount(0);
    expect(puts.map((put) => put.body.default_category)).toEqual(['Worked', 'Holiday']);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Shutdown', category_source: 'default' });
    await anywayButton(notice).click();
    await expect(savedStatus(editor)).toBeVisible();
    expect(puts.map((put) => put.body.default_category)).toEqual(['Worked', 'Holiday', 'Shutdown']);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });

  test('W13: choosing the new default by hand in the Category select and pressing Save is accepted, with no second notice', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W13', shape: 'default-entry' });
    const { admin, person, date, editor, notes, category, notice, puts } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await category.selectOption('Holiday');
    await saveButton(editor).click();
    await expect(savedStatus(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    // The form still named the default it showed; the server did not refuse because the category equals the new default.
    expect(puts.map((put) => [put.body.default_category, put.status])).toEqual([
      ['Worked', 409],
      ['Worked', 200],
    ]);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'explicit', entry: { notes: TYPED } });
  });

  test('W14: when the day changed elsewhere after the notice, "Use Holiday" does not take that day; the later Save ends in "Reload day"', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W14', shape: 'default-entry' });
    const { admin, person, date, editor, notes, category, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await person.api.putDay(date, { category: 'Holiday', notes: ELSEWHERE });
    const read = page.waitForResponse((response) => response.request().method() === 'GET' && new URL(response.url()).pathname === `/api/days/${date}`);
    await useButton(notice).click();
    await read;
    await page.evaluate('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    await expect(category).toHaveValue('Holiday');
    await expect(notes).toHaveValue(TYPED);
    await expect(staleOf(editor), 'the other change is not announced by the read').toHaveCount(0);
    await saveButton(editor).click();
    await expect(staleOf(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    await editor.getByRole('button', { name: 'Reload day' }).click();
    await expect(notes).toHaveValue(ELSEWHERE);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', entry: { notes: ELSEWHERE } });
  });

  test('W15: a stale version after the notice closes the default notice and shows only the stale notice', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W15', shape: 'default-entry' });
    const { admin, person, date, editor, notes, notice } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    await person.api.putDay(date, { category: 'Worked', notes: ELSEWHERE });
    await anywayButton(notice).click();
    await expect(staleOf(editor)).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { version: 2, notes: ELSEWHERE } });
  });

  test('W16: "Save anyway" stays disabled while the reason a period needs is missing (the server\'s answers are stubbed: an import never reaches an old period)', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const admin = await new SeedClient(privateServer.origin).signIn(privateServer.credentials.admin.email, privateServer.credentials.admin.password);
    const person = await newPerson(admin, privateServer, { displayName: 'Synthetic Caldef W16', signature: 'none' });
    const [date = ''] = await person.api.displayedPeriodFreeWorkdays();
    // The day answers as one of a period that needs a reason; the first save is refused as a changed default, as the server would.
    await page.route(`**/api/days/${date}`, async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'default_changed',
              message: 'stubbed',
              details: { work_date: date, expected_default: 'Worked', current_default: 'Holiday' },
            },
          }),
        });
        return;
      }
      const response = await route.fetch();
      const day = (await response.json()) as { edit: { reason_required: boolean } };
      day.edit.reason_required = true;
      await route.fulfill({ response, json: day });
    });
    await signInTo(page, privateServer, person.account);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const editor = await openEditor(page, date);
    const reason = editor.getByLabel('Reason for editing an old or finalized period');
    await expect(reason).toBeVisible();
    await expect(saveButton(editor)).toBeDisabled();
    await reason.fill('Synthetic reason');
    await editor.getByRole('form', { name: 'Day fields' }).getByLabel('Notes').fill(TYPED);
    await saveButton(editor).click();
    const notice = editor.getByRole('alert').filter({ hasText: 'The calendar default for this day changed' });
    await expect(notice).toBeVisible();
    await expect(anywayButton(notice)).toBeEnabled();
    await reason.fill('');
    await expect(anywayButton(notice), 'no write without the reason').toBeDisabled();
    await expect(useButton(notice), 'the choice that sends nothing stays available').toBeEnabled();
  });

  test('W10: a grantee with edit rights sees the same notice in the shared view and has both choices', async ({ page, privateServer }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The shared edit view is checked on the desktop drawer');
    test.setTimeout(120_000);
    const admin = await new SeedClient(privateServer.origin).signIn(privateServer.credentials.admin.email, privateServer.credentials.admin.password);
    const owner = await newPerson(admin, privateServer, { displayName: 'Synthetic Caldef Owner', signature: 'none' });
    const grantee = await newPerson(admin, privateServer, { displayName: 'Synthetic Caldef Grantee', signature: 'none' });
    await owner.api.call('POST', '/api/shares', { grantee_email: grantee.account.email, items: { timesheets: 'edit', ot_read: false, pdf_download: false } }, 201);
    const [first = '', second = ''] = await owner.api.displayedPeriodFreeWorkdays();
    expect(second, 'two past free workdays').not.toBe('');
    const puts: Array<Record<string, unknown>> = [];
    page.on('request', (request) => {
      if (request.method() === 'PUT' && new URL(request.url()).pathname.startsWith(`/api/shared/${owner.account.id}/days/`)) {
        puts.push(request.postDataJSON() as Record<string, unknown>);
      }
    });
    await signInTo(page, privateServer, grantee.account, `#/shared/${owner.account.id}/timesheet`);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const noticeOf = (editor: Locator) => editor.getByRole('alert').filter({ hasText: 'The calendar default for this day changed' });

    // "Save anyway": the grantee opens the owner's day, the default changes under the open editor, the save is refused with the notice.
    const firstEditor = await openEditor(page, first);
    await firstEditor.getByLabel('Notes').fill(TYPED);
    await importHoliday(admin, first);
    await saveButton(firstEditor).click();
    const notice = noticeOf(firstEditor);
    await expect(notice).toContainText('changed from Worked to Holiday since it was loaded');
    await expect(notice).toBeFocused();
    expect(await dayOf(owner.api, first)).toMatchObject({ category: 'Holiday', category_source: 'default', entry: null });
    await anywayButton(notice).click();
    await expect(savedStatus(firstEditor)).toBeVisible();
    expect(await dayOf(owner.api, first)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { notes: TYPED } });
    expect(puts.map((put) => put.default_category)).toEqual(['Worked', 'Holiday']);

    // "Use": the other choice on the second day.
    const secondEditor = await openEditor(page, second);
    await secondEditor.getByLabel('Notes').fill(TYPED);
    await importHoliday(admin, second, 'holiday', 'Synthetic Second Holiday');
    await saveButton(secondEditor).click();
    const secondNotice = noticeOf(secondEditor);
    await expect(secondNotice).toBeVisible();
    await useButton(secondNotice).click();
    await expect(secondEditor.getByLabel('Category')).toHaveValue('Holiday');
    await saveButton(secondEditor).click();
    await expect(savedStatus(secondEditor)).toBeVisible();
    expect(await dayOf(owner.api, second)).toMatchObject({ category: 'Holiday', category_source: 'explicit', entry: { notes: TYPED } });
  });
});

test.describe('R-UX5I2-3: the label picker and "Change several days" answer through "Reload period"', () => {
  /** A signed-in sheet whose day has no entry, and an administrator's import that makes it a holiday after the sheet was loaded. */
  async function staleSheet(page: Page, server: BuiltServer, name: string) {
    const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
    const person = await newPerson(admin, server, { displayName: `Synthetic ${name}`, signature: 'none' });
    const [date = ''] = await person.api.displayedPeriodFreeWorkdays();
    expect(date, 'a past free workday').not.toBe('');
    const batch: Array<Record<string, unknown>> = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/days/batch') batch.push(request.postDataJSON() as Record<string, unknown>);
    });
    await signInTo(page, server, person.account);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await importHoliday(admin, date);
    return { admin, person, date, batch };
  }

  const reloadButton = (page: Page) => page.getByRole('button', { name: 'Reload period', exact: true });

  test('W9a: a pick on a stale cell is refused in the review, nothing is written, "Reload period" is offered and shows the new default, and a new pick saves over it', async ({ page, privateServer }) => {
    test.setTimeout(120_000);
    const { person, date, batch } = await staleSheet(page, privateServer, 'Caldef W9a');
    const picker = page.getByRole('button', { name: new RegExp(`^Category for ${date}`) });
    await picker.click();
    await page.getByRole('listbox', { name: `Category for ${date}` }).getByRole('option', { name: 'Worked', exact: true }).click();

    const review = page.getByRole('dialog', { name: `Review category change for ${date}` });
    await expect(review).toBeVisible();
    await expect(review).toContainText('calendar default changed: The calendar default is now Holiday (was Worked)');
    await expect(review.getByRole('button', { name: 'Commit changes' })).toBeDisabled();
    expect(batch.map((body) => body.mode), 'only the preview was sent').toEqual(['preview']);
    expect(batch[0]).toMatchObject({ entries: [{ work_date: date, category: 'Worked', expected_version: null, default_category: 'Worked' }] });
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', entry: null });

    await review.getByRole('button', { name: 'Cancel' }).click();
    await expect(review).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: `${date} changed since this period was loaded. Nothing was saved.` })).toBeVisible();
    await expect(reloadButton(page)).toBeVisible();
    await reloadButton(page).click();
    await expect(page.locator(`[data-day="${date}"]`)).toContainText('Holiday');
    await expect(reloadButton(page)).toHaveCount(0);

    // Now the person has seen the holiday; picking Worked over it is their decision.
    await page.getByRole('button', { name: new RegExp(`^Category for ${date}`) }).click();
    await page.getByRole('listbox', { name: `Category for ${date}` }).getByRole('option', { name: 'Worked', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved 1 day.' })).toBeVisible();
    expect(batch.at(-1)).toMatchObject({ mode: 'commit', entries: [{ work_date: date, category: 'Worked', default_category: 'Holiday' }] });
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });

  test('W9b: "Change several days": the preview refuses a stale date, "Reload period" is offered, and after it the batch commits', async ({ page, privateServer }) => {
    test.setTimeout(120_000);
    const { person, date, batch } = await staleSheet(page, privateServer, 'Caldef W9b');
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByRole('checkbox', { name: `Select ${date}`, exact: true }).check();
    await page.getByLabel('Category for selected days').selectOption('Worked');
    await page.getByRole('button', { name: 'Preview changes' }).click();
    const review = page.getByRole('dialog', { name: 'Review category change' });
    await expect(review).toContainText('calendar default changed: The calendar default is now Holiday (was Worked)');
    await expect(review.getByRole('button', { name: 'Commit changes' })).toBeDisabled();
    expect(batch.map((body) => body.mode)).toEqual(['preview']);
    await review.getByRole('button', { name: 'Cancel' }).click();
    await expect(reloadButton(page)).toBeVisible();
    await reloadButton(page).click();
    await expect(page.locator(`[data-day="${date}"]`)).toContainText('Holiday');
    await page.getByRole('checkbox', { name: `Select ${date}`, exact: true }).check();
    await page.getByRole('button', { name: 'Preview changes' }).click();
    await page.getByRole('dialog', { name: 'Review category change' }).getByRole('button', { name: 'Commit changes' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved 1 day.' })).toBeVisible();
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });

  test('W9c: a commit that meets a default changed after the preview answers with the page\'s reload message and writes nothing', async ({ page, privateServer }) => {
    test.setTimeout(120_000);
    const admin = await new SeedClient(privateServer.origin).signIn(privateServer.credentials.admin.email, privateServer.credentials.admin.password);
    const person = await newPerson(admin, privateServer, { displayName: 'Synthetic Caldef W9c', signature: 'none' });
    const [date = ''] = await person.api.displayedPeriodFreeWorkdays();
    await signInTo(page, privateServer, person.account);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.getByRole('button', { name: 'Change several days' }).click();
    await page.getByRole('checkbox', { name: `Select ${date}`, exact: true }).check();
    await page.getByLabel('Category for selected days').selectOption('Vacation');
    await page.getByRole('button', { name: 'Preview changes' }).click();
    const review = page.getByRole('dialog', { name: 'Review category change' });
    await expect(review.getByRole('button', { name: 'Commit changes' })).toBeEnabled();
    // The race: the import lands between the preview and the commit.
    await importHoliday(admin, date);
    await review.getByRole('button', { name: 'Commit changes' }).click();
    await expect(review).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: `${date} changed since this period was loaded. Nothing was saved. Reload the period` })).toBeVisible();
    await expect(reloadButton(page)).toBeVisible();
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default', entry: null });
    await reloadButton(page).click();
    await expect(page.locator(`[data-day="${date}"]`)).toContainText('Holiday');
  });
});

test.describe('R-UX5I2-3 under a device zone other than the reporting zone (AGENTS rule 7)', () => {
  test.use({ locale: 'en-US', timezoneId: 'Pacific/Auckland' });

  test('W17: the notice does not depend on the device zone: the accounting date and the owner calendar decide', async ({ page, privateServer }) => {
    test.setTimeout(90_000);
    const scene = await openScene(page, privateServer, { name: 'Caldef W17', shape: 'default-entry' });
    const { admin, person, date, editor, notes, notice, puts } = scene;
    await notes.fill(TYPED);
    await importHoliday(admin, date);
    await saveButton(editor).click();
    await expectNotice(scene, 'Worked', 'Holiday');
    expect(puts.map((put) => put.body.default_category)).toEqual(['Worked']);
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Holiday', category_source: 'default' });
    // The neighbouring dates, which the device zone would regroup, are untouched.
    for (const neighbour of [addDays(date, -1), addDays(date, 1)]) {
      expect((await dayOf(person.api, neighbour)).entry, `${neighbour} has no entry`).toBeNull();
    }
    await anywayButton(notice).click();
    await expect(savedStatus(editor)).toBeVisible();
    expect(await dayOf(person.api, date)).toMatchObject({ category: 'Worked', category_source: 'explicit', entry: { notes: TYPED } });
  });
});
