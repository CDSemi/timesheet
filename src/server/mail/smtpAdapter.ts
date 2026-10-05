import { Readable } from 'node:stream';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import type { SmtpSettings } from '../types.ts';
import type { OutboundMessage } from './message.ts';
import { type OutboundAdapter, redactSmtpReply, type SendContext, type SendOutcome } from './outbound.ts';

/*
 * SMTP adapter (real sending; only reachable when the owner set OUTBOUND_MODE=smtp and
 * PRODUCTION_SENDING_ENABLED=true, see config.ts). One connection per message, TLS always
 * (STARTTLS required, or implicit TLS), certificates verified, no debug or transaction log.
 *
 * The outcome classification needs to know whether the message transfer began. nodemailer's
 * SMTPConnection pipes the message stream only after the server answered DATA with 354, so the
 * first read of the message stream marks "transfer started". A lost connection or a timeout
 * before that point is a pre-transfer failure (temporary); after it, the server may have
 * accepted the message and the outcome is uncertain. An explicit reply decides by its class
 * (4xx temporary, 5xx permanent). Authentication and TLS failures are permanent configuration
 * errors. Credentials are revealed only into the login call; errors are reduced to fixed codes
 * and the numeric reply, never their message (which can echo addresses or server text).
 */

export interface SmtpAdapterOptions {
  /** Extra trusted CA certificate (PEM) for a loopback test sink; production uses the system store. */
  trustedCa?: string;
  /** Socket inactivity timeout in milliseconds (default 60 s, below the 120 s job lease). */
  socketTimeoutMs?: number;
}

type Stage = 'connect' | 'auth' | 'envelope' | 'transfer';

interface SmtpFailure {
  code?: unknown;
  responseCode?: unknown;
  response?: unknown;
}

const LOST = new Set(['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EPROTOCOL', 'ESTREAM']);

/** Maps a failure at a stage to an outcome; exported for unit tests of the table. */
export function classifySmtpFailure(error: unknown, stage: Stage): SendOutcome {
  const failure: SmtpFailure = typeof error === 'object' && error !== null ? (error as SmtpFailure) : {};
  const code = typeof failure.code === 'string' ? failure.code : '';
  const reply = redactSmtpReply(failure.response);
  const responseCode = typeof failure.responseCode === 'number' ? failure.responseCode : null;
  if (code === 'EAUTH' || code === 'ENOAUTH') return { kind: 'failed_permanent', code: 'smtp_auth_failed', providerResponse: reply };
  if (code === 'ETLS' || code === 'EREQUIRETLS') return { kind: 'failed_permanent', code: 'smtp_tls_failed', providerResponse: reply };
  if (code === 'ECONFIG') return { kind: 'failed_permanent', code: 'smtp_config_invalid', providerResponse: reply };
  if (responseCode !== null && responseCode >= 400 && responseCode < 600) {
    const temporary = responseCode < 500;
    const after = stage === 'transfer';
    return {
      kind: temporary ? 'failed_temporary' : 'failed_permanent',
      code: `smtp_${after ? 'message' : 'envelope'}_rejected_${temporary ? 'temporary' : 'permanent'}`,
      providerResponse: reply,
    };
  }
  if (stage === 'transfer' && (LOST.has(code) || code === '')) {
    return { kind: 'uncertain', code: code === 'ETIMEDOUT' ? 'smtp_timeout_after_data' : 'smtp_connection_lost_after_data', providerResponse: reply };
  }
  if (code === 'EENVELOPE' || code === 'EMESSAGE') return { kind: 'failed_permanent', code: 'smtp_envelope_invalid', providerResponse: reply };
  return { kind: 'failed_temporary', code: code === 'ETIMEDOUT' ? 'smtp_timeout_before_data' : 'smtp_unavailable', providerResponse: reply };
}

const QUEUE_ID = /\b(?:queued as|id=)\s*([A-Za-z0-9._-]{1,100})/i;

function senderDomain(address: string): string {
  const domain = address.slice(address.lastIndexOf('@') + 1);
  return /^[A-Za-z0-9.-]{1,253}$/.test(domain) ? domain : 'localhost';
}

export function createSmtpAdapter(settings: SmtpSettings, options: SmtpAdapterOptions = {}): OutboundAdapter {
  const socketTimeout = options.socketTimeoutMs ?? 60_000;
  return {
    mode: 'smtp',
    send(message: OutboundMessage, _context: SendContext): Promise<SendOutcome> {
      return new Promise<SendOutcome>((resolve) => {
        let stage: Stage = 'connect';
        let settled = false;
        const connection = new SMTPConnection({
          host: settings.host,
          port: settings.port,
          secure: settings.security === 'tls',
          requireTLS: settings.security === 'starttls',
          name: senderDomain(message.envelope.from),
          connectionTimeout: 30_000,
          greetingTimeout: 30_000,
          socketTimeout,
          logger: false,
          debug: false,
          transactionLog: false,
          tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true, ...(options.trustedCa === undefined ? {} : { ca: options.trustedCa }) },
        });
        const finish = (outcome: SendOutcome): void => {
          if (settled) return;
          settled = true;
          if (outcome.kind === 'accepted') connection.quit();
          else connection.close();
          resolve(outcome);
        };
        // Errors also reach the pending callback; the listener keeps an emitted error from throwing.
        connection.on('error', (error: unknown) => finish(classifySmtpFailure(error, stage)));

        const transfer = (): void => {
          stage = 'envelope';
          let pushed = false;
          // Read only after the server accepted DATA (354): the transfer has begun from then on.
          const body = new Readable({
            read() {
              stage = 'transfer';
              if (pushed) return;
              pushed = true;
              this.push(message.raw);
              this.push(null);
            },
          });
          connection.send(message.envelope, body, (error, info) => {
            if (error) {
              finish(classifySmtpFailure(error, stage));
              return;
            }
            const response = typeof info.response === 'string' ? info.response : '';
            const reply = redactSmtpReply(response) ?? '250';
            const rejected = Array.isArray(info.rejected) ? info.rejected.length : 0;
            finish({
              kind: 'accepted',
              providerMessageId: QUEUE_ID.exec(response)?.[1] ?? null,
              providerResponse: rejected === 0 ? reply : `${reply} rejected=${rejected}`,
            });
          });
        };

        connection.connect((error) => {
          if (error) {
            finish(classifySmtpFailure(error, stage));
            return;
          }
          if (settings.auth === null) {
            transfer();
            return;
          }
          stage = 'auth';
          connection.login({ user: settings.auth.user.reveal(), pass: settings.auth.password.reveal() }, (loginError) => {
            if (loginError) {
              finish(classifySmtpFailure(loginError, stage));
              return;
            }
            transfer();
          });
        });
      });
    },
  };
}
