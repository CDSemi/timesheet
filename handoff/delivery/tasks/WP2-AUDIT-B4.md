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
- Target: `reviewed_commit` = 5fafeaee72509c6110a907458643bf7582dad81a (the WP2-GATE4
  `freeze_commit`). The gate digest is
  e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
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

### Auditor result (attempt 1)

Self-reported model: claude-opus-5-5. Report: [WP2_RECHECK_B4](../WP2_RECHECK_B4.md) (and `.vi.md`). Evidence:
`handoff/delivery/evidence/WP2-AUDIT-B4/` (`00-commands.txt`).

- Target: HEAD = origin/main = 5fafeaee72509c6110a907458643bf7582dad81a before and after; source digest
  e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (613 files) before and after, in the project and in
  the scratch clone, equal to the WP2-GATE4 digest. Nothing changed outside handoff/.
- Scope 1 (WP2-B3-01 and the whole class): an independent scanner over src/client/styles.css against f32978f finds
  431 declarations, 0 with a raw literal, 0 WP2-introduced, 0 `var()` fallbacks. Only the six `@media` preludes
  (767/768 px breakpoint) and the token definitions hold values. Control on a3d1b65: 60 declarations / 67 occurrences /
  37 absent from WP1. Static resolution gives 1293 values identical to a3d1b65 (light, dark, reduced motion).
- Scope 2 (computed styles): the committed e2e suite was instrumented at every screenshot point (26 screens per project)
  plus 20 probe states per project (focus, hover, pressed, disabled, dark, reduced motion, all shapes). 91 screen states,
  26,377 elements, 2,162,914 values: 0 style differences against a3d1b65; the 48 geometry and 314 content differences
  are content-driven (account order, clock times, generated ids). Mutant (5 tokens): 10,978 style differences.
- Scope 3 (WP2-B3-02): the oracle imports nothing. Against an exhaustive reference over 10 zones and 32 transitions,
  900 gap and 900 fold minutes all throw with the right kind, and every other minute matches: 0 mismatches. A no-Intl
  check also gives 0 mismatches, and the control on a3d1b65 gives 2,280. The unit tests (6) pass and hold fold and gap
  cases.
- Scope 4 (no regression): the diff touches only the three files. `npm run verify` exit 0 (32 files / 613 tests, 0
  deprecation lines); `npm run test:e2e` exit 0 (74 passed, 2 skipped). The R-07 e2e passes with server clocks at
  2026-11-02 and 2027-01-13 (PST), and the season check gives 0 mismatches over 8,768 conversions. B-01, B-02, B2-01,
  B2-02, the payroll screen and F1 hold. Visual sample inspected.
- Own-tooling failures, both rerun and recorded: an auditor expectation error in the first oracle check, and a preload
  SyntaxError before any test ran in the first winter attempt.

Verdict: PASS. No findings. The optional improvements (unused `--space-6`, the header wording on 767/768 px, a ±1-day
oracle note, the carried B3 items) are listed separately and are not defects.
