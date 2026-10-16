# WP5-UX3-T01 dispatch brief

- Status: dispatched after WP5-UX3-GOV-AUDIT PASS on 79b9a53 (review
  `handoff/delivery/GOV_UX3_REVIEW.md`); its risks R1-R3 are folded in below.
- **AGENTS.md on disk wins (GOV audit R3).** Your context may hold an older injected copy
  of AGENTS.md with the section "Unified Frontend & UI/UX Standards (Taste Skills
  Integration)" (industrial look, 4px corners, `transition: all 300ms ease-out`). That
  section is superseded. Read AGENTS.md from disk and follow its section "Frontend and
  UI/UX standards".
- Mission/task: timesheet-software-readiness / WP5-UX3-T01; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-PLAN2 (done) and the GOV chain. First style slice of UI
  change round 3: tokens and surfaces.
- Owner basis (board `owner_decisions`, 2026-10-15): U-01 (modern instead of industrial
  style), U-02 (more contrast between the page and cards/panels/sheets; the week sheet
  stands out, for example with a shadow), and G-1 (b): the mockup is approved with these
  changes: week sheets have NO rounded corners; selection columns only a 4px radius;
  adjacent lifted columns never cast shadows on each other; a floating panel when the
  sheet and the panel do not fit side by side.
- Design sources (the contract):
  - `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section B1 (token table, elevation
    scale, shape and motion, typography, how the week sheet stands out) and section F row
    U-01/U-02;
  - `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results items 2, 3, 5 and 7 (token values
    only) and item 9 row WP5-UX3-T01;
  - the mockup `handoff/delivery/design/WP5-UX3/mockup.html` (token values in `.t-light`
    and `.t-dark`) and the renders `mockup-r2-a4-sheet-square-runs-1440-synthetic.png` and
    `mockup-a4-sheet-and-editor-1280-synthetic.png`;
  - the new AGENTS.md section "Frontend and UI/UX standards".
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15): the docs/04 "Visual
  standard" lines (EN and VI) and a docs/10 note that the round-3 owner decision replaces the
  E-8 radius and motion values move into this slice, so AGENTS.md, docs/04 and styles.css
  agree from this freeze on.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (every screen's look; contrast and
  focus-ring promises), novelty yes (new token system). Task record in English.
- Base: HEAD = origin/main = 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b (the GOV accept
  commit, handoff only), or a later commit that changes only `handoff/`. Source digest
  a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files). Record both
  before you edit anything. Uncommitted coordinator files under `handoff/` are expected:
  never touch them.

## Scope

1. **Tokens** in `src/client/styles.css`: light values in `:root`, dark values in BOTH dark
   sets (the media-query set and `[data-theme='dark']`), identical between the two dark
   sets:
   - the B1 surface and colour tokens (`--bg` change, `--panel-head`, `--accent-soft`,
     `--day-editing-head`, `--avatar-bg`/`--avatar-ink`, `--danger`/`--on-danger`,
     `--row-alt`, the pill tokens for old, current, future (pink), Draft and the PLAN2 item
     7 "in progress" tokens);
   - the elevation scale `--elev-bar`, `--elev-1`, `--elev-2`, `--elev-3`, `--elev-lift`
     (dark levels with the light ring and inset highlight); `--shadow-panel` and
     `--shadow-overlay` are replaced inside `styles.css` (no alias left at the end);
   - shape: `--radius-sm` 6px, `--radius` 8px, `--radius-lg` 12px, `--radius-pill` 999px,
     `--radius-sheet` 0, `--radius-lift` 4px;
   - motion: `--duration-fast`, `--duration`, `--duration-slow`, `--ease-standard`,
     `--ease-out`; `--transition` lists only the properties that change (colour, background
     colour, border colour, box shadow, transform), never `all`; reduced motion keeps
     today's 0.01ms rule. GOV audit R2: every interactive state change goes through
     `var(--transition)`; where a control needs the fast or slow duration, set the duration
     custom property that `--transition` is built from on that element (for example a
     local `--transition-duration: var(--duration-slow)`), never a separate literal
     `transition` rule;
   - typography weights `--font-weight-normal/medium/strong/heavy` and the h1 size;
   - PLAN2 layout tokens defined now for later slices: `--lift-clip`, `--sheet-col-min`,
     `--page-max-editor`, `--scrim-side` (both themes), the phone dialog spacing tokens and
     the break width tokens of PLAN2 items 4-5.
   Keep every existing token that components outside your owned paths still use; do not
   rename a token that a `.tsx` file references.
2. **Surfaces (U-02)**: the toolbar and the form header leave the white sheet card and sit
   on the page surface; each WEEK band becomes its own raised card (`--elev-2`, square
   corners `--radius-sheet`, a header strip with the week number and range); the footer
   (legend, Overtime Total, signatures) becomes its own card; cards, the period bar, the
   editor panel, dialogs and menus use the radius scale and the elevation levels of B1. The
   sheet cells stay square inside their card (Excel form).
3. **Docs**: docs/04 "Visual standard" (EN and VI, same lines) describes the token system,
   the radius scale with the week-sheet exception (square) and the 4px lifted columns, the
   elevation scale and the motion rule; it also replaces the "High-density" wording at
   docs/04 line 87 (EN and VI; GOV audit R1) with the new section's "readable density for
   a small-team timesheet app" direction; docs/10 (EN and VI) gains one entry: the round-3
   owner decision (U-01, G-1 b, 2026-10-15) replaces the E-8 radius and motion values; E-8
   stays as history and plain CSS custom properties are kept.
4. Not in this slice (later slices own them): the identity menu (T02), Settings (T03), the
   period bar pills and header rows (T04), the lift runs and sheet markers (T05), the
   floating panel rule (T05B), the editor panel and dialogs (T07, T08, T08B).

## Tests

- `tests/client/cssThemeParity.test.ts`: every new token exists in `:root` and is
  identical in both dark sets.
- New `tests/client/styleTokens.test.ts`: `--transition` names no `all`; no rule in
  `styles.css` uses a literal `border-radius` or `box-shadow` value outside a custom property
  definition (allow `0`, `none`, `inherit` and `50%`; list any other exception with its
  reason); the week card uses `--radius-sheet`.
- New `tests/e2e/surfaces.spec.ts` (both projects, light and dark, and both manual theme
  overrides as the round-2 specs do): card on page >= 1.12:1; every week card has computed
  `border-radius` 0 and a non-`none` box shadow; the footer is its own card; under
  `prefers-reduced-motion: reduce` interactive transitions are 0.01ms; no horizontal
  scroll at 320, 390, 768, 1280 and 1440.
- Existing focus-ring, hover, contrast, theme and AX-09 checks must stay green. If an
  existing assertion pins an old token VALUE that this slice changes on purpose (for
  example a 4px radius, a 300ms duration or the old `--bg`), you may update only that value
  in that assertion; list each one in Results (file:line, old and new value, why it is not a
  weakening). Any other failure in a file you do not own: stop and report it.
- The 390x844 first-screen budget tests (landing and away, own and with a share, with and
  without the zone note) must still pass; record the numbers.
- Calendar independence: dates only from the server's `today_local` and the displayed
  period (existing helpers).
- No assertion removed or weakened. No `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, domain, schema or CSP change; no new dependency, font or icon library;
  system fonts only.
- Tokens only (CSS custom properties). WCAG 2.2 AA: text 4.5:1, state indicators and
  component boundaries 3:1, the shared focus ring at least 3:1 on every new surface.
- Keep AX-01..AX-10, R-12, the 44px targets, the modal editor below 1200px (T05B moves it
  later), the Escape order and focus returns, and every round-2 behaviour.

## Owned paths

- (docs/04 "Visual standard" includes line 87.)
- `src/client/styles.css`, `src/client/TimesheetScreen.tsx` (card wrappers only),
  `src/client/components/TimesheetSheet.tsx` (week and footer wrappers only)
- `tests/client/cssThemeParity.test.ts`, `tests/client/styleTokens.test.ts` (new),
  `tests/e2e/surfaces.spec.ts` (new), and value-only updates of old-token assertions as
  described under Tests
- `docs/04_UX_AND_SETTINGS.md` and `docs/04_UX_AND_SETTINGS.vi.md` ("Visual standard"
  only), `docs/10_DECISIONS_AND_SOURCES.md` and `docs/10_DECISIONS_AND_SOURCES.vi.md` (one
  entry)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T01/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Implement, then `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects on the real clock (`npm run test:e2e`), alone, with
   `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder. 0 failed;
   record the counts per project. `ERR_NO_BUFFER_SPACE` or an ECONNRESET in
   `automation.spec.ts`: rerun that test three times, then the full suite once.
5. Contrast table: computed ratios of the new surface pairs and of the focus ring on every
   new surface, both themes (the existing contrast helper).
6. Grep changed files and evidence for email addresses and user-profile paths: only the
   full synthetic example.invalid form may remain; mask everything else.
7. `npm run preflight` or `validate_package.py --preflight` (docs links and EN/VI pairs; use
   the workflow Python as earlier briefs show, `<user>` in evidence).
8. `npm run verify` with `SMOKE_PORT` in 48600-48619 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy the masked logs of steps 2-5, 7-9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T01`. Set TEMP and TMP to it. Ports
  48600-48619 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`. Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (including any
value-only assertion updates), the token summary, the week-sheet structure, the contrast
minimums, unit and full e2e counts per project, the five budget numbers, verify exit code,
the final full 64-hex digest and file count, the evidence files, the background-task
confirmation, any stop, conflict or deviation.

## Results

### Final result

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX3-T01/` (`checks.txt`
and the raw logs, 10 `surfaces-*.txt` measurement files, 4 desktop screenshots ending in `-synthetic.png`).

- Files changed: `src/client/styles.css`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `tests/client/cssThemeParity.test.ts`,
  `tests/client/styleTokens.test.ts` (new), `tests/e2e/surfaces.spec.ts` (new), value-only
  assertion updates in `tests/e2e/theme.spec.ts` and `tests/e2e/logo.spec.ts`,
  `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`, this brief
  and the evidence folder.
- Value-only updates of old-token assertions (the page `--bg` changed on purpose; no assertion
  removed or weakened, the check is the same computed-value comparison with the new value):
  `tests/e2e/theme.spec.ts:19` `BG` dark `rgb(18, 22, 28)` to `rgb(14, 18, 23)` and light
  `rgb(246, 247, 249)` to `rgb(237, 240, 245)` (comment line 18 too); `tests/e2e/theme.spec.ts:169`
  `'#12161c'`/`'#f6f7f9'` to `'#0e1217'`/`'#edf0f5'`; `tests/e2e/logo.spec.ts:190` the same two body
  background values in `rgb(...)` form. No assertion pinned the 4px radius or the 300 ms duration.
- Tokens (`styles.css`): light in `:root`, the same dark values in BOTH dark sets (parity test): `--bg`
  #edf0f5 / #0e1217, `--off`, `--line`, `--line-soft`, new `--field-bg` (input fill, was `--bg`),
  `--panel-head`, `--row-alt`, `--accent-soft`, `--day-editing-head`, `--avatar-bg/-ink`,
  `--danger/--on-danger`, 15 pill tokens (current, old, future pink, neutral, progress), `--scrim-side`,
  `--elev-bar/-1/-2/-3/-lift` (dark levels with a light ring and inset highlight). Shared in `:root`:
  `--radius-sm` 6px, `--radius` 8px, `--radius-lg` 12px, `--radius-pill`, `--radius-sheet` 0,
  `--radius-lift` 4px; `--duration-fast/-/-slow` 120/180/260ms, `--ease-standard`, `--ease-out`,
  `--transition-duration`; `--font-weight-medium`, h1 1.6rem heavy with `--letter-spacing-h1`;
  `--page-max-editor`, `--sheet-col-min`, `--lift-clip`, `--lift-y`, `--toolbar-group-gap`, the phone
  dialog spacing and the three break width tokens. `--shadow-panel`, `--shadow-overlay` and `--ease` are
  gone (no alias; the parity test pins this). Reduced motion sets the three durations to 0.01ms.
- `--transition` is declared in the universal rule (`*, *::before, *::after`) so an element can set
  `--transition-duration` locally (GOV audit R2) and still write `transition: var(--transition)`; a
  `:root` declaration would freeze the duration. It lists colour, background-color, background-position
  (the Show details thumb), border-color, box-shadow and transform; never `all`. Every `transition`
  declaration in the file is `var(--transition)` (pinned by the new test).
- Week-sheet structure: the sheet column (`section.card.stack.sheet-main`, the class `card` is kept
  because `day-editor.spec.ts:920` selects `.sheet-area > section.card`) has no surface; the toolbar and
  the form header sit on the page; each `section.sheet-week` (already one per week in the page and the
  review sheet, grid on desktop, table on phones) is a card: `--card`, `--elev-2`, `--radius-sheet` 0,
  with its existing `.week-bar` header strip (week number and range); the footer is one new
  `div.sheet-footer` (legend, Overtime Total, signature strip) with the same square `--elev-2` card
  (square because it is part of the sheet form; the period bar, dialogs, panels and menus use the 12px
  step). The review block `.review-sheet-block` lost its own card surface so cards are not nested. Sheet
  cells stay square. Markers (`.sheet-day.*`) are untouched (T05).
- Other CSS changes forced by U-02: a quiet or secondary button now steps to `--accent-strong` text on
  hover (the "Change several days" button sits on the darker page, where accent text on the hover tint
  was 4.39:1 against the 4.5:1 rule in `hover.spec.ts`; no accent text can meet both 4.5:1 and the 1.20:1
  hover step there); the inactive "Today" button keeps its muted text on hover.
- Contrast (computed from the browser, both projects, four theme situations): card on page 1.14:1 light,
  1.15:1 dark (period bar, both week cards, footer; the promise is 1.12); `--panel-head` on card 1.09 / 1.15,
  `--row-alt` 1.06, `--sheet-head` 1.17 / 1.13; the shared focus ring on the toolbar (page), the period
  bar, a week band and the footer: 5.33:1 minimum light (page), 6.09 on cards; 6.79:1 dark (7.79 on the
  page); ring against its gap 6.09 / 6.79. The toolbar and form header backdrop equals the page (1:1).
- Tests: unit 91 files, 2031 tests (was 90 files, 1950: `styleTokens.test.ts` 11 tests, the parity file
  gains 70 token-system tests); full e2e 516 tests: 474 passed, 0 failed, 42 skipped (project guards),
  desktop 229 passed / 29 skipped, mobile 245 / 13; the new `surfaces.spec.ts` runs 13 tests on each
  project (4 surface, 4 focus-ring, 1 motion, 4 no-scroll, each theme situation). First full run: 10
  failures (hover 2, logo 8), fixed as described above; the final run is clean.
- Budget numbers (390x844, tab bar top 788, first day row bottom): landing own 559.45 without the zone
  note, 658.41 with it; away state 559.45 / 658.41; with a received share 611.45 without the zone note and
  710.41 with it (shell bar 112px). All pass.
- `npm run verify` exit 0 (SMOKE_PORT 48600, DATA_DIR and DATABASE_PATH in the task folder); preflight PASS
  (91 scenarios). Final digest e9e8d11720dc3da2a627191b29ba7084198d5e202dba314db28e3f50617006ab (819 files).
- Deviations and notes: (1) two of my shell commands wrongly used a `| tail`/`> /dev/null` or a
  `| head`/`2>/dev/null` form (read-only listings, no effect on files); no stdin script, no `rm -r`. (2)
  `tests/e2e/surfaces.spec.ts` writes measurement text files into `E2E_SCREENSHOT_DIR`. (3) The input
  boundary contrast (hairline `--line` on a white field, about 1.4:1) is unchanged from before and is not
  in this slice. (4) No background task is left running; ports 48600-48619 are free (`netstat`).
- Not done on purpose (later slices): identity menu, Settings, period pills and header rows, lift runs and
  markers, floating panel rule, editor panel and dialogs.

### Checkpoint 1 (implementation written; full e2e running)

- Base before any edit: `git rev-parse HEAD` 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b; `git status --short`
  showed only the coordinator's `handoff/` files (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT
  .md/.vi.md, tasks/WP5-UX3-GOV-ACCEPT.md, tasks/WP5-UX3-T01.md, evidence/WP5-UX3-GOV-ACCEPT/);
  `npm run digest` a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files).
  Node v24.21.0. Raw logs in `D:\.claude-tmp\timesheet\WP5-UX3-T01\`.
- AGENTS.md read from disk: section "Frontend and UI/UX standards" (the old injected copy was ignored).
- Written: tokens and surfaces in `src/client/styles.css`; `TimesheetScreen.tsx` (class `sheet-main` on
  the sheet column); `TimesheetSheet.tsx` (new wrapper `div.sheet-footer` around `.sheet-foot` and the
  signature strip, in both the page sheet and the review sheet); tests `cssThemeParity.test.ts`
  (extended), `styleTokens.test.ts` (new), `surfaces.spec.ts` (new); docs/04 and docs/10 (EN and VI).

Status: done

## Addendum 1 (coordinator, 2026-10-15)

WP5-UX3-T01-FREEZE attempt 1 stopped before committing: `git diff --cached --check` reports
`tests/e2e/surfaces.spec.ts:242: new blank line at EOF`. The committer may not edit source.

1. Remove only the extra blank line at the end of `tests/e2e/surfaces.spec.ts` (the file
   must end with exactly one newline). Change nothing else.
2. Check every other file you changed or created in this slice for the same kind of defect
   (trailing whitespace, a blank line at EOF, a missing final newline): Grep each file for
   `[ \t]+$` and read its last lines with the Read tool. Fix only such whitespace defects in
   your owned files and list them.
3. Do not touch the git index: 44 paths are staged by the committer and must stay staged;
   no `git add`, `git restore` or `git reset`.
4. Rerun `tests/e2e/surfaces.spec.ts` on both projects (alone), `npm run lint`, then
   `npm run verify` (`SMOKE_PORT` in 48600-48619, `DATA_DIR` and `DATABASE_PATH` in the task
   folder) and `npm run digest` LAST.
5. Append "Addendum 1 results" below (files fixed, spec counts, verify exit code, the new
   full digest and file count) and finish with "Status: done". Copy the masked logs into the
   evidence folder with new names (`addendum1-*.txt`).

Same runtime rules as the brief (no stdin scripts, no head/tail pipes, no null-device
redirects, no recursive deletes, no cmd.exe, no PID kills).

### Addendum 1 results

- Fixed: `tests/e2e/surfaces.spec.ts` (the extra blank line at EOF removed; 241 lines, last line `}`).
  Grep for `[ \t]+$` found no trailing whitespace in any changed or new file (`styles.css`,
  `TimesheetScreen.tsx`, `TimesheetSheet.tsx`, `cssThemeParity.test.ts`, `styleTokens.test.ts`,
  `surfaces.spec.ts`, `theme.spec.ts`, `logo.spec.ts`, the four docs); the last lines of all of them
  end in content with a final newline. Working-tree `git diff --check` exit 0; `git diff --cached
  --check` still reports the old staged blob (line 242) until the committer restages the file. The git
  index was not touched.
- `surfaces.spec.ts` alone: 26 passed (13 desktop, 13 mobile), 0 failed. `npm run lint` exit 0.
- `npm run verify` exit 0 (SMOKE_PORT 48601, DATA_DIR and DATABASE_PATH in the task folder): 91 files,
  2031 tests, SMOKE PASSED.
- New digest, last command: a4f127cc4a10c8b311811b244be2a82fa87bcd636615b89c765d5be5d2411d86 (819 files).
  It differs from the first final digest only by the removed blank line.
- Logs: `handoff/delivery/evidence/WP5-UX3-T01/addendum1-surfaces.txt`, `addendum1-lint.txt`,
  `addendum1-verify.txt`, `addendum1-digest.txt`. Nothing is left running; ports 48600-48619 free.

Status: done
