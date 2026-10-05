import type { SubmissionPreview as PreviewData } from '../api.ts';

/**
 * The email as the server renders it with sample values for the current period. The text is shown
 * as plain text from the server's own rendering; nothing here is parsed as markup. The note line
 * appears only because the saved settings say so (preview uses the saved note switch and text).
 */
export function SubmissionPreview({ preview }: { preview: PreviewData }) {
  return (
    <section className="card stack" aria-labelledby="submission-preview-title" data-submission="preview" data-preview-as={preview.sign_off}>
      <h2 id="submission-preview-title">Email preview</h2>
      <p className="muted hint">
        Sample values for the current period, shown as {preview.sign_off === 'automatic' ? 'an automatic submission' : 'a manual sign-off'}. The note line follows your saved settings.
      </p>
      <dl className="facts">
        <div>
          <dt>To</dt>
          <dd>{preview.recipients.to.length === 0 ? 'none set' : preview.recipients.to.join(', ')}</dd>
        </div>
        <div>
          <dt>Cc</dt>
          <dd>{preview.recipients.cc.length === 0 ? 'none' : preview.recipients.cc.join(', ')}</dd>
        </div>
        <div>
          <dt>Sign-off wording</dt>
          <dd data-preview-field="sign-off-status">{preview.values.SignOffStatus ?? ''}</dd>
        </div>
      </dl>
      <div className="review-mail" aria-label="Rendered email">
        <p className="review-subject">
          <span className="muted">Subject</span> <strong data-preview-field="subject">{preview.subject}</strong>
        </p>
        <pre className="review-body" data-preview-field="body">
          {preview.text_body}
        </pre>
      </div>
    </section>
  );
}
