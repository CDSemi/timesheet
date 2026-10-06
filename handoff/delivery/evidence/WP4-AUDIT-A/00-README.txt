WP4-AUDIT-A evidence (area A, operations), reviewed commit 13a258db86b2f0b6388830e584e2cca5303f1f6c,
source digest 1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe (774 files, handoff/ excluded).

Masking: <work> = the audit scratch folder outside Dropbox; <project> = the repository folder; <user> = the Windows
account name; <email> = a synthetic example.invalid address. ANSI codes removed, LF line ends, no trailing whitespace.
Probe sources are stored as *.mjs.txt. Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0, Docker 28.5.1
(Docker Desktop, linux/amd64), Compose project ts-wp4-aud-a (removed by the drill; its image removed by name at the end).
Every CLI and server run set DATABASE_PATH and DATA_DIR explicitly under <work> (the smoke inside npm run verify sets its
own DATABASE_PATH; see 02 and 02b for DATA_DIR). Capture mode only; synthetic data only; nothing was sent or deployed.

00-digest-before.txt            HEAD and source digest before the audit (repository).
01-npm-ci.txt                   npm ci on a clean git archive export of 13a258d: exit 0.
02-verify-with-data-dir.txt     first npm run verify with DATA_DIR exported: 75 files / 1710 tests pass, smoke capture
                                check FAIL (exit 1) because the smoke inherits DATA_DIR (finding WP4-A-04).
02b-smoke-data-dir.txt          files the smoke wrote into the caller's DATA_DIR, and the smoke env block.
03-verify.txt                   npm run verify with DATA_DIR unset: exit 0, 75 files / 1710 tests, SMOKE PASSED.
04-wp3-prep.txt                 previous build for drill stages 4-5: git archive 49651c8, npm ci, build:server (exit 0).
05-drill.txt                    full container drill, stages 1-6: exit 0, 205 PASS / 0 FAIL.
10-p1-migrate.txt               migration runner probe (rollback, foreign_keys restore, FK violation, busy, nested,
                                older binary, checksum, concurrent openers).
11-p1b-concurrent.txt           concurrent openers, 10 rounds x 6 processes x 3 starting states.
12-p2-backup-restore.txt        host backup under three writers, isolated restore, hashes, balances (SQL and API).
13-p3-prune.txt                 prune selection, dry run, NTFS junction escapes, backward clock measurement.
14-p4-targets.txt               backup/restore target boundaries with junctions; tampered backups.
15-p5-bootstrap.txt             production bootstrap token: hash only, 60 minutes, single use, --new-token, no leak.
16-p6-proxy-config.txt          TRUSTED_PROXY_ADDRESSES and the limiter, fail-fast configuration, health/ready bodies,
                                served client source map.
17-p7-retention-sweep.txt       F-4 retention window abuse attempts; runner pass while paused (retention, sweep).
18-p8-admin-privacy.txt         admin operations status and account list key paths (exact allowlists).
19-p9-outbound-cli.txt          outbound release/drop/resume confirmation rules and audit rows on a restored copy.
20-image-sourcemaps.txt         source maps in the drill image file list; build settings (finding WP4-A-01).
21-bootstrap-refusal-values.txt bootstrap refusal messages quote dates and policy numbers (finding WP4-A-03).
22-npm-audit.txt                npm audit: 1 high in source-map-js (dev only: vite > postcss); --omit=dev: 0.
99-digest-after.txt             HEAD, repository digest and export digest after the audit (unchanged).
p*.mjs.txt, mask.mjs.txt        probe and masking sources.

Probe reruns are disclosed at the top of the affected logs. Each first attempt failed on a probe defect, not a product
defect: P1 assumed foreign keys OFF by default, P2 used dates before the seeded calendar, P5 used an invalid policy, and
P8 omitted two WP3 activation keys from its own allowlist. P6 was rerun only to replace a literal password string.
The remaining FAIL lines in 10 and 11 are real behaviour (risk R-A2 of WP4_REVIEW_A): a brand-new database file opened by
several processes at once can return SQLITE_BUSY in openDatabase. migrate() is never applied twice, and the end state is
always consistent.
