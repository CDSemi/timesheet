# Operations runbook

This runbook is for the person who installs and keeps the Timesheet application on the owner's Synology NAS. It uses the commands that exist in the code at the WP4 freeze. English is authoritative; [11_OPERATIONS_RUNBOOK.vi.md](11_OPERATIONS_RUNBOOK.vi.md) is the translation. The rules it applies are in [07 Operations](07_DEPLOYMENT_AND_OPERATIONS.md) and [03 Architecture](03_ARCHITECTURE_AND_DATA.md).

**Status: the NAS target is NOT VERIFIED.** Every command below was exercised only by the WP4 container drill on a developer workstation (Docker Desktop, linux/amd64, capture mode, synthetic data). Nothing has been run on the owner's NAS, and no real email has been sent. A step is labelled in one of two ways:

- **[Drill stage N]**: executed by `npm run drill:container` (see "Drill stages" below) with the stage number.
- **[owner NAS step, unverified]**: a host step the drill cannot perform (DSM screens, Task Scheduler, a second device, the reverse proxy). Treat the first run on the NAS as the verification.

## Placeholders and conventions

Nothing in this runbook is a real value. Replace the placeholders on the NAS and keep the real values only in protected host files, never in git, chat, screenshots or logs.

- `<nas-host>`: the public HTTPS host name the reverse proxy serves.
- `<project>`: the Compose project name; `<project-dir>`: the folder with the release export (`Dockerfile`, `compose.example.yaml`).
- `<data-dir>`: the host-local folder mounted as `/data`; `<env-file>`: the protected environment file (mode 600).
- `<backup-dir>`: the host folder with the backups (`<data-dir>/backups`); `<backup-name>`: one backup folder, named `timesheet-backup-<UTC>-<8 hex>`.
- `<restore-dir>`: a new, empty host folder for a restore; `<proxy-ip>`: the address the application sees as the proxy's connection peer.
- `<compose>` stands for `docker compose --project-name <project> --file <project-dir>/compose.example.yaml`.
- `<cli>` stands for `node dist/server/cli.js` (the command line tool inside the image).

## Drill stages

The drill is `npm run drill:container -- --work <empty folder> --project <name> --wp3 <previous build folder>` (see [DEVELOPMENT](../DEVELOPMENT.md)). Stage 1 is install, bootstrap and restart; stage 2 is backup under writes; stage 3 is restore, outbound pause and reconciliation; stage 4 is upgrade from the previous schema; stage 5 is rollback; stage 6 is import and opening balance. Without `--wp3` stages 4 and 5 are skipped.

## 1. Install on Synology Container Manager

1. Check the NAS first **[owner NAS step, unverified]**: DSM with Container Manager installed, and the CPU architecture from `uname -m` (`x86_64` or `aarch64`). Not every NAS supports containers.
2. The image is pinned: the Dockerfile builds from `node:24.21.0-trixie-slim` by the digest of its multi-architecture index (`ARG NODE_IMAGE_DIGEST`), never `latest`. No registry is used: build the image from a clean export of the release commit placed in `<project-dir>`. The `.dockerignore` keeps the workbook, tests, handoff files and every `.env` file out of the image. The drill built the `linux/amd64` image; an `arm64` image was built only under emulation. **[Drill stage 1]** for the build on amd64; the build on the NAS itself **[owner NAS step, unverified]**.
3. The container runs as a fixed non-root user, UID and GID `10001`. The host folder must belong to that user **[owner NAS step, unverified]**:

   ~~~bash
   mkdir -p <data-dir>
   chown 10001:10001 <data-dir>
   chmod 700 <data-dir>
   ~~~

4. The data volume is one host-local folder mounted as `/data`: the database `/data/timesheet.db`, private files `/data/private-data` (PDFs, signatures, import sources, capture) and backups `/data/backups`. It must be a local volume of the NAS, never a remote SMB or NFS share and never a synchronized folder. **[Drill stage 1]** for the mount; the NAS file system **[owner NAS step, unverified]**.
5. Copy `.env.example` to `<env-file>`, mode 600, and set at least `APP_ORIGINS`, `PUBLIC_BASE_URL` (https), `MAIL_FROM` and `TRUSTED_PROXY_ADDRESSES`. Production refuses to start without an explicit absolute `DATA_DIR` and `DATABASE_PATH`, `APP_ORIGINS` and `PUBLIC_BASE_URL`. Leave `OUTBOUND_MODE=capture` and never set `PRODUCTION_SENDING_ENABLED`: real sending belongs to the WP5 pilot, after the owner's authorization. The application needs no session secret; SMTP credentials are the only secret it can hold. **[Drill stage 1]** (the drill writes a synthetic env file).
6. Network: the Compose example publishes the port on loopback only (`127.0.0.1:3000`). Put the Synology reverse proxy in front with HTTPS and forward to that port; never publish the port to the internet. Set `TRUSTED_PROXY_ADDRESSES` to the exact IP address of the proxy as the application sees it as the connection peer (no CIDR, no host names), for example the Docker bridge gateway. Left empty, every forwarded header is ignored and all clients share the sign-in rate limit of the proxy's address. **[owner NAS step, unverified]**
7. Time: enable NTP in DSM so that deadlines, backups and expiry instants are right **[owner NAS step, unverified]**.
8. Start and check:

   ~~~bash
   <compose> up --detach --build
   <compose> ps
   <compose> logs --no-color timesheet
   ~~~

   The service must become healthy (the health check calls `/api/ready`). **[Drill stage 1]**

## 2. NAS verification checklist

Tick each item on the NAS and record the date; until then the NAS is NOT VERIFIED. Every item is an **[owner NAS step, unverified]**.

- [ ] Architecture (`uname -m`), DSM and Container Manager versions recorded.
- [ ] `<data-dir>` is on a local volume (not SMB, NFS or a synchronized folder), owned by UID/GID `10001`, mode 700.
- [ ] `<env-file>` is mode 600 and holds no value that is also in git or chat.
- [ ] The service is healthy after `up`, after `<compose> restart`, and after a NAS reboot (`restart: unless-stopped`).
- [ ] `https://<nas-host>/api/ready` answers 200 with the schema numbers only, and `https://<nas-host>/api/health` answers 200.
- [ ] The Setup screen appears once, and the administrator can sign in (section 3).
- [ ] Sign-in rate limiting is per client (two clients behind the proxy are not blocked together), which shows `TRUSTED_PROXY_ADDRESSES` is right.
- [ ] NTP is on and the NAS clock is correct.
- [ ] A synthetic submission renders its PDF (fonts are in the image) and its mail lands in capture, not on the network.
- [ ] A backup, an isolated restore and the reconciliation steps (sections 4, 6 and 7) work on the NAS with synthetic data, and the separate-device copy exists.
- [ ] The administrator status shows the backup, the free disk space and the outbound mode (section 12).
- [ ] The independent host alert (section 11) fires on a test.

## 3. First-run bootstrap

A new installation has no calendar and no administrator. The bootstrap creates the company calendar and the default policy once, then issues a one-time setup token. Nothing personal is in the file.

1. Prepare `<data-dir>/bootstrap.json` with the company calendar, holidays, payroll rules and default policy, in the shape of `reference/examples/*.json`. The file is validated before any database is opened. A refusal names the failing field and rule and may quote a date or a policy number from the file (for example an invalid holiday date or a minutes mismatch); it never quotes a name, the reporting zone or a secret.
2. Run the bootstrap in the running container. It prints counts and the setup token once; the token is shown only on this terminal and only its hash is stored. **[Drill stage 1]**

   ~~~bash
   <compose> exec -T timesheet <cli> bootstrap --config /data/bootstrap.json
   ~~~

3. Open `https://<nas-host>/`, type the token on the Setup screen and create the first administrator (email, display name, password of 12 to 256 characters). The token is valid for 60 minutes and works once; a wrong, expired or replayed token gets one identical refusal. **[Drill stage 1]**
4. If the token expired unused, print a new one. This works only while no administrator exists. **[owner NAS step, unverified]** (covered by `tests/integration/bootstrap.test.ts`, not by the drill)

   ~~~bash
   <compose> exec -T timesheet <cli> bootstrap --new-token
   ~~~

5. Never paste the token into chat, a ticket or a log. The synthetic `seed` command is refused in production; the administrator creates the real accounts in the application. Passwords are temporary and there is no change-password route in WP4 (decision E-11, see [10 Decisions](10_DECISIONS_AND_SOURCES.md)).

## 4. Backup schedule

Targets (to be tested, not guarantees): a nightly backup, a 24-hour recovery point and a one-hour restore.

1. A backup is consistent while the server keeps writing: it uses SQLite's online backup, copies the private files the copy refers to, checks each hash, and writes `manifest.json` into a new folder `<backup-name>` under `<backup-dir>`. The target must be outside `DATA_DIR` (`/data/private-data`); `/data/backups` is accepted. It prints counts only and exits 0 (succeeded), 1 (failed, recorded) or 2 (refused). **[Drill stage 2]**

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups
   ~~~

2. Schedule it nightly in DSM Task Scheduler as a user-defined script that runs the same command with `--prune` (retention in section 5). The command with `--prune` removes old backups only after the new one succeeded. **[Drill stage 2]** for the backup; `--prune` itself is covered by `tests/integration/backup-prune.test.ts` and the drill runs its dry run; the Task Scheduler entry **[owner NAS step, unverified]**.

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups --prune
   ~~~

3. A backup on the same volume does not protect against losing the disk. Copy `<backup-dir>` to a separate device (Synology Hyper Backup or a USB disk) after each backup. This is an owner setup step, not application code (owner decision F-5). Backups hold personal data, PDFs and signatures: protect them like the live data. **[owner NAS step, unverified]**
4. Check the result: the printed line has `"outcome":"succeeded"`, and the administrator status shows the last success and its age (section 12).

## 5. Retention

- **Backups (F-5).** `--prune` keeps the newest backup of each of the last 7 UTC days, of the last 4 ISO weeks and of the last 6 UTC months, and always the newest one. It acts only on folders the backup tool created (the exact folder name and a valid manifest); every other entry is only counted. The windows are calendar windows from the clock, so after a long gap in backups only the newest survives. If any backup is dated after the host clock (a clock set back), `--prune` and the dry run refuse the whole run with exit 2 (`clock_behind_backups`) and remove nothing: fix the host time first. The last prune result is not recorded in the administrator status. Preview a prune; it removes nothing: **[Drill stage 2]**

  ~~~bash
  <compose> exec -T timesheet <cli> backup prune --in /data/backups --dry-run
  ~~~

- **Job rows (F-4).** A daily job deletes only succeeded `deadline_scan` and `reminder_scan` rows older than 30 days. It never deletes delivery, PDF or send rows. Nothing needs scheduling: the server's runner does it. The last run and the number of rows it deleted are in the `GET /api/admin/operations` JSON (`operations.retention`); the administrator screen does not show them. Covered by `tests/integration/job-retention.test.ts`, not by the drill.
- **Orphan files.** A daily sweep removes private files that no row refers to and that are older than 24 hours; it never removes a referenced file, including an import source. Covered by `tests/integration/jobs-sweep.test.ts`, not by the drill.
- Timesheets, the ledger, revisions and the audit trail are never deleted. Watch the free disk space (section 12).

## 6. Isolated restore

Restore into a new empty folder, never over the live data. The tool refuses a target inside the live `DATA_DIR` or one that holds the live database. It verifies the manifest hashes, the integrity check and the schema (it refuses a newer schema), copies the database and files, sets the outbound pause with the reason `restored`, and prints counts and the manifest check only. Exit 0, 1 (a failed check; nothing is left behind) or 2 (refused).

1. Choose `<backup-name>` (the newest, or the one a rollback needs) and create an empty `<restore-dir>` owned by UID/GID `10001` **[owner NAS step, unverified]**.
2. Restore in a one-off container with no network and a read-only root, as the drill does. **[Drill stage 3]**

   ~~~bash
   docker run --rm --read-only --network none --tmpfs /tmp:size=64m,mode=1777 --env-file <env-file> \
     --volume <backup-dir>:/backups:ro --volume <restore-dir>:/restore \
     <image> <cli> restore --from /backups/<backup-name> --to /restore
   ~~~

3. The result is `<restore-dir>/timesheet.db` and `<restore-dir>/private-data`. To inspect it, stop the live instance first (never run two queues on the same data, and never let the old and the restored production queues run together), then start a second instance whose `/data` is `<restore-dir>`, in capture mode, under its own Compose project name. **[Drill stage 3]** (the drill stops the source, then starts the restored instance)
4. Check the integrity result, the users, representative OT balances, revision counts, the files with their hashes and one PDF. The restored instance logs `Outbound delivery PAUSED since <UTC instant> (reason: restored)` at start and shows the pause banner in the administrator status. Nothing is sent until section 7 is done. **[Drill stage 3]**
5. Import sources are restored with their hashes, so restored imports still have their source files. **[Drill stage 3]**

## 7. Reconciliation after a restore

A restore holds every queued or leased `send_email` and `send_reminder` job of the backup, and marks every interrupted send as uncertain. Mail the source may already have sent must never go out again. Jobs created after the restore are not held; they wait only for the resume. Every step below is audited as a system event.

1. List what is held. Without `--confirm` the command only prints job ids, kinds, attempts and blockers, and exits 2. **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound release
   ~~~

2. For each held send, check the real mailbox (or the capture folder) to see whether the source already delivered it. For each uncertain delivery attempt, record the decision in the application's delivery history first; the resume is refused while any attempt awaits a decision.
3. Preview the resume, then clear the pause. With `--confirm` it succeeds only when no attempt awaits a decision (exit 1 otherwise). **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound resume
   <compose> exec -T timesheet <cli> outbound resume --confirm
   ~~~

4. Release one held send, or all of them after the printed count. A release is refused with `attempt_uncertain`, `delivery_attempt_open` or `superseded_by_later_send` when the send could be a duplicate; a released job then follows the normal send rules and goes out exactly once. **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound release --job <job-id> --confirm
   <compose> exec -T timesheet <cli> outbound release --all --confirm
   ~~~

5. Drop a held reminder that is no longer wanted (a held send cannot be dropped, only released or left held). **[owner NAS step, unverified]** (covered by `tests/integration/restore.test.ts`, not by the drill)

   ~~~bash
   <compose> exec -T timesheet <cli> outbound drop --job <job-id> --confirm
   ~~~

## 8. Upgrade and rollback

### Upgrade

1. Take and check a backup first, and note its folder name: it is the paired pre-upgrade backup for a rollback. Note the running image tag too. **[Drill stage 4]** (the drill takes the paired backup of the older schema with the new tool)
2. Build the new image from the new release export and start it. The migrations run once at start, under an exclusive lock, in one transaction; a restart applies nothing. **[Drill stage 4]**

   ~~~bash
   <compose> up --detach --build
   ~~~

3. Check `/api/ready` (the schema reaches the image's own latest number), the integrity and the administrator status. **[Drill stage 4]**

### Rollback

An older build refuses a database from a newer schema, so never just start the old image on an upgraded database. **[Drill stage 5]**

1. Stop the upgraded instance.
2. Restore the paired pre-upgrade backup with the new build's tool and `--keep-schema`, which does not migrate. A backup whose schema predates the outbound pause cannot hold a pause: without `--confirm` the restore refuses (exit 2, `unpaused_schema_unconfirmed`) and writes nothing; with `--confirm` it holds the backed-up send jobs and warns on stderr. **[Drill stage 5]**

   ~~~bash
   docker run --rm --read-only --network none --tmpfs /tmp:size=64m,mode=1777 --env-file <env-file> \
     --volume <backup-dir>:/backups:ro --volume <restore-dir>:/restore \
     <image> <cli> restore --from /backups/<paired-backup-name> --to /restore --keep-schema --confirm
   ~~~

3. Start the previous image on `<restore-dir>` with `JOB_RUNNER=off` in its environment. A restored older schema has no outbound pause, so jobs created after the rollback are not held: keep the runner off until reconciliation is done. The drill proved only that the previous build with its runner on sent nothing from the held jobs (`JOB_RUNNER=off` is the documented rule, not a drill step).
4. Reconcile. The previous build has no `outbound` command: reconciliation happens after upgrading again, which migrates the restored data and gives the pause and the release tools. Changes made after the paired backup are not in the restored copy.
5. If no migration was applied since the backup (a compatible schema), the previous image can start on the live data. This path is not drilled. **[owner NAS step, unverified]**

## 9. Refreshing the image digest

Refresh the base image when a security fix is published, and always together: the tag and the digest.

1. Read the digest of the multi-architecture index of the tag (it was read this way in WP4-T04, on the developer machine; not a drill stage). **[owner NAS step, unverified]**

   ~~~bash
   docker buildx imagetools inspect node:24.21.0-trixie-slim
   ~~~

2. Edit `ARG NODE_IMAGE_DIGEST` and the tag named in the Dockerfile comment together (and `.nvmrc` when the Node version changes). Never use `latest`.
3. Rebuild without cache and run the drill before deploying; the drill builds the image from the Dockerfile. **[Drill stage 1]**

   ~~~bash
   <compose> build --no-cache
   ~~~

4. Deploy as an upgrade (section 8). The change goes through the normal gate and commit rules of the project.

## 10. Workbook import and the opening balance

For the owner's people. Each person imports only their own workbook; an administrator cannot import for anyone else (owner decision F-1). The application never reads the workbook's formulas, macros or external links.

1. Sign in and open Import (`#/import`). Upload one `.xlsx` file of at most 2 MiB (a macro-enabled workbook is refused). The preview lists every day with its source cell, the unknown labels, duplicates, floating holidays, the known defects of the template and the conflicts with existing records. **[Drill stage 6]** (API; the screens are covered by `tests/e2e/import.spec.ts`)
2. Decide each listed day. The default is skip; only the choices the preview allows are offered. Then review and commit. **[Drill stage 6]**
3. The imported period shows "Imported, unverified". It is read-only history: no ledger events, no sign-off or submission (409 `imported_period`), no reminders and no automatic sends. Uploading the same file again, or committing twice, changes nothing ("Already imported"). **[Drill stage 6]**
4. The opening OT balance is the only OT carry-in. Enter signed non-zero minutes, an as-of date, a reason and an evidence reference, then confirm. It posts once; a repeat is a no-op, and a different value is refused. Change it only by a reasoned correction (a correction that would leave a net zero is refused, open question I-4). **[Drill stage 6]**
5. What the import does not do: it never creates work sessions or clock times, OT, sign-offs or sends; "Off day (overtime used)" is skipped (I-2); a draft period of the application never receives imported days (I-1); a period that has not ended, or has ended but is not yet due for payroll, is skip-only (I-3 and its safe default, document 10).
6. Keep the personal workbook out of git, chat and the image. The tracked template is a sanitized sample and is never re-saved.

The API routes behind these screens, all owner only: `POST /api/imports`, `GET /api/imports`, `GET /api/imports/{id}`, `POST /api/imports/{id}/commit`, and `GET`, `POST` and `PUT /api/ot/opening-balance`.

## 11. An independent host alert

The application cannot report its own failure over its own mail: broken SMTP cannot tell you that SMTP is broken, and a stopped container cannot report itself. Add a check that runs outside the application **[owner NAS step, unverified]**:

1. A second DSM Task Scheduler task, daily, as a user-defined script. It alerts when the newest folder of `<backup-dir>` is older than the limit (26 hours matches the application's warning) or when the free space of the data volume is below a limit you choose:

   ~~~bash
   find <backup-dir> -maxdepth 1 -name 'timesheet-backup-*' -mmin -1560 | grep -q . || echo "backup too old"
   df -h <data-dir>
   ~~~

2. Route the alert through DSM's own notification service (Control Panel, Notification), not through the application's SMTP.
3. Also watch the container's health in Container Manager.
4. Test the alert once by moving the limit so that it fires.

## 12. What the administrator status shows

An administrator sees operations and delivery, never timesheet details (docs/03). The screen reads `GET /api/admin/operations`, and the account list shows a "Not set up" flag for an account that never saved its submission settings. The route returns a little more than the screen shows: the retention run (below) is in the JSON only.

- Runner heartbeat, the automation activation instant, the sender mode and flag, and job and delivery totals.
- Backup: the last outcome, the last attempt and last success instants, the fault code and the age since the last success (a warning after 26 hours, an error when the latest attempt failed).
- Disk: free and total bytes of the data volume (never a path).
- Outbound: whether sending is paused, since when and why (`restored`), the number of deliveries that await a decision, and the queued and held send jobs.
- Retention (in the `GET /api/admin/operations` JSON only, not on the screen): when the job-row cleanup last ran and how many rows it deleted.
- Per person: periods that have a revision with recipients, with redacted fault codes.

**[Drill stage 3]** reads the outbound pause from this route after a restore; **[Drill stage 2]** produces a backup that the status reports. Not shown: the result of the last `--prune`, and anything about the host. That is why section 11 is needed.

## Command map

| Command or step | Where it was verified |
|---|---|
| `<compose> up --detach --build`, `ps`, `logs`, `restart` | Drill stage 1 |
| `<cli> bootstrap --config /data/bootstrap.json` | Drill stage 1 |
| `<cli> bootstrap --new-token` | Owner NAS step, unverified (integration test only) |
| `<cli> backup --to /data/backups` | Drill stage 2 |
| `<cli> backup --to /data/backups --prune` | Drill stage 2 (backup); `--prune` by integration test; Task Scheduler entry is an owner NAS step, unverified |
| `<cli> backup prune --in /data/backups --dry-run` | Drill stage 2 |
| `<cli> restore --from ... --to ...` in a one-off container | Drill stage 3 |
| `<cli> outbound release` (preview), `--job <id> --confirm`, `--all --confirm` | Drill stage 3 |
| `<cli> outbound resume`, `outbound resume --confirm` | Drill stage 3 |
| `<cli> outbound drop --job <id> --confirm` | Owner NAS step, unverified (integration test only) |
| Upgrade: `<compose> up --detach --build` on an older schema | Drill stage 4 |
| Rollback: `<cli> restore ... --keep-schema` (refused), then `--keep-schema --confirm` | Drill stage 5 |
| Previous build started with `JOB_RUNNER=off` | Owner NAS step, unverified (rule of docs/07) |
| `docker buildx imagetools inspect <tag>` | Owner NAS step, unverified (run once in WP4-T04) |
| `<compose> build --no-cache` | Drill stage 1 (the drill builds the image) |
| Import and opening balance through `/api/imports` and `/api/ot/opening-balance` | Drill stage 6 |
| NAS setup: folder owner, env file, reverse proxy, NTP, Task Scheduler, separate-device copy, host alert | Owner NAS step, unverified |
