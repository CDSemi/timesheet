import { accessSync, constants, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { type Context, Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { MIGRATIONS } from './db/migrations.ts';
import { FileStore } from './files/fileStore.ts';
import { errorBody, handleError, notFound } from './http/errors.ts';
import { noStore, requireAllowedOrigin, requireJsonContentType, unless } from './http/security.ts';
import { adminRoutes } from './routes/admin.ts';
import { apiRoutes } from './routes/api.ts';
import { authRoutes } from './routes/auth.ts';
import { historyRoutes } from './routes/history.ts';
import { DEFAULT_IMPORT_MAX_BYTES, importRoutes, isWorkbookUpload } from './routes/imports.ts';
import { otRoutes } from './routes/ot.ts';
import { settingsRoutes } from './routes/settings.ts';
import { sharedRoutes, sharesRoutes } from './routes/shares.ts';
import { DEFAULT_SIGNATURE_MAX_BYTES, isSignatureUpload, signatureRoutes } from './routes/signatures.ts';
import { submissionRoutes } from './routes/submission.ts';
import type { AppDeps, AppEnv } from './types.ts';

export interface AppOptions {
  /**
   * Private directory for signatures (and later PDFs). Defaults to `private-data` beside
   * the database, the same default as `loadDeliveryConfig`; it must be outside the static root.
   */
  dataDir?: string;
  /** Route-scoped size limit of the signature upload (bytes); default 256 KiB. */
  signatureMaxBytes?: number;
  /** Route-scoped size limit of the workbook import upload (bytes); default 8 MiB, the reader's package limit. */
  importMaxBytes?: number;
}

/** The only requests exempt from the global JSON body rules; each predicate is an exact method-and-path match. */
const isRawUpload = (c: Context): boolean => isSignatureUpload(c) || isWorkbookUpload(c);

const GLOBAL_JSON_LIMIT_BYTES = 64 * 1024;

function isInside(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
}

/** True when the private data directory exists and the process may write to it; changes nothing. */
function isWritableDirectory(path: string): boolean {
  try {
    if (!statSync(path).isDirectory()) return false;
    accessSync(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/** Newest applied schema version, or 0 when the migration table is unreadable. */
function appliedSchemaVersion(deps: AppDeps): number {
  try {
    const version = deps.db.prepare('SELECT MAX(version) FROM schema_migrations').pluck().get();
    return typeof version === 'number' ? version : 0;
  } catch {
    return 0;
  }
}

/** One origin: JSON API under /api and the built React client for everything else. */
export function createApp(deps: AppDeps, options: AppOptions = {}) {
  const dataDir = options.dataDir ?? join(dirname(resolve(deps.config.databasePath)), 'private-data');
  if (deps.config.databasePath === ':memory:' && options.dataDir === undefined) {
    throw new Error('A private data directory is required when the database is in memory');
  }
  if (deps.staticDir !== null && isInside(deps.staticDir, dataDir)) {
    throw new Error('The private data directory must not be inside the static root');
  }
  const files = new FileStore(dataDir);
  const app = new Hono<AppEnv>();
  app.onError(handleError);

  app.use(
    '*',
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
      strictTransportSecurity: deps.config.cookieSecure ? 'max-age=31536000; includeSubDomains' : false,
      referrerPolicy: 'same-origin',
    }),
  );
  app.use(
    '/api/*',
    noStore,
    // The two raw uploads are the only exceptions: the signature image (256 KiB, image types) and
    // the owner's workbook (8 MiB, .xlsx only) each have their own limit and content type in their
    // router. Everything else stays JSON-only with a 64 KiB limit.
    unless(
      isRawUpload,
      bodyLimit({
        maxSize: GLOBAL_JSON_LIMIT_BYTES,
        onError: (c) => c.json(errorBody('payload_too_large', 'Request body is too large'), 413),
      }),
    ),
    requireAllowedOrigin(deps.config.allowedOrigins),
    unless(isRawUpload, requireJsonContentType),
  );

  // Liveness: the process answers and the database opens. No personal data.
  app.get('/api/health', (c) => {
    deps.db.prepare('SELECT 1').get();
    return c.json({ status: 'ok' });
  });
  // Readiness: only booleans and integers (no path, name or count of people); reads and writes nothing personal.
  const expectedSchema = MIGRATIONS.at(-1)?.version ?? 0;
  app.get('/api/ready', (c) => {
    const actual = appliedSchemaVersion(deps);
    const dataDirWritable = isWritableDirectory(dataDir);
    const ready = actual === expectedSchema && dataDirWritable;
    return c.json(
      { status: ready ? 'ready' : 'not_ready', schema: { expected: expectedSchema, actual }, data_dir_writable: dataDirWritable },
      ready ? 200 : 503,
    );
  });
  app.route('/api/auth', authRoutes(deps));
  app.route('/api/admin', adminRoutes(deps));
  app.route('/api/ot', otRoutes(deps));
  app.route('/api/history', historyRoutes(deps));
  app.route('/api/settings', settingsRoutes(deps));
  app.route('/api/signatures', signatureRoutes(deps, files, options.signatureMaxBytes ?? DEFAULT_SIGNATURE_MAX_BYTES));
  // The owner's own workbook import (F-1): self-only, never under /api/shared.
  app.route('/api/imports', importRoutes(deps, files, options.importMaxBytes ?? DEFAULT_IMPORT_MAX_BYTES));
  // Sharing (FR-17): the caller's own grants, and delegated access only under an explicit owner path
  // through an allowlist; every other /api route stays self-only.
  app.route('/api/shares', sharesRoutes(deps));
  app.route('/api/shared/:ownerId', sharedRoutes(deps, files));
  app.route('/api', submissionRoutes(deps, { files }));
  app.route('/api', apiRoutes(deps));
  app.all('/api/*', () => {
    throw notFound('Endpoint');
  });

  if (deps.staticDir !== null) {
    const root = deps.staticDir;
    app.use('*', serveStatic({ root }));
    // A missing asset (a source map above all) is a 404, never the single-page fallback below (WP4-A-01).
    app.all('/assets/*', () => {
      throw notFound('Asset');
    });
    app.get('*', serveStatic({ path: join(root, 'index.html') }));
  }
  app.notFound((c) => c.json(errorBody('not_found', 'Not found'), 404));
  return app;
}
