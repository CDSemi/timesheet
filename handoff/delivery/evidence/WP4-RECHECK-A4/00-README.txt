WP4-RECHECK-A4 evidence (WP4-RECHECK-A attempt 4: digest-bound area-A delta recheck on the round-4 fix freeze),
reviewed commit 546cddaf6747aef85e8b6d9b7712de9e28f138bf (the WP4-REGATE4 freeze_commit), source digest
26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files, handoff/ excluded). Delta base: 972ccda
(attempt 3, digest 635f909d...3f7b).

Masking: <work> = the audit task folder outside Dropbox; <project> = the repository folder; <user> = the Windows
account name; <email> = any email address (all addresses are synthetic example.invalid ones); <lan> = a LAN address in
the netstat listings. ANSI codes removed, LF line ends, no trailing whitespace. Helper sources are stored as *.sh.txt /
*.mjs.txt.
Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0. No Docker command was run by this audit (no Compose
project ts-wp4-rca4 exists). Every CLI and server run set DATABASE_PATH and DATA_DIR explicitly under <work> (env.sh
exports them for the shell; each probe passes its own pair to every child). TEMP and TMP point to <work>/tmp. Servers:
SMOKE_PORT 47613 for verify; ports 47615-47618 for the limit probe; P2 and P8 take a loopback port the OS hands out as
free. Capture mode only; synthetic data only; nothing was sent, pushed, committed or deployed.

00-digest-before.txt              HEAD, origin/main, freeze tree and the source digest (ls-tree form and
                                  scripts/source-digest.mjs) in the repository before the audit (19:37 UTC); no non-handoff
                                  change in the working tree.
00b-export-digest-before.txt      git archive export of 546cdda: full tree id 16e3e0fe... equals the freeze tree; digest equal.
05-listen-before.txt              netstat LISTENING lines before verify: 47613-47616 free.
05b-processes-before-probes.txt   node.exe processes and listening sockets before the probes (listing only).
05c-processes-after-run1.txt      the same after probe run 1 (P8 of run 1 crashed before stopping its server child; no
                                  process of this audit was left; the one portable Node process listed started after run 1
                                  and was gone 15 s later).
10-delta.txt                      git diff --name-status 972ccda 546cdda: 215 paths, 201 under handoff/, 14 outside (FIXB4 and
                                  DEPCLEAN2 paths); --stat of the 14.
11-source-checks.txt              read-only checks: app.ts and routes/imports.ts changed lines (comments only; cmp without
                                  comments exit 0); the request-size limits at both commits; area-A blob ids at 0f7fba2,
                                  cc34e7f, 972ccda and 546cdda; importers; fflate references; Dockerfile npm commands; docs/11
                                  and docs/07 hunks; client limit text. Three paths in C are wrong (absent) and D2's exit
                                  status is the pipe's: see 11b.
11b-source-checks2.txt            corrections of 11: services/bootstrap.ts, automation.ts, operationsStatus.ts, the
                                  migrations, docs/10_DECISIONS_AND_SOURCES, routes/signatures.ts, admin.ts, auth.ts and the
                                  tsconfigs blob-identical at the four commits; only routes/imports.ts changed under routes/;
                                  no area-A module imports or names a changed module (git grep exit 1).
11c-lock-compare.txt              p-lock.mjs: package.json and package-lock.json at 972ccda and 546cdda compared by package;
                                  only fflate changes (dev: true; dependencies -> devDependencies).
12-npm-ci.txt                     npm ci on the export: exit 0, 161 packages, no deprecation line.
12b-npm-ls-audit.txt              npm ls fflate (dev only; empty with --omit=dev), npm audit --omit=dev 0, full npm audit 1 high
                                  in the dev-only source-map-js; better-sqlite3 ships prebuilds.
13-verify.txt                     npm run verify with DATA_DIR, DATABASE_PATH and SMOKE_PORT exported and NODE_OPTIONS=
                                  --trace-deprecation --pending-deprecation: exit 0; 76 files / 1758 tests; SMOKE PASSED
                                  (41 PASS); the only "deprecat" match is the echoed NODE_OPTIONS line; the exported DATA_DIR
                                  stays empty.
13b-smoke-compare.txt             the 41 smoke check names equal attempt 3's.
14-image-build-steps.txt          the Dockerfile build-stage commands on a second export without Docker (npm ci;
                                  build:server --sourceMap false; BUILD_SOURCEMAPS=off build:client): dist 116 files, 0 *.map,
                                  0 sourceMappingURL; the reader uses node:zlib (one comment names fflate). The only
                                  "deprecat" match is this log's own echo line.
14b-prod-deps.txt                 the prod-deps and runtime stages without Docker: npm ci --omit=dev --ignore-scripts in
                                  <work>/prod (16 packages, no fflate), plus dist/ from 14.
14c-thirdparty-maps.txt           R-RA3: 560 *.map files in the production node_modules, all pdf-lib; fflate has none.
14d-bundle.txt                    the image-equivalent client bundle index-DH2TBHE1.js: 454,210 bytes, decoded length 454,172;
                                  "2 MiB" once, "8 MiB" never (bundle-size.mjs.txt).
15-regate4-drill-read.txt         the WP4-REGATE4 drill result read (208 PASS, 33/31/57/35/27/23) and compared with the
                                  WP4-REGATE3 drill: identical check names; area-A lines of stages 1, 2 and 6.
15b-image-delta.txt               REGATE3 -> REGATE4 image: 21 paths fewer, matching fflate's 17 files and 4 folders.
16-board-separation.txt           board entries of the round-4 tasks (agent ids and models) for the separation check
                                  (board.mjs.txt; read from a copy of the board).
19-probe-copy.txt, 19b-probe-copy-diff.txt
                                  runnable copies of the attempt-1 probes (probe-copy.sh.txt), identical to attempt 3's copies
                                  except the inserted comment line.
20-run-summary.txt                run 2 of the seven probes on <work>/prod (run-probes.sh.txt).
20-p2-backup-restore.txt          P2 rerun: backup under three writers, isolated restore, hashes, balances: 31 PASS.
21-p8-admin-privacy.txt           P8 rerun: operations status and account list exact allowlists: 8 PASS.
22-p4-targets.txt                 P4 rerun: backup and restore target boundaries, tampered backups: 16 PASS.
23-p7-retention-sweep.txt         P7 rerun: F-4 retention window and the daily sweep while paused: 23 PASS.
24-p3-prune.txt                   P3 rerun: junction escapes, selection, dry run, R-A1 scenario B: 10 PASS.
25-ra1-prune.txt                  R-A1 and prune probe rerun: 24 PASS; same-second tie and paired-backup measurements (INFO).
26-a03-bootstrap.txt              A-03 bootstrap refusal probe rerun: 15 PASS; the setup token is redacted by the probe.
27-probe-compare.txt              the check lines of the seven probes equal attempt 3's (0 diff lines each).
28-p-limits.txt                   p-limits.mjs run 4 (port 47618, one connection per upload): 20 PASS, exit 0 - JSON 64 KiB,
                                  signature 256 KiB, workbook 2 MiB, template 201, backup holds the import source.
30-seed-prod.txt                  why run 1 failed: the development seed reads reference/examples/*.json next to dist/
                                  (ENOENT in an app folder without them).
run1-*.txt                        probe run 1 on <work>/prod without reference/examples: seed failed, so P2, P8, P4 and P7
                                  failed; P3, R-A1 and A-03 passed. run1-22 shows R-RA9 (a dangling junction answered
                                  write_failed, nothing written).
run1-28-p-limits.txt              limit probe run 1 (fetch, port 47615): the 2 MiB + 1 upload failed with "other side closed"
                                  (R-RA8); the probe stopped its server in its finally block.
run2-28-p-limits.txt              limit probe run 2 (node:http keep-alive agent, port 47616): ECONNRESET on the upload after a
                                  413 (R-RA8); every other check passed.
run3-28-p-limits.txt              limit probe run 3 (one connection per upload, port 47617): 20 PASS. Run 4 (28) differs only
                                  in the refused-login password literal, renamed synthetic-wrong-password because the precommit
                                  check blocked the bare literal in the probe source; same 20 check lines.
31-validate-package.txt           handoff/delivery/validate_package.py --preflight after the report pair and the task record
                                  were written.
32-precommit.txt                  scripts/precommit-check.mjs over this task's owned files staged in a private git dir outside
                                  the repository (precommit.sh.txt), run last after every edit.
98-processes-after.txt            no portable Node process, no listener on 47613-47618; after run 4 two new sockets belong to
                                  an Arduino IDE the owner started at 19:57 UTC (not this audit).
99-digest-after.txt               HEAD, repository digest and the digests of both exports after the checks (unchanged).
99b-digest-final.txt              the same, rechecked after the reports, the task record and the evidence were written.
env.sh.txt, digest-repo.sh.txt, digest-export.sh.txt, digest-export-img.sh.txt, source-checks.sh.txt,
source-checks2.sh.txt, probe-copy.sh.txt, run-probes.sh.txt, precommit.sh.txt, mask.mjs.txt, p-lock.mjs.txt,
p-limits.mjs.txt, bundle-size.mjs.txt, board.mjs.txt
                                  helper scripts and probes (p-limits.mjs.txt is the run-4 version; its header comments name
                                  the run-1, run-2 and run-3 differences).

Procedure notes:
- The probes ran twice; run 1 lacked the seed's example files (see 30). Run 2 is in fresh work folders.
- The limit probe ran four times (R-RA8 for runs 1 and 2; run 4 for the precommit literal); each run used a fresh folder
  and its own explicit port. p-limits.mjs.txt is the run-4 source.
- run-probes.sh.txt shows the run-2 settings (PR=<work>/pr2); run 1 used <work>/pr and the header line without "run 2".
- 11 keeps the wrong paths and exit report it first printed; 11b has the corrected checks. Both are read-only.
