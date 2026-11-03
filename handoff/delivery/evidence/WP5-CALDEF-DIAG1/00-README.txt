WP5-CALDEF-DIAG1 evidence index (diagnose; read-only for the repository; synthetic data; masked LF text only)

Base: HEAD = origin/main = 300d61f055a859857aa8eb3845ed21f4560e82fa (git archive export, own npm ci exit 0, own build exit 0), Node 24.21.0, Edge channel, ports from the harness (OS-assigned free loopback ports).
Clock wrapper: the FIX10 shiftclock.mjs (unchanged), driven by run-shift.sh.txt; working-hours instant = 18:00:00Z of each date (10:00 or 11:00 in the reporting zone America/Los_Angeles).

Reproduction (the original test and a measuring probe, desktop, one run per instant, 25 instants = 21 dates + the 3 gate sweep instants + the real clock):
  10-repro-table-original-test.txt   per instant: opened day and weekday, dock side of the drawer, drawer x range, card scrollWidth/clientWidth, drag start, element at the drag start, scroll after the drag, verdict of the original test:143
  11-repro-results-original-test.txt Playwright counts of those runs
  12-probe-raw-facts.txt             the probe's raw JSON line per instant
  13-log-sweep1-original-test.txt    the 25 run logs
  zz-probe.spec.ts.txt               the measuring probe (a copy of the test's steps plus measurements; export-only, not part of the proposal)
Proposed fix:
  proposed.patch.txt                 the one-file patch (tests/e2e/classic-scrollbar.spec.ts); 31-apply-check.txt = git apply --check in a fresh export of HEAD
  20-results-patched-test.txt        patched test:143 at the same 25 instants
  21-log-sweep2-patched-test.txt     the 25 run logs
  30-log-mutants.txt                 mutants M1 (outside-press handler ignores the scrollbar) and M2 (card not scrollable) against the patched test, right-dock and left-dock instants, build logs
  32-dist-assets-after-restore.txt   dist/client asset names after the restore build (identical to the gate export's)
  44-log-stress-changed-test.txt     patched :143 --repeat-each=20 --workers=6 at a right-dock and a left-dock instant (20/20 each), whole spec once at the real clock (3/3)
  50-lint.txt, 51-typecheck.txt      npm run lint and npm run typecheck in the patched export (exit 0 each)
Completeness census:
  40-log-full-2026-11-04T18Z.txt, 40-log-full-2026-11-05T18Z.txt, 40-log-full-2026-11-09T18Z.txt   FULL suite, desktop and mobile, --workers=6, patched export
  43-results-full.txt                counts of the three FULL runs (937 passed, 153 skipped, 0 failed each)
  41-census-during-full-run.txt, 42-census-processes-during-sweep2.txt, 45-census-final.txt, 46-leftover-processes.txt   host census (counts, names, ids, CPU times only)
Scripts: env.sh.txt, run-shift.sh.txt, sweep1.sh.txt, sweep2.sh.txt, mutrun.sh.txt, full.sh.txt, stress.sh.txt, summarize.mjs.txt, results.mjs.txt, combine.mjs.txt, mask.mjs.txt (the pattern lines of mask.mjs.txt show masked path names, so it is a record, not runnable as is).
The F2 assessment is from the code only (see the task record, section 6); no load campaign was run for it.
