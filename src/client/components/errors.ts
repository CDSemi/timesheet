import { ApiRequestError } from '../api.ts';

/** A one-line message for a failed request: the server's own message and its code. */
export function describeError(caught: unknown): string {
  return caught instanceof ApiRequestError ? `${caught.message} (${caught.code})` : 'Request failed';
}

/** A 409 stale_version: the record changed since the editor loaded it. */
export function isStaleVersion(caught: unknown): boolean {
  return caught instanceof ApiRequestError && caught.status === 409 && caught.code === 'stale_version';
}
