WP5-UX-REGATE7 evidence (verifier, attempt 1; synthetic data only). freeze_commit 3670a6c3c22ddcf75138927ed60f4cd9bf02078d; HEAD = origin/main = the same before and after;
no non-handoff path changed (00-nonhandoff-status.txt empty). Node v24.21.0 portable (env.sh.txt), Git Bash, workflow Python (user <user>) for the validators.
Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.

Digest of record 58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files, handoff/ excluded), three forms:
  01-digest-export-before.txt / 01-digest-export-after.txt   clean git archive export, git hash-object --no-filters
  (git ls-tree form: same hash, 795 lines, byte-identical sorted list to the export; recorded in the Results of the brief)
  01-npm-digest-repo-before.txt / 01-npm-digest-repo-after.txt   npm run digest in the repository

Gate item 1: 02-ci/lint, 03-verify, 03-window (reporting-zone time before and after the e2e), 04-e2e, 05-ac13-1..3, 06-ac13-<zone>, 06-tzprobe, 07-drill (BLOCKED: Docker engine
  unavailable; 15-docker-*), wp3-ci, wp3-build, 08-config-*, 09-keys-map, 10-audit, 11-* validators, 12-npmtest-1..3, 20-bound-stat, 21-pdf-stat, 22-scope-names, 40-contrast,
  obs-targets + 62-targets-run (probe ux-regate3-c.spec.ts from REGATE6, run as a scratch spec and removed).
Gate item 2: 22a-fixround, 24-spec-diff.
Gate item 3: 10-seed-test, 10-seed-scratch-new/old/diff (scratch copy, old choice), 10-old255-desktop/mobile (255ba17 specs run on the same day: 3 failed per project), 11-iso-shell + 11-iso-<project>-<n>.
Gate item 4: 50-old-*, 50-new-build, 51-export-old-hashes, 51-export-hashes (230 files each, identical).
Scripts: *.sh.txt, *.mjs.txt.
