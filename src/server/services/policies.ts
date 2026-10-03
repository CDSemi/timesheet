import { randomUUID } from 'node:crypto';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { type BreakRule, validateWorkPolicyRules, type WorkPolicyRules } from '../../domain/policy.ts';
import type { WorkDayResult } from '../../domain/workday.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { recordAudit } from './audit.ts';
import { assertProspective, getCalendar, listPayrollExceptions, prospectiveBoundary } from './calendars.ts';
import {
  calculateDay,
  editRequirementFor,
  findTimesheet,
  loadScope,
  loadSessions,
  periodForDate,
  type StoredSession,
  type UserScope,
} from './timesheets.ts';

/** An immutable, effective-dated personal work policy (B/N/M, breaks, deficit mode). */
export interface PolicyVersion extends WorkPolicyRules {
  id: string;
  userId: string;
  seq: number;
  effectiveFrom: CivilDate;
  note: string | null;
  createdAt: string;
}

interface PolicyRow {
  id: string;
  user_id: string;
  seq: number;
  effective_from: string;
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  reference_start: string;
  reference_end: string;
  breaks: string;
  deficit_mode: WorkPolicyRules['deficitMode'];
  note: string | null;
  created_at: string;
}

interface StoredBreak {
  start_offset_minutes: number;
  duration_minutes: number;
  counts_as_work: boolean;
}

export function listPolicyVersions(db: Db, userId: string): PolicyVersion[] {
  const rows = db.prepare('SELECT * FROM work_policies WHERE user_id = ? ORDER BY seq').all(userId) as PolicyRow[];
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    seq: row.seq,
    effectiveFrom: row.effective_from,
    requiredMinutes: row.required_minutes,
    thresholdMinutes: row.threshold_minutes,
    roundingStepMinutes: row.rounding_step_minutes,
    referenceStart: row.reference_start,
    referenceEnd: row.reference_end,
    breaks: (JSON.parse(row.breaks) as StoredBreak[]).map((item) => ({
      startOffsetMinutes: item.start_offset_minutes,
      durationMinutes: item.duration_minutes,
      countsAsWork: item.counts_as_work,
    })),
    deficitMode: row.deficit_mode,
    note: row.note,
    createdAt: row.created_at,
  }));
}

function storedBreaks(breaks: readonly BreakRule[]): StoredBreak[] {
  return [...breaks]
    .sort((a, b) => a.startOffsetMinutes - b.startOffsetMinutes)
    .map((item) => ({
      start_offset_minutes: item.startOffsetMinutes,
      duration_minutes: item.durationMinutes,
      counts_as_work: item.countsAsWork,
    }));
}

export function policyJson(policy: PolicyVersion) {
  return {
    id: policy.id,
    seq: policy.seq,
    effective_from: policy.effectiveFrom,
    required_minutes: policy.requiredMinutes,
    threshold_minutes: policy.thresholdMinutes,
    rounding_step_minutes: policy.roundingStepMinutes,
    reference_start: policy.referenceStart,
    reference_end: policy.referenceEnd,
    breaks: storedBreaks(policy.breaks),
    deficit_mode: policy.deficitMode,
    note: policy.note,
    created_at: policy.createdAt,
  };
}

export interface PolicyProposal {
  userId: string;
  calendarId: string;
  effectiveFrom: CivilDate;
  rules: WorkPolicyRules;
  note?: string;
}

/** Field and rule checks shared by creation and preview, so both refuse the same inputs. */
function validateProposal(input: PolicyProposal): void {
  assertCivilDate(input.effectiveFrom, 'effective_from');
  validateWorkPolicyRules(input.rules);
}

/** The prospective-boundary rule (R-07), checked against the user's existing versions. */
function assertProposalProspective(db: Db, clock: Clock, input: PolicyProposal, existing: readonly PolicyVersion[]): void {
  const calendar = getCalendar(db, input.calendarId);
  const boundary = prospectiveBoundary(clock, calendar.schedule, listPayrollExceptions(db, input.calendarId));
  assertProspective(input.effectiveFrom, boundary, existing.length === 0);
}

/**
 * Appends a policy version for `userId`. Changes apply prospectively: except for a
 * user's first version, the effective date may not precede the current pay period.
 */
export function createPolicyVersion(db: Db, clock: Clock, input: PolicyProposal, actorUserId: string): PolicyVersion {
  validateProposal(input);
  return db
    .transaction(() => {
      const existing = listPolicyVersions(db, input.userId);
      assertProposalProspective(db, clock, input, existing);
      const id = randomUUID();
      const seq = (existing.at(-1)?.seq ?? 0) + 1;
      const createdAt = nowUtc(clock);
      const rules = input.rules;
      db.prepare(
        `INSERT INTO work_policies (id, user_id, seq, effective_from, required_minutes, threshold_minutes,
           rounding_step_minutes, reference_start, reference_end, breaks, deficit_mode, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        input.userId,
        seq,
        input.effectiveFrom,
        rules.requiredMinutes,
        rules.thresholdMinutes,
        rules.roundingStepMinutes,
        rules.referenceStart,
        rules.referenceEnd,
        JSON.stringify(storedBreaks(rules.breaks)),
        rules.deficitMode,
        input.note ?? null,
        actorUserId,
        createdAt,
      );
      const created: PolicyVersion = {
        ...rules,
        breaks: [...rules.breaks],
        id,
        userId: input.userId,
        seq,
        effectiveFrom: input.effectiveFrom,
        note: input.note ?? null,
        createdAt,
      };
      recordAudit(db, clock, {
        actorUserId,
        ownerUserId: input.userId,
        operation: 'work_policy.create',
        entityType: 'work_policy',
        entityId: id,
        after: policyJson(created),
      });
      return created;
    })
    .immediate();
}

/** The provisional minutes of one day that a policy version can change (R-03, R-04). */
function minutesJson(result: WorkDayResult | null) {
  return {
    regular_minutes: result?.regularMinutes ?? null,
    nonworking_minutes: result?.nonworkingMinutes ?? null,
    normal_excess_minutes: result?.normalExcessMinutes ?? null,
    eligible_minutes: result?.eligibleMinutes ?? null,
    credited_minutes: result?.creditedMinutes ?? null,
  };
}

type Minutes = ReturnType<typeof minutesJson>;

function changedFields(before: Minutes, after: Minutes): Array<keyof Minutes> {
  return (Object.keys(before) as Array<keyof Minutes>).filter((field) => before[field] !== after[field]);
}

/**
 * Dry run of createPolicyVersion for the session user: the same validation, then the
 * user's current and future draft days whose provisional minutes would change under the
 * proposed version. "After" comes from the production day calculation (calculateDay) with
 * the proposal appended to the user's versions; nothing is written, audited or reserved.
 * Finalized timesheets and days of an old period are never listed (R-07).
 */
export function previewPolicyVersion(
  db: Db,
  clock: Clock,
  user: Pick<SessionUser, 'id' | 'calendarId'>,
  input: PolicyProposal,
) {
  validateProposal(input);
  const scope = loadScope(db, user);
  assertProposalProspective(db, clock, input, scope.policies);
  const proposed: PolicyVersion = {
    ...input.rules,
    breaks: [...input.rules.breaks],
    id: 'proposed',
    userId: user.id,
    seq: (scope.policies.at(-1)?.seq ?? 0) + 1,
    effectiveFrom: input.effectiveFrom,
    note: input.note ?? null,
    createdAt: nowUtc(clock),
  };
  const proposedScope: UserScope = { ...scope, policies: [...scope.policies, proposed] };
  const byDate = new Map<CivilDate, StoredSession[]>();
  for (const session of loadSessions(db, user.id, input.effectiveFrom, '9999-12-31')) {
    byDate.set(session.work_date, [...(byDate.get(session.work_date) ?? []), session]);
  }
  const days = [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .flatMap(([workDate, sessions]) => {
      const period = periodForDate(scope, workDate);
      const requirement = editRequirementFor(clock, scope, period, findTimesheet(db, scope, period));
      if (requirement.reasonRequired) return [];
      const before = minutesJson(calculateDay(scope, workDate, sessions).result);
      const after = minutesJson(calculateDay(proposedScope, workDate, sessions).result);
      const changed = changedFields(before, after);
      return changed.length === 0 ? [] : [{ work_date: workDate, period_relation: requirement.relation, changed, before, after }];
    });
  return { effective_from: input.effectiveFrom, days };
}
