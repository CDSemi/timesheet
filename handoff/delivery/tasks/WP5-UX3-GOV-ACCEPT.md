# WP5-UX3-GOV-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV-ACCEPT; board package GOV; kind
  commit; attempt 1; depends on WP5-UX3-GOV-AUDIT (PASS) and WP5-UX3-GOV-GATE (PASS).
- This accept commit records the governance acceptance of the owner-requested AGENTS.md UI
  section change (WP5-UX3-GOV-AUDIT PASS on 79b9a53) and the coordinator records since
  79b9a53. Handoff files only; no source or governance file.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 79b9a53c13b1542877a587dd0ca00fe295d1f8b6.
  If HEAD is a descendant whose extra commits touch only `handoff/`, report each and
  continue; otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the Read
    tool. To check Node, run `node --version` and nothing else.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call; first shell call `node --version`
    (v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-GOV-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working tree

Nothing outside `handoff/` may be changed or untracked; any such path stops the commit.
Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) before `git add`: it
must equal a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files),
and the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (28)

- modified (9):
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV-GATE.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV-AUDIT.md`;
- new (4):
  - `handoff/delivery/GOV_UX3_REVIEW.md` and `handoff/delivery/GOV_UX3_REVIEW.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-T01.md` (the next slice's brief);
  - this brief, as it stands before you append results;
- new evidence (15): `handoff/delivery/evidence/WP5-UX3-GOV-FREEZE/commit-message.txt`,
  `handoff/delivery/evidence/WP5-UX3-GOV-GATE/checks.txt`, and every file in
  `handoff/delivery/evidence/WP5-UX3-GOV-AUDIT/` (13 `.txt`).

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX3-GOV-ACCEPT/`
stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other
changed or untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`,
`.eml`, `.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any
`.md` under `evidence/`; any evidence file not ending `.txt`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-GOV-ACCEPT/checks.txt` (this file is required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (a682f153…, 817 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (a682f153…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). Mask only as your profile
allows; otherwise do not commit and report. If a permission check denies a call, stop at
once. Do not print diffs, file bodies or matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept WP5-UX3-GOV: modern style standard in AGENTS.md

- docs(handoff): record the governance acceptance of the AGENTS.md / AGENTS.vi.md UI
  section change (owner request U-01, answer G-1 b): gate WP5-UX3-GOV-GATE PASS and the
  fresh independent audit WP5-UX3-GOV-AUDIT PASS on 79b9a53 (review GOV_UX3_REVIEW.md and
  .vi.md, no findings; risks R1-R3 folded into the next slice brief, R4-R6 in the
  governance backlog); the freeze, gate and audit records and evidence; the WP5-UX3-T01
  brief; board, STATE, checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX3-GOV-ACCEPT
Gate: WP5-UX3-GOV-GATE PASS (79b9a53)
Audit: WP5-UX3-GOV-AUDIT PASS (fresh opus, 79b9a53)
Digest: a682f153 (unchanged)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix or stop reason.

## Results

- Model: claude-sonnet-5-5. Node: v24.21.0 (Node 24 path first on PATH).
- Pre-HEAD 79b9a53c13b1542877a587dd0ca00fe295d1f8b6 (= origin/main). Commit
  3968e15fe528bfbdf956a9b3c8aeaad8e348c57b on main; pushed yes (dry-run ok);
  remote SHA 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b. No tag.
- Digests: working tree before add a682f153...8d8b (817 files); `git ls-tree` of new HEAD
  a682f153...8d8b (817 files); equal.
- Staged 28: modified 9, new records 4 (2 review, T01 brief, this brief), evidence 15
  (1 freeze, 1 gate, 13 audit). Own evidence (checks.txt, commit-message.txt) unstaged.
- Other modified handoff files: none beyond the 9; `git diff --stat` and the ignore-eol
  stat identical (9 files, 267 insertions, 37 deletions).
- Checks (exit): node --version 0; HEAD/origin 0; digest 0; git add 0; precommit-check 0
  (28 files, 0 findings); diff --cached --check 0; JSON parse 0; validate_orchestration 0
  (PASS); check_recovery 0 (PASS, 106); validate_package --preflight 0 (PASS);
  post-commit ls-tree digest equal.
- Deviations: first `node --version` ran Node 26 until the Node 24 PATH was corrected
  (no node script ran under 26). One diagnostic `node scripts/source-digest.mjs --help`
  call redirected output to the null device, against the rules; harmless, no effect.
  No fixes or masking needed.
