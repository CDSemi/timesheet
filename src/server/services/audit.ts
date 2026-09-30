import { randomUUID } from 'node:crypto';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';

export interface AuditInput {
  actorUserId: string | null;
  ownerUserId: string | null;
  operation: string;
  entityType: string;
  entityId: string | null;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
}

/** Appends an audit event; call inside the same transaction as the change it describes. */
export function recordAudit(db: Db, clock: Clock, input: AuditInput): void {
  db.prepare(
    `INSERT INTO audit_events
       (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    nowUtc(clock),
    input.actorUserId,
    input.ownerUserId,
    input.operation,
    input.entityType,
    input.entityId,
    input.reason ?? null,
    snapshot(input.before),
    snapshot(input.after),
  );
}

/** Absent state (creation's "before", deletion's "after") is stored as SQL NULL. */
function snapshot(state: unknown): string | null {
  return state === undefined || state === null ? null : JSON.stringify(state);
}
