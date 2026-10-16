import { describe, expect, it } from 'vitest';
import type { Calculation, DayView, PolicyVersion, Session } from '../../src/client/api.ts';
import {
  cardBreaksText,
  confirmBreaksDraft,
  dayBanner,
  deleteFacts,
  editorChips,
  editorTitle,
  quickBreaksOf,
  quickBreaksRequest,
  sessionCardOf,
} from '../../src/client/components/dayEditorModel.ts';
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

describe('the "Confirm breaks" entry opens the form with the one-tap choice selected (WP5-UX3-T07)', () => {
  it('saving the draft unchanged sends the body the one-tap "confirm" sent: suggested rows, version and reason', () => {
    const saved = session();
    const quick = quickBreaksOf(saved, POLICY, HCM);
    if (quick === null) throw new Error('a quick confirmation is expected');
    const draft = confirmBreaksDraft(saved, quick);
    expect(draft.mode).toBe('confirmed');
    expect(draft.zone).toBe(LA);
    expect(buildSessionRequest(draft, { expectedVersion: saved.version, reason: ' late entry ' })).toEqual(quickBreaksRequest(saved, quick, 'confirm', ' late entry '));
  });

  it('keeps the rows already listed with the session, as the one-tap "confirm as listed" did', () => {
    const listed = session({ breaks: [{ id: 'b1', start_utc: '2026-09-21T19:00:00Z', end_utc: '2026-09-21T19:20:00Z', counts_as_work: false }] });
    const quick = quickBreaksOf(listed, POLICY, LA);
    if (quick === null) throw new Error('a quick confirmation is expected');
    const draft = confirmBreaksDraft(listed, quick);
    expect(draft.breaks).toHaveLength(1);
    expect(buildSessionRequest(draft, { expectedVersion: listed.version, reason: '' })).toEqual(quickBreaksRequest(listed, quick, 'confirm', ''));
  });

  it('selects "no breaks taken" when no suggested break fits, as the one-tap "none" did', () => {
    const short = session({ end_utc: '2026-09-21T17:30:00Z' });
    const quick = quickBreaksOf(short, POLICY, LA);
    if (quick === null) throw new Error('a quick confirmation is expected');
    const draft = confirmBreaksDraft(short, quick);
    expect(draft.mode).toBe('none');
    expect(draft.breaks).toEqual([]);
    expect(buildSessionRequest(draft, { expectedVersion: short.version, reason: '' })).toEqual(quickBreaksRequest(short, quick, 'none', ''));
  });
});

describe('the chips under the panel title (U-19, U-20)', () => {
  const zones = { displayZone: LA, reportingZone: LA, readOnly: false };

  it('names the period and the display zone, and the reporting zone only when the two zones differ', () => {
    expect(editorChips({ relation: 'future', ...zones })).toEqual([
      { key: 'period', text: 'future period', pill: 'future' },
      { key: 'times', text: `Times in ${LA}` },
    ]);
    const apart = editorChips({ relation: 'old', displayZone: HCM, reportingZone: LA, readOnly: false });
    expect(apart.map((chip) => chip.text)).toEqual(['old period', `Times in ${HCM}`, `Day in ${LA}`]);
    expect(editorChips({ relation: 'current', ...zones }).map((chip) => chip.key)).not.toContain('day');
  });

  it('adds "View only" while the editor cannot change anything', () => {
    expect(editorChips({ relation: 'current', ...zones, readOnly: true }).map((chip) => chip.text)).toEqual(['current period', `Times in ${LA}`, 'View only']);
    expect(editorChips({ relation: 'current', ...zones }).map((chip) => chip.key)).not.toContain('view-only');
  });

  it('takes the period bar pill when it is given, including "in progress", and the day relation otherwise', () => {
    expect(editorChips({ relation: 'future', pill: 'in-progress', ...zones })[0]).toEqual({ key: 'period', text: 'in progress', pill: 'in-progress' });
    expect(editorChips({ relation: 'old', pill: 'neutral', ...zones })[0]).toEqual({ key: 'period', text: 'old period', pill: 'old' });
  });

  it('titles the panel with the accounting date as the person reads it', () => {
    expect(editorTitle('2026-10-12')).toBe('Mon 10/12/2026');
    expect(editorTitle('2026-10-18')).toBe('Sun 10/18/2026');
  });
});

describe('the session cards of the panel (U-21)', () => {
  const brk = (id: string, start: string, end: string) => ({ id, start_utc: start, end_utc: end, counts_as_work: false });
  // 11:00-11:15, 13:00-13:30 and 15:30-15:45 Los Angeles (PDT) on 2026-09-21.
  const threeBreaks = [
    brk('b1', '2026-09-21T18:00:00Z', '2026-09-21T18:15:00Z'),
    brk('b2', '2026-09-21T20:00:00Z', '2026-09-21T20:30:00Z'),
    brk('b3', '2026-09-21T22:30:00Z', '2026-09-21T22:45:00Z'),
  ];

  it('a session with confirmed breaks is "Breaks confirmed" with its table in the display zone and the saved minutes', () => {
    const card = sessionCardOf(session({ breaks_confirmed: true, breaks: threeBreaks }), '2026-09-21', LA);
    expect(card).toMatchObject({ state: 'confirmed', stateText: 'Breaks confirmed', range: '09:00-18:30', startDate: null, emptyText: null, attentionText: null, runningText: null });
    expect(card.caption).toBe('Breaks of 09:00-18:30');
    expect(card.breaks.map((item) => [item.number, item.date, item.start, item.minutes])).toEqual([
      [1, '09/21', '11:00', 15],
      [2, '09/21', '13:00', 30],
      [3, '09/21', '15:30', 15],
    ]);
    expect(cardBreaksText(card)).toBe('3 breaks (15, 30, 15 min)');
  });

  it('shows the same breaks in another display zone, with their date there and the end on a later local day as +1', () => {
    // Ho Chi Minh is UTC+7: the session reads 23:00 to 08:30 the next day and the breaks start at 01:00, 03:00 and 05:30 on 09/22.
    const card = sessionCardOf(session({ breaks_confirmed: true, breaks: threeBreaks }), '2026-09-21', HCM);
    expect(card.range).toBe('23:00-08:30+1');
    expect(card.breaks.map((item) => `${item.date} ${item.start}`)).toEqual(['09/22 01:00', '09/22 03:00', '09/22 05:30']);
    expect(card.breaks.map((item) => item.minutes)).toEqual([15, 30, 15]);
  });

  it('a session confirmed without breaks is "No breaks taken", with its empty state and no table rows', () => {
    const card = sessionCardOf(session({ breaks_confirmed: true }), '2026-09-21', LA);
    expect(card).toMatchObject({ state: 'none', stateText: 'No breaks taken', emptyText: 'No breaks taken', attentionText: null });
    expect(card.breaks).toEqual([]);
    expect(cardBreaksText(card)).toBe('No breaks taken');
  });

  it('a session whose breaks are not confirmed asks for them: OT stays pending, listed rows are still shown', () => {
    const bare = sessionCardOf(session(), '2026-09-21', LA);
    expect(bare).toMatchObject({ state: 'unconfirmed', stateText: 'Breaks not confirmed', attentionText: 'OT stays pending until breaks are confirmed.', emptyText: null });
    expect(cardBreaksText(bare)).toBe('Breaks not confirmed');
    const listed = sessionCardOf(session({ breaks: threeBreaks.slice(0, 1) }), '2026-09-21', LA);
    expect(listed.state).toBe('unconfirmed');
    expect(listed.breaks).toHaveLength(1);
    expect(cardBreaksText(listed)).toBe('1 break (15 min), not confirmed');
  });

  it('a running session shows "Running since" and no table, whatever its breaks', () => {
    const card = sessionCardOf(session({ end_utc: null, breaks: threeBreaks }), '2026-09-21', LA);
    expect(card).toMatchObject({ state: 'running', stateText: 'Running', range: '09:00', runningText: 'Running since 09:00', attentionText: null });
    expect(card.breaks).toEqual([]);
  });

  it('names where the session came from: entered by hand in its input zone, or checked in and out', () => {
    expect(sessionCardOf(session(), '2026-09-21', HCM).source).toBe(`Entered by hand in ${LA}`);
    expect(sessionCardOf(session({ source: 'clock' }), '2026-09-21', HCM).source).toBe('Checked in and out');
  });

  it('marks a session that starts on another local date than its accounting date', () => {
    // The session starts at 22:30 on 09/20 in Los Angeles: on its own accounting date 09/20 nothing is added, on 09/21 the start date is.
    const card = sessionCardOf(session({ start_utc: '2026-09-21T05:30:00Z', end_utc: '2026-09-21T09:30:00Z' }), '2026-09-20', LA);
    expect(card.startDate).toBeNull();
    const other = sessionCardOf(session({ start_utc: '2026-09-21T05:30:00Z', end_utc: '2026-09-21T09:30:00Z' }), '2026-09-21', LA);
    expect(other.startDate).toBe('09/20');
  });

  it('lists the day, the time with its zone and the breaks of a session for the delete confirmation', () => {
    const facts = deleteFacts(session({ breaks_confirmed: true, breaks: threeBreaks }), '2026-09-21', LA);
    expect(facts).toEqual([
      { label: 'Day', value: 'Mon 09/21/2026' },
      { label: 'Time', value: `09:00-18:30 (${LA})` },
      { label: 'Breaks', value: '3 breaks (15, 30, 15 min)' },
    ]);
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
