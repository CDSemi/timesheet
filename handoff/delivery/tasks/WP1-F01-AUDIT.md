# WP1-F01-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP1-F01-AUDIT; package WP1; kind audit;
  attempt 1; depends on WP1-F01-GATE (PASS required); fresh independent recheck. A PASS
  accepts WP1 and unlocks WP2.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. The author used
  sonnet. Routing: size S, risk H, novelty no. Task record in English;
  WP1_RECHECK.md/.vi.md bilingual (REVIEW template).
- Author separation: you are not the WP1-F01-FIX author (board agent ID) and did not
  write the original WP1 implementation. Treat the fix report and WP1_HANDOFF as claims.
- Target: the WP1-F01-FREEZE commit with the WP1-F01-GATE digest; record HEAD,
  `npm run digest` before and after, and `reviewed_commit`. Any change outside handoff/
  invalidates the audit.
- Prompt: [WP1_REVIEW](../../prompts/WP1_REVIEW.md); the original review
  [WP1_REVIEW](../WP1_REVIEW.md) with F-01. Read AGENTS.md from disk first.

## Scope

1. Recheck F-01 independently: reproduce F-01A and F-01B on the freeze commit with your
   own probe (synthetic data, fresh migrated SQLite). Confirm the behaviour and the
   calculated values that WP1_REVIEW requires.
2. Review the diff `bfdc1a8bbfd0bcbd06511fd02212e111d300356d..<freeze>` in src/ and
   tests/ against standards and spec. Check transaction, ownership, audit before/after,
   rollback and version handling, and that no OT engine or business rule changed.
3. Judge the worker's noted residual risk without assuming it either way: an
   unconfirmed Clock out with a non-empty submitted break set appends breaks without
   checking the saved rows. Decide whether it violates a contract (new finding) or is
   acceptable, citing the canonical rule.
4. Run the mandatory WP1 checks yourself (`npm run verify` with Node 24, preferably in a
   clean export outside Dropbox; digest), plus any WP1_REVIEW-required probes you need.
5. Confirm that WP1's other review evidence still applies to this snapshot or rerun it.

## Output

handoff/delivery/WP1_RECHECK.md and .vi.md, results in this file, evidence in
handoff/delivery/evidence/WP1-F01-AUDIT/. Decision PASS / FIX REQUIRED / NOT VERIFIED with
findings (ID, severity, file:line, required change). Return at most 300 words, beginning
with your self-reported model.

## Results

(Auditor appends here.)
