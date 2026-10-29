WP5-UX5-FIX19 evidence index (masked LF text; <task> = D:\.claude-tmp\timesheet\WP5-UX5-FIX19, <repo> = the repository)

Task: F-UX5I2-1 (a session write in the open Day editor must not let "Save day fields" overwrite a day field changed elsewhere) and F-UX5I2-2
(`npm run digest` fails with ENOBUFS), with the auditor's B, N and O cases as tests (R-UX5I2-1) and one docs/04 clause on the tab-return read (R-UX5I2-2).
Base d96df5daa25b44b156354bc96605e13e94e44396, source digest 6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb (882 files).
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge. Times UTC. One agent, no other mission process.

Two passes. The first pass ran the first version of the new tests, which saved day entries on the shared employee's newest free workday; in the whole Day editor
spec and the FULL desktop run that collided with the calendar-default test "partial leave 240 ..." (42-*, 71-*: 1 failed each). The tests were moved to a person of
their own each (a saved day entry stays on its day) and every proof was run again as the second pass (43-45, 50-*, 75-80). The first-pass logs are kept.

Scratch exports in <task>: export-base (git archive of d96df5d, own npm ci and build: the reproduction and the dist/ baseline), export-fix (the working tree's
owned files over an archive of d96df5d, own npm ci: development and the mutation lab), export-final (first pass), export-proof (second pass, a fresh npm ci: every
proof run), export-digest-* and clone-* (the digest forms).

Files
  00-start-state.txt                                    head, status outside handoff/, the digest before any change
  02-*-base-*.txt                                       export-base: npm ci and build
  10-census-*.txt                                       host census (names, IDs, CPU times, process counts only; no command lines)
  20-repro-digest-clean-clone.txt                       `npm run digest` in a clean clone of d96df5d: ENOBUFS (the output dump is Node's own error text)
  21-repro-probe-base-*.txt                             the auditor's G1 and G2 probes on the unchanged product: both OVERWRITTEN
  22-repro-newtests-on-base-log.txt                     the first version of the new tests on the unchanged product: G1, G2, G3 fail; G4, B, N, O pass
  23-repro-final-tests-on-base-log.txt                  the final tests on the unchanged product (same reading)
  30-*-{ci,lint,typecheck,build,exits}.txt              export-fix, export-final and export-proof: npm ci, lint, typecheck, build
  31-newtests-on-fix-log.txt                            the first version of the new tests and FIX18's on the fix (first run)
  40-42-*                                               first pass: the new tests --repeat-each=20 --workers=6, FIX18's and the new tests on both projects, the whole Day editor spec
  43-45-*                                               second pass, the same three runs with the final tests
  50-mut-*-log.txt                                      the mutants, each restored byte-equal (M* = first round, N* = second round against the final tests, 50-mut-clean-log the unmutated build)
  60-* to 65-*                                          lint, typecheck, build, the dist/ comparison, verify (smoke on SMOKE_PORT) and git diff --check in the repository
  70-71-*                                               first pass: npm test and the desktop FULL run (stopped there, see above)
  75-80-*                                               second pass: npm test once in the export, the real-clock FULL e2e (desktop, mobile), the midnight seven-file run, the counts
  01-digest-*.txt                                       the digest in its forms (trial = taken before the last runs, final = last)
  99-slips.txt                                          rule slips
  *.sh.txt, *.mjs.txt, *.ts.txt                         the scripts (env, census, run-pw, start, repro, mkfix, mut, muts, muts2, final, final2, heavy, heavy2, chain, chain2,
                                                        repo-checks, digest, norm, shiftclock, probe-now, counts, mutate, normcmp)
