# Independent review: WP5 UI redesign, area A (re-audit after the fix round)

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit
  paths, sharing, isolation, privacy, PDF); 2026-10-09; task WP5-UX-AUDIT-A2 attempt 1; self-reported
  model claude-opus-5-5, not weaker than the strongest author of the reviewed snapshot (claude-opus-5-5:
  WP5-UX-PLAN, T02, T04; FIX2 and FIX3 ran on claude-sonnet-5-5); effort as dispatched (xhigh).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  589bcff5541a603abad696a3303dbea11cccb4a7, digest
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e (789 files, `handoff/` excluded).
  HEAD = origin/main = 589bcff; no unpushed commit. A clean `git archive` export of 589bcff holds
  exactly the 789 files and blobs of the tree (path and blob lists equal, diff exit 0).
- Decision: **PASS**
- Scope actually inspected/executed: the diff `014bd47..589bcff` of `src` and `tests` and in particular
  `831f760..589bcff` (FIX2, FIX3); every client write call site and the request bodies of the changed
  screens against 014bd47; the client display models for business arithmetic; A-01 by my own probe on
  589bcff (1280, 1024 and phone) and on a clean 014bd47 build, and by reverting the FIX2 source in a
  scratch copy; the mandatory checks; my own probes for R-07, AC-04 (including the new modal editor
  below 1200px), AC-16/AC-01 (including the modal editor and the compact phone layout), privacy, and the
  new risks of the fix round; the export's whole e2e suite once more at 1024px (modal side panel).
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A2/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest first (ls-tree of 589bcff and of HEAD) and at the end (clean export, ls-tree, `scripts/source-digest.mjs` in the repository) | 8c07aac5 every time, 789 files; repository unchanged outside `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, task-local npm cache) | exit 0; "1 high severity vulnerability" (dev-only, see risks) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `02-npm-test.txt` |
| `npm run build` | exit 0 | `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual on both projects | exit 0; 108 tests: 99 passed, 9 skipped by the specs, 0 failed (desktop 50 + 4 skipped: mobile-only and phone first-screen tests; mobile 49 + 5 skipped: pdf-visual and the 768-1280px B-02 tests) | `04-e2e-mandatory-both-projects.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities, exit 0; all: exit 1, one high (`source-map-js`, dev-only) | `06-npm-audit.txt` |
| `npm run typecheck`; `npm run lint` | exit 0; exit 0 | `07-typecheck-lint.txt` |
| business boundary since 014bd47; client call sites 014bd47 vs 831f760 vs 589bcff; body builders | `src/server` and the PDF unchanged; `src/domain` only `formatHoursMinutes`; `api.ts` unchanged; 65 endpoints in both; the fix round adds or changes no call site; bodies unchanged | `10-boundary.txt`, `11-callsites.txt`, `14-body-builders-diff.txt`, `15-write-bodies.txt` |
| own A-01 probe on 589bcff (1280, 1024 modal, phone) | 3 passed: 12 malformed or out-of-range entries refused with an alert and no PUT; valid entries send one PUT | `21-leave-589-run.txt`, `leave-589bcff-*.json.txt` |
| same entries on a clean 014bd47 build (desktop, phone) and body comparison | 2 passed; bodies of the valid entries equal, mismatches=0 | `23-leave-014-run.txt`, `24-leave-compare.txt`, `leave-014bd47-*.json.txt` |
| FIX2 tests without the fix (scratch copy only) | R0 control: unit 9/9, e2e 2/2; R1 both files at 831f760: unit 2 failed, e2e 2 failed; R2 form only at 831f760: unit 9/9, e2e 2 failed; R3 submit-time read removed: unit 9/9, e2e 2 failed at "e" | `30-fix2-scope.txt`, `32-variant-R*.txt`, `33-mutation-R3.diff.txt` |
| whole e2e suite at 1024x800 (project named desktop) | 87 tests: 80 passed, 5 skipped, 2 failed by design (two tests that assert the 1280px non-modal panel) | `41-e2e-full-1024.txt` (first run `40-e2e-1024-first-run.txt`) |
| own probes AC-04 and new risks | 4 passed, 2 skipped (resize probe runs in the desktop project only) | `42-ac04-run.txt`, `ac04-*.json.txt`, `risk-desktop.json.txt` |
| own probe AC-16/AC-01 in three layouts | 3 passed | `43-sharing-run.txt`, `sharing-*.json.txt` |
| own probes R-07 device zone and privacy in three layouts | 6 passed | `44-r07-privacy-run.txt`, `r07-*.json.txt`, `privacy-*.json.txt` |
| own probe phone controls (390x844, 360x740, 320x640) | 1 passed | `46-phone-run.txt`, `phone-controls-mobile.json.txt` |
| synthetic screenshots | 2 | `a2-leave-refused-1024-modal-synthetic.png`, `a2-phone-grantee-view-only-synthetic.png` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **none.**
- Passed in area A (own reproduction, besides the mandatory checks):
  1. A-01 closed (details under "Disposition of previous findings").
  2. No business behaviour change: `src/server` (including `src/server/pdf`) has no diff since 014bd47;
     `src/domain` adds only `formatHoursMinutes` (13 lines), equal to the PDF's `layout.ts`
     formatter for whole non-negative minutes; `src/client/api.ts` is unchanged. The client uses the
     same 65 endpoints; the only new call sites are the picker's one-entry `POST /days/batch` preview
     (`TimesheetScreen.tsx:302`, entries from `labelEntry`, the batch entry shape plus the existing
     optional `wfh`) and the one-tap `PUT /sessions/:id` (`DayEditor.tsx:193`, built by
     `buildSessionRequest`). The fix round changes no call site. Clock in, batch preview/commit, delete,
     review submit bodies are unchanged; the day-fields body has the same six keys and, for the same
     leave, the same values as 014bd47 (0, 45, 150, 240, 480, 1440 compared on desktop and phone).
  3. The client computes no business minutes: the scan of the sheet, period-bar, editor, picker, leave
     and review models finds only a count of break rows, the leave hours-to-minutes input conversion
     and the existing informational OT-leave difference (present at 014bd47); the OT cells and the
     Overtime Total are server fields formatted as h:mm.
  4. R-07: three LA sessions (23:00-23:50, 00:20-01:10, 22:00-02:00+1) viewed in America/Los_Angeles,
     Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago and Asia/Ho_Chi_Minh on 1280, 1024 and the phone:
     every session stays on its saved accounting date, times and start-date markers equal an Intl
     oracle, the 14 dates, OT cells and total are identical, the period bar says "Times in <zone>" with
     the zone note only when the zones differ, and the Review shows the same reporting-zone times.
  5. AC-04 in each layout (1280 non-modal panel, 1024 modal side panel, phone modal sheet): the old-period
     picker pick needs the reason before commit and sends it; the editor's Save is disabled until the
     reason and the PUT carries it (both reasons in `/api/history`); stale versions stop the picker
     (Commit disabled), the day-fields save and the one-tap break confirmation ("This day changed since
     it was loaded", version unchanged, Reload day); the conflict needs its explicit confirmation and
     sends `confirm_conflicts`; Delete then Escape deletes nothing. DST fold, DST gap, overnight,
     reason, stale, delete and picker e2e also pass at 1024 in the whole-suite run.
  6. AC-16/AC-01 in each layout: a view-only grantee has no Open a day, Change several days, clock,
     picker, checkbox, Edit, signature strip, review link or image, 14 visible "View" buttons, a
     read-only editor without any input, and only `/api/shared/<owner>/` data requests; the owner bar
     ("Viewing Synthetic Owner A's timesheets - view only") stays visible on the phone where the page
     heading is screen-reader-only. An edit grantee writes through `/api/shared/<owner>/days/batch` and,
     through the modal editor at 1024 and on the phone, `PUT /api/shared/<owner>/days/<date>`; the
     owner's history names the grantee. A third user sees nothing and gets 404 for the shared
     timesheet, day, day PUT and the owner's session PUT.
  7. Privacy and PDF: on the Timesheet page before and after sign-off 0 images, 0 CSS url backgrounds
     and 0 `/api/signatures` requests; the sheet strip shows "Signed by ..." and the reporting-zone sign
     date; the Review has exactly one signature image (`/api/signatures/<id>`) outside the sheet. PDF
     code and `pdf-visual.spec.ts` unchanged since 014bd47 and pdf-visual passed; review and submission
     e2e passed (AC-06/AC-07 paths unchanged: `buildSubmitBody`, `ReviewSignoff`, server unchanged).
  8. No new risk from the fix round: typed input (notes, 2 h 30 m) survives 1280 -> 1024 -> 700 -> 1280
     in the same editor (non-modal, modal side, modal sheet, non-modal) with no write; Escape at 1024
     closes without writing and reopening starts from the server; behind the modal editor the clock,
     picker, Open a day, Change several days and day buttons take no focus and the clock click is
     blocked; at 1280 Escape in a picker review closes only the review and the editor stays; after a
     resize below 1200px with that review open, nothing is committed and Commit stays disabled until
     the reason. On the phone at 390, 360 and 320px wide, Clock in/out, Open a day, Open day, Review &
     sign off, Previous/Next, Show details, Change several days, a day's Edit button and the label
     picker are present, visible, inside the width and not covered; Clock in, the Clock out dialog,
     Open a day, the period steps and the review link work; no horizontal scroll; the visually hidden
     page heading holds no control. The grantee view keeps every owner-only control absent (item 6).
- Risks and optional improvements, separate from proven defects: (R1, Info) the `source-map-js`
  advisory GHSA-68fv-2mgg-jv7q stays dev-only (vite -> postcss), `--omit=dev` is clean, the lock is
  unchanged since 014bd47. (R2, Info) If the window shrinks below 1200px while a picker review dialog is
  open over the non-modal editor, the editor is re-shown as a modal on top of the review, so the first
  Escape closes the editor, not the review (docs/04 line 59 says a nested dialog takes Escape first).
  Nothing is written or bypassed (`risk-desktop.json.txt`, step e); a UX nuance for area B if wanted.
  (R3, Info) 014bd47 accepted exponent text such as "1e2" minutes (sent 100); 589bcff refuses
  non-digit text with the message, which is stricter and never saves a different value. (R4, Info) The
  FIX2 unit tests alone do not catch a regression in the form (R2 and R3 pass them); the FIX2 e2e test
  does on both projects, so the suite as a whole guards A-01. (R5, Info, outside area A, not assessed)
  On the phone the grantee's owner bar pushes the first day row below the first screen; B-01 was
  specified for the employee's own view.
- Required gates unrun/blocked and why: none for area A.
- Disposition of previous findings: **WP5-UX-A-01 closed.** At 589bcff, with the first audit's inputs,
  hours "2-" with 30 minutes, hours 4 with minutes "3-", hours "2-" with 0 minutes, and "e", "1.5", "-1"
  in either field, 60 minutes, 25 hours and 24 h 01 m are each refused with the `role="alert"` message
  "Enter leave as whole hours (0 to 24) and minutes (0 to 59), at most 24h 00m." inside the Partial
  leave fieldset, `aria-invalid` and `aria-describedby` on the offending field only, no
  `PUT /api/days/:date`, nothing stored (1280, 1024 modal and phone). Valid entries send the same body
  as 014bd47; empty fields save 0 as before; a refused entry corrected in place clears the alert and
  sends 150. Without the fix (scratch copy) the FIX2 e2e test fails on both projects (R1, R2), and also
  when only the submit-time `validity.badInput` read is removed (R3, fails at "e"); the unit tests fail
  only when the model change is reverted (R1). Earlier risks R1 (dev-only advisory) and R2 (sign-date
  zone) of WP5_UX_REVIEW_A: R1 unchanged (above); the sign-date check of the privacy probe matched the
  reporting-zone oracle again. WP5-RECHECK (014bd47) stays superseded.
- Software readiness, owner permission and pilot result separately: area A accepts 589bcff; WP5 is
  re-accepted only if the parallel area-B re-audit (WP5-UX-AUDIT-B2) also passes. No owner permission,
  real sending or pilot is involved.
- One next action/prompt: the coordinator records this PASS (with WP5-UX-AUDIT-B2) and, if both pass,
  re-accepts WP5 at 589bcff through the committer.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A2 attempt 1; reviewer agent
  a3e5899e0a050c9d1 (board); authors WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer authored nothing in the
  redesign round and ran no gate or earlier audit of it; it wrote only this review, its translation, the
  task Results and `evidence/WP5-UX-AUDIT-A2/`; probes, the 014bd47 build and the FIX2 revert ran in the
  task folder, never in the repository.
- Source digest before/after; gate evidence for that snapshot: 8c07aac5 before and after; WP5-UX-REGATE
  PASS on the same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A2.md` (new);
  `WP5_UX_REVIEW_A.md` (FIX REQUIRED on 831f760) is kept unchanged.
- Finding dispositions and next coordinator fix/recheck task: WP5-UX-A-01 closed; no new finding; no
  fix task needed for area A.
