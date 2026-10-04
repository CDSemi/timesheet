import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { FileStore } from '../files/fileStore.ts';
import { requireUser } from '../http/auth.ts';
import { ApiError, errorBody, notFound } from '../http/errors.ts';
import { currentSignature, readSignature, saveSignature } from '../services/signatures.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** The one API route that takes a raw image body instead of JSON. */
export const SIGNATURE_UPLOAD_PATH = '/api/signatures';

/** True only for `POST /api/signatures`; the global JSON-only rule is relaxed for nothing else. */
export const isSignatureUpload = (c: Context): boolean => c.req.method === 'POST' && c.req.path === SIGNATURE_UPLOAD_PATH;

/** Route-scoped upload size limit; every other /api route keeps the global 64 KiB limit. */
export const DEFAULT_SIGNATURE_MAX_BYTES = 256 * 1024;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXTENSION = { 'image/png': 'png', 'image/jpeg': 'jpg' } as const;

/** The media type without parameters, lower-cased; null when the header is absent. */
function mediaType(header: string | undefined): string | null {
  return header === undefined ? null : (header.split(';')[0]?.trim().toLowerCase() ?? null);
}

/**
 * Owner-only signature images. Origin/CSRF checks run in the shared `/api/*` middleware
 * before this router; authentication runs first here, so an anonymous caller never has a
 * body read. The image is only ever returned from `GET /:id` after an owner-scoped
 * lookup, with `no-store` and an attachment disposition, never from the static root.
 */
export function signatureRoutes(deps: AppDeps, files: FileStore, maxBytes: number) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  const requireImageContentType = createMiddleware<AppEnv>(async (c, next) => {
    const type = mediaType(c.req.header('content-type'));
    if (type !== 'image/png' && type !== 'image/jpeg') {
      throw new ApiError(415, 'unsupported_media_type', 'Send the signature as image/png or image/jpeg');
    }
    await next();
  });

  app.post(
    '/',
    auth,
    requireImageContentType,
    bodyLimit({
      maxSize: maxBytes,
      onError: (c) => c.json(errorBody('payload_too_large', 'Signature image is too large'), 413),
    }),
    async (c) => {
      const declared = mediaType(c.req.header('content-type')) ?? '';
      const bytes = new Uint8Array(await c.req.arrayBuffer());
      const signature = saveSignature(deps.db, deps.clock, files, c.get('user').id, bytes, declared);
      return c.json({ signature }, 201);
    },
  );

  // Metadata of the caller's current signature (no image bytes).
  app.get('/current', auth, (c) => {
    const signature = currentSignature(deps.db, c.get('user').id);
    if (signature === null) throw notFound('Signature');
    return c.json({ signature });
  });

  app.get('/:id', auth, (c) => {
    const id = c.req.param('id');
    if (!UUID.test(id)) throw notFound('Signature');
    const file = readSignature(deps.db, files, c.get('user').id, id);
    const extension = EXTENSION[file.mimeType as keyof typeof EXTENSION];
    return c.body(new Uint8Array(file.bytes), 200, {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="signature.${extension}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
  });

  return app;
}
