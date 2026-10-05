import { readFileSync } from 'node:fs';
import { type Page } from '@playwright/test';
import { readPdf } from '../support/pdfText.ts';
import {
  CAPTURE_SENDER,
  drainJobsFrom,
  expect,
  type Person,
  newPerson,
  readCapture,
  screenshotPath,
  SeedClient,
  test,
} from './fixtures.ts';

/*
 * Manual sign-off to captured delivery, end to end on both viewports (WP3-T14). The sign-off goes
 * through the real review screen; the jobs (PDF, then the send) are run by the production CLI
 * `run-jobs --once --now` on this test's own built server (its runner is off), so the first delivery
 * attempt is deterministic and `accepted` into the capture folder (capture mode, example.invalid
 * sender and recipients; nothing leaves the machine). The stale-review conflict, the explicit
 * resend and the uncertain decision are also exercised by review.spec.ts and history-settings.spec.ts;
 * this file adds the part those could not show before a sender was configured: what the captured
 * message and its PDF contain.
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

const TO = 'payroll-capture@example.invalid';
const CC = 'manager-capture@example.invalid';
const SIGNER = 'Synthetic Signer';

interface ApiAttempt {
  id: string;
  state: string;
}

const attemptsOf = async (person: Person, revisionId: string) =>
  (await person.api.call<{ deliveries: ApiAttempt[] }>('GET', `/api/deliveries?revision_id=${revisionId}`)).deliveries;

const header = (eml: string, name: string): string => {
  const match = new RegExp(`^${name}: (.*(?:\\r?\\n[ \\t].*)*)`, 'im').exec(eml);
  return (match?.[1] ?? '').replace(/\r?\n[ \t]+/g, ' ').trim();
};

async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const widths = await page.evaluate<{ scroll: number; inner: number }>(
    '({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth })',
  );
  expect(widths.scroll, 'page width').toBeLessThanOrEqual(widths.inner);
}

test('a manual sign-off is delivered into the capture folder with the signed PDF; an explicit resend adds a second identical capture', async ({
  page,
  privateServer,
}, testInfo) => {
  test.setTimeout(240_000);
  const project = testInfo.project.name;
  const server = privateServer;
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const person = await newPerson(admin, server, { displayName: SIGNER, to: [TO], cc: [CC], autoSubmit: false, signature: 'saved' });
  const period = (await person.api.call<{ current: { period_start: string; period_end: string } }>('GET', '/api/periods/current')).current;
  const [day] = await person.api.displayedPeriodFreeWorkdays();
  expect(day, 'a past free workday in the displayed period').toBeDefined();
  await person.api.seedCompleteDay(day ?? '');

  // Sign off through the real review screen.
  await page.goto(`${server.origin}/#/review/${person.payrollDate}`);
  await page.getByLabel('Email').fill(person.account.email);
  await page.getByLabel('Password').fill(person.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  await expect(page.locator('[data-envelope="to"] dd')).toHaveText(TO);
  await page.getByLabel('Your name').fill(SIGNER);
  await page.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ }).check();
  await page.getByRole('button', { name: 'Sign off & Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Submitted' })).toBeVisible();
  const signedOn = new Date();

  // The PDF and the send run through the production CLI; the first attempt is accepted into the capture folder.
  const finalized = await person.api.call<{ revision: { id: string; origin: string; review_state: string } }>('GET', `/api/timesheets/${person.payrollDate}/finalization`);
  expect(finalized.revision).toMatchObject({ origin: 'employee', review_state: 'signed' });
  const revisionId = finalized.revision.id;
  expect((await attemptsOf(person, revisionId)).length, 'nothing runs before the CLI does').toBe(0);
  drainJobsFrom(server, new Date());
  const first = await attemptsOf(person, revisionId);
  expect(first.map((item) => item.state)).toEqual(['accepted']);

  // The captured message: sender, recipients, subject and attachment, and the PDF equals the owner's download.
  const capture = readCapture(server, first[0]?.id ?? '');
  expect(capture.files).toEqual(['attachment.pdf', 'message.eml', 'metadata.json']);
  expect(header(capture.eml, 'From')).toBe(CAPTURE_SENDER);
  expect(header(capture.eml, 'To')).toBe(TO);
  expect(header(capture.eml, 'Cc')).toBe(CC);
  expect(header(capture.eml, 'Subject')).toBe(`Timesheet ${period.period_start} to ${period.period_end} - ${SIGNER} - Submitted`);
  expect(capture.metadata).toMatchObject({ mode: 'capture', envelope: { from: CAPTURE_SENDER, to: [TO, CC] } });
  const stored = await person.api.download(`/api/revisions/${revisionId}/pdf`);
  expect(stored.status).toBe(200);
  expect(capture.pdf?.equals(stored.body), 'the captured attachment is the stored PDF').toBe(true);
  // The printed page of a manual revision: the signer name, the real sign date and the signature image.
  const printed = await readPdf(new Uint8Array(stored.body));
  const signDate = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(signedOn);
  expect(printed.text).toContain(SIGNER);
  expect(printed.text).toContain(signDate);
  expect(printed.pages[0]?.images.length, 'the saved signature image').toBe(1);
  expect(printed.text).not.toMatch(/automatic/i);

  // History: signed, PDF ready, accepted; the page fits the width and the attempt is shown.
  await page.goto(`${server.origin}/#/history`);
  const revision = page.locator(`[data-revision="${revisionId}"]`);
  await expect(revision).toBeVisible();
  await expect(revision.locator('[data-revision-badge="review"]')).toHaveText('Signed');
  await expect(revision.locator('[data-revision-badge="pdf"]')).toHaveText('PDF ready');
  await expect(revision.locator('[data-revision-badge="delivery"]')).toHaveText('Email accepted by the mail server');
  await expect(revision.locator('[data-fact="recipients"]')).toHaveText(`${TO} (copy: ${CC})`);
  await expect(revision.locator('[data-attempt-state="accepted"]')).toContainText('Accepted by the mail server');
  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await page.screenshot({ path: screenshotPath(`submission-delivered-${project}-synthetic.png`) });

  // The downloaded file through the UI is the same bytes as the capture.
  const downloading = page.waitForEvent('download');
  await revision.getByRole('button', { name: /^Download PDF/ }).click();
  const download = await downloading;
  expect(readFileSync(await download.path()).equals(capture.pdf ?? Buffer.alloc(0)), 'the downloaded file is the captured PDF').toBe(true);

  // An explicit resend (a confirmation first) makes one more attempt of the same revision and the same PDF.
  await revision.getByRole('button', { name: /^Resend email/ }).click();
  const confirm = revision.locator('[data-confirm="resend"]');
  await expect(confirm).toContainText(TO);
  await confirm.getByRole('button', { name: 'Send again' }).click();
  await expect(revision.locator('[data-revision-message="ok"]')).toContainText('A new delivery attempt was queued');
  drainJobsFrom(server, new Date(Date.now() + 5_000));
  const both = await attemptsOf(person, revisionId);
  expect(both.map((item) => item.state)).toEqual(['accepted', 'accepted']);
  const second = readCapture(server, both.find((item) => item.id !== first[0]?.id)?.id ?? '');
  expect(second.pdf?.equals(capture.pdf ?? Buffer.alloc(0)), 'the resend carries the same PDF').toBe(true);
  expect(header(second.eml, 'Message-ID'), 'a new attempt has its own Message-ID').not.toBe(header(capture.eml, 'Message-ID'));
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(revision.locator('[data-attempt]')).toHaveCount(2);
  await expect(revision.locator('[data-attempt-state="accepted"]')).toHaveCount(2);
  await page.screenshot({ path: screenshotPath(`submission-resent-${project}-synthetic.png`) });
});
