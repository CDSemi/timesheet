WP5-UX-AUDIT-B2 evidence (area B re-audit of the WP5 UI redesign after the fix round)

Reviewed commit 589bcff5541a603abad696a3303dbea11cccb4a7; digest 8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e
(789 files, handoff/ excluded), equal before (01) and after (90) in three forms.
All text is masked LF: <task> = the task folder, <project> = the repository, <user> = the user profile. Synthetic data only.
Runs: a scratch clone at 589bcff and a scratch clone at 831f760, both in the task folder; Node v24.21.0 (portable);
Edge (Playwright channel msedge). Auditor probes ran on own built servers on 48001 (desktop) and 48002 (mobile); the
runtime deprecation check on 48003; the e2e fixture picks OS-free loopback ports. Every server was stopped through its
child handle (49, 08d).

01-digest-before.txt            digest at start: working repo (script), git ls-tree form, scratch clone (script)
02-typecheck.txt                npm run typecheck (exit 0)
03-lint.txt                     npm run lint, typescript-eslint no-deprecated (exit 0)
04-npm-test.txt                 npm test: 82 files, 1820 tests passed (exit 0)
05-e2e-full.txt                 npm run test:e2e: build + full Playwright suite, both projects (exit 0)
06-checks-summary.txt           exits and per-project counts: 174 tests, 164 passed, 10 skipped, 0 failed;
                                desktop 82 + 5 skipped, mobile 82 + 5 skipped (skips listed, all project-specific)
07-npm-ci.txt                   npm ci in the scratch clone (exit 0)
08-deprecation-summary.txt      lint, npm test, build with --trace-deprecation --pending-deprecation: 0 lines each
08a..08c                        the three logs
08d-runtime-deprecation.txt     built server with deprecation tracing (port 48003): 6 requests, 0 deprecation lines, SIGTERM
09-repo-state.txt               HEAD = origin/main = 589bcff; 0 paths outside handoff/ differ; coordinator files only
10-diffstat-831f760-589bcff.txt fix-round scope outside handoff/ (12 files)
10b-diffstat-014bd47-589bcff.txt whole round scope outside handoff/
11-tests-numstat-014bd47-589bcff.txt  every test file changed since 014bd47
12-tests-diff-831f760-589bcff.txt     fix-round test diff (only one import line removed, no assertion removed)
13-removed-test-lines-014bd47-589bcff.txt every removed test line since 014bd47 with hunk headers
14-client-tests-docs-diff-831f760-589bcff.txt the full fix-round diff of src/client, tests and docs
20-css-scan-831f760-589bcff.txt token scan: 0 literals outside the token blocks; added declarations with numbers are
                                structural only (grid placement, 0, 100%, flex 1, min-width 0)
21-css-scan-014bd47-589bcff.txt same scan against the whole round diff
30-new-assertions-on-831f760-summary.txt / 30a  the 589bcff spec files on the 831f760 client: the 7 new fix-round
                                assertions FAIL there (B-01 x2: 910.2 / 1046.6 > 788.5; B-02 768/1024: "Clock in" focused
                                entirely under the panel after 19 Tab presses; B-02 1280: Escape from the sheet left the
                                editor open; tab order x2: Next not focused after Previous); the B-03 test passes (unchanged
                                Admin behaviour)
31-b03-mutation-summary.txt / 31a / 31b  Admin view mutated to show an "Import a workbook" heading (scratch only, restored):
                                the 589bcff test fails on desktop and mobile at line 389; the 831f760 test passes on desktop
40-probe-runs.txt               auditor probe runs (the first run had 3 probe-script errors, fixed and rerun; see the file)
41 / 41b                        PB1 phone 390x844 first screen in 6 states, zone equal and zone note
42 / 42b                        PB2 full Tab sequence with positions, mobile and desktop
43 / 43b / 43c                  PB3 widths 390/360/320 (scroll, overflow, 44px), PB3b the "Open a day" field with a value,
                                PB3c the clocked-in clock card
44-PB4-editor-modes.txt         PB4 768/1024/1199/1200/1280: modal, overlap, hit test, 160-press walk, Escape, focus return,
                                resize while open
45-PB5-nested-escape.txt        PB5 1280: Escape in a label picker and in a review dialog leaves the editor open
46 / 46b                        PB6 period bar positions and Tab order, desktop and mobile
47-PB7-contrast-phone.txt       PB7 rendered contrast of the compact phone text, light and dark
48-PB8-review-phone.txt         PB8 the Review sheet header on a phone
49-probe-console-server-stop.txt browser console (only the pre-sign-in 401), server stop records
49b..49f                        the same phone probes on the 831f760 client (first screen and field widths, for comparison)
50-docs-parity.txt              EN/VI structural parity of docs 04, 10, 12 (docs/10 is offset by its translation note line)
51-docs-grep.txt                docs statements about the editor modes and the phone first screen
52-review-en-vi-parity.txt      whole-document parity of WP5_UX_REVIEW_B2.md and .vi.md (headings, table rows, bullets, code
                                spans equal; two number tokens explained by the translation-note link)
90-digest-after.txt             digest after all checks, three forms
91-digest-final.txt             digest again after the report was written (working repository), unchanged; repo status

Scripts (as .txt): env.sh, run-checks.sh, run-831.sh, run-b03-mutation.sh, run-probe.sh, run-probe-831.sh,
run-deprecation.sh, css-scan.mjs, parity.mjs, parity-doc.mjs, runtime-deprecation.mjs, mask.mjs, count-cr.mjs
(every evidence .txt and the review pair: 0 CR bytes), ux2.probe.ts, probe.config.ts.

Screenshots (synthetic data):
pb1-phone-zone-equal-clocked-in-synthetic.png   phone 390x844, first day row above the tab bar while clocked in
pb1-phone-zone-note-clocked-out-synthetic.png   phone 390x844 with the zone note (first row bottom 758 vs tab bar 788)
pb4-editor-w1024-synthetic.png                  1024px: modal side panel with scrim, page inert
pb4-editor-w1200-synthetic.png                  1200px: non-modal panel in its own column beside the sheet
pb6-period-bar-desktop-synthetic.png            desktop period bar: < period > Review & sign off
pb3b-open-day-w360-synthetic.png                WP5-UX-B2-01: the date value clipped at 360px ("10/09/202")
pb3b-open-day-w320-synthetic.png                WP5-UX-B2-01: the date value clipped at 320px ("10/0")
831f760-pb3b-open-day-w320-synthetic.png        the same field at 831f760, 320px: full date on its own row
