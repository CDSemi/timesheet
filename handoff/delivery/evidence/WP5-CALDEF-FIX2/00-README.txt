WP5-CALDEF-FIX2 evidence index (synthetic data; masked LF text)

Base: HEAD = origin/main = 300d61f055a859857aa8eb3845ed21f4560e82fa; scratch export via git archive, own npm ci exit 0, own build exit 0 (out-exits.txt). Node 24.21.0, FIX10 shiftclock wrapper (run-shift.sh.txt), desktop project, instants 18:00:00Z.
Reproduction, unpatched :143: logs-orig-2026-11-04 ... see logs-orig-nov04.txt (1 failed, Expected > 0, Received 0) and logs-orig-nov06.txt (1 passed).
Patch: applied.patch.txt (git apply --check and git apply of DIAG1 proposed.patch.txt; one file, 11 insertions, 3 deletions).
Proof, patched :143 (days[0] weekday and drawer side from the DIAG1 table, same instants):
  11-04 Tue right: logs-p-2026-11-04.txt 1 passed; 11-05 Wed right: logs-p-2026-11-05.txt 1 passed;
  11-06 Thu left: logs-p-2026-11-06.txt 1 passed; 11-09 Fri left: logs-p-2026-11-09.txt 1 passed;
  real clock (2026-11-03, days[0] Mon, right): logs-p-real.txt 1 passed.
Whole spec, real clock: logs-whole-real.txt 3 passed (desktop), 3 skipped (mobile project skips this file).
Stress :143 --repeat-each=20 --workers=6: logs-st-right.txt (11-04) 20 passed; logs-st-left.txt (11-06) 20 passed.
Mutants (patched test, right 11-04 and left 11-06): M1 logs-mut-M1-*.txt fail at "a scrollbar press is not a press on the page"; M2 logs-mut-M2-*.txt fail at "a week card with a sideways scrollbar in view". Mutant script lines: mutrun.sh.txt; exits in out-mut-exits.txt (the exit value there is of the echo wrapper, the failures are in the logs).
Restore: out-restore.txt (cmp against git show HEAD: equal for TimesheetScreen.tsx and styles.css; final build exit 0; lint exit 0; typecheck exit 0; git diff --check exit 0; git status outside handoff lists only tests/e2e/classic-scrollbar.spec.ts; digest exit 0) and out-digest.txt: 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
Scripts: env.sh.txt, run-shift.sh.txt, mutrun.sh.txt.
