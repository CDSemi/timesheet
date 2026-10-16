# WP5-UX3-T10-FREEZE dispatch brief (package-final freeze of UI change round 3)

- Mission/task: timesheet-software-readiness / WP5-UX3-T10-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T10 (done).
- This commit freezes slice WP5-UX3-T10 (docs/04, docs/10 and docs/12, EN and VI) and is the
  package-final freeze of UI change round 3: the package gate and the independent audits run
  on this commit. It also carries the coordinator records since 4b5403d (the T09 freeze
  results, the T10 record and evidence, the three audit briefs, the board, STATE, the
  checkpoint pair and NEXT_ACTION pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`). NEVER
    REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul` (NOT EVEN FOR A `--help`
    PROBE).** Redirect to a file in the task folder and read it with the Read tool. To check
    Node, run `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob) in the same shell call as your first `node --version`, which must print v24.x.
    Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T10-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (6 modified paths)

`docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`,
`docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`,
`docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/`, `tests/`, `scripts/`, docs/08, AGENTS/CLAUDE, `.claude/`,
`package.json` or the lockfile always stops the commit. If anything is already staged,
report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (20)

- modified (8): `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T09-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T10.md`;
- new task records (4): `handoff/delivery/tasks/WP5-UX3-AUDIT-A.md`,
  `handoff/delivery/tasks/WP5-UX3-AUDIT-B.md`, `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`
  and this brief as it stands before you append results;
- new evidence (8): `handoff/delivery/evidence/WP5-UX3-T09-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T10/` (6
  `.txt`; count with the Glob tool first).

Expected staged total: 26 (6 docs + 20 handoff). Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T10-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T10-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (29ac2594…, 833 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (29ac2594…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
docs file: do not fix; stop and report the file and line, leaving the index staged. If a
permission check denies a call, stop at once. Do not print diffs, file bodies or matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T10: round-3 documents (package-final freeze)

- docs: docs/04 describes the round-3 interface (account menu, Settings sub-pages, title row,
  period card and pills, lifted sheet columns, the 1360px editor rule, the session dialog,
  break rows and chips, the notice and confirmations, Check out) and states the rewritten
  rule that actual clock values are never stored from a schedule while the new-session
  dialog may pre-fill marked reference hours; docs/10 records the round-3 owner and
  coordinator decisions; docs/12 lists the round-3 changes; EN and VI kept in step.
- docs(handoff): T09 freeze results, T10 record and evidence, the area A, area B and
  integration audit briefs, board, STATE, checkpoint (+ vi), NEXT_ACTION (+ vi).

Task: WP5-UX3-T10 (owner request 2026-10-15; U-23 rule rewrite per G-3 a)
Gate: pending, WP5-UX3-GATE (package-final)
Audit: pending, WP5-UX3-AUDIT-A, WP5-UX3-AUDIT-B, WP5-UX3-AUDIT-INT (fresh opus)
Digest: 29ac2594 (was 1fc57bce)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results

- Pre-HEAD 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56 (= origin/main); post-HEAD and commit
  cecfceb61c7f15216c8f188e8b7059c9f075247d; pushed yes; remote SHA the same; branch main; no tag.
- Digests: before add 29ac2594... (833 files); ls-tree of new HEAD 29ac2594... (833 files).
- Staged 26: 6 docs, 8 modified handoff, 4 new task records, 8 evidence. No other modified
  handoff files; nothing pre-staged; no masking; no fixes.
- Checks (all exit 0): node v24.21.0; precommit PASS 26 files; diff --cached --check empty;
  JSON parse ok; validate_orchestration PASS (406 tasks); check_recovery PASS (106);
  validate_package --preflight PASS. Details in evidence/WP5-UX3-T10-FREEZE/checks.txt.
- Left unstaged: this brief's results and the evidence folder files.
