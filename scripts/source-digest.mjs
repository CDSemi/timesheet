#!/usr/bin/env node
// Platform-independent digest of the source files outside delivery/, used by handoffs and
// reviews to identify the verified source. For every file git lists (tracked, plus untracked
// non-ignored files before the first commit) it takes the blob ID git stores, after the
// .gitattributes line-ending normalization, so a Windows working tree with CRLF files and a
// Linux checkout give the same result. The digest is the SHA-256 of the sorted
// "<path> <blob>\n" lines; after a commit it equals
//   git ls-tree -r --format='%(path) %(objectname)' HEAD | grep -v '^delivery/' | LC_ALL=C sort | sha256sum
// Usage: node scripts/source-digest.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const listing = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  encoding: 'utf8',
});
const files = [...new Set(listing.split('\0'))]
  .filter((path) => path !== '' && !path.startsWith('delivery/'))
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const blobs = execFileSync('git', ['hash-object', '--stdin-paths'], {
  input: `${files.join('\n')}\n`,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
  .trim()
  .split('\n');
if (blobs.length !== files.length) throw new Error('git hash-object returned an unexpected number of blob IDs');
const lines = files.map((path, index) => `${path} ${blobs[index]}\n`).join('');
console.log(`${createHash('sha256').update(lines).digest('hex')}  (${files.length} files, delivery/ excluded)`);
