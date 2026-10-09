# Independent review: WP5 UI redesign, area A (recheck after WP5-UX-FIX4)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit
  paths, sharing, isolation, privacy, PDF); 2026-10-09; task WP5-UX-AUDIT-A3 attempt 1; self-reported
  model claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5:
  WP5-UX-PLAN, T02, T04; FIX2, FIX3 and FIX4 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb, digest
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 files, `handoff/` excluded).
  HEAD = origin/main = a2ea7a4; no unpushed commit. A clean `git archive` export of a2ea7a4 holds
  exactly the 789 paths and blobs of the tree (path and blob lists equal, diff exit 0).
- Decision: **PASS**
- Scope actually inspected/executed: (1) the delta `589bcff..a2ea7a4` (FIX4) line by line, with a
  compile and token comparison of `DayEditor.tsx`, a rule-level CSS diff, a test-line containment check
  and a before/after phone probe on builds of 589bcff and a2ea7a4; (2) the area-A mandatory checks on a
  clean export of a2ea7a4: the business boundary and every client write call site and body builder
  against 014bd47, runtime request bodies against a 014bd47 build (day fields, clock in/out, batch,
  sign-off), the client-arithmetic scan, A-01, R-07 with a device-zone probe, AC-04, AC-16/AC-01,
  privacy, PDF/AC-06/07/10, `npm test`, the seven e2e specs on both projects and AC-13 once; (3) A2's
  Info risks R2 and R5, reproduced. A2's probes were reused as a method and rewritten for this snapshot;
  nothing was taken from earlier summaries as proof.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A3/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of a2ea7a4 and of HEAD) and at the end (clean export, ls-tree, `scripts/source-digest.mjs`) | 0b8428fd every time, 789 files; repository unchanged outside `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, task-local cache) | exit 0; "1 high severity vulnerability" (dev-only, see risks) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual on both projects | exit 0; 114 tests: 102 passed, 12 skipped by the specs, 0 failed (desktop 50 + 7 skipped: 2 mobile-only and 5 phone first-screen tests, three of them FIX4's; mobile 52 + 5 skipped: 2 pdf-visual and 3 desktop-only B-02 tests) | `04-e2e.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only); package files unchanged since 014bd47 | `06-npm-audit.txt` |
| delta 589bcff..a2ea7a4 and its proof | 5 files (+39/-12); `DayEditor.tsx` comment-only (emitted JS identical, 1033 non-comment tokens identical); CSS: 2 new tokens and 3 phone rules, no hide/move/clip/block property; spec: pure insertion; no server, domain, API, package or config change | `10-delta.txt`, `11-boundary.txt`, `12-delta-proof.txt` |
| boundary since 014bd47; call sites; body builders | `src/server` and the PDF unchanged; `src/domain` only `formatHoursMinutes`; `api.ts` unchanged; 65 endpoints in both; only two new call sites on existing endpoints; builders identical except the leave parse | `11-boundary.txt`, `13-callsites.txt`, `14-body-builders.txt`, `14-variable-calls.txt` |
| client-arithmetic scan of the 25 client files changed since 014bd47 | only the leave hours/minutes input conversion, a break-row count and the OT-leave difference present at 014bd47 | `15-client-files.txt`, `16-client-arith.txt` |
| own probes on a2ea7a4 (1280, 1024, 390) | 24 tests: 19 passed, 4 skipped by design, 1 failed on a measurement artefact; phone rerun with a centred measurement: 1 passed | `30-probe-a2ea7a4-run2.txt`, `32-probe-phone-run3.txt`, `*.json.txt` |
| same flows on a 014bd47 build and comparison | 4 + 2 passed; leave bodies 12/12 SAME, clock, sign-off and batch bodies SAME; mismatches 0 | `31-probe-014bd47-run2.txt`, `38-probe-bodies-014bd47.txt`, `36-compare-014bd47.txt` |
| phone probe on a 589bcff build vs a2ea7a4 | 0 regressions at 390x844, 360x844, 320x844, 360x740, 320x640 | `33-probe-phone-589bcff.txt`, `34-phone-compare.txt`, `35-sticky-bar-artefact.txt` |
| synthetic screenshots | 2 | `a3-phone-grantee-view-only-390-synthetic.png`, `a3-phone-grantee-edit-open-day-320-synthetic.png` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **none.**
- Delta proof (scope 1), FIX4 changes no area-A behaviour:
  1. Only five files changed outside `handoff/`: `src/client/styles.css`, `src/client/DayEditor.tsx`,
     `tests/e2e/timesheet.spec.ts`, `docs/04_UX_AND_SETTINGS.md` and its `.vi.md` (line 9 each). No
     file under `src/server`, `src/domain`, `src/client/api.ts`, the PDF, `package*.json`, the
     tsconfigs, the vite, vitest, playwright or eslint configs or `scripts/` changed.
  2. `DayEditor.tsx:84` is the only changed line and both versions are `//` comments ("768px" became
     "1200px"); TypeScript 6.0.3 emits byte-identical JavaScript for both files with comments removed,
     and their non-comment token streams (1033 tokens) are identical.
  3. CSS: `:root` gains `--date-field-min: 9.5rem` and `--open-day-label-min: 15.25rem`
     (`styles.css:62-63`); inside `@media (max-width: 767px)` the rules `.tools .open-day` (nowrap ->
     wrap, the separate `align-items: center` merged in), `.tools .open-day label` (flex and min-width
     from the token) and `.tools .open-day input` (min-width from the token) changed
     (`styles.css:1083-1103`). None of the changed declarations can hide, move off-screen, clip or block
     a control (no display, visibility, opacity, position, overflow, clip, height, z-index,
     pointer-events, order or transform). The selectors match only the `OpenDay` form
     (`components/OpenDay.tsx:13`), which is rendered only when `canEdit` (`TimesheetScreen.tsx:378`);
     CSS cannot add it for a view-only grantee. On builds of 589bcff and a2ea7a4 the same phone probe
     found every needed control (clock, Open a day field and button, Review & sign off, period steps,
     Show details, Change several days, a day's Edit button, the label picker) present, visible, inside
     the width and not covered at all five asserted sizes (0 regressions). The field now keeps a full
     date (146.2, 220 and 180 px at 390, 360 and 320 px wide) and the button wraps below it at 360 and
     320 px; Open day still opens the modal editor for the typed date and writes nothing; no horizontal
     scroll.
  4. `tests/e2e/timesheet.spec.ts`: all 361 lines of the 589bcff file are kept in order (pure
     insertion of 27 lines: three phone tests at 390, 360 and 320 px); `expect(` lines 107 -> 114; no
     test removed, skipped or weakened.
- Passed in area A on a2ea7a4 (own reproduction, besides the mandatory checks):
  1. Endpoints and bodies versus 014bd47: 65 endpoints at both commits; every 014bd47 write call text
     is unchanged; the only new call sites are the picker's one-entry `POST /days/batch` preview
     (`TimesheetScreen.tsx:302`, entry from `labelEntry`) and the one-tap `PUT /sessions/:id`
     (`DayEditor.tsx:193`, built by `buildSessionRequest`). `buildSessionRequest`,
     `buildClockOutRequest`, `batchEntries`, `modeEndpoint`, `buildSubmitBody` and `api` are identical;
     `buildDayEntryRequest` differs only by the leave parse. Runtime against a 014bd47 build: the day-
     fields body for 0, 45, 150, 240, 480 and 1440 minutes is the same on desktop and phone (12/12);
     clock in (`input_zone`), clock out (`breaks`, `breaks_confirmed`, `expected_version`), batch preview
     and commit with a reason (two days in an old period) and the sign-off (`POST
     /api/timesheets/:p/signoff`, same keys and values) are the same. Side panel (1280), modal editor
     (1024) and phone sheet all send the same day-fields body.
  2. The client computes no business minutes: the scan finds only `leaveInputModel.ts:51-56` (hours x 60
     + minutes, the input unit), a break-row count (`sheetModel.ts:160`) and the OT-leave difference
     present at 014bd47 (`sessionModel.ts:390`); the Overtime Total is `view.totals.
     provisional_credited_minutes` (`TimesheetSheet.tsx:288`) and the Review total
     `payload.totals.credited_minutes` (`ReviewDays.tsx:44`).
  3. A-01 still closed: in all three layouts the 12 malformed or out-of-range entries ("2-", "3-", "e",
     "1.5", "-1" in either field, 60 minutes, 25 hours, 24 h 01 m) are refused with the `role="alert"`
     message, `aria-invalid` on the offending field only, no `PUT /api/days/:date` and nothing stored
     (36 refusals, 0 PUT); valid entries send one PUT with the same body as 014bd47; 014bd47 itself
     refuses the malformed inputs natively.
  4. R-07: three LA sessions (23:00-23:50, 00:20-01:10, 22:00-02:00+1) viewed in America/Los_Angeles,
     Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago and Asia/Ho_Chi_Minh at 1280, 1024 and 390: every
     session stays on its saved accounting date, times and start-date markers equal an Intl oracle, the
     14 dates, OT cells and Overtime Total are identical, the period bar says "Times in <zone>" with the
     zone note only when the zones differ, and the Review shows the same reporting-zone times.
  5. AC-04 in each layout: the old-period picker pick previews only, needs the reason and commits with it;
     the editor's Save is disabled until the reason and the PUT carries it; both reasons are in
     `/api/history`; the picker stops on a stale version (Commit disabled); the day-fields form opened
     through "Open a day" refuses a stale save ("This day changed since it was loaded", server unchanged,
     Reload day); the one-tap break confirmation sends the loaded version and is refused as stale; Delete
     then Escape deletes nothing; the conflict needs its explicit confirmation and sends
     `confirm_conflicts`. DST fold/gap and overnight prompts pass in the mandatory day-editor e2e.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day form, Change several days, clock,
     picker, checkbox, Edit, signature strip, review link or image, 14 "View" buttons, a read-only editor
     without inputs, no write and no request outside `/api/shared/<owner>/` (plus share and auth). An
     edit grantee writes only through `/api/shared/<owner>/` (picker batch preview and commit, the editor's
     day PUT and, on the phone at 320 px through the wrapped "Open a day" row, a second day PUT); the
     owner's history names the grantee. A third user sees nothing and gets 404 for the shared timesheet,
     day, day PUT and the owner's session PUT.
  7. Privacy and PDF: the Timesheet page before and after sign-off has 0 images, 0 CSS url backgrounds
     and 0 `/api/signatures` requests; the strip shows "Signed by ..." and the reporting-zone sign date
     equal to the oracle; the Review has exactly one signature image (`/api/signatures/<id>`) outside the
     sheet. The PDF code and `pdf-visual.spec.ts` are unchanged since 014bd47 and pdf-visual passed; the
     sign-off body is bound to the reviewed `payload_hash` and `expected_version` and is accepted (201);
     review and submission e2e passed (AC-06/AC-07; `ReviewSignoff`, `ReviewEnvelope`, `reviewModel`
     submit functions and the server unchanged).
- Risks and optional improvements, separate from proven defects: (R1, Info) unchanged: the
  `source-map-js` advisory GHSA-68fv-2mgg-jv7q is dev-only (vite -> postcss), `--omit=dev` is clean, the
  lock is unchanged since 014bd47. (R2, Info, re-judged: no area-A impact) Reproduced at 1280 -> 1024:
  the editor is re-shown as a modal above the open picker review; the first Escape closes the editor and
  the review stays (docs/04 line 59 says a nested dialog takes Escape first). While the editor is on top
  the review's reason field cannot take focus and Commit stays disabled; nothing but the preview is
  written; a second Escape closes the review and nothing is committed; with a reason the commit carries
  it and `/api/history` records it. The unsaved note typed in the editor is discarded, not written (an
  area-B UX nuance). (R5, Info, re-judged: no area-A impact) Reproduced: on the 390x844 phone the view-only
  grantee's owner bar ("Viewing Synthetic Owner A's timesheets - view only", 122.8-323.7 px) is fully on
  the first screen and the first day row ends at 849.7 px, below the tab bar top (788 px). Nothing is
  writable in that view, and the sticky top bar keeps "Shared with me: Synthetic Owner A" visible while
  scrolling, so the person always sees whose timesheet it is; a layout matter for area B only. (R6, Info,
  new, outside area A, not caused by FIX4) When a control above the viewport is scrolled into view with
  top alignment (the browser's nearest scroll), the sticky app bar lies over it (seen for the Open day
  button at 320x640 and 280x653); the same happens at 589bcff, and the button scrolled to the centre is
  usable (`35-sticky-bar-artefact.txt`); area B may check focus-not-obscured (WCAG 2.4.11).
- Required gates unrun/blocked and why: none for area A.
- Disposition of previous findings: WP5-UX-A-01 stays closed (item 3). A2's risks: R1 unchanged; R2 and
  R5 re-judged as above (Info, no area-A impact). WP5-UX-AUDIT-A2 (PASS on 589bcff) and WP5-RECHECK
  (014bd47) are superseded by this audit for area A.
- Software readiness, owner permission and pilot result separately: area A accepts a2ea7a4; WP5 is
  re-accepted only if the parallel area-B recheck (WP5-UX-AUDIT-B3) also passes. No owner permission,
  real sending or pilot is involved.
- One next action/prompt: the coordinator records this PASS (with WP5-UX-AUDIT-B3) and, if both pass,
  re-accepts WP5 at a2ea7a4 through the committer; the owner may delete the stray `D:\canedit.txt`
  (runtime slip below).

Runtime notes: two slips of mine, recorded in `90-slips.txt`: one read-only listing piped into `head`,
and one redirect in a shell without the task environment that created `D:\canedit.txt` (30 lines of
public source code, no personal data) outside the task folder; following the coordinator's earlier
instruction for the same kind of slip I did not try to remove it. The e2e fixtures chose their own free
loopback ports; I started no other server. Nothing is left running.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A3 attempt 1; reviewer agent
  ad6212962664d60ea (board); authors WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4
  afb8ef164774cd30d.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the
  redesign round and ran no gate or earlier audit of it; it wrote only this review, its translation, the
  task Results and `evidence/WP5-UX-AUDIT-A3/`; builds of a2ea7a4, 589bcff and 014bd47 and all probes
  ran in the task folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: 0b8428fd before and after; WP5-UX-REGATE2
  PASS on the same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A3.md` (new);
  `WP5_UX_REVIEW_A.md` and `WP5_UX_REVIEW_A2.md` are kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: no finding; no fix task needed for area A.
