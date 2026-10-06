import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * The built client is served from the same origin (WP4-A-01). A missing asset, a source map above all, must answer 404 and
 * never fall through to the single-page fallback, which would answer 200 with index.html for any path. Synthetic files only.
 */
describe('static client assets', () => {
  let t: TestContext;
  let scratch: string;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    t = await createTestContext();
    scratch = mkdtempSync(join(tmpdir(), 'timesheet-static-'));
    const staticDir = join(scratch, 'client');
    mkdirSync(join(staticDir, 'assets'), { recursive: true });
    writeFileSync(join(staticDir, 'index.html'), '<!doctype html><title>synthetic</title>');
    writeFileSync(join(staticDir, 'assets', 'index-abc123.js'), 'console.log("synthetic");\n');
    const dataDir = join(scratch, 'private-data');
    mkdirSync(dataDir);
    app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir }, { dataDir });
  });

  afterAll(() => {
    t.close();
    rmSync(scratch, { recursive: true, force: true });
  });

  it('serves a real asset and the single-page fallback for a client route', async () => {
    const asset = await app.request('/assets/index-abc123.js');
    expect(asset.status).toBe(200);
    expect(await asset.text()).toContain('synthetic');
    const route = await app.request('/timesheet/2026-03-06');
    expect(route.status).toBe(200);
    expect(await route.text()).toContain('<title>synthetic</title>');
  });

  it('answers 404 for a source map and for any other missing asset, never the fallback page', async () => {
    for (const path of ['/assets/index-abc123.js.map', '/assets/missing.css', '/assets/nested/other.js.map']) {
      const response = await app.request(path);
      const text = await response.text();
      expect(response.status, path).toBe(404);
      expect(text.includes('<title>'), path).toBe(false);
      expect(JSON.parse(text), path).toMatchObject({ error: { code: 'not_found' } });
    }
  });
});
