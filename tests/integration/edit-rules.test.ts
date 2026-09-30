import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCalendarVersion } from '../../src/server/services/calendars.ts';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * R-07 and FR-14 through the API: current/future drafts need no reason; old or
 * finalized periods do; every change is audited with actor, UTC time, before/after and
 * reason; optimistic versions reject stale writes; versions apply prospectively.
 */

let t: TestContext;
let cookie: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  cookie = await t.login('employee');
});

afterEach(() => t.close());

function session(date: string, from: string, to: string, extra: Record<string, unknown> = {}) {
  return {
    start: la(`${date}T${from}`),
    end: la(`${date}T${to}`),
    input_zone: 'America/Los_Angeles',
    breaks: [],
    breaks_confirmed: true,
    ...extra,
  };
}

const day = (category: string, extra: Record<string, unknown> = {}) => ({ category, leave_minutes: 0, wfh: false, notes: '', ...extra });

function auditRows(entityId: string) {
  return t.db
    .prepare(
      'SELECT operation, actor_user_id, owner_user_id, occurred_at, reason, before_json, after_json FROM audit_events WHERE entity_id = ? ORDER BY rowid',
    )
    .all(entityId) as Array<{
    operation: string;
    actor_user_id: string;
    owner_user_id: string;
    occurred_at: string;
    reason: string | null;
    before_json: string | null;
    after_json: string | null;
  }>;
}

describe('edit reasons (R-07, TM-25…TM-28)', () => {
  it('needs no reason for the current period (payroll 2026-10-02) and audits anyway', async () => {
    const created = await t.request('POST', '/api/days/2026-09-21/sessions', { cookie, body: session('2026-09-21', '09:00', '12:00') });
    expect(created.status).toBe(201);
    expect(created.body.day.edit).toEqual({ period_relation: 'current', reason_required: false });
    const [event] = auditRows(created.body.session.id);
    expect(event).toMatchObject({
      operation: 'work_session.create',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      occurred_at: '2026-09-29T20:00:00Z',
      reason: null,
      before_json: null,
    });
    expect(JSON.parse(event?.after_json ?? '{}')).toMatchObject({ start_utc: '2026-09-21T16:00:00Z', end_utc: '2026-09-21T19:00:00Z' });
  });

  it('needs no reason for a future period', async () => {
    const response = await t.request('PUT', '/api/days/2026-10-05', { cookie, body: day('Vacation') });
    expect(response.status).toBe(200);
    expect(response.body.edit).toEqual({ period_relation: 'future', reason_required: false });
  });

  it('requires a reason for an older, still unsent period and stores it in the audit trail', async () => {
    const body = session('2026-09-02', '09:00', '17:00');
    const refused = await t.request('POST', '/api/days/2026-09-02/sessions', { cookie, body });
    expect(refused.status).toBe(422);
    expect(refused.body.error).toMatchObject({
      code: 'reason_required',
      details: { period_relation: 'old', finalized: false, payroll_date: '2026-09-18' },
    });
    const blank = await t.request('POST', '/api/days/2026-09-02/sessions', { cookie, body: { ...body, reason: '   ' } });
    expect(blank.body.error.code).toBe('reason_required');
    expect(t.db.prepare('SELECT count(*) FROM work_sessions').pluck().get()).toBe(0);
    const accepted = await t.request('POST', '/api/days/2026-09-02/sessions', {
      cookie,
      body: { ...body, reason: 'Forgot to record the site visit' },
    });
    expect(accepted.status).toBe(201);
    const events = auditRows(accepted.body.session.id);
    expect(events.map((event) => [event.operation, event.reason])).toEqual([
      ['work_session.create', 'Forgot to record the site visit'],
    ]);
    const update = await t.request('PUT', `/api/sessions/${accepted.body.session.id}`, {
      cookie,
      body: { ...session('2026-09-02', '09:00', '17:30'), expected_version: 1 },
    });
    expect(update.body.error.code).toBe('reason_required');
    const remove = await t.request('DELETE', `/api/sessions/${accepted.body.session.id}`, { cookie, body: { expected_version: 1 } });
    expect(remove.body.error.code).toBe('reason_required');
  });

  it('requires a reason for any edit once the timesheet has a finalized revision', async () => {
    const created = await t.request('PUT', '/api/days/2026-09-22', { cookie, body: day('Worked') });
    expect(created.status).toBe(200);
    // WP3 sets this during finalization; simulated here to exercise the WP1 rule.
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1 WHERE user_id = ?').run(t.userIds.employee);
    const refused = await t.request('PUT', '/api/days/2026-09-22', { cookie, body: day('Sick', { expected_version: 1 }) });
    expect(refused.status).toBe(422);
    expect(refused.body.error.details).toMatchObject({ period_relation: 'current', finalized: true });
    const accepted = await t.request('PUT', '/api/days/2026-09-22', {
      cookie,
      body: day('Sick', { expected_version: 1, reason: 'Correction: was sick, not working' }),
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body.edit).toEqual({ period_relation: 'current', reason_required: true });
    const events = auditRows(accepted.body.entry.id);
    const last = events.at(-1);
    expect(last).toMatchObject({ operation: 'day_entry.update', reason: 'Correction: was sick, not working' });
    expect(JSON.parse(last?.before_json ?? '{}')).toMatchObject({ category: 'Worked', version: 1 });
    expect(JSON.parse(last?.after_json ?? '{}')).toMatchObject({ category: 'Sick', version: 2 });
  });
});

describe('optimistic versions and audit history', () => {
  it('rejects stale session and day writes with 409 stale_version', async () => {
    const created = await t.request('POST', '/api/days/2026-09-21/sessions', { cookie, body: session('2026-09-21', '09:00', '12:00') });
    const id = created.body.session.id;
    const first = await t.request('PUT', `/api/sessions/${id}`, {
      cookie,
      body: { ...session('2026-09-21', '09:00', '12:30'), expected_version: 1 },
    });
    expect(first.body.session.version).toBe(2);
    const stale = await t.request('PUT', `/api/sessions/${id}`, {
      cookie,
      body: { ...session('2026-09-21', '09:00', '13:00'), expected_version: 1 },
    });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
    const staleDelete = await t.request('DELETE', `/api/sessions/${id}`, { cookie, body: { expected_version: 1 } });
    expect(staleDelete.status).toBe(409);
    const dayCreate = await t.request('PUT', '/api/days/2026-09-21', { cookie, body: day('Worked') });
    expect(dayCreate.status).toBe(409);
    const deleted = await t.request('DELETE', `/api/sessions/${id}`, { cookie, body: { expected_version: 2 } });
    expect(deleted.status).toBe(200);
    expect(auditRows(id).map((event) => event.operation)).toEqual([
      'work_session.create',
      'work_session.update',
      'work_session.delete',
    ]);
    const deletion = auditRows(id).at(-1);
    expect(JSON.parse(deletion?.before_json ?? '{}')).toMatchObject({ end_utc: '2026-09-21T19:30:00Z', version: 2 });
    expect(deletion?.after_json).toBeNull();
  });

  it('bumps the timesheet version on every change for later review conflicts', async () => {
    const before = await t.request('GET', '/api/timesheets/2026-10-02', { cookie });
    expect(before.body.timesheet).toEqual({ id: null, version: 0, finalized: false });
    await t.request('PUT', '/api/days/2026-09-21', { cookie, body: day('Worked', { wfh: true }) });
    await t.request('POST', '/api/days/2026-09-21/sessions', { cookie, body: session('2026-09-21', '09:00', '12:00') });
    const after = await t.request('GET', '/api/timesheets/2026-10-02', { cookie });
    expect(after.body.timesheet.version).toBe(3);
    // GET requests never create rows.
    await t.request('GET', '/api/timesheets/2026-10-16', { cookie });
    expect(t.db.prepare('SELECT count(*) FROM timesheets').pluck().get()).toBe(1);
  });
});

describe('versioned policies and calendars (R-07 history)', () => {
  const policy = (effective: string, overrides: Record<string, unknown> = {}) => ({
    effective_from: effective,
    required_minutes: 480,
    threshold_minutes: 0,
    rounding_step_minutes: 15,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: [
      { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
      { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
      { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
    ],
    deficit_mode: 'ignore',
    ...overrides,
  });

  it('applies a new policy prospectively while earlier days keep their historical rules', async () => {
    const retro = await t.request('POST', '/api/policies', { cookie, body: policy('2026-09-01') });
    expect(retro.status).toBe(422);
    expect(retro.body.error).toMatchObject({ code: 'retroactive_change', details: { earliest_effective_from: '2026-09-14' } });
    const created = await t.request('POST', '/api/policies', { cookie, body: policy('2026-09-28') });
    expect(created.status).toBe(201);
    // 08:00–17:40 (580 min) with 60 excluded = R 520 → E 40.
    const withBreaks = (date: string) =>
      session(date, '08:00', '17:40', {
        breaks: [
          { start: la(`${date}T10:00`), end: la(`${date}T10:15`), counts_as_work: false },
          { start: la(`${date}T12:00`), end: la(`${date}T12:30`), counts_as_work: false },
          { start: la(`${date}T14:30`), end: la(`${date}T14:45`), counts_as_work: false },
        ],
      });
    const oldRules = await t.request('POST', '/api/days/2026-09-25/sessions', { cookie, body: withBreaks('2026-09-25') });
    const newRules = await t.request('POST', '/api/days/2026-09-28/sessions', { cookie, body: withBreaks('2026-09-28') });
    const seedPolicyId = (await t.request('GET', '/api/policies', { cookie })).body.policies[0].id;
    // Seed policy N=30/M=30: 40 → 30. New policy N=0/M=15: 40 → 45.
    expect(oldRules.body.day.calculation).toMatchObject({ eligible_minutes: 40, credited_minutes: 30, policy_version_id: seedPolicyId });
    expect(newRules.body.day.calculation).toMatchObject({
      eligible_minutes: 40,
      credited_minutes: 45,
      policy_version_id: created.body.policy.id,
    });
  });

  it('validates policy values with the documented error codes', async () => {
    const codes: Array<[number, string]> = [];
    for (const overrides of [
      { required_minutes: 0 },
      { threshold_minutes: -1 },
      { rounding_step_minutes: 7.5 },
      { reference_end: '16:30' },
    ]) {
      const response = await t.request('POST', '/api/policies', { cookie, body: policy('2026-10-05', overrides) });
      codes.push([response.status, response.body.error.code]);
    }
    expect(codes).toEqual([
      [422, 'invalid_required_minutes'],
      [422, 'invalid_threshold_minutes'],
      [422, 'invalid_rounding_step'],
      [422, 'inconsistent_reference_schedule'],
    ]);
  });

  it('classifies each date with the calendar version effective on it and refuses retroactive calendar versions', async () => {
    expect(() =>
      createCalendarVersion(t.db, t.clock, { calendarId: t.calendarId, effectiveFrom: '2026-09-01', weekdays: [1, 2, 3, 4, 5], dates: [] }, t.userIds.admin),
    ).toThrow(/on or after 2026-09-14/);
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: '2026-09-28',
        weekdays: [1, 2, 3, 4, 5],
        dates: [{ date: '2026-10-09', kind: 'closure', name: 'Synthetic closure' }],
      },
      t.userIds.admin,
    );
    const sheet = await t.request('GET', '/api/timesheets/2026-10-16', { cookie });
    const closure = sheet.body.days.find((item: { work_date: string }) => item.work_date === '2026-10-09');
    expect(closure).toMatchObject({ classification: { day_class: 'nonworking', reason: 'closure' }, default_category: 'Shutdown' });
    const labor = await t.request('GET', '/api/days/2026-09-07', { cookie });
    const versions = (await t.request('GET', '/api/calendar', { cookie })).body.versions;
    expect(labor.body.classification.calendar_version_id).toBe(versions[0].id);
    expect(closure.classification.calendar_version_id).toBe(versions[1].id);
  });
});
