import { describe, expect, it } from 'vitest';
import { ApiRequestError, type SignatureMetadata, type SubmissionSettings } from '../../src/client/api.ts';
import {
  autoSubmitRule,
  buildSettingsRequest,
  checkImageFile,
  draftFromSettings,
  draftProblems,
  imageOption,
  isDraftChanged,
  NOTE_MAX_LENGTH,
  noteProblem,
  parseAddresses,
  previewRequest,
  settingsRefusal,
  SIGNATURE_MAX_BYTES,
  uploadFailure,
  uploadPlan,
  UPLOAD_CONSENT_DEFAULT,
  uploadSuccessText,
} from '../../src/client/components/settingsModel.ts';

/*
 * Pure logic of the submission settings and the signature upload (WP3-T13). The server owns every
 * rule; the model only words the owner's choices, keeps the request exactly what the owner
 * confirmed, and never lets a consent disappear silently (owner decision G-Q1 (b)).
 */

function settings(overrides: Partial<SubmissionSettings> = {}): SubmissionSettings {
  return {
    id: 'set-1',
    seq: 3,
    is_default: false,
    recipients: { to: ['payroll@example.invalid'], cc: ['manager@example.invalid'] },
    subject_template: 'Timesheet {PeriodStart} to {PeriodEnd}',
    body_template: 'Hello,\nPlease find the timesheet of {EmployeeName}.',
    template_version: 2,
    variables: ['EmployeeName'],
    auto_submit: true,
    auto_submit_effective_from: '2026-10-01T09:00:00Z',
    auto_image: { authorized: false, signature_attachment_id: null, authorized_at: null },
    auto_note: { enabled: false, text: 'Automatic submission' },
    show_ot_on_pdf: true,
    reminder_offsets_minutes: [1440, 120],
    created_at: '2026-10-01T09:00:00Z',
    ...overrides,
  };
}

const defaults = () => settings({ id: null, seq: 0, is_default: true, recipients: { to: [], cc: [] }, auto_submit_effective_from: null, created_at: null });

const signature = (id = 'sig-1'): SignatureMetadata => ({
  id,
  mime_type: 'image/png',
  size_bytes: 1200,
  width_px: 160,
  height_px: 48,
  sha256: 'a'.repeat(64),
  created_at: '2026-10-01T09:00:00Z',
});

const refused = (status: number, code: string) => new ApiRequestError(status, code, 'server message');

describe('addresses', () => {
  it('splits on lines, commas, semicolons and spaces, and drops empty entries', () => {
    expect(parseAddresses('a@example.invalid, b@example.invalid;\n c@example.invalid  \n\n')).toEqual([
      'a@example.invalid',
      'b@example.invalid',
      'c@example.invalid',
    ]);
    expect(parseAddresses('   ')).toEqual([]);
  });
});

describe('the automatic note line', () => {
  it('accepts one line of 1 to 120 characters and names the limit when it is broken', () => {
    expect(NOTE_MAX_LENGTH).toBe(120);
    expect(noteProblem('Automatic submission')).toBeNull();
    expect(noteProblem('x'.repeat(120))).toBeNull();
    expect(noteProblem('x'.repeat(121))).toContain('1 to 120');
    expect(noteProblem('   ')).toContain('1 to 120');
    expect(noteProblem('')).toContain('1 to 120');
  });

  it('refuses a second line, a control character and a brace (the text is literal, never a variable)', () => {
    expect(noteProblem('first\nsecond')).toContain('one line');
    expect(noteProblem('bell\u0007')).toContain('one line');
    expect(noteProblem('Sent {EmployeeName}')).toContain('one line');
  });

  it('counts characters, not UTF-16 units', () => {
    expect(noteProblem('\u{1F600}'.repeat(120))).toBeNull();
    expect(noteProblem('\u{1F600}'.repeat(121))).not.toBeNull();
  });
});

describe('the settings draft and its request', () => {
  it('reads the saved settings into the form values, with the note line off by default and its text kept', () => {
    const draft = draftFromSettings(settings());
    expect(draft).toMatchObject({
      to: 'payroll@example.invalid',
      cc: 'manager@example.invalid',
      autoSubmit: true,
      applyToOverdue: false,
      noteEnabled: false,
      noteText: 'Automatic submission',
      showOt: true,
    });
    expect(draftFromSettings(defaults())).toMatchObject({ to: '', autoSubmit: true, noteEnabled: false, noteText: 'Automatic submission' });
  });

  it('needs a valid recipient and, only while the note line is on, a valid note text', () => {
    const base = draftFromSettings(settings());
    expect(draftProblems(base)).toEqual([]);
    expect(draftProblems({ ...base, to: '' }).map((item) => item.field)).toEqual(['to']);
    expect(draftProblems({ ...base, to: 'not-an-address' })[0]?.message).toContain('not-an-address');
    expect(draftProblems({ ...base, cc: 'broken@' }).map((item) => item.field)).toEqual(['cc']);
    expect(draftProblems({ ...base, noteEnabled: true, noteText: '' }).map((item) => item.field)).toEqual(['note']);
    expect(draftProblems({ ...base, noteEnabled: false, noteText: '' })).toEqual([]);
  });

  it('builds the request from what the owner confirmed, bound to the version that was shown', () => {
    const base = draftFromSettings(settings());
    const result = buildSettingsRequest({ ...base, to: 'one@example.invalid\ntwo@example.invalid', noteEnabled: true, noteText: '  Automatic submission  ' }, settings());
    expect(result).toEqual({
      ok: true,
      request: {
        expected_seq: 3,
        to: ['one@example.invalid', 'two@example.invalid'],
        cc: ['manager@example.invalid'],
        subject_template: 'Timesheet {PeriodStart} to {PeriodEnd}',
        body_template: 'Hello,\nPlease find the timesheet of {EmployeeName}.',
        auto_submit: true,
        auto_note_enabled: true,
        auto_note_text: 'Automatic submission',
        show_ot_on_pdf: true,
      },
    });
  });

  it('sends the version of the first save as 0 and does not send an unusable note text', () => {
    const first = buildSettingsRequest({ ...draftFromSettings(defaults()), to: 'payroll@example.invalid' }, defaults());
    expect(first).toMatchObject({ ok: true, request: { expected_seq: 0 } });
    const base = draftFromSettings(settings());
    const off = buildSettingsRequest({ ...base, noteEnabled: false, noteText: 'bad\nline' }, settings());
    expect(off.ok).toBe(true);
    if (off.ok) expect('auto_note_text' in off.request).toBe(false);
    expect(buildSettingsRequest({ ...base, noteEnabled: true, noteText: 'bad\nline' }, settings())).toMatchObject({ ok: false });
  });

  it('asks to cover overdue drafts only when the auto-submit switch itself changes (the server refuses it otherwise)', () => {
    const base = draftFromSettings(settings());
    const unchanged = buildSettingsRequest({ ...base, applyToOverdue: true }, settings());
    expect(unchanged.ok && 'apply_to_overdue_drafts' in unchanged.request).toBe(false);
    const flipped = buildSettingsRequest({ ...base, autoSubmit: false, applyToOverdue: true }, settings());
    expect(flipped.ok && flipped.request.apply_to_overdue_drafts).toBe(true);
    const flippedPlain = buildSettingsRequest({ ...base, autoSubmit: false }, settings());
    expect(flippedPlain.ok && 'apply_to_overdue_drafts' in flippedPlain.request).toBe(false);
    const first = buildSettingsRequest({ ...draftFromSettings(defaults()), to: 'a@example.invalid', applyToOverdue: true }, defaults());
    expect(first.ok && first.request.apply_to_overdue_drafts).toBe(true);
  });

  it('knows when there is something to save: any change, or the first save of the defaults', () => {
    const base = draftFromSettings(settings());
    expect(isDraftChanged(base, settings())).toBe(false);
    expect(isDraftChanged({ ...base, to: ' payroll@example.invalid ' }, settings())).toBe(false);
    expect(isDraftChanged({ ...base, noteEnabled: true }, settings())).toBe(true);
    expect(isDraftChanged({ ...base, noteText: 'Filed automatically' }, settings())).toBe(true);
    expect(isDraftChanged({ ...base, autoSubmit: false }, settings())).toBe(true);
    expect(isDraftChanged({ ...draftFromSettings(defaults()), to: '' }, defaults())).toBe(true);
  });

  it('requests a preview of the draft templates for a manual or an automatic submission', () => {
    const base = draftFromSettings(settings());
    expect(previewRequest(base, 'automatic')).toEqual({ subject_template: base.subject, body_template: base.body, sign_off: 'automatic' });
    expect(previewRequest(base, 'manual').sign_off).toBe('manual');
  });

  it('explains a stale save and passes other refusals through with their code', () => {
    expect(settingsRefusal(refused(409, 'stale_version'))).toContain('changed in another window');
    expect(settingsRefusal(refused(422, 'invalid_recipient'))).toBe('server message (invalid_recipient)');
    expect(settingsRefusal(new Error('x'))).toBe('Request failed');
  });
});

describe('the effective auto-submit rule in words', () => {
  const at = (iso: string) => `AT(${iso})`;

  it('states the rule that applies and since when', () => {
    expect(autoSubmitRule(settings(), at)).toContain('on');
    expect(autoSubmitRule(settings(), at)).toContain('AT(2026-10-01T09:00:00Z)');
    expect(autoSubmitRule(settings({ auto_submit: false }), at)).toContain('off');
    expect(autoSubmitRule(settings({ auto_submit: false }), at)).toContain('stays a draft');
  });

  it('says what the unsaved defaults do, and that a change covering overdue drafts reaches every unsubmitted period', () => {
    expect(autoSubmitRule(defaults(), at)).toContain('Not saved yet');
    expect(autoSubmitRule(settings({ auto_submit_effective_from: '1970-01-01T00:00:00Z' }), at)).toContain('overdue');
  });
});

describe('the automatic signature image option', () => {
  it('cannot be authorized without a signature, and says to upload one first', () => {
    expect(imageOption(settings(), null)).toMatchObject({ state: 'no_signature', canAuthorize: false, canRevoke: false });
  });

  it('asks to save the settings first when they were never saved', () => {
    expect(imageOption(defaults(), signature())).toMatchObject({ state: 'settings_required', canAuthorize: false });
  });

  it('offers the audited authorization with the documented label while no image is authorized', () => {
    const option = imageOption(settings(), signature());
    expect(option).toMatchObject({ state: 'not_authorized', canAuthorize: true, canRevoke: false });
    expect(option.authorizeLabel).toBe('Include my signature image on automatic submissions');
    expect(option.message).toContain('audited');
  });

  it('shows the current image as authorized and offers to revoke it', () => {
    const authorized = settings({ auto_image: { authorized: true, signature_attachment_id: 'sig-1', authorized_at: '2026-10-02T10:00:00Z' } });
    expect(imageOption(authorized, signature('sig-1'))).toMatchObject({ state: 'authorized', canAuthorize: false, canRevoke: true });
  });

  it('offers to re-authorize when a newer image was uploaded after the authorization', () => {
    const authorized = settings({ auto_image: { authorized: true, signature_attachment_id: 'sig-1', authorized_at: '2026-10-02T10:00:00Z' } });
    const option = imageOption(authorized, signature('sig-2'));
    expect(option).toMatchObject({ state: 'authorized_other', canAuthorize: true, canRevoke: true });
    expect(option.authorizeLabel).toBe('Use my new image on automatic submissions');
  });
});

describe('the signature upload and its consent', () => {
  it('has the automatic-use consent pre-selected (owner decision G-Q1 (b))', () => {
    expect(UPLOAD_CONSENT_DEFAULT).toBe(true);
  });

  it('uploads with the audited authorization when the option is ticked and settings exist, and without it when unticked', () => {
    expect(uploadPlan({ consent: true, settingsSaved: true })).toBe('upload_and_authorize');
    expect(uploadPlan({ consent: false, settingsSaved: true })).toBe('upload_only');
    expect(uploadPlan({ consent: false, settingsSaved: false })).toBe('upload_only');
  });

  it('never drops a ticked consent: without saved settings it asks for the settings first instead of uploading', () => {
    expect(uploadPlan({ consent: true, settingsSaved: false })).toBe('save_settings_first');
  });

  it('turns the server 422 submission_settings_required into the step order, saying nothing was stored or authorized', () => {
    const failure = uploadFailure(refused(422, 'submission_settings_required'));
    expect(failure.kind).toBe('settings_required');
    expect(failure.message).toContain('not uploaded');
    expect(failure.message).toContain('nothing was authorized');
    expect(failure.message).toContain('Save your submission settings first');
  });

  it('words the other upload refusals', () => {
    expect(uploadFailure(refused(415, 'unsupported_media_type'))).toMatchObject({ kind: 'other', message: 'Only PNG and JPEG images are accepted.' });
    expect(uploadFailure(refused(413, 'payload_too_large'))).toMatchObject({ kind: 'other' });
    expect(uploadFailure(refused(422, 'invalid_image')).message).toBe('server message (invalid_image)');
    expect(uploadFailure(new Error('x')).message).toBe('Request failed');
  });

  it('checks the chosen file before any request: type, emptiness and size', () => {
    expect(checkImageFile({ type: 'image/png', size: 1000 })).toBeNull();
    expect(checkImageFile({ type: 'image/jpeg', size: SIGNATURE_MAX_BYTES })).toBeNull();
    expect(checkImageFile({ type: 'image/gif', size: 1000 })).toBe('Choose a PNG or JPEG image.');
    expect(checkImageFile({ type: 'application/pdf', size: 1000 })).toBe('Choose a PNG or JPEG image.');
    expect(checkImageFile({ type: 'image/png', size: 0 })).toBe('The file is empty.');
    expect(checkImageFile({ type: 'image/png', size: SIGNATURE_MAX_BYTES + 1 })).toContain('256 KiB');
  });

  it('says whether the uploaded image is authorized for automatic submissions', () => {
    expect(uploadSuccessText(true)).toContain('authorized for automatic submissions');
    expect(uploadSuccessText(false)).toContain('will not print an image');
  });
});
