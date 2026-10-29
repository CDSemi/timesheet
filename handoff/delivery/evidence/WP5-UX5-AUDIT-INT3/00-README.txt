WP5-UX5-AUDIT-INT3 evidence (integration recheck after FIX19 on 0b457817ed29806a36fdd78cc22ac84a0cc2db9d)

Reviewer: claude-opus-5-5 (self-reported), board agent a89b2f7f5fa303382. Review: handoff/delivery/WP5_UX5_REVIEW_INT3.md (+ .vi.md).
Decision: PASS (F-UX5I2-1 and F-UX5I2-2 closed; no new finding; optional risks R-UX5I3-1..4, R-UX5I2-3 updated).
Task folder <task> = <task> (outside the repository). All files here are masked LF text written by
90-mask.mjs.txt (ANSI, CR, <user>, <task>, <repo>, <claude-tmp>, and any email address that is not a full synthetic @example.invalid one).
Node v24.21.0 (portable); npm 11.18.0. Scripts and probes: 90-*.txt (the task-folder copies ran; the evidence copies are masked).

Identity
- 00-head-before.txt (16:15:33Z), 00-head-after.txt: HEAD = origin/main = 0b45781 (pushed; origin/main contains it).
- 00-nonhandoff-status-*.txt: no status line outside handoff/ before or after.
- 01-author-models.txt: the actual_model values on the board, counted (claude-opus-5-5 the strongest).
- 01-digest-before.txt (16:16:38Z), 01-digest-after.txt: export form (clean git archive, git hash-object --no-filters), ls-tree form (target and
  HEAD), npm run digest in the repository and in a clean scratch clone (01-clone.txt): all 67aa715c...c42b, 882 files; 01-digest-npm-*.txt are
  the raw npm outputs.
- 20-*.txt: name-status, numstat and diffstat d96df5d..0b45781 (five FIX19 paths), the area check (no server, domain, components, styles,
  fixtures or package file; 0 lines), 8e55710..0b45781 (224 paths), 0b45781..HEAD (none).
- 22-fix19-src-scripts-diff.txt, 22-fix19-tests-diff.txt, 22-fix19-docs-diff.txt, 22-fix19-tests-numstat.txt: the FIX19 diff as read.
- 23-blame-stale-reload.txt, 23-blame-save-button.txt: the stale notice, reload() and the busy-disabled Save button come from WP2-T10.
- 40-probe-setup-exits.txt: npm ci and build in export-probe, export-mut (target) and export-prev-probe (d96df5d).
- 41-dist-compare.txt, 41-dist-client-normcmp.txt: dist of d96df5d vs the target: dist/server and dist/domain identical (232 files); dist/client
  differs in index.html, the entry chunk and five lazy chunk names (equal after name normalisation); package files identical.

Mandatory checks (clean export, 90-chain-main.sh.txt; progress 03-chain-main-progress.txt)
- 03-core-exits.txt, 03-ci.txt, 03-typecheck.txt, 03-lint.txt, 03-npmtest.txt (101 files, 2,397 tests), 03-build.txt, 03-summary.txt.
- 04-e2e-desktop.txt, 04-e2e-mobile.txt, 04-e2e-counts.txt: real-clock FULL 484/36/0 and 408/112/0 (90-run-shift.sh.txt, "real").
- 05-ac13-asia-kathmandu.txt, 05-ac13-summary.txt: AC-13 under Asia/Kathmandu (90-run-tz.mjs.txt, 90-tzprobe.mjs.txt), 1/1.
- 08-seven-1026.txt, 08-seven-counts.txt, 08-seven-crossing.txt: seven files at 2026-10-27T06:58:30Z, FIX10 wrapper, --workers=6: 400 passed,
  0 failed. 30-shiftclock-identity.txt: the wrapper's shiftclock.mjs equals handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt.
- 10-census-*.txt: inline read-only process samples (names, ids, CPU times only; 90-census.sh.txt, 90-census.mjs.txt, 90-cens.sh.txt).

Probes (sources 90-zz-int3-session.spec.ts.txt, 90-zz-int3-axe.spec.ts.txt, 90-zz-int3-admin.spec.ts.txt; AUDIT-INT2's
90-zz-int2-follow.spec.ts.txt used unchanged; runs 90-probe-run.sh.txt; progress 48-probe-run-progress.txt; counts 48-probe-counts.txt)
- 45-obs-int3-target.txt (+ 48-log-int3-target.txt): my 27 session-write cases on the target, all pass.
- 45-obs-int3-prev.txt (+ 48-log-int3-prev.txt): the same on d96df5d: 21 fail (the cases FIX19 changes), 6 pass.
- 44-obs-int2-follow-target.txt (+ 48-log-int2-target.txt): AUDIT-INT2's follow probe on the target, 19 pass, G1 and G2 "kept".
- 44-obs-int2-follow-prev-G.txt (+ 48-log-int2-prev-G.txt): AUDIT-INT2's G1 and G2 on d96df5d, "OVERWRITTEN".
- 46-obs-int3-admin-target.txt, 46-obs-int3-admin-prev.txt (+ 48-log-admin-*.txt): an administrator's holiday on a default-source day, then a
  delete in the editor (E3 typed, E4 nothing typed), private servers.
- 47-axe-source.txt, 47-axe-lines.txt (+ 48-log-axe-target.txt): axe-core 4.14.0 (npm pack into <task>/axe-pkg; SHA-256 equal to REGATE14's
  and AUDIT-INT2's copies), 30 scans, 0 violations, focus logged per scan.

Mutants (90-mutate.mjs.txt, 90-mut-run.sh.txt, 90-mut-digest.sh.txt)
- 50-mut-apply.txt: each mutant applied (exactly one occurrence) and restored byte-equal to the pristine export copy.
- 50-mut-exits.txt, 50-mut-progress.txt, 50-mut-counts.txt (per run, with the failed test titles), 50-mut-suite-reasons.txt (the failing
  assertion of each mutant the suite kills), 52-log-mut-MY*-suite.txt (FIX18 + FIX19 tests, desktop), 52-log-mut-MY*-six.txt (survivors: six spec
  files, desktop), 52-log-mut-MY*-probe.txt and 52-obs-mut-MY*.txt (my session-write probe, desktop).
- 50-mut-MY10-digest.txt (+ 52-log-mut-MY10-digest*.txt): the digest-script mutant in the clean clone.
- 51-mut-restored.txt (90-mut-verify.sh.txt): after the last restore, src/, tests/ and scripts/ of export-mut equal the clean export and the
  rebuilt dist equals the target build.

Other
- 99-slips.txt: rule slips.
