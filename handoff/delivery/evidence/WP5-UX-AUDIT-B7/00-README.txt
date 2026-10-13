WP5-UX-AUDIT-B7 attempt 2 evidence (area B delta recheck of 255ba17), 2026-10-13, auditor self-reported claude-opus-5-5.
All text is masked LF (user-profile paths -> <user>, any non-example.invalid address -> <email>); scripts are stored as *.txt.
Task folder (not in the repository): D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B7-2. Ports used: 48420-48423 (probe servers),
OS-chosen loopback ports for the e2e harness. Scratch clone "clone" at 255ba17 and base copy "base" at bf954c0 inside the task folder;
probe files and scratch spec copies excluded through .git/info/exclude in those copies only.

Environment: Git Bash, portable Node v24.21.0 first on PATH, npm-cli.js from the user npm on Node 24, Microsoft Edge (Playwright channel msedge).
NODE_OPTIONS=--trace-deprecation --pending-deprecation for typecheck, lint, npm test and the full e2e. TEMP/TMP = task folder.

Index
00-digest-before.txt            digest first (18:57:10Z): ls-tree form at 255ba17 and HEAD, scripts/source-digest.mjs in the repository; HEAD = origin/main = 255ba17
00b-digest-clone-before.txt     scripts/source-digest.mjs in the scratch clone at 255ba17
01-node.txt                     node --version (first shell call)
02-head-status-before.txt       HEAD, origin/main, log, git status (only handoff/ entries)
02a-npm-ci.txt .. 02c-lint.txt  npm ci, npm run typecheck, npm run lint in the clone (exit 0 each)
03-npm-test.txt                 npm test: 82 files, 1823 tests, exit 0
04-e2e-full-run1.txt            npm run test:e2e (build + full suite, both projects): exit 1, 204 passed, 6 failed, 26 skipped
04a-e2e-run1-counts.txt         per project: desktop 100 passed / 3 failed / 15 skipped; mobile 104 / 3 / 11
04b-e2e-run1-failed-rerun-255ba17.txt  the 3 failing tests x 2 projects rerun at 255ba17: 6 failed, same locator
04c-e2e-same-tests-bf954c0.txt  the same tests on the bf954c0 build: 6 failed, same locator (pre-existing)
04d-e2e-failure-context.txt     displayed period 09/28-10/11 (due Tue 10/13 17:00 LA) versus the seeded day 2026-10-12; helper analysis
04e-e2e-fixcheck-displayed-period.txt  scratch copies using displayedPeriodFreeWorkdays(): 6 passed at 255ba17 in the same window
04f-fixcheck-scratch-diff.txt   the one-line difference of each scratch copy
10-delta-bf954c0-255ba17.txt    diff --stat/--numstat/--name-status and full diff outside handoff/
10b-commit-255ba17.txt, 10c-log-bf954c0-255ba17.txt, 10d-tests-removed-lines.txt (0 removed test lines)
20-css-scan.txt                 token scan of styles.css at 255ba17 and bf954c0 (css-scan.mjs.txt)
30-new-tests-on-bf954c0.txt     the two new FIX8 tests (scratch copy of the 255ba17 sharing.spec.ts) on the bf954c0 build: both fail (812.8 > 788.5; 106.8 > 60)
30a/30b                         base copy npm ci and build
40-probe-run-*.txt              every probe run log (including the two probe-side failures explained below)
41-probe-servers-stopped.txt    every probe server stopped through its own handle (SIGTERM)
50 / 50b                        P1 first screen, 255ba17 / bf954c0 (four states x light/dark at 390x844 plus 375/360/320 information)
51 / 51b                        P2 switcher items at 767 (desktop and mobile), 640 (desktop = 1280 at 200%), 390/375/360/320 (mobile), light/dark, both snapshots
51c / 51d                       P2t touch/pointer Open in fresh pages (desktop, mobile)
51e / 51f                       P2s shared view switcher (owner chosen), 255ba17 / bf954c0
52 / 52b                        P3 Tab and Shift+Tab walks (Timesheet, day editor, shared view-only and edit), desktop 767 and mobile 767/390/320
52c                             P3b rendered rings around the switcher select and Open (focused versus unfocused screenshots)
53                              P4 computed styles of every element and shell bar screenshots at 768/1024/1280 (desktop) and 768 (mobile): bf954c0 versus 255ba17
54 / 54b                        P5 width sweep 300..420 (one-row threshold, sideways scroll, select text fit), 255ba17 / bf954c0
55                              P6 320x256 (1280x1024 at 400%) on both snapshots
56 / 56b                        P7 sideways detector: the e2e expression scrollWidth <= innerWidth with a forced 600px overflow (mobile, desktop)
60-docs-unchanged.txt           no docs change in the delta; docs/04 line 48 and line 80 EN and VI
90-digest-after.txt             digest after all checks (19:36:18Z), three forms, equal
raw-p1-first-screen-255ba17.json.txt  raw P1 measurements
b7.probe.ts.txt, probe.config.ts.txt, run-probe.sh.txt, sum-*.mjs.txt, cmp-p4.mjs.txt, css-scan.mjs.txt, e2e-counts.mjs.txt, mask.mjs.txt, copy-evidence.sh.txt
*-synthetic.png                 screenshots (synthetic accounts and data only)

Process notes (no tracked file touched by any of them)
- My first shell listing was written to D:\.claude-tmp\timesheet\ls-tasks.txt (outside the task folder); I moved it into the task folder at once.
- Probe artefact: the first two P2 versions reused one mobile page across widths after a 200% step; the stale zoomed-out visual viewport made
  Playwright's tap hit the select (runs c255-p2, c255-p2b). In fresh pages (P2t and the final P2 c255-p2c) every tap and click on Open works.
- Probe defect: the first P4 run named screenshots *.png.bin, which Playwright refuses; renamed *-synthetic.png and rerun (c255-p4, bbf9-p4).
- One check used head -c on a file (no pipe) for a scratch look at 60-docs-unchanged.txt.
