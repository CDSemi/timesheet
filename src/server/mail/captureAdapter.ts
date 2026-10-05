import { createHash, randomBytes } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, renameSync, rmdirSync, unlinkSync, writeSync } from 'node:fs';
import { join } from 'node:path';
import type { OutboundMessage } from './message.ts';
import type { OutboundAdapter, SendContext, SendOutcome } from './outbound.ts';

/*
 * Capture adapter (the default outbound mode; docs/07 dry-run/capture, WP3 common check 7).
 *
 * Writes the exact message bytes (`message.eml`), the attached PDF (`attachment.pdf`, the
 * stored bytes) and `metadata.json` (Message-ID, envelope, SHA-256 of both files; no
 * credential and no body text) to `<dataDir>/mail-capture/<attemptId>/`. A message without an
 * attachment (a reminder or notice) has no `attachment.pdf` and no PDF fields in its metadata.
 * The files are written and flushed in a temporary folder that is then renamed, so a capture
 * folder is either complete or absent. Nothing leaves the machine; the folder is private data (outside
 * Dropbox and the static root) and is never served over HTTP.
 */

export const CAPTURE_FOLDER = 'mail-capture';
const ATTEMPT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

function writeFlushed(path: string, bytes: Uint8Array): void {
  const fd = openSync(path, 'wx', 0o600);
  try {
    let written = 0;
    while (written < bytes.length) written += writeSync(fd, bytes, written, bytes.length - written);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function removeQuietly(folder: string, names: readonly string[]): void {
  for (const name of names) {
    try {
      unlinkSync(join(folder, name));
    } catch {
      // not written
    }
  }
  try {
    rmdirSync(folder);
  } catch {
    // not empty or already gone
  }
}

/** The capture folder of an attempt (for tests and the local operator). */
export function captureFolder(dataDir: string, attemptId: string): string {
  if (!ATTEMPT_ID.test(attemptId)) throw new Error('Invalid attempt id');
  return join(dataDir, CAPTURE_FOLDER, attemptId);
}

export function createCaptureAdapter(dataDir: string): OutboundAdapter {
  return {
    mode: 'capture',
    send(message: OutboundMessage, context: SendContext): Promise<SendOutcome> {
      if (!ATTEMPT_ID.test(context.attemptId)) {
        return Promise.resolve({ kind: 'failed_permanent', code: 'capture_invalid_attempt', providerResponse: null });
      }
      const target = captureFolder(dataDir, context.attemptId);
      // An attempt is sent at most once; an existing folder means it was captured before.
      if (existsSync(target)) return Promise.resolve({ kind: 'uncertain', code: 'capture_exists', providerResponse: null });
      const emlSha256 = sha256(message.raw);
      const hasPdf = message.pdf.length > 0;
      const metadata = {
        mode: 'capture',
        message_id: message.messageId,
        envelope: message.envelope,
        eml_sha256: emlSha256,
        eml_bytes: message.raw.length,
        ...(hasPdf ? { pdf_sha256: message.pdfSha256, pdf_bytes: message.pdf.length } : {}),
      };
      const files = ['message.eml', 'attachment.pdf', 'metadata.json'] as const;
      const temporary = join(dataDir, CAPTURE_FOLDER, `.tmp-${randomBytes(12).toString('hex')}`);
      try {
        mkdirSync(temporary, { recursive: true });
        writeFlushed(join(temporary, files[0]), message.raw);
        if (hasPdf) writeFlushed(join(temporary, files[1]), message.pdf);
        writeFlushed(join(temporary, files[2]), Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, 'utf8'));
        renameSync(temporary, target);
      } catch {
        removeQuietly(temporary, files);
        // Nothing was handed to anyone: a local write failure is definitely before transfer.
        return Promise.resolve({ kind: 'failed_temporary', code: 'capture_write_failed', providerResponse: null });
      }
      return Promise.resolve({ kind: 'accepted', providerMessageId: `capture-${emlSha256.slice(0, 32)}`, providerResponse: 'captured' });
    },
  };
}
