# WP5-UX5-PLAN dispatch brief (UI change round 5: Timesheet, Review and sign off, PDF)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-PLAN, package WP5, kind
  plan, attempt 1.
  - Read-only for source, tests and docs. You write only this brief's Results and
    `handoff/delivery/design/WP5-UX5/`.
- **Profile and routing.** timesheet-planner, requested opus, override `size_risk`.
  Routing: size L, risk H, novelty yes.
  - The round redesigns Review and sign off, splits "Sign off & Submit" into a separate sign
    off and send (a server and business-flow change), redesigns the PDF, and moves the
    compact layout breakpoint. That needs one careful plan.
- **Base.** HEAD = origin/main = 178f1cf8970086018e2e96e8340d911077a2d3ad (the
  WP5-UX4-FIX2 freeze), digest 1c1c526f (850 files).
  - **WP5-UX4-FIX3 runs at the same time** as the only source writer. It changes:
    - `styles.css`;
    - `useEditorLayout.ts`, `editorLayoutModel.ts`: the classic-scrollbar decision, owner
      answer R5 b;
    - `SessionList.tsx`, `DayEditor.tsx`;
    - `src/server/routes/api.ts`, `services/timesheetCommands.ts`: grantees may not delete a
      running session, R2 a;
    - some tests and docs.
  - Plan against HEAD, and note where your items touch the files FIX3 changes.
  - Uncommitted coordinator records under `handoff/` are expected.
- **AGENTS.md on disk wins.** Its UI section: system fonts only, no icon or animation
  library, tokens, WCAG 2.2 AA, "44px targets below 768px and with a coarse pointer".
  Rules 4, 7 and 8 apply.

## Read

- The owner's words, verbatim, on the board `handoff/delivery/ORCHESTRATION.json`,
  `owner_decisions` of 2026-10-21: the entry that starts "- R5 b". It is the round-5
  request, in Vietnamese; read it in full. Also the coordinator decision of 2026-10-21.
- The round-4 plan `handoff/delivery/tasks/WP5-UX4-PLAN.md` and its mockup
  `handoff/delivery/design/WP5-UX4/mockup.html`.
- The round-4 reviews `handoff/delivery/WP5_UX4_REVIEW_A.md` and `_B.md`.
- docs/02, docs/03, docs/04, docs/05, docs/07, docs/10 and docs/12, in English. Also
  `handoff/delivery/WP5_PILOT_PACKET.md`.
- The sanitized template workbook and its README in `reference/inputs/`. Read only what you
  need for the PDF layout; never copy personal data.
- The current code, with file:line for each item.

## Deliverables

### A. The UI items (number them U5-01.. in the owner's order)

For each item, give:
- the current behaviour, with file:line;
- the proposed design;
- acceptance criteria that a gate can measure;
- the files to change;
- the tests to add or change;
- whether it touches the server, API, business rules or an earlier owner or coordinator
  decision. Name the decision.

Points that need care:
- **Compact mode moves from below 768px to below 480px.**
  - Inventory every 768px rule: CSS media queries, `matchMedia` in TypeScript, tests,
    docs/04.
  - Say what each part becomes at 480-767px:
    - the top bar versus the phone tab bar;
    - the week sheets: table with horizontal scroll, or the compact list;
    - the Day editor: the drawer (400px wide on a 480px screen?) or the bottom sheet;
    - dialogs;
    - the phone first-screen budgets.
  - The AGENTS rule "44px targets below 768px and with a coarse pointer" stays unless the
    owner changes AGENTS. Say whether the new breakpoint conflicts with it. AGENTS is a GOV
    path, so name it in E if a change would be needed.
- **The top bar keeps the company name** at narrow widths until there is no room.
- **The select chevron seam:** the vertical line in the middle of the arrow. Find the
  cause; it is drawn with two gradients.
- **Icons on Edit, Delete and Suggest breaks.** Inline SVG only, no icon library. Name the
  existing icon pattern.
- **Sub-button heights from 68px to 56px.** Measure what makes 68px now. Keep 44px targets.
- **The theme toggle in the account menu:** a smaller height.
- **Time ranges written "10:30 - 18:30"** everywhere. List every place. Give the week sheet
  cell exception: no space if it would wrap.
- **Timesheet top card** (period bar):
  - the exact layout rules the owner gives: the alignments, the chips under the range, the
    divider kept with less spacing, the button group moving down only when it does not fit,
    and the range abbreviation ladder "10/12/2026 → 10/25/2026", "10/12 → 10/25/2026",
    "10/12 → 10/25", "10/12 → 25", "10/12→25";
  - "Review & sign off" as a primary button when the period shown needs sign off. Define
    "needs sign off" from the server's period state;
  - the owner asks whether "Current period" still exists. Answer from the code: when it
    shows, with file:line.
- **Week sheets:**
  - the 767/768px header desync;
  - the header wrapping order: the field block moves down first, then each group;
  - "Open day" becomes "Open" when there is no room;
  - "Show worked hours" becomes "Worked hours";
  - compact Day spacing next to the Today marker;
  - a redesign of the "Worked on a workday" and "Worked on a day off" rows, so each clearly
    belongs to its day;
  - the WEEK header row not repainted after horizontal scroll. Find the cause;
  - compact paper margins equal to the period card.
- **Day editor:**
  - no rounded corners. This reverses U4-06; say so;
  - a click outside a day column closes it, on the phone too, with the discard guard;
  - "Partial leave" in its own sub-dialog, like the session dialog;
  - on the phone: no Figures, and "Save day fields" fixed at the bottom.

### B. Review and sign off redesign, and the sign-off/send split

1. **Inventory the current flow end to end**, with file:line:
   - what "Sign off & Submit" does: finalization, OT credit posting, PDF generation, the
     outbox and delivery;
   - auto-submit, reminders, due and overdue;
   - revisions and re-send;
   - the period and submission states, and what the server stores at each step;
   - what is immutable after signing;
   - the audit events.
2. **Design the split into Sign off and Send:**
   - state machine before and after;
   - API and data changes, any migration, and the outbox and delivery effects;
   - reminders and due or overdue keyed on sign off or on send;
   - what auto-submit means now;
   - whether recipients, subject and body can change between sign off and send;
   - whether a signed period can be sent again;
   - PDF integrity: the two toggles "Time rows on the PDF" and "OT rows on the PDF" sit on
     the Send card, so the PDF sent may differ from the one previewed at sign off. Are
     they per-send overrides of the Settings defaults?
   - **The signature.** Today the user types a name. The owner wants the current user as
     signer and the signature shown with the date after sign off. Is it the authorized
     signature image when one exists, otherwise the name? Address the auto-image
     authorization.
   - docs/02 and docs/05 rules that change, under AGENTS rule 8.
3. **The page layout**, as the owner describes it:
   - the title description rewritten without the raw submission id;
   - the chips;
   - the check card with "Back to the timesheet" ("Back" on a phone);
   - the sheet card: a "Preview" header with chips, the title lines (the company name hidden
     when it does not fit), the field line wrapping, the divider, the two week sheets, and
     a footer with a "Sign off" button in the signature area;
   - the Sign off confirmation dialog, holding the "Days that need attention" content, the
     summary and any confirmations; its errors; and the result: signature and date shown,
     signer = current user;
   - the Send card: From, To, Cc, Subject, body, Send, the two toggles, "PDF Preview" and
     "Save PDF";
   - "What you sign" moved to a muted note at the end, or removed. Recommend one.
4. Note that round-4 R3 b (two columns from 1200px) is dropped, because the checklist moves
   into the dialog. Confirm that no two-column layout remains.

### C. The PDF

- The current PDF pipeline and fonts, with file:line. Any font or library change needs an
  ADR and must not add a dependency without one.
- The design that fits one page:
  - header: the logo and company name as in the top bar on the left, the timesheet
    version or revision on the right;
  - the two title lines;
  - Employee and Payroll Date on one line, Period below;
  - the body as in the reference workbook layout: two week sheets, Overtime Total,
    Employee Signature / Date, Manager Signature / Date;
  - footer: the C&D copyright on the left and the licence on the right.
- Say what text is needed from the owner (the licence wording; the version format).
- The owner mentions "as in the picture" for the body, but no image came with the message.
  Propose the reference workbook as the source and ask.
- Name the effect on `pdf-visual` and the golden files, and the privacy of the signature
  image (AGENTS rule 4).

### D. Mockup

- Copy the round-4 mockup into `handoff/delivery/design/WP5-UX5/mockup.html` and update it.
  Use synthetic data, system fonts only, the AGENTS UI section and CSP rules.
- Show:
  - the Timesheet top card at 1440, 900, 600 and 390 (with the button group moved down and
    the abbreviated range);
  - the week sheet header and the worked rows;
  - the Day editor without corners, and the Partial leave sub-dialog;
  - the phone Day editor with the fixed Save button;
  - the new Review page (1440 and 390);
  - the Sign off confirmation dialog;
  - the Send card;
  - the PDF page.
- Add at most 16 renders named `*-synthetic.png`.

### E. Slicing and gates

- Slices with owned paths, order (one source writer), dependencies and a freeze point each.
  Mark the slices that change the server, API, data or PDF, and their risk.
- Name any GOV path, such as AGENTS for the 44px rule.
- The package-final gate items and the audit areas.
- An estimate of dispatches.
- Keep it as small as the owner's words allow (AGENTS Prime Directive). Where the owner says
  "consider", recommend the simplest.

### F. Owner questions

- At most 10 questions, each with options, pros and cons, and a recommendation.
- Contradictions with earlier owner decisions or with AGENTS come first.
- Do not ask what the owner already decided.
- The coordinator separately asks whether round 4 is closed on its own first. Do not
  repeat that question.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-PLAN`. Ports 49640-49659 for any local
  render server.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/stderr` OR `nul`, NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Write scripts with the Write tool and run them by path.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- Synthetic data only.
  - No email address except the full synthetic `@example.invalid` form.
  - No profile path.
  - No personal data from the workbook.
- Never edit source, tests, docs, AGENTS, the board or STATE. Never write into another
  task's folder. Leave nothing running.
- If a permission check denies a call, stop and report.

## Output

- Results in this file, sections A-F.
- The mockup and renders in `handoff/delivery/design/WP5-UX5/`.
- Return at most 300 words, beginning with 'Self-reported model: ...'. Include:
  - the item count;
  - the slices;
  - the server, data and PDF items;
  - the owner questions in one line each;
  - the mockup files.

## Addendum 1 (coordinator, after the owner's answers of 2026-10-21)

The owner's answers are verbatim on the board (`owner_decisions` 2026-10-21, the entry that
starts "F1.a"). Revise the plan; do not start over. Write the revision under
"### Addendum 1" in Results. Update the mockup and renders where listed.

**Decided as recommended:** F-1 a, F-2 a, F-6 a, F-7 a, F-8 a, F-10 a.

**Decided differently: revise section B (T01) and C (T02).**
1. **F-3 b.** The two PDF switches ("Time rows on the PDF", "OT rows on the PDF") can change
   at each send. Settings also gets both switches as the default values.
   - Design the per-send PDF variant: what is rendered and stored for each send, and how
     the deliveries record links to it.
   - What does "the signed PDF" mean now? The signed data stays immutable; each send renders
     a view of it.
   - Keep the storage, retention, privacy and integrity rules.
2. **F-4.** To, Cc, Subject and body are editable for each send, with Settings as the
   defaults.
   - **New owner rule:** once a copy has been sent, sending another one requires a
     confirmation and a typed reason.
   - Specify the reason: length rules, its audit record, whether it goes into the email,
     and how a failed or uncertain first send counts.
   - Re-check the outbox, idempotency, the uncertain-send rule and reminders against this.
3. **F-5 b.** The signature image is optional.
   - With an image, sign with the image and the printed name; without one, with the name
     only.
   - The signer is the signed-in person; no typed name.
   - List the rules, docs and acceptance criteria that change, for example AC-06 and docs/04
     and docs/05, under AGENTS rule 8. Also cover the automatic-image authorization.
4. **F-9 b.** Look for a handwriting font with a licence that allows embedding in a PDF and
   committing to this repository, for example SIL OFL 1.1. Give:
   - the candidates, licence, file size and glyph coverage for Latin and digits;
   - your recommendation;
   - the ADR outline: context, decision, consequences, and the licence file to commit;
   - its effect on the gate checks that assert no font file in the repository.

   If no candidate qualifies, keep F-9 a.

   **Network rule:** read licence pages only. Download nothing into the repository. A copy
   in your task folder for measuring is fine, and is deleted file by file, never with
   `rm -r`.
5. **Mockup adjustments** (update `mockup.html` and the affected renders):
   - **B1:** a little more space between the "<" and ">" buttons and the date range.
   - **B2 (390):**
     - Once "Worked hours" and "Change several days" have wrapped, the day picker fills
       the width.
     - "Open day" becomes "Open" only when "Open a day" label + picker + button no longer
       fit.
     - Narrower still, the "Open a day" label hides, leaving picker (full width) + "Open".
   - **B5:** if the Day editor "Notes" belong to Partial leave, they move into the Partial
     leave dialog. Check what Notes are for in the code and say so. If they are day notes,
     they stay.
   - **B7/B9:**
     - "Employee Signature" + "Date" and "Manager Signature" + "Date" stay in **two rows**,
       as now. Never one row.
     - The week tables keep the stronger fill on the header row and the first column
       (`--sheet-head-strong`), as now.
   - **B11 (PDF):**
     - in the header, a smaller "Revision" text and a smaller company name, with the logo
       size kept. The name must not look larger than the title "C&D Semiconductor
       Services, Inc.";
     - "Employee: ____", "Payroll Date: ____" and "Period: ____" indented by about two
       tab widths;
     - larger, clearer table text and somewhat taller tables, in the proportions of the
       owner's reference image (`coordinator_decisions` 2026-10-21, "PDF reference
       layout").
6. **Section E.** Update the slices, their order, risk and estimate. Name any new owner
   question, but only for a real contradiction.

Same runtime rules: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`,
NO NULL-DEVICE REDIRECTS, NO `rm -r`. Write only this brief and
`handoff/delivery/design/WP5-UX5/`.

## Results

Self-reported model: claude-opus-5-5. Status: done. Sections A-F below; mockup and 11 renders in
`handoff/delivery/design/WP5-UX5/`. Read-only for source, tests and docs: nothing was written in the
repository outside this Results section and the design folder. Coordinator message of 2026-10-21 (Q0 a,
the PDF footer texts, the description of the workbook PDF page) is applied in C, E and F.

### Step 0 and method

- Commands ran in Git Bash with portable Node v24.21.0 first on PATH; raw outputs in
  `D:\.claude-tmp\timesheet\WP5-UX5-PLAN\` (`step0.txt`, all exits 0). `git rev-parse HEAD` =
  `origin/main` = 178f1cf8970086018e2e96e8340d911077a2d3ad; `node scripts/source-digest.mjs` =
  `1c1c526f…cdcd0 (850 files)`, equal to the brief.
- FIX3 was editing `styles.css`, `DayEditor.tsx`, `SessionList.tsx`, `editorLayoutModel.ts`,
  `useEditorLayout.ts`, `timesheetCommands.ts` and three tests while I worked (second `git status`,
  `status2.txt`). So every source citation below is from a `git archive` export of 178f1cf in
  `...\WP5-UX5-PLAN\export` (node_modules joined by a junction to the repository's), built there
  (`build.txt`: tsc exit 0, vite exit 0). The repository `dist/` (built 11:52, after the HEAD commit)
  was not used.
- Probes (my folder, ports 49641-49645, `JOB_RUNNER=off`, capture mail, fresh synthetic seed,
  `example.invalid` accounts, Edge headless through the installed Playwright; each probe stops its own
  server through the child handle): `tools\probe-ux5.mjs` -> `run1\` (summary `run1\summary.txt`; its
  editor section failed on a clip and was redone), `tools\probe-ux5b.mjs` -> `run2\probe-ux5b.json`,
  `tools\probe-seam.mjs` -> `run3\` (chevron pixel profile, x16 renders), `tools\probe-gap*.mjs` ->
  `run4\`, `run5\` (fractional widths at 125% and 150% scaling). All exits 0. Template layout:
  `tools\read-template.mjs` -> `template-cells.txt` (cell texts and formulas of the sanitized template's
  Timesheet sheet; no personal data exists in it).
- Real clock Wed 2026-10-21 America/Los_Angeles: current = in progress = 10/12-10/25 (payroll 10/30).
- O = observed (code or measurement); A = assumption.
- Runtime slip to report: one shell call contained `node -e "1"` (a no-op, chained before a grep);
  it broke the brief's "no node -e" rule. Nothing else used stdin, heredocs or pipes into head/tail.

### Item numbering

Owner's order: U5-01 compact 480; U5-02 company name in the top bar; U5-03 select seam; U5-04 icons;
U5-05 sub-button height; U5-06 theme toggle; U5-07 time ranges; Timesheet top card U5-08 (Current
period question), U5-09 (">" and Today left), U5-10 (chips under the range), U5-11 (divider), U5-12
(buttons down only when needed), U5-13 (range ladder), U5-14 (primary Review); week sheets U5-15
(767/768), U5-16 (header wrapping), U5-17 ("Open"), U5-18 ("Worked hours"), U5-19 (Today spacing),
U5-20 (worked rows), U5-21 (WEEK row painting), U5-22 (compact margins); Day editor U5-23 (no
corners), U5-24 (click outside), U5-25 (Partial leave dialog), U5-26 (phone: no Figures, fixed Save);
Review U5-27 (title and chips), U5-28 (check card), U5-29 (Preview card), U5-30 (Sign off dialog and
signature), U5-31 (Send card), U5-32 ("What you sign"), U5-33 (sign-off/send split, server); PDF U5-34.
**34 items.**

### A. The UI items

**U5-01 Compact mode from below 768px to below 480px.**
- O, inventory: 23 `@media` rules keyed on 767/768 in `styles.css` (export lines 726, 1076, 1082,
  1119, 1423, 1896, 2279, 2351, 2687 [768-929 sideways scroll], 3367, 3560, 3650, 3709, 4438, 4445,
  4512, 4550, 4719, 4873, 5202, 5404, 5444, 5524); `DESKTOP_QUERY = '(min-width: 768px)'`
  (`ClockProvider.tsx:10`) used by `TimesheetScreen.tsx:101` for three different things (the title-row
  clock :611, the sheet layout :692, `bottomSheet={!desktop}` :724) and by `BarClock.tsx:13`; a copy in
  `ReviewDays.tsx:7`; `DRAWER_MIN_WIDTH = 768` (`editorLayoutModel.ts:9`, FIX3 file); 63 test lines
  with 767/768 in 13 files (`day-editor` 19, `timesheet` 12, `controls` 8, `shell` 7, `today` 5,
  `editorLayoutModel.test` 5, `admin` 3, `import` 3, `logo` 2, `surfaces` 2, `fixtures`, `isolation`,
  `keyboard-access`, `review` 1 each); docs/04 lines 7, 9, 43, 44, 49, 51, 56, 59, 60, 65, 71, 101, 109.
- Design (A: "compact mode" means the sheet's compact form, not the navigation shell; see F-6):
  split the one query in two. `SHELL_QUERY = '(width >= 768px)'` keeps the top bar with navigation and
  identity versus the phone bar with the tab bar and the bar clock, the title-row clock, the Day editor
  drawer versus bottom sheet, dialog full-screen rules and the 44px touch rule (AGENTS, unchanged).
  `SHEET_QUERY = '(width >= 480px)'` drives what the owner calls compact: the 7-column sheet versus the
  4-column table (TimesheetScreen and ReviewDays), the phone period-card grid, the phone toolbar, the
  hidden form title, the full-width paper. What each part becomes at 480-767px: top bar = phone bar
  (logo, wordmark when it fits U5-02, check in/out) with the tab bar (a desktop bar needs about 613px
  with nav and identity, measured nav 258px + identity 239px + logo); week sheets = the 7-column table
  scrolling sideways inside the week card (the existing 768-929px behaviour extended to 480-929px, the
  owner calls this OK) with U5-21 fixed; Day editor = the modal bottom sheet (a 400px drawer on a 480px
  window would cover 83% of it); dialogs unchanged (full screen below 768px); phone first-screen budget
  (docs/04:51, 390x844) unchanged because 390 stays compact.
- Every query is written in range syntax (`width < 480px` / `width >= 480px`, `width < 768px` /
  `width >= 768px`) so no fractional width falls between two rules (U5-15).
- AC: at 479 and 480 (and 479.33 at 150% scaling) exactly one of table/grid is in the DOM and its
  styles apply; at 600 the tab bar and the 7-column grid show together with no page sideways scroll;
  `matchMedia` in TS and the CSS rules switch at the same width (sweep 470-490 and 760-776 in 1px and
  1/3px steps); first day row at 390x844 above the tab bar as today.
- Files: `ClockProvider.tsx`, `TimesheetScreen.tsx`, `ReviewDays.tsx`, `styles.css`; `editorLayoutModel.ts`
  only if its constant moves (it does not: the drawer stays from 768). Tests: the 13 files above, a new
  breakpoint sweep in `surfaces.spec.ts`. Docs/04 (+vi). No server or rule change. AGENTS: no change
  needed (the 44px rule stays at 768 and coarse pointers). If the owner wants the 44px rule moved to
  480, AGENTS.md and AGENTS.vi.md are GOV paths (E).

**U5-02 Company name in the top bar at narrow widths.**
- O: the wordmark shows only from 1024px (`styles.css:639`), hidden 1024-1279 with the share switcher
  (:649), never on the phone bar (run1 shell sweep: `wm false` at 320-1023). Measured: wordmark
  151.4x27.8px, brand gap 12px, bar clock group 162.4px.
- Design: show it whenever it fits: phone bar from a bar width of 410px with the clock group (16 + 36
  + 12 + 151.4 + 16 + 162.4 + 16), from 250px without (shared view); desktop bar from about 840px
  without the switcher (16 + 199.4 + 32 + nav 258 + 24 + identity 239.4 + 16 + slack), 1280 with it as
  today. Implement with `@container shell-bar` thresholds (the period-cta pattern), literals documented.
- AC: sweep 320-1440 in 1px steps, own and shared views, both themes: the wordmark is visible iff
  the bar has room for it with 8px of slack; never overlaps or clips; no bar wraps to two rows.
- Files: `styles.css`, `AppShell.tsx` (container name). Tests: `logo.spec.ts`, `shell.spec.ts`. Docs/04:7.

**U5-03 The select chevron seam.**
- O: the chevron is two 7x7 gradient tiles side by side (`styles.css:2101-2110`, positions
  `calc(100% - 18px)` and `calc(100% - 11px)`). At device pixel ratio 1 the two tiles meet cleanly; at
  1.25, 1.5 (and 1.75) each tile is rasterised separately at a fractional device-pixel edge and a light
  column appears down the middle (`run3\shots\seam-dpr1_25-x16-synthetic.png`,
  `seam-dpr1_5-x16-synthetic.png`; `dpr1` has none). Windows display scaling 125%/150% is common, which
  explains the owner's report.
- Design: one layer, so there is no internal tile edge: `conic-gradient(from -45deg at 50% 100%,
  var(--muted) 90deg, transparent 0)` in one `--select-arrow-w` 12px x `--select-arrow-h` 6px tile,
  12px from the edge; forced colours unchanged; contrast unchanged (`--muted`).
- AC: at DPR 1, 1.25, 1.5, 1.75, 2, in both themes, the luminance profile across the arrow's top row
  is monotonic with no interior column lighter than both neighbours by more than 8 levels (the
  `probe-seam.mjs` method as an e2e helper); `background-image` has exactly one layer.
- Files: `styles.css`. Tests: `controls.spec.ts`. Docs/04:104 ("two gradient layers" -> one).

**U5-04 Icons on Edit, Delete and Suggest breaks.** O: buttons are text only (`SessionList.tsx:99-114`,
FIX3 file; `BreakRows.tsx:275-296`). The existing pattern is the inline SVG `<svg className="icon"
viewBox="0 0 16 16" aria-hidden="true" focusable="false">` with a stroked path (`DayEditor.tsx:349`
Close, :404 Add session). Design: pencil (Edit), trash (Delete, danger tone), sparkle (Suggest breaks),
plus (Add break, as Add session); 16px, `currentColor`, before the text; accessible names unchanged.
AC: each button has one `svg.icon[aria-hidden=true]`, text and name unchanged, no icon library in
`package.json`. Files: `SessionList.tsx`, `BreakRows.tsx`, `styles.css` (danger tone). Tests:
`day-editor.spec.ts`.

**U5-05 Sub-button heights 68px -> 56px.**
- O: there is no 68px box. Edit/Delete/Add session/Suggest breaks/Add break/Save day fields are
  39.75px CSS with a fine pointer (min 36px + 8+8 padding + 21.75 line + 2 border) and 44px below
  768px or with a coarse pointer (`run2\probe-ux5b.json` d1440, dialog1440, d390, dialog390). 44 CSS px
  = 66 device px at 150% scaling (about 68 with the border antialias); 56 device px at 150% = 37.3 CSS
  px. A: the owner measured a screenshot at 150% scaling on a touch-capable or narrow window.
- Design: a `--subbtn-h: 36px` visible height (the existing `--control-height`) for these
  sub-buttons; on touch and below 768px the 44px target stays as an invisible hit area (a `::before`
  extended 4px above and below; rows of sub-buttons keep 8px apart so hit areas never overlap).
- AC: visible box 36px ±0.5 everywhere; hit area (elementFromPoint at y = top-3 and bottom+3) still
  the button with a coarse pointer and below 768px; WCAG 2.5.8 spacing holds. F-1 decides this
  against AGENTS ("controls are at least 44px"). Files: `styles.css`. Tests: `controls.spec.ts`.

**U5-06 Theme toggle in the account menu.** O: each segment is 44px (`.account-panel .theme-option`
min-height `--tap-min`, `styles.css` export ~1064) in a 52px row, also with a mouse (run1 theme:
options 44px, items 44px, `pointer: coarse` false). Design: `--theme-seg-h: 32px` with a fine pointer,
icons 16px, row padding 4px; 44px stays below 768px and with a coarse pointer (AGENTS). AC: segment
height 32px at 1440 fine pointer, 44px with `hasTouch`/coarse emulation and in the phone More panel.
Files: `styles.css`. Tests: `theme.spec.ts`. Docs/04:112.

**U5-07 Time ranges "10:30 - 18:30".**
- O, every place: `sheetModel.ts:232` (sheet cells, desktop and phone, Review sheet), `SessionDialog.tsx:90`
  (confirmation "Save this session?") and :88 (already "07:45 - running"), :591 (pre-fill note),
  `settingsFileModel.ts:681-682` (import comparison), the PDF `timesheetPdf.ts:147, 151`, session cards
  (`dayEditorModel`/SessionList range via the same helpers), `domain/policy.ts:108` (an error with an
  en dash). Prose ranges with "to" (`format.ts:34, 51-53`, `reviewModel.ts:338-339`) are left alone.
- Measured: a week cell at the 108px minimum has 92px for text; "10:30 - 18:30" needs 91.4px,
  "22:00 - 06:00+1" 105.5px; the phone Time cell at 320px has 72px and needs 82.3px (spaced) versus
  69.6px (tight) (`run2` texts).
- Design: one formatter `timeRange(start, end, { tight })` in `sheetModel.ts`; spaced everywhere;
  the week-sheet cells render each range in a `nowrap` span and use the tight form when the cell's
  content box is narrower than the spaced text (decided per sheet from the measured column width and
  the longest range, so one sheet never mixes forms). PDF: spaced in the time cells (they have room in
  the new layout, C).
- AC: spaced text in every listed place; no range wraps inside a week cell at 480-1920 and 320-479;
  the tight form appears only where the spaced one would wrap. Files: `sheetModel.ts`,
  `SessionDialog.tsx`, `settingsFileModel.ts`, `SheetWeekTable.tsx`, `TimesheetSheet.tsx`, PDF (C).
  Tests: `sheetModel.test.ts`, `timesheet.spec.ts`, settings-file tests. Docs/04:48 ("08:00-17:00").

**U5-08 "Current period": does it still exist?** O: yes. It shows only while the server's `current`
period differs from `in_progress` (the five days from the Monday after a period ends to its payroll
Friday) and the sheet shows another period than `current` (`periodJumpModel.ts:57-63`, used at
`TimesheetScreen.tsx:599`, rendered `PeriodBar.tsx:142-164`). On 2026-10-21 current = in progress =
10/12-10/25 (`run1` periods), so it is hidden; it will show from Mon 10/26 to Fri 10/30 when the sheet
shows another period. No change; the answer goes to the owner.

**U5-09..U5-13 The period card.**
- O: grid `[<] [title+pills] [> Today Current Review]` from 768px with the actions block right-aligned
  (run1 at 1440: prev x152, range 204-412, next x1016, Today 1064, Review 1142); pills sit beside the
  range (`PeriodBar.tsx:65-80`); below 768px a phone grid with no divider (`border-top 0` at
  320-767), meta, then the button row (`styles.css:2351` block). Range text 16.5px/700, tabular
  digits; widths of the ladder forms: 200.7, 156.2, 111.8, 86.0, 77.2px (`run2` texts; the same for
  every date thanks to tabular digits).
- Design (mockup B1, B2): one card, two arrangements.
  - Wide: `[<] [range over pills] [>] [Today] [Current period?] ... [Review]`; ">" Today and
    Current follow the range on the left; Review stays right. The range block is exactly
    `--period-row-h` (the button height, 40px fine / 44px touch) tall: range line top = button top,
    pill bottom = button bottom (range line-height 20px, pills 20px, `align-content: space-between`).
  - Narrow (when the wide row does not fit): row 1 `[<] [range over pills, centred] [>]` with ">" at
    the right edge; the divider; the meta line; then Today, Current, Review in one row (the existing
    short labels "Current", "Sign off" keep working).
  - The switch is decided by `@container period-card` thresholds measured from the parts (44+12+
    range block+12+44+8+Today 70+8+Current 120 when shown+16+Review 146+32 padding: about 515px
    without Current, 640px with it; `:has([data-period-current])` picks the threshold).
  - Divider kept in both arrangements, spacing 8-10px above and 6-8px below (was 12px padding-top
    and none on phones).
  - Range ladder (U5-13): five spans (full, no start year, no years, end day only, no spaces);
    `@container period-range` shows the longest that fits; the accessible name is always the full
    "10/12/2026 to 10/25/2026" (hidden text), the visible forms are `aria-hidden`. When the two dates
    are in different months the "end day only" steps are skipped (09/28 -> 10/11 stays "09/28 ->
    10/11"); in different years the "no start year" step is skipped.
- AC: (1) wide at 1440, 1100, 900: |range.top - prev.top| <= 1, |lastPill.bottom - prev.bottom| <= 1,
  next.left - rangeBlock.right = 12 ±1, Today follows next by 8, Review.right = card content right;
  (2) narrow below the threshold: next.right = card content right, range centre = card centre ±1,
  buttons below the meta line, divider present (1px, `--line-soft`); (3) the visible range is the
  longest ladder form whose width <= its box, checked at 320, 360, 390, 430; (4) name of the title
  contains "to"; (5) no overlap or page sideways scroll from 320 to 1920.
- Files: `PeriodBar.tsx`, `periodBarModel.ts` (ladder forms), `styles.css`. Tests: `periodBarModel.test.ts`
  (ladder, month/year cases), `timesheet.spec.ts`, `today.spec.ts`. Docs/04:56, 59.

**U5-14 "Review & sign off" as a primary button when the period needs sign off.**
- O: always the secondary link style (`ReviewStatus.tsx:76`, run1 `bg transparent`).
- Definition (from server fields only): the shown period is the person's own (not shared), not
  imported, its `period_end < today_local` (from `/api/periods/current`), and its finalization is
  either no revision (draft) or an automatic revision with review pending ("Review now"). After the
  split (U5-33) a signed but unsent current revision also needs action: the label becomes "Review &
  send" and is primary too (F-2). Future and in-progress periods, signed-and-sent periods: secondary.
- AC: unit table in `reviewModel.test.ts` (draft ended -> primary; draft in progress -> secondary;
  auto pending -> primary "Review now"; signed unsent -> primary "Review & send"; sent -> secondary;
  imported -> disabled); e2e class/colour check. Files: `ReviewStatus.tsx`, `reviewModel.ts`,
  `PeriodBar.tsx`, `TimesheetScreen.tsx` (pass `today_local`). Docs/04:56.

**U5-15 Header desync between 767 and 768px.** O: reproduced at 767.33 CSS px (150% scaling,
`run5\probe-gap15.json` winW 797, `run5\shots\cur-gap-797-synthetic.png`): `(max-width: 767px)` and
`(min-width: 768px)` are both false, so React renders the phone table (matchMedia false) while
neither the phone nor the desktop CSS applies: the period card loses its grid (`none`), the paper
takes the desktop corner and margin, the form title wraps word by word in a column, tab bar and
desktop page head mix. Cause: min/max pairs with a 1px hole. Fix: range syntax everywhere (U5-01), one
breakpoint constant per query used by both CSS and TS. AC: at 479.33/767.33 (and 125%: 767.2) every
layout belongs wholly to one side. Files and tests: with U5-01.

**U5-16 Form header wrapping.** O: `.form-head` is a 2-column grid (`styles.css:2588`): the title
column shrinks first and wraps word by word into 5 lines at 768-850px while the fields stay on one
row (`run1` formHead: 768 title 71px wide, 5 lines). Design: flex-wrap with the title `flex: 1 1 auto`
and the field list `flex: 0 1 auto`: the whole field block moves under the title first; then the
groups wrap one at a time from the end (Period, then Payroll Date); the title and a value wrap word by
word only when they alone do not fit (mockup B3). AC: at widths where title max-content + fields
max-content + gap > width, fields.top > title.bottom and title is 1 line while it fits alone; groups
wrap in order Period, Payroll Date; no word is cut. Files: `TimesheetSheet.tsx` (both headers),
`styles.css`. Tests: `surfaces.spec.ts`.

**U5-17 "Open day" -> "Open" when there is no room.** O: the text "Open a day" hides below a 21rem row
(`styles.css:3455`); the button keeps "Open day" (run1: 95.7px). Design: second container step: below
the measured row width where "Open a day" is already hidden and the row still overflows, the button
shows "Open" (visible text swap with `data-short`, name stays "Open day" per SC 2.5.3 since it
contains "Open"). AC: never two rows; at 320 the button reads "Open". Files: `OpenDay.tsx`, `styles.css`.
Tests: `timesheet.spec.ts`.

**U5-18 "Show worked hours" -> "Worked hours".** `ShowDetailsSwitch.tsx:11`; docs/04:8, 41, 61 and
tests that use the name (`getByRole('switch', { name: /worked hours/i })` already matches). Supersedes
the round-4 wording (owner request, U4-10).

**U5-19 Compact Day spacing next to the Today marker.** O: at 390 the Today bar is a 3px inset shadow
and the cell padding is 4px, so the day button starts 1.5px after the bar (`run1` phone390: td x16.5,
padding 4px, button x21). Design: `padding-inline-start: calc(var(--sheet-today-bar) + var(--space-2))`
(11px) on every `td.t-day` (all rows, so the column stays aligned). AC: button.left - bar.right >= 8px
and <= 10px at 320 and 390. Files: `styles.css`. Tests: `timesheet.spec.ts`.

**U5-20 "Worked on a workday" / "Worked on a day off".** O: on the phone each day gets a separate
full-width row below it with the same thin rule as between days, so the line looks equally attached
to the next day (`SheetWeekTable.tsx:229-248`, `run1\shots\cur-worked-rows-390-synthetic.png`).
Desktop rows sit inside each day's column and are not ambiguous. Design (mockup B3): phone: each day
and its worked line form one group (`tbody` per day): no rule between the day row and its line, the
line indented and tinted (`--worked-line` token, light and both dark sets) with short labels "Workday
8:00  Day off 0:00", a 2px rule between days; desktop: keep two rows, renamed "Worked, workday" /
"Worked, day off", tinted band with a stronger rule above. AC: no border between a day row and its
worked line; a >= 2px rule between groups; text contrast 4.5:1 on the tint in all themes; the server
values unchanged. Files: `SheetWeekTable.tsx`, `TimesheetSheet.tsx`, `sheetModel.ts` (labels),
`styles.css`. Tests: `timesheet.spec.ts`, `cssThemeParity.test.ts`. Docs/04:41.

**U5-21 WEEK row not painted after horizontal scroll.** O: not a repaint bug. In the sideways-scrolling
week card (768-929px, `styles.css:2687`) the grid has `min-width` 850px but `.week-bar` is a block
as wide as the card's visible box (e.g. 786px of 850px at 850; `run1` weekScroll850:
`bar.w 786`, `grid.w 850`), so its fill and border end where the window first ended
(`run1\shots\cur-weekbar-scrolled-850-synthetic.png`). Fix: give the bar the grid's min-width (or make
the card a `width: max-content; min-width: 100%` wrapper). AC: at 480-929, bar.width == grid.width
before and after `scrollLeft = max`. Files: `styles.css`. Tests: `timesheet.spec.ts`. Applies to the
wider 480-929 range after U5-01.

**U5-22 Compact paper and card margins.** O: below 768px the paper is full-bleed (-16px margins,
`styles.css:3709-3716`, run1 phone390 paper x0 w390) while the period card has 16px side margins.
Design: `--compact-edge: 8px`: below 480px both the period card and the paper stand 8px from each
window edge, paper corner `--radius-lg`, paper inner padding 8px so the 4-column table keeps 358px at
390 (it was 358). AC: card.left == paper.left == 8 and card.right == paper.right == width-8 at 320,
360, 390, 479; table width at 390 = 358 ±1; no sideways scroll; first day row budget re-measured and
written into docs/04:51. Files: `styles.css`. Tests: `timesheet.spec.ts`, `surfaces.spec.ts`.

**U5-23 Day editor without rounded corners.** O: drawer `12px 0 0 12px` (`run2` radii) from
`styles.css:3742-3760`; phone sheet `12px 12px 0 0`. Design: `border-radius: 0` for the drawer; the
phone bottom sheet keeps its top corners (A: the owner's "detail panel" is the desktop drawer; ask
nothing, note it). This reverses round-4 U4-06 (owner request 2026-10-20) by the owner's new words;
docs/04:65 and :101 change. Files: `styles.css` (FIX3 file). Tests: `day-editor.spec.ts`.

**U5-24 A click outside a day column closes the editor (phone too), with the discard guard.**
- O: desktop: a press outside does nothing (`run2` desktopOutsideClick open true); phone: a press on
  the backdrop does nothing (phoneOutsideClick open true). The guard exists:
  `askBeforeDropping` (`TimesheetScreen.tsx:512-519`), `requestClose` (:555).
- Design: desktop: a `pointerdown` listener on the document, while the drawer is open, calls
  `requestClose` when the target is not inside a day column (`[data-day]`), the drawer, any dialog, or
  an interactive control (button, link, input, select, label, `[role=switch]`); controls keep their
  own action (so Today still moves an open editor, docs/04:57). Phone: a click on the dialog's
  backdrop (event target is the `dialog` itself, outside its box) calls `requestClose`. F-7 asks to
  confirm the control exclusion.
- AC: press on page background, title, period-card text, paper margin and legend closes (with
  "Discard your changes?" when dirty; Keep editing leaves all as before); press on another column
  switches; on a button performs it; phone backdrop tap closes; focus returns to the day button.
- Files: `TimesheetScreen.tsx`, `DayEditor.tsx` (FIX3 file). Tests: `day-editor.spec.ts`.
  Docs/04:67.

**U5-25 "Partial leave" in its own sub-dialog.** O: inline fieldset `DayFieldsForm.tsx:140-190` (hours,
minutes, kind, hint, error). Design (mockup B5): a summary row "Partial leave  2:00 vacation" (or
"none") with "Change"/"Add"; a modal sub-dialog "Partial leave" (hours, minutes, kind, hint; Remove
leave, Cancel, Done) on the `ConfirmDialog`/`BreakSubDialog` pattern; Done writes the draft of the day
fields form only, saved with "Save day fields" (so the dirty guard and the reason field keep working);
validation errors show in the sub-dialog. AC: Done without Save changes nothing on the server; Cancel
restores; focus returns to Change; Escape closes only the sub-dialog. Files: `DayFieldsForm.tsx`,
new `LeaveDialog.tsx` (reusing `LeaveRow.tsx`, `leaveInputModel.ts`), `styles.css`. Tests:
`day-editor.spec.ts`, `leaveInputModel.test.ts`. Docs/04:69, 77.

**U5-26 Phone Day editor: no Figures, "Save day fields" fixed at the bottom.** O: the whole sheet
scrolls (`overflow-y: auto` on the dialog, scrollHeight 1276 vs 726, `run2` sheet390); Figures at
y 1071 and Save at y 1015 (below the fold). Design (mockup B6): below 768px the sheet is a grid
`head / body (scrolls) / foot`; Figures is not rendered on the phone (the server values remain on the
desktop drawer); the foot holds "Save day fields" full width, 44px, as the session dialog's foot.
AC: at 390x844 the Save button is fully visible without scrolling and stays at the same y after
scrolling the body; no "Day figures" section below 768px. Files: `DayEditor.tsx` (FIX3 file),
`DayFieldsForm.tsx` (button moved to a foot slot or a form attribute), `styles.css`. Tests:
`day-editor.spec.ts`. Docs/04:69.

### B. Review and sign off redesign, and the sign-off/send split

**B1. Today's flow (O).**
- "Sign off & Submit": `ReviewSignoff.tsx:99-101` -> `POST /api/timesheets/:date/signoff`
  (`routes/submission.ts:149-159`, body `signoffBody` with `expected_version`, `reviewed_hash`,
  `signer_name`, choices, acknowledgement) -> `signOffTimesheet` (`finalization.ts:440-545`), one
  IMMEDIATE transaction: rebuild the review payload and compare version and hash (409 stale), require
  name and the current signature image (422 / 409), acknowledgement and deficit choices; insert the
  immutable revision (`original`, `employee`, `signed`, `send_requested 1`) and the `signoffs` row
  (`signer_name`, `signed_at`, signature attachment); post debits then credits through ledger.ts;
  set `finalized_revision_no`; enqueue `render_pdf` and `send_email` (`enqueueJobs` :424-434,
  business key `revision:<id>:send_email:initial`); audit `timesheet.signoff` (ids, hashes, counts).
- The signed snapshot (`domain/snapshot.ts:130-170`) holds the days, totals, proposals,
  `recipients` (to, cc, rendered subject and bodies, template version), signature reference,
  auto-image authorization, note line and `show_ot_on_pdf`; its hash binds all of them. The PDF job
  renders from it (`pdfJob.ts:221-262`, `timesheetPdf.ts`), the send job builds the message only from
  the snapshot and the stored PDF (`message.ts:65-116`, `sendJob.ts:210-282`) and freezes the envelope
  per attempt.
- Revisions: `POST .../revisions` (correction, reason, `send_email` explicit) and `.../late-review`
  (`finalization.ts:949-1076`); same-revision resend `POST /api/revisions/:id/resend` (:1103-1193;
  refuses a changed envelope with 409 `envelope_changed`, in-flight or uncertain attempts).
- Deadline: `runDeadlineScan` (`automation.ts:344-389`): an unfinalized eligible period with auto-submit
  on is finalized automatically (`finalizeAutomatically`, origin `deadline`, review pending, PDF and
  send jobs); off -> one `deadline.overdue` audit record; finalized -> skipped.
- Reminders (`notifications.ts:28-49, 84-92, 240-318`): before-due notices and the overdue warning
  stop once the period is finalized; outcome notices after automatic finalization.
- Immutable after signing: revision row, signoff row, ledger lines and postings, revision files and
  delivery attempts (triggers in `0004_submission.ts:139-344`).

**B2. The split (design).**
- State machine, before: Draft -[Sign off & Submit]-> Finalized + PDF + Send -> delivery states.
  After: Draft -[Sign off]-> Signed (revision, sign-off, ledger, PDF job; no send job) -[Send]->
  Sent (send job and attempts, delivery states as today). Draft -[deadline, auto on]-> Automatic
  (unchanged: finalized, PDF and send). Signed-not-sent -[deadline]-> see F-2 (recommended: auto on
  -> the system sends the signed revision; auto off -> overdue warning "signed, not sent").
  Corrections and late reviews sign the same way and never send by themselves; the Send card sends
  the current revision (first send = `initial` key, later = resend).
- API: `POST /signoff` keeps its path; it no longer takes `signer_name` (the server uses the session
  user's display name, which is `payload.employee.name`), adds the two PDF row choices when F-3 a is
  chosen (`pdf_time_rows`, `pdf_ot_rows`, both in the hashed payload), and enqueues only `render_pdf`
  (`send_requested 0`). New `POST /api/revisions/:id/send` (owner only, not on the shared allowlist):
  current revision, not imported, no send job yet (else 409 `already_sent`, use resend), enqueues the
  `initial` send job (the job already waits for the PDF), audit `revision.send`. `late-review` and
  `revisions` bodies: the UI sends `send_email: false`; the field stays (no break). New
  `GET /api/timesheets/:date/pdf-preview?time=1&ot=1` renders an unsigned preview from the current
  review payload (writes nothing, `no-store`, inline, owner only; signature area reads "Preview, not
  signed", no image). `GET /api/revisions/:id/pdf?disposition=inline` for "PDF Preview" after signing.
  Review GET adds `sender` (the configured From address or null) outside the payload, like
  `grantee_changes`.
- Data: no migration. `send_requested` keeps its meaning "requested at finalization" (0 for the new
  sign-off); "sent" = a `send_email` job exists for the revision. The client's
  `deliveryStatus` (`reviewModel.ts:262-290`) reads jobs instead of `send_requested` ("Not sent yet"
  replaces "Email not requested"). Snapshot schema version 3 only if F-3 a adds `show_time_on_pdf`
  (v1/v2 render with time rows on).
- Reminders/due/overdue (F-2 recommended a): keyed on "sent" for the period's current revision:
  before-due reminders continue until a send is requested (text "signed, not sent yet" when signed);
  the deadline scan treats signed-not-sent like a draft for automation: auto on -> enqueue the
  `initial` send (audit `deadline.send_signed`; no new revision, no ledger); auto off -> overdue record
  and warning. Files: `automation.ts`, `notifications.ts`, `domain/reminders.ts`.
- Auto-submit after the split = "at the deadline the system submits what is not yet submitted":
  a draft is finalized automatically and sent (unchanged); a signed revision is sent as signed.
- Recipients, subject, body between sign off and send: frozen at sign-off in the signed snapshot
  (unchanged rule; docs/05 "Changed ... recipient envelope needs a new immutable reviewed revision");
  the Send card shows them read-only with a Settings link before sign-off, frozen after (F-4). The Sign
  off dialog warns when To is empty ("you will need a correction to send").
- Sending again: yes, "Send again..." = the existing resend (same PDF, same envelope, explicit
  confirmation; refused while in flight or uncertain).
- PDF integrity and the two toggles (F-3 recommended a): per-period presentation choices, defaults
  from Settings (OT: the existing `show_ot_on_pdf`; Time: on, no new setting), editable on the Send
  card only before sign-off, sent with the sign-off and covered by the payload hash; after sign-off they
  show the signed values, disabled, so the PDF sent is always the PDF signed. "Time rows on the PDF"
  is new (today the time row is always printed, `timesheetPdf.ts:208-214`).
- The signature: signer = the signed-in owner (display name from the account); manual sign-off still
  requires the uploaded signature image (docs/04:120, docs/05:9, AC-06); without one the dialog
  disables Sign off with a link to Settings (F-5). After success the Preview footer shows the signed
  image (`/api/signatures/:attachment_id` of `signoff.signature_attachment_id`, owner only, already
  served by `routes/signatures.ts:89`), the name and the date (`signed_at` in the reporting zone,
  R-07). The auto-image authorization is untouched: it governs only automatic submissions; a signed
  revision sent at the deadline carries the image of its real sign-off.
- Rules that change (AGENTS rule 8; canonical text plus .vi.md): docs/05 "Manual path" (sign off and
  send are separate acts; the name comes from the account), "Deadline and recovery" (signed-not-sent
  per F-2), "Reminders" (stop at send), "Corrections and resends" (Send card); docs/04 Review row
  (:10), "Email and PDF" (:118, :120: name from account, optional time rows); docs/03 API boundary
  (send, pdf-preview); docs/06 AC-06 wording and AC-07 (auto-send of a signed revision); docs/10
  decision record; docs/12; the pilot packet sections 2 ("sign off and submit" in the capture
  self-test; D-12 first send) and 3 (new samples and hashes). docs/02 R-06/R-07 unchanged (posting at
  finalization, PDF date = `signed_at`).

**B3. The page (mockups B7-B10).**
- U5-27 Title: "Review and sign off"; description "Pay period Mon 10/12/2026 -> Sun 10/25/2026 ·
  payroll date Fri 10/30/2026 · due Tue 10/27/2026, 17:00 (America/Los_Angeles)" (no submission id;
  it stays on the PDF and in the email); chips under it, left-aligned: the period pill and the status
  chips (Draft / Signed / Not sent yet / delivery state / Imported). O today: `ReviewScreen.tsx:164-177`.
- U5-28 Check card: same padding as the period card (16px, 12px and 8px edges in compact); text left,
  vertically centred, wraps; "Back to the timesheet" right, centred, "Back" below 480px (name stays
  full); gap >= 16px. New text: "Check every day, then sign off. Signing off locks this period and posts
  your OT credits; you send the PDF to payroll afterwards, below." (MODE_INTRO :30-36 rewritten for the
  three modes).
- U5-29 Preview card: header bar "Preview" + the same chips; line 1 "C&D Semiconductor Services,
  Inc." large, centred, one line, hidden (not wrapped) when it does not fit (container query on its
  measured max-content); line 2 the title, large, centred, wraps by word; line 3 the fields with a
  12px gap above, wrapping as U5-16; divider; the two week sheets (detail rows on, as today);
  footer as the Timesheet's with a primary "Sign off" button in the Employee Signature line. This
  contradicts nothing in round 2's "company line removed from the on-screen timesheet" (2026-10-14):
  that stays on the Timesheet page; the owner now asks for it on the Review preview only.
- U5-30 Sign off confirmation dialog (B9): summary (signer "(you)", date on the PDF = today in the
  reporting zone, OT total, signature image preview), all of today's step 1 content
  (`ReviewFindings.tsx`: OT proposals, deficit choices, missing evidence with acknowledgement,
  reserved OT leave), the correction reason in correction mode, the "sends nothing" note; Cancel and
  Sign off. Errors: blockers inline in the dialog; a server refusal opens the alert dialog "Not signed
  off" (U4-15 `AlertDialog`), a stale review reloads and says so; nothing is signed. Success closes the
  dialog and shows image, name, date and a "Signed" mark in the footer.
- U5-31 Send card: From, To, Cc, Subject, body (read-only), the two switches, "PDF Preview", "Save PDF"
  (enabled after sign-off; downloads the stored final PDF), "Send" (primary; disabled "Sign off first"
  before; "Send again..." after a send); status chip.
- U5-32 "What you sign": remove the heading and its hint; keep one muted note at the end of the page,
  "Dates are accounting dates in America/Los_Angeles. Session times are shown in that zone, as on the
  PDF." (AGENTS rule 7 makes the zone worth one line). Recommended, no question.
- Two columns: the checklist moves into the dialog, so `.review-layout` (`styles.css:5055`, 1330px)
  and docs/04:44's "On Review the checklist sits beside the paper from 1330px" are removed; round-4 R3 b
  is dropped (coordinator decision 2026-10-21). One column at every width.
- Files: `ReviewScreen.tsx`, `ReviewSignoff.tsx` -> `SignoffDialog.tsx`, `ReviewEnvelope.tsx` ->
  `SendCard.tsx`, `ReviewDays.tsx`, `TimesheetSheet.tsx` (ReviewSheet header and footer),
  `reviewModel.ts`, `ReviewStatus.tsx`, `api.ts` (types), `styles.css`. Tests: `review.spec.ts`,
  `submission.spec.ts`, `reviewModel.test.ts`, `deliveryModel.test.ts`.

### C. The PDF (U5-34)

- O, pipeline: `pdfJob.ts` loads the snapshot and signature, calls `renderTimesheetPdf`
  (`timesheetPdf.ts:233-354`, pdf-lib 1.17.1 + `@pdf-lib/fontkit`, US Letter 612x792, margin 36),
  fonts DejaVu Sans and Sans Bold read from the `dejavu-fonts-ttf` package (`fonts.ts:20-33`), subset
  embedded, deterministic bytes. Header today: company 15pt and title 11pt left, submission id and
  revision right; footer "TS-... | Revision n".
- Reference (workbook page as described by the coordinator; template cells `template-cells.txt`:
  A1 company, A3 title, C5-C6 instructions, E8 Employee, E10 Payroll Date, rows 12-16 and 19-23 the
  weeks, N24/X24 Overtime Total, B27/W27 Employee Signature/Date, B30/W30 Manager Signature/Date).
- Design (mockup B11), one page, no new dependency:
  - header line: the logo (vector, drawn with pdf-lib rectangles, circle and clipping from
    `cd-logo.svg`) and the wordmark (`page.drawSvgPath` with the outline paths now in
    `BrandWordmark.tsx`, moved to one shared constants module imported by client and server) on the
    left; "Revision n" in teal on the right with the submission id small under it (AC-10);
  - titles: "C&D Semiconductor Services, Inc." and the title, centred, bold serif (DejaVu Serif
    Bold, already in the installed package);
  - Employee and Payroll Date on one line (bold labels, underlined values), Period below;
  - two week tables: rotated left label (week number and WEEK; OT), header row day name in small
    capitals (simulated: uppercase at 82% size) and the date MM/DD/YYYY (E-4), Saturday/Sunday header
    tinted peach and body grey (from the server calendar's non-working days, holidays included), a
    tall category row (DejaVu Serif Italic in place of the handwriting face), two small time cells
    (start, end; several sessions stack; hidden with "Time rows" off) over one OT cell (hidden with "OT
    rows" off); free height is spread over the rows by a pure `pdfLayout({ timeRows, otRows })` so the
    page is filled and never overflows;
  - "OVERTIME TOTAL : 5:00 (H:MM)" right-aligned in small capitals; pending note left;
  - Employee Signature (image above the line, name under it) and Date; Manager Signature and Date blank;
  - footer: "© 2026 C&D Semiconductor Services, Inc. All rights reserved." left (the year from the
    payroll date, not the clock) and "Internal use by C&D only" right (owner text, coordinator message).
  - No instructions paragraph (F-8).
- ADR: none if F-9 a (fonts from the existing package, vector brand from existing assets); a
  handwriting font would be a new font file and licence: ADR plus the docs/03 PDF baseline.
- Effects: `tests/e2e/pdf-visual.spec.ts` has no golden image; its text checks change (identifiers
  move to the header, "Overtime Total" casing, the new footer, the time cells) and it gains checks for
  one page, the footer texts, the logo drawn, both toggles off. Unit tests for `layout.ts`
  (`pdfLayout` sums <= 720pt for all four toggle states, 4 sessions per day, long holiday labels).
  The pilot packet sample PDFs and hashes (section 3, S1-S4) are regenerated. Privacy (AGENTS rule 4):
  the signature image stays private (embedded only in the owner's own PDF, never served on a public
  path, not in the repository); the reference page the owner showed is not stored; samples use the
  synthetic seed signature.

### D. Mockup

`handoff/delivery/design/WP5-UX5/mockup.html` (139,751 bytes): built by
`...\WP5-UX5-PLAN\tools\build-mockup5.mjs` from a copy of the round-4 mockup's head (tokens, parts,
logo and wordmark symbols; the round-4 boards replaced) plus `tools\round5.css`; rendered offline by
`tools\render-ux5.mjs` (exit 0; 0 scripts, 0 external references, 0 blocked requests, 0 console
messages, no frame overflow, only `example.invalid` addresses; `render3.json`). 11 renders:
`mockup-r5-b1-topcard-wide`, `-b2-topcard-narrow`, `-b3-header-worked`, `-b4-controls`, `-b5-editor`,
`-b6-phone-editor`, `-b7-review-1440`, `-b8-review-390`, `-b9-signoff-dialog`, `-b10-send-card`,
`-b11-pdf` (each `*-synthetic.png`). Each was viewed after rendering. The mockup is static HTML in the
browser's fonts; the PDF board approximates DejaVu Serif with system serif.

### E. Slicing and gates

One source writer at a time, each slice followed by its freeze (committer). All start after the
WP5-UX4-FIX3 freeze (FIX3 owns `styles.css`, `DayEditor.tsx`, `SessionList.tsx`, `editorLayoutModel.ts`,
`useEditorLayout.ts`, `timesheetCommands.ts`, `api.ts` routes); overlap: T03, T04, T05 touch
`styles.css`; T05 touches `DayEditor.tsx` and `SessionList.tsx`.

| Slice | Content | Owned paths (main) | Server/API/data/PDF | Risk | Depends |
|---|---|---|---|---|---|
| UX5-T01 | U5-33: split, signer from account, `send` route, `pdf-preview`, inline PDF, row choices in the hash (per F-3), deadline and reminders (per F-2), docs/05, 03, 06, 10 (+vi) | `services/finalization.ts`, `routes/submission.ts`, `http/schemas.ts`, `services/reviewPayload.ts`, `services/automation.ts`, `services/notifications.ts`, `domain/reminders.ts`, `domain/snapshot.ts`, `client/api.ts` (types), `tests/integration/*submission*`, `*automation*`, `*notification*`, docs | server, API, business rule, snapshot v3 | H | F-2..F-5 answers |
| UX5-T02 | U5-34 PDF | `pdf/timesheetPdf.ts`, `pdf/layout.ts`, `pdf/fonts.ts`, new shared brand-paths module, `BrandWordmark.tsx`, `tests/e2e/pdf-visual.spec.ts`, pdf unit tests | PDF | M | T01 (time-row field), F-8..F-10 |
| UX5-T03 | U5-27..U5-32 Review page | `ReviewScreen.tsx`, Review components, `TimesheetSheet.tsx` (ReviewSheet), `reviewModel.ts`, `ReviewStatus.tsx`, `styles.css` (Review block), `review.spec.ts`, `submission.spec.ts` | client | M | T01 |
| UX5-T04 | U5-01, 02, 08-15, 22: breakpoints, shell, period card | `ClockProvider.tsx`, `TimesheetScreen.tsx`, `ReviewDays.tsx`, `PeriodBar.tsx`, `periodBarModel.ts`, `AppShell.tsx`, `styles.css`, the 13 test files with 768 | client | M-H (wide CSS) | F-6; after T03 |
| UX5-T05 | U5-03..07, 16-21, 23-26 | `styles.css`, `sheetModel.ts`, `SheetWeekTable.tsx`, `TimesheetSheet.tsx`, `DayEditor.tsx`, `DayFieldsForm.tsx`, new `LeaveDialog.tsx`, `SessionList.tsx`, `BreakRows.tsx`, `OpenDay.tsx`, `ShowDetailsSwitch.tsx`, `SessionDialog.tsx`, `settingsFileModel.ts`, related tests | client | M | F-1, F-7; after T04 |
| UX5-T06 | docs/04, 12, pilot packet (EN+VI), regenerated samples | docs, `handoff/delivery/WP5_PILOT_PACKET*.md`, evidence | docs | L | T01-T05 |

- GOV paths: none needed. AGENTS.md (+.vi) only if the owner moves the 44px rule (F-1 c or F-6 b).
- Package-final gate (round 4 folded, Q0 a): typecheck, lint (no-deprecated), unit, integration,
  build, smoke, full e2e on Chromium/Edge desktop and mobile projects; breakpoint sweeps (470-490,
  760-776, fractional widths at 125/150%); the seam pixel test; PDF render check of all four toggle
  states; privacy grep; source digest. Rechecks of F-UX4A-1..4 and F-UX4B-1.
- Audits (fresh, non-author): area A (visual and shell: U5-01..U5-32 against mockup and docs/04,
  WCAG 2.2 AA, both themes, F-UX4A-1..4); area B (server, data, PDF: the split, ledger once-only, no
  send without an explicit act or the deadline rule, signer identity, hash binding of the row
  choices, owner-only routes and the shared allowlist, reminders, PDF content and privacy,
  F-UX4B-1); integration audit across rounds 4 and 5.
- Dispatch estimate: 6 slices + 6 freezes + 1 gate + 3 audits = 16, plus one fix round with freeze,
  regate and two rechecks (about 6): 20-24.

### F. Owner questions (contradictions first)

**F-1 Sub-buttons 56px versus AGENTS "44px below 768px and with a coarse pointer".** Measured
heights are 39.75px (mouse) and 44px (touch or narrow); 68 and 56 match 150% screenshots of 44 and
about 37 CSS px. (a, recommended) 36px visible on every device, the 44px touch target kept as an
invisible hit area: pro: the look asked for, AGENTS kept; con: hit area and box differ (more test
work). (b) 36px only with a mouse, 44px on touch: pro: simplest; con: on a touch laptop it stays 44px
(what the owner sees now). (c) 36px everywhere and change AGENTS (GOV cycle): con: weaker touch
targets.

**F-2 After the split: deadline, reminders and "needs sign off".** (a, recommended) "Submitted" means
sent: reminders run until a send is requested; at the deadline a signed but unsent period is sent
automatically when auto-submit is on, and gets the overdue warning when it is off; the Timesheet
button is primary ("Review & send") for it. Pro: payroll still receives every period; con: a second
automatic act to test. (b) Sign-off alone counts: reminders stop at sign-off, nothing sent
automatically. Pro: smallest change; con: a forgotten Send means payroll never gets the PDF. (c) Sign
off always sends at the deadline even with auto-submit off. Con: sends without the person's switch.

**F-3 The two PDF switches on the Send card.** (a, recommended) per-period choices fixed at sign-off
(defaults from Settings; locked afterwards): the sent PDF is always the signed one, no data change
beyond one payload field. (b) per-send overrides: each send renders its own PDF variant: pro:
flexible; con: several PDFs per revision, new storage and integrity rules. (c) Settings only, shown
read-only on the card: con: not what the owner drew.

**F-4 Recipients, subject and body on the Send card.** (a, recommended) read-only, from Settings,
frozen at sign-off (current rule; a change needs a correction). (b) editable on the card until
sign-off (writes the Settings): pro: one place; con: settings edits from the Review page. (c) editable
per send (the envelope leaves the signed content): con: snapshot and send-job redesign, rule change.

**F-5 Sign off without an uploaded signature image.** (a, recommended) keep the rule: image required;
the dialog links to Settings. (b) allow the typed-free name only: changes docs/04/05 and AC-06; PDFs
without an image.

**F-6 What moves to 480px.** (a, recommended) the sheet's compact form (table, period card, toolbar,
paper) moves to below 480px; the navigation shell, the bottom-sheet editor, full-screen dialogs and
the 44px rule stay at 768px. (b) everything moves to 480px: the desktop bar does not fit below about
613px and a 400px drawer covers a 480px window; AGENTS change.

**F-7 "Click outside" closes the Day editor.** (a, recommended) a press outside the columns, the
drawer and dialogs closes it, but presses on buttons and links keep their own action (Today still
moves the editor). (b) any press outside the columns closes it first, then the control acts: con:
Today and Next lose "move the open editor".

**F-8 The workbook's instructions paragraph on the PDF.** (a, recommended) omit it: the app sets the
categories and due date itself, and the space goes to the tables. (b) keep both lines (adapted
category list).

**F-9 PDF fonts.** (a, recommended) DejaVu Serif Bold for titles and labels, simulated small
capitals, DejaVu Serif Italic in place of the handwriting face: all from the already installed
package, no ADR. (b) add a handwriting font file: needs an ADR, a licence check and a new asset.

**F-10 The header "version/revision".** (a, recommended) "Revision n" with the submission id small
under it (AC-10 traceability). (b) "Revision n" only and the id in the PDF metadata: con: AC-10 and
docs/04 need a wording change. (c) "Version n".

Decisions superseded by the owner's own new words (no question): U4-06 drawer corners (U5-23),
round-4 R3 b (U5-32), "Show worked hours" (U5-18), the company line on the Review preview only (U5-29).

### Addendum 1

Owner answers (board `owner_decisions` 2026-10-21, "F1.a ..."): F-1 a, F-2 a, F-6 a, F-7 a, F-8 a,
F-10 a as recommended; F-3 b, F-4 (editable per send plus the reason rule), F-5 b, F-9 b decided
differently. Sections B, C, D (mockup) and E are revised below; every other part of A-F stands. Still
read-only: nothing outside this section and `handoff/delivery/design/WP5-UX5/` was written in the
repository. Commands and outputs in `D:\.claude-tmp\timesheet\WP5-UX5-PLAN\` (`build-add1b.txt`,
`render5.json`, `fonts\`), all exits 0. Source citations are from the 178f1cf export, as before.

#### B, revised (slice T01 is split in two)

**B-A1. Signed data versus sent copies (F-3 b, F-4).** The signed record is unchanged and immutable:
the revision payload (hash), the `signoffs` row (account name, `signed_at`, optional image). A
**send** is a new immutable record that says what one copy contained; each PDF is a deterministic view
of the signed record plus the send's two row options. "The signed PDF" now means "any rendering of the
signed revision"; all variants carry the same days, totals, signature and date, and differ only in
whether the Time rows and the OT rows are printed.

- Migration `0014_sends` (one file, table rebuilds in the existing style):
  - `revision_files`: add `variant TEXT NOT NULL CHECK (variant IN ('t1o1','t1o0','t0o1','t0o0'))`,
    unique `(revision_id, kind, variant)` instead of `(revision_id, kind)` (`0004_submission.ts:213-240`);
    existing rows get `t1o1`, or `t1o0` when their snapshot has `show_ot_on_pdf = false` (the time row
    was always printed, `timesheetPdf.ts:208-214`). At most four PDFs per revision, each rendered once,
    hashed, never deleted (retention unchanged).
  - new `revision_sends`: `id`, `user_id`, `revision_id`, `send_no` (1.., unique per revision),
    `request_key` (unique; the client's attempt key, `useAttemptKey.ts`), `origin` (`employee` |
    `deadline`), `actor_user_id` (null for `deadline`), `to_json`, `cc_json` (the existing address
    rules), `subject` (1-300 characters, no line break), `body_text` (1-20,000), `body_html` (generated
    from the text, escaped), `time_rows`, `ot_rows` (0/1), `pdf_variant`, `reason` (null, or 2-500
    characters after trimming, NFC, no control characters except line feeds), `job_id`, `created_at`;
    no-update and no-delete triggers. Private like other rendered email content (docs/03): owner only;
    administrators keep seeing recipient addresses of attempts only (F-Q3 b).
  - `submission_settings`: `ADD COLUMN show_time_on_pdf INTEGER NOT NULL DEFAULT 1 CHECK (0/1)` (the
    Settings default the owner asked for; versions stay append-only). The settings file allowlist
    (`settingsFileModel.ts`) gains the optional key `show_time_on_pdf` (older files without it still import).
  - `signoffs`: see B-A3.
- Routes (owner only; none on the shared allowlist, F-Q5):
  - `GET /api/revisions/:id/send-draft`: the defaults for the Send card: To, Cc, subject and body
    rendered from the current Settings templates for this revision, the two switches from Settings,
    the sender address, and `copy_sent_before` (B-A2) with the earlier copy's date and recipients.
  - `POST /api/revisions/:id/send` `{ request_key, to, cc, subject, body_text, time_rows, ot_rows,
    reason? }`: current revision, not imported; refused while an attempt of the revision is open or
    uncertain without a decision (`delivery_attempts_one_open_per_revision`, `0004_submission.ts:321`)
    or a send job is waiting (409 as `resendRevision` does today, `finalization.ts:1133-1148`); 422
    `reason_required` when B-A2 says a copy was sent and no valid reason came; same `request_key` with
    the same body replays (200), with another body 409. One transaction: the `revision_sends` row, the
    send job (business key `send:<send id>`, payload routing ids only), the PDF job for the variant when
    it is not stored yet (`revision:<id>:render_pdf:<variant>`), audit `revision.send` (send id and
    number, options, recipient counts, reason). The existing `/resend` becomes this route with the
    previous send's values; History's resend uses it.
  - `GET /api/revisions/:id/pdf?time=1&ot=0[&disposition=inline]` ("PDF Preview" and "Save PDF"
    after sign-off): returns the stored variant or renders it on request (no network; atomic file write
    then a short write transaction, the `pdfJob.ts` path). On the shared mount the query is ignored and
    the variant of the latest send (or the sign-off default) is served, so a grantee never triggers a
    render. `GET /api/timesheets/:date/pdf-preview?time&ot` (unsigned preview, writes nothing) as in B2.
- Jobs: the send job loads its `revision_sends` row and builds the message from it, not from
  `snapshot.recipients` (`message.ts:65-116`, `sendJob.ts:122-139, 243`); each attempt keeps its frozen
  envelope and body hash (unchanged trigger rules); it waits until its variant PDF is `ready`.
- Automatic paths: `finalizeAutomatically` and the F-2 a deadline send of a signed revision create a
  `revision_sends` row with `origin deadline` from the Settings at that moment (envelope, both
  switches); they never need a reason (they run only when no copy counts as sent).
- Reminders (F-2 a): a period counts as submitted once its current revision has any send; unchanged
  otherwise.

**B-A2. The owner's rule: another copy needs a confirmation and a typed reason.**
- Scope: the period (all its revisions). A copy "counts as sent" when one of its attempts is
  `accepted` or `uncertain` (whatever the later decision: the mail may have arrived). A send whose
  attempts all ended `failed_permanent` does not count, so retrying a failed first send needs no
  reason. A send still in progress blocks a new one (409), as today.
- When a copy counts, the Send button reads "Send another copy..." and opens a confirmation dialog
  naming the earlier copy (date, recipients, delivery state) with a required "Reason for sending
  another copy" (2-500 characters). For a correction revision the field is prefilled with the
  correction reason, still editable and confirmed.
- The explicit decision "resend" on an uncertain attempt (`routes/submission.ts:224-228`) is another
  copy of a possibly delivered mail, so it asks for the reason too.
- The reason is stored on the send, written to the owner's audit event, shown in the owner's History,
  and not added to the email (the person may write it in the body).
- The check runs inside the send transaction, so two tabs cannot both skip it.

**B-A3. Optional signature image (F-5 b).**
- Signer = the signed-in owner; the name is the account's display name, frozen in `signoffs.signer_name`.
  With a saved image the PDF and the Review footer show image and name; without one, the name only.
  There is no choice to leave out a saved image ("có ảnh thì ký bằng ảnh và tên").
- Data: `signoffs.signature_attachment_id` becomes nullable (table rebuild in `0014`; trigger
  `signoffs_image_kind` gains `WHEN NEW.signature_attachment_id IS NOT NULL AND ...`,
  `0004_submission.ts:153-176`). The payload `signature` may be null; when present it must still equal
  the current image (409 `stale_review` as today, `finalization.ts:469-475`).
- Code: `signOffTimesheet` stops returning 422 `signature_required`; `pdfJob.ts:110-123` passes null;
  `timesheetPdf.ts:249` drops "A manual revision needs its signature image"; the Review dialog shows
  "your name only" when no image is saved, with a link to Settings to add one.
- The automatic-image authorization is unchanged: it is asked at upload and governs only automatic
  submissions (docs/05:24). A manual sign-off places the current image when one exists.
- Rules, docs and acceptance criteria that change (AGENTS rule 8, with .vi.md): docs/04:120 "Manual
  sign-off requires both the employee name and a validated uploaded signature image" -> "Manual
  sign-off is the signed-in owner's act; it records the account's display name and, when one is saved,
  the signature image"; docs/04:118 PDF bullet ("employee name/image/date" -> "name, image when saved,
  date"; "optional time/OT rows" chosen per send, defaults in Settings, new default row "Time rows on
  PDF: On"); docs/05:9 "Manual path" (same, plus sign off and send separately); docs/05:57-61
  "Corrections and resends" (the envelope and the two switches are chosen for each send; the reason
  rule replaces "Changed report content or recipient envelope needs a new immutable reviewed revision"
  for the envelope; content changes still need a correction); docs/05:43-55 "Durable delivery" (the send
  record); docs/03 records table (sends, PDF variants, optional image) and API boundary; docs/06 AC-06
  ("Sign-off is the signed-in owner's act, records the account name and the image when saved, and binds
  the reviewed payload"), AC-10 ("bounded image when present", the time rows optional), AC-14 (exact
  captured recipients/body per send); docs/10 decision record; the pilot packet sections 2 and 3.

**B-A4. Re-checks.** Outbox: one job per send, unique business keys, no network in a write
transaction. Idempotency: the request key. Uncertain: unchanged (no blind retry; one open attempt per
revision; a resend decision now needs the reason). Ledger: sends never post. Shares: no send, draft or
render route for grantees (allowlist `shares.ts:109-129` unchanged except the PDF route ignoring its
query). Audit: no secret, the reason is the owner's own text.

#### C, revised (PDF and the handwriting font, F-9 b)

- **Candidates** (licence pages read: the Google Fonts repository's `OFL.txt` and `METADATA.pb` of each
  family; the two font files were copied to my task folder only to measure them and then deleted file
  by file; `fonts\coverage.txt`, `fonts\meta-summary.txt`, `fonts\ofl-summary.txt`):

  | Font | Licence | File | Glyphs | Basic Latin, digits, Latin-1 | Vietnamese | One-page subset PDF |
  |---|---|---|---|---|---|---|
  | Indie Flower 2.000 | SIL OFL 1.1, no Reserved Font Name | 108,196 B | 569 | complete | complete | 7,241 B |
  | Patrick Hand 1.003 | SIL OFL 1.1, no Reserved Font Name | 214,772 B | 728 | missing "µ" only | complete | 6,717 B |
  | Caveat | SIL OFL 1.1 | variable font only | - | - | no Vietnamese subset | not measured |
  | Kalam | SIL OFL 1.1 | 3 weights | - | - | no Vietnamese subset | not measured |

  Rendered side by side with DejaVu Serif Italic: `design/WP5-UX5/font-candidates-synthetic.png`.
- **Recommendation:** Indie Flower (the most handwriting-like look, complete Latin and Vietnamese, the
  smallest file). Used only for the category cell; a cell whose text has a character the font lacks
  falls back to DejaVu Serif Italic for that cell (never "?").
- **ADR outline** (`docs/adr/0001-pdf-handwriting-font.md`, the first ADR; AGENTS names `docs/adr/`):
  - Context: owner answer F-9 b (2026-10-21) for the workbook look; the PDF already embeds DejaVu
    from an npm package; no web font in the UI (AGENTS UI section, CSP); fonts are never shipped for
    the wordmark (WP5-UX2-T06).
  - Decision: commit `assets/pdf-fonts/IndieFlower-Regular.ttf` with its `OFL.txt` and a README (source
    URL, version 2.000, SHA-256, size), embedded subset only by the PDF renderer for category cells;
    not served over HTTP and not used by the UI.
  - Consequences: +108 KB in the repository and the image; the OFL travels with the file (OFL 1.1
    allows bundling and embedding, no sale of the font alone); a version bump is a deliberate change with
    a new hash; the PDF bytes change, so the pilot samples are regenerated.
  - Alternatives: DejaVu Serif Italic (no new file); an npm font package (a new dependency, WOFF2 per
    Unicode range).
- **Gate effects:** `tests/client/wordmarkAsset.test.ts:82-94` ("no font file among the tracked
  files") changes to "exactly one tracked font file, at that path, with that SHA-256"; the
  `src/` checks (:61-80, no font file or `@font-face` under `src/`) stay. The Dockerfile runtime stage
  copies only `dist`, `node_modules` and `package.json` (lines 44-46), so it gains
  `COPY assets/pdf-fonts ./assets/pdf-fonts`; the container drill and `smoke` render one PDF. docs/03:14
  ("embedded Unicode fonts") gains the font list; docs/07/11 (image contents) if they list files.
- **Header, fields, table (mockup B11 after the owner's notes):** logo 32pt kept; wordmark box 17.6pt high
  (its letters read smaller than the 17.6pt title "C&D Semiconductor Services, Inc."); "Revision n" 9.6pt, submission id 8.4pt; fields
  indented 72pt (about two 0.5-inch tabs); table text: day name 10.4pt small capitals, date 10.4pt,
  category 14.4pt handwriting, times 9.6pt, OT 12pt; row heights 37/67/21/24pt (header, category, two
  time cells, OT), so each table is about 150pt (102pt in the first mockup; the current PDF's week block is
  144pt, `timesheetPdf.ts:171-172`). Vertical budget on US Letter (points,
  top 0): header 29-69, titles 86-126, fields 147-182, week 1 197-350, week 2 366-519, total 541,
  employee signature 573-618, manager 650-695, footer 742-756: 36pt bottom margin kept. A pure
  `pdfLayout({ timeRows, otRows })` (`layout.ts`) gives the free height of hidden rows to the category
  row; a unit test checks every variant ends above 756pt with four sessions a day and long labels.

#### U5-17, revised (B2 note)

Below 480px, once "Worked hours" and "Change several days" have wrapped, the "Open a day" row takes
the full width and the date field takes all free space (`flex: 1 1 auto`). From the measured parts
(label 76px, field minimum 127.5px, "Open day" 95.7px, "Open" about 60px, 8px gaps): row >= 315.2px:
label + field + "Open day"; 279.5-315.2px: label + field + "Open"; below 279.5px: field + "Open", the
label hidden (its text stays the field's accessible name). At 390 (row 358px) the full form shows. AC:
the field's right edge + 8 = the button's left edge and the button's right edge = the row's right edge
at 260, 300, 358; the three thresholds within 1px.

#### B5 "Notes" (checked in the code)

The Day editor's Notes field is the day's own note (`DayFieldsForm.tsx:193-194`, `day_entries.notes`,
`schemas.ts:92`), printed as "Note: ..." in the Review's Category cell (`SheetWeekTable.tsx:51-53`). It
does not belong to Partial leave, so it stays in the Day editor (mockup B5 shows it under the Partial
leave row).

#### D, mockup changes

`mockup.html` rebuilt (146,262 bytes) by `tools\build-mockup5.mjs` with `tools\round5-add1.css`;
`render5.json`: 0 scripts, 0 external references, 0 blocked requests, 0 console messages, no frame
overflow, only `example.invalid` addresses. All 11 renders regenerated and viewed:
- B1: "<" and ">" 20px from the range block (`--period-step-gap`, was 12px);
- B2: the 390 toolbar with the full-width date field and a strip of the three "Open a day" widths;
- B5: Notes kept in the drawer; the caption says why;
- B7, B9: Employee Signature + Date on one row, Manager Signature + Date on the next; the week header
  strip and the first column filled with `--sheet-head-strong` (the app's values);
- B9: the dialog says "your saved image and your name (without a saved image: your name only)";
- B10: editable To, Cc, Subject and body and live switches for each send; "Send another copy..." with
  the required-reason dialog;
- B11: smaller wordmark and Revision, fields indented, larger table text, taller tables, handwriting
  in the category cells (a system handwriting face stands in for Indie Flower; no font file in the
  mockup);
- new render `font-candidates-synthetic.png` (the three faces, synthetic text). 12 renders in total.

#### E, revised

| Slice | Content | Server/API/data/PDF | Risk | Depends |
|---|---|---|---|---|
| UX5-T01a | Sign-off without sending, signer from the account, optional image, `signoffs` rebuild, docs/05 Manual path, docs/06 AC-06 | server, data (migration part 1) | H | FIX3 freeze |
| UX5-T01b | Sends: `revision_sends`, PDF variants, `show_time_on_pdf`, send-draft/send/pdf routes, reason rule, deadline send and reminders (F-2 a), message from the send, docs/03, 05, 06, 10 | server, API, data (migration part 2), outbox | H | T01a |
| UX5-T02 | PDF layout, brand drawing, Indie Flower with fallback, ADR 0001, asset, Dockerfile line, wordmark test change | PDF, packaging | M-H | T01b |
| UX5-T03 | Review page with the Send card (editable envelope, switches, reason dialog), Settings switch "Time rows on the PDF", settings-file key | client | M-H | T01b |
| UX5-T04 | Breakpoints, top bar, period card (A unchanged; B1 gap) | client | M-H | T03 |
| UX5-T05 | Sheet, Day editor, controls (A unchanged; B2 Open-a-day rule) | client | M | T04 |
| UX5-T06 | docs/04, 12, pilot packet (EN+VI) with new samples | docs | L | T01a-T05 |

- The two migration parts ship as one `0014` written in T01a and extended in T01b only if T01a is not
  yet frozen; otherwise T01b adds `0015`. Owned paths as in E above, plus
  `db/migrations/0014_*` (`0015_*`), `services/deliveries.ts`, `jobs/sendJob.ts`, `jobs/pdfJob.ts`,
  `mail/message.ts`, `routes/shares.ts` (PDF query rule), `assets/pdf-fonts/`, `Dockerfile`,
  `docs/adr/0001-*.md`, `tests/client/wordmarkAsset.test.ts`, `SettingsScreen`/`SubmissionSettingsForm.tsx`,
  `settingsFileModel.ts`.
- GOV paths: none (AGENTS unchanged: F-1 a, F-6 a). `docs/adr/` is new but not a governance path.
- Gate additions: migration up from a v13 database with signed, automatic, corrected and sent
  revisions (rows copied, variants derived); restore drill of a backup holding PDF variants; send
  idempotency and reason races (two concurrent sends); every PDF variant one page; font fallback; the
  container drill renders a PDF with the asset.
- Audit area B gains: migration correctness, the reason rule and its counting, per-send privacy, the
  shared PDF route, the font licence file and hash.
- Estimate: 7 slices + 7 freezes + 1 gate + 3 audits = 18, plus one fix round (about 6): 24-28 dispatches.
- New owner question: none. No answer contradicts another decision or AGENTS; the choices made here
  (reason not in the email, a failed first send needs no reason, the reason asked also for an
  uncertain-attempt resend, the font file committed as an asset) are reversible planner defaults.
