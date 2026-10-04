import type { DeficitMode, PolicyBreak, PolicyMinuteField, PolicyRequest, PolicyVersion } from '../api.ts';

/*
 * Pure logic of the personal policy form: text fields to a request body, a signature that ties a
 * preview to the exact values it was computed for, and the labels of the preview. The server
 * stays the authority: whole-number syntax is checked here only so that a typo is named before a
 * request; every rule (consistent reference schedule, prospective date) is the server's.
 */

export interface BreakDraft {
  /** Stable row identity for React; never sent. */
  rowKey: number;
  startOffset: string;
  duration: string;
  countsAsWork: boolean;
}

export interface PolicyDraft {
  effectiveFrom: string;
  required: string;
  threshold: string;
  rounding: string;
  referenceStart: string;
  referenceEnd: string;
  deficitMode: DeficitMode;
  note: string;
  breaks: BreakDraft[];
}

export const DEFICIT_MODE_LABELS: Record<DeficitMode, string> = {
  ignore: 'Ignore a deficit',
  auto_deduct: 'Deduct a deficit from the OT balance',
  choose_at_signoff: 'Choose at sign-off',
};

export const MINUTE_FIELD_LABELS: Record<PolicyMinuteField, string> = {
  regular_minutes: 'Regular',
  nonworking_minutes: 'Non-working',
  normal_excess_minutes: 'Excess over required',
  eligible_minutes: 'Eligible',
  credited_minutes: 'Credited',
};

let nextRowKey = 1;

export function newBreakDraft(startOffset = '', duration = '', countsAsWork = false): BreakDraft {
  nextRowKey += 1;
  return { rowKey: nextRowKey, startOffset, duration, countsAsWork };
}

/** Starting values for a user without any policy version yet (a 9 h reference day, 8 h required). */
export function starterDraft(effectiveFrom: string): PolicyDraft {
  return {
    effectiveFrom,
    required: '480',
    threshold: '30',
    rounding: '30',
    referenceStart: '08:00',
    referenceEnd: '17:00',
    deficitMode: 'ignore',
    note: '',
    breaks: [newBreakDraft('120', '15'), newBreakDraft('240', '30'), newBreakDraft('390', '15')],
  };
}

/** The form prefilled from the newest version, with the new effective date. */
export function draftFromPolicy(policy: PolicyVersion | undefined, effectiveFrom: string): PolicyDraft {
  if (policy === undefined) return starterDraft(effectiveFrom);
  return {
    effectiveFrom,
    required: String(policy.required_minutes),
    threshold: String(policy.threshold_minutes),
    rounding: String(policy.rounding_step_minutes),
    referenceStart: policy.reference_start,
    referenceEnd: policy.reference_end,
    deficitMode: policy.deficit_mode ?? 'ignore',
    note: '',
    breaks: policy.breaks.map((item) =>
      newBreakDraft(String(item.start_offset_minutes), String(item.duration_minutes), item.counts_as_work),
    ),
  };
}

/** A whole number from digits only, or null; blank, signs and decimals are not numbers here. */
export function wholeNumber(text: string): number | null {
  const trimmed = text.trim();
  return /^\d{1,6}$/.test(trimmed) ? Number(trimmed) : null;
}

export type DraftResult = { ok: true; request: PolicyRequest } | { ok: false; message: string };

export function draftToRequest(draft: PolicyDraft): DraftResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.effectiveFrom)) return { ok: false, message: 'Choose the effective date.' };
  const fields: Array<[string, string]> = [
    ['Required minutes', draft.required],
    ['Threshold minutes', draft.threshold],
    ['Rounding step', draft.rounding],
  ];
  for (const [label, text] of fields) {
    if (wholeNumber(text) === null) return { ok: false, message: `${label} must be a whole number of minutes.` };
  }
  const clock = /^\d{2}:\d{2}$/;
  if (!clock.test(draft.referenceStart) || !clock.test(draft.referenceEnd)) {
    return { ok: false, message: 'Reference start and end must be clock times.' };
  }
  const breaks: PolicyBreak[] = [];
  for (const [index, row] of draft.breaks.entries()) {
    const start = wholeNumber(row.startOffset);
    const duration = wholeNumber(row.duration);
    if (start === null || duration === null) {
      return { ok: false, message: `Break ${index + 1} needs a whole-number start offset and duration.` };
    }
    breaks.push({ start_offset_minutes: start, duration_minutes: duration, counts_as_work: row.countsAsWork });
  }
  const note = draft.note.trim();
  return {
    ok: true,
    request: {
      effective_from: draft.effectiveFrom,
      required_minutes: wholeNumber(draft.required) ?? 0,
      threshold_minutes: wholeNumber(draft.threshold) ?? 0,
      rounding_step_minutes: wholeNumber(draft.rounding) ?? 0,
      reference_start: draft.referenceStart,
      reference_end: draft.referenceEnd,
      breaks,
      deficit_mode: draft.deficitMode,
      ...(note === '' ? {} : { note }),
    },
  };
}

/** Identifies the exact values a preview answered; any edit changes it and retires the preview. */
export function requestSignature(request: PolicyRequest): string {
  return JSON.stringify(request);
}

/** Created only after a preview of these very values (the server preview is the review step). */
export function canCreate(previewedSignature: string | null, draft: DraftResult): boolean {
  return draft.ok && previewedSignature !== null && previewedSignature === requestSignature(draft.request);
}
