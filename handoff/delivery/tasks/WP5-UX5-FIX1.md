# WP5-UX5-FIX1 dispatch brief (the round-5 gate findings)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX1, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-GATE (done, FAIL).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk M, novelty no. The findings name the files, the causes and the
    tests, so there is no plan step (docs/08 "Accepted finding naming file/fix/tests"). You
    reproduce each finding first.
  - Profile: worker-high, because:
    - finding 1 is the upgrade/recovery drill against the previous build;
    - finding 2 is date and DST arithmetic in tests (docs/08 "time ... recovery with
      substantial edge cases").
  - Write the task record in English.
- **Read:**
  - the gate record `handoff/delivery/tasks/WP5-UX5-GATE.md`, Results: "Why FAIL" and items
    1, 5 and 6;
  - its evidence `handoff/delivery/evidence/WP5-UX5-GATE/`: `07-drill.txt`,
    `07-drill-cause.txt`, `17-sweep-counts.txt`, `obs-a11y-scan.txt`, `obs-hist-base.txt`,
    `obs-hist-target.txt`, and the `log-sweep-*.txt` of the failing instants;
  - the slice records that wrote the tests: `WP5-UX5-T04.md`, `T05A.md` and `T05B.md`;
  - the simulated-clock preload and wrapper in `handoff/delivery/evidence/WP5-UX-FIX10/`
    (`shiftclock.mjs.txt`, `run-shift.sh.txt`, `env.sh.txt`). Copy them into your task
    folder as `.mjs` / `.sh`; never add them to the repository.
- **AGENTS.md on disk wins.** Rules 7 and 11, and the "Frontend and UI/UX standards"
  section.
- **Base.** HEAD = origin/main = e2bf1aab4ef65d496de6672c7986e27db04ddb39, or a later commit
  that changes only `handoff/`. The digest is
  318b3370450db99a96194249d4d9d7ae985a10a133f10994ba4acf219453635c (868 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Findings to fix

1. **The drill `--wp3` fails in stages 4 and 5 (203 PASS / 6 FAIL).**
   - **Cause** (gate `07-drill-cause.txt`): the shared `signOffPeriod` in
     `scripts/container-drill.mjs` posts a sign-off without `signer_name`. Stages 4 and 5 run
     the previous WP3 build (49651c8), whose schema still requires `signer_name`, so both
     sign-offs answer 422. Nothing is signed, and the data-bearing upgrade is never
     exercised.
   - **Fix:** the drill sends `signer_name` to the previous build, and keeps today's body
     for the current build. Branch on the build each call targets, not on a guess. Read how
     the current server treats an unknown `signer_name` key before you choose.
   - **Proof:** a full `npm run drill:container -- --wp3 <previous build>` with every stage
     passing and 0 FAIL. Stage 4's "previous build: two synthetic periods signed off" and
     the pre-upgrade facts must show the revisions and queued send jobs, so the upgrade runs
     on a database that holds data. Record every stage's counts.
   - `docker version` comes first. Use Compose project `ts-wp5-ux5fix1` with non-TTY flags.
     At the end, remove the drill image by exact tag and the project by name, and record
     `docker ps --all --filter name=ts-wp5-ux5fix1`, which must be empty.
2. **Four date- or DST-dependent test defects** (simulated-clock sweep). Reproduce each one
   with the preload at a failing instant from the gate table before you change it.
   - **(a) `tests/e2e/day-editor.spec.ts:6357`** (T05B, 1280px): the test presses the page
     title, but the floating drawer docks opposite the newest free workday and covers the
     title when that day is a Thursday or Friday. Make the outside-press target independent
     of the dock side: press a page point that the drawer does not cover, and assert that
     first. Keep the behaviour under test (an outside press closes the editor, and focus
     returns). Do not drop the title case where it is uncovered.
   - **(b) `tests/e2e/today.spec.ts:990`** (round 4, window days only): "away 768px: Next
     stays left of Today" is stale. Under T04's rule, with "Current period" shown, a card
     narrower than 738px uses the narrow arrangement (at a 768px window the card is 736px).
     Assert the arrangement the T04 rule gives at that width, with Next on the right edge
     in the narrow arrangement, and test both sides of the threshold.
   - **(c) `tests/e2e/today.spec.ts:455`** (mobile, window days only): at 390px it expects
     the short "Sign off", but the page shows the full "Review & sign off" since T04
     widened the card by 16px. Assert the label from the measured fit, the T04 rule, and
     keep the accessible name. Test the width where the short label must appear.
   - **(d) `tests/e2e/timesheet.spec.ts:2040`** (T05A, both projects): it expects "+1" for a
     seeded 09:00-18:00 Los Angeles day read in Asia/Ho_Chi_Minh. That is true only in PDT
     (UTC-7, +14 h); in PST (+15 h) the day reads "00:00-09:00" with no "+1". Either:
     - compute the expected text from the day's real offsets (Intl, not a constant); or
     - seed a session that crosses midnight in the display zone in both PDT and PST.

     Keep the test's purpose: the late-end form, and the wrap fallback.
   - **Do not weaken any assertion.** List each change with file:line and its reason.
3. **History scroll regions are not keyboard-reachable** (axe `scrollable-region-focusable`,
   serious, WCAG 2.1.1). Three `.table-wrap` nodes on History overflow sideways with no tab
   stop. The same result is on BASE_SHA, so it is pre-existing, but the owner's bar is WCAG
   2.2 AA.
   - **Fix:** every scrollable `.table-wrap` that can overflow becomes a named, focusable
     region (`tabindex="0"`, `role="region"`, an `aria-label` that names its content). Use
     the shared focus ring, and no new colour.
   - Inventory every `.table-wrap` use first: History, Administration, Import, and any
     other. Fix them in one place if the markup allows.
   - **Proof:** an axe scan of History, in light and dark, with 0 violations. Add a test
     that each overflowing `.table-wrap` on History is focusable and named.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. Reproduce finding 1 (drill cause), the four tests at their failing instants, and the axe
   result. Record each reproduction.
3. Fix. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. The
   build must show no chunk advisory.
4. Run the four fixed tests with the preload at **all six instants** of the gate table
   (`2026-10-26T16:00:00Z`, `2026-11-01T08:45:00Z`, `2027-03-14T10:30:00Z`,
   `2026-10-27T06:58:30Z`, `2026-12-31T23:30:00-08:00`, `2027-01-01T08:30:00Z`) and on the
   real clock, on both projects. Every run must end with 0 failed.
5. **Mutants:**
   - put back each of the four old assertions, and show it fails at its failing instant;
   - remove the region semantics, and show your History test fails.
6. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, and the rerun is the full
   run. Both runs are recorded.
7. The drill (finding 1 proof), last before verify.
8. `validate_package.py --preflight` with the workflow Python; `git diff --check`.
9. `npm run verify` with `SMOKE_PORT` in 49920-49939, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
10. `npm run digest` LAST.

**Rules:** no `skip`, `fixme` or `.only`; no npm dependency change; no probe files in
`tests/e2e/`.

## Owned paths

- `scripts/container-drill.mjs` (the sign-off body only).
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`,
  `tests/e2e/timesheet.spec.ts`, and a History e2e spec (an existing one, or a new
  `tests/e2e/history-a11y.spec.ts`).
- `src/client/`: the component or components that render `.table-wrap`, and
  `styles.css` (focus ring on the region only).
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: only if a line about tables or keyboard access
  becomes false.
- this brief's Results section.
- `handoff/delivery/evidence/WP5-UX5-FIX1/`.
- Nothing under `src/server/`. A needed server change is a stop.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX1`. Ports 49920-49939.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Load the axe engine from a temporary location in your task folder. You may copy it from
  the gate's task folder `D:\.claude-tmp\timesheet\WP5-UX5-GATE`. Add nothing to
  `package.json` or the lockfile.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not stage, unstage or commit
  anything.
- Mail goes only to local capture. `PRODUCTION_SENDING_ENABLED` is never set.
- Before returning, make sure none of your background commands is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Worker: Self-reported model claude-sonnet-5-5. Evidence folder `handoff/delivery/evidence/WP5-UX5-FIX1/` (copies of the task-folder outputs under
`D:\.claude-tmp\timesheet\WP5-UX5-FIX1\out`, the scripts as `.txt`). Files in the numbering below are in that folder. Nothing staged or committed.

- Base: HEAD e2bf1aab4ef65d496de6672c7986e27db04ddb39; digest before 318b3370450db99a96194249d4d9d7ae985a10a133f10994ba4acf219453635c
  (`D:\.claude-tmp\timesheet\WP5-UX5-FIX1\00-base.txt`, `01-digest-before.txt`). Node v24.21.0.
- Finding 1: reproduced (`out/10-repro-f1.txt`: previous build rejects the body without `signer_name`; the current build accepts it with or without).
  Fixed in `scripts/container-drill.mjs`; the full drill is run last (below).
- Finding 2 (a to d): reproduced at the failing instants (`out/30-repro-a.txt`, `33-repro-b.txt`, `34-repro-c.txt`, `35-repro-d-0101.txt`), fixed, and green at all
  six gate instants and on the real clock on both projects (`out/70-sweep-summary.txt`: 11 passed, 7 skipped by design, 0 failed at each of the seven).
- Finding 3: reproduced (axe on the old build, History: `scrollable-region-focusable` x3; `out/53-axe-old.txt`); fixed; axe on the new build 0 violations in light and
  dark on both projects (`out/54-axe-new.txt`).
- Mutants: all five old assertions / the removed region semantics fail as expected (`out/86-mutants-summary.txt`).

### Changes (file:line, reason)

1. `scripts/container-drill.mjs:611-625` (sign-off body only) and `:1145-1146`. `signOffPeriod(cookie, payrollDate, { toPreviousBuild })` adds
   `signer_name: 'Synthetic Employee Two'` only when the call targets the previous build. The two calls in stage 4 (the only calls that hit the
   previous WP3 build; stage 5 reuses its data) pass `toPreviousBuild: true`; the stage 3 calls keep today's body. The current server accepts and
   ignores the key (`src/server/http/schemas.ts:350`, `z.unknown().optional()`), so branching on the target build (not always sending it) keeps the
   current-build body exactly what the product posts. Reproduction `10-repro-f1.txt`.
2. Finding 2:
   - (a) `tests/e2e/day-editor.spec.ts:6353-6420` new helpers `pressOutsideDrawer`, `acrossMiddle`, `acrossPlain`, `pressTitle`, `pressPeriodCardText`;
     `:6439-6442` the four presses use them; `:6483` the "Discard" test's title press uses `pressTitle`. Cause (reproduced at 2026-10-26T16:00Z,
     `30-repro-a.txt`): the drawer docks away from the edited column and then covers the whole short heading (x 56-169 under a drawer 0-400) and the
     period card text too (only the title was seen first). Each target is now pressed at the first candidate point whose horizontal range the drawer
     does not cover (asserted before the press); when the drawer covers the whole heading or the card text, the same kind of press goes to plain
     space of the title row (`header.page-head`) or of the card (no link, button or field under the point, checked with `elementFromPoint`). The
     title and the card text are still pressed where they are uncovered. The behaviour asserted afterwards (the drawer closes, nothing asks, focus
     returns to the day button) is unchanged.
   - (b) `tests/e2e/today.spec.ts:1006-1053` (was `:990-1017`). The stale "Next stays left of Today" now follows T04's rule: the wide row needs 600px
     of card, 738px while Current period shows; the expectation is computed from the measured card width (`wideNeeds`), at 768, 769, 770, 900, 1024,
     1280. Narrow: Next in row 1 on the right edge (as far from it as "<" from the left), Today in the row below, Next right of Today. Wide: Next left
     of Today, both in row 1. In the window the list holds both sides (768, 769 narrow; 770+ wide; asserted), outside it every width is wide.
   - (c) `tests/e2e/today.spec.ts:455-515`. The short label is expected from the measured row (`.period-cta` width in rem of the 15px root): long labels
     short from 15.4rem up to 22.8rem, "Review now" 15.1rem to 20.2rem, only with Current period; widths 382 and 381 (342px, the threshold) added;
     the loop asserts that both a short and a full width were checked (381 and 382). Accessible-name assertions are unchanged.
   - (d) `tests/e2e/timesheet.spec.ts:2036-2063`. The seeded day is 08:30-17:30 Los Angeles time (`createSession`), which crosses the Ho Chi Minh midnight
     in both seasons (22:30-07:30 or 23:30-08:30, "+1"); the assertion is `^(22|23):30( - |-)(07|08):30\+1$`, stricter than the old `\+1$`. The
     purpose (late-end form, wrap fallback, no overflow) is unchanged. Reproduced at 2027-01-01T08:30Z: "01/0100:00-09:00" (`35-repro-d-0101.txt`).
3. Finding 3 (inventory: seven `.table-wrap` uses in History, OT, shared OT, Import preview x2, Operations status, Settings transfer dialog; one place):
   - `src/client/components/TableWrap.tsx` (new): a box that measures its overflow (layout effect and ResizeObserver on the box and the table) and, only
     while it scrolls sideways, is `role="region"`, `tabIndex=0`, `aria-label` = what the table lists; a table that fits adds no tab stop or landmark.
   - the seven uses now render `<TableWrap label=...>`: `HistoryScreen.tsx:31`, `OtScreen.tsx:112`, `components/ImportPreview.tsx:76,159`,
     `components/OperationsStatus.tsx:332`, `components/SharingOt.tsx:98`, `components/SettingsTransferDialog.tsx:94`.
   - `src/client/styles.css:1611-1614` (rule at 1612): `.table-wrap:focus-visible { box-shadow: var(--focus-ring-inset) }` (the shared inset ring, as `.day-panel`; no new
     value). Document 04 and its translation: no line became false (no change).
   - `tests/e2e/history-a11y.spec.ts` (new, both projects): on History each overflowing `.table-wrap` is a region with `tabindex=0` and a name
     "Changes for ...", a box that fits has none; the regions are found by role and name; the keyboard reaches one, the shared inset accent ring shows in light
     and dark, and ArrowRight scrolls it. It fails on the old build (`40-repro-f3-test.txt`).

### Checks (actual results; order of the brief)

- Node v24.21.0. HEAD e2bf1aab4ef65d496de6672c7986e27db04ddb39; digest before 318b3370... (868 files) = the brief's value.
- `npm run typecheck` exit 0, `npm run lint` exit 0, `npm test` exit 0 (100 files, 2345 tests), `npm run build` exit 0, no chunk advisory
  (`60-` to `63-`). `NODE_OPTIONS=--trace-deprecation --pending-deprecation`: no deprecation line in any of them.
- Sweep (`70-sweep-summary.txt`, `sw-*.txt`): the four fixed tests and the History test, both projects, at 2026-10-26T16:00:00Z, 2026-11-01T08:45:00Z,
  2027-03-14T10:30:00Z, 2026-10-27T06:58:30Z, 2026-12-31T23:30:00-08:00, 2027-01-01T08:30:00Z and on the real clock: each run 11 passed, 7 skipped by design
  (project-only tests), 0 failed, exit 0.
- Mutants (`81-` to `86-`): old (a) title press fails at 2026-10-26T16:00Z (click intercepted by `#day-editor-title`, 30 s timeout); old (b) "Next stays left of
  Today" fails at 768px (Expected < 28, received 700); old (c) 390px short label fails ("the row is 23.33rem", expected "Sign off", received "Review & sign off");
  old (d) `seedCompleteDay` with `/\+1$/` fails at 2027-01-01T08:30Z on both projects ("01/0100:00-09:00"); the region semantics removed fails
  `history-a11y.spec.ts` on both projects. All restored byte-identical (`cmp`), rebuilt (`87-`).
- Axe 4.14.0, WCAG 2.2 AA tags, History, scratch copies of the old and new build (probe `zz-hist.spec.ts.txt`, scratch only): old desktop light and dark
  `scrollable-region-focusable` x3 (`53-axe-old.txt`); new: 0 violations on desktop and mobile, light and dark (`54-axe-new.txt`; 3 desktop / 20 mobile
  `color-contrast` items are in axe's "incomplete" list, as before: the old build has the same 3 on desktop).
- FULL e2e, real clock (Los Angeles Thu 2026-10-22, outside the window), alone, after the last source change: desktop 458 passed, 35 skipped, 0 failed (12.1 min,
  exit 0, `90-full-desktop.txt`); mobile 403 passed, 90 skipped, 0 failed (5.7 min, exit 0, `90-full-mobile.txt`). No rerun.
- Drill (`96-drill.txt`, `97-drill-counts.txt`): `npm run drill:container -- --work <task>\drill --project ts-wp5-ux5fix1 --wp3 <task>\wp3` (previous build 49651c8, `npm ci`
  and `build:server` exit 0) exit 0: stage 1 33/0, 2 32/0, 3 57/0, **4 35/0**, **5 27/0**, 6 23/0, total **209 PASS, 0 FAIL**, `DRILL STAGES 1-6 PASSED`. Stage 4: "previous
  build: two synthetic periods signed off" status 201/201; pre-upgrade facts 1 ledger entry, 2 revisions, schema 6, 2 queued send jobs, 2 files; paired backup schema 6
  with 2 queued send_email, 2 revisions; the upgraded runner rendered both PDFs and sent both; 26 tables unchanged; 600 ledger minutes equal. Stage 5: restored counts
  users 3, revisions 2, ledger entries 1 (600 minutes), signoffs 2, attachments 2, work sessions 6; the held send jobs untouched. The 8 lines with "deprecat" are all PASS lines
  ("no deprecation warning"). Image sha256:5cfa9f9afdbb4e2d23a2b3b8f1795c84f801c301fcb6361ccb3e910d0d61dc33, 110154229 bytes, linux/amd64. Cleanup: `docker compose -p
  ts-wp5-ux5fix1 down -v` exit 0, `docker rmi ts-wp5-ux5fix1-timesheet:drill` exit 0, `docker ps --all --filter name=ts-wp5-ux5fix1` empty, no volume or network,
  no image of that name (`100-` to `102-`).
- `validate_package.py --preflight` PASS (`111-preflight.txt`); `git diff --check` exit 0 (`110-diffcheck.txt`); `npm run verify` exit 0 (100 files, 2345 tests, build, SMOKE PASSED,
  `SMOKE_PORT=49921`, data under the task folder; `120-verify.txt`).
- Digest after (handoff/ excluded, 870 files: 868 + `TableWrap.tsx` + `history-a11y.spec.ts`): 709750910cb88422b1de35c38c85eac15c3eca63ee75e1ff26e11b75d6475bbf
  (`130-digest-after-1.txt`; the final digest is run after this record and must equal it).
- Remaining notes. I ran one `ls ... | head -0` pipe early by mistake (harmless listing, no effect). The History tab stop appears only while a table overflows; a short table adds none.
  The full e2e ran on a non-window day, so (b) and (c) are exercised in the full run only on their non-window branch; their window branches ran in the sweep at
  2026-10-26T16:00Z and 2026-10-27T06:58:30Z (both window instants) on the mutant-proven assertions.

Status: done
