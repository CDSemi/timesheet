WP5-UX-AUDIT-B3 evidence (area B recheck of the WP5 UI redesign on the final snapshot)

Reviewed commit a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb; digest 0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d
(789 files, handoff/ excluded), equal before (00) and after (90, 91) in three forms. Decision: FIX REQUIRED
(WP5-UX-B2-01 closed; new Low findings WP5-UX-B3-01 and WP5-UX-B3-02). Report: handoff/delivery/WP5_UX_REVIEW_B3.md (+ .vi.md).
All text is masked LF: <task> = the task folder, <project> = the repository, <user> = the user profile. Synthetic data only.
Runs: a scratch clone at a2ea7a4 ("clone"), a scratch clone at 589bcff with the a2ea7a4 timesheet.spec.ts ("V1"), and a scratch
clone at a2ea7a4 with only the 589bcff phone "Open a day" rules put back ("V2", tokens kept), all in the task folder; Node v24.21.0
(portable); Edge (Playwright channel msedge). Auditor probes ran on own built servers: a2ea7a4 48060 (desktop) / 48061 (mobile),
589bcff 48062/48063, V2 48064/48065; runtime deprecation check 48066; the e2e fixture picks OS-free loopback ports. Every server was
stopped through its child handle (40, 07d).

00-digest-before.txt            digest at start: git ls-tree form and the working repository (script)
01-setup-clone.txt / 01a        scratch clone at a2ea7a4 (git status empty, digest by script), npm ci (exit 0)
02-typecheck.txt                npm run typecheck (exit 0)
03-lint.txt                     npm run lint, typescript-eslint no-deprecated (exit 0)
04-npm-test.txt                 npm test: 82 files, 1820 tests passed (exit 0)
05-e2e-full.txt                 npm run test:e2e: build + full Playwright suite, both projects (exit 0)
06-checks-summary.txt           exits and per-project counts: 180 tests, 167 passed, 13 skipped, 0 failed;
                                desktop 82 + 8 skipped, mobile 85 + 5 skipped (skips listed, all project-scoped)
07-deprecation-summary.txt      lint, npm test, build with --trace-deprecation --pending-deprecation: 0 lines each; runtime 0
07a..07d                        the four logs (07d: built server on 48066, 6 requests, SIGTERM)
09-repo-state.txt               HEAD = origin/main = a2ea7a4; 0 paths outside handoff/ differ; no unpushed commit
10-diffstat-589bcff-a2ea7a4.txt FIX4 scope outside handoff/ (5 files); 10a the full FIX4 diff (DayEditor: comment only)
10b-diffstat-014bd47-a2ea7a4.txt whole round scope outside handoff/
11-tests-numstat-014bd47-a2ea7a4.txt  every test file changed since 014bd47 (and the FIX4 test change: +27, -0)
12-removed-test-lines-014bd47-a2ea7a4.txt every removed test line since 014bd47 with hunk headers
13a / 13b / 13c                 context diffs used to judge each removed or replaced assertion
20-css-scan-589bcff-a2ea7a4.txt token scan with the FIX4 styles diff: 0 literals outside the token blocks; 2 new tokens
21-css-scan-014bd47-a2ea7a4.txt same scan with the whole round diff; 21a groups the added declarations with numbers (structural)
30-weak-assertion-summary.txt   FIX4 assertions on the 589bcff behaviour: V1 3 failed (390 only because the token is absent),
                                V2 390 passed, 360 and 320 failed; the clip sub-assertion reads 114/114 and 74/74 on clipped
                                values (O-5). In 41/41b the 589bcff "token" column is the viewport width because the token
                                does not exist there (an unresolved var() leaves the probe div full width)
30a / 30b / 30c                 V1 and V2 Playwright output, the V2 mutation diff (scratch only)
40-probe-runs.txt               all probe runs (logs), server stop records, browser console (only the pre-sign-in 401)
41-PC1-PC2-PC10-summary.txt     tables: "Open a day" field per width/value (a2ea7a4, 589bcff, V2), first-screen budget per state,
                                grantee first screen
41a / 41b / 41c                 PC1 raw: the field, label, button and row boxes per width and value
42a..42d                        PC2 raw: phone 390x844 first screen in 7 states + 375/360/320 loads, zone equal and zone note,
                                a2ea7a4 and 589bcff
43-PC3-phone-widths.txt         390/360/320: default, field filled, batch, editor open (content loaded), Review: scroll,
                                overflow, small targets
44a / 44b                       PC4 full Tab sequence desktop (1280) and phone (390, 320 with the field filled)
45-PC5-editor-modes.txt         768/1024/1199/1200/1280: modal, overlap, hit test, 160-press walk, Escape, Close, focus return,
                                resize while open
46-PC6-nested-escape-and-A2-R2.txt  1280 nested Escape (pass) and the 1280 -> 1024 resize with a review open (WP5-UX-B3-01)
47a / 47b                       PC7 period bar positions and Tab order
48a / 48b                       PC8 rendered text contrast (light, dark) and focus ring contrast (R-1)
49-PC9-review-phone.txt         Review on a phone: form title hidden, h1, ISO header line (R-2), no sideways scroll
50a / 50b / 50c                 PC10 / PC10b grantee on a 390x844 phone: view and edit shares, zone equal and zone note (A2 R5)
51-PC11-open-day-outside-period.txt "Open a day" with 2026-04-06 opens the editor; no min/max (WP5-UX-B3-02)
52-PC12-status-phone.txt        status words and shapes on the phone sheet
53-PC13-phone-bottom-sheet.txt  phone bottom sheet at 390 and 320: modal, 86%, 120-press walk, Escape/Close focus return
60-docs-parity.txt              EN/VI parity: docs/04 whole file; round sections of docs/10 and docs/12
61-docs-and-source-lines.txt    docs/04 lines 9, 48, 55, 59 (EN/VI where relevant), OpenDay.tsx, DayEditor.tsx:83-109, O-3 grep
62-review-en-vi-parity.txt      WP5_UX_REVIEW_B3.md vs .vi.md: only line-wrap shifts and the translation-note link differ
63-count-cr.txt                 CR byte count of every evidence .txt file and the review pair (all 0)
90-digest-after.txt             digest after all checks, three forms (ls-tree, working repository, scratch clone)
91-digest-final.txt             digest again after the report and Results were written (working repository), repo status

Scripts (as .txt): env.sh, setup-clone.sh, run-checks.sh, run-weak.sh, mutate-openday.mjs, run-probe.sh, ux3.probe.ts (final
version; earlier runs lacked the PC3 content wait, the PC6 focus details, PC10b and PC13, each rerun after the change),
probe.config.ts, summarize.mjs, css-scan.mjs, parity.mjs, run-deprecation.sh, runtime-deprecation.mjs, mask.mjs, count-cr.mjs.

Screenshots (synthetic data; names end in -synthetic.png):
a2ea7a4-pc1-open-day-value-w390/w375/w360/w320   the field with "10/09/2026" whole at each width (B2-01 closed)
589bcff-pc1-open-day-value-w360 / -w375          589bcff: clipped at 360px; whole at 375px with 131.2px (R-7)
a2ea7a4-pc2-phone-zone-equal-load / zone-note-load  390x844 first screen, first day row above the tab bar
a2ea7a4-pc5-editor-w1024                         1024px modal side panel with scrim
a2ea7a4-pc6-r2-shrink-review-open-w1024          WP5-UX-B3-01: the editor re-shown above the review dialog after the resize
a2ea7a4-pc6-r2-after-first-escape-w1024          WP5-UX-B3-01: after the first Escape the review remains, focus on BODY
a2ea7a4-pc10b-grantee-edit-zone-note             A2 R5: grantee edit share with the zone note, first row below the tab bar
a2ea7a4-e2e-sheet-desktop-light                  the desktop sheet in the Excel form (from the full e2e run)
