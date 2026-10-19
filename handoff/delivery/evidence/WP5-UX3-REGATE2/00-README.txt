WP5-UX3-REGATE2 attempt 2, evidence index (all masked LF .txt; 14 -synthetic.png)

Target ceb86b6b18bd0e8fabd93f47672cd87f3899b92f, digest b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
Workflow Python and the browser profile live under <user>. Task folder: <task> (attempt 2 worked in its a2 subfolder).

Naming
- NN-*.txt           numbered command outputs (digest, ci, lint, verify, e2e, AC-13, drill, config, validators, scope, docs, mutants)
- log-*.txt          raw run logs (sweep-*, control-*, probe-*, chain*, cmp-dist, cfg, keys, rest, drill)
- obs2-*.txt         clean final observations of the target (audit findings, axe scan); use these
- obs1-*.txt         first-pass observations; obs1-audit.txt is MIXED: it also holds the negative-control run of the same probe on
                     the base 7ce4e95 (lines appended after the target lines), obs1-a11y-scan.txt holds the scans of the discarded
                     real-clock pass (session-dialog states NOT SCANNED there; obs2 has them)
- *.sh.txt, *.mjs.txt, zz-*.ts.txt   the scripts and task-local probes (never part of the repository)
- zz-checkout-shot.spec.ts (a copy of day-editor.spec.ts that also writes the Check out discard picture) and zz-fix2.spec.ts are not copied

Key files
- 01-digest-*-before/after, 01-head-*, 01-nonhandoff-status-*   digest forms and git state around the checks
- 02-*, 03-*, 04-*, 05..12-*     WP5 gate item 1; 04-e2e-project-counts.txt per project
- 20-22-*, 23-*, 24-*            item 2 and 3 (boundary, scope, deleted files, assertions, skips)
- 30-*                           docs lines (EN/VI)
- 50-51-*, log-cmp-dist.txt      dist comparison against a643794
- 60-mutA4.txt, log-mutA4-shell.txt   mutant A4 (scratch copy only)
- 61-base-*, log-probe-basectl.txt    negative control: the audit probe on the base 7ce4e95 (23 failures)
- 80-stall.txt, log-stall-run.txt     surviveStall proof: a never-settling poll still fails the theme contrast tests
- 84-sweep-table.txt             simulated-clock sweep, one line per run; log-sweep-five-1128.txt is the run that failed with a buffer error,
                                 log-sweep-five-1128b.txt its rerun
- 85-axe-summary.txt             axe 4.14.0, 96 scans
- 70-hdrdiff-*.txt               CSP and response headers against the a643794 capture (0 lines)
- ux3regate2-*-synthetic.png     screenshots (14)
