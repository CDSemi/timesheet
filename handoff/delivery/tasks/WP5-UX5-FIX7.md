# WP5-UX5-FIX7 dispatch brief (fix the WP5-UX5-AUDIT-B findings)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX7, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-PLAN-FIX7 (done), and addresses WP5-UX5-AUDIT-B (FIX
  REQUIRED on f4049aa / 26b163a6).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H, novelty no. Two of the changes are risky: a send concurrency
    guard, and a change to the PDF renderer. docs/08 row "Implement or fix time,
    ownership, ledger, sign-off, concurrency or recovery".
  - The plan is proven, so reproduce first, then apply it.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-PLAN-FIX7.md` (Results, sections 1-5)
  and its evidence in `handoff/delivery/evidence/WP5-UX5-PLAN-FIX7/`. The exact code and
  test change is `200-proposed-change.diff.txt`, a standard unified diff with `a/` and `b/`
  labels. Also read `handoff/delivery/WP5_UX5_REVIEW_B.md`.
- **Coordinator decisions.**
  - **F-UX5B-3, the code route.** On a day with both a holiday label and leave, the
    holiday label gets one line and is cut first; "Leave h:mm" gets its own 7 pt line. This
    restores docs/04:122, AC-10 and docs/12:86. Add the docs/12:86 sentence from the plan,
    EN and VI.
  - **R-UX5B-1, option A.** A send job still waiting for any revision of the period blocks
    a new send with 409 `delivery_in_progress`.
    - This enforces docs/05:72 as written.
    - Align docs/03:60 and docs/05:72, EN and VI.
    - Change the two client message strings from "this revision" to "this period"
      (`deliveryModel.ts:376`, `:584`).
  - **R-UX5B-3, folded in.** Add `connection: 'close'` at the four `container-drill.mjs`
    sites the plan names.
  - **F-UX5B-1, F-UX5B-2, F-UX5B-4 and F-UX5B-5:** exactly as the plan's section 3
    specifies.
- **Boundaries with the area-A fix round.** A later task, WP5-UX5-FIX8, fixes area A.
  - **In `docs/04_UX_AND_SETTINGS`,** change only line 124 (VI 125).
  - **In `docs/12_RELEASE_NOTES`,** change only lines 54 and 86, EN and VI. Line 116
    belongs to FIX8.
  - **Do not touch** `src/client/` files other than `deliveryModel.ts`, `styles.css`, or
    any e2e file except where step 4 says.
- **Owned paths:**
  - `src/server/pdf/timesheetPdf.ts`;
  - `src/server/services/deliveries.ts`;
  - `src/client/components/deliveryModel.ts`;
  - `tests/integration/pdf-render.test.ts`, `tests/integration/sends.test.ts`;
  - `scripts/container-drill.mjs`;
  - `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md` (line 60 only);
  - `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (line 124 / 125 only);
  - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md` and `.vi.md`;
  - `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`;
  - `docs/12_RELEASE_NOTES.md` and `.vi.md` (lines 54 and 86 only);
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX7/`.

  If an e2e spec asserts one of the changed message strings, that spec is also yours for
  that one string. Record it.
- **Base.** HEAD = origin/main = f4049aa7905e22f1467dfcae4208675cb2fc8e80, or a later commit
  that changes only `handoff/`. Outside `handoff/` the working tree must be clean at the
  start.
- **Running beside you:** WP5-UX5-PLAN-FIX7A, a read-only planner for area A, on ports
  50340-50359.
  - You are the only source writer.
  - Run your heavy commands one at a time, and stay in your own ports and folders.

## Steps

1. **Start state.** Record HEAD, `git status --short` and `git diff --stat` outside
   `handoff/`. Expect nothing.
2. **Reproduce first,** in a scratch export of HEAD with the plan's probes and new tests:
   - the PDF leave-on-holiday failures (the ported auditor probes);
   - the cross-revision send accepted while an older send waits;
   - the two weak tests, which pass under the mutants M12b and M11.

   Record each failure before you change anything.
3. **Apply the change** in the repository working tree.
   - Run `git apply --check` on the diff first. If it does not apply cleanly, apply the
     same change by hand and record why.
   - Then make the document edits in EN and VI. Keep the structure, and keep quoted UI
     strings in English in the VI files.
4. **Prove it:**
   - The new tests fail on HEAD and pass with the change: the PDF tests, the option-A send
     test, and the two F-UX5B-5 tests.
   - Mutants M12b and M11 each fail their new test. Run them in a scratch copy only, and
     restore it afterwards.
   - **The PDF:**
     - the plan's differential probe: PDFs that do not have both labels are
       byte-identical to HEAD;
     - the determinism and one-page tests pass.
   - **The message strings.** Search `tests/e2e/` for the two strings you changed. Run
     every e2e spec that renders or asserts them (at least `review.spec.ts` and
     `submission.spec.ts`), on both projects with the real clock.
   - **In the repository,** one after another: `npm run lint`, `npm run typecheck`,
     `npm test` (expect 101 files, 2,384 tests), and `npm run verify` (smoke port in your
     range). Then `git diff --check`.
   - **The container drill with `--wp3`** (its own Compose project name with `fix7`,
     cleaned up with `down -v`), if Docker is available. Otherwise record "not run"; the
     regate runs it.
   - **EN/VI parity** of every changed document pair: the same headings and the same list
     structure.
5. **Digest last.** Make a clean export of the working tree, compute the digest with the
   repository's digest script, and record the digest and the file count.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX7`. Ports 50360-50399. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS.**
  - Use the Write or Edit tool for every file you create or change, except `git apply`.
    The only shell copies allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit
    notice.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Do not run `npm ci` or `npm install` in the repository; `node_modules` is in sync with
  the lockfile.
- Store any probe script under `handoff/delivery/evidence/` as `*.ts.txt` or `*.mjs.txt`.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only. Do not stage, commit or push.
- Name no evidence file with "signature" in its basename unless it also contains
  "synthetic". Write evidence as masked LF `.txt`. Write no email address except
  `@example.invalid`.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return,** including no Compose
  project.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the before and after results;
- the mutant results;
- the e2e counts;
- the repository checks;
- the drill;
- the digest.

## Results

Self-reported model: claude-sonnet-5-5. Attempt 1. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX7/` (masked LF `.txt`; scripts
and probes as `*.sh.txt`, `*.mjs.txt`). Nothing staged, committed or pushed; no git configuration changed (per-process env
overrides only); nothing left running; Compose project `ts-fix7-drill` removed with `down -v` (`30-docker-after.txt` is empty).

**1. Start state.** HEAD = f4049aa7905e22f1467dfcae4208675cb2fc8e80. `git status --short` and `git diff --stat` outside `handoff/`:
empty (`start-status.txt`, `start-diffstat.txt`, 0 bytes). Scratch export of HEAD plus `npm ci` in the task folder
(`setup.sh.txt`, `npm-ci.txt`).

**2. Reproduced first, on HEAD in the scratch export.**
- PDF leave on a holiday day: ported auditor probes (`103-auditor-probes-port.ts.txt` of the plan folder), 13 FAIL
  (`103-head.txt`).
- The new tests on HEAD code (test hunks only): 7 failed, 99 passed (`110-newtests-on-head.txt`, `110-summary.txt`). The 7 are the
  six holiday-name PDF tests and the cross-revision send test ("blocks the correction's send until the older revision's job has
  run"), which shows the accepted send while an older send waits. The other new tests (working-day leave, long-label wrap guard,
  the two F-UX5B-5 tests) pass on HEAD by design; they guard behaviour, and are killed by the mutants below.
- The two weak tests pass under the mutants on HEAD code and the OLD `sends.test.ts`: M11 and M12b both SURVIVED, 16 passed
  (`mut-head-oldtests.txt`).

**3. Applied.** `git apply --check` of `200-proposed-change.diff.txt` passed on the repository (exit 0); applied cleanly
(`change-applied.diff.txt`; LF kept, `git ls-files --eol` shows w/lf). In the scratch export the first `git apply` rewrote the
touched files as CRLF (core.autocrlf=true outside a repository), which broke the mutant anchors; the files were restored from
HEAD and re-applied with a per-process `core.autocrlf=false` (`reapply.sh.txt`), and every scratch result below is from the LF
export. Documents (EN and VI): docs/05 lines 11 (last sentence deleted), 19 and 38 (citation F-2 a of 2026-10-21 and H-1 a of
2026-10-22) and 72 (a waiting send job of any revision of the period blocks another, with the reason); docs/03 line 60; docs/04
line 124 / VI 125 (only the two F-UX5B-2 edits); docs/12 line 54 (F-UX5B-2) and line 86 (the F-UX5B-3 sentence); docs/10 new
section "Owner decisions — 2026-10-22 (WP5-UX5, what "submitted" means after a correction, H-1 a)" at the end of both files (the
board quotation left in English). The F-UX5B-3 sentence is in docs/12:86 only; docs/12 line 116 and the rest of docs/04 and
docs/12 are untouched.

**4. Proof.**
- New tests on the change: pdf-render + pdf-layout + sends, 3 files, 106 passed (`120-newtests-patched.txt`); on HEAD 7 failed.
- Mutants, scratch copy only, restored byte-identical each time (`mut-patched-newtests.txt`, `mut-head-oldtests.txt`):
  M12b KILLED by "the Settings time switch reaches the send draft, not the PDF job and file of the sign-off"; M11 KILLED by
  "an accepted copy counts: another send needs a reason, stored on the send and in the audit, never in the email"; M14 (a waiting
  job no longer blocks) KILLED by three tests, among them the new R-UX5B-1 test. Under the OLD tests M11 and M12b survive.
- PDF: the differential probe (`101-leave-holiday-diff.ts.txt` of the plan folder) over 1,920 old/new pairs: 624 pairs without
  both labels byte-identical, 1,296 with both print "Leave h:mm" whole as one 7 pt item, one page, inside the margins; failures 0
  (`101-diff.txt`). The auditor probes port: 0 FAIL on the change (`103-patched.txt`). The determinism and one-page tests are in
  the 106 passed.
- E2E strings: `tests/e2e/` asserts only "in progress" and "Nothing was sent again" (`submission.spec.ts:207-208`); both are in
  strings that keep them, so no spec changed. The two client strings are not asserted anywhere in `tests/`. Ran `review.spec.ts`,
  `submission.spec.ts` and `pdf-visual.spec.ts` against the built server, both projects, real clock (the container's clock; no
  fake time): 38 passed, 4 skipped, 0 failed (`e2e-targeted.txt`). The 4 skips are the project-conditional skips of those specs
  (the mobile-only tests under desktop and the reverse).
- Repository, one after another, Node 24.21.0: `npm run lint` exit 0; `npm run typecheck` exit 0; `npm test` 101 files, 2,384
  tests passed; `npm run verify` exit 0 (typecheck, lint, test 101 files / 2,384, build, smoke on port 50370: 45 PASS);
  `git diff --check` exit 0 (`repo-*.txt`, `end-diffcheck.txt`).
- Container drill `--wp3` from a clean export of the working tree, project `ts-fix7-drill`: stages 1-6 passed, 33 + 32 + 57 +
  35 + 27 + 23 = 209 PASS, 0 FAIL, exit 0 (`30-drill.txt`, `30-exits.txt`); `compose down -v` exit 0, no container left.
  The four `connection: 'close'` edits ran inside it.
- EN/VI parity of docs/03, 04, 05, 10 and 12: the same heading sequence (6, 10, 7, 34, 11 headings) and the same list-item
  count in every pair (`parity.txt`). The line-by-line shape of four pairs differs, exactly as at HEAD (`parity-head.txt`;
  blank lines in the VI files), so the change adds no difference.

**5. Digest (last).** Clean export of the working tree (tracked plus untracked non-ignored files, `handoff/` excluded) and the
repository's `scripts/source-digest.mjs` agree: `bca04c4f96c585bf85f7b90d08c9dc2798b93be4d84af7ee04beed258f91cde5`, 882 files
(`digest-repo-post.txt`, `digest-export-post.txt`). Changed files outside `handoff/`: 16 (`end-diffstat.txt`).

**Notes and slips.**
- The Edit tool left a stray `docs/05_SUBMISSION_AND_NOTIFICATIONS.md.tmp.76776.33ac59543b8b` (a Dropbox rename artefact); I
  removed that one file and `git status` shows none.
- A mutant script change: the AUDIT-B harness `99p-mutants-v2.mjs.txt` is copied as `mutants.mjs.txt` with a `--tests=` option
  and a log name per run; its mutant definitions are unchanged.
- Runtime-rule slips of mine, all read-only: a few listing commands ended with `| head` or `| cat` (no file written by them);
  one `tail` piped into `cat`. No heredoc, no stdin to node or python, no `/dev/null`, no `rm -r`, no PID kill.
- The 4 remaining `src/client/components/deliveryModel.ts:251` and `tests/client/deliveryModel.test.ts:299,301` strings "A delivery
  of this revision is in progress." (the Resend button reason) are a different message and outside the brief; left unchanged.

Status: done
