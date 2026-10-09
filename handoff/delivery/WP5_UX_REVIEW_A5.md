# Independent review: WP5 UI redesign, area A (recheck after WP5-UX-FIX6)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit paths,
  sharing, isolation, privacy, PDF); 2026-10-09; task WP5-UX-AUDIT-A5 attempt 1; self-reported model
  claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5: WP5-UX-PLAN,
  T02, T04 and FIX5; FIX2, FIX3, FIX4 and FIX6 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  5e104e14dad71268a9185920c04ed0ee2a4b31c2, digest
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 files, `handoff/` excluded), recorded
  first and again at the end. HEAD = origin/main = 5e104e1; no unpushed commit. A clean `git archive` export of
  5e104e1 holds exactly the 790 paths and blobs of the tree (path/blob lists equal, diff exit 0) and was unchanged
  after all checks.
- Decision: **PASS**
- Scope actually inspected/executed: (1) delta proof of `edaaa85..5e104e1` (c24d634 and 49a3ff0 change nothing
  outside `handoff/`; FIX6 changes 8 files): static comparison of the zone-note formatter, a unit sweep of 20316
  instant/zone checks over every DST transition 2025-2027 in 17 zones under 7 device zones, a browser run of the
  zone note over 8 zones and 7 periods on the 5e104e1 and the edaaa85 builds, a declaration-level CSS diff, a
  keyboard focus probe of every area-A control in three layouts and both themes on both builds, a test-line check
  and byte comparison of the built server; (2) the area-A mandatory checks on a clean export of 5e104e1: boundary,
  write call sites and body builders against 014bd47 and edaaa85, run-time bodies of every edit path against a
  014bd47 build, client arithmetic, A-01, R-07 with a device-zone probe and the zone-note due time, AC-04,
  AC-16/AC-01, privacy, PDF/AC-06/07/10, `npm test`, the eight e2e specs on both projects and AC-13 once. The A4
  probes were reused as a method and adapted; nothing was taken from earlier summaries as proof.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A5/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of 5e104e1 and HEAD, `npm run digest`, clean export) and at the end (export re-hashed, ls-tree of HEAD, `npm run digest`) | 07c3ca00 every time, 790 files; export unchanged; repository unchanged outside `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, task-local cache) | exit 0; "1 high severity vulnerability" (dev-only, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1821 tests passed | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual, focus-ring on both projects | exit 0; 124 tests: 109 passed, 15 skipped by the specs' project conditions, 0 failed (desktop 54 + 8 skipped, mobile 55 + 7 skipped; focus-ring 2 + 2) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only) | `06-npm-audit.txt` |
| delta edaaa85..5e104e1, boundary since 014bd47 and edaaa85, built server/domain | 8 files changed by FIX6; `src/server`, `src/domain` (since edaaa85), `api.ts`, PDF, package, configs, scripts, fixtures unchanged; `dist/server` byte-identical at 014bd47, edaaa85 and 5e104e1, `dist/domain` identical at edaaa85 and 5e104e1 | `10-delta.txt`, `11-boundary.txt`, `11b-dist-server.txt`, `12-delta-proof.txt` |
| CSS declaration diff | 3 declarations removed, 3 added: `--focus-ring`, `--focus-ring-inset`, one `box-shadow`; no layout/visibility/hit-test property | `12a-css-rules.txt` |
| due-time unit sweep | 20316 checks x 7 device zones, 0 failures | `12b-due-zone-probe.txt` |
| call sites; body builders; client arithmetic | 66 call keys at all commits; 0 write call texts changed since edaaa85; 12/12 builders identical since edaaa85 | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt` |
| own probes on 5e104e1 (1280, 1024, 390) | bodies 3 passed; A-01, AC-04, AC-16/AC-01, R-07, privacy 15 passed; zone note 3 passed; focus 6 passed | `30-…`, `31-…`, `33-…`, `34-…`, `37-summary.txt` |
| same flows on 014bd47; zone note and focus on edaaa85 | 2 + 2 passed; 3 + 6 passed | `32-…`, `32b-…`, `35-…`, `33b-…` |
| comparisons | bodies vs 014bd47 and zone notes vs edaaa85: mismatches=0; focus facts vs edaaa85: mismatches=0 | `36-compare.txt`, `36b-focus-compare.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **none.**
- Delta proof (scope 1): FIX6 changes the zone note's text format and the focus-ring paint only.
  1. Zone note, same instant and zone. `PeriodBar.tsx:73` changed from `instantText(period.due_at_utc, zone)` to
     `dueInZoneText(period.due_at_utc, zone)`; `period` and the `zone` prop are unchanged (`:18-31`). Both functions
     call the same `formatInZone(zone, parseUtcInstant(…))` and take the same date (characters 0-9) and time (11-15)
     of that string (`format.ts:38-40`, `periodBarModel.ts:28-32`); the new text adds the weekday of the shown date
     and the US date form already used by the bar. No device-zone `Date` is involved. The due words of the bar
     (`dueInWords`, reporting-zone server fields) are unchanged.
  2. R-07, including DST. Unit sweep: every UTC-offset change 2025-2027 in 17 zones (59 gaps and folds, including
     30- and 45-minute offsets) at 15-minute steps over plus/minus 3 hours and plus/minus 1 minute, plus the 17:00
     Los Angeles due time of 1095 days in every zone: the new text equals an independent Intl oracle (weekday
     included) and carries exactly the old text's date and time; 20316 checks, 0 failures, identical under 7 device
     zones. Browser: 8 zones x 7 periods x 3 layouts on both builds: 168/168 rows with the same `due_at_utc`, payroll
     date, due words and local date and time; 42 rows sit across a DST change from today (Europe/London and
     America/New_York after their autumn change, for example `2026-11-11T01:00:00Z` shown as "Tue 11/10/2026, 20:00"
     in New York and "2026-11-10 20:00" before FIX6; Australia/Sydney, Lord_Howe, Pacific/Chatham and
     America/Santiago before their spring change) and are correct on both. The reporting zone's own DST change is
     also covered (due 17:00 PDT = 00:00Z, 17:00 PST = 01:00Z).
  3. No request, body, calculation or saved value changes: no write call site or body builder changed since edaaa85;
     the built server and domain are byte-identical to edaaa85; `dueInZoneText` returns display text and has one
     caller. At run time the focus probe's keyboard-driven writes (clock in/out, day fields, conflict commit, reason
     commit) are identical on the edaaa85 and 5e104e1 builds, and every edit path's body equals 014bd47 (below).
  4. CSS cannot hide or block a control: only `--focus-ring` (now `0 0 0 1px var(--card), 0 0 0 3px var(--accent)`),
     the removed dark override, the new `--focus-ring-inset` and the phone tab's `box-shadow` changed
     (`styles.css:42-43`, `:333-335`). The tokens are used only as `box-shadow` in four `:focus-visible` rules
     (`:220-224`, `:333-335`, `:506-508`, `:1336-1338`); a box-shadow takes no layout space and is not hit-tested, and
     an inset shadow paints below the content. At 1280, 1024 and 390 px in light and dark, 25 (29 on the phone)
     clock, Open a day, period, Edit, label picker, editor field, Save, Add session, Close, Clock-out dialog, Review
     conflicts, confirmation, Confirm and commit, reason and Commit controls each took keyboard focus
     (`:focus-visible`) and stayed visible, opaque, inside the viewport and hit-testable at their centre; every other
     listed control gave the same hit-test with and without the ring (170 or 218 pairs per run, 0 differing); the
     flows were completed with Enter/Space on the ringed controls. The same probe on edaaa85 gives the same facts.
  5. Tests: the only removed test lines are replaced by a wider import and a wider response type; the
     zone-note test gains an oracle assertion; `focus-ring.spec.ts` is new; `fixtures.ts` unchanged. No area-A
     assertion was removed or weakened.
- Passed in area A on 5e104e1 (own reproduction, besides the mandatory checks; `36-compare.txt`, `37-summary.txt`):
  1. Endpoints and bodies versus 014bd47: same 66 call keys, the only added call sites remain the picker's one-entry
     batch preview/commit and the one-tap `PUT /sessions/:id`. At run time on 1280 (non-modal side panel), 1024
     (modal editor) and 390 (bottom sheet) against a 014bd47 build: clock in and out, sign-off (`POST
     /api/timesheets/:p/signoff`, bound to the reviewed `payload_hash` and `expected_version`, 201), the old-period
     batch with a reason, the editor's day-fields PUT and new-session POST, and the one-day label change (picker vs
     014bd47's batch bar with one day) send the same paths and bodies; leave bodies for 0, 45, 150, 240, 480 and
     1440 minutes are the same.
  2. The client computes no business minutes: the scan of the 25 client files changed since 014bd47 finds 35 hits,
     line for line the list recorded at edaaa85; the arithmetic ones are the leave input unit
     (`leaveInputModel.ts:37-38,55,65`), a break-row count (`sheetModel.ts:160`) and the OT-leave difference present
     at 014bd47 (`sessionModel.ts:390`), the rest are JSX attribute text; the Overtime Total is
     `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:288`).
  3. A-01 still closed: in all three layouts the 12 malformed or out-of-range leave entries are refused with the
     message and `aria-invalid` on the offending field only, with no PUT and nothing stored (36 refusals, 0 PUT);
     014bd47 refuses the malformed ones natively.
  4. R-07: three LA sessions (23:00-23:50, 00:20-01:10, 22:00-02:00+1) viewed in America/Los_Angeles, Asia/Tokyo,
     Pacific/Kiritimati, Pacific/Pago_Pago and Asia/Ho_Chi_Minh: every session stays on its saved accounting date,
     times and start-date markers equal the oracle, the 14 dates, OT cells and total are identical, the bar says
     "Times in <zone>", the due words stay "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)", the zone note's due
     time equals the oracle of `due_at_utc` in the viewing zone (for example "Wed 10/14/2026, 09:00" in Tokyo,
     "Tue 10/13/2026, 13:00" in Pago Pago), and the Review shows the same reporting-zone times.
  5. AC-04 in each layout: the old-period picker previews only, needs the reason and commits with it; the editor's
     Save waits for the reason and the PUT carries it; both reasons are in `/api/history`; the picker stops on a
     stale version; the day fields opened through "Open a day" refuse a stale save; the one-tap confirmation sends
     the loaded version and is refused as stale; Delete then Escape deletes nothing; the conflict needs its
     confirmation and sends `confirm_conflicts`. DST fold/gap and overnight prompts pass in the mandatory e2e.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day, Change several days, clock, picker,
     checkbox, Edit, signature strip, review link or image, 14 "View" buttons, a read-only editor without inputs
     and no request outside `/api/shared/<owner>/` (plus share and auth); an edit grantee writes only through
     `/api/shared/<owner>/` (picker, editor, Open a day at 320 px on the phone) and the owner's history names the
     grantee; a third user sees nothing and gets 404 for the shared timesheet, day, day PUT and session PUT.
  7. Privacy and PDF: the Timesheet page before and after sign-off has 0 images, 0 CSS url backgrounds and 0
     `/api/signatures` requests, and the strip's sign date equals the reporting-zone oracle; the Review has exactly
     one signature image outside the sheet. The PDF code and `pdf-visual.spec.ts` are unchanged since 014bd47 and the
     built server is byte-identical; pdf-visual (2, desktop), review and submission e2e passed (AC-06, AC-07, AC-10).
- Risks and optional improvements, separate from proven defects: (R1, Info, unchanged) GHSA-68fv-2mgg-jv7q in the
  dev-only `source-map-js` (vite -> postcss); `--omit=dev` is clean; the lock is unchanged since 014bd47. (R5, Info,
  unchanged, no area-A impact) On the 390x844 phone the view-only grantee's owner bar is 122.8-323.7 px and the first
  day row ends at 849.7 px, below the tab bar top (788 px), the same as at edaaa85. (N3, Info, area B, not caused by
  FIX6) When the pointer rests over a focused control, the hover paint replaces the focus ring because the hover
  selectors are more specific: `button:hover:not(:disabled)` (`styles.css:496-500`) over `button:focus-visible`
  (`:506-508`), `.sheet .label-trigger:hover:not(:disabled)` (`:2216-2220`) over `.sheet .label-trigger:focus-visible`
  (`:2222-2225`); seen on the phone for Commit changes (hover true) on both builds (`36b-focus-compare.txt`); FIX6
  changed no hover rule; the control stays visible and operable. The in-cell label trigger keeps its own inset 2px
  accent focus paint, not the shared token. Area B may judge both. (N4, Info, cosmetic)
  `tests/client/periodBarModel.test.ts:3` lacks a space after a comma in the import list; lint passes.
- Required gates unrun/blocked and why: none for area A.
- Disposition of previous findings: WP5-UX-A-01 stays closed (item 3). A4 risks: R1 unchanged; R5 unchanged (Info,
  no area-A impact). WP5-UX-AUDIT-A2, -A3, -A4 and WP5-RECHECK are superseded by this audit for area A.
- Software readiness, owner permission and pilot result separately: area A accepts 5e104e1; WP5 is re-accepted only
  if the parallel area-B recheck (WP5-UX-AUDIT-B5) also passes. No owner permission, real sending or pilot is
  involved.
- One next action/prompt: the coordinator records this PASS (with WP5-UX-AUDIT-B5) and, if both pass, re-accepts WP5
  at 5e104e1 through the committer.

Runtime notes: Git Bash only; no pipe into head or tail and no stdin-fed script; every file written in the task
folder or the evidence folder. One slip: a wait loop of mine used `2>/dev/null` on a grep of a task-folder file (no
file written). The first two runs of my focus probe failed on probe design (a disabled button cannot take focus;
neighbours under the sticky header counted as covered) and were corrected before the recorded run. The e2e fixtures
chose their own free loopback ports; I started no server of my own; nothing is left running.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A5 attempt 1; reviewer agent
  ac1e9366098766ce1 (board); authors WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02 aa193ddfa339be714,
  T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06 a0db965135fda0d4e, FIX1
  ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4 afb8ef164774cd30d, FIX5 abe661ea7cfd0b8f0,
  FIX6 aa20021a02e3399e7.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the redesign round
  and ran no gate or earlier audit of it; it wrote only this review, its translation, the task Results and
  `evidence/WP5-UX-AUDIT-A5/`; the exports and builds of 5e104e1, edaaa85 and 014bd47 and all probes ran in the task
  folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: 07c3ca00 before and after; WP5-UX-REGATE4 PASS on
  the same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A5.md` (new);
  `WP5_UX_REVIEW_A.md`, `WP5_UX_REVIEW_A2.md`, `WP5_UX_REVIEW_A3.md` and `WP5_UX_REVIEW_A4.md` are kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: no finding; no fix task needed for area A.
