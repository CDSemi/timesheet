import type { OutboundConfig, OutboundMode } from '../types.ts';
import { createCaptureAdapter } from './captureAdapter.ts';
import type { OutboundMessage } from './message.ts';
import { createSmtpAdapter, type SmtpAdapterOptions } from './smtpAdapter.ts';

/*
 * Outbound mail boundary (docs/05 "Durable delivery", docs/07, WP3 common check 7).
 *
 * An adapter receives one fully built message (the exact bytes, the SMTP envelope and the
 * stable Message-ID) and reports one classified outcome; it never throws for a delivery
 * problem. The outcomes follow the docs/05 failure table:
 * - failed_temporary: definitely before the message transfer (connect, greeting, TLS start,
 *   envelope) or an explicit 4xx rejection; the send job retries through the job store;
 * - failed_permanent: an explicit 5xx rejection or a configuration error (authentication,
 *   TLS policy); visible intervention, never retried by itself;
 * - accepted: the server acknowledged the end of DATA (provider id when it gives one);
 * - uncertain: the connection was lost or timed out after the message transfer began, so the
 *   server may have accepted it; never retried automatically.
 *
 * Capture (the default) writes the message under the private data directory and touches no
 * network. SMTP exists only when the configuration carries it, which requires
 * OUTBOUND_MODE=smtp plus the owner-only PRODUCTION_SENDING_ENABLED flag (config.ts).
 * Provider responses are reduced to the numeric reply and enhanced status code; no
 * credential, recipient or message text is ever part of an outcome.
 */

export type SendOutcome =
  | { kind: 'accepted'; providerMessageId: string | null; providerResponse: string }
  | { kind: 'failed_temporary' | 'failed_permanent' | 'uncertain'; code: string; providerResponse: string | null };

export interface SendContext {
  /** The delivery attempt (opaque UUID); the capture adapter uses it as its folder name. */
  attemptId: string;
}

export interface OutboundAdapter {
  readonly mode: OutboundMode;
  send(message: OutboundMessage, context: SendContext): Promise<SendOutcome>;
}

export interface OutboundOptions {
  /** The private data directory; capture writes below it. */
  dataDir: string;
  /** Test seams of the SMTP adapter (a trusted test CA); production passes none. */
  smtp?: SmtpAdapterOptions;
}

/** The adapter for the configured outbound mode; capture unless the owner enabled real sending. */
export function createOutboundAdapter(config: OutboundConfig, options: OutboundOptions): OutboundAdapter {
  if (config.mode === 'smtp') return createSmtpAdapter(config.smtp, options.smtp);
  return createCaptureAdapter(options.dataDir);
}

const REPLY = /^([2-5][0-9]{2})(?:[ -]([2-5]\.[0-9]{1,3}\.[0-9]{1,3}))?/;

/** The numeric SMTP reply and enhanced status code only ("451 4.3.0"), or null. */
export function redactSmtpReply(response: unknown): string | null {
  if (typeof response !== 'string') return null;
  const match = REPLY.exec(response.trim());
  if (match === null) return null;
  return match[2] === undefined ? (match[1] ?? null) : `${match[1]} ${match[2]}`;
}
