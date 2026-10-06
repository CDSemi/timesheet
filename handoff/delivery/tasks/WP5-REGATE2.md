# WP5-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-REGATE2; package WP5; kind gate;
  attempt 1; depends on WP5-FIXD2-FREEZE.
- Scope: a docs-delta gate on the WP5-FIXD2 freeze. WP5-FIXD2 changed only status
  wording in documentation. WP5-REGATE ran the full gate on 9bcdd88. This gate proves
  three things:
  - the delta since 9bcdd88 is documentation only;
  - the application content is byte-identical;
  - the release still installs, builds and verifies cleanly.

  It then fixes the digest of record for the new freeze. A documentation-only delta
  does not need the drill and e2e repeated. State that in the results, with the
  evidence.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Target: `freeze_commit` is the WP5-FIXD2-FREEZE commit, given in the dispatch prompt.

## Gate items

1. Run `git diff --stat 9bcdd88 <freeze> -- . ':!handoff'`. The only changed paths
   may be the documentation files in the WP5-FIXD2 results. If any `src/`, `tests/`,
   `scripts/`, migration, `package*.json`, Dockerfile, Compose or example file
   changed, the gate fails.
2. Make a clean export of the freeze. Run `npm ci`; the lockfile must stay unchanged
   and no deprecation line may appear. Then `npm run lint` and `npm run verify`. Then
   `npm run build` twice, from this export and from a clean export of 9bcdd88.
   Compare the SHA-256 of every `dist/` file; they must be identical.
3. Run AC-13 once, alone.
4. Grep docs/05, 07, 11 and 12, README and the pilot packet, EN and VI, for any claim
   that the administrator status, screen or operations JSON shows the sending flag.
   The count must be 0. Also check that the WP5-REGATE fixed lines still hold.
5. Run `npm audit --omit=dev`, the precommit check, and `validate_package.py
   --preflight`, the orchestration validator and `check_recovery.py`. Run each Python
   script by its path with the workflow Python.
6. Compute the digest of record last: repository, `git ls-tree` form and the clean
   export must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-REGATE2`. Ports 47740–47759, with
  `SMOKE_PORT` in that range. No Docker.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-REGATE2/`. Decide PASS, FAIL or NOT VERIFIED. Leave
nothing running.

Return at most 150 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
