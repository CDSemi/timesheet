WP5-UX-AUDIT-B evidence (area B: owner-request fidelity, test strength, accessibility, UI standards, docs)
Reviewed commit 831f760838950a59f0e5c880f0bbefda15fe0c61; digest 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9
(789 files, handoff/ excluded), equal before and after. Decision: FIX REQUIRED (WP5-UX-B-01..B-04).

Method: scratch clone of the repository at 831f760 in the task folder <task>\clone (Git Bash, Node v24.21.0 portable,
TEMP/TMP, DATA_DIR and DATABASE_PATH inside <task>). Raw output stayed in <task>; the files here are masked copies
(task folder -> <task>, user profile -> <user>, e-mail addresses -> <email>, the seed's generated dev password -> <masked>),
ANSI codes removed, LF line endings. Auditor probes ran from <task>\clone\audit-probe (excluded through .git/info/exclude,
so `git status --short` stayed empty and the digest unchanged); they are copied here as *.ts.txt / *.mjs.txt.

01-digest-before.txt            digest before (ls-tree form and source-digest.mjs in the clone)
02-typecheck.txt                npm run typecheck, exit 0
03-lint.txt                     npm run lint (typescript-eslint no-deprecated), exit 0 (run before any probe file existed)
04-npm-test.txt                 npm test, exit 0, 82 files / 1817 tests
05-e2e-full.txt                 npm run test:e2e, exit 0, 160 tests: 155 passed, 5 skipped (desktop 77+3, mobile 78+2)
06-checks-summary.txt           exit codes and UTC start/end of the four mandatory checks
07-npm-ci.txt                   npm ci in the clone, exit 0
08-deprecation-summary.txt      lint/test/build with --trace-deprecation --pending-deprecation: 0 deprecation lines.
                                The first lint line "exit=1" is 08a: eslint also parsed my own probe files in audit-probe/
                                (not reviewed source); 08b is the rerun with --ignore-pattern audit-probe/, exit 0.
08a..08d                        raw outputs of those runs
09-runtime-probe.txt            built server with deprecation tracing (port 47930), Edge desktop/1024px/phone; 0 server and
                                0 browser deprecation messages, 0 page errors; server stopped through its child handle
10-diffstat-014bd47-831f760.txt paths changed since the accepted WP5 commit (outside handoff/)
11-tests-numstat.txt            test files changed since 014bd47 (added/removed lines)
12-tests-diff.txt               git diff -U4 014bd47 831f760 -- tests/ (input of the assertion-by-assertion table)
20-css-scan.txt                 token scan of styles.css outside the token blocks (script css-scan.mjs.txt)
21-css-literals.txt             numeric literals outside the token blocks vs 014bd47 (script css-literals.mjs.txt)
30-probe-run.txt, 30b, 30c      Playwright runs of ux.probe.ts.txt with probe.config.ts.txt (exit 0)
31-P1-*                         keyboard order, accessible names, hidden row names (desktop, mobile)
32-P2-*                         day editor focus on open, Escape, return; bottom-sheet trap (desktop, mobile)
33-P3-*                         phone: 44px targets and sideways scroll in 8 states; first-day position (B-01)
34-P4-*                         rendered text and non-text contrast (light, dark), motion, fonts, radius
35-P5-*                         status never by colour alone
36-P6-panel-768-1199.txt        focused sheet controls entirely under the fixed side panel at 768 and 1024px (B-02)
37-P7-visible-filter-exclusions.txt  what filter({ visible: true }) excludes on the phone (only the hidden desktop bar)
38-P8-phone-rows-360.txt        phone row heights (min 54px) and no sideways scroll at 360px
40-docs-parity.txt              EN/VI structure of docs 04, 08, 10, 12 (script parity.mjs.txt)
90-digest-after.txt             digest after, three forms
Screenshots (synthetic seed data "Example Employee"):
  timesheet-phone-first-screen-synthetic.png    390x844 first screen: no day row visible (B-01)
  editor-w1024-synthetic.png                    1024x768 with the side panel over Fri..Sun, tools and clock (B-02)
  timesheet-desktop-first-screen-synthetic.png  1280x800 first screen (Excel layout, week 1)
  editor-phone-synthetic.png                    phone bottom sheet
Scripts: run-checks.sh.txt, run-deprecation.sh.txt, env.sh.txt, mask.mjs.txt, css-scan.mjs.txt, css-literals.mjs.txt,
parity.mjs.txt, ux.probe.ts.txt, probe.config.ts.txt, runtime-probe.mjs.txt
