WP5-FINAL-AUDIT evidence (fresh independent auditor, self-reported model claude-opus-5-5). Final WP5 audit on the
package-final freeze: recheck of WP5-B-01 and WP5-B-02, area B on the new digest, and an integration pass over the
release notes, the runbook additions and the pilot packet.
Reviewed commit 74d5bfec6700126da4105b5d97f5efe943f896f5 (WP5-GATE freeze_commit; HEAD = origin/main before and after).
Digest 0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba, 779 files, handoff/ excluded, equal before and
after in the repository (scripts/source-digest.mjs), in the git ls-tree form and on two clean git archive exports.
Recorded 2026-10-06 22:09Z to about 22:35Z (UTC). Raw output stayed in <task> (the task folder on the scratch drive);
these are masked LF copies (<task>, <project>, <user>, <setup-token>). Synthetic data, example.invalid only, capture mode
only; PRODUCTION_SENDING_ENABLED never set; no real mail. Git Bash only (npm script shell = Git Bash bash.exe), Node
v24.21.0 portable first on PATH, npm 11.18.0, Docker 28.5.1, Compose v2.40.2-desktop.1. DATA_DIR and DATABASE_PATH were
set inside <task> for every CLI and server run (env.sh.txt). Ports: 47761 (the B-01 live and restored instances, one at
a time), 47762 (smoke). The drill and its previous-build servers use OS-chosen loopback ports by design (WP5-PLAN B).
Compose projects: ts-wp5-final (drill), ts-wp5-final-live, ts-wp5-final-live-restored; one-off containers
ts-wp5-final-restore-1 and ts-wp5-final-live-timesheet-run-*; images ts-wp5-final-timesheet:drill and :74d5bfe.

Files
- 00-digest-before, 01-export-digest-before: HEAD, repo digest, ls-tree digest; two git archive tars identical
  (sha256 4ec8136a...), both exports 0a64a75f... (779 files), export listing equal to the ls-tree listing.
- 02-npm-ci: npm ci in both exports, exit 0/0, 161 packages, lockfile sha256 dda35f8b... unchanged, 0 deprecation lines.
- 03-build, 04-dist-hashes-export1: npm run build in both exports exit 0/0; 230 dist files, 4,044,281 bytes, byte-identical;
  equal file for file to the WP5-ASSESS-B dist of 546cdda (the application build did not change).
- 05-diff-scope: 546cdda..74d5bfe outside handoff/: .env.example, compose.example.yaml, README (EN, VI), docs/11 and
  docs/12 (EN, VI), tests/integration/ac13-*.ts only.
- 06-wp3-prep: git archive 49651c8, npm ci, build:server (the previous build for drill stages 4-5).
- 07-docker-before: nothing with the prefix ts-wp5-final existed.
- 08-drill, 08-drill-time: npm run drill:container -- --work <task>\drill --project ts-wp5-final --wp3 <task>\wp3 from
  export 1: exit 0, DRILL STAGES 1-6 PASSED, 208 PASS, 0 FAIL (33/31/57/35/27/23), 22:12:36Z to 22:17:43Z.
- 09-parity, 09-parity-readme-546cdda (parity.mjs.txt): EN/VI structure of docs/11, docs/12, the packet, README and
  WP5_HANDOFF. The .env.example pair in 09-parity is a self-comparison typed by mistake and means nothing.
- 10-image-forbidden-scan (image-scan.mjs.txt), 11-image-inspect: drill image file list, 12 rules, FORBIDDEN TOTAL 0,
  /app = dist, node_modules, package.json; 10/10 production packages, 0 devDependencies; User 10001:10001.
- 12-compose-config, 12-compose-config-cwd-project: docker compose config of the three documented forms (<compose>,
  <compose-restored>, <compose-previous>) with the four variables in <project-dir>/.env (b01-project-dotenv.txt), run
  from a working directory without .env; all exit 0 and bind the documented env file, data or restore folder and image.
- 13-migrate-first: runbook section 16 step 1, <compose> run --rm --no-deps -T timesheet <cli> migrate on a fresh
  <data-dir> (-T added for non-TTY): built the image, applied schema 1-13, exit 0.
- 14-live-up: section 1 step 8 (up --detach --build, ps, logs, docker image inspect): healthy, image id recorded.
- 15-bootstrap (token masked), 16-seed, 16-seed-presession (b01-api.mjs.txt): synthetic admin, employee, signature,
  one signed-off period with a rendered PDF. Run 1 of the seed sent a local offset instead of a UTC instant for the first
  session (422 invalid_instant, a probe error); the presession step recorded it after the probe fix.
- 17-check-live: health/ready shape, operations JSON (sender {configured, outbound_mode}, no sending-flag field).
- 18-activation-browser-run1/run2 (b01-browser.mjs.txt): runbook section 13 step 5 console call executed VERBATIM from the
  export's docs/11 in headless Edge after a UI sign-in; past instant 422 activation_in_past, blank reason 422
  reason_required, set and clear (section 14 step 1) work, 403 origin_rejected from an origin not in APP_ORIGINS. Run 1
  read a stale admin screen after the set (a same-document hash navigation, probe error); run 2 reloads: 9 PASS, 0 FAIL.
- 19-env-reread: OUTBOUND_MODE=smtp without the flag: <compose> restart keeps the old environment; up --force-recreate
  --no-build rereads it and the server refuses to start naming the flag; cli.js migrate in the same environment exits 0.
  Reverted to the capture copy and recreated: healthy.
- 20-backup, 21-postbackup, 22-check-live-after-backup: section 13 step 3 commands (backup, ls -1, sha256sum of the
  manifest); a session written after the backup.
- 23-restore: live stopped first; section 6 step 1-2 restore in the documented one-off container form (with --name for the
  task prefix and MSYS_NO_PATHCONV=1 for Git Bash): exit 0, paused, manifest verified.
- 24-restored-instance, 25-check-restored: section 6 step 3 <compose-restored> up --detach --no-build: own project
  ts-wp5-final-live-restored, /data = <task>/b01/restore, the release image (same id), healthy, PAUSED log line, section 7
  outbound release and resume previews (exit 2); API: pre-backup session 200, post-backup session 404 (point in time),
  revision with PDF, operations outbound paused reason restored, backup "never" (R-B5-4).
- 26-backup-facts-run1/run2 (backup-facts.mjs.txt): manifest keys (no configuration), file and database hashes, 4 activation
  audit events with a reason, integrity ok. Run 1 had two probe errors (stored-file names, a column name).
- 27-b01-down, 28-docker-cleanup: both projects down by name; images removed by exact tag.
- 29-verify, 29-verify-time: SMOKE_PORT=47762 NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify on
  export 1: exit 0, 77 files, 1,759 tests, SMOKE PASSED, 0 deprecation lines.
- 30-env-keys-docs11-12, 30-env-keys-packet (env-keys.mjs.txt): every env key named exists in .env.example or
  src/server/config.ts (JOB_RUNNER and STATIC_DIR in .env.example and src/server/index.ts); the TIMESHEET_* names are
  Compose variables; NODE_IMAGE_DIGEST is a Dockerfile ARG; SQLITE_BUSY is an error code.
- 31-ac13-run1/run2/tz-tokyo: the AC-13 test alone, exit 0 each.
- 32-npm-audit-omit-dev: 0 vulnerabilities.
- 33-claimed-digests: ls-tree digests of 8e99d2c, 85838b5 and 546cdda equal the figures claimed in docs/12 and the briefs.
- 34-base-image-digest: node:24.21.0-trixie-slim index is 173f1258..., the Dockerfile pins 8ec5d755... (R-B5-2 open).
- 35-preflight: validate_package.py --preflight PASS (89 translation pairs).
- 36-final-state: no listener on 47760-47779; docker ps --all --filter name=ts-wp5-final empty; no image, network or volume.
- 37-parity-review, 38-preflight-after-review: EN/VI structure of WP5_REVIEW_FINAL (equal except wrapped line count);
  validate_package.py --preflight PASS (90 pairs) after the report was written.
- 39-precommit: scripts/precommit-check.mjs --self-test and the check over this folder, the report pair and the brief
  (private temporary index inside <task>; the repository index untouched).
- 99-digest-after: HEAD and digest unchanged in all forms; the Compose <project-dir> export differs only by its .env.
- env.sh.txt, b01-*.txt and *.mjs.txt are the exact files run (mask.mjs.txt wrote these copies).
