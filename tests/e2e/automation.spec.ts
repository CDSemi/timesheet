import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { type Page } from '@playwright/test';
import { readPdf } from '../support/pdfText.ts';
import {
  type BuiltServer,
  drainJobsFrom,
  expect,
  type Person,
  newPerson,
  readCapture,
  runJobsAt,
  screenshotPath,
  SeedClient,
  test,
} from './fixtures.ts';

/*
 * Automatic submission through the deadline automation, end to end on both viewports (WP3-T14).
 * Each test starts its own built server (no job runner of its own), records a synthetic activation
 * instant through the admin route and then runs the production CLI `run-jobs --once --now <instant>`
 * with an instant just after the deadline of the period the app displays: the same code path the
 * server's runner takes, with a controlled clock and nothing in the background. Mail is captured
 * (capture mode, example.invalid sender and recipients), never sent. Data are synthetic and every
 * image is generated at run time.
 *
 * The 2x2 matrix of the automatic note line (off/on) and the automatic signature image (not
 * authorized/authorized) is covered by four accounts; a fifth account has the auto-submit switch off.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('console', (message) => {
    const expected = /status of (401|404|409|422)/.test(message.text());
    expect(message.type() === 'error' && !expected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

const NOTE_ASCII = 'Automatic submission by schedule';
// "Nop tu dong theo lich" with Vietnamese diacritics, by code point so this file stays ASCII.
const NOTE_VIETNAMESE = `N${String.fromCodePoint(0x1ed9)}p t${String.fromCodePoint(0x1ef1)} ${String.fromCodePoint(0x111, 0x1ed9)}ng theo l${String.fromCodePoint(0x1ecb)}ch`;

interface PeriodsView {
  reporting_zone: string;
  current: { payroll_date: string; due_at_utc: string };
}

interface ApiFinalization {
  finalized_revision_no: number | null;
  revision: { id: string; revision_no: number; review_state: string; origin: string; send_requested: boolean } | null;
  signoff: unknown;
}

interface ApiAttempt {
  id: string;
  state: string;
}

const finalizationOf = (person: Person) => person.api.call<ApiFinalization>('GET', `/api/timesheets/${person.payrollDate}/finalization`);
const attemptsOf = async (person: Person, revisionId: string) =>
  (await person.api.call<{ deliveries: ApiAttempt[] }>('GET', `/api/deliveries?revision_id=${revisionId}`)).deliveries;

/** Records the synthetic activation a minute from now (an instant in the past is refused). */
async function activate(server: BuiltServer): Promise<void> {
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const activeFrom = new Date(Date.now() + 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  await admin.call('PUT', '/api/admin/automation/activation', { active_from: activeFrom, reason: 'Synthetic e2e activation (test database only)' });
}

/** A complete day on the newest past free workday of the displayed period, when the period has one. */
async function seedDay(person: Person): Promise<string | null> {
  const [day] = await person.api.displayedPeriodFreeWorkdays();
  if (day === undefined) return null;
  await person.api.seedCompleteDay(day);
  return day;
}

/** Signs the page in on the PRIVATE server (the page's base URL is the shared worker server). */
async function signIn(page: Page, server: BuiltServer, person: Person, hash: string): Promise<void> {
  await page.goto(`${server.origin}/${hash}`);
  await page.getByLabel('Email').fill(person.account.email);
  await page.getByLabel('Password').fill(person.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** The US date (MM/DD/YYYY) of an instant in the reporting zone, as the PDF prints it. */
const usDateOf = (instant: Date, zone: string): string =>
  new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);

interface Outcome {
  pdf: Buffer;
  eml: string;
  files: string[];
}

/** The delivered revision of an automatic submission: accepted once, captured, with the same PDF as the download. */
async function deliveredAutomatic(server: BuiltServer, person: Person): Promise<Outcome> {
  const finalized = await finalizationOf(person);
  expect(finalized.finalized_revision_no, `${person.account.displayName}: finalized`).toBe(1);
  expect(finalized.revision).toMatchObject({ revision_no: 1, origin: 'deadline', review_state: 'pending', send_requested: true });
  expect(finalized.signoff, 'no sign-off row, so no sign date').toBeNull();
  const revisionId = finalized.revision?.id ?? '';
  const attempts = await attemptsOf(person, revisionId);
  expect(attempts.map((item) => item.state), 'one accepted attempt').toEqual(['accepted']);
  const download = await person.api.download(`/api/revisions/${revisionId}/pdf`);
  expect(download.status).toBe(200);
  expect(download.body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  const capture = readCapture(server, attempts[0]?.id ?? '');
  expect(capture.files).toEqual(['attachment.pdf', 'message.eml', 'metadata.json']);
  expect(capture.pdf?.equals(download.body), 'the captured attachment is the stored PDF').toBe(true);
  expect(capture.metadata).toMatchObject({ mode: 'capture', envelope: { to: ['payroll-synthetic@example.invalid'] } });
  return { pdf: download.body, eml: capture.eml, files: capture.files };
}

test('the deadline submits automatically: note off/on, image off/on, an empty period, a switch that is off, and the notices', async ({
  page,
  privateServer,
}, testInfo) => {
  test.setTimeout(300_000);
  const project = testInfo.project.name;
  const server = privateServer;
  // The accounts are created through the admin of THIS private server; the shared worker server is never touched.
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);

  const plain = await newPerson(admin, server, { displayName: 'Synthetic Auto Plain', autoSubmit: true, signature: 'saved' });
  const full = await newPerson(admin, server, {
    displayName: 'Synthetic Auto Full',
    autoSubmit: true,
    autoNote: { enabled: true, text: NOTE_VIETNAMESE },
    signature: 'authorized',
    signaturePhase: 7,
  });
  const noteOnly = await newPerson(admin, server, {
    displayName: 'Synthetic Auto Note',
    autoSubmit: true,
    autoNote: { enabled: true, text: NOTE_ASCII },
    signature: 'saved',
    signaturePhase: 11,
  });
  const imageOnly = await newPerson(admin, server, { displayName: 'Synthetic Auto Image', autoSubmit: true, signature: 'authorized', signaturePhase: 5 });
  const off = await newPerson(admin, server, { displayName: 'Synthetic Auto Off', autoSubmit: false, signature: 'saved' });

  // `full` keeps an empty period (default labels); the others have one complete day when the period has a past workday.
  const days = { plain: await seedDay(plain), noteOnly: await seedDay(noteOnly), imageOnly: await seedDay(imageOnly), off: await seedDay(off) };

  const periods = await plain.api.call<PeriodsView>('GET', '/api/periods/current');
  const due = new Date(periods.current.due_at_utc);
  expect(due.getTime(), 'the displayed period is not due yet').toBeGreaterThan(Date.now() + 120_000);

  // Before the activation nothing is automatic, even long after the deadline.
  const early = runJobsAt(server, new Date(due.getTime() + 60_000));
  expect(early.claimed, 'no activation: no scan job, nothing to run').toBe(0);
  expect((await finalizationOf(plain)).finalized_revision_no).toBeNull();

  await activate(server);
  const submittedAt = new Date(due.getTime() + 5 * 60_000);
  const summaries = drainJobsFrom(server, submittedAt);
  expect(summaries.reduce((sum, item) => sum + item.claimed, 0), 'jobs ran').toBeGreaterThan(8);
  // The seeded admin and employee accounts have no recipients: their sends stop with a visible fault (nothing is sent).
  expect(summaries.reduce((sum, item) => sum + item.intervention, 0), `interventions: ${JSON.stringify(summaries)}`).toBe(2);

  const printedDate = usDateOf(submittedAt, periods.reporting_zone);
  const outcomes = {
    plain: await deliveredAutomatic(server, plain),
    full: await deliveredAutomatic(server, full),
    noteOnly: await deliveredAutomatic(server, noteOnly),
    imageOnly: await deliveredAutomatic(server, imageOnly),
  };

  // The printed page: name and submission date; the note only when enabled; the image only when authorized.
  const expectations: Array<[string, Outcome, Person, { note: string | null; image: boolean }]> = [
    ['plain', outcomes.plain, plain, { note: null, image: false }],
    ['full', outcomes.full, full, { note: NOTE_VIETNAMESE, image: true }],
    ['noteOnly', outcomes.noteOnly, noteOnly, { note: NOTE_ASCII, image: false }],
    ['imageOnly', outcomes.imageOnly, imageOnly, { note: null, image: true }],
  ];
  for (const [label, outcome, person, expected] of expectations) {
    const pdf = await readPdf(new Uint8Array(outcome.pdf));
    expect(pdf.pages, `${label}: pages`).toHaveLength(1);
    expect(pdf.text, `${label}: signer name`).toContain(person.account.displayName);
    expect(pdf.text, `${label}: the submission date, not a sign date`).toContain(printedDate);
    expect(pdf.text, `${label}: the OT total line`).toContain('Overtime Total');
    if (expected.note === null) expect(pdf.text, `${label}: no automatic indicator`).not.toMatch(/automatic|pending review|review pending/i);
    else expect(pdf.text, `${label}: the note line`).toContain(expected.note);
    // The signature image is a bounded picture on the page only when authorized.
    expect(pdf.pages[0]?.images.length, `${label}: signature image`).toBe(expected.image ? 1 : 0);
    // The email follows the same switch.
    expect(outcome.eml.includes(NOTE_ASCII), `${label}: the note text in the email`).toBe(expected.note === NOTE_ASCII);
  }
  // The empty period renders with the default labels and no sessions.
  const emptyPdf = await readPdf(new Uint8Array(outcomes.full.pdf));
  expect(emptyPdf.text).toContain('Worked');
  expect(emptyPdf.text, 'an empty period shows no time range').not.toMatch(/\b\d{2}:\d{2}-\d{2}:\d{2}\b/);
  if (days.plain !== null) expect((await readPdf(new Uint8Array(outcomes.plain.pdf))).text, 'the seeded session is printed').toContain('09:00-18:00');
  for (const value of Object.values(days)) expect(value === null || /^\d{4}-\d{2}-\d{2}$/.test(value)).toBe(true);

  // Switch off: no revision, no PDF, no delivery; the overdue record is a notice, not a submission.
  expect((await finalizationOf(off)).finalized_revision_no, 'switch off: not submitted').toBeNull();
  expect((await off.api.call<{ revisions: unknown[] }>('GET', '/api/revisions')).revisions).toEqual([]);
  expect((await off.api.call<{ deliveries: unknown[] }>('GET', '/api/deliveries')).deliveries).toEqual([]);

  // Messages without an attachment (the outcome and overdue notices) write no attachment.pdf (T11 carry).
  const folders = readdirSync(join(server.dataDir, 'mail-capture')).filter((name) => !name.startsWith('.'));
  const captures = folders.map((name) => readCapture(server, name));
  const withoutPdf = captures.filter((item) => item.pdf === null);
  expect(withoutPdf.length, 'notices were captured').toBeGreaterThanOrEqual(5);
  for (const notice of withoutPdf) {
    expect(notice.files).toEqual(['message.eml', 'metadata.json']);
    expect(notice.metadata).not.toHaveProperty('pdf_sha256');
  }
  expect(captures.filter((item) => item.pdf !== null).length, 'submissions with their PDF').toBeGreaterThanOrEqual(4);

  // The employee's own screens (real server data, not mocked).
  await signIn(page, server, plain, '#/history');
  const revision = page.locator('[data-revision]').first();
  await expect(revision).toBeVisible();
  await expect(revision.locator('[data-fact="origin"]')).toHaveText('Submitted automatically');
  await expect(revision.locator('[data-revision-badge="review"]')).toHaveText('Review pending');
  await expect(revision.locator('[data-fact="signed"]')).toHaveText('Not signed yet');
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText('Email accepted by the mail server');
  await page.screenshot({ path: screenshotPath(`automation-history-${project}-synthetic.png`) });
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Timesheet' }).click();
  await expect(page.locator('[data-grid-status="review"]')).toHaveText('Submitted automatically, review pending');
  await page.screenshot({ path: screenshotPath(`automation-status-${project}-synthetic.png`) });
  // The review screen offers the late review of an automatic revision.
  await page.goto(`${server.origin}/#/review/${plain.payrollDate}`);
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  await page.screenshot({ path: screenshotPath(`automation-review-${project}-synthetic.png`), fullPage: true });

  // The administrator sees the pipeline, never a timesheet: no revision, no PDF, no names.
  // (The admin account is an account too and was submitted for itself; only its own revision is listed.)
  const adminRevisions = await admin.call<{ revisions: Array<{ id: string }> }>('GET', '/api/revisions');
  const plainRevisionId = (await finalizationOf(plain)).revision?.id ?? '';
  for (const person of [plain, full, noteOnly, imageOnly]) {
    expect(adminRevisions.revisions.map((item) => item.id), 'no employee revision in the administrator list').not.toContain((await finalizationOf(person)).revision?.id);
  }
  const adminPdf = await admin.download(`/api/revisions/${plainRevisionId}/pdf`);
  expect(adminPdf.status, 'the administrator cannot download an employee PDF').toBe(404);
  // The pipeline status names the account and the delivery state, nothing about the timesheet itself.
  const submissions = await admin.call<{ submissions: Array<Record<string, unknown>> }>('GET', '/api/admin/submissions');
  const allowed = ['user_id', 'display_name', 'period', 'revision', 'pdf', 'delivery', 'recipients'];
  expect(submissions.submissions.length, 'every submitted account is listed').toBeGreaterThanOrEqual(4);
  for (const item of submissions.submissions) expect(Object.keys(item).every((key) => allowed.includes(key)), Object.keys(item).join(',')).toBe(true);
  expect(submissions.submissions.map((item) => item.display_name), 'the account with the switch off has no submission').not.toContain(off.account.displayName);
  const adminText = JSON.stringify(submissions);
  for (const forbidden of ['signer_name', 'credited_minutes', 'regular_minutes', 'ot_', 'notes', 'sessions', 'reason', 'signature']) {
    expect(adminText, `no ${forbidden} in the administrator status`).not.toContain(forbidden);
  }
});

test('a period is not submitted automatically while the activation instant is not recorded', async ({ privateServer }) => {
  test.setTimeout(120_000);
  const server = privateServer;
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const person = await newPerson(admin, server, { displayName: 'Synthetic Not Activated', autoSubmit: true, signature: 'saved' });
  const periods = await person.api.call<PeriodsView>('GET', '/api/periods/current');
  const afterDeadline = new Date(new Date(periods.current.due_at_utc).getTime() + 10 * 60_000);
  const summaries = drainJobsFrom(server, afterDeadline);
  expect(summaries.every((item) => item.claimed === 0), 'nothing is queued without an activation').toBe(true);
  expect((await finalizationOf(person)).finalized_revision_no).toBeNull();
  expect((await person.api.call<{ revisions: unknown[] }>('GET', '/api/revisions')).revisions).toEqual([]);
  const status = await admin.call<{ automation: { active_from: string | null } }>('GET', '/api/admin/automation');
  expect(status.automation.active_from).toBeNull();
});
