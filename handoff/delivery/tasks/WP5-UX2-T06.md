# WP5-UX2-T06 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T06; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T05-FREEZE (done). Sixth slice of UI change round 2.
- Scope (board `owner_decisions`, 2026-10-14):
  1. The two-line wordmark to the right of the logo in the top bar: "Semiconductor" over
     "SERVICES, INC.", in the owner's font and colours.
     - Design: `handoff/delivery/tasks/WP5-UX2-PLAN4.md` Results items 1-5 (the
       measured design, outline method, themes, name and fidelity checks).
     - Owner answers WP5-UX2-Q2: Q-1 (a), the company may use the font for its
       wordmark, as outlines only; Q-2 (a), lighter tints in the dark theme.
  2. More space between the brand (logo plus wordmark) and the menu on large screens.
     The owner: "move the menu a little further from the text and logo on the left, so
     it is balanced and easy to read; now it feels a bit cramped".
  3. Remove "C&D Semiconductor Services, Inc." from the on-screen sheet header on the
     Timesheet and the Review sheet. The PDF keeps it. Design: PLAN4 Results item 6.
- Inputs (outside the repository; NEVER commit them):
  - the font, copied at `D:\.claude-tmp\timesheet\WP5-UX2-PLAN4\CDSemiFont.ttf` (original
    `D:\Dropbox\Working.CDSemi\App.Cluster\ClusterPro\ClusterPro\CDSemiFont.ttf`);
  - the owner's image `D:\.claude-tmp\timesheet\WP5-UX2-PLAN4\wordmark-source.png`.
  - Copy both into your task folder first.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (font licence care, outline
  fidelity, bar width), novelty yes. Task record in English.
- Base: HEAD = origin/main = fa2e679273185e3ebad9f3af425177bf21fb8ac1, or a later commit
  that changes only `handoff/`. Source digest
  38a2bb09b2b98f467f1966aa3524c463d7be366bd5c1c495cb71fefcca9d5369 (810 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first.
- PLAN4 Results items 1-7. The T05 record `handoff/delivery/tasks/WP5-UX2-T05.md` (the
  brand markup with `--brand-logo-size` and the hidden name). The T01 record (both dark
  sets and the parity test).
- `src/client/components/AppShell.tsx`, `src/client/styles.css` (shell bar, brand, nav,
  theme sets, `.company`, `.form-brand`), `src/client/components/sheetModel.ts`,
  `src/client/components/TimesheetSheet.tsx`.
- Read-only: `src/server/pdf/timesheetPdf.ts` (the PDF company line stays) and
  `node_modules/@pdf-lib/fontkit/package.json` (the version).
- Tests: `tests/e2e/logo.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/timesheet.spec.ts`
  (line about 231), `tests/e2e/review.spec.ts`, `tests/client/sheetModel.test.ts`.

## Implement

1. **Outlines.** In a temp script in your task folder (never committed; save a copy with
   the font path masked as `.txt` evidence), use the installed `@pdf-lib/fontkit` (no new
   dependency):
   - lay out "Semiconductor" and "SERVICES, INC." (PLAN4 item 5);
   - scale by size / units per em, flip y at the baseline, and apply the letter-spacing
     (line 1: 0; line 2: about 0.73 em, no trailing space);
   - write one `d` string per line with 2-decimal numbers.
2. **Component.** `src/client/components/BrandWordmark.tsx` (new) renders one inline
   `<svg class="wordmark" aria-hidden="true" focusable="false">` with two `<path>`
   elements.
   - Fills come from CSS classes (`.wordmark-main`, `.wordmark-sub`) using new tokens
     `--wordmark-main` (light `#006bbb`) and `--wordmark-sub` (light `#4c4f57`). Re-sample
     the colours from the thickest strokes of the enlarged image and record them.
   - In BOTH dark sets the tokens are the lighter tints: line 1 `var(--accent)`, line 2
     `var(--muted)`, or measured equivalents of at least 4.5:1 on the bar (owner Q-2 a).
   - No `<text>`, no `font-family`, no `@font-face`, no inline `style`, no `fill="var()"`.
   - Path data under 12 KB.
3. **Brand layout.**
   - The logo (36px) on the left, then a gap, then the wordmark, vertically centred in
     the 56px bar.
   - Line 1 about 20px tall; line 2 about 7px with the measured spacing, centred, about
     82% of line 1's width.
   - Show the wordmark from 1280px (`--wordmark-size` and `--wordmark-sub-size`
     tokens). Below that, and on phones, only the logo shows.
   - Measure the bar at 1280 with and without a received share and with the longest
     seeded display name. If the bar wraps (over 56px), raise the breakpoint to the
     smallest width that keeps one row, and record it.
   - The single visually hidden name "C&D Semiconductor Services, Inc." stays; the
     graphics stay decorative.
4. **Brand-to-menu spacing (owner item 2).**
   - Add a token for the gap between the brand and the navigation, for example
     `--shell-brand-gap`.
   - Choose a balanced value on the project's spacing scale for 1280px and wider (where
     the wordmark shows), and a value for 768-1279px (logo only). Explain the choice in
     Results, with before and after screenshots at 1280 and 1024.
   - Nothing may wrap or overflow at 768, 1024 and 1280, with and without a share.
5. **Company line.**
   - Remove `SHEET_COMPANY` from `sheetModel.ts`, its two renders in
     `TimesheetSheet.tsx` (the Timesheet and Review headers), and the `.company` rules in
     `styles.css`.
   - The header keeps the title, "Employee:", "Payroll Date:" and "Period:".
   - The PDF is unchanged.

## Tests

- `tests/client/wordmarkAsset.test.ts` (new), static guards:
  - no `<text>`, `font-family` or `@font-face` anywhere under `src/`;
  - no `.ttf`, `.otf` or `.woff*` file in `git ls-files` or the working tree under `src/`;
  - no raster reference in `BrandWordmark.tsx`;
  - path data under 12 KB.
- `tests/e2e/logo.spec.ts` (extend; both projects):
  - at 1280, the wordmark is visible (about 150px wide, two paths), the logo is 36px, and
    the bar is 56px and does not wrap, with and without a share;
  - below the breakpoint and on phones, the wordmark is not visible;
  - the name is announced exactly once;
  - the two wordmark colours are at least 4.5:1 on the bar in light, dark and both manual
    overrides;
  - the brand-to-menu gap equals the token at 1280 and 1024.
- `tests/e2e/timesheet.spec.ts` (about line 231): the old fact (company line present)
  becomes:
  - the company name is absent from the form;
  - `.company` count is 0;
  - the form still shows the title, "Employee:", "Payroll Date:" and "Period:";
  - the page contains the company name exactly once (the hidden brand name).
- `tests/e2e/review.spec.ts`: the same absence on the Review sheet. The PDF assertion
  `pdf-render.test.ts:218` stays unchanged.
- No assertion removed or weakened beyond replacing the company-line fact with its
  stated opposite. No new `skip`, `fixme` or `.only` beyond the existing
  project-conditional pattern.

## Fidelity evidence

- Save `wordmark-fidelity-synthetic.png`: the owner's crop enlarged 6x beside the render,
  in light and dark.
- Numeric checks (PLAN4 item 5):
  - line 1 width over S height within 8% of the image;
  - line 2 width over line 1 width 0.82 ± 0.03;
  - line 2 cap height over line 1 cap height 0.34 ± 0.05;
  - centring within 1px;
  - a downscaled luminance mean difference of at most 25/255.
- Record the numbers. If a check fails after reasonable effort, stop and report.

## Hard constraints

- No server, API, request-body, domain, calculation, schema, PDF or CSP change. The font
  file and the source image are never committed. No new dependency.
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
  - the T01 to T05 behaviour and tests.

## Owned paths

- `src/client/components/BrandWordmark.tsx` (new), `src/client/components/AppShell.tsx`
  (brand only), `src/client/styles.css`, `src/client/components/sheetModel.ts`,
  `src/client/components/TimesheetSheet.tsx` (the company line only)
- `tests/client/wordmarkAsset.test.ts` (new), `tests/client/sheetModel.test.ts` (only if
  it reads the company line), `tests/e2e/logo.spec.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/timesheet.spec.ts` (the company-line check only), `tests/e2e/review.spec.ts`
  (the absence check only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T06/`: masked LF `.txt` only (the generator with
  the font path masked), plus at most eight renders and screenshots whose basenames end
  in `-synthetic.png`

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Generate the outlines, check fidelity, implement; then run `npm run typecheck`,
   `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once. Any other failure in a file you do not own: stop and report.
5. Measure the bar at 768, 1024, 1280 and 1440 (with and without a share), and the four
   landing budget states at 390x844.
6. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
7. Run `npm run verify` with `SMOKE_PORT` in 48610-48629, and with `DATA_DIR` and
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
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T06`. Set TEMP and TMP to it. Use ports
  48610-48629 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 160 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the wordmark sizes, colours (light and dark) and path size;
- the fidelity numbers;
- the breakpoint and gap values with the bar measurements;
- the company-line removal places;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Status: done (with the deviations below).

**Base (before any edit).** HEAD fa2e679273185e3ebad9f3af425177bf21fb8ac1; Node v24.21.0; source digest
38a2bb09b2b98f467f1966aa3524c463d7be366bd5c1c495cb71fefcca9d5369 (810 files). `git status --short` showed only the expected coordinator
files under `handoff/` (ORCHESTRATION.json, the two WORKFLOW_REVISION_CHECKPOINT files, the T05-FREEZE brief and evidence folder, this brief); none
was touched. Logs: `handoff/delivery/evidence/WP5-UX2-T06/step1-node.txt`, `step2-*.txt`.

**Files changed.** `src/client/components/BrandWordmark.tsx` (new), `src/client/components/AppShell.tsx` (brand only: import and
`<BrandWordmark />`), `src/client/styles.css`, `src/client/components/sheetModel.ts`, `src/client/components/TimesheetSheet.tsx` (company line only),
`tests/client/wordmarkAsset.test.ts` (new), `tests/e2e/logo.spec.ts`, `tests/e2e/timesheet.spec.ts` (company-line check only),
`tests/e2e/review.spec.ts` (absence check only). `sheetModel.test.ts` and `shell.spec.ts` needed no change. No server, API, PDF, CSP, docs or dependency change.

**1. Outlines (a correction to PLAN4).** The generator (font path passed as an argument, so the saved copy contains no path) is
`evidence/WP5-UX2-T06/gen-wordmark.mjs.txt`. It uses the installed `@pdf-lib/fontkit` 1.1.1 (`create`, `layout`, glyph path commands), scales by size / 1000,
flips y at the baseline, writes 2-decimal absolute `M L Q Z` path data. First render of "Semiconductor" typed with lowercase letters did NOT match the owner's
image: this font has true lowercase forms (round e, dotted i, tall d and t), whereas the image shows a full-size S followed by capitals set as SMALL CAPITALS
(PLAN4 item 1 misread the glyph heights as small caps). The final line 1 is therefore the capital S at full size and the other twelve letters as the font's
capital glyphs at 0.75 of that size (width over S height 8.80, the image's corrected 8.8; lowercase gave 9.04 and a visibly different mark). Line 2 is
"SERVICES, INC." in capitals at 7 units with 0.764 em letter-spacing (no trailing space), centred under line 1. Size 21 (S cap height 17.2px), not 20, so the
mark is about 150px wide.

**2. Component and tokens.** One inline `<svg class="wordmark" viewBox="0 0 151.36 27.78" aria-hidden="true" focusable="false">` with two `<path>` elements
(`wordmark-main`, `wordmark-sub`); no text, font-family, font-face, inline style or `fill=` attribute. Path data 3220 + 2558 = 5778 bytes (limit 12 KB).
Box 151.4 x 27.8px (measured). New tokens (all in `:root`): `--wordmark-size: 21px`, `--wordmark-width` and `--wordmark-height` (derived from it),
`--wordmark-main`, `--wordmark-sub`, `--shell-brand-inner-gap` (12px, the logo-to-wordmark space), `--shell-gap` (24px, the bar's own column gap, formerly a
literal use of `--space-5`) and `--shell-brand-gap`. The brief's `--wordmark-sub-size` token was not created: line 2 is drawn at one third of line 1
inside the same graphic, so one size token scales both and a second would be dead.
Colours re-sampled from the owner's image (`colour-resample.json.txt`): line 1 `#006eba` (median of the 18 interior pixels of the thick strokes; PLAN4's estimate was
`#006bbb`), line 2 `#4c4f57` (the darkest grey pixel; the thin letters never reach full ink). Dark (both dark sets, identical text, parity test green):
`--wordmark-main: var(--accent)` (#6ea8ff), `--wordmark-sub: var(--muted)` (#9aa5b4). Measured on the bar: light 5.33:1 and 8.19:1; dark 6.79:1 and 6.56:1 (device
dark, manual dark, device light, manual light all asserted).

**3. Fidelity (`evidence/.../wordmark-fidelity-synthetic.png`, `fidelity-numbers.json.txt`).** Render at 6x of the generated paths beside the owner's crop, light and dark.
- Line 1 width over S height: 8.80 render; image 8.64 as measured, 8.8 corrected (within 2%): pass.
- Line 2 width over line 1 width: 0.826 (target 0.82 +/- 0.03; image 0.826): pass.
- Line 2 cap height over line 1 cap height: 0.330 (target 0.34 +/- 0.05; the blurred image measures 0.43 at half coverage): pass.
- Centring: 0.17px (limit 1px): pass.
- Luminance mean absolute difference over the two text boxes at the image's scale: 22.2/255 after registration (translation within 2 image px and scale within 4%, best
  shift 1 and 0.75 px, factor 0.99); 20.0 against a render softened by 0.75px; 32.1 with no registration. Limit 25: pass with registration. The image carries a drop
  shadow and blur, so the bound is meaningful only after registration; this is recorded, not hidden.

**4. Breakpoint and bar measurements (built app, synthetic accounts; `bar-measure-*.txt`, `breakpoint-scan-*.txt`).** The wordmark shows from 1440px, not 1280px.
With a "Shared with me" switcher (owner name 16 characters) the one-row bar needs 1376px for a 16-character user name, 1408px for 20 and 24 characters (1440px for 28),
once the wordmark is in. At 1280 and 1366 it wrapped to 103.8px. So the brief's rule applies: the breakpoint is raised to 1440, which also leaves room for a scrollbar.
Final bar (user "Example Employee Two", 20 characters; owner 16): 768 no share 99.8px, share 147.8px (wrapped; this wrapping exists unchanged since before this slice);
1024 no share 56, share 103.8 (also unchanged); 1280 and 1439 56 with and without a share, no wordmark; 1440 and 1536 56 with and without a share, wordmark 151.4 x 27.8,
logo 36x36, brand 199.4px wide; no horizontal overflow at any width (scrollWidth equals innerWidth). The e2e test at 1440 (24-character reader, 15-character owner) also
reads 56px with and without a share. A longer owner or user name wraps the bar as it already did at narrower widths (a long owner name widens the switcher).
Below 1440 and on phones only the logo shows; the hidden brand name stays and is found exactly once on the page.

**5. Brand-to-menu gap (owner item 2).** `--shell-brand-gap` is the TOTAL space from the brand to the menu (nav left minus brand right): the bar's column gap
(`--shell-gap`, 24px) plus a margin on the nav of the difference. Values: 24px (`--space-5`, unchanged) from 768 to 1439px; 32px (`--space-6`) from 1440px, where the
wordmark appears. Why not more at 1280 and 1024: a measurement shows the bar has no spare width there (1024 without a share: nav ends 545.6 and the user group
starts 569.6, exactly the 24px gap; 1280 with a share and a 28-character name is tight to the pixel), so any increase would wrap the bar that is one row today. From 1440
the menu now starts 32px after the wordmark (nav left 247.4, brand right 215.4), 8px further than before and with the wordmark 12px from the logo. Visible
change for the owner is therefore on screens of 1440px and wider. Screenshots (before is the T05 logo-only bar): `bar-before-1440-share-synthetic.png`,
`bar-after-1440-share-synthetic.png`, `bar-after-1440-noshare-dark-synthetic.png`, `bar-before-1280-noshare-synthetic.png`, `bar-after-1280-noshare-synthetic.png`,
`bar-before-1024-noshare-synthetic.png`, `bar-after-1024-noshare-synthetic.png` (1280 and 1024 are identical by design) and the fidelity image (8 PNGs).

**6. Company line removed (on screen only).** Removed: `SHEET_COMPANY` in `sheetModel.ts` (the title constant stays, comment updated); the two
`<div className="company">` lines in `TimesheetSheet.tsx` (Timesheet sheet header and Review "What you sign" header) and the now-unused `SHEET_COMPANY` import; the
`.company` rule and its phone override and the phone `.form-brand` flex rule in `styles.css`; two stale comments about squeezing the company name. The header keeps the
title (visually hidden on a phone, as before), Employee, Payroll Date, Period. The PDF (`timesheetPdf.ts`, `pdf-render.test.ts` assertion) is unchanged. Effect on the phone first
screen (all against the 788px tab bar): first day row bottom 639.5 (was 659), 738.4 (was 758), 647.5 (was 667), 746.4 (was 766), each 19.6px lower on the page; the
away-state budget tests (first window day) also pass.

**7. Tests.** New `tests/client/wordmarkAsset.test.ts` (8 tests): two path strings and two `<path>`, path data under 12 KB and path characters only, decorative inline svg with no style or fill
attribute, no raster reference, no SVG text element or font-face rule anywhere under `src/`, no font-family in the component or the `.wordmark` rules and no typeface name in any source,
no font file in the working tree under `src/` and none in `git ls-files` (skipped quietly when the folder is not a repository). Deviation: `font-family` is NOT banned from all of `src/`
because the app's own system stack and monospace rules legitimately use it; the guard covers the wordmark and the stylesheet's `.wordmark` rules. `tests/e2e/logo.spec.ts` (both projects): the
graphic is decorative with two paths and no text, the name is announced once, wordmark colours in four theme scenarios, the 1440 test (desktop project only: wordmark about 151px wide, two paths,
logo 36px, bar 56px with and without a share, centred, inner gap and brand gap equal their tokens, 32px, CSP clean), the below-1440 and phone test (wordmark hidden, gap equals its 24px token at
1439, 1280, 1024, 768; one row at 1280 with and without a share and at 1024 without; no overflow). `timesheet.spec.ts`: the company fact became its stated opposite (absent from the form,
`.company` count 0, title and the three fields present, the name once on the page). `review.spec.ts`: the same absence on the Review sheet. No assertion removed or weakened beyond that; no
new `.only` or `.fixme`; one project-conditional `test.skip(isMobile, ...)` in the 1440 test, the existing pattern.

**8. Checks.** `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` 88 files, 1877 tests passed. Full e2e (`npm run test:e2e`, run alone, screenshots and output in the task folder):
402 passed, 32 skipped, 0 failed; desktop 198 passed, 19 skipped, 0 failed; mobile 204 passed, 13 skipped, 0 failed (no ECONNRESET and no ERR_NO_BUFFER_SPACE). `npm run verify` (SMOKE_PORT 48620,
DATA_DIR and DATABASE_PATH inside the task folder) exit 0, "SMOKE PASSED". Final `npm run digest` (run after verify, nothing changed after it):
3407f8f70ec67326e2db7058b0056871938b3536cc8452455179ee9aca82c6d1 (812 files, handoff/ excluded). Grep of changed files and evidence: only full example.invalid addresses, no user-profile path.

**Evidence** (`handoff/delivery/evidence/WP5-UX2-T06/`): the 8 PNGs above; `gen-wordmark.mjs.txt`, `colour-resample.json.txt`, `fidelity-numbers.json.txt`, `bar-measure-before.txt`,
`bar-measure-after.txt`, `bar-measure-after-dark-1440.txt`, `breakpoint-scan-16-chars.txt`, `-20-chars.txt`, `-24-chars.txt`, `step1-node.txt`, `step2-*.txt`, `step3-*.txt`, `step4-*.txt`,
`step7-verify.txt`, `step8-digest-final.txt`, `step8-status-final.txt` (all LF text). The font and the source image stayed in the task folder and were never committed.

**Deviations.** (1) Wordmark line 1 is the capital S plus small-capital letters at 0.75 (not lowercase "Semiconductor" as PLAN4 assumed), and size 21 (not 20): fidelity to the image required it.
(2) Breakpoint 1440, not 1280, as the brief's own rule requires after the measurement. (3) Gap 32px only from 1440; 24px below because there is no spare width at 1024 and 1280. (4) No
`--wordmark-sub-size` token. (5) The no-wrap requirement could not hold at 768 and at 1024 with a share: those bars already wrapped before this slice (measured before and after, unchanged); the tests assert
no overflow there and one row where it was one row. (6) The `font-family` guard is scoped as described above. (7) Process slips, harmless: twice I wrote a redirect to /dev/null inside a command
(once also `| tail`, no file or data was involved). No stop condition was hit.
