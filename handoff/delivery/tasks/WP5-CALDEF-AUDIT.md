# WP5-CALDEF-AUDIT dispatch brief (independent audit of the R-UX5I2-3 round)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-AUDIT, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-CALDEF-REGATE (PASS required).
  - It audits the owner's answer to R-UX5I2-3 as built (WP5-CALDEF-FIX, -DOCS, -SMOKE, frozen
    in 300d61f) and the tests-only fix WP5-CALDEF-FIX2 (frozen in the next commit). Its PASS
    re-accepts WP5 and supersedes WP5-UX5-RECHECK-RN (PASS on a54061f / 690fd8fd) as the
    current acceptance.
  - Gate history: WP5-CALDEF-GATE on 300d61f failed on one item only
    (`classic-scrollbar.spec.ts:143` on the real clock of 2026-11-03, also failing on
    a54061f); WP5-CALDEF-DIAG1 found a test assumption (the press point under the floating
    Day editor docked right); WP5-CALDEF-FIX2 changed that spec only; WP5-CALDEF-REGATE is
    scoped and carries forward the items its `dist/` comparison allows.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size M, risk H, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_CALDEF_REVIEW.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-CALDEF task (plan, plan review, fix, docs, smoke,
  evidence rename, path lookups, freezes, gates, diagnosis, second fix); their agent IDs are
  on the board. Treat every report, the plan, the plan review, the diagnosis and the gates as
  claims.
- **Owner decision (2026-11-02, verbatim on the board under `owner_decisions` and in docs/10):**
  "R-UX5I2-3: nếu giá trị mặc định đã đổi thì hiện thông báo, để người dùng quyết định save
  (ghi đè) hay update theo giá trị mặc định mới". Translation: if the default value has
  changed, show a notice so that the person decides whether to save (overwrite) or to update
  to the new default. Coordinator decisions of 2026-11-02 and 2026-11-03 on the board (the
  notice in the Day editor, the reload flow for the picker and the batch, the optional field,
  the smoke fix in this round) are in scope: judge whether they keep the owner's rule.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-CALDEF-REGATE on the board
    (the WP5-CALDEF-FIX2-FREEZE commit, pushed; restated in the dispatch message).
  - TARGET_DIGEST = the regate's `source_digest` on the board (885 files; restated in the
    dispatch message).
  - HEAD may be a later commit that changes only `handoff/`.
  - The last accepted snapshot is a54061f6afc1fda00d4ee2cca4553a5916af24ec (digest 690fd8fd);
    5b2f287 (digest 4ac52e6b) changed documentation and workflow tooling only after it;
    300d61f (digest e24274b9) is the round's first freeze.
  - Record HEAD, the digest before and after (the export, `git ls-tree` and
    `npm run digest` forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins** (rules 7, 8, 11, 14; "Frontend and UI/UX standards").
- Never touch `.claude/worktrees/` or its branch.

## Read

- The risk: `handoff/delivery/WP5_UX5_REVIEW_INT2.md` (R-UX5I2-3) and
  `handoff/delivery/WP5_UX5_REVIEW_INT3.md` ("An administrator's calendar change", E2-E4).
- The plan and its review (`evidence/WP5-CALDEF-PLAN/plan.txt`,
  `evidence/WP5-CALDEF-PLAN-REVIEW/review.txt`), the Results of `tasks/WP5-CALDEF-FIX.md`,
  `-DOCS.md`, `-SMOKE.md`, `-GATE.md`, `-DIAG1.md`, `-FIX2.md` and `-REGATE.md`, with their
  evidence.
- docs/02, 03, 04, 06, 10 and 12, EN and VI, as changed.

## Scope

1. **The owner's rule.** On every path in scope, a save never records a category over a
   calendar default that changed since the person was shown it, unless the person chose
   "Save {category} anyway"; and "Use {new default}" really takes the new default. Probe at
   least: a day with no entry, a default-sourced entry, an explicit entry (never refused), the
   desktop drawer, the phone sheet, the shared edit view, the label picker and "Change several
   days" (is the owner's choice reachable through the reload flow?), a second default change
   between the notice and "Save anyway", and a save whose category equals the new default
   (MF1: no notice). Judge whether the coordinator's scope decisions keep the owner's intent.
2. **The server contract.** The optional `default_category`; the 409 `default_changed` body;
   the PUT and batch check orders (reason, leave, `stale_version`, `default_changed`,
   conflicts); the batch preview status and all-or-nothing commit; the check inside the write
   transaction against the subject's calendar, including a holiday import racing a save; no
   cross-user leak through the error details; the share route. Probe a client that omits the
   field and state the residual risk the coordinator accepted.
3. **The client.** The default captured at mount against FIX18's follow, FIX19's held and
   restart branches, "Reload day", a tab return, the label/batch refresh and a period step:
   try to make the form send a stale default with a fresh version, or refuse a save that has
   no real conflict. The rebased baseline after "Use", the unsaved-changes guard (U4-05), the
   stale notice precedence, focus and announcements, 44px targets, both themes, and the page
   notice with "Reload period".
4. **Time.** AGENTS rule 7: accounting dates, the reporting zone and a device zone that
   differs; dates near local midnight and a DST change; an import effective from a later date.
5. **Documents.** Every new statement in docs/02, 03, 04, 06, 10 and 12 matches the build;
   EN and VI say the same; the docs/10 audit statement (before = null on a no-entry create) is
   accurate.
6. **The smoke fix.** `recentMonday()` in `scripts/smoke-built-server.mjs` steps calendar
   dates and finds the right Monday at every instant, including both DST weeks; nothing else
   in the script changed.
7. **Regressions.** The accepted behaviour of rounds 4 and 5 that the change touches: the
   Day editor (FIX18, FIX19, U4-05, sessions and breaks), the label picker and batch, the
   holiday import and its preview counts (F-2 b), shared views, the PDF and sending
   (unchanged code: confirm by diff). Run a real axe scan with the notice open and with the
   picker review dialog showing "calendar default changed".
   - **The tests-only fix WP5-CALDEF-FIX2.** Judge DIAG1's verdict against docs/04 (the
     floating drawer docks away from the edited column): is the press under the drawer a
     test assumption, or should a press on the visible part of a card's scrollbar beside the
     drawer behave differently? Confirm the changed test still proves what it claims (a
     press-drag on a week card's own scrollbar scrolls it and keeps the Day editor open) on
     both dock sides, that nothing was loosened, and whether any other e2e test depends on
     the real date or the dock side in the same way.
   - Carry the F2 harness risk (a port race in `tests/e2e/fixtures.ts`, `freePort()` and
     `waitUntilHealthy`; DIAG1 section 6, backlog) into the optional risks, updated.
8. **Test strength.** Write at least eight mutants of your own on the change (server and
   client). Say whether the suite catches each, and for the right reason.
9. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` (103 files, 2,425), build (no advisory);
   - the real-clock FULL e2e on both projects;
   - AC-13 under one zone;
   - one seven-file sweep run at 2026-10-27T06:58:30Z through the FIX10 wrapper.

   A run that fails only with a network or buffer error is rerun once, and both runs are
   recorded. A timeout is classified from its trace, as in REGATE12's load rule.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-AUDIT`. Ports 52170-52209.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **This is a public repository.** Evidence may hold process names, IDs, counts and CPU times
  only. Never write the command line of a process the mission did not start (a
  `node dist/server/index.js` on port 3000 since 2026-10-27 is not the mission's; leave it).
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES), NO
  `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR `python -`,
  NO `| node`, NO `| python`, NO BARE `cat`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>`. NO `rm -r` OR `rm -rf`, NO `sed -i`, NO FIFO WAITER SCRIPTS, NO `git init`, NO
  `sleep`, `ping` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS.**
  - Write probes as files in the task folder and run them by path.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or `npm install`
  in the repository.
- axe-core 4.14.0, if used, goes in the task folder only.
- Never kill processes by PID. Leave nothing running.
- Create files only in the task folder, the evidence folder and the review pair. Every file
  ends with exactly one newline. Evidence names end in `.txt` or `-synthetic.png` only, with at
  most 12 screenshots; probe scripts are kept as `*.ts.txt` or `*.mjs.txt`.
- Use synthetic data and local mail capture only. No email address except the full synthetic
  `@example.invalid` form. No password literal. Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-CALDEF-AUDIT/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-CALDEF-n), with its severity, file:line, reproduction and
    expected result.
  - State whether R-UX5I2-3 is closed.
  - Carry the optional risks and the backlog of WP5_UX5_REVIEW_INT3 and WP5_UX5_RECHECK_RN
    forward, updated, for the WP5 handoff (include the secondary-button boundary of 2.05:1 in
    the light theme that WP5-CALDEF-FIX recorded).
- Return at most 250 words, beginning with your self-reported model.

## Results
