WP5-UX5-AUDIT-INT2 evidence (integration recheck after FIX18 on d96df5daa25b44b156354bc96605e13e94e44396)

Reviewer: claude-opus-5-5 (self-reported), board agent aec1aeea85222dbd9. Review: handoff/delivery/WP5_UX5_REVIEW_INT2.md (+ .vi.md).
Decision: FIX REQUIRED (F-UX5I2-1 Medium, pre-existing saved() path; F-UX5I2-2 Low, npm run digest ENOBUFS). F-UX5I-1 closed.
Task folder <task> = D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-INT2 (outside the repository). All files here are masked LF text written by
90-mask.mjs.txt (ANSI, CR, <user>, <task>, <repo>, non-synthetic email masked; the version used for the earlier copies also let the
commit attribution address through, which no output contained, and was then narrowed to example.invalid only). Node v24.21.0 (portable);
npm 11.18.0.

Identity
- 00-head-before.txt, 00-head-after.txt: HEAD = origin/main = d96df5d at 11:49:52Z and 13:01:41Z.
- 00-nonhandoff-status-*.txt: no status line outside handoff/ before or after.
- 01-digest-before.txt (11:51:40Z), 01-digest-after.txt (13:01:39Z): export form, ls-tree form (target and HEAD) and the wide-buffer copy of
  the target's script (90-digest-wide.mjs.txt) in a scratch clone and in the repository: all 6937d79c...61cb, 882 files. The target's own
  `npm run digest` exits 1 (ENOBUFS) in the repository and in the clean clone. 31-digest-script-enobufs.txt: the measured cause.
- 20-*.txt: name-status and diffstat a5cbc91..d96df5d (five FIX18 paths), 8e55710..d96df5d (223 paths), d96df5d..HEAD (none).
- 22-fix18-src-diff.txt, 22-fix18-tests-diff.txt, 22-fix18-docs-diff.txt: the FIX18 diff as read.
- 40-probe-setup-exits.txt, 41-dist-compare.txt: npm ci and build in export-probe, export-prev-probe (a5cbc91) and export-mut; dist of
  a5cbc91 vs the target: dist/server and dist/domain identical (232 files); export-probe and export-mut builds identical to the target's.

Mandatory checks (clean export, 90-chain-main.sh.txt; progress 03-chain-main-progress.txt)
- 03-core-exits.txt, 03-ci.txt, 03-typecheck.txt, 03-lint.txt, 03-npmtest.txt (101 files, 2,397 tests), 03-build.txt.
- 04-e2e-desktop.txt, 04-e2e-mobile.txt, 04-e2e-counts.txt: real-clock FULL 473/36/0 and 408/101/0 (90-run-shift.sh.txt, "real").
- 05-ac13-pacific-auckland.txt: AC-13 under Pacific/Auckland (90-run-tz.mjs.txt, 90-tzprobe.mjs.txt), 1/1.
- 08-seven-1026.txt, 08-seven-counts.txt: seven files at 2026-10-27T06:58:30Z, FIX10 wrapper, --workers=6: 389 passed, 0 failed.
  30-shiftclock-identity.txt: the wrapper's shiftclock.mjs equals handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt (SHA-256).
- 10-census-*.txt: inline read-only process samples (names, ids, CPU times only; 90-census.sh.txt, 90-census.mjs.txt, 90-cens.sh.txt).

Probes (sources 90-zz-int2-follow.spec.ts.txt, 90-zz-int2-admin.spec.ts.txt, 90-zz-int2-axe.spec.ts.txt; runs 90-probe-run.sh.txt,
90-probe-run2.sh.txt; progress 48-probe-run-progress.txt). The follow probe file here is the final version: after run 1 it gained the
INT2_NO_FOLLOW mode (for a5cbc91), a wait for the reloaded day after "Reload day" (reloadDay), the save-outcome logging in A and case P;
on the target these changes only add waits and logging.
- 44-auditint-probe-target.txt, 44-auditint-probe-prev.txt (+ 48-log-auditint-*.txt): the AUDIT-INT probe
  (WP5-UX5-AUDIT-INT/90-zz-int-clock-editor.spec.ts.txt) unchanged, target 3/3 pass, a5cbc91 the note case fails at the save. Its
  "reopened" lines read the cards before the reopened editor's read answers (probe timing).
- 45-obs-follow-target.txt (+ 48-log-follow-target.txt): run 1 on the target, cases A, B, C, D, F1, F2, G1, G2, H, I, K, L, N, O. Its B
  "Reload day" lines were read before the reload answered (probe defect); 45-obs-follow-target-B2.txt is the rerun of B with the wait.
- 45-obs-follow-target-P.txt (+ 48-log-follow-target-p.txt): case P (label refresh after a follow), run with
  `node node_modules/@playwright/test/cli.js test tests/e2e/zz-int2-follow.spec.ts --project=desktop --workers=1 -g "int2-P "` in export-probe.
- 46-obs-admin-target-2.txt (+ 48-log-admin-target-2.txt): case E (an administrator's holiday import) on private servers;
  46-obs-admin-target-run1-reload-line-defect.txt is run 1 (its Reload line read too early).
- 45-obs-follow-prev-run1.txt (+ 48-log-follow-prev-run1-probe-defect.txt): run 1 on a5cbc91; it waited for a follow read that a5cbc91
  does not make, so only G1, G2 and L are used from it. 45-obs-follow-prev-2.txt (+ 48-log-follow-prev-2.txt): run 2 with
  INT2_NO_FOLLOW=1 (A, B, C, D, F1, F2, N; O not applicable). 46-obs-admin-prev-2.txt: case E on a5cbc91 (run 1:
  48-log-admin-prev-run1-probe-defect.txt).
- 47-axe-lines.txt (+ 48-log-axe-target.txt): axe-core 4.14.0 (npm pack axe-core@4.14.0 into <task>/axe-pkg; SHA-256 equal to REGATE13's
  copy), 16 scans, 0 violations.

Mutants (90-mutate.mjs.txt, 90-mut-run.sh.txt)
- 50-mut-apply.txt: each mutant applied (exactly one occurrence) and restored byte-equal to the pristine export.
- 50-mut-exits.txt, 50-mut-progress.txt, 52-log-mut-MX*-fix18.txt (FIX18 tests + two stale-version tests, desktop),
  52-log-mut-MX*-wholefile.txt (survivors: the six spec files that touch the clock and the Day editor, desktop),
  52-log-mut-MX*-probe.txt (probe cases A 1440, B, N, O).
- 51-mut-*.txt: after the last restore the rebuilt dist equals the target's; src/ and tests/ equal the clean export.

Other
- 32-suite-follow-reach.txt: per spec file, counts of clock/visibility and Day editor references (why six files were run for survivors).
- 99-slips.txt: rule slips.
