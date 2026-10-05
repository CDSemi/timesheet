# GOV-WP3P-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-WP3P-GATE; package GOV; kind gate;
  attempt 1; depends on GOV-WP3P-FREEZE. The gate for the governance change to the WP3
  prompts.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: `freeze_commit` = the GOV-WP3P-FREEZE commit (the coordinator gives the SHA in
  the dispatch prompt). Record HEAD and the source digest before and after; the digest
  must equal 4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f (prompts are
  under handoff/ and outside the digest).
- Read AGENTS.md from disk first, then docs/08 (governance scope), docs/09 (WP3 scope and
  gate, as updated by WP3-DOC) and the WP3-DOC result.
- Read-only for source and governance files. Use Node 24 by full path and
  `D:\timesheet-tmp\GOV-WP3P-GATE` for TEMP/TMP; delete only files you created; never
  remove folders recursively. If a shell call fails with ENOSPC, stop and report. Never
  write into the repository root; on Windows never redirect to /dev/null or nul from a
  POSIX shell.

## Checks (record each command and exit)

1. HEAD equals the freeze commit; the working tree is clean outside handoff/.
2. Diff scope: `git diff --name-only <freeze>^ <freeze>` lists, outside
   handoff/delivery/, only the four prompt files (WP3_IMPLEMENT.md/.vi.md,
   WP3_REVIEW.md/.vi.md).
3. Mirror check: the WP3_IMPLEMENT scope and gate sentences and the WP3_REVIEW gate
   sentence state the same requirements as docs/09 lines for WP3 scope and gate (record
   both texts, masked if needed, and a same-meaning yes/no per sentence); the VI lines say
   the same as the EN lines.
4. `validate_orchestration.py`, `check_recovery.py` and `validate_package.py --preflight`
   with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`:
   exit 0 (write `<user>` in the evidence).
5. `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`: exit 0
   (no source change expected); `npm run digest` equals the value above.
6. `git diff --check <freeze>^ <freeze>`: exit 0.

## Output

Results here and masked, LF evidence in handoff/delivery/evidence/GOV-WP3P-GATE/.
Decision PASS or FAIL with the failing check.

Return at most 100 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
