WP5-UX3-GATE evidence index (timesheet-verifier, attempt 1; synthetic data only; masked LF text; <task> = task folder outside the
repository, <repo> = the working repository, <user> = the profile name, addresses other than full @example.invalid are <email>).

Target: cecfceb61c7f15216c8f188e8b7059c9f075247d (HEAD = origin/main before and after); previous accepted snapshot a6437943403fc416240fd13a787a8c4748af3e84.
Digest of record 29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files, handoff/ excluded), equal in three forms
(clean git archive export hashed with git hash-object --no-filters; git ls-tree form; npm run digest), before (01-digest-*-before.txt) and after
(01-digest-*-after.txt, log-digest-after.txt) all checks. `git status --short` outside handoff/ was empty at the start (checked first, shown on screen, no file) and after (00-nonhandoff-status-after.txt).

Runtime: Node v24.21.0 (portable), Git Bash, Docker engine 28.5.1 reachable (15-docker-version.txt). Scratch exports in <task>: export (clean cecfceb,
all gate items), export-old (clean a643794, item 2 and the header comparison), export-probe (clean cecfceb with the node_modules of export copied and
built; the probes and the sweep controls ran there, so the gate export never held a zz- file).

Item 1 (WP5 gate): 02-ci*, 02-lint*, 03-verify*, 03-window.txt (Los Angeles time before and after the real-clock e2e), 04-e2e*.txt, 05-ac13-*, 06-ac13-*,
  06-tzprobe-*, 07-drill*.txt (+ log-probe-* none), 08-config-*, 09-keys-map.txt, 10-audit.txt, 11-*, 12-npmtest-*, 14-*, 15-*, 21-pdf-stat.txt.
Item 2: 20-bound-stat.txt (empty), 50-*, 51-hash-diff-export-old.txt, 51-dist-diff-old.txt, log-cmp-dist.txt.
Item 3: 22-scope-stat.txt, 22-scope-names.txt, 22-scope-by-commit.txt, 22-commits.txt, 23-*.txt, 24-test-diff.txt (a643794..cecfceb under tests/),
  24-skipcheck-added.txt, 24-skipcheck-removed.txt, 24-removed-assertions-by-file.txt.
Item 4 (sweep): 84-sweep-table.txt, log-sweep-*.txt (one per run), log-control-*.txt (the preload control at every instant: server today_local,
  displayed period, WINDOW inside or outside), log-rep-*.txt and log-sweep-rerun-five-1128.txt (reproductions), sweep.sh.txt, run-shift.sh.txt,
  shiftclock.mjs.txt (copied unchanged from WP5-UX-FIX10).
Item 5 (round checks), the observation files are obs-*.txt:
  obs-layout.txt        Day editor modal/beside widths, columns, words, dock side; the desktop bar rows and the wordmark rule
  obs-lift.txt          lifted runs: fractional column edges, neighbour shadow, seam numbers (DPR 1 and 2); 80-seam-*.txt shadow profiles under the run
  obs-phone.txt         first-screen budgets, 44px targets 320-767, page scroll at nine widths, the session dialog at 390x844 and rows/chips by width,
                        shared view and employee admin requests (obs-phone-run1.txt: the first run, in which three widths of the targets test stopped
                        at a probe expectation and were rerun)
  obs-week.txt, obs-week-debug-*.txt   the week card at 768-1024 (inner scroll, focus travel) in the target and in a643794
  obs-a11y-scan.txt     real axe 4.14.0 scan (WCAG 2.2 AA tags), text-contrast sweep and focus-ring sweep for every state in four theme situations
                        (earlier partial runs obs-a11y-scan-run*.txt: probe fixes, not results)
  obs-measure.txt       card on page, hover, editor frame, selection checkbox, named text pieces (pills, bar email, avatar, chips) per theme situation
  obs-focus.txt         hover text step to --accent-strong, "Open a day" words by width, chunk-load error "Try again"
  obs-dom.txt           the DOM behind the two label-content-name-mismatch findings
  obs-chunks-target.txt, obs-headers-*.txt, obs-violations-*.txt   lazy chunks; CSP and all response headers (target against a643794: identical);
                        securitypolicyviolation per screen
  40-contrast.txt       token contrast script; 70-probe-build.txt, 50-*-build.txt build output (main chunk, no advisory)
Item 6: 14 *-synthetic.png (ux3gate-*), all synthetic.
Scripts: *.sh.txt, *.mjs.txt, zz-*.ts.txt (task-local probes; never in the repository).
