# WP5 UI change round 3, area A recheck on ceb86b6 after FIX3 (WP5-UX3-AUDIT-A2)

[Tiếng Việt](WP5_UX3_REVIEW_A2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 3, recheck of area A after
  WP5-UX3-FIX3 (the fixes for F-UX3A-01..06 of WP5-UX3-AUDIT-A) and the passed regate WP5-UX3-REGATE2 (attempt 2); task
  WP5-UX3-AUDIT-A2, attempt 1, 2026-10-19 from 21:52Z to about 23:25Z (14:52 to about 16:25 in
  America/Los_Angeles; displayed period 10/12-10/25/2026, which contains today, outside the five window days). Reviewer
  self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside).
  The strongest author model on the board is `claude-opus-5-5` (round-3 planners, T06, T08 and FIX1; FIX3 and GOV2 are
  `claude-sonnet-5-5`), so the reviewer is not weaker. I authored no WP5-UX3 task and I am not the first-pass area-A auditor
  (agent `a86e1ea01994c05f3`). The area-B recheck ran in parallel on the same machine (its folder showed file activity at
  every load sample, `load-context.txt`); every timing below carries that context.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (the WP5-UX3-GOV2-FREEZE commit, REGATE2's `freeze_commit`; outside `handoff/`
  it adds only AGENTS.md and AGENTS.vi.md to the FIX3 freeze a78ada5). HEAD = origin/main = that commit before and after; 0
  non-handoff status lines before and after. Digest `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833
  files, `handoff/` excluded, recorded first (21:54:01Z) and last (23:17:11Z), each time in three equal forms: a
  clean `git archive` export with no `.git` folder hashed with `git hash-object --no-filters`, the `git ls-tree` form (its
  sorted list byte-identical to the export's) and `npm run digest` in the repository. Source complete: `npm ci` exit 0 in
  three exports.
- **Decision: FIX REQUIRED.**
  - Three findings, one Medium and two Low (section "Findings"): on a phone-width window the More panel stays open after
    keyboard focus leaves it, so 12 of the 14 Category pickers then take focus entirely hidden behind it and Escape from the
    page does not close it (01, pre-existing since round 3, WCAG 2.2 SC 2.4.11); two of FIX3's four focus-under-hover rules
    (button links, phone tabs) can be removed without any test failing (02, test strength); the Sign out entry starts 3px to the
    right of every other entry (03, REGATE2 observation 1).
  - F-UX3A-01, 02, 03, 05 and 06 are closed by my own measurements on the build of the target; F-UX3A-04 is closed for what it
    named (the icon gap and the vertical alignment); its remaining horizontal offset is finding 03.
  - REGATE2's observations: 1 (Sign out 3px further right) is finding 03; 2 (the away first screen 2.2px lower) and 3 (docs/10
    line 240 names the FIX2 build) are risks, not defects.
  - DPR 2 seams of a lifted run at 1440, 1445, 1367 and 1601, light and dark: no seam, gap or notch, no shadow on a lifted
    neighbour; numbers equal to the first pass (light worst 2.8 and 3.0/255 under the inner joins; dark 8.4-9.5/255 in the
    one-device-pixel ring row, risk R3 unchanged).
  - Mutants: 13 of my own, 10 caught, 3 survive: the button-link and the phone-tab focus-under-hover rules (finding 02) and a
    hover rule gated by `(hover: hover), (pointer: coarse)` (the hover scan's textual limit, risk R-A2-1). The hover scan is not
    vacuous; `surviveStall` retries only its own poll timeouts and a transition that never settles still fails all 8 contrast
    tests after three tries.
  - Mandatory checks: typecheck 0, lint 0 (no deprecation line), `npm test` twice 0 and 0 (94 files, 2141 tests each), build 0
    (main `index-BJ9ZzqiL.js` 486.81 kB, no chunk-size advisory), AC-13 0 (1/1); FULL e2e on the real clock: run 1 644 passed
    and 1 failed by a network error (`read ECONNRESET`); run 2 (the one allowed rerun) exit 0, 645 passed, 67 skipped, 0
    failed (desktop 326/30, mobile 319/37).

## Scope actually inspected and executed

1. Read as claims, not proof: the brief, AGENTS.md from disk at ceb86b6 (UI section "Frontend and UI/UX standards"), docs/08
   "Gates and independent audit", the first area-A review WP5_UX3_REVIEW_A (findings F-UX3A-01..06, risks R1-R9, item
   verdicts) and its evidence and probes, WP5-UX3-FIX3 (Results), WP5-UX3-REGATE2 (Results, attempt 2) and its evidence, the
   coordinator decisions of 2026-10-16 and 2026-10-19 on the board, docs/04 (EN and VI) and the docs/10 chunk line.
2. The whole FIX3 change `git diff 7ce4e95..a78ada5 -- src tests docs` (20 paths) and `a78ada5..ceb86b6` (only the AGENTS
   pair outside `handoff/`). Code read for area A: `styles.css` (every hover rule, every focus rule they can override, the touch
   rule, the account entries, the phone Administration table), `AppShell.tsx`, `AccountMenu.tsx`, `contrast.ts`, and the new or
   changed tests in `hover.spec.ts`, `shell.spec.ts`, `admin-status.spec.ts` and `theme.spec.ts` (reading notes:
   `notes-extra.txt`).
3. Mandatory checks in the clean export `export`: `npm ci`, typecheck, lint, `npm test` twice, build, AC-13 once, the FULL e2e
   on both projects on the real clock (run 1 failed once by a network error, so the one allowed rerun followed).
4. Own probes in a second export `export-p` (task-local `zz-a2-*.spec.ts`, nothing in the repository; Edge through the
   repository harness): the ring under the pointer and keyboard walks, a stylesheet scan, taps on the phone, coarse-pointer
   sizes, the account entries' geometry, the phone Administration with axe-core 4.14.0, the phone first screen, the contrast
   of the changed rules, the More panel's focus-out behaviour, and the DPR 2 seams (the first-pass seam probe with renamed
   outputs, for comparable numbers).
5. Thirteen mutants in a third export `export-m`, each applied alone, rebuilt, run against the listed e2e specs on both
   projects, then restored (both mutated files byte-equal to the pristine export afterwards, `cmp`).

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX3-AUDIT-A2/` plus 12 `-synthetic.png` screenshots. Probe
and script sources are kept as `*.txt`.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; non-handoff status | `b35dddd5…ebb48`, 833 files every time; export list = `ls-tree` list; no `.git` in the exports; HEAD ceb86b6 = origin/main; 0 non-handoff lines | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (three exports) | 0, 0, 0 | `02-ci-exit.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 deprecation lines | `10-typecheck.txt`, `11-lint.txt`, `main-times.txt` |
| `npm test` twice | 0 and 0: 94 files, 2141 tests each | `12-npmtest-1.txt`, `12-npmtest-2.txt` |
| `npm run build` | 0; main `index-BJ9ZzqiL.js` 486.81 kB (gzip 143.10), `AdminScreen` 31.57 kB, `ImportScreen` 23.82 kB, CSS 79.35 kB; no chunk-size advisory | `13-build.txt`, `16-static-summary.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `14-ac13.txt` |
| FULL e2e run 1, real clock, both projects (21:59:20-22:17:24Z; area-B audit active; my probes from 22:07Z) | exit 1: 644 passed, 1 failed, 67 skipped (desktop 325/30/1, mobile 319/37/0), 17.9 min, 0 deprecation lines. The failure: `automation.spec.ts:268` desktop, `TypeError: fetch failed`, cause `read ECONNRESET`, at the spec's line 277 (a request to its private server), read from the retained trace: a network error, not an assertion | `15-e2e-real.txt`, `15-e2e-real-counts.txt` |
| that test alone, `--repeat-each 5`, both projects | exit 0, 10 of 10 passed | `15-auto268-alone.txt` |
| FULL e2e run 2 (the one allowed rerun), real clock, nothing else of mine running | exit 0: 645 passed, 67 skipped, 0 failed (desktop 326/30/0, mobile 319/37/0), 16.1 min (23:00:30-23:16:43Z; the area-B audit active at the start), 0 deprecation lines; `automation.spec.ts:268` passed on both projects | `15-e2e2-real.txt`, `15-e2e2-real-counts.txt` |
| probes (`export-p`, build `index-BJ9ZzqiL.js` as the target) | see the sections below; the first ring run stopped at its More step (my probe assumed the panel closes on Tab out, which led to finding 01) and was rerun complete | `obs-*.txt`, `log-probe-*.txt`, `zz-a2-*.spec.ts.txt` |
| mutants (`export-m`) | 13 run, 10 caught, 3 survive | `mut-summary.txt`, `mut-M*-diff.txt`, `mut-M*-e2e.txt` |

## Findings

1. **Medium. On a phone-width window the More panel stays open after keyboard focus leaves it, and the focused Category
   pickers of the sheet are then entirely hidden behind it; Escape from the page does not close it.**
   - Where: `src/client/components/AppShell.tsx:141-162` and `:196-227`. The More panel closes on a hash change (`:142-146`),
     on a pointer press outside the tab bar (`:149-156`) and on Escape only while focus is inside the tab bar
     (`onKeyDown={closeOnEscape}` on the `nav`, `:196`). Nothing closes it when focus leaves. The desktop account menu holds
     the same content and closes when focus leaves it (`AccountMenu.tsx:193-197`, "Tab past the last entry moves focus out of
     the root: the panel closes"). Pre-existing since the More panel was built in round 3 (FIX3 did not touch `AppShell.tsx`);
     the first pass checked Escape, the entries and an outside press, not Tab out of the panel.
   - Reproduction (`obs-more.txt`, `zz-a2-more.spec.ts.txt`, `a2-more-panel-covers-focused-picker-390-light-synthetic.png`):
     both projects at 390x844 (the desktop project is a narrow window on a device with a keyboard and a pointer; the mobile
     project a touch phone with a keyboard), the sheet scrolled so that the first week's rows are in the lower half. Focus More,
     Enter (the panel opens at 105,457 278x323), Tab five times to Sign out, Tab once more: focus leaves the panel (to the
     document, then the top bar) and the panel stays open. Further Tab stops reach every row of both weeks: 12 of the 14
     Category pickers take focus while their whole box lies inside the panel's box and 25 of 25 sample points inside each are
     painted by the panel (the focus ring is invisible); the two others are 5/25 covered. With a hidden picker focused, Escape
     changes nothing (panel open, focus still hidden). The same on both projects. For comparison the desktop menu at 1280
     closes on the Tab past Sign out (`obs-more.txt`, comparison line).
   - Expected: no focused control is entirely hidden by author content (WCAG 2.2 SC 2.4.11, AA; the user cannot reveal it
     without moving focus, because Escape does not work from the page), the shared focus ring visible (AGENTS UI rule 3), and
     the More panel behaving like the menu whose content it carries (docs/04 line 7: the menu closes on "a press outside, a page
     change or Tab past Sign out"; More "holds the same account content"; docs/10 account menu pattern). Bounded fix: close the
     More panel when focus leaves the tab bar (an `onBlur` on the `nav` with the related target outside it, as `AccountMenu`
     does), keep Escape and the focus return to More, and add an e2e assertion on both projects that Tab past Sign out closes
     More (mutant check: remove the close).
2. **Low (test strength). Two of FIX3's four focus-under-hover rules can be removed without any test failing.**
   - Where: `src/client/styles.css:4584-4586` (`.button-link:focus-visible:hover`, the ring of every button link such as
     "Review & sign off" under the pointer) and `:795-797` (`.shell-tabs .tab:focus-visible:hover:not(:disabled)`, the phone
     tabs on a device that can hover). The new e2e test `tests/e2e/hover.spec.ts:672-712` covers the date button, the Category
     picker and the phone day button only; no test hovers a focused button link or tab (`git grep` of the e2e specs).
   - Reproduction (`mut-summary.txt`, `mut-M4-*.txt`, `mut-M5-*.txt`): M4 (the button-link rule removed) passes `hover`,
     `focus-ring`, `surfaces`, `keyboard-access`, `review` and `today` specs on both projects, 199 passed, 0 failed; M5 (the tab
     rule removed) passes `hover`, `focus-ring`, `shell`, `keyboard-access` and `theme`, 272 passed, 0 failed. My probe on the
     target shows both rings present under the pointer (`obs-ring.txt`), so the product is right today; the guard is missing.
   - Expected: each fix of the Medium finding F-UX3A-01 is held by a test, as FIX3 did for the three sheet controls (FIX3's
     mutants of those three are caught; mine too: M1-M3). Without them the ring of the button links (`.button-link:hover`
     0,2,0 puts `--elev-1` over the global ring 0,1,0) and of the phone tabs (the tab hover rule 0,5,0 sets `box-shadow: none`)
     disappears under the pointer again unnoticed (WCAG 2.2 SC 2.4.7, AGENTS UI rule 3). Bounded fix: add a button link (the
     period bar's review link) and a non-current phone tab to the controls of `hover.spec.ts:672-712` (shared ring and inset
     ring respectively).
3. **Low. The Sign out entry starts 3px to the right of every other entry in the account menu and the More panel.**
   - Where: `src/client/styles.css:875-882` gives both entry kinds the same gap and height but not the same inline padding:
     the links keep `.nav-link`'s `padding: var(--space-1) var(--space-3)` (12px, no side border, `:625-635`), while
     `button.account-action` (`:895-901`) keeps the button's `padding: var(--space-2) var(--button-pad-x)` (14px) plus its 1px
     transparent border (`:1218-1229`).
   - Reproduction (`obs-css.txt` "Sign out", `a2-account-entries-menu-1280-light-zoom2-synthetic.png`): menu at 1280 and More
     at 390, light and dark: Profile, Settings and Import start their icon at 12.0px and their words at 42.0px inside the entry;
     Sign out at 15.0px and 45.0px. Gap 12.0px and centre offset 0.88px are equal for all (F-UX3A-04 as named is closed). The
     2x crop shows the Sign out icon and words out of line with the column above.
   - Expected: the same icon gap "and alignment as the other entries", which is what F-UX3A-04 asked (U-04 account menu;
     AGENTS UI rules 1 and 2, consistent components). REGATE2 recorded it as an observation; I judge it a defect because the
     entries of one panel visibly do not line up and the cause is an unintended padding token. Bounded fix: give
     `.account-panel .account-action` the links' inline start (for example `padding-inline: calc(var(--space-3) -
     var(--hairline))`, keeping the 1px border for the hover boundary) and assert the icon start in `shell.spec.ts:1077`.

## First-pass findings F-UX3A-01..06 (own probes on the build of the target)

| Finding | Verdict | Basis |
|---|---|---|
| F-UX3A-01 focus ring under the pointer | **Closed** | `obs-ring.txt` (two runs, light and dark device, Edge, desktop project): with keyboard focus the ring is painted with the pointer away and resting on the control, the computed shadow is the same string both ways, `:focus-visible` and `:hover` both true: date button (outset 3px; ring against the hovered column 5.75 light, 6.15 dark), Category picker (inset 2px; 5.44 and 5.54 against the hovered fill), both button links ("Review & sign off" in the period bar and in the signature footer, 6.09 and 6.79), identity button, navigation link, quiet and secondary buttons, the Show details switch; at a 390 window on the same device the phone day button (5.63, 6.14), the phone Category picker (5.32, 5.54), the non-current and current tabs and More (inset 2px, 4.96 and 4.68 against the tab hover fill) and the phone review link. Escape return at 1440: click a date (editor beside the sheet), Escape, focus on that date button with `:focus-visible` and `:hover`, ring 5.75 light and 6.15 dark. Screenshot `a2-ring-date-under-pointer-1440-light-synthetic.png`. Mutants M1-M3 caught; for the other two rules see finding 02 |
| F-UX3A-02 hover gating | **Closed** | `obs-css.txt`: the parsed style sheet (one CSS file, 771 rules visited, no adopted sheets, no `<style>` elements, no nesting) has 31 `:hover` rules, every one inside a media rule whose text is exactly `(hover: hover)`, on both projects. Mobile project, light and dark: two taps on a Category picker leave background, border and shadow equal to rest (`:hover` still matches after the tap, with no hover look); a tap on the date field and a tap elsewhere leave its border at rest. Mutant M6 caught |
| F-UX3A-03 44px with a coarse pointer | **Closed** | `obs-css.txt`: desktop project, own contexts with `hasTouch` (pointer coarse, hover none) at 768, 1024 and 1280: 4 bar controls, smallest 44px, identity button 232.92x44; 42 page controls, the only one under 44px is the switch input (44x24) covered by its 137.9x44 label; account menu 5 controls, none under 44px. Fine pointer at 767 and 390: bar controls 44px. Mutant M7 caught |
| F-UX3A-04 Sign out gap and alignment | **Closed** as named (gap and vertical alignment) | `obs-css.txt`: Sign out is `display: flex`, gap 12.0px and icon centre 0.88px from the words' centre, equal to Profile, Settings and Import, menu 1280 and More 390, light and dark. Mutant M8 caught. The horizontal start differs by 3px: finding 03 |
| F-UX3A-05 More-panel Escape untested | **Closed** | `shell.spec.ts:754-770` asserts it; mutant M11 (A4: `AppShell.tsx:161` replaced by `void 0;`) fails 4 tests (`shell.spec.ts:713`, employee and admin, both projects, `toBeFocused`), 71 passed; the target passes them in both full runs |
| F-UX3A-06 phone Administration | **Closed** | `obs-admin.txt`: the long delivery state "Delivery recorded as uncertain" and `lease_expired_while_sending` (seeded with the repository test's SQL from a task-local file, decision `mark_delivered` over the API), desktop and mobile projects, light and dark: wrapper client/scroll 326/326 at 390 and 256/256 at 320, page not wider than the window, 0 row parts past the card, axe-core 4.14.0 (WCAG 2.0-2.2 A/AA tags) 0 violations at both widths in both themes (8 scans); badge 2 lines, code 2 lines. Mutants M9 (badge wrap removed: scroll 348 against 326) and M10 (code wrap removed: 359 against 326) caught by `admin-status.spec.ts:243` on both projects |

## Regression from FIX3's diff (area A)

Basis: `git diff 7ce4e95..a78ada5 -- src tests docs` is the whole change; in area A it touches `styles.css` (the eleven
rule groups listed in `notes-extra.txt`), docs/04 line 46 (EN and VI) and four e2e specs; `a78ada5..ceb86b6` changes only the
AGENTS pair, whose "Frontend and UI/UX standards" section is unchanged.

- Looks on a device that can hover (`obs-contrast.txt`, `obs-ring.txt`): the hover looks FIX3 moved into `(hover: hover)` are
  unchanged there: field border at rest 1.22 (light) and 1.66 (dark), hovered 5.10 and 7.53; button links fill step 1.08
  (light) and 1.11 (dark) plus the `--elev-1` ring, accent border 6.09 and 6.79, text on the hover fill 5.63 and 6.14 (as before
  FIX3; risk R-A2-3); Category picker fill step 1.12 with its 1px `--accent-line` (1.98 against the fill, unchanged since round
  2); table rows (History) 1.08. Reference secondary button 1.23 with border 6.09 and text 6.52. Specificity of every
  focus-and-hover pair: `notes-extra.txt` item 2; no hover rule overrides a focus ring any more.
- Keyboard walks with the pointer away and resting on each stop (`obs-walk.txt`, light and dark, two runs): Timesheet 1440 42
  stops, account menu 3 stops after the first entry (it closes on the Tab past Sign out), Settings 49 stops, phone Timesheet at
  390 on a hover device 42 stops, More panel 13 stops: the ring is painted at every stop both ways (lowest 4.68). The only
  flagged stops are the inner picker buttons of date and time fields (`:focus-visible` false, the ring drawn through
  `:focus-within` as designed, WP5-UX-B5 R-12). The More walk led to finding 01.
- Touch, coarse sizes and the phone Administration: as in the table above.
- Everything FIX3 did not touch keeps the first-pass verdicts (owner fidelity U-01..U-20, U-27 and the G conditions; style
  system; shell and settings except findings 01 and 03; period bar; sheet geometry; editor panel; axe), on the basis of the diff
  above; the full e2e on the real clock and my probes saw no change in them.

## Test strength

| Id | Mutant (scratch export, applied alone) | e2e specs run (both projects) | Result |
|---|---|---|---|
| M1 | date button focus-and-hover rule removed (`styles.css:2667`) | `hover` | caught: `hover.spec.ts:673` desktop, light and dark ("date button ... the ring under the pointer equals the ring with the pointer away") |
| M2 | Category picker focus-and-hover rule removed (`:4360`) | `hover` | caught: the same test, "Category picker" |
| M3 | phone day button focus-and-hover rule removed (`:3051`) | `hover` | caught: the same test, "phone day button" |
| M4 | button link focus-and-hover rule removed (`:4584`) | `hover`, `focus-ring`, `surfaces`, `keyboard-access`, `review`, `today` | **survives**: 199 passed (finding 02) |
| M5 | phone tab focus-and-hover rule removed (`:795`) | `hover`, `focus-ring`, `shell`, `keyboard-access`, `theme` | **survives**: 272 passed (finding 02) |
| M6 | `tbody tr:hover` taken out of `@media (hover: hover)` | `hover` | caught: `hover.spec.ts:577` both projects ("hover rules outside (hover: hover)") |
| M6b | `tbody tr:hover` gated by `(hover: hover), (pointer: coarse)` (applies on touch screens) | `hover` | **survives**: 68 passed (the scan's textual gating, risk R-A2-1) |
| M7 | coarse-pointer identity height rule removed (`:676-680`) | `shell` | caught: `shell.spec.ts:1049` both projects |
| M8 | Sign out `display: flex; align-items: center` removed (`:896-897`) | `shell` | caught: `shell.spec.ts:1077`, 4 tests ("Sign out: the icon gap is 12px") |
| M9 | phone badge wrap removed (`:4986-4989`) | `admin-status` | caught: `admin-status.spec.ts:243` both projects (wrapper 348 against 326) |
| M10 | phone fault-code wrap removed (`:4991-4993`) | `admin-status` | caught: the same test (359 against 326) |
| M11 | A4: `AppShell.tsx:161` `moreButton.current?.focus();` replaced by `void 0;` | `shell` | caught: `shell.spec.ts:713`, 4 tests (F-UX3A-05) |
| M12 | theme segments never settle: `.theme-option { transition-duration: 60s !important; transition-timing-function: linear !important }` | `theme -g "contrast of the checked"` | caught: 8 of 8 fail after 25.3-27.8 s, "the computed boxShadow is settled", "Timeout 7000ms exceeded while waiting on the predicate" (three tries of the wrapper, then the error) |

- The stylesheet-wide hover scan (`hover.spec.ts:577-624`) is sound and not vacuous: it reads the browser's parsed sheets,
  descends into media and grouping rules, fails on any ungated `:hover` selector, keeps an empty allowlist with a stated rule
  for entries, and also requires more than 20 gated rules plus seven named rules, so an empty or unread sheet fails (M6 caught).
  Its limit is textual gating: a rule under `(hover: hover), (pointer: coarse)`, `not all and (hover: hover)` or
  `(any-hover: hover)` counts as gated although it can apply on a touch screen (M6b survives), and CSS nesting inside a style
  rule is not visited (none in the sheet today). Risk R-A2-1.
- `surviveStall` (`theme.spec.ts:77-86`) retries only its own poll timeouts in this test (the messages "the computed ... is
  settled" and "Timeout 7000ms exceeded while waiting on the predicate"; `toBeFocused` failures and the test timeout do not
  match; every wrapped measurement restarts from its own beginning), at most twice, then rethrows; every assertion is
  unchanged. A real settle failure still fails (M12). The cost is that a state settling only after 7 to about 21 s now passes
  (the test runs under reduced motion, where the product's transitions are 0.01 ms). Accepted.

## Risks and optional improvements (not proven defects)

- R1 (first pass): **closed by documentation.** docs/04 line 46 now states that 4.82:1 holds beside the sheet from 1360px and
  that through the side backdrop below 1360px the frame measures 4.14:1 (light) and 2.79 to 3.27:1 (dark); EN and VI carry the
  same numbers. FIX3 did not change the frame or the backdrop (diff), so the first-pass numbers stand.
- R3: **unchanged.** Dark theme at DPR 2: 8.4-9.5/255 in the one-device-pixel ring row at each inner join (`obs-seam.txt`);
  invisible at normal size (`a2-seam-dpr2-join1-zoom6-1367-dark-synthetic.png`).
- R5: unchanged (AppShell not changed): a lazy screen slower than 5 s leaves focus on the body after an entry.
- R7: unchanged: More keeps focus on itself when opened by keyboard (the desktop menu moves it to the first entry). Finding 01
  is a separate defect of the same panel.
- R8: **closed** by the 120 s budget and `surviveStall` (judged above).
- REGATE2 observation 2 (away first screen 2.2px lower): **risk, not a defect.** My probe (`obs-phone.txt`, mobile, 390x844):
  landing first row bottom 559.5 (658.4 with the zone note), next period 561.7 (660.6), previous period 583.0 (682.0): the
  "old" period's bar is taller. The tab bar is at 788, so the room is 106 to 228.5px; `today.spec.ts:465` asserts the away
  budget. docs/04 line 49's figures are the landing state; optional: name the away variation there.
- REGATE2 observation 3 (docs/10 line 240 "main chunk 487 kB in the build after WP5-UX3-FIX2"): **risk, not a defect.** The
  sentence is a dated record of the code-split decision; the FIX3 build's 486.81 kB still rounds to 487 kB and is under the
  500 kB advisory, so nothing in it is false. Optional refresh of the label.
- R-A2-1: the hover scan's textual gating (above).
- R-A2-2: the phone fault code `lease_expired_while_sending` now breaks inside the identifier at 390 and 320
  (`a2-admin-submissions-320-light-synthetic.png`); it would fit whole on its own row (about 189px against 326 and 256). At 320
  the period range also breaks inside the date "2026-10-25" at its hyphen (pre-existing). Optional: give `.ops-code` the full
  row on a phone.
- R-A2-3: button links hover with `--off` and `--elev-1` (fill step 1.08 light, 1.11 dark) instead of the `--hover-fill` tint
  docs/04 line 92 names for buttons; the signature footer's "Review & sign off" link has no boundary at rest or under the
  pointer. Unchanged since WP2-T11 and WP5-UX-T02; docs/04 line 92 does not list button links, so not a defect of this round.
- R-A2-4: FULL e2e run 1 failed once with `read ECONNRESET` on a request of `automation.spec.ts:268` to its private server
  under parallel load (area-B audit and my probes); the test passed 10 of 10 alone and on both projects in run 2. A harness-level network flake,
  outside area A.

## Required gates unrun or blocked

- A second browser engine (none installed on the host), as in the first pass: NOT VERIFIED for engine-specific rendering.
- Every check the brief lists ran.

## Disposition of previous findings

- F-UX3A-01, 02, 03, 05, 06: closed. F-UX3A-04: closed as named; its horizontal remainder is finding 03.
- First-pass risks: R1 closed by docs, R8 closed, R3, R5 and R7 unchanged; R2, R4, R6 and R9 not rechecked here (no change in
  their subject).

## Software readiness, owner permission and pilot

Area A of round 3 is not accepted on ceb86b6 until findings 01-03 are fixed, frozen, regated and rechecked. No real sending,
deployment or pilot activity was touched; the owner's pilot authorization is unaffected and still pending.

## One next action

A bounded fix task for findings 01-03: close the phone More panel when focus leaves the tab bar (with an e2e on both projects),
add a button link and a phone tab to the ring-under-pointer test, align the Sign out entry's inline start (with an assertion);
then its freeze, a regate and a fresh area-A recheck on the new digest.

## Independent subagent provenance

- Review task/attempt, reviewer and reviewed authors: WP5-UX3-AUDIT-A2 attempt 1, timesheet-auditor (fresh context,
  `claude-opus-5-5`, board agent `a8b394d336bd441d1`); authors of the reviewed changes are the WP5-UX3 workers, planners and
  committers on the board (FIX3 `a61d450ff073015d9`, GOV2 `af5bf8a7f6d5d5e58`), none of them this reviewer.
- Fresh context; the reviewer authored no change in the snapshot and edited no source, docs, test, board or STATE file; it
  wrote only this pair, the brief's Results and the evidence folder.
- Digest before and after: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 files) in three forms both
  times; gate evidence for this snapshot: WP5-UX3-REGATE2 (attempt 2).
- New report path, preserving earlier reviews: `handoff/delivery/WP5_UX3_REVIEW_A2.md` (the first area-A review
  `WP5_UX3_REVIEW_A.md` is unchanged).
- Slips (no effect on any result): one read-only display command piped into `tail -c` (about 22:11Z) and one into a redirect to
  `/dev/stderr` (about 23:00Z), against the brief's rules; `head` and `tail` were also run directly on a few task-folder files
  (no pipe). Nothing was fed to python or node through stdin, no heredoc, no recursive delete, no process killed. The repository
  harness starts each server on an OS-assigned loopback port, as in earlier audits; no port of mine outside 49080-49109 was
  set. npm runs its own scripts through its default shell.
