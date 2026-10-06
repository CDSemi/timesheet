import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import type { AppConfig } from '../../src/server/config.ts';
import { type Db, openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate } from '../../src/server/db/migrations.ts';
import {
  applyBootstrapConfig,
  parseBootstrapConfig,
  issueSetupToken,
  SETUP_TOKEN_TTL_SECONDS,
} from '../../src/server/services/bootstrap.ts';
import { createUser } from '../../src/server/services/users.ts';
import { MutableClock } from '../support/testApp.ts';

/*
 * WP4-T03: production bootstrap (docs/07 "Initial deployment"). The owner supplies a calendar, policy and
 * payroll file; the CLI creates the company calendar once and prints one setup token; POST /api/auth/bootstrap
 * turns that token into the first administrator, once, and is then refused for good. All data are synthetic.
 */

const ORIGIN = 'http://localhost:3000';
const NOW = '2026-10-05T18:00:00Z';
const PASSWORD = 'synthetic-setup-pass-1';
const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

/** An owner file for the CLI: the shape of reference/examples (calendar, policy, payroll, holidays) and no person. */
const OWNER_FILE = {
  schema_version: 1,
  calendar: {
    name: 'Synthetic company calendar',
    reporting_zone: 'America/Los_Angeles',
    normal_weekdays_iso: [1, 2, 3, 4, 5],
    effective_from: '2026-01-01',
  },
  holidays: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-12-25', name: 'Christmas Day' },
  ],
  policy: {
    effective_from: '2026-01-01',
    required_minutes: 480,
    threshold_minutes: 30,
    rounding_step_minutes: 30,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: [
      { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
      { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
      { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
    ],
    deficit_mode: 'ignore',
  },
  payroll: {
    anchor_payroll_date: '2026-10-02',
    cycle_days: 14,
    period_start_offset_days: -18,
    period_end_offset_days: -5,
    due_offset_days: -3,
    due_local_time: '17:00',
  },
};

interface Reply {
  status: number;
  text: string;
  body: any;
  headers: Headers;
}

let dir: string;
let db: Db;
let clock: MutableClock;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'timesheet-bootstrap-'));
  db = openDatabase(join(dir, 'bootstrap.db'));
  migrate(db);
  clock = new MutableClock(NOW);
  const config: AppConfig = {
    host: '127.0.0.1',
    port: 3000,
    databasePath: join(dir, 'bootstrap.db'),
    allowedOrigins: [ORIGIN],
    cookieSecure: false,
    sessionTtlSeconds: 12 * 3600,
    production: false,
  };
  app = createApp({ db, clock, config, loginLimiter: new LoginRateLimiter(), staticDir: null }, { dataDir: join(dir, 'private-data') });
});

afterEach(() => {
  vi.restoreAllMocks();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

async function call(method: string, path: string, body?: unknown): Promise<Reply> {
  const headers: Record<string, string> = { origin: ORIGIN };
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const response = await app.request(path, init);
  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  return { status: response.status, text, body: parsed, headers: response.headers };
}

/** The instance as the CLI leaves it: calendar and default policy configured, one fresh setup token issued. */
function configure(): string {
  applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE));
  return issueSetupToken(db, clock).token;
}

const setupBody = (token: string, overrides: Record<string, unknown> = {}) => ({
  token,
  email: 'first.admin@example.invalid',
  display_name: 'Synthetic First Admin',
  password: PASSWORD,
  ...overrides,
});

const count = (table: string): number => db.prepare(`SELECT count(*) FROM ${table}`).pluck().get() as number;

/** Every stored value of every table, as one string: the place a raw token must never be found. */
function wholeDatabaseText(): string {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").pluck().all() as string[];
  return tables.map((name) => JSON.stringify(db.prepare(`SELECT * FROM ${name}`).all())).join('\n');
}

describe('company configuration (the owner file)', () => {
  it('creates the company calendar, its version with the holidays, and keeps the default policy, once', () => {
    const result = applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE));
    expect(count('calendars')).toBe(1);
    expect(db.prepare('SELECT name, reporting_zone, payroll_anchor_date, cycle_days FROM calendars').get()).toEqual({
      name: 'Synthetic company calendar',
      reporting_zone: 'America/Los_Angeles',
      payroll_anchor_date: '2026-10-02',
      cycle_days: 14,
    });
    const version = db.prepare('SELECT calendar_id, seq, effective_from, weekdays, dates FROM calendar_versions').get() as any;
    expect(version).toMatchObject({ calendar_id: result.calendarId, seq: 1, effective_from: '2026-01-01', weekdays: '[1,2,3,4,5]' });
    expect(JSON.parse(version.dates)).toHaveLength(2);
    expect(count('users')).toBe(0);
    expect(count('work_policies')).toBe(0);
    const audit = db.prepare('SELECT operation, actor_user_id FROM audit_events ORDER BY occurred_at, rowid').all();
    expect(audit).toEqual(
      expect.arrayContaining([
        { operation: 'calendar.create', actor_user_id: null },
        { operation: 'calendar_version.create', actor_user_id: null },
        { operation: 'bootstrap.configure', actor_user_id: null },
      ]),
    );
  });

  it('refuses a second calendar bootstrap and leaves every table as it was', () => {
    applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE));
    const before = { calendars: count('calendars'), versions: count('calendar_versions'), audit: count('audit_events') };
    expect(() => applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE))).toThrow(/already bootstrapped/);
    expect({ calendars: count('calendars'), versions: count('calendar_versions'), audit: count('audit_events') }).toEqual(before);
  });

  it('refuses to bootstrap a database that already has a user', async () => {
    db.prepare(
      "INSERT INTO calendars (id, name, reporting_zone, payroll_anchor_date, cycle_days, period_start_offset_days, period_end_offset_days, due_offset_days, due_local_time, created_at) VALUES ('c', 'c', 'UTC', '2026-10-02', 14, -18, -5, -3, '17:00', '2026-10-05T18:00:00Z')",
    ).run();
    await createUser(db, clock, { email: 'someone@example.invalid', displayName: 'Someone', role: 'employee', password: PASSWORD, calendarId: 'c' }, null);
    expect(() => applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE))).toThrow(/already bootstrapped/);
    expect(count('calendars')).toBe(1);
    expect(count('bootstrap_state')).toBe(0);
  });

  it('rolls everything back when the file is invalid and names no value from it', () => {
    const bad = { ...OWNER_FILE, calendar: { ...OWNER_FILE.calendar, reporting_zone: 'Not/AZone' } };
    expect(() => applyBootstrapConfig(db, clock, parseBootstrapConfig(bad))).toThrow();
    expect(count('calendars')).toBe(0);
    expect(count('calendar_versions')).toBe(0);
    expect(count('audit_events')).toBe(0);
    expect(db.prepare('SELECT count(*) FROM sqlite_master WHERE name = ?').pluck().get('bootstrap_state')).toBe(1);
    expect(count('bootstrap_state')).toBe(0);
  });

  it('rejects a file with a person in it or a field it does not know', () => {
    expect(() => parseBootstrapConfig({ ...OWNER_FILE, identity: { employee_email: 'someone@example.invalid' } })).toThrow();
    expect(() => parseBootstrapConfig({ ...OWNER_FILE, payroll: { ...OWNER_FILE.payroll, surprise: 1 } })).toThrow();
    expect(() => parseBootstrapConfig({ ...OWNER_FILE, policy: { ...OWNER_FILE.policy, required_minutes: 'many' } })).toThrow();
  });
});

describe('the setup token', () => {
  it('stores only its hash, lives 60 minutes and is found nowhere in the database', () => {
    applyBootstrapConfig(db, clock, parseBootstrapConfig(OWNER_FILE));
    const issued = issueSetupToken(db, clock);
    expect(SETUP_TOKEN_TTL_SECONDS).toBe(3600);
    expect(issued.expiresAt).toBe('2026-10-05T19:00:00Z');
    const row = db.prepare('SELECT token_hash, token_issued_at, token_expires_at, token_used_at FROM bootstrap_state').get() as any;
    expect(row.token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(row.token_hash).toBe(createHash('sha256').update(issued.token.replaceAll('-', '')).digest('hex'));
    expect(row).toMatchObject({ token_issued_at: NOW, token_expires_at: '2026-10-05T19:00:00Z', token_used_at: null });
    expect(wholeDatabaseText()).not.toContain(issued.token);
    expect(wholeDatabaseText()).not.toContain(issued.token.replaceAll('-', ''));
  });

  it('issues a new token only while no administrator exists, and the new one replaces the old', async () => {
    const first = configure();
    clock.advanceSeconds(10);
    const second = issueSetupToken(db, clock).token;
    expect(second).not.toBe(first);
    expect((await call('POST', '/api/auth/bootstrap', setupBody(first))).status).toBe(403);
    expect((await call('POST', '/api/auth/bootstrap', setupBody(second))).status).toBe(201);
    expect(() => issueSetupToken(db, clock)).toThrow(/administrator/);
  });
});

describe('POST /api/auth/bootstrap', () => {
  it('creates the first administrator once, with the default policy, an audit event and no session', async () => {
    const token = configure();
    expect((await call('GET', '/api/auth/setup')).body).toEqual({ available: true });
    const response = await call('POST', '/api/auth/bootstrap', setupBody(token, { email: ' First.Admin@Example.invalid ' }));
    expect(response.status).toBe(201);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(Object.keys(response.body)).toEqual(['user']);
    expect(response.body.user).toMatchObject({ email: 'first.admin@example.invalid', display_name: 'Synthetic First Admin', role: 'admin' });
    expect(response.text).not.toMatch(/scrypt|password_hash/);
    const calendarId = db.prepare('SELECT id FROM calendars').pluck().get();
    expect(db.prepare('SELECT role, status, calendar_id FROM users').all()).toEqual([{ role: 'admin', status: 'active', calendar_id: calendarId }]);
    const policy = db.prepare('SELECT user_id, seq, effective_from, required_minutes, created_by FROM work_policies').get() as any;
    expect(policy).toMatchObject({ user_id: response.body.user.id, seq: 1, effective_from: '2026-01-01', required_minutes: 480, created_by: response.body.user.id });
    const state = db.prepare('SELECT token_hash, token_used_at, admin_user_id FROM bootstrap_state').get();
    expect(state).toEqual({ token_hash: null, token_used_at: NOW, admin_user_id: response.body.user.id });
    const event = db
      .prepare("SELECT actor_user_id, owner_user_id, entity_type, entity_id, after_json FROM audit_events WHERE operation = 'bootstrap.admin_created'")
      .get() as any;
    expect(event).toMatchObject({ actor_user_id: null, owner_user_id: response.body.user.id, entity_type: 'user', entity_id: response.body.user.id });
    expect(JSON.parse(event.after_json)).toEqual({ email: 'first.admin@example.invalid', display_name: 'Synthetic First Admin', role: 'admin', calendar_id: calendarId });
    expect((await call('GET', '/api/auth/setup')).body).toEqual({ available: false });
    const login = await call('POST', '/api/auth/login', { email: 'first.admin@example.invalid', password: PASSWORD });
    expect(login.status).toBe(200);
  });

  it('refuses an expired, a replayed and a wrong token alike and says nothing about why', async () => {
    const token = configure();
    const wrong = await call('POST', '/api/auth/bootstrap', setupBody('AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-FFFFF-GGGGG-HHHHH'));
    expect(wrong.status).toBe(403);
    // 59 minutes 59 seconds: still valid. Then the minute is over.
    clock.advanceSeconds(SETUP_TOKEN_TTL_SECONDS);
    const expired = await call('POST', '/api/auth/bootstrap', setupBody(token));
    expect(expired.status).toBe(403);
    expect(count('users')).toBe(0);
    clock.set(NOW);
    const issued = issueSetupToken(db, clock).token;
    clock.advanceSeconds(SETUP_TOKEN_TTL_SECONDS - 1);
    expect((await call('POST', '/api/auth/bootstrap', setupBody(issued))).status).toBe(201);
    const replay = await call('POST', '/api/auth/bootstrap', setupBody(issued, { email: 'second@example.invalid' }));
    expect(replay.status).toBe(403);
    expect(count('users')).toBe(1);
    // The refusals are one and the same answer: nothing tells expired, replayed, wrong or closed apart.
    expect(wrong.body).toEqual(expired.body);
    expect(wrong.body).toEqual(replay.body);
    expect(wrong.body.error.code).toBe('setup_unavailable');
    expect(JSON.stringify(wrong.body)).not.toMatch(/expire|replay|used|wrong|admin|token/i);
  });

  it('creates exactly one administrator when two requests race with the same token', async () => {
    const token = configure();
    const [a, b] = await Promise.all([
      call('POST', '/api/auth/bootstrap', setupBody(token, { email: 'first@example.invalid' })),
      call('POST', '/api/auth/bootstrap', setupBody(token, { email: 'second@example.invalid' })),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 403]);
    expect(count('users')).toBe(1);
    expect(count('work_policies')).toBe(1);
    expect(db.prepare("SELECT count(*) FROM audit_events WHERE operation = 'bootstrap.admin_created'").pluck().get()).toBe(1);
  });

  it('is refused for good once an administrator exists, even with a still valid token', async () => {
    const token = configure();
    const calendarId = db.prepare('SELECT id FROM calendars').pluck().get() as string;
    // An administrator who did not come through the setup (for example added by a script).
    await createUser(db, clock, { email: 'other.admin@example.invalid', displayName: 'Other Admin', role: 'admin', password: PASSWORD, calendarId }, null);
    const response = await call('POST', '/api/auth/bootstrap', setupBody(token));
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('setup_unavailable');
    expect(count('users')).toBe(1);
    expect(db.prepare('SELECT token_used_at FROM bootstrap_state').pluck().get()).toBeNull();
    expect((await call('GET', '/api/auth/setup')).body).toEqual({ available: false });
    expect(() => issueSetupToken(db, clock)).toThrow(/administrator/);
    // A deactivated administrator is still an administrator: the setup does not come back.
    db.prepare("UPDATE users SET status = 'deactivated'").run();
    expect((await call('POST', '/api/auth/bootstrap', setupBody(token))).status).toBe(403);
    expect(count('users')).toBe(1);
  });

  it('is refused when the instance was never configured for setup', async () => {
    expect((await call('GET', '/api/auth/setup')).body).toEqual({ available: false });
    const response = await call('POST', '/api/auth/bootstrap', setupBody('AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-FFFFF-GGGGG-HHHHH'));
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('setup_unavailable');
    expect(count('users')).toBe(0);
  });

  it('validates the body strictly and checks the password policy only for a valid token', async () => {
    const token = configure();
    expect((await call('POST', '/api/auth/bootstrap', { ...setupBody(token), role: 'admin' })).status).toBe(422);
    expect((await call('POST', '/api/auth/bootstrap', { token })).status).toBe(422);
    // A weak password with a wrong token is a plain refusal, not a hint that the token is right.
    expect((await call('POST', '/api/auth/bootstrap', setupBody('AAAAA-BBBBB', { password: 'short' }))).status).toBe(403);
    const weak = await call('POST', '/api/auth/bootstrap', setupBody(token, { password: 'short' }));
    expect(weak.status).toBe(422);
    expect(weak.body.error.code).toBe('weak_password');
    // The refused attempt did not use the token.
    expect(count('users')).toBe(0);
    expect((await call('POST', '/api/auth/bootstrap', setupBody(token))).status).toBe(201);
  });

  it('answers many wrong tokens with 429 and then refuses even the right one for a while', async () => {
    const token = configure();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await call('POST', '/api/auth/bootstrap', setupBody(`WRONG-${attempt}`))).status).toBe(403);
    }
    const limited = await call('POST', '/api/auth/bootstrap', setupBody(token));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).not.toBeNull();
    expect(count('users')).toBe(0);
    clock.advanceSeconds(15 * 60 + 1);
    // The window is over and the token, 15 minutes old, is still valid.
    expect((await call('POST', '/api/auth/bootstrap', setupBody(token))).status).toBe(201);
  });

  it('never consumes the token on a GET, whatever the query', async () => {
    const token = configure();
    for (const path of ['/api/auth/setup', `/api/auth/setup?token=${encodeURIComponent(token)}`, '/api/auth/bootstrap', `/api/auth/bootstrap?token=${encodeURIComponent(token)}`]) {
      const response = await call('GET', path);
      expect([200, 404, 405]).toContain(response.status);
      expect(response.text).not.toContain(token);
    }
    expect(db.prepare('SELECT token_used_at FROM bootstrap_state').pluck().get()).toBeNull();
    expect(count('users')).toBe(0);
    expect((await call('POST', '/api/auth/bootstrap', setupBody(token))).status).toBe(201);
  });

  it('keeps the token out of logs, responses and audit payloads, and the password too', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) => vi.spyOn(console, method).mockImplementation(() => undefined));
    const token = configure();
    const replies = [
      await call('GET', '/api/auth/setup'),
      await call('POST', '/api/auth/bootstrap', setupBody(`${token}x`)),
      await call('POST', '/api/auth/bootstrap', setupBody(token, { password: 'short' })),
      await call('POST', '/api/auth/bootstrap', setupBody(token)),
      await call('POST', '/api/auth/bootstrap', setupBody(token)),
    ];
    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    const everything = [logged, ...replies.map((reply) => reply.text), ...replies.map((reply) => [...reply.headers.entries()].join('\n'))].join('\n');
    for (const secret of [token, token.replaceAll('-', ''), PASSWORD]) expect(everything).not.toContain(secret);
    const audit = JSON.stringify(db.prepare('SELECT * FROM audit_events').all());
    for (const secret of [token, token.replaceAll('-', ''), PASSWORD, createHash('sha256').update(token.replaceAll('-', '')).digest('hex')]) {
      expect(audit).not.toContain(secret);
    }
    expect(wholeDatabaseText()).not.toContain(token);
    expect(wholeDatabaseText()).not.toContain(PASSWORD);
  });
});

describe('migration 0008', () => {
  const EXPECTED_BOOTSTRAP_COLUMNS = [
    'id',
    'calendar_id',
    'default_policy',
    'configured_at',
    'token_hash',
    'token_issued_at',
    'token_expires_at',
    'token_used_at',
    'admin_user_id',
  ];

  /** The migrations up to 0008, so these tests keep pinning what 0008 did on its own after later migrations. */
  const UP_TO_8 = MIGRATIONS.filter((migration) => migration.version <= 8);

  function fresh(): Db {
    return openDatabase(join(dir, `m-${Math.random().toString(16).slice(2)}.db`));
  }

  it('is the eighth migration and a fresh 1 to 8 database is consistent and a rerun applies nothing', () => {
    expect(UP_TO_8.map((migration) => migration.version)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const target = fresh();
    try {
      expect(migrate(target, UP_TO_8)).toEqual({ applied: [1, 2, 3, 4, 5, 6, 7, 8], version: 8 });
      expect(target.pragma('user_version', { simple: true })).toBe(8);
      expect(target.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(target.pragma('foreign_key_check')).toEqual([]);
      expect((target.pragma('table_info(bootstrap_state)') as Array<{ name: string }>).map((column) => column.name)).toEqual(EXPECTED_BOOTSTRAP_COLUMNS);
      expect(migrate(target, UP_TO_8)).toEqual({ applied: [], version: 8 });
    } finally {
      target.close();
    }
  });

  it('upgrades a populated version 7 database without touching its rows', async () => {
    const target = fresh();
    try {
      migrate(
        target,
        MIGRATIONS.filter((migration) => migration.version <= 7),
      );
      target
        .prepare(
          "INSERT INTO calendars (id, name, reporting_zone, payroll_anchor_date, cycle_days, period_start_offset_days, period_end_offset_days, due_offset_days, due_local_time, created_at) VALUES ('c', 'c', 'UTC', '2026-10-02', 14, -18, -5, -3, '17:00', '2026-10-05T18:00:00Z')",
        )
        .run();
      await createUser(target, clock, { email: 'synthetic@example.invalid', displayName: 'Synthetic', role: 'admin', password: PASSWORD, calendarId: 'c' }, null);
      const before = JSON.stringify(target.prepare('SELECT * FROM users').all()) + JSON.stringify(target.prepare('SELECT * FROM audit_events').all());
      expect(migrate(target, UP_TO_8, new Date('2026-10-05T19:00:00Z'))).toEqual({ applied: [8], version: 8 });
      expect(JSON.stringify(target.prepare('SELECT * FROM users').all()) + JSON.stringify(target.prepare('SELECT * FROM audit_events').all())).toBe(before);
      expect(target.pragma('integrity_check', { simple: true })).toBe('ok');
      expect(target.pragma('foreign_key_check')).toEqual([]);
      expect(target.prepare('SELECT count(*) FROM bootstrap_state').pluck().get()).toBe(0);
      expect(migrate(target, UP_TO_8)).toEqual({ applied: [], version: 8 });
    } finally {
      target.close();
    }
  });

  it('keeps the state row a single, undeletable row whose token cannot return once an administrator exists', async () => {
    const token = configure();
    expect(token).not.toBe('');
    expect(() => db.prepare('DELETE FROM bootstrap_state').run()).toThrow(/immutable_bootstrap_state/);
    expect(() => db.prepare("UPDATE bootstrap_state SET default_policy = '{}'").run()).toThrow(/immutable_bootstrap_state/);
    expect(() =>
      db.prepare("INSERT INTO bootstrap_state (id, calendar_id, default_policy, configured_at) VALUES (2, (SELECT id FROM calendars), '{}', ?)").run(NOW),
    ).toThrow();
    expect((await call('POST', '/api/auth/bootstrap', setupBody(token))).status).toBe(201);
    expect(() => db.prepare("UPDATE bootstrap_state SET token_hash = ?, token_expires_at = ?").run('a'.repeat(64), '2999-01-01T00:00:00Z')).toThrow(/bootstrap_closed/);
  });
});

describe('CLI bootstrap --config', () => {
  function run(args: string[], extra: Record<string, string> = {}) {
    const result = spawnSync(process.execPath, ['src/server/cli.ts', ...args], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_PATH: join(dir, 'cli.db'), NODE_ENV: 'development', ...extra },
    });
    return { code: result.status, stdout: result.stdout, stderr: result.stderr };
  }

  function ownerFile(content: unknown = OWNER_FILE): string {
    const path = join(dir, 'company.json');
    writeFileSync(path, JSON.stringify(content));
    return path;
  }

  it('configures the instance, prints one token to the terminal and stores only its hash', () => {
    const result = run(['bootstrap', '--config', ownerFile()]);
    expect(result.code, result.stderr).toBe(0);
    const tokens = result.stdout.match(/\b[A-Z2-7]{5}(?:-[A-Z2-7]{5}){7}\b/g) ?? [];
    expect(tokens).toHaveLength(1);
    const token = tokens[0] ?? '';
    expect(result.stderr).not.toContain(token);
    const check = openDatabase(join(dir, 'cli.db'));
    try {
      expect(check.prepare('SELECT count(*) FROM calendars').pluck().get()).toBe(1);
      expect(check.prepare('SELECT count(*) FROM users').pluck().get()).toBe(0);
      const text = (check.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").pluck().all() as string[])
        .map((name) => JSON.stringify(check.prepare(`SELECT * FROM ${name}`).all()))
        .join('\n');
      expect(text).not.toContain(token);
      expect(text).toContain(createHash('sha256').update(token.replaceAll('-', '')).digest('hex'));
    } finally {
      check.close();
    }
  });

  it('refuses a second run and prints no token', () => {
    const file = ownerFile();
    expect(run(['bootstrap', '--config', file]).code).toBe(0);
    const second = run(['bootstrap', '--config', file]);
    expect(second.code).toBe(1);
    expect(second.stderr).toMatch(/already bootstrapped/);
    expect(second.stdout).not.toMatch(/[A-Z2-7]{5}-[A-Z2-7]{5}/);
  });

  it('rejects a bad file with exit 1 and writes nothing', () => {
    expect(run(['migrate']).code).toBe(0);
    const result = run(['bootstrap', '--config', ownerFile({ ...OWNER_FILE, identity: { employee_email: 'someone@example.invalid' } })]);
    expect(result.code).toBe(1);
    expect(run(['bootstrap']).code).toBe(2);
    expect(run(['bootstrap', '--config']).code).toBe(2);
    const check = openDatabase(join(dir, 'cli.db'));
    try {
      expect(check.prepare('SELECT count(*) FROM calendars').pluck().get()).toBe(0);
    } finally {
      check.close();
    }
  });

  it('issues a fresh token with --new-token while no administrator exists', () => {
    expect(run(['bootstrap', '--new-token']).code).toBe(1);
    const file = ownerFile();
    const first = run(['bootstrap', '--config', file]).stdout.match(/[A-Z2-7]{5}(?:-[A-Z2-7]{5}){7}/)?.[0] ?? '';
    const again = run(['bootstrap', '--new-token']);
    expect(again.code, again.stderr).toBe(0);
    const second = again.stdout.match(/[A-Z2-7]{5}(?:-[A-Z2-7]{5}){7}/)?.[0] ?? '';
    expect(second).not.toBe('');
    expect(second).not.toBe(first);
  });

  it('runs in production while the development seed stays refused there', () => {
    const production = { NODE_ENV: 'production', APP_ORIGINS: 'https://timesheet.example.invalid', DATABASE_PATH: join(dir, 'cli.db') };
    const result = run(['bootstrap', '--config', ownerFile()], production);
    expect(result.code, result.stderr).toBe(0);
    const seed = run(['seed'], { ...production, DATABASE_PATH: join(dir, 'other-cli.db') });
    expect(seed.code).not.toBe(0);
    expect(seed.stderr).toMatch(/Refusing to seed/);
  });
});
