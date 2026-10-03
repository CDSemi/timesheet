import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext, DEFAULT_BREAKS_0900, la, type TestContext } from '../support/testApp.ts';

/*
 * The production engine through real persistence and HTTP: calculations, flexible
 * arrival, overnight/DST handling, seconds from live clocks and interval validation.
 */

let t: TestContext | undefined;

afterEach(() => t?.close());

async function setup(nowIso = '2026-09-29T20:00:00Z') {
  t = await createTestContext(nowIso);
  return { t, cookie: await t.login('employee') };
}

function session(start: unknown, end: unknown, breaks: unknown[] = [], extra: Record<string, unknown> = {}) {
  return { start, end, input_zone: 'America/Los_Angeles', breaks, breaks_confirmed: true, ...extra };
}

describe('calculations through the API', () => {
  it('09:00–18:00 with the shifted default breaks is exactly 480 regular minutes and no OT', async () => {
    const { t, cookie } = await setup();
    const created = await t.request('POST', '/api/days/2026-09-21/sessions', {
      cookie,
      body: session(la('2026-09-21T09:00'), la('2026-09-21T18:00'), DEFAULT_BREAKS_0900),
    });
    expect(created.status).toBe(201);
    expect(created.body.session).toMatchObject({ start_utc: '2026-09-21T16:00:00Z', end_utc: '2026-09-22T01:00:00Z' });
    const calc = created.body.day.calculation;
    expect(calc).toMatchObject({
      status: 'complete',
      provisional: true,
      regular_minutes: 480,
      nonworking_minutes: 0,
      eligible_minutes: 0,
      credited_minutes: 0,
      excluded_break_seconds: 3600,
    });
    const policies = await t.request('GET', '/api/policies', { cookie });
    expect(calc.policy_version_id).toBe(policies.body.policies[0].id);
    expect(created.body.day).toMatchObject({ category: 'Worked', attendance_expected: true, deficit_minutes: 0 });
  });

  it('accepts UTC strings and keeps N/M boundaries (75 → 60, 76 → 90)', async () => {
    const { t, cookie } = await setup();
    const breaks = [
      { start: '2026-09-21T18:00:00Z', end: '2026-09-21T18:15:00Z', counts_as_work: false },
      { start: '2026-09-21T20:00:00Z', end: '2026-09-21T20:30:00Z', counts_as_work: false },
      { start: '2026-09-21T22:30:00Z', end: '2026-09-21T22:45:00Z', counts_as_work: false },
    ];
    const seventyFive = await t.request('POST', '/api/days/2026-09-21/sessions', {
      cookie,
      body: session('2026-09-21T16:00:00Z', '2026-09-22T02:15:00Z', breaks),
    });
    expect(seventyFive.body.day.calculation).toMatchObject({ regular_minutes: 555, eligible_minutes: 75, credited_minutes: 60 });
    const updated = await t.request('PUT', `/api/sessions/${seventyFive.body.session.id}`, {
      cookie,
      body: { ...session('2026-09-21T16:00:00Z', '2026-09-22T02:16:00Z', breaks), expected_version: 1 },
    });
    expect(updated.status).toBe(200);
    expect(updated.body.day.calculation).toMatchObject({ regular_minutes: 556, eligible_minutes: 76, credited_minutes: 90 });
  });

  it('credits off-calendar minutes without B or N but with M (15 → 0, 16 → 30)', async () => {
    const { t, cookie } = await setup();
    const fifteen = await t.request('POST', '/api/days/2026-09-26/sessions', {
      cookie,
      body: session(la('2026-09-26T10:00'), la('2026-09-26T10:15')),
    });
    expect(fifteen.body.day.calculation).toMatchObject({ nonworking_minutes: 15, eligible_minutes: 15, credited_minutes: 0 });
    expect(fifteen.body.day).toMatchObject({ category: 'Off', attendance_expected: false });
    const sixteen = await t.request('POST', '/api/days/2026-09-27/sessions', {
      cookie,
      body: session(la('2026-09-27T10:00'), la('2026-09-27T10:16')),
    });
    expect(sixteen.body.day.calculation).toMatchObject({ nonworking_minutes: 16, eligible_minutes: 16, credited_minutes: 30 });
  });

  it('splits a Friday overnight shift into Friday regular and Saturday off-calendar minutes', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('POST', '/api/days/2026-09-25/sessions', {
      cookie,
      body: session(la('2026-09-25T22:00'), la('2026-09-26T02:00')),
    });
    expect(response.body.day.calculation).toMatchObject({
      regular_minutes: 120,
      nonworking_minutes: 120,
      credited_minutes: 120,
      segments: [
        { local_date: '2026-09-25', day_class: 'normal', seconds: 7200 },
        { local_date: '2026-09-26', day_class: 'nonworking', seconds: 7200 },
      ],
    });
    // The overnight tail stays on its starting work date; Saturday has no session of its own.
    const saturday = await t.request('GET', '/api/days/2026-09-26', { cookie });
    expect(saturday.body.sessions).toEqual([]);
  });

  it('aggregates live-clock seconds across sessions before flooring once', async () => {
    const { t, cookie } = await setup('2026-09-28T15:00:00Z');
    expect((await t.request('POST', '/api/clock/in', { cookie, body: { input_zone: 'Asia/Ho_Chi_Minh' } })).status).toBe(201);
    t.clock.set('2026-09-28T19:00:40Z');
    await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true, expected_version: 1 } });
    t.clock.set('2026-09-28T20:00:00Z');
    await t.request('POST', '/api/clock/in', { cookie, body: { input_zone: 'Asia/Ho_Chi_Minh' } });
    t.clock.set('2026-09-29T00:30:30Z');
    const out = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true, expected_version: 1 } });
    // 4h00m40s + 4h30m30s = 8h31m10s → R = 511 (per-session flooring would give 510 and no credit).
    expect(out.body.day.calculation).toMatchObject({
      regular_seconds: 30_670,
      regular_minutes: 511,
      eligible_minutes: 31,
      credited_minutes: 30,
    });
    // The device/input zone differs, but the work date is the reporting-zone date.
    expect(out.body.session).toMatchObject({ work_date: '2026-09-28', source: 'clock', input_zone: 'Asia/Ho_Chi_Minh' });
    expect(out.body.day.sessions.map((item: { end_utc: string }) => item.end_utc)).toEqual([
      '2026-09-28T19:00:40Z',
      '2026-09-29T00:30:30Z',
    ]);
  });

  it('keeps open sessions and unknown breaks pending instead of inventing minutes', async () => {
    const { t, cookie } = await setup('2026-09-28T16:00:00Z');
    const open = await t.request('POST', '/api/clock/in', { cookie, body: { input_zone: 'America/Los_Angeles' } });
    expect(open.body.day.calculation).toMatchObject({ status: 'incomplete', credited_minutes: null, regular_minutes: null });
    expect(open.body.day.deficit_minutes).toBeNull();
    const again = await t.request('POST', '/api/clock/in', { cookie, body: { input_zone: 'America/Los_Angeles' } });
    expect(again.body.error.code).toBe('open_session_exists');
    t.clock.set('2026-09-29T01:00:00Z');
    const unknownBreaks = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: false, expected_version: 1 } });
    expect(unknownBreaks.body.day.calculation).toMatchObject({ status: 'incomplete_breaks', credited_minutes: null });
    const sheet = await t.request('GET', '/api/timesheets/2026-10-16', { cookie });
    expect(sheet.body.totals).toEqual({ provisional_credited_minutes: 0, pending_days: 1 });
  });

  it('reports the raw deficit on a short confirmed weekday without posting anything', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('POST', '/api/days/2026-09-23/sessions', {
      cookie,
      body: session(la('2026-09-23T09:00'), la('2026-09-23T16:00')),
    });
    expect(response.body.day.calculation.regular_minutes).toBe(420);
    expect(response.body.day.deficit_minutes).toBe(60);
    expect(t.db.prepare("SELECT name FROM sqlite_master WHERE name LIKE '%ledger%'").all()).toEqual([]);
  });
});

describe('zones and DST through the API', () => {
  it('rejects a nonexistent spring-forward local time', async () => {
    const { t, cookie } = await setup('2026-03-10T20:00:00Z');
    const response = await t.request('POST', '/api/days/2026-03-08/sessions', {
      cookie,
      body: session(la('2026-03-08T02:30'), la('2026-03-08T04:00')),
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('nonexistent_local_time');
  });

  it('requires a fold for the repeated fall-back hour and counts elapsed UTC time', async () => {
    const { t, cookie } = await setup('2026-11-10T20:00:00Z');
    const ambiguous = await t.request('POST', '/api/days/2026-11-01/sessions', {
      cookie,
      body: session(la('2026-11-01T01:30'), la('2026-11-01T03:30')),
    });
    expect(ambiguous.status).toBe(422);
    expect(ambiguous.body.error.code).toBe('ambiguous_local_time');
    const later = await t.request('POST', '/api/days/2026-11-01/sessions', {
      cookie,
      body: session(la('2026-11-01T01:30', 1), la('2026-11-01T03:30')),
    });
    expect(later.body.session.start_utc).toBe('2026-11-01T09:30:00Z');
    expect(later.body.day.calculation).toMatchObject({ nonworking_minutes: 120, credited_minutes: 120 });
    const earlier = await t.request('PUT', `/api/sessions/${later.body.session.id}`, {
      cookie,
      body: { ...session(la('2026-11-01T01:30', 0), la('2026-11-01T03:30')), expected_version: 1 },
    });
    expect(earlier.body.session.start_utc).toBe('2026-11-01T08:30:00Z');
    expect(earlier.body.day.calculation).toMatchObject({ nonworking_minutes: 180, credited_minutes: 180 });
  });

  it('accepts an explicit offset for an ambiguous time and rejects an invalid one', async () => {
    const { t, cookie } = await setup('2026-11-10T20:00:00Z');
    const wrong = await t.request('POST', '/api/days/2026-11-01/sessions', {
      cookie,
      body: session({ local: '2026-11-01T01:30', zone: 'America/Los_Angeles', offset: '-05:00' }, la('2026-11-01T03:30')),
    });
    expect(wrong.body.error.code).toBe('offset_mismatch');
    const right = await t.request('POST', '/api/days/2026-11-01/sessions', {
      cookie,
      body: session({ local: '2026-11-01T01:30', zone: 'America/Los_Angeles', offset: '-08:00' }, la('2026-11-01T03:30')),
    });
    expect(right.body.session.start_utc).toBe('2026-11-01T09:30:00Z');
  });

  it('uses the input zone for manual entry while keeping the saved accounting date', async () => {
    const { t, cookie } = await setup();
    // 09:00–18:00 entered in Ho Chi Minh time is 2026-09-20 19:00 → 2026-09-21 04:00 in Los Angeles.
    const response = await t.request('POST', '/api/days/2026-09-21/sessions', {
      cookie,
      body: {
        ...session({ local: '2026-09-21T09:00', zone: 'Asia/Ho_Chi_Minh' }, { local: '2026-09-21T18:00', zone: 'Asia/Ho_Chi_Minh' }),
        input_zone: 'Asia/Ho_Chi_Minh',
      },
    });
    expect(response.status).toBe(201);
    expect(response.body.session).toMatchObject({
      work_date: '2026-09-21',
      start_utc: '2026-09-21T02:00:00Z',
      end_utc: '2026-09-21T11:00:00Z',
      input_zone: 'Asia/Ho_Chi_Minh',
    });
    // Classification follows the saved reporting zone: 5 h on Sunday, 4 h on Monday.
    expect(response.body.day.calculation).toMatchObject({ regular_minutes: 240, nonworking_minutes: 300 });
  });
});

describe('interval validation through the API (R-01)', () => {
  it('rejects invalid shapes, overlaps across work dates, misplaced dates and future work', async () => {
    const { t, cookie } = await setup();
    const post = (date: string, body: unknown) => t.request('POST', `/api/days/${date}/sessions`, { cookie, body });
    const expectCode = async (promise: ReturnType<typeof post>, code: string) => {
      const response = await promise;
      expect(response.status, code).toBe(422);
      expect(response.body.error.code).toBe(code);
    };
    await expectCode(post('2026-09-21', session('2026-09-21T15:00:00Z', '2026-09-21T14:00:00Z')), 'end_not_after_start');
    await expectCode(
      post(
        '2026-09-21',
        session('2026-09-21T15:00:00Z', '2026-09-21T16:00:00Z', [
          { start: '2026-09-21T16:00:00Z', end: '2026-09-21T16:15:00Z', counts_as_work: false },
        ]),
      ),
      'break_outside_session',
    );
    await expectCode(
      post(
        '2026-09-21',
        session('2026-09-21T15:00:00Z', '2026-09-21T18:00:00Z', [
          { start: '2026-09-21T16:00:00Z', end: '2026-09-21T16:15:00Z', counts_as_work: false },
          { start: '2026-09-21T16:10:00Z', end: '2026-09-21T16:30:00Z', counts_as_work: false },
        ]),
      ),
      'overlapping_breaks',
    );
    expect((await post('2026-09-21', session('2026-09-21T15:00:00Z', '2026-09-21T17:00:00Z'))).status).toBe(201);
    await expectCode(post('2026-09-22', session('2026-09-21T16:00:00Z', '2026-09-21T18:00:00Z')), 'overlapping_user_intervals');
    await expectCode(post('2026-09-24', session('2026-09-21T20:00:00Z', '2026-09-21T21:00:00Z')), 'work_date_mismatch');
    await expectCode(post('2026-09-29', session('2026-09-29T21:00:00Z', '2026-09-29T23:00:00Z')), 'future_time');
    await expectCode(post('2026-09-21', { ...session('2026-09-21T18:00:00Z', '2026-09-21T19:00:00Z'), input_zone: 'Mars/Base' }), 'invalid_time_zone');
    await expectCode(post('2026-09-21', session('2026-09-21T18:00:00.250Z', '2026-09-21T19:00:00Z')), 'invalid_instant');
    await expectCode(post('2026-02-30', session('2026-09-21T18:00:00Z', '2026-09-21T19:00:00Z')), 'invalid_date');
    // Nothing from the rejected requests was stored.
    expect(t.db.prepare('SELECT count(*) FROM work_sessions').pluck().get()).toBe(1);
  });
});

describe('periods and calendar views', () => {
  it('reports the current period (due now) separately from the period in progress', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('GET', '/api/periods/current', { cookie });
    expect(response.body).toMatchObject({
      reporting_zone: 'America/Los_Angeles',
      today_local: '2026-09-29',
      current: {
        payroll_date: '2026-10-02',
        period_start: '2026-09-14',
        period_end: '2026-09-27',
        due_local_date: '2026-09-29',
        due_at_utc: '2026-09-30T00:00:00Z',
      },
      in_progress: { payroll_date: '2026-10-16', period_start: '2026-09-28', period_end: '2026-10-11' },
    });
    const list = await t.request('GET', '/api/periods?from=2026-09-01&to=2026-10-31', { cookie });
    expect(list.body.periods.map((period: { payroll_date: string; relation: string }) => [period.payroll_date, period.relation])).toEqual([
      ['2026-09-18', 'old'],
      ['2026-10-02', 'current'],
      ['2026-10-16', 'future'],
      ['2026-10-30', 'future'],
      ['2026-11-13', 'future'],
    ]);
  });

  it('shows 14 days with calendar classification, holiday names and default labels', async () => {
    const { t, cookie } = await setup();
    const sheet = await t.request('GET', '/api/timesheets/2026-09-18', { cookie });
    expect(sheet.body.days).toHaveLength(14);
    const laborDay = sheet.body.days.find((day: { work_date: string }) => day.work_date === '2026-09-07');
    expect(laborDay).toMatchObject({
      classification: { day_class: 'nonworking', reason: 'holiday', name: 'Labor Day' },
      default_category: 'Holiday',
      entry: null,
      calculation: { status: 'no_records', credited_minutes: null },
    });
    expect(sheet.body.period.relation).toBe('old');
    expect(sheet.body.reason_required).toBe(true);
    const unknown = await t.request('GET', '/api/timesheets/2026-09-19', { cookie });
    expect(unknown.body.error.code).toBe('unknown_payroll_date');
    const calendar = await t.request('GET', '/api/calendar', { cookie });
    expect(calendar.body.versions[0].dates).toHaveLength(9);
    expect(calendar.body.payroll).toMatchObject({ anchor_payroll_date: '2026-10-02', cycle_days: 14, due_local_time: '17:00' });
  });
});
