import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { csvCell, evidenceFilename, neutralizeCsvText } from '../../src/server/services/otEvidence.ts';
import { postCorrection, postCredit } from '../../src/server/services/ledger.ts';
import { createTestContext, DEFAULT_BREAKS_0900, la, type TestContext } from '../support/testApp.ts';

/*
 * OT evidence export (docs/05:56, FR-14, AC-01): owner-only, no-store, sanitized
 * filename, and spreadsheet formula injection neutralized. Synthetic data only.
 */

let t: TestContext;
let employee: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-10-02T18:00:00Z');
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

interface Section {
  header: string[];
  rows: Array<Record<string, string>>;
}

/** Minimal RFC 4180 reader for the sectioned export (`#section,<name>`, header row, rows, blank line). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i] ?? '';
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function sections(text: string): Record<string, Section> {
  const result: Record<string, Section> = {};
  const rows = parseCsv(text);
  let i = 0;
  while (i < rows.length) {
    const marker = rows[i];
    if (marker?.[0] !== '#section') {
      i += 1;
      continue;
    }
    const name = marker[1] ?? '';
    const header = rows[i + 1] ?? [];
    const body: Array<Record<string, string>> = [];
    i += 2;
    while (i < rows.length && !(rows[i]?.length === 1 && rows[i]?.[0] === '')) {
      const values = rows[i] ?? [];
      body.push(Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
      i += 1;
    }
    result[name] = { header, rows: body };
  }
  return result;
}

async function getCsv(cookie: string | undefined, query = 'from=2026-09-21&to=2026-10-09') {
  return t.request('GET', `/api/ot/evidence.csv?${query}`, cookie === undefined ? {} : { cookie });
}

describe('CSV cell neutralization', () => {
  it.each([
    ['=1+1', "'=1+1"],
    ['+1', "'+1"],
    ['-1', "'-1"],
    ['@SUM(A1)', "'@SUM(A1)"],
    ['\t=1', "'\t=1"],
    ['\r=1', "'\r=1"],
    ['\n=1', "'\n=1"],
    [' =1+1', "' =1+1"],
    ['  +1', "'  +1"],
    [' \t-1', "' \t-1"],
    [' @SUM(A1)', "' @SUM(A1)"],
    ['plain', 'plain'],
    [' plain', ' plain'],
    ['a=b', 'a=b'],
    ['a =b', 'a =b'],
    ['', ''],
    ['2026-09-21T16:00:00Z', '2026-09-21T16:00:00Z'],
  ])('neutralizeCsvText(%j) -> %j', (input, expected) => {
    expect(neutralizeCsvText(input)).toBe(expected);
  });

  it('quotes cells with separators, quotes and line breaks after neutralizing', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=HYPERLINK("http://example.invalid","x")')).toBe(`"'=HYPERLINK(""http://example.invalid"",""x"")"`);
    expect(csvCell('\r=1')).toBe('"\'\r=1"');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('keeps numbers, booleans and null literal because only text can carry a formula', () => {
    expect(csvCell(-480)).toBe('-480');
    expect(csvCell(90)).toBe('90');
    expect(csvCell(true)).toBe('true');
    expect(csvCell(false)).toBe('false');
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
  });

  it('builds a filename from a fixed alphabet only', () => {
    expect(evidenceFilename('2026-09-21', '2026-10-09')).toBe('ot-evidence_2026-09-21_2026-10-09.csv');
    const hostile = evidenceFilename('2026-09-21"\r\nX-Evil: 1', '../../etc/passwd;x');
    expect(hostile).toMatch(/^[A-Za-z0-9._-]+\.csv$/);
    expect(hostile).not.toMatch(/[\r\n"/\\;:\s]/);
  });
});

describe('GET /api/ot/evidence.csv', () => {
  async function seedEvidence() {
    const ctx = { db: t.db, clock: t.clock };
    // Complete day with three breaks and one with no breaks (R 556, E 76, C 90).
    const sixHours = {
      input_zone: 'America/Los_Angeles',
      breaks: DEFAULT_BREAKS_0900.map((item) => ({
        start: { ...item.start, local: item.start.local.replace('2026-09-21', '2026-09-22') },
        end: { ...item.end, local: item.end.local.replace('2026-09-21', '2026-09-22') },
        counts_as_work: item.counts_as_work,
      })),
      breaks_confirmed: true,
    };
    const day1 = await t.request('POST', '/api/days/2026-09-22/sessions', {
      cookie: employee,
      body: { ...sixHours, start: la('2026-09-22T09:00'), end: la('2026-09-22T18:00') },
    });
    expect(day1.status).toBe(201);
    const day2 = await t.request('POST', '/api/days/2026-09-29/sessions', {
      cookie: employee,
      body: { start: la('2026-09-29T09:00'), end: la('2026-09-29T18:16'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(day2.status).toBe(201);
    // A policy version with a hostile note, including a leading tab and a leading CR.
    const policyBody = {
      effective_from: '2026-10-05',
      required_minutes: 480,
      threshold_minutes: 0,
      rounding_step_minutes: 15,
      reference_start: '08:00',
      reference_end: '16:15',
      breaks: [{ start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false }],
      deficit_mode: 'ignore',
    };
    const policyTab = await t.request('POST', '/api/policies', { cookie: employee, body: { ...policyBody, note: '\t=cmd|calc' } });
    expect(policyTab.status).toBe(201);
    const credited = postCredit(ctx, {
      userId: t.userIds.employee,
      sourceKey: 'finalize:2026-09-29',
      minutes: 90,
      workDate: '2026-09-29',
      actorUserId: null,
      origin: 'system',
      reason: '=1+1',
    });
    postCorrection(ctx, {
      userId: t.userIds.employee,
      sourceKey: 'correction:2026-09-29',
      originalEntryId: credited.entry.id,
      correctedMinutes: 120,
      actorUserId: t.userIds.employee,
      origin: 'manual',
      reason: '@Synthetic recount',
    });
    const leave = await t.request('POST', '/api/ot/leave', {
      cookie: employee,
      body: {
        request_key: 'evidence-leave',
        leave_date: '2026-10-01',
        requested_minutes: 60,
        note: '-2+3',
        permission: {
          approver_name: '=HYPERLINK("http://example.invalid","x")',
          approver_identity: '+manager@example.invalid',
          approval_date: '2026-09-30',
          evidence_ref: '@SUM(1,1)',
        },
      },
    });
    expect(leave.status).toBe(201);
    return { policyId: policyTab.body.policy.id as string, sessionIds: [day1.body.session.id, day2.body.session.id] };
  }

  it('sets private, no-store, attachment headers with a sanitized filename', async () => {
    const response = await getCsv(employee);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/^text\/csv/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="ot-evidence_2026-09-21_2026-10-09.csv"');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(typeof response.body).toBe('string');
    // LF rows, one blank line between sections and a single final newline.
    const text = response.body as string;
    expect(text.endsWith('\n')).toBe(true);
    expect(text.endsWith('\n\n')).toBe(false);
    expect(text).not.toMatch(/\r|\n\n\n/);
    expect(text.startsWith('#section,export\n')).toBe(true);
  });

  it('exports raw intervals, breaks, policies, daily raw/eligible/credited, adjustments and leave permission', async () => {
    const { policyId, sessionIds } = await seedEvidence();
    const response = await getCsv(employee);
    expect(response.status).toBe(200);
    const parts = sections(response.body as string);
    expect(Object.keys(parts)).toEqual(['export', 'policy_versions', 'intervals', 'breaks', 'daily', 'ledger', 'leave_permissions']);

    expect(parts.export?.rows[0]).toMatchObject({ from: '2026-09-21', to: '2026-10-09', reporting_zone: 'America/Los_Angeles' });

    const intervals = parts.intervals?.rows ?? [];
    expect(intervals.map((row) => row.session_id)).toEqual(sessionIds);
    expect(intervals[0]).toMatchObject({ work_date: '2026-09-22', start_utc: '2026-09-22T16:00:00Z', end_utc: '2026-09-23T01:00:00Z', breaks_confirmed: 'true' });

    const breaks = parts.breaks?.rows ?? [];
    expect(breaks).toHaveLength(3);
    expect(breaks[0]).toMatchObject({ session_id: sessionIds[0], start_utc: '2026-09-22T18:00:00Z', end_utc: '2026-09-22T18:15:00Z', counts_as_work: 'false' });

    const policies = parts.policy_versions?.rows ?? [];
    expect(policies.map((row) => row.id)).toContain(policyId);
    expect(policies.find((row) => row.id === policyId)).toMatchObject({ effective_from: '2026-10-05', required_minutes: '480' });

    const daily = parts.daily?.rows ?? [];
    expect(daily).toHaveLength(19);
    const noBreakDay = daily.find((row) => row.work_date === '2026-09-29');
    expect(noBreakDay).toMatchObject({ calculation_status: 'complete', regular_minutes: '556', eligible_minutes: '76', credited_minutes: '90' });
    expect(daily.find((row) => row.work_date === '2026-09-23')).toMatchObject({ calculation_status: 'no_records', credited_minutes: '' });

    const ledger = parts.ledger?.rows ?? [];
    expect(ledger.map((row) => [row.entry_type, row.delta_minutes])).toEqual([
      ['credit', '90'],
      ['correction', '30'],
    ]);
    expect(ledger[1]).toMatchObject({ reason: "'@Synthetic recount", work_date: '2026-09-29' });

    const leave = parts.leave_permissions?.rows ?? [];
    expect(leave).toHaveLength(1);
    expect(leave[0]).toMatchObject({
      leave_date: '2026-10-01',
      approved_minutes: '60',
      approver_name: `'=HYPERLINK("http://example.invalid","x")`,
      approval_date: '2026-09-30',
      approval_origin: 'self_recorded',
    });
  });

  it('neutralizes every text cell that starts with = + - @, a tab or a CR', async () => {
    await seedEvidence();
    const response = await getCsv(employee);
    const raw = response.body as string;
    const parts = sections(raw);
    const hostile = [
      ['leave_permissions', 'approver_name', `'=HYPERLINK("http://example.invalid","x")`],
      ['leave_permissions', 'approver_identity', "'+manager@example.invalid"],
      ['leave_permissions', 'evidence_ref', "'@SUM(1,1)"],
      ['leave_permissions', 'note', "'-2+3"],
      ['ledger', 'reason', "'=1+1"],
    ] as const;
    for (const [name, column, expected] of hostile) {
      const values = (parts[name]?.rows ?? []).map((row) => row[column]);
      expect(values, `${name}.${column}`).toContain(expected);
    }
    const policyNote = (parts.policy_versions?.rows ?? []).map((row) => row.note).find((note) => note?.includes('cmd|calc'));
    expect(policyNote).toBe("'\t=cmd|calc");

    // Global check: after parsing, no text cell begins with a formula trigger. Signed integers are
    // numeric ledger deltas, allowed only in the delta_minutes column.
    for (const [name, part] of Object.entries(parts)) {
      for (const row of part.rows) {
        for (const [column, value] of Object.entries(row)) {
          if (name === 'ledger' && column === 'delta_minutes' && /^-?\d+$/.test(value)) continue;
          expect(value, `${name}.${column}`).not.toMatch(/^[=+\-@\t\r\n]/);
        }
      }
    }
  });

  it('validates the date range and rejects header injection through the query', async () => {
    for (const query of [
      '',
      'from=2026-09-21',
      'to=2026-10-09',
      'from=2026-10-09&to=2026-09-21',
      'from=2025-01-01&to=2026-10-09',
      'from=not-a-date&to=2026-10-09',
      'from=2026-09-21%22%0D%0AX-Evil%3A%201&to=2026-10-09',
    ]) {
      const response = await getCsv(employee, query);
      expect(response.status, query).toBe(422);
      expect(response.headers.get('content-disposition'), query).toBeNull();
      expect(response.headers.get('x-evil'), query).toBeNull();
    }
  });

  it('is owner-only: other users’ data never appears, admin included, and a session is required', async () => {
    await seedEvidence();
    const anonymous = await getCsv(undefined);
    expect(anonymous.status).toBe(401);
    expect(anonymous.headers.get('content-disposition')).toBeNull();

    const adminExport = await getCsv(admin, `from=2026-09-21&to=2026-10-09&user_id=${t.userIds.employee}`);
    expect(adminExport.status).toBe(200);
    const text = adminExport.body as string;
    for (const secret of ['Synthetic recount', 'example.invalid', 'evidence-leave', 'cmd|calc']) {
      expect(text, secret).not.toContain(secret);
    }
    const parts = sections(text);
    expect(parts.intervals?.rows).toEqual([]);
    expect(parts.breaks?.rows).toEqual([]);
    expect(parts.ledger?.rows).toEqual([]);
    expect(parts.leave_permissions?.rows).toEqual([]);
    expect(text).not.toContain(t.userIds.employee);

    // And the employee never sees admin rows.
    const adminSession = await t.request('POST', '/api/days/2026-09-23/sessions', {
      cookie: admin,
      body: { start: la('2026-09-23T09:00'), end: la('2026-09-23T10:00'), input_zone: 'America/Los_Angeles', breaks: [], breaks_confirmed: true },
    });
    expect(adminSession.status).toBe(201);
    const employeeExport = await getCsv(employee);
    expect(employeeExport.body as string).not.toContain(adminSession.body.session.id);
  });

  it('red-first: labels the opening balance and its correction with the as-of date and evidence reference (F-3)', async () => {
    const posted = await t.request('POST', '/api/ot/opening-balance', {
      cookie: employee,
      body: { minutes: -120, as_of_date: '2026-08-30', reason: 'Synthetic carried-in balance', evidence_ref: '=Synthetic letter 0001', expected_version: 0 },
    });
    expect(posted.status, JSON.stringify(posted.body)).toBe(201);
    const corrected = await t.request('PUT', '/api/ot/opening-balance', {
      cookie: employee,
      body: { minutes: 60, reason: 'Synthetic recount', evidence_ref: 'Synthetic letter 0002', expected_version: 1 },
    });
    expect(corrected.status, JSON.stringify(corrected.body)).toBe(201);
    postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'synthetic-credit', minutes: 90, workDate: '2026-09-29', actorUserId: null, origin: 'system' },
    );
    const response = await getCsv(employee);
    expect(response.status).toBe(200);
    const ledger = sections(response.body as string).ledger;
    expect(ledger?.header).toEqual(expect.arrayContaining(['entry_type', 'entry_label', 'as_of_date', 'evidence_ref']));
    // The opening balance has no work date: it is always part of the export, whatever the range.
    expect(ledger?.rows.map((row) => [row.entry_type, row.entry_label, row.delta_minutes, row.as_of_date, row.evidence_ref])).toEqual([
      ['opening_balance', 'Opening balance', '-120', '2026-08-30', "'=Synthetic letter 0001"],
      ['correction', 'Opening balance correction', '180', '', 'Synthetic letter 0002'],
      ['credit', 'OT credit', '90', '', ''],
    ]);
    expect(ledger?.rows[0]).toMatchObject({ work_date: '', reason: 'Synthetic carried-in balance' });
  });

  it('does not write or post anything while exporting', async () => {
    await seedEvidence();
    const counts = () => ({
      ledger: t.db.prepare('SELECT count(*) FROM ot_ledger').pluck().get(),
      audit: t.db.prepare('SELECT count(*) FROM audit_events').pluck().get(),
      sessions: t.db.prepare('SELECT count(*) FROM work_sessions').pluck().get(),
      periods: t.db.prepare('SELECT count(*) FROM pay_periods').pluck().get(),
    });
    const before = counts();
    await getCsv(employee);
    await getCsv(employee, 'from=2026-01-01&to=2026-12-31');
    expect(counts()).toEqual(before);
  });
});
