# WP2-AUDIT-A2 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-A2; package WP2; kind audit;
  attempt 1; depends on WP2-GATE2. A fresh recheck of area A (ledger and privacy) after
  the fix round.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context; you authored nothing in WP2. The author agent IDs
  are on the board, and they include the WP2-FIXA and WP2-FIXB workers. The task record
  is in English. WP2_RECHECK_A.md and its .vi.md are bilingual (REVIEW form).
- Target: `reviewed_commit` = the WP2-GATE2 `freeze_commit`, given at dispatch. Record HEAD
  and the source digest before and after; the digest must equal the gate digest.
- Execute only in your own scratch clone outside Dropbox, on a drive with free space.
  Delete it afterwards. Call Node 24 by its full path. Do not edit source. Report masked
  values only.
- Read AGENTS.md from disk first. Then read:
  - [WP2_REVIEW_A](../WP2_REVIEW_A.md) (attempt 1, FIX REQUIRED: WP2-A-01), with its R1–R4
    and its probes in handoff/delivery/evidence/WP2-AUDIT-A/;
  - the WP2-FIXA and WP2-FIXB results;
  - the board coordinator decision dated 2026-10-04.

## Scope

1. **WP2-A-01.**
   - The admin holiday-import preview, and every admin response and screen, reveals no
     employee-derived data: no per-date counts and no signal of which days an employee
     recorded.
   - Re-run the attempt-1 privacy probe against the new commit.
   - Check the regression test.
   - Check `finalized_conflicts` handling.
   - Commit behaviour is unchanged.
2. **No regression in area A** from the fix round (WP2-FIXA server and client; WP2-FIXB
   client).
   - Diff the fix range against 8fae685. Re-run the ledger/privacy probe set and the
     multi-process race in a reduced form; at least 100 rounds are enough.
   - Run the targeted ledger and privacy tests, and `npm run verify`.
3. Confirm that R1–R4 remain non-blocking.

## Output

- handoff/delivery/WP2_RECHECK_A.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP2-AUDIT-A2/ (masked, LF).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-A2-nn), a
  severity, file:line and the required change.

Return at most 220 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
