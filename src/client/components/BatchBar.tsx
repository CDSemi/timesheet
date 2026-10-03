import { DAY_CATEGORIES } from '../../domain/attendance.ts';
import type { DayCategory } from '../api.ts';

/** Batch category edit controls: pick days, choose a label, preview before anything is saved. */
export function BatchBar({
  selectedCount,
  category,
  busy,
  onCategory,
  onSelectAll,
  onClear,
  onPreview,
}: {
  selectedCount: number;
  category: DayCategory;
  busy: boolean;
  onCategory: (category: DayCategory) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="batch-bar" role="group" aria-label="Batch category edit">
      <p className="batch-count" aria-live="polite">
        {selectedCount} {selectedCount === 1 ? 'day' : 'days'} selected
      </p>
      <label>
        Category for selected days
        <select value={category} onChange={(event) => onCategory(event.target.value as DayCategory)}>
          {DAY_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="batch-actions">
        <button type="button" className="secondary" onClick={onSelectAll}>
          Select all
        </button>
        <button type="button" className="secondary" onClick={onClear} disabled={selectedCount === 0}>
          Clear
        </button>
        <button type="button" onClick={onPreview} disabled={selectedCount === 0 || busy}>
          Preview changes
        </button>
      </div>
    </div>
  );
}
