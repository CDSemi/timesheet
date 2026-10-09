import { type SubmitEvent, useId, useState } from 'react';
import { type DayCategory, type DayView, type LeaveKind, ownRequest, type Requester } from '../api.ts';
import { describeError, isStaleVersion } from './errors.ts';
import { LEAVE_MAX_HOURS } from './leaveInputModel.ts';
import { buildDayEntryRequest, CATEGORIES, dayFieldsDraft, LEAVE_KINDS, leaveHint, otMismatchNotice } from './sessionModel.ts';

const KIND_TEXT: Record<LeaveKind, string> = { vacation: 'Vacation', sick: 'Sick', ot: 'OT' };

/**
 * Label (category), partial leave typed as hours and minutes with its kind, WFH and notes. The
 * hours and minutes become the same integer leave minutes the day endpoint always took. The E-2
 * notice appears when the server reports that the day's OT-kind leave differs from consumed OT
 * leave; it informs only, and this form never spends, reserves or releases OT.
 */
export function DayFieldsForm({
  day,
  reason,
  reasonRequired,
  onSaved,
  onStale,
  request = ownRequest,
}: {
  day: DayView;
  reason: string;
  reasonRequired: boolean;
  onSaved: (day: DayView) => void;
  onStale: () => void;
  /** The route set the write goes through: the caller's own by default, a share's when editing for an owner. */
  request?: Requester;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => dayFieldsDraft(day));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mismatch = otMismatchNotice(day);
  const reasonMissing = reasonRequired && reason.trim() === '';
  const hint = leaveHint(draft.leave);

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reasonMissing) return;
    const built = buildDayEntryRequest(draft, day.entry?.version ?? null, reason);
    if (!built.ok) {
      setError(built.message);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onSaved(await request<DayView>('PUT', `/days/${day.work_date}`, built.request));
    } catch (caught) {
      if (isStaleVersion(caught)) onStale();
      else setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    // noValidate: the leave fields are checked by parseLeaveInput, whose message is shown in the form (role alert).
    <form className="editor-form editor-section stack" onSubmit={save} aria-label="Day fields" noValidate>
      <h3>Label and leave</h3>
      {mismatch !== null && (
        <p className="warn-box" role="status" data-warning="ot-leave-mismatch">
          <strong>Notice.</strong> {mismatch}
        </p>
      )}
      <div className="label-row">
        <label>
          Label
          <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as DayCategory })}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {day.category_source === 'default' && <span className="muted hint">Calendar default. Saving records it as your choice.</span>}
        </label>
        <label className="inline">
          <input type="checkbox" checked={draft.wfh} onChange={(event) => setDraft({ ...draft, wfh: event.target.checked })} />
          Worked from home (WFH)
        </label>
      </div>
      <fieldset className="leave-fields" aria-describedby={`${id}-leave-hint`}>
        <legend>Partial leave</legend>
        <div className="leave-grid">
          <label>
            Leave hours
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={LEAVE_MAX_HOURS}
              step={1}
              value={draft.leave.hours}
              onChange={(event) => setDraft({ ...draft, leave: { ...draft.leave, hours: event.target.value } })}
            />
          </label>
          <label>
            Leave minutes
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              step={1}
              value={draft.leave.minutes}
              onChange={(event) => setDraft({ ...draft, leave: { ...draft.leave, minutes: event.target.value } })}
            />
          </label>
          <label>
            Leave kind
            <select value={draft.leaveKind} onChange={(event) => setDraft({ ...draft, leaveKind: event.target.value as LeaveKind | '' })}>
              <option value="">Not set</option>
              {LEAVE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_TEXT[kind]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p id={`${id}-leave-hint`} className="muted hint">
          {hint === null ? 'Hours and minutes, at most 24h 00m.' : `Leave ${hint}.`} A kind is required with leave. It never reserves or spends OT.
        </p>
      </fieldset>
      <label>
        Notes
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={2} maxLength={2000} />
      </label>
      {error !== null && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {reasonMissing && <p className="muted hint">Enter a reason for this old period above to save.</p>}
      <div className="button-row editor-actions">
        <button type="submit" disabled={busy || reasonMissing}>
          Save day fields
        </button>
      </div>
    </form>
  );
}
