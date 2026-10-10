# WP5-UX-FIX7 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX7; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B5 (FIX REQUIRED); depends on
  WP5-UX-A11Y-SWEEP (done) and WP5-UX-REGATE4 (PASS).
- Scope: the owner chose one complete accessibility sweep, then ONE fix round
  (WP5-UX-Q2 option a). Fix all ten WCAG 2.2 AA issues WP5-UX-AX-01..AX-10 listed in
  `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` (Results: the issue table and "One fix task
  for all ten"; AX-01..AX-03 are B5-01..B5-03 of `handoff/delivery/WP5_UX_REVIEW_B5.md`).
  Use the sweep's bounded fixes unless you find a better fix that meets the same SC;
  explain any deviation in Results.
- Coordinator decision (board `coordinator_decisions`, 2026-10-09) for AX-05: the day
  button's accessible name must contain its visible text and keep the ISO date (for
  example "Edit 09/28 (2026-09-28)", phone "Edit Mon 09/28 (2026-09-28)", "View …" when
  view-only), the sharing row button "End share with {name}"; update docs/04 line 48 (EN
  and VI) to the new name in this task; move the e2e selectors to one helper; select days
  in code by `data-day`, never by the accessible name.
- Profile/routing: timesheet-worker-high (effort high), requested model **opus**,
  `model_override_reason` **escalation** (area-B fix rounds keep recurring; this is the
  one planned closing round; docs/08 escalation rule). Routing: size L, risk M (focus
  management and the sharing switcher), novelty no. Task record in English.
- Base: HEAD = origin/main (record it; the sweep observed 5b349f8, a handoff-only commit
  after d3935e7) with source digest
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (frozen at 5e104e1).
  Record both before you start. Uncommitted coordinator files under `handoff/` are
  expected; never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only).
- `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` Results (all of it) and its evidence
  index `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/00-README.txt`.
- `handoff/delivery/WP5_UX_REVIEW_B5.md` (B5-01..B5-03) and `WP5_UX_REVIEW_A5.md`.
- docs/04 (EN and VI) lines 40-80.

## Hard constraints

- No server, API, request-body, domain or calculation change. Every write keeps its
  endpoint, body, `expected_version`, reason prompt and confirmation step.
- AX-06 (sharing switcher): the select becomes a choice only and an explicit "Open"
  control navigates; the shared-view routes, the share bar and owner-only control
  hiding (AC-16) stay as they are.
- AX-08 focus returns and step headings must not change any dialog's outcome.
- Keep every behaviour earlier audits verified: modal editor below 1200px and side
  panel from 1200px, Escape order with nested dialogs, focus return, the 390x844
  first-screen budget (B-01), the "Open a day" widths (B2-01, R-7), the focus ring
  >= 3:1 (B4-01), the zone-note format (B4-02), FIX2 leave validation, FIX1 zone text.
- No e2e assertion removed or weakened; every new check must fail on 5e104e1 (show it in
  a scratch copy or by reverting the relevant hunk in the task folder copy).
- Tokens only for colours, rings, radius, shadows and durations.

## Owned paths

- `src/client/` (only files the ten fixes need; list each changed file in Results)
- `tests/e2e/` spec files (`*.spec.ts`) and one new helper module for day-button
  selectors if needed (under `tests/e2e/`, not `fixtures.ts`); `tests/e2e/fixtures.ts`
  is NOT owned
- `tests/client/` unit tests
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX7/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change (server, domain, `api.ts`, `fixtures.ts`), stop and report.

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Reproduce at the base: the new checks for AX-01..AX-10 fail on 5e104e1; record them.
3. Fix; `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects (with `E2E_SCREENSHOT_DIR` inside the task
   folder). Record counts.
5. Self-check with the sweep's probe method (its scripts are in the sweep evidence as
   `*.ts.txt` / `*.mjs.txt`; copy them into the task folder): rerun the Shift+Tab
   occlusion walk and the ring measurement on Timesheet, Settings, the shared view and
   the editor at 1280, 768, 390 and 320, light and dark; record 0 hidden stops and 0
   stops without a ring.
6. Synthetic screenshots (at most eight) named `fix7-*-synthetic.png`.
7. EN/VI parity of the docs/04 change; `validate_package.py --preflight` by its script
   path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
8. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
9. `npm run verify` with `SMOKE_PORT` in 48260-48269 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
10. `npm run digest` LAST (if you delete a tracked file, use the probe in
    `handoff/delivery/evidence/WP5-UX-T02/digest-probe.mjs.txt` copied to the task folder
    as `.mjs`). If any file changes after the digest, rerun verify and the digest.
11. Copy masked logs of steps 2-5, 7, 9 and 10 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
  Read tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX7`: set TEMP and TMP to it; ports
  48260-48279 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- Give Playwright actions a short timeout in probes (a sweep run once hung 30 minutes).
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step and finish with
  "Status: done". Do not commit or push; do not install or change dependencies.

## Return

At most 180 words, beginning with 'Self-reported model: ...': the fix per AX item (one
line each), the reproductions, the self-check result (hidden stops, stops without a
ring), files changed, unit and full e2e counts per project, preflight and verify exit
codes, the final full 64-hex digest, the evidence files, the background-task
confirmation, and any stop or deviation.

## Results

### Result of WP5-UX-FIX7 attempt 1 (implementer, fix)

- Self-reported model: claude-opus-5-5. Worker only: no agent spawned, no commit, no push.
- Base recorded before any edit: HEAD = origin/main = `5b349f8f72c051f5bee3f4fe80855c941e6d9f12`; source digest
  `07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635` (790 files, `handoff/` excluded) = the digest
  frozen at 5e104e1 (`evidence/WP5-UX-FIX7/01-digest-before.txt`). Node v24.21.0 (portable, first on PATH).
- Reproduction at 5e104e1 (step 2): scratch copy `<task>/base` = `git archive 5e104e1` + the working repository's
  `node_modules` (no install), `npm run build` exit 0 (same client bundle hash as the sweep), then the new checks copied in.
  Run 1 (`03-repro-base-run1.txt`, exit 1): 40 failed, 8 passed, 6 skipped. Run 2 (`03b-repro-base-run2.txt`, exit 1)
  re-ran AX-01/AX-03/AX-10
  after their editor opener and the AX-10 selector were made name-independent: 10 failed. Every new check fails for its
  defect: AX-01 hidden stops 11 (1280), 3 (768), 25 (390), 31 (320) under `header.shell-bar`, `section.share-bar`,
  `header.editor-head`; AX-02 list ring 1.21:1 / 1.15:1, no option ring; AX-03 dialog without inset ring (both
  themes, both projects); AX-04 focused-pressed shadow equal to pressed-only; AX-05 no `[data-day-button]` with the new
  name, "End sharing with"; AX-06 ArrowDown moved to `#/shared/…`; AX-07 no `role=alert` after a wrong password;
  AX-08 focus not on "Preview changes" after Escape, not on "End share" after Escape, not on "Review and commit" / "Correct
  the opening balance"; AX-09 "Complete" 4.41:1; AX-10 day button 3.3px (390) and 22.9px (320) out of its cell.
- Step 3 (fixed tree): `npm run typecheck` exit 0, `npm run lint` exit 0, `npm test` exit 0 (82 files, 1823 tests)
  (`04-typecheck-lint-test.txt`; the first typecheck in that log failed on DOM names in the new spec, fixed by
  page-script strings as in day-editor.spec.ts). New checks on the fixed build: run 1 (`06-new-checks-fixed-run1.txt`)
  6 failed on test-side mistakes (a same-document hash change instead of a sign-out, a non-exact label) and on the
  sweep's `--ok` value (see AX-09); run 2 (`06b-new-checks-fixed-run2.txt`): 48 passed, 6 skipped (project-specific), exit 0;
  AX-01 hidden 0 at 1280/768/390/320; picker list ring 6.09/6.79, active option 5.35/5.29; dialog ring 6.09/6.79;
  AX-09 rendered 5.82 (light), lowest token pair 4.69.

#### Files changed (all inside the owned paths; no server, API, request-body, domain, fixtures.ts change)

- `src/client/`: `styles.css`, `App.tsx`, `DayEditor.tsx`, `SettingsScreen.tsx`, `TimesheetScreen.tsx`,
  `components/AdminUsers.tsx`, `AppShell.tsx`, `BatchDialog.tsx`, `ImportCommit.tsx`, `OpeningBalanceForm.tsx`,
  `OpeningBalancePanel.tsx`, `SharingBar.tsx`, `SharingGrantForm.tsx`, `SharingRows.tsx`, `SharingSwitcher.tsx`,
  `SheetWeekTable.tsx`, `TimesheetSheet.tsx`, `sheetModel.ts`, new `components/useBlockSize.ts`.
- `tests/e2e/`: new `keyboard-access.spec.ts`, new helper `dayButton.ts` (day-button selectors); `focus-ring.spec.ts`
  (AX-02/03/04, R-12, sheet-date selector), `day-editor.spec.ts`, `import.spec.ts` (+ AX-08 focus assertions),
  `sharing.spec.ts` (+ explicit Open), `timesheet.spec.ts` (selectors through the helper; every old name assertion
  became the new name, not dropped). `tests/client/sheetModel.test.ts` (+2 tests for `dayButtonName`).
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: line 48 only.

#### Self-check (step 5, the sweep's probe)

- Clean export `<task>/fixed` = `git archive HEAD` + the fixed `src/`, `tests/`, `docs/` (29 changed/new files compared
  equal with `cmp`), `node_modules` copied (no install), build exit 0; the sweep's `sweep.probe.ts` copied with three
  adaptations only (day button found by `data-day`, "End share with", the switcher found as the combobox; ports
  48260/48261) plus a `fix7-shots` test. Run `s1`: 1280, 768, 390 and 320, light and dark (8 matrix tests: Timesheet,
  editor, picker, label review, batch, batch review, Clock out, More, Review, Overtime, History, Settings, Import,
  shared view, Admin, setup, forward and backward walks) + shots: 9 passed, exit 0 (`07-selfcheck-run-s1.txt`).
- Result (`12-selfcheck-hidden-norings-s1.txt`, `11-selfcheck-summary-s1.txt`): **0 stops entirely hidden** in every
  walk (the sweep had 222 under the shell bar, 36 under the editor head, 4 under the share bar); **0 stops without a
  ring** except the probe's known measurement limit for date/time fields, now explained: those fields keep focus in an
  inner part, so the probe's `blur()` does not blur them and its focused and "blurred" images are equal; a task-folder
  diagnostic (`14-diag-date-field-focus.txt`) shows the field still focused after `blur()`, the ring painted at the left
  edge in an immediate screenshot, and the settled ring `0 0 0 1px #fff, 0 0 0 3px #1f5fbf` (the R-12 e2e check measures
  6.09:1 light / 6.79:1 dark). The editor dialog now shows its inset ring (3 of 4 sides measured, the top under its own
  head, 4.24-6.09:1). Label in name: no day button and no "End share" left (only the sweep's optional "<"/">" and the
  WFH "Note" items). Text contrast: 0 under the minimum. Reflow: 0. Switcher: ArrowDown keeps `#/timesheet` in 8/8
  combinations; batch review, label review and editor return focus 8/8; the wrong-password message is `role=alert`
  8/8; Escape on "End share" returns to "End share with Synthetic Sharer B" 8/8. The 320px shell bar stays 107px.
- Screenshots (8, `fix7-*-synthetic.png`): picker active option light/dark, pressed toggle with focus, Shift+Tab stop
  clear of the bar at 390, editor dialog ring at 390, switcher with Open at 320, batch rows at 320, sticky share bar
  under the shell bar at 768 (shell bar bottom 100px = share bar top 100px; html scroll-padding-top 249px).

#### Full e2e (step 4, both projects, Edge, `E2E_SCREENSHOT_DIR` in the task folder)

- Run 1 (`08-e2e-full-run1.txt`, exit 1): 203 passed, 3 failed, 22 skipped: two real regressions of mine (the phone
  day button 43.2px wide, `min-width: 0`; fixed) and one Playwright artifact-folder clash (ENOENT on a trace) caused by
  my base reproduction running in parallel with the same TEMP output folder (no app failure; later runs were alone).
- Run 2 (`08b-e2e-full-run2.txt`, exit 1): 206 passed, 2 failed (the new R-12 check, both themes: the first `:focus`
  rule did not apply; changed to `:focus-within`), 24 skipped.
- Run 3 on the final source (`08c-e2e-full-run3-final.txt`): **exit 0, 232 tests: 208 passed, 24 skipped, 0 failed**
  (5.5 min). Repeated with a JSON report (`08d-e2e-full-run4-json.txt`, `08d-e2e-counts.txt`): exit 0, 208 passed,
  24 skipped, 0 failed, 0 flaky; **desktop 103 passed + 13 skipped, mobile 105 passed + 11 skipped** (every skip is a
  project condition in the specs).

#### Preflight, parity, privacy (steps 7-8)

- docs/04 EN/VI parity (`60-docs-parity.txt`): both files change line 48 only (1/1 lines each); the quoted spans and
  examples are identical (diff exit 0); the 92/94 line counts are the same as at HEAD.
- `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe
  handoff/delivery/validate_package.py --preflight`: exit 0, PASS (103 translation pairs, 2149 local links, 91
  scenarios; `30-preflight.txt`).
- Privacy grep (`70-privacy-grep.txt`, 30 changed files + 24 evidence text files at that time): 0 user-profile paths,
  0 user-name hits; 13 e-mail matches, all synthetic `@example.invalid` (8 are `<email>`, the
  probe's 60-character cut of `payroll-synthetic@example.invalid`).

#### Verify and digest (steps 9-10, the last commands)

- `SMOKE_PORT=48262 DATA_DIR=<task>\data DATABASE_PATH=<task>\data\timesheet.db npm run verify`: **exit 0**
  (typecheck, lint, `npm test` 82 files / 1823 tests, build, smoke "SMOKE PASSED" on 127.0.0.1:48262; no deprecation
  line; `40-verify.txt`).
- `npm run digest` (last command): **`b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563`** (793 files,
  `handoff/` excluded; 790 + the 3 new files; `50-digest.txt`). After it only `handoff/` changed (this Results section and
  the evidence copies), which the digest excludes.
- Background tasks: all eight background runs of this task finished (each reported completion); none is running.

#### Remaining scope and one next action

- Nothing of the ten is open. Not done by design: area-B optional items other than R-12 (R-10 hover over focus, the
  "<"/">" names, the WFH "Note" name, phone batch crowding beyond AX-10). The probe's blur-based ring measurement
  still cannot isolate date/time fields (explained above; not a defect).
- Next action (coordinator): freeze this change through timesheet-committer, gate it on the new digest, then dispatch a
  fresh area-B recheck (and area A if the coordinator wants the AX-08 focus returns and the switcher re-proved there).

#### Commit description (proposal for timesheet-committer; nothing committed here)

`Fix WP5-UX-AX-01..AX-10: focus not obscured, picker/dialog/toggle rings, day-button names, switcher Open, status
roles, focus returns, --ok contrast, phone batch reflow` — client-only: measured sticky-bar sizes drive scroll padding;
inset/outer focus rings for the label picker, scrolling dialogs, pressed toggles and date fields; day buttons named
"Edit MM/DD (date)"; "Shared with me" navigates only on Open; alert/status roles; focus returns after cancelled steps;
light --ok #136a42; t-day-head wraps. New keyboard-access.spec.ts and dayButton.ts helper; docs/04 line 48 EN/VI.

#### Runtime notes and slips

- Git Bash only; no stdin-fed script; every script was a file run by path (`mask.mjs`, `hidden.mjs`, `summarize.mjs`,
  `counts.mjs`, the probe). Files were created only in the task folder, the evidence folder and owned paths. Ports: the
  probe's servers 48260/48261, smoke 48262; the e2e fixtures and my task-folder diagnostics chose their own free
  loopback ports (as the suite always does). No process was killed; no recursive removal (two single `rm` of my own
  diagnostic spec in the task-folder export). No install, no dependency change, no commit or push.
- Slip: one read-only `grep -rn "incorrect" src/server | head -5` (a pipe into `head`, against the brief; nothing
  written, no result depended on it). Slip: my base R-12 reproduction ran while full e2e run 1 was running, with the
  same TEMP output folder, which deleted one trace of run 1 (the ENOENT failure above); later runs never overlapped
  except the probe and the diagnostics, which used separate output folders.

#### Fix per item

- AX-01 (2.4.11): new hook `components/useBlockSize.ts` (ResizeObserver, CSSOM `setProperty`, removed on unmount) writes
  the measured heights to `--shell-bar-size` (AppShell header, on `<html>`), `--share-bar-size` (SharingBar, on `<html>`)
  and `--editor-head-size` (DayEditor head, on the dialog). CSS: `html { scroll-padding-top: shell bar + clearance }`,
  from 768px `+ share bar`; `.share-bar { top: var(--shell-bar-size) }` (it no longer slides under the shell bar);
  `.day-panel { scroll-padding-top: editor head + clearance }`; the >=1200px side panel's sticky top/max-height use the
  measured sizes (same 68px at 1280 without a share). Defaults are tokens (`--bar-height(-compact)`, `--size-none`).
- AX-02 (1.4.11/2.4.7): `.label-list:focus-visible { box-shadow: var(--focus-ring), var(--shadow-overlay) }`,
  `.label-option.active { box-shadow: var(--focus-ring-inset) }`; the chosen option keeps colour and weight.
- AX-03 (2.4.7): `.dialog:focus-visible` and `.day-panel:focus-visible` (and the >=1200px panel) get
  `var(--focus-ring-inset)` plus their own shadow.
- AX-04 (2.4.7): `.tools button[aria-pressed='true']:focus-visible { box-shadow: var(--focus-ring), <pressed edge> }`.
- AX-05 (2.5.3): `dayButtonName()` in `sheetModel.ts` (unit-tested): "Edit 09/28 (2026-09-28)" on the sheet, "Edit Mon
  09/28 (2026-09-28)" on a phone, "View …" read-only; both buttons carry `data-day-button`; `focusDay()` selects
  `[data-day="…"] [data-day-button]`; "End share with {name}". Specs select days through `tests/e2e/dayButton.ts`.
  docs/04 line 48 EN+VI updated (AGENTS rule 8: the documented name "Edit {date}" contradicted SC 2.5.3).
- AX-06 (3.2.2): `SharingSwitcher` is a small form named "Shared with me": the select only holds the choice (state,
  reset per screen by key) and a submit button "Open" navigates (`#/timesheet` or `sharedHash(owner, null)`); routes,
  share bar and owner-only hiding unchanged. The select narrows (`--switcher-select-min`) so 320px keeps one row.
- AX-07 (4.1.3): `role="alert"` on the sign-in error (`App.tsx`) and the Timesheet error (`TimesheetScreen.tsx`);
  `role="status"` on the problem notices (`SharingGrantForm`, `SharingRows`, `AdminUsers`, `SettingsScreen`).
- AX-08 (2.4.3): Timesheet remembers the batch review's opener before busy disables it and returns focus on Cancel/
  Escape; `BatchDialog` moves focus to the new step heading after a step change (headings get `tabIndex=-1` only after
  the first change, so focus on open is unchanged; `.dialog [tabindex='-1']:focus-visible` has no ring, as the editor
  heading); `SharingRows`: the change step is a focused group, Cancel/Escape return to Change / End share / Leave;
  `ImportCommit` (owner of the ImportScreen.tsx:252 cancel) returns to "Review and commit"; `OpeningBalancePanel`
  Cancel returns to "Correct the opening balance"; `OpeningBalanceForm` "Back to edit"/Escape returns to "Review
  before posting". No endpoint, body, version, reason prompt or confirmation changed.
- AX-09 (1.4.3): light `--ok: #136a42` instead of the sweep's `#167045`: deviation, because `#167045` measured 4.32:1
  under the selection tint over `--sheet-head-off` in the new token check; `#136a42` is >= 4.69:1 on every light
  surface token with and without the selection tint (rendered "Complete" on a selected row 5.82:1). Dark unchanged.
- AX-10 (1.4.10): `.t-day-head { flex-wrap: wrap }` (the selection box sits above the day button when the cell is
  narrow) and `max-width: 100%` on the day button; the 44px targets are kept (a first try also set `min-width: 0`,
  which made the phone day button 43.2px wide; the full e2e run 1 caught it in `shell.spec.ts:86` and
  `timesheet.spec.ts:189`, and it was removed).
- Extra, outside the ten (needed for the self-check's "0 stops without a ring"): B5 risk R-12. Shift+Tab into a date
  field focuses the browser's picker button inside it; the field (`document.activeElement`) then matches neither
  `:focus` nor `:focus-visible`, only `:focus-within` (task-folder diagnostic, `14-diag-date-field-focus.txt`), and
  showed no author ring. `input[type='date']:focus-within, input[type='time']:focus-within { box-shadow:
  var(--focus-ring) }` (a first `:focus` version did not apply; full e2e run 2 caught it); a click or Tab already
  matched `:focus-visible`. New desktop check in `focus-ring.spec.ts` ("R-12 …"); on 5e104e1 it fails ("date field
  paints a focus ring (none)", `03c-repro-base-r12.txt`); on the phone layout the field itself takes focus and already
  showed the ring, so that check is desktop-only.

Evidence: `handoff/delivery/evidence/WP5-UX-FIX7/` (index `00-README.txt`; 35 masked LF `.txt` files and 8
`fix7-*-synthetic.png`).

Status: done
