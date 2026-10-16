import { breakChipText } from './breakChipModel.ts';
import type { BreakRowDraft } from './breakRowsModel.ts';

/**
 * One break as a text chip (WP5-UX3-T08B, owner decision N-1), shown where the rows no longer fit the list: a full-width 44px
 * button that reads `Break 1 · 10:00 → 10:15` in 24 hours (the start date too for an overnight session), the "suggested" tag
 * while the row is untouched and a chevron. Pressing it opens the "Break n" sub-dialog. The arrow is decoration (`aria-hidden`,
 * with a hidden "to" beside it). The accessible name comes from the content (WP5-UX3-FIX1): a hidden "Edit" before the visible
 * words, `Edit Break 1 · 10:00 to 10:15 suggested`, like the day buttons ("Edit 10/04 ..."), so the name carries every visible
 * word in order and the action (SC 2.5.3). An explicit name with "to" between the times was flagged by axe
 * (label-content-name-mismatch: the visible words were no longer one run in it), and a hidden ", edit" at the end reads
 * "suggested , edit" (a hidden span is a block, so the browser adds a space before it).
 */
export function BreakChip({
  row,
  index,
  zone,
  overnight,
  suggested,
  describedBy,
  chipRef,
  onOpen,
}: {
  row: BreakRowDraft;
  index: number;
  zone: string;
  /** True when the date field is shown, so the chip names the start date. */
  overnight: boolean;
  suggested: boolean;
  /** The id of the message under the chip, when the row cannot be saved. */
  describedBy: string | undefined;
  /** Lets the list focus this chip (after a refused Save, or when its sub-dialog closes). */
  chipRef: (element: HTMLButtonElement | null) => void;
  onOpen: () => void;
}) {
  const chip = breakChipText(row, index, zone, overnight);
  return (
    <button
      ref={chipRef}
      type="button"
      className="secondary break-chip"
      data-chip-key={row.key}
      aria-describedby={describedBy}
      onClick={onOpen}
    >
      <span className="sr-only">Edit</span>
      <span className="break-chip-main">
        {chip.end === null ? (
          chip.text
        ) : (
          <>
            {`${chip.label} · ${chip.start ?? ''} `}
            <span aria-hidden="true">→</span>
            <span className="sr-only"> to </span>
            {` ${chip.end}`}
          </>
        )}
        {suggested && (
          <>
            {' '}
            <span className="break-tag">suggested</span>
          </>
        )}
      </span>
      <svg className="icon break-chip-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
