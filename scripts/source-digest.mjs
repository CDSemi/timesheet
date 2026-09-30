#!/usr/bin/env node
// Platform-independent digest of the source files outside delivery/, used by handoffs and
// reviews to identify the verified source. It hashes each file listed by git (tracked, plus
// untracked non-ignored files before the first commit) and then the sorted
// "<sha256>  <path>\n" lines. Unlike piping `sha256sum` (Git Bash marks paths with `*`),
// the result is the same on every platform.
// Usage: node scripts/source-digest.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const listing = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  encoding: 'utf8',
});
const files = [...new Set(listing.split('\0'))]
  .filter((path) => path !== '' && !path.startsWith('delivery/'))
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const lines = files
  .map((path) => `${createHash('sha256').update(readFileSync(path)).digest('hex')}  ${path}\n`)
  .join('');
console.log(`${createHash('sha256').update(lines).digest('hex')}  (${files.length} files, delivery/ excluded)`);
