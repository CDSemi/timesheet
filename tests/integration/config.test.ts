import { join, resolve } from 'node:path';
import { inspect } from 'node:util';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig, loadDeliveryConfig, SecretValue } from '../../src/server/config.ts';

// Synthetic values only; none of these is a real host, account or credential.
const LOCAL = resolve('/synthetic/LocalAppData');
const SMTP_USER = 'synthetic-smtp-user@example.invalid';
const SMTP_PASSWORD = 'synthetic-Smtp-Password-7f3a';
const SMTP_HOST = 'smtp.synthetic.example.invalid';

const SMTP_ENV: NodeJS.ProcessEnv = {
  LOCALAPPDATA: LOCAL,
  OUTBOUND_MODE: 'smtp',
  PRODUCTION_SENDING_ENABLED: 'true',
  SMTP_HOST,
  SMTP_PORT: '465',
  SMTP_SECURITY: 'tls',
  SMTP_USER,
  SMTP_PASSWORD,
  MAIL_FROM: 'timesheet@example.invalid',
};

/** Every string the configuration can produce for logs, errors or responses. */
function renderings(value: unknown): string[] {
  return [JSON.stringify(value), inspect(value, { depth: 10, showHidden: true }), String(value)];
}

function errorOf(action: () => unknown): Error {
  try {
    action();
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error('non-Error thrown');
  }
  throw new Error('expected the configuration to be refused');
}

function expectRefusedWithoutSecrets(env: NodeJS.ProcessEnv, pattern: RegExp): void {
  const error = errorOf(() => loadDeliveryConfig(env));
  expect(error.message).toMatch(pattern);
  for (const text of [error.message, String(error), inspect(error), error.stack ?? '']) {
    expect(text).not.toContain(SMTP_PASSWORD);
    expect(text).not.toContain(SMTP_USER);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('application configuration (unchanged by WP3)', () => {
  it('keeps the loopback host, port and database defaults', () => {
    const config = loadConfig({ LOCALAPPDATA: LOCAL });
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(3000);
    expect(config.databasePath).toBe(join(LOCAL, 'timesheet-dev', 'timesheet.db'));
    expect(config.production).toBe(false);
  });
});

describe('delivery configuration defaults', () => {
  it('uses a private data directory beside the default database, capture mode and a local deep-link base', () => {
    expect(loadDeliveryConfig({ LOCALAPPDATA: LOCAL })).toEqual({
      dataDir: join(LOCAL, 'timesheet-dev', 'private-data'),
      publicBaseUrl: 'http://localhost:3000',
      senderAddress: null,
      outbound: { mode: 'capture' },
    });
  });

  it('follows an overridden database path and port', () => {
    const databasePath = resolve('/synthetic/data/app.db');
    const config = loadDeliveryConfig({ DATABASE_PATH: databasePath, PORT: '3100' });
    expect(config.dataDir).toBe(join(resolve('/synthetic/data'), 'private-data'));
    expect(config.publicBaseUrl).toBe('http://localhost:3100');
  });
});

describe('private data directory', () => {
  it('accepts an absolute DATA_DIR override', () => {
    const dataDir = resolve('/synthetic/private');
    expect(loadDeliveryConfig({ LOCALAPPDATA: LOCAL, DATA_DIR: dataDir }).dataDir).toBe(dataDir);
  });

  it('refuses a relative DATA_DIR', () => {
    expect(() => loadDeliveryConfig({ LOCALAPPDATA: LOCAL, DATA_DIR: 'relative/private' })).toThrow(/DATA_DIR must be an absolute path/);
  });

  it('refuses a data directory inside a Dropbox folder, explicit or derived from the database path', () => {
    expect(() => loadDeliveryConfig({ LOCALAPPDATA: LOCAL, DATA_DIR: resolve('/synthetic/Dropbox/private') })).toThrow(
      /outside a Dropbox folder/,
    );
    expect(() => loadDeliveryConfig({ DATABASE_PATH: resolve('/synthetic/Dropbox (Personal)/app.db') })).toThrow(
      /outside a Dropbox folder/,
    );
  });
});

describe('public base URL for deep links', () => {
  it('normalizes an override and keeps a path prefix', () => {
    const env = { LOCALAPPDATA: LOCAL };
    expect(loadDeliveryConfig({ ...env, PUBLIC_BASE_URL: 'https://timesheet.example.invalid/' }).publicBaseUrl).toBe(
      'https://timesheet.example.invalid',
    );
    expect(loadDeliveryConfig({ ...env, PUBLIC_BASE_URL: 'https://example.invalid/timesheet/' }).publicBaseUrl).toBe(
      'https://example.invalid/timesheet',
    );
  });

  it.each([
    ['ftp://example.invalid', /http or https/],
    ['https://user:pw@example.invalid', /credentials, query or fragment/],
    ['https://example.invalid/?token=x', /credentials, query or fragment/],
    ['https://example.invalid/#x', /credentials, query or fragment/],
    ['not a url', /PUBLIC_BASE_URL must be an absolute URL/],
  ])('refuses %s', (value, pattern) => {
    expect(() => loadDeliveryConfig({ LOCALAPPDATA: LOCAL, PUBLIC_BASE_URL: value })).toThrow(pattern);
  });

  it('requires an explicit HTTPS base URL in production', () => {
    const production = { NODE_ENV: 'production', APP_ORIGINS: 'https://timesheet.example.invalid', LOCALAPPDATA: LOCAL };
    expect(() => loadDeliveryConfig(production)).toThrow(/PUBLIC_BASE_URL is required in production/);
    expect(() => loadDeliveryConfig({ ...production, PUBLIC_BASE_URL: 'http://timesheet.example.invalid' })).toThrow(
      /must use https in production/,
    );
    expect(loadDeliveryConfig({ ...production, PUBLIC_BASE_URL: 'https://timesheet.example.invalid' }).publicBaseUrl).toBe(
      'https://timesheet.example.invalid',
    );
  });
});

describe('outbound mode', () => {
  it('is capture by default and when named explicitly', () => {
    expect(loadDeliveryConfig({ LOCALAPPDATA: LOCAL }).outbound).toEqual({ mode: 'capture' });
    expect(loadDeliveryConfig({ LOCALAPPDATA: LOCAL, OUTBOUND_MODE: 'capture' }).outbound).toEqual({ mode: 'capture' });
  });

  it.each(['dry_run', 'SMTP', 'live', ''])('refuses the unknown mode %j', (mode) => {
    expect(() => loadDeliveryConfig({ LOCALAPPDATA: LOCAL, OUTBOUND_MODE: mode })).toThrow(/OUTBOUND_MODE must be capture or smtp/);
  });

  it('ignores SMTP settings in capture mode, so no credential is held or rendered', () => {
    const config = loadDeliveryConfig({ ...SMTP_ENV, OUTBOUND_MODE: 'capture' });
    expect(config.outbound).toEqual({ mode: 'capture' });
    for (const text of renderings(config)) {
      expect(text).not.toContain(SMTP_PASSWORD);
      expect(text).not.toContain(SMTP_USER);
    }
  });

  it.each([undefined, 'false', '1', 'TRUE', 'yes'])(
    'refuses real SMTP sending unless the owner-only flag is exactly "true" (flag %j)',
    (flag) => {
      const env: NodeJS.ProcessEnv = { ...SMTP_ENV, PRODUCTION_SENDING_ENABLED: flag };
      expectRefusedWithoutSecrets(env, /OUTBOUND_MODE=smtp requires the owner-only PRODUCTION_SENDING_ENABLED=true/);
    },
  );
});

describe('SMTP settings', () => {
  it('reads SMTP settings from the environment and never renders the credentials', () => {
    const config = loadDeliveryConfig(SMTP_ENV);
    if (config.outbound.mode !== 'smtp') throw new Error('expected smtp mode');
    const { smtp } = config.outbound;
    expect({ host: smtp.host, port: smtp.port, security: smtp.security }).toEqual({ host: SMTP_HOST, port: 465, security: 'tls' });
    expect(smtp.auth?.user.reveal()).toBe(SMTP_USER);
    expect(smtp.auth?.password.reveal()).toBe(SMTP_PASSWORD);
    expect(config.senderAddress).toBe('timesheet@example.invalid');
    for (const text of [...renderings(config), ...renderings(smtp.auth?.password), `${String(smtp.auth?.password)}`]) {
      expect(text).not.toContain(SMTP_PASSWORD);
      expect(text).not.toContain(SMTP_USER);
    }
    expect(JSON.stringify(smtp.auth)).toBe('{"user":"[redacted]","password":"[redacted]"}');
  });

  it('defaults to STARTTLS on port 587 and allows no authentication', () => {
    const config = loadDeliveryConfig({ ...SMTP_ENV, SMTP_PORT: undefined, SMTP_SECURITY: undefined, SMTP_USER: undefined, SMTP_PASSWORD: undefined });
    if (config.outbound.mode !== 'smtp') throw new Error('expected smtp mode');
    expect(config.outbound.smtp).toEqual({ host: SMTP_HOST, port: 587, security: 'starttls', auth: null });
  });

  it.each([
    [{ SMTP_HOST: undefined }, /SMTP_HOST is required/],
    [{ SMTP_HOST: 'smtp.example.invalid\r\nRCPT' }, /SMTP_HOST must be a host name/],
    [{ SMTP_PORT: '0' }, /SMTP_PORT must be an integer from 1 to 65535/],
    [{ SMTP_PORT: SMTP_PASSWORD }, /SMTP_PORT must be an integer from 1 to 65535/],
    [{ SMTP_SECURITY: 'none' }, /SMTP_SECURITY must be starttls or tls/],
    [{ SMTP_SECURITY: SMTP_PASSWORD }, /SMTP_SECURITY must be starttls or tls/],
    [{ SMTP_PASSWORD: undefined }, /SMTP_USER and SMTP_PASSWORD must be set together/],
    [{ SMTP_USER: undefined }, /SMTP_USER and SMTP_PASSWORD must be set together/],
    [{ SMTP_USER: '' }, /SMTP_USER and SMTP_PASSWORD must be set together/],
  ] as Array<[NodeJS.ProcessEnv, RegExp]>)('refuses invalid SMTP settings %# without echoing a credential', (override, pattern) => {
    expectRefusedWithoutSecrets({ ...SMTP_ENV, ...override }, pattern);
  });

  it.each(['not-an-address', 'timesheet@example.invalid\r\nBcc: x@example.invalid', `${SMTP_PASSWORD}@`])(
    'refuses the sender address %#',
    (from) => {
      expectRefusedWithoutSecrets({ ...SMTP_ENV, MAIL_FROM: from }, /MAIL_FROM must be a single email address/);
    },
  );

  it('writes nothing to the console while loading, valid or invalid', () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => undefined),
    );
    loadDeliveryConfig(SMTP_ENV);
    errorOf(() => loadDeliveryConfig({ ...SMTP_ENV, SMTP_PORT: 'x' }));
    errorOf(() => loadDeliveryConfig({ ...SMTP_ENV, PRODUCTION_SENDING_ENABLED: undefined }));
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });
});

describe('SecretValue', () => {
  it('reveals only on request and renders as [redacted] everywhere else', () => {
    const secret = new SecretValue(SMTP_PASSWORD);
    expect(secret.reveal()).toBe(SMTP_PASSWORD);
    expect(`${String(secret)}`).toBe('[redacted]');
    expect(JSON.stringify({ secret })).toBe('{"secret":"[redacted]"}');
    expect(inspect({ secret }, { showHidden: true, depth: 5 })).not.toContain(SMTP_PASSWORD);
    expect(Object.keys(secret)).toEqual([]);
  });
});
