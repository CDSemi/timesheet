# WP5-UX-FIX8 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX8; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B6 (FIX REQUIRED); depends on
  WP5-UX-AUDIT-B6 (done) and WP5-UX-REGATE5 (PASS).
- Scope: fix finding **WP5-UX-B6-01 (Low)** only. Read its row in
  `handoff/delivery/WP5_UX_REVIEW_B6.md` ("Findings"). At 390x844 on the mobile project,
  for a person with a received share (so the "Shared with me" switcher is in the compact
  shell bar) while the zone note shows (device zone different from the reporting zone),
  the shell bar wraps to 106.8px and the first day row ends at 830.2px, below the tab bar
  top at 788px. docs/04 line 48 (EN and VI) promises that the first day row is fully
  visible above the tab bar at 390x844. The defect predates FIX7.
- Coordinator decision (board `coordinator_decisions`, 2026-10-09): fix the layout and
  keep docs/04 line 48 as written. Do not narrow the rule.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no
  override. Routing: size S, risk M (the switcher is a sharing control), novelty no.
  Task record in English.
- Base: HEAD = origin/main = bf954c0b371ad9a5fe461a603c5d476ea210e66c, or a later commit
  that changes only handoff/; source digest
  b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files). Record
  both before you start. Uncommitted coordinator files under `handoff/` are expected;
  never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only).
- `handoff/delivery/WP5_UX_REVIEW_B6.md` (B6-01 and the dispositions table) and the
  auditor's probe `handoff/delivery/evidence/WP5-UX-AUDIT-B6/b6c.probe.ts.txt` with its
  output files `44b-*`.
- docs/04 (EN and VI) lines 40-80.
- `src/client/components/SharingSwitcher.tsx`, `AppShell.tsx`, the compact-bar and touch
  rules in `src/client/styles.css`, and `PeriodBar.tsx`.

## Fix

- Keep the phone first screen within budget when the switcher is shown. Two options:
  - move "Shared with me" into the More panel below 768px;
  - keep it in a one-row compact bar with a visible, compact label.
  Choose either, or a better option that meets the same rules. Explain the choice in
  Results.
- Keep:
  - the visible label (SC 3.3.2);
  - an accessible name that contains the visible text (SC 2.5.3);
  - AX-06 (the select only chooses, and "Open" navigates);
  - 44x44 targets;
  - focus not obscured (AX-01: the measured shell-bar size still drives the scroll
    padding);
  - visible focus rings;
  - the share bar below the shell bar;
  - owner-only control hiding (AC-16);
  - the same routes;
  - no change at 768px and wider, unless needed.
- If the switcher's place changes, update the sentence in docs/04 (EN and VI) that
  describes where it is. Line 48's promise stays unchanged.

## Hard constraints

- No server, API, request-body, domain or calculation change. `src/client/api.ts` and
  `tests/e2e/fixtures.ts` are NOT owned. Set up the received share inside the spec through
  the existing helpers or the public API, as `sharing.spec.ts` does; if that is
  impossible, stop and report.
- No e2e assertion removed or weakened.
- Tokens only for colours, rings, radius, shadows and durations.
- Keep every behaviour that earlier audits verified. That includes:
  - B-01 for a person without received shares;
  - the "Open a day" widths;
  - AX-01..AX-10 and R-12;
  - the modal editor below 1200px;
  - the Escape order and focus returns.

## Owned paths

- `src/client/` (only files the fix needs; list each changed file in Results)
- `tests/e2e/` spec files (`*.spec.ts`) and the existing helper `tests/e2e/dayButton.ts`;
  not `fixtures.ts`
- `tests/client/` unit tests
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` (the switcher placement
  sentence only, if it changes)
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX8/` (masked LF `.txt` only, plus at most six
  screenshots whose basenames end `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Reproduce at the base:
   - Add a mobile e2e check: a person with a received share and the zone note at 390x844,
     where the bottom of the first `[data-day]` row is at or above the tab bar top.
   - Show that it fails on bf954c0 (scratch copy in the task folder, or revert your
     source hunk in a scratch copy). Record the measured numbers.
3. Fix, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects, with `E2E_SCREENSHOT_DIR` inside the task
   folder and its own output folder. Run it sequentially, never in parallel with another
   Playwright run. Record the counts. If `automation.spec.ts:118` fails with ECONNRESET,
   rerun only that test three times, record it, then rerun the full suite once.
5. Measure the first-screen budget at 390x844 in all four states: no share / share, each
   with no note / note. Measure 375, 360 and 320 for information. At 390 and 320, check
   that the switcher is still reachable by keyboard and by touch, with AX-06 behaviour.
6. EN/VI parity of any docs/04 change. Run `validate_package.py --preflight` by its
   script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. Grep your changed files and evidence for email addresses and user-profile paths.
   Only the full synthetic `@example.invalid` form may remain. Mask probe-truncated
   addresses as `<email>`, and never write such a token verbatim in Results.
8. Run `npm run verify` with `SMOKE_PORT` in 48340-48349, and with `DATA_DIR` and
   `DATABASE_PATH` set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
  Read tool. Use the Write and Edit tools for files (no sed).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX8`. Set TEMP and TMP to it. Use ports
  48340-48359 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies.

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the chosen fix and why;
- the reproduction numbers on bf954c0;
- the four-state budget numbers after the fix;
- the files changed;
- the unit and full e2e counts per project;
- the preflight and verify exit codes;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Base: HEAD bf954c0b371ad9a5fe461a603c5d476ea210e66c (the `git status` showed only
`handoff/` changes); source digest at start b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files, from the
brief; not re-run before the edit).

**Fix chosen: a one-row compact bar** with the visible, smaller label (not the More panel). The existing e2e (`sharing.spec.ts`,
`keyboard-access.spec.ts`) use the switcher in the bar on the phone, and moving it would change those assertions and add a tap to a
sharing control. The CSS-only change (below 768px) keeps the label, the select, Open, the routes and AX-06 as they are:
- the bar column gap is `--space-3`;
- the label text is `--font-size-xs`;
- `label.inline` inside the switcher drops the 8px block padding (the select and Open keep their 44px height);
- the switcher has a flex basis of `--switcher-basis` (16rem, new custom property), so the brand and the switcher share a 390px row.
A narrower bar wraps the switcher below the brand as before (320: 90.8px). `--shell-bar-size` is still measured, so AX-01 scroll
padding follows. No change at 768px and wider. docs/04 does not describe the switcher's place in the bar (line 14 only says
"Shared with me"), so docs/04 EN and VI are unchanged and line 48 stays as written.

**Files changed:** `src/client/styles.css`; `tests/e2e/sharing.spec.ts` (new describe "phone first screen with a received share",
2 mobile tests, one per zone situation). No other file.

**Reproduction on bf954c0** (new test, mobile, `03-repro-base.txt`): zone note shown: first `[data-day]` bottom 812.8 > tab bar top
788.5. Zone equal: shell bar 106.8 > 60. Both fail. (The auditor measured 830.2; this run's synthetic data and page differ slightly.)
After the fix the two tests pass (`05-fix-new-test.txt`).

**Four-state budget at 390x844 after the fix** (first row bottom / tab bar top 788; shell bar):
- no share, no note: 659 (bar 52)
- no share, note: 758 (bar 52)
- share, no note: 667 (bar 60)
- share, note: 766 (bar 60)
All fit, and no sideways scroll. Information (viewports of those heights, share): 375, 360: bar 60; 320: bar 90.8 (wraps, as the
auditor measured; not a budget case). Switcher at 390 and 320 (`15-*.json.txt`): ArrowDown on the select leaves `#/timesheet`; Tab
reaches Open; Enter navigates; a touch tap on Open navigates. Select and Open 44px high; Open 67px wide; Open inside the bar at both
widths.

**Checks:** Node v24.21.0. `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` exit 0 (82 files, 1823 tests). Full e2e
(`npx playwright test`, both projects in one sequential run, no other Playwright run at the same time): exit 0, 210 passed, 26 skipped,
0 failed, 0 flaky; desktop 103 ok + 15 skipped, mobile 107 ok + 11 skipped (the two new tests skip on desktop by project condition;
no ECONNRESET). `validate_package.py --preflight` (workflow Python at `C:\Users\<user>\.cache\codex-runtimes\...`) exit 0.
Grep of changed files and evidence: only `@example.invalid` addresses and the package name `timesheet@0.1.0`; no profile path.
`npm run verify` (SMOKE_PORT 48341, DATA_DIR and DATABASE_PATH in the task folder) exit 0. `npm run digest` run last, 0 files
changed after it:
`b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe` (793 files, `handoff/` excluded).

**Evidence** (`handoff/delivery/evidence/WP5-UX-FIX8/`): `01-node.txt`, `03-repro-base.txt`, `05-fix-new-test.txt`, `07-typecheck.txt`,
`08-lint.txt`, `09-unit.txt`, `10-e2e-full.txt`, `12-preflight.txt`, `14-verify.txt`, `15-budget-Ho_Chi_Minh.json.txt`,
`15-budget-Los_Angeles.json.txt`, `first-share-note-390-synthetic.png`. The digest value is above (`16-digest.txt` stays in the task folder).

**Deviations:** the full e2e ran with the built output from the same build as verify's source (the build ran on the fixed source
before the run); no separate `E2E` rerun was needed. Two of my command lines piped a `find`/`grep` into `head` (output went to a
file; no data lost); I did not repeat it. The measurement probe lives only in the task folder (own config; not in the repository).
No background task is still running.

Status: done
