import { type RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BreakChip } from './BreakChip.tsx';
import { breakListLayout, type BreakListLayout } from './breakChipModel.ts';
import { breakLabel, type BreakRowDraft, type BreakRowError, type BreakRowPatch, breakRowEnd } from './breakRowsModel.ts';
import { usShortDate } from './format.ts';
import type { TimeProblem } from './sessionModel.ts';
import { TimeProblemPrompt } from './TimeProblemPrompt.tsx';

/** Where focus goes after the list changed: the new row, a row's remove button, or "Add break". */
type FocusAfter = { kind: 'new' } | { kind: 'remove'; key: string } | { kind: 'add' };

/** "ends 10:15", or "ends 10/13 00:15" when the break ends on a later local date than it starts. */
function endText(row: BreakRowDraft, index: number, zone: string): string | null {
  const end = breakRowEnd(row, index, zone);
  if (end === null) return null;
  const clock = end.time.slice(0, 5);
  return end.date === row.start.date ? `ends ${clock}` : `ends ${usShortDate(end.date)} ${clock}`;
}

/**
 * The break area of the session dialog (WP5-UX3-T08 and T08B, owner decisions U-21, U-24, N-1 and Q6 b): one "Confirm no breaks
 * taken" box (left out for a `running` session, U4-11), the list of breaks, "Suggest breaks" and "Add break". A break is its start time and its minutes, and its start
 * date only when `showDate` (the session crosses local midnight or has no end; otherwise the dialog keeps every row on the
 * session date); the end is computed (`breakRowEnd`) and shown as text. A pre-filled suggestion carries a "suggested" tag until
 * its row is changed. Ticking the box hides and disables the rows; they stay in the draft and come back when it is unticked.
 *
 * The list adapts to its own width: one line from 42rem (a CSS container query), two lines ("Break n" with its end, then the
 * fields) below it, and below the width where the fields of the row no longer fit (`breakListLayout`, measured) each break is a
 * chip (`BreakChip`) that opens the "Break n" sub-dialog, which the session dialog renders. Every change goes through the T06
 * model in the dialog; nothing is sent from here.
 */
export function BreakRows({
  rows,
  noBreaks,
  zone,
  showDate,
  errors,
  focusErrors,
  note,
  addBreak,
  onEdit,
  onAdd,
  onOpenBreak,
  onRemove,
  onNoBreaks,
  onSuggest,
  onFold,
  onGap,
  action = 'Saving',
  running = false,
}: {
  rows: readonly BreakRowDraft[];
  noBreaks: boolean;
  /** The input zone the rows are typed in. */
  zone: string;
  /** True while a row has its own date field (an overnight session, or none yet). */
  showDate: boolean;
  /** The message of each row that cannot be saved as it is, by row key. */
  errors: ReadonlyMap<string, BreakRowError>;
  /** Counts the closed "not saved" alerts; each one moves focus to the first marked row's field, or to its chip when the list shows chips. */
  focusErrors: number;
  /** What "Suggest breaks" did (or why it could not), shown under the buttons. */
  note: string | null;
  /** The "Add break" button, so the dialog can return focus to it (G-4 "Go back and add breaks"). */
  addBreak: RefObject<HTMLButtonElement | null>;
  onEdit: (key: string, patch: BreakRowPatch) => void;
  /** Adds an empty row on the session date and returns its key. */
  onAdd: () => string;
  /** Opens the sub-dialog of a chip; `isNew` is true for the row just added. */
  onOpenBreak: (key: string, isNew: boolean) => void;
  onRemove: (key: string) => void;
  onNoBreaks: (noBreaks: boolean) => void;
  onSuggest: () => void;
  onFold: (key: string, fold: 0 | 1) => void;
  onGap: (key: string, problem: TimeProblem) => void;
  /** The act that confirms the listed breaks, named in the closing hint: "Saving" (session dialog) or "Checking out". */
  action?: 'Saving' | 'Checking out';
  /** True for a session without an end (U4-11): no "Confirm no breaks taken" box, and the hint says the breaks are confirmed at Check out. */
  running?: boolean;
}) {
  const id = useId();
  const area = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const focusAfter = useRef<FocusAfter | null>(null);
  const [layout, setLayout] = useState<BreakListLayout>('rows');

  // The list width decides rows or chips (the thresholds are in breakChipModel.ts). Measured before the first paint and on resize.
  useLayoutEffect(() => {
    const element = area.current;
    if (element === null) return;
    const measure = () => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      setLayout(breakListLayout(element.clientWidth, rem, showDate));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [showDate]);

  const chips = layout === 'chips';

  // After an add or a remove, focus stays in the list (SC 2.4.3): the new row's first field, the next row's remove button, or Add break.
  useEffect(() => {
    const after = focusAfter.current;
    if (after === null) return;
    focusAfter.current = null;
    if (after.kind === 'new') {
      const last = rows.at(-1);
      if (last !== undefined) (elements.current.get(`${last.key}:date`) ?? elements.current.get(`${last.key}:time`))?.focus();
    } else if (after.kind === 'remove') {
      elements.current.get(`${after.key}:remove`)?.focus();
    } else {
      addBreak.current?.focus();
    }
  }, [rows, addBreak]);

  // A refused Save marks the rows (or chips) that cannot be saved, and the dialog says so in its alert; when the alert is closed the
  // dialog counts `focusErrors` and focus goes to the first marked row's field, or its chip (SC 3.3.1, 2.4.3). The field is the one
  // the message is about: the minutes for a minutes message, the date while it is empty, else the start time.
  useEffect(() => {
    if (focusErrors === 0) return;
    const first = rows.find((row) => errors.has(row.key));
    if (first === undefined) return;
    if (chips) {
      elements.current.get(`${first.key}:chip`)?.focus();
      return;
    }
    const kind = errors.get(first.key)?.kind;
    const name = kind === 'minutes' ? 'minutes' : showDate && first.start.date === '' ? 'date' : 'time';
    (elements.current.get(`${first.key}:${name}`) ?? elements.current.get(`${first.key}:time`))?.focus();
    // Only a new closing of the alert moves focus; the list and the messages are read as they are at that moment.
  }, [focusErrors]);

  const keep = (name: string) => (element: HTMLElement | null) => {
    if (element === null) elements.current.delete(name);
    else elements.current.set(name, element);
  };

  function remove(index: number, key: string) {
    const next = rows[index + 1] ?? rows[index - 1];
    focusAfter.current = next === undefined ? { kind: 'add' } : { kind: 'remove', key: next.key };
    onRemove(key);
  }

  return (
    <div className="break-area" ref={area}>
      {!running && (
        <label className="inline break-none">
          <input type="checkbox" checked={noBreaks} onChange={(event) => onNoBreaks(event.target.checked)} />
          Confirm no breaks taken
        </label>
      )}
      {!noBreaks && rows.length === 0 && <p className="muted hint">No breaks listed.</p>}
      {!noBreaks && rows.length > 0 && (
        <ul className={chips ? 'plain break-entries break-chips' : 'plain break-entries'} aria-label="Break list" data-layout={layout}>
          {rows.map((row, index) => {
            const label = breakLabel(index);
            const error = errors.get(row.key);
            const errorId = `${id}-error-${row.key}`;
            const invalid = error !== undefined;
            const describedBy = invalid && error.problem === null ? errorId : undefined;
            const end = endText(row, index, zone);
            const suggested = row.origin === 'suggested' && !row.edited;
            if (chips) {
              return (
                <li key={row.key} className={invalid ? 'break-entry break-entry-chip has-error' : 'break-entry break-entry-chip'} data-break={index + 1} data-origin={row.origin}>
                  <BreakChip
                    row={row}
                    index={index}
                    zone={zone}
                    overnight={showDate}
                    suggested={suggested}
                    describedBy={invalid ? errorId : undefined}
                    chipRef={keep(`${row.key}:chip`)}
                    onOpen={() => onOpenBreak(row.key, false)}
                  />
                  {invalid && (
                    <p className="break-message break-error" id={errorId}>
                      {error.message}
                    </p>
                  )}
                </li>
              );
            }
            return (
              <li key={row.key} className={invalid ? 'break-entry has-error' : 'break-entry'} data-break={index + 1} data-origin={row.origin}>
                <div className="break-entry-head">
                  <span className="break-num">{label}</span>
                  <span className="break-info">
                    <span className="break-end">{end ?? 'ends --:--'}</span>
                    {suggested && <span className="break-tag">suggested</span>}
                  </span>
                </div>
                <div className="break-entry-fields">
                  {showDate && (
                    <label className="break-field break-date">
                      <span className="sr-only">{label} date</span>
                      <input
                        ref={keep(`${row.key}:date`)}
                        type="date"
                        value={row.start.date}
                        onChange={(event) => onEdit(row.key, { date: event.target.value })}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        required
                      />
                    </label>
                  )}
                  <label className="break-field break-time">
                    <span className="sr-only">{label} start time</span>
                    <input
                      ref={keep(`${row.key}:time`)}
                      type="time"
                      step={row.start.time.length > 5 ? 1 : 60}
                      value={row.start.time}
                      onChange={(event) => onEdit(row.key, { time: event.target.value })}
                      aria-invalid={invalid || undefined}
                      aria-describedby={describedBy}
                      required
                    />
                  </label>
                  <label className="break-field break-minutes">
                    <span className="sr-only">{label} minutes</span>
                    <input
                      ref={keep(`${row.key}:minutes`)}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={720}
                      step={1}
                      placeholder="total mins"
                      value={row.minutes}
                      onChange={(event) => onEdit(row.key, { minutes: event.target.value })}
                      aria-invalid={invalid || undefined}
                      aria-describedby={describedBy}
                      required
                    />
                  </label>
                  <button
                    ref={keep(`${row.key}:remove`)}
                    type="button"
                    className="quiet icon-button break-remove"
                    aria-label={`Remove break ${index + 1}`}
                    onClick={() => remove(index, row.key)}
                  >
                    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {error !== undefined && error.problem !== null && (
                  <div className="break-message">
                    <TimeProblemPrompt
                      problem={error.problem}
                      chosen={row.start.offset === null ? row.start.fold : null}
                      label={label}
                      onFold={(fold) => onFold(row.key, fold)}
                      onGap={() => {
                        if (error.problem !== null) onGap(row.key, error.problem);
                      }}
                    />
                  </div>
                )}
                {error !== undefined && error.problem === null && (
                  <p className="break-message break-error" id={errorId}>
                    {error.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="button-row break-actions">
        <button type="button" className="secondary" onClick={onSuggest} disabled={noBreaks}>
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 1.8l1.5 4.7 4.7 1.5-4.7 1.5L8 14.2l-1.5-4.7L1.8 8l4.7-1.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          Suggest breaks
        </button>
        <button
          ref={addBreak}
          type="button"
          className="secondary"
          disabled={noBreaks}
          onClick={() => {
            if (chips) {
              onOpenBreak(onAdd(), true);
              return;
            }
            focusAfter.current = { kind: 'new' };
            onAdd();
          }}
        >
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add break
        </button>
      </div>
      {note !== null && (
        <p className="muted hint" role="status">
          {note}
        </p>
      )}
      <p className="muted hint" data-breaks-hint={running ? 'running' : undefined}>
        {running
          ? 'Only breaks you have already taken can be listed. You confirm the breaks when you check out; until then OT for the day stays pending.'
          : `${action} confirms the breaks listed here. Leave the list empty and the box unticked if you do not know yet: OT for the day then stays pending.`}
      </p>
    </div>
  );
}
