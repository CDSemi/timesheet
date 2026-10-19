# WP5-UX3-GOV2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV2-FREEZE; package GOV; kind
  commit; attempt 1; depends on WP5-UX3-GOV2 (done).
- This is the GOV freeze of the owner's new AGENTS.md text, with the owner's edits and the
  AGENTS.vi.md translation (WP5-UX3-GOV2; owner answer WP5-UX3-Q7).
- It also carries the coordinator records since a78ada5:
  - the FIX3-FREEZE results and evidence;
  - the usage pause and resume;
  - the reconciliation;
  - the owner question and its answer;
  - the REGATE2, AUDIT-A2 and AUDIT-B2 briefs and the AUDIT-INT brief. They still name
    a78ada5 and are retargeted after this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, and the docs/08 sections "Commits and pushes" and
  "Governance scope". AGENTS.md and AGENTS.vi.md are governance paths: this is their GOV
  freeze commit, and a gate and a fresh audit follow.
- Branch: main.
  - Expected HEAD = origin/main = a78ada5edbf5339d4502df57e9f195d11c0b5d28.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue. Otherwise stop and report.
  - Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe`, and never open an interactive shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN INTO A SCRATCH FILE), NO `| node`, NO `| python`, NO `node -e`, NO
    `python -c`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm -r`.**
  - Redirect output to a file in the task folder and read it with the Read tool.
  - Write files with the Write tool.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`,
    in the same shell call as your first `node --version`. It must print v24.x.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-GOV2-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (2 modified paths)

`AGENTS.md` and `AGENTS.vi.md` only.

Any other path outside `handoff/` stops the commit. That includes CLAUDE files, `.claude/`,
docs, `src/`, `tests/` and `scripts/`.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (8):**
  - `handoff/NEXT_ACTION.md` and `.vi.md`;
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX3-FREEZE.md`.
- **New task records (5):**
  - `handoff/delivery/tasks/WP5-UX3-REGATE2.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-A2.md`;
  - `handoff/delivery/tasks/WP5-UX3-AUDIT-B2.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV2.md`;
  - this brief, as it stands before you append results.
- **New evidence:**
  - `handoff/delivery/evidence/WP5-UX3-FIX3-FREEZE/`, 2 files;
  - `handoff/delivery/evidence/WP5-UX3-GOV2/`, 4 files.

  Count each folder with Glob first. Stage a folder only if every name ends in `.txt`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX3-GOV2-FREEZE/`
stay unstaged.

**Rules carried over from the earlier freeze briefs:**
- A privacy `profile-path` finding in an evidence log may be masked: replace the account
  segment with `<user>`, then re-stage. Any other privacy finding stops the commit.
- For other modified tracked handoff files: record their names. A line-ending-only change
  stays unstaged. A content change stops the commit.
- Any other changed or untracked path stops the commit.

## Checks before committing

Record each exit code. Save the masked output of each step in
`handoff/delivery/evidence/WP5-UX3-GOV2-FREEZE/checks.txt` (required).

1. `node --version`.
2. HEAD and origin/main.
3. The working-tree digest (b35dddd5…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`; record its file count.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in AGENTS.md or AGENTS.vi.md: stop and report.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Adopt the owner's AI instruction header in AGENTS.md

- docs(governance):
  - AGENTS.md gains the owner's "AI Instruction" title, Operating Contract and Prime
    Directive;
  - the runbook line follows the `.vi.md` translation convention;
  - phrases from another project are removed ("shop-floor", "step type", "task mode",
    "probe kind", "template variable", "manifest key", "CI run"; "CI evidence" becomes
    "recorded evidence");
  - "Project instructions" becomes a second-level heading;
  - items 1-13 and the UI section are unchanged;
  - AGENTS.vi.md gets the matching translation.
- docs(handoff):
  - the FIX3 freeze results;
  - the usage pause and resume;
  - the reconciliation;
  - owner question WP5-UX3-Q7 and its answer;
  - the GOV2 record and evidence;
  - the regate and recheck briefs;
  - board, state, next action and checkpoint (+ vi).

Task: WP5-UX3-GOV2 (owner answer WP5-UX3-Q7)
Gate: WP5-UX3-GOV2-GATE pending
Audit: WP5-UX3-GOV2-AUDIT pending
Digest: b35dddd5 (was d1d903cf)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group;
- every check with its exit code;
- any fix, masking or stop reason.

## Results

- Model: Self-reported claude-sonnet-5-5. Node v24.21.0.
- Pre-HEAD = origin/main = a78ada5edbf5339d4502df57e9f195d11c0b5d28.
- Commit ceb86b6b18bd0e8fabd93f47672cd87f3899b92f; pushed; remote SHA the same.
- Digest before add: b35dddd5... (833 files); git ls-tree digest of new HEAD: b35dddd5... (833).
- Staged: 21 (2 governance, 8 modified handoff, 5 new task records, 6 evidence files).
- Exit codes: add 0, precommit-check 0 (21 files, 0 findings), diff --cached --check 0,
  JSON parse 0, validate_orchestration 0, check_recovery 0, validate_package --preflight 0,
  commit 0, dry-run 0, push 0.
- No fix, masking or stop. Evidence in evidence/WP5-UX3-GOV2-FREEZE/ (unstaged).
