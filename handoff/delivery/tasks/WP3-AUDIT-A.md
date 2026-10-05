# WP3-AUDIT-A dispatch brief

- Mission/task: timesheet-software-readiness / WP3-AUDIT-A; package WP3; kind audit;
  attempt 1; depends on WP3-GATE (PASS). Package-final independent audit of area A:
  finalization, ledger, revisions, ownership, files, PDF content, privacy and the admin
  boundary.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English. WP3_REVIEW_A.md and
  its .vi.md are bilingual and follow handoff/templates/REVIEW.md.
- Author separation: you authored nothing in WP3. The author agent IDs are on the board
  (WP3 tasks other than gates, audits and commits); the strongest author model in WP3 is
  opus, so the audit runs at opus. Treat every report, HANDOFF line and gate result as a
  claim.
- Target: `reviewed_commit` = the WP3-GATE `freeze_commit`; the coordinator gives that
  SHA and the gate digest in the dispatch prompt. Record HEAD and the source digest
  before and after; the digest must equal the gate digest.
- WP3-AUDIT-B may run at the same time in its own scratch clone; do not share files
  with it.
- Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-AUDIT-A` (outside
  Dropbox); use it for TEMP/TMP. Delete only files you created; never remove folders
  recursively. Make the first shell call a trivial `node --version` with Node 24 by full
  path (plain `node` on PATH resolves v26); stop on ENOSPC. Do not edit source. Capture
  mode only; no real mail. Never write into the repository root; on Windows never
  redirect to /dev/null or nul from a POSIX shell.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/WP3_REVIEW.md (your review prompt) and WP3_IMPLEMENT.md;
  - docs/01, docs/02, docs/03, docs/05, docs/06 (AC-01, AC-03, AC-06–AC-10, AC-14) and
    docs/10, including "Owner decisions — 2026-10-04";
  - handoff/delivery/WP3_HANDOFF.md, the WP3-GATE results, and the WP3-PLAN, WP3-REQ and
    WP3-REQ2 records;
  - the WP2 review A and its recheck (the accepted WP2-A-01 behaviour);
  - the board `owner_decisions` and `coordinator_decisions`.

## Scope

1. **Finalization.** Trace the sign-off end to end: the IMMEDIATE transaction, the
   reviewed-hash binding (snapshot v2, SHA-256 of canonical JSON), `expected_seq` and the
   409 conflict. Run your own multi-process probe of the deadline/manual race on a real
   SQLite file: one winner, one revision, one ledger set, one send. There must be no
   invented `signed_at` (automatic: null, review pending).
2. **Ledger.** Check revision_ledger_lines and the pending variants (F-2: re-evaluated
   only by a later finalized revision, no background posting), and that there is no
   duplicate ledger after a crash. A late review must still give a zero delta. Check the
   WP2 rules LG-01…LG-10 where WP3 touches them.
3. **Revisions and downloads.** `GET /api/revisions` and `GET /api/revisions/:id/pdf`
   must be owner-only. Check: ID swap 404, anonymous 401, no static path, `no-store`. The
   signature endpoints (`signatures/current`) must behave the same way. Check path
   handling of the private file store.
4. **PDF content.** View the gate renders and render your own:
   - all 14 dates, with OT on both Sundays in the total;
   - Unicode Vietnamese and long labels;
   - a bounded signature;
   - manual: name and the real sign date; automatic: name and the submission date.
5. **Privacy and the admin boundary (F-3, F-Q3 (b), A3-01).**
   - No other user's data through any route or UI.
   - Admin sees everything except each person's timesheet details. Check every admin
     response field against the allowlist; recipient addresses are present.
   - No audit payloads in admin status.
   - No password, hash, token or SMTP secret in any response, log, audit payload,
     capture metadata or evidence.
   - Screenshots and committed evidence are synthetic only.
   - The accepted WP2-A-01 behaviour holds (F-Q6 is open; no change expected).
6. **Migrations 0004–0006.**
   - Upgrade from a database created at the accepted WP2 source
     5fafeaee72509c6110a907458643bf7582dad81a: rows are preserved, append-only triggers
     still apply, `integrity_check` is ok and `foreign_key_check` is empty.
   - A fresh database works.
7. **Carry items in your area** (from the HANDOFF): judge each one blocking or
   acceptable backlog.
8. The WP3 parts of AC-01 and AC-03, plus AC-06–AC-10 and AC-14 for your area.

## Output

- handoff/delivery/WP3_REVIEW_A.md and .vi.md.
- Results in this file.
- Evidence and probe sources in handoff/delivery/evidence/WP3-AUDIT-A/:
  - masked, LF, no trailing whitespace;
  - screenshots and renders named `*-synthetic.png`;
  - probe scripts stored as `*.mjs.txt` / `*.py.txt`;
  - every email address masked as `<email>`.
- Before hand-back, run the precommit privacy check over your staged outputs in a
  throwaway repository or on a temporary index.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP3-A-nn), a
  severity, file:line, a reproduction and the required change. Separate observed defects
  from risks and optional improvements. Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
