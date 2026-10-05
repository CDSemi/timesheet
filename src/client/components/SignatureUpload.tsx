import { type ChangeEvent, type SubmitEvent, useRef, useState } from 'react';
import { type SignatureMetadata, type SignatureUploadResult, uploadSignature } from '../api.ts';
import { displayZone, instantText } from './format.ts';
import { checkImageFile, uploadFailure, uploadPlan, UPLOAD_CONSENT_DEFAULT, uploadSuccessText } from './settingsModel.ts';

type Message = { tone: 'ok' | 'error' | 'step'; text: string };

/** Reads the chosen file as a data URL: the page's CSP allows `data:` images but not `blob:`. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads the signature image (PNG or JPEG) with a preview. Per owner decision G-Q1 (b) the form
 * asks "Use this image on automatic submissions", pre-selected; confirming records the audited
 * authorization in the same server transaction as the upload, and unticking uploads without it.
 * A ticked consent is never dropped: without saved submission settings the form says so and offers
 * the two honest ways forward (save the settings first, or upload without authorizing).
 */
export function SignatureUpload({
  signature,
  settingsSaved,
  onUploaded,
  onGoToSettings,
  onSettingsRequired,
}: {
  signature: SignatureMetadata | null;
  settingsSaved: boolean;
  onUploaded: (result: SignatureUploadResult) => void;
  onGoToSettings: () => void;
  /** The server stored nothing because it has no saved settings: the parent reads them again. */
  onSettingsRequired: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileProblem, setFileProblem] = useState<string | null>(null);
  const [consent, setConsent] = useState(UPLOAD_CONSENT_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const submitting = useRef(false);

  const plan = uploadPlan({ consent, settingsSaved });

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setMessage(null);
    setFile(null);
    setPreview(null);
    if (chosen === null) {
      setFileProblem(null);
      return;
    }
    const problem = checkImageFile(chosen);
    setFileProblem(problem);
    if (problem !== null) return;
    setFile(chosen);
    try {
      setPreview(await readAsDataUrl(chosen));
    } catch {
      setPreview(null);
    }
  }

  async function send(authorize: boolean) {
    if (file === null || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const result = await uploadSignature(file, authorize);
      onUploaded(result);
      setMessage({ tone: 'ok', text: uploadSuccessText(result.settings?.auto_image.authorized === true && authorize) });
      setFile(null);
      setPreview(null);
      setConsent(UPLOAD_CONSENT_DEFAULT);
      setInputKey((key) => key + 1);
    } catch (caught) {
      const failure = uploadFailure(caught);
      if (failure.kind === 'settings_required') onSettingsRequired();
      setMessage({ tone: failure.kind === 'settings_required' ? 'step' : 'error', text: failure.message });
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file === null) {
      setFileProblem('Choose a PNG or JPEG image first.');
      return;
    }
    if (plan === 'save_settings_first') {
      setMessage({ tone: 'step', text: 'Save your submission settings first, or untick the option to upload without authorizing.' });
      return;
    }
    void send(plan === 'upload_and_authorize');
  }

  return (
    <form className="card stack" aria-labelledby="signature-title" noValidate onSubmit={submit} data-submission="signature-upload">
      <h2 id="signature-title">Signature image</h2>
      {signature === null ? (
        <p className="muted" data-signature-state="none">
          No signature image is saved. Manual sign-off needs one.
        </p>
      ) : (
        <div className="review-signature" data-signature-state="saved">
          <img className="signature-preview" src={`/api/signatures/${signature.id}`} alt="Your saved signature image" />
          <p className="muted hint">
            Saved {instantText(signature.created_at, displayZone)}, {signature.width_px} by {signature.height_px} pixels. Uploading a new image keeps the earlier ones; signed revisions keep the image they were signed with.
          </p>
        </div>
      )}

      <label>
        Choose a PNG or JPEG image
        <input
          key={inputKey}
          id="signature-field-file"
          type="file"
          accept="image/png,image/jpeg"
          aria-invalid={fileProblem !== null}
          aria-describedby={fileProblem === null ? undefined : 'signature-error-file'}
          onChange={(event) => void choose(event)}
        />
      </label>
      {fileProblem !== null && (
        <p className="error" id="signature-error-file">
          {fileProblem}
        </p>
      )}
      {preview !== null && (
        <div className="review-signature" data-signature-state="chosen">
          <img className="signature-preview" src={preview} alt="Preview of the image you chose" />
          <p className="muted hint">Preview of the chosen image. Nothing is saved until you upload it.</p>
        </div>
      )}

      <label className="inline">
        <input id="signature-field-consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        Use this image on automatic submissions
      </label>
      <p className="muted hint">
        Ticked, the upload also records one audited authorization for this image. Unticked, it is uploaded without one and automatic submissions print no image until you authorize one below.
      </p>
      {plan === 'save_settings_first' && (
        <div className="stack" role="status" data-signature-step="settings-first">
          <p className="notice">
            Step order: automatic use needs saved submission settings. Save them first, then upload with the option ticked. Or upload now without authorizing and authorize later.
          </p>
          <div className="button-row">
            <button type="button" className="secondary" onClick={onGoToSettings}>
              Go to submission settings
            </button>
            <button type="button" className="secondary" disabled={busy || file === null} onClick={() => void send(false)}>
              Upload without authorizing
            </button>
          </div>
        </div>
      )}

      {message !== null && (
        <p
          className={message.tone === 'ok' ? 'notice-ok' : message.tone === 'step' ? 'notice' : 'error'}
          role={message.tone === 'error' ? 'alert' : 'status'}
          data-upload-message={message.tone}
        >
          {message.text}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={busy || file === null || plan === 'save_settings_first'}>
          Upload signature
        </button>
      </div>
    </form>
  );
}
