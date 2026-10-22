import { type MouseEvent, type SubmitEvent, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { type DayCategory, type DayView, type LeaveKind, ownRequest, type Requester } from '../api.ts';
import { describeError, isStaleVersion } from './errors.ts';
import { LeaveDialog } from './LeaveDialog.tsx';
import { type LeaveInput, leaveSummary } from './leaveInputModel.ts';
import { buildDayEntryRequest, CATEGORIES, type DayFieldsDraft, dayFieldsDraft, otMismatchNotice } from './sessionModel.ts';

/** The kind as the summary row words it (the same words as the read-only view of a share). */
const KIND_WORD: Record<LeaveKind, string> = { vacation: 'vacation', sick: 'sick', ot: 'OT' };

/** The values of a draft as one comparable text; the bad-input flags count as false when absent, so typing and undoing is no edit. */
function draftKey(draft: DayFieldsDraft): string {
  const { category, leave, leaveKind, wfh, notes } = draft;
  return JSON.stringify([category, leave.hours, leave.minutes, leave.hoursBad === true, leave.minutesBad === true, leaveKind, wfh, notes]);
}

/**
 * Category, WFH, the summary row of the partial leave and notes. The partial leave (hours and minutes with its kind) is edited in
 * its own sub-dialog (`LeaveDialog`, U5-25): Done there writes only this form's draft, so the unsaved-edit guard of the page and
 * the reason field work as for any other field, and "Save day fields" is the one write. The hours and minutes become the same integer
 * leave minutes the day endpoint always took. The E-2 notice appears when the server reports that the day's OT-kind leave differs
 * from consumed OT leave; it informs only, and this form never spends, reserves or releases OT.
 *
 * "Save day fields" sits at the end of the form, except on the phone's bottom sheet (U5-26): there the sheet gives it a foot that
 * stays in view while the body scrolls (`footSlot`), and the button is drawn into that foot but still submits this form.
 */
export function DayFieldsForm({
  day,
  reason,
  reasonRequired,
  onSaved,
  onStale,
  onDirtyChange,
  footSlot,
  request = ownRequest,
}: {
  day: DayView;
  reason: string;
  reasonRequired: boolean;
  onSaved: (day: DayView) => void;
  onStale: () => void;
  /** Called when the fields start or stop differing from the day as loaded or last saved (the unsaved-edit guard of the page). */
  onDirtyChange?: (dirty: boolean) => void;
  /** Undefined: the Save button ends the form. An element: the button is drawn there (the phone sheet's foot). Null: that foot is not mounted yet. */
  footSlot?: HTMLElement | null;
  /** The route set the write goes through: the caller's own by default, a share's when editing for an owner. */
  request?: Requester;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => dayFieldsDraft(day));
  // What the fields held when the day was loaded or last saved; the draft differing from it is an unsaved edit.
  const [baseline, setBaseline] = useState(() => draftKey(dayFieldsDraft(day)));
  const dirty = draftKey(draft) !== baseline;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const [error, setError] = useState<string | null>(null);
  /** The Partial leave dialog, open or not, and the Change or Add button that opened it. */
  const [leaveDialog, setLeaveDialog] = useState<{ opener: HTMLElement } | null>(null);
  const [busy, setBusy] = useState(false);
  const mismatch = otMismatchNotice(day);
  const reasonMissing = reasonRequired && reason.trim() === '';
  const formId = `${id}-form`;
  const summaryId = `${id}-leave-summary`;
  const summary = leaveSummary(draft.leave, draft.leaveKind === '' ? null : KIND_WORD[draft.leaveKind]);
  const hasLeave = summary !== 'None';

  function openLeave(event: MouseEvent<HTMLButtonElement>) {
    setLeaveDialog({ opener: event.currentTarget });
  }

  /** Done: the dialog's fields become the draft; nothing is sent until "Save day fields". */
  function doneLeave(leave: LeaveInput, leaveKind: LeaveKind | '') {
    setDraft({ ...draft, leave, leaveKind });
    setLeaveDialog(null);
  }

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reasonMissing) return;
    // Only the leave can refuse here, and the dialog lets only readable leave into the draft; the check stays for the model's sake.
    const built = buildDayEntryRequest(draft, day.entry?.version ?? null, reason);
    if (!built.ok) {
      setError(built.message);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await request<DayView>('PUT', `/days/${day.work_date}`, built.request);
      setBaseline(draftKey(draft));
      onSaved(next);
    } catch (caught) {
      if (isStaleVersion(caught)) onStale();
      else setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  const saveButton = (
    <button type="submit" form={formId} disabled={busy || reasonMissing}>
      Save day fields
    </button>
  );

  return (
    <>
      <form id={formId} className="editor-form editor-section stack" onSubmit={save} aria-label="Day fields" noValidate>
        <h3>Category and leave</h3>
        {mismatch !== null && (
          <p className="warn-box" role="status" data-warning="ot-leave-mismatch">
            <strong>Notice.</strong> {mismatch}
          </p>
        )}
        {/* U-27: the select and the WFH box share a row; the box wraps below the select only when the row is too narrow. */}
        <div className="label-row">
          <label className="label-select">
            Category
            <select
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as DayCategory })}
              aria-describedby={day.category_source === 'default' ? `${id}-category-hint` : undefined}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="inline label-wfh">
            <input type="checkbox" checked={draft.wfh} onChange={(event) => setDraft({ ...draft, wfh: event.target.checked })} />
            Worked from home (WFH)
          </label>
        </div>
        {day.category_source === 'default' && (
          <p id={`${id}-category-hint`} className="muted hint">
            Calendar default. Saving records it as your choice.
          </p>
        )}
        {/* U5-25: the partial leave is one summary row; its hours, minutes and kind are edited in the Partial leave dialog. */}
        <div className="leave-summary" data-leave-summary>
          <p id={summaryId} className="leave-summary-text">
            <span>Partial leave</span>
            <span className="leave-summary-value mono">{summary}</span>
          </p>
          <button type="button" className="secondary" aria-describedby={summaryId} onClick={openLeave}>
            {hasLeave ? (
              <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M2.5 13.5l.8-3.4 7.6-7.6a1.5 1.5 0 012.1 2.1l-7.6 7.6-2.9.8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {hasLeave ? 'Change' : 'Add'}
          </button>
        </div>
        {/* B5: the Notes are the day's own note (printed in the Review's Category cell), not part of the partial leave. */}
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
        {footSlot === undefined && <div className="button-row editor-actions">{saveButton}</div>}
      </form>
      {footSlot instanceof HTMLElement && createPortal(saveButton, footSlot)}
      {/* Outside the form: a dialog's own form cannot nest in the day-fields form. */}
      {leaveDialog !== null && (
        <LeaveDialog
          workDate={day.work_date}
          leave={draft.leave}
          leaveKind={draft.leaveKind}
          hasLeave={hasLeave}
          opener={leaveDialog.opener}
          onDone={doneLeave}
          onCancel={() => setLeaveDialog(null)}
          onRemove={() => doneLeave({ hours: '0', minutes: '0' }, '')}
        />
      )}
    </>
  );
}
