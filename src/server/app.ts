import { join } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { errorBody, handleError, notFound } from './http/errors.ts';
import { noStore, requireAllowedOrigin, requireJsonContentType } from './http/security.ts';
import { adminRoutes } from './routes/admin.ts';
import { apiRoutes } from './routes/api.ts';
import { authRoutes } from './routes/auth.ts';
import { historyRoutes } from './routes/history.ts';
import { otRoutes } from './routes/ot.ts';
import type { AppDeps, AppEnv } from './types.ts';

/** One origin: JSON API under /api and the built React client for everything else. */
export function createApp(deps: AppDeps) {
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
    bodyLimit({
      maxSize: 64 * 1024,
      onError: (c) => c.json(errorBody('payload_too_large', 'Request body is too large'), 413),
    }),
    requireAllowedOrigin(deps.config.allowedOrigins),
    requireJsonContentType,
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
