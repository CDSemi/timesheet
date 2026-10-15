# WP5-UX3-GOV dispatch brief

- Status: dispatched 2026-10-15 after the owner answered G-1 (b) (verbatim in the board
  `owner_decisions`).
- Mission/task: timesheet-software-readiness / WP5-UX3-GOV; package GOV; kind implement;
  attempt 1; depends on WP5-UX3-PLAN (done). Governance change for UI change round 3.
- Owner request (chat, 2026-10-15, item U-01; verbatim in the board `owner_decisions`):
  "Đừng ép dùng theme style chuẩn công nghiệp, đây không phải app công nghiệp. hãy dùng
  modern style." (Do not force the industrial-standard style theme; this is not an
  industrial app. Use a modern style.)
- Scope: replace the AGENTS.md section "Unified Frontend & UI/UX Standards (Taste Skills
  Integration)" and its AGENTS.vi.md counterpart "Tiêu chuẩn Giao diện & UI/UX Thống nhất
  (Tích hợp Bộ kỹ năng Taste Skills)" with the text drafted in
  `handoff/delivery/tasks/WP5-UX3-PLAN.md`, Results section B2 (the two fenced blocks),
  plus the owner changes below, if any. Nothing else in either file changes.
- Owner changes: none to the AGENTS wording. The owner's G-1 changes (square week-sheet
  corners, a 4px radius for selection columns, no overlapping shadows between adjacent
  lifted columns, a floating Day editor panel when the sheet and the panel do not fit side
  by side) are token and layout values that belong to document 04 and the slices; the B2
  text already says corners follow the radius scale documented in document 04.
- A read-only planner (WP5-UX3-PLAN2) runs in parallel; it writes only under `handoff/`.
  Neither task touches the other's files.
- Profile/routing: timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override. Routing: size S, risk M (governance path), novelty no. Task
  record in English.
- Base: HEAD = origin/main = 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334, or a later commit
  that changes only `handoff/`. Source digest
  0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499 (817 files). Record
  both before you edit. Uncommitted coordinator files under `handoff/` are expected: never
  touch them.

## Rules for the edit

- Replace only the section from its heading line to the end of its last list item (in
  AGENTS.md the heading "### Unified Frontend & UI/UX Standards (Taste Skills
  Integration)" and the lines up to the end of item 3; in AGENTS.vi.md the matching block).
  Keep every other line byte-identical, including the section order and the line endings
  the files already use.
- Use the B2 text exactly, except for the owner changes above. Keep the heading level
  (`###`).
- The EN text is authoritative; the VI block must say the same thing (AGENTS rule 1).
- Do not edit CLAUDE.md, docs/08, profiles, skills, docs/04 or docs/10 (the docs follow in
  slice WP5-UX3-T10).

## Checks (in this order; the digest is the LAST command)

1. Put Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before the edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. After the edit: `git diff --stat -- AGENTS.md AGENTS.vi.md` and a line count of the
   removed and added lines per file (names and counts only in evidence).
4. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence); `validate_orchestration.py`; `check_recovery.py`
   (106 probes).
5. Grep both files for the words "industrial", "công nghiệp", "B2B", "4px" and
   "300ms": none may remain in the new section.
6. `npm run digest` LAST (AGENTS.md is inside the source digest, so it changes).
7. Copy the masked logs into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`. NEVER `rm -r` OR `rm -rf`.** Redirect to a file in the task folder
  and read it with the Read tool. Use the Write and Edit tools for files.
- Create files only in the task folder, the evidence folder or your owned paths.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-GOV`. Never kill processes by PID.
- If a permission check denies a call, stop and report; do not retry or work around it.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or push.
  Write no markdown links in Results (paths in backticks only).

## Owned paths

- `AGENTS.md`, `AGENTS.vi.md`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-GOV/` (masked LF `.txt` only)

## Return

At most 120 words, beginning with 'Self-reported model: ...': lines removed and added per
file, every check with its exit code, the final digest and file count, the evidence
files, any deviation.

## Results

- Base: HEAD 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334; pre-edit digest 0ef75a15...7499 (817 files); Node v24.21.0.
- Edit: replaced only the UI section in `AGENTS.md` and `AGENTS.vi.md` with the B2 text, unchanged (no owner changes). Per file 7 lines added, 9 removed (git numstat).
- Checks (exit): node --version 0; digest before 0; validate_package.py --preflight PASS (0, python at `C:\Users\<user>\.cache\codex-runtimes\...`); validate_orchestration.py PASS (0); check_recovery.py 106 probes (0); grep for industrial/công nghiệp/B2B/4px/300ms: only hits are "44px" (substring of 4px) in item 3 of both files, no real match; digest after 0: a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files).
- Evidence: `handoff/delivery/evidence/WP5-UX3-GOV/` (pre, node, digest-before, diffstat, grep, preflight, orch, recovery, digest-after .txt).
- Deviation: none.

Status: done
