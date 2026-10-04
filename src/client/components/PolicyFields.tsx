import type { DeficitMode } from '../api.ts';
import { DEFICIT_MODE_LABELS, newBreakDraft, type BreakDraft, type PolicyDraft } from './policyModel.ts';

/** The editable fields of one policy version: rules, reference schedule and the break list. */
export function PolicyFields({ draft, onChange }: { draft: PolicyDraft; onChange: (next: PolicyDraft) => void }) {
  const set = <K extends keyof PolicyDraft>(key: K, value: PolicyDraft[K]) => onChange({ ...draft, [key]: value });
  const setBreak = (rowKey: number, patch: Partial<BreakDraft>) =>
    set(
      'breaks',
      draft.breaks.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
    );

  return (
    <>
      <div className="field-grid">
        <label>
          Effective from
          <input type="date" value={draft.effectiveFrom} onChange={(event) => set('effectiveFrom', event.target.value)} required />
        </label>
        <label>
          Required minutes per day
          <input inputMode="numeric" value={draft.required} onChange={(event) => set('required', event.target.value)} required />
        </label>
        <label>
          Threshold minutes
          <input inputMode="numeric" value={draft.threshold} onChange={(event) => set('threshold', event.target.value)} required />
        </label>
        <label>
          Rounding step minutes
          <input inputMode="numeric" value={draft.rounding} onChange={(event) => set('rounding', event.target.value)} required />
        </label>
        <label>
          Reference start
          <input type="time" value={draft.referenceStart} onChange={(event) => set('referenceStart', event.target.value)} required />
        </label>
        <label>
          Reference end
          <input type="time" value={draft.referenceEnd} onChange={(event) => set('referenceEnd', event.target.value)} required />
        </label>
      </div>
      <label>
        When a day falls short
        <select value={draft.deficitMode} onChange={(event) => set('deficitMode', event.target.value as DeficitMode)}>
          {(Object.keys(DEFICIT_MODE_LABELS) as DeficitMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {DEFICIT_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="breaks">
        <legend>Breaks, counted from the first clock-in</legend>
        {draft.breaks.length === 0 && <p className="muted">No breaks are configured.</p>}
        {draft.breaks.map((row, index) => (
          <div key={row.rowKey} className="break-row" data-break-row={index + 1}>
            <label>
              Start offset (minutes)
              <input inputMode="numeric" value={row.startOffset} onChange={(event) => setBreak(row.rowKey, { startOffset: event.target.value })} />
            </label>
            <label>
              Duration (minutes)
              <input inputMode="numeric" value={row.duration} onChange={(event) => setBreak(row.rowKey, { duration: event.target.value })} />
            </label>
            <label className="inline">
              <input type="checkbox" checked={row.countsAsWork} onChange={(event) => setBreak(row.rowKey, { countsAsWork: event.target.checked })} />
              Counts as work
            </label>
            <button type="button" className="secondary" onClick={() => set('breaks', draft.breaks.filter((item) => item.rowKey !== row.rowKey))}>
              Remove break {index + 1}
            </button>
          </div>
        ))}
        <div className="button-row">
          <button type="button" className="secondary" onClick={() => set('breaks', [...draft.breaks, newBreakDraft()])}>
            Add break
          </button>
        </div>
      </fieldset>
      <label>
        Note (optional)
        <input value={draft.note} onChange={(event) => set('note', event.target.value)} maxLength={500} />
      </label>
    </>
  );
}
