WP5-UX-AUDIT-B5 evidence index (masked LF text; scripts as *.mjs.txt / *.ts.txt / *.sh.txt; screenshots *-synthetic.png)
Reviewed commit 5e104e14dad71268a9185920c04ed0ee2a4b31c2; digest 07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635.
Masks: <task> = the task folder, <project> = the working repository, <user-home>/<user> = the user profile. Data are synthetic.

Identity and setup
  00-digest-before.txt            digest recorded first (two forms in the working repository)
  01-setup-clone.txt              scratch clone, third digest form, runtime, mutation copies
  90-digest-after.txt             digest after all checks, three forms, no change outside handoff/

Mandatory checks
  01a-npm-ci.txt  02-typecheck.txt  03-lint.txt  04-npm-test.txt  05-e2e-full.txt  05a-e2e-counts.txt  06-checks-summary.txt
  07-deprecation-summary.txt  07a-deprecation-lint.txt  07b-deprecation-npm-test.txt  07c-deprecation-build.txt

Fix round and test strength
  10-diffstat-edaaa85-5e104e1.txt, 10a-diff-edaaa85-5e104e1-without-new-spec.txt   FIX6 diff outside handoff/
  10b-names-014bd47-5e104e1.txt                                                     round scope (68 paths)
  11-tests-numstat-014bd47-5e104e1.txt, 12-removed-test-lines-014bd47-5e104e1.txt  test changes and removed lines
  13-test-strength.txt                                                              judgement of every removed/replaced assertion
  13a..13d-*.txt                                                                    context diffs
  14-only-skip-fixme-scan.txt                                                       only/fixme/skip scan
  30-mutation1-edaaa85-tokens.diff.txt, 31-focus-ring-on-edaaa85-tokens.txt         new check on the edaaa85 tokens: 4 of 4 fail
  32-mutation2-sheet-date-ring.diff.txt, 33-focus-ring-sheet-date-mutation.txt      one-rule regression: desktop fails, phone passes

UI standards and docs
  20-css-scan.txt                 token scan of styles.css (css-scan.mjs.txt)
  60-docs-parity.txt              EN/VI parity of docs/04, docs/10 (2026-10-08 section), docs/12 (parity.mjs.txt)

Probes (b5.probe.ts.txt, probe.config.ts.txt, run-probe.sh.txt; own servers on 48200-48205)
  40-probe-runs.txt               run list with exit codes; 40a-40d run logs (run 1 superseded, runs 2 and 3 used)
  41-P1-tab-walks-summary.txt     Timesheet page: forward, backward (Shift+Tab) and batch walks, light/dark, desktop/phone
  41a-aggregate.txt               rendered ring ratios per control group (aggregate.mjs.txt)
  42-P2-editor-walks-summary.txt  day editor 1280 / 1024 / 390, forward and backward, focus on open and after Escape
  43-P3-label-picker-dialogs-summary.txt   label picker trigger, open list (active option), label review and Clock out dialogs
  44-P4-other-screens-summary.txt Review, Overtime, History, Settings walks
  45-P5-reflow.json.txt           390/375/360/320: sideways scroll, overflow, controls under 44px in 6 states
  46-P6-zone-names-contrast.json.txt  zone note (B4-02), day names, Check words and shapes, rendered text contrast
  47-P7-hover.json.txt            hover over a keyboard-focused control (R-10)
  48a-P8-sticky-dialog-date.txt   Shift+Tab from the end of the sheet (B5-01), dialog stop (B5-03), date input (sticky.mjs.txt)
  49-P9-followups.json.txt        date input by Shift+Tab, Clock out dialog, edge clipping, phone batch crops, tap-target filter
  49c-browser-console.json.txt    browser console warnings/errors of the probes
  49s-probe-servers-stopped.json.txt  every probe server stopped through its child handle (SIGTERM)
  raw-*.json.txt                  raw probe records of runs 2 and 3
  summarize.mjs.txt, detail.mjs.txt, mask.mjs.txt, copy-evidence.sh.txt  helpers

Screenshots (synthetic data)
  b5-sticky-hidden-desktop-{light,dark}            focus on "Edit 2026-10-04" entirely under the sticky top bar (B5-01)
  b5-sticky-hidden-phone-{next-period,edit-date}   phone: focused control entirely under the compact bar (B5-01)
  b5-editor-head-hidden-phone-{wfh,confirm-breaks} bottom sheet: focused control under the sticky editor head (B5-01)
  b5-label-list-{light,dark}                       open label picker, "Off" active with the faint tint only (B5-02)
  b5-editor-dialog-focused-1024-light              focus on the editor <dialog> itself, nothing drawn (B5-03)
  b5-zone-note-{desktop,phone}                     zone note "Wed 10/14/2026, 07:00" (B4-02)
  b5-open-a-day-shift-tab-desktop, b5-open-a-day-tab-phone   date input focus (R-12)
  b5-phone-batch-edit-crowding                     ring next to the label text in phone batch mode (R-15)
  b5-e2e-sheet-{desktop-light,desktop-dark,mobile-light}   sheet screenshots of the auditor's full e2e run (E-1..E-7)
