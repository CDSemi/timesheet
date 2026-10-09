# WP5-UX-FIX1 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX1; package WP5; kind fix;
  attempt 1; depends on WP5-UX-T06-FREEZE (done, abe6802).
- Finding (from WP5-UX-T06 Results): the canonical rule docs/04 line 16 (EN, with its
  VI pair) says "Display current viewing zone and saved accounting date". The period bar
  shipped in WP5-UX-T03 shows the display (viewing) zone only when it differs from the
  reporting zone. That condition came from the plan's design direction, not from an
  owner answer. Coordinator decision (board `coordinator_decisions`, 2026-10-08): keep
  the rule and fix the UI.
- Required fix:
  1. The Timesheet period bar ALWAYS names the current viewing zone, compactly (for
     example "Times in America/Los_Angeles"; follow the existing wording style and the
     zone source the app already uses for display). When the viewing zone differs from
     the reporting zone, keep the existing extra note that names the reporting zone.
  2. Check that each day still shows its saved accounting date (the sheet date cells)
     and that nothing in the shell or sheet regroups days by device zone (R-07). If the
     accounting date is already shown, change nothing for it; state where in Results.
  3. Align the docs/04 "Period bar, clock and batch mode" section (EN and VI) with the
     fixed behaviour; leave line 16 as it is.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size S, risk M (zone display under R-07; display only), novelty no. Task
  record in English.
- Base: HEAD = origin/main = abe68025af4b0fdbc0d73731d9eda04c729e4c18; source digest
  46a3a0c6436eb0cc2d4eb243cbff5956b0886455780444944a3cfce79a3b7abb. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first (rules 7 and 8).
- docs/04_UX_AND_SETTINGS.md lines 10-60 and its VI pair; docs/02 R-07.
- `handoff/delivery/tasks/WP5-UX-T03.md` and `WP5-UX-T06.md` Results.
- `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`,
  `tests/client/periodBarModel.test.ts`, and the e2e specs that assert the zone facts.

## Hard constraints

- Display only: no server, API, request-body or calculation change; no change to how
  days are grouped or which zone times are shown in.
- Do not change the canonical rule text at docs/04 line 16.
- No e2e assertion is removed or weakened; add assertions that the viewing zone is named
  when it equals the reporting zone and when it differs.
- Accessibility and layout: the zone text fits the period bar at 390px without
  horizontal scroll; status never by colour alone.

## Owned paths

- `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`
- `src/client/styles.css` (tokens only, only if needed)
- `tests/client/periodBarModel.test.ts`
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` (the period bar section
  only)
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX1/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint`.
3. `npm test`.
4. The FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile), with
   `E2E_SCREENSHOT_DIR` inside the task folder. Record passed/failed/skipped per project.
   Expected: 0 failed.
5. Two synthetic screenshots of the period bar (desktop and phone, light mode), saved as
   `zone-desktop-synthetic.png` and `zone-mobile-synthetic.png` in the evidence folder.
6. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
8. `npm run verify` with `SMOKE_PORT` in 47870-47879 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy masked logs of steps 2-4, 6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.**
  Use the Write and Edit tools for files. **NEVER PIPE OUTPUT INTO `head` OR `tail`**:
  redirect to a file in the task folder and read it with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX1`: set TEMP and TMP to it. Raw logs
  stay there; copy only masked logs into the evidence folder.
- No Windows user-profile path literals in source or tests.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push. The next step is a freeze commit, then the gate and the independent audit.

## Return

At most 130 words, beginning with 'Self-reported model: ...': files changed, what the
period bar now shows in both zone cases, where the accounting date is shown, unit and
full e2e counts per project, preflight and verify exit codes, the final digest, the
evidence files, the background-task confirmation, and any stop or deviation.

## Results

Base: HEAD abe68025af4b0fdbc0d73731d9eda04c729e4c18; start digest 46a3a0c6...7abb (brief).

Changed: `src/client/components/PeriodBar.tsx` (always renders
`<span data-period-zone>` in the period-meta line), `periodBarModel.ts` (new
`viewingZoneText`), `tests/client/periodBarModel.test.ts`, `tests/e2e/timesheet.spec.ts`
(new equal-zone test; zone-name and screenshot assertions in the differing-zone test; none
removed), `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (period bar section only; line 16
untouched). No server, API, calculation or CSS change.

Behaviour: the bar always shows "Times in <display zone>" (data-period-zone). Zone equal:
that line only, no zone note. Zone differs: the line plus the existing note naming reporting
zone, display zone and due time. Accounting date: already shown, unchanged, in the sheet
date cells (`[data-day]` named by ISO date, MM/DD cell text) and the period dates; nothing
regroups by device zone (R-07). Mobile 390px: line wraps inside the period-meta flex; the new
test checks no horizontal overflow and the shell mobile overflow test passes.

Checks: node v24.21.0; typecheck 0; lint 0; npm test 82 files / 1817 tests passed; full e2e
0 failed, desktop 77 passed / 3 skipped, mobile 78 passed / 2 skipped (155 passed, 5
skipped; the skips are the project-specific tests); preflight (workflow Python, user
`<user>`) exit 0; user-path/email grep over evidence: 0; verify exit 0 (SMOKE_PORT 47871);
final digest 2565b1e82d4aa5f8d55f71feb45b7180b35e169ea3f4376a2a96db8271f63444 (789 files).
Evidence: handoff/delivery/evidence/WP5-UX-FIX1/ (typecheck, lint, test, e2e, preflight,
verify, digest .txt; zone-desktop-synthetic.png, zone-mobile-synthetic.png).
No background task running. No stop or deviation.

Status: done
