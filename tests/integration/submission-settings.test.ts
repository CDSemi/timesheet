import { randomBytes, randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T03: per-user submission settings (recipients, templates, auto-submit, explicit
 * automatic-image authorization). Today is 2026-09-29 (LA 13:00): the current period is
 * 2026-09-14...2026-09-27 with payroll date 2026-10-02. All data is synthetic and every
 * recipient is on the reserved example.invalid domain.
 */

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

const SETTINGS = '/api/settings/submission';
const NOW = '2026-09-29T20:00:00Z';

function body(overrides: Record<string, unknown> = {}) {
  return {
    expected_seq: 0,
    to: ['payroll@example.invalid'],
    cc: ['manager@example.invalid'],
    auto_submit: true,
    ...overrides,
  };
}

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

const totalChanges = () => Number(t.db.prepare('SELECT total_changes()').pluck().get());
const versionRows = (userId = t.userIds.employee) => count('SELECT count(*) FROM submission_settings WHERE user_id = ?', userId);
const auditRows = () => count("SELECT count(*) FROM audit_events WHERE operation LIKE 'submission_settings.%'");

async function save(overrides: Record<string, unknown> = {}, who = employee) {
  return t.request('POST', SETTINGS, { cookie: who, body: body(overrides) });
}

/** Moves the clock and signs in again (a session lasts 12 hours). */
async function at(iso: string) {
  t.clock.set(iso);
  employee = await t.login('employee');
}

/** A synthetic attachment row (the file bytes are not needed by the settings code). */
function addAttachment(userId: string, kind: 'signature' | 'pdf' = 'signature'): string {
  const id = randomUUID();
  const hash = randomBytes(32).toString('hex');
  t.db
    .prepare(
      `INSERT INTO attachments (id, user_id, kind, storage_key, sha256, mime_type, size_bytes, width_px, height_px, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 100, ?, ?, ?)`,
    )
    .run(
      id,
      userId,
      kind,
      `key_${id.replaceAll('-', '')}`,
      hash,
      kind === 'signature' ? 'image/png' : 'application/pdf',
      kind === 'signature' ? 10 : null,
      kind === 'signature' ? 10 : null,
      NOW,
    );
  return id;
}

function audits() {
  return t.db
    .prepare(
      `SELECT operation, actor_user_id, owner_user_id, entity_type, entity_id, before_json, after_json
         FROM audit_events WHERE operation LIKE 'submission_settings.%' ORDER BY rowid`,
    )
    .all() as Array<{
    operation: string;
    actor_user_id: string;
    owner_user_id: string;
    entity_type: string;
    entity_id: string;
    before_json: string | null;
    after_json: string | null;
  }>;
}

describe('defaults before the first save', () => {
  it('shows the defaults (seq 0) and stores nothing', async () => {
    const before = totalChanges();
    const response = await t.request('GET', SETTINGS, { cookie: employee });
    expect(response.status).toBe(200);
    const settings = response.body.settings;
    expect(settings).toMatchObject({
      id: null,
      seq: 0,
      is_default: true,
      recipients: { to: [], cc: [] },
      template_version: 1,
      auto_submit_effective_from: null,
      auto_image: { authorized: false, signature_attachment_id: null, authorized_at: null },
      auto_note: { enabled: false, text: 'Automatic submission' },
      show_ot_on_pdf: true,
      reminder_offsets_minutes: [1440, 120],
    });
    expect(settings.variables).toEqual([
      'EmployeeName',
      'PeriodStart',
      'PeriodEnd',
      'PayrollDate',
      'SignOffStatus',
      'SubmissionId',
      'Revision',
    ]);
    expect(totalChanges()).toBe(before);
    expect(versionRows()).toBe(0);
  });
});

describe('saving settings', () => {
  it('appends version 1 with normalized recipients, defaults and an effective instant of now', async () => {
    const response = await save({
      to: [' Payroll@Example.invalid ', 'payroll@example.INVALID', 'second@example.invalid'],
      cc: ['SECOND@example.invalid', 'manager@example.invalid'],
    });
    expect(response.status).toBe(201);
    expect(response.body.settings).toMatchObject({
      seq: 1,
      is_default: false,
      recipients: { to: ['Payroll@Example.invalid', 'second@example.invalid'], cc: ['manager@example.invalid'] },
      template_version: 1,
      auto_submit: true,
      auto_submit_effective_from: NOW,
      auto_image: { authorized: false },
      auto_note: { enabled: false, text: 'Automatic submission' },
      show_ot_on_pdf: true,
      reminder_offsets_minutes: [1440, 120],
      created_at: NOW,
    });
    expect(versionRows()).toBe(1);
    const current = await t.request('GET', SETTINGS, { cookie: employee });
    expect(current.body.settings.id).toBe(response.body.settings.id);
  });

  it('audits the change with flags and counts only: no address and no template text', async () => {
    const response = await save({
      to: ['payroll@example.invalid', 'two@example.invalid'],
      subject_template: 'Secret subject {PayrollDate}',
      body_template: 'Secret body text for {EmployeeName}',
    });
    expect(response.status).toBe(201);
    const [event, ...rest] = audits();
    expect(rest).toEqual([]);
    expect(event).toMatchObject({
      operation: 'submission_settings.update',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      entity_type: 'submission_settings',
      entity_id: response.body.settings.id,
      before_json: null,
    });
    const after = JSON.parse(event?.after_json ?? '{}');
    expect(after).toMatchObject({
      seq: 1,
      recipients_to_count: 2,
      recipients_cc_count: 1,
      auto_submit: true,
      auto_submit_changed: true,
      template_changed: true,
    });
    const text = `${event?.before_json}${event?.after_json}`;
    expect(text).not.toMatch(/example\.invalid|Secret|payroll|manager/i);
  });

  it('keeps unspecified optional fields and does not change the authorization on a plain save', async () => {
    await save({ show_ot_on_pdf: false, reminder_offsets_minutes: [60, 1440, 60] });
    const second = await save({ expected_seq: 1, to: ['other@example.invalid'], cc: undefined });
    expect(second.status).toBe(201);
    expect(second.body.settings).toMatchObject({
      seq: 2,
      recipients: { to: ['other@example.invalid'], cc: [] },
      show_ot_on_pdf: false,
      reminder_offsets_minutes: [1440, 60],
    });
  });

  it('refuses a stale expected_seq with 409 and writes nothing', async () => {
    await save();
    const stale = await save({ expected_seq: 0 });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
    const ahead = await save({ expected_seq: 5 });
    expect(ahead.status).toBe(409);
    expect(versionRows()).toBe(1);
    expect(auditRows()).toBe(1);
  });

  it('rejects unknown fields (the owner is never a field)', async () => {
    const response = await save({ user_id: t.userIds.admin });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('validation_error');
    expect(versionRows()).toBe(0);
    expect(versionRows(t.userIds.admin)).toBe(0);
  });
});

describe('validation writes nothing', () => {
  const cases: Array<[string, Record<string, unknown>, string]> = [
    ['missing to', { to: undefined }, 'validation_error'],
    ['empty to', { to: [] }, 'recipients_required'],
    ['header injection in to', { to: ['a@example.invalid\r\nBcc: v@example.invalid'] }, 'invalid_recipient'],
    ['header injection in cc', { cc: ['a@example.invalid\nBcc: v@example.invalid'] }, 'invalid_recipient'],
    ['comma list in one entry', { to: ['a@example.invalid,b@example.invalid'] }, 'invalid_recipient'],
    ['display name form', { to: ['Name <a@example.invalid>'] }, 'invalid_recipient'],
    ['malformed address', { to: ['not-an-address'] }, 'invalid_recipient'],
    ['too many to', { to: Array.from({ length: 11 }, (_, index) => `u${index}@example.invalid`) }, 'too_many_recipients'],
    ['unknown variable in the subject', { subject_template: 'Hello {Nope}' }, 'unknown_template_variable'],
    ['unknown variable in the body', { body_template: 'Hello {employeename}' }, 'unknown_template_variable'],
    ['line break in the subject', { subject_template: 'a\r\nBcc: v@example.invalid' }, 'template_line_break'],
    ['unmatched brace', { body_template: 'Hello {EmployeeName' }, 'invalid_template'],
    ['empty subject', { subject_template: '   ' }, 'invalid_template'],
    ['bad reminder offset', { reminder_offsets_minutes: [0] }, 'validation_error'],
  ];

  it.each(cases)('%s gives 422 %s', async (_name, overrides, code) => {
    const changes = totalChanges();
    const response = await save(overrides);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe(code);
    expect(totalChanges()).toBe(changes);
    expect(versionRows()).toBe(0);
    expect(auditRows()).toBe(0);
  });

  it('does not echo the rejected address in the error body', async () => {
    const response = await save({ to: ['evil@example.invalid\r\nBcc: v@example.invalid'] });
    expect(JSON.stringify(response.body)).not.toMatch(/evil|Bcc/);
  });
});

describe('append-only versions', () => {
  it('keeps every earlier version byte-for-byte and lists them newest first', async () => {
    const first = await save({ to: ['one@example.invalid'] });
    const firstRow = t.db.prepare('SELECT * FROM submission_settings WHERE id = ?').get(first.body.settings.id);
    t.clock.advanceSeconds(3600);
    const second = await save({ expected_seq: 1, to: ['two@example.invalid'] });
    expect(second.body.settings.seq).toBe(2);
    expect(t.db.prepare('SELECT * FROM submission_settings WHERE id = ?').get(first.body.settings.id)).toEqual(firstRow);

    const list = await t.request('GET', `${SETTINGS}/versions`, { cookie: employee });
    expect(list.body.versions.map((item: { seq: number }) => item.seq)).toEqual([2, 1]);
    const old = await t.request('GET', `${SETTINGS}/versions/${first.body.settings.id}`, { cookie: employee });
    expect(old.status).toBe(200);
    expect(old.body.settings.recipients.to).toEqual(['one@example.invalid']);
  });

  it('refuses UPDATE and DELETE of a stored version at the schema level', async () => {
    const response = await save();
    const id = response.body.settings.id as string;
    expect(() => t.db.prepare('UPDATE submission_settings SET auto_submit = 0 WHERE id = ?').run(id)).toThrow(/immutable_submission_settings/);
    expect(() => t.db.prepare('DELETE FROM submission_settings WHERE id = ?').run(id)).toThrow(/immutable_submission_settings/);
  });

  it('increments the template version only when subject or body text changes', async () => {
    await save();
    const same = await save({ expected_seq: 1, to: ['other@example.invalid'] });
    expect(same.body.settings.template_version).toBe(1);
    const changed = await save({ expected_seq: 2, subject_template: 'New {PayrollDate}' });
    expect(changed.body.settings.template_version).toBe(2);
    const bodyChanged = await save({ expected_seq: 3, subject_template: 'New {PayrollDate}', body_template: 'Body {Revision}' });
    expect(bodyChanged.body.settings.template_version).toBe(3);
    const unchanged = await save({ expected_seq: 4, subject_template: 'New {PayrollDate}', body_template: 'Body {Revision}' });
    expect(unchanged.body.settings.template_version).toBe(3);
  });
});

describe('auto-submit effective instant (docs/05: changes default to future periods)', () => {
  it('records now when the switch changes and carries it while the switch stays the same', async () => {
    const first = await save({ auto_submit: true });
    expect(first.body.settings.auto_submit_effective_from).toBe(NOW);

    await at('2026-09-30T10:00:00Z');
    const unrelated = await save({ expected_seq: 1, to: ['other@example.invalid'], auto_submit: true });
    expect(unrelated.body.settings.auto_submit_effective_from).toBe(NOW);

    await at('2026-10-01T10:30:00Z');
    const off = await save({ expected_seq: 2, auto_submit: false });
    expect(off.body.settings.auto_submit).toBe(false);
    expect(off.body.settings.auto_submit_effective_from).toBe('2026-10-01T10:30:00Z');

    await at('2026-10-01T12:00:00Z');
    const stillOff = await save({ expected_seq: 3, auto_submit: false });
    expect(stillOff.body.settings.auto_submit_effective_from).toBe('2026-10-01T10:30:00Z');
  });

  it('never reaches back to already-overdue drafts unless that is chosen explicitly', async () => {
    await save({ auto_submit: false });
    await at('2026-10-03T00:00:00Z');
    const on = await save({ expected_seq: 1, auto_submit: true });
    // The period due 2026-09-29 17:00 local is before the instant, so it is not covered.
    expect(on.body.settings.auto_submit_effective_from).toBe('2026-10-03T00:00:00Z');

    await at('2026-10-04T00:00:00Z');
    const explicit = await save({ expected_seq: 2, auto_submit: false, apply_to_overdue_drafts: true });
    expect(explicit.status).toBe(201);
    expect(explicit.body.settings.auto_submit_effective_from).toBe('1970-01-01T00:00:00Z');
    const event = audits().at(-1);
    expect(JSON.parse(event?.after_json ?? '{}')).toMatchObject({ applies_to_overdue_drafts: true, auto_submit_changed: true });
  });

  it('refuses applying to overdue drafts when the switch does not change', async () => {
    await save({ auto_submit: true });
    const response = await save({ expected_seq: 1, auto_submit: true, apply_to_overdue_drafts: true });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('apply_to_overdue_requires_change');
    expect(versionRows()).toBe(1);
  });

  it('stores only the per-user instant and implements no system activation', async () => {
    await save();
    expect(count('SELECT count(*) FROM operations_state WHERE automation_active_from IS NOT NULL')).toBe(0);
  });
});

describe('automatic note line', () => {
  // "Nop tu dong" with Vietnamese diacritics, built from code points so this file stays ASCII.
  const NOTE_VI = `N${String.fromCodePoint(0x1ed9)}p t${String.fromCodePoint(0x1ef1)} ${String.fromCodePoint(0x111)}${String.fromCodePoint(0x1ed9)}ng`;

  it('is off with the text "Automatic submission" until the user turns it on', async () => {
    const saved = await save();
    expect(saved.body.settings.auto_note).toEqual({ enabled: false, text: 'Automatic submission' });
    expect(t.db.prepare('SELECT auto_note_enabled, auto_note_text FROM submission_settings').get()).toEqual({
      auto_note_enabled: 0,
      auto_note_text: 'Automatic submission',
    });
  });

  it('saves a custom Vietnamese text and the switch as one version; omitted fields keep the current values', async () => {
    const first = await save({ auto_note_enabled: true, auto_note_text: NOTE_VI });
    expect(first.status).toBe(201);
    expect(first.body.settings.auto_note).toEqual({ enabled: true, text: NOTE_VI });
    // Only the switch: the text stays; only the text: the switch stays.
    const off = await save({ expected_seq: 1, auto_note_enabled: false });
    expect(off.body.settings.auto_note).toEqual({ enabled: false, text: NOTE_VI });
    const retext = await save({ expected_seq: 2, auto_note_text: 'Weekly submission' });
    expect(retext.body.settings.auto_note).toEqual({ enabled: false, text: 'Weekly submission' });
    // A save that names neither keeps both.
    const plain = await save({ expected_seq: 3, to: ['other@example.invalid'] });
    expect(plain.body.settings.auto_note).toEqual({ enabled: false, text: 'Weekly submission' });
    expect(versionRows()).toBe(4);
    const current = await t.request('GET', SETTINGS, { cookie: employee });
    expect(current.body.settings.auto_note).toEqual({ enabled: false, text: 'Weekly submission' });
  });

  it('normalizes the text to NFC and trims it', async () => {
    const decomposed = `  Cafe${String.fromCodePoint(0x301)} note  `;
    const response = await save({ auto_note_enabled: true, auto_note_text: decomposed });
    expect(response.status).toBe(201);
    expect(response.body.settings.auto_note.text).toBe(`Caf${String.fromCodePoint(0xe9)} note`);
    expect(t.db.prepare('SELECT auto_note_text FROM submission_settings').pluck().get()).toBe(`Caf${String.fromCodePoint(0xe9)} note`);
  });

  it('accepts exactly 120 characters, counting characters and not bytes', async () => {
    const exact = String.fromCodePoint(0x1ed9).repeat(120);
    const ok = await save({ auto_note_enabled: true, auto_note_text: exact });
    expect(ok.status).toBe(201);
    expect(ok.body.settings.auto_note.text).toBe(exact);
  });

  const refusals: Array<[string, unknown]> = [
    ['121 characters', 'x'.repeat(121)],
    ['an empty text', ''],
    ['a blank text', '   '],
    ['a line break', 'first\nsecond'],
    ['a carriage return', 'first\rsecond'],
    ['a tab', 'first\tsecond'],
    ['a control character', `bell${String.fromCodePoint(7)}`],
    ['a NUL character', `nul${String.fromCodePoint(0)}`],
    ['a line separator', `line${String.fromCodePoint(0x2028)}separator`],
    ['a bidirectional control', `abc${String.fromCodePoint(0x202e)}def`],
    ['an opening brace', 'Hello {EmployeeName'],
    ['a template variable', 'Sent for {EmployeeName}'],
    ['a closing brace', 'Hello }'],
  ];

  it.each(refusals)('refuses %s with 422 invalid_auto_note and writes nothing', async (_label, value) => {
    await save();
    const before = { versions: versionRows(), audits: auditRows(), changes: totalChanges() };
    const response = await save({ expected_seq: 1, auto_note_enabled: true, auto_note_text: value });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('invalid_auto_note');
    expect({ versions: versionRows(), audits: auditRows(), changes: totalChanges() }).toEqual(before);
  });

  it('refuses a wrong type with a validation error and writes nothing', async () => {
    for (const overrides of [{ auto_note_enabled: 'yes' }, { auto_note_enabled: 1 }, { auto_note_text: 5 }, { auto_note_text: null }, { auto_note_text: 'x'.repeat(2000) }]) {
      const response = await save(overrides);
      expect(response.status, JSON.stringify(overrides)).toBe(422);
      expect(response.body.error.code).toBe('validation_error');
    }
    expect(versionRows()).toBe(0);
    expect(auditRows()).toBe(0);
  });

  it('audits a note change with the before and after of the two fields only', async () => {
    await save();
    t.clock.advanceSeconds(60);
    const changed = await save({ expected_seq: 1, auto_note_enabled: true, auto_note_text: NOTE_VI });
    expect(changed.status).toBe(201);
    const event = audits().at(-1);
    expect(event).toMatchObject({
      operation: 'submission_settings.update',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      entity_id: changed.body.settings.id,
    });
    expect(JSON.parse(event?.before_json ?? '{}')).toMatchObject({ seq: 1, auto_note_enabled: false, auto_note_text: 'Automatic submission' });
    expect(JSON.parse(event?.after_json ?? '{}')).toMatchObject({
      seq: 2,
      auto_note_enabled: true,
      auto_note_text: NOTE_VI,
      auto_note_changed: true,
      template_changed: false,
      auto_submit_changed: false,
    });
    // No address, template or image content leaks into the audit.
    expect(`${event?.before_json}${event?.after_json}`).not.toMatch(/example\.invalid|Hello|base64/i);
    // A save that leaves the note alone does not claim a note change.
    await save({ expected_seq: 2, to: ['other@example.invalid'] });
    expect(JSON.parse(audits().at(-1)?.after_json ?? '{}')).toMatchObject({ auto_note_changed: false });
  });

  it('is not a template change and does not move the auto-submit instant', async () => {
    await save();
    t.clock.advanceSeconds(3600);
    const changed = await save({ expected_seq: 1, auto_note_enabled: true });
    expect(changed.body.settings).toMatchObject({ template_version: 1, auto_submit_effective_from: NOW, seq: 2 });
  });

  it('survives the image authorization and revocation, and a stale save is refused', async () => {
    await save({ auto_note_enabled: true, auto_note_text: NOTE_VI });
    const signature = addAttachment(t.userIds.employee);
    const authorized = await t.request('POST', `${SETTINGS}/auto-image/authorize`, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: signature } });
    expect(authorized.body.settings.auto_note).toEqual({ enabled: true, text: NOTE_VI });
    const revoked = await t.request('POST', `${SETTINGS}/auto-image/revoke`, { cookie: employee, body: { expected_seq: 2 } });
    expect(revoked.body.settings.auto_note).toEqual({ enabled: true, text: NOTE_VI });
    const stale = await save({ expected_seq: 1, auto_note_enabled: false });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');
    expect(versionRows()).toBe(3);
  });

  it("never reads or changes another user's note", async () => {
    await save({ auto_note_enabled: true, auto_note_text: NOTE_VI });
    const other = await t.request('GET', SETTINGS, { cookie: admin });
    expect(other.body.settings.auto_note).toEqual({ enabled: false, text: 'Automatic submission' });
    expect(versionRows(t.userIds.admin)).toBe(0);
  });
});

describe('automatic signature image authorization', () => {
  const AUTHORIZE = `${SETTINGS}/auto-image/authorize`;
  const REVOKE = `${SETTINGS}/auto-image/revoke`;

  it('is off by default', async () => {
    const saved = await save();
    expect(saved.body.settings.auto_image).toEqual({ authorized: false, signature_attachment_id: null, authorized_at: null });
  });

  it('is an explicit audited act that references one own signature and survives plain saves', async () => {
    await save();
    const signature = addAttachment(t.userIds.employee);
    t.clock.advanceSeconds(60);
    const response = await t.request('POST', AUTHORIZE, {
      cookie: employee,
      body: { expected_seq: 1, signature_attachment_id: signature },
    });
    expect(response.status).toBe(201);
    expect(response.body.settings.seq).toBe(2);
    expect(response.body.settings.auto_image).toEqual({
      authorized: true,
      signature_attachment_id: signature,
      authorized_at: '2026-09-29T20:01:00Z',
    });
    const event = audits().at(-1);
    expect(event).toMatchObject({
      operation: 'submission_settings.auto_image_authorize',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      entity_id: response.body.settings.id,
    });
    expect(JSON.parse(event?.after_json ?? '{}')).toMatchObject({
      auto_image_authorized: true,
      auto_image_attachment_id: signature,
      replaces_attachment_id: null,
    });
    expect(JSON.parse(event?.before_json ?? '{}')).toMatchObject({ auto_image_authorized: false });
    expect(`${event?.before_json}${event?.after_json}`).not.toMatch(/example\.invalid|base64/i);

    const later = await save({ expected_seq: 2, to: ['other@example.invalid'] });
    expect(later.body.settings.auto_image.signature_attachment_id).toBe(signature);
    expect(later.body.settings.auto_image.authorized).toBe(true);
  });

  it("refuses another user's signature, a missing id, a non-signature attachment and a bad id (404) without writing", async () => {
    await save();
    const foreign = addAttachment(t.userIds.admin);
    const pdf = addAttachment(t.userIds.employee, 'pdf');
    const before = { versions: versionRows(), audits: auditRows(), changes: totalChanges() };
    for (const id of [foreign, pdf, randomUUID(), 'not-a-uuid', '../../etc/passwd']) {
      const response = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: id } });
      expect(response.status, id).toBe(404);
      expect(response.body.error.code).toBe('not_found');
    }
    expect({ versions: versionRows(), audits: auditRows(), changes: totalChanges() }).toEqual(before);
  });

  it('needs saved settings first, a fresh expected_seq, and refuses the same image twice', async () => {
    const signature = addAttachment(t.userIds.employee);
    const early = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 0, signature_attachment_id: signature } });
    expect(early.status).toBe(422);
    expect(early.body.error.code).toBe('submission_settings_required');

    await save();
    const stale = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 0, signature_attachment_id: signature } });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_version');

    const ok = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: signature } });
    expect(ok.status).toBe(201);
    const again = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 2, signature_attachment_id: signature } });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('already_authorized');
    expect(versionRows()).toBe(2);
  });

  it('can switch to a newer signature; the earlier image stays referenced by the older version', async () => {
    await save();
    const first = addAttachment(t.userIds.employee);
    const second = addAttachment(t.userIds.employee);
    await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: first } });
    const switched = await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 2, signature_attachment_id: second } });
    expect(switched.status).toBe(201);
    expect(switched.body.settings.auto_image.signature_attachment_id).toBe(second);
    expect(JSON.parse(audits().at(-1)?.after_json ?? '{}').replaces_attachment_id).toBe(first);
    const versions = await t.request('GET', `${SETTINGS}/versions`, { cookie: employee });
    expect(versions.body.versions.map((item: { auto_image: { signature_attachment_id: string | null } }) => item.auto_image.signature_attachment_id)).toEqual([
      second,
      first,
      null,
    ]);
  });

  it('revoking is audited, appends a version and refuses a no-op revocation', async () => {
    await save();
    const signature = addAttachment(t.userIds.employee);
    const none = await t.request('POST', REVOKE, { cookie: employee, body: { expected_seq: 1 } });
    expect(none.status).toBe(409);
    expect(none.body.error.code).toBe('not_authorized');

    await t.request('POST', AUTHORIZE, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: signature } });
    const revoked = await t.request('POST', REVOKE, { cookie: employee, body: { expected_seq: 2 } });
    expect(revoked.status).toBe(201);
    expect(revoked.body.settings.seq).toBe(3);
    expect(revoked.body.settings.auto_image).toEqual({ authorized: false, signature_attachment_id: null, authorized_at: null });
    const event = audits().at(-1);
    expect(event?.operation).toBe('submission_settings.auto_image_revoke');
    expect(JSON.parse(event?.after_json ?? '{}')).toMatchObject({ auto_image_authorized: false, revoked_attachment_id: signature });
    expect(JSON.parse(event?.before_json ?? '{}')).toMatchObject({ auto_image_authorized: true, auto_image_attachment_id: signature });

    const audited = audits().map((item) => item.operation);
    expect(audited).toEqual([
      'submission_settings.update',
      'submission_settings.auto_image_authorize',
      'submission_settings.auto_image_revoke',
    ]);
  });
});

describe('preview', () => {
  async function previewWith(who: string, overrides: Record<string, unknown> = {}) {
    return t.request('POST', `${SETTINGS}/preview`, { cookie: who, body: overrides });
  }

  it('renders the stored templates with sample values and writes nothing', async () => {
    await save({ subject_template: 'Timesheet {PayrollDate} - {EmployeeName}', body_template: 'Rev {Revision} for {PeriodStart}-{PeriodEnd}' });
    const changes = totalChanges();
    const rows = { versions: versionRows(), audits: auditRows(), periods: count('SELECT count(*) FROM pay_periods') };
    const response = await previewWith(employee);
    expect(response.status).toBe(200);
    expect(response.body.preview).toMatchObject({
      sample: true,
      sign_off: 'manual',
      subject: 'Timesheet 2026-10-02 - Example Employee',
      text_body: 'Rev 1 for 2026-09-14-2026-09-27',
      html_body: 'Rev 1 for 2026-09-14-2026-09-27',
      recipients: { to: ['payroll@example.invalid'], cc: ['manager@example.invalid'] },
      template_version: 1,
    });
    expect(totalChanges()).toBe(changes);
    expect({ versions: versionRows(), audits: auditRows(), periods: count('SELECT count(*) FROM pay_periods') }).toEqual(rows);
  });

  it('previews an unsaved draft with the SignOffStatus of a manual submission, "Submitted", without storing it', async () => {
    const changes = totalChanges();
    const response = await previewWith(employee, {
      subject_template: 'Draft {SignOffStatus}',
      body_template: 'Hi {EmployeeName}',
      sign_off: 'manual',
    });
    expect(response.status).toBe(200);
    expect(response.body.preview.sign_off).toBe('manual');
    expect(response.body.preview.subject).toBe('Draft Submitted');
    expect(response.body.preview.recipients).toEqual({ to: [], cc: [] });
    expect(totalChanges()).toBe(changes);
    expect(versionRows()).toBe(0);
  });

  it('previews an automatic submission: "Submitted" with the note off, the note text with the note on', async () => {
    const draft = { subject_template: 'Draft {SignOffStatus}', body_template: 'Hi {EmployeeName}: {SignOffStatus}', sign_off: 'automatic' };
    const off = await previewWith(employee, draft);
    expect(off.status).toBe(200);
    expect(off.body.preview).toMatchObject({ sign_off: 'automatic', subject: 'Draft Submitted', text_body: 'Hi Example Employee: Submitted' });
    expect(`${off.body.preview.subject}${off.body.preview.text_body}${off.body.preview.html_body}`).not.toMatch(/automatic|pending|review|Signed/i);

    await save({ auto_note_enabled: true, auto_note_text: 'Sent on schedule <b>' });
    const on = await previewWith(employee, draft);
    expect(on.body.preview.subject).toBe('Draft Sent on schedule <b>');
    expect(on.body.preview.text_body).toBe('Hi Example Employee: Sent on schedule <b>');
    expect(on.body.preview.html_body).toBe('Hi Example Employee: Sent on schedule &lt;b&gt;');
    // The note never reaches a manual submission.
    const manual = await previewWith(employee, { ...draft, sign_off: 'manual' });
    expect(manual.body.preview.subject).toBe('Draft Submitted');
    // The default origin is manual.
    const unspecified = await previewWith(employee, { subject_template: 'Draft {SignOffStatus}' });
    expect(unspecified.body.preview).toMatchObject({ sign_off: 'manual', subject: 'Draft Submitted' });
  });

  it('refuses the retired sign_off values', async () => {
    for (const value of ['signed', 'review_pending', 'other']) {
      const response = await previewWith(employee, { sign_off: value });
      expect(response.status, value).toBe(422);
      expect(response.body.error.code).toBe('validation_error');
    }
  });

  it('escapes hostile values in the HTML body and keeps the subject on one line', async () => {
    t.db
      .prepare('UPDATE users SET display_name = ? WHERE id = ?')
      .run('Eve <img src=x onerror=1> & Co\r\nBcc: victim@example.invalid', t.userIds.employee);
    const response = await previewWith(employee, {
      subject_template: 'For {EmployeeName}',
      body_template: '<b>{EmployeeName}</b>',
    });
    expect(response.status).toBe(200);
    const { subject, html_body: html, text_body: text } = response.body.preview;
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toBe('For Eve <img src=x onerror=1> & Co Bcc: victim@example.invalid');
    expect(html).toBe('&lt;b&gt;Eve &lt;img src=x onerror=1&gt; &amp; Co Bcc: victim@example.invalid&lt;/b&gt;');
    expect(html).not.toContain('<img');
    expect(text).toBe('<b>Eve <img src=x onerror=1> & Co Bcc: victim@example.invalid</b>');
  });

  it.each([
    ['unknown variable in the draft subject', { subject_template: '{Nope}' }, 'unknown_template_variable'],
    ['unknown variable in the draft body', { body_template: '{Nope}' }, 'unknown_template_variable'],
    ['line break in the draft subject', { subject_template: 'a\nb' }, 'template_line_break'],
    ['unknown field', { user_id: 'x' }, 'validation_error'],
  ])('%s gives 422 and writes nothing', async (_name, overrides, code) => {
    const changes = totalChanges();
    const response = await previewWith(employee, overrides);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe(code);
    expect(totalChanges()).toBe(changes);
  });

  it("shows only the caller's own recipients", async () => {
    await save({ to: ['employee-only@example.invalid'] });
    await save({ to: ['admin-only@example.invalid'] }, admin);
    const mine = await previewWith(admin);
    expect(mine.body.preview.recipients.to).toEqual(['admin-only@example.invalid']);
    expect(JSON.stringify(mine.body)).not.toContain('employee-only');
    expect(mine.body.preview.values.EmployeeName).toBe('Example Admin');
  });
});

describe('owner scoping (ID swap) and access control', () => {
  it("gives another user their own defaults and 404 for the first user's version ids", async () => {
    const mine = await save({ to: ['employee-only@example.invalid'] });
    const id = mine.body.settings.id as string;

    const adminCurrent = await t.request('GET', SETTINGS, { cookie: admin });
    expect(adminCurrent.body.settings).toMatchObject({ id: null, seq: 0, is_default: true });
    expect(JSON.stringify(adminCurrent.body)).not.toContain('employee-only');

    const adminList = await t.request('GET', `${SETTINGS}/versions`, { cookie: admin });
    expect(adminList.body.versions).toEqual([]);

    for (const swapped of [id, randomUUID(), 'not-a-uuid']) {
      const response = await t.request('GET', `${SETTINGS}/versions/${swapped}`, { cookie: admin });
      expect(response.status, swapped).toBe(404);
      expect(JSON.stringify(response.body)).not.toContain('employee-only');
    }
    const owner = await t.request('GET', `${SETTINGS}/versions/${id}`, { cookie: employee });
    expect(owner.status).toBe(200);
  });

  it("keeps each user's versions and sequence independent", async () => {
    await save({ to: ['employee-only@example.invalid'] });
    const adminSave = await save({ to: ['admin-only@example.invalid'] }, admin);
    expect(adminSave.status).toBe(201);
    expect(adminSave.body.settings.seq).toBe(1);
    expect(versionRows(t.userIds.admin)).toBe(1);
    expect(versionRows(t.userIds.employee)).toBe(1);
    const owners = audits().map((item) => `${item.actor_user_id}:${item.owner_user_id}`);
    expect(owners).toEqual([`${t.userIds.employee}:${t.userIds.employee}`, `${t.userIds.admin}:${t.userIds.admin}`]);
  });

  it('requires a session on every route', async () => {
    const calls: Array<[string, string, unknown]> = [
      ['GET', SETTINGS, undefined],
      ['GET', `${SETTINGS}/versions`, undefined],
      ['GET', `${SETTINGS}/versions/${randomUUID()}`, undefined],
      ['POST', SETTINGS, body()],
      ['POST', `${SETTINGS}/preview`, {}],
      ['POST', `${SETTINGS}/auto-image/authorize`, { expected_seq: 0, signature_attachment_id: randomUUID() }],
      ['POST', `${SETTINGS}/auto-image/revoke`, { expected_seq: 0 }],
    ];
    for (const [method, path, payload] of calls) {
      const response = await t.request(method, path, payload === undefined ? {} : { body: payload });
      expect(response.status, `${method} ${path}`).toBe(401);
    }
    expect(versionRows()).toBe(0);
  });

  it('rejects a missing, foreign or cross-site origin and non-JSON bodies on every POST', async () => {
    const posts: Array<[string, unknown]> = [
      [SETTINGS, body()],
      [`${SETTINGS}/preview`, {}],
      [`${SETTINGS}/auto-image/authorize`, { expected_seq: 0, signature_attachment_id: randomUUID() }],
      [`${SETTINGS}/auto-image/revoke`, { expected_seq: 0 }],
    ];
    for (const [path, payload] of posts) {
      const missing = await t.request('POST', path, { cookie: employee, body: payload, origin: null });
      expect(missing.status, path).toBe(403);
      const foreign = await t.request('POST', path, { cookie: employee, body: payload, origin: 'https://evil.example.invalid' });
      expect(foreign.status, path).toBe(403);
      const crossSite = await t.request('POST', path, { cookie: employee, body: payload, headers: { 'sec-fetch-site': 'cross-site' } });
      expect(crossSite.status, path).toBe(403);
      const form = await t.request('POST', path, {
        cookie: employee,
        body: 'a=b',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
      expect(form.status, path).toBe(415);
      const ok = await t.request('POST', path, { cookie: employee, body: payload, origin: ORIGIN });
      expect(ok.status, path).not.toBe(403);
    }
  });

  it('stores nothing but the version rows and audit events (no job, mail or file side effect)', async () => {
    const tables = ['jobs', 'delivery_attempts', 'revision_files', 'timesheet_revisions', 'signoffs', 'reminder_occurrences', 'ot_ledger'];
    await save();
    const signature = addAttachment(t.userIds.employee);
    await t.request('POST', `${SETTINGS}/auto-image/authorize`, { cookie: employee, body: { expected_seq: 1, signature_attachment_id: signature } });
    await t.request('POST', `${SETTINGS}/preview`, { cookie: employee, body: {} });
    for (const table of tables) expect(count(`SELECT count(*) FROM ${table}`), table).toBe(0);
  });
});
