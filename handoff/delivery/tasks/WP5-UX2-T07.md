# WP5-UX2-T07 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T07; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T06-FREEZE (done). Seventh slice of UI change round 2.
- Owner request (2026-10-14, verbatim on the board; English translation): "The 'Dark
  mode' button (on large screens) should become a Dark/Light toggle with matching icons,
  instead of the fixed text 'Dark mode' with an on/off toggle button as now, which looks
  too ugly."
- Coordinator decisions (board `coordinator_decisions`, 2026-10-14):
  - replace the T01 "Dark mode" pressed button with a two-option theme control,
    "Light" and "Dark", each with its icon (a sun and a moon, inline SVG drawn in the
    repository, no icon library);
  - use it on desktop and, for consistency, in the phone More panel;
  - the behaviour of T01 stays: follow the device until the first choice, store the
    choice per device under `timesheet.theme`, pre-paint through `/theme-init.js`, CSP
    unchanged.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (keyboard and contrast states, the
  bar width at the wordmark breakpoint), novelty no. Task record in English.
- Base: HEAD = origin/main = 3f5a3b333dede51043000e7123960ac05d26a76b, or a later commit
  that changes only `handoff/`. Source digest
  3407f8f70ec67326e2db7058b0056871938b3536cc8452455179ee9aca82c6d1 (812 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only, 4px
  radius, shared transition token, subtle layered shadows).
- The T01, T02 and T06 records (`handoff/delivery/tasks/WP5-UX2-T01.md`, `-T02.md`,
  `-T06.md`):
  - theme model and storage;
  - the hover and pressed system;
  - the bar width at the 1440px wordmark breakpoint and the brand gap.
- `src/client/components/ThemeToggle.tsx`, `src/client/components/themeModel.ts`,
  `src/client/components/AppShell.tsx`, `src/client/styles.css`.
- Tests: `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/focus-ring.spec.ts`, `tests/e2e/hover.spec.ts`, `tests/e2e/logo.spec.ts`,
  `tests/e2e/contrast.ts`, `tests/client/themeModel.test.ts`.

## Implement

1. **Control.** A compact segmented control labelled "Theme", with two options:
   "Light" with a sun icon, and "Dark" with a moon icon.
   - Use the semantics of a native radio group: two `<input type="radio" name="theme">`
     inside labels within a `fieldset` or `role="radiogroup"`, with an accessible group
     name "Theme". Arrow keys move the choice, as native radios do.
   - The icons are `aria-hidden`. Each option's accessible name equals its visible text.
   - The option of the effective theme is checked, including the device-following
     default before any choice.
   - Choosing an option stores it, exactly like the T01 toggle did.
2. **Look.**
   - The 4px radius.
   - The checked segment uses the T02 pressed system: solid `--accent` with
     `--on-accent`. The other segment uses the T02 hover look under
     `@media (hover: hover)`.
   - A focus-visible ring on the focused segment.
   - The icon size comes from a token; the shared transition token is used, and
     `prefers-reduced-motion` is respected.
   - Every state in both themes and with both manual overrides:
     - text at least 4.5:1;
     - boundaries and indicators at least 3:1;
     - focus ring at least 3:1.
3. **Placement.**
   - Desktop: where the "Dark mode" button is now (the top bar's user group).
   - Phone: in the More panel, replacing the "Dark mode" entry, with 44px targets.
   - At the 1440px wordmark breakpoint the bar must stay one row (56px), with and
     without a received share and with the longest seeded name. If the new control is
     wider than the old button and breaks that, prefer a more compact control (for
     example smaller side padding, or the icon plus a short visible label) over raising
     the breakpoint. If you must raise it, record the measured value.
   - Below 1440 nothing may overflow.
4. **Model.** Keep `themeModel.ts` behaviour. Adapt it only if the control needs a
   different shape, with unit tests.

## Tests

- Update the assertions that used the "Dark mode" button (`aria-pressed`) to the radio
  group (checked state, accessible names "Light" and "Dark", group name "Theme"):
  - in `theme.spec.ts`: media following, override, persistence, pre-paint, CSP, blocked
    storage, the second tab;
  - in `shell.spec.ts`: presence and tab order;
  - in `focus-ring.spec.ts`: the AX-04 loop entry;
  - in `hover.spec.ts`, if it covers the toggle.
  - Each keeps its fact; show it in Results.
- Add:
  - keyboard checks (Tab reaches the group; Arrow keys switch the theme; Space or Enter
    on a radio);
  - contrast checks for the checked and unchecked segments, hover and focus, in both
    themes and with both overrides;
  - the icons are `aria-hidden`;
  - the phone More panel control at 390, 375, 360 and 320 (44px, no horizontal
    scroll);
  - the 1440 bar stays one row with a share (extend `logo.spec.ts`).
- No assertion removed or weakened beyond these role changes. No new `skip`, `fixme` or
  `.only` beyond the existing project-conditional pattern.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change.
  `/theme-init.js` stays as it is unless a change is needed; if it changes, explain why.
- Not owned: `src/client/api.ts`, `tests/e2e/fixtures.ts`, every docs file, and every file
  not listed under "Owned paths".
- Tokens only for new CSS values; every new dark token goes into BOTH dark sets.
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12;
  - the phone budgets: landing 659/758/667/766; away on the first window day
    777.5/785.5; all against 788;
  - 44px targets;
  - the modal editor, the Escape order and focus returns;
  - AC-16;
  - the T01 to T06 behaviour and tests.

## Owned paths

- `src/client/components/ThemeToggle.tsx`, `src/client/components/themeModel.ts` (only if
  needed), `src/client/components/AppShell.tsx` (the toggle placement only),
  `src/client/styles.css`
- `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/focus-ring.spec.ts`,
  `tests/e2e/hover.spec.ts`, `tests/e2e/logo.spec.ts`, `tests/e2e/contrast.ts`,
  `tests/client/themeModel.test.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T07/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`: the desktop bar and the phone More
  panel, light and dark, and each segment hovered and focused)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once. Any other failure in a file you do not own: stop and report.
5. Measure the bar at 768, 1024, 1280, 1440 and 1600 (with and without a share), and
   the More panel at 390, 375, 360 and 320.
6. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
7. Run `npm run verify` with `SMOKE_PORT` in 48630-48649, and with `DATA_DIR` and
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
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root. Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T07`. Set TEMP and TMP to it. Use ports
  48630-48649 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the control's markup and semantics;
- the contrast numbers (light, dark);
- the bar measurements (one row at the breakpoint) and the More panel fit;
- the assertion changes;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Worker: timesheet-worker-high, requested model sonnet, self-reported model claude-sonnet-5-5.

### Base (recorded before any edit)

- Node `v24.21.0`. HEAD `3f5a3b333dede51043000e7123960ac05d26a76b`.
- `git status --short` before editing: `M handoff/delivery/ORCHESTRATION.json`,
  `M handoff/delivery/tasks/WP5-UX2-T06-FREEZE.md`, `?? handoff/delivery/evidence/WP5-UX2-T06-FREEZE/`,
  `?? handoff/delivery/tasks/WP5-UX2-T07.md` (all coordinator files, untouched).
- `npm run digest` before editing: `3407f8f70ec67326e2db7058b0056871938b3536cc8452455179ee9aca82c6d1` (812 files). Log:
  `handoff/delivery/evidence/WP5-UX2-T07/base-head-status-digest.txt`.

### Files changed (owned paths only)

- `src/client/components/ThemeToggle.tsx`, `src/client/components/AppShell.tsx` (placement class only:
  `more-action` became `more-theme`), `src/client/styles.css`.
- `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/focus-ring.spec.ts`, `tests/e2e/logo.spec.ts`,
  `tests/e2e/contrast.ts`.
- Not changed: `src/client/components/themeModel.ts` and `tests/client/themeModel.test.ts` (the model behaviour is the
  same; `nextTheme` is no longer used by the component but stays exported and unit-tested), `tests/e2e/hover.spec.ts`
  (it never covered the theme toggle), `public/theme-init.js`, server, API, CSP, docs.

### The control

- Markup: `<div role="radiogroup" aria-label="Theme" class="theme-switch">` holding two
  `<label class="theme-option">`, each with a native `<input type="radio" value="light|dark">`, an inline SVG icon
  (`aria-hidden="true"`, `focusable="false"`, 16px by `--theme-icon-size`, stroke `currentColor`, no icon library: a sun
  for Light, a moon for Dark) and the visible text "Light" / "Dark". Accessible names equal the visible text; the group
  name is "Theme".
- Semantics: the checked radio is the effective theme (the device's before any choice, live with the device while
  nothing is stored). Choosing the other option stores it exactly as T01 did (`timesheet.theme`, page-only when storage
  is blocked, `storage` event for other tabs, pre-paint by `/theme-init.js`, CSP unchanged). Tab reaches the group at the
  checked radio (one tab stop); ArrowRight/ArrowLeft move and switch the choice; Space chooses a focused radio; Enter
  does nothing, as in any native radio group.
- Look: the radio is invisible (opacity 0) and covers its label's border box, so the whole segment is the target. The
  label paints the segment: 1px `--accent` border, 4px radius on the outer corners only, quiet accent text. Checked
  (`:has(input:checked)`) is the T02 pressed look: solid `--accent` with `--on-accent`, `--accent-strong` under the
  pointer. Unchecked under `@media (hover: hover)` uses `--hover-fill`. Focus-visible shows the shared `--focus-ring` on
  the label, raised by `--layer-focus` so the neighbour does not cover it. The shared `--transition` is used (so
  `prefers-reduced-motion` is respected through `--duration`). A `forced-colors` rule keeps the checked segment
  distinguishable. New tokens (not colours, so no dark-set entry is needed): `--theme-icon-size`,
  `--theme-option-pad-x`, `--layer-focus`; `--theme-glyph-size` and the old glyph/toggle rules are removed. The
  `cssThemeParity` unit test still passes.
- Placement: desktop, the first control of the top bar user group where the "Dark mode" button was; phone, in the More
  panel between the entries and Sign out, spanning the panel with two 44px segments.
- Deviation: the brief names `name="theme"` for the radios. Both placements are in the page at once (one hidden by the
  layout), and two radio groups with the same `name` in one document are ONE group: checking a radio in the More panel
  unchecked the hidden bar's one (found by the mobile tests, 29 failures on the first run). Each instance therefore uses
  `name={"theme-" + useId()}`. The tests assert `name` matches `^theme-`.

### Contrast (computed from the browser's computed styles, WCAG formula; all pass, minimum 4.5 text and 3 for boundaries, indicators and ring)

- Light theme: checked segment text 6.09 at rest, 8.01 hovered; unchecked text 6.09 at rest, 4.96 hovered; boundary or
  fill against the bar 6.09 at rest (8.01 hovered for the checked fill); focus ring 6.09 against the bar, 6.09 against its
  gap, gap against the accent fill 6.09.
- Dark theme: checked text 7.76 at rest, 9.53 hovered; unchecked text 6.79 at rest, 4.68 hovered; boundary or fill 6.79
  at rest (8.33 hovered); focus ring 6.79, gap against the fill 6.79.
- Measured in all four cases (light device, dark device, manual dark on a light device, manual light on a dark device),
  with the other option checked as well, at rest, hovered (desktop project only: the phone project has no hover) and
  focused. Log: `e2e-theme-contrast-keyboard-morepanel.txt` in the evidence folder.

### Bar and More panel measurements

- Control size 141.47 x 36 px (the old button was about 20px narrower). The bar stays one 56px row at 1440 without and
  with a received share (24-character reader name `Synthetic Tab Order User`, owner `Synthetic Owner`): spare room in the
  flexible middle 397.2px without a share and 40.0px with one, user group right edge 1424 of 1440; at 1600 with a share
  56px and 200.0px spare. No change to the 1440 wordmark breakpoint was needed.
- Bar heights: 1439 and 1280 are 56px with and without a share; 1024 is 56px without a share and wraps with one (103.75px),
  768 wraps (99.75px, 147.75px); these wraps are the pre-existing ones the logo test already allowed (one row is asserted
  only at 1280 and above, and at 1024 without a share). No horizontal overflow at any measured width. Log:
  `e2e-logo-bar-measurements.txt`.
- More panel at 390, 375, 360 and 320 (employee and admin): the control is 224 x 44 inside a 240px panel; every link,
  button, label and radio is 44px high and at least 44px wide; the panel stays inside the screen; `scrollWidth` equals
  `clientWidth`. The phone first-screen budgets are unchanged (the control is not on the first screen; the compact bar is
  one row).

### Assertion changes (each keeps its fact)

- `theme.spec.ts`: media following, override, persistence, pre-paint, CSP, blocked storage, second tab, the four-way
  stored/device matrix and the hover-keeps-pressed fact now use `getByRole('radiogroup', { name: 'Theme' })` and
  `toBeChecked` on the Light and Dark radios instead of the "Dark mode" button and `aria-pressed`. New tests: group, native
  radios, names, `aria-hidden` icons with no text and 16px size, sun and moon are different drawings; keyboard (Tab one
  stop, Shift+Tab, arrows, Space, Enter) in the four cases; contrast of both segments at rest, hover and focus in the four
  cases; the More panel at 390, 375, 360 and 320 now also checks the radios and labels at 44px and the control inside the
  panel; a screenshot test for the evidence images.
- `shell.spec.ts`: presence (phone More panel, desktop bar), position (first of the bar group; between the entries and
  Sign out in More), and both Tab-order tests now expect `Theme` as one stop (the focused radio reports its group name).
- `focus-ring.spec.ts`: the AX-04 test keeps "Change several days" unchanged and replaces the pressed "Dark mode" entry by
  both checked theme segments (focus on the radio, ring read from its label, same ring/gap/fill 3:1 assertions).
  `focusedProbe` gained an optional `painted` element.
- `logo.spec.ts`: the bar facts now include the theme control and the spare room; the 1440 test asserts the control is
  inside the one 56px row (36px high, inside the viewport) and adds a 1600 check with a share.
- `contrast.ts`: `focusFromKeyboard` takes an optional `painted` locator.
- No assertion removed or weakened beyond these role changes; no new `skip`, `fixme` or `.only`.

### Counts and gates

- `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test`: 88 files, 1877 tests passed (unchanged: no unit test
  needed to change).
- Full `npm run test:e2e` (build, then both projects, run alone, `E2E_SCREENSHOT_DIR` and the output folder inside the
  task folder): 414 passed, 0 failed, 32 skipped (the existing project-conditional skips). Per project: desktop 204 passed
  and 19 skipped, mobile 210 passed and 13 skipped. No ECONNRESET, no `ERR_NO_BUFFER_SPACE`.
- `npm run verify` (`SMOKE_PORT` 48631, `DATA_DIR` and `DATABASE_PATH` inside the task folder): exit 0.
- `npm run digest`, last, after the final file change: `3416cf04012f3da4a44b3968d384200e108301741ee599f37fdfe61b388975e8`
  (812 files, handoff excluded). Nothing under `src/`, `tests/` or the other digest paths changed after it.
- Email and user-profile path grep over the changed files and the evidence: only `example.invalid` forms and the package
  name `timesheet@0.1.0` appear.

### Evidence (`handoff/delivery/evidence/WP5-UX2-T07/`)

- Logs: `base-head-status-digest.txt`, `exit-codes.txt`, `typecheck.txt`, `lint.txt`, `unit-tests.txt`, `e2e-full.txt`,
  `e2e-logo-bar-measurements.txt`, `e2e-theme-contrast-keyboard-morepanel.txt`, `verify.txt`, `digest.txt`.
- Screenshots (eight, synthetic data): `t07-bar-light-desktop-synthetic.png`, `t07-bar-dark-desktop-synthetic.png`,
  `t07-more-light-mobile-synthetic.png`, `t07-more-dark-mobile-synthetic.png`, `t07-segment-hover-light-desktop-synthetic.png`,
  `t07-segment-focus-light-desktop-synthetic.png`, `t07-segment-hover-dark-desktop-synthetic.png`,
  `t07-segment-focus-dark-desktop-synthetic.png`.

### Process notes

- One command used `| head` by mistake (a summary grep of the first theme log; the output file was never read). No other
  rule was broken. No background task is still running.

Status: done
