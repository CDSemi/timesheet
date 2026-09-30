import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { openDatabase } from '../../src/server/db/database.ts';
import { migrate } from '../../src/server/db/migrations.ts';
import { MutableClock } from '../support/testApp.ts';

/*
 * The built client is served from a private directory; private files next to it (the
 * database, signatures later) must never be reachable, including via encoded or
 * Windows-style traversal.
 */

let root: string;
let app: ReturnType<typeof createApp>;
let closeDb: () => void;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'timesheet-static-'));
  const clientDir = join(root, 'client');
  mkdirSync(clientDir);
  writeFileSync(join(clientDir, 'index.html'), '<!doctype html><div id="root"></div>');
  writeFileSync(join(root, 'private-secret.txt'), 'PRIVATE-DATA');
  const db = openDatabase(join(root, 'app.db'));
  migrate(db);
  closeDb = () => db.close();
  app = createApp({
    db,
    clock: new MutableClock('2026-09-29T20:00:00Z'),
    loginLimiter: new LoginRateLimiter(),
    staticDir: clientDir,
    config: {
      host: '127.0.0.1',
      port: 3000,
      databasePath: join(root, 'app.db'),
      allowedOrigins: ['http://localhost:3000'],
      cookieSecure: false,
      sessionTtlSeconds: 3600,
      production: false,
    },
  });
});

afterAll(() => {
  closeDb();
  rmSync(root, { recursive: true, force: true });
});

describe('static client serving', () => {
  it('serves index.html for the root and for client-side routes', async () => {
    for (const path of ['/', '/timesheet/2026-10-02']) {
      const response = await app.request(path);
      expect(response.status, path).toBe(200);
      expect(await response.text()).toContain('<div id="root">');
    }
  });

  it('never exposes files outside the client directory', async () => {
    const attempts = [
      '/../private-secret.txt',
      '/%2e%2e/private-secret.txt',
      '/..%2fprivate-secret.txt',
      '/..%5cprivate-secret.txt',
      '/%2e%2e%5cprivate-secret.txt',
      '/..\\private-secret.txt',
      '/../app.db',
      '/%2e%2e/app.db',
    ];
    for (const path of attempts) {
      const response = await app.request(path);
      const body = await response.text();
      expect(body, path).not.toContain('PRIVATE-DATA');
      expect(body, path).not.toContain('SQLite format');
    }
  });

  it('keeps unknown API paths out of the SPA fallback', async () => {
    const response = await app.request('/api/unknown');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: 'not_found', message: 'Endpoint not found' } });
  });
});

describe('login limiter memory', () => {
  it('forgets expired windows once many keys are tracked', () => {
    const limiter = new LoginRateLimiter();
    for (let index = 0; index < 1200; index += 1) limiter.recordFailure(`10.0.${index}`, `user${index}`, 0);
    expect(limiter.trackedKeys).toBe(2400);
    limiter.recordFailure('10.9.9.9', 'late', 16 * 60);
    expect(limiter.trackedKeys).toBe(2);
  });
});
