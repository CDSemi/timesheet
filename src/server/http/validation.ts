import type { Context } from 'hono';
import type { z } from 'zod';
import { ApiError } from './errors.ts';

/** Parses a JSON body against a strict schema; unknown fields (e.g. user_id) are rejected. */
export async function readJson<Schema extends z.ZodType>(c: Context, schema: Schema): Promise<z.infer<Schema>> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new ApiError(400, 'invalid_json', 'The request body must be valid JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, 'validation_error', 'The request body is invalid', {
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code, message: issue.message })),
    });
  }
  return parsed.data;
}

/** A trimmed reason, or null when absent/blank. */
export function normalizeReason(reason: string | undefined | null): string | null {
  const trimmed = reason?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}
