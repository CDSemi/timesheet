import { describe, expect, it } from 'vitest';
import type { PolicyVersion } from '../../src/client/api.ts';
import {
  canCreate,
  draftFromPolicy,
  draftToRequest,
  newBreakDraft,
  requestSignature,
  starterDraft,
  wholeNumber,
} from '../../src/client/components/policyModel.ts';

const version: PolicyVersion = {
  id: 'p1',
  seq: 2,
  effective_from: '2026-01-01',
  required_minutes: 450,
  threshold_minutes: 20,
  rounding_step_minutes: 15,
  reference_start: '08:30',
  reference_end: '17:00',
  breaks: [{ start_offset_minutes: 240, duration_minutes: 60, counts_as_work: false }],
  deficit_mode: 'auto_deduct',
};

describe('whole numbers', () => {
  it('accepts digits only', () => {
    expect(wholeNumber('480')).toBe(480);
    expect(wholeNumber(' 30 ')).toBe(30);
    expect(wholeNumber('')).toBeNull();
    expect(wholeNumber('-5')).toBeNull();
    expect(wholeNumber('7.5')).toBeNull();
    expect(wholeNumber('1e3')).toBeNull();
  });
});

describe('policy draft', () => {
  it('prefills from the newest version with the new effective date', () => {
    const draft = draftFromPolicy(version, '2026-10-12');
    expect(draft.effectiveFrom).toBe('2026-10-12');
    expect(draft.required).toBe('450');
    expect(draft.deficitMode).toBe('auto_deduct');
    expect(draft.breaks).toHaveLength(1);
    expect(draft.note).toBe('');
  });

  it('offers starting values when there is no version yet', () => {
    const draft = draftFromPolicy(undefined, '2026-10-12');
    expect(draft).toMatchObject({ required: '480', threshold: '30', rounding: '30', referenceStart: '08:00', referenceEnd: '17:00' });
    expect(draft.breaks.map((row) => row.duration)).toEqual(['15', '30', '15']);
  });

  it('builds the request body with whole numbers and an optional note', () => {
    const draft = { ...starterDraft('2026-10-12'), note: '  new hours ' };
    const result = draftToRequest(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request).toMatchObject({
      effective_from: '2026-10-12',
      required_minutes: 480,
      threshold_minutes: 30,
      rounding_step_minutes: 30,
      deficit_mode: 'ignore',
      note: 'new hours',
    });
    expect(result.request.breaks[1]).toEqual({ start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false });
  });

  it('leaves the note out when it is blank', () => {
    const result = draftToRequest(starterDraft('2026-10-12'));
    expect(result.ok && 'note' in result.request).toBe(false);
  });

  it('names the first field that is not a whole number', () => {
    expect(draftToRequest({ ...starterDraft('2026-10-12'), threshold: '3.5' })).toEqual({
      ok: false,
      message: 'Threshold minutes must be a whole number of minutes.',
    });
    expect(draftToRequest({ ...starterDraft('2026-10-12'), effectiveFrom: '' }).ok).toBe(false);
    const broken = { ...starterDraft('2026-10-12'), breaks: [newBreakDraft('120', '')] };
    expect(draftToRequest(broken)).toEqual({ ok: false, message: 'Break 1 needs a whole-number start offset and duration.' });
  });
});

describe('a preview belongs to the exact values it answered', () => {
  const draft = starterDraft('2026-10-12');
  const result = draftToRequest(draft);

  it('allows creation only for an identical request', () => {
    if (!result.ok) throw new Error('draft must be valid');
    const signature = requestSignature(result.request);
    expect(canCreate(signature, result)).toBe(true);
    expect(canCreate(null, result)).toBe(false);
    const edited = draftToRequest({ ...draft, threshold: '31' });
    expect(canCreate(signature, edited)).toBe(false);
  });

  it('never allows creation from an invalid draft', () => {
    const invalid = draftToRequest({ ...draft, required: '' });
    expect(canCreate('anything', invalid)).toBe(false);
  });
});
