import { describe, expect, it } from 'vitest';
import { formatUtcInstant, parseUtcInstant } from '../../src/domain/instants.ts';
import { type PayrollException, type PayrollScheduleRules, payPeriodAt, payPeriodForPayrollDate } from '../../src/domain/periods.ts';
import {
  beforeDueKey,
  describeDeadline,
  noticeInstant,
  normalizeReminderOffsets,
  OVERDUE_KEY,
  outcomeKey,
  planPreDeadline,
  renderReminder,
  reviewLink,
} from '../../src/domain/reminders.ts';
import { dateTimeIn, instantOfWallTime } from '../client/zoneOracle.ts';

/*
 * WP3-T11: the pure reminder rules (docs/05 "Reminders and review links", AC-09). Deadlines come
 * from the production pay-period functions in the saved reporting zone; every expectation about
 * wall time is derived with the independent zone oracle, so nothing here assumes a UTC offset or
 * a season. Offsets before the deadline are elapsed time (R-07: durations are UTC seconds), so
 * across a DST change the wall clock of a reminder differs by an hour from the deadline's.
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

const at = (value: string) => parseUtcInstant(value);
const utc = (instant: number) => formatUtcInstant(instant);
const H = 3600;

function plan(due: string, now: string, options: { offsets?: number[]; activeFrom?: string | null; decided?: string[] } = {}) {
  return planPreDeadline({
    dueAtUtc: at(due),
    nowUtc: at(now),
    offsetsMinutes: options.offsets ?? [1440, 120],
    activeFromUtc: options.activeFrom === null ? null : at(options.activeFrom ?? '2026-01-01T00:00:00Z'),
    decidedKeys: new Set(options.decided ?? []),
  });
}

describe('offsets and keys', () => {
  it('keeps positive whole minutes once each, longest first', () => {
    expect(normalizeReminderOffsets([120, 1440, 120, 0, -5, 1.5, 60])).toEqual([1440, 120, 60]);
    expect(normalizeReminderOffsets([])).toEqual([]);
  });

  it('builds distinct, stable occurrence keys', () => {
    expect(beforeDueKey(1440)).not.toBe(beforeDueKey(120));
    expect(beforeDueKey(120)).toBe(beforeDueKey(120));
    expect(outcomeKey('rev-1')).not.toBe(outcomeKey('rev-2'));
    expect(OVERDUE_KEY).toBe('overdue');
  });
});

describe('the reminder instant is elapsed time before the production deadline', () => {
  it('is exactly 24 h and 2 h before the deadline of an ordinary period', () => {
    const due = payPeriodForPayrollDate(SCHEDULE, '2026-10-16', []).dueAtUtc;
    expect(noticeInstant(due, 1440)).toBe(due - 24 * H);
    expect(noticeInstant(due, 120)).toBe(due - 2 * H);
  });

  // Exceptions put the deadline on the Sunday of a DST change; the reminders still sit 24 h and 2 h
  // earlier in elapsed time, which the wall clock shows as 23 h or 25 h across the change.
  const cases: Array<{ label: string; nominal: string; payroll: string; dueDate: string; dueTime: string; before24: [string, string]; before2: [string, string] }> = [
    {
      label: 'clocks go back (autumn)',
      nominal: '2026-10-30',
      payroll: '2026-10-30',
      dueDate: '2026-11-01',
      dueTime: '12:00',
      before24: ['2026-10-31', '13:00'],
      before2: ['2026-11-01', '10:00'],
    },
    {
      label: 'clocks go forward (spring)',
      nominal: '2027-03-05',
      payroll: '2027-03-05',
      dueDate: '2027-03-14',
      dueTime: '12:00',
      before24: ['2027-03-13', '11:00'],
      before2: ['2027-03-14', '10:00'],
    },
  ];
  for (const item of cases) {
    it(`computes 24 h and 2 h before a deadline right after the change: ${item.label}`, () => {
      const exception: PayrollException = { nominalPayrollDate: item.nominal, payrollDate: item.payroll, dueLocalDate: item.dueDate, dueLocalTime: item.dueTime };
      const due = payPeriodForPayrollDate(SCHEDULE, item.payroll, [exception]).dueAtUtc;
      // The deadline equals the independent oracle's instant for the saved local time.
      expect(utc(due)).toBe(instantOfWallTime(item.dueDate, item.dueTime, LA).replace('.000Z', 'Z'));
      const first = utc(noticeInstant(due, 1440));
      const second = utc(noticeInstant(due, 120));
      expect(at(utc(due)) - at(first)).toBe(24 * H);
      expect(at(utc(due)) - at(second)).toBe(2 * H);
      // The wall clock of the 24 h reminder differs by an hour from the deadline's wall time (the change lies between them).
      expect(dateTimeIn(first, LA)).toBe(`${item.before24[0]} ${item.before24[1]}`);
      expect(dateTimeIn(second, LA)).toBe(`${item.before2[0]} ${item.before2[1]}`);
      expect(dateTimeIn(first, LA).slice(11)).not.toBe(item.dueTime);
    });
  }

  it('follows the production zone function for a deadline inside the spring gap', () => {
    // 02:30 on the spring-forward day does not exist; the production resolver chooses the instant.
    const exception: PayrollException = { nominalPayrollDate: '2027-03-05', payrollDate: '2027-03-05', dueLocalDate: '2027-03-14', dueLocalTime: '02:30' };
    const due = payPeriodForPayrollDate(SCHEDULE, '2027-03-05', [exception]).dueAtUtc;
    expect(payPeriodAt(SCHEDULE, 11, [exception]).dueAtUtc).toBe(due);
    expect(noticeInstant(due, 120)).toBe(due - 2 * H);
    expect(noticeInstant(due, 1440)).toBe(due - 24 * H);
  });
});

describe('planning the pre-deadline notices', () => {
  const due = '2026-10-14T00:00:00Z';
  const before = (seconds: number) => utc(at(due) - seconds);

  it('sends nothing before the first reminder is reached', () => {
    expect(plan(due, before(24 * H + 1))).toEqual({ send: null, collapsed: [] });
  });

  it('sends the 24 h reminder at exactly its instant and the 2 h reminder at exactly its instant', () => {
    expect(plan(due, before(24 * H))).toEqual({ send: 1440, collapsed: [] });
    expect(plan(due, before(2 * H + 1), { decided: [beforeDueKey(1440)] })).toEqual({ send: null, collapsed: [] });
    expect(plan(due, before(2 * H), { decided: [beforeDueKey(1440)] })).toEqual({ send: 120, collapsed: [] });
  });

  it('never repeats a decided notice (dedupe)', () => {
    expect(plan(due, before(10 * H), { decided: [beforeDueKey(1440)] })).toEqual({ send: null, collapsed: [] });
    expect(plan(due, before(1 * H), { decided: [beforeDueKey(1440), beforeDueKey(120)] })).toEqual({ send: null, collapsed: [] });
  });

  it('collapses everything missed during downtime into the one current notice', () => {
    expect(plan(due, before(90 * 60))).toEqual({ send: 120, collapsed: [1440] });
    expect(plan(due, before(10 * H))).toEqual({ send: 1440, collapsed: [] });
    expect(plan(due, before(10 * H), { offsets: [2880, 1440, 120] })).toEqual({ send: 1440, collapsed: [2880] });
  });

  it('does not send an older notice after a closer one was already decided', () => {
    // An offset added to the settings late must not produce a stale, longer-range notice.
    expect(plan(due, before(1 * H), { offsets: [1440, 720, 120], decided: [beforeDueKey(120)] })).toEqual({ send: null, collapsed: [1440, 720] });
  });

  it('sends nothing at or after the deadline', () => {
    expect(plan(due, due)).toEqual({ send: null, collapsed: [] });
    expect(plan(due, utc(at(due) + 5))).toEqual({ send: null, collapsed: [] });
  });

  it('sends nothing before the activation instant or for a deadline before it', () => {
    expect(plan(due, before(1 * H), { activeFrom: null })).toEqual({ send: null, collapsed: [] });
    expect(plan(due, before(1 * H), { activeFrom: utc(at(due) - 30 * 60) })).toEqual({ send: null, collapsed: [] });
    expect(plan(due, before(1 * H), { activeFrom: utc(at(due) + 1) })).toEqual({ send: null, collapsed: [] });
    expect(plan(due, before(1 * H), { activeFrom: utc(at(due) - 1 * H) })).toEqual({ send: 120, collapsed: [1440] });
  });

  it('sends nothing without offsets', () => {
    expect(plan(due, before(1 * H), { offsets: [] })).toEqual({ send: null, collapsed: [] });
  });
});

describe('the review link', () => {
  it('is a login-required deep link with the payroll date only', () => {
    expect(reviewLink('https://timesheet.example.invalid', '2026-10-02')).toBe('https://timesheet.example.invalid/#/review/2026-10-02');
    expect(reviewLink('https://timesheet.example.invalid/app', '2026-10-02')).toBe('https://timesheet.example.invalid/app/#/review/2026-10-02');
    expect(reviewLink('http://localhost:3000', '2026-10-02')).toMatch(/^http:\/\/localhost:3000\/#\/review\/\d{4}-\d{2}-\d{2}$/);
  });

  it('refuses a base that carries a token, credentials, a query or a fragment, and a malformed date', () => {
    for (const base of ['https://user:secret@timesheet.example.invalid', 'https://timesheet.example.invalid/?t=abc', 'https://timesheet.example.invalid/#x', 'ftp://timesheet.example.invalid', 'not a url', '']) {
      expect(() => reviewLink(base, '2026-10-02'), base).toThrow();
    }
    expect(() => reviewLink('https://timesheet.example.invalid', '2026-10-02?token=abc')).toThrow();
    expect(() => reviewLink('https://timesheet.example.invalid', '2026-13-45')).toThrow();
  });
});

describe('rendered notices', () => {
  const base = {
    payrollDate: '2026-10-02',
    periodStart: '2026-09-14',
    periodEnd: '2026-09-27',
    dueAtUtc: at('2026-09-30T00:00:00Z'),
    zone: LA,
    link: 'https://timesheet.example.invalid/#/review/2026-10-02',
  } as const;
  const firstLine = (text: string) => text.split('\n')[0] ?? '';

  it('describes the deadline in the saved reporting zone with its offset', () => {
    expect(describeDeadline(LA, at('2026-09-30T00:00:00Z'))).toBe(`${dateTimeIn('2026-09-30T00:00:00Z', LA)} (${LA}, UTC${offsetOf('2026-09-30T00:00:00Z')})`);
    expect(describeDeadline('UTC', at('2026-09-30T00:00:00Z'))).toBe('2026-09-30 00:00 (UTC, UTC+00:00)');
  });

  it('renders the before-deadline reminder with the time left and the link', () => {
    const now = at('2026-09-29T00:00:00Z');
    const notice = renderReminder({ ...base, kind: 'before_due', nowUtc: now });
    expect(notice.subject).toMatch(/due in about 24 hours/i);
    expect(notice.subject).toContain('2026-10-02');
    expect(notice.text).toContain(base.link);
    expect(notice.text).toContain(describeDeadline(LA, base.dueAtUtc));
    expect(notice.subject).not.toMatch(/[\r\n]/);
    expect(renderReminder({ ...base, kind: 'before_due', nowUtc: at('2026-09-29T22:00:00Z') }).subject).toMatch(/due in about 2 hours/i);
    expect(renderReminder({ ...base, kind: 'before_due', nowUtc: at('2026-09-29T23:30:00Z') }).subject).toMatch(/due in less than an hour/i);
    expect(renderReminder({ ...base, kind: 'before_due', nowUtc: at('2026-09-28T23:00:00Z') }).subject).toMatch(/due in about 25 hours/i);
  });

  it('renders the overdue warning without claiming a submission', () => {
    const notice = renderReminder({ ...base, kind: 'overdue', nowUtc: at('2026-09-30T01:00:00Z') });
    expect(notice.subject).toMatch(/overdue/i);
    expect(notice.text).toMatch(/not submitted automatically/i);
    expect(notice.text).toContain(base.link);
  });

  it('renders the outcome notice: submitted automatically, review pending, login required', () => {
    const notice = renderReminder({ ...base, kind: 'outcome_notice', nowUtc: at('2026-09-30T00:05:00Z') });
    expect(notice.subject).toMatch(/submitted automatically/i);
    expect(notice.text).toMatch(/submitted automatically/i);
    expect(notice.text).toMatch(/review is pending/i);
    expect(notice.text).toMatch(/sign in/i);
    expect(notice.text).toContain(base.link);
    expect(firstLine(notice.text)).toContain('2026-09-14');
  });

  it('never puts anything but the one link in a URL and carries no token or address', () => {
    for (const kind of ['before_due', 'overdue', 'outcome_notice'] as const) {
      const notice = renderReminder({ ...base, kind, nowUtc: at('2026-09-29T00:00:00Z') });
      const urls = notice.text.match(/https?:\/\/\S+/g) ?? [];
      expect(urls, kind).toEqual([base.link]);
      expect(notice.text, kind).not.toMatch(/token|magic|password|@/i);
      expect(notice.subject, kind).not.toMatch(/token|@/i);
    }
  });

  it('refuses a link that is not the review deep link', () => {
    expect(() => renderReminder({ ...base, link: 'https://timesheet.example.invalid/#/review/2026-10-02?token=abc', kind: 'overdue', nowUtc: 0 })).toThrow();
    expect(() => renderReminder({ ...base, link: 'https://timesheet.example.invalid/api/x', kind: 'overdue', nowUtc: 0 })).toThrow();
  });
});

function offsetOf(instant: string): string {
  // The offset of the zone at the instant, from the independent oracle (difference of wall clock and UTC).
  const wall = dateTimeIn(instant, LA);
  const wallMs = Date.parse(`${wall.replace(' ', 'T')}:00Z`);
  const minutes = Math.round((wallMs - Date.parse(instant)) / 60000);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}
