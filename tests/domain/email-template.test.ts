import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BODY_TEMPLATE,
  DEFAULT_SUBJECT_TEMPLATE,
  EmailTemplateError,
  escapeHtml,
  isValidEmailAddress,
  MAX_RECIPIENTS_PER_LIST,
  normalizeRecipients,
  renderHtmlBody,
  renderSubject,
  renderTextBody,
  signOffStatusText,
  TEMPLATE_VARIABLES,
  type TemplateValues,
  validateBodyTemplate,
  validateSubjectTemplate,
} from '../../src/domain/emailTemplate.ts';

/*
 * WP3-T03: the closed variable set, escaping, header-injection safety and recipient
 * validation. All values are synthetic; recipients use the reserved example.invalid domain.
 */

const VALUES: TemplateValues = {
  EmployeeName: 'Example Employee',
  PeriodStart: '2026-09-14',
  PeriodEnd: '2026-09-27',
  PayrollDate: '2026-10-02',
  SignOffStatus: 'Submitted',
  SubmissionId: 'SUB-0001',
  Revision: '1',
};

function codeOf(work: () => unknown): string {
  try {
    work();
  } catch (error) {
    if (error instanceof EmailTemplateError) return error.code;
    throw error;
  }
  return 'no_error';
}

describe('template variables', () => {
  it('are exactly the seven documented names', () => {
    expect([...TEMPLATE_VARIABLES]).toEqual([
      'EmployeeName',
      'PeriodStart',
      'PeriodEnd',
      'PayrollDate',
      'SignOffStatus',
      'SubmissionId',
      'Revision',
    ]);
  });

  it('are all substituted in subject and bodies', () => {
    const template = TEMPLATE_VARIABLES.map((name) => `{${name}}`).join('|');
    const expected = TEMPLATE_VARIABLES.map((name) => VALUES[name]).join('|');
    expect(renderSubject(template, VALUES)).toBe(expected);
    expect(renderTextBody(template, VALUES)).toBe(expected);
    expect(renderHtmlBody(template, VALUES)).toBe(expected);
  });

  it('render the default templates without leftovers', () => {
    expect(renderSubject(DEFAULT_SUBJECT_TEMPLATE, VALUES)).toBe(
      'Timesheet 2026-09-14 to 2026-09-27 - Example Employee - Submitted',
    );
    expect(renderTextBody(DEFAULT_BODY_TEMPLATE, VALUES)).not.toMatch(/[{}]/);
  });

  it.each(['{Unknown}', '{employeename}', '{ EmployeeName }', '{}', '{EmployeeName }', 'Hi {Name}', '{PayrollDate2}'])(
    'rejects the unknown variable %s',
    (template) => {
      expect(codeOf(() => validateSubjectTemplate(template))).toBe('unknown_template_variable');
      expect(codeOf(() => validateBodyTemplate(template))).toBe('unknown_template_variable');
      expect(codeOf(() => renderSubject(template, VALUES))).toBe('unknown_template_variable');
      expect(codeOf(() => renderTextBody(template, VALUES))).toBe('unknown_template_variable');
      expect(codeOf(() => renderHtmlBody(template, VALUES))).toBe('unknown_template_variable');
    },
  );

  it.each(['{EmployeeName', 'EmployeeName}', '{{EmployeeName}}', 'a } b', '{ {EmployeeName}'])(
    'rejects the malformed template %s',
    (template) => {
      expect(codeOf(() => validateBodyTemplate(template))).toBe('invalid_template');
    },
  );

  it('bounds the unknown name echoed in the error and strips control characters', () => {
    try {
      validateBodyTemplate(`{${'x'.repeat(100)}\r\n}`);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EmailTemplateError);
      const name = String((error as EmailTemplateError).details?.variable);
      expect(name.length).toBeLessThanOrEqual(40);
      expect(name).not.toMatch(/[\r\n]/);
    }
  });

  it('rejects empty and over-long templates', () => {
    expect(codeOf(() => validateSubjectTemplate('   '))).toBe('invalid_template');
    expect(codeOf(() => validateSubjectTemplate('a'.repeat(501)))).toBe('invalid_template');
    expect(codeOf(() => validateBodyTemplate(''))).toBe('invalid_template');
    expect(codeOf(() => validateBodyTemplate('a'.repeat(10_001)))).toBe('invalid_template');
  });
});

describe('HTML escaping', () => {
  const hostile: TemplateValues = { ...VALUES, EmployeeName: `<script>alert("x")</script> & 'O'` };

  it('escapes every value in the HTML body', () => {
    const html = renderHtmlBody('Name: {EmployeeName}', hostile);
    expect(html).toBe('Name: &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;O&#39;');
    expect(html).not.toContain('<script>');
  });

  it('escapes the template text itself and turns line breaks into <br>', () => {
    const html = renderHtmlBody('<b>Hi</b>\r\nSecond & third\nFourth', VALUES);
    expect(html).toBe('&lt;b&gt;Hi&lt;/b&gt;<br>\nSecond &amp; third<br>\nFourth');
  });

  it('keeps the plain-text body unescaped', () => {
    expect(renderTextBody('Name: {EmployeeName}', hostile)).toBe(`Name: <script>alert("x")</script> & 'O'`);
  });

  it('escapes the five HTML-significant characters only', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    expect(escapeHtml('plain text 123')).toBe('plain text 123');
  });
});

describe('header injection through the subject', () => {
  it('refuses a line break in the subject template', () => {
    for (const bad of ['a\nBcc: x@example.invalid', 'a\rBcc: x@example.invalid', 'a\u0085b', 'a\u2028b', 'a\u2029b']) {
      expect(codeOf(() => validateSubjectTemplate(bad)), JSON.stringify(bad)).toBe('template_line_break');
    }
  });

  it('never renders a CR or LF, whatever a value contains', () => {
    const values: TemplateValues = {
      ...VALUES,
      EmployeeName: 'Eve\r\nBcc: victim@example.invalid',
      SignOffStatus: 'x\ny\rz\u2028w\u2029v\u0085u\u0000t',
    };
    const subject = renderSubject('{EmployeeName} / {SignOffStatus}', values);
    expect(subject).not.toMatch(/[\r\n\u0085\u2028\u2029\u0000]/);
    expect(subject).toBe('Eve Bcc: victim@example.invalid / x y z w v u t');
  });

  it('keeps a body value on one line as well', () => {
    const values: TemplateValues = { ...VALUES, EmployeeName: 'Eve\r\nBcc: victim@example.invalid' };
    expect(renderTextBody('{EmployeeName}', values)).toBe('Eve Bcc: victim@example.invalid');
  });

  it('normalizes CR and CRLF in the body template to LF', () => {
    expect(renderTextBody('a\r\nb\rc', VALUES)).toBe('a\nb\nc');
  });
});

describe('recipients', () => {
  it('accepts plain addresses and trims them', () => {
    expect(normalizeRecipients([' payroll@example.invalid ', 'first.last+tag@sub.example.invalid'], ['cc@example.invalid'])).toEqual({
      to: ['payroll@example.invalid', 'first.last+tag@sub.example.invalid'],
      cc: ['cc@example.invalid'],
    });
  });

  it('treats cc as optional', () => {
    expect(normalizeRecipients(['a@example.invalid'])).toEqual({ to: ['a@example.invalid'], cc: [] });
  });

  it('requires at least one to address', () => {
    expect(codeOf(() => normalizeRecipients([], ['cc@example.invalid']))).toBe('recipients_required');
    expect(codeOf(() => normalizeRecipients([]))).toBe('recipients_required');
  });

  it('de-duplicates case-insensitively, keeps the first spelling and drops a cc already in to', () => {
    expect(
      normalizeRecipients(
        ['Payroll@Example.invalid', 'payroll@example.INVALID', 'other@example.invalid'],
        ['OTHER@example.invalid', 'cc@example.invalid', 'CC@example.invalid'],
      ),
    ).toEqual({ to: ['Payroll@Example.invalid', 'other@example.invalid'], cc: ['cc@example.invalid'] });
  });

  const INVALID = [
    '',
    'plain',
    'a@',
    '@example.invalid',
    'a@b',
    'a b@example.invalid',
    'a@exam ple.invalid',
    'a@@example.invalid',
    'a@example.invalid,b@example.invalid',
    'a@example.invalid;b@example.invalid',
    'Name <a@example.invalid>',
    '<a@example.invalid>',
    '"a"@example.invalid',
    'a@example.invalid\r\nBcc: v@example.invalid',
    'a@example.invalid\nBcc: v@example.invalid',
    'a\r@example.invalid',
    'a@example.invalid\u0000',
    'a..b@example.invalid',
    '.a@example.invalid',
    'a.@example.invalid',
    'a@-example.invalid',
    'a@example-.invalid',
    'a@example..invalid',
    'a@example.invalid.',
    'a@[127.0.0.1]',
    'a@example.123',
    'a(comment)@example.invalid',
    `${'a'.repeat(65)}@example.invalid`,
    `a@${'b'.repeat(64)}.invalid`,
    `a@${'b.'.repeat(130)}invalid`,
    '\u00e4@example.invalid',
    'a@ex\u00e4mple.invalid',
  ];

  it.each(INVALID)('rejects %j', (address) => {
    expect(isValidEmailAddress(address)).toBe(false);
    expect(codeOf(() => normalizeRecipients([address]))).toBe('invalid_recipient');
    expect(codeOf(() => normalizeRecipients(['ok@example.invalid'], [address]))).toBe('invalid_recipient');
  });

  it('does not echo a rejected address, but names the field and position', () => {
    try {
      normalizeRecipients(['ok@example.invalid', 'evil@example.invalid\r\nBcc: v@example.invalid']);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EmailTemplateError);
      const failure = error as EmailTemplateError;
      expect(failure.message).not.toMatch(/evil|Bcc/);
      expect(failure.details).toEqual({ field: 'to', position: 2 });
    }
  });

  it('bounds the number of addresses per list after de-duplication', () => {
    const make = (count: number) => Array.from({ length: count }, (_, index) => `user${index}@example.invalid`);
    expect(normalizeRecipients(make(MAX_RECIPIENTS_PER_LIST)).to).toHaveLength(MAX_RECIPIENTS_PER_LIST);
    expect(codeOf(() => normalizeRecipients(make(MAX_RECIPIENTS_PER_LIST + 1)))).toBe('too_many_recipients');
    expect(codeOf(() => normalizeRecipients(['a@example.invalid'], make(MAX_RECIPIENTS_PER_LIST + 1)))).toBe('too_many_recipients');
    // Duplicates collapse before the bound is applied.
    expect(normalizeRecipients(Array.from({ length: 20 }, () => 'same@example.invalid')).to).toEqual(['same@example.invalid']);
    // A very long input is refused outright.
    expect(codeOf(() => normalizeRecipients(make(4 * MAX_RECIPIENTS_PER_LIST + 1)))).toBe('too_many_recipients');
  });
});

describe('SignOffStatus text (one domain function for every submission)', () => {
  const NOTE_OFF = { enabled: false, text: 'Automatic submission' };
  const NOTE_ON = { enabled: true, text: 'Submitted by the weekly schedule' };
  // Vietnamese "Nop tu dong" with diacritics, built from code points so this file stays ASCII.
  const VIETNAMESE = `N${String.fromCodePoint(0x1ed9)}p t${String.fromCodePoint(0x1ef1)} ${String.fromCodePoint(0x111)}${String.fromCodePoint(0x1ed9)}ng`;

  it('is "Submitted" for a manual submission, whatever the note setting', () => {
    expect(signOffStatusText('manual', NOTE_OFF)).toBe('Submitted');
    expect(signOffStatusText('manual', NOTE_ON)).toBe('Submitted');
  });

  it('is "Submitted" for an automatic submission whose note line is off', () => {
    expect(signOffStatusText('automatic', NOTE_OFF)).toBe('Submitted');
    expect(signOffStatusText('automatic', { enabled: false, text: 'x' })).toBe('Submitted');
  });

  it('is the note text for an automatic submission whose note line is on', () => {
    expect(signOffStatusText('automatic', NOTE_ON)).toBe('Submitted by the weekly schedule');
    expect(signOffStatusText('automatic', { enabled: true, text: VIETNAMESE })).toBe(VIETNAMESE);
  });

  it('never states a false sign-off or an origin when no note is shown', () => {
    for (const origin of ['manual', 'automatic'] as const) {
      expect(signOffStatusText(origin, NOTE_OFF)).not.toMatch(/signed|automatic|pending|review/i);
    }
  });

  it('renders into the default subject without revealing the origin', () => {
    const subject = renderSubject(DEFAULT_SUBJECT_TEMPLATE, { ...VALUES, SignOffStatus: signOffStatusText('automatic', NOTE_OFF) });
    expect(subject).toBe('Timesheet 2026-09-14 to 2026-09-27 - Example Employee - Submitted');
    const withNote = renderSubject(DEFAULT_SUBJECT_TEMPLATE, { ...VALUES, SignOffStatus: signOffStatusText('automatic', NOTE_ON) });
    expect(withNote).toBe('Timesheet 2026-09-14 to 2026-09-27 - Example Employee - Submitted by the weekly schedule');
  });
});
