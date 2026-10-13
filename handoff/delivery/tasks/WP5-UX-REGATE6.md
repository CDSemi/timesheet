# WP5-UX-REGATE6 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE6; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX8-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX8, which fixes
  WP5-UX-AUDIT-B6 finding B6-01. The finding: at 390x844, for a person with a received
  share while the zone note shows, the first day row was hidden under the tab bar. The
  fix is CSS only: a one-row compact shell bar below 768px. The previous gate
  WP5-UX-REGATE5 passed on bf954c0 (digest b7c011d2).
- Target: `freeze_commit` = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8 (HEAD =
  origin/main). Expected digest of record
  b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files). Compute it
  on a clean export of 255ba17 and cross-check it with the `git ls-tree` form and with
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE5.md`: its gate items, method, results and
  evidence. You rerun that method on the new freeze.
- The Results of `handoff/delivery/tasks/WP5-UX-FIX8.md` and the B6-01 row in
  `handoff/delivery/WP5_UX_REVIEW_B6.md`.

## Gate items

1. **Rerun WP5-UX-REGATE5 item 1** on a clean export of 255ba17, with the same method
   and limits:
   - `npm ci`, lint, and verify with deprecation tracing;
   - the full e2e on both projects, with per-project counts;
   - AC-13 three times, and under `Asia/Tokyo` and `America/New_York` through a wrapper;
   - drill `--wp3`, with the image ID and size and the forbidden-file scan;
   - the compose config forms, the env keys and `npm audit --omit=dev`;
   - the validators, including check_recovery (106 probes), and the precommit self-test;
   - the business boundary since 014bd47, PDF unchanged and pdf-visual passing, and the
     scope since 014bd47;
   - contrast in both themes, including the ring pairs and light `--ok`;
   - `npm test` three times;
   - synthetic screenshots;
   - 44px targets and no horizontal scroll at 390, 375, 360 and 320px, including batch
     mode at 320.

   If `automation.spec.ts:118` fails with ECONNRESET, rerun only that test three times,
   record it, then rerun the full suite once; record both runs.
2. **Fix scope.** `git diff --stat bf954c0..255ba17` outside handoff/ must show exactly
   `src/client/styles.css` and `tests/e2e/sharing.spec.ts`. Report any e2e assertion that
   was removed or weakened.
3. **Observed in the built app** (mobile project, light and dark, reduced motion):
   - **B6-01.** At 390x844, measure four states: no received share / received share,
     each with the zone note shown and hidden. In each state, the bottom of the first
     `[data-day]` row must be at or above the tab bar top. Record the shell-bar height.
     Record 375, 360 and 320 for information.
   - **The switcher at 390 and 320.**
     - Its label is visible, and its accessible name contains the visible text.
     - Changing the choice with the keyboard does not navigate.
     - Open navigates, by keyboard and by touch.
     - The select and Open are 44px high.
     - Owner-only controls stay hidden in the shared view.
   - **AX-01 after the bar change.** Run a Shift+Tab and Tab walk on Timesheet, the day
     editor and the shared view at 768, 390 and 320. No focused control may be entirely
     hidden under the shell bar, the share bar or the editor head.
   - **Earlier fixes still hold:** B4-01 (ring at least 3:1), B4-02, B3-01, B2-01 and R-7,
     B-01, A-01, B-02, and the tab order.
4. **Screenshots:** at most eight `*-synthetic.png`, including the four 390x844 B6-01
   states.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX-REGATE6`. Set TEMP and TMP to it.
- Ports 48360-48379, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and prefer sequential runs.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Give Playwright actions in your probes a short timeout.
- Docker: Compose project `ts-wp5-uxregate6`, non-TTY flags only. At the end, remove the
  drill image by its exact tag and the project by name. Record
  `docker ps --all --filter name=ts-wp5-uxregate6`; it must be empty.
- Use Git Bash only. Never use cmd.exe, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`, AND NEVER
  USE `< /dev/null` ON A COMMAND.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (write `<user>` in the evidence).
  - Put Node 24 first on PATH with `cygpath -u` before any node call. Make the first shell
    call `node --version` (it must be v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. Never edit source, docs, tests, the
  board or STATE. Leave nothing running.
- In your Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- Write your results into this file with the Edit tool.
- Put masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-REGATE6/`. Save
  scripts as `*.mjs.txt`, `*.py.txt`, `*.ts.txt` or `*.sh.txt`, and screenshots as
  `*-synthetic.png`.
- Record the drill image ID; the pilot packet identity refresh uses it.
- Decide PASS, FAIL or NOT VERIFIED from the actual results. NAS items stay NOT
  VERIFIED.

Return at most 200 words, beginning with your self-reported model. Include:
- the decision;
- the digest of record, in all three forms;
- each gate item's result, with counts and exit codes;
- the observations;
- the image ID;
- the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 255ba17d6bf891c0ff779d4a4f518e0d2998cee8; HEAD = origin/main = the same before and after; no non-handoff
path changed (`nonhandoff-status.txt` empty). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`) for the validators. Raw output in the task
folder; masked LF evidence in `handoff/delivery/evidence/WP5-UX-REGATE6/` (index `00-README.txt`). DATA_DIR/DATABASE_PATH in the task folder, SMOKE_PORT 48361;
e2e servers and the drill use OS-chosen loopback ports as in earlier gates.

Digest of record `b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe`, 793 files (handoff/ excluded), equal in three forms: clean `git archive
255ba17` export hashed with `git hash-object --no-filters` (before and after all checks; scratch specs removed), the `git ls-tree` form, and `npm run digest`
in the repository (before and last). Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci`, `npm run lint`, `npm run verify` | exit 0 x3; verify: 82 files, 1823 tests passed, build, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` | exit 0; 210 passed, 26 skipped, 0 failed (4.8 min). desktop 103 ok + 15 skipped, mobile 107 ok + 11 skipped; pdf-visual passed on desktop (mobile skips it by design); `automation.spec.ts:118` passed on both projects (no ECONNRESET, so no rerun); includes the 2 new FIX8 tests in the sharing spec (mobile) |
| 1 | AC-13 alone x3 | exit 0 x3; 0 deprecation lines |
| 1 | AC-13 under real zones (`run-tz.mjs.txt` plus a tz probe; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo` offset -540, 2 passed, exit 0. America/New_York: `zone=America/New_York` offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0, 0 deprecation lines), project `ts-wp5-uxregate6` | exit 0; stages 33/31/57/35/27/23, 208 PASS lines, 0 FAIL; image `sha256:f36d083ee6dd37ab66c1d00a98398a18171264ebad17b170f1a9c85b25e83af4` (110014793 B, linux/amd64); forbidden-file scan PASS; no deprecation line in build or container logs |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate6`, `timesheet:aaaaaaa`; restored `ts-wp5-uxregate6-restored`; rollback `ts-wp5-uxregate6-rollback`, `timesheet:bbbbbbb`, `JOB_RUNNER: "off"` |
| 1 | env keys of docs/11 and 12 | 21 keys; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, as in earlier gates) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS; validate_orchestration 0 PASS; check_recovery 0 PASS (count 106); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at 255ba17) |
| 1 | Business boundary `git diff --stat 014bd47..255ba17 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions (unchanged since REGATE4); no server change |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..255ba17 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes); pdf-visual passed |
| 1 | Scope since 014bd47 outside handoff/ | 80 paths, identical to the list at bf954c0 (`22-scope-vs-prev.txt` empty): FIX8 touched only files already in the list |
| 1 | Contrast, both themes (`contrast5.mjs.txt`, `40-contrast.txt`) | output identical to REGATE5 (`40-contrast-vs-regate5.txt` empty): all text pairs at least 4.5:1; ring pairs 6.09 / 6.79; light `--ok` lowest 4.69 with the selection tint; only the two non-text `--sheet-rule-strong` on card pairs (2.86, 2.97) stay under 3:1 (decorative table rule, informational, unchanged since earlier gates) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1823 tests passed; worker/crash/deprecation lines 0 |
| 1 | 44px and no horizontal scroll at 390/375/360/320 (`obs-targets.txt`, 16 checks) | timesheet 41, batch 46, editor 53, Review 8 controls at every width; 0 below 44x44 and scrollWidth = innerWidth at all four widths, batch mode at 320 included (`obs-ax10.txt`: 14 rows, 0 problems at 390 and 320) |
| 2 | Fix scope `git diff --stat bf954c0..255ba17` outside handoff/ (`22a-fixround.txt`) | exactly `src/client/styles.css` (+25) and `tests/e2e/sharing.spec.ts` (+51), 76 insertions, 0 deletions; `22e-forbidden.txt` empty (no server, domain, `api.ts`, `fixtures.ts` or docs change) |
| 2 | e2e assertion removed or weakened? (`24-sharing-diff.txt`) | No: the spec diff is additions only (0 removed lines); one new describe with two tests (mobile only, zone note shown and viewing zone equal), each asserting first row bottom <= tab bar top (+0.5), shell bar height <= 60, scrollY 0, select and Open at least 44x44 and inside the bar, the visible switcher label and no sideways scroll |
| 3 | B6-01 at 390x844 (`obs-b6.txt`, new probe, mobile project; light and dark, reduced motion; real sign-in, 14 day rows) | all four states: first `[data-day]` bottom at or above the tab bar top (788). No received share + note 757.97 (margin 30.03); received share + note 765.97 (margin 22.03); no share, no note 659.02 (128.98); received share, no note 667.02 (120.98). Identical light and dark. Shell bar height 52 without a share, 60 with the switcher (one row). scrollWidth = innerWidth. For information (viewport heights 812/800/640, not the 844 budget): at 375, 360 and 320 a received share with the note shown has the first row bottom 783.36 / 852.75 / 963.75 against a tab bar top 756 / 744 / 584, i.e. below the tab bar (the no-share note state is also below at 375 and 360; without the note and with a share 375 and 360 still fit: 667.02 vs 756, 736.41 vs 744; 320 does not). At 320 the switcher wraps below the brand: shell bar 90.83. The test and the finding are scoped to 390x844 (docs/04 line 48), so this is informational |
| 3 | Switcher at 390 and 320 (`obs-switcher.txt`; light and dark) | visible label "Shared with me" (12px; label box 200.5x44 at 390, 212.9x44 at 320); the select's accessible name is "Shared with me" (aria snapshot) and contains the visible text; ArrowDown sets the choice, URL stays `#/timesheet`, no share bar, 0 non-GET requests; Tab to Open then Enter navigates to `#/shared/{owner}` with the share bar; a tap on Open navigates the same; select 138.2x44 (390) / 149.3x44 (320), Open 67.1x44 at both; owner-only controls (Clock in/out, Change several days, Open day, Preview changes, Select all, Clear, checkboxes, label pickers) all absent in the shared view. At 320 the select text is clipped ("Synthetic Sharing…" in the screenshot), a cosmetic note only |
| 3 | AX-01 after the bar change (`obs-ax01.txt`; real Tab and Shift+Tab walks; Timesheet, Settings, shared view, day editor; light and dark; reduced motion; desktop project at 1280 and 768, mobile project at 390 and 320) | 64 walks; stops per width 259 (desktop) and 253 (phone) summed over 8 walks; hidden stops 0 at all widths and both themes; min visible sample points 25/25 at 768, 390 and 320 (20/25 at 1280, never 0). Phone shell bar sticky at 60 (390) and 90.8 (320); share bar static below it (76 vs 60; 106.8 vs 90.8) and scrolls away |
| 3 | AX-02..AX-04, R-12 rings (`obs-rings.txt`, `obs-rings-c.txt`) | light / dark: label list 6.09 / 6.79; active option inset 5.35 / 5.29; day editor dialog inset 6.09 / 6.79 (both projects); pressed toggles with focus 6.09 / 6.79; date field and time field after Shift+Tab 6.09 / 6.79. All at least 3:1 |
| 3 | AX-05, AX-06, AX-07, AX-08, AX-09, AX-10 (`obs-ax05..ax10.txt`) | AX-05 14/14 names "Edit/View ... (ISO date)" on both projects, "End share with {name}". AX-06 as above, both projects. AX-07 wrong-password and Timesheet failure `role=alert`, share notices `role=status`; the admin new-user notice was not reached by the probe selector (same as REGATE5, source only). AX-08 batch review, sharing, import and opening balance: focus returns to the opener or the step heading, 0 extra writes. AX-09 "Complete" 6.63 (normal), 5.82 desktop and 5.17 phone (selected). AX-10 batch at 390 and 320, 14 rows, 0 problems |
| 3 | Earlier fixes still hold (`obs-b4.txt`, `obs-b3.txt`, `obs-r7.txt`, `obs-desktop.txt`, `obs-phone.txt`) | B4-01 ring 6.09 / 6.79 on the top-bar link, period button, Clock in, Review link, sheet day button, phone tab (inset), label picker trigger. B4-02 zone note "Wed 10/14/2026, 07:00" with bar "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)". B3-01 review on top across 1280/1024, first Escape closes only the review, second Escape closes the editor with focus on the day's button, editor modal exactly below 1200. B2-01/R-7 date field 146.2 / 131.2 / 220.0 / 180.0 px unclipped at 390 / 375 / 360 / 320, no horizontal scroll. B-01 first row bottom 757.97 (note) and 659.02 (no note) against tab bar 788. A-01 invalid hours/minutes alert, 0 PUT; valid 150 min one PUT; empty fields one PUT (0). B-02 1024 and 768 `:modal`, 140 Tab/Shift+Tab presses, focus under the panel 0; 1280 not modal. Tab order previous, next, review on both projects |
| 4 | Screenshots | 8 `*-synthetic.png`: four B6-01 states at 390x844 (light), switcher choice at 320, Shift+Tab stop at 390, label picker active option, batch rows at 320 |

Cleanup: drill image `ts-wp5-uxregate6-timesheet:drill` removed by exact tag (untagged and deleted), `docker compose -p ts-wp5-uxregate6 down -v` exit 0; final
`docker ps --all --filter name=ts-wp5-uxregate6` empty (`15-docker-ps.txt`), no image of the project left (`15-docker-images-after.txt`). No process left running. Nothing
committed, sent or edited outside this brief and the evidence folder; no source, docs, tests, board or STATE edited. Untracked coordinator files that appeared during the run
(`WP5-UX-AUDIT-A7.md`, `WP5-UX-AUDIT-B7.md`) are not mine (`00-status-after.txt`).

Process notes: the first B6 probe run failed on probe-side defects (a goto before the sign-in finished; a second sign-in in one context), fixed in the scratch probe only. Slips
against the runtime rules (no real file touched): three pipes into head or tail (`| head`, `| head -3 | wc`, one `tail ... > /dev/null 2>&1`) and one `> /dev/null 2>&1` on the
keys script. NAS target NOT VERIFIED (owner steps, docs/11 sections 13-16). Informational: 375/360/320 first-screen fit with a received share and the zone note is outside the
390x844 fix scope; the admin new-user and Settings policy `role=status` notices were not observed in the built app. Failing items: none.

Status: done
