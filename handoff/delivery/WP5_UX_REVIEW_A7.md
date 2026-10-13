# Independent review: WP5 UI redesign, area A (delta recheck after WP5-UX-FIX8)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit paths, sharing,
  isolation, privacy, PDF); 2026-10-13 (Los Angeles); task WP5-UX-AUDIT-A7 attempt 2; self-reported model
  claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5: WP5-UX-PLAN, T02, T04,
  FIX5 and FIX7; the delta WP5-UX-FIX8 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  255ba17d6bf891c0ff779d4a4f518e0d2998cee8, digest
  b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files, `handoff/` excluded), recorded first and
  again at the end. HEAD = origin/main = 255ba17 (no later commit); nothing outside `handoff/` differs. A clean
  `git archive` export of 255ba17 holds exactly the 793 paths and blobs of the tree (path/blob lists equal, diff exit 0)
  and was unchanged after all checks.
- Decision: **FIX REQUIRED** (one finding, WP5-UX-A7-01, Low, in the tests only and older than FIX8). FIX8 changes no
  area-A behaviour, and every area-A behaviour I checked on 255ba17 passed. Area A is not accepted at 255ba17 only
  because the mandatory `isolation.spec.ts` fails on every build during part of each pay period, today included.
- Scope actually inspected/executed: (1) delta proof of `bf954c0..255ba17` (one commit; `src/client/styles.css` +25 and
  `tests/e2e/sharing.spec.ts` +51, 0 deletions): the whole diff read, a declaration-level CSS diff, the computed layout of
  the shell bar, the switcher and the share bar at eight widths on both builds, a byte comparison of the built server,
  domain and client, the static call-site, body-builder and client-arithmetic comparison, and browser probes run with
  the same data and steps on the 255ba17 and the bf954c0 builds at 390x844 and 320x640, each with the viewing zone equal
  to the reporting zone and with the zone note shown: the "Shared with me" switcher by keyboard, touch and pointer with
  AC-16 and isolation, and a sticky probe with a keyboard walk, with and without a received share; (2) area A rerun on
  the clean export of 255ba17 with A6's probes as the method: bodies against a 014bd47 build in each layout (side panel,
  modal editor, phone sheet) and the Settings sharing paths, A-01, AC-04, R-07 with a device-zone probe and the
  zone-note due time, AC-16/AC-01, privacy, the boundary since 014bd47, `npm test`, the seven named e2e specs on both
  projects, AC-13 once, and a follow-up of the isolation failure. Nothing was taken from earlier summaries as proof.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A7/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of 255ba17, HEAD and origin/main, `npm run digest`, clean export) and at the end (export re-hashed, ls-tree, `npm run digest`) | b07727b2 every time, 793 files; export unchanged; repository unchanged outside `handoff/` | `00-digest.txt`, `00-digest-after.txt` |
| `npm ci` (Node v24.21.0, task-local cache) | exit 0; "1 high severity vulnerability" (dev-only, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1823 tests passed (as at bf954c0; FIX8 adds no unit test) | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0; no deprecation line in any log | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e sharing, isolation, day-editor, timesheet, review, submission, pdf-visual on both projects (2026-10-13 19:01Z) | exit 1: 124 tests, 103 passed, 17 skipped by the specs' project conditions, **4 failed** (`isolation.spec.ts:94` and `:145` on desktop and mobile), 0 flaky. Every other per-spec count equals A6's; sharing adds FIX8's 2 mobile tests (skipped on desktop) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only) | `06-npm-audit.txt` |
| delta bf954c0..255ba17 and the boundary since 014bd47 | one commit, 2 paths, 76 insertions, 0 deletions (0 removed lines anywhere outside `handoff/`); the forbidden-path diff (server, domain, every client `.ts`/`.tsx`, `api.ts`, `fixtures.ts`, `dayButton.ts`, unit and integration tests, package, configs, scripts, docs) is empty; since 014bd47 `src/server`, `src/domain`, `api.ts`, `fixtures.ts`, `pdf-visual.spec.ts` and the package files differ only by `src/domain/format.ts` (+13); the 80-path list of the round equals the list at bf954c0 | `10-delta.txt`, `10b-diff-fix8.txt` |
| built output of 255ba17, bf954c0 and 014bd47 | `dist/server` identical in all three (180 files); `dist/domain` identical at 255ba17 and bf954c0 (46 files); the client JS (482990 bytes) equals bf954c0's except its own source-map file name; only the CSS asset differs | `11b-dist.txt`, `11c-client-js-diff.txt` |
| CSS declaration diff | 0 removed, 5 added: the token `--switcher-basis: 16rem` and, below 768px, `.shell-bar` `column-gap: var(--space-3)`, `.shell-switcher` `flex: 1 1 var(--switcher-basis)`, `.shell-switcher label.inline` `padding-block: 0`, `.shell-switcher label .muted` `font-size: var(--font-size-xs)`; no `display`, `visibility`, `opacity`, `pointer-events`, `z-index`, `overflow` or `position` change | `12a-css-rules.txt` |
| call sites; body builders; client arithmetic | 82 call sites / 66 endpoint keys at bf954c0 and 255ba17, 0 write call texts changed (against 014bd47 the only added write call texts remain the picker's one-entry preview and the one-tap `PUT /sessions/:id`); 12/12 builders identical to bf954c0; the arithmetic scan of the 35 client files changed since 014bd47 (49 hits) is line for line the same as at bf954c0 | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt` |
| A6 probes on 255ba17 (1280, 1024, 390) | bodies, A-01 leave, AC-04, R-07 + zone note, privacy, AC-16/AC-01: 18 passed | `30-probe-255-main.txt`, `37-summary.txt` |
| 014bd47 body baseline (1280, 390) | 2 passed | `33-probe-014-baseline.txt` |
| delta probes, computed layout (desktop context 1280/1024/768/767, phone context 390/375/360/320) on 255ba17 and bf954c0 | 2 + 2 passed | `41-d255-css.txt`, `41-dbf9-css.txt` |
| delta probes, switcher by keyboard, touch and pointer (390x844 and 320x640, zone note shown and not) on 255ba17 and bf954c0 | 4 + 4 passed | `42-d255-switcher.txt`, `42-dbf9-switcher.txt` |
| delta probes, sticky bars, pointer and touch trials and keyboard walks (390x844 and 320x640, zone note shown and not, with and without a received share) on 255ba17 and bf954c0 | 8 + 8 passed; 255ba17: 936 focus checks, 312 pointer and 312 touch trials, 592 Tab stops, 0 trial failures, 0 hidden Tab stops; 4 explained date-input rows (bf954c0: 5) | `43-d255-sticky.txt`, `43-dbf9-sticky.txt` |
| isolation follow-up: the periods now (read-only probe); bf954c0's unchanged `isolation.spec.ts`; 255ba17's unchanged `shell.spec.ts`; the auditor's seed-date variant of `isolation.spec.ts` on 255ba17; 255ba17's unchanged `isolation.spec.ts` again | today 2026-10-13, displayed period 09/28-10/11, seed date 2026-10-12 not shown; bf954c0: exit 1, 2 passed, 4 failed (the same tests); shell: exit 1, 5 passed, 2 failed (`:67` on both projects); variant: exit 0, 6 passed; 255ba17 again: exit 1, 2 passed, 4 failed | `40-d255-periods.txt`, `04c-…`, `04e-…`, `04f-…`, `04g-isolation-variant-diff.txt`, `04d-…` |
| Settings sharing paths (with the import and opening-balance steps) on 255ba17 (1280, 1024, 390) and 014bd47 (1280, 390) | 3 + 2 passed | `34-probe-255-settings.txt`, `34-probe-014-settings.txt` |
| comparisons (bodies and Settings vs 014bd47; switcher, sticky and computed layout vs bf954c0) | missing=0 mismatches=0, 338 SAME lines; the date-input rows explained by the keyboard walk; below 768px only the FIX8 properties and their geometry differ | `36-compare.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:
  **WP5-UX-A7-01 (Low; tests only; older than FIX8): the mandatory isolation spec fails on every build for four days of
  each pay period.**
  - Where: `tests/e2e/isolation.spec.ts:51-53` (`seedOwner` takes `employee.pastFreeWorkdays()[0]`) against the
    assertions that expect that date on the Timesheet's displayed period, `:105-108` (second employee) and `:188-189`
    (admin); `tests/e2e/fixtures.ts:392-406` (`pastFreeWorkdays` lists the in-progress period's days first). The same
    seed pattern: `tests/e2e/shell.spec.ts:68` with `:75-77`.
  - Reproduction: on 2026-10-13 at 19:01Z (12:01 in Los Angeles) the reporting-zone today is 2026-10-13; the displayed
    ("current") period is 09/28-10/11 (payroll date 10/16, due 10/13 17:00), the in-progress period 10/12-10/25, and
    `pastFreeWorkdays()[0]` is 2026-10-12, which is not on the page (09/28-10/11) (`40-d255-periods.txt`,
    `periods7-255ba17.json.txt`). `isolation.spec.ts:94` stops at `:106` (`[data-day="2026-10-12"]` not found) and
    `:145` at `:188`, on desktop and mobile (`04-e2e.txt`).
    The unchanged spec of the bf954c0 build fails the same four tests the same way at 19:23Z (`04c-…`), so the failure
    is older than FIX8; the unchanged `shell.spec.ts:67` of 255ba17 fails at `:76` on both projects for the same date
    (`04e-…`); the 255ba17 spec fails again at 19:24Z (`04d-…`). The auditor's copy of the spec with exactly one change
    in substance, the seed date taken from `displayedPeriodFreeWorkdays()` (and the import path; every assertion
    unchanged, `04g-isolation-variant-diff.txt`), passes 6 of 6 on 255ba17 on both projects (`04f-…`): no isolation
    defect hides behind the failure.
  - Expected/actual: the required isolation check passes whenever it runs. Actual: it fails on every build whenever the
    reporting-zone today lies in a new period after its first day but on or before the previous period's payroll date,
    because `currentPayPeriod` (`src/domain/periods.ts:149-164`) keeps the previous period on screen until its payroll
    date: Tuesday to Friday of the first week of each period, 4 of every 14 days (now until 2026-10-16 in Los Angeles).
    In that window the two tests stop at the date row and never reach their isolation assertions. A6 (2026-10-10 03:10Z,
    10/09 in Los Angeles) and WP5-UX-REGATE6 (today 2026-10-09) ran outside the window, so they passed.
  - Rule/AC: AGENTS.md rule 5 (the required acceptance gate, executable commands and actual results: a gate that fails
    by calendar is not reproducible); docs/06 AC-01 (the isolation regression check); this brief's mandatory e2e list.
  - Bounded fix (tests only; no product change): in `isolation.spec.ts` `seedOwner`, take the date from
    `employee.displayedPeriodFreeWorkdays()` (the fixtures helper the newer specs use; `fixtures.ts` unchanged), and the
    same in `shell.spec.ts:68`; remove or weaken no assertion; prove it by running `isolation.spec.ts` and
    `shell.spec.ts` on both projects inside the window (before 2026-10-17 00:00 Los Angeles) and once outside it.
- Delta proof (scope 1): FIX8 changes the phone shell bar's layout below 768px and adds two mobile tests; it changes no
  area-A behaviour.
  1. Only CSS and one spec changed, and no request, body, calculation or saved value. The diff is one commit with two
     paths and no deleted line; `src/server`, `src/domain`, every client `.ts`/`.tsx` file, `api.ts`, `fixtures.ts`,
     `dayButton.ts`, the unit and integration tests, the package files, configs, scripts and docs have no diff. The
     built server and domain are byte-identical to bf954c0's (the server also to 014bd47's) and the client JavaScript is
     the same code; the 82 call sites, 66 endpoint keys and 12 body builders are unchanged. The five added CSS
     declarations (`styles.css:87`, `:3070-3087`) are a token, a column gap, a flex basis, a block padding and a font
     size; none touches display, visibility, opacity, pointer events, stacking, overflow or position.
  2. What the stylesheet changes in the built app (computed layout, same data on both builds): at 1280, 1024 and 768 px
     all 78 facts of a grantee's own view, 83 of the shared view and 49 of a person without a share are equal. Below
     768px only the five FIX8 properties and the geometry they move differ: at 390 px with a received share the bar is
     60 px high instead of 106.8 (one row), the measured `--shell-bar-size` follows (60 px) and so does the scroll
     padding (68 px = 60 + 8, the AX-01 mechanism unchanged); at 320 px the switcher still wraps below the brand (90.8 px
     instead of 106.8); without a received share only the computed column gap differs and nothing moves. The share bar
     stays static below the bar on phones, as before.
  3. The switcher reaches exactly the same routes, by keyboard, touch and pointer. The form, its options and its submit
     handler are untouched (`SharingSwitcher.tsx` has no diff). A grantee G of a view-only owner A and an edit owner B
     ran the sequence A, B, my timesheets, B, A, my timesheets three times (keyboard: focus the select, arrow keys, Tab to
     Open, Enter; touch: the choice, then a tap on Open; pointer: the choice, then a click) at 390x844 and 320x640, with
     and without the zone note, on 255ba17 and bf954c0: 72 steps per build, each with the same address, share bar,
     heading, owner-only controls, owner data on the page and requests on both builds (`36-compare.txt` section 2, 0
     differences). The choice alone never navigated or sent a request; Tab from the select always reached Open; the
     select and Open were in view and hit at their centre before every step (select 138.2x44 and Open 67.1x44 at 390,
     149.3x44 and 67.1x44 at 320). AC-16: in A's view-only view no Open a day, Change several days, picker, checkbox,
     Edit day button, clock or signature line and 14 View day buttons; in B's edit view Open a day, Change several days,
     14 pickers and 14 Edit day buttons, still no clock or signature line; every request under `/api/shared/<owner>/`
     plus `GET /api/shares`. Isolation, the same on both builds: G on the never-shared C's address sees nothing of C
     (404 for C's timesheet, 403 for a PUT to the view-only A), and C has no switcher and gets 404 for A's and B's
     timesheets (8 of 8 runs).
  4. The new bar hides or blocks no edit, clock, reason or confirmation control, with and without a received share and
     with and without the zone note. `useBlockSize.ts` and the stylesheet's uses of the measured sizes are unchanged;
     the bar is lower, so the scroll padding is smaller by the same amount (item 2). Probe on both builds at 390x844 and
     320x640, each with the zone note shown and not, each with a received edit share (46 controls: clock in and out, Open
     a day, Change several days, period, first and last picker and day button, the switcher's select and Open; the
     editor's Close, Save, Notes, Leave hours, Add, Edit, Delete, Confirm delete and Confirm suggested breaks; the old
     period's reason and Save; batch Preview, reason, Cancel, Commit, Review conflicts, confirmation checkbox, Confirm
     and commit, Back; the clock-out dialog; the shared edit view, its Back link, Open and its editor) and without one
     (32 controls): each control focused from three scroll positions (25 sample points and the centre), a pointer trial
     and a touch trial, plus real Tab walks through the own view, the editor and the shared view. On 255ba17: 936 focus
     checks, 312 pointer and 312 touch trials, 592 Tab stops; every trial passed, every Tab stop was fully visible
     (25/25, centre hit, 0 hidden). The only rows below the bar are four placements of the "Open a day" date input that a
     script `focus()` does not scroll (A6 N5): half under the 320 px bar (10/25 visible) or, at 320x640 with the zone
     note in the shared view, below the fold; the same field reached by Tab is 25/25 in every state, and its pointer and
     touch trials passed. bf954c0 has five such rows under the same steps (one more: in the own view at 320 with the
     zone note the field stays 5/25 visible under the tab bar). FIX8 added no occlusion (`36-compare.txt` section 3).
  5. No area-A assertion was removed or weakened: the spec diff only adds lines (one describe with two mobile tests,
     `test(` 4 -> 5, `expect(` 130 -> 144) that measure the first day row, the bar height, the switcher's label, targets
     and place, and no sideways scroll; `fixtures.ts` is unchanged since 014bd47; every other spec is unchanged.
- Passed in area A on 255ba17 (own reproduction, besides the mandatory checks; `36-compare.txt`, `37-summary.txt`):
  1. Endpoints and bodies versus 014bd47, at 1280 (non-modal side panel), 1024 (modal editor) and 390 (bottom sheet)
     against a 014bd47 build: clock in and out, sign-off (`POST /api/timesheets/:p/signoff`, bound to the reviewed
     `payload_hash` and `expected_version`, 201), the old-period batch with its reason, the editor's day-fields PUT
     (`leave_minutes` 150 from 2 h 30 m) and new-session POST, and the one-day label change (picker against 014bd47's
     batch bar with one day) send the same paths and bodies (keys compared in sorted order; `36-compare.txt` section 1).
     The sharing paths in Settings give the same requests, bodies and stored state as on the 014bd47 build at 1280,
     1024 and 390, step by step: the grant (`POST /api/shares` with the e-mail and items), the change (Cancel and Escape
     write nothing; Save items: `PUT /api/shares/:id {items}`), the end and the leave (Escape and Cancel write nothing;
     `POST /api/shares/:id/revoke {}`), with the import and opening-balance steps of the same probe (21 steps per
     layout, 63 equal; `36-compare.txt` section 5). The shared requester's writes (`/api/shared/<owner>/days/batch`,
     `/days/:date`) are in item 6.
  2. The client computes no business minutes: the arithmetic scan is the same as at bf954c0 line for line (49 hits in the
     35 client files changed since 014bd47, all judged in A6); the Overtime Total is
     `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:289`).
  3. A-01 still closed: in all three layouts the 12 malformed or out-of-range leave entries are refused with the message
     and `aria-invalid` on the offending field only, with no PUT and nothing stored (36 refusals, 0 PUT); valid entries
     send 0, 45, 150, 240, 480 and 1440 minutes, and the server refuses 1440 with `leave_exceeds_required`.
  4. R-07: three Los Angeles sessions (23:00-23:50, 00:20-01:10, an overnight 22:00-02:00+1) viewed in
     America/Los_Angeles, Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago and Asia/Ho_Chi_Minh stay on their saved
     accounting dates with the oracle times and start-date markers; the 14 dates, OT cells and total are identical; the
     bar says "Times in <zone>"; the due words stay "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)"; the zone note's
     due time equals the oracle of `due_at_utc` in the viewing zone ("Wed 10/14/2026, 09:00" in Tokyo, "Tue 10/13/2026,
     13:00" in Pago Pago, "Wed 10/14/2026, 07:00" in Ho Chi Minh City); the Review shows the same reporting-zone times.
  5. AC-04 in each layout: the old-period picker previews only, needs the reason and commits with it; the editor's Save
     waits for the reason and the PUT carries it; both reasons are in `/api/history`; the picker stops on a stale
     version; the day fields opened through "Open a day" refuse a stale save; the one-tap confirmation sends the loaded
     version and is refused as stale; Delete then Escape deletes nothing; the conflict needs its confirmation and sends
     `confirm_conflicts`. DST fold/gap and overnight prompts pass in the mandatory day-editor e2e.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day, Change several days, clock, picker, checkbox,
     Edit day button, signature strip, review link or image; 14 "View" day buttons; a read-only editor without inputs; no
     request outside `/api/shared/<owner>/` (plus share and auth); an edit grantee writes only through
     `/api/shared/<owner>/` (picker, editor, Open a day at 320 px on the phone) and the owner's history names the
     grantee; a third user sees nothing and gets 404 for the shared timesheet, day, day PUT and session PUT; the switcher
     probe adds the route sequence by keyboard, touch and pointer (delta item 3).
  7. Privacy and PDF: the Timesheet page before and after sign-off has 0 images, 0 CSS url backgrounds and 0
     `/api/signatures` requests, and the strip's sign date equals the reporting-zone oracle; the Review has exactly one
     signature image (`/api/signatures/<id>`) outside the sheet. The PDF code and `pdf-visual.spec.ts` are unchanged
     since 014bd47 and the built server is byte-identical; pdf-visual (2, desktop), review and submission e2e passed
     (AC-06, AC-07, AC-10).
- Risks and optional improvements, separate from proven defects: (R1, Info, unchanged) GHSA-68fv-2mgg-jv7q in the
  dev-only `source-map-js` (vite -> postcss); `--omit=dev` is clean; the lock is unchanged since 014bd47. (R5, Info,
  improved, area B) On the 390x844 phone in the view-only shared view with the zone note shown, the owner bar is at
  76-276.9 px and the first day row now ends at 802.9 px (A6: 849.7), still below the tab bar top (788 px); docs/04 line
  48 and B6-01 concern the person's own first screen, which FIX8 fixed; area B judges the shared view. (N5, Info, probe
  method, unchanged) A programmatic `focus()` does not scroll a date input, so the sticky probe's focus of the "Open a
  day" field can leave it half under the bar or below the fold; real Tab presses reach it fully visible in every state
  (delta item 4). (N6, N7, Info, unchanged) as in A6.
- Required gates unrun/blocked and why: the unchanged `isolation.spec.ts` cannot pass on any build until 2026-10-17
  00:00 (Los Angeles) (WP5-UX-A7-01); its assertions pass on 255ba17 when the seed date lies in the displayed period.
- Disposition of previous findings: WP5-UX-A-01 stays closed (item 3). A6 had no finding; its risks R1, R5, N5, N6 and
  N7 are carried above. WP5-UX-AUDIT-A6 (PASS on bf954c0) is not superseded by an accepting audit: this audit does not
  accept area A at 255ba17.
- Software readiness, owner permission and pilot result separately: area A is not accepted at 255ba17 until
  WP5-UX-A7-01 is fixed and rechecked; FIX8 itself needs no change for area A. WP5 is re-accepted only if both area
  rechecks pass. No owner permission, real sending or pilot is involved.
- One next action/prompt: the coordinator opens a bounded tests-only fix for WP5-UX-A7-01 (`isolation.spec.ts` and
  `shell.spec.ts` seed a date of the displayed period), then freeze, gate and a fresh area-A recheck of that delta that
  runs both specs inside the window (before 2026-10-17 00:00 Los Angeles) and outside it.

Runtime notes: Git Bash only; no stdin-fed script, no null-device redirect; every file was written in the task folder,
the evidence folder, this review pair or the brief's Results; runs were sequential, each Playwright run with its own
output folder; the e2e fixtures chose their own free loopback ports and I started no server of my own (no port of
48440-48459 was bound); nothing is left running. Slips, recorded honestly: one command piped `cat` into `tail -c 600` to
read the end of a log (19:13Z), against the rule (no data lost, not repeated); the first launch of the A6-method probes
used a relative output path from inside the probe folder and wrote nothing (rerun with absolute paths, `30-…`). The
evidence check (`38-evidence-check.txt`) finds no CR byte, no address and no profile path; its only hits are the
task-folder name in the brief's own text and in the masking rule of `mask.mjs.txt`.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A7 attempt 2; reviewer agent a20d8532cf4870e3a
  (board; attempt 1 was agent adb1361e72d2ebd96 and wrote nothing in the repository); author of the delta WP5-UX-FIX8
  a1879ebe9ac6923de (claude-sonnet-5-5); the earlier authors of the round as listed in `WP5_UX_REVIEW_A6.md` and
  `WP5_UX_REVIEW_A5.md`.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the redesign round and
  ran no gate, sweep or earlier audit of it; it wrote only this review, its translation, the task Results and
  `evidence/WP5-UX-AUDIT-A7/`; the exports and builds of 255ba17, bf954c0 and 014bd47 and all probes ran in the task
  folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: b07727b2 before and after; WP5-UX-REGATE6 PASS on the
  same freeze commit (its e2e ran on 2026-10-09, outside the window of WP5-UX-A7-01).
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A7.md` (new);
  `WP5_UX_REVIEW_A.md` to `WP5_UX_REVIEW_A6.md` are kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: WP5-UX-A7-01 open (Low, tests only); a bounded test fix,
  freeze, gate and a fresh area-A recheck of that delta.
