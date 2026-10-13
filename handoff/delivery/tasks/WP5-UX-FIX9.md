# WP5-UX-FIX9 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX9; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B7 (FIX REQUIRED), and the same root cause in
  WP5-UX-AUDIT-A7; depends on WP5-UX-REGATE6 (PASS).
- Scope: **tests only**. Fix WP5-UX-B7-01 = WP5-UX-A7-01. Read both rows in
  `handoff/delivery/WP5_UX_REVIEW_B7.md` and `handoff/delivery/WP5_UX_REVIEW_A7.md`
  ("Findings").
  - The cause: `tests/e2e/isolation.spec.ts:51-53` (`seedOwner`, used by `:94` and
    `:145`) and `tests/e2e/shell.spec.ts:68` take a day from `pastFreeWorkdays()`
    (`tests/e2e/fixtures.ts:392-406`). That list puts the in-progress period's days
    first. But `currentPayPeriod` (`src/domain/periods.ts:149-164`) keeps the previous
    period on screen for a while after a new period starts.
  - The effect: during that window the seeded day is not on the page, and the mandatory
    AC-01 isolation flows fail before any isolation assertion runs. This happens on
    every build, including bf954c0.
  - The window is open now (2026-10-13 in Los Angeles). The two auditors describe its
    length differently: A7 says until the payroll date, B7 says until the due time.
    Derive the exact rule from the domain code yourself and record it.
- Coordinator decision (board `coordinator_decisions`, 2026-10-13):
  - make no product source change in this round;
  - keep every assertion;
  - prove the fix deterministically, not by waiting for a date.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size S, risk M (the AC-01 evidence depends on these specs), novelty no. Task
  record in English.
- Base: HEAD = origin/main = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8, or a later commit
  that changes only handoff/; source digest
  b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files). Run the
  digest and record HEAD before you edit. Uncommitted coordinator files under
  `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first. Also read docs/06 line 30 (deterministic clocks) and AC-01.
- The two review rows above, and the auditors' scratch diffs
  `handoff/delivery/evidence/WP5-UX-AUDIT-B7/04f-fixcheck-scratch-diff.txt` and
  `handoff/delivery/evidence/WP5-UX-AUDIT-A7/04g-isolation-variant-diff.txt`.
- `src/domain/periods.ts` (`currentPayPeriod`), and `tests/e2e/fixtures.ts`
  (`pastFreeWorkdays` and any helper that already returns the displayed period's days).

## Fix

1. Find every e2e call site that seeds or opens a day taken from a helper that can
   return a day outside the period the page shows, then asserts on that page. Search
   all specs, not only the two named ones, and list every call site in Results.
2. Seed from the period the app displays first, for example with an existing
   `displayedPeriodFreeWorkdays()`. Or navigate to the period that contains the seeded
   day. Keep every isolation and shell assertion unchanged in substance.
3. Handle the edge case where the displayed period has no past normal workday (for
   example, a holiday on the only past workday): fail with a clear message, or choose a
   valid day. Never skip silently.
4. Prove the selection rule deterministically:
   - Add a fast check, either a unit test or a pure helper under `tests/`, that steps
     the reporting-zone "today" through every day of at least two full periods. Include
     the due Tuesday before and after 17:00 America/Los_Angeles, and the payroll date.
   - At each step it asserts that the chosen seed day lies inside `currentPayPeriod`
     for that day.
   - It must fail against the old `pastFreeWorkdays()[0]` choice for the window days.
   Record the exact window you derive.

## Hard constraints

- No change under `src/`, `docs/`, `scripts/`, `package*.json` or config files. Only
  `tests/` may change.
- In `tests/e2e/fixtures.ts`, only additive changes are allowed (a new helper). Never
  change the behaviour of an existing helper that other specs use.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only`.
- Synthetic data only.

## Owned paths

- `tests/` (spec, helper and unit-test files that the fix needs; list each changed file
  in Results)
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX9/` (masked LF `.txt` only)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (v24.x).
2. Reproduce now on 255ba17 (we are inside the window): run `isolation.spec.ts` and
   `shell.spec.ts` on both projects. Record the failures. Also record the
   reporting-zone today and the displayed period.
3. Fix. Then run `npm run typecheck`, `npm run lint` and `npm test` (with the new
   deterministic check). Show that the deterministic check fails when the old choice is
   restored in a scratch copy.
4. Run `isolation.spec.ts` and `shell.spec.ts` on both projects three times. Then run the
   FULL e2e suite on both projects once, sequentially, with its own output folder and
   `E2E_SCREENSHOT_DIR` inside the task folder. Record the counts.
5. Grep the changed files and the evidence for email addresses and user-profile paths.
   Only the full synthetic `@example.invalid` form may remain. Mask probe-truncated
   addresses as `<email>`.
6. Run `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. Run `npm run verify` with `SMOKE_PORT` in 48460-48469, and with `DATA_DIR` and
   `DATABASE_PATH` set inside the task folder.
8. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
9. Copy the masked logs of steps 2-4 and 6-8 into the evidence folder. That includes the
   digest output.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.** Redirect output to a file in the task folder and read it with
  the Read tool. Use the Write and Edit tools for files (no sed). Use the Glob and Grep
  tools to search.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX9`. Set TEMP and TMP to it. Use ports
  48460-48479 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- Never stop a process you did not start, never kill by PID, never remove anything
  recursively, and never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push. Do not install or change dependencies.
- In Results, never write a blocked token verbatim (an email address other than the full
  synthetic form, or a profile path).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the derived window rule;
- the call sites fixed;
- the edge-case handling;
- the deterministic check and its failure on the old choice;
- the reproduction on 255ba17;
- the 3x spec runs and full e2e counts per project;
- the unit count;
- the preflight and verify exit codes;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Base HEAD 255ba17; digest before edit b07727b2...5abe (793 files).

**Window rule (from `currentPayPeriod`):** the page shows the period with the earliest payroll
date >= today, so the previous period stays on screen through its payroll date inclusive. The
in-progress period (`payPeriodContaining`) differs on P-4..P (5 days: Monday after the period ends
through the payroll Friday). The due Tuesday (P-3) lies inside it, at any time of day. A7 (until the
payroll date) is nearer the truth; B7 (until the due time) is wrong. Old choice lands outside the
page on P-3..P (4 days; P-4 has no past in-progress day yet).

**Reproduction on 255ba17** (today 2026-10-13 America/Los_Angeles, displayed period payroll
2026-10-16, 09-28..10-11, in-progress 10-12..10-25): `repro.txt`, 6 failed (isolation 94 and 145,
shell 67, on both projects; `[data-day="2026-10-12"]` not found), 7 passed, 1 skipped.

**Call sites** (grep of all specs for `pastFreeWorkdays`): isolation.spec.ts `seedOwner`
(used by 2 tests) and shell.spec.ts:68 fixed to `displayedSeedDay()`. admin.spec.ts:88 also uses it
but only seeds data to bind the calendar and never looks for the day on the page: not affected,
unchanged. All other specs already use `displayedPeriodFreeWorkdays()`.

**Edge case:** `displayedSeedDay()` throws "The displayed period (payroll X) has no past normal
workday without a session on D; ..." instead of skipping. No assertion changed or removed.

**Changed files:** tests/e2e/displayedSeed.ts (new, pure), tests/e2e/fixtures.ts (additive import
and method `displayedSeedDay`), tests/e2e/isolation.spec.ts, tests/e2e/shell.spec.ts,
tests/domain/e2eSeedSelection.test.ts (new, 4 tests).

**Deterministic check:** steps 56 days (four periods, four wall times a day incl. due Tuesday
16:59 and 17:00 and the payroll date) with the production period functions; asserts seed inside
`currentPayPeriod` and the exact window (20 days). Negative control: old choice outside on 16 days.
Scratch copy with the old choice restored failed 3 of 4 (`unit-scratch-old-choice.txt`); scratch
file removed.

**Results:** typecheck 0, lint 0, `npm test` 0 (83 files, 1827 tests; 4 new). Two specs 3x: each
run exit 0, 13 passed, 1 skipped (mobile-only test on desktop). Full e2e, one run both projects:
exit 0, 210 passed, 26 skipped (project-specific tests), 0 failed; desktop 103 ok, mobile 107 ok.
Preflight (python under `C:\Users\<user>\.cache\...`) exit 0. `npm run verify` exit 0
(SMOKE_PORT 48461, DATA_DIR/DATABASE_PATH in task folder). Email grep: only
`@example.invalid` forms; no profile paths.

**Final digest (last command, after verify):**
58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files).

**Evidence:** handoff/delivery/evidence/WP5-UX-FIX9/ (digest-before, repro, typecheck, lint, test,
unit-scratch-old-choice, specs-run1..3, e2e-full, preflight, verify, digest-final).

Deviation: one `ls dist | head -3` slipped in early (a pipe into head, no effect). No background
tasks started; none running.

Status: done
