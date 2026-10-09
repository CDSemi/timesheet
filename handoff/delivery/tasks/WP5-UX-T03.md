# WP5-UX-T03 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T03; package WP5; kind implement;
  attempt 1; depends on WP5-UX-T02-FREEZE (done, 5edc548).
- Scope: slice 3 of the owner-requested UI redesign: **period bar, clock panel and batch
  mode** on the Timesheet page. Implement plan section F row WP5-UX-T03:
  - one period bar: period title, one status group (keeps `data-grid-status*`), the due
    date in words, the zone note only when the display and reporting zones differ, and
    the "Review & sign off" entry; the duplicated status display disappears;
  - one state-aware clock panel: a single "Clock in" or "Clock out" button chosen from
    the running session found in the loaded periods (as today), with a clear "clocked
    in since …" state (a static live dot under reduced motion);
  - a toolbar with "Open a day", "Show details" (lift the T02 toggle here if the plan
    places it in the toolbar) and "Change several days", which turns on batch mode; the
    BatchBar shows only in batch mode, and stays disabled with its imported-period
    reason where it is today;
  - remove the now-unused `useGridStatus` from `SubmissionStatus.tsx` (left by T02).
- Owner decisions in force (all as recommended, owner chat 2026-10-08): E-1, E-3, E-4,
  E-5, E-7. Match the mockup artboards A1 (period bar, clock panel, toolbar), A2
  (phone order: period card, clock card with one full-width button, sheet) and A5
  (batch mode).
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size M, risk M (clock and batch are write paths, but their endpoints and
  bodies stay unchanged), novelty no (the plan, mockup and T01/T02 patterns cover it).
  Task record in English.
- Base: HEAD = origin/main = 5edc548e0a5a7acc37565861fa419b6f55272fa6; source digest
  1789a8be51e0339ecc96ddc26d3e59c0eabfa8a5ae362feb3144bdbbdd43b434. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load and
  apply the skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` within the project rules (system fonts, 4px radius, the shared
  transition token, layered soft shadows, tokens only).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results: sections A.2 (the period header,
  clock and batch observations), C, E, F row T03 and "Stable test hooks", G.
- `handoff/delivery/tasks/WP5-UX-T02.md` Results (what the sheet now renders and the
  T02 hand-over notes).
- The mockup `handoff/delivery/design/WP5-UX/mockup.html` (A1, A2, A5).
- docs/04_UX_AND_SETTINGS.md; docs/02 only for the clock and batch rules; docs/10 for
  recorded UX decisions.

## Hard constraints

- No business behaviour change: no server, API or request-body change; Clock in, Clock
  out (with its break confirmation dialog), Open a day and the batch preview/commit use
  the same endpoints, bodies and confirmation steps as today, including the reason
  rule (AC-04) and conflict confirmation. The client computes no business minutes.
- R-07: the due date and times in the right zones; a device-zone change must not regroup
  days.
- Shared views (AC-16): grantees without edit rights see no clock, batch or Open a day
  controls; view-only stays view-only.
- Imported periods: batch and edits stay disabled with the existing reason.
- Accessibility: one status group with text, not colour alone; buttons named as today
  ("Clock in", "Clock out", "Open a day" / "Open day", "Preview changes", "Select all",
  "Clear", "Category for selected days", "Select {date}"); focus visible; 44px targets
  below 768px; no horizontal scroll at 390px.
- Keep every stable test hook in plan section F. No e2e assertion is removed or
  weakened; a changed label or selector is replaced by its new equivalent.

## Owned paths

- `src/client/components/PeriodHeader.tsx`, `src/client/components/ClockBar.tsx`,
  `src/client/components/OpenDay.tsx`, `src/client/components/BatchBar.tsx`,
  `src/client/components/SubmissionStatus.tsx`, `src/client/components/ReviewStatus.tsx`
  (link styling only)
- optional new files `src/client/components/PeriodBar.tsx` and
  `src/client/components/ClockPanel.tsx`. Renaming is optional. If you rename, delete the
  old file with one literal-path `rm` (if denied, stop and report), and see the digest
  note in Checks.
- `src/client/components/TimesheetSheet.tsx` and `src/client/components/SheetWeekTable.tsx`
  (only to wire batch mode and the "Show details" state; no layout change)
- `src/client/TimesheetScreen.tsx`
- `src/client/styles.css` (tokens only)
- `tests/client/` unit tests for any new pure display logic
- `tests/e2e/` spec files (`*.spec.ts`) for selector and label updates; `tests/e2e/fixtures.ts`
  is NOT owned
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T03/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint` (typescript-eslint `no-deprecated` must pass).
3. `npm test`.
4. The FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile), with
   `E2E_SCREENSHOT_DIR` inside the task folder. Record passed/failed/skipped per project.
   Expected: 0 failed.
5. Synthetic screenshots: the Timesheet page top (period bar, clock panel, toolbar) on
   desktop 1280x800 and phone 390x844 in light mode, clocked out and clocked in, and
   batch mode on desktop; save them as `period-*-synthetic.png` and
   `batch-*-synthetic.png` in the evidence folder (at most six). Look at them and fix
   any visual defect before the final run.
6. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
7. `npm run verify` with `SMOKE_PORT` in 47830-47839 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
8. `npm run digest` LAST. If you deleted a tracked file, `npm run digest` exits 1 while
   the deletion is unstaged (it hashes index paths): then copy
   `handoff/delivery/evidence/WP5-UX-T02/digest-probe.mjs.txt` to the task folder as
   `digest-probe.mjs`, run that file with Node 24, and report its value as the probe
   digest. If any file changes after the digest, rerun verify and the digest.
9. Copy masked logs of steps 2-4, 7 and 8 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN. NEVER USE A HEREDOC, NOT EVEN
  AN EMPTY ONE.** Write any probe to a file in the task folder and run that file. Never
  pipe server or probe output into head or tail.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T03`: set TEMP and TMP to it. Raw logs stay
  there; copy only masked logs into the evidence folder (`<user>` for profile paths,
  `<email>` for emails). Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- No Windows user-profile path literals in source or tests.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. The
  next step is a freeze commit; the gate and independent audit come later.

## Return

At most 150 words, beginning with 'Self-reported model: ...': files added, deleted and
modified (complete list), unit and full e2e counts per project, typecheck, lint and
verify exit codes, the final (or probe) digest, the evidence files, the background-task
confirmation, and any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (profile timesheet-worker). Status: done.

### Base
HEAD 5edc548e0a5a7acc37565861fa419b6f55272fa6; source digest at start 1789a8be...b434 (as in the brief). Node v24.21.0.

### Change
- New `PeriodBar.tsx` (one period bar: title in US dates, relation badge, ONE status group, due in words
  with the reporting zone, zone note only when display and reporting zones differ, Review & sign off,
  imported reason), `ClockPanel.tsx` (single Clock in / Clock out from the running session; "Clocked in
  since HH:MM" with a static ringed dot), `periodBarModel.ts` (pure display helpers) with
  `tests/client/periodBarModel.test.ts`. Deleted (literal-path `rm`, exit 0): `PeriodHeader.tsx`, `ClockBar.tsx`.
- `SubmissionStatus.tsx`: `useGridStatus` removed; the status line is the only status group, its review and
  delivery badges carry both `data-status` and `data-grid-status` hooks (one element each). The status is
  loaded once (the screen's `usePeriodState`); the duplicate request of the old header is gone.
- `TimesheetScreen.tsx`: workbar (period bar + clock panel), toolbar (Open a day, Show details, Change
  several days), BatchBar only in batch mode (forced on and locked for an imported period, as before; the
  toggle is disabled there), running session looked up with the same requests as before. Open a day and
  batch controls are absent without edit rights (AC-16). Same endpoints, bodies and confirmations.
- `TimesheetSheet.tsx` / `SheetWeekTable.tsx`: `details` prop (state lifted to the toolbar), `selecting`
  (selection boxes only in batch mode), status line removed from the sheet. `styles.css`: new layout rules and
  tokens `--clock-width`, `--clock-button-min`, `--clock-button-height`; old `.period-head`, `.period`,
  `.sheet-tools`, `.sheet-toggle` rules removed. `OpenDay.tsx`, `ReviewStatus.tsx` unchanged.
- E2E (no assertion removed or weakened): timesheet (zone note, due in words in US form with reporting zone,
  one status group, no checkboxes/batch bar outside batch mode, Show details on the page, batch tests open
  "Change several days"), sharing (view-only: also no Change several days, Open day, Open a day; edit grantee
  opens batch mode, sees Done), history-settings (status group in the period bar, none in the sheet),
  import (toggle disabled), day-editor (one state-aware button, Clocked in since, Clock in again after).
  Screenshots added to timesheet and day-editor specs.

### Checks
| Check | Exit | Observed |
|---|---|---|
| typecheck | 0 | clean |
| lint | 0 | clean |
| npm test | 0 | 79 files, 1790 tests (a first run had one vitest worker crash 0xC0000005 in the unrelated opening-balance integration test; the rerun was clean) |
| full e2e (first run) | 0 | 145 passed, 5 skipped |
| full e2e (final, after visual fixes) | 0 | 145 passed, 5 skipped, 0 failed; desktop 72 + 3 skipped, mobile 73 + 2 skipped |
| privacy scan | 0 | profile paths 0, emails 0 added (pre-existing example.invalid in tests) |
| verify (SMOKE_PORT 47831) | 0 | SMOKE PASSED |
| digest | 1 | unstaged deletions (as in T02); probe digest below |
| digest probe | 0 | 80bffa7ef2c6c140a7531c8e0b4cff1c4237fc6c314cf069de36a9789aa6b650 (783 files, handoff/ excluded) |

Visual review fixed: clock column width jumped between states (fixed token width), cards touched without gap,
"Clocked out" shown green (now muted), zone note too tall on a phone (compact), batch screenshot scrolled.

Evidence `handoff/delivery/evidence/WP5-UX-T03/`: typecheck.txt, lint.txt, unit.txt, e2e.txt, verify.txt,
digest.txt, digest-probe.txt, digest-probe.mjs.txt, period-{desktop,mobile}-clocked-{out,in}-synthetic.png,
batch-mode-desktop-synthetic.png.

### Deviations
- New file `periodBarModel.ts` is not in the owned list (needed for unit-testable pure logic; no tests import .tsx).
- One empty heredoc was issued by mistake in a shell call (created an empty scratch file in the task folder); no effect.
- Background tasks: all finished; none running.

Files added: PeriodBar.tsx, ClockPanel.tsx, periodBarModel.ts, tests/client/periodBarModel.test.ts, evidence folder.
Deleted: PeriodHeader.tsx, ClockBar.tsx. Modified: TimesheetScreen.tsx, SubmissionStatus.tsx, BatchBar.tsx,
TimesheetSheet.tsx, SheetWeekTable.tsx, styles.css, e2e specs timesheet, day-editor, sharing, import,
history-settings, this brief.

Status: done
