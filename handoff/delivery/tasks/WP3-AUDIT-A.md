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

Auditor: WP3-AUDIT-A attempt 1, 2026-10-05, agent `adc746b3b778914db`, self-reported model `claude-opus-5-5`
(fresh context; authored nothing in WP3). Report: `handoff/delivery/WP3_REVIEW_A.md` (+ `.vi.md`). Evidence:
`handoff/delivery/evidence/WP3-AUDIT-A/` (masked, LF; probe sources `*.mjs.txt`; renders `*-synthetic.png`).
Node v24.21.0 by full path; scratch clone `D:\timesheet-tmp\WP3-AUDIT-A\repo`; capture mode only.

Decision: **NOT VERIFIED** (procedural only). No defect found in area A; every functional check passed. The mandatory
digest record could not be made: the digest command was refused by the permission classifier ("Interfere With
Workloads") after an earlier refusal to stop an interactive `cmd.exe` the first call had opened by mistake; neither
was retried. HEAD before: `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` (clone checkout). Digest before/after: not
recomputed. Gate digest (claim): `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729`.

- `npm ci` exit 0; `npm run verify` (trace/pending deprecation) exit 0: 60 files / 1384 tests, smoke 40 PASS, no
  deprecation line; 12 area-A test files verbose: 273 passed (incl. LG-01..LG-10).
- Race probe (20 rounds, separate OS processes, production sign-off vs production `run-jobs`): manual 11, deadline 9,
  failed 0; one revision, one ledger set, one send per round; automatic: no sign-off, review pending.
- Crash probe: in-transaction kill persists nothing (manual and automatic); committed sign-off durable; identical
  retries replay; late review zero ledger delta (LG-09).
- HTTP probe (built server): owner-only revisions/PDF/signatures (404 swap, 401 anonymous, no static path,
  `no-store`); admin keys within the allowlist, recipients present, no details; no password/hash/token anywhere.
- PDF probe + Edge renders: 14 dates, both Sundays in 18:30, Vietnamese and long labels, bounded image, manual
  name + local sign date, automatic name + submission date, no automatic indicator, note only when on.
- Migrations: WP2-source (`5fafeae`) v3 database upgraded by `cli.js migrate` (4,5,6): rows preserved, 17
  append-only refusals, integrity ok, FK empty; fresh database 1-6 ok.
- Findings: none. Risks R1-R5 (truncated long holiday label, signature bound outside the transaction, auto-submit
  default for users without settings (area B), hash includes balance, early sign-off). Carry items 4, 8, 9, 10, 11,
  13, 14: acceptable backlog / not defects; 1-3, 5-7, 12 belong to area B.
- Next: the coordinator records `npm run digest` of `a1cd566`; if it equals the gate digest, area A has no blocking
  finding.
