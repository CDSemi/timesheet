# WP3-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REGATE; package WP3; kind gate;
  attempt 1; depends on WP3-FIX-FREEZE (the fix-round freeze). This is the package-final
  regate that the WP3 rechecks review.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP3-FIX-FREEZE commit. The coordinator gives the SHA and
  the committer-checked digest in the dispatch prompt.
  - Record HEAD and the source digest **first**, before any long command, and again at
    the end. They must not change.
  - The digest of record is the one you compute on the clean export.
- Read AGENTS.md from disk first. Then read:
  - [WP3-GATE](WP3-GATE.md), including its results; your gate items are its items 1–16;
  - the reviews WP3_REVIEW_A.md, WP3_REVIEW_B.md and WP3_REVIEW_C.md;
  - the WP3-FIXB and WP3-FIXC results;
  - the fix-round section of `handoff/delivery/WP3_HANDOFF.md`.
- Constraints:
  - Read-only for source, configuration, tests and governance files.
  - Node 24 by full path; spawn children with `process.execPath`; the workflow Python for
    the validators.
- Environment rules:
  - Use `D:\timesheet-tmp\WP3-REGATE` for TEMP/TMP and the clean export, outside
    Dropbox.
  - Delete only files you created; never remove folders recursively.
  - Make the first shell call a trivial `node --version`. If a call fails with ENOSPC,
    stop and report.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul,
    including `2>/dev/null`.
  - Use the installed Edge channel; no browser download.
  - Capture mode only; no real mail.
- If a permission check denies a call, stop and report; do not retry or rephrase it.

## Gate items (record each command, exit code and result)

1–16. Every item of WP3-GATE, unchanged, on the new freeze:
- item 2 records the test count and the smoke `PASS` count;
- item 16 lists the diff scope since a1cd566e59253d19f53cfd5b3a81fd27a7e9a056 (the first
  WP3 freeze) as well as since the WP2 acceptance commit.

17. **Fix regressions.** The regression tests for WP3-B-01..03 and WP3-C-01..03 exist and
    pass. Name each test and its file. Also check that:
    - the C-01 test proves the reviewed hash is the same with the hint shown and hidden;
    - the B-02 test covers a crash during the final permitted attempt.

18. **Fix scope.** The diff between a1cd566 and the new freeze touches only:
    - the paths reported by WP3-FIXB and WP3-FIXC;
    - handoff records.

    List any other path.

## Output

- Results go in this file; evidence in handoff/delivery/evidence/WP3-REGATE/.
  - Evidence is masked (`<email>`, `<user>`), LF, with no trailing whitespace.
  - Renders and screenshots are named `*-synthetic.png` only.
  - Run the precommit check over your evidence on a temporary index.
- Decision: PASS or FAIL, with every failing item. An environmental flake is rerun once
  and recorded.
- Leave no server, browser or runner process, and no background task.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
