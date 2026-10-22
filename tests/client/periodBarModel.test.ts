import { describe, expect, it } from 'vitest';
import type { DayView, Session } from '../../src/client/api.ts';
import {
  clockedInText,
  dueInWords,
  dueInZoneText,
  dueParts,
  PERIOD_PILL_WORDS,
  periodPillKind,
  rangeKind,
  rangeLadder,
  rangeParts,
  rangeSpokenText,
  rangeText,
  reviewShortLabel,
  runningSessionOf,
  viewingZoneText,
  weekdayName,
  zoneNoteVisible,
} from '../../src/client/components/periodBarModel.ts';

function session(id: string, start: string, end: string | null): Session {
  return { id, work_date: '2026-12-03', start_utc: start, end_utc: end, input_zone: 'America/Los_Angeles', source: 'clock', breaks_confirmed: false, version: 1, breaks: [] };
}

function day(workDate: string, sessions: Session[]): DayView {
  return { work_date: workDate, sessions } as unknown as DayView;
}

describe('weekdayName', () => {
  it('names the accounting date, Monday to Sunday', () => {
    expect(weekdayName('2026-12-07')).toBe('Mon');
    expect(weekdayName('2026-12-08')).toBe('Tue');
    expect(weekdayName('2026-12-13')).toBe('Sun');
  });
});

describe('dueInWords', () => {
  it('prints the server due fields in the US form with the reporting zone', () => {
    expect(dueInWords({ due_local_date: '2026-12-08', due_local_time: '17:00' }, 'America/Los_Angeles')).toBe(
      'Due Tue 12/08/2026, 17:00 (America/Los_Angeles)',
    );
  });
});

describe('dueParts', () => {
  const due = { due_local_date: '2026-12-08', due_local_time: '17:00' };

  it('splits the label word from the value, and the two joined by a space are the unchanged due line', () => {
    const parts = dueParts(due, 'America/Los_Angeles');
    expect(parts).toEqual({ label: 'Due', value: 'Tue 12/08/2026, 17:00 (America/Los_Angeles)' });
    expect(`${parts.label} ${parts.value}`).toBe(dueInWords(due, 'America/Los_Angeles'));
  });
});

describe('reviewShortLabel', () => {
  it('shortens each label of the review link to the word that names its action, and leaves any other text alone', () => {
    expect(reviewShortLabel('Review & sign off')).toBe('Sign off');
    expect(reviewShortLabel('Review now')).toBe('Review');
    expect(reviewShortLabel('Review or correct')).toBe('Review');
    expect(reviewShortLabel('Review & send')).toBe('Send');
    expect(reviewShortLabel('Something else')).toBe('Something else');
  });

  it('keeps every full label containing its short form (SC 2.5.3: the accessible name contains the visible text)', () => {
    for (const label of ['Review & sign off', 'Review & send', 'Review now', 'Review or correct']) {
      expect(label.toLowerCase()).toContain(reviewShortLabel(label).toLowerCase());
    }
  });
});

/*
 * The range ladder of the period card (U5-13). Synthetic periods: 10/12 to 10/25 (one month), 09/28 to 10/11 (two months of one year)
 * and 12/21 to 01/03 (two years).
 */
describe('range ladder (U5-13)', () => {
  const SAME_MONTH = ['2026-10-12', '2026-10-25'] as const;
  const CROSS_MONTH = ['2026-09-28', '2026-10-11'] as const;
  const CROSS_YEAR = ['2026-12-21', '2027-01-03'] as const;

  it('tells how the two ends relate', () => {
    expect(rangeKind(...SAME_MONTH)).toBe('same-month');
    expect(rangeKind(...CROSS_MONTH)).toBe('cross-month');
    expect(rangeKind(...CROSS_YEAR)).toBe('cross-year');
  });

  it('has five forms inside one month, longest first', () => {
    expect(rangeLadder(...SAME_MONTH)).toEqual(['full', 'no-start-year', 'no-years', 'end-day', 'tight']);
    expect(rangeLadder('2026-10-01', '2026-10-14')).toEqual(rangeLadder(...SAME_MONTH));
  });

  it('skips both "end day only" forms across months (the end month is needed)', () => {
    expect(rangeLadder(...CROSS_MONTH)).toEqual(['full', 'no-start-year', 'no-years']);
  });

  it('skips "no start year" across years, and the end-day forms with it (the months differ too)', () => {
    expect(rangeLadder(...CROSS_YEAR)).toEqual(['full', 'no-years']);
  });

  it('prints each form of a one-month range', () => {
    expect(rangeText(...SAME_MONTH, 'full')).toBe('10/12/2026 → 10/25/2026');
    expect(rangeText(...SAME_MONTH, 'no-start-year')).toBe('10/12 → 10/25/2026');
    expect(rangeText(...SAME_MONTH, 'no-years')).toBe('10/12 → 10/25');
    expect(rangeText(...SAME_MONTH, 'end-day')).toBe('10/12 → 25');
    expect(rangeText(...SAME_MONTH, 'tight')).toBe('10/12→25');
  });

  it('keeps the end month across months and the end year across years', () => {
    expect(rangeText(...CROSS_MONTH, 'no-start-year')).toBe('09/28 → 10/11/2026');
    expect(rangeText(...CROSS_MONTH, 'no-years')).toBe('09/28 → 10/11');
    expect(rangeText(...CROSS_YEAR, 'full')).toBe('12/21/2026 → 01/03/2027');
    expect(rangeText(...CROSS_YEAR, 'no-years')).toBe('12/21 → 01/03');
  });

  it('is the full text in parts: joined, the parts are the full form, and the spoken text is always the full dates with "to"', () => {
    const parts = rangeParts(...CROSS_YEAR);
    expect(parts).toEqual({ startMonthDay: '12/21', startYear: '/2026', endMonth: '01/', endDay: '03', endYear: '/2027' });
    expect(`${parts.startMonthDay}${parts.startYear} → ${parts.endMonth}${parts.endDay}${parts.endYear}`).toBe(rangeText(...CROSS_YEAR, 'full'));
    expect(rangeSpokenText(...SAME_MONTH)).toBe('10/12/2026 to 10/25/2026');
    expect(rangeSpokenText(...CROSS_YEAR)).toBe('12/21/2026 to 01/03/2027');
  });

  it('gets shorter with every step (the longest form that fits is shown first)', () => {
    const lengths = rangeLadder(...SAME_MONTH).map((step) => rangeText(...SAME_MONTH, step).length);
    expect(lengths).toEqual([...lengths].sort((a, b) => b - a));
    expect(new Set(lengths).size).toBe(lengths.length);
  });
});

/*
 * The pill of the shown period (U-09, G-5 b). The periods are the server's `current` (R-07: the ended period during the five window days
 * after it ends) and `in_progress` (the period that contains today). Synthetic payroll dates: 2026-10-30 (the period 10/12-10/25),
 * 2026-11-13 (10/26-11/08) and 2026-10-16 (the period before), the way the server numbers them.
 */
describe('periodPillKind', () => {
  const OLD = { payroll_date: '2026-10-16', relation: 'old' as const };
  const ENDED = { payroll_date: '2026-10-30', relation: 'current' as const };
  const NEXT = { payroll_date: '2026-11-13', relation: 'future' as const };

  /** A normal day (mid-period): the period with today is the current one. */
  const normalDay = { current: { payroll_date: '2026-10-30' }, in_progress: { payroll_date: '2026-10-30' } };
  /** A window day (the five days after 10/25): current is the ended period, in_progress the one that contains today. */
  const windowDay = { current: { payroll_date: '2026-10-30' }, in_progress: { payroll_date: '2026-11-13' } };

  it('keeps the server relation on a normal day, whatever the period', () => {
    expect(periodPillKind(OLD, normalDay)).toBe('old');
    expect(periodPillKind(ENDED, normalDay)).toBe('current');
    expect(periodPillKind(NEXT, normalDay)).toBe('future');
  });

  it('reads "in progress" only for the period with today while the period before it is still the current one', () => {
    expect(periodPillKind(NEXT, windowDay)).toBe('in-progress');
    // The ended period stays current and the older one old: only today's period changes.
    expect(periodPillKind(ENDED, windowDay)).toBe('current');
    expect(periodPillKind(OLD, windowDay)).toBe('old');
    // The period after today's is still future.
    expect(periodPillKind({ payroll_date: '2026-11-27', relation: 'future' }, windowDay)).toBe('future');
  });

  it('decides from the payroll dates, not from the relation word (the edit-reason relation of that period stays future)', () => {
    expect(NEXT.relation).toBe('future');
    expect(periodPillKind({ payroll_date: NEXT.payroll_date }, windowDay)).toBe('in-progress');
  });

  it('uses the periods of the owner in a shared view exactly like the own view (one function, same inputs)', () => {
    const ownersPeriods = { current: { payroll_date: '2026-10-30' }, in_progress: { payroll_date: '2026-11-13' } };
    expect(periodPillKind(NEXT, ownersPeriods)).toBe(periodPillKind(NEXT, windowDay));
    expect(periodPillKind(NEXT, ownersPeriods)).toBe('in-progress');
  });

  it('is neutral without a relation, and falls back to the relation while the periods are not known', () => {
    expect(periodPillKind({ payroll_date: '2026-10-30' }, normalDay)).toBe('neutral');
    expect(periodPillKind({ payroll_date: '2026-11-13' }, null)).toBe('neutral');
    expect(periodPillKind(NEXT, null)).toBe('future');
  });

  it('has a word for every coloured kind and none for the grey one', () => {
    expect(PERIOD_PILL_WORDS).toEqual({ old: 'old', current: 'current', future: 'future', 'in-progress': 'in progress', neutral: '' });
  });
});

describe('dueInZoneText', () => {
  it('prints the due instant in the display zone in the US form of the bar', () => {
    // 2026-10-14T00:00:00Z is 17:00 on Tue 10/13 in Los Angeles and 07:00 on Wed 10/14 in Ho Chi Minh City.
    expect(dueInZoneText('2026-10-14T00:00:00Z', 'Asia/Ho_Chi_Minh')).toBe('Wed 10/14/2026, 07:00');
    expect(dueInZoneText('2026-10-14T00:00:00Z', 'America/Los_Angeles')).toBe('Tue 10/13/2026, 17:00');
  });
});

describe('viewingZoneText', () => {
  it('always names the display zone, whether or not it equals the reporting zone', () => {
    expect(viewingZoneText('America/Los_Angeles')).toBe('Times in America/Los_Angeles');
    expect(viewingZoneText('Asia/Ho_Chi_Minh')).toBe('Times in Asia/Ho_Chi_Minh');
  });
});

describe('zoneNoteVisible', () => {
  it('shows only when the display zone differs from the reporting zone', () => {
    expect(zoneNoteVisible('America/Los_Angeles', 'America/Los_Angeles')).toBe(false);
    expect(zoneNoteVisible('America/Los_Angeles', 'Asia/Ho_Chi_Minh')).toBe(true);
  });
});

describe('runningSessionOf', () => {
  it('finds the session with no end across the days', () => {
    const open = session('b', '2026-12-03T16:12:00Z', null);
    const view = { days: [day('2026-12-02', [session('a', '2026-12-02T16:00:00Z', '2026-12-03T00:00:00Z')]), day('2026-12-03', [open])] };
    expect(runningSessionOf(view)).toBe(open);
  });

  it('returns undefined when every session has ended', () => {
    const view = { days: [day('2026-12-02', [session('a', '2026-12-02T16:00:00Z', '2026-12-03T00:00:00Z')]), day('2026-12-03', [])] };
    expect(runningSessionOf(view)).toBeUndefined();
  });
});

describe('clockedInText', () => {
  it('shows the start in the display zone, not the reporting zone', () => {
    const running = session('b', '2026-12-03T16:12:00Z', null);
    expect(clockedInText(running, 'America/Los_Angeles')).toEqual({ time: '08:12', day: 'Thu 12/03' });
    expect(clockedInText(running, 'Asia/Ho_Chi_Minh')).toEqual({ time: '23:12', day: 'Thu 12/03' });
  });

  it('moves to the next local date when the display zone is ahead', () => {
    const running = session('b', '2026-12-03T20:30:00Z', null);
    expect(clockedInText(running, 'Asia/Ho_Chi_Minh')).toEqual({ time: '03:30', day: 'Fri 12/04' });
  });
});
