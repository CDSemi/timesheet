# WP3-T07-RECON dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T07-RECON; package WP3; kind
  diagnose; attempt 1; depends on WP3-T07 (WP3-T07-FREEZE attempt 1 stopped).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M (source identity before a freeze), novelty no. Records in English.
- Read AGENTS.md from disk first. Then read [WP3-T07](WP3-T07.md) (the worker result and
  its digest 971e7843469a9829e45fc608232daf56bbab64e66904809c7de52d800037b8aa) and
  [WP3-T07-FREEZE](WP3-T07-FREEZE.md) (attempt 1: the committer computed
  3f4a016d0834437005cb40566a06b7d030dd6ae2bc072f5629f74984a33b9da6 and stopped), with
  their evidence directories.
- Read-only for source: do not edit, stage, commit or delete any repository file.
  Writable: this report and handoff/delivery/evidence/WP3-T07-RECON/.

## Questions

1. Recompute the source digest twice with Node 24 (`scripts/source-digest.mjs`) and
   record both values. Is it stable?
2. Which paths outside handoff/ differ from HEAD b89f8a8122781b0e8c7cf1a0086089b96713b17b
   (`git status --porcelain`, untracked included)? Is that set exactly the T07 owned set
   (package.json, package-lock.json, src/server/pdf/timesheetPdf.ts, layout.ts, fonts.ts,
   tests/integration/pdf-render.test.ts, tests/support/pdfText.ts)?
3. Explain the mismatch with evidence: for example a file changed after the worker's
   digest (compare file modification times with the time of the worker's digest
   evidence), a file the digest includes that the worker's run did not (or the reverse),
   line endings, or a non-owned file. Report masked file names and times only; do not
   print file contents or diffs.
4. Does the current tree pass `npm run verify` with
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation` (record exit, test count and
   deprecation-line count)? Run it in place with Node 24 by full path; the B: scratch
   drive is nearly full, so point TEMP/TMP at a local folder outside Dropbox if needed and
   remove it afterwards.
5. Run the T07 test file alone and confirm it passes, and that the precommit check on a
   temporary index (not the real index) reports no finding in the T07 files.

## Output

Results here and masked, LF evidence in handoff/delivery/evidence/WP3-T07-RECON/. Never
write into the repository root; on Windows never redirect to /dev/null or nul from a POSIX
shell. Stop any background process you started.

Return at most 150 words, beginning with your self-reported model: the stable digest, the
changed-path set, the explanation, verify exit and test count, and whether the current
tree is safe to freeze with that digest.

## Results

(Verifier appends here.)

Verifier result (attempt 1, Node 24.21.0; evidence in evidence/WP3-T07-RECON/01-recon.txt):

1. Digest recomputed twice: 3f4a016d0834437005cb40566a06b7d030dd6ae2bc072f5629f74984a33b9da6 both times (637 files), and unchanged after all checks. Stable.
2. Changed paths outside handoff/ match the T07 owned set exactly (package.json, package-lock.json, fonts.ts, layout.ts, timesheetPdf.ts, pdf-render.test.ts, pdfText.ts); nothing else.
3. Mismatch cause: tests/integration/pdf-render.test.ts has mtime 07:49:10, after the worker's digest evidence (07:48:26) and verify log (07:48:38); it is the only file newer. The worker edited the test after digesting, so 971e7843... described an earlier tree. The worker's verify therefore predates the final test edit.
4. verify: exit 0, 40 files / 906 tests passed, smoke passed, 0 deprecation lines.
5. T07 test alone: exit 0, 28 passed. precommit-check on a temporary index: 35 files, 0 blocking, 0 warnings.
Conclusion: current tree passes; safe to freeze with 3f4a016d... (re-check the digest immediately before committing). Real index untouched; temp folder removed.
