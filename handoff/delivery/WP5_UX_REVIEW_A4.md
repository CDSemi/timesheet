# Independent review: WP5 UI redesign, area A (recheck after WP5-UX-FIX5)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit
  paths, sharing, isolation, privacy, PDF); 2026-10-09; task WP5-UX-AUDIT-A4 attempt 1; self-reported
  model claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5:
  WP5-UX-PLAN, T02, T04 and FIX5; FIX2, FIX3 and FIX4 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  edaaa852370128ca9bdf206d730f3849346ba994, digest
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873 (789 files, `handoff/` excluded),
  recorded first and again at the end. HEAD = origin/main = edaaa85; no unpushed commit. A clean
  `git archive` export of edaaa85 holds exactly the 789 paths and blobs of the tree (path/blob lists equal,
  diff exit 0) and was unchanged after all checks.
- Decision: **PASS**
- Scope actually inspected/executed: (1) delta proof of `a2ea7a4..edaaa85` (FIX5): a static comparison of
  `DayEditor.tsx`, a rule-level CSS diff, a test-line containment check, and a run-time probe of twelve
  scenarios (plus R2) that save, commit, clock out, confirm breaks and delete after a deferred
  modal/non-modal switch, with the editor's `MutationObserver` instrumented and every request recorded
  and compared with controls without the switch and with a 014bd47 build; (2) the area-A mandatory checks
  on a clean export of edaaa85: business boundary, write call sites and body builders against 014bd47,
  run-time bodies against a 014bd47 build, client arithmetic, A-01, R-07 with a device-zone probe, AC-04,
  AC-16/AC-01, privacy, PDF/AC-06/07/10, `npm test`, the seven e2e specs on both projects and AC-13 once;
  (3) A2 risks R2 and R5 re-judged by reproduction. The probes of A2/A3 were reused as a method and
  rewritten; nothing was taken from earlier summaries as proof.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A4/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of edaaa85, `npm run digest`, clean export) and at the end (export re-hashed, ls-tree of HEAD, `scripts/source-digest.mjs`) | b7bbcbc0 every time, 789 files; export unchanged; repository unchanged outside `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, task-local cache) | exit 0; "1 high severity vulnerability" (dev-only, see R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual on both projects | exit 0; 120 tests: 105 passed, 15 skipped by the specs' project conditions, 0 failed (desktop 52 + 8 skipped, mobile 53 + 7 skipped; both FIX5 B3-01 tests passed on desktop) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only); package files unchanged since 014bd47 | `06-npm-audit.txt`, `11-boundary.txt` |
| delta a2ea7a4..edaaa85 and static proof | 6 files (+191/-13); `DayEditor.tsx` identical outside the mode-switch effect and the new helper; `apply()` = the old effect body; CSS two token values; spec lines kept; problems=0 | `10-delta.txt`, `12-delta-proof.txt` |
| boundary since 014bd47; call sites; body builders | `src/server`, PDF, `api.ts`, package, config, scripts unchanged; `src/domain` only `formatHoursMinutes`; 66 distinct call keys at both commits; since a2ea7a4 no call site or builder changed | `11-boundary.txt`, `13-callsites.txt`, `14-body-builders.txt` |
| client-arithmetic scan of the 25 client files changed since 014bd47 | only the leave hours/minutes input conversion, a break-row count and the OT-leave difference present at 014bd47; totals come from the payload | `15-client-files.txt`, `16-client-arith.txt` |
| own deferral probe (desktop, MutationObserver instrumented), two runs | 13 passed twice | `30-deferred-run1.txt`, `30-deferred-run2.txt`, `deferred-*.json.txt`, `r2-desktop.json.txt` |
| own area-A probes on edaaa85 at 1280, 1024 and 390 | 31 passed, 26 skipped by design (desktop-only deferral tests in the other two projects) | `31-probe-edaaa85-run1.txt`, `*.json.txt`, `37-summary.txt` |
| same flows on a 014bd47 build | 4 passed | `20-export014-build.txt`, `32-probe-014bd47-run1.txt` |
| comparison of all bodies and request sequences | mismatches=0 | `36-compare.txt` |
| phone controls with the FIX5 tokens at 390/375/360/320 | 1 passed (15 controls per width, 0 failing) | `33-probe-phone.txt`, `phone-controls-mobile.json.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **none.**
- Delta proof (scope 1): the FIX5 deferral changes only when the editor switches between modal and
  non-modal presentation, never what is saved.
  1. Only six files changed outside `handoff/`: `src/client/DayEditor.tsx` (+27/-6), `src/client/styles.css`
     (two token values), `tests/e2e/day-editor.spec.ts` (+120), `tests/e2e/timesheet.spec.ts` (+43/-3),
     `docs/04_UX_AND_SETTINGS.md` and its `.vi.md` (line 55 each, wording only). Nothing under `src/server`,
     `src/domain`, `src/client/api.ts`, `src/client/components`, the PDF, `package*.json`, the configs or
     `scripts/` changed (`11-boundary.txt`).
  2. Static (`12-delta-proof.txt`): with the effect block and the new `otherModalOpen` helper
     (`DayEditor.tsx:18-21`) removed, both files are identical (19268 characters). `apply()`
     (`DayEditor.tsx:96-104`) runs exactly the statements of the old effect body. It runs at once when
     the editor is not open yet or no other `dialog:modal` exists (`:105-108`), so first opening and every
     switch without another modal dialog behave as before (controls A0 and A1 created no observer). Only
     when the editor is open and another modal dialog exists does it wait (`:109-115`). The added code
     calls no request, state setter, callback prop (`onChanged`, `onClose`, `onSaved`, `onStale`), submit,
     click, load, reason or timer; the dependency list stays `[modal]`. The observer disconnects itself
     before `apply()` and the effect cleanup disconnects it when `modal` flips back or the editor unmounts
     (`:111`, `:115`). `element.close()` fires only the editor's own `close` event, for which the editor
     has no handler (only `onCancel`, `:244-247`); closing and re-showing a dialog keeps its DOM and React
     state; no editor form saves on blur (the only `onBlur` is the label list, `SheetWeekTable.tsx:145-147`,
     which only closes the list).
  3. Run time (desktop browser; every write, every `/api` request, page errors and each observer's observe
     and disconnect recorded; `36-compare.txt`, `deferred-*.json.txt`):
     - A (1280 to 1024 with the label review open, Escape, Save): under the deferral and after the switch the
       typed Label, WFH, 2 h 30 m vacation and notes are unchanged; exactly one observer, disconnected when
       the review closed; the switch sent nothing; Save sent one `PUT /api/days/<date>` whose path and body
       equal control A0 (no resize), control A1 (editor modal from the start) and, apart from the notes text,
       014bd47's body for the same day and leave. All 17 `/api` requests of A equal A0 in order.
     - F (1280 to 1024 to 1280): the first observer was disconnected by the cleanup, the second when the
       review closed; the editor stayed non-modal; the same PUT; the request sequence equals A0.
     - B (old period, review needing a reason committed while deferred): Commit stayed disabled until the
       review's own reason; the commit carried `reason`; the editor kept its own reason and notes; its PUT
       carried its reason; both reasons are in `/api/history`.
     - C (the day changed elsewhere during the deferral): Save sent the loaded `expected_version` (null);
       the server refused it, "This day changed since it was loaded" appeared, version and notes stayed the
       server's, Reload day showed them.
     - D (conflict step while deferred): Confirm and commit stayed disabled until the confirmation; the
       commit carried `confirm_conflicts: true`; the session was kept; a session saved afterwards equals
       control D0 and 014bd47 (dates masked).
     - E (the clock-out dialog as the other modal): the clock-out body (`breaks: []`,
       `breaks_confirmed: true`, `expected_version`) has 014bd47's keys and values; the editor kept its notes.
     - G (editor unmounted by a route change while deferred): the observer was disconnected; a dialog opened,
       closed and removed afterwards triggered nothing; a later day opened at 1024 created no observer and
       saved one PUT; the first day's typed notes were never written.
     - H vs H0: the one-tap break confirmation (`PUT /api/sessions/:id`, loaded version) and a delete after a
       deferred switch send the same bodies as without it; 22 = 22 requests in order.
     - 0 uncaught page errors in all twelve scenarios.
  4. CSS: only `--date-field-min` 9.5rem to 8.5rem and `--open-day-label-min` 15.25rem to 14.25rem
     (`styles.css:62-63`), used only as `flex-basis` and `min-width` of `.tools .open-day label` and
     `min-width` of `.tools .open-day input` inside `@media (max-width: 767px)` (`styles.css:1091-1103`): no
     display, visibility, opacity, position, overflow, clip, height, z-index, pointer-events, order or
     transform. The selectors match only the `OpenDay` form (`components/OpenDay.tsx:13`), rendered only
     with edit rights (`TimesheetScreen.tsx:378`). At 390, 375, 360 and 320 px the clock, the Open a day
     field and button, Review & sign off, the period steps, Show details, Change several days, a day's Edit,
     the label picker, the editor's Save and Close, Review conflicts, the confirmation box and Confirm and
     commit are present, visible, inside the width and not covered; no horizontal scroll; Open day opens the
     modal editor for the typed date and writes nothing. No edit, clock, reason or confirmation control can
     be hidden or removed by this change.
  5. Tests: all 1252 lines of the a2ea7a4 `day-editor.spec.ts` are kept in order (+120: the two desktop
     B3-01 tests). In `timesheet.spec.ts` three lines changed, all in the phone "Open a day" date-width test
     (the width loop gains 375; the fixed `>= 135` token floor and the `scrollWidth <= clientWidth` check are
     replaced by measured-need checks), a layout assertion of area B. No area-A assertion was removed or
     weakened.
- Passed in area A on edaaa85 (own reproduction, besides the mandatory checks; `37-summary.txt`):
  1. Endpoints and bodies versus 014bd47: no new endpoint; every 014bd47 write call text is unchanged; the
     only call sites added in the round are the picker's one-entry `POST /days/batch` preview
     (`TimesheetScreen.tsx:302`) and the one-tap `PUT /sessions/:id` (`DayEditor.tsx:214`, built by
     `quickBreaksRequest`); `buildSessionRequest`, `buildClockOutRequest`, `batchEntries`, `modeEndpoint`,
     `buildSubmitBody`, `isStaleVersion` and `api` are identical, `buildDayEntryRequest` differs only by the
     leave parse. At run time against a 014bd47 build (desktop, 1024 and phone): leave bodies for 0, 45, 150,
     240, 480 and 1440 minutes, clock in and out, the sign-off (`POST /api/timesheets/:p/signoff`, bound to
     the reviewed `payload_hash` and `expected_version`, 201), the old-period batch with a reason, and the
     editor's day-fields PUT and new-session POST are the same; so are the saves made after a deferred
     switch (item 3 above).
  2. The client computes no business minutes: the scan finds only `leaveInputModel.ts:37-38,55,65` (the
     input unit), a break-row count (`sheetModel.ts:160`) and the OT-leave difference present at 014bd47
     (`sessionModel.ts:390`); the Overtime Total is `view.totals.provisional_credited_minutes`
     (`TimesheetSheet.tsx:288`) and the Review total `payload.totals.credited_minutes` (`ReviewDays.tsx:44`).
  3. A-01 still closed: in all three layouts the 12 malformed or out-of-range entries are refused with the
     `role="alert"` message and `aria-invalid` on the offending field only, with no PUT and nothing stored
     (36 refusals, 0 PUT); 014bd47 refuses the malformed ones natively.
  4. R-07: three LA sessions (23:00-23:50, 00:20-01:10, 22:00-02:00+1) viewed in America/Los_Angeles,
     Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago and Asia/Ho_Chi_Minh at 1280, 1024 and 390: every
     session stays on its saved accounting date, times and start-date markers equal an Intl oracle, the 14
     dates, OT cells and Overtime Total are identical, the period bar says "Times in <zone>" with the zone
     note only when the zones differ, and the Review shows the same reporting-zone times.
  5. AC-04 in each layout: the old-period picker pick previews only, needs the reason and commits with it;
     the editor's Save is disabled until the reason and the PUT carries it; both reasons are in
     `/api/history`; the picker stops on a stale version; the day-fields form opened through "Open a day"
     refuses a stale save; the one-tap confirmation sends the loaded version and is refused as stale;
     Delete then Escape deletes nothing; the conflict needs its confirmation and sends `confirm_conflicts`.
     DST fold/gap and overnight prompts pass in the mandatory day-editor e2e.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day, Change several days, clock, picker,
     checkbox, Edit, signature strip, review link or image, 14 "View" buttons, a read-only editor without
     inputs, and no request outside `/api/shared/<owner>/` (plus share and auth). An edit grantee writes
     only through `/api/shared/<owner>/` (picker preview and commit, the editor's day PUT, and a second day
     PUT through the "Open a day" row, on the phone at 320 px with the FIX5 tokens); the owner's history
     names the grantee. A third user sees nothing and gets 404 for the shared timesheet, day, day PUT and
     the owner's session PUT.
  7. Privacy and PDF: the Timesheet page before and after sign-off has 0 images, 0 CSS url backgrounds and
     0 `/api/signatures` requests; the strip shows "Signed by ..." and the reporting-zone sign date equal to
     the oracle; the Review has exactly one signature image (`/api/signatures/<id>`) outside the sheet. The
     PDF code and `pdf-visual.spec.ts` are unchanged since 014bd47 and pdf-visual passed (2 tests, desktop;
     the phone project skips it by design); review and submission e2e passed (AC-06/AC-07; the sign-off body
     builders and the server unchanged).
- Risks and optional improvements, separate from proven defects: (R1, Info) unchanged: the
  `source-map-js` advisory GHSA-68fv-2mgg-jv7q is dev-only (vite -> postcss), `--omit=dev` is clean, the
  lock is unchanged since 014bd47. (R2, re-judged: closed by FIX5) Reproduced at 1280 -> 1024 with an
  old-period picker review open over the non-modal editor (`r2-desktop.json.txt`): the review stays modal,
  on top and focused, its reason field takes focus and Commit stays disabled without a reason; the first
  Escape closes only the review, the editor becomes modal with focus on its heading and the unsaved note
  still in it; the second Escape closes the editor (Escape never saves, so the note is discarded as with any
  Escape); only the preview was sent and the old day is unchanged. (R5, Info, unchanged, no area-A impact)
  On the 390x844 phone the view-only grantee's owner bar (122.8-323.7 px) is fully on the first screen and
  the first day row ends at 849.7 px, below the tab bar top (788 px), the same as at a2ea7a4; nothing is
  writable there and the FIX5 tokens style only the Open a day form, which a view-only grantee does not
  have. (N1, Info, outside area A, not caused by FIX5) After saving the day fields in the modal editor at
  1024 px, focus was on BODY (`deferred-G.json.txt`, "later"), probably because the focused Save button is
  disabled while saving (`DayFieldsForm.tsx:177`, unchanged since a2ea7a4); area B may check focus after a
  save. (N2, Info, outside area A) The O-5 change in `timesheet.spec.ts` replaces a fixed width floor by a
  measured need; its strength is for area B to judge. A deferred switch, like every switch, moves focus to
  the editor heading (FIX5's own observation); typed values stay and nothing is written.
- Required gates unrun/blocked and why: none for area A.
- Disposition of previous findings: WP5-UX-A-01 stays closed (item 3). A2/A3 risks: R1 unchanged; R2 closed
  by FIX5; R5 unchanged (Info, no area-A impact). WP5-UX-AUDIT-A2 (589bcff), WP5-UX-AUDIT-A3 (a2ea7a4) and
  WP5-RECHECK (014bd47) are superseded by this audit for area A.
- Software readiness, owner permission and pilot result separately: area A accepts edaaa85; WP5 is
  re-accepted only if the parallel area-B recheck (WP5-UX-AUDIT-B4) also passes. No owner permission, real
  sending or pilot is involved.
- One next action/prompt: the coordinator records this PASS (with WP5-UX-AUDIT-B4) and, if both pass,
  re-accepts WP5 at edaaa85 through the committer.

Runtime notes: Git Bash only; no pipe into head or tail, no stdin-fed script, no `/dev/null`; every file
written in the task folder or the evidence folder. The e2e fixtures chose their own free loopback ports; I
started no server of my own. Each harness work folder was removed after its server exited; nothing is
left running.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A4 attempt 1; reviewer agent
  a093657a860461489 (board); authors WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4
  afb8ef164774cd30d, FIX5 abe661ea7cfd0b8f0.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the
  redesign round and ran no gate or earlier audit of it; it wrote only this review, its translation, the
  task Results and `evidence/WP5-UX-AUDIT-A4/`; the exports and builds of edaaa85, a2ea7a4 and 014bd47 and
  all probes ran in the task folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: b7bbcbc0 before and after; WP5-UX-REGATE3
  PASS on the same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A4.md` (new);
  `WP5_UX_REVIEW_A.md`, `WP5_UX_REVIEW_A2.md` and `WP5_UX_REVIEW_A3.md` are kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: no finding; no fix task needed for area A.
