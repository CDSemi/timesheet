import { type KeyboardEvent, type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import { diffDays, isCivilDate } from '../../domain/dates.ts';
import type { EpochSeconds } from '../../domain/instants.ts';
import {
  ApiRequestError,
  type DayView,
  type PolicyVersion,
  type Requester,
  type Session,
  type SessionRequest,
  type SessionResponse,
} from '../api.ts';
import {
  addBreakRow,
  applyReferenceHours,
  type BreakRowDraft,
  type BreakRowError,
  breaksSummary,
  buildSessionDialogRequest,
  changeDialogZone,
  chooseBreakRowFold,
  confirmBreaksRows,
  editBreakRow,
  endRunningDraft,
  newSessionDialogDraft,
  referenceHours,
  removeBreakRow,
  replaceBreakRowGap,
  reshiftSuggestions,
  runningBreaksSummary,
  serverBreakRowError,
  type SessionDialogBuild,
  type SessionDialogDraft,
  sessionDialogDraftFromSession,
  sessionDialogIsDirty,
  setNoBreaks,
  type SuggestionContext,
  suggestionRows,
} from './breakRowsModel.ts';
import { AlertDialog } from './AlertDialog.tsx';
import { applyBreakEdit, breakDateVisible, followSessionDate } from './breakChipModel.ts';
import { BreakRows } from './BreakRows.tsx';
import { BreakSubDialog } from './BreakSubDialog.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import {
  type ConfirmFact,
  editorTitle,
  messageFailure,
  requestFailure,
  SAVE_FAILED_TITLE,
  type SaveFailure,
  rowsFailure,
} from './dayEditorModel.ts';
import { isStaleVersion } from './errors.ts';
import { usShortDate } from './format.ts';
import { timeRange } from './sheetModel.ts';
import { LocalTimeField } from './LocalTimeField.tsx';
import {
  emptyField,
  fieldLocal,
  gapReplacement,
  type LocalField,
  resolveStart,
  type TimeProblem,
  timeProblemOf,
} from './sessionModel.ts';
import { TimeProblemPrompt } from './TimeProblemPrompt.tsx';

/* ---- Pure helpers of the dialog ---------------------------------------------------------------------------------------- */

/** A typed field resolved in a zone with the shared resolver; null when it is empty or cannot be placed. */
function fieldInstant(field: LocalField, zone: string): EpochSeconds | null {
  const resolved = resolveStart({ zone, start: field, end: emptyField(''), breaks: [], mode: 'pending' });
  return resolved.ok ? resolved.utc : null;
}

/** True while the field still holds the local time a problem names and is not pinned by an offset. */
function holds(field: LocalField, problem: TimeProblem): boolean {
  return fieldLocal(field) === problem.local && field.offset === null;
}

/**
 * The Time line of the Save confirmation: `08:00 - 17:00 (America/Los_Angeles)`, the start date when it is not the accounting date, `+1`
 * for a later end date; `07:45 - running (America/Los_Angeles)` for a session that has no end yet.
 */
function timeFact(draft: SessionDialogDraft, workDate: string): string {
  const { start, end } = draft;
  const prefix = start.date === workDate || !isCivilDate(start.date) ? '' : `${usShortDate(start.date)} `;
  if (draft.running) return `${prefix}${start.time.slice(0, 5)} - running (${draft.zone.trim()})`;
  const later = isCivilDate(start.date) && isCivilDate(end.date) ? diffDays(end.date, start.date) : 0;
  return `${prefix}${timeRange(start.time.slice(0, 5), end.time.slice(0, 5), { later })} (${draft.zone.trim()})`;
}

type Prefill = 'hours' | 'hours-breaks' | null;

interface Starting {
  draft: SessionDialogDraft;
  prefill: Prefill;
}

/* ---- The G-4 notice ---------------------------------------------------------------------------------------------------- */

/**
 * "No breaks listed" (owner variant of G-4): shown when Save is pressed with an empty list and the box unticked. Three stacked
 * choices; "Go back and add breaks" takes the initial focus and Escape means the same. Like `ConfirmDialog` it is a modal on
 * top of the session dialog that handles its own `cancel` event and keeps its Escape from reaching the dialogs below.
 */
function NoBreaksNotice({ onConfirmNone, onLeaveUnconfirmed, onGoBack }: { onConfirmNone: () => void; onLeaveUnconfirmed: () => void; onGoBack: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    back.current?.focus();
  }, []);

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') event.stopPropagation();
  }

  return (
    <dialog
      ref={dialog}
      role="alertdialog"
      className="dialog confirm-dialog no-breaks-notice"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message ${id}-hint`}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onGoBack();
      }}
    >
      <div className="confirm-head">
        <h2 id={`${id}-title`}>No breaks listed</h2>
      </div>
      <div className="confirm-body stack">
        <p id={`${id}-message`} className="confirm-message">
          This session has no breaks listed, and &quot;Confirm no breaks taken&quot; is not ticked. What do you want to do?
        </p>
        <div className="notice-choices">
          <button type="button" onClick={onConfirmNone}>
            Confirm no breaks taken
          </button>
          <button type="button" className="secondary" onClick={onLeaveUnconfirmed}>
            Leave breaks unconfirmed for now
          </button>
          <button ref={back} type="button" className="secondary" onClick={onGoBack}>
            Go back and add breaks
          </button>
        </div>
        <p id={`${id}-hint`} className="muted hint">
          Unconfirmed breaks keep OT for this day pending until you confirm them.
        </p>
      </div>
    </dialog>
  );
}

/* ---- The session dialog ------------------------------------------------------------------------------------------------ */

type Step =
  | { kind: 'edit' }
  | { kind: 'notice' }
  | { kind: 'confirm'; request: SessionRequest; message: string; facts: ConfirmFact[]; sent: { rows: readonly BreakRowDraft[]; noBreaks: boolean } }
  | { kind: 'alert'; failure: SaveFailure }
  | { kind: 'discard'; opener: HTMLElement | null };

const CONFIRMS_SENTENCE = 'Saving confirms these breaks as the breaks you took.';
const UNCONFIRMED_SENTENCE = 'Unconfirmed breaks keep OT for this day pending until you confirm them.';
const RUNNING_SENTENCE = 'The session keeps running. You confirm the breaks when you check out.';

/** The text of the running session's Time section where the end would be (U4-11). */
const NO_END_TEXT = 'No end yet: this session is running.';

/**
 * New or edit time session (WP5-UX3-T08, owner decisions U-21 and U-23 to U-26, G-3 a, G-4 owner variant). A modal `<dialog>`
 * nested in the Day editor: 720px on a desktop, the full screen below 768px. Title "New session" or "Edit session", the
 * accounting date and the reporting zone under it; a "Time" section (the input zone and its explanation first, then the start and
 * the end with their own dates, each with its "Today" or "Now" link, and the overnight note) and a "Breaks" section (`BreakRows`).
 *
 * Running session (WP5-UX4-T03, U4-11): Edit on a session without an end opens the same dialog with the subtitle "running"; the end
 * is replaced by "No end yet: this session is running" and, for the owner only, "Set an end instead" (the way to close a forgotten
 * Check out; a grantee must never check the owner out, so a shared view has no such button). Its rows are checked against the start,
 * "Confirm no breaks taken" is not offered and Save sends `end: null` with the breaks never confirmed (Check out confirms them).
 *
 * A failed save (a server refusal, no answer, a form message or break rows that cannot be saved) opens `AlertDialog` "This session
 * was not saved" (U4-15); closing it moves focus to the first marked row, else Save. The row and field markers stay in the dialog.
 *
 * Pre-fill (new sessions only, when a policy is effective on the date): the reference hours as wall-clock times on the
 * accounting date in the reporting zone, shown in the input zone; for a date before the server's `today_local` (never the
 * device clock) also the suggested breaks inside them, which follow the start until a break row is changed. While the person
 * has not typed a time, another input zone shows the same reference hours in that zone.
 *
 * Save validates (the T06 model), then: with no break listed and the box unticked the "No breaks listed" notice, and always
 * the final "Save this session?" confirmation. Only after its Save is the existing `SessionRequest` sent (`allowUnconfirmed`
 * only for "Leave breaks unconfirmed for now"). Cancel, Escape and Close ask "Discard your changes?" when the draft changed.
 *
 * Break dates (WP5-UX3-T08B, owner answer Q6 b): a break row has its own date field only when the session crosses local midnight
 * in the input zone or has no end (`breakDateVisible`); otherwise every break is on the session start date and follows it when the
 * date or the input zone changes (`followSessionDate`, applied by `settle`). Where the break list is too narrow for the rows it
 * shows chips; a chip opens the "Break n" sub-dialog (`BreakSubDialog`), whose Done, Cancel and Remove edit the draft only.
 *
 * Nested dialogs (WP5-UX-B3-01): one modal on top at a time (this dialog, then the notice, a confirmation or the "Break n"
 * sub-dialog). This dialog handles its own `cancel` event and its own Escape, stops both from reaching the editor, and ignores an
 * Escape that belongs to a dialog nested in it. The editor returns focus to the button that opened it, or to "Times" after a save.
 */
export function SessionDialog({
  workDate,
  reportingZone,
  displayZone,
  zones,
  todayLocal,
  policy,
  session,
  confirmBreaks = false,
  shared = false,
  reason,
  reasonRequired,
  onReasonChange,
  onSaved,
  onStale,
  onClose,
  request,
}: {
  workDate: string;
  reportingZone: string;
  /** The zone times are shown in elsewhere; the input-zone hint names it. */
  displayZone: string;
  /** Zones offered for the input zone; the first is the default (the current display zone, R-07). */
  zones: readonly string[];
  /** The server's `today_local`; suggested breaks are pre-filled only before it. */
  todayLocal: string | null;
  policy: PolicyVersion | undefined;
  /** The session being edited; absent for a new one. */
  session?: Session;
  /** Opened by "Confirm breaks": a session without saved rows starts with the suggested breaks that fit inside it. */
  confirmBreaks?: boolean;
  /** True in a view of another person's timesheet (a share): a running session can then not be ended from here. */
  shared?: boolean;
  reason: string;
  reasonRequired: boolean;
  onReasonChange: (reason: string) => void;
  onSaved: (day: DayView) => void;
  onStale: () => void;
  /** Cancel or Discard: nothing was saved. */
  onClose: () => void;
  request: Requester;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);
  const addBreak = useRef<HTMLButtonElement>(null);
  const keys = useRef(0);
  /** The draft just before "Add break" added a row, so Cancel in that row's sub-dialog can restore it exactly. */
  const beforeAdd = useRef<SessionDialogDraft | null>(null);
  const isNew = session === undefined;
  const context: SuggestionContext = { workDate, todayLocal, policy, keyOf: (index) => `suggested-${index}` };

  const [starting] = useState<Starting>(() => {
    if (session === undefined) {
      const zone = zones[0] ?? displayZone;
      const blank = newSessionDialogDraft(workDate, zone);
      const hours = referenceHours(policy, workDate, reportingZone, zone);
      if (hours === null) return { draft: blank, prefill: null };
      const draft = reshiftSuggestions(applyReferenceHours(blank, hours), context);
      return { draft, prefill: draft.rows.length > 0 ? 'hours-breaks' : 'hours' };
    }
    const saved = sessionDialogDraftFromSession(session);
    if (!confirmBreaks) return { draft: saved, prefill: null };
    // "Confirm breaks" lists the suggested breaks that lie inside the session (docs/04), none when no suggestion fits.
    const rows = confirmBreaksRows(session, policy, (index) => `confirm-${session.id}-${index}`);
    return { draft: rows.length === 0 ? saved : { ...saved, rows }, prefill: null };
  });
  const [draft, setDraft] = useState<SessionDialogDraft>(starting.draft);
  const [timesTouched, setTimesTouched] = useState(false);
  const [step, setStep] = useState<Step>({ kind: 'edit' });
  const [problem, setProblem] = useState<TimeProblem | null>(null);
  const [rowErrors, setRowErrors] = useState<ReadonlyMap<string, BreakRowError>>(new Map());
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focusAdd, setFocusAdd] = useState(0);
  /** Counts the closed "not saved" alerts: focus then goes to the first marked row, else to Save. */
  const [afterAlert, setAfterAlert] = useState(0);
  /** The same count of closed alerts that left marked rows; the break list moves focus to the first marked row or chip on each. */
  const [errorFocus, setErrorFocus] = useState(0);
  /** Counts the presses of "Set an end instead": focus goes to the End date once its field is there. */
  const [focusEnd, setFocusEnd] = useState(0);
  /** The break chip whose "Break n" sub-dialog is open (third modal level), and whether its row was just added. */
  const [sub, setSub] = useState<{ key: string; isNew: boolean } | null>(null);
  /** Where focus goes once the sub-dialog is gone: a chip by row key, else "Add break". */
  const [chipFocus, setChipFocus] = useState<{ count: number; key: string | null }>({ count: 0, key: null });

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (!element.open) element.showModal();
    heading.current?.focus();
  }, []);

  // "Go back and add breaks": once the notice is gone, focus goes to "Add break".
  useEffect(() => {
    if (focusAdd > 0) addBreak.current?.focus();
  }, [focusAdd]);

  // The alert is already out of the document here, so the dialog behind is no longer inert: the first marked row, else Save.
  useEffect(() => {
    if (afterAlert === 0) return;
    if (rowErrors.size > 0) setErrorFocus((value) => value + 1);
    else saveButton.current?.focus();
    // Only a closed alert moves focus; the marked rows are read as they are at that moment.
  }, [afterAlert]);

  // "Set an end instead": the End date field exists now; the person types the end there.
  useEffect(() => {
    if (focusEnd === 0) return;
    dialog.current?.querySelector<HTMLElement>('[role="group"][aria-label="End"] input[type="date"]')?.focus();
  }, [focusEnd]);

  // The sub-dialog is already out of the document here, so the page behind is no longer inert.
  useEffect(() => {
    if (chipFocus.count === 0) return;
    const chip = chipFocus.key === null ? null : dialog.current?.querySelector<HTMLElement>(`[data-chip-key="${CSS.escape(chipFocus.key)}"]`);
    (chip ?? addBreak.current)?.focus();
  }, [chipFocus]);

  const zone = draft.zone.trim();
  const reasonMissing = reasonRequired && reason.trim() === '';
  const overnight = draft.end.date !== '' && draft.start.date !== '' && draft.end.date > draft.start.date;
  /** Owner answer Q6 b: a break has its own date field only when the session crosses local midnight or has no end. */
  const showBreakDate = breakDateVisible(draft.start.date, draft.end.date);
  const subIndex = sub === null ? -1 : draft.rows.findIndex((row) => row.key === sub.key);
  const subRow = subIndex < 0 ? undefined : draft.rows[subIndex];
  const title = isNew ? 'New session' : 'Edit session';
  const subtitle = `${editorTitle(workDate)}${draft.running ? ' · running' : ''} · accounting date in ${reportingZone}`;

  /**
   * After a change of the times or the zone: new sessions re-shift the suggestions until a break row is changed (the model decides
   * when they stop), and while no date field is shown every break follows the session date (Q6 b).
   */
  function settle(next: SessionDialogDraft): SessionDialogDraft {
    return followSessionDate(isNew ? reshiftSuggestions(next, context) : next);
  }

  function clearMessages() {
    setRowErrors(new Map());
  }

  /** A failed save: the "not saved" alert on top of the dialog (the markers of the rows stay where they are). */
  function openAlert(failure: SaveFailure) {
    setStep({ kind: 'alert', failure });
  }

  function closeAlert() {
    setStep({ kind: 'edit' });
    setAfterAlert((value) => value + 1);
  }

  function changeTime(edge: 'start' | 'end', field: LocalField) {
    const next = settle({ ...draft, [edge]: field });
    setDraft(next);
    setTimesTouched(true);
    if (problem !== null && !holds(next.start, problem) && !holds(next.end, problem)) setProblem(null);
  }

  function changeZone(value: string) {
    let next = changeDialogZone(draft, value);
    if (isNew && !timesTouched) {
      const hours = referenceHours(policy, workDate, reportingZone, value.trim());
      if (hours !== null) next = applyReferenceHours(next, hours);
    }
    // The typed wall times are read again in the new zone; an earlier question named the old one.
    setProblem(null);
    clearMessages();
    setDraft(settle(next));
  }

  function chooseFold(fold: 0 | 1) {
    if (problem === null) return;
    const pick = (field: LocalField) => (holds(field, problem) ? { ...field, fold } : field);
    setDraft(settle({ ...draft, start: pick(draft.start), end: pick(draft.end) }));
    setTimesTouched(true);
  }

  function takeGapReplacement() {
    if (problem === null) return;
    const replacement = gapReplacement(problem);
    const pick = (field: LocalField) => (holds(field, problem) ? replacement : field);
    setDraft(settle({ ...draft, start: pick(draft.start), end: pick(draft.end) }));
    setTimesTouched(true);
    setProblem(null);
  }

  function withoutRowError(key: string) {
    if (!rowErrors.has(key)) return;
    const next = new Map(rowErrors);
    next.delete(key);
    setRowErrors(next);
  }

  function suggest() {
    if (policy === undefined) {
      setNote('No work policy is effective on this date, so no breaks can be suggested.');
      return;
    }
    const start = resolveStart({ zone, start: draft.start, end: draft.end, breaks: [], mode: 'pending' });
    if (!start.ok) {
      setProblem(start.problem);
      setNote(start.problem === null ? start.message : null);
      return;
    }
    const rows = suggestionRows(policy, start.utc, fieldInstant(draft.end, zone), zone, (index) => `suggest-${keys.current}-${index}`);
    keys.current += 1;
    if (rows.length === 0) {
      setNote('No suggested break lies inside this session.');
      return;
    }
    setRowErrors(new Map());
    setNote(
      draft.running
        ? 'Suggested from this session start. Change them to the breaks you took, and list only breaks already taken; you confirm them when you check out.'
        : 'Suggested from this session start. Change them to the breaks you took; saving confirms them.',
    );
    // Placed on request: they no longer follow the start (another press places them again).
    setDraft({ ...draft, rows, noBreaks: false, breaksEdited: true });
  }

  /**
   * A form that cannot be sent. A daylight-saving question (the session's or a row's) is a question, not a failure: it stays inline
   * with its choices and opens no alert. Every other message, and the rows that cannot be saved as they are, go in the alert.
   */
  function showFailure(built: Extract<SessionDialogBuild, { ok: false }>) {
    setRowErrors(new Map(built.rowErrors.map((item) => [item.key, item])));
    if (built.problem !== null) {
      setProblem(built.problem);
      return;
    }
    const failed = built.rowErrors.filter((item) => item.problem === null);
    if (failed.length > 0) openAlert(rowsFailure(failed.map((item) => item.message)));
    else if (built.rowErrors.length > 0) setErrorFocus((value) => value + 1);
    else if (built.message !== null) openAlert(messageFailure(built.message));
  }

  /** The "Break n" sub-dialog ended: close it and put focus where the flow decided (null: "Add break"). */
  function closeSub(focusKey: string | null) {
    setSub(null);
    setChipFocus((value) => ({ count: value.count + 1, key: focusKey }));
  }

  function doneSub(key: string, edited: BreakRowDraft) {
    setDraft(settle(applyBreakEdit(draft, key, edited)));
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

  function build(next: SessionDialogDraft, allowUnconfirmed: boolean): SessionDialogBuild {
    return buildSessionDialogRequest(next, { allowUnconfirmed, expectedVersion: session?.version, reason });
  }

  function openConfirmation(sent: SessionDialogDraft, body: SessionRequest) {
    const summary = breaksSummary(sent.rows, sent.noBreaks);
    const running = sent.running;
    setStep({
      kind: 'confirm',
      request: body,
      message: running ? RUNNING_SENTENCE : summary.confirms ? CONFIRMS_SENTENCE : UNCONFIRMED_SENTENCE,
      facts: [
        { label: 'Day', value: editorTitle(workDate) },
        { label: 'Time', value: timeFact(sent, workDate) },
        { label: 'Breaks', value: running ? runningBreaksSummary(sent.rows) : summary.text },
      ],
      sent: { rows: sent.rows, noBreaks: sent.noBreaks },
    });
  }

  function attemptSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || reasonMissing || step.kind !== 'edit') return;
    clearMessages();
    setProblem(null);
    // A running session has no "no breaks listed" question: its breaks are confirmed at Check out.
    const unlisted = !draft.running && !draft.noBreaks && draft.rows.length === 0;
    // An empty unticked list is checked like a save with breaks unknown, so the time problems come first; the notice then asks.
    const built = build(draft, unlisted);
    if (!built.ok) {
      showFailure(built);
      return;
    }
    if (unlisted) setStep({ kind: 'notice' });
    else openConfirmation(draft, built.request);
  }

  function noticeConfirmNone() {
    const next = setNoBreaks(draft, true);
    setDraft(next);
    const built = build(next, false);
    if (built.ok) openConfirmation(next, built.request);
    else {
      setStep({ kind: 'edit' });
      showFailure(built);
    }
  }

  function noticeLeaveUnconfirmed() {
    const built = build(draft, true);
    if (built.ok) openConfirmation(draft, built.request);
    else {
      setStep({ kind: 'edit' });
      showFailure(built);
    }
  }

  function noticeGoBack() {
    setStep({ kind: 'edit' });
    setFocusAdd((value) => value + 1);
  }

  async function send(body: SessionRequest, sent: { rows: readonly BreakRowDraft[]; noBreaks: boolean }) {
    setBusy(true);
    try {
      const response =
        session === undefined
          ? await request<SessionResponse>('POST', `/days/${workDate}/sessions`, body)
          : await request<SessionResponse>('PUT', `/sessions/${session.id}`, body);
      onSaved(response.day);
    } catch (caught) {
      setStep({ kind: 'edit' });
      if (isStaleVersion(caught)) {
        onStale();
        return;
      }
      if (caught instanceof ApiRequestError) {
        const rowError = serverBreakRowError(caught.code, caught.details, sent);
        if (rowError !== null) {
          setRowErrors(new Map([[rowError.key, rowError]]));
          openAlert(rowsFailure([rowError.message]));
          return;
        }
        const found = timeProblemOf(caught.code, caught.details);
        if (found !== null && (holds(draft.start, found) || holds(draft.end, found))) {
          setProblem(found);
          return;
        }
      }
      openAlert(requestFailure(caught));
    } finally {
      setBusy(false);
    }
  }

  /** Cancel, Close, Escape and the browser's close request: ask first when something changed. */
  function requestClose(opener: HTMLElement | null) {
    if (step.kind !== 'edit' || busy) return;
    if (sessionDialogIsDirty(starting.draft, draft)) setStep({ kind: 'discard', opener });
    else onClose();
  }

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Escape') return;
    // An Escape typed inside a dialog nested in this one (the notice or a confirmation) belongs to that dialog.
    if (event.target instanceof Element && event.target.closest('dialog') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    requestClose(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  }

  const chosenFold = problem === null ? null : holds(draft.start, problem) ? draft.start.fold : holds(draft.end, problem) ? draft.end.fold : null;
  const prefillHours = policy === undefined ? '' : `${timeRange(policy.reference_start, policy.reference_end)}${zone === reportingZone ? '' : ` in ${reportingZone}`}`;

  return (
    <dialog
      ref={dialog}
      className="dialog session-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-subtitle`}
      data-session-dialog={isNew ? 'new' : 'edit'}
      onKeyDown={keyDown}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requestClose(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      }}
    >
      <header className="session-dialog-head">
        <div className="session-dialog-title">
          <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
            {title}
          </h2>
          <p id={`${id}-subtitle`} className="muted">
            {subtitle}
          </p>
        </div>
        <button type="button" className="quiet icon-button" aria-label="Close" onClick={(event) => requestClose(event.currentTarget)}>
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <form className="session-dialog-form" onSubmit={attemptSave} noValidate>
        <div className="session-dialog-body">
          {starting.prefill !== null && (
            <p className="prefill-note" data-prefill={starting.prefill}>
              <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7v4M8 4.6v.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>
                Pre-filled from your reference hours ({prefillHours}){starting.prefill === 'hours-breaks' ? ' and suggested breaks' : ''}. Change them to
                the times you worked.
              </span>
            </p>
          )}

          {reasonRequired && (
            <label className="editor-reason">
              Reason for editing an old or finalized period
              <textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} rows={2} maxLength={500} required />
            </label>
          )}

          <section className="session-dialog-section" aria-labelledby={`${id}-time`}>
            <h3 id={`${id}-time`}>Time</h3>
            <label>
              Input zone
              <input type="text" list={`${id}-zones`} value={draft.zone} onChange={(event) => changeZone(event.target.value)} spellCheck={false} required />
              <span className="muted hint">
                The zone the times below are typed in; they are shown in {displayZone} elsewhere. Saved with the session; it never moves the
                day.
              </span>
            </label>
            <datalist id={`${id}-zones`}>
              {zones.map((choice) => (
                <option key={choice} value={choice} />
              ))}
            </datalist>
            <div className="session-times">
              <LocalTimeField label="Start" field={draft.start} zone={zone} onChange={(start) => changeTime('start', start)} />
              {draft.running ? (
                <div className="running-end" data-running-end>
                  <p className="running-end-title">
                    <span className="shape shape-circle status-running" aria-hidden="true" />
                    {NO_END_TEXT}{' '}
                  </p>
                  <p className="muted hint">It ends when you check out.</p>
                  {!shared && (
                    <button
                      type="button"
                      className="quiet link-action"
                      onClick={() => {
                        setDraft(settle(endRunningDraft(draft)));
                        setTimesTouched(true);
                        setFocusEnd((value) => value + 1);
                      }}
                    >
                      Set an end instead
                    </button>
                  )}
                </div>
              ) : (
                <LocalTimeField label="End" field={draft.end} zone={zone} onChange={(end) => changeTime('end', end)} />
              )}
            </div>
            {overnight && (
              <p className="muted hint" data-overnight>
                Overnight: this session ends on {draft.end.date}. It stays on accounting date {workDate}.
              </p>
            )}
            {problem !== null && <TimeProblemPrompt problem={problem} chosen={chosenFold} onFold={chooseFold} onGap={takeGapReplacement} />}
          </section>

          <section className="session-dialog-section" aria-labelledby={`${id}-breaks`}>
            <h3 id={`${id}-breaks`}>Breaks</h3>
            <BreakRows
              rows={draft.rows}
              noBreaks={draft.noBreaks}
              running={draft.running}
              zone={zone}
              showDate={showBreakDate}
              errors={rowErrors}
              focusErrors={errorFocus}
              note={note}
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

          {reasonMissing && <p className="muted hint">Enter a reason for this old period above to save.</p>}
        </div>

        <div className="session-dialog-foot">
          <button type="button" className="secondary" onClick={(event) => requestClose(event.currentTarget)}>
            Cancel
          </button>
          <button ref={saveButton} type="submit" disabled={busy || reasonMissing}>
            Save
          </button>
        </div>
      </form>

      {step.kind === 'notice' && <NoBreaksNotice onConfirmNone={noticeConfirmNone} onLeaveUnconfirmed={noticeLeaveUnconfirmed} onGoBack={noticeGoBack} />}
      {step.kind === 'confirm' && (
        <ConfirmDialog
          title="Save this session?"
          message={step.message}
          facts={step.facts}
          confirmLabel="Save"
          cancelLabel="Back"
          busy={busy}
          opener={saveButton.current}
          onConfirm={() => void send(step.request, step.sent)}
          onCancel={() => setStep({ kind: 'edit' })}
        />
      )}
      {step.kind === 'alert' && <AlertDialog title={SAVE_FAILED_TITLE} messages={step.failure.messages} hint={step.failure.hint} onClose={closeAlert} />}
      {sub !== null && subRow !== undefined && step.kind === 'edit' && (
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
      {step.kind === 'discard' && (
        <ConfirmDialog
          title="Discard your changes?"
          message="You changed this session. If you leave now, nothing is saved."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          tone="danger"
          opener={step.opener}
          onConfirm={onClose}
          onCancel={() => setStep({ kind: 'edit' })}
        />
      )}
    </dialog>
  );
}
