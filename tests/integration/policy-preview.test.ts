import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, la, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T06: POST /api/policies/preview. Same strict body and validation as POST /api/policies,
 * session user only, writes nothing, and lists the caller's current and future draft days
 * whose provisional minutes would change, with before/after from the one calculation engine.
 * Today is 2026-09-29 (LA 13:00): the current period is 2026-09-14…2026-09-27 (payroll
 * 2026-10-02), the next is 2026-09-28…2026-10-11. The seed policy is B=480, N=30, M=30.
 */

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

const EFFECTIVE = '2026-10-05';
const MINUTE_FIELDS = [
  'regular_minutes',
  'nonworking_minutes',
  'normal_excess_minutes',
  'eligible_minutes',
  'credited_minutes',
] as const;

/** The seed's breaks (60 excluded minutes) so that reference 08:00–17:00 stays consistent with B=480. */
const SEED_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function proposal(overrides: Record<string, unknown> = {}) {
  return {
    effective_from: EFFECTIVE,
    required_minutes: 480,
    threshold_minutes: 0,
    rounding_step_minutes: 15,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: SEED_BREAKS,
    deficit_mode: 'ignore',
    note: 'Synthetic preview proposal',
    ...overrides,
  };
}

async function addSession(who: string, date: string, from: string, to: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: {
      start: la(`${date}T${from}`),
      end: la(`${date}T${to}`),
      input_zone: 'America/Los_Angeles',
      breaks: [],
      breaks_confirmed: true,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/**
 * Actual sessions cannot end in the future, so the later days are recorded from a later
 * "today" with fresh logins; afterwards the clock returns to 2026-09-29, which makes those
 * days future draft days, and both users sign in again.
 */
async function recordLater(record: (cookies: { employee: string; admin: string }) => Promise<void>) {
  t.clock.set('2026-10-13T20:00:00Z');
  await record({ employee: await t.login('employee'), admin: await t.login('admin') });
  t.clock.set('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
}

/** Session days for the scenario. Net work with no breaks: R = elapsed minutes on a weekday. */
async function seedScenario() {
  await addSession(employee, '2026-09-22', '09:00', '19:00'); // current period, before the effective date
  await recordLater(async ({ employee: who }) => {
    await addSession(who, '2026-10-06', '09:00', '18:50'); // R=590, E=110: credit 120 -> 105 (default label)
    await addSession(who, '2026-10-07', '09:00', '17:30'); // R=510, E=30: credit 0 -> 30 (made explicit below)
    await addSession(who, '2026-10-08', '09:00', '17:00'); // R=480: unchanged
    await addSession(who, '2026-10-10', '10:00', '12:00'); // Saturday, O=120: credit 120 both
    await addSession(who, '2026-10-12', '09:00', '17:46'); // R=526, E=46: credit 60 -> 45 (default label, later period)
    const row = (await t.request('GET', '/api/days/2026-10-07', { cookie: who })).body.entry;
    const explicit = await t.request('PUT', '/api/days/2026-10-07', {
      cookie: who,
      body: { category: 'Worked', leave_minutes: 0, wfh: false, notes: 'explicit label', expected_version: row.version },
    });
    expect(explicit.status, JSON.stringify(explicit.body)).toBe(200);
  });
}

const SCENARIO_DATES = ['2026-09-22', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-10', '2026-10-12'];

function preview(body: unknown, who: string | undefined = employee) {
  return t.request('POST', '/api/policies/preview', { cookie: who, body });
}

function create(body: unknown, who: string | undefined = employee) {
  return t.request('POST', '/api/policies', { cookie: who, body });
}

async function dayViews(who: string, dates: readonly string[] = SCENARIO_DATES) {
  const views: Record<string, any> = {};
  for (const date of dates) {
    const response = await t.request('GET', `/api/days/${date}`, { cookie: who });
    expect(response.status).toBe(200);
    views[date] = response.body;
  }
  return views;
}

function minutes(calculation: any) {
  return Object.fromEntries(MINUTE_FIELDS.map((field) => [field, calculation?.[field] ?? null]));
}

const TABLES = [
  'work_policies',
  'audit_events',
  'day_entries',
  'work_sessions',
  'session_breaks',
  'timesheets',
  'pay_periods',
  'ot_ledger',
  'ot_leave_requests',
  'auth_sessions',
  'calendars',
  'calendar_versions',
  'payroll_exceptions',
  'users',
] as const;

function snapshot() {
  return Object.fromEntries(
    TABLES.map((table) => [table, t.db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()]),
  );
}

describe('preview content', () => {
  it('lists exactly the changed days and equals the day views after the version is created', async () => {
    await seedScenario();
    const before = await dayViews(employee);

    const response = await preview(proposal());
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.effective_from).toBe(EFFECTIVE);
    const days: Array<{ work_date: string; before: any; after: any }> = response.body.days;
    expect(days.map((day) => day.work_date)).toEqual(['2026-10-06', '2026-10-07', '2026-10-12']);

    // Before values are the live day views; the proposal is not applied yet.
    for (const day of days) expect(day.before).toMatchObject(minutes(before[day.work_date].calculation));
    expect(days[0]).toMatchObject({
      before: { normal_excess_minutes: 110, eligible_minutes: 110, credited_minutes: 120 },
      after: { normal_excess_minutes: 110, eligible_minutes: 110, credited_minutes: 105 },
    });
    expect(days[1]).toMatchObject({
      before: { eligible_minutes: 0, credited_minutes: 0 },
      after: { eligible_minutes: 30, credited_minutes: 30 },
    });
    expect(days[2]).toMatchObject({ before: { credited_minutes: 60 }, after: { credited_minutes: 45 } });

    // Nothing was applied by the preview itself.
    expect(minutes((await dayViews(employee, ['2026-10-06']))['2026-10-06'].calculation)).toEqual(
      minutes(before['2026-10-06'].calculation),
    );

    const created = await create(proposal());
    expect(created.status).toBe(201);
    const after = await dayViews(employee);
    for (const day of days) {
      expect(minutes(after[day.work_date].calculation), day.work_date).toEqual(minutes(day.after));
      expect(after[day.work_date].calculation.policy_version_id).toBe(created.body.policy.id);
    }
    // Every day the preview did not list is unchanged by the real version.
    for (const date of SCENARIO_DATES.filter((item) => !days.some((day) => day.work_date === item))) {
      expect(minutes(after[date].calculation), date).toEqual(minutes(before[date].calculation));
    }
  });

  it('covers a default-labelled day and an explicit-labelled day', async () => {
    await seedScenario();
    const views = await dayViews(employee, ['2026-10-06', '2026-10-07']);
    expect(views['2026-10-06'].category_source).toBe('default');
    expect(views['2026-10-07'].category_source).toBe('explicit');
    const response = await preview(proposal());
    const listed = response.body.days.map((day: { work_date: string }) => day.work_date);
    expect(listed).toEqual(expect.arrayContaining(['2026-10-06', '2026-10-07']));
  });

  it('leaves out days before the effective date and days whose values do not change', async () => {
    await seedScenario();
    const response = await preview(proposal());
    const listed = response.body.days.map((day: { work_date: string }) => day.work_date);
    expect(listed).not.toContain('2026-09-22'); // before effective_from
    expect(listed).not.toContain('2026-10-08'); // R = B, nothing eligible either way
    expect(listed).not.toContain('2026-10-10'); // off-calendar minutes are not rounded differently
  });

  it('returns an empty list when nothing would change', async () => {
    await seedScenario();
    const same = await preview(proposal({ threshold_minutes: 30, rounding_step_minutes: 30 }));
    expect(same.status).toBe(200);
    expect(same.body.days).toEqual([]);
    const empty = await preview(proposal({ effective_from: '2027-01-04' }));
    expect(empty.body.days).toEqual([]);
  });

  it('leaves out finalized timesheets and days of an old period', async () => {
    await seedScenario();
    // 2026-10-12 belongs to the period 2026-10-12…10-25; mark it finalized (synthetic fixture row).
    const period = t.db
      .prepare(
        `SELECT t.id FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
          WHERE t.user_id = ? AND ? BETWEEN p.period_start AND p.period_end`,
      )
      .pluck()
      .get(t.userIds.employee, '2026-10-12') as string;
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1 WHERE id = ?').run(period);
    const response = await preview(proposal());
    expect(response.body.days.map((day: { work_date: string }) => day.work_date)).toEqual(['2026-10-06', '2026-10-07']);
  });

  it('keeps a version that changes only the deficit mode from listing any day', async () => {
    await seedScenario();
    const response = await preview(proposal({ threshold_minutes: 30, rounding_step_minutes: 30, deficit_mode: 'auto_deduct' }));
    expect(response.status).toBe(200);
    expect(response.body.days).toEqual([]);
  });
});

describe('preview writes nothing', () => {
  it('leaves every table identical across repeated previews', async () => {
    await seedScenario();
    const before = snapshot();
    const createAudits = () =>
      t.db.prepare("SELECT count(*) FROM audit_events WHERE operation = 'work_policy.create'").pluck().get() as number;
    const auditsBefore = createAudits();
    for (let i = 0; i < 3; i += 1) {
      const response = await preview(proposal());
      expect(response.status).toBe(200);
      expect(response.body.days.length).toBeGreaterThan(0);
    }
    expect(snapshot()).toEqual(before);
    expect(createAudits()).toBe(auditsBefore);
    // A later real creation still gets the next sequence number and exactly one audit event.
    const created = await create(proposal());
    expect(created.status).toBe(201);
    expect(created.body.policy.seq).toBe(2);
    expect(createAudits()).toBe(auditsBefore + 1);
  });

  it('writes nothing for a refused proposal either', async () => {
    await seedScenario();
    const before = snapshot();
    const response = await preview(proposal({ reference_end: '18:00' }));
    expect(response.status).toBe(422);
    expect(snapshot()).toEqual(before);
  });
});

describe('validation matches creation', () => {
  const refused: Array<[string, Record<string, unknown>]> = [
    ['R-02 reference duration', { reference_end: '18:00' }],
    ['R-02 break counted as work changes the excluded total', { breaks: [{ ...SEED_BREAKS[0], counts_as_work: true }, SEED_BREAKS[1], SEED_BREAKS[2]] }],
    ['retroactive effective date', { effective_from: '2026-09-13' }],
    ['invalid effective date', { effective_from: '2026-02-30' }],
    ['required minutes', { required_minutes: 0 }],
    ['fractional threshold', { threshold_minutes: 1.5 }],
    ['rounding step', { rounding_step_minutes: 0 }],
    ['overlapping breaks', { breaks: [SEED_BREAKS[0], { ...SEED_BREAKS[1], start_offset_minutes: 130 }, SEED_BREAKS[2]] }],
    ['break outside the reference', { breaks: [...SEED_BREAKS, { start_offset_minutes: 530, duration_minutes: 30, counts_as_work: true }] }],
    ['unknown deficit mode', { deficit_mode: 'sometimes' }],
    ['unknown field', { surprise: true }],
    ['user_id field', { user_id: '00000000-0000-4000-8000-000000000001' }],
    ['missing field', { required_minutes: undefined }],
  ];

  it.each(refused)('%s: preview and create return the same status and error code', async (_label, overrides) => {
    const previewed = await preview(proposal(overrides));
    const attempted = await create(proposal(overrides));
    expect(previewed.status).toBe(attempted.status);
    expect(previewed.status).not.toBe(200);
    expect(previewed.body.error.code).toBe(attempted.body.error.code);
    expect(t.db.prepare('SELECT count(*) FROM work_policies WHERE user_id = ?').pluck().get(t.userIds.employee)).toBe(1);
  });

  it('answers malformed JSON as creation does', async () => {
    const options = { cookie: employee, body: '{not json', headers: { 'content-type': 'application/json' } };
    const previewed = await t.request('POST', '/api/policies/preview', options);
    const attempted = await t.request('POST', '/api/policies', options);
    expect([previewed.status, previewed.body.error.code]).toEqual([attempted.status, attempted.body.error.code]);
    expect(previewed.status).toBe(400);
  });

  it('accepts what creation accepts, including an omitted note', async () => {
    const { note: _note, ...withoutNote } = proposal();
    const previewed = await preview(withoutNote);
    expect(previewed.status).toBe(200);
    expect((await create(withoutNote)).status).toBe(201);
  });
});

describe('isolation and request rules', () => {
  it('never lists another user’s days and leaves them unaffected', async () => {
    await seedScenario();
    await recordLater(async ({ admin: who }) => {
      await addSession(who, '2026-10-06', '09:00', '19:20'); // admin R=620, E=140: credit 150 -> 135
    });
    const adminBefore = await dayViews(admin, ['2026-10-06']);
    const adminPolicyRows = t.db.prepare('SELECT * FROM work_policies WHERE user_id = ?').all(t.userIds.admin);

    const mine = await preview(proposal());
    expect(mine.status).toBe(200);
    expect(JSON.stringify(mine.body)).not.toContain(t.userIds.admin);
    expect(mine.body.days.find((day: { work_date: string }) => day.work_date === '2026-10-06').before.credited_minutes).toBe(120);

    const theirs = await preview(proposal(), admin);
    expect(theirs.body.days.map((day: { work_date: string }) => day.work_date)).toEqual(['2026-10-06']);
    expect(theirs.body.days[0].before.credited_minutes).toBe(150);

    // Creating the employee's version leaves the admin's days and policies untouched.
    expect((await create(proposal())).status).toBe(201);
    expect(await dayViews(admin, ['2026-10-06'])).toEqual(adminBefore);
    expect(t.db.prepare('SELECT * FROM work_policies WHERE user_id = ?').all(t.userIds.admin)).toEqual(adminPolicyRows);
  });

  it('acts for the session user only and rejects any user_id', async () => {
    const response = await preview(proposal({ user_id: t.userIds.admin }));
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('validation_error');
  });

  it('requires a session and a same-origin JSON request', async () => {
    const body = proposal();
    expect((await t.request('POST', '/api/policies/preview', { body })).status).toBe(401);
    expect((await t.request('POST', '/api/policies/preview', { body, origin: ORIGIN })).status).toBe(401);
    const missing = await t.request('POST', '/api/policies/preview', { cookie: employee, body, origin: null });
    expect(missing.status).toBe(403);
    expect(missing.body.error.code).toBe('origin_rejected');
    const foreign = await t.request('POST', '/api/policies/preview', {
      cookie: employee,
      body,
      origin: 'https://evil.example.invalid',
    });
    expect(foreign.status).toBe(403);
    const crossSite = await t.request('POST', '/api/policies/preview', {
      cookie: employee,
      body,
      headers: { 'sec-fetch-site': 'cross-site' },
    });
    expect(crossSite.status).toBe(403);
    const form = await t.request('POST', '/api/policies/preview', {
      cookie: employee,
      body: 'a=b',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    expect(form.status).toBe(415);
  });

  it('is a POST-only route that is not reachable with GET', async () => {
    const response = await t.request('GET', '/api/policies/preview', { cookie: employee });
    expect(response.status).not.toBe(200);
  });
});
