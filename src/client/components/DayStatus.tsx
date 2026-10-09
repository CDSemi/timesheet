import type { DayDisplay, StatusShape } from './dayModel.ts';
import type { SheetCheck, SheetLabel, SheetOt, SheetTime } from './sheetModel.ts';

/*
 * The status badges and the cell contents of a day, shared by the desktop sheet and the phone
 * week tables so both show the same words, shapes and server values.
 */

/** A status is always a shape plus words; the shape is decoration for the eye, never the only signal. */
function Shape({ shape }: { shape: StatusShape }) {
  return <span className={`shape shape-${shape}`} aria-hidden="true" />;
}

export function CompletenessBadge({ day }: { day: DayDisplay }) {
  return (
    <span className={`status status-${day.status.completeness}`}>
      <Shape shape={day.status.shape} />
      {day.status.text}
    </span>
  );
}

/** The label cell: the day label, then its smaller lines (holiday, leave, WFH) and a note marker. */
export function LabelContent({ label }: { label: SheetLabel }) {
  return (
    <>
      {label.main !== '' && <span className="cell-main">{label.main}</span>}
      {label.lines.map((line, index) => (
        <span key={`${index}-${line}`} className="cell-sub">
          {line}
        </span>
      ))}
      {label.note && <span className="cell-note">Note</span>}
    </>
  );
}

/** The time cell: one line per session in the display zone, the local start date when it differs, and a short note. */
export function TimeContent({ time }: { time: SheetTime }) {
  return (
    <>
      {time.ranges.map((range) => (
        <span key={range.key} className="cell-range" data-range={range.key}>
          {range.startDate !== null && <span className="cell-sub">{range.startDate}</span>}
          {range.text}
        </span>
      ))}
      {time.note !== null && <span className="cell-sub">{time.note}</span>}
    </>
  );
}

/** The OT cell by the PDF rule; `data-ot` names the kind so the value can be read without the row name. */
export function OtContent({ ot }: { ot: SheetOt }) {
  if (ot.kind === 'blank') return null;
  return (
    <span className={`ot-${ot.kind}`} data-ot={ot.kind}>
      {ot.text}
    </span>
  );
}

/** The Check cell of the sheet: words plus a shape; a running session has the live marker (static under reduced motion). */
export function CheckBadge({ check }: { check: SheetCheck }) {
  return (
    <span className={`status status-${check.key}`} data-check={check.key}>
      {check.shape === 'live' ? <span className="shape live-dot" aria-hidden="true" /> : <Shape shape={check.shape} />}
      {check.text}
    </span>
  );
}
