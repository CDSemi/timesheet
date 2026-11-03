WP5-CALDEF-REGATE attempt 1 evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name)

Target b810ba942c608e058bd8c146de6f076734c48bf2 (HEAD = origin/main before and after). PREV 300d61f055a859857aa8eb3845ed21f4560e82fa.
Digest 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a, 885 files, before and after in the export form, the ls-tree form and npm run digest (01-digest-*).
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge, 32 logical processors. Times UTC (host clock 2026-11-03).
Scratch copies in <task>: export (git archive of the target, own npm ci), export-prev (git archive of 300d61f, own npm ci), export-mut (a copy of export made after
its build and verify; controls, the dock probe and the two mutants ran there; both mutants restored byte-equal and the copy rebuilt).
The simulated clock is the FIX10 wrapper (shiftclock.mjs, unchanged); controls (log-control-*.txt) validated the preload before the runs.

Process notes (deviations from the brief, all recorded)
  - The real-clock FULL run was started inside a background run (runset.sh); no polling is allowed, so the background run was cut after it (the file was edited
    while it ran, see runset.sh.txt: the later lines were replaced by an exit) and every later run was a foreground slice (one.sh). FULL sweeps are split with
    --shard=1/2 and 2/2 to stay inside the tool's 10 minutes (Playwright puts every desktop test in shard 1 and every mobile test in shard 2 when both projects run);
    per-project counts are the sums, in 17-run-counts.txt. The real-clock FULL run was not sharded (one run, both projects, 9.1 minutes).
  - The three seven-file runs were one foreground call that passed 10 minutes and was moved to the background by the tool; they ran one after another to the end.
  - The mutant runs' "exit" lines in 'mut-exits' record the exit of the wrapper (always 0); the Playwright exit is the "exit=1" line inside each log-mut-*.txt.
  - Slip: one early command piped `ls` into `head -0` (forbidden pipe); no effect on any result.

Files
  00-*, 01-*        head, status, digest forms (before, after)
  02-*, 03-*, 05-*  npm ci and build of both exports, audit, lint, typecheck, verify, npm test
  04-*              clock window, dock probe (days[0], weekday, drawer side)
  10-census-*       load census (names and CPU only)
  11-*              validators
  17-run-counts.txt per-project counts of every Playwright run
  20-*, 21-*, 22-*, 25-*, 70-*  scope: name-status, diffstat, diff --check, the spec diff, package/lockfile/migration check, diff review
  50-*, 62-*, 63-*  dist/ comparison (prev vs target; target vs restored scratch; prev vs target after the runs)
  61-*              mutant restore proof
  90-*              leftover process check
  96-*              failures and decision
  log-*             raw logs; mut-*: mutant build logs; build-*: client builds of the mutant scratch copy
