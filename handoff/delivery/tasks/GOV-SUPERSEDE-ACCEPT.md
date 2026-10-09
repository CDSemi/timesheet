# GOV-SUPERSEDE-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SUPERSEDE-ACCEPT; package GOV; kind
  commit; attempt 1; depends on GOV-SUPERSEDE-AUDIT (PASS).
- This commit records the acceptance of the governance change frozen at 831f760
  (GOV-SUPERSEDE-GATE PASS, GOV-SUPERSEDE-AUDIT PASS with no findings). It changes no
  source: only handoff records (review, gate and audit results, evidence, board,
  checkpoint).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  831f760838950a59f0e5c880f0bbefda15fe0c61. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-SUPERSEDE-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be changed, staged or untracked. Any such path stops the
commit; report it. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/GOV_SUPERSEDE_REVIEW.md` and `handoff/delivery/GOV_SUPERSEDE_REVIEW.vi.md`;
- `handoff/delivery/tasks/GOV-SUPERSEDE-GATE.md`, `handoff/delivery/tasks/GOV-SUPERSEDE-AUDIT.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/GOV-SUPERSEDE-GATE/` (seven files),
  `handoff/delivery/evidence/GOV-SUPERSEDE-AUDIT/` (twenty-two files: `.txt` logs and
  `*.py.txt` scripts) and `handoff/delivery/evidence/GOV-SUPERSEDE-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/GOV-SUPERSEDE-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-SUPERSEDE-ACCEPT/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`;
- any `.py`, `.js` or `.mjs` file under `evidence/` (scripts must be `*.py.txt`).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/GOV-SUPERSEDE-ACCEPT/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 3d274c9e…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 3d274c9e…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record or review outside `evidence/`, fix exactly those lines, re-stage the file
  and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under the listed evidence folders, replace each such token with `<email>` or
  `<user>` in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept GOV-SUPERSEDE: gate and independent audit PASS at 831f760

- docs(handoff):
  - GOV-SUPERSEDE-GATE PASS (106 probes; superseded_by scenarios accepted and rejected
    as expected) with evidence;
  - GOV-SUPERSEDE-AUDIT PASS with no findings: rules reproduced with 48 scenarios, no
    weakening (85 earlier probes kept), 27 of 30 mutants killed; optional R1 (probe
    gap) and R2 (VI wording) in the governance backlog;
  - GOV_SUPERSEDE_REVIEW (+ vi); board and checkpoint (+ vi).

Task: GOV-SUPERSEDE-ACCEPT (accept record; no source change)
Gate: GOV-SUPERSEDE-GATE PASS
Audit: GOV-SUPERSEDE-AUDIT PASS (reviewed_commit 831f760)
Digest: 3d274c9e (unchanged)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD 831f760838950a59f0e5c880f0bbefda15fe0c61 (= origin/main); post-HEAD and
  commit 5beae2f668d15fc77a39b91a91e2c8bb6195d65a; pushed yes; remote SHA the same.
- Digests: working tree before add and HEAD ls-tree after commit both
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9. Staged count 40.
- Checks (all exit 0): node 24.21.0; precommit PASS (40 files); diff --cached --check;
  JSON parse; validate_orchestration PASS; check_recovery PASS (106); validate_package
  --preflight PASS. Details in evidence/GOV-SUPERSEDE-ACCEPT/checks.txt.
- Fixes applied: none. Stop reason: none.
