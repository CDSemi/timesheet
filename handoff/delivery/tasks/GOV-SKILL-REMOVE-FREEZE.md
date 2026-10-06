# GOV-SKILL-REMOVE-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-REMOVE-FREEZE; package GOV; kind
  commit; attempt 1; depends on GOV-SKILL-REMOVE.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L (three deletions under `.claude/`), novelty no. Records in English.
- Authority:
  - AGENTS.md rule 12;
  - the docs/08 section "Commits and pushes";
  - the board `owner_decisions`, in particular the owner's option B of 2026-10-05:
    remove the readme-md skill.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  e5576de27fb3185f22720f989e386a44b1d90488. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changes are three deletions (` D` in `git status --short`):
- `.claude/skills/readme-md/SKILL.md`;
- `.claude/skills/readme-md/references/markdown.md`;
- `.claude/skills/readme-md/references/outlines.md`.

Nothing else outside handoff/ may be changed or untracked.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/GOV-SKILL-REMOVE.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/GOV-SKILL-REMOVE/` and
    `handoff/delivery/evidence/WP4-DEC-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-DEC-FREEZE.md` (its results).

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-SKILL-REMOVE-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, and any `.md` file under `evidence/`.

## Digest order (differs from earlier freezes)

The digest script hashes the paths that `git ls-files` lists. It exits 1 while the index
still lists the deleted files. So, in this task:
1. Stage first, in one `git add` command. It names the three deleted paths and the
   handoff paths explicitly; `git add` of a deleted path stages its removal.
2. Then compute the digest with `node scripts/source-digest.mjs`, using Node 24 by
   full path.
   - There is no expected value. Record the digest and the file count.
   - The file count must be 750: the previous digest 65247d70… covered 753 files, and
     three are removed.
   - If the count is not 750, stop and report.

## Checks before committing

Run one command per step, and record each exit code:
1. `node --version`.
2. `git add` with the explicit paths, as its own command and with no redirect.
3. `git diff --cached --name-status`. Outside handoff/ it must show exactly three `D`
   lines, for the paths above.
4. The digest, as described above.
5. The precommit check.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator.
9. `check_recovery.py`.
10. `validate_package.py --preflight` with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Remove the readme-md skill from the repository

- chore(skills): remove `.claude/skills/readme-md/` (SKILL.md and two reference files),
  at the owner's choice. This reverses H-Q3 (a).
  - The audit GOV-SKILL-AUDIT had found two corrupted relative paths, unrecorded
    provenance and licence, and an obsolete HTML attribute.
  - Removing the skill resolves those findings. No other file refers to the skill.
- docs(handoff): WP4-DEC freeze result, GOV-SKILL-REMOVE records, board and
  checkpoint (+ vi).

Task: GOV-SKILL-REMOVE-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- the new digest and its file count;
- the staged count and the name-status check;
- check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/GOV-SKILL-REMOVE-FREEZE/` as `.txt` files
only. Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
