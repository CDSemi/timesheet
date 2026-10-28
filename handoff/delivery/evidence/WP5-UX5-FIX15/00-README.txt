WP5-UX5-FIX15 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Base: HEAD = origin/main = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23, nothing changed outside handoff/ at the start, `npm run digest` 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708
(882 files) (01-head-and-start-state.txt). Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge. Scratch exports: export (git archive of bd9c275, own npm ci and build;
the reproduction), export2 (git archive of bd9c275 plus the four patched files copied from the working tree, own npm ci and build; every proof), digest-export (git clone plus the four files).
Times are UTC unless stated; America/Los_Angeles is UTC-7 until 2026-11-01; local midnight on 2026-10-27 is 07:00:00Z. The simulated clock is the FIX10 wrapper (shiftclock.mjs.txt,
byte-equal to handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt). The scratch hooks (diag9Hooks.ts, the variant fixtures and day-editor spec) are DIAG9's, unchanged, in
handoff/delivery/evidence/WP5-UX5-DIAG9/ (diag9Hooks.ts.txt, variant-*.ts.txt); the variant fixtures and day-editor spec differ from the repository files only by the hook lines (diff checked).

The change: the DIAG9 patch applied as proposed with git apply (check first, --whitespace=error), four paths, +101/-14 (12-applied-diff-working-tree.txt, the same text as the patch).

Reproduction on the unchanged export of bd9c275
  10-repro-original-C2-*.txt        day-editor "Check in then Check out asks", case C2 (midnight 0.3 s into the test, between the date read and the click), both projects: failed
                                    (Expected: true / Received: false); the log shows the simulated instant of every stage
  11-repro-dense-original-first-run-day-editor-lines-void.txt   the first dense run: the five day-editor targets answered "No tests found" because the scratch hooks had shifted the
                                    line numbers (a slip of mine, empty summaries); the eight today.spec.ts targets are valid (failed as in DIAG9)
  11-repro-dense-original-day-editor-pristine.txt   the five day-editor targets rerun against the byte-exact original spec: failed on both projects, except :5196 desktop, which passed once
  11-repro-dense-original-5196-rerun1..3.txt        :5196 desktop three more times: failed 3 of 3 (the first pass was timing noise of the 0.3 s model)
Proof of the change, in export2
  20-cases-*.txt                    the two check-in tests at cases C1 to C6 on both projects: 24 of 24 passed (the fence is in the fixtures, so the cases run on the new date)
  21-models-*.txt, 22-model-*.txt   the 13 date-reader models (26 runs, 2 skipped on mobile as in DIAG9) and the check-in model (18 tests x 2 projects) against the new fence and the original specs: 0 failed
  23-control-fence-off-*.txt        the same 13 models with the fence switched off (MIDNIGHT_FENCE_MS = 0): fails again: desktop 13 of 13; mobile 10 failed, :242 passes and :5196, :293 are skipped (as in DIAG9)
  30-*.txt                          mutants A (closed session in the past), A2 (already-ended session), B (next accounting date) on the built server: each fails the two check-in tests on both projects (4 of 4)
  31-*.txt                          the integration boundary test (passes, 16 tests) and against the UTC-date mutant of the source (fails, 1 of 16)
  32-*.txt                          the crossing test at 06:59:20Z: normal 37.9 s, with the exemption removed 2.1 s (it is held by the fence for the 40 s and then runs at once)
  40-*.txt                          repeats --repeat-each=20 --workers=6, both projects, real clock: 40 of 40 passed each
Repository checks
  50-*.txt                          lint, typecheck, build (exit 0), the dist/ comparison against a build of bd9c275 (diff -r empty, 250 files), verify (exit 0), git diff --check, deprecation greps
  51-npm-test-export2.txt           npm test: 101 files, 2,389 tests
  60-*.txt                          the real-clock FULL e2e on both projects (2 workers): desktop 469 ok / 35 skipped / 0 failed (12.9 m), mobile 407 ok / 97 skipped / 0 failed (7.0 m)
  61-*.txt                          the seven-file midnight sweep at 2026-10-27T06:58:30Z, both projects, --workers=6: 468 tests, 384 ok, 84 skipped, 0 failed (7.0 m);
                                    the desktop crossing test (today.spec.ts:627) took 1.0 m, the mobile one 2.2 s
  70-*.txt                          the digest (repository and clean export: ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f, 882 files), the host census
                                    (process counts by name only), the final non-handoff status
Note: the FULL run and the sweep ran in the background of one script (pDE.sh) because they exceed the foreground limit; nothing else ran beside them. The first reproduction
script (repro.sh) ran the dense list against line numbers that the scratch hooks had shifted (see 11-*), and repro2.sh repeated the five day-editor targets correctly.
Scripts (*.sh.txt, *.mjs.txt): env, run-shift, case, cases, cases-summary, dense, dense2, one, pinstall, pB, pC, pDE, setup, setup2, repro, repro2, collect, mutate, counts, mask, shiftclock, probe-now.
The mutation texts (mut-*.txt) are DIAG9's, unchanged.
