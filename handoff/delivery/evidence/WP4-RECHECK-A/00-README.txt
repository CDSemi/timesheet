WP4-RECHECK-A evidence (area A, operations, recheck after the fix round), reviewed commit
0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65 (the WP4-REGATE freeze_commit), source digest
dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742 (775 files, handoff/ excluded).

Masking: <work> = the audit task folder outside Dropbox; <project> = the repository folder; <user> = the Windows
account name; <email> = any email address (all addresses are synthetic example.invalid ones). ANSI codes removed, LF line
ends, no trailing whitespace. Probe and helper sources are stored as *.mjs.txt / *.sh.txt.
Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0, Docker 28.5.1 (Docker Desktop, linux/amd64),
Compose project ts-wp4-rca (removed by the drill), images ts-wp4-rca-timesheet:drill and :nocache removed by name.
Every CLI and server run set DATABASE_PATH and DATA_DIR explicitly under <work> (env.sh exports them for the shell; each
probe passes its own pair to every child process). TEMP and TMP point to <work>/tmp. Capture mode only; synthetic data
only; nothing was sent, pushed, committed or deployed.

00-digest-before.txt             HEAD, origin/main and the source digest (ls-tree form and scripts/source-digest.mjs)
                                 in the repository before the audit.
00b-export-digest-before.txt     git archive export of 0f7fba2: full tree id equals the freeze tree; digest equal.
01-npm-ci.txt                    npm ci on the export: exit 0, 169 packages, no deprecation line.
02-verify-data-dir-exported.txt  npm run verify with DATA_DIR and DATABASE_PATH exported and
                                 NODE_OPTIONS=--trace-deprecation --pending-deprecation: exit 0, 76 files / 1734 tests,
                                 SMOKE PASSED, no deprecation line; the exported DATA_DIR stayed empty (WP4-A-04).
03-wp3-prepare.txt               previous build for drill stages 4-5: git archive 49651c8, npm ci, build:server (exit 0).
04-drill.txt                     full container drill, stages 1-6: exit 0, 208 PASS / 0 FAIL (33/31/57/35/27/23).
05-nocache-build.txt             independent docker build --no-cache of the export (tag ts-wp4-rca-timesheet:nocache):
                                 exit 0; tsc gets --sourceMap false, vite prints no map.
06-image-scan-drill.txt          layer scan of the drill image without running a container (docker image save, tar):
                                 0 *.map and 0 sourceMappingURL under /app/dist; 566 third-party maps in node_modules.
07-image-scan-nocache.txt        the same scan of the no-cache image; /app/dist identical to the drill image.
10-p2-backup-restore.txt         rerun of the first audit's P2: backup under three writers, isolated restore, hashes and
                                 balances (SQL and API): 31 PASS.
11-p8-admin-privacy.txt          rerun of P8: operations status and account list exact allowlists: 8 PASS.
12-p7-retention-sweep.txt        rerun of P7: F-4 retention window and the daily sweep while paused: 23 PASS.
13-ra1-prune.txt                 new probe: R-A1 refusal (library and CLI), normal pruning against an independent 7/4/6
                                 computation, the same-second tie (scope item 5) and the paired pre-upgrade backup.
                                 24 PASS. The line "back-to-back CLI runs: every pair leaves exactly one complete backup"
                                 is a recording line (constant true); the measurement is the INFO line before it.
14-a03-bootstrap.txt             new probe: 13 invalid bootstrap files with markers in every free-text place; refusals quote
                                 only dates or policy numbers; the valid file prints counts and the token (redacted here).
                                 15 PASS.
15-diff-scope.txt                git diff 13a258d..0f7fba2 (non-handoff names; area A paths outside the fix list).
16-p3-prune.txt                  rerun of P3 (junction escapes, selection, dry run); scenario B now expects the refusal.
                                 10 PASS.
17-p4-targets.txt                rerun of P4 (backup and restore target boundaries, tampered backups): 16 PASS.
18-docker-cleanup.txt            no container, volume or network of ts-wp4-rca left; both audit images removed by name.
19-source-checks.txt             read-only greps behind the closures: retention not rendered by the client, JOB_RUNNER
                                 wording, the /assets 404 route, map build settings and drill rules, the smoke DATA_DIR,
                                 the R-A1 guard and tie-break, reader limits, holiday cap, 422 code, I-3 not_due rule.
20-validate-package.txt          handoff/delivery/validate_package.py --preflight (workflow Python, no bytecode written)
                                 after the report pair was written: exit 0, PASS, 77 translation pairs.
21-precommit.txt                 scripts/precommit-check.mjs over this task's owned files (report pair, task record and
                                 every evidence file, the previous version of this log included) staged in a private git
                                 dir outside the repository, run last after every edit: exit 0, 0 findings.
99-digest-after.txt              HEAD, repository digest and export digest after the audit (unchanged).
99b-digest-final.txt             the same, rechecked after the reports, the task record and the evidence were written.
p*.mjs.txt, mask.mjs.txt         probe and masking sources (p2, p3, p4, p7, p8 are copies of the first audit's probes with
                                 synthetic addresses restored; p3 scenario B adapted to R-A1).
image-scan.sh.txt, digest-export.sh.txt, env.sh.txt   helper scripts.

Procedure notes: one read-only grep over the export's docs used "2>/dev/null" against the runtime rule (no effect on any
file). The extra no-cache image build used docker build with a project-prefixed tag (not a Compose run); it started no
container and was removed by name. No first run of any probe failed; nothing was rerun.
