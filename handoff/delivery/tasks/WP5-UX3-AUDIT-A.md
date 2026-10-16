# WP5-UX3-AUDIT-A dispatch brief (area A: visual, shell, settings, sheet, accessibility)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-A; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-GATE (PASS required); fresh context. Runs in parallel with
  the read-only WP5-UX3-AUDIT-B (other ports, other folders).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk M, novelty yes. Task record in English; review pair
  `handoff/delivery/WP5_UX3_REVIEW_A.md` and `.vi.md` (REVIEW template in
  `handoff/templates/`).
- Author separation: you did not write any WP5-UX3 task (their agent IDs are on the board).
  Treat every worker, planner and verifier report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = cecfceb61c7f15216c8f188e8b7059c9f075247d (the
  WP5-UX3-T10-FREEZE commit) with the gate digest TARGET_DIGEST =
  29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files). Record HEAD, the digest before and after (three forms as the gate did) and
  `reviewed_commit`. Any change outside `handoff/` invalidates the audit; run on a clean
  export or a scratch clone at TARGET_SHA if the working tree is not clean outside
  `handoff/`.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Read

- AGENTS.md (from disk), docs/08 "Gates and independent audit".
- The owner's words: board `owner_decisions` of 2026-10-15/16 (verbatim request and answers)
  and `coordinator_decisions` (including the audit-focus list and its addendum).
- `handoff/delivery/tasks/WP5-UX3-PLAN.md` and `WP5-UX3-PLAN2.md` (Results), the mockup
  `handoff/delivery/design/WP5-UX3/mockup.html`, the slice records T01-T05, T05B, T07 and
  T10, `WP5-UX3-GOV.md`, the gate record `WP5-UX3-GATE.md` and its evidence.
- docs/04, docs/10, docs/12 (EN and VI) as frozen.

## Scope (area A)

1. **Owner fidelity** for U-01..U-20 and U-27 against the owner's own words, with G-1 (b)
   conditions (square week sheets, 4px lifted columns, no shadow over a neighbour, no
   squeezed or overlapping column content, the floating panel), G-2 (a), G-5 (b) and the
   wordmark question U-06. One verdict per item with evidence (screenshot or measurement).
2. **Style system**: tokens in the light set and both dark sets (parity), the transition
   rule (one `--transition`, local durations, never `all`, reduced motion), the AGENTS UI
   section followed in practice, docs/04 "Visual standard" accurate.
3. **Shell and settings**: identity block and account menu (keyboard, Escape, focus return,
   outside click, hash change), phone More, the wordmark rule at the stated widths, Settings
   sub-pages and redirects, the read-only Profile, lazy chunks and their error state; the
   server-side admin authorization unchanged (an employee sees no Administration and makes
   no `/api/admin/` request; the 403 integration tests pass).
4. **Period bar and header**: title row with check in/out, no name line, pills and the "in
   progress" rule from server periods only (own and shared views), meta row, Open a day row,
   narrow "Sign off"/"Current", toolbar spacing.
5. **Sheet**: lifted runs (one outer shadow; check fractional widths such as 1440 for seams,
   gaps or overlap), the editor frame and Day-cell fill (contrast >= 3:1 on every surface),
   Category/Status names, the "No times" ring, the 108px minimum, the 1360px rule, the
   floating modal panel's dock side, the 768-899px inner scroll.
6. **Editor panel** (area A part): header and chips, session cards, the delete
   confirmation's focus rules, WFH on the Category row.
7. **WCAG 2.2 AA**: no regression of AX-01..AX-10, R-12, B-02, B3-01 and the round-2 items;
   your own keyboard walks (desktop and phone, light and dark); a real axe scan of the main
   screens (engine from a temporary folder, no dependency added); the accessible name of the
   Day editor dialog with CSS-generated brackets in Chromium and one other engine available
   locally (Firefox or WebKit through Playwright, if installed; otherwise say so).
8. **Test strength**: at least eight mutants of your own on area-A behaviour (lift run
   positions, the editor frame layer, the wordmark breakpoint, the menu's Escape focus
   return, the 1360px breakpoint, the pill function, the Settings role check, the Category
   rename) and whether the suite catches each.
9. **Audit-focus items** 1-7 of the board list: a verdict each.
10. **Mandatory checks yourself**: typecheck, lint, `npm test` twice, build (no chunk
    advisory), the full e2e on both projects on the real clock, AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-A`; ports 48860-48889; `DATA_DIR` and
  `DATABASE_PATH` inside the task folder for every server or CLI run; never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Git Bash only; never cmd.exe or an interactive shell. **NEVER FEED ANYTHING TO PYTHON OR
  NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm
  -rf`.** Write probes as files in the task folder and run them; read outputs with the Read
  tool. Never kill processes by PID; leave nothing running. Run the digest before any long
  probe. Create files only in the task folder, the evidence folder and the review pair.
- Synthetic data only; screenshots end `-synthetic.png` (at most 16); no email address
  except the full synthetic `@example.invalid` form; `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

The review pair, Results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-AUDIT-A/` (masked LF `.txt` and `-synthetic.png`).
Decision PASS / FIX REQUIRED / NOT VERIFIED with numbered findings (severity, file:line,
reproduction, expected) and optional risks. Return at most 250 words, beginning with your
self-reported model.

## Results
