import type { ReviewSnapshot } from '../../domain/snapshot.ts';

/**
 * Where the signed timesheet goes and how it will look: the recipients, the rendered email, and
 * the signature image that will be placed on the PDF. The email body is shown as plain text from
 * the payload (the server already escaped and rendered it); nothing here is parsed as markup.
 */
export function ReviewEnvelope({ payload, error }: { payload: ReviewSnapshot; error: string | null }) {
  const { recipients, signature } = payload;
  return (
    <section className="card stack" aria-labelledby="review-envelope-title">
      <h2 id="review-envelope-title">Recipients and email</h2>
      <dl className="facts review-envelope">
        <div data-envelope="to">
          <dt>To</dt>
          <dd>{recipients.to.length === 0 ? 'none set' : recipients.to.join(', ')}</dd>
        </div>
        <div data-envelope="cc">
          <dt>Cc</dt>
          <dd>{recipients.cc.length === 0 ? 'none' : recipients.cc.join(', ')}</dd>
        </div>
        <div data-envelope="pdf">
          <dt>OT rows on the PDF</dt>
          <dd>{payload.show_ot_on_pdf ? 'shown' : 'hidden'}</dd>
        </div>
      </dl>
      {recipients.to.length === 0 && (
        <p className="notice" role="status">
          No recipient is set, so the email cannot be sent until you add one in Settings. Signing off still saves the PDF.
        </p>
      )}
      <div className="review-mail" aria-label="Email preview">
        <p className="review-subject">
          <span className="muted">Subject</span> <strong data-envelope="subject">{recipients.subject}</strong>
        </p>
        <pre className="review-body" data-envelope="body">
          {recipients.body_text}
        </pre>
      </div>
      <div className="review-signature" id="review-field-signature" tabIndex={-1}>
        <h3>Signature on the PDF</h3>
        {signature === null ? (
          <p className="error" role="status">
            {error ?? 'No signature image is saved. Upload one in Settings before you sign off.'}
          </p>
        ) : (
          <>
            <img className="signature-preview" src={`/api/signatures/${signature.attachment_id}`} alt="Your saved signature image" />
            <p className="muted hint">Your saved image, placed next to your name and the real date and time you sign.</p>
          </>
        )}
      </div>
    </section>
  );
}
