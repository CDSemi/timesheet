import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Page } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { formatHoursMinutes } from '../../src/server/pdf/layout.ts';
import { readPdf } from '../support/pdfText.ts';
import {
  type BuiltServer,
  drainJobsFrom,
  expect,
  type Person,
  newPerson,
  screenshotPath,
  SeedClient,
  test,
} from './fixtures.ts';

/*
 * Visual evidence of the timesheet PDF (WP3-T14, gate item 10). The PDFs are real revisions made by the
 * BUILT server on this test's own private server (manual sign-off through the API, automatic submission
 * through `run-jobs --once --now` after a synthetic activation), downloaded as their owner, and rendered
 * page 1 in the installed Edge with pdfjs-dist (the page tests/e2e/assets/pdf-view.html, served with the pdfjs
 * build and the PDF from a synthetic origin through page.route; the PDF is never written to disk). The
 * screenshots are named pdf-*-synthetic.png. Each render is also read back as text and image placements
 * (tests/support/pdfText.ts) so the facts a viewer must check are asserted, not only looked at.
 *
 * A PDF page has no viewport, so these run once, on the desktop project.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const VIEW_ORIGIN = 'http://pdf-view.invalid';
const ZONE = 'America/Los_Angeles';

/** Code points keep this file ASCII whatever tool wrote it. */
const text = (...codePoints: number[]): string => String.fromCodePoint(...codePoints);
// "Nguyen Thi Hong Anh" with Vietnamese diacritics (long on purpose: it must shrink to fit, not overflow).
const VIETNAMESE_NAME = `Nguy${text(0x1ec5)}n Th${text(0x1ecb)} H${text(0x1ed3)}ng ${text(0xc1)}nh Tr${text(0x1ea7)}n L${text(0xea)} Ph${text(0x1ea1)}m Ho${text(0xe0)}ng`;
// "Ngay Quoc khanh dai le" and a deliberately long "Ngay nghi ... " label with diacritics.
const HOLIDAY_SHORT = `Qu${text(0x1ed1)}c kh${text(0xe1, 0x6e, 0x68)}`;
const HOLIDAY_LONG = `Ngh${text(0x1ec9)} l${text(0x1ec5)} t${text(0x1ed5)}ng k${text(0x1ebf)}t n${text(0x103)}m c${text(0xf4)}ng ty v${text(0xe0)} h${text(0x1ecd)}p m${text(0x1eb7)}t kh${text(0xe1)}ch h${text(0xe0)}ng`;
const NOTE_VIETNAMESE = `N${text(0x1ed9)}p t${text(0x1ef1)} ${text(0x111, 0x1ed9)}ng theo l${text(0x1ecb)}ch c${text(0x1ee7)}a c${text(0xf4)}ng ty`;

test.beforeEach(({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'a PDF page has no viewport: rendered once, on desktop');
  page.on('pageerror', (error) => {
    throw error;
  });
});

/** Renders page 1 of `bytes` in Edge with pdfjs-dist and saves the canvas as pdf-<name>-synthetic.png. */
async function renderPdf(page: Page, bytes: Buffer, name: string): Promise<{ width: number; height: number }> {
  const pdfjs = resolve(REPO_ROOT, 'node_modules', 'pdfjs-dist', 'build');
  const assets: Record<string, { body: Buffer; type: string }> = {
    '/': { body: readFileSync(resolve(import.meta.dirname, 'assets', 'pdf-view.html')), type: 'text/html; charset=utf-8' },
    '/pdf.mjs': { body: readFileSync(resolve(pdfjs, 'pdf.mjs')), type: 'text/javascript; charset=utf-8' },
    '/pdf.worker.mjs': { body: readFileSync(resolve(pdfjs, 'pdf.worker.mjs')), type: 'text/javascript; charset=utf-8' },
    '/doc.pdf': { body: bytes, type: 'application/pdf' },
  };
  await page.route(`${VIEW_ORIGIN}/**`, (route) => {
    const asset = assets[new URL(route.request().url()).pathname];
    if (asset === undefined) return route.fulfill({ status: 404, body: 'not found' });
    return route.fulfill({ status: 200, contentType: asset.type, body: asset.body });
  });
  await page.setViewportSize({ width: 920, height: 1240 });
  await page.goto(`${VIEW_ORIGIN}/?page=1&scale=1.5`);
  await page.waitForFunction('window.__pdfRender !== undefined', undefined, { timeout: 30_000 });
  const result = await page.evaluate<{ ok: boolean; error?: string; pages?: number; width?: number; height?: number }>('window.__pdfRender');
  expect(result, `render of ${name}`).toMatchObject({ ok: true, pages: 1 });
  // A blank canvas would be a silent failure: the page must contain dark pixels.
  const dark = await page.evaluate<number>(`(() => {
    const canvas = document.getElementById('page');
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) count += 1;
    return count;
  })()`);
  expect(dark, `${name}: the rendered page is not blank`).toBeGreaterThan(2_000);
  await page.locator('#page').screenshot({ path: screenshotPath(`pdf-${name}-synthetic.png`) });
  await page.unroute(`${VIEW_ORIGIN}/**`);
  return { width: result.width ?? 0, height: result.height ?? 0 };
}

const usDate = (instant: Date): string => new Intl.DateTimeFormat('en-US', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
const weekdayOf = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();

async function privateAdmin(server: BuiltServer): Promise<SeedClient> {
  return new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
}

interface Imported {
  committed: boolean;
}

/** Long Vietnamese holiday names on two weekdays of the displayed period (admin holiday import, prospective only). */
async function importHolidays(admin: SeedClient, periodStart: string, dates: Array<[string, string]>): Promise<void> {
  const calendar = await admin.call<{ id: string }>('GET', '/api/calendar');
  const csv = ['date,name,kind', ...dates.map(([date, name]) => `${date},${name},holiday`)].join('\n');
  const body = { calendar_id: calendar.id, year: Number(periodStart.slice(0, 4)), effective_from: periodStart, csv, remove_dates: [] };
  const preview = await admin.call<{ preview_hash: string }>('POST', '/api/admin/calendar/import/preview', body);
  const done = await admin.call<Imported>('POST', '/api/admin/calendar/import/commit', { ...body, preview_hash: preview.preview_hash }, 201);
  expect(done.committed).toBe(true);
}

interface ApiReview {
  payload: {
    days: Array<{ work_date: string; calculation: { credited_minutes: number | null } | null }>;
    totals: { credited_minutes: number };
  };
  payload_hash: string;
  expected_version: number;
}

/** The owner's PDF of the period's current revision, after the CLI has drained the jobs. */
async function pdfOf(person: Person, payrollDate: string): Promise<Buffer> {
  const finalized = await person.api.call<{ revision: { id: string } }>('GET', `/api/timesheets/${payrollDate}/finalization`);
  const download = await person.api.download(`/api/revisions/${finalized.revision.id}/pdf`);
  expect(download.status, 'PDF download').toBe(200);
  return download.body;
}

test('a manual revision: name, real sign date, signature, OT on both Sundays in the total, Vietnamese text', async ({ page, privateServer }) => {
  test.setTimeout(240_000);
  const server = privateServer;
  const admin = await privateAdmin(server);
  const person = await newPerson(admin, server, { displayName: VIETNAMESE_NAME, to: ['payroll-visual@example.invalid'], autoSubmit: false, signature: 'saved' });
  // The previous period lies wholly in the past, so both of its Sundays can hold sessions (an old period needs a reason).
  const payrollDate = addDays(person.payrollDate, -14);
  const sheet = await person.api.call<{ days: Array<{ work_date: string }> }>('GET', `/api/timesheets/${payrollDate}`);
  const dates = sheet.days.map((day) => day.work_date);
  expect(dates).toHaveLength(14);
  const sundays = dates.filter((date) => weekdayOf(date) === 0);
  expect(sundays, 'two Sundays in a 14-day period').toHaveLength(2);
  const at = (date: string, time: string) => ({ local: `${date}T${time}`, zone: ZONE });
  const addSession = (date: string, from: string, to: string, breaks: Array<[string, string]>) =>
    person.api.call(
      'POST',
      `/api/days/${date}/sessions`,
      {
        start: at(date, from),
        end: at(date, to),
        input_zone: ZONE,
        breaks_confirmed: true,
        breaks: breaks.map(([start, end]) => ({ start: at(date, start), end: at(date, end), counts_as_work: false })),
        reason: 'Synthetic visual-evidence entry (test database only)',
      },
      201,
    );
  // Weekdays: one regular day and one long day (OT), then OT on BOTH Sundays.
  const weekdays = dates.filter((date) => weekdayOf(date) >= 1 && weekdayOf(date) <= 5);
  await addSession(weekdays[0] ?? '', '09:00', '18:00', [['11:00', '11:15'], ['13:00', '13:30'], ['15:30', '15:45']]);
  await addSession(weekdays[1] ?? '', '08:00', '20:00', [['11:00', '11:15'], ['13:00', '13:30'], ['15:30', '15:45']]);
  await addSession(sundays[0] ?? '', '09:00', '14:00', []);
  await addSession(sundays[1] ?? '', '10:00', '17:30', []);

  const review = await person.api.call<ApiReview>('GET', `/api/timesheets/${payrollDate}/review`);
  const ot = (date: string) => review.payload.days.find((day) => day.work_date === date)?.calculation?.credited_minutes ?? 0;
  expect(ot(sundays[0] ?? ''), 'OT on the first Sunday').toBeGreaterThan(0);
  expect(ot(sundays[1] ?? ''), 'OT on the second Sunday').toBeGreaterThan(0);
  expect(review.payload.totals.credited_minutes, 'both Sundays are in the total').toBeGreaterThanOrEqual(ot(sundays[0] ?? '') + ot(sundays[1] ?? ''));

  await person.api.call(
    'POST',
    `/api/timesheets/${payrollDate}/signoff`,
    { expected_version: review.expected_version, reviewed_hash: review.payload_hash, signer_name: VIETNAMESE_NAME, incomplete_evidence_acknowledged: true },
    201,
  );
  const signedOn = new Date();
  drainJobsFrom(server, new Date());
  const pdf = await pdfOf(person, payrollDate);

  // Read back: the facts the render must show.
  const printed = await readPdf(new Uint8Array(pdf));
  expect(printed.pages).toHaveLength(1);
  expect(printed.text).toContain(VIETNAMESE_NAME);
  expect(printed.text, 'the real sign date').toContain(usDate(signedOn));
  expect(printed.pages[0]?.images.length, 'the signature image').toBe(1);
  for (const date of dates) expect(printed.text, `date ${date}`).toContain(`${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`);
  for (const sunday of sundays) expect(printed.text, `OT cell of ${sunday}`).toContain(formatHoursMinutes(ot(sunday)));
  expect(printed.text, 'the total').toContain(`${formatHoursMinutes(review.payload.totals.credited_minutes)} h:mm`);
  expect(printed.text).not.toMatch(/automatic/i);

  const size = await renderPdf(page, pdf, 'manual-ot-sundays-vietnamese');
  expect(size.width).toBeGreaterThan(800);
});

test('automatic revisions: the note off/on and the image off/on, long Vietnamese labels, an empty period', async ({ page, privateServer }) => {
  test.setTimeout(300_000);
  const server = privateServer;
  const admin = await privateAdmin(server);
  const periods = await admin.call<{ reporting_zone: string; current: { period_start: string; due_at_utc: string } }>('GET', '/api/periods/current');
  const start = periods.current.period_start;
  // A short and a very long holiday name on two weekdays of the displayed period (default labels, no entries needed).
  const holidayA = addDays(start, 1);
  const holidayB = addDays(start, 2);
  await importHolidays(admin, start, [
    [holidayA, HOLIDAY_SHORT],
    [holidayB, HOLIDAY_LONG],
  ]);

  const make = (displayName: string, options: Parameters<typeof newPerson>[2]) =>
    newPerson(admin, server, { displayName, to: ['payroll-visual@example.invalid'], autoSubmit: true, ...options });
  const people = {
    // off/off: name and submission date only, no automatic indicator; has a past session and a Sunday session when the period has them.
    plain: await make(VIETNAMESE_NAME, { signature: 'saved' }),
    // note on, image off
    note: await make('Synthetic Note On', { signature: 'saved', autoNote: { enabled: true, text: NOTE_VIETNAMESE }, signaturePhase: 11 }),
    // note off, image on
    image: await make('Synthetic Image On', { signature: 'authorized', signaturePhase: 5 }),
    // note on, image on, an empty period (default labels only)
    both: await make('Synthetic Both On', { signature: 'authorized', autoNote: { enabled: true, text: NOTE_VIETNAMESE }, signaturePhase: 7 }),
  };
  // Sessions for the first three accounts; `both` stays empty (an empty period renders the default labels).
  const free = await people.plain.api.displayedPeriodFreeWorkdays();
  for (const person of [people.plain, people.note, people.image]) {
    for (const day of free.filter((date) => date !== holidayA && date !== holidayB).slice(0, 2)) await person.api.seedCompleteDay(day);
  }

  const activeFrom = new Date(Date.now() + 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  await admin.call('PUT', '/api/admin/automation/activation', { active_from: activeFrom, reason: 'Synthetic e2e activation (test database only)' });
  const submittedAt = new Date(new Date(periods.current.due_at_utc).getTime() + 5 * 60_000);
  drainJobsFrom(server, submittedAt);
  const payrollDate = people.plain.payrollDate;
  const submissionDate = usDate(submittedAt);

  const cases: Array<[string, Person, { note: string | null; image: boolean }]> = [
    ['automatic-note-off-image-off', people.plain, { note: null, image: false }],
    ['automatic-note-on-image-off', people.note, { note: NOTE_VIETNAMESE, image: false }],
    ['automatic-note-off-image-on', people.image, { note: null, image: true }],
    ['automatic-note-on-image-on-empty-period', people.both, { note: NOTE_VIETNAMESE, image: true }],
  ];
  for (const [name, person, expected] of cases) {
    const pdf = await pdfOf(person, payrollDate);
    const printed = await readPdf(new Uint8Array(pdf));
    expect(printed.text, `${name}: the employee name`).toContain(person.account.displayName);
    expect(printed.text, `${name}: the submission date`).toContain(submissionDate);
    // A holiday label wraps inside its day column, so its first word and the long label's first words are checked.
    expect(printed.text, `${name}: the holiday labels`).toContain('Holiday:');
    expect(printed.text, `${name}: the short holiday label`).toContain(HOLIDAY_SHORT.split(' ')[0] ?? '');
    expect(printed.text, `${name}: the long holiday label`).toContain(HOLIDAY_LONG.split(' ').slice(0, 3).join(' '));
    if (expected.note === null) expect(printed.text, `${name}: no automatic indicator`).not.toMatch(/automatic|review pending|pending review/i);
    else expect(printed.text, `${name}: the note text`).toContain(expected.note);
    expect(printed.pages[0]?.images.length, `${name}: signature image`).toBe(expected.image ? 1 : 0);
    await renderPdf(page, pdf, name);
  }
});
