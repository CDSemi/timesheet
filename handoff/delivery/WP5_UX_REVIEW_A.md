# Independent review: WP5 UI redesign, area A

- Package/date/reviewer and observable model/effort: WP5, area A (business integrity, zones, edit
  paths, sharing, isolation, privacy, PDF); 2026-10-09; task WP5-UX-AUDIT-A attempt 1 (first
  hand-back, then continued on the coordinator's instruction); self-reported model claude-opus-5-5,
  not weaker than the strongest author (claude-opus-5-5); effort as dispatched.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: 831f760838950a59f0e5c880f0bbefda15fe0c61,
  digest 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (789 files, `handoff/`
  excluded). HEAD = origin/main = 5beae2f (handoff records only); no unpushed commit. A clean
  `git archive` export of 831f760 holds exactly the 789 files of the tree.
- Decision: **FIX REQUIRED**
- Scope actually inspected/executed: diff 014bd47..831f760 of `src` and `tests`; every changed client
  write path and body; the new display models (`sheetModel`, `periodBarModel`, `dayEditorModel`,
  `labelPickerModel`, `leaveInputModel`, `reviewModel`) and the sheet components; the mandatory
  checks; my own Playwright probes for R-07, AC-04, AC-16/AC-01, privacy and the leave input on
  831f760, and the leave probe on a clean 014bd47 build.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX-AUDIT-A/`):

| Command | Result / exit | Evidence |
|---|---|---|
| digest at start, at the first hand-back, at the continuation start and at the end | 3d274c9e every time (ls-tree, clean export, repository) | `00-digest.txt`, `11-digest-continuation.txt` |
| `npm ci` (Node v24.21.0) | exit 0; "1 high severity vulnerability" (explained below) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 files, 1817 tests passed | `02-npm-test.txt` |
| `npm run build` | exit 0 | `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual on both projects | exit 0; 94 tests: 90 passed, 4 skipped by the specs (desktop 2 mobile-only, mobile 2 pdf-visual), 0 failed | `04-e2e.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit`, `npm audit --omit=dev`, `npm ls`/`npm explain source-map-js` | all: exit 1, one high (dev-only `source-map-js`); omit-dev: exit 0, 0 | `06-npm-audit.txt` |
| scope diff and client call-site diff | server and PDF unchanged; domain only `formatHoursMinutes`; two new client call sites on existing endpoints with existing body shapes | `10-scope.txt` |
| own probes R-07, AC-04, AC-16/AC-01, privacy (both projects) | 8 passed | `42-audit-a-probe-run.txt`, `r07-*`, `ac04-*`, `sharing-*`, `privacy-*` |
| own leave-input probe 831f760 (both projects) and 014bd47 (desktop) | reproduces WP5-UX-A-01 | `40-leave-probe-runs.txt`, `leave-*.json.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

| ID | Severity | File:line | Reproduction / evidence | Expected / actual | Rule | Required fix |
|---|---|---|---|---|---|---|
| WP5-UX-A-01 | Medium | `src/client/components/DayFieldsForm.tsx:60-61` (`noValidate`) with `src/client/components/leaveInputModel.ts:29-33` (empty text counts as 0) | Day editor, same keystrokes on both commits: 831f760 hours typed "2-", minutes 30 -> "Day fields saved.", PUT `leave_minutes` 30, stored 30; hours 4, minutes "3-" -> stored 240; hours "2-", minutes 0 -> stored 0 and the kind dropped (desktop and phone). 014bd47 with "2-", "150-", "e" -> form invalid (`badInput`), no PUT, nothing stored | Expected: a malformed entry is refused with a message as at 014bd47. Actual: the malformed field is read as 0 and a different leave is stored | brief scope 2 ("keeps today's validation"); docs/04 line 62; AGENTS rule 8 | Treat `validity.badInput` as invalid (flag in the draft so `parseLeaveInput`/`buildDayEntryRequest` returns `LEAVE_INPUT_MESSAGE`, or keep native validation for these inputs); add a unit test and an e2e step typing a malformed value that asserts the message and no PUT; then freeze, gate, fresh area-A re-audit |

- Passed in area A (own reproduction, besides the mandatory checks):
  1. No business behaviour change: `src/server` (including the PDF) has no diff; the domain change is a
     display formatter equal to the PDF's; `api.ts` unchanged; the only new client writes are the
     picker's one-entry `POST /days/batch` (preview, then the batch commit body) and the one-tap
     `PUT /sessions/:id` built by the session form's own builder; the review submit body is unchanged.
  2. The client computes no business minutes; the Overtime Total is the server total. The leave
     conversion itself is correct for well-formed input (finding above for malformed input).
  3. R-07: five browser zones (LA, Tokyo, Kiritimati +14, Pago Pago -11, Ho Chi Minh) show the same 14
     accounting dates, session grouping, OT cells and total; times follow an Intl oracle with the local
     start-date marker; the period bar always names the viewing zone; the Review stays in LA times.
  4. AC-04 through the picker, the side panel (desktop) and the bottom sheet (phone): reason prompts
     before any write and sent with the write (both in history); stale versions stop the write with the
     reload message; the conflict needs an explicit confirmation; DST and overnight via the e2e run.
  5. AC-16/AC-01: view-only grantee without any edit, clock, batch, picker or Open-a-day control and
     only shared requests; edit grantee edits through `/api/shared/<owner>/` and is named in the
     owner's history; a third user sees nothing and gets 404 by id swap.
  6. Privacy and PDF: no signature image or `/api/signatures` request on the Timesheet page before or
     after sign-off; one image on the Review, outside the sheet; PDF code unchanged and pdf-visual
     passed; review payload hash and sign-off flow unchanged (review and submission e2e passed).
- Risks and optional improvements, separate from proven defects: (R1, Info) `source-map-js` advisory
  GHSA-68fv-2mgg-jv7q is dev-only (vite -> postcss), predates this round (lock unchanged since 014bd47)
  and `--omit=dev` is clean; a routine dependency refresh can take it. (R2, Info) the sheet's signature
  date uses the current `reporting_zone` of the timesheet view while the PDF uses the snapshot's; they
  differ only if a saved reporting zone changes after sign-off.
- Required gates unrun/blocked and why: none for area A. History: the first hand-back stopped as NOT
  VERIFIED after a denied removal of a stray file I had created (`D:\raw-r07.txt`, left for the owner);
  the coordinator asked me to continue the same audit.
- Disposition of previous findings: none earlier in this round; WP5-RECHECK (014bd47) stays superseded.
- Software readiness, owner permission and pilot result separately: area A does not accept 831f760
  until WP5-UX-A-01 is fixed and re-audited; no owner permission or pilot is involved.
- One next action/prompt: open a bounded fix task for WP5-UX-A-01, then freeze, gate and a fresh
  area-A re-audit on the new digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX-AUDIT-A attempt 1; reviewer agent
  acb592d06034e4ad5 (board); authors WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2.
- Fresh context; confirm reviewer did not author changes: yes; this reviewer wrote only this review,
  its translation, the task Results and `evidence/WP5-UX-AUDIT-A/`; probes ran from the task folder.
- Source digest before/after; gate evidence for that snapshot: 3d274c9e before and after; WP5-UX-GATE
  PASS on the same freeze commit.
- New report path preserving previous review history: `handoff/delivery/WP5_UX_REVIEW_A.md` (new in
  this round; the first hand-back's NOT VERIFIED stays in the task Results).
- Finding dispositions and next coordinator fix/recheck task: WP5-UX-A-01 open -> fix, freeze, gate,
  fresh area-A re-audit.
