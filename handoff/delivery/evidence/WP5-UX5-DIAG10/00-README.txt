WP5-UX5-DIAG10 evidence index

Task: diagnose the desktop timeout of tests/e2e/import.spec.ts:102 in WP5-UX5-REGATE11 (sweep at 2026-11-01T08:45Z, --workers=6). Read-only for the repository.
Base: HEAD = origin/main = 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2. Every probe ran in a scratch export of that commit (git archive, own npm ci, Node 24.21.0). The 250 files of its dist/ equal the REGATE11 target build (12-scratch-build.txt). The failed run's trace was read in place (a small zip reader, zipread.mjs.txt); nothing of it was copied.
Data are synthetic. Census files hold process names, counts and CPU times only; no command line of a process the task did not start was written.
Scripts are *.mjs.txt and *.sh.txt: copy to .mjs and .sh to run. shiftclock.mjs and probe-now.mjs are the unchanged WP5-UX-FIX10 files (evidence/WP5-UX-FIX10). Time in the logs is the simulated clock of that wrapper unless a run says "real".

Question 1, the margin
  10-margin-gates-5-to-11.txt   every e2e test of REGATE5 to REGATE11 (real-clock FULL runs, full sweeps, seven-spec sweeps): median, p95, max; tests above one third of their own timeout.
  11-margin-gates-6-to-11.txt   the same for REGATE6 to REGATE11 (the code after the DIAG4 and FIX10 changes).
  13-margin-all-evidence-logs.txt  the commit test in every evidence log of the repository.
  analyze-logs.mjs.txt, scan-all-evidence.mjs.txt  the scripts.

Question 2, where the 38 s went (the failed run)
  20-failed-test-steps.txt      every test step: start offset and duration in ms (payloads and typed values masked).
  21-failed-test-browser-calls.txt  the browser-side calls and their log lines (offsets in ms).
  22-failed-test-network.txt    every request the browser sent, with timings. The commit request was never sent.
  23-failed-test-snapshots.txt  snapshot and input times per call.
  24-failed-test-api-times.txt  the slowest API request of the trace (245 ms).
  trace-steps, trace-logs, trace-net, trace-snaps, scan-api-times, zipread  (.mjs.txt)  the scripts.

The mechanism
  30-repro-48burner-repeat4-steps.txt, 30-repro-48burner-repeat6-steps.txt  two of the 12 failed runs under a 48-thread burner (steps above 400 ms).
  31-repro-48burner-split.txt, 33-repro-32burner-split.txt  second-tab and first-tab time of every failed run (trace-split.mjs.txt).
  32-repro-48burner-api-times.txt, 34-repro-32burner-api-times.txt  API times; the commit request was sent in one trace only (3 ms).
  35-repro-original-by-test.txt per-test failures of the original under 16, 24, 32 and 48 burner threads.
  40-tab-priority.txt           renderer base priority of the tab in front (8, normal) and the tab behind (4, idle); bringToFront flips them (probe-tab-priority.mjs.txt).
  41-renderer-priority-in-run.txt  renderer processes of a running suite by base priority.

Question 3, controlled load (the original file, the commit test, desktop, 6 workers)
  60-dose-table.txt             every load run: burner threads, census before the run, runs, failures, median, p95, max. A run with two tests (o48b, f48, n1, n2, fr, ...) counts both.
  61-census-*.txt               the census calculations (busy cores per process name from two samples; census.mjs.txt, census.sh.txt). The sample before a burner run was taken while the burner ramped up, over 1 to 9 s, so its share is approximate.
  50-mixed-m4o-stats.txt        the whole suite on both projects plus 12 copies of the import spec: 1068 passed, 0 failed.
  log-run-*.txt                 the run logs.
  Run labels: e0, e4, c4r, c4nr, c4s, c4n, c7r, c7s (calm to moderate load; r = real clock); d16, d24, d32, e48o (the dose ladder: 16, 24, 32, 48 burner threads); o48b, o48m (the original, both two-tab tests, 48 threads, desktop and mobile); f48, f48m (the fix, same tests and load; traces kept for f48; e48f is an earlier run of the same fix); n1, n2, pm1 (the two mutants of the fix under 48 threads and the product mutant); fr, frm, fall, fallm (the fix on a calm host: real clock on both projects; the whole fixed file at the sweep instant).
  burn.mjs.txt (the self-stopping burner), dose.mjs.txt, chain-*.sh.txt, exp-*.sh.txt, run-shift.sh.txt, env.sh.txt, make-copies.sh.txt, run-stats.mjs.txt, by-test.mjs.txt, summarize-runs.mjs.txt, dose-table.mjs.txt, final-stats.sh.txt, setup.sh.txt  the scripts.

Addendum 1, the other tests that open more than one page (see Addendum 1 results in the brief)
  80-context-priority.txt       renderer base priority: pages of two browser contexts (both 8, normal) against two tabs of one context (the first 4, idle).
  80-contexts4-priority.txt     four browser contexts of one browser, one page each (how logo.spec.ts opens its sweep windows): all four at 8, under load.
  81-today-crossing-original-*-split.txt  the original today.spec.ts:641 in its midnight-crossing branch under the burner (completed steps only).
  82-addendum1-summary.txt, 82-addendum1-by-test.txt  every Addendum 1 run: t1d/t1m (today, normal branch, original), t2d/t2m (today, midnight crossing, original), k1d/k1m (controls), g1d (logo), tfcd/tf2d/tf2m/tm1/tm2/pm2 (the first today fix, bringToFront, its mutants and the product mutant), tg1d/tg0d/tg2d/tg2m (the final today fix: crossing and normal branch, calm and under the burner), pm2o/pm2g (product mutant against the original and against the final fix).
  83-grep-newpage.txt           every newPage( and other way to open a second page in tests/ at HEAD.
  84-extended-patch-check.txt   git apply --check on a fresh export for the two-file patch.
  85-today-lint-typecheck.txt   eslint and tsc of the final today.spec.ts.
  86-product-mutant-m2-*.txt    dist/ and source comparison after the product mutant (TimesheetScreen.tsx, no window focus listener) was built and the source restored.
  81-today-crossing-original-*-split.txt  completed steps only.
  proposed.patch.txt            the extended patch (import.spec.ts and today.spec.ts); proposed-import.patch.txt and proposed-today.patch.txt are its two halves.
  rejected-today-bringtofront.patch.txt  the first today fix (bringToFront), proven but replaced; mutant-t1.patch.txt, mutant-t2.patch.txt  its two mutants; mutant-product-m2.patch.txt  the product mutant.
  chain-add1.sh.txt, chain-add2.sh.txt, chain-add3.sh.txt, chain-add4.sh.txt, chain-add23.sh.txt, final-stats-add1.sh.txt, probe-context-priority.mjs.txt, probe-contexts4.mjs.txt  the scripts (chain-add1 stops before the logo run, which chain-add3 holds).

Question 7, the fix
  proposed.patch.txt            tests/e2e/import.spec.ts, 9 lines added (Addendum 1 adds tests/e2e/today.spec.ts, 3 lines).
  70-fix-proof-by-test.txt, 70-fix-proof-summary.txt  original, fix and mutants per test and per run.
  71-fix-48burner-api-times.txt  the fix under 48 threads: every commit request was sent and answered in 3 to 6 ms.
  72-lint-typecheck.txt, 73-patch-check.txt  eslint, tsc, git apply checks.
  mutant-n1.patch.txt, mutant-n2.patch.txt  the fix with a bringToFront removed; mutant-product-m1.patch.txt  the product mutant; 75-*.txt  its build, restore and the dist/ and source comparison.
  74-final-census.txt           nothing of this task is left running.
  check-files.txt (check-files.mjs.txt)  every file of this folder ends with one newline, has no CR and no user path.
