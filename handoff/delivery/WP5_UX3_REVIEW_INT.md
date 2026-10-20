# WP5 UI change round 3, final recheck and integration pass on 8e55710 (WP5-UX3-AUDIT-INT)

[Tiếng Việt](WP5_UX3_REVIEW_INT.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 3, final recheck of the A2/B2
  findings fixed by WP5-UX3-FIX4 (with the test-only FIX5 and FIX6) and the integration pass whose PASS re-accepts WP5; task
  WP5-UX3-AUDIT-INT, attempt 1, 2026-10-20 from 04:40Z to about 06:10Z (2026-10-19 21:40 to about 23:10 in
  America/Los_Angeles; the displayed period 10/12-10/25 contains today, so the real clock is not a window day; the window day was
  simulated). Reviewer self-reported model `claude-opus-5-5` (board agent `a08c43f46e599d8f4`), profile timesheet-auditor (effort
  set by the profile, not observable from inside). The strongest author model of the snapshot is `claude-opus-5-5` (13 of the 68
  WP5 author tasks; `02-authors.txt`), so the reviewer is not weaker. I authored no WP5 task and I am none of the round-3 planners,
  workers, verifiers or auditors (the board check lists my ID as absent from the author set).
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `8e557100d16b6b6eb86a48e00276835761aabfdf` (the WP5-UX3-FIX6-FREEZE commit, WP5-UX3-REGATE5's target). HEAD = origin/main =
  that commit before and after; 0 status lines outside `handoff/` before and after. Digest
  `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`, 833 files, `handoff/` excluded, recorded first
  (04:44:49Z) and last (05:37:49Z), each time in three equal forms: a clean `git archive` export with no `.git` folder hashed with
  `git hash-object --no-filters`, the `git ls-tree` form (its sorted list byte-identical to the export's) and `npm run digest` in
  the repository. No unpushed commit. Source complete: `npm ci` exit 0 in four exports (three of the target, one of ceb86b6).
- **Decision: PASS.** No finding.
  - Recheck (section 1): F-UX3A2-1, F-UX3A2-2, F-UX3A2-3 and F-UX3B2-1 are closed by my own probes on the target build; the guards
    R-A2-1, R-B2-1 and R-B2-4 hold; every guard mutant is caught (8 of 8; a ninth, characterization mutant survives as expected in
    Chromium, risk R-INT-2). FIX4's whole diff shows no regression in either area, FIX5's test is hour-independent with no weaker
    assertion, FIX6 removes the race and nothing else in `hover.spec.ts` resolves a layout-specific element after a resize.
  - Integration (section 2): the six area and GOV reviews and the gate records are mapped; every finding is closed or carried as an
    optional risk with a reason; every owner item U-01..U-27, N-1, N-2, G-1..G-5, Q6, the 24-hour chip answer and Q7 is judged by a
    named review; every attempt-1 gate FAIL reason, sweep finding and the REGATE timeout deviation has a verdict.
  - Cross-area probes (section 3), AC-13 in three device zones (section 4) and the docs (section 5) hold.
  - Mandatory checks (section 6): typecheck 0, lint 0, `npm test` twice 0 (94 files, 2141 tests), build 0 (main chunk 487.01 kB,
    no advisory), FULL e2e on the real clock exit 0 at the first run: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile
    322/37), no network or buffer error line, so no rerun.

## Scope actually inspected and executed

1. Read as claims, not proof: the brief; AGENTS.md from disk (the copy injected into my context was the owner's unedited text;
   the file on disk equals the blob `94bdcd81` of ceb86b6 and of the target, `36-governance.txt`); docs/08 (audit rules); the
   board's owner and coordinator decisions of round 3; WP5_UX3_REVIEW_A, _B, _A2, _B2, GOV_UX3_REVIEW and GOV_UX3_REVIEW2; the
   Results of WP5-UX3-GATE, -REGATE, -REGATE2, -REGATE3, -REGATE4, -REGATE5, -SWEEP, -DIAG1 and -FIX1 to -FIX6; the U-list of
   WP5-UX3-PLAN.
2. Diffs read in full: `git diff ceb86b6..8629441 -- src tests docs` (FIX4, 8 paths, `20-fix4-diff.txt`), `8629441..5c101c1`
   (FIX5, `tests/e2e/day-editor.spec.ts` only, `21-fix5-diff.txt`), `5c101c1..8e55710` (FIX6, `tests/e2e/hover.spec.ts` only,
   `22-fix6-diff.txt`); `git diff --name-only ceb86b6..8e55710` outside `handoff/` is exactly FIX4's 8 paths
   (`23-names-base-target.txt`). Code read: `AppShell.tsx` (tab bar handlers), `AccountMenu.tsx` (the comparison rules),
   `styles.css` at the mutant sites, `ClockOutDialog.tsx:106`, `breakRowsModel.ts:586-589`, `sessionModel.ts:300-305`, every
   viewport change in `hover.spec.ts`.
3. Mandatory checks in a clean export of the target (`export`), sequentially and alone on the host.
4. Own probes, task-local (`zz-int-*.spec.ts`, copies as `script-*.txt`; Edge through the repository harness, synthetic people on
   `example.invalid`): in a second export of the target (`probe`) and, for comparison, in an export of ceb86b6 (`base`).
5. Nine mutants in a third export of the target (`mut`), each applied alone, client rebuilt, the guarding spec run on both
   projects, the file restored from the pristine export and compared byte-equal; after the last one `src` equals the pristine
   export and the rebuilt `dist` equals the mandatory export's (`62-*.txt`).
6. docs/04, docs/10 and docs/12 (EN and VI) against the frozen behaviour, with two parity scripts.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX3-AUDIT-INT/` (index `00-README.txt`) plus 10
`-synthetic.png` screenshots. Probe and script sources are kept as `script-*.txt`.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; status outside `handoff/` | `507de97c…a2f6b6`, 833 files every time; export list = `ls-tree` list; no `.git` in the export; HEAD 8e55710 = origin/main; 0 lines | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (four exports), `npm run build` (probe, mut, base) | 0 each | `30-setup-exits.txt`, `30-ci-*.txt`, `30-build-*.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 deprecation lines (run with `--trace-deprecation --pending-deprecation`) | `10-main-exits.txt`, `10-typecheck.txt`, `10-lint.txt` |
| `npm test` twice | 0 and 0: 94 files, 2141 tests each | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | 0; main `index-DyUV--8_.js` 487.01 kB (gzip 143.17), AdminScreen 31.57 kB, ImportScreen 23.82 kB, CSS 79.40 kB; no chunk-size advisory | `10-build.txt` |
| AC-13 under TZ America/Los_Angeles, Asia/Tokyo, America/New_York (child-process TZ, probed) | 0, 0, 0; 1/1 each; probe offsets 420, -540, 240 | `14-ac13-*.txt`, `14-tzprobe-*.txt` |
| FULL e2e, real clock, both projects (04:48:31-05:04:50Z) | exit 0: 651 passed, 67 skipped, 0 failed (desktop 329/30/0, mobile 322/37/0), 16.3 min; 0 deprecation and 0 buffer or network lines | `11-e2e-real.txt`, `11-e2e-real-counts.txt` |
| dist comparisons | probe and mut builds equal the mandatory build (236 files); `dist/server` 180 and `dist/domain` 46 files of ceb86b6 equal the target's | `34-dist-*.txt` |
| server and domain boundary | `git diff --stat a643794..8e55710 -- src/server src/domain src/client/api.ts package.json package-lock.json` empty; the same from ceb86b6 empty | `35-boundary.txt` |
| governance paths since the GOV2 freeze | `git diff --stat ceb86b6..8e55710` over AGENTS, CLAUDE, docs/08, prompts, templates, `.claude`, `.agents`, docs/agents, validators, precommit: empty | `36-governance.txt` |
| probes, target, real clock (run 1) | 38 passed, 6 skipped by project, 4 failed by probe bugs of mine (repaired, below) | `60-run-p-target.txt`, `p-target-errors.txt`, `50-obs-target-*.txt` |
| probes, target, repaired ones (run 2) | 11 passed, 1 skipped by project | `60-run-p-target-r2.txt`, `50-obs-target-r2-*.txt` |
| probes, base ceb86b6 | 18 passed | `60-run-p-base.txt`, `50-obs-base-*.txt` |
| pill probe at 2026-10-26T16:00:00Z (FIX10 clock) | 2 passed, twice (run 2 with the sheet path) | `60-run-p-pill-1026*.txt`, `50-obs-target-sim1026*-pill.txt` |
| FIX5 test alone at four simulated instants | 2 passed at each | `60-run-fix5-*.txt` |
| mutants | 9 run: 8 guards caught, 1 characterization survives | `60-mutants-summary.txt`, `61-mut-*-diff.txt`, `61-mut-*-e2e.txt` |
| docs parity | shape equal in the three pairs; every token difference is a translated section name or quoted canonical text | `40-docs-parity.txt`, `41-docs-parity-lines.txt` |

## 1. Recheck of the A2/B2 findings and of FIX4, FIX5 and FIX6

| Item | Verdict | Basis (own runs on the target build) |
|---|---|---|
| F-UX3A2-1 (Medium): the phone More panel stays open after focus leaves; focused pickers hidden | **Closed** | Both projects at 390x844 (`50-obs-target-more.txt`): keyboard open, Tab through Profile, Settings, Import, Theme, Sign out; the Tab past Sign out (Tab 6) closes the panel; then 54 more Tab presses walk 47 distinct stops of the page and the bar: 0 entirely hidden, 0 partly covered (25 sample points each). On ceb86b6 the same probe: the panel never closes and 12 stops are entirely hidden, 2 partly (`50-obs-base-more.txt`, `int-more-hidden-focus-390-base-synthetic.png`). Escape from Settings and from Sign out closes it and returns focus to More (`aria-expanded` false); Shift+Tab back past the first tab closes it; Shift+Tab inside the bar keeps it open. Guards: MA1 (close removed) and MA1b (only a targeted blur closes, the AccountMenu rule) fail `shell.spec.ts:779` on both projects |
| F-UX3A2-2 (Low, test strength): button-link and phone-tab rings under the pointer unguarded | **Closed** | M4 (`.button-link:focus-visible:hover` removed) and M5 (`.shell-tabs .tab:focus-visible:hover:not(:disabled)` removed) each fail `hover.spec.ts:718` on the desktop project, light and dark (the mobile project cannot hover by design) |
| F-UX3A2-3 (Low): Sign out 3px out of line | **Closed** | Menu at 1280 and More at 390, employee and administrator, light and dark, both projects (16 cases, `50-obs-target-signout.txt`): every entry's icon starts at 12px and its words at 42px inside the entry, gap 12, centre offset 0.88; Sign out keeps its 1px border with 11px inline padding; worst difference to Profile 0px. On ceb86b6: Sign out 15/45, 3px (`50-obs-base-signout.txt`; screenshots `int-account-entries-1280-{target,base}-synthetic.png`). MA3 (the padding line removed) fails `shell.spec.ts:1135`, 4 tests |
| F-UX3B2-1 (Low, test strength): the removal note's absence unguarded | **Closed** | M6a (note condition without `session.breaks.length > 0`) fails `day-editor.spec.ts:1882` (E-1 Check out without saved rows) on both projects; the assertions (`:1814` with a saved row kept, `:1897-1907` as the dialog opens without saved rows and after a row is added and removed) read in the diff |
| R-A2-1: the hover scan judged media by text | **Closed** | `collectHoverRules` also lists the rules whose enclosing media all match on the device (`hover.spec.ts:576-598`); the touch-screen test `:646` asserts hover none and pointer coarse first. M6b (`tbody tr:hover` under `(hover: hover), (pointer: coarse)`) fails `:646` on both projects. Residual limit: style rules nested inside style rules are not visited (none in the sheet) |
| R-B2-1: "Confirm breaks" on a session ended today unpinned | **Closed** | M5b (a device-clock past-day gate in `confirmBreaksRows`) fails `day-editor.spec.ts:3941` on both projects on the real clock (the FIX5 version of the test) |
| R-B2-4: the test-oracle comment on `suggestedRows` | **Closed** | `sessionModel.ts:300-303` says it is a test oracle; `git grep` finds callers only in `breakRowsModel.test.ts` and `sessionModel.test.ts` (`33-suggestedRows.txt`) |
| FIX4's whole diff, both areas | **No regression** | See "More panel behaviour" below; the desktop menu at 1280 unchanged (Tab past Sign out closes it with focus on Check in, Escape returns focus to the identity button, an outside press closes it); account entries above; the full e2e green; `dist/server` and `dist/domain` byte-equal to ceb86b6; the only CSS change is one token expression (`calc(var(--space-3) - var(--hairline))`); docs/10 line 240 names 487.01 kB, the measured chunk |
| FIX5's test | **Hour-independent; no weaker assertion** | Alone on both projects under the FIX10 clock at 00:30 PDT (2026-10-20T07:30Z), 12:00 PDT, 23:45 PDT and 01:30 PST after the fall-back (2026-11-01T09:30Z): 2 passed each; REGATE4 adds 00:30, 02:00 and 23:30. Every FIX4 assertion is kept (session before, row time, 15 min, "suggested", no PUT before Save, "1 break (15 min)", the PUT body, the stored session); added: the person's zone equals the chosen `Etc/GMT` zone and the whole session lies on the server's `today_local`. The offset `((23 - UTC hour) mod 24) - 11` makes local time 12:xx at any UTC hour (offsets -11..+12, all valid `Etc/GMT` zones). The dropped clean-up concerns the test's own new person |
| FIX6's selector | **Race gone; no other site** | Replica of lines 753-756 with the matchMedia `change` event deferred 150 ms, 20 rounds each (`50-obs-target-race.txt`): the pre-FIX6 selector resolved the stale desktop `.sheet-date` 20 of 20 times (detached afterwards 20); the FIX6 selector 0 of 20. In `hover.spec.ts` the viewport changes at lines 161, 436 and 722 happen before sign-in or before the page is prepared; only line 753 resizes a loaded page, and its next locators are the phone-only `.sheet-day-button` and the tab bar link, which both layouts keep (`24-hover-viewport.txt`, `24-hover-snips.txt`). DIAG1's two unchecked sites (`focus-ring.spec.ts:228`, `surfaces.spec.ts:151`) resolve without a resize before them (`39-other-resize.txt`) |

**More panel behaviour after FIX4** (both projects at 390x844: the mobile project is a touch phone, the desktop project a narrow
window with a fine pointer; `50-obs-target-more.txt`, `50-obs-target-r2-more.txt`):

- A press on More with focus inside the panel removes the panel once, and the next press adds it once (MutationObserver: no
  close-then-reopen flicker), by click and by tap. A press on the panel's own header keeps it open.
- An outside press closes it: on the period title text and on a control of the page ("Change several days").
- A page change closes it: the Overtime tab link and an address change to `#/history`.
- Entries (administrator): Profile, Settings, Administration and Import by keyboard close the panel and focus the new page's `h1`
  with the ring; the entry of the page already shown returns focus to More; a pointer entry focuses the `h1` without the ring.
- Arrow keys in the Theme radios keep the panel open with focus inside it.
- Mutant MA1c (every targetless blur closes, the Tab condition dropped) survives: in Chromium a pressed More takes focus, so the
  targetless branch is reached only after a Tab. Risk R-INT-2.

## 2. Integration of the round's records

### 2.1 Reviews and gates

| Record (snapshot) | Decision | Integration verdict |
|---|---|---|
| GOV_UX3_REVIEW (79b9a53) | PASS | Current for the UI section: no governance path changed since ceb86b6 (`36-governance.txt`) and GOV2 left items 1-13 and the UI section byte-equal. Its R1 and R2 are closed (section 2.6) |
| WP5-UX3-GATE (cecfceb) | FAIL | Every reason closed (2.3) |
| WP5-UX3-SWEEP (cecfceb) | 13 findings | Every finding has a verdict (2.4) |
| WP5-UX3-REGATE (7ce4e95) | PASS with a recorded timeout deviation | Deviation settled (2.5) |
| WP5_UX3_REVIEW_A (7ce4e95) | FIX REQUIRED, F-UX3A-01..06 | All closed by FIX3, rechecked in A2; history |
| WP5_UX3_REVIEW_B (7ce4e95) | FIX REQUIRED, F-UX3B-1..2 | Both closed by FIX3, rechecked in B2; history |
| GOV_UX3_REVIEW2 (ceb86b6) | PASS | Current: AGENTS.md and AGENTS.vi.md unchanged since ceb86b6 |
| WP5-UX3-REGATE2 (ceb86b6) | PASS | Its items are superseded by REGATE3 to REGATE5 for the later snapshots |
| WP5_UX3_REVIEW_A2 (ceb86b6) | FIX REQUIRED, F-UX3A2-1..3 | Closed here (section 1); history |
| WP5_UX3_REVIEW_B2 (ceb86b6) | FIX REQUIRED, F-UX3B2-1 | Closed here (section 1); history |
| WP5-UX3-REGATE3 (8629441) | FAIL, item 4 only (time-of-day test) | Closed by FIX5 (REGATE4 item 4, section 1) |
| WP5-UX3-REGATE4 (5c101c1) | FAIL, item 2 (three real-clock flakes) | DIAG1: two `net::ERR_NO_BUFFER_SPACE` host events and one race, fixed by FIX6; REGATE5 PASS; my first full run had no failure |
| WP5-UX3-REGATE5 (8e55710) | PASS | Same snapshot as this audit; its carried items rest on byte-identical builds, which I confirm (`34-dist-*.txt`) |

Carry-forward rule: after ceb86b6 only the tab bar handlers in `AppShell.tsx`, one line of `styles.css`, a comment, three e2e
specs and docs/10 line 240 changed (FIX4), then two tests (FIX5, FIX6). `dist/server` and `dist/domain` are byte-equal to ceb86b6.
So every verdict of A, A2, B and B2 outside the account menu and the More panel stays valid as recorded, and the parts FIX4 touched
were measured again here (section 1 and 3).

### 2.2 Owner items and the review that judged them

| Owner item | Judged by | Status at the target |
|---|---|---|
| U-01 modern style (governance and tokens) | GOV_UX3_REVIEW (text); AUDIT-A item 1, item 2 | PASS; carried |
| U-02 contrast, raised week sheet | AUDIT-A item 1 | PASS; carried |
| U-03 identity block | AUDIT-A item 1, F-UX3A-03 (44px coarse) closed in A2 | PASS; carried; shared view keeps the signed-in person (section 3) |
| U-04 avatar menu (and More) | AUDIT-A item 1; F-UX3A-04 (A2); F-UX3A2-1, F-UX3A2-3 | PASS here (section 1) |
| U-05 Settings and Administration moved | AUDIT-A item 1 and section 3 | PASS; reachable for an administrator at 13 widths (section 3) |
| U-06 wordmark | AUDIT-A item 1 | PASS; carried |
| U-07 check in/out on the title row, U-08 no name line | AUDIT-A item 1 | PASS; carried |
| U-09 pills | AUDIT-A item 1 | PASS; carried; pills seen again (section 3) |
| U-10 meta row, U-11 Open a day row, U-12 toolbar spacing | AUDIT-A item 1 | PASS; carried |
| U-13 editing column, U-14 lifted columns | AUDIT-A item 1, items 5 and 12; A2 seams | PASS; carried |
| U-15 Category, U-16 Status | AUDIT-A item 1 (with G-2 a) | PASS; carried |
| U-17 Current, U-18 Open a day words | AUDIT-A item 1 | PASS; carried |
| U-19 short note (chips), U-20 header surface | AUDIT-A item 1 and 6 | PASS; chips seen again (section 3) |
| U-21 session dialog and break table | AUDIT-B sections 2 and 7 | PASS; carried |
| U-22 delete confirmation | AUDIT-A item 6, AUDIT-B section 6 | PASS; seen in a shared edit view (section 3) |
| U-23 pre-fill | AUDIT-B section 4 (G-3 a) | PASS; carried |
| U-24 "Confirm no breaks taken" and rows | AUDIT-B section 3; F-UX3B-1 (B, B2) | PASS; carried |
| U-25 Save confirms | AUDIT-B section 3 | PASS; carried |
| U-26 confirmation before Save and on a changed Cancel | AUDIT-B sections 3 and 8 (Check out, FIX2 item 8) | PASS; stack re-walked (section 3) |
| U-27 WFH on the Category row | AUDIT-A item 1 | PASS; carried |
| N-1 phone break rows, chips and sub-dialog | AUDIT-B section 7 | PASS; sub-dialog stack re-walked (section 3) |
| N-2 phone dialog spacing | AUDIT-B section 7 (judged, audit-focus item 9) | PASS; carried |
| G-1 b square sheets, 4px lift, no shadow on a lifted neighbour, floating panel | AUDIT-A item 1 and 12; A2 seams | PASS; carried |
| G-2 a Category / Status | AUDIT-A item 1 | PASS; carried |
| G-3 a pre-fill and the rule rewrite | AUDIT-B section 4; docs (section 5) | PASS; carried |
| G-4 owner variant (notice, then confirmation) | AUDIT-B section 3 (audit-focus item 8) | PASS; re-walked at 1280 (section 3) |
| G-5 b "in progress" | AUDIT-A item 1 (mutants A6, A10); sweep 3 and FIX2 item 3 | PASS; re-measured on a window day (section 3) |
| Q6 b break date only across midnight | AUDIT-B sections 2 (E14) and 7 | PASS; carried |
| 24-hour chip answer | AUDIT-B section 7 | PASS; chip "Break 1 · 10/17/2026 00:00 → 00:15" seen (section 3) |
| Q7 AGENTS.md text | GOV_UX3_REVIEW2 | PASS; current (no change since) |

No area is left unaudited: area A (visual, shell, settings, sheet, accessibility), area B (break entry integrity and dialogs),
governance (GOV and GOV2) and the cross-area behaviour of this pass.

### 2.3 Attempt-1 gate FAIL reasons (WP5-UX3-GATE on cecfceb)

| Reason | Verdict |
|---|---|
| 1a lifted-column test measured across week bands on Tuesdays | Closed: FIX1 item 1; REGATE ran Tuesdays 10-20 and 11-03; AUDIT-A item 10 |
| 1b order-dependent 409 at the seed (`timesheet.spec.ts:452`) | Closed: FIX1 item 2; REGATE two runs at 11-28; AUDIT-B section 8 with mutants |
| 2 keyboard focus clipped in the week card at 768-880px | Closed: FIX1 item 3; REGATE and REGATE2 walks; AUDIT-A sections 5 and 10 |
| 3a axe `label-content-name-mismatch` on the category trigger | Closed: FIX1 item 4; REGATE, REGATE2, REGATE3 axe |
| 3b the same on the phone suggested-break chips | Closed: FIX1 item 5; same scans |
| 3c `target-size` of Today under the open account menu | Accepted as optional risk R2 of AUDIT-A: the menu is user-opened, non-modal and transient (WCAG 2.2 note to SC 2.4.11); unchanged |
| (measured, not a reason) shadow notch at inner joins | Closed: FIX1 item 7; AUDIT-A item 12 and A2 seams |

### 2.4 Sweep findings 1-13 (WP5-UX3-SWEEP)

| # | Verdict |
|---|---|
| 1 focus after an account entry | Closed: FIX2 item 1; AUDIT-A section 3; re-measured for More here (section 1) |
| 2 M18 survived | Closed: FIX2 item 2; AUDIT-B mutant A09 |
| 3 editor chip "future period" for an in-progress day | Closed: FIX2 item 3; AUDIT-A mutant A10; re-measured on a window day (section 3) |
| 4 "label" wording | Closed: FIX2 item 4; AUDIT-A section 10; REGATE |
| 5 docs/12 remedy at Check out | Closed: FIX2 item 5, then FIX3 (R-UX3B-3); AUDIT-B2 |
| 6 docs/10 chunk figure | Closed: FIX2, then FIX4 item 8 (487.01 kB, equal to my build) |
| 7 M21 survived | Closed: FIX2 item 7; AUDIT-A section 10 |
| 8 Check out discard question | Closed: FIX2 item 8; AUDIT-B section 8 |
| 9 docs/10 section reference | Closed: docs/10 line 226 now names "document 04, the paragraph after the Screens table, line 16 before round 3" |
| 10 unused helpers | Closed: FIX2 item 10 (AUDIT-B), then FIX3 removed `quickBreaksOf`; `suggestedRows` marked (R-B2-4) |
| 11 ungated hover rule | Closed: FIX2 and FIX3 (F-UX3A-02, A2); now guarded by matching (R-A2-1) |
| 12 Check out after removing saved rows | Closed: F-UX3B-1 (FIX3, B2) and its guard F-UX3B2-1 (FIX4, here) |
| 13 Category hint not linked | Closed: FIX2 item 13; AUDIT-A section 10 |

### 2.5 The REGATE timeout deviation

AUDIT-A item 11 judged the two mobile timeouts of the 2026-12-31 run (`theme.spec.ts` contrast test, `timesheet.spec.ts:1799`)
as load noise from one host stall of about 21 s, with the tight budget of the contrast test as risk R8. FIX3 item 12 gave that
test a 120 s budget and a bounded retry of its own poll timeouts; A2 judged it sound (mutant M12) and closed R8. In my full run the
contrast test (now `theme.spec.ts:430`) took 20.6-21.7 s on the desktop and 15.5-16.7 s on the phone, and `timesheet.spec.ts:1799`
took 1.1 s, all passed (`11-e2e-real-counts.txt`). Verdict: confirmed, closed.

### 2.6 Risk register

Closed: A R1 (docs/04 line 46 states the scrim limit) and R8; A2 R-A2-1; B R-UX3B-3 and R-UX3B-4; B2 R-B2-1 and R-B2-4; REGATE2
observation 3 (docs/10 label); GOV R1 (docs/04 line 96 now says "readable density") and R2 (`--transition-duration` set locally
through the shared `--transition`, docs/04 line 90).

Carried as optional risks, each with its reason as recorded and unchanged by the later diffs: A R2 (target-size under the open
menu, justified), R3 (dark DPR 2 one-device-pixel dip, invisible at normal size), R4 (generated brackets in the dialog name, no
second engine), R5 (a lazy screen slower than 5 s leaves focus on the body, designed bound), R6 and B R-UX3B-6 (integration-test
timeouts under heavy parallel load; none in my two `npm test` runs), R7 (More keeps focus on itself when opened by keyboard;
seen again here), R9 (evidence note); A2 R-A2-2 (phone fault code breaks inside the identifier), R-A2-3 (button-link hover style,
pre-existing), R-A2-4 (network flake), REGATE2 observation 2 (away first screen 2.2px lower, within budget); B R-UX3B-1, -2, -5,
-7; B2 R-B2-2, -3, -5; GOV R3 (stale injected context, seen again in this audit), R4 (inactive Today dimmed: the earlier reading
stands, the state is also programmatic), R5, R6 (GLOSSARY.md and `docs/adr/` absent, governance backlog); GOV2 R1-R9 (owner notes,
backlog wording, information); DIAG1's optional fixture hardening (not adopted; the rerun rule applies).

## 3. Cross-area behaviour (own probes)

| Probe | Result |
|---|---|
| Floating editor at 1280 with stacked dialogs (`50-obs-target-r2-stack.txt`, `int-stack-notice-1280-target-r2-synthetic.png`) | The editor is modal and docked left of a Friday column; the bar is inert (script focus refused; 40 Tab presses never reach a page control, they only pass through the browser). Session dialog on top (editor inert behind it), then the "No breaks listed" notice (session dialog inert behind it; focus on "Go back and add breaks"). Escape order: the notice closes with focus on "Add break"; "Leave breaks unconfirmed for now" opens "Save this session?" (focus Back) and Escape returns to the dialog with focus on Save; Escape in the changed dialog asks "Discard your changes?" (focus Keep editing), Escape there keeps editing; Discard closes with focus on "Add session"; Escape closes the editor with focus on the day's date button. No write during the walk. axe 4.14.0: 0 violations at levels 1 and 3 |
| Phone 390 (both projects): editor sheet, session dialog with chips, "Break 1" sub-dialog | More open, then a press on a day: the panel closes and the sheet opens; More is inert behind the sheet (script focus refused, the sheet paints its centre). Overnight session: chips layout; the sub-dialog is the third modal (everything behind inert). Escape: sub-dialog to the chip, dialog to Edit, sheet to the day button; More works again afterwards. axe 0 violations (`int-stack-subdialog-390-target-r2-synthetic.png`) |
| Account menu over the non-modal editor at 1366 (`50-obs-target-menu-editor.txt`, `int-menu-over-editor-1366-target-synthetic.png`) | Every menu entry is on top at its centre over the editor panel; Escape closes only the menu (focus identity, editor open); keyboard opening focuses Profile; Tab past Sign out closes the menu with the editor open; an outside press closes it; Escape in the editor then closes the editor (focus to the day button); the Settings entry leaves the screen with focus on the Settings `h1`. axe 0 violations. At 1280 the modal editor keeps the identity button inert |
| Shared view, view only and edit, both projects (`50-obs-target-r2-shared.txt`, `int-shared-*-editor-target-r2-synthetic.png`) | The bar and the account content show the signed-in grantee, never the owner; no Check in/out; pills "current" and "Draft". View only: no Open a day, Change several days or Category pickers; the dialog is named "Day …" with the chips period, zone and "View only"; session card and break table without Add, Edit, Delete or Confirm breaks; only the login is written. Edit: the tools are there; "Confirm breaks" lists the 3 inside suggestions, Save goes through "Save this session?" and the PUT goes to `/api/shared/:ownerId/sessions/…` (owner's session then confirmed with 3 breaks); the delete confirmation's Cancel sends nothing. Requests outside `/api/shared/:ownerId`: only the pre-login `GET /api/auth/setup`. axe 0 violations in all four editor scans |
| "in progress" pill and editor chip (`50-obs-target-sim1026-r2-pill.txt`, `int-pill-window-day-target-sim1026-r2-synthetic.png`) | FIX10 clock at 2026-10-26 09:00 PDT (window day; current 10/12-10/25, in progress 10/26-11/08): landing pill "current"; today through Open a day: chip "in progress"; a day of the displayed period: "current period"; Today: pill "in progress"; today from that sheet and through Next: chip "in progress". Real clock (not a window day): pill "current", chip "current period", next period "future" |
| Settings and Administration for an administrator (`50-obs-target-admin.txt`) | 13 widths from 1920 to 320 on both projects, without and with a received share: the account menu (from 768px) or More (below) lists Administration; pointer entry, the "Settings sections" link and `#/admin` reach the Administration `h1`; the keyboard Settings entry focuses the Settings `h1`; no sideways scroll |

## 4. AC-13

`tests/integration/ac13-two-week.test.ts` run through a child process with `TZ` set: America/Los_Angeles (probe offset 420
minutes), Asia/Tokyo (-540) and America/New_York (240): exit 0 with 1/1 each (`14-*.txt`). The scenario fixes its own reporting
zone, so the device zone must not change it, and it does not.

## 5. Docs

- docs/04 (EN and VI) describes the frozen behaviour I observed: line 7 (account menu and More content, Escape, outside press,
  page change, Tab past Sign out, entry focus), line 13 (Settings sub-pages, `#/admin`), line 14 and 63 (shared views, "View
  only" chip), lines 53 and 63 (the "in progress" pill and chip), lines 62 and 68 (modal floating panel, one modal on top, Escape
  and focus returns), line 67 (24-hour chips, sub-dialog), line 70 (Check out removal note), line 96 ("readable density").
- docs/10 line 240 (VI 241) gives 487.01 kB, equal to my build (`index-DyUV--8_.js`, the same file name as REGATE3's build);
  lines 219-246 carry the round-3 owner answers and coordinator decisions, including G-3's rule text.
- docs/12 lines 35-41 and 71 match the behaviour.
- EN/VI: headings, bullets and table rows equal in the three pairs; line by line over the round-3 ranges the only token
  differences are translated section names and quoted canonical sentences, and "round 3" written as "thứ ba" (`40-*`, `41-*`).
- AGENTS.md on disk is the text GOV2-AUDIT accepted; FIX4's one style change uses tokens only (AGENTS UI rule 1).

## 6. Mandatory checks (clean export of the target; `10-main-exits.txt`)

| Command | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 deprecation lines |
| `npm run lint` | exit 0, 0 deprecation lines |
| `npm test` (twice) | exit 0 both; 94 files, 2141 tests each |
| `npm run build` | exit 0; main chunk 487.01 kB; no chunk-size advisory |
| AC-13 in three device zones | exit 0 each (section 4) |
| FULL e2e, both projects, real clock | exit 0 at the first run: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile 322/37), 16.3 min; no `ERR_NO_BUFFER_SPACE` or other network line, so the rerun rule was not needed |

## Findings

None. No product defect and no test-strength gap of Low or higher severity was found on the target.

## Risks and optional improvements (not proven defects)

- **R-INT-1 (docs precision).** docs/04 line 7 writes out Escape, the outside press, the page change and Tab past Sign out for the
  desktop menu, and for More only that it "holds the same account content". The More panel behaves the same way (section 1); one
  sentence would state it (Escape returns focus to More; focus leaving the tab bar, also by Shift+Tab, closes it).
- **R-INT-2 (unverified engine).** The More panel's targetless-blur branch closes only after a Tab key, so that a press on More
  in an engine where a pressed button takes no focus (WebKit: Safari on iPhone and macOS) does not close and reopen the panel. In
  Chromium that branch cannot be told apart (mutant MA1c survives) and no other engine is installed: NOT VERIFIED there, as for
  the earlier second-engine items.
- **R-INT-3 (host).** `net::ERR_NO_BUFFER_SPACE` still occurs under load: once during my mutant MA1 run (`shell.spec.ts:478`
  mobile, console guard, unrelated to the mutant; `mut-MA1-320.txt`). My mandatory run had none. The rerun rule covers it.
- **R-INT-4 (information).** From 768 to 1023px with a received share the desktop bar takes two rows (102px; 128px on the mobile
  project's emulation). docs/04 promises one row only from 1024px, where it holds.

## Required gates unrun or blocked

- Every check of the brief ran. A second browser engine is not installed: NOT VERIFIED for engine-specific behaviour (R4,
  R-INT-2), as in every earlier round-3 audit. The drill, compose, `npm audit`, the DPR 2 seams and the full axe list were not in
  this brief; they rest on REGATE3 to REGATE5 and A2 with byte-identical builds (`34-dist-*.txt`). NAS items stay outside.

## Disposition of previous findings

- F-UX3A2-1, F-UX3A2-2, F-UX3A2-3 (WP5-UX3-AUDIT-A2) and F-UX3B2-1 (WP5-UX3-AUDIT-B2): closed on 8e55710.
- R-A2-1, R-B2-1, R-B2-4: closed. Earlier findings F-UX3A-01..06 and F-UX3B-1..2: closed in A2/B2, still valid on the target.
- REGATE3's time-of-day failure and REGATE4's race: closed by FIX5 and FIX6; REGATE4's two buffer events: host, rerun rule.

## Software readiness, owner permission and pilot

- Software readiness: this PASS re-accepts WP5 after UI change round 3 on 8e55710 / `507de97c…`, together with the
  WP5-UX3-REGATE5 PASS on the same snapshot.
- Owner permission: none requested or given; no deployment, no real mail, synthetic data only.
- Pilot result: none; no pilot has run. D-1..D-15 stay pending.

## One next action

Coordinator: record WP5-UX3-AUDIT-INT PASS (reviewed_commit 8e55710, digest 507de97c), run the WP5 re-accept commit with this
review pair and evidence, refresh the release identity in the pilot packet, and tell the owner R-INT-1 (one docs/04 sentence) as
optional.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX3-AUDIT-INT attempt 1, timesheet-auditor, board agent
  `a08c43f46e599d8f4`. Authors of the snapshot: the WP5 workers and planners on the board (round 3: T01-T10, T05B, T08B, FIX1-FIX6,
  GOV, GOV2, PLAN, PLAN2, SWEEP, DIAG1; FIX4 and FIX5 `a8f4f5e3891cdacbf`, FIX6 `acf6febcfc061feee`); the round-3 reviewers were
  A `a86e1ea01994c05f3`, B `a5ec67dc3fe32bb69`, A2 `a8b394d336bd441d1`, B2 `a342a5834865a6e27`, GOV `a4c120e2f4b43f612`, GOV2
  `a425d954ed94e4526`.
- Fresh context; the reviewer authored no change in the snapshot and edited no source, docs, test, AGENTS, board or STATE file; it
  wrote only this pair, the brief's Results and the evidence folder.
- Digest before and after: `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6` (833 files) in three forms both
  times; gate evidence for this snapshot: WP5-UX3-REGATE5 (PASS).
- New report path, preserving earlier reviews: `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`; every earlier review is
  unchanged.
- Rule slips (read-only, no effect on any result; `96-slips.txt`): nine display commands piped into `head` or `tail` and one
  `od -c` read piped into `tail`; one grep output written by a mistyped path to the parent of the task folder and moved into it at once. Probe
  repairs (not product findings): the phone page heading is screen-reader only, so the first outside-press step waited for an
  invisible element; a view-only share has no "Open a day", so the first view-only run waited for it; the first inert check
  counted the browser's own focus stop as leaving the modal. Each was repaired and rerun (run 2). Nothing was fed to node or
  python through stdin, no heredoc, no recursive delete, no process killed; the harness picks loopback ports itself, and only
  `SMOKE_PORT` 49140 was set. Nothing of this audit is left running.
