# Independent review: WP5 UI redesign, area A (recheck after WP5-UX-FIX7)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit paths,
  sharing, isolation, privacy, PDF); 2026-10-09 (Los Angeles); task WP5-UX-AUDIT-A6 attempt 1; self-reported model
  claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5: WP5-UX-PLAN, T02,
  T04, FIX5 and FIX7; FIX2, FIX3, FIX4 and FIX6 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  bf954c0b371ad9a5fe461a603c5d476ea210e66c, digest
  b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files, `handoff/` excluded), recorded first
  and again at the end. HEAD = origin/main = bf954c0; no unpushed commit. A clean `git archive` export of bf954c0
  holds exactly the 793 paths and blobs of the tree (path/blob lists equal, diff exit 0) and was unchanged after all
  checks.
- Decision: **PASS**
- Scope actually inspected/executed: (1) delta proof of `5e104e1..bf954c0` (d3935e7 and 5b349f8 change nothing
  outside `handoff/`; FIX7 changes 29 paths): the full client, test and docs diff read line by line, static call-site
  and body-builder comparison, a declaration-level CSS diff, byte comparison of the built server and domain, a unit
  sweep of the new day-button names (87600 checks under each of 8 device zones), and browser probes run with the same
  data and steps on the bf954c0 build and on a 5e104e1 build: dialogs and inline steps with Cancel, Escape, Back and
  step changes; the "Shared with me" switcher with AC-16 and isolation; day selection by `data-day` in 8 device zones
  and 4 periods around 5 DST changes; the sticky sizes and scroll padding against 43 edit, clock, reason,
  confirmation and navigation controls in five widths, with a keyboard follow-up; (2) area A items 1-7 of
  `WP5-UX-AUDIT-A.md` on a clean export of bf954c0, reusing the A5 probes as a method (adapted only where the
  day-button name changed): endpoints and bodies against a 014bd47 build for every edit path, client arithmetic, A-01,
  R-07 with a device-zone probe and the zone-note due time, AC-04, AC-16/AC-01, privacy, PDF/AC-06/07/10, the
  boundary since 014bd47, `npm test`, ten e2e specs on both projects and AC-13 once. Nothing was taken from earlier
  summaries as proof.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A6/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of bf954c0 and HEAD, `npm run digest`, clean export) and at the end (export re-hashed, ls-tree of HEAD, `npm run digest`) | b7c011d2 every time, 793 files; export unchanged; repository unchanged outside `handoff/` | `00-digest.txt`, `00-digest-after.txt` |
| `npm ci` (Node v24.21.0, task-local cache) | exit 0; "1 high severity vulnerability" (dev-only, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1823 tests passed (A5: 1821; +2 `dayButtonName` tests) | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0; no deprecation line in any log | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, import, pdf-visual, focus-ring, keyboard-access on both projects | exit 0; 178 tests: 155 passed, 23 skipped by the specs' project conditions, 0 failed, 0 flaky (desktop 77 + 12 skipped, mobile 78 + 11 skipped); the seven specs A5 ran besides focus-ring have A5's per-spec counts | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only) | `06-npm-audit.txt` |
| delta 5e104e1..bf954c0, boundary since 014bd47, built server/domain | 29 paths, all FIX7; no `src/server`, `src/domain`, `api.ts`, `fixtures.ts`, package, config or script change; since 014bd47 only `src/domain/format.ts` (+13); `dist/server` byte-identical at 014bd47, 5e104e1 and bf954c0, `dist/domain` identical at 5e104e1 and bf954c0 | `10-delta.txt`, `10c-…`, `10d-…`, `10e-…`, `11b-dist-server.txt` |
| CSS declaration diff | 4 removed, 34 added: tokens, `scroll-padding-top`, the sticky `top`/`max-height` of the share bar and the 1200px side panel, focus `box-shadow`s, the switcher's flex layout, `flex-wrap`/`max-width` of the phone day head; no `visibility`, `opacity`, `pointer-events`, `z-index`, `overflow` or `position` change | `12a-css-rules.txt` |
| day-name unit sweep | 87600 checks under each of 8 device zones, 0 failures | `12b-day-name-probe.txt` |
| removed/added test lines | 15 removed lines, each replaced by the same check on the same element (or an import line); 0 removed `test(`; `fixtures.ts` unchanged since 014bd47 | `12c-tests-delta.txt` |
| call sites; body builders; client arithmetic | 82 call sites / 66 keys at 5e104e1 and bf954c0, 0 write call texts changed; 12/12 builders identical to 5e104e1; arithmetic hits = A5's 35 plus 14 unchanged lines of files FIX7 touched for focus only | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt`, `16b-client-arith-diff.txt` |
| A5 probes on bf954c0 (1280, 1024, 390) | bodies, A-01 leave, AC-04, R-07 + zone note, privacy, AC-16/AC-01: 18 passed; bodies rerun 3 passed | `30-…`, `30b-…`, `37-summary.txt` |
| delta probes on bf954c0 and 5e104e1 (1280, 1024, 390; sticky also 768 and 320) | days, dialogs, switcher passed on both builds (5e104e1 days after a probe fix, `32b-…`); sticky: bf954c0 2 of 645 focus checks off (320 px, programmatic focus of the date field), 215/215 trial clicks; 5e104e1 70 of 645 off | `31-…`, `32-…`, `32b-…`, `35-sticky-counts.txt` |
| 014bd47 baselines (1280, 390) | A5 bodies probe (unchanged) and the Settings/Import steps: 4 passed | `33-probe-014-baseline.txt` |
| date-field keyboard follow-up (both builds, 5 widths) | bf954c0: Tab and Shift+Tab from half and fully under the bar give 25/25 visible points in 20/20 rows; 5e104e1: 10 or 15/25 (half) and 0/25 (full) | `34-…`, `34b-datefield-summary.txt` |
| comparisons | days, switcher, dialogs vs 5e104e1; Settings/Import steps and bodies vs 014bd47: missing=0 mismatches=0 (237 SAME lines) | `36-compare.txt` (`36a-compare-run1.txt` kept: two probe artefacts, see runtime notes) |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **none.**
- Delta proof (scope 1): FIX7 changes focus handling, names, roles, the switcher's trigger and the sticky offsets;
  it changes no area-A behaviour.
  1. No request, endpoint, body, `expected_version`, reason prompt, confirmation step, calculation or saved value
     changes, and Cancel and Escape still write nothing. Statically: `src/server`, `src/domain`, `src/client/api.ts`
     and `tests/e2e/fixtures.ts` have no diff since 5e104e1; the 82 client call sites and 66 endpoint keys are the
     same and no write call text changed; the 12 body builders are identical; the built server and domain are
     byte-identical to 5e104e1. The focus code only adds refs, `focus()` calls and flags: `BatchDialog.tsx:49-64`
     (`goTo` sets the step and a flag; `submit`, Cancel and the native `close` are unchanged),
     `TimesheetScreen.tsx:237-255,329-348` (the opener is read before `setBusy`; `closePreview` also sets a focus
     flag; `sendCommit` is unchanged), `ImportCommit.tsx:31-44`, `OpeningBalanceForm.tsx:60-74`,
     `OpeningBalancePanel.tsx:38-44,168`, `SharingRows.tsx:86-104,197-203,234` (each cancel or close still makes the
     same state change, then focuses). At run time, on 1280, 1024 and 390, the same steps on the bf954c0 and the
     5e104e1 build give the same requests, bodies and stored state at every step: the batch review (Escape; Cancel;
     Review conflicts, Back, Escape; Review conflicts, Escape: only the preview POST each time, nothing stored; then
     confirm and commit with `confirm_conflicts: true`), the label-pick review (the same four exits, then the
     commit), the editor's Delete then Escape (no DELETE) and the real delete, Clock out Escape and Cancel (no POST)
     and the submit, the share grant, change (Cancel; Escape, which leaves the change step open on both builds; Save
     items: `PUT /api/shares/:id {items}`), end (Escape, Cancel, End share: `POST …/revoke {}`), leave (the same),
     the import (Back to the preview, Escape, Confirm import with the same decisions) and the opening balance and its
     correction (Back to edit, Escape, Cancel, then the POST and PUT with the same bodies). The Settings and Import
     steps give the same requests, bodies and stored state on the 014bd47 build too. Only the focus after each exit
     differs (the FIX7 intent).
  2. The switcher reaches exactly the same routes. Before: the select's `onChange` set
     `window.location.hash = value === '' ? '#/timesheet' : sharedHash(value, null)` (5e104e1
     `SharingSwitcher.tsx:17`); now the form's submit sets the same expression on the chosen value
     (`SharingSwitcher.tsx:20-23`); the option list is unchanged and the form is re-keyed per shown owner (`:14`).
     With a grantee of a view-only owner A and an edit owner B and the sequence A, B, my timesheets, B, A, my
     timesheets, both builds land on the same address, share bar, heading and owner-only controls (view-only: no Open
     a day, Change several days, picker, checkbox, clock or signature line, 14 "View" day buttons; edit: Open a day,
     Change several days and 14 pickers, still no clock or signature line), show only that owner's session and send
     the same requests (only `/api/shared/<owner>/…` plus `GET /api/shares`); on bf954c0 the choice alone keeps the
     address and sends nothing. Isolation is the same on both: the grantee on a never-shared owner's address stays on
     its own timesheet (404 for that owner's timesheet, 403 for a PUT to the view-only owner), a third person has no
     switcher and sees no session of A or B (404 for both shared timesheets).
  3. Day selection by `data-day` opens the same accounting date. `focusDay()` now looks up
     `[data-day="<date>"] [data-day-button]` (`TimesheetScreen.tsx:60-64`), the element the 5e104e1 lookup by
     `aria-label` found; the buttons still call `actions.onEdit(day.workDate)` (`TimesheetSheet.tsx:59`,
     `SheetWeekTable.tsx:282`). The names come from `dayButtonName` (`sheetModel.ts:106-109`), pure text from
     `dateText` (string slices of `work_date`) and `weekday` (UTC weekday of `work_date`); no zone is involved. Unit
     sweep: every date of 2025-2027 in 10 display zones, under 8 device zones: the name is exactly "{verb} {MM/DD}
     ({date})" (sheet) or "{verb} {Ddd} {MM/DD} ({date})" (phone), the cell and session text equal 5e104e1's; 0
     failures of 87600 per device zone. Browser, 1280/1024/390, 8 device zones (Los Angeles, Sydney, Lord Howe,
     Kiritimati, Pago Pago, London, Tokyo, Chatham) x 4 periods (09/14-09/27 with the Chatham DST start, 09/28-10/11
     with a session across the Sydney and Lord Howe DST start, 10/12-10/25 with the London DST end, 10/26-11/08 with
     the Los Angeles DST end): every `data-day` list equals the server's, every name equals "{verb} {visible}
     ({date})", and the visible text, verb and session times equal 5e104e1's row for row (448 rows per layout, 0
     differing); session times equal an Intl oracle and stay on their saved dates (the 10/03 08:00-12:00 Los Angeles
     session shows "10/04 01:00-06:00" in Sydney and "10/04 01:30-06:00" in Lord Howe on the 10/03 row). In 4 zones x
     2 periods all 14 day buttons were clicked on both builds: each opened its own date (`data-day-editor` and
     heading) and Close returned focus to its own day button (112 clicks per layout, 0 differing).
  4. The sticky-size hook and the scroll padding cannot hide or block an edit, clock, reason or confirmation control.
     `useBlockSize.ts:10-24` only writes the measured height of the shell bar and the share bar (on `<html>`) and of
     the editor head (on the dialog) to custom properties and removes them on unmount; the stylesheet uses them only in
     `scroll-padding-top` (`styles.css:399,414,1981`), the share bar's sticky `top` (`:3032`) and the 1200px side
     panel's sticky `top`/`max-height` (`:2014-2016`). Probe: 43 controls per width (clock, Open a day, Change several
     days, period, first/last picker and day button, switcher; editor Close, Save, Notes, Leave hours, Add, Edit,
     Delete, Confirm delete, Confirm suggested breaks; the old period's reason and Save; batch Preview, reason,
     Cancel, Commit, Review conflicts, confirmation checkbox, Confirm and commit, Back; Clock out and its dialog; the
     shared edit view and its editor) from three start positions (page or panel at the bottom, at the top, the control
     half under the sticky region), each focused, then 25 sample points, the centre and a Playwright trial click. On
     bf954c0 all 516 checks at 1280, 768, 1024 and 390 pass (focused, visible, hit at the centre) and all 215 trial
     clicks pass; at 1280 in a shared edit view the side panel starts at 209.4 px = shell bar 56 + share bar 141.4 +
     12 and its `max-height` is 578.6 px, with every control reachable. At 320 px 2 of 129 checks are off: the "Open a
     day" date field placed half under the shell bar keeps 10 of 25 points visible after a programmatic `focus()`,
     which does not scroll a date input; 5e104e1 gives exactly the same 2 rows. Reached the way a keyboard user
     reaches it (Tab from Clock in, Shift+Tab from Show details, from half and from fully under the bar) the field is
     fully visible (25/25, centre hit) on bf954c0 in all 20 rows at 1280, 768, 1024, 390 and 320, and half or entirely
     hidden on 5e104e1. The same sticky probe on 5e104e1 is off in 70 of 645 checks (20 entirely hidden under the
     shell bar, the share bar or the editor head). FIX7 removed occlusion and added none.
  5. Tests: the 15 removed test lines are 12 day-button selections replaced by `namedDayButton` (row `data-day`, the
     `data-day-button` marker and the anchored new name: the same element, stricter), the focus-ring "sheet date"
     selection replaced by `[data-day] [data-day-button]` plus an accessible-name assertion, one `toHaveCount(0)` of the
     edit-named button in the view-only grantee view replaced by the same count on the anchored new name, and one
     import line; no `test(` removed (sheetModel 26 -> 28, focus-ring 1 -> 5, the rest equal); `fixtures.ts` is
     unchanged since 014bd47; the area-A assertions of day-editor (reason, stale, DST, overnight, A-01), sharing,
     isolation, review, submission, timesheet and import are otherwise untouched. No area-A assertion was removed or
     weakened.
- Passed in area A on bf954c0 (own reproduction, besides the mandatory checks; `36-compare.txt`, `37-summary.txt`):
  1. Endpoints and bodies versus 014bd47: same 66 call keys; the only added call sites since 014bd47 remain the
     picker's one-entry batch preview/commit and the one-tap `PUT /sessions/:id`. At run time on 1280 (non-modal side
     panel), 1024 (modal editor) and 390 (bottom sheet) against a 014bd47 build: clock in and out, sign-off (`POST
     /api/timesheets/:p/signoff`, bound to the reviewed `payload_hash` and `expected_version`, 201), the old-period
     batch with a reason, the editor's day-fields PUT and new-session POST, and the one-day label change (picker vs
     014bd47's batch bar with one day) send the same paths and bodies (keys compared in sorted order); the sharing
     grant/change/end/leave, import commit and opening-balance post and correction bodies equal 014bd47's (delta
     item 1).
  2. The client computes no business minutes: the scan of the 35 client files changed since 014bd47 finds A5's 35 hits
     line for line plus 14 lines of `OpeningBalanceForm.tsx`, `OpeningBalancePanel.tsx` and `SharingRows.tsx`, files
     scanned now only because FIX7 touched them; none of the 14 is a FIX7 line, and the one computation among them
     (`resultingPosted(...)`, the opening-balance confirmation preview) is unchanged since 014bd47; the Overtime Total
     is `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:289`).
  3. A-01 still closed: in all three layouts the 12 malformed or out-of-range leave entries are refused with the
     message and `aria-invalid` on the offending field only, with no PUT and nothing stored (36 refusals, 0 PUT);
     valid entries send 0, 45, 150, 240, 480 and 1440 minutes as before.
  4. R-07: the three A5 Los Angeles sessions viewed in America/Los_Angeles, Asia/Tokyo, Pacific/Kiritimati,
     Pacific/Pago_Pago and Asia/Ho_Chi_Minh stay on their saved accounting dates with oracle times and start-date
     markers; the 14 dates, OT cells and total are identical; the bar says "Times in <zone>"; the due words stay "Due
     Tue 10/13/2026, 17:00 (America/Los_Angeles)"; the zone note's due time equals the oracle of `due_at_utc` in the
     viewing zone (for example "Wed 10/14/2026, 09:00" in Tokyo, "Tue 10/13/2026, 13:00" in Pago Pago); the Review
     shows the same reporting-zone times; the delta day probe adds 8 zones, 4 periods and 5 DST changes (delta
     item 3).
  5. AC-04 in each layout: the old-period picker previews only, needs the reason and commits with it; the editor's
     Save waits for the reason and the PUT carries it; both reasons are in `/api/history`; the picker stops on a
     stale version; the day fields opened through "Open a day" refuse a stale save; the one-tap confirmation sends
     the loaded version and is refused as stale; Delete then Escape deletes nothing; the conflict needs its
     confirmation and sends `confirm_conflicts`. DST fold/gap and overnight prompts pass in the mandatory e2e.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day, Change several days, clock, picker,
     checkbox, edit-named day button, signature strip, review link or image; 14 "View …" day buttons (by name and by
     `data-day-button`); a read-only editor without inputs; no request outside `/api/shared/<owner>/` (plus share and
     auth); an edit grantee writes only through `/api/shared/<owner>/` (picker, editor, Open a day at 320 px on the
     phone) and the owner's history names the grantee; a third user sees nothing and gets 404 for the shared
     timesheet, day, day PUT and session PUT; the switcher probe adds the route sequence (delta item 2).
  7. Privacy and PDF: the Timesheet page before and after sign-off has 0 images, 0 CSS url backgrounds and 0
     `/api/signatures` requests, and the strip's sign date equals the reporting-zone oracle; the Review has exactly one
     signature image outside the sheet. The PDF code and `pdf-visual.spec.ts` are unchanged since 014bd47 and the
     built server is byte-identical; pdf-visual (2, desktop), review and submission e2e passed (AC-06, AC-07, AC-10).
- Risks and optional improvements, separate from proven defects: (R1, Info, unchanged) GHSA-68fv-2mgg-jv7q in the
  dev-only `source-map-js` (vite -> postcss); `--omit=dev` is clean; the lock is unchanged since 014bd47. (R5, Info,
  unchanged) On the 390x844 phone the view-only grantee's owner bar is 122.8-323.7 px and the first day row ends at
  849.7 px, below the tab bar top (788 px), as at 5e104e1. (N5, Info, probe method, no defect) A programmatic
  `focus()` does not scroll a date input, so a probe that focuses the "Open a day" field by script can leave it half
  under the 320 px shell bar on both builds; keyboard focus scrolls it fully clear on bf954c0 (delta item 4). (N6,
  Info, unchanged) The change step of a given share does not close on Escape (it now takes focus as a group); nothing
  is written. (N7, Info, cosmetic) `sheetModel.ts:111` reads `export const hm =(minutes…` (no space after `=`); lint
  passes.
- Required gates unrun/blocked and why: none for area A.
- Disposition of previous findings: WP5-UX-A-01 stays closed (item 3). A5 risks: R1 unchanged; R5 unchanged (Info,
  no area-A impact); N3 (hover over focus) and N4 (cosmetic) are area B or cosmetic and outside this delta.
  WP5-UX-AUDIT-A5 (and through it A2, A3, A4 and WP5-RECHECK) is superseded by this audit for area A.
- Software readiness, owner permission and pilot result separately: area A accepts bf954c0; WP5 is re-accepted only
  if the parallel area-B recheck (WP5-UX-AUDIT-B6) also passes. No owner permission, real sending or pilot is
  involved.
- One next action/prompt: the coordinator records this PASS (with WP5-UX-AUDIT-B6) and, if both pass, re-accepts WP5
  at bf954c0 through the committer.

Runtime notes: Git Bash only; no pipe into head or tail, no stdin-fed script, no null-device redirect; every file was
written in the task folder, the evidence folder or this review pair; runs were sequential, each Playwright run with
its own output folder. Probe-design slips, corrected before the recorded runs: the probe folder first lacked its
`"type": "module"` package file (the first run did not start); the sticky probe first focused the old period's
disabled Save (a disabled button cannot take focus; it now types a change and a reason first, nothing saved); the
5e104e1 day probe's first mobile run used a selector list not scoped to the row (strict-mode error; rerun with
`:is(...)`, `32b-…`); the first comparison (`36a-compare-run1.txt`) showed two artefacts, a different notes text in my
bf954c0 body probe (rerun with the 014bd47 probe's text, `30b-…`) and JSON key order (now compared with sorted keys).
The e2e fixtures chose their own free loopback ports; I started no server of my own; nothing is left running.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A6 attempt 1; reviewer agent
  ae28cb6041639f3c1 (board); author of the delta WP5-UX-FIX7 ac4684761796f0e78 (claude-opus-5-5); the earlier authors
  of the round as listed in `WP5_UX_REVIEW_A5.md`.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the redesign round
  and ran no gate, sweep or earlier audit of it; it wrote only this review, its translation, the task Results and
  `evidence/WP5-UX-AUDIT-A6/`; the exports and builds of bf954c0, 5e104e1 and 014bd47 and all probes ran in the task
  folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: b7c011d2 before and after; WP5-UX-REGATE5 PASS on the
  same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A6.md` (new);
  `WP5_UX_REVIEW_A.md` to `WP5_UX_REVIEW_A5.md` are kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: no finding; no fix task needed for area A.
