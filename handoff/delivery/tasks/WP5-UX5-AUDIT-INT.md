# WP5-UX5-AUDIT-INT dispatch brief (integration audit of UI change rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-INT, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE12 (PASS required) and WP5-UX5-RECHECK-B3 (PASS required).
  - Its PASS re-accepts WP5 after UI change rounds 4 and 5. It supersedes
    WP5-UX5-RECHECK-A2 (PASS on be2afa2 / ff73565b) as the current acceptance of area A.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size L, risk H, novelty no. docs/08 "WP5 as 2-3 area audits plus one
    integration pass".
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_INT.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task, and none of their audits; the
  agent IDs are on the board. Treat every report and earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE12 on the board.
    It is the WP5-UX5-FIX17-FREEZE commit, pushed. HEAD may be a later commit that changes
    only `handoff/`.
  - TARGET_DIGEST = 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882
    files). If the board records a later accepted fix before your dispatch, the coordinator
    states the new target in an addendum.
  - The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest
    507de97c).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".
- Never touch `.claude/worktrees/` or its branch.

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- **The owner's words**, verbatim on the board (`owner_decisions`):
  - the round-4 requests and answers;
  - the round-5 request, the answers F-1..F-10 and the mockup notes and adjustments;
  - "1 a, 2 a", "A.a, B.A, C.b" and "D.a, E.a";
  - the `coordinator_decisions` of rounds 4 and 5.
- The plans `handoff/delivery/tasks/WP5-UX4-PLAN*.md` and `WP5-UX5-PLAN*.md`, and the mockup
  `handoff/delivery/design/WP5-UX5/mockup.html`.
- **Every review of the rounds:**
  - `WP5_UX4_*` reviews;
  - `WP5_UX5_REVIEW_A.md` and `_B.md`;
  - `WP5_UX5_RECHECK_A.md`, `_B.md`, `_A2.md`, `_B2.md` and `_B3.md`.
- **Every gate record:** WP5-UX5-GATE, and REGATE to REGATE12.
- **Every diagnosis and fix record:** DIAG1..DIAG10, FIX1..FIX17, with their evidence.
- docs/04, 05, 10, 11 and 12, EN and VI, as frozen.

## Scope

1. **Integration of the rounds' records.**
   - Every finding of every review is closed, or accepted as an optional risk with a
     reason.
   - Earlier verdicts are carried forward only where the later diffs leave them valid.
     Name the diffs you checked: `git diff <reviewed_commit>..TARGET` for each earlier PASS
     area.
   - Map every owner item of rounds 4 and 5 (U4-xx, U5-xx), and every answer, to the
     review that judged it. No item may be left unjudged.
   - Every gate FAIL reason has a verdict. The REGATE5 to REGATE11 failures were:
     - the logo timeout;
     - the measuring races;
     - the starved tab (theme, then import and the midnight crossing test);
     - the range ladder;
     - the midnight date reads.
   - Judge the gate load rule adopted after REGATE11: a starvation timeout, with the census
     over the limit, makes that run NOT VERIFIED and it is repeated once on a quiet host.
     Also judge the logo sweep's load sensitivity, a backlog risk.
   - Every recorded risk has a current status.
2. **Changes since the area rechecks.**
   - **Area A:** confirm that RECHECK-A2's PASS (on ff73565b) still holds at the target.
     FIX16 should touch no client file. FIX17 touches only two e2e files: judge whether its
     changes prove what the old tests proved.
   - **Area B:** confirm RECHECK-B3's verdict on the target.
3. **Cross-area behaviour, by your own probes:**
   - a period signed and sent, then corrected and resent, with a backup, restore, resume
     and release in between. Watch what the Review page and the history show at each step.
   - the Day editor's unsaved-changes guard with a check-in running across the local
     midnight;
   - the theme followed across two tabs while the Day editor and the account menu are open;
   - a shared view (view only and edit) with the round-5 header, sheet and dialogs.
4. **Test design.** Judge the suite as it now stands. The e2e suite holds tests off the
   reporting-zone midnight (FIX15). Is the midnight behaviour covered enough by:
   - the crossing test;
   - the integration boundary tests;
   - DIAG9's product probe?
   Also check that the simulated-clock sweeps still test what FIX10 designed them for.
5. **AC-13** under the America/Los_Angeles, Asia/Tokyo and America/New_York device zones.
6. **Docs.** Check docs/04, 05, 10, 11 and 12, EN and VI, against the frozen behaviour for
   the points above. Check that the EN and VI files keep structural parity.
7. **Mandatory checks:**
   - typecheck, lint, `npm test`, build (no advisory);
   - the FULL e2e on both projects on the real clock;
   - one seven-file sweep run at 2026-10-27T06:58:30Z through the FIX10 wrapper.

   A run that fails only with a network or buffer error is rerun once, and both runs are
   recorded.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-INT`. Ports 51450-51489.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
  times only. Never write the command line of a process the mission did not start.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR
  `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>`. NO `rm -r` OR `rm -rf`, NO `sed -i`, NO FIFO WAITER SCRIPTS, NO `git init`, NO
  `sleep`, `ping` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS.**
  - Write probes as files in the task folder and run them by path.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or
  `npm install` in the repository.
- axe-core 4.14.0, if used, goes in the task folder only.
- Never kill processes by PID. Leave nothing running.
- Create files only in the task folder, the evidence folder and the review pair. Every file
  ends with exactly one newline. Evidence names end in `.txt` or `-synthetic.png` only, with
  at most 12 screenshots.
- Use synthetic data and local mail capture only. No email address except the full
  synthetic `@example.invalid` form. No password literal. Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5I-n), with its severity, file:line, reproduction and
    expected result.
  - List the optional backlog for the WP5 handoff separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

Auditor: timesheet-auditor, self-reported model claude-opus-5-5 (board agent abc262afcf62ce6a7; not an author of any WP5-UX4 or WP5-UX5 task or audit; the strongest author model of the snapshot is claude-opus-5-5). Target: reviewed_commit a5cbc91e6965633a0f9d1dd7e912577321cc71e3 = HEAD = origin/main before and after; digest 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf, 882 files, equal in three forms (export, ls-tree, npm run digest) at 07:55:37Z and 09:08:47Z; no status line outside `handoff/`. Review pair: `handoff/delivery/WP5_UX5_REVIEW_INT.md` and `.vi.md`. Evidence: `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/` (index `00-README.txt`).

**Decision: FIX REQUIRED** (one new Low finding).

- **F-UX5I-1, Low.** The open Day editor does not follow a Check in or Check out made from the page: a clock action reloads the period (`TimesheetScreen.tsx:305-312`) but not the editor, which reads its day only on mount, after its own writes and on a label or batch commit (`DayEditor.tsx:176-192`, `:207-212`). Reproduced on the desktop project at 1440px (beside) and 1280px (floating): after Check in the editor shows no session while the server has a running one; after Check out it still shows none while the sheet shows the ended session; reopening shows it (`44-obs-clock-editor.txt`). With a note typed in the editor first, "Save day fields" after the clock actions is refused ("This day changed since it was loaded. Nothing was saved. ...", "Reload day") and the server keeps no note; by the code "Reload day" restarts the forms, so the note must be typed again (`44-error-context-clock-editor-note.txt`, `DayEditor.tsx:250-257`). Round 4 (U4-05) made the drawer non-modal at every desktop width, so the page's clock is reachable with the drawer open from 768px. Nothing is stored wrongly and nothing is lost silently (the server's version check refuses the stale save and says so). Bounded fix: re-read the open editor's day after a clock action without restarting its forms (the `saved()` path: `setDay`, no `generation` change), one e2e test at 1440px and 1280px with an unsaved note, docs/04 one clause EN/VI if needed.
- **Integration (scope 1).** Every finding of the rounds (F-UX4A-1..4, F-UX4B-1, F-UX5A-1..4, F-UX5B-1..5, F-UX5A2-1, F-UX5B2-1, F-UX5B3-1) is closed by a named recheck; every owner item U4-01..U4-15, U5-01..U5-34 and every answer is mapped to the review that judged it; every gate FAIL reason (UX4-GATE, UX4-REGATE2, UX5-GATE, REGATE, REGATE2, REGATE3, REGATE5, REGATE7, REGATE8, REGATE9, REGATE11) has a verdict; every recorded risk has a current status. The load rule after REGATE11 is sound and errs towards FAIL; the logo sweep's load sensitivity is accepted as backlog.
- **Areas (scope 2).** `git diff be2afa2..a5cbc91`: no client file; FIX17's two e2e files only add `bringToFront` and give the crossing test's second window its own context (equivalent; nothing loosened). RECHECK-A2's area-A PASS holds; RECHECK-B3's area-B PASS is confirmed.
- **Probes (scope 3).** Restore with a correction (run 2; run 1 had two probe defects, kept): sign-off, send, accepted copy, correction, reasoned second send, backup with the send waiting, two isolated restores, resume, release and delivery once; the owner's own resend on a restored copy keeps the held send held for good; the owner sees a held send as "Email needs attention" (R-UX5I-1). The Day editor guard across the midnight (FIX10 clock, 06:58:00Z): the guard holds on the desktop (1280px) and the phone; the unsaved note survives the midnight and the focus refresh (the Today tag moves, nothing asks), Escape and the Today press after the midnight ask first, and the running session stays on 10/26; the desktop run stopped (exit 1) at the page's Check out, which the floating drawer covers (UX4-A risk 1); the phone run (exit 0) saved the note and ended the session under 10/26. Cross-tab theme with the editor and the account menu open (1280, 1440, phone): followed both ways, the note kept, no question; Escape closes the menu first, the next Escape asks. Shared views, view and edit (desktop 320-1440px and the phone): no review link, no clock, the edit toolbar only with edit rights, the Partial leave dialog writes through `/api/shared/:ownerId` only, a press outside asks with an unsaved leave, axe-core 4.14.0 0 violations in every settled scan (run 1 read axe mid-transition and pressed a covered title; runs 2 and 6 corrected).
- **Test design (scope 4).** Enough for this release. The crossing test's focus half cannot fail at the gate's midnight instant (the displayed period holds neither date): a mutant that removes the page's focus and visibility refresh passes `today.spec.ts:627` at 2026-10-27T06:58:30Z on both projects and fails it at 2026-11-04T07:58:50Z, where the displayed period holds both dates (the unmutated control passes there); the real-clock refresh-trigger tests `:764` and `:769` kill it on both projects, so the refresh is pinned there, not by the gate's crossing run (R-UX5I-2). The FIX10 sweeps still test what they were designed for; the wrapper's "the client never reads the browser clock" comment is outdated (R-UX5I-4).
- **AC-13 (scope 5).** America/Los_Angeles, Asia/Tokyo, America/New_York: 1/1 each, exit 0.
- **Docs (scope 6).** docs 02, 03, 04, 05, 10, 11, 12: EN/VI structure identical; the points of this audit match the build; docs/04:114 does not state the cross-tab theme rule (R-UX5I-4).
- **Mandatory checks (scope 7).** typecheck 0, lint 0 (no deprecation), build 0 (no advisory), npm test 101 files / 2,397 tests 0; real-clock FULL desktop 469/35/0 and mobile 407/97/0, exit 0; the seven-file run at 2026-10-27T06:58:30Z through the FIX10 wrapper 384 passed / 84 skipped / 0 failed (desktop 219/15, mobile 165/69), the desktop crossing test 59.5 s. Entry census 1.73 busy cores; no rerun.
- **Optional backlog for the WP5 handoff (separate; none blocks re-acceptance):** test strength (R-A3-1..3, MA5, R-UX5I-2, R-UX5B4-1/-2, R-UX5B-5, G6); docs and comments (R-UX5B4-3..5, R-UX5I-1, R-UX5I-4); product hardening (R1, R2, DIAG5's 8 px frame, R-UX5B2-1/-2, R-UX5B-6, R6, R7, R-UX4B-1/-4/-8, UX4-A 1/3/4/9); pilot device checks (R-A2-1/-2, UX4-A 8, classic scrollbars elsewhere, the owner's look at the PDF samples); process (the logo sweep's load sensitivity, R-UX5I-3, R-UX5B-2, R-UX5B-4, R-UX4B-6); coordinator decisions to show the owner (R3 b dropped, the "Sign correction" wrap below ~1150px, option A's wait up to ~81 min, the restored cross-tab theme rule). Detail in the review's "Optional backlog for the WP5 handoff".
- **Next action:** one bounded client fix for F-UX5I-1 (`addresses_audit` WP5-UX5-AUDIT-INT), its freeze, a regate for a client change (FULL e2e, the sweeps, axe on the drawer; drill and npm audit carry forward if `dist/server` and the package files are unchanged), and a fresh recheck of F-UX5I-1 and the integration on the new digest.
- **Slips:** `99-slips.txt` (7 items: one read-only redirect outside the task folder, removed at once; four read-only pipes into head or tail; one no-op `node -e 0` piped into head; output reads with cat and grep besides the Read tool; none wrote to the repository).

Status: done
