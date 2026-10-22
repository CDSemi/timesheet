import { describe, expect, it } from 'vitest';
import { ApiRequestError, type Calculation, type DayView, type Period, type Session } from '../../src/client/api.ts';
import {
  cardBreaksText,
  dayBanner,
  dayPeriodPill,
  deleteFacts,
  editorChips,
  editorTitle,
  messageFailure,
  requestFailure,
  SAVE_FAILED_TITLE,
  rowsFailure,
  sessionCardOf,
} from '../../src/client/components/dayEditorModel.ts';

const LA = 'America/Los_Angeles';
const HCM = 'Asia/Ho_Chi_Minh';

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

  describe('the pill of the period of the day itself (G-5 b, WP5-UX3-FIX2)', () => {
    const period = (payroll_date: string, period_start: string, period_end: string, relation: Period['relation']): Period => ({
      payroll_date,
      period_start,
      period_end,
      due_local_date: payroll_date,
      due_local_time: '07:00',
      due_at_utc: `${payroll_date}T14:00:00Z`,
      ...(relation === undefined ? {} : { relation }),
    });
    const ended = period('2026-10-16', '2026-09-28', '2026-10-11', 'current');
    // The five window days: the period that contains today is still "future" for the edit rules, but "in progress" for the person.
    const running = period('2026-10-30', '2026-10-12', '2026-10-25', 'future');
    const windowPeriods = { current: ended, in_progress: running };
    const runningCurrent = period('2026-10-30', '2026-10-12', '2026-10-25', 'current');
    const samePeriods = { current: runningCurrent, in_progress: runningCurrent };

    it('says "in progress" for every day of the period in progress, whichever period the sheet shows', () => {
      expect(dayPeriodPill('2026-10-14', ended, windowPeriods)).toBe('in-progress');
      expect(dayPeriodPill('2026-10-12', ended, windowPeriods)).toBe('in-progress');
      expect(dayPeriodPill('2026-10-25', ended, windowPeriods)).toBe('in-progress');
      // The shown period decides first when it holds the day, with the same rule as the bar.
      expect(dayPeriodPill('2026-10-14', running, windowPeriods)).toBe('in-progress');
    });

    it('keeps "current" for a day of the ended period and leaves other periods to the server relation of the day', () => {
      expect(dayPeriodPill('2026-10-05', ended, windowPeriods)).toBe('current');
      expect(dayPeriodPill('2026-10-05', running, windowPeriods)).toBe('current');
      expect(dayPeriodPill('2026-09-20', ended, windowPeriods)).toBeUndefined();
      expect(dayPeriodPill('2026-10-26', ended, windowPeriods)).toBeUndefined();
      expect(dayPeriodPill('2026-10-14', ended, null)).toBeUndefined();
    });

    it('never says "in progress" outside the window days: the period with today is the current one', () => {
      expect(dayPeriodPill('2026-10-14', runningCurrent, samePeriods)).toBe('current');
      expect(dayPeriodPill('2026-10-14', ended, samePeriods)).toBe('current');
    });

    it('feeds the editor chip: the day of the period in progress reads "in progress", not "future period"', () => {
      const pill = dayPeriodPill('2026-10-14', ended, windowPeriods);
      expect(editorChips({ relation: 'future', ...(pill === undefined ? {} : { pill }), ...zones })[0]).toEqual({ key: 'period', text: 'in progress', pill: 'in-progress' });
      expect(editorChips({ relation: 'future', ...zones })[0]?.text).toBe('future period');
    });
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
    expect(card).toMatchObject({ state: 'confirmed', stateText: 'Breaks confirmed', range: '09:00 - 18:30', startDate: null, emptyText: null, attentionText: null, runningText: null });
    expect(card.caption).toBe('Breaks of 09:00 - 18:30');
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
    expect(card.range).toBe('23:00 - 08:30+1');
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

  it('a session that is still running says "Checked in" only, not "Checked in and out" (U4-11)', () => {
    const card = sessionCardOf(session({ source: 'clock', end_utc: null }), '2026-09-21', HCM);
    expect(card.source).toBe('Checked in');
    expect(card.source).not.toContain('and out');
    // Entered by hand keeps its own words, running or not.
    expect(sessionCardOf(session({ end_utc: null }), '2026-09-21', HCM).source).toBe(`Entered by hand in ${LA}`);
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
      { label: 'Time', value: `09:00 - 18:30 (${LA})` },
      { label: 'Breaks', value: '3 breaks (15, 30, 15 min)' },
    ]);
  });
});

describe('the words of a failed save (U4-15)', () => {
  it('a refusal of the server says its message and code; the title is the same for the session and the Check out dialog', () => {
    expect(SAVE_FAILED_TITLE).toBe('This session was not saved');
    const refused = requestFailure(new ApiRequestError(409, 'overlapping_user_intervals', 'This session overlaps another of your sessions'));
    expect(refused.messages).toEqual(['This session overlaps another of your sessions (overlapping_user_intervals)']);
    expect(refused.hint).toContain('Nothing was saved');
  });

  it('a request that got no answer is a connection failure, not a code', () => {
    const lost = requestFailure(new TypeError('Failed to fetch'));
    expect(lost.messages).toEqual(['The request could not be sent, or no answer came back.']);
    expect(lost.hint).toContain('Check your connection');
  });

  it('a form message and the break rows keep their own wording, one line per row', () => {
    expect(messageFailure('Enter the end date and time.').messages).toEqual(['Enter the end date and time.']);
    const rows = rowsFailure(['Break 1 starts before the session starts.', 'Break 3 overlaps Break 2.']);
    expect(rows.messages).toEqual(['Break 1 starts before the session starts.', 'Break 3 overlaps Break 2.']);
    expect(rows.hint).toContain('marked in the list');
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
