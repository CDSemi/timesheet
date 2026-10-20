WP5-UX3-AUDIT-INT evidence (final recheck and integration pass of WP5 UI change round 3)

Reviewer: timesheet-auditor, self-reported claude-opus-5-5, board agent a08c43f46e599d8f4, attempt 1, 2026-10-20 04:40Z to about 06:10Z.
Target: reviewed_commit 8e557100d16b6b6eb86a48e00276835761aabfdf; digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files).
Review pair: handoff/delivery/WP5_UX3_REVIEW_INT.md and .vi.md. Decision: PASS.
Masking: <task> = the task folder D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-INT, <repo> = the repository, <user> = the account name,
<home> = the user profile folder, <node24> = the portable Node 24.21.0 executable, <tmp> = the session scratch folder. LF, no trailing
blanks. In the shared-view observations the joined textContent of the identity block got spaces between name, address and initials.

Exports in the task folder (never the repository; none has a .git folder):
  export  clean git archive of the target: digest forms and the mandatory checks
  probe   git archive of the target plus the task-local zz-int-* probes and playwright.int.config.ts
  mut     git archive of the target: the mutants (restored and compared afterwards)
  base    git archive of ceb86b6 (pre-FIX4) plus the probes: comparison runs

Files
  01-*-before/after.txt      digest in three forms, HEAD, origin/main, status outside handoff/ (0 lines both times)
  02-authors.txt             WP5 author set and models from the board; this auditor absent; round-3 reviews and gates
  10-main-exits.txt          mandatory run: typecheck, lint, npm test x2, build, AC-13 in three zones, FULL e2e (exit codes, counts)
  10-typecheck/lint/npmtest-1/npmtest-2/build.txt   logs
  11-e2e-real.txt            FULL e2e, real clock, both projects (04:48:31-05:04:50Z): 651 passed, 67 skipped, 0 failed
  11-e2e-real-counts.txt     per-project counts, deprecation and buffer lines (0 and 0), durations of the named tests
  14-ac13-*.txt, 14-tzprobe-*.txt   AC-13 under TZ America/Los_Angeles, Asia/Tokyo, America/New_York and the child-process zone probe
  20/21/22-*-stat/diff.txt   FIX4 (ceb86b6..8629441), FIX5 (8629441..5c101c1), FIX6 (5c101c1..8e55710) diffs of src tests docs
  23-names-base-target.txt   paths changed outside handoff/ from ceb86b6 to the target (FIX4's 8)
  24-hover-viewport.txt, 24-hover-snips.txt   every viewport change in hover.spec.ts and its context
  29-mut-sites.txt           the mutant sites in the target source
  30-setup-exits.txt, 30-ci-*.txt, 30-build-*.txt   npm ci and builds of the four exports
  33-suggestedRows.txt       R-B2-4: callers of suggestedRows (tests only)
  34-dist-*.txt              dist comparisons (probe and mut equal to export; ceb86b6 server and domain equal to the target)
  35-boundary.txt            empty server/domain/api/package diffs from a643794 and from ceb86b6
  36-governance.txt          empty governance-path diff ceb86b6..target; AGENTS.md on disk equals the target blob
  37-regate-tests.txt        the two REGATE timeout tests at the target
  39-other-resize.txt        DIAG1's two unchecked sites (no resize before the locator)
  40-docs-parity.txt, 41-docs-parity-lines.txt, 41b-docs12-vi35.txt   EN/VI parity of docs 04, 10, 12
  50-obs-<tag>-<probe>.txt   probe observations: target (run 1), target-r2 (repaired probes), base (ceb86b6), target-sim1026 and
                             target-sim1026-r2 (FIX10 clock at 2026-10-26T16:00:00Z, a window day)
  52-preload-sha.txt         the FIX10 preload copied unchanged (sha256 equal to WP5-UX-FIX10's)
  60-run-*.txt               Playwright logs of the probe runs and of the FIX5 test at four instants; run-index and phase timeline
  60-mutants-summary.txt     the nine mutants: 8 guards caught, MA1c (characterization) survives
  61-mut-<id>-diff/e2e.txt   each mutant's diff and its e2e log
  62-after-mutants.txt, 62-dist-export-vs-mut-after.txt   mut src equal to the pristine export, rebuilt dist equal
  96-slips.txt               rule slips (read-only)
  97-preflight.txt           validate_package.py --preflight after the review pair was written: PASS, 118 pairs
  98-check-evidence.txt      LF, blanks, address and profile-path check of this folder, the review pair and the brief
  99-procs.txt               processes whose command line names the task folder at the end (only the shell tool's own)
  axe-version.txt            axe-core 4.14.0 copied into the task folder only (sha256)
  mut-MA1-320.txt            the unrelated ERR_NO_BUFFER_SPACE failure seen in the MA1 run (shell.spec.ts:478 mobile)
  p-target-errors.txt        the four probe failures of run 1 (probe bugs, repaired in run 2)
  script-*.txt               every script and probe source as run (the probe files are the repaired versions; run 1 used the
                             earlier versions of zz-int-lib, -more, -shared and -pill: outside press on the screen-reader-only phone
                             heading, a view-only day opened through the absent "Open a day", the inert check counting the browser's
                             own focus stop as leaving the modal, no sheet path in the pill probe)
  *-synthetic.png (10)       int-more-hidden-focus-390-base, int-account-entries-1280-target, -1280-base, -390-target,
                             int-menu-over-editor-1366-target, int-stack-notice-1280-target-r2, int-stack-subdialog-390-target-r2,
                             int-shared-view-editor-target-r2, int-shared-edit-editor-target-r2, int-pill-window-day-target-sim1026-r2

Commands (from the task folder scripts; Node v24.21.0 first on PATH; workflow Python run with -I)
  bash digest.sh before|after <export>            digest forms
  bash setup.sh && bash run-main.sh               exports, npm ci, builds, mandatory checks and the FULL e2e (export)
  bash run-probes.sh                              probes (target, base, pill at the window day, FIX5 at four instants)
  bash run-probes2.sh                             repaired probes, pill with the sheet path, then run-mutants.sh (node run-mutants.mjs)
  python parity.py / parity_lines.py / cmp_dist.py / counts.py / authors.py   checks above
  bash copy-evidence.sh; python check_lf.py       this folder

Nothing of this audit is left running.
