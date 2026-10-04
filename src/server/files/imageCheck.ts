import { crc32, inflateSync } from 'node:zlib';

/*
 * Signature image check. Only PNG and JPEG are accepted, the leading magic bytes must
 * agree with the declared content type, the pixel dimensions are bounded and the file
 * must be structurally complete: PNG chunks carry valid CRCs and the pixel data inflates
 * to exactly the size the header implies; a JPEG reaches its end-of-image marker. Bytes
 * after the final PNG chunk or JPEG marker (an appended archive, script or second image)
 * make the file a polyglot and are refused, as is truncated data.
 *
 * The check never decodes pixels to a bitmap and never executes anything; it reads
 * headers only (the PNG pixel stream is inflated with a hard output bound to verify its
 * length).
 */

export type ImageMime = 'image/png' | 'image/jpeg';

/** Bounded dimensions: a 4096 px side and 8 megapixels, far above a signature scan. */
export const MAX_IMAGE_SIDE_PX = 4096;
export const MAX_IMAGE_PIXELS = 8_000_000;

export interface ImageInfo {
  mime: ImageMime;
  width: number;
  height: number;
}

/**
 * `unsupported_media_type` maps to HTTP 415 (not PNG/JPEG, or the bytes contradict the
 * declared type); `invalid_image` maps to HTTP 422 (a recognised type whose content is
 * truncated, malformed, oversized in pixels or carries trailing data).
 */
export class ImageRejection extends Error {
  readonly code: 'unsupported_media_type' | 'invalid_image';

  constructor(code: 'unsupported_media_type' | 'invalid_image', message: string) {
    super(message);
    this.name = 'ImageRejection';
    this.code = code;
  }
}

const invalid = (message: string) => new ImageRejection('invalid_image', message);

const PNG_MAGIC = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const startsWith = (bytes: Uint8Array, magic: Uint8Array) => bytes.length >= magic.length && magic.every((value, index) => bytes[index] === value);
const isJpeg = (bytes: Uint8Array) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

function checkDimensions(width: number, height: number): void {
  if (width < 1 || height < 1) throw invalid('Image dimensions must be positive');
  if (width > MAX_IMAGE_SIDE_PX || height > MAX_IMAGE_SIDE_PX || width * height > MAX_IMAGE_PIXELS) {
    throw invalid(`Image is larger than ${MAX_IMAGE_SIDE_PX} px per side or ${MAX_IMAGE_PIXELS} pixels`);
  }
}

/** Validates `bytes` against the declared media type and returns the verified type and size. */
export function inspectImage(bytes: Uint8Array, declared: string): ImageInfo {
  if (declared !== 'image/png' && declared !== 'image/jpeg') {
    throw new ImageRejection('unsupported_media_type', 'Only image/png and image/jpeg are accepted');
  }
  const isPng = startsWith(bytes, PNG_MAGIC);
  const jpeg = isJpeg(bytes);
  if (!isPng && !jpeg) throw new ImageRejection('unsupported_media_type', 'The file is not a PNG or JPEG image');
  if ((declared === 'image/png') !== isPng) {
    throw new ImageRejection('unsupported_media_type', 'The file content does not match the declared image type');
  }
  return isPng ? inspectPng(bytes) : inspectJpeg(bytes);
}

// --- PNG -------------------------------------------------------------------------------

/** Allowed (colour type -> bit depths) and samples per pixel, from the PNG specification. */
const PNG_COLOUR: Record<number, { depths: readonly number[]; samples: number }> = {
  0: { depths: [1, 2, 4, 8, 16], samples: 1 },
  2: { depths: [8, 16], samples: 3 },
  3: { depths: [1, 2, 4, 8], samples: 1 },
  4: { depths: [8, 16], samples: 2 },
  6: { depths: [8, 16], samples: 4 },
};

const ADAM7: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2],
];

function pngRawSize(width: number, height: number, bitsPerPixel: number, interlaced: boolean): number {
  const rows = (w: number, h: number) => (w === 0 || h === 0 ? 0 : h * (1 + Math.ceil((w * bitsPerPixel) / 8)));
  if (!interlaced) return rows(width, height);
  return ADAM7.reduce((sum, [x0, y0, dx, dy]) => sum + rows(Math.ceil((width - x0) / dx), Math.ceil((height - y0) / dy)), 0);
}

function inspectPng(bytes: Uint8Array): ImageInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = PNG_MAGIC.length;
  let width = 0;
  let height = 0;
  let bitsPerPixel = 0;
  let interlaced = false;
  let seenHeader = false;
  let seenEnd = false;
  let hasPalette = false;
  let seenPalette = false;
  const dataChunks: Uint8Array[] = [];
  let dataEnded = false;

  while (offset < bytes.length) {
    if (seenEnd) throw invalid('Data follows the end of the PNG image');
    if (offset + 12 > bytes.length) throw invalid('The PNG image is truncated');
    const length = view.getUint32(offset);
    const type = String.fromCharCode(bytes[offset + 4] ?? 0, bytes[offset + 5] ?? 0, bytes[offset + 6] ?? 0, bytes[offset + 7] ?? 0);
    if (!/^[A-Za-z]{4}$/.test(type)) throw invalid('The PNG image has a malformed chunk');
    const dataStart = offset + 8;
    if (length > 0x7fffffff || dataStart + length + 4 > bytes.length) throw invalid('The PNG image is truncated');
    const body = bytes.subarray(dataStart, dataStart + length);
    if (view.getUint32(dataStart + length) !== crc32(bytes.subarray(offset + 4, dataStart + length))) {
      throw invalid('The PNG image has a corrupt chunk');
    }
    if (!seenHeader) {
      if (type !== 'IHDR' || length !== 13) throw invalid('The PNG image must start with a valid header chunk');
      seenHeader = true;
      width = view.getUint32(dataStart);
      height = view.getUint32(dataStart + 4);
      checkDimensions(width, height);
      const depth = body[8] ?? 0;
      const colourType = body[9] ?? -1;
      const spec = PNG_COLOUR[colourType];
      if (spec === undefined || !spec.depths.includes(depth)) throw invalid('The PNG colour type or bit depth is not valid');
      if (body[10] !== 0 || body[11] !== 0 || (body[12] !== 0 && body[12] !== 1)) throw invalid('The PNG header is not valid');
      bitsPerPixel = spec.samples * depth;
      interlaced = body[12] === 1;
      hasPalette = colourType === 3;
    } else if (type === 'IHDR') {
      throw invalid('The PNG image has a duplicate header chunk');
    } else if (type === 'IDAT') {
      if (dataEnded) throw invalid('The PNG pixel data is not contiguous');
      if (hasPalette && !seenPalette) throw invalid('The PNG palette is missing');
      dataChunks.push(body);
    } else {
      if (dataChunks.length > 0) dataEnded = true;
      if (type === 'PLTE') seenPalette = true;
      if (type === 'IEND') {
        if (length !== 0) throw invalid('The PNG end chunk must be empty');
        seenEnd = true;
      }
    }
    offset = dataStart + length + 4;
  }

  if (!seenHeader || !seenEnd) throw invalid('The PNG image is truncated');
  if (dataChunks.length === 0) throw invalid('The PNG image has no pixel data');

  const expected = pngRawSize(width, height, bitsPerPixel, interlaced);
  let raw: Buffer;
  try {
    raw = inflateSync(Buffer.concat(dataChunks), { maxOutputLength: expected + 1 });
  } catch {
    throw invalid('The PNG pixel data is truncated or larger than the header allows');
  }
  if (raw.length !== expected) throw invalid('The PNG pixel data does not match the header');
  return { mime: 'image/png', width, height };
}

// --- JPEG ------------------------------------------------------------------------------

/** Baseline, extended-sequential and progressive Huffman frames; others are unsupported. */
const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2]);
const OTHER_SOF_MARKERS = new Set([0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function inspectJpeg(bytes: Uint8Array): ImageInfo {
  let offset = 2; // after SOI
  let width = 0;
  let height = 0;
  let seenFrame = false;
  let seenScan = false;

  for (;;) {
    // Skip fill bytes before a marker.
    while (bytes[offset] === 0xff && bytes[offset + 1] === 0xff) offset += 1;
    if (offset + 2 > bytes.length) throw invalid('The JPEG image is truncated');
    if (bytes[offset] !== 0xff) throw invalid('The JPEG image has malformed data');
    const marker = bytes[offset + 1] ?? 0;
    offset += 2;

    if (marker === 0xd9) {
      if (!seenFrame || !seenScan) throw invalid('The JPEG image has no image data');
      if (offset !== bytes.length) throw invalid('Data follows the end of the JPEG image');
      return { mime: 'image/jpeg', width, height };
    }
    if (marker === 0xd8 || marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      throw invalid('The JPEG image has an unexpected marker');
    }
    if (offset + 2 > bytes.length) throw invalid('The JPEG image is truncated');
    const length = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
    if (length < 2 || offset + length > bytes.length) throw invalid('The JPEG image is truncated');

    if (OTHER_SOF_MARKERS.has(marker)) throw invalid('This JPEG encoding is not supported');
    if (SOF_MARKERS.has(marker)) {
      if (seenFrame || length < 8) throw invalid('The JPEG frame header is not valid');
      const components = bytes[offset + 7] ?? 0;
      if ((bytes[offset + 2] ?? 0) !== 8 || components < 1 || components > 4 || length !== 8 + 3 * components) {
        throw invalid('The JPEG frame header is not valid');
      }
      height = ((bytes[offset + 3] ?? 0) << 8) | (bytes[offset + 4] ?? 0);
      width = ((bytes[offset + 5] ?? 0) << 8) | (bytes[offset + 6] ?? 0);
      checkDimensions(width, height);
      seenFrame = true;
    }
    offset += length;

    if (marker === 0xda) {
      if (!seenFrame) throw invalid('The JPEG scan precedes its frame header');
      seenScan = true;
      // Entropy-coded data: stuffed 0xFF00 bytes and RSTn markers stay inside the scan.
      for (;;) {
        if (offset >= bytes.length) throw invalid('The JPEG image is truncated');
        if (bytes[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const next = bytes[offset + 1];
        if (next === undefined) throw invalid('The JPEG image is truncated');
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
          offset += 2;
          continue;
        }
        if (next === 0xff) {
          offset += 1;
          continue;
        }
        break; // a real marker ends the scan
      }
    }
  }
}
