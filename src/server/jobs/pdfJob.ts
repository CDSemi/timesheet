import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { sha256Hex } from '../../domain/canonical.ts';
import type { ReviewSnapshot } from '../../domain/snapshot.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import type { FileStore } from '../files/fileStore.ts';
import { type PdfOrigin, renderTimesheetPdf, type TimesheetPdfInput } from '../pdf/timesheetPdf.ts';
import { JOB_RENDER_PDF } from '../services/finalization.ts';
import { JobError, redactJobError } from './jobStore.ts';
import type { JobHandler } from './runner.ts';

/*
 * The PDF job (docs/03 "Atomicity and snapshots", docs/05 "PDF before send", AC-10).
 *
 * It renders only from the immutable revision: the stored canonical payload (its SHA-256 is
 * re-checked), the revision number, the real sign-off instant and stored signer name of a signed
 * revision (or the creation instant of an automatic one and the employee name of its snapshot)
 * and the signature image named by the snapshot, read from the private file store by attachment
 * id and verified against the reviewed hash. Nothing of the owner's current data is read, and nothing
 * is posted to the ledger or sent.
 *
 * Steps: the revision file row becomes `pending` (a `failed` one returns to `pending`); the
 * PDF is rendered; the bytes go to a temporary file in the store's `tmp/` folder, are flushed and
 * renamed to their final key; then one transaction inserts the immutable PDF attachment and marks
 * the revision file `ready`. The key is derived from the revision id and the PDF hash, so a runner
 * killed after the rename and resumed later renders the same bytes to the same key and leaves one
 * file (the renderer is deterministic). A failure marks the row `failed` with a redacted code and
 * the job store retries the same snapshot; an integrity mismatch is permanent.
 */

export { JOB_RENDER_PDF };

/** Test seams around the file write (crash injection); production passes none. */
export interface PdfJobHooks {
  beforeWrite?: () => void;
  beforeRename?: (temporaryPath: string) => void;
  afterRename?: () => void;
}

export interface PdfJobDeps {
  db: Db;
  clock: Clock;
  files: FileStore;
  /** The T07 renderer; injectable for failure tests. */
  render?: (input: TimesheetPdfInput) => Promise<Uint8Array>;
  hooks?: PdfJobHooks;
}

interface RevisionRow {
  id: string;
  user_id: string;
  revision_no: number;
  payload_json: string;
  payload_sha256: string;
  created_at: string;
}

interface SignoffRow {
  signer_name: string;
  signed_at: string;
  signature_attachment_id: string;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** Opaque, deterministic storage key of a revision's PDF (no id is readable from it). */
export function pdfStorageKey(revisionId: string, pdfSha256: string): string {
  return createHash('sha256').update(`timesheet-revision-pdf\n${revisionId}\n${pdfSha256}`).digest('base64url');
}

function loadSnapshot(revision: RevisionRow): ReviewSnapshot {
  if (sha256Hex(revision.payload_json) !== revision.payload_sha256) throw new JobError('snapshot_hash_mismatch', { permanent: true });
  try {
    return JSON.parse(revision.payload_json) as ReviewSnapshot;
  } catch (error) {
    throw new JobError('snapshot_invalid', { permanent: true, cause: error });
  }
}

/** The signature image bytes by attachment id, verified against the expected hash. */
function readSignature(db: Db, files: FileStore, userId: string, attachmentId: string, expectedSha256: string | null): Uint8Array {
  const row = db
    .prepare<[string, string], { storage_key: string; sha256: string }>(
      "SELECT storage_key, sha256 FROM attachments WHERE id = ? AND user_id = ? AND kind = 'signature'",
    )
    .get(attachmentId, userId);
  if (row === undefined) throw new JobError('signature_missing', { permanent: true });
  if (expectedSha256 !== null && row.sha256 !== expectedSha256) throw new JobError('signature_hash_mismatch', { permanent: true });
  let bytes: Buffer;
  try {
    bytes = files.read(row.storage_key);
  } catch (error) {
    throw new JobError('signature_unreadable', { cause: error });
  }
  if (sha256(bytes) !== row.sha256) throw new JobError('signature_hash_mismatch', { permanent: true });
  return bytes;
}

interface SignatureInput {
  origin: PdfOrigin;
  signedAt: string | null;
  automaticSubmittedAt: string | null;
  signerName: string;
  signatureImage: Uint8Array | null;
}

/** Origin, instants, printed name and image of the revision, all from archived records. */
function signatureInput(db: Db, files: FileStore, revision: RevisionRow, snapshot: ReviewSnapshot): SignatureInput {
  const signoff = db
    .prepare<[string, string], SignoffRow>(
      'SELECT signer_name, signed_at, signature_attachment_id FROM signoffs WHERE revision_id = ? AND user_id = ?',
    )
    .get(revision.id, revision.user_id);
  if (signoff !== undefined) {
    const reviewed = snapshot.signature;
    if (reviewed === null || reviewed.attachment_id !== signoff.signature_attachment_id) {
      throw new JobError('signature_reference_mismatch', { permanent: true });
    }
    const image = readSignature(db, files, revision.user_id, reviewed.attachment_id, reviewed.sha256);
    // The name the employee signed with (the stored sign-off), not necessarily the profile name.
    return { origin: 'manual', signedAt: signoff.signed_at, automaticSubmittedAt: null, signerName: signoff.signer_name, signatureImage: image };
  }
  // No sign-off row: an automatic revision. Its printed date is its own creation instant; signed_at stays empty.
  const auto = snapshot.auto_image;
  const image = auto.authorized && auto.attachment_id !== null ? readSignature(db, files, revision.user_id, auto.attachment_id, null) : null;
  return {
    origin: 'automatic',
    signedAt: null,
    automaticSubmittedAt: revision.created_at,
    signerName: snapshot.employee.name,
    signatureImage: image,
  };
}

/** Temporary file plus fsync plus atomic rename into the store; an identical finished file is kept. */
function writeAtomically(files: FileStore, storageKey: string, bytes: Uint8Array, hooks: PdfJobHooks): void {
  const target = files.pathOf(storageKey);
  if (existsSync(target) && sha256(readFileSync(target)) === sha256(bytes)) return; // finished before a crash
  const tempDir = join(files.root, 'tmp');
  mkdirSync(tempDir, { recursive: true });
  mkdirSync(dirname(target), { recursive: true });
  // Same folder and suffix as the file store's temporary files, so its orphan sweep covers them.
  const temporaryPath = join(tempDir, `${randomBytes(12).toString('hex')}.tmp`);
  const fd = openSync(temporaryPath, 'wx', 0o600);
  try {
    let written = 0;
    while (written < bytes.length) written += writeSync(fd, bytes, written, bytes.length - written);
    fsyncSync(fd);
  } catch (error) {
    closeSync(fd);
    removeQuietly(temporaryPath);
    throw error;
  }
  closeSync(fd);
  hooks.beforeRename?.(temporaryPath);
  try {
    renameSync(temporaryPath, target);
  } catch (error) {
    removeQuietly(temporaryPath);
    throw error;
  }
  hooks.afterRename?.();
}

function removeQuietly(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // already gone; the orphan sweep removes leftovers
  }
}

function fileState(db: Db, revision: RevisionRow): string | undefined {
  return db
    .prepare<[string, string], { state: string }>("SELECT state FROM revision_files WHERE revision_id = ? AND user_id = ? AND kind = 'pdf'")
    .get(revision.id, revision.user_id)?.state;
}

/** pending (new), failed -> pending; a ready file stays as it is. */
function markPending(db: Db, clock: Clock, revision: RevisionRow): void {
  writeTransaction(db, () => {
    const now = nowUtc(clock);
    db.prepare(
      `INSERT INTO revision_files (id, user_id, revision_id, kind, state, attachment_id, last_error, created_at, updated_at)
       VALUES (?, ?, ?, 'pdf', 'pending', NULL, NULL, ?, ?)
       ON CONFLICT (revision_id, kind) DO NOTHING`,
    ).run(randomUUID(), revision.user_id, revision.id, now, now);
    db.prepare(
      `UPDATE revision_files SET state = 'pending', updated_at = ?
        WHERE revision_id = ? AND user_id = ? AND kind = 'pdf' AND state = 'failed'`,
    ).run(now, revision.id, revision.user_id);
  });
}

function markFailed(db: Db, clock: Clock, revision: RevisionRow, code: string): void {
  db.prepare(
    `UPDATE revision_files SET state = 'failed', last_error = ?, updated_at = ?
      WHERE revision_id = ? AND user_id = ? AND kind = 'pdf' AND state = 'pending'`,
  ).run(code, nowUtc(clock), revision.id, revision.user_id);
}

/** The immutable PDF attachment and the ready revision file, in one transaction. */
function recordReady(db: Db, clock: Clock, revision: RevisionRow, storageKey: string, bytes: Uint8Array, pdfSha256: string): void {
  writeTransaction(db, () => {
    if (fileState(db, revision) === 'ready') return; // another runner finished the same snapshot
    const now = nowUtc(clock);
    const attachmentId = randomUUID();
    db.prepare(
      `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
       VALUES (?, ?, 'pdf', ?, ?, 'application/pdf', ?, NULL, NULL, ?)`,
    ).run(attachmentId, revision.user_id, storageKey, pdfSha256, bytes.length, now);
    db.prepare(
      `UPDATE revision_files SET state = 'ready', attachment_id = ?, last_error = NULL, updated_at = ?
        WHERE revision_id = ? AND user_id = ? AND kind = 'pdf'`,
    ).run(attachmentId, now, revision.id, revision.user_id);
  });
}

export function createPdfJobHandler(deps: PdfJobDeps): JobHandler {
  const { db, clock, files } = deps;
  const render = deps.render ?? renderTimesheetPdf;
  const hooks = deps.hooks ?? {};
  return async ({ job }) => {
    const { revisionId, userId } = job;
    if (revisionId === null || userId === null || job.payload.revision_id !== revisionId) {
      throw new JobError('invalid_job_payload', { permanent: true });
    }
    const revision = db
      .prepare<[string, string], RevisionRow>(
        'SELECT id, user_id, revision_no, payload_json, payload_sha256, created_at FROM timesheet_revisions WHERE id = ? AND user_id = ?',
      )
      .get(revisionId, userId);
    if (revision === undefined) throw new JobError('revision_not_found', { permanent: true });
    if (fileState(db, revision) === 'ready') return; // done before; nothing to write

    markPending(db, clock, revision);
    try {
      const snapshot = loadSnapshot(revision);
      const signature = signatureInput(db, files, revision, snapshot);
      let bytes: Uint8Array;
      try {
        bytes = await render({ snapshot, submissionId: snapshot.submission.id, revisionNo: revision.revision_no, ...signature });
      } catch (error) {
        throw new JobError('render_failed', { cause: error });
      }
      const pdfSha256 = sha256(bytes);
      const storageKey = pdfStorageKey(revision.id, pdfSha256);
      hooks.beforeWrite?.();
      try {
        writeAtomically(files, storageKey, bytes, hooks);
      } catch (error) {
        throw new JobError('pdf_write_failed', { cause: error });
      }
      recordReady(db, clock, revision, storageKey, bytes, pdfSha256);
    } catch (error) {
      markFailed(db, clock, revision, redactJobError(error));
      throw error;
    }
  };
}
