WP5-UX5-FIX17 evidence index

Task: apply the DIAG10 test-only patch (no e2e step on a tab that is behind) and prove it. Base: HEAD = origin/main = 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2. Data are synthetic. Raw logs stay in the task folder outside the repository (D:\.claude-tmp\timesheet\WP5-UX5-FIX17); this folder holds the scripts, the run table and the results.

Start state (01-checks.txt): HEAD = origin/main = 1fe5ad3, branch main, git status outside handoff/ empty, npm run digest = 18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882 files).

Patch: handoff/delivery/evidence/WP5-UX5-DIAG10/proposed.patch.txt, applied with git apply --whitespace=error (git apply --check first, exit 0). git status outside handoff/ afterwards: exactly tests/e2e/import.spec.ts (+9) and tests/e2e/today.spec.ts (git numstat: import 9 added, 0 removed; today 17 added, 2 removed; the brief said +16 for today, the patch itself gives 17). Line endings: both files LF in the index and in the working tree, like their neighbours (git ls-files --eol: i/lf w/lf attr/text=auto eol=lf). git apply --check -R exits 0 (the applied tree equals the patch). git diff --check exit 0.

Files in this folder
  00-README.txt   this index
  01-checks.txt   start state, patch, repository checks, dist/ comparison, digest
  10-census.txt   host census
  20-runs.txt     every load run, mutant, calm run, FULL and sweep run with counts
  scripts (*.sh.txt, *.mjs.txt; copy to .sh and .mjs to run): env, run (clock wrapper), dose.mjs (burner + census + Playwright), burn.mjs (the DIAG10 burner, unchanged), census.sh, census-calc.mjs, by-test.mjs, collect.sh, setup, setup-fix, chain-repro, chain-fix, chain-mut, chain-calm, chain-repo, chain-full. shiftclock.mjs and probe-now.mjs are the unchanged WP5-UX-FIX10 files (evidence/WP5-UX-FIX10). The digest script is digest2.sh.txt (the first attempt, digest.sh, is described in 01-checks.txt and was discarded).

Result in one line: reproduced (import commit test 12 of 12 failed, today crossing 3 of 6 failed under the 48-thread burner); with the patch 0 failed in every proof run on both projects; the three mutants fail; calm host, repository checks, FULL e2e (469 + 35 skipped, 407 + 97 skipped) and the midnight sweep run (384 ok + 84 skipped) all with 0 failed; dist/ identical; digest of the working tree 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882 files, export form and npm run digest agree).
