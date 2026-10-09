import { describe, expect, it } from 'vitest';
import type { Calculation, DayView, PolicyVersion, Session } from '../../src/client/api.ts';
import { dayBanner, quickBreaksOf, quickBreaksRequest } from '../../src/client/components/dayEditorModel.ts';
import { buildSessionRequest, draftFromSession, resolveStart, suggestedRows } from '../../src/client/components/sessionModel.ts';

const LA = 'America/Los_Angeles';
const HCM = 'Asia/Ho_Chi_Minh';

const DEFAULT_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

const POLICY: PolicyVersion = {
  id: 'policy-1',
  seq: 1,
  effective_from: '2026-01-01',
  required_minutes: 480,
  threshold_minutes: 30,
  rounding_step_minutes: 30,
  reference_start: '08:00',
  reference_end: '17:00',
  breaks: DEFAULT_BREAKS,
};

/** 09:00 to 18:30 Los Angeles (PDT) on 2026-09-21, breaks not confirmed. */
function session(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    work_date: '2026-09-21',
    start_utc: '2026-09-21T16:00:00Z',
    end_utc: '2026-09-22T01:30:00Z',
    input_zone: LA,
    source: 'manual',
    breaks_confirmed: false,
    version: 4,
    breaks: [],
    ...overrides,
  };
}

function calculation(status: Calculation['status']): Calculation {
  return {
    status,
    provisional: true,
    policy_version_id: 'policy-1',
    gross_seconds: 0,
    excluded_break_seconds: 0,
    regular_seconds: 0,
    nonworking_seconds: 0,
    regular_minutes: null,
    nonworking_minutes: null,
    normal_excess_minutes: null,
    eligible_minutes: null,
    credited_minutes: null,
    segments: [],
  };
}

function day(overrides: Partial<DayView> = {}): DayView {
  return {
    work_date: '2026-09-21',
    classification: { day_class: 'normal', reason: 'scheduled_weekday', name: null },
    default_category: 'Worked',
    category: 'Worked',
    category_source: 'default',
    attendance_expected: true,
    leave_minutes: 0,
    leave_kind: null,
    wfh: false,
    ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    entry: null,
    sessions: [],
    calculation: null,
    calculation_error: null,
    deficit_minutes: null,
    edit: { period_relation: 'current', reason_required: false },
    ...overrides,
  };
}

describe('one-tap break confirmation of a saved session (R-02)', () => {
  it('suggests the policy breaks shifted by the session start, shown in the display zone (R-07)', () => {
    const quick = quickBreaksOf(session(), POLICY, LA);
    expect(quick?.kind).toBe('suggested');
    expect(quick?.chips).toEqual(['11:00-11:15', '13:00-13:30', '15:30-15:45']);
    // The same breaks seen from Ho Chi Minh City (UTC+7); the rows stay in the session's input zone.
    expect(quickBreaksOf(session(), POLICY, HCM)?.chips).toEqual(['01:00-01:15', '03:00-03:30', '05:30-05:45']);
    expect(quickBreaksOf(session(), POLICY, HCM)?.rows.map((row) => row.start.time)).toEqual(['11:00', '13:00', '15:30']);
  });

  it('sends exactly the body of the form flow: Suggest breaks, Confirm suggested breaks, Save changes', () => {
    const saved = session();
    const quick = quickBreaksOf(saved, POLICY, HCM);
    if (quick === null) throw new Error('a quick confirmation is expected');
    const viaQuick = quickBreaksRequest(saved, quick, 'confirm', ' late entry ');

    const draft = draftFromSession(saved);
    const start = resolveStart(draft);
    if (!start.ok) throw new Error('start must resolve');
    const viaForm = buildSessionRequest(
      { ...draft, breaks: suggestedRows(start.utc, draft.zone, POLICY.breaks, String), mode: 'confirmed' },
      { expectedVersion: saved.version, reason: ' late entry ' },
    );
    expect(viaQuick).toEqual(viaForm);
    expect(viaQuick).toMatchObject({
      start: { local: '2026-09-21T09:00', zone: LA, offset: '-07:00' },
      end: { local: '2026-09-21T18:30', zone: LA, offset: '-07:00' },
      input_zone: LA,
      breaks_confirmed: true,
      expected_version: 4,
      reason: 'late entry',
    });
    expect(viaQuick.breaks.map((item) => item.start.local)).toEqual(['2026-09-21T11:00', '2026-09-21T13:00', '2026-09-21T15:30']);
  });

  it('confirms no breaks with an empty, confirmed list and no reason when none is typed', () => {
    const saved = session();
    const quick = quickBreaksOf(saved, POLICY, LA);
    if (quick === null) throw new Error('a quick confirmation is expected');
    const body = quickBreaksRequest(saved, quick, 'none', '');
    expect(body.breaks).toEqual([]);
    expect(body.breaks_confirmed).toBe(true);
    expect(body.expected_version).toBe(4);
    expect('reason' in body).toBe(false);
  });

  it('offers the rows already listed with the session instead of new suggestions', () => {
    const listed = session({ breaks: [{ id: 'b1', start_utc: '2026-09-21T19:00:00Z', end_utc: '2026-09-21T19:20:00Z', counts_as_work: false }] });
    const quick = quickBreaksOf(listed, POLICY, LA);
    expect(quick?.kind).toBe('listed');
    expect(quick?.chips).toEqual(['12:00-12:20']);
    if (quick === null) throw new Error('a quick confirmation is expected');
    expect(quickBreaksRequest(listed, quick, 'confirm', '').breaks).toEqual([
      { start: { local: '2026-09-21T12:00', zone: LA, offset: '-07:00' }, end: { local: '2026-09-21T12:20', zone: LA, offset: '-07:00' }, counts_as_work: false },
    ]);
  });

  it('offers only "no breaks" when a suggestion would fall outside the session or no policy breaks exist', () => {
    // 09:00 to 10:30: the first suggested break (11:00) is after the end; never deduct future breaks.
    expect(quickBreaksOf(session({ end_utc: '2026-09-21T17:30:00Z' }), POLICY, LA)).toEqual({ kind: 'none', rows: [], chips: [] });
    expect(quickBreaksOf(session(), undefined, LA)?.kind).toBe('none');
    expect(quickBreaksOf(session(), { ...POLICY, breaks: [] }, LA)?.kind).toBe('none');
  });

  it('offers nothing for a running session or one whose breaks are already confirmed', () => {
    expect(quickBreaksOf(session({ end_utc: null }), POLICY, LA)).toBeNull();
    expect(quickBreaksOf(session({ breaks_confirmed: true }), POLICY, LA)).toBeNull();
  });
});

describe('the editor banner', () => {
  it('says what the day still needs, from the server status only', () => {
    expect(dayBanner(day())).toBeNull();
    expect(dayBanner(day({ calculation: calculation('complete') }))).toBeNull();
    const breaks = dayBanner(day({ calculation: calculation('incomplete_breaks') }));
    expect(breaks?.tone).toBe('attention');
    expect(breaks?.text).toContain('Breaks are not confirmed yet.');
    expect(breaks?.text).toContain('OT for this day stays pending');
    expect(dayBanner(day({ calculation: calculation('incomplete') }))?.text).toContain('A session has no end yet.');
    expect(dayBanner(day({ calculation_error: 'policy_missing' }))).toEqual({ tone: 'error', text: 'Calculation: policy missing.' });
  });
});
