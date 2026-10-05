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
