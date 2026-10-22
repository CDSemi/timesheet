import { createHash, randomUUID } from 'node:crypto';
import MailComposer from 'nodemailer/lib/mail-composer';
import { canonicalize, sha256Hex } from '../../domain/canonical.ts';

/*
 * The submission e-mail of one delivery attempt (docs/03 "Atomicity and snapshots", docs/05
 * "Durable delivery": "send that exact file and the send's own email content").
 *
 * Everything comes from the immutable send record (WP5-UX5-T01b, owner decision F-4): its
 * recipients, subject and text/HTML bodies, chosen for that one send, and the stored PDF bytes of
 * its variant (whose hash the caller has re-checked). No template is rendered here and nothing of
 * the owner's current settings or of the revision snapshot's envelope is read. The Message-ID is the
 * attempt's stored, stable id and the MIME boundary is derived from it, so the same inputs give the
 * same bytes. The built bytes are what the capture adapter writes and what the SMTP adapter transfers.
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

/** The content of one send (a `revision_sends` row): what this copy says and to whom. */
export interface SendContent {
  sendId: string;
  to: readonly string[];
  cc: readonly string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface MessageSource {
  send: SendContent;
  /** The payroll date and revision number name the attachment. */
  payrollDate: string;
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

/** The digest of a send's two bodies, as frozen on its attempts. */
export function bodySha256(bodyText: string, bodyHtml: string): string {
  return sha256Hex(canonicalize({ body_text: bodyText, body_html: bodyHtml }));
}

/**
 * The frozen envelope stored on a delivery attempt: the send, its recipients and subject, a digest of
 * its bodies and the PDF hash.
 */
export function frozenEnvelope(revisionId: string, send: SendContent, pdfSha256: string) {
  return {
    revision_id: revisionId,
    send_id: send.sendId,
    to: [...send.to],
    cc: [...send.cc],
    subject: send.subject,
    body_sha256: bodySha256(send.bodyText, send.bodyHtml),
    attachment_sha256: pdfSha256,
  };
}

export type FrozenEnvelope = ReturnType<typeof frozenEnvelope>;

/** The PDF file name: the payroll date and the revision number only. */
export function attachmentFileName(payrollDate: string, revisionNo: number): string {
  return `timesheet-${payrollDate}-r${revisionNo}.pdf`;
}

/** Checks sender and recipients, then builds the exact message bytes. */
export async function buildMessage(source: MessageSource): Promise<OutboundMessage> {
  const { send } = source;
  const sender = source.senderAddress;
  if (sender === null || sender === '') throw new MessageError('sender_missing');
  if (!SINGLE_ADDRESS.test(sender)) throw new MessageError('sender_invalid');
  const to = [...send.to];
  const cc = [...send.cc];
  if (to.length === 0) throw new MessageError('recipient_missing');
  for (const address of [...to, ...cc]) if (!SINGLE_ADDRESS.test(address)) throw new MessageError('recipient_invalid');
  if (!MESSAGE_ID.test(source.messageId)) throw new MessageError('message_id_invalid');

  const pdf = Buffer.from(source.pdf);
  const pdfSha256 = createHash('sha256').update(pdf).digest('hex');
  const composer = new MailComposer({
    from: sender,
    to,
    ...(cc.length === 0 ? {} : { cc }),
    subject: send.subject,
    messageId: source.messageId,
    date: source.date,
    text: send.bodyText,
    ...(send.bodyHtml === '' ? {} : { html: send.bodyHtml }),
    attachments: [{ filename: attachmentFileName(source.payrollDate, source.revisionNo), content: pdf, contentType: 'application/pdf' }],
    baseBoundary: createHash('sha256').update(source.messageId).digest('hex').slice(0, 24),
    xMailer: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    newline: '\r\n',
  });
  const raw = await composer.compile().build();
  return { messageId: source.messageId, envelope: { from: sender, to: [...to, ...cc] }, raw, pdf, pdfSha256 };
}
