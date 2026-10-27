WP5-UX5-PLAN-FIX7A evidence index (masked LF text; <task> = D:\.claude-tmp\timesheet\WP5-UX5-PLAN-FIX7A, <repo> = the repository, <user> = the profile name).
Planner: claude-sonnet-5-5 (timesheet-planner). Target: HEAD f4049aa7905e22f1467dfcae4208675cb2fc8e80. Probes ran in a scratch export of that commit
(<task>/export), never in the repository; ports 50340-50359 by a scratch patch of freePort in the export's fixtures.ts; real clock; synthetic data only.

Proposed edits (complete)
  diff-src.txt        src/client/styles.css, TimesheetScreen.tsx, ReviewScreen.tsx, components/SignoffDialog.tsx against HEAD
  diff-tests.txt      tests/e2e review, day-editor, classic-scrollbar, timesheet, keyboard-access, hover specs against HEAD

Reproductions (HEAD) and checks of the fix
  obs-sigbase.txt / sum-sigbase.txt     F-UX5A-1 before: signed, reloaded Review at 11 widths, light and dark (full JSON and one compact line per row)
  obs-sigfix.txt, obs-sigfix2.txt / sum-sigfix2.txt   after (sigfix: --sig-content-min 9rem; sigfix2: 10rem, the proposal)
  obs-namebase.txt / obs-namefix.txt    F-UX5A-2: the name of the Change days button by Chrome's accessibility tree and Playwright, before and after
  obs-touchbase.txt                     F-UX5A-3 before: swipe, tap, tap with edits, week card scrollbar press (classic scrollbars)
  obs-touchfix.txt (no focus fix), obs-touchfix2.txt, obs-touchfix3.txt (the proposal)   after
  obs-legend.txt                        the sub-pixel case that made the first scrollbar rule too broad
  20-runs.txt                           every Playwright run: command, counts, exit (regression runs, mutation/negative-control runs, the final runs)
  02-ci-rc.txt, 02-typecheck-final.txt, 02-lint-final.txt, 03-npmtest-final.txt, 04-build-final2.txt   checks in the scratch export with all proposed edits
Screenshots (6, synthetic): f7a-sig{base,fix2}-sig-{390-light,768-light,320-dark}-synthetic.png
Sources: zz-src-*.txt (probe specs, summariser, collector, environment and runner scripts)

Mutation and negative controls (in 20-runs.txt): mut-sig (F-UX5A-1 test on the unfixed CSS fails), mut-touch and mut-cls (F-UX5A-3 tests on the unfixed
TimesheetScreen fail), mut-name (the F-UX5A-2 assertion on the unfixed build fails), r3-m2 (the new ladder test fails on the auditor's mutant M2; r3-m2b: the old
ladder test still passes under M2). reg-* are the first regression runs (reg-de: 1 failed, the legend point, fixed by the "scrolls" condition; reg-ts and reg-ka:
the F-UX5A-2 name assertions, adjusted); fin-ts and fin-hover show the two 320px name failures found late, fixed in fin-ts2 and fin-hover2.
