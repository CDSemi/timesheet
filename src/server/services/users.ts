import { randomUUID } from 'node:crypto';
import { hashPassword, isAcceptablePassword } from '../auth/passwords.ts';
import { revokeAllAuthSessions, type UserRole } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';

export interface NewUser {
  email: string;
  displayName: string;
  role: UserRole;
  password: string;
  calendarId: string;
}

export interface UserRecord {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: 'active' | 'deactivated';
  password_hash: string;
  calendar_id: string;
}

/** Account fields only: the password hash is never selected for administration. */
export interface UserAccount {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: 'active' | 'deactivated';
  calendar_id: string;
  created_at: string;
  updated_at: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const ACCOUNT_COLUMNS = 'id, email, display_name, role, status, calendar_id, created_at, updated_at';
const MAX_DISPLAY_NAME_LENGTH = 120;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Audit snapshot of an account; deliberately excludes every password field. */
function accountSnapshot(account: UserAccount) {
  return {
    email: account.email,
    display_name: account.display_name,
    role: account.role,
    status: account.status,
    calendar_id: account.calendar_id,
  };
}

function cleanDisplayName(displayName: string): string {
  const trimmed = displayName.trim();
  if (trimmed === '' || trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ApiError(422, 'invalid_display_name', `A display name of 1–${MAX_DISPLAY_NAME_LENGTH} characters is required`);
  }
  return trimmed;
}

function assertCalendarExists(db: Db, calendarId: string): void {
  if (db.prepare('SELECT 1 FROM calendars WHERE id = ?').get(calendarId) === undefined) {
    throw new ApiError(422, 'unknown_calendar', 'The calendar does not exist');
  }
}

export function getUserAccount(db: Db, userId: string): UserAccount | undefined {
  return db.prepare(`SELECT ${ACCOUNT_COLUMNS} FROM users WHERE id = ?`).get(userId) as UserAccount | undefined;
}

export function listUsers(db: Db): UserAccount[] {
  return db.prepare(`SELECT ${ACCOUNT_COLUMNS} FROM users ORDER BY created_at, email`).all() as UserAccount[];
}

function requireAccount(db: Db, userId: string): UserAccount {
  const account = getUserAccount(db, userId);
  if (account === undefined) throw notFound('User');
  return account;
}

function otherActiveAdmins(db: Db, userId: string): number {
  return db
    .prepare("SELECT count(*) FROM users WHERE role = 'admin' AND status = 'active' AND id <> ?")
    .pluck()
    .get(userId) as number;
}

const lastActiveAdmin = (): ApiError =>
  new ApiError(409, 'last_active_admin', 'At least one active administrator must remain');

/**
 * Creates a local account (setup/admin path; public registration is out of scope). The
 * password is the admin-set temporary one (E-11): it is hashed here and appears in no
 * return value, audit payload or error.
 */
export async function createUser(db: Db, clock: Clock, input: NewUser, actorUserId: string | null): Promise<string> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new ApiError(422, 'invalid_email', 'Invalid email');
  const displayName = cleanDisplayName(input.displayName);
  if (!isAcceptablePassword(input.password)) {
    throw new ApiError(422, 'weak_password', 'Passwords must be 12–256 characters');
  }
  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  const now = nowUtc(clock);
  db.transaction(() => {
    assertCalendarExists(db, input.calendarId);
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email) !== undefined) {
      throw new ApiError(409, 'email_in_use', 'An account with this email already exists');
    }
    db.prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    ).run(id, email, displayName, input.role, passwordHash, input.calendarId, now, now);
    recordAudit(db, clock, {
      actorUserId,
      ownerUserId: id,
      operation: 'user.create',
      entityType: 'user',
      entityId: id,
      after: { email, display_name: displayName, role: input.role, status: 'active', calendar_id: input.calendarId },
    });
  }).immediate();
  return id;
}

export interface UserChanges {
  actorUserId: string;
  userId: string;
  displayName?: string;
  role?: UserRole;
  calendarId?: string;
}

/** Edits display name, role and calendar; an edit that changes nothing writes no audit event. */
export function updateUser(db: Db, clock: Clock, input: UserChanges): UserAccount {
  const displayName = input.displayName === undefined ? undefined : cleanDisplayName(input.displayName);
  return db
    .transaction(() => {
      const before = requireAccount(db, input.userId);
      if (input.calendarId !== undefined) assertCalendarExists(db, input.calendarId);
      const next = {
        display_name: displayName ?? before.display_name,
        role: input.role ?? before.role,
        calendar_id: input.calendarId ?? before.calendar_id,
      };
      if (
        next.display_name === before.display_name &&
        next.role === before.role &&
        next.calendar_id === before.calendar_id
      ) {
        return before;
      }
      const demotesLastAdmin =
        before.role === 'admin' && next.role !== 'admin' && before.status === 'active' && otherActiveAdmins(db, before.id) === 0;
      if (demotesLastAdmin) throw lastActiveAdmin();
      db.prepare('UPDATE users SET display_name = ?, role = ?, calendar_id = ?, updated_at = ? WHERE id = ?').run(
        next.display_name,
        next.role,
        next.calendar_id,
        nowUtc(clock),
        before.id,
      );
      const after = requireAccount(db, before.id);
      recordAudit(db, clock, {
        actorUserId: input.actorUserId,
        ownerUserId: before.id,
        operation: 'user.update',
        entityType: 'user',
        entityId: before.id,
        before: accountSnapshot(before),
        after: accountSnapshot(after),
      });
      return after;
    })
    .immediate();
}

export interface UserStatusChange {
  actorUserId: string;
  userId: string;
  reason: string | null;
}

/**
 * Deactivates an account and revokes every one of its sessions in one transaction. The
 * user's data and history stay untouched. Refuses self-deactivation and the last active
 * admin; an already deactivated account is a quiet no-op.
 */
export function deactivateUser(db: Db, clock: Clock, input: UserStatusChange): UserAccount {
  return db
    .transaction(() => {
      const before = requireAccount(db, input.userId);
      if (input.actorUserId === before.id) {
        throw new ApiError(409, 'cannot_deactivate_self', 'You cannot deactivate your own account');
      }
      if (before.status === 'deactivated') return before;
      if (before.role === 'admin' && otherActiveAdmins(db, before.id) === 0) throw lastActiveAdmin();
      db.prepare("UPDATE users SET status = 'deactivated', updated_at = ? WHERE id = ?").run(nowUtc(clock), before.id);
      const sessionsRevoked = revokeAllAuthSessions(db, clock, before.id);
      const after = requireAccount(db, before.id);
      recordAudit(db, clock, {
        actorUserId: input.actorUserId,
        ownerUserId: before.id,
        operation: 'user.deactivate',
        entityType: 'user',
        entityId: before.id,
        reason: input.reason,
        before: accountSnapshot(before),
        after: { ...accountSnapshot(after), sessions_revoked: sessionsRevoked },
      });
      return after;
    })
    .immediate();
}

/**
 * Reactivates an account. Old sessions are never revived: any session still unrevoked is
 * revoked again, so the user must sign in anew. An active account is a quiet no-op.
 */
export function reactivateUser(db: Db, clock: Clock, input: UserStatusChange): UserAccount {
  return db
    .transaction(() => {
      const before = requireAccount(db, input.userId);
      if (before.status === 'active') return before;
      db.prepare("UPDATE users SET status = 'active', updated_at = ? WHERE id = ?").run(nowUtc(clock), before.id);
      const sessionsRevoked = revokeAllAuthSessions(db, clock, before.id);
      const after = requireAccount(db, before.id);
      recordAudit(db, clock, {
        actorUserId: input.actorUserId,
        ownerUserId: before.id,
        operation: 'user.reactivate',
        entityType: 'user',
        entityId: before.id,
        reason: input.reason,
        before: accountSnapshot(before),
        after: { ...accountSnapshot(after), sessions_revoked: sessionsRevoked },
      });
      return after;
    })
    .immediate();
}

export function findUserByEmail(db: Db, email: string): UserRecord | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email)) as UserRecord | undefined;
}
