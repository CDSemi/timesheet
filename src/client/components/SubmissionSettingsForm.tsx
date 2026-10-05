import type { SubmissionSettings } from '../api.ts';
import { displayZone, instantText } from './format.ts';
import { autoSubmitRule, type DraftProblem, NOTE_MAX_LENGTH, type SubmissionDraft } from './settingsModel.ts';

/**
 * Recipients, the two email templates, the automatic-submission switch with the rule that
 * currently applies, the optional note line of an automatic submission and the PDF option. Labels
 * sit above their fields and each problem below its field; nothing is saved until the owner
 * presses Save, and the saved version is bound to the version this form was loaded at.
 */
export function SubmissionSettingsForm({
  settings,
  draft,
  problems,
  busy,
  changed,
  error,
  notice,
  previewAs,
  onChange,
  onPreviewAs,
  onPreview,
  onSubmit,
}: {
  settings: SubmissionSettings;
  draft: SubmissionDraft;
  problems: readonly DraftProblem[];
  busy: boolean;
  changed: boolean;
  error: string | null;
  notice: string | null;
  previewAs: 'manual' | 'automatic';
  onChange: (next: SubmissionDraft) => void;
  onPreviewAs: (value: 'manual' | 'automatic') => void;
  onPreview: () => void;
  onSubmit: () => void;
}) {
  const problem = (field: DraftProblem['field']) => problems.find((item) => item.field === field)?.message;
  const toError = problem('to');
  const ccError = problem('cc');
  const noteError = problem('note');
  const autoChanged = settings.is_default || draft.autoSubmit !== settings.auto_submit;
  const noteLength = [...draft.noteText.normalize('NFC').trim()].length;

  return (
    <form
      className="card stack"
      aria-labelledby="submission-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 id="submission-title" tabIndex={-1}>
        Submission and email
      </h2>
      <p className="hint muted">
        {settings.is_default
          ? 'Nothing is saved yet. These are the defaults; saving stores the first version.'
          : `Version ${settings.seq}, saved ${settings.created_at === null ? '' : instantText(settings.created_at, displayZone)}. Every save adds a new version; earlier ones are kept.`}
      </p>

      <label>
        Recipients (To)
        <textarea
          id="submission-field-to"
          rows={2}
          value={draft.to}
          autoComplete="off"
          aria-invalid={toError !== undefined}
          aria-describedby={`submission-hint-to${toError === undefined ? '' : ' submission-error-to'}`}
          onChange={(event) => onChange({ ...draft, to: event.target.value })}
        />
      </label>
      <p className="muted hint" id="submission-hint-to">
        One address per line, or separated by commas. The PDF is sent to them when you sign off.
      </p>
      {toError !== undefined && (
        <p className="error" id="submission-error-to">
          {toError}
        </p>
      )}

      <label>
        Copy (Cc)
        <textarea
          id="submission-field-cc"
          rows={2}
          value={draft.cc}
          autoComplete="off"
          aria-invalid={ccError !== undefined}
          aria-describedby={ccError === undefined ? undefined : 'submission-error-cc'}
          onChange={(event) => onChange({ ...draft, cc: event.target.value })}
        />
      </label>
      {ccError !== undefined && (
        <p className="error" id="submission-error-cc">
          {ccError}
        </p>
      )}

      <label>
        Email subject
        <input id="submission-field-subject" type="text" value={draft.subject} maxLength={600} onChange={(event) => onChange({ ...draft, subject: event.target.value })} />
      </label>
      <label>
        Email body
        <textarea
          id="submission-field-body"
          className="mono"
          rows={8}
          value={draft.body}
          maxLength={12000}
          aria-describedby="submission-hint-variables"
          onChange={(event) => onChange({ ...draft, body: event.target.value })}
        />
      </label>
      <p className="muted hint" id="submission-hint-variables">
        Variables: {settings.variables.map((name) => `{${name}}`).join(' ')}. An unknown variable is refused when you save or preview.
      </p>

      <fieldset className="choice-set stack" data-setting="auto-submit">
        <legend>Automatic submission</legend>
        <label className="inline">
          <input
            id="submission-field-auto"
            type="checkbox"
            checked={draft.autoSubmit}
            onChange={(event) => onChange({ ...draft, autoSubmit: event.target.checked })}
          />
          Submit automatically at the deadline when I have not signed off
        </label>
        <p className="muted hint" data-setting-rule="auto-submit">
          {autoSubmitRule(settings, (instant) => instantText(instant, displayZone))}
        </p>
        <p className="muted hint">Real sending starts only when the administrator activates automatic submission.</p>
        {autoChanged && (
          <label className="inline">
            <input type="checkbox" checked={draft.applyToOverdue} onChange={(event) => onChange({ ...draft, applyToOverdue: event.target.checked })} />
            Also apply this change to drafts that are already overdue
          </label>
        )}
      </fieldset>

      <fieldset className="choice-set stack" data-setting="auto-note">
        <legend>Note line on automatic submissions</legend>
        <label className="inline">
          <input
            id="submission-field-note-enabled"
            type="checkbox"
            checked={draft.noteEnabled}
            onChange={(event) => onChange({ ...draft, noteEnabled: event.target.checked })}
          />
          Add a note line to automatic submissions
        </label>
        <label>
          Note text
          <input
            id="submission-field-note"
            type="text"
            value={draft.noteText}
            disabled={!draft.noteEnabled}
            autoComplete="off"
            aria-invalid={noteError !== undefined}
            aria-describedby={`submission-hint-note${noteError === undefined ? '' : ' submission-error-note'}`}
            onChange={(event) => onChange({ ...draft, noteText: event.target.value })}
          />
        </label>
        <p className="muted hint" id="submission-hint-note">
          {noteLength} of {NOTE_MAX_LENGTH} characters, one line. It is off by default; the PDF and the email show it only while the switch is on.
        </p>
        {noteError !== undefined && (
          <p className="error" id="submission-error-note">
            {noteError}
          </p>
        )}
      </fieldset>

      <label className="inline">
        <input type="checkbox" checked={draft.showOt} onChange={(event) => onChange({ ...draft, showOt: event.target.checked })} />
        Show the OT rows on the PDF
      </label>

      <fieldset className="choice-set stack">
        <legend>Preview the email as</legend>
        <div className="mode-list">
          <label className="inline">
            <input type="radio" name="submission-preview-as" checked={previewAs === 'manual'} onChange={() => onPreviewAs('manual')} />
            A manual sign-off
          </label>
          <label className="inline">
            <input type="radio" name="submission-preview-as" checked={previewAs === 'automatic'} onChange={() => onPreviewAs('automatic')} />
            An automatic submission
          </label>
        </div>
      </fieldset>

      {error !== null && (
        <p className="error" role="alert" data-error="submission">
          {error}
        </p>
      )}
      {notice !== null && (
        <p className="notice-ok" role="status" data-status-note="submission-saved">
          {notice}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={busy || !changed}>
          Save settings
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={onPreview}>
          Preview email
        </button>
      </div>
    </form>
  );
}
