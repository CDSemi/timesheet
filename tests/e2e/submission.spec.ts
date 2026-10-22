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
 * Manual sign-off, then its own send, to captured delivery, end to end on both viewports (WP3-T14, reworked in WP5-UX5-T03). The
 * sign-off goes through the real Review page and sends nothing; the Send card then sends with an edited To, Cc, Subject, message and
 * both PDF row switches. The jobs (PDF, then the send) are run by the production CLI `run-jobs --once --now` on this test's own built
 * server (its runner is off), so each delivery attempt is deterministic and `accepted` into the capture folder (capture mode,
 * example.invalid sender and recipients; nothing leaves the machine). The stale-review conflict and the History resend are also exercised
 * by review.spec.ts and history-settings.spec.ts; this file adds what those could not show: what the captured message and its PDF contain,
 * which values the send carried, and the owner's reason rule for another copy.
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
const TO_2 = 'second-payroll@example.invalid';
const CC_2 = 'second-copy@example.invalid';
const SUBJECT = 'Edited subject for this send only';
const BODY = 'Edited message line for this send only.';
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

/** The time-like strings the PDF prints (the session times are in the Time rows). */
const timesIn = (text: string): number => (text.match(/\b\d{2}:\d{2}\b/g) ?? []).length;

test('a manual sign-off sends nothing; the Send card then sends the edited envelope, both switches and the matching PDF into the capture folder, and another copy needs the owner\'s reason', async ({
  page,
  privateServer,
}, testInfo) => {
  test.setTimeout(240_000);
  const project = testInfo.project.name;
  const server = privateServer;
  const admin = await new SeedClient(server.origin).signIn(server.credentials.admin.email, server.credentials.admin.password);
  const person = await newPerson(admin, server, { displayName: SIGNER, to: [TO], cc: [CC], autoSubmit: false, signature: 'saved' });
  const [day] = await person.api.displayedPeriodFreeWorkdays();
  expect(day, 'a past free workday in the displayed period').toBeDefined();
  await person.api.seedCompleteDay(day ?? '');

  // Sign off through the real review page.
  await page.goto(`${server.origin}/#/review/${person.payrollDate}`);
  await page.getByLabel('Email').fill(person.account.email);
  await page.getByLabel('Password').fill(person.account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Review and sign off', level: 1 })).toBeVisible();
  const send = page.locator('[data-send-card]');
  await expect(send.locator('#send-field-to')).toHaveValue(TO);
  await expect(send.locator('#send-field-cc')).toHaveValue(CC);
  await page.locator('[data-sign-off]').click();
  const dialog = page.getByRole('dialog', { name: 'Sign off confirmation' });
  // F-5 b: the signer is the account; there is no name field and the dialog shows the name it will record.
  await expect(page.getByLabel('Your name')).toHaveCount(0);
  await expect(dialog.locator('[data-signer]')).toContainText(SIGNER);
  await dialog.getByRole('checkbox', { name: /I acknowledge the incomplete evidence/ }).check();
  await dialog.getByRole('button', { name: 'Sign off', exact: true }).click();
  const signedOn = new Date();
  await expect(page.locator('[data-result="created"]')).toContainText('Signed.');
  // WP5-UX5-T01b: the sign-off sends nothing by itself.
  const finalized = await person.api.call<{ revision: { id: string; origin: string; review_state: string } }>('GET', `/api/timesheets/${person.payrollDate}/finalization`);
  expect(finalized.revision).toMatchObject({ origin: 'employee', review_state: 'signed' });
  const revisionId = finalized.revision.id;
  drainJobsFrom(server, new Date());
  expect((await attemptsOf(person, revisionId)).length, 'the sign-off sent nothing: no delivery attempt exists').toBe(0);
  const defaultPdf = await person.api.download(`/api/revisions/${revisionId}/pdf`);
  expect(defaultPdf.status, 'the sign-off rendered its PDF').toBe(200);

  // Edit this send: To, Cc, Subject, the message and both switches. The values are this send's own.
  const requests: Array<Record<string, unknown>> = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/send')) requests.push(request.postDataJSON() as Record<string, unknown>);
  });
  await send.locator('#send-field-to').fill(`${TO}, ${TO_2}`);
  await send.locator('#send-field-cc').fill(CC_2);
  await send.locator('#send-field-subject').fill(SUBJECT);
  await send.locator('#send-field-body').fill(BODY);
  await send.getByRole('switch', { name: 'Time rows on the PDF' }).uncheck();
  await send.getByRole('switch', { name: 'OT rows on the PDF' }).uncheck();
  await expect(send.locator('[data-pdf-preview]')).toHaveAttribute('href', `/api/revisions/${revisionId}/pdf?time=0&ot=0&disposition=inline`);
  // The preview link serves the PDF of exactly these switches, inline.
  const preview = await person.api.download(`/api/revisions/${revisionId}/pdf?time=0&ot=0&disposition=inline`);
  expect(preview.status).toBe(200);
  expect(preview.headers.get('content-disposition')).toMatch(/^inline;/);
  await send.locator('[data-send]').click();
  await expect(send.locator('[data-send-notice="ok"]')).toContainText('Send 1 is queued');
  expect(requests, 'one send request').toHaveLength(1);
  // Exactly the edited values, nothing from the Settings defaults, no reason (no copy counts yet).
  expect(requests[0]).toEqual({
    request_key: expect.any(String),
    to: [TO, TO_2],
    cc: [CC_2],
    subject: SUBJECT,
    body_text: BODY,
    time_rows: false,
    ot_rows: false,
  });
  // A replay of that request (a lost response, a double click) is the same send, never a second one.
  const replay = await person.api.call<{ status: string }>('POST', `/api/revisions/${revisionId}/send`, requests[0], 200);
  expect(replay.status).toBe('replayed');

  // The PDF and the send run through the production CLI; the first attempt is accepted into the capture folder.
  drainJobsFrom(server, new Date());
  const first = await attemptsOf(person, revisionId);
  expect(first.map((item) => item.state)).toEqual(['accepted']);

  // The captured message carries the edited envelope and message, and the attachment is the PDF of the edited switches.
  const capture = readCapture(server, first[0]?.id ?? '');
  expect(capture.files).toEqual(['attachment.pdf', 'message.eml', 'metadata.json']);
  expect(header(capture.eml, 'From')).toBe(CAPTURE_SENDER);
  expect(header(capture.eml, 'To')).toContain(TO);
  expect(header(capture.eml, 'To')).toContain(TO_2);
  expect(header(capture.eml, 'Cc')).toBe(CC_2);
  expect(header(capture.eml, 'Subject')).toBe(SUBJECT);
  expect(capture.eml).toContain(BODY);
  expect(capture.metadata).toMatchObject({ mode: 'capture', envelope: { from: CAPTURE_SENDER, to: [TO, TO_2, CC_2] } });
  const variant = await person.api.download(`/api/revisions/${revisionId}/pdf?time=0&ot=0`);
  expect(variant.status).toBe(200);
  expect(capture.pdf?.equals(variant.body), 'the captured attachment is the stored PDF of the chosen switches').toBe(true);
  expect(capture.pdf?.equals(defaultPdf.body), 'and not the sign-off default PDF').toBe(false);
  // The printed page: the signer name, the real sign date and the saved image on every variant; the Time rows are gone from this one.
  const printed = await readPdf(new Uint8Array(variant.body));
  const signDate = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(signedOn);
  expect(printed.text).toContain(SIGNER);
  expect(printed.text).toContain(signDate);
  expect(printed.pages[0]?.images.length, 'the saved signature image').toBe(1);
  expect(printed.text).not.toMatch(/automatic/i);
  const printedDefault = await readPdf(new Uint8Array(defaultPdf.body));
  expect(timesIn(printedDefault.text), 'the default PDF prints the session times').toBeGreaterThan(timesIn(printed.text));

  // History and the Send card now say one copy was accepted.
  await page.reload();
  await expect(page.locator('[data-send-card]')).toBeVisible();
  await expect(page.locator('[data-send-chip]')).toHaveText('Email accepted by the mail server');
  await expect(page.locator('[data-status="review"]')).toHaveText('Submitted manually');
  const again = page.locator('[data-send]');
  await expect(again).toHaveText('Send another copy...');
  // The defaults of the next send are Settings again (the edited values were this send's own).
  await expect(page.locator('#send-field-to')).toHaveValue(TO);
  await expect(page.getByRole('switch', { name: 'Time rows on the PDF' })).toBeChecked();

  // Another copy: a confirmation names the earlier copy and asks for a typed reason first; nothing is posted without it.
  requests.length = 0;
  await again.click();
  const confirm = page.getByRole('alertdialog', { name: 'Send another copy?' });
  await expect(confirm).toBeVisible();
  await expect(confirm).toContainText(TO);
  await expect(confirm).toContainText('was accepted by the mail server');
  const reason = confirm.getByLabel('Reason for sending another copy (required)');
  await expect(reason).toBeVisible();
  await confirm.getByRole('button', { name: 'Send another copy' }).click();
  await expect(confirm.getByRole('alert')).toHaveText('Give the reason for sending another copy.');
  await reason.fill('x');
  await confirm.getByRole('button', { name: 'Send another copy' }).click();
  await expect(confirm.getByRole('alert')).toContainText('2 to 500 characters');
  expect(requests, 'nothing is posted without a valid reason').toEqual([]);
  await page.screenshot({ path: screenshotPath(`submission-reason-${project}-synthetic.png`) });
  await reason.fill('Payroll asked for a second copy');
  await confirm.getByRole('button', { name: 'Send another copy' }).click();
  await expect(page.locator('[data-send-notice="ok"]')).toContainText('Send 2 is queued');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ to: [TO], cc: [CC], time_rows: true, ot_rows: true, reason: 'Payroll asked for a second copy' });

  // A third request while the second is still waiting is refused by the server (409): said in words, nothing is retried.
  requests.length = 0;
  await page.locator('[data-send]').click();
  await page.getByRole('alertdialog', { name: 'Send another copy?' }).getByLabel('Reason for sending another copy (required)').fill('Asked again too soon');
  await page.getByRole('alertdialog', { name: 'Send another copy?' }).getByRole('button', { name: 'Send another copy' }).click();
  await expect(page.locator('[data-send-notice="error"]')).toContainText('in progress');
  await expect(page.locator('[data-send-notice="error"]')).toContainText('Nothing was sent again');
  expect(requests, 'the refused send was posted once and never retried').toHaveLength(1);

  drainJobsFrom(server, new Date(Date.now() + 5_000));
  const both = await attemptsOf(person, revisionId);
  expect(both.map((item) => item.state)).toEqual(['accepted', 'accepted']);
  const second = readCapture(server, both.find((item) => item.id !== first[0]?.id)?.id ?? '');
  expect(second.pdf?.equals(defaultPdf.body), 'the second copy carries the default variant (both switches on)').toBe(true);
  expect(header(second.eml, 'Message-ID'), 'a new attempt has its own Message-ID').not.toBe(header(capture.eml, 'Message-ID'));
  expect(second.eml, 'the reason is not in the email').not.toContain('second copy');
  if (project === 'mobile') await expectNoSidewaysScroll(page);
  await page.reload();
  await expect(page.locator('[data-send-card]')).toBeVisible();
  await page.screenshot({ path: screenshotPath(`submission-sent-${project}-synthetic.png`), fullPage: true });

  // History: the signed revision, its PDF, accepted; the owner's own events carry the send and its reason.
  await page.goto(`${server.origin}/#/history`);
  const revision = page.locator(`[data-revision="${revisionId}"]`);
  await expect(revision).toBeVisible();
  await expect(revision.locator('[data-revision-badge="review"]')).toHaveText('Signed');
  await expect(revision.locator('[data-revision-badge="pdf"]')).toHaveText('PDF ready');
  await expect(revision.locator('[data-attempt]')).toHaveCount(2);
  if (project === 'mobile') await expectNoSidewaysScroll(page);
  const sent = page.locator('[data-operation="revision.send"]');
  await expect(sent).toHaveCount(2);
  await expect(sent.first()).toContainText('Revision sent');
  await expect(page.locator('[data-operation="revision.send"] [data-reason="Payroll asked for a second copy"]')).toHaveCount(1);
});
