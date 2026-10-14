# WP5-UX2-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-PLAN; package WP5; kind plan;
  attempt 1; no task dependency. WP5 is accepted on 90b98ef (WP5-UX-AUDIT-AB9 PASS); this
  task opens the owner-requested UI change round 2 before pilot activation.
- Owner request (chat, 2026-10-14; the Vietnamese text is recorded verbatim in the board
  `owner_decisions`; English translation). On the "Timesheet" page:
  1. Clicking a column (which opens the "Day editor" panel on the right) shows no
     selection. Highlight the whole column so it is clear which column the Day editor is
     showing.
  2. The selection in the "Label" combo box uses a rather thick border. The owner wants a
     lighter, more elegant presentation that is still prominent enough to recognise
     easily.
  3. A toggle button in the main navigation to switch the theme mode (dark/light).
  4. When the mouse pointer moves over the toggle buttons, the hover highlight colour is
     too faint and hard to see; make it clearer.
  5. After "Open day" or after moving to other periods, an explicit "Today" button to
     return to the current day/period.
  6. Change the "Show details" button into a slide toggle (switch).
- Baseline: the board's last commit is aa3a7a02f04a059843d120f7372848709f816f69
  (WP5-UX-ACCEPT, handoff-only). The accepted source is
  90b98efc395c3894a21a909b6d361eadc6fc2bd9 with source digest
  57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d. The coordinator's
  records written after WP5-UX-ACCEPT may be uncommitted, or the owner may have committed
  them himself (this happened before, for example 49a3ff0). Step 0 reconciles this,
  read-only.
- Routing: size M, risk M (client-only UI by default, but item 5 touches accounting-date
  and zone semantics, and items 1, 2, 4 and 6 touch WCAG 2.2 AA states that earlier audits
  closed), novelty no (tokens, toggles, the period bar and the day editor already exist).
  Profile timesheet-planner (effort high, fixed by the profile); requested model sonnet;
  `model_override_reason` none (docs/08 row "Plan/diagnose a bounded issue").
- Record in English. Begin your returned result with 'Self-reported model: ...'.

## Hard rules

- No edits to application source, tests, docs, configuration or shared state (board,
  STATE.json, NEXT_ACTION, checkpoints). Write only the owned paths below. No commit, push,
  install or dependency change. No `git add`, `git stash`, `git checkout`, `git restore`,
  `git reset`, `git clean` or any other index or working-tree change.
- NO STDIN SCRIPTS: NEVER feed a script to python or node through stdin (no `-`, no
  heredocs, no `| node`, no `| python`). Earlier agents left looping background tasks this
  way. Write any probe to a file in the temp folder and run that file. Do not call python
  at all unless you run an existing script file.
- Never use cmd.exe (with or without /c) or an interactive shell. Run npm/node from Git
  Bash with Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
  Record `node --version` (must be v24.x). Never kill processes by PID. NEVER pipe output
  into head or tail; redirect to a file in the temp folder and read that file.
- Raw command output goes only to `D:\.claude-tmp\timesheet\WP5-UX2-PLAN\` (create it).
  Never create files in the repository root, at a drive root or anywhere else outside the
  owned paths and that temp folder (earlier agents left stray files at `D:\`). Copy into
  the repository only masked material: user-profile paths as `<user>`, emails as
  `<email>`. Never write a synthetic email address with its at sign in your records;
  write `<email>` or "a synthetic example.invalid address".
- Do not touch `B:\Temp\claude` or any Claude session folder.
- Running the app is optional. If you do: a fresh database under the temp folder with BOTH
  `DATA_DIR` and `DATABASE_PATH` set explicitly there, the documented synthetic
  `npm run seed` path, ports from 48500-48509 only, local mail capture only, and a
  self-closing script that stops its own server. Screenshots are synthetic only and their
  basenames must contain `synthetic` (precommit privacy rule).

## Step 0: read-only reconciliation (record it first under Results)

- `node --version`.
- `git rev-parse HEAD`, `git status -sb` (branch line with ahead/behind against the local
  `origin/main` ref; no fetch needed).
- `git log --format='%H %an %ad %s' aa3a7a02f04a059843d120f7372848709f816f69..HEAD` and, per
  commit, its changed paths (`git show --stat --format= <sha>` into a temp file). Record
  author, message, and whether any path lies outside `handoff/`.
- `git status --short` (full list in the temp folder). In Results, group the paths under
  `handoff/` (modified / untracked counts and the main records) and list every path outside
  `handoff/` in full.
- `npm run digest` with Node 24: digest and file count; compare with 57e2974c. If it
  differs, explain the cause (paths outside `handoff/` that differ from 90b98ef, tracked or
  untracked).
- Do not stop for a difference (this task is read-only for source); report it.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load the
  skills it names (`stitch-design-taste`, `design-taste-frontend`, `high-end-visual-design`)
  with the Skill tool if they are available; if one is not, say so and apply the AGENTS.md
  text directly. `.claude/skills/redesign-existing-projects` is optional.
- docs/04_UX_AND_SETTINGS.md (primary: Timesheet page, day editor side panel and bottom
  sheet, label picker, period bar, Open a day, Show details, navigation, themes,
  accessibility promises, with line numbers); docs/10_DECISIONS_AND_SOURCES.md (UI
  decisions); docs/06_TEST_AND_ACCEPTANCE.md (UI acceptance criteria, the e2e gate,
  AC-13); docs/05 and docs/02 only for the rule that chooses the displayed or current
  period and the accounting date in the saved reporting zone; docs/03 for the client/API
  boundary and the content security policy; docs/12_RELEASE_NOTES.md (where client changes
  are recorded).
- `handoff/delivery/WP5_HANDOFF.md` (UI change round and re-acceptance section),
  `handoff/delivery/WP5_UX_REVIEW_AB9.md`, `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md`
  (AX-01..AX-10) and the results in `handoff/delivery/tasks/WP5-UX-FIX6.md` and
  `handoff/delivery/tasks/WP5-UX-FIX7.md` (focus-ring and label-picker contrast fixes that
  this round must not regress).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` and `handoff/delivery/design/WP5-UX/mockup.html`
  (the accepted design direction of round 1).
- `src/client/`: the Timesheet screen, the sheet components, the day editor (side panel and
  bottom sheet), the label picker, the period bar and its model, the app shell and
  navigation, `styles.css` tokens and both themes. The server code that sets security
  headers or the content security policy (for the theme pre-paint question). The unit and
  e2e tests that depend on the affected roles, names and selectors, including the
  focus-ring/contrast checks and the seed-date helpers from WP5-UX-FIX9/FIX10.
- The board (read-only): `owner_decisions` (the last entry is this request),
  `coordinator_decisions`; STATE.json WP5 `carried_risks` (optional backlog).

## Required output

Write the plan under "Results" in this file, and the mockup under
`handoff/delivery/design/WP5-UX2/`.

A. **Current state per item 1-6.** The exact components and CSS (file:line), the current
   behaviour and states, why the owner's complaint holds (measured values: border widths,
   colours, contrast ratios in light and dark, hover deltas), and the existing tests that
   pin the current behaviour. Separate observations from assumptions.

B. **Design per item** (concrete and implementable). Tokens as CSS custom properties in
   `src/client/styles.css` (no arbitrary literals); every relevant state (rest, hover,
   active, focus-visible, selected/checked, disabled) in both themes; computed contrast
   ratios proving WCAG 2.2 AA (1.4.3 text, 1.4.11 non-text 3:1 for state indicators and
   component boundaries, 2.4.7 focus visible, 2.4.11 focus not obscured, 2.5.8 target size,
   1.4.1 not colour alone); ARIA and keyboard semantics; reduced motion (the shared
   transition token and `prefers-reduced-motion`); desktop with the side panel (>= 1200px),
   the modal editor (< 1200px) and the phone (320-430px: 44px targets, no horizontal scroll,
   and the docs/04 first-screen budget, the first day row above the tab bar at 390x844,
   must still hold after any control is added). Settle these points:
   1. Column highlight: which cells (every row of that day, header to footer, including
      detail rows when shown); how "selected for the editor" differs visibly from "today",
      hover, batch selection and the non-working-day hatching; the phone equivalent; what
      happens on close, on a period change and when the editor switches day; the ARIA state
      that exposes the selection (for example `aria-current`, or `aria-expanded` with
      `aria-controls` on the day button), without changing accessible names that tests and
      docs/04 line 48 rely on unless needed.
   2. Label picker: a lighter selected (current value) style and a distinct keyboard-active
      option style, each at least 3:1 against its surroundings in both themes, consistent
      with the B5-02/AX-02 fix.
   3. Theme toggle: placement in the main navigation on desktop and in the phone shell
      (without breaking the first-screen budget); two states light/dark as the owner asked
      (say whether "follow the system" stays the implicit default until the first choice);
      persistence (recommend client-only per-device storage unless a canonical rule needs a
      server setting; name any server/API change explicitly); applying the choice before
      first paint without weakening the content security policy (no inline script if the
      CSP forbids it); `color-scheme`; which screens it covers (sign-in, setup, shared
      views, admin); PDFs and print output unaffected.
   4. Hover: inventory every toggle-type control (pressed-state buttons, segmented
      controls, period navigation, picker options, tabs, navigation items) and its hover
      style; define a hover treatment that is clearly visible in both themes and stays
      distinct from pressed/selected and focus; propose a measurable criterion (for example
      a minimum contrast between the hover and rest backgrounds, or a visible boundary
      change) and its values.
   5. Today: exact semantics. Where the client gets "today" (it must be the accounting date
      in the timesheet's saved reporting zone as the server reports it, never the device
      zone; AGENTS rule 7). How the app chooses the initially displayed period (per the
      WP5-UX-FIX9 analysis, the period with the earliest payroll date on or after today) and
      whether "Today" goes to that period or to the period that contains today when they
      differ (the window from P-3 to P): recommend one, and flag it as an owner question
      only if docs/04 or docs/05 do not settle it. What it does when the day editor is open
      (move the editor to today, or only the highlight). Visibility (always visible but
      inactive when already showing today, or shown only when away) and keyboard/focus
      behaviour. Shared timesheets (a grantee viewing another person's timesheet: whose
      zone and whose today). Placement next to Open a day and the period arrows on desktop
      and phone.
   6. Show details: switch semantics (`role="switch"` with `aria-checked` on a button, or a
      checkbox input with `role="switch"`); visible label text stays "Show details"; track
      and thumb sizes and contrast in both states and themes; focus ring; 44px target on the
      phone; whether its state persists (keep the current behaviour unless docs/04 says
      otherwise); animation with the shared token and reduced motion.

C. **Mockup.** One self-contained static HTML file
   `handoff/delivery/design/WP5-UX2/mockup.html` (inline CSS using the real token values
   from `styles.css`; no network fonts, scripts or CDN; synthetic data only; readable when
   opened from disk). In light and dark show: the sheet with a selected column and the
   today marker; the label picker with its current value and a keyboard-active option; the
   main navigation with the theme toggle; hover samples of the toggle-type controls next to
   their rest, pressed and focus states; the period bar with Today; the Show details switch
   on and off. One desktop artboard and one phone artboard (390px). A short owner-facing
   caption per artboard in Vietnamese (human-facing text; everything else English).
   Optional: synthetic PNG renders of the mockup (basename contains `synthetic`) if the
   existing Playwright install can render it locally without network.

D. **Docs impact.** The exact docs/04 sections and lines to change (EN and VI); docs/10
   entries (this owner request of 2026-10-14, plus the carried owner decisions WP5-UX-Q1
   and WP5-UX-Q2, whose verbatim records are on the board); docs/06 if an acceptance
   criterion or the e2e gate wording changes; docs/12 release notes. Any contradiction
   with a canonical rule (AGENTS rule 8), with the recommended resolution.

E. **Tests.** Per item, the unit and e2e checks to add or change (both Playwright projects,
   both themes, the manual theme override, contrast checks in the pattern of the existing
   focus-ring check, the switch role, the column-selection state, Today navigation).
   Existing assertions that must change because a control's role changes: list each and
   show why the change is not a weakening. Calendar independence: every new e2e check must
   pass on every day of the year and at every time of day (WP5-UX-FIX9/FIX10 lessons:
   derive dates from the server-reported today and the displayed period, never from the
   device clock). Name the simulated-clock instants the gate should sweep for Today.

F. **Owner questions.** Only genuine choices without a safe default inside the contracts,
   each with options and a recommendation. Everything else is a recommended default that
   the coordinator may adopt (AGENTS rule 2). Expect zero to two questions.

G. **Slicing.** Bounded tasks WP5-UX2-T01, ... (one source writer at a time, each followed
   by a freeze commit), each with size, risk, novelty, profile and model per docs/08, exact
   owned paths (source, tests, docs EN+VI), dependencies, the tests it must add or update,
   and its freeze point. State whether any server/API change is needed (expected none;
   name it if yes). Name the package-final gate (verify, lint `no-deprecated`, full e2e on
   both projects on the real clock plus a simulated-clock sweep for Today, AC-13 in two
   zones, contrast in both themes and with the manual override, 44px/no horizontal scroll
   and the 390x844 first-screen budget, the container drill for the release image, dist
   server byte-identity with 90b98ef) and what the fresh independent audit must re-check
   (owner fidelity of the six items, no WCAG 2.2 AA regression of the B5/AX items, the zone
   semantics of Today, test strength).

H. **Optional backlog.** Carried items (STATE.json WP5 carried risks, for example R-B7-1)
   that touch the same components; recommend include or exclude for each (default exclude
   unless the same lines change anyway).

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-PLAN.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX2/` (mockup and synthetic renders)
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX2-PLAN\` (outside the repository)

## Acceptance for this task

- Step 0 recorded from actual command output (HEAD, branch line, status, commits after
  aa3a7a0, digest).
- Sections A-H present; every observation cites file:line or evidence; contrast values are
  computed (state the formula or tool used).
- No file changed outside the owned paths: record `git status --short` at the end and
  compare it with Step 0.
- The digest at the end equals the Step 0 digest.

## Results

### Step 0: read-only reconciliation (actual output; raw files in the temp folder `WP5-UX2-PLAN`)

- `node --version`: v24.21.0 (Node 24 portable on PATH).
- `git rev-parse HEAD`: `834b9fcc62d55501371030dea966547d3dc53902`.
- Branch line (`git status -sb`): `## main...origin/main` (in sync with the local `origin/main` ref, not ahead, not behind).
- Commits after aa3a7a0 (`git log aa3a7a0..HEAD`): exactly one, `834b9fc` by author `huysrc`, 2026-10-14 11:43:42 -0700,
  message "chore(handoff): record WP5-UX-ACCEPT and return to software_ready". Its changed paths (`git show --stat`):
  7 files, ALL under `handoff/` (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT.md and .vi.md,
  evidence/WP5-UX-ACCEPT/{checks,commit-message,digest-before}.txt, tasks/WP5-UX-ACCEPT.md). No path outside `handoff/`.
  So the owner/committer already committed the coordinator's WP5-UX-ACCEPT records; the baseline in the brief
  ("aa3a7a0 is the last commit") is superseded by 834b9fc, which is handoff-only.
- `git status --short` at start: 2 entries, both under `handoff/`: ` M handoff/delivery/ORCHESTRATION.json`
  (modified, the coordinator's dispatch record for this task) and `?? handoff/delivery/tasks/WP5-UX2-PLAN.md` (untracked, this brief).
  No path outside `handoff/`.
- `npm run digest` (Node 24): `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d  (795 files, handoff/ excluded)`.
  Equal to the accepted digest 57e2974c; no difference to explain.

### Plan

Method. Observations (O) are read from the files cited or measured on the BUILT app of 90b98ef (dist/ built 2026-10-13 22:09, after the
last client edit) with a fresh synthetic database in the temp folder (`measure.mjs`, `measure2.mjs`; ports 48501/48502; Edge; both
scripts stopped their own server; raw output `measure-out.json`, `measure2-out.json`, screenshots under `run/` and `run2/`, all synthetic).
Contrast values are computed with `contrast.mjs`: WCAG 2.x ratio (L1+0.05)/(L2+0.05), L = 0.2126 R + 0.7152 G + 0.0722 B on linearised
sRGB, alpha colours composited over their base first (output `contrast-out.txt`). Assumptions (A) are labelled. The three taste skills
were loaded; they target marketing pages (pill shapes, 2rem radii, hero rules), so AGENTS.md "Unified Frontend & UI/UX Standards" governs
where they differ: 4px radius token, ultra-subtle layered shadows, one shared transition token, only custom properties for new values.

#### A. Current state per item

**A1. Column selection for the Day editor (owner item 1).**
- O: `TimesheetScreen.tsx:123` holds `editDate`, but the sheet only receives `selected` (the batch set) in `actions` (`:460-475`);
  `dayClass` (`SheetWeekTable.tsx:179-181`) knows only `nonworking`, `today` and `selected`. So nothing marks the column of the open editor.
  Measured at 1280px, editor open on 2026-09-28: the column's class is `sheet-day`, computed box-shadow `none`, background
  `rgba(31,95,191,0.04)` which is only the mouse-hover tint (`.sheet-day:hover`, `styles.css:1335-1337`; the pointer was still over it);
  other columns are transparent. Screenshot `run2/b-desktop-today-selected-editor-light-synthetic.png`: the editor says "Day editor Mon
  2026-10-12" and the Mon column carries no marker.
- O: the existing batch `.selected` look (`styles.css:1472-1479`) is a 9 % (14 % dark) accent tint plus `inset 0 0 0 2px accent` on the
  column. It replaces Today's bar (`:1468-1470`, same `box-shadow` property): computed on `sheet-day today selected` the shadow is only the
  ring. The day head (`.d-day`, `:1357-1364`) and an attention cell (`.sheet .attention`, `:1454-1456`) have opaque backgrounds that
  paint over the column's own tint and inset ring, so the ring is broken at the head and at the amber cell (same screenshot, Wed column).
- O: phone: a day is one `<tr>` (`SheetWeekTable.tsx:263-269`); `tr.selected td` only sets a tint (`:1472-1475`), no ring. The editor is a
  modal bottom sheet of up to 86 % height (docs/04 line 59), so most of the sheet is under it.
- O: the editor `<dialog>` has `data-day-editor` and no `id`; the day button (`TimesheetSheet.tsx:59`, `SheetWeekTable.tsx:279-288`) has no
  `aria-expanded` or `aria-controls`. The name is `Edit {MM/DD} ({date})` (docs/04 line 48).
- O: `period change` keeps `editDate` (`move()` `:194-206` does not touch it); the editor then names a date that may not be on the sheet.
- Tests pinning today's behaviour: none asserts the absence of a marker. Day lookups use `[data-day]` and `[data-day-button]`
  (`tests/e2e/dayButton.ts`), unaffected.

**A2. Label picker selection (item 2).**
- O (`SheetWeekTable.tsx:59-166`, `styles.css:2256-2375`): trigger button (`.label-trigger`), `role=listbox` list, options with `.active`
  (the aria-activedescendant option, what Enter picks) and `aria-selected` (the current value). Measured with a mouse open:
  - open trigger: `box-shadow: inset 0 0 0 2px accent` (`:2295-2298`);
  - active option: `inset 0 0 0 2px accent, inset 0 0 0 3px card` plus a 9 % tint (light) or 14 % (dark): a full 3px frame (`:2356-2359`,
    the AX-02 fix); mouse hover sets the same `.active` (`onMouseMove`, `:156`);
  - the current value has only accent text and weight 600 (`:2361-2364`), no shape.
  - the list shows the 3px ring only when it is `:focus-visible` (keyboard). With the mouse it was `false`.
  So one mouse pick shows a 2px frame on the trigger and a 3px frame on the option at the same time: the "thick border" the owner sees.
- O: AX-02 history (A11Y-SWEEP row WP5-UX-AX-02, FIX7): the tint alone is 1.14:1 light / 1.28:1 dark, so the fix added the inset ring; the
  list focus ring (outset `--focus-ring`) and the active-option inset indicator are asserted by `focus-ring.spec.ts:224-244` at >= 3:1.
- Computed now: accent against card 6.09 light / 6.79 dark; accent against the active tint 5.35 / 5.29.

**A3. Theme (item 3).**
- O: tokens live in `:root` (`styles.css:7-177`) with the dark set only inside `@media (prefers-color-scheme: dark)` (`:179-212`);
  `color-scheme: light dark` (`:8`). docs/04 line 82: "light and dark themes follow the device". No theme state, no storage use in `src/client`
  (grep `localStorage|sessionStorage|document.cookie`: none). `index.html` has no script in the head (`src/client/index.html:3-7`).
- O: shell bar: desktop `.shell-bar` holds brand, `nav[aria-label=Main]` (flex: 1), `SharingSwitcher`, then `.shell-user` (name and Sign
  out) (`AppShell.tsx:156-172`; measured 1280px: bar 56px, nav 110-1017, user group 1041-1264). Phone: compact 52px bar (brand and the
  switcher), bottom tabs, the "More" panel holds the name, Settings, Import, Admin (admins) and Sign out (measured: panel 240 wide, 181px
  high, bottom at 780, children 33/44/44/44px).
- O: the server sets `script-src 'self'`, `style-src 'self'`, `default-src 'self'` (`src/server/app.ts:79-96`); there is no `'unsafe-inline'`.
  So an inline `<script>` or an inline `style=""` attribute in `index.html` would be blocked. A same-origin script file is allowed.
  `serveStatic` serves every file of `dist/client` (`app.ts:148-155`); Vite copies `src/client/public/*` there (the folder does not exist yet).
- O: ESLint lints `**/*.{ts,tsx,js,mjs}` with the type-aware project service (`eslint.config.js:8-13`), so a new `.js` file needs an
  `allowDefaultProject` entry or an ignore (the known `.mjs` trap).
- O: tests set the theme with `page.emulateMedia({ colorScheme })` (`focus-ring.spec.ts:194,225,...`, `timesheet.spec.ts:329`).

**A4. Hover on toggle-type controls (item 4).**
- Measured (computed styles, hover after settle; `measure-out.json`):

  | Control | Rest | Hover | Light card-vs-hover | Dark |
  |---|---|---|---|---|
  | "Show details" / "Change several days" (`button.quiet`, `styles.css:561-571`) | transparent | `#eef1f5` (`--off`), no border | 1.13:1 | `#202733`, 1.09:1 |
  | the same, pressed | tint 9 %, 1px accent border, 1px inset accent | identical to unpressed hover: `#eef1f5`, border transparent, shadow none | pressed-vs-hover 1.01:1 | 1.18:1 |
  | nav link (`.nav-link:hover`, `:293-296`), phone tab (`:340-344`) | transparent | `--off` | 1.13 | 1.09 |
  | Next/Previous period (`button.secondary:hover`, `:555-559`) | card + 45 % accent border | `--off` + accent border | 1.13 | 1.09 |
  | label option / trigger (`:2289-2293`, `:2356-2359`) | none | trigger 4 % tint + 1px 45 % accent ring; option as `.active` | 1.06 (tint alone) | 1.10 |
  | day column hover (`.sheet-day:hover`, `:1335`) | none | 4 % tint (6 % dark) | 1.06 | 1.10 |

- O (a defect behind the complaint): `button.quiet:hover:not(:disabled)` has specificity (0,3,1) and beats
  `.tools button[aria-pressed='true']` (0,2,1), so a pressed toggle loses its pressed look while the pointer is on it. After a click the
  pointer is still on the button, so the user sees the faint hover look instead of the new state until the mouse moves (computed styles
  `togglePressedAndHover` equal `toggleHover`). Pressed (tint 1.14:1) and hover (1.13:1) are indistinguishable by luminance (1.01:1).
- Existing tests that touch hover: none assert hover colours.

**A5. Today (item 5).**
- O: there is no "Today" control. The first period is `response.current.payroll_date` of `GET /periods/current`
  (`TimesheetScreen.tsx:156-163`); `move(±1)` loads the neighbouring period by date (`:194-206`); `OpenDay` only opens the editor
  (`OpenDay.tsx`) and never moves the sheet; the editor is not closed by a period change.
- O: the server answers `/periods/current` with `reporting_zone`, `today_local`, `current` and `in_progress`
  (`src/server/routes/api.ts:103-112`, `todayInReportingZone`), and the client already keeps it in state (`periods`, `:113`, used for the
  "Today" tag through `todayLocal` `:374`). A shared view goes through the same call on the share's requester (`shares.ts:111`), so there
  `today_local` is the owner's accounting date in the owner's zone.
- O: `current` = earliest configured payroll date on or after today in the reporting zone (R-07, docs/02 line 72, docs/10 D-12,
  `periods.ts:148-164`). The period of payroll P is P-18..P-5, so for the 5 days P-4 (Monday) to P (Friday) `current` is the period that
  already ended, while today lies in the next one (`in_progress`, `payPeriodContaining`). Measured today 2026-10-14: the page opens on
  09/28-10/11 (payroll 10/16), today is in 10/12-10/25 (the "Today" tag appears after one "Next period").
- O: phone budget measured at 390x844 (tab bar top 788): first day row bottom 659 (reporting zone = device zone), 758 (zone note shown,
  Asia/Ho_Chi_Minh); with a received share 667/766 (FIX8 record). The period card is 180px (zone equal): row 1 is 52px (title, two lines,
  230px wide), the meta block 52px, then a 44px "Review & sign off" row; tools rows are 44px each; "Show details" 137px and "Change several
  days" 189px fill the 334px row.

**A6. Show details (item 6).**
- O: `TimesheetScreen.tsx:398-400`: `<button class="quiet" aria-pressed>`; accessible name "Show details", state in `aria-pressed`.
  Tests: `timesheet.spec.ts:291-295`, `shell.spec.ts:81`, `day-editor.spec.ts:1036`, `focus-ring.spec.ts:287,302-315`.
- O: the repo already has the switch semantics: native `<input type="checkbox" role="switch">` inside `label.inline` in
  `SharingItemsFields.tsx:50-60` (unstyled, renders as a checkbox). The phone target test selects `label.inline` and excludes checkboxes
  (`timesheet.spec.ts:312-322`).
- A (to confirm in T04): the visible label stays "Show details"; docs/04 says nothing about persistence of the toggle; today it resets
  on reload (plain `useState`, `:132`).

**A7. An extra defect found with the same root cause (flag, not an owner item).**
- O: docs/04 line 46 says "Today carries an accent top bar and a Today tag". Measured: `.sheet-day.today` has `box-shadow: inset 0 3px 0
  accent` (`styles.css:1468-1470`) but the day head `.d-day` has an opaque background (`:1357-1364`) that paints over it. The crop
  `run3/c-today-column-light-synthetic.png` shows the "Today" tag and no bar. Only the tag identifies today. The same layering is why the
  batch ring is broken (A1). The fix in B1 (overlay layer) restores the documented bar; it aligns the product with docs/04, so it is not a
  rule change.

#### B. Design per item

Shared decisions. Tokens only in `src/client/styles.css` (new values as custom properties, in `:root` and in both dark sets). All new
hover and pressed rules sit inside `@media (hover: hover)` where they are hover rules, so a phone tap leaves no sticky hover that hides a
state. Every transition uses `--transition`; under `prefers-reduced-motion` `--duration` is already 0.01ms (`styles.css:214-218`), so the
switch thumb, the caret and the fills stop animating. No new motion beyond colour, background-position and a 180 degree caret turn.
Radius stays 4px; no shadow is added to controls (cards keep `--shadow-panel`). The mockup (`design/WP5-UX2/mockup.html`, renders
`mockup-1..3-*-synthetic.png`) uses the real token values plus the NEW ones below.

New tokens (light / dark):
- `--hover-fill`: `rgb(31 95 191 / 0.14)` / `rgb(110 168 255 / 0.20)`.
- `--day-editing`: `rgb(31 95 191 / 0.10)` / `rgb(110 168 255 / 0.16)`.
- `--rail`: `calc(var(--rule) + var(--hairline))` (3px; the same value as the sheet's `--sheet-today-bar`, which stays).
- `--switch-width: 44px; --switch-height: 24px; --switch-thumb: 18px; --switch-inset: 3px` (travel is derived with `calc`).
- `--theme-glyph-size: 14px` (the half-disc shape of the theme toggle; drawn with a border and a gradient, no icon library).

**B1. Highlight the column of the open Day editor.**
- Which cells: the whole column from the day head to the last row, including the two detail rows when "Show details" is on and a cell with an
  attention tint. Because the head and attention cells have opaque backgrounds, the marker is drawn by two absolutely positioned layers of
  `.sheet-day` (out of grid flow, so the subgrid is not disturbed; `.sheet-day { isolation: isolate }`): `::before` with
  `z-index: -1` carries the fill `--day-editing` (above the column's own tint and hatching, below the cells), `::after` is the rails
  `border-inline: var(--rule) solid var(--accent)` over the cells with `pointer-events: none`. The head gets `inset 0 -var(--rail) 0 accent`
  as an underline that joins the rails. The same `::after` technique replaces the hidden Today bar (`height: var(--rail)`, top) and fixes
  today-plus-batch-selected losing its bar.
- Distinguishing states (all combinable on one column): today = top bar plus the "Today" tag; editing = side rails, head underline and
  fill; batch selected = checkbox plus the existing tint and ring (unchanged); hover = the existing 4 % tint, weaker than the editing
  fill; non-working = tint with hatching (the editing fill layers over it; text stays above 4.5:1); needs input = the amber cell stays
  amber (the rails still cross it; the fill does not tint it). Not colour alone (SC 1.4.1): the rails and the underline are shapes at the
  column edge, the day button gets an ARIA state, and the editor heading names the date.
- Phone: a day is a `<tr>`. `tr.editing td` gets a gradient fill layer (`linear-gradient(var(--day-editing), var(--day-editing))`, kept
  above the hatching/attention colours through `background-image` layering) and a frame of inset 2px accent shadows (top and bottom on
  every cell, left on the first, right on the last); with details on, the detail row belongs to the frame (class `editing-detail`, bottom
  edge only). Below 1200px the editor is modal and the bottom sheet covers up to 86 % of the screen, so on a phone the row is seen mainly
  after the sheet closes or in the uncovered top part; the 768-1199px side panel leaves the sheet visible behind the scrim. Nothing is
  required to scroll.
- Lifetime: set while `editDate` is the day (only `TimesheetScreen` knows it; pass it as `actions.editing`). Closing the editor removes it
  and focus returns to that day's button (existing behaviour, `focusDay`). Switching the editor to another day (click, Open day, Today)
  moves it. A period change keeps the editor open on its date, so no column is marked when that date is not on the sheet (the editor
  heading still names it); this is existing behaviour and is left as is.
- ARIA: `aria-current="true"` on the day button of the editing day only (both layouts). It names the selection without changing the
  accessible name (`Edit 09/28 (2026-09-28)`, docs/04 line 48, SC 2.5.3) and cannot point at a missing id. Plus a `data-editing` attribute on
  the day container for tests. Not `aria-expanded`/`aria-controls`: the editor is a dialog that is non-modal from 1200px and modal below, and
  the dialog has no id today.
- Contrast (computed): the rail colour accent against card 6.09 light / 6.79 dark, against the non-working tint 5.43 / 6.40, the head 5.23 /
  6.00, the amber cell 5.58 / 5.94 (all >= 3:1, SC 1.4.11). The fill 10 % / 16 % keeps text readable on the worst surface (non-working plus
  fill): muted 4.52 / 4.62, warn 4.60 / 5.92, error 5.10 / 5.05, ok 5.14 / 6.13, text 12.12 / 9.47 (>= 4.5:1, SC 1.4.3, same bar as the AX-09
  fix). 12 % light would drop muted to 4.39 and is not used.
- Desktop with the panel (>= 1200px) keeps the sheet narrower (`.with-editor`); the rails are inside the column box, so no horizontal
  growth. 768-1199px modal panel: the marker shows dimmed behind the scrim. Focus-not-obscured is unaffected (layers are `pointer-events:
  none`).

**B2. Label picker: lighter selection that is still obvious.**
- Trigger: rest unchanged. Open (not focused, the list owns focus): `inset 0 0 0 var(--hairline) var(--accent)` (1px, was 2px) and a caret
  turn of 180 degrees. Keyboard focus on the trigger keeps the shared ring (`:focus-visible`, `--focus-ring`, unchanged, SC 2.4.7).
- Active option (the `aria-activedescendant`, also what the pointer is on): background `--hover-fill` and a leading rail
  `inset var(--rail) 0 0 var(--accent)`; no frame. Indicator contrast: rail against the option fill 4.96 / 4.68 (accent against the new fill),
  against the card 6.09 / 6.79 (SC 1.4.11, 2.4.7). Text `--text` on the fill: 12.7 / 9.3.
- Current value (`aria-selected="true"`): accent text, weight 600 and a check shape (`::after`, borders rotated), so it is not colour alone
  (SC 1.4.1; today it is colour and weight only). Accent text on the active fill 4.96 / 4.68 (>= 4.5:1) when the current value is also the
  active one.
- The list keeps `.label-list:focus-visible { --focus-ring, --shadow-overlay }` (keyboard only; with a mouse the list is not
  `:focus-visible`, measured), so AX-02's list ring stays. Class names `.label-option.active` and `[aria-selected]` stay (tests select them).
  The picker still moves with Arrow, Home, End; Enter or Space picks; Escape or Tab closes. Phone: options stay 44px.
- Result: a mouse pick shows a 1px trigger line and a 3px rail instead of a 2px and a 3px frame; a keyboard pick shows the list ring plus
  the rail. Distinct from the editing column and from hover on other controls (rail plus check, no side-to-side pair).

**B3. Theme toggle (dark / light) in the main navigation.**
- Control: a `button.quiet.toggle` named "Dark mode" (the visible text is the name, SC 2.5.3), `aria-pressed` true when the dark theme is
  in effect, a half-disc glyph shape (`aria-hidden`) so the state is also shown by position/shape in the mockup (fill state: pressed =
  solid accent). Static name plus `aria-pressed` is the pattern for a two-state button (no label swap). Two states only, as asked.
- Placement: desktop, the first control of `.shell-user` (before the name and Sign out), i.e. the right end of the top bar (measured room:
  the nav ends at 1017px, the user group starts at 1041px; the bar is 56px and stays so; at 768px the bar already wraps and the measured
  `--shell-bar-size` follows). Phone: inside the "More" panel between Import/Admin and Sign out (`.more-action` style, 44px). The compact
  top bar is not touched, so the first-screen budget is unchanged (measured: first row bottom 659 / 758 of 788; FIX8 states 667 / 766 with a
  share; the panel grows upward from the tab bar and fits: 181px now, 225-269px with the toggle and Admin).
- Default and persistence: until the first choice there is no stored value and the app follows the device (CSS media query, live), the
  button shows the effective state. The first press stores the opposite of the effective theme. Storage: `localStorage` key
  `timesheet.theme` = `light` | `dark`, per device and browser, client only. No server setting, no API change, no schema change; the choice is
  not business data. Storage errors (blocked or private mode) are caught: the choice then lasts for the page. A `storage` event keeps other tabs in
  step. There is no way back to "follow the device" in the UI (only two states were requested); clearing site data does it. This is a
  stated limit, optional follow-up in section H.
- Applied before first paint: `<script src="/theme-init.js"></script>` (classic, blocking) in `index.html` `<head>`, the file in the new
  `src/client/public/theme-init.js` (Vite copies it to `dist/client`). It reads the key in try/catch and sets
  `document.documentElement.setAttribute('data-theme', value)`. This respects the CSP: `script-src 'self'` allows a same-origin file, and
  setting an attribute is not an inline style. No inline script, no `unsafe-inline`, no CSP change, no `dist/server` change. The build
  must show no Vite warning for the tag (absolute public URL). The new `.js` file needs an `allowDefaultProject` entry or an ignore in
  `eslint.config.js` (config change owned by T01).
- CSS: keep the light tokens in `:root` (`color-scheme: light dark`); move the dark set to
  `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { ... } }` and repeat the identical set in
  `:root[data-theme='dark'] { color-scheme: dark; ... }`; add `:root[data-theme='light'] { color-scheme: light }`. `color-scheme` makes native
  controls, the date picker, scrollbars and the dialog backdrop follow. Alternative considered and not chosen: `light-dark()` per token
  (single source, but a rewrite of about 40 tokens and engine support floor in a gate-heavy round). The duplication is guarded by a unit test
  that parses `styles.css` and fails if the two dark sets differ or a dark token is missing from `:root`.
- Covers: every screen, because the attribute is on `<html>`: sign-in, setup, shared views, admin, Review. The toggle control exists
  only in the signed-in shell; sign-in and setup show the stored theme but have no toggle (optional later). PDFs and any print output are
  unaffected: the PDF is rendered by the server from its own template and no print stylesheet exists (`styles.css` has no `@media print`).
- Keyboard: Tab order desktop = nav links, switcher, Dark mode, Sign out; Enter and Space toggle; `:focus-visible` shows `--focus-ring`
  (accent against surfaces 6.09 / 6.79 and the other surface tokens per `focus-ring.spec.ts`). Pressed fill: on-accent text against
  accent 6.09 / 7.76 (>= 4.5:1); the toggle's boundary is the fill, accent against card 6.09 / 6.79.

**B4. Hover that is clearly visible, in both themes.**
- Inventory (current behaviour in A4): pressed-state buttons (Change several days; Dark mode), period arrows and Today (`button.secondary`),
  navigation links, phone tabs, label options, the label trigger, the new switch, day columns (hover tint, not a toggle).
- Treatment (shared tokens, so the toolbar is consistent):
  - quiet and secondary buttons, not pressed: `background: var(--hover-fill); border-color: var(--accent); box-shadow: none`.
  - pressed toggles: rest = solid `--accent` with `--on-accent` text; hover = `--accent-strong`; the rule is written so hover cannot
    override pressed (the A4 specificity defect disappears because pressed no longer depends on a lower-specificity rule); focus uses the
    shared ring (its card-coloured gap stays visible on the accent fill, per the token's own design), so the AX-04 special case
    `.tools button[aria-pressed='true']:focus-visible` is deleted.
  - navigation links and phone tabs: `background: var(--hover-fill); color: var(--text)`; the current item keeps `--off`, accent text and its
    2px rule (a shape cue), so hover reads as a preview and current stays distinct.
  - switch: off hover = `--hover-fill` track plus accent border; on hover = `--accent-strong`.
  - label option: see B2. Day column hover stays 4 %/6 % (clickable surface, not a toggle).
- Measurable criterion (project rule, proposed): for each control class, the hover background flattened over its surface differs from the
  rest background by at least 1.20:1, and a control that has a boundary shows an accent boundary (>= 3:1 against its surface) on hover; hover
  and pressed differ by at least 3:1. Values: light fill vs card 1.23 (accent 6.09 border), dark 1.45 (6.79); accent text on the fill 4.96 / 4.68
  and muted text 4.75 / 4.53 (>= 4.5:1); pressed accent vs hover fill 4.96 / 4.68 (>= 3:1). Today: 1.13 / 1.09 and pressed-vs-hover 1.01 / 1.18.
  Hover is never the only state cue (text, rule or fill state follow the control), and it is distinct from focus (a 3px double ring).
- Scope note: `--hover-fill` also changes hover on every `secondary` and `quiet` button, nav link and tab in the app (Overtime, History,
  Settings included), because one button class cannot look different per screen. Colours only, no layout change. Recorded as a scope
  note for the coordinator; E-7 ("restyle the other screens later") concerns layout, not a shared hover token.
- Phone: all of this sits in `@media (hover: hover)`; touch devices keep the pressed look after a tap.

**B5. A "Today" button.**
- Source of today: the server's `today_local` from `GET /periods/current` (the accounting date in the timesheet's saved reporting zone;
  `api.ts:103-112`, `todayInReportingZone`), never `new Date()` and never the display zone (AGENTS rule 7). The click first re-reads
  `/periods/current` (the page's copy can be minutes old and the date can pass midnight) and uses that answer. In a shared view the same call
  runs on the share's requester, so it is the owner's zone and the owner's today; the grantee's device zone plays no part. Grantee view-only
  shares can use Today (it only navigates and, in the read-only editor, shows the day).
- Target (recommended default; owner confirmation in F): Today returns to the period the page opens on, the current period by R-07
  (docs/02 line 72, docs/10 D-12): the earliest payroll date on or after `today_local`. When today lies inside it (the 9 days P-13..P-5 of
  every 14), the sheet shows today's column with the "Today" tag (scrolled into view with `scrollIntoView({block:'nearest'})`, which honours
  the scroll padding of the sticky bars). In the 5 days P-4..P (Monday after a period ends through payroll Friday) the current period is
  still the one that ended; today is in the next one, one "Next period" away. Today then returns to the current period (what the badge calls
  "current"), not to the next. Going to the period that contains today instead is the alternative; it makes the button active on opening for
  5 of every 14 days and breaks the phone budget unless placed differently, so it is not the default.
- When the Day editor is open: Today moves the editor to `today_local` if the editor's date differs (as if today's column were clicked;
  focus then goes to the editor heading, the existing behaviour on opening an editor). If the editor is closed it stays closed. This is how
  "after Open day" returns to the current day (Open day can show any date, also outside the sheet). Caveat: like clicking another column, it
  discards values typed in the open editor that were not saved (no unsaved-form guard exists today); flagged as risk R-T1, not solved here.
- Visibility and state: the button is always rendered (explicit, stable layout, focus is never lost). It is active ("away") when the shown
  period is not the current period, or the editor is open on a date other than `today_local`. Otherwise it carries `aria-disabled="true"`
  (not `disabled`, so it stays in the tab order and keeps focus after use), the standard muted look and a visually hidden description
  "Already showing the current period". Activating it when not away does nothing. After a successful use a visually hidden
  `role="status"` line says "Showing the current period {MM/DD/YYYY} to {MM/DD/YYYY}" (SC 4.1.3, no layout shift).
- Placement: in the period bar, after "Next period" and before "Review & sign off", inside a `.period-cta` wrapper so the tab order is
  Previous, Next, Today, Review. Desktop: one more 70px button in the actions group (measured group 194px at 1280px inside a 766px card), placed
  right of the arrows so pressing Next repeatedly does not move it. Phone (<768px): `.period-cta` is the existing full-width row, now a flex
  row with Today (44px high, content width) and Review (flex 1); no extra row, so the card stays 180px and the first row stays above the tab bar
  (758 of 788 worst measured state without a share, 766 with one, FIX8). Shared view on a phone has no Review and no clock card (76px freed), so Today's own row fits. Imported
  periods keep Review disabled beside Today.
- Contrast and size: `secondary` button, accent text on card 6.09 / 6.79; hover per B4; disabled-look is an inactive component (exempt from
  SC 1.4.3) but keeps the focus ring; target 44px on a phone and >= 36px on desktop (SC 2.5.8 needs 24px).
- Zones and no reclassification: Today only changes which period is shown and, optionally, which day the editor shows; no data, no
  accounting date and no saved zone is touched.

**B6. "Show details" as a slide switch.**
- Semantics: a native `<input type="checkbox" role="switch" class="switch-input">` inside `label.inline.switch` with the visible text "Show
  details" (the repo already uses this pairing in `SharingItemsFields.tsx:50-60`). Native keyboard (Space toggles), checked state exposed as
  on/off, no `aria-checked` to keep in sync. Rejected: a `button role="switch"` (needs manual state sync, and the phone target test selects
  `label.inline` and `button`, both fine, but the checkbox form is the established pattern).
- Geometry: track 44x24px (`--switch-width/height`; 24px satisfies SC 2.5.8 even for the input alone; on a phone the whole label is >= 44px high
  through the existing `label.inline` rule), thumb 18px, 3px inset, 4px radius (project shape rule; not a pill). Label text left, track right,
  8px gap. Appearance: `appearance: none`; the thumb is a one-colour gradient layer positioned with `background-position` (no pseudo-element, so it
  works wherever `appearance: none` does).
- States, light / dark: off = track `--off`, 1px `--muted` border (5.83 / 6.56 against the card), thumb `--muted` (5.15 / 6.01 against the track);
  off hover = `--hover-fill` track and accent border (thumb 4.89 / 4.53); on = track and border `--accent` (6.09 / 6.79 against the card), thumb
  `--on-accent` (6.09 / 7.76 against the track) moved right by the derived travel; on hover = `--accent-strong` (8.01 / 8.33); focus-visible =
  shared `--focus-ring` on the track (its gap keeps it visible on the accent fill); active = the usual 1px press offset; disabled =
  `--opacity-disabled`. State is never colour alone: the thumb position and the native checked state; the label text never changes.
- Persistence: unchanged (not persisted, resets to off on reload; docs/04 is silent); any wish to persist is a later owner choice.
- Motion: `--transition` on the track animates colours and the thumb position; with reduced motion the 0.01ms duration makes it instant.
- Phone: the row `.tools-right` is a no-wrap flex row today (137px + 8px + 189px = 334px, exactly the 334px available at 390px). The
  switch (text about 82px, 8px gap, 44px track = about 134px) fits with 3px to spare; T03 must measure 390, 375, 360 and 320 and, if needed,
  let `.tools-right` wrap below 400px (budget only applies at 390). No horizontal scroll at any width.
- Forced colours: the state stays readable from the border and the thumb position; to be checked manually, not gating.
- Other switches (Settings > Sharing) keep their current look (scope, section H).

#### C. Mockup

- `handoff/delivery/design/WP5-UX2/mockup.html`: one static file, inline CSS with the real token values and the NEW ones marked, no script,
  no network, no web font, synthetic data; the switch is a native checkbox so it can be clicked when opened from disk, and the hover rows
  react to the real pointer (the static samples use `.is-hover` and `.is-focus` mirrors).
- Artboard 1 (desktop with the Day editor panel, light and dark): the sheet with the editing column (Thu) and the today marker (Wed), the
  navigation with the Dark mode toggle, the period bar with Today, Show details switch on, Change several days pressed, legend.
- Artboard 2 (controls, light and dark): the open label picker with the active option and the current value, the switch in five states,
  the rest / hover / pressed / focus matrix for the toggle button, the theme toggle, period arrow, Today, navigation link and phone tab.
- Artboard 3 (phone 390px, light and dark): first screen with Today sharing the Review row, the switch row, the framed editing row and the
  tab bar; the More panel with the Dark mode toggle.
- Vietnamese captions per artboard (human-facing); everything else English. Synthetic renders (the existing Playwright with Edge, no
  network): `mockup-1-desktop-sheet-synthetic.png`, `mockup-2-controls-synthetic.png`, `mockup-3-phone-synthetic.png` in the same folder.
- The mockup is a design reference, not the implementation: real pseudo-element layering on the subgrid, the `@media (hover: hover)`
  wrapping and the storage logic are for the slices.

#### D. Docs impact (EN and VI always together; docs are inside the source digest, so they go into one slice before the gate)

- `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (line numbers are the same in both):
  - line 7 (App shell): the desktop top bar also has a "Dark mode" toggle; on a phone it is in More.
  - line 8 (Timesheet): the period bar gains "Today"; "Show details" is a switch.
  - line 9 (Day editor): the open day's column is marked.
  - line 41: "Show details" adds the rows (it is a switch).
  - line 46: add the editing-column marker (side rails, head underline, light fill) next to the Today bar, and state the layering rule.
  - line 48: phone: the open day's row is framed; the open day's button has `aria-current`; Today shares the Review row; the budget sentence
    stays true.
  - line 53: period bar gets "Today" (target, rule when it is inactive, shared view).
  - line 55: toolbar wording: "Show details" switch.
  - line 59: add "the column of the open day is marked while its panel is open".
  - line 63: picker look (active option rail, current-value check, 1px open line).
  - lines 77-82 (Visual standard): line 79 add hover and pressed rules (hover fill token, accent boundary, pressed = solid accent); line 81 add
    "editing" to the day-state colour roles; line 82 changes from "light and dark themes follow the device" to "follow the device until the person
    picks one with the Dark mode toggle; the choice is stored on that device"; add the measurable hover criterion.
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`: a new section "Owner decisions — 2026-10-14 (UI change round 2)" with the six items
  (source: the owner's chat request, verbatim in the board `owner_decisions`) and a "Coordinator decisions" list for this round (client-only
  theme storage, Today target and editor follow, hover token scope, `aria-current`). Plus the carried entries for WP5-UX-Q1 (a: stronger focus
  ring with an automated 3:1 check, and the US due-date format in the zone note) and WP5-UX-Q2 (a: one accessibility sweep, then one fix round
  for every WCAG 2.2 AA item), with the verbatim answers recorded on the board (2026-10-09), as the 2026-10-13 coordinator decision carried
  them to this round.
- `docs/06_TEST_AND_ACCEPTANCE.md`: no AC or gate wording needs to change (no AC is UI-specific; the layers paragraph already allows "a small
  set of meaningful browser flows"). Optional one sentence under "Layers": simulated clocks also apply to the browser flows that depend on
  today. Recommended: do not change.
- `docs/12_RELEASE_NOTES.md` and `.vi.md`: a bullet next to lines 20-27 for the second UI change round (what people see; no business rule,
  PDF or server calculation changes; the release identity is refreshed only after this round's gate and audit).
- `docs/03_ARCHITECTURE_AND_DATA.md`: no change (no API or storage change; the browser-only theme key is not business data). The CSP text
  does not exist in docs/03 (only docs/04 line 75 mentions it); no change.
- Contradictions with a canonical rule (AGENTS rule 8): none requires a business-rule change. (1) docs/04 line 82 ("follow the device") is
  superseded by the owner's request: updated with its translation. (2) docs/04 line 46 promises a Today top bar that is not visible (A7):
  the fix aligns code with the document. (3) The Today target follows R-07/D-12 unchanged. (4) The editor staying open across a period change
  is existing behaviour and is not rewritten.

#### E. Tests

Rules for all new e2e: derive every date from the server (`employeeSeed.today()` or `GET /api/periods/current`: `today_local`, `current`,
`period_start`, `period_end`) and from the displayed period (`displayedSeedDay`, `displayedPeriodFreeWorkdays`), never from the device clock
(WP5-UX-FIX9/FIX10). A branch that depends on whether today lies in the shown period is asserted in both branches (the applicable branch is
chosen from server values, the other branch asserts the opposite fact), never skipped. No new `skip`, `fixme` or `.only`.

- Unit (`tests/client`, vitest): `themeModel.test.ts` (parse stored value, effective theme from storage and media, next theme, blocked storage);
  `cssThemeParity.test.ts` (parse `styles.css`: the media dark set equals the `[data-theme='dark']` set, and every dark token exists in `:root`);
  `todayModel.test.ts` (pure `isAway` and the Today action: stepped through every day of at least two periods with the production
  `currentPayPeriod`/`payPeriodContaining`, including P-4..P where today is outside the current period, due Tuesday before and after 17:00
  America/Los_Angeles, an editor date other than today, shared owner zone); `sheetModel.test.ts` (editing class and flag, `dayButtonName` unchanged).
- E2E, both Playwright projects (desktop 1280, mobile 390), both themes unless stated:
  - `theme.spec.ts` (new): follows emulated media with no stored value; the toggle (desktop: banner; phone: More) sets `data-theme`,
    `aria-pressed` and computed `--bg`; persists after reload; a stored value opposite to the emulated media wins (the four combinations);
    before first paint (an init script records `data-theme` and the body colour at `DOMContentLoaded`); no `securitypolicyviolation` event and
    `/theme-init.js` is served as JavaScript with the CSP header unchanged (no `unsafe-inline`); blocked storage does not break the toggle;
    storage event updates a second page.
  - Contrast (new helper `tests/e2e/contrast.ts`, the formulas of `focus-ring.spec.ts:16-68` extracted additively): in light, dark and with
    the manual override both ways: toggle focus ring and pressed text >= 4.5/3; rails vs surfaces >= 3; fill text >= 4.5 on the worst surface;
    option rail >= 3; switch states >= 3; hover fill vs rest >= 1.20 and boundary >= 3 for the controls of B4 (desktop only).
  - `timesheet.spec.ts`: editing column (`data-editing`, `aria-current="true"`, computed `::before`/`::after`, covers the day head and all rows
    with "Show details" on, only one column, moves when another day opens, gone on Close/Escape, kept across a period change); phone row frame;
    Today bar visible (A7); `aria-current` absent elsewhere; accessible names unchanged (`ANY_DAY_BUTTON_NAME`).
  - Label picker: active option has the rail and no 3px frame; current value has the check and `aria-selected`; open trigger line is 1px.
  - Today: not away at load (`aria-disabled`); Next makes it active; click returns to `current.payroll_date`, today's column visible when
    today is in the period; aria-disabled again; the `role=status` line; with the editor open on another date the editor moves to `today_local`;
    device zone Asia/Ho_Chi_Minh with the reporting zone America/Los_Angeles: the Today tag date equals the server's `today_local` and not the
    device date; a shared view (sharing.spec flow) returns to the owner's current period; phone: Today and Review share a row (same top) and
    the first-screen budget tests still pass (four states); no horizontal scroll measured with `documentElement.clientWidth` at 390, 375,
    360 and 320 (fixes the vacuous check pattern of R-B7-2 for these new assertions).
  - Show details switch: role switch, off at load, Space and click toggle, detail rows 0 / 14, visible label text, 44px label on the phone.
- Existing assertions that must change because a role or indicator changes (none is weakened; each keeps its fact and gains an equal or
  stricter check):
  - `timesheet.spec.ts:291-295`: `getByRole('button', {name:'Show details'})` plus `aria-pressed` becomes `getByRole('switch', ...)` plus
    `toBeChecked`; the same facts (off at load, no detail rows, on gives 14 rows and 8:00).
  - `shell.spec.ts:81`: click becomes `check()` on the switch; add the Dark mode toggle presence and the tab order.
  - `day-editor.spec.ts:1036`: focus the switch; the Escape-closes-editor fact is unchanged.
  - `focus-ring.spec.ts:287` (R-12): same focus target by role switch; the Shift+Tab fact is unchanged.
  - `focus-ring.spec.ts:298-317` (AX-04): the loop over "Show details" and "Change several days" keeps "Change several days", adds "Dark mode", and the
    switch gets its own focus-ring test in both states (the pressed-toggle ring fact now covers the remaining pressed buttons).
  - `focus-ring.spec.ts:238-240` (AX-02): `expectInsetRing` requires an inset layer with spread > 0; the new indicator is a leading rail layer.
    The check becomes: the rail colour against the option fill and the card >= 3:1 and its width >= 2px; the list-ring assertion at `:237` is
    unchanged.
  - The phone tap-target test (`timesheet.spec.ts:312-322`) is unchanged: the switch is covered through `label.inline`, and the
    checkbox input is excluded by design (the label is the target).
- Simulated-clock instants for the gate (America/Los_Angeles; the existing `shiftclock.mjs` preload; each also with a device zone far from
  the reporting zone, Asia/Ho_Chi_Minh): P-13 Saturday 10:00 (first day today is in the current period, 2026-10-17); P-5 Sunday 23:30 (last such
  minute, 2026-10-25; Monday already in the device zone); P-4 Monday 00:30 (first window instant, 2026-10-26); P-3 13:00 and 18:00 (due Tuesday,
  2026-10-27); P Friday 23:59 (2026-10-30); P+1 Saturday 00:30 (the flip, 2026-10-31); a DST day 2026-11-01 01:30 and 2027-03-14 03:30; a year
  turn 2026-12-31 23:30 and 2027-01-01 00:30; plus the FIX10 set (2026-11-28, 2026-12-26, 2027-01-11, 2027-01-19 18:00). Real clock once.
  (Payroll dates: anchor 2026-10-02 every 14 days: 10-30, 11-13, 11-27, 12-11, 12-25, 2027-01-08.)

#### F. Owner questions

None is blocking: every point has a safe default inside the contracts, so the coordinator may adopt the defaults (AGENTS rule 2). Two
confirmations are worth one line to the owner, each with a recommendation; if unanswered, the default stands:
- F-1 (Today target in the 5 days P-4..P): (a) Today returns to the current period, the one the page opens on (R-07; recommended default),
  (b) Today goes to the period that contains today's date. Recommendation (a): it matches the "current" badge and D-12, keeps the button
  quiet on opening, and keeps the phone first screen intact; today's own period is one arrow away in those 5 days.
- F-2 (Today with the editor open): (a) the editor follows to today (recommended default; it is what "after Open day, return to the current day"
  needs), (b) the editor is never touched and only the sheet moves. Recommendation (a), with the known limit that unsaved typed values are
  dropped exactly as when another column is clicked.

#### G. Slicing

No server, API, schema or migration change is needed (the `/periods/current` fields exist; theme state is browser-local), so
`dist/server` stays byte-identical to 90b98ef. One source writer at a time; each slice ends with a freeze commit by timesheet-committer.
Profiles per docs/08. Docs live in the last slice because `docs/` is in the digest.

| Task | Scope (items) | Size / risk / novelty | Profile and model | Owned paths | Depends on | Must add or update |
|---|---|---|---|---|---|---|
| WP5-UX2-T01 | Theme tokens, pre-paint script, toggle (3) | M / M / yes (first storage and head script; token layer) | worker-high (high), sonnet | `src/client/styles.css`, `src/client/index.html`, `src/client/public/theme-init.js` (new), `eslint.config.js`, `src/client/components/themeModel.ts` and `ThemeToggle.tsx` (new), `src/client/components/AppShell.tsx`, `tests/client/themeModel.test.ts`, `tests/client/cssThemeParity.test.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/contrast.ts` (new), `tests/e2e/shell.spec.ts` | none | theme unit and e2e, parity test, build has no warning, CSP check |
| WP5-UX2-T02 | Hover and pressed system (4) | S / M / no | worker-high (high), sonnet | `src/client/styles.css` (button, nav, tab, toolbar rules), `tests/e2e/hover.spec.ts` (new), `tests/e2e/focus-ring.spec.ts` (AX-04 loop) | T01 (tokens, parity) | hover criterion test, pressed-keeps-look test, AX-04 update, sticky-hover absent on phone |
| WP5-UX2-T03 | Show details switch (6) | S / L-M / no | worker (medium), sonnet | `src/client/TimesheetScreen.tsx` (the toggle only), `src/client/components/ShowDetailsSwitch.tsx` (new), `src/client/styles.css`, `tests/e2e/timesheet.spec.ts`, `shell.spec.ts`, `day-editor.spec.ts`, `focus-ring.spec.ts` | T02 | switch tests, role-change assertion updates, widths 390/375/360/320 |
| WP5-UX2-T04 | Editing column, Today bar overlay (1, A7) | M / M / no | worker-high (high), sonnet | `src/client/TimesheetScreen.tsx`, `src/client/components/TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `sheetModel.ts`, `src/client/styles.css`, `tests/client/sheetModel.test.ts`, `tests/e2e/timesheet.spec.ts` | T03 | column tests, phone row, contrast, a11y state |
| WP5-UX2-T05 | Label picker selection (2) | S / M / no | worker (medium), sonnet | `src/client/components/SheetWeekTable.tsx` (LabelPicker), `src/client/styles.css`, `tests/e2e/focus-ring.spec.ts` (AX-02), `tests/e2e/timesheet.spec.ts` | T04 | picker tests, AX-02 update, both themes |
| WP5-UX2-T06 | Today (5) | M / M / no | worker-high (high), sonnet | `src/client/TimesheetScreen.tsx`, `src/client/components/PeriodBar.tsx`, `periodBarModel.ts` or new `todayModel.ts`, `src/client/styles.css`, `tests/client/todayModel.test.ts`, `tests/e2e/today.spec.ts` (new), `tests/e2e/sharing.spec.ts` | T05 (T04 for the shared `editDate` plumbing) | unit stepping over periods, e2e both branches, zone and shared cases, budget tests |
| WP5-UX2-T07 | Docs EN+VI (D) | S / L / no | worker (medium), sonnet | `docs/04`, `docs/10`, `docs/12` (EN and `.vi.md`) | T06 | EN/VI parity |
| WP5-UX2-GATE | Package-final gate | M / M | verifier (medium), sonnet | evidence under `handoff/delivery/evidence/WP5-UX2-GATE/` | T07 freeze | see below |
| WP5-UX2-AUDIT | Independent audit | | auditor (xhigh), opus, fresh context | its review file | GATE | see below |

- Order is fixed by shared files and tokens (all slices touch `styles.css`, so strictly one writer at a time). After the audit, the
  coordinator records WP5 re-acceptance and refreshes the pilot packet identity.
- Package-final gate: `npm run verify`; lint with `@typescript-eslint/no-deprecated` and no toolchain deprecation line; full e2e on both
  projects on the real clock; the simulated-clock sweep of section E; AC-13 in two machine zones (Asia/Tokyo, America/New_York); contrast in
  both themes and with the manual override both ways; 44px and no horizontal scroll (measured with `clientWidth`) at 390, 375, 360, 320;
  the 390x844 first-screen budget in the four states with Today present; the container drill for the release image (`--wp3`, as REGATE8);
  `dist/server` byte-identical to 90b98ef; digest recorded; NAS stays NOT VERIFIED.
- The fresh independent audit (opus) re-checks: owner fidelity of the six items against the mockup and screenshots; no WCAG 2.2 AA
  regression of B5/AX-01..AX-10 (focus visible and not obscured, focus ring contrast, picker indicators, 2.5.3 names, 2.5.8 size, 1.4.1);
  the zone semantics of Today (server `today_local` only; midnight, DST, device zone, shared owner); test strength by mutation (for example:
  Today reading the device date, `aria-current` removed, the fill dropped, hover contrast below 1.2, the switch role reverted, `data-theme`
  not applied, the CSP loosened); and that no server file changed.

#### H. Optional backlog (default exclude unless the same lines change anyway)

- R-B7-1 (switcher select clipped at 355-420px, `SharingSwitcher`/shell bar): exclude; the phone bar is untouched (the toggle is in More).
- R-B7-2 (sideways-scroll check vacuous on the mobile project): include only inside the new assertions (measure `clientWidth`); do not edit
  `sharing.spec.ts`.
- R-B7-3, R-B7-4: exclude.
- R-AB8-2 (`displayedPeriodFreeWorkdays` duplicates a filter): exclude; only additive helpers.
- R-AB8-4 (sweep coverage limited to the seeded calendar): partly included: the Today sweep adds LA-midnight, DST and year-turn instants.
- R-AB9-1..R-AB9-6, B6 R-10..R-20, A7 R1/R5/N5-N7: exclude (other lines).
- Sharing settings switches (`SharingItemsFields.tsx`) already use `role=switch` but look like checkboxes: optional follow-up to reuse the new
  switch style; exclude now (Settings page, E-7).
- Sign-in and setup screens have no theme toggle (they honour the stored choice): optional later.
- "Follow the device" as a third theme state: optional later.
- docs/10 entries for WP5-UX-Q1 and WP5-UX-Q2: include (they were carried to this round; T07).

### End of plan

End state (actual): `git status --short` at the end lists, all under `handoff/`: modified `NEXT_ACTION.md`, `NEXT_ACTION.vi.md`,
`delivery/ORCHESTRATION.json`, `delivery/STATE.json`, `delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md` (the coordinator's records,
not mine; Step 0 listed only ORCHESTRATION.json), untracked `delivery/design/WP5-UX2/` and this file. Nothing outside `handoff/`. My own
writes: this file and `design/WP5-UX2/` (mockup.html and three synthetic PNGs). `npm run digest` at the end:
`57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d` (795 files), equal to Step 0. Ports 48501-48503 answer nothing (servers
stopped).

Deviations from the hard rules: none that changed a file outside the owned paths. Process notes: four shell lines piped output into
`head`/`tail` early on (`ls | grep | tail`, `grep | head -0` twice, `grep | head -5 > file`) before I stopped doing it; no data was lost and
no process was left. The measurement scripts used `child.kill()` on the server handle they spawned themselves (no PID kill), ports 48501-48503,
a fresh database under the temp folder with `DATA_DIR` and `DATABASE_PATH` set, `node dist/server/cli.js seed` (what `npm run seed` runs),
capture mail only, and they stopped their own server. Screenshots in the temp folder and in `design/WP5-UX2/` have `synthetic` in their names.
