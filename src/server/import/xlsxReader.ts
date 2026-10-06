import { crc32 } from 'node:zlib';
import { Inflate } from 'fflate';
import { XMLParser } from 'fast-xml-parser';

/*
 * Safe, read-only .xlsx reader (WP4-T08). The input is untrusted: the reader never evaluates a formula, never
 * follows an external link, never opens a macro project and never expands an XML entity. It does not write a
 * workbook either; the tracked template is cloned at ZIP level by the test support, never re-saved.
 *
 * Safety rules (each is covered by a test in tests/integration/workbook-reader.test.ts):
 *  - the ZIP central directory is the only authority for the entry list; the compressed size, the entry count and
 *    every declared inflated size are checked before any byte is inflated;
 *  - inflating is streamed in small steps and counted, so a header that lies about the inflated size cannot make
 *    the reader allocate more than the per-entry limit (plus one step) before it stops;
 *  - every inflated entry must match its CRC-32 and declared size;
 *  - `vbaProject.bin`, macro sheets and macro content types are rejected;
 *  - DOCTYPE and ENTITY declarations are rejected, and the XML parser has entity processing switched off; the five
 *    predefined entities and numeric character references are decoded once, by this module;
 *  - external links are listed and ignored; only the workbook, its relationships, the shared strings and the
 *    worksheets are parsed.
 */

export const FORMULA_CACHE_NOTE = 'formula cache, not authoritative';

export type ReaderLimits = {
  /** Size of the whole package file. */
  maxCompressedBytes: number;
  maxEntries: number;
  /** Inflated size of one ZIP entry (declared and actual). */
  maxEntryInflatedBytes: number;
  /** Sum of the declared inflated sizes, and of the sizes actually inflated. */
  maxTotalInflatedBytes: number;
  maxSheets: number;
  maxCellsPerSheet: number;
  maxSharedStrings: number;
};

export const DEFAULT_READER_LIMITS: Readonly<ReaderLimits> = {
  maxCompressedBytes: 8 * 1024 * 1024,
  maxEntries: 256,
  maxEntryInflatedBytes: 16 * 1024 * 1024,
  maxTotalInflatedBytes: 48 * 1024 * 1024,
  maxSheets: 64,
  maxCellsPerSheet: 200_000,
  maxSharedStrings: 100_000,
};

export type WorkbookRejectionCode =
  | 'package_too_large'
  | 'too_many_entries'
  | 'entry_too_large'
  | 'total_too_large'
  | 'not_a_zip'
  | 'unsupported_zip'
  | 'malformed_zip'
  | 'entry_integrity'
  | 'macro_content'
  | 'doctype_forbidden'
  | 'malformed_xml'
  | 'not_a_workbook'
  | 'too_many_sheets'
  | 'too_many_cells'
  | 'too_many_shared_strings';

/** The package is refused as a whole; nothing from it is returned. The message never echoes package content. */
export class WorkbookRejectedError extends Error {
  readonly code: WorkbookRejectionCode;

  constructor(code: WorkbookRejectionCode, message: string) {
    super(message);
    this.name = 'WorkbookRejectedError';
    this.code = code;
  }
}

export type CellValue = string | number | boolean | null;

export type ReadCell = {
  sheet: string;
  /** Upper-case A1 address, for example `B13`. */
  address: string;
  /** Cell-level provenance: `sheet!A1`. */
  provenance: string;
  type: 'blank' | 'string' | 'number' | 'boolean' | 'error';
  /** The stored value. Always `null` for a formula cell: its result is never trusted. */
  value: CellValue;
  /** Formula text, kept for inspection only; never evaluated. */
  formula: string | null;
  /** Value Excel cached beside a formula. Present only for formula cells. */
  cachedValue: CellValue;
  /** `formula cache, not authoritative` for formula cells, otherwise `null`. */
  cacheNote: typeof FORMULA_CACHE_NOTE | null;
};

export type ReadSheet = {
  name: string;
  /** Package part holding the sheet, for example `xl/worksheets/sheet3.xml`. */
  part: string;
  kind: 'worksheet' | 'other';
  hidden: boolean;
  /** Cells in document order, keyed by address. */
  cells: ReadonlyMap<string, ReadCell>;
};

export type ReaderNote = {
  code: 'external_link_ignored' | 'non_worksheet_part_ignored';
  /** Package part or relationship target; never cell content. */
  part: string;
};

export type ReadWorkbook = {
  sheets: ReadSheet[];
  notes: ReaderNote[];
  /** True when the workbook uses the 1904 date system. */
  date1904: boolean;
  entryCount: number;
  inflatedBytes: number;
};

/** Only the content types, workbook, relationships, shared strings and worksheets are ever inflated. */
const SHARED_STRINGS_PART = 'xl/sharedStrings.xml';

const INFLATE_STEP = 4096;
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const MACRO_ENTRY = /(?:^|\/)vbaProject\.bin$|(?:^|\/)vbaData\.xml$|\/macrosheets\/|vbaProjectSignature/i;
const MACRO_CONTENT_TYPE = /macroEnabled|vbaProject|macrosheet|vbaData/i;
const CELL_ADDRESS = /^([A-Z]{1,3})([1-9]\d{0,6})$/;

type ZipEntry = {
  name: string;
  method: 0 | 8;
  flags: number;
  crc: number;
  compressedSize: number;
  uncompressedSize: number;
  localOffset: number;
};

const utf8 = new TextDecoder('utf-8', { fatal: false });

function reject(code: WorkbookRejectionCode, message: string): never {
  throw new WorkbookRejectedError(code, message);
}

function listEntries(bytes: Uint8Array, limits: ReaderLimits): ZipEntry[] {
  if (bytes.length > limits.maxCompressedBytes) {
    reject('package_too_large', `Package is larger than ${limits.maxCompressedBytes} bytes`);
  }
  if (bytes.length < 22) reject('not_a_zip', 'File is not a ZIP package');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  const lowest = Math.max(0, bytes.length - 22 - 0xffff);
  for (let at = bytes.length - 22; at >= lowest; at -= 1) {
    if (view.getUint32(at, true) === EOCD_SIGNATURE && at + 22 + view.getUint16(at + 20, true) === bytes.length) {
      eocd = at;
      break;
    }
  }
  if (eocd < 0) reject('not_a_zip', 'File is not a ZIP package');
  const entryCount = view.getUint16(eocd + 10, true);
  const directorySize = view.getUint32(eocd + 12, true);
  const directoryOffset = view.getUint32(eocd + 16, true);
  if (view.getUint16(eocd + 4, true) !== 0 || view.getUint16(eocd + 6, true) !== 0 || view.getUint16(eocd + 8, true) !== entryCount) {
    reject('unsupported_zip', 'Multi-disk ZIP packages are not supported');
  }
  if (entryCount === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) {
    reject('unsupported_zip', 'ZIP64 packages are not supported');
  }
  if (entryCount > limits.maxEntries) reject('too_many_entries', `Package has more than ${limits.maxEntries} entries`);
  if (directoryOffset + directorySize > eocd) reject('malformed_zip', 'ZIP central directory is out of range');

  const entries: ZipEntry[] = [];
  const names = new Set<string>();
  let declaredTotal = 0;
  let at = directoryOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (at + 46 > directoryOffset + directorySize || view.getUint32(at, true) !== CENTRAL_SIGNATURE) {
      reject('malformed_zip', 'ZIP central directory is malformed');
    }
    const flags = view.getUint16(at + 8, true);
    const method = view.getUint16(at + 10, true);
    const crc = view.getUint32(at + 16, true);
    const compressedSize = view.getUint32(at + 20, true);
    const uncompressedSize = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const localOffset = view.getUint32(at + 42, true);
    const next = at + 46 + nameLength + extraLength + commentLength;
    if (next > directoryOffset + directorySize) reject('malformed_zip', 'ZIP central directory is malformed');
    const name = utf8.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at = next;

    if (name.endsWith('/')) continue; // directory marker
    if ((flags & 0x1) !== 0) reject('unsupported_zip', 'Encrypted ZIP entries are not supported');
    if (method !== 0 && method !== 8) reject('unsupported_zip', 'Unsupported ZIP compression method');
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localOffset === 0xffffffff) {
      reject('unsupported_zip', 'ZIP64 entries are not supported');
    }
    if (names.has(name)) reject('malformed_zip', 'ZIP package has duplicate entry names');
    names.add(name);
    if (name.startsWith('/') || name.includes('\\') || name.split('/').includes('..')) {
      reject('malformed_zip', 'ZIP package has an unsafe entry name');
    }
    if (MACRO_ENTRY.test(name)) reject('macro_content', 'Macro-enabled packages are not accepted');
    if (uncompressedSize > limits.maxEntryInflatedBytes) {
      reject('entry_too_large', `An entry declares more than ${limits.maxEntryInflatedBytes} inflated bytes`);
    }
    if (method === 0 && compressedSize !== uncompressedSize) reject('malformed_zip', 'Stored ZIP entry sizes disagree');
    declaredTotal += uncompressedSize;
    if (declaredTotal > limits.maxTotalInflatedBytes) {
      reject('total_too_large', `Entries declare more than ${limits.maxTotalInflatedBytes} inflated bytes`);
    }
    entries.push({ name, method, flags, crc, compressedSize, uncompressedSize, localOffset });
  }
  return entries;
}

function inflateEntry(bytes: Uint8Array, entry: ZipEntry, limits: ReaderLimits, budget: { left: number }): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const at = entry.localOffset;
  if (at + 30 > bytes.length || view.getUint32(at, true) !== LOCAL_SIGNATURE) {
    reject('malformed_zip', 'ZIP local header is malformed');
  }
  const nameLength = view.getUint16(at + 26, true);
  const extraLength = view.getUint16(at + 28, true);
  const start = at + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > bytes.length) reject('malformed_zip', 'ZIP entry data is out of range');
  if (utf8.decode(bytes.subarray(at + 30, at + 30 + nameLength)) !== entry.name) {
    reject('malformed_zip', 'ZIP local header does not match the central directory');
  }
  const compressed = bytes.subarray(start, end);

  // The declared size is only a claim; the cap that counts is the real output, stopped as soon as it is exceeded.
  const cap = Math.min(limits.maxEntryInflatedBytes, budget.left);
  const chunks: Uint8Array[] = [];
  let total = 0;
  let overflow = false;
  if (entry.method === 0) {
    total = compressed.length;
    overflow = total > cap;
    if (!overflow) chunks.push(compressed);
  } else {
    const inflater = new Inflate((chunk) => {
      total += chunk.length;
      if (total > cap) overflow = true;
      else chunks.push(chunk);
    });
    try {
      for (let offset = 0; offset < compressed.length && !overflow; offset += INFLATE_STEP) {
        const stop = Math.min(offset + INFLATE_STEP, compressed.length);
        inflater.push(compressed.subarray(offset, stop), stop === compressed.length);
      }
      if (compressed.length === 0) inflater.push(compressed, true);
    } catch {
      reject('malformed_zip', 'ZIP entry could not be inflated');
    }
  }
  if (overflow) {
    if (total > limits.maxEntryInflatedBytes) {
      reject('entry_too_large', `An entry inflates beyond ${limits.maxEntryInflatedBytes} bytes`);
    }
    reject('total_too_large', `Entries inflate beyond ${limits.maxTotalInflatedBytes} bytes`);
  }
  const data = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) {
    data.set(chunk, position);
    position += chunk.length;
  }
  if (data.length !== entry.uncompressedSize || (crc32(data) >>> 0) !== entry.crc) {
    reject('entry_integrity', 'ZIP entry size or checksum does not match its header');
  }
  budget.left -= data.length;
  return data;
}

// ---------------------------------------------------------------------------------------------------------------------
// XML

const ARRAY_TAGS = new Set(['row', 'c', 'si', 'sheet', 'r', 't', 'Override', 'Default', 'Relationship', 'definedName']);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  removeNSPrefix: true,
  ignoreDeclaration: true,
  ignorePiTags: true,
  // Entities are never expanded by the parser; `decodeXml` below handles the predefined ones exactly once.
  processEntities: false,
  htmlEntities: false,
  maxNestedTags: 40,
  isArray: (name) => ARRAY_TAGS.has(name),
});

type XmlNode = Record<string, unknown>;

function decodeXmlBytes(data: Uint8Array): string {
  if (data.length >= 2 && data[0] === 0xff && data[1] === 0xfe) return new TextDecoder('utf-16le').decode(data.subarray(2));
  if (data.length >= 2 && data[0] === 0xfe && data[1] === 0xff) return new TextDecoder('utf-16be').decode(data.subarray(2));
  return utf8.decode(data);
}

function parseXml(data: Uint8Array): XmlNode {
  const text = decodeXmlBytes(data);
  if (/<!\s*(?:DOCTYPE|ENTITY)/i.test(text)) reject('doctype_forbidden', 'XML DOCTYPE and ENTITY declarations are not accepted');
  try {
    const parsed: unknown = xmlParser.parse(text);
    return isNode(parsed) ? parsed : {};
  } catch {
    return reject('malformed_xml', 'A package part is not well-formed XML');
  }
}

function isNode(value: unknown): value is XmlNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function nodes(value: unknown): XmlNode[] {
  return asArray(value).filter(isNode);
}

const PREDEFINED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** Decode the five predefined entities and numeric references in one pass; any other `&name;` stays literal. */
function decodeXml(text: string): string {
  return text.replace(/&(?:#(\d{1,7})|#x([0-9a-fA-F]{1,6})|(amp|lt|gt|quot|apos));/g, (whole, dec?: string, hex?: string, name?: string) => {
    if (name !== undefined) return PREDEFINED[name] ?? whole;
    const code = dec !== undefined ? Number(dec) : parseInt(hex ?? '', 16);
    if (code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return whole;
    return String.fromCodePoint(code);
  });
}

function attr(node: XmlNode, name: string): string | undefined {
  const value = node[`@_${name}`];
  return typeof value === 'string' ? decodeXml(value) : undefined;
}

function textOf(value: unknown): string {
  if (typeof value === 'string') return decodeXml(value);
  if (isNode(value)) {
    const inner = value['#text'];
    return typeof inner === 'string' ? decodeXml(inner) : '';
  }
  return '';
}

/** Plain text of a shared-string item or an inline string: all `t` runs, never phonetic hints. */
function richText(item: unknown): string {
  if (typeof item === 'string') return decodeXml(item);
  if (!isNode(item)) return '';
  let text = asArray(item.t).map(textOf).join('');
  for (const run of nodes(item.r)) text += asArray(run.t).map(textOf).join('');
  return text;
}

// ---------------------------------------------------------------------------------------------------------------------
// Workbook structure

function columnNumber(letters: string): number {
  let value = 0;
  for (const letter of letters) value = value * 26 + (letter.charCodeAt(0) - 64);
  return value;
}

function columnLetters(number: number): string {
  let value = number;
  let letters = '';
  while (value > 0) {
    const rest = (value - 1) % 26;
    letters = String.fromCharCode(65 + rest) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
}

function resolveTarget(base: string, target: string): string {
  const parts = target.startsWith('/') ? [] : base.split('/').slice(0, -1);
  for (const segment of target.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return parts.join('/');
}

function readCellValue(type: string | undefined, raw: unknown, shared: readonly string[]): { type: ReadCell['type']; value: CellValue } {
  const text = typeof raw === 'string' ? raw : isNode(raw) && typeof raw['#text'] === 'string' ? raw['#text'] : undefined;
  if (type === 's') {
    const index = Number(text);
    const value = Number.isInteger(index) ? shared[index] : undefined;
    return value === undefined ? { type: 'blank', value: null } : { type: 'string', value };
  }
  if (type === 'str' || type === 'inlineStr') return { type: 'string', value: decodeXml(text ?? '') };
  if (type === 'b') return { type: 'boolean', value: text === '1' };
  if (type === 'e') return { type: 'error', value: decodeXml(text ?? '') };
  if (type === 'd') return { type: 'string', value: decodeXml(text ?? '') };
  if (text === undefined || text.trim() === '') return { type: 'blank', value: null };
  const number = Number(text);
  return Number.isFinite(number) ? { type: 'number', value: number } : { type: 'error', value: 'invalid_number' };
}

function readWorksheet(name: string, root: XmlNode, shared: readonly string[], limits: ReaderLimits): Map<string, ReadCell> {
  const cells = new Map<string, ReadCell>();
  const sheet = isNode(root.worksheet) ? root.worksheet : {};
  const sheetData = isNode(sheet.sheetData) ? sheet.sheetData : {};
  const sharedFormulas = new Map<string, string>();
  let rowNumber = 0;
  for (const row of nodes(sheetData.row)) {
    const declaredRow = Number(attr(row, 'r'));
    rowNumber = Number.isInteger(declaredRow) && declaredRow > 0 ? declaredRow : rowNumber + 1;
    let columnIndex = 0;
    for (const cell of nodes(row.c)) {
      const declared = attr(cell, 'r');
      let address: string;
      const match = declared === undefined ? null : CELL_ADDRESS.exec(declared.toUpperCase());
      if (match) {
        address = `${match[1]}${match[2]}`;
        columnIndex = columnNumber(match[1] ?? 'A');
      } else {
        columnIndex += 1;
        address = `${columnLetters(columnIndex)}${rowNumber}`;
      }
      if (cells.size >= limits.maxCellsPerSheet) reject('too_many_cells', `A sheet has more than ${limits.maxCellsPerSheet} cells`);

      let formula: string | null = null;
      if (cell.f !== undefined) {
        const element = Array.isArray(cell.f) ? cell.f[0] : cell.f;
        const body = textOf(element);
        const shareId = isNode(element) ? attr(element, 'si') : undefined;
        if (body !== '') {
          formula = body;
          if (shareId !== undefined && isNode(element) && attr(element, 't') === 'shared') sharedFormulas.set(shareId, body);
        } else {
          formula = (shareId !== undefined ? sharedFormulas.get(shareId) : undefined) ?? '';
        }
      }
      const inline = cell.is !== undefined ? richText(Array.isArray(cell.is) ? cell.is[0] : cell.is) : undefined;
      const stored = inline !== undefined && attr(cell, 't') === 'inlineStr'
        ? { type: 'string' as const, value: inline }
        : readCellValue(attr(cell, 't'), cell.v, shared);
      const isFormula = formula !== null;
      cells.set(address, {
        sheet: name,
        address,
        provenance: `${name}!${address}`,
        type: isFormula ? 'blank' : stored.type,
        value: isFormula ? null : stored.value,
        formula,
        cachedValue: isFormula ? stored.value : null,
        cacheNote: isFormula ? FORMULA_CACHE_NOTE : null,
      });
    }
  }
  return cells;
}

export function readWorkbook(input: Uint8Array, overrides: Partial<ReaderLimits> = {}): ReadWorkbook {
  const limits: ReaderLimits = { ...DEFAULT_READER_LIMITS, ...overrides };
  const entries = listEntries(input, limits);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const budget = { left: limits.maxTotalInflatedBytes };
  const read = (name: string): Uint8Array | null => {
    const entry = byName.get(name);
    return entry === undefined ? null : inflateEntry(input, entry, limits, budget);
  };

  const contentTypes = read('[Content_Types].xml');
  const workbookPart = read('xl/workbook.xml');
  if (contentTypes === null || workbookPart === null) reject('not_a_workbook', 'Package is not an Excel workbook');
  const typesRoot = parseXml(contentTypes);
  const types = isNode(typesRoot.Types) ? typesRoot.Types : {};
  for (const item of [...nodes(types.Default), ...nodes(types.Override)]) {
    if (MACRO_CONTENT_TYPE.test(attr(item, 'ContentType') ?? '')) reject('macro_content', 'Macro-enabled packages are not accepted');
  }

  const notes: ReaderNote[] = [];
  for (const entry of entries) {
    if (/^xl\/externalLinks\//.test(entry.name) && !entry.name.includes('/_rels/')) {
      notes.push({ code: 'external_link_ignored', part: entry.name });
    }
  }

  const workbookRoot = parseXml(workbookPart);
  const workbook = isNode(workbookRoot.workbook) ? workbookRoot.workbook : {};
  if (workbook.externalReferences !== undefined) notes.push({ code: 'external_link_ignored', part: 'xl/workbook.xml#externalReferences' });
  const date1904 = isNode(workbook.workbookPr) && ['1', 'true'].includes(attr(workbook.workbookPr, 'date1904') ?? '');

  const relsPart = read('xl/_rels/workbook.xml.rels');
  const relationships = new Map<string, { target: string; type: string; external: boolean }>();
  if (relsPart !== null) {
    const relsRoot = parseXml(relsPart);
    const container = isNode(relsRoot.Relationships) ? relsRoot.Relationships : {};
    for (const rel of nodes(container.Relationship)) {
      const id = attr(rel, 'Id');
      const target = attr(rel, 'Target');
      if (id === undefined || target === undefined) continue;
      const external = attr(rel, 'TargetMode') === 'External';
      if (external) notes.push({ code: 'external_link_ignored', part: 'xl/_rels/workbook.xml.rels' });
      relationships.set(id, { target, type: attr(rel, 'Type') ?? '', external });
    }
  }

  const sharedPart = read(SHARED_STRINGS_PART);
  const shared: string[] = [];
  if (sharedPart !== null) {
    const sstRoot = parseXml(sharedPart);
    const sst = isNode(sstRoot.sst) ? sstRoot.sst : {};
    for (const item of asArray(sst.si)) {
      if (shared.length >= limits.maxSharedStrings) reject('too_many_shared_strings', 'Too many shared strings');
      shared.push(richText(item));
    }
  }

  const sheetNodes = nodes(isNode(workbook.sheets) ? workbook.sheets.sheet : undefined);
  if (sheetNodes.length > limits.maxSheets) reject('too_many_sheets', `Workbook has more than ${limits.maxSheets} sheets`);
  const sheets: ReadSheet[] = [];
  for (const node of sheetNodes) {
    const name = attr(node, 'name') ?? '';
    const rel = relationships.get(attr(node, 'id') ?? '');
    const hidden = (attr(node, 'state') ?? 'visible') !== 'visible';
    if (rel === undefined || rel.external) {
      sheets.push({ name, part: '', kind: 'other', hidden, cells: new Map() });
      continue;
    }
    const part = resolveTarget('xl/workbook.xml', rel.target);
    if (!rel.type.endsWith('/worksheet')) {
      notes.push({ code: 'non_worksheet_part_ignored', part });
      sheets.push({ name, part, kind: 'other', hidden, cells: new Map() });
      continue;
    }
    const data = read(part);
    if (data === null) {
      sheets.push({ name, part, kind: 'worksheet', hidden, cells: new Map() });
      continue;
    }
    sheets.push({ name, part, kind: 'worksheet', hidden, cells: readWorksheet(name, parseXml(data), shared, limits) });
  }
  return { sheets, notes, date1904, entryCount: entries.length, inflatedBytes: limits.maxTotalInflatedBytes - budget.left };
}
