import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { FileStore } from './files/fileStore.ts';
import { errorBody, handleError, notFound } from './http/errors.ts';
import { noStore, requireAllowedOrigin, requireJsonContentType, unless } from './http/security.ts';
import { adminRoutes } from './routes/admin.ts';
import { apiRoutes } from './routes/api.ts';
import { authRoutes } from './routes/auth.ts';
import { historyRoutes } from './routes/history.ts';
import { otRoutes } from './routes/ot.ts';
import { settingsRoutes } from './routes/settings.ts';
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
}

const GLOBAL_JSON_LIMIT_BYTES = 64 * 1024;

function isInside(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
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
    // The signature upload is the only exception: it has its own 256 KiB limit and image
    // content types in its router. Everything else stays JSON-only with a 64 KiB limit.
    unless(
      isSignatureUpload,
      bodyLimit({
        maxSize: GLOBAL_JSON_LIMIT_BYTES,
        onError: (c) => c.json(errorBody('payload_too_large', 'Request body is too large'), 413),
      }),
    ),
    requireAllowedOrigin(deps.config.allowedOrigins),
    unless(isSignatureUpload, requireJsonContentType),
  );

  // Health contains no personal data.
  app.get('/api/health', (c) => {
    deps.db.prepare('SELECT 1').get();
    return c.json({ status: 'ok' });
  });
  app.route('/api/auth', authRoutes(deps));
  app.route('/api/admin', adminRoutes(deps));
  app.route('/api/ot', otRoutes(deps));
  app.route('/api/history', historyRoutes(deps));
  app.route('/api/settings', settingsRoutes(deps));
  app.route('/api/signatures', signatureRoutes(deps, files, options.signatureMaxBytes ?? DEFAULT_SIGNATURE_MAX_BYTES));
  app.route('/api', submissionRoutes(deps));
  app.route('/api', apiRoutes(deps));
  app.all('/api/*', () => {
    throw notFound('Endpoint');
  });

  if (deps.staticDir !== null) {
    const root = deps.staticDir;
    app.use('*', serveStatic({ root }));
    app.get('*', serveStatic({ path: join(root, 'index.html') }));
  }
  app.notFound((c) => c.json(errorBody('not_found', 'Not found'), 404));
  return app;
}
