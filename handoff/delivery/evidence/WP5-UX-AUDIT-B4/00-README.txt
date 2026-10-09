WP5-UX-AUDIT-B4 evidence (area B recheck of WP5 at edaaa852370128ca9bdf206d730f3849346ba994)

Auditor: self-reported model claude-opus-5-5, fresh context, 2026-10-09 (UTC 11:07Z to about 11:50Z).
All text is masked LF text: <task> = the task folder D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B4, <project> = the
repository, <user> = the user profile. Scripts are stored as *.txt. Screenshots are synthetic data only.
Runtime: Git Bash, Node v24.21.0 (portable), Edge (Playwright channel msedge). Own probe servers on 48130/48131 and
48132 (old-DayEditor control) and 48134 (runtime deprecation check); the repository e2e fixture picks OS-free
loopback ports as in every earlier gate. DATA_DIR and DATABASE_PATH inside the task folder for every server/CLI run.

Digest
  00-digest-before.txt     digest b7bbcbc0...a873 (789 files) before any check: ls-tree form, repository script, clone
  90-digest-after.txt      the same three forms after all checks (equal)
  91-digest-final.txt      after writing the report: unchanged; only handoff/ paths differ in the working repository
  01-setup-clone.txt       scratch clone at edaaa85, git status empty, npm ci exit 0 (01a-npm-ci.txt)

Mandatory checks (scratch clone at edaaa85; run-checks.sh.txt)
  02-typecheck.txt 03-lint.txt 04-npm-test.txt 05-e2e-full.txt 05a-e2e-counts.txt 06-checks-summary.txt
  typecheck 0, lint 0, npm test 0 (82 files, 1820 tests), test:e2e 0 (186 tests: 170 passed, 16 skipped, 0 failed;
  desktop 84 + 9 skipped, mobile 86 + 7 skipped; every skip project-scoped)
  07-*.txt                 deprecation tracing (lint, npm test, build, built server): 0 deprecation lines
  08a/08b                  npm audit: all deps 1 high (source-map-js, dev only); --omit=dev 0 (information, area A/gate)

FIX5 and the round
  10-*.txt                 diffstat and diff a2ea7a4..edaaa85 (6 files), diffstat 014bd47..edaaa85
  11-*, 12-*, 13a-13d      test files changed since 014bd47, every removed test line, context diffs (strength review)
  14-only-skip-fixme-scan  no .only/fixme; every test.skip is project-scoped

Tests fail on the old behaviour (scratch copies only; setup-variants.sh.txt, run-variants.sh.txt)
  30-variants-setup.txt, 30a (clone-old: DayEditor.tsx from a2ea7a4), 30b (clone-o5: 589bcff open-day rules and the
  date-field test made soft), 30c run summary
  31-new-b3-01-tests-on-a2ea7a4-dayeditor.txt   the two new B3-01 tests: 2 failed (review focus false, onTop false)
  32-o5-soft-assertions-on-589bcff-rules.txt    O-5 replacement fails at 360 (116.23 < 117.89) and 320 (76.23 < 117.89)

Probes (ux4.probe.ts.txt, probe.config.ts.txt, run-probe.sh.txt)
  40-probe-runs.txt and 40a-40f logs (run 1 had a probe bug in Q2, fixed in run 2; Q9 first attempt had a probe
  sign-in bug, fixed in 40f)
  45-Q1-Q2-B3-01-resize-edaaa85.txt   digest of Q1 S1-S6 and Q2 (46a-47c raw JSON)
  45b-Q1-Q2-old-dayeditor-control.txt + 40c   the same probe on the a2ea7a4 DayEditor: Q1 7 of 7 fail, Q2 3 of 3 pass
  41-R7-open-day-and-budget.txt       Q3/Q3b (48a-48c raw JSON)
  49-Q4-phone-targets.json.txt        44px, reflow and bottom sheet at 390/375/360/320
  44-Q5-Q7-tab-order-contrast-carried.txt   Tab order, text contrast, focus ring (WP5-UX-B4-01), carried items
  49a-49p                             raw JSON of Q5-Q9, browser console (only pre-sign-in 401), servers stopped
  50-w3c-understanding-1411-excerpt.txt     W3C Understanding SC 1.4.11 (WCAG 2.2) on focus indicators

UI standards and docs
  20-css-scan-014bd47-edaaa85.txt, 21-css-scan-a2ea7a4-edaaa85.txt, 22-fonts-csp-inline.txt
  60-docs-parity.txt, 61-docs-and-source-lines.txt, 62-docs-10-12-08-round-diff.txt
  62b-review-en-vi-parity.txt (doc-parity.mjs.txt: headings, table rows, bullets and code spans equal; numbers differ
  only by the translation-note link), 63-count-cr.txt (count-cr.mjs.txt: 0 CR in the review pair, the brief and this folder)

Screenshots (synthetic)
  edaaa85-q1-s1-review-on-top-w1024, edaaa85-q1-s1-after-first-escape-w1024, edaaa85-q1-s3-review-on-top-w768,
  edaaa85-e2e-fix5-review-on-top-w1024 (B3-01); edaaa85-q3-open-day-zone-note-w375, edaaa85-q3-open-day-zone-equal-w320,
  edaaa85-q3b-value-w115 (last digit cut) and -w117 (whole) (R-7, O-5); edaaa85-q6-focus-ring-clock-light,
  edaaa85-q6-focus-ring-sheet-date-light (WP5-UX-B4-01); edaaa85-e2e-period-mobile-zone-note (WP5-UX-B4-02);
  edaaa85-q4-phone-w320-review; edaaa85-q9-name-42-zone-note.
