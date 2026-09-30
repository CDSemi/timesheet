import { type CivilDate, isCivilDate, isoWeekday } from './dates.ts';
import { DomainError } from './errors.ts';
import { effectiveVersionOn } from './versions.ts';

/*
 * Company working calendar (R-03, D-11): a scheduled weekday is a normal work date
 * unless a holiday or closure overrides it. Personal leave never changes this
 * classification. Each version is a complete, immutable rule set from its date on.
 */

export type DayClass = 'normal' | 'nonworking';
export type CalendarDateKind = 'holiday' | 'closure';
export type ClassificationReason = 'scheduled_weekday' | 'unscheduled_weekday' | CalendarDateKind;

export interface CalendarDateRule {
  date: CivilDate;
  kind: CalendarDateKind;
  name: string;
}

export interface CalendarVersion {
  id: string;
  seq: number;
  effectiveFrom: CivilDate;
  /** ISO weekdays (1 = Monday … 7 = Sunday) that are scheduled work days. */
  weekdays: readonly number[];
  dates: readonly CalendarDateRule[];
}

export interface DateClassification {
  date: CivilDate;
  dayClass: DayClass;
  reason: ClassificationReason;
  calendarVersionId: string;
  /** Holiday or closure name, when one applies. */
  name?: string;
}

export function validateCalendarRules(rules: Pick<CalendarVersion, 'effectiveFrom' | 'weekdays' | 'dates'>): void {
  const fail = (message: string): never => {
    throw new DomainError('invalid_calendar_version', message);
  };
  if (!isCivilDate(rules.effectiveFrom)) fail('effectiveFrom must be a valid date');
  const weekdays = new Set(rules.weekdays);
  if (
    rules.weekdays.length === 0 ||
    weekdays.size !== rules.weekdays.length ||
    rules.weekdays.some((day) => !Number.isInteger(day) || day < 1 || day > 7)
  ) {
    fail('weekdays must be distinct ISO weekday numbers 1–7');
  }
  const seen = new Set<string>();
  for (const rule of rules.dates) {
    if (!isCivilDate(rule.date)) fail(`Invalid holiday/closure date ${String(rule.date)}`);
    if (seen.has(rule.date)) fail(`Duplicate holiday/closure date ${rule.date}`);
    if (rule.kind !== 'holiday' && rule.kind !== 'closure') fail('kind must be holiday or closure');
    if (typeof rule.name !== 'string' || rule.name.trim() === '') fail(`A name is required for ${rule.date}`);
    seen.add(rule.date);
  }
}

/** Classifies a date with the calendar version effective on that same date. */
export function classifyDate(versions: readonly CalendarVersion[], date: CivilDate): DateClassification {
  const version = effectiveVersionOn(versions, date);
  if (version === undefined) {
    throw new DomainError('calendar_missing', `No calendar version is effective on ${date}`, { date });
  }
  const rule = version.dates.find((item) => item.date === date);
  if (rule !== undefined) {
    return { date, dayClass: 'nonworking', reason: rule.kind, calendarVersionId: version.id, name: rule.name };
  }
  const scheduled = version.weekdays.includes(isoWeekday(date));
  return {
    date,
    dayClass: scheduled ? 'normal' : 'nonworking',
    reason: scheduled ? 'scheduled_weekday' : 'unscheduled_weekday',
    calendarVersionId: version.id,
  };
}
