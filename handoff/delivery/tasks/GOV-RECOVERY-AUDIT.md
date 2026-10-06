# GOV-RECOVERY-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-RECOVERY-AUDIT; package GOV; kind
  audit; attempt 1; depends on GOV-RECOVERY-GATE (PASS).
- Scope: an independent governance audit of the `check_recovery.py` change that answers
  GOV-E8-AUDIT R1. The change makes the synthetic boards independent of the live
  mission status.
- Profile/routing: timesheet-auditor (xhigh), model opus. Routing: size S, risk M,
  novelty no.
- Fresh context: you did not author the change and ran no earlier GOV audit in this
  session.
- Language: the task record is in English. `GOV_RECOVERY_REVIEW.md` and its `.vi.md`
  follow the REVIEW form.
- Target: `reviewed_commit` is the GOV-RECOVERY-GATE `freeze_commit`, given in the
  dispatch prompt. A GOV audit is bound by commit.

## Read

- AGENTS.md from disk; docs/08, the governance and recovery sections.
- `handoff/delivery/GOV_E8_REVIEW.md`, risk R1.
- The results and evidence of GOV-RECOVERY-FIX and GOV-RECOVERY-GATE.
- `handoff/delivery/check_recovery.py` at the reviewed commit, and its diff against
  dd0c7d1. Also read `handoff/delivery/validate_orchestration.py`.

## Scope

1. **R1 is closed.**
   - No synthetic probe reads the mission status from the live board.
   - The suite passes against a `software_ready` copy of the board, and it still
     passes on the real board.
   - Reproduce both runs yourself.
2. **No weakening.**
   - Every probe that existed before the change still exists, with the same expected
     outcome. Compare the probe lists before and after.
   - The new `software_ready` probes accept a valid completed board. They reject:
     - a running task;
     - a pending required task;
     - a non-null `next_task_id`;
     - a package that is not passed.
3. **Safe default.** Any new board or state override defaults to the real paths. It
   cannot be triggered by accident in the commit checks.
4. **Scope.** Since dd0c7d1, nothing outside handoff/ changed. The source digest is
   still 150420e7….

## Runtime

- Task folder `D:\.claude-tmp\timesheet\GOV-RECOVERY-AUDIT`. No servers, no Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Call
  python only as the workflow Python running a script file by path.
- Never pipe into head or tail. Never kill by PID. Never redirect to /dev/null or nul.
  Never remove anything recursively.
- If a permission check denies a call, stop and report.
- Never edit the real board, STATE or source.

## Output

- `handoff/delivery/GOV_RECOVERY_REVIEW.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/GOV-RECOVERY-AUDIT/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed
  separately.

Return at most 150 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
