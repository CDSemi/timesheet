import { describe, expect, it } from 'vitest';
import type { BatchConflict, Calculation, DayEntry, DayView, Session } from '../../src/client/api.ts';
import {
  batchEntries,
  completenessOf,
  conflictDetails,
  isPendingOt,
  reviewStatus,
  staleDates,
  staleReloadMessage,
  toDayDisplay,
  weekGroups,
} from '../../src/client/components/dayModel.ts';

function calculation(status: Calculation['status'], regular: number | null = null): Calculation {
  return {
    status,
    provisional: true,
    policy_version_id: 'policy-1',
    gross_seconds: 0,
    excluded_break_seconds: 0,
    regular_seconds: 0,
    nonworking_seconds: 0,
    regular_minutes: regular,
    nonworking_minutes: null,
    normal_excess_minutes: null,
    eligible_minutes: null,
    credited_minutes: null,
    segments: [],
  };
}

function session(id: string, workDate: string): Session {
  return {
    id,
    work_date: workDate,
    start_utc: `${workDate}T16:00:00Z`,
    end_utc: `${workDate}T17:00:00Z`,
    input_zone: 'America/Los_Angeles',
    source: 'clock',
    breaks_confirmed: true,
    version: 1,
    breaks: [],
  };
}

function entry(workDate: string, version: number): DayEntry {
  return {
    id: `entry-${workDate}`,
    work_date: workDate,
    category: 'Off',
    category_source: 'explicit',
    leave_minutes: 0,
    leave_kind: null,
    wfh: false,
    notes: '',
    version,
  };
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

describe('completenessOf and isPendingOt', () => {
  it('maps every server calculation status to text plus a shape', () => {
    expect(completenessOf(day('2026-09-29', { calculation: calculation('complete', 480) }))).toEqual({
      completeness: 'complete',
      text: 'complete',
      shape: 'circle',
    });
    expect(completenessOf(day('2026-09-29', { calculation: calculation('incomplete') })).completeness).toBe('open_session');
    expect(completenessOf(day('2026-09-29', { calculation: calculation('incomplete_breaks') })).completeness).toBe('confirm_breaks');
  });

  it('shows an expected day without records as missing, not as pending OT', () => {
    const missing = day('2026-09-29', { calculation: calculation('no_records') });
    expect(completenessOf(missing)).toMatchObject({ completeness: 'missing', shape: 'square' });
    expect(isPendingOt(missing)).toBe(false);
  });

  it('shows a day that is not expected as not expected', () => {
    const off = day('2026-10-03', { attendance_expected: false, calculation: null });
    expect(completenessOf(off)).toMatchObject({ completeness: 'not_expected', text: 'not expected' });
  });

  it('reports a calculation error in words', () => {
    const broken = day('2026-09-29', { calculation_error: 'policy_missing' });
    expect(completenessOf(broken)).toEqual({ completeness: 'error', text: 'policy missing', shape: 'triangle' });
  });

  it('flags pending OT only for an open session or unconfirmed breaks, as the server counts it', () => {
    expect(isPendingOt(day('2026-09-29', { calculation: calculation('incomplete') }))).toBe(true);
    expect(isPendingOt(day('2026-09-29', { calculation: calculation('incomplete_breaks') }))).toBe(true);
    expect(isPendingOt(day('2026-09-29', { calculation: calculation('complete') }))).toBe(false);
  });
});

describe('toDayDisplay', () => {
  it('passes server minutes through and never computes them', () => {
    const display = toDayDisplay(day('2026-09-29', { calculation: calculation('complete', 480) }));
    expect(display).toMatchObject({ weekday: 'Tue', regularMinutes: 480, offCalendarMinutes: null, creditedMinutes: null });
  });

  it('uses plain words for missing values and keeps the entry version', () => {
    const display = toDayDisplay(day('2026-10-03', { category: null, classification: null, entry: entry('2026-10-03', 3) }));
    expect(display).toMatchObject({ category: 'none', calendarLabel: 'unclassified', entryVersion: 3 });
  });

  it('marks non-working days and explicit categories', () => {
    const display = toDayDisplay(
      day('2026-10-03', {
        classification: { day_class: 'nonworking', reason: 'holiday', name: 'Founders Day' },
        category_source: 'explicit',
      }),
    );
    expect(display).toMatchObject({ nonworking: true, calendarLabel: 'Founders Day', categoryExplicit: true });
  });
});

describe('weekGroups', () => {
  it('splits a two-week period into Monday to Sunday groups', () => {
    const dates = Array.from({ length: 14 }, (_, index) => new Date(Date.UTC(2026, 8, 28 + index)).toISOString().slice(0, 10));
    const groups = weekGroups(dates.map((date) => day(date)));
    expect(groups.map((group) => [group.weekStart, group.days.length])).toEqual([
      ['2026-09-28', 7],
      ['2026-10-05', 7],
    ]);
    expect(groups[0]?.days[0]?.weekday).toBe('Mon');
    expect(groups[1]?.days[6]?.weekday).toBe('Sun');
  });

  it('groups a period that starts mid-week into partial weeks', () => {
    const groups = weekGroups([day('2026-09-30'), day('2026-10-01'), day('2026-10-05')]);
    expect(groups.map((group) => [group.weekStart, group.days.length])).toEqual([
      ['2026-09-28', 2],
      ['2026-10-05', 1],
    ]);
  });

  it('returns nothing for no days', () => {
    expect(weekGroups([])).toEqual([]);
  });
});

describe('batchEntries', () => {
  it('builds date-ordered entries with the version each day was loaded at', () => {
    const days = [day('2026-09-29'), day('2026-09-30', { entry: entry('2026-09-30', 4) }), day('2026-10-01')];
    expect(batchEntries(days, new Set(['2026-10-01', '2026-09-30']), 'Vacation')).toEqual([
      { work_date: '2026-09-30', category: 'Vacation', expected_version: 4 },
      { work_date: '2026-10-01', category: 'Vacation', expected_version: null },
    ]);
  });
});

describe('conflictDetails', () => {
  it('joins conflicts to the loaded sessions by work_date', () => {
    const conflict: BatchConflict = {
      work_date: '2026-09-30',
      session_count: 1,
      clock_session_count: 1,
      open_session_count: 0,
      session_ids: ['s1'],
      current_category: 'Worked',
      new_category: 'Off',
    };
    const days = [day('2026-09-29'), day('2026-09-30', { sessions: [session('s1', '2026-09-30')] })];
    const [detail] = conflictDetails([conflict], days);
    expect(detail?.sessions.map((item) => item.id)).toEqual(['s1']);
  });

  it('returns no sessions when the date is not loaded', () => {
    const conflict: BatchConflict = {
      work_date: '2026-11-01',
      session_count: 1,
      clock_session_count: 0,
      open_session_count: 0,
      session_ids: ['s9'],
      current_category: null,
      new_category: 'Off',
    };
    expect(conflictDetails([conflict], [day('2026-09-29')])[0]?.sessions).toEqual([]);
  });
});

describe('stale version messages', () => {
  it('reads the dates from error details and ignores anything else', () => {
    expect(staleDates({ work_dates: ['2026-09-30', 7, '2026-10-01'] })).toEqual(['2026-09-30', '2026-10-01']);
    expect(staleDates({ work_dates: 'nope' })).toEqual([]);
    expect(staleDates(undefined)).toEqual([]);
  });

  it('names the affected dates and says nothing was saved', () => {
    const message = staleReloadMessage(['2026-09-30', '2026-10-01']);
    expect(message).toContain('2026-09-30, 2026-10-01');
    expect(message).toContain('Nothing was saved');
    expect(staleReloadMessage([])).toContain('Some dates');
  });
});

describe('reviewStatus', () => {
  it('shows only draft or finalized', () => {
    expect(reviewStatus({ id: null, version: 1, finalized: false })).toBe('Draft');
    expect(reviewStatus({ id: 't1', version: 2, finalized: true })).toBe('Finalized');
  });
});
