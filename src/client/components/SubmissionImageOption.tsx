import type { SignatureMetadata, SubmissionSettings } from '../api.ts';
import { displayZone, instantText } from './format.ts';
import { imageOption } from './settingsModel.ts';

/**
 * The automatic signature image as the audited authorization it is: which image is authorized and
 * since when, and the one explicit act that changes it. A manual sign-off always uses the current
 * image; this option only decides whether an automatic submission prints one.
 */
export function SubmissionImageOption({
  settings,
  signature,
  busy,
  error,
  notice,
  onAuthorize,
  onRevoke,
}: {
  settings: SubmissionSettings;
  signature: SignatureMetadata | null;
  busy: boolean;
  error: string | null;
  notice: string | null;
  onAuthorize: () => void;
  onRevoke: () => void;
}) {
  const option = imageOption(settings, signature);
  const authorizedAt = settings.auto_image.authorized_at;
  return (
    <section className="card stack" aria-labelledby="image-option-title" data-submission="image-option" data-image-state={option.state}>
      <h2 id="image-option-title">Signature image on automatic submissions</h2>
      <p data-image-message="true">{option.message}</p>
      {settings.auto_image.authorized && authorizedAt !== null && (
        <p className="muted hint">Authorized {instantText(authorizedAt, displayZone)}. This is recorded in your history.</p>
      )}
      {error !== null && (
        <p className="error" role="alert" data-error="image-option">
          {error}
        </p>
      )}
      {notice !== null && (
        <p className="notice-ok" role="status" data-status-note="image-option">
          {notice}
        </p>
      )}
      {(option.canAuthorize || option.canRevoke) && (
        <div className="button-row">
          {option.canAuthorize && (
            <button type="button" disabled={busy} onClick={onAuthorize}>
              {option.authorizeLabel}
            </button>
          )}
          {option.canRevoke && (
            <button type="button" className="secondary" disabled={busy} onClick={onRevoke}>
              Stop including my image
            </button>
          )}
        </div>
      )}
    </section>
  );
}
