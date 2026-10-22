import { Fragment, type KeyboardEvent, type MouseEvent, useId, useRef, useState } from 'react';
import { CheckBadge, LabelContent, OtContent, TimeContent } from './DayStatus.tsx';
import { LABEL_CHOICES, type LabelChoice, labelPickerListName, labelPickerName } from './labelPickerModel.ts';
import { dayButtonName, dayClass, DETAIL_ROWS, DETAIL_SHORT, type SheetDay, type SheetWeek } from './sheetModel.ts';

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
  /** The accounting date open in the Day editor, or null; the sheet marks that day's column (desktop) or row (phone). */
  editing: string | null;
  onToggle: (workDate: string) => void;
  /** Opens the Day editor on the day, or switches an open editor to it (a press on the day's button, or anywhere on its column). */
  onEdit: (workDate: string) => void;
  /** Closes the Day editor: a press on the open day's own button unselects it. */
  onUnselect: () => void;
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
  editing: null,
  onToggle: () => undefined,
  onEdit: () => undefined,
  onUnselect: () => undefined,
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
 * The visible lines of a picker trigger, as `LabelContent` draws them (one line each), with a real space between them: the
 * button's text then reads "Observed Independence Day Holiday", the words of its name in the same order (SC 2.5.3,
 * WP5-UX3-FIX1). The space changes nothing on screen, since every line is a block.
 */
function PickerLines({ label }: { label: SheetDay['label'] }) {
  const lines = [
    ...(label.main === '' ? [] : [{ key: 'main', className: 'cell-main', text: label.main }]),
    ...label.lines.map((line, index) => ({ key: `${index}-${line}`, className: 'cell-sub', text: line })),
    ...(label.note ? [{ key: 'note', className: 'cell-note', text: 'Note' }] : []),
  ];
  return lines.map((line, index) => (
    <Fragment key={line.key}>
      {index > 0 && ' '}
      <span className={line.className}>{line.text}</span>
    </Fragment>
  ));
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

  const name = labelPickerName(day.workDate, day.label);
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
          <PickerLines label={day.label} />
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
          aria-label={labelPickerListName(day.workDate)}
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

/** "Edit" while the day can change, otherwise "View": the first word of the day button's name (`dayButtonName`). */
export const dayVerb = (actions: Pick<DayActions, 'editable' | 'locked'>): 'Edit' | 'View' => (actions.editable && !actions.locked ? 'Edit' : 'View');

/** A press on the day's own button: on the open day it closes the editor (unselect), on any other day it opens or switches to it. */
export function pressDay(workDate: string, actions: Pick<DayActions, 'editing' | 'onEdit' | 'onUnselect'>) {
  return () => (actions.editing === workDate ? actions.onUnselect() : actions.onEdit(workDate));
}

/** A click anywhere on the day opens it (or switches the open editor to it), except on its own controls (they act themselves). */
export function openOnClick(workDate: string, onEdit: (workDate: string) => void) {
  return (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('button, input, label, a') !== null) return;
    onEdit(workDate);
  };
}

/** True for the day open in the Day editor; the container carries `data-editing` and the day's button `aria-current`. */
export const isEditingDay = (day: Pick<SheetDay, 'workDate'>, actions: Pick<DayActions, 'editing'>): boolean => actions.editing === day.workDate;

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

/**
 * The worked line of a day (round 5, U5-20): it belongs to the day row above it (no rule between them; the style sheet draws the
 * tint and the indent) and carries short labels, "Workday 8:00" and "Day off 0:00". The full names stay for screen readers.
 */
function DetailLine({ day, editing }: { day: SheetDay; editing: boolean }) {
  return (
    <tr className={`sheet-detail-row${editing ? ' editing-detail' : ''}`}>
      <td colSpan={4}>
        <span className="detail-pair">
          <span aria-hidden="true">{DETAIL_SHORT.regular}</span>
          <span className="sr-only">{DETAIL_ROWS.regular}</span>{' '}
          <span className="mono" data-detail="regular" data-detail-day={day.workDate}>
            {day.details.regular}
          </span>
        </span>
        <span className="detail-pair">
          <span aria-hidden="true">{DETAIL_SHORT.offCalendar}</span>
          <span className="sr-only">{DETAIL_ROWS.offCalendar}</span>{' '}
          <span className="mono" data-detail="off-calendar" data-detail-day={day.workDate}>
            {day.details.offCalendar}
          </span>
        </span>
      </td>
    </tr>
  );
}

/**
 * One week of the compact sheet (below 480px): a 4-column table (Day | Category | Time | OT), one row per day
 * (`[data-day]`), so a phone never scrolls sideways. The Status folds into the Day cell as
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
            <th scope="col">Category</th>
            <th scope="col">Time</th>
            <th scope="col">OT</th>
          </tr>
        </thead>
        {/* One tbody per day (round 5, U5-20): with the worked line on, a day and its line are one group, ruled off from the next. */}
        {week.days.map((day) => (
          <tbody key={day.workDate} className={details ? 'sheet-group with-worked' : 'sheet-group'}>
            <DayRows day={day} details={details} actions={actions} verb={verb} />
          </tbody>
        ))}
      </table>
    </section>
  );
}

function DayRows({ day, details, actions, verb }: { day: SheetDay; details: boolean; actions: DayActions; verb: 'Edit' | 'View' }) {
  const picker = labelPickerOf(actions);
  const review = actions.review === true;
  const editing = isEditingDay(day, actions);
  return (
    <>
      <tr
        data-day={review ? undefined : day.workDate}
        data-review-day={review ? day.workDate : undefined}
        data-editing={editing ? 'true' : undefined}
        aria-label={day.name}
        className={dayClass(day, { selected: actions.selected.has(day.workDate), editing }, `${review ? 'sheet-row sheet-row-static' : 'sheet-row'}${editing && details ? ' editing-open' : ''}`)}
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
              <button
                type="button"
                className="sheet-day-button"
                onClick={pressDay(day.workDate, actions)}
                aria-label={dayButtonName(verb, day, 'phone')}
                aria-current={editing ? 'true' : undefined}
                data-day-button
              >
                <span className="t-weekday">{day.weekday}</span>
                {/* A real space between the spans: the visible text reads "Mon 09/28", which the name contains (SC 2.5.3, R-UX2A-4). */}
                {' '}
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
      {details && <DetailLine day={day} editing={editing} />}
    </>
  );
}
