import type { DayBatchEntry, DayBatchPreview, DayCategory, DayView } from '../api.ts';
import { CATEGORIES } from './sessionModel.ts';

/*
 * The in-cell label picker of the sheet (WP5-UX-T04, owner decision E-3 a), like the Excel
 * dropdown. A pick is a one-entry POST /api/days/batch: preview first, then the commit of the
 * same entry, so the existing conflict confirmation and the reason rule for old or finalized
 * periods (docs/04, AC-04) apply unchanged. "Work from home" is the Excel label for a worked day
 * with WFH; it is the same category Worked plus `wfh: true` (no new category).
 */

export const WORK_FROM_HOME = 'Work from home';

export type LabelChoice = DayCategory | typeof WORK_FROM_HOME;

/** The picker's options in the Excel order: the app categories, then the WFH shortcut. */
export const LABEL_CHOICES: readonly LabelChoice[] = [...CATEGORIES, WORK_FROM_HOME];

/** The option that matches the day now; null when the calendar gives the day no category. */
export function currentLabelChoice(day: DayView): LabelChoice | null {
  if (day.category === null) return null;
  return day.category === 'Worked' && day.wfh ? WORK_FROM_HOME : day.category;
}

/**
 * The one batch entry of a pick, with the version the page loaded. Worked and Work from home also
 * set WFH (off and on); any other label sends only the category, so the server keeps the day's
 * leave, WFH and notes as stored (an omitted batch field keeps its value).
 */
export function labelEntry(day: DayView, choice: LabelChoice): DayBatchEntry {
  const base = { work_date: day.work_date, expected_version: day.entry?.version ?? null };
  if (choice === WORK_FROM_HOME) return { ...base, category: 'Worked', wfh: true };
  if (choice === 'Worked') return { ...base, category: 'Worked', wfh: false };
  return { ...base, category: choice };
}

/**
 * What the page does after the preview: `unchanged` = nothing to save; `commit` = commit the same
 * entry at once (a current or future day without recorded work); `review` = open the batch review
 * dialog, which asks for the reason and for the conflict confirmation, or reports why the date
 * cannot change.
 */
export function labelPreviewOutcome(preview: DayBatchPreview): 'unchanged' | 'commit' | 'review' {
  if (preview.can_commit && preview.changed_count === 0) return 'unchanged';
  if (!preview.can_commit || preview.reason_required || preview.requires_conflict_confirmation) return 'review';
  return 'commit';
}
