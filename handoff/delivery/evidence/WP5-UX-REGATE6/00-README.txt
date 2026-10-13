WP5-UX-REGATE6 evidence (verifier, attempt 1; synthetic data only). freeze_commit 255ba17d6bf891c0ff779d4a4f518e0d2998cee8; HEAD = origin/main = the same before
(00-head.txt) and after (00-head-after.txt); no non-handoff path changed (nonhandoff-status.txt empty). Node v24.21.0 portable (env.sh.txt), Git Bash, workflow Python
(user <user>) for the validators. Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.

Digest of record b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files, handoff/ excluded), three forms:
  exdigest-before.txt and exdigest-after.txt  clean git archive export, git hash-object --no-filters (scratch specs removed before the after run)
  lstree-sha.txt                              git ls-tree form of 255ba17
  repo-digest.txt and repo-digest-after.txt   npm run digest in the repository (before and last)

Gate item 1 (method of WP5-UX-REGATE5 on a clean export):
  01-npm-ci, 02-lint, 03-verify (+ 03-verify-exit), 04-e2e (+ 04-e2e-exit), 05-ac13-1..3, 06-ac13-<zone> and 06-tzprobe-<zone> (run-tz.mjs.txt),
  07-drill (+ 07-drill-exit), wp3-ci, wp3-build, 08-config-live/restored/rollback, 09-keys-map, 10-audit, 11-* validators and precommit self-test,
  20-bound-stat, 21-pdf-stat, 22-scope, 22-scope-names, 22-scope-vs-prev, 30-npmtest-1..3, 40-contrast (+ 40-contrast-vs-regate5), 14-compose-down, 14-image-rm, 15-docker-*.
Gate item 2: 22a-fixround, 22e-forbidden, 22f-css-diff, 24-sharing-diff.
Gate item 3 (scratch specs run in the task-local export, then removed; sources saved as *.spec.ts.txt):
  ux-regate6-b6.spec.ts.txt  NEW probe: B6-01 in four states x light/dark at 390x844 (375, 360, 320 for information), the switcher at 390 and 320 (60-b6-run)
  ux-regate5-a.spec.ts.txt   AX-01 walks, rings, AX-05, AX-06, AX-07, AX-09, AX-10 (61-regate5-a-run)
  ux-regate5-b/c/d, ux-regate3, ux-regate3-b/c/d, ux-regate4  the REGATE5 probes for AX-08 and the earlier fixes (62-*-run)
  Observations: obs-b6, obs-switcher (new); obs-ax01, obs-ax05..ax10, obs-rings, obs-rings-c; earlier fixes obs-b3, obs-b4, obs-desktop, obs-phone, obs-r7, obs-targets.
Screenshots (8): four regate6-b6-*-390x844, regate6-switcher-choice-320, regate5-shift-tab-stop-w390-light, regate5-label-picker-active-light, regate5-batch-rows-w320
  (the regate5- names are the unchanged probe names; the images are new, from the 255ba17 build).
Scripts: env.sh.txt, exdigest.sh.txt, keys.sh.txt, run-verify.sh.txt, mask.mjs.txt.

Probe note: the first B6 probe run failed on probe-side defects (a goto before the sign-in finished; a second sign-in in one context); fixed in the scratch probe only, no
source or test of the export changed.
