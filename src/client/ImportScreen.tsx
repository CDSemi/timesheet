import { type SubmitEvent, useCallback, useEffect, useRef, useState } from 'react';
import { api, type ImportBatch, type ImportDecisionAction, type ImportResult, type ImportSummary, uploadWorkbook } from './api.ts';
import { displayZone, instantText } from './components/format.ts';
import { ImportCommit } from './components/ImportCommit.tsx';
import { ImportDecisions } from './components/ImportDecisions.tsx';
import { ImportPreview } from './components/ImportPreview.tsx';
import { OpeningBalancePanel } from './components/OpeningBalancePanel.tsx';
import {
  batchStateText,
  chooseAction,
  decisionList,
  defaultDecisions,
  IMPORT_MAX_BYTES,
  IMPORTED_STATUS_TEXT,
  importErrorMessage,
  workbookFileProblem,
  XLSX_FILE_EXTENSION,
} from './importModel.ts';

type Notice = 'created' | 'existing_preview' | 'already_imported' | 'committed' | 'replayed';

const NOTICE_TEXT: Record<Notice, string> = {
  created: 'The workbook was read and stored privately. Review the preview below; nothing is saved to your timesheets yet.',
  existing_preview: 'This workbook was uploaded before and is still a preview. Its preview is shown again.',
  already_imported: 'Already imported: this workbook was committed before. Nothing new was written.',
  committed: `Imported. The periods below are now read-only history marked "${IMPORTED_STATUS_TEXT}".`,
  replayed: 'Already imported: this workbook was committed before with the same decisions. Nothing new was written.',
};

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

function ResultPanel({ result }: { result: ImportResult }) {
  return (
    <section className="card stack" aria-label="Import result" data-import-result>
      <h2>Result</h2>
      <p>
        {plural(result.day_entries, 'day')} in {plural(result.periods.length, 'period')} imported as "{IMPORTED_STATUS_TEXT}".
      </p>
      {result.periods.length > 0 && (
        <ul className="plain">
          {result.periods.map((period) => (
            <li key={period.timesheet_id} className="ot-line" data-result-period={period.payroll_date}>
              <span className="mono">Payroll date {period.payroll_date}</span>
              <span>{plural(period.day_entries, 'day')}</span>
            </li>
          ))}
        </ul>
      )}
      {result.imported_on_decision.length > 0 && <p className="muted">Imported on your decision: {result.imported_on_decision.join(', ')}.</p>}
      {result.skipped.length > 0 && <p className="muted">Skipped by decision: {result.skipped.join(', ')}.</p>}
      <div className="button-row">
        <a className="button-link" href="#/timesheet">
          Open the timesheet
        </a>
      </div>
    </section>
  );
}

function PreviousImports({ imports, onOpen }: { imports: readonly ImportSummary[]; onOpen: (id: string) => void }) {
  if (imports.length === 0) return null;
  return (
    <section className="card stack" aria-label="Previous imports">
      <h2>Previous imports</h2>
      <ul className="plain">
        {imports.map((item) => (
          <li key={item.id} className="ot-line" data-import-id={item.id} data-import-batch-state={item.state}>
            <span className="mono">{instantText(item.created_at, displayZone)}</span>
            <span>{batchStateText(item.state)}</span>
            <span className="muted mono">{item.source_sha256.slice(0, 12)}</span>
            <button type="button" className="secondary" onClick={() => onOpen(item.id)}>
              Open
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The owner's own workbook import (F-1): upload, preview with source cells and flags, a decision per conflicting day
 * (default skip, only the allowed actions), then commit after a confirmation. Every rule is the server's; this screen
 * words what the server says. Below it sits the explicit opening OT balance (F-3).
 */
export function ImportScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ImportDecisionAction>>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImportSummary[]>([]);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory((await api<{ imports: ImportSummary[] }>('GET', '/api/imports')).imports);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (notice !== null) noticeRef.current?.focus();
  }, [notice]);

  const show = useCallback((next: ImportBatch, why: Notice | null) => {
    setBatch(next);
    setDecisions(defaultDecisions(next.plan));
    setConfirming(false);
    setCommitError(null);
    setNotice(why);
  }, []);

  const fileProblem = file === null ? null : workbookFileProblem(file);

  async function upload(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file === null || fileProblem !== null || busy) return;
    setBusy(true);
    setUploadError(null);
    try {
      const answer = await uploadWorkbook(file);
      show(answer.import, answer.created ? 'created' : answer.import.state === 'committed' ? 'already_imported' : 'existing_preview');
      await loadHistory();
    } catch (caught) {
      setUploadError(importErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function open(id: string) {
    setUploadError(null);
    try {
      show((await api<{ import: ImportBatch }>('GET', `/api/imports/${id}`)).import, null);
    } catch (caught) {
      setUploadError(importErrorMessage(caught));
    }
  }

  async function commit() {
    if (batch === null || batch.plan === null || busy) return;
    setBusy(true);
    setCommitError(null);
    const body = { decisions: decisionList(batch.plan, decisions) };
    try {
      const answer = await api<{ status: 'committed' | 'replayed'; import: ImportBatch }>('POST', `/api/imports/${batch.id}/commit`, body);
      show(answer.import, answer.status);
      await loadHistory();
    } catch (caught) {
      setCommitError(importErrorMessage(caught));
      setConfirming(false);
      // The plan is read again from the current rows, so a refusal that came from a changed plan shows the new one.
      try {
        const fresh = (await api<{ import: ImportBatch }>('GET', `/api/imports/${batch.id}`)).import;
        setBatch(fresh);
        if (fresh.state === 'committed') setNotice('already_imported');
        else setDecisions((current) => ({ ...defaultDecisions(fresh.plan), ...current }));
      } catch {
        // The message above already says what failed.
      }
    } finally {
      setBusy(false);
    }
  }

  const plan = batch?.plan ?? null;

  return (
    <div className="stack import-screen">
      <h1>Import and opening balance</h1>

      <section className="card stack" aria-label="Import a workbook">
        <h2>Import a workbook</h2>
        <p className="muted">
          Bring in your own earlier timesheets from the template workbook. You see a preview first, decide each unclear day and then commit.
          Imported periods become read-only history: they are never signed, submitted or sent, and they post no OT.
        </p>
        <form className="stack" onSubmit={(event) => void upload(event)}>
          <label>
            Workbook ({XLSX_FILE_EXTENSION}, up to {IMPORT_MAX_BYTES / (1024 * 1024)} MiB)
            <input
              type="file"
              accept={XLSX_FILE_EXTENSION}
              data-import-file
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setUploadError(null);
              }}
            />
          </label>
          {fileProblem !== null && (
            <p className="error" role="alert" data-error="file">
              {fileProblem}
            </p>
          )}
          {uploadError !== null && (
            <p className="error" role="alert" data-error="upload">
              {uploadError}
            </p>
          )}
          <div className="button-row">
            <button type="submit" disabled={file === null || fileProblem !== null || busy}>
              Upload and preview
            </button>
          </div>
        </form>
      </section>

      {notice !== null && (
        <p
          className={notice === 'already_imported' || notice === 'replayed' ? 'notice' : 'notice-ok'}
          role="status"
          tabIndex={-1}
          ref={noticeRef}
          data-import-notice={notice}
        >
          {NOTICE_TEXT[notice]}
        </p>
      )}

      {batch !== null && <ImportPreview batch={batch} />}
      {batch?.result !== null && batch?.result !== undefined && <ResultPanel result={batch.result} />}
      {plan !== null && (
        <ImportDecisions
          items={plan.decisions_required}
          decisions={decisions}
          busy={busy}
          onChoose={(item, action) => setDecisions((current) => chooseAction(current, item, action))}
        />
      )}
      {plan !== null && (
        <ImportCommit
          plan={plan}
          decisions={decisions}
          confirming={confirming}
          busy={busy}
          error={commitError}
          onAsk={() => {
            setCommitError(null);
            setConfirming(true);
          }}
          onConfirm={() => void commit()}
          onCancel={() => setConfirming(false)}
        />
      )}

      <PreviousImports imports={history} onOpen={(id) => void open(id)} />
      <OpeningBalancePanel />
    </div>
  );
}
