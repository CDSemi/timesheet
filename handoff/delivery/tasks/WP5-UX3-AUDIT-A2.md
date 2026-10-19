# WP5-UX3-AUDIT-A2 dispatch brief (area A recheck)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-A2; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE2 (PASS required).
- Fresh context. This is the recheck of WP5-UX3-AUDIT-A (FIX REQUIRED on 7ce4e95 /
  262138e0) after WP5-UX3-FIX3.
- Runs in parallel with the read-only WP5-UX3-AUDIT-B2, which uses other ports and other
  folders and may run full e2e suites at the same time.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk M, novelty no.
- Records:
  - task record in English;
  - review pair `handoff/delivery/WP5_UX3_REVIEW_A2.md` and `.vi.md`, from the REVIEW
    template in `handoff/templates/`.
- Author separation: you did not write any WP5-UX3 task and you are not the area-A auditor
  of the first pass (agent IDs are on the board). Treat every worker, planner, verifier and
  auditor report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f (the
  WP5-UX3-GOV2-FREEZE commit; the source of the FIX3 freeze a78ada5 plus the owner's
  AGENTS.md text and its AGENTS.vi.md translation, accepted through the GOV chain), with the
  regate digest TARGET_DIGEST =
  b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit.
  - Work on a clean `git archive` export with no `.git` folder (never `git init` it).
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards". The text at
  ceb86b6, accepted by WP5-UX3-GOV2-AUDIT, replaces any injected copy. An injected copy may
  still show the owner's unedited text, with `docs/runbooks/vi/` and "shop-floor aware".

## Read

- AGENTS.md (from disk), and the docs/08 section "Gates and independent audit".
- The first area-A review `handoff/delivery/WP5_UX3_REVIEW_A.md` (findings F-UX3A-01..06,
  risks R1-R9, item verdicts) and its evidence.
- `handoff/delivery/tasks/WP5-UX3-FIX3.md` (Results) and `WP5-UX3-REGATE2.md` (Results).
- The board's `coordinator_decisions` of 2026-10-16.
- docs/04 (EN and VI) as frozen.

## Scope

1. **Each first-pass finding closed, by your own probes on the build of the target:**
   - F-UX3A-01: the focus ring under the pointer, for the date button, the Category
     picker, the phone day button and button links. Check both themes and the Escape
     return at 1440.
   - F-UX3A-02: hover gating, by a stylesheet scan, plus a tap on the mobile project.
   - F-UX3A-03: 44px with a coarse pointer at 768, 1024 and 1280.
   - F-UX3A-04: the Sign out gap and alignment.
   - F-UX3A-05: the More-panel Escape test fails under mutant A4.
   - F-UX3A-06: phone Administration with a long delivery state at 390 and 320, with axe.

   Give one verdict each.
2. **Regression from FIX3's diff in area A.** `git diff 7ce4e95..a78ada5 -- src tests docs`
   is the whole change; read it.
   - FIX3 moved several hover rules into `@media (hover: hover)` and added
     `:focus-visible:hover` rules. On a hover device, every interactive control must still
     have its rest, hover, active, focus-visible, selected and disabled looks in both
     themes, with hover at least 1.20:1 and an accent boundary.
   - Run a keyboard walk of the Timesheet page, the account menu, Settings and the phone
     More panel, with and without the pointer resting on the focused control.
   - Repeat the attempt-1 contrast sweep for the changed rules.
   - Carry the first-pass area-A verdicts forward for everything FIX3 did not touch, and
     state the basis (the diff).
3. **Test strength.** At least six mutants of your own on FIX3's area-A changes: each
   focus-under-hover rule, the hover gating of one rule, the coarse identity height, the
   Sign out flex, the phone badge wrap. Say whether the suite catches each.
   - Judge the stylesheet-wide hover scan in `tests/e2e/hover.spec.ts` (around line 577):
     its empty allowlist, and whether it can pass vacuously.
   - Judge the `surviveStall` wrapper in `tests/e2e/theme.spec.ts`. Does it retry only its
     own poll timeouts? Can a real product settle failure still fail the test? Prove one
     direction with a mutant: a transition that never settles.
4. **Risks.** Re-judge the first-pass risks R1 (now documented in docs/04 line 46, EN and
   VI), R3, R5, R7 and R8.
   - WP5-UX3-REGATE2 attempt 2 (PASS) recorded three observations. Judge each as a
     finding or a risk:
     - the Sign out icon starts 3px further right than Profile's (15 against 12px inside
       the entry), in the menu and in More;
     - the away first screen at 390x844 sits 2.2px lower (within the budget);
     - docs/10 line 240 says "after WP5-UX3-FIX2" while the build is FIX3's (486.81 kB).
   - The regate did not repeat the DPR 2 seam crops. FIX3 changed `styles.css`, so repeat
     the first-pass DPR 2 crops of a lifted run at 1440 and at two fractional widths, in
     light and dark.
5. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` twice, build (no chunk advisory);
   - the full e2e on both projects on the real clock;
   - AC-13 once.

   If a run fails by timeout under the parallel load, rerun it once and record both runs
   with the load context.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-A2`. Ports 49080-49109.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only; never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN (NO HEREDOCS, NOT EVEN EMPTY
  ONES; NO `node -e`, `python -c`, `| node`, `| python`). NEVER PIPE INTO `head` OR `tail`
  (NOT EVEN `head -0` OR `head -n 0`). NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout`, `/dev/zero` OR `nul`. NEVER `rm -r` OR `rm -rf`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Never kill processes by PID; leave nothing running.
- Run the digest before any long probe.
- Create files only in the task folder, the evidence folder and the review pair. Evidence
  names end in `.txt` or `-synthetic.png` only.
- axe-core 4.14.0 may go in the task folder only.
- Synthetic data only. Screenshots end in `-synthetic.png`, at most 12. No email address
  except the full synthetic `@example.invalid` form; write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX3-AUDIT-A2/`.
- A decision of PASS / FIX REQUIRED / NOT VERIFIED, with numbered findings (severity,
  file:line, reproduction, expected) and optional risks.
- Return at most 250 words, beginning with your self-reported model.

## Results

### Attempt 1 - auditor checkpoint 1 (in progress, 2026-10-19 22:12Z)

- Self-reported model `claude-opus-5-5`, profile timesheet-auditor, fresh context; not an author of any WP5-UX3 task and not the
  first-pass area-A auditor. The strongest author model on the board is `claude-opus-5-5`, so the reviewer is not weaker.
- Digest before (21:54:01Z), three forms equal: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files
  (clean `git archive` export with no `.git`, `git ls-tree` form byte-identical, `npm run digest`); HEAD = origin/main = `ceb86b6`;
  0 non-handoff status lines.
- Mandatory static checks in the pristine export: typecheck 0, lint 0, `npm test` 0 and 0 (94 files, 2141 tests each), build 0
  (main `index-BJ9ZzqiL.js` 486.81 kB, no chunk-size advisory), AC-13 0 (1/1). Full e2e on the real clock running; probes and
  mutants follow. Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-A2`.

### Checkpoint 2 (2026-10-19 22:21Z)

- FULL e2e run 1 (real clock, 21:59-22:17Z, area-B audit active, my probes from 22:07Z): exit 1, 644 passed, 1 failed, 67
  skipped (desktop 325/30/1, mobile 319/37/0); the failure is `automation.spec.ts:268` desktop, `TypeError: fetch failed`
  caused by `read ECONNRESET` on a private-server request (network error); the test alone with `--repeat-each 5` passed 10 of
  10. A full rerun alone is planned after the mutants.
- Probes on the target build: F-UX3A-01, 02, 03, 05 (pending mutant A4), 06 closed by my measurements; F-UX3A-04 closed for the
  gap and vertical alignment, with a 3px horizontal start offset of Sign out (REGATE2 observation 1 confirmed). New: the phone
  More panel stays open after Tab past Sign out and 12 of 14 Category pickers then take focus entirely hidden behind it; Escape
  from the page does not close it (both projects at 390x844). DPR 2 seams identical to the first pass (R3 unchanged).

### Final result (2026-10-19 23:25Z) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5. Review pair `handoff/delivery/WP5_UX3_REVIEW_A2.md` and `.vi.md`; evidence
`handoff/delivery/evidence/WP5-UX3-AUDIT-A2/` (masked LF `.txt`, 12 `-synthetic.png`).

- Target `reviewed_commit` `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f`; HEAD = origin/main = target before and after; 0 non-handoff
  status lines before and after. Digest `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files, equal in
  three forms (clean `git archive` export without `.git` hashed with `git hash-object --no-filters`; `git ls-tree` form
  byte-identical; `npm run digest`) at 21:54:01Z and 23:17:11Z.
- Findings:
  1. Medium: `src/client/components/AppShell.tsx:141-162, 196-227`: the phone More panel stays open after Tab past Sign out (no
     focus-out close, unlike `AccountMenu.tsx:193-197`); 12 of 14 Category pickers then take focus entirely hidden behind it
     (25/25 sample points), Escape from the page does nothing; both projects at 390x844 (WCAG 2.2 SC 2.4.11; docs/04 line 7).
     Pre-existing since round 3.
  2. Low (test strength): `styles.css:4584-4586` (button link) and `:795-797` (phone tab) focus-under-hover rules removable
     without a failing test (M4 199 passed, M5 272 passed); add them to `hover.spec.ts:672-712`.
  3. Low: `styles.css:875-901`: Sign out starts its icon and words 3px right of every other entry (15/45px against 12/42px),
     menu and More (REGATE2 observation 1).
- F-UX3A verdicts: 01 closed (ring under the pointer on date, picker, both button links, phone day button, tabs; Escape return
  at 1440; light and dark); 02 closed (31 hover rules, all under `(hover: hover)`; phone taps leave rest looks); 03 closed
  (coarse 768/1024/1280: smallest bar control 44px, identity 232.92x44); 04 closed as named (gap 12.0px, centre 0.88px; horizontal
  remainder = finding 3); 05 closed (A4 mutant fails 4 tests); 06 closed (326/326 and 256/256, axe 0 violations in 8 scans).
- Observations: 1 finding 3; 2 risk (next period 561.7, previous 583.0 against the tab bar at 788); 3 risk (486.81 kB still
  rounds to 487 kB). Risks R1 and R8 closed; R3, R5, R7 unchanged; new R-A2-1..4 (hover scan textual gating, fault code breaks
  mid-identifier, button-link hover look, run-1 network flake).
- DPR 2 seams at 1440, 1445, 1367, 1601, light and dark: clean, same numbers as the first pass (light 2.8/3.0, dark 8.4-9.5/255).
- Mutants: 13; caught M1-M3, M6, M7, M8, M9, M10, M11 (A4), M12 (a 60 s transition: 8 of 8 contrast tests fail after three
  tries); survive M4, M5 (finding 2), M6b (scan gating by `(hover: hover), (pointer: coarse)`). All restored byte-equal.
- Mandatory checks: typecheck 0, lint 0, `npm test` 0 and 0 (2141 each), build 0 (486.81 kB, no advisory), AC-13 0 (1/1); FULL
  e2e run 1 exit 1 (644 passed, 1 failed by `read ECONNRESET` in `automation.spec.ts:268`, 67 skipped; the test 10/10 alone),
  run 2 exit 0 (645 passed, 67 skipped, 0 failed; desktop 326/30, mobile 319/37), 0 deprecation lines.
- Slips: one pipe into `tail -c` and one redirect to `/dev/stderr` in read-only display commands; no other rule broken. Servers
  of the repository harness use OS-assigned loopback ports. Nothing of mine is left running.

Status: done (decision FIX REQUIRED)
