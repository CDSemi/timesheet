# WP5-UX-AUDIT-A dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A; package WP5; kind audit;
  attempt 1; depends on WP5-UX-GATE (PASS).
- Area A of the independent re-audit of WP5 after the owner-requested UI redesign:
  **business integrity, zones, edit paths, sharing, isolation and privacy**. Area B
  (UX fidelity, accessibility, test strength, docs) runs in parallel in a separate
  context; do not coordinate with it. WP5 is re-accepted only if both areas PASS.
- `reviewed_commit` = 831f760838950a59f0e5c880f0bbefda15fe0c61 (the WP5-UX-GATE
  `freeze_commit`); digest of record
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9. HEAD = origin/main =
  5beae2f668d15fc77a39b91a91e2c8bb6195d65a adds handoff records only. Audit a clean
  export (or a scratch clone) at 831f760; record the digest before and after.
- The accepted WP5 snapshot before this round: 014bd47 (digest 150420e7), audited by
  WP5-RECHECK. That PASS is superseded by this audit (board `superseded_by`).
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author: WP5-UX-PLAN, T02 and T04 ran on opus). Routing: size L, risk H,
  novelty no.
- Fresh context: you authored none of WP5-UX-PLAN, T01-T06, FIX1 or the gate, and ran no
  earlier audit of this round. Do not rely on the authors' or the verifier's summaries
  as proof: trace production code and reproduce.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; docs/01, docs/02 (R-04, R-07 and the rules the sheet displays),
  docs/03 (client/API boundary), docs/04, docs/05 (review and sign-off), docs/06 (AC-01,
  AC-04, AC-06, AC-07, AC-10, AC-13, AC-16), docs/10 (2026-10-08 owner decisions).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` (sections B, F audit list, G) and the Results
  of WP5-UX-T01..T06, WP5-UX-FIX1 and WP5-UX-GATE, with their evidence.
- The board (read-only): owner and coordinator decisions of 2026-10-08 (including the
  accepted out-of-list file `periodBarModel.ts` and the viewing-zone decision).
- The diff `014bd47..831f760` of `src/` and `tests/`.

## Scope

1. **No business behaviour change.** Every client write uses the same endpoints and
   request bodies as at 014bd47 (compare every `api.ts` call site and body the changed
   screens build: day fields, sessions, breaks, batch preview/commit, clock in/out,
   review acknowledgement, sign-off, submission). No server change except the display
   formatter in `src/domain/format.ts`, which equals the PDF formatter.
2. **The client computes no business minutes.** Review `sheetModel.ts`,
   `periodBarModel.ts`, `dayEditorModel.ts`, `labelPickerModel.ts`, `leaveInputModel.ts`,
   `reviewModel.ts` and the sheet components: every displayed figure comes from the
   server payload. The hours + minutes leave input only converts to the integer
   minutes the API takes and keeps today's validation; probe its edge cases.
3. **R-07 zones.** Times shown in the display zone, accounting dates as saved, the Review
   in the reporting zone as on the PDF; the period bar always names the viewing zone
   (FIX1). Probe a device-zone change (for example via the test runner's TZ or the
   browser timezone) and show that no day regroups.
4. **Edit paths (AC-04).** The side panel, the phone bottom sheet and the in-cell label
   picker keep the reason prompt for historical corrections, the conflict confirmation,
   `expected_version` stale handling, DST fold/gap and overnight prompts. Reproduce at
   least one reason-required correction and one stale-version case through the new UI.
5. **Sharing and isolation (AC-16, AC-01).** A grantee with edit rights edits through the
   shared requester; a view-only grantee has no edit, clock, batch or Open-a-day
   control; a second user sees nothing of the first. Reproduce through e2e or your own
   probe.
6. **Privacy and PDF.** The signature image appears only where it appears on the Review
   today, never on the Timesheet page; screenshots and evidence contain synthetic data
   only; the PDF code and output are unchanged (AC-10); the review payload hash and
   sign-off flow are unchanged (AC-06, AC-07).
7. **Mandatory checks, run yourself:** `npm test`; the e2e specs `day-editor`,
   `sharing`, `isolation`, `review`, `submission`, `timesheet` and `pdf-visual` on both
   projects; record counts. AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A` (set TEMP and TMP to it). Ports
  47910-47929 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the task
  folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`. No
  Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  Write scripts with the Write tool and run them by path; python only as the workflow
  Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  Node 24 by its full portable path; first shell call `node --version`; record the digest
  first.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_A.md` and `handoff/delivery/WP5_UX_REVIEW_A.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt`, screenshots
  `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 180 words, beginning with your self-reported model: the decision, the
findings, the mandatory check counts, the digests and the evidence files.

## Continuation instructions (coordinator, 2026-10-08)

Your first hand-back stopped correctly after the denied `rm`. Continue the SAME audit on
831f760 now:
- Do NOT retry, rephrase or work around the removal of `D:\raw-r07.txt`. Leave it; the
  owner deletes it. Create files ONLY inside your task folder or your evidence folder,
  with the Write tool; never redirect command output to a path outside the task folder.
- Finish the scope you did not complete: the device-zone probe (R-07), AC-04 reason and
  stale-version probes through the new UI, sharing/isolation (AC-16, AC-01), privacy
  (signature image only on the Review), and the leave-input probe.
- Resolve your open question by reproduction: at 831f760, can a malformed or empty
  hours/minutes leave entry in the day editor reach `PUT /api/days/:date` with a
  different `leave_minutes` than the user meant (for example 0), where 014bd47 refused
  the save? Compare both commits on the same input. If it can, it is a finding.
- Explain the `npm ci` "1 high severity vulnerability" line: run `npm audit` with and
  without `--omit=dev` in your export and say whether it affects production dependencies
  (the gate recorded 0 with `--omit=dev`). Do not fix anything.
- Same runtime rules; in particular NO pipes into head or tail (redirect to a file in the
  task folder and read it), and NO stdin-fed scripts.
- Update WP5_UX_REVIEW_A (+ vi) and append your final decision (PASS, FIX REQUIRED or
  NOT VERIFIED) below, keeping the first hand-back text as history.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09, self-reported model claude-opus-5-5): stopped on a permission denial

- Decision: **NOT VERIFIED** (the audit stopped before its own probes; no finding is proven).
- Model check: the strongest author model on the board is claude-opus-5-5 (WP5-UX-PLAN, T02,
  T04); this auditor is claude-opus-5-5, so not weaker. Fresh context; authored nothing in this round.
- Digest of record 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (789
  files) before and after: ls-tree form of 831f760 and of HEAD 5beae2f, a clean `git archive`
  export of 831f760 hashed with `git hash-object --no-filters` (before and after all checks), and
  the repository after (no change outside `handoff/`). Evidence `00-digest.txt`.
- Why it stopped: a Git Bash command of mine wrote one grep line of docs/02 to `$TMP/../raw-r07.txt`
  in a shell without the task TMP, which created `D:\raw-r07.txt` (33 bytes, no personal data).
  Deleting that single file (`rm "D:/raw-r07.txt"`) was denied by a built-in safety check. Per the
  brief ("If a permission check denies a call, stop and report") I did not retry or work around it
  and stopped. The owner may delete `D:\raw-r07.txt`. Two grep pipelines of mine also piped into
  `head -c` (against the rule; no server or node involved). Evidence `90-permission-stop.txt`.

Checks run by me in the clean export (Node v24.21.0 portable, Git Bash, TEMP/TMP in the task folder)

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0; it printed "1 high severity vulnerability" (npm audit not run; the gate recorded 0) | `01-npm-ci.txt` |
| `npm test` | exit 0, 82 files, 1817 tests passed | `02-npm-test.txt` |
| `npm run build` | exit 0 | `03-build.txt` |
| `playwright test` day-editor, sharing, isolation, review, submission, timesheet, pdf-visual (both projects) | exit 0: 94 tests, 90 passed, 4 skipped by the specs (desktop: 2 mobile-only tests; mobile: 2 pdf-visual tests), 0 failed | `04-e2e.txt` |
| `vitest run tests/integration/ac13-two-week.test.ts` (AC-13 once) | exit 0, 1/1 | `05-ac13.txt` |
| scope diff 014bd47..831f760, call-site diff | see below | `10-scope.txt` |

Code read so far (production code traced; not yet confirmed by my own browser probes)

1. Business behaviour: `src/server` (including `src/server/pdf`) has no diff; `src/domain` differs only
   by `formatHoursMinutes` in `src/domain/format.ts` (+13 lines; equal to the PDF's for whole
   non-negative minutes). `src/client/api.ts` is unchanged. The client's call strings are identical
   except two new call sites on existing endpoints: the in-cell label picker's one-entry
   `POST /days/batch` preview (`TimesheetScreen.tsx:294`), whose commit reuses the batch commit body
   (`TimesheetScreen.tsx:247-252`); and the one-tap break confirmation `PUT /sessions/:id`
   (`DayEditor.tsx:173`), built by the same `buildSessionRequest` as the session form
   (`dayEditorModel.ts:80-84`, `SessionForm.tsx:96-100`). Picker entries add `wfh` only for Worked
   and Work from home (`labelPickerModel.ts:30-35`), a field the batch schema already accepts
   (`schemas.ts:102`). The review submit body (`buildSubmitBody`, `modeEndpoint`) is unchanged.
2. Client minutes: the new models only format server fields, count break rows or unresolved inputs,
   group by accounting date and compare instants; the Overtime Total is
   `totals.provisional_credited_minutes`. The leave input converts hours x 60 + minutes with 0-24 h,
   0-59 min and a 1440 limit (`leaveInputModel.ts:39-48`). Open question, not reproduced: the day
   fields form is now `noValidate` (`DayFieldsForm.tsx:61`); a `type=number` field holding a bad
   input (for example "2-") reports the value "" which `parseLeaveInput` counts as 0, where the
   014bd47 form (no `noValidate`) blocked the submit natively. It needs a browser probe before it can
   be a finding.
3. R-07: session times use the display zone (`sheetModel.sessionRange`), weeks group by `work_date`
   (`sheetModel.weeksOf`), the review uses `payload.reporting_zone` (`ReviewDays.tsx:29`), the period
   bar always shows `Times in <zone>` (`PeriodBar.tsx:58`). The device-zone probe was not run.
4. AC-04: the e2e above passed for reason, stale version, DST fold/gap, overnight, quick breaks and the
   picker; the picker opens the review dialog when the preview needs a reason, a conflict
   confirmation or cannot commit (`labelPickerModel.ts:43-47`). My own reproduction was not run.
5. AC-16/AC-01: Open a day, Change several days, the picker and the editor's write controls are gated
   by `canEdit`; the clock and signature lines by `own`. My own probe was not run.
6. Privacy and PDF: the signature `<img>` exists only in `ReviewEnvelope.tsx:48` and
   `SignatureUpload.tsx` (both unchanged since 014bd47); `styles.css` has no `url(`; the sheet's
   signature strip is text only. My own DOM/network probe was not run.

Remaining scope (for a resumed attempt): device-zone probe (several browser zones, same days and
session grouping, review text unchanged); own reason-required and stale-version reproductions through
the side panel, the bottom sheet and the picker; view-only/edit grantee and second-user probe; Timesheet
vs Review signature-image DOM/network probe; the leave bad-input probe (and, if it differs, the same
probe on a 014bd47 build); then the REVIEW decision and digest after.

Next action: the coordinator resumes this auditor (or dispatches attempt 2) to finish the remaining
scope on 831f760; the owner may delete `D:\raw-r07.txt`.

### Attempt 1 continued (2026-10-09, same auditor, claude-opus-5-5): final decision

- Decision: **FIX REQUIRED** (one finding, WP5-UX-A-01, Medium). Everything else in area A passed
  my own checks and probes.
- Digest 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (789 files) at the
  continuation start and at the end: ls-tree form of 831f760 and of HEAD 5beae2f (no change outside
  `handoff/`), and the clean export after all probes. Evidence `11-digest-continuation.txt`.
- Runtime: `D:\raw-r07.txt` left untouched for the owner; no further denial; every file written in
  the task folder or the evidence folder; no pipe into head or tail; no stdin-fed script; no
  cmd.exe; nothing left running (each Playwright run ended with its fixtures' servers).

#### Finding WP5-UX-A-01 (Medium): a malformed leave entry is saved as a different leave

- Where: `src/client/components/DayFieldsForm.tsx:60-61` (the form became `noValidate`) together
  with `src/client/components/leaveInputModel.ts:29-33` (an empty field text counts as 0). A
  `type=number` field holding a bad input reports the value "" (`validity.badInput` true), so the
  hours or minutes typed there are silently dropped and the other field is saved.
- Reproduction (own Playwright probe, same keystrokes on both commits; `leave-831f760-desktop.json.txt`,
  `leave-831f760-mobile.json.txt`, `leave-014bd47-desktop.json.txt`, runs `40-leave-probe-runs.txt`):
  - 831f760, hours typed "2-", minutes 30, kind vacation: the page showed "Day fields saved.",
    `PUT /api/days/:date` sent `leave_minutes` 30, the server stored 30 (meant 150).
  - 831f760, hours 4, minutes typed "3-": stored 240 (meant 243). Hours "2-", minutes 0: stored 0
    and the kind dropped (meant 120). Same on the phone project.
  - 014bd47, the same malformed keystrokes ("2-", "150-", "e") in its leave field: the form is
    invalid (`badInput`), no PUT is sent, nothing is stored.
  - Unchanged and correct at both commits: empty fields save 0; fractions and out-of-range values are
    refused (831f760 with the page message, 014bd47 natively).
- Rule: brief scope 2 ("keeps today's validation"); docs/04 line 62 (the page refuses fractions or
  out-of-range values with a message); AGENTS rule 8 (no silent business-behaviour change).
- Required fix: treat a leave field whose `validity.badInput` is true as invalid (for example carry a
  bad-input flag into the draft so `parseLeaveInput` / `buildDayEntryRequest` returns
  `LEAVE_INPUT_MESSAGE`, or keep native validation for these two inputs), add a unit test and an e2e
  step that types a malformed value and asserts the message and no PUT; then freeze, gate and a fresh
  re-audit of area A.

#### npm ci "1 high severity vulnerability"

`npm audit` (all): exit 1, one high advisory, GHSA-68fv-2mgg-jv7q in `source-map-js` 1.2.1, a
transitive dev dependency (vite 8.3.1 -> postcss 8.5.28 -> source-map-js). `npm audit --omit=dev`:
exit 0, 0 vulnerabilities. `package.json` and `package-lock.json` have no diff since 014bd47, and a clean
014bd47 `npm ci` prints the same line, so the advisory is newer than the lock, not from this round,
and does not affect production dependencies. Nothing fixed. Evidence `06-npm-audit.txt`.

#### Own probes (`probe-*.txt` sources, run `42-audit-a-probe-run.txt`: 8 passed on both projects)

- R-07 device-zone probe (`r07-*.json.txt`): three LA sessions (23:00-23:50, 00:20-01:10, an
  overnight 22:00-02:00+1) viewed in America/Los_Angeles, Asia/Tokyo, Pacific/Kiritimati,
  Pacific/Pago_Pago and Asia/Ho_Chi_Minh. Every session stayed on its saved accounting date, and so
  did a 10/05 local start in Pago Pago or a 10/08 start in Tokyo, both marked with the local start date. Times matched an Intl
  oracle in each zone. The 14 dates, OT cells and the Overtime Total were the same in every zone, and
  the period bar named the zone ("Times in <zone>") with the zone note only when the zone differed.
  The review printed the same reporting-zone (LA) times in every device zone.
- AC-04 (`ac04-*.json.txt`): old-period picker pick -> review dialog with the reason, preview only,
  commit with `reason`; editor (non-modal side panel on desktop, modal bottom sheet on the phone) day
  fields Save disabled until the reason, PUT with `reason`; both reasons in `/api/history`. Stale:
  picker pick after a change elsewhere -> preview "changed elsewhere", Commit disabled, nothing saved;
  one-tap break confirmation after a session change -> "This day changed since it was loaded",
  version unchanged, Reload day. Conflict: picker "Off" on a worked day -> conflict step, confirmation
  required, commit with `confirm_conflicts`, session kept.
- AC-16/AC-01 (`sharing-*.json.txt`): view-only grantee: no Open a day, Change several days, clock,
  picker, checkbox, Edit button, signature strip, review link or image; 14 "View" buttons; the
  read-only editor has no write control; every data request under `/api/shared/<owner>/` (plus
  `/api/shares`, `/api/auth/*`). Edit grantee: pickers, no clock or review; the pick went to
  `/api/shared/<owner>/days/batch` and the owner's history names the grantee. A third user: no owner
  note or session in the page, 404 for the shared timesheet, day and the owner's session PUT.
- Privacy (`privacy-*.json.txt`): Timesheet page before and after sign-off has 0 images and 0
  `/api/signatures` requests, the strip shows "Signed by ..." and the reporting-zone sign date equal to
  the oracle. The Review shows exactly one signature image (`/api/signatures/<id>`) outside the sheet.
- DST fold/gap and overnight through the new editor: covered by the mandatory e2e I ran (passed).

Next action: the coordinator opens a bounded fix for WP5-UX-A-01 (worker), then freeze, gate and a
fresh area-A re-audit on the new digest.
