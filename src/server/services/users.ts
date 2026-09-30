import { randomUUID } from 'node:crypto';
import { hashPassword, isAcceptablePassword } from '../auth/passwords.ts';
import type { UserRole } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { ApiError } from '../http/errors.ts';
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Creates a local account (setup/admin path; public registration is out of scope). */
export async function createUser(db: Db, clock: Clock, input: NewUser, actorUserId: string | null): Promise<string> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new ApiError(422, 'invalid_email', 'Invalid email');
  if (input.displayName.trim() === '') throw new ApiError(422, 'invalid_display_name', 'A display name is required');
  if (!isAcceptablePassword(input.password)) {
    throw new ApiError(422, 'weak_password', 'Passwords must be 12–256 characters');
  }
  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  const now = nowUtc(clock);
  db.transaction(() => {
    db.prepare(
      `INSERT INTO users (id, email, display_name, role, status, password_hash, calendar_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    ).run(id, email, input.displayName.trim(), input.role, passwordHash, input.calendarId, now, now);
    recordAudit(db, clock, {
      actorUserId,
      ownerUserId: id,
      operation: 'user.create',
      entityType: 'user',
      entityId: id,
      after: { email, display_name: input.displayName.trim(), role: input.role, calendar_id: input.calendarId },
    });
  }).immediate();
  return id;
}

export function findUserByEmail(db: Db, email: string): UserRecord | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email)) as UserRecord | undefined;
}
