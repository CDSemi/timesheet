import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { api, type CurrentPeriods, type PolicyVersion, type SubmissionSettings } from '../api.ts';
import { AlertDialog } from './AlertDialog.tsx';
import { describeError } from './errors.ts';
import {
  buildPersonalFile,
  type PersonalFile,
  parseSettingsFile,
  serializeSettingsFile,
  settingsFileName,
  settingsFileProblem,
} from './settingsFileModel.ts';
import { SettingsTransferPersonal } from './SettingsTransferPersonal.tsx';
import { deviceTheme, downloadTextFile, utcNow } from './SettingsTransferFile.ts';

/**
 * Export and import of the personal settings (WP5-UX4-T05, U4-01; owner answers F-3 (a), F-4 (a)). Settings, Personal.
 * The file is made and read only in this browser, from the answers of the routes the Settings screen already uses; it holds the
 * work policy, the submission settings (recipients, templates, reminders, options) and optionally this device's theme, and
 * never the signature image, its authorization, a secret or any timesheet data. An import always previews first and needs one
 * confirmation; the file input is native (labelled, keyboard reachable). The code of this card loads on demand.
 */
export function SettingsTransfer({ onImported }: { onImported: () => void }) {
  const [includeTheme, setIncludeTheme] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refused, setRefused] = useState<string[] | null>(null);
  const [imported, setImported] = useState<{ file: PersonalFile; name: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // The refusal alert returns no focus itself (it is still open, and the page behind it inert, while its button is pressed):
  // the file input takes it once the alert is gone.
  const [refocus, setRefocus] = useState(0);
  useEffect(() => {
    if (refocus > 0) input.current?.focus();
  }, [refocus]);

  async function exportFile() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const [policies, submission, periods] = await Promise.all([
        api<{ policies: PolicyVersion[] }>('GET', '/api/policies'),
        api<{ settings: SubmissionSettings }>('GET', '/api/settings/submission'),
        api<CurrentPeriods>('GET', '/api/periods/current'),
      ]);
      const file = buildPersonalFile({
        policy: policies.policies.at(-1),
        submission: submission.settings,
        theme: includeTheme ? deviceTheme() : null,
        exportedAt: utcNow(),
      });
      if (file === null) {
        setError('There is nothing to export yet: save your submission settings or create a work policy version first.');
        return;
      }
      const name = settingsFileName('personal', periods.today_local);
      downloadTextFile(name, serializeSettingsFile(file));
      setNotice(`Downloaded ${name}. It holds the email addresses of your recipients and your templates. Keep it private.`);
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
    const result = parseSettingsFile(await chosen.text(), 'personal');
    if (!result.ok || result.file.scope !== 'personal') {
      setRefused(result.ok ? ['This file is not a personal settings file.'] : result.problems);
      return;
    }
    setImported({ file: result.file, name: chosen.name });
  }

  return (
    <section className="card stack" aria-label="Export and import settings" data-transfer="personal">
      <h2>Export and import settings</h2>
      <p>Download your settings as a file, or load them from a file.</p>
      <ul className="transfer-list">
        <li>Included: work policy (reference hours, breaks, deficit), email recipients and templates, reminders, PDF and note options, and, if you wish, the theme of this device.</li>
        <li>Never included: timesheets, sessions, OT balance, passwords, your signature image or its authorization.</li>
      </ul>
      <label className="inline">
        <input type="checkbox" checked={includeTheme} onChange={(event) => setIncludeTheme(event.target.checked)} />
        Include the theme of this device in the file
      </label>
      <div className="button-row">
        <button type="button" className="secondary" disabled={busy} onClick={() => void exportFile()}>
          Export settings
        </button>
      </div>
      <label>
        Import settings from a file (.json)
        <input ref={input} type="file" accept=".json,application/json" onChange={(event) => void chooseFile(event)} />
      </label>
      <p className="hint muted">
        <strong>Keep it private.</strong> The file holds the email addresses of your recipients. An import always shows what changes first; nothing is saved until you confirm.
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
          hint="Nothing was changed. Choose a file exported from this app, or export a new one."
          onClose={() => {
            setRefused(null);
            setRefocus((count) => count + 1);
          }}
        />
      )}
      {imported !== null && (
        <SettingsTransferPersonal
          file={imported.file}
          fileName={imported.name}
          opener={input.current}
          onClose={() => setImported(null)}
          onImported={(message) => {
            setImported(null);
            setNotice(message);
            onImported();
          }}
        />
      )}
    </section>
  );
}
