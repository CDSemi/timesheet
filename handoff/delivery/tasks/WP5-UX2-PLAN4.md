# WP5-UX2-PLAN4 dispatch brief (plan addendum 3)

- Mission/task: timesheet-software-readiness / WP5-UX2-PLAN4; package WP5; kind plan;
  attempt 1; depends on WP5-UX2-PLAN3 (done). Read-only addendum after two more owner
  requests in UI change round 2.
- Owner request (chat, 2026-10-14; verbatim in the board `owner_decisions`; English
  translation):
  1. "Replace the text 'CDSemi' in the title bar with a two-line presentation like the
     image, using the colours and the font in the image. The logo is on the left and the
     text on the right, instead of the logo above and the text below."
  2. "Remove the text 'C&D Semiconductor Services, Inc.' from the timesheet part, because
     the top bar already shows it."
- Inputs (outside the repository; copy both into your temp folder first):
  - the owner's image:
    `D:\.claude-tmp\claude\D--Dropbox-Work-CDSemi-timesheet\11acfabe-25ef-48b5-ac28-73ce2d74ecee\images\2.png`.
    It shows the C&D logo above a two-line blue wordmark, "SEMICONDUCTOR" over
    "SERVICES, INC.";
  - the owner's font: `D:\Dropbox\Working.CDSemi\App.Cluster\ClusterPro\ClusterPro\CDSemiFont.ttf`.
- Coordinator decisions (board `coordinator_decisions`, 2026-10-14):
  - Both items go into the brand slice WP5-UX2-T05 (with the logo of PLAN3).
  - The font file is NEVER committed (the repository is public; its licence is unknown).
    The wordmark is rendered as vector outlines generated from the TTF.
  - The PDF keeps its company line (`timesheetPdf.ts:61`). Only the on-screen sheet loses
    it.
- Routing: size S, risk L, novelty yes (font outlines). Profile timesheet-planner (effort
  high, fixed by the profile); requested model sonnet; no override. Record in English.
  Begin your returned result with 'Self-reported model: ...'.

## Hard rules

- Read-only outside the owned paths. WP5-UX2-T02 is editing source and may build `dist/`
  and run Playwright. So:
  - do NOT run `npm` scripts, builds, the app, Playwright or any browser;
  - do NOT run any git command that changes the index or the working tree.
- A small Node probe file in your temp folder, run with Node 24 by its file path, is
  allowed (for example to read the TTF name table, or the PNG colours with a zero-
  dependency PNG decoder written with Node's built-in `zlib`). Use only modules already
  installed or built into Node; install nothing.
- NO STDIN SCRIPTS: NEVER feed a script to python or node through stdin (no `-`, no
  heredocs, no pipes into node or python). NEVER pipe output into head or tail. Never
  use cmd.exe or an interactive shell. Raw output only in
  `D:\.claude-tmp\timesheet\WP5-UX2-PLAN4\`. Never create files elsewhere.

## Settle in Results

1. **Font facts.**
   - From the TTF name table: family, subfamily, full name, version, copyright, trademark,
     manufacturer or vendor, licence description and URL.
   - The OS/2 `fsType` embedding bits.
   - Whether the glyphs needed exist: uppercase S E M I C O N D U T R V , and the period.
   - Recommendation: outlines only (the default) or, if the licence clearly allows web
     redistribution, still outlines (state why).
2. **Wordmark design.**
   - Line texts exactly as in the image (letter case, comma, period).
   - Relative sizes and letter-spacing measured from the image: line 2 is spread to the
     width of line 1, as in the image.
   - The colours sampled from the image pixels.
   - Placement: the logo (36px, PLAN3) on the left and the two lines on the right,
     vertically centred in the 56px desktop bar. Give the total width.
   - Show it from which width? The bar must keep its navigation, the sharing switcher and
     the Dark mode toggle at 768-1279px. Measure from the plan numbers: the nav started at
     110px with the old text brand. Recommend a breakpoint below which only the logo
     shows. On phones the logo shows alone (the bar holds the clock, PLAN3).
3. **Themes.**
   - On the dark bar the brand blue is weak. Logotypes are exempt from SC 1.4.3, but the
     owner must be able to read it.
   - Choose:
     - the brand colours in both themes;
     - a lighter brand tint in dark;
     - or a backing.
   - Recommend one. Note that this decides between an `<img>` SVG (fixed colours) and an
     inline SVG component whose fills use CSS custom properties.
4. **Accessible name and markup.**
   - The name of the brand group is "C&D Semiconductor Services, Inc." (or recommend
     another). Exactly one announcement: the logo and outline images are decorative, and
     one text alternative is present at every width.
   - Not a link, as today.
5. **Outline method and fidelity.**
   - How the slice worker turns the two lines into SVG paths from the TTF. For example a
     zero-dependency glyph-outline reader for TrueType `glyf` quadratic contours, or a
     dependency already in `node_modules` (fontkit is installed for the PDF; confirm
     the version and say whether its glyph path API is used without adding a
     dependency).
   - Kerning and letter-spacing.
   - Path simplification.
   - The file location: one combined brand SVG with the logo and the wordmark, or a
     separate wordmark SVG/component. Recommend one.
   - The check that the outline text matches the image: a side-by-side
     `-synthetic.png` evidence render, and a size limit, for example under 30 KB.
6. **Company line removal.**
   - Every on-screen place that shows "C&D Semiconductor Services, Inc.": the Timesheet
     sheet header, the Review sheet, others (file:line).
   - What else in that header block stays.
   - The tests that assert it, for example `timesheet.spec.ts:231`. How they change
     without weakening: assert the absence on screen, and keep the PDF assertion
     `pdf-render.test.ts:218` unchanged.
   - Any docs/04 or docs/10 text (for example the Excel layout map of round 1) that
     names the company line.
7. **Slice delta.** The revised WP5-UX2-T05 row: scope, owned paths, size and risk (still
   at most M?), tests to add, evidence. The docs lines for T08 (EN and VI).
8. **Mockup.** Update `handoff/delivery/design/WP5-UX2/mockup.html` desktop bars (light and
   dark) with a marked placeholder of the logo plus two-line wordmark (plain text in a
   similar style is fine for the placeholder). Remove the company line from the sheet
   header there if shown. Update the Vietnamese captions. No renders.
9. **Owner questions.** Only choices without a safe default, each with options and a
   recommendation.

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-PLAN4.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX2/mockup.html`
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX2-PLAN4\` (outside the repository)

## Acceptance for this task

- Items 1-9 answered; observations cite file:line or a measurement; assumptions are
  labelled, each with the check the slice must run.
- No file changed outside the owned paths: compare `git status --short` at the start and
  at the end. T02's edits are expected; list them without touching them.

## Results

Self-reported model: claude-sonnet-5-5. Read-only: no npm, build, app, browser or Playwright, no git state change. Two probe FILES in the temp folder, run with Node 24 by
path (`probe-font.mjs`, `probe-png.mjs`, `probe2.mjs`; built-in modules plus the installed `@pdf-lib/fontkit`; no install). Step 0 `git status --short` listed T01/T02's
expected source edits and handoff files; I changed none of them. Inputs copied to `D:\.claude-tmp\timesheet\WP5-UX2-PLAN4\`: `wordmark-source.png`, `CDSemiFont.ttf`
(neither goes into the repository).

**Correction to the brief's reading of the image (measured).** `2.png` is 131 x 90 px (16-bit RGBA, low resolution, soft drop shadows). Line 1 is NOT all capitals: it is
"Semiconductor", a tall "S" (rows 62-76, about 14px) followed by letters about 10.5px high. The font draws its lowercase letters as small capitals (glyph heights below), so
typing "Semiconductor" in this font reproduces the image exactly; typing "SEMICONDUCTOR" would be 26% wider with all tall capitals. Line 2 is "SERVICES, INC." in a dark
grey (not blue), letters about 5px high with very wide tracking, centred under line 1. Enlargement: `wordmark-8x.png` in the temp folder.

**1. Font facts (TTF name table, `font-facts.json`).**
- Family "VNI-Revue", subfamily "Bold", full name "VNI-Revue-Bold", unique id "VNI:VNI-Revue-Bold", version "1.0 Tue Jan 18 17:51:32 1994", PostScript name "VNI-Revue-Bold".
- Copyright (name id 0): "Copyright (c) 1991 VNI All Rights Reserved." There is no trademark, manufacturer, designer, licence description or licence URL record (ids 7 to 14 absent).
- OS/2: version 0, `fsType` all embedding restriction bits clear (no no-embedding, preview-only, editable-only, no-subsetting or bitmap-only flag), weight 700, units per em 1000,
  226 glyphs, tables glyf/loca/cmap/name/OS/2 (TrueType quadratic outlines, no GPOS, no kern, no GSUB).
- Coverage: every needed glyph exists: S E M I C O N D U T R V, space, comma, period, and also &; the lowercase s e m i c o n d u t r v exist too.
  Glyph heights (units): S 818, E 818, M 818, I 818; e 618, m 604, s 604 (small capitals; i has a dot at 818); comma 182 above to -96 below; period 184.
- Recommendation: outlines only, never the font file, even though `fsType` is 0. `fsType` is a technical embedding flag, not a licence; the copyright line is "All Rights Reserved" by
  VNI and the repository is public, so the font file (and any `@font-face`, which the CSP also forbids) stays out. Outlines of the 21 distinct letters needed are logo artwork for the
  company's own brand, not a font; this is the recommended default, with a licence confirmation asked of the owner (item 9). No glyph beyond the two texts is exported.

**2. Wordmark design (measured on the 131 x 90 image; ink extents).**
- Texts: line 1 "Semiconductor" (typed with capital S then lowercase, small capitals by the font); line 2 "SERVICES, INC." (capitals, comma and period as printed, one space after the comma).
- Image geometry (px of the image): line 1 ink x 4-123 (119 wide), S height 14.5 incl. blur, small caps 10.5; line 2 ink x 15-113 (98 wide), letters about 5 high, centred under line 1
  (centres 63.5 and 64). So line 2 is NOT spread to the full width of line 1: it is 82% of it. Gap between baselines of line 1 and the top of line 2 about 3.5px (0.27 of the S height).
- From the font: line 1 natural advance 7.482 em (S 0.614 ...), ink about 7.43 em, S height 0.818 em, so 119px / 7.43 em gives a size of about 16px at the image's scale (S 13.1px, the image shows
  14.5 with blur). Line 2 caps 0.818 em: 5px / 0.818 gives about 6px, ratio line 2 to line 1 about 0.34 to 0.35. Natural advance of "SERVICES, INC." 7.978 em.
- On screen (CSS px; tokens `--wordmark-size: 20px`, `--wordmark-sub-size: 7px` kept at the measured 0.35 ratio; below about 7px line 2 would be unreadable, so line 1 is sized up
  from the image's 16px to 20px): line 1 cap height 16.4px, ink width about 149px; line 2 size 7px, cap height 5.7px, letter-spacing about 5.1px (0.73 em: (0.82 x 149 - 7.978 x 7) / 13 gaps),
  ink width about 122px, centred under line 1; line gap 4px. Wordmark box about 150 x 27px. Tracking of line 1: 0 (no kerning tables in this font; the image shows tight tracking).
- Colours sampled from the pixels (estimates, one antialiased 131px source; the slice re-samples the thickest strokes at 8x): line 1 blue about `#006bbb` (observed 0,110,188 / 0,106,183 /
  0,109,187; mean 0,107,187); line 2 grey about `#4c4f57` (darkest observed 76,79,87; other pixels lighter from antialiasing). Contrast of these against white: 5.5:1 and 8.2:1.
- Placement: logo (36px, PLAN3) at the left, 10px gap, the wordmark at the right, vertically centred (wordmark 27px high against the 36px logo and the 40px content of the 56px bar). Total brand
  width 36 + 10 + 150 = 196px (old text brand about 70px: nav started at 110px, measured; it starts at 16 + 196 + 24 = 236px now).
- Breakpoint (from the measured bar: nav links end at about 438px, the user group is 223px wide at 1041-1264 plus the Dark mode toggle about 130px and a 12px gap): no share needs
  16 + 196 + 24 + 330 + 24 + 353 + 16 = 959px; with the "Shared with me" switcher (about 260px + 24px) 1243px. Recommendation: show the wordmark from 1280px (the e2e desktop viewport; it
  fits with about 37px to spare with a share, ASSUMPTION); below 1280px and on phones only the logo shows. Check the slice must run: measure the desktop bar at 1280 with and without a share and
  with the longest seeded display name; if the bar wraps (height above 56px without a share), raise the breakpoint to the smallest width that keeps one row (for example 1366px).

**3. Themes: choose a lighter tint in dark, inline SVG for the wordmark.**
- On the dark bar `--card #1a2029` the sampled blue is 3.0:1 and the sampled grey 2.0:1 (computed with the WCAG formula): line 2 would be nearly invisible. Logotypes are exempt from SC 1.4.3,
  but the owner must read it.
- Recommended: brand colours in the light theme (exact), the lighter tints in the dark theme: line 1 `var(--accent)` (#6ea8ff, 6.79:1 on the bar), line 2 `var(--muted)` (#9aa5b4, 6.56:1). New tokens
  `--wordmark-main` and `--wordmark-sub` in `:root` (`#006bbb`, `#4c4f57`) and in BOTH dark sets of T01 (the media set and `[data-theme='dark']`, covered by the parity test). Rejected: a white backing plate
  (a bright block in the dark bar, 215 x 44px) and fixed brand colours on dark (unreadable second line).
- Consequence: the wordmark is an inline SVG component (`BrandWordmark.tsx`) whose two `<path>` elements take their fill from CSS classes (`.wordmark-main { fill: var(--wordmark-main) }`, no inline
  style, no `fill="var()"`), so it follows the manual theme override. The logo disc stays a fixed-colour `<img src="/cd-logo.svg">` (blue 3.15:1 on the dark bar, light rim; unchanged from PLAN3).
  The dark tint is a visible choice for the owner (item 9, non-blocking).

**4. Accessible name and markup.**
- Group name "C&D Semiconductor Services, Inc." (the company's name; PLAN3's "CDSemi" text is replaced). Markup: `<span class="shell-brand"><img src="/cd-logo.svg" alt="" width="36" height="36">
  <svg class="wordmark" aria-hidden="true" focusable="false">...</svg><span class="sr-only">C&amp;D Semiconductor Services, Inc.</span></span>`. The two graphics are decorative at every width and the one
  text alternative is always in the DOM (visually hidden), so there is exactly one announcement and the name is the same on a phone where only the logo shows. Not a link, as today.
- The one on-screen text of the company name is therefore the visually hidden one; `getByText('C&D Semiconductor Services, Inc.')` finds exactly one element in the whole page.

**5. Outline method and fidelity.**
- Method (a temp script run by the slice worker; not committed, because it names the font path; a masked copy goes to the evidence folder as `.txt`): `@pdf-lib/fontkit` 1.1.1 is already a
  direct dependency (`package.json:32`, used by `src/server/pdf/timesheetPdf.ts`; confirmed `node_modules/@pdf-lib/fontkit/package.json` version 1.1.1; the plain `fontkit` package is NOT installed).
  Use its glyph path API without adding a dependency: `fontkit.create(buffer)`, `font.layout(text)` (glyph run with `positions[i].xAdvance`), `glyph.path.commands` (moveTo, lineTo, quadraticCurveTo,
  closePath) and `glyph.path.toSVG()`. I verified `create`, `layout`, `getGlyph`, `bbox` and `hasGlyphForCodePoint` run on this TTF (`probe-font.mjs`, `probe2.mjs`). Per glyph: scale
  size / 1000, flip y about the baseline, add the pen x and the tracking, join into one `d` string per line with 2-decimal numbers. TrueType winding gives correct counters with the default fill rule.
- Kerning: none exists in the font (no GPOS or kern table), so the advances are used as they are; letter-spacing is set explicitly (line 1: 0, line 2: 0.73 em, last letter's trailing space removed).
- Simplification: none geometric (the contours are already quadratic and tiny; 13 + 14 glyphs); rounding to 2 decimals; expected under 8 KB of path data.
- Location: no separate wordmark file; the two paths live in `src/client/components/BrandWordmark.tsx` (one inline SVG, themeable). The logo stays in `src/client/public/cd-logo.svg` (PLAN3). A combined
  SVG file is rejected: fixed colours cannot follow the theme.
- Fidelity check (slice evidence): (1) `wordmark-fidelity-synthetic.png`: the owner's crop enlarged 6x beside the SVG rendered at the same width, in the light theme and the dark theme; (2) numeric
  checks on the render: line 1 width over S height within 8% of the image (8.8 corrected, measured 119 / 13.5), line 2 width over line 1 width 0.82 +/- 0.03, line 2 cap height over line 1 cap height
  0.34 +/- 0.05, both lines centred within 1px; (3) downscale the render to the image's 131px scale and compare luminance inside the text boxes against the image: mean absolute difference at most
  25/255 (the source has blur and a shadow, so a tight pixel bound would be meaningless); (4) colours equal the sampled tokens; (5) size limits: `BrandWordmark.tsx` path data under 12 KB, `cd-logo.svg`
  under 20 KB, all brand assets under 30 KB. Static guards (`tests/client/wordmarkAsset.test.ts`): no `<text>`, no `font-family`, no `@font-face` anywhere under `src`, no `.ttf` / `.otf` / `.woff*` file in the repository
  (`git ls-files`), no raster reference.

**6. Company line removal (on-screen only).**
- Places: `sheetModel.ts:19` (`SHEET_COMPANY`), rendered at `TimesheetSheet.tsx:252` (the Timesheet sheet header) and `TimesheetSheet.tsx:329` (the Review sheet "What you sign", the same header);
  CSS `styles.css:1411` and `:1973` (`.company`, the second one in the narrow override), and `.form-brand` at `:1950`. Nowhere else on screen (Settings, History, the shared screens use no company line).
- What stays in the header block: `.form-brand` keeps the form title (`SHEET_TITLE`, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES") and the fields Employee, Payroll Date and Period. Remove `SHEET_COMPANY`
  from `sheetModel.ts`, the two `<div className="company">` lines and the two `.company` rules; the header layout (title left, fields right) is unchanged. The Review sheet loses it too (it sits under the same top bar; recommended
  for consistency; the owner asked for "the timesheet part").
- The PDF keeps it: `timesheetPdf.ts:61` and `pdf-render.test.ts:218` are unchanged.
- Tests: `timesheet.spec.ts:231` (`toContainText('C&D Semiconductor Services, Inc.')`) becomes a stronger check: `not.toContainText` on the form article, `.company` count 0, the form still contains the title and
  "Employee:", "Payroll Date:", "Period:", and the page has exactly one occurrence of the company name (the visually hidden one in the bar). The Review sheet gets the same absence assertion in `review.spec.ts`
  (where the Review sheet is asserted). Nothing is weakened: the old fact is replaced by its explicit opposite plus the remaining header facts.
- Docs: `docs/04` line 41 (EN and VI): "The header block carries the company, the title ..." becomes "The header block carries the title, "Employee:", "Payroll Date:" and "Period:"; the company name is in the top
  bar and is not repeated on the sheet (the PDF keeps its company header, line 88)". `docs/04` line 7 (App shell): the logo with the two-line wordmark. `docs/10`: one entry in "Owner decisions, 2026-10-14"
  for these two requests (the round-1 layout map E-1 names the Excel rows, not the company line, so it stays). `docs/12` line 21 ("the form header, ...") stays true; add the brand bullet. `docs/04` line 88 (PDF)
  unchanged.

**7. Slice delta: revised WP5-UX2-T05 (brand).**
- Scope: logo asset and favicon (PLAN3), the two-line outline wordmark, brand tokens (light and both dark sets), the shell brand markup and breakpoint, and the on-screen company-line removal.
- Owned paths: `src/client/public/cd-logo.svg`, `src/client/components/BrandWordmark.tsx` (new), `src/client/components/AppShell.tsx`, `src/client/index.html`, `src/client/styles.css`,
  `src/client/components/sheetModel.ts`, `src/client/components/TimesheetSheet.tsx`, `tests/client/logoAsset.test.ts`, `tests/client/wordmarkAsset.test.ts`, `tests/e2e/logo.spec.ts` (new),
  `tests/e2e/shell.spec.ts`, `tests/e2e/timesheet.spec.ts` (line 231), `tests/e2e/review.spec.ts` (absence), `handoff/delivery/evidence/WP5-UX2-T05/` (fidelity PNGs named `*-synthetic.png`, the masked generator `.txt`,
  the measured numbers).
- Size M (still at most M: one traced logo, one outlined wordmark, a small deletion), risk M (font licence caution, outline fidelity, bar width at 1280), novelty yes, profile worker-high (high), sonnet.
  Suggested split if it runs long: T05a logo plus favicon (PLAN3) and T05b wordmark plus company-line removal.
- Tests to add: logo and wordmark visible at 1280 (wordmark width about 150px, two lines, logo 36px, bar 56px, no wrap) with and without a share; wordmark absent below 1280 and on phones (logo only);
  the single announcement (`.sr-only` company name present, graphics `aria-hidden`/`alt=""`); light, dark and manual override colours of the two wordmark lines (>= 4.5:1 on the bar); CSP clean; the static guards; the
  company-line absence on the Timesheet and Review sheets and the PDF assertion unchanged; the dark parity test passes with the two new tokens.
- docs for T08 (EN and VI): line 7, line 41, a brand sentence in "Visual standard" (logo and wordmark are brand artwork, not recoloured except the documented dark tints), docs/10 entry, docs/12 bullet.
- Gate addition: the fidelity record, `git ls-files` shows no font file, the bar at 1280 with a share stays one row (or the raised breakpoint is recorded).

**8. Mockup.** `handoff/delivery/design/WP5-UX2/mockup.html` updated: the desktop bars (light and dark) show the placeholder logo with a PLACEHOLDER two-line wordmark ("Semiconductor" in capital S plus small capitals,
"SERVICES, INC." spaced below, in the sampled blue and grey, dark-theme tints in the dark frame); the phone bars show the logo only; the company line is removed from the desktop sheet header; the visually hidden full name is present
once. Vietnamese captions of artboards 1 and 3 updated. No renders (the PNGs predate PLAN2 to PLAN4).

**9. Owner questions (non-blocking; each has a safe default).**
- Q-1 (font licence): the font is "VNI-Revue Bold", "Copyright (c) 1991 VNI All Rights Reserved.", with no licence text; the repository is public. Options: (a) publish only vector outlines of the 21 letters as the
  company's logo artwork, not the font file (recommended, as decided); (b) keep the wordmark outlines out of the public repository (needs a private asset path and a governance exception); (c) do not use the font, use a
  system bold face. Recommendation (a), with the owner confirming that the company may use this font for its own logo.
- Q-2 (dark theme tint): (a) lighter blue and grey in the dark theme so the wordmark stays readable (recommended), (b) exact brand colours (second line about 2.0:1, hard to read), (c) exact colours on a white plate.

Deviations: none. No pipe into head or tail, no stdin script, no cmd.exe, no browser, npm or build. I read the PNG and the TTF with Node probe files only. Changed only this file and `mockup.html` (plus files in the temp folder).
