# GOV-RECOVERY-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-RECOVERY-GATE; package GOV; kind
  gate; attempt 1; depends on GOV-RECOVERY-FREEZE.
- Scope: gate the governance fix to `handoff/delivery/check_recovery.py` (GOV-E8-AUDIT
  R1) on its freeze commit.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: `freeze_commit` is the GOV-RECOVERY-FREEZE commit, given in the dispatch
  prompt. A GOV snapshot is bound by commit, because the source digest excludes
  handoff/. Still record the source digest; it must stay
  150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.

## Gate items

1. Check the scope since dd0c7d1. The only non-record path that changed is
   `handoff/delivery/check_recovery.py`. Every other change is a handoff record under
   `handoff/delivery/` (board, checkpoint, tasks, evidence). Nothing outside
   handoff/ changed.
2. Run `check_recovery.py` on the real board: exit 0. Record the probe count, and
   compare it with the count the board recorded before the fix.
3. Copy ORCHESTRATION.json and STATE.json into the task folder, and set the copy to
   mission status `software_ready`: `next_task_id` null, no running task, every task
   done or cancelled. Run `check_recovery.py` against the copy, using the mechanism the
   GOV-RECOVERY-FIX results describe: exit 0. Then run `validate_orchestration.py`
   against the same copy and record its result; it should accept the copy.
4. Run `validate_orchestration.py` on the real board, `validate_package.py
   --preflight`, and the precommit self-test. All must exit 0.
5. Record the GOV paths, as the earlier GOV gates did, and the source digest last.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\GOV-RECOVERY-GATE`. No servers, no Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Call
  python only as the workflow Python running a script file by path:
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- Never pipe into head or tail. Never kill by PID. Never redirect to /dev/null or nul.
  Never remove anything recursively.
- If a permission check denies a call, stop and report.
- Never edit the real board or STATE.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/GOV-RECOVERY-GATE/`. Decide PASS, FAIL or NOT VERIFIED.

Return at most 120 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
