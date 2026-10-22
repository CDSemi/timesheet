# WP5-UX5-T04 dispatch brief (breakpoints, top bar and the period card)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T04, package WP5, kind
  implement, attempt 1. It depends on WP5-UX5-T03-FREEZE (done, 65def2f).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size L, risk H. The breakpoint split touches every layout: about 23 media rules,
    the TypeScript query used for three layout choices, 13 test files and fractional widths at
    125% and 150% display scaling. A slip leaves a width with no layout, as U5-15 showed.
    Novelty no: it follows the container-query and period-card patterns already in place.
    docs/08 row "High-risk fix/slice with an existing pattern".
  - Write the task record in English.
- **Items:** U5-01, U5-02, U5-08 to U5-15 and U5-22, plus the B1 gap.
- **Sources (read them in full):**
  - the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`:
    - section A, U5-01, U5-02 and U5-08 to U5-15 and U5-22 (about lines 440-610 and
      660-666);
    - section E (slices) and F-6;
    - Addendum 1, "D, mockup changes", the B1 line: `--period-step-gap` 20px between "<" /
      ">" and the range block, was 12px.
  - the mockups `handoff/delivery/design/WP5-UX5/mockup.html` and the renders
    `mockup-r5-b1-topcard-wide-synthetic.png` and `mockup-r5-b2-topcard-narrow-synthetic.png`;
  - the owner's words on the board (`owner_decisions` 2026-10-21, the round-5 request: the
    first three bullets and "Card period-range-dates (top card)"; the answers F-6 a and
    B1). Also the 2026-10-22 answer H-1 a.
  - `handoff/delivery/tasks/WP5-UX5-T03.md`, Results: what T03 changed in
    `ReviewStatus.tsx`, `reviewModel.ts` and `ReviewDays.tsx`. Build on it; do not undo it.
- **AGENTS.md on disk wins.** Rule 7, rule 8, rule 11, and the "Frontend and UI/UX
  standards" section. **The 44px touch-target rule stays at 768px and with a coarse
  pointer (F-6 a).**
- **Base.** HEAD = origin/main = 65def2f61b6cb82e8c23cb01c15e787d2d0b1c14, or a later commit
  that changes only `handoff/`. The digest is
  d23e3617d58fe540b42b28e13c4f8c4674b4eae106bdaea0ccf6b4cc76b03440 (862 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Owner decisions that shape this slice

1. **F-6 a, what moves to 480px.**
   - **Below 480px:** the sheet's compact form — the 4-column table (Timesheet and
     `ReviewDays`), the phone period-card grid, the phone toolbar, the hidden form title and
     the compact paper.
   - **Stays at 768px:** the navigation shell (phone bar and tab bar versus the desktop
     bar), the title-row clock, the Day editor (bottom sheet versus drawer,
     `editorLayoutModel.ts` unchanged), full-screen dialogs and the 44px rule.
   - From 480 to 767px: the phone bar and tab bar, with the 7-column sheet scrolling
     sideways inside the week card. This extends today's 768-929px behaviour to 480-929px.
2. **Range syntax everywhere** (U5-15): `width < 480px` / `width >= 480px` and
   `width < 768px` / `width >= 768px`, in CSS and in TypeScript, one constant per query, so
   no fractional width falls between two rules. Name the two queries as in the plan
   (`SHELL_QUERY`, `SHEET_QUERY`) or explain your names in Results.
3. **U5-08 needs no code.** "Current period" still exists and shows only in the window the
   plan describes. Keep it working with the new card arrangements, and test it with a fixed
   clock inside that window.
4. **U5-14 with H-1 a.** "Review & sign off" is a primary button when the shown period is
   the person's own, not imported, ended (`period_end < today_local` from
   `/api/periods/current`), and still needs the person:
   - no revision (draft): primary;
   - an automatic revision with review pending: primary, "Review now";
   - signed, and no revision of the period has a send yet: primary, "Review & send" (F-2 a);
   - once any revision of the period has a send (H-1 a): secondary, including a later signed
     correction that is not yet sent. The Review page's Send card still offers that send.
   - Future and in-progress periods: secondary. Shared views: secondary.

   Use only server fields. If the client lacks one of them without a server change, stop
   and report.

## First: inventory, then stop if a path is missing

Before editing, list:
- every `@media` rule keyed on 767/768 in `styles.css`, and how each one splits between the
  two queries;
- every TypeScript use of the desktop query (`ClockProvider.tsx`, `TimesheetScreen.tsx`,
  `BarClock.tsx`, `ReviewDays.tsx`, any other), and which query each use becomes;
- every test line with 767/768 or a phone width that now falls on the other side (the plan
  counts 63 lines in 13 files), and what each becomes;
- the docs/04 lines that name 768 or the compact layout.

If a needed path is not in "Owned paths", stop and report before editing.

## Scope

1. **U5-01 and U5-15, the split.** As decided above. AC (plan):
   - at 479, 480 and 479.33 (150% scaling), exactly one of table and grid is in the DOM and
     its styles apply;
   - at 600, the tab bar and the 7-column grid show together with no page sideways scroll;
   - `matchMedia` and the CSS switch at the same width (sweep 470-490 and 760-776 in 1px and
     1/3px steps);
   - at 767.33 and 767.2, every layout belongs wholly to one side;
   - at 390x844 the first day row is above the tab bar, as today.
2. **U5-02, the company name in the top bar.**
   - Show the wordmark whenever it fits, by `@container` thresholds on the bar, with the
     literals documented:
     - the phone bar from about 410px with the clock group, and from about 250px without it
       (shared view);
     - the desktop bar from about 840px without the switcher, and from 1280px with it, as
       today.
   - AC: sweep 320-1440 in 1px steps, own and shared views, both themes. The wordmark is
     visible exactly when the bar has room for it with 8px of slack. It never overlaps or
     clips, and no bar wraps.
3. **U5-09 to U5-13, the period card** (mockups B1, B2).
   - **Wide arrangement:** `[<] [range over pills] [>] [Today] [Current period?] ...
     [Review]`.
     - The range block is exactly the button-row height: the range top aligns with the
       button top, and the last pill's bottom with the button bottom.
     - `--period-step-gap` is 20px (B1).
   - **Narrow arrangement**, used only when the wide row does not fit:
     - row 1 is `[<] [range over pills, centred] [>]`, with ">" at the right edge;
     - then the divider and the meta line;
     - then Today, Current and Review in one row.
   - The switch uses `@container` thresholds measured from the parts, one with Current
     shown and one without.
   - The divider is kept in both arrangements, about 8-10px above and 6-8px below.
   - **U5-13, the range ladder:** full, then no start year, then no years, then end day
     only, then no spaces. Rules:
     - the longest form that fits is shown;
     - the accessible name is always the full "MM/DD/YYYY to MM/DD/YYYY";
     - the "end day only" steps are skipped across months, and the "no start year" step
       across years.
   - Plan AC (1)-(5), with 20px in place of 12px for the gap after the range block in (1).
4. **U5-14**, as decided above.
5. **U5-22, compact margins.** Below 480px, the period card and the paper stand 8px from
   each window edge (`--compact-edge`). The paper takes the `--radius-lg` corner and 8px of
   inner padding. AC:
   - `card.left == paper.left == 8` and `card.right == paper.right == width - 8` at 320,
     360, 390 and 479;
   - the table is 358px ±1 wide at 390;
   - no sideways scroll;
   - the first-day-row budget is measured again and written into docs/04.
6. **The Review page** follows the same split (`ReviewDays.tsx`). The T03 check card's
   compact padding moves with the sheet query. Its "Back" label stays below 480px.
7. **Style.** Reuse the tokens. A new value is a CSS custom property. Every state works in
   both themes.

## Tests

- Update the 13 files the inventory found. Change only what the split moves; list each
  changed assertion with file:line and its reason; weaken nothing.
- **New:** a breakpoint sweep in `surfaces.spec.ts` (1px and 1/3px steps around 480 and
  768, and 125% and 150% scaling); the wordmark sweep (`logo.spec.ts` or `shell.spec.ts`);
  the period-card AC (`timesheet.spec.ts`, `today.spec.ts`); the ladder unit tests in
  `periodBarModel.test.ts` (month and year cases); the U5-14 table in
  `reviewModel.test.ts`, plus one e2e check of the primary style.
- **Evidence:** synthetic renders of the Timesheet at 1440, 900, 600, 479, 390 and 320, and
  of the period card in both arrangements (`-synthetic.png`, at most eight).
- **Mutants** (each must fail a test):
  1. one CSS rule back to `max-width: 767px`;
  2. `SHEET_QUERY` at 768px;
  3. the wordmark always hidden on the phone bar;
  4. the ladder always shows the full form;
  5. U5-14 primary for an in-progress draft.

## Docs (EN and VI)

- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: only the lines this slice makes false. These
  are the breakpoints, the compact layout, the top bar, the period card, the Review button
  style and the phone first-screen budget. docs/12 and the pilot packet belong to UX5-T06.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. The inventory. Stop if needed.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory.
4. Run the e2e files you changed, each once.
5. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
   A worker crash is a failure.
6. The mutants.
7. Parity of the docs pair, then `validate_package.py --preflight` with the workflow
   Python. Write `<user>` in the evidence.
8. Privacy and whitespace checks (`git diff --check`). Synthetic data only.
9. `npm run verify` with `SMOKE_PORT` in 49740-49759, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
10. `npm run digest` LAST. If you deleted a file and the digest script fails while that file
    is still in the index, run `git rm --cached` on exactly that file and report it. Change
    the index in no other way.

**Rules:** no `skip`, `fixme` or `.only`; no npm dependency change.

## Owned paths

- `src/client/`: `ClockProvider.tsx`, `TimesheetScreen.tsx`, `BarClock.tsx`,
  `ReviewDays.tsx`, `ReviewScreen.tsx` (layout only), `PeriodBar.tsx`, `periodBarModel.ts`,
  `AppShell.tsx`, `ReviewStatus.tsx`, `reviewModel.ts`, `styles.css`, and any client file
  that reads the desktop query. Any other client file only as a call-site follow-up, listed
  in Results with its reason.
- `src/server/`: **none.** A needed server change is a stop.
- `tests/client/` and `tests/e2e/`, as limited in "Tests".
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, as limited above.
- this brief's Results section.
- `handoff/delivery/evidence/WP5-UX5-T04/`.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-T04`. Ports 49740-49759.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change npm
  dependencies. Do not stage, unstage or commit anything, except the `git rm --cached` case
  in check 10.
- Mail goes only to local capture or the loopback test sink.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high). Attempt 1.

### Step 0: base (before any edit)

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-T04` (logs there). `node --version` v24.21.0 (Node 24 first on PATH).
- HEAD = 65def2f61b6cb82e8c23cb01c15e787d2d0b1c14. `git status --short`: only `handoff/` entries (ORCHESTRATION.json,
  WORKFLOW_REVISION_CHECKPOINT EN/VI, WP5-UX5-T03-FREEZE.md, the T03-FREEZE evidence folder, this brief).
- `npm run digest`: d23e3617d58fe540b42b28e13c4f8c4674b4eae106bdaea0ccf6b4cc76b03440 (862 files), exit 0, equal to the brief.

### Inventory (done before editing; nothing was missing from "Owned paths")

- **`@media` rules keyed on 767/768 in `styles.css` (23 in the plan, listed by their pre-edit line) and where each went:**
  - to the shell query (width < 768px / width >= 768px, unchanged behaviour): the identity-button 44px rule (719), `html` scroll
    padding for the tab bar (1069), the desktop bar `min-width: 768px` (1075), `.page` padding for the tab bar (1112), the 44px
    control rule (1416), `label.inline.switch` 44px (1889), the title-row margins and the hidden page heading (2272, 2339 part),
    the 44px link-action rule (3548), the Day editor grids (3638), the session dialog (4426, 4433), the WFH 44px row (4500),
    leave grid and editor actions (4538), `label-option` 44px (4707), the OT page (4861), the Send card (5388, 5418), the Sign off
    dialog (5529), the operations table (5623), the share bar (5825), the compact shell bar (5865), the import table (5945);
  - to the sheet query (width < 480px, range syntax): the form head, footer, signatures, form title and fields (3355), the paper
    (3697, now 8px from the edges with the card corner), the T03 check card padding (5095) and Preview card (5154, now the Review
    cards stand 8px from the edges), the toolbar and `.workbar` spacing (2339 part);
  - to `(480px <= width < 930px)`: the sideways-scrolling week card (2675, was 768 to 929px);
  - to container queries (not a media rule any more): the period card grids (2272, 2339), the `period-cta` label rules (2339) and the
    wordmark rules (632, 642, which were `min-width: 1024px` and a 1024 to 1279px pair; the tight 1024 to 1279px gaps stay as a media rule).
  - The three other width rules (`max-width: 479px` Profile facts and the "Back" label, `max-width: 359px` bar-clock hint) are now
    `width < 480px` and `width < 360px`; there is no `min-width` / `max-width` media query left in the style sheet.
- **TypeScript uses of the desktop query:** `ClockProvider.tsx` (the export `DESKTOP_QUERY` and `useMedia`; now `layoutQueries.ts` and
  `useMedia.ts`), `TimesheetScreen.tsx` (one `desktop` flag used for four things: the title-row clock :611, `beside`/`floating` and
  `data-editor-layout` :104/:621, `bottomSheet` :724 become `SHELL_QUERY`; the sheet layout :692 becomes `SHEET_QUERY`),
  `BarClock.tsx` (SHELL), `ReviewDays.tsx` (its own copy of the query; SHEET), `editorLayoutModel.ts` (`DRAWER_MIN_WIDTH` stays 768, comment
  only). No other client file reads a breakpoint.
- **Docs/04 lines this slice made false:** App shell (7), Timesheet title gap kept (44), Paper sheet (45), the 768 to 929px scroll (50),
  Phones (52), Period bar (57), the Phone buttons bullet (60, now "Narrow arrangement buttons"), Toolbar (62), plus a new Review link style bullet.

### Changes by area

- **U5-01, U5-15 (the split).** `layoutQueries.ts` holds the two constants (`SHELL_QUERY = '(width >= 768px)'`,
  `SHEET_QUERY = '(width >= 480px)'`; my names equal the plan's), `useMedia.ts` the hook. Every media query of `styles.css` is in range
  syntax; none uses `min-width` or `max-width` (a vitest test fails on one). The shell keeps 768px (phone bar and tab bar, title-row clock,
  Day editor drawer, full-screen dialogs, the 44px rule). The sheet's compact form moves to below 480px; from 480 to 929px the 7-column grid
  scrolls sideways inside its week card, so at 600px the tab bar and the grid show together with no page scroll.
- **U5-02 (wordmark).** The bar is a size container (`shell-bar`); thresholds are documented literals in `styles.css`. Measured with the
  browser's own layout (the wordmark forced shown and hidden): own view 414px of bar from the check in/out group, 852px on the desktop bar
  without a share, 1280px with one (the switcher's width depends on its owners' names, so that bound stays fixed as before).
  **Deviation from the brief's "about 250px (shared view)":** the wordmark may not add a row. In a shared view the brand and the
  switcher share one row below 492px without the wordmark; showing it there would push the switcher down (bar 52px to 104px), so it is
  hidden from 288 to 491px and shown from 492px (and from 207 to 287px, which no real phone has). With the switcher in the own view
  (check in/out group in row 1, switcher in row 2 at 414 to 494px, in row 1 from 495px) it shows at 414 to 494px, is hidden from 495 to
  665px and shows from 666px. The brand-to-menu gap token moved from the bar to the menu (`.shell-nav { --shell-brand-gap }`), because a
  container cannot style itself.
- **U5-09 to U5-13 (period card).** `.workbar` is the size container (`period-card`). Wide: `[<] [range over pills] [>] [Today] [Current
  period?] ... [Review]`; the range block is exactly `--period-row-h` (40px, 44px on touch and below 768px) tall, the range top equals the
  buttons' top and the last pill's bottom their bottom, `--period-step-gap` 20px, Today 8px after ">", Review on the right edge. Narrow:
  `[<] [range over pills, centred] [>]`, the divider, the meta line, then Today, Current and Review in one row. The thresholds are 40rem (600px)
  of card without Current period and `--period-current-room` 9.2rem (138px) more with it (the plan's 515 and 640px were estimates; these are
  measured from the parts: 32 padding, 40 + 20 + range 208 + 20 + 40, 8, Today 70.3, 16 of air and the longest label 145.7px). The room of
  Current period is taken from the container as padding and given back to the card as a negative margin, so one rule set serves both
  thresholds. The divider (1px `--line-soft`) is 10px above and 8px below in the wide arrangement, 8px and 6px in the narrow one.
  The range is one set of text parts (`rg-*` spans): the shorter forms hide a part visually (clipped, not removed), so the text content and
  the accessible text stay "MM/DD/YYYY to MM/DD/YYYY"; `data-range-kind` says which forms exist. Ladder thresholds are in em of the block's
  own font: 12.7, 10, 7.3 and 5.75em (measured 12.65, 9.95, 7.26, 5.69em).
- **U5-14 and H-1 a.** `reviewLinkView` (in `reviewModel.ts`) decides the label and whether the link is primary; `PeriodState.earlierSend`
  (read only for a revision after the first, from the revision list's `delivery_state`) says whether an earlier revision has a send. The
  "Review & send" label has the short form "Send". **Note:** a send that is queued for an earlier revision and has no attempt yet is not
  visible to the client; an unreadable revision list counts as "an earlier send exists" (the quiet link). No server change.
- **U5-22.** `--compact-edge` (8px): below 480px the period card and the paper stand 8px from each edge with the card corner; the paper
  pads 12px 8px (the table is 358px at 390px); on Review the check, Preview and Send cards stand at the same 8px and the Preview body pads 8px.
  The T03 check card's compact padding and the Preview card's compact rules moved from 768 to 480px ("Back" stays below 480px).
- **Visible side effects worth knowing.** The "Open in History" link in the pill row is pill-sized (20px) with a fine pointer from 768px and
  the 44px target elsewhere, so the wide row is only exactly button-high for a period without that link on touch. The first-day-row budget at
  390x844 is now 582px (685px with the zone note; 634px and 737px with a received share) against the tab bar at 788px.
- **Not changed (not in this slice).** U5-21 (the week bar's fill after a sideways scroll) now shows from 480px; the Timesheet sheet's signature
  line still labels its link with `reviewLinkLabel` ("Review or correct" for a signed period); both belong to UX5-T05.

### Changed assertions (file:line in the files as they stand now; the reason; nothing was weakened)

The plan counted 63 lines with 767/768 in 13 files; most are comments or widths that stay on the shell side (the 44px rule, the Day editor,
the dialogs, the title row, the tab bar). The ones the split moved:

- `tests/e2e/controls.spec.ts:159-190` (was "Timesheet on a phone: the paper is full-bleed and square", old 159-176): the paper and the period card
  are 8px from each edge at 320, 360, 390 and 479, the paper keeps the 12px card corner and pads 8px, the table is width - 32 (358px at 390px),
  no sideways scroll. `:226-228` (old 219-220): the Review paper's corner is 12px at every width and its body pads 16px, 8px below 480px.
  `:252-253` (old 244-245): the compact Preview card is 8px from each edge (it was full-bleed).
- `tests/e2e/surfaces.spec.ts:126-130` (old 125-129): the raised surfaces, the compact paper included, have the 12px corner (it was 0px on the phone).
- `tests/e2e/review.spec.ts:416-417` (old 414-415): the check card's padding at 767 and 480px is 16px (it was 12px; 12px only below 480px, line 418).
  `:399-400` (old 399): a signed period that has no send reads "Review & send" (it read "Review or correct"; F-2 a, U5-14).
- `tests/e2e/logo.spec.ts:273-296` (old 268-290): the wordmark is hidden at 768 and 851px and shown from 852px without a share (it was hidden
  below 1024px); `:154`: the brand-to-menu token is read from the menu (`.shell-nav`), where the rule sets it. `:327`: the phone test says
  "at 390px" (the wordmark joins from 414px; the sweeps check every width).
- `tests/e2e/today.spec.ts:757` (old 749): the relation pill is a direct child of `.period-pills` (the pills have their own row now).
  `:468-487` (old 462-481): the phone buttons test also checks 300px; "Current" shows only below 316px of window (the card is 16px wider since
  U5-22, so 320px keeps "Current period" in full).
- No assertion about the shell (768px) changed: the title row at 768/1024/1440/1920, the tab bar and navigation, the 44px targets below 768px,
  the Day editor's bottom sheet and drawer, the session dialog, the Send card and the Sign off dialog still pass unchanged.

### Tests added

- `tests/client/layoutQueries.test.ts` (5 tests): the two constants, no `min-width`/`max-width` and no 767/479/359/929 literal in the style
  sheet, only the documented widths, and an evaluation of both queries and every CSS rule at 1/3px steps over 460-500 and 750-790 plus 479.2,
  479.33, 767.2 and 767.33 (the 125% and 150% display scaling widths): each width falls on exactly one side.
- `tests/client/periodBarModel.test.ts` (8 tests, the ladder): kinds, the forms of each kind, the text of each form (month and year cases),
  the spoken text; `tests/client/reviewModel.test.ts` (8 tests, the U5-14 table with `periodEnded` and `periodHasSend`).
- `tests/e2e/surfaces.spec.ts` "layout breakpoints" (3): one layout in the DOM and its styles at 14 widths from 320 to 1280, the tab bar and the
  grid together at 600px, and a 1px sweep of 470-490 and 760-776 in same-origin iframes that load the built style sheet (matchMedia against the
  shell, form title, paper margin, check card padding, page heading, tab bar and sideways-scroll rules). **Limit:** Playwright takes whole
  pixels for a viewport (`expected integer`, CDP `Invalid parameters`) and a frame snaps to them (a 479.33px frame reads 479), so the 1/3px steps
  and the 125%/150% widths are proved on the style sheet's text in the vitest test above, not in a browser.
- `tests/e2e/logo.spec.ts` (4): the wordmark sweep, 320-1440 in 1px steps, own view without and with a share and shared view, light and dark;
  the oracle is the browser's own layout with the wordmark forced shown and hidden (no overlap or clip, no added row, visible exactly when it
  fits with 8px of slack, within a pixel of the literal; with a switcher on the desktop bar, shown from 1280px).
- `tests/e2e/timesheet.spec.ts` (4): the wide arrangement (range top = buttons' top, last pill bottom = buttons' bottom, 20px / 8px, Review on the
  right edge, the hairline 10px/8px, 1px `--line-soft`) at 1440, 1100, 900, 700 and 632px; the narrow one (centred range, ">" on the right edge,
  the buttons under the meta line, 8px/6px) at 631, 600, 480, 430, 390, 360 and 320px; the flip at 631/632px; the ladder for a one-month,
  two-month and two-year range at 320, 360, 390 and 430px (measured widths of every form against the box).
- `tests/e2e/today.spec.ts` (2): U5-08 with a fixed clock inside the window (the periods route answered by `periodWindow.ts`: Current period
  follows Today, the wide row needs 738px with it, 769px is narrow and 770px wide, the short label below 316px, a press returns to the ended
  period); U5-14 (draft ended/last day/in progress, signed unsent ended/in progress, sent) with the primary fill compared with Check in.
- `tests/e2e/review.spec.ts` (1): the Preview sheet follows the sheet breakpoint at 8 widths. Support files: `tests/e2e/periodWindow.ts`,
  `tests/e2e/periodCard.ts`.

### Files changed

- Source (`src/client/`): `components/layoutQueries.ts` and `components/useMedia.ts` (new), `components/ClockProvider.tsx`,
  `components/BarClock.tsx`, `components/ReviewDays.tsx`, `components/editorLayoutModel.ts` (comment), `components/PeriodBar.tsx`,
  `components/periodBarModel.ts`, `components/reviewModel.ts`, `components/ReviewStatus.tsx`, `TimesheetScreen.tsx`, `styles.css`.
  No other client file, and nothing under `src/server/`.
- Tests: `tests/client/layoutQueries.test.ts` (new), `periodBarModel.test.ts`, `reviewModel.test.ts`; `tests/e2e/periodCard.ts` and
  `periodWindow.ts` (new support), `controls.spec.ts`, `logo.spec.ts`, `review.spec.ts`, `surfaces.spec.ts`, `timesheet.spec.ts`, `today.spec.ts`.
- Docs: `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (parity: headings 10/10, bullets 48/48, table rows 27/27).
- Evidence: `handoff/delivery/evidence/WP5-UX5-T04/` (8 synthetic renders: the Timesheet at 1440, 900, 600, 479, 390 and 320, the period card
  wide and narrow; the check logs, with the account name written as `<user>`).

### Checks (actual commands and results; logs in the task folder, copies in the evidence folder)

- `node --version` v24.21.0 (Node 24 first on PATH). Base HEAD 65def2f61b6cb82e8c23cb01c15e787d2d0b1c14.
- Discovery run of the full e2e on the real clock after the source change and before the test edits: 779 passed, 101 skipped, 16 failed
  (`logs\e2e-discovery-1.txt`); every failure was an assertion the split moved on purpose (listed under "Changed assertions"), none a defect.
  Rendering a sent period then showed that a long status line wrapped the wide row; the wide row became a four-column grid (the range block's
  track runs from its range to its pills, so the pills wrap inside it) and the card was re-measured.
- After the last change: `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` 100 files, 2333 tests passed (2312 before, 21 new);
  `npm run build` exit 0 with no chunk advisory (main chunk 483.7 kB, the Review chunk separate).
- The changed and new e2e tests, each run once on the desktop project while writing them (layout breakpoints, period card, range ladder, Current
  period and the review link, Preview sheet, check card, the wordmark rule and the four wordmark sweeps; two assertions of mine were wrong and
  were fixed: the week card scrolls up to 913px, not 929px, and the share sweep's last visible phone width is 494px).
- **Full e2e, both projects, real clock, alone, after the last change** (`npx playwright test --reporter=line`): 809 passed, 115 skipped
  (the existing project-specific skips and the desktop-only tests on the mobile project), **0 failed**, 22.6 minutes, exit 0. No rerun was needed.
- **Mutants** (each built with `npm run build`, run against the named tests, then restored; `cmp` equal to the saved copy each time):
  1. one CSS rule (the phone-bar block, `.page-head`) back to `max-width: 767px`: killed by `layoutQueries.test.ts` (1 of 5 failed: a
     `max-width` query is left). The e2e frame sweep passes for this mutant: at whole pixels `max-width: 767px` and `width < 768px` agree, and
     the hole exists only at fractional widths, which no browser run here can set (see the limit above);
  2. `SHEET_QUERY` at 768px: killed by `layoutQueries.test.ts` (2 failed) and by `surfaces.spec.ts` (2 failed: the layout in the DOM at 480-767px
     and the matchMedia sweep);
  3. the wordmark always hidden on the phone bar: killed by the own-view sweep in `logo.spec.ts` ("415px: the wordmark is hidden but fits");
  4. the ladder always showing the full form (every container threshold at 0em): killed by the ladder test in `timesheet.spec.ts`
     ("same-month at 320px: the form that shows", box 176px against the full form's 199px);
  5. U5-14 primary for an in-progress draft: killed by `reviewModel.test.ts` (1 failed) and by `today.spec.ts` ("draft on ...: primary is false").
- `parity.mjs` on docs/04 EN/VI: PARITY OK. `validate_package.py --preflight` with the workflow Python: PASS (122 translation pairs, 2337 local
  links). `git diff --check` exit 0. Privacy: the added lines contain no e-mail address, user name, path or credential; the tests use only
  synthetic people and `example.invalid` addresses; mail is local capture only (the harness server runs `OUTBOUND_MODE=capture`).
- `npm run verify` with `SMOKE_PORT=49745`, `DATA_DIR` and `DATABASE_PATH` in the task folder: exit 0 (typecheck, lint, 100 files / 2333 tests,
  build, SMOKE PASSED).
- Runtime slips (no data affected): three shell calls used an empty heredoc (`wordmark.css`, `sweep-patch.txt`, `narrow-new.txt`), two used a
  `> /dev/null` redirect (a `tail`, a `python3 --version`), one piped `ls` into `head`, one used `sleep 1`, and the wait helper uses `mkfifo`
  and `read -t` (no external sleep). The first full run of the probes also created and deleted temporary `zz-*.spec.ts` files in `tests/e2e/`
  (moved out before every full run; none is in the final tree). Nothing else broke the rules.
- No background task of mine is running. Nothing was staged, unstaged or committed.

### Remaining scope and notes

- **Limit:** a browser run cannot set a fractional viewport (`page.setViewportSize` takes integers; CDP `Emulation.setDeviceMetricsOverride`
  refuses 479.33; a frame snaps to whole pixels), so the 479.33 / 767.33 and 125% / 150% cases are proved on the style sheet's text and the
  TypeScript queries (`layoutQueries.test.ts`), and the browser sweep runs at whole pixels.
- **Deviations from the brief:** the shared-view wordmark threshold (492px, not 250px: it may not add a row), the thresholds of the period
  card (600px and +138px, measured, not the plan's 515 and 640px estimates), and the fixed 1280px bound with a switcher (kept; its width depends on
  data).
- **Follow-ups for UX5-T05/T06:** U5-16 (the form header wraps word by word at 480-767px, visible in the 600px render), U5-21 (the week bar's
  fill after a sideways scroll, now from 480px), the Timesheet signature line's link label ("Review or correct" for a signed period, `TimesheetSheet.tsx`
  uses `reviewLinkLabel`), comments in `TimesheetSheet.tsx` and `sheetModel.ts` that still say 768 to 899px, and docs/12 and the pilot packet.
- **Next action:** an independent audit of this slice against the plan's AC for U5-01, U5-02, U5-08 to U5-15 and U5-22 and the mockups B1 and B2,
  then the freeze.
- `npm run digest` (the last command): 2ba69f6271c13b8541177c940f21d02f8c51bc1e36c1a6b8bbb3c0eb9749c355 (867 files: 862 and the five new files),
  exit 0. Nothing is staged (`git diff --cached` is empty), so no `git rm --cached` was needed.

Status: done
