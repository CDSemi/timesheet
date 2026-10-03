import { describe, expect, it } from 'vitest';
import type { Calculation, DayView, PolicyVersion, Session } from '../../src/client/api.ts';
import {
  applyFold,
  applyGapReplacement,
  breaksGap,
  buildClockOutRequest,
  buildDayEntryRequest,
  buildSessionRequest,
  chosenFold,
  dayFieldsDraft,
  dayFigures,
  draftFromSession,
  draftGap,
  editField,
  emptyField,
  expectedFinishText,
  gapReplacement,
  leaveHint,
  newSessionDraft,
  otMismatchNotice,
  policyOn,
  problemApplies,
  resolveStart,
  type SessionDraft,
  suggestedRows,
  timeProblemOf,
  toLocalInput,
} from '../../src/client/components/sessionModel.ts';

const LA = 'America/Los_Angeles';
const SYDNEY = 'Australia/Sydney';

function field(date: string, time: string, extra: { fold?: 0 | 1 | null; offset?: string | null } = {}) {
  return { date, time, fold: extra.fold ?? null, offset: extra.offset ?? null };
}

function draft(overrides: Partial<SessionDraft> = {}): SessionDraft {
  return {
    zone: LA,
    start: field('2026-09-21', '09:00'),
    end: field('2026-09-21', '18:00'),
    breaks: [],
    mode: 'pending',
    ...overrides,
  };
}

const DEFAULT_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function policy(effectiveFrom: string, seq: number, required = 480): PolicyVersion {
  return {
    id: `policy-${seq}`,
    seq,
    effective_from: effectiveFrom,
    required_minutes: required,
    threshold_minutes: 30,
    rounding_step_minutes: 30,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: DEFAULT_BREAKS,
  };
}

function savedSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    work_date: '2026-09-21',
    start_utc: '2026-09-21T16:00:00Z',
    end_utc: '2026-09-22T01:00:00Z',
    input_zone: LA,
    source: 'manual',
    breaks_confirmed: true,
    version: 4,
    breaks: [],
    ...overrides,
  };
}

function calculation(overrides: Partial<Calculation> = {}): Calculation {
  return {
    status: 'complete',
    provisional: true,
    policy_version_id: 'policy-1',
    gross_seconds: 0,
    excluded_break_seconds: 0,
    regular_seconds: 0,
    nonworking_seconds: 0,
    regular_minutes: 480,
    nonworking_minutes: 0,
    normal_excess_minutes: 0,
    eligible_minutes: 0,
    credited_minutes: 0,
    segments: [],
    ...overrides,
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

describe('request bodies follow the server contract', () => {
  it('sends local wall times in the explicit input zone, with a fold only when no offset pins the instant', () => {
    expect(toLocalInput(field('2026-04-05', '02:30'), SYDNEY)).toEqual({ local: '2026-04-05T02:30', zone: SYDNEY });
    expect(toLocalInput(field('2026-04-05', '02:30', { fold: 1 }), SYDNEY)).toEqual({
      local: '2026-04-05T02:30',
      zone: SYDNEY,
      fold: 1,
    });
    expect(toLocalInput(field('2026-04-05', '02:30', { fold: 0, offset: '+10:00' }), SYDNEY)).toEqual({
      local: '2026-04-05T02:30',
      zone: SYDNEY,
      offset: '+10:00',
    });
  });

  it('puts the explicit end date of an overnight session into the end instant', () => {
    const body = buildSessionRequest(
      draft({ start: field('2026-09-21', '22:00'), end: field('2026-09-22', '03:00'), mode: 'none' }),
    );
    expect(body.start).toEqual({ local: '2026-09-21T22:00', zone: LA });
    expect(body.end).toEqual({ local: '2026-09-22T03:00', zone: LA });
    expect(body.input_zone).toBe(LA);
    expect(body.breaks).toEqual([]);
    expect(body.breaks_confirmed).toBe(true);
  });

  it('keeps unknown breaks unconfirmed and sends confirmed ones as typed', () => {
    const rows = [{ key: 'a', start: field('2026-09-21', '11:00'), end: field('2026-09-21', '11:15'), countsAsWork: false }];
    const pending = buildSessionRequest(draft({ breaks: rows, mode: 'pending' }));
    expect(pending.breaks_confirmed).toBe(false);
    expect(pending.breaks).toEqual([
      { start: { local: '2026-09-21T11:00', zone: LA }, end: { local: '2026-09-21T11:15', zone: LA }, counts_as_work: false },
    ]);
    const confirmed = buildSessionRequest(draft({ breaks: rows, mode: 'confirmed' }), { expectedVersion: 4, reason: '  typo fix  ' });
    expect(confirmed).toMatchObject({ breaks_confirmed: true, expected_version: 4, reason: 'typo fix' });
  });

  it('sends none as an explicit empty list even when rows were left behind', () => {
    const rows = [{ key: 'a', start: field('2026-09-21', '11:00'), end: field('2026-09-21', '11:15'), countsAsWork: false }];
    expect(buildSessionRequest(draft({ breaks: rows, mode: 'none' })).breaks).toEqual([]);
  });

  it('omits an empty reason', () => {
    expect(buildSessionRequest(draft(), { reason: '   ' })).not.toHaveProperty('reason');
  });

  it('builds Clock out per E-1: unknown omits the list, confirmed or none sends the complete list', () => {
    const rows = [{ key: 'a', start: field('2026-09-21', '11:00'), end: field('2026-09-21', '11:15'), countsAsWork: false }];
    const unknown = buildClockOutRequest(draft({ breaks: rows, mode: 'pending' }), 7);
    expect(unknown).toEqual({ breaks_confirmed: false, expected_version: 7 });
    expect(unknown).not.toHaveProperty('breaks');
    expect(buildClockOutRequest(draft({ mode: 'none' }), 7)).toEqual({ breaks: [], breaks_confirmed: true, expected_version: 7 });
    const confirmed = buildClockOutRequest(draft({ breaks: rows, mode: 'confirmed' }), 7, 'late clock out');
    expect(confirmed).toMatchObject({ breaks_confirmed: true, expected_version: 7, reason: 'late clock out' });
    expect(confirmed.breaks).toHaveLength(1);
  });
});

describe('draft completeness (not business validation)', () => {
  it('names the first empty field', () => {
    expect(draftGap(newSessionDraft('2026-09-21', LA))).toBe('Enter the start date and time.');
    expect(draftGap(draft({ end: emptyField('2026-09-21') }))).toBe('Enter the end date and time.');
    expect(draftGap(draft({ zone: ' ' }))).toBe('Enter the input zone.');
    expect(draftGap(draft())).toBeNull();
  });

  it('asks for every listed break unless none were taken', () => {
    const open = [{ key: 'a', start: emptyField('2026-09-21'), end: emptyField('2026-09-21'), countsAsWork: false }];
    expect(breaksGap(draft({ breaks: open, mode: 'confirmed' }))).toBe('Complete every break or remove it.');
    expect(breaksGap(draft({ breaks: open, mode: 'none' }))).toBeNull();
  });

  it('drops the fold and the offset when the typed value changes', () => {
    const pinned = field('2026-04-05', '02:30', { fold: 1, offset: '+10:00' });
    expect(editField(pinned, { time: '02:45' })).toEqual({ date: '2026-04-05', time: '02:45', fold: null, offset: null });
  });
});

describe('DST fold and gap choices (R-07)', () => {
  const fold = { code: 'ambiguous_local_time', details: { local: '2026-04-05T02:30', zone: SYDNEY, offsets: ['+11:00', '+10:00'] } };
  const gapError = { code: 'nonexistent_local_time', details: { local: '2026-03-08T02:30', zone: LA } };

  it('reads the server details of a repeated time and of a missing time', () => {
    expect(timeProblemOf(fold.code, fold.details)).toEqual({
      kind: 'ambiguous',
      local: '2026-04-05T02:30',
      zone: SYDNEY,
      offsets: ['+11:00', '+10:00'],
    });
    expect(timeProblemOf(gapError.code, gapError.details)).toEqual({ kind: 'gap', local: '2026-03-08T02:30', zone: LA });
  });

  it('ignores other errors and malformed details', () => {
    expect(timeProblemOf('end_not_after_start', { local: 'x', zone: 'y' })).toBeNull();
    expect(timeProblemOf('ambiguous_local_time', { local: 'x', zone: 'y' })).toBeNull();
    expect(timeProblemOf('ambiguous_local_time', { local: 'x', zone: 'y', offsets: [1, 2] })).toBeNull();
    expect(timeProblemOf('nonexistent_local_time', undefined)).toBeNull();
  });

  it('applies the chosen fold to every field that holds the repeated time, and to no other', () => {
    const problem = timeProblemOf(fold.code, fold.details);
    if (problem === null) throw new Error('expected a problem');
    const before = draft({
      zone: SYDNEY,
      start: field('2026-04-05', '02:30'),
      end: field('2026-04-05', '04:30'),
      breaks: [{ key: 'b', start: field('2026-04-05', '02:30'), end: field('2026-04-05', '02:45'), countsAsWork: false }],
    });
    expect(problemApplies(before, problem)).toBe(true);
    expect(chosenFold(before, problem)).toBeNull();
    const after = applyFold(before, problem, 1);
    expect(after.start.fold).toBe(1);
    expect(after.breaks[0]?.start.fold).toBe(1);
    expect(after.end.fold).toBeNull();
    expect(chosenFold(after, problem)).toBe(1);
    expect(buildSessionRequest(after).start).toEqual({ local: '2026-04-05T02:30', zone: SYDNEY, fold: 1 });
    // Editing the time removes the question.
    expect(problemApplies({ ...after, start: editField(after.start, { time: '03:00' }), breaks: [] }, problem)).toBe(false);
  });

  it('resolves the repeated start to the instant of the chosen fold with the shared resolver', () => {
    const base = draft({ zone: SYDNEY, start: field('2026-04-05', '02:30'), end: field('2026-04-05', '04:30') });
    const unresolved = resolveStart(base);
    expect(unresolved.ok).toBe(false);
    if (!unresolved.ok) expect(unresolved.problem).toMatchObject({ kind: 'ambiguous', offsets: ['+11:00', '+10:00'] });
    const earlier = resolveStart({ ...base, start: { ...base.start, fold: 0 } });
    const later = resolveStart({ ...base, start: { ...base.start, fold: 1 } });
    expect(earlier).toEqual({ ok: true, utc: Date.UTC(2026, 3, 4, 15, 30) / 1000 });
    expect(later).toEqual({ ok: true, utc: Date.UTC(2026, 3, 4, 16, 30) / 1000 });
    expect(resolveStart({ ...base, start: { ...base.start, offset: '+10:00' } })).toEqual(later);
  });

  it('offers the first valid time after a gap and moves every field that held the missing time', () => {
    const problem = timeProblemOf(gapError.code, gapError.details);
    if (problem === null) throw new Error('expected a problem');
    expect(gapReplacement(problem)).toMatchObject({ date: '2026-03-08', time: '03:30', offset: '-07:00' });
    const before = draft({ start: field('2026-03-08', '02:30'), end: field('2026-03-08', '05:00') });
    const after = applyGapReplacement(before, problem);
    expect(after.start).toMatchObject({ date: '2026-03-08', time: '03:30', offset: '-07:00' });
    expect(after.end).toEqual(before.end);
    const missing = resolveStart(before);
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.problem).toMatchObject({ kind: 'gap' });
  });
});

describe('break suggestions shift with the arrival (R-02)', () => {
  it('places the default breaks from a 09:00 start at 11:00, 13:00 and 15:30, unconfirmed, pinned by offset', () => {
    const start = resolveStart(draft());
    if (!start.ok) throw new Error('start must resolve');
    const rows = suggestedRows(start.utc, LA, DEFAULT_BREAKS, (index) => `k${index}`);
    expect(rows.map((row) => row.start.time)).toEqual(['11:00', '13:00', '15:30']);
    expect(rows.map((row) => row.end.time)).toEqual(['11:15', '13:30', '15:45']);
    expect(rows.every((row) => row.start.date === '2026-09-21' && row.start.offset === '-07:00' && !row.countsAsWork)).toBe(true);
    expect(rows.map((row) => row.key)).toEqual(['k0', 'k1', 'k2']);
  });

  it('shifts them with a 07:00 arrival', () => {
    const start = resolveStart(draft({ start: field('2026-09-21', '07:00') }));
    if (!start.ok) throw new Error('start must resolve');
    expect(suggestedRows(start.utc, LA, DEFAULT_BREAKS, String).map((row) => row.start.time)).toEqual(['09:00', '11:00', '13:30']);
  });
});

describe('expected finish and policy (R-02)', () => {
  it('picks the policy effective on the date, the later seq on the same date', () => {
    const list = [policy('2026-01-01', 1), policy('2026-06-01', 2, 450), policy('2026-06-01', 3, 420)];
    expect(policyOn(list, '2026-05-31')?.id).toBe('policy-1');
    expect(policyOn(list, '2026-06-01')?.id).toBe('policy-3');
    expect(policyOn(list, '2025-12-31')).toBeUndefined();
  });

  it('adds required work and excluded breaks to the start: 07:00, 08:00 and 09:00 give 16:00, 17:00 and 18:00', () => {
    const at = (start: string) => expectedFinishText([savedSession({ start_utc: start })], policy('2026-01-01', 1));
    expect(at('2026-09-21T14:00:00Z')).toBe('2026-09-21 16:00 (America/Los_Angeles)');
    expect(at('2026-09-21T15:00:00Z')).toBe('2026-09-21 17:00 (America/Los_Angeles)');
    expect(at('2026-09-21T16:00:00Z')).toBe('2026-09-21 18:00 (America/Los_Angeles)');
  });

  it('uses the earliest session and says nothing without a session or a policy', () => {
    const late = savedSession({ id: 'late', start_utc: '2026-09-21T20:00:00Z' });
    const early = savedSession({ id: 'early', start_utc: '2026-09-21T16:00:00Z' });
    expect(expectedFinishText([late, early], policy('2026-01-01', 1))).toBe('2026-09-21 18:00 (America/Los_Angeles)');
    expect(expectedFinishText([], policy('2026-01-01', 1))).toBeNull();
    expect(expectedFinishText([early], undefined)).toBeNull();
  });
});

describe('editing a saved session', () => {
  it('pins each time by the offset it had, so a resave never asks about a repeated time again', () => {
    const edit = draftFromSession(savedSession({ start_utc: '2026-04-04T16:30:00Z', end_utc: '2026-04-04T18:30:00Z', input_zone: SYDNEY }));
    expect(edit.start).toEqual({ date: '2026-04-05', time: '02:30', fold: null, offset: '+10:00' });
    expect(edit.end).toEqual({ date: '2026-04-05', time: '04:30', fold: null, offset: '+10:00' });
    expect(buildSessionRequest(edit).start).toEqual({ local: '2026-04-05T02:30', zone: SYDNEY, offset: '+10:00' });
  });

  it('keeps the seconds of a live clock session', () => {
    const edit = draftFromSession(savedSession({ start_utc: '2026-09-21T16:03:27Z' }));
    expect(edit.start.time).toBe('09:03:27');
  });

  it('maps the stored break state to a mode', () => {
    expect(draftFromSession(savedSession({ breaks_confirmed: false })).mode).toBe('pending');
    expect(draftFromSession(savedSession({ breaks_confirmed: true })).mode).toBe('none');
    const withBreak = savedSession({
      breaks: [{ id: 'b1', start_utc: '2026-09-21T18:00:00Z', end_utc: '2026-09-21T18:15:00Z', counts_as_work: false }],
    });
    const edit = draftFromSession(withBreak);
    expect(edit.mode).toBe('confirmed');
    expect(edit.breaks[0]?.start).toMatchObject({ date: '2026-09-21', time: '11:00' });
  });

  it('shows an open session with an empty end on the start date', () => {
    const edit = draftFromSession(savedSession({ end_utc: null }));
    expect(edit.end).toMatchObject({ date: '2026-09-21', time: '' });
  });
});

describe('server figures, E-2 notice and day fields', () => {
  it('shows the figures exactly as the server reports them, in hours and minutes', () => {
    const figures = dayFigures(day({ calculation: calculation({ regular_minutes: 480, credited_minutes: 0, eligible_minutes: 0 }), deficit_minutes: 0 }), null);
    expect(figures).toMatchObject({ rawRegular: '8h 00m', rawOffCalendar: '0m', eligible: '0m', credited: '0m', deficit: '0m' });
    expect(figures.status.completeness).toBe('complete');
    expect(dayFigures(day(), null)).toMatchObject({ rawRegular: 'none', credited: 'none', deficit: 'none' });
  });

  it('shows the OT mismatch notice only when the server says the minutes differ, and it never offers an action', () => {
    expect(otMismatchNotice(day())).toBeNull();
    const notice = otMismatchNotice(
      day({ ot_leave: { kind_minutes: 120, consumed_minutes: 60, reversed_minutes: 0, mismatch: true } }),
    );
    expect(notice).toContain('2h 00m');
    expect(notice).toContain('1h 00m');
    expect(notice).toContain('nothing is spent, reserved or released');
  });

  it('builds the day entry body with the version it saw and drops the kind without leave', () => {
    const built = buildDayEntryRequest({ category: 'Worked', leaveMinutes: '240', leaveKind: 'vacation', wfh: true, notes: 'n' }, 3, ' because ');
    expect(built).toEqual({
      ok: true,
      request: { category: 'Worked', leave_minutes: 240, leave_kind: 'vacation', wfh: true, notes: 'n', expected_version: 3, reason: 'because' },
    });
    const none = buildDayEntryRequest({ category: 'Off', leaveMinutes: '0', leaveKind: 'sick', wfh: false, notes: '' }, null);
    expect(none).toEqual({
      ok: true,
      request: { category: 'Off', leave_minutes: 0, leave_kind: null, wfh: false, notes: '', expected_version: null },
    });
  });

  it('leaves a missing kind to the server and rejects only a malformed minutes field', () => {
    const missingKind = buildDayEntryRequest({ category: 'Worked', leaveMinutes: '240', leaveKind: '', wfh: false, notes: '' }, 1);
    expect(missingKind).toMatchObject({ ok: true, request: { leave_minutes: 240, leave_kind: null } });
    for (const bad of ['1.5', '-1', '1441', 'abc']) {
      expect(buildDayEntryRequest({ category: 'Worked', leaveMinutes: bad, leaveKind: '', wfh: false, notes: '' }, 1).ok).toBe(false);
    }
  });

  it('starts the form from the day, and hints whole minutes as hours and minutes', () => {
    const draftFields = dayFieldsDraft(day({ category: 'Vacation', leave_minutes: 240, leave_kind: 'vacation', wfh: true }));
    expect(draftFields).toEqual({ category: 'Vacation', leaveMinutes: '240', leaveKind: 'vacation', wfh: true, notes: '' });
    expect(leaveHint('240')).toBe('4h 00m');
    expect(leaveHint('')).toBeNull();
    expect(leaveHint('1.5')).toBeNull();
  });
});
