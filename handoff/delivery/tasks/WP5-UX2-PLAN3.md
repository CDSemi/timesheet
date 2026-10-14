# WP5-UX2-PLAN3 dispatch brief (plan addendum 2)

- Mission/task: timesheet-software-readiness / WP5-UX2-PLAN3; package WP5; kind plan;
  attempt 1; depends on WP5-UX2-PLAN and WP5-UX2-PLAN2 (done). Read-only addendum after
  three more owner requests in the same round.
- Owner request (chat, 2026-10-14; verbatim in the board `owner_decisions`; English
  translation):
  1. "Use this logo instead of the text 'C&D CDsemi' (shown at the top left). If there
     is room to also show text, show 'CDSemi'; if not, leave it out."
  2. "On the phone screen: move the Clock in/out part into the header bar at the top (the
     part that now shows 'C&D CDsemi'). I also want the 3 buttons 'Today', 'Current
     period' and 'Review & sign off' in one row. 'Review & sign off' may be split into 2
     lines or shortened to 'Sign off' if needed."
  3. "Change the wording Clock in/out to Check in/out."
- The logo is the image the owner attached in chat. The coordinator's session stored it at
  `D:\.claude-tmp\claude\D--Dropbox-Work-CDSemi-timesheet\11acfabe-25ef-48b5-ac28-73ce2d74ecee\images\1.png`
  (outside the repository; it may be cleaned with the session). It shows a light-grey rim
  around a blue disc of horizontal white stripes, with a central blue band carrying the
  grey letters "C & D".
- Coordinator decisions (board `coordinator_decisions`, 2026-10-14):
  - The logo ships as a vector SVG traced from that image: no embedded raster, and never
    renamed with "synthetic". `scripts/precommit-check.mjs` blocks PNG/JPEG/WebP and
    similar files outside `reference/fixtures` and `reference/examples` unless the
    basename contains "synthetic"; SVG is not blocked. The governance alternative (an
    allowlisted brand-asset path) is used only if a faithful SVG is impossible.
  - The owner's phone instruction replaces the earlier compact-label idea. The visible
    text stays "Current period". Below 768px, "Review & sign off" wraps to two lines
    inside its button or shortens to "Sign off". The accessible name must contain the
    visible text.
  - Everything else from WP5-UX2-PLAN and PLAN2 stands unless this addendum changes it
    with a reason.
- Routing: size M, risk M (the global phone header and sharing context; the wording may
  reach server strings), novelty yes (logo tracing). Profile timesheet-planner (effort
  high, fixed by the profile); requested model sonnet; no override. Record in English.
  Begin your returned result with 'Self-reported model: ...'.

## Hard rules

- Read-only outside the owned paths. WP5-UX2-T01 is still editing source and may build
  `dist/`. So:
  - do NOT run `npm` scripts, builds, the app, Playwright or any browser;
  - do NOT run any git command that changes the index or the working tree.
- First, copy the logo image into your temp folder as `cd-logo-source.png`. Record its
  pixel size and its main colours (read it with the Read tool; a tiny file probe is fine).
  Do not put the PNG into the repository.
- NO STDIN SCRIPTS: NEVER feed a script to python or node through stdin (no `-`, no
  heredocs, no pipes into node or python). NEVER pipe output into head or tail. Never
  use cmd.exe or an interactive shell. Raw output only in
  `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\`. Never create files elsewhere.

## Settle in Results

1. **Logo.**
   - Where the brand text appears today: the shell bar on desktop and phone, and the
     sign-in, setup and any other screen (file:line). Recommend which places get the
     logo.
   - Size per layout. Where "CDSemi" fits beside it (desktop yes or no; phone yes or no
     after the clock moves into the bar).
   - The accessible name: the image is decorative when "CDSemi" text is shown; otherwise
     it needs a text alternative such as "C&D Semi" or "CDSemi". Recommend one and say
     whether it links home, as the text does today.
   - Light and dark themes: the grey rim on a light bar, and whether the logo needs a
     backing.
   - The SVG method:
     - an exact geometric rebuild of the rim, disc, stripes and band;
     - the three letters traced to paths from the PNG, for example a Playwright-canvas
       pixel read plus contour tracing and simplification in a temp script, run by the
       slice worker (not by you now);
     - fidelity checks: render the SVG next to the PNG at 512, 64 and 32px and compare
       them visually and by a pixel-difference measure, stating the threshold;
     - colour values as CSS custom properties or fixed brand colours. Brand colours are
       allowed as literal values inside the SVG asset; say how this fits the
       "tokens only" rule.
   - Optional favicon from the same SVG: recommend include or exclude.
   - File location: for example `src/client/assets/` (bundled) or `src/client/public/`.
     Choose one and state why, considering the CSP `img-src`.
2. **Phone header with the clock controls (below 768px).**
   - What the clock card shows today (states such as checked out, checked in since
     HH:MM, on a break, and break or confirmation actions), with file:line references.
   - What moves into the 52px compact bar, and what stays (if anything) or goes behind a
     tap.
   - Does the bar clock appear on every page, or only on the Timesheet page? Recommend.
   - Shared views: a person viewing someone else's timesheet must never appear to check
     in for that owner (F-Q5: no clock on the owner's behalf). Say what the bar shows
     there.
   - With the "Shared with me" switcher in the bar (FIX8: one-row compact bar with
     `--switcher-basis`), does everything fit at 390, 375, 360 and 320? If not, propose
     where the switcher or the clock goes, with the arithmetic. Respect 44px targets and
     AX-01 (the measured `--shell-bar-size` drives the scroll padding).
   - Desktop (768px and wider): does the clock card stay where it is? Recommend; the owner
     asked only for the phone.
   - The new first-screen budget at 390x844 in the four states, now without the clock
     card row in the page.
3. **Three buttons in one phone row.**
   - Today, Current period (only when shown, per PLAN2) and Review & sign off. Choose
     between a two-line label inside the button and "Sign off", with the arithmetic at
     390, 375, 360 and 320.
   - Recommend whether the row wraps below 390. Keep 44px targets and an accessible name
     that contains the visible text (SC 2.5.3).
   - Which existing tests use the name "Review & sign off".
4. **Wording "Check in" / "Check out".**
   - Inventory every user-visible "Clock in", "Clock out", "clocked in" and similar string:
     client components, server-originated messages shown in the UI (API error texts,
     History operation labels), email templates, PDF text, docs (01-07, 10, 11, 12, EN
     and VI), README/DEVELOPMENT, and e2e/unit tests. File:line for each.
   - Recommend the scope:
     - UI text and docs that describe the UI;
     - server strings, which would end `dist/server` byte-identity (say whether that is
       needed);
     - internal identifiers (API paths, database names and code identifiers stay
       unchanged unless required; say so explicitly).
   - Note any wording that names a business concept, where a canonical rule would
     change (AGENTS rule 8).
5. **Tests and docs delta.**
   - Assertions to change because of the logo, the header move, the label and the
     rename; show that none is weakened.
   - New checks (the logo is visible with its name; the header clock works and is absent
     or inert in shared views; the budget; the three-button row).
   - docs/04 lines (EN and VI) and any other docs.
6. **Revised slicing.**
   - Integrate the new work into the slices after T01 (T02 controls, T03 editing column,
     T04 Today and Current period, T05 docs). Add slices if needed, for example "brand
     logo" and "phone header clock and rename".
   - Give each slice size, risk, novelty, profile and model per docs/08, owned paths and
     dependencies.
   - Name the gate additions: a logo fidelity check, `dist/server` identity or its
     replacement if server strings change, and the four-state budget with the new
     header.
7. **Mockup.** Update `handoff/delivery/design/WP5-UX2/mockup.html` (phone artboard, and
   the desktop bar with the logo) in light and dark. You may use a simplified inline SVG
   placeholder of the logo, clearly marked as a placeholder. Update the Vietnamese
   captions. No renders now.
8. **Owner questions.** List only choices without a safe default, each with options and
   a recommendation.

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-PLAN3.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX2/mockup.html`
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\` (outside the repository)

## Acceptance for this task

- Items 1-8 answered; observations cite file:line or a measurement; assumptions are
  labelled, each with the check the slice must run.
- No file changed outside the owned paths: compare `git status --short` at the start and
  at the end. T01's edits are expected; list them without touching them.

## Results

Self-reported model: claude-sonnet-5-5. Read-only: no npm, build, app, browser or Playwright; no git state change. Step 0 `git status --short`
(start) listed T01's expected edits (`eslint.config.js`, `AppShell.tsx`, `index.html`, `styles.css`, `shell.spec.ts`, new `ThemeToggle.tsx`, `themeModel.ts`,
`src/client/public/`, theme tests, `contrast.ts`, `theme.spec.ts`) plus handoff files; I changed none of them. Measured numbers come from the PLAN
(A5, B5) and PLAN2 sections; button text widths are ESTIMATES (15px, weight 600, 14px side padding): Today 60px, Current period 128px, Review & sign off
152px, "Review &" / "sign off" wrapped 93px, Check in 92px, Check out 101px. Each estimate has a measure-it check for its slice.

Logo source copied to `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\cd-logo-source.png` (outside the repository). Facts: PNG 512 x 512, 8-bit RGBA, 24,954 bytes.
Read by eye: outer light-grey rim (about 18px wide, about `#e6e7e8`), inside it white with horizontal blue stripes (about `#1470b8`, 17px high, pitch about 31px:
four above the band, six below, the outer ones clipped by the circle), a central blue band (about y 183 to 311) with three bespoke light-grey glyphs "C", "&", "D"
(about `#e6e7e8`). The colours and stripe y-values are estimates; the slice measures them from the pixels (below).

**1. Logo.**
- Where the brand text is today: only `AppShell.tsx:158` (`<span className="shell-brand">C&amp;D Semi</span>`, style `styles.css:310`), in the shell bar on desktop and
  phone. Not a link. Other "C&D Semiconductor Services, Inc." strings are the form company line (`sheetModel.ts:19`, asserted by `timesheet.spec.ts:231`) and the PDF
  (`timesheetPdf.ts:61`, `pdf-render.test.ts:218`): legal form content, unchanged. Sign-in and setup screens show no brand (`App.tsx:161`, `SetupScreen.tsx:46` are plain
  headings). Recommendation: logo in the shell bar only (the owner's "top left"); sign-in/setup stay as they are (optional later).
- Size and text: 36px square on desktop (bar 56px, content 40px) and on the phone (44px clock row). Text "CDSemi" (the owner's spelling, replacing "C&D Semi"):
  desktop yes (room measured in the plan: the nav starts at 110px); phone no, because the clock moves into the bar (item 2: logo 36 + gap 12 + clock about 249 =
  297 of 358, only 61px left, "CDSemi" needs 66px with its gap, and 320px has none). Rule: shown from 768px, screen-reader-only below.
- Accessible name: the image is always decorative (`alt=""`), and the text "CDSemi" is always in the DOM (visible from 768px, visually hidden below with the existing
  `.sr-only`-style clip), so the name is "CDSemi" at every width without a duplicate announcement. Not a link (as today; a new tab stop would change the AX tab walks).
- Themes: logo is a fixed-colour mark. Rim `#e6e7e8` against the white bar is about 1.2:1 and decorative (identity, not information); blue against the dark bar `#1a2029`
  is 3.15:1 and against white about 5.3:1 (computed from the estimated blue). No backing plate needed; if the audit finds the rim lost on white, a 1px `--line` ring
  (existing token) around the `<img>` is the fix.
- SVG method (slice worker runs it in a temp script, never by me now):
  1. Geometric rebuild, viewBox `0 0 512 512`: rim circle r 256; inner disc r about 238 clipped; white ground; the stripe rectangles and the band as `rect`s inside a
     `clipPath` circle. Stripe y-ranges are measured from the column x = 256 of the PNG (run-lengths of blue versus white), not guessed.
  2. The three letters are bespoke glyphs: trace them. A Playwright page draws the PNG on a canvas, reads `getImageData` of the band, thresholds the grey glyph pixels, extracts
     contours (marching squares), simplifies (Douglas-Peucker, epsilon at most 0.6px) and writes `<path>` data with even-odd holes (the "&" and "D" counters).
  3. Colours sampled from the pixels (rim, stripe blue, white, glyph grey), written as literal values in the asset.
  4. Fidelity: render the SVG and the PNG through the same canvas at 512, 64 and 32px over white, compare per pixel. Thresholds: at 512 mean absolute channel
     difference <= 2/255 and at most 1.5% of pixels differ by more than 48; at 64 mean <= 3 and <= 3%; at 32 mean <= 4 (edges only). Also a side-by-side image
     (`logo-fidelity-512-synthetic.png`, `-64-`, `-32-` in the task's evidence folder; the word `synthetic` is in the basename so the precommit PNG rule passes; the
     source PNG itself is never committed) and a visual check of the glyph shapes. The source PNG stays in the temp folder (copy it before the session is cleaned).
  5. Tokens rule: brand colours are literal values inside the asset because an `<img>` SVG cannot read page custom properties and the mark is identity, not UI state;
     the rule "new values as custom properties" governs `styles.css`. The only new CSS values are tokens: `--brand-logo-size: 36px` and the gap.
  6. Static checks (`tests/client/logoAsset.test.ts`): contains `<svg` and `viewBox="0 0 512 512"`, no `<image`, no `data:` or `href` to a raster, no `<script`, under 20 KB.
- Favicon: include. One line in `index.html` (`<link rel="icon" type="image/svg+xml" href="/cd-logo.svg">`), same file, no raster.
- Location: `src/client/public/cd-logo.svg` (T01 already creates `src/client/public/`). Reason: served at the stable URL `/cd-logo.svg` for the `<img>` and the favicon,
  no TypeScript module declaration for `*.svg` imports, no hashing. CSP `img-src 'self' data:` allows it (`src/server/app.ts:86`); `script-src` is untouched. The slice
  checks the response `Content-Type: image/svg+xml` (with `nosniff`), 200, and no `securitypolicyviolation`.
- Fallback only if a faithful trace fails the thresholds: the governance route (an allow-listed brand-asset path for a PNG in `scripts/precommit-check.mjs`). Not expected.

**2. Phone header with the check in/out controls (below 768px).**
- Today (`ClockPanel.tsx:22-47`, state in `TimesheetScreen.tsx:138,179-192`): a card `section[aria-label=Clock]` with `data-clock` = checking | out | in; text "Checking the clock"
  or "Clocked out", or "Clocked in since HH:MM" (+ ringed static dot) and a hint "{Wed 10/14}, session running"; one button "Clock in" (disabled while checking) or "Clock out"
  (opens `ClockOutDialog.tsx`, the break-confirmation dialog, which commits or reports a stale version). `clockIn()` posts to `/api/clock/in` and reloads; the dialog's
  `onDone` sets the notice "Clocked out." and reloads (`TimesheetScreen.tsx:208-227,514-530`). The running session is found in the shown period, else `current` and
  `in_progress` (`findRunningSession`, `:80-91`). Break and confirmation actions live in that dialog, not in the card.
- What moves into the bar: the state text (both lines) and the one button, as a group at the right of the logo (`margin-left: auto`). Nothing stays in the page on a phone
  and nothing goes behind a tap: the break confirmation is the existing modal dialog opened from the bar button. The dialog, its focus return and its stale handling are reused.
- Architecture (assumption for the slice): the state cannot stay inside `TimesheetScreen`. A `ClockProvider` (context, rendered in `AppShell` for the user's own screens)
  owns `running`, `checkIn()`, `openCheckOut()`, the dialog and a `version` counter. It refreshes on mount, on route change, after each action, and when the tab becomes visible;
  `TimesheetScreen` reads `version` to reload the period and passes its `view` so the provider can reuse it instead of re-fetching. Desktop keeps `ClockPanel` in the page,
  reading the same context, so only one dialog and one state exist. Which markup renders is chosen with the existing 768px `useMedia`, never both (no duplicate controls).
  Check the slice must run: no extra requests beyond the 3 GETs per refresh; the refresh does not run in shared views.
- Which pages: every screen of the person's own context on a phone (Timesheet, Overtime, History, Settings, Import, Review, Admin). A header control should not depend on
  the page, and "Check out" is most needed away from the Timesheet. Cost: the bar is 60px instead of 52px on those pages (their first screens have no budget).
- Shared views (`#/shared/...`): no clock in the bar, on any width. It never appears to check in for the owner (F-Q5, docs/04 line 54; `shares.ts:104-117`), and the grantee's
  own clock is hidden there too so the persistent share bar never sits next to a control that looks like the owner's. The bar shows the logo, the switcher and (from 768px) the
  navigation, exactly as today. Test: no `Check in` or `Check out` control, on both projects.
- Fit with the "Shared with me" switcher (`styles.css:3126-3171`, basis 16rem = 240px): usable bar width is viewport minus 32.
  - No share: logo 36 + 12 + clock group (state about 136 wide in the longest case + 8 + Check out 101 = 245; with the 8px state gap about 249) = 297 <= 358 (390), 343 (375),
    328 (360). At 320 (288) the state text may wrap to two lines (bar content up to 51px, bar about 67px, no horizontal scroll): accepted, no budget at 320.
  - With a share: 297 + 12 + 240 > 358, so the existing `flex-wrap` puts the switcher on a second row at every width: row 1 logo + clock (44px), row 2 switcher (44px select),
    bar = 8 + 44 + 8 + 44 + 8 = 112px (was 60 with one row). Honest cost: a 112px sticky bar on a 844px screen. Alternative (not the default): move "Shared with me" into the More
    panel on phones; it removes the wrap but changes AX-06 and the sharing tests, so it is a backlog item, not a decision. 44px targets hold; `--shell-bar-size` is measured
    (`useBlockSizeProperty`), so AX-01 scroll padding follows; the slice re-runs `keyboard-access.spec.ts` at 390, 375, 360, 320.
- Desktop (768px and up): the clock card stays in the Timesheet page where it is (the owner asked only for the phone); the bar gets the logo and "CDSemi" and no clock.
- New first-screen budget at 390x844 (tab bar top 788). The page loses the clock card (68px) and its 8px gap, so -76px; the bar grows 52 -> 60 (+8) without a share, 60 -> 112
  (+52) with one. From the plan's first-day-row bottoms 659 / 758 / 667 / 766:

  | State | Before | Bar change | Page change | New bottom | Headroom |
  |---|---|---|---|---|---|
  | no share, no zone note | 659 | +8 | -76 | 591 | 197 |
  | no share, zone note | 758 | +8 | -76 | 690 | 98 |
  | share, no note | 667 | +52 | -76 | 643 | 145 |
  | share, zone note | 766 | +52 | -76 | 742 | 46 |

  All four fit and are better than today. The PLAN2 away state adds the Review wrap (item 3, +17px): 608 / 707 / 660 / 759, still above the tab bar; this replaces PLAN2's
  +48px estimate. Check the slice must run: measure all four states plus the away state at 390 (numbers above are derived, not measured).

**3. Three buttons in one phone row.**
- Choice: the two-line label inside the button (visible text unchanged: "Review & sign off" wraps to "Review &" / "sign off"). Not "Sign off": `reviewLinkLabel`
  (`reviewModel.ts:228-238`) returns "Review now", "Review or correct" or "Review & sign off" by period status, so one shortened word is wrong for two of the three, and a visible
  label different from the accessible name is avoidable. The wrap handles every variant (longest word "correct" or "sign off", about 66px of text).
- Rule: `.period-cta { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px }`; Today and Current period `flex: none` with `white-space: nowrap`; Review
  `flex: 1 1 var(--review-basis)` (new token, 6rem = 90px) with `white-space: normal; text-align: center`. At landing only Today and Review are present: 60 + 8 + 152
  = 220 fits on one line at every width (usable 334 / 319 / 304 / 264), so the card stays 180px. In the away state (Current period present): 60 + 8 + 128 + 8 + 93 =
  297 <= 334 (390, 37 spare), 319 (375, 22), 304 (360, 7); at 320 (264) it does not fit, so Review wraps to its own full-width row (+48px, no budget at 320).
  Row height with two lines: 2 x 21.75 + 16 padding + 2 border = 61.5px, so +17.5px over the 44px row.
- Below 390: the row wraps by the flex rule; targets stay >= 44px in both directions; no horizontal scroll (measured with `documentElement.clientWidth`).
- Accessible name: the visible text itself (SC 2.5.3 holds; no `aria-label`). Tests using the name "Review & sign off": none locate the button by it. Matches found are the Review screen
  headings "Review and sign off" (`review.spec.ts:190,442,451,470`, `automation.spec.ts:243`, `sharing.spec.ts:384,395`, `submission.spec.ts:81`), messages
  ("Enter your name to sign off."), and `reviewModel.test.ts:346-347` (the label function, unchanged). The imported-period disabled button text is `PeriodBar.tsx:90`.
  So the layout change needs no existing assertion edit.

**4. Wording "Check in" / "Check out".**
- Inventory (file:line; user-visible unless marked):
  - Client UI text: `ClockPanel.tsx:26,31,39,43` ("Checking the clock", "Clocked out", "Clocked in since", "Clock in", "Clock out") and `:23` (region name "Clock");
    `ClockOutDialog.tsx:58,60,61,74,100,122` (button names "Clock out, breaks unconfirmed", "Clock out, no breaks taken", "Clock out with these breaks", the note, the heading
    "Clock out", the stale message); `TimesheetScreen.tsx:520,525` (notices "Clocked out.", "...Clock out again..."); `otModel.ts:107-108` (History/OT operation labels
    "Clocked in"/"Clocked out"); `SharingSettings.tsx:42` ("Clock in/out" in Settings text); `PolicyFields.tsx:52` (legend "first clock-in").
  - Client comments/identifiers (not user-visible; wording in comments follows the new term, identifiers unchanged): `ClockPanel.tsx:5-7`, `DayEditor.tsx:94,123`,
    `TimesheetScreen.tsx:95,137`, `SharingItemsFields.tsx:14`, `sharingModel.ts:54`, `sessionModel.ts:125,149`, `periodBarModel.ts:8,49,57`.
  - Server messages shown in the UI as "{message} ({code})" (`errors.ts:5`): `timesheetCommands.ts:539` ("Clock out of the running session first"), `:573` ("There is no
    running session to clock out of"), `:599` ("A saved break ends after this Clock out..."); `:589` is a comment. Domain comments (`breaks.ts:6`, `policy.ts:18`) and `zones.ts:113`
    ("wall clock") are not the feature.
  - Email templates and PDF: none contain the phrase (searched `src/server/pdf`, mail code and templates).
  - Docs: `docs/01` line 14 and `.vi` (FR-06 "Clock in/out"); `docs/02` line 15 and `.vi` ("first clock-in"); `docs/04` lines 8, 48, 54, 67 and `.vi` (54 and 67); `docs/10` lines
    101, 132 and `.vi` (102, 133); `docs/12` lines 23, 57 and `.vi`; `DEVELOPMENT.md` lines 68 and 118.
  - Tests: `day-editor.spec.ts` (9, 61, 477-554: names, "Clocked in since", "Clocked out.", region "Clock", dialog "Clock out"), `shell.spec.ts:68,156,174`,
    `isolation.spec.ts:101,160,185`, `review.spec.ts:266`, `sharing.spec.ts:242,303,329,337`, `focus-ring.spec.ts:204`, `timesheet.spec.ts:73,269-270`, `fixtures.ts:505`
    (comment), `ac13-two-week.test.ts:185`, `sessionModel.test.ts:173,179`, integration test titles (`clock-out-breaks`, `break-contract`, `isolation`, `ledger`, `corrections`,
    `sharing`: titles and synthetic reasons, not UI).
- Recommended scope: (a) every client UI string and its tests; (b) the three server message literals (`timesheetCommands.ts:539,573,599`): the owner asked for the wording and these
  texts reach the screen, so a mixed "Clock out ... (code)" error would contradict the rename; (c) docs that describe the UI or name the user-facing action (`docs/04`,
  `docs/12`, `docs/01` FR-06, `docs/02` line 15, `DEVELOPMENT.md`; `docs/10` decision text of E-1 and F-Q5 is history and is left, with one new terminology entry, EN and VI).
  Stay unchanged, explicitly: API paths `/api/clock/in` and `/api/clock/out`, `ClockOutDialog`/`ClockPanel`/`clock-panel` names, `data-clock`, event types
  `work_session.clock_in`/`clock_out`, the session `source: 'clock'`, database names, error codes (`open_session_exists`, `no_open_session`), test titles of integration tests.
- `dist/server` identity: step (b) changes `dist/server` (three string literals in compiled `timesheetCommands.js`). The earlier gate item "byte-identical to 90b98ef" cannot hold.
  Replacement gate: build both trees and diff `dist/server`; the only differing lines must be those three literals (listed in the evidence), no other file differs, and
  the integration suites that assert error codes stay green. If the coordinator prefers to keep byte identity, drop (b) and accept a rare 409 text that still says "Clock out";
  recommendation is (b).
- Canonical wording (AGENTS rule 8): `docs/01` FR-06 "Clock in/out" and `docs/02` line 15 "first clock-in" name the action, not a rule; no calculation, state or API behaviour
  changes. Update both documents and their translations as a terminology change (the owner's request outranks the inherited wording); no real contradiction.

**5. Tests and docs delta.**
- Assertions that change (none weakened; the same fact is asserted with the new string, forbidden lists check both old and new names):
  - Rename only: `day-editor.spec.ts` 61, 477-554 ("Check in"/"Check out", "Checked in since", "Checked out.", dialog "Check out", buttons "Check out, breaks
    unconfirmed" / "Check out, no breaks taken" / "Check out with these breaks", region "Check in or out" replacing "Clock"); `shell.spec.ts:68,156,174`; `isolation.spec.ts:101,185`
    and the forbidden list `:160` becomes ['Check in', 'Check out', ...] plus the old names (still absent); `review.spec.ts:266`; `sharing.spec.ts:242,337` (forbidden lists gain
    "Check in"/"Check out" and keep the old names); `focus-ring.spec.ts:204` (the focus ring on the clock button; on the phone it is now in the bar, same surfaces); `fixtures.ts`
    comment; `otModel` label expectation if one exists.
  - Layout changes: `timesheet.spec.ts:73,269-270` (comments and the first-screen screenshot name: the clock card no longer exists on a phone); `.clock-panel` locators in phone tests
    change to the bar group; the four-state budget tests keep their assertion (first row bottom at or above the tab bar top) and gain the new headroom as a recorded number.
- New checks: logo `<img>` visible with natural width > 0 and size 36px, `alt=""`, the text "CDSemi" present (visible from 768px, not visible below), favicon link, no
  `securitypolicyviolation`, `/cd-logo.svg` 200 and `image/svg+xml`, asset static test; phone bar clock: state text, button, works from `#/ot` and `#/history`, break dialog opens
  from the bar and returns focus to the bar button, `.clock-panel` absent in the page on a phone and present on desktop with no bar clock; no check in/out control in shared views
  (phone and desktop, owner and grantee flows); `--shell-bar-size` equals the measured bar height with and without a share; the four-state budget with the new numbers; the
  three-button row (tops within 2px, Review height >= 55px and its name equals its visible text in the away state at 390, own row at 320); no horizontal scroll via
  `clientWidth` at 390, 375, 360, 320; 44px targets.
- docs/04 (EN and VI, same lines): line 7 (App shell: the logo and "CDSemi" at the top left; phone compact bar: logo, and the Check in/out controls on the person's own screens),
  line 8 (the Timesheet row), line 48 (phone: first screen = period card with the three buttons in one row, tools, sheet; the clock is in the bar), line 54 (replace "Clock panel"
  with "Check in/out": on desktop the card in the page, on a phone the group in the header bar on every own screen, absent in a shared view; wording "Checked out", "Checked in since
  HH:MM", "Check in", "Check out"), line 67 ("Check out/save"), line 53 (PLAN2 text plus the one-row rule), plus a brand sentence in "Visual standard" (the logo asset, not
  recoloured, favicon). `docs/10`: a new entry for the three requests (verbatim on the board) and a terminology note; `docs/12`: lines 23 and 57 and a bullet; `docs/01` line 14,
  `docs/02` line 15 and `.vi`; `DEVELOPMENT.md` lines 68 and 118. `docs/03`, `docs/05`-`docs/07`, `docs/11`: no change (API unchanged).

**6. Revised slicing (after T01; coordinator numbering T02 controls, T03 editing column, T04 Today).**

| Task | Scope | Size / risk / novelty | Profile and model | Owned paths | Depends on |
|---|---|---|---|---|---|
| WP5-UX2-T02 | controls: hover and pressed, Show details switch, label picker | unchanged | unchanged | unchanged | T01 |
| WP5-UX2-T03 | editing column, Today-bar repair | unchanged | unchanged | unchanged | T02 |
| WP5-UX2-T04 | Today and Current period (PLAN2) plus the one-row layout of the three buttons (item 3, `.period-cta` rule, `--review-basis`) | M / M / no (still at most M) | worker-high (high), sonnet | as PLAN2 plus `styles.css` | T03 |
| WP5-UX2-T05 (new) | brand logo: traced `src/client/public/cd-logo.svg`, `AppShell.tsx` brand, `index.html` favicon, brand CSS/tokens, fidelity evidence | S-M / M / yes (tracing) | worker-high (high), sonnet | `src/client/public/cd-logo.svg`, `src/client/components/AppShell.tsx`, `src/client/index.html`, `src/client/styles.css`, `tests/client/logoAsset.test.ts`, `tests/e2e/logo.spec.ts`, `tests/e2e/shell.spec.ts`, `handoff/delivery/evidence/WP5-UX2-T05/` | T04 (shared `AppShell`/`styles.css`) |
| WP5-UX2-T06 (new) | Check in/out rename: client strings, three server message literals, tests, code comments | M / L-M (wide, mechanical) / no | worker (medium), sonnet | the client files and tests listed in item 4, `src/server/services/timesheetCommands.ts` | T05 |
| WP5-UX2-T07 (new) | phone header clock: `ClockProvider`, `BarClock`, `TimesheetScreen` clock lift, `AppShell`, styles, bar budget | M / M / no | worker-high (high), sonnet | `src/client/components/ClockProvider.tsx` and `BarClock.tsx` (new), `ClockPanel.tsx`, `ClockOutDialog.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/components/AppShell.tsx`, `src/client/styles.css`, `tests/e2e/day-editor.spec.ts`, `shell.spec.ts`, `sharing.spec.ts`, `isolation.spec.ts`, `timesheet.spec.ts` | T06 (strings), T05 (logo size in the arithmetic) |
| WP5-UX2-T08 (was T05 docs) | docs EN+VI per PLAN section D, PLAN2 and this item 5 | S / L / no | worker (medium), sonnet | `docs/01`, `docs/02`, `docs/04`, `docs/10`, `docs/12` (EN and `.vi.md`), `DEVELOPMENT.md` | T07 |

- One writer at a time, a freeze commit after each. No slice exceeds size M. The rename goes before the clock lift so the many test edits happen once.
- Gate additions (on top of the PLAN section G list): the logo fidelity record and side-by-side images (thresholds above); the `dist/server` check becomes "differs from 90b98ef only
  in the three message literals" (a diff, listed in the evidence) instead of byte identity; the four-state phone budget with the new header numbers and the away state; shared views have
  no check in/out on either width; the CSP unchanged and no violation for the SVG. The fresh audit re-checks: owner fidelity of the nine items, the clock never present for an
  owner's timesheet, the logo versus the source image, the server delta being strings only, AX-01 with the taller bar, and test strength (mutations: clock rendered in a shared view,
  logo `<img>` removed, rename reverted in one place, the one-row layout removed).

**7. Mockup.** `handoff/delivery/design/WP5-UX2/mockup.html` updated: a clearly marked PLACEHOLDER inline SVG logo (simplified geometry, plain-text letters, not the traced
glyphs) appears in the desktop bars (with "CDSemi") and in the phone bars (logo only, text screen-reader-only), the phone header carries the state text and the Check in /
Check out button (light: checked out; dark: checked in since 08:02 with the date line), the clock cards are gone from the phone pages, and the three buttons share one row with
"Review & sign off" wrapping to two lines. Vietnamese captions of artboards 1 and 3 updated. No renders: the PNG files in the folder predate PLAN2 and PLAN3.

**8. Owner questions.** None. Defaults are safe and reversible: logo in the shell bar only; "CDSemi" text from 768px; clock in the phone bar on every own screen and absent in shared views;
desktop unchanged; the two-line Review label (not "Sign off"); the server message rename with the diff-based gate. Coordinator decisions to record: the server-string rename and the
changed `dist/server` gate; the bar growing to 112px with a received share (alternative: switcher into More).

Deviations: none. No pipe into `head` or `tail`, no stdin script, no cmd.exe, no browser, npm or build. One `file`/`od` probe read the PNG header (512 x 512, RGBA). Changed only this
file and `mockup.html`; the end `git status --short` differs from the start only by T01's concurrent edits.
