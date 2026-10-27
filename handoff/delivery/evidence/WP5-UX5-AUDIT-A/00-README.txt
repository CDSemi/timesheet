WP5-UX5-AUDIT-A evidence index (masked LF text; <task> = the task folder D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-A, <repo> = the repository,
<user> = the profile name). Reviewer: claude-opus-5-5 (timesheet-auditor), fresh context, no WP5-UX4 or WP5-UX5 authorship.
Target: reviewed_commit f4049aa7905e22f1467dfcae4208675cb2fc8e80, digest 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336 (882 files).
Times are UTC unless stated (the real clock was Mon 2026-10-26 evening in America/Los_Angeles, a window day: the page opens on 10/12-10/25,
which has ended and is due Tue 10/27 17:00; today 10/26 is in the in-progress period 10/26-11/08).

Identity
  00-head-before.txt / 00-head-after.txt           HEAD f4049aa, no status line outside handoff/ (00-nonhandoff-status-*.txt are empty)
  01-digest-{export,lstree,npm}-{before,after}.txt digest in three forms, before (03:26:44Z) and after (04:12:21Z): equal, 882 files

Mandatory checks (clean export <task>/export, Node v24.21.0)
  12-core-exits.txt   npm ci 0, typecheck 0, lint 0, npm test 0 and 0, build 0, AC-13 0
  02-ci.txt 02-typecheck.txt 02-lint.txt 03-npmtest-1.txt 03-npmtest-2.txt (101 files / 2374 tests each) 04-build.txt (main chunk 490.79 kB,
  no chunk advisory) 05-ac13.txt (1/1)
  06-e2e-full.txt     FULL e2e, both projects, real clock, 03:29:54-03:53:37Z: 863 passed, 125 skipped, 0 failed, exit 0 (494 tests per project:
                      06-e2e-project-started.txt); no rerun
  02-ci-export-probe.txt 02-ci-export-mut.txt 04-build-export-*.txt   the probe and mutant copies (exit 0, 02-ci-extra.txt)
  07-axe-pack.txt     axe-core 4.14.0 packed into <task>/axe-pkg (no dependency added to the repository)

Fix-round test diffs read: 40-diff-fix2.txt (7aafa21), 40-diff-fix3.txt (5b8b718), 40-diff-fix56.txt (f4049aa tests and vitest.config.ts),
40-log-fixrounds.txt, 40-stat-since-fix1.txt

Probes (task-local specs run in <task>/export-probe through the repository harness; sources as zz-src-*.txt; raw logs log-probe-*.txt;
measured lines obs-*.txt)
  obs-sheet.txt       period card, range ladder, header wrap, toolbar, week bar, ranges, compact edges, worked lines, Today spacing, names
  obs-frac-run1.txt, obs-frac-scale3.txt, obs-frac-scale1_5.txt   window resized through CDP at a forced device scale factor (3: whole px only;
                      1.5: 767.333 CSS px reached; the window minimum stops at 485.33)
  obs-frac2-run1-cspblocked.txt   the app in a frame (blocked by frame-ancestors 'none')
  obs-frac2.txt       an about:blank frame at 150% with the built style sheet: 479.333 and 767.333 CSS px reached; old min/max pairs both false,
                      range rules one side only
  obs-editor-run1.txt (first run; the later desktop part of that run was spoiled by the probe's own press inside the drawer), obs-editor-run2-partial.txt,
  obs-editor-run3-partial.txt (probe locator errors), obs-editor.txt (final desktop run), obs-classic*.txt (classic scrollbar; run 3 is the valid
  week-card scrollbar press), obs-review.txt, obs-axe-run1.txt (all screens scanned; the last step's locator failed), obs-axe.txt (108 scans,
  0 violations), obs-walk-run1-rectcover.txt (invalid: rectangle overlap ignored paint order and the re-dock frame), obs-walk.txt (valid walk),
  obs-targets.txt
Mutants: 61-mutants-summary.txt, log-mut-*.txt, 60-mutants-srcdiff.txt; M13 crossing log-mut-M13.txt and control log-m13-control.txt
Screenshots (10, synthetic data only): a5-timesheet-1440-light, a5-timesheet-600-light, a5-timesheet-390-worked-light, a5-timesheet-320-dark,
  a5-drawer-1440-light, a5-review-1440-unsigned-light, a5-signoff-dialog-1440-light, a5-review-1440-signed-light, a5-send-reason-dialog-dark,
  a5-review-390-signed-reloaded-light (F-UX5A-1)

Slips (honest): one shell call contained `node.exe -e "1" 2>/dev/null` (a no-op typed by mistake before a grep; it broke the brief's no
`node -e` and no null-device rules; nothing was read or changed); one `sleep 1` in a status check; `sed -i` on task-folder files only. No heredoc,
no stdin to node or python, no pipe into head or tail, no PID kill, no rm -r, no git configuration change. The Playwright harness picks its own
free loopback ports (outside 49860-49889); SMOKE_PORT 49861 was set but the smoke script was not run (not required).
