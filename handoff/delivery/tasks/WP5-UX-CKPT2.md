# WP5-UX-CKPT2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-CKPT2; package WP5; kind commit;
  attempt 1; depends on WP5-UX-REGATE3 (PASS) and WP5-UX-AUDIT-A4 (PASS).
- This is a checkpoint commit before a planned stop (owner question WP5-UX-Q1). It
  changes no source. It stores every coordinator record written since edaaa85: the
  WP5-UX-REGATE3 results and evidence, the WP5-UX-AUDIT-A4 (PASS) and WP5-UX-AUDIT-B4
  (FIX REQUIRED) reviews and evidence, the WP5-UX-FIX5-FREEZE results, the pending
  WP5-UX-FIX6 brief, the board, the checkpoint pair and NEXT_ACTION (+ vi).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M (many evidence files), risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  edaaa852370128ca9bdf206d730f3849346ba994. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
    Read tool.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call; make the first shell call a trivial
    `node --version` (must be v24.x), and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-CKPT2` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be changed, staged or untracked. Any such path stops the
commit; report it. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/WP5_UX_REVIEW_A4.md`, `handoff/delivery/WP5_UX_REVIEW_A4.vi.md`,
  `handoff/delivery/WP5_UX_REVIEW_B4.md`, `handoff/delivery/WP5_UX_REVIEW_B4.vi.md`;
- `handoff/delivery/tasks/WP5-UX-REGATE3.md`, `WP5-UX-AUDIT-A4.md`, `WP5-UX-AUDIT-B4.md`,
  `WP5-UX-FIX6.md` (all under `handoff/delivery/tasks/`);
- this brief, as it stands before you append results;
- every file in these evidence folders under `handoff/delivery/evidence/`:
  `WP5-UX-REGATE3/`, `WP5-UX-AUDIT-A4/`, `WP5-UX-AUDIT-B4/`, `WP5-UX-FIX5-FREEZE/`.
  Report the file count per folder and list every `.png` by name.

Modified files:
- `handoff/delivery/tasks/WP5-UX-FIX5-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
- `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX-CKPT2/` stay
unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`;
- any `.js`, `.mjs`, `.ts`, `.sh` or `.py` file under `evidence/` (scripts must end in
  `.txt`).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-CKPT2/checks.txt`.
1. `node --version` (v24.x).
2. The working-tree digest (must be b7bbcbc0…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be b7bbcbc0…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record or review outside `evidence/`, fix exactly those lines, re-stage the file
  and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  file under the listed evidence folders, replace each such token with `<email>` or
  `<user>` in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Checkpoint WP5 UX round: regate3 PASS, area A PASS, owner question on area B

- docs(handoff):
  - WP5-UX-REGATE3 PASS on edaaa85 (digest b7bbcbc0; e2e 170/0/16; drill 208/0) with
    evidence;
  - WP5-UX-AUDIT-A4 PASS (FIX5 delta changes no saved data; area A current on
    b7bbcbc0) review (+ vi) and evidence;
  - WP5-UX-AUDIT-B4 FIX REQUIRED (B4-01 focus ring contrast, B4-02 ISO due time in the
    zone note) review (+ vi) and evidence;
  - pending WP5-UX-FIX6 brief; owner question WP5-UX-Q1 on the board, in NEXT_ACTION
    (+ vi) and the checkpoint (+ vi); FIX5-FREEZE results.

Task: WP5-UX-CKPT2 (checkpoint commit; no source change)
Gate: WP5-UX-REGATE3 PASS
Audit: WP5-UX-AUDIT-A4 PASS; WP5-UX-AUDIT-B4 FIX REQUIRED
Digest: b7bbcbc0 (unchanged)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count (per folder);
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
