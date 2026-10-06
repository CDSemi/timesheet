# Operations runbook

This runbook is for the person who installs and keeps the Timesheet application on the owner's Synology NAS. It uses the commands that exist in the code at the WP4 freeze. English is authoritative; [11_OPERATIONS_RUNBOOK.vi.md](11_OPERATIONS_RUNBOOK.vi.md) is the translation. The rules it applies are in [07 Operations](07_DEPLOYMENT_AND_OPERATIONS.md) and [03 Architecture](03_ARCHITECTURE_AND_DATA.md).

**Status: the NAS target is NOT VERIFIED.** Every command below was exercised only by the WP4 container drill on a developer workstation (Docker Desktop, linux/amd64, capture mode, synthetic data). Nothing has been run on the owner's NAS, and no real email has been sent. A step is labelled in one of two ways:

- **[Drill stage N]**: executed by `npm run drill:container` (see "Drill stages" below) with the stage number.
- **[owner NAS step, unverified]**: a host step the drill cannot perform (DSM screens, Task Scheduler, a second device, the reverse proxy). Treat the first run on the NAS as the verification.

Sections 13 to 16 (the WP5 pilot sections) were written from the code and the independent reviews. The drill never sends real mail and never activates automation, so every step in them is an **[owner NAS step, unverified]** and none carries a drill stage. They are used only after the owner's explicit authorization of real sending.

## Placeholders and conventions

Nothing in this runbook is a real value. Replace the placeholders on the NAS and keep the real values only in protected host files, never in git, chat, screenshots or logs.

- `<nas-host>`: the public HTTPS host name the reverse proxy serves.
- `<project>`: the Compose project name; `<project-dir>`: the folder with the release export (`Dockerfile`, `compose.example.yaml`).
- `<data-dir>`: the host-local folder mounted as `/data`; `<env-file>`: the protected environment file (mode 600).
- `<backup-dir>`: the host folder with the backups (`<data-dir>/backups`); `<backup-name>`: one backup folder, named `timesheet-backup-<UTC>-<8 hex>`.
- `<restore-dir>`: a new, empty host folder for a restore; `<proxy-ip>`: the address the application sees as the proxy's connection peer.
- `<image>`: the release image tag `timesheet:<release-commit>`, one tag per release (never `latest`, never a tag reused for a rebuild); `<previous-image>`: the tag of the release before it.
- `<compose>` stands for `docker compose --project-name <project> --file <project-dir>/compose.example.yaml`. Compose reads the four variables below from `<project-dir>/.env` (mode 600; it holds no secret, only paths and a tag), so every `<compose>` command binds the documented env file, data folder and image. Without that file Compose falls back to `./timesheet.env`, `./data` and `timesheet:local`, which is wrong on the NAS.

  ~~~bash
  TIMESHEET_ENV_FILE=<env-file>
  TIMESHEET_DATA_DIR=<data-dir>
  TIMESHEET_IMAGE=<image>
  TIMESHEET_PORT=3000
  ~~~

- `<compose-restored>` stands for `TIMESHEET_DATA_DIR=<restore-dir> docker compose --project-name <project>-restored --file <project-dir>/compose.example.yaml` (section 6). A variable set in the shell wins over `<project-dir>/.env`, so the restored instance binds `<restore-dir>` and has its own Compose project name; it never shares the live data or project.
- `<compose-previous>` stands for `TIMESHEET_IMAGE=<previous-image> TIMESHEET_DATA_DIR=<restore-dir> TIMESHEET_ENV_FILE=<rollback-env-file> docker compose --project-name <project>-rollback --file <project-dir>/compose.example.yaml` (section 8); `<rollback-env-file>` is a mode 600 copy of `<env-file>` with `JOB_RUNNER=off` added.
- `<cli>` stands for `node dist/server/cli.js` (the command line tool inside the image).
- Sections 13 to 16 add these placeholders: `<release-commit>`, `<source-digest>` and `<image-id>` (the release identity recorded in section 1 step 8 and in [12 Release notes](12_RELEASE_NOTES.md)); `<manifest-sha256>` (the SHA-256 of `<backup-dir>/<backup-name>/manifest.json`); `<activation-instant-utc>` (a future UTC instant written `YYYY-MM-DDTHH:MM:SSZ`); `<reason>` (a short text for the audit trail, never personal data).

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
5. Copy `.env.example` to `<env-file>`, mode 600, and set at least `APP_ORIGINS`, `PUBLIC_BASE_URL` (https), `MAIL_FROM` and `TRUSTED_PROXY_ADDRESSES`. Production refuses to start without an explicit absolute `DATA_DIR` and `DATABASE_PATH`, `APP_ORIGINS` and `PUBLIC_BASE_URL`. Leave `OUTBOUND_MODE=capture` and never set `PRODUCTION_SENDING_ENABLED`: real sending belongs to the pilot (section 13), after the owner's authorization. The application needs no session secret; SMTP credentials are the only secret it can hold. Then create `<project-dir>/.env` with the four variables of "Placeholders and conventions" (the `.env.example` header only suggests a path: `<env-file>` is wherever `TIMESHEET_ENV_FILE` points). **[Drill stage 1]** (the drill writes a synthetic env file and sets the four variables).
6. Network: the Compose example publishes the port on loopback only (`127.0.0.1:3000`). Put the Synology reverse proxy in front with HTTPS and forward to that port; never publish the port to the internet. Set `TRUSTED_PROXY_ADDRESSES` to the exact IP address of the proxy as the application sees it as the connection peer (no CIDR, no host names), for example the Docker bridge gateway. Left empty, every forwarded header is ignored and all clients share the sign-in rate limit of the proxy's address. **[owner NAS step, unverified]**
7. Time: enable NTP in DSM so that deadlines, backups and expiry instants are right **[owner NAS step, unverified]**.
8. Start and check:

   ~~~bash
   <compose> up --detach --build
   <compose> ps
   <compose> logs --no-color timesheet
   docker image inspect --format '{{.Id}}' <image>
   ~~~

   The service must become healthy (the health check calls `/api/ready`). Record the image ID that the last command prints at build time, with the release commit and the source digest: it identifies the release (a rebuild of the same source can give another ID). **[Drill stage 1]**

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
- [ ] A protected copy of `<env-file>` (mode 600) is kept with the separate-device backup copy, together with the release commit, source digest and image ID (section 4 step 3).
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

3. A backup on the same volume does not protect against losing the disk. Copy `<backup-dir>` to a separate device (Synology Hyper Backup or a USB disk) after each backup. This is an owner setup step, not application code (owner decision F-5). Backups hold personal data, PDFs and signatures: protect them like the live data. A backup holds no configuration, so keep a protected copy of `<env-file>` (mode 600, never in git or chat) with the separate-device copy, and the release commit, source digest and image ID of the release that wrote the data. Without them a restored instance cannot start (`APP_ORIGINS`, `PUBLIC_BASE_URL`, `MAIL_FROM`, `TRUSTED_PROXY_ADDRESSES` and, later, the SMTP credentials). **[owner NAS step, unverified]**
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

3. The result is `<restore-dir>/timesheet.db` and `<restore-dir>/private-data`. To inspect it, stop the live instance first (never run two queues on the same data, and never let the old and the restored production queues run together), then start a second instance whose `/data` is `<restore-dir>`, in capture mode, under its own Compose project name. Use `<compose-restored>` (section "Placeholders and conventions"); the image must already exist, so do not build. **[Drill stage 3]** (the drill stops the source, then starts the restored instance)

   ~~~bash
   <compose-restored> up --detach --no-build
   <compose-restored> ps
   ~~~

   Stop it with `<compose-restored> down` when the inspection is over.
4. Check the integrity result, the users, representative OT balances, revision counts, the files with their hashes and one PDF. The restored instance logs `Outbound delivery PAUSED since <UTC instant> (reason: restored)` at start and shows the pause banner in the administrator status. Nothing is sent until section 7 is done. **[Drill stage 3]**
5. Import sources are restored with their hashes, so restored imports still have their source files. **[Drill stage 3]**

## 7. Reconciliation after a restore

A restore holds every queued or leased `send_email` and `send_reminder` job of the backup, and marks every interrupted send as uncertain. Mail the source may already have sent must never go out again. Jobs created after the restore are not held; they wait only for the resume. Every step below is audited as a system event. Run the commands against the restored instance: write `<compose-restored>` where they say `<compose>`.

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

When the reconciliation is done, take a backup (section 4): a restored instance reports the backup as `never` until its own first backup.

## 8. Upgrade and rollback

### Upgrade

1. Take and check a backup first, and note its folder name: it is the paired pre-upgrade backup for a rollback. Note the running image tag and its image ID too (`docker image inspect --format '{{.Id}}' <image>`): the tag stays on that image, so it is the rollback target. **[Drill stage 4]** (the drill takes the paired backup of the older schema with the new tool)
2. Build the new image from the new release export under a new tag, one tag per release: set `TIMESHEET_IMAGE=timesheet:<new-release-commit>` in `<project-dir>/.env` (the old tag becomes `<previous-image>`), then build and start it, and record the new image ID as in section 1 step 8. Never rebuild under the old tag: that replaces the image a rollback needs. The migrations run once at start, under an exclusive lock, in one transaction; a restart applies nothing. **[Drill stage 4]**

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

3. Start the previous image (the tag `<previous-image>`, never a same-tag rebuild) on `<restore-dir>` with `JOB_RUNNER=off` in its environment, with `<compose-previous> up --detach --no-build` (it uses the rollback env file). A restored older schema has no outbound pause, so jobs created after the rollback are not held: keep the runner off until reconciliation is done. The drill proved only that the previous build with its runner on sent nothing from the held jobs (`JOB_RUNNER=off` is the documented rule, not a drill step).
4. Reconcile. The previous build has no `outbound` command: reconciliation happens after upgrading again, which migrates the restored data and gives the pause and the release tools. Changes made after the paired backup are not in the restored copy.
5. If no migration was applied since the backup (a compatible schema), the previous image can start on the live data. This path is not drilled. **[owner NAS step, unverified]**

## 9. Refreshing the image digest

Refresh the base image when a security fix is published, and always together: the tag and the digest.

1. Read the digest of the multi-architecture index of the tag (it was read this way in WP4-T04, on the developer machine; not a drill stage). **[owner NAS step, unverified]**

   ~~~bash
   docker buildx imagetools inspect node:24.21.0-trixie-slim
   ~~~

2. Edit `ARG NODE_IMAGE_DIGEST` and the tag named in the Dockerfile comment together (and `.nvmrc` when the Node version changes). Never use `latest`.
3. Set a new `TIMESHEET_IMAGE` tag first (section 8 step 2), then rebuild without cache and run the drill before deploying; the drill builds the image from the Dockerfile. A rebuild under the running tag replaces that image. **[Drill stage 1]**

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

- Runner heartbeat, the automation activation instant, whether a sender address is configured ("Sender address") and the outbound mode ("Outbound mode"; never the sending flag, which lives only in `<env-file>`), and job and delivery totals.
- Backup: the last outcome, the last attempt and last success instants, the fault code and the age since the last success (a warning after 26 hours, an error when the latest attempt failed).
- Disk: free and total bytes of the data volume (never a path).
- Outbound: whether sending is paused, since when and why (`restored`), the number of deliveries that await a decision, and the queued and held send jobs.
- Retention (in the `GET /api/admin/operations` JSON only, not on the screen): when the job-row cleanup last ran and how many rows it deleted.
- Per person: periods that have a revision with recipients, with redacted fault codes.

**[Drill stage 3]** reads the outbound pause from this route after a restore; **[Drill stage 2]** produces a backup that the status reports. Not shown: the result of the last `--prune`, and anything about the host. That is why section 11 is needed.

## 13. Pilot activation

Real sending and the activation instant need the owner's explicit authorization ([06 Acceptance](06_TEST_AND_ACCEPTANCE.md)). Do nothing in this section before it. Software readiness, owner permission, provider acceptance and recipient receipt are four separate facts; record each on its own. The choices below are recommended; owner decision pending (D-1 to D-15 in [WP5-PLAN](../handoff/delivery/tasks/WP5-PLAN.md) section D). The configuration keys are named here and their values live only in `<env-file>`. On DSM the data, backup and Docker commands in sections 13 to 16 need root (`sudo -i`): `<data-dir>` is mode 700 and owned by UID 10001. A browser may ask the operator to type "allow pasting" before a pasted console line runs.

1. Preconditions. If any is false, stop. **[owner NAS step, unverified]**
   - The authorization is in the owner's own record.
   - The section 2 checklist is ticked and dated (recommended; owner decision pending (D-13)); until then the NAS is NOT VERIFIED and the result is "software ready, pilot pending".
   - A backup, an isolated restore and the reconciliation (sections 4, 6, 7) worked on the NAS with synthetic data.
   - `<release-commit>`, `<source-digest>` and `<image-id>` are recorded (section 1 step 8).
   - The real values (`MAIL_FROM`, the `SMTP_*` keys, `PUBLIC_BASE_URL`, `APP_ORIGINS`, `TRUSTED_PROXY_ADDRESSES`) are in the owner's private copy, outside git, chat and screenshots.
2. Self-test in capture mode. Leave `OUTBOUND_MODE=capture` and `PRODUCTION_SENDING_ENABLED` unset. **[owner NAS step, unverified]**
   - The administrator status shows "Outbound mode: Capture only (nothing leaves the server)" and the activation "Not activated". The status has no field for the sending flag: check it in the file, `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `0` (it prints `1` when the flag is set; the command never prints a value).
   - With the two synthetic accounts of [07 Operations](07_DEPLOYMENT_AND_OPERATIONS.md) "Setup sequence" (addresses on `example.invalid`), sign off and submit one synthetic period. The capture folder under `/data/private-data` must hold exactly the configured recipients and the frozen body, and a PDF whose SHA-256 equals the PDF download. Nothing leaves the NAS.
   - Check `PUBLIC_BASE_URL` and `APP_ORIGINS`: open `https://<nas-host>/#/review/<payroll-date>` (the form of every reminder link); it must ask for sign-in and then open the review. A captured submission holds no link, and nothing decides a reminder before the activation instant is set. A state-changing request from that origin must be accepted.
   - Save the submission settings of the owner's account and of every other account that will exist, then deactivate the synthetic accounts in the administrator screen and make sure none has auto-submit on (section 16).
   - The administrator status must show no queued or leased send job. A job still queued when sending is switched on would be sent for real.
3. Pre-activation backup, with its name and hash. **[owner NAS step, unverified]**

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups
   ls -1 <backup-dir>
   sha256sum <backup-dir>/<backup-name>/manifest.json
   ~~~

   The backup prints `"outcome":"succeeded"`. `<backup-name>` is the newest folder (names sort by UTC time). Record `<backup-name>` and `<manifest-sha256>`: the manifest lists the hash of every file, so its own hash identifies the backup. Copy `<backup-dir>` to the separate device (section 4 step 3), and keep with it a protected copy of the capture-mode `<env-file>`: the rollback card (section 15) needs it.
4. Switch real sending on. **[owner NAS step, unverified]**
   - Edit `<env-file>` (mode 600): `OUTBOUND_MODE=smtp`; `PRODUCTION_SENDING_ENABLED=true`, exactly that value; `SMTP_HOST`; `SMTP_PORT`; `SMTP_SECURITY` as `starttls` or `tls`; `SMTP_USER` and `SMTP_PASSWORD` together, or neither; `MAIL_FROM` as one sender address that the provider accepts. Leave `PUBLIC_BASE_URL`, `APP_ORIGINS` and `TRUSTED_PROXY_ADDRESSES` as tested in step 2.
   - In SMTP mode without the flag the server refuses to start, and so do the CLI commands that read the mail settings (`backup`, `restore`); other commands do not. The message names the flag, never a value. A restart alone does not reread `<env-file>`, so recreate the container:

     ~~~bash
     <compose> up --detach --force-recreate --no-build
     <compose> ps
     <compose> logs --no-color timesheet
     ~~~

   - The administrator status now shows "Outbound mode: SMTP (real sending)", and `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `1`. The activation instant is still empty ("Not activated").
5. Set the activation instant. In the staged first period (step 6) leave it empty. When the owner decides to enable automation, sign in as the administrator, open the browser's developer console on `https://<nas-host>/` and run **[owner NAS step, unverified]** (there is no screen for it; the call is covered by the integration tests, not by the drill):

   ~~~js
   await (await fetch('/api/admin/automation/activation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active_from: '<activation-instant-utc>', reason: '<reason>' }) })).json()
   ~~~

   - The instant must not be in the past (422 `activation_in_past`) and a reason is required (422 `reason_required`). The origin must be listed in `APP_ORIGINS` (403 `origin_rejected`).
   - Only a period whose due instant is on or after both this instant and the account's own auto-submit instant is finalized automatically; an account that never saved its settings never is ([05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md) "Deadline and recovery"). Choose an instant after the first period has been signed off by hand.
   - The call is audited. Check that the administrator status shows the instant. It shows it in the browser's zone without a zone label, so `2027-01-01T00:00:00Z` reads as the local date and time of the browser.
6. The staged first period (recommended; owner decision pending (D-12)).
   - Manual sign-off with real sending; auto-submit off; no activation instant.
   - The first real send goes to the owner's own address. A change of recipients does not reach an existing revision (a changed envelope needs a new reviewed revision, [05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md) "Corrections and resends"), so set the recipients of the first period in the owner's settings before the sign-off, and decide with the owner whether payroll receives the first period's mail or a later revision.
   - Keep the Excel workbook as the comparison for that period.
   - Enable automation from the next period (step 5), and only after step 7 passes.
7. After the first real send. Provider acceptance and recipient receipt are separate facts; record each with its instant. **[owner NAS step, unverified]**
   - Provider acceptance: the delivery history of the revision shows the attempt as accepted with the provider's acknowledgement. A failure shows a redacted fault code: `smtp_auth_failed`, `smtp_tls_failed` and `smtp_config_invalid` are configuration faults to fix in `<env-file>` and recreate (step 4). A certificate verification failure is currently classified temporary: it retries and then needs intervention (recommended: classify it as permanent; owner decision pending (D-8)).
   - The link: once the activation instant is set (step 5), open the link of the first reminder that arrives. It must be `https://<nas-host>/#/review/<payroll-date>`, ask for sign-in and then open the review.
   - Recipient receipt: the owner confirms in the mailbox that exactly one message arrived from the `MAIL_FROM` sender, with the PDF, and that the PDF equals the one in the application (the spam folder included). An accepted message that never arrives is a provider or mailbox matter, not an application result.
   - An `uncertain` attempt is not sent again blindly: check the mailbox and the provider, then record the decision in the delivery history first (section 7 step 2, [05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md) "Durable delivery").
   - After a crash on real SMTP a reminder may arrive twice (recommended: accept; owner decision pending (D-7)).
   - The logs and the status hold no password or token. Take a backup after the first real period (section 4).
   - Anything unexpected: deactivate (section 14).

## 14. Deactivation

Deactivate when a send is wrong or unexpected, the provider fails, or the owner decides to stop. The data stay. **[owner NAS step, unverified]**

1. If the activation instant was set, clear it first, while the application runs (the call is audited and nothing is finalized automatically afterwards). Use the console call of section 13 step 5 with `active_from: null` and a reason. Check that the administrator status shows "Not activated".
2. Look at the administrator status for queued or leased sends. A send job that runs after step 4 writes to the capture folder: it is not mail. The owner's history shows it as "Accepted by the mail server", and only the API record of the attempt shows provider response `captured` and a provider id that starts with `capture-`. Wait until none is queued or leased (a healthy runner finds work within about a minute), or accept that those sends are captured and tell the recipient by hand.
3. Edit `<env-file>`: unset or delete `PRODUCTION_SENDING_ENABLED` and set `OUTBOUND_MODE=capture`. Remove the `SMTP_*` values from the file and keep them only in the owner's private copy.
4. Recreate the container so that the file is read, then check the status:

   ~~~bash
   <compose> up --detach --force-recreate --no-build
   <compose> ps
   ~~~

   The administrator status shows "Outbound mode: Capture only (nothing leaves the server)" and the activation "Not activated". Then check the file: `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` must print `0`.
5. Keep the data: never delete `<data-dir>`. Never run two queues: do not start another instance on the same data, and never start a restored instance (section 6) while the live one runs.
6. A period submitted in error stays on record (finalized, ledger posted, audited). It is corrected by a reasoned correction, never deleted ([05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md) "Corrections and resends").
7. Record the date and the reason in the owner's private log.

## 15. Rollback card for the first installation

The pilot is the first installation, so there is no older production schema or image to roll back to. Rolling back means stopping real sending and returning to Excel. Fill this card before activation. The owner's private copy holds the real values; the tracked copy holds only placeholders (recommended; owner decision pending (D-11)).

| Field | Value |
|---|---|
| Release commit | `<release-commit>` |
| Source digest | `<source-digest>` |
| Image ID built on the NAS | `<image-id>` |
| Pre-activation backup | `<backup-name>` |
| Manifest hash of that backup | `<manifest-sha256>` |
| Separate-device copy of the backup and the capture-mode `<env-file>` | where it is kept |
| Date of activation | the UTC instant |

1. Deactivate (section 14).
2. Keep the data. Do not delete `<data-dir>` or `<backup-dir>`.
3. Fall back to the Excel workbook for the period (the owner's own copy; the tracked template is only a sample). The application data remain the record of what was submitted.
4. Mail that was sent cannot be recalled. Read from the delivery history what went out, so that nothing is sent or entered twice by hand.
5. Restore only if the data are damaged or wrong, never over the live data. Check `sha256sum <backup-dir>/<backup-name>/manifest.json` against `<manifest-sha256>`, then restore `<backup-name>` in isolation (section 6) into a new real folder, and reconcile (section 7). The restored instance is paused, and changes made after that backup are not in it. For an inspection-only restored instance, point `TIMESHEET_ENV_FILE` at the protected capture-mode copy of `<env-file>` kept in section 13 step 3; the live file holds the SMTP mode and the flag after activation. Never run two queues.
6. The R-A3 rule (recommended; owner decision pending (D-1)): when a rollback restores a backup of an older schema, the older build runs with `JOB_RUNNER=off` until reconciliation is done (section 8, Rollback). On the first installation there is no older production schema, so this matters only after a later upgrade that adds a migration; revisit it before that upgrade.
7. To try again, repeat section 13 from the self-test with a new pre-activation backup.

## 16. Pilot operator notes

1. Migrate once before the first start (R-A2). Concurrent openers of a brand-new database file can fail with `SQLITE_BUSY`. Start one instance, wait until `<compose> ps` reports it healthy, and only then run any CLI command or start anything else on that data. To migrate explicitly first: `<compose> run --rm --no-deps timesheet <cli> migrate`. **[owner NAS step, unverified]**
2. Keep explicit paths for host CLI use (R-A8). Production refuses a missing `DATABASE_PATH`, but a CLI maintenance command run outside the container without it falls back to a development database. Inside the container the env file sets both; on the host set `DATA_DIR` and `DATABASE_PATH` explicitly, as absolute paths on `<data-dir>`, for every command.
3. Protect the pre-upgrade backup (R-RA2). A later `--prune` on the same UTC day removes the paired pre-upgrade backup: copy it aside (section 4 step 3) before the upgrade, or run the first prune on another day.
4. Restore into a new real folder (R-RA9). Create `<restore-dir>` with `mkdir`; never point it at a junction or symbolic link (the restore then fails with `write_failed` instead of being refused as inside the live data).
5. Save the submission settings before activation (WP3 R8, R-WA3). Once automation is active, an account that never saved them gets before-due reminders, including the bootstrap administrator account. Use the administrator account as the owner's timesheet account, or save its settings; check that the "Not set up" flag in the administrator account list is clear for every active account.
6. After a restore and its reconciliation, take a backup: the restored instance reports the backup as `never` until then (section 7).

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
| Pilot activation: capture self-test, pre-activation backup and `sha256sum` of its manifest, `OUTBOUND_MODE=smtp` with `PRODUCTION_SENDING_ENABLED=true`, `<compose> up --detach --force-recreate --no-build` | Owner NAS step, unverified (the drill never sends real mail) |
| `PUT /api/admin/automation/activation` from the signed-in administrator's browser console (set and clear) | Owner NAS step, unverified (integration tests only) |
| Deactivation: clear the instant, `OUTBOUND_MODE=capture`, flag unset, recreate | Owner NAS step, unverified |
| Rollback card for the first installation | Owner NAS step, unverified |
| `<compose> run --rm --no-deps timesheet <cli> migrate` | Owner NAS step, unverified |
