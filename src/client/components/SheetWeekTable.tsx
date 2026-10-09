import type { MouseEvent } from 'react';
import { CheckBadge, LabelContent, OtContent, TimeContent } from './DayStatus.tsx';
import { DETAIL_ROWS, type SheetDay, type SheetWeek } from './sheetModel.ts';

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
  return (
    <>
      <tr
        data-day={day.workDate}
        aria-label={day.name}
        className={dayClass(day, actions.selected.has(day.workDate), 'sheet-row')}
        onClick={openOnClick(day.workDate, actions.onEdit)}
      >
        <td className="t-day">
          <div className="t-day-head">
            <SelectBox day={day} actions={actions} />
            <button type="button" className="sheet-day-button" onClick={() => actions.onEdit(day.workDate)} aria-label={`${verb} ${day.workDate}`}>
              <span className="t-weekday">{day.weekday}</span>
              <span className="mono">{day.dateText}</span>
            </button>
          </div>
          {day.today && <span className="today-tag">Today</span>}
          {day.check !== null && <CheckBadge check={day.check} />}
        </td>
        <td className="t-label">
          <LabelContent label={day.label} />
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
