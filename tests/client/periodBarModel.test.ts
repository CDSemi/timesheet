import { describe, expect, it } from 'vitest';
import type { DayView, Session } from '../../src/client/api.ts';
import { clockedInText, dueInWords, dueInZoneText, dueParts, reviewShortLabel, runningSessionOf, viewingZoneText, weekdayName, zoneNoteVisible } from '../../src/client/components/periodBarModel.ts';

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
    expect(reviewShortLabel('Something else')).toBe('Something else');
  });

  it('keeps every full label containing its short form (SC 2.5.3: the accessible name contains the visible text)', () => {
    for (const label of ['Review & sign off', 'Review now', 'Review or correct']) {
      expect(label.toLowerCase()).toContain(reviewShortLabel(label).toLowerCase());
    }
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
