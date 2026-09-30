import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { isDomainError } from '../../domain/errors.ts';

/*
 * Error classes kept distinct for clients (doc 03): validation (400/415/422), auth
 * (401/429), origin (403), ownership (404: another user's record is indistinguishable
 * from a missing one), stale version (409 stale_version) and immutability (409).
 */

export type ApiStatus = 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422 | 429 | 500;

export class ApiError extends Error {
  readonly status: ApiStatus;
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;

  constructor(status: ApiStatus, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (what = 'Resource'): ApiError => new ApiError(404, 'not_found', `${what} not found`);

export const staleVersion = (): ApiError =>
  new ApiError(409, 'stale_version', 'This record changed since it was loaded; reload and review it again');

export function errorBody(code: string, message: string, details?: Record<string, unknown>) {
  return { error: details === undefined ? { code, message } : { code, message, details } };
}

// RAISE(ABORT, …) messages from schema triggers that mirror domain validation codes.
const TRIGGER_VALIDATION_CODES = new Set(['overlapping_user_intervals', 'break_outside_session', 'overlapping_breaks']);

function sqliteConstraint(error: unknown): { status: ApiStatus; code: string; message: string } | null {
  if (!(error instanceof Error) || !('code' in error) || typeof error.code !== 'string') return null;
  if (!error.code.startsWith('SQLITE_CONSTRAINT')) return null;
  if (error.code === 'SQLITE_CONSTRAINT_TRIGGER') {
    if (TRIGGER_VALIDATION_CODES.has(error.message)) {
      return { status: 422, code: error.message, message: 'The time intervals are invalid' };
    }
    if (error.message.startsWith('immutable_')) {
      return { status: 409, code: error.message, message: 'This record is immutable' };
    }
  }
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
    return { status: 409, code: 'conflict', message: 'A conflicting record already exists' };
  }
  return null;
}

export function handleError(error: unknown, c: Context): Response {
  if (error instanceof ApiError) return c.json(errorBody(error.code, error.message, error.details), error.status);
  if (isDomainError(error)) {
    return c.json(errorBody(error.code, error.message, error.details === undefined ? undefined : { ...error.details }), 422);
  }
  if (error instanceof HTTPException) {
    const status = error.status === 413 ? 413 : 400;
    return c.json(errorBody(status === 413 ? 'payload_too_large' : 'bad_request', error.message), status);
  }
  const constraint = sqliteConstraint(error);
  if (constraint !== null) return c.json(errorBody(constraint.code, constraint.message), constraint.status);
  console.error('Unhandled request error', error);
  return c.json(errorBody('internal_error', 'Internal server error'), 500);
}
