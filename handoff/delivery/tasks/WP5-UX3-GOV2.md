# WP5-UX3-GOV2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV2; package GOV; kind implement;
  attempt 1; depends on WP5-UX3-FIX3-FREEZE.
- Purpose: adopt the owner's new AGENTS.md text into the repository, with the owner's two
  edits, and translate it into AGENTS.vi.md.
  - Owner answer to WP5-UX3-Q7, 2026-10-19, verbatim: "(a) và sửa cho khớp quy ước .vi.md
    (xóa các cụm từ ko liên quan như “shop-floor”, “step type”, “probe kind”, “manifest
    key”...".
  - Meaning: adopt the text; adapt the runbook line to this repository's `.vi.md`
    convention; remove phrases that do not belong to this project, such as "shop-floor",
    "step type", "probe kind" and "manifest key".
  - See the board's `owner_decisions` and `answered_owner_question_ux3_q7`.
- AGENTS.md is a governance path (docs/08 "Governance scope"). This task is followed by a
  GOV freeze, a gate and a fresh audit.
- Profile/routing: timesheet-worker (effort medium); requested model sonnet; no override.
  Routing: size S, risk M, novelty no. Task record in English.
- Base:
  - HEAD = origin/main = a78ada5edbf5339d4502df57e9f195d11c0b5d28.
  - The working tree differs from it outside `handoff/` only by the owner's uncommitted
    AGENTS.md edit: 48 insertions and 1 deletion that add "# AI Instruction", "Operating
    Contract" and "Prime Directive", and turn "# Project instructions" into
    "## Project instructions".
  - Working-tree digest 54cb9a3dbfab3b07f4028625c9c74ec63d19bef1ae887774283696da52d7d110
    (833 files); HEAD digest d1d903cf.
  - Record HEAD, `git status --short`, `git diff --stat -- AGENTS.md` and the digest before
    you edit.
  - Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Edits

1. **AGENTS.md: keep the owner's added text, except these edits.**
   - **Runbook line.** "Operator runbooks get a Vietnamese mirror under `docs/runbooks/vi/`;
     English is canonical." becomes a line that follows this repository's convention: a
     matching `.vi.md` Vietnamese translation beside the English document, with English
     canonical. Example: "Operator runbooks get a matching `.vi.md` Vietnamese translation
     beside the English document; English is canonical."
   - **Phrases named by the owner.**
     - In the Operating Contract, "shop-floor aware" is removed and the sentence stays
       grammatical, for example "Be direct, practical, and architecture-aware."
     - In the Prime Directive, the list "a concept, dependency, step type, task mode, probe
       kind, template variable, or manifest key" keeps only the items that exist in this
       project. "step type", "task mode", "probe kind", "template variable" and "manifest
       key" are removed, which leaves for example "add a concept or dependency without an
       ADR and a named consumer need". `docs/adr/` exists here, per "Domain docs".
   - **Other candidates ("..." in the owner's answer).**
     - For every other noun phrase of the added text that may name a concept from another
       project, Grep this repository (docs, src, scripts, tests, `.github` if present).
       Candidates include "production accuracy", "host check", "CI run", "CI evidence",
       "deployment", "migration" and "release".
     - Remove or neutrally reword a phrase only when this project has no such concept.
     - Keep generic engineering words.
     - List every candidate in Results with the decision (removed, reworded or kept) and
       the Grep evidence, as counts and file names.
   - **Everything else stays exactly as the owner wrote it:** the "# AI Instruction" title
     and its precedence paragraph, every other sentence, and the heading levels.
   - "## Project instructions" items 1-13, "## Agent skills" and "### Frontend and UI/UX
     standards" must stay byte-identical to a78ada5, apart from the heading level the
     owner changed.
2. **AGENTS.vi.md: the matching Vietnamese translation.**
   - Translate the final English additions ("# AI Instruction" title and paragraph,
     "Operating Contract", "Prime Directive") in the same order and at the same heading
     levels, in the style of the existing Vietnamese file.
   - Lower the existing Vietnamese "Project instructions" heading to `##` like the English
     file.
   - Leave the existing Vietnamese items 1-13 and the UI section unchanged.
   - The same code tokens, paths and numbers appear in both languages.

## Checks

1. Node 24 first on PATH, then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `git diff --stat -- AGENTS.md`
   and `npm run digest`.
3. After the edits:
   - Grep both files for `shop-floor`, `step type`, `task mode`, `probe kind`,
     `template variable`, `manifest key` and `docs/runbooks`: 0 matches.
   - Byte-compare the sections that must stay unchanged against
     `git show a78ada5:AGENTS.md` and `git show a78ada5:AGENTS.vi.md`. Use a script file in
     the task folder that extracts the sections; heading-level differences are noted
     separately.
   - EN/VI parity: the same headings count and order, and the same code tokens and
     numbers.
   - Whitespace: Grep both files for `[ \t]+$`; LF line endings, no BOM, exactly one final
     newline.
   - `validate_package.py --preflight` with the workflow Python (write `<user>` in the
     evidence), `handoff/delivery/validate_orchestration.py`, and `check_recovery.py` (106
     probes).
   - `npm run digest` LAST. Record the new full digest and the file count.
4. Copy the masked logs into `handoff/delivery/evidence/WP5-UX3-GOV2/` (LF `.txt` only).

## Owned paths

- `AGENTS.md`, `AGENTS.vi.md`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-GOV2/`

## Runtime

- Use Git Bash only. Never use `cmd.exe`, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `python -c`.
  NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout` OR `nul`. NEVER `rm -r` OR `rm -rf`.**
  - Use the Write and Edit tools for files and the Glob tool for listings.
  - Redirect output to files in the task folder and read them with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- The workflow Python is
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-GOV2`. Set TEMP and TMP to it.
- Create files only in the task folder, the evidence folder and your owned paths.
- If a permission check denies a call, stop and report.
- Write Results with the Edit tool and finish with "Status: done". Do not commit.
- Write no markdown links in Results.

## Return

At most 150 words, beginning 'Self-reported model: ...'. Include:
- each edit, with the before and after wording;
- the candidate list with decisions;
- the check results;
- the final 64-hex digest and file count;
- any deviation.

## Results

Evidence: handoff/delivery/evidence/WP5-UX3-GOV2/ (pre.txt, cand.txt, cand2.txt, post.txt).
Pre-edit: Node v24.21.0, HEAD a78ada5, digest 54cb9a3d... (833 files).

Edits in AGENTS.md:
- Runbook line: "a Vietnamese mirror under `docs/runbooks/vi/`" became "a matching `.vi.md` Vietnamese translation beside the English document".
- "architecture-aware, and shop-floor aware." became "and architecture-aware."
- Prime Directive list "a concept, dependency, step type, task mode, probe kind, template variable, or manifest key" became "a concept or dependency".
- "CI run, " removed; "and CI evidence" became "and recorded evidence".

Candidates (Grep over docs, src, scripts, tests, .github, README.md):
- production accuracy: 0 hits as a phrase, but "production" is a project concept (37 files in docs/src); kept.
- host check: 1 file (scripts/container-drill.mjs), kept.
- CI run, CI evidence: no .github, 0 hits for the word CI; removed and reworded.
- deployment: 14 files (README.md, docs/03, docs/07); kept.
- migration: 61 files; kept.
- release: 52 files; kept.
- recoverability, consumer need, public API: 0 hits but generic engineering wording; kept.
- Note: docs/adr/ does not exist yet; "ADR" appears in 1 docs file; text kept as the owner wrote it.

AGENTS.vi.md: added "# Hướng dẫn AI", "## Quy tắc vận hành", "## Chỉ dẫn tối thượng"; the old "# Hướng dẫn dự án" became "## Hướng dẫn dự án".

Checks: forbidden phrases 0 matches in both files; trailing whitespace 0; LF, no BOM, one final newline; heading counts and order equal (9 and 9); items 1-13 through the end byte-identical to a78ada5 in both files (cmp 0); only heading-level differences remain. validate_package --preflight PASS; validate_orchestration PASS; check_recovery PASS (106).
Final digest: b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
Deviation: none.

Status: done
