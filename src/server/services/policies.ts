import { randomUUID } from 'node:crypto';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { type BreakRule, validateWorkPolicyRules, type WorkPolicyRules } from '../../domain/policy.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { recordAudit } from './audit.ts';
import { assertProspective, getCalendar, listPayrollExceptions, prospectiveBoundary } from './calendars.ts';

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

/**
 * Appends a policy version for `userId`. Changes apply prospectively: except for a
 * user's first version, the effective date may not precede the current pay period.
 */
export function createPolicyVersion(
  db: Db,
  clock: Clock,
  input: { userId: string; calendarId: string; effectiveFrom: CivilDate; rules: WorkPolicyRules; note?: string },
  actorUserId: string,
): PolicyVersion {
  assertCivilDate(input.effectiveFrom, 'effective_from');
  validateWorkPolicyRules(input.rules);
  return db
    .transaction(() => {
      const existing = listPolicyVersions(db, input.userId);
      const calendar = getCalendar(db, input.calendarId);
      const boundary = prospectiveBoundary(clock, calendar.schedule, listPayrollExceptions(db, input.calendarId));
      assertProspective(input.effectiveFrom, boundary, existing.length === 0);
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
