import { DAY_CATEGORIES } from '../../domain/attendance.ts';
import type { DayCategory } from '../api.ts';

/**
 * Batch category edit controls, shown only in batch mode ("Change several days"): pick days, choose
 * a label, preview before anything is saved. "Done" leaves the mode.
 */
export function BatchBar({
  selectedCount,
  category,
  busy,
  onCategory,
  onSelectAll,
  onClear,
  onPreview,
  onDone,
  locked = false,
}: {
  selectedCount: number;
  category: DayCategory;
  busy: boolean;
  onCategory: (category: DayCategory) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onPreview: () => void;
  /** Leaves batch mode and clears the selection. */
  onDone: () => void;
  /** True for an imported period (F-2): every control is disabled; the reason is shown next to the period status. */
  locked?: boolean;
}) {
  return (
    <div className="batch-bar" role="group" aria-label="Batch category edit" aria-describedby={locked ? 'imported-reason' : undefined} data-locked={locked ? 'imported' : undefined}>
      <p className="batch-count" aria-live="polite">
        {selectedCount} {selectedCount === 1 ? 'day' : 'days'} selected
      </p>
      <label>
        Category for selected days
        <select value={category} disabled={locked} onChange={(event) => onCategory(event.target.value as DayCategory)}>
          {DAY_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="batch-actions">
        <button type="button" className="secondary" onClick={onSelectAll} disabled={locked}>
          Select all
        </button>
        <button type="button" className="secondary" onClick={onClear} disabled={locked || selectedCount === 0}>
          Clear
        </button>
        {!locked && (
          <button type="button" className="secondary" onClick={onDone}>
            Done
          </button>
        )}
        <button type="button" onClick={onPreview} disabled={locked || selectedCount === 0 || busy}>
          Preview changes
        </button>
      </div>
    </div>
  );
}
