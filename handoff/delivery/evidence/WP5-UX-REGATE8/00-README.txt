WP5-UX-REGATE8 evidence (verifier, attempt 1; synthetic data only). freeze_commit 90b98efc395c3894a21a909b6d361eadc6fc2bd9; HEAD = origin/main = the same before and after;
no non-handoff path changed (00-nonhandoff-status.txt and 00-status-after.txt empty). Node v24.21.0 portable (00-node.txt, env.sh.txt), Git Bash, workflow Python (user <user>).
Machine zone America/Los_Angeles. Paths masked: <task> = the task folder outside the repository, <repo> = the working repository.

Digest of record 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files, handoff/ excluded), three forms, before and after all checks:
  01-digest-export-{before,after}.txt   clean git archive export, git hash-object --no-filters
  01-digest-lstree-{before,after}.txt   git ls-tree form (sorted list byte-identical to the export list)
  01-digest-npm-{before,after}.txt      npm run digest in the repository

Item 1: 02-ci/lint(+exit), 03-verify(+exit), 03-window, 04-e2e(+exit), 05-ac13-1..3 + 05-ac13-exits, 06-tzprobe-<zone>, 06-ac13-<zone>, 06-ac13-exits, 07-drill(+exit), wp3-ci,
  wp3-build, 08-config-*, 09-keys-map, 10-audit, 11-* validators and 11-exits, 12-npmtest-1..3 + 12-npmtest-exits, 20-bound-stat, 21-pdf-stat, 22-scope-*, 40-contrast,
  62-targets-run + 62-obs-targets (44px / scroll probe from REGATE6, scratch spec copied into the task-local export and removed), 14-image-rm, 14-compose-down,
  15-docker-version, 15-docker-ps-before, 15-docker-images-before, 15-docker-ps (empty after cleanup), 15-images-after.
Item 2: 22-fixscope-stat, 22-fixscope-forbidden (empty), 24-spec-diff (git diff -U0 3670a6c..90b98ef -- tests), 24-skipcheck.
Item 3: 03-control-p / 03-control-real (preload control), sweep-<label> (full logs) and sweep-table.
Item 4: 50-old-ci, 50-old-build, 50-new-build, 51-export-old-hashes, 51-export-hashes.
Scripts: *.sh.txt, *.mjs.txt, zz-control.spec.ts.txt (task-local control spec, removed from the export after use).
