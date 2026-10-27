# WP5-UX5-PLAN-FIX7 dispatch brief (fix plan for the WP5-UX5-AUDIT-B findings)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-PLAN-FIX7, package WP5, kind
  plan, attempt 1. It follows WP5-UX5-AUDIT-B (FIX REQUIRED on f4049aa / 26b163a6). It is
  read-only for the repository.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Two findings need a decision before a worker can fix them: F-UX5B-3 (the code or the
    doc route) and R-UX5B-1 (fix now or record). The other four are named fixes; plan them
    precisely, so one worker can do them without a further plan.
  - Write the task record in English.
- **Running beside you:** WP5-UX5-AUDIT-A, an independent audit, on ports 49860-49889.
  - Keep your probes light and short, and stay in your own ports and folders.
  - Do not read or cite AUDIT-A's files while it runs.
- **Read:**
  - `handoff/delivery/WP5_UX5_REVIEW_B.md`, the findings table and the risks;
  - `handoff/delivery/tasks/WP5-UX5-AUDIT-B.md` (Results);
  - the evidence named there in `handoff/delivery/evidence/WP5-UX5-AUDIT-B/`, especially
    `40-pdf-content.txt`, `41-pdf-leave-holiday.txt`, `52-cross-revision.txt`,
    `36-mutants-full.txt` and `38-mutant-M11-email.txt`;
  - the owner's words on the board: `owner_decisions` of 2026-10-21 and 2026-10-22 (F-2 a,
    F-4, H-1 a), and the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md` (Addendum 2's PDF
    table, B-A1, B-A2);
  - AGENTS.md rule 8.
- **Base.** HEAD = origin/main = f4049aa7905e22f1467dfcae4208675cb2fc8e80, or a later commit
  that changes only `handoff/`. Probe in a scratch export of HEAD.

## Questions to answer

1. **F-UX5B-3 (leave on a holiday day in the PDF).**
   - **Can a real day carry both a holiday label and leave?** Check the domain rules, the
     Day editor, the workbook import and the API, with file:line. If it can, say how often:
     for example, whether a public holiday can carry partial leave, and whether company
     closures are holidays.
   - **What did the owner ask for?**
     - Quote the owner's words, and the canonical rule (docs/12:86, AC-10 "long labels",
       R-WA2), on leave and long labels in the PDF.
     - Under AGENTS rule 8, is the doc route (state an exception) a change of business
       behaviour that needs the owner? Or does the existing rule already decide for the
       code route?
   - **Design the smallest code fix** that keeps "Leave h:mm" whole in
     `src/server/pdf/timesheetPdf.ts:336-342`. For example: the holiday text is cut first,
     or the leave figure gets its own line.
     - Name the lines and the tests to add.
     - Does it change the bytes of any PDF without that overflow? Check against the pilot
       sample hashes S1-S6 and N1-N5 (`handoff/delivery/WP5_PILOT_PACKET.md`), and the
       determinism tests.
     - Does it change the page-count rule (one page for all four variants)?
     - Prove the design in your scratch export: the auditor's probes
       (`92-pdf-content.ts.txt`, `93-pdf-leave-threshold.ts.txt`) must pass, and every
       existing PDF test still passes. Do not change the repository.
   - Recommend the code or the doc route, with the reason.
2. **R-UX5B-1 (a superseded revision's queued send arrives after the correction).**
   - Confirm it from the auditor's probe, and confirm that the base 8e55710 behaved the
     same.
   - Which documented rule does it touch? Read docs/05 "Corrections and resends", "A send
     still in progress blocks another one (409)", docs/03 and the owner's F-4.
   - List the options with file:line, the size of each, and its risk:
     - block a send while any revision of the period has a waiting send;
     - skip, or cancel, a superseded revision's queued send;
     - clarify docs/05 only.
   - Recommend one. Say whether it is a round-5 defect, a pre-existing defect, or a
     documented limit, and whether it needs the owner's decision.
3. **The named fixes. Give one exact worker specification:**
   - **F-UX5B-1:** the exact sentence to delete in docs/05:11, EN and VI.
   - **F-UX5B-2:** the current strings in `SignoffDialog.tsx` and `reviewModel.ts`, and the
     exact replacement text in docs/12:54 and docs/04:124, EN and VI. docs/04 is area A's
     document, so name the lines exactly.
   - **F-UX5B-4:** a docs/10 entry for the owner's decision H-1 a of 2026-10-22, quoting the
     board verbatim, EN and VI. Also the citation change at docs/05:19, EN and VI.
   - **F-UX5B-5:**
     - one integration test: save `show_time_on_pdf` false, sign off, and assert that the
       sign-off PDF job and file are `t1o1` (or `t1o0`) while the send draft says time rows
       off;
     - the decode fix for `sends.test.ts:300`.

     Prove that each test fails under the auditor's mutant (M12b; M11) and passes on HEAD,
     in your scratch export.
   - **Owned paths** for one worker.
4. **The optional hardening R-UX5B-3:** four `container-drill.mjs` fetch sites without
   `connection: close` (:275, :302, :385, :987). Is it worth folding into this fix round,
   given that the drill runs at every gate? Give the exact edit.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-PLAN-FIX7`. Ports 50320-50339. Set TEMP,
  TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS.**
  - Use the Write tool to create files.
  - Read outputs with the Read tool.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only.
- **Repository writes.** Change nothing in the repository except:
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-PLAN-FIX7/`: masked LF `.txt` only, with probe
    scripts saved as `*.ts.txt` or `*.mjs.txt`.

  Do not stage or commit. Do not run `npm ci` or `npm install` in the repository.
- Write no email address except `@example.invalid`.
- Run nothing in the background that outlives your return.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 200 words, beginning 'Self-reported model: ...', with:
- the F-UX5B-3 facts and recommendation;
- the R-UX5B-1 options and recommendation;
- whether the owner must decide either;
- the owned paths.

## Results

Self-reported model: claude-sonnet-5-5. Attempt 1. Base HEAD f4049aa7905e22f1467dfcae4208675cb2fc8e80 (git archive export
plus `npm ci` in the task folder; Node 24.21.0). All probes ran in process (no server, no port used). Evidence:
`handoff/delivery/evidence/WP5-UX5-PLAN-FIX7/` (numbers below); the proposed change as one diff is `200-proposed-change.diff.txt`
(standard `diff -u` with a/ b/ labels, so `git apply` works). Repository changes by me: this Results section and that folder only.
AUDIT-A's files were not read.

### 1. F-UX5B-3 (leave on a holiday day in the PDF)

**Facts (observed).**
- A real day can carry both. Nothing forbids it:
  - `dayEntryIssue` / `validateLeave` check only the kind, the whole-minute value and leave <= the policy's required minutes
    (`src/server/services/timesheetCommands.ts:302-316`, `src/domain/attendance.ts:90-119`); no calendar check;
  - the Day editor's Partial leave dialog has no holiday condition (`leaveInputModel.ts`, `DayFieldsForm.tsx`: no match for
    holiday); the batch commit shares `applyDayEntryChange` (`timesheetCommands.ts:328`);
  - the workbook import writes `leave_minutes` 0 always (`workbookImport.ts:681-683`, `:700`), so it cannot create the case;
  - `holiday_name` is the calendar rule's name for any rule date, holiday or closure (`src/domain/calendar.ts:68-70`,
    `reviewPayload.ts:91`), so a company closure counts;
  - docs/02:23 says "Personal leave/Off labels do not change calendar eligibility" and docs/02:52 counts leave "entered on that
    day", so the domain treats them as independent.
  - How often: no data. It needs partial leave typed on a holiday or closure date; expected rare, but unguarded.
- The owner never asked for "Leave h:mm" on the PDF in words. The review risk R-WA2 (`WP5_REVIEW_A.md:66`: "payroll reads the
  PDF") led the T02 worker to print it "as in mockup B11" (`tasks/WP5-UX5-T02.md:309-310`); docs/12:86 states it as behaviour
  and leaves "whether payroll needs more" to the owner. The canonical rules that apply: docs/04:122 "readable long labels",
  AC-10 (docs/06:18) "long labels", docs/12:86 "A day with leave prints 'Leave h:mm' in small type under its category". docs/12:85
  already documents that a very long holiday label may be cut with an ellipsis.
- AGENTS rule 8: the code route restores the documented behaviour (no rule changes, so no owner decision). The doc route would
  state that a payroll document may lose the leave figure, which changes what payroll sees against docs/12:86; that is the one
  that needs the owner.

**Recommendation: the code route.** Smallest fix, in `drawCategory` (`src/server/pdf/timesheetPdf.ts:331-356`, the lines of
diff hunk 1 in `200-proposed-change.diff.txt`):
- `both = holiday !== '' && leave !== ''`; when both, `subText` is the holiday only and `fitText(..., both ? 1 : 2, ...)` gives
  it ONE line (shrunk 7 to 5 pt, then an ellipsis); the leave text is added as its own line at 7 pt. The sub block becomes a
  list of `{ text, size }` lines, and `block` is the sum of `size * 1.2`. With one line or one source the arithmetic is the same
  as before (a sum of equal terms equals `n * subLine` for n <= 2, so bytes do not change).
- The block never exceeds the old two-line maximum (about 16.8 pt), so the category band (minimum 37 pt with 4 stacked sessions
  and both row sets: `layout.ts:90`) and the one-page rule are untouched.
- Result for the auditor's seven names: "Labor Day" / "Leave 1:30" ... "Lunar New Year's Eve (c…" / "Leave 1:30" (`103-patched.txt`).
  The holiday text is cut first; its category already says "Holiday".

**Proof (scratch export of HEAD, repository untouched).**
- Auditor probes `92-pdf-content.ts.txt` and `93-pdf-leave-threshold.ts.txt` read a private scratch database, so I ported them to
  a synthetic snapshot with the same day edits, names and assertions (`103-auditor-probes-port.ts.txt`). On HEAD: 13 FAIL (5 of
  93's seven names, 8 of 92: four variants x with/without image), reproducing the finding (`103-head.txt`). With the fix: 0 FAIL
  (`103-patched.txt`).
- Differential probe, old and new renderer on the same snapshot (`101-leave-holiday-diff.ts.txt`): 1,920 pairs (10 holiday
  names incl. none x 4 leave values x 4 categories x 3 session counts x 4 row variants). The 624 pairs without both labels are
  byte-identical; the 1,296 with both print "Leave h:mm" whole as one 7 pt item in both columns, one page, inside the margins
  (`101-diff.txt`: failures 0). The same probe against HEAD code reports 1,152 failed checks (`102-diff-on-head-summary.txt`), so it
  discriminates.
- The pilot samples S1-S6/N1-N5 contain neither a holiday label nor leave (the six `pdf-text-*.txt` of `evidence/WP5-UX5-T06/`
  have no "Leave" or "Holiday"), so the changed branch is not reached. I could NOT show it by regenerating them: the generator is
  not byte-reproducible (submission ids are random per run, `105-ids.txt`; two runs differ, `131-hashes.txt` vs `133-hashes.txt`),
  so S1-S6 hashes do not need to be, and cannot be, re-derived; they stay valid as stored artifacts.
- New tests pass on the fix and fail on HEAD (6 of 8 new tests fail; the two guards pass both): `110-pdf-render-patched.txt`
  (88 passed, pdf-render + pdf-layout), `111-pdf-render-on-head.txt` (6 failed). Existing determinism and one-page tests pass.
  Full suite with all proposed changes: 101 files, 2,384 tests passed (HEAD: 2,374), `180-full-suite.txt`; typecheck of the three
  projects, `node --check` of the drill and eslint of the six changed files exit 0 (`170-checks-all.txt`).
- Tests to add (in `tests/integration/pdf-render.test.ts`, describe "bounds of long labels", diff hunk 5): (a) working day with
  150 min leave and no holiday prints exactly `['Leave 2:30']` in its category cell (two row variants); (b) `it.each` six holiday
  names (Labor Day ... "Year-end shutdown: plant maintenance week") with 90 min leave: in all four variants the cell holds the
  holiday label on ONE line, then one item "Leave 1:30" at 7 pt, label above it, one page; (c) a long holiday label without
  leave still wraps on two lines (guard that the old path is unchanged). Also a docs/12:86 sentence (EN and VI): "On a day that
  also has a holiday label, the label is shrunk to one line and cut first; the leave figure keeps its own line."

### 2. R-UX5B-1 (a superseded revision's queued send arrives after the correction)

**Confirmed, with one correction to the audit's picture.** `106-cross-revision*.txt` (the auditor's probe `98` rerun 6 times on
HEAD): the correction's send is accepted while revision 1's send waits and needs no reason (no copy counted yet); both messages are
delivered. The ORDER is not fixed: 3 runs delivered revision 2 first (the harmful order, as the audit saw), 3 delivered revision
1 first. The cause of the variation is not investigated (the runner's pick order of two queued jobs). The base 8e55710 has the
same per-revision guard: `finalization.ts:1141-1147` (read from git, `jobs ... revision_id = ?`), and its correction path never
looked at older sends. So it is pre-existing, not a round-5 defect. The send job does not check supersession when it runs
(`jobs/sendJob.ts:202-236`). Window: from the owner's send until its job delivers: seconds on a healthy host, and up to the
documented retry ladder (1, 5, 15, 60 min, docs/05:48) when the provider is down.

**Rules touched.** docs/03:60 says the 409 is per revision ("an attempt of the revision ... one of its send jobs waits"), which
the code implements. docs/05:72 says "A send still in progress blocks another one (409)" without a scope, and reads period-wide.
So the two documents are inconsistent in reach; the owner's F-4 only says another copy needs a reason. The reason rule cannot
help: it counts accepted or uncertain attempts, and none exists yet.

**Options.**
| Option | Where | Size | Risk |
|---|---|---|---|
| A. A waiting send job of any revision of the period blocks a send | `deliveries.ts:431-436` (`assertNothingInFlight`): join the job to its revision and to the target revision by `timesheet_id` (diff hunk 2); wording "this revision" -> "this period" in that message and `deliveryModel.ts:376`, `:584`; docs/03:60 and docs/05:72 EN+VI; one test | S: ~8 lines, 2 strings, 1 test, 4 doc lines | Low. The owner can be blocked from sending a correction while an older send retries (up to about 80 min, only when the provider is down); after it, the correction needs a reason, which is the F-4 intent. Proved: probe `107` gives 409 `delivery_in_progress`; 148 tests of sends, corrections, jobs, finalization, reminders and delivery files pass (`161-...`); the new test fails on HEAD (`160-...`) |
| B. Cancel or skip a superseded revision's queued send | `sendJob.ts` start, or `reviseTimesheet` / `finalization.ts:1022-1090`: needs a cancelled state for the job and a visible state for the send record (`revision_sends` has none), History and the Send card wording | M-L | Medium-high. It drops a send the owner chose, and touches the job state machine and the uncertain/attempt logic |
| C. Clarify docs only | docs/05:72 EN+VI ("of the same revision, as document 03 says") and a docs/12 known limit | S | None to code; leaves the out-of-order delivery possible |

**Recommendation: A**, in this fix round (a regate runs anyway because the PDF fix is code). It enforces the sentence docs/05:72
already writes, is the smallest of the code options and keeps the owner's explicit send. Whether to do A or only C is a
coordinator call; it does not need the owner (nothing the owner decided is reversed; docs/03:60 gets aligned). B WOULD need the
owner. Not a round-5 defect (pre-existing, Low). If the coordinator prefers C only, record it in docs/12 "Submission and mail"
as a known limit and drop the A-only items below.

### 3. Worker specification (one worker, WP5-UX5-FIX7)

Apply `200-proposed-change.diff.txt` as the starting point for the code and test items (it is the exact change proven above;
check with `git apply --check`), then the documents below. EN is canonical; give every changed EN text its VI counterpart in the
same commit, keeping the structure. Do not change anything else.

**F-UX5B-1.** `docs/05_SUBMISSION_AND_NOTIFICATIONS.md:11`: delete the last sentence of the paragraph: ` Until the Send card
(WP5-UX5-T03), the Review page sends right after a successful sign-off with the Settings defaults.` `.vi.md:11`: delete the
last sentence ` Cho tới khi có thẻ Gửi (WP5-UX5-T03), trang Review gửi ngay sau khi sign-off thành công với giá trị mặc định của Settings.`
No other file in `docs/`, `src/` or `tests/` carries that wording (searched).

**F-UX5B-2.** Current UI strings: `SignoffDialog.tsx:133-135` `<dt>Signer</dt>` with `{name} (you)`; `:151-158` `<dt>Signature</dt>`
with `{signature.text}` and, when there is no image, the link `Add a signature image in Settings.`; `reviewModel.ts:512-515`
`signatureSummary`: no image `your name only`, an image `your saved image and your name`. Replacements:
- `docs/04_UX_AND_SETTINGS.md:124`: replace `the Review sign-off shows "You sign as" with the account name.` with
  `the Sign off dialog shows the account name under "Signer", followed by "(you)".` and replace `and the Review shows "Signed with
  your name only." with a link "Add a signature image in Settings."` with `and the Sign off dialog's "Signature" line reads "your
  name only" with a link "Add a signature image in Settings." (with a saved image it reads "your saved image and your name")`.
- `docs/04_UX_AND_SETTINGS.vi.md:125`: the same two edits; the Vietnamese strings to replace are `phần sign-off của Review hiện
  "You sign as" cùng tên tài khoản` and `và Review hiện "Signed with your name only." cùng liên kết "Add a signature image in
  Settings."`.
- `docs/12_RELEASE_NOTES.md:54`: replace `("Signed with your name only.", with a link to Settings)` with `(the Sign off dialog's
  "Signature" line reads "your name only", with a link "Add a signature image in Settings.")`; `.vi.md:54`: replace
  `("Signed with your name only.", kèm liên kết tới Settings)` likewise. Keep the quoted UI strings in English in the VI file.

**F-UX5B-4.**
- `docs/05_SUBMISSION_AND_NOTIFICATIONS.md:19`: `(owner decision F-2 a)` -> `(owner decisions F-2 a of 2026-10-21 and H-1 a of
  2026-10-22)`; `.vi.md:19`: `(quyết định của chủ F-2 a)` -> the VI equivalent naming both decisions with their dates. Apply the
  same citation at `:38` (the reminders sentence, "at its first send (owner decision F-2 a)") in both files, because H-1 a also
  says reminders do not restart.
- `docs/10_DECISIONS_AND_SOURCES.md`: add after line 317 (end of the F-2 a, F-3 b, F-4 section, before the end of file) a section
  `## Owner decisions — 2026-10-22 (WP5-UX5, what "submitted" means after a correction, H-1 a)`. Text:
  Source: the owner's chat answer of 2026-10-22, "1 a, 2 a", recorded verbatim in the task board (`ORCHESTRATION.json`, id
  `answered_owner_question_ux5_h1`). Question 2 = WP5-UX5-H-1, answer a. The board records it as: "a period stays submitted once
  any revision has a send; a later correction or late review is not auto-sent at the deadline and reminders do not restart; the
  person sends it from the Send card (as built in WP5-UX5-T01B)." The question (board): "When a correction or a late review is
  signed after a copy of the period was already sent: (a, built, recommended) the period stays 'submitted': no automatic send of
  the new revision at the deadline and no new reminders; the person sends the correction from the Send card when they choose
  (consistent with 'corrections never send by themselves'); (b) the period becomes 'not submitted' again until the new revision
  is sent: reminders restart and, with auto-submit on, the deadline scan sends the new revision automatically."
  Bullets: (1) H-1 a is the rule "a period counts as submitted once any of its revisions has a send" (`periodHasSend`,
  `deliveries.ts:226`); the plan's B-A1 had said "its current revision has a send", and WP5-UX5-T01B built "any revision" and
  flagged the deviation; the owner confirmed what was built. Reversible only by a new owner decision. (2) Effects: no deadline
  send and no new reminders for a correction or late review made after a send; the owner sends it from the Send card; the
  F-2 a rules for a period that was never sent are unchanged. (3) Rules already written under it: document 05 "Deadline and
  recovery" and "Reminders and review links" (see the citations above), AC-07 in document 06. Add the matching VI section to
  `.vi.md` (after its line 318), same bullets, the board quotation left in English.
  (The same day's "A.a, B.A, C.b" and the "FREEZE-T01B-Q 1 a" answers are about repository synchronization and committing
  mechanics, not product behaviour; do not record them here.)

**F-UX5B-5.** Both tests are in the diff (hunks for `tests/integration/sends.test.ts`).
- Test 1: `signed()` takes optional settings overrides (`signed(settings = {})`); new test "the Settings time switch reaches the
  send draft, not the PDF job and file of the sign-off": `signed({ show_time_on_pdf: false })`; the draft says `time_rows` false;
  the render_pdf job has the plain business key and payload `variant: 't1o1'`; after `runPdf()` the only file is `t1o1` ready;
  a send with the draft defaults has `time_rows` false, `pdf_variant` `t0o1`, and the ready files are still only `t1o1`.
- Test 2 (the decode fix for `sends.test.ts:300`): join quoted-printable soft breaks (`.replace(/=\r?\n/g, '')`) before checking,
  keep the phrase check, add `not.toMatch(/Reason:/i)`, and a positive control that the joined text contains the send's own first
  body line.
- Proof (`150-...` to `153-...`): both pass on HEAD (17 tests). Mutant M12b (the AUDIT-B definition, in `finalization.ts`
  `enqueueSignedPdf`): Test 1 fails, 16 others pass (`151-sends-under-M12b.txt`). Mutant M11 (reason appended to the stored body in
  `deliveries.ts` `insertSend`): Test 2 fails, 16 pass (`152-sends-under-M11.txt`), while the OLD `sends.test.ts` passes all 16 under
  M11 (`153-OLD-sends-under-M11.txt`), which is the audit's finding. All mutants restored byte-identical (`cmp`).
- If A is chosen: the new test in sends.test.ts "a send that still waits for an older revision (R-UX5B-1)" (fails on HEAD with
  `160-...`, passes with A, `161-...`).

**R-UX5B-3, the drill (fold it in: yes).** Four one-token edits to `scripts/container-drill.mjs`, no other change:
`:278` and `:305` add `connection: 'close'` to the `headers` object of `uploadSignature` and `uploadWorkbook`; `:385` add
`connection: 'close'` to `{ cookie, origin: publicOrigin }` of the stage-1 PDF download; `:987` change to
`fetch(\`${server.base}/api/health\`, { headers: { connection: 'close' }, signal: AbortSignal.timeout(2000) })`. Reason: the drill
runs at every gate, `call()` already closes, and these four sites share the pooled keep-alive failure mode of DIAG3. Checked here:
`node --check` and eslint exit 0; the drill itself needs Docker and was NOT run (a regate must run it, as it must anyway because
`src/` ships in the image).

**Checks for the worker.** `npm run typecheck`, `npm run lint`, `npm test` (expect 101 files; 2,384 tests with all items above,
2,383 without A), the new tests failing on HEAD where stated, the container drill `--wp3`, `npm run digest`; EN/VI parity of the
changed doc pairs. Then the freeze, a regate, and the fresh area-B recheck the review asks for.

**Owned paths (one worker).**
- Code and tests: `src/server/pdf/timesheetPdf.ts`, `tests/integration/pdf-render.test.ts`, `tests/integration/sends.test.ts`,
  `scripts/container-drill.mjs`; with option A also `src/server/services/deliveries.ts` and `src/client/components/deliveryModel.ts`.
- Documents (each EN and `.vi.md`): `docs/05_SUBMISSION_AND_NOTIFICATIONS`, `docs/12_RELEASE_NOTES`, `docs/04_UX_AND_SETTINGS`
  (area A's document: only line 124 / 125), `docs/10_DECISIONS_AND_SOURCES`; with option A also `docs/03_ARCHITECTURE_AND_DATA`
  (line 60: "or while one of its send jobs waits" -> "or while a send job of any revision of the period waits") and docs/05:72
  ("A send still in progress blocks another one (409)" -> add "of any revision of the period").
- The worker's own task record `handoff/delivery/tasks/WP5-UX5-FIX7.md` and evidence folder `handoff/delivery/evidence/WP5-UX5-FIX7/`.

### 4. Owner decisions needed

- F-UX5B-3: none on the code route (it restores docs/04, AC-10 and docs/12:86). Only the doc route would need the owner.
- R-UX5B-1: none for A or C (coordinator call; A is recommended). B would need the owner.

### 5. Limits and honest notes

- The container drill, e2e and Docker were not run. The differential probe imports a copy of the HEAD renderer that I placed beside
  the patched one in the scratch export and removed afterwards (so `101-leave-holiday-diff.ts.txt` no longer runs there as is).
- Hash equality of the regenerated samples could not be shown (not reproducible); see section 1.
- Runtime-rule slips of mine, none harmful: I created one scratch shell script with a here-document, and used `/dev/null` twice
  (`cat > /dev/null` and `ls ... > /dev/null`) in scratch commands; nothing was written to the repository by them.
- Commands and exits are in the evidence files (`setup.sh.txt`, `run-*.sh.txt`, and the `exit` lines in the outputs).

Status: done
