# WP5 UI change round 3, recheck of area B (break entry integrity and dialogs) after WP5-UX3-FIX3, on ceb86b6 (WP5-UX3-AUDIT-B2)

[Tiếng Việt](WP5_UX3_REVIEW_B2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 3, recheck of area B after the fix
  round WP5-UX3-FIX3 and the passed regate WP5-UX3-REGATE2; task WP5-UX3-AUDIT-B2, attempt 1, 2026-10-19 from 21:52Z to about
  23:10Z (14:52 to about 16:10 in America/Los_Angeles; the displayed period 10/12-10/25 contains today). Reviewer self-reported
  model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside). The strongest author
  model of the snapshot is `claude-opus-5-5` (PLAN, PLAN2, T06, T08, FIX1, SWEEP; FIX3 and the other slices sonnet), so the reviewer
  is not weaker. The area-A recheck WP5-UX3-AUDIT-A2 ran on the same machine at the same time with its own full e2e runs
  (`90-load.txt`).
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (the WP5-UX3-GOV2-FREEZE commit: the FIX3 freeze a78ada5 plus the AGENTS pair).
  HEAD = origin/main = ceb86b6 before and after; `git status` outside `handoff/` empty before and after. Digest
  `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files, `handoff/` excluded, recorded first and last,
  each time in three equal forms: a clean `git archive` export without `.git` hashed with `git hash-object --no-filters`, the
  `git ls-tree HEAD` form (sorted list byte-identical to the export's), and `npm run digest` in the repository. Source complete:
  `npm ci` exit 0 in every export.
- **Decision: FIX REQUIRED** (one Low test-strength finding, F-UX3B2-1; no product defect, no Medium or higher).
  - F-UX3B-1 is closed and the coordinator's behaviour choice is sound (section 2): with saved rows at the start and every row removed
    with the box unticked, Check out sends `breaks: []` unconfirmed, 200, no rows, the day `incomplete_breaks`, and the dialog says so;
    with no saved rows the list stays omitted (E-1); no 422 in any case of the brief; the note matches what is recorded.
  - F-UX3B-2 is closed (section 3): "Confirm breaks" lists the suggestions inside the session (1, 2, 3 or none; exact edges; overnight;
    two DST days by elapsed time; an input zone other than the reporting zone; today's ended session), pinned exactly like the
    new-session pre-fill; when suggestions appear is unchanged.
  - No regression (section 4): the 24 first-pass matrix cases FIX3 did not intend to change, 8 unchanged Check out cases and 7
    unchanged "Confirm breaks" cases are byte-identical to 7ce4e95; the server and `dist/server`, `dist/domain` are unchanged; the removal
    of the four `quickBreaksOf` tests weakens nothing.
  - Eight own mutants (section 5): six are caught; M6a (the removal note shown without saved rows) survives every test and is the
    finding; M5b (a past-day gate in `confirmBreaksRows`) survives and is risk R-B2-1.
  - The mandatory checks pass (section 7).

## 1. Scope actually inspected and executed

1. Read as claims, not proof: AGENTS.md from disk at ceb86b6 (rules 7 and 8); docs/08 "Gates and independent audit"; the first
   area-B review `WP5_UX3_REVIEW_B.md` (F-UX3B-1, F-UX3B-2, R-UX3B-1..7, the request matrix) and its evidence;
   `WP5-UX3-FIX3.md` (Results), `WP5-UX3-REGATE2.md` (Results); the board's owner decisions of 2026-10-15/16 (the U-01..U-27 request,
   G-1..G-5 with the G-4 owner variant, N-1, N-2, Q6 b) with U-21..U-26 in `WP5-UX3-PLAN.md`, and the coordinator decision of
   2026-10-16 "WP5-UX3-AUDIT-A FIX REQUIRED" with the two behaviour choices; docs/02 R-02, docs/04 lines 65, 66 and 70, docs/10 E-1
   (line 101), D-02 (line 16), lines 238 and 245, docs/12 line 71, EN and VI.
2. Code read in full for the changed area: `ClockOutDialog.tsx`, `breakRowsModel.ts` (save modes, `buildCheckOutDialogRequest`,
   `suggestionRows`, `confirmBreaksRows`), `SessionDialog.tsx` (starting draft), `ClockProvider.tsx` (how the dialog gets its session),
   `BreakRows.tsx` (hints), the server's `clockOut` (`timesheetCommands.ts:570-633`); the FIX3 diff
   `git diff 7ce4e95..a78ada5 -- src tests docs` (20 files): its `src` part whole, the area-B test hunks whole (`breakRowsModel.test.ts`, `dayEditorModel.test.ts`, `dayModel.test.ts`,
   `day-editor.spec.ts`) and the changed docs lines as frozen; the area-A hunks (`styles.css`, the hover, shell, admin-status and theme
   specs) belong to WP5-UX3-AUDIT-A2.
3. Own probes on a clean export of the target and of 7ce4e95 (task-local, Edge, a fresh synthetic person per case on
   `example.invalid`; copies in the evidence as `*.spec.ts.txt`): the first-pass request matrix on both builds (`zz-audb2-req`), twelve
   Check out starting cases on both builds and both projects (`zz-audb2-checkout`), sixteen "Confirm breaks" cases plus pinning and
   gating checks on both builds (`zz-audb2-confirm`); eight own mutants.
4. Mandatory checks in a clean export of the target (section 7).

## 2. F-UX3B-1: Check out after saved rows are removed (closed)

Method (`zz-audb2-checkout`, both builds, desktop 1280x800 rows and phone 390x844 chips, device zone America/Los_Angeles): for each case
a fresh synthetic person gets a running session through the API (POST `/api/days/2026-10-19/sessions`, start 07:00, `end: null`,
unconfirmed) with saved rows A (08:00-08:15, inside) and L (from about one to four minutes after now, so it ends after the Check out);
the Check out dialog is driven through the UI; every POST `/api/clock/out` is captured raw with its status; the session and the day's
calculation are read back. Results are the same on both projects (`44-checkout-desktop-compare.txt`, `44-checkout-mobile-compare.txt`).

| Case (target) | Dialog before Check out | Body sent | Result | Against 7ce4e95 |
|---|---|---|---|---|
| B1 remove L, keep A | "Check out with these breaks", no note | `breaks: [A]` pinned, confirmed | 200, 1 row, confirmed, `complete` | byte-identical |
| B2 remove both, box unticked | "No breaks listed.", "Check out, breaks unconfirmed", note | `{"breaks":[],"breaks_confirmed":false,"expected_version":1}` | 200, 0 rows, unconfirmed, `incomplete_breaks` | changed as intended (7ce4e95 omitted the list: 422 `saved_break_after_clock_out`, dialog stayed open) |
| B3 remove both, then tick | note gone, "Check out, no breaks taken" | `breaks: []`, confirmed | 200, 0 rows, confirmed, `complete` | byte-identical |
| B4 remove L, keep A, add 09:00 for 10 min | "Check out with these breaks" | `[A, new]`, confirmed | 200, 2 rows, confirmed | byte-identical |
| B4b remove both, add 09:00 for 10 min | same | `[new]`, confirmed | 200, 1 row, confirmed | byte-identical |
| B4c keep A and L, add a row | same | `[A, L, new]`, confirmed | 422 `break_outside_session` (alert), session running | byte-identical (pre-existing, see R-B2-3) |
| B5 no saved rows | "No breaks listed.", unconfirmed label, no note | `{"breaks_confirmed":false,"expected_version":1}` (no `breaks` key) | 200, 0 rows, unconfirmed, `incomplete_breaks` | byte-identical (E-1) |
| B5b no saved rows, add a row then remove it | no note | list omitted | 200, unconfirmed | byte-identical |
| B6 remove both, add a row then remove it | note | `breaks: []`, unconfirmed | 200, 0 rows | changed as intended (7ce4e95: 422) |
| B7 only L saved, removed | note | `breaks: []`, unconfirmed | 200, no 422 | changed as intended (7ce4e95: 422) |
| B8 remove both, Cancel, Discard | note, then "Discard your changes?" | nothing | session running, both rows kept | identical (nothing sent) |
| B9 one saved row on a session already confirmed (API-only), removed | note | `breaks: []`, unconfirmed | 200, 0 rows, unconfirmed | changed as intended (7ce4e95 omitted: row kept, unconfirmed); see R-B2-2 |

- No 422 in any case of the brief: removing some (B1), removing all unticked (B2, B6, B7), removing all then ticking (B3), adding a
  row (B4, B4b), no saved rows (B5, B5b). The only 422 is B4c, where the person keeps the late row L listed; that refusal is the same on
  7ce4e95 and is outside FIX3.
- The empty unconfirmed list replaces the saved rows only when the dialog opened with saved rows and every row was removed with the box
  unticked (B2, B6, B7, B9); with no saved rows at the start the list is omitted (B5, B5b; E-1). The condition is the session the
  dialog was opened with: `ClockProvider.tsx` sets it once (`setDialogSession(found)`) and never replaces it while the dialog is open, so
  `session.breaks.length > 0` (`breakRowsModel.ts:464`, `ClockOutDialog.tsx:106`) means "opened with saved rows".
- The note is a `role="status"` text under the break list (`ClockOutDialog.tsx:279-283`,
  `audb2-checkout-removed-all-target-*-synthetic.png`): "The saved breaks you removed are deleted at Check out. Breaks stay unconfirmed
  and OT for the day stays pending." It matches what is recorded in B2, B6 and B7: no rows, `breaks_confirmed` false, the day
  `incomplete_breaks` (OT pending). It hides when the box is ticked (B3) and when a row is listed (B1, B4b).
- docs/04 line 70 and docs/10 line 238 (VI 239) and line 101 (E-1, VI 102) say exactly this; docs/12 line 71 adds that removing every
  saved row with the box unticked deletes them. EN and VI carry the same tokens, numbers and quoted strings (`24-docs-parity.txt`).

**Behaviour-choice verdict: sound.** The choice keeps the owner's words and the canonical rules together:
- U-24 asks for a break area where adding and removing breaks is easy for a new user, and U-25 makes Save the confirmation. With the
  choice, a removed row is gone and the Check out label and note say that nothing is confirmed, so what the dialog shows is what is
  recorded. The rejected alternative (keep omitting the list and say so) would keep rows the person removed and would still refuse a
  removed late row with 422, which the dialog cannot explain well.
- The body is the one the session dialog sends for the G-4 owner variant "Leave breaks unconfirmed for now" (`breaks: []`, unconfirmed),
  so both dialogs record "no rows, breaks unknown" the same way.
- R-02 and D-02: unknown stays different from confirmed zero (`breaks_confirmed` false, OT pending; B2 `incomplete_breaks`, B3
  `complete`), and no future break is ever kept or deducted (B7: the late row is deleted, not refused).
- E-1 holds at the API (a present list is the complete set and replaces the saved rows; an omitted list keeps them) and in the dialog
  (it omits the list only when there is nothing to keep). The server is unchanged; the dialog only uses the existing "present list"
  branch. The canonical texts (docs/10 E-1 line 101 and line 238, docs/04 line 70, docs/12 line 71) were updated EN and VI, as AGENTS
  rule 8 requires for a refined rule.
- Nothing is deleted silently: the note is shown before Check out, Cancel asks "Discard your changes?" (B8), and the server's audit
  entry `work_session.clock_out` keeps the session with its breaks as it was before (`timesheetCommands.ts:628`, `sessionJson`).

## 3. F-UX3B-2: "Confirm breaks" lists the suggestions inside the session (closed)

Method (`zz-audb2-confirm`, both builds, desktop, device zone America/Los_Angeles): an ended session with unconfirmed breaks and no
saved row is seeded through the API; "Confirm breaks of ..." is pressed; the dialog's rows are read; Save goes through the notice when
nothing is listed, else straight to "Save this session?"; the PUT body is captured raw and the session read back
(`45-confirm-compare.txt`). Default policy breaks: offsets 120 (15 min), 240 (30) and 390 (15) minutes after the start.

| Case (target) | Rows listed (start, minutes) | Save | Against 7ce4e95 |
|---|---|---|---|
| F01 09:00-12:00 | 11:00/15 | no notice, "1 break (15 min)" | changed as intended (7ce4e95: none, notice) |
| F02 09:00-14:00 | 11:00/15, 13:00/30 | "2 breaks (15, 30 min)" | changed as intended |
| F03 09:00-18:00 | 11:00/15, 13:00/30, 15:30/15 | "3 breaks (15, 30, 15 min)" | byte-identical |
| F04 09:00-10:30 | none | the "No breaks listed" notice asks; "Confirm no breaks taken" sends `breaks: []` confirmed | byte-identical |
| F05 09:00-11:15 (first ends exactly at the end) | 11:00/15 | 1 break | changed as intended |
| F06 09:00-11:14 (first ends one minute after) | none | notice | byte-identical |
| F07 09:00-15:45 (third ends exactly at the end) | 3 rows | 3 breaks | byte-identical |
| F08 09:00-15:44 (third ends one minute after) | 2 rows | 2 breaks | changed as intended |
| F09 overnight 22:00-03:00+1 | 06/19 00:00/15, 06/19 02:00/30 (date fields shown) | 2 breaks | changed as intended |
| F10 overnight 22:00-06:00+1 | 00:00, 02:00, 04:30 on 06/20 | 3 breaks | byte-identical |
| F11 Sydney fall-back 2026-04-05 00:00-05:45 (5h45m on the wall, 6h45m elapsed) | 02:00/15 (+11:00, the earlier 02:00), 03:00/30 (+10:00), 05:30/15 | 3 breaks, the third ends exactly at the end | byte-identical |
| F12 same day 00:00-05:44 | 02:00, 03:00 | 2 breaks | changed as intended |
| F13 Los Angeles spring-forward 2026-03-08 00:00-07:45 (6h45m elapsed) | 03:00/15, 05:00/30, 07:30/15 (all -07:00) | 3 breaks | byte-identical |
| F14 same day 00:00-07:44 (7h44m on the wall, 6h44m elapsed) | 03:00, 05:00 | 2 breaks | changed as intended |
| F15 input zone Asia/Ho_Chi_Minh 06/23 08:00-13:00 (Los Angeles 06/22 18:00-23:00) | 10:00/15, 12:00/30 pinned at +07:00 | 2 breaks, stored 03:00Z and 05:00Z | changed as intended |
| F16 today 2026-10-19 07:00-12:00, ended | 09:00/15, 11:00/30 | 2 breaks | changed as intended (7ce4e95: none, by the all-or-nothing rule) |

- The fit is by instant, end inclusive: F05 and F07 fit exactly, F06 and F08 one minute later do not. F11 and F14 tell elapsed time from
  wall time: a wall-clock rule would list two rows in F11 and three in F14.
- AGENTS rule 7 holds: in F15 the accounting date (2026-06-22 in Los Angeles) differs from the rows' date in the input zone (2026-06-23 in
  Ho Chi Minh); the fit compares instants only, and the rows are pinned with their offset in the session's saved input zone, not in the
  device zone.
- Pinning (P01, 2026-06-24): "Confirm breaks" on a 09:00-14:00 session and a new session typed 09:00-14:00 on the same past date (the
  pre-fill's suggestions follow the typed start and end) send byte-identical `breaks` arrays and store the same instants
  (`breaksIdentical: true`, `storedBreaksIdentical: true`); every listed row carries the "suggested" tag and `data-origin="suggested"`.
- When suggestions appear is unchanged: `confirmBreaksRows` gives none for a running session, a confirmed one, one with saved rows or
  without a policy (unit tests `breakRowsModel.test.ts:924-931`); the card shows no "Confirm breaks" for a confirmed or a running session
  (G01, both builds); "Confirm breaks" has no past-day rule, as before (F16 today on the target; T08B, coordinator decision of
  2026-10-15); the new-session pre-fill keeps the server-date past-day rule (`pastDaySuggestedRows`, unchanged).
- docs/04 line 65 and docs/10 line 245 (VI 246) describe exactly this; EN and VI match (`24-docs-parity.txt`).

## 4. Regression from FIX3's diff (area B)

- **Request bodies.** The first-pass matrix (25 cases: K01-K11, E12-E20, C20-C23) was run unchanged in its steps on 7ce4e95 and on the
  target (`43-req-compare.txt`): the 24 cases FIX3 did not intend to change are byte-identical (method, path, status, raw body) and
  store the same session; only C23 (Check out with a saved unconfirmed row removed) differs, as intended
  (`{"breaks_confirmed":false,...}` keeps the row; `{"breaks":[],"breaks_confirmed":false,...}` deletes it). Together with section 2
  (8 unchanged Check out cases byte-identical on both projects) and section 3 (7 unchanged "Confirm breaks" cases byte-identical).
- **Server unchanged.** `git diff a643794..a78ada5 -- src/server src/domain` and `git diff 7ce4e95..ceb86b6 -- src/server src/domain
  src/client/api.ts` are empty; own clean builds of 7ce4e95 and the target: `dist/server` 180 and `dist/domain` 46 files, 0 hash
  differences (`23-dist-compare.txt`). Figures therefore cannot change: worked minutes, OT credit and review warnings come from the same
  engine and the same request bodies.
- **Client diff.** Area B (`20-fix3-numstat.txt`): `ClockOutDialog.tsx` (+10/-2: the note and its condition), `breakRowsModel.ts`
  (+25/-5: `hadSavedRows`, `confirmBreaksRows`), `SessionDialog.tsx` (+7/-7: the starting draft calls `confirmBreaksRows`),
  `dayEditorModel.ts` (+4/-49: `quickBreaksOf`, its type and helper removed), `dayModel.ts` (+1/-1: "categories").
  `DayEditor.tsx`, `ClockProvider.tsx`, `BreakRows.tsx`, `BreakSubDialog.tsx`, `breakChipModel.ts`, `sessionModel.ts` and
  `SessionList.tsx` are unchanged (`25-unchanged-files-stat.txt`).
- **The four removed `quickBreaksOf` unit tests.** At 7ce4e95 the only production use of `quickBreaksOf` was `.kind` in
  `SessionDialog.tsx:245` (`22-quickbreaks-usage-7ce4e95.txt`); its `chips` and `rows` outputs reached no screen. The mapping in
  `WP5-UX3-FIX3.md` holds: shifted by the start (09:00-18:00 gives 11:00, 13:00, 15:30) and the input-zone pinning (also Ho Chi Minh) in
  `breakRowsModel.test.ts:886-911`; listed rows are not replaced (the "has saved rows" case in `:924-931`, and the dialog draft from the
  saved session); nothing outside, without a policy or without policy breaks (`:886-895`, `:924-931`); nothing for a running or
  confirmed session (`:924-931`). The 'none' kind became "no rows, Save asks" by the owner-aligned docs/04 text. Only the display-zone chip
  strings have no counterpart, and no screen shows them. Not a weakening; the new tests are stronger on the fit edges.

## 5. Test strength: own mutants on FIX3's area-B changes

Each mutant was applied alone in a scratch export of the target, the client rebuilt, then the full unit suite (2141 tests) and
`day-editor.spec.ts` on the desktop project ran; the file was reverted and compared identical to the clean export (`60-mutants.txt`).
A mutant that survived was run again with every spec that opens the Check out or the session dialog (`day-editor`, `shell`, `today`,
`timesheet`, `keyboard-access`, `focus-ring`) on both projects (`61-survivors.txt`).

| Id | Mutant | Unit suite | `day-editor.spec.ts` desktop | Result |
|---|---|---|---|---|
| M1 | `hadSavedRows` ignored: an empty unticked Check out always omits the list (`breakRowsModel.ts:393`, the pre-FIX3 rule) | 1 fails (`breakRowsModel.test.ts:551`) | 1 fails (`:1924`) | caught |
| M2 | `hadSavedRows` always true: `breaks: []` is sent even when the dialog opened with no saved row (`breakRowsModel.ts:464`) | 2 fail (`:512`, `:565`) | 1 fails (`:1866`) | caught |
| M3 | the confirmed flag on the empty list: after every saved row is removed the empty list is sent as confirmed (`:393`) | 1 fails (`:551`) | 1 fails (`:1924`) | caught |
| M4 | the inside filter's end comparison `<=` becomes `<` (`breakRowsModel.ts:575`) | 2 fail (T08B "a break ending exactly at the end is inside"; FIX3 "09:00-11:15") | pass (no e2e session ends exactly at a break end) | caught (unit) |
| M5a | the gate of `confirmBreaksRows`: the `breaks_confirmed` condition dropped (`breakRowsModel.ts:587`) | 1 fails (`:924`) | pass (the card offers no "Confirm breaks" for a confirmed session) | caught (unit) |
| M5b | a past-day gate added to `confirmBreaksRows` (device clock in the input zone; `breakRowsModel.ts:587`) | pass | pass | **survives**: the six dialog specs on both projects pass too (342 passed, 60 skipped, 0 failed); live: the probe on the mutated build lists no row for today's ended session (F16) and the same rows and bodies as the target for every past day; R-B2-1 |
| M6a | the note's condition ignores the saved rows (`ClockOutDialog.tsx:106`): the removal note shows whenever the list is empty and the box unticked | pass (no unit test covers the component) | pass | **survives**: `day-editor`, `shell`, `today`, `timesheet`, `keyboard-access` and `focus-ring` on both projects pass too (342 passed, 60 skipped, 0 failed); live: the probe on the mutated build shows the note as the dialog opens without saved rows (B5, B5b) while every body stays the same; F-UX3B2-1 |
| M6b | the note's condition ignores the box (`ClockOutDialog.tsx:106`): the note also shows while "Confirm no breaks taken" is ticked | pass | 1 fails (`:1924`: the note must hide when the box is ticked) | caught (e2e) |

Result: 6 of 8 caught (M4 and M5a by the unit suite only, M6b by the e2e suite only). M5b and M6a survive the whole unit suite and
every spec that opens the Check out or the session dialog, on both projects; both are live, not equivalent, as the task-local probes on
the mutated builds show:
- M6a: the probe shows "The saved breaks you removed are deleted at Check out." as soon as the dialog opens without saved rows (B5) and
  after a row is added and removed (B5b), with every request body unchanged (`46-M6a-live-compare.txt`). This is F-UX3B2-1: the note's
  condition is FIX3's own change, and FIX3 item 7 required that "the dialog text must say what will be recorded".
- M5b: the probe lists no row for today's ended session (F16, whose Save then asks through the notice) and the same rows and bodies
  as the target for every past-day case (`47-M5b-live-compare.txt`). "Confirm breaks" on today's session is behaviour FIX3 kept
  unchanged (accepted for T08B), not FIX3's own change, so it is recorded as R-B2-1.

Every mutated file was reverted and compared identical to the clean export, and the scratch client was rebuilt clean at the end
(`60-mutants.txt`, `61-survivors.txt`). The eight mutant unit runs had no timeout.

## 6. Risks of the first pass, judged again

- **R-UX3B-1** (focus on the editor heading after a 1360px mode switch with the session dialog open): `DayEditor.tsx` is unchanged by
  FIX3 (`25-unchanged-files-stat.txt`); not measured again; stays an optional improvement as recorded.
- **R-UX3B-2** (a page left open across the reporting-zone midnight keeps the old `today_local` for the pre-fill): unchanged code; stays
  (conservative: never suggests for today). "Confirm breaks" does not depend on `today_local` (section 3).
- **R-UX3B-3** (docs/12 line 71): closed. The first sentence now names the refusals in plain words, `saved_break_after_clock_out`
  (a saved break that ends after the Check out time, reproduced on 7ce4e95 in B2, B6, B7 and through the API in
  `day-editor.spec.ts:1907`) and `future_break`, and says an unconfirmed break inside the session does not stop Check out (C23 on
  7ce4e95: the omitted list keeps the row, 200). Residual detail in R-B2-3.
- **R-UX3B-5** (the pre-fill's pinned offset is sent when the typed start equals it; same instant): unchanged; P01 shows the same pinning
  for "Confirm breaks".
- **R-UX3B-6** (integration-test timeouts under heavy parallel load): not seen in this audit: both mandatory `npm test` runs passed with
  0 timeouts, and the eight mutant unit runs had 0 timeouts too.
- **R-UX3B-7** (a filled minutes field shows only the number): `BreakRows.tsx` unchanged; stays.

## 7. Mandatory checks (clean export of the target; `10-main-exits.txt`)

| Command | Result | Evidence |
|---|---|---|
| `npm run typecheck` | exit 0, 0 deprecation lines | `10-typecheck.txt` |
| `npm run lint` | exit 0 | `10-lint.txt` |
| `npm test` (twice) | exit 0 both; 94 files, 2141 tests each; 0 timeouts | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | exit 0; main chunk `index-BJ9ZzqiL.js` 486.81 kB (gzip 143.10), no chunk-size advisory | `10-build.txt` |
| AC-13 (`vitest run tests/integration/ac13-two-week.test.ts`) | exit 0, 1/1 | `10-ac13.txt` |
| FULL e2e, both projects, real clock (22:01-22:19Z) | exit 0; 645 passed, 67 skipped, 0 failed (desktop 326/30, mobile 319/37), 18.0 min, 0 deprecation lines | `11-e2e-real.txt` |
| `day-editor.spec.ts` under FIX10 at 2026-11-01T08:45:00Z (LA 01:45 PDT, the fold) | exit 0; 118 passed, 18 skipped, 0 failed (desktop 67/1, mobile 51/17), 2.1 min; preload control: process clock 2026-11-01T08:45Z, Los Angeles Sun 01:45 | `50-dst-20261101T0845.txt` |
| same at 2027-03-14T10:30:00Z (LA 03:30 PDT, after the gap) | exit 0; 118 passed, 18 skipped, 0 failed (desktop 67/1, mobile 51/17), 2.0 min; preload control: process clock 2027-03-14T10:30Z, Los Angeles Sun 03:30 | `50-dst-20270314T1030.txt` |

No run failed by timeout; none was repeated. 0 deprecation lines in the e2e and DST logs.

## Findings

1. **F-UX3B2-1, Low (test strength): the removal note's condition is not pinned for a Check out that starts without saved rows.**
   `src/client/components/ClockOutDialog.tsx:106` (`removedSaved = session.breaks.length > 0 && draft.rows.length === 0 &&
   !draft.noBreaks`); `tests/e2e/day-editor.spec.ts:1866-1899` (the E-1 test without saved rows checks the body and the result, not the
   note); `:1924-1980` checks the note only for a session that had saved rows; no unit or component test covers the condition.
   - Reproduction: mutant M6a (drop `session.breaks.length > 0 &&`). Every Check out with an empty list and the box unticked, which is
     the common path (Check in, then Check out without rows), then says "The saved breaks you removed are deleted at Check out." although
     nothing was saved or removed. The full unit suite, `day-editor.spec.ts` on the desktop project, and `day-editor.spec.ts`,
     `shell.spec.ts`, `today.spec.ts`, `timesheet.spec.ts`, `keyboard-access.spec.ts` and `focus-ring.spec.ts` on both projects (342
     passed, 60 skipped, 0 failed) pass (`60-mutants.txt`, `61-survivors.txt`); the probe on the mutated build shows the note as the
     dialog opens in B5 and B5b, with every request body unchanged (`46-M6a-live-compare.txt`).
   - Expected: FIX3 item 7 requires that "the dialog text must say what will be recorded"; a test fails when the dialog announces a
     deletion that does not happen. Bounded fix, test only: in `day-editor.spec.ts:1866` assert that the note is absent as the dialog
     opens and before Check out (optionally also after adding and removing a row, as in B5b). No product change.
   - Effect today: none; the product condition is right (B5, B5b in section 2). The gap lets the very defect class of F-UX3B-1 (the
     dialog says something other than what is recorded) come back unnoticed on the main path.

## Risks and optional improvements (not proven defects)

- **R-B2-1** "Confirm breaks" on today's ended session lists the suggestions inside it (F16 on the target), as accepted for T08B
  (coordinator decision of 2026-10-15) and unchanged by FIX3, but no test pins it: mutant M5b (a past-day gate added to
  `confirmBreaksRows`, `breakRowsModel.ts:587`) passes the full unit suite, `day-editor.spec.ts` on the desktop project and the six
  dialog specs on both projects (342 passed, 60 skipped, 0 failed; `61-survivors.txt`), while the probe on the mutated build lists no
  row for today (`47-M5b-live-compare.txt`, `61-M5b-probe-run.txt`, `obs-confirm-mut-M5b.jsonl.txt`). Every "Confirm breaks" unit and
  e2e test uses a past day. One check with a session ended today would pin it.
- **R-B2-2** The removal note says "Breaks stay unconfirmed" also when the removed rows belonged to a running session whose breaks were
  already confirmed (B9; an API-only state, because the session dialog cannot save a session without an end). The breaks then become
  unconfirmed rather than stay so; the label "Check out, breaks unconfirmed" and the stored result agree with each other.
- **R-B2-3** A saved row that ends after now and is kept in the Check out list is refused with 422 `break_outside_session` as a general
  alert ("Breaks must lie inside their work session") with no row marked, because that refusal carries no `break_index` (B4c, the same
  on 7ce4e95). docs/12 line 71 names `saved_break_after_clock_out` and `future_break` only; through the dialog the first one is now
  reachable only when the list is omitted, which the dialog no longer does with saved rows.
- **R-B2-4** After FIX3 removed `quickBreaksOf`, `suggestedRows` in `src/client/components/sessionModel.ts:301` has no production
  caller left; it serves as a test oracle only (`breakRowsModel.test.ts`, `sessionModel.test.ts`) without the "test-only" comment that
  the FIX2 decision (item 10) asks for. No bundle cost (tree-shaken), a tidy-up only.
- **R-B2-5** The removal note uses the muted hint style of the general hint above it (`ClockOutDialog.tsx:280`), so the one sentence that
  announces a deletion looks like the routine hint; a person who removed rows by mistake may skim it. It is announced (`role="status"`)
  and Cancel still asks "Discard your changes?".

## Required gates unrun or blocked

None of the area-B items. Not repeated by this recheck: the area-A items (WP5-UX3-AUDIT-A2), the DPR 2 seam crops, a second browser
engine (none installed), the NAS items.

## Disposition of previous findings

- **F-UX3B-1** (WP5-UX3-AUDIT-B, Low): closed on ceb86b6 (section 2); the coordinator's behaviour choice is sound.
- **F-UX3B-2** (WP5-UX3-AUDIT-B, Low): closed on ceb86b6 (section 3).
- R-UX3B-3 closed (docs/12 line 71 rewritten); R-UX3B-4 (area A) closed by FIX3 item 9 (`dayModel.ts:143` "categories", pinned by
  `dayModel.test.ts:213`); R-UX3B-1, -2, -5, -7 stay optional; R-UX3B-6 not seen in this recheck (section 6).

## Software readiness, owner permission and pilot

Software readiness of round 3 waits for the fix of F-UX3B2-1 (one test assertion, no product change) or a recorded coordinator
decision on it, then a gate the coordinator chooses for a test-only change and a fresh area-B check of that assertion against mutant
M6a. Owner permission for the pilot and the pilot result are separate and not affected.

## One next action

Coordinator: decide F-UX3B2-1 (assert in `tests/e2e/day-editor.spec.ts:1866` that the removal note is absent when the Check out
dialog opens without saved rows; optionally R-B2-1, one "Confirm breaks" check on today's ended session); dispatch one bounded
test-only fix (`addresses_audit` WP5-UX3-AUDIT-B2), its freeze, a reduced regate (diff scope, `dist` byte-identity, verify, the changed
spec on both projects) and a fresh area-B recheck that applies M6a (and M5b if R-B2-1 is taken).

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX3-AUDIT-B2 attempt 1 (agent a342a5834865a6e27 on the board);
  authors of the snapshot: the WP5-UX3 slice, fix, governance and freeze agents on the board (FIX3 a61d450ff073015d9, FIX3-FREEZE
  a8123f2b2b2c94bf5, and the earlier ones listed in `WP5_UX3_REVIEW_B.md`). The first area-B auditor was a5ec67dc3fe32bb69.
- Fresh context; the reviewer authored no change of this snapshot and edited no source, test, docs, AGENTS, board or STATE file.
- Source digest before and after: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 files), three forms each
  time (`01-digest-*-before.txt`, `01-digest-*-after.txt`); the regate WP5-UX3-REGATE2 passed on the same snapshot.
- New report path; the first-pass review `WP5_UX3_REVIEW_B.md` and every earlier review file are unchanged.
- Package check: `validate_package.py --preflight` (workflow Python) stops at the parallel area-A draft `WP5_UX3_REVIEW_A2.md`, not at
  this pair; the same link, character, translation and ID checks applied to this pair pass (`97-preflight-final.txt`,
  `97-pair-check.txt`). Every evidence `.txt`, this pair and the brief are LF with one final newline, no trailing blank and no e-mail
  address or profile path (`98-check-evidence.txt`).
- Finding dispositions and the next coordinator task: above.
- Rule slips (read-only, no effect on any result; `96-slips.txt`): one search command piped into `head`; two log reads with `tail`
  on a file (not a pipe; listed for transparency); one stray `python -I -c "print(1)"` no-op (the forbidden `-c` form; nothing read
  from stdin). Probe correction (recorded, not a product finding): the first 7ce4e95 run of the "Confirm breaks" probe used 2025-11-02,
  which has no calendar version (`calendar_missing`); it was replaced by Sydney 2026-04-05 and rerun on both builds. Nothing was fed to
  an interpreter through stdin, no recursive delete, no process killed by PID; nothing of this audit is left running.
