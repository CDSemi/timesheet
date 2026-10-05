# WP3-AUDIT-B dispatch brief

- Mission/task: timesheet-software-readiness / WP3-AUDIT-B; package WP3; kind audit;
  attempt 1; depends on WP3-GATE (PASS). Package-final independent audit of area B:
  - jobs, delivery, uncertain send;
  - deadline automation, empty periods, reminders;
  - the note-line and signature-image options;
  - GET safety and deep links;
  - UI standard and visual evidence.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English. WP3_REVIEW_B.md and
  its .vi.md are bilingual and follow handoff/templates/REVIEW.md.
- Author separation: you authored nothing in WP3. The author agent IDs are on the board
  (WP3 tasks other than gates, audits and commits); the strongest author model in WP3 is
  opus, so the audit runs at opus. Treat every report, HANDOFF line and gate result as a
  claim.
- Target: `reviewed_commit` = the WP3-GATE `freeze_commit`; the coordinator gives that
  SHA and the gate digest in the dispatch prompt. Record HEAD and the source digest
  before and after; the digest must equal the gate digest.
- WP3-AUDIT-A may run at the same time in its own scratch clone; do not share files
  with it.
- Environment:
  - Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-AUDIT-B` (outside
    Dropbox); use it for TEMP/TMP.
  - Delete only files you created; never remove folders recursively.
  - Make the first shell call a trivial `node --version` with Node 24 by full path
    (plain `node` on PATH resolves v26); stop on ENOSPC.
  - Do not edit source.
  - Capture mode only; never set `PRODUCTION_SENDING_ENABLED`; no real mail.
  - Use the installed Edge channel; no browser download.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul
    from a POSIX shell.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/WP3_REVIEW.md (your review prompt) and WP3_IMPLEMENT.md;
  - docs/02, docs/04, docs/05, docs/06 (AC-06–AC-10, AC-14), docs/07 and docs/10,
    including "Owner decisions — 2026-10-04";
  - handoff/delivery/WP3_HANDOFF.md and the WP3-GATE results;
  - the WP3-PLAN, WP3-REQ and WP3-REQ2 records;
  - the board `owner_decisions` and `coordinator_decisions`.

## Scope

1. **Durable jobs.**
   - Leases, and retries at 1/5/15/60 minutes.
   - Unique business keys: duplicate keys enqueue once, and two runners claim once.
   - Restart before the PDF, after the PDF and before send.
   - Run your own fault-injection probe on a real SQLite file. Do not rely only on the
     authors' tests.
2. **Uncertain send.** A crash after possible acceptance gives `uncertain`, which is
   never retried automatically. A restart sends nothing. An explicit owner decision
   resends exactly once.
3. **Delivery.**
   - The capture adapter is the default. SMTP is reachable only with `OUTBOUND_MODE=smtp`
     plus `PRODUCTION_SENDING_ENABLED`.
   - Recipients, subject, body and the PDF SHA-256 equal the snapshot.
   - No `attachment.pdf` for attachment-less messages; `MAIL_FROM` handling.
   - No secrets in the DB, logs or capture metadata.
4. **Deadline automation and empty periods.**
   - The activation instant: nothing is automated before it, and its recording is
     audited.
   - Deadlines are computed in the saved IANA reporting zone. A device-zone change must
     not regroup periods.
   - The automatic-submission switch is on/off per user.
   - F-1: an empty period gives the default labels, zero OT, no deficit and one revision.
5. **Note line and image options (F-Q1 (a), F-Q2).**
   - There is no automatic indicator on outgoing PDF or email unless the note is on.
   - The default note text, user-edited text and its validation.
   - `{SignOffStatus}` is "Submitted" or the note text.
   - Automatic submissions: `signed_at` null, and review pending tracked in the system.
   - The image appears only after the explicit, audited authorization of one stored
     signature (default off). Test the 2×2 matrix yourself.
6. **Reminders.**
   - Scheduling and deduplication.
   - No reminder after finalization.
   - Each owner decision in docs/10 that falls in your area (for example F-Q4 per-item
     switches, F-Q5, G-Q1 (b), G-Q2 (a)) is implemented as written.
7. **GET safety and deep links.** Every GET route runs with zero DB changes (your own
   snapshot probe), and deep links require login.
8. **UI standard and visual evidence.**
   - The AGENTS.md UI rules and E-8: CSS custom properties only, 4px radius token, the
     shared transition token, subtle shadows.
   - Mobile layout and accessible names.
   - View the gate and T14 screenshots, and take your own synthetic screenshots of the
     submission, automation and settings screens on desktop and mobile.
9. **Carry items in your area** (from the HANDOFF), judging each one blocking or
   acceptable backlog:
   - a reminder may repeat after a crash on real SMTP;
   - a TLS verification failure is classified temporary;
   - a send claimed before its PDF consumes a job attempt;
   - raw operation names in the history for unknown operations.

## Output

- handoff/delivery/WP3_REVIEW_B.md and .vi.md.
- Results in this file.
- Evidence and probe sources in handoff/delivery/evidence/WP3-AUDIT-B/:
  - masked, LF, no trailing whitespace;
  - screenshots named `*-synthetic.png`;
  - probe scripts stored as `*.mjs.txt` / `*.py.txt`;
  - every email address masked as `<email>`.
- Before hand-back, run the precommit privacy check over your staged outputs in a
  throwaway repository or on a temporary index.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding:
  - an ID (WP3-B-nn);
  - a severity;
  - file:line;
  - a reproduction;
  - the required change.
- Separate observed defects from risks and optional improvements.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

Auditor: WP3-AUDIT-B attempt 1, 2026-10-05 (UTC). Self-reported model: claude-opus-5-5 (equal to the strongest
WP3 author model; this auditor authored no WP3 change). Review: [WP3_REVIEW_B](../WP3_REVIEW_B.md) (EN) and
[WP3_REVIEW_B.vi](../WP3_REVIEW_B.vi.md). Evidence: `handoff/delivery/evidence/WP3-AUDIT-B/` (masked, LF; probes
`*.mjs.txt`; screenshots `*-synthetic.png`; command log `00-commands.txt`).

Decision: **FIX REQUIRED** (one Medium, two Low).

- HEAD before and after: a1cd566e59253d19f53cfd5b3a81fd27a7e9a056 (= origin/main). Digest before and after:
  96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729 (717 files; scratch clone and project folder; equals
  the gate digest). Scratch clone `D:\timesheet-tmp\WP3-AUDIT-B\repo`; Node 24.21.0 by full path; capture only;
  `PRODUCTION_SENDING_ENABLED` never set; no real mail.
- Checks: `npm ci` 0; `verify` with deprecation tracing 0 (60 files / 1384 tests, smoke 40 PASS, 0 deprecation lines);
  `test:e2e` 0 (127 passed, 5 skipped); race/crash files x5 rounds 0; own probes p1 jobs/delivery fault injection
  46 PASS, p2 automation/F-1/2x2 matrix/reminders/zones 94 PASS + 1 FAIL (B-01), p3 GET safety 200 requests with only
  the audited grantee PDF download writing, p4 outbound gating/MAIL_FROM 15 PASS + 1 FAIL (B-02), p5 Edge UI
  desktop/mobile 10 PASS (0 overflow, 0 unnamed controls), p6 CSS tokens 0 literals, p7 overdue choice 5 PASS.
- Findings:
  - WP3-B-01 Medium, `src/server/services/automation.ts:147-157`: an account that never saved settings has no
    auto-submit effective instant, so an account created after activation gets every already-overdue period since
    activation auto-finalized (3 revisions from period 2026-09-28 in one pass). Fix: use `users.created_at` as the
    effective instant of a never-saved account; red-first test.
  - WP3-B-02 Low, `src/server/jobs/jobStore.ts:194-197` with `deliveries.ts:28-53`: a crash during the last (5th)
    send attempt leaves the attempt `sending` (no decision, resend 409) after the job goes to intervention. Fix:
    run `recoverInterruptedSends` every runner pass or in the same transaction; test.
  - WP3-B-03 Low, `src/client/components/sharingModel.ts:179-182`, `otModel.ts:82-97`: History shows
    `timesheet.auto_finalize` "by someone else" and raw WP3 operation codes. Fix: system-event label and plain names.
- Carry items: reminder repeat after SMTP crash, TLS failure as temporary, send-before-PDF attempt: acceptable backlog
  (Low). Raw history names: non-blocking alone, fold into B-03.
- Risks: GET writes by design (grantee PDF audit, session last_seen once per minute); orphan `.tmp` after a kill
  before rename; job-row retention; real SMTP not exercised; inline link without the transition token (Info).
- No server, browser or runner process left running. Privacy check: see `00-commands.txt` addendum.
