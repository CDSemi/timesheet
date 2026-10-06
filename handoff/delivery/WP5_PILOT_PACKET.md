# WP5 pilot packet

This is the concrete packet the owner reviews before authorizing real sending. English is authoritative; [WP5_PILOT_PACKET.vi.md](WP5_PILOT_PACKET.vi.md) is the translation. The rules it applies are in [06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md), [07 Operations](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md), [05 Submission](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md), the [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) (sections 13 to 16) and the [release notes](../../docs/12_RELEASE_NOTES.md).

**Status: software ready, pilot pending. The NAS is NOT VERIFIED. No real email has been sent, nothing is deployed and no authorization has been requested or given.**

## 0. How to use this packet

- **The tracked copy holds placeholders and synthetic samples only** (the repository is public; AGENTS rule 4). Copy this file to a private location outside git and write the real values there. Real host names, addresses, SMTP credentials, signatures and personal data never go into the tracked copy, chat, screenshots or logs. Recommended; owner decision pending (D-11).
- Placeholders are written `<like-this>`. The ones used here: `<nas-host>`, `<sender-address>`, `<owner-address>`, `<payroll-address>`, `<proxy-ip>`, `<release-commit>`, `<source-digest>`, `<image-id>`, `<backup-name>`, `<manifest-sha256>`, `<activation-instant-utc>`, and the runbook placeholders (`<compose>`, `<cli>`, `<env-file>`, `<data-dir>`, `<backup-dir>`, `<restore-dir>`).
- Every box `[ ]` below is empty on purpose. Only the owner ticks a box, and only for something the owner did or decided.
- Four facts are kept apart throughout: software readiness, owner permission, provider acceptance and recipient receipt ([06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md)).

### Release identity of this packet

| Field | Value |
|---|---|
| Release commit (WP5 package-final freeze) | `74d5bfec6700126da4105b5d97f5efe943f896f5` (= `origin/main` when the packet was made) |
| Source digest (`npm run digest`, `handoff/` excluded) | `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 files; recomputed before and after this task, unchanged |
| Version in `package.json` | `0.1.0` (does not identify the release; the commit and digest do) |
| Reference image ID (WP5-GATE drill build, development workstation, `linux/amd64`, 110,002,055 bytes) | `sha256:0addd2000b422846badb99ea72003d4a883dc418b7b5f8c2c6d53acb66189fd8` |
| Image ID built on the NAS | `<image-id>` (the owner records it at build time, [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) section 1 step 8; a rebuild of the same source gives another ID) |
| Release declaration | none declared, no tag; recommended at the owner's pilot authorization; owner decision pending (D-14) |

The reference image ID names the drill image of the gate on the developer workstation. It is not the NAS image, and that image was removed after the gate. A change of any file outside `handoff/` changes the commit and the digest, and this identity must then be refreshed.

Evidence for this packet is in `handoff/delivery/evidence/WP5-PILOT/` (index in section 11).

## 1. URL

| Item | Placeholder | Where it is set |
|---|---|---|
| Public HTTPS host | `https://<nas-host>/` | DNS, certificate and the Synology reverse proxy (owner controlled) |
| `PUBLIC_BASE_URL` | `https://<nas-host>` (https only in production, no path, query or fragment) | `<env-file>` |
| `APP_ORIGINS` | `https://<nas-host>` (exact browser origin, comma separated) | `<env-file>` |
| `TRUSTED_PROXY_ADDRESSES` | `<proxy-ip>` (exact address the application sees as the proxy's connection peer; no CIDR, no host names) | `<env-file>` |

Check steps. Each is an **[owner NAS step, unverified]**; tick and date them on the NAS.

- [ ] `https://<nas-host>/api/ready` answers 200 with `{"status":"ready","schema":{"expected":N,"actual":N},"data_dir_writable":true}` and nothing else. `https://<nas-host>/api/health` answers 200 `{"status":"ok"}`. Development-machine observation (a built server in capture mode on a loopback port, `evidence/WP5-PILOT/05-ready-check.txt`): `/api/health` 200 `{"status":"ok"}`, `/api/ready` 200 with schema 13 expected and actual and `data_dir_writable` true.
- [ ] Sign-in: the administrator signs in at `https://<nas-host>/` (the Setup screen appears once, runbook section 3). Two clients behind the proxy are not blocked together (this shows `TRUSTED_PROXY_ADDRESSES` is right).
- [ ] Deep link: open `https://<nas-host>/#/review/<payroll-date>` (the form of every reminder link, as in the samples of section 3); it asks for sign-in and then opens the review screen. A captured submission holds no link, and the link of the first reminder is checked after the activation instant is set (runbook section 13 step 7). A login-required link is enough; it never signs or submits anything by itself.
- [ ] A state-changing request from that origin is accepted (an origin that is not in `APP_ORIGINS` is refused with 403 `origin_rejected`).

## 2. Sender and recipients

### Fields and where each value is set

| Value | Name | Set in | Note |
|---|---|---|---|
| Sender address | `MAIL_FROM` (one address) | `<env-file>` | The provider must accept this sender. Placeholder `<sender-address>`. |
| Mode | `OUTBOUND_MODE` = `capture` (default) or `smtp` | `<env-file>` | Stays `capture` until the owner authorizes real sending. |
| Real-sending flag | `PRODUCTION_SENDING_ENABLED` | `<env-file>` | Exactly `true`, only at activation (runbook section 13 step 4). Leave unset until then. |
| SMTP server | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURITY` (`starttls` or `tls`) | `<env-file>` | Read only when `OUTBOUND_MODE=smtp`. |
| SMTP credentials | `SMTP_USER` and `SMTP_PASSWORD` together, or neither | `<env-file>` only | The only secret the application can hold. Never in git, chat, screenshots or logs. |
| Recipients (To, Cc) | `to`, `cc` of the submission settings | each user's own Settings (not env) | Per user. `<payroll-address>` and `<owner-address>` below. |
| Subject and body templates | `subject_template`, `body_template` | each user's Settings | Variables: `{EmployeeName}`, `{PeriodStart}`, `{PeriodEnd}`, `{PayrollDate}`, `{SignOffStatus}`, `{SubmissionId}`, `{Revision}`. Unknown variables are refused. |

A change of recipients does not reach an existing revision: a changed envelope needs a new reviewed revision ([05 Submission](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md) "Corrections and resends"). Set the recipients of the first period before the sign-off.

### Capture-mode self-test (before any real sending)

Follow runbook section 13 step 2 on the NAS. **[owner NAS step, unverified]**

- [ ] `OUTBOUND_MODE=capture` and `PRODUCTION_SENDING_ENABLED` unset; the administrator status shows "Outbound mode: Capture only (nothing leaves the server)" and the activation "Not activated", and `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `0` (the status has no field for the flag).
- [ ] With the two synthetic accounts of [07 Operations](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md) "Setup sequence" (addresses on `example.invalid`), sign off and submit one synthetic period. The capture folder (`mail-capture` under `/data/private-data`) holds exactly the configured recipients and the frozen body, and a PDF whose SHA-256 equals the PDF download. Nothing leaves the NAS.
- [ ] The submission settings of the owner's account and of every other account that will exist are saved, the synthetic accounts are deactivated, and none has auto-submit on.
- [ ] The administrator status shows no queued or leased send job.

The development-machine equivalent is section 3: eight messages captured from the gated build with synthetic users, each PDF equal to its recorded hash.

### First real send

Recommended; owner decision pending (D-12): the first period is signed off by hand, auto-submit is off, no activation instant is set, and the first real send goes to the owner's own address.

| Field | Value (private copy only) |
|---|---|
| To of the first real send | `<owner-address>` |
| Cc | none |
| Payroll recipient(s) of a later revision | `<payroll-address>` (decide with the owner whether payroll receives the first period's mail or a later revision; runbook section 13 step 6) |

## 3. Email and PDF samples

All samples were generated from a clean `git archive` export of commit `74d5bfe` (the gated freeze), built with `npm ci` and `build:server`, with the production services and job handlers, fixed clocks, capture mode and synthetic users at `example.invalid`. `PRODUCTION_SENDING_ENABLED` was never set and nothing was sent. The calendar is the synthetic seed calendar: period 2026-09-14 to 2026-09-27, payroll date 2026-10-02, reporting zone `America/Los_Angeles`. Real dates will differ.

Each message is saved as one `.txt` (subject, raw headers, decoded body, PDF facts), and each PDF page as a `*-synthetic.png` render. Every render was viewed after it was made. Each PDF has one page; its stored hash equals the captured attachment.

| # | Sample | Message file | PDF render | PDF SHA-256 |
|---|---|---|---|---|
| S1 | Manual sign-off, original revision 1, signature image, signed 2026-09-28 23:30 local | `msg-03-submission-payroll-manual-rev1.txt` | `pilot-03-submission-payroll-manual-rev1-p1-synthetic.png` | `43ed65038bfe305727b40d7b2162df2ba2aacaecd75a863372aee9d0a7b70221` |
| S2 | Manual correction, revision 2, e-mailed by the owner's explicit choice | `msg-08-submission-payroll-manual-rev2.txt` | `pilot-08-submission-payroll-manual-rev2-p1-synthetic.png` | `52bc10c58f10e4d7cdca56b757eff885ebb0a088aeafb3737896ea6544e2993f` |
| S3 | Automatic submission, note line off, image authorized | `msg-07-submission-payroll-auto-off-rev1.txt` | `pilot-07-submission-payroll-auto-off-rev1-p1-synthetic.png` | `0c30201bce796acb0d78bcfbbe8ff477ba4da04971e87fc2803a54f32c787204` |
| S4 | Automatic submission, note line on (default text "Automatic submission"), image authorized | `msg-04-submission-payroll-auto-on-rev1.txt` | `pilot-04-submission-payroll-auto-on-rev1-p1-synthetic.png` | `2c6af3a649a4392202c8ae21902e43c2f71969dd5b23349d7a191f2ee4ec508f` |
| N1, N2 | Reminder to the employee ("due in about 18 hours"), one per automatic account | `msg-01-...txt`, `msg-02-...txt` | none | none |
| N3, N4 | Outcome notice to the employee after an automatic submission | `msg-06-...txt` (note off), `msg-05-...txt` (note on) | none | none |

Text of each PDF page: `pdf-text-<n>-...txt`. The index with the checks is `sample-index.txt`.

### What the samples show

- **The email to payroll.** From the sender, To the user's configured recipient, Cc the configured copy address, no Bcc, the PDF attached as `timesheet-<payroll-date>-r<n>.pdf`, a plain-text and an HTML part. The default body reads: "Hello, Attached is the timesheet of `{EmployeeName}` for `{PeriodStart}` to `{PeriodEnd}` (payroll date `{PayrollDate}`). Status: `{SignOffStatus}`. Submission `{SubmissionId}`, revision `{Revision}`."
- **Manual (S1).** Subject and status line say "Submitted". The PDF prints the employee name, the signature image and the date of the real sign-off in the reporting zone (09/28/2026, although the instant is 09/29 in UTC).
- **Manual correction (S2).** The new revision is a separate message and PDF with "Revision 2" and the corrected Sunday end time and OT total (17:00 h:mm instead of 16:30). Its wording does not say that it is a correction ("Status: Submitted"). The owner judges whether payroll needs that stated in the template or in a covering note.
- **Automatic, note off (S3).** Subject and status say "Submitted", exactly like a manual one. The PDF has the name, the authorized image and the date of the automatic submission (09/29/2026, local date of the deadline run), and no automatic indicator.
- **Automatic, note on (S4).** The note text replaces the status in the subject and body ("Automatic submission") and prints as one line under the title of the PDF. This is the only difference from S3. The recorded revision stays automatic with review pending, an empty `signed_at` and no sign-off; the employee's own screens and the outcome notice (N3, N4) say so.
- **Notices.** The reminder and the outcome notice go only to the employee, carry `Auto-Submitted: auto-generated`, name the deadline in the reporting zone and give a login-required link, and N3 and N4 say review is pending.
- **Known limits visible in the samples** (see [release notes](../../docs/12_RELEASE_NOTES.md)): days without records print as "Worked" with no time on an automatic PDF (R-WA8; the owner's decision F-1 and F-Q1); partial leave is not printed (R-WA2); the long holiday label is cut with an ellipsis (WP3 R1). The sample data here has no holiday label or leave.

### Wording approval (owner)

The final template text, the note line choice and whether the image goes on automatic submissions are owner inputs. The owner approves the exact wording after seeing a real preview in capture mode on the host.

- [ ] Subject and body template text approved (or changed): ______
- [ ] Note line: off / on with the text: ______
- [ ] Signature image on automatic submissions: authorized / not authorized
- [ ] The statement of a correction in the revision 2 message: accepted as it is / change requested: ______
- [ ] Real preview on the host, in capture mode, with the real recipients, checked: date ______

## 4. Settings checklist

Environment key names only (values live in `<env-file>` and the private copy). Source: `.env.example` and [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) sections 1 and 13.

| Key | Needed for the pilot | Placeholder or rule |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `HOST`, `PORT` | yes | `0.0.0.0` in the container, `3000`; the Compose example publishes loopback only |
| `DATABASE_PATH`, `DATA_DIR` | yes (absolute, both) | `/data/timesheet.db`, `/data/private-data` |
| `APP_ORIGINS`, `PUBLIC_BASE_URL` | yes | `https://<nas-host>` |
| `COOKIE_SECURE`, `SESSION_TTL_HOURS` | optional overrides | defaults |
| `TRUSTED_PROXY_ADDRESSES` | yes | `<proxy-ip>` |
| `OUTBOUND_MODE` | yes | `capture` until activation, then `smtp` |
| `MAIL_FROM` | yes | `<sender-address>` |
| `PRODUCTION_SENDING_ENABLED` | at activation only | exactly `true`; unset otherwise |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURITY`, `SMTP_USER`, `SMTP_PASSWORD` | at activation only | owner's private copy |
| `JOB_RUNNER` | rollback only | `off` after a rollback to an older schema until reconciliation (D-1) |
| `STATIC_DIR` | optional | unset |
| Compose variables `TIMESHEET_ENV_FILE`, `TIMESHEET_DATA_DIR`, `TIMESHEET_IMAGE`, `TIMESHEET_PORT` | yes | in `<project-dir>/.env`, mode 600 (runbook, "Placeholders and conventions") |

Application settings. The "documented default" column is the design default ([04 UX and settings](../../docs/04_UX_AND_SETTINGS.md)); the owner's value goes in the private copy.

| Setting | Where it is set | Documented default or sample | Owner value |
|---|---|---|---|
| Reporting zone | bootstrap file (runbook section 3) | `America/Los_Angeles`; device-zone changes never regroup timesheets | private copy |
| Payroll calendar | bootstrap file | anchor payroll date `2026-10-02`, every 14 days, due the prior Tuesday 17:00 reporting zone | private copy |
| Company holidays 2026 | bootstrap file, then the administrator's annual holidays | the template's nine dates for the owner to confirm (`reference/examples/holidays.2026.example.json`, not a statutory list): 01-01, 01-02 (floating), 02-16, 05-25, 07-03 (observed), 09-07, 11-26, 11-27 (floating), 12-25 | private copy |
| Company holidays 2027 | administrator's annual holidays: preview, validate, publish a new effective version | none supplied; the application warns from 1 October (E-12) when next year's calendar is missing | private copy; an owner input |
| Policy B / N / M | the user's Settings (policy) | B = 480 min, N = 30 (strictly exceeded), M = 30 (nearest, exact midpoint down), reference 08:00-17:00, breaks 15+30+15 | private copy |
| Deficit mode | the user's policy | `ignore`; `auto_deduct` or `choose_at_signoff` optional | private copy |
| Reminders | the user's submission settings | 24 h and 2 h before due, an overdue warning when auto-submit is off, an outcome notice after an automatic submission | private copy |
| Auto-submit | the user's submission settings | on is the stored preference; nothing is automatic before the activation instant. Recommended for the first period: off (D-12) | private copy |
| Note line | the user's submission settings | off; text "Automatic submission" | private copy |
| Automatic image authorization | at signature upload, a separate audited authorization (revocable in Settings) | pre-selected at upload; if unticked, no image on automatic submissions | private copy |
| Recipients, templates | the user's submission settings | section 2 | private copy |
| Opening balance | Import screen / `PUT /api/ot/opening-balance` | none; one evidence-backed signed non-zero value, or start at zero (D-10) | private copy |
| Activation instant | `PUT /api/admin/automation/activation` from the signed-in administrator's console (runbook section 13 step 5) | empty; set to `<activation-instant-utc>` only after the first period is signed off by hand | private copy |
| First pilot period | the owner's choice on the 14-day cycle | payroll dates continue 2026-10-02 + 14 days (2026-10-16, 2026-10-30, 2026-11-13, ...); each is due the prior Tuesday 17:00 reporting zone. Placeholder `<first-payroll-date>` | private copy |

## 5. Restore proof

### Development-machine figures (WP5-GATE drill, not the NAS)

Source: the container drill of the gate, synthetic data, capture mode, Docker Desktop on a developer workstation (`linux/amd64`), image `sha256:0addd2000b42...9fd8`. `npm run drill:container -- --wp3 <previous build>`: stages 33, 31, 57, 35, 27 and 23 checks = 208 PASS, 0 FAIL (`handoff/delivery/evidence/WP5-GATE/07-drill.txt`).

| Figure | Value |
|---|---|
| Backup while writing | exit 0; 432 ms inside the CLI, 1,180 ms through `docker compose exec`; 5, 56 and 27 writes before, during and after, all succeeded |
| Backup content | schema 13, app 0.1.0, 10 files (7 signatures, 1 PDF), database 651,264 bytes, integrity ok, 0 foreign key violations; every file equals its manifest SHA-256 and size |
| Isolated restore | exit 0 in 1,331 ms into a new empty folder; manifest verified; 10 files, 0 mismatched; integrity check passed; schema 13 as in the backup |
| Restored counts equal the backup | users 2, import batches 2, revisions 1, ledger entries 0, sign-offs 1, attachments 8, work sessions 29, outbound jobs 1 |
| Outbound pause | the restored copy is paused with reason `restored`; 1 send job held, 0 queued, 0 attempts awaiting a decision; nothing was captured or sent while paused (40 s observed) |
| Restored instance | healthy in 5.5 s; the stored session works; one PDF renders |
| Reconciliation | `outbound release` preview lists the held send; `outbound resume --confirm` clears the pause; after it nothing from the backups went out; `release --job` and `--all` each made exactly one attempt |
| Rollback restore (`--keep-schema`) | refused without `--confirm`, then restored with it: counts equal the pre-upgrade values; no send after the previous build started |
| Not proved here | the NAS, its file system, DSM Task Scheduler, the separate-device copy, the host alert, real SMTP |

These are measurements on one workstation. The targets of a nightly backup, a 24-hour recovery point and a one-hour restore are to be tested on the NAS, not claimed.

### Target restore form for the NAS (blank)

Run runbook sections 4, 6 and 7 on the NAS with synthetic data before activation. Record counts and hashes only, never personal data. **[owner NAS step, unverified]**

| Step | Record | Result |
|---|---|---|
| Date, operator, release commit, image ID | | |
| Backup command (`<cli> backup --to /data/backups`) | exit code and printed `outcome` (expect 0, `succeeded`) | |
| `<backup-name>` and `sha256sum <backup-dir>/<backup-name>/manifest.json` = `<manifest-sha256>` | | |
| Manifest summary | schema, app version, files, signatures, PDFs, database bytes | |
| Source counts (administrator status or API) | users, revisions, ledger entries, sign-offs, attachments, work sessions | |
| Separate-device copy of the backup and of the capture-mode `<env-file>` | where, date | |
| Isolated restore into a new empty `<restore-dir>` (one-off container, no network, read-only root) | exit code (0 expected), duration | |
| Restore output | manifest verified, files and mismatches, integrity result, schema | |
| Restored counts equal the source counts | each count equal: yes / no | |
| One restored PDF hash equals its recorded hash | yes / no | |
| Restored instance (own Compose project name, `--no-build`) | healthy after, the pause banner and reason `restored`, nothing sent while paused | |
| Reconciliation (section 7) | held send count, uncertain attempts, decisions recorded, `resume --confirm` exit, releases | |
| Live instance untouched; old and restored queues never ran together | yes / no | |
| First backup after the restore taken | yes / no | |
| Total time from backup to a checked restored instance | against the one-hour target | |
| Result | pass / fail / notes | |

- [ ] The target restore was run on the NAS and the form is complete. Date: ______

## 6. Rollback card

The pilot is the first installation, so there is no older production schema or image to roll back to. Rolling back means stopping real sending and returning to Excel ([runbook](../../docs/11_OPERATIONS_RUNBOOK.md) section 15). The tracked copy holds placeholders; the owner's private copy holds the real values (D-11).

| Field | Value |
|---|---|
| Release commit | `74d5bfec6700126da4105b5d97f5efe943f896f5` |
| Source digest | `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` |
| Image ID built on the NAS | `<image-id>` (reference build of the gate: `sha256:0addd2000b422846badb99ea72003d4a883dc418b7b5f8c2c6d53acb66189fd8`) |
| Pre-activation backup | `<backup-name>` (taken in runbook section 13 step 3) |
| Manifest hash of that backup | `<manifest-sha256>` |
| Separate-device copy of the backup and the capture-mode `<env-file>` | where it is kept (private copy) |
| Date of activation | `<activation-instant-utc>` |

Steps (the full text is runbook sections 14 and 15):

1. Deactivate: if the activation instant was set, clear it first (the console call with `active_from: null` and a reason); wait until no send is queued or leased; in `<env-file>` unset `PRODUCTION_SENDING_ENABLED`, set `OUTBOUND_MODE=capture` and remove the `SMTP_*` values; `<compose> up --detach --force-recreate --no-build`; check the status shows "Outbound mode: Capture only (nothing leaves the server)" and "Not activated", and that `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `0`.
2. Keep the data. Never delete `<data-dir>` or `<backup-dir>`. Never run two queues.
3. Fall back to the Excel workbook for the period (the owner's own copy).
4. Sent mail cannot be recalled; read the delivery history to avoid a double entry. A period submitted in error stays on record and is corrected by a reasoned correction.
5. Restore only if the data are damaged or wrong, never over the live data: check the manifest hash against `<manifest-sha256>`, restore `<backup-name>` in isolation (section 5 form) and reconcile.
6. Residual rule (recommended; owner decision pending (D-1)): after a rollback to an older schema, the older build runs with `JOB_RUNNER=off` until reconciliation. It matters only after a later upgrade that adds a migration.

## 7. Release identity and NAS checklist

Release identity: the table in section 0. The NAS is **NOT VERIFIED** until the owner ticks every item below and dates it. Until then the result is "software ready, pilot pending" (recommended; owner decision pending (D-13)). Every item is an **[owner NAS step, unverified]**, copied from [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) section 2.

NAS facts to record (private copy): NAS model ______; DSM version ______; Container Manager version ______; `uname -m` ______; data and backup paths ______; folder owner UID/GID `10001` ______; NTP on ______.

- [ ] Architecture (`uname -m`), DSM and Container Manager versions recorded.
- [ ] `<data-dir>` is on a local volume (not SMB, NFS or a synchronized folder), owned by UID/GID `10001`, mode 700.
- [ ] `<env-file>` is mode 600 and holds no value that is also in git or chat.
- [ ] The service is healthy after `up`, after `<compose> restart`, and after a NAS reboot.
- [ ] `https://<nas-host>/api/ready` answers 200 with the schema numbers only, and `https://<nas-host>/api/health` answers 200.
- [ ] The Setup screen appears once, and the administrator can sign in.
- [ ] Sign-in rate limiting is per client (`TRUSTED_PROXY_ADDRESSES` is right).
- [ ] NTP is on and the NAS clock is correct.
- [ ] A synthetic submission renders its PDF (fonts are in the image) and its mail lands in capture.
- [ ] A backup, an isolated restore and the reconciliation work on the NAS with synthetic data (section 5 form), and the separate-device copy exists.
- [ ] A protected copy of `<env-file>` (mode 600) is kept with the separate-device backup copy, together with the release commit, source digest and image ID.
- [ ] The administrator status shows the backup, the free disk space and the outbound mode.
- [ ] The independent host alert (runbook section 11) fires on a test.

Overall: NAS checklist complete and dated ______ by ______. (Empty means NOT VERIFIED.)

## 8. Owner decisions

All fifteen are still pending: none is answered in the board's `owner_decisions`. Source: [WP5-PLAN](tasks/WP5-PLAN.md) section D. D-1, D-7, D-8 and D-13 must be answered before activation. An answer that differs from the current default for D-3, D-5, D-6 or D-8 causes a fix round (fix, freeze, gate, independent audit) before activation, and the release identity in sections 0 and 6 is then refreshed. The recommended D-8 option (b) differs from the current default.

| ID | Decision | Recommendation (and why) | Current answer |
|---|---|---|---|
| D-1 (R-A3) | Jobs created after a rollback to an older schema are not held | (a) keep the documented rule: the older build runs with `JOB_RUNNER=off` until reconciliation. The pilot is the first installation, so no older production schema exists; (b) would make a restore tool change business state | pending |
| D-2 (WP4-I-1) | May a draft app period receive imported days | (a) never, current; the safest option and no code change | pending |
| D-3 (WP4-I-2) | "Off day (overtime used)" on import | (b) import as Off with no ledger effect if history is imported before the pilot; otherwise keep (a) skip and decide after the pilot | pending |
| D-4 (WP4-I-3) | Import an unended period | (a) no, current; imported history stays complete and read-only | pending |
| D-5 (WP4-I-4) | Correct a mistaken opening balance to a net zero | (a) yes, by a reasoned offsetting correction, if an opening balance is recorded at pilot start | pending |
| D-6 (WP4-I-5) | Quota on uncommitted import previews | (a) at most 20 per person, post-pilot for an owner-only pilot; before the pilot if others are onboarded | pending |
| D-7 (F-7) | Reminder after a crash on real SMTP may repeat once | (a) accept at-least-once; a lost reminder could cause a missed deadline | pending |
| D-8 (F-7) | TLS certificate failure is classified temporary (retries, then intervention) | (b) treat it as a permanent configuration fault, shown at once, subject to the assessment; otherwise keep (a) and document it | pending |
| D-9 (E-11, F-7) | Pilot cohort and passwords (no self-service password change) | (a) owner-only pilot, temporary password set out of band; (b) a change-password route before anyone else is onboarded | pending |
| D-10 | Opening balance and history at pilot start | record one evidence-backed opening balance, or start at zero; skip the historical import for the pilot | pending |
| D-11 | Where the real pilot values live | (a) tracked packet with placeholders, real values in a private owner copy outside git; the repository is public | pending |
| D-12 | Staging of the first real activation | (a) first period: manual sign-off with real sending, the first real send to the owner's own address, auto-submit off and no activation instant; automation from the next period | pending |
| D-13 | Pilot host | (a) the NAS after runbook sections 1, 2, 4 and 6; NOT VERIFIED until the owner ticks the checklist | pending |
| D-14 | First release declaration (`git.release_declared`) | (a) at the owner's pilot authorization; later fixes then follow the branch and pull request rule. Agents create no tag | pending |
| D-15 (F-Q6) | Holiday-preview privacy | (a) keep the removal of per-date counts; no effect on an owner-only pilot | pending |

Not decisions, for the owner to note: the 2027 company holiday list (settings input); the separate-device backup copy ([07 Operations](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)); the independent host alert (runbook section 11).

## 9. Authorization record (unsigned)

Nothing here is ticked or signed. It is filled only by the owner, in the owner's own record, and only after the owner has read this packet. Four facts are kept apart; one does not stand in for another.

| Fact | What it means | Recorded by | Evidence and instant |
|---|---|---|---|
| 1. Software readiness | The gates and independent audits passed on synthetic data in capture mode on a developer workstation (package handoffs, the WP5 gate). It says nothing about the NAS. | the project record | ______ |
| 2. Owner permission | The owner's explicit authorization of real sending and activation, in chat or in the owner's own record. Not requested or given in this release. | the owner | ______ |
| 3. Provider acceptance | The delivery history of a revision shows the attempt accepted with the provider's acknowledgement. A failure shows a redacted fault code. | the owner, per message | ______ |
| 4. Recipient receipt | The owner confirms in the mailbox (spam folder included) that exactly one message arrived from `<sender-address>` with the PDF, and that the PDF equals the one in the application. | the owner, per message | ______ |

Owner permission, scope and conditions:

- [ ] I have read this packet and the [release notes](../../docs/12_RELEASE_NOTES.md). The decisions in section 8 are answered as written there.
- [ ] The NAS checklist (section 7) is complete and dated; or the owner accepts, in writing, activating on a host that is still NOT VERIFIED: ______
- [ ] The target restore form (section 5) is complete.
- [ ] The wording approval (section 3) is complete.
- [ ] Real sending is authorized for: first real send to `<owner-address>` only / also to `<payroll-address>` / scope: ______
- [ ] Setting the activation instant is authorized: not yet / from `<activation-instant-utc>`
- [ ] The first release is declared at this authorization (D-14): yes / no

Owner signature or reference to the owner's own record: ______   Date and UTC instant: ______

After the first real send, record provider acceptance and recipient receipt (facts 3 and 4) separately; an accepted message that never arrives is a provider or mailbox matter, not an application result. Anything unexpected: deactivate (section 6). After the pilot, observe one real period with Excel available for comparison ([06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md)).

## 10. Limits of this packet

- The samples come from capture mode on a development workstation. Real SMTP behaviour, the NAS, the reverse proxy, the certificate and the separate-device copy are unobserved until the owner runs the steps above.
- The sample calendar, names and dates are synthetic. No real host name, address, credential, signature or personal data is in the tracked packet or its evidence.
- Section 4 lists documented defaults, not the owner's choices; the owner's values are not known here.
- The reference image ID belongs to a build that was removed after the gate; the NAS build records its own.

## 11. Evidence index

`handoff/delivery/evidence/WP5-PILOT/`: `msg-01` to `msg-08` (subject, headers, body of each captured message); `pdf-text-03`, `-04`, `-07`, `-08`; `pilot-03`, `-04`, `-07`, `-08` `...-p1-synthetic.png` (the four PDF renders); `sample-index.txt`; `03-make-samples.txt` (sample run log); `04-extract.txt`; `05-ready-check.txt` (health and readiness of the built server in capture mode); the generator scripts as `make-samples.mjs.txt`, `extract.mjs.txt` and `ready-check.mjs.txt`; and the digest, precommit and preflight records of the task.
