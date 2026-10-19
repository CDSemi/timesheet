import type { Locator, Page } from '@playwright/test';
import { addDays, isoWeekday } from '../../src/domain/dates.ts';
import { dateTimeIn, instantOfWallTime, wallTimeIn } from '../client/zoneOracle.ts';
import { namedDayButton } from './dayButton.ts';
import { type BuiltServer, expect, newPerson, type Person, screenshotPath, SeedClient, test } from './fixtures.ts';

/*
 * Day editor on both projects: manual sessions with an explicit input zone, DST fold and gap
 * choices and an explicit overnight end date; break suggestions; Check in and Check out with
 * break confirmation and a stale version; category, partial leave and WFH with the OT mismatch
 * notice; the reason prompt for old periods; and future days shown as upcoming. WP5-UX-T04: the
 * editor is a non-modal side panel on a desktop and a modal bottom sheet on a phone (focus in and
 * back out), "Confirm breaks" sends the same session update the one-tap buttons sent, and the sheet's
 * label cell is a picker that previews and commits one batch entry (reason and conflicts unchanged).
 * WP5-UX3-T08: sessions are added and edited in the session dialog (pre-fill, break rows, the
 * "No breaks listed" notice, the "Save this session?" and "Discard your changes?" confirmations).
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
  await expect(editor.getByRole('heading', { name: 'Figures (computed by the server)' })).toBeVisible();
  return editor;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** The panel title of an accounting date (`Mon 10/12/2026`), written out here so the test does not reuse the app's formatter. */
function editorTitleOf(date: string): string {
  return `${WEEKDAY_NAMES[isoWeekday(date) - 1] ?? ''} ${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
}

function figure(editor: Locator, name: string): Locator {
  return editor.locator(`[data-figure="${name}"]`);
}

/** Clocks in through the UI and waits until the server shows the running session and a positive length. */
async function clockIn(page: Page, seed: SeedClient, todayLocal: string) {
  await page.getByRole('button', { name: 'Check in' }).click();
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

/*
 * WP5-UX3-T08 (U-21, U-24 to U-26): a session is added and edited in its own modal dialog, named "New session" or "Edit
 * session", and every Save goes through the final "Save this session?" confirmation before anything is sent.
 */
function sessionDialog(page: Page, name: 'New session' | 'Edit session'): Locator {
  return page.getByRole('dialog', { name, exact: true });
}

function saveConfirmation(page: Page): Locator {
  return page.getByRole('alertdialog', { name: 'Save this session?' });
}

function noBreaksNotice(page: Page): Locator {
  return page.getByRole('alertdialog', { name: 'No breaks listed' });
}

async function chooseNoBreaks(form: Locator) {
  await form.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
}

/** Save in the session dialog (the listed breaks or the ticked box: no notice), then Save in "Save this session?". */
async function saveSession(page: Page, form: Locator): Promise<void> {
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  const confirm = saveConfirmation(page);
  await expect(confirm).toBeVisible();
  await expect(noBreaksNotice(page)).toHaveCount(0);
  await confirm.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(confirm).toHaveCount(0);
}

/** Removes every listed break row (the pre-filled suggestions of a past day, for example). */
async function removeAllBreaks(form: Locator): Promise<void> {
  const rows = form.locator('[data-break]');
  for (let count = await rows.count(); count > 0; count -= 1) {
    await form.getByRole('button', { name: `Remove break ${count}`, exact: true }).click();
  }
  await expect(rows).toHaveCount(0);
}

/** The value of the start time of break n, the minutes and its computed end text. */
function breakRow(form: Locator, index: number): { row: Locator; date: Locator; time: Locator; minutes: Locator } {
  return {
    row: form.locator(`[data-break="${index}"]`),
    date: form.getByLabel(`Break ${index} date`, { exact: true }),
    time: form.getByLabel(`Break ${index} start time`, { exact: true }),
    minutes: form.getByLabel(`Break ${index} minutes`, { exact: true }),
  };
}

test('09:00 to 18:00 with breaks shifted by arrival: unknown stays pending, confirmed gives R 8h 00m and credit 0', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const posts: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === `/api/days/${date}/sessions`) posts.push(request.postDataJSON() as Record<string, unknown>);
  });
  try {
    await signInThroughUi();
    // The grid (desktop) or the day list (mobile) opens the editor.
    await namedDayButton(page, date, 'Edit').click();
    const editor = page.getByRole('dialog', { name: /Day editor/ });
    await expect(editor).toBeVisible();
    await expect(editor.getByText('No session recorded for this day.')).toBeVisible();
    // WP5-UX3-T07 (U-19): the long accounting-date sentence is gone; the title is the accounting date and a chip names the reporting zone.
    await expect(editor.getByRole('heading', { level: 2 })).toHaveText(`Day editor ${editorTitleOf(date)} ${date}`);
    await expect(editor.getByRole('list', { name: 'About this day' }).getByText(`Day in ${LA}`)).toBeVisible();

    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await expect(form).toBeVisible();
    expect(await form.evaluate((element) => element.matches(':modal')), 'the session dialog is modal').toBe(true);
    // R-07: the default is the current display zone; Los Angeles is chosen explicitly below.
    await expect(form.getByLabel('Input zone')).toHaveValue(await browserZone(page));
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('09:00');
    await form.getByLabel('End time', { exact: true }).fill('18:00');

    // R-02: the pre-filled suggestions of this past day follow the 09:00 arrival to 11:00, 13:00 and 15:30 (15, 30 and 15 minutes).
    const expected = [
      ['11:00', '15', 'ends 11:15'],
      ['13:00', '30', 'ends 13:30'],
      ['15:30', '15', 'ends 15:45'],
    ] as const;
    await expect(form.locator('[data-break]')).toHaveCount(3);
    for (const [index, [from, minutes, end]] of expected.entries()) {
      const row = breakRow(form, index + 1);
      await expect(row.time).toHaveValue(from);
      await expect(row.minutes).toHaveValue(minutes);
      await expect(row.row).toContainText(end);
      await expect(row.row).toContainText('suggested');
    }
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();

    // Unknown stays possible: with no break listed and the box unticked, Save asks first and can leave the breaks unconfirmed.
    await removeAllBreaks(form);
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    await noBreaksNotice(page).getByRole('button', { name: 'Leave breaks unconfirmed for now' }).click();
    const unknown = saveConfirmation(page);
    await expect(unknown.locator('.confirm-facts')).toContainText('Breaks not confirmed: OT for this day stays pending');
    await expect(unknown).not.toHaveAccessibleDescription(/Saving confirms/);
    expect(posts, 'nothing is sent before the final Save').toEqual([]);
    await unknown.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ breaks: [], breaks_confirmed: false, input_zone: LA });
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

    // Confirm the suggested breaks of the saved session (edit with the version it loaded): with rows listed, Save goes straight to the final confirmation.
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = sessionDialog(page, 'Edit session');
    await expect(edit.locator('[data-break]')).toHaveCount(0);
    await edit.getByRole('button', { name: 'Suggest breaks' }).click();
    await expect(breakRow(edit, 3).time).toHaveValue('15:30');
    await expect(breakRow(edit, 3).row).toContainText('ends 15:45');
    await edit.getByRole('button', { name: 'Save', exact: true }).click();
    const confirmed = saveConfirmation(page);
    await expect(noBreaksNotice(page)).toHaveCount(0);
    await expect(confirmed.locator('.confirm-facts')).toContainText('3 breaks (15, 30, 15 min)');
    await expect(confirmed.locator('.confirm-facts')).toContainText(`09:00-18:00 (${LA})`);
    await expect(confirmed).toHaveAccessibleDescription('Saving confirms these breaks as the breaks you took.');
    await confirmed.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    // R 480 and credit 0, exactly as the server shows them; the card says the breaks are confirmed.
    await expect(editor.locator('.session-card [data-session-state]')).toHaveText('Breaks confirmed');
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
    const chips = editor.getByRole('list', { name: 'About this day' });
    await expect(chips.getByText(`Day in ${LA}`)).toBeVisible();
    await expect(chips.getByText(`Times in ${displayZone}`)).toBeVisible();
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    // The explanation of the input zone moved next to the field where the zone is chosen.
    await expect(form.getByText(`they are shown in ${displayZone} elsewhere`)).toBeVisible();
    await expect(form.getByLabel('Input zone')).toHaveValue(displayZone);
    // Both zones stay available to choose.
    await expect(editor.locator('datalist option[value="America/Los_Angeles"]')).toHaveCount(1);
    await expect(editor.locator(`datalist option[value="${displayZone}"]`)).toHaveCount(1);

    // 22:00 to 23:30 in the display zone is the same instant as another wall time in Los Angeles
    // (08:00 to 09:30 under PDT, 07:00 to 08:30 under PST). The expectation is derived with Intl from
    // the real date, so the test holds in every season; the accounting date stays the same either way.
    // The pre-filled end (17:00 in Los Angeles) lies on the next date in the display zone, so the end date is typed too.
    await form.getByLabel('Start date', { exact: true }).fill(date);
    await form.getByLabel('Start time', { exact: true }).fill('22:00');
    await form.getByLabel('End date', { exact: true }).fill(date);
    await form.getByLabel('End time', { exact: true }).fill('23:30');
    await chooseNoBreaks(form);
    await saveSession(page, form);
    await expect(editor.getByText('Session saved.')).toBeVisible();
    await expect(editor.getByText(`Entered by hand in ${displayZone}`)).toBeVisible();
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
    const edit = sessionDialog(page, 'Edit session');
    await expect(edit.getByLabel('Input zone')).toHaveValue(displayZone);
    // Nothing changed, so Cancel closes at once.
    await edit.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(edit).toHaveCount(0);

    // The default can still be changed explicitly: the same kind of wall time typed in Los Angeles is another instant.
    await editor.getByRole('button', { name: 'Add session' }).click();
    const second = sessionDialog(page, 'New session');
    await expect(second.getByLabel('Input zone')).toHaveValue(displayZone);
    await typeInputZone(second, LA);
    // Untouched pre-filled times follow the input zone: the reference hours read as typed in Los Angeles.
    await expect(second.getByLabel('Start date', { exact: true })).toHaveValue(date);
    await expect(second.getByLabel('Start time', { exact: true })).toHaveValue('08:00');
    await expect(second.getByLabel('End time', { exact: true })).toHaveValue('17:00');
    await second.getByLabel('Start time', { exact: true }).fill('03:00');
    await second.getByLabel('End time', { exact: true }).fill('04:00');
    await chooseNoBreaks(second);
    await saveSession(page, second);
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
    const form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('22:00');
    await form.getByLabel('End time', { exact: true }).fill('03:00');
    await chooseNoBreaks(form);
    // The end date still equals the start date, so the server refuses an end before the start (after the final confirmation).
    await expect(form.locator('[data-overnight]')).toHaveCount(0);
    await saveSession(page, form);
    await expect(form.getByRole('alert')).toContainText('end_not_after_start');

    await form.getByLabel('End date', { exact: true }).fill(nextDate);
    await expect(form.locator('[data-overnight]')).toContainText(`ends on ${nextDate}`);
    await expect(form.locator('[data-overnight]')).toContainText(`accounting date ${workDate}`);
    await snap(page, 'day-editor-overnight', project);
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    // The confirmation shows the later end date as +1.
    await expect(saveConfirmation(page).locator('.confirm-facts')).toContainText(`22:00-03:00+1 (${LA})`);
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();

    const stored = (await employeeSeed.dayView(workDate)).sessions[0];
    // 22:00 to 03:00 the next day is 5 hours of elapsed time, kept on the starting accounting date.
    expect(wallClock(stored?.start_utc ?? '', LA)).toBe('22:00:00');
    expect(wallClock(stored?.end_utc ?? '', LA)).toBe('03:00:00');
    expect((Date.parse(stored?.end_utc ?? '') - Date.parse(stored?.start_utc ?? '')) / 1000).toBe(5 * 3600);
    await expect(editor.locator('.session-card')).toHaveCount(1);
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
    const form = sessionDialog(page, 'New session');
    // The old period's reason is the editor's one reason state: the dialog shows the same field with the same words.
    await expect(form.getByLabel('Reason for editing an old or finalized period')).toHaveValue('Entering a past Sydney shift');
    await form.getByLabel('Input zone').fill('Australia/Sydney');
    await form.getByLabel('Start date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('End time', { exact: true }).fill('04:30');
    await chooseNoBreaks(form);

    // The question comes before any confirmation: nothing is asked or sent until the time is placed.
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(saveConfirmation(page)).toHaveCount(0);
    const prompt = form.locator('[data-problem="fold"]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('happens twice in Australia/Sydney');
    await expect(prompt.getByRole('radio', { name: 'Earlier time, UTC offset +11:00' })).not.toBeChecked();
    await expect(prompt.getByRole('radio', { name: 'Later time, UTC offset +10:00' })).not.toBeChecked();
    expect((await employeeSeed.dayView(FOLD_DAY)).sessions).toHaveLength(0);
    await snap(page, 'day-editor-dst-fold', project);

    await prompt.getByRole('radio', { name: 'Later time, UTC offset +10:00' }).check();
    await saveSession(page, form);
    await expect(editor.getByText('Session saved.')).toBeVisible();

    // The server stored the later instant: 02:30 at +10:00 is 16:30 UTC on the 4th; the end is 04:30 +10:00.
    const stored = (await employeeSeed.dayView(FOLD_DAY)).sessions[0];
    expect(stored?.start_utc).toBe('2026-04-04T16:30:00Z');
    expect(stored?.end_utc).toBe('2026-04-04T18:30:00Z');
    expect(stored?.input_zone).toBe('Australia/Sydney');
    // Editing the saved session pins its instant, so the question does not come back.
    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = sessionDialog(page, 'Edit session');
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('02:30');
    await saveSession(page, edit);
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
    const edit = sessionDialog(page, 'Edit session');
    await expect(edit.getByLabel('Input zone')).toHaveValue(LA);
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('09:00');

    // Nothing is saved by changing the zone; the wall times stay as typed and mean London times now.
    await typeInputZone(edit, LONDON);
    await expect(edit.getByLabel('Start time', { exact: true })).toHaveValue('09:00');
    await expect(edit.getByLabel('End time', { exact: true })).toHaveValue('18:00');
    await expect(breakRow(edit, 1).time).toHaveValue('11:00');
    expect((await employeeSeed.dayView(date)).sessions[0]?.start_utc).toBe(before?.start_utc);
    await snap(page, 'day-editor-zone-change', project);
    await saveSession(page, edit);
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
    const edit = sessionDialog(page, 'Edit session');
    await edit.getByLabel('Start time', { exact: true }).fill('09:15');
    // A saved session's rows do not follow the start (only a new session's untouched suggestions do).
    await expect(breakRow(edit, 1).time).toHaveValue('11:00');
    await saveSession(page, edit);
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
    const form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End time', { exact: true }).fill('04:30');
    await chooseNoBreaks(form);
    await saveSession(page, form);
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const before = (await employeeSeed.dayView(day)).sessions[0];
    expect(before?.start_utc).toBe('2026-04-05T09:30:00Z');

    await editor.getByRole('button', { name: /^Edit session/ }).click();
    const edit = sessionDialog(page, 'Edit session');
    await typeInputZone(edit, 'Australia/Sydney');
    await edit.getByRole('button', { name: 'Save', exact: true }).click();
    // The repeated time is not guessed from the Los Angeles offset: the dialog asks, and nothing is confirmed or saved.
    const prompt = edit.locator('[data-problem="fold"]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('happens twice in Australia/Sydney');
    await expect(saveConfirmation(page)).toHaveCount(0);
    expect((await employeeSeed.dayView(day)).sessions[0]?.start_utc).toBe(before?.start_utc);

    await prompt.getByRole('radio', { name: 'Earlier time, UTC offset +11:00' }).check();
    await saveSession(page, edit);
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
    const form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('02:30');
    await form.getByLabel('End time', { exact: true }).fill('05:00');
    await chooseNoBreaks(form);
    await form.getByRole('button', { name: 'Save', exact: true }).click();

    const prompt = form.locator('[data-problem="gap"]');
    await expect(prompt).toContainText(`2026-03-08 02:30 does not exist in ${LA}`);
    await expect(saveConfirmation(page)).toHaveCount(0);
    expect((await employeeSeed.dayView(GAP_DAY)).sessions).toHaveLength(0);
    await snap(page, 'day-editor-dst-gap', project);

    await prompt.getByRole('button', { name: 'Use 03:30 on 2026-03-08' }).click();
    await expect(form.getByLabel('Start time', { exact: true })).toHaveValue('03:30');
    await expect(form.locator('[data-problem="gap"]')).toHaveCount(0);
    await saveSession(page, form);
    await expect(editor.getByText('Session saved.')).toBeVisible();
    // 03:30 PDT (-07:00) is 10:30 UTC.
    expect((await employeeSeed.dayView(GAP_DAY)).sessions[0]?.start_utc).toBe('2026-03-08T10:30:00Z');
  } finally {
    await employeeSeed.clearSessions(GAP_DAY);
  }
});

/* ---- WP5-UX3-T08: pre-fill, the G-4 notice, Cancel, break rows ------------------------------------------------- */

/** The POST bodies the page sends to create sessions on a date. */
function recordSessionPosts(page: Page, date: string): Array<Record<string, unknown>> {
  const posts: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === `/api/days/${date}/sessions`) posts.push(request.postDataJSON() as Record<string, unknown>);
  });
  return posts;
}

test('a new session on a past day is pre-filled with the reference hours and the suggested breaks inside them; today gets the hours only, whatever the device zone (U-23, G-3 a)', async ({
  page,
  employeeSeed,
  signInThroughUi,
  isMobile,
}, testInfo) => {
  const project = testInfo.project.name;
  const [past = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const posts = recordSessionPosts(page, past);
  await signInThroughUi();
  const displayZone = await browserZone(page);
  expect(displayZone, 'the device zone differs from the reporting zone').not.toBe(LA);
  const editor = await openEditor(page, past);
  const add = editor.getByRole('button', { name: 'Add session' });
  await add.click();
  const form = sessionDialog(page, 'New session');
  await expect(form).toHaveAccessibleDescription(`${editorTitleOf(past)} · accounting date in ${LA}`);
  // The reference hours 08:00-17:00 are wall-clock times on the accounting date in Los Angeles, shown in the input zone (the display zone).
  const start = wallTimeIn(past, '08:00', LA, displayZone);
  const end = wallTimeIn(past, '17:00', LA, displayZone);
  await expect(form.getByLabel('Start date', { exact: true })).toHaveValue(start.slice(0, 10));
  await expect(form.getByLabel('Start time', { exact: true })).toHaveValue(start.slice(11));
  await expect(form.getByLabel('End date', { exact: true })).toHaveValue(end.slice(0, 10));
  await expect(form.getByLabel('End time', { exact: true })).toHaveValue(end.slice(11));
  await expect(form.locator('[data-prefill]')).toHaveText(
    `Pre-filled from your reference hours (08:00-17:00 in ${LA}) and suggested breaks. Change them to the times you worked.`,
  );
  // The three suggested breaks of an 08:00 arrival (10:00, 12:00 and 14:30 in Los Angeles), in the input zone, tagged. In the display
  // zone the reference hours cross local midnight, so each row has its own date (Q6 b); on a phone (390px) the list is chips (T08B).
  await expect(form.locator('[data-break]')).toHaveCount(3);
  await expect(form.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', isMobile ? 'chips' : 'rows');
  for (const [index, [time, minutes]] of [['10:00', '15'], ['12:00', '30'], ['14:30', '15']].entries()) {
    const row = breakRow(form, index + 1);
    const local = wallTimeIn(past, time ?? '', LA, displayZone);
    if (isMobile) {
      const end = new Date(Date.parse(`${local}:00Z`) + Number(minutes) * 60_000).toISOString().slice(11, 16);
      const chip = row.row.getByRole('button');
      await expect(chip).toHaveAccessibleName(`Edit Break ${index + 1} · ${usFullDate(local.slice(0, 10))} ${local.slice(11)} to ${end} suggested`);
      // The name comes from the content (a hidden "Edit", the visible words, a hidden "to" for the arrow), not from aria-label.
      await expect(chip).not.toHaveAttribute('aria-label', /.*/);
    } else {
      await expect(row.date).toHaveValue(local.slice(0, 10));
      await expect(row.time).toHaveValue(local.slice(11));
      await expect(row.minutes).toHaveValue(minutes ?? '');
    }
    await expect(row.row.locator('.break-tag')).toHaveText('suggested');
  }
  await snap(page, 'session-dialog-prefill', project);

  // Read in Los Angeles the same reference hours show as typed; the suggestions follow the start until a row is changed.
  await typeInputZone(form, LA);
  await expect(form.getByLabel('Start time', { exact: true })).toHaveValue('08:00');
  await expect(form.getByLabel('End time', { exact: true })).toHaveValue('17:00');
  await expect(form.locator('[data-prefill]')).toHaveText('Pre-filled from your reference hours (08:00-17:00) and suggested breaks. Change them to the times you worked.');
  await expect(breakRow(form, 1).time).toHaveValue('10:00');
  await form.getByLabel('Start time', { exact: true }).fill('08:30');
  await expect(breakRow(form, 1).time).toHaveValue('10:30');
  await expect(breakRow(form, 3).time).toHaveValue('15:00');
  await breakRow(form, 2).minutes.fill('45');
  await expect(breakRow(form, 2).row.locator('.break-tag')).toHaveCount(0);
  await expect(breakRow(form, 2).row).toContainText('ends 13:15');
  await form.getByLabel('Start time', { exact: true }).fill('09:00');
  await expect(breakRow(form, 1).time, 'an edited list no longer follows the start').toHaveValue('10:30');

  // Cancel after a change asks first: Keep editing (the initial focus) keeps every value, Discard closes and sends nothing.
  const cancel = form.getByRole('button', { name: 'Cancel', exact: true });
  await cancel.click();
  const discard = page.getByRole('alertdialog', { name: 'Discard your changes?' });
  await expect(discard).toBeVisible();
  await expect(discard.getByRole('button')).toHaveText(['Keep editing', 'Discard']);
  await expect(discard.getByRole('button', { name: 'Keep editing' })).toBeFocused();
  await discard.getByRole('button', { name: 'Keep editing' }).click();
  await expect(discard).toHaveCount(0);
  await expect(cancel).toBeFocused();
  await expect(form.getByLabel('Start time', { exact: true })).toHaveValue('09:00');
  await expect(breakRow(form, 2).minutes).toHaveValue('45');
  // The Close button asks the same.
  await form.getByRole('button', { name: 'Close', exact: true }).click();
  await discard.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(add).toBeFocused();
  expect(posts).toEqual([]);
  expect((await employeeSeed.dayView(past)).sessions).toHaveLength(0);
  await editor.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(editor).toHaveCount(0);

  // Today: the day with the Today tag, which the page takes from the server (`today_local`), never from the device clock.
  const before = (await employeeSeed.today()).todayLocal;
  const todayButton = page.locator('.period-bar').getByRole('button', { name: 'Today', exact: true });
  if ((await todayButton.getAttribute('aria-disabled')) !== 'true') await todayButton.click();
  const tagged = page.locator('[data-day].today').first();
  await expect(tagged).toBeVisible();
  const today = (await tagged.getAttribute('data-day')) ?? '';
  const after = (await employeeSeed.today()).todayLocal;
  expect([before, after], 'the page shows the server date as today').toContain(today);
  const deviceDate = await page.evaluate<string>("new Date().toLocaleDateString('en-CA')");
  console.log(`PREFILL server today ${today}, device date ${deviceDate} (${displayZone}), past day ${past}`);
  const todayEditor = await openEditor(page, today);
  await todayEditor.getByRole('button', { name: 'Add session' }).click();
  const todayForm = sessionDialog(page, 'New session');
  const todayStart = wallTimeIn(today, '08:00', LA, displayZone);
  await expect(todayForm.getByLabel('Start date', { exact: true })).toHaveValue(todayStart.slice(0, 10));
  await expect(todayForm.getByLabel('Start time', { exact: true })).toHaveValue(todayStart.slice(11));
  await expect(todayForm.locator('[data-prefill]')).toHaveText(`Pre-filled from your reference hours (08:00-17:00 in ${LA}). Change them to the times you worked.`);
  await expect(todayForm.locator('[data-break]'), 'no break is suggested for today').toHaveCount(0);
  await expect(todayForm.getByText('No breaks listed.')).toBeVisible();
  // Nothing changed, so Cancel closes at once, without a question.
  await todayForm.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(todayForm).toHaveCount(0);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

/*
 * WP5-UX3-FIX2 item 2 (mutant M18): the past-day rule compares the accounting date with the server's `today_local`. The browser
 * clock is fixed to an instant whose device date differs from the server's date at any hour of the day (three days ahead, then a
 * year behind), so a rule that read the device clock fails one of the two phases whatever time the suite runs.
 */
test('the suggested breaks follow the server date and never the device clock: a device clock three days ahead or a year behind changes nothing (U-23, G-3 a)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const [past = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const { todayLocal } = await employeeSeed.today();
  expect(past < todayLocal, 'the past day lies before the server date').toBe(true);
  await signInThroughUi();
  for (const [label, deviceInstant] of [
    ['three days ahead', `${addDays(todayLocal, 3)}T12:00:00Z`],
    ['a year behind', `${addDays(todayLocal, -365)}T12:00:00Z`],
  ] as const) {
    await page.clock.setFixedTime(new Date(deviceInstant));
    const deviceDate = await page.evaluate<string>("new Date().toLocaleDateString('en-CA')");
    expect(deviceDate, `${label}: the device date is not the server date`).not.toBe(todayLocal);
    expect(deviceDate > todayLocal, `${label}: the device date is ${deviceDate > todayLocal ? 'later' : 'earlier'} than the server date`).toBe(label === 'three days ahead');

    // A past day gets the reference hours and the suggested breaks inside them.
    const pastEditor = await openEditor(page, past);
    await pastEditor.getByRole('button', { name: 'Add session' }).click();
    const pastForm = sessionDialog(page, 'New session');
    await expect(pastForm.locator('[data-prefill]'), `${label}: a past day is pre-filled with hours and breaks`).toHaveAttribute('data-prefill', 'hours-breaks');
    await expect(pastForm.locator('[data-break]'), `${label}: a past day gets its suggested breaks`).toHaveCount(3);
    await pastForm.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(pastForm).toHaveCount(0);
    await pastEditor.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(pastEditor).toHaveCount(0);

    // The server's today gets the hours only.
    const todayEditor = await openEditor(page, todayLocal);
    await todayEditor.getByRole('button', { name: 'Add session' }).click();
    const todayForm = sessionDialog(page, 'New session');
    await expect(todayForm.locator('[data-prefill]'), `${label}: the server's today is pre-filled with hours only`).toHaveAttribute('data-prefill', 'hours');
    await expect(todayForm.locator('[data-break]'), `${label}: no break is suggested for the server's today`).toHaveCount(0);
    await todayForm.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(todayForm).toHaveCount(0);
    await todayEditor.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(todayEditor).toHaveCount(0);
  }
});

test('Save with no break listed and the box unticked opens "No breaks listed": Escape and "Go back" return to "Add break"; each choice reaches the final confirmation and sends its body (G-4)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const posts = recordSessionPosts(page, date);
  try {
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    await removeAllBreaks(form);
    const save = form.getByRole('button', { name: 'Save', exact: true });
    const addBreak = form.getByRole('button', { name: 'Add break' });
    await save.click();

    const notice = noBreaksNotice(page);
    await expect(notice).toBeVisible();
    expect(await notice.evaluate((element) => element.matches(':modal')), 'the notice is modal').toBe(true);
    await expect(notice).toHaveAccessibleDescription(/This session has no breaks listed, and "Confirm no breaks taken" is not ticked\. What do you want to do\?/);
    await expect(notice.getByRole('button')).toHaveText(['Confirm no breaks taken', 'Leave breaks unconfirmed for now', 'Go back and add breaks']);
    const back = notice.getByRole('button', { name: 'Go back and add breaks' });
    await expect(back).toBeFocused();
    await expect(saveConfirmation(page)).toHaveCount(0);
    await snap(page, 'session-dialog-no-breaks-notice', project);

    // Escape is "Go back": only the notice closes and focus is on "Add break".
    await page.keyboard.press('Escape');
    await expect(notice).toHaveCount(0);
    await expect(form).toBeVisible();
    await expect(addBreak).toBeFocused();
    await save.click();
    await back.click();
    await expect(notice).toHaveCount(0);
    await expect(addBreak).toBeFocused();

    // "Leave breaks unconfirmed for now": the confirmation says so and has no confirming sentence; Back keeps the values.
    await save.click();
    await notice.getByRole('button', { name: 'Leave breaks unconfirmed for now' }).click();
    const confirm = saveConfirmation(page);
    await expect(confirm).toBeVisible();
    await expect(confirm.locator('.confirm-facts dt')).toHaveText(['Day', 'Time', 'Breaks']);
    await expect(confirm.locator('.confirm-facts dd')).toHaveText([editorTitleOf(date), `08:00-17:00 (${LA})`, 'Breaks not confirmed: OT for this day stays pending']);
    await expect(confirm).toHaveAccessibleDescription('Unconfirmed breaks keep OT for this day pending until you confirm them.');
    await expect(confirm.getByRole('button')).toHaveText(['Back', 'Save']);
    await expect(confirm.getByRole('button', { name: 'Back' })).toBeFocused();
    await confirm.getByRole('button', { name: 'Back' }).click();
    await expect(confirm).toHaveCount(0);
    await expect(save).toBeFocused();
    await expect(form.getByLabel('Start time', { exact: true })).toHaveValue('08:00');
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();

    // "Confirm no breaks taken": the box is ticked in the dialog (seen after Back) and the confirmation says "No breaks taken".
    await save.click();
    await notice.getByRole('button', { name: 'Confirm no breaks taken' }).click();
    await expect(confirm.locator('.confirm-facts dd').nth(2)).toHaveText('No breaks taken');
    await expect(confirm).toHaveAccessibleDescription('Saving confirms these breaks as the breaks you took.');
    await snap(page, 'session-dialog-save-confirmation', project);
    await confirm.getByRole('button', { name: 'Back' }).click();
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).toBeChecked();
    expect(posts, 'nothing is sent before a final Save').toEqual([]);
    // With the box ticked, Save goes straight to the confirmation and sends the empty confirmed list.
    await save.click();
    await expect(confirm).toBeVisible();
    await expect(notice).toHaveCount(0);
    await confirm.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ breaks: [], breaks_confirmed: true, input_zone: LA });
    await expect(editor.locator('.session-card [data-session-state]')).toHaveText(['No breaks taken']);

    // A second session through "Leave breaks unconfirmed for now" sends breaks_confirmed false and keeps OT pending.
    await editor.getByRole('button', { name: 'Add session' }).click();
    const second = sessionDialog(page, 'New session');
    await typeInputZone(second, LA);
    await second.getByLabel('Start time', { exact: true }).fill('18:00');
    await second.getByLabel('End time', { exact: true }).fill('19:00');
    await expect(second.locator('[data-break]'), 'no suggestion fits a one-hour session').toHaveCount(0);
    await second.getByRole('button', { name: 'Save', exact: true }).click();
    await noBreaksNotice(page).getByRole('button', { name: 'Leave breaks unconfirmed for now' }).click();
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(posts).toHaveLength(2);
    expect(posts[1]).toMatchObject({ breaks: [], breaks_confirmed: false, input_zone: LA });
    await expect(editor.locator('[data-banner="attention"]')).toContainText('Breaks are not confirmed yet.');
    await expect(figure(editor, 'credited')).toHaveText('none');
    const stored = await employeeSeed.dayView(date);
    expect(stored.sessions.map((session) => session.breaks_confirmed).sort()).toEqual([false, true]);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('a break that starts at a repeated or a missing local time asks first, naming "Break 1", and stores the chosen instant (R-07)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  try {
    await signInThroughUi();
    // Sydney falls back on 2026-04-05: 02:30 happens twice (+11:00, then +10:00). The session 01:00-05:00 there is on the 4th in Los Angeles.
    let editor = await openEditor(page, FOLD_DAY);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past Sydney shift with a break');
    await editor.getByRole('button', { name: 'Add session' }).click();
    let form = sessionDialog(page, 'New session');
    await form.getByLabel('Input zone').fill('Australia/Sydney');
    await form.getByLabel('Start date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('Start time', { exact: true }).fill('01:00');
    await form.getByLabel('End date', { exact: true }).fill('2026-04-05');
    await form.getByLabel('End time', { exact: true }).fill('05:00');
    await removeAllBreaks(form);
    await form.getByRole('button', { name: 'Add break' }).click();
    let row = breakRow(form, 1);
    // Q6 b: the session starts and ends on 2026-04-05, so the new break has no date field; it is on the start date and focus
    // goes to its first field, the start time.
    await expect(row.date, 'no date field for a same-day session').toHaveCount(0);
    await expect(row.time, 'focus goes to the new break').toBeFocused();
    await row.time.fill('02:30');
    await row.minutes.fill('15');
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    const fold = row.row.locator('[data-problem="fold"]');
    await expect(fold).toContainText('Break 1: 2026-04-05 02:30 happens twice in Australia/Sydney');
    await expect(saveConfirmation(page)).toHaveCount(0);
    await fold.getByRole('radio', { name: 'Later time, UTC offset +10:00' }).check();
    await expect(row.row).toContainText('ends 02:45');
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(saveConfirmation(page).locator('.confirm-facts')).toContainText('1 break (15 min)');
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    const folded = (await employeeSeed.dayView(FOLD_DAY)).sessions[0];
    expect(folded).toMatchObject({ start_utc: '2026-04-04T14:00:00Z', end_utc: '2026-04-04T19:00:00Z', breaks_confirmed: true });
    // The later 02:30 (+10:00) is 16:30 UTC; the end is 15 minutes of elapsed time after it.
    expect(folded?.breaks.map((item) => [item.start_utc, item.end_utc])).toEqual([['2026-04-04T16:30:00Z', '2026-04-04T16:45:00Z']]);
    await editor.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(editor).toHaveCount(0);

    // Los Angeles springs forward on 2026-03-08: 02:30 does not exist. The row offers the first valid time.
    editor = await openEditor(page, GAP_DAY);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past shift with a break');
    await editor.getByRole('button', { name: 'Add session' }).click();
    form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    await form.getByLabel('Start time', { exact: true }).fill('01:00');
    await form.getByLabel('End time', { exact: true }).fill('05:00');
    await removeAllBreaks(form);
    await form.getByRole('button', { name: 'Add break' }).click();
    row = breakRow(form, 1);
    await row.time.fill('02:30');
    await row.minutes.fill('15');
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    const gap = row.row.locator('[data-problem="gap"]');
    await expect(gap).toContainText(`Break 1: 2026-03-08 02:30 does not exist in ${LA}`);
    await gap.getByRole('button', { name: 'Use 03:30 on 2026-03-08' }).click();
    await expect(row.time).toHaveValue('03:30');
    await expect(gap).toHaveCount(0);
    await saveSession(page, form);
    await expect(editor.getByText('Session saved.')).toBeVisible();
    // 03:30 PDT (-07:00) is 10:30 UTC.
    expect((await employeeSeed.dayView(GAP_DAY)).sessions[0]?.breaks.map((item) => [item.start_utc, item.end_utc])).toEqual([['2026-03-08T10:30:00Z', '2026-03-08T10:45:00Z']]);
  } finally {
    await employeeSeed.clearSessions(FOLD_DAY);
    await employeeSeed.clearSessions(GAP_DAY);
  }
});

test('break rows are one line in the 720px dialog and two lines (Break n, then date, time, minutes and remove) at a 430px phone (U-24)', async ({
  page,
  employeeSeed,
  signInThroughUi,
  isMobile,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  const lines: string[] = [];
  for (const width of isMobile ? [430] : [1280, 430]) {
    await page.setViewportSize({ width, height: width < 768 ? 932 : 800 });
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await expect(form.locator('[data-break]')).toHaveCount(3);
    const facts = await form.evaluate((dialog) => {
      const box = (element: { getBoundingClientRect: () => { top: number; bottom: number; left: number; right: number; height: number } } | null) => {
        const rect = element?.getBoundingClientRect();
        return rect === undefined ? { top: 0, bottom: 0, left: 0, right: 0, middle: 0 } : { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, middle: rect.top + rect.height / 2 };
      };
      const body = dialog.querySelector('.session-dialog-body');
      return {
        dialog: dialog.getBoundingClientRect().width,
        overflow: body === null ? 99 : body.scrollWidth - body.clientWidth,
        rows: [...dialog.querySelectorAll('[data-break]')].map((row) => ({
          height: row.getBoundingClientRect().height,
          right: row.getBoundingClientRect().right,
          num: box(row.querySelector('.break-num')),
          date: box(row.querySelector('input[type="date"]')),
          time: box(row.querySelector('input[type="time"]')),
          minutes: box(row.querySelector('input[type="number"]')),
          remove: box(row.querySelector('button.break-remove')),
        })),
      };
    });
    expect(facts.overflow, `${width}px: the dialog body does not scroll sideways`).toBeLessThanOrEqual(0);
    for (const [index, row] of facts.rows.entries()) {
      const name = `${width}px break ${index + 1}`;
      // Date, time, minutes and remove always share one line, inside the row.
      for (const part of [row.time, row.minutes, row.remove]) expect(Math.abs(part.middle - row.date.middle), `${name}: one line of fields`).toBeLessThanOrEqual(2);
      expect(row.remove.right, `${name}: the remove button stays inside the row`).toBeLessThanOrEqual(row.right + 0.5);
      if (width === 1280) {
        expect(Math.abs(row.num.middle - row.date.middle), `${name}: "Break n" on the same line`).toBeLessThanOrEqual(2);
        expect(row.height, `${name}: one line (a two-line row is about 92px)`).toBeLessThan(64);
      } else {
        expect(row.num.bottom, `${name}: "Break n" on its own line above the fields`).toBeLessThanOrEqual(row.date.top + 0.5);
      }
    }
    if (width === 1280) expect(facts.dialog, 'the desktop dialog is 720px wide').toBeCloseTo(720, 0);
    lines.push(`${width}: dialog ${facts.dialog.toFixed(0)}px, row ${(facts.rows[0]?.height ?? 0).toFixed(1)}px`);
    await snap(page, `session-dialog-rows-w${width}`, project);
    await page.keyboard.press('Escape');
    await expect(form).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
  }
  console.log(`BREAK-ROWS ${lines.join('; ')}`);
});

/* ---- WP5-UX3-T08B: the Q6 b date rule, the list layouts by width, the break chips and the "Break n" sub-dialog ---------- */

/** `YYYY-MM-DD` as a chip prints it (`MM/DD/YYYY`), written out here so the test does not reuse the app's formatter. */
function usFullDate(date: string): string {
  return `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
}

/** A wall clock `YYYY-MM-DD HH:mm` plus whole minutes, by arithmetic on the text alone (no zone, so no DST). */
function plusMinutes(local: string, minutes: number): string {
  return new Date(Date.parse(`${local.replace(' ', 'T')}:00Z`) + minutes * 60_000).toISOString().slice(0, 16).replace('T', ' ');
}

/**
 * The accessible name of a chip, from its content (WP5-UX3-FIX1): the hidden "Edit", then the label, the start (with the date for an
 * overnight session), the hidden "to" for the arrow, the end and the tag.
 */
function chipName(index: number, start: string, minutes: number, options: { overnight: boolean; suggested: boolean }): string {
  const from = options.overnight ? `${usFullDate(start.slice(0, 10))} ${start.slice(11)}` : start.slice(11);
  return `Edit Break ${index} · ${from} to ${plusMinutes(start, minutes).slice(11)}${options.suggested ? ' suggested' : ''}`;
}

function breakChip(form: Locator, index: number): Locator {
  return form.locator(`[data-break="${index}"] button.break-chip`);
}

/** The "Break n" sub-dialog, the third modal level. */
function breakDialog(page: Page, index: number): Locator {
  return page.getByRole('dialog', { name: `Break ${index}`, exact: true });
}

async function settleLayout(page: Page) {
  await page.evaluate('new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 100))))');
}

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  middle: number;
}

interface ListFacts {
  layout: string;
  list: number;
  bodyOverflow: number;
  rows: Array<{ height: number; right: number; num: Box | null; date: Box | null; time: Box | null; minutes: Box | null; remove: Box | null; chip: Box | null }>;
}

/** The geometry of the break list in the open session dialog: its layout, its width, and each row's parts. */
function listFacts(form: Locator): Promise<ListFacts> {
  return form.evaluate((dialog): ListFacts => {
    const box = (element: { getBoundingClientRect: () => { top: number; bottom: number; left: number; right: number; width: number; height: number } } | null): Box | null => {
      if (element === null) return null;
      const rect = element.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height, middle: rect.top + rect.height / 2 };
    };
    const list = dialog.querySelector('.break-entries');
    const body = dialog.querySelector('.session-dialog-body');
    return {
      layout: list?.getAttribute('data-layout') ?? 'none',
      list: list === null ? 0 : list.getBoundingClientRect().width,
      bodyOverflow: body === null ? 99 : body.scrollWidth - body.clientWidth,
      rows: [...dialog.querySelectorAll('[data-break]')].map((row) => ({
        height: row.getBoundingClientRect().height,
        right: row.getBoundingClientRect().right,
        num: box(row.querySelector('.break-num')),
        date: box(row.querySelector('input[type="date"]')),
        time: box(row.querySelector('input[type="time"]')),
        minutes: box(row.querySelector('input[type="number"]')),
        remove: box(row.querySelector('button.break-remove')),
        chip: box(row.querySelector('button.break-chip')),
      })),
    };
  });
}

interface SentBreak {
  start: { local: string; zone: string };
  end: { local: string; zone: string };
  counts_as_work: boolean;
}

function breaksOf(body: Record<string, unknown> | undefined): SentBreak[] {
  return (body?.breaks ?? []) as SentBreak[];
}

const SYNTHETIC_REFUSAL = {
  status: 422,
  contentType: 'application/json',
  body: JSON.stringify({ error: { code: 'synthetic_refusal', message: 'Synthetic refusal for the test.' } }),
} as const;

test('Q6 b: a same-day session shows no break date field at 1366 and on a phone and its breaks follow the session date; an overnight session shows the field', async ({
  page,
  employeeSeed,
  signInThroughUi,
  isMobile,
}) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const other = addDays(date, -1);
  const bodies: Array<Record<string, unknown>> = [];
  let refuse = true;
  // The first save is refused by a synthetic answer, so a session on another date is never written; the second goes through.
  await page.route(`**/api/days/${date}/sessions`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    bodies.push(route.request().postDataJSON() as Record<string, unknown>);
    if (refuse) await route.fulfill(SYNTHETIC_REFUSAL);
    else await route.continue();
  });
  try {
    await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1366, height: 800 });
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await typeInputZone(form, LA);
    const list = form.getByRole('list', { name: 'Break list' });
    const dateFields = form.getByLabel(/^Break \d date$/);
    const startDate = form.getByLabel('Start date', { exact: true });
    const endDate = form.getByLabel('End date', { exact: true });

    // Same day (08:00-17:00 in Los Angeles): no date field, the rows are on the session date.
    await expect(form.locator('[data-break]')).toHaveCount(3);
    await expect(list).toHaveAttribute('data-layout', 'rows');
    await expect(dateFields, 'a same-day session has no break date field').toHaveCount(0);
    await expect(list.locator('input[type="date"]')).toHaveCount(0);
    await expect(breakRow(form, 1).time).toHaveValue('10:00');

    // The end moves to the next date: the session crosses local midnight, so each break has its date (chips on a phone).
    await endDate.fill(addDays(date, 1));
    if (isMobile) {
      await expect(list).toHaveAttribute('data-layout', 'chips');
      await expect(breakChip(form, 1)).toHaveAccessibleName(chipName(1, `${date} 10:00`, 15, { overnight: true, suggested: true }));
    } else {
      await expect(dateFields).toHaveCount(3);
      for (const index of [1, 2, 3]) await expect(breakRow(form, index).date).toHaveValue(date);
    }
    await endDate.fill(date);
    await expect(dateFields).toHaveCount(0);
    await expect(list).toHaveAttribute('data-layout', 'rows');

    // Change a break so the suggestions stop following the start, then move the whole session to another date.
    await breakRow(form, 1).minutes.fill('20');
    await startDate.fill(other);
    // Start and end now differ, so the field is back, still on the old date (the end has not moved yet).
    if (isMobile) await expect(breakChip(form, 2)).toHaveAccessibleName(chipName(2, `${date} 12:00`, 30, { overnight: true, suggested: true }));
    else for (const index of [1, 2, 3]) await expect(breakRow(form, index).date).toHaveValue(date);
    await endDate.fill(other);
    await expect(dateFields).toHaveCount(0);
    await expect(list).toHaveAttribute('data-layout', 'rows');
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    // A break left on the old date would lie before the session and be refused here, before the confirmation.
    await expect(saveConfirmation(page), 'the hidden break dates followed the session date, so nothing is refused').toBeVisible();
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => bodies.length).toBe(1);
    // The hidden rows followed the session date: every instant is on `other`, the minutes typed stay.
    expect(bodies[0]).toMatchObject({ start: { local: `${other}T08:00` }, end: { local: `${other}T17:00` }, input_zone: LA });
    expect(breaksOf(bodies[0]).map((item) => [item.start.local, item.end.local])).toEqual([
      [`${other}T10:00`, `${other}T10:20`],
      [`${other}T12:00`, `${other}T12:30`],
      [`${other}T14:30`, `${other}T14:45`],
    ]);
    await expect(saveConfirmation(page)).toHaveCount(0);
    await form.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('alertdialog', { name: 'Discard your changes?' }).getByRole('button', { name: 'Discard', exact: true }).click();
    await expect(form).toHaveCount(0);

    // A same-day session on its own date saves its breaks on that date (nothing hidden is lost on the way to the server).
    refuse = false;
    await editor.getByRole('button', { name: 'Add session' }).click();
    const second = sessionDialog(page, 'New session');
    await typeInputZone(second, LA);
    await expect(second.getByLabel(/^Break \d date$/)).toHaveCount(0);
    await saveSession(page, second);
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(bodies).toHaveLength(2);
    expect(breaksOf(bodies[1]).map((item) => [item.start.local, item.end.local])).toEqual([
      [`${date}T10:00`, `${date}T10:15`],
      [`${date}T12:00`, `${date}T12:30`],
      [`${date}T14:30`, `${date}T14:45`],
    ]);
    const stored = (await employeeSeed.dayView(date)).sessions[0];
    expect(stored?.breaks.map((item) => `${wallClock(item.start_utc, LA)}-${wallClock(item.end_utc, LA)}`)).toEqual(['10:00:00-10:15:00', '12:00:00-12:30:00', '14:30:00-14:45:00']);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('break list layout by its width: one line at 1366, two lines from 430 to 320 for a same-day session, chips where a row no longer fits (U-24, N-1, Q6 b)', async ({
  page,
  employeeSeed,
  signInThroughUi,
  isMobile,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const lines: string[] = [];
  await page.setViewportSize({ width: 430, height: 932 });
  await signInThroughUi();
  const editor = await openEditor(page, date);
  await editor.getByRole('button', { name: 'Add session' }).click();
  const form = sessionDialog(page, 'New session');
  await typeInputZone(form, LA);
  await expect(form.locator('[data-break]')).toHaveCount(3);

  // Same-day rows: the fields line (start time, minutes, remove) shares one line under "Break n", at every phone width, and
  // keeps doing so down to the measured threshold, 268px of list (a 300px window); one pixel less is chips.
  const sameDay: Array<[number, 'rows' | 'chips']> = [[430, 'rows'], [390, 'rows'], [375, 'rows'], [360, 'rows'], [320, 'rows'], [300, 'rows'], [299, 'chips']];
  for (const [width, layout] of sameDay) {
    await page.setViewportSize({ width, height: 932 });
    await settleLayout(page);
    const facts = await listFacts(form);
    const name = `same day, ${width}px`;
    expect(facts.layout, `${name}: layout`).toBe(layout);
    expect(facts.list, `${name}: the list is the window less 2 x 16px of padding`).toBeCloseTo(width - 32, 0);
    expect(facts.bodyOverflow, `${name}: no sideways scroll`).toBeLessThanOrEqual(0);
    for (const [index, row] of facts.rows.entries()) {
      const label = `${name}, break ${index + 1}`;
      if (layout === 'rows') {
        expect(row.date, `${label}: no date field`).toBeNull();
        const parts = [row.time, row.minutes, row.remove];
        for (const part of parts) {
          expect(part, `${label}: part present`).not.toBeNull();
          expect(Math.abs((part?.middle ?? 0) - (row.time?.middle ?? 0)), `${label}: one line of fields`).toBeLessThanOrEqual(2);
          expect(part?.height ?? 0, `${label}: a 44px target`).toBeGreaterThanOrEqual(43.9);
        }
        expect(row.remove?.right ?? 0, `${label}: remove stays inside the strip`).toBeLessThanOrEqual(row.right + 0.5);
        expect(row.num?.bottom ?? 99, `${label}: "Break n" on its own line above the fields`).toBeLessThanOrEqual((row.time?.top ?? 0) + 0.5);
      } else {
        expect(row.chip?.height ?? 0, `${label}: a 44px chip`).toBeGreaterThanOrEqual(43.9);
      }
    }
    lines.push(`same-day ${width}px: ${layout}, list ${facts.list.toFixed(1)}px, row ${(facts.rows[0]?.height ?? 0).toFixed(1)}px`);
  }

  // Overnight (the end on the next date): the date field joins the fields line, which needs 390px of list (a 422px window).
  await endDate(form).fill(addDays(date, 1));
  const overnight: Array<[number, 'rows' | 'chips']> = [[430, 'rows'], [422, 'rows'], [421, 'chips'], [390, 'chips'], [375, 'chips'], [360, 'chips'], [320, 'chips']];
  for (const [width, layout] of overnight) {
    await page.setViewportSize({ width, height: 932 });
    await settleLayout(page);
    const facts = await listFacts(form);
    const name = `overnight, ${width}px`;
    expect(facts.layout, `${name}: layout`).toBe(layout);
    expect(facts.list, `${name}: list width`).toBeCloseTo(width - 32, 0);
    expect(facts.bodyOverflow, `${name}: no sideways scroll`).toBeLessThanOrEqual(0);
    for (const [index, row] of facts.rows.entries()) {
      const label = `${name}, break ${index + 1}`;
      if (layout === 'rows') {
        for (const part of [row.date, row.time, row.minutes, row.remove]) {
          expect(part, `${label}: part present`).not.toBeNull();
          expect(Math.abs((part?.middle ?? 0) - (row.date?.middle ?? 0)), `${label}: one line of fields`).toBeLessThanOrEqual(2);
          expect(part?.height ?? 0, `${label}: a 44px target`).toBeGreaterThanOrEqual(43.9);
        }
        expect(row.remove?.right ?? 0, `${label}: remove stays inside the strip`).toBeLessThanOrEqual(row.right + 0.5);
      } else {
        expect(row.chip?.height ?? 0, `${label}: a 44px chip`).toBeGreaterThanOrEqual(43.9);
        expect(row.chip?.right ?? 0, `${label}: the chip stays inside the strip`).toBeLessThanOrEqual(row.right + 0.5);
      }
    }
    lines.push(`overnight ${width}px: ${layout}, list ${facts.list.toFixed(1)}px, row ${(facts.rows[0]?.height ?? 0).toFixed(1)}px`);
    if (width === 430 || width === 360) await snap(page, `session-dialog-breaks-overnight-w${width}`, project);
  }
  await page.setViewportSize({ width: 360, height: 932 });
  await endDate(form).fill(date);
  await settleLayout(page);
  await snap(page, 'session-dialog-breaks-sameday-w360', project);
  console.log(`BREAK-LAYOUT ${lines.join('; ')}`);

  // From a desktop window both kinds of session keep one line: the dialog is 720px, its list 680px.
  if (!isMobile) {
    await page.setViewportSize({ width: 1366, height: 800 });
    await settleLayout(page);
    for (const crossing of [false, true]) {
      if (crossing) await endDate(form).fill(addDays(date, 1));
      const facts = await listFacts(form);
      expect(facts.layout, `1366px, ${crossing ? 'overnight' : 'same day'}`).toBe('rows');
      for (const row of facts.rows) {
        expect(Math.abs((row.num?.middle ?? 0) - (row.time?.middle ?? 99)), '1366px: "Break n" on the same line').toBeLessThanOrEqual(2);
        expect(row.height, '1366px: one line').toBeLessThan(64);
        expect(row.date !== null, `1366px: the date field is shown only when the session crosses midnight (${crossing})`).toBe(crossing);
      }
    }
  }
});

/** The End date field of the session dialog. */
function endDate(form: Locator): Locator {
  return form.getByLabel('End date', { exact: true });
}

test('phone break chips: names, the Break n sub-dialog with Done, Cancel, Escape, Remove and Add, and where focus goes; nothing is sent before the session Save (N-1)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [past = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await signInThroughUi();
  const writes: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (request.method() !== 'GET' && pathname.startsWith('/api/')) writes.push(`${request.method()} ${pathname}`);
  });
  const displayZone = await browserZone(page);
  const editor = await openEditor(page, past);
  const add = editor.getByRole('button', { name: 'Add session' });
  await add.click();
  const form = sessionDialog(page, 'New session');
  const list = form.getByRole('list', { name: 'Break list' });
  // The reference hours cross local midnight in the display zone, so this is an overnight session: chips with the date.
  await expect(list).toHaveAttribute('data-layout', 'chips');
  const startOf = (time: string) => wallTimeIn(past, time, LA, displayZone);
  const planned = [['10:00', 15], ['12:00', 30], ['14:30', 15]] as const;
  for (const [index, [time, minutes]] of planned.entries()) {
    const chip = breakChip(form, index + 1);
    await expect(chip).toHaveAccessibleName(chipName(index + 1, startOf(time), minutes, { overnight: true, suggested: true }));
    // The visible text is label, start, an arrow, end; the arrow is decoration and the name says "to".
    await expect(chip.locator('.break-chip-main')).toContainText(`Break ${index + 1} · ${usFullDate(startOf(time).slice(0, 10))} ${startOf(time).slice(11)} →`);
    await expect(chip.locator('[aria-hidden="true"]').filter({ hasText: '→' })).toHaveCount(1);
    await expect(chip.locator('.break-tag')).toHaveText('suggested');
    expect((await chip.boundingBox())?.height ?? 0, 'a 44px chip').toBeGreaterThanOrEqual(43.9);
  }
  await expect(form.getByLabel(/^Break \d (date|start time|minutes)$/), 'chips carry no inline fields').toHaveCount(0);
  await snap(page, 'session-dialog-chips', project);

  // Opening a chip: the third modal level on top, focus on its first field (the date of an overnight session).
  const chip2 = breakChip(form, 2);
  const sub = breakDialog(page, 2);
  const field = (name: string) => sub.getByLabel(name, { exact: true });
  await chip2.click();
  await expect(sub).toBeVisible();
  expect(await sub.evaluate((element) => element.matches(':modal')), 'the sub-dialog is modal').toBe(true);
  await expect(field('Date')).toBeFocused();
  await expect(field('Date')).toHaveValue(startOf('12:00').slice(0, 10));
  await expect(field('Start time')).toHaveValue(startOf('12:00').slice(11));
  await expect(field('Minutes')).toHaveValue('30');
  await expect(sub.getByText(/^Ends /)).toHaveText(`Ends ${plusMinutes(startOf('12:00'), 30).slice(11)} (${displayZone})`);
  await expect(sub.getByRole('button')).toHaveText(['Remove break', 'Cancel', 'Done']);
  const stack = await dialogStates(page);
  expect(stack.dialogs.find((dialog) => dialog.name === 'Break 2'), 'the sub-dialog is on top and focused').toMatchObject({ modal: true, focus: true, onTop: true });
  expect(stack.dialogs.find((dialog) => dialog.name === 'New session'), 'the session dialog stays open under it').toMatchObject({ modal: true });
  expect(stack.dialogs.some((dialog) => dialog.name.startsWith('Day editor')), 'the editor stays open under both').toBe(true);
  await snap(page, 'session-dialog-break-subdialog', project);

  // Escape closes only the sub-dialog; the session dialog and the editor ignore it. Focus returns to the chip.
  await page.keyboard.press('Escape');
  await expect(sub).toHaveCount(0);
  await expect(form).toBeVisible();
  await expect(editor).toBeVisible();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(chip2).toBeFocused();

  // Cancel and Escape after an edit discard it; focus returns to the chip.
  const unchanged = chipName(2, startOf('12:00'), 30, { overnight: true, suggested: true });
  for (const how of ['Cancel', 'Escape'] as const) {
    await chip2.click();
    await field('Minutes').fill('45');
    await expect(sub.getByText(/^Ends /)).toHaveText(`Ends ${plusMinutes(startOf('12:00'), 45).slice(11)} (${displayZone})`);
    if (how === 'Cancel') await sub.getByRole('button', { name: 'Cancel', exact: true }).click();
    else await page.keyboard.press('Escape');
    await expect(sub).toHaveCount(0);
    await expect(chip2).toBeFocused();
    await expect(chip2).toHaveAccessibleName(unchanged);
  }
  await chip2.click();
  await expect(field('Minutes'), 'the discarded edit is gone').toHaveValue('30');
  await page.keyboard.press('Escape');

  // Done applies the edit to the draft (the tag goes with the change) and focus goes to the updated chip; nothing is sent.
  await chip2.click();
  await field('Minutes').fill('45');
  await sub.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(sub).toHaveCount(0);
  await expect(chip2).toBeFocused();
  await expect(chip2).toHaveAccessibleName(chipName(2, startOf('12:00'), 45, { overnight: true, suggested: false }));
  await expect(chip2.locator('.break-tag')).toHaveCount(0);
  await expect(breakChip(form, 1).locator('.break-tag')).toHaveText('suggested');
  // Enter in a field is Done.
  const chip3 = breakChip(form, 3);
  await chip3.click();
  await field3(page, 3, 'Minutes').fill('20');
  await field3(page, 3, 'Minutes').press('Enter');
  await expect(breakDialog(page, 3)).toHaveCount(0);
  await expect(chip3).toHaveAccessibleName(chipName(3, startOf('14:30'), 20, { overnight: true, suggested: false }));
  await expect(chip3).toBeFocused();
  expect(writes, 'Done sends nothing').toEqual([]);

  // Add break: a new row on the session start date opens its sub-dialog; Cancel removes it and focus goes to Add break.
  const addBreak = form.getByRole('button', { name: 'Add break' });
  await addBreak.click();
  const sub4 = breakDialog(page, 4);
  await expect(sub4).toBeVisible();
  await expect(form.locator('[data-break]')).toHaveCount(4);
  await expect(field3(page, 4, 'Date')).toBeFocused();
  await expect(field3(page, 4, 'Date')).toHaveValue(startOf('08:00').slice(0, 10));
  await expect(field3(page, 4, 'Start time')).toHaveValue('');
  await expect(field3(page, 4, 'Minutes')).toHaveValue('');
  await sub4.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(sub4).toHaveCount(0);
  await expect(form.locator('[data-break]')).toHaveCount(3);
  await expect(addBreak).toBeFocused();
  // Add break, fill it in on the date of the first break, Done: the new chip is named and focused.
  await addBreak.click();
  await field3(page, 4, 'Date').fill(startOf('10:00').slice(0, 10));
  await field3(page, 4, 'Start time').fill('03:00');
  await field3(page, 4, 'Minutes').fill('10');
  await sub4.getByRole('button', { name: 'Done', exact: true }).click();
  const chip4 = breakChip(form, 4);
  await expect(chip4).toHaveAccessibleName(chipName(4, `${startOf('10:00').slice(0, 10)} 03:00`, 10, { overnight: true, suggested: false }));
  await expect(chip4).toBeFocused();

  // Remove: focus goes to the next chip, else the previous, else Add break.
  await chip4.click();
  await breakDialog(page, 4).getByRole('button', { name: 'Remove break', exact: true }).click();
  await expect(form.locator('[data-break]')).toHaveCount(3);
  await expect(chip3, 'the last chip removed: focus goes to the previous').toBeFocused();
  await chip2.click();
  await sub.getByRole('button', { name: 'Remove break', exact: true }).click();
  await expect(form.locator('[data-break]')).toHaveCount(2);
  await expect(breakChip(form, 2), 'a middle chip removed: focus goes to the next, now Break 2').toBeFocused();
  await expect(breakChip(form, 2)).toHaveAccessibleName(chipName(2, startOf('14:30'), 20, { overnight: true, suggested: false }));
  await breakChip(form, 2).click();
  await breakDialog(page, 2).getByRole('button', { name: 'Remove break', exact: true }).click();
  await expect(breakChip(form, 1)).toBeFocused();
  await breakChip(form, 1).click();
  await breakDialog(page, 1).getByRole('button', { name: 'Remove break', exact: true }).click();
  await expect(form.locator('[data-break]')).toHaveCount(0);
  await expect(addBreak, 'the only chip removed: focus goes to Add break').toBeFocused();
  await expect(form.getByText('No breaks listed.')).toBeVisible();
  expect(writes, 'nothing is sent before the session Save').toEqual([]);

  // Leaving the dialog asks, because the breaks changed; nothing was ever sent.
  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('alertdialog', { name: 'Discard your changes?' }).getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(add).toBeFocused();
  expect(writes).toEqual([]);
  expect((await employeeSeed.dayView(past)).sessions).toHaveLength(0);
});

/** A field of the open "Break n" sub-dialog. */
function field3(page: Page, index: number, name: 'Date' | 'Start time' | 'Minutes'): Locator {
  return breakDialog(page, index).getByLabel(name, { exact: true });
}

test('phone break chips: a row that cannot be saved and a server refusal mark the chip, show the message under it and move focus; the saved request has the same shape and values', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const [past = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  const bodies: Array<Record<string, unknown>> = [];
  let live = false;
  await page.route(`**/api/days/${past}/sessions`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    bodies.push(route.request().postDataJSON() as Record<string, unknown>);
    if (live) await route.continue();
    else {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'break_outside_session', message: 'A break lies outside the session.', details: { break_index: 1 } } }),
      });
    }
  });
  try {
    await signInThroughUi();
    const displayZone = await browserZone(page);
    const editor = await openEditor(page, past);
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await expect(form.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', 'chips');
    const startOf = (time: string) => wallTimeIn(past, time, LA, displayZone);
    const save = form.getByRole('button', { name: 'Save', exact: true });
    const entry = (index: number) => form.locator(`[data-break="${index}"]`);

    // Break 3 gets the start time of Break 2: it overlaps. Save is refused before the confirmation.
    await breakChip(form, 3).click();
    await field3(page, 3, 'Start time').fill(startOf('12:00').slice(11));
    await breakDialog(page, 3).getByRole('button', { name: 'Done', exact: true }).click();
    await save.click();
    await expect(saveConfirmation(page)).toHaveCount(0);
    await expect(entry(3)).toHaveClass(/has-error/);
    await expect(entry(1)).not.toHaveClass(/has-error/);
    await expect(entry(3).getByText('Break 3 overlaps Break 2.')).toBeVisible();
    await expect(breakChip(form, 3), 'the message is the chip\'s description').toHaveAccessibleDescription('Break 3 overlaps Break 2.');
    await expect(breakChip(form, 3), 'focus moves to the first marked chip').toBeFocused();
    await expect(form.getByRole('alert')).toContainText('A break cannot be saved as it is.');
    await snap(page, 'session-dialog-chip-error', test.info().project.name);
    // The sub-dialog shows the same message, and the message goes once the break is changed.
    await breakChip(form, 3).click();
    await expect(breakDialog(page, 3).getByText('Break 3 overlaps Break 2.')).toBeVisible();
    await field3(page, 3, 'Start time').fill(startOf('14:30').slice(11));
    await expect(breakDialog(page, 3).getByText('Break 3 overlaps Break 2.')).toHaveCount(0);
    await breakDialog(page, 3).getByRole('button', { name: 'Done', exact: true }).click();
    await expect(entry(3)).not.toHaveClass(/has-error/);

    // A refusal from the server that names a break (break_index 1 is Break 2) marks that chip and moves focus to it.
    await save.click();
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => bodies.length).toBe(1);
    await expect(saveConfirmation(page)).toHaveCount(0);
    await expect(entry(2)).toHaveClass(/has-error/);
    await expect(entry(2).getByText('Break 2 lies outside the session.')).toBeVisible();
    await expect(breakChip(form, 2)).toHaveAccessibleDescription('Break 2 lies outside the session.');
    await expect(breakChip(form, 2)).toBeFocused();

    // Saved for real: the same body shape as the rows send, the local values typed or pinned, nothing else.
    live = true;
    await save.click();
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(bodies).toHaveLength(2);
    const body = bodies[1];
    expect(Object.keys(body ?? {}).sort()).toEqual(['breaks', 'breaks_confirmed', 'end', 'input_zone', 'start']);
    expect(body).toMatchObject({ input_zone: displayZone, breaks_confirmed: true, start: { local: startOf('08:00').replace(' ', 'T'), zone: displayZone }, end: { local: startOf('17:00').replace(' ', 'T'), zone: displayZone } });
    expect(breaksOf(body).map((item) => [item.start.local, item.end.local, item.start.zone, item.counts_as_work])).toEqual(
      [['10:00', 15], ['12:00', 30], ['14:30', 15]].map(([time, minutes]) => [
        startOf(String(time)).replace(' ', 'T'),
        plusMinutes(startOf(String(time)), Number(minutes)).replace(' ', 'T'),
        displayZone,
        false,
      ]),
    );
    const stored = (await employeeSeed.dayView(past)).sessions[0];
    expect(stored?.breaks).toHaveLength(3);
    expect(stored?.breaks_confirmed).toBe(true);
  } finally {
    await employeeSeed.clearSessions(past);
  }
});

test('the Break n sub-dialog fits a 320px window: no sideways scroll, a wrapping foot, 44px targets', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await page.setViewportSize({ width: 320, height: 640 });
  await signInThroughUi();
  const editor = await openEditor(page, date);
  await editor.getByRole('button', { name: 'Add session' }).click();
  const form = sessionDialog(page, 'New session');
  await expect(form.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', 'chips');
  await breakChip(form, 1).click();
  const sub = breakDialog(page, 1);
  await expect(sub).toBeVisible();
  const facts = await sub.evaluate((dialog) => {
    const rect = dialog.getBoundingClientRect();
    const controls = [...dialog.querySelectorAll('input, button')].map((control) => {
      const box = control.getBoundingClientRect();
      return { name: control.textContent || control.getAttribute('type') || '', width: box.width, height: box.height, right: box.right };
    });
    return { left: rect.left, right: rect.right, scroll: dialog.scrollWidth - dialog.clientWidth, controls };
  });
  expect(facts.left, 'inside the window').toBeGreaterThanOrEqual(0);
  expect(facts.right, 'inside the window').toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  expect(facts.scroll, 'no sideways scroll in the sub-dialog').toBeLessThanOrEqual(0);
  for (const control of facts.controls) {
    expect(control.height, `${control.name}: 44px high`).toBeGreaterThanOrEqual(43.9);
    expect(control.right, `${control.name}: inside the dialog`).toBeLessThanOrEqual(facts.right + 0.5);
  }
  expect(await page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth'), 'the page does not scroll sideways').toBeLessThanOrEqual(0);
  await page.keyboard.press('Escape');
  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(form).toHaveCount(0);
});

test('phone break chips: a break at a repeated or a missing local time asks inside the sub-dialog, naming "Break 1", and stores the chosen instant (R-07)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  /** Opens a new overnight session (it ends the next day, so the list shows chips) with no break listed. */
  async function newOvernightSession(day: string, zone: string, from: [string, string], to: [string, string]) {
    const editor = await openEditor(page, day);
    await editor.getByLabel('Reason for editing an old or finalized period').fill('Entering a past shift with a break (synthetic)');
    await editor.getByRole('button', { name: 'Add session' }).click();
    const form = sessionDialog(page, 'New session');
    await form.getByLabel('Input zone').fill(zone);
    await form.getByLabel('Start date', { exact: true }).fill(from[0]);
    await form.getByLabel('Start time', { exact: true }).fill(from[1]);
    await form.getByLabel('End date', { exact: true }).fill(to[0]);
    await form.getByLabel('End time', { exact: true }).fill(to[1]);
    await expect(form.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', 'chips');
    // Remove the pre-filled suggestions through each sub-dialog, then add the one break.
    for (let count = await form.locator('[data-break]').count(); count > 0; count -= 1) {
      await breakChip(form, 1).click();
      await breakDialog(page, 1).getByRole('button', { name: 'Remove break', exact: true }).click();
    }
    await expect(form.locator('[data-break]')).toHaveCount(0);
    await form.getByRole('button', { name: 'Add break' }).click();
    return { editor, form, sub: breakDialog(page, 1) };
  }
  try {
    await signInThroughUi();
    // Sydney falls back on 2026-04-05: 02:30 happens twice (+11:00, then +10:00). The session runs from 22:00 on the 4th to 05:00
    // on the 5th (it crosses local midnight, so the list is chips and the sub-dialog has a Date); the break is the later 02:30.
    const fold = await newOvernightSession(FOLD_DAY, 'Australia/Sydney', ['2026-04-04', '22:00'], ['2026-04-05', '05:00']);
    await expect(field3(page, 1, 'Date')).toHaveValue('2026-04-04');
    await field3(page, 1, 'Date').fill('2026-04-05');
    await field3(page, 1, 'Start time').fill('02:30');
    await field3(page, 1, 'Minutes').fill('15');
    const foldPrompt = fold.sub.locator('[data-problem="fold"]');
    await expect(foldPrompt).toContainText('Break 1: 2026-04-05 02:30 happens twice in Australia/Sydney');
    await expect(fold.sub.getByText(/^Ends /), 'no end is shown while the start is not placed').toHaveCount(0);
    await foldPrompt.getByRole('radio', { name: 'Later time, UTC offset +10:00' }).check();
    await expect(fold.sub.getByText(/^Ends /)).toHaveText('Ends 02:45 (Australia/Sydney)');
    await fold.sub.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(breakChip(fold.form, 1)).toHaveAccessibleName('Edit Break 1 · 04/05/2026 02:30 to 02:45');
    await saveSession(page, fold.form);
    await expect(fold.editor.getByText('Session saved.')).toBeVisible();
    const folded = (await employeeSeed.dayView(FOLD_DAY)).sessions[0];
    expect(folded?.breaks.map((item) => [item.start_utc, item.end_utc])).toEqual([['2026-04-04T16:30:00Z', '2026-04-04T16:45:00Z']]);
    await fold.editor.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(fold.editor).toHaveCount(0);

    // Los Angeles springs forward on 2026-03-08: 02:30 does not exist; the sub-dialog offers the first valid time.
    const gap = await newOvernightSession(GAP_DAY, LA, ['2026-03-08', '00:30'], ['2026-03-09', '00:30']);
    await field3(page, 1, 'Start time').fill('02:30');
    await field3(page, 1, 'Minutes').fill('15');
    const gapPrompt = gap.sub.locator('[data-problem="gap"]');
    await expect(gapPrompt).toContainText(`Break 1: 2026-03-08 02:30 does not exist in ${LA}`);
    await gapPrompt.getByRole('button', { name: 'Use 03:30 on 2026-03-08' }).click();
    await expect(field3(page, 1, 'Start time')).toHaveValue('03:30');
    await expect(gapPrompt).toHaveCount(0);
    await expect(gap.sub.getByText(/^Ends /)).toHaveText(`Ends 03:45 (${LA})`);
    await gap.sub.getByRole('button', { name: 'Done', exact: true }).click();
    await saveSession(page, gap.form);
    await expect(gap.editor.getByText('Session saved.')).toBeVisible();
    // 03:30 PDT (-07:00) is 10:30 UTC.
    expect((await employeeSeed.dayView(GAP_DAY)).sessions[0]?.breaks.map((item) => [item.start_utc, item.end_utc])).toEqual([['2026-03-08T10:30:00Z', '2026-03-08T10:45:00Z']]);
  } finally {
    await employeeSeed.clearSessions(FOLD_DAY);
    await employeeSeed.clearSessions(GAP_DAY);
  }
});

test('phone dialog spacing at 390x844: 16px sides, 20px between sections, 8px between breaks, a foot with two 44px buttons in view; the fit is recorded for chips and rows (N-2)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await signInThroughUi();
  const editor = await openEditor(page, date);
  await editor.getByRole('button', { name: 'Add session' }).click();
  const form = sessionDialog(page, 'New session');
  await expect(form.locator('[data-break]')).toHaveCount(3);
  const lines: string[] = [];
  for (const variant of ['overnight chips', 'same-day rows'] as const) {
    if (variant === 'same-day rows') await typeInputZone(form, LA);
    await expect(form.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', variant === 'overnight chips' ? 'chips' : 'rows');
    await settleLayout(page);
    const body = form.locator('.session-dialog-body');
    await expect(body, `${variant}: 16px on both sides`).toHaveCSS('padding-left', '16px');
    await expect(body, `${variant}: 16px on both sides`).toHaveCSS('padding-right', '16px');
    await expect(body, `${variant}: 20px between the sections`).toHaveCSS('row-gap', '20px');
    await expect(form.locator('.session-dialog-section').first(), `${variant}: 12px between the fields of a section`).toHaveCSS('row-gap', '12px');
    await expect(form.locator('.break-entries'), `${variant}: 8px between the breaks`).toHaveCSS('row-gap', '8px');
    const entries = form.locator('[data-break]');
    for (let index = 1; index < (await entries.count()); index += 1) {
      const above = await entries.nth(index - 1).boundingBox();
      const below = await entries.nth(index).boundingBox();
      expect((below?.y ?? 0) - ((above?.y ?? 0) + (above?.height ?? 0)), `${variant}: 8px between break ${index} and ${index + 1}`).toBeCloseTo(8, 0);
    }
    const buttons = form.locator('.session-dialog-foot button');
    await expect(buttons, `${variant}: Cancel and Save`).toHaveCount(2);
    const first = await buttons.nth(0).boundingBox();
    const second = await buttons.nth(1).boundingBox();
    expect(first?.height ?? 0, `${variant}: 44px buttons`).toBeGreaterThanOrEqual(43.9);
    expect(second?.height ?? 0, `${variant}: 44px buttons`).toBeGreaterThanOrEqual(43.9);
    expect(Math.abs((first?.width ?? 0) - (second?.width ?? 1)), `${variant}: two equal buttons`).toBeLessThanOrEqual(1);
    const foot = await form.locator('.session-dialog-foot').boundingBox();
    expect(Math.abs((foot?.y ?? 0) + (foot?.height ?? 0) - 844), `${variant}: the foot stays at the bottom of the screen`).toBeLessThanOrEqual(1);
    const bodyScroll = await body.evaluate((element) => element.scrollHeight - element.clientHeight);
    const bodyClient = await body.evaluate((element) => element.clientHeight);
    lines.push(`${variant}: body ${bodyClient}px, scrolls ${bodyScroll}px, ${bodyScroll <= 1 ? 'fits' : 'scrolls'} at 390x844`);
    await snap(page, variant === 'overnight chips' ? 'session-dialog-phone-chips' : 'session-dialog-phone-rows', project);
  }
  console.log(`PHONE-FIT ${lines.join('; ')}`);
});

/*
 * WP5-UX3-T09 (owner decision U-24, E-1): the Check out dialog uses the break rows (and on a phone the chips and the "Break n"
 * sub-dialog) of the session dialog, with its own rules: an empty list with the box unticked omits `breaks` and checks out with the
 * breaks not confirmed; listed rows or the ticked box confirm and replace the saved rows. The submit button says which of the three
 * it does; there is no "No breaks listed" notice and no second confirmation. The running session is moved three hours back through
 * the API first, so that breaks fit inside it; the server's clock decides the check-out instant, never the test.
 */
interface RunningSeed {
  id: string;
  version: number;
  startMs: number;
  todayLocal: string;
}

/** An instant as the server writes it: whole seconds and `Z`. */
function instantAt(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** A running session that started `hoursAgo` hours ago (input zone Los Angeles), with saved breaks given as [minutes after the start, minutes]; the day is cleared first. */
async function seedRunning(seed: SeedClient, hoursAgo: number, saved: ReadonlyArray<readonly [number, number]> = []): Promise<RunningSeed> {
  const { todayLocal } = await seed.today();
  await seed.clearSessions(todayLocal);
  const started = await seed.call<{ session: { id: string; version: number; start_utc: string } }>('POST', '/api/clock/in', { input_zone: LA }, 201);
  const startMs = Date.parse(started.session.start_utc) - hoursAgo * 3_600_000;
  const moved = await seed.call<{ session: { id: string; version: number } }>('PUT', `/api/sessions/${started.session.id}`, {
    start: instantAt(startMs),
    end: null,
    input_zone: LA,
    breaks: saved.map(([after, minutes]) => ({
      start: instantAt(startMs + after * 60_000),
      end: instantAt(startMs + (after + minutes) * 60_000),
      counts_as_work: false,
    })),
    breaks_confirmed: false,
    expected_version: started.session.version,
  });
  return { id: moved.session.id, version: moved.session.version, startMs, todayLocal };
}

/** The Los Angeles wall clock `YYYY-MM-DD HH:mm` of the running session's start plus whole minutes. */
function localAfter(run: RunningSeed, minutes: number): string {
  return dateTimeIn(instantAt(run.startMs + minutes * 60_000), LA);
}

function checkOutDialog(page: Page): Locator {
  return page.getByRole('dialog', { name: 'Check out', exact: true });
}

/** Records the body of every POST /api/clock/out the page sends. */
function recordCheckOuts(page: Page): Array<Record<string, unknown>> {
  const bodies: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/clock/out') bodies.push(request.postDataJSON() as Record<string, unknown>);
  });
  return bodies;
}

/** The break area shows chips below this window width (the Check out list always has a date field, so its rows need the width of an overnight row). */
function showsChips(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 600;
}

/** Add break, then the row's fields (rows) or the sub-dialog's fields and Done (chips): date, start time, minutes. */
async function addCheckOutBreak(page: Page, dialog: Locator, index: number, start: string, minutes: number): Promise<void> {
  await dialog.getByRole('button', { name: 'Add break' }).click();
  if (showsChips(page)) {
    const sub = breakDialog(page, index);
    await expect(sub).toBeVisible();
    await field3(page, index, 'Date').fill(start.slice(0, 10));
    await field3(page, index, 'Start time').fill(start.slice(11));
    await field3(page, index, 'Minutes').fill(String(minutes));
    await sub.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(sub).toHaveCount(0);
  } else {
    const row = breakRow(dialog, index);
    await row.date.fill(start.slice(0, 10));
    await row.time.fill(start.slice(11));
    await row.minutes.fill(String(minutes));
  }
}

async function removeCheckOutBreak(page: Page, dialog: Locator, index: number): Promise<void> {
  if (showsChips(page)) {
    await breakChip(dialog, index).click();
    await breakDialog(page, index).getByRole('button', { name: 'Remove break', exact: true }).click();
  } else {
    await dialog.getByRole('button', { name: `Remove break ${index}`, exact: true }).click();
  }
}

async function sessionById(seed: SeedClient, workDate: string, id: string) {
  const found = (await seed.dayView(workDate)).sessions.find((session) => session.id === id);
  expect(found, 'the checked-out session is in the day').toBeDefined();
  return found;
}

test('Check out with listed breaks: the listed rows are confirmed and replace the saved rows, and the request is the same shape (E-1)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const run = await seedRunning(employeeSeed, 3, [[10, 10]]);
  const bodies = recordCheckOuts(page);
  try {
    await signInThroughUi();
    await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');
    await expect(page.getByRole('button', { name: 'Check in' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Running since');
    // The break area of the session dialog: no three-way mode, one box, the saved break as Break 1.
    await expect(dialog.getByRole('heading', { name: 'Breaks', exact: true })).toBeVisible();
    await expect(dialog.getByRole('radio')).toHaveCount(0);
    await expect(dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(dialog.getByRole('button', { name: 'Suggest breaks' })).toBeVisible();
    // The closing hint names the act of this dialog: Check out, not Save.
    await expect(dialog.getByText('Checking out confirms the breaks listed here.')).toBeVisible();
    await expect(dialog.getByText(/Saving confirms/)).toHaveCount(0);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await expect(dialog.locator('[data-break="1"]')).toHaveAttribute('data-origin', 'saved');
    await expect(dialog.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', showsChips(page) ? 'chips' : 'rows');
    await expect(dialog.getByRole('button', { name: 'Check out with these breaks' })).toBeVisible();
    // The saved row is kept: nothing is deleted, so there is no removal note (WP5-UX3-FIX4 item 5).
    await expect(dialog.getByText('The saved breaks you removed are deleted at Check out.')).toHaveCount(0);

    // A second break, typed: the listed set is what Check out sends. There is no notice and no second confirmation.
    await addCheckOutBreak(page, dialog, 2, localAfter(run, 60), 15);
    await expect(dialog.locator('[data-break]')).toHaveCount(2);
    await snap(page, 'clock-out-dialog', project);
    await dialog.getByRole('button', { name: 'Check out with these breaks' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByText('Checked out.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check out' })).toHaveCount(0);

    // The request: breaks, breaks_confirmed and the session version, nothing else; the local times are those of the rows.
    expect(bodies).toHaveLength(1);
    const body = bodies[0];
    expect(Object.keys(body ?? {}).sort()).toEqual(['breaks', 'breaks_confirmed', 'expected_version']);
    expect(body).toMatchObject({ breaks_confirmed: true, expected_version: run.version });
    const sent = breaksOf(body);
    expect(sent).toHaveLength(2);
    expect(sent[0]?.start.local.startsWith(localAfter(run, 10).replace(' ', 'T'))).toBe(true);
    expect(sent[1]).toMatchObject({
      start: { local: localAfter(run, 60).replace(' ', 'T'), zone: LA },
      end: { local: plusMinutes(localAfter(run, 60), 15).replace(' ', 'T'), zone: LA },
      counts_as_work: false,
    });
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(true);
    expect(closed?.breaks).toHaveLength(2);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check out with "Confirm no breaks taken" ticked: the rows are hidden, the saved rows are replaced by an empty confirmed list', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const run = await seedRunning(employeeSeed, 3, [[10, 10]]);
  const bodies = recordCheckOuts(page);
  try {
    await signInThroughUi();
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
    await expect(dialog.locator('[data-break]')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Add break' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Suggest breaks' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Check out, no breaks taken' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Check out, no breaks taken' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByText('Checked out.')).toBeVisible();

    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toEqual({ breaks: [], breaks_confirmed: true, expected_version: run.version });
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(true);
    expect(closed?.breaks, 'the saved break was replaced').toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check out with nothing listed and the box unticked omits breaks: the session ends with its breaks not confirmed (E-1)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const run = await seedRunning(employeeSeed, 3);
  const bodies = recordCheckOuts(page);
  try {
    await signInThroughUi();
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog.getByText('No breaks listed.')).toBeVisible();
    await expect(dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    // WP5-UX3-FIX4 item 5: nothing was saved, so nothing is deleted and the removal note is absent: as the dialog opens, and after a row
    // is added and removed again (the list is still omitted).
    const removedNote = dialog.getByText('The saved breaks you removed are deleted at Check out.');
    await expect(dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' })).toBeVisible();
    await expect(removedNote).toHaveCount(0);
    await addCheckOutBreak(page, dialog, 1, localAfter(run, 60), 15);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await removeCheckOutBreak(page, dialog, 1);
    await expect(dialog.locator('[data-break]')).toHaveCount(0);
    await expect(dialog.getByText('No breaks listed.')).toBeVisible();
    await expect(removedNote).toHaveCount(0);
    // Check out is its own explicit act: the button names the outcome and the G-4 notice is not used.
    await dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByText('Checked out.')).toBeVisible();

    expect(bodies).toHaveLength(1);
    expect(bodies[0], 'the list is omitted, not sent empty').toEqual({ breaks_confirmed: false, expected_version: run.version });
    expect(Object.keys(bodies[0] ?? {})).not.toContain('breaks');
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(false);
    expect(closed?.breaks).toHaveLength(0);

    // The day says so, and OT stays pending.
    const editor = await openEditor(page, run.todayLocal);
    await expect(editor.locator('[data-session-state]')).toHaveText('Breaks not confirmed');
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

/*
 * WP5-UX3-FIX3 item 7 (coordinator decision on F-UX3B-1): when the Check out dialog opened with saved break rows and the person removed
 * all of them with the box unticked, Check out sends the complete unconfirmed set, `breaks: []` with `breaks_confirmed: false`, which
 * replaces the saved rows; it used to omit the list, so the server kept rows the dialog no longer showed (and refused a saved break that
 * ended after the check-out with 422 saved_break_after_clock_out). When the dialog opened with no saved rows the list stays omitted (E-1).
 */
test('the server replaces saved breaks with an empty unconfirmed list at Check out, also a saved break that ends after now (E-1)', async ({ employeeSeed }) => {
  // One saved break from 177 to 182 minutes after the start: it ends about two minutes after "now" (a save allows up to five).
  const run = await seedRunning(employeeSeed, 3, [[177, 5]]);
  try {
    const refused = await employeeSeed.call<{ error: { code: string } }>('POST', '/api/clock/out', { breaks_confirmed: false, expected_version: run.version }, 422);
    expect(refused.error.code, 'an omitted list cannot keep a saved break that ends after the check-out').toBe('saved_break_after_clock_out');
    expect((await employeeSeed.dayView(run.todayLocal)).sessions.some((session) => session.end_utc === null), 'the refused check-out leaves the session running').toBe(true);
    await employeeSeed.call('POST', '/api/clock/out', { breaks: [], breaks_confirmed: false, expected_version: run.version });
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(false);
    expect(closed?.breaks, 'the saved break was replaced by the empty list').toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check out after every saved break was removed (box unticked) sends an empty unconfirmed list that replaces them, and the dialog says what will be recorded (E-1)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  // Two saved rows; the second ends after "now", so an omitted list would be refused for a break the dialog no longer shows.
  const run = await seedRunning(employeeSeed, 3, [
    [10, 10],
    [177, 5],
  ]);
  const bodies = recordCheckOuts(page);
  try {
    await signInThroughUi();
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog).toBeVisible();
    const removedNote = dialog.getByText('The saved breaks you removed are deleted at Check out.');
    await expect(dialog.locator('[data-break]')).toHaveCount(2);
    await expect(dialog.getByRole('button', { name: 'Check out with these breaks' })).toBeVisible();
    await expect(removedNote).toHaveCount(0);

    // One row left: still a listed set, no note.
    await removeCheckOutBreak(page, dialog, 2);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await expect(removedNote).toHaveCount(0);

    // Every saved row removed with the box unticked: the dialog says what Check out records.
    await removeCheckOutBreak(page, dialog, 1);
    await expect(dialog.locator('[data-break]')).toHaveCount(0);
    await expect(dialog.getByText('No breaks listed.')).toBeVisible();
    await expect(dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(removedNote).toBeVisible();
    await expect(dialog.getByRole('status').filter({ hasText: 'The saved breaks you removed are deleted at Check out.' })).toContainText('Breaks stay unconfirmed and OT for the day stays pending.');
    await expect(dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' })).toBeVisible();

    // The box takes over the note: ticked, the empty list is confirmed; unticked again, the note returns.
    await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
    await expect(removedNote).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Check out, no breaks taken' })).toBeVisible();
    await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).uncheck();
    await expect(removedNote).toBeVisible();

    await dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByText('Checked out.')).toBeVisible();

    expect(bodies).toHaveLength(1);
    expect(bodies[0], 'the empty list is sent, unconfirmed: the complete set that replaces the saved rows').toEqual({ breaks: [], breaks_confirmed: false, expected_version: run.version });
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(false);
    expect(closed?.breaks, 'the removed saved breaks are gone').toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check out refusals: suggested breaks that end after now, and a future_break refusal that names a break, mark that row or chip and keep the session running', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const run = await seedRunning(employeeSeed, 3);
  const bodies = recordCheckOuts(page);
  let mocked = true;
  await page.route('**/api/clock/out', async (route) => {
    if (route.request().method() !== 'POST' || !mocked) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'future_break', message: 'A break cannot end later than five minutes from now', details: { break_index: 1 } },
      }),
    });
  });
  const running = async () => (await employeeSeed.dayView(run.todayLocal)).sessions.some((session) => session.end_utc === null);
  try {
    await signInThroughUi();
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog).toBeVisible();

    // Suggestions follow the arrival (2, 4 and 6.5 hours after it); the box is cleared and the rows are listed.
    await dialog.getByRole('button', { name: 'Suggest breaks' }).click();
    await expect(dialog.locator('[data-break]')).toHaveCount(3);
    await expect(dialog.getByText('Suggested from your arrival.')).toBeVisible();
    const submit = dialog.getByRole('button', { name: 'Check out with these breaks' });

    // A refusal that names Break 2 (break_index 1) marks that row or chip, with the message as its description.
    await submit.click();
    await expect.poll(() => bodies.length).toBe(1);
    const entry = (index: number) => dialog.locator(`[data-break="${index}"]`);
    const future = 'Break 2 ends later than five minutes from now. Only breaks already taken can be saved.';
    await expect(entry(2)).toHaveClass(/has-error/);
    await expect(entry(2).getByText(future)).toBeVisible();
    await expect(entry(1)).not.toHaveClass(/has-error/);
    await expect(entry(3)).not.toHaveClass(/has-error/);
    await expect(dialog.getByRole('alert')).toContainText('A break cannot be saved as it is.');
    if (showsChips(page)) {
      await expect(breakChip(dialog, 2)).toHaveAccessibleDescription(future);
      await expect(breakChip(dialog, 2), 'focus moves to the marked chip').toBeFocused();
    } else {
      await expect(breakRow(dialog, 2).time).toHaveAccessibleDescription(future);
    }
    expect(await running()).toBe(true);

    // The real server: breaks that end after the check-out lie outside the session. Nothing is saved and the dialog stays.
    mocked = false;
    await submit.click();
    await expect(dialog.getByRole('alert').last()).toContainText('inside their work session');
    await expect(dialog.locator('.has-error')).toHaveCount(0);
    expect(bodies).toHaveLength(2);
    expect(await running()).toBe(true);

    // Only Break 1 fits inside the three hours: removing the other two checks out with it.
    await removeCheckOutBreak(page, dialog, 3);
    await removeCheckOutBreak(page, dialog, 2);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await submit.click();
    await expect(dialog).toHaveCount(0);
    expect(bodies).toHaveLength(3);
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.end_utc).not.toBeNull();
    expect(closed?.breaks_confirmed).toBe(true);
    expect(closed?.breaks).toHaveLength(1);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('phone chips at 390px: Check out lists breaks as chips with the "Break n" sub-dialog, Escape and Cancel stay inside it, and Done sends the row', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const run = await seedRunning(employeeSeed, 3);
  const bodies = recordCheckOuts(page);
  await page.setViewportSize({ width: 390, height: 844 });
  try {
    await signInThroughUi();
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog).toBeVisible();
    const add = dialog.getByRole('button', { name: 'Add break' });

    // Add break opens the sub-dialog on the session date; Cancel removes the new row and focus goes back to Add break.
    await add.click();
    const sub = breakDialog(page, 1);
    await expect(sub).toBeVisible();
    expect(await sub.evaluate((element) => element.matches(':modal'))).toBe(true);
    await expect(field3(page, 1, 'Date')).toBeFocused();
    await expect(field3(page, 1, 'Date')).toHaveValue(localAfter(run, 0).slice(0, 10));
    await sub.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(sub).toHaveCount(0);
    await expect(dialog.locator('[data-break]')).toHaveCount(0);
    await expect(add).toBeFocused();
    await expect(dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' })).toBeVisible();

    // Add it again, fill it in, Done: a chip named in 24-hour time with the date, and Check out names the rows.
    const start = localAfter(run, 45);
    await addCheckOutBreak(page, dialog, 1, start, 20);
    const chip = breakChip(dialog, 1);
    await expect(dialog.getByRole('list', { name: 'Break list' })).toHaveAttribute('data-layout', 'chips');
    await expect(chip).toHaveAccessibleName(chipName(1, start, 20, { overnight: true, suggested: false }));
    await expect(chip).toBeFocused();
    expect((await chip.boundingBox())?.height ?? 0, 'a 44px chip').toBeGreaterThanOrEqual(43.9);
    await expect(dialog.getByRole('button', { name: 'Check out with these breaks' })).toBeVisible();
    await snap(page, 'clock-out-dialog-chips', project);

    // Escape closes only the sub-dialog; the Check out dialog stays open and focus returns to the chip.
    await chip.click();
    await expect(sub).toBeVisible();
    await snap(page, 'clock-out-break-subdialog', project);
    await page.keyboard.press('Escape');
    await expect(sub).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(chip).toBeFocused();
    expect(bodies, 'nothing is sent before Check out').toEqual([]);

    // Enter inside the sub-dialog is Done, never Check out.
    await chip.click();
    await field3(page, 1, 'Minutes').fill('25');
    await field3(page, 1, 'Minutes').press('Enter');
    await expect(sub).toHaveCount(0);
    await expect(dialog).toBeVisible();
    expect(bodies).toEqual([]);
    await expect(chip).toHaveAccessibleName(chipName(1, start, 25, { overnight: true, suggested: false }));

    await dialog.getByRole('button', { name: 'Check out with these breaks' }).click();
    await expect(dialog).toHaveCount(0);
    expect(bodies).toHaveLength(1);
    expect(Object.keys(bodies[0] ?? {}).sort()).toEqual(['breaks', 'breaks_confirmed', 'expected_version']);
    expect(bodies[0]).toMatchObject({ breaks_confirmed: true, expected_version: run.version });
    expect(breaksOf(bodies[0])).toMatchObject([
      { start: { local: start.replace(' ', 'T'), zone: LA }, end: { local: plusMinutes(start, 25).replace(' ', 'T'), zone: LA }, counts_as_work: false },
    ]);
    const closed = await sessionById(employeeSeed, run.todayLocal, run.id);
    expect(closed?.breaks).toHaveLength(1);
    expect(closed?.breaks_confirmed).toBe(true);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check out asks "Discard your changes?" on Cancel and Escape when its rows or the box changed, and closes at once when nothing changed (U-26)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const run = await seedRunning(employeeSeed, 3, [[10, 10]]);
  const bodies = recordCheckOuts(page);
  const discard = page.getByRole('alertdialog', { name: 'Discard your changes?' });
  const open = async () => {
    await page.getByRole('button', { name: 'Check out' }).click();
    const dialog = checkOutDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    return dialog;
  };
  try {
    await signInThroughUi();
    await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');

    // Nothing changed: Cancel and Escape close at once, with no question.
    let dialog = await open();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    dialog = await open();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);

    // A row added: Cancel asks; "Keep editing" returns to the dialog with the added row and focus on the control that asked.
    dialog = await open();
    await addCheckOutBreak(page, dialog, 2, localAfter(run, 60), 15);
    await expect(dialog.locator('[data-break]')).toHaveCount(2);
    const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true });
    await cancel.click();
    await expect(discard).toBeVisible();
    await expect(discard.getByRole('button', { name: 'Keep editing' })).toBeFocused();
    await expect(discard.getByRole('button', { name: 'Discard' })).toBeVisible();
    await expect(page.getByRole('alertdialog', { name: 'Save this session?' })).toHaveCount(0);
    await discard.getByRole('button', { name: 'Keep editing' }).click();
    await expect(discard).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-break]')).toHaveCount(2);
    await expect(cancel).toBeFocused();

    // Escape asks the same question; Escape inside the question means "Keep editing".
    await page.keyboard.press('Escape');
    await expect(discard).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(discard).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-break]')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(discard).toBeVisible();

    // Discard closes the dialog; nothing was sent and the session still runs with its saved break.
    await discard.getByRole('button', { name: 'Discard' }).click();
    await expect(discard).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
    expect(bodies, 'nothing is sent on Discard').toEqual([]);
    expect((await employeeSeed.dayView(run.todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(true);

    // The next opening starts from the saved session again; ticking the box is a change too.
    dialog = await open();
    await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(discard).toBeVisible();
    await discard.getByRole('button', { name: 'Discard' }).click();
    await expect(dialog).toHaveCount(0);
    expect(bodies).toEqual([]);

    // A change that is undone is no change: removing the added row again closes at once.
    dialog = await open();
    await addCheckOutBreak(page, dialog, 2, localAfter(run, 60), 15);
    await removeCheckOutBreak(page, dialog, 2);
    await expect(dialog.locator('[data-break]')).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);

    // Check out itself stays its own explicit act: after a change it sends at once, with no notice and no confirmation.
    dialog = await open();
    await addCheckOutBreak(page, dialog, 2, localAfter(run, 60), 15);
    await dialog.getByRole('button', { name: 'Check out with these breaks' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    expect(bodies).toHaveLength(1);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('Check in then Check out asks for break confirmation and sends the session version', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const { todayLocal } = await employeeSeed.today();
  await signInThroughUi();
  await clockIn(page, employeeSeed, todayLocal);
  const bodies = recordCheckOuts(page);

  // One state-aware button: checked in shows only Check out, with the running state in words.
  await expect(page.getByRole('button', { name: 'Check out' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check in' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Check in and out' })).toContainText('Checked in since');
  await page.screenshot({ path: screenshotPath(`period-${project}-clocked-in-synthetic.png`), animations: 'disabled' });
  await page.getByRole('button', { name: 'Check out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Check out' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Running since');
  await expect(dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
  await expect(dialog.getByRole('button', { name: 'Check out, breaks unconfirmed' })).toBeVisible();

  // Suggestions follow the arrival; listing breaks that end after the check-out is refused.
  await dialog.getByRole('button', { name: 'Suggest breaks' }).click();
  await expect(dialog.locator('[data-break]')).toHaveCount(3);
  await expect(dialog.getByRole('button', { name: 'Check out with these breaks' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Check out with these breaks' }).click();
  await expect(dialog.getByRole('alert')).toContainText('inside their work session');
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(true);
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toMatchObject({ breaks_confirmed: true });
  expect(breaksOf(bodies[0])).toHaveLength(3);

  // Confirming that no break was taken ends the session with confirmed, empty breaks.
  await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
  await dialog.getByRole('button', { name: 'Check out, no breaks taken' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Checked out.')).toBeVisible();
  expect(bodies).toHaveLength(2);
  expect(bodies[1]).toEqual({ breaks: [], breaks_confirmed: true, expected_version: bodies[0]?.expected_version });
  // After the check-out the panel offers Check in again.
  await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check out' })).toHaveCount(0);
  const closed = (await employeeSeed.dayView(todayLocal)).sessions.filter((session) => session.source === 'clock').at(-1);
  expect(closed?.end_utc).not.toBeNull();
  expect(closed?.breaks_confirmed).toBe(true);
  expect(closed?.breaks).toHaveLength(0);
});

test('a stale session version at Check out says so, reloads and then checks out', async ({ page, employeeSeed, signInThroughUi }) => {
  const { todayLocal } = await employeeSeed.today();
  await signInThroughUi();
  await clockIn(page, employeeSeed, todayLocal);
  const bodies = recordCheckOuts(page);

  await page.getByRole('button', { name: 'Check out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Check out' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();

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

  await dialog.getByRole('button', { name: 'Check out, no breaks taken' }).click();
  await expect(dialog.getByRole('alert').first()).toContainText('This session changed since it was loaded');
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(true);
  // The refused request carried the version the dialog loaded, which is no longer the session's version.
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toEqual({ breaks: [], breaks_confirmed: true, expected_version: running?.version });
  await expect(dialog.getByRole('button', { name: 'Check out, no breaks taken' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Reload' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('reloaded')).toBeVisible();

  await page.getByRole('button', { name: 'Check out' }).click();
  const again = page.getByRole('dialog', { name: 'Check out' });
  await again.getByRole('checkbox', { name: 'Confirm no breaks taken' }).check();
  await again.getByRole('button', { name: 'Check out, no breaks taken' }).click();
  await expect(again).toHaveCount(0);
  expect((await employeeSeed.dayView(todayLocal)).sessions.some((session) => session.end_utc === null)).toBe(false);
  expect(bodies).toHaveLength(2);
  expect(bodies[1]?.expected_version, 'the second request carries the reloaded version').toBe((running?.version ?? 0) + 1);
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
    // Round 3 (G-2 a): the field and its section are named "Category", the word of the sheet row and of the PDF.
    await expect(fields.getByRole('heading', { name: 'Category and leave' })).toBeVisible();
    await expect(fields.getByRole('combobox', { name: /^Category/ })).toHaveCount(1);
    await expect(fields.getByRole('heading', { name: /^Label/ })).toHaveCount(0);
    // FIX2 item 13: the calendar-default hint is the select's description, not a loose paragraph.
    await expect(fields.getByRole('combobox', { name: /^Category/ })).toHaveAccessibleDescription('Calendar default. Saving records it as your choice.');

    // Leave is typed as hours and minutes (docs/04); 4 h 0 m is sent as the same 240 leave minutes.
    await expect(fields.getByLabel('Leave hours')).toHaveValue('0');
    await expect(fields.getByLabel('Leave minutes')).toHaveValue('0');
    // Out of range (more than 59 minutes) is refused in the page; nothing is saved.
    const untouched = await employeeSeed.dayView(date);
    await fields.getByLabel('Leave minutes').fill('60');
    await fields.getByRole('button', { name: 'Save day fields' }).click();
    await expect(fields.getByRole('alert')).toContainText('Enter leave as whole hours (0 to 24) and minutes (0 to 59)');
    const refused = await employeeSeed.dayView(date);
    expect(refused.leave_minutes).toBe(0);
    expect(refused.entry?.version ?? null).toBe(untouched.entry?.version ?? null);
    await fields.getByLabel('Leave hours').fill('4');
    await fields.getByLabel('Leave minutes').fill('0');
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

test('malformed leave hours or minutes are never saved as another leave; empty fields still save 0', async ({ page, employeeSeed, signInThroughUi }) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const puts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname === `/api/days/${date}`) puts.push(request.postData() ?? '');
  });
  try {
    await signInThroughUi();
    const editor = await openEditor(page, date);
    const fields = editor.getByRole('form', { name: 'Day fields' });
    const hours = fields.getByLabel('Leave hours');
    const minutes = fields.getByLabel('Leave minutes');
    const save = fields.getByRole('button', { name: 'Save day fields' });
    await fields.getByLabel('Leave kind').selectOption('vacation');
    const untouched = await employeeSeed.dayView(date);

    // The browser holds text such as "2-" or "e" in a number field as an empty value with a bad-input flag;
    // it must not be read as 0 (hours "2-" with 30 minutes was once stored as 30, not 150).
    const refuse = async (hoursKeys: string | null, minutesKeys: string | null, marked: { hours: boolean; minutes: boolean }) => {
      await hours.fill('');
      await minutes.fill('');
      if (hoursKeys !== null) await hours.pressSequentially(hoursKeys);
      else await hours.fill('2');
      if (minutesKeys !== null) await minutes.pressSequentially(minutesKeys);
      else await minutes.fill('30');
      await save.click();
      const alert = fields.getByRole('alert');
      await expect(alert).toHaveCount(1);
      await expect(alert).toContainText('Enter leave as whole hours (0 to 24) and minutes (0 to 59)');
      const alertId = await alert.getAttribute('id');
      expect(alertId, 'the error has an id the fields point to').toBeTruthy();
      for (const [field, isMarked] of [[hours, marked.hours], [minutes, marked.minutes]] as const) {
        if (isMarked) {
          await expect(field).toHaveAttribute('aria-invalid', 'true');
          await expect(field).toHaveAttribute('aria-describedby', new RegExp(alertId ?? '\\0'));
        } else {
          await expect(field).not.toHaveAttribute('aria-invalid', 'true');
        }
      }
      expect(puts, 'nothing is sent').toEqual([]);
      const stored = await employeeSeed.dayView(date);
      expect(stored.leave_minutes).toBe(0);
      expect(stored.entry?.version ?? null).toBe(untouched.entry?.version ?? null);
    };
    await refuse('2-', null, { hours: true, minutes: false });
    await refuse(null, '3-', { hours: false, minutes: true });
    await refuse('e', null, { hours: true, minutes: false });
    await refuse('1.5', '0', { hours: true, minutes: false });
    await refuse('-1', null, { hours: true, minutes: false });
    await refuse('0', '60', { hours: false, minutes: true });
    await refuse('24', '1', { hours: true, minutes: true });

    // Valid input is unchanged: 2 h 30 m is the same 150 leave minutes.
    await hours.fill('2');
    await minutes.fill('30');
    await save.click();
    await expect(editor.getByText('Day fields saved.')).toBeVisible();
    expect(puts.map((body) => JSON.parse(body) as { leave_minutes: number })).toMatchObject([{ leave_minutes: 150 }]);
    expect((await employeeSeed.dayView(date)).leave_minutes).toBe(150);

    // Empty fields still save 0.
    await hours.fill('');
    await minutes.fill('');
    await save.click();
    await expect.poll(() => puts.length).toBe(2);
    expect(JSON.parse(puts[1] ?? '{}')).toMatchObject({ leave_minutes: 0 });
    expect((await employeeSeed.dayView(date)).leave_minutes).toBe(0);
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
    await expect(editor.getByRole('list', { name: 'About this day' }).getByText('old period')).toBeVisible();
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
    const edit = sessionDialog(page, 'Edit session');
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
    await saveSession(page, edit);
    await expect(editor.getByRole('alert').filter({ hasText: 'This day changed since it was loaded' })).toBeVisible();
    await expect(edit).toHaveCount(0);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

/** The DELETE requests the page sends to the sessions route, with their bodies. */
function recordSessionDeletes(page: Page): Array<{ path: string; body: Record<string, unknown> }> {
  const deletes: Array<{ path: string; body: Record<string, unknown> }> = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (request.method() === 'DELETE' && pathname.startsWith('/api/sessions/')) deletes.push({ path: pathname, body: request.postDataJSON() as Record<string, unknown> });
  });
  return deletes;
}

/** The range a card shows for two instants in a zone, read with Intl (an oracle independent of the app): `09:00-17:30`, with `+1` when the end lies on a later local day. */
function rangeIn(startUtc: string, endUtc: string, zone: string): string {
  const start = dateTimeIn(startUtc, zone);
  const end = dateTimeIn(endUtc, zone);
  const later = Math.round((Date.parse(`${end.slice(0, 10)}T00:00:00Z`) - Date.parse(`${start.slice(0, 10)}T00:00:00Z`)) / 86_400_000);
  return `${start.slice(11)}-${end.slice(11)}${later > 0 ? `+${later}` : ''}`;
}

// WP5-UX3-T07 (U-22): the "Delete" then "Confirm delete" button swap became a confirmation dialog that names what is deleted.
test('deleting a session opens a confirmation with the day and time; Cancel has focus, Escape cancels, "Delete session" sends the version', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const deletes = recordSessionDeletes(page);
  try {
    await employeeSeed.seedCompleteDay(date);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    await signInThroughUi();
    const displayZone = await browserZone(page);
    const editor = await openEditor(page, date);
    await expect(editor.locator('.session-card')).toHaveCount(1);
    const deleteButton = editor.getByRole('button', { name: /^Delete session/ });
    await deleteButton.click();

    // The first click deletes nothing: it opens an alertdialog that lists the day, the time (with its zone) and the breaks.
    const confirm = page.getByRole('alertdialog', { name: 'Delete this session?' });
    await expect(confirm).toBeVisible();
    expect(await confirm.evaluate((element) => element.matches(':modal')), 'the confirmation is modal').toBe(true);
    await expect(confirm).toHaveAccessibleDescription(/The session and its breaks are deleted\. Worked time and OT of the day are calculated again\./);
    const facts = confirm.locator('.confirm-facts');
    await expect(facts.getByText('Day', { exact: true })).toBeVisible();
    await expect(facts.getByText(editorTitleOf(date), { exact: true })).toBeVisible();
    await expect(facts).toContainText(rangeIn(before?.start_utc ?? '', before?.end_utc ?? '', displayZone));
    await expect(facts).toContainText(`(${displayZone})`);
    await expect(facts).toContainText('3 breaks (15, 30, 15 min)');
    expect((await employeeSeed.dayView(date)).sessions, 'nothing is deleted by the first click').toHaveLength(1);
    expect(deletes).toEqual([]);
    // Cancel comes first and has the initial focus; Delete session is second.
    const buttons = confirm.getByRole('button');
    await expect(buttons).toHaveText(['Cancel', 'Delete session']);
    await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expect(confirm.getByRole('button', { name: 'Delete session', exact: true })).toBeEnabled();
    // A day that needs no reason shows no reason field.
    await expect(confirm.getByLabel('Reason for editing an old or finalized period')).toHaveCount(0);
    await page.screenshot({ path: screenshotPath(`delete-confirm-${testInfo.project.name}-synthetic.png`), animations: 'disabled' });

    // Escape cancels only the confirmation: the editor stays, focus returns to the Delete button, nothing is sent.
    await page.keyboard.press('Escape');
    await expect(confirm).toHaveCount(0);
    await expect(editor).toBeVisible();
    await expect(deleteButton).toBeFocused();
    expect(deletes).toEqual([]);

    // Cancel does the same.
    await deleteButton.click();
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Cancel' }).click();
    await expect(confirm).toHaveCount(0);
    await expect(deleteButton).toBeFocused();
    expect((await employeeSeed.dayView(date)).sessions).toHaveLength(1);

    // Delete session sends today's request: the version the editor loaded and, outside an old period, no reason.
    await deleteButton.click();
    await confirm.getByRole('button', { name: 'Delete session', exact: true }).click();
    await expect(editor.getByText('Session deleted.')).toBeVisible();
    await expect(editor.getByText('No session recorded for this day.')).toBeVisible();
    await expect(confirm).toHaveCount(0);
    // The deleted session's button is gone, so focus goes to the Times heading.
    await expect(editor.getByRole('heading', { name: 'Times', exact: true })).toBeFocused();
    expect(deletes).toEqual([{ path: `/api/sessions/${before?.id}`, body: { expected_version: before?.version } }]);
    expect((await employeeSeed.dayView(date)).sessions).toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('in an old period the delete confirmation asks for the reason, waits for it and sends it with the version', async ({ page, employeeSeed, signInThroughUi }) => {
  const deletes = recordSessionDeletes(page);
  try {
    await employeeSeed.call(
      'POST',
      `/api/days/${OLD_DAY}/sessions`,
      { start: { local: `${OLD_DAY}T09:00`, zone: LA }, end: { local: `${OLD_DAY}T17:00`, zone: LA }, input_zone: LA, breaks_confirmed: true, breaks: [], reason: 'e2e seed' },
      201,
    );
    const before = (await employeeSeed.dayView(OLD_DAY)).sessions[0];
    await signInThroughUi();
    const editor = await openEditor(page, OLD_DAY);
    await editor.getByRole('button', { name: /^Delete session/ }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Delete this session?' });
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText('No breaks taken');
    // The reason field is the editor's own reason state: it shows the same words and is required to delete.
    const reason = confirm.getByLabel('Reason for editing an old or finalized period');
    await expect(reason).toBeVisible();
    const submit = confirm.getByRole('button', { name: 'Delete session', exact: true });
    await expect(submit).toBeDisabled();
    await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await reason.fill('Removing a synthetic duplicate');
    await expect(submit).toBeEnabled();
    expect(deletes).toEqual([]);
    await submit.click();
    await expect(editor.getByText('Session deleted.')).toBeVisible();
    expect(deletes).toEqual([{ path: `/api/sessions/${before?.id}`, body: { expected_version: before?.version, reason: 'Removing a synthetic duplicate' } }]);
    expect((await employeeSeed.dayView(OLD_DAY)).sessions).toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(OLD_DAY);
  }
});

/*
 * Nested dialogs (WP5-UX-B3-01): the confirmation is the only modal on top. Escape closes it and nothing else, at every
 * width: the modal bottom sheet of the mobile project, the floating panel at 1280 and the non-modal panel at 1440.
 */
for (const { name, width } of [
  { name: 'the default window', width: null },
  { name: '1440px (the non-modal panel beside the sheet)', width: 1440 },
]) {
  test(`${name}: Escape closes the delete confirmation first and then the editor; focus is where it was`, async ({ page, employeeSeed, signInThroughUi, isMobile }) => {
    test.skip(width !== null && isMobile, 'The beside-the-sheet panel is a desktop-project layout');
    const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
    const deletes = recordSessionDeletes(page);
    try {
      await employeeSeed.seedCompleteDay(date);
      if (width !== null) await page.setViewportSize({ width, height: 800 });
      await signInThroughUi();
      const dayButton = namedDayButton(page, date, 'Edit');
      await dayButton.click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      const modalEditor = await editor.evaluate((element) => element.matches(':modal'));
      expect(modalEditor, width === 1440 ? 'the panel beside the sheet is not modal' : 'below 1360px the editor is modal').toBe(width !== 1440);
      const deleteButton = editor.getByRole('button', { name: /^Delete session/ });
      await deleteButton.click();
      const confirm = page.getByRole('alertdialog', { name: 'Delete this session?' });
      await expect(confirm).toBeVisible();
      await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(confirm).toHaveCount(0);
      await expect(editor, 'the first Escape did not close the editor').toBeVisible();
      await expect(deleteButton).toBeFocused();
      expect(deletes).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(dayButton).toBeFocused();
      expect((await employeeSeed.dayView(date)).sessions).toHaveLength(1);
    } finally {
      await employeeSeed.clearSessions(date);
    }
  });
}

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
  // The sheet's Status words: a past expected day without times says "No times" (status key missing).
  await expect(page.locator(`[data-day="${pastDay}"]`)).toContainText('No times');
  await expect(page.locator(`[data-day="${pastDay}"] [data-check="missing"]`)).toHaveCount(1);
  // Round 3 (U-16): "No times" is a slashed ring, not a hollow square, so nothing on the sheet looks like an empty checkbox.
  const noTimes = page.locator(`[data-day="${pastDay}"] [data-check="missing"] .shape`);
  await expect(noTimes).toHaveClass(/\bshape-slashed\b/);
  await expect(noTimes).not.toHaveClass(/\bshape-square\b/);
  const ring = await noTimes.evaluate((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return { radius: style?.borderTopLeftRadius ?? '', border: style?.borderTopWidth ?? '', image: style?.backgroundImage ?? '' };
  });
  expect(ring.radius, 'a ring, not a square').not.toBe('0px');
  expect(ring.border, 'the ring has an outline').toBe('2px');
  expect(ring.image, 'the diagonal bar is a gradient in the ring').toMatch(/^linear-gradient\(/);
  const next = page.getByRole('button', { name: 'Next period' });
  const row = page.locator(`[data-day="${futureDay}"]`);
  for (let step = 0; step < 4 && (await row.count()) === 0; step += 1) {
    // Wait for the sheet to change before looking for the row: the old sheet also has 14 days, so
    // counting rows alone raced the render and could click past the period holding the future day.
    const period = page.getByRole('region', { name: 'Pay period' });
    const shown = (await period.textContent()) ?? '';
    await next.click();
    await expect(period).not.toHaveText(shown);
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
  await namedDayButton(page, futureDay, 'Edit').click();
  const editor = page.getByRole('dialog', { name: /Day editor/ });
  await expect(figure(editor, 'status')).toContainText('upcoming');
});

test('mobile: the editor fits the screen and every control is at least 44 by 44', async ({ page, employeeSeed, signInThroughUi }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The 44px target rule applies to the mobile project');
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  const editor = await openEditor(page, date);
  await editor.getByRole('button', { name: 'Add session' }).click();
  const form = sessionDialog(page, 'New session');
  await form.getByLabel('Start time', { exact: true }).fill('09:00');
  await form.getByRole('button', { name: 'Suggest breaks' }).click();
  await expect(form.locator('[data-break]')).toHaveCount(3);
  await snap(page, 'day-editor-mobile', 'mobile');

  // The session dialog is the whole screen below 768px, and neither it nor the editor under it scrolls sideways.
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };
  const box = (await form.boundingBox()) ?? { x: -1, y: -1, width: 0, height: 0 };
  expect(Math.abs(box.width - viewport.width), 'full width').toBeLessThanOrEqual(1);
  expect(Math.abs(box.height - viewport.height), 'full height').toBeLessThanOrEqual(1);
  const overflow = await page.evaluate<{ page: number; dialog: number; session: number }>(`(() => {
    const dialog = document.querySelector('dialog[open]');
    const session = document.querySelector('dialog[data-session-dialog]');
    const body = session === null ? null : session.querySelector('.session-dialog-body');
    return {
      page: document.documentElement.scrollWidth - window.innerWidth,
      dialog: dialog === null ? -1 : dialog.scrollWidth - dialog.clientWidth,
      session: body === null ? 99 : body.scrollWidth - body.clientWidth,
    };
  })()`);
  expect(overflow.page).toBeLessThanOrEqual(0);
  expect(overflow.dialog).toBeLessThanOrEqual(0);
  expect(overflow.session, 'the session dialog does not scroll sideways').toBeLessThanOrEqual(0);

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

/* ---- WP5-UX3-T07: the panel head, the session cards, the WFH row ------------------------------------------------- */

test('the panel head: named by the date, chips instead of the long note, a surface that differs from the body, scroll padding that clears it (U-19, U-20, AX-01)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  const displayZone = await browserZone(page);
  expect(displayZone, 'the test only means something while the zones differ').not.toBe(LA);
  const editor = await openEditor(page, date);

  // The dialog name is the role, the date as people read it and the ISO date; the heading text ends with the ISO date.
  await expect(page.getByRole('dialog', { name: `Day editor ${editorTitleOf(date)} (${date})`, exact: true })).toBeVisible();
  await expect(editor.getByRole('heading', { level: 2 })).toHaveText(`Day editor ${editorTitleOf(date)} ${date}`);
  // The long accounting-date sentence is gone; the zones are named by chips (the day in the reporting zone only because the zones differ).
  await expect(editor.getByText(/Accounting date .* in the reporting zone/)).toHaveCount(0);
  await expect(editor.getByText(/Times below are typed in an input zone/)).toHaveCount(0);
  const chips = editor.getByRole('list', { name: 'About this day' });
  await expect(chips.getByRole('listitem')).toHaveText([/^(old|current|future) period$|^in progress$/, `Times in ${displayZone}`, `Day in ${LA}`]);
  await expect(chips.getByText('View only')).toHaveCount(0);

  // The head is its own surface (--panel-head) with a --line rule under it; the body stays on the card surface.
  const surfaces = await editor.evaluate((dialog) => {
    const view = dialog.ownerDocument.defaultView;
    const head = dialog.querySelector('.editor-head');
    if (head === null || view === null) throw new Error('the editor head is expected');
    const colourOf = (token: string) => {
      const probe = dialog.ownerDocument.createElement('div');
      probe.style.backgroundColor = `var(--${token})`;
      dialog.ownerDocument.body.append(probe);
      const colour = view.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    };
    const headStyle = view.getComputedStyle(head);
    return {
      head: headStyle.backgroundColor,
      body: view.getComputedStyle(dialog).backgroundColor,
      rule: { width: headStyle.borderBottomWidth, colour: headStyle.borderBottomColor },
      tokens: { panelHead: colourOf('panel-head'), card: colourOf('card'), line: colourOf('line') },
    };
  });
  expect(surfaces.head, 'the head is the --panel-head surface').toBe(surfaces.tokens.panelHead);
  expect(surfaces.body, 'the body is the card surface').toBe(surfaces.tokens.card);
  expect(surfaces.head, 'the head surface differs from the body').not.toBe(surfaces.body);
  expect(surfaces.rule, 'a --line rule under the head').toEqual({ width: '1px', colour: surfaces.tokens.line });

  // AX-01: --editor-head-size measures the head and the panel's scroll padding is that size plus the focus clearance.
  const sizes = await editor.evaluate((dialog) => {
    const view = dialog.ownerDocument.defaultView;
    const head = dialog.querySelector('.editor-head');
    if (head === null || view === null) throw new Error('the editor head is expected');
    return {
      head: head.getBoundingClientRect().height,
      property: Number.parseFloat(dialog.style.getPropertyValue('--editor-head-size')),
      padding: Number.parseFloat(view.getComputedStyle(dialog).scrollPaddingTop),
      clearance: Number.parseFloat(view.getComputedStyle(dialog.ownerDocument.documentElement).getPropertyValue('--focus-clearance')),
    };
  });
  expect(sizes.property, '--editor-head-size equals the rendered head').toBeCloseTo(sizes.head, 0);
  expect(sizes.padding, 'the scroll padding clears the head by the focus clearance').toBeCloseTo(sizes.head + sizes.clearance, 0);
  console.log(`HEAD ${project}: head ${sizes.head.toFixed(1)}px, scroll padding ${sizes.padding.toFixed(1)}px`);

  // A control scrolled to by the keyboard is not left under the sticky head.
  const save = editor.getByRole('button', { name: 'Save day fields' });
  await save.focus();
  const clear = await editor.evaluate((dialog) => {
    const head = dialog.querySelector('.editor-head')?.getBoundingClientRect();
    const active = dialog.ownerDocument.activeElement?.getBoundingClientRect();
    return head === undefined || active === undefined ? false : active.top >= head.bottom - 0.5;
  });
  expect(clear, 'the focused Save button lies below the head').toBe(true);
  await snap(page, 'editor-head', project);
});

test('each session is a card with its state, its source and a break table in the display zone; an unconfirmed session asks for its breaks (U-21)', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [confirmedDay = '', noneDay = '', unconfirmedDay = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 3);
  try {
    await employeeSeed.seedCompleteDay(confirmedDay);
    await employeeSeed.createSession(noneDay, '09:00', '17:00', []);
    await employeeSeed.seedUnconfirmedBreaksDay(unconfirmedDay);
    await signInThroughUi();
    const displayZone = await browserZone(page);

    // Confirmed breaks: the pill, the source, and the table of the saved breaks (date, start and minutes in the display zone).
    const stored = (await employeeSeed.dayView(confirmedDay)).sessions[0];
    const range = rangeIn(stored?.start_utc ?? '', stored?.end_utc ?? '', displayZone);
    let editor = await openEditor(page, confirmedDay);
    let card = editor.locator('.session-card');
    await expect(card).toHaveCount(1);
    await expect(card.locator('[data-session-state]')).toHaveText('Breaks confirmed');
    await expect(card).toContainText(range);
    await expect(card).toContainText(`Entered by hand in ${LA}`);
    const table = card.getByRole('table', { name: `Breaks of ${range}` });
    await expect(table.getByRole('columnheader')).toHaveText(['Break', 'Date', 'Start', 'Minutes']);
    const breaks = stored?.breaks ?? [];
    expect(breaks).toHaveLength(3);
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    for (const [index, item] of breaks.entries()) {
      const start = dateTimeIn(item.start_utc, displayZone);
      const minutes = (Date.parse(item.end_utc) - Date.parse(item.start_utc)) / 60_000;
      await expect(rows.nth(index).getByRole('cell'), `break ${index + 1}`).toHaveText([String(index + 1), `${start.slice(5, 7)}/${start.slice(8, 10)}`, start.slice(11), String(minutes)]);
    }
    await expect(card.getByRole('button', { name: /^Confirm breaks/ })).toHaveCount(0);
    await expect(card.getByRole('button', { name: /^Edit session/ })).toBeVisible();
    await expect(card.getByRole('button', { name: /^Delete session/ })).toBeVisible();
    // The panel only shows the breaks: no field, no one-tap button.
    await expect(card.getByRole('textbox')).toHaveCount(0);
    await expect(editor.getByRole('button', { name: /Confirm suggested breaks|Confirm breaks as listed/ })).toHaveCount(0);
    await card.scrollIntoViewIfNeeded();
    await snap(page, 'editor-session-card', project);
    await editor.getByRole('button', { name: 'Close', exact: true }).click();

    // Confirmed without breaks: the pill and the empty state both say so, and there is no table.
    editor = await openEditor(page, noneDay);
    card = editor.locator('.session-card');
    await expect(card.locator('[data-session-state]')).toHaveText('No breaks taken');
    await expect(card.getByText('No breaks taken', { exact: true })).toHaveCount(2);
    await expect(card.getByRole('table')).toHaveCount(0);
    await expect(card.getByRole('button', { name: /^Confirm breaks/ })).toHaveCount(0);
    await editor.getByRole('button', { name: 'Close', exact: true }).click();

    // Breaks not confirmed: an attention strip with the primary "Confirm breaks" button, and no table.
    editor = await openEditor(page, unconfirmedDay);
    card = editor.locator('.session-card');
    await expect(card.locator('[data-session-state]')).toHaveText('Breaks not confirmed');
    const strip = card.locator('[data-session-attention]');
    await expect(strip).toContainText('OT stays pending until breaks are confirmed.');
    await expect(strip.getByRole('button', { name: /^Confirm breaks/ })).toBeVisible();
    await expect(card.getByRole('table')).toHaveCount(0);
    await expect(card.getByRole('button', { name: /^Edit session/ })).toBeVisible();
    await expect(card.getByRole('button', { name: /^Delete session/ })).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await snap(page, 'editor-session-card-unconfirmed', project);
  } finally {
    for (const day of [confirmedDay, noneDay, unconfirmedDay]) await employeeSeed.clearSessions(day);
  }
});

test.describe('WP5-UX3-T07: cards read in the reporting zone', () => {
  // The display zone is the reporting zone, so an overnight session reads as typed and only two chips show.
  test.use({ timezoneId: LA });

  test('an overnight session shows +1 and its breaks; a running session shows when it began and no table; the zone chip is left out', async ({
    page,
    employeeSeed,
    signInThroughUi,
  }) => {
    const { todayLocal } = await employeeSeed.today();
    const free = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
    const date = free.find((candidate) => addDays(candidate, 1) < todayLocal);
    expect(date, 'a past free workday whose next day is also past').toBeDefined();
    const workDate = date ?? '';
    let runningId: { id: string; version: number } | null = null;
    try {
      const at = (day: string, time: string) => ({ local: `${day}T${time}`, zone: LA });
      await employeeSeed.call(
        'POST',
        `/api/days/${workDate}/sessions`,
        {
          start: at(workDate, '22:00'),
          end: at(addDays(workDate, 1), '02:30'),
          input_zone: LA,
          breaks_confirmed: true,
          breaks: [{ start: at(workDate, '23:00'), end: at(workDate, '23:20'), counts_as_work: false }],
        },
        201,
      );
      await signInThroughUi();
      const editor = await openEditor(page, workDate);
      // Both zones are the reporting zone: "Times in" stays, "Day in" is left out.
      await expect(editor.getByRole('list', { name: 'About this day' }).getByRole('listitem')).toHaveText([/ period$/, `Times in ${LA}`]);
      const card = editor.locator('.session-card');
      await expect(card.locator('.session-range')).toHaveText('22:00-02:30+1');
      await expect(card.getByRole('table', { name: 'Breaks of 22:00-02:30+1' }).getByRole('row').nth(1).getByRole('cell')).toHaveText([
        '1',
        `${workDate.slice(5, 7)}/${workDate.slice(8, 10)}`,
        '23:00',
        '20',
      ]);
      await editor.getByRole('button', { name: 'Close', exact: true }).click();

      // A running session: the pill with its live dot, "Running since", no table. It is today's accounting date in the reporting zone.
      const started = await employeeSeed.call<{ session: { id: string; version: number; start_utc: string } }>('POST', '/api/clock/in', { input_zone: LA }, 201);
      runningId = { id: started.session.id, version: started.session.version };
      const today = (await employeeSeed.today()).todayLocal;
      const running = await openEditor(page, today);
      const runningCard = running.locator('.session-card[data-state="running"]');
      await expect(runningCard).toHaveCount(1);
      await expect(runningCard.locator('[data-session-state]')).toHaveText('Running');
      await expect(runningCard.locator('.pill .live-dot')).toHaveCount(1);
      await expect(runningCard).toContainText(`Running since ${dateTimeIn(started.session.start_utc, LA).slice(11)}`);
      await expect(runningCard).toContainText('Checked in and out');
      await expect(runningCard.getByRole('table')).toHaveCount(0);
      await expect(runningCard.getByRole('button', { name: /^Confirm breaks/ })).toHaveCount(0);
    } finally {
      await employeeSeed.clearSessions(workDate);
      if (runningId !== null) await employeeSeed.call('DELETE', `/api/sessions/${runningId.id}`, { expected_version: runningId.version });
    }
  });
});

test('the Category select and the WFH box share a row in the panel beside the sheet, the floating panel and the bottom sheet, and wrap without overflow at 320px (U-27)', async ({
  page,
  employeeSeed,
  signInThroughUi,
  isMobile,
}) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  await signInThroughUi();
  const widths = isMobile ? [390, 320] : [1366, 1280, 390, 320];
  const lines: string[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 800 });
    const editor = await openEditor(page, date);
    const fields = editor.getByRole('form', { name: 'Day fields' });
    await fields.scrollIntoViewIfNeeded();
    const select = await fields.getByRole('combobox', { name: /^Category/ }).boundingBox();
    const wfh = await fields.locator('label.label-wfh').boundingBox();
    expect(select && wfh, `${width}px: both controls are painted`).toBeTruthy();
    const [s, w] = [select ?? { x: 0, y: 0, width: 0, height: 0 }, wfh ?? { x: 0, y: 0, width: 0, height: 0 }];
    const overflow = await editor.evaluate((dialog) => dialog.scrollWidth - dialog.clientWidth);
    const panel = (await editor.boundingBox()) ?? { x: 0, width: 0 };
    expect(overflow, `${width}px: the panel does not scroll sideways`).toBeLessThanOrEqual(0);
    expect(w.x + w.width, `${width}px: the WFH box stays inside the panel`).toBeLessThanOrEqual(panel.x + panel.width + 0.5);
    if (width === 320) {
      expect(w.y, '320px: the WFH box wraps below the select').toBeGreaterThanOrEqual(s.y + s.height - 0.5);
    } else {
      expect(Math.abs(s.y + s.height - (w.y + w.height)), `${width}px: the select and the WFH box share the row (their bottoms align)`).toBeLessThanOrEqual(1);
      expect(w.x, `${width}px: the WFH box is right of the select`).toBeGreaterThanOrEqual(s.x + s.width - 0.5);
    }
    // While the category is the calendar default (an earlier test may have saved this day), its hint sits below the whole row, not inside the select's label.
    if ((await employeeSeed.dayView(date)).category_source === 'default') {
      const hint = await fields.getByText('Calendar default. Saving records it as your choice.').boundingBox();
      expect(hint?.y ?? 0, `${width}px: the hint is below the row`).toBeGreaterThanOrEqual(Math.max(s.y + s.height, w.y + w.height) - 0.5);
    }
    lines.push(`${width}: select ${s.width.toFixed(0)}px, WFH ${w.width.toFixed(0)}px, ${width === 320 ? 'wrapped' : 'one row'}`);
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
  }
  console.log(`WFH-ROW ${lines.join('; ')}`);
});

/* ---- WP5-UX-T04: side panel and bottom sheet, one-tap breaks, in-cell label picker ------------- */

test('the day editor is a side panel on a desktop and a modal bottom sheet on a phone; focus moves in and back on Escape', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  // WP5-UX3-T05B: the panel stands beside the sheet from 1360px; the 1280px window of the desktop project floats it (tested below).
  if (project === 'desktop') await page.setViewportSize({ width: 1440, height: 800 });
  const [date = '', other = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
  await signInThroughUi();
  const dayButton = (workDate: string) => namedDayButton(page, workDate, 'Edit');
  await dayButton(date).click();
  const editor = page.getByRole('dialog', { name: /Day editor/ });
  await expect(editor).toBeVisible();
  const heading = editor.getByRole('heading', { level: 2 });
  await expect(heading).toHaveText(new RegExp(`^Day editor ${editorTitleOf(date)} ${date}$`));
  // Focus moves to the editor's heading on open.
  await expect(heading).toBeFocused();
  const modal = await editor.evaluate((element) => element.matches(':modal'));

  if (project === 'desktop') {
    // Non-modal: the panel sits beside the sheet and the sheet stays usable.
    expect(modal).toBe(false);
    const panel = await editor.boundingBox();
    const card = await page.locator('.sheet-area > section.card').boundingBox();
    expect(panel, 'panel box').not.toBeNull();
    expect(card, 'sheet card box').not.toBeNull();
    expect(panel?.x ?? 0).toBeGreaterThanOrEqual((card?.x ?? 0) + (card?.width ?? 0));
    const widths = await page.evaluate<{ scroll: number; inner: number }>('({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })');
    expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
    // Another day opens in the same panel from the sheet, and focus moves to its heading.
    await dayButton(other).click();
    await expect(heading).toHaveText(new RegExp(`${editorTitleOf(other)} ${other}$`));
    await expect(heading).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
    // Focus returns to the day's own button.
    await expect(dayButton(other)).toBeFocused();
    // The Close button returns focus the same way.
    await dayButton(date).click();
    await expect(heading).toBeFocused();
    await editor.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(editor).toHaveCount(0);
    await expect(dayButton(date)).toBeFocused();
  } else {
    // A modal bottom sheet: full width, on the bottom edge, at most 86% of the height, no sideways scroll.
    expect(modal).toBe(true);
    const viewport = page.viewportSize();
    const sheet = await editor.boundingBox();
    expect(viewport, 'viewport').not.toBeNull();
    expect(sheet, 'sheet box').not.toBeNull();
    expect(sheet?.height ?? 0).toBeLessThanOrEqual((viewport?.height ?? 0) * 0.86 + 1);
    expect(Math.abs((sheet?.y ?? 0) + (sheet?.height ?? 0) - (viewport?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((sheet?.width ?? 0) - (viewport?.width ?? 0))).toBeLessThanOrEqual(1);
    const overflow = await page.evaluate<number>("(() => { const d = document.querySelector('dialog[open]'); return d === null ? -1 : d.scrollWidth - d.clientWidth; })()");
    expect(overflow).toBe(0);
    // The page behind is inert: Tab never reaches an element outside the sheet.
    for (let step = 0; step < 14; step += 1) {
      await page.keyboard.press('Tab');
      const outside = await page.evaluate<boolean>(
        "(() => { const a = document.activeElement; const d = document.querySelector('dialog[open]'); return a !== null && a !== document.body && d !== null && !d.contains(a); })()",
      );
      expect(outside, `focus left the bottom sheet after ${step + 1} Tab presses`).toBe(false);
    }
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
    await expect(dayButton(date)).toBeFocused();
  }
});

/** True when a focused element lies entirely inside the open editor's box (the editor hides it). */
function focusHiddenByPanel(page: Page): Promise<{ hidden: boolean; outside: boolean; name: string }> {
  return page.evaluate(`(() => {
    const active = document.activeElement;
    const panel = document.querySelector('dialog[open]');
    if (active === null || active === document.body || panel === null) return { hidden: false, outside: false, name: '' };
    const name = active.tagName + ' ' + (active.getAttribute('aria-label') ?? (active.textContent ?? '').slice(0, 30));
    if (panel.contains(active)) return { hidden: false, outside: false, name };
    const a = active.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const hidden = a.left >= p.left && a.right <= p.right && a.top >= p.top && a.bottom <= p.bottom;
    return { hidden, outside: true, name };
  })()`);
}

test.describe('WP5-UX-B-02: below 1360px the floating panel never hides a focused sheet control', () => {
  test.skip(({ isMobile }) => isMobile, 'The 768 to 1359px floating side panel is a desktop-project layout');

  // WP5-UX3-T05B: 1280 and 1359 were beside the sheet before; the keyboard walk now covers the floating panel there too (AX-01).
  for (const width of [768, 1024, 1280, 1359]) {
    test(`at ${width}px no focused sheet control lies under the open panel, and Escape closes it from the sheet`, async ({
      page,
      employeeSeed,
      signInThroughUi,
    }) => {
      const [date = '', other = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
      await page.setViewportSize({ width, height: 800 });
      await signInThroughUi();
      await expect(page.locator('[data-day]')).toHaveCount(14);
      const dayButton = (workDate: string) => namedDayButton(page, workDate, 'Edit');
      await dayButton(date).click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      await expect(editor.getByRole('heading', { level: 2 })).toBeFocused();
      await page.screenshot({ path: screenshotPath(`editor-w${width}-synthetic.png`), animations: 'disabled' });

      // Keyboard walk both ways: whatever takes focus is inside the panel, or is not entirely under it.
      for (const key of ['Tab', 'Shift+Tab']) {
        for (let step = 0; step < 70; step += 1) {
          await page.keyboard.press(key);
          const state = await focusHiddenByPanel(page);
          expect(state.hidden, `${state.name} is focused entirely under the panel after ${step + 1} ${key} presses`).toBe(false);
        }
      }

      // Focus placed on a sheet control (when the page allows it at all): Escape still closes the panel.
      await dayButton(other).focus();
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(dayButton(date)).toBeFocused();
    });
  }

  // The same behaviour as before, moved to the measured threshold: at 1280 the panel floats (modal), at 1366 it stays beside the sheet.
  for (const { width, modal } of [
    { width: 1280, modal: true },
    { width: 1366, modal: false },
  ]) {
    test(`at ${width}px the panel ${modal ? 'floats (modal)' : 'stays beside the sheet'} and Escape closes it wherever focus is`, async ({
      page,
      employeeSeed,
      signInThroughUi,
    }) => {
      const [date = '', other = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 2);
      await page.setViewportSize({ width, height: 800 });
      await signInThroughUi();
      const dayButton = (workDate: string) => namedDayButton(page, workDate, 'Edit');
      await dayButton(date).click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(modal);
      // Focus on another sheet control: beside the sheet it takes the focus; a modal panel leaves the page inert, so focus stays in the panel.
      await dayButton(other).focus();
      if (!modal) await expect(dayButton(other)).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      // Focus returns to the button of the day whose editor was open.
      await expect(dayButton(date)).toBeFocused();
      await dayButton(date).click();
      await expect(editor).toBeVisible();
      if (!modal) {
        await page.getByRole('switch', { name: 'Show details' }).focus();
        await expect(page.getByRole('switch', { name: 'Show details' })).toBeFocused();
      }
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(dayButton(date)).toBeFocused();
    });
  }
});

/* ---- WP5-UX3-T05B: the floating panel below 1360px, readable sheet columns beside the panel from 1360px ---------- */

/** The longest seeded holiday name (reference/examples/holidays.2026.example.json): its words are the widest category text of a cell. */
const LONGEST_HOLIDAY = 'Observed Independence Day';
/** The narrowest readable day column (--sheet-col-min, 7.2rem at the 15px root, is 108px); half a pixel of rounding is allowed. */
const READABLE_COLUMN = 108 - 0.5;

interface SheetFacts {
  /** The width of every day column of the desktop sheet. */
  columns: number[];
  /** Words wider than the content box of the element that holds them (they would be broken inside the word). */
  tooWide: string[];
  grid: number;
  /** How far the page scrolls sideways (0 or less: not at all). */
  scrollOverflow: number;
  /** The width of the page container. */
  page: number;
  /** How many words were measured, and the largest share of its element's content box any word takes (1 or less: it fits). */
  words: number;
  tightest: number;
}

/**
 * Measures the desktop sheet: every column, and every whitespace-separated word of every cell against the content box of the
 * element that holds it (the word measured with that element's computed font on a canvas, as in the PLAN2 probe). Text of a
 * visually hidden element (a box of 2px or less) is skipped.
 */
const SHEET_FACTS = `(() => {
  const context = document.createElement('canvas').getContext('2d');
  const tooWide = [];
  let words = 0;
  let tightest = 0;
  const columns =[...document.querySelectorAll('.week-grid .sheet-day')].map((column) => column.getBoundingClientRect().width);
  for (const cell of document.querySelectorAll('.week-grid .sheet-day > div')) {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      const text = node.textContent ?? '';
      if (text.trim() === '') continue;
      let host = node.parentElement;
      while (host !== null && getComputedStyle(host).display === 'inline') host = host.parentElement;
      if (host === null || host.clientWidth <= 2) continue;
      const style = getComputedStyle(host);
      const room = host.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      context.font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].join(' ');
      for (const word of text.split(/\\s+/)) {
        if (word === '') continue;
        const width = context.measureText(word).width;
        words += 1;
        tightest = Math.max(tightest, width / room);
        if (width > room + 0.5) tooWide.push(word + ' ' + width.toFixed(1) + ' > ' + room.toFixed(1));
      }
    }
  }
  const root = document.documentElement;
  return {
    columns,
    tooWide,
    grid: document.querySelector('.week-grid')?.getBoundingClientRect().width ?? 0,
    scrollOverflow: root.scrollWidth - root.clientWidth,
    page: document.querySelector('main.page')?.getBoundingClientRect().width ?? 0,
    words,
    tightest,
  };
})()`;

function sheetFacts(page: Page): Promise<SheetFacts> {
  return page.evaluate<SheetFacts>(SHEET_FACTS);
}

interface LongContent {
  person: Person;
  /** An overnight session (22:00 to 02:30 the next day) and its date. */
  overnight: string;
  /** Two sessions on one day. */
  twoSessions: string;
  /** The 14 dates of the displayed period. */
  dates: string[];
}

/**
 * A fresh person on a private server whose displayed period holds the item-1 data of PLAN2: the longest seeded holiday name, an
 * overnight session and two sessions on one day. Dates come from the server (the displayed period and its free past workdays).
 */
async function seedLongContent(server: BuiltServer): Promise<LongContent> {
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const person = await newPerson(admin, server, { displayName: 'Synthetic Wide Sheet', signature: 'none' });
  const sheet = await person.api.call<{ period: { period_start: string }; days: Array<{ work_date: string }> }>('GET', `/api/timesheets/${person.payrollDate}`);
  const holiday = addDays(sheet.period.period_start, 1);
  const calendar = await admin.call<{ id: string }>('GET', '/api/calendar');
  const csv = ['date,name,kind', `${holiday},${LONGEST_HOLIDAY},holiday`].join('\n');
  const body = { calendar_id: calendar.id, year: Number(holiday.slice(0, 4)), effective_from: sheet.period.period_start, csv, remove_dates: [] };
  const preview = await admin.call<{ preview_hash: string }>('POST', '/api/admin/calendar/import/preview', body);
  const done = await admin.call<{ committed: boolean }>('POST', '/api/admin/calendar/import/commit', { ...body, preview_hash: preview.preview_hash }, 201);
  expect(done.committed, 'the holiday import is committed').toBe(true);

  // The oldest and the newest free past workday: the overnight session ends the next day, so it must lie in the past.
  const free = need(await person.api.displayedPeriodFreeWorkdays(), 2);
  const overnight = free.at(-1) ?? '';
  const twoSessions = free[0] ?? '';
  const at = (date: string, time: string) => ({ local: `${date}T${time}`, zone: LA });
  const add = (start: { local: string; zone: string }, end: { local: string; zone: string }) =>
    person.api.call('POST', `/api/days/${start.local.slice(0, 10)}/sessions`, { start, end, input_zone: LA, breaks_confirmed: true, breaks: [] }, 201);
  await add(at(overnight, '22:00'), at(addDays(overnight, 1), '02:30'));
  await add(at(twoSessions, '08:00'), at(twoSessions, '12:00'));
  await add(at(twoSessions, '13:00'), at(twoSessions, '23:30'));
  return { person, overnight, twoSessions, dates: sheet.days.map((day) => day.work_date) };
}

/** Signs the page in to the private server (the holiday import is system-wide, so it stays off the shared worker server). */
async function signInToPrivate(page: Page, server: BuiltServer, person: Person) {
  await page.goto(`${server.origin}/#/timesheet`);
  await page.getByLabel('Email').fill(person.account.email);
  await page.getByLabel('Password').fill(person.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('WP5-UX3-T05B: the Day editor floats below 1360px and stands beside readable columns from 1360px', () => {
  test.skip(({ isMobile }) => isMobile, 'The floating side panel and the 7-column sheet are desktop-project layouts');
  // The display zone is the reporting zone, so the seeded times read as typed ("22:00-02:30+1").
  test.use({ timezoneId: LA });

  test('at 1280 and 1359 the editor is a modal panel over a sheet that keeps its full width and every word fits its cell', async ({
    page,
    privateServer,
  }) => {
    test.setTimeout(90_000);
    const data = await seedLongContent(privateServer);
    await page.setViewportSize({ width: 1280, height: 800 });
    await signInToPrivate(page, privateServer, data.person);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.getByRole('switch', { name: 'Show details' }).check();
    await expect(page.locator(`[data-day="${data.overnight}"]`)).toContainText('22:00');
    await expect(page.locator('.sheet-main')).toContainText('Independence');
    const lines: string[] = [];
    for (const width of [1280, 1359]) {
      await page.setViewportSize({ width, height: 800 });
      const closed = await sheetFacts(page);
      expect(closed.tooWide, `${width}px closed: words wider than their cell`).toEqual([]);
      expect(Math.min(...closed.columns), `${width}px closed: the narrowest column`).toBeGreaterThanOrEqual(READABLE_COLUMN);

      await namedDayButton(page, data.overnight, 'Edit').click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      await expect(editor.getByRole('heading', { name: 'Figures (computed by the server)' })).toBeVisible();
      // Soft, so a regression of the threshold reports the squeeze measured below as well as the mode.
      expect.soft(await editor.evaluate((element) => element.matches(':modal')), `${width}px: the editor is modal`).toBe(true);
      await expect.soft(page.locator('.sheet-area')).not.toHaveClass(/with-editor/);
      await expect.soft(editor).toHaveAttribute('data-side', /^(left|right)$/);
      const open = await sheetFacts(page);
      expect(open.grid, `${width}px: the sheet keeps its full width with the panel open`).toBeCloseTo(closed.grid, 0);
      expect(open.columns.map(Math.round), `${width}px: no column changes width`).toEqual(closed.columns.map(Math.round));
      expect(open.tooWide, `${width}px open: words wider than their cell`).toEqual([]);
      expect(open.words, `${width}px: the probe measured the cells' words`).toBeGreaterThan(50);
      expect(open.scrollOverflow, `${width}px: no sideways scroll`).toBeLessThanOrEqual(0);
      const panel = await editor.boundingBox();
      expect(panel?.width ?? 0, `${width}px: the panel is 400px wide`).toBeCloseTo(400, 0);
      lines.push(`${width}: columns ${Math.min(...open.columns).toFixed(1)}-${Math.max(...open.columns).toFixed(1)}px, grid ${open.grid.toFixed(1)}px, panel ${panel?.width}px, ${open.words} words, widest takes ${(open.tightest * 100).toFixed(0)}% of its box`);
      if (width === 1280) await page.screenshot({ path: screenshotPath('editor-floating-w1280-synthetic.png'), animations: 'disabled' });

      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(namedDayButton(page, data.overnight, 'Edit')).toBeFocused();
    }
    console.log(`FLOATING ${lines.join('; ')}`);
  });

  test('the floating panel docks away from the edited column (left for Saturday and Sunday, right for Monday), over the lighter backdrop, with the column scrolled into view', async ({
    page,
    privateServer,
  }) => {
    test.setTimeout(90_000);
    const data = await seedLongContent(privateServer);
    // A short window, so the first week's columns lie above the viewport once the page is scrolled to the end.
    await page.setViewportSize({ width: 1280, height: 420 });
    await signInToPrivate(page, privateServer, data.person);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    const weekday = (weekdayNumber: number) => data.dates.find((date) => isoWeekday(date) === weekdayNumber) ?? '';
    const lines: string[] = [];
    for (const { date, side } of [
      { date: weekday(1), side: 'right' },
      { date: weekday(6), side: 'left' },
      { date: weekday(7), side: 'left' },
    ]) {
      await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
      const column = page.locator(`[data-day="${date}"]`);
      const before = await column.boundingBox();
      expect((before?.y ?? 0) + (before?.height ?? 0), `${date}: the column is above the viewport before the editor opens`).toBeLessThanOrEqual(0);
      // The click is dispatched on the button without Playwright scrolling it into view: the page itself brings the column into view.
      await namedDayButton(page, date, 'Edit').dispatchEvent('click');
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(true);
      await expect(editor).toHaveAttribute('data-side', side);
      const [panel, edited] = [await editor.boundingBox(), await column.boundingBox()];
      expect(panel && edited, `${date}: both boxes are painted`).toBeTruthy();
      const separate = (edited?.x ?? 0) + (edited?.width ?? 0) <= (panel?.x ?? 0) + 0.5 || (panel?.x ?? 0) + (panel?.width ?? 0) <= (edited?.x ?? 0) + 0.5;
      expect(separate, `${date}: the column box ${JSON.stringify(edited)} does not meet the panel box ${JSON.stringify(panel)}`).toBe(true);
      expect((edited?.y ?? 0) + (edited?.height ?? 0), `${date}: the column was scrolled into view (its bottom)`).toBeGreaterThan(0);
      expect(edited?.y ?? 0, `${date}: the column was scrolled into view (its top)`).toBeLessThan(420);
      const colours = await editor.evaluate((element) => {
        const probe = element.ownerDocument.createElement('div');
        probe.style.backgroundColor = 'var(--scrim-side)';
        element.ownerDocument.body.append(probe);
        const token = element.ownerDocument.defaultView?.getComputedStyle(probe).backgroundColor ?? '';
        probe.remove();
        return { backdrop: element.ownerDocument.defaultView?.getComputedStyle(element, '::backdrop').backgroundColor ?? '', token };
      });
      expect(colours.backdrop, `${date}: the backdrop is the lighter side scrim`).toBe(colours.token);
      expect(colours.token, 'the token is a translucent colour').toMatch(/^rgba\(/);
      lines.push(`${date} (weekday ${isoWeekday(date)}): side ${side}, column x ${edited?.x.toFixed(0)}-${((edited?.x ?? 0) + (edited?.width ?? 0)).toFixed(0)}, panel x ${panel?.x.toFixed(0)}-${((panel?.x ?? 0) + (panel?.width ?? 0)).toFixed(0)}`);
      if (side === 'left' && isoWeekday(date) === 6) await page.screenshot({ path: screenshotPath('editor-floating-docked-left-w1280-synthetic.png'), animations: 'disabled' });
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(namedDayButton(page, date, 'Edit')).toBeFocused();
    }
    console.log(`DOCK ${lines.join('; ')}`);
  });

  test('from 1360 the editor is a non-modal panel beside the sheet, every column is at least 108px and no word is wider than its cell', async ({
    page,
    privateServer,
  }) => {
    test.setTimeout(120_000);
    const data = await seedLongContent(privateServer);
    await page.setViewportSize({ width: 1360, height: 800 });
    await signInToPrivate(page, privateServer, data.person);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.getByRole('switch', { name: 'Show details' }).check();
    await expect(page.locator('.sheet-main')).toContainText('Independence');
    const lines: string[] = [];
    for (const width of [1360, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      const closed = await sheetFacts(page);
      expect(closed.page, `${width}px closed: the page is capped at 1200px`).toBeLessThanOrEqual(1200.5);

      await namedDayButton(page, data.twoSessions, 'Edit').click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      await expect(editor.getByRole('heading', { name: 'Figures (computed by the server)' })).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal')), `${width}px: the editor is not modal`).toBe(false);
      await expect(page.locator('.sheet-area')).toHaveClass(/with-editor/);
      await expect(editor).not.toHaveAttribute('data-side', /.*/);
      const open = await sheetFacts(page);
      expect(Math.min(...open.columns), `${width}px: the narrowest column`).toBeGreaterThanOrEqual(READABLE_COLUMN);
      expect(open.tooWide, `${width}px: words wider than their cell`).toEqual([]);
      expect(open.words, `${width}px: the probe measured the cells' words`).toBeGreaterThan(50);
      expect(open.scrollOverflow, `${width}px: no sideways scroll`).toBeLessThanOrEqual(0);
      // The page cap lifts to --page-max-editor (1600px) while the editor is open, and the panel stands beside the sheet.
      expect(open.page, `${width}px: the page is wider than the 1200px cap while editing`).toBeGreaterThan(width >= 1632 ? 1599 : 1200);
      expect(open.page, `${width}px: the page stays within 1600px`).toBeLessThanOrEqual(1600.5);
      const [panel, sheet] = [await editor.boundingBox(), await page.locator('.sheet-area > section.card').boundingBox()];
      expect((panel?.x ?? 0) + 0.5, `${width}px: the panel is right of the sheet`).toBeGreaterThanOrEqual((sheet?.x ?? 0) + (sheet?.width ?? 0));
      lines.push(`${width}: columns ${Math.min(...open.columns).toFixed(1)}-${Math.max(...open.columns).toFixed(1)}px, grid ${open.grid.toFixed(1)}px, page ${open.page.toFixed(0)}px, ${open.words} words, widest takes ${(open.tightest * 100).toFixed(0)}% of its box`);
      if (width === 1366 || width === 1920) await page.screenshot({ path: screenshotPath(`editor-beside-w${width}-synthetic.png`), animations: 'disabled' });

      // Escape closes the panel from the sheet, and focus returns to the day's button.
      await namedDayButton(page, data.overnight, 'Edit').focus();
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(namedDayButton(page, data.twoSessions, 'Edit')).toBeFocused();
    }
    console.log(`BESIDE ${lines.join('; ')}`);
  });
});

/* ---- WP5-UX3-FIX1: from 768 to 899px the week card scrolls sideways; keyboard focus is always fully in view ---------- */

/** Where the focused control and its focus indicator lie against the visible box of its week card (viewport pixels). */
interface FocusFit {
  name: string;
  inCard: boolean;
  /** How far the focus indicator reaches outside the control: the widest outer box-shadow layer without blur, or a painted outline. */
  reach: number;
  /** Room between the indicator's box and each edge of the card's visible box; negative means clipped. */
  left: number;
  right: number;
  top: number;
  bottom: number;
  scrollLeft: number;
}

const FOCUS_FIT = `(() => {
  const el = document.activeElement;
  if (el === null || el === document.body) return null;
  const card = el.closest('.sheet-week');
  const name = (el.getAttribute('aria-label') || el.textContent || el.tagName).replace(/\\s+/g, ' ').trim().slice(0, 40);
  if (card === null) return { name, inCard: false, reach: 0, left: 0, right: 0, top: 0, bottom: 0, scrollLeft: 0 };
  const style = getComputedStyle(el);
  let reach = 0;
  for (const layer of style.boxShadow === 'none' ? [] : style.boxShadow.split(/,(?![^(]*\\))/)) {
    if (layer.includes('inset')) continue;
    const [x = 0, y = 0, blur = 0, spread = 0] = layer.replace(/(rgba?|color)\\([^)]*\\)/g, '').trim().split(/\\s+/).map(parseFloat).filter((n) => !Number.isNaN(n));
    if (blur === 0 && spread > 0) reach = Math.max(reach, spread + Math.max(Math.abs(x), Math.abs(y)));
  }
  const painted = style.outlineStyle !== 'none' && !/transparent|rgba\\([^)]*,\\s*0\\)$/.test(style.outlineColor);
  if (painted) reach = Math.max(reach, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset));
  const box = el.getBoundingClientRect();
  const frame = card.getBoundingClientRect();
  const left = frame.left + card.clientLeft;
  const top = frame.top + card.clientTop;
  return {
    name,
    inCard: true,
    reach,
    left: box.left - reach - left,
    right: left + card.clientWidth - (box.right + reach),
    top: box.top - reach - top,
    bottom: top + card.clientHeight - (box.bottom + reach),
    scrollLeft: card.scrollLeft,
  };
})()`;

/** Half a pixel of rounding at a fractional edge is allowed. */
const FITS = (fit: FocusFit) => Math.min(fit.left, fit.right, fit.top, fit.bottom) >= -0.5;

test.describe('WP5-UX3-FIX1: from 768 to 899px every focused sheet control is fully visible in its scrolling week card', () => {
  test.skip(({ isMobile }) => isMobile, 'The 7-column sheet is a desktop-project layout');
  test.use({ timezoneId: LA });

  test('Tab, Shift+Tab and the picker arrows at 768, 800, 820, 860 and 899: each focused control and its ring lie inside the card, words stay whole, the page never scrolls sideways', async ({
    page,
    privateServer,
  }) => {
    test.setTimeout(240_000);
    const data = await seedLongContent(privateServer);
    await page.setViewportSize({ width: 768, height: 900 });
    await signInToPrivate(page, privateServer, data.person);
    await expect(page.locator('[data-day]')).toHaveCount(14);
    await page.getByRole('switch', { name: 'Show details' }).check();
    await expect(page.locator('.sheet-main')).toContainText('Independence');
    const cards = page.locator('.sheet-week');
    const lines: string[] = [];
    for (const width of [768, 800, 820, 860, 899]) {
      await page.setViewportSize({ width, height: 900 });
      for (const batch of [false, true]) {
        if (batch) await page.getByRole('button', { name: 'Change several days' }).click();
        await expect(page.getByRole('checkbox', { name: /^Select \d{4}-\d{2}-\d{2}$/ })).toHaveCount(batch ? 14 : 0);
        const facts = await sheetFacts(page);
        expect(facts.tooWide, `${width}px: words wider than their cell`).toEqual([]);
        expect(facts.words, `${width}px: the probe measured the cells' words`).toBeGreaterThan(50);
        expect(facts.scrollOverflow, `${width}px: the page never scrolls sideways`).toBeLessThanOrEqual(0);
        const scrolls = await cards.first().evaluate((card) => card.scrollWidth > card.clientWidth);
        // The label column and seven 108px columns need 850px: the card scrolls at 768 to 860, and at 899 (867px) it does not.
        expect(scrolls, `${width}px: the week card scrolls sideways while the columns need more room than the card`).toBe(width <= 860);
        const controls = page.locator('.sheet-week button, .sheet-week input');
        const expected = await controls.count();
        for (const direction of ['Tab', 'Shift+Tab'] as const) {
          for (const card of await cards.all()) await card.evaluate((element) => element.scrollTo({ left: 0, top: 0, behavior: 'instant' }));
          await (direction === 'Tab' ? controls.first() : controls.last()).focus();
          // Focus from the keyboard: the first key press makes the indicator :focus-visible.
          await page.keyboard.press('Shift');
          let stops = 0;
          for (let step = 0; step <= expected; step += 1) {
            const fit = await page.evaluate<FocusFit | null>(FOCUS_FIT);
            if (fit === null || !fit.inCard) break;
            stops += 1;
            expect(FITS(fit), `${width}px ${batch ? 'batch' : 'details'} ${direction}: "${fit.name}" and its ${fit.reach}px ring lie inside the card (room l ${fit.left.toFixed(1)} r ${fit.right.toFixed(1)} t ${fit.top.toFixed(1)} b ${fit.bottom.toFixed(1)}, scrollLeft ${fit.scrollLeft})`).toBe(true);
            await page.keyboard.press(direction);
          }
          expect(stops, `${width}px ${direction}: every control of both week cards was reached`).toBe(expected);
        }
        if (batch) await page.getByRole('button', { name: 'Done' }).click();
      }
      // The picker of the last column of each card: Enter opens its list (focus moves into it), the arrows move; the list and its
      // ring lie inside the card, and Escape returns focus to the trigger with the card back at its top.
      for (const card of await cards.all()) {
        await card.evaluate((element) => element.scrollTo({ left: 0, top: 0, behavior: 'instant' }));
        const trigger = card.locator('.label-trigger').last();
        await trigger.focus();
        await page.keyboard.press('Shift');
        const onTrigger = await page.evaluate<FocusFit | null>(FOCUS_FIT);
        expect(onTrigger !== null && FITS(onTrigger), `${width}px: the last column's picker is fully visible: ${JSON.stringify(onTrigger)}`).toBe(true);
        await page.keyboard.press('Enter');
        await expect(card.getByRole('listbox')).toBeFocused();
        for (const key of ['ArrowDown', 'ArrowDown', 'End', 'Home']) {
          await page.keyboard.press(key);
          const onList = await page.evaluate<FocusFit | null>(FOCUS_FIT);
          expect(onList !== null && FITS(onList), `${width}px ${key}: the open list and its ring are inside the card: ${JSON.stringify(onList)}`).toBe(true);
        }
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        expect(await card.evaluate((element) => element.scrollTop), `${width}px: the card is back at its top once the list closes`).toBe(0);
      }
      lines.push(`${width}: ${await cards.first().evaluate((card) => `${card.scrollWidth}/${card.clientWidth}`)}`);
    }
    console.log(`FOCUS-IN-CARD ${lines.join('; ')}`);
  });
});

// WP5-UX3-T07: "Confirm breaks" replaced the one-tap buttons. It opens the session form with the breaks the one-tap rule offered
// selected; saving sends the same session update, with the version the editor loaded.
test('"Confirm breaks" opens the session dialog with the suggested breaks listed; Save, then the confirmation, sends the same session update and its version', async ({
  page,
  employeeSeed,
  signInThroughUi,
}, testInfo) => {
  const project = testInfo.project.name;
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const puts: Array<{ path: string; body: Record<string, unknown> }> = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (request.method() === 'PUT' && pathname.startsWith('/api/sessions/')) puts.push({ path: pathname, body: request.postDataJSON() as Record<string, unknown> });
  });
  try {
    // 09:00 to 18:30 in Los Angeles with the breaks still unknown: the day is pending OT.
    await employeeSeed.seedUnconfirmedBreaksDay(date);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    expect(before?.breaks_confirmed).toBe(false);
    await signInThroughUi();
    const displayZone = await browserZone(page);
    const editor = await openEditor(page, date);
    await expect(editor.locator('[data-banner="attention"]')).toContainText('Breaks are not confirmed yet.');
    await expect(editor.getByText('OT for this day stays pending')).toBeVisible();

    // The panel offers one entry point, not the one-tap buttons, and shows no break table for a session without saved breaks.
    const card = editor.locator('.session-card');
    await expect(card.locator('[data-session-state]')).toHaveText('Breaks not confirmed');
    await expect(editor.getByRole('button', { name: /Confirm suggested breaks|No breaks taken|Confirm breaks as listed/ })).toHaveCount(0);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: screenshotPath(`${project === 'desktop' ? 'editor-panel' : 'editor-sheet'}-${project}-synthetic.png`), animations: 'disabled' });
    const confirmButton = card.getByRole('button', { name: /^Confirm breaks/ });
    await confirmButton.click();

    // The session dialog is the editing surface: the suggested breaks follow the arrival (R-02), typed in the session's input
    // zone, listed (and so confirmed by Save, U-25) with their "suggested" tag. Nothing is sent until the final Save.
    const form = sessionDialog(page, 'Edit session');
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(form.locator('[data-break]')).toHaveCount(3);
    for (const [index, [from, minutes, end]] of [['11:00', '15', 'ends 11:15'], ['13:00', '30', 'ends 13:30'], ['15:30', '15', 'ends 15:45']].entries()) {
      const row = breakRow(form, index + 1);
      await expect(row.time).toHaveValue(from ?? '');
      await expect(row.minutes).toHaveValue(minutes ?? '');
      await expect(row.row).toContainText(end ?? '');
      await expect(row.row).toContainText('suggested');
    }
    expect(puts).toEqual([]);
    expect((await employeeSeed.dayView(date)).sessions[0]?.breaks_confirmed).toBe(false);

    // Unchanged, Cancel closes at once and focus returns to "Confirm breaks".
    await form.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(form).toHaveCount(0);
    await expect(confirmButton).toBeFocused();
    await confirmButton.click();

    await form.getByRole('button', { name: 'Save', exact: true }).click();
    const confirm = saveConfirmation(page);
    await expect(confirm.locator('.confirm-facts')).toContainText('3 breaks (15, 30, 15 min)');
    expect(puts, 'nothing is sent before the final Save').toEqual([]);
    await confirm.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    await expect(editor.locator('[data-banner]')).toHaveCount(0);
    await expect(figure(editor, 'status')).toContainText('complete');
    await expect(editor.getByRole('heading', { name: 'Times', exact: true })).toBeFocused();

    // One session update, to the same route with the version the editor loaded: start, end, zone and the three breaks as local times.
    expect(puts).toHaveLength(1);
    expect(puts[0]?.path).toBe(`/api/sessions/${before?.id}`);
    expect(puts[0]?.body).toMatchObject({
      expected_version: before?.version,
      breaks_confirmed: true,
      input_zone: LA,
      start: { local: `${date}T09:00`, zone: LA },
      end: { local: `${date}T18:30`, zone: LA },
    });
    expect('reason' in (puts[0]?.body ?? {}), 'no reason outside an old period').toBe(false);
    const sent = (puts[0]?.body.breaks ?? []) as Array<{ start: { local: string }; end: { local: string }; counts_as_work: boolean }>;
    expect(sent.map((item) => [item.start.local, item.end.local, item.counts_as_work])).toEqual([
      [`${date}T11:00`, `${date}T11:15`, false],
      [`${date}T13:00`, `${date}T13:30`, false],
      [`${date}T15:30`, `${date}T15:45`, false],
    ]);
    // The card now shows the breaks in the display zone (R-07), the table that replaced the suggestion chips.
    await expect(card.locator('[data-session-state]')).toHaveText('Breaks confirmed');
    const cells = card.locator('tbody tr').getByRole('cell');
    const times = ['11:00', '13:00', '15:30'].map((time) => wallTimeIn(date, time, LA, displayZone));
    await expect(card.locator('tbody tr')).toHaveCount(3);
    await expect(cells.nth(2)).toHaveText(times[0]?.slice(11) ?? '');
    await expect(cells.nth(6)).toHaveText(times[1]?.slice(11) ?? '');
    await expect(cells.nth(10)).toHaveText(times[2]?.slice(11) ?? '');
    const after = (await employeeSeed.dayView(date)).sessions[0];
    expect(after?.id).toBe(before?.id);
    expect(after?.start_utc).toBe(before?.start_utc);
    expect(after?.end_utc).toBe(before?.end_utc);
    expect(after?.breaks_confirmed).toBe(true);
    expect(after?.breaks.map((item) => `${wallClock(item.start_utc, LA)}-${wallClock(item.end_utc, LA)}`)).toEqual([
      '11:00:00-11:15:00',
      '13:00:00-13:30:00',
      '15:30:00-15:45:00',
    ]);
    expect((await employeeSeed.dayView(date)).calculation?.status).toBe('complete');
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

// WP5-UX3-FIX3 item 8 (coordinator decision on F-UX3B-2): "Confirm breaks" lists the suggested breaks that lie inside the session, as
// docs/04 says and as the new-session pre-fill does, not all or nothing. A session of 09:00 to 14:00 fits the first two suggestions
// (11:00 and 13:00) but not the third (15:30); the dialog used to open with none.
test('"Confirm breaks" lists the suggested breaks that lie inside a 09:00 to 14:00 session (two of three); Save sends those two', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const puts: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname.startsWith('/api/sessions/')) puts.push(request.postDataJSON() as Record<string, unknown>);
  });
  try {
    await employeeSeed.createSession(date, '09:00', '14:00', null);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    expect(before?.breaks_confirmed).toBe(false);
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: /^Confirm breaks/ }).click();
    const form = sessionDialog(page, 'Edit session');
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(form.locator('[data-break]'), 'the two suggestions inside the session are listed').toHaveCount(2);
    for (const [index, [from, minutes, end]] of [['11:00', '15', 'ends 11:15'], ['13:00', '30', 'ends 13:30']].entries()) {
      const row = breakRow(form, index + 1);
      await expect(row.time).toHaveValue(from ?? '');
      await expect(row.minutes).toHaveValue(minutes ?? '');
      await expect(row.row).toContainText(end ?? '');
      await expect(row.row).toContainText('suggested');
    }
    expect(puts).toEqual([]);
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    const confirm = saveConfirmation(page);
    await expect(confirm.locator('.confirm-facts')).toContainText('2 breaks (15, 30 min)');
    await confirm.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(puts).toHaveLength(1);
    expect(puts[0]).toMatchObject({ breaks_confirmed: true, expected_version: before?.version, input_zone: LA });
    const sent = (puts[0]?.breaks ?? []) as Array<{ start: { local: string }; end: { local: string } }>;
    expect(sent.map((item) => [item.start.local, item.end.local])).toEqual([
      [`${date}T11:00`, `${date}T11:15`],
      [`${date}T13:00`, `${date}T13:30`],
    ]);
    const after = (await employeeSeed.dayView(date)).sessions[0];
    expect(after?.breaks_confirmed).toBe(true);
    expect(after?.breaks).toHaveLength(2);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

test('"Confirm breaks" in an old period waits for the reason before it can save, and sends it (AC-04)', async ({ page, employeeSeed, signInThroughUi }) => {
  const bodies: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname.startsWith('/api/sessions/')) bodies.push(request.postDataJSON() as Record<string, unknown>);
  });
  try {
    await employeeSeed.call(
      'POST',
      `/api/days/${OLD_DAY}/sessions`,
      {
        start: { local: `${OLD_DAY}T09:00`, zone: LA },
        end: { local: `${OLD_DAY}T17:00`, zone: LA },
        input_zone: LA,
        breaks_confirmed: false,
        breaks: [],
        reason: 'e2e seed',
      },
      201,
    );
    await signInThroughUi();
    const editor = await openEditor(page, OLD_DAY);
    await editor.getByRole('button', { name: /^Confirm breaks/ }).click();
    const form = sessionDialog(page, 'Edit session');
    // The one-tap "No breaks taken" is now the box of the dialog; the dialog cannot be saved without the reason.
    await chooseNoBreaks(form);
    await expect(form.locator('[data-break]'), 'the ticked box hides the rows').toHaveCount(0);
    const save = form.getByRole('button', { name: 'Save', exact: true });
    await expect(save).toBeDisabled();
    await expect(form.getByText('Enter a reason for this old period above to save.')).toBeVisible();

    // The dialog shows the editor's one reason field: typed here, it is the same text in the panel.
    await form.getByLabel('Reason for editing an old or finalized period').fill('Confirming a past day (synthetic)');
    await expect(save).toBeEnabled();
    expect(bodies).toEqual([]);
    await save.click();
    await expect(saveConfirmation(page).locator('.confirm-facts')).toContainText('No breaks taken');
    await saveConfirmation(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    await expect(editor.getByLabel('Reason for editing an old or finalized period')).toHaveValue('Confirming a past day (synthetic)');
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({ breaks: [], breaks_confirmed: true, reason: 'Confirming a past day (synthetic)' });
    const after = (await employeeSeed.dayView(OLD_DAY)).sessions[0];
    expect(after?.breaks_confirmed).toBe(true);
    expect(after?.breaks).toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(OLD_DAY);
  }
});

test('"Confirm breaks" lists nothing when no suggested break fits inside the session; Save asks, and "Confirm no breaks taken" sends the empty confirmed list', async ({
  page,
  employeeSeed,
  signInThroughUi,
}) => {
  const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
  const puts: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname.startsWith('/api/sessions/')) puts.push(request.postDataJSON() as Record<string, unknown>);
  });
  try {
    // 09:00 to 10:30: the first suggested break (11:00) would lie after the end, so none is offered (never deduct a future break).
    await employeeSeed.createSession(date, '09:00', '10:30', null);
    const before = (await employeeSeed.dayView(date)).sessions[0];
    await signInThroughUi();
    const editor = await openEditor(page, date);
    await editor.getByRole('button', { name: /^Confirm breaks/ }).click();
    const form = sessionDialog(page, 'Edit session');
    // Nothing is decided for the person: no row is offered and the box stays unticked, so Save first asks (G-4).
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(form.locator('[data-break]')).toHaveCount(0);
    expect(puts).toEqual([]);
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    await noBreaksNotice(page).getByRole('button', { name: 'Confirm no breaks taken' }).click();
    const confirm = saveConfirmation(page);
    await expect(confirm.locator('.confirm-facts')).toContainText('No breaks taken');
    await expect(confirm).toHaveAccessibleDescription('Saving confirms these breaks as the breaks you took.');
    expect(puts).toEqual([]);
    await confirm.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(puts).toHaveLength(1);
    expect(puts[0]).toMatchObject({ breaks: [], breaks_confirmed: true, expected_version: before?.version, input_zone: LA });
    const after = (await employeeSeed.dayView(date)).sessions[0];
    expect(after?.breaks_confirmed).toBe(true);
    expect(after?.breaks).toHaveLength(0);
  } finally {
    await employeeSeed.clearSessions(date);
  }
});

// WP5-UX3-FIX4 item 6 (R-B2-1, accepted for T08B): "Confirm breaks" has no past-day rule. A session that ended earlier today lists the
// suggested breaks that lie inside it, like a session of a past day does. (The new-session pre-fill keeps its past-day rule.)
test('"Confirm breaks" on a session that ended earlier today lists the suggested break inside it; Save sends it', async ({ page, employeeSeed, signInThroughUi }) => {
  // Started three hours ago and ended 30 minutes ago: of the policy's breaks (120, 240 and 390 minutes after the start) only the first lies inside.
  const run = await seedRunning(employeeSeed, 3);
  const puts: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname.startsWith('/api/sessions/')) puts.push(request.postDataJSON() as Record<string, unknown>);
  });
  try {
    await employeeSeed.call('PUT', `/api/sessions/${run.id}`, {
      start: instantAt(run.startMs),
      end: instantAt(run.startMs + 150 * 60_000),
      input_zone: LA,
      breaks: [],
      breaks_confirmed: false,
      expected_version: run.version,
    });
    const before = (await employeeSeed.dayView(run.todayLocal)).sessions[0];
    expect(before?.end_utc, 'the session ended earlier today').not.toBeNull();
    expect(before?.breaks_confirmed).toBe(false);
    expect(before?.breaks).toHaveLength(0);
    await signInThroughUi();
    const editor = await openEditor(page, run.todayLocal);
    await editor.getByRole('button', { name: /^Confirm breaks/ }).click();
    const form = sessionDialog(page, 'Edit session');
    await expect(form.getByRole('checkbox', { name: 'Confirm no breaks taken' })).not.toBeChecked();
    await expect(form.locator('[data-break]'), 'the one suggestion inside the session is listed').toHaveCount(1);
    const row = breakRow(form, 1);
    await expect(row.time).toHaveValue(wallClock(instantAt(run.startMs + 120 * 60_000), LA));
    await expect(row.minutes).toHaveValue('15');
    await expect(row.row).toContainText('suggested');
    expect(puts).toEqual([]);
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    const confirm = saveConfirmation(page);
    await expect(confirm.locator('.confirm-facts')).toContainText('1 break (15 min)');
    await confirm.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor.getByText('Session saved.')).toBeVisible();
    expect(puts).toHaveLength(1);
    expect(puts[0]).toMatchObject({ breaks_confirmed: true, input_zone: LA });
    const sent = (puts[0]?.breaks ?? []) as Array<{ start: { local: string }; end: { local: string } }>;
    expect(sent, 'one break is sent').toHaveLength(1);
    expect(sent[0]?.start.local.startsWith(localAfter(run, 120).replace(' ', 'T'))).toBe(true);
    expect(sent[0]?.end.local.startsWith(localAfter(run, 135).replace(' ', 'T'))).toBe(true);
    const after = (await employeeSeed.dayView(run.todayLocal)).sessions[0];
    expect(after?.breaks_confirmed).toBe(true);
    expect(after?.breaks).toHaveLength(1);
  } finally {
    await employeeSeed.clearSessions(run.todayLocal);
  }
});

test('the label cell is a picker: a one-entry batch preview and its commit; recorded work and old periods still go through the review', async ({
  page,
  adminSeed,
  builtServer,
  signInPageAs,
}, testInfo) => {
  test.setTimeout(90_000);
  const project = testInfo.project.name;
  // A fresh person, so the labels this test sets touch no other test's days.
  const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Picker', signature: 'none' });
  const free = await person.api.displayedPeriodFreeWorkdays();
  expect(free.length, 'two past free workdays in the displayed period').toBeGreaterThanOrEqual(2);
  const [plainDay = '', workedDay = ''] = free;
  await person.api.seedCompleteDay(workedDay);
  const batch: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/days/batch') batch.push(request.postDataJSON() as Record<string, unknown>);
  });
  await signInPageAs(person.account, '#/timesheet');
  await expect(page.locator('[data-day]')).toHaveCount(14);
  const pickerOf = (workDate: string) => page.getByRole('button', { name: new RegExp(`^Category for ${workDate}`) });
  const listOf = (workDate: string) => page.getByRole('listbox', { name: `Category for ${workDate}` });

  // 1. A current day without recorded work: preview, then the commit of the same entry; no dialog, no editor.
  const picker = pickerOf(plainDay);
  await expect(picker).toHaveAttribute('aria-expanded', 'false');
  await picker.click();
  const list = listOf(plainDay);
  await expect(list).toBeVisible();
  await expect(picker).toHaveAttribute('aria-expanded', 'true');
  await expect(list.getByRole('option')).toHaveText(['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown', 'Work from home']);
  await expect(list.getByRole('option', { name: 'Worked', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: screenshotPath(`editor-label-picker-${project}-synthetic.png`), animations: 'disabled' });
  await list.getByRole('option', { name: 'Vacation', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const entry = { work_date: plainDay, category: 'Vacation', expected_version: null };
  expect(batch).toEqual([
    { mode: 'preview', entries: [entry] },
    { mode: 'commit', entries: [entry] },
  ]);
  expect((await person.api.dayView(plainDay)).category).toBe('Vacation');
  await expect(page.locator(`[data-day="${plainDay}"]`)).toContainText('Vacation');
  await expect(picker).toBeFocused();

  // 2. By keyboard, "Work from home" is Worked plus WFH, with the version now stored; Escape changes nothing.
  batch.length = 0;
  const version = (await person.api.dayView(plainDay)).entry?.version;
  await page.keyboard.press('ArrowDown');
  await expect(list).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page.locator(`[data-day="${plainDay}"]`)).toContainText('Work from home');
  expect(batch.at(-1)).toEqual({ mode: 'commit', entries: [{ work_date: plainDay, category: 'Worked', wfh: true, expected_version: version }] });
  expect(await person.api.dayView(plainDay)).toMatchObject({ category: 'Worked', wfh: true, leave_minutes: 0 });
  await expect(picker).toBeFocused();
  batch.length = 0;
  await page.keyboard.press('Enter');
  await expect(list).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
  await expect(picker).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(batch).toEqual([]);

  // 3. A day with recorded work: the review dialog shows the conflict and needs the confirmation.
  await pickerOf(workedDay).click();
  await listOf(workedDay).getByRole('option', { name: 'Off', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: `Review category change for ${workedDay}` })).toBeVisible();
  await expect(dialog.locator(`[data-preview-date="${workedDay}"]`)).toContainText('to Off');
  // WP5-UX3-T07: the preview says "category change", the word of the Category row, not "label change".
  await expect(dialog.locator(`[data-preview-date="${workedDay}"]`)).toContainText('category change');
  await expect(dialog.locator(`[data-preview-date="${workedDay}"]`)).not.toContainText('label change');
  expect(batch.map((body) => body.mode)).toEqual(['preview']);
  expect((await person.api.dayView(workedDay)).category).toBe('Worked');
  await dialog.getByRole('button', { name: 'Review conflicts' }).click();
  await expect(dialog.locator(`[data-conflict-date="${workedDay}"]`)).toContainText('manual session');
  // The step says "category" in its heading, its sentence and its checkbox (FIX2 item 4: no "day label" left).
  await expect(dialog.getByText("Only the day's category changes.")).toBeVisible();
  await expect(dialog).not.toContainText('day label');
  const confirmCommit = dialog.getByRole('button', { name: 'Confirm and commit' });
  await expect(confirmCommit).toBeDisabled();
  await dialog.getByLabel('I confirm the category change for these dates').check();
  await confirmCommit.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  expect(batch.at(-1)).toMatchObject({ mode: 'commit', confirm_conflicts: true, entries: [{ work_date: workedDay, category: 'Off' }] });
  const worked = await person.api.dayView(workedDay);
  expect(worked.category).toBe('Off');
  expect(worked.sessions).toHaveLength(1);
  await expect(pickerOf(workedDay)).toBeFocused();

  // 4. An old period: the pick asks for the reason (AC-04) before anything is saved.
  await page.getByRole('button', { name: 'Previous period' }).click();
  await expect(page.locator('.period-title .badge.old')).toBeVisible();
  const oldDay = (await page.locator('[data-day]').nth(2).getAttribute('data-day')) ?? '';
  expect(oldDay).not.toBe('');
  batch.length = 0;
  await pickerOf(oldDay).click();
  await listOf(oldDay).getByRole('option', { name: 'Sick', exact: true }).click();
  const reasonDialog = page.getByRole('dialog');
  const reason = reasonDialog.getByLabel(/Reason for editing an old or finalized period/);
  await expect(reason).toBeVisible();
  const commitOld = reasonDialog.getByRole('button', { name: 'Commit changes' });
  await expect(commitOld).toBeDisabled();
  expect(batch.map((body) => body.mode)).toEqual(['preview']);
  await reason.fill('Corrected label (synthetic)');
  await commitOld.click();
  await expect(page.getByRole('status')).toContainText('Saved 1 day.');
  expect(batch.at(-1)).toMatchObject({ mode: 'commit', reason: 'Corrected label (synthetic)', entries: [{ work_date: oldDay, category: 'Sick' }] });
  expect((await person.api.dayView(oldDay)).category).toBe('Sick');
});

/* ---- WP5-UX-B3-01: the editor switches mode across 1360px while a review dialog is open ---------- */

/** What the open dialogs look like: which one holds focus and which one is on top at its own centre. */
type DialogState = { name: string; modal: boolean; focus: boolean; onTop: boolean };

function dialogStates(page: Page): Promise<{ dialogs: DialogState[]; active: string }> {
  return page.evaluate(`(() => {
    const nameOf = (dialog) => {
      const id = dialog.getAttribute('aria-labelledby');
      const heading = id === null ? null : document.getElementById(id);
      return (heading?.textContent ?? '').replace(/\\s+/g, ' ').trim();
    };
    const dialogs = [...document.querySelectorAll('dialog[open]')].map((dialog) => {
      const box = dialog.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return { name: nameOf(dialog), modal: dialog.matches(':modal'), focus: dialog.contains(document.activeElement), onTop: hit !== null && dialog.contains(hit) };
    });
    const active = document.activeElement;
    return { dialogs, active: active === null ? 'none' : active.tagName };
  })()`);
}

/** Waits until React has rendered the new width and its effects have run (two frames and a task). */
async function settleAfterResize(page: Page, wide: boolean) {
  const area = page.locator('.sheet-area');
  if (wide) await expect(area).toHaveClass(/with-editor/);
  else await expect(area).not.toHaveClass(/with-editor/);
  await page.evaluate('new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 100))))');
}

test.describe('WP5-UX-B3-01: a review dialog open over the editor keeps Escape and focus when the window crosses 1360px', () => {
  test.skip(({ isMobile }) => isMobile, 'Crossing 1360px is a desktop-project layout change');

  // WP5-UX3-T05B: the same two paths with the crossing moved from 1200 to 1360 (start 1440; the narrow width 1280 floats the panel).
  for (const path of [
    { name: '1440 to 1280', widths: [1280], endsWide: false },
    { name: '1280 back to 1440', widths: [1280, 1440], endsWide: true },
  ]) {
    test(`${path.name}: the review stays on top and focused, Escape closes it first and then the editor`, async ({
      page,
      adminSeed,
      builtServer,
      signInPageAs,
    }) => {
      test.setTimeout(60_000);
      // A fresh person, so the review touches no other test's days.
      const person = await newPerson(adminSeed, builtServer, { displayName: 'Synthetic Resize', signature: 'none' });
      const free = await person.api.displayedPeriodFreeWorkdays();
      expect(free.length, 'two past free workdays in the displayed period').toBeGreaterThanOrEqual(2);
      const [editDay = '', workedDay = ''] = free;
      await person.api.seedCompleteDay(workedDay);
      const batch: Array<Record<string, unknown>> = [];
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/api/days/batch') batch.push(request.postDataJSON() as Record<string, unknown>);
      });
      await page.setViewportSize({ width: 1440, height: 800 });
      await signInPageAs(person.account, '#/timesheet');
      await expect(page.locator('[data-day]')).toHaveCount(14);
      const dayButton = namedDayButton(page, editDay, 'Edit');

      // The non-modal editor beside the sheet, then a label pick on a worked day opens the review over it.
      await dayButton.click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      await expect(editor.getByRole('heading', { name: 'Figures (computed by the server)' })).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(false);
      await page.getByRole('button', { name: new RegExp(`^Category for ${workedDay}`) }).click();
      await page.getByRole('listbox', { name: `Category for ${workedDay}` }).getByRole('option', { name: 'Off', exact: true }).click();
      const review = page.getByRole('dialog', { name: `Review category change for ${workedDay}` });
      await expect(review).toBeVisible();
      await expect.poll(async () => review.evaluate((element) => element.matches(':focus-within'))).toBe(true);

      for (const width of path.widths) {
        await page.setViewportSize({ width, height: 800 });
        await settleAfterResize(page, width >= 1360);
        const state = await dialogStates(page);
        const reviewState = state.dialogs.find((dialog) => dialog.name.startsWith('Review category change'));
        const editorState = state.dialogs.find((dialog) => dialog.name.startsWith('Day editor'));
        expect(editorState, `the editor is still open at ${width}px`).toBeDefined();
        expect(reviewState, `the review stays open, modal, on top and focused at ${width}px`).toMatchObject({ modal: true, focus: true, onTop: true });
        expect(editorState?.focus, `the editor does not take focus from the review at ${width}px`).toBe(false);
        // The review's own button is what a pointer reaches, not the editor above it.
        const cancel = await review.getByRole('button', { name: 'Cancel', exact: true }).boundingBox();
        expect(cancel, 'Cancel box').not.toBeNull();
        const x = (cancel?.x ?? 0) + (cancel?.width ?? 0) / 2;
        const y = (cancel?.y ?? 0) + (cancel?.height ?? 0) / 2;
        const hitInReview = await page.evaluate<boolean>(
          `document.elementFromPoint(${x}, ${y})?.closest('dialog')?.getAttribute('aria-labelledby') === 'batch-title'`,
        );
        expect(hitInReview, `the review's Cancel button is on top at ${width}px`).toBe(true);
      }
      if (path.endsWide) await page.screenshot({ path: screenshotPath('fix5-review-on-top-w1440-synthetic.png'), animations: 'disabled' });
      else await page.screenshot({ path: screenshotPath('fix5-review-on-top-w1280-synthetic.png'), animations: 'disabled' });

      // The first Escape closes only the review; nothing is saved and the editor stays open.
      await page.keyboard.press('Escape');
      await expect(review).toHaveCount(0);
      await expect(editor).toBeVisible();
      if (path.endsWide) {
        // From 1360px the editor is the non-modal panel; focus is back on the picker that opened the review.
        expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(false);
        await expect(page.getByRole('button', { name: new RegExp(`^Category for ${workedDay}`) })).toBeFocused();
      } else {
        // Below 1360px the editor now is the floating modal panel and holds focus; the page behind is inert.
        await expect.poll(async () => editor.evaluate((element) => element.matches(':modal'))).toBe(true);
        await expect.poll(async () => editor.evaluate((element) => element.matches(':focus-within'))).toBe(true);
      }
      expect(batch.map((body) => body.mode)).toEqual(['preview']);
      expect((await person.api.dayView(workedDay)).category).toBe('Worked');

      // The next Escape closes the editor and focus returns to the day's own button.
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(dayButton).toBeFocused();
      expect(batch.map((body) => body.mode)).toEqual(['preview']);
      expect((await person.api.dayView(workedDay)).category).toBe('Worked');
    });
  }
});

/* ---- WP5-UX3-T08: the session dialog, its notice and confirmations nested in the editor (B3-01 lesson) ---------- */

test.describe('WP5-UX3-T08: Escape closes only the top dialog, and focus returns where it was', () => {
  test.skip(({ isMobile }) => isMobile, 'The panel beside the sheet and the floating panel are desktop-project layouts (the bottom sheet runs the same dialogs in the tests above)');

  for (const { width, modal } of [
    { width: 1366, modal: false },
    { width: 1280, modal: true },
  ]) {
    test(`at ${width}px (${modal ? 'floating modal' : 'non-modal'} editor): the confirmation, the discard question, the session dialog, then the editor`, async ({
      page,
      employeeSeed,
      signInThroughUi,
    }) => {
      const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
      const posts = recordSessionPosts(page, date);
      await page.setViewportSize({ width, height: 800 });
      await signInThroughUi();
      const dayButton = namedDayButton(page, date, 'Edit');
      await dayButton.click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(modal);
      const add = editor.getByRole('button', { name: 'Add session' });
      await add.click();
      const form = sessionDialog(page, 'New session');
      await expect(form.getByRole('heading', { name: 'New session' })).toBeFocused();

      // The pre-filled rows are listed, so Save opens the final confirmation directly; its Escape closes it alone.
      const save = form.getByRole('button', { name: 'Save', exact: true });
      await save.click();
      const confirm = saveConfirmation(page);
      await expect(confirm.getByRole('button', { name: 'Back' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(confirm).toHaveCount(0);
      await expect(form, 'the first Escape closes only the confirmation, not the session dialog').toBeVisible();
      await expect(editor).toBeVisible();
      await expect(save).toBeFocused();

      // After a change, Escape asks "Discard your changes?"; its Escape keeps editing, with focus back on the field.
      const minutes = breakRow(form, 1).minutes;
      await minutes.fill('20');
      await page.keyboard.press('Escape');
      const discard = page.getByRole('alertdialog', { name: 'Discard your changes?' });
      await expect(discard.getByRole('button', { name: 'Keep editing' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(discard).toHaveCount(0);
      await expect(form).toBeVisible();
      await expect(minutes).toBeFocused();
      await expect(minutes).toHaveValue('20');
      await page.keyboard.press('Escape');
      await discard.getByRole('button', { name: 'Discard', exact: true }).click();
      await expect(form).toHaveCount(0);
      await expect(editor).toBeVisible();
      await expect(add).toBeFocused();

      // Unchanged, Escape closes the session dialog at once; the next Escape closes the editor.
      await add.click();
      await expect(form).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(form).toHaveCount(0);
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await expect(editor).toBeVisible();
      await expect(add).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(dayButton).toBeFocused();
      expect(posts).toEqual([]);
    });
  }

  for (const path of [
    { name: '1440 to 1280', widths: [1280], endsWide: false },
    { name: '1280 back to 1440', widths: [1280, 1440], endsWide: true },
  ]) {
    test(`${path.name}: the final confirmation stays on top and focused while the window crosses 1360px; Escape closes it, then the session dialog, then the editor`, async ({
      page,
      employeeSeed,
      signInThroughUi,
    }) => {
      const [date = ''] = need(await employeeSeed.displayedPeriodFreeWorkdays(), 1);
      const posts = recordSessionPosts(page, date);
      await page.setViewportSize({ width: 1440, height: 800 });
      await signInThroughUi();
      const dayButton = namedDayButton(page, date, 'Edit');
      await dayButton.click();
      const editor = page.getByRole('dialog', { name: /Day editor/ });
      await expect(editor).toBeVisible();
      expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(false);
      const add = editor.getByRole('button', { name: 'Add session' });
      await add.click();
      const form = sessionDialog(page, 'New session');
      await form.getByRole('button', { name: 'Save', exact: true }).click();
      const confirm = saveConfirmation(page);
      await expect(confirm.getByRole('button', { name: 'Back' })).toBeFocused();

      for (const width of path.widths) {
        await page.setViewportSize({ width, height: 800 });
        await settleAfterResize(page, width >= 1360);
        const state = await dialogStates(page);
        const confirmState = state.dialogs.find((dialog) => dialog.name === 'Save this session?');
        expect(confirmState, `the confirmation stays open, modal, on top and focused at ${width}px`).toMatchObject({ modal: true, focus: true, onTop: true });
        // The confirmation is nested in the session dialog, so "contains the hit" is true for both; the hit test above decides which is on top.
        expect(state.dialogs.find((dialog) => dialog.name === 'New session'), `the session dialog stays open under it at ${width}px`).toMatchObject({ modal: true });
        expect(state.dialogs.some((dialog) => dialog.name.startsWith('Day editor')), `the editor is still open at ${width}px`).toBe(true);
        await expect(confirm.getByRole('button', { name: 'Back' })).toBeFocused();
      }

      await page.keyboard.press('Escape');
      await expect(confirm).toHaveCount(0);
      await expect(form).toBeVisible();
      await expect(form.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(form).toHaveCount(0);
      await expect(editor).toBeVisible();
      if (path.endsWide) {
        // Back to the non-modal panel beside the sheet: focus is on the button that opened the dialog.
        expect(await editor.evaluate((element) => element.matches(':modal'))).toBe(false);
        await expect(add).toBeFocused();
      } else {
        // Below 1360px the editor switches to the floating modal panel only now, and holds focus.
        await expect.poll(async () => editor.evaluate((element) => element.matches(':modal'))).toBe(true);
        await expect.poll(async () => editor.evaluate((element) => element.matches(':focus-within'))).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(dayButton).toBeFocused();
      expect(posts).toEqual([]);
    });
  }
});
