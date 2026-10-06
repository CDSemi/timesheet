# WP5-FIXD2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXD2-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-FIXD2.
- This commit freezes the one-sentence status wording fix in docs/11. It also carries
  the WP5-REGATE results and the closing briefs.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  9bcdd88faf782be4f16c139e29d07d279d2609e3. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-FIXD2-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be `docs/11_OPERATIONS_RUNBOOK.md` and
`.vi.md`, from WP5-FIXD2. Any other changed or untracked path outside handoff/ stops the
commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-REGATE.md`, `WP5-FIXD2.md`, `WP5-REGATE2.md`,
  `WP5-PKTID.md` and `WP5-RECHECK.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-FIXD-FREEZE/`,
  `handoff/delivery/evidence/WP5-REGATE/` and `handoff/delivery/evidence/WP5-FIXD2/`.

Modified files:
- `handoff/delivery/tasks/WP5-FIXD-FREEZE.md`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-FIXD2-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-FIXD2-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check. Record its file count.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace each such token with `<email>` or `<user>` in that file only, then
  re-stage and rerun.

When to stop:
- A block in a docs file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Say what the operations status shows instead of a sending flag

- docs(ops) (WP5-F-01 remainder): docs/11 (+ vi) line 274 now says the administrator
  status shows whether a sender address is configured and the outbound mode. The
  sending flag lives only in the env file.
- docs(handoff):
  - WP5-REGATE PASS on 9bcdd88, including AC-13 under real time zones;
  - the WP5-FIXD-FREEZE results;
  - the WP5-REGATE2, WP5-PKTID and WP5-RECHECK briefs;
  - board, STATE and checkpoint (+ vi).

Task: WP5-FIXD2-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 120 words, beginning with your self-reported model.

## Results

(Committer appends here.)
