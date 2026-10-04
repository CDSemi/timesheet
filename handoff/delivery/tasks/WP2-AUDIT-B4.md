# WP2-AUDIT-B4 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-B4; package WP2; kind audit;
  attempt 1; depends on WP2-GATE4. A fresh final recheck of area B after the third fix
  round.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk M, novelty no.
  - Fresh context; you authored nothing in WP2. The authors, including all fix workers,
    are on the board.
  - The task record is in English. WP2_RECHECK_B4.md and its .vi.md are bilingual (REVIEW
    form).
- Target: `reviewed_commit` = the WP2-GATE4 `freeze_commit`, given at dispatch. Record HEAD
  and the source digest before and after; the digest must equal the gate digest.
- Execute only in your own scratch clone outside Dropbox, on C:. Delete it and the e2e
  outputs afterwards.
  - Call Node 24 by its full path. Use the Edge channel and download no browser.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul
    from a POSIX shell.
  - Do not edit source, and report masked values only.
  - WP2-AUDIT-A2 (attempt 3) runs at the same time.
- Read AGENTS.md from disk first, including the UI standards section. Then read:
  - [WP2_RECHECK_B3](../WP2_RECHECK_B3.md) (WP2-B3-01, WP2-B3-02), with its evidence;
  - the WP2-FIXB3 result and its inventory evidence;
  - the earlier review chain, for context: WP2_REVIEW_B, WP2_RECHECK_B.

## Scope

1. **WP2-B3-01 and the whole literal class.**
   - Independently re-run a literal scan of src/client/styles.css against
     `git show f32978f:src/client/styles.css`. The class covers WP2-introduced raw lengths
     and sizes, font-weight, letter-spacing, line-height, colours, durations, opacity,
     z-index and shadow parts. The exclusions are `0`, unitless `1`, `100%`, keywords and
     token definitions.
   - Confirm that zero WP2-introduced literals remain. Name any that do.
2. **Computed styles are identical** on live screens against
   a3d1b6555c352afa68b3d61ddc67f0c596742698, across all screens, with a mutant control.
3. **WP2-B3-02.**
   - The zoneOracle fold behaviour matches its documentation.
   - Fold and gap unit cases exist and pass.
   - The oracle stays independent of the product code.
4. **No area-B regression.**
   - The diff since a3d1b65 is limited to the three files.
   - Run `npm run verify` and `npm run test:e2e` (both projects).
   - Visually inspect a sample of screens.
   - The earlier verified items (B-01, B-02, B2-01, B2-02, the payroll screen, F1) still
     hold.

## Output

- handoff/delivery/WP2_RECHECK_B4.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP2-AUDIT-B4/ (masked, LF; screenshots
  `*-synthetic.png`).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-B4-nn), a
  severity, file:line and the required change. Separate defects from optional
  improvements: an optional improvement is not a FIX REQUIRED finding.

Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
