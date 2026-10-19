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
- Target: `reviewed_commit` = TARGET_SHA = a78ada5edbf5339d4502df57e9f195d11c0b5d28 (the
  WP5-UX3-FIX3-FREEZE commit), with the regate digest TARGET_DIGEST =
  d1d903cfb148d1bcc74131af3e1aeebed0f1892143e0ede3950ddee335b839ca (833 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit.
  - Work on a clean `git archive` export with no `.git` folder (never `git init` it).
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".

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
