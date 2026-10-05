import { assertCivilDate, type CivilDate } from './dates.ts';
import type { EpochSeconds } from './instants.ts';
import { formatInZone } from './zones.ts';

/*
 * Reminders and outcome notices (docs/05 "Reminders and review links", AC-09). Pure rules; the
 * server decides which notices are due and sends them.
 *
 * - Notices before the deadline are 24 h and 2 h by default (the owner's per-user offsets replace
 *   them). An offset is elapsed time, as every duration is (R-07): the reminder instant is the
 *   deadline minus `offset * 60` UTC seconds. The deadline itself always comes from the production
 *   pay-period functions in the saved reporting zone, so across a DST change the wall clock of a
 *   reminder is an hour away from the deadline's, which the notice text states with the zone and
 *   its UTC offset.
 * - Notices are deduplicated by occurrence key. Notices missed during downtime collapse into one
 *   current notice: the closest offset already reached. Nothing is sent at or after the deadline,
 *   before the activation instant, or for a deadline before it.
 * - A notice links to the login-required review screen of the period (`#/review/{payrollDate}`)
 *   and nothing else: no token, no magic link, no personal data in any URL.
 */

export const REMINDER_KINDS = ['before_due', 'overdue', 'outcome_notice'] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

/** A link or link base that could carry more than the login-required review deep link. */
export class ReviewLinkError extends Error {
  readonly code = 'invalid_review_link';

  constructor(message: string) {
    super(message);
    this.name = 'ReviewLinkError';
  }
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** One overdue warning per user and period. */
export const OVERDUE_KEY = 'overdue';

/** The occurrence key of a notice sent `offsetMinutes` before the deadline. */
export function beforeDueKey(offsetMinutes: number): string {
  return `offset-${offsetMinutes}`;
}

/** One outcome notice per automatic revision. */
export function outcomeKey(revisionId: string): string {
  return `revision-${revisionId}`;
}

/** Positive whole minutes, each once, longest first. */
export function normalizeReminderOffsets(offsets: readonly number[]): number[] {
  const valid = offsets.filter((offset) => Number.isSafeInteger(offset) && offset > 0);
  return [...new Set(valid)].sort((a, b) => b - a);
}

/** The instant a notice `offsetMinutes` before the deadline becomes due (elapsed time). */
export function noticeInstant(dueAtUtc: EpochSeconds, offsetMinutes: number): EpochSeconds {
  return dueAtUtc - offsetMinutes * SECONDS_PER_MINUTE;
}

export interface PreDeadlineInput {
  dueAtUtc: EpochSeconds;
  nowUtc: EpochSeconds;
  offsetsMinutes: readonly number[];
  /** The system activation instant; null while automation is not activated (nothing is sent). */
  activeFromUtc: EpochSeconds | null;
  /** Occurrence keys already decided for this user and period (sent, collapsed or suppressed). */
  decidedKeys: ReadonlySet<string>;
}

export interface PreDeadlinePlan {
  /** The offset of the one notice to send now, or null. */
  send: number | null;
  /** Offsets reached but superseded by the current notice or by a closer decided one. */
  collapsed: number[];
}

const NOTHING: PreDeadlinePlan = { send: null, collapsed: [] };

/**
 * Decides the pre-deadline notice of one period at `nowUtc`. The closest offset already reached is
 * the current notice; every other reached, undecided offset collapses into it. A closer offset that
 * was already decided supersedes all undecided ones (an offset added late never produces a stale
 * longer-range notice).
 */
export function planPreDeadline(input: PreDeadlineInput): PreDeadlinePlan {
  const { dueAtUtc, nowUtc, activeFromUtc, decidedKeys } = input;
  // Notices precede the deadline, so a deadline before the activation instant also means now < activation.
  if (activeFromUtc === null || nowUtc < activeFromUtc) return NOTHING;
  if (nowUtc >= dueAtUtc) return NOTHING;
  const reached = normalizeReminderOffsets(input.offsetsMinutes).filter((offset) => noticeInstant(dueAtUtc, offset) <= nowUtc);
  const closest = reached.at(-1);
  if (closest === undefined) return NOTHING;
  const pending = reached.filter((offset) => !decidedKeys.has(beforeDueKey(offset)));
  if (pending.length === 0) return NOTHING;
  if (decidedKeys.has(beforeDueKey(closest))) return { send: null, collapsed: pending };
  return { send: closest, collapsed: pending.filter((offset) => offset !== closest) };
}

/* ------------------------------------------------------------------ links ---- */

/**
 * The login-required deep link to a period's review screen: the configured public base (origin plus
 * an optional path prefix, no credentials, query or fragment) and `#/review/{payrollDate}`.
 */
export function reviewLink(baseUrl: string, payrollDate: CivilDate): string {
  assertCivilDate(payrollDate, 'payrollDate');
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new ReviewLinkError( 'The public base URL must be an absolute URL');
  }
  const clean =
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    url.username === '' &&
    url.password === '' &&
    url.search === '' &&
    url.hash === '' &&
    !/[?#@\s]/.test(baseUrl.replace(/^https?:\/\//, ''));
  if (!clean) throw new ReviewLinkError( 'The public base URL must be a plain http(s) address without credentials, query or fragment');
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}/#/review/${payrollDate}`;
}

const REVIEW_LINK_TAIL = /\/#\/review\/\d{4}-\d{2}-\d{2}$/;

function assertReviewLink(link: string): void {
  if (!REVIEW_LINK_TAIL.test(link) || /[?@\s]/.test(link) || link.indexOf('#') !== link.lastIndexOf('#')) {
    throw new ReviewLinkError( 'A notice may only link to the review deep link of a period');
  }
}

/* --------------------------------------------------------------- rendering ---- */

export interface ReminderContent {
  kind: ReminderKind;
  payrollDate: CivilDate;
  periodStart: CivilDate;
  periodEnd: CivilDate;
  dueAtUtc: EpochSeconds;
  /** The saved reporting zone of the period's calendar. */
  zone: string;
  nowUtc: EpochSeconds;
  /** The review deep link, built with `reviewLink`. */
  link: string;
}

export interface RenderedReminder {
  subject: string;
  text: string;
}

/** The deadline as the employee reads it: local date and time, the saved zone and its UTC offset. */
export function describeDeadline(zone: string, dueAtUtc: EpochSeconds): string {
  const local = formatInZone(zone, dueAtUtc); // 2026-09-29T17:00:00-07:00
  const date = local.slice(0, 10);
  const time = local.slice(11, 16);
  const offset = local.slice(19);
  return `${date} ${time} (${zone}, UTC${offset === 'Z' ? '+00:00' : offset})`;
}

function remainingText(seconds: number): string {
  if (seconds < SECONDS_PER_HOUR) return 'less than an hour';
  const hours = Math.round(seconds / SECONDS_PER_HOUR);
  return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

/** The subject and plain-text body of a notice; ASCII, short lines, one link and no personal data. */
export function renderReminder(content: ReminderContent): RenderedReminder {
  assertReviewLink(content.link);
  const period = `${content.periodStart} to ${content.periodEnd} (payroll date ${content.payrollDate})`;
  const deadline = describeDeadline(content.zone, content.dueAtUtc);
  const open = ['Open the timesheet (you must sign in first):', content.link];
  if (content.kind === 'before_due') {
    const left = remainingText(content.dueAtUtc - content.nowUtc);
    return {
      subject: `Timesheet due in ${left}: payroll ${content.payrollDate}`,
      text: lines([
        `Your timesheet for ${period}`,
        `is due in ${left}.`,
        `Deadline: ${deadline}.`,
        '',
        'Review it and sign off before the deadline.',
        ...open,
      ]),
    };
  }
  if (content.kind === 'overdue') {
    return {
      subject: `Timesheet overdue: payroll ${content.payrollDate}`,
      text: lines([
        `Your timesheet for ${period}`,
        `was due on ${deadline}.`,
        'It was not submitted automatically because automatic',
        'submission is switched off in your settings.',
        '',
        'Review it and sign off to submit it.',
        ...open,
      ]),
    };
  }
  return {
    subject: `Timesheet submitted automatically: payroll ${content.payrollDate}`,
    text: lines([
      `Your timesheet for ${period}`,
      `was submitted automatically at the deadline (${deadline}).`,
      'Review is pending: it has not been signed by you yet.',
      '',
      'Review it and sign off when you can.',
      ...open,
    ]),
  };
}

function lines(rows: readonly string[]): string {
  return `${rows.join('\n')}\n\nThis message was sent automatically to you only.\n`;
}
