# GOV-SUPERSEDE-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SUPERSEDE-FREEZE; package GOV; kind
  commit; attempt 1; depends on GOV-SUPERSEDE-FIX (done).
- This is the GOV freeze commit of a governance change: the audit field `superseded_by`
  in the validator (with probes and docs/08 + vi) and a runtime line in the eight
  non-coordinator profiles. Its SHA becomes the `freeze_commit` that the GOV gate and
  the fresh GOV audit bind to. It also carries the WP5-UX-FIX1-FREEZE results and the
  coordinator records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  4def605d6bffd71b789214a03202a3122939406e. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`** (redirect to a file in the
    task folder and read it with the Read tool).
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-SUPERSEDE-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 10 (from GOV-SUPERSEDE-FIX; all
modified):
- `docs/08_AI_WORKFLOW_AND_BUDGET.md`, `docs/08_AI_WORKFLOW_AND_BUDGET.vi.md`
- `.claude/agents/timesheet-auditor.md`, `.claude/agents/timesheet-committer.md`,
  `.claude/agents/timesheet-expert.md`, `.claude/agents/timesheet-light.md`,
  `.claude/agents/timesheet-planner.md`, `.claude/agents/timesheet-verifier.md`,
  `.claude/agents/timesheet-worker.md`, `.claude/agents/timesheet-worker-high.md`

`.claude/agents/timesheet-coordinator.md` must NOT be changed. Report which paths are
actually changed. Any other changed or untracked path outside handoff/ stops the commit.
If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Modified files:
- `handoff/delivery/validate_orchestration.py` and `handoff/delivery/check_recovery.py`
  (governance scripts from GOV-SUPERSEDE-FIX);
- `handoff/delivery/tasks/WP5-UX-FIX1-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

New files:
- `handoff/delivery/tasks/GOV-SUPERSEDE-FIX.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/GOV-SUPERSEDE-FIX/` (eleven `.txt` files,
  including `repro_superseded.py.txt`);
- every file in `handoff/delivery/evidence/WP5-UX-FIX1-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-SUPERSEDE-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/GOV-SUPERSEDE-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 3d274c9e…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`, the new
   version) on the real board.
8. `check_recovery.py` (the new version). Record its probe count (expected 106).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 3d274c9e…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/GOV-SUPERSEDE-FIX/` or `evidence/WP5-UX-FIX1-FREEZE/`, replace each
  such token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun
  the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  docs, profiles, scripts or source.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze GOV-SUPERSEDE: superseded_by for historical audit passes

- chore(workflow):
  - validate_orchestration.py: optional audit field `superseded_by`; a superseded done
    PASS keeps counting for dependencies, is exempt from the stale-PASS check, must name
    a later same-package audit with a different digest and no chain; software_ready
    requires every target to be a done PASS;
  - check_recovery.py: 19 new probes (87 -> 106);
  - docs/08 (+ vi): describe `superseded_by`;
  - eight non-coordinator profiles: runtime line against stdin-fed scripts and head/tail
    pipes (frontmatter unchanged).
- docs(handoff): GOV-SUPERSEDE-FIX record and evidence; WP5-UX-FIX1-FREEZE results;
  board and checkpoint (+ vi).

Task: GOV-SUPERSEDE-FIX (governance change for the WP5 UI redesign round)
Gate: none yet (GOV-SUPERSEDE-GATE and a fresh GOV audit follow)
Digest: 3d274c9e (was 2565b1e8)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
