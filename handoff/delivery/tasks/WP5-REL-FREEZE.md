# WP5-REL-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-REL-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-REL.
- This commit is the WP5 package-final freeze. WP5-GATE gates it, and WP5-FINAL-AUDIT
  and WP5-ASSESS-A attempt 2 review it. It holds:
  - the release notes;
  - the runbook pilot sections;
  - the WP5 pre-gate handoff;
  - the closing briefs.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  8e99d2c6375f71ac94faff9eb859b9b7bcf3e741. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin.** Never pipe into head or
    tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-REL-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these, all from WP5-REL:
- `docs/12_RELEASE_NOTES.md` and `.vi.md` (new);
- `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`;
- `README.md` and `README.vi.md`.

Any other changed or untracked path outside handoff/ stops the commit. In particular,
nothing under `src/`, `tests/`, `scripts/`, migrations, `.claude/`, `reference/`,
`package.json`, `package-lock.json`, `.env.example`, `compose.example.yaml`, AGENTS.md
or CLAUDE.md may change. If anything is already staged before you start, report it
first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba (779 files).

## Handoff files to stage

New files:
- `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
- `handoff/delivery/tasks/WP5-GATE.md`, `WP5-PILOT.md` and `WP5-FINAL-AUDIT.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-AC13-FREEZE/` and
  `handoff/delivery/evidence/WP5-REL/`.

Modified files:
- `handoff/delivery/tasks/WP5-AC13-FREEZE.md`, `WP5-REL.md` and `WP5-ASSESS-A.md`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-REL-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-REL-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check. It must inspect the staged docs, so record its file count.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Also use the Grep tool on the staged docs for an `@` outside `example.invalid`,
`<email>` or placeholder syntax, and for any host name that is not a placeholder.
Record the count, and never print a match.

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

Subject: Add release notes and the pilot activation, deactivation and rollback runbook

- docs(release): new docs/12 release notes (+ vi). They give the release identity,
  the scope by package, known limits and carried risks, and the readiness, permission
  and outcome separation.
- docs(ops): docs/11 (+ vi) gains new sections for pilot activation, deactivation, a
  rollback card for the first installation, and pilot operator notes. Owner decisions
  D-1..D-15 are marked as recommended and pending.
- docs: a README link to docs/12 (+ vi).
- docs(handoff):
  - the WP5 pre-gate handoff (+ vi);
  - the WP5-GATE, WP5-PILOT and WP5-FINAL-AUDIT briefs, and the WP5-ASSESS-A
    attempt-2 note;
  - the WP5-AC13-FREEZE results;
  - board, STATE and checkpoint (+ vi).

Task: WP5-REL-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope and privacy Grep checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
