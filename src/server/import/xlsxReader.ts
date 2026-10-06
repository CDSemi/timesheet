import { crc32, inflateRawSync } from 'node:zlib';

/*
 * Safe, read-only .xlsx reader (WP4-T08). The input is untrusted: the reader never evaluates a formula, never
 * follows an external link, never opens a macro project and never expands an XML entity. It does not write a
 * workbook either; the tracked template is cloned at ZIP level by the test support, never re-saved.
 *
 * Safety rules (each is covered by a test in tests/integration/workbook-reader.test.ts):
 *  - the ZIP central directory is the only authority for the entry list; the compressed size, the entry count and
 *    every declared inflated size are checked before any byte is inflated;
 *  - inflating is one native call whose output is counted, so a header that lies about the inflated size cannot make
 *    the reader inflate or allocate more than the per-entry cap before it stops;
 *  - every inflated entry must match its CRC-32 and declared size;
 *  - `vbaProject.bin`, macro sheets and macro content types are rejected;
 *  - DOCTYPE and ENTITY declarations are rejected and entities are never expanded; the five predefined entities and
 *    numeric character references are decoded once, by this module;
 *  - external links are listed and ignored; only the workbook, its relationships, the shared strings and the
 *    worksheets are parsed;
 *  - parsing has a stated worst-case cost (WP4-FIXB2, recheck finding RB-01, which reopened audit finding WP4-B-01;
 *    the budget, its bound derived from the limits (WP4-FIXB4) and its measurements are next to
 *    `DEFAULT_READER_LIMITS`). No general XML parser builds a tree: the
 *    XML is read by the bounded scanner below, in one pass over the decoded text of a part. A part whose decoded XML
 *    is over the per-part size limit is refused before it is inflated or decoded, and the XML parsed per package is
 *    capped. The scanner counts every markup opening (every `<` that does not start an end tag, whatever follows it:
 *    an element of any name, a comment, a processing instruction, CDATA), every attribute and the length of every
 *    start tag against per-part and per-package limits, refuses a tag name that is not an XML name, a nesting deeper
 *    than 40 and an end tag that does not match, and stops at the first limit passed. It keeps only the elements,
 *    attributes and text this reader uses (cells, rows and shared strings are counted against their own limits as
 *    they are kept) and hands rows, cells and shared strings over one at a time as they close; everything else is
 *    scanned and dropped. A kept attribute value is at most 255 characters and is decoded once, when it is read; kept
 *    text is decoded once and made an own copy when its element closes, so no kept value keeps a decoded part alive
 *    (WP4-FIXB3, recheck finding WP4-RB2-01). So the time is linear in the bytes allowed, and the memory is bounded by
 *    the counted limits whatever shape the XML has. Text is kept whole here (formula text is cut at Excel's own 8 192
 *    characters); the mapping bounds what it examines and keeps of each value;
 *  - a part that declares an encoding other than UTF-8 or UTF-16 is refused (OPC parts are only those two).
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
  /** Decoded XML bytes of one parsed part (workbook, relationships, shared strings, one worksheet). */
  maxPartXmlBytes: number;
  /** Decoded XML bytes of all parsed parts of one package together. */
  maxTotalXmlBytes: number;
  /**
   * Markup openings in one parsed part: every `<` that does not start an end tag, whatever follows it (an element of
   * any name, a comment, a processing instruction, CDATA). An end tag must close an open element, so it is bounded too.
   */
  maxPartElements: number;
  /** Markup openings in all parsed parts of one package together. */
  maxTotalElements: number;
  /** Attributes of one element, namespace declarations included. */
  maxAttributesPerElement: number;
  /** Attributes in one parsed part. */
  maxPartAttributes: number;
  /** Attributes in all parsed parts of one package together. */
  maxTotalAttributes: number;
  /** Characters of one start tag, from `<` to `>`, its name and attributes included. */
  maxTagLength: number;
  /**
   * Characters of one kept attribute value as written (`r`, `t`, `si`, a sheet name, a relationship target, ...). Real
   * ones are a few to about 90 characters; an attribute the reader does not keep is bounded by the start-tag limit.
   */
  maxKeptAttributeLength: number;
  maxSheets: number;
  /** Characters of one sheet name (Excel allows 31). */
  maxSheetNameLength: number;
  /** `<c>` elements kept in one worksheet. */
  maxCellsPerSheet: number;
  /** `<row>` elements kept in one worksheet. */
  maxRowsPerSheet: number;
  /** `<si>` elements kept in the shared strings. */
  maxSharedStrings: number;
};

/*
 * The parse budget (WP4-FIXB2). Reading any package the reader accepts, or refuses after reading, must take at most
 * 500 ms of event-loop time and add at most 150 MiB of memory on the reference host (Node 24.21 on a Windows 11 x64
 * developer workstation, one preview at a time). Why: a preview runs synchronously on the single event loop of a small
 * NAS that also serves every other request, so half a second is the longest a hostile upload may stall the others (a
 * NAS CPU three to four times slower makes it 1.5 to 2 s, a pause, not a hang); and a small NAS has 1 to 2 GiB of memory
 * for its own system and every container, so a preview may add at most 150 MiB to what the server already uses (a Node
 * process with the reader loaded starts at about 66 MiB).
 *
 * The bound is derived from the limits (WP4-FIXB4, recheck finding WP4-RB3-01), not claimed from searched shapes. The
 * work is linear: each byte of a parsed part is inflated once (one native call into one buffer), decoded once and
 * scanned once; each markup opening, attribute and kept value costs a bounded amount; and the memory follows the same
 * counts, because kept values are own copies and no decoded part outlives its scan. The cost of each kind of unit was
 * measured on the reference host: 61 unit families (skipped bytes, kept text plain and dense with references, markup
 * openings, attributes, kept cells and attributes, values, formulas, shared strings, relationships, content types,
 * rows), compressible and incompressible, in one-byte and two-byte parts, each at half and all of the limits, five
 * fresh processes each. Prices that cover every measured unit (linear-programming duality: then no mix of units
 * inside the limits costs more) give, for X bytes of XML, O markup openings and A attributes in a package:
 *
 *   time   <= 40 ms  + 14.8 ns x X + 339 ns x O + 0 x A
 *   memory <= 15 MiB + 13.3 B  x X + 428 B  x O + 0 x A
 *
 * (An attribute costs less than the bytes it needs, so it adds no price of its own.) At the limits below, X = 3 MiB
 * and O = 100 000, that is about 121 ms and +95 MiB: 24 % and 63 % of the budget. At the earlier ceilings (8 MiB and
 * 150 000) the memory bound was about +182 MiB, over the budget, so the ceilings were lowered to these; the upload
 * ceiling of 2 MiB binds before the XML total for incompressible content.
 *
 * Measured confirmation (WP4-FIXB4): 23 worst constructions at these ceilings (an incompressible part at the part limit
 * for each costly unit, incompressible content at the XML, opening, attribute and upload ceilings, the bound's own
 * worst mixes for time and for memory, the recheck's costliest shapes rebuilt here; five runs each) took at most
 * 108 ms and +63 MiB in the medians, at most 114 ms and +72 MiB in single runs bar one outlier of 149 ms (the same
 * shape: at most 84 ms over nine more runs); the whole import service call at most 108 ms and +46 MiB. All 210 earlier
 * probe and recheck shapes, the WP4-FIXB3 search and the WP4-RECHECK-B3 catalogues, at their own sizes and rebuilt at
 * these ceilings, stay at or under 93 ms and +56 MiB. The tracked template takes about 10 ms and +8 MiB, 12 dated
 * sheets about 22 ms and +13 MiB, 26 (a year) about 31 ms and +14 MiB, 61 dated sheets about 55 ms and +24 MiB.
 *
 * Realistic sizes (synthetic workbooks cloned from the tracked template; the largest part is the template's own
 * 29 KB Timesheet sheet with 1 379 markup openings, 1 720 attributes, 529 cells and 353 rows; no element has more than
 * 9 attributes, no start tag is longer than 643 characters and no kept attribute value is longer than 81, a relationship
 * type): 12 dated sheets are 325 KB of XML, 12 500 openings, 21 000 attributes and an 86 KB upload; 26 (a year) a
 * 153 KB upload; 61 dated sheets (64 sheets, the sheet limit; three years of biweekly sheets, 78, are over it) are
 * 1.4 MB, 53 400 openings, 92 400 attributes and a 328 KB upload. The limits below leave these a margin: the upload
 * 6x the largest package, XML bytes 36x a part and 2.2x a package, openings 72x a part and 1.9x a package, attributes
 * 116x and 5.4x, start-tag length 100x, kept attribute values 3x, sheet names 3x Excel's own limit of 31 characters.
 */
export const DEFAULT_READER_LIMITS: Readonly<ReaderLimits> = {
  maxCompressedBytes: 2 * 1024 * 1024,
  maxEntries: 256,
  maxEntryInflatedBytes: 16 * 1024 * 1024,
  maxTotalInflatedBytes: 48 * 1024 * 1024,
  maxPartXmlBytes: 1024 * 1024,
  maxTotalXmlBytes: 3 * 1024 * 1024,
  maxPartElements: 100_000,
  maxTotalElements: 100_000,
  maxAttributesPerElement: 64,
  maxPartAttributes: 200_000,
  maxTotalAttributes: 500_000,
  maxTagLength: 64 * 1024,
  maxKeptAttributeLength: 255,
  maxSheets: 64,
  maxSheetNameLength: 100,
  maxCellsPerSheet: 50_000,
  maxRowsPerSheet: 20_000,
  maxSharedStrings: 50_000,
};

export type WorkbookRejectionCode =
  | 'package_too_large'
  | 'too_many_entries'
  | 'entry_too_large'
  | 'total_too_large'
  | 'part_too_large'
  | 'total_xml_too_large'
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
  | 'too_many_rows'
  | 'too_many_elements'
  | 'too_many_attributes'
  | 'tag_too_large'
  | 'attribute_too_large'
  | 'unsupported_encoding'
  | 'sheet_name_too_long'
  | 'too_many_holidays'
  | 'too_many_shared_strings'
  /** The report built from an accepted package is over the stored-report cap, or could not be serialized. */
  | 'report_too_large'
  /** Anything else thrown while an accepted package was mapped into a report: a refusal, never a 500. */
  | 'report_failed';

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
  /** Formula text, kept for inspection only; never evaluated. At most 8 192 characters (Excel's own limit). */
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

type Budget = {
  /** Real inflated bytes still allowed for the package (`maxTotalInflatedBytes`). */
  left: number;
  /** Decoded XML bytes still allowed for the parsed parts (`maxTotalXmlBytes`). */
  xmlLeft: number;
  /** Markup openings still allowed over the whole package (`maxTotalElements`). */
  elementsLeft: number;
  /** Attributes still allowed over the whole package (`maxTotalAttributes`). */
  attributesLeft: number;
};

/** Every part this module inflates is parsed as XML, so a part limit applies to every call. */
function inflateEntry(bytes: Uint8Array, entry: ZipEntry, limits: ReaderLimits, budget: Budget): Uint8Array {
  if (entry.uncompressedSize > limits.maxPartXmlBytes) {
    reject('part_too_large', `A package part declares more than ${limits.maxPartXmlBytes} bytes of XML`);
  }
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
  // WP4-FIXB4 (recheck finding WP4-RB3-01): one native inflate call (zlib) instead of fflate's streaming inflate in
  // 4 KiB steps, whose cost per byte was about seven times higher on content that does not compress. Its output
  // buffer is allocated once at the declared size (plus one byte, so an honest entry fills one buffer and a lying one
  // is seen), and zlib stops with ERR_BUFFER_TOO_LARGE as soon as the real output passes the cap: the work is linear in
  // at most the cap, whatever the header says.
  const cap = Math.min(limits.maxEntryInflatedBytes, limits.maxPartXmlBytes, budget.left, budget.xmlLeft);
  let data: Uint8Array;
  let overflow = false;
  if (entry.method === 0) {
    data = compressed;
    overflow = data.length > cap;
  } else {
    try {
      data = inflateRawSync(compressed, { chunkSize: Math.max(64, Math.min(entry.uncompressedSize, cap) + 1), maxOutputLength: Math.max(1, cap) });
      overflow = data.length > cap;
    } catch (error) {
      if ((error as { code?: unknown }).code !== 'ERR_BUFFER_TOO_LARGE') reject('malformed_zip', 'ZIP entry could not be inflated');
      data = new Uint8Array(0);
      overflow = true;
    }
  }
  if (overflow) {
    // The output passed the smallest of these caps; name that one (the first, when several are equal).
    if (cap === limits.maxEntryInflatedBytes) reject('entry_too_large', `An entry inflates beyond ${limits.maxEntryInflatedBytes} bytes`);
    if (cap === limits.maxPartXmlBytes) reject('part_too_large', `A package part inflates beyond ${limits.maxPartXmlBytes} bytes of XML`);
    if (cap === budget.left) reject('total_too_large', `Entries inflate beyond ${limits.maxTotalInflatedBytes} bytes`);
    reject('total_xml_too_large', `The package holds more than ${limits.maxTotalXmlBytes} bytes of XML`);
  }
  if (data.length !== entry.uncompressedSize || (crc32(data) >>> 0) !== entry.crc) {
    reject('entry_integrity', 'ZIP entry size or checksum does not match its header');
  }
  budget.left -= data.length;
  budget.xmlLeft -= data.length;
  return data;
}

// ---------------------------------------------------------------------------------------------------------------------
// XML

function decodeXmlBytes(data: Uint8Array): string {
  if (data.length >= 2 && data[0] === 0xff && data[1] === 0xfe) return decodeFlat('utf-16le', data.subarray(2));
  if (data.length >= 2 && data[0] === 0xfe && data[1] === 0xff) return decodeFlat('utf-16be', data.subarray(2));
  return decodeFlat('utf-8', data);
}

/** Bytes decoded at a time when a part is longer than this (see `decodeFlat`). */
const DECODE_STEP = 512 * 1024;

/**
 * The decoded text of a part, as one flat string. Node hands back a decoded string of about 1 MB or more as an
 * external string, and the scanner reads such a string about twice as slowly, a step in the cost above that size
 * (WP4-FIXB4). A longer part is therefore decoded in steps (a streaming decoder, so a character split between two
 * steps decodes as in one call) and the pieces are joined into one ordinary string.
 */
function decodeFlat(encoding: 'utf-8' | 'utf-16le' | 'utf-16be', data: Uint8Array): string {
  if (data.length <= DECODE_STEP) return encoding === 'utf-8' ? utf8.decode(data) : new TextDecoder(encoding).decode(data);
  const decoder = new TextDecoder(encoding);
  const pieces: string[] = [];
  for (let start = 0; start < data.length; start += DECODE_STEP) {
    pieces.push(decoder.decode(data.subarray(start, start + DECODE_STEP), { stream: true }));
  }
  pieces.push(decoder.decode());
  return pieces.join('');
}

const PREDEFINED: ReadonlyArray<readonly [name: string, code: number]> = [
  ['amp', 0x26],
  ['lt', 0x3c],
  ['gt', 0x3e],
  ['quot', 0x22],
  ['apos', 0x27],
];

function digitValue(code: number, hex: boolean): number {
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  if (!hex) return -1;
  if (code >= 0x61 && code <= 0x66) return code - 0x57;
  if (code >= 0x41 && code <= 0x46) return code - 0x37;
  return -1;
}

/**
 * The code point of the reference `text[amp..semi]` (`&` to `;`), or -1 when it is not one this module decodes:
 * `&#` and 1 to 7 decimal digits, `&#x` and 1 to 6 hexadecimal digits, or one of the five predefined names.
 */
function referenceCode(text: string, amp: number, semi: number): number {
  if (text.charCodeAt(amp + 1) !== 0x23) {
    for (const [name, code] of PREDEFINED) if (semi - amp - 1 === name.length && text.startsWith(name, amp + 1)) return code;
    return -1;
  }
  const hex = text.charCodeAt(amp + 2) === 0x78;
  const first = amp + (hex ? 3 : 2);
  if (semi === first || semi - first > (hex ? 6 : 7)) return -1;
  let code = 0;
  for (let at = first; at < semi; at += 1) {
    const digit = digitValue(text.charCodeAt(at), hex);
    if (digit < 0) return -1;
    code = code * (hex ? 16 : 10) + digit;
  }
  return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff) ? -1 : code;
}

/** The longest reference decoded, from `&` to `;` (`&#1234567;`, `&#x10FFFF;`). */
const LONGEST_REFERENCE = 10;
/** Text up to this length is decoded by concatenation, longer text into one buffer. */
const SHORT_TEXT = 256;

/**
 * Decode the five predefined entities and numeric references in one pass; any other `&name;` stays literal. Every
 * character is looked at a bounded number of times (WP4-FIXB3: a run of bare `&` used to cost a window scan each): the
 * next `;` is found once and reused, every `&` too far before it is skipped in one step, and the output buffer is
 * allocated only for the first reference that decodes, so text dense with references costs no more than its length.
 */
function decodeXml(text: string): string {
  let amp = text.indexOf('&');
  if (amp === -1) return text;
  let semi = text.indexOf(';', amp + 1);
  if (semi === -1) return text;
  // A short text (a kept attribute value, a cell value) is built by concatenation; a long one in one buffer, a
  // reference being at least 4 characters and decoding to at most 2 (WP4-FIXB4: no buffer for every short value).
  const short = text.length <= SHORT_TEXT;
  let built = '';
  let out: Uint16Array | null = null;
  let length = 0;
  let from = 0;
  while (amp !== -1) {
    if (semi < amp) {
      semi = text.indexOf(';', amp + 1);
      if (semi === -1) break;
    }
    // `semi` is the first `;` after `amp`, so no `&` before `semi - LONGEST_REFERENCE + 1` can start a reference.
    if (semi - amp >= LONGEST_REFERENCE) {
      amp = text.indexOf('&', semi - LONGEST_REFERENCE + 1);
      continue;
    }
    const code = referenceCode(text, amp, semi);
    if (code < 0) {
      amp = text.indexOf('&', amp + 1);
      continue;
    }
    if (short) {
      built += text.slice(from, amp) + String.fromCodePoint(code);
    } else {
      out ??= new Uint16Array(text.length);
      for (let at = from; at < amp; at += 1) out[length++] = text.charCodeAt(at);
      if (code > 0xffff) {
        out[length++] = 0xd800 + ((code - 0x10000) >> 10);
        out[length++] = 0xdc00 + ((code - 0x10000) & 0x3ff);
      } else {
        out[length++] = code;
      }
    }
    from = semi + 1;
    amp = text.indexOf('&', from);
  }
  if (from === 0) return text;
  if (short) return built + text.slice(from);
  if (out === null) return text;
  for (let at = from; at < text.length; at += 1) out[length++] = text.charCodeAt(at);
  const chunks: string[] = [];
  for (let start = 0; start < length; start += 8192) chunks.push(String.fromCharCode(...out.subarray(start, Math.min(length, start + 8192))));
  return chunks.join('');
}

/**
 * A copy of `value` that does not keep alive the string it was cut from (WP4-FIXB3). V8 represents a slice of 13 or
 * more characters as a view into its parent, here a whole decoded part of up to 1 MiB (two bytes a character when it
 * holds one non-Latin-1 character), so one kept value per part used to keep every part in memory. Appending a
 * character and slicing it off again makes V8 flatten the value into a string of its own first; shorter slices are
 * copies already.
 */
function ownCopy(value: string): string {
  return value.length < 13 ? value : `${value} `.slice(0, -1);
}

/** An element the scanner kept: its local name (any namespace prefix removed), kept attributes, kept children and text. */
type XmlNode = {
  /** One of the schema's names (the same string instance), never a slice of the part. */
  readonly name: string;
  /**
   * Kept attributes as `[local name, value, ...]`, one pair per name. Each value is decoded once, when the scanner
   * reads it, and is an own copy of at most `maxKeptAttributeLength` characters as written (WP4-FIXB3).
   */
  attributes: string[] | null;
  children: XmlNode[] | null;
  /**
   * Text of a text element (`t`, `v`, `f`): its character data decoded once, CDATA as written, made an own copy when
   * the element closes; empty for any other element.
   */
  text: string;
};

/**
 * What the scanner keeps of one kind of part. Everything else (any other element, attribute or text) is scanned,
 * counted and dropped, so a part can make the scanner allocate only for the elements this reader reads.
 */
type PartSchema = {
  /** Local name of the root element; a part with another root keeps nothing. */
  readonly root: string;
  /** Kept child elements of each kept element, by local name. */
  readonly children: ReadonlyMap<string, readonly string[]>;
  /** Kept elements whose text is kept. */
  readonly text: readonly string[];
  /** Attributes kept on kept elements, by local name. */
  readonly attributes: readonly string[];
  /**
   * Kept elements handed to the part's reader as they open and close instead of being added to their parent, so
   * a part holds at most one of them (with its subtree) at a time: rows and cells, shared strings, list items.
   */
  readonly streamed: readonly string[];
  /** Which kept elements count against the cell and row limits (worksheet) or the shared-string limit. */
  readonly counts: 'worksheet' | 'sharedStrings' | 'none';
};

function partSchema(schema: {
  root: string;
  children: Record<string, readonly string[]>;
  text?: readonly string[];
  attributes?: readonly string[];
  streamed: readonly string[];
  counts?: PartSchema['counts'];
}): PartSchema {
  const { root, children, text = [], attributes = [], streamed, counts = 'none' } = schema;
  return { root, children: new Map(Object.entries(children)), text, attributes, streamed, counts };
}

const CONTENT_TYPES_SCHEMA = partSchema({ root: 'Types', children: { Types: ['Default', 'Override'] }, attributes: ['ContentType'], streamed: ['Default', 'Override'] });
const WORKBOOK_SCHEMA = partSchema({
  root: 'workbook',
  children: { workbook: ['workbookPr', 'sheets', 'externalReferences'], sheets: ['sheet'] },
  attributes: ['date1904', 'name', 'id', 'state'],
  streamed: ['sheet'],
});
const RELATIONSHIPS_SCHEMA = partSchema({ root: 'Relationships', children: { Relationships: ['Relationship'] }, attributes: ['Id', 'Target', 'Type', 'TargetMode'], streamed: ['Relationship'] });
const SHARED_STRINGS_SCHEMA = partSchema({ root: 'sst', children: { sst: ['si'], si: ['t', 'r'], r: ['t'] }, text: ['t'], streamed: ['si'], counts: 'sharedStrings' });
const WORKSHEET_SCHEMA = partSchema({
  root: 'worksheet',
  children: { worksheet: ['sheetData'], sheetData: ['row'], row: ['c'], c: ['v', 'f', 'is'], is: ['t', 'r'], r: ['t'] },
  text: ['v', 'f', 't'],
  attributes: ['r', 't', 'si'],
  streamed: ['row', 'c'],
  counts: 'worksheet',
});

/** What the part's reader does with a streamed element: `opened` once its attributes are read, `closed` at its end. */
type StreamHandlers = {
  opened?: (node: XmlNode) => void;
  closed?: (node: XmlNode) => void;
};

/** Deepest element nesting accepted; real parts nest about ten deep. */
const MAX_DEPTH = 40;

function isSpace(code: number): boolean {
  return code === 0x20 || code === 0x0a || code === 0x09 || code === 0x0d;
}

/** XML NameStartChar, approximated for non-ASCII: never a digit, `.`, `-`, a space or other ASCII punctuation. */
function isNameStart(code: number): boolean {
  return (code >= 0x61 && code <= 0x7a) || (code >= 0x41 && code <= 0x5a) || code === 0x5f || code === 0x3a || (code >= 0xc0 && code !== 0xd7 && code !== 0xf7);
}

function isNameChar(code: number): boolean {
  return isNameStart(code) || (code >= 0x30 && code <= 0x39) || code === 0x2d || code === 0x2e || code === 0xb7;
}

/** The schema name equal to `text[start..end)`, if any (no string is allocated for a name that is not kept). */
function keptName(text: string, start: number, end: number, names: readonly string[] | undefined): string | undefined {
  if (names === undefined) return undefined;
  for (const name of names) if (name.length === end - start && text.startsWith(name, start)) return name;
  return undefined;
}

/** True when `text[a..a+length)` equals `text[b..b+length)`. */
function sameText(text: string, a: number, b: number, length: number): boolean {
  for (let offset = 0; offset < length; offset += 1) if (text.charCodeAt(a + offset) !== text.charCodeAt(b + offset)) return false;
  return true;
}

/** Notes where a kept attribute's value stands, as `[name, start, end, ...]`: a repeated name keeps its last place. */
function notePending(pending: Array<string | number>, name: string, start: number, end: number): void {
  for (let index = 0; index < pending.length; index += 3) {
    if (pending[index] === name) {
      pending[index + 1] = start;
      pending[index + 2] = end;
      return;
    }
  }
  pending.push(name, start, end);
}

function setAttribute(node: XmlNode, name: string, value: string): void {
  const list = (node.attributes ??= []);
  for (let index = 0; index < list.length; index += 2) {
    if (list[index] === name) {
      list[index + 1] = value;
      return;
    }
  }
  list.push(name, value);
}

function malformedXml(): never {
  return reject('malformed_xml', 'A package part is not well-formed XML');
}

/** One open element. Frames are reused by depth, so an element costs no allocation unless it is kept. */
type Frame = {
  /** Where the element's name, as written, stands in the text: its end tag must repeat it. */
  start: number;
  end: number;
  node: XmlNode | null;
  keepsText: boolean;
  kept: readonly string[] | undefined;
  streamed: boolean;
};

/**
 * The bounded scanner (WP4-FIXB2). One pass over `text`; every step either advances or refuses the part, and every
 * markup opening, attribute and start-tag character is counted against a limit before anything is kept for it.
 * Streamed elements go to `handlers`; the rest of what is kept hangs from the root, which is returned when it is the
 * schema's root (otherwise `null`).
 */
function scanXml(text: string, schema: PartSchema, limits: ReaderLimits, budget: Budget, handlers: StreamHandlers): XmlNode | null {
  const frames: Frame[] = [];
  /** Kept attributes of the current start tag, `[name, start, end, ...]`; reused for every tag. */
  const pending: Array<string | number> = [];
  let depth = 0;
  let root: XmlNode | null = null;
  let rootSeen = false;
  let openings = 0;
  let attributes = 0;
  let cells = 0;
  let rows = 0;
  let strings = 0;
  let position = 0;
  while (position < text.length) {
    const open = text.indexOf('<', position);
    const textEnd = open === -1 ? text.length : open;
    const top = depth === 0 ? undefined : frames[depth - 1];
    if (textEnd > position) {
      if (top === undefined) {
        // Only white space may stand outside the root element.
        for (let at = position; at < textEnd; at += 1) if (!isSpace(text.charCodeAt(at))) malformedXml();
      } else if (top.keepsText && top.node !== null) {
        top.node.text += decodeXml(text.slice(position, textEnd));
      }
    }
    if (open === -1) break;
    const next = text.charCodeAt(open + 1);

    if (next === 0x2f) {
      // End tag: it must close the innermost open element, so end tags never outnumber the counted openings.
      const close = text.indexOf('>', open + 2);
      if (close === -1 || top === undefined) return malformedXml();
      let nameEnd = close;
      while (nameEnd > open + 2 && isSpace(text.charCodeAt(nameEnd - 1))) nameEnd -= 1;
      if (nameEnd - (open + 2) !== top.end - top.start || !sameText(text, top.start, open + 2, top.end - top.start)) malformedXml();
      if (top.keepsText && top.node !== null) top.node.text = ownCopy(top.node.text);
      if (top.streamed && top.node !== null) handlers.closed?.(top.node);
      top.node = null;
      depth -= 1;
      position = close + 1;
      continue;
    }

    // Every other `<` opens markup and is counted first, whatever follows it.
    openings += 1;
    budget.elementsLeft -= 1;
    if (openings > limits.maxPartElements) reject('too_many_elements', `A package part has more than ${limits.maxPartElements} markup openings`);
    if (budget.elementsLeft < 0) reject('too_many_elements', `The package has more than ${limits.maxTotalElements} markup openings in its parsed parts`);

    if (next === 0x21) {
      if (text.startsWith('!--', open + 1)) {
        const close = text.indexOf('-->', open + 4);
        if (close === -1) malformedXml();
        position = close + 3;
        continue;
      }
      if (text.startsWith('![CDATA[', open + 1)) {
        const close = text.indexOf(']]>', open + 9);
        if (close === -1 || top === undefined) return malformedXml();
        if (top.keepsText && top.node !== null) top.node.text += text.slice(open + 9, close);
        position = close + 3;
        continue;
      }
      // DOCTYPE and ENTITY were refused before the scan; any other declaration is not workbook XML.
      malformedXml();
    }
    if (next === 0x3f) {
      const close = text.indexOf('?>', open + 2);
      if (close === -1) malformedXml();
      position = close + 2;
      continue;
    }

    // A start tag. Its name must be an XML name: `<1/>`, `< />`, `<.a/>` or `<-/>` are not markup.
    const nameStart = open + 1;
    let at = nameStart;
    if (!isNameStart(text.charCodeAt(at))) malformedXml();
    let localStart = nameStart;
    for (; isNameChar(text.charCodeAt(at)); at += 1) if (localStart === nameStart && text.charCodeAt(at) === 0x3a) localStart = at + 1;
    const nameEnd = at;
    let node: XmlNode | null = null;
    let streamed = false;
    if (top === undefined) {
      if (rootSeen) malformedXml();
      rootSeen = true;
      const name = keptName(text, localStart, nameEnd, [schema.root]);
      if (name !== undefined) node = root = { name, attributes: null, children: null, text: '' };
    } else if (top.node !== null) {
      const name = keptName(text, localStart, nameEnd, top.kept);
      if (name !== undefined) {
        node = { name, attributes: null, children: null, text: '' };
        streamed = schema.streamed.includes(name);
        if (!streamed) (top.node.children ??= []).push(node);
        if (schema.counts === 'worksheet' && name === 'c') {
          cells += 1;
          if (cells > limits.maxCellsPerSheet) reject('too_many_cells', `A sheet has more than ${limits.maxCellsPerSheet} cells`);
        } else if (schema.counts === 'worksheet' && name === 'row') {
          rows += 1;
          if (rows > limits.maxRowsPerSheet) reject('too_many_rows', `A sheet has more than ${limits.maxRowsPerSheet} rows`);
        } else if (schema.counts === 'sharedStrings' && name === 'si') {
          strings += 1;
          if (strings > limits.maxSharedStrings) reject('too_many_shared_strings', 'Too many shared strings');
        }
      }
    }

    // Attributes: each one counted, the tag length checked after each, only the schema's attributes kept.
    let inElement = 0;
    let selfClosing = false;
    for (;;) {
      if (at - open > limits.maxTagLength) reject('tag_too_large', `A start tag is longer than ${limits.maxTagLength} characters`);
      const spaced = isSpace(text.charCodeAt(at));
      while (isSpace(text.charCodeAt(at))) at += 1;
      const code = text.charCodeAt(at);
      if (code === 0x3e) {
        at += 1;
        break;
      }
      if (code === 0x2f && text.charCodeAt(at + 1) === 0x3e) {
        at += 2;
        selfClosing = true;
        break;
      }
      if (!spaced || !isNameStart(code)) malformedXml();
      const attributeStart = at;
      let attributeLocal = at;
      for (; isNameChar(text.charCodeAt(at)); at += 1) if (attributeLocal === attributeStart && text.charCodeAt(at) === 0x3a) attributeLocal = at + 1;
      const attributeEnd = at;
      while (isSpace(text.charCodeAt(at))) at += 1;
      if (text.charCodeAt(at) !== 0x3d) malformedXml();
      at += 1;
      while (isSpace(text.charCodeAt(at))) at += 1;
      const quote = text.charCodeAt(at);
      if (quote !== 0x22 && quote !== 0x27) malformedXml();
      const valueEnd = text.indexOf(quote === 0x22 ? '"' : "'", at + 1);
      if (valueEnd === -1) malformedXml();
      if (valueEnd + 1 - open > limits.maxTagLength) reject('tag_too_large', `A start tag is longer than ${limits.maxTagLength} characters`);
      inElement += 1;
      attributes += 1;
      budget.attributesLeft -= 1;
      if (inElement > limits.maxAttributesPerElement) reject('too_many_attributes', `An element has more than ${limits.maxAttributesPerElement} attributes`);
      if (attributes > limits.maxPartAttributes) reject('too_many_attributes', `A package part has more than ${limits.maxPartAttributes} attributes`);
      if (budget.attributesLeft < 0) reject('too_many_attributes', `The package has more than ${limits.maxTotalAttributes} attributes in its parsed parts`);
      // Namespace declarations (`xmlns`, `xmlns:r`) are never kept, whatever their local part.
      const declaration = text.startsWith('xmlns', attributeStart) && (attributeEnd - attributeStart === 5 || text.charCodeAt(attributeStart + 5) === 0x3a);
      const kept = node === null || declaration ? undefined : keptName(text, attributeLocal, attributeEnd, schema.attributes);
      if (node !== null && kept !== undefined) {
        // A kept value is short in any real part. Only where it stands is noted here; the last occurrence of each name
        // (the one that counts) is decoded once when the tag ends, so repeating a kept name costs no decoding (WP4-FIXB4).
        if (valueEnd - (at + 1) > limits.maxKeptAttributeLength) {
          reject('attribute_too_large', `A kept attribute value is longer than ${limits.maxKeptAttributeLength} characters`);
        }
        notePending(pending, kept, at + 1, valueEnd);
      }
      at = valueEnd + 1;
    }
    if (at - open > limits.maxTagLength) reject('tag_too_large', `A start tag is longer than ${limits.maxTagLength} characters`);
    if (node !== null) {
      // Decoded here, once, and nothing decodes the value again (WP4-FIXB3).
      for (let index = 0; index < pending.length; index += 3) {
        setAttribute(node, pending[index] as string, ownCopy(decodeXml(text.slice(pending[index + 1] as number, pending[index + 2] as number))));
      }
      pending.length = 0;
    }
    if (streamed && node !== null) {
      handlers.opened?.(node);
      if (selfClosing) handlers.closed?.(node);
    }
    if (!selfClosing) {
      if (depth >= MAX_DEPTH) malformedXml();
      const frame = frames[depth] ?? { start: 0, end: 0, node: null, keepsText: false, kept: undefined, streamed: false };
      frames[depth] = frame;
      frame.start = nameStart;
      frame.end = nameEnd;
      frame.node = node;
      frame.keepsText = node !== null && schema.text.includes(node.name);
      frame.kept = node === null ? undefined : schema.children.get(node.name);
      frame.streamed = streamed;
      depth += 1;
    }
    position = at;
  }
  if (depth > 0 || !rootSeen) malformedXml();
  return root;
}

/** The encoding an XML declaration names, if any (the declaration stands first in the part). */
const DECLARED_ENCODING = /^<\?xml\s[^?]*?\bencoding\s*=\s*(["'])([^"']*)\1/;
/** OPC parts are UTF-8 or UTF-16 (ECMA-376 Part 2); the reader decodes nothing else. */
const SUPPORTED_ENCODING = /^utf-(?:8|16(?:le|be)?)$/i;

function parseXml(data: Uint8Array, schema: PartSchema, limits: ReaderLimits, budget: Budget, handlers: StreamHandlers = {}): XmlNode | null {
  const text = decodeXmlBytes(data);
  if (/<!\s*(?:DOCTYPE|ENTITY)/i.test(text)) reject('doctype_forbidden', 'XML DOCTYPE and ENTITY declarations are not accepted');
  // A part that declares another encoding (ISO-8859-1, windows-1252, ...) would be misread as UTF-8 (recheck R-B2-2).
  const encoding = DECLARED_ENCODING.exec(text)?.[2];
  if (encoding !== undefined && !SUPPORTED_ENCODING.test(encoding)) {
    reject('unsupported_encoding', 'A package part declares an encoding other than UTF-8 or UTF-16');
  }
  return scanXml(text, schema, limits, budget, handlers);
}

/** The first kept child of that name. */
function child(node: XmlNode | null | undefined, name: string): XmlNode | undefined {
  return node?.children?.find((item) => item.name === name);
}

/** A kept attribute's value, already decoded by the scanner; it is never decoded again. */
function attr(node: XmlNode, name: string): string | undefined {
  const list = node.attributes ?? [];
  for (let index = 0; index < list.length; index += 2) {
    if (list[index] === name) return list[index + 1];
  }
  return undefined;
}

/** Plain text of a shared-string item or an inline string: its `t` runs in order, never phonetic hints. */
function richText(item: XmlNode): string {
  let text = '';
  for (const part of item.children ?? []) {
    if (part.name === 't') text += part.text;
    else if (part.name === 'r') for (const run of part.children ?? []) text += run.text;
  }
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

/** `text` is the decoded text of the cell's `<v>`, or `undefined` when it has none. */
function readCellValue(type: string | undefined, text: string | undefined, shared: readonly string[]): { type: ReadCell['type']; value: CellValue } {
  if (type === 's') {
    const index = Number(text);
    const value = Number.isInteger(index) ? shared[index] : undefined;
    return value === undefined ? { type: 'blank', value: null } : { type: 'string', value };
  }
  if (type === 'str' || type === 'inlineStr') return { type: 'string', value: text ?? '' };
  if (type === 'b') return { type: 'boolean', value: text === '1' };
  if (type === 'e') return { type: 'error', value: text ?? '' };
  if (type === 'd') return { type: 'string', value: text ?? '' };
  if (text === undefined || text.trim() === '') return { type: 'blank', value: null };
  const number = Number(text);
  return Number.isFinite(number) ? { type: 'number', value: number } : { type: 'error', value: 'invalid_number' };
}

/** Excel's own limit on the length of a formula; longer formula text is cut, so every kept formula is short. */
const MAX_FORMULA_LENGTH = 8192;
/**
 * A relationship id or a shared-formula id longer than this is ignored. Real ids are a few characters (`rId3`, `0`);
 * a short key also keeps the lookup maps cheap (V8 hashes strings over 16 383 characters by length alone).
 */
const MAX_ID_LENGTH = 255;

/**
 * The cells of one worksheet part. Rows and cells are streamed: each cell is read when its end tag is scanned, so the
 * part never holds more than one row and one cell element besides the cells it returns.
 */
function readWorksheet(name: string, data: Uint8Array, shared: readonly string[], limits: ReaderLimits, budget: Budget): Map<string, ReadCell> {
  const cells = new Map<string, ReadCell>();
  const sharedFormulas = new Map<string, string>();
  /** `sheet!`, made once per sheet, so each cell's provenance is one join of two strings. */
  const prefix = ownCopy(`${name}!`);
  let rowNumber = 0;
  let columnIndex = 0;
  const readCell = (cell: XmlNode): void => {
    const declared = attr(cell, 'r');
    let address: string;
    // An address already written in upper case (every real one) is used as it is: no copy, no match array (WP4-FIXB4).
    const canonical = declared !== undefined && CELL_ADDRESS.test(declared);
    const match = canonical || declared === undefined ? null : CELL_ADDRESS.exec(declared.toUpperCase());
    if (canonical) {
      address = declared;
      columnIndex = 0;
      for (let at = 0; declared.charCodeAt(at) >= 65; at += 1) columnIndex = columnIndex * 26 + (declared.charCodeAt(at) - 64);
    } else if (match) {
      address = `${match[1]}${match[2]}`;
      columnIndex = columnNumber(match[1] ?? 'A');
    } else {
      columnIndex += 1;
      address = `${columnLetters(columnIndex)}${rowNumber}`;
    }
    if (cells.size >= limits.maxCellsPerSheet) reject('too_many_cells', `A sheet has more than ${limits.maxCellsPerSheet} cells`);

    let formula: string | null = null;
    const element = child(cell, 'f');
    if (element !== undefined) {
      const body = element.text.length > MAX_FORMULA_LENGTH ? ownCopy(element.text.slice(0, MAX_FORMULA_LENGTH)) : element.text;
      const declaredId = attr(element, 'si');
      const shareId = declaredId !== undefined && declaredId.length <= MAX_ID_LENGTH ? declaredId : undefined;
      if (body !== '') {
        formula = body;
        // Every cell of a shared formula gets this one string, so the mapping examines it once (WP4-FIXB2).
        if (shareId !== undefined && attr(element, 't') === 'shared') sharedFormulas.set(shareId, body);
      } else {
        formula = (shareId !== undefined ? sharedFormulas.get(shareId) : undefined) ?? '';
      }
    }
    const inlineElement = child(cell, 'is');
    const inline = inlineElement !== undefined ? richText(inlineElement) : undefined;
    const stored = inline !== undefined && attr(cell, 't') === 'inlineStr'
      ? { type: 'string' as const, value: inline }
      : readCellValue(attr(cell, 't'), child(cell, 'v')?.text, shared);
    const isFormula = formula !== null;
    cells.set(address, {
      sheet: name,
      address,
      provenance: prefix + address,
      type: isFormula ? 'blank' : stored.type,
      value: isFormula ? null : stored.value,
      formula,
      cachedValue: isFormula ? stored.value : null,
      cacheNote: isFormula ? FORMULA_CACHE_NOTE : null,
    });
  };
  parseXml(data, WORKSHEET_SCHEMA, limits, budget, {
    opened: (node) => {
      if (node.name !== 'row') return;
      const declaredRow = Number(attr(node, 'r'));
      rowNumber = Number.isInteger(declaredRow) && declaredRow > 0 ? declaredRow : rowNumber + 1;
      columnIndex = 0;
    },
    closed: (node) => {
      if (node.name === 'c') readCell(node);
    },
  });
  return cells;
}

export function readWorkbook(input: Uint8Array, overrides: Partial<ReaderLimits> = {}): ReadWorkbook {
  const limits: ReaderLimits = { ...DEFAULT_READER_LIMITS, ...overrides };
  const entries = listEntries(input, limits);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const budget: Budget = {
    left: limits.maxTotalInflatedBytes,
    xmlLeft: limits.maxTotalXmlBytes,
    elementsLeft: limits.maxTotalElements,
    attributesLeft: limits.maxTotalAttributes,
  };
  const read = (name: string): Uint8Array | null => {
    const entry = byName.get(name);
    return entry === undefined ? null : inflateEntry(input, entry, limits, budget);
  };

  const contentTypes = read('[Content_Types].xml');
  const workbookPart = read('xl/workbook.xml');
  if (contentTypes === null || workbookPart === null) reject('not_a_workbook', 'Package is not an Excel workbook');
  parseXml(contentTypes, CONTENT_TYPES_SCHEMA, limits, budget, {
    closed: (item) => {
      if (MACRO_CONTENT_TYPE.test(attr(item, 'ContentType') ?? '')) reject('macro_content', 'Macro-enabled packages are not accepted');
    },
  });

  const notes: ReaderNote[] = [];
  for (const entry of entries) {
    if (/^xl\/externalLinks\//.test(entry.name) && !entry.name.includes('/_rels/')) {
      notes.push({ code: 'external_link_ignored', part: entry.name });
    }
  }

  const sheetNodes: XmlNode[] = [];
  const workbook = parseXml(workbookPart, WORKBOOK_SCHEMA, limits, budget, {
    closed: (node) => {
      sheetNodes.push(node);
      if (sheetNodes.length > limits.maxSheets) reject('too_many_sheets', `Workbook has more than ${limits.maxSheets} sheets`);
      // A sheet name is part of every source address the report lists (`sheet!A1`), so its length is bounded here.
      if ((attr(node, 'name') ?? '').length > limits.maxSheetNameLength) {
        reject('sheet_name_too_long', `A sheet name is longer than ${limits.maxSheetNameLength} characters`);
      }
    },
  });
  if (child(workbook, 'externalReferences') !== undefined) notes.push({ code: 'external_link_ignored', part: 'xl/workbook.xml#externalReferences' });
  const workbookPr = child(workbook, 'workbookPr');
  const date1904 = workbookPr !== undefined && ['1', 'true'].includes(attr(workbookPr, 'date1904') ?? '');

  const relsPart = read('xl/_rels/workbook.xml.rels');
  const relationships = new Map<string, { target: string; type: string; external: boolean }>();
  if (relsPart !== null) {
    parseXml(relsPart, RELATIONSHIPS_SCHEMA, limits, budget, {
      closed: (rel) => {
        const id = attr(rel, 'Id');
        const target = attr(rel, 'Target');
        if (id === undefined || id.length > MAX_ID_LENGTH || target === undefined) return;
        const external = attr(rel, 'TargetMode') === 'External';
        if (external) notes.push({ code: 'external_link_ignored', part: 'xl/_rels/workbook.xml.rels' });
        relationships.set(id, { target, type: attr(rel, 'Type') ?? '', external });
      },
    });
  }

  const sharedPart = read(SHARED_STRINGS_PART);
  const shared: string[] = [];
  if (sharedPart !== null) {
    parseXml(sharedPart, SHARED_STRINGS_SCHEMA, limits, budget, {
      closed: (item) => {
        if (shared.length >= limits.maxSharedStrings) reject('too_many_shared_strings', 'Too many shared strings');
        shared.push(richText(item));
      },
    });
  }

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
    sheets.push({ name, part, kind: 'worksheet', hidden, cells: readWorksheet(name, data, shared, limits, budget) });
  }
  return { sheets, notes, date1904, entryCount: entries.length, inflatedBytes: limits.maxTotalInflatedBytes - budget.left };
}
