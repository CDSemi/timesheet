WP5-UX-FIX7 - evidence index (implementer, fix, attempt 1; synthetic data only)

Base: HEAD = origin/main = 5b349f8f72c051f5bee3f4fe80855c941e6d9f12 (handoff-only commit after 5e104e1); source digest before
any edit 07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 files, handoff/ excluded) = the digest of
5e104e1. Node v24.21.0 (portable, first on PATH). Paths are masked: <task> = the task folder outside the repository,
<project> = the working repository, <home>/<user>. Raw logs, JSON and all screenshots stay in <task>.

Files
  01-digest-before.txt            scripts/source-digest.mjs output before any edit (exit 0)
  02-base-export-build.txt        scratch copy of 5e104e1 (git archive + node_modules copied, no install), build, new checks copied in
  03-repro-base-run1.txt          the new checks on 5e104e1: 40 failed, 8 passed, 6 skipped (exit 1)
  03b-repro-base-run2.txt         AX-01/AX-03/AX-10 rerun on 5e104e1 after their selectors became name-independent: 10 failed (exit 1)
  03c-repro-base-r12.txt          the R-12 date-field check on 5e104e1: fails on desktop (exit 1); second run desktop-only
  04-typecheck-lint-test.txt      typecheck / lint / npm test on the fixed tree (first typecheck failed on DOM names in the
                                  new spec; second: exit 0 / 0 / 0, 82 files, 1823 tests)
  06-new-checks-fixed-run1.txt    new checks on the fixed build, run 1 (6 failed: test-side mistakes and the sweep's --ok value)
  06b-new-checks-fixed-run2.txt   new checks on the fixed build, run 2: 48 passed, 6 skipped, exit 0
  07-fixed-export-build.txt       clean export of the fixed tree for the probe (git archive HEAD + fixed src/tests/docs), build
  07-selfcheck-run-s1.txt         the sweep's probe on the export: 1280/768/390/320 x light/dark + fix7-shots, 9 passed, exit 0
  11-selfcheck-summary-s1.txt     per state and walk (summarize.mjs)
  12-selfcheck-hidden-norings-s1.txt  hidden stops (none) and stops without a measured ring (date/time fields only: measurement limit)
  13-selfcheck-fix7-shots.json.txt    notes of the screenshot test (focus states, 320px bar height, 768px sticky geometry)
  14-diag-date-field-focus.txt    task-folder diagnostics: a date field after Shift+Tab matches only :focus-within; the ring
                                  timing; blur() leaves the field focused (why the probe's blurred image equals the focused one)
  08-e2e-full-run1.txt            full e2e run 1 (exit 1: two 44px regressions of mine, one artifact-folder clash with a parallel run)
  08b-e2e-full-run2.txt           full e2e run 2 (exit 1: only the R-12 check, first :focus version of the rule)
  08c-e2e-full-run3-final.txt     full e2e run 3 on the final source: 208 passed, 24 skipped, 0 failed, exit 0
  08d-…                           the same suite repeated with a JSON report for per-project counts
  30-preflight.txt                validate_package.py --preflight with the workflow Python: PASS, exit 0
  60-docs-parity.txt              docs/04 EN/VI change (line 48 only) and parity
  70-privacy-grep.txt             user-profile paths and e-mail addresses in the changed files and this folder
  40-verify.txt                   npm run verify (SMOKE_PORT 48262, DATA_DIR and DATABASE_PATH inside <task>)
  50-digest.txt                   npm run digest (the last command)
  scripts                         sweep.probe.ts.txt (the sweep's probe; day button by data-day, "End share with", switcher
                                  combobox, ports 48260/48261, + fix7-shots), sweep.config.ts.txt, hidden.mjs.txt,
                                  summarize.mjs.txt, mask.mjs.txt, run-selfcheck.sh.txt, copy-evidence.sh.txt, env.sh.txt,
                                  privacy-grep.sh.txt, counts.mjs.txt
  fix7-*-synthetic.png            eight screenshots of synthetic data (picker active option light/dark, pressed toggle focus,
                                  Shift+Tab stop at 390, editor dialog ring at 390, switcher + Open at 320, batch rows at 320,
                                  sticky share bar under the shell bar at 768)
