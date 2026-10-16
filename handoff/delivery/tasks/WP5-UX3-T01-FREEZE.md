# WP5-UX3-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T01-FREEZE; package WP5; kind
  commit; attempt 2; depends on WP5-UX3-T01 (done).
- **Attempt 2 (overrides the numbers below where they differ).** Attempt 1 stopped at
  `git diff --cached --check` (blank line at EOF in `tests/e2e/surfaces.spec.ts`), leaving 44
  paths staged. T01 Addendum 1 removed only that blank line (no other file changed outside
  `handoff/`). For attempt 2:
  - the expected digest is a4f127cc4a10c8b311811b244be2a82fa87bcd636615b89c765d5be5d2411d86
    (819 files), before `git add` and on the new HEAD;
  - run `git add` again with every explicit path (the 12 source/docs paths and all handoff
    paths below), so the fixed spec and the updated handoff records replace the staged
    copies;
  - the T01 evidence folder now holds 27 files (23 `.txt`, including four `addendum1-*.txt`,
    and 4 `-synthetic.png`); handoff total 36, staged total 48;
  - this brief is staged with the attempt-1 results it now contains; append the attempt-2
    results after them (unstaged); append attempt-2 check output to the same
    `evidence/WP5-UX3-T01-FREEZE/checks.txt` (unstaged);
  - commit message Digest line: `Digest: a4f127cc (was a682f153)`.
- This commit freezes slice WP5-UX3-T01: the round-3 token system and surfaces (raised
  square week cards, footer card), docs/04 "Visual standard" and the docs/10 E-8 note. It
  also carries the coordinator records since 3968e15 (the GOV accept results, the T01 record
  and evidence, the T02 brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b. If
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
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`;
    the first shell call is `node --version` and must print v24.x. Stop on ENOSPC.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T01-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (12 paths)

- modified (10): `src/client/styles.css`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `tests/client/cssThemeParity.test.ts`,
  `tests/e2e/theme.spec.ts`, `tests/e2e/logo.spec.ts`, `docs/04_UX_AND_SETTINGS.md`,
  `docs/04_UX_AND_SETTINGS.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md`,
  `docs/10_DECISIONS_AND_SOURCES.vi.md`;
- new (2): `tests/client/styleTokens.test.ts`, `tests/e2e/surfaces.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit (including
`src/server/`, `src/domain/`, `scripts/`, AGENTS/CLAUDE, `.claude/`, `package.json`, the
lockfile). If anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
e9e8d11720dc3da2a627191b29ba7084198d5e202dba314db28e3f50617006ab (819 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (32)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-GOV-ACCEPT.md`, `handoff/delivery/tasks/WP5-UX3-T01.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T02.md` and this brief as it stands
  before you append results;
- new evidence (25): `handoff/delivery/evidence/WP5-UX3-GOV-ACCEPT/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T01/` (23: 19
  `.txt` and 4 `-synthetic.png`).

Expected staged total: 44 (12 source and docs + 32 handoff). Your appended results and
your evidence in `handoff/delivery/evidence/WP5-UX3-T01-FREEZE/` stay unstaged.

Count the T01 evidence folder with the Glob tool first; if it holds a different number of
files than 23, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T01-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (e9e8d117…, 819 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (e9e8d117…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). Mask only as your profile
allows; otherwise do not commit and report. If a permission check denies a call, stop at
once. Do not print diffs, file bodies or matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T01: round-3 tokens and raised week cards

- feat(client): modern token system in light and both dark sets (page #edf0f5 / #0e1217,
  panel head, accent soft, avatar, danger, pill tokens incl. pink "future" and "in
  progress", five elevation levels with dark rings, radius 6/8/12 and pills, square
  `--radius-sheet`, 4px `--radius-lift`, 120/180/260 ms motion through one
  `--transition` with a local duration, never `all`); toolbar and form header on the page;
  each week a raised square card; the footer its own card; quiet buttons step to the strong
  accent on hover.
- test: theme-parity and style-token unit tests; `surfaces.spec` (surface contrast, square
  week cards, focus ring, reduced motion, no sideways scroll); value-only updates of the old
  page colour in theme and logo specs.
- docs: docs/04 "Visual standard" (EN/VI, incl. the old "High-density" line) and a docs/10
  note that the round-3 owner decision replaces the E-8 radius and motion values.
- docs(handoff): GOV accept results, T01 record and evidence, T02 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T01 (owner request 2026-10-15, U-01, U-02, G-1 b)
Gate: unit 2031 passed; full e2e desktop 229 passed / 29 skipped, mobile 245 / 13, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: e9e8d117 (was a682f153)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix or stop reason.

## Results

- STOPPED, no commit. Pre-HEAD 3968e15 = origin/main; post-HEAD unchanged; pushed no.
- Digest before add e9e8d117... (819 files) OK. Staged 44 (12 source/docs + 32 handoff); precommit exit 0.
- `git diff --cached --check` exit 2: tests/e2e/surfaces.spec.ts:242 new blank line at EOF (source file; not an allowed fix).
- The 44 paths remain staged. Details: evidence/WP5-UX3-T01-FREEZE/checks.txt.
