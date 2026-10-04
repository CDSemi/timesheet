import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { api, type HolidayImportPreview, type HolidayImportRequest, type HolidayImportResult } from '../api.ts';
import { type CalendarOption, csvFileProblem, issueText, refusalMessage } from './adminModel.ts';

interface Plan {
  signature: string;
  preview: HolidayImportPreview;
}

function RuleList({ title, rules, name }: { title: string; rules: Array<{ date: string; name: string; kind: string }>; name: string }) {
  if (rules.length === 0) return null;
  return (
    <div data-diff={name}>
      <h4>
        {title} ({rules.length})
      </h4>
      <ul className="plain">
        {rules.map((rule) => (
          <li key={rule.date} className="ot-line" data-diff-date={rule.date}>
            <span className="mono">{rule.date}</span>
            <span>{rule.name}</span>
            <span className="muted">{rule.kind}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What the server found in the CSV and what the import would change; everything here is configuration. */
function PreviewResult({
  preview,
  effectiveFrom,
  removeDates,
  onToggleRemove,
}: {
  preview: HolidayImportPreview;
  effectiveFrom: string;
  removeDates: string[];
  onToggleRemove: (date: string) => void;
}) {
  const { diff } = preview;
  const removable = diff.kept.filter((rule) => rule.date >= effectiveFrom);
  return (
    <section className="stack" aria-label="Holiday import preview" data-preview-can-commit={String(preview.can_commit)}>
      {preview.issue_count > 0 && (
        <div className="warn-box stack" role="alert" data-preview-issues={preview.issue_count}>
          <h3>{preview.issue_count} problem(s) in the CSV</h3>
          <ul className="plain">
            {preview.issues.map((issue) => (
              <li key={`${issue.line}-${issue.code}`} data-issue-code={issue.code}>
                {issueText(issue)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {preview.effective_from_problem !== null && (
        <p className="error" role="alert" data-preview-problem={preview.effective_from_problem.code}>
          {preview.effective_from_problem.message} (earliest allowed: {preview.earliest_effective_from})
        </p>
      )}
      {preview.finalized_conflicts.length > 0 && (
        <p className="error" role="alert" data-preview-problem="finalized_period_affected">
          The change would alter days of a finalized timesheet: {preview.finalized_conflicts.map((item) => item.date).join(', ')}. Choose a later effective date.
        </p>
      )}
      {preview.removal_problems.length > 0 && (
        <p className="error" role="alert" data-preview-problem="removal">
          A date selected for removal cannot be removed from this version. Clear the selection and preview again.
        </p>
      )}
      {preview.can_commit && preview.no_change && (
        <p className="notice-ok" role="status" data-preview-no-change="true">
          No change: the calendar already contains exactly these dates.
        </p>
      )}
      {preview.can_commit && !preview.no_change && (
        <p className="notice-ok" role="status">
          Ready to commit: {preview.result_date_count} dates in the new version, effective from {effectiveFrom}.
        </p>
      )}
      <RuleList title="Added" name="added" rules={diff.added} />
      <RuleList title="Removed" name="removed" rules={diff.removed} />
      {diff.renamed.length > 0 && (
        <div data-diff="renamed">
          <h4>Renamed ({diff.renamed.length})</h4>
          <ul className="plain">
            {diff.renamed.map((change) => (
              <li key={change.date} className="ot-line">
                <span className="mono">{change.date}</span>
                <span>
                  {change.before.name} to {change.after.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {diff.kind_changed.length > 0 && (
        <div data-diff="kind_changed">
          <h4>Kind changed ({diff.kind_changed.length})</h4>
          <ul className="plain">
            {diff.kind_changed.map((change) => (
              <li key={change.date} className="ot-line">
                <span className="mono">{change.date}</span>
                <span>
                  {change.before.kind} to {change.after.kind}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted" data-diff="counts">
        {diff.unchanged_count} date(s) unchanged, {diff.ignored_past.length} listed date(s) before the effective date ignored.
      </p>
      {preview.affected_days.length > 0 && (
        <div data-diff="affected">
          <h4>Days whose default label changes ({preview.affected_days.length})</h4>
          <p className="hint muted">Labels you set yourself are never replaced; only default labels follow the calendar.</p>
          <ul className="plain">
            {preview.affected_days.map((day) => (
              <li key={day.date} className="ot-line" data-affected-date={day.date}>
                <span className="mono">{day.date}</span>
                <span>
                  {day.label_before ?? 'none'} to {day.label_after ?? 'none'}
                </span>
                <span className="muted">
                  {day.default_labelled_entries} default entries follow, {day.explicit_overrides_preserved} personal labels preserved
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <details data-diff="kept">
        <summary>Kept dates ({diff.kept.length}): dates the CSV does not list stay unless you select them for removal</summary>
        <ul className="plain">
          {diff.kept.map((rule) => (
            <li key={rule.date} className="ot-line" data-kept-date={rule.date}>
              <span className="mono">{rule.date}</span>
              <span>{rule.name}</span>
              {removable.some((item) => item.date === rule.date) && (
                <label className="inline">
                  <input type="checkbox" checked={removeDates.includes(rule.date)} onChange={() => onToggleRemove(rule.date)} />
                  Remove {rule.date}
                </label>
              )}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

/**
 * Holiday CSV (FR-13, AC-05): paste or choose a file, preview on the server, then commit with the
 * preview hash and the effective date (E-4). Any change to the inputs retires the preview, so a
 * commit always carries the hash of exactly what was previewed.
 */
export function HolidayImport({
  calendars,
  initialYear,
  initialEffectiveFrom,
  onCommitted,
}: {
  calendars: CalendarOption[];
  initialYear: number;
  initialEffectiveFrom: string;
  onCommitted: () => Promise<void>;
}) {
  const [calendarId, setCalendarId] = useState(calendars[0]?.id ?? '');
  const [year, setYear] = useState(String(initialYear));
  const [effectiveFrom, setEffectiveFrom] = useState(initialEffectiveFrom);
  const [csv, setCsv] = useState('');
  const [removeDates, setRemoveDates] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const yearNumber = /^\d{4}$/.test(year.trim()) ? Number(year.trim()) : null;
  const request: HolidayImportRequest | null =
    yearNumber === null || calendarId === '' || effectiveFrom === ''
      ? null
      : { calendar_id: calendarId, year: yearNumber, effective_from: effectiveFrom, csv, remove_dates: [...removeDates].sort() };
  const signature = request === null ? null : JSON.stringify(request);
  const current = plan !== null && plan.signature === signature ? plan.preview : null;

  function touched() {
    setOutcome(null);
    setError(null);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    touched();
    const problem = csvFileProblem(file.name, file.size);
    if (problem !== null) {
      setError(problem);
      return;
    }
    setCsv(await file.text());
    setRemoveDates([]);
  }

  async function runPreview() {
    if (request === null || csv.trim() === '') return;
    setBusy(true);
    touched();
    try {
      const preview = await api<HolidayImportPreview>('POST', '/api/admin/calendar/import/preview', request);
      setPlan({ signature: JSON.stringify(request), preview });
    } catch (caught) {
      setPlan(null);
      setError(refusalMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function commit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request === null || current === null || current.preview_hash === null || busy) return;
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const result = await api<HolidayImportResult>('POST', '/api/admin/calendar/import/commit', {
        ...request,
        preview_hash: current.preview_hash,
        ...(note.trim() === '' ? {} : { note: note.trim() }),
      });
      setOutcome(
        result.unchanged
          ? `No change: the calendar already holds these dates (version ${result.version.seq}).`
          : `Committed as calendar version ${result.version.seq}, effective from ${result.version.effective_from}.`,
      );
      await onCommitted();
    } catch (caught) {
      setError(refusalMessage(caught));
      // A stale preview or a changed calendar: the old plan is no longer valid.
      setPlan(null);
    } finally {
      setBusy(false);
    }
  }

  function toggleRemove(date: string) {
    touched();
    setRemoveDates((dates) => (dates.includes(date) ? dates.filter((item) => item !== date) : [...dates, date]));
  }

  return (
    <form className="card stack" aria-label="Holiday import" onSubmit={commit}>
      <h2>Holiday CSV import</h2>
      <p className="hint muted">Format: date,name,kind per line (kind is holiday or closure and may be left out). Nothing changes until you preview and then commit.</p>
      <div className="field-grid">
        <label>
          Calendar
          <select
            value={calendarId}
            onChange={(event) => {
              touched();
              setCalendarId(event.target.value);
            }}
          >
            {calendars.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year of the dates
          <input
            inputMode="numeric"
            value={year}
            onChange={(event) => {
              touched();
              setYear(event.target.value);
            }}
          />
        </label>
        <label>
          Effective from
          <input
            type="date"
            value={effectiveFrom}
            onChange={(event) => {
              touched();
              setEffectiveFrom(event.target.value);
            }}
          />
        </label>
      </div>
      <label>
        Paste the CSV rows
        <textarea
          rows={6}
          className="mono"
          value={csv}
          onChange={(event) => {
            touched();
            setCsv(event.target.value);
          }}
        />
      </label>
      <label>
        Or choose a CSV file
        <input type="file" accept=".csv,text/csv" onChange={(event) => void chooseFile(event)} />
      </label>
      <label>
        Note for the history (optional)
        <input value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />
      </label>
      {error !== null && (
        <p className="error" role="alert" data-error="holiday">
          {error}
        </p>
      )}
      {outcome !== null && (
        <p className="notice-ok" role="status" data-status="holiday-outcome">
          {outcome}
        </p>
      )}
      {current !== null && <PreviewResult preview={current} effectiveFrom={effectiveFrom} removeDates={removeDates} onToggleRemove={toggleRemove} />}
      {plan !== null && current === null && (
        <p className="notice" role="status">
          The inputs changed after the preview. Preview again before committing.
        </p>
      )}
      <div className="button-row">
        <button type="button" className="secondary" disabled={busy || request === null || csv.trim() === ''} onClick={() => void runPreview()}>
          Preview import
        </button>
        <button type="submit" disabled={busy || current === null || !current.can_commit}>
          Commit import
        </button>
      </div>
    </form>
  );
}
