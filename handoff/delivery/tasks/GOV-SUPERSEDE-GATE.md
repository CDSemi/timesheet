# GOV-SUPERSEDE-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SUPERSEDE-GATE; package GOV; kind
  gate; attempt 1; depends on GOV-SUPERSEDE-FREEZE (done).
- Scope: gate the governance change frozen at
  `freeze_commit` = 831f760838950a59f0e5c880f0bbefda15fe0c61 (HEAD = origin/main): the
  audit field `superseded_by` in `handoff/delivery/validate_orchestration.py` with probes
  in `handoff/delivery/check_recovery.py`, docs/08 (+ vi), and a runtime line in the
  eight non-coordinator profiles. The brief and results of the change are in
  `handoff/delivery/tasks/GOV-SUPERSEDE-FIX.md`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- A GOV snapshot is bound by commit. Still record the source digest; it must be
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 at the start and at the
  end. You write no source; the coordinator's uncommitted `handoff/` records are
  expected.

## Gate items

1. Scope `4def605..831f760`: the only non-record paths changed are
   `handoff/delivery/validate_orchestration.py`, `handoff/delivery/check_recovery.py`,
   `docs/08_AI_WORKFLOW_AND_BUDGET.md` and `.vi.md`, and the eight profiles
   `.claude/agents/timesheet-{auditor,committer,expert,light,planner,verifier,worker,worker-high}.md`.
   `timesheet-coordinator.md` and `.claude/settings.json` are unchanged. Every other
   change is a handoff record. Record the list.
2. Profiles: the frontmatter of all nine profiles is byte-identical to `4def605` (only body
   lines changed in eight); the validator parses all nine.
3. `check_recovery.py` on the real board: exit 0; record the probe count (expected 106,
   87 before the change).
4. `validate_orchestration.py` on the real board: exit 0.
5. Scenario check on copies (the real board and STATE are never edited): copy
   ORCHESTRATION.json and STATE.json into the task folder and, with a task-folder script
   that imports `validate()` from the validator (as GOV-RECOVERY-GATE did, because
   `--board` accepts only repository-relative paths), check:
   a. Accepted: set `current_source_digest` to a new 64-hex value; add a pending audit
      `WP5-UX-AUDIT` in WP5 (profile timesheet-auditor, requested opus/xhigh, a gate
      dependency on a pending placeholder gate `WP5-UX-GATE`, `reviewed_digest` null)
      and set `superseded_by: "WP5-UX-AUDIT"` on WP5-RECHECK. Mission status `running`,
      `next_task_id` the gate. Expected: PASS.
   b. Rejected: the same copy without `superseded_by` on WP5-RECHECK. Expected: the
      stale-PASS error.
   c. Rejected: the copy of (a) with status `software_ready` while WP5-UX-AUDIT is
      pending. Expected: an error.
   Record each result and the error text.
6. `validate_package.py --preflight` and `node scripts/precommit-check.mjs --self-test`:
   exit 0.
7. The source digest LAST (must be 3d274c9e…).

## Runtime

- Task folder `D:\.claude-tmp\timesheet\GOV-SUPERSEDE-GATE`. No servers, no Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  Write scripts with the Write tool and run them by path. Call python only as the
  workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence). Call Node 24 by its full portable path; first shell
  call `node --version`.
- Never kill by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively.
- If a permission check denies a call, stop and report.
- Never edit the real board, STATE, source, docs, profiles or scripts.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence (and
any helper script as `*.py.txt`) in `handoff/delivery/evidence/GOV-SUPERSEDE-GATE/`.
Decide PASS, FAIL or NOT VERIFIED.

Return at most 120 words, beginning with your self-reported model: the decision, the
scope list, the probe count, the three scenario results, the other exit codes, the
digest and the evidence files.

## Results

Decision: **PASS** (claude-sonnet-5-5, timesheet-verifier, attempt 1). HEAD = freeze_commit
831f760838950a59f0e5c880f0bbefda15fe0c61. Evidence: `handoff/delivery/evidence/GOV-SUPERSEDE-GATE/`
(results.txt, scope.txt, profile-diffstat.txt, profile-frontmatter.txt, check_recovery.txt,
scenarios.txt, scenarios.py.txt). Node v24.21.0 portable; workflow Python under
`C:\Users\<user>\.cache\codex-runtimes\...`.

1. Scope `4def605..831f760` (31 paths): non-record paths are exactly validate_orchestration.py,
   check_recovery.py, docs/08 and .vi.md, and the eight profiles (auditor, committer, expert, light,
   planner, verifier, worker, worker-high). `timesheet-coordinator.md` and `.claude/settings.json`
   not in the list. All other paths are handoff records (ORCHESTRATION.json, checkpoint pair,
   evidence for GOV-SUPERSEDE-FIX and WP5-UX-FIX1-FREEZE, three task briefs). Full list in scope.txt.
2. Profiles: frontmatter of all nine byte-identical to 4def605; diffstat shows only +25 body lines
   in eight profiles; the validator parsed 9 profiles.
3. check_recovery.py real board: exit 0, PASS, count 106 (87 before).
4. validate_orchestration.py real board: exit 0, PASS, 284 tasks, 1 active.
5. Scenarios on copies (script imports validate(); real board/STATE untouched):
   a. ACCEPTED (PASS, 286 tasks): digest `e`*64, pending WP5-UX-GATE and WP5-UX-AUDIT, superseded_by on WP5-RECHECK.
   b. REJECTED: `Stale PASS: WP5-RECHECK`.
   c. REJECTED (software_ready): `superseded_by target must be a done PASS audit when software_ready: WP5-RECHECK`.
6. validate_package.py --preflight: exit 0 PASS. precommit-check.mjs --self-test: exit 0
   (35 path and 74 line samples, 12 rules).
7. Source digest at start and end: 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9
   (789 files). Unchanged.

Note: in scenario c the running GOV-SUPERSEDE-GATE task would also fail the ready check, but the
validator reports the superseded_by error first, which is the intended rule. No blockers.
