WP5-UX-A11Y-SWEEP - evidence index (planner, diagnose, attempt 1; synthetic data only)

Base: HEAD = origin/main = 5b349f8f72c051f5bee3f4fe80855c941e6d9f12 (handoff-only); reviewed snapshot
5e104e14dad71268a9185920c04ed0ee2a4b31c2; source digest 07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635
(790 files, handoff/ excluded) before, for the clean export and after.

axe-core is NOT in node_modules and was not installed; the probe (sweep.probe.ts.txt) implements the checks used here.
Paths are masked: <task> = the task folder outside the repository, <project> = the working repository, <home>/<user>.
Raw JSON (per state, per walk), accessibility-tree snapshots of every state and all screenshots stay in <task>.

Files
  01-digest-before.txt            digest, git ls-tree form for 5e104e1 and HEAD + scripts/source-digest.mjs (first, after node --version)
  02-export-build.txt             git archive export of 5e104e1, node_modules copied (no install), build, export digest
  10-sweep-run-*.txt              Playwright runs: t1 (trial, 1280 light), r1 and r2 (full matrix: 5 viewports x 2 themes;
                                  r1's text-spacing test failed on the page CSP and was rerun in r2 with bypassCSP),
                                  f1 (follow-up that waited on one control action until the 30-minute test timeout (exit 1); replaced by f2),
                                  f2 (follow-ups and sticky geometry), r3 (768/320 light), r3d (1280/390 dark), r3e (1024 both): third reproduction,
                                  10-sweep-summary.txt (exit lines)
  11-summary-r*.txt               per viewport/theme and state: static audit, walks, dialogs, label-in-name (2.5.3), text spacing
  12-hidden-norings-r*.txt        stops entirely hidden on Shift+Tab (0 of 25 points) with the occluder; stops with no focus change
  13-followup-f2.json.txt         pressed toggles, dialog focus return, step change focus, live-region checks, confirm groups
  14-metrics-f2.json.txt          shell bar / share bar / editor head geometry per viewport; batch-mode overlap at 390 and 320
  15-text-spacing-r2.json.txt     WCAG 1.4.12 text-spacing override at 1280, 390, 320 (Timesheet, Review, Overtime, Settings)
  16-dialogs-r2-*.json.txt        dialog/picker records and extra checks (login error, switcher 3.2.2, batch selection)
  17-aria-r2-*.txt                accessibility-tree snapshots (Timesheet, 1280 and 390, light)
  20-static-source.txt            the source lines cited by the findings (export of 5e104e1)
  30-tokens-contrast.txt          text/status tokens over every surface token, both themes; candidate light --ok values
  90-digest-after.txt             digest after all runs
  scripts                         sweep.probe.ts.txt, sweep.config.ts.txt, run-sweep.sh.txt, env.sh.txt, exdigest.sh.txt,
                                  summarize.mjs.txt, hidden.mjs.txt, mask.mjs.txt, tokens-contrast.mjs.txt, copy-evidence.sh.txt,
                                  append-results.mjs.txt (writes this task's Results section), digest-after.sh.txt
  *-synthetic.png                 15 screenshots of synthetic data (r1-/r2-/f2- prefix = run tag)

Servers: built dist/ of the export on 127.0.0.1 ports 48240-48251, DATA_DIR and DATABASE_PATH inside <task>, started and
stopped by the probe through the child handle (raw/*-servers-stopped.json). No Docker, no real mail (capture mode).
