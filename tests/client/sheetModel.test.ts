import { describe, expect, it } from 'vitest';
import type { Calculation, DayEntry, DayView, FinalizationResponse, Session } from '../../src/client/api.ts';
import {
  checkShape,
  dayButtonName,
  dayClass,
  liftRuns,
  NO_TIMES_TEXT,
  overtimeTotal,
  revealDelta,
  SHEET_ROWS,
  sessionRange,
  sheetCheck,
  sheetDay,
  sheetLabel,
  sheetOt,
  sheetWeeks,
  signatureLines,
} from '../../src/client/components/sheetModel.ts';

const LA = 'America/Los_Angeles';

function calculation(status: Calculation['status'], minutes: Partial<Calculation> = {}): Calculation {
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
    ...minutes,
  };
}

function session(id: string, workDate: string, startUtc: string, endUtc: string | null, extra: Partial<Session> = {}): Session {
  return {
    id,
    work_date: workDate,
    start_utc: startUtc,
    end_utc: endUtc,
    input_zone: LA,
    source: 'manual',
    breaks_confirmed: true,
    version: 1,
    breaks: [],
    ...extra,
  };
}

function aBreak(id: string) {
  return { id, start_utc: '2026-11-23T20:00:00Z', end_utc: '2026-11-23T20:15:00Z', counts_as_work: false };
}

function entry(workDate: string, notes: string): DayEntry {
  return { id: `entry-${workDate}`, work_date: workDate, category: 'Worked', category_source: 'explicit', leave_minutes: 0, leave_kind: null, wfh: false, notes, version: 2 };
}

function day(workDate: string, overrides: Partial<DayView> = {}): DayView {
  return {
    work_date: workDate,
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

/** A complete 08:00-17:00 Los Angeles day (16:00Z to 01:00Z) with three confirmed breaks. */
function completeDay(workDate = '2026-11-23', credited = 60): DayView {
  return day(workDate, {
    sessions: [session('s1', workDate, `${workDate}T16:00:00Z`, '2026-11-24T01:00:00Z', { breaks: [aBreak('b1'), aBreak('b2'), aBreak('b3')] })],
    calculation: calculation('complete', { regular_minutes: 480, nonworking_minutes: 0, credited_minutes: credited }),
  });
}

const holiday = (name: string) => ({ day_class: 'nonworking' as const, reason: 'holiday', name });

describe('sheetLabel', () => {
  it('shows the category as the label, without placeholder words', () => {
    expect(sheetLabel(day('2026-11-23'))).toEqual({ main: 'Worked', lines: [], note: false });
    expect(sheetLabel(day('2026-11-28', { category: 'Off', classification: { day_class: 'nonworking', reason: 'weekend', name: null } }))).toEqual({
      main: 'Off',
      lines: [],
      note: false,
    });
  });

  it('writes the holiday name in the label cell, with "Holiday" below it', () => {
    expect(sheetLabel(day('2026-11-26', { category: 'Holiday', classification: holiday('Thanksgiving Day') }))).toEqual({
      main: 'Thanksgiving Day',
      lines: ['Holiday'],
      note: false,
    });
    // An explicit other label on a holiday keeps that label and names the holiday below it.
    expect(sheetLabel(day('2026-11-26', { category: 'Worked', category_source: 'explicit', classification: holiday('Thanksgiving Day') })).lines).toEqual([
      'Thanksgiving Day',
    ]);
  });

  it('shows WFH as "Work from home" and leave as a second line in h:mm', () => {
    expect(sheetLabel(day('2026-11-25', { wfh: true })).main).toBe('Work from home');
    expect(sheetLabel(day('2026-11-25', { category: 'Off', wfh: true })).lines).toEqual(['Work from home']);
    // OT-funded leave is leave minutes with kind ot, never a category (E-2 of 2026-10-03).
    expect(sheetLabel(day('2026-12-02', { leave_minutes: 240, leave_kind: 'ot' }))).toEqual({ main: 'Worked', lines: ['OT leave 4:00'], note: false });
    expect(sheetLabel(day('2026-12-01', { category: 'Vacation', leave_minutes: 480, leave_kind: 'vacation' })).lines).toEqual(['Leave 8:00']);
    expect(sheetLabel(day('2026-12-01', { leave_minutes: 150, leave_kind: 'sick' })).lines).toEqual(['Sick leave 2:30']);
    expect(sheetLabel(day('2026-12-01', { leave_minutes: 30, leave_kind: null })).lines).toEqual(['Leave 0:30']);
  });

  it('marks a note without showing its text, and words a date outside the calendar plainly', () => {
    expect(sheetLabel(day('2026-11-24', { entry: entry('2026-11-24', 'synthetic note') })).note).toBe(true);
    expect(sheetLabel(day('2026-11-24', { category: null, classification: null }))).toEqual({ main: '', lines: ['Not in the calendar'], note: false });
  });
});

describe('sheetOt (the PDF OT rule)', () => {
  it('prints the server credited minutes of a complete day as h:mm', () => {
    expect(sheetOt(completeDay('2026-11-24', 60))).toEqual({ kind: 'minutes', text: '1:00' });
    expect(sheetOt(completeDay('2026-11-23', 0))).toEqual({ kind: 'minutes', text: '0:00' });
    expect(sheetOt(completeDay('2026-11-23', 150))).toEqual({ kind: 'minutes', text: '2:30' });
  });

  it('never derives OT from the times: 07:30-17:45 with null credit stays blank', () => {
    const noCredit = day('2026-11-24', {
      sessions: [session('s1', '2026-11-24', '2026-11-24T15:30:00Z', '2026-11-25T01:45:00Z')],
      calculation: calculation('complete', { regular_minutes: 555, credited_minutes: null }),
    });
    expect(sheetOt(noCredit)).toEqual({ kind: 'blank', text: '' });
  });

  it('says pending for an open session or unconfirmed breaks, n/a for a calculation error, blank otherwise', () => {
    expect(sheetOt(day('2026-11-25', { calculation: calculation('incomplete') }))).toEqual({ kind: 'pending', text: 'pending' });
    expect(sheetOt(day('2026-11-25', { calculation: calculation('incomplete_breaks') }))).toEqual({ kind: 'pending', text: 'pending' });
    expect(sheetOt(day('2026-11-25', { calculation: calculation('complete', { credited_minutes: 60 }), calculation_error: 'policy_missing' }))).toEqual({
      kind: 'na',
      text: 'n/a',
    });
    expect(sheetOt(day('2026-11-25', { calculation: calculation('no_records') }))).toEqual({ kind: 'blank', text: '' });
    expect(sheetOt(day('2026-11-25'))).toEqual({ kind: 'blank', text: '' });
  });
});

describe('sheetCheck', () => {
  it('maps every server status to words plus a shape', () => {
    expect(sheetCheck(completeDay(), null)).toEqual({ key: 'complete', text: 'Complete', shape: 'circle' });
    expect(sheetCheck(day('2026-11-25', { calculation: calculation('incomplete_breaks') }), null)).toEqual({
      key: 'confirm_breaks',
      text: 'Confirm breaks',
      shape: 'diamond',
    });
    expect(sheetCheck(day('2026-11-25', { calculation_error: 'policy_missing' }), null)).toEqual({ key: 'error', text: 'Calculation problem', shape: 'triangle' });
  });

  it('shows a running session as Running with the live marker, another open session as Open session', () => {
    const running = day('2026-12-03', { sessions: [session('s1', '2026-12-03', '2026-12-03T16:12:00Z', null)], calculation: calculation('incomplete') });
    expect(sheetCheck(running, '2026-12-03')).toEqual({ key: 'running', text: 'Running', shape: 'live' });
    const open = day('2026-12-03', { sessions: [session('s1', '2026-12-03', '2026-12-03T16:12:00Z', '2026-12-03T17:00:00Z')], calculation: calculation('incomplete') });
    expect(sheetCheck(open, '2026-12-03')).toEqual({ key: 'open_session', text: 'Open session', shape: 'diamond' });
  });

  it('uses the server date for upcoming and missing, and leaves a day that needs nothing blank', () => {
    const past = day('2026-11-30', { calculation: calculation('no_records') });
    // "No times" is a slashed ring (U-16): nothing on the sheet looks like an empty checkbox; "Missing record" keeps its square.
    expect(sheetCheck(past, '2026-12-03')).toEqual({ key: 'missing', text: 'No times', shape: 'slashed' });
    expect(sheetCheck(day('2026-12-04', { calculation: calculation('no_records') }), '2026-12-03')).toEqual({ key: 'upcoming', text: 'Upcoming', shape: 'bar' });
    expect(sheetCheck(day('2026-12-05', { attendance_expected: false }), '2026-12-03')).toBeNull();
  });
});

describe('the row names (G-2 a, U-16)', () => {
  it('names the day category row "Category" and the status row "Status"; the keys stay code names', () => {
    expect(SHEET_ROWS).toEqual({ day: 'Day', date: 'Date', label: 'Category', time: 'Time', ot: 'OT (h:mm)', check: 'Status' });
    expect(Object.values(SHEET_ROWS)).not.toContain('Label');
    expect(Object.values(SHEET_ROWS)).not.toContain('Check');
  });

  it('draws "No times" as the slashed ring wherever its words appear, and every other status as before', () => {
    expect(NO_TIMES_TEXT).toBe('No times');
    // The review sheet builds its own cell with a square; the badge still draws the ring for those words.
    expect(checkShape({ text: 'No times', shape: 'square' })).toBe('slashed');
    expect(checkShape({ text: 'No times', shape: 'slashed' })).toBe('slashed');
    expect(checkShape({ text: 'Missing record', shape: 'square' })).toBe('square');
    expect(checkShape({ text: 'Running', shape: 'live' })).toBe('live');
    expect(checkShape({ text: 'Complete', shape: 'circle' })).toBe('circle');
  });
});

describe('liftRuns (lifted columns: batch-selected or open in the editor)', () => {
  const week = (...days: number[]) => liftRuns(Array.from({ length: 7 }, (_, index) => days.includes(index)));

  it('gives no run position to a band without a lifted day', () => {
    expect(week()).toEqual([null, null, null, null, null, null, null]);
  });

  it('gives one lifted day the position single, wherever it stands in the band', () => {
    expect(week(0)).toEqual(['single', null, null, null, null, null, null]);
    expect(week(3)).toEqual([null, null, null, 'single', null, null, null]);
    expect(week(6)).toEqual([null, null, null, null, null, null, 'single']);
  });

  it('marks two adjacent lifted days start and end, three start, mid and end, and a longer run start, mids and end', () => {
    expect(week(1, 2)).toEqual([null, 'start', 'end', null, null, null, null]);
    expect(week(0, 1, 2)).toEqual(['start', 'mid', 'end', null, null, null, null]);
    expect(week(2, 3, 4, 5)).toEqual([null, null, 'start', 'mid', 'mid', 'end', null]);
    expect(week(0, 1, 2, 3, 4, 5, 6)).toEqual(['start', 'mid', 'mid', 'mid', 'mid', 'mid', 'end']);
  });

  it('keeps a gap between two runs: each side is its own run, a lone day beside a gap is single', () => {
    expect(week(0, 1, 3)).toEqual(['start', 'end', null, 'single', null, null, null]);
    expect(week(0, 2, 4)).toEqual(['single', null, 'single', null, 'single', null, null]);
    expect(week(0, 1, 3, 4, 5)).toEqual(['start', 'end', null, 'start', 'mid', 'end', null]);
  });

  it('treats the day open in the editor like any lifted day: inside a run, at its end, or beside it with a gap', () => {
    // Selected Mon, Tue, Wed; the editor is on Tue (inside), Wed (at the end) or Fri (beside, with a gap).
    const selected = [0, 1, 2];
    expect(week(...selected, 1)).toEqual(['start', 'mid', 'end', null, null, null, null]);
    expect(week(...selected, 3)).toEqual(['start', 'mid', 'mid', 'end', null, null, null]);
    expect(week(...selected, 4)).toEqual(['start', 'mid', 'end', null, 'single', null, null]);
  });

  it('is computed per band, so a run never spans two bands: Sat and Sun of one band, Mon of the next', () => {
    const first = liftRuns([false, false, false, false, false, true, true]);
    const second = liftRuns([true, false, false, false, false, false, false]);
    expect(first).toEqual([null, null, null, null, null, 'start', 'end']);
    expect(second).toEqual(['single', null, null, null, null, null, null]);
  });

  it('follows the band of a period: a partial band (fewer than seven days) and an empty one', () => {
    expect(liftRuns([true, true])).toEqual(['start', 'end']);
    expect(liftRuns([true])).toEqual(['single']);
    expect(liftRuns([])).toEqual([]);
  });
});

describe('revealDelta (WP5-UX3-FIX1: a focused control is scrolled fully into its week card)', () => {
  // The card's visible span less its 8px scroll padding: 8 to 728 of a 736px card.
  const view = { start: 8, end: 728 };

  it('leaves a control that lies fully inside the view where it is, edges included', () => {
    expect(revealDelta(view, { start: 100, end: 200 })).toBe(0);
    expect(revealDelta(view, { start: 8, end: 728 })).toBe(0);
  });

  it('scrolls forward by the part past the end, also when only a sliver is visible (the Sunday button at 800px)', () => {
    expect(revealDelta(view, { start: 727, end: 783 })).toBe(55);
    expect(revealDelta(view, { start: 760, end: 868 })).toBe(140);
  });

  it('scrolls back by the part before the start', () => {
    expect(revealDelta(view, { start: -100, end: 8 })).toBe(-108);
    expect(revealDelta(view, { start: 5, end: 60 })).toBe(-3);
  });

  it('keeps the start edge in view when the control is larger than the view', () => {
    expect(revealDelta(view, { start: 300, end: 1100 })).toBe(292);
    expect(revealDelta(view, { start: -50, end: 900 })).toBe(-58);
  });
});

describe('sessionRange and the time cell (R-07)', () => {
  const sample = session('s1', '2026-11-23', '2026-11-23T16:00:00Z', '2026-11-24T01:00:00Z');

  it('prints 24-hour times in the display zone, as on the PDF', () => {
    expect(sessionRange(sample, '2026-11-23', LA)).toEqual({ key: 's1', text: '08:00-17:00', startDate: null });
  });

  it('marks an end on a later local date and a start on another local date than the accounting date', () => {
    expect(sessionRange(sample, '2026-11-23', 'Asia/Ho_Chi_Minh')).toEqual({ key: 's1', text: '23:00-08:00+1', startDate: null });
    expect(sessionRange(sample, '2026-11-23', 'Asia/Tokyo')).toEqual({ key: 's1', text: '01:00-10:00', startDate: '11/24' });
  });

  it('shows a running session by its start only', () => {
    expect(sessionRange(session('s2', '2026-12-03', '2026-12-03T16:12:00Z', null), '2026-12-03', LA)).toEqual({ key: 's2', text: '08:12', startDate: null });
  });

  it('notes breaks, a running session, unconfirmed breaks and missing times; flags the cells that need input', () => {
    expect(sheetDay(completeDay(), LA, null).time).toEqual({ ranges: [{ key: 's1', text: '08:00-17:00', startDate: null }], note: '3 breaks', attention: false });
    const oneBreak = day('2026-11-23', {
      sessions: [session('s1', '2026-11-23', '2026-11-23T16:00:00Z', '2026-11-23T20:00:00Z', { breaks: [aBreak('b1')] })],
      calculation: calculation('complete', { regular_minutes: 225, credited_minutes: 0 }),
    });
    expect(sheetDay(oneBreak, LA, null).time.note).toBe('1 break');
    const none = day('2026-11-27', {
      sessions: [session('s1', '2026-11-27', '2026-11-27T18:00:00Z', '2026-11-27T20:30:00Z')],
      calculation: calculation('complete', { regular_minutes: 150, credited_minutes: 0 }),
    });
    expect(sheetDay(none, LA, null).time.note).toBe('no breaks');
    // Times without a server calculation are shown with their breaks; the check names the missing record.
    const uncalculated = day('2026-11-23', { sessions: [session('s1', '2026-11-23', '2026-11-23T16:00:00Z', '2026-11-23T20:00:00Z')] });
    expect(sheetDay(uncalculated, LA, null)).toMatchObject({
      time: { note: 'no breaks', attention: true },
      check: { key: 'missing', text: 'Missing record', shape: 'square' },
    });
    const unconfirmed = day('2026-11-25', {
      sessions: [session('s1', '2026-11-25', '2026-11-25T16:00:00Z', '2026-11-26T01:00:00Z', { breaks_confirmed: false })],
      calculation: calculation('incomplete_breaks'),
    });
    expect(sheetDay(unconfirmed, LA, null).time).toMatchObject({ note: 'breaks not confirmed', attention: true });
    const running = day('2026-12-03', { sessions: [session('s1', '2026-12-03', '2026-12-03T16:12:00Z', null)], calculation: calculation('incomplete') });
    expect(sheetDay(running, LA, '2026-12-03').time).toMatchObject({ note: 'running', attention: false });
    const missing = day('2026-11-30', { calculation: calculation('no_records') });
    expect(sheetDay(missing, LA, '2026-12-03').time).toEqual({ ranges: [], note: 'no times yet', attention: true });
    expect(sheetDay(day('2026-12-04'), LA, '2026-12-03').time).toEqual({ ranges: [], note: null, attention: false });
  });
});

describe('sheetDay', () => {
  it('passes server minutes through as h:mm and never computes them', () => {
    const shown = sheetDay(completeDay(), LA, '2026-12-03');
    expect(shown).toMatchObject({
      workDate: '2026-11-23',
      weekday: 'Mon',
      dateText: '11/23',
      name: 'Mon 2026-11-23',
      today: false,
      nonworking: false,
      details: { regular: '8:00', offCalendar: '0:00' },
    });
    expect(sheetDay(day('2026-11-24'), LA, null).details).toEqual({ regular: '', offCalendar: '' });
  });

  it('takes non-working days from the server calendar, never from the weekday', () => {
    expect(sheetDay(day('2026-11-28'), LA, null).nonworking).toBe(false);
    expect(sheetDay(day('2026-11-26', { classification: holiday('Thanksgiving Day') }), LA, null).nonworking).toBe(true);
  });

  it('marks today by the server date only', () => {
    expect(sheetDay(day('2026-12-03'), LA, '2026-12-03').today).toBe(true);
    expect(sheetDay(day('2026-12-03'), LA, null).today).toBe(false);
  });

  it('maps an imported day like any other day (only the controls are locked)', () => {
    const imported = day('2026-11-23', {
      category: 'Holiday',
      category_source: 'explicit',
      classification: holiday('Floating Holiday'),
      attendance_expected: false,
      sessions: [session('i1', '2026-11-23', '2026-11-23T18:00:00Z', '2026-11-23T20:30:00Z')],
      calculation: calculation('complete', { nonworking_minutes: 150, credited_minutes: 150 }),
    });
    const shown = sheetDay(imported, LA, '2026-12-03');
    expect(shown.label).toEqual({ main: 'Floating Holiday', lines: ['Holiday'], note: false });
    expect(shown.ot).toEqual({ kind: 'minutes', text: '2:30' });
    expect(shown.check?.key).toBe('complete');
  });

  it('never prints the placeholder word none', () => {
    const texts = [day('2026-11-24'), day('2026-11-24', { category: null, classification: null }), day('2026-11-28', { attendance_expected: false })].map((item) =>
      JSON.stringify(sheetDay(item, LA, '2026-12-03')),
    );
    for (const text of texts) expect(text).not.toMatch(/\bnone\b/i);
  });
});

describe('dayButtonName (WCAG 2.5.3 label in name)', () => {
  it('starts with the verb, contains the visible text of each layout and ends with the ISO accounting date', () => {
    const shown = sheetDay(day('2026-11-30'), LA, null);
    expect(shown).toMatchObject({ weekday: 'Mon', dateText: '11/30' });
    expect(dayButtonName('Edit', shown, 'sheet')).toBe('Edit 11/30 (2026-11-30)');
    expect(dayButtonName('Edit', shown, 'phone')).toBe('Edit Mon 11/30 (2026-11-30)');
    expect(dayButtonName('View', shown, 'phone')).toBe('View Mon 11/30 (2026-11-30)');
  });

  it('keeps the saved accounting date whatever the display zone', () => {
    for (const zone of [LA, 'Asia/Ho_Chi_Minh', 'Pacific/Kiritimati']) {
      expect(dayButtonName('View', sheetDay(day('2026-12-06'), zone, null), 'sheet')).toBe('View 12/06 (2026-12-06)');
    }
  });
});

describe('dayClass (WP5-UX2-T03: the day open in the Day editor)', () => {
  const none = { selected: false, editing: false };

  it('adds the editing word for the editing day only, and keeps the other state words', () => {
    const today = sheetDay(day('2026-12-03'), LA, '2026-12-03');
    const holidayDay = sheetDay(day('2026-11-26', { classification: holiday('Thanksgiving Day') }), LA, null);
    const plain = sheetDay(day('2026-12-01'), LA, '2026-12-03');
    expect(dayClass(plain, none, 'sheet-day').split(' ')).toEqual(['sheet-day']);
    expect(dayClass(plain, { selected: false, editing: true }, 'sheet-day').split(' ')).toEqual(['sheet-day', 'editing']);
    // Every state combines on one day; the order of the words is fixed.
    expect(dayClass(today, { selected: true, editing: true }, 'sheet-day').split(' ')).toEqual(['sheet-day', 'today', 'selected', 'editing']);
    expect(dayClass(holidayDay, { selected: false, editing: true }, 'sheet-row').split(' ')).toEqual(['sheet-row', 'nonworking', 'editing']);
    // The other states never add the editing word.
    for (const state of [none, { selected: true, editing: false }]) expect(dayClass(today, state, 'sheet-day')).not.toContain('editing');
  });

  it('does not change the accessible name of the day button', () => {
    const shown = sheetDay(day('2026-12-01'), LA, null);
    expect(dayButtonName('Edit', shown, 'sheet')).toBe('Edit 12/01 (2026-12-01)');
    expect(dayButtonName('Edit', shown, 'phone')).toBe('Edit Tue 12/01 (2026-12-01)');
  });
});

describe('sheetWeeks', () => {
  const fourteen = Array.from({ length: 14 }, (_, index) => new Date(Date.UTC(2026, 10, 23 + index)).toISOString().slice(0, 10));

  it('splits a two-week period into Monday to Sunday bands with US ranges', () => {
    const weeks = sheetWeeks(
      fourteen.map((date) => day(date)),
      LA,
      null,
    );
    expect(weeks.map((week) => [week.index, week.rangeText, week.days.length])).toEqual([
      [1, '11/23/2026 - 11/29/2026', 7],
      [2, '11/30/2026 - 12/06/2026', 7],
    ]);
    expect(weeks[0]?.rangeName).toBe('11/23/2026 to 11/29/2026');
    expect(weeks[0]?.days[0]?.weekday).toBe('Mon');
    expect(weeks[1]?.days[6]?.weekday).toBe('Sun');
  });

  it('keeps every day on its accounting date whatever the display zone (a device-zone change never regroups)', () => {
    const days = fourteen.map((date) => completeDay(date));
    const dates = (zone: string) => sheetWeeks(days, zone, null).map((week) => week.days.map((item) => item.workDate));
    expect(dates('Asia/Tokyo')).toEqual(dates(LA));
    expect(dates('Pacific/Kiritimati')).toEqual(dates(LA));
  });

  it('groups a period that starts mid-week into partial weeks, and nothing into none', () => {
    const weeks = sheetWeeks([day('2026-09-30'), day('2026-10-01'), day('2026-10-05')], LA, null);
    expect(weeks.map((week) => [week.rangeText, week.days.length])).toEqual([
      ['09/30/2026 - 10/01/2026', 2],
      ['10/05/2026 - 10/05/2026', 1],
    ]);
    expect(sheetWeeks([], LA, null)).toEqual([]);
  });
});

describe('overtimeTotal', () => {
  it('prints the server provisional total as h:mm over all 14 days, with a counted pending note', () => {
    expect(overtimeTotal({ provisional_credited_minutes: 330, pending_days: 2 })).toEqual({
      text: '5:30',
      pendingNote: '2 days with OT pending are not in the total.',
    });
    expect(overtimeTotal({ provisional_credited_minutes: 0, pending_days: 1 }).pendingNote).toBe('1 day with OT pending is not in the total.');
    expect(overtimeTotal({ provisional_credited_minutes: 600, pending_days: 0 })).toEqual({ text: '10:00', pendingNote: null });
  });
});

describe('signatureLines', () => {
  const revision = {
    id: 'r1',
    revision_no: 1,
    revision_kind: 'original' as const,
    origin: 'employee' as const,
    review_state: 'signed' as const,
    correction_reason: null,
    send_requested: true,
    created_at: '2026-12-09T02:00:00Z',
  };
  const finalization = (overrides: Partial<FinalizationResponse>): FinalizationResponse => ({
    payroll_date: '2026-12-11',
    finalized_revision_no: 1,
    revision,
    signoff: null,
    ledger_lines: [],
    jobs: [],
    ...overrides,
  });

  it('says "Not signed yet" before any revision', () => {
    expect(signatureLines(finalization({ finalized_revision_no: null, revision: null }), LA)).toEqual({ employee: 'Not signed yet', date: '', signed: false });
  });

  it('names the signer and dates the sign-off in the reporting zone (never a device date)', () => {
    const signed = finalization({ signoff: { signer_name: 'Example Employee', signed_at: '2026-12-09T01:30:00Z' } });
    expect(signatureLines(signed, LA)).toEqual({ employee: 'Signed by Example Employee', date: '12/08/2026', signed: true });
    expect(signatureLines(signed, 'Asia/Ho_Chi_Minh').date).toBe('12/09/2026');
  });

  it('shows an automatic submission with its submission date, as the PDF prints it', () => {
    const automatic = finalization({ revision: { ...revision, origin: 'deadline', review_state: 'pending' } });
    expect(signatureLines(automatic, LA)).toEqual({ employee: 'Submitted automatically, review pending', date: '12/08/2026', signed: false });
  });
});
