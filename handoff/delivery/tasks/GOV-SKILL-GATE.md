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
