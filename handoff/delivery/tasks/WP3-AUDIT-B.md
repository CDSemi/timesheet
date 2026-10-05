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

(Auditor appends here.)
