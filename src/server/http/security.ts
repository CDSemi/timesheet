import { createMiddleware } from 'hono/factory';
import { ApiError } from './errors.ts';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF/origin protection for state-changing API requests: the browser-supplied Origin
 * must exactly match a configured origin, and cross-site fetch metadata is refused.
 * Session cookies are also SameSite=Strict.
 */
export function requireAllowedOrigin(allowedOrigins: readonly string[]) {
  return createMiddleware(async (c, next) => {
    if (!SAFE_METHODS.has(c.req.method)) {
      const origin = c.req.header('origin');
      if (origin === undefined || !allowedOrigins.includes(origin) || c.req.header('sec-fetch-site') === 'cross-site') {
        throw new ApiError(403, 'origin_rejected', 'Request origin is not allowed');
      }
    }
    await next();
  });
}

/** State-changing API bodies must be JSON, which HTML forms cannot send cross-site. */
export const requireJsonContentType = createMiddleware(async (c, next) => {
  const contentType = c.req.header('content-type');
  if (!SAFE_METHODS.has(c.req.method) && contentType !== undefined && !/^application\/json\b/i.test(contentType)) {
    throw new ApiError(415, 'unsupported_media_type', 'Send request bodies as application/json');
  }
  await next();
});

/** Private data must not be cached by browsers or proxies. */
export const noStore = createMiddleware(async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});
