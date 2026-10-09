import type { Locator, Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { dateTimeIn, instantOfWallTime, wallTimeIn } from '../client/zoneOracle.ts';
import { expect, screenshotPath, type SeedClient, test } from './fixtures.ts';

/*
 * Day editor on both projects: manual sessions with an explicit input zone, DST fold and gap
 * choices and an explicit overnight end date; break suggestions; Clock in and Clock out with
 * break confirmation and a stale version; category, partial leave and WFH with the OT mismatch
 * notice; the reason prompt for old periods; and future days shown as upcoming.
 *
 * The browser zone (Asia/Ho_Chi_Minh) differs from the reporting zone on purpose. Dates derive
 * from the API, never the test machine's date, except the two DST days, which are fixed past
 * dates of 2026 (Sydney fall back on 2026-04-05, Los Angeles spring forward on 2026-03-08).
 * Every test removes the sessions it created.
 */
test.use({ locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh' });

const LA = 'America/Los_Angeles';
/** The accounting date of a Sydney 02:30 on 2026-04-05, in the Los Angeles reporting zone. */
const FOLD_DAY = '2026-04-04';
const GAP_DAY = '2026-03-08';
const OLD_DAY = '2026-05-12';

test.beforeEach(({ page }) => {
  // A refused request (the server answers 401, 409 or 422 on purpose in these tests) logs a
  // console error; anything else, such as a CSP violation, fails the test.
  page.on('console', (message) => {
    const expected = /status of (401|409|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

function need(days: string[], count: number): string[] {
  expect(days.length, 'past free workdays in the displayed period').toBeGreaterThanOrEqual(count);
  return days;
}

async function openEditor(page: Page, workDate: string): Promise<Locator> {
  await page.getByLabel('Open a day').fill(workDate);
  await page.getByRole('button', { name: 'Open day', exact: true }).click();
  const editor = page.getByRole('dialog', { name: /Day editor/ });
  await expect(editor).toBeVisible();
  await expect(editor.getByRole('heading', { name: 'Figures from the server' })).toBeVisible();
  return editor;
}

function figure(editor: Locator, name: string): Locator {
  return editor.locator(`[data-figure="${name}"]`);
}

/** Clocks in through the UI and waits until the server shows the running session and a positive length. */
async function clockIn(page: Page, seed: SeedClient, todayLocal: string) {
  await page.getByRole('button', { name: 'Clock in' }).click();
  await expect
    .poll(async () => (await seed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null))
    .toBe(true);
  // The server stamps whole seconds and a session needs a positive length.
  await page.waitForTimeout(1_500);
}

function snap(page: Page, name: string, project: string) {
  return page.screenshot({ path: screenshotPath(`${name}-${project}-synthetic.png`) });
}

/** The wall clock of an instant in a zone, read with Intl (an oracle independent of the app). */
function wallClock(instant: string, zone: string): string {
  return new Date(instant).toLocaleTimeString('en-GB', { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** The browser's current zone, read with Intl: the display zone the app shows times in. */
function browserZone(page: Page): Promise<string> {
  return page.evaluate<string>('Intl.DateTimeFormat().resolvedOptions().timeZone');
}

/** Types the input zone explicitly: manual entry defaults to the display zone (R-07), not to the reporting zone. */
async function typeInputZone(form: Locator, zone: string) {
  await form.getByLabel('Input zone').fill(zone);
}

async function chooseNoBreaks(form: Locator) {
  await form.getByRole('radio', { name: /No breaks taken/ }).check();
}

test('09:00 to 18:00 with breaks shifted by arrival: unknown stays pending, confirmed gives R 8h 00m and credit 0', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await signInThroughUi();
    // The grid (desktop) or the day list (mobile) opens the editor.
    await page.locator(`[data-day="${date}"]`).getByRole('button', { name: `Edit ${date}` }).click();
    const editor = page.getByRole('dialog', { name: /Day editor/ });
    await expect(editor).toBeVisible();
    await expect(editor.getByText('No session recorded for this day.')).toBeVisible();
    await expect(editor.getByText(`Accounting date ${date} in the reporting zone ${LA}`)).toBeVisible();

    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    // R-07: the default is the current display zone; Los Angeles is chosen explicitly below.
    await expect(form.getByLabel('Input zone')).toHaveValue(await browserZone(page));
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('09:00');
    await form.getByLabel('End time', { exact: true }).fill('18:00');
    await form.getByRole('button', { name: 'Suggest breaks' }).click();

    // R-02: a 09:00 arrival moves the default breaks to 11:00, 13:00 and 15:30, unconfirmed.
    const expected = [
      ['11:00', '11:15'],
      ['13:00', '13:30'],
      ['15:30', '15:45'],
    ] as const;
    for (const [index, [from, to]] of expected.entries()) {
      await expect(form.getByLabel(`Break ${index + 1} from time`)).toHaveValue(from);
      await expect(form.getByLabel(`Break ${index + 1} to time`)).toHaveValue(to);
    }
    await expect(form.getByRole('radio', { name: /Breaks not confirmed yet/ })).toBeChecked();

    // Unknown stays pending: saved without confirming, the day is not complete and OT is pending.
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    await expect(figure(editor, 'status')).toContainText('confirm breaks');
    await expect(editor.getByText('OT for this day stays pending')).toBeVisible();
    await expect(figure(editor, 'credited')).toHaveText('none');
    // Expected finish = start + required work + excluded breaks: 09:00 Los Angeles gives 18:00 there.
    // It is derived (shared domain function), display only, and shown in the display zone (R-07).
    const displayZone = await browserZone(page);
    const startUtc = (await employeeSeed.dayView(date)).sessions[0]?.start_utc ?? '';
    const finishUtc = new Date(Date.parse(startUtc) + 9 * 3600 * 1000).toISOString();
    await expect(figure(editor, 'expected-finish')).toHaveText(`${dateTimeIn(finishUtc, displayZone)} (${displayZone})`);
    await expect(figure(editor, 'expected-finish')).not.toContainText(LA);
    await expect(editor.locator('[data-figure-label="expected-finish"]')).toContainText('derived');
    await expect(editor.locator('[data-figure-note="expected-finish"]')).toContainText('Display only');

    // Confirm the suggested breaks of the saved session (edit with the version it loaded).
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await expect(edit.getByRole('radio', { name: /Breaks not confirmed yet/ })).toBeChecked();
    await expect(edit.getByLabel('Break 3 to time')).toHaveValue('15:45');
    await edit.getByRole('button', { name: 'Confirm suggested breaks' }).click();
    await expect(edit.getByRole('radio', { name: /Breaks confirmed as listed/ })).toBeChecked();
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    // R 480 and credit 0, exactly as the server shows them.
    await expect(figure(editor, 'status')).toContainText('complete');
    await expect(figure(editor, 'regular')).toHaveText('8h 00m');
    await expect(figure(editor, 'eligible')).toHaveText('0m');
    await expect(figure(editor, 'credited')).toHaveText('0m');
    await editor.getByRole('heading', { name: /Day editor/ }).scrollIntoViewIfNeeded();
    await snap(page, 'day-editor-09-18-breaks', project);

    const stored = await employeeSeed.dayView(date);
    expect(stored.calculation).toMatchObject({ status: 'complete', regular_minutes: 480, credited_minutes: 0 });
    const [session] = stored.sessions;
    expect(session?.breaks_confirmed).toBe(true);
    expect(session?.breaks).toHaveLength(3);
    expect(session?.input_zone).toBe(LA);
    // The typed 09:00 is Los Angeles wall time, whatever zone the browser is in.
    expect(wallClock(session?.start_utc ?? '', LA)).toBe('09:00:00');
    expect(wallClock(session?.end_utc ?? '', LA)).toBe('18:00:00');
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('manual entry defaults its input zone to the display zone and stores the instant typed there (R-07)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await signInThroughUi();
    const displayZone = await browserZone(page);
    // The test only means something while the display zone differs from the reporting zone.
    expect(displayZone).not.toBe(LA);
    const editor = await openEditor(page, date);
    await expect(editor.getByText(`in the reporting zone ${LA}`)).toBeVisible();
    await expect(editor.getByText(`they are shown in ${displayZone}`)).toBeVisible();
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    await expect(form.getByLabel('Input zone')).toHaveValue(displayZone);
    // Both zones stay available to choose.
    await expect(editor.locator('datalist option[value="America/Los_Angeles"]')).toHaveCount(1);
    await expect(editor.locator(`datalist option[value="${displayZone}"]`)).toHaveCount(1);

    // 22:00 to 23:30 in the display zone is the same instant as another wall time in Los Angeles
    // (08:00 to 09:30 under PDT, 07:00 to 08:30 under PST). The expectation is derived with Intl from
    // the real date, so the test holds in every season; the accounting date stays the same either way.
    await form.getByLabel('Start time', { exact: true }).fill('22:00');
    await form.getByLabel('End time', { exact: true }).fill('23:30');
    await chooseNoBreaks(form);
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    await expect(editor.getByText(`entered in ${displayZone}`)).toBeVisible();
    await snap(page, 'day-editor-display-zone-default', project);

    const stored = (await employeeSeed.dayView(date)).sessions[0];
    expect(stored?.input_zone).toBe(displayZone);
    expect(wallClock(stored?.start_utc ?? '', displayZone)).toBe('22:00:00');
    expect(wallClock(stored?.end_utc ?? '', displayZone)).toBe('23:30:00');
    expect(Date.parse(stored?.start_utc ?? '')).toBe(Date.parse(instantOfWallTime(date, '22:00', displayZone)));
    expect(Date.parse(stored?.end_utc ?? '')).toBe(Date.parse(instantOfWallTime(date, '23:30', displayZone)));
    expect(dateTimeIn(stored?.start_utc ?? '', LA)).toBe(wallTimeIn(date, '22:00', displayZone, LA));
    expect(dateTimeIn(stored?.end_utc ?? '', LA)).toBe(wallTimeIn(date, '23:30', displayZone, LA));
    expect(dateTimeIn(stored?.start_utc ?? '', LA).slice(0, 10)).toBe(date);

    // An edited session keeps its saved input zone; it is not reset to the default.
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await expect(edit.getByLabel('Input zone')).toHaveValue(displayZone);
    await edit.getByRole('button', { name: 'Cancel' }).click();

    // The default can still be changed explicitly: the same kind of wall time typed in Los Angeles is another instant.
    await editor.getByRole('button', { name: 'Add session' }).click();
    const second = editor.getByRole('form', { name: 'New session' });
    await expect(second.getByLabel('Input zone')).toHaveValue(displayZone);
    await typeInputZone(second, LA);
    await second.getByLabel('Start time', { exact: true }).fill('03:00');
    await second.getByLabel('End time', { exact: true }).fill('04:00');
    await chooseNoBreaks(second);
    await second.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const later = (await employeeSeed.dayView(date)).sessions.find((session) => session.input_zone === LA);
    expect(wallClock(later?.start_utc ?? '', LA)).toBe('03:00:00');
    expect(wallClock(later?.end_utc ?? '', LA)).toBe('04:00:00');
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('an overnight entry needs its explicit end date and is saved with it', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  const { todayLocal } = await employeeSeed.today();
  // The end falls on the next day, which must be past in the reporting zone.
  const date = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1).find((candidate) => addDays(candidate, 1) < todayLocal);
  expect(date, 'a past free workday whose next day is also past').toBeDefined();
  const workDate = date ?? '';
  const nextDate = addDays(workDate, 1);
  try {
    await signInThroughUi();
    const editor = await openEditor(page, workDate);
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('22:00');
    await form.getByLabel('End time', { exact: true }).fill('03:00');
    await chooseNoBreaks(form);
    // The end date still equals the start date, so the server refuses an end before the start.
    await expect(form.locator('[data-overnight]')).toHaveCount(0);
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(form.getByRole('alert')).toContainText('end_not_after_start');

    await form.getByLabel('End date', { exact: true }).fill(nextDate);
    await expect(form.locator('[data-overnight]')).toContainText(`ends on ${nextDate}`);
    await expect(form.locator('[data-overnight]')).toContainText(`accounting date ${workDate}`);
    await snap(page, 'day-editor-overnight', project);
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    const stored = (await employeeSeed.dayView(workDate)).sessions[0];
    // 22:00 to 03:00 the next day is 5 hours of elapsed time, kept on the starting accounting date.
    expect(wallClock(stored?.start_utc ?? '', LA)).toBe('22:00:00');
    expect(wallClock(stored?.end_utc ?? '', LA)).toBe('03:00:00');
    expect((Date.parse(stored?.end_utc ?? '') - Date.parse(stored?.start_utc ?? '')) / 1000).toBe(5 * 3600);
    await expect(editor.locator('.session-item')).toHaveCount(1);
  } finally {
    await employeeSeed.clearSessions(workDate);
  }
});

test('a repeated local time (DST fold) in an explicit input zone needs a choice and stores the chosen instant', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  try {
    await signInThroughUi();
    // 2026-04-05 02:30 happens twice in Sydney (+11:00, then +10:00); its accounting date in Los Angeles is the 4th.
    const editor = await openEditor(page, FOLD_DAY);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past Sydney shift');
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    await form.getByLabel('Input zone').fill('Australia/Sydney');
    await form.getByLabel('Start date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('End time', { exact: true }).fill('04:30');
    await chooseNoBreaks(form);

    await form.getByRole('button', { name: 'Save session' }).click();
    const prompt = form.locator('[data-problem="fold"]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('happens twice in Australia/Sydney');
    await expect(prompt.getByRole('radio', { name: 'Earlier time, UTC offset +11:00' })).not.toBeChecked();
    await expect(prompt.getByRole('radio', { name: 'Later time, UTC offset +10:00' })).not.toBeChecked();
    expect((await employeeSeed.dayView(FOLD_DAY)).sessions).toHaveLength(0);
    await snap(page, 'day-editor-dst-fold', project);

    await prompt.getByRole('radio', { name: 'Later time, UTC offset +10:00' }).check();
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    // The server stored the later instant: 02:30 at +10:00 is 16:30 UTC on the 4th; the end is 04:30 +10:00.
    const stored = (await employeeSeed.dayView(FOLD_DAY)).sessions[0];
    expect(stored?.start_utc).toBe('2026-04-04T16:30:00Z');
    expect(stored?.end_utc).toBe('2026-04-04T18:30:00Z');
    expect(stored?.input_zone).toBe('Australia/Sydney');
    // Editing the saved session pins its instant, so the question does not come back.
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('02:30');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect((await employeeSeed.dayView(FOLD_DAY)).sessions[0]?.start_utc).toBe('2026-04-04T16:30:00Z');
  } finally {
    await employeeSeed.clearSessions(FOLD_DAY);
  }
});

test('changing the input zone of a saved session re-reads the typed wall times in the new zone and saves those instants', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const LONDON = 'Europe/London';
  try {
    // Saved in Los Angeles: 09:00 to 18:00 with three confirmed breaks.
    await employeeSeed.seedCompleteDay(date);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    expect(before?.input_zone).toBe(LA);
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await expect(edit.getByLabel('Input zone')).toHaveValue(LA);
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('09:00');

    // Nothing is saved by changing the zone; the wall times stay as typed and mean London times now.
    await typeInputZone(edit, LONDON);
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('09:00');
    await expect(edit.getByLabel('End time', { exact: true })).toHaveValue('18:00');
    expect((await employeeSeed.dayView(date)).sessions[0]?.start_utc).toBe(before?.start_utc);
    await snap(page, 'day-editor-zone-change', project);
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    const after = (await employeeSeed.dayView(date)).sessions[0];
    expect(after?.input_zone).toBe(LONDON);
    expect(wallClock(after?.start_utc ?? '', LONDON)).toBe('09:00:00');
    expect(wallClock(after?.end_utc ?? '', LONDON)).toBe('18:00:00');
    expect(after?.start_utc).not.toBe(before?.start_utc);
    expect(after?.breaks.map((item) => wallClock(item.start_utc, LONDON))).toEqual(['11:00:00', '13:00:00', '15:30:00']);
    expect(after?.breaks_confirmed).toBe(true);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('an unchanged edit keeps the saved zone and instants', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await employeeSeed.seedCompleteDay(date);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await edit.getByLabel('Start time', { exact: true }).fill('09:15');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const after = (await employeeSeed.dayView(date)).sessions[0];
    expect(after?.input_zone).toBe(LA);
    expect(wallClock(after?.start_utc ?? '', LA)).toBe('09:15:00');
    expect(after?.end_utc).toBe(before?.end_utc);
    expect(after?.breaks.map((item) => item.start_utc)).toEqual(before?.breaks.map((item) => item.start_utc));
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('changing the input zone to one where the same wall time is repeated asks for a choice again', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  // 2026-04-05 02:30 exists once in Los Angeles but happens twice in Sydney (+11:00, then +10:00).
  const day = '2026-04-05';
  try {
    await signInThroughUi();
    const editor = await openEditor(page, day);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past shift');
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End time', { exact: true }).fill('04:30');
    await chooseNoBreaks(form);
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const before = (await employeeSeed.dayView(day)).sessions[0];
    expect(before?.start_utc).toBe('2026-04-05T09:30:00Z');

    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    await typeInputZone(edit, 'Australia/Sydney');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    // The repeated time is not guessed from the Los Angeles offset: the form asks, and nothing is saved.
    const prompt = edit.locator('[data-problem="fold"]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('happens twice in Australia/Sydney');
    expect((await employeeSeed.dayView(day)).sessions[0]?.start_utc).toBe(before?.start_utc);

    await prompt.getByRole('radio', { name: 'Earlier time, UTC offset +11:00' }).check();
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const after = (await employeeSeed.dayView(day)).sessions[0];
    expect(after?.input_zone).toBe('Australia/Sydney');
    // 02:30 at +11:00 is 15:30 UTC on the 4th; the end 04:30 is after the change, at +10:00.
    expect(after?.start_utc).toBe('2026-04-04T15:30:00Z');
    expect(after?.end_utc).toBe('2026-04-04T18:30:00Z');
  } finally {
    await employeeSeed.clearSessions(day);
  }
});

test('a local time that does not exist (DST gap) is explained and can move to the first valid time', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  try {
    await signInThroughUi();
    const editor = await openEditor(page, GAP_DAY);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past shift');
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = editor.getByRole('form', { name: 'New session' });
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End time', { exact: true }).fill('05:00');
    await chooseNoBreaks(form);
    await form.getByRole('button', { name: 'Save session' }).click();

    const prompt = form.locator('[data-problem="gap"]');
    await expect(prompt).toContainText(`2026-03-08 02:30 does not exist in ${LA}`);
    expect((await employeeSeed.dayView(GAP_DAY)).sessions).toHaveLength(0);
    await snap(page, 'day-editor-dst-gap', project);

    await prompt.getByRole('button', { name: 'Use 03:30 on 2026-03-08' }).click();
    await expect(form.getByLabel('Start time', { exact: true })).toHaveValue('03:30');
    await expect(form.locator('[data-problem="gap"]')).toHaveCount(0);
    await form.getByRole('button', { name: 'Save session' }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    // 03:30 PDT (-07:00) is 10:30 UTC.
    expect((await employeeSeed.dayView(GAP_DAY)).sessions[0]?.start_utc).toBe('2026-03-08T10:30:00Z');
  } finally {
    await employeeSeed.clearSessions(GAP_DAY);
  }
});

test('Clock in then Clock out asks for break confirmation and sends the session version', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const { todayLocal } = await employeeSeed.today();
  await signInThroughUi();
  await clockIn(page, employeeSeed, todayLocal);

  // One state-aware button: clocked in shows only Clock out, with the running state in words.
  await expect(page.getByRole('button', { name: 'Clock out' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clock in' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Clock' })).toContainText('Clocked in since');
  await page.screenshot({ path: screenshotPath(`period-${project}-clocked-in-synthetic.png`), animations: 'disabled' });
  await page.getByRole('button', { name: 'Clock out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Clock out' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Running since');
  await expect(dialog.getByRole('radio', { name: /Breaks not confirmed yet/ })).toBeChecked();
  await expect(dialog.getByRole('button', { name: 'Clock out, breaks unconfirmed' })).toBeVisible();

  // Suggestions follow the arrival; confirming breaks that end after the Clock out is refused.
  await dialog.getByRole('button', { name: 'Suggest breaks' }).click();
  await expect(dialog.locator('[data-break]')).toHaveCount(3);
  await dialog.getByRole('button', { name: 'Confirm suggested breaks' }).click();
  await snap(page, 'clock-out-dialog', project);
  await dialog.getByRole('button', { name: 'Clock out with these breaks' }).click();
  await expect(dialog.getByRole('alert')).toContainText('inside their work session');
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(true);

  // Confirming that no break was taken ends the session with confirmed, empty breaks.
  await dialog.getByRole('radio', { name: /No breaks taken/ }).check();
  await dialog.getByRole('button', { name: 'Clock out, no breaks taken' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Clocked out.')).toBeVisible();
  // After the clock out the panel offers Clock in again.
  await expect(page.getByRole('button', { name: 'Clock in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clock out' })).toHaveCount(0);
  const closed = (await employeeSeed.dayView(todayLocal)).sessions.filter((session) => session.source === 'clock').at(-1);
  expect(closed?.end_utc).not.toBeNull();
  expect(closed?.breaks_confirmed).toBe(true);
  expect(closed?.breaks).toHaveLength(0);
});

test('a stale session version at Clock out says so, reloads and then clocks out', async ({ page, employeeSeed, signInThroughUi }) => {
  const { todayLocal } = await employeeSeed.today();
  await signInThroughUi();
  await clockIn(page, employeeSeed, todayLocal);

  await page.getByRole('button', { name: 'Clock out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Clock out' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('radio', { name: /No breaks taken/ }).check();

  // Another device edits the running session after the dialog loaded its version.
  const running = (await employeeSeed.dayView(todayLocal)).sessions.find((session) => session.end_utc === null);
  expect(running).toBeDefined();
  await employeeSeed.call('PUT', `/api/sessions/${running?.id}`, {
    start: running?.start_utc,
    end: null,
    input_zone: running?.input_zone,
    breaks: [],
    breaks_confirmed: false,
    expected_version: running?.version,
  });

  await dialog.getByRole('button', { name: 'Clock out, no breaks taken' }).click();
  await expect(dialog.getByRole('alert').first()).toContainText('This session changed since it was loaded');
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(true);
  await dialog.getByRole('button', { name: 'Reload' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('reloaded')).toBeVisible();

  await page.getByRole('button', { name: 'Clock out' }).click();
  const again = page.getByRole('dialog', { name: 'Clock out' });
  await again.getByRole('radio', { name: /No breaks taken/ }).check();
  await again.getByRole('button', { name: 'Clock out, no breaks taken' }).click();
  await expect(again).toHaveCount(0);
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(false);
});

test('partial leave 240 with kind vacation saves; the kind is required; WFH is saved', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await signInThroughUi();
    const editor = await openEditor(page, date);
    const fields = editor.getByRole('form', { name: 'Day fields' });
    await expect(fields.getByText('Calendar default. Saving records it as your choice.')).toBeVisible();
    await expect(editor.locator('[data-warning="ot-leave-mismatch"]')).toHaveCount(0);

    await fields.getByLabel('Partial leave minutes').fill('240');
    await expect(fields.getByText('Leave 4h 00m.')).toBeVisible();
    await fields.getByRole('button', { name: 'Save day fields' }).click();
    // The server insists on a kind with leave minutes.
    await expect(fields.getByRole('alert')).toContainText('leave_kind_required');
    expect((await employeeSeed.dayView(date)).leave_minutes).toBe(0);

    await fields.getByLabel('Leave kind').selectOption('vacation');
    await fields.getByLabel('Worked from home (WFH)').check();
    await fields.getByRole('button', { name: 'Save day fields' }).click();
    await expect(editor.getByText('Day fields saved.')).toBeVisible();
    await snap(page, 'day-editor-partial-leave', project);

    const stored = await employeeSeed.dayView(date);
    expect(stored).toMatchObject({ leave_minutes: 240, leave_kind: 'vacation', wfh: true, category_source: 'explicit' });
  } finally {
    await employeeSeed.resetDay(date);
  }
});

test('the OT leave mismatch warning informs without spending or reserving anything', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const otRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/ot')) otRequests.push(`${request.method()} ${request.url()}`);
  });
  try {
    // Seeded data: 120 minutes of OT-kind leave on the day and no consumed OT leave.
    await employeeSeed.putDay(date, { leave_minutes: 120, leave_kind: 'ot' });
    expect((await employeeSeed.dayView(date)).ot_leave).toMatchObject({ kind_minutes: 120, consumed_minutes: 0, mismatch: true });
    await signInThroughUi();
    const editor = await openEditor(page, date);
    const warning = editor.locator('[data-warning="ot-leave-mismatch"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('OT leave on this day is 2h 00m');
    await expect(warning).toContainText('consumed OT leave is 0m');
    await expect(warning).toContainText('informational');
    await snap(page, 'day-editor-ot-mismatch', project);

    // Saving other fields keeps the notice and still touches no OT endpoint.
    await editor.getByRole('form', { name: 'Day fields' }).getByLabel('Worked from home (WFH)').check();
    await editor.getByRole('form', { name: 'Day fields' }).getByRole('button', { name: 'Save day fields' }).click();
    await expect(editor.getByText('Day fields saved.')).toBeVisible();
    await expect(warning).toBeVisible();
    expect(otRequests).toEqual([]);
    expect((await employeeSeed.dayView(date)).ot_leave).toMatchObject({ kind_minutes: 120, consumed_minutes: 0 });
  } finally {
    await employeeSeed.resetDay(date);
  }
});

test('an edit in an old period prompts for a reason and saves with it', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  try {
    // Without a reason the server refuses an old period outright.
    const before = await employeeSeed.dayView(OLD_DAY);
    await employeeSeed.call(
      'PUT',
      `/api/days/${OLD_DAY}`,
      { category: 'Worked', leave_minutes: 0, leave_kind: null, wfh: true, notes: '', expected_version: before.entry?.version ?? null },
      422,
    );
    expect((await employeeSeed.dayView(OLD_DAY)).wfh).toBe(false);

    await signInThroughUi();
    const editor = await openEditor(page, OLD_DAY);
    const fields = editor.getByRole('form', { name: 'Day fields' });
    await expect(editor.getByText('Period: old.')).toBeVisible();
    await fields.getByLabel('Worked from home (WFH)').check();
    await expect(fields.getByRole('button', { name: 'Save day fields' })).toBeDisabled();
    await expect(fields.getByText('Enter a reason for this old period above to save.')).toBeVisible();
    await snap(page, 'day-editor-reason-prompt', project);

    await editor.getByLabel('Reason for editing an old or finalized period').fill('Correcting a past work-from-home day');
    await expect(fields.getByRole('button', { name: 'Save day fields' })).toBeEnabled();
    await fields.getByRole('button', { name: 'Save day fields' }).click();
    await expect(editor.getByText('Day fields saved.')).toBeVisible();
    expect((await employeeSeed.dayView(OLD_DAY)).wfh).toBe(true);
  } finally {
    await employeeSeed.resetDay(OLD_DAY);
  }
});

test('a day changed elsewhere reports a stale version and reloads', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await signInThroughUi();
    const editor = await openEditor(page, date);
    const fields = editor.getByRole('form', { name: 'Day fields' });
    // Another device saves the day after the editor loaded it without an entry.
    await employeeSeed.putDay(date, { notes: 'changed on another device' });
    await fields.getByLabel('Worked from home (WFH)').check();
    await fields.getByRole('button', { name: 'Save day fields' }).click();

    const stale = editor.getByRole('alert').filter({ hasText: 'This day changed since it was loaded' });
    await expect(stale).toBeVisible();
    await expect(stale).toContainText('Nothing was saved');
    expect((await employeeSeed.dayView(date)).wfh).toBe(false);
    await stale.getByRole('button', { name: 'Reload day' }).click();
    await expect(stale).toHaveCount(0);
    await expect(editor.getByRole('form', { name: 'Day fields' }).getByLabel('Notes')).toHaveValue('changed on another device');
    await expect(editor.getByRole('form', { name: 'Day fields' }).getByLabel('Worked from home (WFH)')).not.toBeChecked();
  } finally {
    await employeeSeed.resetDay(date);
  }
});

test('a stale session version at save reports the conflict', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await employeeSeed.seedCompleteDay(date);
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = editor.getByRole('form', { name: 'Edit session' });
    // Another device changes the session after the editor loaded it.
    const session = (await employeeSeed.dayView(date)).sessions[0];
    await employeeSeed.call('PUT', `/api/sessions/${session?.id}`, {
      start: session?.start_utc,
      end: session?.end_utc,
      input_zone: session?.input_zone,
      breaks: [],
      breaks_confirmed: false,
      expected_version: session?.version,
    });
    await edit.getByLabel('End time', { exact: true }).fill('17:45');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(editor.getByRole('alert').filter({ hasText: 'This day changed since it was loaded' })).toBeVisible();
    await expect(editor.getByRole('form', { name: 'Edit session' })).toHaveCount(0);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('deleting a session asks for confirmation and sends the version', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  try {
    await employeeSeed.seedCompleteDay(date);
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await expect(editor.locator('.session-item')).toHaveCount(1);
    await editor.getByRole('button', { name: /^Delete session/ }).click();
    // Nothing is deleted by the first click.
    expect((await employeeSeed.dayView(date)).sessions).toHaveLength(1);
    await editor.getByRole('button', { name: 'Confirm delete' }).click();
    await expect(editor.getByText('Session deleted.')).toBeVisible();
    await expect(editor.getByText('No session recorded for this day.')).toBeVisible();
    expect((await employeeSeed.dayView(date)).sessions).toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('future days show as upcoming from the server date, past days without a record as missing', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  const { todayLocal } = await employeeSeed.today();
  const [pastDay = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  // The first expected workday after the server's current local date, from the periods the API reports.
  const ahead = await employeeSeed.call<{ periods: Array<{ payroll_date: string }> }>(
    'GET',
    `/api/periods?from=${addDays(todayLocal, 1)}&to=${addDays(todayLocal, 28)}`,
  );
  let futureDay = '';
  for (const period of ahead.periods) {
    const sheet = await employeeSeed.call<{ days: Array<{ work_date: string; attendance_expected: boolean }> }>(
      'GET',
      `/api/timesheets/${period.payroll_date}`,
    );
    futureDay = sheet.days.find((day) => day.work_date > todayLocal && day.attendance_expected)?.work_date ?? '';
    if (futureDay !== '') break;
  }
  expect(futureDay, 'a future expected workday within four weeks').not.toBe('');

  await signInThroughUi();
  // The sheet's Check words: a past expected day without times says "No times" (status key missing).
  await expect(page.locator(`[data-day="${pastDay}"]`)).toContainText('No times');
  await expect(page.locator(`[data-day="${pastDay}"] [data-check="missing"]`)).toHaveCount(1);
  const next = page.getByRole('button', { name: 'Next period' });
  const row = page.locator(`[data-day="${futureDay}"]`);
  for (let step = 0; step < 4 && (await row.count()) === 0; step += 1) {
    await next.click();
    await expect(page.locator('[data-day]')).toHaveCount(14);
  }
  await expect(row).toBeVisible();
  await expect(row).toContainText('Upcoming');
  await expect(row.locator('[data-check="upcoming"]')).toHaveCount(1);
  await expect(row).not.toContainText('No times');
  await expect(row).not.toContainText('Missing record');
  await expect(row.locator('[data-check="missing"]')).toHaveCount(0);
  await expect(row.locator('[data-ot="pending"]')).toHaveCount(0);
  await expect(row).not.toContainText('pending');
  await row.scrollIntoViewIfNeeded();
  await snap(page, 'upcoming-days', project);

  // The editor shows the same state for that day.
  await row.getByRole('button', { name: `Edit ${futureDay}` }).click();
  const editor = page.getByRole('dialog', { name: /Day editor/ });
  await expect(figure(editor, 'status')).toContainText('upcoming');
});

test('mobile: the editor fits the screen and every control is at least 44 by 44', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The 44px target rule applies to the mobile project');
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  const editor = await openEditor(page, date);
  await editor.getByRole('button', { name: 'Add session' }).click();
  const form = editor.getByRole('form', { name: 'New session' });
  await form.getByLabel('Start time', { exact: true }).fill('09:00');
  await form.getByRole('button', { name: 'Suggest breaks' }).click();
  await expect(form.locator('[data-break]')).toHaveCount(3);
  await snap(page, 'day-editor-mobile', 'mobile');

  const overflow = await page.evaluate<{ page: number; dialog: number }>(`(() => {
    const dialog = document.querySelector('dialog[open]');
    return {
      page: document.documentElement.scrollWidth - window.innerWidth,
      dialog: dialog === null ? -1 : dialog.scrollWidth - dialog.clientWidth,
    };
  })()`);
  expect(overflow.page).toBeLessThanOrEqual(0);
  expect(overflow.dialog).toBeLessThanOrEqual(0);

  const controls = editor.locator('button, select, textarea, label.inline, input:not([type="checkbox"]):not([type="radio"])');
  const count = await controls.count();
  expect(count).toBeGreaterThan(20);
  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    if (!(await control.isVisible())) continue;
    const box = await control.boundingBox();
    const name = await control.evaluate((element) => `${element.tagName} ${element.getAttribute('aria-label') ?? element.textContent?.slice(0, 30) ?? ''}`);
    expect(box?.height ?? 0, `height of ${name}`).toBeGreaterThanOrEqual(43.5);
    if ((await control.evaluate((element) => element.tagName)) === 'BUTTON') {
      expect(box?.width ?? 0, `width of ${name}`).toBeGreaterThanOrEqual(43.5);
    }
  }
});
