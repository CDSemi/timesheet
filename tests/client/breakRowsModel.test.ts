import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PolicyVersion, Session } from '../../src/client/api.ts';
import {
  addBreakRow,
  applyReferenceHours,
  type BreakRowDraft,
  breakRowEnd,
  breaksPayload,
  breaksSummary,
  buildCheckOutDialogRequest,
  buildSessionDialogRequest,
  changeDialogZone,
  checkBreakRows,
  chooseBreakRowFold,
  editBreakRow,
  newBreakRow,
  newSessionDialogDraft,
  parseBreakMinutes,
  pastDaySuggestedRows,
  referenceHours,
  removeBreakRow,
  replaceBreakRowGap,
  reshiftSuggestions,
  resolveBreakRow,
  rowKeepsPin,
  rowsFromSession,
  savedBreakMinutes,
  serverBreakRowError,
  type SessionDialogDraft,
  sessionDialogDraftFromSession,
  sessionDialogIsDirty,
  setNoBreaks,
  type SuggestionContext,
  suggestionRows,
  UNCONFIRMED_BLOCKED_MESSAGE,
} from '../../src/client/components/breakRowsModel.ts';
import {
  buildClockOutRequest,
  buildSessionRequest,
  draftFromSession,
  suggestedRows,
  toLocalInput,
} from '../../src/client/components/sessionModel.ts';
import { parseUtcInstant } from '../../src/domain/instants.ts';

const LA = 'America/Los_Angeles';
const HCM = 'Asia/Ho_Chi_Minh';

const utc = (text: string) => parseUtcInstant(text);

function field(date: string, time: string, extra: { fold?: 0 | 1 | null; offset?: string | null } = {}) {
  return { date, time, fold: extra.fold ?? null, offset: extra.offset ?? null };
}

const DEFAULT_BREAKS = [
  { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
  { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
  { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
];

function policy(overrides: Partial<PolicyVersion> = {}): PolicyVersion {
  return {
    id: 'policy-1',
    seq: 1,
    effective_from: '2026-01-01',
    required_minutes: 480,
    threshold_minutes: 30,
    rounding_step_minutes: 30,
    reference_start: '08:00',
    reference_end: '17:00',
    breaks: DEFAULT_BREAKS,
    ...overrides,
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
    breaks: [
      { id: 'b1', start_utc: '2026-09-21T19:00:00Z', end_utc: '2026-09-21T19:30:00Z', counts_as_work: false },
      // A saved break with seconds keeps them: its pinned instants are resent exactly.
      { id: 'b2', start_utc: '2026-09-21T21:00:30Z', end_utc: '2026-09-21T21:15:00Z', counts_as_work: true },
    ],
    ...overrides,
  };
}

/** A typed row (origin new) in its input zone. */
function typedRow(key: string, date: string, time: string, minutes: string, extra: { fold?: 0 | 1 | null } = {}): BreakRowDraft {
  return { ...newBreakRow(key, date), start: field(date, time, extra), minutes };
}

/** A new-session draft for 2026-10-14 08:00-17:00 typed in `zone` (pinned nothing). */
function dialog(overrides: Partial<SessionDialogDraft> = {}): SessionDialogDraft {
  return {
    ...newSessionDialogDraft('2026-10-14', LA),
    start: field('2026-10-14', '08:00'),
    end: field('2026-10-14', '17:00'),
    ...overrides,
  };
}

const SESSION_OPTIONS = { allowUnconfirmed: true };

function sessionRequest(draft: SessionDialogDraft, options: Parameters<typeof buildSessionDialogRequest>[1] = SESSION_OPTIONS) {
  const built = buildSessionDialogRequest(draft, options);
  if (!built.ok) throw new Error(`expected a request, got ${JSON.stringify(built)}`);
  return built.request;
}

function resolved(row: BreakRowDraft, zone = LA, index = 0) {
  const result = resolveBreakRow(row, index, zone);
  if (!result.ok) throw new Error(`expected a resolved row, got ${JSON.stringify(result.error)}`);
  return result.row;
}

describe('untouched saved and suggested rows keep their pinned instants', () => {
  it('an unchanged saved session is sent byte for byte as the old form sent it', () => {
    const session = savedSession();
    const draft = sessionDialogDraftFromSession(session);
    expect(draft.rows.map((row) => [row.origin, row.minutes, row.edited])).toEqual([
      ['saved', '30', false],
      ['saved', '14', false],
    ]);
    const request = sessionRequest(draft, { allowUnconfirmed: false, expectedVersion: 4 });
    const old = buildSessionRequest(draftFromSession(session), { expectedVersion: 4 });
    expect(JSON.stringify(request)).toBe(JSON.stringify(old));
    expect(request.breaks).toEqual([
      {
        start: { local: '2026-09-21T12:00', zone: LA, offset: '-07:00' },
        end: { local: '2026-09-21T12:30', zone: LA, offset: '-07:00' },
        counts_as_work: false,
      },
      {
        start: { local: '2026-09-21T14:00:30', zone: LA, offset: '-07:00' },
        end: { local: '2026-09-21T14:15', zone: LA, offset: '-07:00' },
        counts_as_work: true,
      },
    ]);
    expect(request.breaks_confirmed).toBe(true);
  });

  it('saved rows of an unconfirmed session keep their instants and Save confirms them', () => {
    const session = savedSession({ breaks_confirmed: false });
    const request = sessionRequest(sessionDialogDraftFromSession(session), { allowUnconfirmed: true, expectedVersion: 4 });
    const old = buildSessionRequest({ ...draftFromSession(session), mode: 'confirmed' }, { expectedVersion: 4 });
    expect(JSON.stringify(request)).toBe(JSON.stringify(old));
    expect(request.breaks_confirmed).toBe(true);
  });

  it('a saved session with confirmed none opens with the box ticked and resends the same body', () => {
    const session = savedSession({ breaks: [] });
    const draft = sessionDialogDraftFromSession(session);
    expect(draft.noBreaks).toBe(true);
    const request = sessionRequest(draft, { allowUnconfirmed: false, expectedVersion: 4 });
    expect(JSON.stringify(request)).toBe(JSON.stringify(buildSessionRequest(draftFromSession(session), { expectedVersion: 4 })));
  });

  it('untouched suggested rows send the instants the old suggestion rows sent', () => {
    const context: SuggestionContext = { workDate: '2026-10-14', todayLocal: '2026-10-15', policy: policy(), keyOf: (index) => `s${index}` };
    const start = utc('2026-10-14T15:00:00Z');
    const rows = pastDaySuggestedRows(context, { startUtc: start, endUtc: utc('2026-10-15T00:00:00Z') }, LA);
    const old = suggestedRows(start, LA, DEFAULT_BREAKS, (index) => `s${index}`).map((row) => ({
      start: toLocalInput(row.start, LA),
      end: toLocalInput(row.end, LA),
      counts_as_work: row.countsAsWork,
    }));
    const request = sessionRequest(dialog({ rows }));
    expect(JSON.stringify(request.breaks)).toBe(JSON.stringify(old));
  });

  it('a row keeps its pin only while unchanged and in the zone it was pinned in', () => {
    const row = rowsFromSession(savedSession())[0] as BreakRowDraft;
    expect(rowKeepsPin(row, LA)).toBe(true);
    expect(rowKeepsPin(row, HCM)).toBe(false);
    expect(rowKeepsPin({ ...row, edited: true }, LA)).toBe(false);
    expect(rowKeepsPin(newBreakRow('n', '2026-09-21'), LA)).toBe(false);
  });
});

describe('start plus minutes to request, end pinned by offset', () => {
  it('in America/Los_Angeles the end is the start instant plus the minutes, sent with its offset', () => {
    const row = resolved(typedRow('a', '2026-10-14', '10:00', '15'));
    expect(row.startUtc).toBe(utc('2026-10-14T17:00:00Z'));
    expect(row.endUtc - row.startUtc).toBe(15 * 60);
    expect(row.request).toEqual({
      start: { local: '2026-10-14T10:00', zone: LA },
      end: { local: '2026-10-14T10:15', zone: LA, offset: '-07:00' },
      counts_as_work: false,
    });
  });

  it('in Asia/Ho_Chi_Minh (reporting zone America/Los_Angeles) the same rule applies in the input zone', () => {
    // 2026-10-14 08:00-17:00 in Los Angeles is 22:00 that day to 07:00 the next day in Ho Chi Minh City.
    const draft = changeDialogZone(dialog(), HCM);
    const typed: SessionDialogDraft = {
      ...draft,
      start: field('2026-10-14', '22:00'),
      end: field('2026-10-15', '07:00'),
      rows: [typedRow('a', '2026-10-15', '01:00', '30')],
    };
    const request = sessionRequest(typed);
    expect(request.input_zone).toBe(HCM);
    expect(request.breaks).toEqual([
      {
        start: { local: '2026-10-15T01:00', zone: HCM },
        end: { local: '2026-10-15T01:30', zone: HCM, offset: '+07:00' },
        counts_as_work: false,
      },
    ]);
    expect(resolved(typed.rows[0] as BreakRowDraft, HCM).startUtc).toBe(utc('2026-10-14T18:00:00Z'));
  });

  it('a break across local midnight simply ends on the next local date', () => {
    const night: SessionDialogDraft = dialog({
      start: field('2026-10-14', '20:00'),
      end: field('2026-10-15', '04:00'),
      rows: [typedRow('a', '2026-10-14', '23:45', '30')],
    });
    expect(sessionRequest(night).breaks[0]?.end).toEqual({ local: '2026-10-15T00:15', zone: LA, offset: '-07:00' });

    const hcm: SessionDialogDraft = {
      ...changeDialogZone(dialog(), HCM),
      start: field('2026-10-14', '22:00'),
      end: field('2026-10-15', '07:00'),
      rows: [typedRow('a', '2026-10-14', '23:50', '20')],
    };
    const row = resolved(hcm.rows[0] as BreakRowDraft, HCM);
    expect(row.endUtc - row.startUtc).toBe(20 * 60);
    expect(sessionRequest(hcm).breaks[0]?.end).toEqual({ local: '2026-10-15T00:10', zone: HCM, offset: '+07:00' });
  });

  it('editing only the minutes of a saved row keeps its start offset and recomputes the end', () => {
    const draft = sessionDialogDraftFromSession(savedSession());
    const key = (draft.rows[0] as BreakRowDraft).key;
    const edited = editBreakRow(draft, key, { minutes: '45' });
    expect(edited.rows[0]?.edited).toBe(true);
    expect(edited.breaksEdited).toBe(true);
    expect(sessionRequest(edited).breaks[0]).toEqual({
      start: { local: '2026-09-21T12:00', zone: LA, offset: '-07:00' },
      end: { local: '2026-09-21T12:45', zone: LA, offset: '-07:00' },
      counts_as_work: false,
    });
    // A new time drops the pin: the start is typed again.
    const retimed = editBreakRow(draft, key, { time: '12:10' });
    expect(retimed.rows[0]?.start).toEqual(field('2026-09-21', '12:10'));
    expect(sessionRequest(retimed).breaks[0]?.start).toEqual({ local: '2026-09-21T12:10', zone: LA });
    expect(sessionRequest(retimed).breaks[0]?.end).toEqual({ local: '2026-09-21T12:40', zone: LA, offset: '-07:00' });
  });

  it('another input zone reads the shown wall clock again; the original zone restores the pin', () => {
    const draft = sessionDialogDraftFromSession(savedSession());
    const moved = changeDialogZone(draft, HCM);
    expect(changeDialogZone(draft, LA)).toBe(draft);
    expect(moved.start).toEqual(field('2026-09-21', '09:00'));
    const row = resolved(moved.rows[0] as BreakRowDraft, HCM);
    expect(row.request.start).toEqual({ local: '2026-09-21T12:00', zone: HCM });
    expect(row.endUtc - row.startUtc).toBe(30 * 60);
    const back = changeDialogZone(moved, LA);
    expect(resolved(back.rows[0] as BreakRowDraft, LA).request.start).toEqual({ local: '2026-09-21T12:00', zone: LA, offset: '-07:00' });
  });

  it('breakRowEnd gives the computed end for "ends HH:MM"', () => {
    expect(breakRowEnd(typedRow('a', '2026-10-14', '10:00', '15'), 0, LA)).toEqual(field('2026-10-14', '10:15', { offset: '-07:00' }));
    expect(breakRowEnd(typedRow('a', '2026-10-14', '10:00', ''), 0, LA)).toBeNull();
  });
});

describe('DST in America/Los_Angeles', () => {
  // 2026-10-31 22:00 PDT to 2026-11-01 06:00 PST: the session spans the fall-back hour.
  const fallBack = dialog({ start: field('2026-10-31', '22:00'), end: field('2026-11-01', '06:00') });

  it('a break starting 2026-11-01 01:45 needs the fold choice, named "Break n"', () => {
    const result = resolveBreakRow(typedRow('a', '2026-11-01', '01:45', '30'), 1, LA);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('ambiguous');
    expect(result.error.label).toBe('Break 2');
    expect(result.error.message).toBe('Break 2: 2026-11-01 01:45 happens twice in America/Los_Angeles: clocks go back at that time.');
    expect(result.error.problem).toEqual({ kind: 'ambiguous', local: '2026-11-01T01:45', zone: LA, offsets: ['-07:00', '-08:00'] });
    const built = buildSessionDialogRequest({ ...fallBack, rows: [typedRow('a', '2026-11-01', '01:45', '30')] }, SESSION_OPTIONS);
    expect(built.ok).toBe(false);
    if (!built.ok) expect(built.rowErrors.map((error) => error.kind)).toEqual(['ambiguous']);
  });

  it('a 30-minute break from the first 01:45 (PDT) ends 30 elapsed minutes later, at 01:15 PST', () => {
    const draft = chooseBreakRowFold({ ...fallBack, rows: [typedRow('a', '2026-11-01', '01:45', '30')] }, 'a', 0);
    const row = resolved(draft.rows[0] as BreakRowDraft);
    expect(row.startUtc).toBe(utc('2026-11-01T08:45:00Z'));
    expect(row.endUtc).toBe(utc('2026-11-01T09:15:00Z'));
    expect(sessionRequest(draft).breaks[0]).toEqual({
      start: { local: '2026-11-01T01:45', zone: LA, fold: 0 },
      end: { local: '2026-11-01T01:15', zone: LA, offset: '-08:00' },
      counts_as_work: false,
    });
  });

  it('the second 01:45 (PST) ends at 02:15 PST', () => {
    const draft = chooseBreakRowFold({ ...fallBack, rows: [typedRow('a', '2026-11-01', '01:45', '30')] }, 'a', 1);
    const row = resolved(draft.rows[0] as BreakRowDraft);
    expect(row.startUtc).toBe(utc('2026-11-01T09:45:00Z'));
    expect(row.request.end).toEqual({ local: '2026-11-01T02:15', zone: LA, offset: '-08:00' });
  });

  it('a break across the fall-back hour lasts its minutes of elapsed time, not the wall-clock difference', () => {
    // 00:50 PDT + 90 min = 01:20 PST: 90 elapsed minutes, 30 minutes on the wall clock.
    const row = resolved(typedRow('a', '2026-11-01', '00:50', '90'));
    expect(row.startUtc).toBe(utc('2026-11-01T07:50:00Z'));
    expect(row.endUtc).toBe(utc('2026-11-01T09:20:00Z'));
    expect(row.request.end).toEqual({ local: '2026-11-01T01:20', zone: LA, offset: '-08:00' });
    expect(sessionRequest({ ...fallBack, rows: [typedRow('a', '2026-11-01', '00:50', '90')] }).breaks_confirmed).toBe(true);
  });

  it('2027-03-14 02:30 returns the gap result; the replacement is the first valid time after it', () => {
    const springDraft = dialog({
      start: field('2027-03-14', '00:00'),
      end: field('2027-03-14', '08:00'),
      rows: [typedRow('a', '2027-03-14', '02:30', '15')],
    });
    const result = resolveBreakRow(springDraft.rows[0] as BreakRowDraft, 0, LA);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('gap');
    expect(result.error.message).toBe('Break 1: 2027-03-14 02:30 does not exist in America/Los_Angeles: clocks skip forward at that time.');
    expect(result.error.problem).toEqual({ kind: 'gap', local: '2027-03-14T02:30', zone: LA });
    const replaced = replaceBreakRowGap(springDraft, 'a', result.error.problem as NonNullable<typeof result.error.problem>);
    expect(replaced.rows[0]?.start).toEqual(field('2027-03-14', '03:30', { offset: '-07:00' }));
    const row = resolved(replaced.rows[0] as BreakRowDraft);
    expect(row.startUtc).toBe(utc('2027-03-14T10:30:00Z'));
    expect(row.request.end).toEqual({ local: '2027-03-14T03:45', zone: LA, offset: '-07:00' });
  });
});

describe('minutes validation', () => {
  it.each(['0', '721', '1.5', '', '   ', 'abc', '-5', '1e2', '15 min'])('refuses %j', (text) => {
    expect(parseBreakMinutes(text)).toEqual({ ok: false, message: 'Enter whole minutes from 1 to 720.' });
  });

  it.each([
    ['1', 1],
    ['720', 720],
    [' 15 ', 15],
    ['015', 15],
  ])('accepts %j', (text, minutes) => {
    expect(parseBreakMinutes(text)).toEqual({ ok: true, minutes });
  });

  it('a row with invalid minutes gets a row error naming it', () => {
    const result = resolveBreakRow(typedRow('a', '2026-10-14', '10:00', '721'), 2, LA);
    expect(result).toEqual({
      ok: false,
      error: { index: 2, key: 'a', label: 'Break 3', kind: 'minutes', message: 'Break 3: Enter whole minutes from 1 to 720.', problem: null },
    });
  });

  it('a row without a start time is incomplete', () => {
    const result = resolveBreakRow(typedRow('a', '2026-10-14', '', '15'), 0, LA);
    expect(result.ok ? null : result.error.kind).toBe('incomplete');
    expect(result.ok ? null : result.error.message).toBe('Break 1: enter the start date and time.');
  });
});

describe('row checks before sending and server break_index mapping', () => {
  const bounds = { startUtc: utc('2026-10-14T15:00:00Z'), endUtc: utc('2026-10-15T00:00:00Z') };

  it('before start, after end and overlap are row errors by instant comparison', () => {
    const rows = [
      typedRow('early', '2026-10-14', '07:50', '15'),
      typedRow('late', '2026-10-14', '16:50', '15'),
      typedRow('first', '2026-10-14', '10:00', '30'),
      typedRow('second', '2026-10-14', '10:15', '15'),
    ];
    const checked = checkBreakRows(rows, LA, bounds);
    expect(checked.errors.map((error) => [error.key, error.kind, error.message])).toEqual([
      ['early', 'before_start', 'Break 1 starts before the session starts.'],
      ['late', 'after_end', 'Break 2 ends after the session ends.'],
      ['second', 'overlap', 'Break 4 overlaps Break 3.'],
    ]);
    expect(checked.resolved.map((item) => item.key)).toEqual(['first']);
  });

  it('touching breaks, a break ending exactly at the session end and one starting at its start are valid', () => {
    const rows = [
      typedRow('a', '2026-10-14', '08:00', '15'),
      typedRow('b', '2026-10-14', '08:15', '15'),
      typedRow('c', '2026-10-14', '16:45', '15'),
    ];
    expect(checkBreakRows(rows, LA, bounds).errors).toEqual([]);
  });

  it('a running session has no end to check (Check out)', () => {
    expect(checkBreakRows([typedRow('a', '2026-10-14', '23:00', '30')], LA, { startUtc: bounds.startUtc, endUtc: null }).errors).toEqual([]);
  });

  it('a session-mode save with a row error is not built', () => {
    const built = buildSessionDialogRequest(dialog({ rows: [typedRow('early', '2026-10-14', '07:50', '15')] }), SESSION_OPTIONS);
    expect(built).toEqual({
      ok: false,
      message: null,
      problem: null,
      rowErrors: [{ index: 0, key: 'early', label: 'Break 1', kind: 'before_start', message: 'Break 1 starts before the session starts.', problem: null }],
    });
  });

  it('maps future_break, break_outside_session and overlapping_breaks with break_index to the sent row', () => {
    const rows = [typedRow('a', '2026-10-14', '10:00', '15'), typedRow('b', '2026-10-14', '12:00', '30')];
    expect(serverBreakRowError('future_break', { break_index: 1, latest_allowed_end: '2026-10-14T19:05:00Z' }, { rows, noBreaks: false })).toEqual({
      index: 1,
      key: 'b',
      label: 'Break 2',
      kind: 'server',
      message: 'Break 2 ends later than five minutes from now. Only breaks already taken can be saved.',
      problem: null,
    });
    expect(serverBreakRowError('break_outside_session', { break_index: 0 }, { rows, noBreaks: false })?.message).toBe('Break 1 lies outside the session.');
    expect(serverBreakRowError('overlapping_breaks', { break_index: 1 }, { rows, noBreaks: false })?.message).toBe('Break 2 overlaps another break.');
  });

  it('maps nothing without a break code, without a valid index, or when no rows were sent', () => {
    const rows = [typedRow('a', '2026-10-14', '10:00', '15')];
    expect(serverBreakRowError('future_break', { break_index: 1 }, { rows, noBreaks: false })).toBeNull();
    expect(serverBreakRowError('future_break', { break_index: 0.5 }, { rows, noBreaks: false })).toBeNull();
    expect(serverBreakRowError('future_break', { break_index: '0' }, { rows, noBreaks: false })).toBeNull();
    expect(serverBreakRowError('future_break', undefined, { rows, noBreaks: false })).toBeNull();
    expect(serverBreakRowError('future_break', { break_index: 0 }, { rows, noBreaks: true })).toBeNull();
    expect(serverBreakRowError('stale_version', { break_index: 0 }, { rows, noBreaks: false })).toBeNull();
  });
});

describe('breaks_confirmed', () => {
  const listed = [typedRow('a', '2026-10-14', '10:00', '15')];

  it('session mode: listed rows confirm them', () => {
    const request = sessionRequest(dialog({ rows: listed }), { allowUnconfirmed: false });
    expect(request.breaks_confirmed).toBe(true);
    expect(request.breaks).toHaveLength(1);
  });

  it('session mode: the ticked box confirms none and sends no rows, even with hidden invalid rows', () => {
    const draft = setNoBreaks(dialog({ rows: [typedRow('bad', '2026-10-14', '07:00', '0')] }), true);
    const request = sessionRequest(draft, { allowUnconfirmed: false });
    expect(request.breaks).toEqual([]);
    expect(request.breaks_confirmed).toBe(true);
  });

  it('session mode, G-4 allowUnconfirmed true: an empty unticked list saves breaks unknown', () => {
    const request = sessionRequest(dialog(), { allowUnconfirmed: true });
    expect(request.breaks).toEqual([]);
    expect(request.breaks_confirmed).toBe(false);
  });

  it('session mode, G-4 allowUnconfirmed false: an empty unticked list blocks Save', () => {
    expect(buildSessionDialogRequest(dialog(), { allowUnconfirmed: false })).toEqual({
      ok: false,
      message: UNCONFIRMED_BLOCKED_MESSAGE,
      problem: null,
      rowErrors: [],
    });
  });

  it('check out mode: an empty unticked list omits breaks, so they stay unconfirmed (E-1)', () => {
    const session = savedSession({ end_utc: null, breaks: [], breaks_confirmed: false, version: 7 });
    const built = buildCheckOutDialogRequest({ session, rows: [], noBreaks: false, expectedVersion: 7, reason: '  ' });
    expect(built).toEqual({ ok: true, request: { breaks_confirmed: false, expected_version: 7 } });
    if (built.ok) expect('breaks' in built.request).toBe(false);
  });

  it('check out mode: the ticked box and listed rows confirm and replace the saved rows', () => {
    const session = savedSession({ end_utc: null, breaks_confirmed: false, version: 7 });
    expect(buildCheckOutDialogRequest({ session, rows: [], noBreaks: true, expectedVersion: 7 })).toEqual({
      ok: true,
      request: { breaks: [], breaks_confirmed: true, expected_version: 7 },
    });
    const rows = rowsFromSession(session);
    const built = buildCheckOutDialogRequest({ session, rows, noBreaks: false, expectedVersion: 7, reason: ' late entry ' });
    const old = buildClockOutRequest({ ...draftFromSession(session), mode: 'confirmed' }, 7, ' late entry ');
    expect(built.ok && JSON.stringify(built.request)).toBe(JSON.stringify(old));
  });

  it('check out mode: a row before the session start is a row error', () => {
    const session = savedSession({ end_utc: null, breaks: [], breaks_confirmed: false });
    const built = buildCheckOutDialogRequest({ session, rows: [typedRow('a', '2026-09-21', '08:00', '15')], noBreaks: false, expectedVersion: 4 });
    expect(built.ok ? null : built.rowErrors.map((error) => error.kind)).toEqual(['before_start']);
  });

  it('breaksPayload exposes the same rule for both modes', () => {
    const input = { rows: [], noBreaks: false, zone: LA, bounds: null };
    expect(breaksPayload(input, { kind: 'checkout' })).toEqual({ ok: true, breaks: undefined, breaksConfirmed: false });
    expect(breaksPayload(input, { kind: 'session', allowUnconfirmed: true })).toEqual({ ok: true, breaks: [], breaksConfirmed: false });
  });

  it('session-level gaps come before the breaks: zone, start, end and a repeated session start', () => {
    expect(buildSessionDialogRequest(dialog({ zone: ' ' }), SESSION_OPTIONS)).toMatchObject({ ok: false, message: 'Enter the input zone.' });
    expect(buildSessionDialogRequest(dialog({ start: field('2026-10-14', '') }), SESSION_OPTIONS)).toMatchObject({
      ok: false,
      message: 'Enter the start date and time.',
    });
    expect(buildSessionDialogRequest(dialog({ end: field('', '') }), SESSION_OPTIONS)).toMatchObject({ ok: false, message: 'Enter the end date and time.' });
    const repeated = buildSessionDialogRequest(dialog({ start: field('2026-11-01', '01:30'), end: field('2026-11-01', '09:00') }), SESSION_OPTIONS);
    expect(repeated.ok ? null : repeated.problem).toEqual({ kind: 'ambiguous', local: '2026-11-01T01:30', zone: LA, offsets: ['-07:00', '-08:00'] });
  });

  it('a new-session request carries version and reason only when given', () => {
    const plain = sessionRequest(dialog());
    expect('expected_version' in plain || 'reason' in plain).toBe(false);
    const update = sessionRequest(dialog(), { allowUnconfirmed: true, expectedVersion: 3, reason: ' fix ' });
    expect(update.expected_version).toBe(3);
    expect(update.reason).toBe('fix');
  });
});

describe('saved interval to minutes', () => {
  it('gives the elapsed whole minutes of the saved interval', () => {
    expect(savedBreakMinutes('2026-09-21T19:00:00Z', '2026-09-21T19:15:00Z')).toBe(15);
    expect(savedBreakMinutes('2026-09-21T21:00:30Z', '2026-09-21T21:15:00Z')).toBe(14);
  });

  it('counts the fall-back hour as elapsed time (01:30 PDT to 01:45 PST is 75 minutes)', () => {
    expect(savedBreakMinutes('2026-11-01T08:30:00Z', '2026-11-01T09:45:00Z')).toBe(75);
    const session = savedSession({
      start_utc: '2026-11-01T07:00:00Z',
      end_utc: '2026-11-01T14:00:00Z',
      breaks: [{ id: 'b', start_utc: '2026-11-01T08:30:00Z', end_utc: '2026-11-01T09:45:00Z', counts_as_work: false }],
    });
    const row = rowsFromSession(session)[0];
    expect(row?.minutes).toBe('75');
    expect(row?.start).toEqual(field('2026-11-01', '01:30', { offset: '-07:00' }));
  });
});

describe('reference-hour pre-fill', () => {
  it('a normal day: 08:00-17:00 on the accounting date in the reporting zone', () => {
    expect(referenceHours(policy(), '2026-10-15', LA, LA)).toEqual({
      start: field('2026-10-15', '08:00', { offset: '-07:00' }),
      end: field('2026-10-15', '17:00', { offset: '-07:00' }),
      startUtc: utc('2026-10-15T15:00:00Z'),
      endUtc: utc('2026-10-16T00:00:00Z'),
    });
  });

  it('an input zone that differs from the reporting zone shows the same instants there', () => {
    expect(referenceHours(policy(), '2026-10-15', LA, HCM)).toEqual({
      start: field('2026-10-15', '22:00', { offset: '+07:00' }),
      end: field('2026-10-16', '07:00', { offset: '+07:00' }),
      startUtc: utc('2026-10-15T15:00:00Z'),
      endUtc: utc('2026-10-16T00:00:00Z'),
    });
  });

  it('the fall-back day keeps the wall-clock times (PST after the change)', () => {
    expect(referenceHours(policy(), '2026-11-01', LA, LA)).toEqual({
      start: field('2026-11-01', '08:00', { offset: '-08:00' }),
      end: field('2026-11-01', '17:00', { offset: '-08:00' }),
      startUtc: utc('2026-11-01T16:00:00Z'),
      endUtc: utc('2026-11-02T01:00:00Z'),
    });
    // A reference time inside the repeated hour takes the earlier instant, as configured schedule times do.
    const night = referenceHours(policy({ reference_start: '01:30', reference_end: '10:30' }), '2026-11-01', LA, LA);
    expect(night?.startUtc).toBe(utc('2026-11-01T08:30:00Z'));
    expect(night?.start).toEqual(field('2026-11-01', '01:30', { offset: '-07:00' }));
  });

  it('the spring-forward day keeps the wall-clock times (PDT); a missing reference time moves forward', () => {
    expect(referenceHours(policy(), '2027-03-14', LA, LA)).toEqual({
      start: field('2027-03-14', '08:00', { offset: '-07:00' }),
      end: field('2027-03-14', '17:00', { offset: '-07:00' }),
      startUtc: utc('2027-03-14T15:00:00Z'),
      endUtc: utc('2027-03-15T00:00:00Z'),
    });
    const early = referenceHours(policy({ reference_start: '02:30', reference_end: '11:30' }), '2027-03-14', LA, LA);
    expect(early?.start).toEqual(field('2027-03-14', '03:30', { offset: '-07:00' }));
    expect(early?.startUtc).toBe(utc('2027-03-14T10:30:00Z'));
  });

  it('an end not after the start moves to the next date', () => {
    const night = referenceHours(policy({ reference_start: '22:00', reference_end: '06:00' }), '2026-10-15', LA, LA);
    expect(night?.start).toEqual(field('2026-10-15', '22:00', { offset: '-07:00' }));
    expect(night?.end).toEqual(field('2026-10-16', '06:00', { offset: '-07:00' }));
    const same = referenceHours(policy({ reference_start: '08:00', reference_end: '08:00' }), '2026-10-15', LA, LA);
    expect(same?.end).toEqual(field('2026-10-16', '08:00', { offset: '-07:00' }));
  });

  it('no policy, an invalid zone or an invalid clock time gives nothing', () => {
    expect(referenceHours(undefined, '2026-10-15', LA, LA)).toBeNull();
    expect(referenceHours(policy(), '2026-10-15', LA, 'Not/AZone')).toBeNull();
    expect(referenceHours(policy({ reference_start: '25:00' }), '2026-10-15', LA, LA)).toBeNull();
  });

  it('applyReferenceHours sets the start and end and keeps the rest', () => {
    const hours = referenceHours(policy(), '2026-10-14', LA, LA);
    if (hours === null) throw new Error('expected reference hours');
    const draft = applyReferenceHours(newSessionDialogDraft('2026-10-14', LA), hours);
    expect(draft.start).toEqual(field('2026-10-14', '08:00', { offset: '-07:00' }));
    expect(draft.end).toEqual(field('2026-10-14', '17:00', { offset: '-07:00' }));
    expect(draft.rows).toEqual([]);
  });
});

describe('past-day suggestions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const session = { startUtc: utc('2026-10-14T15:00:00Z'), endUtc: utc('2026-10-15T00:00:00Z') };
  const context = (workDate: string, todayLocal: string | null): SuggestionContext => ({
    workDate,
    todayLocal,
    policy: policy(),
    keyOf: (index) => `s${index}`,
  });

  it('a date before today_local gets the suggestions inside the session, pinned and untouched', () => {
    const rows = pastDaySuggestedRows(context('2026-10-14', '2026-10-15'), session, LA);
    expect(rows.map((row) => [row.key, row.origin, row.start.time, row.start.offset, row.minutes, row.edited])).toEqual([
      ['s0', 'suggested', '10:00', '-07:00', '15', false],
      ['s1', 'suggested', '12:00', '-07:00', '30', false],
      ['s2', 'suggested', '14:30', '-07:00', '15', false],
    ]);
  });

  it('today_local itself, later dates and an unknown today get none', () => {
    expect(pastDaySuggestedRows(context('2026-10-14', '2026-10-14'), session, LA)).toEqual([]);
    expect(pastDaySuggestedRows(context('2026-10-15', '2026-10-14'), session, LA)).toEqual([]);
    expect(pastDaySuggestedRows(context('2026-10-14', null), session, LA)).toEqual([]);
    expect(pastDaySuggestedRows({ ...context('2026-10-14', '2026-10-15'), policy: undefined }, session, LA)).toEqual([]);
  });

  it('only suggestions lying inside the session are offered', () => {
    const short = { startUtc: session.startUtc, endUtc: utc('2026-10-14T19:00:00Z') };
    expect(pastDaySuggestedRows(context('2026-10-14', '2026-10-15'), short, LA).map((row) => row.start.time)).toEqual(['10:00']);
  });

  it('the rows are shown in the input zone; the decision uses the server date, not the device clock', () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 9, 1) });
    const rows = pastDaySuggestedRows(context('2026-10-14', '2026-10-15'), session, HCM);
    expect(rows.map((row) => row.start)).toEqual([
      field('2026-10-15', '00:00', { offset: '+07:00' }),
      field('2026-10-15', '02:00', { offset: '+07:00' }),
      field('2026-10-15', '04:30', { offset: '+07:00' }),
    ]);
  });

  it('suggestions re-shift with the session start until a break row is edited', () => {
    const ctx = context('2026-10-14', '2026-10-15');
    const hours = referenceHours(policy(), '2026-10-14', LA, LA);
    if (hours === null) throw new Error('expected reference hours');
    const filled = reshiftSuggestions(applyReferenceHours(newSessionDialogDraft('2026-10-14', LA), hours), ctx);
    expect(filled.rows.map((row) => row.start.time)).toEqual(['10:00', '12:00', '14:30']);

    const later = reshiftSuggestions({ ...filled, start: field('2026-10-14', '09:00') }, ctx);
    expect(later.rows.map((row) => row.start.time)).toEqual(['11:00', '13:00', '15:30']);

    const edited = editBreakRow(later, 's0', { minutes: '20' });
    const after = reshiftSuggestions({ ...edited, start: field('2026-10-14', '10:00') }, ctx);
    expect(after.rows).toBe(edited.rows);

    const removed = removeBreakRow(later, 's1');
    expect(reshiftSuggestions({ ...removed, start: field('2026-10-14', '10:00') }, ctx).rows).toBe(removed.rows);

    const added = addBreakRow(later, 'n1');
    expect(added.rows.at(-1)).toEqual(newBreakRow('n1', '2026-10-14'));
    expect(reshiftSuggestions(added, ctx)).toBe(added);
  });

  it('nothing is re-shifted for today, for saved rows or while the start cannot be resolved', () => {
    const today = reshiftSuggestions(dialog(), context('2026-10-14', '2026-10-14'));
    expect(today.rows).toEqual([]);
    const saved = sessionDialogDraftFromSession(savedSession());
    expect(reshiftSuggestions(saved, context('2026-09-21', '2026-10-15'))).toBe(saved);
    const gap = dialog({ start: field('2027-03-14', '02:30'), end: field('2027-03-14', '17:00') });
    expect(reshiftSuggestions(gap, context('2027-03-14', '2027-03-20'))).toBe(gap);
  });
});

describe('suggestion rows without the past-day rule (WP5-UX3-T08B)', () => {
  const keyOf = (index: number) => `k${index}`;
  const times = (rows: readonly BreakRowDraft[]) => rows.map((row) => [row.start.date, row.start.time, row.start.offset, row.minutes]);

  it('shifts the policy breaks by the start and keeps the ones inside a closed session, pinned and untouched', () => {
    const start = utc('2026-10-14T15:00:00Z');
    const rows = suggestionRows(policy(), start, utc('2026-10-15T00:00:00Z'), LA, keyOf);
    expect(rows.map((row) => [row.key, row.origin, row.edited, row.countsAsWork])).toEqual([
      ['k0', 'suggested', false, false],
      ['k1', 'suggested', false, false],
      ['k2', 'suggested', false, false],
    ]);
    expect(times(rows)).toEqual([
      ['2026-10-14', '10:00', '-07:00', '15'],
      ['2026-10-14', '12:00', '-07:00', '30'],
      ['2026-10-14', '14:30', '-07:00', '15'],
    ]);
    expect(rows[0]?.pinned).toEqual({ zone: LA, startUtc: utc('2026-10-14T17:00:00Z'), endUtc: utc('2026-10-14T17:15:00Z') });
    // The same rows as the past-day function builds for a past day: one place builds suggested rows.
    expect(rows).toEqual(pastDaySuggestedRows({ workDate: '2026-10-14', todayLocal: '2026-10-15', policy: policy(), keyOf }, { startUtc: start, endUtc: utc('2026-10-15T00:00:00Z') }, LA));
  });

  it('keeps only the breaks that end inside the session; a break ending exactly at the end is inside', () => {
    const start = utc('2026-10-14T15:00:00Z');
    expect(suggestionRows(policy(), start, utc('2026-10-14T19:00:00Z'), LA, keyOf).map((row) => row.start.time)).toEqual(['10:00']);
    expect(suggestionRows(policy(), start, utc('2026-10-14T17:15:00Z'), LA, keyOf).map((row) => row.start.time)).toEqual(['10:00']);
    expect(suggestionRows(policy(), start, utc('2026-10-14T17:14:59Z'), LA, keyOf)).toEqual([]);
  });

  it('keeps all of them while the session has no end, and has no past-day rule: any date, today or later', () => {
    const rows = suggestionRows(policy(), utc('2030-06-03T15:00:00Z'), null, LA, keyOf);
    expect(times(rows)).toEqual([
      ['2030-06-03', '10:00', '-07:00', '15'],
      ['2030-06-03', '12:00', '-07:00', '30'],
      ['2030-06-03', '14:30', '-07:00', '15'],
    ]);
  });

  it('carries the policy flag counts_as_work and an empty policy gives none', () => {
    const paid = policy({ breaks: [{ start_offset_minutes: 60, duration_minutes: 10, counts_as_work: true }] });
    expect(suggestionRows(paid, utc('2026-10-14T15:00:00Z'), null, LA, keyOf).map((row) => [row.countsAsWork, row.minutes])).toEqual([[true, '10']]);
    expect(suggestionRows(policy({ breaks: [] }), utc('2026-10-14T15:00:00Z'), null, LA, keyOf)).toEqual([]);
  });

  it('shows them in the input zone', () => {
    const rows = suggestionRows(policy(), utc('2026-10-14T15:00:00Z'), utc('2026-10-15T00:00:00Z'), HCM, keyOf);
    expect(times(rows)).toEqual([
      ['2026-10-15', '00:00', '+07:00', '15'],
      ['2026-10-15', '02:00', '+07:00', '30'],
      ['2026-10-15', '04:30', '+07:00', '15'],
    ]);
  });

  it('spring forward in Los Angeles: the offsets are elapsed time, so the wall clock skips the missing hour', () => {
    // 2027-03-14 00:00 PST = 08:00Z; the clocks jump 02:00 -> 03:00 at 10:00Z.
    const rows = suggestionRows(policy(), utc('2027-03-14T08:00:00Z'), utc('2027-03-14T16:00:00Z'), LA, keyOf);
    expect(times(rows)).toEqual([
      ['2027-03-14', '03:00', '-07:00', '15'],
      ['2027-03-14', '05:00', '-07:00', '30'],
      ['2027-03-14', '07:30', '-07:00', '15'],
    ]);
  });

  it('fall back in Los Angeles: the second 01:00 is pinned by its own offset', () => {
    // 2026-11-01 00:00 PDT = 07:00Z; the clocks return 02:00 PDT -> 01:00 PST at 09:00Z.
    const rows = suggestionRows(policy(), utc('2026-11-01T07:00:00Z'), utc('2026-11-01T16:00:00Z'), LA, keyOf);
    expect(times(rows)).toEqual([
      ['2026-11-01', '01:00', '-08:00', '15'],
      ['2026-11-01', '03:00', '-08:00', '30'],
      ['2026-11-01', '05:30', '-08:00', '15'],
    ]);
    expect(rows[0]?.pinned?.startUtc).toBe(utc('2026-11-01T09:00:00Z'));
  });

  it('a session across local midnight: each row has its own local date', () => {
    // 20:00 PDT on the 14th to 06:00 PDT on the 15th.
    const rows = suggestionRows(policy(), utc('2026-10-15T03:00:00Z'), utc('2026-10-15T13:00:00Z'), LA, keyOf);
    expect(times(rows)).toEqual([
      ['2026-10-14', '22:00', '-07:00', '15'],
      ['2026-10-15', '00:00', '-07:00', '30'],
      ['2026-10-15', '02:30', '-07:00', '15'],
    ]);
  });

  it('an untouched suggested row sends its pinned instants as a request part', () => {
    const rows = suggestionRows(policy(), utc('2026-10-14T15:00:00Z'), utc('2026-10-15T00:00:00Z'), LA, keyOf);
    const draft = dialog({ rows, start: field('2026-10-14', '08:00'), end: field('2026-10-14', '17:00') });
    const request = sessionRequest(draft, { allowUnconfirmed: false });
    expect(request.breaks.map((item) => [item.start.local, item.end.local])).toEqual([
      ['2026-10-14T10:00', '2026-10-14T10:15'],
      ['2026-10-14T12:00', '2026-10-14T12:30'],
      ['2026-10-14T14:30', '2026-10-14T14:45'],
    ]);
  });
});

describe('summary texts', () => {
  it('lists the minutes of the rows, says none, or says not confirmed', () => {
    const rows = [
      typedRow('a', '2026-10-14', '10:00', '15'),
      typedRow('b', '2026-10-14', '12:00', '30'),
      typedRow('c', '2026-10-14', '14:30', '015'),
    ];
    expect(breaksSummary(rows, false)).toEqual({ text: '3 breaks (15, 30, 15 min)', confirms: true });
    expect(breaksSummary([typedRow('a', '2026-10-14', '10:00', '45')], false)).toEqual({ text: '1 break (45 min)', confirms: true });
    expect(breaksSummary(rows, true)).toEqual({ text: 'No breaks taken', confirms: true });
    expect(breaksSummary([], false)).toEqual({ text: 'Breaks not confirmed: OT for this day stays pending', confirms: false });
  });

  it('saved rows show the elapsed minutes of their saved interval', () => {
    expect(breaksSummary(rowsFromSession(savedSession()), false).text).toBe('2 breaks (30, 14 min)');
  });
});

describe('dirty check for Cancel', () => {
  const start = dialog({ rows: [typedRow('a', '2026-10-14', '10:00', '15')] });

  it('an unchanged draft is not dirty', () => {
    expect(sessionDialogIsDirty(start, start)).toBe(false);
    const saved = sessionDialogDraftFromSession(savedSession());
    expect(sessionDialogIsDirty(saved, saved)).toBe(false);
  });

  it('ignores cosmetic differences: 9:00 vs 09:00 vs 09:00:00, 015 vs 15, spaces, keys, a dropped pin of the same time', () => {
    const cosmetic: SessionDialogDraft = {
      ...start,
      zone: ` ${LA} `,
      start: field('2026-10-14', '8:00'),
      end: field('2026-10-14', '17:00:00'),
      rows: [{ ...typedRow('other-key', '2026-10-14', '10:00', '015') }],
    };
    expect(sessionDialogIsDirty(start, cosmetic)).toBe(false);
    const saved = sessionDialogDraftFromSession(savedSession());
    const retyped = editBreakRow(saved, 'saved-s1-0', { time: '12:00' });
    expect(sessionDialogIsDirty(saved, retyped)).toBe(false);
  });

  it('notices changed times, zone, rows, minutes, the box and a fold choice', () => {
    expect(sessionDialogIsDirty(start, { ...start, start: field('2026-10-14', '08:30') })).toBe(true);
    expect(sessionDialogIsDirty(start, { ...start, end: field('2026-10-15', '17:00') })).toBe(true);
    expect(sessionDialogIsDirty(start, changeDialogZone(start, HCM))).toBe(true);
    expect(sessionDialogIsDirty(start, editBreakRow(start, 'a', { minutes: '20' }))).toBe(true);
    expect(sessionDialogIsDirty(start, addBreakRow(start, 'b'))).toBe(true);
    expect(sessionDialogIsDirty(start, removeBreakRow(start, 'a'))).toBe(true);
    expect(sessionDialogIsDirty(start, setNoBreaks(start, true))).toBe(true);
    expect(sessionDialogIsDirty(start, chooseBreakRowFold(start, 'a', 1))).toBe(true);
  });

  it('hidden rows do not count while the box is ticked in both states', () => {
    const ticked = setNoBreaks(start, true);
    expect(sessionDialogIsDirty(ticked, editBreakRow(ticked, 'a', { minutes: '45' }))).toBe(false);
  });
});
