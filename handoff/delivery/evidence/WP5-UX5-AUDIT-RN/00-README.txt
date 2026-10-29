WP5-UX5-AUDIT-RN attempt 1 evidence index (masked LF text; <task> = D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-RN)

Target dc487c6114dd488121b1de1444e11cdacf5c237b (WP5-UX5-RELNOTES-FREEZE; HEAD = origin/main before and after). Previous 0b457817.
Digest 2072e3f206ff2003a9c7563b23267da463eeae6373f3f4eb98e660137fefb99b, 882 files, before (17:48:53Z) and after (18:02:36Z), in the
ls-tree form, npm run digest in the repository and the export form; npm run digest also in a clean clone. Decision: FIX REQUIRED
(F-UX5RN-1, Low). Node v24.21.0 (portable), Git Bash, workflow Python (-I). No port was opened (no server run). Nothing left running.
Scratch in <task>: export-target, export-prev (0b45781), export-r11 (1fe5ad3), export-samples (target, npm ci and build:server),
export-digest-before and export-digest-after (pristine), clone, samples-run (run, out).

Files
  01-*            HEAD and digest forms before and after; npm run digest in a clean clone
  02-builds.txt   npm ci and npm run build of dc487c6, 0b45781 and 1fe5ad3
  03-core.txt     typecheck, lint, build, npm test (101 files, 2397 tests) in the target export, exits
  10-, 11-        board extracts (read-only): round gates and audits; gate and audit list WP1 to WP5; owner question Q0
  20-, 21-        name-status 0b45781..dc487c6 outside handoff/; the diff of the four documents
  30-doccheck.txt links and EN/VI parity of the four documents (doccheck.py)
  31-stale-status.txt  stale status statements outside handoff/ (DEVELOPMENT.md:3 and .vi.md:3, F-UX5RN-1)
  32-consistency-grep.txt  docs 04, 05, 06, 09, 10, 11 and DEVELOPMENT; target digest and SHAs in the documents
  40-script-diffs.txt  T06 vs REGATE15 sample scripts; the auditor's copies byte-equal to REGATE15's
  41-samples-run.txt   the auditor's own sample run from the target (exits, make-samples output, sample index)
  42-samples-compare-three.txt  T06 / REGATE15 / own comparison (compare_samples.py)
  43-privacy-scan.txt  addresses, profile paths, leave and holiday words, ready check (REGATE15 and T06)
  44-render-path-commits.txt  commits and diffs on render paths 69d6340..dc487c6
  45-notices-grep.txt  notice headers and links, MIME parts, Bcc count (REGATE15 samples)
  50-dist-compare.txt  dist/ 0b45781 vs dc487c6 (250 files, identical)
  51-, 52-        dist/server and dist/domain 1fe5ad3 vs dc487c6 (identical); all of dist/ (only dist/client differs)
  53-carry-forward-paths.txt  paths changed 1fe5ad3..0b45781 and drill-relevant paths 1fe5ad3..dc487c6 (none)
  54-drill-client-check.txt  the drill's client checks, the vite sourcemap switch and the Docker build stage
  55-regate11-drill-summary.txt  REGATE11's drill summary (209 PASS, 0 FAIL) and later evidence mentioning the drill
  60-leftover-check.txt  no node, npm or Edge process of this task left
  61-privacy-scan-result.txt  the line rules of scripts/precommit-check.mjs (ported) over this folder, the review pair and the brief: 0
  62-preflight.txt  validate_package.py --preflight after the review pair was written: PASS (141 pairs, 2412 local links)
  90-*.txt        the auditor's scripts
  99-slips.txt    rule slips

All files are LF with one final newline and no trailing whitespace (blank diff context lines in 21-doc-diff.txt lost their single space).

The six renders viewed are REGATE15's (handoff/delivery/evidence/WP5-UX5-REGATE15/samples/); no screenshot was added here.
