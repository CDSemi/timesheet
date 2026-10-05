import { createHash, randomUUID } from 'node:crypto';
import MailComposer from 'nodemailer/lib/mail-composer';
import { canonicalize, sha256Hex } from '../../domain/canonical.ts';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';

/*
 * The submission e-mail of one delivery attempt (docs/03 "Atomicity and snapshots", docs/05
 * "Manual path": "send that exact file and frozen email content").
 *
 * Everything comes from the immutable revision: recipients, the rendered subject and the
 * rendered text/HTML bodies of the frozen snapshot, and the stored PDF bytes (whose hash the
 * caller has re-checked). No template is rendered here and nothing of the owner's current
 * settings is read. The Message-ID is the attempt's stored, stable id and the MIME boundary
 * is derived from it, so the same inputs give the same bytes. The built bytes are what the
 * capture adapter writes and what the SMTP adapter transfers.
 */

export const MESSAGE_ID_DOMAIN = 'timesheet.invalid';

// One address: a local part and a dotted domain, no spaces, brackets, commas or line breaks.
const SINGLE_ADDRESS = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/;
const MESSAGE_ID = /^<[A-Za-z0-9._-]{1,200}@[A-Za-z0-9.-]{1,80}>$/;

/** A message that cannot be built; `code` is a fixed, non-personal identifier. */
export class MessageError extends Error {
  readonly code: 'sender_missing' | 'sender_invalid' | 'recipient_missing' | 'recipient_invalid' | 'message_id_invalid';

  constructor(code: MessageError['code']) {
    super(code);
    this.name = 'MessageError';
    this.code = code;
  }
}

export interface OutboundMessage {
  messageId: string;
  /** SMTP envelope: the sender and every To and Cc recipient. */
  envelope: { from: string; to: string[] };
  /** The exact RFC 5322 bytes (CRLF line endings). */
  raw: Buffer;
  /** The attached PDF (the stored bytes) and its SHA-256. */
  pdf: Uint8Array;
  pdfSha256: string;
}

export interface MessageSource {
  snapshot: ReviewSnapshot;
  revisionNo: number;
  senderAddress: string | null;
  messageId: string;
  /** The Date header (the attempt's send instant from the injected clock). */
  date: Date;
  pdf: Uint8Array;
}

/** A fresh stable Message-ID for a new attempt (opaque; no user or host name). */
export function newMessageId(): string {
  return `<${randomUUID()}@${MESSAGE_ID_DOMAIN}>`;
}

/**
 * The frozen envelope stored on a delivery attempt: recipients, subject, template version, a
 * digest of the bodies and the PDF hash. Same shape as the T06 resend envelope.
 */
export function frozenEnvelope(revisionId: string, snapshot: ReviewSnapshot, pdfSha256: string) {
  const frozen = snapshot.recipients;
  return {
    revision_id: revisionId,
    to: frozen.to,
    cc: frozen.cc,
    subject: frozen.subject,
    template_version: frozen.template_version,
    body_sha256: sha256Hex(canonicalize({ body_text: frozen.body_text, body_html: frozen.body_html })),
    attachment_sha256: pdfSha256,
  };
}

export type FrozenEnvelope = ReturnType<typeof frozenEnvelope>;

/** The PDF file name: the payroll date and the revision number only. */
export function attachmentFileName(snapshot: ReviewSnapshot, revisionNo: number): string {
  return `timesheet-${snapshot.period.payroll_date}-r${revisionNo}.pdf`;
}

/** Checks sender and recipients, then builds the exact message bytes. */
export async function buildMessage(source: MessageSource): Promise<OutboundMessage> {
  const { snapshot } = source;
  const sender = source.senderAddress;
  if (sender === null || sender === '') throw new MessageError('sender_missing');
  if (!SINGLE_ADDRESS.test(sender)) throw new MessageError('sender_invalid');
  const { to, cc } = snapshot.recipients;
  if (to.length === 0) throw new MessageError('recipient_missing');
  for (const address of [...to, ...cc]) if (!SINGLE_ADDRESS.test(address)) throw new MessageError('recipient_invalid');
  if (!MESSAGE_ID.test(source.messageId)) throw new MessageError('message_id_invalid');

  const pdf = Buffer.from(source.pdf);
  const pdfSha256 = createHash('sha256').update(pdf).digest('hex');
  const composer = new MailComposer({
    from: sender,
    to: [...to],
    ...(cc.length === 0 ? {} : { cc: [...cc] }),
    subject: snapshot.recipients.subject,
    messageId: source.messageId,
    date: source.date,
    text: snapshot.recipients.body_text,
    ...(snapshot.recipients.body_html === '' ? {} : { html: snapshot.recipients.body_html }),
    attachments: [{ filename: attachmentFileName(snapshot, source.revisionNo), content: pdf, contentType: 'application/pdf' }],
    baseBoundary: createHash('sha256').update(source.messageId).digest('hex').slice(0, 24),
    xMailer: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    newline: '\r\n',
  });
  const raw = await composer.compile().build();
  return { messageId: source.messageId, envelope: { from: sender, to: [...to, ...cc] }, raw, pdf, pdfSha256 };
}
