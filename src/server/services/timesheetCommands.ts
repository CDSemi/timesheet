import { randomUUID } from 'node:crypto';
import { type DayCategory, defaultCategory, type LeaveKind, validateLeave } from '../../domain/attendance.ts';
import { classifyDate } from '../../domain/calendar.ts';
import { assertCivilDate, type CivilDate, diffDays } from '../../domain/dates.ts';
import { DomainError } from '../../domain/errors.ts';
import { type EpochSeconds, formatUtcInstant, parseUtcInstant } from '../../domain/instants.ts';
import { type BreakInterval, validateSessionShape } from '../../domain/intervals.ts';
import type { PayPeriod } from '../../domain/periods.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import { assertTimeZone, localDateOf, resolveLocalDateTime } from '../../domain/zones.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound, staleVersion } from '../http/errors.ts';
import type {
  BreakInput,
  ClockInBody,
  ClockOutBody,
  DayEntryBody,
  DeleteBody,
  InstantInput,
  SessionBody,
  SessionUpdateBody,
} from '../http/schemas.ts';
import { normalizeReason } from '../http/validation.ts';
import { recordAudit } from './audit.ts';
import { ensurePayPeriodRow } from './periods.ts';
import {
  type DayEntryRow,
  dayEntryJson,
  editRequirementFor,
  effectiveCategory,
  findDayEntry,
  findOpenSession,
  findSession,
  findTimesheet,
  getDayView,
  loadScope,
  periodForDate,
  sessionJson,
  type StoredSession,
  type TimesheetRow,
  type UserScope,
} from './timesheets.ts';
import { importedPeriodError, isImportedTimesheet } from './workbookImport.ts';

/*
 * Write side of a user's timesheet. Each command runs in one short IMMEDIATE
 * transaction that (1) enforces ownership through the subject user id, (2) requires a
 * reason for old or finalized periods (R-07), (3) validates intervals (R-01), (4)
 * checks optimistic versions, (5) bumps the timesheet version and (6) appends audit
 * events with before/after snapshots.
 */

export interface CommandContext {
  db: Db;
  clock: Clock;
  /** The subject: the owner of every row the command reads or writes (`owner_user_id` in the audit). */
  user: SessionUser;
  /** Who performs the command (`actor_user_id` in the audit); absent means the owner acts. */
  actor?: SessionUser;
  /** The share the actor acts under (`via_share_id` in the audit): set by the /api/shared mount only, absent otherwise. */
  viaShareId?: string;
}

/** Manual entries may not describe future work; a small allowance covers clock skew. */
const FUTURE_ALLOWANCE_SECONDS = 5 * 60;
/** A break on an open session may end at most this long after now (clock skew allowance). */
export const OPEN_SESSION_BREAK_ALLOWANCE_SECONDS = 5 * 60;
const OPEN_END = '9999-12-31T23:59:59Z';

interface EditScope {
  scope: UserScope;
  period: PayPeriod;
  timesheet: TimesheetRow | undefined;
  reason: string | null;
}

function prepareEdit(ctx: CommandContext, scope: UserScope, workDate: CivilDate, reasonInput: string | undefined): EditScope {
  const period = periodForDate(scope, workDate);
  const timesheet = findTimesheet(ctx.db, scope, period);
  // F-2 (owner decision 2026-10-05): an imported period is read-only history for day and session edits.
  if (timesheet !== undefined && isImportedTimesheet(ctx.db, ctx.user.id, timesheet.id)) throw importedPeriodError();
  const requirement = editRequirementFor(ctx.clock, scope, period, timesheet);
  const reason = normalizeReason(reasonInput);
  if (requirement.reasonRequired && reason === null) {
    throw new ApiError(422, 'reason_required', 'Editing an old or finalized period requires a reason', {
      period_relation: requirement.relation,
      finalized: timesheet?.finalized_revision_no != null,
      payroll_date: period.payrollDate,
    });
  }
  return { scope, period, timesheet, reason };
}

function ensureTimesheet(ctx: CommandContext, edit: EditScope): TimesheetRow {
  if (edit.timesheet !== undefined) return edit.timesheet;
  const payPeriodId = ensurePayPeriodRow(ctx.db, ctx.clock, edit.scope.calendar.id, edit.period);
  const now = nowUtc(ctx.clock);
  const timesheet: TimesheetRow = {
    id: randomUUID(),
    user_id: ctx.user.id,
    pay_period_id: payPeriodId,
    version: 1,
    finalized_revision_no: null,
  };
  ctx.db
    .prepare(
      `INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)`,
    )
    .run(timesheet.id, ctx.user.id, payPeriodId, now, now);
  edit.timesheet = timesheet;
  return timesheet;
}

function bumpTimesheet(ctx: CommandContext, timesheetId: string): void {
  ctx.db
    .prepare('UPDATE timesheets SET version = version + 1, updated_at = ? WHERE id = ? AND user_id = ?')
    .run(nowUtc(ctx.clock), timesheetId, ctx.user.id);
}

function audit(
  ctx: CommandContext,
  edit: EditScope,
  operation: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown,
): void {
  recordAudit(ctx.db, ctx.clock, {
    actorUserId: (ctx.actor ?? ctx.user).id,
    ownerUserId: ctx.user.id,
    operation,
    entityType,
    entityId,
    reason: edit.reason,
    before,
    after,
    viaShareId: ctx.viaShareId ?? null,
  });
}

/**
 * Returns the day entry, creating it when absent. A created row is a 'default' source row:
 * its stored label is a snapshot of the calendar default, and readers take the label from
 * the calendar at read time, so the row never pretends the employee chose it.
 */
function ensureDayEntry(ctx: CommandContext, edit: EditScope, workDate: CivilDate): DayEntryRow {
  const existing = findDayEntry(ctx.db, ctx.user.id, workDate);
  if (existing !== undefined) return existing;
  const timesheet = ensureTimesheet(ctx, edit);
  const now = nowUtc(ctx.clock);
  const entry: DayEntryRow = {
    id: randomUUID(),
    user_id: ctx.user.id,
    timesheet_id: timesheet.id,
    work_date: workDate,
    category: defaultCategory(classifyDate(edit.scope.calendarVersions, workDate)),
    category_source: 'default',
    leave_minutes: 0,
    leave_kind: null,
    wfh: 0,
    notes: '',
    version: 1,
  };
  ctx.db
    .prepare(
      `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, category_source, leave_minutes, wfh,
         notes, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'default', 0, 0, '', 1, ?, ?)`,
    )
    .run(entry.id, ctx.user.id, timesheet.id, workDate, entry.category, now, now);
  audit(ctx, edit, 'day_entry.create', 'day_entry', entry.id, null, dayEntryJson(entry));
  return entry;
}

function resolveInstant(value: InstantInput, field: string): EpochSeconds {
  if (typeof value === 'string') return parseUtcInstant(value, field);
  return resolveLocalDateTime(value.local, value.zone, { fold: value.fold ?? null, offset: value.offset ?? null }).utc;
}

interface ResolvedSession {
  startUtc: EpochSeconds;
  endUtc: EpochSeconds | null;
  breaks: Array<Omit<BreakInterval, 'confirmed'>>;
}

/** A break later than now + allowance cannot be actual evidence, so it is never stored or confirmed. */
function assertNoFutureBreaks(ctx: CommandContext, breaks: ResolvedSession['breaks']): void {
  const latest = nowEpoch(ctx.clock) + OPEN_SESSION_BREAK_ALLOWANCE_SECONDS;
  const index = breaks.findIndex((item) => item.endUtc > latest);
  if (index >= 0) {
    throw new ApiError(422, 'future_break', 'A break cannot end later than five minutes from now', {
      break_index: index,
      latest_allowed_end: formatUtcInstant(latest),
    });
  }
}

function resolveSession(
  ctx: CommandContext,
  scope: UserScope,
  workDate: CivilDate,
  input: { start: InstantInput; end: InstantInput | null; breaks: BreakInput[]; breaks_confirmed: boolean },
): ResolvedSession {
  const resolved: ResolvedSession = {
    startUtc: resolveInstant(input.start, 'start'),
    endUtc: input.end === null ? null : resolveInstant(input.end, 'end'),
    breaks: input.breaks.map((item, index) => ({
      startUtc: resolveInstant(item.start, `breaks.${index}.start`),
      endUtc: resolveInstant(item.end, `breaks.${index}.end`),
      countsAsWork: item.counts_as_work,
    })),
  };
  validateSessionShape({
    ...resolved,
    breaks: resolved.breaks.map((item) => ({ ...item, confirmed: true })),
    breaksConfirmed: input.breaks_confirmed,
  });
  // The saved accounting date is explicit; it normally equals the reporting-zone start
  // date and may differ by at most one day (e.g. entry from a distant input zone).
  const startDate = localDateOf(scope.calendar.schedule.reportingZone, resolved.startUtc);
  if (Math.abs(diffDays(startDate, workDate)) > 1) {
    throw new ApiError(422, 'work_date_mismatch', `A session starting on ${startDate} cannot belong to ${workDate}`);
  }
  const latest = nowEpoch(ctx.clock) + FUTURE_ALLOWANCE_SECONDS;
  if (resolved.startUtc > latest || (resolved.endUtc ?? resolved.startUtc) > latest) {
    throw new ApiError(422, 'future_time', 'Actual work sessions cannot end in the future');
  }
  assertNoFutureBreaks(ctx, resolved.breaks);
  return resolved;
}

function assertNoOverlap(ctx: CommandContext, startUtc: EpochSeconds, endUtc: EpochSeconds | null, excludeId?: string): void {
  const conflict = ctx.db
    .prepare(
      `SELECT id FROM work_sessions
        WHERE user_id = ? AND id <> ? AND start_utc < ? AND COALESCE(end_utc, ?) > ? LIMIT 1`,
    )
    .get(
      ctx.user.id,
      excludeId ?? '',
      endUtc === null ? OPEN_END : formatUtcInstant(endUtc),
      OPEN_END,
      formatUtcInstant(startUtc),
    ) as { id: string } | undefined;
  if (conflict !== undefined) {
    throw new DomainError('overlapping_user_intervals', 'This session overlaps another of your sessions', {
      conflicting_session_id: conflict.id,
    });
  }
}

function insertBreaks(ctx: CommandContext, sessionId: string, breaks: ResolvedSession['breaks']): void {
  const insert = ctx.db.prepare(
    'INSERT INTO session_breaks (id, session_id, user_id, start_utc, end_utc, counts_as_work) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const item of breaks) {
    insert.run(
      randomUUID(),
      sessionId,
      ctx.user.id,
      formatUtcInstant(item.startUtc),
      formatUtcInstant(item.endUtc),
      item.countsAsWork ? 1 : 0,
    );
  }
}

function requireSession(ctx: CommandContext, sessionId: string): StoredSession {
  const session = findSession(ctx.db, ctx.user.id, sessionId);
  if (session === undefined) throw notFound('Work session');
  return session;
}

function reloadSession(ctx: CommandContext, sessionId: string): StoredSession {
  return requireSession(ctx, sessionId);
}

/** What a day-entry write needs once defaults for omitted fields are resolved. */
export interface DayEntryInput {
  category: DayCategory;
  leave_minutes: number;
  leave_kind: LeaveKind | null;
  wfh: boolean;
  notes: string;
  /** The version the caller last saw; null when the caller saw no entry for the date. */
  expected_version: number | null;
}

export interface DayEntryIssue {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

/**
 * Partial-leave validation against the B effective on the work date (R-05, owner decision
 * E-2). Leave minutes need a policy to be checked against, so a missing policy is an issue.
 */
export function dayEntryIssue(
  scope: UserScope,
  workDate: CivilDate,
  input: Pick<DayEntryInput, 'leave_minutes' | 'leave_kind'>,
): DayEntryIssue | null {
  const policy = effectiveVersionOn(scope.policies, workDate);
  if (input.leave_minutes > 0 && policy === undefined) {
    return { code: 'policy_missing', message: `No work policy is effective on ${workDate}`, details: { work_date: workDate } };
  }
  return validateLeave({
    leaveMinutes: input.leave_minutes,
    leaveKind: input.leave_kind,
    requiredMinutes: policy?.requiredMinutes ?? 0,
  });
}

export interface AppliedDayEntry {
  operation: 'day_entry.create' | 'day_entry.update';
  entry: DayEntryRow;
}

/**
 * Writes one day entry inside the caller's transaction: reason (R-07), leave validation,
 * optimistic version, an explicit category source, the timesheet version bump and one
 * audit event with before/after. Shared by PUT /days/:date and the batch commit.
 */
export function applyDayEntryChange(
  ctx: CommandContext,
  scope: UserScope,
  workDate: CivilDate,
  input: DayEntryInput,
  reasonInput: string | undefined,
): AppliedDayEntry {
  const edit = prepareEdit(ctx, scope, workDate, reasonInput);
  const issue = dayEntryIssue(scope, workDate, input);
  if (issue !== null) throw new ApiError(422, issue.code, issue.message, issue.details);
  const existing = findDayEntry(ctx.db, ctx.user.id, workDate);
  const now = nowUtc(ctx.clock);
  if (existing === undefined) {
    if (input.expected_version !== null) throw staleVersion();
    classifyDate(scope.calendarVersions, workDate);
    const timesheet = ensureTimesheet(ctx, edit);
    const entry: DayEntryRow = {
      id: randomUUID(),
      user_id: ctx.user.id,
      timesheet_id: timesheet.id,
      work_date: workDate,
      category: input.category,
      category_source: 'explicit',
      leave_minutes: input.leave_minutes,
      leave_kind: input.leave_kind,
      wfh: input.wfh ? 1 : 0,
      notes: input.notes,
      version: 1,
    };
    ctx.db
      .prepare(
        `INSERT INTO day_entries (id, user_id, timesheet_id, work_date, category, category_source, leave_minutes,
           leave_kind, wfh, notes, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'explicit', ?, ?, ?, ?, 1, ?, ?)`,
      )
      .run(
        entry.id,
        ctx.user.id,
        timesheet.id,
        workDate,
        entry.category,
        entry.leave_minutes,
        entry.leave_kind,
        entry.wfh,
        entry.notes,
        now,
        now,
      );
    bumpTimesheet(ctx, timesheet.id);
    audit(ctx, edit, 'day_entry.create', 'day_entry', entry.id, null, dayEntryJson(entry));
    return { operation: 'day_entry.create', entry };
  }
  if (input.expected_version !== existing.version) throw staleVersion();
  const updated: DayEntryRow = {
    ...existing,
    category: input.category,
    category_source: 'explicit',
    leave_minutes: input.leave_minutes,
    leave_kind: input.leave_kind,
    wfh: input.wfh ? 1 : 0,
    notes: input.notes,
    version: existing.version + 1,
  };
  const result = ctx.db
    .prepare(
      `UPDATE day_entries SET category = ?, category_source = 'explicit', leave_minutes = ?, leave_kind = ?, wfh = ?,
         notes = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND user_id = ? AND version = ?`,
    )
    .run(
      updated.category,
      updated.leave_minutes,
      updated.leave_kind,
      updated.wfh,
      updated.notes,
      now,
      existing.id,
      ctx.user.id,
      existing.version,
    );
  if (result.changes !== 1) throw staleVersion();
  bumpTimesheet(ctx, existing.timesheet_id);
  audit(
    ctx,
    edit,
    'day_entry.update',
    'day_entry',
    existing.id,
    dayEntryJson(existing, effectiveCategory(scope, existing)),
    dayEntryJson(updated),
  );
  return { operation: 'day_entry.update', entry: updated };
}

export function upsertDayEntry(ctx: CommandContext, workDateInput: string, input: DayEntryBody) {
  const workDate = assertCivilDate(workDateInput, 'work_date');
  writeTransaction(ctx.db, () => {
    const scope = loadScope(ctx.db, ctx.user);
    applyDayEntryChange(
      ctx,
      scope,
      workDate,
      {
        category: input.category,
        leave_minutes: input.leave_minutes,
        leave_kind: input.leave_kind ?? null,
        wfh: input.wfh,
        notes: input.notes,
        expected_version: input.expected_version ?? null,
      },
      input.reason,
    );
  });
  return getDayView(ctx.db, ctx.clock, ctx.user, workDate);
}

export function createSession(ctx: CommandContext, workDateInput: string, input: SessionBody) {
  const workDate = assertCivilDate(workDateInput, 'work_date');
  const inputZone = assertTimeZone(input.input_zone, 'input_zone');
  const sessionId = writeTransaction(ctx.db, () => {
    const scope = loadScope(ctx.db, ctx.user);
    const edit = prepareEdit(ctx, scope, workDate, input.reason);
    const resolved = resolveSession(ctx, scope, workDate, input);
    assertNoOverlap(ctx, resolved.startUtc, resolved.endUtc);
    const entry = ensureDayEntry(ctx, edit, workDate);
    const id = randomUUID();
    const now = nowUtc(ctx.clock);
    ctx.db
      .prepare(
        `INSERT INTO work_sessions (id, user_id, work_date, start_utc, end_utc, input_zone, source, breaks_confirmed,
           version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'manual', ?, 1, ?, ?)`,
      )
      .run(
        id,
        ctx.user.id,
        workDate,
        formatUtcInstant(resolved.startUtc),
        resolved.endUtc === null ? null : formatUtcInstant(resolved.endUtc),
        inputZone,
        input.breaks_confirmed ? 1 : 0,
        now,
        now,
      );
    insertBreaks(ctx, id, resolved.breaks);
    bumpTimesheet(ctx, entry.timesheet_id);
    audit(ctx, edit, 'work_session.create', 'work_session', id, null, sessionJson(reloadSession(ctx, id)));
    return id;
  });
  return { session: sessionJson(reloadSession(ctx, sessionId)), day: getDayView(ctx.db, ctx.clock, ctx.user, workDate) };
}

export function updateSession(ctx: CommandContext, sessionId: string, input: SessionUpdateBody) {
  const inputZone = assertTimeZone(input.input_zone, 'input_zone');
  const workDate = writeTransaction(ctx.db, () => {
    const before = requireSession(ctx, sessionId);
    if (before.version !== input.expected_version) throw staleVersion();
    const scope = loadScope(ctx.db, ctx.user);
    const edit = prepareEdit(ctx, scope, before.work_date, input.reason);
    const resolved = resolveSession(ctx, scope, before.work_date, input);
    assertNoOverlap(ctx, resolved.startUtc, resolved.endUtc, sessionId);
    ctx.db.prepare('DELETE FROM session_breaks WHERE session_id = ? AND user_id = ?').run(sessionId, ctx.user.id);
    const result = ctx.db
      .prepare(
        `UPDATE work_sessions SET start_utc = ?, end_utc = ?, input_zone = ?, breaks_confirmed = ?, version = version + 1,
           updated_at = ?
          WHERE id = ? AND user_id = ? AND version = ?`,
      )
      .run(
        formatUtcInstant(resolved.startUtc),
        resolved.endUtc === null ? null : formatUtcInstant(resolved.endUtc),
        inputZone,
        input.breaks_confirmed ? 1 : 0,
        nowUtc(ctx.clock),
        sessionId,
        ctx.user.id,
        input.expected_version,
      );
    if (result.changes !== 1) throw staleVersion();
    insertBreaks(ctx, sessionId, resolved.breaks);
    const entry = ensureDayEntry(ctx, edit, before.work_date);
    bumpTimesheet(ctx, entry.timesheet_id);
    audit(ctx, edit, 'work_session.update', 'work_session', sessionId, sessionJson(before), sessionJson(reloadSession(ctx, sessionId)));
    return before.work_date;
  });
  return { session: sessionJson(reloadSession(ctx, sessionId)), day: getDayView(ctx.db, ctx.clock, ctx.user, workDate) };
}

export function deleteSession(ctx: CommandContext, sessionId: string, input: DeleteBody) {
  const workDate = writeTransaction(ctx.db, () => {
    const before = requireSession(ctx, sessionId);
    if (before.version !== input.expected_version) throw staleVersion();
    const scope = loadScope(ctx.db, ctx.user);
    const edit = prepareEdit(ctx, scope, before.work_date, input.reason);
    const result = ctx.db
      .prepare('DELETE FROM work_sessions WHERE id = ? AND user_id = ? AND version = ?')
      .run(sessionId, ctx.user.id, input.expected_version);
    if (result.changes !== 1) throw staleVersion();
    const entry = ensureDayEntry(ctx, edit, before.work_date);
    bumpTimesheet(ctx, entry.timesheet_id);
    audit(ctx, edit, 'work_session.delete', 'work_session', sessionId, sessionJson(before), null);
    return before.work_date;
  });
  return { deleted: true, day: getDayView(ctx.db, ctx.clock, ctx.user, workDate) };
}

/** Starts a live session at the server's current second in the reporting-zone work date. */
export function clockIn(ctx: CommandContext, input: ClockInBody) {
  const inputZone = assertTimeZone(input.input_zone, 'input_zone');
  const sessionId = writeTransaction(ctx.db, () => {
    if (findOpenSession(ctx.db, ctx.user.id) !== undefined) {
      throw new ApiError(409, 'open_session_exists', 'Clock out of the running session first');
    }
    const scope = loadScope(ctx.db, ctx.user);
    const now = nowEpoch(ctx.clock);
    const workDate = localDateOf(scope.calendar.schedule.reportingZone, now);
    const edit = prepareEdit(ctx, scope, workDate, input.reason);
    assertNoOverlap(ctx, now, null);
    const entry = ensureDayEntry(ctx, edit, workDate);
    const id = randomUUID();
    const stamp = formatUtcInstant(now);
    ctx.db
      .prepare(
        `INSERT INTO work_sessions (id, user_id, work_date, start_utc, end_utc, input_zone, source, breaks_confirmed,
           version, created_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, ?, 'clock', 0, 1, ?, ?)`,
      )
      .run(id, ctx.user.id, workDate, stamp, inputZone, stamp, stamp);
    bumpTimesheet(ctx, entry.timesheet_id);
    audit(ctx, edit, 'work_session.clock_in', 'work_session', id, null, sessionJson(reloadSession(ctx, id)));
    return id;
  });
  const session = reloadSession(ctx, sessionId);
  return { session: sessionJson(session), day: getDayView(ctx.db, ctx.clock, ctx.user, session.work_date) };
}

/**
 * Ends the running session now. `expected_version` is required (409 stale_version). A
 * present `breaks` list is the complete actual set and replaces the saved rows, as in
 * updateSession, whether or not it is confirmed. An omitted list is allowed only while the
 * breaks stay unconfirmed and keeps the saved rows unchanged (WP2 decision E-1).
 */
export function clockOut(ctx: CommandContext, input: ClockOutBody) {
  const sessionId = writeTransaction(ctx.db, () => {
    const open = findOpenSession(ctx.db, ctx.user.id);
    if (open === undefined) throw new ApiError(409, 'no_open_session', 'There is no running session to clock out of');
    if (open.version !== input.expected_version) throw staleVersion();
    if (input.breaks === undefined && input.breaks_confirmed) {
      throw new ApiError(422, 'breaks_required', 'Confirming breaks requires the complete list of breaks, including an empty list');
    }
    const scope = loadScope(ctx.db, ctx.user);
    const edit = prepareEdit(ctx, scope, open.work_date, input.reason);
    const endEpoch = nowEpoch(ctx.clock);
    const resolved = resolveSession(ctx, scope, open.work_date, {
      start: open.start_utc,
      end: formatUtcInstant(endEpoch),
      breaks: input.breaks ?? [],
      breaks_confirmed: input.breaks_confirmed,
    });
    const replaceBreaks = input.breaks !== undefined;
    if (!replaceBreaks) {
      // Legacy rows saved before the future-break rule can end after this Clock out. They
      // cannot stay inside the closed session and are never deleted silently: the caller
      // must resubmit the complete list, which replaces them.
      const late = ctx.db
        .prepare('SELECT id FROM session_breaks WHERE session_id = ? AND user_id = ? AND end_utc > ? ORDER BY start_utc')
        .all(open.id, ctx.user.id, formatUtcInstant(endEpoch)) as Array<{ id: string }>;
      if (late.length > 0) {
        throw new ApiError(
          422,
          'saved_break_after_clock_out',
          'A saved break ends after this Clock out; resubmit the complete list of breaks to replace it',
          { break_ids: late.map((row) => row.id) },
        );
      }
    }
    // A submitted list is the session's whole break set, as in updateSession: drop the
    // saved rows before inserting it so they are neither duplicated nor silently kept
    // (R-01, R-02). An omitted list (unconfirmed only) leaves them untouched. Any later
    // failure rolls the whole transaction back, restoring the deleted rows.
    if (replaceBreaks) {
      ctx.db.prepare('DELETE FROM session_breaks WHERE session_id = ? AND user_id = ?').run(open.id, ctx.user.id);
    }
    const result = ctx.db
      .prepare(
        `UPDATE work_sessions SET end_utc = ?, breaks_confirmed = ?, version = version + 1, updated_at = ?
          WHERE id = ? AND user_id = ? AND version = ?`,
      )
      .run(
        formatUtcInstant(resolved.endUtc ?? resolved.startUtc),
        input.breaks_confirmed ? 1 : 0,
        nowUtc(ctx.clock),
        open.id,
        ctx.user.id,
        open.version,
      );
    if (result.changes !== 1) throw staleVersion();
    insertBreaks(ctx, open.id, resolved.breaks);
    const entry = ensureDayEntry(ctx, edit, open.work_date);
    bumpTimesheet(ctx, entry.timesheet_id);
    audit(ctx, edit, 'work_session.clock_out', 'work_session', open.id, sessionJson(open), sessionJson(reloadSession(ctx, open.id)));
    return open.id;
  });
  const session = reloadSession(ctx, sessionId);
  return { session: sessionJson(session), day: getDayView(ctx.db, ctx.clock, ctx.user, session.work_date) };
}
