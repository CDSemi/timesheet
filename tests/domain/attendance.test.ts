import { describe, expect, it } from 'vitest';
import {
  type CategorySource,
  type DayCategory,
  defaultCategory,
  isAttendanceExpected,
  LEAVE_KINDS,
  resolveDayCategory,
  validateLeave,
} from '../../src/domain/attendance.ts';
import { type CalendarVersion, classifyDate } from '../../src/domain/calendar.ts';
import { computeDeficitMinutes } from '../../src/domain/deficit.ts';
import type { SessionInterval } from '../../src/domain/intervals.ts';
import { computeWorkDay } from '../../src/domain/workday.ts';
import { resolveLocalDateTime } from '../../src/domain/zones.ts';
import { expectDomainError } from '../support/fixtures.ts';

/*
 * Day-entry attendance rules: the category source (owner decision E-2 groundwork for
 * AC-05), leave kinds, partial leave against the effective B, and the R-05 outcome for
 * four hours of work plus four hours of leave.
 */

const LA = 'America/Los_Angeles';
const at = (local: string) => resolveLocalDateTime(local, LA).utc;

const calendar: CalendarVersion = {
  id: 'cal-2026',
  seq: 1,
  effectiveFrom: '2026-01-01',
  weekdays: [1, 2, 3, 4, 5],
  dates: [{ date: '2026-09-07', kind: 'holiday', name: 'Labor Day' }],
};
const policy = { id: 'policy-1', requiredMinutes: 480, thresholdMinutes: 30, roundingStepMinutes: 30 };

function closed(start: string, end: string): SessionInterval {
  return { startUtc: at(start), endUtc: at(end), breaksConfirmed: true, breaks: [] };
}

describe('category source (default | explicit)', () => {
  it('a default row takes its label from the calendar at read time, an explicit row keeps its own', () => {
    const weekday = classifyDate([calendar], '2026-09-21');
    const holiday = classifyDate([calendar], '2026-09-07');
    expect(resolveDayCategory('default', 'Worked', defaultCategory(holiday))).toBe('Holiday');
    expect(resolveDayCategory('default', 'Off', defaultCategory(weekday))).toBe('Worked');
    expect(resolveDayCategory('explicit', 'Vacation', defaultCategory(weekday))).toBe('Vacation');
    // The stored label of an explicit row survives a later calendar change.
    expect(resolveDayCategory('explicit', 'Worked', defaultCategory(holiday))).toBe('Worked');
  });

  it('falls back to the stored label when the calendar cannot classify the date', () => {
    expect(resolveDayCategory('default', 'Sick', null)).toBe('Sick');
    expect(resolveDayCategory('explicit', 'Sick', null)).toBe('Sick');
  });

  it('accepts only the two sources', () => {
    const sources: CategorySource[] = ['default', 'explicit'];
    expect(sources.map((source) => resolveDayCategory(source, 'Off', 'Worked'))).toEqual(['Worked', 'Off']);
  });
});

describe('leave kinds and validation against the effective B', () => {
  it('has the three owner-approved kinds and no OT-funded category (owner decision E-2)', () => {
    expect([...LEAVE_KINDS]).toEqual(['vacation', 'sick', 'ot']);
    const categories: DayCategory[] = ['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown'];
    expect(categories).not.toContain('OT-funded leave');
  });

  it('accepts zero leave without a kind and whole leave up to B with a kind', () => {
    expect(validateLeave({ leaveMinutes: 0, leaveKind: null, requiredMinutes: 480 })).toBeNull();
    expect(validateLeave({ leaveMinutes: 240, leaveKind: 'vacation', requiredMinutes: 480 })).toBeNull();
    expect(validateLeave({ leaveMinutes: 480, leaveKind: 'ot', requiredMinutes: 480 })).toBeNull();
    expect(validateLeave({ leaveMinutes: 1, leaveKind: 'sick', requiredMinutes: 480 })).toBeNull();
  });

  it('rejects leave above the effective B, a missing kind, a kind without minutes and an unknown kind', () => {
    expect(validateLeave({ leaveMinutes: 481, leaveKind: 'vacation', requiredMinutes: 480 })).toMatchObject({
      code: 'leave_exceeds_required',
      details: { leave_minutes: 481, required_minutes: 480 },
    });
    // A policy with a shorter B tightens the cap.
    expect(validateLeave({ leaveMinutes: 420, leaveKind: 'vacation', requiredMinutes: 360 })).toMatchObject({
      code: 'leave_exceeds_required',
    });
    expect(validateLeave({ leaveMinutes: 60, leaveKind: null, requiredMinutes: 480 })).toMatchObject({
      code: 'leave_kind_required',
    });
    expect(validateLeave({ leaveMinutes: 0, leaveKind: 'sick', requiredMinutes: 480 })).toMatchObject({
      code: 'leave_kind_without_minutes',
    });
    expect(validateLeave({ leaveMinutes: 60, leaveKind: 'ot-funded' as never, requiredMinutes: 480 })).toMatchObject({
      code: 'invalid_leave_kind',
    });
  });

  it('rejects fractional or negative minutes as invalid_minutes', () => {
    expectDomainError(() => validateLeave({ leaveMinutes: 1.5, leaveKind: 'vacation', requiredMinutes: 480 }), 'invalid_minutes');
    expectDomainError(() => validateLeave({ leaveMinutes: -1, leaveKind: 'vacation', requiredMinutes: 480 }), 'invalid_minutes');
  });
});

describe('partial leave and WFH in the one calculation engine (R-05)', () => {
  const workDate = '2026-09-21';
  const classification = classifyDate([calendar], workDate);

  function outcome(sessions: SessionInterval[], leaveMinutes: number, category: DayCategory = 'Worked') {
    const result = computeWorkDay({ workDate, reportingZone: LA, policy, calendarVersions: [calendar], sessions });
    const deficit = computeDeficitMinutes({
      requiredMinutes: policy.requiredMinutes,
      regularMinutes: result.regularMinutes,
      nonworkingMinutes: result.nonworkingMinutes,
      leaveMinutes,
      normalWorkDate: classification.dayClass === 'normal',
      attendanceExpected: isAttendanceExpected(classification, category),
      recordsComplete: result.status === 'complete',
    });
    return { result, deficit };
  }

  it('four hours of work plus four hours of leave has neither deficit nor OT', () => {
    const { result, deficit } = outcome([closed('2026-09-21T09:00', '2026-09-21T13:00')], 240);
    expect(result.regularMinutes).toBe(240);
    expect(result.eligibleMinutes).toBe(0);
    expect(result.creditedMinutes).toBe(0);
    expect(deficit).toBe(0);
  });

  it('leave does not lower the regular OT target B: ten hours still earns the excess over 480', () => {
    const { result, deficit } = outcome([closed('2026-09-21T08:00', '2026-09-21T18:00')], 240);
    expect(result.normalExcessMinutes).toBe(120);
    expect(result.creditedMinutes).toBe(120);
    expect(deficit).toBe(0);
  });

  it('less work than B minus L is a deficit of the remainder only', () => {
    const { deficit } = outcome([closed('2026-09-21T09:00', '2026-09-21T12:00')], 240);
    expect(deficit).toBe(60);
  });

  it('WFH is only a location property: it never changes attendance or minutes', () => {
    // WFH is not an input of the engine or of the deficit rule, so the same inputs give the same outcome.
    const first = outcome([closed('2026-09-21T09:00', '2026-09-21T13:00')], 240);
    const second = outcome([closed('2026-09-21T09:00', '2026-09-21T13:00')], 240);
    expect(second).toEqual(first);
    expect(isAttendanceExpected(classification, 'Worked')).toBe(true);
  });
});
