# WP3-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REGATE2; package WP3; kind gate;
  attempt 1; depends on WP3-FIX2-FREEZE (the fix-round-2 freeze). This is the
  package-final regate that the round-2 rechecks review.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP3-FIX2-FREEZE commit; the coordinator gives the SHA and
  the committer-checked digest in the dispatch prompt.
  - Record HEAD and the source digest **first**, before any long command, and again at
    the end; they must not change.
  - The digest of record is the one you compute on the clean export (export blob IDs,
    cross-checked with `git ls-tree`).
- Read AGENTS.md from disk first. Then read:
  - [WP3-GATE](WP3-GATE.md) items 1–16 and [WP3-REGATE](WP3-REGATE.md) items 17–18, with
    their results;
  - [WP3_RECHECK_BC](../WP3_RECHECK_BC.md) and [WP3_RECHECK_A](../WP3_RECHECK_A.md);
  - the [WP3-FIX2](WP3-FIX2.md) brief and results;
  - the fix-round-2 section of `handoff/delivery/WP3_HANDOFF.md`.
- Constraints:
  - Read-only for source, configuration, tests and governance files.
  - Node 24 by full path; spawn children with `process.execPath`.
  - Use the workflow Python for the validators.
- Workspace and shell:
  - Use `D:\.claude-tmp\timesheet\WP3-REGATE2` for TEMP/TMP and the clean export,
    outside Dropbox. Write raw command output only there, and put only masked copies in
    the evidence directory. Delete only files you created; never remove folders recursively.
  - Make the first shell call a trivial `node --version`. If a call fails with ENOSPC,
    stop and report.
  - Never open an interactive shell, and never kill processes by PID.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
  - Use the installed Edge channel. Capture mode only; no real mail.
- If a permission check denies a call, stop and report; do not retry or rephrase it.

- **Where to run the validators.** Run `validate_orchestration.py`, `check_recovery.py`
  and `validate_package.py --preflight` in the project folder, against the live board
  and handoff state. Do not run them in the export. The committed board at 2d72d35
  names a task brief (tasks/WP3-FIX2-FREEZE.md) that was left out of that commit; it
  will be committed with the next handoff commit. Record this as a known record gap,
  not a source failure.

## Gate items (record each command, exit code and result)

1–16. Every item of WP3-GATE, unchanged, on the new freeze:
- item 2 records the test count and the smoke `PASS` count;
- item 16 lists the diff scope since the WP2 acceptance commit
  3ead61edb1316fe926fe969988f595792590cd41.

17. **Regression tests.** The tests for WP3-B-01..03 and WP3-C-01..03 still pass. The
    round-2 tests exist and pass:
    - WP3-RBC-01: the server flags actor-less events, and the client labels them;
    - WP3-RBC-02: a grantee edit made before the period start is counted;
    - the direct test of the send handler's `sending` branch;
    - H-Q1 (a): a never-configured account is never auto-finalized; an account that
      saves settings mid-period is handled; the explicit overdue choice still works.

    Name each test and its file.
18. **Fix scope.** The diff between 2f2520e1ab80ff55938b70cd469f0bfe888e04a2 and the new
    freeze touches only:
    - the paths reported by WP3-FIX2;
    - docs/05 and docs/10 (EN and VI);
    - handoff records.

    List any other path.
19. **Canonical documents.**
    - docs/05 "Deadline and recovery" states the account-creation and setup bounds.
    - docs/10 has an "Owner decisions — 2026-10-05" entry for H-Q1 (a).
    - The D-09 row is unchanged.
    - EN and VI match.
    - `validate_package.py --preflight` exits 0.

## Output

- Results go in this file. Evidence goes in handoff/delivery/evidence/WP3-REGATE2/:
  masked (`<email>`, `<user>`), LF, no trailing whitespace, renders named
  `*-synthetic.png`.
- Run the precommit check over your evidence on a temporary index.
- Decision: PASS or FAIL, with every failing item. Rerun an environmental flake once and
  record it.
- Leave no server, browser or runner process, and no background task.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)

### Verifier result - attempt 1 (timesheet-verifier; self-reported model claude-sonnet-5-5; 2026-10-05)

Decision: **PASS** (items 1-19). Evidence `handoff/delivery/evidence/WP3-REGATE2/` (00-commands.txt lists every command and exit; masked, LF; renders `*-synthetic.png`). Node v24.21.0 portable by full path; clean `git archive` export of 2d72d35 under `D:\.claude-tmp\timesheet\WP3-REGATE2`; capture mode only. No flake, no rerun.

- HEAD before and after: 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714. Digest of record (computed on the export: git blob IDs of the 721 non-handoff files): 0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92. Equals the committer's digest and the `git ls-tree` form; identical at the end.
- 1 `npm ci` exit 0. 2 `npm run verify` (trace/pending deprecation): exit 0, 0 deprecation lines; 62 files, 1416 tests passed; SMOKE PASSED with 40 `PASS` lines, 0 FAIL.
- 3 `npm run test:e2e` (Edge): exit 0, 127 passed, 5 skipped (by design), 0 failed; renders and hint screenshots copied and viewed.
- 4 Races, 20 fresh-process rounds each: ot-leave-concurrency 20/20, finalization-concurrency 20/20, deadline-race 20/20, sharing revocation race (`-t revocation`, 9 tests) 20/20.
- 5 Fault injection in the full verbose run (1416 passed): jobs-restart, delivery-crash (kill before `sending`; after `sending` -> uncertain, restart sends nothing, decision route), delivery.test (never retried, one explicit resend, duplicate job once), jobs.test (lease refused to a second claimant).
- 6-10, 13-15: covered by the same full run, e2e and renders (14 dates, OT 5:00 and 7:30 = 15:30, Vietnamese labels, bounded signature, manual real sign date, automatic submission date, note only when on, empty period 0:00).
- 11 Migrations (05-migrations.txt): fresh 1-6; v3 then 4,5,6; `integrity_check` ok, `foreign_key_check` [], user_version 6; rerun applies nothing.
- 12 LG-01..LG-10 and DF-01..DF-16 present and passing. Workflow Python (project folder, live board): `validate_orchestration.py` 0, `check_recovery.py` 0, `validate_package.py --preflight` 0 (PASS, 91 scenarios). Known record gap: the committed board names tasks/WP3-FIX2-FREEZE.md, left out of 2d72d35 (not a source failure).
- 16 Diff since 3ead61e (878 entries incl. handoff): src/server 52, src/client 46, src/domain 4, tests 50, docs 18 (EN+VI), package.json/lock, one script, one reference file, README/DEVELOPMENT, handoff. Governance: only the GOV-WP3P WP3_IMPLEMENT/WP3_REVIEW prompts (EN+VI); no AGENTS/CLAUDE/docs 08/skills change.
- 17 Regression tests, all pass:
  - B-01 `tests/integration/deadline.test.ts` account creation bound (4); B-02 `tests/integration/delivery.test.ts` last-attempt crash (1); B-03 `tests/client/otModel.test.ts` (2) and `tests/client/sharingModel.test.ts`; C-01 `tests/integration/review-grantee-changes.test.ts`, `tests/client/granteeChangesModel.test.ts`, `tests/e2e/sharing.spec.ts`; C-02 `tests/integration/history.test.ts` and `sharingModel.test.ts`; C-03 comment-only.
  - WP3-RBC-01: `history.test.ts` "WP3-RBC-01: every event without an actor is a system event ..."; `sharingModel.test.ts` "labels every event the server flags as a system event as automatic ..."; `automation.spec.ts` asserts the badge.
  - WP3-RBC-02: `review-grantee-changes.test.ts` two tests ("lists a grantee change made before the period started ..." and "counts a change made before the period started only until the owner finalizes the period").
  - `sending` branch: `delivery.test.ts` "the send handler meets an attempt that is still `sending`" > "marks the attempt uncertain and stops the job for good ...".
  - H-Q1 (a): `deadline.test.ts` "setup bound" (5): never automates an account that never saved settings at and after every deadline; mid-period save automates only later deadlines; explicit apply-to-overdue choice kept and clamped by creation; first save without the choice never reaches earlier periods; auto-submit off still records overdue, never-saved records nothing. `settingsModel.test.ts` wording.
- 18 Fix scope 2f2520e..2d72d35: 7 src (HistoryScreen.tsx, api.ts, settingsModel.ts, sharingModel.ts, automation.ts, history.ts, sharedActs.ts), 7 tests, docs 05 and 10 (EN+VI), handoff records (tasks, evidence, WP3_HANDOFF and RECHECK_A/BC EN+VI, ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT). No other path.
- 19 docs/05 "Deadline and recovery" states the account-creation and the saved-settings bounds; docs/10 has "Owner decisions - 2026-10-05 (WP3-FIX2, question H-Q1)" with H-Q1 (a); the D-09 row is unchanged (no diff line); EN and VI added in step (5+5 and 6+6 lines); preflight exit 0 (65 pairs checked, 1266 links).
- Precommit check over the evidence on a temporary index: PASS, 24 files, `diff --cached --check` 0.
- Residual: none open. No server, browser or runner left running; temporary files remain only under `D:\.claude-tmp\timesheet\WP3-REGATE2`.
