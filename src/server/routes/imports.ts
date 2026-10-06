import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { FileStore } from '../files/fileStore.ts';
import { requireUser } from '../http/auth.ts';
import { ApiError, errorBody, notFound } from '../http/errors.ts';
import { importCommitBody } from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { DEFAULT_READER_LIMITS } from '../import/xlsxReader.ts';
import { commitImport, getImport, listImports, previewImport, XLSX_MEDIA_TYPE } from '../services/workbookImport.ts';
import type { AppDeps, AppEnv } from '../types.ts';

/** The workbook upload: the second (and last) API route that takes a raw body instead of JSON. */
export const IMPORT_UPLOAD_PATH = '/api/imports';

/** True only for `POST /api/imports`; the global JSON-only rule is relaxed for nothing else on this router. */
export const isWorkbookUpload = (c: Context): boolean => c.req.method === 'POST' && c.req.path === IMPORT_UPLOAD_PATH;

/** Route-scoped upload limit: the reader's own package limit (8 MiB). Every other /api route keeps 64 KiB. */
export const DEFAULT_IMPORT_MAX_BYTES = DEFAULT_READER_LIMITS.maxCompressedBytes;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mediaType(header: string | undefined): string | null {
  return header === undefined ? null : (header.split(';')[0]?.trim().toLowerCase() ?? null);
}

function importId(c: Context<AppEnv>): string {
  const id = c.req.param('id') ?? '';
  if (!UUID.test(id)) throw notFound('Import');
  return id;
}

/**
 * The owner's own workbook import (owner decision F-1 (a), 2026-10-05). Every route is self-only: the owner always
 * comes from the session, another user's batch answers 404, and the router is never mounted under /api/shared, so
 * neither an administrator nor a share grantee can preview, read or commit someone else's import. The uploaded
 * source is stored privately and never served by any route or the static root.
 *
 * - `POST /` takes the raw .xlsx body (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` only; a
 *   macro-enabled type is 415) up to the route-scoped limit, and answers 201 with a new preview batch or 200 with the
 *   existing batch of the same upload.
 * - `GET /` lists the owner's batches (metadata only); `GET /:id` returns one batch with its report and plan.
 * - `POST /:id/commit` takes `{ decisions: [{ work_date, action }] }` and commits once.
 */
export function importRoutes(deps: AppDeps, files: FileStore, maxBytes: number) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  const requireWorkbookContentType = createMiddleware<AppEnv>(async (c, next) => {
    if (mediaType(c.req.header('content-type')) !== XLSX_MEDIA_TYPE) {
      throw new ApiError(415, 'unsupported_media_type', 'Send the workbook as an .xlsx file (macro-enabled workbooks are not accepted)');
    }
    await next();
  });

  app.post(
    '/',
    auth,
    requireWorkbookContentType,
    bodyLimit({
      maxSize: maxBytes,
      onError: (c) => c.json(errorBody('payload_too_large', 'The workbook is too large'), 413),
    }),
    async (c) => {
      const bytes = new Uint8Array(await c.req.arrayBuffer());
      const { created, batch } = previewImport({ db: deps.db, clock: deps.clock, files, user: c.get('user') }, bytes);
      return c.json({ import: batch, created }, created ? 201 : 200);
    },
  );

  app.get('/', auth, (c) => c.json({ imports: listImports(deps.db, c.get('user')) }));

  app.get('/:id', auth, (c) => c.json({ import: getImport(deps.db, deps.clock, c.get('user'), importId(c)) }));

  app.post('/:id/commit', auth, async (c) => {
    const id = importId(c);
    const body = await readJson(c, importCommitBody);
    const { status, batch } = commitImport({ db: deps.db, clock: deps.clock, user: c.get('user') }, id, body.decisions);
    return c.json({ status, import: batch });
  });

  return app;
}
