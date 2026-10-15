WP5-UX2-GATE evidence (verifier, attempt 1; synthetic data only). freeze_commit d1a20a7f0112fa00171fe4b1d6035427855f12b6; HEAD = origin/main = the same before and after;
no non-handoff path changed (00-nonhandoff-status.txt and 00-status-after.txt empty). Node v24.21.0 portable (00-node.txt, env.sh.txt), Git Bash, workflow Python (user <user>).
Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.

Digest of record 20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files, handoff/ excluded), three forms, before and after all checks:
  01-digest-export-{before,after}.txt   clean git archive export, git hash-object --no-filters
  01-digest-lstree-{before,after}.txt   git ls-tree form (sorted list byte-identical to the export list)
  01-digest-npm-{before,after}.txt      npm run digest in the repository

Item 1 (WP5 gate): 02-ci/lint(+exit), 03-verify(+exit), 03-window (real LA clock before and after the e2e), 04-e2e(+exit), 05-ac13-1..3 + 05-ac13-exits,
  06-tzprobe-<zone>, 06-ac13-<zone>, 06-ac13-exits, 07-drill(+exit), wp3-ci, wp3-build, 08-config-*, 09-keys-map, 10-audit, 11-* validators and 11-exits,
  12-npmtest-1..3 + 12-npmtest-exits, 14-image-rm, 14-compose-down, 15-docker-version, 15-docker-ps-before, 15-docker-images-before, 15-docker-ps (empty), 15-images-after,
  21-pdf-stat (src/server/pdf and migrations: empty), 40-contrast (token pairs; identical to the REGATE8 output), 60-suite-observations (console numbers of the real-clock e2e).
Item 2 (boundary): 20-bound-stat (git diff --stat 90b98ef..d1a20a7 -- src/server src/domain), 20-migrations-diff (empty), 22-config-diff (config, scripts, Docker: empty),
  50-old-ci, 50-old-build, 50-new-build, 51-export-old-hashes, 51-export-hashes, 51-hash-diff, 51-dist-diff (the only dist/server and dist/domain difference).
Item 3 (scope): 22-scope-stat, 22-scope-by-commit, 22-commits, 23-fonts, 23-rasters-flag, 23-added-bin, 24-test-diff, 24-removed-lines, 24-skipcheck-added, 24-test-change-notes.
Item 4 (sweep): 03-control-p / 03-control-real (preload control), sweep-<label> (full logs), sweep-table, sweep-progress.
Item 5 (round checks): 62-obs-headers (+ -old-90b98ef), 62-obs-bars, 62-obs-shared, 62-obs-targets, 62-obs-logo-fidelity, 62-probe-run, 62-probe2-run, 62-probe-old-run;
  the budget, bar, hover, ring and contrast numbers of the real-clock e2e are in 60-suite-observations and 04-e2e.
Item 6 (screenshots, synthetic only, 10): gate-bar-1440-{light,dark}, gate-sheet-open-day-today-1440-{light,dark}, gate-label-picker-open, gate-theme-control,
  gate-show-details-switch, gate-phone-390-first-screen-{noshare,share}, gate-logo-fidelity (the SVG next to the source image), all with the suffix -synthetic.png.
Scripts: *.sh.txt, *.mjs.txt, zz-*.spec.ts.txt (task-local specs, copied into the export for one run and removed afterwards).
