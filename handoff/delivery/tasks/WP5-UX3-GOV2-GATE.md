# WP5-UX3-GOV2-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV2-GATE; package GOV; kind gate;
  attempt 1; depends on WP5-UX3-GOV2-FREEZE (done).
- Scope: the GOV gate for the owner's new AGENTS.md text, with the owner's edits and the
  AGENTS.vi.md translation. The task record is `handoff/delivery/tasks/WP5-UX3-GOV2.md`; the
  owner answer is WP5-UX3-Q7 (board `owner_decisions`, 2026-10-19).
- Target: `freeze_commit` = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f (HEAD = origin/main).
  Digest b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
  The base is a78ada5edbf5339d4502df57e9f195d11c0b5d28.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- WP5-UX3-REGATE2 runs in parallel on the same commit, read-only, with other ports and
  folders.

## Gate items

1. **Identity.**
   - HEAD = origin/main = ceb86b6.
   - Compute the digest three ways and confirm all equal b35dddd5: on a clean `git archive`
     export without `.git` (never `git init` it), in the `git ls-tree` form, and with
     `npm run digest`.
   - `git status --short`: only `handoff/` paths.
2. **Scope.** `git diff --name-only a78ada5..ceb86b6` outside `handoff/` is exactly
   `AGENTS.md` and `AGENTS.vi.md`. `git diff --check a78ada5..ceb86b6` exits 0.
3. **The owner's edits.**
   - The runbook line names a matching `.vi.md` translation beside the English document,
     not `docs/runbooks/vi/`.
   - The words `shop-floor`, `step type`, `task mode`, `probe kind`, `template variable`,
     `manifest key` and `docs/runbooks` occur 0 times in both files.
   - The rewordings "a concept or dependency" and "recorded evidence" are present.
4. **Unchanged sections.**
   - From "Project instructions" items 1-13 to the end of each file, the text is
     byte-equal to `git show a78ada5:AGENTS.md` and `git show a78ada5:AGENTS.vi.md`. Only
     the one heading level differs.
   - Use a script file that extracts the sections.
5. **EN/VI parity of the additions.**
   - The same headings in the same order and at the same levels.
   - The same code tokens, paths and numbers.
   - Each English sentence of the "AI Instruction" paragraph, "Operating Contract" and
     "Prime Directive" has a Vietnamese counterpart. List any missing or extra sentence.
6. **Format.** LF line endings, no BOM, exactly one final newline, no trailing whitespace.
7. **Validators.**
   - `validate_package.py --preflight` (workflow Python; write `<user>` in the evidence);
   - `handoff/delivery/validate_orchestration.py`;
   - `check_recovery.py` (106 probes);
   - the precommit self-test;
   - `npm run verify` on the clean export, with `SMOKE_PORT` in 49160-49169 and
     `DATA_DIR` and `DATABASE_PATH` inside the task folder.

Decision: PASS / FAIL / NOT VERIFIED.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-GOV2-GATE`. Set TEMP and TMP to it.
  Ports: 49160-49169.
- Use Git Bash only, never cmd.exe.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `python -c`. NEVER PIPE INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm -r`.**
  - Write scripts with the Write tool and run them by path.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The first call is `node --version`; it must print v24.x.
- The workflow Python is
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Create files only in the task folder and in `handoff/delivery/evidence/WP5-UX3-GOV2-GATE/`
  (masked LF `.txt`; `checks.txt` required).
- Never edit source, docs, tests, AGENTS, the board or STATE. Never kill by PID.
- Leave nothing running.
- If a permission check denies a call, stop and report.

## Output

- Results go in this file: the decision, gate notes, and every item with its commands and
  exit codes.
- Return at most 150 words, beginning with 'Self-reported model: ...'.

## Results

Decision: PASS. Evidence: handoff/delivery/evidence/WP5-UX3-GOV2-GATE/checks.txt (Node v24.21.0; workflow Python at <user>).

1. Identity: HEAD = origin/main = ceb86b6. Digest b35dddd5...ebb48 (833 files) on a clean git archive export without .git (own script, git hash-object), in the git ls-tree form, and with npm run digest; all equal, and unchanged after the checks. git status --short outside handoff/: none.
2. Scope: non-handoff diff a78ada5..ceb86b6 is exactly AGENTS.md and AGENTS.vi.md; git diff --check exit 0.
3. Owner edits: runbook line names a matching .vi.md translation beside the English document. The seven forbidden phrases occur 0 times in both files. "recorded evidence" present; "a concept or dependency" present (the line wraps after "or", so a single-line search misses it; normalised text matches).
4. Unchanged sections: everything after the Project instructions heading is byte-equal to a78ada5 in both files (0 differing lines); only the heading level differs (# to ##).
5. Parity: 9 headings, same order and levels. Numbers equal. Code tokens equal except `Commit description` in item 12, which is in EN only; this difference is pre-existing in the unchanged section (a78ada5 AGENTS.vi.md has 0 occurrences), not an addition. Sentence-by-sentence: no missing or extra sentence in AI Instruction, Operating Contract (14 bullets) or Prime Directive.
6. Format: both files LF, no BOM, one final newline, 0 trailing-whitespace lines.
7. Validators (all exit 0): validate_package --preflight PASS; validate_orchestration PASS; check_recovery PASS (106); precommit self-test PASS (35 path, 74 line, 12 rules); npm ci then npm run verify on the clean export, SMOKE_PORT 49160, DATA_DIR and DATABASE_PATH in the task folder: 94 files, 2141 tests passed, SMOKE PASSED.

Notes: one trailing no-op command redirected to the null device by mistake (no effect). Nothing left running.

Status: done
