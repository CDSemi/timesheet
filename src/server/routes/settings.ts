import { Hono } from 'hono';
import { requireUser } from '../http/auth.ts';
import { notFound } from '../http/errors.ts';
import {
  autoImageAuthorizeBody,
  autoImageRevokeBody,
  submissionPreviewBody,
  submissionSettingsBody,
} from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import {
  authorizeAutoImage,
  getSubmissionSettingsVersion,
  listSubmissionSettingsVersions,
  previewJson,
  previewSubmission,
  revokeAutoImage,
  saveSubmissionSettings,
  submissionSettingsJson,
  submissionSettingsOrDefault,
} from '../services/submissionSettings.ts';
import type { AppDeps, AppEnv } from '../types.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Personal submission settings: recipients, email templates, auto-submit and the explicit
 * automatic-image authorization. Every handler passes the session user as the only owner;
 * no route accepts a user id, and the administrator role grants no access to another
 * user's settings (their ids are "not found"). The preview route writes nothing.
 */
export function settingsRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);

  // The current version, or the defaults (seq 0, is_default) before the first save.
  app.get('/submission', auth, (c) =>
    c.json({ settings: submissionSettingsJson(submissionSettingsOrDefault(deps.db, c.get('user').id)) }),
  );

  app.get('/submission/versions', auth, (c) =>
    c.json({ versions: listSubmissionSettingsVersions(deps.db, c.get('user').id).map(submissionSettingsJson) }),
  );

  app.get('/submission/versions/:id', auth, (c) => {
    const id = c.req.param('id');
    if (!UUID.test(id)) throw notFound('Settings version');
    return c.json({ settings: submissionSettingsJson(getSubmissionSettingsVersion(deps.db, c.get('user').id, id)) });
  });

  // Appends a version; omitted optional fields keep the previous value.
  app.post('/submission', auth, async (c) => {
    const body = await readJson(c, submissionSettingsBody);
    const settings = saveSubmissionSettings(deps.db, deps.clock, c.get('user').id, {
      expectedSeq: body.expected_seq,
      to: body.to,
      cc: body.cc,
      subjectTemplate: body.subject_template,
      bodyTemplate: body.body_template,
      autoSubmit: body.auto_submit,
      applyToOverdueDrafts: body.apply_to_overdue_drafts,
      showOtOnPdf: body.show_ot_on_pdf,
      reminderOffsetsMinutes: body.reminder_offsets_minutes,
    });
    return c.json({ settings: submissionSettingsJson(settings) }, 201);
  });

  // Dry run: renders the caller's subject and body with sample values; writes nothing.
  app.post('/submission/preview', auth, async (c) => {
    const body = await readJson(c, submissionPreviewBody);
    return c.json({
      preview: previewJson(
        previewSubmission(deps.db, deps.clock, c.get('user'), {
          subjectTemplate: body.subject_template,
          bodyTemplate: body.body_template,
          signOff: body.sign_off,
        }),
      ),
    });
  });

  app.post('/submission/auto-image/authorize', auth, async (c) => {
    const body = await readJson(c, autoImageAuthorizeBody);
    const settings = authorizeAutoImage(deps.db, deps.clock, c.get('user').id, {
      expectedSeq: body.expected_seq,
      signatureAttachmentId: body.signature_attachment_id,
    });
    return c.json({ settings: submissionSettingsJson(settings) }, 201);
  });

  app.post('/submission/auto-image/revoke', auth, async (c) => {
    const body = await readJson(c, autoImageRevokeBody);
    const settings = revokeAutoImage(deps.db, deps.clock, c.get('user').id, { expectedSeq: body.expected_seq });
    return c.json({ settings: submissionSettingsJson(settings) }, 201);
  });

  return app;
}
