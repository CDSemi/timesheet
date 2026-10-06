# GOV-SKILL-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-GATE; package GOV; kind gate;
  attempt 1; depends on GOV-SKILL-FREEZE. This is the gate for adding the owner's skill
  `.claude/skills/readme-md/`, a governance path (owner decision H-Q3 (a)).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: `freeze_commit` = the GOV-SKILL-FREEZE commit; the coordinator gives the SHA in
  the dispatch prompt. Record HEAD and the source digest before and after. The digest of
  record is the one you compute on a clean export of the freeze: export blob IDs,
  cross-checked with `git ls-tree`.
- Read AGENTS.md from disk first. Then read docs/08 (governance scope) and the
  GOV-SKILL-FREEZE result.
- Read-only for source and governance files.
- Runtime:
  - Use Node 24 by full path.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-GATE` for TEMP/TMP, the export and all raw
    output. Put only masked copies in the evidence directory.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID.
  - Never write into the repository root; never redirect to /dev/null or nul.
  - If a call is denied by a permission check, stop and report.

## Checks (record each command and its exit code)

1. HEAD equals the freeze commit. The working tree is clean outside handoff/.
2. Diff scope: `git diff --name-only <freeze>^ <freeze>`. Outside handoff/delivery/ it
   must list only the three files under `.claude/skills/readme-md/`.
3. Skill format:
   - `SKILL.md` has a YAML frontmatter block with `name` and `description`;
   - the `name` matches the folder name;
   - every reference the body names exists in `references/`.

   Record the frontmatter fields only, not the body.
4. Hygiene:
   - `git diff --check <freeze>^ <freeze>` exits 0;
   - the precommit check over the freeze's three skill files reports 0 findings;
   - the three skill files have no CR and no trailing whitespace. Count these with the
     Grep tool.
5. On the clean export: `npm ci`, then `npm run verify` with
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation`. Both must exit 0, and the
   test count must equal the WP3 accepted count (1420), because no source changed.
6. Run `validate_orchestration.py`, `check_recovery.py` and `validate_package.py
   --preflight` in the project folder against the live board, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   All must exit 0. Write `<user>` in the evidence.
7. The digest of record, computed on the export. It must differ from the WP3 digest
   c31c300c… only by the three skill files: list the per-file blob difference.

## Output

Write results in this file. Write masked, LF evidence in
handoff/delivery/evidence/GOV-SKILL-GATE/. Decide PASS or FAIL, naming every failing
check. Leave no process running.

Return at most 120 words, beginning with your self-reported model.

## Results

(Verifier appends here.)

Verifier: timesheet-verifier (claude-sonnet-5-5), attempt 1, 2026-10-05. Node v24.21.0 portable.
Evidence (masked): handoff/delivery/evidence/GOV-SKILL-GATE/*.txt. Raw output under D:\.claude-tmp\timesheet\GOV-SKILL-GATE.

HEAD before and after: 3bdffbec685599b02c41c0a1f85931c8d90242f2 (= freeze_commit).

1. PASS. HEAD equals freeze; `git status --short` outside handoff/ is empty.
2. PASS. `git diff --name-only <freeze>^ <freeze>` outside handoff/delivery/ lists only
   .claude/skills/readme-md/SKILL.md, references/markdown.md, references/outlines.md.
3. PASS. Frontmatter fields: `name: readme-md`, `description` (folded block). Name equals folder.
   Body names references/markdown.md and references/outlines.md; both exist.
4. PASS. `git diff --check` exit 0. Precommit over the three files (scratch repo with the files
   staged, Node 24): "PASS: 3 staged file(s), 0 blocking finding(s), 0 warning(s)", exit 0.
   Grep `\r|[ \t]+$` over the skill folder: 0 matches.
5. PASS. Export via `git archive` of the freeze; `npm ci` exit 0; `NODE_OPTIONS=--trace-deprecation
   --pending-deprecation npm run verify` exit 0; Test Files 62 passed; Tests 1420 passed (1420);
   0 deprecation lines; smoke ran.
6. PASS. validate_orchestration.py exit 0; check_recovery.py exit 0; validate_package.py --preflight
   exit 0 (live board).
7. PASS. Digest of record (export blob IDs hashed with git hash-object, equal to git ls-tree):
   aab8b32cd69a8ba598dc91929290ec198107664e5bc42fb2616c7eb6da0a705d, 724 files; matches the
   committer's figure. Versus WP3 c31c300c… (parent tree): only three added files, no other change:
   + .claude/skills/readme-md/SKILL.md 3f457942db64399372ad10fd2b6177fd5824cee0
   + .claude/skills/readme-md/references/markdown.md 56f5eed2787e7f6e5b62af6302bd318b123fa3ce
   + .claude/skills/readme-md/references/outlines.md 64de9ad834e66aac906c43fabf83fbbcb9cd4b9c
   (Parent listing diff shows exactly these three lines; 721 files before.)

Decision: PASS (7/7). No process left running; created only temp files.
