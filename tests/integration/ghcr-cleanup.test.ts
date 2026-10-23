import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DAY_MS,
  DEFAULTS,
  assertSafe,
  parseVersions,
  run,
  selectVersions,
  taggedCommits,
  type Decision,
  type Deps,
  type Options,
  type Version,
} from '../../scripts/ghcr-cleanup.ts';

// Synthetic data only: commit SHAs are made up, nothing here touches GitHub.
const NOW = Date.parse('2026-11-01T00:00:00Z');
const sha = (n: number): string => n.toString(16).padStart(40, '0');
const OPTIONS: Options = { keepNewest: 10, keepDays: 7 };

function version(n: number, ageDays: number, tags: string[] = [sha(n)]): Version {
  const createdAt = NOW - ageDays * DAY_MS;
  return { id: n, digest: `sha256:${sha(n + 1000)}`, created: new Date(createdAt).toISOString(), createdAt, tags };
}

// 40 commit-tagged versions, one per day, version 1 the oldest.
const history = (): Version[] => Array.from({ length: 40 }, (_unused, i) => version(i + 1, 40 - i));
const deletedIds = (versions: Version[], tagged: string[] = [], options: Options = OPTIONS): number[] =>
  selectVersions(versions, new Set(tagged), options, NOW)
    .filter((decision) => decision.action === 'delete')
    .map((decision) => decision.version.id);

describe('selectVersions', () => {
  it('deletes only old versions: not among the newest and older than the age limit', () => {
    // Version n is 41 - n days old; ranks 1-10 are versions 31-40 and everything up to 7 days old is versions 34-40.
    expect(deletedIds(history())).toEqual(Array.from({ length: 30 }, (_unused, i) => 30 - i));
  });

  it('the shipped defaults are 20 versions and 30 days, and satisfy the floors', () => {
    expect(DEFAULTS).toEqual({ keepNewest: 20, keepDays: 30 });
    expect(() => selectVersions(history(), new Set(), DEFAULTS, NOW)).not.toThrow();
    // Version n is 41 - n days old: older than 30 days is n <= 10, and ranks 1-20 are versions 21-40.
    expect(deletedIds(history(), [], DEFAULTS)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('keeps a version whose commit has a git tag, even when it is old and was published before the tag existed', () => {
    const versions = history();
    expect(deletedIds(versions, [sha(1)])).not.toContain(1);
    expect(deletedIds(versions)).toContain(1);
  });

  it('keeps a version with a tag that is not a lowercase commit SHA, also when a commit tag is present too', () => {
    for (const extra of ['v1.0.0', 'latest', 'keep-nas', 'A'.repeat(40), sha(1).slice(0, 39)]) {
      expect(deletedIds([...history().slice(1), version(1, 40, [sha(1), extra])])).not.toContain(1);
    }
  });

  it('keeps an untagged version', () => {
    expect(deletedIds([...history().slice(1), version(1, 400, [])])).not.toContain(1);
  });

  it('applies the age and the rank limits together, boundaries included', () => {
    const versions = [...history()];
    // version 31 is rank 10 (kept, newest); version 30 is rank 11 and 11 days old (kept: exactly keepDays old).
    expect(deletedIds(versions, [], { keepNewest: 10, keepDays: 11 })).toContain(29);
    expect(deletedIds(versions, [], { keepNewest: 10, keepDays: 11 })).not.toContain(30);
    expect(deletedIds(versions, [], { keepNewest: 10, keepDays: 11 })).not.toContain(31);
  });

  it('refuses options below the floor', () => {
    for (const bad of [
      { keepNewest: 9, keepDays: 7 },
      { keepNewest: 0, keepDays: 7 },
      { keepNewest: 10, keepDays: 6 },
      { keepNewest: 10, keepDays: 0 },
      { keepNewest: 10.5, keepDays: 7 },
      { keepNewest: Number.NaN, keepDays: 7 },
      { keepNewest: 10, keepDays: Number.NaN },
    ]) {
      expect(() => selectVersions(history(), new Set(), bad, NOW)).toThrow();
    }
  });

  it('never deletes the newest versions and never deletes everything', () => {
    expect(deletedIds(history().slice(30))).toEqual([]);
    expect(deletedIds([version(1, 900)])).toEqual([]);
    const manyOld = Array.from({ length: 12 }, (_unused, i) => version(i + 1, 900 - i));
    expect(deletedIds(manyOld)).toEqual([2, 1]);
  });

  it('has no per-run cap: every eligible version is planned, the oldest last in the plan', () => {
    const versions = Array.from({ length: 200 }, (_unused, i) => version(i + 1, 200 - i));
    // Version n is 201 - n days old; ranks 1-10 are versions 191-200 and 7 days or younger is 194-200.
    const ids = deletedIds(versions);
    expect(ids).toHaveLength(190);
    expect(ids[0]).toBe(190);
    expect(ids.at(-1)).toBe(1);
  });

  it('refuses a version dated in the future', () => {
    expect(() => selectVersions([...history(), version(99, -3)], new Set(), OPTIONS, NOW)).toThrow();
  });

  // selectVersions cannot produce these decision lists (its floors keep the newest versions), so the
  // second, independent check is reached directly with crafted lists.
  it('assertSafe refuses a list in which every version is marked for deletion', () => {
    const everything: Decision[] = Array.from({ length: 12 }, (_unused, i) => ({
      version: version(i + 1, 900 - i),
      action: 'delete',
      reason: 'crafted',
    }));
    // Rank 0 is below keepNewest 0 only when the floor is bypassed, so this reaches the final check, not the rank check.
    expect(() => assertSafe(everything, new Set(), { keepNewest: 0, keepDays: 7 })).toThrow(
      'internal error: every version would be deleted',
    );
    expect(() => assertSafe(everything.slice(0, 1), new Set(), { keepNewest: 0, keepDays: 7 })).toThrow(
      'internal error: every version would be deleted',
    );
  });

  it('assertSafe accepts a list that keeps at least one version', () => {
    const decisions: Decision[] = [
      { version: version(2, 1), action: 'keep', reason: 'crafted' },
      { version: version(1, 900), action: 'delete', reason: 'crafted' },
    ];
    expect(() => assertSafe(decisions, new Set(), { keepNewest: 1, keepDays: 7 })).not.toThrow();
  });

  it('assertSafe refuses a deletion that breaks a protection rule, each rule on its own', () => {
    const keepFirst: Decision = { version: version(100, 1), action: 'keep', reason: 'crafted' };
    const cases: Array<{ name: string; target: Version; tagged: string[]; options: Options }> = [
      { name: 'untagged', target: version(1, 900, []), tagged: [], options: { keepNewest: 1, keepDays: 7 } },
      { name: 'a non-SHA tag', target: version(1, 900, ['v1.0.0']), tagged: [], options: { keepNewest: 1, keepDays: 7 } },
      { name: 'a git-tagged commit', target: version(1, 900), tagged: [sha(1)], options: { keepNewest: 1, keepDays: 7 } },
      { name: 'a rank among the newest', target: version(1, 900), tagged: [], options: { keepNewest: 2, keepDays: 7 } },
    ];
    for (const { name, target, tagged, options } of cases) {
      const decisions: Decision[] = [keepFirst, { version: target, action: 'delete', reason: 'crafted' }];
      expect(() => assertSafe(decisions, new Set(tagged), options), name).toThrow('internal error: version 1 must not be deleted');
    }
  });

  it('never deletes a protected version over many generated histories', () => {
    let seed = 12345;
    const next = (): number => {
      seed = (seed * 48271) % 2147483647;
      return seed;
    };
    for (let round = 0; round < 200; round += 1) {
      const count = 1 + (next() % 80);
      const versions: Version[] = [];
      const tagged: string[] = [];
      for (let i = 1; i <= count; i += 1) {
        const kind = next() % 6;
        const tags = kind === 0 ? [] : kind === 1 ? [`v${i}`] : kind === 2 ? [sha(i), 'keep-x'] : [sha(i)];
        versions.push(version(i, next() % 120, tags));
        if (kind === 3) tagged.push(sha(i));
      }
      const options: Options = { keepNewest: 10 + (next() % 10), keepDays: 7 + (next() % 30) };
      const ordered = [...versions].sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
      const deleted = selectVersions(versions, new Set(tagged), options, NOW).filter((decision) => decision.action === 'delete');
      expect(deleted.length).toBeLessThan(versions.length);
      for (const { version: v } of deleted) {
        expect(v.tags).toHaveLength(1);
        expect(tagged).not.toContain(v.tags[0]);
        expect(v.tags[0]).toBe(sha(v.id));
        expect(ordered.indexOf(v)).toBeGreaterThanOrEqual(options.keepNewest);
        expect(NOW - v.createdAt).toBeGreaterThan(options.keepDays * DAY_MS);
      }
    }
  });
});

describe('taggedCommits', () => {
  it('reads lightweight and annotated tags and returns the commit, not the tag object', () => {
    const text = [`${sha(1)}\trefs/tags/v1.0.0`, `${sha(2)}\trefs/tags/v1.1.0`, `${sha(3)}\trefs/tags/v1.1.0^{}`, ''].join('\n');
    expect([...taggedCommits(text)].sort()).toEqual([sha(1), sha(3)]);
  });

  it('accepts an empty list and Windows line ends', () => {
    expect(taggedCommits('').size).toBe(0);
    expect([...taggedCommits(`${sha(1)}\trefs/tags/a\r\n`)]).toEqual([sha(1)]);
  });

  it('fails closed on a line it does not understand', () => {
    expect(() => taggedCommits('fatal: unable to access\n')).toThrow();
    expect(() => taggedCommits(`${sha(1)}\trefs/heads/main\n`)).toThrow();
    expect(() => taggedCommits(`${sha(1)}\trefs/tags/a^{}\n`)).toThrow();
  });
});

describe('parseVersions', () => {
  const entry = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
    id: 7,
    name: 'sha256:abc',
    created_at: '2026-10-01T00:00:00Z',
    metadata: { package_type: 'container', container: { tags: [sha(7)] } },
    ...extra,
  });

  it('reads the documented shape and ignores a repeated id', () => {
    expect(parseVersions([entry(), entry()])).toHaveLength(1);
  });

  it('fails closed on anything else', () => {
    for (const bad of [
      {},
      [null],
      [entry({ id: '7' })],
      [entry({ created_at: 'yesterday' })],
      [entry({ metadata: { package_type: 'npm' } })],
      [entry({ metadata: { package_type: 'container' } })],
      [entry({ metadata: { package_type: 'container', container: { tags: [1] } } })],
    ]) {
      expect(() => parseVersions(bad)).toThrow();
    }
  });
});

// ---------------------------------------------------------------- run() against a fake GitHub

interface Call {
  method: string;
  url: string;
}

function fake(versions: Version[], init: { tagsAfterListing?: Record<number, string[]>; failDeleteOf?: number } = {}) {
  const calls: Call[] = [];
  const out: string[] = [];
  const asEntry = (v: Version, tags = v.tags): Record<string, unknown> => ({
    id: v.id,
    name: v.digest,
    created_at: v.created,
    metadata: { package_type: 'container', container: { tags } },
  });
  const fetchImpl = (input: string | URL | Request, request?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = request?.method ?? 'GET';
    calls.push({ method, url });
    const path = new URL(url).pathname;
    const page = new URL(url).searchParams.get('page');
    const one = /\/versions\/(\d+)$/.exec(path);
    if (method === 'GET' && one === null) {
      const from = (Number(page) - 1) * 100;
      return Promise.resolve(Response.json(versions.slice(from, from + 100).map((v) => asEntry(v))));
    }
    const id = Number(one?.[1]);
    const found = versions.find((v) => v.id === id);
    if (method === 'GET') return Promise.resolve(Response.json(found === undefined ? {} : asEntry(found, init.tagsAfterListing?.[id])));
    return Promise.resolve(new Response(null, { status: id === init.failDeleteOf ? 403 : 204 }));
  };
  const deps: Deps = {
    fetch: fetchImpl as typeof fetch,
    readText: () => '',
    out: (line) => out.push(line),
    appendSummary: () => undefined,
    nowMs: () => NOW,
  };
  return { calls, out, deps };
}

const ARGS = ['--owner', 'CDSemi', '--tags-file', 'tags', '--keep-newest', '10', '--keep-days', '7'];
const ENV = { GITHUB_TOKEN: 'synthetic-token' };
const writes = (calls: Call[]): Call[] => calls.filter((call) => call.method !== 'GET');

describe('run', () => {
  it('a dry run lists across pages and writes nothing', async () => {
    const versions = Array.from({ length: 130 }, (_unused, i) => version(i + 1, 130 - i));
    const { calls, out, deps } = fake(versions);
    expect(await run(ARGS, ENV, deps)).toBe(0);
    expect(calls.filter((call) => call.method === 'GET')).toHaveLength(2);
    expect(writes(calls)).toHaveLength(0);
    expect(out.some((line) => line.startsWith('DELETE '))).toBe(true);
    expect(out.some((line) => line.startsWith('DELETED'))).toBe(false);
  });

  it('--apply deletes exactly the planned versions through the org endpoint, oldest first', async () => {
    const versions = Array.from({ length: 30 }, (_unused, i) => version(i + 1, 30 - i));
    const { calls, deps } = fake(versions);
    expect(await run([...ARGS, '--apply'], ENV, deps)).toBe(0);
    // Version n is 31 - n days old: versions 1-20 are outside the newest ten and older than seven days.
    const removed = writes(calls).map((call) => call.url);
    expect(removed).toHaveLength(20);
    expect(removed[0]).toBe('https://api.github.com/orgs/CDSemi/packages/container/timesheet/versions/1');
    expect(removed.at(-1)).toBe('https://api.github.com/orgs/CDSemi/packages/container/timesheet/versions/20');
    expect(writes(calls).every((call) => call.method === 'DELETE')).toBe(true);
  });

  it('keeps a version whose tags changed after the listing', async () => {
    const versions = Array.from({ length: 30 }, (_unused, i) => version(i + 1, 30 - i));
    const { calls, deps } = fake(versions, { tagsAfterListing: { 13: [sha(13), 'keep-me'] } });
    await run([...ARGS, '--apply'], ENV, deps);
    expect(writes(calls).map((call) => call.url)).not.toContain('https://api.github.com/orgs/CDSemi/packages/container/timesheet/versions/13');
    expect(writes(calls)).toHaveLength(19);
  });

  it('stops at the first refused delete', async () => {
    const versions = Array.from({ length: 30 }, (_unused, i) => version(i + 1, 30 - i));
    const { calls, deps } = fake(versions, { failDeleteOf: 12 });
    await expect(run([...ARGS, '--apply'], ENV, deps)).rejects.toThrow();
    // Oldest first: versions 1 to 12 were attempted, 13 and later never.
    expect(writes(calls)).toHaveLength(12);
  });

  it('fails closed on missing token, missing tags file, a combined offline apply and an empty package', async () => {
    const { deps } = fake([version(1, 1)]);
    await expect(run(ARGS, {}, deps)).rejects.toThrow();
    await expect(run(['--owner', 'CDSemi'], ENV, deps)).rejects.toThrow();
    await expect(run([...ARGS, '--apply', '--versions-file', 'v'], ENV, deps)).rejects.toThrow();
    await expect(run(ARGS, ENV, fake([]).deps)).rejects.toThrow();
    await expect(run([...ARGS, '--keep-newest', '3'], ENV, deps)).rejects.toThrow();
  });

  it('knows no deletion cap option', async () => {
    const { deps } = fake([version(1, 1)]);
    await expect(run([...ARGS, '--max-delete', '5'], ENV, deps)).rejects.toThrow();
  });

  it('plans offline from saved files with a fixed clock', async () => {
    const saved = Array.from({ length: 30 }, (_unused, i) => ({
      id: i + 1,
      name: `sha256:${sha(i + 1000)}`,
      created_at: new Date(NOW - (30 - i) * DAY_MS).toISOString(),
      metadata: { package_type: 'container', container: { tags: [sha(i + 1)] } },
    }));
    const { deps, calls, out } = fake([]);
    const files: Record<string, string> = { tags: `${sha(1)}\trefs/tags/v1\n`, v: JSON.stringify(saved) };
    const offline: Deps = { ...deps, readText: (path) => files[path] ?? '' };
    const args = ['--owner', 'CDSemi', '--tags-file', 'tags', '--versions-file', 'v', '--keep-newest', '10', '--keep-days', '7'];
    expect(await run([...args, '--now', new Date(NOW).toISOString()], {}, offline)).toBe(0);
    expect(calls).toHaveLength(0);
    // Versions 1-20 are old; version 1 is kept because its commit has a git tag.
    expect(out.filter((line) => line.startsWith('DELETE '))).toHaveLength(19);
    expect(out.some((line) => line.startsWith('KEEP') && line.includes('id=1 ') && line.includes('release'))).toBe(true);
  });
});

// ---------------------------------------------------------------- the saved fixtures (synthetic, 40 versions)

describe('saved fixtures', () => {
  const folder = fileURLToPath(new URL('./fixtures/ghcr-cleanup/', import.meta.url));
  const plan = async (extra: string[]): Promise<{ code: number; keep: string[]; remove: string[]; line: string }> => {
    const out: string[] = [];
    const deps: Deps = {
      fetch: (() => Promise.reject(new Error('no network in an offline plan'))) as typeof fetch,
      readText: (path) => readFileSync(path, 'utf8'),
      out: (line) => out.push(line),
      appendSummary: () => undefined,
      nowMs: () => NOW,
    };
    const args = ['--owner', 'CDSemi', '--tags-file', `${folder}tags.txt`, '--versions-file', `${folder}versions.json`, '--now', '2026-11-01T00:00:00Z', ...extra];
    const code = await run(args, {}, deps);
    return {
      code,
      keep: out.filter((line) => line.startsWith('KEEP')),
      remove: out.filter((line) => line.startsWith('DELETE')),
      line: out.find((line) => line.startsWith('plan:')) ?? '',
    };
  };

  it('with the defaults keeps 35 and plans 5: only old versions with a lone commit tag and no git tag', async () => {
    const result = await plan([]);
    expect(result.code).toBe(0);
    expect(result.keep).toHaveLength(35);
    expect(result.remove.map((line) => /id=(\d+)/.exec(line)?.[1])).toEqual(['1010', '1009', '1008', '1004', '1001']);
    // 1002 and 1003 are tagged commits (lightweight and annotated), 1005 has keep-nas, 1006 is untagged, 1007 has v1.0.0.
    for (const protectedId of ['1002', '1003', '1005', '1006', '1007']) {
      expect(result.keep.some((line) => line.includes(`id=${protectedId} `))).toBe(true);
    }
    expect(result.line).toBe('plan: keep 35, delete 5 (dry run: nothing is deleted)');
  });

  it('with the floor options keeps 15 and plans 25', async () => {
    const result = await plan(['--keep-newest', '10', '--keep-days', '7']);
    expect(result.keep).toHaveLength(15);
    expect(result.remove).toHaveLength(25);
    expect(result.line).toBe('plan: keep 15, delete 25 (dry run: nothing is deleted)');
  });

  it('refuses an option below the floor', async () => {
    await expect(plan(['--keep-newest', '9'])).rejects.toThrow();
    await expect(plan(['--keep-days', '6'])).rejects.toThrow();
  });
});
