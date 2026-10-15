# WP5-UX3-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-PLAN; package WP5; kind plan;
  attempt 1; no task dependency. WP5 is accepted on a643794 (WP5-UX2-AUDIT2 PASS); this
  task opens the owner-requested UI change round 3 before pilot activation.
- Baseline: the board's last commit is b1bf1479ba51f2df0d888fca232a1cb71f47c9e8
  (WP5-UX2-ACCEPT, handoff-only). The accepted source is
  a6437943403fc416240fd13a787a8c4748af3e84 with source digest
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files). The
  coordinator's records written after WP5-UX2-ACCEPT are probably uncommitted, or the owner
  may have committed them himself (this happened before, for example 834b9fc). Step 0
  reconciles this, read-only.
- Routing: size L, risk H (U-21..U-25 change how breaks are entered and confirmed; breaks
  feed worked minutes and OT credit, a docs/08 risk-H input), novelty yes (identity menu,
  a session dialog, a new style system). Profile timesheet-planner (effort high, fixed by
  the profile); requested model opus; `model_override_reason` size_risk (docs/08 row
  "Package decomposition" uses opus for package-scale plans).
- Record in English (the mockup captions are the only Vietnamese text). Begin your returned
  result with 'Self-reported model: ...'. This is a long task: append your Results in
  coherent steps (Step 0 first, then each section as it is finished), not only at the end.

## Owner request (chat, 2026-10-15)

The Vietnamese text is recorded verbatim in the board `owner_decisions` (last entry). English
translation, numbered for traceability. "Timesheet page" unless stated otherwise.

General

- U-01 Do not force the industrial-standard style theme; this is not an industrial app. Use
  a modern style. (This reaches the AGENTS.md section "Unified Frontend & UI/UX
  Standards", which requires "High-End Industrial Polish", 4px corners and 300 ms ease-out
  transitions, and owner decision E-8 of 2026-10-03 in the board `owner_decisions`.)
- U-02 Raise the contrast between the page background and the cards, boards, panels and
  sheets a little. Above all the week sheet should stand out more; a shadow or something
  else that looks good.
- U-03 Redesign the user name in the top bar: the avatar is right-aligned; the name block
  has two lines, right-aligned before the avatar: line 1 the user's display name (full
  name, for example "[name]") in bold; line 2 the email in small text, in a dark colour
  ("màu tối"; interpret for both themes and show it in the mockup).
- U-04 Clicking the avatar opens a menu with a few items such as the dark/light toggle,
  Profile, Settings and Sign out.
- U-05 The main-menu items "Settings" and "Admin" move into that menu; "Administration"
  becomes a sub-page or tab inside the Settings page.

Large screens

- U-06 Where is the "Semiconductor Services, Inc." text beside the logo? The mockup has
  it, but the real app does not show it. (Explain why with measurements, and make it
  visible on common desktop widths.)
- U-07 Move Check in/out and its "checked in since" time onto the same row as the page
  title, right-aligned.
- U-08 Remove the user name under the page title.
- U-09 The period pills "old", "current" and "future" are fine in dark mode, but in light
  mode they look like one colour. New rule: "old" keeps its current hue but must be easier
  to see in light mode; "current" keeps its current hue but must be easier to see in light
  mode; "future" becomes pink and must be easy to tell apart in both modes.
- U-10 Lay out "Payroll date Fri 10/30/2026", "Due Tue 10/27/2026, 17:00
  (America/Los_Angeles)" and "Times in America/Los_Angeles" on one row when there is room,
  wrapping to further rows when there is not.
- U-11 The "Open a day" title goes on the same row as its date picker.
- U-12 "Show details" sits tight against "Change several days"; separate them sensibly.
- U-13 The column open in the Day editor: remove the thick underline under the "Day" cell
  and give the "Day" cell a background colour instead. The two blue rails on its sides
  may use another colour, so it is easy to tell apart from the columns selected with
  "Change several days".
- U-14 Columns selected with "Change several days": instead of today's heavy frame, raise
  them with a light shadow, as if the selected cells "float" up. Use the same effect for
  the column open in the Day editor, which in addition has a thin blue border showing it
  has the focus.
- U-15 Row "Label": is the word "Label" accurate? Is there a more suitable word?
- U-16 Row "Check": does it check or uncheck "[ ] No times"? If not, would "State",
  "States" or "Status" be more correct?

Narrow screens

- U-17 If, after "Review & sign off" has been shortened to "Sign off", the three period
  buttons still do not fit on one row, shorten "Current period" to "Current".
- U-18 Hide the "Open a day" text when the title, the date picker and the "Open day"
  button do not all fit on one row.

Day editor panel

- U-19 The note "Accounting date 2026-10-12 in the reporting zone America/Los_Angeles.
  Times below are typed in an input zone you choose; they are shown in
  America/Los_Angeles elsewhere. Period: future." is too long and takes space. Make it
  short, or remove it.
- U-20 Design the panel header to stand out more from the panel body.
- U-21 Move new/edit time session into a separate dialog. The panel only shows the chosen
  times and breaks. The break list is a table, one row per break: start date, start time,
  break minutes (no break end date or time needs to be entered).
- U-22 Deleting a time needs a clear confirmation message, not the current swap of the
  "Delete" button into "Confirm delete".
- U-23 In the times/breaks dialog, pre-fill the default times (the Start/End times set in
  Settings), and also the suggested breaks when the day is in the past.
- U-24 Redesign the break area (not confirmed / confirmed / no breaks, and adding,
  removing and editing breaks) so a new user finds it easy. For example: one checkbox
  "Confirm no breaks taken", the break list, and the buttons "Suggest breaks" and "Add
  break". One row per break (for example: Break 1 [mm/dd/yyyy <icon>] [hh:mm AM/PM
  <icon>] [placeholder "total mins"] [X]), wrapping only when there is not enough room,
  with rows that are easy to tell apart.
- U-25 The dialog has "Save" and "Cancel"; Save also counts as confirming.
- U-26 Always show a confirmation message before Save, and on Cancel when there is
  modified data.
- U-27 Label and leave area: put the "Worked from home (WFH)" checkbox on the same row as
  the "Label" combo box.

## Hard rules

- No edits to application source, tests, docs, configuration, governance files (AGENTS,
  CLAUDE, profiles, docs/08) or shared state (board, STATE.json, NEXT_ACTION,
  checkpoints). Write only the owned paths below. No commit, push, install or dependency
  change. No `git add`, `git stash`, `git checkout`, `git restore`, `git reset`, `git
  clean` or any other index or working-tree change.
- NO STDIN SCRIPTS: NEVER feed a script to python or node through stdin (no `-`, no
  heredocs, no `| node`, no `| python`, no `cat <<`). Earlier agents left looping
  background tasks this way. Write any probe to a file in the temp folder and run that
  file. Do not call python at all unless you run an existing script file.
- Never use cmd.exe (with or without /c) or an interactive shell. Run npm/node from Git
  Bash with Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
  Record `node --version` (must be v24.x). Never kill processes by PID. NEVER pipe output
  into head or tail and never redirect to /dev/null; redirect to a file in the temp folder
  and read that file. Never use `rm -rf`.
- Raw command output goes only to `D:\.claude-tmp\timesheet\WP5-UX3-PLAN\` (create it).
  Never create files in the repository root, at a drive root or anywhere else outside the
  owned paths and that temp folder. Copy into the repository only masked material:
  user-profile paths as `<user>`, emails as `<email>`. In task records never write an
  email address with its at sign; write `<email>` or "a synthetic example.invalid
  address". In the mockup HTML use only complete synthetic addresses on the reserved
  domain `example.invalid` and synthetic names (never the owner's name).
- Do not touch `B:\Temp\claude` or any Claude session folder.
- Running the app is recommended for measurements. If you do: build first if `dist/` is
  older than the last client edit; a fresh database under the temp folder with BOTH
  `DATA_DIR` and `DATABASE_PATH` set explicitly there; the documented synthetic `npm run
  seed` path; ports from 48520-48529 only; local mail capture only; a self-closing script
  that stops its own server (no PID kills). Screenshots are synthetic only and their
  basenames must contain `synthetic` (precommit privacy rule). Give each parallel browser
  run its own output folder.

## Step 0: read-only reconciliation (record it first under Results)

- `node --version`.
- `git rev-parse HEAD`, `git status -sb` (branch line with ahead/behind against the local
  `origin/main` ref; no fetch needed).
- `git log --format='%H %an %ad %s' b1bf1479ba51f2df0d888fca232a1cb71f47c9e8..HEAD` and, per
  commit, its changed paths (`git show --stat --format= <sha>` into a temp file). Record
  author, message, and whether any path lies outside `handoff/`.
- `git status --short` (full list in the temp folder). In Results, group the paths under
  `handoff/` (modified / untracked counts and the main records) and list every path outside
  `handoff/` in full.
- `npm run digest` with Node 24: digest and file count; compare with 229df806 (815 files).
  If it differs, explain the cause.
- Do not stop for a difference (this task is read-only for source); report it.

## Read

- AGENTS.md and AGENTS.vi.md from disk first, especially "Unified Frontend & UI/UX
  Standards". Load the skills it names (`stitch-design-taste`, `design-taste-frontend`,
  `high-end-visual-design`, under `.agents/skills/`) with the Skill tool if they are
  available, as input only: U-01 replaces the industrial direction, so keep what serves a
  modern, friendly business app (consistency, spacing, hierarchy, accessible states) and
  say what you drop. `.agents/skills/web-design-guidelines` and
  `.claude/skills/redesign-existing-projects` are optional.
- docs/04_UX_AND_SETTINGS.md (primary, with line numbers: shell and navigation, top bar,
  Settings, Admin, Timesheet page, period bar and badges, Open a day, Show details, batch
  edit, the day editor side panel and bottom sheet, session and break entry, break
  confirmation, label picker, WFH, themes, accessibility and first-screen promises);
  docs/02 (break rules, break confirmation, suggested breaks, default times, day labels,
  WFH, leave, worked minutes); docs/05 (period states old/current/future, deadlines); docs/03
  (API contracts for sessions and breaks, user/profile fields, admin authorization, the
  content security policy); docs/06 (UI acceptance criteria, the e2e gate, AC-13);
  docs/10 (UI decisions, E-1..E-8, F-Q5, rounds 1 and 2); docs/12_RELEASE_NOTES.md;
  GLOSSARY.md.
- `handoff/delivery/WP5_HANDOFF.md` (both UI change round sections and their backlog),
  `handoff/delivery/WP5_UX2_REVIEW.md`, `handoff/delivery/WP5_UX2_REVIEW2.md`,
  `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` (AX-01..AX-10, which this round must not
  regress), `handoff/delivery/tasks/WP5-UX2-PLAN.md` (round-2 design, including the
  PLAN2-PLAN4 results on Today/Current period, the logo, the wordmark breakpoint and the
  phone header clock) and `handoff/delivery/tasks/WP5-UX2-T06.md` (why the wordmark shows
  only from its breakpoint).
- `handoff/delivery/design/WP5-UX2/mockup.html` and `handoff/delivery/design/WP5-UX/mockup.html`.
- `src/client/`: the app shell, top bar, navigation and More panel, the theme toggle, the
  brand and wordmark, the clock provider and bar clock, the Timesheet screen, the period
  bar and its model, Open a day, the sheet components (Day/Label/Check rows, editor column
  marker, batch selection), the day editor (side panel and bottom sheet: header, note,
  sessions, breaks, break confirmation, suggest breaks, delete), the label picker and WFH,
  the Settings and Admin screens and their routes, `styles.css` tokens in both themes. The
  server routes and services for sessions, breaks, break confirmation, suggested breaks,
  default times, the current user (display name, email) and admin authorization. The unit
  and e2e tests that depend on the affected roles, names, selectors and layouts, including
  the focus-ring/contrast checks, the first-screen budget checks and the calendar-safe
  seed helpers.
- The board (read-only): `owner_decisions` (the last entry is this request; also E-4,
  E-8, F-Q5 and the round-2 entries), `coordinator_decisions` (the first entry is this
  round), `pending_owner_question_2` (WP5-UX2-Q3); STATE.json WP5 `carried_risks`.

## Required output

Write the plan under "Results" in this file, and the mockup under
`handoff/delivery/design/WP5-UX3/`.

A. **Current state per item U-01..U-27.** Exact components and CSS (file:line), current
   behaviour and states, why the owner's complaint holds (measured values on the built app:
   colours and contrast ratios in light and dark, widths and breakpoints, shadows, borders),
   and the existing tests that pin the current behaviour. Separate observations (O) from
   assumptions (A). Answer the owner's factual questions directly:
   - U-06: why the wordmark is not visible on the owner's screen (breakpoint, measured bar
     widths with and without a share, the reason recorded in WP5-UX2-T06).
   - U-16: what the "Check" row shows and whether it toggles "No times" (cite the code).
   - U-15: what the "Label" row holds in the domain (day categories, holiday names), with
     candidate words and a recommendation (consider docs/02 terms, the Excel workbook's
     wording described in `reference/inputs/README.md`, GLOSSARY.md, the PDF and the
     Review screen; a rename of a visible row name only, or also elsewhere).
   - U-03/U-04: whether a display name exists in the user model and API, and whether a
     Profile page or equivalent exists.
   - U-23: whether default Start/End times exist in Settings and how "suggest breaks"
     works today (client or server, its rule, when it applies).

B. **Design per item** (concrete and implementable). Tokens as CSS custom properties in
   `src/client/styles.css` (no arbitrary literals); every relevant state (rest, hover,
   active, focus-visible, selected/checked, disabled, open) in both themes; computed
   contrast ratios proving WCAG 2.2 AA (1.4.3 text, 1.4.11 non-text 3:1 for state
   indicators and component boundaries, 2.4.7 focus visible, 2.4.11 focus not obscured,
   2.5.3 label in name, 2.5.8 target size, 1.4.1 not colour alone, 1.4.10 reflow); ARIA and
   keyboard semantics; reduced motion; desktop with the side panel (>= 1200px), the modal
   editor (< 1200px) and the phone (320-430px: 44px targets, no horizontal scroll, and the
   docs/04 first-screen budget at 390x844 in every state the round-2 tests assert). Settle
   at least:
   1. U-01/U-02 style system: the modern direction in concrete tokens (surface levels for
      page, card, panel and sheet in both themes with their contrast steps; an elevation
      scale of soft layered shadows that also works in dark; radius scale; transition
      duration and easing; typography weights). State which E-8 values change (4px radius,
      300 ms ease-out) and why. Exactly how the week sheet stands out.
   2. Governance draft: the exact replacement text for the AGENTS.md section "Unified
      Frontend & UI/UX Standards" and its AGENTS.vi.md counterpart (keep the checks that
      still apply: tokens as CSS custom properties, consistency pre-flight, accessible
      states, a shared transition token; drop the industrial and "B2B semiconductor
      hardware" wording), plus whether CLAUDE.md, docs/04 or docs/10 also need text
      changes. The governance change itself is a later GOV task; here only the draft.
   3. U-03..U-05 identity block and menu: avatar content (initials from the display name,
      no uploaded photo, no new private media), name and email truncation, both themes;
      the menu pattern (a disclosure button with a menu or a non-modal popover; keyboard,
      Escape, focus return, outside click), its items and order, where the Light/Dark
      toggle lives in it, Sign out; the phone equivalent (More panel or the same menu) and
      the first-screen budget; what the top bar shows in a grantee's shared view (always
      the signed-in user). Settings with an Administration tab or sub-page: routes, links
      and redirects for old URLs, visibility only for admins, and proof that server-side
      authorization is unchanged. Profile: what it contains (read-only display name and
      email, or more), whether it needs a server/API change; recommend the smallest
      useful scope.
   4. U-06..U-12 page header and period bar: the title row with Check in/out and the
      since-time (desktop) next to the phone header clock from round 2; the wordmark rule
      after the nav slimming (measured widths); removal of the name under the title (and
      what tells a grantee whose timesheet it is in a shared view); pill colours old,
      current, future (pink) with values and ratios in both themes, plus the decision on
      WP5-UX2-Q3 if this redesign changes it; the wrapping meta row; the Open a day row;
      the spacing token between Show details and Change several days.
   5. U-13/U-14 sheet selection: the lifted look of batch-selected columns and of the
      editor column (shadow layers across all rows of that day, header to footer,
      including detail rows; z-order with the sticky day head and the Today bar from
      round 2; how the editor column differs: Day-cell fill, rail colour different from
      the batch look, the thin blue focus border); both together on one column; hover,
      today, non-working hatching, focus ring 3:1; the phone equivalent; reduced motion;
      `aria-current`/`aria-selected` unchanged unless needed.
   6. U-17/U-18 narrow rules: the measured thresholds and the container or media queries
      for "Current" and for hiding the "Open a day" text, with accessible names keeping
      the full text (SC 2.5.3) and the field still labelled.
   7. U-19/U-20 editor panel: the short note text (or removal) and where the accounting
      date, zones and period state remain discoverable (AGENTS rule 7: never lose the zone
      meaning); the stronger header.
   8. U-21..U-26 session dialog and breaks: the panel's read-only list of sessions and the
      break table (columns, empty and unconfirmed states, edit and delete actions per
      session); the dialog structure (session start/end, input zone, the break area with
      "Confirm no breaks taken", one row per break with date, time and minutes, Add break,
      Suggest breaks, remove); how a break given as start plus minutes maps to the API
      (end computed in the input zone; DST gap and fold; breaks crossing midnight or the
      session end; validation messages); pre-fill rules (defaults from Settings for a new
      session; suggested breaks only for a past day, defined as the accounting date before
      today in the saved reporting zone as the server reports it, never the device zone);
      Save semantics (exactly what is saved and what "confirmed" means after Save; the
      confirmation prompt text); Cancel with changes; the delete confirmation dialog;
      nested-dialog focus and Escape rules (the B3-01 lesson); the phone layout; 12-hour
      versus 24-hour input display (the owner's example shows "hh:mm AM/PM", E-4 chose
      24-hour as on the PDF; native time inputs follow the browser locale): recommend.
   9. U-27 WFH on the Label row (desktop, modal and phone widths).

C. **Canonical rules (AGENTS rule 8).** For U-21..U-26 and U-23 especially: quote every
   canonical rule (docs/02, docs/03, docs/04, docs/10, GLOSSARY) about break entry, break
   confirmation, suggested breaks, default times, unconfirmed break lists at Check out
   (the WP1 carried risks in STATE.json) and deletion. For each owner item say whether it
   is compatible, needs a wording change, or contradicts a rule; for a contradiction give
   the exact proposed rule text (EN and VI), its effect on worked minutes, OT credit,
   review warnings and sign-off, and any server or API change it needs. Do not resolve a
   contradiction silently.

D. **Mockup.** One self-contained static HTML file
   `handoff/delivery/design/WP5-UX3/mockup.html` (inline CSS with the proposed token
   values; no network fonts, scripts or CDN; synthetic data only; readable when opened from
   disk; the wordmark may reuse the outline markup already in the source). Light and dark
   for every artboard. At least: desktop 1280px and 1440px top bar with the identity block
   and the open menu; the Timesheet page header row with Check in/out; the period bar with
   the three pills side by side; the meta row wide and wrapped; the Open a day row; the
   sheet with two batch-lifted columns, the editor column and a column that is both; the
   Day editor panel with the new header, short note, session list, break table and the
   WFH row; the session dialog with three break rows and the no-breaks checkbox; the
   delete and save confirmations; Settings with the Administration tab; phone 390px and
   320px for U-17/U-18 and the menu. A short owner-facing caption per artboard in
   Vietnamese. Synthetic PNG renders (basename contains `synthetic`) of the main artboards
   in both themes if the existing Playwright install can render the file locally without
   network.

E. **Docs impact.** Exact docs/04 sections and lines to change (EN and VI); docs/02 or
   docs/03 if a rule changes; docs/10 entries (this request, any rule change, the E-4/E-8
   relation); docs/06 if an acceptance criterion or the gate wording changes; docs/12;
   GLOSSARY if a term changes.

F. **Tests.** Per item, the unit and e2e checks to add or change (both Playwright
   projects, both themes, contrast checks in the pattern of the existing focus-ring check,
   menu keyboard behaviour, dialog focus and Escape, confirmation prompts, the break
   start-plus-minutes mapping including DST and midnight, the past-day rule on the
   server-reported date, admin visibility and the unchanged server authorization, the
   first-screen budget). Existing assertions that must change: list each and show why the
   change is not a weakening. Every new e2e check must pass on every day of the year and at
   every time of day (derive dates from the server-reported today and the displayed
   period, never the device clock); name the simulated-clock instants for the gate.

G. **Owner questions.** Only genuine choices without a safe default inside the contracts,
   each with options and a recommendation, and the slices each one blocks. Include the
   mockup approval as one item (the owner confirms the modern direction from the mockup),
   and the rule changes from section C if any. Everything else is a recommended default
   that the coordinator may adopt (AGENTS rule 2).

H. **Slicing.** Bounded tasks: one GOV task for the AGENTS.md/AGENTS.vi.md text (package
   GOV, with its own freeze, gate and fresh audit, ordered before any slice that applies
   the new style), then WP5-UX3-T01, ... (one source writer at a time, each followed by a
   freeze commit), each with size, risk, novelty, profile and model per docs/08, exact
   owned paths (source, tests, docs EN and VI), dependencies including the owner answers
   it waits for, the tests it must add or update, and its freeze point. Prefer slices of
   size M or smaller. State every server/API change (name the files) and how the gate will
   bound it (dist/server diff against a643794). Name the package-final gate (verify, lint
   `no-deprecated`, full e2e on both projects on the real clock plus a simulated-clock
   sweep, AC-13 in two zones, contrast in both themes and with the manual override, 44px,
   no horizontal scroll and the 390x844 first-screen budget, the container drill for the
   release image, the server boundary) and what the fresh independent audit must
   re-check (owner fidelity of U-01..U-27, rule changes, break and worked-minute integrity,
   admin authorization, no WCAG 2.2 AA regression of the AX and round-2 items, zone
   semantics, test strength), and whether it should be split into two areas.

I. **Optional backlog.** Carried items (STATE.json WP5 carried risks, for example
   R-B7-1, R-UX2A-3, R-UX2A-4, R-UX2A2-1, R-UX2A2-3) that touch the same components;
   recommend include or exclude for each (default exclude unless the same lines change
   anyway).

## Owned paths

- `handoff/delivery/tasks/WP5-UX3-PLAN.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX3/` (mockup and synthetic renders)
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX3-PLAN\` (outside the repository)

## Acceptance for this task

- Step 0 recorded from actual command output (HEAD, branch line, status, commits after
  b1bf147, digest).
- Sections A-I present; every observation cites file:line or evidence; contrast values are
  computed (state the formula or tool used); every U item appears in A, B and H.
- Privacy: before returning, scan your own new files for at signs outside
  `example.invalid` addresses and for user-profile paths, and record the result.
- No file changed outside the owned paths: record `git status --short` at the end and
  compare it with Step 0.
- The digest at the end equals the Step 0 digest.

## Results

(append below)

### Step 0: read-only reconciliation (2026-10-15)

Commands ran from Git Bash with portable Node 24 first on PATH; raw output is in
`D:\.claude-tmp\timesheet\WP5-UX3-PLAN\` (`step0.txt`, `status-start.txt`,
`b4d9dd8-stat.txt`, `b4d9dd8-names.txt`, `digest-start.txt`). All exits 0.

- `node --version`: v24.21.0.
- `git rev-parse HEAD`: b4d9dd87fd47531ff84eba40189153ab83562677.
- `git status -sb` branch line: `## main...origin/main` (no ahead/behind against the local
  `origin/main` ref, so b4d9dd8 is already on the local origin ref).
- Commits after b1bf147 (`git log --format='%H %an %ad %s' b1bf147..HEAD`): one commit,
  `b4d9dd87fd47531ff84eba40189153ab83562677 huysrc Thu Oct 15 12:02:55 2026 -0700
  chore(handoff): return the mission to software_ready after WP5-UX2`. Changed paths
  (`git show --stat`): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/evidence/WP5-UX2-ACCEPT/checks.txt`,
  `handoff/delivery/evidence/WP5-UX2-ACCEPT/commit-message.txt`,
  `handoff/delivery/tasks/WP5-UX2-ACCEPT.md` (6 files, +76/-19). No path outside
  `handoff/`. This is the owner-committed coordinator record the brief anticipated (same
  pattern as 834b9fc).
- `git status --short` (6 entries, all under `handoff/`): modified 5
  (`handoff/NEXT_ACTION.md`, `handoff/NEXT_ACTION.vi.md`,
  `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md`); untracked 1
  (`handoff/delivery/tasks/WP5-UX3-PLAN.md`, this brief). Paths outside `handoff/`: none.
- `npm run digest`: `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3
  (815 files, handoff/ excluded)`; equal to the accepted a643794 digest (229df806, 815
  files). No source drift.

### Method and evidence of the measurements

- Built app: `dist/` was built 2026-10-15 04:20 (after the last client edit 01:55 and the
  last `src/` commit b1b725b), so no rebuild was needed. The probe
  `D:\.claude-tmp\timesheet\WP5-UX3-PLAN\probe\probe-current.mjs` seeds a fresh database
  (`DATA_DIR` and `DATABASE_PATH` both under `...\WP5-UX3-PLAN\run1\data`, `npm run seed`
  equivalent `node dist/server/cli.js seed`, synthetic `example.invalid` accounts), starts
  `node dist/server/index.js` on port 48521 with `JOB_RUNNER=off` and capture mail, drives
  Microsoft Edge headless through the installed `@playwright/test` 1.63.0, and stops its own
  server through the child handle (`server killed: true`). Exit 0. Output:
  `run1\probe-current.json` (3,579 lines), `run1\probe-current-log.txt`, 22 synthetic
  screenshots in `run1\shots\` (kept outside the repository; current state only).
- Real clock: 2026-10-15 (Thursday), America/Los_Angeles. The page opens on the R-07
  current period 09/28-10/11 (payroll 10/16): this is one of the five window days, so
  "Today" opens 10/12-10/25 ("future" badge) and "Current period" is shown. Synthetic
  viewer "Example Employee Two" (20 characters) with a received view share from "Example
  Employee"; admin "Example Admin".
- Contrast: WCAG 2.x relative luminance, ratio (L1+0.05)/(L2+0.05); translucent colours
  composited over their base first. Current values were read from computed styles in the
  page; proposed values come from `probe\contrast.mjs` (output `contrast.json`).
- Observation (O) means measured or read in the code; Assumption (A) means inferred.

### A. Current state per item

**U-01 style direction.** O: `AGENTS.md` lines 31-39 mandate "High-End Industrial Polish",
"B2B semiconductor hardware", a 4px radius custom property and `transition: all 300ms
ease-out`; `styles.css:2-6` cites owner decision E-8, tokens `--radius: 4px`,
`--duration: 300ms`, `--ease: ease-out`, `--transition: all ...` (`styles.css:28-31`,
measured `--radius` 4px and `--transition` `all .3s ease-out`); docs/04 "Visual standard"
lines 76-87 repeat them; docs/10 line 95 records E-8 (2026-10-03). The page is flat
light grey with near-white cards, 4px corners everywhere, hairline sheet rules. O: no test
asserts the radius or the 300 ms value (`grep` of `tests/` for `radius|--transition|300ms`
found nothing); `tests/client/cssThemeParity.test.ts` pins that both dark sets are equal.
A: the owner reads the dense grey grid, square corners and uniform hairlines as
"industrial".

**U-02 surface contrast.** O: light `--bg #f6f7f9` vs `--card #ffffff` = 1.07:1; dark
`#12161c` vs `#1a2029` = 1.11:1 (computed). The sheet card shadow is `--shadow-panel`
(`styles.css:34-35`: 1px ring at 6 % plus three diffuse layers at 4-5 % alpha); the week
grid is a 1px `--sheet-rule` frame (1.48:1 light, 1.56:1 dark on the card) and its day head
`#e9eef5` is 1.17:1 on the card. The week sheet sits inside the same white card as the
toolbar and the form header (`TimesheetScreen.tsx:466`), so nothing separates it from its
surroundings. Tests: none pin these surface values (only the focus-ring and hover specs
assert ratios against whatever surfaces exist).

**U-03 user name in the top bar.** O: the desktop bar shows `<span className="muted">
{user.display_name}</span>` between the theme control and Sign out
(`AppShell.tsx:176-182`, `styles.css:452-455`); no avatar, no email. The user model has a
display name and an email: `User { id, email, display_name, role }` (`api.ts:43-48`),
returned by `GET /api/auth/me` (`routes/auth.ts:16-18, 115`); docs/03 line 20 ("display
name/email"). An admin can change a display name (`PATCH /api/admin/users/:id`, docs/03
line 34). There is no profile page and no self-service name or password change (docs/12
"Temporary passwords (D-9)"). Measured at 1280: user group 407.5px wide (theme control
141.5, name 154.9, Sign out 87.1, gaps 12). Tests: `shell.spec.ts:62-101` (the Theme
control is the first control of `.shell-user`, `.shell-user` has exactly one button "Sign
out"), `shell.spec.ts:297-330` (Tab order links, Theme, Sign out), `hover.spec.ts:110`
(Sign out in the banner), `setup.spec.ts:160-162`, `sharing.spec.ts:146`,
`keyboard-access.spec.ts:261`, `admin.spec.ts:431`.

**U-04 avatar menu.** O: none exists. The phone has a "More" disclosure in the bottom tab
bar (`AppShell.tsx:195-231`): `aria-expanded`, `aria-controls="more-panel"`, Escape closes
and returns focus to More, outside pointer closes, a hash change closes; it holds the user
name (`more-who`), Settings, Import, Admin (admins), the Theme control and Sign out.
Tests: `shell.spec.ts:35-101`, `theme.spec.ts:52, 381-389, 495, 582`, `admin.spec.ts:56-71`,
`import.spec.ts:94-118`, `isolation.spec.ts:43-46`, `sharing.spec.ts:136-146`,
`focus-ring.spec.ts:359`, `hover.spec.ts:152`.

**U-05 Settings and Admin in the menu; Administration under Settings.** O: `ROUTES`
(`AppShell.tsx:20-27`) has Settings (desktop bar) and Admin (desktop bar, admins only);
`App.tsx:117-123` renders `SettingsScreen` for `#/settings` and `AdminScreen` (h1
"Administration", `AdminScreen.tsx:87`) for `#/admin` only when `user.role === 'admin'`;
an unknown or forbidden hash falls back to `#/timesheet` (`AppShell.tsx:56-61`). Server
authorization is independent of the menu: `routes/admin.ts:107-108`
`app.use('*', requireAdmin(deps))`, `http/auth.ts:122-126` 403 `forbidden` for a
non-admin. Tests: `admin-status.spec.ts:141-142, 198, 247-251`, `admin-users.spec.ts:37-38`,
`admin.spec.ts:197-201, 421-438`, `import.spec.ts:118, 397-409`, `isolation.spec.ts:111-116,
152-153, 202-206`, `shell.spec.ts:41, 56`, `sharing.spec.ts:291`; integration
`user-admin.test.ts`, `isolation.test.ts` (403 on admin routes).

**U-06 the wordmark is not visible (owner's factual question).** O: the wordmark is
`display: none` below 1440px (`styles.css:383-388, 405-413`; docs/04 line 7; docs/10 line
200). Measured: at 1280 and 1366 only the 36px logo shows (brand width 36); from 1440 the
wordmark is 151.4 x 27.8px and the brand is 199.4px. Reason recorded in WP5-UX2-T06
Results item 4: with the "Shared with me" switcher (349px) and a 20-character display name
the one-row bar needed 1408px with the wordmark, so the breakpoint was raised from the
planned 1280 to 1440 (at 1280 and 1366 the bar wrapped to 103.8px). Measured now: 1280 with
a share: nav 76-459 (Timesheet 94, Overtime 85, History 71, Settings 77.3), switcher 483-832,
user group 856.5-1264; 1440 with a share: brand to 215.4, nav to 619.4, user group ends
1424, bar 56px. A: the owner's screen is below 1440 CSS px (for example 1366x768, or a
1920px display at 125-150 % scaling = 1536 or 1280 CSS px; at 1536 it would show). The
mockup the owner saw (WP5-UX2) drew the wordmark at 1280. Tests: `logo.spec.ts:240-269`
(wordmark from 1440, hidden at 1439/1280/1024/768 and on phones, brand gap tokens),
`wordmarkAsset.test.ts`.

**U-07 Check in/out on the title row.** O: on >= 768px the check in/out is a card in the
`workbar` grid beside the period bar (`TimesheetScreen.tsx:457-462`, `ClockPanel.tsx:64-79`,
`styles.css:1520-1528` `--clock-width: 26rem`): measured 390 x 130.6px at 1280 and 1440,
taking a third of the row and squeezing the period card to 766px. Below 768px it is in the
top bar (`BarClock.tsx`). Tests: `shell.spec.ts:113-193` (card on the desktop, bar group on a
phone, focus returns, absent in shared views), `day-editor.spec.ts:477-559` (Check in then
Check out dialog).

**U-08 user name under the title.** O: `TimesheetScreen.tsx:450-455` renders
`<p className="muted">{user.display_name}</p>` (own) or "Signed in as {name}" (shared view)
under the h1; measured 21.8px line plus margins (h1 at y 72, card at 166.2). On phones the
whole header is visually hidden (`styles.css:1538-1546`). Tests:
`keyboard-access.spec.ts` and `sharing.spec.ts` read the h1 ("{owner}'s timesheet"),
`shell.spec.ts` the heading "Timesheet"; no test reads the name line (grep).

**U-09 period pills.** O: `PeriodBar.tsx:72` `<span className={`badge ${period.relation}`}>`;
`styles.css:938-953`: `.badge` is a 1px `--line` outline, `.badge.current` takes `--ok`
for text and border, `.badge.old` `--warn`, and there is no `.badge.future` rule (neutral
grey outline, the same look as the "Draft" status badge next to it). Measured light: current
#136a42 on white 6.63:1, old #8a5a00 5.93:1, future text #1c2430 with border #d9dee5
(1.35:1). The two coloured inks differ by only 1.12:1 in luminance, both are dark and low in
chroma at 0.8rem, and the future pill is identical to the neutral "Draft" pill: this is why
they "look like one colour" in light mode. Dark: #5fd29a and #e3b341 are light, saturated
inks (8.71 and 8.41:1), so the hue reads. WP5-UX2-Q3 (optional, default a) concerns the
"future" word on the period Today opens in the window days. Tests:
`timesheet.spec.ts:300` (`.badge.current` visible), `:417` and `day-editor.spec.ts:1235`
(`.badge.old` visible).

**U-10 meta row.** O: `.period-meta` is already `flex-wrap` (`styles.css:1049-1056`), but
its column is squeezed: measured meta width 397.2px at 1280 and 1440 while the three spans
need 163.7 + 307.3 + 179.8 + 2 x 16 = 682.8px, so each span takes its own line (66.7px
tall). Cause: the clock card (390px) and the period action buttons (224px) share the row.

**U-11 "Open a day" title row.** O: `OpenDay.tsx:13-21` puts the text inside a column
`<label>` (`styles.css:732-736`), so on >= 768px the text sits above the date field (label
67.5px tall, field 41.8px). Below 768px a phone rule makes it a row (`styles.css:1698-1718`).
Tests: `timesheet.spec.ts` (13 hits, `getByLabel('Open a day')` and the phone row),
`focus-ring.spec.ts:306` (date field ring), `sharing.spec.ts`.

**U-12 Show details next to Change several days.** O: `.tools-right` gap 8px
(`styles.css:1239-1245`); "Change several days" is a `quiet` button (transparent border,
14px side padding, `TimesheetScreen.tsx:472-484`): measured switch label right edge 1032,
button box left 1040 (8px), button text starts 22px after "Show details", and nothing marks
the button edge, so the two read as one phrase. Tests: `hover.spec.ts:321-416` (switch,
tools row fits at phone widths).

**U-13 editor column marker.** O: `styles.css:2022-2073`: `::before` fill `--day-editing`
(10 % accent), `::after` 2px accent rails on both sides (`border-inline`), and a 3px accent
underline on the Day cell (`box-shadow: inset 0 -3px 0 accent`, measured
`rgb(31,95,191) 0 -3px 0 0 inset`); the batch ring uses the same accent
(`--marker-ring: inset 0 0 0 2px accent`, measured), so the two states differ only by the
missing top and bottom edges. Phone: a 2px accent frame on the row (`styles.css:2151-2191`).
Tests: `timesheet.spec.ts:594-886, 979-1136` (layers, rails painted over every cell, 3:1
rails, underline, contrast on every surface, phone frame), `today.spec.ts` (marker moves),
`sheetModel.test.ts` (`dayClass`).

**U-14 batch selection look.** O: `.sheet-day.selected` adds `--day-selected` (9 %/14 %
tint) and a 2px inset accent ring on `::after` (`styles.css:2017-2020, 2040-2041`), screenshot
`current-batch-selected-*-synthetic.png`: a heavy rectangle around each column. Tests:
`timesheet.spec.ts:886-979` (ring unbroken at the head and the attention cell, no sideways
scroll with the ring), `keyboard-access.spec.ts:414` (AX-09 "Complete" 4.5:1 on the
selected tint), `focus-ring.spec.ts`.

**U-15 the word "Label" (owner's question).** O: the row shows the day category of
`day.category` (`Worked`, `Off`, `Vacation`, `Sick`, `Holiday`, `Shutdown`), the holiday
name for a Holiday (`sheetModel.ts:137-162`), "Work from home" for Worked with WFH, extra
lines for leave and a "Note" marker. The same field is called: `category` in the API and
docs/02 line 62, docs/03 line 24; "Category" on the PDF row header (`timesheetPdf.ts:204`)
and in batch mode ("Category for selected days", docs/04 line 58); "Label" on the screen
row (`SHEET_ROWS.label`, `sheetModel.ts:25`), the picker ("Label for {date}",
`SheetWeekTable.tsx:117, 145`), the Day editor field (`DayFieldsForm.tsx:98-106`) and
docs/04; "day labels" in the workbook's "Working Infos" list (`reference/inputs/README.md`
line 6, `templateMapping.ts:128-137`). O: `GLOSSARY.md` does not exist in the repository
(AGENTS.md names it; `Glob` found none). A: the Excel form's own row has no printed
header word (not checked: the template is read only through the import code). Candidate
words: "Category" (PDF, batch, API, docs/02-03), "Day type", "Type", keep "Label".
Recommendation in B4 and G-2.

**U-16 the "Check" row (owner's question).** O: the Check row is display only: `CheckBadge`
renders a `<span>` with a shape and words (`DayStatus.tsx:64-71`) from the server
calculation status (`sheetModel.ts:199-220`); it toggles nothing. "No times" is the
`missing` state with no sessions (`sheetModel.ts:211-212`), drawn with
`.shape-square` = a hollow 0.7rem square with a 2px border (`styles.css:1388-1391`). That
hollow square is what looks like an unticked checkbox "[ ] No times" (screenshots
`current-timesheet-1440-light-synthetic.png`, `current-phone-390-landing-synthetic.png`).
docs/04 line 41 already describes the row as stating "each day's status in words and a
shape". So "Status" is the more accurate word, and the hollow square should change shape.
Tests: `sheetModel.test.ts` (check keys and texts), `timesheet.spec.ts` (`data-check`),
`day-editor.spec.ts:807-858` (upcoming and missing texts).

**U-17 phone "Current".** O: container query thresholds (`styles.css:1592-1656`): with
Current period shown, "Review & sign off" shows full from 22.8rem (342px), "Sign off" from
18.4rem (276px), and below 18.4rem the link takes its own row. Measured: 390px container
334px: Today 62.3 + Current period 121.8 + "Sign off" in one 44px row; 320px container
264px: the link wraps to a second row (`cta` 96px tall), as docs/04 lines 48 and 56 say
("below about 330px"). Tests: `today.spec.ts:364-470` (one row at 390/375/360, own row at
320, accessible name full label), `timesheet.spec.ts:136-221` and
`today.spec.ts:444` (first-screen budgets), `periodBarModel.test.ts` (`reviewShortLabel`).

**U-18 phone "Open a day" text.** O: the phone row is label text (76px) + date field (flex,
min `--date-field-min` 8.5rem = 127.5px) + "Open day" button 95.7px. Measured at 390: one
row (label 230.3 + 8 + 95.7 = 334); at 360 and 320 the button wraps below (320: field 180px
wide, button on the next row, +52px). Tests: `timesheet.spec.ts` phone rows,
`hover.spec.ts:416` (tools row fits).

**U-19 editor note.** O: `DayEditor.tsx:259-265`: "Accounting date {date} in the reporting
zone {zone}. Times below are typed in an input zone you choose; they are shown in {zone}
elsewhere. Period: {relation}." Measured at 1440: 5 lines, 69.6px, in a 123.5px sticky head
(`--editor-head-size`). It repeats information that only matters when zones differ; the
period bar already names the viewing zone. Tests: `day-editor.spec.ts` (2 hits on the
heading/notes), `keyboard-access.spec.ts` (AX-01 scroll padding under the head).

**U-20 panel header.** O: `.day-panel .editor-head` has the card background and a 1px
`--line-soft` bottom border (`styles.css:2677-2685`); measured head and body both #ffffff
light and #1a2029 dark: no surface step. Title "Day editor Mon 2026-10-12" (ISO date in
mono, `DayEditor.tsx:256-258`); "Close" is a quiet text button.

**U-21 sessions and breaks in a dialog.** O: Add session and Edit render `SessionForm`
inline inside the panel under the session list (`DayEditor.tsx:388-423`); measured new
session form 680.9px tall. Breaks are `BreaksEditor` rows with "Break n from" date+time and
"Break n to" date+time, "Counts as work", Remove (`BreaksEditor.tsx:95-118`); the panel
list shows "09:00 to 17:30, 1 break(s)" and "manual session, entered in {zone}, n break(s)
recorded" with no break times (`DayEditor.tsx:325-352`). Breaks are sent as start and end
local inputs with the zone (`sessionModel.ts:105-112`, API `BreakRequest` `api.ts:270-274`).
Tests: `day-editor.spec.ts:85-470, 761-786, 859-898` (forms "New session"/"Edit session",
labels "Break n from time", "Save session"/"Save changes", radios), `sharing.spec.ts:264`,
`import.spec.ts:233`, unit `sessionModel.test.ts`, `dayEditorModel.test.ts`.

**U-22 delete confirmation.** O: `DayEditor.tsx:337-345`: "Delete" swaps in place to a
primary "Confirm delete" button; no dialog, no description of what is deleted, no cancel
(screenshot `current-editor-confirm-delete-light-synthetic.png`). Tests:
`day-editor.spec.ts:788-806`, `sharing.spec.ts:264` (absent in view-only shares).

**U-23 defaults and suggested breaks (owner's factual question).** O: default times exist:
each policy version has `reference_start` and `reference_end` (`api.ts:319-332`), edited in
Settings as "Reference start"/"Reference end" (`PolicyFields.tsx:33-38`), default
08:00-17:00 (docs/04 line 24, R-02). A new session starts empty
(`newSessionDraft`, `sessionModel.ts:69-71`); docs/04 line 16 says "Actual clock values are
not seeded from a schedule". Suggested breaks are computed on the CLIENT with the shared
domain function `suggestBreaks(startUtc, rules)` (`domain/breaks.ts:11-18`: each policy
break at start + offset for its duration; default offsets give 10:00, 12:00, 14:30 for an
08:00 start) through `suggestedRows` (`sessionModel.ts:300-313`). They appear only when the
person presses "Suggest breaks" (`SessionForm.tsx:73-88`, mode stays "pending") or in the
one-tap block of a saved session with unconfirmed breaks, where they are offered only if
every suggestion lies inside the saved session (`dayEditorModel.ts:53-73`). Nothing applies
them by date (past or not). The server refuses a break that ends later than now + 5 min
(`timesheetCommands.ts:189-200`, 422 `future_break`) and breaks outside their session
(`domain/intervals.ts:54`, `break_outside_session`).

**U-24 break area.** O: three radios "Breaks not confirmed yet" / "Breaks confirmed as
listed" / "No breaks taken" with hints, then "Suggest breaks", "Confirm suggested breaks"
(changes the radio only), "Add break", and rows of four date/time fields
(`BreaksEditor.tsx:12-122`). The same component serves the Check out dialog
(`ClockOutDialog.tsx:105-113`) whose submit label follows the mode. Tests as U-21 plus
`day-editor.spec.ts:477-559`, `shell.spec.ts:171`.

**U-25 Save and Cancel.** O: "Save session" / "Save changes" and "Cancel"
(`SessionForm.tsx:177-184`); saving sends `breaks_confirmed: mode !== 'pending'`
(`sessionModel.ts:134-146`), so saving does not confirm unless the radio says so.

**U-26 confirmation before Save and on Cancel with changes.** O: none: Save writes at once,
Cancel discards silently (`SessionForm.tsx:90-113, 181-183`). Day fields save at once
(`DayFieldsForm.tsx:56-85`).

**U-27 WFH on the Label row.** O: `.label-row` is a two-column grid with
`align-items: end` (`styles.css:2818-2823`), but the label column also holds the hint
"Calendar default. Saving records it as your choice." under the select
(`DayFieldsForm.tsx:107`), so the checkbox aligns with the hint, not the select: measured
select 766.4-806.4, WFH 820.4-845.2 (screenshot `current-editor-1440-light-synthetic.png`).
Below 768px the grid is one column (`styles.css:2857-2860`). Tests:
`day-editor.spec.ts:589, 694, 722, 745, 755` (`getByLabel('Worked from home (WFH)')`).

Other observations that matter for the design:

- O: there is no sticky day head in the sheet (the brief mentions one); the only sticky
  layers are the shell bar, the share bar (>= 768px) and the editor head
  (`styles.css:352-364, 3682-3688, 2677-2685`).
- O: the content security policy is `default-src 'self'`, `style-src 'self'`,
  `img-src 'self' data:` (`server/app.ts:81-94`): no web font, no external image; an
  initials avatar drawn in CSS fits.
- O: the three design skills were loaded as input (`stitch-design-taste`,
  `high-end-visual-design`, `design-taste-frontend`). `design-taste-frontend` declares
  itself out of scope for "dashboards, dense product UI, data tables, multi-step forms"
  (its section 13), which is exactly this app; `high-end-visual-design` targets $150k
  marketing sites (double-bezel shells, scroll-entry animation, pill CTAs, banned system
  fonts that the CSP requires here). Kept from them: one accent, neutral palette without
  pure black, both themes designed together, tinted soft shadows, a documented radius
  scale used consistently, transform/opacity-only motion with reduced-motion fallback,
  label above input with errors below, 44px touch targets, no horizontal scroll, button and
  form contrast checks, z-index discipline. Dropped: web fonts and icon/animation libraries
  (CSP, dependency policy), entrance/scroll/looping animation, marketing layout rules
  (hero, bento, eyebrows), large squircle radii.

### D. Mockup (written early; captions in Vietnamese)

- File: `handoff/delivery/design/WP5-UX3/mockup.html` (one static file, inline CSS with the
  proposed token values in `.t-light` and `.t-dark`, no script, no network, no web font;
  logo and wordmark reuse the shapes of `cd-logo.svg` and `BrandWordmark.tsx` as SVG
  symbols; synthetic names and `example.invalid` addresses only). Every artboard is drawn
  in light and dark.
- Artboards: A1 desktop 1440 top bar with the identity block and the open account menu;
  A2 desktop 1280 top bar with the "Shared with me" switcher and a truncated long name;
  A3 Timesheet header at 1280 (title row with Check out and the since-time, period bar with
  the pills, one-row meta, Open a day row, toolbar spacing, the three pills side by side);
  A3b the meta row wrapped at 820; A4 the raised week sheets with two batch-lifted columns,
  the editor column, a column that is both, the "No times" shape, the Category and Status
  row names, and the Day editor panel (header, chips, session cards, break table, WFH row);
  A5 the session dialog with three break rows and "Confirm no breaks taken"; A5b the save,
  delete and discard confirmations; A6 Settings with the Profile and Administration tabs;
  A7 phones 390 and 320 (three period buttons on one row with "Current", "Open a day" text
  hidden at 320) and the phone More panel as the account menu; A8 the phone session dialog.
- Renders (synthetic PNG, one per artboard, light and dark in each, Edge headless from the
  file URL with every non-file request aborted: 0 aborted):
  `mockup-a1-topbar-1440-menu-synthetic.png`, `mockup-a2-topbar-1280-share-synthetic.png`,
  `mockup-a3-page-header-1280-synthetic.png`, `mockup-a3b-meta-wrapped-820-synthetic.png`,
  `mockup-a4-sheet-and-editor-1280-synthetic.png`, `mockup-a5-session-dialog-synthetic.png`,
  `mockup-a5b-confirmations-synthetic.png`, `mockup-a6-settings-tabs-synthetic.png`,
  `mockup-a7-phones-390-320-more-synthetic.png`, `mockup-a8-phone-session-dialog-synthetic.png`.
  Script `D:\.claude-tmp\timesheet\WP5-UX3-PLAN\probe\render-mockup.mjs`, measurements
  `...\render2.json` (exit 0).
- Mockup measurements (same system font as the app on this machine): top bar minimum
  one-row width 804.1px without a share (brand 199.4 + 3 links + identity 253.8) and
  1252.4px with the switcher (366.1) and a long name truncated at `--identity-max` 14rem
  (identity block 312, `nameTruncated: true`); meta row 1 row at 1280, 2 rows at 820; the
  Open a day row one row at 1280, 390 and 320 (text hidden at 320); phone period buttons one
  row at 390 ("Today" 62.3 + "Current period" 121.8 + "Sign off") and 320 ("Today" 62.3 +
  "Current" 73.2 + "Sign off"); session dialog break rows 56px (one row) at a 720px dialog;
  phone break rows 111px (two lines, wrapping as designed); WFH on the same row as the
  Category select in the 400px panel (`sameRow: true`); horizontal overflow 0 in every frame.

### B. Design per item

#### B1. U-01/U-02 style system (modern, friendly business app)

Direction: calm neutral page, white raised surfaces with soft layered shadows and hairline
rings, rounder controls, one brand blue, coloured state pills, short eased motion. Density
stays "daily app" (the sheet keeps its Excel form). All values are CSS custom properties
in `src/client/styles.css`, light in `:root`, dark in BOTH dark sets (the parity test
stays). Proposed values (computed ratios from `contrast.json`, WCAG relative luminance):

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--bg` | #edf0f5 (was #f6f7f9) | #0e1217 (was #12161c) | card step 1.14:1 light (was 1.07), 1.15:1 dark (was 1.11) |
| `--card` | #ffffff | #1a2029 | unchanged |
| `--off` | #f4f6f9 | #212834 | quiet inset surface |
| `--panel-head` (new) | #f2f5fa | #232b37 | editor and dialog heads; 1.09 / 1.15 on card |
| `--line` / `--line-soft` | #d5dbe3 / #e6eaf0 | #323b48 / #262e3a | hairlines (decorative) |
| `--accent-soft` (new) | #e7effb | #22324a | nav current, prefill note, row numbers |
| `--day-editing-head` (new, replaces `--day-editing` fill) | #d8e6fa | #24395a | text on it 12.36 / 9.54; accent on it 4.82 / 4.82 |
| `--avatar-bg` / `--avatar-ink` (new) | #dbe7f9 / #163f7d | #25395a / #cfe0ff | initials 8.24 / 8.70 |
| `--danger` / `--on-danger` (new) | #b42318 / #ffffff | #ff8a80 / #1a0b0a | 6.57 / 8.39; destructive buttons |
| `--row-alt` (new) | #f7f9fb | #1e2530 | break rows; text 14.8 / 12.66, muted 5.52 / 6.18 |
| pills (new, see B4) | 12 tokens | 12 tokens | ink on pill >= 6.47 light, >= 8.05 dark |

Unchanged on purpose: `--text`, `--muted` (5.10:1 on the new light `--bg`, 5.33 on
`--panel-head`; dark 7.53 / 5.72), `--accent` and `--accent-strong` (6.09 / 6.79 on card,
5.33 / 7.79 on `--bg`, 5.57 / 5.92 on `--panel-head`), `--ok` (5.82 / 6.78 on the selected
tint, AX-09 holds), `--hover-fill` (1.23 / 1.45 over card, >= 1.20 required), the focus
ring token (accent 2px ring with a 1px card gap: >= 4.82:1 on every new surface).

Elevation scale (new; replaces `--shadow-panel`/`--shadow-overlay` by name, the old names
become aliases during the transition slice and are removed in it):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--elev-bar` | `0 1px 0 rgb(20 30 50/.08), 0 2px 8px rgb(20 30 50/.05)` | `0 1px 0 rgb(255 255 255/.06), 0 2px 10px rgb(0 0 0/.45)` | shell bar |
| `--elev-1` | ring .06 + 1px 2px .06 + 2px 6px .04 | ring white .06 + 1px 2px black .40 + inset top highlight .03 | cards (period bar, form cards) |
| `--elev-2` | ring .07 + 2px 4px .06 + 0 8px 24px -6px .16 | ring white .08 + 2px 4px .35 + 0 10px 28px -6px .60 + inset highlight .04 | week sheets, editor panel |
| `--elev-3` | ring .08 + 4px 8px .08 + 0 16px 40px -8px .24 | ring white .10 + 6px 12px .45 + 0 18px 44px -8px .70 | menus, dialogs |
| `--elev-lift` | ring .06 + 0 6px 12px -2px .14 + 0 14px 28px -8px accent .30 | ring accent .28 + 0 8px 16px -4px .55 + 0 16px 32px -10px .75 | lifted sheet columns |

Dark shadows alone are invisible on a dark page, so every dark level carries a 1px light
ring and a faint inset top highlight (the mockup shows the result).

Shape and motion (replace E-8 values): `--radius-sm: 6px` (inputs, small buttons, chips),
`--radius: 8px` (buttons, menu items, lifted columns), `--radius-lg: 12px` (cards, sheets,
panels, dialogs, menus), `--radius-pill: 999px` (pills, avatar, switch); the sheet cells stay
square inside their rounded card (the Excel form). `--duration-fast: 120ms`,
`--duration: 180ms`, `--duration-slow: 260ms` (lift), `--ease-standard:
cubic-bezier(0.2, 0, 0, 1)`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`; `--transition`
becomes a list of the properties that actually change (`color, background-color,
border-color, box-shadow, transform`), never `all`. Under `prefers-reduced-motion: reduce`
the durations become 0.01ms (as today) and the lift keeps its end state without movement.
E-8 changes: 4px radius becomes the four-step scale; "300 ms ease-out on all" becomes 180 ms
standard easing on listed properties (300 ms feels sluggish on toggles and pickers, and
`all` animates layout properties). Plain CSS and custom properties stay (that part of E-8
is kept).

Typography: system stack only (CSP); weights `--font-weight-normal 400`,
`--font-weight-medium 500` (new: nav, labels), `--font-weight-strong 600`,
`--font-weight-heavy 700`; h1 `1.6rem` heavy with `-0.015em` tracking; monospace for dates,
times and h:mm as today.

How the week sheet stands out (U-02): the toolbar and the form header leave the white
`.sheet-area > .card` (they sit on the page surface, the toolbar as a plain row); each WEEK
band becomes its own raised card (`--elev-2`, `--radius-lg`, a header strip with the week
number and range); the footer (legend, Overtime Total, signatures) is a third card. Against
the darker page this gives the sheet two clear surface steps (page 1.14:1, plus the
shadow) instead of one 1.07:1 step shared with everything else.

#### B2. Governance draft (the change itself is task WP5-UX3-GOV)

Replacement for the whole AGENTS.md section "Unified Frontend & UI/UX Standards (Taste
Skills Integration)" (lines 31-39):

```markdown
### Frontend and UI/UX standards
When editing, refactoring or creating UI components or views, follow these rules. The skills `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design` are optional references for visual polish only; where they conflict with this section, the content security policy, accessibility or document 04, this section and document 04 win (system fonts only, no icon or animation library, no entrance, scroll or looping animation).

1. **Consistency pre-flight:** Before writing code, read `src/client/styles.css` (CSS custom properties in the light set and both dark sets) and the established components. Reuse the tokens for colour, spacing, radius, elevation, motion and type; introduce a new value only as a CSS custom property, and a colour in both dark sets as well.
2. **Modern, friendly business style:** Clear hierarchy, comfortable spacing and readable density for a small-team timesheet app, mobile-first and responsive. Surfaces step from the page to cards, sheets, panels and menus with soft layered shadows and hairline rings; corners follow the radius scale documented in document 04; one brand accent; every status colour is paired with words or a shape.
3. **Accessible states:** Every interactive element has rest, hover (only where the device can hover), active, focus-visible, selected or checked, and disabled states in both themes, meeting WCAG 2.2 AA (text 4.5:1, state indicators and component boundaries 3:1, the shared focus ring, 44px targets below 768px and with a coarse pointer). State is never shown by colour alone.
4. **Motion:** Interactive states change through the shared `--transition` custom property (short, eased, listed properties only, never `all`); honour `prefers-reduced-motion`; no decorative or looping animation.
```

AGENTS.vi.md counterpart (replaces lines 33-41):

```markdown
### Tiêu chuẩn giao diện và UI/UX
Khi sửa, tái cấu trúc hoặc tạo mới component hay giao diện UI, tuân theo các quy tắc sau. Các skill `stitch-design-taste`, `design-taste-frontend` và `high-end-visual-design` chỉ là tài liệu tham khảo tùy chọn để trau chuốt thị giác; khi chúng mâu thuẫn với mục này, với chính sách bảo mật nội dung (CSP), khả năng tiếp cận hoặc tài liệu 04 thì mục này và tài liệu 04 được ưu tiên (chỉ dùng font hệ thống, không dùng thư viện icon hay animation, không có animation khi xuất hiện, khi cuộn hay lặp vô hạn).

1. **Kiểm tra tính nhất quán trước khi làm:** Trước khi viết code, đọc `src/client/styles.css` (CSS custom property trong bộ sáng và cả hai bộ tối) và các component đã có. Dùng lại token cho màu, khoảng cách, bo góc, độ nổi (elevation), chuyển động và chữ; giá trị mới chỉ được thêm dưới dạng CSS custom property, và màu mới phải có ở cả hai bộ tối.
2. **Phong cách hiện đại, thân thiện cho ứng dụng doanh nghiệp:** Phân cấp rõ ràng, khoảng cách thoải mái và mật độ dễ đọc cho một ứng dụng chấm công của nhóm nhỏ, ưu tiên điện thoại trước và co giãn theo màn hình. Các bề mặt nổi dần từ nền trang lên thẻ, bảng, panel và menu bằng bóng đổ mềm nhiều lớp và đường viền mảnh; bo góc theo thang bán kính ghi trong tài liệu 04; một màu nhấn của thương hiệu; mọi màu trạng thái luôn đi kèm chữ hoặc hình.
3. **Trạng thái dễ tiếp cận:** Mọi phần tử tương tác có trạng thái nghỉ, hover (chỉ trên thiết bị có hover), nhấn, focus-visible, đã chọn hoặc đã tick, và vô hiệu hóa ở cả hai giao diện, đạt WCAG 2.2 AA (chữ 4.5:1, chỉ báo trạng thái và đường biên thành phần 3:1, vòng focus dùng chung, vùng chạm 44px dưới 768px và với con trỏ thô). Trạng thái không bao giờ chỉ thể hiện bằng màu.
4. **Chuyển động:** Trạng thái tương tác thay đổi qua CSS custom property dùng chung `--transition` (ngắn, có easing, chỉ các thuộc tính được liệt kê, không dùng `all`); tôn trọng `prefers-reduced-motion`; không có animation trang trí hay lặp vô hạn.
```

The VI draft also closes the backlog item GOV-E8-AUDIT R2 ("mobile-first" was missing in
the VI item 2). CLAUDE.md needs no change (it imports AGENTS.md). Not governance paths but
needed in the docs slice: docs/04 "Visual standard" lines 76-87 (EN and VI) and a docs/10
entry recording that this owner decision supersedes the E-8 values (E-8 itself stays as
history). `.agents/skills/` and `.claude/skills/` stay unchanged (no governance change to
the skills themselves).

#### B3. U-03..U-05 identity block, account menu, Settings sub-pages, Profile

- Identity block (desktop >= 768px, right end of the bar, replaces the theme control, the
  name span and Sign out): one `<button>` with the display name (bold, `--text`), the email
  (0.8rem, `--muted`: 5.83:1 light, 6.56:1 dark on the bar, the "dark colour" of the owner in
  light; in dark the secondary text tone, since a dark grey on a dark bar would fail 4.5:1),
  right-aligned, then the avatar, then a chevron. Both lines truncate with an ellipsis at
  `--identity-max: 14rem`; the menu header shows them in full (wrapping). Avatar: 36px
  circle, initials of the first and last word of the display name (one letter if one word;
  first character of the email if the name has no letter), `--avatar-bg`/`--avatar-ink`,
  `aria-hidden`; no image, no upload, no new private media. Accessible name = visible text
  plus hidden ", account menu" (contains the visible label, SC 2.5.3).
- Pattern: a disclosure button (`aria-expanded`, `aria-controls="account-menu"`) with a
  non-modal popover panel, the same pattern as the phone More panel (not ARIA `menu`, so
  the native Theme radio group, links and the Sign out button keep their own semantics and
  the Tab order). Opening by keyboard moves focus to the first item; Tab and Shift+Tab move
  through the items; Escape closes and returns focus to the button; a pointer outside, a hash
  change or Tab past the last item closes it. Panel `--elev-3`, `--radius-lg`, 18.5rem,
  right-aligned under the button, layer token `--layer-menu: 4` (above the sticky bar 3).
- Items, in order: header (avatar, full name, email, "Administrator" for admins);
  Profile (`#/settings/profile`), Settings (`#/settings`), Administration
  (`#/settings/admin`, admins only); separator; Theme (the existing `ThemeToggle`, Light/Dark
  radios with icons, unchanged behaviour and storage); separator; Sign out (button).
- Desktop main navigation keeps Timesheet, Overtime, History (Settings and Admin leave the
  bar). Phone: no avatar in the top bar (no first-screen cost); the tab bar keeps Timesheet,
  Overtime, History, More; the More panel renders the same account content (header,
  Profile, Settings, Import, Administration for admins, Theme, Sign out). The `more-who`
  line becomes the header.
- Shared view: the bar always shows the signed-in user (`AppShell` already gets the session
  user); the owner is named by the h1, the share bar and the sheet's "Employee:" line.
- Settings sub-pages (client routes only): `#/settings` (Personal: today's Settings
  content), `#/settings/profile` (Profile), `#/settings/admin` (Administration, rendered
  only for `role === 'admin'`). A local `<nav aria-label="Settings sections">` with links
  and `aria-current="page"` (links, not ARIA tabs: each sub-page has its own address and
  back-button behaviour); each sub-page keeps its own h1 ("Settings", "Profile",
  "Administration"), so the heading assertions stay. Old `#/admin`: for an administrator
  `replaceState` to `#/settings/admin`; for an employee the existing fallback to
  `#/timesheet` (as today). `#/import` stays (linked from Personal and More).
- Server authorization is unchanged: `/api/admin/*` stays behind `requireAdmin`
  (`routes/admin.ts:107-108`); the client merely hides the tab. Proof in tests: an employee
  at `#/settings/admin` and `#/admin` sees no Administration heading and the page makes no
  `/api/admin/` request; the integration tests for 403 stay green; `dist/server` is
  byte-identical to a643794.
- Profile (smallest useful scope, no server change): read-only display name, email, role
  and the reporting zone (from `/api/periods/current`), with the note "An administrator
  changes display names." Editing the name or the password is out of scope (D-9 remains the
  password decision).

#### B4. U-06..U-12 page header and period bar

- Wordmark (U-06): shown from 1024px, but hidden below 1280px while the "Shared with me"
  switcher is in the bar (`.shell-bar:has(.shell-switcher) .wordmark { display: none }`
  inside `@media (max-width: 1279px)`; `:has()` is already used in `styles.css`). Measured
  in the mockup: the bar needs 804.1px without a share and 1252.4px with the switcher and a
  truncated 14rem identity, so 1024 (no share) and 1280 (share, 1263px usable with a
  scrollbar) keep one 60px row. The owner's likely widths 1280, 1366, 1440, 1536 and 1920 all
  show it. Brand-to-menu gap `--shell-brand-gap` 32px wherever the wordmark shows.
- Title row (U-07): `.page-head` becomes a flex row (wrap): h1 left, the check in/out group
  right (the same `ClockStatus` + `ClockButton` of `ClockPanel.tsx`, in a compact variant:
  status words right-aligned over the date line, button 38px, 44px on touch). The `workbar`
  becomes one column, so the period card is full width. Phones keep the round-2 top-bar
  group (`BarClock`) and the visually hidden page head. Shared view: no check in/out (as
  now).
- U-08: remove the `<p>` under the h1 in both own and shared views; the shared h1 still
  says "{owner}'s timesheet".
- Pills (U-09), filled and outlined, `--radius-pill`, 0.78rem/600: old = amber, current =
  green, future = pink, neutral (status words such as "Draft") = grey. Ink on pill: light
  old 6.50, current 6.94, future 6.47, neutral 6.57; dark 8.05, 8.28, 8.37, 7.20 (all
  >= 4.5:1). The words remain (not colour alone). The fills differ in hue (amber, green,
  pink, grey) while the inks share a similar lightness, so the pills no longer read as one colour in light mode;
  pill outlines are decorative (the text identifies the pill), 1.93-2.07:1 light,
  3.15-3.27:1 dark. WP5-UX2-Q3 is re-asked as G-5 (the pink "future" makes the window-day
  case more visible).
- Meta row (U-10): the period card becomes a two-row grid: row 1 [<] title + pills ...
  [>] [Today] [Current period] [Review & sign off]; row 2 the meta line across the full
  width under a hairline, `flex-wrap`, gap 4px 28px (one row at 1280 in the mockup, two at
  820).
- Open a day (U-11): the label is a row (text, field, button) at every width.
- Toolbar (U-12): `.tools-right` gap `--toolbar-group-gap: var(--space-5)` (24px) with a
  1px `--line` separator; "Change several days" becomes a secondary (outlined) button so its
  edge is visible; pressed stays the solid accent (round-2 rule).

#### B5. U-13/U-14 sheet selection

- Batch-selected column: lifted (`transform: translateY(var(--lift-y))`, `--lift-y: -3px`,
  `box-shadow: var(--elev-lift)`, `--radius` corners, `z-index: var(--layer-lift)` = 1) plus
  the `--day-selected` tint; the 2px accent ring is removed. The checked selection box stays
  the state indicator (native checkbox in accent, >= 3:1; "Select {date}" name unchanged).
- Editor column: the same lift plus a 1px accent frame (`0 0 0 1px var(--accent)` as the
  first shadow layer: 6.09/6.79 on card, 5.31/6.00 on the day head, 5.53/6.40 on the
  non-working tint, 5.58/5.94 on the attention tint, all >= 3:1) and the Day cell filled
  with `--day-editing-head` (text 12.36/9.54); the 3px underline, the 2px rails and the
  whole-column `::before` fill are removed. A column that is both: tint + lift + frame +
  head fill + checked box. Today: the 3px Today bar stays on the head (inset, over the
  fill). Non-working hatching stays on the cells.
- Painting: the lift shadow is an outer shadow of the column element (painted outside the
  cells, so opaque head and attention cells cannot hide it); the frame and the Today bar
  stay on the `::after` overlay as today; a lifted column gets the card background so it
  reads as raised. The week card must not clip (`overflow: visible`); week bands are 20px
  apart so the lift shadow does not touch the next band.
- Z-order: lifted column `--layer-lift: 1`; a column with an open label picker
  `--layer-popup: 2` (unchanged, still above a lifted neighbour); there is no sticky day
  head. Hover: `--day-hover` tint only (no lift on hover; lift means state).
- Reduced motion: the lift is a static state; only its transition collapses to 0.01ms.
- Phone rows: selected = tint + checked box (no lift in a table row); editing = 1px accent
  frame on the row and the Day cell filled (`--day-editing-head`), replacing the 2px frame.
- `aria-current` on the day button and `aria-selected`/checkbox semantics unchanged.
- U-15 recommendation: rename the visible row "Label" to "Category" (the word on the PDF
  people sign, in batch mode and in the data); also the phone column header, the Day
  editor field ("Category and leave", "Category"), the picker name ("Category for {date}:
  {visible lines}"), docs/04. Owner choice G-2.
- U-16: rename "Check" to "Status" (row label, screen-reader row name, legend); "No times"
  gets a slashed ring (a circle with a diagonal bar, `currentColor`, words unchanged) instead
  of the hollow square, so nothing on the sheet looks like a checkbox; "Missing record"
  keeps the same shape.

#### B6. U-17/U-18 narrow rules

- U-17: the "Current period" button gets `data-short="Current"` and `aria-label="Current
  period"` (visible "Current" is contained in the name, SC 2.5.3). In the existing
  `period-cta` size container, with Current period shown: from 22.8rem the review link is
  full; 18.4-22.8rem "Sign off"; below 18.4rem "Current" + "Sign off" stay on one row down
  to 15.4rem (Today 62.3 + Current 73.2 + Sign off 75.1 + two 8px gaps = 226.6px, plus
  4px margin for the font risk R-UX2A-3); only below 15.4rem (no real phone; 320px gives a
  264px container) the link takes its own row. The 320px away state therefore gains one
  44px row back (first-screen budget improves).
- U-18: `.tools .open-day` becomes a size container; below 21rem (text 76 + 8 + date
  minimum 127.5 + 8 + button 95.7 = 315.2px) the words "Open a day" are visually hidden
  (the `<label>` still wraps the date field, so its accessible name stays "Open a day").
  390 (334px): text shown, one row; 360 (304px) and 320 (264px): text hidden, one row (the
  button no longer wraps: +52px for the first screen).

#### B7. U-19/U-20 editor panel

- Header on `--panel-head` with a `--line` bottom border; title "Mon 10/12/2026" (h2, 1.15rem
  heavy) with hidden "Day editor " prefix and hidden ISO date, so the dialog name stays
  "Day editor Mon 10/12/2026 (2026-10-12)"; Close is a 38px (44px touch) icon button named
  "Close". Under the title, chips: the period pill ("future period" etc., B4 colours),
  "Times in {display zone}", and only when the display zone differs from the reporting
  zone "Day in {reporting zone}". A view-only share adds "View only". Height drops from
  123.5px to about 80px (`--editor-head-size` keeps measuring it, AX-01 holds).
- The long sentence goes. Rule 7 stays visible: the title is the accounting date, the
  zones are named by the chips, and the input-zone explanation moves next to the "Input
  zone" field of the session dialog (where the zone is chosen).

#### B8. U-21..U-26 sessions, breaks and confirmations

Panel (read-only list):

- "Times" heading with "Add session" (secondary, plus icon) at its right.
- One card per session: range in the display zone (`09:00-17:30`, `+1` when the end is on
  a later local day), a state pill ("Breaks confirmed" green, "No breaks taken" green,
  "Breaks not confirmed" amber, "Running" with the live dot), a source line ("Entered by
  hand in {input zone}" or "Checked in and out"), then the break table (caption "Breaks of
  {range}", columns Break, Date (MM/DD), Start (HH:MM), Minutes; times in the display
  zone). Empty states: confirmed none: "No breaks taken"; unconfirmed: an attention strip
  "OT stays pending until breaks are confirmed." with a primary "Confirm breaks" button;
  running: "Running since 08:12" and no table. Actions per session: Edit, Delete.
- "Confirm breaks" opens the session dialog for that session with the saved rows, or,
  when it has none, the suggested breaks that lie inside the session (the old one-tap
  `quickBreaksOf` rule). The one-tap "Confirm suggested breaks"/"No breaks taken" buttons in
  the panel are replaced by this (U-21 "the panel only shows the chosen times and breaks";
  U-26 "always confirm before Save").
- The minutes of a saved break are shown as the elapsed whole minutes of its saved
  interval; a pure model function computes them from the server instants (display of the
  user's own input, not a business figure; tested).

Session dialog (modal `<dialog>`, 720px desktop, full screen below 768px):

- Title "New session" / "Edit session", subtitle "Mon 10/12/2026 · accounting date in
  {reporting zone}". Sections "Time" (Start date+time, End date+time, overnight note as
  today, Input zone with its hint) and "Breaks".
- Breaks: one checkbox "Confirm no breaks taken"; the list; "Suggest breaks" and "Add
  break". One row per break: number chip "Break n", date, start time, minutes (number
  input, placeholder "total mins", whole minutes 1-720), the computed end ("ends 10:15")
  as text, a "suggested" tag while a pre-filled suggestion is untouched, and a 36px (44px
  touch) remove button named "Remove break n". Rows are tinted strips with a 1px boundary
  and 8px apart; they wrap only when the dialog is narrow (measured: one 56px row at 720px;
  two lines on a 390 phone). Ticking the checkbox hides and disables the rows (kept in
  memory, restored when unticked).
- Mapping to the API (no API change): for an untouched saved or suggested row the pinned
  start and end instants are sent as before (an unchanged edit keeps every saved instant).
  Otherwise the start is resolved in the input zone with the shared resolver
  (`resolveLocalDateTime`; a nonexistent time raises the existing gap prompt, an ambiguous
  one the fold choice, both naming "Break n"), the end instant is start + minutes x 60 s
  (R-07: duration is elapsed UTC time), and the end is sent as its local time with the
  explicit offset (`fieldFromInstant`), so it can never hit a DST gap or fold. A break across
  midnight just has an end on the next local date. A break across the session end, before
  the session start or overlapping another row gets a row message before sending (instant
  comparison only); the server still decides (`break_outside_session`,
  `overlapping_breaks`, `future_break` with `break_index` mapped to the row).
- Pre-fill (U-23), new sessions only, when the policy effective on the date exists:
  start/end = the policy's reference start and end as wall-clock times on the accounting
  date in the saved reporting zone, converted to the input zone and pinned by offset (end
  on the next date if it is not after the start); marked by a note "Pre-filled from your
  reference hours (08:00-17:00) and suggested breaks. Change them to the times you worked."
  Suggested breaks are pre-filled only when the accounting date is before today's date in
  the reporting zone as the server reports it (`today_local` of `/api/periods/current`,
  already passed to `DayEditor` as `todayLocal`; never the device clock), and only those
  lying inside the session; they shift with the start until the person edits a break row.
- Save (U-25/U-26): Save validates, then always opens the confirmation "Save this
  session?" listing Day, Time (with zone) and Breaks ("3 breaks (15, 30, 15 min)" / "No
  breaks taken" / "Breaks not confirmed: OT for this day stays pending") and the sentence
  "Saving confirms these breaks as the breaks you took." (omitted for the not-confirmed
  case); its buttons are "Back" and "Save". What is saved: the same `SessionRequest` as
  today with `breaks_confirmed: true` when at least one row is listed or the box is ticked
  (`breaks: []` when ticked), and `breaks_confirmed: false` with `breaks: []` when the list is
  empty and the box unticked (recommended default, G-4). "Confirmed" after Save therefore
  means exactly what R-02 calls confirmed actual breaks or confirmed none.
- Cancel (and Escape, and the X): if the draft differs from its starting state, "Discard
  your changes?" with "Keep editing" (initial focus) and "Discard" (danger); otherwise it
  closes at once.
- Delete (U-22): an `alertdialog` "Delete this session?" listing Day, Time, Breaks and
  "The session and its breaks are deleted. Worked time and OT of the day are calculated
  again."; "Cancel" (initial focus) and "Delete session" (`--danger`). In an old or
  finalized period it shows the reason field bound to the editor's reason state.
- Reason (old periods): the editor keeps one reason state; the session dialog and the
  delete confirmation show the same field when the day requires a reason.
- Nested dialogs (B3-01 lesson): at most one modal on top: editor (modal below 1200px,
  non-modal above), session dialog, confirmation. Each dialog handles its own `cancel`
  event (preventDefault plus its own close) and stops propagation; the editor's Escape
  handlers ignore events whose target is inside another dialog (the non-modal one already
  ignores them while `dialog:modal` exists); the editor's re-show on crossing 1200px keeps
  waiting while any other modal is open (`DayEditor.tsx:97-120`). Focus returns: a
  confirmation to the button that opened it; the session dialog to its opener (Add
  session, Edit or Confirm breaks), or after a save to the "Times" heading; a deleted
  session to the "Times" heading.
- Check out: `ClockOutDialog` uses the same break-row component; its semantics stay E-1
  (an empty list with the box unticked omits `breaks` and checks out with breaks not
  confirmed; a listed set or the ticked box confirms and replaces the saved rows).
- Time entry format: keep native `type=date` and `type=time` inputs. They follow the
  browser locale (an en-US browser shows mm/dd/yyyy and hh:mm AM/PM, which is what the
  owner's example shows; a 24-hour locale shows 24-hour); every displayed time stays
  24-hour (E-4, the PDF). A custom 12/24-hour picker is not recommended (accessibility and
  DST handling come free with the native fields).

#### B9. U-27 WFH on the Category row

`.label-row` becomes `display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px`
with the select `flex: 1 1 8rem` and the checkbox label `flex: none`, and the "Calendar
default" hint moves below the row. Measured in the mockup at the 400px panel: select 153.4
+ WFH 202.6 on one row; the bottom sheet at 390 (358px inside) also fits (select shrinks to
143px); at 320 the checkbox wraps below the select instead of overflowing. The label text
"Worked from home (WFH)" stays (tests use it).

#### B10. Accessibility summary for the new parts

- 1.4.3 text: every new text pair above is >= 4.5:1 (lowest: accent on the new
  `--day-editing-head` 4.82, muted on `--bg` 5.10). 1.4.11: the editor frame and the
  selection checkbox >= 3:1 on every surface; the focus ring >= 4.82:1 on every new surface;
  pill outlines and lift shadows are decorative (state is in words, the checkbox and
  `aria-current`). 2.4.7/2.4.11: the shared ring on the identity button, menu items, dialog
  controls; menu and dialogs never sit under the sticky bar (the menu is positioned below
  it; dialogs are modal top layer). 2.5.3: identity button, "Current", day buttons and the
  picker names contain their visible text. 2.5.8 and the 44px rule: icon buttons 38px on a
  fine pointer (>= 24px), 44px below 768px and with a coarse pointer. 1.4.1: pills, Status
  shapes and the lifted columns all carry words, shapes or a checked box. 1.4.10: no
  horizontal overflow at 320 in the mockup; the break rows and the WFH row wrap.

### C. Canonical rules (AGENTS rule 8)

Rules quoted (EN, authoritative):

- R-01 (docs/02 line 7): "Reject same-user overlaps across all work dates; breaks must be
  inside work sessions and non-overlapping. Open/missing sessions or unknown break
  information are incomplete, not zero work. They create no automatic ledger credit/debit."
- R-02 (docs/02 line 15): "Each break has placement, duration and `counts_as_work`. Default
  suggestions shift with first check-in [...]. Confirm suggested breaks, edit actuals or
  explicitly confirm none at save/Check out/review. Unknown is different from confirmed
  zero; never deduct future breaks on a short/open shift."
- R-07 (docs/02 line 74): "Manual time entry must show and use its selected input zone,
  defaulting to the current display zone; conversion must preserve the saved accounting
  date. [...] Reject nonexistent DST local times; require explicit offset/fold for ambiguous
  times. Duration is elapsed UTC time."
- docs/04 line 16: "Actual clock values are not seeded from a schedule."
- docs/04 line 25 (defaults): "Breaks | 15+30+15 excluded; shift-relative suggestions
  requiring confirmation".
- docs/04 line 63: Day editor order "'Times' (sessions with Edit and Delete, one-tap break
  confirmation, Add session) [...] The explicit end date, the visible 'Input zone' and the
  separate save buttons ('Save session', 'Save day fields') remain."
- docs/04 line 64: "One-tap breaks: a session with unconfirmed breaks offers 'Confirm
  suggested breaks' (or 'Confirm breaks as listed' for saved rows) and 'No breaks taken';
  each sends the same session update the form sends and is disabled until a required reason
  is typed. The suggestion is offered only when every suggested break lies inside the saved
  session."
- docs/04 line 70: "Check out/save confirms suggested/actual/no breaks. Unknown breaks or
  open intervals keep OT pending. Show explicit end date for overnight entry. Batch category
  changes must expose existing work conflicts and never silently delete clock evidence."
- docs/04 line 72: "Current/future draft edits audit automatically without a reason;
  old/finalized edits require one." (also R-07 line 72, AC-04).
- docs/03 line 25: "work_sessions/breaks | Ownership, UTC start/end, originating zone,
  source, confirmed breaks; no overlapping user intervals".
- docs/10 D-02 (line 16): "Exclude all three example breaks, shift suggestions with arrival,
  confirm actual/no breaks; unknown stays pending."
- docs/10 E-1 coordinator default (line 101): "at Check out the present break list is the
  complete set and replaces saved rows; an omitted list keeps saved rows (unconfirmed days
  only)."
- docs/10 line 178 (2026-10-08): "[...] and the hidden default weekend times (canonical:
  actual clock values are not seeded from a schedule)."
- docs/12 "Unconfirmed breaks": "Check out is refused with 422 while a break row is
  unconfirmed, and future break rows on an open session are refused; confirm the breaks
  first."
- STATE.json WP1 carried risks: "Unconfirmed partial break list semantics at Clock out";
  "Open sessions accept future break rows; unconfirmed Clock out before them returns 422";
  "Clock out lacks expected_version" (the last was addressed by WP2: `ClockOutRequest`
  carries `expected_version`, `api.ts:293-298`).
- GLOSSARY: none (the file does not exist; observation in section A).

Compatibility per owner item:

| Item | Verdict | Why |
|---|---|---|
| U-21 dialog; break = start date, start time, minutes | Compatible; docs/04 wording change | R-02 "placement, duration"; R-07 "Duration is elapsed UTC time": the end is start + minutes in UTC, the API still receives start and end with explicit offset; no API change. docs/04 line 63 changes (the session form moves into a dialog; breaks have no end field; "Save session" becomes "Save"). |
| U-22 delete confirmation | Compatible | Same DELETE with version and reason; AC-04 unchanged. |
| U-23 default start/end pre-filled | **Contradicts the wording of docs/04 line 16 and docs/10 line 178** | Those lines forbid seeding actual clock values from a schedule. The owner's request is explicit and outranks (rule 8), but the rule must be rewritten, not ignored. The intent of the old rule (no time is ever stored that the person did not enter or confirm; Excel's hidden default weekend times are not copied) is kept by the proposed text below. |
| U-23 suggested breaks pre-filled for a past day | Compatible; docs/04 line 25 wording | R-02 suggestions "requiring confirmation": they stay unconfirmed until Save, and Save is now the explicit confirmation with a prompt. Only past days and only breaks inside the session, so no future break is ever deducted (R-02 last clause; server `future_break`). |
| U-24 "Confirm no breaks taken" + rows | Compatible; docs/04 lines 63-64 wording | Explicit none stays explicit; unknown (empty, unticked) stays unknown and pending (D-02). |
| U-25 Save = confirm | Compatible; docs/04 lines 63-64, 70 wording | docs/04 line 70 already says save confirms; the dialog no longer offers "listed but not confirmed" (that state remains possible only through Check out with an omitted list, E-1, and is shown as "Breaks not confirmed"). |
| U-26 confirmation before Save and on dirty Cancel | Compatible | UI only. |
| One-tap buttons replaced by "Confirm breaks" (from U-21/U-26) | Compatible; docs/04 line 64 rewritten | Same request body; one more dialog step. |

Proposed rule text for U-23 (replaces the last sentence of docs/04 line 16 and the closing
clause of docs/10 line 178):

- EN (docs/04 line 16): "Actual clock values are never stored from a schedule: a time
  becomes an actual value only when the person saves it. The new-session dialog pre-fills
  the start and end with the reference hours of the policy effective on that date (wall-clock
  times on the accounting date in the saved reporting zone, shown in the input zone) and,
  for a date before today in the reporting zone (the server's date), the suggested breaks
  that lie inside them; pre-filled values are marked as such and stay editable, and Save asks
  for confirmation first."
- VI: "Giờ thực không bao giờ được lưu từ lịch mẫu: một giờ chỉ trở thành giờ thực khi người
  dùng lưu nó. Hộp thoại thêm phiên làm việc điền sẵn giờ bắt đầu và kết thúc theo giờ tham
  chiếu của quy tắc có hiệu lực vào ngày đó (giờ đồng hồ vào ngày ghi sổ theo múi giờ báo cáo
  đã lưu, hiển thị theo múi giờ nhập) và, với ngày trước hôm nay theo múi giờ báo cáo (ngày
  của server), điền sẵn các giờ nghỉ gợi ý nằm trong khoảng đó; giá trị điền sẵn được đánh
  dấu, sửa được, và nút Save luôn hỏi xác nhận trước."
- docs/10 line 178 (EN): replace "(canonical: actual clock values are not seeded from a
  schedule)" by "(canonical: actual clock values are never stored from a schedule; the
  new-session dialog may pre-fill the reference hours as marked, editable values, see
  document 04)"; VI accordingly.

Effect of the rule change: worked minutes, OT credit, review warnings and sign-off are
unchanged for any saved data; the server receives the same request shapes and computes the
same figures. The only new risk is behavioural: a person who saves the pre-filled values
without checking records the reference hours as actual times. Mitigations in the design:
the "Pre-filled from your reference hours" note, the "suggested" tags, and the mandatory
"Save this session?" summary. No server or API change is needed (the policy, `today_local`
and the suggestion function are already on the client).

### E. Docs impact (EN and VI each; docs/04 and docs/04.vi share line numbers)

- docs/04 line 7 (App shell): desktop bar = brand (wordmark from 1024px, from 1280px with
  the "Shared with me" switcher), Timesheet, Overtime, History, the identity block and its
  account menu (Profile, Settings, Administration for admins, Theme, Sign out); phone More =
  the same account content.
- docs/04 line 8 (Timesheet): check in/out on the title row (desktop), not a card.
- docs/04 line 9 (Day editor): session dialog, panel lists sessions and break tables.
- docs/04 line 13 (Settings/admin): Settings sub-pages Personal, Profile, Administration;
  `#/admin` redirects for admins.
- docs/04 line 16: the U-23 rule text (section C).
- docs/04 line 25: "shift-relative suggestions, pre-filled for past days in the new-session
  dialog, confirmed by Save".
- docs/04 line 41: row names "Category" (if G-2 a) and "Status"; "No times" shape.
- docs/04 line 43: "Label cell" becomes "Category cell".
- docs/04 line 46: the open-day marker (lift, 1px frame, Day cell fill) and the batch
  selection (lift, tint, checked box) replace the rails, underline and ring.
- docs/04 line 48: phone rows (1px frame), first-screen sentence ("Current" keeps one row at
  320; "Open a day" text hidden when its row does not fit).
- docs/04 line 53: period bar two rows, the pill colours, meta row wrapping; line 56: phone
  buttons "Current".
- docs/04 line 57: Check in/out on the title row on a desktop.
- docs/04 line 58: toolbar spacing and "Change several days" as an outlined button.
- docs/04 lines 62-66: editor header (chips), session dialog, break rows, Save/Cancel and
  delete confirmations, pre-fill, "Confirm breaks", WFH on the Category row, "Category for
  {date}" picker.
- docs/04 line 70: "Save in the session dialog confirms the listed breaks or the ticked 'no
  breaks taken'; an empty list with the box unticked keeps breaks unknown".
- docs/04 lines 76-87 (Visual standard): the B1 tokens (surfaces, elevation, radius scale,
  motion list and durations, weights, pills) and the identity/menu pattern; keep the hover,
  focus, touch and day-state paragraphs (values unchanged).
- docs/02: no rule text changes (R-02 and R-07 already allow the design); optional
  clarification in R-02 is not needed.
- docs/03: none (no data or API change).
- docs/05: none.
- docs/06: none to the AC table; the gate wording in docs/06 is unchanged (the package gate
  lists the checks).
- docs/10: a new "Owner decisions 2026-10-15 (UI change round 3)" section listing U-01..U-27
  in English and the answers to G-1..G-5; a statement that the modern style supersedes the
  E-8 values (4px, 300 ms ease-out) while keeping plain CSS and custom properties; the U-23
  rule change; coordinator defaults of this round (Settings sub-pages and redirect, disclosure
  menu pattern, empty-list Save, native time inputs, Check out dialog reuse); line 178 edit.
- docs/12: a "WP5 change round 3" bullet list (what people see), same pattern as rounds 1-2;
  "Unconfirmed breaks" limit line updated (Confirm breaks opens the dialog).
- GLOSSARY.md: none (absent; creating it is out of this round; flagged under I).
- DEVELOPMENT.md and CLAUDE.md: no change (`grep -niE
  "industrial|high-end|4px|300 ?ms|radius"` over DEVELOPMENT.md, DEVELOPMENT.vi.md and
  CLAUDE.md found nothing, exit 1).

### F. Tests

New or changed checks per item (Playwright projects "desktop" and "mobile"; every theme
check in light, dark and both manual overrides as the round-2 specs do; contrast through
`tests/e2e/contrast.ts`; dates always from the server's `today_local` and the displayed
period, never the device clock):

| Item | Unit (`tests/client`) | e2e (`tests/e2e`) |
|---|---|---|
| U-01/U-02 | `cssThemeParity.test.ts`: the new tokens exist in `:root` and are identical in both dark sets; a static test that `--transition` lists no `all` and that no rule uses a literal radius or shadow outside tokens | new `surfaces.spec.ts`: card on page >= 1.12:1 and week sheet carries `--elev-2` in both themes; screenshot captures |
| U-03/U-04 | `accountModel.test.ts` (new): initials (one word, two words, non-letter, empty name falls back to email), truncation is CSS only | `shell.spec.ts`: identity button name contains name and email; Enter/Space opens, focus to the first item, Tab order Profile, Settings, (Administration), Theme (one stop), Sign out, Escape returns focus, outside click and hash change close; email contrast >= 4.5 both themes; long-name truncation without overflow at 1024/1280 |
| U-05 | `routes` model test: `#/admin` canonicalises to `#/settings/admin` for admins and to `#/timesheet` for employees; `#/settings/profile` | `admin*.spec.ts`, `import.spec.ts`, `isolation.spec.ts`: reach Administration through the menu or `#/settings/admin`; employee: no Administration link, `#/settings/admin` and `#/admin` show no Administration heading and make no `/api/admin/` request (request listener); integration 403 tests unchanged |
| U-06 | none | `logo.spec.ts`: wordmark visible at 1024 without a share, hidden at 1024-1279 with a share, visible at 1280/1440/1920 with a share, bar one row (<= 64px) and no overflow in each case |
| U-07/U-08 | none | `shell.spec.ts`: on >= 768px the check in/out group sits in the title row right of the h1 (same row box), no `.clock-panel` card; phone unchanged; shared view has none; no name line under the h1 (own and shared) |
| U-09 | `periodBarModel.test.ts`: relation to pill class | `timesheet.spec.ts`: each pill's ink >= 4.5:1 on its fill in four theme situations; the three fills differ (computed colours not equal); `.badge.old`/`.badge.current` selectors become the new pill classes (or keep the class names) |
| U-10/U-11/U-12 | none | `timesheet.spec.ts`: at 1280 the three meta spans share one row and wrap at 820; "Open a day" text, field and button share one row at >= 768px; the gap between the switch and "Change several days" equals the token |
| U-13/U-14 | `sheetModel.test.ts` (`dayClass` unchanged) | rewrite `timesheet.spec.ts:594-1136` marker tests: editor column has the lift shadow, the 1px accent frame (>= 3:1 on card, head, non-working and attention surfaces) and the Day-cell fill, no underline and no rails; selected column has the lift and tint, no ring; both together; today bar still painted; open picker above a lifted neighbour; no sideways scroll at 768/1024/1280 with lifted columns; reduced motion: no transition duration |
| U-15/U-16 | `sheetModel.test.ts`: `SHEET_ROWS` names, check text unchanged, new "No times" shape | e2e selectors `Label for` become `Category for` (if G-2 a) in `day-editor.spec.ts:1166-1354`, `sharing.spec.ts:252, 347-348`; the "No times" marker is not a box (shape class) |
| U-17/U-18 | none | `today.spec.ts:364-470`: away state at 320 keeps Today, "Current" and "Sign off" on one 44px row, accessible names "Current period" and "Review & sign off"; "Current period" in full at 360-390; `timesheet.spec.ts` phone: "Open a day" text hidden below the threshold, the field's accessible name is still "Open a day", field and button share one row at 320/360/390; first-screen budgets re-measured (landing and away, own and share) |
| U-19/U-20 | `dayEditorModel.test.ts`: chip list from relation and zones (zone chip only when zones differ) | `day-editor.spec.ts`: dialog name "Day editor {weekday} {MM/DD/YYYY} ({ISO})"; head surface differs from body; AX-01 scroll padding still clears the head |
| U-21/U-24 | new `breakRowsModel.test.ts`: start+minutes to request (offset pinned), untouched rows keep saved instants, midnight crossing, DST fall-back start (fold needed) and spring-forward gap (gap prompt), America/Los_Angeles and Asia/Ho_Chi_Minh input zones, minutes validation 1-720, outside-session and overlap messages, saved interval to minutes display | `day-editor.spec.ts`: rewrite the session flows (lines 85-470, 761-786) to the dialog ("New session"/"Edit session" dialogs, "Break n" rows, "Save"); the four DST and zone tests keep their assertions on stored instants; Check out dialog flows (477-559, `shell.spec.ts:171`) use "Confirm no breaks taken" |
| U-22 | none | `day-editor.spec.ts:788-806`: Delete opens an alertdialog with the day and time; Cancel has initial focus, Escape cancels and returns focus to Delete; "Delete session" sends the version (and the reason in an old period); `sharing.spec.ts:264` checks "Delete session" absent in view-only |
| U-23 | `breakRowsModel.test.ts`: reference hours to start/end on the accounting date in the reporting zone shown in another input zone; suggested rows only when `workDate < todayLocal` (server date passed in), only inside the session, re-shift until a row is edited | e2e: a past workday (derived from `today_local` minus N days inside the displayed or previous period) opens "New session" with 08:00/17:00 and three suggested rows; today's date opens with times but no rows; the device zone set to Asia/Ho_Chi_Minh does not change which day counts as past |
| U-25/U-26 | `breakRowsModel.test.ts`: `breaks_confirmed` true with rows or ticked box, false with empty unticked; prompt summary text | e2e: Save always opens "Save this session?"; Back returns to the dialog with values kept; the saved day shows "Breaks confirmed" and its OT/status from the server; an empty unticked save shows "Breaks not confirmed" and OT "pending"; Cancel after a change asks "Discard your changes?", Keep editing keeps values, Discard closes; Cancel without a change closes at once; nested Escape closes only the top dialog at 1280 (non-modal editor) and 1024 (modal editor) and while the window crosses 1200px (B3-01 pattern) |
| U-27 | none | `day-editor.spec.ts`: select and WFH checkbox bottoms align (same row) at 1280 (panel) and 390 (sheet); wrap without overflow at 320 |

Existing assertions that must change, and why each is not a weakening:

- `shell.spec.ts:56-57, 62-101, 297-330` (Settings link in the bar, Theme first in
  `.shell-user`, Sign out in the banner, Tab order): replaced by the menu tests above, which
  assert the same items (Settings, Theme, Sign out) are reachable, in a fixed order, by
  keyboard, with focus return; nothing becomes untested.
- `admin.spec.ts:421-438`, `import.spec.ts:118, 400`, `isolation.spec.ts:116, 152, 202-203`,
  `admin-status.spec.ts:198`, `sharing.spec.ts:291` (Settings/Admin as main-nav links):
  the same navigation through the account menu or the Settings sections nav, plus the
  stronger employee check (no admin request at all).
- `hover.spec.ts:110` (secondary button "Sign out" in the banner): the hover check moves to
  another secondary button in the bar region (for example "Open" of the switcher) and a menu
  item; the hover criterion itself is unchanged.
- `logo.spec.ts:240-269` (wordmark from 1440): new breakpoints, stricter (more widths,
  both share states, one row).
- `timesheet.spec.ts:594-1136` (rails, underline, ring, painted layers): the owner removed
  those looks; the new tests assert the replacement indicators with the same contrast
  thresholds on the same surfaces, plus reduced motion.
- `today.spec.ts:389-470` (at 320 the review link takes its own row): replaced by "one row
  with Current" (stricter: fewer rows, same names, same 44px).
- `day-editor.spec.ts` session-form tests (radios "Breaks not confirmed yet", "Confirm
  suggested breaks", "Save session", "Save changes", labels "Break n from time"): replaced
  by the dialog flows with the same stored-instant and figure assertions; the one-tap tests
  (`1043-1145`) become "Confirm breaks" tests with the same request-body assertions
  (version, reason, rows) plus the confirmation prompt.
- `day-editor.spec.ts:788-806` "Confirm delete": replaced by the dialog; the version
  assertion stays.
- `timesheet.spec.ts:300, 417`, `day-editor.spec.ts:1235` `.badge.current`/`.badge.old`:
  keep the class names on the new pills (no change needed) or update the selector; the
  visibility assertion stays and the contrast assertion is added.
- Picker names `Label for {date}` (if G-2 a): renamed only.

Simulated-clock instants for the gate sweep (America/Los_Angeles reporting zone; payroll
10/30/2026 for the period 10/12-10/25, window days 10/26-10/30): `2026-10-20T17:00:00Z`
(mid-period, Tuesday), `2026-10-26T16:00:00Z` (first window day), `2026-10-30T23:00:00Z`
(last window day, payroll Friday), `2026-10-27T06:58:30Z` (90 s before the reporting-zone
midnight), `2026-11-01T08:45:00Z` (01:45 PDT, inside the fall-back fold; a manual break
started at 01:45 needs the fold choice), `2027-03-14T10:30:00Z` (spring-forward day, 03:30
PDT; 02:30 does not exist), plus the real clock. Every new e2e check derives its dates from
`/api/periods/current` and the displayed period (the existing `displayedSeed.ts` and
fixtures helpers), so it passes on every day and at every time.

### G. Owner questions (genuine choices; recommendations in brackets)

- **G-1 Mockup and the modern direction (U-01, U-02, and the E-8 values).** After viewing
  `handoff/delivery/design/WP5-UX3/mockup.html` (or the ten PNG renders): [a] approve the
  direction as drawn: lighter-grey page, raised white week sheets and panels with soft
  shadows, radius scale 6/8/12px plus round pills, 180 ms eased transitions instead of
  4px and 300 ms (E-8's plain-CSS rule stays); b approve with named changes; c keep the
  current look and apply only the functional items. Blocks: WP5-UX3-GOV and every slice that
  applies the new style (T01-T05, T07-T09). T06 can run meanwhile.
- **G-2 The word for the "Label" row (U-15).** [a] "Category" (the word on the PDF the
  employee signs, in batch mode "Category for selected days" and in the data); b "Day type";
  c keep "Label". Applies to the sheet row, the phone column, the Day editor field and the
  picker name. "Check" becomes "Status" in every option (the owner's own suggestion; it is
  a status display, not a toggle). Blocks only the rename part of T05.
- **G-3 Pre-filled start and end times (U-23) and the rule change (section C).** [a]
  pre-fill the reference hours automatically in a new session and the suggested breaks for
  past days, marked and editable, with the rule text of section C; b show a button "Use my
  reference hours" instead of filling automatically (no rule change); c no time pre-fill,
  only the suggested breaks. Blocks the pre-fill part of T08 and the docs slice.
- **G-4 Saving with no break listed and the box unticked (U-24/U-25).** [a] allow it: the
  confirmation says "Breaks not confirmed: OT for this day stays pending" and the session is
  saved with breaks unknown (as R-02 allows, for example when the person does not remember
  yet); b block Save until a break is listed or "Confirm no breaks taken" is ticked. Blocks
  one flag in T08 only; default (a) if the owner does not answer.
- **G-5 (optional, re-asks WP5-UX2-Q3) The badge of the period that contains today in the
  five window days.** With "future" now pink it stands out more: a keep "future"; [b] show
  "in progress" (blue pill) for the period that contains today while another period is the
  current one. Blocks nothing; T04 includes (b) if chosen.

Recommended defaults the coordinator may adopt without asking (AGENTS rule 2): the
disclosure account menu and its item order; a read-only Profile; Settings sub-pages as
links with their own h1 and the `#/admin` redirect for admins; the wordmark rule (1024px,
1280px with the switcher); native date and time inputs (their 12/24-hour display follows
the browser locale; every displayed time stays 24-hour as E-4); the Check out dialog reusing
the break rows with E-1 semantics; "Confirm breaks" replacing the one-tap buttons; the
"No times" slashed ring; "Change several days" as an outlined button; the "Current" and
"Open a day" thresholds; the editor chips; the backlog choices of section I.

### H. Slicing

One source writer at a time; every slice ends with its own freeze commit by
`timesheet-committer`. No slice changes `src/server/`, `src/domain/`, request bodies,
schemas, the PDF or the CSP. Server boundary for the gate: build `dist/server` and compare
it with the a643794 build (must be byte-identical), and `git diff a643794 -- src/server
src/domain` must be empty.

| Task | Package | Scope | Size / risk / novelty | Profile, model | Owned paths | Depends on | Tests to add or update |
|---|---|---|---|---|---|---|---|
| WP5-UX3-GOV | GOV | Replace the AGENTS.md UI section and its AGENTS.vi.md counterpart with the B2 text; closes GOV-E8-AUDIT R2 | S / M (governance path) / no | worker, sonnet | `AGENTS.md`, `AGENTS.vi.md`, its task record | G-1 (a or b) | governance validators and precommit; then GOV-FREEZE, GOV-GATE (verifier), GOV-AUDIT (auditor, opus, fresh) |
| WP5-UX3-T06 | WP5 | Pure break-row model: start+minutes to request, pinned instants, DST gap/fold, midnight, minutes validation, row messages, saved interval to minutes, reference-hour pre-fill, past-day suggestions (`todayLocal` from the server), `breaks_confirmed` rule for both G-4 options behind one parameter | M / H (break input to worked minutes) / yes | worker-high, opus (override: risk H plus novelty for the integrity core) | `src/client/components/breakRowsModel.ts` (new), `src/client/components/sessionModel.ts`, `src/client/components/dayEditorModel.ts`, `tests/client/breakRowsModel.test.ts` (new), `tests/client/sessionModel.test.ts`, `tests/client/dayEditorModel.test.ts` | plan accepted (no owner answer needed; can run while the owner reviews the mockup) | unit tests listed in F (U-21..U-25); no UI change |
| WP5-UX3-T01 | WP5 | Tokens and surfaces: B1 tokens in `:root` and both dark sets, elevation scale, radius scale, motion list, weights, page/card/week-sheet structure, footer card | M / M / yes | worker-high, sonnet | `src/client/styles.css`, `src/client/TimesheetScreen.tsx` (card wrappers only), `src/client/components/TimesheetSheet.tsx` (week and foot wrappers only), `tests/client/cssThemeParity.test.ts`, `tests/client/styleTokens.test.ts` (new), `tests/e2e/surfaces.spec.ts` (new), screenshots in specs that already capture | GOV-AUDIT PASS, G-1 | F U-01/U-02; focus-ring, hover and AX-09 specs stay green unchanged |
| WP5-UX3-T02 | WP5 | Identity block, account menu, phone More content, desktop nav without Settings/Admin, wordmark rule | M / M / yes | worker-high, sonnet | `src/client/components/AppShell.tsx`, `src/client/components/AccountMenu.tsx` (new), `src/client/components/accountModel.ts` (new), `src/client/components/ThemeToggle.tsx` (placement only), `src/client/styles.css` (shell part), `tests/client/accountModel.test.ts` (new), `tests/e2e/shell.spec.ts`, `logo.spec.ts`, `theme.spec.ts`, `hover.spec.ts`, `focus-ring.spec.ts`, `setup.spec.ts`, `sharing.spec.ts`, `keyboard-access.spec.ts`, `tests/e2e/fixtures.ts` (one helper to open the account menu or More) | T01 freeze | F U-03, U-04, U-06 and the replaced shell assertions |
| WP5-UX3-T03 | WP5 | Settings sub-pages (Personal, Profile, Administration), Profile page, routes and `#/admin` redirect | M / H (authorization surface; server unchanged) / no | worker-high, sonnet | `src/client/App.tsx`, `src/client/components/AppShell.tsx` (routes only), `src/client/SettingsScreen.tsx`, `src/client/AdminScreen.tsx`, `src/client/ProfileScreen.tsx` (new), `src/client/components/SettingsNav.tsx` (new), `src/client/styles.css` (settings nav), `tests/client/routes.test.ts` (new), `tests/e2e/admin.spec.ts`, `admin-status.spec.ts`, `admin-users.spec.ts`, `import.spec.ts`, `isolation.spec.ts`, `history-settings.spec.ts` | T02 freeze | F U-05 (employee: no admin request; 403 integration unchanged) |
| WP5-UX3-T04 | WP5 | Title row with check in/out, no name under the title, two-row period card, pills, meta row, Open a day row, toolbar spacing, phone "Current", phone Open-a-day text, G-5 if (b), R-UX2A-3 margin, R-UX2A2-1 | M / M (first-screen budgets) / no | worker-high, sonnet | `src/client/TimesheetScreen.tsx`, `src/client/components/ClockPanel.tsx`, `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`, `src/client/components/OpenDay.tsx`, `src/client/styles.css`, `tests/client/periodBarModel.test.ts`, `tests/e2e/timesheet.spec.ts`, `today.spec.ts`, `shell.spec.ts` (clock card), `sharing.spec.ts` (shared header), `keyboard-access.spec.ts` | T03 freeze; G-5 optional | F U-07..U-12, U-17, U-18; all four 390x844 budgets (landing and away, own and share) |
| WP5-UX3-T05 | WP5 | Sheet: lift for batch and editor columns, frame, Day-cell fill, phone rows, Category/Status names, "No times" shape, R-UX2A-4, R-UX2A2-3 | M / M / yes | worker-high, sonnet | `src/client/components/TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `sheetModel.ts`, `DayStatus.tsx`, `dayModel.ts`, `labelPickerModel.ts`, `src/client/styles.css`, `tests/client/sheetModel.test.ts`, `labelPickerModel.test.ts`, `tests/e2e/timesheet.spec.ts` (marker tests), `day-editor.spec.ts` (picker names), `sharing.spec.ts` (picker names), `keyboard-access.spec.ts`, `focus-ring.spec.ts` | T04 freeze; G-2 for the rename | F U-13..U-16 |
| WP5-UX3-T07 | WP5 | Editor panel: header and chips, session cards with break tables, "Confirm breaks" entry point, delete confirmation dialog, WFH on the Category row | M / M / yes | worker-high, sonnet | `src/client/DayEditor.tsx`, `src/client/components/DayFieldsForm.tsx`, `src/client/components/ConfirmDialog.tsx` (new), `src/client/components/SessionList.tsx` (new), `src/client/styles.css`, `tests/e2e/day-editor.spec.ts` (head, delete, WFH), `sharing.spec.ts:264`, `import.spec.ts:233` | T05 and T06 freezes | F U-19, U-20, U-22, U-27 |
| WP5-UX3-T08 | WP5 | Session dialog: break rows UI, "Confirm no breaks taken", Suggest/Add, pre-fill (G-3), Save and Cancel confirmations (G-4), nested dialogs and focus returns, phone full-screen layout; removes the inline form and the one-tap block | M-L / H / yes | worker-high, opus (risk H, nested-dialog regressions B3-01) | `src/client/components/SessionDialog.tsx` (new, replaces `SessionForm.tsx`), `src/client/components/BreakRows.tsx` (new, replaces `BreaksEditor.tsx`), `src/client/components/LocalTimeField.tsx`, `src/client/components/TimeProblemPrompt.tsx`, `src/client/DayEditor.tsx`, `src/client/styles.css`, `tests/e2e/day-editor.spec.ts` (session flows, DST, zones, one-tap tests) | T07 freeze; G-3, G-4 | F U-21, U-23..U-26 |
| WP5-UX3-T09 | WP5 | Check out dialog adopts `BreakRows` with E-1 semantics | S / H / no | worker-high, sonnet | `src/client/components/ClockOutDialog.tsx`, `src/client/styles.css` (if needed), `tests/e2e/day-editor.spec.ts:477-559`, `tests/e2e/shell.spec.ts` (check-out step) | T08 freeze | Check out with listed rows, with the box ticked, with nothing (omitted list, unconfirmed), stale version |
| WP5-UX3-T10 | WP5 | Docs EN and VI: docs/04, docs/10 (round 3 owner decisions, answers, rule change, E-8 relation, line 178), docs/12 | S-M / L / no | worker, sonnet | `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`, `docs/12_RELEASE_NOTES.md` and `.vi.md` | T09 freeze; all answers | link and translation checks |

Order of the single writer: T06 (may start at once) -> GOV chain (after G-1) -> T01 -> T02 ->
T03 -> T04 -> T05 -> T07 -> T08 -> T09 -> T10 -> gate -> audits -> re-accept. If G-1 is
late, T06 then waits; nothing else can start before GOV-AUDIT because every other slice
applies the new style or changes surfaces it defines.

Package-final gate WP5-UX3-GATE (verifier, sonnet): `npm run verify` (typecheck, lint with
typescript-eslint `no-deprecated`, unit tests, build, smoke), the full e2e suite on both
projects on the real clock, and a simulated-clock sweep at the six instants of section F;
AC-13 in two device zones (America/Los_Angeles and Asia/Ho_Chi_Minh); contrast checks in both
themes and with both manual overrides; 44px targets below 768px; no horizontal scroll at 320,
360, 375, 390, 768, 1024, 1280 and 1440; the 390x844 first-screen budgets in every state
the round-2 tests assert (landing and away, own and with a share, with and without the zone
note); the container drill for the release image; the server boundary above; `npm run
digest` last.

Fresh independent audit: two area audits plus one integration pass (docs/08 row for WP5),
auditor profile, opus (never below the strongest author model, which is opus for T06 and
T08). Area A (U-01..U-20, U-27, governance applied): owner fidelity, style tokens and both
dark sets, menu and Settings sub-pages, admin authorization unchanged (no client admin
request for employees, 403 on the server), sheet markers, no WCAG 2.2 AA regression of
AX-01..AX-10 and the round-2 items, first-screen budgets, test strength (mutations on the
lift/frame, the wordmark rule, the menu Escape and focus return). Area B (U-21..U-26):
break start+minutes mapping including DST and midnight, untouched rows keeping saved
instants, pre-fill only for past days by the server date, Save semantics against R-02 and
D-02, the U-23 rule change, unchanged worked minutes, OT credit and review warnings for the
same inputs, nested dialogs (B3-01), zone semantics (AGENTS rule 7), test strength
(mutations on `breaks_confirmed`, the past-day comparison and the end computation). The
integration pass re-runs AC-13 and reads both reports.

### I. Optional backlog touching the same components

| Item | Recommendation | Reason |
|---|---|---|
| R-UX2A-3 phone review-link thresholds depend on the system font | include (T04) | the same container query lines change for "Current"; add a few rem of margin |
| R-UX2A-4 axe `label-content-name-mismatch` on phone day buttons | include (T05) | the phone Day cell changes anyway; a space between the two spans fixes it |
| R-UX2A2-1 inactive Today differs mainly by hue | include (T04) | the period buttons are restyled; a dashed or no border while inactive is one line |
| R-UX2A2-3 desktop picker name misses the second label line | include (T05) | the picker name changes with the Category rename |
| R-UX2A-5 / WP5-UX2-Q3 "future" on the period Today opens | owner G-5 | business wording, not decided silently |
| R-B7-1 switcher select clipped at 355-420px | exclude | the phone bar is not changed by this round |
| R-UX2A-1 no Cache-Control on static files | exclude | server change |
| R-UX2A2-2 extra periods read on visibility | exclude | unrelated code path |
| R-UX2A2-4 midnight decision guarded only by the simulated clock | exclude (keep the gate's simulated instant) | no code change in this round |
| Missing `GLOSSARY.md` (AGENTS names it) | exclude; flag to the coordinator | a domain-doc task, not UI |

### Final checks (2026-10-15)

- Privacy scan of the new files (`grep` output `D:\.claude-tmp\timesheet\WP5-UX3-PLAN\privacy.txt`):
  the only at-sign tokens outside `example.invalid` addresses are `@playwright` (package
  name) and `@media` (CSS); the mockup uses only `example.invalid` addresses and synthetic
  "Example ..." names; no user-profile path (the two `$LOCALAPPDATA`/`$APPDATA` lines are the
  brief's environment-variable commands); the owner's name does not appear (the git author
  handle in Step 0 is recorded because the brief asks for the author). PNG basenames all
  contain `synthetic`.
- `git status --short` at the end (`status-end.txt`): the Step 0 entries unchanged (5
  modified coordinator files, this brief) plus one new untracked folder
  `handoff/delivery/design/WP5-UX3/` (mockup.html and ten `-synthetic.png` renders). No
  other path changed; no source, test, doc, governance or state file was edited.
- `npm run digest` at the end (`digest-end.txt`):
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files), equal to Step 0.
- Processes: the probe stopped its own server through the child handle; `netstat -ano`
  shows no socket on ports 48520-48529 (`port-count.txt`: 0). No background task was started.
- Deviations: none from the runtime rules. Two notes: the sections are ordered A, D (written
  early, with the mockup), B, C, E, F, G, H, I; current-state screenshots stay in the temp
  folder (they are evidence for section A, not deliverables).

Status: done.
