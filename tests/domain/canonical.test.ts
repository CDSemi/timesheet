import { createHash, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  CanonicalError,
  type CanonicalValue,
  canonicalBytes,
  canonicalDate,
  canonicalHash,
  canonicalMinutes,
  canonicalize,
  canonicalUtc,
  sha256Hex,
} from '../../src/domain/canonical.ts';
import {
  normalizeReviewSnapshot,
  reviewSnapshotHash,
  type ReviewSnapshot,
  SNAPSHOT_SCHEMA,
  SNAPSHOT_VERSION,
  sealReviewSnapshot,
} from '../../src/domain/snapshot.ts';

/*
 * WP3-T04: canonical JSON and hash. Equal logical content gives equal bytes and an equal
 * SHA-256 whatever the key order or Unicode form; any other change gives a different hash.
 * Everything here is synthetic.
 */

const bad = (value: unknown) => () => canonicalize(value as CanonicalValue);

/** Builds text from strings and code points, so the Unicode form never depends on how this file is saved. */
const text = (...parts: Array<string | number>): string => parts.map((part) => (typeof part === 'string' ? part : String.fromCodePoint(part))).join('');

describe('canonical text', () => {
  it('sorts object keys, keeps array order and writes no whitespace', () => {
    expect(canonicalize({ b: 1, a: [true, null, 'x'], c: { z: 0, y: -2 } })).toBe('{"a":[true,null,"x"],"b":1,"c":{"y":-2,"z":0}}');
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]');
    expect(canonicalize([])).toBe('[]');
    expect(canonicalize({})).toBe('{}');
  });

  it('gives the same text and hash whatever the key insertion order, at any depth', () => {
    const one = { employee: { name: 'A', zone: 'Z' }, days: [{ minutes: 60, date: '2026-09-14' }], total: 60 };
    const two = { total: 60, days: [{ date: '2026-09-14', minutes: 60 }], employee: { zone: 'Z', name: 'A' } };
    expect(canonicalize(one)).toBe(canonicalize(two));
    expect(canonicalHash(one)).toBe(canonicalHash(two));
  });

  it('treats array order as significant', () => {
    expect(canonicalHash([1, 2])).not.toBe(canonicalHash([2, 1]));
    expect(canonicalHash({ a: [{ x: 1 }, { x: 2 }] })).not.toBe(canonicalHash({ a: [{ x: 2 }, { x: 1 }] }));
  });

  it('normalizes strings and keys to Unicode NFC', () => {
    const composed = text('Nguy', 0x1ec5, 'n ', 0xc1);
    const decomposed = composed.normalize('NFD');
    expect(decomposed).not.toBe(composed);
    expect(canonicalize({ name: decomposed })).toBe(canonicalize({ name: composed }));
    expect(canonicalHash({ name: decomposed })).toBe(canonicalHash({ name: composed }));
    expect(canonicalHash({ [decomposed]: 1 })).toBe(canonicalHash({ [composed]: 1 }));
    expect(canonicalHash({ name: composed })).not.toBe(canonicalHash({ name: 'Nguyen A' }));
    // Compatibility characters are not folded: only canonical equivalence is.
    expect(canonicalHash({ v: text(0xbd) })).not.toBe(canonicalHash({ v: text('1', 0x2044, '2') }));
  });

  it('refuses two keys that are the same after normalization', () => {
    expect(bad({ [text(0xe9)]: 1, [text('e', 0x301)]: 2 })).toThrow(CanonicalError);
  });

  it('writes the exact UTF-8 bytes of the canonical text', () => {
    const value = { k: text(0xe9) };
    expect(new TextDecoder().decode(canonicalBytes(value))).toBe(`{"k":"${text(0xe9)}"}`);
    expect(Array.from(canonicalBytes(value))).toEqual([...Buffer.from(`{"k":"${text(0xe9)}"}`, 'utf8')]);
  });

  it('escapes quotes, controls and lone surrogates the same way every time', () => {
    expect(canonicalize({ q: 'a"b\\c\n\t\u0001' })).toBe('{"q":"a\\"b\\\\c\\n\\t\\u0001"}');
    expect(canonicalize(String.fromCharCode(0xd800))).toBe('"\\ud800"');
  });
});

describe('integer numbers only', () => {
  it('accepts whole numbers and normalizes negative zero', () => {
    expect(canonicalize({ minutes: 90, delta: -30, none: 0 })).toBe('{"delta":-30,"minutes":90,"none":0}');
    expect(canonicalize(-0)).toBe('0');
    expect(canonicalize(Number.MAX_SAFE_INTEGER)).toBe('9007199254740991');
  });

  it.each([1.5, 0.1 + 0.2, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 2, 1e21])('refuses %s', (value) => {
    expect(bad({ minutes: value })).toThrow(CanonicalError);
  });
});

describe('only plain JSON values', () => {
  it.each([
    ['undefined', undefined],
    ['a bigint', 10n],
    ['a function', () => 1],
    ['a symbol', Symbol('x')],
    ['a Date', new Date(0)],
    ['a Map', new Map()],
    ['a Set', new Set()],
    ['a class instance', new (class Box {})()],
    ['an undefined member', { a: undefined }],
  ])('refuses %s', (_label, value) => {
    expect(bad(value)).toThrow(CanonicalError);
  });

  it('refuses a cycle and excessive nesting instead of recursing forever', () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    expect(bad(cycle)).toThrow(CanonicalError);
    let deep: unknown = 0;
    for (let level = 0; level < 40; level += 1) deep = [deep];
    expect(bad(deep)).toThrow(CanonicalError);
  });

  it('names where the bad value is, without echoing it', () => {
    try {
      canonicalize({ a: [{ minutes: 1.5 }] });
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toContain('$.a[0].minutes');
      expect((error as Error).message).not.toContain('1.5');
    }
  });
});

describe('SHA-256', () => {
  it('matches the published test vectors', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex(Buffer.from('abc'))).toBe(sha256Hex('abc'));
  });

  it('agrees with the platform SHA-256 for every length around the block boundaries and for long input', () => {
    for (let length = 0; length <= 200; length += 1) {
      const bytes = randomBytes(length);
      expect(sha256Hex(bytes), `length ${length}`).toBe(createHash('sha256').update(bytes).digest('hex'));
    }
    const long = randomBytes(100_003);
    expect(sha256Hex(long)).toBe(createHash('sha256').update(long).digest('hex'));
    const sample = text('Nguy', 0x1ec5, 'n V', 0x103, 'n ', 0xc1, ' ', 0x1f600, ' synthetic');
    expect(sha256Hex(sample)).toBe(createHash('sha256').update(sample, 'utf8').digest('hex'));
    expect(sha256Hex('a'.repeat(1_000_000))).toBe('cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
  });

  it('is the SHA-256 of the canonical bytes and changes with any value change', () => {
    const base = { a: 1, b: ['x'] };
    expect(canonicalHash(base)).toBe(sha256Hex(canonicalBytes(base)));
    expect(canonicalHash(base)).toMatch(/^[0-9a-f]{64}$/);
    for (const changed of [{ a: 2, b: ['x'] }, { a: 1, b: ['y'] }, { a: 1, b: ['x', 'x'] }, { a: 1, b: ['x'], c: null }, { a: 1 }]) {
      expect(canonicalHash(changed as CanonicalValue)).not.toBe(canonicalHash(base));
    }
  });
});

describe('typed helpers', () => {
  it('accepts ISO dates and rejects everything else', () => {
    expect(canonicalDate('2026-09-14', 'd')).toBe('2026-09-14');
    for (const value of ['2026-9-14', '2026-02-30', '14/09/2026', '2026-09-14T00:00:00Z', '', 20260914, null]) {
      expect(() => canonicalDate(value, 'd')).toThrow(CanonicalError);
    }
  });

  it('accepts whole-second UTC strings and rejects offsets, fractions and local times', () => {
    expect(canonicalUtc('2026-09-15T16:00:00Z', 'i')).toBe('2026-09-15T16:00:00Z');
    for (const value of ['2026-09-15T16:00:00', '2026-09-15T16:00:00+00:00', '2026-09-15T16:00:00.000Z', '2026-09-15 16:00:00Z', '2026-09-15T25:00:00Z', 1]) {
      expect(() => canonicalUtc(value, 'i')).toThrow(CanonicalError);
    }
  });

  it('accepts only non-negative whole minute counts', () => {
    expect(canonicalMinutes(0, 'm')).toBe(0);
    expect(canonicalMinutes(480, 'm')).toBe(480);
    for (const value of [-1, 1.5, Number.NaN, '5', null]) expect(() => canonicalMinutes(value, 'm')).toThrow(CanonicalError);
  });
});

// --- the review snapshot (pure part) ---------------------------------------------------

function snapshot(overrides: Partial<ReviewSnapshot> = {}): ReviewSnapshot {
  const day = (date: string) => ({
    work_date: date,
    day_class: 'normal',
    day_class_reason: 'scheduled_weekday',
    holiday_name: null,
    calendar_version_id: 'cal-v1',
    category: 'Worked',
    category_source: 'default',
    attendance_expected: true,
    wfh: false,
    notes: '',
    leave_minutes: 0,
    leave_kind: null,
    ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    sessions: [],
    completeness: 'no_records',
    policy_version_id: 'pol-v1',
    calculation: null,
    calculation_error: null,
  });
  return {
    schema: SNAPSHOT_SCHEMA,
    schema_version: SNAPSHOT_VERSION,
    employee: { name: 'Example Employee' },
    period: {
      payroll_date: '2026-10-02',
      nominal_payroll_date: '2026-10-02',
      period_start: '2026-09-14',
      period_end: '2026-09-15',
      due_local_date: '2026-09-29',
      due_local_time: '17:00',
      due_at_utc: '2026-09-30T00:00:00Z',
      is_exception: false,
    },
    reporting_zone: 'America/Los_Angeles',
    submission: { id: 'TS-20261002-0123456789', revision_no: 1, sign_off_status: 'Submitted' },
    timesheet: { finalized_revision_no: null },
    calendar: { id: 'cal', version_ids: ['cal-v2', 'cal-v1', 'cal-v1'] },
    policy: { version_ids: ['pol-v1'] },
    days: [day('2026-09-15'), day('2026-09-14')],
    totals: { credited_minutes: 0, pending_days: 0 },
    ot_proposals: [],
    deficit_proposals: [],
    unresolved_inputs: [],
    ot_leave_reservations: [],
    recipients: { to: ['payroll@example.invalid'], cc: [], subject: 'S', body_text: 'B', body_html: 'B', template_version: 1 },
    signature: null,
    auto_image: { authorized: false, attachment_id: null },
    auto_note: { enabled: false, text: 'Automatic submission' },
    show_ot_on_pdf: true,
    ...overrides,
  };
}

describe('review snapshot normalization', () => {
  it('orders days and sets, so the order the caller built them in does not matter', () => {
    const normalized = normalizeReviewSnapshot(snapshot());
    expect(normalized.days.map((item) => item.work_date)).toEqual(['2026-09-14', '2026-09-15']);
    expect(normalized.calendar.version_ids).toEqual(['cal-v1', 'cal-v2']);
    const reversed = snapshot({ days: snapshot().days.slice().reverse(), calendar: { id: 'cal', version_ids: ['cal-v1', 'cal-v2'] } });
    expect(reviewSnapshotHash(reversed)).toBe(reviewSnapshotHash(snapshot()));
  });

  it('seals the normalized payload with its hash', () => {
    const sealed = sealReviewSnapshot(snapshot());
    expect(sealed.sha256).toBe(canonicalHash(sealed.snapshot as unknown as CanonicalValue));
    expect(sealed.sha256).toBe(reviewSnapshotHash(snapshot()));
  });

  it('changes the hash for a recipient, a template text, a signature reference and a version id', () => {
    const base = reviewSnapshotHash(snapshot());
    const variants: Array<Partial<ReviewSnapshot>> = [
      { recipients: { ...snapshot().recipients, to: ['other@example.invalid'] } },
      { recipients: { ...snapshot().recipients, cc: ['copy@example.invalid'] } },
      { recipients: { ...snapshot().recipients, subject: 'S2' } },
      { recipients: { ...snapshot().recipients, body_text: 'B2' } },
      { recipients: { ...snapshot().recipients, template_version: 2 } },
      { signature: { attachment_id: 'a', sha256: 'f'.repeat(64) } },
      { auto_image: { authorized: true, attachment_id: 'a' } },
      { auto_note: { enabled: true, text: 'Automatic submission' } },
      { auto_note: { enabled: false, text: 'Submitted by the schedule' } },
      { policy: { version_ids: ['pol-v2'] } },
      { calendar: { id: 'cal', version_ids: ['cal-v1'] } },
      { show_ot_on_pdf: false },
      { employee: { name: 'Another Employee' } },
      { reporting_zone: 'America/New_York' },
    ];
    const hashes = new Set([base]);
    for (const variant of variants) hashes.add(reviewSnapshotHash(snapshot(variant)));
    expect(hashes.size).toBe(variants.length + 1);
  });

  it('refuses a malformed date, instant or minute count and an unknown schema', () => {
    expect(() => normalizeReviewSnapshot(snapshot({ schema: 'other' }))).toThrow(CanonicalError);
    expect(() => normalizeReviewSnapshot(snapshot({ schema_version: 3 }))).toThrow(CanonicalError);
    expect(() => normalizeReviewSnapshot(snapshot({ schema_version: 0 }))).toThrow(CanonicalError);
    expect(() => normalizeReviewSnapshot(snapshot({ totals: { credited_minutes: 1.5, pending_days: 0 } }))).toThrow(CanonicalError);
    expect(() => normalizeReviewSnapshot(snapshot({ period: { ...snapshot().period, due_at_utc: '2026-09-30T00:00:00+00:00' } }))).toThrow(CanonicalError);
    const days = snapshot().days;
    days[0] = { ...(days[0] as (typeof days)[number]), work_date: '2026-9-15' };
    expect(() => normalizeReviewSnapshot(snapshot({ days }))).toThrow(CanonicalError);
  });
});

describe('review snapshot version 2 and the automatic note', () => {
  const v1Payload = (): ReviewSnapshot => {
    const { auto_note: _omitted, ...rest } = snapshot();
    return { ...rest, schema_version: 1 };
  };
  const vietnameseNote = text('N', 0x1ed9, 'p t', 0x1ef1, ' ', 0x111, 0x1ed9, 'ng');

  it('is the current version and carries the note from the effective settings', () => {
    expect(SNAPSHOT_VERSION).toBe(2);
    const normalized = normalizeReviewSnapshot(snapshot({ auto_note: { enabled: true, text: vietnameseNote } }));
    expect(normalized.auto_note).toEqual({ enabled: true, text: vietnameseNote });
  });

  it('still reads a version 1 payload for rendering: no note is added, so its stored hash stays valid', () => {
    const v1 = v1Payload();
    const normalized = normalizeReviewSnapshot(v1);
    expect('auto_note' in normalized).toBe(false);
    expect(normalized.schema_version).toBe(1);
    expect(reviewSnapshotHash(v1)).toBe(canonicalHash(normalized as unknown as CanonicalValue));
    expect(reviewSnapshotHash(v1)).not.toBe(reviewSnapshotHash(snapshot()));
    // A version 1 payload cannot carry a note it never had.
    expect(() => normalizeReviewSnapshot({ ...v1, auto_note: { enabled: true, text: 'x' } })).toThrow(CanonicalError);
  });

  it('requires a valid note in version 2', () => {
    expect(() => normalizeReviewSnapshot(snapshot({ auto_note: undefined }))).toThrow(CanonicalError);
    const refused: unknown[] = [
      { enabled: 'yes', text: 'Automatic submission' },
      { enabled: true },
      { enabled: true, text: '' },
      { enabled: true, text: '   ' },
      { enabled: true, text: ' padded ' },
      { enabled: true, text: 'two\nlines' },
      { enabled: true, text: 'tab\there' },
      { enabled: true, text: 'braces {EmployeeName}' },
      { enabled: true, text: 'x'.repeat(121) },
      { enabled: true, text: text('e', 0x301) }, // decomposed, not NFC
      { enabled: true, text: text('a', 0x202e, 'b') },
    ];
    for (const note of refused) {
      expect(() => normalizeReviewSnapshot(snapshot({ auto_note: note as ReviewSnapshot['auto_note'] })), JSON.stringify(note)).toThrow(CanonicalError);
    }
    expect(() => normalizeReviewSnapshot(snapshot({ auto_note: { enabled: false, text: 'x'.repeat(120) } }))).not.toThrow();
  });
});
