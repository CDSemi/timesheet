import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import * as ledger from '../../src/server/services/ledger.ts';
import { grantShare } from '../../src/server/services/shares.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { XLSX_MEDIA_TYPE } from '../../src/server/services/workbookImport.ts';
import { makePng } from '../support/pdfText.ts';
import { buildSyntheticWorkbook } from '../support/syntheticWorkbook.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T10: the explicit opening OT balance (owner decision F-3 (a), 2026-10-05; docs/03 "Imports, opening balance and
 * retention", docs/07 "Workbook import", docs/02 R-06) and the WP4-T09 follow-up that OT leave use is refused inside an
 * imported period (F-2). The opening balance is signed, non-zero minutes with an as-of date, a reason and an evidence
 * reference; one per user; it changes only through a reasoned correction; it is the ledger entry type
 * `opening_balance` and is never inferred from a workbook. POST records it; PUT on the same path is the reasoned
 * correction (one `correction` entry). Today is 2026-09-29 (LA 13:00). Data is synthetic
 * (example.invalid); the clock is injected.
 */

const NOW = '2026-09-29T20:00:00Z';
const PB = '2026-09-18'; // imported period 2026-08-31 .. 2026-09-13
const PAYROLL = '2026-10-02'; // current period 2026-09-14 .. 2026-09-27
const OPENING = '/api/ot/opening-balance';

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext(NOW);
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

function openingBody(minutes: number, extra: Record<string, unknown> = {}) {
  return {
    minutes,
    as_of_date: '2026-08-30',
    reason: 'Synthetic carried-in balance from the paper records',
    evidence_ref: 'Synthetic payroll letter 0001',
    expected_version: 0,
    ...extra,
  };
}

function correctionBody(minutes: number, expectedVersion: number, extra: Record<string, unknown> = {}) {
  return {
    minutes,
    reason: 'Synthetic recount of the paper records',
    evidence_ref: 'Synthetic payroll letter 0002',
    expected_version: expectedVersion,
    ...extra,
  };
}

function count(sql: string, ...params: unknown[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

const ledgerCount = (userId = t.userIds.employee) => count('SELECT count(*) FROM ot_ledger WHERE user_id = ?', userId);
const ledgerAudits = (userId = t.userIds.employee) => count("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND operation LIKE 'ot_ledger.%'", userId);
const sumOfDeltas = (userId = t.userIds.employee) => count('SELECT coalesce(sum(delta_minutes), 0) FROM ot_ledger WHERE user_id = ?', userId);

async function postOpening(body: unknown, cookie = employee) {
  return t.request('POST', OPENING, { cookie, body });
}

async function summary(cookie = employee) {
  const response = await t.request('GET', '/api/ot/summary', { cookie });
  expect(response.status).toBe(200);
  return response.body as { posted_minutes: number; available_minutes: number; negative: boolean };
}

async function account(email: string): Promise<{ id: string; cookie: string }> {
  const password = `Synthetic-${randomUUID()}`;
  const id = await createUser(t.db, t.clock, { email, displayName: 'Synthetic Other', role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(response.status).toBe(200);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (cookie === undefined) throw new Error('No session cookie');
  return { id, cookie };
}

describe('POST /api/ot/opening-balance (F-3)', () => {
  it('posts one signed opening balance entry with its as-of date, reason and evidence reference', async () => {
    const response = await postOpening(openingBody(-90));
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.status).toBe('posted');
    expect(response.body.entry).toMatchObject({
      entry_type: 'opening_balance',
      delta_minutes: -90,
      as_of_date: '2026-08-30',
      work_date: null,
      corrects_entry_id: null,
      origin: 'manual',
      reason: 'Synthetic carried-in balance from the paper records',
    });
    expect(response.body.opening_balance).toMatchObject({
      minutes: -90,
      original_minutes: -90,
      as_of_date: '2026-08-30',
      evidence_ref: 'Synthetic payroll letter 0001',
      version: 1,
      corrections: [],
    });
    // A truthful negative balance is kept and flagged (docs/02 R-06).
    expect(await summary()).toMatchObject({ posted_minutes: -90, available_minutes: -90, negative: true });
    const row = t.db.prepare("SELECT * FROM ot_ledger WHERE user_id = ? AND entry_type = 'opening_balance'").get(t.userIds.employee) as any;
    expect(row).toMatchObject({ source_key: 'opening_balance', actor_user_id: t.userIds.employee, evidence_ref: 'Synthetic payroll letter 0001', as_of_date: '2026-08-30' });
    const audit = t.db.prepare("SELECT actor_user_id, owner_user_id, reason, after_json FROM audit_events WHERE operation = 'ot_ledger.opening_balance'").all() as any[];
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee, reason: 'Synthetic carried-in balance from the paper records' });
    expect(JSON.parse(audit[0].after_json)).toMatchObject({ entry_type: 'opening_balance', delta_minutes: -90, as_of_date: '2026-08-30', evidence_ref: 'Synthetic payroll letter 0001' });

    const read = await t.request('GET', OPENING, { cookie: employee });
    expect(read.status).toBe(200);
    expect(read.body.opening_balance).toEqual(response.body.opening_balance);
    expect(read.body.balance).toMatchObject({ posted_minutes: -90 });
    const list = await t.request('GET', '/api/ot/ledger', { cookie: employee });
    expect(list.body.entries.map((entry: any) => [entry.entry_type, entry.delta_minutes, entry.as_of_date])).toEqual([['opening_balance', -90, '2026-08-30']]);
  });

  it('shows no opening balance before one is posted', async () => {
    const read = await t.request('GET', OPENING, { cookie: employee });
    expect(read.status).toBe(200);
    expect(read.body.opening_balance).toBeNull();
  });

  it('red-first: a double submission posts once', async () => {
    const first = await postOpening(openingBody(240));
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    const again = await postOpening(openingBody(240));
    expect(again.status, JSON.stringify(again.body)).toBe(200);
    expect(again.body.status).toBe('duplicate');
    expect(again.body.entry.id).toBe(first.body.entry.id);
    expect(ledgerCount()).toBe(1);
    expect(ledgerAudits()).toBe(1);
    expect((await summary()).posted_minutes).toBe(240);
  });

  it('red-first: the balance equals the sum of the deltas through credits, the opening balance and its correction', async () => {
    ledger.postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'synthetic-credit', minutes: 300, workDate: '2026-09-15', actorUserId: null, origin: 'system' },
    );
    expect((await postOpening(openingBody(120))).status).toBe(201);
    const corrected = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(200, 1) });
    expect(corrected.status, JSON.stringify(corrected.body)).toBe(201);
    expect(corrected.body.entry).toMatchObject({ entry_type: 'correction', delta_minutes: 80 });
    expect(sumOfDeltas()).toBe(500);
    expect((await summary()).posted_minutes).toBe(sumOfDeltas());
    expect(ledger.getBalance(t.db, t.userIds.employee).postedMinutes).toBe(500);
  });

  it('red-first: refuses zero minutes, a missing reason, missing evidence and a missing as-of date, writing nothing', async () => {
    const refused: Array<[string, Record<string, unknown>]> = [
      ['zero minutes', openingBody(0)],
      ['fractional minutes', openingBody(1.5)],
      ['blank reason', openingBody(60, { reason: '   ' })],
      ['blank evidence', openingBody(60, { evidence_ref: ' ' })],
      ['invalid as-of date', openingBody(60, { as_of_date: '2026-02-30' })],
    ];
    const { reason: _reason, ...noReason } = openingBody(60);
    const { evidence_ref: _evidence, ...noEvidence } = openingBody(60);
    const { as_of_date: _asOf, ...noAsOf } = openingBody(60);
    const { minutes: _minutes, ...noMinutes } = openingBody(60);
    refused.push(['missing reason', noReason], ['missing evidence', noEvidence], ['missing as-of date', noAsOf], ['missing minutes', noMinutes]);
    for (const [label, body] of refused) {
      const response = await postOpening(body);
      expect(response.status, `${label}: ${JSON.stringify(response.body)}`).toBe(422);
    }
    expect((await postOpening(openingBody(0))).body.error.code).toBe('invalid_minutes');
    expect((await postOpening(openingBody(60, { reason: '' }))).body.error.code).toBe('reason_required');
    expect((await postOpening(openingBody(60, { evidence_ref: '' }))).body.error.code).toBe('evidence_required');
    expect(ledgerCount()).toBe(0);
    expect(ledgerAudits()).toBe(0);
  });

  it('red-first: a different value without a correction is refused; a reasoned correction posts exactly one correction entry', async () => {
    const posted = await postOpening(openingBody(120));
    expect(posted.status).toBe(201);
    for (const body of [openingBody(150), openingBody(120, { evidence_ref: 'Another synthetic letter' }), openingBody(120, { as_of_date: '2026-08-29' })]) {
      const response = await postOpening(body);
      expect(response.status, JSON.stringify(response.body)).toBe(409);
      expect(response.body.error.code).toBe('opening_balance_exists');
      expect(response.body.error.details).toEqual({ minutes: 120, version: 1 });
    }
    expect(ledgerCount()).toBe(1);

    // A correction needs a reason and evidence.
    for (const body of [correctionBody(200, 1, { reason: ' ' }), correctionBody(200, 1, { evidence_ref: '' }), correctionBody(0, 1)]) {
      expect((await t.request('PUT', OPENING, { cookie: employee, body })).status).toBe(422);
    }
    const { reason: _reason, ...withoutReason } = correctionBody(200, 1);
    expect((await t.request('PUT', OPENING, { cookie: employee, body: withoutReason })).status).toBe(422);
    expect(ledgerCount()).toBe(1);

    const corrected = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(-30, 1) });
    expect(corrected.status, JSON.stringify(corrected.body)).toBe(201);
    expect(corrected.body.status).toBe('posted');
    expect(corrected.body.entry).toMatchObject({
      entry_type: 'correction',
      delta_minutes: -150,
      corrects_entry_id: posted.body.entry.id,
      reason: 'Synthetic recount of the paper records',
      work_date: null,
    });
    expect(corrected.body.opening_balance).toMatchObject({ minutes: -30, original_minutes: 120, version: 2 });
    expect(corrected.body.opening_balance.corrections).toEqual([
      expect.objectContaining({ id: corrected.body.entry.id, delta_minutes: -150, evidence_ref: 'Synthetic payroll letter 0002' }),
    ]);
    // A double submission of the correction posts once.
    const again = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(-30, 1) });
    expect(again.status).toBe(200);
    expect(again.body.status).toBe('duplicate');
    expect(again.body.entry.id).toBe(corrected.body.entry.id);
    expect(count("SELECT count(*) FROM ot_ledger WHERE user_id = ? AND entry_type = 'correction'", t.userIds.employee)).toBe(1);
    // A stale version with another value is refused; the same value at the current version appends nothing.
    const stale = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(10, 1) });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
    const unchanged = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(-30, 2) });
    expect(unchanged.status).toBe(200);
    expect(unchanged.body.status).toBe('unchanged');
    expect(unchanged.body.entry).toBeNull();
    expect(ledgerCount()).toBe(2);
    expect((await summary()).posted_minutes).toBe(-30);
    // The repeat of the original opening post is still a no-op, not a second opening balance.
    expect((await postOpening(openingBody(120))).body.status).toBe('duplicate');
    expect(ledgerCount()).toBe(2);
  });

  it('refuses a correction before any opening balance, and the generic credit correction never targets an opening balance', async () => {
    const missing = await t.request('PUT', OPENING, { cookie: employee, body: correctionBody(60, 1) });
    expect(missing.status).toBe(404);
    const posted = await postOpening(openingBody(60));
    expect(() =>
      ledger.postCorrection(
        { db: t.db, clock: t.clock },
        {
          userId: t.userIds.employee,
          sourceKey: 'synthetic-generic-correction',
          originalEntryId: posted.body.entry.id,
          correctedMinutes: 90,
          actorUserId: t.userIds.employee,
          origin: 'manual',
          reason: 'Synthetic attempt through the credit path',
        },
      ),
    ).toThrow(/Only an original credit or deficit debit can be corrected/);
    expect(ledgerCount()).toBe(1);
  });

  it('red-first: concurrent posts from separate connections post once', async () => {
    const racers = 4;
    const barrier = new SharedArrayBuffer(8);
    const flags = new Int32Array(barrier);
    const modules = {
      database: pathToFileURL(fileURLToPath(new URL('../../src/server/db/database.ts', import.meta.url))).href,
      ledger: pathToFileURL(fileURLToPath(new URL('../../src/server/services/ledger.ts', import.meta.url))).href,
    };
    const code = `
      const { parentPort, workerData } = require('node:worker_threads');
      (async () => {
        const { openDatabase } = await import(workerData.modules.database);
        const service = await import(workerData.modules.ledger);
        const db = openDatabase(workerData.path);
        const flags = new Int32Array(workerData.barrier);
        Atomics.add(flags, 1, 1);
        Atomics.wait(flags, 0, 0, 10000);
        try {
          const result = service.postOpeningBalance({ db, clock: { now: () => new Date(workerData.now) } }, workerData.input);
          parentPort.postMessage({ status: result.status });
        } catch (error) {
          parentPort.postMessage({ error: String(error && (error.code || error.message)) });
        } finally {
          db.close();
        }
      })();
    `;
    const input = {
      userId: t.userIds.employee,
      actorUserId: t.userIds.employee,
      minutes: 360,
      asOfDate: '2026-08-30',
      reason: 'Synthetic concurrent opening balance',
      evidenceRef: 'Synthetic payroll letter 0003',
      expectedVersion: 0,
    };
    const results = Array.from({ length: racers }, () => {
      const worker = new Worker(code, { eval: true, workerData: { modules, path: t.config.databasePath, barrier, now: NOW, input } });
      return new Promise<{ status?: string; error?: string }>((resolve, reject) => {
        worker.once('message', (message) => {
          resolve(message as { status?: string; error?: string });
          void worker.terminate();
        });
        worker.once('error', reject);
      });
    });
    const deadline = Date.now() + 10_000;
    while (Atomics.load(flags, 1) < racers && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 5));
    Atomics.store(flags, 0, 1);
    Atomics.notify(flags, 0);
    const outcomes = await Promise.all(results);
    expect(outcomes.filter((outcome) => outcome.status === 'posted')).toHaveLength(1);
    expect(outcomes.filter((outcome) => outcome.status === 'duplicate')).toHaveLength(racers - 1);
    expect(ledgerCount()).toBe(1);
    expect(ledgerAudits()).toBe(1);
    expect(sumOfDeltas()).toBe(360);
  });
});

describe('ownership (owner only)', () => {
  it('red-first: another user and an administrator cannot post or read the owner opening balance', async () => {
    const other = await account('other@example.invalid');
    const shared = `/api/shared/${t.userIds.employee}/ot/opening-balance`;
    for (const cookie of [admin, other.cookie]) {
      expect((await t.request('POST', shared, { cookie, body: openingBody(60) })).status).toBe(404);
      expect((await t.request('PUT', shared, { cookie, body: correctionBody(60, 1) })).status).toBe(404);
      expect((await t.request('GET', shared, { cookie })).status).toBe(404);
      // The owner is never a field: naming someone else is refused.
      const named = await t.request('POST', OPENING, { cookie, body: openingBody(60, { user_id: t.userIds.employee }) });
      expect(named.status).toBe(422);
    }
    expect(ledgerCount()).toBe(0);
    // An administrator's own post lands only on the administrator's own balance.
    expect((await postOpening(openingBody(45), admin)).status).toBe(201);
    expect(ledgerCount()).toBe(0);
    expect(ledgerCount(t.userIds.admin)).toBe(1);
    expect((await summary()).posted_minutes).toBe(0);
    expect((await t.request('GET', OPENING, { cookie: employee })).body.opening_balance).toBeNull();
  });

  it('red-first: a share grantee with OT read and edit access cannot post, correct or read the opening balance', async () => {
    const grantee = await account('grantee@example.invalid');
    grantShare(t.db, t.clock, { ownerUserId: t.userIds.employee, granteeEmail: 'grantee@example.invalid', items: { timesheets: 'edit', otRead: true, pdfDownload: true } });
    expect((await postOpening(openingBody(60))).status).toBe(201);
    const base = `/api/shared/${t.userIds.employee}/ot`;
    // The read-only OT share still works.
    expect((await t.request('GET', `${base}/ledger`, { cookie: grantee.cookie })).status).toBe(200);
    expect((await t.request('POST', `${base}/opening-balance`, { cookie: grantee.cookie, body: openingBody(60) })).status).toBe(404);
    expect((await t.request('PUT', `${base}/opening-balance`, { cookie: grantee.cookie, body: correctionBody(90, 1) })).status).toBe(404);
    expect((await t.request('GET', `${base}/opening-balance`, { cookie: grantee.cookie })).status).toBe(404);
    expect(ledgerCount()).toBe(1);
    expect(ledgerCount(grantee.id)).toBe(0);
  });
});

describe('R4: the reviewed hash includes the balance', () => {
  it('red-first: posting an opening balance makes an open review stale', async () => {
    const policy = await t.request('POST', '/api/policies', {
      cookie: employee,
      body: {
        effective_from: '2026-09-14',
        required_minutes: 480,
        threshold_minutes: 30,
        rounding_step_minutes: 30,
        reference_start: '08:00',
        reference_end: '16:00',
        breaks: [],
        deficit_mode: 'auto_deduct',
        note: 'Synthetic opening balance review policy',
      },
    });
    expect(policy.status, JSON.stringify(policy.body)).toBe(201);
    const session = await t.request('POST', '/api/days/2026-09-15/sessions', {
      cookie: employee,
      body: { start: la('2026-09-15T09:00'), end: la('2026-09-15T13:00'), input_zone: LA, breaks: [], breaks_confirmed: true },
    });
    expect(session.status, JSON.stringify(session.body)).toBe(201);
    const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(16, 8), 'image/png');

    const reviewed = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    expect(reviewed.status).toBe(200);
    expect(reviewed.body.payload.deficit_proposals.map((item: any) => [item.decision, item.available_minutes_before])).toEqual([['insufficient_balance', 0]]);

    expect((await postOpening(openingBody(600))).status).toBe(201);
    const fresh = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
    expect(fresh.body.payload_hash).not.toBe(reviewed.body.payload_hash);
    expect(fresh.body.expected_version).toBe(reviewed.body.expected_version);
    expect(fresh.body.payload.deficit_proposals.map((item: any) => [item.decision, item.available_minutes_before])).toEqual([['authorized', 600]]);

    const before = count('SELECT count(*) FROM timesheet_revisions');
    const stale = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
      cookie: employee,
      body: { expected_version: reviewed.body.expected_version, reviewed_hash: reviewed.body.payload_hash, signer_name: 'Example Employee', incomplete_evidence_acknowledged: true },
    });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_review');
    expect(count('SELECT count(*) FROM timesheet_revisions')).toBe(before);
    const signed = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
      cookie: employee,
      body: { expected_version: fresh.body.expected_version, reviewed_hash: fresh.body.payload_hash, signer_name: 'Example Employee', incomplete_evidence_acknowledged: true },
    });
    expect(signed.status, JSON.stringify(signed.body)).toBe(201);
  });
});

describe('imported periods (F-2)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
  });

  async function importPeriod(payrollDate: string) {
    const bytes = buildSyntheticWorkbook({ periods: [{ payrollDate }] });
    const uploaded = await app.request('/api/imports', {
      method: 'POST',
      headers: { origin: ORIGIN, cookie: employee, 'content-type': XLSX_MEDIA_TYPE },
      body: bytes,
    });
    const preview = (await uploaded.json()) as any;
    expect(uploaded.status, JSON.stringify(preview)).toBe(201);
    const committed = await t.request('POST', `/api/imports/${preview.import.id}/commit`, { cookie: employee, body: { decisions: [] } });
    expect(committed.status, JSON.stringify(committed.body)).toBe(200);
  }

  it('an imported workbook posts no ledger event; the explicit opening balance is the only carry-in', async () => {
    await importPeriod(PB);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND imported_unverified = 1', t.userIds.employee)).toBe(1);
    expect(ledgerCount()).toBe(0);
    expect(await summary()).toMatchObject({ posted_minutes: 0 });
    expect((await postOpening(openingBody(150))).status).toBe(201);
    expect(ledgerCount()).toBe(1);
    expect((await summary()).posted_minutes).toBe(150);
  });

  it('red-first: recording OT leave use on a date inside an imported period answers 409 imported_period and posts nothing', async () => {
    await importPeriod(PB);
    // Funded by finalized work outside the imported period.
    ledger.postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'synthetic-credit', minutes: 600, workDate: '2026-09-15', actorUserId: null, origin: 'system' },
    );
    const permission = { approver_name: 'Synthetic Manager', approval_date: '2026-08-25', evidence_ref: 'Synthetic chat reference 0001' };
    const inside = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: { request_key: 'leave-inside', leave_date: '2026-09-02', requested_minutes: 120, permission },
    });
    expect(inside.status, JSON.stringify(inside.body)).toBe(201);
    const before = { ledger: ledgerCount(), audits: count('SELECT count(*) FROM audit_events') };
    const refused = await t.request('POST', `/api/ot/leave/${inside.body.request.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-1', minutes: 60, expected_version: inside.body.request.version },
    });
    expect(refused.status, JSON.stringify(refused.body)).toBe(409);
    expect(refused.body.error.code).toBe('imported_period');
    expect({ ledger: ledgerCount(), audits: count('SELECT count(*) FROM audit_events') }).toEqual(before);
    expect(count('SELECT consumed_minutes FROM ot_leave_requests WHERE id = ?', inside.body.request.id)).toBe(0);

    // A leave date outside the imported period is still used normally.
    const outside = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: { request_key: 'leave-outside', leave_date: '2026-09-16', requested_minutes: 120, permission },
    });
    expect(outside.status).toBe(201);
    const used = await t.request('POST', `/api/ot/leave/${outside.body.request.id}/consume`, {
      cookie: employee,
      body: { use_key: 'use-1', minutes: 60, expected_version: outside.body.request.version },
    });
    expect(used.status, JSON.stringify(used.body)).toBe(200);
    expect(used.body.status).toBe('used');
  });
});
