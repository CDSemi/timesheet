WP5-UX-AUDIT-AB9 evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name)

Reviewed commit 90b98efc395c3894a21a909b6d361eadc6fc2bd9; HEAD = origin/main = 90b98ef before and after.
Digest 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files, handoff/ excluded): first at 06:20:41Z, last at 07:54:27Z.
Node v24.21.0 (portable), Git Bash, Playwright on the installed Microsoft Edge, Vitest 5.0.2. Times are UTC unless marked; America/Los_Angeles = UTC-7 on 2026-10-13.

01-digest-before.txt      HEAD, origin/main, status; digest in three forms (script, ls-tree 90b98ef, ls-tree HEAD); the clean git-archive export digest (list equal to ls-tree)
02-diff-scope.txt         3670a6c..90b98ef outside handoff/ = exactly 8 test paths (numstat, name-status) and the full test diff
03-test-strength.txt      every removed line per file, expect(/test( counts, skip/fixme/only/fail/slow/soft scan (added lines and whole tree), fixtures.ts import-only removal, shell.spec -w diff
04-bundles.txt            npm ci + build of 3670a6c, 90b98ef and 255ba17; dist/ 230 files byte-identical (cmp 0, diff -r 0); no diff under src/scripts/docs/package/config; client clock grep 0 lines
05-mandatory-checks.txt   typecheck 0, lint 0, npm test 83 files / 1831 tests, AC-13 1/1, npm audit (--omit=dev 0; full: 1 high, dev-only)
06-derivation.txt         own derivations 2026-10-01..2028-12-31: laterDeadlineFor on 8230 and on 83115 instants (0 mismatches); import year and dates on 823 days (0 problems);
                          the today-hit list (R-AB9-3); the free-day pool per day (minimum 3 on 2026-11-28..30); what each sweep instant exercises
07-mutations.txt          unit mutations M1-M5 caught, M6 survives (R-AB9-1); e2e M7 (no exception) fails clearly; M8 (no release) brings AB8-02 back, its control passes; files restored (cmp 0)
08-sim-validation.txt     preload copy check (AB8 copy byte-equal; FIX10/REGATE8 copies differ only in line 1); control spec (server today_local = simulated);
                          3670a6c deadline specs pass at 13:00 and fail the 3 AB8-01 tests at 18:30 PST; 90b98ef passes at 18:30 PST
09-real-full-e2e.txt      FULL e2e, both projects, REAL clock inside the AB8-01 window: exit 0, 210 passed, 26 skipped (desktop 103/0/15, mobile 107/0/11); failed expect steps are expect.poll iterations only
10-ac01.txt               isolation + shell specs on the real clock: 13 passed, 1 skipped; every isolation assertion line reached and passed on both projects (also in the full run)
11-sweep-table.txt        the sweep table (per-project counts, deadline path, admin.spec import dates, isolation lines per run) and what each instant exercises
11-sweep-<label>.txt      the list-reporter log of each sweep run (s1..s8, w1-..)
12-history-probe.txt      the FIX10 History observation re-assessed (R-AB9-6): early manual sign-off of the period in progress at P-3, and the P+1 control
90-digest-after.txt       digest again in three forms; the export unchanged (795 files, list equal); no status change outside handoff/
*.sh.txt, *.mjs.txt, *.ts.txt  the scripts used (env, digests, builds, dist compare, strength, derivations, mutations, Playwright wrapper, sweeps, summaries, step reporter,
                          simulated clock, masking, control and probe specs)

Simulated clock (shiftclock.mjs.txt, the AB8 preload unchanged): NODE_OPTIONS=--import loads it into the Playwright runner, its workers, the CLI and the built
server (the fixtures spawn them with ...process.env). Every process shifts Date by one constant that the wrapper computes once, so elapsed time is real. The
browser is not shifted; src/client has no browser-clock read (grep 0 lines), so the page shows only server dates. No source, test or config file was changed.

Runtime notes (honest):
- All work ran in <task> (exports x90b, x3670, x255, x90m). The control spec and the probe spec were copied into a scratch export for one run each and removed
  with a single rm; the x90b export digest was rechecked at the end. The mutations ran only in the separate scratch export x90m and were restored from git (cmp 0).
- Two reads used tail on a file (no pipe): `tail -c 600 <log>` once to look at a running log, and `tail -n 3 <progress file>` inside the background w1 command.
  No pipe into head or tail, no stdin-fed node or python, no heredoc, no null-device redirect, no Docker, no cmd.exe, no kill.
- The sweep and the one-worker runs ran sequentially in the background; I polled their progress files. Nothing ran in parallel with them except reads and
  the CPU-light derivation scripts. Each Playwright run had its own output, screenshot and step-report folder in <task>.
- The e2e fixtures pick their own free loopback ports (OS-assigned); I started no server of my own and bound no port in 48560-48579.
- The repository was written only in this evidence folder, the review pair and the brief's Results. Nothing is left running.
