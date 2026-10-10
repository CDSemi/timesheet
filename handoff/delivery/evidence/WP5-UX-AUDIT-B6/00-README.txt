WP5-UX-AUDIT-B6 evidence index (masked LF text; scripts stored as *.ts.txt / *.mjs.txt / *.py.txt / *.sh.txt; screenshots *-synthetic.png)

Identity and setup
  00-digest-before.txt        digest b7c011d2...a563 (793 files) in three forms before any check
  01-setup-clone.txt          scratch clone at bf954c0, base copy at 5e104e1, runtime rules, ports
  90-digest-after.txt         the same digest in three forms after all checks; process note (stray grep outputs in the clone root)
  env.sh.txt                  environment (Node 24 first on PATH, TEMP/TMP, DATA_DIR, DATABASE_PATH in the task folder)

Mandatory checks (scratch clone at bf954c0, Node v24.21.0)
  02a-npm-ci.txt              npm ci exit 0
  02b-typecheck.txt           npm run typecheck exit 0
  02c-lint.txt                npm run lint (typescript-eslint no-deprecated) exit 0
  03-npm-test.txt             npm test with --trace-deprecation --pending-deprecation: exit 0, 82 files, 1823 tests, 0 deprecation lines
  04-e2e-full-run1.txt        full e2e both projects, run 1: exit 1, 207 passed, 24 skipped, 1 failed (desktop automation.spec.ts:118,
                              "TypeError: fetch failed ... read ECONNRESET" from the test process to its private server; area A)
  04b-e2e-run1-failed-test-rerun-x3.txt   the failed test alone, --repeat-each=3: 3 passed, exit 0
  04c-e2e-run1-failure-trace-steps.txt    the trace steps of the failure (it failed on the first fetch after a 9.4 s job drain)
  05-e2e-full-run2.txt        full e2e both projects, run 2 (nothing else running): exit 0, 232 tests, 208 passed, 24 skipped, 0 failed
  05a/05b-e2e-counts-run*.txt per-project counts from the JSON reporter (run 2: desktop 103 + 13 skipped, mobile 105 + 11 skipped, 0 flaky)

Diffs, test strength, standards, docs
  10-diffstat-5e104e1-bf954c0.txt, 10a-names-...    FIX7: exactly 29 paths outside handoff/
  10b-5b349f8-handoff-only.txt                     5b349f8 touches handoff/ only
  10c-diffstat-014bd47-bf954c0.txt                 the whole round
  10d-business-boundary-014bd47-bf954c0.txt        src/server and src/domain: only src/domain/format.ts (+13), unchanged since earlier gates
  11-tests-numstat-014bd47-bf954c0.txt, 12-removed-test-hunks-014bd47-bf954c0.txt, 12b-removed-test-hunks-5e104e1-bf954c0.txt,
  13-test-strength.txt, 14-skip-added.txt          removed test lines judged one by one; no assertion removed or weakened
  20-css-scan.txt                                  token discipline of styles.css (css-scan.mjs.txt)
  46-AX-09-ok-token-contrast.txt                   --ok over every surface token, plain and under the selection tint (ok-contrast.mjs.txt)
  60-docs-parity.txt                               EN/VI structure, code spans, numbers, quoted strings (parity.mjs.txt)

New checks on 5e104e1 (base copy only)
  30-new-checks-on-5e104e1.txt                     keyboard-access.spec.ts + focus-ring.spec.ts of bf954c0 on the 5e104e1 build:
                                                   exit 1, 36 failed, 8 skipped (project-scoped), 2 passed (AX-09 dark, both projects)
  30a-new-checks-on-5e104e1-failure-reasons.txt    the failing assertion of each test (failures.mjs.txt)
  30b-5e104e1-copy-status.txt                      what was copied into the base copy

My probes (b6.probe.ts.txt, b6b.probe.ts.txt, b6c.probe.ts.txt, probe.config.ts.txt, run-probe.sh.txt; real key presses; own servers
on 48300-48319; synthetic accounts only)
  40-probe-runs.txt                                run logs (desktop 19 passed + 1 skipped, mobile 20 passed; P7/P9/P10 4 passed + 2 skipped; P11 x4)
  41-P1-walks-desktop-summary.txt, 41b-...-mobile  Tab and Shift+Tab walks of Timesheet, batch mode, Settings, shared view, Overtime,
                                                   History, Import, Review, day editor (with and without the session form), the editor
                                                   in an edit share, Admin; 1280/768 (desktop) and 390/320 (mobile), light and dark:
                                                   desktop 100 walks / 3628 stops, mobile 100 walks / 3692 stops, 0 entirely hidden,
                                                   0 without a ring, 0 rings under 3:1 (summarize.mjs.txt)
  41c/41d-P1-ring-sides-*.txt                      rings drawn on 4 sides at 3584 / 3616 stops, 3 or fewer at 44 / 58 (sides.mjs.txt)
  42-P2-P4-P5-P7-desktop-summary.txt, 42b-...-mobile, 42c-P7-P9-P10-summary.txt (summarize2.mjs.txt)
                                                   label picker, editor dialog stop, pressed toggles, date/time fields, switcher,
                                                   status messages, focus returns, text contrast, Check words/shapes, reflow and
                                                   targets, modal behaviour, desktop 2.5.8, AX-07 notices
  43-P3-names-desktop.txt, 43b-...-mobile          label in name over every button and link; 56 + 56 day-button names (names-summary.mjs.txt)
  44-/44b-P11-first-screen-*.json.txt              phone first screen with and without a received share, zone equal and zone note,
                                                   bf954c0 then 5e104e1 (WP5-UX-B6-01)
  45-P12-scrolling-dialogs.txt                     Clock out and batch review dialogs at 1280x600 and 320x640, light and dark; the
                                                   rendered inset ring of the scrolling Clock out dialog (ring-pair.mjs.txt)
  raw-*.json.txt                                   raw probe records (P2, P4, P6, P7, P9, P10, two P1 walk files, browser console)
Screenshots
  b6-first-screen-received-share-zone-note-390-bf954c0-synthetic.png, ...-5e104e1-synthetic.png, b6-first-screen-no-share-zone-note-390-bf954c0-synthetic.png
  b6-picker-active-option-1280-light/dark-synthetic.png, b6-editor-dialog-stop-390-light / -768-dark-synthetic.png,
  b6-switcher-choice-without-open-320-light-synthetic.png, b6-batch-rows-320-light-synthetic.png
Other scripts: mask.mjs.txt, copy-evidence.sh.txt, hunks.mjs.txt, counts.mjs.txt, trace_dump.py.txt, privacy-scan.mjs.txt
