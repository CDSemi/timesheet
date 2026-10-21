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

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high). Status: done. Evidence in
`handoff/delivery/evidence/WP5-UX4-T01/` (checks.txt, controls-measurements.txt, mutants.txt,
parity-docs04.txt, test-counts.txt, six `-synthetic.png`).

### Base

HEAD = origin/main = 5a68fba65bac6723ed3e66f33048b722d34c4656; digest before edit
6e9e3001fe1f1ed352f446be19cc07c152d4cb61aa7ab0dce145f1fc6e1f8f41 (835 files); `git status --short`
showed only the coordinator files under `handoff/`. Node v24.21.0.

### Items and measured results (desktop and mobile projects, light and dark, real clock)

1. U4-02 title gap: `--page-head-gap` = `--space-6` (32px) on `.page-head` (Timesheet) and, as the
   difference to the stack gap, on `.review-head` (Review), from 768px; `p.card` under the Review head
   loses its browser top margin. Measured 32px at 768, 1024, 1440, 1920 in both themes on both pages;
   at 390 the head keeps its 12px margin.
2. U4-03 paper: `[data-paper]` on `section.sheet-main` (Timesheet) and `section.review-sheet-block`
   (Review), class `.paper`: `--paper-surface` (card), `--elev-paper` (`--elev-2`), `--radius-lg` from
   768px, 16px padding, `overflow` visible, `--paper-gap` 16px. Week sheets and footer lose only their
   shadow; weeks, toolbar, footer, signature rows unchanged. Paper on page 1.14:1 (light), 1.15:1 (dark).
   Phone: full-bleed (negative inline margin), square, same 16px side padding: table 358px at 390 and
   288px at 320, no sideways scroll; first day row bottom 571px (670 with zone note, 623 and 722 with a
   received share, 574 and 673 away) against the tab bar at 788px (was 559, 658, 611, 710: +12px).
   The week-card scroll window moved from 768-899px to 768-929px (+32px of paper padding).
3. Week emphasis: `--sheet-head-strong` (light #dde5f0, both dark sets #2c3746) on the week header
   row, the desktop first column and the phone table header. Fill against the date cell 1.27:1 light,
   1.36:1 dark; `--text` 12.30:1 / 9.91:1, `--muted` 4.59:1 / 4.83:1 on it.
4. U4-04 switches: every `[role=switch]` is round (radius 999px, height 24px, `appearance: none`, round
   radial-gradient thumb); the two sharing switches have class `switch-input` in `label.inline.switch`.
5. U4-08 select: `appearance: none`, `padding-inline-end` 34px, two-gradient chevron, right edge 12px
   from the border (measured 12px on every select scanned), `--muted` 5.83:1 light and 7.07:1 dark on
   `--field-bg`, no `url()`; forced colours give `appearance: auto` (tested).
6. U4-09 checkbox: WFH centred on the Category field (0px off at 1440 and 390, both themes: label
   `min-height` = field height, 44px on touch). Every checkbox label aligns its box on the first text
   line (`align-items: flex-start`, margin `(1lh - box) / 2`; touch padding centres one line in 44px);
   measured 0.88px at most on Timesheet batch, Day editor, session and Check out dialogs, Settings.
   (Administration: its selects were scanned; its only checkbox, in the holiday preview, was not
   reached by the scan and relies on the same label rule.)
7. U4-10: "Show worked hours" is the visible text and accessible name; 40 test occurrences updated
   (value only); no "Show details" string remains in `src/` (one comment in `sheetModel.ts:141` is
   outside my paths: see Deviations), docs/04 or the tests.

### Files changed

- `src/client/styles.css`, `src/client/TimesheetScreen.tsx`, `src/client/ReviewScreen.tsx`,
  `src/client/components/ReviewDays.tsx`, `ShowDetailsSwitch.tsx`, `SharingItemsFields.tsx`,
  `TimesheetSheet.tsx` (comment only).
- Tests: `tests/e2e/controls.spec.ts` (new, 20 tests per project), `surfaces.spec.ts`,
  `timesheet.spec.ts`, `day-editor.spec.ts`, `hover.spec.ts`, `focus-ring.spec.ts`, `shell.spec.ts`.
- Docs: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`.
- Not changed: `SheetWeekTable.tsx`, `DayFieldsForm.tsx`, `review.spec.ts`, `sharing.spec.ts`,
  `theme.spec.ts`, `keyboard-access.spec.ts` (no edit was needed). No server change, no dependency.

### Changed assertions (none weakened)

- `surfaces.spec.ts:73-155` (first test of each theme situation): the week bands and the footer are
  no longer "raised"; the paper and the period bar are. Now asserted: paper raised (ring plus 3 layers,
  1.12:1 from the page, 12px corners, 0px on a phone), week 1, week 2 and footer have `box-shadow:
  none`, 0px corners, the toolbar and form header sit inside `[data-paper]` on the card colour, the sheet
  column is opaque and raised. Same number of surfaces checked, plus the paper.
- `surfaces.spec.ts:200`, `hover.spec.ts` (15), `focus-ring.spec.ts` (5), `timesheet.spec.ts` (12),
  `day-editor.spec.ts` (5), `shell.spec.ts` (2): the string "Show details" to "Show worked hours".
- `day-editor.spec.ts:3604-3616`: widths 768, 800, 820, 860, 899 and 920 (was 899 as the last), and the
  card scrolls while the window is at most 913px (was 860px). Reason: the paper's 32px of padding moves
  the exact threshold; the test still asserts "scrolls if and only if the columns need more than the
  card has", over a wider range (899px now scrolls and 920px, which still has the media rule, does not).
- `timesheet.spec.ts:33-38`: `EDITOR_BESIDE_SHEET` 1445px to 1449px. Reason: the file's own comment
  needs whole-pixel column edges (129px columns at 1445px); the paper padding made them 124.4px, so the
  pixel probe of the 1px frame read an antialiased pixel. At 1449px the columns are 125px; probes
  unchanged.

### Tests

- Unit: `npm test` exit 0, 95 files, 2155 tests passed.
- Full e2e, final run (both projects, alone, real clock): 696 passed, 70 skipped, 0 failed. Desktop 352
  passed, 31 skipped; mobile 344 passed, 39 skipped. No ERR_NO_BUFFER_SPACE.
- Earlier full run (before fixes): 690 passed, 4 failed (desktop). Causes: (a) Review at 1280px: the
  two-column switch at 1200px left the sheet 772px wide on a page capped at 1200px, so the 850px week
  grid overflowed its card and a day cell covered a checklist radio (measured at 1440px with the paper:
  scrollWidth 849 against clientWidth 740; without the paper the same arithmetic gives 850 against 772,
  so the overflow pre-dates the paper); fixed by a 1330px switch and a page widened to `--page-max-editor` beside the
  checklist (new containment test at 1440, 1330, 1280, 1024); (b) the 899px expectation and (c) the
  1445px probe, both above; (d) my Check out test used a display name containing "Check Out" (an
  accessible-name clash); renamed.
- Mutants (each alone, failed, reverted; mutants.txt): paper wrapper removed (6 failures, e.g. count of
  `[data-paper]`); title gap back to 12px (received 12, expected 32; 3 failures); one switch square
  (`Final PDF downloads` radius 0, expected at least 12); WFH alignment rule removed (centre 9px off
  desktop, 11.1px mobile).
- Docs: EN/VI parity of docs/04 (parity-docs04.txt) holds line by line. `validate_package.py
  --preflight` exit 1 on this host (Python without tzdata, `ZoneInfoNotFoundError`), not a content
  finding; not run to success. Privacy and whitespace checks clean.
- `npm run build`: no chunk advisory; main chunk `index-B14PGL2_.js` 490.24 kB (gzip 143.95 kB).
- `npm run verify` (SMOKE_PORT 49371): exit 0.
- Final `npm run digest`: 1921c36f444c8161a963e5c36e1857d682080255b44a5539dc899b60730160e6 (836 files).

### Deviations and notes

- The Review two-column switch moved from 1200px to 1330px with a page widened to 1600px beside the
  checklist (see the earlier run, cause a); docs/04 states it. This is a consequence of the paper plus a
  pre-existing overflow, not a new design choice; the owner may want to see the Review at 1280px as one
  column.
- `src/client/components/sheetModel.ts:141` still says "Show details" in a comment; the file is outside my
  owned paths, so it is left for the coordinator or UX4-T06.
- `docs/10` and `docs/12` were not touched (UX4-T06). No `skip`, `fixme` or `.only` was added.
- Footer: it keeps its padding and layout; only its shadow goes (the paper carries one). Say so if the
  owner wants a hairline frame on it.
- Changed docs: the `--paper` token name already existed (white signature paper), so the new surface
  tokens are `--paper-surface`, `--elev-paper`, `--paper-pad`, `--paper-gap` (no `--radius-paper`: the
  scale token `--radius-lg` is used, which the radius-scale unit test requires).

- preflight PASS with the workflow Python (exit 0, 118 translation pairs, 91 scenarios; evidence/preflight.txt). The
  earlier exit 1 above was the default interpreter without tzdata.

Status: done
