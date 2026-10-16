# WP5-UX3-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T03-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T03 (done).
- This commit freezes slice WP5-UX3-T03: Settings sub-pages (Personal, Profile,
  Administration), the Profile page, the route model with the `#/admin` redirect, and lazy
  loading of the Administration and Import screens. It also carries the coordinator records
  since aa64999 (the T02 freeze results, the T03 record and evidence, the T04 brief, the
  board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = aa64999240ab0d5822ca371a0c8e24436d27f30a. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul` (NOT EVEN FOR A `--help` PROBE).** Redirect to a file in the task
    folder and read it with the Read tool. To check Node, run `node --version` and nothing
    else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob); the first shell call is `node --version` and must print v24.x. Stop on ENOSPC.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T03-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (15 paths)

- new (5): `src/client/components/routeModel.ts`, `src/client/components/SettingsNav.tsx`,
  `src/client/ProfileScreen.tsx`, `tests/client/routeModel.test.ts`,
  `tests/e2e/settings-routes.spec.ts`;
- modified (10): `src/client/App.tsx`, `src/client/components/AppShell.tsx`,
  `src/client/components/accountModel.ts`, `src/client/styles.css`,
  `tests/client/accountModel.test.ts`, `tests/e2e/admin-status.spec.ts`,
  `tests/e2e/admin-users.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/isolation.spec.ts`,
  `tests/e2e/shell.spec.ts`.

If the working tree differs from this set (a path missing, or another changed path), do not
commit: report the exact difference and stop. Any path under `src/server/`, `src/domain/`,
`docs/`, `scripts/`, AGENTS/CLAUDE, `.claude/`, `package.json`, the lockfile or
`vite.config.ts` always stops the commit. If anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
e5b3faf96c7856fdf5e8c3c85072270e3b7112f100ba364efe2a5331bb367564 (827 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (28)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T02-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T03.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T04.md` and this brief as it stands
  before you append results;
- new evidence (21): `handoff/delivery/evidence/WP5-UX3-T02-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T03/` (19: 17
  `.txt` and 2 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 43 (15 source/tests + 28 handoff). If the T03 evidence count differs
from 19, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T03-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T03-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (e5b3faf9…, 827 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (e5b3faf9…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
Mask only as your profile allows; otherwise do not commit and report. If a permission check
denies a call, stop at once. Do not print diffs, file bodies or matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T03: Settings sub-pages, Profile and lazy admin screens

- feat(client): Settings gains sub-pages Personal (`#/settings`), Profile
  (`#/settings/profile`, read-only name, email, role and reporting zone) and Administration
  (`#/settings/admin`, admins only) with a sections nav; the old `#/admin` is replaced by the
  new address for admins and falls back to the timesheet for employees; the account menu
  points to the new pages; the Administration and Import screens load lazily (main chunk
  502.77 -> 452.08 kB, no size advisory). Server authorization unchanged.
- test: route model unit tests; settings-routes e2e (sub-pages, redirects, back button,
  lazy load and its error state, no admin request from an employee); navigation steps in the
  admin-status, admin-users, import, isolation and shell specs.
- docs(handoff): T02 freeze results, T03 record and evidence, T04 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T03 (owner request 2026-10-15, U-04, U-05)
Gate: unit 2059 passed; full e2e desktop 256 passed, mobile 267, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: e5b3faf9 (was c938aa6f)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix or stop reason.

## Results

- Pre-HEAD aa64999240ab0d5822ca371a0c8e24436d27f30a (= origin/main); post-HEAD and
  commit 7cd8c592ba57d7f4a12013bacced948de0fb8c42; pushed yes; remote main equals it. No tag.
- Digests: before add and on new HEAD both e5b3faf96c7856fdf5e8c3c85072270e3b7112f100ba364efe2a5331bb367564 (827 files).
- Staged 43: 15 source/tests + 28 handoff (T03 evidence folder had 19 files).
- Other modified handoff files: none beyond the listed ones.
- Checks (all exit 0): node v24.21.0; HEAD/origin; digest; git add; precommit PASS (43 files);
  diff --cached --check; JSON parse; validate_orchestration PASS; check_recovery PASS (106);
  validate_package --preflight PASS (first try wrong path, exit 127, rerun exit 0).
- No fixes, no masking, no stop. Details in evidence/WP5-UX3-T03-FREEZE/checks.txt.
