# WP5-UX-T06-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T06-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T06 (done).
- This commit freezes slice 6 of the owner-requested UI redesign: the canonical docs
  (docs/04, docs/10, docs/12, English and Vietnamese). It also carries the
  WP5-UX-T05-FREEZE results and the coordinator records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  6cbe5d6aa7fc9233b70e8ddcd82412e559c2046b. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`.** Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T06-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 6 (from WP5-UX-T06; all
modified):
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- `docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`
- `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
46a3a0c6436eb0cc2d4eb243cbff5956b0886455780444944a3cfce79a3b7abb. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T06.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T06/` (`preflight.txt`, `verify.txt`,
  `digest.txt`);
- every file in `handoff/delivery/evidence/WP5-UX-T05-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T05-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T06-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T06-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 46a3a0c6…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 46a3a0c6…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T06/` or `evidence/WP5-UX-T05-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T06: document the redesigned UI (EN and VI)

- docs:
  - docs/04 (+ vi): screens table, new sections "Timesheet sheet", "Period bar, clock
    and batch mode" and "Day editor", rewritten visual standard;
  - docs/10 (+ vi): owner decisions 2026-10-08 (UI redesign, E-1..E-7 as recommended;
    conflicting Excel formulas not reproduced);
  - docs/12 (+ vi): UI redesign release note, without release identity.
- docs(handoff): WP5-UX-T06 record and evidence; WP5-UX-T05-FREEZE results; board
  (coordinator decision on the viewing-zone contradiction) and checkpoint (+ vi).

Task: WP5-UX-T06 (owner-requested UI redesign, slice 6 of 6)
Gate: preflight PASS; verify exit 0
Audit: none yet (gate and independent audit after WP5-UX-FIX1 and GOV-SUPERSEDE)
Digest: 46a3a0c6 (was 0071a588)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
