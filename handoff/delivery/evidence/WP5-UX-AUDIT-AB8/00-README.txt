WP5-UX-AUDIT-AB8 evidence index (masked LF text; <task> = the task folder, <repo> = the repository, <user> = the profile name)

Reviewed commit 3670a6c3c22ddcf75138927ed60f4cd9bf02078d; HEAD = origin/main = dc70ba65eb6c93925b3abe821829b76fc7e1f9da (handoff-only after 3670a6c).
Digest 58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files, handoff/ excluded): first at 02:04:02Z, last at 03:10:50Z.
Node v24.21.0 (portable), Git Bash, Playwright 1.63.0 on installed Microsoft Edge, Vitest 5.0.2. Times are UTC; America/Los_Angeles = UTC-7 on 2026-10-13.

01-digest-before.txt     HEAD, digest in three forms (script, ls-tree 3670a6c, ls-tree HEAD), 255ba17 digest, clean git-archive exports and their blob lists (cmp 0)
02-diff-scope.txt        3670a6c..dc70ba6 touches only handoff/; 255ba17..3670a6c outside handoff/ = 5 test paths; the full test diff
03-test-strength.txt     numstat (fixtures.ts 12/0), removed/added spec lines, skip/fixme/only scan, test(/expect( counts
04-bundles.txt           npm ci + build of both exports; dist/ 230 files (180 server, 4 client, 46 domain) byte-identical (cmp 0, diff -r 0), twice
05-mandatory-checks.txt  typecheck 0, lint 0, npm test 83 files / 1827 tests, the seed test verbose (4/4), AC-13 1/1, npm audit, deprecation scan (0 lines)
06-seed-derivation.txt   own derivation of the displayed-period rule over 2026-2027 against the production functions and helper (derive.ts.txt)
07-seed-mutations.txt    scratch-copy mutations of the seed test / helper: M1 and M1b (old choice) fail, M2-M5 fail, M6 (sessions ignored) survives
08-ac01.txt              isolation + shell specs, both projects, 2026-10-13 19:12 PDT (inside the window): 13 passed, 1 skipped; every isolation assertion line reached and passed
09-ac01-old255-now.txt   the unchanged 255ba17 specs at the same time: 6 failed at [data-day="2026-10-12"] (the old seed fails after the due time too)
10-e2e-full.txt          FULL e2e both projects at 19:14-19:20 PDT: exit 1, 207 passed, 3 failed, 26 skipped (desktop 101/2/15, mobile 106/1/11)
11-deadline-window.txt   automation.spec.ts:118 (both) and pdf-visual.spec.ts:187 (desktop) fail again on 3670a6c AND on 255ba17 (pre-existing); docs/05 line 26
12-sim-controls.txt      simulated clock validated: 2026-10-27 13:00 PDT -> pass; 18:00 PDT -> the same 3 failures; full suite at 13:00 -> 210 passed, 0 failed
13-sim-sweep.txt         full suite at simulated instants: 10-17, 10-26, 11-02 pass (210/0); 11-28 fails 2 (timesheet:403); 12-26 fails 1 (admin:281 mobile); 2027-01-11 fails 2 (admin:281)
14-sim-repro.txt         deterministic one-worker reproductions of AB8-02 (also on 255ba17) and AB8-03; AB8-04 code; an edge-case attempt (passed: each repetition gets a fresh worker server)
90-digest-after.txt      digest again in three forms; export unchanged (795 files, cmp 0); no status change outside handoff/
*.sh.txt, *.mjs.txt, derive.ts.txt   the scripts used (env, export digest, dist compare, mutations, Playwright wrappers, step reporter, simulated clock, masking)

Simulated clock (shiftclock.mjs.txt): NODE_OPTIONS=--import loads a preload into the Playwright runner, its workers, the CLI and the built
server (the fixtures spawn them with ...process.env). All processes shift Date by one constant computed by the wrapper, so elapsed time is real.
The browser is not shifted; src/client has no Date.now / new Date( / performance.now / setInterval (grep: 0 lines), so the page only shows server
dates. No source, test or config file was changed for it. Controls in 12-sim-controls.txt reproduce the real-clock results on both sides of a due time.

Runtime notes (honest):
- The first listing command wrote one file next to the task folder (in the parent timesheet temp folder); it was read and removed at once.
- One `tail -n 12 <file>` read a log (no pipe). No stdin-fed node/python, no heredoc, no null-device redirect, no Docker, no cmd.exe.
- A sed fix of the mutation script did not match; the two lines were corrected with the Edit tool before the run.
- The first masking pass took 4 "spec.ts@<sha>" labels for addresses; the raw label was changed to "spec.ts at <sha>" and all evidence reassembled.
- `TZ=America/Los_Angeles date` printed UTC in Git Bash; Los Angeles times come from derive.mts line [6] (Intl, production zones.ts).
- The e2e fixtures pick their own free loopback ports (OS-assigned); I started no server of my own and bound no port in 48500-48519.
- All runs were sequential and in the foreground; each Playwright run had its own output, screenshot and step-report folder in <task>. Nothing is left running.
- The repository was never edited outside this evidence folder, the review pair and the brief's Results.
