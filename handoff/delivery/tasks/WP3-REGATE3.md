# WP3-REGATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REGATE3; package WP3; kind gate;
  attempt 1; depends on WP3-FIX3-FREEZE (the fix-round-3 freeze). This is the
  package-final regate that the final WP3 rechecks review.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP3-FIX3-FREEZE commit. The coordinator gives its SHA
  and the committer-checked digest in the dispatch prompt.
  - Record HEAD and the source digest **first**, before any long command, and again at
    the end. They must not change.
  - The digest of record is the one you compute on the clean export: the export's blob
    IDs, cross-checked with `git ls-tree`.
- Read AGENTS.md from disk first. Then read:
  - [WP3-GATE](WP3-GATE.md) items 1–16, [WP3-REGATE](WP3-REGATE.md) items 17–18 and
    [WP3-REGATE2](WP3-REGATE2.md) item 19, each with its results;
  - [WP3_RECHECK_BC2](../WP3_RECHECK_BC2.md), finding WP3-RBC2-01;
  - the [WP3-FIX3](WP3-FIX3.md) brief and results.
- Read-only for source, configuration, tests and governance files.
- Node 24 by full path; spawn children with `process.execPath`; workflow Python for the
  validators. Run the validators in the project folder against the live board, not in
  the export.
- Workspace:
  - Use `D:\.claude-tmp\timesheet\WP3-REGATE3` for TEMP/TMP, the clean export and all
    raw output.
  - Put only masked copies in the evidence directory.
  - Delete only files you created; never remove folders recursively.
- Shell discipline:
  - Make the first shell call a trivial `node --version`.
  - If a call fails with ENOSPC, stop and report.
  - Never open an interactive shell.
  - Never kill processes by PID.
  - Never write into the repository root.
  - Never redirect to /dev/null or nul, including `2>/dev/null`.
- Use the installed Edge channel. Use capture mode only; no real mail.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.

## Gate items (record each command, exit code and result)

1–19. Every item of WP3-GATE, WP3-REGATE and WP3-REGATE2, unchanged, on the new freeze.
- Item 18 lists the diff scope since 2f2520e1ab80ff55938b70cd469f0bfe888e04a2.
- Item 16 lists the diff scope since the WP2 acceptance commit
  3ead61edb1316fe926fe969988f595792590cd41.

20. **Round-3 tests.** The restored guard tests for WP3-RBC2-01 exist and pass. Name them:
    - the F-4 scan guard;
    - the imported-period exclusion;
    - the "off" switch saved before the deadline.

    Also name any added test for the `inactive_user`, `before_activation` or `not_due`
    skips.

    Then rerun the auditor's mutations M4, M5 and M5b, from
    `evidence/WP3-RECHECK-BC2/mutsweep.sh.txt`, in a scratch copy of the export only.
    - Each mutation must now fail the suite.
    - The unmutated export must pass.
    - Never mutate the repository.
21. **Round-3 scope.** The diff between 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714 and the
    new freeze touches only:
    - test files under tests/integration/;
    - handoff records.

    There must be no change under src/, docs/, scripts/ or configuration. List any other
    path.

## Output

- Write results in this file. Write evidence to handoff/delivery/evidence/WP3-REGATE3/:
  masked (`<email>`, `<user>`), LF, no trailing whitespace, and renders named
  `*-synthetic.png`.
- Run the precommit check over your evidence on a temporary index.
- Decision: PASS or FAIL, with every failing item. Rerun an environmental flake once and
  record both runs.
- Leave no server, browser or runner process, and no background task.

Return at most 200 words, beginning with your self-reported model.

## Attempt 2 (coordinator note): rerun item 12 only

Attempt 1 passed every source item on 49651c8. Only item 12 failed: the live-tree
preflight reported a missing translation for the untracked evidence file
`evidence/WP3-FIX3-FREEZE/result.md`. WP3-RECFIX has since renamed that file to
`result.txt` with one literal-path move; nothing was deleted and its content is
unchanged. The source and its digest are unchanged.

For attempt 2:
1. Confirm HEAD is still 49651c8 in the project folder, and that the source digest is
   still c31c300c (`npm run digest`, Node 24 by full path). Record both first.
2. Rerun item 12's three validators in the project folder against the live board:
   `validate_orchestration.py`, `check_recovery.py` and
   `validate_package.py --preflight` (workflow Python).
3. Record the exit codes in `14-item12-rerun.txt`, masked and LF.
4. Append an "Attempt 2" block with the final decision: PASS only if all three exit 0.

Do not rerun the other items, because the source has not changed. Leave no process
running.

## Results

(Verifier appends here.)

### Verifier result - attempt 1 (timesheet-verifier; self-reported model claude-sonnet-5-5; 2026-10-05)

Decision: **PASS for the source (items 1-11, 13-21); item 12 has one record-gap failure**: `validate_package.py --preflight` exits 1 on the live tree. Cause: the untracked `handoff/delivery/evidence/WP3-FIX3-FREEZE/result.md` has no `.vi.md` translation ("Missing translation"). It is not a source failure. The same preflight on the committed state (export of 49651c8) exits 0 (91 scenarios). Evidence `handoff/delivery/evidence/WP3-REGATE3/` (00-commands.txt lists every command and exit; masked, LF; renders `*-synthetic.png`). Node v24.21.0 portable by full path; clean `git archive` export of 49651c8 under `D:\.claude-tmp\timesheet\WP3-REGATE3`; capture mode only. No flake, no rerun.

- HEAD before and after: 49651c8bb91d56bf6c6966405257537ec7ca474b. Digest of record (export blob IDs of the 721 non-handoff paths): c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72. Equals the committer's digest and the `git ls-tree` form; identical at the end.
- 1 `npm ci` exit 0. 2 `npm run verify` (trace/pending deprecation): exit 0, 0 deprecation lines; 62 files, 1420 tests passed; SMOKE PASSED, 40 `PASS` lines, 0 FAIL.
- 3 `npm run test:e2e` (Edge): exit 0, 127 passed, 5 skipped (by design), 0 failed. Renders (14 dates, OT 5:00 and 7:30 = 15:30, Vietnamese labels, bounded signature, real sign date; automatic submission date, note and image variants) and hint screenshots copied; two renders viewed.
- 4 Races, 20 fresh-process rounds each: ot-leave-concurrency 20/20, finalization-concurrency 20/20, deadline-race 20/20, sharing revocation (`-t revocation`, 9 tests) 20/20.
- 5 Fault injection in the full verbose run (1420 passed): jobs-restart, delivery-crash, delivery.test, jobs.test, all passing.
- 6-10, 13-15 covered by the same full run and e2e (as in WP3-GATE).
- 11 Migrations (05-migrations.txt): fresh 1-6; v3 then 4,5,6; `integrity_check` ok, `foreign_key_check` [], user_version 6; rerun applies nothing.
- 12 LG/DF tests pass in the full run. Workflow Python (codex runtime), project folder, live board: `validate_orchestration.py` 0, `check_recovery.py` 0, `validate_package.py --preflight` 1 (record gap above; 0 in the export).
- 16 Diff since 3ead61e: src/server 52, src/client 46, src/domain 4, tests 51 (client 6, domain 3, e2e 10, integration 28, support 3 plus the deadline test), docs 18, package.json/lock, one script, one reference file, README/DEVELOPMENT (4), handoff 833 entries. Governance outside handoff/delivery: only the GOV-WP3P WP3_IMPLEMENT/WP3_REVIEW prompts (EN+VI); no AGENTS/CLAUDE/docs 08/skills change.
- 17 Earlier regression tests (B-01..03, C-01..03, RBC-01/02, `sending` branch, H-Q1 (a) setup-bound) all still pass in the full run; files as named in WP3-REGATE and WP3-REGATE2.
- 18 Scope since 2f2520e (items 18 of REGATE2 reapplied): src HistoryScreen.tsx, api.ts, settingsModel.ts, sharingModel.ts, automation.ts, history.ts, sharedActs.ts; tests settingsModel, sharingModel, automation.spec, deadline, delivery, history, review-grantee-changes; docs 05 and 10 (EN+VI); handoff. No other path.
- 19 docs/05 states the account-creation and saved-settings bounds; docs/10 has "Owner decisions - 2026-10-05 (WP3-FIX2, question H-Q1)" with H-Q1 (a); the D-09 row has no diff line; EN and VI each +5 and +6; preflight on the committed state exit 0.
- 20 Round-3 tests, all in `tests/integration/deadline.test.ts`:
  - F-4 scan guard: "finalizes nothing while the activation instant is null, even for an account whose auto-submit is on".
  - Imported-period exclusion: "never auto-submits an imported_unverified timesheet of an account whose auto-submit is on, and records no overdue state".
  - "Off" saved before the deadline: "does not mark an imported_unverified timesheet overdue when auto-submit was saved off before the deadline".
  - Added skip tests (describe "the scan re-assesses every period just before acting (guard sweep, WP3-FIX3)"): "skips the later periods of an account deactivated while the scan runs (inactive_user)", "skips a period that falls before an activation instant moved forward while the scan runs (before_activation)", "skips a period whose deadline is still ahead of the clock when it is acted on (not_due)".
  - Mutations in a scratch copy of the export (12-mutations.txt): unmutated exit 0, 1420 passed. M4 exit 1 (1 failed, the F-4 test). M5 exit 1 (1 failed, the imported test). M5b exit 1 (2 failed, the imported test and the "off" test). Each restored identical to the export (cmp). The repository was never mutated.
- 21 Scope 2d72d35..49651c8: non-handoff paths = tests/integration/deadline.test.ts only (M); everything else is under handoff/. No change under src/, docs/, scripts/ or configuration.
- Precommit check over the evidence on a temporary index: PASS, 28 files, `diff --cached --check` 0.
- Residual: the live-tree preflight record gap (add `result.vi.md` or drop the untracked evidence `.md`). No server, browser or runner left running; temporary files remain only under `D:\.claude-tmp\timesheet\WP3-REGATE3`.

### Attempt 2 - item 12 rerun (timesheet-verifier; claude-sonnet-5-5; 2026-10-05)

HEAD 49651c8bb91d56bf6c6966405257537ec7ca474b. Freeze digest c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72 (git ls-tree form; unchanged). Note: `npm run digest` in the working tree prints aab8b32c... over 724 files because it counts 3 untracked files under `.claude/skills/readme-md/` (not in the freeze). Live board: `validate_orchestration.py` 0, `check_recovery.py` 0, `validate_package.py --preflight` 0. Evidence: `evidence/WP3-REGATE3/14-item12-rerun.txt`.

Final decision: **PASS** (items 1-21).
