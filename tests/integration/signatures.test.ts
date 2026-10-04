import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { ImageRejection, inspectImage } from '../../src/server/files/imageCheck.ts';
import { MAX_SIGNATURES_PER_USER, saveSignature } from '../../src/server/services/signatures.ts';
import { createTestContext, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * Signature images (AC-01, rule 4): raw PNG/JPEG upload with a route-scoped limit, owner-only
 * private download, immutable replacement, and the global JSON-only rule everywhere else.
 * Every image is generated here at test time from synthetic pixels; no image file is committed.
 */

// --- synthetic image builders ----------------------------------------------------------

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

interface PngOptions {
  width?: number;
  height?: number;
  colourType?: number;
  depth?: number;
  /** Raw (unfiltered-row) pixel bytes; default is the exact zero-filled size. */
  raw?: Buffer;
  fill?: number;
}

/** A valid non-interlaced PNG of flat synthetic pixels. */
function makePng({ width = 8, height = 8, colourType = 2, depth = 8, raw, fill = 0x7f }: PngOptions = {}): Buffer {
  const samples = { 0: 1, 2: 3, 4: 2, 6: 4 }[colourType] ?? 1;
  const rowBytes = Math.ceil((width * samples * depth) / 8);
  const pixels = raw ?? Buffer.concat(Array.from({ length: height }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(rowBytes, fill)])));
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = depth;
  header[9] = colourType;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** A structurally complete baseline grayscale JPEG whose blocks are all flat (DC and EOB only). */
function makeJpeg(width = 16, height = 16): Buffer {
  const segment = (marker: number, payload: Buffer) => {
    const out = Buffer.alloc(4 + payload.length);
    out.writeUInt16BE(0xff00 | marker, 0);
    out.writeUInt16BE(payload.length + 2, 2);
    payload.copy(out, 4);
    return out;
  };
  const dqt = segment(0xdb, Buffer.concat([Buffer.from([0]), Buffer.alloc(64, 1)]));
  const sof = Buffer.alloc(9);
  sof[0] = 8;
  sof.writeUInt16BE(height, 1);
  sof.writeUInt16BE(width, 3);
  sof[5] = 1; // one component
  sof[6] = 1;
  sof[7] = 0x11;
  sof[8] = 0;
  const dcCounts = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const dht1 = segment(0xc4, Buffer.concat([Buffer.from([0x00, ...dcCounts]), Buffer.from(Array.from({ length: 12 }, (_, i) => i))]));
  const dht2 = segment(0xc4, Buffer.concat([Buffer.from([0x10, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), Buffer.from([0x00])]));
  const sos = segment(0xda, Buffer.from([1, 1, 0x00, 0, 63, 0]));
  const blocks = Math.ceil(width / 8) * Math.ceil(height / 8);
  // Each flat block: DC category 0 (code 00) then end-of-block (code 0); pad with one bits.
  const bits = '000'.repeat(blocks);
  const padded = bits + '1'.repeat((8 - (bits.length % 8)) % 8);
  const scan: number[] = [];
  for (let i = 0; i < padded.length; i += 8) {
    const byte = Number.parseInt(padded.slice(i, i + 8), 2);
    scan.push(byte);
    if (byte === 0xff) scan.push(0x00);
  }
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    dqt,
    segment(0xc0, sof),
    dht1,
    dht2,
    sos,
    Buffer.from(scan),
    Buffer.from([0xff, 0xd9]),
  ]);
}

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const ZIP_TAIL = Buffer.concat([Buffer.from('PK\x03\x04', 'latin1'), Buffer.from('synthetic-appended-archive')]);

// --- image check -----------------------------------------------------------------------

function rejection(bytes: Uint8Array, declared: string): ImageRejection {
  try {
    inspectImage(bytes, declared);
  } catch (error) {
    if (error instanceof ImageRejection) return error;
    throw error;
  }
  throw new Error('Expected the image to be rejected');
}

describe('image check', () => {
  it('accepts well-formed PNG and JPEG images and reports their pixel size', () => {
    expect(inspectImage(makePng({ width: 30, height: 12 }), 'image/png')).toEqual({ mime: 'image/png', width: 30, height: 12 });
    expect(inspectImage(makePng({ width: 5, height: 3, colourType: 6, depth: 16 }), 'image/png')).toMatchObject({ width: 5, height: 3 });
    expect(inspectImage(makePng({ width: 9, height: 4, colourType: 0, depth: 1 }), 'image/png')).toMatchObject({ width: 9, height: 4 });
    expect(inspectImage(makeJpeg(24, 8), 'image/jpeg')).toEqual({ mime: 'image/jpeg', width: 24, height: 8 });
  });

  it('refuses a declared type that is not PNG or JPEG, and bytes of another type', () => {
    expect(rejection(makePng(), 'image/gif').code).toBe('unsupported_media_type');
    expect(rejection(makePng(), 'application/json').code).toBe('unsupported_media_type');
    expect(rejection(Buffer.from('GIF89a\x01\x00\x01\x00', 'latin1'), 'image/png').code).toBe('unsupported_media_type');
    expect(rejection(Buffer.from('plain text, not an image'), 'image/png').code).toBe('unsupported_media_type');
    expect(rejection(Buffer.alloc(0), 'image/jpeg').code).toBe('unsupported_media_type');
  });

  it('requires the magic bytes and the declared type to agree', () => {
    expect(rejection(makePng(), 'image/jpeg').code).toBe('unsupported_media_type');
    expect(rejection(makeJpeg(), 'image/png').code).toBe('unsupported_media_type');
  });

  it('refuses truncated PNG and JPEG data', () => {
    const png = makePng({ width: 20, height: 20 });
    for (const cut of [8, 20, 33, png.length - 12, png.length - 1]) {
      expect(rejection(png.subarray(0, cut), 'image/png').code, `png cut ${cut}`).toBe('invalid_image');
    }
    const jpeg = makeJpeg();
    for (const cut of [3, 10, jpeg.length - 20, jpeg.length - 2, jpeg.length - 1]) {
      expect(rejection(jpeg.subarray(0, cut), 'image/jpeg').code, `jpeg cut ${cut}`).toBe('invalid_image');
    }
  });

  it('refuses polyglots: data appended after the image ends', () => {
    expect(rejection(Buffer.concat([makePng(), ZIP_TAIL]), 'image/png').code).toBe('invalid_image');
    expect(rejection(Buffer.concat([makePng(), Buffer.from([0])]), 'image/png').code).toBe('invalid_image');
    expect(rejection(Buffer.concat([makeJpeg(), ZIP_TAIL]), 'image/jpeg').code).toBe('invalid_image');
    expect(rejection(Buffer.concat([makeJpeg(), makeJpeg()]), 'image/jpeg').code).toBe('invalid_image');
  });

  it('refuses a corrupted PNG chunk and pixel data that disagrees with the header', () => {
    const corrupted = Buffer.from(makePng());
    corrupted[corrupted.length - 20] = (corrupted[corrupted.length - 20] ?? 0) ^ 0xff;
    expect(rejection(corrupted, 'image/png').code).toBe('invalid_image');

    const short = makePng({ width: 8, height: 8, raw: Buffer.alloc(10) }); // far fewer pixel bytes than 8x8
    expect(rejection(short, 'image/png').code).toBe('invalid_image');
    const long = makePng({ width: 8, height: 8, raw: Buffer.alloc(5000) });
    expect(rejection(long, 'image/png').code).toBe('invalid_image');
  });

  it('bounds the pixel dimensions', () => {
    expect(rejection(makePng({ width: 4097, height: 1, colourType: 0 }), 'image/png').code).toBe('invalid_image');
    expect(rejection(makePng({ width: 3500, height: 3500, colourType: 0, raw: Buffer.alloc(8) }), 'image/png').code).toBe('invalid_image');
    expect(rejection(makePng({ width: 0, height: 4, colourType: 0, raw: Buffer.alloc(0) }), 'image/png').code).toBe('invalid_image');
    expect(rejection(makeJpeg(4097, 8), 'image/jpeg').code).toBe('invalid_image');
    expect(rejection(makeJpeg(5000, 5000), 'image/jpeg').code).toBe('invalid_image');
    expect(inspectImage(makePng({ width: 4096, height: 1, colourType: 0 }), 'image/png').width).toBe(4096);
  });
});

// --- routes ----------------------------------------------------------------------------

type App = ReturnType<typeof createApp>;

let ctx: TestContext;
let app: App;
let dataDir: string;
let adminCookie: string;
let employeeCookie: string;
const extraDirs: string[] = [];

beforeEach(async () => {
  ctx = await createTestContext();
  dataDir = join(dirname(ctx.config.databasePath), 'private-data');
  app = createApp(
    { db: ctx.db, clock: ctx.clock, config: ctx.config, loginLimiter: new LoginRateLimiter(), staticDir: null },
    { dataDir },
  );
  adminCookie = await ctx.login('admin');
  employeeCookie = await ctx.login('employee');
});

afterEach(() => {
  ctx.close();
  for (const dir of extraDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

interface Sent {
  status: number;
  headers: Headers;
  bytes: Buffer;
  json: any;
}

async function send(
  target: App,
  method: string,
  path: string,
  options: { cookie?: string; body?: Uint8Array | string; type?: string | null; origin?: string | null } = {},
): Promise<Sent> {
  const headers: Record<string, string> = {};
  const origin = options.origin === undefined ? ORIGIN : options.origin;
  if (origin !== null) headers.origin = origin;
  if (options.cookie !== undefined) headers.cookie = options.cookie;
  if (options.type !== undefined && options.type !== null) headers['content-type'] = options.type;
  const init: RequestInit = { method, headers };
  if (options.body !== undefined) init.body = options.body;
  const response = await target.request(path, init);
  const bytes = Buffer.from(await response.arrayBuffer());
  let json: unknown = null;
  try {
    json = JSON.parse(bytes.toString('utf8'));
  } catch {
    json = null;
  }
  return { status: response.status, headers: response.headers, bytes, json };
}

const upload = (cookie: string | undefined, body: Uint8Array | string, type: string | null = 'image/png') =>
  send(app, 'POST', '/api/signatures', { cookie, body, type });

const countAttachments = () => (ctx.db.prepare('SELECT count(*) AS n FROM attachments').get() as { n: number }).n;
const storedFiles = () => (existsSync(join(dataDir, 'files')) ? readdirSync(join(dataDir, 'files')) : []);

describe('upload', () => {
  it('stores a PNG and a JPEG for the signed-in owner and returns metadata only', async () => {
    const png = makePng({ width: 40, height: 16 });
    const response = await upload(employeeCookie, png, 'image/png');
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.json.signature).toMatchObject({
      mime_type: 'image/png',
      size_bytes: png.length,
      width_px: 40,
      height_px: 16,
      sha256: sha256(png),
    });
    expect(Object.keys(response.json.signature).sort()).toEqual(
      ['created_at', 'height_px', 'id', 'mime_type', 'sha256', 'size_bytes', 'width_px'].sort(),
    );
    expect(response.bytes.toString('utf8')).not.toContain('storage');

    const row = ctx.db
      .prepare('SELECT user_id, kind, storage_key FROM attachments WHERE id = ?')
      .get(response.json.signature.id) as { user_id: string; kind: string; storage_key: string };
    expect(row).toMatchObject({ user_id: ctx.userIds.employee, kind: 'signature' });
    expect(readFileSync(join(dataDir, 'files', row.storage_key))).toEqual(png);

    const jpeg = makeJpeg(32, 8);
    const second = await upload(adminCookie, jpeg, 'image/jpeg; charset=binary');
    expect(second.status).toBe(201);
    expect(second.json.signature).toMatchObject({ mime_type: 'image/jpeg', width_px: 32, height_px: 8 });
  });

  it('answers 401 to anonymous callers before reading a body, and 403 to a foreign origin', async () => {
    expect((await upload(undefined, makePng())).status).toBe(401);
    expect((await upload(undefined, Buffer.alloc(300 * 1024))).status).toBe(401);
    expect(
      (await send(app, 'POST', '/api/signatures', { cookie: employeeCookie, body: makePng(), type: 'image/png', origin: 'https://evil.example' }))
        .status,
    ).toBe(403);
    expect((await send(app, 'POST', '/api/signatures', { cookie: employeeCookie, body: makePng(), type: 'image/png', origin: null })).status).toBe(403);
    expect(countAttachments()).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('answers 413 above the route limit and accepts a body just below it', async () => {
    const tooLarge = await upload(employeeCookie, Buffer.alloc(256 * 1024 + 1, 1));
    expect(tooLarge.status).toBe(413);
    expect(tooLarge.json.error.code).toBe('payload_too_large');

    const small = createApp(
      { db: ctx.db, clock: ctx.clock, config: ctx.config, loginLimiter: new LoginRateLimiter(), staticDir: null },
      { dataDir, signatureMaxBytes: 400 },
    );
    const fits = makePng({ width: 4, height: 4 });
    expect(fits.length).toBeLessThanOrEqual(400);
    expect((await send(small, 'POST', '/api/signatures', { cookie: employeeCookie, body: fits, type: 'image/png' })).status).toBe(201);
    const bigger = makePng({ width: 64, height: 64, fill: 0 });
    const noisy = Buffer.concat([bigger.subarray(0, bigger.length), Buffer.alloc(500)]);
    expect((await send(small, 'POST', '/api/signatures', { cookie: employeeCookie, body: noisy, type: 'image/png' })).status).toBe(413);
    expect(countAttachments()).toBe(1);
  });

  it('answers 415 for a wrong content type and for bytes that contradict it', async () => {
    const png = makePng();
    expect((await upload(employeeCookie, png, 'application/json')).status).toBe(415);
    expect((await upload(employeeCookie, png, 'image/gif')).status).toBe(415);
    expect((await upload(employeeCookie, png, 'text/plain')).status).toBe(415);
    expect((await upload(employeeCookie, png, 'multipart/form-data; boundary=x')).status).toBe(415);
    expect((await upload(employeeCookie, png, null)).status).toBe(415);
    expect((await upload(employeeCookie, png, 'image/jpeg')).status).toBe(415);
    expect((await upload(employeeCookie, makeJpeg(), 'image/png')).status).toBe(415);
    expect((await upload(employeeCookie, 'plain text', 'image/png')).status).toBe(415);
    expect(countAttachments()).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('answers 422 for truncated, polyglot and oversized-pixel images and stores nothing', async () => {
    const png = makePng({ width: 20, height: 20 });
    const jpeg = makeJpeg();
    const cases: Array<[Buffer, string]> = [
      [png.subarray(0, png.length - 7), 'image/png'],
      [Buffer.concat([png, ZIP_TAIL]), 'image/png'],
      [jpeg.subarray(0, jpeg.length - 2), 'image/jpeg'],
      [Buffer.concat([jpeg, ZIP_TAIL]), 'image/jpeg'],
      [makePng({ width: 4097, height: 1, colourType: 0 }), 'image/png'],
    ];
    for (const [bytes, type] of cases) {
      const response = await upload(employeeCookie, bytes, type);
      expect(response.status, type).toBe(422);
      expect(response.json.error.code).toBe('invalid_image');
    }
    expect(countAttachments()).toBe(0);
    expect(storedFiles()).toEqual([]);
  });

  it('bounds the number of stored signatures per user', async () => {
    for (let index = 0; index < MAX_SIGNATURES_PER_USER; index += 1) {
      expect((await upload(employeeCookie, makePng({ width: 2 + index, height: 2 })).then((r) => r.status)), `upload ${index}`).toBe(201);
    }
    const refused = await upload(employeeCookie, makePng());
    expect(refused.status).toBe(422);
    expect(refused.json.error.code).toBe('signature_limit_reached');
    expect((await upload(adminCookie, makePng())).status).toBe(201);
  });

  it('removes the stored file when the database write fails', () => {
    const files = new FileStore(join(dataDir, 'direct'));
    expect(() => saveSignature(ctx.db, ctx.clock, files, 'no-such-user', makePng(), 'image/png')).toThrow();
    const directory = join(dataDir, 'direct', 'files');
    expect(existsSync(directory) ? readdirSync(directory) : []).toEqual([]);
    expect(countAttachments()).toBe(0);
  });
});

describe('private download', () => {
  async function uploadAs(cookie: string, bytes: Buffer, type = 'image/png'): Promise<string> {
    const response = await upload(cookie, bytes, type);
    expect(response.status).toBe(201);
    return response.json.signature.id as string;
  }

  it('returns the image to its owner as a no-store attachment', async () => {
    const png = makePng({ width: 12, height: 6 });
    const id = await uploadAs(employeeCookie, png);
    const response = await send(app, 'GET', `/api/signatures/${id}`, { cookie: employeeCookie });
    expect(response.status).toBe(200);
    expect(response.bytes).toEqual(png);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-disposition')).toMatch(/^attachment; filename="signature\.png"$/);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');

    const jpegId = await uploadAs(employeeCookie, makeJpeg(), 'image/jpeg');
    const jpeg = await send(app, 'GET', `/api/signatures/${jpegId}`, { cookie: employeeCookie });
    expect(jpeg.headers.get('content-type')).toBe('image/jpeg');
    expect(jpeg.headers.get('content-disposition')).toMatch(/filename="signature\.jpg"/);
  });

  it('answers 404 to another user (also an administrator) and 401 to anonymous callers', async () => {
    const id = await uploadAs(employeeCookie, makePng());
    const swapped = await send(app, 'GET', `/api/signatures/${id}`, { cookie: adminCookie });
    const missing = await send(app, 'GET', '/api/signatures/00000000-0000-4000-8000-000000000000', { cookie: adminCookie });
    expect(swapped.status).toBe(404);
    expect(swapped.json).toEqual(missing.json);
    expect(swapped.bytes.equals(makePng())).toBe(false);

    const adminId = await uploadAs(adminCookie, makePng({ width: 3, height: 3 }));
    expect((await send(app, 'GET', `/api/signatures/${adminId}`, { cookie: employeeCookie })).status).toBe(404);

    expect((await send(app, 'GET', `/api/signatures/${id}`)).status).toBe(401);
    expect((await send(app, 'GET', '/api/signatures/current')).status).toBe(401);
    expect((await send(app, 'GET', `/api/signatures/${id}`, { cookie: 'ts_session=forged' })).status).toBe(401);
  });

  it('treats malformed ids, a storage key and path-like ids as not found', async () => {
    await uploadAs(employeeCookie, makePng());
    const key = (ctx.db.prepare('SELECT storage_key FROM attachments').get() as { storage_key: string }).storage_key;
    for (const id of ['not-a-uuid', key, '..%2F..%2Fapp.db', '%2e%2e', 'current%2F..']) {
      const response = await send(app, 'GET', `/api/signatures/${id}`, { cookie: employeeCookie });
      expect(response.status, id).toBe(404);
    }
  });

  it('never serves a file whose bytes no longer match the recorded hash', async () => {
    const png = makePng({ width: 10, height: 10 });
    const id = await uploadAs(employeeCookie, png);
    const key = (ctx.db.prepare('SELECT storage_key FROM attachments WHERE id = ?').get(id) as { storage_key: string }).storage_key;
    writeFileSync(join(dataDir, 'files', key), Buffer.concat([png, Buffer.from('tampered')]));
    const response = await send(app, 'GET', `/api/signatures/${id}`, { cookie: employeeCookie });
    expect(response.status).toBe(500);
    expect(response.bytes.includes(Buffer.from('tampered'))).toBe(false);
  });

  it('reports the caller’s current signature as metadata and 404 when there is none', async () => {
    expect((await send(app, 'GET', '/api/signatures/current', { cookie: employeeCookie })).status).toBe(404);
    const id = await uploadAs(employeeCookie, makePng());
    const current = await send(app, 'GET', '/api/signatures/current', { cookie: employeeCookie });
    expect(current.json.signature.id).toBe(id);
    expect((await send(app, 'GET', '/api/signatures/current', { cookie: adminCookie })).status).toBe(404);
  });
});

describe('replacement', () => {
  it('appends a new immutable attachment and leaves earlier bytes and hash unchanged', async () => {
    const first = makePng({ width: 20, height: 10, fill: 0x20 });
    const second = makePng({ width: 30, height: 12, fill: 0x90 });
    const firstId = (await upload(employeeCookie, first)).json.signature.id as string;
    const rowBefore = ctx.db.prepare('SELECT * FROM attachments WHERE id = ?').get(firstId);
    const key = (rowBefore as { storage_key: string }).storage_key;
    const diskBefore = readFileSync(join(dataDir, 'files', key));

    ctx.clock.advanceSeconds(60);
    const secondId = (await upload(employeeCookie, second)).json.signature.id as string;
    expect(secondId).not.toBe(firstId);

    expect(ctx.db.prepare('SELECT * FROM attachments WHERE id = ?').get(firstId)).toEqual(rowBefore);
    expect(readFileSync(join(dataDir, 'files', key))).toEqual(diskBefore);
    expect(sha256(diskBefore)).toBe((rowBefore as { sha256: string }).sha256);
    expect(countAttachments()).toBe(2);

    const old = await send(app, 'GET', `/api/signatures/${firstId}`, { cookie: employeeCookie });
    expect(old.bytes).toEqual(first);
    const current = await send(app, 'GET', '/api/signatures/current', { cookie: employeeCookie });
    expect(current.json.signature.id).toBe(secondId);
    expect((await send(app, 'GET', `/api/signatures/${secondId}`, { cookie: employeeCookie })).bytes).toEqual(second);

    expect(() => ctx.db.prepare('UPDATE attachments SET sha256 = ? WHERE id = ?').run('0'.repeat(64), firstId)).toThrow(/immutable_attachment/);
    expect(() => ctx.db.prepare('DELETE FROM attachments WHERE id = ?').run(firstId)).toThrow(/immutable_attachment/);
  });

  it('keeps referenced signature files when the orphan sweep runs', async () => {
    const png = makePng({ width: 14, height: 14 });
    const id = (await upload(employeeCookie, png)).json.signature.id as string;
    const files = new FileStore(dataDir);
    const orphan = files.put(Buffer.from('orphan-synthetic'));
    const result = files.sweep({
      isReferenced: (key) => ctx.db.prepare('SELECT 1 FROM attachments WHERE storage_key = ?').get(key) !== undefined,
      minAgeMs: 0,
      now: new Date(Date.now() + 60_000),
    });
    expect(result).toMatchObject({ keptReferenced: 1, removedUnreferenced: 1 });
    expect(existsSync(files.pathOf(orphan.storageKey))).toBe(false);
    expect((await send(app, 'GET', `/api/signatures/${id}`, { cookie: employeeCookie })).bytes).toEqual(png);
  });
});

describe('audit', () => {
  it('records the upload with metadata only: no image bytes, key or personal data', async () => {
    const png = makePng({ width: 18, height: 9 });
    const id = (await upload(employeeCookie, png)).json.signature.id as string;
    const second = (await upload(employeeCookie, makePng({ width: 19, height: 9 }))).json.signature.id as string;
    const events = ctx.db
      .prepare("SELECT * FROM audit_events WHERE operation = 'signature.upload' ORDER BY occurred_at, rowid")
      .all() as Array<{ actor_user_id: string; owner_user_id: string; entity_type: string; entity_id: string; before_json: string | null; after_json: string }>;
    expect(events).toHaveLength(2);
    const [first, replacement] = events;
    expect(first).toMatchObject({ actor_user_id: ctx.userIds.employee, owner_user_id: ctx.userIds.employee, entity_type: 'attachment', entity_id: id, before_json: null });
    expect(Object.keys(JSON.parse(first?.after_json ?? '{}')).sort()).toEqual(
      ['attachment_id', 'height_px', 'mime_type', 'replaces_attachment_id', 'sha256', 'size_bytes', 'width_px'],
    );
    expect(JSON.parse(replacement?.after_json ?? '{}')).toMatchObject({ attachment_id: second, replaces_attachment_id: id });

    const key = (ctx.db.prepare('SELECT storage_key FROM attachments WHERE id = ?').get(id) as { storage_key: string }).storage_key;
    const everything = JSON.stringify(ctx.db.prepare("SELECT * FROM audit_events WHERE operation = 'signature.upload'").all());
    expect(everything).not.toContain(png.toString('base64'));
    expect(everything).not.toContain(png.toString('latin1').slice(0, 8));
    expect(everything).not.toContain(key);
    expect(everything).not.toContain('@');
    expect(everything).not.toContain(ctx.emails.employee);
  });

  it('writes no audit event for a refused upload', async () => {
    await upload(employeeCookie, makePng(), 'image/gif');
    await upload(employeeCookie, Buffer.concat([makePng(), ZIP_TAIL]));
    expect((ctx.db.prepare("SELECT count(*) AS n FROM audit_events WHERE operation = 'signature.upload'").get() as { n: number }).n).toBe(0);
  });
});

describe('private storage boundary', () => {
  it('never places or serves a stored file under the static root', async () => {
    const staticDir = mkdtempSync(join(tmpdir(), 'timesheet-static-root-'));
    extraDirs.push(staticDir);
    writeFileSync(join(staticDir, 'index.html'), '<!doctype html><div id="root"></div>');
    const served = createApp(
      { db: ctx.db, clock: ctx.clock, config: ctx.config, loginLimiter: new LoginRateLimiter(), staticDir },
      { dataDir },
    );
    const png = makePng({ width: 22, height: 11 });
    const uploaded = await send(served, 'POST', '/api/signatures', { cookie: employeeCookie, body: png, type: 'image/png' });
    expect(uploaded.status).toBe(201);
    const row = ctx.db.prepare('SELECT storage_key FROM attachments').get() as { storage_key: string };

    const relativeToStatic = relative(resolve(staticDir), resolve(dataDir));
    expect(relativeToStatic.startsWith('..')).toBe(true);
    expect(readdirSync(staticDir)).toEqual(['index.html']);
    for (const path of [`/${row.storage_key}`, `/files/${row.storage_key}`, `/private-data/files/${row.storage_key}`, `/signature.png`]) {
      const response = await served.request(path);
      const body = Buffer.from(await response.arrayBuffer());
      expect(body.includes(png), path).toBe(false);
      expect(response.headers.get('content-type') ?? '', path).not.toMatch(/^image\//);
    }
  });

  it('refuses to start with a private data directory inside the static root', () => {
    const staticDir = mkdtempSync(join(tmpdir(), 'timesheet-static-root-'));
    extraDirs.push(staticDir);
    const deps = { db: ctx.db, clock: ctx.clock, config: ctx.config, loginLimiter: new LoginRateLimiter(), staticDir };
    expect(() => createApp(deps, { dataDir: join(staticDir, 'private') })).toThrow(/static root/);
    expect(() => createApp(deps, { dataDir: staticDir })).toThrow(/static root/);
    expect(() => createApp({ ...deps, config: { ...ctx.config, databasePath: join(staticDir, 'app.db') } })).toThrow(/static root/);
  });
});

describe('global JSON-only rule stays in force for every other route', () => {
  const JSON_ROUTE = '/api/days/2026-09-21/sessions';

  it('keeps the 64 KiB limit on JSON routes while the upload route allows 256 KiB', async () => {
    const big = JSON.stringify({ padding: 'x'.repeat(70 * 1024) });
    const response = await send(app, 'POST', JSON_ROUTE, { cookie: employeeCookie, body: big, type: 'application/json' });
    expect(response.status).toBe(413);
    expect(response.json.error.code).toBe('payload_too_large');
    const login = await send(app, 'POST', '/api/auth/login', { body: big, type: 'application/json' });
    expect(login.status).toBe(413);
    // The upload route accepts bodies above 64 KiB, but not above its own limit.
    const above64 = Buffer.concat([makePng(), Buffer.alloc(70 * 1024)]);
    expect((await upload(employeeCookie, above64)).status).toBe(422); // read and inspected, not size-limited
  });

  it('refuses image content types on every other state-changing route', async () => {
    const png = makePng();
    const targets = [JSON_ROUTE, '/api/auth/login', '/api/auth/logout', '/api/ot/leave-requests', '/api/signatures/', '/api/signatures/current', '/api/signatures/x'];
    for (const path of targets) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const response = await send(app, method, path, { cookie: employeeCookie, body: png, type: 'image/png' });
        expect(response.status, `${method} ${path}`).toBe(415);
      }
    }
  });

  it('refuses JSON bodies on the upload route itself and keeps its exemption to POST', async () => {
    expect((await send(app, 'POST', '/api/signatures', { cookie: employeeCookie, body: '{}', type: 'application/json' })).status).toBe(415);
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      const response = await send(app, method, '/api/signatures', { cookie: employeeCookie, body: makePng(), type: 'image/png' });
      expect(response.status, method).toBe(415);
    }
    // Large non-upload bodies on a signature sub-path keep the global limit.
    const big = Buffer.alloc(100 * 1024, 1);
    const response = await send(app, 'POST', '/api/signatures/x', { cookie: employeeCookie, body: big, type: 'application/json' });
    expect(response.status).toBe(413);
  });
});
