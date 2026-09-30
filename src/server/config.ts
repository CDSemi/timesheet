import { homedir } from 'node:os';
import { join } from 'node:path';

export interface AppConfig {
  /** Bind address; defaults to loopback so nothing is exposed on the network. */
  host: string;
  port: number;
  databasePath: string;
  /** Exact origins allowed to send state-changing requests (CSRF/origin protection). */
  allowedOrigins: readonly string[];
  cookieSecure: boolean;
  sessionTtlSeconds: number;
  production: boolean;
}

/** Keep the live SQLite database outside synchronized folders such as Dropbox (doc 07). */
export function defaultDatabasePath(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.LOCALAPPDATA ?? join(homedir(), '.local', 'share');
  return join(base, 'timesheet-dev', 'timesheet.db');
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error(`Invalid PORT ${value}`);
  return port;
}

function parseOrigins(value: string): string[] {
  const origins = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
  for (const origin of origins) {
    if (new URL(origin).origin !== origin) throw new Error(`APP_ORIGINS entry must be a bare origin: ${origin}`);
  }
  return origins;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const port = parsePort(env.PORT ?? '3000');
  if (production && env.APP_ORIGINS === undefined) {
    throw new Error('APP_ORIGINS is required in production (the public HTTPS origin)');
  }
  const origins =
    env.APP_ORIGINS ??
    [`http://localhost:${port}`, `http://127.0.0.1:${port}`, 'http://localhost:5173', 'http://127.0.0.1:5173'].join(',');
  const ttlHours = Number(env.SESSION_TTL_HOURS ?? '168');
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) throw new Error('SESSION_TTL_HOURS must be positive');
  return {
    host: env.HOST ?? '127.0.0.1',
    port,
    databasePath: env.DATABASE_PATH ?? defaultDatabasePath(env),
    allowedOrigins: parseOrigins(origins),
    cookieSecure: env.COOKIE_SECURE === undefined ? production : env.COOKIE_SECURE === 'true',
    sessionTtlSeconds: Math.round(ttlHours * 3600),
    production,
  };
}
