import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Period } from '../../src/client/api.ts';
import {
  currentPeriodJump,
  currentStatusText,
  periodContains,
  todayDescription,
  todayJump,
  todayStatusText,
} from '../../src/client/components/periodJumpModel.ts';
import { addDays } from '../../src/domain/dates.ts';
import { formatUtcInstant } from '../../src/domain/instants.ts';
import {
  currentPayPeriod,
  type PayPeriod,
  type PayrollException,
  type PayrollScheduleRules,
  payPeriodAt,
  payPeriodContaining,
} from '../../src/domain/periods.ts';
import { localDateOf, resolveLocalDateTimeCompatible } from '../../src/domain/zones.ts';

/*
 * WP5-UX2-T04: the two jump buttons of the period bar. The server's `current` (R-07: the earliest payroll date on or
 * after today) and `in_progress` (the period that contains today) are built with the production functions, and the
 * reporting-zone "today" is stepped through every day of whole periods at the wall times that matter (the due Tuesday
 * just before and after 17:00, the Los Angeles midnight, the last minute of the day) and across both DST days.
 *
 * For the default schedule `current` differs from `in_progress` on five days of every cycle (the Monday after a period
 * ends through its payroll Friday); a payroll exception that moves a payroll date moves that window with it.
 */

const LA = 'America/Los_Angeles';
const SCHEDULE: PayrollScheduleRules = {
  anchorPayrollDate: '2026-10-02',
  cycleDays: 14,
  periodStartOffsetDays: -18,
  periodEndOffsetDays: -5,
  dueOffsetDays: -3,
  dueLocalTime: '17:00',
  reportingZone: LA,
};
const WALL_TIMES = ['00:00', '16:59', '17:00', '23:59'] as const;

/** The period as the API returns it (`periodJson`): ISO dates as text. */
function apiPeriod(period: PayPeriod): Period {
  return {
    payroll_date: period.payrollDate,
    period_start: period.periodStart,
    period_end: period.periodEnd,
    due_local_date: period.dueLocalDate,
    due_local_time: period.dueLocalTime,
    due_at_utc: formatUtcInstant(period.dueAtUtc),
  };
}

interface Step {
  /** The reporting-zone date at that wall time: the server's `today_local`. */
  today: string;
  time: string;
  periods: Period[];
  current: Period;
  inProgress: Period;
}

/** The server's answer for every wall time of every day in `[from, from + days)`, plus the periods around it. */
function steps(from: string, days: number, exceptions: readonly PayrollException[] = []): Step[] {
  const out: Step[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(from, offset);
    for (const time of WALL_TIMES) {
      const today = localDateOf(LA, resolveLocalDateTimeCompatible(`${date}T${time}`, LA));
      const inProgress = payPeriodContaining(SCHEDULE, today, exceptions);
      const current = currentPayPeriod(SCHEDULE, today, exceptions);
      const around = [-1, 0, 1].map((shift) => payPeriodAt(SCHEDULE, inProgress.index + shift, exceptions));
      out.push({ today, time, periods: around.map(apiPeriod), current: apiPeriod(current), inProgress: apiPeriod(inProgress) });
    }
  }
  return out;
}

/** Three cycles from the Monday of a period start, then the two DST days (2026-11-01 and 2027-03-14) with a period either side. */
const RANGES: ReadonlyArray<readonly [string, number]> = [
  ['2026-09-14', 56], // four periods around the 2026-10-12 .. 2026-10-25 one
  ['2026-10-26', 28], // 2026-11-01, the fall-back day
  ['2027-03-01', 28], // 2027-03-14, the spring-forward day
];

const EXCEPTIONS: PayrollException[] = [
  // The 2026-10-16 payroll moves to the following Monday: the ended period stays current three days longer.
  { nominalPayrollDate: '2026-10-16', payrollDate: '2026-10-19' },
  // The 2026-10-30 payroll is paid earlier, on the Wednesday: the window shrinks to its first three days.
  { nominalPayrollDate: '2026-10-30', payrollDate: '2026-10-28' },
];

const EDITOR_DATES = (today: string): Array<string | null> => [null, today, addDays(today, -1), addDays(today, 3)];

function allSteps(exceptions: readonly PayrollException[] = []): Step[] {
  return RANGES.flatMap(([from, days]) => steps(from, days, exceptions));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Today (todayJump)', () => {
  for (const [label, exceptions] of [
    ['the default schedule', []],
    ['a schedule with payroll exceptions that move a payroll date', EXCEPTIONS],
  ] as const) {
    it(`targets the period that contains today and never the ended current period, on every step: ${label}`, () => {
      let windowSteps = 0;
      for (const step of allSteps(exceptions)) {
        const where = `${step.today} ${step.time}`;
        const window = step.current.payroll_date !== step.inProgress.payroll_date;
        if (window) windowSteps += 1;
        for (const shown of step.periods) {
          const jump = todayJump({ today: step.today, current: step.current, inProgress: step.inProgress, shown, editDate: null });
          expect(jump.targetPayrollDate, `${where}: the target is the in-progress period`).toBe(step.inProgress.payroll_date);
          expect(periodContains(step.inProgress, step.today), `${where}: the target contains today`).toBe(true);
          if (window) expect(jump.targetPayrollDate, `${where}: in the window Today never targets current`).not.toBe(step.current.payroll_date);
          else expect(jump.targetPayrollDate, `${where}: outside the window Today and current have one target`).toBe(step.current.payroll_date);
        }
      }
      expect(windowSteps, 'the window days were exercised').toBeGreaterThan(0);
    });

    it(`is active exactly when the shown period lacks today or the editor is on another date: ${label}`, () => {
      for (const step of allSteps(exceptions)) {
        for (const shown of step.periods) {
          // The oracle is the periods' payroll dates (the periods tile), independent of the date comparison in the model.
          const showsToday = shown.payroll_date === step.inProgress.payroll_date;
          for (const editDate of EDITOR_DATES(step.today)) {
            const jump = todayJump({ today: step.today, current: step.current, inProgress: step.inProgress, shown, editDate });
            const editorElsewhere = editDate !== null && editDate !== step.today;
            expect(jump.away, `${step.today} shown ${shown.payroll_date} editor ${editDate}`).toBe(!showsToday || editorElsewhere);
            expect(jump.moveEditorTo, `${step.today} editor ${editDate}`).toBe(editorElsewhere ? step.today : null);
          }
        }
      }
    });
  }

  it('never reads the device clock: a clock years away changes nothing', () => {
    const step = steps('2026-10-12', 1)[0];
    if (step === undefined) throw new Error('no step');
    const shown = step.periods[1];
    if (shown === undefined) throw new Error('no shown period');
    const input = { today: step.today, current: step.current, inProgress: step.inProgress, shown, editDate: null };
    const pair = { current: step.current, inProgress: step.inProgress, shown };
    const before = { today: todayJump(input), current: currentPeriodJump(pair) };
    vi.useFakeTimers({ now: new Date('2031-06-30T23:59:59Z') });
    expect({ today: todayJump(input), current: currentPeriodJump(pair) }).toEqual(before);
    vi.setSystemTime(new Date('2020-01-01T00:00:00Z'));
    expect({ today: todayJump(input), current: currentPeriodJump(pair) }).toEqual(before);
  });
});

describe('Current period (currentPeriodJump)', () => {
  for (const [label, exceptions] of [
    ['the default schedule', []],
    ['a schedule with payroll exceptions that move a payroll date', EXCEPTIONS],
  ] as const) {
    it(`is hidden outside the window, and inside it shown exactly when the sheet shows another period: ${label}`, () => {
      let hidden = 0;
      let shownCount = 0;
      for (const step of allSteps(exceptions)) {
        const where = `${step.today} ${step.time}`;
        const window = step.current.payroll_date !== step.inProgress.payroll_date;
        for (const shown of step.periods) {
          const jump = currentPeriodJump({ current: step.current, inProgress: step.inProgress, shown });
          expect(jump.targetPayrollDate, `${where}: the target is the R-07 current period`).toBe(step.current.payroll_date);
          if (!window) {
            expect(jump.visible, `${where}: outside the window it is hidden for every shown period`).toBe(false);
            hidden += 1;
          } else {
            expect(jump.visible, `${where}: in the window it is shown while another period is shown`).toBe(shown.payroll_date !== step.current.payroll_date);
            if (jump.visible) shownCount += 1;
          }
        }
      }
      expect(hidden).toBeGreaterThan(0);
      expect(shownCount).toBeGreaterThan(0);
    });
  }

  it('Today and Current period reach different periods exactly on the window days', () => {
    for (const step of allSteps(EXCEPTIONS)) {
      const [, shown] = step.periods;
      if (shown === undefined) throw new Error('no shown period');
      const today = todayJump({ today: step.today, current: step.current, inProgress: step.inProgress, shown, editDate: null });
      const current = currentPeriodJump({ current: step.current, inProgress: step.inProgress, shown: step.inProgress });
      expect(today.targetPayrollDate !== current.targetPayrollDate, `${step.today} ${step.time}`).toBe(step.current.payroll_date !== step.inProgress.payroll_date);
    }
  });
});

describe('negative control: the old rule (Today targets current)', () => {
  it('fails the "target contains today" rule on every window day, and only on those', () => {
    let violations = 0;
    let windowDays = 0;
    for (const step of allSteps()) {
      const window = step.current.payroll_date !== step.inProgress.payroll_date;
      const oldTarget = step.current;
      const containsToday = periodContains(oldTarget, step.today);
      if (window) windowDays += 1;
      if (!containsToday) violations += 1;
      expect(containsToday, `${step.today} ${step.time}: the old target contains today only outside the window`).toBe(!window);
    }
    expect(windowDays).toBeGreaterThan(0);
    expect(violations).toBe(windowDays);
  });
});

describe('the hidden texts', () => {
  it('words the Today status in the US format with the weekday of the accounting date', () => {
    expect(todayStatusText('2026-10-14', { period_start: '2026-10-12', period_end: '2026-10-25' })).toBe(
      'Showing today, Wed 10/14/2026, in the period 10/12/2026 to 10/25/2026',
    );
  });

  it('words the Current period status', () => {
    expect(currentStatusText({ period_start: '2026-09-28', period_end: '2026-10-11' })).toBe('Showing the current period 09/28/2026 to 10/11/2026');
  });

  it('describes Today by what it does, or why it is inactive', () => {
    expect(todayDescription(true)).toBe("Opens the period that contains today's date");
    expect(todayDescription(false)).toBe('Already showing today');
  });
});
