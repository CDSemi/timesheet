# WP3 independent review — area B (jobs, delivery, automation, reminders, GET safety, UI)

Translation: [WP3_REVIEW_B.vi.md](WP3_REVIEW_B.vi.md). Task brief and results: [WP3-AUDIT-B](tasks/WP3-AUDIT-B.md). Evidence: `evidence/WP3-AUDIT-B/` (masked, LF; probes stored as `*.mjs.txt`; screenshots `*-synthetic.png`).

## Independent review

- **Package/date/reviewer and observable model/effort:** WP3, area B; 2026-10-05 (UTC). Reviewer `timesheet-auditor`, task WP3-AUDIT-B attempt 1; self-reported model `claude-opus-5-5`; effort requested xhigh (not observable from inside the session).
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` (the WP3-GATE `freeze_commit`, equal to `origin/main`); digest `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729` (717 files, `handoff/` excluded) before and after, in the scratch clone and in the project folder; equal to the gate digest. No unpushed commit. Complete source in a scratch clone outside Dropbox.
- **Decision: FIX REQUIRED** — one Medium defect (WP3-B-01) and two Low defects (WP3-B-02, WP3-B-03). Everything else in area B passed the auditor's own checks.
- **Scope actually inspected/executed:** durable jobs (store, runner, leases, retries, business keys), PDF and send jobs, capture and SMTP adapters (SMTP by code reading only), the uncertain-send decision, outbound configuration and `MAIL_FROM`, deadline automation and activation, F-1 empty periods, the note-line and signature-image options and `{SignOffStatus}`, reminders and notices, GET safety of every GET route, deep links, device-zone independence, the E-8 visual standard, mobile layout and accessible names, the gate and T14 renders and screenshots, and the four area-B carry items. Read: AGENTS.md, WP3_REVIEW, WP3_IMPLEMENT, docs/01–07 and 10 (owner decisions 2026-10-04), WP3_HANDOFF, WP3-GATE results, WP3-PLAN/REQ/REQ2 and the board decisions.

### Evidence table

| Command | Result/exit | Evidence |
|---|---|---|
| `npm ci` (Node 24.21.0, scratch clone) | exit 0, 160 packages | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 60 files / 1384 tests; SMOKE PASSED, 40 `PASS` lines; 0 deprecation lines | `02-verify.txt` |
| `npm run test:e2e` (Edge, desktop + mobile) | exit 0; 127 passed, 5 skipped, 0 failed | `03-e2e.txt` |
| Probe p1: jobs and delivery fault injection on a real SQLite file (child processes killed with SIGKILL) | exit 0; 46 PASS | `04-p1-jobs-delivery.txt`, `p1-jobs-delivery.mjs.txt` |
| Probe p2: activation, deadline scan, F-1, 2×2 note × image matrix, reminders, zone independence | exit 1; 94 PASS, 1 FAIL (WP3-B-01) | `05-p2-automation.txt`, `p2-automation.mjs.txt` |
| Probe p3: every GET route × owner/grantee/admin/anonymous, per-table hashes and `data_version` | exit 0; 200 requests, 1 writing (the audited grantee PDF download) | `06-p3-get-safety.txt`, `p3-get-safety.mjs.txt` |
| Probe p4: outbound gating (refusals only), `MAIL_FROM`, sender fault, crash on the last send attempt | exit 1; 15 PASS, 1 FAIL (WP3-B-02) | `07-p4-delivery-config.txt`, `p4-delivery-config.mjs.txt` |
| Probe p5: built server, run-jobs CLI, Edge screenshots desktop/mobile, accessible names, overflow, deep link, browser zone | exit 0; 10 PASS; 16 screens with 0 overflow, 0 unnamed controls, 0 mobile controls under 44 px | `08-p5-ui.txt`, `audit-b-*-synthetic.png` |
| Probe p6: E-8 tokens in `styles.css` and inline styles | exit 0; 0 literals outside `:root`; radius, shadow and transition only through tokens; 0 inline styles | `09-p6-css-tokens.txt` |
| Probe p7: auto-submit change and the explicit overdue choice | exit 0; 5 PASS | `10-p7-overdue-choice.txt` |
| `vitest run` deadline-race, delivery-crash, jobs-restart × 5 rounds | exit 0 each; 14 tests per round | `11-race-rounds.txt` |

Main observed results (all from the auditor's own runs):

- **Jobs:** a duplicate business key from 4 processes × 200 rounds gives one row per key; 3 runner processes claim 60 jobs exactly once (all succeeded on attempt 1); retries are 60, 300, 900 and 3600 s, then intervention on attempt 5; a dying runner is not reclaimed at 119 s, is reclaimed at the lease expiry and goes to intervention `lease_expired` after the fifth expiry.
- **PDF restart:** kills before write, before rename and after rename leave one PDF attachment row, one stored file and an unchanged ledger (one orphan `.tmp` file stays; the sweep is not scheduled).
- **Send restart and uncertain:** a kill after prepare reuses the `preparing` attempt and captures once; a kill after `sending` is committed gives `uncertain` (`lease_expired_while_sending`) with the job in intervention, and later passes send nothing; a kill after the adapter accepted (capture written) also gives `uncertain` with no second capture. The explicit `resend` decision captures exactly once, a second decision is 409, `mark_delivered` sends nothing; one revision, ledger unchanged, decision audited once.
- **Delivery:** captured envelope = snapshot To + Cc and `MAIL_FROM`; subject, `{SignOffStatus}` and PDF SHA-256 equal the snapshot and the stored PDF; capture metadata has no secret field; 25 reminder/notice captures have no `attachment.pdf`, no PDF fields and one recipient. `OUTBOUND_MODE=smtp` is refused without the owner flag and with the values `TRUE`, `1`, `yes`, ` true`; an invalid `MAIL_FROM` is refused without echoing the value; with no sender the attempt is `failed_permanent`/`sender_missing`, the job is in intervention and nothing is captured. No plaintext password or SMTP credential in any table.
- **Automation:** with the activation instant empty, runner passes after a deadline write no job, revision or reminder; a past activation instant is 422, a blank reason is 422, an employee gets 403; the recording is audited once (before `null`, after the instant). Switch on: automatic revision (origin `deadline`, review `pending`, no actor, no reviewed hash, no `signoffs` row); switch off: one overdue record and one overdue warning, no revision; a manually finalized period is not finalized again; nothing 30 s before the deadline. The deadline scan under TZ America/Los_Angeles, Pacific/Kiritimati, Asia/Ho_Chi_Minh and UTC gives identical periods and payload hashes; in Edge, the browser zones America/Los_Angeles and Pacific/Kiritimati show the same period, 14 accounting dates and reporting-zone deadline. Switching auto-submit on later does not submit an overdue draft; only the explicit `apply_to_overdue_drafts` choice does.
- **F-1:** an empty period under `auto_deduct` gives one revision, 14 days labelled Worked/Off, no OT proposal, no deficit proposal and no ledger row. Choose mode on the automatic path leaves a `pending_choice` debit line and posts only the computable credit.
- **Note × image matrix (2×2, own run):** PDF image count 0/0/1/1 exactly as authorized; the note line appears only when on (default text "Automatic submission", custom text when set); no other automatic indicator (`automat|pending|unsigned|not signed|review|deadline|system`) on the PDF or in the e-mail; `{SignOffStatus}` is "Submitted" or the note text in subject and body; the printed date is the automatic submission date in America/Los_Angeles (10/13/2026, not the UTC date 10/14); Vietnamese names render. Note text validation refuses blank, two lines, braces and 121 characters. The owner's own review and history screens say "Submitted automatically, review pending" and "Not signed yet".
- **Reminders:** the 24 h reminder is decided once per active account and not again on a rerun; the 2 h reminder goes to every unfinalized account and not to the one finalized manually; outcome notices for every automatic submission, decided once; the notice says review is pending and links only to `<origin>/#/review/2026-10-16`; that review needs login (401).
- **GET safety:** 44 registered GET paths (43 API plus the static client) × 4 roles = 200 requests: no table changed and `data_version` stayed constant, except the grantee PDF download under `/api/shared/:ownerId/revisions/:id/pdf`, which writes its required audit row (owner decisions F-Q4/F-Q5, gate item 7). A GET in a new minute updates only `auth_sessions.last_seen_at`. Anonymous API GETs answer 401; the deep link opens the login screen first and then the requested review (desktop and mobile).
- **UI standard:** tokens only (`--radius: 4px`, `--transition: all 300ms ease-out`, multi-layer `--shadow-*`), one documented 768 px breakpoint, no inline styles; screenshots show a consistent, dense layout on desktop and mobile.

### Findings

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP3-B-01 | Medium | `src/server/services/automation.ts:147-157` `governingSwitch` (and the candidate list at `:217-247`) | p2 section 9: activation 2026-10-01; admin creates an account on 2026-11-12 that never saved settings; one runner pass at 00:00:30 | Expected: a period already overdue when the account was created is not submitted automatically without an explicit choice. Actual: three automatic revisions (payroll 2026-10-16, 10-30, 11-13; first period starting 2026-09-28) are finalized with default labels, outcome notices are queued and the send jobs fail `recipient_missing`. The same default-on branch auto-submits a never-configured admin account every period (p2, p5 admin screenshot). | docs/05 "Deadline and recovery" (eligibility needs the user's auto-submit effective instant; changes default to future periods, overdue drafts need an explicit choice), AC-07, F-4; HANDOFF carry item 6 ("the activation instant is the protection") is disproved for accounts created after activation | For an account with no saved settings version, use the account's creation instant (`users.created_at`) as its auto-submit effective instant, so a period whose `due_at` precedes it is skipped (`before_effective`); keep default-on for later deadlines. Add a red-first integration test (account created after activation with past deadlines → no revision; the next deadline after creation → automatic per F-1). |
| WP3-B-02 | Low | `src/server/jobs/jobStore.ts:194-197` (`claimNextJob` lease-expired sweep) with `src/server/services/deliveries.ts:28-53` (`recoverInterruptedSends`, called only from `sendJob.ts:214` and `deliveries.ts:170`) | p4 section 3: four `failed_temporary` outcomes, then the runner is killed after `sending` is committed on the fifth (last) attempt; one pass after the lease expiry | Expected: the attempt becomes `uncertain` and asks for the owner's decision. Actual: the job goes to intervention `lease_expired`, the attempt stays `sending` with `decision_required: false`, the History shows "Sending" and a resend is refused 409 `delivery_in_progress`, until some other send job runs anywhere. No blind resend occurs. | docs/05 failure table ("process/connection lost after possible acceptance: mark uncertain … require explicit resend decision"), AC-08 | Mark the open `sending` attempts of a send job uncertain whenever the job leaves `leased` without its handler (e.g. call `recoverInterruptedSends` at the start of every `runJobsOnce` pass, or update the attempts in the same transaction as the lease-expired intervention). Add a test of this sequence. |
| WP3-B-03 | Low | `src/client/components/sharingModel.ts:179-182` `historyActorBadge`; `src/client/components/otModel.ts:82-97` `OPERATION_TEXT` | p5 history screenshot `audit-b-automation-owner-history-desktop-synthetic.png` after an automatic submission | Expected: the employee's own screen tells the truth about the automatic origin in plain words. Actual: the event shows the raw code `timesheet.auto_finalize` with the badge "by someone else" (every actor-less system event — `deadline.overdue`, `deadline.finalize_failed` — gets that badge), and other WP3 operations (`timesheet.signoff`, `revision.resend`, `delivery.decision`, `auth.login`) appear as raw codes. | docs/04 Screens ("keep ordinary flows free of DB/job terminology"), owner decision F-Q2 (the employee's screens show the automatic origin) | Label actor-less events as an automatic system action instead of "by someone else", and add plain labels for the WP3 operation codes; extend the existing client model tests. |

No other defect was observed in area B.

### Carry items (area B)

| Carry item | Judgement | Reason |
|---|---|---|
| A reminder may repeat after a crash on real SMTP | Acceptable backlog (Low) | Advisory notice to the employee's own address only; decisions are deduplicated per occurrence; the window is a crash between provider acceptance and `completeJob`; capture mode is protected by the attempt folder; no payroll artefact or ledger effect. A `sending` marker on `send_reminder` would give at-most-once if the owner wants it. |
| A TLS verification failure is classified temporary | Acceptable backlog (Low) | Code reading (nodemailer reports the STARTTLS/TLS socket error as `ESOCKET`): nothing is transferred, credentials are never sent in clear (`requireTLS`/`secure`), the job retries 1/5/15/60 minutes and ends in visible intervention; only the code `smtp_unavailable` is less precise. Not exercised against a server (capture-only rule). |
| A send claimed before its PDF consumes a job attempt | Acceptable backlog (Low) | Observed in p2 (2 sends retried, delivered on the next pass). Harmless unless the PDF job fails repeatedly on the same schedule, when the send can reach intervention `pdf_not_ready` and needs a manual resend. Ordering the PDF before the send (or deferring without an attempt) would remove it. |
| Raw operation names in the history | Non-blocking on its own (Low; the pattern was accepted in WP2), but fold into the WP3-B-03 fix | WP3 adds raw codes for its own operations, including the automatic submission, and the same screen mislabels system events "by someone else". |

### Risks and optional improvements (not proven defects)

- GET writes by design: the grantee PDF download writes its audit row; any authenticated GET updates `auth_sessions.last_seen_at` at most once per minute. Neither signs, submits or consumes anything (docs/05).
- Orphan temporary PDF files after a crash before rename stay on disk (the file-store sweep exists but is not scheduled; HANDOFF item 4). Job rows (one `deadline_scan` per minute, one `reminder_scan` per 5 minutes) are never deleted.
- Real SMTP was not exercised by this audit; the SMTP adapter and the loopback-sink tests ran inside `npm run verify`.
- The inline link "record it on the OT screen" (`src/client/components/ReviewFindings.tsx:157`) has no shared transition or hover style (Info).
- `imported_unverified` exclusion is checked in code and in the authors' tests; a real import path arrives in WP4.

### Required gates unrun/blocked and why

- Real SMTP sending, NAS deployment and production activation: forbidden before the owner's pilot authorization.
- No mandatory area-B gate line was left unrun.

### Disposition of previous findings

- WP3-GATE (PASS) and the author reports were treated as claims and re-executed where they fall in area B; the gate's figures (60 files / 1384 tests, 40 smoke `PASS` lines, 127 passed / 5 skipped) reproduce. The HANDOFF carry item 6 is the root of WP3-B-01.

### Software readiness, owner permission and pilot result

- Software readiness (area B): not accepted until WP3-B-01 to WP3-B-03 are fixed and rechecked.
- Owner permission for real sending/activation: not requested, not given. Pilot result: none.

### One next action/prompt

The coordinator dispatches one bounded fix task for WP3-B-01, WP3-B-02 and WP3-B-03 under [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), then the freeze, the gate and a fresh area-B recheck at the new digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP3-AUDIT-B attempt 1, reviewer agent `aca7e1ccf879138f1`; reviewed authors are the WP3 task agents on the board (PLAN, REQ, REQ2, T00–T15 with T07B and T13A–T13D, DOC, REC1).
- **Fresh context; confirm reviewer did not author changes:** fresh context; this reviewer authored no WP3 change and changed no source. Strongest author model `claude-opus-5-5` equals the reviewer's model.
- **Source digest before/after; gate evidence for that snapshot:** `96870f7e…6e729` before and after; WP3-GATE evidence `evidence/WP3-GATE/` is for the same snapshot.
- **New report path preserving previous review history:** `handoff/delivery/WP3_REVIEW_B.md` (new); no earlier WP3 area-B review exists.
- **Finding dispositions and next coordinator fix/recheck task:** WP3-B-01 (Medium), WP3-B-02 (Low), WP3-B-03 (Low) open → one fix task, freeze, gate, fresh area-B recheck.
