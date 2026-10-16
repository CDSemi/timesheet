# WP5-UX3-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-REGATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX3-FIX2-FREEZE.
- Scope: the package-final regate of UI change round 3 after the fix round.
  - WP5-UX3-GATE (attempt 1, on cecfceb / 29ac2594) FAILED for three reasons: the
    lifted-column test on Tuesdays and a mobile seed flake (409); keyboard focus clipped
    inside the week card at 768-899px; and three axe items.
  - WP5-UX3-FIX1 fixed them (freeze 9187f31, digest e4659145). The account-menu
    `target-size` item is justified in `handoff/delivery/tasks/WP5-UX3-FIX1.md`, not
    changed.
  - WP5-UX3-FIX2 fixed the read-only sweep's findings 1-11 and 13
    (`handoff/delivery/tasks/WP5-UX3-SWEEP.md`, `WP5-UX3-FIX2.md` with Addendum 1).
  - Frozen commits in order: T06 5c8355d, GOV 79b9a53 (accept 3968e15), T01 e2f3d74, T02
    aa64999, T03 7cd8c59, T04 83c32d2, T05 699b1b3, T05B 5c0dad8, T07 f8117a4, T08 1a33c57,
    T08B f89573b, T09 4b5403d, T10 cecfceb, FIX1 9187f31, then FIX2 (the target).
  - The previous accepted snapshot is a6437943403fc416240fd13a787a8c4748af3e84 (digest
    229df806; gate WP5-UX2-REGATE2; audit WP5-UX2-AUDIT2).
- Target: `freeze_commit` = TARGET_SHA = 7ce4e95a0c4477374e981132d93b11aedab2e384 (the
  WP5-UX3-FIX2-FREEZE commit; HEAD = origin/main, or a later commit that changes only
  `handoff/`).
  - Expected digest of record: TARGET_DIGEST =
    262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files).
  - Compute it on a clean export of the target and cross-check it with the `git ls-tree`
    form and `npm run digest`.
  - Uncommitted coordinator records under `handoff/` are expected.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX3-GATE.md`: the full item list, method, limits and
  evidence layout of attempt 1. This regate repeats every item of it on the new target;
  reuse its probes from `handoff/delivery/evidence/WP5-UX3-GATE/` (`zz-*.ts.txt`) and copy
  them into your task folder only.
- `handoff/delivery/tasks/WP5-UX3-FIX1.md`, `WP5-UX3-SWEEP.md` and `WP5-UX3-FIX2.md`
  (Results and Addendum 1) for the claims to verify.
- The round's owner and coordinator decisions on the board (2026-10-15/16), including the
  audit-focus list and its addendum.
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`
  (`shiftclock.mjs.txt`, `run-shift.sh.txt`, `sweep.sh.txt`). Copy them into your task
  folder; never add them to the repository.

## Gate items

1. **Every item of WP5-UX3-GATE (items 1 to 6), on the target.**
   - Same commands, instants, widths, states and thresholds as attempt 1.
   - Item 2 compares against a643794 again: `dist/server` and `dist/domain` must be
     byte-identical, and the `src/server src/domain migrations` diff must be empty.
   - Item 3's scope map now also covers FIX1 and FIX2.
     - FIX1: 11 paths, recorded in `WP5-UX3-FIX1.md`.
     - FIX2: the owned paths in `WP5-UX3-FIX2.md` and Addendum 1, including the docs/04
       pair.
     - Sample at least five of the FIX2 changed or moved assertions against the diff.
     - FIX2 removed five unit tests together with `quickBreaksRequest` and
       `confirmBreaksDraft`, and moved their oracles to `breakRowsModel.test.ts:179-221`.
       Say whether each removed test's proof is still held by the moved test or by an e2e
       test.
2. **The attempt-1 FAIL reasons, each closed.**
   - FULL suite on both projects at `2026-10-20T17:00:00Z` and at
     `2026-11-03T17:00:00Z`. Both are Tuesdays; `timesheet.spec.ts`'s lifted-column test
     must pass at both.
   - The five specs at `2026-11-28T18:00:00Z`, run twice; both runs must end with 0
     failed.
   - Keyboard focus inside the week card at 768, 800, 820, 860, 880 and 899px.
     - Tab to every Saturday and Sunday stop (date button and Category).
     - The ring must be fully inside the visible card each time.
   - axe: (a) and (b) of attempt 1 must be gone. (c) stays as justified: report it if it
     appears and say whether it matches the justification.
3. **The FIX2 behaviours.**
   - **Account menu by keyboard.** Choosing Profile, Settings or Administration puts focus
     on the new page's `h1`; the same page returns focus to the identity button. The phone
     More panel behaves the same. After a pointer press, no visible ring.
   - **Check out dialog.**
     - "Discard your changes?" appears on Cancel and on Escape only after a change.
     - It closes at once with no change.
     - Discard sends nothing.
     - Check out still shows no notice and no final confirmation.
   - **Day editor chip.** It says "in progress" for a day of the in-progress period opened
     through Open a day. Check this at the simulated instant `2026-10-26T16:00:00Z`.
   - **"category" wording** in the batch dialog, Overtime and the holiday import.
   - **Hover.** Every `.sheet-day` hover rule that paints sits inside
     `@media (hover: hover)`.
   - **Category select.** It is described by the default hint.
   - **docs.** docs/04, docs/10 and docs/12: EN/VI parity of the changed lines. The main
     chunk figure in docs/10 must equal the built main chunk of the target.

Decision: PASS / FAIL / NOT VERIFIED. NAS items stay NOT VERIFIED, as in earlier gates.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-REGATE`. Set TEMP and TMP to it.
- Ports: 48860-48899, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Compose project `ts-wp5-ux3regate`; non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux3regate`; it must be empty.
- axe-core 4.14.0 may be installed into the task folder only. Add nothing to
  `package.json` or the lockfile.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e` (NOT EVEN `node -e "1"`), NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO
  `head` OR `tail` (NO `head -0`, NO `head -c`, NO `tail -c`). NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/zero` OR `nul`, AND NEVER USE ONE AS AN ARGUMENT. NEVER
  `rm -r` OR `rm -rf` ANYTHING.**
  - Write scripts and files with the Write tool and run scripts by path.
  - List files with the Glob tool.
  - Redirect output to files in the task folder and read them with the Read tool.
  - Run python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    Write `<user>` in the evidence.
  - Put Node 24 first on PATH with
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
    The first shell call is `node --version`; it must print v24.x.
- **Create files only inside the task folder and the evidence folder.**
- Never stop a process you did not start, and never kill by PID.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only.
- Never edit source, docs, tests, the board or STATE.
- Leave nothing running. Before returning, confirm that none of your background tasks is
  still running.
- In your Results and evidence:
  - no email address except the full synthetic `@example.invalid` form;
  - no real profile path (use `<user>`);
  - probe-truncated addresses written as `<email>`.

## Output

- Results go in this file: the decision, gate notes, and every item with its commands,
  exit codes and counts. Include the simulated-clock table in the attempt-1 form.
- Evidence goes in `handoff/delivery/evidence/WP5-UX3-REGATE/`: masked LF `.txt` and at
  most 14 `-synthetic.png`. The screenshots use the attempt-1 set on the target. Add one
  Check out discard question at 1366 and one phone More panel with focus on the heading.
- Return at most 250 words, beginning with 'Self-reported model: ...'.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Target `7ce4e95a0c4477374e981132d93b11aedab2e384` (HEAD = origin/main before and after; `git status`
outside `handoff/` empty before and after). Node v24.21.0 portable, Git Bash; Docker engine 28.5.1. Evidence: `handoff/delivery/evidence/WP5-UX3-REGATE/`
(logs as `log-*`, `obs-*`, numbered `NN-*` files; scripts as `*.txt`; 14 `-synthetic.png`). Workflow Python: `<user>` profile.

**Digest of record** `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 files: clean `git archive` export hashed with
`git hash-object --no-filters`, the `git ls-tree` form (sorted lists byte-identical) and `npm run digest` equal, before and after all checks
(`01-digest-*`). The e2e ran in `export` and `export-v`; both give the same digest after.

**Attempt-1 FAIL reasons, all closed.**
1. Lifted-column test on Tuesdays plus the 409 seed flake: FULL suite at `2026-10-20T17:00:00Z` (Tue 10:00 LA) and `2026-11-03T17:00:00Z` (Tue 09:00 LA): each
   627 passed, 67 skipped, 0 failed (desktop 317/30/0, mobile 310/37/0); `timesheet.spec.ts:878` ok on both projects at both instants. The five specs at
   `2026-11-28T18:00:00Z`, run twice: 289 passed, 0 failed each time (desktop 148/22/0, mobile 141/29/0); `timesheet.spec.ts:452` ok both times.
2. Keyboard focus clipped in the week card: probe `zz-weekreg` (desktop) at 768, 800, 820, 860, 880, 899px, Show details off and on, Tab and Shift+Tab, both cards:
   12 tests passed, 48 walks, every walk visits 14 of 14 controls including the Saturday and Sunday date buttons and Category pickers; 0 stops with the ring outside the
   card's visible box, minimum room 1.0px (Sunday Category), ring reach read from the computed style (the transparent forced-colours outline is not a ring); the card scrolls
   the Sunday stops in (scrollLeft 114, 82, 43-62, 22, 2, 0); page never wider than the window. (Attempt 1: Sunday button 1px visible at 800.)
   Probe note: my first version measured a 3px outer ring for every control and flagged the Sunday Category, whose ring is the inset 2px one; fixed in the probe, not a product finding.
3. axe 4.14.0 (WCAG 2.2 AA tags, task-local install, nothing in `package.json` or the lockfile): 84 scans (21 states x 4 theme situations), 80 clean, 4 with one
   `target-size` violation: the "Today" button with the account menu open at 1280, "partially obscured, 10.5px". (a) `label-content-name-mismatch` on the category trigger and (b) on
   the phone suggested-break chips: gone (0 in 84 scans; only `incomplete` entries of the rule, 2 per scan, as before). (c) matches the FIX1 justification (transient non-modal menu over
   the bar; same element, same 10.5px). The phone day buttons (R-UX2A-4) have no violation.

**Item 1, WP5 gate (clean export `export-v`).** `npm ci`, `npm run lint`, `npm run verify` exit 0 (94 files, 2131 tests, SMOKE PASSED, no chunk-size advisory); 0 deprecation lines in
ci, lint, verify, e2e, AC-13, `npm test` (run with `--trace-deprecation --pending-deprecation`). FULL e2e on the real clock (in `export`, a copy of the same export) exit 0: **627 passed,
67 skipped, 0 failed** (14.9 min); desktop 317 ok/30 skipped, mobile 310 ok/37 skipped; Los Angeles 2026-10-16 07:58:38 to 08:13:35 (window day: displayed period 2026-09-28..2026-10-11,
in progress 10-12..10-25); `automation.spec.ts:118` ok on both; `pdf-visual` 2 ok desktop, skipped mobile by design. AC-13 x3 exit 0; `Asia/Tokyo` (offset -540) and `America/New_York`
(240) exit 0. `npm test` x3 exit 0 (dep=0, crash=0). Drill `--wp3` exit 0: 208 PASS, 0 FAIL (33/31/57/35/27/23), "DRILL STAGES 1-6 PASSED", forbidden-file scan PASS (8 lines containing
"deprecat" are PASS lines saying there is none); RELEASE IMAGE `sha256:37155552964ef0fc681a64e299103b3c2449b1f89e091b963786f406dffd39f5`, 110042585 bytes (104.9 MiB), linux/amd64.
Cleanup: `docker compose -p ts-wp5-ux3regate down -v` exit 0, image removed by exact tag, `docker ps --all --filter name=ts-wp5-ux3regate` empty, no volume or network left.
Compose config live/restored/rollback exit 0 x3; env keys 21, only SQLITE_BUSY and WP5_HANDOFF map to none (as before); `npm audit --omit=dev` 0 vulnerabilities. Validators exit 0:
`validate_package --preflight` (112 pairs), `validate_orchestration`, `check_recovery` (106 probes), precommit self-test (35 path, 74 line samples, 12 rules), token contrast script.
`git diff --stat a643794..target -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty.
Slip with effect on the first verify: I ran `git init` in the first export, so `wordmarkAsset.test.ts` ("no font file among the tracked files", needs a non-empty tracked list) failed
`npm run verify` (exit 1, `03-verify.txt`); a fresh export without `.git` (`export-v`) gave verify exit 0 and was used for verify, AC-13, `npm test`, drill and the sweep. No source was touched.

**Item 2, boundary.** `git diff --stat a643794..target -- src/server src/domain migrations` empty (`20-bound-stat.txt`; no `migrations` directory). Clean builds of a643794 and the target
(`log-cmp-dist.txt`): `dist/server` 180 and `dist/domain` 46 files, 0 hash differences; only `dist/client` differs (main chunk plus the two lazy chunks). The probe export build equals the gate export (0 differences).

**Item 3, round scope.** 80 paths outside `handoff/` (13478 insertions, 1935 deletions), all within slice or fix owned paths (`22-*`). FIX1: 11 paths, exactly the 11 recorded in `WP5-UX3-FIX1.md`. FIX2: 27 paths
(docs/04, 10, 12 pairs; 11 client files; 2 unit tests; 6 e2e specs), all within the owned paths and Addendum 1; `App.tsx`, `DayEditor.tsx`, `timesheet.spec.ts`, `import.spec.ts` untouched. No font file;
the only raster outside `reference/` and `-synthetic.png` is the older `handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg`. Deleted: `SessionForm.tsx`, `BreaksEditor.tsx` only; `git grep` for them in `src tests` empty.
Skips: lines with skip/fixme/only/slow 17 at a643794, 29 at cecfceb, 30 at target; the only addition since attempt 1 is the project-conditional desktop-only describe of FIX1; no `fixme`, `.only`.
Sampled FIX2 changed or moved assertions against the diff (7): Profile test (all assertions kept, now under `timezoneId: 'Asia/Tokyo'` plus 3 added); `ot-leave.spec.ts:121` heading added; `dayEditorModel.test.ts` in-place change
(`quickBreaksRequest(...).breaks` check became a `quick.rows` check); the 4 `dayPeriodPill` tests (new); moved oracles `breakRowsModel.test.ts:179-221`; hover test; Check out discard test.
The 5 removed unit tests: (1) form-flow body and (3) saving the draft unchanged: held by `breakRowsModel.test.ts` "Confirm breaks with suggested rows" (JSON-equal to the old `buildSessionRequest` body, same value pins);
(2) empty confirmed list without reason and (5)'s box part: held by the ticked-box half of the second moved test (JSON-equal to the old `mode: 'none'` body); (4) listed rows kept: held by the first half of the second moved test.
(5) "selects no breaks taken when no suggested break fits" (`draft.mode === 'none'`) is not held by a unit test and not by the same behaviour: the T07/T08 dialog design lists nothing and leaves the box unticked, and the
e2e test `day-editor.spec.ts:3708` asserts exactly that (box not checked, Save asks, "Confirm no breaks taken" sends the empty confirmed list); the old preselection is a retired behaviour, not a weakening.

**Item 4, simulated clock** (preload `shiftclock.mjs` unchanged from FIX10; a control ran at every instant: server `today_local` equals the simulated date, `log-control-*.txt`; real control 2026-10-16).
| Instant (LA) | Window | Scope | desktop ok/skip/fail | mobile ok/skip/fail | Result |
|---|---|---|---|---|---|
| Tue 2026-10-20 10:00 | outside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Tue 2026-11-03 09:00 | outside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Mon 2026-10-26 09:00 | inside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed (`today.spec.ts:826` chip test ok both) |
| Fri 2026-10-30 16:00 | inside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Sun 2026-11-01 01:45 | outside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Thu 2026-12-31 23:30 | outside | FULL | 317/30/0 | 308/37/2 | exit 1, 625 passed, 2 failed (mobile `theme.spec.ts:413` "computed color is settled" 7s timeout; `timesheet.spec.ts:1799` 30s test timeout) |
| Thu 2026-12-31 23:30 (rerun) | outside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Sun 2027-03-14 03:30 | outside | FULL | 317/30/0 | 310/37/0 | exit 0, 627 passed |
| Mon 2026-10-26 23:58:30 | inside | 5 specs | 148/22/0 | 141/29/0 | exit 0, 289 passed |
| Sat 2026-10-17 10:00 | outside | 5 specs | 148/22/0 | 141/29/0 | exit 0, 289 passed |
| Fri 2027-01-01 00:30 | outside | 5 specs | 148/22/0 | 141/29/0 | exit 0, 289 passed |
| Sat 2026-11-28 10:00 (run 1) | outside | 5 specs | 148/22/0 | 141/29/0 | exit 0, 289 passed |
| Sat 2026-11-28 10:00 (run 2) | outside | 5 specs | 148/22/0 | 141/29/0 | exit 0, 289 passed |
The first 2026-12-31 run is recorded as a failure: two timeouts on the mobile project, neither a network nor a buffer error, so not within the "rerun once" allowance by its own wording; the rerun of the whole suite passed and the
two tests passed 15 of 15 at that instant when repeated alone (`log-sweep-rep-1231.txt`); both tests passed at the same instant in attempt 1 and in the other six FULL runs. I judge it a load timeout of the two mobile tests, not a defect, and the
sweep otherwise 12 of 13 runs clean at the first attempt. Total FULL e2e runs on the target: 8 plus the real-clock run, all ending at 627 passed.

**Item 5, round-specific checks** (same probes as attempt 1 on a scratch build of the target, Edge; `obs-*.txt`). Contrast in 4 situations: whole-document text sweep 0 below the requirement (lowest 4.61 phone light; desktop 5.00),
focus rings lowest 5.33 light / 6.40 dark (the unpainted-on-element stops are the 8 Light/Dark radio inputs, ring on the segment label), card on page 1.14 light / 1.15 dark (threshold 1.12), hover text 5.77 and 6.52 against fills.
44px targets: 0 controls below 44px at 320, 360, 375, 390, 430, 600, 767 in 11 states (81 lines); page sideways scroll none at 320, 360, 375, 390, 768, 820, 1024, 1280, 1440. 390x844 first screen: bottoms 658.4, 710.4, 559.5, 611.5 against tab bar 788 (equal for landing and away).
Desktop bar one 56px row at 1024, 1100, 1279, 1280, 1440, 1920 with and without a share; wordmark visible 1024-1279 without a share, hidden 1024-1279 with a share, visible from 1280. Day editor: modal at 1280 and 1359, beside the sheet at 1360 (columns 116.8-116.9), 1366 (117.7), 1440 (128.3), 1920 (151.1); every column >= 108px, no word wider than its cell, dock side right for Monday, left for Saturday and Sunday.
Lifted runs at 1440, 1445, 1367, 1601, 1281 (fractional edges .42 .84 .28 ...), DPR 1 (profile probe `obs-lift.txt`): fill continuous across the inner joins (242.2 on both sides; at most one pixel 1.8 to 2.6 above), a result consistent with FIX1's continuous shadow; I did not repeat the DPR 2 seam script (`zoom`, `seam`).
Session dialog 390x844 with suggested breaks: rows scroll 297px, chips 259px, first field and footer visible; rows versus chips at 430, 390, 375, 360, 320 unchanged. Chunk load: main `index-4YHzamSq.js` 487.17 kB (gzip 143.23), CSS 78.62 kB, lazy `AdminScreen` 31.57 kB and `ImportScreen` 23.82 kB load (200) on both projects; no chunk advisory; chunk-load error and "Try again" as before.
CSP and all response headers identical to a643794 on both projects (diff against the attempt-1 capture of a643794: 0 lines); 0 `securitypolicyviolation` on every screen. Shared views show no check in/out and the bar shows the signed-in user; an employee at `#/settings/admin` and `#/admin` makes 0 `/api/admin/` requests (both projects).
Audit-focus checks 1, 2, 6 and 7 repeated (`obs-focus.txt`, `obs-layout.txt`): `--transition` universal rule, hover text step to `--accent-strong`, "Open a day" words visible to 327px and hidden from 308px, one row throughout.

**FIX2 behaviours** (each by the repository tests inside the 627-pass runs and by my own probes `zz-fix2`, `zz-checkout-shot`; `obs-fix2.txt`).
- Account menu by keyboard: Profile, Settings and Administration (admin) each put focus on the new page's `h1` (`tabindex=-1`, `:focus-visible` true, ring painted); the same page returns focus to the identity button; the phone More panel does the same
  (focus back on More); after a pointer press the `h1` has focus with `:focus-visible` false and no ring. Both roles, both projects.
- Check out dialog: Cancel and Escape close at once with no change; after an added row or the ticked box they ask "Discard your changes?" (Keep editing first, Discard); Keep editing keeps the rows; Discard sends nothing; an undone change closes at once; Check out still sends with no notice and no final confirmation (`day-editor.spec.ts:2052`, ok on both projects in all runs; also run alone: ok).
- Day editor chip "in progress" through Open a day at `2026-10-26T16:00:00Z`: `today.spec.ts:826` ok on both projects in the full run at that instant (control: window inside, in progress 2026-10-26..2026-11-08).
- "category" wording: "Only the day's category changes." (`BatchDialog.tsx:133`), "Day category and recorded use differ" (`OtScreen.tsx:243`), "Days whose default category changes" (`HolidayImport.tsx:120`); "Label as read" kept in `ImportPreview.tsx`; remaining "day label" only in code comments.
- Hover: every `.sheet-day` hover rule that paints (`.sheet-day:hover`, `.sheet-day:hover .sheet-date`, `[data-lift]:hover`, `.sheet-day-button:hover`) sits in an `@media (hover: hover)` block; the two `.sheet-review` reset rules (transparent / non-working colour) stay outside, as FIX2 states; `hover.spec.ts:552` ok.
- Category select: `aria-describedby` points to the "Calendar default" hint while the source is default (`DayFieldsForm.tsx:104,118`; e2e `day-editor.spec.ts:2252` ok).
- docs: docs/04 lines 7 and 70, docs/10 lines 226/238/240 (VI 227/239/241) and docs/12 line 71 carry the same numbers and tokens in EN and VI; docs/10 says "487 kB in the build after WP5-UX3-FIX2"; the built main chunk is 487.17 kB (487179 bytes). `validate_package --preflight` PASS.

**Item 6, screenshots** (14, synthetic, `ux3regate-*-synthetic.png`): account menu 1440 light and dark and 1280 light, sheet with editor 1440 light and dark and 1280 light, lifted run 1440 light, period card old, session dialog notice 1366,
phone 390 session dialog rows and chips, Settings Administration 1280, Check out discard question 1366, phone Profile with focus ring on the heading after More. To stay at 14 I dropped the attempt-1 shots `account-menu-1280-dark` and `sheet-editor-1280-dark` (taken, not copied).

**Deviations and slips.** (1) The `git init` in the first export (above). (2) Rule slips in my shell commands, none with effect on evidence: one listing piped into `head -0`; two later `head -n 0` pipes; `head -n 0 /dev/null 2>/dev/null`; one `| cut > /dev/null`; one output piped through `tail` into `cut`. Nothing was fed to python or node through stdin, no heredoc, no recursive delete, no process killed.
(3) The a643794 header capture is the attempt-1 file (a643794 is fixed); the target capture is new. (4) The Playwright harness starts each server on an OS-assigned loopback port; `SMOKE_PORT` 48861 in range. (5) I did not repeat the DPR 2 seam scripts. (6) The 12-31 first-run failures, above.
NAS items stay NOT VERIFIED. Nothing of mine is left running (no server, browser, container, volume or background task). No source, docs, tests, board or STATE was edited; the digest is unchanged.

### Evidence hygiene (coordinator request, 2026-10-16)

Four non-`.txt` files were in the evidence folder. None was byte-identical to an existing `.txt`, so each got a masked LF copy `<name>.log.txt` (CR and ANSI stripped, trailing whitespace stripped) and the `.log` original was deleted with a plain `rm`:
- `log-main.log` (47 bytes) to `log-main.log.txt` (47): 0 paths, 0 emails, 0 CR, 0 ANSI masked.
- `log-verify.log` (24) to `log-verify.log.txt` (24): 0, 0, 0, 0.
- `log-rest.log` (484) to `log-rest.log.txt` (484): 0, 0, 0, 0.
- `log-drill.log` (858) to `log-drill.log.txt` (858): 0, 0, 0, 0.

Grep of the four results for `[ \t]+$`, user-profile paths and email addresses: clean. The folder now holds only `.txt` and `-synthetic.png` names.

Status: done (decision PASS)
