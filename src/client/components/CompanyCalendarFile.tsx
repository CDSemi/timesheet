import { type ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import { api, type CalendarInfo, type CurrentPeriods, type HolidayImportPreview, type HolidayImportResult } from '../api.ts';
import { issueText, refusalMessage } from './adminModel.ts';
import { AlertDialog } from './AlertDialog.tsx';
import { describeError } from './errors.ts';
import {
  buildCompanyFile,
  calendarDatesForYear,
  type CompanyFile,
  companyCalendarProblems,
  companyYears,
  type ComparisonGroup,
  defaultCompanyYear,
  exceptionRequest,
  holidayCsvForYear,
  importNote,
  newestCalendarVersion,
  parseSettingsFile,
  planExceptions,
  serializeSettingsFile,
  settingsFileName,
  settingsFileProblem,
  weekdaysText,
} from './settingsFileModel.ts';
import { ComparisonTable, SettingsTransferDialog } from './SettingsTransferDialog.tsx';
import { downloadTextFile, utcNow, utcText } from './SettingsTransferFile.ts';

/** "1 date", "2 dates". */
const countText = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

function rowOf(key: string, label: string, now: string, file: string, changed = now !== file) {
  return { key, label, now, file, changed };
}

/**
 * The import of a company calendar file (WP5-UX4-T05; administrators only). The file was read and validated in the browser and
 * its reporting zone, payroll schedule and working weekdays equal the calendar's. The holidays and closures of one chosen year
 * go through the existing holiday-import preview and commit (the merge rule is unchanged: a date the file does not list stays),
 * and each new payroll exception through the existing payroll-exception route. Nothing is written before the one confirmation.
 */
function CompanyImportDialog({
  file,
  fileName,
  calendar,
  periods,
  opener,
  onClose,
  onImported,
}: {
  file: CompanyFile;
  fileName: string;
  calendar: CalendarInfo;
  periods: CurrentPeriods;
  opener: HTMLElement | null;
  onClose: () => void;
  onImported: (message: string) => Promise<void>;
}) {
  const years = companyYears(file.data);
  const [year, setYear] = useState(defaultCompanyYear(years, Number(periods.today_local.slice(0, 4))) ?? Number(periods.today_local.slice(0, 4)));
  const [effectiveFrom, setEffectiveFrom] = useState(periods.current.period_start);
  const [preview, setPreview] = useState<{ key: string; result: HolidayImportPreview } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const yearId = useId();
  const dateId = useId();

  const csv = holidayCsvForYear(file.data, year);
  const request = { calendar_id: calendar.id, year, effective_from: effectiveFrom, csv, remove_dates: [] as string[] };
  // The calendar's version count is part of the key: after a partly applied import the preview is asked for again.
  const key = JSON.stringify({ request, versions: calendar.versions.length });
  const exceptions = planExceptions(file.data.payroll_exceptions, calendar.payroll_exceptions);

  useEffect(() => {
    setPreview(null);
    setPreviewError(null);
    if (effectiveFrom === '') return;
    let current = true;
    api<HolidayImportPreview>('POST', '/api/admin/calendar/import/preview', request)
      .then((result) => {
        if (current) setPreview({ key, result });
      })
      .catch((caught: unknown) => {
        if (current) setPreviewError(refusalMessage(caught));
      });
    return () => {
      current = false;
    };
    // The key stands for the request; it is rebuilt from the same inputs on every render.
  }, [key]);

  const result = preview !== null && preview.key === key ? preview.result : null;
  const nowDates = calendarDatesForYear(calendar, year);
  const inFile = file.data.holidays.filter((item) => item.date.startsWith(`${year}-`));
  const groups: ComparisonGroup[] = [
    {
      id: 'calendar',
      title: 'Calendar',
      rows: [
        rowOf('zone', 'Reporting zone', calendar.reporting_zone, file.data.reporting_zone),
        rowOf('weekdays', 'Working weekdays', weekdaysText(newestCalendarVersion(calendar)?.weekdays ?? []), weekdaysText(file.data.weekdays)),
        rowOf('dates', `Holidays and closures in ${year}`, countText(nowDates.length, 'date'), countText(inFile.length, 'date')),
        rowOf(
          'exceptions',
          'Payroll exceptions',
          countText(calendar.payroll_exceptions.length, 'exception'),
          `${countText(file.data.payroll_exceptions.length, 'exception')}, ${exceptions.add.length} new`,
          exceptions.add.length > 0,
        ),
      ],
      changed: true,
    },
  ];
  const holidayChanges = result === null ? 0 : result.diff.added.length + result.diff.renamed.length + result.diff.kind_changed.length;
  const writesCalendar = result !== null && result.can_commit && !result.no_change;
  const changeCount = (writesCalendar ? 1 : 0) + exceptions.add.length;
  const confirmDisabled = result === null || !result.can_commit || changeCount === 0;

  async function confirm() {
    if (result === null || result.preview_hash === null || inFlight.current || changeCount === 0) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const done: string[] = [];
    try {
      if (writesCalendar) {
        const committed = await api<HolidayImportResult>('POST', '/api/admin/calendar/import/commit', {
          ...request,
          preview_hash: result.preview_hash,
          note: importNote(fileName),
        });
        done.push(`calendar version ${committed.version.seq} (effective from ${committed.version.effective_from})`);
      }
      for (const item of exceptions.add) {
        await api('POST', '/api/admin/payroll-exceptions', exceptionRequest(item, calendar.id, fileName));
      }
      if (exceptions.add.length > 0) done.push(countText(exceptions.add.length, 'payroll exception'));
      await onImported(`Imported from ${fileName}: ${done.join(', ')}.`);
    } catch (caught) {
      const written = done.length === 0 ? 'Nothing was written.' : `Already written: ${done.join(', ')}.`;
      setError(`${refusalMessage(caught)} ${written}`);
      await onImported('').catch(() => undefined);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <SettingsTransferDialog
      title="Import company calendar"
      description={`${fileName} · format ${file.schema_version} · exported ${utcText(file.exported_at)} from ${file.app_version}`}
      confirmLabel={`Import ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}`}
      confirmDisabled={confirmDisabled}
      busy={busy}
      opener={opener}
      onConfirm={() => void confirm()}
      onCancel={onClose}
    >
      <ComparisonTable groups={groups} caption="The calendar now and the calendar in the file" />
      <div className="field-grid">
        <label htmlFor={yearId}>
          Year to import
          <select id={yearId} value={year} onChange={(event) => setYear(Number(event.target.value))} disabled={years.length < 2}>
            {(years.length === 0 ? [year] : years).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={dateId}>
          Effective from
          <input id={dateId} type="date" value={effectiveFrom} min={periods.current.period_start} onChange={(event) => setEffectiveFrom(event.target.value)} />
        </label>
      </div>
      <p className="hint muted">
        Dates the file does not list stay in the calendar; nothing is removed. Earlier days keep their classification. Each preview is recorded in the audit log.
      </p>
      {previewError !== null && (
        <p className="error" role="alert" data-transfer="calendar-refusal">
          {previewError}
        </p>
      )}
      {result === null && previewError === null && <p className="muted">Checking the file against the calendar…</p>}
      {result !== null && <CalendarPreview result={result} effectiveFrom={effectiveFrom} holidayChanges={holidayChanges} />}
      {exceptions.differing.length > 0 && (
        <p className="notice" role="status" data-transfer="exceptions-differ">
          {countText(exceptions.differing.length, 'payroll exception')} of the file already exist{exceptions.differing.length === 1 ? 's' : ''} with other values (
          {exceptions.differing.map((item) => item.nominal_payroll_date).join(', ')}). An exception cannot be edited, so they stay as they are.
        </p>
      )}
      {error !== null && (
        <p className="error" role="alert" data-transfer="error">
          {error}
        </p>
      )}
    </SettingsTransferDialog>
  );
}

/** What the server found: problems first, then the counts and the dates that would be added or changed. */
function CalendarPreview({ result, effectiveFrom, holidayChanges }: { result: HolidayImportPreview; effectiveFrom: string; holidayChanges: number }) {
  const { diff } = result;
  return (
    <section className="stack" aria-label="Holiday import preview" data-preview-can-commit={String(result.can_commit)}>
      {result.issue_count > 0 && (
        <div className="warn-box stack" role="alert" data-preview-issues={result.issue_count}>
          <h3>{countText(result.issue_count, 'problem')} in the file's dates</h3>
          <ul className="plain">
            {result.issues.map((issue) => (
              <li key={`${issue.line}-${issue.code}`}>{issueText(issue)}</li>
            ))}
          </ul>
        </div>
      )}
      {result.effective_from_problem !== null && (
        <p className="error" role="alert" data-preview-problem={result.effective_from_problem.code}>
          {result.effective_from_problem.message} (earliest allowed: {result.earliest_effective_from})
        </p>
      )}
      {result.finalized_conflicts.length > 0 && (
        <p className="error" role="alert" data-preview-problem="finalized_period_affected">
          The change would alter days of a finalized timesheet:{' '}
          {result.finalized_conflicts.map((item) => `${item.date} (${countText(item.finalized_timesheets, 'finalized timesheet')})`).join(', ')}. Choose a later
          effective date.
        </p>
      )}
      {result.can_commit && result.no_change && (
        <p className="notice-ok" role="status" data-preview-no-change="true">
          No change to the dates: the calendar already contains exactly these dates.
        </p>
      )}
      {result.can_commit && !result.no_change && (
        <p className="notice-ok" role="status" data-preview-ready="true">
          Ready: {countText(holidayChanges, 'date')} added or changed, {diff.unchanged_count} unchanged, effective from {effectiveFrom}. The new version holds{' '}
          {countText(result.result_date_count, 'date')}.
        </p>
      )}
      {diff.added.length > 0 && <DateList title="Added" items={diff.added.map((item) => ({ date: item.date, text: `${item.name} (${item.kind})` }))} />}
      {diff.renamed.length > 0 && (
        <DateList title="Renamed" items={diff.renamed.map((item) => ({ date: item.date, text: `${item.before.name} to ${item.after.name}` }))} />
      )}
      {diff.kind_changed.length > 0 && (
        <DateList title="Kind changed" items={diff.kind_changed.map((item) => ({ date: item.date, text: `${item.before.kind} to ${item.after.kind}` }))} />
      )}
      {diff.ignored_past.length > 0 && (
        <p className="hint muted">{countText(diff.ignored_past.length, 'listed date')} before the effective date ignored: past days are never changed.</p>
      )}
      {result.affected_days.length > 0 && (
        <p className="hint muted" data-transfer="affected">
          {countText(result.affected_days.length, 'day')} {result.affected_days.length === 1 ? 'changes its' : 'change their'} default category; explicit categories and manual dates are kept.
        </p>
      )}
    </section>
  );
}

function DateList({ title, items }: { title: string; items: Array<{ date: string; text: string }> }) {
  return (
    <div data-diff={title.toLowerCase().replace(' ', '_')}>
      <h4>
        {title} ({items.length})
      </h4>
      <ul className="plain">
        {items.map((item) => (
          <li key={item.date} className="ot-line">
            <span className="mono">{item.date}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The company calendar file card of Administration (WP5-UX4-T05, F-3 (a)): export the calendar of this administrator (weekdays,
 * holidays and closures, payroll exceptions; no person, no timesheet data) and import such a file. Shown to administrators only;
 * the server answers 403 to the admin routes for anyone else.
 */
export function CompanyCalendarFile({
  calendar,
  periods,
  onImported,
}: {
  calendar: CalendarInfo;
  periods: CurrentPeriods;
  onImported: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refused, setRefused] = useState<string[] | null>(null);
  const [imported, setImported] = useState<{ file: CompanyFile; name: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // The refusal alert returns no focus itself; the file input takes it once the alert is gone.
  const [refocus, setRefocus] = useState(0);
  useEffect(() => {
    if (refocus > 0) input.current?.focus();
  }, [refocus]);

  async function exportFile() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      // Read again, so the file holds what the server holds now.
      const [fresh, today] = await Promise.all([api<CalendarInfo>('GET', '/api/calendar'), api<CurrentPeriods>('GET', '/api/periods/current')]);
      const file = buildCompanyFile(fresh, utcNow());
      if (file === null) {
        setError('The calendar has no version to export yet.');
        return;
      }
      const name = settingsFileName('company', today.today_local);
      downloadTextFile(name, serializeSettingsFile(file));
      setNotice(`Downloaded ${name}. It holds the company's holidays, closures and payroll exceptions. Keep it private.`);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = '';
    if (chosen === undefined) return;
    setError(null);
    setNotice(null);
    const problem = settingsFileProblem(chosen.name, chosen.size);
    if (problem !== null) {
      setRefused([problem]);
      return;
    }
    const result = parseSettingsFile(await chosen.text(), 'company');
    if (!result.ok || result.file.scope !== 'company') {
      setRefused(result.ok ? ['This file is not a company calendar file.'] : result.problems);
      return;
    }
    const mismatches = companyCalendarProblems(result.file.data, calendar);
    if (mismatches.length > 0) {
      setRefused(mismatches);
      return;
    }
    setImported({ file: result.file, name: chosen.name });
  }

  return (
    <section className="card stack" aria-label="Company calendar file" data-transfer="company">
      <h2>Company calendar file</h2>
      <p>Download the calendar of {calendar.name} as a file, or load one: working weekdays, holidays and closures per year, and payroll exceptions.</p>
      <ul className="transfer-list">
        <li>Included: working weekdays, holidays and closures, payroll exceptions.</li>
        <li>Never included: people, accounts, timesheets or any personal setting. A file for another reporting zone or payroll schedule is refused.</li>
      </ul>
      <div className="button-row">
        <button type="button" className="secondary" disabled={busy} onClick={() => void exportFile()}>
          Export company calendar
        </button>
      </div>
      <label>
        Import a company calendar file (.json)
        <input ref={input} type="file" accept=".json,application/json" onChange={(event) => void chooseFile(event)} />
      </label>
      <p className="hint muted">
        <strong>Keep it private.</strong> An import shows what changes first and goes through the same checks as the holiday CSV; nothing is saved until you confirm.
      </p>
      {error !== null && (
        <p className="error" role="alert" data-transfer="export-error">
          {error}
        </p>
      )}
      {notice !== null && (
        <p className="notice-ok" role="status" data-transfer="notice">
          {notice}
        </p>
      )}
      {refused !== null && (
        <AlertDialog
          title="This file cannot be imported"
          messages={refused}
          hint="Nothing was changed."
          onClose={() => {
            setRefused(null);
            setRefocus((count) => count + 1);
          }}
        />
      )}
      {imported !== null && (
        <CompanyImportDialog
          file={imported.file}
          fileName={imported.name}
          calendar={calendar}
          periods={periods}
          opener={input.current}
          onClose={() => setImported(null)}
          onImported={async (message) => {
            await onImported();
            if (message !== '') {
              setImported(null);
              setNotice(message);
            }
          }}
        />
      )}
    </section>
  );
}
