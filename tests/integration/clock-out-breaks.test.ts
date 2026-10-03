import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * F-01 regression: Clock out with breaks_confirmed:true must replace the stored break
 * set with the submitted set (including the explicit empty set), exactly like a session
 * edit, instead of appending to it. Break rows reach the engine as the session's actual
 * breaks, so a retained row silently changes overtime.
 */

let t: TestContext | undefined;

afterEach(() => t?.close());

const SAVED_BREAK = { start: la('2026-09-29T11:00'), end: la('2026-09-29T11:15'), counts_as_work: false };
const CLOCK_OUT_AT = '2026-09-30T01:16:00Z'; // 18:16 in Los Angeles

/** Fresh state: an open 09:00 session carrying one saved, still unconfirmed 11:00–11:15 break. */
async function openSessionWithSavedBreak() {
  t = await createTestContext('2026-09-29T20:00:00Z');
  const cookie = await t.login('employee');
  const created = await t.request('POST', '/api/days/2026-09-29/sessions', {
    cookie,
    body: {
      start: la('2026-09-29T09:00'),
      end: null,
      input_zone: 'America/Los_Angeles',
      breaks: [SAVED_BREAK],
      breaks_confirmed: false,
    },
  });
  expect(created.status).toBe(201);
  expect(created.body.session.breaks).toHaveLength(1);
  t.clock.set(CLOCK_OUT_AT);
  return { t, cookie, sessionId: created.body.session.id as string };
}

function storedBreaks(db: TestContext['db'], sessionId: string) {
  return db
    .prepare('SELECT start_utc, end_utc, counts_as_work FROM session_breaks WHERE session_id = ? ORDER BY start_utc')
    .all(sessionId) as Array<{ start_utc: string; end_utc: string; counts_as_work: number }>;
}

function auditFor(db: TestContext['db'], sessionId: string) {
  return db
    .prepare('SELECT operation, before_json, after_json FROM audit_events WHERE entity_id = ? ORDER BY rowid')
    .all(sessionId) as Array<{ operation: string; before_json: string | null; after_json: string | null }>;
}

describe('Clock out replaces the stored break set when breaks are confirmed (F-01)', () => {
  it('F-01A: confirming the already saved break closes the session with exactly one break (R 541, credit 60)', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await t.request('POST', '/api/clock/out', {
      cookie,
      body: { breaks: [SAVED_BREAK], breaks_confirmed: true },
    });
    expect(out.status).toBe(200);
    expect(out.body.session).toMatchObject({
      id: sessionId,
      end_utc: '2026-09-30T01:16:00Z',
      breaks_confirmed: true,
      version: 2,
    });
    expect(out.body.session.breaks).toHaveLength(1);
    expect(out.body.session.breaks[0]).toMatchObject({
      start_utc: '2026-09-29T18:00:00Z',
      end_utc: '2026-09-29T18:15:00Z',
      counts_as_work: false,
    });
    expect(out.body.day.calculation).toMatchObject({
      status: 'complete',
      regular_minutes: 541,
      eligible_minutes: 61,
      credited_minutes: 60,
      excluded_break_seconds: 900,
    });
    expect(storedBreaks(t.db, sessionId)).toHaveLength(1);
  });

  it('F-01B: confirming zero breaks clears the saved break (R 556, E 76, credit 90)', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true } });
    expect(out.status).toBe(200);
    expect(out.body.session).toMatchObject({ end_utc: '2026-09-30T01:16:00Z', breaks_confirmed: true, breaks: [] });
    expect(out.body.day.calculation).toMatchObject({
      status: 'complete',
      regular_minutes: 556,
      eligible_minutes: 76,
      credited_minutes: 90,
      excluded_break_seconds: 0,
    });
    expect(storedBreaks(t.db, sessionId)).toEqual([]);
    // The recomputed day read agrees with the command response.
    const day = await t.request('GET', '/api/days/2026-09-29', { cookie });
    expect(day.body.calculation).toMatchObject({ regular_minutes: 556, credited_minutes: 90 });
  });

  it('replaces rather than appends: a different submitted break becomes the only stored break', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await t.request('POST', '/api/clock/out', {
      cookie,
      body: {
        breaks: [{ start: la('2026-09-29T13:00'), end: la('2026-09-29T13:30'), counts_as_work: false }],
        breaks_confirmed: true,
      },
    });
    expect(out.status).toBe(200);
    expect(storedBreaks(t.db, sessionId)).toEqual([
      { start_utc: '2026-09-29T20:00:00Z', end_utc: '2026-09-29T20:30:00Z', counts_as_work: 0 },
    ]);
    // 9h16m minus 30 minutes = 526 regular minutes; the saved 11:00 break no longer counts.
    expect(out.body.day.calculation).toMatchObject({ regular_minutes: 526, excluded_break_seconds: 1800 });
  });

  it('records one clock_out audit event whose before/after show the replaced break set', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const before = auditFor(t.db, sessionId).length;
    await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true } });
    const events = auditFor(t.db, sessionId);
    expect(events).toHaveLength(before + 1);
    const event = events[events.length - 1];
    expect(event?.operation).toBe('work_session.clock_out');
    const beforeJson = JSON.parse(event?.before_json ?? 'null');
    const afterJson = JSON.parse(event?.after_json ?? 'null');
    expect(beforeJson).toMatchObject({ end_utc: null, breaks_confirmed: false, version: 1 });
    expect(beforeJson.breaks).toHaveLength(1);
    expect(afterJson).toMatchObject({ end_utc: '2026-09-30T01:16:00Z', breaks_confirmed: true, version: 2, breaks: [] });
  });

  it('keeps the saved breaks and the pending state when the breaks stay unconfirmed', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: false } });
    expect(out.status).toBe(200);
    expect(out.body.session).toMatchObject({ end_utc: '2026-09-30T01:16:00Z', breaks_confirmed: false });
    expect(out.body.session.breaks).toHaveLength(1);
    expect(out.body.day.calculation).toMatchObject({ status: 'incomplete_breaks', credited_minutes: null });
    expect(storedBreaks(t.db, sessionId)).toHaveLength(1);
  });

  it('rolls back completely when the submitted set is invalid: still open, saved break intact, no audit event', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const auditBefore = auditFor(t.db, sessionId).length;
    const timesheetVersion = t.db.prepare('SELECT version FROM timesheets').pluck().get();
    const expectRejected = async (breaks: unknown[], code: string) => {
      const response = await t.request('POST', '/api/clock/out', { cookie, body: { breaks, breaks_confirmed: true } });
      expect(response.status, code).toBe(422);
      expect(response.body.error.code).toBe(code);
      const row = t.db.prepare('SELECT end_utc, breaks_confirmed, version FROM work_sessions WHERE id = ?').get(sessionId);
      expect(row).toEqual({ end_utc: null, breaks_confirmed: 0, version: 1 });
      expect(storedBreaks(t.db, sessionId)).toEqual([
        { start_utc: '2026-09-29T18:00:00Z', end_utc: '2026-09-29T18:15:00Z', counts_as_work: 0 },
      ]);
      expect(auditFor(t.db, sessionId)).toHaveLength(auditBefore);
      expect(t.db.prepare('SELECT version FROM timesheets').pluck().get()).toBe(timesheetVersion);
    };
    await expectRejected(
      [{ start: la('2026-09-30T20:00'), end: la('2026-09-30T20:15'), counts_as_work: false }],
      'break_outside_session',
    );
    await expectRejected(
      [
        { start: la('2026-09-29T13:00'), end: la('2026-09-29T13:30'), counts_as_work: false },
        { start: la('2026-09-29T13:15'), end: la('2026-09-29T13:45'), counts_as_work: false },
      ],
      'overlapping_breaks',
    );
    // The session is still open and can be clocked out correctly afterwards.
    const out = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true } });
    expect(out.status).toBe(200);
    expect(out.body.day.calculation).toMatchObject({ regular_minutes: 556, credited_minutes: 90 });
  });
});
