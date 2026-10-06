WP4-RECHECK-A2 evidence (WP4-RECHECK-A attempt 2: digest-bound area-A delta recheck on the round-2 fix freeze),
reviewed commit cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d (the WP4-REGATE2 freeze_commit), source digest
96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503 (775 files, handoff/ excluded). Delta base: 0f7fba2
(attempt 1, digest dfe4541d...86742).

Masking: <work> = the audit task folder outside Dropbox; <project> = the repository folder; <user> = the Windows
account name; <email> = any email address (all addresses are synthetic example.invalid ones). ANSI codes removed, LF line
ends, no trailing whitespace. Helper and probe sources are stored as *.sh.txt / *.mjs.txt.
Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0, Docker 28.5.1 (Docker Desktop, linux/amd64),
Compose project ts-wp4-rca2 only (the drill removed it; both audit images removed by name). Every CLI and server run set
DATABASE_PATH and DATA_DIR explicitly under <work> (env.sh exports them for the shell; each probe passes its own pair to
every child). TEMP and TMP point to <work>/tmp. Capture mode only; synthetic data only; nothing was sent, pushed,
committed or deployed.

00-digest-before.txt              HEAD, origin/main, freeze tree and the source digest (ls-tree form and
                                  scripts/source-digest.mjs) in the repository before the audit (14:54 UTC).
00b-export-digest-before.txt      git archive export of cc34e7f: full tree id 940def94... equals the freeze tree; digest equal.
10-delta.txt                      git diff --name-status 0f7fba2 cc34e7f: 127 paths, 118 under handoff/delivery, 9 outside;
                                  each of the 9 is a WP4-FIXB2 or WP4-DEPCLEAN owned path; no governance or area-A path.
11-lock.txt                       p-lock probe over both package.json and package-lock.json versions: package.json loses only
                                  fast-xml-parser; the lock loses 8 entries (fast-xml-parser and its 7 transitive packages),
                                  adds none, changes none; each removed entry is in the fast-xml-parser closure and is needed
                                  by nothing outside it.
12-npm-ci.txt                     npm ci on the export: exit 0, 161 packages, no deprecation line; the 8 removed packages are
                                  absent from node_modules (no nested copy); npm audit --omit=dev: 0 vulnerabilities.
13-verify.txt                     npm run verify with DATA_DIR and DATABASE_PATH exported and NODE_OPTIONS=--trace-deprecation
                                  --pending-deprecation: exit 0; 76 files / 1750 tests; SMOKE PASSED (41 PASS, the same checks
                                  as attempt 1); the only "deprecat" match is the echoed NODE_OPTIONS line; DATA_DIR stays empty.
14-wp3-prepare.txt                previous build for drill stages 4-5: git archive 49651c8, npm ci, build:server (exit 0).
15-drill.txt                      full container drill, stages 1-6, project ts-wp4-rca2: exit 0, 208 PASS / 0 FAIL
                                  (33/31/57/35/27/23). Its image build was served from the BuildKit cache (same source).
16-image-scan-drill.txt           layer scan of the drill image without running a container: /app/dist 116 files, 0 *.map,
                                  0 sourceMappingURL; 560 third-party maps (pdf-lib only); no removed package in the image.
17-nocache-build.txt              docker compose --project-name ts-wp4-rca2 build --no-cache (tag ts-wp4-rca2-timesheet:nocache):
                                  exit 0; every source step rebuilt; tsc --sourceMap false; vite prints no map; 0 deprecation.
18-image-scan-nocache.txt         the same scan of the no-cache image; /app/dist byte-identical to the drill image (116 files).
19-docker-cleanup.txt             both audit images removed by name; no container, volume, network or image of ts-wp4-rca2 left.
20-p2-backup-restore.txt          attempt-1 probe P2 rerun: backup under three writers, isolated restore, hashes, balances: 31 PASS.
21-p8-admin-privacy.txt           P8 rerun: operations status and account list exact allowlists: 8 PASS.
22-p4-targets.txt                 P4 rerun: backup and restore target boundaries, tampered backups: 16 PASS.
23-p7-retention-sweep.txt         P7 rerun: F-4 retention window and the daily sweep while paused: 23 PASS.
24-p3-prune.txt                   P3 rerun: junction escapes, selection, dry run, R-A1 scenario B: 10 PASS.
25-ra1-prune.txt                  R-A1 and prune probe rerun: 24 PASS; same-second tie and paired-backup measurements (INFO).
25a-ra1-prune-setup-error.txt     first launch refused by the probe's own guard ("work folder is not fresh") because this
                                  auditor had pre-created the folder; nothing ran; rerun into a fresh folder (25).
26-a03-bootstrap.txt              A-03 bootstrap refusal probe rerun: 15 PASS; the setup token is redacted by the probe.
26a-a03-bootstrap-setup-error.txt the same setup refusal as 25a; rerun into a fresh folder (26).
27-source-checks.txt              read-only checks: importers of the three changed modules (no area-A runtime module), the
                                  unchanged importedPeriodError/isImportedTimesheet exports, no area-A path changed, the docs/07
                                  hunk, docs/07 limits equal to the code, no stale reference to the removed dependency, the
                                  unchanged Dockerfile and drill map rules.
28-validate-package.txt           handoff/delivery/validate_package.py --preflight (workflow Python, no bytecode written) after
                                  the report pair and the task record were written.
29-precommit.txt                  scripts/precommit-check.mjs over this task's owned files (report pair, task record and every
                                  evidence file, the previous version of this log included) staged in a private git dir
                                  outside the repository (precommit.sh.txt), run last after every edit.
99-digest-after.txt               HEAD, repository digest and export digest after the checks (unchanged).
99b-digest-final.txt              the same, rechecked after the reports, the task record and the evidence were written.
p-lock.mjs.txt                    the lock comparison probe.
probe-copy.sh.txt                 how the attempt-1 probes (evidence/WP4-RECHECK-A/*.mjs.txt) were copied for the rerun: header
                                  line removed, synthetic example.invalid addresses restored, no other change; run lines.
env.sh.txt, digest-export.sh.txt, image-scan.sh.txt, mask.mjs.txt, precommit.sh.txt   helper scripts.

Procedure notes:
- Two read-only shell commands used "2>/dev/null" against the runtime rule: a ps -W listing of node processes (to confirm
  that none of this audit's processes was left) and a grep over two task briefs. Neither wrote or read any file through it.
- The no-cache image was built with docker compose under the project name ts-wp4-rca2 (build only, no container started).
- No probe failed on its first real run; 25a and 26a are launch refusals by the probes' own fresh-folder guard.
- 99b counts 2 running processes of the portable Node path at 15:15:16 UTC. Neither was started by this audit: one began
  at 15:15:02 and one at 15:15:22 UTC, when no command of this audit was running Node, and both were gone at 15:15:28 UTC
  (the same portable Node is used by other concurrent tasks). A ps -W listing at about 15:08 UTC (shown in the session,
  not saved) had no process of that path.
