WP5-UX5-DIAG9 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Base: HEAD = origin/main = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23 (01-head.txt). Probes ran in scratch `git archive` exports of HEAD with their own `npm ci` and `npm run build`
(Node v24.21.0, Git Bash, Playwright 1.63.0 on Microsoft Edge). Nothing in the repository was changed except this folder and the Results of the brief
(01-nonhandoff-status-start.txt and 01-nonhandoff-status-end.txt: empty). Times are UTC unless stated; America/Los_Angeles is UTC-7 until 2026-11-01. The simulated clock
is the FIX10 wrapper (shiftclock.mjs.txt, unchanged): one constant shift shared by the runner, the workers, the CLI and the built server; the browser is not shifted and the
client never reads its clock. Local midnight in Los Angeles on 2026-10-27 is 07:00:00Z; the accounting date before it is 2026-10-26 (D), after it 2026-10-27 (D+1).

TWO VERSIONS OF THE FENCE. The first version (files 40-cases-full-*, 41-*, 50-*, 51-*, 60-*, 62-*) signed the shared employee in before each test and read the server's date.
Addendum 1 replaced it with a version that makes no request (the runner's clock and the seeded zone). The FINAL patch is proposed.patch.txt (four files, +101/-14);
files 70-* to 75-* are the proofs of the final patch, in a fresh export built from it.

Question 1 and 3: what the test does; test assumption or product defect
  10-regate9-trace-extract.txt             the failed REGATE9 run's own trace: the check-in answer (start 07:00:00Z, work_date 2026-10-27), the stale todayLocal, the page snapshot
  12-product-probe-desktop.txt, -mobile    the product at the midnight (passed): a check-in at 06:59:59Z stays on D after the midnight and is open there, the page still shows it,
                                           a check-out after the midnight closes it on D, a check-in at 07:00:03Z is D+1
Question 2: the cause at chosen instants
  11-orig-cases-desktop.txt, -mobile       six placements of the midnight against the ORIGINAL test, with the simulated instant of every stage
  11-log-orig-*-C2.txt                     the full log of one failing placement; 10-probe-timeline-all-before-desktop.txt the stages of an unhindered run
Question 4: the fix and its proof
  proposed.patch.txt                       the final patch: fixtures.ts (midnight fence, no request), day-editor.spec.ts (clockIn), today.spec.ts (annotation), timesheet-api.test.ts (boundary test)
  proposed-clockin-only.patch.txt          the clockIn part alone; proposed-integration-test.patch.txt the boundary test alone
  40-patch-check.txt                       git apply --check --whitespace=error in a fresh export, all three: exit 0; 70-final-export-apply-check.txt the same for the final patch in export2
  40-cases-clockin-only-*.txt              the six placements against the fixed tests without the fence (18 of 18 pass)
  40-patched-*.txt                         typecheck and lint of the first patch; 70-final-*.txt typecheck, lint and npm test (101 files, 2,389 tests) of the final patch
  41-*.txt                                 mutants and the crossing test on the first patch; 73-final-*.txt the same on the final patch (mutants A, A2, B, the boundary test against its mutant, the crossing test with and without its exemption)
  71-final-fence-*.txt, 72-final-fence-off-control.*   the date-reader models and the check-in model against the final fence (13 of 13, 18 of 18), and with the fence switched off (13 of 13 fail again)
  74-final-full-real-*.txt                 the real-clock FULL e2e on both projects of the final patch: desktop 469 ok / 35 skipped, mobile 407 ok / 97 skipped, 0 failed
  75-final-seven-file-*.txt                the seven-file scope of the final patch at 2026-10-27T06:58:30Z and with the midnight 200 s into the run: 0 failed in both
Question 5: completeness census
  30-static-census.txt, 30-scan-seven-file-scope.txt     the reading of the e2e suite, classified, with the model verdict of each test
  20-dense-orig-300.*, 20-dense-orig-late-1500.*         model 1 on the original: 59 candidate tests, the midnight 0.3 s (then 1.5 s) into the test body
  21-dense2-orig-clockin.*                 model 2 on the original: the check-in request lands 0.3 s after the midnight, the date was read 3 s before
  22-dense-orig-list2-300.*                the outside-scope candidates; 23-signdate-orig-*.txt model 3: the sign-off before the midnight, the date assertion after it
  50-*.txt, 51-dense-mut-fence0-300.*      the same models against the FIRST fence, and with it off
  60-natural-*.txt                         the seven-file scope on the first patch with the midnight 20, 70, 130, 190, 250 and 290 s into the run: 0 failed in all six
  62-first-fence-sweep*.txt                the sweep instants twice over (--repeat-each=2) on the first patch: seven-file at 2026-10-27T06:58:30Z, 2027-01-01T07:30Z and 2027-01-01T08:30Z, FULL at 2026-10-26T16:00Z: 0 failed
Scripts (*.sh.txt, *.mjs.txt, *.ts.txt): env, setup, setup2, run-shift (the FIX10 runner), case, cases, cases-summary, product, dense, dense2, natural, sweeps, chain1..7, chain6b, all,
  mkpatch, collect, mutate, counts, mask, summ, scan, shiftclock, probe-now; diag9Hooks.ts and zz-diag9-product.spec.ts (the scratch hooks and the product probe); variant-*.ts.txt (the
  original files plus no-op hooks, and the final fixtures plus hooks); dense-list*.txt (the test lists); mut-*.txt (the mutation texts).
