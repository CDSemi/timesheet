WP5-UX-REGATE5 evidence (verifier, attempt 1; synthetic data only). freeze_commit bf954c0b371ad9a5fe461a603c5d476ea210e66c; HEAD = origin/main = the same before
(00-head.txt) and after (00-head-after.txt); no non-handoff path changed (nonhandoff-status.txt empty). Node v24.21.0 portable (env.sh.txt), Git Bash, workflow Python
(user <user>) for the validators. Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.

Digest of record b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files, handoff/ excluded), three forms:
  exdigest-before.txt and exdigest-after.txt  clean git archive export, git hash-object --no-filters (scratch specs removed before the after run)
  lstree-sha.txt                              git ls-tree form of bf954c0
  repo-digest.txt and repo-digest-after.txt   npm run digest in the repository (before and last)

Gate item 1 (method of WP5-UX-REGATE4 on a clean export):
  01-npm-ci, 02-lint, 03-verify (+ 03-verify-exit: exit 0, deprecation lines 0), 04-e2e (+ 04-e2e-exit), 05-ac13-1..3, 06-ac13-<zone> and 06-tzprobe-<zone> (run-tz.mjs.txt),
  07-drill (+ 07-drill-exit), wp3-ci, wp3-build, 08-config-live/restored/rollback, 09-keys-map, 10-audit, 11-* validators and precommit self-test,
  20-bound-stat, 21-pdf-stat, 22-scope, 22-scope-new, 30-npmtest-1..3, 40-contrast (contrast5.mjs.txt), 14-compose-down, 14-image-rm, 15-docker-*.
Gate item 2: 22a-fixround, 22a-names, 22b-5b349f8, 22d-docs04, 22e-forbidden, 24-removed, 25-spec-assertions.
Gate item 3 (scratch specs run in the task-local export, then removed; sources saved as *.spec.ts.txt):
  ux-regate5-a.spec.ts.txt  AX-01 walks, AX-02/03/04/R-12 rings, AX-05, AX-06, AX-07, AX-09, AX-10 (60-regate5-a-run2, 6-final-a2)
  ux-regate5-b.spec.ts.txt  AX-08 (6-final-b2)
  ux-regate5-c.spec.ts.txt  R-12 time field and the desktop selected-row backdrop (6-final-c)
  ux-regate5-d.spec.ts.txt  batch rows screenshot at 320 (64-regate5-d-run)
  ux-regate3*.spec.ts.txt, ux-regate4.spec.ts.txt  the REGATE4 probes for the earlier fixes, day-button selectors adapted to [data-day-button] (63-*-run)
  Observations: obs-ax01, obs-ax05, obs-ax06, obs-ax07, obs-ax08, obs-ax09, obs-ax10, obs-rings, obs-rings-c; earlier fixes obs-b3, obs-b4, obs-desktop, obs-phone, obs-r7, obs-targets.
Screenshots: ten regate5-*-synthetic.png (example.invalid accounts, run-time passwords).
Scripts: env.sh.txt, exdigest.sh.txt, keys.sh.txt, run-verify.sh.txt, mask.mjs.txt, copy-evidence.sh.txt.

Superseded probe runs (not in this folder): the first run of probe A failed on probe-side defects (a 10 minute hang when the probe signed in again while already signed in, a static phone
share bar asserted as sticky, the outer decorative dialog shadow measured instead of the inset ring, a sign-in call after another one, the login POST counted in the switcher
writes) and the first run of probe B on an Escape in the change step that no document specifies. They were fixed in the probes only; no source or test of the export changed.
Slips against the runtime rules (no real file touched): one `head -c 0 /dev/null 2>/dev/null`, one `| head -n 0`. Two Playwright runs overlapped for a few minutes (own output folders;
the first one's log file was overwritten by the second run's redirect and is not kept).
