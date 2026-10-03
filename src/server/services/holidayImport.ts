import { createHash } from 'node:crypto';
import { type DayCategory, defaultCategory } from '../../domain/attendance.ts';
import { type CalendarDateRule, type CalendarVersion, classifyDate } from '../../domain/calendar.ts';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { isDomainError } from '../../domain/errors.ts';
import {
  diffHolidayDates,
  type HolidayChange,
  type HolidayCsvIssue,
  type HolidayDiff,
  parseHolidayCsv,
} from '../../domain/holidayCsv.ts';
import type { Clock } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import {
  calendarExists,
  createCalendarVersion,
  getCalendar,
  latestCalendarVersion,
  listCalendarVersions,
  listPayrollExceptions,
  prospectiveBoundary,
} from './calendars.ts';

/*
 * Holiday CSV import (FR-13, AC-05, R-07, E-4). Preview computes the plan and writes
 * nothing. Commit recomputes the same plan inside one IMMEDIATE transaction, refuses unless
 * the caller's preview hash equals the hash of the recomputed result, and appends one
 * immutable calendar version with one audit event. The import is a merge: dates the CSV does
 * not list stay (manual dates included) and only explicitly listed dates are removed.
 * Employee rows are never written: default day labels follow the calendar at read time and
 * explicit labels are never replaced. Everything here is aggregate configuration data; no
 * result names a user.
 */

export interface HolidayImportInput {
  calendarId: string;
  year: number;
  effectiveFrom: string;
  csv: string;
  removeDates: readonly string[];
}

interface EffectiveFromProblem {
  code: 'retroactive_change' | 'effective_from_before_latest_version';
  message: string;
  details: Record<string, unknown>;
}

interface FinalizedConflict {
  date: CivilDate;
  finalized_timesheets: number;
}

interface AffectedDay {
  date: CivilDate;
  label_before: DayCategory | null;
  label_after: DayCategory | null;
  default_labelled_entries: number;
  explicit_overrides_preserved: number;
}

interface ImportPlan {
  input: HolidayImportInput;
  effectiveFrom: CivilDate;
  versions: CalendarVersion[];
  base: CalendarVersion;
  boundary: CivilDate;
  csvIssues: HolidayCsvIssue[];
  diff: HolidayDiff;
  effectiveFromProblem: EffectiveFromProblem | null;
  finalizedConflicts: FinalizedConflict[];
  unchanged: boolean;
  hash: string;
}

const MAX_REPORTED_ISSUES = 200;

const ruleJson = (rule: CalendarDateRule) => ({ date: rule.date, kind: rule.kind, name: rule.name });
const changeJson = (change: HolidayChange) => ({ date: change.date, before: change.before, after: change.after });

/** The hash binds the calendar, the effective date and the complete resulting rule set. */
function resultHash(calendarId: string, effectiveFrom: CivilDate, weekdays: readonly number[], dates: readonly CalendarDateRule[]): string {
  const canonical = JSON.stringify({
    calendar_id: calendarId,
    effective_from: effectiveFrom,
    weekdays: [...weekdays].sort((a, b) => a - b),
    dates: dates.map(ruleJson),
  });
  return createHash('sha256').update(canonical).digest('hex');
}

const sameRules = (a: readonly CalendarDateRule[], b: readonly CalendarDateRule[]): boolean =>
  JSON.stringify(a.map(ruleJson)) === JSON.stringify(b.map(ruleJson));

function categoryOn(versions: readonly CalendarVersion[], date: CivilDate): DayCategory | null {
  try {
    return defaultCategory(classifyDate(versions, date));
  } catch (error) {
    if (!isDomainError(error)) throw error;
    return null;
  }
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(',');
}

/** Finalized timesheets of this calendar's pay periods that cover each date. */
function finalizedConflictsFor(db: Db, calendarId: string, dates: readonly CivilDate[]): FinalizedConflict[] {
  const statement = db
    .prepare(
      `SELECT count(*) FROM timesheets t JOIN pay_periods p ON p.id = t.pay_period_id
        WHERE p.calendar_id = ? AND t.finalized_revision_no IS NOT NULL AND ? BETWEEN p.period_start AND p.period_end`,
    )
    .pluck();
  const conflicts: FinalizedConflict[] = [];
  for (const date of dates) {
    const count = statement.get(calendarId, date) as number;
    if (count > 0) conflicts.push({ date, finalized_timesheets: count });
  }
  return conflicts;
}

function planImport(db: Db, clock: Clock, input: HolidayImportInput): ImportPlan {
  if (!calendarExists(db, input.calendarId)) throw notFound('Calendar');
  const effectiveFrom = assertCivilDate(input.effectiveFrom, 'effective_from');
  const removeDates = input.removeDates.map((date) => assertCivilDate(date, 'remove_dates'));
  const calendar = getCalendar(db, input.calendarId);
  const versions = listCalendarVersions(db, input.calendarId);
  const base = latestCalendarVersion(versions);
  if (base === undefined) {
    throw new ApiError(422, 'calendar_has_no_version', 'The calendar has no version to import into; set its first version up first');
  }
  const parsed = parseHolidayCsv(input.csv, { year: input.year });
  const diff = diffHolidayDates(base.dates, parsed.rows, removeDates, effectiveFrom);
  const boundary = prospectiveBoundary(clock, calendar.schedule, listPayrollExceptions(db, input.calendarId));

  let effectiveFromProblem: EffectiveFromProblem | null = null;
  if (effectiveFrom < boundary) {
    effectiveFromProblem = {
      code: 'retroactive_change',
      message: `New versions must take effect on or after ${boundary}; retroactive corrections need an explicit documented procedure`,
      details: { earliest_effective_from: boundary },
    };
  } else if (effectiveFrom < base.effectiveFrom) {
    effectiveFromProblem = {
      code: 'effective_from_before_latest_version',
      message: `A later version already starts on ${base.effectiveFrom}; choose that date or a later one`,
      details: { latest_effective_from: base.effectiveFrom },
    };
  }

  // Added, removed or re-kinded dates change the classification of their days.
  const changedDates = [...diff.added.map((rule) => rule.date), ...diff.removed.map((rule) => rule.date), ...diff.kindChanged.map((item) => item.date)].sort();
  return {
    input,
    effectiveFrom,
    versions,
    base,
    boundary,
    csvIssues: parsed.issues,
    diff,
    effectiveFromProblem,
    finalizedConflicts: finalizedConflictsFor(db, input.calendarId, changedDates),
    unchanged: sameRules(diff.next, base.dates),
    hash: resultHash(input.calendarId, effectiveFrom, base.weekdays, diff.next),
  };
}

const canCommit = (plan: ImportPlan): boolean =>
  plan.csvIssues.length === 0 &&
  plan.diff.removalProblems.length === 0 &&
  plan.effectiveFromProblem === null &&
  plan.finalizedConflicts.length === 0;

const issueJson = (issue: HolidayCsvIssue) => ({
  line: issue.line,
  code: issue.code,
  message: issue.message,
  ...(issue.field === undefined ? {} : { field: issue.field }),
  ...(issue.value === undefined ? {} : { value: issue.value }),
  ...(issue.firstLine === undefined ? {} : { first_line: issue.firstLine }),
});

/**
 * Counts, per changed date, the employees' default-labelled and explicit day entries in
 * unfinalized timesheets of users on this calendar. Counts only: no identity leaves here.
 */
function affectedDays(db: Db, plan: ImportPlan): AffectedDay[] {
  const { diff } = plan;
  const changedDates = [...diff.added.map((rule) => rule.date), ...diff.removed.map((rule) => rule.date), ...diff.kindChanged.map((item) => item.date)].sort();
  if (changedDates.length === 0) return [];
  const seq = Math.max(...plan.versions.map((version) => version.seq)) + 1;
  const after: CalendarVersion[] = [
    ...plan.versions,
    { id: 'preview', seq, effectiveFrom: plan.effectiveFrom, weekdays: plan.base.weekdays, dates: diff.next },
  ];
  const rows = db
    .prepare(
      `SELECT d.work_date AS work_date, d.category_source AS source, count(*) AS entries
         FROM day_entries d
         JOIN users u ON u.id = d.user_id
         JOIN timesheets t ON t.id = d.timesheet_id
        WHERE u.calendar_id = ? AND t.finalized_revision_no IS NULL AND d.work_date IN (${placeholders(changedDates.length)})
        GROUP BY d.work_date, d.category_source`,
    )
    .all(plan.input.calendarId, ...changedDates) as Array<{ work_date: CivilDate; source: 'default' | 'explicit'; entries: number }>;
  const count = (date: CivilDate, source: 'default' | 'explicit') =>
    rows.find((row) => row.work_date === date && row.source === source)?.entries ?? 0;
  return changedDates
    .map((date) => ({
      date,
      label_before: categoryOn(plan.versions, date),
      label_after: categoryOn(after, date),
      default_labelled_entries: count(date, 'default'),
      explicit_overrides_preserved: count(date, 'explicit'),
    }))
    .filter((day) => day.label_before !== day.label_after);
}

export function calendarVersionJson(version: CalendarVersion) {
  return {
    id: version.id,
    seq: version.seq,
    effective_from: version.effectiveFrom,
    weekdays: version.weekdays,
    dates: version.dates.map(ruleJson),
  };
}

/** Dry run: validates the CSV, diffs it against the latest version and writes nothing. */
export function previewHolidayImport(db: Db, clock: Clock, input: HolidayImportInput) {
  const plan = planImport(db, clock, input);
  const commitable = canCommit(plan);
  const { diff } = plan;
  return {
    calendar_id: input.calendarId,
    year: input.year,
    effective_from: plan.effectiveFrom,
    earliest_effective_from: plan.boundary,
    base_version: { id: plan.base.id, seq: plan.base.seq, effective_from: plan.base.effectiveFrom },
    can_commit: commitable,
    preview_hash: commitable ? plan.hash : null,
    no_change: plan.unchanged,
    issues: plan.csvIssues.slice(0, MAX_REPORTED_ISSUES).map(issueJson),
    issue_count: plan.csvIssues.length,
    removal_problems: diff.removalProblems,
    effective_from_problem:
      plan.effectiveFromProblem === null
        ? null
        : { code: plan.effectiveFromProblem.code, message: plan.effectiveFromProblem.message, ...plan.effectiveFromProblem.details },
    finalized_conflicts: plan.finalizedConflicts,
    diff: {
      added: diff.added.map(ruleJson),
      renamed: diff.renamed.map(changeJson),
      kind_changed: diff.kindChanged.map(changeJson),
      removed: diff.removed.map(ruleJson),
      unchanged_count: diff.unchanged.length,
      kept: diff.kept.map(ruleJson),
      ignored_past: diff.ignoredPast.map(ruleJson),
    },
    result_date_count: diff.next.length,
    affected_days: affectedDays(db, plan),
  };
}

export interface HolidayImportCommit extends HolidayImportInput {
  previewHash: string;
  note: string | null;
}

export interface HolidayImportResult {
  /** False for an identical re-commit: nothing was written. */
  committed: boolean;
  version: CalendarVersion;
  previewHash: string;
}

/**
 * Commits a previewed import. Order of refusals: CSV or removal problems (422), the effective
 * date (422), a finalized timesheet the change would alter (409), then a stale or mismatched
 * hash (409). An identical re-commit returns the current version and writes nothing.
 */
export function commitHolidayImport(db: Db, clock: Clock, input: HolidayImportCommit, actorUserId: string): HolidayImportResult {
  return db
    .transaction((): HolidayImportResult => {
      const plan = planImport(db, clock, input);
      if (plan.csvIssues.length > 0 || plan.diff.removalProblems.length > 0) {
        throw new ApiError(422, 'invalid_holiday_import', 'The holiday CSV has problems; preview it and fix them first', {
          issues: plan.csvIssues.slice(0, MAX_REPORTED_ISSUES).map(issueJson),
          removal_problems: plan.diff.removalProblems,
        });
      }
      if (plan.effectiveFromProblem !== null) {
        throw new ApiError(422, plan.effectiveFromProblem.code, plan.effectiveFromProblem.message, plan.effectiveFromProblem.details);
      }
      if (plan.finalizedConflicts.length > 0) {
        throw new ApiError(
          409,
          'finalized_period_affected',
          'The change would alter days of a finalized timesheet; use a later effective date',
          { conflicts: plan.finalizedConflicts },
        );
      }
      if (plan.hash !== input.previewHash) {
        throw new ApiError(409, 'stale_preview', 'The calendar or the request changed since the preview; preview it again');
      }
      if (plan.unchanged) return { committed: false, version: plan.base, previewHash: plan.hash };
      const version = createCalendarVersion(
        db,
        clock,
        {
          calendarId: input.calendarId,
          effectiveFrom: plan.effectiveFrom,
          weekdays: [...plan.base.weekdays],
          dates: [...plan.diff.next],
          ...(input.note === null ? {} : { note: input.note }),
        },
        actorUserId,
        {
          reason: input.note,
          importSummary: {
            year: input.year,
            added: plan.diff.added.length,
            renamed: plan.diff.renamed.length,
            kind_changed: plan.diff.kindChanged.length,
            removed: plan.diff.removed.length,
            ignored_past: plan.diff.ignoredPast.length,
            preview_hash: plan.hash,
          },
        },
      );
      return { committed: true, version, previewHash: plan.hash };
    })
    .immediate();
}
