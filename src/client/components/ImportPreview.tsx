import type { ImportBatch, ImportFinding, ImportPlan, ImportPlanDay, ImportReportDay } from '../api.ts';
import { batchStateText, periodStateText, reasonText } from '../importModel.ts';

const SEVERITY_CLASS: Record<ImportFinding['severity'], string> = { error: 'badge-error', warning: 'badge-warn', info: '' };
const SEVERITY_TEXT: Record<ImportFinding['severity'], string> = { error: 'Error', warning: 'Warning', info: 'Note' };

function countText(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function kibText(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function Summary({ batch }: { batch: ImportBatch }) {
  const { report } = batch;
  const datedSheets = report.sheets.filter((sheet) => sheet.role === 'payroll_period').length;
  return (
    <section className="card stack" aria-label="Workbook summary" data-import-state={batch.state}>
      <div className="period-title">
        <h2>Workbook preview</h2>
        <span className={`badge ${batch.state === 'committed' ? 'badge-ok' : 'badge-warn'}`}>{batchStateText(batch.state)}</span>
      </div>
      <dl className="facts">
        <div>
          <dt>Source SHA-256</dt>
          <dd data-import-sha>{batch.source_sha256}</dd>
        </div>
        <div>
          <dt>Mapping version</dt>
          <dd>{batch.mapping_version}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{kibText(batch.size_bytes)}</dd>
        </div>
        <div>
          <dt>Dated sheets</dt>
          <dd>{datedSheets}</dd>
        </div>
        <div>
          <dt>Findings</dt>
          <dd>
            {countText(report.summary.errors, 'error')}, {countText(report.summary.warnings, 'warning')}, {countText(report.summary.infos, 'note')}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Findings({ findings }: { findings: readonly ImportFinding[] }) {
  if (findings.length === 0) return null;
  return (
    <section className="card stack" aria-label="Findings" data-import-findings={findings.length}>
      <h2>Findings ({findings.length})</h2>
      <p className="hint">What the reader found in the workbook. Warnings describe known template defects; nothing here changes the app until you commit.</p>
      <ul className="plain">
        {findings.map((finding, index) => (
          <li key={`${finding.code}-${index}`} className="review-line" data-finding={finding.code}>
            <span className={`badge ${SEVERITY_CLASS[finding.severity]}`}>{SEVERITY_TEXT[finding.severity]}</span>
            <span>{finding.message}</span>
            {finding.sources.length > 0 && <span className="muted mono">{finding.sources.slice(0, 4).join(', ')}{finding.sources.length > 4 ? ` +${finding.sources.length - 4}` : ''}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Periods({ plan }: { plan: ImportPlan }) {
  return (
    <section className="card stack" aria-label="Periods in the workbook">
      <h2>Periods ({plan.periods.length})</h2>
      <div className="table-wrap">
        <table className="import-table" aria-label="Periods">
          <thead>
            <tr>
              <th>Sheet</th>
              <th>Payroll date</th>
              <th>Period</th>
              <th>What happens</th>
            </tr>
          </thead>
          <tbody>
            {plan.periods.map((period) => (
              <tr key={period.sheet} data-period={period.payroll_date} data-period-state={period.state}>
                <td data-label="Sheet" className="mono">
                  {period.sheet}
                </td>
                <td data-label="Payroll date" className="mono">
                  {period.payroll_date}
                </td>
                <td data-label="Period" className="mono">
                  {period.period_start === null || period.period_end === null ? 'not known' : `${period.period_start} to ${period.period_end}`}
                </td>
                <td data-label="What happens">{periodStateText(period.state)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function labelText(report: ImportReportDay | undefined): string {
  if (report === undefined || report.label === null) return 'blank';
  return report.label.from_formula_cache ? `${report.label.value} (formula result)` : report.label.value;
}

function becomes(day: ImportPlanDay): string {
  if (day.category === null) return 'no single category';
  return day.wfh ? `${day.category}, work from home` : day.category;
}

function DayRow({ day, report }: { day: ImportPlanDay; report: ImportReportDay | undefined }) {
  return (
    <tr data-day={day.work_date} data-day-status={day.status}>
      <td data-label="Date" className="mono">
        {day.work_date}
      </td>
      <td data-label="Source cell" className="mono">
        {day.source ?? 'none'}
      </td>
      <td data-label="Label as read">{labelText(report)}</td>
      <td data-label="Becomes">{becomes(day)}</td>
      <td data-label="Flags">
        {day.status === 'importable' ? (
          <span className="badge badge-ok">Ready</span>
        ) : (
          <>
            <span className="badge badge-warn">Needs a decision</span>
            <ul className="plain muted">
              {day.reasons.map((reason) => (
                <li key={reason}>{reasonText(reason)}</li>
              ))}
            </ul>
          </>
        )}
      </td>
    </tr>
  );
}

function Days({ batch, plan }: { batch: ImportBatch; plan: ImportPlan }) {
  const shown = plan.days
    .map((day, index) => ({ day, report: batch.report.days[index] }))
    .filter((row) => row.day.status !== 'blank');
  const blank = plan.days.length - shown.length;
  return (
    <section className="card stack" aria-label="Days in the workbook">
      <h2>Days ({shown.length})</h2>
      <p className="hint">
        {plan.importable_days} ready to import, {plan.decisions_required.length} needing a decision, {blank} blank (never imported). Clock cells are
        kept in the private source and never imported.
      </p>
      <div className="table-wrap">
        <table className="import-table" aria-label="Days">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source cell</th>
              <th>Label as read</th>
              <th>Becomes</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ day, report }) => (
              <DayRow key={`${day.sheet}:${day.work_date}:${day.source ?? ''}`} day={day} report={report} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** The preview of a batch: what the workbook holds, with source cells and flags, and what each period would do. */
export function ImportPreview({ batch }: { batch: ImportBatch }) {
  return (
    <div className="stack" data-import-preview={batch.id}>
      <Summary batch={batch} />
      <Findings findings={batch.report.findings} />
      {batch.plan !== null && <Periods plan={batch.plan} />}
      {batch.plan !== null && <Days batch={batch} plan={batch.plan} />}
    </div>
  );
}
