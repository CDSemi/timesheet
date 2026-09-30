import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { formatUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';

/*
 * Revocable server-side sessions. The cookie holds a random 256-bit token; only its
 * SHA-256 hash is stored, so a database copy cannot be replayed as a login.
 */

export const SESSION_COOKIE = 'ts_session';

export type UserRole = 'admin' | 'employee';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  calendarId: string;
  sessionId: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createAuthSession(
  db: Db,
  clock: Clock,
  userId: string,
  ttlSeconds: number,
): { token: string; expiresAt: string } {
  const token = randomBytes(32).toString('base64url');
  const now = nowUtc(clock);
  const expiresAt = formatUtcInstant(nowEpoch(clock) + ttlSeconds);
  db.prepare(
    `INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), userId, hashToken(token), now, expiresAt, now);
  return { token, expiresAt };
}

interface SessionRow {
  session_id: string;
  last_seen_at: string;
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  calendar_id: string;
}

/** The active user for a session token, or null if unknown, expired, revoked or deactivated. */
export function findSessionUser(db: Db, clock: Clock, token: string): SessionUser | null {
  const now = nowUtc(clock);
  const row = db
    .prepare(
      `SELECT s.id AS session_id, s.last_seen_at, u.id, u.email, u.display_name, u.role, u.calendar_id
         FROM auth_sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active'`,
    )
    .get(hashToken(token), now) as SessionRow | undefined;
  if (row === undefined) return null;
  if (row.last_seen_at.slice(0, 16) !== now.slice(0, 16)) {
    db.prepare('UPDATE auth_sessions SET last_seen_at = ? WHERE id = ?').run(now, row.session_id);
  }
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    calendarId: row.calendar_id,
    sessionId: row.session_id,
  };
}

export function revokeAuthSession(db: Db, clock: Clock, sessionId: string): void {
  db.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(nowUtc(clock), sessionId);
}

export function revokeAllAuthSessions(db: Db, clock: Clock, userId: string): void {
  db.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL').run(nowUtc(clock), userId);
}
