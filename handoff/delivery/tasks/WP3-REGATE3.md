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

## Results

(Verifier appends here.)
