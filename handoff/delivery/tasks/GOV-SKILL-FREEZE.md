# GOV-SKILL-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-FREEZE; package GOV; kind
  commit; attempt 1. It depends on WP3-ACCEPT. Owner decision H-Q3 (a), 2026-10-05: the
  owner added the skill `.claude/skills/readme-md/` and keeps it in the repository.
  `.claude/` is a governance path, so the skill goes through freeze, gate and a fresh
  audit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (governance path), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions` (H-Q3).
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main = the
  WP3-ACCEPT commit; the coordinator gives the SHA in the dispatch prompt. If either
  differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here. Make the
    first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell. Never kill processes by PID.

## Expected working-tree set

Outside handoff/, the only new paths may be these three untracked files, with their
content exactly as the owner left it:
- `.claude/skills/readme-md/SKILL.md`
- `.claude/skills/readme-md/references/markdown.md`
- `.claude/skills/readme-md/references/outlines.md`

No other path outside handoff/ may change. That includes `.claude/settings.json`,
`.claude/agents/`, other skills, AGENTS.md, CLAUDE.md, docs/ and src/.

Handoff files to stage:
- New: every file under handoff/delivery/evidence/WP3-ACCEPT/.
- Modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/STATE.json (active package WP4);
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/tasks/WP3-ACCEPT.md (its results);
  - this brief, staged as it stands before you append results. It was committed
    earlier, so it is already tracked.

Your appended results and your evidence in handoff/delivery/evidence/GOV-SKILL-FREEZE/
stay unstaged. Any other changed or untracked path stops the commit; report it.

## Checks before committing

Run one command per step with Node 24 by full path, and record each exit code:
1. `node --version`.
2. `npm run digest`. Record the value; it is the new digest of record that includes the
   skill. The gate confirms it.
3. `git add` with the explicit paths, as its own command.
4. The precommit check. It must report no secret, credential, personal data, email
   address or user-profile path in the three skill files.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

With the Read tool, confirm that `SKILL.md` starts with a YAML frontmatter block that
has `name` and `description`. Do not print the skill bodies through the shell.

If `git diff --cached --check` flags only a blank line at EOF in a task record, remove
exactly that line and re-stage. If a whitespace or EOF problem is in a skill file, do
not edit it: stop and report, because the skill is the owner's content.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it. Never write into the repository root, and never redirect to /dev/null or
nul. Keep evidence LF, free of trailing whitespace, with a single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the owner's readme-md skill under governance review

- chore(skills): add .claude/skills/readme-md (SKILL.md and two reference files) as
  supplied by the owner (decision H-Q3 (a), 2026-10-05)
- docs(handoff): GOV-SKILL freeze, gate and audit briefs; board and checkpoint (+ vi)

Task: GOV-SKILL-FREEZE

## Push and report

Push per the profile. Append to this brief:
- the HEAD before and after;
- the commit SHA, whether it was pushed, and the remote SHA;
- the new digest and the staged count;
- the exit code of each check;
- any blockers.

Write evidence to handoff/delivery/evidence/GOV-SKILL-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
