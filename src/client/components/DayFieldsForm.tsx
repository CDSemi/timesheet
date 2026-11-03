import { type MouseEvent, type SubmitEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type DayCategory, type DayView, type LeaveKind, ownRequest, type Requester } from '../api.ts';
import { type DefaultChange, defaultChangeOf, describeError, isStaleVersion } from './errors.ts';
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
 * R-UX5I2-3: the form remembers the calendar default it showed when it mounted (`shownDefault`, state, never the live prop) and sends
 * it with every save. When the server answers 409 `default_changed` (the default moved since, e.g. an administrator's holiday import),
 * nothing was saved and a notice offers the owner's two choices: "Use {new default}" (the category follows the calendar; nothing is sent)
 * or "Save {category} anyway" (the same save, naming the new default). Every typed field is kept.
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
  onDefaultTaken,
  onDirtyChange,
  footSlot,
  request = ownRequest,
}: {
  day: DayView;
  reason: string;
  reasonRequired: boolean;
  onSaved: (day: DayView) => void;
  onStale: () => void;
  /** Called after "Use {default}": the day behind the form now takes the new calendar default (the page refreshes and the editor reads the day). */
  onDefaultTaken?: (category: DayCategory) => void;
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
  // A layout effect: the report reaches the page's unsaved-edit flag in the task of the edit itself, so an Escape that follows the keystroke
  // at once already finds the flag set (a passive effect hands the report on in a later task, and that Escape would close without asking).
  useLayoutEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const [error, setError] = useState<string | null>(null);
  /** The calendar default this form showed when it mounted (null: none); sent with every save, so a later change of the calendar is seen by the server. */
  const [shownDefault, setShownDefault] = useState<DayCategory | null>(() => day.default_category);
  /** The refused save of a changed calendar default, until a choice is made, the save is stale or the form remounts. */
  const [defaultNotice, setDefaultNotice] = useState<DefaultChange | null>(null);
  /** The polite status after "Use {default}". */
  const [status, setStatus] = useState<string | null>(null);
  const categorySelect = useRef<HTMLSelectElement>(null);
  const noticeBox = useRef<HTMLDivElement>(null);
  // The notice is announced (role alert) and takes focus, scrolled into view so the phone sheet's foot does not hide it.
  useEffect(() => {
    if (defaultNotice === null) return;
    noticeBox.current?.focus();
    noticeBox.current?.scrollIntoView({ block: 'nearest' });
  }, [defaultNotice]);
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

  /** The one write: the current draft, the live entry version, the reason and the default `shown` names (the mount-time default, or the new one after "Save anyway"). */
  async function write(shown: DayCategory | null, fromNotice: boolean) {
    if (reasonMissing) return;
    // Only the leave can refuse here, and the dialog lets only readable leave into the draft; the check stays for the model's sake.
    const built = buildDayEntryRequest(draft, day.entry?.version ?? null, reason, shown);
    if (!built.ok) {
      setError(built.message);
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const next = await request<DayView>('PUT', `/days/${day.work_date}`, built.request);
      setBaseline(draftKey(draft));
      // The button that was pressed leaves with the notice: focus goes to the field the choice was about.
      if (fromNotice) categorySelect.current?.focus();
      setDefaultNotice(null);
      onSaved(next);
    } catch (caught) {
      const change = defaultChangeOf(caught);
      if (isStaleVersion(caught)) {
        setDefaultNotice(null);
        onStale();
      } else if (change !== null) {
        setDefaultNotice(change);
      } else {
        setError(describeError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void write(shownDefault, false);
  }

  /** "Save {category} anyway": the same save naming the new default, so the person's category is recorded over it. */
  function saveAnyway(change: DefaultChange) {
    setShownDefault(change.current);
    void write(change.current, true);
  }

  /** "Use {default}": nothing is sent. The category follows the calendar, every other typed field stays, and what is typed is the only unsaved edit. */
  function useDefault(change: DefaultChange) {
    const next = { ...draft, category: change.current };
    const rebased = draftKey({ ...dayFieldsDraft(day), category: change.current });
    setDraft(next);
    setShownDefault(change.current);
    setBaseline(rebased);
    setDefaultNotice(null);
    setError(null);
    setStatus(
      `Category set to ${change.current}, the calendar default now. ${
        draftKey(next) === rebased ? 'Nothing needs saving.' : 'Save day fields to keep your other changes.'
      }`,
    );
    categorySelect.current?.focus();
    onDefaultTaken?.(change.current);
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
        {defaultNotice !== null && (
          <div className="stale" role="alert" tabIndex={-1} ref={noticeBox} data-warning="default-changed">
            <p>
              <strong>Notice.</strong> The calendar default for this day changed from {defaultNotice.expected ?? 'none'} to{' '}
              {defaultNotice.current} since it was loaded. Nothing was saved. Use the new default, or save your category over it.
            </p>
            <div className="button-row">
              <button type="button" className="secondary" disabled={busy} onClick={() => useDefault(defaultNotice)}>
                Use {defaultNotice.current}
              </button>
              <button type="button" disabled={busy || reasonMissing} onClick={() => saveAnyway(defaultNotice)}>
                Save {draft.category} anyway
              </button>
            </div>
          </div>
        )}
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
              ref={categorySelect}
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
        {status !== null && (
          <p className="muted hint" role="status">
            {status}
          </p>
        )}
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
