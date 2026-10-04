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
- Target: `reviewed_commit` = a3d1b6555c352afa68b3d61ddc67f0c596742698 (the WP2-GATE3
  `freeze_commit`). The gate digest is
  5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
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

### Auditor result (attempt 1)

Self-reported model: claude-opus-5-5 (not weaker than the strongest WP2 author, opus). Fresh context; no WP2 authorship.
Report: [WP2_RECHECK_B3](../WP2_RECHECK_B3.md) and .vi.md. Evidence: `handoff/delivery/evidence/WP2-AUDIT-B3/`
(`00-commands.txt` lists every command and exit).

- Target: HEAD = origin/main = a3d1b6555c352afa68b3d61ddc67f0c596742698 before and after. The source digest
  5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581 (613 files) was the same before and after, in the
  project and in the C: clone, and equals `git ls-tree` and the gate digest. Nothing changed outside handoff/.
- Checks: `npm run verify` exit 0 (32 files / 611 tests, 0 deprecation lines). `npm run test:e2e` exit 0 (74 passed,
  2 skipped, both projects).
- WP2-B2-01: verified.
  - zoneOracle.ts imports nothing. It matches a no-Intl arithmetic check on every day of 2026-2028 (0 of 2192 conversions
    differ).
  - The committed R-07 e2e, unmodified, passes with the server clock at 2026-11-03 and 2027-01-14 (picked 2026-11-02 and
    2027-01-13, PST). The old f79413b spec fails on the same run (08:00 expected, 07:00 received).
- WP2-B2-02: verified. The real-screen comparison against f79413b covered 18 screens, 4690 elements and 159,460 values:
  0 differences. A mutant token run was detected (1817 differing lines).
- WP2-B-01 and WP2-B-02 still hold. The Berlin probe confirmed the display-zone default, the zone change with breaks, and
  the fold and gap re-ask.
- WP2-A2-02 (UI side): verified. The reason is required (UI and 422), the 201 body keys are exactly `payroll_exception`,
  and the finalized period gets 409 `period_finalized`, shown in an alert with nothing recorded.
- F1 stays closed.
- New findings, both Low:
  - WP2-B3-01: `font-weight: 600` ×8 and `letter-spacing: -0.01em` ×4 remain WP2 literals (src/client/styles.css:142,
    143, 170, 194, 377, 516, 588, 763, 810, 842, 860, 861). Required change: tokenize them with identical computed values.
  - WP2-B3-02: tests/client/zoneOracle.ts:20-27 says a DST fold throws, but it silently returns an instant. Required
    change: throw on folds or correct the comment, and add a fold unit case.

Verdict: FIX REQUIRED.
