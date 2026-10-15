# WP5-UX3-GOV-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV-FREEZE; board package GOV; kind
  commit; attempt 1; depends on WP5-UX3-GOV (done).
- This governance freeze commits the owner-requested change of the AGENTS.md UI section
  (modern instead of industrial style; owner request U-01 and answer G-1 b of 2026-10-15,
  verbatim on the board). It also carries the coordinator records since 5c8355d:
  - the plan addendum WP5-UX3-PLAN2 with the updated mockup and eight new renders;
  - the GOV record and evidence, the T06-FREEZE results and evidence;
  - the pending GOV gate and audit briefs;
  - the board, STATE.json, the checkpoint pair and NEXT_ACTION pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  5c8355df8d60fdeb85b551eb0e5a09e8f18a6334.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each extra
    commit (SHA, author name, subject, file names) and continue.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the Read
    tool. To list or count files, use the Glob tool or redirect to a file. To check Node,
    run `node --version` and nothing else.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-GOV-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 2 modified paths from WP5-UX3-GOV:
- `AGENTS.md`;
- `AGENTS.vi.md`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
CLAUDE.md, `.claude/`, `.agents/`, docs/, `src/`, `tests/`, `scripts/`, `package.json` and
the lockfile. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified (8):
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-T06-FREEZE.md` (its appended results);
  - `handoff/delivery/design/WP5-UX3/mockup.html`;
- new task records (5):
  - `handoff/delivery/tasks/WP5-UX3-GOV.md`;
  - `handoff/delivery/tasks/WP5-UX3-PLAN2.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV-GATE.md`;
  - `handoff/delivery/tasks/WP5-UX3-GOV-AUDIT.md`;
  - this brief, as it stands before you append results;
- new design renders (8) in `handoff/delivery/design/WP5-UX3/`: the files whose basenames
  start with `mockup-r2-` and end with `-synthetic.png`;
- new evidence (11): every file in `handoff/delivery/evidence/WP5-UX3-T06-FREEZE/` (2
  `.txt`) and in `handoff/delivery/evidence/WP5-UX3-GOV/` (9 `.txt`).

Expected staged total: 34 (2 governance + 32 handoff). Your appended results and your
evidence in `handoff/delivery/evidence/WP5-UX3-GOV-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`;
- any other new file in `handoff/delivery/design/WP5-UX3/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX3-GOV-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be a682f153…, 817 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be a682f153…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Mask only as your profile allows. If anything else is blocked, do not commit: report
  the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-GOV: modern style standard in AGENTS.md

- docs(agents): replace the "Unified Frontend & UI/UX Standards (Taste Skills
  Integration)" section of AGENTS.md and its AGENTS.vi.md counterpart with "Frontend and
  UI/UX standards": a modern, friendly business style instead of the industrial direction;
  tokens as CSS custom properties in the light and both dark sets; accessible states (WCAG
  2.2 AA); a shared transition on listed properties with reduced motion; the three taste
  skills become optional references. Owner request U-01 and answer G-1 b (2026-10-15).
- docs(handoff):
  - plan addendum WP5-UX3-PLAN2 (floating editor below 1360px, square week sheets with
    grouped 4px lifted columns, phone break chips with a sub-dialog, the G-4 notice, the
    "in progress" pill), the updated mockup and eight synthetic renders;
  - the GOV record and evidence, the T06 freeze results and evidence, the GOV gate and
    audit briefs;
  - the owner answers and coordinator decisions on the board; STATE, the checkpoint (+ vi)
    and NEXT_ACTION (+ vi).

Task: WP5-UX3-GOV (owner request 2026-10-15, U-01; G-1 b)
Gate: pending, WP5-UX3-GOV-GATE
Audit: pending, WP5-UX3-GOV-AUDIT (fresh opus)
Digest: a682f153 (was 0ef75a15)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results
