# WP5 UI change round 3, independent audit of area A on 7ce4e95 (WP5-UX3-AUDIT-A)

[Tiếng Việt](WP5_UX3_REVIEW_A.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 3 after its fix round
  (WP5-UX3-FIX1 and WP5-UX3-FIX2) and its regate (WP5-UX3-REGATE, PASS with a recorded deviation), task WP5-UX3-AUDIT-A,
  attempt 1, 2026-10-16 from 18:25Z to about 20:55Z (11:25 to about 13:55 in America/Los_Angeles, a window day: shown
  period 09/28-10/11/2026, in progress 10/12-10/25). Reviewer self-reported model `claude-opus-5-5`, profile
  timesheet-auditor (effort set by the profile, not observable from inside). The strongest author model of the snapshot on
  the board is also `claude-opus-5-5` (PLAN, PLAN2, T06, T08, FIX1, SWEEP), so the reviewer is not weaker. Area A only:
  visual, shell, settings, sheet, accessibility, the fix-round area-A items, the regate's two mobile timeouts (item 11) and
  the DPR 2 seams (item 12). The independent area-B auditor ran in parallel on the same machine (its folder showed file
  activity at every load sample); every timing below carries that context.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `7ce4e95a0c4477374e981132d93b11aedab2e384` (the WP5-UX3-FIX2-FREEZE commit, the regate's `freeze_commit`); HEAD = that
  commit before and after; nothing outside `handoff/` modified or untracked before or after. Digest
  `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 files, `handoff/` excluded, recorded first
  (18:26Z) and last (20:42Z), each time in three equal forms: a clean `git archive` export hashed with
  `git hash-object --no-filters`, the `git ls-tree` form (its sorted list byte-identical to the export's), and
  `npm run digest` in the repository. Source complete: `npm ci` exit 0 in three exports.
- **Decision: FIX REQUIRED.**
  - Six findings, one Medium and five Low (section "Findings"): the keyboard focus ring disappears under the mouse
    pointer on the sheet's date button and Category picker, also after the documented focus return from the Day editor
    (01); one sheet hover rule (and three older ones) still paints on touch screens, against docs/04 and the AGENTS UI
    rule (02); the identity button stays 38px high with a coarse pointer (03); the Sign out entry's icon touches its
    words in the account menu and the More panel (04); a mutant that drops the phone More panel's Escape focus return
    survives the suite (05); on a phone the Administration "Submissions and delivery" table scrolls sideways with no
    keyboard access once a long delivery badge is shown (06, pre-existing, axe serious).
  - Item 11 (the regate's two timeouts): both are load noise with a stated reason, neither a wait too tight by reading
    nor a product delay. One host-level stall of about 21 s froze both workers' browsers at the same moment (a page
    creation of 21.8 s in one worker, a 400 ms wait that returned after 21.0 s in the other). In my five full-suite runs
    (the mandatory one, one at the regate instant, one on the real clock, and two at once at that instant and on the real
    clock) the two tests passed 125 of 125 times; the tight budget of `theme.spec.ts:413` (up to 84% of 30 s on the desktop) is risk R8.
  - Item 12 (DPR 2 seams): no seam, gap or shadow over a lifted neighbour at 1440, 1445, 1367 and 1601 in light and dark;
    the attempt-1 notch is gone (worst 3.0/255 under an inner join in light, against 22.5-28.5 in attempt 1); in dark a
    one-device-pixel dip of 8.4-9.5/255 remains in the 1px ring row at each join (risk R3).
  - Everything else in area A holds: owner fidelity of U-01..U-20 and U-27 with the G-1 b conditions, G-2 a, G-5 b and
    U-06; the style system (token parity, one `--transition`, no `all`, reduced motion); shell and settings (keyboard,
    Escape, focus after every entry including lazy screens, redirects, read-only Profile, no `/api/admin/` request by an
    employee, the 403 integration tests); the period bar and header; the sheet (lifted runs, 108px, 1360px rule, dock
    side, 768-899px focus); the editor panel; axe 4.14.0 with 0 violations in the first 43 scans except the accepted
    account-menu `target-size` (the phone Administration with long delivery states, scanned later, gave finding 06); 10
    of 11 own mutants caught; the mandatory checks green.
  - The account-menu `target-size` justification of FIX1 is accepted with my measurement (risk R2).

## Scope actually inspected and executed

1. Read as claims, not proof: the brief, AGENTS.md from disk, the owner's words and the coordinator decisions of
   2026-10-15/16 (including the audit-focus list, its addendum and "regate timeouts"), PLAN and PLAN2 (design and results),
   FIX1, SWEEP, FIX2 (with Addendum 1), GATE (attempt 1, FAIL) and REGATE (PASS), and their evidence; docs/04 (EN and VI),
   the docs/10 chunk line.
2. Code read for area A: `styles.css` (tokens, the three theme sets, the transition rule, every hover rule, lift runs,
   frame, card scroll), `AppShell.tsx`, `AccountMenu.tsx`, `App.tsx`, `routeModel.ts`, `ProfileScreen.tsx`,
   `SettingsScreen.tsx`, `periodBarModel.ts`, `dayEditorModel.ts` (`dayPeriodPill`), `TimesheetSheet.tsx`
   (`revealFocused`), `SheetWeekTable.tsx` (picker names), `DayEditor.tsx` (dialog name), `DayFieldsForm.tsx`
   (`aria-describedby`), `ConfirmDialog.tsx`, the e2e helpers and the tests named in the findings.
3. Mandatory checks in the clean export `export`: `npm ci`, typecheck, lint, `npm test` twice, build, AC-13 once, the FULL
   e2e on both projects on the real clock.
4. Own probes in a second export `export-p` (servers on 48950-48969; nothing in the repository): DPR 2 seams, shell and
   keyboard, sheet geometry and frame pixels, axe scans and the dialog name, a 1024px touch screen, a phone tap, focus
   rings under the pointer, the account entries' icons, the phone Administration after submitted periods, screenshots
   (16 kept).
5. Eleven mutants in a third export `export-m` (servers on 48940-48949), each with the full unit suite and the listed e2e
   specs on both projects, then restored (rebuild gives `index-4YHzamSq.js` again; every mutated file equals the pristine
   export).
6. Item 11: the two regate traces read step by step; the durations of both tests in the regate's nine full runs, its repetition run and mine;
   four more full-suite runs with the two tests repeated four times each in an extra project of the mobile settings
   (20 more runs per suite; the 42 task-local probe tests of `export-p` ran inside the `export-p` suites too): one at the
   regate instant 2026-12-31 23:30 America/Los_Angeles with the FIX10 preload (byte-identical copy), one on the real
   clock, then two suites at once (four workers), one at that instant in `export-m` and one on the real clock in
   `export-p`; load samples at the start and end of every run (`load-context.txt`).
7. A static CSS scan (hover gating, theme-set parity, literal values) of the target and of a643794.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX3-AUDIT-A/` plus 16 `-synthetic.png` screenshots.
Scripts and probes are kept as `*.txt` (never runnable from the repository).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; non-handoff status | `262138e0…bf0191`, 833 files every time; export list = `ls-tree` list; HEAD 7ce4e95; 0 non-handoff lines | `01-digest-*-before.txt`, `01-digest-*-after.txt`, `01-head-*.txt` |
| `npm ci` (three exports) | 0, 0, 0 | `02-ci-exit.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 deprecation lines | `10-typecheck.txt`, `11-lint.txt`, `main-times.txt` |
| `npm test` twice | 0 and 0: 94 files, 2131 tests each (integration 403 tests included, `vitest.config.ts` includes `tests/**/*.test.ts`) | `12-npmtest-1.txt`, `12-npmtest-2.txt` |
| `npm run build` | 0; main `index-4YHzamSq.js` 487.17 kB (gzip 143.23), `AdminScreen` 31.57 kB, `ImportScreen` 23.82 kB, CSS 78.62 kB; no chunk-size advisory | `13-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `14-ac13.txt` |
| FULL e2e, real clock, both projects (18:30:07-18:47:25Z, LA 11:30-11:47 on a window day; area-B auditor active) | exit 0: 627 passed, 67 skipped, 0 failed (desktop 317/30/0, mobile 310/37/0), 17.3 min, 0 deprecation lines | `15-e2e-real.txt`, `15-e2e-real-counts.txt`, `load-context.txt` |
| `git diff --stat a643794 7ce4e95 -- src/server src/domain` | empty | `40-server-diff.txt` |
| CSS scan (target and a643794) | 0 dark-set differences (60 tokens each), 0 dark tokens missing in `:root`; 0 literal colour/radius/shadow/duration values in rules; 7 `:hover` rules outside `@media (hover: hover)` (10 in a643794) | `20-cssscan.txt`, `20-cssscan-a643794.txt` |
| durations of the two regate tests (10 regate logs, mine) | see item 11 | `50-durations-regate.txt`, `51-durations-mine.txt`, `52-durations-item11.txt` |
| regate failure traces | one ~21 s stall froze both workers' browsers at once | `70-item11-regate-traces.txt`, `trace_actions.py.txt` |
| probes (Edge 155, `export-p`) | see sections 3-12 | `obs-*.txt`, `log-probe-*.txt`, `zz-a-*.spec.ts.txt` |
| mutants (11) | 10 caught, 1 survives (A4) | `mut-summary.txt`, `mut-A*-*.txt` |
| docs/04 EN/VI token parity | 1 difference, the VI translation note line | `60-parity-docs04.txt` |

## Findings

1. **Medium. The keyboard focus ring disappears under the mouse pointer on the sheet's date button and Category picker,
   also after the documented focus return from the Day editor.**
   - Where: `src/client/styles.css:2638-2650` (inside `@media (hover: hover)`, `.sheet .sheet-date:hover:not(:disabled)`
     sets `box-shadow: none` with specificity 0,4,0, which beats `.sheet .sheet-date:focus-visible` at 0,3,0) and
     `styles.css:4320-4333` (`.sheet .label-trigger:hover:not(:disabled)`, 0,4,0, replaces the 2px inset focus ring of
     `.sheet .label-trigger:focus-visible`, 0,3,0, with a 1px `--accent-line` at 45% / 50% alpha, about 2:1). The comment
     at `styles.css:4326` says keyboard focus keeps the 2px indicator; under the pointer it does not.
   - Reproduction (`obs-ring.txt`, `zz-a-ring.spec.ts.txt`, screenshots `auditA-focus-*`): desktop 1440, light and dark.
     Keyboard focus on a date button with the pointer away: ring `0 0 0 1px card, 0 0 0 3px accent`; with the pointer
     resting on it: `box-shadow: none` while `:focus-visible` is true. Click a date (the editor opens beside the sheet),
     press Escape: focus returns to that date button (docs/04 line 62) with `:focus-visible` true and no ring, in both
     themes. Category picker under the pointer: `inset 0 0 0 1px rgba(31,95,191,0.45)` instead of
     `inset 0 0 0 2px accent`. At 1280 the modal backdrop takes the hover away, so the ring shows there.
   - Expected: the shared focus ring stays visible under the pointer, as for buttons (`styles.css:1301`, asserted by
     `tests/e2e/hover.spec.ts:249`), with an e2e check for the date button and the picker. Rule: AGENTS.md UI rule 3
     (focus-visible in both themes, the shared focus ring, 3:1), WCAG 2.2 SC 2.4.7. Pre-existing (identical rules in
     a643794, `styles.css:1933-1943` and `2918-2931` there); FIX2 moved the date rule into `@media (hover: hover)` without
     changing its specificity. Bounded fix: `:focus-visible:hover` rules for the two controls keeping `--focus-ring` and
     the inset ring, plus the e2e assertion.
2. **Low. One sheet hover rule (and three older ones) still paints on touch screens.**
   - Where: `styles.css:4320-4324` `.sheet .label-trigger:hover` (the sheet's Category picker, used on the phone table
     too, `SheetWeekTable.tsx:321`) is outside `@media (hover: hover)`; also `input/select/textarea:hover`
     (`styles.css:1176-1180`), `tbody tr:hover` (`:1457-1459`) and `.button-link:hover` (`:4538-4541`), all ungated since
     before round 3.
   - Reproduction (`obs-tap.txt`, `zz-a-tap.spec.ts.txt`): mobile project (`(hover: hover)` false, pointer coarse), tap a
     day's Category picker, close the list: the trigger keeps `background rgba(31,95,191,0.04)` and the inset 1px accent
     line, `:hover` true, until another tap elsewhere. On a 1024px touch screen the same (`obs-coarse.txt`).
   - Expected: docs/04 line 92 "Hover looks apply only on devices that can hover (`@media (hover: hover)`), so a tap
     leaves none" and AGENTS UI rule 3 "hover (only where the device can hover)". FIX2 item 11 gated the `.sheet-day` hover
     rules and two more sheet rules, but not this one. Bounded fix: move the four rules into `@media (hover: hover)`
     (keeping finding 01's ring), extend `hover.spec.ts:552` from `.sheet-day` to every painting hover rule.
3. **Low. The identity button stays 38px high with a coarse pointer from 768px.**
   - Where: `styles.css:663-673` `button.identity { min-height: var(--avatar-size) }` (0,1,1) outranks the touch rule
     `@media (max-width: 767px), (pointer: coarse) { button { min-height: var(--tap-min) } }` (`styles.css:1330-1339`,
     0,0,1).
   - Reproduction (`obs-coarse.txt`, `zz-a-coarse.spec.ts.txt`): desktop project, `hasTouch`, 1024x900:
     `matchMedia('(pointer: coarse)')` true; the identity button measures 296x38, the only control under 44px (the switch
     and checkbox inputs are covered by their 44px labels).
   - Expected: AGENTS UI rule 3 and docs/04 line 93: controls are at least 44px below 768px and with a coarse pointer
     (a tablet in landscape shows this bar). WCAG 2.5.8 (24px) is met. Bounded fix: `min-height: var(--tap-min)` for
     `button.identity` under `(pointer: coarse)`, plus a coarse-pointer measurement in an e2e test.
4. **Low. The Sign out entry's icon touches its words, in the account menu and in the phone More panel.**
   - Where: `styles.css:864-871` gives `.account-panel .account-action` a 12px `gap`, but `button.account-action`
     (`styles.css:883-887`, `AccountMenu.tsx:128-133`) is `display: block`, so the gap does nothing.
   - Reproduction (`obs-signout.txt`, `auditA-signout-icon-gap-desktop-synthetic.png`): Profile, Settings and Import
     (links, `display: flex`) have 12.0px between icon and words; Sign out has 0.0px, and its icon sits 3px above the
     text centre, desktop and phone.
   - Expected: the same icon spacing and alignment as the other entries (U-04 account menu; AGENTS UI rules 1 and 2,
     consistent components). Bounded fix: `display: flex; align-items: center` on `.account-panel .account-action`.
5. **Low (test strength). Removing the phone More panel's Escape focus return is not caught.**
   - Where: `src/client/components/AppShell.tsx:158-162` (`closeOnEscape` moves focus to More). Mutant A4 replaces line
     161 with `void 0;`.
   - Reproduction (`mut-A4-*.txt`): unit suite 2131 passed; `shell.spec.ts` and `theme.spec.ts` on both projects 145
     passed, 0 failed. `shell.spec.ts:588` checks Escape only for the desktop menu (it sets 1280px on both projects) and
     the More test at `shell.spec.ts:713` checks entries only.
   - Expected: an assertion that Escape in the More panel closes it and returns focus to More (the behaviour exists;
     my probe confirms it on the target, `obs-shell.txt` line "phone More, Escape"). docs/04 line 7: More holds the same
     account content as the desktop menu, whose Escape returns focus. Bounded fix: three lines in the More test.
6. **Low (pre-existing). On a phone the Administration "Submissions and delivery" table scrolls sideways, with no
   keyboard access, once a long delivery badge is shown.**
   - Where: `src/client/styles.css:4881-4884` `.ops-table .badge { display: inline-block; white-space: nowrap }` inside
     the phone layout of the table (`styles.css:4897-4926`, two `1fr` columns per row), in
     `src/client/components/OperationsStatus.tsx:329` (`<div className="table-wrap">`, `overflow-x: auto` at
     `styles.css:1429-1431`, not focusable, no focusable content). Unchanged since a643794; round 3 moved Administration
     under Settings (T03) but did not touch this table.
   - Reproduction (`obs-adminwrap.txt`, `zz-a-adminwrap.spec.ts.txt`, `log-probe-adminwrap2.txt`,
     `auditA-admin-submissions-phone-390-light-synthetic.png`): mobile project, one worker running `admin-status.spec.ts`,
     `automation.spec.ts` and `history-settings.spec.ts` first (they create submitted periods), then the admin opens
     `#/settings/admin`: "Delivery recorded as uncertain" and the fault code `lease_expired_while_sending` run past the
     card; the table wrapper is 326px wide with a scroll width of 359px at 390, and 256 against 324 at 320; axe 4.14.0
     reports `scrollable-region-focusable` (serious) on `.table-wrap` at both widths. The same violation appeared in all
     six phone Administration scans inside my item-11 suites (light and dark); with one plain submission there is no
     overflow and no violation.
   - Expected: the phone rows, already reflowed into a two-column list, keep every word inside the card without a
     sideways scroll (WCAG 2.2 SC 1.4.10 at 320px; AGENTS UI rule 2, mobile-first and responsive) and nothing scrollable
     is out of keyboard reach (SC 2.1.1). Bounded fix: let the badge and the fault code (`.ops-code`) wrap on a phone, or
     give them the full row, plus an axe or overflow check of the phone Administration with a long delivery state.

## Item verdicts

### 1. Owner fidelity (U-01..U-20, U-27, G-1 b, G-2 a, G-5 b, U-06)

Screens: `auditA-sheet-editor-1440-{light,dark}`, `auditA-account-menu-1440-{light,dark}`,
`auditA-floating-panel-1280-light`, `auditA-lifted-run-1440-dark`, `auditA-phone-*`; measurements in `obs-shots.txt`,
`obs-sheet.txt`, `obs-shell.txt`, `obs-seam.txt`.

| Item | Verdict | Evidence |
|---|---|---|
| U-01 modern style | PASS | AGENTS UI section from disk, tokens in `styles.css:9-343`, docs/04 lines 85-96 |
| U-02 contrast, raised week sheet | PASS | week cards square with `--elev-2` (`obs-sheet.txt` shapes), card on page 1.14/1.15 (regate, e2e `surfaces.spec`) |
| U-03 identity block | PASS (finding 03 for touch size) | bold name over the muted email, right-aligned, ellipsis, avatar right, chevron |
| U-04 avatar menu | PASS (finding 04 for Sign out spacing) | header, Profile, Settings, Administration (admins), Theme, Sign out |
| U-05 Settings and Admin moved | PASS | bar shows Timesheet, Overtime, History; Settings sub-pages; `#/admin` redirect |
| U-06 wordmark | PASS | shown from 1024 without a share, hidden 1024-1279 with a share, shown from 1280; one 56px row at every width |
| U-07 check in/out on the title row | PASS | h1 centre 91.0 = clock centre 91.0, right-aligned (1304 of 1440, the page edge) |
| U-08 no name line | PASS | none, own and shared (e2e `shell.spec.ts:369/459`) |
| U-09 pills | PASS | old amber, current green, future pink, in progress blue, neutral grey; inks 6.47-8.37:1 (e2e `timesheet.spec.ts:1643`) |
| U-10 meta row | PASS | one row at 1440 (1 row), wraps at 820 (e2e) |
| U-11 Open a day row | PASS | words, field and button centred on one row |
| U-12 toolbar spacing | PASS | 24.0px gap plus a hairline |
| U-13 editing column | PASS | Day-cell fill, 1px accent frame, no underline, no rails |
| U-14 lifted columns | PASS | lift with soft shadow, 4px corners, one shadow per run |
| U-15/U-16 Category, Status | PASS | rows Day / Date / Category / Time / OT (h:mm) / Status; slashed ring for "No times" |
| U-17 Current | PASS | 320px away state: Today, Current, Sign off on one 44px row, names "Current period", "Review & sign off" |
| U-18 Open a day words | PASS | hidden at 320 (row 288px), shown at 360 (328px): owner's rule "hide when not fitting" |
| U-19 short note | PASS | chips "current period", "Times in America/Los_Angeles" |
| U-20 header surface | PASS | `--panel-head` surface with a rule under it |
| U-27 WFH row | PASS | Category select bottom 856.0 = WFH bottom 856.0 at 1440 |
| G-1 b square sheets | PASS | `.sheet-week` and `.sheet-footer` radius 0 |
| G-1 b 4px lift, no shadow over a lifted neighbour | PASS | clip-paths per run position; a run's columns cast no own shadow; seams item 12 |
| G-1 b no squeezed or overlapping content | PASS | every column >= 110.6px (900) and >= 116.8px beside the panel (1360); 0 words wider than their box, 0 overflowing elements at 900-1920 |
| G-1 b floating panel | PASS | modal below 1360, beside from 1360; dock right for Mon-Wed, left for Thu-Sun at 1280 and 1024, never over the column |
| G-2 a | PASS | "Category" everywhere on the sheet, editor and batch (FIX2 wording, e2e) |
| G-5 b | PASS | "in progress" pill and editor chip by the day's own period (e2e today.spec 728/787/826 on a window day; mutants A6, A10 caught) |

### 2. Style system

PASS. Light `:root` 228 custom properties; the two dark sets hold the same 60 values (0 differences) and every dark token
exists in `:root`; the two colour tokens without a dark value (`--scrim`, `--paper`) are theme-neutral by design and
predate round 3. One `--transition` (`styles.css:504-507`) lists colour, background colour, background position, border
colour, box shadow and transform; no `transition: all`, no `animation`, no `@keyframes`; reduced motion sets the three
durations to 0.01ms (`styles.css:486-492`). The universal declaration of `--transition` (audit focus 1) is a working way
to let an element pick its duration. docs/04 "Visual standard" matches the code (radius scale 6/8/12/pill, square sheets,
4px lift, elevation names, 120/180/260 ms) except the hover sentence of line 92 (finding 02) and the coarse-pointer
sentence of line 93 for the identity button (finding 03).

### 3. Shell and settings

PASS apart from findings 03-06. Desktop: Tab order Timesheet, Overtime, History, identity button; Enter opens the menu
with focus on Profile; Tab walks Profile, Settings, Administration, Theme (one stop), Sign out, then leaves (menu
closed, focus on Check in); Escape from an entry closes and returns focus to the button; an outside click and a hash
change close it. Every keyboard entry focuses the new page's `h1` with the ring (`:focus-visible` true) and keeps it 2.5s
later (data loaded); the entry of the shown page returns focus to the identity button; a pointer entry focuses the `h1`
with no ring. Lazy Administration: a 3s chunk still gets the heading focus; a 7s chunk leaves focus on the body (the
documented 5s bound, risk R5); a person who tabs away while it loads keeps that focus. Phone More: Escape returns focus
to More, entries focus the `h1` (Profile, Settings, Import, Administration), the shown page's entry returns to More, an
outside press closes. Employee: `#/settings/admin` and `#/admin` go to `#/timesheet`, the sections nav shows Personal and
Profile only, 0 `/api/admin/` requests; Profile has 0 editable controls and shows the saved reporting zone. The lazy
chunks and their error state are covered by `settings-routes.spec.ts:172-228` (passed in my run). Server authorization
unchanged (`src/server` diff empty against a643794; 403 integration tests in both `npm test` runs). Administration on a
phone with long delivery states: finding 06.

### 4. Period bar and header

PASS. Title row and no name line (U-07, U-08); pills from the server periods only (`periodBarModel.ts:66-74`, own and
shared views, e2e `today.spec.ts:728/910`); meta row; Open a day; narrow "Sign off"/"Current" at 320; toolbar 24px gap.

### 5. Sheet

PASS apart from finding 01 and risk R1. Lifted runs: see item 12. Editor frame as painted (DPR 1, `obs-sheet.txt`):
beside the sheet at 1366 and 1440 at least 4.82:1 on the Day-cell fill and 5.01-6.79 elsewhere, light and dark; the
floating panel at 1280 shows it through the side scrim at 4.14:1 (light) and 2.79:1 on the Day-cell fill (dark,
3.03-3.27 on the other rows; the page is inert, risk R1). Category/Status names, the "No times" slashed ring (`shape
shape-slashed`, 50% radius). Every column >= 108px; the 1360px rule (modal at 1359, beside at 1360); dock side; 768-899px:
28 stops per walk at 768, 820, 880 and 899 with details off and on, every focused control and ring inside the visible
card (the two Sunday Category stops have 1.0px room and an inset 2px ring), page never wider than the window.

### 6. Editor panel (area A part)

PASS. Header surface and chips; session cards with the state pill, source line and break table; delete confirmation
with Cancel first (`ConfirmDialog.tsx:54-64`, e2e `day-editor.spec.ts:2492/2603`); WFH on the Category row.

### 7. WCAG 2.2 AA

FIX REQUIRED for findings 01, 03 and 06 (and 02 for the touch hover look). axe-core 4.14.0 (task-local copy, evaluated over
the DevTools protocol; nothing added to `package.json`): 43 scans (timesheet, editor beside / floating / sheet, session
dialog, delete confirmation, batch selection, account menu or More, Settings, Profile, Overtime, Administration; desktop
1366/1280 and phone 390; light and dark): 0 violations except the account menu open at 1280 ("Today", 10.5px) and 1440
("Review & sign off", 12.2px) `target-size` (the phone Administration scans inside the item-11 suites, with long
delivery states on the shared server, added `scrollable-region-focusable`: finding 06); `incomplete` only color-contrast and label-content-name-mismatch entries as
in the regate. The phone day buttons (R-UX2A-4) have no violation. Day editor dialog name: Chromium (Edge 155, CDP tree
and Playwright aria snapshot) "Day editor Fri 10/09/2026 (2026-10-09)" with the generated brackets; axe's own name
computation gives "Day editor Fri 10/09/2026 2026-10-09" (no brackets, nothing lost). No Firefox or WebKit is installed
on the host (no `ms-playwright` folder, no Firefox), so a second engine is NOT VERIFIED (risk R4). Keyboard walks:
section 3 and 5. AX-01..AX-10, R-12, B-02, B3-01 and the round-2 items: their e2e tests passed in my run on both
projects; no regression observed by my probes beyond findings 01-03 and 06.

### 8. Test strength (own mutants)

| Id | Mutant (scratch export) | Unit | e2e (both projects unless stated) | Result |
|---|---|---|---|---|
| A1 | lift run: the last day of a run becomes `mid` (`sheetModel.ts:71`) | 5 fail (`sheetModel.test.ts` liftRuns) | `timesheet.spec.ts:1422` fails | caught |
| A2 | frame and Today bar layer under the cells (`styles.css:2862` `--layer-under`) | pass | `timesheet.spec.ts:878`, `:1010`, `:1202`, `:1422` fail | caught (e2e) |
| A3 | wordmark hidden with a share only to 1199px (`styles.css:599`) | pass | `logo.spec.ts:268` fails | caught (e2e) |
| A4 | phone More Escape keeps focus in the closed panel (`AppShell.tsx:161`) | pass | `shell.spec.ts`, `theme.spec.ts`: 145 passed | **survives** (finding 05) |
| A5 | wide editor from 1300px in script only (`TimesheetScreen.tsx:44`) | pass | `day-editor.spec.ts:3093`, `:3285` fail (desktop) | caught (e2e) |
| A6 | "in progress" pill shown as "current" (`periodBarModel.ts:71`) | 6 fail (periodBarModel, dayEditorModel) | 10 fail (`today.spec.ts:728/787/826/910`, `timesheet.spec.ts:1643`) | caught |
| A7 | Administration route for every role (`routeModel.ts:44`) | 2 fail (`routeModel.test.ts`) | `isolation.spec.ts:90/197`, `settings-routes.spec.ts:87` fail | caught |
| A8 | phone column header "Label" (`SheetWeekTable.tsx:264`) | pass | `timesheet.spec.ts:1575` fails (mobile) | caught (e2e) |
| A9 | heading focus gives up at once (`AppShell.tsx:38`, 0 ms) | pass | `shell.spec.ts:588`, `:713` fail | caught (e2e) |
| A10 | editor chip ignores the in-progress period (`dayEditorModel.ts:97`) | 2 fail | `today.spec.ts:826` fails | caught |
| A11 | Tab past the last entry no longer closes the menu (`AccountMenu.tsx:196`) | pass | `shell.spec.ts:588` fails | caught (e2e) |

The A6 unit run also showed two unrelated integration timeouts under heavy load (risk R6). Restore: the rebuild after the
last revert gives `index-4YHzamSq.js` and all nine mutated files equal the pristine export.

### 9. Audit-focus items 1-7

1. `--transition` on `*, ::before, ::after` and the hover text step to `--accent-strong`: PASS (section 2; e2e
   `hover.spec.ts:125` text 5.77/6.52).
2. Chunk-load error "Try again" reloads the page: PASS (a reload is the only way to retry a failed module in the same
   page; e2e `settings-routes.spec.ts:206/228`).
3. R-UX2A-4 real axe scan of the phone day buttons: PASS (0 violations, light and dark).
4. `.sheet-week` scroll at 768-899px and the lift pixel test at 1445px: PASS (section 5, item 12 at 1440 and three
   fractional widths).
5. Bar gap and nav padding at 1024-1279px with a share: PASS (one 56px row, no overflow, wordmark hidden).
6. "Open a day" words hidden only at 320: PASS (follows U-18: hidden only when the row does not fit).
7. Dialog name with CSS-generated brackets: PASS in Chromium; second engine NOT VERIFIED (none installed), risk R4.

### 10. Fix round, area A

- FIX1: focus inside the week card at 768-899px PASS; Category trigger and break-chip names contain their visible text
  PASS (axe 0 `label-content-name-mismatch` violations; e2e `timesheet.spec.ts:1575/1612`, `day-editor.spec.ts`
  chip names); run-level shadow layer PASS (no notch, item 12; `::before` per run position, own shadow `none`); the
  lifted-column test is weekday-independent PASS (`bandNeighbour` takes another day of the same Monday-Sunday band,
  `timesheet.spec.ts:856-870`; the regate ran it on two Tuesdays); account-menu `target-size` justification ACCEPTED with
  my measurement (1280: Today uncovered 2.5px, axe 10.5px; 1440: Review & sign off uncovered 4.2px, axe 12.2px; a press on
  the 10.5px sliver at 1296 closes the menu and focuses Today; the menu is user-opened, non-modal and transient, compare
  the WCAG 2.2 note on user-opened content in SC 2.4.11), risk R2.
- FIX2 item 1 (focus after an entry): PASS (section 3, including lazy screens, the 5s wait and the pointer case); item 3
  (editor chip by the day's own period): PASS (mutant A10 caught, e2e on the real clock window day); item 4 (category
  wording): PASS; item 7 (Profile in another device zone): PASS (`settings-routes.spec.ts:119-153` runs under
  `Asia/Tokyo` and asserts the saved zone); item 11 (hover gating): PARTLY, the `.sheet-day` rules and the two extra rules
  are gated, `.sheet .label-trigger:hover` is not (finding 02); item 13 (Category hint): PASS (`DayFieldsForm.tsx:104,119`);
  docs/04 line 7 focus rule EN and VI: PASS (same tokens).

### 11. The regate's two timeouts

Verdict: **load noise with a stated reason for both tests** (optional risk R8 for the budget of `theme.spec.ts:413`);
neither is a wait that is too tight by reading, a race or a product delay. No FIX REQUIRED comes from item 11.

What each test waits for (by reading):

- `tests/e2e/timesheet.spec.ts:1799` signs in, then for each width calls `setViewportSize` and reads bounding boxes and
  the accessible name; it has no fixed wait and no poll besides the sign-in's `toHaveCount(14)`. Its own steps take
  0.7-3.9 s in every run I looked at.
- `tests/e2e/theme.spec.ts:413` measures four segment states; every colour, border or shadow read goes through
  `settledStyle` (`tests/e2e/contrast.ts:83-98`): two reads 400 ms apart inside a 7 s `expect.poll`. The test sets reduced
  motion, so the transitions last 0.01 ms (180 ms otherwise): the 400 ms window is longer than any transition, and
  nothing in the product changes the colour afterwards (each check returns at its first poll, 0.42-0.49 s in the regate
  trace). The cost is the count: about 32 checks on the phone and 44 on the desktop (hover adds three per segment), so
  the fixed waits alone take 15-17 s (phone) and 20-25 s (desktop) of the default 30 s test budget.

What happened in the regate (`70-item11-regate-traces.txt`, read from the two `trace.zip` files):

- Worker A (`timesheet.spec.ts:1799`): `BrowserContext.newPage` took 21.8 s (monotonic 842,684 to 864,508 ms), then one
  `Set viewport size` step took 6.5 s; the test's own steps took about 0.5 s after that and completed every assertion
  0.17 s after the 30 s budget had run out.
- Worker B (`theme.spec.ts:413`, dark device with manual light, third segment, 23 checks done in 11.5 s): one
  `page.waitForTimeout(400)` returned after 21.0 s (842,646 to 863,645 ms), so the surrounding 7 s poll expired ("the
  computed color is settled"); closing its context then took 9.7 s.
- The two stalls overlap on two separate browser processes (real time about 17:28:09 to 17:28:31Z): a host-level stall,
  not the product (no request or page change at that moment) and not a race in either test. The regate record does not
  say what else ran on the host then.

My runs (`51-durations-mine.txt`, `52-durations-item11.txt`, `log-i11-*.txt`; every run exit 0):

| Run (UTC) | Load | `theme:413` phone | `theme:413` desktop | `1799` phone |
|---|---|---|---|---|
| mandatory, real clock, 18:30-18:47 | one suite, area-B audit active | 4 of 4, 15.0-16.5 s | 4 of 4, 20.8-23.3 s | 1 of 1, 0.8 s |
| 2026-12-31 23:30 LA (preload), 19:28-19:50 | one suite plus 42 probes and 20 repetitions, area-B active | 20 of 20, 15.1-21.4 s | 4 of 4, 21.0-21.4 s | 5 of 5, 1.4-3.9 s |
| real clock, 19:50-20:10 | the same, area-B active at the start | 20 of 20, 15.0-16.6 s | 4 of 4, 21.1-21.2 s | 5 of 5, 1.4-1.9 s |
| two suites at once, the instant and the real clock, 20:10-20:35 | four workers, area-B idle | 40 of 40, 15.0-17.9 s | 8 of 8, 23.6-25.2 s | 10 of 10, 1.3-2.4 s |
| for comparison: the regate's nine full runs and its repetition | one suite | 47 of 48, 14.7-17.2 s (the failure 33.3 s) | 36 of 36, 20.2-22.1 s | 11 of 12, 0.7-1.6 s (the failure 30.2 s) |

So: `1799` is noise (it waits for nothing; the time went into creating the browser page, not into the product, whose
steps take about 1 s); `theme:413` is noise from the same stall (no wait shorter than a transition, no race, no slow
product path). Neither failed in 125 of my runs, including two suites at once at the regate instant. Two suites at once
did not reproduce the stall, so I cannot attribute it to "two full suites only"; it is a host stall of unknown cause.

### 12. DPR 2 seams

PASS (`obs-seam.txt`, `zz-a-seam.spec.ts.txt`, screenshots `auditA-seam-dpr2-*`). A run of three (Tue-Thu) and a single
day (Sat), batch mode, DPR 2, at 1440 (column edges .42 .84 .28 .70 .14 .56) and 1445, 1367, 1601 (.92 .34 .78 .20 .64
.06 .50), light and dark:

- under each inner join, in the 24 device rows below the run, the worst deviation from the shadow 14 CSS px to either
  side: light 2.8 and 3.0/255 at every width (attempt 1 measured 22.5-28.5 there); dark 8.4-9.5/255 in the first two
  device rows only (the 1px ring row of `--elev-lift`), at most 2.9 below them; above the run at most 1.1 (light) and 4.0
  (dark);
- inside the run the join shows the ordinary column rule, drawn as one full and one partial device column (225-249)
  instead of two (212, 212) because of the fractional edge; no light gap, no dark seam;
- a lifted neighbour receives no shadow (each run column's own `box-shadow` is `none`, its `::before` layer reaches 64px
  past each inner edge and the column's clip cuts it); the unselected neighbours receive the run's outer shadow as
  designed (light up to 33.5/255 next to the single day, dark up to 26.1).

## Risks and optional improvements (not proven defects)

- R1. Below 1360px the editor frame of the open column is seen through the side scrim: 4.14:1 (light) and 2.79:1 on the
  Day-cell fill (dark). The page is inert there, so WCAG does not require it, but docs/04 line 46 states "measured 4.82:1
  or more on every column surface" without that limit; add the limit to docs/04 or strengthen the frame under the scrim.
- R2. The account-menu `target-size` flags at 1280 and 1440 stay (accepted justification; finding-free only by
  judgement, not by axe).
- R3. Dark theme, DPR 2: a one-device-pixel dip of 8.4-9.5/255 in the ring row at each inner join of a run; not visible at
  normal size (FIX1 recorded 6-7/255).
- R4. The dialog name's brackets are CSS generated content: included by Chromium, omitted by axe's own algorithm; no
  second browser engine was available to check.
- R5. A lazy screen that takes longer than 5s leaves focus on the page body after an account entry (designed bound).
- R6. Under heavy load (my probes beside a mutant run and the area-B audit), `tests/integration/restore.test.ts` (hook
  10s) and `backup-prune.test.ts` (30s) timed out once; both mandatory `npm test` runs passed. Area B or INT may want to
  look at their budgets.
- R7. The phone More panel keeps focus on More when opened by keyboard (the desktop menu moves it to the first entry);
  acceptable for a disclosure whose panel follows in the Tab order, and docs/04 states the first-entry focus only for the
  desktop menu.
- R8. `theme.spec.ts:413` has no budget of its own: its fixed 400 ms settle checks use 50-72% (phone) and 69-84%
  (desktop, under two suites at once) of the default 30 s, so a host stall longer than about 5-9 s fails it whatever the
  product does (the regate's 21 s stall did, on the phone). Optional: `test.slow()` or an explicit timeout, or one settle
  check per segment followed by direct reads (the transitions are 0.01 ms under the reduced motion the test sets).
- R9 (note on the evidence). The item-11 suites in `export-p` also ran my task-local probes, so `obs-*.txt` holds, after the first probe run
  (18:47-19:00Z), further appended blocks from the same probes inside those suites (simulated 2026-12-31 23:30-23:51 LA
  and the real clock); they agree with the first run except the phone Administration scans that found finding 06.

## Required gates unrun or blocked

- A second browser engine for the dialog name (item 7, focus 7): none installed; NOT VERIFIED.
- NAS items are outside this audit.
- Everything else the brief lists ran.

## Disposition of previous findings

- GATE attempt 1 FAIL reasons in area A (focus clipped at 768-899px; axe a and b; target-size c): closed, closed, closed,
  accepted as justified (R2).
- SWEEP area-A findings 1, 3, 4, 7, 11, 13: closed except 11, which is closed for the `.sheet-day` rules but leaves the
  picker rule (finding 02).
- FIX1 dark residual (6-7/255 at DPR 2): measured 8.4-9.5/255, kept as R3.

## Software readiness, owner permission and pilot

Area A of round 3 is not accepted on 7ce4e95 until findings 01-06 are fixed, frozen, regated and rechecked. No
real sending, deployment or pilot activity was touched; the owner's pilot authorization is unaffected and still pending
(D-1..D-15).

## One next action

A bounded fix task for findings 01-06 (CSS for the focus ring under the pointer, the hover gating and the
coarse-pointer identity height, the Sign out entry layout, the wrapping of the phone delivery badge, one More-panel
Escape assertion, and the hover-spec and phone-Administration checks), then its freeze, a regate and a fresh area-A
recheck on the new digest.

## Independent subagent provenance

- Review task/attempt, reviewer and reviewed authors: WP5-UX3-AUDIT-A attempt 1, timesheet-auditor (fresh context,
  `claude-opus-5-5`); authors of the reviewed slices and fixes are the WP5-UX3 workers, planners and committers on the
  board (none of them this reviewer).
- Fresh context; the reviewer authored no change in the snapshot and edited no source, docs, test, board or STATE file;
  it wrote only this pair, the brief's Results and the evidence folder.
- Digest before and after: `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191` (833 files) in three forms
  both times; gate evidence for this snapshot: WP5-UX3-REGATE.
- New report path, preserving earlier reviews: `handoff/delivery/WP5_UX3_REVIEW_A.md` (first area-A review of round 3).
- Slips (no effect on the evidence): two read-only `grep` pipelines ended in `| head -n 0` (a no-op) at about 18:44Z and
  18:46Z, and one wait loop at about 19:39Z sent `grep`'s error output to `/dev/null` while its marker file did not exist
  yet, all against the brief's rules (`slips.txt`); `head` and `tail` were also run directly on a few task-folder files
  (no pipe). Nothing was fed to python or node through stdin, no heredoc, no recursive delete, no process killed. Servers of the pristine export used OS-assigned loopback ports (the repository
  harness); the probe and mutant exports used 48950-48969 and 48940-48949.
