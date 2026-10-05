import { isValidEmailAddress } from '../../domain/emailTemplate.ts';
import { checkAutoNoteText, MAX_AUTO_NOTE_LENGTH } from '../../domain/snapshot.ts';
import { ApiRequestError, type SignatureMetadata, type SubmissionSettings, type SubmissionSettingsRequest } from '../api.ts';
import { describeError, isStaleVersion } from './errors.ts';

/*
 * Pure logic of the submission settings and the signature upload (WP3-T13). The server owns every
 * rule (recipient limits, template variables, the exact note text); this module words the owner's
 * choices, builds the request from exactly what the owner confirmed, and never lets a consent
 * vanish silently: an upload that asks for the automatic-image authorization either records it in
 * the same server transaction or tells the owner, in a step order, why it did not.
 */

/* ---- Recipients and the note line ---------------------------------------------------------- */

/** The note text limit, from the same domain rule the server enforces. */
export const NOTE_MAX_LENGTH = MAX_AUTO_NOTE_LENGTH;

/** Addresses as typed: one per line, or separated by commas, semicolons or spaces. */
export function parseAddresses(text: string): string[] {
  return text.split(/[\s,;]+/).filter((item) => item !== '');
}

/** Why a note text cannot be saved, in the domain's words; null when it is fine. */
export function noteProblem(text: string): string | null {
  const checked = checkAutoNoteText(text);
  return checked.ok ? null : checked.message;
}

/* ---- The settings form ------------------------------------------------------------------------ */

export interface SubmissionDraft {
  /** Recipient addresses as typed. */
  to: string;
  cc: string;
  subject: string;
  body: string;
  autoSubmit: boolean;
  /** Also cover drafts that are already overdue; meaningful only when the switch itself changes. */
  applyToOverdue: boolean;
  noteEnabled: boolean;
  noteText: string;
  showOt: boolean;
}

export function draftFromSettings(settings: SubmissionSettings): SubmissionDraft {
  return {
    to: settings.recipients.to.join('\n'),
    cc: settings.recipients.cc.join('\n'),
    subject: settings.subject_template,
    body: settings.body_template,
    autoSubmit: settings.auto_submit,
    applyToOverdue: false,
    noteEnabled: settings.auto_note.enabled,
    noteText: settings.auto_note.text,
    showOt: settings.show_ot_on_pdf,
  };
}

export interface DraftProblem {
  field: 'to' | 'cc' | 'note';
  message: string;
}

function addressProblem(label: string, addresses: readonly string[]): string | null {
  const bad = addresses.find((item) => !isValidEmailAddress(item));
  return bad === undefined ? null : `The ${label} address "${bad}" is not a valid email address.`;
}

/** What the form still lacks: a valid recipient, valid copies and, while the note line is on, a valid text. */
export function draftProblems(draft: SubmissionDraft): DraftProblem[] {
  const problems: DraftProblem[] = [];
  const to = parseAddresses(draft.to);
  const cc = parseAddresses(draft.cc);
  if (to.length === 0) problems.push({ field: 'to', message: 'Enter at least one recipient address.' });
  else {
    const message = addressProblem('recipient', to);
    if (message !== null) problems.push({ field: 'to', message });
  }
  const ccMessage = addressProblem('copy', cc);
  if (ccMessage !== null) problems.push({ field: 'cc', message: ccMessage });
  if (draft.noteEnabled) {
    const message = noteProblem(draft.noteText);
    if (message !== null) problems.push({ field: 'note', message });
  }
  return problems;
}

export type SettingsRequestResult = { ok: true; request: SubmissionSettingsRequest } | { ok: false; problems: DraftProblem[] };

/** The first save of the defaults counts as a change of the auto-submit rule, as on the server. */
const autoSubmitChanged = (draft: SubmissionDraft, settings: SubmissionSettings): boolean =>
  settings.is_default || draft.autoSubmit !== settings.auto_submit;

/**
 * The request for exactly what the owner confirmed, bound to the settings version that was shown.
 * Overdue drafts are covered only when asked and only when the switch changes (the server refuses
 * the flag otherwise); an unusable note text is never sent while the line is off.
 */
export function buildSettingsRequest(draft: SubmissionDraft, settings: SubmissionSettings): SettingsRequestResult {
  const problems = draftProblems(draft);
  if (problems.length > 0) return { ok: false, problems };
  const note = checkAutoNoteText(draft.noteText);
  const request: SubmissionSettingsRequest = {
    expected_seq: settings.seq,
    to: parseAddresses(draft.to),
    cc: parseAddresses(draft.cc),
    subject_template: draft.subject,
    body_template: draft.body,
    auto_submit: draft.autoSubmit,
    auto_note_enabled: draft.noteEnabled,
    show_ot_on_pdf: draft.showOt,
    ...(autoSubmitChanged(draft, settings) && draft.applyToOverdue ? { apply_to_overdue_drafts: true } : {}),
    ...(note.ok ? { auto_note_text: note.text } : {}),
  };
  return { ok: true, request };
}

const sameList = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((item, index) => item === b[index]);

/** True when saving would store something new: any difference, or the very first save of the defaults. */
export function isDraftChanged(draft: SubmissionDraft, settings: SubmissionSettings): boolean {
  if (settings.is_default) return true;
  const saved = draftFromSettings(settings);
  const note = checkAutoNoteText(draft.noteText);
  return (
    !sameList(parseAddresses(draft.to), parseAddresses(saved.to)) ||
    !sameList(parseAddresses(draft.cc), parseAddresses(saved.cc)) ||
    draft.subject !== saved.subject ||
    draft.body !== saved.body ||
    draft.autoSubmit !== saved.autoSubmit ||
    draft.noteEnabled !== saved.noteEnabled ||
    (note.ok ? note.text : draft.noteText) !== saved.noteText ||
    draft.showOt !== saved.showOt
  );
}

/** Body of the server preview: the draft templates, for a manual or an automatic submission. */
export function previewRequest(draft: SubmissionDraft, signOff: 'manual' | 'automatic') {
  return { subject_template: draft.subject, body_template: draft.body, sign_off: signOff };
}

/** A refused save in words. */
export function settingsRefusal(caught: unknown): string {
  if (isStaleVersion(caught)) {
    return 'Your submission settings changed in another window. They were reloaded: check them and save again.';
  }
  return describeError(caught);
}

/** The effective auto-submit rule in words. `formatInstant` shows a UTC instant in the viewer's zone. */
export function autoSubmitRule(settings: SubmissionSettings, formatInstant: (instant: string) => string): string {
  if (settings.is_default || settings.auto_submit_effective_from === null) {
    return 'Not saved yet. Automatic submission is on by default and applies to periods that fall due after you save your settings.';
  }
  const since = settings.auto_submit_effective_from.startsWith('1970-01-01')
    ? 'This covers every period that is not yet submitted, overdue drafts included.'
    : `This applies to periods due on or after ${formatInstant(settings.auto_submit_effective_from)}.`;
  return settings.auto_submit
    ? `Automatic submission is on. A period you have not signed off is submitted for you at its deadline, and you can review it afterwards. ${since}`
    : `Automatic submission is off. A period you do not sign off stays a draft and is never submitted for you. ${since}`;
}

/* ---- The automatic signature image ------------------------------------------------------------- */

export type ImageOptionState = 'no_signature' | 'settings_required' | 'not_authorized' | 'authorized' | 'authorized_other';

export interface ImageOption {
  state: ImageOptionState;
  canAuthorize: boolean;
  canRevoke: boolean;
  authorizeLabel: string;
  message: string;
}

const AUTHORIZE_LABEL = 'Include my signature image on automatic submissions';
const AUTHORIZE_NEW_LABEL = 'Use my new image on automatic submissions';

/** The option as the audited authorization it is: which image is authorized, and what the owner can do next. */
export function imageOption(settings: SubmissionSettings, signature: Pick<SignatureMetadata, 'id'> | null): ImageOption {
  const authorizedId = settings.auto_image.signature_attachment_id;
  const revocable = settings.auto_image.authorized;
  if (signature === null) {
    return {
      state: 'no_signature',
      canAuthorize: false,
      canRevoke: revocable,
      authorizeLabel: AUTHORIZE_LABEL,
      message: 'Upload a signature image first. You can then authorize it for automatic submissions.',
    };
  }
  if (settings.is_default) {
    return {
      state: 'settings_required',
      canAuthorize: false,
      canRevoke: false,
      authorizeLabel: AUTHORIZE_LABEL,
      message: 'Save your submission settings first, then authorize the image for automatic submissions.',
    };
  }
  if (revocable && authorizedId === signature.id) {
    return {
      state: 'authorized',
      canAuthorize: false,
      canRevoke: true,
      authorizeLabel: AUTHORIZE_LABEL,
      message: 'Authorized: automatic submissions print this image. A manual sign-off always uses your current image.',
    };
  }
  if (revocable) {
    return {
      state: 'authorized_other',
      canAuthorize: true,
      canRevoke: true,
      authorizeLabel: AUTHORIZE_NEW_LABEL,
      message: 'The image authorized for automatic submissions is not your current signature. Authorize the new image to use it instead.',
    };
  }
  return {
    state: 'not_authorized',
    canAuthorize: true,
    canRevoke: false,
    authorizeLabel: AUTHORIZE_LABEL,
    message: 'No image is printed on automatic submissions. Authorizing is an audited act: it records which image and when.',
  };
}

/* ---- The signature upload ----------------------------------------------------------------------- */

/** Owner decision G-Q1 (b): the upload form asks for the automatic-use authorization, pre-selected. */
export const UPLOAD_CONSENT_DEFAULT = true;

/** The upload limit of the server (256 KiB); the server stays the authority. */
export const SIGNATURE_MAX_BYTES = 256 * 1024;

export type UploadPlan = 'upload_and_authorize' | 'upload_only' | 'save_settings_first';

/**
 * What the upload does. A ticked consent is never dropped: with saved settings the server records
 * the audited authorization in the same transaction; without them the owner is sent to save the
 * settings first (or to untick the option), so nothing is uploaded under a consent that cannot be kept.
 */
export function uploadPlan(input: { consent: boolean; settingsSaved: boolean }): UploadPlan {
  if (!input.consent) return 'upload_only';
  return input.settingsSaved ? 'upload_and_authorize' : 'save_settings_first';
}

/** A complaint about the chosen file before any request is made; null when it can be uploaded. */
export function checkImageFile(file: { type: string; size: number }): string | null {
  if (file.type !== 'image/png' && file.type !== 'image/jpeg') return 'Choose a PNG or JPEG image.';
  if (file.size === 0) return 'The file is empty.';
  if (file.size > SIGNATURE_MAX_BYTES) return 'The image is larger than 256 KiB.';
  return null;
}

export interface UploadFailure {
  /** `settings_required`: the server stored nothing because the consent needs saved settings. */
  kind: 'settings_required' | 'other';
  message: string;
}

export const SETTINGS_REQUIRED_MESSAGE =
  'Your signature was not uploaded and nothing was authorized, because automatic use needs saved settings. Save your submission settings first, then upload again with the option ticked, or untick it to upload without authorizing.';

export function uploadFailure(caught: unknown): UploadFailure {
  if (caught instanceof ApiRequestError) {
    if (caught.status === 422 && caught.code === 'submission_settings_required') {
      return { kind: 'settings_required', message: SETTINGS_REQUIRED_MESSAGE };
    }
    if (caught.status === 415) return { kind: 'other', message: 'Only PNG and JPEG images are accepted.' };
    if (caught.status === 413) return { kind: 'other', message: 'The image is too large (the limit is 256 KiB).' };
  }
  return { kind: 'other', message: describeError(caught) };
}

export function uploadSuccessText(authorized: boolean): string {
  return authorized
    ? 'Signature uploaded. It is now authorized for automatic submissions.'
    : 'Signature uploaded. Automatic submissions will not print an image until you authorize one.';
}
