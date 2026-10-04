import { crc32, deflateSync } from 'node:zlib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

/*
 * Test-only helpers: read a generated PDF back (text with positions, image placements) with
 * pdfjs-dist, and build small synthetic PNG images at test time (no image file is committed).
 */

export type PdfTextItem = { text: string; x: number; y: number; width: number; height: number };
export type PdfImagePlacement = { x: number; y: number; width: number; height: number };
export type PdfPageContent = {
  width: number;
  height: number;
  items: PdfTextItem[];
  /** Text lines in reading order (top to bottom, left to right), items on one baseline joined by a space. */
  lines: string[];
  images: PdfImagePlacement[];
};
export type PdfContent = { pages: PdfPageContent[]; lines: string[]; text: string; info: Record<string, unknown> };

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(m: Matrix, n: Matrix): Matrix {
  // The current matrix after `n cm` is n x m (PDF row-vector convention).
  return [
    n[0] * m[0] + n[1] * m[2],
    n[0] * m[1] + n[1] * m[3],
    n[2] * m[0] + n[3] * m[2],
    n[2] * m[1] + n[3] * m[3],
    n[4] * m[0] + n[5] * m[2] + m[4],
    n[4] * m[1] + n[5] * m[3] + m[5],
  ];
}

function groupLines(items: PdfTextItem[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: PdfTextItem[][] = [];
  for (const item of sorted) {
    const row = rows[rows.length - 1];
    if (row !== undefined && Math.abs((row[0]?.y ?? 0) - item.y) < 1.5) row.push(item);
    else rows.push([item]);
  }
  return rows.map((row) =>
    row
      .sort((a, b) => a.x - b.x)
      .map((item) => item.text)
      .join(' '),
  );
}

export async function readPdf(bytes: Uint8Array): Promise<PdfContent> {
  // pdfjs takes ownership of the buffer it is given, so hand it a copy.
  const task = getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 });
  const doc = await task.promise;
  try {
    const pages: PdfPageContent[] = [];
    for (let number = 1; number <= doc.numPages; number += 1) {
      const page = await doc.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      const items: PdfTextItem[] = [];
      for (const item of textContent.items) {
        if (!('str' in item) || item.str.trim() === '') continue;
        items.push({ text: item.str, x: item.transform[4] ?? 0, y: item.transform[5] ?? 0, width: item.width, height: item.height });
      }
      const images: PdfImagePlacement[] = [];
      const operators = await page.getOperatorList();
      let matrix = IDENTITY;
      const stack: Matrix[] = [];
      operators.fnArray.forEach((fn, index) => {
        const args = operators.argsArray[index] as unknown;
        if (fn === OPS.save) stack.push(matrix);
        else if (fn === OPS.restore) matrix = stack.pop() ?? IDENTITY;
        else if (fn === OPS.transform && Array.isArray(args)) matrix = multiply(matrix, args as Matrix);
        else if (fn === OPS.paintImageXObject) {
          // The image occupies the unit square of the current matrix.
          images.push({ x: matrix[4], y: matrix[5], width: Math.hypot(matrix[0], matrix[1]), height: Math.hypot(matrix[2], matrix[3]) });
        }
      });
      pages.push({ width: viewport.width, height: viewport.height, items, lines: groupLines(items), images });
      page.cleanup();
    }
    const metadata = await doc.getMetadata();
    const lines = pages.flatMap((page) => page.lines);
    return { pages, lines, text: lines.join('\n'), info: metadata.info as Record<string, unknown> };
  } finally {
    await task.destroy();
  }
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const check = Buffer.alloc(4);
  check.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, check]);
}

/** A synthetic opaque RGB PNG (diagonal gradient) of the given pixel size. */
export function makePng(width: number, height: number): Uint8Array {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3);
    for (let x = 0; x < width; x += 1) {
      row[1 + x * 3] = (x * 255) / Math.max(1, width - 1);
      row[2 + x * 3] = (y * 255) / Math.max(1, height - 1);
      row[3 + x * 3] = 90;
    }
    rows.push(row);
  }
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return new Uint8Array(
    Buffer.concat([signature, pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(Buffer.concat(rows))), pngChunk('IEND', Buffer.alloc(0))]),
  );
}
