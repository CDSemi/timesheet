import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileStore, isStorageKey } from '../../src/server/files/fileStore.ts';
import { createTestContext, type TestContext } from '../support/testApp.ts';

/*
 * Private file store (docs/03 attachments, atomic rename): temp file then rename,
 * recorded SHA-256, opaque keys, and an orphan sweep that never removes a file an
 * attachments row refers to. All data is synthetic and lives in a temporary directory.
 */

let root: string;
let store: FileStore;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'timesheet-files-'));
  store = new FileStore(root);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const listing = (dir: string) => (existsSync(dir) ? readdirSync(dir) : []);
const synthetic = (text: string) => new TextEncoder().encode(text);

function age(path: string, seconds: number, now: Date): void {
  const when = new Date(now.getTime() - seconds * 1000);
  utimesSync(path, when, when);
}

describe('put', () => {
  it('stores the bytes under an opaque key and records size and SHA-256', () => {
    const bytes = synthetic('synthetic-file-body-1');
    const stored = store.put(bytes);
    expect(isStorageKey(stored.storageKey)).toBe(true);
    expect(stored.sizeBytes).toBe(bytes.length);
    expect(stored.sha256).toBe(sha256(bytes));
    const path = join(root, 'files', stored.storageKey);
    expect(readFileSync(path)).toEqual(Buffer.from(bytes));
    expect(sha256(store.read(stored.storageKey))).toBe(stored.sha256);
    expect(listing(join(root, 'tmp'))).toEqual([]);
  });

  it('never derives the key from the content or a name', () => {
    const bytes = synthetic('same-bytes');
    const first = store.put(bytes);
    const second = store.put(bytes);
    expect(first.storageKey).not.toBe(second.storageKey);
    expect(first.sha256).toBe(second.sha256);
    expect(first.storageKey).not.toContain(first.sha256.slice(0, 8));
  });

  it('publishes the file only by an atomic rename of a complete temporary file', () => {
    const bytes = synthetic('complete-before-visible');
    const seen: { tmp: string[]; finals: string[]; tmpBytes: Buffer | null } = { tmp: [], finals: [], tmpBytes: null };
    const hooked = new FileStore(root, {
      beforeRename(temporaryPath) {
        seen.tmp = listing(join(root, 'tmp'));
        seen.finals = listing(join(root, 'files'));
        seen.tmpBytes = readFileSync(temporaryPath);
      },
    });
    const stored = hooked.put(bytes);
    expect(seen.tmp).toHaveLength(1);
    expect(seen.finals).toEqual([]);
    expect(seen.tmpBytes).toEqual(Buffer.from(bytes));
    expect(listing(join(root, 'files'))).toEqual([stored.storageKey]);
    expect(listing(join(root, 'tmp'))).toEqual([]);
  });

  it('leaves neither a final file nor a temporary file when publishing fails', () => {
    const failing = new FileStore(root, {
      beforeRename() {
        throw new Error('simulated crash before rename');
      },
    });
    expect(() => failing.put(synthetic('never-published'))).toThrow('simulated crash');
    expect(listing(join(root, 'files'))).toEqual([]);
    expect(listing(join(root, 'tmp'))).toEqual([]);
  });

  it('writes only inside its root', () => {
    const stored = store.put(synthetic('inside-root'));
    const relativePath = relative(resolve(root), resolve(store.pathOf(stored.storageKey)));
    expect(relativePath.startsWith('..')).toBe(false);
    expect(dirname(store.pathOf(stored.storageKey))).toBe(join(root, 'files'));
  });
});

describe('keys', () => {
  it('refuses any key that could form a path', () => {
    const bad = ['', 'short', '../escape', '..\\escape', 'a/b/c/d/e/f/g/h/i/j/k', 'x'.repeat(200), 'key with space 0123456789', 'AAAAAAAAAAAAAAAA/../'];
    for (const key of bad) {
      expect(() => store.read(key), key).toThrow('Invalid storage key');
      expect(() => store.pathOf(key), key).toThrow('Invalid storage key');
    }
  });
});

describe('orphan sweep', () => {
  let ctx: TestContext;
  const now = new Date('2026-10-04T12:00:00Z');

  beforeEach(async () => {
    ctx = await createTestContext();
  });
  afterEach(() => ctx.close());

  function reference(storageKey: string, bytes: Uint8Array): void {
    ctx.db
      .prepare(
        `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
         VALUES (?, ?, 'signature', ?, ?, 'image/png', ?, 1, 1, '2026-10-04T00:00:00Z')`,
      )
      .run(`att-${storageKey.slice(0, 8)}`, ctx.userIds.employee, storageKey, sha256(bytes), bytes.length);
  }

  const isReferenced = (key: string) =>
    ctx.db.prepare('SELECT 1 FROM attachments WHERE storage_key = ?').get(key) !== undefined;

  it('removes old temporary files and unreferenced objects but never a referenced file', () => {
    const referencedBytes = synthetic('referenced-object');
    const referenced = store.put(referencedBytes);
    reference(referenced.storageKey, referencedBytes);
    const orphan = store.put(synthetic('orphan-object'));
    const freshOrphan = store.put(synthetic('fresh-orphan-object'));
    mkdirSync(join(root, 'tmp'), { recursive: true });
    const staleTmp = join(root, 'tmp', 'stale.tmp');
    const freshTmp = join(root, 'tmp', 'fresh.tmp');
    writeFileSync(staleTmp, 'partial');
    writeFileSync(freshTmp, 'partial');
    const foreign = join(root, 'files', 'not a generated key.txt');
    writeFileSync(foreign, 'left alone');

    const day = 24 * 3600;
    age(store.pathOf(referenced.storageKey), 30 * day, now); // very old but referenced
    age(store.pathOf(orphan.storageKey), 2 * day, now);
    age(staleTmp, 2 * day, now);
    age(freshTmp, 60, now);
    age(store.pathOf(freshOrphan.storageKey), 60, now);

    const result = store.sweep({ isReferenced, minAgeMs: day * 1000, now });

    expect(result).toEqual({ removedTemporary: 1, removedUnreferenced: 1, keptReferenced: 1 });
    expect(existsSync(store.pathOf(referenced.storageKey))).toBe(true);
    expect(readFileSync(store.pathOf(referenced.storageKey))).toEqual(Buffer.from(referencedBytes));
    expect(existsSync(store.pathOf(orphan.storageKey))).toBe(false);
    expect(existsSync(store.pathOf(freshOrphan.storageKey))).toBe(true);
    expect(existsSync(staleTmp)).toBe(false);
    expect(existsSync(freshTmp)).toBe(true);
    expect(existsSync(foreign)).toBe(true);
  });

  it('keeps every referenced file even when the grace period is zero', () => {
    const keys = ['one', 'two', 'three'].map((name) => {
      const bytes = synthetic(`referenced-${name}`);
      const stored = store.put(bytes);
      reference(stored.storageKey, bytes);
      return stored.storageKey;
    });
    const orphan = store.put(synthetic('unreferenced'));
    const result = store.sweep({ isReferenced, minAgeMs: 0, now: new Date(Date.now() + 60_000) });
    expect(result.keptReferenced).toBe(3);
    expect(result.removedUnreferenced).toBe(1);
    for (const key of keys) expect(existsSync(store.pathOf(key)), key).toBe(true);
    expect(existsSync(store.pathOf(orphan.storageKey))).toBe(false);
  });

  it('is a no-op on an empty or missing store', () => {
    const empty = new FileStore(join(root, 'does-not-exist'));
    expect(empty.sweep({ isReferenced: () => false, minAgeMs: 0 })).toEqual({
      removedTemporary: 0,
      removedUnreferenced: 0,
      keptReferenced: 0,
    });
  });
});
