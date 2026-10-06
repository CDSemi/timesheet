WP5-ASSESS-B evidence (fresh independent auditor, self-reported model claude-opus-5-5). Area B: reproducible release,
verified restore and operations. Reviewed commit 546cddaf6747aef85e8b6d9b7712de9e28f138bf; HEAD e7fe5144 (handoff only).
Recorded 2026-10-06 20:22Z to 20:50Z (UTC). Raw output stayed in <task> (D:\.claude-tmp\timesheet\WP5-ASSESS-B); these are
masked LF copies (<task>, <project>, <user>). Synthetic data, example.invalid only, capture mode only; PRODUCTION_SENDING_ENABLED
never set. Node v24.21.0 portable first on PATH, npm 11.18.0 with script-shell = Git Bash bash.exe (no cmd.exe), Docker 28.5.1,
Compose v2.40.2-desktop.1, git 2.55.0. DATA_DIR and DATABASE_PATH were set inside <task> for every CLI and server run (env.sh.txt);
each probe sets its own explicit paths under <task>/x1*, x2*, x3, c1. Ports used: 47721-47725, 47730 (task range 47720-47739).

Files
- 00-baseline-before, 00-digest-before, 00-export-digest-before: HEAD, git status, digest in three forms before any run.
- 01-npm-ci: two clean `git archive 546cdda` exports (identical tar, sha256 7dc39d6a...), npm ci in each, lockfile unchanged, 0 deprecation lines.
- 02-npm-audit: --omit=dev 0 vulnerabilities; full audit 1 high (source-map-js via vite > postcss, dev only).
- 03-build, 04-dist-compare, 04-dist-hashes-export1: `npm run build` in both exports; 230 dist files byte-identical (tree a7371fb8...).
- 05-wp3-prep: `git archive 49651c8`, npm ci, build:server for drill stages 4-5.
- 06-docker-before: no container, image, network or volume with the prefix ts-wp5-assess-b.
- 07-drill, 07-drill-summary, 07-drill-build-log: `npm run drill:container -- --work <task>\drill --project ts-wp5-assess-b --wp3 <task>\wp3`
  exit 0, 208 PASS 0 FAIL (33/31/57/35/27/23). Note: every build step was CACHED (image created 19:14Z by an earlier build).
- 08-image-forbidden-scan (image-scan.mjs.txt): independent scan of the drill's image file list, 12 rules, FORBIDDEN TOTAL 0; prod packages 16/16, dev packages 0.
- 09-image-inspect: drill image id sha256:75f50c10..., 110002030 bytes, User 10001:10001, no labels, 10 layers.
- 10-xrestore-run1..5 (xrestore.mjs.txt; run 3 used xrestore-run3.mjs.txt; runs 1-2 used earlier revisions of the same probe):
  host-route independent restore of a backup holding a finalized period, a correction revision, an OT reservation and a partial
  OT use. run1: 2 FAIL = probe error (post-backup session overlapped a seed session, 422; the point-in-time check then had no
  extra row). run2 48/0. run3 (uncertain mode) 4 FAIL = probe expectation errors (analysed in the review). run4 (uncertain) 63/0.
  run5 (plain, final probe) 50/0. 10-operations-json-sample: administrator operations JSON of a restored and a source instance.
- 11-container-restore (compare-restores.mjs.txt): the run-4 host backup restored by the host build and by the image in the
  docs/11 section 6 one-off container form; attempt 1 failed only because Git Bash rewrote /backups and /restore (MSYS path
  conversion), attempt 2 with MSYS_NO_PATHCONV=1 exit 0; table comparison equal after masking restore instants and audit ids.
- 12-runbook-compose-config: `docker compose config` of the docs/11 <compose> form: case 1 fails (env file not found), case 2
  binds <project-dir>/data, image timesheet:local, port 3000; case 4 shows the four TIMESHEET_* variables in <project-dir>/.env work.
- 13-restored-instance-compose: docs/11 section 6 step 3 with the four variables: healthy, pause line, held send blocked
  (attempt_uncertain), resume --confirm refused (exit 1), uid 10001, down by project name.
- 14-base-image-digest: `docker buildx imagetools inspect node:24.21.0-trixie-slim`: index now 173f1258..., pin 8ec5d755... (older rebuild).
- 15-build-no-cache: docs/11 section 9 step 3 `<compose> build --no-cache`: new image id 62fb1101... for the same source;
  the previous image id is no longer addressable ("No such image"); layers 1-6 equal, 7-10 differ.
- 16-image-dist-compare, 16-dist-hashes-image: /app/dist of the no-cache image equals a local image-style build of a third
  clean export byte for byte (116 files); no sourceMappingURL in /app/dist.
- 17-ops-cli-run1/run2 (ops-cli.mjs.txt): production-mode host CLI: bootstrap --new-token, seed/run-jobs refusals, backup --prune,
  prune dry run, health/ready privacy. run1 1 FAIL = probe expectation (the setup route sets no cookie); run2 16/0.
- 18-runner-off (runner-off.mjs.txt): paired schema-6 backup restored with --keep-schema --confirm, previous WP3 build started
  with JOB_RUNNER=off: no job, attempt or PDF moved in 25 s.
- 19-host-alert: docs/11 section 11 commands on synthetic folders (Git Bash GNU find).
- 20-verify: `SMOKE_PORT=47725 NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` on export 1: exit 0,
  76 files, 1758 tests, SMOKE PASSED 41 PASS, 0 deprecation lines.
- 98-docker-final: image removed by exact tag, project down by name; docker ps --all --filter name=ts-wp5-assess-b empty.
- 98-process-final: no listener on 47720-47739; no portable Node 24 process at the end.
- 99-digest-after: digest unchanged in the repository, the ls-tree form (HEAD and 546cdda) and the three exports.
- Probes (*.mjs.txt) and env.sh.txt are the exact files run (mask.mjs.txt masks the evidence copies).
