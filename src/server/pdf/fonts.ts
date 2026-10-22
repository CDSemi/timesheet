import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * The embedded Unicode fonts of the timesheet PDF.
 *
 * - DejaVu Sans, Sans Bold, Serif Condensed Bold and Serif Italic (Bitstream Vera / DejaVu licence, permissive: use,
 *   embed and redistribute allowed, no sale of the font by itself; Vietnamese is covered). They are read from the
 *   `dejavu-fonts-ttf` package in node_modules; no DejaVu binary is committed.
 * - Indie Flower 2.000 (SIL Open Font License 1.1) for the category cell only (ADR 0001). The one committed font file is
 *   assets/pdf-fonts/IndieFlower-Regular.ttf, pinned by its SHA-256 below. It is read by this renderer only: never served
 *   over HTTP and never used by the UI. A category whose text has a character it lacks is drawn in DejaVu Serif Italic.
 *
 * The bytes are cached for the process.
 */

export type PdfFontBytes = {
  sans: Uint8Array;
  sansBold: Uint8Array;
  serifCondensedBold: Uint8Array;
  serifItalic: Uint8Array;
  hand: Uint8Array;
};

/** The pinned Indie Flower file: 108,196 bytes, version 2.000 (assets/pdf-fonts/README.md). */
export const INDIE_FLOWER_FILE = 'IndieFlower-Regular.ttf';
export const INDIE_FLOWER_SHA256 = 'ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94';

let cached: Promise<PdfFontBytes> | null = null;

function dejavuDirectory(): string {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve('dejavu-fonts-ttf/package.json')), 'ttf');
}

/** src/server/pdf and dist/server/pdf both sit three levels below the project root (or the image's /app). */
export function pdfFontAssetDirectory(): string {
  return fileURLToPath(new URL('../../../assets/pdf-fonts/', import.meta.url));
}

async function loadHand(): Promise<Uint8Array> {
  const bytes = await readFile(path.join(pdfFontAssetDirectory(), INDIE_FLOWER_FILE));
  if (createHash('sha256').update(bytes).digest('hex') !== INDIE_FLOWER_SHA256) {
    throw new Error('assets/pdf-fonts/IndieFlower-Regular.ttf does not match its pinned SHA-256 (ADR 0001)');
  }
  return new Uint8Array(bytes);
}

export function loadPdfFontBytes(): Promise<PdfFontBytes> {
  cached ??= (async () => {
    const directory = dejavuDirectory();
    const read = async (name: string): Promise<Uint8Array> => new Uint8Array(await readFile(path.join(directory, name)));
    const [sans, sansBold, serifCondensedBold, serifItalic, hand] = await Promise.all([
      read('DejaVuSans.ttf'),
      read('DejaVuSans-Bold.ttf'),
      read('DejaVuSerifCondensed-Bold.ttf'),
      read('DejaVuSerif-Italic.ttf'),
      loadHand(),
    ]);
    return { sans, sansBold, serifCondensedBold, serifItalic, hand };
  })().catch((error: unknown) => {
    cached = null;
    throw error;
  });
  return cached;
}
