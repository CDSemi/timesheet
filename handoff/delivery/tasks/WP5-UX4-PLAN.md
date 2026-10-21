# WP5-UX4-PLAN dispatch brief (UI change round 4 and the pilot-decision changes)

- Mission/task: timesheet-software-readiness / WP5-UX4-PLAN; package WP5; kind plan;
  attempt 1. Read-only for source, tests and docs. You write only this brief's Results
  and `handoff/delivery/design/WP5-UX4/`.
- Profile/routing: timesheet-planner, requested opus, override `size_risk`. Routing:
  size L, risk H, novelty yes.
  - The round mixes 15 UI items with a new settings export/import feature, a change to
    running-session editing, a new change-password route (D-9 b) and a privacy reversal
    (D-15 b). That calls for one careful plan.
- Base: HEAD = origin/main = 1b96e9d36c4b32caab95d6c4638df7038134b189 (the WP5-UX3 accept
  commit). Source digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6
  (833 files). Uncommitted coordinator records under `handoff/` are expected.
- **AGENTS.md on disk wins** over any injected copy (its header and "Frontend and UI/UX
  standards").

## Read

- The owner's words, verbatim, on the board `handoff/delivery/ORCHESTRATION.json`:
  - `owner_decisions` of 2026-10-20: the round-4 request, and the D-1..D-15 answers;
  - `open_owner_question_wp5_own_q1` (opening balance);
  - `pending_owner_question` (the D-1..D-15 question text).
- docs/02, docs/03 (line 48, F-3), docs/04, docs/05, docs/07, docs/10 and docs/12, in
  English. Also `handoff/delivery/WP5_PILOT_PACKET.md` sections 0, 6 and 8.
- The round-3 plan `handoff/delivery/tasks/WP5-UX3-PLAN.md` and `WP5-UX3-PLAN2.md`, the
  mockup `handoff/delivery/design/WP5-UX3/mockup.html`, and the WP5 handoff round-3
  section.
- The current code, with file:line for each item.

## Deliverables

### A. The 15 UI items (number them U4-01..U4-15 in the owner's order)

For each item, give:
- the current behaviour, with file:line;
- the proposed design;
- acceptance criteria that a gate can measure;
- the files to change;
- the tests to add or change;
- whether it touches the server, API, business rules or any earlier owner or coordinator
  decision.

Points that need care:
- **"Paper sheet" panel** (Timesheet: from "Open a day" through both week sheets to the
  signature lines; and the Review and sign off page): define the surface tokens, the
  spacing, and what stays outside the sheet (title row, period card). Check the phone
  layout and the floating editor.
- **Clicking another column, or unselecting, while the detail panel is open**: today the
  floating mode below 1360px is a modal with an inert page (docs/04, AX and B3-01
  decisions). Allowing clicks on the sheet while it floats means a non-modal floating
  panel. Give the options and their accessibility consequences (focus order, Escape,
  inert), and recommend one.
- **Floating only when the columns would overlap**: today the switch is fixed (108px
  minimum column, side by side from 1360px; owner answer G-1). Propose a content-based
  rule and how to test it, or show that the current threshold already is that rule.
- **Panel corners**: square on the side touching the window edge, rounded toward the
  sheets.
- **Round toggle switches** "as in the mockup": every switch in the app.
- **Select arrow and checkbox vertical alignment**: every select and checkbox, in both
  themes.
- **"Show details" renamed to "Show worked hours"**: the coordinator has agreed, because
  the switch adds exactly the two worked-time rows. Confirm the wording against docs/04
  and note the docs and tests to change.
- **Editing the start time of today's running session** (checked in, not checked out):
  - What do the API and the server rules accept today (a session with `end: null`;
    E-1; future breaks; `expected_version`)?
  - What client change is needed? Is a server change needed?
  - Business-rule effects: worked minutes, OT, and the "Running" status.
  - The dialog layout when there is no end yet.
- **Session dialog**: the time zone above the start and end fields; "Today" links under
  the date fields and "Now" links under the time fields (in the input zone, rule 7); added
  break rows aligned with suggested rows (find the size difference); save errors shown in
  their own alert dialog or notification instead of a message at the bottom.
- **Title spacing**: give the measured gap now and the proposed token.

### B. Settings export and import ("export/import all settings")

Inventory every setting the app stores, with where it lives and who may change it:
- personal settings;
- submission and delivery settings (recipients, SMTP);
- calendars and holidays;
- policies;
- users and roles;
- the reporting zone;
- theme.

Then propose the feature as owner questions, each with options, pros and cons, and a
recommendation:
- **Scope.** Personal only, administrator-wide, or both. Do users and accounts count?
- **Secrets.** SMTP passwords and tokens are never exported in clear text; give the
  options.
- **Format.** Versioned JSON with a schema version and the app version.
- **Import behaviour.** Preview and diff, validation, replace or merge, ownership and
  authorization, an audit record, and what happens to data that references a missing
  calendar or policy.
- **Privacy and AGENTS rule 4.** No personal timesheet data.

### C. The pilot-decision changes (owner answers of 2026-10-20)

For each answer, give the code, docs, tests and pilot-packet changes, sized:
- D-5 a: an offsetting correction to a net zero;
- D-6 a: at most 20 uncommitted previews per person;
- D-9 b: a self-service change-password route. Cover the current password, strength
  rules, rate limiting, other sessions and tokens, the audit record, the UI place
  (Profile?), and tests;
- D-15 b: per-date counts restored in the holiday preview. Name the WP2-A-01 history and
  the privacy note;
- D-10 under each option of WP5-OWN-Q1, i.e. the F-3 rule change;
- the documentation-only answers D-1 a, D-7 a, D-8 a (document it), D-11 a, D-12 a,
  D-13 a and D-14 b in docs/10, docs/12 and the pilot packet (EN and VI).

### D. Mockup

Update the design in `handoff/delivery/design/WP5-UX4/mockup.html`, starting from a copy
of the round-3 mockup. Use synthetic data, system fonts only, the AGENTS UI section and
CSP rules. Show:
- the paper-sheet panel on Timesheet and on Review and sign off (1440 and 390);
- the title spacing;
- the round switch;
- the select arrow and checkbox alignment;
- the side panel with its square edge-side corners;
- the floating rule;
- the session dialog with the zone on top, Today and Now links, aligned break rows, and
  the error dialog;
- the running-session edit;
- the change-password form;
- the settings export and import screens.

Add at most 12 renders named `*-synthetic.png`.

### E. Slicing and gates

- Slices with owned paths, order (one source writer), dependencies and a freeze point
  each.
- Mark the slices that change the server or API and their risk.
- Name any GOV path the round would touch. None is expected.
- The package-final gate items and the audit areas (A: visual and shell; B: data,
  security, settings, sessions).
- An estimate of dispatches.
- Keep it as small as the owner's words allow (AGENTS Prime Directive).

### F. Owner questions

At most 8 questions, each with options, pros and cons, and a recommendation. Include
WP5-OWN-Q1 if your reading of the code changes its options.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-PLAN`. Ports 49330-49349 for any local
  render server. Set `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS.**
  - Write scripts with the Write tool and run them by path.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- Synthetic data only. No email address except the full synthetic `@example.invalid` form.
  No profile path.
- Never edit source, tests, docs, AGENTS, the board or STATE. Leave nothing running.
- If a permission check denies a call, stop and report.

## Output

- Results in this file, sections A-F.
- The mockup and renders in `handoff/delivery/design/WP5-UX4/`.
- Return at most 300 words, beginning with 'Self-reported model: ...':
  - the item count;
  - the slices;
  - the server-touching items;
  - the owner questions in one line each;
  - the mockup files.

## Results

Self-reported model: claude-opus-5-5. Status: done (sections A-F below; mockup and 11 renders in
`handoff/delivery/design/WP5-UX4/`). Read-only for source, tests and docs: nothing outside this
Results section and the design folder was written in the repository.

### Step 0: reconciliation (2026-10-20)

Commands ran in Git Bash with portable Node 24 first on PATH; raw output in
`D:\.claude-tmp\timesheet\WP5-UX4-PLAN\step0.txt` (all exits 0).

- `node --version`: v24.21.0.
- `git rev-parse HEAD` and `origin/main`: both `18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0`, one
  commit after the brief's base 1b96e9d (`git log 1b96e9d..HEAD`): "docs(handoff): record the
  WP5-UX3-ACCEPT commit and return to software_ready", 6 files, all under `handoff/`. No path
  outside `handoff/` changed, so the brief's base holds for source.
- `git status -sb`: `## main...origin/main`; modified `handoff/delivery/ORCHESTRATION.json` and
  both `WORKFLOW_REVISION_CHECKPOINT` files, untracked this brief. Nothing outside `handoff/`.
- `node scripts/source-digest.mjs`: `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6
  (833 files, handoff/ excluded)`, equal to the brief. No source drift.
- `dist/` was built 2026-10-20 15:21 PDT, after the last `src/` commit (8629441, 2026-10-19), and no
  `src/` or `tests/` file is modified, so the probe measured the built app of this source.

### Method of the measurements

- Probe `D:\.claude-tmp\timesheet\WP5-UX4-PLAN\probe\probe-ux4.mjs` (exit 0): seeds a fresh
  synthetic database (`DATA_DIR` and `DATABASE_PATH` under `...\WP5-UX4-PLAN\run1\data`,
  `example.invalid` accounts), starts `node dist/server/index.js` on port 49331 with
  `JOB_RUNNER=off` and capture mail, drives Microsoft Edge headless through the installed
  `@playwright/test` 1.63.0, and stops its own server through the child handle (log: `server
  killed: true, signal SIGTERM`). Output: `run1\probe-ux4.json` (3,174 lines), `run1\summary.txt`
  (from `probe\summarize.mjs`, exit 0), 13 screenshots in `run1\shots\` (synthetic, outside the
  repository). Real clock: Tue 2026-10-20, America/Los_Angeles; the page opens on 10/12-10/25
  (current; payroll 10/30), so Today is already shown.
- O = observed (measured or read in code); A = assumption.
- Mockup: `probe\build-mockup.mjs` builds `handoff/delivery/design/WP5-UX4/mockup.html` from a copy
  of the round-3 mockup's head (tokens, parts, logo and wordmark shapes) plus `probe\round4-extra.css`
  and the round-4 boards (exit 0, 130,368 bytes); `probe\render-ux4.mjs` renders it offline (exit 0;
  0 blocked requests, 0 console errors, 0 scripts, 0 external references, only `example.invalid`
  addresses; output `render2.json`) and writes 11 `*-synthetic.png` renders, copied to the design
  folder.

### Item numbering (owner's order)

The owner's message has 12 bullets plus five sub-bullets under "New/edit session dialog". Following
the coordinator's count ("15 items including a settings export/import feature") and the brief's
single "paper sheet" point, the items are: U4-01 settings export/import (designed in section B);
U4-02 title spacing; U4-03 paper sheet on Timesheet and on Review and sign off; U4-04 round toggle
switches; U4-05 change or unselect a column while the panel is open; U4-06 panel corners; U4-07 float
only when the columns would overlap; U4-08 select arrow; U4-09 checkbox vertical centring; U4-10
"Show details" renamed; U4-11 edit the start of today's running session; U4-12 dialog: zone above
the times; U4-13 dialog: "Today" and "Now" links; U4-14 dialog: break rows aligned; U4-15 dialog:
save errors in their own alert dialog.

### A. The 15 UI items

**U4-01 Settings export/import.** O: no export or import of settings exists; settings are spread over
append-only `work_policies` and `submission_settings` versions, the calendar tables, users, an env file
and a browser key (inventory in section B). Design, acceptance, files and tests: section B. Impact:
client only if the recommended scope is chosen (B shows that the existing routes suffice); owner
questions F-3 and F-4.

**U4-02 Title spacing.**
- O: `.toolbar` (the title row is `header.toolbar.page-head`, `TimesheetScreen.tsx:479-482`) has
  `margin-bottom: var(--space-3)` (`styles.css:1377-1384`). Measured at 1440 in both themes: title-row
  bottom to period-card top 12px; h1 text bottom to the card 13.6px (`run1\probe-ux4.json` "title").
- Design: new token `--page-head-gap: var(--space-5)` (24px) on `.page-head` from 768px; below 768px
  the page head is visually hidden (unchanged). The same gap is used by the Review page head. Mockup B1.
- AC: at 1024, 1440 and 1920, both themes, `periodCard.top - pageHead.bottom` = 24px ±0.5; at 390 the
  first day row stays above the tab bar.
- Files: `styles.css`. Tests: one assertion in `tests/e2e/surfaces.spec.ts`. Docs: docs/04 "Visual
  standard" (token list). No server, API or rule impact.

**U4-03 Paper sheet (Timesheet and Review and sign off).**
- O: `section.card.sheet-main` holds the toolbar, messages, batch bar and sheet
  (`TimesheetScreen.tsx:492-577`) but is made surface-less (`styles.css:3478-3483`); each week band
  (`.sheet-week`, `styles.css:2493-2498`) and the footer (`.sheet-footer`, `2500-2509`) are separate
  `--elev-2` cards, so the page shows three floating cards. Review: `.review-sheet-block` is also
  surface-less (`styles.css:4813-4818`, `ReviewDays.tsx:31-47`); the checklist sits beside it
  (`ReviewScreen.tsx:229-290`). Measured at 1440: weeks 1168px wide, 24px apart, footer 256px tall.
- Design (mockups B1-B3): one "paper" surface. Tokens: `--paper: var(--card)` (light #fff, both dark
  sets #1a2029), `--elev-paper: var(--elev-2)`, `--radius-paper: var(--radius-sheet)` (0, square like
  the week sheets, G-1 b), `--paper-pad: var(--space-4)` (16px from 768px), `--paper-gap:
  var(--space-5)` (24px between blocks, as `.sheet` today). Inside the paper: the toolbar (Open a day,
  the switch, Change several days), page messages, the batch bar, the form header, both week bands
  (they lose their own shadow and keep their 1px frame and header strip), legend, Overtime Total and
  the signature lines. Outside: the title row (h1 and check in/out) and the period card. Review: the
  paper holds "What you sign" (h2, hint, form header, weeks, totals, signature lines); the checklist
  stays outside on the right. Phone (<768px): the paper is full-bleed (negative inline margin equal to
  the page padding, inner padding the same), square, so the four-column table keeps today's width
  (358px at 390) and never scrolls sideways. The editor column lift and the floating panel draw over
  the paper unchanged. Contrast: paper vs page = card vs page, already >= 1.12:1 (docs/04:87).
- AC: (1) exactly one `[data-paper]` per page; it contains the toolbar, form header, both weeks,
  legend, total and signature lines, and contains neither the h1 nor the period card; (2) computed
  radius 0, shadow = `--elev-2`, background = `--card` in light and both dark sets; week bands inside
  have `box-shadow: none`; (3) paper padding 16px from 768px; (4) at 390 and 320 the paper spans the
  viewport width, the table width equals today's ±1px, no horizontal page scroll; the first day row
  bottom at 390x844 stays above the tab bar (measured today 559.5px; docs/04:48 figures re-measured
  and updated); (5) Review: the paper contains "What you sign" and the sheet, not the checklist;
  (6) no change to the PDF.
- Files: `TimesheetScreen.tsx` (data hook and class; markup already groups the parts),
  `TimesheetSheet.tsx` (footer card class), `ReviewDays.tsx`, `styles.css`. Tests:
  `surfaces.spec.ts` (containment, tokens, both themes), `timesheet.spec.ts` (phone first-row budget),
  `review.spec.ts` (containment). Docs: docs/04:8, 41, 48 (figures), 89 (Elevation: "the week sheets
  and the footer card" become "the paper sheet"), 88 (radius exception adds the paper), docs/12.
  No server or rule impact.

**U4-04 Round toggle switches.**
- O: the only styled switch is `input.switch-input` ("Show details"): 44x24 track with radius
  `--radius-sm` 6px and a square 18px thumb drawn by a `linear-gradient` layer (`styles.css:1805-1873`,
  tokens 121-126; measured radius 6px). Two more `role="switch"` inputs exist without the class and
  render as native 18.8px checkboxes (`SharingItemsFields.tsx:50, 56-63`; measured in Settings,
  `appearance: auto`). The theme control is a radio group, not a switch (out of scope).
- Design (mockup B4): `--switch-radius: var(--radius-pill)` on the track; the thumb becomes round with
  a `radial-gradient` layer of the same size (no pseudo-element on `<input>`, CSP unaffected); sizes
  unchanged (44x24, 18px thumb, 3px inset); the two sharing switches get `className="switch-input"`
  inside `label.inline.switch`. States unchanged: off, on, hover (`--hover-fill`), on-hover
  (`--accent-strong`), focus ring, disabled; state is shown by thumb position and fill.
- AC: every `[role=switch]` in the app has `appearance: none`, track radius >= height/2, a circular
  thumb; boundary and thumb >= 3:1 against their surfaces in every state and theme (existing
  `hover.spec.ts` checks extended to all switches); 44px target below 768px and with a coarse pointer.
- Files: `styles.css`, `ShowDetailsSwitch.tsx` (label, see U4-10), `SharingItemsFields.tsx`. Tests:
  `hover.spec.ts`, `focus-ring.spec.ts`, `sharing.spec.ts` (switch role and state). Docs: docs/04:92
  (switch look). No server impact.

**U4-05 Change or unselect a column while the panel is open.**
- O: from 1360px the editor is a non-modal `<dialog>` beside the sheet; another column's day button
  switches it (probe: 10/14 -> 10/16 worked), but pressing the open day again keeps it open
  (no unselect). Below 1360px (and >= 768) it is opened with `showModal()` (`DayEditor.tsx:124-147`),
  so the page is inert; probe at 1280: a click on another column's centre hits the `DIALOG` backdrop
  and nothing changes. `DayEditor` is keyed by date (`TimesheetScreen.tsx:579-596`), so a switch
  remounts it and silently drops unsaved day fields (pre-existing in the beside mode). docs/04:62 and
  the round-3 coordinator decision (docs/10:239) chose the modal floating panel for WCAG 2.4.11.
- Options:
  - (a, recommended) Non-modal floating panel: `show()` at every desktop width, no backdrop, the
    page stays usable. Focus order: the panel follows the sheet in the DOM (Tab from the sheet
    reaches it, Shift+Tab leaves it); opening moves focus to the panel heading as today. Escape closes
    it wherever focus is (the beside-mode handler, `DayEditor.tsx:152-161`), nested modals keep Escape
    first. No `inert`. SC 2.4.11: when a control behind the panel receives focus and its box is wholly
    covered by the panel, the panel re-docks to the other side (`dockAwayFrom` on `focusin`), so a
    focused control is never entirely hidden (the uncovered width is >= 368px at 768). Screen readers
    can browse the sheet while the panel is open (a non-modal dialog, no `aria-modal`).
  - (b) Keep the modal and turn a backdrop click into a day switch by hit-testing the sheet under the
    pointer: pointer-only (keyboard users still Escape and Tab), depends on hit-testing an inert page,
    and leaves the "click to close" ambiguous. Not recommended.
  - (c) Never float (always push the sheet): impossible below the width the sheet needs (U4-07).
- Design (a): a press on another column's day button (or anywhere on the column) switches the panel;
  a press on the open day's own button closes it (unselect) and keeps focus on that button, with a
  polite status "Day editor closed"; phones keep the modal bottom sheet (not requested). If the Day
  fields form or the reason has unsaved edits, switching or unselecting first asks "Discard your
  changes?" (`ConfirmDialog`, Keep editing / Discard); the session dialog is modal, so no switch can
  happen while it is open.
- AC: at 768-1920 with the panel open, a click on another day opens that day (data-day-editor
  changes) without closing first; a click (or Enter) on the open day's button closes the panel and
  focus stays on it; no element of the page has `inert` and the panel does not match `:modal`; with
  unsaved day fields a switch shows the discard prompt; Tab order sheet -> panel; Escape closes from a
  sheet control; at every width 768-1359 a keyboard walk of the sheet never focuses a control whose box
  is fully under the panel (scan); the editor column frame keeps >= 3:1 everywhere (no side backdrop
  any more, so docs/04:46's "claimed only beside the sheet" note goes); axe clean.
- Files: `DayEditor.tsx`, `TimesheetScreen.tsx`, `SheetWeekTable.tsx` (`openOnClick`, toggle),
  `TimesheetSheet.tsx`, `DayFieldsForm.tsx` (dirty flag), `styles.css`. Tests: `day-editor.spec.ts`,
  `keyboard-access.spec.ts`, `timesheet.spec.ts`. Docs: docs/04:9, 46, 62; docs/10 new coordinator
  entry superseding the 2026-10-15 floating-panel decision. No server impact. Risk M (a11y).

**U4-06 Panel corners.**
- O: `.day-panel` has `--radius-lg` (12px) on all four corners in every mode (`styles.css:3485-3496`;
  measured 12px x4 beside and floating); the floating panel is inset 12px from the window
  (`3504-3515`), the beside panel sits in the page grid 16px from the window edge at 1440 and up to
  176px from it at 1920 (page cap 1600).
- Design (mockup B5): the panel is a drawer flush with one window edge, from under the top bar to the
  bottom of the viewport; radius `--radius-lg 0 0 --radius-lg` when docked right, mirrored when left;
  the phone bottom sheet keeps square bottom corners (already). Beside mode becomes "push": the drawer
  is fixed at the right edge and the page reserves `--editor-width + --editor-gap` on the right, so
  beside and floating share one geometry and differ only by whether the page is pushed (U4-07). The
  `--page-max-editor` widening rule is replaced by the reservation.
- AC: in each mode and side, the two corners on the edge side compute 0 and the two toward the sheet
  12px; the drawer's edge-side gap to the window is 0 and its bottom gap 0; the sheet is never under a
  beside drawer (pushed content right edge <= drawer left - 16px).
- Files: `styles.css`, `DayEditor.tsx` (side attribute in every desktop mode). Tests:
  `day-editor.spec.ts`/`surfaces.spec.ts`. Docs: docs/04:62, 88. No server impact.

**U4-07 Float only when the columns would overlap.**
- O: the switch is a fixed literal in two places (`TimesheetScreen.tsx:44` `WIDE_QUERY` and
  `styles.css:3522-3523`): beside from 1360px. The columns have a floor `--sheet-col-min` 7.2rem = 108px
  (`styles.css:170, 2530`) chosen so no word is cut and nothing overlaps (round-3 gate). Measured with
  the editor open: floating from 1240 to 1359 (columns 153.4px under the panel), beside from 1360
  (116.8px; 0 overflowing cells at every width 1360-1920). Forcing the beside layout in the page:
  1280 -> columns hit the 108px floor and the week card scrolls 17px sideways; 1300 -> 108.3px, no
  scroll, 0 overflow; 1320 -> 111.1px; 1340 -> 114px. So today's need is about 1298px (label 92 +
  7 x 108 + 2 + panel 400 + gap 16 + page padding 32) with overlay scrollbars and about 1313px with a
  classic 15px scrollbar; the 1360 literal is 47-62px conservative. A min-content measurement of the
  cells gives 17px per column (cells may break anywhere), so "overlap" is defined by the 108px floor,
  not by the browser's min-content.
- Answer: the current threshold already implements the rule in spirit (float only below the width at
  which beside would squeeze the columns under their floor) but as a fixed, duplicated number that
  ignores the scrollbar and would be wrong once U4-03 adds paper padding.
- Design (mockup B6): a pure model `editorLayout({ viewportWidth, pagePadding, editorWidth, gap,
  sheetMinWidth })` returns `bottom-sheet` below 768px, `beside` when `viewportWidth - pagePadding -
  editorWidth - gap >= sheetMinWidth`, else `floating`; `viewportWidth` is
  `document.documentElement.clientWidth` (so a classic scrollbar counts), and every other input is
  read in px from the CSS tokens (`--sheet-min-width: calc(var(--sheet-label-col) + var(--sheet-days) *
  var(--sheet-col-min) + 2 * var(--hairline) + 2 * var(--paper-pad))`). A `useEditorLayout` hook
  re-evaluates on resize; CSS keys on a class/attribute set by the hook, so the 1360 literal is
  removed from both files. The decision depends only on the viewport, not on the current mode, so it
  cannot flap. With 16px paper padding the switch lands at 1330px (overlay scrollbars) / about 1345px
  (classic). Optional (not requested, not planned): a narrower editor would move it further.
- AC: unit tests of `editorLayout` at need-1, need and need+1 (both scrollbar kinds); e2e sweep at the
  in-page computed need-1/need/need+1 and at 1024, 1280, 1440, 1920: beside => every day column >=
  `--sheet-col-min`, week card `scrollWidth <= clientWidth`, 0 overflowing cells; floating => the
  model's available width < need; one mode change per crossing; `grep -n 1360` finds no layout literal.
- Files: new `src/client/components/editorLayoutModel.ts`, `TimesheetScreen.tsx`, `styles.css`.
  Tests: `tests/client/editorLayoutModel.test.ts`, `day-editor.spec.ts`. Docs: docs/04:9, 46, 62
  ("from 1360px" becomes the rule), docs/10:239 figure. No server impact.

**U4-08 Select arrow.**
- O: `select` uses the native arrow (`appearance: auto`) with `padding: var(--space-2)` 8px
  (`styles.css:1182-1192, 2013-2015`); measured on all 7 selects found (Category, Leave kind, deficit
  mode, admin Role and three Calendar selects): `appearance: auto`, padding-right 8px; the native
  arrow sits about 4px from the border. Ten `<select>` elements exist in the client (also the batch
  category, the "Shared with me" switcher and the payroll-exception calendar).
- Design (mockup B4): one global rule: `appearance: none`, `padding-inline-end:
  var(--select-pad-end)` (34px), a chevron drawn by two `linear-gradient` layers in `--muted`
  (`--select-arrow` 7px wide, `--select-arrow-inset` 12px from the edge); no `url()`, so the CSP and
  both themes need nothing else; disabled keeps the existing opacity; `@media (forced-colors: active)`
  restores `appearance: auto` (gradients are dropped in forced colours). The native popup is unchanged.
- AC: every `select` in the app: arrow right edge 12px ±1 from the border box, text box ends >= 8px
  before the arrow, arrow colour >= 3:1 on `--field-bg` in light and both dark sets (#5b6675 on #fff
  is about 5.9:1), focus ring and hover unchanged; forced-colors run shows the native arrow.
- Files: `styles.css`. Tests: `surfaces.spec.ts` or a new `controls.spec.ts` scan over Timesheet,
  Day editor, Settings, Administration. Docs: docs/04 "Visual standard". No server impact.

**U4-09 Checkbox vertical centring.**
- O: `.label-row` uses `align-items: flex-end` (`styles.css:4252-4257`, markup
  `DayFieldsForm.tsx:98-113`), so the WFH label (24.8px tall) aligns to the select's bottom: checkbox
  centre 595.6 vs select centre 588 -> 7.6px low (probe). Every other checkbox measured sits on its own
  label line: delta 0.9px (Settings: 9 boxes incl. the two native sharing switches).
- Design (mockup B4): the WFH label becomes a box as tall as the control it sits beside
  (`min-height` equal to the field's border-box height, `align-items: center`) and stays bottom-aligned
  in the row, so both centres coincide; the same rule is a small utility for any checkbox placed beside
  a field (batch bar). Wrapping below 21rem keeps the box with its own line.
- AC: |checkbox centre - adjacent field centre| <= 1px for WFH/Category at 1440 (panel) and 390 (sheet),
  both themes; |checkbox centre - first text line centre| <= 1px for every checkbox in Timesheet, Day
  editor, session and Check out dialogs, Settings and Administration.
- Files: `styles.css`, possibly `DayFieldsForm.tsx` (class). Tests: same scan as U4-08. Docs: docs/04:71
  ("on the same row" -> "centred on the Category field"). No server impact.

**U4-10 "Show details" -> "Show worked hours".**
- O: `ShowDetailsSwitch.tsx:10` (visible text = accessible name); docs/04:41 says the switch "adds the
  rows 'Worked on a workday' and 'Worked on a day off'", so the new name describes exactly what it adds;
  the Review shows those rows always (no switch there). Occurrences: 40 in six e2e specs
  (`hover.spec.ts` 15, `timesheet.spec.ts` 12, `day-editor.spec.ts` 5, `focus-ring.spec.ts` 5,
  `shell.spec.ts` 2, `surfaces.spec.ts` 1), comments in `TimesheetScreen.tsx:125`,
  `TimesheetSheet.tsx:275`, `sheetModel.ts:141`, docs/04:8, 41, 58 (+vi).
- Confirmed: the wording is accurate; keep the component name (no rename churn) or rename to
  `WorkedHoursSwitch` only if the slice touches it anyway.
- AC: the switch's accessible name and visible text are "Show worked hours"; no "Show details" string
  remains in `src/`, docs/04 (EN/VI) or tests except history in docs/10 and docs/12.
- Docs: docs/04 lines above; docs/10/docs/12 history lines stay; docs/12 gets a round-4 entry.

**U4-11 Edit the start of today's running session.**
- O (server and API): `PUT /api/sessions/:id` already takes `end: null` (`schemas.ts:55-63`); the
  service keeps it open (`timesheetCommands.ts:480-514`), checks overlap with an open end
  (`235-253`), refuses a start or break in the future beyond 5 minutes (`189-199, 227-231`) and
  requires `expected_version` (409 stale). Probe on a running session: PUT start -2h, `end: null` ->
  200 (version 2); a break already taken -> 200; a break in the future -> 422 `future_break`;
  `breaks_confirmed: true` while open -> 200 (accepted, but a later Check out overwrites the flag,
  `timesheetCommands.ts:611-623`). While running the day's calculation is `status: incomplete`,
  credited null, so worked minutes and OT are not computed until Check out; the "Running" status and
  "Checked in since" follow the stored start. E-1 (Check out replaces saved rows only when a list is
  sent) is unaffected.
- O (client, the defect): the dialog draft of a running session has an empty end time
  (`sessionModel.ts:188`) and the build calls `draftGap`, which requires an end
  (`sessionModel.ts:118-123`, used by `breakRowsModel.ts:411-421`). Reproduced: check in, move the
  start back, open Edit, press Save -> "Enter the end date and time." (`run1\shots\
  cur-running-edit-save-error-synthetic.png`). The session card also says "Checked in and out" for a
  running session (`dayEditorModel.ts:136`).
- Server change: none needed. Pre-existing gap noted for audit B: a grantee with an edit share can
  `PUT` an end onto the owner's running session (and `POST` an open session), which is a check out/in
  by another name (F-Q5 says never); optional cheap guard in the server slice: via a share, refuse an
  end on an open session and an open new session (409 `shared_clock_action`).
- Design (mockup B8): Edit on a running session opens the session dialog with the subtitle "...
  running"; Input zone (U4-12), Start date and time (with Today/Now), and in place of End a box "No
  end yet: this session is running. It ends when you check out." with a quiet "Set an end instead"
  (keeps today's way to close a forgotten check out; hidden in a shared view). Breaks: date field
  shown (no end yet, existing rule), rows checked against the start only, "Confirm no breaks taken"
  hidden, hint "You confirm the breaks when you check out"; Save never confirms (sends
  `breaks_confirmed: false`), no G-4 notice; the final "Save this session?" lists Time "07:45 - running"
  and Breaks "1 break, confirmed at Check out". Card source line "Checked in" while running.
- AC: owner checks in, edits the start to an earlier time, saves: PUT body has `end: null`,
  `breaks_confirmed: false`, the loaded `expected_version`; card, top bar and sheet show the new
  start; Status stays Running; Check out afterwards computes worked minutes from the new start
  (integration oracle); a start later than now + 5 min shows the server's refusal; a start before an
  earlier session's end shows the overlap refusal (U4-15 dialog); stale version reloads; "Set an end"
  turns it into the ended-session flow; in a shared edit view "Set an end" is absent.
- Files: `sessionModel.ts`, `breakRowsModel.ts` (a `running` build mode), `SessionDialog.tsx`,
  `dayEditorModel.ts`, `SessionList.tsx`. Tests: `breakRowsModel.test.ts`, `sessionModel.test.ts`,
  `day-editor.spec.ts`, one integration oracle in `clock-out-breaks.test.ts` (start edit then Check
  out). Docs: docs/04:65-68, 70 (running-session edit), docs/02 R-02 unchanged, docs/10 entry. Risk H
  (worked-minutes input), client only.

**U4-12 Session dialog: zone above the times.**
- O: Start/End (`SessionDialog.tsx:577-580`) come before "Input zone" (`587-594`); measured: fields at
  y 294, zone at 373, its hint at 417.
- Design (mockup B7): "Input zone" with its (shorter) explanation is the first field of the Time
  section; then Start and End. Tab order follows. Same in the Check out dialog? Not asked; unchanged.
- AC: DOM and visual order zone -> start date -> start time -> end date -> end time at 1440 and 390.
- Files: `SessionDialog.tsx`, `styles.css`. Tests: `day-editor.spec.ts`. Docs: docs/04:66.

**U4-13 Session dialog: "Today" and "Now" links.**
- O: `LocalTimeField.tsx:19-34` renders the two inputs only.
- Design (mockups B7, B11): a quiet link-style button under each date ("Today") and each time ("Now").
  Today sets that date to the current date in the dialog's input zone; Now sets the time to the
  current minute in the input zone (`:00` seconds, R-01 minute entry) and, when the field's date is not
  that date, the date too, so the value is "this instant". The instant comes from the device clock and
  is converted with the input zone, never the device zone (AGENTS rule 7); the server's 5-minute
  future allowance still applies. Accessible names contain the visible word ("Today, start date"),
  44px targets on touch. A change through a link counts as a typed change (drops fold/offset, marks
  the draft dirty, re-shifts suggestions like a typed start).
- AC: with a frozen clock (Playwright `page.clock`) and input zone Asia/Tokyo vs device
  America/Los_Angeles, Today/Now fill the Tokyo date/time; Save sends that local time with the Tokyo
  zone; links absent in read-only views.
- Files: `LocalTimeField.tsx`, `sessionModel.ts` (pure `nowField(zone, instant)`), `SessionDialog.tsx`,
  `styles.css`. Tests: `sessionModel.test.ts` (zones, DST edges), `day-editor.spec.ts`. Docs: docs/04:66.

**U4-14 Session dialog: break rows aligned.**
- O (root cause, measured at 1440, one-line layout, list 672px): suggested rows' time input 192.5px
  wide, the row added by "Add break" 265.6px (+73.1px); minutes 84px in both. `.break-time` is `flex: 1
  1 var(--break-time-w)` (`styles.css:4037-4039`) and `.break-info` is `flex: 1 1 auto`
  (`4100-4103`); a new row has an empty info slot (no "ends ..." and no "suggested",
  `BreakRows.tsx:176-179`), so its time input takes the free width.
- Design (mockup B7): fixed column slots in the one-line layout: `Break n` | date (when shown) |
  time `flex: 0 0 var(--break-time-w)` | minutes | info `flex: 1 1 auto` | remove; the info slot always
  renders ("ends --:--" until the row resolves). `--break-time-w` is re-measured so "12:00:00 AM" with
  the picker icon is not clipped in en-US (the reason the time was allowed to grow).
- AC: in rows, two-line and chip layouts, every row's time and minutes inputs have equal x and width
  (±0.5px) whatever the origin (saved, suggested, new) or info text; no clipped time text
  (`scrollWidth <= clientWidth`) at 1440, 768 and 390.
- Files: `styles.css`, `BreakRows.tsx`. Tests: `day-editor.spec.ts` (and the same check in the Check
  out dialog, which shares `BreakRows`). No server impact.

**U4-15 Session dialog: save errors in their own alert dialog.**
- O: errors are paragraphs at the end of the scrolling body (`SessionDialog.tsx:643-654`). Measured:
  desktop 1440x1000, the row-error summary at y 962-984 while the body's visible bottom is 885 (77px
  below the fold); a server error (overlap) at 879-901 (cut by the footer edge); phone 390x844, the
  server error at 1091 while the visible bottom is 775 (316px below the fold).
- Design (mockups B7, B11): a failed save (server refusal, network, a non-row validation message, or
  row errors) opens an alert dialog "This session was not saved" with the message (row errors listed
  by "Break n"), one OK button (initial focus; Escape = OK). On close focus goes to the first marked
  row or field (scrolled into view), else the Save button. Inline row and field markers and the DST
  prompts stay. The confirmation is already closed at that point, so it is still one modal on top.
  Stale version keeps its existing reload flow. Recommended to reuse the same alert in the Check out
  dialog (same components) only if the coordinator agrees; the owner named the session dialog.
- AC: overlap, future-time, work-date-mismatch and network failures each show the alert at 1440 and 390
  with the message fully in view; after OK focus is on the marked row or Save; no `p.error` remains at
  the end of the dialog body; axe clean; a new `AlertDialog` (or a one-button `ConfirmDialog` variant).
- Files: `SessionDialog.tsx`, `ConfirmDialog.tsx` or new `AlertDialog.tsx`, `styles.css`. Tests:
  `day-editor.spec.ts`. Docs: docs/04:67-68. No server impact.

### B. Settings export and import

**Inventory (O, from schema, routes and config).**

| Setting | Where it lives | Who changes it |
|---|---|---|
| Work policy: required minutes, N, M, reference start/end, break rules, deficit mode | `work_policies`, append-only effective-dated versions (`0001_initial.ts`, `POST /api/policies`, preview `POST /api/policies/preview`) | the owner (Settings › Personal); private (docs/03:34) |
| Submission: To/Cc recipients, subject and body templates, auto-submit and its effective instant, show OT on PDF, reminder offsets, automatic note line and text | `submission_settings`, append-only versions (`0004`, `0005`; `GET/POST /api/settings/submission`) | the owner; templates private, recipients visible to administrators |
| Signature image and the automatic-image authorization | `attachments` + `submission_settings.auto_image_*` (`POST .../auto-image/authorize`) | the owner; never shared or exported (AGENTS rule 4) |
| Sharing grants | `timesheet_shares` | the owner grants; administrators list and revoke |
| Calendar: name, reporting zone, payroll anchor, cycle, offsets, due time | `calendars` (schedule columns immutable by trigger) | set at setup/bootstrap; never changed |
| Working weekdays, holidays and closures | `calendar_versions`, append-only (`POST /api/admin/calendar/import/preview|commit`, holiday CSV) | administrators |
| Payroll exceptions | `payroll_exceptions` (`POST /api/admin/payroll-exceptions`) | administrators |
| Users: email, display name, role, status, calendar; password hash | `users` | administrators (password: admin-set temporary, D-9 b adds self-service) |
| Automation activation instant, outbound pause, backup and retention state | `operations_state` | administrator API / operator CLI |
| SMTP host, port, security, user, password; MAIL_FROM, PUBLIC_BASE_URL, APP_ORIGINS, OUTBOUND_MODE, PRODUCTION_SENDING_ENABLED, JOB_RUNNER, DATA_DIR, DATABASE_PATH, SESSION_TTL_HOURS, TRUSTED_PROXY_ADDRESSES, COOKIE_SECURE | host environment (`config.ts:50-199`); not stored in the database | the operator |
| Theme | browser `localStorage` key `timesheet.theme` | the person, per device |
| Display zone | the device zone (not stored); input zone is per session (data) | n/a |
| "Show details" switch | not stored | n/a |

Not settings (never in the file): days, sessions, breaks, leave, notes, OT ledger and opening balance,
leave requests, revisions, PDFs, deliveries, audit events.

**Design, posed as owner questions** (recommendations; F-3 and F-4 ask the two that need the owner).

- Scope (F-3). (a, recommended) Personal: each person exports/imports their own work policy,
  submission settings (without signature and image authorization) and, optionally, the device theme;
  plus, for administrators, a separate "company calendar" file (weekdays, holidays and closures per
  year, payroll exceptions). (b) Personal only. (c) Everything including accounts. Users and accounts do
  not count as settings: accounts need an administrator's act, passwords are never exported, and moving
  a whole installation is the job of the backup and restore tools (docs/07, runbook sections 4-8).
  Pro (a): covers "set up a new colleague like me" and "carry the holiday list to next year/another
  install"; no new server route (it composes `GET /api/policies`, `GET /api/settings/submission`,
  `GET /api/calendar` and the existing write and preview routes). Con: two files.
- Secrets. The app stores no SMTP secret (environment only), so the file cannot contain one; password
  hashes, session tokens, the setup token, the signature image and the automatic-image authorization
  are never included (the authorization is an explicit audited act and must be given again). No
  option is needed; recommended as stated.
- Format. JSON `{ "format": "timesheet-settings", "schema_version": 1, "app_version": "0.1.0",
  "exported_at": "<UTC>", "scope": "personal" | "company", "data": { ... } }` with snake_case keys equal
  to the API bodies; unknown `format`/`schema_version` or unknown keys are refused before any preview;
  file name `timesheet-settings-<date>.json`. Recommended without a question.
- Import behaviour (F-4). Always preview first: parse and validate in the browser, then show a diff
  "Now / In the file" per group (mockup B10), then one confirmation. Each group is replaced as a whole
  by a new version through the existing route (append-only history; nothing is overwritten or
  merged field by field): the work policy with an explicit "applies from" date (default the next
  period start; earlier days keep their policy, R-07; the existing policy preview lists the draft days
  that change), the submission settings with `expected_seq` (stale -> reload). Automatic submission is
  never switched on by a file alone: a separate tick, unticked by default; `apply_to_overdue_drafts` is
  never imported. Ownership: personal files only write the signed-in person's settings (the existing
  routes take the owner from the session; no share path); a company file is offered to administrators
  only and goes through the existing holiday-import preview and commit (merge rule unchanged, effective
  date, finalized-period conflicts shown) and payroll-exception route. Audit: the existing per-route
  audit events, with the policy note "Imported from settings file <name>". Missing references: a
  personal file references nothing; a company file is applied to the administrator's chosen calendar
  and is refused if its reporting zone or payroll schedule differs (immutable, `calendar_in_use`
  semantics). Theme is applied to this device only.
- Privacy and AGENTS rule 4: the file holds recipient addresses and templates (settings, not timesheet
  data) and is created and read only in the person's browser; the screen says "Keep it private"; no
  timesheet data, balances, signatures or credentials; tests use synthetic `example.invalid` data and
  no exported file is committed.

**AC (scope a).** Export produces a file that validates against the schema and contains no key outside
the allowlist (static test over a synthetic account with a signature, an authorization, sessions,
ledger entries and shares); import of an exported file into a second synthetic account shows a diff,
writes exactly one new policy version and one new submission-settings version after confirmation, with
auto-submit off unless ticked, and nothing without confirmation; a tampered file (unknown key, wrong
version, invalid time, foreign zone in a company file) is refused with a message and writes nothing;
an employee never sees the company file controls and the server still refuses the admin routes.

**Files.** New `src/client/components/settingsFileModel.ts` (pure build, validate, diff),
`SettingsTransfer.tsx` (export button, file input, preview dialog), `SettingsScreen.tsx`, admin
calendar part in `AdminScreen.tsx`/`HolidayImport.tsx`, `styles.css`. Tests:
`tests/client/settingsFileModel.test.ts`, `tests/e2e/settings-transfer.spec.ts`. Docs: docs/04
Settings row, docs/03 (no new record; note the file is client-side), docs/10 entry, docs/12. No server
change; risk M (privacy, automation flag), size M.

### C. The pilot-decision changes (owner answers of 2026-10-20)

- **D-5 a (correction to a net zero).** O: `correctOpeningBalance` validates the target with
  `assertOpeningMinutes`, which refuses 0 (`ledger.ts:575-579, 668`); the DB only forbids a zero delta
  (`0013_ot_opening_balance.ts:40`), so a correction of -current is storable. Change: accept a target of
  0 in the correction only (the first posting stays non-zero); delta = -current; `unchanged` when
  already 0. Client: `OpeningBalanceForm.tsx` allows 0 in correction mode. Tests:
  `opening-balance.test.ts` (new: correction to 0 posts one correction, balance back, history kept;
  existing first-post zero refusal stays), drill stage 6 unchanged unless it asserts the refusal (it
  does not; `container-drill.mjs` has no net-zero check). Docs: docs/03:48, docs/07:46, docs/11 §10
  step 4, docs/12:82, docs/10 entry, pilot packet §8 (EN/VI). Size S, server, risk H (ledger).
- **D-6 a (at most 20 uncommitted previews per person).** O: `previewImport`
  (`workbookImport.ts:495-530`) inserts without a count; previews are immutable and cannot be deleted
  (`0012_imports.ts` triggers). Change: inside the write transaction, after the idempotency lookup
  (a re-upload of the same file returns the existing batch) and before storing the file, count
  `state = 'preview'` rows of the owner; at 20 refuse 409 `import_preview_limit` ("Commit or finish one
  of your 20 open previews first"). Note: the only way to clear a preview is to commit it (all days may
  be skipped); recorded for the docs. Tests: `workbook-import.test.ts` (20 synthetic previews, the 21st
  refused with nothing stored, duplicate still returns 200, another user unaffected), `import.spec.ts`
  message. Docs: docs/07:46, docs/11 §10, docs/12:83, docs/10, pilot packet. Size S, server, risk M.
- **D-9 b (self-service change-password route).** New `POST /api/auth/password` (session user only;
  not in `SHARED_ROUTES`; origin check applies as for every write). Body `{ current_password,
  new_password }` (zod, max 256). Rules: current verified with `verifyPassword`
  (`passwords.ts:41-50`); a wrong current password is 403 `current_password_incorrect` (not 401, which
  the client treats as a lost session) and counts on the existing `LoginRateLimiter` under the key
  `password:<user id>` per client address (5 failures/15 min -> 429 with Retry-After); new password
  12-256 characters (`isAcceptablePassword`, 422 `weak_password`), different from the current one (422
  `password_unchanged`). Effects in one transaction: new hash, `updated_at`, all other auth sessions of
  the user revoked (new `revokeOtherAuthSessions(db, clock, userId, keepSessionId)` beside
  `revokeAllAuthSessions`, `sessions.ts:83-87`), audit `auth.password_change` with
  `sessions_revoked` and no secret. The admin temporary password (E-11) stays. UI: Profile page
  (`ProfileScreen.tsx`, `#/settings/profile`) gets a "Change password" card (mockup B9) with
  `autocomplete="current-password"/"new-password"`, confirm field checked in the browser, success
  notice. Tests: new `tests/integration/password-change.test.ts` (success; other sessions revoked and
  this one kept; wrong current 403 then 429; weak and unchanged 422; unauthenticated 401; foreign origin
  403; no `/api/shared/...` route; audit and logs contain no password or hash), `settings-routes.spec.ts`
  or new `profile.spec.ts` (form, errors, success). Docs: docs/03:20 and §API, docs/04:13 (Profile no
  longer read-only), docs/10 (E-11 note, D-9 b), docs/11 §3 step 5, docs/12:75, pilot packet §8. Size M,
  server, risk H (authentication).
- **D-15 b (per-date counts restored in the holiday preview).** History: WP2-AUDIT-A finding WP2-A-01
  (Medium, privacy) showed that the administrator's holiday-import preview revealed per date how many
  employees had day entries (fields `default_labelled_entries` and `explicit_overrides_preserved`,
  `holidayImport.ts:191-227` then); WP2-FIXA removed them and made `finalized_conflicts` date-only,
  rechecked by WP2-AUDIT-A2..A4; F-Q6 (re-asked in WP3, D-15) kept it. Restoring means re-adding the
  per-date counts to `previewHolidayImport` and `HolidayImport.tsx`, flipping the regression test
  "answers identically whether or not employees have day entries" (`holiday-import.test.ts:232-248`),
  and changing docs/03:34 (administrators see no timesheet details), docs/10:139 and docs/12:84.
  Privacy note: in a team of a few people a count of 1 identifies a named colleague's recorded days
  without an audit trail; this contradicts docs/03:34 and the docs/06 privacy gate, which is why F-2
  asks the owner to confirm before any code. Size S-M, server, risk H (privacy).
- **D-10 under WP5-OWN-Q1 (the F-3 rule change).** O: the opening balance is owner-only
  (`routes/ot.ts:249-299`, `ownerOnly`); an administrator never sees a personal balance (docs/03:34), so
  the coordinator's option text "owner or administrator" would itself contradict the privacy rule; the
  schema requires on the opening entry a non-zero delta, an as-of date, a non-blank reason and a
  non-null `evidence_ref` (`0013_ot_opening_balance.ts:40, 71-75`) and on a correction a non-blank
  reason (`:67`).
  - (i) recommended: default 0 = no entry; the owner sets it any time (first value: `POST`; later
    values: `PUT` correction, any value including 0 with D-5 a); a short reason stays required; the
    evidence reference becomes optional: blank is stored on the opening entry as the fixed text "not
    provided" (keeps the schema, no migration) and as null on a correction (already allowed); the
    as-of date defaults to the day it is set. Code: `ledger.ts` (`requiredText` for evidence ->
    optional), `schemas.ts:206-222` (`evidence_ref` optional), `OpeningBalanceForm.tsx`,
    `OpeningBalancePanel.tsx`; tests `opening-balance.test.ts` (evidence missing now accepted, stored
    text, correction to 0), drill stage 6 still passes (it sends evidence). Docs: docs/03:48 (F-3
    rewritten under AGENTS rule 8), docs/07:46, docs/10:153 plus a 2026-10-20 entry, docs/11 §10, docs/12
    lines 76 and 82, docs/01 FR-16 wording ("evidenced" -> "explicit"), pilot packet §4 row and §8
    (EN/VI). Size S-M, server, risk H.
  - (ii) no reason either: needs migration 0014 (rebuild of `ot_ledger`, the 12-step procedure of
    0013) or a fixed placeholder reason; history loses the "why". Size M-L, risk H.
  - (iii) one overwritable value: conflicts with the append-only ledger (update and delete triggers),
    needs a new table or a migration and drops the correction history; D-5 a no longer applies. Size L,
    risk H. Not recommended.
  - All options: no historical workbook import for the pilot (pilot packet, docs/12:76).
- **Documentation-only answers** (docs/10 one 2026-10-20 entry; docs/12 "Known limits" lines;
  pilot packet §0 and §8 and the matching rows, EN and VI): D-1 a (keep `JOB_RUNNER=off` until
  reconciliation; docs/12:88 and runbook §8/§15 "Owner decision (a)"), D-7 a (at-least-once reminders;
  docs/05 and docs/12), D-8 a (TLS failures stay temporary: retries, then intervention; docs/12:60
  "Owner decision (a): kept and documented", runbook §13 first check after a certificate or host
  change), D-11 a (tracked packet with placeholders, private owner copy), D-12 a (staged first
  activation), D-13 a (the NAS, NOT VERIFIED until ticked), D-14 b (first release declared after the
  pilot period: until then commits stay on `main` under the docs/08 rule; packet §0 "Release
  declaration" and §9 checkbox reworded; `git.release_declared` stays false through the pilot), and the
  unchanged defaults D-2 a, D-3 a, D-4 a recorded as decided. The packet's "All fifteen are still
  pending" sentence (§8) is replaced by the answer table. Size S, docs only.

### D. Mockup

`handoff/delivery/design/WP5-UX4/mockup.html` (copy of the round-3 head plus round-4 tokens and boards;
captions in Vietnamese, UI text in English; synthetic data; system fonts; no script; no network) and
11 renders: `mockup-b1-timesheet-paper-1440-synthetic.png` (title gap, paper, round switch, rename;
light and dark), `-b2-timesheet-paper-390-` (full-bleed paper), `-b3-review-paper-1440-`,
`-b4-controls-` (switch states, select arrow, checkbox centring before/after), `-b5-panel-beside-floating-`
(push drawer at 1440, non-modal overlay at 1280, square edge corners, click another column),
`-b6-floating-rule-` (rule and measurements), `-b7-session-dialog-` (zone on top, Today/Now, aligned
rows including an added row, error alert), `-b8-running-session-edit-`, `-b9-change-password-`,
`-b10-settings-export-import-`, `-b11-phone-session-dialog-`. Render checks (`render2.json`): title
gap 24px; paper contains tools, form head, 2 weeks, signatures, not the h1 or period card; radius 0;
weeks without shadow; switch track and thumb radius 999px, thumb 18x18; select padding-right 34px,
arrow 12px from the edge, no `url()`; checkbox delta 0px proposed vs 6.1px "now" drawing; drawers 0px on
the edge side, 12px toward the sheet, flush with edge and bottom; four break rows aligned (time 118.4px
each); zone above the times; no frame overflows.

### E. Slicing and gates

One source writer at a time; each slice ends in its own freeze (fix -> freeze commit by
timesheet-committer). GOV paths touched: none (no change to AGENTS, CLAUDE, docs/08, prompts,
templates, `.claude/`, `.agents/`, validators or `scripts/precommit-check.mjs`).

| Slice | Content | Owned paths (main) | Server/API | Size, risk | Depends on |
|---|---|---|---|---|---|
| UX4-T01 | U4-02, U4-03, U4-04, U4-08, U4-09, U4-10 (tokens, paper, switches, selects, checkboxes, rename) | `styles.css`, `TimesheetScreen.tsx`, `TimesheetSheet.tsx`, `ReviewDays.tsx`, `ShowDetailsSwitch.tsx`, `SharingItemsFields.tsx`, `DayFieldsForm.tsx`, e2e specs named in A, docs/04 (+vi) | no | M, M | F-5 (mockup) |
| UX4-T02 | U4-05, U4-06, U4-07 (drawer, non-modal floating, content-based rule, discard guard) | `DayEditor.tsx`, `TimesheetScreen.tsx`, `SheetWeekTable.tsx`, `DayFieldsForm.tsx`, new `editorLayoutModel.ts` + test, `styles.css`, `day-editor.spec.ts`, `keyboard-access.spec.ts`, docs/04, docs/10 (+vi) | no | M, M (a11y) | T01 |
| UX4-T03 | U4-11..U4-15 (running edit, zone first, Today/Now, aligned rows, alert dialog) | `SessionDialog.tsx`, `LocalTimeField.tsx`, `BreakRows.tsx`, `sessionModel.ts`, `breakRowsModel.ts`, `dayEditorModel.ts`, `SessionList.tsx`, `ConfirmDialog.tsx`/`AlertDialog.tsx`, `styles.css`, unit tests, `day-editor.spec.ts`, `clock-out-breaks.test.ts`, docs/04 (+vi) | no (client only) | M, H (worked-minutes input) | T02 (shares styles) |
| UX4-T04 | Server slice: D-9 b route, D-5 a, D-6 a, D-10 per WP5-OWN-Q1 answer, D-15 per F-2 answer, optional shared clock guard | `src/server/routes/auth.ts`, `auth/sessions.ts`, `http/schemas.ts`, `services/ledger.ts`, `services/workbookImport.ts`, `services/holidayImport.ts`, `services/timesheetCommands.ts` (guard), `ProfileScreen.tsx`, `OpeningBalanceForm.tsx`/`Panel.tsx`, `HolidayImport.tsx`, `ImportScreen.tsx`, integration tests named in C, e2e profile/import/admin | **yes** (new route, ledger, import, privacy) | M, H | WP5-OWN-Q1 and F-2 answers; can run before T01-T03 |
| UX4-T05 | U4-01 settings export/import (client) | new `settingsFileModel.ts`, `SettingsTransfer.tsx`, `SettingsScreen.tsx`, admin calendar part, tests | no (scope a) | M, M (privacy) | F-3, F-4; after T04 (shares Settings/Profile screens) |
| UX4-T06 | Docs: docs/02 (none expected), 03, 05, 07, 10, 11, 12 (+vi), pilot packet §0/§4/§8 (+vi), D-1..D-15 record | docs and `handoff/delivery/WP5_PILOT_PACKET*.md` | no | S, L | T01-T05 |

Order: T04 (server, as soon as the two answers arrive) -> T01 -> T02 -> T03 -> T05 -> T06; T01 may start
before T04 if the answers are late (no shared paths except `styles.css`, which T04 does not touch).

Package-final gate (verifier): gate item 1 in full on a clean export (npm ci, lint with no deprecation
line, verify, real-clock full e2e on both projects, AC-13 x3 plus Tokyo and New York, drill `--wp3`
including stage 6, npm audit, validators, precommit self-test); identity: every changed path maps to a
slice; `dist/server` and `dist/domain` diff limited to T04's files; simulated-clock FULL runs at a
window day and a DST change; round-specific checks: the AC of A, B and C (switch/select/checkbox scan,
paper containment and phone budget, beside/floating sweep around the computed need, keyboard scan for
fully covered focus, running-session edit then Check out oracle, Today/Now under Asia/Tokyo with a
frozen clock, alert dialog in view at 1440 and 390, password route matrix, preview quota, opening
balance correction to 0, holiday preview per the F-2 answer); full axe scan both themes; contrast of
new tokens; CSP unchanged with no violations; main chunk under the 500 kB advisory.

Audits (fresh opus, never an author): A visual and shell (U4-02..U4-10, U4-12..U4-15 look and a11y,
mockup fidelity, docs/04); B data, security, settings and sessions (U4-11 business effects and the
shared-clock note, U4-01 file content and import writes, D-9 b authentication, D-5/D-10 ledger, D-6
import, D-15 privacy, docs/03/07/10/11/12 and the packet); then the integration pass whose PASS
re-accepts WP5.

Dispatch estimate: 6 slices + 6 freezes + 1 gate + 2 area audits + 1 integration audit = 16, plus a
typical 2-4 for one fix round and its freeze, regate and recheck: about 18-20 dispatches. The minimum
saving available: merge T01-T03 into one UI writer (fewer freezes, larger risk per audit) -> about 14.

### F. Owner questions

- **F-1 (WP5-OWN-Q1, sharpened by the code).** Opening OT balance: (i, recommended) starts at 0 with no
  entry; only you (an administrator never sees a personal balance) set or change it any time; each
  change is a ledger entry with a short reason; evidence optional (blank recorded as "not provided"); a
  correction back to 0 allowed (D-5 a). Pro: keeps history, no schema migration. Con: one short reason
  per change. (ii) the same without a reason: needs a ledger migration or a dummy reason; history loses
  the why. (iii) one value overwritten in place: needs a new storage model, loses history, conflicts with
  the ledger. Also confirm: no historical workbook import for the pilot (recommended).
- **F-2 (D-15 b contradiction).** Restoring per-date counts in the administrator's holiday preview shows,
  per date, how many people recorded work; in a small team this reveals a named colleague's days, which
  contradicts the privacy rule "administrators see no timesheet details" (docs/03) and an earlier audit
  fix (WP2-A-01). (a, recommended) keep the counts removed (D-15 a); (b) restore exact counts and write an
  explicit exception into docs/03 with an audit event per preview; (c) restore counts only when 3 or more
  people are counted, else "fewer than 3". Pro (b): the administrator sees the impact; con: privacy.
- **F-3 (export/import scope).** (a, recommended) your own settings (work policy, email and reminders,
  PDF options, theme), plus a separate company-calendar file for administrators (holidays, closures,
  payroll exceptions); (b) your own settings only; (c) everything including accounts. Never in any file:
  timesheets, balances, passwords, signatures, SMTP secrets. Pro (a): covers onboarding and next year's
  holidays with no server change; con: two files. Moving a whole installation uses backup and restore.
- **F-4 (import behaviour).** (a, recommended) preview with a Now/In-the-file comparison, then each group
  is saved as a new version (nothing overwritten), the work policy from a date you choose, automatic
  submission only with a separate tick; (b) apply immediately without preview; (c) merge field by field.
  Pro (a): safe and auditable; con: one more step.
- **F-5 (mockup approval).** `handoff/delivery/design/WP5-UX4/mockup.html` (11 renders): (a) approve as
  drawn: square paper with 16px padding, 24px title gap, round switches, CSS select arrow, the side panel
  as an edge drawer (square edge-side corners) that floats without locking the page and is pushed beside
  the sheet from about 1330px; (b) approve with changes (say which). Recommendation: (a).

### Final checks (2026-10-20)

- Nothing left running: the probe's server was stopped through its child handle (`server killed:
  true`); render scripts close their browsers; no server on 49330-49349 was started outside them.
- Repository writes: this Results section and `handoff/delivery/design/WP5-UX4/` (mockup.html and 11
  `*-synthetic.png`). `git status --short` shows only those plus the coordinator's existing records.
- Slips: one read-only command piped into `head` (`grep ... | head -5 > csp2.txt`, against the runtime
  rule; no effect), noted for the record.
