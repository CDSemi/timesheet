import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import type { Clock } from '../../src/server/clock.ts';
import type { AppConfig } from '../../src/server/config.ts';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { migrate } from '../../src/server/db/migrations.ts';
import { seedSynthetic } from '../../src/server/seed.ts';

export const ORIGIN = 'http://localhost:3000';
export const LA = 'America/Los_Angeles';

/** Deterministic clock for tests. */
export class MutableClock implements Clock {
  private current: Date;

  constructor(iso: string) {
    this.current = new Date(iso);
  }

  now(): Date {
    return new Date(this.current.getTime());
  }

  set(iso: string): void {
    this.current = new Date(iso);
  }

  advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}

export type Who = 'admin' | 'employee';

export interface ApiResponse {
  status: number;
  // Tests inspect arbitrary JSON; the API contract is asserted field by field.
  body: any;
  headers: Headers;
}

export interface RequestOptions {
  cookie?: string;
  body?: unknown;
  origin?: string | null;
  headers?: Record<string, string>;
}

export interface TestContext {
  db: Db;
  clock: MutableClock;
  config: AppConfig;
  userIds: Record<Who, string>;
  emails: Record<Who, string>;
  calendarId: string;
  request(method: string, path: string, options?: RequestOptions): Promise<ApiResponse>;
  loginResponse(who: Who): Promise<ApiResponse>;
  login(who: Who): Promise<string>;
  close(): void;
}

/** Fresh temporary SQLite file, fresh migrations, synthetic seed and an in-process app. */
export async function createTestContext(
  nowIso = '2026-09-29T20:00:00Z',
  overrides: Partial<AppConfig> = {},
): Promise<TestContext> {
  const dir = mkdtempSync(join(tmpdir(), 'timesheet-test-'));
  const db = openDatabase(join(dir, 'test.db'));
  migrate(db);
  const clock = new MutableClock(nowIso);
  // Synthetic per-run passwords; never real credentials.
  const passwords: Record<Who, string> = {
    admin: randomBytes(18).toString('base64url'),
    employee: randomBytes(18).toString('base64url'),
  };
  const seed = await seedSynthetic(db, clock, { passwords });
  const byRole = (role: Who) => {
    const user = seed.users.find((item) => item.role === role);
    if (user === undefined) throw new Error(`Seed user ${role} missing`);
    return user;
  };
  const config: AppConfig = {
    host: '127.0.0.1',
    port: 3000,
    databasePath: join(dir, 'test.db'),
    allowedOrigins: [ORIGIN],
    cookieSecure: false,
    sessionTtlSeconds: 12 * 3600,
    production: false,
    ...overrides,
  };
  const app = createApp({ db, clock, config, loginLimiter: new LoginRateLimiter(), staticDir: null });

  async function request(method: string, path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    const headers: Record<string, string> = { ...options.headers };
    const origin = options.origin === undefined ? ORIGIN : options.origin;
    if (origin !== null) headers.origin = origin;
    if (options.cookie !== undefined) headers.cookie = options.cookie;
    const init: RequestInit = { method, headers };
    if (options.body !== undefined) {
      headers['content-type'] ??= 'application/json';
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
    const response = await app.request(path, init);
    const text = await response.text();
    let body: unknown = null;
    if (text !== '') {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: response.status, body, headers: response.headers };
  }

  function loginResponse(who: Who): Promise<ApiResponse> {
    return request('POST', '/api/auth/login', { body: { email: byRole(who).email, password: passwords[who] } });
  }

  async function login(who: Who): Promise<string> {
    const response = await loginResponse(who);
    if (response.status !== 200) throw new Error(`Login failed for ${who}: ${JSON.stringify(response.body)}`);
    const cookie = response.headers.get('set-cookie')?.split(';')[0];
    if (cookie === undefined) throw new Error('No session cookie');
    return cookie;
  }

  return {
    db,
    clock,
    config,
    userIds: { admin: byRole('admin').id, employee: byRole('employee').id },
    emails: { admin: byRole('admin').email, employee: byRole('employee').email },
    calendarId: seed.calendarId ?? '',
    request,
    loginResponse,
    login,
    close() {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Local wall-clock input in the reporting zone. */
export function la(local: string, fold?: 0 | 1) {
  return fold === undefined ? { local, zone: LA } : { local, zone: LA, fold };
}

export const DEFAULT_BREAKS_0900 = [
  { start: la('2026-09-21T11:00'), end: la('2026-09-21T11:15'), counts_as_work: false },
  { start: la('2026-09-21T13:00'), end: la('2026-09-21T13:30'), counts_as_work: false },
  { start: la('2026-09-21T15:30'), end: la('2026-09-21T15:45'), counts_as_work: false },
];
