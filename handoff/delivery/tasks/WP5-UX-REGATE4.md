# WP5-UX-REGATE4 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE4; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX6-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX6, which answered
  WP5-UX-AUDIT-B4 findings B4-01 (the shared focus ring was 1.72:1 / 2.46:1) and B4-02
  (ISO due time in the zone note), as the owner chose (WP5-UX-Q1, option a). The
  previous gate WP5-UX-REGATE3 passed on edaaa85 (digest b7bbcbc0). Between them sit the
  owner's handoff-only commit 49a3ff0 and the FIX6 freeze.
- Target: `freeze_commit` = 5e104e14dad71268a9185920c04ed0ee2a4b31c2 (HEAD =
  origin/main). Expected digest of record
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 files): compute it
  on a clean export of 5e104e1 and cross-check with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE3.md` (gate items, method, results and
  evidence). You rerun that method on the new freeze.
- The Results of `WP5-UX-FIX6.md` and the findings in `WP5_UX_REVIEW_B4.md`.

## Gate items

1. **Rerun WP5-UX-REGATE3 item 1** on a clean export of 5e104e1 with the same method and
   limits (npm ci, lint, verify with deprecation tracing, full e2e both projects with
   per-project counts, AC-13 three times and under `Asia/Tokyo` and `America/New_York`
   through a wrapper, drill `--wp3` with image ID and size and forbidden-file scan,
   compose config forms, env keys, `npm audit --omit=dev`, validators incl.
   check_recovery 106 probes, precommit self-test, business boundary since 014bd47, PDF
   unchanged and pdf-visual passing, scope since 014bd47, contrast in both themes
   including the new focus-ring tokens, `npm test` three times, synthetic screenshots,
   44px and no horizontal scroll at 390, 375, 360 and 320px).
2. **Fix scope.** `git diff --stat edaaa85..5e104e1` outside handoff/: only
   `src/client/styles.css`, `src/client/components/PeriodBar.tsx`,
   `src/client/components/periodBarModel.ts`, `tests/client/periodBarModel.test.ts`,
   `tests/e2e/timesheet.spec.ts`, the new `tests/e2e/focus-ring.spec.ts` and docs/04 (EN
   and VI). Confirm 49a3ff0 changed nothing outside handoff/.
3. **Observed in the built app:**
   - B4-01: Tab to a top-bar link, a period button, Clock in, the Review link, a sheet
     "Edit {date}" button and a phone tab, in light and dark; measure the composited
     focus-ring colour against the adjacent background (at least 3:1 each); the label
     picker ring still shows.
   - B4-02: with a viewing zone different from the reporting zone, the zone note shows
     the due time in the US format of the bar (for example "Wed 10/14/2026, 07:00").
   - Earlier fixes still hold: B3-01 (review stays on top across 1280↔1024, Escape
     order, focus never on BODY), B2-01 and R-7 (full date in "Open a day" at
     390/375/360/320), B-01 at 390x844, A-01, B-02, tab order.
4. Screenshots: at most ten `*-synthetic.png`, including focus rings in both themes and
   the zone note.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-REGATE4`. Ports 48180-48199, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-uxregate4`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxregate4` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write scripts with the
  Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence); put Node 24 first on PATH with `cygpath -u` before
  any node call; first shell call `node --version` (v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE. Leave nothing running.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-UX-REGATE4/`, with scripts saved as `*.mjs.txt`,
`*.py.txt`, `*.ts.txt` or `*.sh.txt`, and screenshots as `*-synthetic.png`. Record the
drill image ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT
VERIFIED from actual results; NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, the
observations, the image ID, and the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 5e104e14dad71268a9185920c04ed0ee2a4b31c2; HEAD = origin/main = the same before and
after (no non-handoff path changed since the freeze, `nonhandoff-since-freeze.txt` empty). Node v24.21.0 portable, Git Bash, workflow
Python (user `<user>`) for the validators. Raw output `D:\.claude-tmp\timesheet\WP5-UX-REGATE4`; masked LF evidence in
`handoff/delivery/evidence/WP5-UX-REGATE4/` (index `00-README.txt`). DATA_DIR/DATABASE_PATH in the task folder; SMOKE_PORT 48181;
e2e servers and the drill use OS-chosen loopback ports as in earlier gates. `%LOCALAPPDATA%\timesheet-dev` not written (portable Node read only).

Digest of record `07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635`, 790 files (handoff/ excluded): equal in three
forms: clean `git archive 5e104e1` export hashed with `git hash-object --no-filters` (before and after all checks; scratch specs
and tz probe removed, same file list), the `git ls-tree` form, and `npm run digest` in the repository (run last). Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci`, `npm run lint`, `npm run verify` | exit 0 x3; verify 82 files, 1821 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` | exit 0; 174 passed, 16 skipped (4.8 min). desktop 86 ok + 9 skipped, mobile 88 ok + 7 skipped (includes the 4 new focus-ring tests); 0 deprecation lines |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each |
| 1 | AC-13 under real zones (`run-tz.mjs.txt` plus probe; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0, 0 deprecation lines), project `ts-wp5-uxregate4` | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:218dd7cc9e567862182f633914717e4087d2bb2265a77a2d98a7eaaf596e9791` (110013693 B, linux/amd64); forbidden-file scan PASS |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate4`, `timesheet:aaaaaaa`, data dir; restored `ts-wp5-uxregate4-restored`, restore dir; rollback `ts-wp5-uxregate4-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"` |
| 1 | env keys of docs/11 and 12 | 21 keys; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, same as earlier gates) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS, validate_orchestration 0 PASS, check_recovery 0 PASS (count 106); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at 5e104e1) |
| 1 | Business boundary `git diff --stat 014bd47..5e104e1 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions; no server change (`20-bound-stat.txt`) |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..5e104e1 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes); pdf-visual passed in the e2e run (desktop; mobile skips it by design) |
| 1 | Scope since 014bd47 outside handoff/ | 68 paths (`22-scope.txt`): the 67 of WP5-UX-REGATE3 plus the new `tests/e2e/focus-ring.spec.ts` |
| 1 | Contrast (`contrast.mjs.txt`, `40-contrast.txt`; adds the ring pairs) | all text pairs at least 4.5:1; ring accent against card/bg/sheet head/sheet head off/non-working/attention light 6.09/5.68/5.23/4.86/5.43/5.58, dark 6.79/7.52/6.00/5.43/6.40/5.94, card gap on accent 6.09/6.79 (all at least 3:1); only the two non-text `--sheet-rule-strong` on card pairs (2.86, 2.97) remain under 3:1 (decorative table rule, informational, unchanged since earlier gates) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1821 tests passed; native worker crash lines 0 in all three |
| 1 | 44px and overflow at 390/375/360/320 (`obs-targets.txt`, scratch spec, 12 passed in the mobile project) | timesheet 41, batch 46, editor 53, Review 8 controls; 0 below 44x44 and scrollWidth = innerWidth at all four widths |
| 2 | Fix scope `git diff --stat edaaa85..5e104e1` outside handoff/ (`22a-fixround.txt`) | 8 files, 207 insertions, 10 deletions: docs/04 EN and VI (1 line each), `src/client/components/PeriodBar.tsx` (+3/-3), `periodBarModel.ts` (+7), `src/client/styles.css` (+8/-3: `--focus-ring` two-colour C40 form, new `--focus-ring-inset`, dark override removed, phone tab uses the inset token), `tests/client/periodBarModel.test.ts`, `tests/e2e/focus-ring.spec.ts` (new, 169), `tests/e2e/timesheet.spec.ts`. Nothing else (`23-fix-src-diff.txt`). Commit 49a3ff0 (`22b`, `22c`): 0 paths outside handoff/ |
| 3 | B4-01 (`obs-b4.txt`, real Tab presses, both projects, `:focus-visible` true, reduced motion) | Outer ring colour composited over the adjacent background: light #1f5fbf on #ffffff 6.09:1, dark #6ea8ff on #1a2029 6.79:1, for: top-bar link Overtime (desktop), period button Next, Clock in button, Review link, sheet "Edit {date}" button and phone tab History (mobile, inset form, own surface). Ring box-shadow outset 1px card + 3px accent (inset 2px accent + 3px card on the tab). Clock in sits on an accent fill: the ring is outside it, the 1px card gap separates fill and ring. Label picker trigger still shows its own inset 2px accent ring (light and dark, both projects). 12 measured controls per theme, all at least 3:1 |
| 3 | B4-02 (`obs-b4.txt`, both projects, viewing zone Asia/Saigon, reporting zone America/Los_Angeles) | zone note "Due, your time (Asia/Saigon)" = "Wed 10/14/2026, 07:00" (due_at_utc 2026-10-14T00:00:00Z); the bar says "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)" |
| 3 | Earlier fixes still hold | B3-01 (`obs-b3.txt`): path A (1280 to 1024, review open) review modal, focused and on top, first Escape closes only the review (stored category Worked, only the preview POST), second Escape closes the editor with focus on the day's button; path B (1024 back to 1280) same, first Escape leaves focus on the label picker (as asserted by the fix), second to the day's button; path C editor-only 1280/1024/1280/768/1200/1199 modal exactly below 1200, focus inside, Escape returns to the day's button. B2-01/R-7 (`obs-r7.txt`): full date unclipped at 390 (146.2 px), 375 (131.2), 360 (220.0), 320 (180.0), with and without the note, no horizontal scroll. B-01 at 390x844: first row bottom 757.97 (note) and 659.02 (no note) against tab bar top 788; 375/360/320 informational and unchanged from REGATE3. A-01 (both projects): "2-"/30 and 4/"3-": visible `role=alert`, `aria-invalid` on the offending field only, 0 PUT, stored 0; 2 h 30 m one PUT (150); empty PUT 0. B-02 (desktop): 1024 and 768 `:modal`, 140 Tab/Shift+Tab presses with focus under the panel 0; 1280 not modal. Tab order previous, next, review in both projects |
| 4 | Screenshots | 10 `*-synthetic.png` kept: focus ring on the top-bar link (light and dark), phone tab (light and dark), Clock in (dark), zone note (desktop and phone), review on top at 1024 after the resize, "Open a day" at 320, first screen with note at 390 |

Cleanup: drill image `ts-wp5-uxregate4-timesheet:drill` removed by exact tag (untagged and deleted), project `ts-wp5-uxregate4` down -v
(exit 0); final `docker ps --all --filter name=ts-wp5-uxregate4` empty (`15-docker-ps.txt`). No process left running. Nothing committed,
sent or edited outside this brief and the evidence folder. Slips (no real file touched): one `cat file | head -3`, `< /dev/null` on the
drill command, one empty-heredoc `cat > /dev/null 2>&1` and one `: > /dev/null 2>&1`, all no-ops against the stated rules. NAS target
NOT VERIFIED (owner steps, docs/11 sections 13-16). Failing items: none.

Status: done
