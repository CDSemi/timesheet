import { createHash, randomUUID } from 'node:crypto';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { ImageRejection, inspectImage } from '../files/imageCheck.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { authorizeAutoImageInTransaction, type SubmissionSettings } from './submissionSettings.ts';

/*
 * Profile signature images (docs/04 signature image; AC-01, rule 4: private).
 *
 * The image bytes live only in the private file store; the database holds an immutable
 * attachment row (opaque key, hash, type, size, pixel size). Replacing the profile
 * signature appends a new attachment: earlier attachments keep their bytes and hash
 * because later revisions and authorizations reference them. The current signature is
 * the owner's latest `signature` attachment. Every lookup is scoped to the caller, so
 * another user's id is indistinguishable from a missing one.
 *
 * The upload can also carry the user's explicit consent to use that image on automatic
 * submissions (owner decision G-Q1 (b)): the same audited authorization as in the settings,
 * performed in the same transaction, so an upload whose authorization fails stores nothing.
 * Without that consent nothing is authorized (the schema default is unchanged).
 */

/** Immutable rows cannot be deleted, so the number of uploads per user is bounded. */
export const MAX_SIGNATURES_PER_USER = 50;

export interface SignatureMetadata {
  id: string;
  mime_type: string;
  size_bytes: number;
  width_px: number;
  height_px: number;
  sha256: string;
  created_at: string;
}

interface SignatureRow {
  id: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  width_px: number;
  height_px: number;
  sha256: string;
  created_at: string;
}

const COLUMNS = 'id, storage_key, mime_type, size_bytes, width_px, height_px, sha256, created_at';

function toMetadata(row: SignatureRow): SignatureMetadata {
  return {
    id: row.id,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    width_px: row.width_px,
    height_px: row.height_px,
    sha256: row.sha256,
    created_at: row.created_at,
  };
}

function latest(db: Db, userId: string): SignatureRow | undefined {
  return db
    .prepare<[string], SignatureRow>(
      `SELECT ${COLUMNS} FROM attachments WHERE user_id = ? AND kind = 'signature'
        ORDER BY created_at DESC, rowid DESC LIMIT 1`,
    )
    .get(userId);
}

/** Verifies and stores a signature image for `userId`; the audit event carries metadata only. */
export function saveSignature(
  db: Db,
  clock: Clock,
  files: FileStore,
  userId: string,
  bytes: Uint8Array,
  declaredMime: string,
): SignatureMetadata {
  return store(db, clock, files, userId, bytes, declaredMime, null).signature;
}

/**
 * Stores the image and, in the same transaction, records the explicit audited authorization to
 * use it on automatic submissions. Saved submission settings must exist (422
 * `submission_settings_required`); any failure leaves no attachment, no audit event and no file.
 */
export function saveSignatureAndAuthorizeAutoImage(
  db: Db,
  clock: Clock,
  files: FileStore,
  userId: string,
  bytes: Uint8Array,
  declaredMime: string,
): { signature: SignatureMetadata; settings: SubmissionSettings } {
  const stored = store(db, clock, files, userId, bytes, declaredMime, (attachmentId) =>
    authorizeAutoImageInTransaction(db, clock, userId, attachmentId),
  );
  if (stored.within === null) throw new Error('The automatic image authorization was not recorded');
  return { signature: stored.signature, settings: stored.within };
}

function store<T>(
  db: Db,
  clock: Clock,
  files: FileStore,
  userId: string,
  bytes: Uint8Array,
  declaredMime: string,
  within: ((attachmentId: string) => T) | null,
): { signature: SignatureMetadata; within: T | null } {
  let info;
  try {
    info = inspectImage(bytes, declaredMime);
  } catch (error) {
    if (error instanceof ImageRejection) {
      throw new ApiError(error.code === 'unsupported_media_type' ? 415 : 422, error.code, error.message);
    }
    throw error;
  }
  const existing = db
    .prepare<[string], { total: number }>("SELECT count(*) AS total FROM attachments WHERE user_id = ? AND kind = 'signature'")
    .get(userId);
  if ((existing?.total ?? 0) >= MAX_SIGNATURES_PER_USER) {
    throw new ApiError(422, 'signature_limit_reached', 'The maximum number of stored signature images has been reached');
  }

  // The file is written before the transaction (no file I/O while holding the write lock
  // longer than needed); a failed transaction removes it again, and the orphan sweep
  // covers a crash in between.
  const stored = files.put(bytes);
  const id = randomUUID();
  try {
    return writeTransaction(db, () => {
      const previous = latest(db, userId);
      const createdAt = nowUtc(clock);
      db.prepare(
        `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
         VALUES (?, ?, 'signature', ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, userId, stored.storageKey, stored.sha256, info.mime, stored.sizeBytes, info.width, info.height, createdAt);
      recordAudit(db, clock, {
        actorUserId: userId,
        ownerUserId: userId,
        operation: 'signature.upload',
        entityType: 'attachment',
        entityId: id,
        // Metadata only: no image bytes, no storage key, no name.
        after: {
          attachment_id: id,
          mime_type: info.mime,
          size_bytes: stored.sizeBytes,
          width_px: info.width,
          height_px: info.height,
          sha256: stored.sha256,
          replaces_attachment_id: previous?.id ?? null,
        },
      });
      const signature = toMetadata({
        id,
        storage_key: stored.storageKey,
        mime_type: info.mime,
        size_bytes: stored.sizeBytes,
        width_px: info.width,
        height_px: info.height,
        sha256: stored.sha256,
        created_at: createdAt,
      });
      return { signature, within: within === null ? null : within(id) };
    });
  } catch (error) {
    files.discard(stored.storageKey);
    throw error;
  }
}

/** Metadata of the caller's current signature, or null when none was uploaded. */
export function currentSignature(db: Db, userId: string): SignatureMetadata | null {
  const row = latest(db, userId);
  return row === undefined ? null : toMetadata(row);
}

export interface SignatureFile {
  mimeType: string;
  sha256: string;
  bytes: Buffer;
}

/**
 * The caller's own signature image. Another user's id, a non-signature attachment and an
 * unknown id are all "not found"; stored bytes that no longer match the recorded hash are
 * never returned.
 */
export function readSignature(db: Db, files: FileStore, userId: string, id: string): SignatureFile {
  const row = db
    .prepare<[string, string], SignatureRow>(`SELECT ${COLUMNS} FROM attachments WHERE id = ? AND user_id = ? AND kind = 'signature'`)
    .get(id, userId);
  if (row === undefined) throw notFound('Signature');
  let bytes: Buffer;
  try {
    bytes = files.read(row.storage_key);
  } catch {
    throw new ApiError(500, 'internal_error', 'Internal server error');
  }
  if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) {
    throw new ApiError(500, 'internal_error', 'Internal server error');
  }
  return { mimeType: row.mime_type, sha256: row.sha256, bytes };
}
