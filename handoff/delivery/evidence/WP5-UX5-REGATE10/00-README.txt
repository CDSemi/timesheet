WP5-UX5-REGATE10 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Target: be2afa2e3c43514581ed62fd145c15eeef13b534 (HEAD = origin/main after git fetch origin). Previous: bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23.
Digest ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f, 882 files, before and after, in three forms (export, ls-tree, npm run digest): 01-digest-*.txt.
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge. Times UTC. Scratch copies: export (git archive of the target, own npm ci), export-prev (bd9c275, own npm ci),
export-mut (a copy of export; every mutant and model ran there and was restored byte-equal). The simulated clock is the FIX10 wrapper (shiftclock.mjs.txt).

Files
  00-*                 head, origin/main, non-handoff status before and after
  01-digest-*          digest before and after
  02-*, 03-*           npm ci, npm audit --omit=dev, lint, typecheck, build, verify (exit files hold the exits)
  04-e2e-*             real-clock FULL e2e, per-project counts in 04-e2e-project-counts.txt
  05-test-*            npm test x3 (101 files, 2,389 tests each)
  10-census-*          host census, process names, IDs, counts and CPU times only (no command lines)
  11-*                 validators
  17-sweep-counts.txt, 18-logo-durations.txt   simulated-clock sweeps and the longest logo.spec.ts test per FULL run
  20-*, 21-*, 25-*     scope: name-status, src diff lines (0), package/lockfile diff lines (0), carry-forward diff (0), FIX15 tests diff, git diff --check
  31-stress-counts.txt stress counts
  51-*                 dist/ hashes of bd9c275 build, target build, target build after verify; the comparison results
  70-strength-exits.txt, 72-cases.txt, dense-fence-300.txt, dense-fence0-300.txt   mutants, boundary test, crossing test, DIAG9 cases, 13 date-reader models (fence on, fence off)
  71-models-exits.txt  DIAG5 delay suite at 90 ms, both projects
  log-*                raw logs of each run; *.sh.txt, *.mjs.txt, *.ts.txt are the scripts; mutdef-*, variant-* are the mutant texts and DIAG9 scratch hooks (DIAG9/FIX15's, unchanged)
Process notes (honest record)
  - Three rule slips by me in read-only or no-op shell lines, nothing written by them: an empty-input sed on stdin (with 2>/dev/null) while listing scripts, a no-op pipe into cat with a /dev/null redirect, and a mistyped cat of a missing file with 2>/dev/null.
  - A test title in the Playwright list logs is cut by the reporter at "Employeeemployee@examp" (synthetic; the same text is in REGATE9's logs); it is not an address.
  - The census gap was 55 s (target 60 s). Non-mission load 3.27 busy cores of 32, below the 4-core limit. Census 3 after the run shows the same node process count as before (16).
  - The brief names the crossing test today.spec.ts:626; in the target it is line 627.
