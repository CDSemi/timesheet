import { type CalendarVersion, classifyDate, type ClassificationReason, type DayClass } from './calendar.ts';
import { assertCivilDate, type CivilDate } from './dates.ts';
import {
  excludedBreakSeconds,
  netWorkIntervals,
  type SessionInterval,
  validateSessionShape,
  validateUserIntervals,
} from './intervals.ts';
import { computeDailyOvertime } from './overtime.ts';
import { type OvertimeRule, validateOvertimeRule } from './policy.ts';
import { assertTimeZone, splitAtLocalMidnights } from './zones.ts';

/*
 * The single production calculation for one work date (R-01, R-03, R-04):
 * 1. sessions belong to their saved work date and share one daily B;
 * 2. confirmed excluded breaks are subtracted;
 * 3. net work is split at reporting-zone midnights; each piece is classified with the
 *    calendar version effective on the piece's own date (R = normal, O = non-working);
 * 4. seconds are aggregated first, then R and O are floored to whole minutes once;
 * 5. B/N/M come from the policy effective for the work date.
 * Open sessions or unknown breaks are incomplete: no invented minutes, no credit.
 */

export type CalculationStatus = 'complete' | 'incomplete' | 'incomplete_breaks' | 'no_records';

export interface WorkDayPolicy extends OvertimeRule {
  /** Policy version identifier, retained so results reference their historical rules. */
  id: string;
}

export interface WorkDayInput {
  workDate: CivilDate;
  reportingZone: string;
  policy: WorkDayPolicy;
  calendarVersions: readonly CalendarVersion[];
  sessions: readonly SessionInterval[];
}

export interface WorkSegment {
  localDate: CivilDate;
  dayClass: DayClass;
  reason: ClassificationReason;
  calendarVersionId: string;
  seconds: number;
}

export interface WorkDayResult {
  workDate: CivilDate;
  status: CalculationStatus;
  policyVersionId: string;
  /** Seconds are retained as evidence; minutes are floored once per class. */
  grossSeconds: number | null;
  excludedBreakSeconds: number | null;
  regularSeconds: number | null;
  nonworkingSeconds: number | null;
  regularMinutes: number | null;
  nonworkingMinutes: number | null;
  normalExcessMinutes: number | null;
  eligibleMinutes: number | null;
  creditedMinutes: number | null;
  segments: WorkSegment[];
}

export function computeWorkDay(input: WorkDayInput): WorkDayResult {
  assertCivilDate(input.workDate, 'workDate');
  const zone = assertTimeZone(input.reportingZone, 'reportingZone');
  validateOvertimeRule(input.policy);
  input.sessions.forEach((session, index) => validateSessionShape(session, String(index)));
  validateUserIntervals(
    input.sessions.map((session, index) => ({ key: String(index), startUtc: session.startUtc, endUtc: session.endUtc })),
  );

  const pending: WorkDayResult = {
    workDate: input.workDate,
    status: 'no_records',
    policyVersionId: input.policy.id,
    grossSeconds: null,
    excludedBreakSeconds: null,
    regularSeconds: null,
    nonworkingSeconds: null,
    regularMinutes: null,
    nonworkingMinutes: null,
    normalExcessMinutes: null,
    eligibleMinutes: null,
    creditedMinutes: null,
    segments: [],
  };
  if (input.sessions.length === 0) return pending;
  if (input.sessions.some((session) => session.endUtc === null)) return { ...pending, status: 'incomplete' };
  if (input.sessions.some((session) => !session.breaksConfirmed || session.breaks.some((item) => !item.confirmed))) {
    return { ...pending, status: 'incomplete_breaks' };
  }

  const secondsByDate = new Map<CivilDate, number>();
  let grossSeconds = 0;
  let excludedSeconds = 0;
  for (const session of input.sessions) {
    grossSeconds += (session.endUtc ?? session.startUtc) - session.startUtc;
    excludedSeconds += excludedBreakSeconds(session);
    for (const [start, end] of netWorkIntervals(session)) {
      for (const piece of splitAtLocalMidnights(zone, start, end)) {
        secondsByDate.set(piece.date, (secondsByDate.get(piece.date) ?? 0) + (piece.endUtc - piece.startUtc));
      }
    }
  }

  const segments: WorkSegment[] = [...secondsByDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([localDate, seconds]) => {
      const classification = classifyDate(input.calendarVersions, localDate);
      return {
        localDate,
        dayClass: classification.dayClass,
        reason: classification.reason,
        calendarVersionId: classification.calendarVersionId,
        seconds,
      };
    });
  const regularSeconds = sumSeconds(segments, 'normal');
  const nonworkingSeconds = sumSeconds(segments, 'nonworking');
  const regularMinutes = Math.floor(regularSeconds / 60);
  const nonworkingMinutes = Math.floor(nonworkingSeconds / 60);
  const overtime = computeDailyOvertime(regularMinutes, nonworkingMinutes, input.policy);

  return {
    ...pending,
    status: 'complete',
    grossSeconds,
    excludedBreakSeconds: excludedSeconds,
    regularSeconds,
    nonworkingSeconds,
    regularMinutes,
    nonworkingMinutes,
    ...overtime,
    segments,
  };
}

function sumSeconds(segments: readonly WorkSegment[], dayClass: DayClass): number {
  return segments.reduce((total, segment) => total + (segment.dayClass === dayClass ? segment.seconds : 0), 0);
}

export interface ProvisionalCredit {
  workDate: CivilDate;
  minutes: number;
  policyVersionId: string;
}

/**
 * Provisional OT credit movements a later finalization may post (R-06). Incomplete
 * days and zero credits produce none.
 */
export function provisionalCredits(result: WorkDayResult): ProvisionalCredit[] {
  if (result.status !== 'complete' || result.creditedMinutes === null || result.creditedMinutes === 0) return [];
  return [{ workDate: result.workDate, minutes: result.creditedMinutes, policyVersionId: result.policyVersionId }];
}
