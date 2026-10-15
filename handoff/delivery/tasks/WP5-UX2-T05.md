# WP5-UX2-T05 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T05; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T04-FREEZE (done). Fifth slice of UI change round 2.
- Scope: the logo part of the owner's brand request (board `owner_decisions`,
  2026-10-14). Follow `handoff/delivery/tasks/WP5-UX2-PLAN3.md` Results item 1 and
  `handoff/delivery/tasks/WP5-UX2-PLAN4.md` Results item 4 (the accessible name):
  - a traced vector `src/client/public/cd-logo.svg` of the owner's C&D logo;
  - the favicon from the same file;
  - the shell brand: the logo replaces the "C&D Semi" text at the top left, in the
    desktop bar and the phone bar, with one visually hidden text "C&D Semiconductor
    Services, Inc." as the brand's name.
  - The two-line wordmark, the brand-to-menu spacing and the company-line removal come
    in the next slice (WP5-UX2-T06). Do not start them here.
- Source image (outside the repository; NEVER commit it or any raster copy except
  `-synthetic.png` evidence renders):
  - `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\cd-logo-source.png` (512x512 RGBA);
  - also, if still present,
    `D:\.claude-tmp\claude\D--Dropbox-Work-CDSemi-timesheet\11acfabe-25ef-48b5-ac28-73ce2d74ecee\images\1.png`.
  - Copy it into your task folder first.
- Coordinator decision: an SVG traced from the image, with no embedded raster, no
  `data:` URI and no `<image>`. The precommit privacy rule blocks committed
  PNG/JPEG/WebP files; SVG is allowed.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M, novelty yes (raster tracing). Task
  record in English.
- Base: HEAD = origin/main = 54dda11bbd95e8a8df07aa5918d1e6736231a0a5, or a later commit
  that changes only `handoff/`. Source digest
  9c76a1ec5e04b14b000d00d3bdc70c08215936cd76123e4dd7b6cc836c97e369 (807 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first.
- PLAN3 Results item 1 (SVG method, fidelity thresholds, location, favicon, CSP) and
  PLAN4 Results item 4 (markup and name).
- `src/client/components/AppShell.tsx` (the brand at about line 158), `src/client/index.html`,
  `src/client/styles.css` (`.shell-brand`, the bar, the theme sets), `src/server/app.ts`
  (read-only: CSP `img-src`, static serving).
- Tests that read the brand text, if any (search `tests/` for "C&D Semi").

## Implement

1. **Trace the logo** with a temp script in your task folder (never committed; save a
   masked copy as `.txt` evidence).
   - Build the geometric parts exactly, in a `viewBox="0 0 512 512"`:
     - the rim circle;
     - the disc;
     - the white ground;
     - the stripe rectangles;
     - the central band, inside a circle `clipPath`.
   - Measure the stripe and band y-ranges from the pixel column at x = 256 (run lengths
     of blue against white), and sample the colours from the pixels.
   - Trace the three light-grey glyphs "C", "&", "D" from the band pixels:
     - read the pixels in a Playwright page canvas (`getImageData`);
     - threshold the glyph colour;
     - extract the contours with marching squares;
     - simplify with Douglas-Peucker (epsilon at most 0.6px);
     - write `<path>` data with the holes (the counters of "&" and "D").
   - Round to 2 decimals. Use no `<text>`, no font, no `<script>`, no external reference.
2. **Fidelity.** Render the SVG and the PNG through the same canvas over white at 512, 64
   and 32px. Compare them per pixel against the PLAN3 thresholds:
   - 512px: mean absolute channel difference at most 2/255, and at most 1.5% of pixels
     differ by more than 48;
   - 64px: mean at most 3, and at most 3%;
   - 32px: mean at most 4.

   Save side-by-side renders `logo-fidelity-512-synthetic.png`, `-64-` and `-32-` in the
   evidence folder, and look at the glyph shapes yourself. If the thresholds cannot be
   met after a reasonable effort, stop and report the numbers. Do not loosen them
   silently.
3. **Size and safety.**
   - `cd-logo.svg` under 20 KB.
   - Served by the existing static path with `Content-Type: image/svg+xml`, 200.
   - No `securitypolicyviolation`, and no CSP change.
4. **Shell brand.**
   - Markup: `<span class="shell-brand"><img src="/cd-logo.svg" alt="" width="36"
     height="36"><span class="sr-only">C&amp;D Semiconductor Services, Inc.</span></span>`.
     Use the project's existing visually-hidden class.
   - Not a link, as today. Exactly one announcement of the name.
   - The logo is 36px (new token `--brand-logo-size`).
   - The bar heights stay as they are: 56px on desktop and the current compact phone
     bar. The phone first-screen budget is unchanged (landing 659/758/667/766, away on
     the first window day 777.5/785.5, all against 788).
   - Light and dark: the logo keeps its fixed brand colours. If the light-grey rim is
     lost on the light bar, add a 1px ring with the existing `--line` token and say so.
5. **Favicon.** `<link rel="icon" type="image/svg+xml" href="/cd-logo.svg">` in
   `index.html`.

## Tests

- `tests/client/logoAsset.test.ts` (new):
  - the file contains `<svg` and `viewBox="0 0 512 512"`;
  - no `<image`, no `data:`, no raster `href`, no `<script`, no `<text`;
  - under 20 KB.
- `tests/e2e/logo.spec.ts` (new; both projects):
  - the logo `<img>` is visible with a natural width above 0 and a 36px rendered size,
    with `alt=""`;
  - the brand's accessible text "C&D Semiconductor Services, Inc." is present exactly
    once in the page;
  - the favicon link is present;
  - `/cd-logo.svg` returns 200 with `image/svg+xml`;
  - no `securitypolicyviolation`;
  - light and dark, with the manual override both ways.
- Update any test that read the old brand text, keeping its fact through the new name.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only` beyond the existing
  project-conditional pattern.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change.
- Never commit the source PNG, the font or any raster other than `-synthetic.png`
  evidence. No new dependency (Playwright, already installed, may render in your temp
  scripts).
- Not owned: `src/client/api.ts`, `tests/e2e/fixtures.ts`, every docs file, and every file
  not listed under "Owned paths".
- Tokens only for new CSS values.
- Keep every behaviour that earlier audits and slices verified: AX-01..AX-10, R-12, the
  budgets above, 44px targets, the modal editor, the Escape order and focus returns,
  AC-16, and the T01 to T04 behaviour and tests.

## Owned paths

- `src/client/public/cd-logo.svg` (new), `src/client/components/AppShell.tsx` (brand markup
  only), `src/client/index.html` (favicon line only), `src/client/styles.css`
- `tests/client/logoAsset.test.ts` (new), `tests/e2e/logo.spec.ts` (new),
  `tests/e2e/shell.spec.ts` (only if it reads the old brand)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T05/`: masked LF `.txt` only (the tracing script
  as `.txt`), plus the fidelity renders and at most four bar screenshots, each with a
  basename ending in `-synthetic.png`

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Trace, check fidelity, implement; then run `npm run typecheck`, `npm run lint` and
   `npm test`.
4. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once. Any other failure in a file you do not own: stop and report.
5. Measure the bar height on desktop (1280) and on the phone (390), and the four landing
   budget states at 390x844.
6. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
7. Run `npm run verify` with `SMOKE_PORT` in 48590-48609, and with `DATA_DIR` and
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
  Never write into the repository root or a drive root.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T05`. Set TEMP and TMP to it. Use ports
  48590-48609 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
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
- the SVG size and structure (paths, colours);
- the fidelity numbers at 512/64/32;
- the bar heights and budgets;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Status: done.

Base (before any edit, `evidence/WP5-UX2-T05/base.txt`): HEAD 54dda11bbd95e8a8df07aa5918d1e6736231a0a5; `git status --short` listed only the
coordinator's `handoff/` files; digest 9c76a1ec5e04b14b000d00d3bdc70c08215936cd76123e4dd7b6cc836c97e369 (807 files). Node v24.21.0.

**Trace.** Source PNG copied to the task folder (never into the repository). Decoded through a Chromium canvas to raw RGBA. Measurements:
- Two colours only: blue `#0e71b8` and grey `#e7e8e9`. The rim, the ground between the stripes and the three glyphs are all the same grey.
- Outside the outer circle the pixels are transparent. Outer circle r 256 at (256,256); the inner disc clip r 239.8, tuned by a sweep of 239.4 to 240.2.
- Stripes (fit against the column x = 256, least squares): start 64.06, pitch 29.79, height 14.76, 15 rects. The band is the rect 183.27 to 317.23 (stripe 4 top to stripe 8 bottom).
- Glyphs: marching squares at level 0.5 on the grey/blue ramp (sub-pixel), Douglas-Peucker epsilon 0.2px, 2 decimals. Each glyph is one open outline (the counters of "&" and "D" open into the band, so there are no inner holes); `fill-rule="evenodd"` is set anyway.

**File `src/client/public/cd-logo.svg`:** 3,440 bytes, `viewBox="0 0 512 512"`; 1 rim circle, 1 `clipPath` circle, 1 ground rect, 16 blue rects, 3 glyph `<path>`s (49, 67 and 59 points).
No `<image>`, `<text>`, `<script>`, `data:` or external reference.

**Fidelity** (SVG and PNG through the same canvas over white, `evidence/.../fidelity-result.txt`):

| Size | Mean abs channel diff | Pixels over 48 | Limit |
|---|---|---|---|
| 512 | 0.452 | 0.024% | 2 / 1.5% |
| 64 | 1.401 | 1.367% | 3 / 3% |
| 32 | 2.871 | not limited | 4 |

All PASS. Side-by-side renders `logo-fidelity-512-synthetic.png`, `-64-` and `-32-` were inspected: the glyph shapes match.

**Shell.** `AppShell.tsx`: `<span class="shell-brand"><img src="/cd-logo.svg" alt="" width=36 height=36><span class="sr-only">C&amp;D Semiconductor Services, Inc.</span></span>`; not a link.
`styles.css`: new token `--brand-logo-size: 36px`; `.shell-brand` is an inline flex box; the `img` uses the token.
`index.html`: `<link rel="icon" type="image/svg+xml" href="/cd-logo.svg">`.
No ring was added: the grey rim `#e7e8e9` on the white bar is faint (about 1.2:1) but visible in the screenshots, and the blue stripes carry the shape; on the dark bar it reads clearly.
Say so if an audit disagrees (the fix would be a 1px `--line` ring).

**Tests.**
- `tests/client/logoAsset.test.ts` (4 tests): `<svg`, the view box, no `<image`/`data:`/raster `href`/`<script`/`<text`/foreignObject, three glyph paths, under 20 KB.
- `tests/e2e/logo.spec.ts` (5 tests per project, 10 total): logo visible, `alt=""`, natural width above 0, 36px; the hidden name in the bar, exactly once on the History route, no link or button in the brand; the favicon link; `/cd-logo.svg` 200 with `image/svg+xml`; no `securitypolicyviolation`; bar heights 56 (desktop) and 52 (phone); light and dark device, and the manual choice both ways.
- No old test read the brand text (the form company line in `timesheet.spec.ts` is unrelated), so no existing test was edited.

**Checks.**
- `typecheck` exit 0, `lint` exit 0, unit 87 files / 1869 tests passed.
- Full e2e (`npm run test:e2e`): 399 passed, 31 skipped, 0 failed (desktop 196 passed / 19 skipped; mobile 203 passed / 12 skipped); no ECONNRESET and no retry.
- Bar heights: 56px at 1280, 52px at 390 (60px with a received share, unchanged).
- Landing budgets at 390x844 (first day row bottom, tab bar top 788): 659.02, 757.97, 667.02, 765.97 (the same as before); the away state today 659.02 / 757.97 (the 777.5 / 785.5 first-window-day cases need that calendar day and were not reproducible today; the bar and the page above the row are unchanged).
- Privacy grep over the changed files and the evidence: no email or user-profile path found.
- `npm run verify` (SMOKE_PORT 48595, `DATA_DIR` and `DATABASE_PATH` in the task folder): exit 0.
- `npm run digest` (last): 38a2bb09b2b98f467f1966aa3524c463d7be366bd5c1c495cb71fefcca9d5369 (810 files).

**Evidence** (`handoff/delivery/evidence/WP5-UX2-T05/`): `trace-logo-script.txt`, `fidelity-script.txt`, `trace-result.txt`, `fidelity-result.txt`, `source-column-analysis.txt`, `stripe-fit.txt`, the three `logo-fidelity-*-synthetic.png`, four `logo-bar-*-synthetic.png`, `base.txt`, `typecheck.txt`, `lint.txt`, `unit-tests.txt`, `unit-logo-asset.txt`, `build.txt`, `e2e-logo.txt`, `e2e-full.txt`, `verify.txt`, `digest.txt`.

**Deviations.** Two shell commands wrote to `/dev/null` by mistake (one `tail ... > /dev/null`, one `cat ... > /dev/null`; no harm, no output used). The repository files changed: `src/client/public/cd-logo.svg`, `src/client/components/AppShell.tsx`, `src/client/index.html`, `src/client/styles.css`, `tests/client/logoAsset.test.ts`, `tests/e2e/logo.spec.ts`. No background task is running.
