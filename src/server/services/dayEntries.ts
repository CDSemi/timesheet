import { type DayCategory, defaultCategory } from '../../domain/attendance.ts';
import { classifyDate } from '../../domain/calendar.ts';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import type { PeriodRelation } from '../../domain/editReason.ts';
import { isDomainError } from '../../domain/errors.ts';
import { writeTransaction } from '../db/database.ts';
import { ApiError, staleVersion } from '../http/errors.ts';
import type { DayBatchBody, DayBatchEntry } from '../http/schemas.ts';
import { normalizeReason } from '../http/validation.ts';
import {
  applyDayEntryChange,
  type CommandContext,
  type DayEntryInput,
  type DayEntryIssue,
  dayEntryIssue,
} from './timesheetCommands.ts';
import {
  type DayEntryRow,
  dayEntryJson,
  editRequirementFor,
  effectiveCategory,
  findDayEntry,
  findTimesheet,
  getDayView,
  loadScope,
  loadSessions,
  periodForDate,
  type UserScope,
} from './timesheets.ts';

/*
 * Batch day-entry edits (FR-03, FR-04, FR-14, R-07). A batch is a list of per-date label
 * changes. Preview reports what a commit would do without writing; commit repeats the
 * same plan inside one IMMEDIATE transaction, so a stale date, an invalid date, a missing
 * reason or an unconfirmed conflict leaves every date untouched. Each changed entry
 * writes one audit event (through the same write path as PUT /days/:date). Recorded
 * work sessions are never edited or deleted: a conflict is only reported, and the
 * employee must confirm it explicitly.
 */

type EntryStatus = 'create' | 'update' | 'unchanged' | 'stale' | 'invalid';

export interface BatchConflict {
  work_date: CivilDate;
  session_count: number;
  clock_session_count: number;
  open_session_count: number;
  session_ids: string[];
  current_category: DayCategory | null;
  new_category: DayCategory;
}

interface PlannedEntry {
  workDate: CivilDate;
  status: EntryStatus;
  existing: DayEntryRow | undefined;
  input: DayEntryInput;
  periodRelation: PeriodRelation;
  reasonRequired: boolean;
  conflict: BatchConflict | null;
  error: DayEntryIssue | null;
}

/** Fields an omitted batch value takes from the existing entry (or the neutral default). */
function resolveInput(entry: DayBatchEntry, existing: DayEntryRow | undefined): DayEntryInput {
  const leaveMinutes = entry.leave_minutes ?? existing?.leave_minutes ?? 0;
  return {
    category: entry.category,
    leave_minutes: leaveMinutes,
    // A kind follows its minutes: lowering the minutes to zero drops the kind unless one is given.
    leave_kind: entry.leave_kind !== undefined ? entry.leave_kind : leaveMinutes === 0 ? null : (existing?.leave_kind ?? null),
    wfh: entry.wfh ?? existing?.wfh === 1,
    notes: entry.notes ?? existing?.notes ?? '',
    expected_version: entry.expected_version ?? null,
  };
}

function isUnchanged(existing: DayEntryRow | undefined, input: DayEntryInput): boolean {
  return (
    existing !== undefined &&
    existing.category_source === 'explicit' &&
    existing.category === input.category &&
    existing.leave_minutes === input.leave_minutes &&
    existing.leave_kind === input.leave_kind &&
    (existing.wfh === 1) === input.wfh &&
    existing.notes === input.notes
  );
}

function currentCategoryOf(scope: UserScope, workDate: CivilDate, existing: DayEntryRow | undefined): DayCategory | null {
  if (existing !== undefined) return effectiveCategory(scope, existing);
  try {
    return defaultCategory(classifyDate(scope.calendarVersions, workDate));
  } catch (error) {
    if (!isDomainError(error)) throw error;
    return null;
  }
}

function planBatch(ctx: CommandContext, scope: UserScope, body: DayBatchBody): PlannedEntry[] {
  const seen = new Set<string>();
  return body.entries.map((entry) => {
    const workDate = assertCivilDate(entry.work_date, 'work_date');
    if (seen.has(workDate)) {
      throw new ApiError(422, 'duplicate_date', `The batch lists ${workDate} more than once`, { work_date: workDate });
    }
    seen.add(workDate);
    const period = periodForDate(scope, workDate);
    const requirement = editRequirementFor(ctx.clock, scope, period, findTimesheet(ctx.db, scope, period));
    // Every lookup is scoped by the session user: another user's entry is simply absent.
    const existing = findDayEntry(ctx.db, ctx.user.id, workDate);
    const input = resolveInput(entry, existing);
    const planned: PlannedEntry = {
      workDate,
      status: 'unchanged',
      existing,
      input,
      periodRelation: requirement.relation,
      reasonRequired: requirement.reasonRequired,
      conflict: null,
      error: null,
    };
    const stale = existing === undefined ? input.expected_version !== null : input.expected_version !== existing.version;
    if (stale) return { ...planned, status: 'stale' };
    const issue = dayEntryIssue(scope, workDate, input);
    if (issue !== null) return { ...planned, status: 'invalid', error: issue };
    if (isUnchanged(existing, input)) return planned;
    const sessions = loadSessions(ctx.db, ctx.user.id, workDate, workDate);
    const currentCategory = currentCategoryOf(scope, workDate, existing);
    const conflicts = sessions.length > 0 && input.category !== 'Worked' && input.category !== currentCategory;
    return {
      ...planned,
      status: existing === undefined ? 'create' : 'update',
      conflict: conflicts
        ? {
            work_date: workDate,
            session_count: sessions.length,
            clock_session_count: sessions.filter((session) => session.source === 'clock').length,
            open_session_count: sessions.filter((session) => session.end_utc === null).length,
            session_ids: sessions.map((session) => session.id),
            current_category: currentCategory,
            new_category: input.category,
          }
        : null,
    };
  });
}

const isChange = (item: PlannedEntry): boolean => item.status === 'create' || item.status === 'update';

function afterJson(input: DayEntryInput) {
  return {
    category: input.category,
    category_source: 'explicit' as const,
    leave_minutes: input.leave_minutes,
    leave_kind: input.leave_kind,
    wfh: input.wfh,
    notes: input.notes,
  };
}

/** Reports what a commit would do. Read-only: nothing is written and nothing is audited. */
export function previewDayBatch(ctx: CommandContext, body: DayBatchBody) {
  const scope = loadScope(ctx.db, ctx.user);
  const plan = planBatch(ctx, scope, body);
  const changes = plan.filter(isChange);
  const conflicts = changes.flatMap((item) => (item.conflict === null ? [] : [item.conflict]));
  const reasonDates = changes.filter((item) => item.reasonRequired).map((item) => item.workDate);
  return {
    mode: 'preview' as const,
    can_commit: !plan.some((item) => item.status === 'stale' || item.status === 'invalid'),
    changed_count: changes.length,
    reason_required: reasonDates.length > 0,
    reason_required_dates: reasonDates,
    requires_conflict_confirmation: conflicts.length > 0,
    conflicts,
    entries: plan.map((item) => ({
      work_date: item.workDate,
      status: item.status,
      current_version: item.existing?.version ?? null,
      period_relation: item.periodRelation,
      reason_required: item.reasonRequired,
      conflict: item.conflict !== null,
      before: item.existing === undefined ? null : dayEntryJson(item.existing, effectiveCategory(scope, item.existing)),
      after: afterJson(item.input),
      error: item.error,
    })),
  };
}

/**
 * Applies the batch in one transaction. Refusals happen before the first write, and any
 * later failure rolls the whole transaction back, so a batch is all or nothing.
 */
export function commitDayBatch(ctx: CommandContext, body: DayBatchBody) {
  const reason = normalizeReason(body.reason);
  const outcome = writeTransaction(ctx.db, () => {
    const scope = loadScope(ctx.db, ctx.user);
    const plan = planBatch(ctx, scope, body);
    const stale = plan.filter((item) => item.status === 'stale').map((item) => item.workDate);
    if (stale.length > 0) throw new ApiError(409, 'stale_version', staleVersion().message, { work_dates: stale });
    const invalid = plan.filter((item) => item.status === 'invalid');
    if (invalid.length > 0) {
      throw new ApiError(422, 'batch_invalid', 'One or more entries are invalid', {
        errors: invalid.map((item) => ({ work_date: item.workDate, ...item.error })),
      });
    }
    const changes = plan.filter(isChange);
    const reasonDates = changes.filter((item) => item.reasonRequired).map((item) => item.workDate);
    if (reasonDates.length > 0 && reason === null) {
      throw new ApiError(422, 'reason_required', 'Editing an old or finalized period requires a reason', {
        work_dates: reasonDates,
      });
    }
    const conflicts = changes.flatMap((item) => (item.conflict === null ? [] : [item.conflict]));
    if (conflicts.length > 0 && body.confirm_conflicts !== true) {
      throw new ApiError(
        409,
        'conflicts_require_confirmation',
        'Some dates have recorded work; confirm the label change explicitly. No work session is ever deleted',
        { conflicts },
      );
    }
    for (const item of changes) applyDayEntryChange(ctx, scope, item.workDate, item.input, reason ?? undefined);
    return {
      changed: changes.map((item) => item.workDate),
      unchanged: plan.filter((item) => item.status === 'unchanged').map((item) => item.workDate),
    };
  });
  return {
    mode: 'commit' as const,
    ...outcome,
    days: outcome.changed.map((date) => getDayView(ctx.db, ctx.clock, ctx.user, date)),
  };
}
