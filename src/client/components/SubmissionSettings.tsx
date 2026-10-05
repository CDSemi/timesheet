import { useCallback, useEffect, useRef, useState } from 'react';
import {
  api,
  ApiRequestError,
  type SignatureMetadata,
  type SignatureUploadResult,
  type SubmissionPreview as PreviewData,
  type SubmissionSettings,
} from '../api.ts';
import { describeError } from './errors.ts';
import { SignatureUpload } from './SignatureUpload.tsx';
import { SubmissionImageOption } from './SubmissionImageOption.tsx';
import { SubmissionPreview } from './SubmissionPreview.tsx';
import { SubmissionSettingsForm } from './SubmissionSettingsForm.tsx';
import {
  buildSettingsRequest,
  type DraftProblem,
  draftFromSettings,
  isDraftChanged,
  previewRequest,
  settingsRefusal,
  type SubmissionDraft,
} from './settingsModel.ts';

interface Loaded {
  settings: SubmissionSettings;
  /** The owner's current signature image; null when none was uploaded. */
  signature: SignatureMetadata | null;
}

async function loadAll(): Promise<Loaded> {
  const [saved, signature] = await Promise.all([
    api<{ settings: SubmissionSettings }>('GET', '/api/settings/submission'),
    // 200 with a null value when no image was uploaded (nothing is logged as a failed resource).
    api<{ signature: SignatureMetadata | null }>('GET', '/api/signatures/current').then((answer) => answer.signature),
  ]);
  return { settings: saved.settings, signature };
}

const FIELD_ID: Record<DraftProblem['field'], string> = {
  to: 'submission-field-to',
  cc: 'submission-field-cc',
  note: 'submission-field-note',
};

/**
 * Personal submission settings (recipients, templates, automatic submission, note line), the
 * server's email preview, the signature image with its consent, and the audited automatic-image
 * authorization. Every rule is the server's; this component keeps the draft, asks, and shows the answer.
 */
export function SubmissionSettingsSection() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<SubmissionDraft | null>(null);
  const [problems, setProblems] = useState<DraftProblem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewAs, setPreviewAs] = useState<'manual' | 'automatic'>('manual');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const inFlight = useRef(false);

  const reload = useCallback(async (resetDraft: boolean) => {
    try {
      const next = await loadAll();
      setLoaded(next);
      setLoadError(null);
      if (resetDraft) setDraft(draftFromSettings(next.settings));
      return next;
    } catch (caught) {
      setLoadError(describeError(caught));
      return null;
    }
  }, []);

  useEffect(() => {
    void reload(true);
  }, [reload]);

  if (loaded === null || draft === null) {
    return loadError === null ? (
      <p className="muted">Loading submission settings…</p>
    ) : (
      <p className="error" role="alert">
        {loadError}
      </p>
    );
  }
  const { settings, signature } = loaded;

  function edit(next: SubmissionDraft) {
    setDraft(next);
    setNotice(null);
    setError(null);
    setProblems([]);
  }

  async function save() {
    if (draft === null || inFlight.current) return;
    const built = buildSettingsRequest(draft, settings);
    setNotice(null);
    setError(null);
    if (!built.ok) {
      setProblems(built.problems);
      const first = built.problems[0];
      if (first !== undefined) queueMicrotask(() => document.getElementById(FIELD_ID[first.field])?.focus());
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      const answer = await api<{ settings: SubmissionSettings }>('POST', '/api/settings/submission', built.request);
      setLoaded({ settings: answer.settings, signature });
      setDraft(draftFromSettings(answer.settings));
      setPreview(null);
      setNotice(`Submission settings saved as version ${answer.settings.seq}.`);
    } catch (caught) {
      setError(settingsRefusal(caught));
      if (caught instanceof ApiRequestError && caught.status === 409) await reload(true);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function runPreview() {
    if (draft === null || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const answer = await api<{ preview: PreviewData }>('POST', '/api/settings/submission/preview', previewRequest(draft, previewAs));
      setPreview(answer.preview);
    } catch (caught) {
      setPreview(null);
      setError(describeError(caught));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function uploaded(result: SignatureUploadResult) {
    setLoaded((current) => (current === null ? current : { settings: result.settings ?? current.settings, signature: result.signature }));
    setImageError(null);
    setImageNotice(null);
  }

  async function authorize() {
    if (signature === null || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setImageError(null);
    setImageNotice(null);
    try {
      const answer = await api<{ settings: SubmissionSettings }>('POST', '/api/settings/submission/auto-image/authorize', {
        expected_seq: settings.seq,
        signature_attachment_id: signature.id,
      });
      setLoaded({ settings: answer.settings, signature });
      setImageNotice('Authorized: automatic submissions will print this image. The authorization is recorded in your history.');
    } catch (caught) {
      setImageError(settingsRefusal(caught));
      if (caught instanceof ApiRequestError && caught.status === 409) await reload(false);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function revoke() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setImageError(null);
    setImageNotice(null);
    try {
      const answer = await api<{ settings: SubmissionSettings }>('POST', '/api/settings/submission/auto-image/revoke', { expected_seq: settings.seq });
      setLoaded({ settings: answer.settings, signature });
      setImageNotice('The authorization was revoked: automatic submissions print no image.');
    } catch (caught) {
      setImageError(settingsRefusal(caught));
      if (caught instanceof ApiRequestError && caught.status === 409) await reload(false);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <SubmissionSettingsForm
        settings={settings}
        draft={draft}
        problems={problems}
        busy={busy}
        changed={isDraftChanged(draft, settings)}
        error={error}
        notice={notice}
        previewAs={previewAs}
        onChange={edit}
        onPreviewAs={setPreviewAs}
        onPreview={() => void runPreview()}
        onSubmit={() => void save()}
      />
      {preview !== null && <SubmissionPreview preview={preview} />}
      <SignatureUpload
        signature={signature}
        settingsSaved={!settings.is_default}
        onUploaded={uploaded}
        onGoToSettings={() => document.getElementById('submission-title')?.focus()}
        onSettingsRequired={() => void reload(false)}
      />
      <SubmissionImageOption
        settings={settings}
        signature={signature}
        busy={busy}
        error={imageError}
        notice={imageNotice}
        onAuthorize={() => void authorize()}
        onRevoke={() => void revoke()}
      />
    </>
  );
}
