# WP2-FIXB3 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIXB3; package WP2; kind fix; attempt 1;
  `addresses_audit` WP2-AUDIT-B3 (FIX REQUIRED: WP2-B3-01 and WP2-B3-02, both Low). It
  does not depend on that audit.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing:
  size S, risk M (style tokens with identical rendering; test-helper documentation),
  novelty no.
- Read AGENTS.md from disk first (the UI standards section: "introduce new values only as
  CSS custom properties"). Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP2_RECHECK_B3](../WP2_RECHECK_B3.md), with its evidence in
    handoff/delivery/evidence/WP2-AUDIT-B3/, including the real-screen style-comparison
    probe;
  - the WP2-FIXB and WP2-FIXB2 results.
- Load the design skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` with the Skill tool before CSS edits. AGENTS.md and E-8 win.
- Baseline: main at a3d1b6555c352afa68b3d61ddc67f0c596742698. The working tree differs
  only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Never write into the
  repository root. On Windows, never redirect to /dev/null or nul from a POSIX shell.
- Do not commit.

## Why exhaustive

Three audit rounds in a row found more literal style values. This task closes the class
of finding completely, so that the final recheck does not find another batch.

## Required fixes (binding)

1. **WP2-B3-01, and every remaining instance of the same class.**
   - Compare src/client/styles.css against the accepted WP1 baseline
     (`git show f32978f:src/client/styles.css`). Build an inventory of every declaration
     value introduced or changed in WP2 that is a raw literal: lengths and sizes,
     font-weight, letter-spacing, line-height, colours, durations, opacity, z-index and
     shadow parts.
   - Exclude only `0`, unitless `1`, `100%`, keywords (`auto`, `none`, `inherit`,
     `currentColor`, and similar) and the token definitions themselves.
   - Turn every inventoried literal into a CSS custom property. Reuse an existing token
     where it has exactly the same value.
   - Computed values must be identical. Prove it with a real-screen comparison against
     a3d1b65 that covers all screens; reuse or adapt the WP2-AUDIT-B3 probe from its
     evidence. Also run a mutant control to show the probe can detect a change.
   - Save the inventory, before and after, with a final list that shows zero remaining
     WP2-introduced literals, as evidence.
2. **WP2-B3-02.**
   - tests/client/zoneOracle.ts:20-27 says a DST fold throws, but the code returns an
     instant.
   - Make the documented behaviour true, or correct the comment to the real behaviour.
     Either way, add a fold unit case in tests/client/zoneOracle.test.ts and a gap case if
     there is none.
   - Keep the oracle independent of the product code.

## Owned (writable) paths

- src/client/styles.css.
- tests/client/zoneOracle.ts and tests/client/zoneOracle.test.ts.
- This report and handoff/delivery/evidence/WP2-FIXB3/.

List any other minimal edit as a deviation. Edit no product logic.

## Checks

- Write the fold and gap unit cases red-first if you change the behaviour. If you only
  correct the comment, the new cases document the real behaviour and must pass.
- Run `npm run verify` and `npm run test:e2e` (both projects); both must exit 0.
- Run `npm run digest`.
- Evidence must be masked, LF and free of trailing whitespace. No deprecated APIs and no
  inline styles.

Return at most 160 words, beginning with your self-reported model:
- inventory counts (before and after);
- the real-screen comparison result and the mutant control;
- the B3-02 choice;
- verify and e2e exits;
- digest;
- deviations.

## Results

Self-reported model: claude-sonnet-5-5 (attempt 1; evidence in handoff/delivery/evidence/WP2-FIXB3/, commands in 00-commands.txt).

- WP2-B3-01 (and the whole class): the inventory of declaration literals (outside custom-property definitions; excluded only 0, unitless 1, 100% and keywords) went from 60 declarations / 67 occurrences (37 absent from WP1) at a3d1b65 to 0 / 0 / 0 (final-list.txt). New `:root` tokens: root font size and line height, font weight, letter spacing, h1 size, space-0 and space-row, button padding, hairline, rule, press offset, disabled opacity, `--track` and column counts, order, shape round, diamond transform, triangle clip and clip-hidden. The six `@media` conditions stay literal (documented in the stylesheet header; custom properties cannot drive media queries).
- Real-screen proof: probe adapted from WP2-AUDIT-B3 (20 screens including a focus state, desktop and mobile; extra computed properties per element) against a3d1b65: 4708 elements, 230692 values, 0 differences. Mutant control (three tokens changed in the built CSS): 7210 differences.
- WP2-B3-02: made the documented behaviour true. `instantOfWallTime` now throws for a DST fold as well as a gap, with the reason in the message; the oracle still imports nothing. Red-first: fold and gap cases failed (2 failed), then 6 tests pass (three folds, two fold-edge minutes, three gaps, neighbouring minutes).
- `npm run verify` exit 0 (32 files, 613 tests, no deprecation lines); `npm run test:e2e` exit 0 (74 passed, 2 skipped); digest e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df.
- Deviations: none outside the owned paths. Scratch clones were deleted; no process left running.
