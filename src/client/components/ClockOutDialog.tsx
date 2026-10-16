import { type KeyboardEvent, type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import { parseUtcInstant } from '../../domain/instants.ts';
import { api, ApiRequestError, type PolicyVersion, type Session } from '../api.ts';
import { applyBreakEdit, breakDateVisible } from './breakChipModel.ts';
import {
  addBreakRow,
  type BreakRowDraft,
  type BreakRowError,
  buildCheckOutDialogRequest,
  chooseBreakRowFold,
  editBreakRow,
  removeBreakRow,
  replaceBreakRowGap,
  serverBreakRowError,
  type SessionDialogDraft,
  sessionDialogDraftFromSession,
  sessionDialogIsDirty,
  setNoBreaks,
  suggestionRows,
} from './breakRowsModel.ts';
import { BreakRows } from './BreakRows.tsx';
import { BreakSubDialog } from './BreakSubDialog.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { describeError, isStaleVersion } from './errors.ts';
import { instantText } from './format.ts';
import { policyOn } from './sessionModel.ts';

/**
 * Check out with the break rows of the session dialog (WP5-UX3-T09, owner decision U-24; `BreakRows`, the "Break n" sub-dialog and
 * the T06 model) and the E-1 rules of Check out (R-01, R-02): an empty list with "Confirm no breaks taken" unticked omits `breaks`,
 * so the session is checked out with its breaks not confirmed; listed rows or the ticked box confirm the breaks and replace the
 * saved rows (`buildCheckOutDialogRequest`). Check out is its own explicit act: the submit button says which of the three it does,
 * and there is neither the "No breaks listed" notice nor a second confirmation. Leaving without checking out (Cancel, Escape and the
 * browser's close request) asks "Discard your changes?" when the rows or the box changed (owner decision U-26, as in the session
 * dialog) and closes at once when nothing changed; that question is not a confirmation of the check-out.
 *
 * The running session's version goes with the request, so a session changed elsewhere answers 409 stale_version instead of being
 * overwritten. The server ends the session at its own current second, so the session has no end yet: a break row always has its own
 * date field (`breakDateVisible` with an empty end date), as for any session without an end. A server refusal that names a break
 * (`break_index`) marks that row, or its chip. The sub-dialog is rendered outside the form so that Enter in it never checks out.
 */
export function ClockOutDialog({
  session,
  displayZone,
  onDone,
  onStale,
  onClose,
}: {
  session: Session;
  displayZone: string;
  onDone: () => void;
  /** Called after a stale-version answer when the user chooses to reload. */
  onStale: () => void;
  onClose: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const addBreak = useRef<HTMLButtonElement>(null);
  const keys = useRef(0);
  /** The draft just before "Add break" added a row, so Cancel in that row's sub-dialog can restore it exactly. */
  const beforeAdd = useRef<SessionDialogDraft | null>(null);
  const [starting] = useState<SessionDialogDraft>(() => sessionDialogDraftFromSession(session));
  const [draft, setDraft] = useState<SessionDialogDraft>(starting);
  /** The "Discard your changes?" question while it is open, with the control to return focus to. */
  const [discard, setDiscard] = useState<{ opener: HTMLElement | null } | null>(null);
  const [policies, setPolicies] = useState<PolicyVersion[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<ReadonlyMap<string, BreakRowError>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [reasonNeeded, setReasonNeeded] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  /** The break chip whose "Break n" sub-dialog is open, and whether its row was just added. */
  const [sub, setSub] = useState<{ key: string; isNew: boolean } | null>(null);
  /** Counts the refused check-outs with marked rows; the break list moves focus to the first marked chip on each. */
  const [errorFocus, setErrorFocus] = useState(0);
  /** Where focus goes once the sub-dialog is gone: a chip by row key, else "Add break". */
  const [chipFocus, setChipFocus] = useState<{ count: number; key: string | null }>({ count: 0, key: null });

  useEffect(() => {
    const element = dialog.current;
    if (element !== null && !element.open) element.showModal();
    api<{ policies: PolicyVersion[] }>('GET', '/api/policies')
      .then((response) => setPolicies(response.policies))
      .catch(() => setPolicies([]));
  }, []);

  // The sub-dialog is already out of the document here, so the page behind is no longer inert.
  useEffect(() => {
    if (chipFocus.count === 0) return;
    const chip = chipFocus.key === null ? null : dialog.current?.querySelector<HTMLElement>(`[data-chip-key="${CSS.escape(chipFocus.key)}"]`);
    (chip ?? addBreak.current)?.focus();
  }, [chipFocus]);

  const policy = policies === null ? undefined : policyOn(policies, session.work_date);
  const zone = session.input_zone;
  // A running session has no end yet, so its breaks keep their own date field.
  const showBreakDate = breakDateVisible(draft.start.date, '');
  const subIndex = sub === null ? -1 : draft.rows.findIndex((row) => row.key === sub.key);
  const subRow = subIndex < 0 ? undefined : draft.rows[subIndex];
  const reasonMissing = reasonNeeded && reason.trim() === '';
  const submitLabel = draft.noBreaks ? 'Check out, no breaks taken' : draft.rows.length > 0 ? 'Check out with these breaks' : 'Check out, breaks unconfirmed';

  function withoutRowError(key: string) {
    if (!rowErrors.has(key)) return;
    const next = new Map(rowErrors);
    next.delete(key);
    setRowErrors(next);
  }

  function suggest() {
    setError(null);
    if (policy === undefined) {
      setNote('No work policy is effective on this date, so no breaks can be suggested.');
      return;
    }
    const rows = suggestionRows(policy, parseUtcInstant(session.start_utc), null, zone, (index) => `suggest-${keys.current}-${index}`);
    keys.current += 1;
    if (rows.length === 0) {
      setNote('No suggested break applies to this session.');
      return;
    }
    setRowErrors(new Map());
    setNote('Suggested from your arrival. A break that ends later than the check-out time is refused.');
    setDraft({ ...draft, rows, noBreaks: false, breaksEdited: true });
  }

  /** The "Break n" sub-dialog ended: close it and put focus where the flow decided (null: "Add break"). */
  function closeSub(focusKey: string | null) {
    setSub(null);
    setChipFocus((value) => ({ count: value.count + 1, key: focusKey }));
  }

  function doneSub(key: string, edited: BreakRowDraft) {
    setDraft(applyBreakEdit(draft, key, edited));
    withoutRowError(key);
    closeSub(key);
  }

  /** Cancel discards the edit; a row that was only just added by "Add break" goes with it, and the draft is as it was before. */
  function cancelSub(key: string, isNew: boolean) {
    if (isNew) {
      setDraft(beforeAdd.current ?? removeBreakRow(draft, key));
      closeSub(null);
    } else {
      closeSub(key);
    }
  }

  /** Remove: focus goes to the next chip, else the previous, else "Add break". */
  function removeSub(key: string) {
    const at = draft.rows.findIndex((row) => row.key === key);
    const neighbour = draft.rows[at + 1] ?? draft.rows[at - 1];
    setRowErrors(new Map());
    setDraft(removeBreakRow(draft, key));
    closeSub(neighbour === undefined ? null : neighbour.key);
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || stale || reasonMissing) return;
    setError(null);
    setRowErrors(new Map());
    const built = buildCheckOutDialogRequest({
      session,
      rows: draft.rows,
      noBreaks: draft.noBreaks,
      expectedVersion: session.version,
      reason,
    });
    if (!built.ok) {
      if (built.message !== null) setError(built.message);
      setRowErrors(new Map(built.rowErrors.map((item) => [item.key, item])));
      if (built.rowErrors.length > 0) setErrorFocus((value) => value + 1);
      return;
    }
    setBusy(true);
    try {
      await api('POST', '/api/clock/out', built.request);
      onDone();
    } catch (caught) {
      if (isStaleVersion(caught)) setStale(true);
      else {
        if (caught instanceof ApiRequestError) {
          if (caught.code === 'reason_required') setReasonNeeded(true);
          const rowError = serverBreakRowError(caught.code, caught.details, { rows: draft.rows, noBreaks: draft.noBreaks });
          if (rowError !== null) {
            setRowErrors(new Map([[rowError.key, rowError]]));
            setErrorFocus((value) => value + 1);
            return;
          }
        }
        setError(describeError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  /** Cancel, Escape and the browser's close request: ask first when the rows or the box changed (U-26), else close at once. */
  function requestClose(opener: HTMLElement | null) {
    if (discard !== null || busy) return;
    if (sessionDialogIsDirty(starting, draft)) setDiscard({ opener });
    else onClose();
  }

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Escape') return;
    // An Escape typed inside a dialog nested in this one (the "Break n" sub-dialog or the question) belongs to that dialog.
    if (event.target instanceof Element && event.target.closest('dialog') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    requestClose(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  }

  return (
    <dialog
      ref={dialog}
      className="dialog dialog-wide"
      aria-labelledby="clock-out-title"
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requestClose(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      }}
      onClose={onClose}
    >
      <form className="stack" onSubmit={submit} noValidate>
        <h2 id="clock-out-title">Check out</h2>
        <p>
          Running since <span className="mono">{instantText(session.start_utc, displayZone)}</span> ({displayZone}), accounting
          date <span className="mono">{session.work_date}</span>, entered in {session.input_zone}.
        </p>
        <section className="session-dialog-section" aria-labelledby={`${id}-breaks`}>
          <h3 id={`${id}-breaks`}>Breaks</h3>
          <BreakRows
            rows={draft.rows}
            noBreaks={draft.noBreaks}
            zone={zone}
            showDate={showBreakDate}
            errors={rowErrors}
            focusErrors={errorFocus}
            note={note}
            action="Checking out"
            addBreak={addBreak}
            onEdit={(key, patch) => {
              setDraft(editBreakRow(draft, key, patch));
              withoutRowError(key);
            }}
            onAdd={() => {
              keys.current += 1;
              const key = `new-${keys.current}`;
              beforeAdd.current = draft;
              setRowErrors(new Map());
              setDraft(addBreakRow(draft, key));
              return key;
            }}
            onOpenBreak={(key, isNew) => setSub({ key, isNew })}
            onRemove={(key) => {
              setRowErrors(new Map());
              setDraft(removeBreakRow(draft, key));
            }}
            onNoBreaks={(checked) => {
              setRowErrors(new Map());
              setDraft(setNoBreaks(draft, checked));
            }}
            onSuggest={suggest}
            onFold={(key, fold) => setDraft(chooseBreakRowFold(draft, key, fold))}
            onGap={(key, found) => {
              setDraft(replaceBreakRowGap(draft, key, found));
              withoutRowError(key);
            }}
          />
        </section>
        {reasonNeeded && (
          <label>
            Reason for editing an old or finalized period
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={500} required />
          </label>
        )}
        {stale && (
          <div className="stale" role="alert">
            <p>This session changed since it was loaded. Nothing was saved. Reload to review the latest session, then check out again.</p>
            <button type="button" onClick={onStale}>
              Reload
            </button>
          </div>
        )}
        {rowErrors.size > 0 && (
          <p className="error" role="alert">
            {rowErrors.size === 1 ? 'A break cannot be saved as it is.' : 'Some breaks cannot be saved as they are.'} Check the breaks marked above.
          </p>
        )}
        {error !== null && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {reasonMissing && <p className="muted hint">Enter a reason for this old period above to check out.</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={(event) => requestClose(event.currentTarget)}>
            Cancel
          </button>
          <button type="submit" disabled={busy || stale || reasonMissing}>
            {submitLabel}
          </button>
        </div>
      </form>
      {sub !== null && subRow !== undefined && discard === null && (
        <BreakSubDialog
          key={sub.key}
          row={subRow}
          index={subIndex}
          zone={zone}
          showDate={showBreakDate}
          message={rowErrors.get(sub.key)?.message ?? null}
          onDone={(edited) => doneSub(sub.key, edited)}
          onCancel={() => cancelSub(sub.key, sub.isNew)}
          onRemove={() => removeSub(sub.key)}
        />
      )}
      {discard !== null && (
        <ConfirmDialog
          title="Discard your changes?"
          message="You changed the breaks of this check-out. If you leave now, nothing is saved and the session keeps running."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          tone="danger"
          opener={discard.opener}
          onConfirm={onClose}
          onCancel={() => setDiscard(null)}
        />
      )}
    </dialog>
  );
}
