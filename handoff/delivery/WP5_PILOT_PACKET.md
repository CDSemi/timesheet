# WP5 pilot packet

This is the concrete packet the owner reviews before authorizing real sending. English is authoritative; [WP5_PILOT_PACKET.vi.md](WP5_PILOT_PACKET.vi.md) is the translation. The rules it applies are in [06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md), [07 Operations](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md), [05 Submission](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md), the [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) (sections 13 to 16) and the [release notes](../../docs/12_RELEASE_NOTES.md).

**Status: software ready, pilot pending. The NAS is NOT VERIFIED. No real email has been sent, nothing is deployed and no authorization has been requested or given.**

## 0. How to use this packet

- **The tracked copy holds placeholders and synthetic samples only** (the repository is public; AGENTS rule 4). Copy this file to a private location outside git and write the real values there. Real host names, addresses, SMTP credentials, signatures and personal data never go into the tracked copy, chat, screenshots or logs. Owner decision D-11 (a): the tracked packet keeps placeholders, and the real values stay in the owner's private copy outside git.
- Placeholders are written `<like-this>`. The ones used here: `<nas-host>`, `<sender-address>`, `<owner-address>`, `<payroll-address>`, `<proxy-ip>`, `<release-commit>`, `<source-digest>`, `<image-id>`, `<backup-name>`, `<manifest-sha256>`, `<activation-instant-utc>`, and the runbook placeholders (`<compose>`, `<cli>`, `<env-file>`, `<data-dir>`, `<backup-dir>`, `<restore-dir>`).
- Every box `[ ]` below is empty on purpose. Only the owner ticks a box, and only for something the owner did or decided.
- Four facts are kept apart throughout: software readiness, owner permission, provider acceptance and recipient receipt ([06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md)).

### Release identity of this packet

| Field | Value |
|---|---|
| Release commit (WP5-UX5-FIX20-FREEZE, pushed; the WP5 snapshot re-accepted after UI change rounds 4 and 5) | `a54061f6afc1fda00d4ee2cca4553a5916af24ec` |
| Source digest (`npm run digest`, `handoff/` excluded; digest of record of WP5-UX5-REGATE16, equal before and after in WP5-UX5-RECHECK-RN) | `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882 files |
| Gate | WP5-UX5-REGATE16 PASS, NAS NOT VERIFIED ([task](tasks/WP5-UX5-REGATE16.md)). It is a scoped, documentation-only gate: `dist/` is byte-identical to that of `dc487c6` and of `0b45781`, and `npm test` ran 2,397 tests. Items carried forward on identical builds: WP5-UX5-REGATE15 ([task](tasks/WP5-UX5-REGATE15.md), `dc487c6`): the samples and the ready check of sections 1 to 3; WP5-UX5-REGATE14 ([task](tasks/WP5-UX5-REGATE14.md), `0b45781`, the package-final runtime gate): real-clock FULL e2e desktop 484 passed / 36 skipped / 0 failed and mobile 408 / 112 / 0, six simulated-clock sweeps with 0 failed, stress, mutants and axe; WP5-UX5-REGATE11 ([task](tasks/WP5-UX5-REGATE11.md), `1fe5ad3`): the container drill `--wp3`, 209 PASS / 0 FAIL, schema 15, and `npm audit --omit=dev`, 0 vulnerabilities. REGATE11 failed as a gate on an unrelated e2e timeout, which WP5-UX5-FIX17 fixed; `dist/server`, `dist/domain`, the Dockerfile and `vite.config.ts` are unchanged since `1fe5ad3` |
| Final audit | WP5-UX5-RECHECK-RN PASS ([review](WP5_UX5_RECHECK_RN.md)). It carries the product verdict of WP5-UX5-AUDIT-INT3 (PASS on `0b45781` / `67aa715c…`, [review](WP5_UX5_REVIEW_INT3.md)) and supersedes it as the current acceptance. History: the acceptance before it was WP5-UX3-AUDIT-INT on `8e55710` / `507de97c…` ([review](WP5_UX3_REVIEW_INT.md)) |
| Documentation-only commits after the product acceptance | `dc487c6` (WP5-UX5-RELNOTES-FREEZE: README and the release notes; gated by REGATE15; WP5-UX5-AUDIT-RN returned FIX REQUIRED with F-UX5RN-1, [review](WP5_UX5_REVIEW_RN.md)); `a54061f` (WP5-UX5-FIX20-FREEZE: DEVELOPMENT, the release notes and README; gated by REGATE16; RECHECK-RN passed) |
| Version in `package.json` | `0.1.0` (does not identify the release; the commit and digest do) |
| Reference image ID (the container drill build of WP5-UX5-REGATE11 on `1fe5ad3`, development workstation, `linux/amd64`, 110,195,889 bytes; whether the image still exists is not recorded; its `dist/server` and `dist/domain` bundles are identical to the release, its client bundle is not) | `sha256:47a183b1202aafcce6596ecbd66555519a550c5d3e9e080ffbda5a3bbbcf2b92` |
| Image ID built on the NAS | `<image-id>` (the owner records it at build time, [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) section 1 step 8; a rebuild of the same source gives another ID) |
| Release declaration | none declared, no tag. Owner decision D-14 (b): the first release is declared after the pilot period, not at the pilot authorization; until then commits stay on `main` under the rule in [08 AI workflow](../../docs/08_AI_WORKFLOW_AND_BUDGET.md) and `git.release_declared` stays false |

The reference image ID names the drill image of WP5-UX5-REGATE11 on the developer workstation, built from `1fe5ad3` (its drill log, `evidence/WP5-UX5-REGATE11/log-drill.txt`, records the ID). It is not the NAS image and not an image of the release: the server and domain bundles are the same, the client bundle is not. Either way, the owner records the image ID built on the NAS. A change of any file outside `handoff/` changes the commit and the digest, and this identity must then be refreshed.

**Release identity: refreshed at the re-acceptance after UI change rounds 4 and 5.** The table above is the accepted WP5 release `a54061f` / `690fd8fd…` (882 files). The samples of section 3 and the ready check of section 1 come from `dc487c6` (WP5-UX5-REGATE15). `dc487c6` differs from the release only in six Markdown files and builds byte-identically (REGATE16 and RECHECK-RN), so the samples represent the release without being regenerated. Sections 5, 6 and 7 use the same identity.

**UI change round (WP5-UX).** After the packet was first written at `014bd47`, the owner asked on 2026-10-08 for a more beautiful, easier UI with the Timesheet page laid out like the sample Excel workbook. The owner answered E-1..E-7 as recommended, and WP5-UX-Q1 and WP5-UX-Q2 with "a". The round changed the client UI and the tests only (plus a display-only hours:minutes formatter); there is no server change and no business-rule change. It was gated again (WP5-UX-REGATE8) and finally audited (WP5-UX-AUDIT-AB9, [review](WP5_UX_REVIEW_AB9.md)), which is why the identity above differs from the first release identity `014bd47` / `150420e7…`. The record is in [WP5 handoff](WP5_HANDOFF.md), section "Re-acceptance after the UI change round (WP5-UX)".

**UI change round 2 (WP5-UX2).** On 2026-10-14 the owner asked for further Timesheet-page changes (highlight of the open day column, a lighter label-picker selection, a Light/Dark toggle in the main navigation, clearer hover on toggle buttons, Today and Current period buttons, a slide switch for "Show details"), then the C&D logo with a two-line wordmark, the check in/out controls in the phone top bar and "Check in/out" wording. WP5-UX2-Q1 was answered with both buttons (Today opens the period that contains today; Current period returns to the period the page opens on) and WP5-UX2-Q2 with "a" (outlines of the wordmark, lighter tints in the dark theme). The round changed the client UI, wording and tests, and the wording of three server error messages (plus one comment); there is no business-rule, calculation, schema, API or PDF change. It was gated again (WP5-UX2-REGATE2) and finally audited (WP5-UX2-AUDIT2, [review](WP5_UX2_REVIEW2.md)), which is why the identity above differs from `90b98ef` / `57e2974c…`. The record is in [WP5 handoff](WP5_HANDOFF.md), section "Re-acceptance after UI change round 2 (WP5-UX2)".

**UI change round 3 (WP5-UX3).** On 2026-10-15 the owner asked for a modern style in place of the industrial one, a top-bar identity menu (avatar, name over email; Light/Dark, Profile, Settings, Sign out), a reorganised page header and period bar, lifted (shadowed) selected columns, and a Day editor with a separate session dialog and a simpler break area (one "Confirm no breaks taken" box, one row per break, Suggest breaks and Add break). The owner answered G-1..G-5 (G-1 b with changes, G-2 a "Category", G-3 a pre-fill, G-4 owner variant, G-5 b "in progress" pill), Q6 (b), the 24-hour chips and Q7 (a, the owner's AI Instruction header in AGENTS.md). The round changed the client UI and the documents only; there is no server, business-rule, calculation, schema, API, PDF or email change (`dist/server` and `dist/domain` are byte-identical to `a643794`). It was gated again (WP5-UX3-REGATE5) and finally audited (WP5-UX3-AUDIT-INT, [review](WP5_UX3_REVIEW_INT.md)), which is why the identity above differs from `a643794` / `229df806…`. The record is in [WP5 handoff](WP5_HANDOFF.md), section "Re-acceptance after UI change round 3 (WP5-UX3)".

**UI change round 4 (WP5-UX4), completed.** On 2026-10-20 the owner asked for a fourth UI round and answered the pilot decisions D-1..D-15 (section 8). The round changed the client UI and, for the answers D-5 a, D-6 a, D-9 b, D-10 (as F-1 i) and D-15 b, the server (the change-password route, the opening-balance rules, the import preview limit, the holiday-preview counts with an audit event) plus a shared clock guard. By owner decision Q0 (a) it was gated and audited together with round 5 (below), which is why the identity above differs from the round-3 identity `8e55710` / `507de97c…`. The record is in [WP5 handoff](WP5_HANDOFF.md), section "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)".

**UI change round 5 (WP5-UX5), completed.** On 2026-10-21 the owner asked for a fifth round and answered F-1..F-10 (section 8). The round changed the client UI, the PDF and the server: signing off and sending are now separate acts, each send has its own envelope and PDF row choices, another copy needs a reason, the signature image is optional, the PDF is one redesigned page with the Indie Flower handwriting font, the compact sheet moves to below 480px and the schema is 15. Later fixes made the open Day editor follow a Check in or Check out made from the page and stopped a session write from overwriting day fields changed elsewhere. The package-final gate and the audits for rounds 4 and 5: WP5-UX5-REGATE14 PASS on `0b45781` (with REGATE11's container drill on `1fe5ad3`), WP5-UX5-AUDIT-INT3 PASS on `0b45781`, the samples and ready check of REGATE15 on `dc487c6`, then the documentation-only fix of the audit finding F-UX5RN-1 (`a54061f`, REGATE16 PASS) and WP5-UX5-RECHECK-RN PASS, which is the current acceptance. The record is in [WP5 handoff](WP5_HANDOFF.md), section "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)".

Evidence for this packet is in `handoff/delivery/evidence/WP5-UX5-REGATE15/samples/` for the samples of section 3 and in `handoff/delivery/evidence/WP5-UX5-REGATE15/44-ready-check.txt` for the readiness check of section 1, in `handoff/delivery/evidence/WP5-UX5-REGATE11/log-drill.txt` for the restore figures of section 5, and in `handoff/delivery/evidence/WP5-PILOT/` for the earlier records (index in section 11).

## 1. URL

| Item | Placeholder | Where it is set |
|---|---|---|
| Public HTTPS host | `https://<nas-host>/` | DNS, certificate and the Synology reverse proxy (owner controlled) |
| `PUBLIC_BASE_URL` | `https://<nas-host>` (https only in production, no path, query or fragment) | `<env-file>` |
| `APP_ORIGINS` | `https://<nas-host>` (exact browser origin, comma separated) | `<env-file>` |
| `TRUSTED_PROXY_ADDRESSES` | `<proxy-ip>` (exact address the application sees as the proxy's connection peer; no CIDR, no host names) | `<env-file>` |

Check steps. Each is an **[owner NAS step, unverified]**; tick and date them on the NAS.

- [ ] `https://<nas-host>/api/ready` answers 200 with `{"status":"ready","schema":{"expected":N,"actual":N},"data_dir_writable":true}` and nothing else. `https://<nas-host>/api/health` answers 200 `{"status":"ok"}`. Development-machine observation (the built server of `dc487c6`, which builds byte-identically to the release, in capture mode on a loopback port, WP5-UX5-REGATE15, `evidence/WP5-UX5-REGATE15/44-ready-check.txt`): `/api/health` 200 `{"status":"ok"}`, `/api/ready` 200 with schema 15 expected and actual and `data_dir_writable` true.
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
| Recipients (To, Cc) | `to`, `cc` of the submission settings | each user's own Settings (not env) | The defaults of the Send card; edited for each send. Per user. `<payroll-address>` and `<owner-address>` below. |
| Subject and body templates | `subject_template`, `body_template` | each user's Settings | The defaults of the Send card (rendered with the revision's values); Subject and message are edited for each send. Variables: `{EmployeeName}`, `{PeriodStart}`, `{PeriodEnd}`, `{PayrollDate}`, `{SignOffStatus}`, `{SubmissionId}`, `{Revision}`. Unknown variables are refused. |
| PDF rows | "Time rows on the PDF" and "OT rows on the PDF" | each user's Settings | The defaults of the two switches of the Send card; chosen for each send (section 4). |

Signing off and sending are separate acts. The sign-off locks the period and sends nothing. The owner then sends from the Send card of the Review page, where To, Cc, Subject, the message and the two PDF row switches start from the Settings defaults and can be edited for that send; the send is saved with the values that were used. A change of the Settings reaches the next send, never one already made. Sending another copy of a period that already has a copy that counts as sent (an attempt that was accepted or is uncertain) needs a confirmation and a typed reason of 2 to 500 characters ([05 Submission](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md) "Corrections and resends"); the reason is saved with the send and in the audit log and is never put in the email.

### Capture-mode self-test (before any real sending)

Follow runbook section 13 step 2 on the NAS. **[owner NAS step, unverified]**

- [ ] `OUTBOUND_MODE=capture` and `PRODUCTION_SENDING_ENABLED` unset; the administrator status shows "Outbound mode: Capture only (nothing leaves the server)" and the activation "Not activated", and `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `0` (the status has no field for the flag).
- [ ] With the two synthetic accounts of [07 Operations](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md) "Setup sequence" (addresses on `example.invalid`), sign off one synthetic period, then send it from the Send card of the Review page (the sign-off alone sends nothing; try "Send another copy..." once to see the reason dialog). The capture folder (`mail-capture` under `/data/private-data`) holds exactly the recipients typed or defaulted on the Send card and the frozen body, and a PDF whose SHA-256 equals the PDF download of the same switches. Nothing leaves the NAS.
- [ ] The submission settings of the owner's account and of every other account that will exist are saved, the synthetic accounts are deactivated, and none has auto-submit on.
- [ ] The administrator status shows no queued or leased send job.

The development-machine equivalent is section 3: eleven messages captured from the build of `dc487c6` (WP5-UX5-REGATE15; identical to the release) with synthetic users (six with a PDF), each PDF equal to its recorded hash.

### First real send

Owner decision D-12 (a): the first period is signed off by hand, auto-submit is off, no activation instant is set, and the first real send goes to the owner's own address. Since round 5 that is two acts: sign off, then send. Type (or default from Settings) the owner's own address as To on the Send card of that send, and leave Cc empty; the first copy needs no reason. A later copy to payroll is "Send another copy..." with its reason.

| Field | Value (private copy only) |
|---|---|
| To of the first real send | `<owner-address>` |
| Cc | none |
| Payroll recipient(s) of a later copy | `<payroll-address>` (decide with the owner whether payroll receives the first period's mail or a later copy, which asks for a reason; runbook section 13 step 6) |

## 3. Email and PDF samples

All samples were generated from a clean `git archive` export of commit `dc487c6` (WP5-UX5-RELNOTES-FREEZE, WP5-UX5-REGATE15), built with `npm ci` and `build:server`, with the production services and job handlers, fixed clocks, capture mode and synthetic users at `example.invalid`. `PRODUCTION_SENDING_ENABLED` was never set and nothing was sent. The calendar is the synthetic seed calendar: period 2026-09-14 to 2026-09-27, payroll date 2026-10-02, reporting zone `America/Los_Angeles`. Real dates will differ.

Provenance of these samples: produced at `dc487c6` by WP5-UX5-REGATE15 and checked by WP5-UX5-AUDIT-RN, which ran the same scripts again on a fresh export. The earlier samples of `74d5bfe` (`evidence/WP5-PILOT/`) and of the round-5 slice freeze `69d6340` (`evidence/WP5-UX5-T06/`) are history only and no longer represent the product. The run is `make-samples.mjs.txt` in `evidence/WP5-UX5-REGATE15/`: the WP5-PILOT method adapted to the split. It signs off through the production sign-off service, then sends through the production send service (`sendDraft` and `sendRevision`, with the Settings defaults and the per-send overrides named below), runs the production job handlers and the deadline scan at fixed clocks, and extracts each capture folder. It gave 11 messages captured and no job in intervention. `dc487c6` differs from the release `a54061f` only in six Markdown files (README, DEVELOPMENT and the release notes, each in English and Vietnamese) and builds byte-identically (WP5-UX5-REGATE16 and WP5-UX5-RECHECK-RN), so the samples represent the release without being regenerated. The hashes and some Date headers are values of that run and change from run to run: the submission ID is derived from a user id that is random in each run, so each PDF's bytes and SHA-256 differ between runs, and the Date times of some messages shift by minutes with the order of the jobs. Do not read a Date time or a hash as a product fact; the subjects, the decoded bodies and the PDF text agree between runs once the submission ID is set aside. The calendar and the people are synthetic; the signature image is the seed's generated wavy line, and no real signature or reference page was opened or stored.

Each message is saved as one `.txt` (subject, raw headers, decoded body, PDF facts), and each PDF page as a `*-synthetic.png` render. Every render was viewed after it was made, and again by the independent audit. Each PDF has one page; its stored hash equals the captured attachment (`pdf_hash_ok` true for all six in `sample-index.txt`).

| # | Sample | Message file | PDF render | PDF SHA-256 |
|---|---|---|---|---|
| S1 | Manual sign-off at 2026-09-28 23:30 local (saved signature image), then the send of revision 1 from the Send card with the Settings defaults | `msg-05-submission-payroll-manual-rev1.txt` | `pilot-05-submission-payroll-manual-rev1-p1-synthetic.png` | `430344dc50deb888eff18fd431ac298f52c1f692a20efc79a2699158004faffa` |
| S2 | A correction (revision 2) of the S1 period, sent as another copy; a send without a reason was refused first (422 `reason_required`), then sent with the reason "Corrected Sunday end time; please use this copy" | `msg-11-submission-payroll-manual-rev2.txt` | `pilot-11-submission-payroll-manual-rev2-p1-synthetic.png` | `19e8268ed09de67a66c5f4fabe130ceaffa8464a4ec04fa6dfd5425c9c002dc3` |
| S3 | Automatic submission at the deadline, note line off, image authorized | `msg-10-submission-payroll-auto-off-rev1.txt` | `pilot-10-submission-payroll-auto-off-rev1-p1-synthetic.png` | `bdafd3e1bf4d5efe3715b22f9e1d12df6c48759392f9dda1ee9bd717c17ce53b` |
| S4 | Automatic submission at the deadline, note line on (default text "Automatic submission"), image authorized | `msg-08-submission-payroll-auto-on-rev1.txt` | `pilot-08-submission-payroll-auto-on-rev1-p1-synthetic.png` | `fe1778e012158f709bafac7f90993b8ea582555f0a60ad13f689c9ad34543cac` |
| S5 | A revision signed at 2026-09-28 23:30 local and never sent, auto-submit on: the deadline sends it as signed (F-2 a, `origin deadline`, Settings envelope), no new revision | `msg-07-submission-payroll-signed-rev1.txt` | `pilot-07-submission-payroll-signed-rev1-p1-synthetic.png` | `01fede20046b4a1168573e08aef0d6bbc925d44b4847e69a9014767a8539ad4b` |
| S6 | A manual sign-off and one send with "Time rows on the PDF" switched off for this send only (variant `t0o1`; the OT rows stay on) | `msg-04-submission-payroll-norows-rev1.txt` | `pilot-04-submission-payroll-norows-rev1-p1-synthetic.png` | `04500ec24df5f9ca4df44ee1ab2a7484b84982bbc4437200ec2dc5b91c6baafa` |
| N1, N2 | Reminder to the employee ("due in about 18 hours"), one per automatic account | `msg-02-...txt` (note off), `msg-03-...txt` (note on) | none | none |
| N3, N4 | Outcome notice to the employee after an automatic submission | `msg-06-...txt` (note off), `msg-09-...txt` (note on) | none | none |
| N5 | Reminder to the employee of the S5 revision: "Timesheet signed, not sent yet" (new in round 5) | `msg-01-notice-sample.signed-1.txt` | none | none |

Text of each PDF page: `pdf-text-<n>-...txt`. The index with the checks is `sample-index.txt`. Every file is in `handoff/delivery/evidence/WP5-UX5-REGATE15/samples/`. The PDF SHA-256 values in the table are those of that run (see the provenance above). There are five notices; N5 is the new "signed, not sent yet" reminder.

### What the samples show

- **The email to payroll.** From the sender, To the user's configured recipient, Cc the configured copy address, no Bcc, the PDF attached as `timesheet-<payroll-date>-r<n>.pdf`, a plain-text and an HTML part. The default body reads: "Hello, Attached is the timesheet of `{EmployeeName}` for `{PeriodStart}` to `{PeriodEnd}` (payroll date `{PayrollDate}`). Status: `{SignOffStatus}`. Submission `{SubmissionId}`, revision `{Revision}`."
- **Sign off, then send (S1).** The sign-off created the revision, the sign-off record and the PDF job only; the send is a separate step. Subject and status line say "Submitted". The PDF prints the employee name, the saved signature image and the date of the real sign-off in the reporting zone (09/28/2026, although the instant is 09/29 in UTC).
- **Correction and another copy (S2).** The new revision is a separate message and PDF with "Revision 2" and the corrected Sunday end time and OT total (17:00 h:mm instead of 16:30), dated by its own sign-off (09/30/2026). A copy of the period already counted as sent, so the send needed a reason; the run showed the refusal without one and then the accepted send. The reason is stored with the send and is not in the email (the body is the default: "Status: Submitted", "revision 2"). The email does not say that it is a correction or why; the owner judges whether payroll needs that stated in the template or in the message typed for the send.
- **Automatic, note off (S3).** Subject and status say "Submitted", exactly like a manual one. The PDF has the name, the authorized image and the date of the automatic submission (09/29/2026, local date of the deadline run), and no automatic indicator.
- **Automatic, note on (S4).** The note text replaces the status in the PDF as one line under the title ("Automatic submission"); the subject reads "Automatic submission" and the body "Status: Automatic submission". This is the only difference from S3. The recorded revision stays automatic with review pending, an empty `signed_at` and no sign-off; the employee's own screens and the outcome notice (N3, N4) say so.
- **The deadline sends a signed, unsent revision (S5).** The person signed and did not send. Before the deadline the reminder said "signed, not sent yet" (N5). At the deadline, with auto-submit on, the scan sent that same signed revision with the Settings envelope. No new revision was made and the ledger did not change. The PDF carries the real sign-off date (09/28/2026), unlike S3 and S4, which carry the deadline date. No outcome notice follows this send. With auto-submit off the person would get the overdue warning and nothing would be sent.
- **One send with the time rows off (S6).** The PDF has no start or end time cells; the days, categories, the OT cells, the OT total (16:30), the signature and the date are as in a send with the rows on. The sign-off default variant (time rows on) was also rendered and stored for this revision; the send used the other one. The OT rows switch works the same way, and the four combinations are the four stored variants.
- **Notices.** The reminder and the outcome notice go only to the employee, carry `Auto-Submitted: auto-generated`, name the deadline in the reporting zone and give a login-required link; N3 and N4 say review is pending, and N5 says "signed, not sent yet".
- **Known limits visible in the samples** (see [release notes](../../docs/12_RELEASE_NOTES.md)): days without records print as "Worked" with no time on an automatic PDF (R-WA8; the owner's decision F-1 and F-Q1); a correction or late review is sent by the person only, never at the deadline (H-1 a); the samples show no holiday label and no leave day, so the PDF's partial-leave line ("Leave h:mm", which replaces R-WA2) and the shrink-then-ellipsis rule for a long holiday label are read from the code, not shown.

### Wording approval (owner)

The final template text, the note line choice and whether the image goes on automatic submissions are owner inputs. The owner approves the exact wording after seeing a real preview in capture mode on the host.

- [ ] Subject and body template text approved (or changed): ______
- [ ] Note line: off / on with the text: ______
- [ ] Signature image on automatic submissions: authorized / not authorized
- [ ] The statement of a correction in the revision 2 message: accepted as it is / change requested: ______
- [ ] The reason rule for another copy (a confirmation and a typed reason of 2 to 500 characters once a copy counts as sent; the reason is kept in the record and audit log and is not put in the email): accepted as it is / change requested (for example, add the reason to the email): ______
- [ ] A signed revision that was never sent is sent at the deadline when auto-submit is on, and a later correction is never sent automatically (F-2 a, H-1 a): accepted as it is / change requested: ______
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
| Reminders | the user's submission settings | 24 h and 2 h before due, until the period has a send (a signed, unsent period is reminded as "signed, not sent yet"), an overdue warning when auto-submit is off, an outcome notice after an automatic submission | private copy |
| Auto-submit | the user's submission settings | on is the stored preference; nothing is automatic before the activation instant. With it on, the deadline finalizes and sends a draft and sends a signed revision that was never sent (F-2 a); a correction is never sent automatically. Recommended for the first period: off (D-12) | private copy |
| Time rows on the PDF | the user's submission settings (Settings, Personal) | on; the default of the "Time rows on the PDF" switch of each send, also used by the deadline send. Off prints the PDF without the start and end time cells | private copy |
| OT rows on the PDF | the user's submission settings | on; the default of the "OT rows on the PDF" switch of each send, also used by the deadline send. Off prints no OT cells and no OT total | private copy |
| Note line | the user's submission settings | off; text "Automatic submission" | private copy |
| Automatic image authorization | at signature upload, a separate audited authorization (revocable in Settings) | pre-selected at upload; if unticked, no image on automatic submissions | private copy |
| Recipients, templates | the user's submission settings | section 2; the defaults of every send, edited on the Send card for each send | private copy |
| Opening balance | Import screen / `PUT /api/ot/opening-balance` | 0 until the owner sets it (D-10 a with changes, F-1 i): a signed non-zero value with an as-of date (default the day it is set) and a short reason; evidence optional (blank is stored as "not provided"); a correction may return it to 0. No historical workbook import for the pilot | private copy |
| Activation instant | `PUT /api/admin/automation/activation` from the signed-in administrator's console (runbook section 13 step 5) | empty; set to `<activation-instant-utc>` only after the first period is signed off by hand | private copy |
| First pilot period | the owner's choice on the 14-day cycle | payroll dates continue 2026-10-02 + 14 days (2026-10-16, 2026-10-30, 2026-11-13, ...); each is due the prior Tuesday 17:00 reporting zone. Placeholder `<first-payroll-date>` | private copy |

## 5. Restore proof

### Development-machine figures (round-5 container drill of WP5-UX5-REGATE11, not the NAS)

Source: the container drill of WP5-UX5-REGATE11 on `1fe5ad3`, synthetic data, capture mode, Docker Desktop on a developer workstation (`linux/amd64`), image `sha256:47a183b1202aafcce6596ecbd66555519a550c5d3e9e080ffbda5a3bbbcf2b92`. `npm run drill:container -- --wp3 <previous build>`: stages 33, 32, 57, 35, 27 and 23 checks, plus 2 cleanup checks after stage 6 = 209 PASS, 0 FAIL, schema 15 (`handoff/delivery/evidence/WP5-UX5-REGATE11/log-drill.txt`).

Provenance of these figures: the drill ran once, on `1fe5ad3`. It is carried forward to the release `a54061f` by WP5-UX5-REGATE12, REGATE13, REGATE14 and REGATE16 and confirmed by WP5-UX5-RECHECK-RN: `dist/server`, `dist/domain`, the Dockerfile and `vite.config.ts` are unchanged since `1fe5ad3`. The pass counts therefore hold for the release; the per-figure values below (milliseconds, byte counts, write counts) are the REGATE11 run's. The client bundle changed after `1fe5ad3` and is not part of the restore figures.

| Figure | Value |
|---|---|
| Backup while writing | exit 0; 347 ms inside the CLI, 1,082 ms through `docker compose exec`; 5, 56 and 27 writes before, during and after, all 88 succeeded |
| Backup content | schema 15, app 0.1.0, 10 files (7 signatures, 1 PDF), database 684,032 bytes, integrity ok, 0 foreign key violations; every file equals its manifest SHA-256 and size; both import sources are in the backup and hash to their manifest entries |
| Isolated restore | exit 0 in 1,168 ms into a new empty folder; manifest verified; 10 files, 0 mismatched; integrity check passed; schema 15 as in the backup |
| Restored counts equal the backup | users 2, import batches 2, revisions 1, ledger entries 0, attachments 8; sign-offs and work sessions equal the backup |
| Outbound pause | the restored copy is paused with reason `restored`; no send job leased, no attempt sending; nothing was captured or sent while paused (40 s observed) |
| Restored instance | healthy in 5.3 s; the stored session works; one PDF renders |
| Reconciliation | `outbound release` preview lists the held send; `outbound resume --confirm` clears the pause; after it nothing from the backups went out; `release --job` and `--all` each made exactly one attempt |
| Upgrade from the WP3 schema | schema 6 to 15 (versions 7 to 15 applied once, in one transaction); every pre-upgrade row unchanged; the queued mail finished; a restart applied no migration |
| Rollback restore (`--keep-schema`) | refused without `--confirm`, then restored with it (842 ms): counts equal the pre-upgrade values; no send after the previous build started |
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
| Release commit | `a54061f6afc1fda00d4ee2cca4553a5916af24ec` |
| Source digest | `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f` (882 files, `handoff/` excluded) |
| Image ID built on the NAS | `<image-id>` (reference: the drill build of WP5-UX5-REGATE11 on `1fe5ad3`, development machine, same server and domain bundles as the release but not the same client bundle, 110,195,889 bytes: `sha256:47a183b1202aafcce6596ecbd66555519a550c5d3e9e080ffbda5a3bbbcf2b92`) |
| Pre-activation backup | `<backup-name>` (taken in runbook section 13 step 3) |
| Manifest hash of that backup | `<manifest-sha256>` |
| Separate-device copy of the backup and the capture-mode `<env-file>` | where it is kept (private copy) |
| Date of activation | `<activation-instant-utc>` |

The identity rows above are those of section 0 (the release accepted after UI change rounds 4 and 5).

Steps (the full text is runbook sections 14 and 15):

1. Deactivate: if the activation instant was set, clear it first (the console call with `active_from: null` and a reason); wait until no send is queued or leased; in `<env-file>` unset `PRODUCTION_SENDING_ENABLED`, set `OUTBOUND_MODE=capture` and remove the `SMTP_*` values; `<compose> up --detach --force-recreate --no-build`; check the status shows "Outbound mode: Capture only (nothing leaves the server)" and "Not activated", and that `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` prints `0`.
2. Keep the data. Never delete `<data-dir>` or `<backup-dir>`. Never run two queues.
3. Fall back to the Excel workbook for the period (the owner's own copy).
4. Sent mail cannot be recalled; read the delivery history to avoid a double entry. A period submitted in error stays on record and is corrected by a reasoned correction.
5. Restore only if the data are damaged or wrong, never over the live data: check the manifest hash against `<manifest-sha256>`, restore `<backup-name>` in isolation (section 5 form) and reconcile.
6. Residual rule (owner decision D-1 (a)): after a rollback to an older schema, the older build runs with `JOB_RUNNER=off` until reconciliation. It matters only after a later upgrade that adds a migration.

## 7. Release identity and NAS checklist

Release identity: the table in section 0 (`a54061f` / `690fd8fd…`, accepted after UI change rounds 4 and 5). The NAS is **NOT VERIFIED** until the owner ticks every item below and dates it. Until then the result is "software ready, pilot pending" (owner decision D-13 (a)). Every item is an **[owner NAS step, unverified]**, copied from [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) section 2.

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

The owner answered all fifteen on 2026-10-20 (board `owner_decisions`, verbatim in Vietnamese). Source of the options: [WP5-PLAN](tasks/WP5-PLAN.md) section D; the decision record is [10 Decisions](../../docs/10_DECISIONS_AND_SOURCES.md). D-1, D-7, D-8 and D-13 needed an answer before activation and have one. Five answers changed code (D-5 a, D-6 a, D-9 b, D-10 as F-1 (i) and D-15 b, with a shared clock guard); they are part of UI change round 4, which shared the round-5 package-final gate and fresh independent audits and is in the release identity of sections 0 and 6. The round-5 answers are in the second table below. D-11 (a) and D-13 (a): the real values stay in the owner's private copy, and the NAS stays NOT VERIFIED until the owner ticks the section 7 checklist.

| ID | Decision | Answer | What it changed |
|---|---|---|---|
| D-1 (R-A3) | Jobs created after a rollback to an older schema are not held | (a) keep the rule: the older build runs with `JOB_RUNNER=off` until reconciliation | documented only (runbook sections 8 and 15) |
| D-2 (WP4-I-1) | May a draft app period receive imported days | (a) never | documented only (current default) |
| D-3 (WP4-I-2) | "Off day (overtime used)" on import | (a) skip | documented only (current default) |
| D-4 (WP4-I-3) | Import an unended period | (a) no | documented only (current default) |
| D-5 (WP4-I-4) | Correct a mistaken opening balance to a net zero | (a) yes, by a reasoned offsetting correction | code: a correction may return the balance to 0 (a balance already at 0 posts nothing); docs 03, 07, 11, 12 |
| D-6 (WP4-I-5) | Quota on uncommitted import previews | (a) at most 20 per person | code: the 21st new upload is refused (409 `import_preview_limit`); a preview is cleared only by committing it; docs 07, 11, 12 |
| D-7 (F-7) | Reminder after a crash on real SMTP may repeat once | (a) accept at-least-once | documented only (docs 05, 12, runbook section 13) |
| D-8 (F-7) | TLS certificate failure is classified temporary (retries, then intervention) | (a) keep and document it | documented only (docs 12, runbook section 13): a certificate failure is retried, five attempts in all, then intervention, shown as `smtp_unavailable`; the first check after a certificate or host change |
| D-9 (E-11, F-7) | Pilot cohort and passwords (no self-service password change) | (b) a change-password route before anyone else is onboarded | code: `POST /api/auth/password` and the Profile "Change password" card; the administrator's temporary password stays; docs 03, 04, 11, 12 |
| D-10 | Opening balance and history at pilot start | (a) with changes: default 0, may be changed at any time, no evidence needed (F-1 i); no historical import for the pilot | code: reason required, evidence optional ("not provided" when blank), as-of date defaults to the day it is set, correction to 0; docs 01, 03, 07, 10, 11, 12; section 4 row |
| D-11 | Where the real pilot values live | (a) tracked packet with placeholders, real values in the owner's private copy outside git | documented only (section 0) |
| D-12 | Staging of the first real activation | (a) first period manual with real sending to the owner's own address, auto-submit off, no activation instant | documented only (section 2, runbook section 13 step 6) |
| D-13 | Pilot host | (a) the NAS; NOT VERIFIED until the owner ticks the checklist | documented only (section 7) |
| D-14 | First release declaration (`git.release_declared`) | (b) declared after the pilot period | documented only (section 0 declaration row, section 9 checkbox) |
| D-15 (F-Q6) | Holiday-preview privacy | (b) restore per-date counts | code: exact per-date counts with no identity and one `calendar.holiday_preview` audit event per preview; docs 03, 10, 12 |

### Round 5 owner decisions (2026-10-21 and 2026-10-22)

The owner answered the WP5-UX5-PLAN questions F-1 to F-10 on 2026-10-21 and two coordinator questions on 2026-10-22 (board `owner_decisions`, verbatim in Vietnamese). The decision record is [10 Decisions](../../docs/10_DECISIONS_AND_SOURCES.md). F-2, F-3, F-4 and F-5 changed the server, the data and the business rules, so the pilot packet sections 2 to 4 changed with them; the release identity of section 0 includes them.

| ID | Decision | Answer | What it changed |
|---|---|---|---|
| Q0 | Where the round-4 gate goes | (a) round 4 is folded into the round-5 package-final gate | no code; one gate and fresh audits for rounds 4 and 5 (done: section 0) |
| Q1 | The PDF reference image | the owner showed a filled workbook page; used for typography and proportions only, and not stored anywhere because it holds personal data | PDF layout of UX5-T02 |
| Q2 | The PDF footer texts | left: the coordinator's copyright line "© <year> C&D Semiconductor Services, Inc. All rights reserved."; right: "Internal use by C&D only" | PDF footer of UX5-T02 |
| FREEZE-T01B-Q | Who freezes the T01b slice | (a) a fresh committer with explicit paths and no list file | no product change (governance of the freeze) |
| H-1 | After a send, does a correction or late review go at the deadline | (a) a period stays submitted once any revision has a send; the person sends corrections, never the deadline | code: the deadline scan sends a period only when no revision has a send; the Timesheet button reads "Review or correct" after a send; docs 05, 10, 12; section 3 (limits) |
| F-1 | Sub-button height against the 44px touch rule | (a) 36px visible on every device, the 44px target kept as an invisible hit area; the theme control 32px with a fine pointer from 768px | client CSS and tests; docs 04 |
| F-2 | After the split: deadline, reminders, "needs sign off" | (a) "submitted" means sent: reminders run until a send; at the deadline a signed unsent period is sent when auto-submit is on and gets the overdue warning when it is off; the button reads "Review & send" | code: `deadline.send_signed`, reminders "signed, not sent yet"; docs 04, 05, 06, 10; section 3 sample S5 and notice N5 |
| F-3 | The two PDF switches | (b) chosen at each send, also set as the defaults in Settings | code: PDF variants per revision, `show_time_on_pdf`; docs 03, 04, 05, 10; sections 2, 3 (S6) and 4 |
| F-4 | To, Cc, Subject and message on the Send card | editable for each send, with a confirmation and a typed reason before another copy | code: each send is a record (`revision_sends`), `reason_required`, the reason in the audit log and not in the email; docs 03, 05, 06, 10; sections 2 and 3 (S2); the wording-approval checklist |
| F-5 | Sign off without a signature image | (b) with an image sign with the image and the name; without one, with the name; the image is optional | code: migration 0014, the account's display name is the signer; docs 03, 04, 05, 06, 10; section 3 |
| F-6 | What moves to 480px | (a) the sheet's compact form moves to below 480px; the shell, the editor sheet, full-screen dialogs and the 44px rule stay at 768px | client CSS and queries; docs 04 |
| F-7 | A press outside closes the Day editor | (a) a press outside the columns, the drawer and dialogs closes it; presses on buttons and links keep their action | client; docs 04 |
| F-8 | The workbook's instructions paragraph on the PDF | (a) omit it | PDF; docs 03, 04; section 3 |
| F-9 | PDF fonts | (b) a handwriting font if one is usable: approved as Indie Flower (WP5-UX5-G-1, 2026-10-21), with a fallback | PDF; the first committed font file, ADR 0001, the Dockerfile and the gate checks; docs 03, 04, 12; the samples of section 3 show it |
| F-10 | The PDF header "version/revision" | (a) "Revision n" with the submission id small under it | PDF; docs 04; section 3 |
| Mockup notes | The owner's notes on the mockups B1 to B11 (spacing, two signature rows, indents, Indie Flower approval, the PDF type faces) | applied as written | client layout and the PDF; docs 04 |

### Open owner decision: R-UX5I2-3, a calendar default has no version

This is open: the owner has not answered it. It is best decided before the pilot. Source: [WP5_UX5_REVIEW_INT3](WP5_UX5_REVIEW_INT3.md), "Risks", R-UX5I2-3 (pre-existing; WP5-UX5-RECHECK-RN carries it unchanged).

- **The problem.** A calendar default (for example Holiday) has no version. If an administrator imports a holiday while a person's Day editor is open on that day, a later "Save day fields" can record "Worked" over the new Holiday default. That changes the day's required time, so a holiday recorded as Worked changes the hours the person owes. The form shows "Calendar default. Saving records it as your choice." under the old category.
- **The options, as the review gives them.**
  - (a) Keep the behaviour and document it.
  - (b) Send the category only when the person changed it.
  - (c) Refuse the save when the default changed since the load.
- **Answer.**
  - [ ] (a) keep and document / (b) category only when changed / (c) refuse when the default changed since the load: ______ (owner; leave empty until answered)

Suggestion of this packet, not a decision: option (b) or (c) removes the case; option (a) leaves it to the administrator and the person to avoid it. No option blocks the software readiness above.

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
- [ ] The first release is declared after the pilot period, not at this authorization (D-14 b): declared on ______ (leave empty until then; `git.release_declared` stays false)

Owner signature or reference to the owner's own record: ______   Date and UTC instant: ______

After the first real send, record provider acceptance and recipient receipt (facts 3 and 4) separately; an accepted message that never arrives is a provider or mailbox matter, not an application result. Anything unexpected: deactivate (section 6). After the pilot, observe one real period with Excel available for comparison ([06 Acceptance](../../docs/06_TEST_AND_ACCEPTANCE.md)).

## 10. Limits of this packet

- The samples come from capture mode on a development workstation. Real SMTP behaviour, the NAS, the reverse proxy, the certificate and the separate-device copy are unobserved until the owner runs the steps above.
- The sample calendar, names and dates are synthetic. No real host name, address, credential, signature or personal data is in the tracked packet or its evidence.
- The samples of section 3 come from `dc487c6`, which builds byte-identically to the release `a54061f` and differs from it only in six Markdown files; they were not regenerated from `a54061f`. Their hashes and some Date headers are values of one run (section 3). They have no holiday label and no leave day.
- The round-5 limits are in the [release notes](../../docs/12_RELEASE_NOTES.md) under "UI change round 5": a correction made after a send is sent only by the person; the Timesheet button does not see a queued send that has no attempt yet; up to four PDFs are stored per revision; "PDF Preview" opens in a new tab; fractional widths are proved on the style sheet. The container drill and the independent audits of round 5 have run (section 0 and section 5).
- **Pilot device checks, NOT VERIFIED here** ([WP5_UX5_REVIEW_INT3](WP5_UX5_REVIEW_INT3.md), "Optional backlog for the WP5 handoff", item 5): R-A2-1 and R-A2-2; UX4-A 8; classic scrollbars in other browsers ([release notes](../../docs/12_RELEASE_NOTES.md)); and the owner's own look at the PDF samples of section 3 against the reference mockup B11. These checks need the owner's own devices and eyes.
- Section 4 lists documented defaults, not the owner's choices; the owner's values are not known here.
- The reference image ID belongs to the drill build of `1fe5ad3` on the development workstation, not to a build of the release; the NAS build records its own.
- The pilot has not run, the NAS is NOT VERIFIED, no authorization is requested or given, and there is no pilot result.
- Optional backlog for the pilot fix round, by ID only (none blocks the re-acceptance): R-B7-1..R-B7-4 ([WP5_UX_REVIEW_B7](WP5_UX_REVIEW_B7.md)); R-AB8-1..R-AB8-4 ([WP5_UX_REVIEW_AB8](WP5_UX_REVIEW_AB8.md)); R-AB9-1..R-AB9-6 ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.md)); and the B6 and A7 risks ([WP5_UX_REVIEW_B6](WP5_UX_REVIEW_B6.md), [WP5_UX_REVIEW_A7](WP5_UX_REVIEW_A7.md)); from UI change round 2: R-UX2A-1..R-UX2A-5 ([WP5_UX2_REVIEW](WP5_UX2_REVIEW.md)) and R-UX2A2-1..R-UX2A2-4 ([WP5_UX2_REVIEW2](WP5_UX2_REVIEW2.md)); from UI change round 3: R-UX3B-1, R-UX3B-2, R-UX3B-5..R-UX3B-7 ([WP5_UX3_REVIEW_B](WP5_UX3_REVIEW_B.md)); the residual of R-A2-1 and the A2 risks R3, R5, R7 ([WP5_UX3_REVIEW_A2](WP5_UX3_REVIEW_A2.md)); R-B2-2, R-B2-3, R-B2-5 ([WP5_UX3_REVIEW_B2](WP5_UX3_REVIEW_B2.md)); R-INT-1..R-INT-4 ([WP5_UX3_REVIEW_INT](WP5_UX3_REVIEW_INT.md)); and the governance backlog items R3-R5 and R8 of [GOV_UX3_REVIEW2](GOV_UX3_REVIEW2.md); from UI change rounds 4 and 5: the optional backlog of [WP5_UX5_REVIEW_INT3](WP5_UX5_REVIEW_INT3.md) (R-UX5I3-1..R-UX5I3-4 and the earlier items listed there; R-UX5I2-3 is the open decision of section 8) and R-UX5RN2-1..R-UX5RN2-3 ([WP5_UX5_RECHECK_RN](WP5_UX5_RECHECK_RN.md)).
- The optional owner question WP5-UX2-Q3 (the badge of the period that Today opens in the five window days) is superseded by the round-3 answer G-5 (b): that period shows the "in progress" pill. Nothing is open on it.

## 11. Evidence index

`handoff/delivery/evidence/WP5-UX5-REGATE15/samples/` (the current samples, section 3; run on `dc487c6`): `msg-01` to `msg-11` (subject, headers, body of each captured message: six submissions and five notices); `pdf-text-04`, `-05`, `-07`, `-08`, `-10`, `-11`; `pilot-04`, `-05`, `-07`, `-08`, `-10`, `-11` `...-p1-synthetic.png` (the six PDF renders); `sample-index.txt` (page count and hash check of each PDF); `samples-compare.txt` (the comparison with the earlier freeze samples). In `handoff/delivery/evidence/WP5-UX5-REGATE15/` beside it: `42-make-samples.txt` (sample run log, with the send records and delivery attempts); `43-extract.txt`; `44-ready-check.txt` (health and readiness of the built server in capture mode, schema 15, section 1); `45-control-run1-vs-run2.txt` (the control run that shows which values change from run to run); `50-dist-compare.txt` (the `dist/` comparison); the generator scripts as `make-samples.mjs.txt`, `extract.mjs.txt` and `ready-check.mjs.txt`; and the digest records of the gate.

`handoff/delivery/evidence/WP5-UX5-REGATE11/log-drill.txt` (the container drill on `1fe5ad3`, section 5 and the reference image ID; 209 PASS / 0 FAIL, schema 15).

`handoff/delivery/evidence/WP5-UX5-ACCEPT-PACKET/` (this refresh: the preflight, parity, search and digest records).

`handoff/delivery/evidence/WP5-UX5-T06/` (the samples of the round-5 slice freeze `69d6340`, kept as history only; they are replaced by those of REGATE15 above): the same file kinds as above, `06-ready-check.txt` for the readiness check and `04-make-samples.txt` for the run log.

`handoff/delivery/evidence/WP5-PILOT/` (the earlier samples of `74d5bfe`, kept as history only; they no longer represent the product): `msg-01` to `msg-08` (subject, headers, body of each captured message); `pdf-text-03`, `-04`, `-07`, `-08`; `pilot-03`, `-04`, `-07`, `-08` `...-p1-synthetic.png` (the four PDF renders); `sample-index.txt`; `03-make-samples.txt` (sample run log); `04-extract.txt`; `05-ready-check.txt` (health and readiness of the built server in capture mode); the generator scripts as `make-samples.mjs.txt`, `extract.mjs.txt` and `ready-check.mjs.txt`; and the digest, precommit and preflight records of the task.
