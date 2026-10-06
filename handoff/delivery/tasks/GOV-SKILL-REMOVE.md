# GOV-SKILL-REMOVE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-REMOVE; package GOV; kind fix;
  attempt 1; depends on WP4-DEC-FREEZE; it addresses the audit GOV-SKILL-AUDIT (FIX
  REQUIRED).
- Title: remove the readme-md skill from the repository.
- Authority: owner decision of 2026-10-05, option B, recorded verbatim in the board's
  `owner_decisions`. It reverses H-Q3 (a): remove the skill rather than fix it. Removing
  the skill resolves GOV-SKILL-01..04 and note N1 of the review
  [GOV_SKILL_REVIEW](../GOV_SKILL_REVIEW.md).
- Profile/routing: timesheet-worker, requested sonnet, no override. Effort stays at the
  profile's level, medium. Routing: size S, risk L, not novel. Records in English.
- Read AGENTS.md from disk first, then the review above.
- Baseline: main at e5576de27fb3185f22720f989e386a44b1d90488. The working tree differs
  only in handoff/.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell. Call Node 24 by its full portable path; plain `node` resolves
  v26.
- Use `D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE` for TEMP/TMP and raw output.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never write into the
  repository root.
- Do not touch the git index: no `git add`, no `git rm`. Do not commit.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Write your results into this brief with the Edit tool, not with shell heredocs.

## Required changes

1. Delete exactly these three files, each by its literal path:
   - `.claude/skills/readme-md/SKILL.md`;
   - `.claude/skills/readme-md/references/markdown.md`;
   - `.claude/skills/readme-md/references/outlines.md`.
2. Remove the two folders that are then empty with a plain, non-recursive `rmdir`:
   first `.claude/skills/readme-md/references`, then `.claude/skills/readme-md`. Never
   use `rm -r`, `rm -rf` or a glob.
3. Use the Grep tool to confirm that nothing outside handoff/ still refers to the skill
   by the name `readme-md`. Check at least:
   - AGENTS.md and CLAUDE.md;
   - docs/;
   - `README.md` and `README.vi.md`;
   - `skills-lock.json`;
   - `.agents/`;
   - `.claude/`, including the settings files (read-only).

   Report any hit. Do not edit governance files: a hit that would need an edit stops
   the task and goes to the report. Historical records under handoff/ stay unchanged.
4. Do not change anything else.

## Owned (writable) paths

- The three skill files and their two folders, for deletion only.
- This report, and `handoff/delivery/evidence/GOV-SKILL-REMOVE/`.

## Checks

- `git status --short` must show exactly the three deletions outside handoff/.
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.
- Last command, after the final change: `npm run digest`, run from Git Bash with Node 24
  first on PATH, or `node scripts/source-digest.mjs` with Node 24. Record the digest and
  the file count. The previous digest was 65247d70… over 753 files.
- Evidence goes in `handoff/delivery/evidence/GOV-SKILL-REMOVE/` as masked, LF `.txt`
  files.

Return at most 100 words, beginning with your self-reported model:
- the deletions;
- the reference search result;
- the status and preflight results;
- the new digest and file count;
- deviations.

## Results

- Deleted the three files and the two empty folders (plain rm per file, rmdir x2).
- Grep for `readme-md` outside handoff/, plus .claude, .agents, skills-lock.json: no hits.
- git status shows exactly the three ` D` entries outside handoff/. Preflight (workflow
  Python at C:\Users\<user>\...) exit 0.
- BLOCKER: `node scripts/source-digest.mjs` (Node 24.21.0) exits 1 because it hashes
  `git ls-files` paths and the index still lists the deleted files (index untouched by
  order). No new digest. Needs `git rm --cached`/commit by the committer, then rerun.
- Evidence: handoff/delivery/evidence/GOV-SKILL-REMOVE/ (status, preflight, digest).
