import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordAudit } from '../../src/server/services/audit.ts';
import { getHistory } from '../../src/server/services/history.ts';
import { granteeChangesForReview } from '../../src/server/services/sharedActs.ts';
import { createUser } from '../../src/server/services/users.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T02 (FR-14, FR-17, AC-16; WP3 carry 15 / R7): an audit event is "through a share" because it
 * records the marker `audit_events.via_share_id` (migration 0007), not because its actor and operation
 * code look like a grantee's. The operation-code inference stays only for rows written before the
 * migration: a NULL marker and an `occurred_at` earlier than the migration's `applied_at`. The test
 * database is migrated at the wall-clock time, so every test below pins `applied_at` explicitly and
 * never depends on today's date. Synthetic accounts only.
 */

const MIGRATED_AT = '2026-10-01T00:00:00Z';
const BEFORE = '2026-09-30T12:00:00Z';
const AFTER = '2026-10-02T12:00:00Z';
const PAYROLL = '2026-10-02';
const DAY = '2026-09-22';

let t: TestContext;
let granteeId: string;
let granteeCookie: string;
let shareId: string;

function pinMigrationTime(): void {
  t.db.prepare('UPDATE schema_migrations SET applied_at = ? WHERE version = 7').run(MIGRATED_AT);
}

beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  pinMigrationTime();
  const password = randomBytes(18).toString('base64url');
  granteeId = await createUser(
    t.db,
    t.clock,
    { email: 'grantee@example.invalid', displayName: 'Synthetic Grantee', role: 'employee', password, calendarId: t.calendarId },
    t.userIds.admin,
  );
  const login = await t.request('POST', '/api/auth/login', { body: { email: 'grantee@example.invalid', password } });
  granteeCookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const owner = await t.login('employee');
  const granted = await t.request('POST', '/api/shares', {
    cookie: owner,
    body: { grantee_email: 'grantee@example.invalid', items: { timesheets: 'edit', ot_read: false, pdf_download: false } },
  });
  expect(granted.status, JSON.stringify(granted.body)).toBe(201);
  shareId = granted.body.share.id as string;
});

afterEach(() => t.close());

/** One audit row written straight into the table, standing for a write of the named route. */
function insertEvent(options: {
  id: string;
  occurredAt: string;
  actor: string | null;
  operation: string;
  viaShareId?: string | null;
  workDate?: string;
}): void {
  const marked = options.viaShareId !== undefined && options.viaShareId !== null;
  t.db
    .prepare(
      `INSERT INTO audit_events (id, occurred_at, actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, before_json, after_json${marked ? ', via_share_id' : ''})
       VALUES (?, ?, ?, ?, ?, 'day_entry', ?, NULL, NULL, ?${marked ? ', ?' : ''})`,
    )
    .run(
      options.id,
      options.occurredAt,
      options.actor,
      t.userIds.employee,
      options.operation,
      `entity-${options.id}`,
      JSON.stringify({ work_date: options.workDate ?? DAY }),
      ...(marked ? [options.viaShareId] : []),
    );
}

const owner = () => ({ id: t.userIds.employee, calendarId: t.calendarId });

function viaShareOf(id: string): boolean {
  const event = getHistory(t.db, owner(), {}).audit_events.find((row) => row.id === id);
  if (event === undefined) throw new Error(`event ${id} not in the history`);
  return event.via_share;
}

describe('an act by someone other than the owner is not a share act unless it records the marker', () => {
  it('does not attribute a day or session event written outside /api/shared (the marker is NULL after the migration)', () => {
    for (const operation of ['day_entry.create', 'day_entry.update', 'work_session.create', 'work_session.update', 'work_session.delete']) {
      insertEvent({ id: `plain-${operation}`, occurredAt: AFTER, actor: granteeId, operation });
      expect(viaShareOf(`plain-${operation}`), operation).toBe(false);
    }
    expect(granteeChangesForReview(t.db, owner(), PAYROLL)).toEqual([]);
  });

  it('attributes an event that records the marker, and names the grantee in the history and the Review hint', () => {
    insertEvent({ id: 'marked', occurredAt: AFTER, actor: granteeId, operation: 'day_entry.update', viaShareId: shareId });
    const event = getHistory(t.db, owner(), {}).audit_events.find((row) => row.id === 'marked');
    expect(event).toMatchObject({ via_share: true, actor_display_name: 'Synthetic Grantee', actor_is_self: false, actor_user_id: null });
    expect(granteeChangesForReview(t.db, owner(), PAYROLL)).toEqual([{ display_name: 'Synthetic Grantee', days: 1, work_dates: [DAY] }]);
  });

  it('lets the marker win over the operation code: a marked share event of any operation is attributed', () => {
    insertEvent({ id: 'marked-other', occurredAt: AFTER, actor: granteeId, operation: 'something.else', viaShareId: shareId });
    expect(viaShareOf('marked-other')).toBe(true);
  });
});

describe('rows written before the migration keep the operation-code inference', () => {
  it('attributes a NULL-marker row of a grantee-style operation that predates the migration', () => {
    insertEvent({ id: 'legacy-shared', occurredAt: BEFORE, actor: granteeId, operation: 'work_session.create' });
    insertEvent({ id: 'legacy-other-operation', occurredAt: BEFORE, actor: granteeId, operation: 'user.update', workDate: '2026-09-23' });
    insertEvent({ id: 'legacy-owner', occurredAt: BEFORE, actor: t.userIds.employee, operation: 'work_session.create', workDate: '2026-09-24' });
    insertEvent({ id: 'legacy-system', occurredAt: BEFORE, actor: null, operation: 'day_entry.create', workDate: '2026-09-25' });
    expect(viaShareOf('legacy-shared')).toBe(true);
    expect(viaShareOf('legacy-other-operation')).toBe(false);
    expect(viaShareOf('legacy-owner')).toBe(false);
    expect(viaShareOf('legacy-system')).toBe(false);
    expect(granteeChangesForReview(t.db, owner(), PAYROLL)).toEqual([{ display_name: 'Synthetic Grantee', days: 1, work_dates: [DAY] }]);
  });

  it('stops inferring exactly at the migration instant: a NULL-marker row at or after it is not a share act', () => {
    insertEvent({ id: 'at-migration', occurredAt: MIGRATED_AT, actor: granteeId, operation: 'work_session.create' });
    insertEvent({ id: 'after-migration', occurredAt: AFTER, actor: granteeId, operation: 'work_session.create' });
    expect(viaShareOf('at-migration')).toBe(false);
    expect(viaShareOf('after-migration')).toBe(false);
  });
});

describe('the marker is recorded honestly', () => {
  it('is migration 0007: a nullable column on the audit table, recorded as applied', () => {
    expect(t.db.prepare('SELECT name FROM schema_migrations WHERE version = 7').pluck().get()).toBe('audit_access');
    const column = t.db.prepare("SELECT type, \"notnull\" AS required FROM pragma_table_info('audit_events') WHERE name = 'via_share_id'").get();
    expect(column).toEqual({ type: 'TEXT', required: 0 });
  });

  it('refuses a marker that names a share the actor does not hold from the event owner', () => {
    const other = t.userIds.admin;
    expect(() => insertEvent({ id: 'wrong-actor', occurredAt: AFTER, actor: other, operation: 'day_entry.update', viaShareId: shareId })).toThrow(
      /audit_via_share_mismatch/,
    );
    expect(() => insertEvent({ id: 'no-actor', occurredAt: AFTER, actor: null, operation: 'day_entry.update', viaShareId: shareId })).toThrow(
      /audit_via_share_mismatch/,
    );
    expect(() => insertEvent({ id: 'unknown-share', occurredAt: AFTER, actor: granteeId, operation: 'day_entry.update', viaShareId: 'no-such-share' })).toThrow(
      /audit_via_share_mismatch|FOREIGN KEY/,
    );
    expect(t.db.prepare("SELECT count(*) FROM audit_events WHERE id IN ('wrong-actor', 'no-actor', 'unknown-share')").pluck().get()).toBe(0);
  });

  it('keeps the audit table append-only after the migration', () => {
    insertEvent({ id: 'append-only', occurredAt: AFTER, actor: granteeId, operation: 'day_entry.update', viaShareId: shareId });
    expect(() => t.db.prepare("UPDATE audit_events SET via_share_id = NULL WHERE id = 'append-only'").run()).toThrow(/immutable_audit_event/);
    expect(() => t.db.prepare("DELETE FROM audit_events WHERE id = 'append-only'").run()).toThrow(/immutable_audit_event/);
  });

  it('records the marker for every write made through a shared route and for no write made outside it', async () => {
    const owned = await t.login('employee');
    const base = `/api/shared/${t.userIds.employee}`;
    const body = { start: la(`${DAY}T09:00`), end: la(`${DAY}T17:00`), input_zone: LA, breaks: [], breaks_confirmed: true };
    const created = await t.request('POST', `${base}/days/${DAY}/sessions`, { cookie: granteeCookie, body });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const ownerSession = await t.request('POST', '/api/days/2026-09-23/sessions', {
      cookie: owned,
      body: { ...body, start: la('2026-09-23T09:00'), end: la('2026-09-23T17:00') },
    });
    expect(ownerSession.status, JSON.stringify(ownerSession.body)).toBe(201);
    const rows = t.db
      .prepare("SELECT actor_user_id, via_share_id FROM audit_events WHERE entity_type IN ('day_entry', 'work_session') AND owner_user_id = ? ORDER BY rowid")
      .all(t.userIds.employee) as Array<{ actor_user_id: string; via_share_id: string | null }>;
    expect(rows.length).toBe(4);
    for (const row of rows) {
      expect(row.via_share_id, row.actor_user_id).toBe(row.actor_user_id === granteeId ? shareId : null);
    }
  });

  it('writes the marker through recordAudit only when given, and NULL otherwise', () => {
    recordAudit(t.db, t.clock, { actorUserId: granteeId, ownerUserId: t.userIds.employee, operation: 'day_entry.update', entityType: 'day_entry', entityId: 'e1', viaShareId: shareId });
    recordAudit(t.db, t.clock, { actorUserId: granteeId, ownerUserId: t.userIds.employee, operation: 'day_entry.update', entityType: 'day_entry', entityId: 'e2' });
    expect(t.db.prepare("SELECT via_share_id FROM audit_events WHERE entity_id IN ('e1', 'e2') ORDER BY rowid").pluck().all()).toEqual([shareId, null]);
  });
});
