import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import { payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { openDatabase } from '../../src/server/db/database.ts';
import { migrate, MIGRATIONS } from '../../src/server/db/migrations.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { ApiError } from '../../src/server/http/errors.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSweepJobHandler, JOB_ORPHAN_SWEEP } from '../../src/server/jobs/sweepJob.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { listOverdueRecords, runDeadlineScan, setAutomationActivation } from '../../src/server/services/automation.ts';
import { getCalendar } from '../../src/server/services/calendars.ts';
import { runReminderScan } from '../../src/server/services/notifications.ts';
import { createPolicyVersion } from '../../src/server/services/policies.ts';
import { grantShare } from '../../src/server/services/shares.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { saveSubmissionSettings } from '../../src/server/services/submissionSettings.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { createUser } from '../../src/server/services/users.ts';
import { commitImport, previewImport, XLSX_MEDIA_TYPE } from '../../src/server/services/workbookImport.ts';
import { makePng } from '../support/pdfText.ts';
import {
  buildSyntheticWorkbook,
  readTemplateBytes,
  sha256Hex,
  type SyntheticPeriod,
  TEMPLATE_SHA256,
  withEntry,
  withText,
} from '../support/syntheticWorkbook.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T09: workbook import preview and commit (docs/03 "Imports, opening balance and retention", docs/07 "Workbook
 * import", owner decisions F-1 (a) and F-2 (a), AC-12, AC-01, AC-03). Every workbook is generated in memory from the
 * tracked sanitized template with synthetic dated sheets (WP4-T08 generator); nothing is written to the repository and
 * the template's hash is asserted unchanged. Users are synthetic (example.invalid). The clock is always injected: the
 * main context stands on 2026-12-15, after the imported 2026 periods, so the seeded employee's sample rows (the two
 * weeks before the clock) never meet them.
 */

const NOW = '2026-12-15T20:00:00Z';
const PA = '2026-09-04'; // 2026-08-17 .. 2026-08-30
const PB = '2026-09-18'; // 2026-08-31 .. 2026-09-13
const PC = '2026-10-02'; // 2026-09-14 .. 2026-09-27
const SIGNER = 'Example Employee';
const MACRO_TYPE = 'application/vnd.ms-excel.sheet.macroEnabled.12';

const ROW_TABLES = ['timesheets', 'day_entries', 'work_sessions', 'ot_ledger', 'timesheet_revisions', 'signoffs', 'jobs', 'delivery_attempts'] as const;

let t: TestContext;
let app: ReturnType<typeof createApp>;
let dataDir: string;
let files: FileStore;
let owner: string;

interface RawResponse {
  status: number;
  body: any;
}

async function raw(
  method: string,
  path: string,
  options: { cookie?: string; bytes?: Uint8Array; contentType?: string; origin?: string | null; target?: ReturnType<typeof createApp> } = {},
): Promise<RawResponse> {
  const headers: Record<string, string> = {};
  const origin = options.origin === undefined ? ORIGIN : options.origin;
  if (origin !== null) headers.origin = origin;
  if (options.cookie !== undefined) headers.cookie = options.cookie;
  if (options.contentType !== undefined) headers['content-type'] = options.contentType;
  const init: RequestInit = { method, headers };
  if (options.bytes !== undefined) init.body = options.bytes;
  const response = await (options.target ?? app).request(path, init);
  const text = await response.text();
  let body: unknown = text;
  try {
    body = text === '' ? null : JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

const upload = (bytes: Uint8Array, cookie = owner, contentType = XLSX_MEDIA_TYPE) => raw('POST', '/api/imports', { cookie, bytes, contentType });

const commit = (id: string, decisions: Array<{ work_date: string; action: string }>, cookie = owner) =>
  t.request('POST', `/api/imports/${id}/commit`, { cookie, body: { decisions } });

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

function rowCounts(): Record<(typeof ROW_TABLES)[number], number> {
  return Object.fromEntries(ROW_TABLES.map((table) => [table, count(`SELECT count(*) FROM ${table}`)])) as Record<(typeof ROW_TABLES)[number], number>;
}

function storedFiles(): string[] {
  const dir = join(dataDir, 'files');
  return existsSync(dir) ? readdirSync(dir) : [];
}

function workbook(periods: readonly SyntheticPeriod[]): Uint8Array {
  return buildSyntheticWorkbook({ periods });
}

async function signIn(email: string, password: string): Promise<string> {
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  if (response.status !== 200) throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (cookie === undefined) throw new Error('No session cookie');
  return cookie;
}

async function account(email: string, displayName: string): Promise<{ id: string; cookie: string }> {
  const password = `Synthetic-${randomUUID()}`;
  const created = await createUser(t.db, t.clock, { email, displayName, role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  return { id: created, cookie: await signIn(email, password) };
}

/** Uploads and commits a workbook; the batch must need no decisions unless they are given. */
async function importPeriods(periods: readonly SyntheticPeriod[], decisions: Array<{ work_date: string; action: string }> = []) {
  const preview = await upload(workbook(periods));
  expect(preview.status, JSON.stringify(preview.body)).toBe(201);
  const committed = await commit(preview.body.import.id, decisions);
  expect(committed.status, JSON.stringify(committed.body)).toBe(200);
  return committed.body.import;
}

beforeEach(async () => {
  t = await createTestContext(NOW);
  app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  owner = await t.login('employee');
});

afterEach(() => t.close());

afterAll(() => {
  // The tracked template is only ever read; its bytes and hash never change.
  expect(sha256Hex(readTemplateBytes())).toBe(TEMPLATE_SHA256);
});

describe('migration 0012 (imports)', () => {
  it('is migration 12 and runs on a fresh database from 1 to the latest (13)', () => {
    expect(MIGRATIONS[11]).toMatchObject({ version: 12, name: 'imports' });
    const dir = mkdtempSync(join(tmpdir(), 'timesheet-import-migration-'));
    const db = openDatabase(join(dir, 'fresh.db'));
    try {
      expect(migrate(db, MIGRATIONS, new Date('2026-10-20T12:00:00Z'))).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], version: 13 });
      expect(db.pragma('user_version', { simple: true })).toBe(13);
      const columns = db.prepare("SELECT name FROM pragma_table_info('imports') ORDER BY cid").pluck().all();
      expect(columns).toEqual([
        'id',
        'user_id',
        'source_sha256',
        'mapping_version',
        'state',
        'storage_key',
        'size_bytes',
        'report_json',
        'decisions_json',
        'result_json',
        'created_at',
        'committed_at',
      ]);
      const unique = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND name = 'imports_idempotency'").pluck().get();
      expect(unique).toBe('CREATE UNIQUE INDEX imports_idempotency ON imports(user_id, source_sha256, mapping_version)');
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('upgrades a populated schema 11 database to 12 (and 13) without touching existing rows', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'timesheet-import-upgrade-'));
    const db = openDatabase(join(dir, 'v11.db'));
    try {
      migrate(db, MIGRATIONS.slice(0, 11), new Date('2026-10-01T00:00:00Z'));
      const seed = await seedSynthetic(db, t.clock, { passwords: { admin: randomUUID(), employee: randomUUID() } });
      const seeded = seed.users.find((user) => user.role === 'employee');
      if (seeded === undefined) throw new Error('Seed employee missing');
      const employee: SessionUser = { id: seeded.id, email: seeded.email, displayName: 'Seed Employee', role: 'employee', calendarId: seed.calendarId ?? '', sessionId: 'test' };
      createSession({ db, clock: t.clock, user: employee }, '2026-09-15', {
        start: la('2026-09-15T09:00'),
        end: la('2026-09-15T17:00'),
        input_zone: LA,
        breaks: [],
        breaks_confirmed: true,
        reason: 'Synthetic schema 11 row',
      });
      const before = ['users', 'timesheets', 'day_entries', 'work_sessions', 'ot_ledger', 'audit_events'].map((table) =>
        db.prepare(`SELECT count(*) FROM ${table}`).pluck().get(),
      );
      expect(before.slice(0, 4).every((value) => Number(value) > 0)).toBe(true);
      expect(migrate(db, MIGRATIONS, new Date('2026-10-20T12:00:00Z'))).toEqual({ applied: [12, 13], version: 13 });
      const after = ['users', 'timesheets', 'day_entries', 'work_sessions', 'ot_ledger', 'audit_events'].map((table) =>
        db.prepare(`SELECT count(*) FROM ${table}`).pluck().get(),
      );
      expect(after).toEqual(before);
      expect(db.prepare('SELECT count(*) FROM imports').pluck().get()).toBe(0);
      expect(migrate(db)).toEqual({ applied: [], version: 13 });
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps a committed batch immutable and never deletes a batch', async () => {
    const batch = await importPeriods([{ payrollDate: PB }]);
    expect(() => t.db.prepare("UPDATE imports SET result_json = '{}' WHERE id = ?").run(batch.id)).toThrow(/immutable_import/);
    expect(() => t.db.prepare("UPDATE imports SET state = 'preview' WHERE id = ?").run(batch.id)).toThrow(/immutable_import/);
    expect(() => t.db.prepare('DELETE FROM imports WHERE id = ?').run(batch.id)).toThrow(/immutable_import/);
  });
});

describe('preview', () => {
  it('stores the source privately and reports the mapped days with their source cells, findings and plan', async () => {
    const baseline = rowCounts();
    const bytes = workbook([{ payrollDate: PB, employee: 'Test Person Alpha (alpha@example.invalid)' }]);
    const response = await upload(bytes);
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const batch = response.body.import;
    expect(batch).toMatchObject({ state: 'preview', source_sha256: sha256Hex(bytes), mapping_version: 1, size_bytes: bytes.length, committed_at: null });

    // The source: one private object with the uploaded bytes, outside any static root; the row holds only its key.
    const row = t.db.prepare('SELECT storage_key, size_bytes FROM imports WHERE id = ?').get(batch.id) as { storage_key: string; size_bytes: number };
    expect(storedFiles()).toEqual([row.storage_key]);
    expect(sha256Hex(new Uint8Array(readFileSync(files.pathOf(row.storage_key))))).toBe(sha256Hex(bytes));

    // Mapped days with cell provenance, never the employee cell's text.
    const report = batch.report;
    expect(report.days).toHaveLength(14);
    expect(report.days[0]).toMatchObject({
      sheet: '2026.09.18',
      work_date: '2026-08-31',
      label: { value: 'Worked', source: '2026.09.18!B14', from_formula_cache: false },
      date_cell: { value: '2026-08-31', source: '2026.09.18!B13' },
      category: 'Worked',
      label_status: 'mapped',
    });
    expect(report.days[5]).toMatchObject({ work_date: '2026-09-05', label: null, label_status: 'blank' });
    expect(report.employee_cells).toEqual(['2026.09.18!I8']);
    expect(JSON.stringify(batch)).not.toContain('Test Person Alpha');
    expect(JSON.stringify(batch)).not.toContain('alpha@example.invalid');
    // The template defects are reported, never imported as rules.
    expect(report.findings.map((finding: { code: string }) => finding.code)).toEqual(
      expect.arrayContaining(['formula_hours_8_5', 'weekly_total_omits_sunday', 'today_signature_date', 'floating_holiday']),
    );
    expect(report.rules.length).toBeGreaterThan(0);
    // A new past period with ten labelled weekdays: everything importable, nothing to decide.
    expect(batch.plan.periods).toEqual([
      expect.objectContaining({ payroll_date: PB, period_start: '2026-08-31', period_end: '2026-09-13', state: 'new' }),
    ]);
    expect(batch.plan.importable_days).toBe(10);
    expect(batch.plan.decisions_required).toEqual([]);

    // A preview writes no timesheet data, only its batch and one audit row of the owner.
    expect(rowCounts()).toEqual(baseline);
    expect(t.db.prepare("SELECT actor_user_id, owner_user_id FROM audit_events WHERE operation = 'import.preview'").all()).toEqual([
      { actor_user_id: t.userIds.employee, owner_user_id: t.userIds.employee },
    ]);
  });

  it('returns the existing batch for the same upload and stores nothing new', async () => {
    const bytes = workbook([{ payrollDate: PB }]);
    const first = await upload(bytes);
    expect(first.status).toBe(201);
    const again = await upload(bytes);
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ created: false, import: { id: first.body.import.id, state: 'preview' } });
    expect(count('SELECT count(*) FROM imports')).toBe(1);
    expect(storedFiles()).toHaveLength(1);
    expect(count("SELECT count(*) FROM audit_events WHERE operation = 'import.preview'")).toBe(1);
  });

  it('never serves the stored source: no source route, and nothing under the static root', async () => {
    const response = await upload(workbook([{ payrollDate: PB }]));
    const key = (t.db.prepare('SELECT storage_key FROM imports WHERE id = ?').get(response.body.import.id) as { storage_key: string }).storage_key;
    expect((await raw('GET', `/api/imports/${response.body.import.id}/source`, { cookie: owner })).status).toBe(404);

    const staticDir = mkdtempSync(join(tmpdir(), 'timesheet-import-static-'));
    try {
      writeFileSync(join(staticDir, 'index.html'), '<!doctype html><title>client</title>');
      const served = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir }, { dataDir });
      for (const path of [`/${key}`, `/files/${key}`, `/private-data/files/${key}`]) {
        const probe = await raw('GET', path, { cookie: owner, target: served });
        expect(String(probe.body), path).not.toContain('PK');
        expect(String(probe.body), path).toContain('client');
      }
    } finally {
      rmSync(staticDir, { recursive: true, force: true });
    }
  });
});

describe('commit', () => {
  it('writes only imported_unverified timesheets, explicit day entries and owner audit rows', async () => {
    const bytes = workbook([
      { payrollDate: PA, days: { 1: { label: 'Work From Home' }, 2: { label: 'Vacation' }, 3: { label: 'Sick Day' }, 4: { label: 'Shutdown' }, 7: { label: 'Holiday' } } },
      { payrollDate: PB, days: { 0: { start: 8 * 60, end: 17 * 60 } } },
    ]);
    const preview = await upload(bytes);
    const before = rowCounts();
    const auditBefore = count('SELECT count(*) FROM audit_events');
    const response = await commit(preview.body.import.id, []);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.status).toBe('committed');
    const result = response.body.import.result;
    expect(result).toMatchObject({ day_entries: 20, skipped: [], imported_on_decision: [] });
    expect(result.periods.map((period: { payroll_date: string }) => period.payroll_date)).toEqual([PA, PB]);

    const after = rowCounts();
    expect(after).toEqual({ ...before, timesheets: before.timesheets + 2, day_entries: before.day_entries + 20 });
    expect(t.db.prepare('SELECT DISTINCT imported_unverified, version, finalized_revision_no FROM timesheets WHERE user_id = ? AND id IN (SELECT timesheet_id FROM day_entries WHERE work_date BETWEEN ? AND ?)').all(t.userIds.employee, '2026-08-17', '2026-09-13')).toEqual([
      { imported_unverified: 1, version: 1, finalized_revision_no: null },
    ]);
    const entries = t.db
      .prepare("SELECT work_date, category, category_source, leave_minutes, leave_kind, wfh, notes FROM day_entries WHERE user_id = ? AND work_date BETWEEN '2026-08-17' AND '2026-08-30' ORDER BY work_date")
      .all(t.userIds.employee) as Array<Record<string, unknown>>;
    expect(entries.slice(0, 5)).toEqual([
      { work_date: '2026-08-17', category: 'Worked', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: 0, notes: '' },
      { work_date: '2026-08-18', category: 'Worked', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: 1, notes: '' },
      { work_date: '2026-08-19', category: 'Vacation', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: 0, notes: '' },
      { work_date: '2026-08-20', category: 'Sick', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: 0, notes: '' },
      { work_date: '2026-08-21', category: 'Shutdown', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: 0, notes: '' },
    ]);
    expect(entries[5]).toMatchObject({ work_date: '2026-08-24', category: 'Holiday' });
    // The clock cells are reported, never imported (O12): no work session.
    expect(count('SELECT count(*) FROM work_sessions WHERE user_id = ? AND work_date = ?', t.userIds.employee, '2026-08-31')).toBe(0);
    expect(response.body.import.report.days.find((day: { work_date: string }) => day.work_date === '2026-08-31').start_clock).toMatchObject({ value: 480, source: '2026.09.18!B15' });

    // Audit: the owner is actor and subject of every row the commit wrote.
    const audits = t.db
      .prepare("SELECT operation, actor_user_id, owner_user_id, via_share_id FROM audit_events WHERE operation IN ('import.commit', 'timesheet.import', 'day_entry.import')")
      .all() as Array<{ operation: string; actor_user_id: string; owner_user_id: string; via_share_id: string | null }>;
    expect(audits).toHaveLength(1 + 2 + 20);
    expect(new Set(audits.map((row) => `${row.actor_user_id}|${row.owner_user_id}|${row.via_share_id}`))).toEqual(
      new Set([`${t.userIds.employee}|${t.userIds.employee}|null`]),
    );
    expect(count('SELECT count(*) FROM audit_events') - auditBefore).toBe(23);
  });

  it('red-first: an identical re-import changes no row count and returns the first batch', async () => {
    const bytes = workbook([{ payrollDate: PA }, { payrollDate: PB }]);
    const preview = await upload(bytes);
    const first = await commit(preview.body.import.id, []);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const counts = rowCounts();
    const audit = count('SELECT count(*) FROM audit_events');

    const again = await upload(bytes);
    expect(again.status).toBe(200);
    expect(again.body.import).toMatchObject({ id: preview.body.import.id, state: 'committed' });
    const replay = await commit(preview.body.import.id, []);
    expect(replay.status, JSON.stringify(replay.body)).toBe(200);
    expect(replay.body.status).toBe('replayed');
    expect(replay.body.import.result).toEqual(first.body.import.result);
    expect(rowCounts()).toEqual(counts);
    expect(count('SELECT count(*) FROM audit_events')).toBe(audit);
    expect(count('SELECT count(*) FROM imports')).toBe(1);
    expect(storedFiles()).toHaveLength(1);

    // A different commit of a committed batch is refused and writes nothing.
    const other = await commit(preview.body.import.id, [{ work_date: '2026-08-17', action: 'skip' }]);
    expect(other.status).toBe(409);
    expect(other.body.error.code).toBe('import_already_committed');
    expect(rowCounts()).toEqual(counts);
  });

  it('red-first: two concurrent identical commits produce one committed batch', async () => {
    const preview = await upload(workbook([{ payrollDate: PA }, { payrollDate: PB }]));
    const before = rowCounts();
    const outcomes = await raceCommits(preview.body.import.id, 2);
    expect(outcomes.map((outcome) => outcome.error ?? null)).toEqual([null, null]);
    expect(outcomes.map((outcome) => outcome.status).sort()).toEqual(['committed', 'replayed']);
    expect(outcomes[0]?.result).toEqual(outcomes[1]?.result);
    expect(rowCounts()).toEqual({ ...before, timesheets: before.timesheets + 2, day_entries: before.day_entries + 20 });
    expect(count("SELECT count(*) FROM audit_events WHERE operation = 'import.commit'")).toBe(1);
    expect(count("SELECT count(*) FROM imports WHERE state = 'committed'")).toBe(1);
  });

  it('red-first: a conflicting day without a decision refuses the commit and writes nothing', async () => {
    // A draft app period: the owner already recorded work in PC.
    const session = await t.request('POST', '/api/days/2026-09-15/sessions', {
      cookie: owner,
      body: { start: la('2026-09-15T09:00'), end: la('2026-09-15T17:00'), input_zone: LA, breaks: [], breaks_confirmed: true, reason: 'Synthetic old-period entry' },
    });
    expect(session.status, JSON.stringify(session.body)).toBe(201);
    const preview = await upload(workbook([{ payrollDate: PB }, { payrollDate: PC }]));
    const plan = preview.body.import.plan;
    expect(plan.periods.find((period: { payroll_date: string }) => period.payroll_date === PC)).toMatchObject({
      state: 'existing_app_rows',
      existing: { timesheet: true, day_entries: 1, work_sessions: 1 },
    });
    expect(plan.decisions_required).toHaveLength(10);
    expect(plan.decisions_required[0]).toEqual({ work_date: '2026-09-14', reasons: ['existing_app_rows'], allowed_actions: ['skip'], sources: ['2026.10.02!B14'] });
    const before = { ...rowCounts(), audit: count('SELECT count(*) FROM audit_events') };
    const day = t.db.prepare('SELECT * FROM day_entries WHERE user_id = ? AND work_date = ?').get(t.userIds.employee, '2026-09-15');

    const refused = await commit(preview.body.import.id, []);
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('decisions_required');
    expect(refused.body.error.details.decisions_required).toHaveLength(10);
    const partial = await commit(preview.body.import.id, [{ work_date: '2026-09-14', action: 'skip' }]);
    expect(partial.status).toBe(409);
    expect(partial.body.error.details.decisions_required).toHaveLength(9);
    const overwrite = await commit(
      preview.body.import.id,
      plan.decisions_required.map((item: { work_date: string }) => ({ work_date: item.work_date, action: 'import' })),
    );
    expect(overwrite.status).toBe(422);
    expect(overwrite.body.error.code).toBe('decision_not_allowed');
    const unknown = await commit(preview.body.import.id, [{ work_date: '2026-08-31', action: 'skip' }]);
    expect(unknown.status).toBe(422);
    expect(unknown.body.error.code).toBe('unknown_decision');
    expect({ ...rowCounts(), audit: count('SELECT count(*) FROM audit_events') }).toEqual(before);
    expect(count("SELECT count(*) FROM imports WHERE state = 'preview'")).toBe(1);

    // Explicit skips: PB is imported, the draft PC stays exactly as it was and is not flagged.
    const skipped = await commit(
      preview.body.import.id,
      plan.decisions_required.map((item: { work_date: string }) => ({ work_date: item.work_date, action: 'skip' })),
    );
    expect(skipped.status, JSON.stringify(skipped.body)).toBe(200);
    expect(skipped.body.import.result.periods.map((period: { payroll_date: string }) => period.payroll_date)).toEqual([PB]);
    expect(skipped.body.import.result.skipped).toHaveLength(10);
    expect(t.db.prepare('SELECT * FROM day_entries WHERE user_id = ? AND work_date = ?').get(t.userIds.employee, '2026-09-15')).toEqual(day);
    expect(count('SELECT count(*) FROM day_entries WHERE user_id = ? AND work_date BETWEEN ? AND ?', t.userIds.employee, '2026-09-14', '2026-09-27')).toBe(1);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND imported_unverified = 1', t.userIds.employee)).toBe(1);
  });

  it('red-first: never overwrites a finalized period', async () => {
    await t.request('POST', '/api/days/2026-09-15/sessions', {
      cookie: owner,
      body: { start: la('2026-09-15T09:00'), end: la('2026-09-15T17:00'), input_zone: LA, breaks: [], breaks_confirmed: true, reason: 'Synthetic old-period entry' },
    });
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
    const review = await t.request('GET', `/api/timesheets/${PC}/review`, { cookie: owner });
    const signed = await t.request('POST', `/api/timesheets/${PC}/signoff`, {
      cookie: owner,
      body: { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true },
    });
    expect(signed.status, JSON.stringify(signed.body)).toBe(201);
    const finalizedRows = t.db.prepare('SELECT * FROM timesheets WHERE user_id = ? AND finalized_revision_no IS NOT NULL').all(t.userIds.employee);
    const entries = t.db.prepare("SELECT * FROM day_entries WHERE user_id = ? AND work_date BETWEEN '2026-09-14' AND '2026-09-27'").all(t.userIds.employee);

    const preview = await upload(workbook([{ payrollDate: PC, days: { 1: { label: 'Vacation' } } }]));
    expect(preview.body.import.plan.periods[0]).toMatchObject({ payroll_date: PC, state: 'finalized' });
    const items = preview.body.import.plan.decisions_required as Array<{ work_date: string; reasons: string[]; allowed_actions: string[] }>;
    expect(items).toHaveLength(10);
    expect(new Set(items.map((item) => `${item.reasons.join()}|${item.allowed_actions.join()}`))).toEqual(new Set(['finalized_period|skip']));
    const overwrite = await commit(preview.body.import.id, items.map((item) => ({ work_date: item.work_date, action: 'import' })));
    expect(overwrite.status).toBe(422);
    const counts = rowCounts();
    const skipped = await commit(preview.body.import.id, items.map((item) => ({ work_date: item.work_date, action: 'skip' })));
    expect(skipped.status).toBe(200);
    expect(skipped.body.import.result).toMatchObject({ periods: [], day_entries: 0 });
    expect(rowCounts()).toEqual(counts);
    expect(t.db.prepare('SELECT * FROM timesheets WHERE user_id = ? AND finalized_revision_no IS NOT NULL').all(t.userIds.employee)).toEqual(finalizedRows);
    expect(t.db.prepare("SELECT * FROM day_entries WHERE user_id = ? AND work_date BETWEEN '2026-09-14' AND '2026-09-27'").all(t.userIds.employee)).toEqual(entries);
  });

  it('never overwrites an imported period from another workbook', async () => {
    await importPeriods([{ payrollDate: PB }]);
    const preview = await upload(workbook([{ payrollDate: PB, days: { 0: { label: 'Vacation' } } }]));
    expect(preview.body.import.plan.periods[0]).toMatchObject({ state: 'imported' });
    expect(preview.body.import.plan.decisions_required[0]).toMatchObject({ reasons: ['imported_period'], allowed_actions: ['skip'] });
  });

  it('red-first (R3): a period that has ended but is not yet due is skip-only, so an import cannot make a live period unsignable', async () => {
    const PD = '2026-12-25'; // 2026-12-07 .. 2026-12-20; due Tuesday 2026-12-22 17:00 in Los Angeles = 2026-12-23T01:00:00Z
    t.clock.set('2026-12-21T20:00:00Z'); // the period has ended (last day 12-20) and its due instant is a day away
    const cookie = await t.login('employee');
    const preview = await upload(workbook([{ payrollDate: PD }]), cookie);
    expect(preview.status, JSON.stringify(preview.body)).toBe(201);
    const id = preview.body.import.id;
    const plan = preview.body.import.plan;
    expect(plan.periods).toMatchObject([{ payroll_date: PD, period_start: '2026-12-07', period_end: '2026-12-20', state: 'not_due' }]);
    expect(plan.importable_days).toBe(0);
    expect(plan.decisions_required.length).toBeGreaterThan(0);
    for (const item of plan.decisions_required) expect(item).toMatchObject({ reasons: ['period_not_due'], allowed_actions: ['skip'] });
    expect(preview.body.import.report.rules.join(' ')).toMatch(/due instant/);

    // An explicit import is refused; skip is the only decision, and it writes nothing.
    const first = plan.decisions_required[0].work_date;
    const imported = await commit(id, [{ work_date: first, action: 'import' }], cookie);
    expect(imported.status).toBe(422);
    expect(imported.body.error.code).toBe('decision_not_allowed');
    const before = rowCounts();

    // One second before the due instant it is still skip-only; at the due instant the period is history again.
    t.clock.set('2026-12-23T00:59:59Z');
    const later = await t.login('employee'); // the earlier session has expired by now
    const early = await t.request('GET', `/api/imports/${id}`, { cookie: later });
    expect(early.status, JSON.stringify(early.body)).toBe(200);
    expect(early.body.import.plan.periods[0].state).toBe('not_due');
    t.clock.set('2026-12-23T01:00:00Z');
    const due = await t.request('GET', `/api/imports/${id}`, { cookie: later });
    expect(due.body.import.plan.periods[0].state).toBe('new');
    expect(due.body.import.plan.decisions_required).toEqual([]);
    expect(rowCounts()).toEqual(before);
  });

  it('asks for a decision on unclear days: skip only, or skip or import for non-authoritative labels', async () => {
    const floating = workbook([
      {
        payrollDate: PA,
        days: {
          0: { label: 'Floating Holiday' },
          1: { label: 'Banana Day' },
          2: { label: 'Off day (overtime used)' },
          3: { labelFormulaCache: 'Worked' },
          4: { date: null },
          7: { date: '2026-08-25' },
        },
      },
      { payrollDate: '2026-07-31' },
      { payrollDate: '2027-01-22' },
      { payrollDate: '2025-12-26' },
    ]);
    const preview = await upload(floating);
    expect(preview.status).toBe(201);
    const plan = preview.body.import.plan;
    const state = (payroll: string) => plan.periods.find((period: { payroll_date: string }) => period.payroll_date === payroll).state;
    expect(state('2026-07-31')).toBe('not_in_calendar');
    expect(state('2027-01-22')).toBe('not_ended');
    const item = (date: string) => plan.decisions_required.find((entry: { work_date: string }) => entry.work_date === date);
    expect(item('2026-08-17')).toMatchObject({ reasons: ['floating_holiday'], allowed_actions: ['skip', 'import'] });
    expect(item('2026-08-18')).toMatchObject({ reasons: ['unknown_label'], allowed_actions: ['skip'] });
    expect(item('2026-08-19')).toMatchObject({ reasons: ['unsupported_label'], allowed_actions: ['skip'] });
    expect(item('2026-08-20')).toMatchObject({ reasons: ['label_from_formula_cache'], allowed_actions: ['skip', 'import'] });
    expect(item('2026-08-21')).toMatchObject({ reasons: ['date_cell_missing'], allowed_actions: ['skip'] });
    expect(item('2026-08-24')).toMatchObject({ reasons: ['date_unexpected'], allowed_actions: ['skip'] });
    expect(item('2025-12-08')).toMatchObject({ allowed_actions: ['skip'] });
    expect(item('2025-12-08').reasons).toContain('outside_calendar');
    expect(item('2027-01-04')).toMatchObject({ reasons: ['period_not_ended'], allowed_actions: ['skip'] });
    expect(preview.body.import.report.findings.map((finding: { code: string }) => finding.code)).toEqual(expect.arrayContaining(['unknown_label']));

    const decisions = plan.decisions_required.map((entry: { work_date: string; allowed_actions: string[] }) => ({
      work_date: entry.work_date,
      action: entry.allowed_actions.includes('import') ? 'import' : 'skip',
    }));
    const response = await commit(preview.body.import.id, decisions);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.import.result.imported_on_decision).toEqual(['2026-08-17', '2026-08-20']);
    const imported = t.db
      .prepare("SELECT work_date, category FROM day_entries WHERE user_id = ? AND work_date BETWEEN '2026-08-17' AND '2026-08-30' ORDER BY work_date")
      .all(t.userIds.employee);
    expect(imported).toEqual([
      { work_date: '2026-08-17', category: 'Holiday' },
      { work_date: '2026-08-20', category: 'Worked' },
      { work_date: '2026-08-25', category: 'Worked' },
      { work_date: '2026-08-26', category: 'Worked' },
      { work_date: '2026-08-27', category: 'Worked' },
      { work_date: '2026-08-28', category: 'Worked' },
    ]);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND imported_unverified = 1', t.userIds.employee)).toBe(1);
  });
});

describe('ownership (F-1): only the owner previews, reads and commits', () => {
  it('red-first: another user cannot read or commit someone else\'s preview (404)', async () => {
    const preview = await upload(workbook([{ payrollDate: PB }]));
    const id = preview.body.import.id;
    const stranger = await account('stranger@example.invalid', 'Synthetic Stranger');
    expect((await t.request('GET', `/api/imports/${id}`, { cookie: stranger.cookie })).status).toBe(404);
    const refused = await commit(id, [], stranger.cookie);
    expect(refused.status).toBe(404);
    expect((await t.request('GET', '/api/imports', { cookie: stranger.cookie })).body).toEqual({ imports: [] });
    // The same bytes uploaded by the stranger are the stranger's own batch, never the owner's.
    const own = await upload(workbook([{ payrollDate: PB }]), stranger.cookie);
    expect(own.status).toBe(201);
    expect(own.body.import.id).not.toBe(id);
    expect(count("SELECT count(*) FROM imports WHERE state = 'preview'")).toBe(2);
    expect(count('SELECT count(*) FROM timesheets WHERE imported_unverified = 1')).toBe(0);
  });

  it('red-first: an administrator gets 404 for another person\'s import and has no route to import for anyone else', async () => {
    const preview = await upload(workbook([{ payrollDate: PB }]));
    const id = preview.body.import.id;
    const admin = await t.login('admin');
    expect((await t.request('GET', `/api/imports/${id}`, { cookie: admin })).status).toBe(404);
    expect((await commit(id, [], admin)).status).toBe(404);
    expect((await t.request('GET', '/api/imports', { cookie: admin })).body).toEqual({ imports: [] });
    for (const path of [`/api/admin/imports`, `/api/admin/users/${t.userIds.employee}/imports`, `/api/admin/imports/${id}/commit`]) {
      expect((await t.request('POST', path, { cookie: admin, body: { decisions: [] } })).status, path).toBe(404);
    }
    const routes = [...new Set(app.routes.filter((route) => route.path.includes('import')).map((route) => `${route.method} ${route.path}`))];
    expect(routes.filter((route) => !route.includes(' /api/imports'))).toEqual(['POST /api/admin/calendar/import/preview', 'POST /api/admin/calendar/import/commit']);
    expect(count("SELECT count(*) FROM imports WHERE state = 'committed'")).toBe(0);
  });

  it('red-first: a share grantee cannot import for, read or commit the owner\'s imports', async () => {
    const preview = await upload(workbook([{ payrollDate: PB }]));
    const id = preview.body.import.id;
    const grantee = await account('grantee@example.invalid', 'Synthetic Grantee');
    grantShare(t.db, t.clock, { ownerUserId: t.userIds.employee, granteeEmail: 'grantee@example.invalid', items: { timesheets: 'edit', otRead: true, pdfDownload: true } });
    const shared = `/api/shared/${t.userIds.employee}`;
    expect((await t.request('GET', `${shared}/imports`, { cookie: grantee.cookie })).status).toBe(404);
    expect((await t.request('GET', `${shared}/imports/${id}`, { cookie: grantee.cookie })).status).toBe(404);
    expect((await t.request('POST', `${shared}/imports/${id}/commit`, { cookie: grantee.cookie, body: { decisions: [] } })).status).toBe(404);
    expect((await t.request('POST', `${shared}/imports`, { cookie: grantee.cookie, body: {} })).status).toBe(404);
    expect((await raw('POST', `${shared}/imports`, { cookie: grantee.cookie, bytes: workbook([{ payrollDate: PA }]), contentType: XLSX_MEDIA_TYPE })).status).not.toBe(201);
    expect((await t.request('GET', `/api/imports/${id}`, { cookie: grantee.cookie })).status).toBe(404);
    expect((await commit(id, [], grantee.cookie)).status).toBe(404);
    // The grantee's own upload lands in the grantee's own account only.
    const own = await upload(workbook([{ payrollDate: PA }]), grantee.cookie);
    expect(own.status).toBe(201);
    expect(count('SELECT count(*) FROM imports WHERE user_id = ?', t.userIds.employee)).toBe(1);
    expect(count('SELECT count(*) FROM timesheets WHERE user_id = ? AND imported_unverified = 1', t.userIds.employee)).toBe(0);
  });
});

const EDIT_AUDITS =
  "SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND (operation LIKE 'day_entry.%' OR operation LIKE 'work_session.%' OR operation LIKE 'timesheet.%')";

describe('imported periods are read-only history (F-2)', () => {
  it('red-first: sign, submit and day or session edits answer 409 imported_period and post no ledger event', async () => {
    await importPeriods([{ payrollDate: PB }]);
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
    const before = { ...rowCounts(), edits: count(EDIT_AUDITS, t.userIds.employee) };
    const entry = t.db.prepare('SELECT version FROM day_entries WHERE user_id = ? AND work_date = ?').get(t.userIds.employee, '2026-09-01') as { version: number };

    const review = await t.request('GET', `/api/timesheets/${PB}/review`, { cookie: owner });
    expect(review.status).toBe(200);
    const signoffBody = { expected_version: review.body.expected_version, reviewed_hash: review.body.payload_hash, signer_name: SIGNER, incomplete_evidence_acknowledged: true };
    const attempts: Array<[string, string, unknown]> = [
      ['POST', `/api/timesheets/${PB}/signoff`, signoffBody],
      ['POST', `/api/timesheets/${PB}/revisions`, { ...signoffBody, reason: 'Synthetic correction', send_email: true }],
      ['POST', `/api/timesheets/${PB}/late-review`, { ...signoffBody, send_email: true }],
      ['PUT', '/api/days/2026-09-01', { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '', expected_version: entry.version, reason: 'Synthetic edit' }],
      ['PUT', '/api/days/2026-09-05', { category: 'Worked', leave_minutes: 0, wfh: false, notes: '', reason: 'Synthetic edit' }],
      ['POST', '/api/days/batch', { mode: 'commit', entries: [{ work_date: '2026-09-02', category: 'Off', expected_version: 1 }], reason: 'Synthetic edit' }],
      [
        'POST',
        '/api/days/2026-09-03/sessions',
        { start: la('2026-09-03T09:00'), end: la('2026-09-03T17:00'), input_zone: LA, breaks: [], breaks_confirmed: true, reason: 'Synthetic edit' },
      ],
    ];
    for (const [method, path, body] of attempts) {
      const response = await t.request(method, path, { cookie: owner, body });
      expect(response.status, `${method} ${path} ${JSON.stringify(response.body)}`).toBe(409);
      expect(response.body.error.code, `${method} ${path}`).toBe('imported_period');
    }

    // A grantee with an edit share meets the same guard.
    const grantee = await account('grantee@example.invalid', 'Synthetic Grantee');
    grantShare(t.db, t.clock, { ownerUserId: t.userIds.employee, granteeEmail: 'grantee@example.invalid', items: { timesheets: 'edit', otRead: false, pdfDownload: false } });
    const shared = await t.request('PUT', `/api/shared/${t.userIds.employee}/days/2026-09-01`, {
      cookie: grantee.cookie,
      body: { category: 'Sick', leave_minutes: 0, wfh: false, notes: '', expected_version: entry.version, reason: 'Synthetic edit' },
    });
    expect(shared.status).toBe(409);
    expect(shared.body.error.code).toBe('imported_period');

    const { edits, ...counts } = before;
    expect(rowCounts()).toEqual(counts);
    expect(count(EDIT_AUDITS, t.userIds.employee)).toBe(edits);
    expect(count("SELECT count(*) FROM ot_ledger WHERE user_id = ? AND work_date BETWEEN '2026-08-31' AND '2026-09-13'", t.userIds.employee)).toBe(0);
    // Another period stays editable.
    const other = await t.request('PUT', '/api/days/2026-08-18', { cookie: owner, body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '', reason: 'Synthetic edit' } });
    expect(other.status, JSON.stringify(other.body)).toBe(200);
  });

  it('red-first: the timesheet read exposes imported_unverified as a boolean only (WP4-T11)', async () => {
    const before = await t.request('GET', `/api/timesheets/${PB}`, { cookie: owner });
    expect(before.body.timesheet).toEqual({ id: null, version: 0, finalized: false, imported_unverified: false });

    await importPeriods([{ payrollDate: PB }]);
    const imported = await t.request('GET', `/api/timesheets/${PB}`, { cookie: owner });
    expect(imported.status).toBe(200);
    expect(Object.keys(imported.body.timesheet).sort()).toEqual(['finalized', 'id', 'imported_unverified', 'version']);
    expect(imported.body.timesheet.imported_unverified).toBe(true);
    expect(imported.body.timesheet.finalized).toBe(false);

    // Another period of the same owner, and the same period of another user, are not imported.
    const other = await t.request('GET', `/api/timesheets/${PA}`, { cookie: owner });
    expect(other.body.timesheet.imported_unverified).toBe(false);
    const stranger = await account('stranger@example.invalid', 'Synthetic Stranger');
    const theirs = await t.request('GET', `/api/timesheets/${PB}`, { cookie: stranger.cookie });
    expect(theirs.body.timesheet.imported_unverified).toBe(false);
  });
});

describe('upload validation', () => {
  it('red-first: refuses oversized, macro-bearing and entity-bearing uploads and stores nothing', async () => {
    const small = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null }, { dataDir, importMaxBytes: 1024 });
    const bytes = workbook([{ payrollDate: PB }]);
    const tooLarge = await raw('POST', '/api/imports', { cookie: owner, bytes, contentType: XLSX_MEDIA_TYPE, target: small });
    expect(tooLarge.status).toBe(413);
    expect(tooLarge.body.error.code).toBe('payload_too_large');
    const overDefault = await upload(new Uint8Array(8 * 1024 * 1024 + 1));
    expect(overDefault.status).toBe(413);

    const macroType = await upload(bytes, owner, MACRO_TYPE);
    expect(macroType.status).toBe(415);
    const macro = await upload(withEntry(bytes, 'xl/vbaProject.bin', new Uint8Array([1, 2, 3, 4])));
    expect(macro.status).toBe(422);
    expect(macro.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'macro_content' } });
    const entity = await upload(
      withText(bytes, 'xl/workbook.xml', (text) => (text ?? '').replace('?>', '?><!DOCTYPE workbook [<!ENTITY x "synthetic">]>')),
    );
    expect(entity.status).toBe(422);
    expect(entity.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'doctype_forbidden' } });
    const json = await t.request('POST', '/api/imports', { cookie: owner, body: { workbook: 'synthetic' } });
    expect(json.status).toBe(415);
    expect((await raw('POST', '/api/imports', { bytes, contentType: XLSX_MEDIA_TYPE })).status).toBe(401);
    expect((await raw('POST', '/api/imports', { cookie: owner, bytes, contentType: XLSX_MEDIA_TYPE, origin: null })).status).toBe(403);
    expect((await upload(new Uint8Array(0))).status).toBe(422);

    expect(count('SELECT count(*) FROM imports')).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('red-first (WP4-B-01, B-02): a small upload that would cost seconds or crash the mapping is a typed 422 and stores nothing', async () => {
    const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const head = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData><row r="1">`;
    const sheet = (fragment: string, size: number) => head + fragment.repeat(Math.floor((size - head.length) / fragment.length)) + '</row></sheetData></worksheet>';
    const parts = ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml'];
    const base = readTemplateBytes();
    let hostile = base;
    for (const part of parts) hostile = withEntry(hostile, part, new TextEncoder().encode(sheet('<c/>', 15.8 * 1024 * 1024)));
    expect(hostile.length).toBeLessThan(100 * 1024);
    const started = performance.now();
    const oversized = await upload(hostile);
    expect(oversized.status).toBe(422);
    expect(oversized.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'part_too_large' } });
    expect(performance.now() - started).toBeLessThan(5000); // 8.8 s and a blocked event loop before the fix

    // 150 000 Holiday Dates cells: a 422, never the 500 of the stack overflow.
    const holidays = withEntry(base, 'xl/worksheets/sheet2.xml', new TextEncoder().encode(sheet('<c r="C1"/>', 2 * 1024 * 1024)));
    const crowded = await upload(holidays);
    expect(crowded.status).toBe(422);
    expect(crowded.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'too_many_cells' } });
    expect(count('SELECT count(*) FROM imports')).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('red-first (RB-01, recheck r2): tags of any name shape and megabytes of cell text are a typed 422 or a bounded report, never a 500', async () => {
    const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const head = `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData><row r="1">`;
    const tail = '</row></sheetData></worksheet>';
    const near = 4 * 1024 * 1024 - 6 * 1024;
    const encode = (text: string) => new TextEncoder().encode(text);
    const base = readTemplateBytes();

    // r2 H2a: parts of digit-led tags (a 201 after 3.2 s, with /api/health blocked for 2.9 s, before).
    let digits = base;
    for (const part of ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml']) {
      digits = withEntry(digits, part, encode(head + '<1/>'.repeat(Math.floor((near - head.length - tail.length) / 4)) + tail));
    }
    const started = performance.now();
    const refused = await upload(digits);
    expect(refused.status).toBe(422);
    expect(refused.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'malformed_xml' } });
    expect(performance.now() - started).toBeLessThan(5000);

    // A long sheet name would be copied into every source of the report (a megabyte of name: a 124 MiB response before).
    const sheetName = PB.replace(/-/g, '.');
    for (const [padding, reason] of [[10_000, 'sheet_name_too_long'], [1024 * 1024, 'tag_too_large']] as const) {
      const named = withText(workbook([{ payrollDate: PB }]), 'xl/workbook.xml', (xml) => (xml ?? '').replace(`name="${sheetName}"`, `name="${sheetName}${' '.repeat(padding)}"`));
      const longName = await upload(named);
      expect(longName.status, reason).toBe(422);
      expect(longName.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason } });
    }
    expect(count('SELECT count(*) FROM imports')).toBe(0);
    expect(storedFiles()).toEqual([]);

    // r2 H5d and H5b: one shared string of 1 MiB used as 100 holiday names (a 99.8 MiB report before) and of 4 MiB used
    // as 2 000 holiday names (a RangeError and a 500 internal_error after 5 s before): both preview with a small report.
    const holidaySheet = (rows: number) => {
      const out: string[] = [];
      for (let row = 2; row < 2 + rows; row += 1) out.push(`<row r="${row}"><c r="A${row}"><v>${46_023 + row}</v></c><c r="B${row}" t="s"><v>66</v></c></row>`);
      return `<?xml version="1.0"?><worksheet xmlns="${NS}"><sheetData>${out.join('')}</sheetData></worksheet>`;
    };
    for (const [size, rows] of [[1024 * 1024, 100], [near, 2000]] as const) {
      const withString = withText(base, 'xl/sharedStrings.xml', (sst) => (sst ?? '').replace('</sst>', `<si><t>${'a'.repeat(size - (sst ?? '').length - 40)}</t></si></sst>`));
      const response = await upload(withText(withString, 'xl/worksheets/sheet2.xml', () => holidaySheet(rows)));
      expect(response.status, `${rows} holiday names`).toBe(201);
      const holidays = response.body.import.report.holidays as Array<{ name: string; truncated?: boolean }>;
      expect(holidays).toHaveLength(rows);
      expect(holidays[0]?.name).toHaveLength(200);
      expect(holidays[0]?.truncated).toBe(true);
      const stored = Number(t.db.prepare('SELECT length(report_json) FROM imports WHERE id = ?').pluck().get(response.body.import.id));
      expect(stored, `${rows} holiday names`).toBeLessThan(1024 * 1024);
    }
  });

  it('red-first (RB-01): a report over the size cap is a typed 422 and stores nothing', () => {
    const user: SessionUser = { id: t.userIds.employee, email: 'employee@example.invalid', displayName: 'Synthetic Employee', role: 'employee', calendarId: t.calendarId, sessionId: 'test' };
    const bytes = workbook([{ payrollDate: PB }]);
    let caught: unknown = null;
    try {
      previewImport({ db: t.db, clock: t.clock, files, user }, bytes, { maxReportBytes: 4 * 1024 });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({ status: 422, code: 'workbook_rejected', details: { reason: 'report_too_large' } });
    expect(count('SELECT count(*) FROM imports')).toBe(0);
    expect(storedFiles()).toEqual([]);
    // The same workbook under the default cap is an ordinary preview.
    expect(previewImport({ db: t.db, clock: t.clock, files, user }, bytes).created).toBe(true);
  });

  it('red-first (RB-01, R-RB1): a failure while the report is serialized is a typed 422, never a 500', async () => {
    const stringify = JSON.stringify;
    const failures = [
      [new RangeError('Invalid string length'), 'report_too_large'],
      [new TypeError('Synthetic failure'), 'report_failed'],
    ] as const;
    for (const [failure, reason] of failures) {
      const failing = vi.spyOn(JSON, 'stringify').mockImplementation((value: unknown, ...rest: unknown[]) => {
        if (value !== null && typeof value === 'object' && 'rules' in value && 'plan' in value) throw failure;
        return stringify(value, ...(rest as [undefined, undefined]));
      });
      let response: RawResponse;
      try {
        response = await upload(workbook([{ payrollDate: PB }]));
      } finally {
        failing.mockRestore();
      }
      expect(response.status, reason).toBe(422);
      expect(response.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason } });
    }
    // A failure inside the mapping itself (simulated on one cell's text) is a refusal too, never a 500.
    const marker = 'RB01 failure marker';
    const trim = String.prototype.trim;
    const failingTrim = vi.spyOn(String.prototype, 'trim').mockImplementation(function (this: string): string {
      if (this.startsWith(marker)) throw new RangeError('Maximum call stack size exceeded');
      return trim.call(this);
    });
    let mapped: RawResponse;
    try {
      mapped = await upload(workbook([{ payrollDate: PB, employee: marker }]));
    } finally {
      failingTrim.mockRestore();
    }
    expect(mapped.status).toBe(422);
    expect(mapped.body.error).toMatchObject({ code: 'workbook_rejected', details: { reason: 'report_failed' } });
    expect(count('SELECT count(*) FROM imports')).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('keeps the global 64 KiB JSON limit for every other route, including the commit', async () => {
    const big = { decisions: [], padding: 'x'.repeat(70 * 1024) };
    const response = await t.request('POST', `/api/imports/${randomUUID()}/commit`, { cookie: owner, body: big });
    expect(response.status).toBe(413);
  });

  it('keeps the stored source through the orphan sweep', async () => {
    const preview = await upload(workbook([{ payrollDate: PB }]));
    const key = (t.db.prepare('SELECT storage_key FROM imports WHERE id = ?').get(preview.body.import.id) as { storage_key: string }).storage_key;
    const old = new Date(t.clock.now().getTime() - 30 * 86_400_000);
    utimesSync(files.pathOf(key), old, old);
    const summary = await runJobsOnce({
      db: t.db,
      clock: t.clock,
      owner: 'runner-import-sweep',
      handlers: { [JOB_ORPHAN_SWEEP]: createSweepJobHandler({ db: t.db, clock: t.clock, files }) },
    });
    expect(summary).toMatchObject({ claimed: 1, succeeded: 1 });
    expect(existsSync(files.pathOf(key))).toBe(true);
  });
});

/* ------------------------------------------------------------------ concurrency ---- */

const DB_MODULE = pathToFileURL(fileURLToPath(new URL('../../src/server/db/database.ts', import.meta.url))).href;
const SERVICE_MODULE = pathToFileURL(fileURLToPath(new URL('../../src/server/services/workbookImport.ts', import.meta.url))).href;

/*
 * Each racer is a worker thread with its OWN connection to the same WAL database file (better-sqlite3 is synchronous,
 * so two calls on one connection would serialize trivially). A shared barrier releases them together.
 */
const RACER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
(async () => {
  const { openDatabase } = await import(workerData.dbModule);
  const { commitImport } = await import(workerData.serviceModule);
  const db = openDatabase(workerData.dbPath);
  const row = db.prepare('SELECT id, email, display_name, role, calendar_id FROM users WHERE id = ?').get(workerData.userId);
  const user = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'racer' };
  const flags = new Int32Array(workerData.control);
  Atomics.add(flags, 1, 1);
  Atomics.notify(flags, 1);
  Atomics.wait(flags, 0, 0, 10000);
  try {
    const outcome = commitImport({ db, clock: { now: () => new Date(workerData.now) }, user }, workerData.importId, []);
    parentPort.postMessage({ status: outcome.status, result: outcome.batch.result });
  } catch (error) {
    parentPort.postMessage({ error: String(error && error.code ? error.code : error) });
  } finally {
    db.close();
  }
})();
`;

async function raceCommits(importId: string, racers: number): Promise<Array<{ status?: string; result?: unknown; error?: string }>> {
  const control = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
  const flags = new Int32Array(control);
  const workers = Array.from(
    { length: racers },
    () =>
      new Worker(RACER_SOURCE, {
        eval: true,
        workerData: { dbModule: DB_MODULE, serviceModule: SERVICE_MODULE, dbPath: t.config.databasePath, userId: t.userIds.employee, importId, now: NOW, control },
      }),
  );
  try {
    const results = workers.map(
      (worker) =>
        new Promise<{ status?: string; result?: unknown; error?: string }>((resolve, reject) => {
          worker.once('message', resolve);
          worker.once('error', reject);
        }),
    );
    const deadline = Date.now() + 20_000;
    while (Atomics.load(flags, 1) < racers) {
      if (Date.now() > deadline) throw new Error('racers did not get ready');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    Atomics.store(flags, 0, 1);
    Atomics.notify(flags, 0);
    return await Promise.all(results);
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
}

/* ------------------------------------------------------------------ automation ---- */

describe('imported periods are never automated (F-2, docs/05 imported history)', () => {
  const EARLY = '2026-09-20T12:00:00Z';
  const P1 = '2026-10-02'; // 2026-09-14 .. 2026-09-27, due 2026-09-30 17:00 local
  const P2 = '2026-10-16'; // 2026-09-28 .. 2026-10-11, the control period
  let a: TestContext;

  beforeEach(async () => {
    a = await createTestContext(EARLY);
    a.db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)').run('deactivated', a.userIds.admin, a.userIds.employee);
  });
  afterEach(() => a.close());

  it('red-first: no reminder, overdue record, deadline finalization or send across simulated deadlines', async () => {
    const dir = join(dirname(a.config.databasePath), 'private-data');
    const store = new FileStore(dir);
    const id = randomUUID();
    a.db
      .prepare(
        `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
         VALUES (?, ?, 'Synthetic Employee', 'employee', 'active', 'login-disabled-synthetic', ?, ?, ?)`,
      )
      .run(id, `user-${id}@example.invalid`, a.calendarId, EARLY, EARLY);
    createPolicyVersion(
      a.db,
      a.clock,
      {
        userId: id,
        calendarId: a.calendarId,
        effectiveFrom: '2026-01-01',
        note: 'Synthetic import policy',
        rules: { requiredMinutes: 480, thresholdMinutes: 30, roundingStepMinutes: 30, referenceStart: '08:00', referenceEnd: '16:00', deficitMode: 'ignore', breaks: [] },
      },
      id,
    );
    const user: SessionUser = { id, email: `user-${id}@example.invalid`, displayName: 'Synthetic Employee', role: 'employee', calendarId: a.calendarId, sessionId: 'test' };
    saveSubmissionSettings(a.db, a.clock, id, { expectedSeq: 0, to: ['payroll@example.invalid'], autoSubmit: true });
    setAutomationActivation(a.db, a.clock, { actorUserId: a.userIds.admin, activeFrom: '2026-09-21T00:00:00Z', reason: 'Synthetic pilot activation' });

    // R3 (WP4-FIXB): a period is imported only once its payroll due instant has passed (before that it is skip-only).
    // So the owner imports P1 one minute after its deadline and records work in the control period P2.
    const schedule = getCalendar(a.db, a.calendarId).schedule;
    const due = (payroll: string) => payPeriodForPayrollDate(schedule, payroll, []).dueAtUtc;
    a.clock.set(formatUtcInstant(due(P1) + 60));
    const preview = previewImport({ db: a.db, clock: a.clock, files: store, user }, buildSyntheticWorkbook({ periods: [{ payrollDate: P1 }] }));
    expect(preview.batch.plan?.decisions_required).toEqual([]);
    const committed = commitImport({ db: a.db, clock: a.clock, user }, preview.batch.id, []);
    expect(committed.batch.result?.periods.map((period) => period.payroll_date)).toEqual([P1]);
    createSession({ db: a.db, clock: a.clock, user }, '2026-09-28', { start: la('2026-09-28T08:00'), end: la('2026-09-28T12:00'), input_zone: LA, breaks: [], breaks_confirmed: true });

    const handlers = createJobHandlers({
      db: a.db,
      clock: a.clock,
      files: store,
      delivery: loadDeliveryConfig({ DATA_DIR: dir, MAIL_FROM: 'timesheet@example.invalid' }, { databasePath: a.config.databasePath, port: 3000, production: false }),
    });
    const instants = [due(P1) + 60, due(P1) + 3600, due(P1) + 26 * 3600, due(P2) - 23 * 3600, due(P2) - 3600, due(P2) + 60, due(P2) + 3600];
    for (const instant of instants) {
      a.clock.set(formatUtcInstant(instant));
      runReminderScan(a.db, a.clock);
      runDeadlineScan(a.db, a.clock);
      for (let pass = 0; pass < 3; pass += 1) {
        await runJobsOnce({ db: a.db, clock: a.clock, owner: 'runner-import', handlers });
        a.clock.advanceSeconds(120);
      }
    }

    const p1 = a.db
      .prepare(
        `SELECT t.id, t.imported_unverified, t.finalized_revision_no, t.version, p.id AS pay_period_id
           FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id WHERE t.user_id = ? AND p.payroll_date = ?`,
      )
      .get(id, P1) as { id: string; imported_unverified: number; finalized_revision_no: number | null; version: number; pay_period_id: string };
    expect(p1).toMatchObject({ imported_unverified: 1, finalized_revision_no: null, version: 1 });
    expect(a.db.prepare('SELECT count(*) FROM timesheet_revisions WHERE timesheet_id = ?').pluck().get(p1.id)).toBe(0);
    expect(a.db.prepare('SELECT count(*) FROM reminder_occurrences WHERE user_id = ? AND pay_period_id = ?').pluck().get(id, p1.pay_period_id)).toBe(0);
    expect(listOverdueRecords(a.db, id).filter((record) => JSON.stringify(record).includes(P1))).toEqual([]);
    expect(a.db.prepare("SELECT count(*) FROM audit_events WHERE owner_user_id = ? AND operation LIKE 'deadline.%' AND (after_json LIKE ? OR entity_id = ?)").pluck().get(id, `%${P1}%`, p1.id)).toBe(0);
    expect(a.db.prepare("SELECT count(*) FROM ot_ledger WHERE user_id = ? AND work_date BETWEEN '2026-09-14' AND '2026-09-27'").pluck().get(id)).toBe(0);

    // The control period P2 was automated by the same scans and runner, so the scans really ran.
    const p2 = a.db
      .prepare('SELECT t.finalized_revision_no FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id WHERE t.user_id = ? AND p.payroll_date = ?')
      .get(id, P2) as { finalized_revision_no: number | null };
    expect(p2.finalized_revision_no).toBe(1);
    expect(a.db.prepare('SELECT count(*) FROM reminder_occurrences WHERE user_id = ?').pluck().get(id)).toBeGreaterThan(0);
    // Every revision, job and delivery attempt of the user belongs to P2, none to P1.
    const revisionTimesheets = a.db.prepare('SELECT DISTINCT timesheet_id FROM timesheet_revisions WHERE user_id = ?').pluck().all(id);
    expect(revisionTimesheets).not.toContain(p1.id);
    expect(revisionTimesheets).toHaveLength(1);
    const attempts = a.db.prepare('SELECT count(*) FROM delivery_attempts d JOIN timesheet_revisions r ON r.id = d.revision_id WHERE r.timesheet_id = ?').pluck().get(p1.id);
    expect(attempts).toBe(0);
  });
});
