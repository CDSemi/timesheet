# WP5-UX-FIX3 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX3; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B (FIX REQUIRED); depends on
  WP5-UX-FIX2-FREEZE (done, aebc06f).
- Findings (full rows, reproductions and evidence in `handoff/delivery/WP5_UX_REVIEW_B.md`
  section "Findings" and `handoff/delivery/evidence/WP5-UX-AUDIT-B/`, especially
  `33-P3-phone-targets-overflow-position.txt`, `36-P6-panel-768-1199.txt`,
  `32-P2-editor-focus-desktop.txt`, `runtime-probe.mjs.txt` and the
  `*-first-screen-synthetic.png` / `editor-w1024-synthetic.png` screenshots):
  - **WP5-UX-B-01 (Medium):** on a 390x844 phone the first `[data-day]` row starts at
    836.6px, below the bottom tab bar (788px). The approved direction (plan section C,
    mockup A2) promises the first day row within the first screen. Compact the phone
    layout (for example: hide the page heading block below 768px; put `<` `>` and the
    badges in the period title row and "Review & sign off" in the signature card as in
    A2; fold the tools into one compact row or move them below the sheet; a one-line
    form header as in A2) so that at least the first day row is fully visible above the
    tab bar at 390x844. Add a mobile e2e assertion that the first `[data-day]` bottom is
    at or above the tab bar top.
  - **WP5-UX-B-02 (Medium):** below 1200px the fixed side panel (`styles.css` around
    1768-1794, `DayEditor.tsx` `show()` non-modal around 79-89, Escape only inside the
    dialog around 184-189) covers 12 focusable sheet controls at 768 and 1024px (WCAG 2.2
    SC 2.4.11), the toolbar's right side and the clock panel; Escape pressed on the sheet
    does not close it. Below 1200px either give the panel its own column so it never
    overlays the sheet, or open it modal there (inert page, focus trap) like the phone
    sheet; keep the focus return to the day's button; make Escape close the panel
    wherever focus is while it is open (unless a nested dialog handles Escape first).
    Add an e2e check at 1024px that no focused sheet control is entirely under the open
    panel, and one that Escape from the sheet closes the panel. Align docs/04 line 59
    (EN and VI).
  - **WP5-UX-B-03 (Low, weakened assertion):** `tests/e2e/import.spec.ts:382-396` on the
    desktop project now checks the absence of "Import a workbook" and "Opening OT
    balance" on the Settings page instead of the Admin page. Assert both absence checks
    on `#/admin` in both projects (before navigating to Settings, or navigate back), and
    keep the "Import from Excel" link check.
  - **WP5-UX-B-04 (Low, docs):** docs/04 line 55 (EN and VI) says "the label picker"
    appears only after "Change several days"; replace with the category choice
    ("Category for selected days"); line 41 (EN and VI) must add "Missing record" to the
    Check words.
- Owner decisions in force: E-1, E-3 (a), E-5, E-7 as recommended (owner chat
  2026-10-08). Match the mockup A2 for the phone order (period card, clock card, sheet).
- Profile/routing: timesheet-worker-high (effort high), requested model sonnet, no
  override. Routing: size M, risk M (layout and focus management on the edit surface),
  novelty no (the phone bottom sheet already implements a modal pattern). Task record
  in English.
- Base: HEAD = origin/main = aebc06f85a945b988f0254e2406e30eb4ef244e5; source digest
  574bbc022ba2a8391e914e351979c60909d76ff6099d249ce23730f2a2c525d8. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Apply the
  skills `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design`
  within the project rules (tokens only, 4px radius, shared transition, system fonts).
- `handoff/delivery/WP5_UX_REVIEW_B.md` (findings and risks), its evidence named above.
- `handoff/delivery/tasks/WP5-UX-PLAN.md` section C (mobile-first behaviour,
  accessibility) and the mockup `handoff/delivery/design/WP5-UX/mockup.html` (A1, A2, A3).
- The Results of WP5-UX-T03, T04 and FIX2 (do not undo the FIX2 leave validation).

## Hard constraints

- Display, layout and focus only: no server, API, request-body or calculation change;
  every control keeps its accessible name (stable test hooks in plan section F); the
  shared view keeps owner-only controls absent (AC-16); R-07 zone text stays (FIX1).
- No e2e assertion is removed or weakened; B-03 restores strength.
- 44px targets on the phone; no horizontal scroll at 390px; status never by colour
  alone; reduced-motion rules kept.

## Owned paths

- `src/client/TimesheetScreen.tsx`, `src/client/DayEditor.tsx`
- `src/client/components/PeriodBar.tsx`, `src/client/components/ClockPanel.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`
- `src/client/styles.css` (tokens only)
- `tests/client/` unit tests (only if a pure helper changes)
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX3/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. Reproduce B-01 and B-02 at the base with the new e2e assertions failing; record the
   failing runs.
3. Fix; `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects (with `E2E_SCREENSHOT_DIR` inside the task
   folder). Record counts. Expected: 0 failed, and the new assertions pass.
5. Synthetic screenshots: phone 390x844 first screen (light), desktop at 1024x800 with
   the panel open, desktop 1280x800 with the panel open; save as `fix3-*-synthetic.png`
   (at most four).
6. EN/VI parity of the docs/04 changes; `validate_package.py --preflight` by its script
   path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
8. `npm run verify` with `SMOKE_PORT` in 47960-47969 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
9. `npm run digest` LAST. If you deleted a tracked file, use the probe in
   `handoff/delivery/evidence/WP5-UX-T02/digest-probe.mjs.txt` (copied to the task folder
   as `.mjs`) and report its value. If any file changes after the digest, rerun verify
   and the digest.
10. Copy masked logs of steps 2-4, 6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.
  NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO `/dev/null` OR `nul`.**
  Redirect to a file in the task folder and read it with the Read tool. Use the Write
  and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX3`: set TEMP and TMP to it. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push.

## Return

At most 160 words, beginning with 'Self-reported model: ...': the reproductions, the fix
per finding (and the B-02 approach chosen), files added, deleted and modified, unit and
full e2e counts per project, preflight and verify exit codes, the final (or probe)
digest, the evidence files, the background-task confirmation, and any stop or deviation.

## Addendum 1 (coordinator, 2026-10-09): residual focus order

Your hand-back reported a residual: on the phone, the "Review & sign off" link comes
before `>` in tab order but after it visually. Fix it in the same task before the
freeze: the keyboard order must follow the visual reading order on every layout (DOM
order or a layout that matches it; no positive `tabindex`). Add an e2e assertion on the
phone project for the period-card tab order. Then rerun typecheck, lint, `npm test`, the
FULL e2e suite on both projects, preflight, `npm run verify` and `npm run digest` LAST,
and update the evidence and Results (keep the first results as history). Same runtime
rules; in particular run `node --version` only after Node 24 is first on PATH, and no
heredocs, no stdin-fed scripts, no head/tail pipes, no /dev/null redirects.

## Results

Worker: claude-sonnet-5-5 (timesheet-worker-high), attempt 1. Base: HEAD aebc06f85a94 = origin/main, brief digest
574bbc02...c525d8 (recorded from the brief). Node: the shell default was v26.10.0, so Node v24.21.0 was put first on PATH
as the brief shows and re-checked (v24.21.0) before every command. Uncommitted coordinator files under `handoff/` untouched.

### Reproductions at the base (new e2e assertions failing, evidence 01)

- B-01: the phone first-screen test failed in both zone situations: first `[data-day]` bottom 910.2px (reporting zone =
  viewing zone) and 1046.6px (zone note shown) against the tab bar top 788px.
- B-02: at 768px and 1024px the keyboard walk reached "BUTTON Clock in" entirely under the open panel after 19 Tab
  presses; at 1280px Escape pressed with focus on a sheet control left the panel open.
- B-03: restored assertion passed at the base (the absence checks are new additions before the branch).

### Fix per finding

- B-01 (`src/client/styles.css` phone block, `src/client/TimesheetScreen.tsx`): the page heading block becomes
  screen-reader-only below 768px (class `page-head`; the h1 stays in the DOM and visible to assistive tech); the period
  card is one grid with `<` and `>` flanking the title, the meta/zone note below and "Review & sign off" last; the clock
  card is one row; "Open a day" is one row (label beside the date field) and the two toggles are one row; the card, gaps
  and form header are tighter, the form title is screen-reader-only (mockup A2: company line plus fields). Result at
  390x844: first day row bottom 758px (zone note shown) against 788px; the reporting-zone case is higher still. 44px
  targets kept (the clock, toggles, `<`, `>` and the review link are at least 44px).
- B-02 approach: modal below 1200px (inert page, native focus trap, scrim), non-modal panel in its own grid column from
  1200px (unchanged). `TimesheetScreen.tsx` chooses `modal={!wide}` (new `(min-width: 1200px)` query via a shared
  `useMedia` hook) and a new `bottomSheet={!desktop}` prop of `DayEditor.tsx` picks the bottom-sheet or side-panel
  styling and the sheet handle. Escape: the native cancel and the dialog key handler close a modal editor; for the
  non-modal editor a document keydown listener closes it wherever focus is, unless the event was already handled
  (`defaultPrevented`, for example an open label picker) or a nested `dialog:modal` (a review or the clock-out
  dialog) is open. Focus returns to the day's button as before. `.day-panel-side::backdrop` uses the existing `--scrim`.
- B-03 (`tests/e2e/import.spec.ts`): both absence checks ("Import a workbook" heading, "Opening OT balance") now run on
  `#/admin` in both projects, preceded by a visible "Administration" heading check; the later checks on the Settings
  page are kept.
- B-04 (`docs/04_UX_AND_SETTINGS.md` and `.vi.md`): Check words now include "Missing record"; the batch sentence names
  the category choice ("Category for selected days"); the Day editor bullet describes the three modes and the Escape rule;
  the phone bullet describes the first screen (EN and VI parity kept).

### New e2e assertions (nothing removed or weakened)

- `timesheet.spec.ts`: "phone first screen" (mobile only): the first `[data-day]` bottom is at or above the tab bar top,
  with the viewing zone equal to the reporting zone and with the zone note shown; no scroll.
- `day-editor.spec.ts`: "WP5-UX-B-02" (desktop only): at 768 and 1024px a 70-press Tab and Shift+Tab walk never focuses
  a control entirely under the panel, and Escape closes the panel with focus placed on a sheet control; at 1280px the
  panel is non-modal and Escape closes it from a sheet control and from the toolbar.
- `import.spec.ts`: B-03 above.

### Files

- Added: none (a temporary probe spec was created and deleted before the digest). Deleted: none.
- Modified: `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/styles.css`,
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/timesheet.spec.ts`,
  `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`, this brief.
- Not changed: `PeriodBar.tsx`, `ClockPanel.tsx`, `TimesheetSheet.tsx`, `SheetWeekTable.tsx` (CSS only was needed), server,
  API, calculation, `tests/e2e/fixtures.ts`.

### Results of the checks

| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` | exit 0 | `03-typecheck.txt` |
| `npm run lint` | exit 0 | `04-lint.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `05-unit-tests.txt` |
| full Playwright suite, both projects, Edge | exit 0; 172 tests: 162 passed, 10 skipped, 0 failed; desktop 81 passed + 5 skipped, mobile 81 passed + 5 skipped (the skips are project-specific tests: 5 per project, of which 2 on desktop and 3 on mobile are the new FIX3 tests; the rest pre-existed); 5.6 min | `06-e2e-full-both-projects.txt` |
| `validate_package.py --preflight` with `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe` | exit 0, status PASS | `07-preflight.txt` |
| EN/VI parity of docs/04 | same four edits in both files, same code spans and quoted strings | `docs/04_UX_AND_SETTINGS*.md` |
| Grep of changed files and evidence for user-profile paths and email addresses | 0 matches | n/a |
| `npm run verify` (`SMOKE_PORT` 47962, `DATA_DIR` and `DATABASE_PATH` in the task folder) | exit 0 | `08-verify.txt` |
| `npm run digest` (last) | `b4df92131fd3863068d661471c8e269c32e54b89c6fbef4728c6085d6362596d`, 789 files, handoff/ excluded; no tracked file deleted, so no probe | `11-digest-final.txt` |

Synthetic screenshots: `fix3-phone-390x844-first-screen-synthetic.png`, `fix3-desktop-1024x800-panel-open-synthetic.png`,
`fix3-desktop-1280x800-panel-open-synthetic.png` (evidence folder). Layout probe: `09-phone-layout-probe.txt`.

### Notes for the coordinator

- Residual: below 1200px a user can no longer use the sheet while the editor is open (it is modal by design, like the phone
  sheet); at 1200px and up the sheet stays beside the panel. docs/04 describes this.
- On the phone the period card keeps DOM order prev, review link, next, while the grid shows `<` and `>` beside the title and
  the review link last; the visual and keyboard order differ by that one control. Flagged for the re-audit if judged material.
- No stop, permission denial or ENOSPC occurred. No background task of mine is running.

(The residual about the phone focus order above is closed by Addendum 1 results below. Digest `b4df9213...` above is the
first hand-back's digest, kept as history.)

### Addendum 1 results: focus order follows reading order

- Node 24.21.0 first on PATH, confirmed with `node --version` before any node call.
- Change (`src/client/components/PeriodBar.tsx`): in `.period-actions` the "Next period" button now comes before the
  "Review & sign off" link in the DOM. The DOM order is now Previous, Next, Review on every layout: on the phone the grid shows
  `<` and `>` in row 1 and the review link in the last row (reading order = tab order); on desktop and tablet the
  flex row now reads `< period  >  Review & sign off` (the review link moved from before `>` to after it, one visual change).
  No positive `tabindex`; CSS unchanged.
- New e2e assertion (`tests/e2e/timesheet.spec.ts`, runs in both projects): focus on "Previous period", Tab lands on "Next
  period", Tab lands on the review link, and the three bounding boxes are in top-to-bottom then left-to-right order.
- Checks: typecheck exit 0; lint exit 0; `npm test` exit 0 (82 files, 1820 tests); full e2e exit 0: 174 tests, 164 passed,
  10 skipped, 0 failed (desktop 82 passed + 5 skipped, mobile 82 passed + 5 skipped); preflight exit 0 (PASS); `npm run
  verify` exit 0 (SMOKE_PORT 47963, data in the task folder); `npm run digest` last:
  `8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e` (789 files, handoff/ excluded; no tracked file deleted).
- Evidence: `evidence/WP5-UX-FIX3/a1-03-typecheck.txt`, `a1-04-lint.txt`, `a1-05-unit-tests.txt`,
  `a1-06-e2e-full-both-projects.txt`, `a1-07-preflight.txt`, `a1-08-verify.txt`, `a1-11-digest-final.txt`.
- Deviation: I did not run the new assertion against the old DOM order before fixing (the old order made Tab from
  Previous reach the review link, which the assertion forbids). No background task of mine is running.

Status: done
