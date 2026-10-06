WP4-RECHECK-A3 evidence (WP4-RECHECK-A attempt 3: digest-bound area-A delta recheck on the round-3 fix freeze),
reviewed commit 972ccda6409a7521a008c55c35a5b5cf416daf1e (the WP4-REGATE3 freeze_commit), source digest
635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b (775 files, handoff/ excluded). Delta base: cc34e7f
(attempt 2, digest 96445de4...d503).

Masking: <work> = the audit task folder outside Dropbox; <project> = the repository folder; <user> = the Windows
account name; <email> = any email address (all addresses are synthetic example.invalid ones). ANSI codes removed, LF line
ends, no trailing whitespace. Helper sources are stored as *.sh.txt / *.mjs.txt.
Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0. No Docker command was run by this audit (no Compose
project ts-wp4-rca3 exists). Every CLI and server run set DATABASE_PATH and DATA_DIR explicitly under <work> (env.sh
exports them for the shell; each probe passes its own pair to every child). TEMP and TMP point to <work>/tmp. Capture
mode only; synthetic data only; nothing was sent, pushed, committed or deployed.

00-digest-before.txt              HEAD, origin/main, freeze tree and the source digest (ls-tree form and
                                  scripts/source-digest.mjs) in the repository before the audit (17:00 UTC); no non-handoff
                                  change in the working tree.
00b-export-digest-before.txt      git archive export of 972ccda: full tree id b0545cec... equals the freeze tree; digest equal.
10-delta.txt                      git diff --name-status cc34e7f 972ccda: 148 paths, 141 under handoff/, 7 outside, all WP4-FIXB3
                                  owned paths; package.json and package-lock.json blob-identical.
11-source-checks.txt              read-only checks: importers of the three changed modules; the importedPeriodError and
                                  isImportedTimesheet exports identical (B2 corrects B, whose awk range matched nothing); every
                                  area-A runtime, image and ops path blob-identical to cc34e7f and 0f7fba2 (C2 corrects the
                                  docs/10 file name of C); docs/07 hunk at line 46 only; word diff (H); limits equal the code.
12-npm-ci.txt                     npm ci on the export: exit 0, 161 packages, no deprecation line; fast-xml-parser absent;
                                  npm audit --omit=dev 0; full npm audit: 1 high in the dev-only source-map-js (lock "dev": true).
13-verify.txt                     npm run verify with DATA_DIR and DATABASE_PATH exported and NODE_OPTIONS=--trace-deprecation
                                  --pending-deprecation: exit 0; 76 files / 1755 tests; SMOKE PASSED (41 PASS); the only
                                  "deprecat" match is the echoed NODE_OPTIONS line; the exported DATA_DIR stays empty.
13b-smoke-compare.txt             the 41 smoke check names equal attempt 2's (the one diff line is the address that attempt 2's
                                  evidence had masked; after masking here both sides read <email>).
14-image-build-steps.txt          the Dockerfile build-stage commands on a second export without Docker (npm ci;
                                  build:server --sourceMap false; BUILD_SOURCEMAPS=off build:client): dist 116 files, 0 *.map,
                                  0 sourceMappingURL; the FIXB3 reader code is in it. Control: the local verify build keeps maps.
15-regate3-drill-read.txt         the WP4-REGATE3 drill result read (208 PASS, 33/31/57/35/27/23) and compared with attempt 2's
                                  drill: identical check names; the served bundle equals this audit's image-equivalent bundle
                                  (same content-hashed name; decoded length 454,172, which the drill labels "bytes"; 454,210
                                  bytes on disk); the area-A lines of stages 1-5 (sections repeat; the second extract is complete).
20-p2-backup-restore.txt          attempt-1 probe P2 rerun: backup under three writers, isolated restore, hashes, balances: 31 PASS.
21-p8-admin-privacy.txt           P8 rerun: operations status and account list exact allowlists: 8 PASS.
22-p4-targets.txt                 P4 rerun: backup and restore target boundaries, tampered backups: 16 PASS.
23-p7-retention-sweep.txt         P7 rerun: F-4 retention window and the daily sweep while paused: 23 PASS.
24-p3-prune.txt                   P3 rerun: junction escapes, selection, dry run, R-A1 scenario B: 10 PASS.
25-ra1-prune.txt                  R-A1 and prune probe rerun: 24 PASS; same-second tie and paired-backup measurements (INFO).
26-a03-bootstrap.txt              A-03 bootstrap refusal probe rerun: 15 PASS; the setup token is redacted by the probe.
27-probe-compare.txt              the check lines of the seven probes equal attempt 2's (0 diff lines each).
28-validate-package.txt           handoff/delivery/validate_package.py --preflight after the report pair and the task record
                                  were written.
29-precommit.txt                  scripts/precommit-check.mjs over this task's owned files staged in a private git dir outside
                                  the repository (precommit.sh.txt), run last after every edit.
99-digest-after.txt               HEAD, repository digest and export digest after the checks (unchanged).
99b-digest-final.txt              the same, rechecked after the reports, the task record and the evidence were written.
probe-copy.sh.txt                 how the attempt-1 probes (evidence/WP4-RECHECK-A/*.mjs.txt) were copied for the rerun: header
                                  line removed, synthetic example.invalid addresses restored, no other change; run lines in 20-26.
bundle-size.mjs.txt               byte length versus decoded string length of the image-equivalent client bundle.
env.sh.txt, digest-export.sh.txt, mask.mjs.txt, precommit.sh.txt   helper scripts.

Procedure notes:
- 11-source-checks.txt keeps two wrong first attempts (B: an awk range that did not match an exported const; C: a wrong
  docs/10 file name) followed by the corrected checks B2 and C2. Both were read-only.
- In 12-npm-ci.txt one header line names "npm ls --all --omit=dev | wc -l"; only "npm ls fast-xml-parser" ran, and the
  "node -p" header in 12c ran nothing (the lock entry was read with grep).
- No probe failed; no command was rerun after a failure.
