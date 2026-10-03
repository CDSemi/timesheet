import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T01: on an open session a break may not end later than now + 5 minutes. A future
 * break could otherwise sit in the stored break set and later be confirmed or deducted
 * (R-01, R-02). Closed sessions are already bounded by the session-end check.
 */

let t: TestContext | undefined;

afterEach(() => t?.close());

const NOW = '2026-09-29T20:00:00Z';
const OPEN_START = '2026-09-29T16:00:00Z'; // 09:00 in Los Angeles
const AT_ALLOWANCE = '2026-09-29T20:05:00Z'; // now + 5 minutes
const PAST_ALLOWANCE = '2026-09-29T20:05:01Z'; // now + 5 minutes + 1 second

const breakEndingAt = (end: string) => ({ start: '2026-09-29T19:50:00Z', end, counts_as_work: false });

function openBody(breaks: unknown[]) {
  return { start: OPEN_START, end: null, input_zone: 'America/Los_Angeles', breaks, breaks_confirmed: false };
}

async function setup() {
  t = await createTestContext(NOW);
  const cookie = await t.login('employee');
  return { t, cookie };
}

function counts(db: TestContext['db']) {
  return {
    sessions: db.prepare('SELECT COUNT(*) FROM work_sessions').pluck().get(),
    breaks: db.prepare('SELECT COUNT(*) FROM session_breaks').pluck().get(),
    audit: db.prepare('SELECT COUNT(*) FROM audit_events').pluck().get(),
  };
}

describe('break end allowance on open sessions (WP2-T01)', () => {
  it('create accepts a break ending exactly now + 5 minutes', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie,
      body: openBody([breakEndingAt(AT_ALLOWANCE)]),
    });
    expect(response.status).toBe(201);
    expect(response.body.session.breaks).toHaveLength(1);
  });

  it('create rejects a break ending after now + 5 minutes with typed 422 future_break and writes nothing', async () => {
    const { t, cookie } = await setup();
    const before = counts(t.db);
    const response = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie,
      body: openBody([breakEndingAt(PAST_ALLOWANCE)]),
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('future_break');
    expect(response.body.error.details).toMatchObject({ break_index: 0 });
    expect(counts(t.db)).toEqual(before);
  });

  it('create rejects a far-future break even when it is not the first one', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie,
      body: openBody([
        { start: '2026-09-29T17:00:00Z', end: '2026-09-29T17:15:00Z', counts_as_work: false },
        { start: '2026-09-30T02:00:00Z', end: '2026-09-30T02:30:00Z', counts_as_work: false },
      ]),
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('future_break');
    expect(response.body.error.details).toMatchObject({ break_index: 1 });
  });

  it('update applies the same bound to an open session and leaves the stored session unchanged', async () => {
    const { t, cookie } = await setup();
    const created = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie,
      body: openBody([breakEndingAt(AT_ALLOWANCE)]),
    });
    const id = created.body.session.id as string;
    const before = counts(t.db);
    const rejected = await t.request('PUT', `/api/sessions/${id}`, {
      cookie,
      body: { ...openBody([breakEndingAt(PAST_ALLOWANCE)]), expected_version: 1 },
    });
    expect(rejected.status).toBe(422);
    expect(rejected.body.error.code).toBe('future_break');
    expect(counts(t.db)).toEqual(before);
    expect(t.db.prepare('SELECT version FROM work_sessions WHERE id = ?').pluck().get(id)).toBe(1);
    const accepted = await t.request('PUT', `/api/sessions/${id}`, {
      cookie,
      body: { ...openBody([breakEndingAt('2026-09-29T20:00:00Z')]), expected_version: 1 },
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body.session.version).toBe(2);
  });

  it('does not restrict closed sessions that end in the past', async () => {
    const { t, cookie } = await setup();
    const response = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie,
      body: {
        start: la('2026-09-29T09:00'),
        end: la('2026-09-29T12:30'),
        input_zone: 'America/Los_Angeles',
        breaks: [{ start: la('2026-09-29T11:00'), end: la('2026-09-29T11:15'), counts_as_work: false }],
        breaks_confirmed: true,
      },
    });
    expect(response.status).toBe(201);
  });

  it('Clock out keeps shape errors typed as break_outside_session for a submitted break after the clock-out instant', async () => {
    const { t, cookie } = await setup();
    const created = await t.request('POST', '/api/days/2026-09-29/sessions', { cookie, body: openBody([]) });
    const out = await t.request('POST', '/api/clock/out', {
      cookie,
      body: {
        breaks: [breakEndingAt(PAST_ALLOWANCE)],
        breaks_confirmed: true,
        expected_version: created.body.session.version,
      },
    });
    expect(out.status).toBe(422);
    expect(out.body.error.code).toBe('break_outside_session');
    expect(t.db.prepare('SELECT end_utc FROM work_sessions').pluck().get()).toBeNull();
  });
});
