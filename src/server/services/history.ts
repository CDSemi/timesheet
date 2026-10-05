import type { SessionUser } from '../auth/sessions.ts';
import type { Db } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
import { listCalendarVersions } from './calendars.ts';
import { listPolicyVersions, policyJson } from './policies.ts';
import { sharedActCondition } from './sharedActs.ts';

/*
 * E-13: WP2 history is the signed-in user's own audit trail plus the policy and calendar
 * versions that apply to them. Revisions, PDFs and delivery attempts arrive with WP3.
 * Read-only and owner-scoped: only events whose owner is the session user are returned,
 * and another person's identifier never leaves the server. An event performed by someone
 * else is flagged, not attributed, and an event with no actor at all is flagged as a system event
 * (WP3-RBC-01), with one exception (FR-17, WP3-T13B, WP3-C-02): an event performed through
 * /api/shared under a grant shows the grantee's display name (`via_share`,
 * `actor_display_name`). Whether an event was performed through a grant comes from the event itself
 * (its actor and operation, see `sharedActCondition`), never from the time window in which a share
 * existed: an administrator who also holds a share, an act in the same second as a later grant and a
 * grantee leaving a share all stay unattributed.
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
  /** The grantee's display name when the event was performed under a share, else null. */
  shared_actor_name: string | null;
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
  // `seq` is the event's 1-based position among the user's own events (audit_events is
  // append-only), never the global rowid, so a cursor reveals nothing about other users.
  const rows = db
    .prepare(
      `SELECT seq, id, occurred_at, actor_user_id, operation, entity_type, entity_id, reason, before_json, after_json,
              shared_actor_name
         FROM (SELECT row_number() OVER (ORDER BY a.rowid) AS seq, a.id, a.occurred_at, a.actor_user_id, a.operation,
                      a.entity_type, a.entity_id, a.reason, a.before_json, a.after_json,
                      CASE WHEN ${sharedActCondition('a')}
                           THEN (SELECT u.display_name FROM users u WHERE u.id = a.actor_user_id)
                      END AS shared_actor_name
                 FROM audit_events a
                WHERE a.owner_user_id = ?)
        WHERE (? IS NULL OR seq < ?)
        ORDER BY seq DESC
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
      // An event with no actor is the system's own (the automatic submission and every posting it makes), whatever its operation (WP3-RBC-01).
      actor_is_system: row.actor_user_id === null,
      actor_user_id: row.actor_user_id === user.id ? row.actor_user_id : null,
      via_share: row.shared_actor_name !== null,
      actor_display_name: row.shared_actor_name,
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
