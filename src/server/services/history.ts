import type { SessionUser } from '../auth/sessions.ts';
import type { Db } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
import { listCalendarVersions } from './calendars.ts';
import { listPolicyVersions, policyJson } from './policies.ts';

/*
 * E-13: WP2 history is the signed-in user's own audit trail plus the policy and calendar
 * versions that apply to them. Revisions, PDFs and delivery attempts arrive with WP3.
 * Read-only and owner-scoped: only events whose owner is the session user are returned,
 * and another person's identifier never leaves the server (an event performed by someone
 * else is flagged, not attributed).
 */

export const DEFAULT_HISTORY_LIMIT = 200;
export const MAX_HISTORY_LIMIT = 500;

interface AuditRow {
  seq: number;
  id: string;
  occurred_at: string;
  actor_user_id: string | null;
  operation: string;
  entity_type: string;
  entity_id: string | null;
  reason: string | null;
  before_json: string | null;
  after_json: string | null;
}

export interface HistoryQuery {
  limit?: string | undefined;
  before?: string | undefined;
}

function parseLimit(value: string | undefined): number {
  if (value === undefined) return DEFAULT_HISTORY_LIMIT;
  const limit = /^\d{1,4}$/.test(value) ? Number(value) : Number.NaN;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_HISTORY_LIMIT) {
    throw new ApiError(422, 'invalid_limit', `limit must be a whole number from 1 to ${MAX_HISTORY_LIMIT}`);
  }
  return limit;
}

function parseBefore(value: string | undefined): number | null {
  if (value === undefined) return null;
  if (!/^\d{1,15}$/.test(value)) throw new ApiError(422, 'invalid_cursor', 'before must be a cursor returned by a previous page');
  return Number(value);
}

function parseSnapshot(json: string | null): unknown {
  return json === null ? null : (JSON.parse(json) as unknown);
}

export function getHistory(db: Db, user: Pick<SessionUser, 'id' | 'calendarId'>, query: HistoryQuery) {
  const limit = parseLimit(query.limit);
  const before = parseBefore(query.before);
  const rows = db
    .prepare(
      `SELECT rowid AS seq, id, occurred_at, actor_user_id, operation, entity_type, entity_id, reason, before_json, after_json
         FROM audit_events
        WHERE owner_user_id = ? AND (? IS NULL OR rowid < ?)
        ORDER BY rowid DESC
        LIMIT ?`,
    )
    .all(user.id, before, before, limit + 1) as AuditRow[];
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  return {
    audit_events: page.map((row) => ({
      id: row.id,
      occurred_at: row.occurred_at,
      operation: row.operation,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      reason: row.reason,
      actor_is_self: row.actor_user_id === user.id,
      actor_user_id: row.actor_user_id === user.id ? row.actor_user_id : null,
      before: parseSnapshot(row.before_json),
      after: parseSnapshot(row.after_json),
    })),
    next_before: rows.length > limit && last !== undefined ? String(last.seq) : null,
    policy_versions: listPolicyVersions(db, user.id).map(policyJson),
    calendar_versions: listCalendarVersions(db, user.calendarId).map((version) => ({
      id: version.id,
      seq: version.seq,
      effective_from: version.effectiveFrom,
      weekdays: version.weekdays,
      dates: version.dates,
    })),
  };
}
