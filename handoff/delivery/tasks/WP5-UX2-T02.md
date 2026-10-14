# WP5-UX2-T02 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T02; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T01-FREEZE (done). Second slice of UI change round 2
  (board `owner_decisions` and `coordinator_decisions`, 2026-10-14).
- Scope: three owner items, as designed in `handoff/delivery/tasks/WP5-UX2-PLAN.md`:
  - item 4: a clearly visible hover on toggle-type controls, plus the pressed system.
    Plan A4, B "Shared decisions", B4.
  - item 6: "Show details" becomes a slide switch. Plan A6, B6.
  - item 2: a lighter label-picker selection that is still obvious. Plan A2, B2.
  - Also follow section E (the parts for these items, including the six existing
    assertions that change) and the mockup `handoff/delivery/design/WP5-UX2/mockup.html`
    (artboard 2, controls).
- Coordinator decision: the new hover fill applies app-wide to secondary and quiet
  buttons, navigation links and tabs (colours only, no layout change).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (WCAG 2.2 AA states closed by
  earlier audits), novelty no. Task record in English.
- Base: HEAD = origin/main = af6207c281badc27192d1d420de8ace5a73c8296, or a later commit
  that changes only `handoff/`. Source digest
  44f5b6ccb1569f11d0a966a54ecfbd90d151f2e7b8a958ccdbd8ce03108b5c07 (802 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only, 4px
  radius, shared transition token).
- The plan sections named above; the T01 record `handoff/delivery/tasks/WP5-UX2-T01.md`
  (how the theme sets are organised: every new dark token goes into BOTH dark sets, and
  `tests/client/cssThemeParity.test.ts` guards that).
- `src/client/styles.css`, `src/client/TimesheetScreen.tsx` (the Show details control),
  `src/client/components/SheetWeekTable.tsx` (LabelPicker),
  `src/client/components/SharingItemsFields.tsx` (the existing `role="switch"` pattern;
  read-only), `src/client/components/ThemeToggle.tsx` (read-only).
- Tests: `tests/e2e/focus-ring.spec.ts`, `tests/e2e/contrast.ts`,
  `tests/e2e/timesheet.spec.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/day-editor.spec.ts`.

## Implement

1. **Tokens.** Add `--hover-fill` (light `rgb(31 95 191 / 0.14)`, dark
   `rgb(110 168 255 / 0.20)`, in `:root` and in both dark sets), `--rail` and the switch
   tokens (`--switch-width`, `--switch-height`, `--switch-thumb`, `--switch-inset`) per
   plan B.
2. **Hover and pressed (B4).**
   - Quiet and secondary buttons, not pressed: hover = `--hover-fill` background plus an
     accent border.
   - Pressed toggles: rest = solid `--accent` with `--on-accent` text; hover =
     `--accent-strong`. Write the rules so that hover can never erase the pressed look
     (the specificity defect in plan A4).
   - Delete the AX-04 special case only if the shared focus ring stays at least 3:1 on
     the accent fill in both themes and with both manual overrides; prove it with a
     test.
   - Navigation links and phone tabs: hover = `--hover-fill`. The current item keeps
     its look and its 2px rule.
   - All hover rules inside `@media (hover: hover)`.
   - Day-column hover stays as it is.
   - The T01 theme toggle must follow the same pressed system (no separate look).
3. **Show details switch (B6).**
   - A native `<input type="checkbox" role="switch">` inside `label.inline.switch`, with
     the visible text "Show details". It may live in a new
     `src/client/components/ShowDetailsSwitch.tsx`.
   - Track 44x24, thumb 18px, 3px inset, 4px radius, `appearance: none`. The thumb is
     positioned with `background-position` (no pseudo-element).
   - States off, on, hover, focus-visible, active and disabled, as in B6. Not persisted
     (as today).
   - Measure the phone row `.tools-right` at 390, 375, 360 and 320. Let it wrap below
     400px only if it must. No horizontal scroll.
4. **Label picker (B2).**
   - The open trigger line becomes 1px (`--hairline`), plus a caret turn.
   - The active option (`aria-activedescendant`, also under the pointer) gets
     `--hover-fill` plus a leading `--rail` accent rail; no frame.
   - The current value (`aria-selected="true"`) gets accent text, weight 600 and a check
     shape, so it is not shown by colour alone.
   - The list keeps its `:focus-visible` ring.
   - Class names `.label-option.active` and `[aria-selected]` stay.
   - Keyboard behaviour is unchanged. Options stay 44px on the phone.

## Tests

- `tests/e2e/hover.spec.ts` (new, desktop project; both themes and both manual
  overrides):
  - for each control class of B4, the hover background flattened over its surface differs
    from rest by at least 1.20:1, and controls with a boundary show an accent boundary of
    at least 3:1;
  - hover and pressed differ by at least 3:1;
  - a pressed toggle keeps its pressed look while hovered;
  - on the mobile project no sticky hover remains after a tap.
- The six existing assertions listed in plan section E change only as described there,
  keeping the same facts:
  - `timesheet.spec.ts:291-295`: `getByRole('switch')` and `toBeChecked`;
  - `shell.spec.ts:81`: `check()`;
  - `day-editor.spec.ts:1036`;
  - `focus-ring.spec.ts:287` (R-12);
  - `focus-ring.spec.ts:298-317` (AX-04: keep "Change several days", add "Dark mode", own
    switch ring tests in both states);
  - `focus-ring.spec.ts:238-240` (AX-02: the rail colour is at least 3:1 against the
    option fill and the card, and the rail is at least 2px wide; the list-ring assertion
    stays).
  - In Results, show for each why it is not a weakening.
- New checks for the switch:
  - role switch, off at load;
  - Space and click toggle it;
  - 0 detail rows off and 14 on;
  - the visible label text;
  - a 44px label on the phone;
  - contrast of 3:1 or more for every state in both themes.
- New checks for the picker:
  - no 3px frame on the active option;
  - the rail is present;
  - the check shape and `aria-selected` on the current value;
  - a 1px open trigger line.
- Contrast checks use `tests/e2e/contrast.ts`; extend it additively.
- Calendar independence: no new check may depend on the date or time of day; use the
  existing server-derived seed helpers.
- No assertion removed or weakened beyond the listed role changes. No `skip`, `fixme` or
  `.only`.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change.
- Not owned: `src/client/api.ts`, `tests/e2e/fixtures.ts`, every docs file, and every file
  not listed under "Owned paths".
- Tokens only (CSS custom properties) for colours, rings, radius, shadows, durations and
  sizes. Use the shared transition token and respect `prefers-reduced-motion`.
- Keep every behaviour that earlier audits verified:
  - AX-01..AX-10 and R-12;
  - B-01 and B6-01: the phone first-screen budget at 390x844 in all four states, with the
    first day row above the tab bar at 788;
  - 44px targets on the phone;
  - the modal editor below 1200px, the Escape order and the focus returns;
  - AC-16;
  - the T01 theme behaviour and its tests.

## Owned paths

- `src/client/styles.css`
- `src/client/TimesheetScreen.tsx` (the Show details control only)
- `src/client/components/ShowDetailsSwitch.tsx` (new)
- `src/client/components/SheetWeekTable.tsx` (LabelPicker only)
- `tests/e2e/hover.spec.ts` (new), `tests/e2e/contrast.ts`,
  `tests/e2e/focus-ring.spec.ts`, `tests/e2e/timesheet.spec.ts`,
  `tests/e2e/shell.spec.ts`, `tests/e2e/day-editor.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T02/`: masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png` (show hover, pressed, the switch
  and the picker in both themes)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test` (the parity
   test must pass).
4. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once.
5. On the mobile project, measure:
   - the first-screen budget at 390x844 in the four states;
   - the tools row at 390, 375, 360 and 320;
   - that there is no horizontal scroll (`document.documentElement.clientWidth` against
     `scrollWidth`).
6. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
7. Run `npm run verify` with `SMOKE_PORT` in 48530-48549, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
8. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
9. Copy the masked logs of steps 2-5, 7 and 8 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul`.** Redirect to a file in the task folder and
  read it with the Read tool. Use the Write and Edit tools for files (no sed, no
  heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T02`. Set TEMP and TMP to it. Use ports
  48530-48549 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID. Never remove anything recursively.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the hover, pressed, switch and picker contrast numbers (light, dark);
- whether the AX-04 special case was removed;
- the six assertion changes, each with one line;
- the unit and full e2e counts per project;
- the budget numbers (four states) and the tools-row fit;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

### Progress note 1 (before the full e2e run)

- Base (before any edit): `git rev-parse HEAD` = af6207c281badc27192d1d420de8ace5a73c8296; `node --version` = v24.21.0;
  `git status --short` = modified `handoff/delivery/ORCHESTRATION.json` and `tasks/WP5-UX2-T01-FREEZE.md`, untracked
  `handoff/delivery/evidence/WP5-UX2-T01-FREEZE/` and `tasks/WP5-UX2-T02.md` (all coordinator records, untouched). Digest before:
  44f5b6ccb1569f11d0a966a54ecfbd90d151f2e7b8a958ccdbd8ce03108b5c07 (802 files).
- Implemented: tokens (`--hover-fill`, `--rail`, `--switch-*`, `--check-*`), the shared pressed and hover system, the
  `ShowDetailsSwitch` component, the picker rules, tests. Focused runs: typecheck, lint exit 0; `npm test` exit 0; e2e of
  hover, focus-ring, shell, timesheet and day-editor specs: 153 passed, 31 skipped (project-specific), 0 failed.
- One mutation check: dropping the pressed-hover rule made 4 pressed-hover tests fail (background became the tint); reverted.

### Final Results

Files changed (all inside the owned paths; nothing under `src/server`, `src/domain`, `api.ts`, `fixtures.ts`, docs, `theme.spec.ts`):
- Source: `src/client/styles.css`, `src/client/TimesheetScreen.tsx` (the Show details control only),
  `src/client/components/ShowDetailsSwitch.tsx` (new). The LabelPicker needed no TSX change: the rail, the check and the caret
  turn are CSS only (`.label-option.active`, `[aria-selected]`, `.label-picker.open .label-caret`).
- Tests: `tests/e2e/hover.spec.ts` (new), `tests/e2e/contrast.ts` (additive: `Layer.offsetX`, `StyleProperty`,
  `flattenedBackground`, `imageColour`), `tests/e2e/focus-ring.spec.ts`, `timesheet.spec.ts`, `shell.spec.ts`, `day-editor.spec.ts`.
- Evidence: `handoff/delivery/evidence/WP5-UX2-T02/` (11 masked LF `.txt`, 6 `-synthetic.png`).

What was built:
- Tokens: `--hover-fill` (light `rgb(31 95 191 / 0.14)`, dark `rgb(110 168 255 / 0.20)`, in `:root` and in BOTH dark sets; the
  parity test passes), `--rail` (3px), `--switch-width/height/thumb/inset` and a derived `--switch-travel`, `--check-width/height`.
- Pressed and hover system: `button.quiet|secondary[aria-pressed='true']` is a solid `--accent` with `--on-accent` and sets no
  box-shadow; its hover is `--accent-strong`. Not-pressed quiet and secondary buttons hover to `--hover-fill` plus an accent border.
  Every hover rule excludes a pressed button, and the pressed hover rule (0,4,1) outranks the others. Navigation links, phone tabs
  (not the current one), the More-panel entries and the switch use the same token. The Dark mode toggle lost its own pressed
  rules and follows the shared system. A focused control keeps its ring under the pointer (`:focus-visible:hover` rules).
  Day-column hover is untouched.
- Hover media: the previously global `button:hover` (primary) and all the hover rules above sit in `@media (hover: hover)`, so a tap
  leaves no hover look. This was needed beyond the plan: a hover-gated quiet rule alone would let the global primary hover paint a
  tapped quiet button solid on a phone.
- AX-04 special case (`.tools button[aria-pressed='true']` rest and focus rules): REMOVED. Proof: the shared ring (1px card gap,
  2px accent) on the pressed accent fill measures ring against surface 6.09 / 6.79, ring against gap 6.09 / 6.79 and gap against
  fill 6.09 / 6.79 (light / dark), in all four theme situations (light, dark, manual dark on a light device, manual light on a dark
  device), also under the pointer (gap against fill 8.01 / 8.33 at hover). Tests: `hover.spec.ts` (ring on the pressed fill) and
  the AX-04 test of `focus-ring.spec.ts`.
- Switch: `ShowDetailsSwitch` is `label.inline.switch` around a native `input type=checkbox role=switch`, text "Show details",
  `appearance: none`, track 44x24, 4px radius, 18px thumb drawn as a gradient layer with `background-position` (3px inset; travel
  derived), no pseudo-element. States off, on, hover, focus-visible, active (1px press offset), disabled (`--opacity-disabled`).
  Not persisted.
- Picker: the open trigger line is 1px (`--hairline`) with a 180 degree caret turn (keyboard focus on the trigger keeps its 2px
  indicator); the active option (keyboard cursor or pointer) is `--hover-fill` plus a leading `--rail` rail and no frame; the
  current value has accent text, weight 600 and a check (`::after`); the list keeps its `:focus-visible` ring; class names,
  keyboard behaviour and the 44px options on the phone are unchanged.

Numbers (light / dark; every one read from computed styles in the browser, formula in `tests/e2e/contrast.ts`):
- Hover fill against rest, flattened over the card: 1.23 / 1.45 (needs 1.20) for the quiet button, the secondary button
  (Next period, Sign out), the navigation link, the phone tab, the switch track and the label option under the pointer.
  Accent boundary on hover against the surface: 6.09 / 6.79 (needs 3). Text on the fill: 4.96 / 4.68 (buttons), 12.72 / 9.28 (links).
- Pressed against the unpressed hover fill: 4.96 / 4.68; pressed-and-hovered against it: 6.52 / 5.75 (needs 3); pressed fill against
  its surface 6.09 / 6.79; pressed text 7.76 (dark) and 6.09 (light) against the fill (at least 4.5, asserted).
  A pressed toggle under the pointer is `--accent-strong` with `--on-accent` text and boundary (asserted by colour).
- Switch (boundary against the surface / thumb against the track): off 5.83 / 5.83 light, 6.56 / 6.56 dark; off hover 6.09 / 4.75
  light, 6.79 / 4.53 dark; on 6.09 / 6.09 light, 6.79 / 7.76 dark; on hover 8.01 / 8.01 light, 8.33 / 9.53 dark. The thumb
  moved from 3px to 21px. Disabled is dimmed (0.6) with the not-allowed cursor. Focus ring: 6.09 / 6.79 in both states, gap against
  the accent track 6.09 / 6.79.
- Picker: open trigger line 1px accent (against the surface at least 3, asserted); rail 3px against the option fill 4.96 / 4.68 and
  against the card 6.09 / 6.79; check shape against the card 6.09 / 6.79; active option text at least 4.5; list ring 6.09 / 6.79.

The six existing assertions (why each is not a weakening):
1. `timesheet.spec.ts:291-295`: `getByRole('button')` plus `aria-pressed` became `getByRole('switch')` plus `not.toBeChecked`
   and `toBeChecked`. Same facts: off at load, no detail rows, on gives 14 rows and 8:00; the role is now the stricter native one.
2. `shell.spec.ts:162` (the brief's `:81`, the line moved after T01): `click()` became `check()` on the switch; the 8:00 fact is
   unchanged and `check()` also asserts the resulting state.
3. `day-editor.spec.ts:1036`: focus moves to the switch by role; the Escape-closes-editor and focus-returns facts are unchanged.
4. `focus-ring.spec.ts:287` (R-12): same focus target by role switch; the Shift+Tab-to-the-date-field ring fact is unchanged.
5. `focus-ring.spec.ts` AX-04: the loop keeps "Change several days", adds "Dark mode" (opened from More on a phone) and now also asserts
   ring against gap and gap against the accent fill at least 3:1 (stricter); "Show details" has its own focus-ring test in both
   states, with the same ring checks.
6. `focus-ring.spec.ts` AX-02: `expectInsetRing` (needs a framing inset layer) became `expectRail`: no framing inset layer, a leading
   inset rail of at least 2px, rail against the option fill and against the card at least 3:1; the list-ring assertion is unchanged.

Checks (actual results; logs in the evidence folder):
- `node --version` v24.21.0. Base HEAD af6207c281badc27192d1d420de8ace5a73c8296, digest before 44f5b6cc...b5c07 (802 files).
- `npm run typecheck`, `npm run lint` (no deprecation line): exit 0. `npm test`: 85 files, 1848 tests passed (the parity test passes).
- Full e2e (`npm run test:e2e`, run alone, screenshots and output in the task folder). Final run: 345 passed, 26 skipped, 1 failed.
  desktop 171 passed / 15 skipped / 0 failed; mobile 174 passed / 11 skipped / 1 failed. The skips equal the T01 baseline
  (15 and 11, existing project-conditional skips): `hover.spec.ts` has no `skip`, `fixme` or `.only`; it branches on
  `(hover: hover)` so each test is meaningful on both projects. `hover.spec.ts` alone: 62 passed, 0 skipped.
  The one failure is a CONFLICT, not a defect of this change: `theme.spec.ts:215` ("the pointer on the pressed toggle keeps it
  pressed", a T01 test, NOT in my owned paths) expects `rgb(141, 187, 255)` (`--accent-strong`) under `toggle.hover()` on the
  MOBILE project, where the new rule "all hover rules inside `@media (hover: hover)`" and "no sticky hover after a tap" mean the
  hover look no longer applies (received `rgb(110, 168, 255)`, the pressed rest look, which is the correct touch behaviour). The
  desktop run of the same test passes. Recommended coordinator fix (one test, T01's file): on a device that cannot hover
  (`matchMedia('(hover: hover)')` false) expect `--accent` instead of `--accent-strong`; the fact "hover cannot erase pressed" is
  already covered on desktop by `hover.spec.ts`. No ECONNRESET or `ERR_NO_BUFFER_SPACE` occurred (the first run, 333 passed, 42 skipped,
  1 failed, had the same single failure and used skips that I then removed).
- Phone budget at 390x844 (first day row bottom against tab bar top 788; both projects): no share without the zone note 659.0;
  no share with the zone note 758.0; received share without the zone note 667.0; received share with the zone note 766.0 (shell bar
  52 / 60). Identical to the T01 numbers: the switch fits the existing tools row.
- Tools row (switch label plus "Change several days"), `.tools-right` now wraps instead of `nowrap`: 390 px one row (label 138x44,
  button 188x44); 375 px one row (button 173); 360 px one row (button 158); 320 px wraps to two rows (button 264 wide, full row).
  Label 44px high at every width; the track is 44x24; `clientWidth` equals `scrollWidth` (390, 375, 360, 320).
- Mutation check: removing the pressed-hover rule (and the `:not([aria-pressed])` guard) failed 4 pressed tests (the background
  became the tint); reverted before the final run.
- Grep for email addresses and user-profile paths over the changed files and the evidence: only the full synthetic
  example.invalid form (verify log lines).
- `npm run verify` (SMOKE_PORT 48532, DATA_DIR and DATABASE_PATH inside the task folder): exit 0, SMOKE PASSED.
- `npm run digest` last: c44e612c2897893f639dd6692f51000cd89968f318d0b63e88c34832f61e4629 (804 files, handoff/ excluded; the two new
  files are `ShowDetailsSwitch.tsx` and `hover.spec.ts`).

Deviations and notes (honest):
- Switch off-track at rest is `--card`, not `--off` as in the mockup: over `--off` the hover tint differs by only 1.08:1 in the light
  theme (below the 1.20 rule); over `--card` it is 1.23 / 1.45. The track boundary and thumb carry the shape.
- The `(hover: hover)` wrapping also covers the previously global primary `button:hover` (see above), and the More-panel entries got a
  gated hover of the same look (the old More-panel hover rule was replaced).
- `.tools-right` changed from `nowrap` to `wrap` below 768px (no new breakpoint); it wraps only at 320px.
- Conflict reported: `theme.spec.ts:215` as above; I did not touch the file.
- Process slips: one shell line contained `2>/dev/null` (a `cd` that failed harmlessly); one used `tail -c` on a file (not a pipe). No
  stdin script, no pipe into head or tail, no PID kill, no recursive removal. No background task was started and none is running.
- The coordinator's records changed during my run (`WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`, `design/WP5-UX2/mockup.html`,
  `tasks/WP5-UX2-PLAN4.md`); I did not touch them.

Status: done (with the one reported conflict, `theme.spec.ts:215` on the mobile project)

## Addendum 1 (coordinator, 2026-10-14)

- Decision: the conflict is a test expectation that predates the plan's rule "all hover
  rules inside `@media (hover: hover)`" (plan B4), not a product defect. The pressed look
  on a touch device without hover is the intended behaviour.
- Owned paths extended by exactly one file: `tests/e2e/theme.spec.ts`, and only the test
  at line 215 ("the pointer on the pressed toggle keeps it pressed").
- Change that test so it branches on `matchMedia('(hover: hover)')` inside the page, like
  `hover.spec.ts` does:
  - where hover is supported, keep the current assertion (`--accent-strong` under hover);
  - where it is not, assert the pressed rest look (`--accent`) after the pointer action,
    plus `aria-pressed="true"`.
  - Each branch must assert a real fact. No `skip`, `fixme` or `.only`; no other edit in
    that file.
- Then rerun, in this order:
  - the FULL e2e suite on both projects, alone (must end with 0 failed);
  - `npm run verify` (same environment rules);
  - `npm run digest` LAST.
- Append the new counts, the verify exit code and the new 64-hex digest under
  "Addendum 1 results" with the Edit tool. Copy the masked logs into the evidence folder
  under new names (do not overwrite the earlier logs).
- All runtime rules above still apply. In particular: no stdin scripts, no pipes into
  head or tail, no `/dev/null`.

## Addendum 1 results

- Change (only `tests/e2e/theme.spec.ts`, only the test "the pointer on the pressed toggle keeps it pressed"): it now branches on
  `window.matchMedia('(hover: hover)')` read in the page. Where hover is supported it keeps the `--accent-strong` hover assertion
  (background and text); where it is not it asserts the pressed rest look (`--accent` background, `--on-accent` text) and
  `aria-pressed="true"`. The pointer-away `--accent` and text-contrast assertions stay for both. No skip, fixme or only.
- `npm run typecheck`, `npm run lint`: exit 0.
- Full e2e (`npm run test:e2e`, alone): 346 passed, 26 skipped, 0 failed. desktop 171 passed / 15 skipped / 0 failed; mobile 175
  passed / 11 skipped / 0 failed (the skips are the unchanged T01 baseline).
- `npm run verify` (SMOKE_PORT 48534, DATA_DIR and DATABASE_PATH inside the task folder): exit 0.
- `npm run digest` last: 1e421090db42b29359948de3b4773d438eebe343b47a3e9ce9a2f240b06604c3 (804 files, handoff/ excluded).
- New evidence (masked LF): `addendum1-typecheck.txt`, `addendum1-lint.txt`, `addendum1-e2e-full.txt`, `addendum1-verify.txt`,
  `addendum1-digest.txt` in `handoff/delivery/evidence/WP5-UX2-T02/`. Scan for emails and user-profile paths: only example.invalid.
- Deviations: none. No background task is running.

Status: done
