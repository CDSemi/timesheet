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

/** Clock out for the freshly opened session (version 1) unless a body field overrides it. */
function clockOut(t: TestContext, cookie: string, body: Record<string, unknown>) {
  return t.request('POST', '/api/clock/out', { cookie, body: { expected_version: 1, ...body } });
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
    const out = await clockOut(t, cookie, { breaks: [SAVED_BREAK], breaks_confirmed: true });
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
    const out = await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
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
    const out = await clockOut(t, cookie, {
      breaks: [{ start: la('2026-09-29T13:00'), end: la('2026-09-29T13:30'), counts_as_work: false }],
      breaks_confirmed: true,
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
    await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
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

  it('keeps the saved breaks and the pending state when an unconfirmed Clock out omits the list', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await clockOut(t, cookie, { breaks_confirmed: false });
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
      const response = await clockOut(t, cookie, { breaks, breaks_confirmed: true });
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
    const out = await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
    expect(out.status).toBe(200);
    expect(out.body.day.calculation).toMatchObject({ regular_minutes: 556, credited_minutes: 90 });
  });
});

function breakRowsWithIds(db: TestContext['db'], sessionId: string) {
  return db
    .prepare('SELECT id, start_utc, end_utc, counts_as_work FROM session_breaks WHERE session_id = ? ORDER BY start_utc')
    .all(sessionId) as Array<{ id: string }>;
}

function sessionState(db: TestContext['db'], sessionId: string) {
  return db.prepare('SELECT end_utc, breaks_confirmed, version FROM work_sessions WHERE id = ?').get(sessionId);
}

const STILL_OPEN = { end_utc: null, breaks_confirmed: 0, version: 1 };
const SECOND_BREAK = { start: la('2026-09-29T13:00'), end: la('2026-09-29T13:30'), counts_as_work: false };

describe('Clock out break-list contract (WP2-T01, decision E-1)', () => {
  it('requires expected_version', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await t.request('POST', '/api/clock/out', { cookie, body: { breaks: [], breaks_confirmed: true } });
    expect(out.status).toBe(422);
    expect(out.body.error.code).toBe('validation_error');
    expect(sessionState(t.db, sessionId)).toEqual(STILL_OPEN);
  });

  it('returns 409 stale_version and rolls back when the session changed since it was loaded', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    // Another device edits the open session (version 1 -> 2) and saves a second break.
    const edit = await t.request('PUT', `/api/sessions/${sessionId}`, {
      cookie,
      body: {
        start: la('2026-09-29T09:00'),
        end: null,
        input_zone: 'America/Los_Angeles',
        breaks: [SAVED_BREAK, SECOND_BREAK],
        breaks_confirmed: false,
        expected_version: 1,
      },
    });
    expect(edit.status).toBe(200);
    const rowsBefore = breakRowsWithIds(t.db, sessionId);
    expect(rowsBefore).toHaveLength(2);
    const auditBefore = auditFor(t.db, sessionId).length;
    const timesheetVersion = t.db.prepare('SELECT version FROM timesheets').pluck().get();
    // The stale client still holds version 1 and confirms only the first break.
    const out = await clockOut(t, cookie, { breaks: [SAVED_BREAK], breaks_confirmed: true });
    expect(out.status).toBe(409);
    expect(out.body.error.code).toBe('stale_version');
    expect(sessionState(t.db, sessionId)).toEqual({ ...STILL_OPEN, version: 2 });
    expect(breakRowsWithIds(t.db, sessionId)).toEqual(rowsBefore);
    expect(auditFor(t.db, sessionId)).toHaveLength(auditBefore);
    expect(t.db.prepare('SELECT version FROM timesheets').pluck().get()).toBe(timesheetVersion);
    // The reloaded version succeeds.
    const retry = await clockOut(t, cookie, { breaks: [SAVED_BREAK], breaks_confirmed: true, expected_version: 2 });
    expect(retry.status).toBe(200);
    expect(retry.body.session.breaks).toHaveLength(1);
  });

  it('rejects a confirmed Clock out that omits the list', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await clockOut(t, cookie, { breaks_confirmed: true });
    expect(out.status).toBe(422);
    expect(out.body.error.code).toBe('breaks_required');
    expect(sessionState(t.db, sessionId)).toEqual(STILL_OPEN);
    expect(storedBreaks(t.db, sessionId)).toHaveLength(1);
  });

  it('treats an unconfirmed submitted list as the complete set: it replaces the saved rows and stays pending', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await clockOut(t, cookie, { breaks: [SECOND_BREAK], breaks_confirmed: false });
    expect(out.status).toBe(200);
    expect(out.body.session).toMatchObject({ breaks_confirmed: false });
    expect(storedBreaks(t.db, sessionId)).toEqual([
      { start_utc: '2026-09-29T20:00:00Z', end_utc: '2026-09-29T20:30:00Z', counts_as_work: 0 },
    ]);
    expect(out.body.day.calculation).toMatchObject({ status: 'incomplete_breaks', credited_minutes: null });
  });

  it('treats an unconfirmed empty list as present: it clears the saved rows and stays pending', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const out = await clockOut(t, cookie, { breaks: [], breaks_confirmed: false });
    expect(out.status).toBe(200);
    expect(storedBreaks(t.db, sessionId)).toEqual([]);
    expect(out.body.day.calculation).toMatchObject({ status: 'incomplete_breaks', credited_minutes: null });
  });

  it('rolls back a failure injected after the DELETE: the original break rows and IDs are restored', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const rowsBefore = breakRowsWithIds(t.db, sessionId);
    expect(rowsBefore).toHaveLength(1);
    const auditBefore = auditFor(t.db, sessionId).length;
    const timesheetVersion = t.db.prepare('SELECT version FROM timesheets').pluck().get();
    // The clock_out audit insert runs after the DELETE, the session UPDATE and the break
    // INSERT; failing it must undo all of them.
    t.db.exec(`CREATE TEMP TRIGGER fail_clock_out_audit BEFORE INSERT ON audit_events
      WHEN NEW.operation = 'work_session.clock_out' BEGIN SELECT RAISE(ABORT, 'injected_fault'); END`);
    const out = await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
    t.db.exec('DROP TRIGGER fail_clock_out_audit');
    expect(out.status).toBe(500);
    expect(sessionState(t.db, sessionId)).toEqual(STILL_OPEN);
    expect(breakRowsWithIds(t.db, sessionId)).toEqual(rowsBefore);
    expect(auditFor(t.db, sessionId)).toHaveLength(auditBefore);
    expect(t.db.prepare('SELECT version FROM timesheets').pluck().get()).toBe(timesheetVersion);
    // A retry on the intact session succeeds.
    const retry = await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
    expect(retry.status).toBe(200);
    expect(retry.body.day.calculation).toMatchObject({ regular_minutes: 556, credited_minutes: 90 });
  });

  it('answers 409 stale_version and rolls back when the session UPDATE changes no row', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    const rowsBefore = breakRowsWithIds(t.db, sessionId);
    const auditBefore = auditFor(t.db, sessionId).length;
    const timesheetVersion = t.db.prepare('SELECT version FROM timesheets').pluck().get();
    // Simulates a concurrent writer winning between the version read and the UPDATE.
    t.db.exec(`CREATE TEMP TRIGGER ignore_clock_out_update BEFORE UPDATE OF end_utc ON work_sessions
      WHEN OLD.end_utc IS NULL BEGIN SELECT RAISE(IGNORE); END`);
    const out = await clockOut(t, cookie, { breaks: [], breaks_confirmed: true });
    t.db.exec('DROP TRIGGER ignore_clock_out_update');
    expect(out.status).toBe(409);
    expect(out.body.error.code).toBe('stale_version');
    expect(sessionState(t.db, sessionId)).toEqual(STILL_OPEN);
    expect(breakRowsWithIds(t.db, sessionId)).toEqual(rowsBefore);
    expect(auditFor(t.db, sessionId)).toHaveLength(auditBefore);
    expect(t.db.prepare('SELECT version FROM timesheets').pluck().get()).toBe(timesheetVersion);
  });

  it('gives a legacy saved break that ends after the Clock out instant a typed 422 and changes nothing', async () => {
    const { t, cookie, sessionId } = await openSessionWithSavedBreak();
    // A row written before the future-break rule existed (direct insert; the API now refuses it).
    t.db
      .prepare(
        'INSERT INTO session_breaks (id, session_id, user_id, start_utc, end_utc, counts_as_work) VALUES (?, ?, ?, ?, ?, 0)',
      )
      .run('legacy-future-break', sessionId, t.userIds.employee, '2026-09-30T02:00:00Z', '2026-09-30T02:30:00Z');
    const rowsBefore = breakRowsWithIds(t.db, sessionId);
    expect(rowsBefore).toHaveLength(2);
    const auditBefore = auditFor(t.db, sessionId).length;
    const omitted = await clockOut(t, cookie, { breaks_confirmed: false });
    expect(omitted.status).toBe(422);
    expect(omitted.body.error.code).toBe('saved_break_after_clock_out');
    expect(omitted.body.error.details.break_ids).toEqual(['legacy-future-break']);
    expect(sessionState(t.db, sessionId)).toEqual(STILL_OPEN);
    expect(breakRowsWithIds(t.db, sessionId)).toEqual(rowsBefore);
    expect(auditFor(t.db, sessionId)).toHaveLength(auditBefore);
    // Resubmitting the complete list replaces the legacy rows and closes the session.
    const replaced = await clockOut(t, cookie, { breaks: [SAVED_BREAK], breaks_confirmed: true });
    expect(replaced.status).toBe(200);
    expect(storedBreaks(t.db, sessionId)).toHaveLength(1);
    expect(replaced.body.day.calculation).toMatchObject({ regular_minutes: 541, credited_minutes: 60 });
  });
});
