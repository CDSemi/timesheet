import { type KeyboardEvent, type MouseEvent, useId, useRef, useState } from 'react';
import { CheckBadge, LabelContent, OtContent, TimeContent } from './DayStatus.tsx';
import { LABEL_CHOICES, type LabelChoice } from './labelPickerModel.ts';
import { DETAIL_ROWS, type SheetDay, type SheetWeek } from './sheetModel.ts';

/** The in-cell label picker of the sheet (E-3 a): what each day's label is now, and what a pick does. */
export interface LabelPickerActions {
  choiceOf: (workDate: string) => LabelChoice | null;
  /** A one-entry batch preview, then its commit or the review dialog (the page decides). */
  onPick: (workDate: string, choice: LabelChoice) => void;
  /** The date whose pick is being saved; its picker ignores a second pick until the answer comes. */
  busyDate: string | null;
}

/** What a day of the sheet can do; shared by the desktop sheet and the phone tables. */
export interface DayActions {
  selected: ReadonlySet<string>;
  onToggle: (workDate: string) => void;
  onEdit: (workDate: string) => void;
  /** False in a view-only shared view: no selection box, and the day only opens to read. */
  editable: boolean;
  /** True in batch mode ("Change several days"): the selection boxes show; otherwise the days carry none. */
  selecting: boolean;
  /** True for an imported period (F-2): the selection boxes are disabled and the day only opens to read. */
  locked: boolean;
  /** The label picker; absent, or unused while the day cannot change or batch mode is on. */
  label?: LabelPickerActions;
  /** True in the read-only review: no day opens, the date is plain text, the day is marked `[data-review-day]` and its note shows in full. */
  review?: boolean;
}

/** The read-only review sheet: nothing is editable, selectable or openable. */
export const REVIEW_ACTIONS: DayActions = {
  selected: new Set<string>(),
  onToggle: () => undefined,
  onEdit: () => undefined,
  editable: false,
  selecting: false,
  locked: true,
  review: true,
};

/** The day's note in full, shown only in the review. */
export function ReviewNote({ day }: { day: SheetDay }) {
  if (day.noteText === undefined || day.noteText === '') return null;
  return <span className="cell-sub review-note">Note: {day.noteText}</span>;
}

/** The label picker of a day, or null when the label is plain text (view only, imported, batch mode). */
export function labelPickerOf(actions: DayActions): LabelPickerActions | null {
  return actions.label !== undefined && actions.editable && !actions.locked && !actions.selecting ? actions.label : null;
}

/**
 * The day's label cell as a dropdown, like the Excel label cell: a button that shows the label and
 * opens a list of the labels. Keyboard: Enter, Space or Arrow down opens it; the arrows, Home and
 * End move; Enter or Space picks; Escape or Tab closes it and focus returns to the button.
 */
export function LabelPicker({ day, picker }: { day: SheetDay; picker: LabelPickerActions }) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const current = picker.choiceOf(day.workDate);
  const [active, setActive] = useState(0);
  const busy = picker.busyDate === day.workDate;

  function show() {
    if (busy) return;
    const index = current === null ? 0 : LABEL_CHOICES.indexOf(current);
    setActive(Math.max(0, index));
    setOpen(true);
    // The list exists after this render; focus moves into it so the arrows work at once.
    requestAnimationFrame(() => list.current?.focus());
  }

  function hide() {
    setOpen(false);
    button.current?.focus();
  }

  function pick(choice: LabelChoice) {
    hide();
    picker.onPick(day.workDate, choice);
  }

  function buttonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      show();
    }
  }

  function listKey(event: KeyboardEvent<HTMLUListElement>) {
    const last = LABEL_CHOICES.length - 1;
    const moves: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      setActive(move);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const choice = LABEL_CHOICES[active];
      if (choice !== undefined) pick(choice);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hide();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  const name = `Label for ${day.workDate}: ${day.label.main === '' ? 'not set' : day.label.main}`;
  return (
    // The picker acts by itself: a click inside never also opens the day editor.
    <div className={`label-picker${open ? ' open' : ''}`} data-label-picker={day.workDate} onClick={(event) => event.stopPropagation()}>
      <button
        ref={button}
        type="button"
        className="label-trigger"
        aria-label={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-busy={busy}
        onClick={() => (open ? hide() : show())}
        onKeyDown={buttonKey}
      >
        <span className="label-trigger-text">
          <LabelContent label={day.label} />
        </span>
        <span className="label-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          className="label-list"
          role="listbox"
          tabIndex={-1}
          aria-label={`Label for ${day.workDate}`}
          aria-activedescendant={`${id}-option-${active}`}
          onKeyDown={listKey}
          onBlur={(event) => {
            if (!(event.relatedTarget instanceof Node && event.currentTarget.parentElement?.contains(event.relatedTarget))) setOpen(false);
          }}
        >
          {LABEL_CHOICES.map((choice, index) => (
            <li
              key={choice}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={choice === current}
              className={`label-option${index === active ? ' active' : ''}${choice === 'Work from home' ? ' label-option-extra' : ''}`}
              onMouseMove={() => setActive(index)}
              onClick={() => pick(choice)}
            >
              {choice}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "Edit" while the day can change, otherwise "View"; the stable accessible name of the day button. */
export const dayVerb = (actions: Pick<DayActions, 'editable' | 'locked'>): 'Edit' | 'View' => (actions.editable && !actions.locked ? 'Edit' : 'View');

/** A click anywhere on the day opens it, except on its own controls (they act themselves). */
export function openOnClick(workDate: string, onEdit: (workDate: string) => void) {
  return (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('button, input, label, a') !== null) return;
    onEdit(workDate);
  };
}

export function dayClass(day: SheetDay, selected: boolean, base: string): string {
  return [base, day.nonworking ? 'nonworking' : '', day.today ? 'today' : '', selected ? 'selected' : ''].filter((part) => part !== '').join(' ');
}

/** The selection box of batch editing ("Select {date}"); only in batch mode, and absent in a view-only share. */
export function SelectBox({ day, actions }: { day: SheetDay; actions: DayActions }) {
  if (!actions.editable || !actions.selecting) return null;
  return (
    <label className="pick">
      <input
        type="checkbox"
        checked={actions.selected.has(day.workDate)}
        onChange={() => actions.onToggle(day.workDate)}
        disabled={actions.locked}
        aria-label={`Select ${day.workDate}`}
      />
    </label>
  );
}

function DetailLine({ day }: { day: SheetDay }) {
  return (
    <tr className="sheet-detail-row">
      <td colSpan={4}>
        <span className="detail-pair">
          {DETAIL_ROWS.regular}{' '}
          <span className="mono" data-detail="regular" data-detail-day={day.workDate}>
            {day.details.regular}
          </span>
        </span>
        <span className="detail-pair">
          {DETAIL_ROWS.offCalendar}{' '}
          <span className="mono" data-detail="off-calendar" data-detail-day={day.workDate}>
            {day.details.offCalendar}
          </span>
        </span>
      </td>
    </tr>
  );
}

/**
 * One week of the sheet below 768px: a 4-column table (Day | Label | Time | OT), one row per day
 * (`[data-day]`), so a phone never scrolls sideways. The Check status folds into the Day cell as
 * words plus a shape, and the Time cell carries the attention tint.
 */
export function SheetWeekTable({ week, details, actions }: { week: SheetWeek; details: boolean; actions: DayActions }) {
  const verb = dayVerb(actions);
  return (
    <section className="sheet-week" aria-label={`Week ${week.index}, ${week.rangeName}`}>
      <div className="week-bar">
        <strong>WEEK {week.index}</strong>
        <span className="mono muted">{week.rangeText}</span>
      </div>
      <table className="sheet-table">
        <colgroup>
          <col className="col-day" />
          <col className="col-label" />
          <col className="col-time" />
          <col className="col-ot" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Label</th>
            <th scope="col">Time</th>
            <th scope="col">OT</th>
          </tr>
        </thead>
        <tbody>
          {week.days.map((day) => (
            <DayRows key={day.workDate} day={day} details={details} actions={actions} verb={verb} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DayRows({ day, details, actions, verb }: { day: SheetDay; details: boolean; actions: DayActions; verb: 'Edit' | 'View' }) {
  const picker = labelPickerOf(actions);
  const review = actions.review === true;
  return (
    <>
      <tr
        data-day={review ? undefined : day.workDate}
        data-review-day={review ? day.workDate : undefined}
        aria-label={day.name}
        className={dayClass(day, actions.selected.has(day.workDate), review ? 'sheet-row sheet-row-static' : 'sheet-row')}
        onClick={review ? undefined : openOnClick(day.workDate, actions.onEdit)}
      >
        <td className="t-day">
          <div className="t-day-head">
            <SelectBox day={day} actions={actions} />
            {review ? (
              <span className="sheet-day-text">
                <span className="t-weekday">{day.weekday}</span>
                <span className="mono">{day.dateText}</span>
              </span>
            ) : (
              <button type="button" className="sheet-day-button" onClick={() => actions.onEdit(day.workDate)} aria-label={`${verb} ${day.workDate}`}>
                <span className="t-weekday">{day.weekday}</span>
                <span className="mono">{day.dateText}</span>
              </button>
            )}
          </div>
          {day.today && <span className="today-tag">Today</span>}
          {day.check !== null && <CheckBadge check={day.check} />}
        </td>
        <td className="t-label">
          {picker === null ? <LabelContent label={day.label} /> : <LabelPicker day={day} picker={picker} />}
          {review && <ReviewNote day={day} />}
        </td>
        <td className={`t-time${day.time.attention ? ' attention' : ''}`}>
          <TimeContent time={day.time} />
        </td>
        <td className="t-ot" data-cell="ot">
          <OtContent ot={day.ot} />
        </td>
      </tr>
      {details && <DetailLine day={day} />}
    </>
  );
}
