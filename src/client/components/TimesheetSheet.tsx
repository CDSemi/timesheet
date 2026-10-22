import { type FocusEvent, type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import type { FinalizationResponse, TimesheetView } from '../api.ts';
import { CheckBadge, LabelContent, OtContent, RangeFormContext, TimeContent } from './DayStatus.tsx';
import { usDate } from './format.ts';
import { reviewHash } from './reviewModel.ts';
import {
  dayButtonName,
  dayClass,
  DETAIL_ROWS,
  liftRuns,
  type LiftRun,
  longestRangeText,
  overtimeTotal,
  type RangeForm,
  rangeFormFor,
  revealDelta,
  SHEET_ROWS,
  SHEET_TITLE,
  type SheetDay,
  type SheetWeek,
  sheetWeeks,
  signatureLines,
} from './sheetModel.ts';
import {
  type DayActions,
  dayVerb,
  isEditingDay,
  LabelPicker,
  labelPickerOf,
  openOnClick,
  pressDay,
  REVIEW_ACTIONS,
  ReviewNote,
  SelectBox,
  SheetWeekTable,
} from './SheetWeekTable.tsx';

/** The company's name as the PDF and the top bar print it. */
const COMPANY_NAME = 'C&D Semiconductor Services, Inc.';

/** A cell's row name for screen readers; the visual row-label column is hidden from them. */
function RowName({ name }: { name: string }) {
  return <span className="sr-only">{name}: </span>;
}

/**
 * One day of the desktop sheet: a column of cells on the week's shared rows (CSS subgrid). `lift` is the day's place in a
 * run of adjacent lifted days (`liftRuns`); the column carries it as `data-lift`, and the style sheet draws the raise.
 */
function SheetDayColumn({ day, details, actions, lift }: { day: SheetDay; details: boolean; actions: DayActions; lift: LiftRun | null }) {
  const verb = dayVerb(actions);
  const picker = labelPickerOf(actions);
  const hasTime = day.time.ranges.length > 0 || day.time.note !== null;
  const review = actions.review === true;
  const editing = isEditingDay(day, actions);
  return (
    <div
      className={dayClass(day, { selected: actions.selected.has(day.workDate), editing }, review ? 'sheet-day sheet-day-static' : 'sheet-day')}
      data-day={review ? undefined : day.workDate}
      data-review-day={review ? day.workDate : undefined}
      data-editing={editing ? 'true' : undefined}
      data-lift={lift ?? undefined}
      role="group"
      aria-label={day.name}
      onClick={review ? undefined : openOnClick(day.workDate, actions.onEdit)}
    >
      <div className="d-day">
        <span aria-hidden="true">{day.weekday}</span>
        {day.today && <span className="today-tag">Today</span>}
        <SelectBox day={day} actions={actions} />
      </div>
      <div className="d-date">
        {review ? (
          <span className="sheet-date-text">{day.dateText}</span>
        ) : (
          <button type="button" className="sheet-date" onClick={pressDay(day.workDate, actions)} aria-label={dayButtonName(verb, day, 'sheet')} aria-current={editing ? 'true' : undefined} data-day-button>
            {day.dateText}
          </button>
        )}
      </div>
      <div className={`d-label${picker === null ? '' : ' with-picker'}`} data-cell="label">
        {picker === null ? (
          <>
            {(day.label.main !== '' || day.label.lines.length > 0) && <RowName name={SHEET_ROWS.label} />}
            <LabelContent label={day.label} />
          </>
        ) : (
          <LabelPicker day={day} picker={picker} />
        )}
        {review && <ReviewNote day={day} />}
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

/**
 * From 480 to 929px the week card scrolls sideways inside itself (styles.css). The browser leaves a partly visible control
 * where it is when it takes focus, so the card is scrolled until the focused control lies inside its visible box less its
 * scroll padding (`--focus-clearance`, wider than the focus ring). A card that does not scroll is left alone.
 */
function revealFocused(event: FocusEvent<HTMLElement>) {
  const card = event.currentTarget;
  const style = getComputedStyle(card);
  if (style.overflowX === 'visible' || !(event.target instanceof Element)) return;
  const padding = (value: string) => Number.parseFloat(value) || 0;
  const box = card.getBoundingClientRect();
  const left = box.left + card.clientLeft;
  const top = box.top + card.clientTop;
  const target = event.target.getBoundingClientRect();
  const dx = revealDelta(
    { start: left + padding(style.scrollPaddingLeft), end: left + card.clientWidth - padding(style.scrollPaddingRight) },
    { start: target.left, end: target.right },
  );
  const dy = revealDelta(
    { start: top + padding(style.scrollPaddingTop), end: top + card.clientHeight - padding(style.scrollPaddingBottom) },
    { start: target.top, end: target.bottom },
  );
  if (dx !== 0 || dy !== 0) card.scrollBy({ left: dx, top: dy, behavior: 'instant' });
}

/** One Monday to Sunday band of the desktop sheet, with the Excel rows Day, Date, Category, Time, OT and Status. */
function SheetWeekGrid({ week, details, actions }: { week: SheetWeek; details: boolean; actions: DayActions }) {
  // A day is lifted while it is selected for a batch change or open in the Day editor; runs never cross a band.
  const runs = liftRuns(week.days.map((day) => actions.selected.has(day.workDate) || isEditingDay(day, actions)));
  return (
    <section className="sheet-week" aria-label={`Week ${week.index}, ${week.rangeName}`} onFocus={revealFocused}>
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
        {week.days.map((day, index) => (
          <SheetDayColumn key={day.workDate} day={day} details={details} actions={actions} lift={runs[index] ?? null} />
        ))}
      </div>
    </section>
  );
}

/**
 * Which form of the time ranges a sheet shows (round 5, U5-07), decided once per sheet so it never mixes the forms: the spaced
 * "10:30 - 18:30" while the longest range of the sheet fits on one line in a time cell, else the tight "10:30-18:30" (`rangeFormFor`;
 * the tight text may wrap only where even it does not fit). The text is measured with a temporary hidden copy inside a time cell (so it
 * has the cell's own font) against the cell's content box, again whenever the sheet's width or its layout changes. A range in the
 * spaced or tight form never wraps (`white-space: nowrap`).
 */
function useRangeForm(sheet: RefObject<HTMLElement | null>, longest: string, desktop: boolean): RangeForm {
  const [form, setForm] = useState<RangeForm>('spaced');
  useLayoutEffect(() => {
    const root = sheet.current;
    if (root === null || longest === '') {
      setForm('spaced');
      return;
    }
    const measure = () => {
      const cell = root.querySelector<HTMLElement>('[data-cell="time"], td.t-time');
      if (cell === null) return;
      const style = getComputedStyle(cell);
      const box = cell.clientWidth - (Number.parseFloat(style.paddingLeft) || 0) - (Number.parseFloat(style.paddingRight) || 0);
      const widthOf = (text: string) => {
        const probe = document.createElement('span');
        probe.textContent = text;
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none';
        cell.append(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        return width;
      };
      setForm(rangeFormFor(widthOf(longest), widthOf(longest.replace(' - ', '-')), box));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [sheet, longest, desktop]);
  return form;
}

/** The legend of the sheet's day states; every state also has words or a shape in the cells. */
function Legend({ today }: { today: boolean }) {
  return (
    <ul className="legend" aria-label="Legend">
      <li>
        <i className="swatch swatch-off" aria-hidden="true" />
        Weekend or holiday
      </li>
      {today && (
        <li>
          <i className="swatch swatch-today" aria-hidden="true" />
          Today
        </li>
      )}
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
function SignatureStrip({
  payrollDate,
  finalization,
  reportingZone,
  linkLabel,
}: {
  payrollDate: string;
  finalization: FinalizationResponse | null;
  reportingZone: string;
  /** The words of the link to the Review, the same as the period card's (`reviewLinkOf`). */
  linkLabel: string;
}) {
  const lines = finalization === null ? null : signatureLines(finalization, reportingZone);
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
 * Sunday week bands (a 7-column sheet from 480px, a 4-column table per week below), the Overtime
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
  reviewLinkLabel,
  signatures,
}: {
  view: TimesheetView;
  employeeName: string;
  /** The display zone of session times; dates stay the saved accounting dates. */
  zone: string;
  todayLocal: string | null;
  desktop: boolean;
  actions: DayActions;
  /** "Worked hours" of the toolbar: the "Worked, workday" and "Worked, day off" rows. */
  details: boolean;
  /** The period's finalization state for the signature lines; null while loading. */
  finalization: FinalizationResponse | null;
  /** The words of the signature line's link to the Review: the period card's own (`reviewLinkOf`), so the two always agree. */
  reviewLinkLabel: string;
  /** False in a shared view and for an imported period: the signature lines and the review link are the owner's. */
  signatures: boolean;
}) {
  const sheet = useRef<HTMLElement>(null);
  const weeks = sheetWeeks(view.days, zone, todayLocal);
  const rangeForm = useRangeForm(sheet, longestRangeText(weeks), desktop);
  const total = overtimeTotal(view.totals);
  const { period } = view;
  return (
    <article ref={sheet} className={`sheet ${desktop ? 'sheet-desktop' : 'sheet-phone'}`} aria-label="Timesheet form" data-sheet={desktop ? 'desktop' : 'phone'} data-ranges={rangeForm}>
      <header className="form-head">
        <div className="form-brand">
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

      <RangeFormContext value={rangeForm}>
        {weeks.map((week) =>
          desktop ? (
            <SheetWeekGrid key={week.index} week={week} details={details} actions={actions} />
          ) : (
            <SheetWeekTable key={week.index} week={week} details={details} actions={actions} />
          ),
        )}
      </RangeFormContext>

      <div className="sheet-footer">
        <div className="sheet-foot">
          <div className="foot-notes">
            {total.pendingNote !== null && <p className="pending-note">{total.pendingNote}</p>}
            <p className="muted hint">Provisional: OT is added to your balance when the period is finalized.</p>
            <Legend today />
          </div>
          <div className="ot-total" role="group" aria-label="Overtime total">
            <span className="ot-total-label">Overtime Total :</span>
            <span className="ot-total-value mono" data-ot-total={view.totals.provisional_credited_minutes}>
              {total.text}
            </span>
            <span className="ot-total-unit">h:mm</span>
          </div>
        </div>

        {signatures && <SignatureStrip payrollDate={period.payroll_date} finalization={finalization} reportingZone={view.reporting_zone} linkLabel={reviewLinkLabel} />}
      </div>
    </article>
  );
}

/**
 * The company line of the Preview (U5-29 line 1): large, centred and always one line. When its max-content width does not fit the
 * room it has, the line is hidden and not wrapped (the page keeps the company name in the top bar); the measure is the text's own
 * width, read again whenever the room changes.
 */
function CompanyLine() {
  const box = useRef<HTMLParagraphElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);
  useLayoutEffect(() => {
    const outer = box.current;
    const inner = text.current;
    if (outer === null || inner === null) return;
    const measure = () => setFits(inner.getBoundingClientRect().width <= outer.getBoundingClientRect().width + 0.5);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);
  return (
    <p ref={box} className="review-company" data-fits={fits ? 'true' : 'false'} aria-hidden={fits ? undefined : true}>
      <span ref={text}>{COMPANY_NAME}</span>
    </p>
  );
}

/**
 * The geometry of the two signature rows of the Review preview and of the Sign off dialog's preview (owner correction of
 * 2026-10-21, "indent like B11"): the left inset of the lines, their lengths, the gap between them and the inset of the Date
 * line from the right are the PDF's own fractions of the content width (`--sig-*` tokens, measured from the PDF page and checked
 * against `src/server/pdf/layout.ts`). Employee Signature + Date make the first row and Manager Signature + Date the second; the
 * four lines align by row and by column. `children` is the content at the end of the employee line (the Sign off button).
 */
export function SignatureRows({
  employee,
  employeeDate,
  manager,
  action,
}: {
  /** What stands on the employee line (the signed image, name and mark), or nothing before the sign-off. */
  employee: ReactNode;
  /** The date on the employee Date line. */
  employeeDate: ReactNode;
  /** The manager line's text ("Not used yet"). */
  manager: ReactNode;
  /** The control at the end of the employee line, 8px from its end (the Sign off button). */
  action?: ReactNode;
}) {
  return (
    <div className="review-signatures" role="group" aria-label="Signatures">
      <div className="rsig-row" data-sig-row="employee">
        <div className="rsig rsig-sign">
          <div className="rsig-line" data-sig-line="employee">
            <div className="rsig-content">{employee}</div>
            {action !== undefined && <div className="rsig-action">{action}</div>}
          </div>
          <span className="rsig-cap">Employee Signature</span>
        </div>
        <div className="rsig rsig-date">
          <div className="rsig-line" data-sig-line="employee-date">
            <span className="mono" data-signature="employee-date">
              {employeeDate}
            </span>
          </div>
          <span className="rsig-cap">Date</span>
        </div>
      </div>
      <div className="rsig-row" data-sig-row="manager">
        <div className="rsig rsig-sign">
          <div className="rsig-line" data-sig-line="manager">
            <span className="muted rsig-note">{manager}</span>
          </div>
          <span className="rsig-cap">Manager Signature</span>
        </div>
        <div className="rsig rsig-date">
          <div className="rsig-line" data-sig-line="manager-date" />
          <span className="rsig-cap">Date</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The Preview of the Review page (U5-29): the same sheet in read-only mode, fed by the review payload (see `reviewSheetWeeks`). The
 * header is the company line, the title and the fields; then the week bands (detail rows always on, no day opens), the legend, the
 * pending note with Overtime Total and the two signature rows. The sign-off control sits in the Employee Signature line.
 */
export function ReviewSheet({
  weeks,
  employeeName,
  period,
  desktop,
  totalCredited,
  pendingDays,
  signature,
}: {
  weeks: SheetWeek[];
  employeeName: string;
  period: { payroll_date: string; period_start: string; period_end: string };
  desktop: boolean;
  /** The payload's `totals.credited_minutes`: the OT credit if signed now. */
  totalCredited: number;
  /** The payload's `totals.pending_days`. */
  pendingDays: number;
  /** The signature rows (`SignatureRows`) with the owner's state in them. */
  signature: ReactNode;
}) {
  const sheet = useRef<HTMLElement>(null);
  const rangeForm = useRangeForm(sheet, longestRangeText(weeks), desktop);
  const total = overtimeTotal({ provisional_credited_minutes: totalCredited, pending_days: pendingDays });
  return (
    <article ref={sheet} className={`sheet sheet-review ${desktop ? 'sheet-desktop' : 'sheet-phone'}`} aria-label="Timesheet preview" data-sheet={desktop ? 'desktop' : 'phone'} data-ranges={rangeForm}>
      <header className="form-head review-form-head">
        <CompanyLine />
        <div className="review-title" data-review-title>
          {SHEET_TITLE}
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

      <RangeFormContext value={rangeForm}>
        {weeks.map((week) =>
          desktop ? (
            <SheetWeekGrid key={week.index} week={week} details actions={REVIEW_ACTIONS} />
          ) : (
            <SheetWeekTable key={week.index} week={week} details actions={REVIEW_ACTIONS} />
          ),
        )}
      </RangeFormContext>

      <div className="sheet-footer">
        <div className="sheet-foot">
          <div className="foot-notes">
            {total.pendingNote !== null && <p className="pending-note">{total.pendingNote}</p>}
            <Legend today={false} />
          </div>
          <div className="ot-total" role="group" aria-label="Overtime total">
            <span className="ot-total-label">Overtime Total :</span>
            <span className="ot-total-value mono" data-ot-total={totalCredited}>
              {total.text}
            </span>
            <span className="ot-total-unit">h:mm</span>
          </div>
        </div>
        {signature}
      </div>
    </article>
  );
}
