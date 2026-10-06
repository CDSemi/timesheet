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
  /**
   * The share the actor acted under (WP4-T02, migration 0007): set only by a write made through /api/shared/:ownerId,
   * so "through a share" is recorded, never inferred. The database refuses a share that does not run from the owner to
   * the actor. Absent for every other write.
   */
  viaShareId?: string | null;
}

/**
 * Appends an audit event; call inside the same transaction as the change it describes. The marker column is named
 * only when there is a marker, so a write outside /api/shared has the statement it always had.
 */
export function recordAudit(db: Db, clock: Clock, input: AuditInput): void {
  const viaShareId = input.viaShareId ?? null;
  db.prepare(
    `INSERT INTO audit_events
       (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json${viaShareId === null ? '' : ', via_share_id'})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?${viaShareId === null ? '' : ', ?'})`,
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
    ...(viaShareId === null ? [] : [viaShareId]),
  );
}

/** Absent state (creation's "before", deletion's "after") is stored as SQL NULL. */
function snapshot(state: unknown): string | null {
  return state === undefined || state === null ? null : JSON.stringify(state);
}
