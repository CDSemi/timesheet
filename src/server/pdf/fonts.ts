import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

/*
 * The embedded Unicode fonts. DejaVu Sans (Bitstream Vera / DejaVu licence, permissive: use,
 * embed and redistribute allowed, no sale of the font by itself) covers Vietnamese. The files
 * are read from node_modules (no font binary is committed) and cached for the process.
 */

export type PdfFontBytes = { regular: Uint8Array; bold: Uint8Array };

let cached: Promise<PdfFontBytes> | null = null;

function fontDirectory(): string {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve('dejavu-fonts-ttf/package.json')), 'ttf');
}

export function loadPdfFontBytes(): Promise<PdfFontBytes> {
  cached ??= (async () => {
    const directory = fontDirectory();
    const [regular, bold] = await Promise.all([
      readFile(path.join(directory, 'DejaVuSans.ttf')),
      readFile(path.join(directory, 'DejaVuSans-Bold.ttf')),
    ]);
    return { regular: new Uint8Array(regular), bold: new Uint8Array(bold) };
  })().catch((error: unknown) => {
    cached = null;
    throw error;
  });
  return cached;
}
