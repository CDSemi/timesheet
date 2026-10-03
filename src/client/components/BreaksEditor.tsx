import { LocalTimeField } from './LocalTimeField.tsx';
import { type BreakRow, type BreaksMode, emptyField } from './sessionModel.ts';

let rowCounter = 0;

/** A key for a row the editor adds; saved and suggested rows get their own keys. */
export function newRowKey(): string {
  rowCounter += 1;
  return `row-${rowCounter}`;
}

const MODES: ReadonlyArray<{ mode: BreaksMode; label: string; hint: string }> = [
  { mode: 'pending', label: 'Breaks not confirmed yet', hint: 'The day stays pending OT until you confirm breaks or none.' },
  { mode: 'confirmed', label: 'Breaks confirmed as listed', hint: 'The listed breaks are the actual ones.' },
  { mode: 'none', label: 'No breaks taken', hint: 'You confirm that no unpaid break was taken.' },
];

/**
 * Break list with the three outcomes of R-02: unknown stays pending, the listed breaks are
 * confirmed (suggested ones as they are, or edited), or none were taken. Suggested breaks
 * shift with the arrival and are never confirmed on their own.
 */
export function BreaksEditor({
  idPrefix,
  defaultDate,
  rows,
  mode,
  suggestNote,
  onChange,
  onSuggest,
}: {
  idPrefix: string;
  /** The date a new break starts on until the user changes it. */
  defaultDate: string;
  rows: BreakRow[];
  mode: BreaksMode;
  suggestNote: string | null;
  onChange: (rows: BreakRow[], mode: BreaksMode) => void;
  onSuggest: () => void;
}) {
  const name = `${idPrefix}-breaks-mode`;

  function pickMode(next: BreaksMode) {
    onChange(next === 'none' ? [] : rows, next);
  }

  function patchRow(key: string, patch: Partial<BreakRow>) {
    onChange(
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
      mode,
    );
  }

  return (
    <fieldset className="breaks">
      <legend>Breaks</legend>
      <div className="mode-list">
        {MODES.map((option) => (
          <label key={option.mode} className="inline">
            <input type="radio" name={name} checked={mode === option.mode} onChange={() => pickMode(option.mode)} />
            <span>
              {option.label}
              <span className="muted hint block">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="button-row">
        <button type="button" className="secondary" onClick={onSuggest}>
          Suggest breaks
        </button>
        {mode === 'pending' && rows.length > 0 && (
          <button type="button" className="secondary" onClick={() => onChange(rows, 'confirmed')}>
            Confirm suggested breaks
          </button>
        )}
        {mode !== 'none' && (
          <button
            type="button"
            className="secondary"
            onClick={() =>
              onChange(
                [...rows, { key: newRowKey(), start: emptyField(defaultDate), end: emptyField(defaultDate), countsAsWork: false }],
                mode,
              )
            }
          >
            Add break
          </button>
        )}
      </div>
      {suggestNote !== null && <p className="muted hint">{suggestNote}</p>}
      {mode !== 'none' && rows.length === 0 && <p className="muted hint">No breaks listed.</p>}
      {mode !== 'none' && (
        <ul className="plain break-list">
          {rows.map((row, index) => (
            <li key={row.key} className="break-row" data-break={index + 1}>
              <LocalTimeField label={`Break ${index + 1} from`} field={row.start} onChange={(start) => patchRow(row.key, { start })} />
              <LocalTimeField label={`Break ${index + 1} to`} field={row.end} onChange={(end) => patchRow(row.key, { end })} />
              <label className="inline">
                <input type="checkbox" checked={row.countsAsWork} onChange={(event) => patchRow(row.key, { countsAsWork: event.target.checked })} />
                Counts as work
              </label>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  onChange(
                    rows.filter((item) => item.key !== row.key),
                    mode,
                  )
                }
                aria-label={`Remove break ${index + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
