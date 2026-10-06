import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { inspect } from 'node:util';
import { parseTrustedProxyAddresses } from './http/clientAddress.ts';
import type { DeliveryConfig, OutboundConfig, RedactedText, SmtpSecurity, SmtpSettings } from './types.ts';

export interface AppConfig {
  /**
   * Bind address; defaults to loopback so nothing is exposed on the network. A container sets
   * HOST=0.0.0.0 so the published port reaches it, and only inside the container network.
   */
  host: string;
  port: number;
  databasePath: string;
  /** Exact origins allowed to send state-changing requests (CSRF/origin protection). */
  allowedOrigins: readonly string[];
  cookieSecure: boolean;
  sessionTtlSeconds: number;
  production: boolean;
  /**
   * Exact IP addresses of reverse proxies whose X-Forwarded-For is believed (TRUSTED_PROXY_ADDRESSES).
   * Absent or empty means none: every forwarded header is ignored.
   */
  trustedProxyAddresses?: readonly string[];
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
  if (production && (env.DATABASE_PATH === undefined || !isAbsolute(env.DATABASE_PATH))) {
    throw new Error('DATABASE_PATH is required in production as an absolute path (the host-local SQLite file)');
  }
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
    trustedProxyAddresses: parseTrustedProxyAddresses(env.TRUSTED_PROXY_ADDRESSES),
  };
}

/**
 * Holds a secret read from the environment. The value is only available through
 * `reveal()`; string conversion, JSON and `util.inspect` all render `[redacted]`, so a
 * configuration object can never leak it into a log, error or response.
 */
export class SecretValue implements RedactedText {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  reveal(): string {
    return this.#value;
  }

  toString(): string {
    return '[redacted]';
  }

  toJSON(): string {
    return '[redacted]';
  }

  [inspect.custom](): string {
    return '[redacted]';
  }
}

/** Private files stay off synchronized folders (Dropbox would copy signatures and PDFs off the host). */
function isInsideDropbox(path: string): boolean {
  return path.split(/[\\/]/).some((segment) => segment.toLowerCase().startsWith('dropbox'));
}

function parseDataDir(env: NodeJS.ProcessEnv, databasePath: string, production: boolean): string {
  const configured = env.DATA_DIR;
  if (production && (configured === undefined || !isAbsolute(configured))) {
    throw new Error('DATA_DIR is required in production as an absolute path (the private data directory)');
  }
  if (configured !== undefined && !isAbsolute(configured)) throw new Error('DATA_DIR must be an absolute path');
  const dataDir = configured === undefined ? join(dirname(resolve(databasePath)), 'private-data') : resolve(configured);
  if (isInsideDropbox(dataDir)) {
    throw new Error('The private data directory must be outside a Dropbox folder; set DATA_DIR to local storage');
  }
  return dataDir;
}

function parsePublicBaseUrl(env: NodeJS.ProcessEnv, port: number, production: boolean): string {
  const configured = env.PUBLIC_BASE_URL;
  if (configured === undefined) {
    if (production) throw new Error('PUBLIC_BASE_URL is required in production (the public HTTPS URL for deep links)');
    return `http://localhost:${port}`;
  }
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('PUBLIC_BASE_URL must be an absolute URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('PUBLIC_BASE_URL must use http or https');
  if (url.username !== '' || url.password !== '' || url.search !== '' || url.hash !== '' || /[?#]/.test(configured)) {
    throw new Error('PUBLIC_BASE_URL must not contain credentials, query or fragment');
  }
  if (production && url.protocol !== 'https:') throw new Error('PUBLIC_BASE_URL must use https in production');
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

// One address: a local part and a dotted domain, no spaces, brackets, commas or line breaks.
const SINGLE_ADDRESS = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/;

function parseSender(env: NodeJS.ProcessEnv): string | null {
  const configured = env.MAIL_FROM;
  if (configured === undefined || configured === '') return null;
  // The value is never echoed: a mistyped variable could hold a credential.
  if (!SINGLE_ADDRESS.test(configured)) throw new Error('MAIL_FROM must be a single email address');
  return configured;
}

const HOST_NAME = /^[A-Za-z0-9.-]{1,253}$/;

/** Reads SMTP settings for real sending. Error messages name variables only, never values. */
function parseSmtp(env: NodeJS.ProcessEnv): SmtpSettings {
  const host = env.SMTP_HOST;
  if (host === undefined || host === '') throw new Error('SMTP_HOST is required when OUTBOUND_MODE=smtp');
  if (!HOST_NAME.test(host)) throw new Error('SMTP_HOST must be a host name');
  const portText = env.SMTP_PORT ?? '587';
  const port = /^[0-9]{1,5}$/.test(portText) ? Number(portText) : Number.NaN;
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('SMTP_PORT must be an integer from 1 to 65535');
  const securityText = env.SMTP_SECURITY ?? 'starttls';
  if (securityText !== 'starttls' && securityText !== 'tls') throw new Error('SMTP_SECURITY must be starttls or tls');
  const security: SmtpSecurity = securityText;
  const user = env.SMTP_USER ?? '';
  const password = env.SMTP_PASSWORD ?? '';
  if ((user === '') !== (password === '')) throw new Error('SMTP_USER and SMTP_PASSWORD must be set together');
  const auth = user === '' ? null : { user: new SecretValue(user), password: new SecretValue(password) };
  return { host, port, security, auth };
}

/**
 * Outbound mode. Capture (default) writes messages to the private data directory and
 * never touches the network. Real SMTP needs the owner-only PRODUCTION_SENDING_ENABLED
 * flag set to exactly "true"; no development or test path sets it. In capture mode SMTP
 * variables are not read at all, so no credential is held in memory.
 */
function parseOutbound(env: NodeJS.ProcessEnv): OutboundConfig {
  const mode = env.OUTBOUND_MODE ?? 'capture';
  if (mode === 'capture') return { mode: 'capture' };
  if (mode !== 'smtp') throw new Error('OUTBOUND_MODE must be capture or smtp');
  if (env.PRODUCTION_SENDING_ENABLED !== 'true') {
    throw new Error('OUTBOUND_MODE=smtp requires the owner-only PRODUCTION_SENDING_ENABLED=true flag');
  }
  return { mode: 'smtp', smtp: parseSmtp(env) };
}

/**
 * Submission and delivery configuration (WP3). `base` defaults to `loadConfig(env)` so the
 * data directory sits beside the configured database (under LOCALAPPDATA by default).
 */
export function loadDeliveryConfig(
  env: NodeJS.ProcessEnv = process.env,
  base: Pick<AppConfig, 'databasePath' | 'port' | 'production'> = loadConfig(env),
): DeliveryConfig {
  return {
    dataDir: parseDataDir(env, base.databasePath, base.production),
    publicBaseUrl: parsePublicBaseUrl(env, base.port, base.production),
    senderAddress: parseSender(env),
    outbound: parseOutbound(env),
  };
}
