# WP5-UX4-T01 dispatch brief (paper sheet and control polish)

- Mission/task: timesheet-software-readiness / WP5-UX4-T01; package WP5; kind implement;
  attempt 1; depends on WP5-UX4-PLAN and runs after WP5-UX4-T04-FREEZE.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M, novelty no. Task record in English.
- Sources:
  - the plan `handoff/delivery/tasks/WP5-UX4-PLAN.md`, items U4-02, U4-03, U4-04, U4-08,
    U4-09 and U4-10;
  - the mockup `handoff/delivery/design/WP5-UX4/mockup.html`, renders B1-B4;
  - the owner's F-5 answer on the board (`owner_decisions` 2026-10-20, verbatim). **Where
    the answer differs from the mockup, the owner's words win.**
- **AGENTS.md on disk wins** over any injected copy. Its UI section applies: tokens only,
  both themes, WCAG 2.2 AA, `--transition`, no `all`.
- Base: HEAD = origin/main = the WP5-UX4-T04-FREEZE commit (board `commit_sha`) or a later
  commit that changes only `handoff/`. The digest is as recorded by that freeze. Record
  HEAD, `git status --short` and the digest before you edit.

## Items (the owner's F-5 changes are in bold)

1. **U4-02 title spacing: 32px** (not the plan's 24px).
   - Use a token on the page head of Timesheet and of Review.
   - It applies from 768px; below 768px the head stays as it is.
2. **U4-03 paper sheet.**
   - One "paper" surface holds:
     - the toolbar (Open a day, the switch, Change several days);
     - page messages and the batch bar;
     - the form header;
     - both week sheets;
     - the legend, Overtime Total and the signature lines.
   - On Review and sign off it holds "What you sign" and the sheet; the checklist stays
     outside.
   - The title row and the period card stay outside the paper.
   - **The toolbar, both week sheets and the footer keep their current style, layout and
     colours. Only their placement inside the paper changes. The signature and date lines
     stay in their current two rows; do not merge them into one row as the mockup does.**
   - **The paper's own look is free** (surface, edge, shadow, padding, corners), within the
     AGENTS UI section and docs/04. The week sheets inside lose only their own outer shadow
     if the paper carries one; their frame and header strip stay.
   - Phone: the paper is full-bleed, the table width is unchanged, there is no sideways
     scroll, and the 390x844 first-row budget holds.
   - The editor column lift and the panel draw over the paper as today.
   - The PDF does not change.
3. **Week-sheet emphasis (owner, new).** Give the header row of each week sheet (for
   example "WEEK 1  10/12/2026 - 10/18/2026") and the first column (Day, Date, Category,
   Time, OT, Status, and the worked rows) a slightly stronger fill than the date cells.
   - Text contrast stays at least 4.5:1 in light and both dark sets.
   - The fill differs visibly from the date-cell background: report the measured contrast
     between the two fills.
   - Use tokens in all three sets.
4. **U4-04 round switches.** Every `[role=switch]` gets a round track (radius at least
   height/2) and a round thumb. Sizes, states, focus ring and 3:1 boundaries stay as they
   are. The two sharing switches get the switch class.
5. **U4-08 select arrow.** One global rule:
   - `appearance: none`;
   - end padding;
   - a chevron drawn with gradients, about 12px from the edge, at least 3:1 in both themes,
     with no `url()`;
   - in forced colours, the native arrow.
6. **U4-09 checkbox centring.**
   - The WFH checkbox is centred within 1px on the Category field.
   - Every checkbox is centred on its first text line in Timesheet, the Day editor, the
     session and Check out dialogs, Settings and Administration.
7. **U4-10 rename.** "Show details" becomes "Show worked hours": the visible text and the
   accessible name. Update every test that pins the old text (value only).

## Docs

- docs/04 and `.vi.md` (the same tokens and numbers):
  - the Visual standard tokens (title gap, paper, switch, select, checkbox);
  - the Timesheet description and the paper;
  - the Review paper;
  - the Elevation and radius notes;
  - the switch look;
  - the re-measured phone budget figures;
  - the "Show worked hours" name.
- Leave docs/10 and docs/12 to UX4-T06.

## Tests

- Containment and token checks of the paper, on both pages and in both themes.
- The 32px title gap.
- The phone budget.
- A control scan: all switches round; all select arrows at 12px±1 and at least 3:1;
  checkbox centring within 1px.
- The week header and first-column fill differ from the date cells, and their text is at
  least 4.5:1.
- The rename in every pinned assertion.
- Mutants, each applied alone and reverted. A test must fail when:
  - the paper wrapper is removed;
  - the title gap returns to 12px;
  - one switch becomes square;
  - the WFH alignment rule is removed.

## Checks (in order; verify and the digest are the LAST commands)

1. Node 24 first on PATH; `node --version`.
2. Before any edit: HEAD, `git status --short`, `npm run digest`.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`
   (no chunk advisory; record the main chunk).
4. The FULL e2e on both projects on the real clock, alone. A failure whose trace shows
   `net::ERR_NO_BUFFER_SPACE` or another network or buffer error is rerun alone once, and
   both runs are recorded.
5. The mutant proofs.
6. EN/VI parity of docs/04, and `validate_package.py --preflight` (write `<user>` in the
   evidence).
7. Privacy and whitespace checks.
8. `npm run verify` with `SMOKE_PORT` in 49370-49389 and `DATA_DIR`/`DATABASE_PATH` in the
   task folder.
9. `npm run digest` LAST.

List every changed assertion with file:line and why it is not a weakening.
- No `skip`, `fixme` or `.only`.
- No server change.
- At most six `-synthetic.png` screenshots in evidence: Timesheet paper at 1440 light and
  dark, Review paper, phone 390, and the controls.

## Owned paths

- `src/client/styles.css`
- `src/client/TimesheetScreen.tsx`, `src/client/ReviewScreen.tsx`
- `src/client/components/TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `ReviewDays.tsx`,
  `ShowDetailsSwitch.tsx`, `SharingItemsFields.tsx`, `DayFieldsForm.tsx`
- `tests/e2e/surfaces.spec.ts`, `timesheet.spec.ts`, `review.spec.ts`, `hover.spec.ts`,
  `focus-ring.spec.ts`, `day-editor.spec.ts`, `shell.spec.ts`, `sharing.spec.ts`,
  `theme.spec.ts`, `keyboard-access.spec.ts`, and `tests/e2e/controls.spec.ts` (new, if
  used)
- `tests/client/` unit tests for any model you touch
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX4-T01/`

If a change needs another path, stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-T01`. Ports 49370-49389.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS.**
  - Use the Write and Edit tools for files and Glob for listings.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm through that Node, never through the Program Files shim.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. Do not install or change dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

## Return

At most 200 words, beginning 'Self-reported model: ...'. Include:
- per item: the change and the measured result;
- the files changed;
- the changed assertions;
- unit and full e2e counts per project;
- the mutant proofs;
- parity and preflight;
- the main chunk;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Results
