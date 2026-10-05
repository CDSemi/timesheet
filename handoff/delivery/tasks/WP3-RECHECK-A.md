# WP3-RECHECK-A dispatch brief

- Mission/task: timesheet-software-readiness / WP3-RECHECK-A; package WP3; kind audit;
  attempt 1; depends on WP3-REGATE (PASS).
- Purpose: WP3-AUDIT-A ended NOT VERIFIED for a procedural reason only, with no finding.
  The permission classifier refused its digest command, so the result is not bound to
  the gate digest. This recheck is a fresh, digest-bound area-A audit on the fix-round
  freeze. It also checks that the fix round did not regress area A.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English.
  `WP3_RECHECK_A.md` and its `.vi.md` are bilingual and follow
  handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP3, including WP3-FIXB and WP3-FIXC. The author agent IDs
    are on the board.
  - Treat every report, HANDOFF line, gate result and earlier review as a claim.
  - You may reuse the probe sources published in handoff/delivery/evidence/WP3-AUDIT-A/
    as a starting point, but run everything yourself.
- Target: `reviewed_commit` = the WP3-REGATE `freeze_commit`. The coordinator gives the
  SHA and the regate digest in the dispatch prompt.
  - Record HEAD and the source digest **as your first two commands** after
    `node --version`, and again at the end.
  - The digest must equal the regate digest.
- WP3-RECHECK-BC runs at the same time in its own clone. Do not share files or
  processes with it. Use distinct ports.
- Environment:
  - Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-RECHECK-A`,
    outside Dropbox; use it for TEMP/TMP.
  - Delete only files you created; never remove folders recursively.
  - Use Node 24 by full path; plain `node` resolves v26.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.
  - Do not edit source. Use capture mode only.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
- If a permission check denies a call, stop that line of work and report it; do not
  retry or rephrase it.
- Read AGENTS.md from disk first. Then read:
  - [WP3-AUDIT-A](WP3-AUDIT-A.md), its scope and results;
  - handoff/prompts/WP3_REVIEW.md;
  - the docs named there;
  - handoff/delivery/WP3_HANDOFF.md, including the fix-round section;
  - the WP3-REGATE results;
  - the board `coordinator_decisions` dated 2026-10-05.

## Scope

1. Every item of the WP3-AUDIT-A scope (1–8), on the new freeze. Use your own
   multi-process race and crash probes on real SQLite files.
2. **Fix-round effects on area A:**
   - the C-01 review hint stays outside the snapshot, the payload hash and the PDF; it is
     owner-only and absent from admin responses; signing gives the same reviewed hash
     with the hint shown and hidden;
   - the C-02 History attribution exposes no other user's data;
   - the B-01 creation bound does not change sign-off, revisions or the ledger for
     existing accounts;
   - any new field or migration from the fix round upgrades cleanly from the WP2 source
     and from a1cd566 databases.
3. Recheck the risks R1–R5 from WP3_REVIEW_A as risks. Raise one as a finding only with
   a reproduction and a rule ID.

## Output

- handoff/delivery/WP3_RECHECK_A.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP3-RECHECK-A/:
  - masked (`<email>`, `<user>`), LF;
  - probes stored as `*.mjs.txt` / `*.py.txt`, renders as `*-synthetic.png`.
- Write markdown links only to files, never to directories.
- Run the precommit privacy check over your outputs on a temporary index before
  hand-back.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP3-RA-nn), a
  severity, file:line, a reproduction and the required change.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
