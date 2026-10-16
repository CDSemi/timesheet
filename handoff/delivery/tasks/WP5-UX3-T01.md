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
- Base: HEAD = origin/main = the GOV accept commit (WP5-UX3-GOV-ACCEPT, handoff only, after
  79b9a53c13b1542877a587dd0ca00fe295d1f8b6), or a later commit that changes only `handoff/`. Source digest
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
