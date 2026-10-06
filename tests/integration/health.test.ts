import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { MIGRATIONS } from '../../src/server/db/migrations.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

const EXPECTED_VERSION = MIGRATIONS.at(-1)?.version ?? 0;
const READY_KEYS = ['data_dir_writable', 'schema', 'status'];

let t: TestContext;
let scratch: string;
let dataDir: string;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  t = await createTestContext();
  scratch = mkdtempSync(join(tmpdir(), 'timesheet-health-'));
  dataDir = join(scratch, 'private-data');
  mkdirSync(dataDir);
  app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null }, { dataDir });
});

afterEach(() => {
  t.close();
  rmSync(scratch, { recursive: true, force: true });
});

async function ready(): Promise<{ status: number; text: string; body: any }> {
  const response = await app.request('/api/ready');
  const text = await response.text();
  return { status: response.status, text, body: JSON.parse(text) };
}

describe('liveness and readiness (AC-15, docs/03 hosting boundary)', () => {
  it('keeps /api/health as a liveness check with no readiness detail', async () => {
    const response = await app.request('/api/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('reports ready with exactly the allowlisted keys, without a login', async () => {
    const result = await ready();
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      status: 'ready',
      schema: { expected: EXPECTED_VERSION, actual: EXPECTED_VERSION },
      data_dir_writable: true,
    });
    expect(Object.keys(result.body).sort()).toEqual(READY_KEYS);
    expect(Object.keys(result.body.schema).sort()).toEqual(['actual', 'expected']);
    expect(Number.isInteger(result.body.schema.expected)).toBe(true);
  });

  it('reveals no path, name, address or count of people, ready or not', async () => {
    const forbidden = [dataDir, scratch, tmpdir(), t.config.databasePath, t.emails.employee, t.emails.admin, 'Example Employee', 'private-data'];
    const good = await ready();
    t.db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(EXPECTED_VERSION);
    const bad = await ready();
    for (const text of [good.text, bad.text]) {
      for (const value of forbidden) expect(text).not.toContain(value);
      expect(Object.keys(JSON.parse(text)).sort()).toEqual(READY_KEYS);
    }
  });

  it('answers 503 when the schema is behind or newer than this build', async () => {
    t.db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(EXPECTED_VERSION);
    const behind = await ready();
    expect(behind.status).toBe(503);
    expect(behind.body).toEqual({
      status: 'not_ready',
      schema: { expected: EXPECTED_VERSION, actual: EXPECTED_VERSION - 1 },
      data_dir_writable: true,
    });
    t.db.prepare("INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, 'future', 'x', '2026-01-01T00:00:00Z')").run(
      EXPECTED_VERSION + 1,
    );
    const newer = await ready();
    expect(newer.status).toBe(503);
    expect(newer.body.schema).toEqual({ expected: EXPECTED_VERSION, actual: EXPECTED_VERSION + 1 });
  });

  it('answers 503 when the data directory is missing or is not a directory', async () => {
    rmSync(dataDir, { recursive: true, force: true });
    const missing = await ready();
    expect(missing.status).toBe(503);
    expect(missing.body.status).toBe('not_ready');
    expect(missing.body.data_dir_writable).toBe(false);
    expect(missing.body.schema).toEqual({ expected: EXPECTED_VERSION, actual: EXPECTED_VERSION });
    writeFileSync(dataDir, 'not a directory');
    const file = await ready();
    expect(file.status).toBe(503);
    expect(file.body.data_dir_writable).toBe(false);
  });

  it('reads nothing personal and writes nothing', async () => {
    const changesBefore = t.db.prepare('SELECT total_changes()').pluck().get();
    const auditBefore = t.db.prepare('SELECT COUNT(*) FROM audit_events').pluck().get();
    const filesBefore = readdirSync(dataDir);
    expect((await ready()).status).toBe(200);
    expect((await ready()).status).toBe(200);
    expect(t.db.prepare('SELECT total_changes()').pluck().get()).toBe(changesBefore);
    expect(t.db.prepare('SELECT COUNT(*) FROM audit_events').pluck().get()).toBe(auditBefore);
    expect(readdirSync(dataDir)).toEqual(filesBefore);
  });

  it('is served private (no-store) like every API response', async () => {
    const response = await app.request('/api/ready');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
