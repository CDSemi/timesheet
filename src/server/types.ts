import type { LoginRateLimiter } from './auth/rateLimit.ts';
import type { SessionUser } from './auth/sessions.ts';
import type { Clock } from './clock.ts';
import type { AppConfig } from './config.ts';
import type { Db } from './db/database.ts';

export interface AppDeps {
  db: Db;
  clock: Clock;
  config: AppConfig;
  loginLimiter: LoginRateLimiter;
  /** Built client assets (dist/client); null serves the API only. */
  staticDir: string | null;
  /**
   * The delivery configuration the process started with (`loadDeliveryConfig`), so a service never
   * reads the environment. Absent in tests that exercise no delivery setup; the admin status then
   * reports the setup as unknown.
   */
  delivery?: DeliveryConfig;
}

/**
 * Per-request principals. `user` is the signed-in session user. `actor` is who performs the action
 * (audit attribution) and `subject` is whose timesheet it concerns (the owner of every row read or
 * written). On the personal routes the access guard sets all three to the session user. Under
 * /api/shared/:ownerId (`requireShare`) `user` and `actor` are the grantee and `subject` is the
 * owner named in the path, whose share was checked live. Personal routers read the owner from
 * `subject` and never from `user`. `viaShareId` is the id of that share and is set by `requireShare`
 * alone, so a write records "through a share" in its audit event (WP4-T02); it is absent on every
 * personal route.
 */
export interface AppEnv {
  Variables: {
    user: SessionUser;
    actor: SessionUser;
    subject: SessionUser;
    viaShareId?: string;
  };
}

/** How outbound mail leaves the process: written to the private capture folder, or real SMTP. */
export type OutboundMode = 'capture' | 'smtp';

/** SMTP transport security; plaintext SMTP is not offered. */
export type SmtpSecurity = 'starttls' | 'tls';

/** A value that is only readable through `reveal()` and renders as `[redacted]` elsewhere. */
export interface RedactedText {
  reveal(): string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  security: SmtpSecurity;
  /** Credentials read from the environment only; never persisted, logged or echoed. */
  auth: { user: RedactedText; password: RedactedText } | null;
}

/** Real SMTP is present only when the owner-only sending flag was set (docs/07, docs/08). */
export type OutboundConfig = { mode: 'capture' } | { mode: 'smtp'; smtp: SmtpSettings };

/** Submission, file-store and delivery settings (WP3). */
export interface DeliveryConfig {
  /** Private directory for signatures, PDFs and captured mail; outside Dropbox and the static root. */
  dataDir: string;
  /** Origin plus optional path prefix for login-required deep links, without a trailing slash. */
  publicBaseUrl: string;
  /** Sender address, or null when unset (delivery then blocks with a visible fault). */
  senderAddress: string | null;
  outbound: OutboundConfig;
}
