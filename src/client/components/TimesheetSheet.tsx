import type { FinalizationResponse, TimesheetView } from '../api.ts';
import { CheckBadge, LabelContent, OtContent, TimeContent } from './DayStatus.tsx';
import { usDate } from './format.ts';
import { periodStatus, reviewHash, reviewLinkLabel } from './reviewModel.ts';
import {
  DETAIL_ROWS,
  overtimeTotal,
  SHEET_COMPANY,
  SHEET_ROWS,
  SHEET_TITLE,
  type SheetDay,
  type SheetWeek,
  sheetWeeks,
  signatureLines,
} from './sheetModel.ts';
import { type DayActions, dayClass, dayVerb, openOnClick, SelectBox, SheetWeekTable } from './SheetWeekTable.tsx';

/** A cell's row name for screen readers; the visual row-label column is hidden from them. */
function RowName({ name }: { name: string }) {
  return <span className="sr-only">{name}: </span>;
}

/** One day of the desktop sheet: a column of cells on the week's shared rows (CSS subgrid). */
function SheetDayColumn({ day, details, actions }: { day: SheetDay; details: boolean; actions: DayActions }) {
  const verb = dayVerb(actions);
  const hasTime = day.time.ranges.length > 0 || day.time.note !== null;
  return (
    <div
      className={dayClass(day, actions.selected.has(day.workDate), 'sheet-day')}
      data-day={day.workDate}
      role="group"
      aria-label={day.name}
      onClick={openOnClick(day.workDate, actions.onEdit)}
    >
      <div className="d-day">
        <span aria-hidden="true">{day.weekday}</span>
        {day.today && <span className="today-tag">Today</span>}
        <SelectBox day={day} actions={actions} />
      </div>
      <div className="d-date">
        <button type="button" className="sheet-date" onClick={() => actions.onEdit(day.workDate)} aria-label={`${verb} ${day.workDate}`}>
          {day.dateText}
        </button>
      </div>
      <div className="d-label" data-cell="label">
        {(day.label.main !== '' || day.label.lines.length > 0) && <RowName name={SHEET_ROWS.label} />}
        <LabelContent label={day.label} />
      </div>
      <div className={`d-time${day.time.attention ? ' attention' : ''}`} data-cell="time">
        {hasTime && <RowName name={SHEET_ROWS.time} />}
        <TimeContent time={day.time} />
      </div>
      <div className="d-ot" data-cell="ot">
        {day.ot.kind !== 'blank' && <RowName name="OT" />}
        <OtContent ot={day.ot} />
      </div>
      <div className="d-check" data-cell="check">
        {day.check !== null && (
          <>
            <RowName name={SHEET_ROWS.check} />
            <CheckBadge check={day.check} />
          </>
        )}
      </div>
      {details && (
        <>
          <div className="d-detail">
            {day.details.regular !== '' && <RowName name={DETAIL_ROWS.regular} />}
            <span data-detail="regular" data-detail-day={day.workDate}>
              {day.details.regular}
            </span>
          </div>
          <div className="d-detail">
            {day.details.offCalendar !== '' && <RowName name={DETAIL_ROWS.offCalendar} />}
            <span data-detail="off-calendar" data-detail-day={day.workDate}>
              {day.details.offCalendar}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** One Monday to Sunday band of the desktop sheet, with the Excel rows Day, Date, Label, Time, OT and Check. */
function SheetWeekGrid({ week, details, actions }: { week: SheetWeek; details: boolean; actions: DayActions }) {
  return (
    <section className="sheet-week" aria-label={`Week ${week.index}, ${week.rangeName}`}>
      <div className="week-bar">
        <strong>WEEK {week.index}</strong>
        <span className="mono muted">{week.rangeText}</span>
      </div>
      <div className={`week-grid${details ? ' with-details' : ''}`}>
        <div className="row-labels" aria-hidden="true">
          <div>{SHEET_ROWS.day}</div>
          <div>{SHEET_ROWS.date}</div>
          <div>{SHEET_ROWS.label}</div>
          <div>{SHEET_ROWS.time}</div>
          <div>{SHEET_ROWS.ot}</div>
          <div>{SHEET_ROWS.check}</div>
          {details && (
            <>
              <div>{DETAIL_ROWS.regular}</div>
              <div>{DETAIL_ROWS.offCalendar}</div>
            </>
          )}
        </div>
        {week.days.map((day) => (
          <SheetDayColumn key={day.workDate} day={day} details={details} actions={actions} />
        ))}
      </div>
    </section>
  );
}

/** The legend of the sheet's day states; every state also has words or a shape in the cells. */
function Legend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li>
        <i className="swatch swatch-off" aria-hidden="true" />
        Weekend or holiday
      </li>
      <li>
        <i className="swatch swatch-today" aria-hidden="true" />
        Today
      </li>
      <li>
        <i className="swatch swatch-attention" aria-hidden="true" />
        Needs your input
      </li>
      <li>
        <span className="status status-complete">
          <span className="shape shape-circle" aria-hidden="true" />
          Complete
        </span>
      </li>
      <li>
        <span className="ot-pending">pending</span> OT not in the total yet
      </li>
    </ul>
  );
}

/**
 * The employee and manager signature lines, from the finalization state. Labels, the signer's name
 * and dates only: the signature image stays on the review screen.
 */
function SignatureStrip({ payrollDate, finalization, reportingZone }: { payrollDate: string; finalization: FinalizationResponse | null; reportingZone: string }) {
  const lines = finalization === null ? null : signatureLines(finalization, reportingZone);
  const linkLabel = reviewLinkLabel(finalization === null ? null : periodStatus(finalization));
  return (
    <section className="signatures" aria-label="Signatures">
      <div className="sig">
        <div className="sig-line">
          <span className="sig-state" data-signature="employee">
            {lines?.employee ?? ''}
          </span>
          <a className="button-link sig-link" href={reviewHash(payrollDate)} data-sheet-review-link={payrollDate}>
            {linkLabel}
          </a>
        </div>
        <span className="sig-cap">Employee Signature</span>
      </div>
      <div className="sig">
        <div className="sig-line">
          <span className="mono" data-signature="employee-date">
            {lines?.date ?? ''}
          </span>
        </div>
        <span className="sig-cap">Date</span>
      </div>
      <div className="sig">
        <div className="sig-line">
          <span className="sig-state">Not used yet</span>
        </div>
        <span className="sig-cap">Manager Signature</span>
      </div>
      <div className="sig">
        <div className="sig-line" />
        <span className="sig-cap">Date</span>
      </div>
    </section>
  );
}

/**
 * The Timesheet page in the layout of the Excel form and the PDF: the form header, two Monday to
 * Sunday week bands (a 7-column sheet from 768px, a 4-column table per week below), the Overtime
 * Total, the legend and the signature lines. Every number is a server field shown as h:mm.
 */
export function TimesheetSheet({
  view,
  employeeName,
  zone,
  todayLocal,
  desktop,
  actions,
  details,
  finalization,
  signatures,
}: {
  view: TimesheetView;
  employeeName: string;
  /** The display zone of session times; dates stay the saved accounting dates. */
  zone: string;
  todayLocal: string | null;
  desktop: boolean;
  actions: DayActions;
  /** "Show details" of the toolbar: the worked-on-a-workday and worked-on-a-day-off rows. */
  details: boolean;
  /** The period's finalization state for the signature lines; null while loading. */
  finalization: FinalizationResponse | null;
  /** False in a shared view and for an imported period: the signature lines and the review link are the owner's. */
  signatures: boolean;
}) {
  const weeks = sheetWeeks(view.days, zone, todayLocal);
  const total = overtimeTotal(view.totals);
  const { period } = view;
  return (
    <article className={`sheet ${desktop ? 'sheet-desktop' : 'sheet-phone'}`} aria-label="Timesheet form" data-sheet={desktop ? 'desktop' : 'phone'}>
      <header className="form-head">
        <div className="form-brand">
          <div className="company">{SHEET_COMPANY}</div>
          <div className="form-title">{SHEET_TITLE}</div>
        </div>
        <dl className="form-fields">
          <div>
            <dt>Employee:</dt>
            <dd>{employeeName}</dd>
          </div>
          <div>
            <dt>Payroll Date:</dt>
            <dd className="mono">{usDate(period.payroll_date)}</dd>
          </div>
          <div>
            <dt>Period:</dt>
            <dd className="mono">
              {usDate(period.period_start)} - {usDate(period.period_end)}
            </dd>
          </div>
        </dl>
      </header>

      {weeks.map((week) =>
        desktop ? (
          <SheetWeekGrid key={week.index} week={week} details={details} actions={actions} />
        ) : (
          <SheetWeekTable key={week.index} week={week} details={details} actions={actions} />
        ),
      )}

      <div className="sheet-foot">
        <div className="foot-notes">
          {total.pendingNote !== null && <p className="pending-note">{total.pendingNote}</p>}
          <p className="muted hint">Provisional: OT is added to your balance when the period is finalized.</p>
          <Legend />
        </div>
        <div className="ot-total" role="group" aria-label="Overtime total">
          <span className="ot-total-label">Overtime Total :</span>
          <span className="ot-total-value mono" data-ot-total={view.totals.provisional_credited_minutes}>
            {total.text}
          </span>
          <span className="ot-total-unit">h:mm</span>
        </div>
      </div>

      {signatures && <SignatureStrip payrollDate={period.payroll_date} finalization={finalization} reportingZone={view.reporting_zone} />}
    </article>
  );
}
