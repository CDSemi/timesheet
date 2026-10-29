WP5-UX5-FIX18 evidence index (masked LF text; <task> = D:\.claude-tmp\timesheet\WP5-UX5-FIX18, <user> = the profile name, <repo> = the repository)

Task: the open Day editor follows the page's own Check in and Check out (finding F-UX5I-1 of WP5-UX5-AUDIT-INT). Base a5cbc91e6965633a0f9d1dd7e912577321cc71e3.
Node v24.21.0 (portable), Git Bash, Playwright on Microsoft Edge. Times UTC; the host clock reads 2026-10-29 (Los Angeles 02:2x-03:xx). One agent, no other mission process.
Scratch exports in <task>: export-base (git archive of a5cbc91, own npm ci and build; the reproduction and the new tests on the unchanged product), export-fix (the
working tree's owned files over an archive of a5cbc91, own npm ci; the mutation lab and development), export-final (the same, a fresh npm ci; every proof run),
export-head-clean (a clean archive of a5cbc91 for the digest), export-wt-clean (made last, for the final digest).

Files
  00-start-state.txt, 01-digest-before.txt, 01-digest-before-head.txt   head, status outside handoff/, the digest before any change (and why `npm run digest` fails here: ENOBUFS)
  01-digest-after.txt                                                    the digest last
  10-census-*.txt                                                        host census (names, IDs, CPU times, process counts only; no command lines)
  20-repro-probe-base-*.txt                                              the auditor's probe on the unchanged base: the reproduction
  21-newtest-on-base-log.txt                                             the new tests on the unchanged base: T1 T2 T3 fail, the existing "a day changed elsewhere" passes
  22-export-*-exits.txt, 22-export-*-{ci,lint,typecheck,build}.txt      the exports' npm ci, lint, typecheck, build
  23-gate-probe-*.txt, probe-gate.spec.ts.txt                            the phone-versus-drawer probe (the phone's sheet reads no day, the drawer one)
  24-newtest-on-fix-log.txt                                              the four new tests and two existing stale tests on the fix (first run)
  30-diffstat.txt, 30-diff-check.txt                                     the change; git diff --check
  30-mut-*-log.txt, 31-*, 32-mutants.txt                                 the mutants, their restore (byte-equal) and the reading of each
  40-newtests-repeat20-log.txt                                           the new tests --repeat-each=20 --workers=6 (80 passed)
  41-dayeditor-{desktop,mobile}-log.txt                                  the whole Day editor spec on both projects
  42-fix18-*-log.txt                                                     the new tests on the real clock (both projects) and at a Monday, a Saturday and a Sunday midday
  50-dist-*.txt, normcmp.mjs.txt                                         the dist/ comparison against a build of a5cbc91
  60-repo-*.txt, 61-*, 62-*, 63-*, 64-*                                  lint, typecheck, build, verify (smoke on SMOKE_PORT 51615) and git diff --check in the repository
  70-npmtest.txt, 70-heavy-exits.txt, 71-*, 72-*, 73-*                  npm test once in the export, the real-clock FULL e2e (desktop, mobile), the midnight seven-file run
  *.sh.txt, *.mjs.txt, *.ts.txt                                          the scripts (env, run-pw, mkfix, overlay, mutrun, census, digest3, weekdays, repo-checks, heavy, shiftclock, probe-now, digest-wt, normcmp, probe-gate, norm)
  Note: the shell-written text files were normalised after the runs by norm.sh.txt (LF, no colour codes, one final newline); the census files were CRLF before.
