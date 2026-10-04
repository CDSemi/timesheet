# WP2-AUDIT-B3 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-B3; package WP2; kind audit;
  attempt 1; depends on WP2-GATE3. A fresh final recheck of area B (workspace, admin, UI
  and integration) after the second fix round.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
  - Fresh context; you authored nothing in WP2. The author agent IDs are on the board,
    and they include the WP2-FIXA, WP2-FIXB and WP2-FIXB2 workers.
  - The task record is in English. WP2_RECHECK_B3.md and its .vi.md are bilingual (REVIEW
    form).
- Target: `reviewed_commit` = the WP2-GATE3 `freeze_commit`, given at dispatch. Record HEAD
  and the source digest before and after; the digest must equal the gate digest.
- Execute only in your own scratch clone outside Dropbox, on C:. Delete it and the e2e
  outputs afterwards.
  - Call Node 24 by its full path. The e2e uses the installed Edge; download no browser.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul
    from a POSIX shell.
  - Do not edit source, and report masked values only.
  - WP2-AUDIT-A2 (attempt 2) runs at the same time in its own clone.
- Read AGENTS.md from disk first, including rule 7 and the UI standards section. Then
  read:
  - [WP2_REVIEW_B](../WP2_REVIEW_B.md) and [WP2_RECHECK_B](../WP2_RECHECK_B.md)
    (WP2-B2-01, WP2-B2-02);
  - the WP2-FIXB and WP2-FIXB2 results;
  - docs/02 R-07.

## Scope

1. **WP2-B2-01.**
   - The R-07 e2e is season-independent: the expectation is derived with `Intl` from
     the real date through tests/client/zoneOracle.ts.
   - The unit test covers both seasons and the DST-change days.
   - Confirm that the oracle is independent of the product code, so it is not a
     tautology.
   - Confirm that the spec would pass under standard time. For example, run the helper
     for a winter date, or run the spec with a browser and test date in winter if
     practical.
2. **WP2-B2-02.**
   - The remaining WP2 literals are tokens, with identical computed values on live
     screens against f79413b. The worker's probe used a static page; do your own
     real-screen comparison.
   - List any WP2-introduced literal that remains.
3. **The WP2-B-01 and WP2-B-02 fixes still hold**, including the zone-change re-read and
   the DST re-ask.
4. **WP2-A2-02 from the UI side.** The admin payroll-exception screen still works, with a
   reason required and the 409 for finalized periods.
5. **No area-B regression.**
   - Run `npm run verify` and `npm run test:e2e` (both projects).
   - Visually inspect the screenshots of the changed screens.
   - Gate F1 stays closed.

## Output

- handoff/delivery/WP2_RECHECK_B3.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP2-AUDIT-B3/ (masked, LF; screenshots
  `*-synthetic.png`).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-B3-nn), a
  severity, file:line and the required change.

Return at most 220 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
