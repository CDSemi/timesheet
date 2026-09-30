import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { LoginRateLimiter } from './auth/rateLimit.ts';
import { systemClock } from './clock.ts';
import { loadConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { migrate } from './db/migrations.ts';

/** Built client next to the compiled server (dist/client); the Vite dev server serves it in development. */
function resolveStaticDir(): string | null {
  if (process.env.STATIC_DIR !== undefined) return process.env.STATIC_DIR;
  const candidate = fileURLToPath(new URL('../client/', import.meta.url));
  return /[\\/]dist[\\/]client[\\/]?$/.test(candidate) && existsSync(join(candidate, 'index.html')) ? candidate : null;
}

const config = loadConfig();
if (config.databasePath.split(/[\\/]/).some((segment) => segment.toLowerCase() === 'dropbox')) {
  console.warn('DATABASE_PATH is inside a Dropbox folder; keep the live SQLite database on local storage (doc 07).');
}
const db = openDatabase(config.databasePath);
const migration = migrate(db);
const app = createApp({
  db,
  clock: systemClock,
  config,
  loginLimiter: new LoginRateLimiter(),
  staticDir: resolveStaticDir(),
});

const server = serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  console.log(`Timesheet listening on http://${info.address}:${info.port} (schema v${migration.version})`);
});

function shutdown(): void {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
