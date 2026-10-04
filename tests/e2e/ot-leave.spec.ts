import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Page, type Request } from '@playwright/test';
import { addDays } from '../../src/domain/dates.ts';
import { formatDuration } from '../../src/domain/format.ts';
import { expect, SCREENSHOT_DIR, type SeedClient, screenshotPath, seedCredit, test } from './fixtures.ts';

/*
 * OT screen and own-history screen on both viewports. Credits are seeded by the test-only
 * helper (the internal ledger service, child process); everything else goes through the real UI.
 * Balances on screen are compared with the API after every step. Each test uses its own
 * permission reference, so tests never depend on the rows of another test in the same worker.
 */
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

test.beforeEach(({ page }) => {
  page.on('console', (message) => {
    // The signed-out probe answers 401 and a refused action 409 by design; a CSP violation is any other error.
    const unexpected = message.type() === 'error' && !/status of (401|409)/.test(message.text());
    expect(unexpected, `console error: ${message.text()}`).toBe(false);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
});

interface ApiSummary {
  posted_minutes: number;
  reserved_minutes: number;
  available_minutes: number;
  provisional_minutes: number;
}

interface ApiLeave {
  id: string;
  version: number;
  leave_date: string;
  consumed_minutes: number;
}

/** The balances on screen (value and text) equal what the API reports right now. */
async function expectBalancesMatchApi(page: Page, seed: SeedClient): Promise<ApiSummary> {
  const summary = await seed.call<ApiSummary>('GET', '/api/ot/summary');
  const figures: Array<[string, number]> = [
    ['posted', summary.posted_minutes],
    ['provisional', summary.provisional_minutes],
    ['reserved', summary.reserved_minutes],
    ['available', summary.available_minutes],
  ];
  for (const [name, minutes] of figures) {
    const cell = page.locator(`[data-balance="${name}"] dd`);
    await expect(cell).toHaveAttribute('data-minutes', String(minutes));
    await expect(cell).toHaveText(formatDuration(minutes));
  }
  return summary;
}

function leaveRow(page: Page, evidence: string) {
  return page.locator('li.ot-leave', { hasText: evidence });
}

async function counter(page: Page, evidence: string, name: string, minutes: number) {
  await expect(leaveRow(page, evidence).locator(`[data-counter="${name}"] dd`)).toHaveAttribute('data-minutes', String(minutes));
}

async function reserveThroughForm(page: Page, evidence: string, minutes: number, leaveDate?: string) {
  const form = page.getByRole('form', { name: 'Reserve OT leave' });
  if (leaveDate !== undefined) await form.getByLabel('Leave date').fill(leaveDate);
  await form.getByLabel('Minutes of leave').fill(String(minutes));
  await form.getByLabel('Manager who gave permission').fill('Synthetic Manager');
  await form.getByLabel('Permission reference').fill(evidence);
  await form.getByRole('button', { name: 'Reserve leave' }).click();
}

async function reserveByApi(seed: SeedClient, evidence: string, minutes: number, leaveDate: string): Promise<ApiLeave> {
  const created = await seed.call<{ request: ApiLeave }>(
    'POST',
    '/api/ot/leave',
    {
      request_key: `e2e-${evidence}`,
      leave_date: leaveDate,
      requested_minutes: minutes,
      permission: { approver_name: 'Synthetic Manager', approval_date: leaveDate, evidence_ref: evidence },
    },
    201,
  );
  return created.request;
}

test('reserve, partial use, cancel the rest and reverse, with history', async ({ page, builtServer, employeeSeed, signInThroughUi }, testInfo) => {
  const project = testInfo.project.name;
  const evidence = 'SYN-1001';
  const { todayLocal } = await employeeSeed.today();
  seedCredit(builtServer, 600);

  await signInThroughUi();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'OT' }).click();
  await expect(page).toHaveURL(/#\/ot$/);
  await expect(page.getByRole('heading', { name: 'Overtime balance and leave' })).toBeVisible();
  await expectBalancesMatchApi(page, employeeSeed);

  // Reserve 480 minutes for today.
  await reserveThroughForm(page, evidence, 480);
  await counter(page, evidence, 'reserved', 480);
  await expectBalancesMatchApi(page, employeeSeed);
  await expect(page.locator('[data-warning="mismatch"]')).toHaveCount(0);

  // Partial use of 240 (E-3: explicit, on or after the leave date).
  const row = leaveRow(page, evidence);
  const consumeRequest = page.waitForRequest((request: Request) => request.url().includes('/consume'));
  await row.getByLabel('Minutes used').fill('240');
  await row.getByRole('button', { name: 'Record use' }).click();
  const consume = await consumeRequest;
  await counter(page, evidence, 'consumed', 240);
  await counter(page, evidence, 'reserved', 240);
  const afterUse = await expectBalancesMatchApi(page, employeeSeed);

  // E-2: the day label (none) and the recorded use differ; the screen only informs.
  const warning = page.locator('[data-warning="mismatch"]');
  await expect(warning).toBeVisible();
  await expect(warning.locator(`[data-mismatch-date="${todayLocal}"]`)).toContainText('Nothing is spent automatically');
  await page.screenshot({ path: screenshotPath(`ot-after-use-${project}-synthetic.png`), fullPage: true });

  // The same use request replayed (same key, same version) is a duplicate and spends nothing more.
  const requestId = /\/api\/ot\/leave\/([^/]+)\/consume/.exec(consume.url())?.[1];
  expect(requestId, 'request id in the consume URL').toBeDefined();
  const replay = await employeeSeed.call<{ status: string }>('POST', `/api/ot/leave/${requestId}/consume`, JSON.parse(consume.postData() ?? '{}'));
  expect(replay.status).toBe('duplicate');
  const afterReplay = await employeeSeed.call<ApiSummary>('GET', '/api/ot/summary');
  expect(afterReplay.posted_minutes).toBe(afterUse.posted_minutes);
  expect(afterReplay.reserved_minutes).toBe(afterUse.reserved_minutes);
  expect(afterReplay.available_minutes).toBe(afterUse.available_minutes);

  // Cancel the rest: releases the reserved 240, spends nothing.
  await row.getByLabel('Reason (optional)').fill('Synthetic release');
  await row.getByRole('button', { name: 'Cancel remaining' }).click();
  await counter(page, evidence, 'released', 240);
  await counter(page, evidence, 'reserved', 0);
  await expect(row.getByRole('button', { name: 'Cancel remaining' })).toHaveCount(0);
  await expectBalancesMatchApi(page, employeeSeed);

  // Reverse the used 240 with a reason.
  await row.getByLabel('Reason (required)').fill('Synthetic reversal');
  await row.getByRole('button', { name: 'Reverse use' }).click();
  await counter(page, evidence, 'reversed', 240);
  await expect(row.getByRole('button', { name: 'Reverse use' })).toHaveCount(0);
  await expectBalancesMatchApi(page, employeeSeed);
  await expect(page.locator('[data-warning="mismatch"]')).toHaveCount(0);

  // Own history: each step with before/after values and its reason.
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'History' }).click();
  await expect(page).toHaveURL(/#\/history$/);
  const history = page.getByRole('list', { name: 'Audit events' });
  await expect(history).toBeVisible();
  const reserved = history.locator('li[data-operation="ot_leave.reserve"]').first();
  await expect(reserved.locator('[data-field="reserved_minutes"] [data-side="before"]')).toHaveText('none');
  await expect(reserved.locator('[data-field="reserved_minutes"] [data-side="after"]')).toHaveText('480');
  const used = history.locator('li[data-operation="ot_leave.use"]').first();
  await expect(used.locator('[data-field="reserved_minutes"] [data-side="before"]')).toHaveText('480');
  await expect(used.locator('[data-field="reserved_minutes"] [data-side="after"]')).toHaveText('240');
  await expect(used.locator('[data-field="consumed_minutes"] [data-side="after"]')).toHaveText('240');
  const cancelled = history.locator('li[data-operation="ot_leave.cancel"]').first();
  await expect(cancelled.locator('[data-reason]')).toHaveAttribute('data-reason', 'Synthetic release');
  await expect(cancelled.locator('[data-field="released_minutes"] [data-side="after"]')).toHaveText('240');
  const reversed = history.locator('li[data-operation="ot_leave.reverse"]').first();
  await expect(reversed.locator('[data-reason]')).toHaveAttribute('data-reason', 'Synthetic reversal');
  await expect(reversed.locator('[data-field="reversed_minutes"] [data-side="before"]')).toHaveText('0');
  await expect(reversed.locator('[data-field="reversed_minutes"] [data-side="after"]')).toHaveText('240');
  await page.screenshot({ path: screenshotPath(`history-${project}-synthetic.png`), fullPage: true });
});

test('insufficient balance shows the E-5 message and reserves nothing', async ({ page, builtServer, employeeSeed, signInThroughUi }) => {
  seedCredit(builtServer, 60);
  const before = await employeeSeed.call<ApiSummary>('GET', '/api/ot/summary');
  const requestsBefore = await employeeSeed.call<{ requests: ApiLeave[] }>('GET', '/api/ot/leave');

  await signInThroughUi();
  await page.goto('/#/ot');
  await expectBalancesMatchApi(page, employeeSeed);
  await reserveThroughForm(page, 'SYN-2002', before.available_minutes + 1);

  const message = page.locator('[data-error="reserve"]');
  await expect(message).toContainText('Not enough available OT balance.');
  await expect(message).toContainText('Nothing was reserved.');
  await expect(message).toContainText(formatDuration(before.available_minutes));

  const requestsAfter = await employeeSeed.call<{ requests: ApiLeave[] }>('GET', '/api/ot/leave');
  expect(requestsAfter.requests).toHaveLength(requestsBefore.requests.length);
  const after = await employeeSeed.call<ApiSummary>('GET', '/api/ot/summary');
  expect(after.reserved_minutes).toBe(before.reserved_minutes);
  expect(after.available_minutes).toBe(before.available_minutes);
  await expect(page.locator('li.ot-leave', { hasText: 'SYN-2002' })).toHaveCount(0);
});

test('record use is not offered before the leave date', async ({ page, builtServer, employeeSeed, signInThroughUi }) => {
  const evidence = 'SYN-3003';
  const { todayLocal } = await employeeSeed.today();
  const tomorrow = addDays(todayLocal, 1);
  seedCredit(builtServer, 240);
  const request = await reserveByApi(employeeSeed, evidence, 240, tomorrow);

  await signInThroughUi();
  await page.goto('/#/ot');
  const row = leaveRow(page, evidence);
  await expect(row).toBeVisible();
  await expect(row.getByRole('button', { name: 'Record use' })).toHaveCount(0);
  await expect(row.locator('[data-hint="use-later"]')).toHaveText(`Use can be recorded from ${tomorrow}.`);
  await expect(row.getByRole('button', { name: 'Cancel remaining' })).toBeVisible();

  // The server refuses it too (409), so hiding the button is not the only guard.
  const refused = await employeeSeed.call<{ error: { code: string } }>(
    'POST',
    `/api/ot/leave/${request.id}/consume`,
    { use_key: 'e2e-early', minutes: 60, expected_version: request.version },
    409,
  );
  expect(refused.error.code).toBe('before_leave_date');

  // Cancelling through the UI sends expected_version and frees the minutes again.
  await row.getByRole('button', { name: 'Cancel remaining' }).click();
  await counter(page, evidence, 'released', 240);
  await expectBalancesMatchApi(page, employeeSeed);
});

test('the evidence CSV downloads with the permission record and ledger', async ({ page, builtServer, employeeSeed, signInThroughUi }, testInfo) => {
  const evidence = 'SYN-5005';
  const { todayLocal } = await employeeSeed.today();
  seedCredit(builtServer, 120);
  const request = await reserveByApi(employeeSeed, evidence, 60, todayLocal);

  await signInThroughUi();
  await page.goto('/#/ot');
  await expect(leaveRow(page, evidence)).toBeVisible();
  await expect(page.getByRole('table', { name: 'OT ledger' })).toContainText('credit');

  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download evidence CSV' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^ot-evidence_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.csv$/);
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');

  expect(text).toContain('#section,export');
  expect(text).toContain('#section,leave_permissions');
  expect(text).toContain('#section,ledger');
  expect(text).toContain(`${request.id},${todayLocal},60,60,60,0,0,0,Synthetic Manager,,${todayLocal},${evidence},self_recorded`);
  expect(text.endsWith('\n') && !text.endsWith('\n\n')).toBe(true);
  expect(text).not.toContain('\r');
  writeFileSync(join(SCREENSHOT_DIR, `ot-evidence-${testInfo.project.name}-synthetic.csv.txt`), text);

  await leaveRow(page, evidence).getByRole('button', { name: 'Cancel remaining' }).click();
  await counter(page, evidence, 'released', 60);
});
