import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync,
} from 'node:fs';
import { join } from 'node:path';

/*
 * Private file store (docs/03: attachments, atomic rename, hosting boundary).
 *
 * Layout under the private data directory: `files/<key>` holds finished objects and
 * `tmp/<random>.tmp` holds writes in progress, on the same volume so the final rename is
 * atomic. A file only becomes visible under its key once all bytes are on disk. Keys are
 * opaque random tokens: no user-supplied name, type or id ever reaches a path. Nothing in
 * this module is served over HTTP; callers read bytes after their own ownership check.
 */

/** The same alphabet and length the attachments.storage_key column enforces. */
const KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
const TEMP_SUFFIX = '.tmp';

export interface StoredFile {
  storageKey: string;
  sha256: string;
  sizeBytes: number;
}

export interface SweepOptions {
  /** True when an attachments row points at the storage key; such files are never removed. */
  isReferenced: (storageKey: string) => boolean;
  /** Only files last modified at least this long ago are removed (grace for in-flight writes). */
  minAgeMs: number;
  now?: Date;
}

export interface SweepResult {
  removedTemporary: number;
  removedUnreferenced: number;
  keptReferenced: number;
}

export interface FileStoreHooks {
  /** Test seam: runs after the temporary file is complete and before the atomic rename. */
  beforeRename?: (temporaryPath: string) => void;
}

export const isStorageKey = (value: string): boolean => KEY_PATTERN.test(value);

export class FileStore {
  readonly #root: string;
  readonly #hooks: FileStoreHooks;

  constructor(root: string, hooks: FileStoreHooks = {}) {
    this.#root = root;
    this.#hooks = hooks;
  }

  get root(): string {
    return this.#root;
  }

  #filesDir(): string {
    return join(this.#root, 'files');
  }

  #tempDir(): string {
    return join(this.#root, 'tmp');
  }

  /** Writes `bytes` to a temporary file, flushes it, then renames it to a fresh opaque key. */
  put(bytes: Uint8Array): StoredFile {
    mkdirSync(this.#filesDir(), { recursive: true });
    mkdirSync(this.#tempDir(), { recursive: true });
    const storageKey = randomBytes(24).toString('base64url');
    const temporaryPath = join(this.#tempDir(), `${randomBytes(12).toString('hex')}${TEMP_SUFFIX}`);
    try {
      const fd = openSync(temporaryPath, 'wx', 0o600);
      try {
        let written = 0;
        while (written < bytes.length) written += writeSync(fd, bytes, written, bytes.length - written);
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      this.#hooks.beforeRename?.(temporaryPath);
      renameSync(temporaryPath, this.pathOf(storageKey));
    } catch (error) {
      removeQuietly(temporaryPath);
      throw error;
    }
    return { storageKey, sha256: createHash('sha256').update(bytes).digest('hex'), sizeBytes: bytes.length };
  }

  /** Reads an object by key; a malformed key is refused before any path is built. */
  read(storageKey: string): Buffer {
    return readFileSync(this.pathOf(storageKey));
  }

  /** Removes an object written by this process whose database row could not be saved. */
  discard(storageKey: string): void {
    removeQuietly(this.pathOf(storageKey));
  }

  /**
   * Removes abandoned temporary files and finished objects no attachments row refers to,
   * both only after `minAgeMs`. A referenced object is never removed, whatever its age.
   */
  sweep(options: SweepOptions): SweepResult {
    const nowMs = (options.now ?? new Date()).getTime();
    const stale = (path: string): boolean => {
      try {
        return nowMs - statSync(path).mtimeMs >= options.minAgeMs;
      } catch {
        return false; // vanished meanwhile
      }
    };
    const result: SweepResult = { removedTemporary: 0, removedUnreferenced: 0, keptReferenced: 0 };

    for (const name of listFiles(this.#tempDir())) {
      if (!name.endsWith(TEMP_SUFFIX)) continue;
      const path = join(this.#tempDir(), name);
      if (stale(path) && removeQuietly(path)) result.removedTemporary += 1;
    }
    for (const name of listFiles(this.#filesDir())) {
      if (!isStorageKey(name)) continue; // never touch what this store did not create
      if (options.isReferenced(name)) {
        result.keptReferenced += 1;
        continue;
      }
      const path = join(this.#filesDir(), name);
      if (stale(path) && removeQuietly(path)) result.removedUnreferenced += 1;
    }
    return result;
  }

  /** Absolute path of an object; only keys of the generated alphabet are accepted. */
  pathOf(storageKey: string): string {
    if (!isStorageKey(storageKey)) throw new Error('Invalid storage key');
    return join(this.#filesDir(), storageKey);
  }
}

function listFiles(directory: string): string[] {
  try {
    return readdirSync(directory);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

function removeQuietly(path: string): boolean {
  try {
    unlinkSync(path);
    return true;
  } catch {
    return false;
  }
}
