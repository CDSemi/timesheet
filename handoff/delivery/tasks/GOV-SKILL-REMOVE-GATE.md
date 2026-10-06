# GOV-SKILL-REMOVE-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-REMOVE-GATE; package GOV; kind
  gate; attempt 1; depends on GOV-SKILL-REMOVE-FREEZE.
- This is the gate for removing the skill `.claude/skills/readme-md/`, a governance path.
  The owner chose option B on 2026-10-05, which reverses H-Q3 (a).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Target: `freeze_commit` = a92335184e7dc09b2114ec30a46979ecd02ab92a. Its parent is
  e5576de27fb3185f22720f989e386a44b1d90488. Record HEAD and the source digest before and
  after.
  - The digest of record is the one you compute on a clean export of the freeze: export
    blob IDs, cross-checked with `git ls-tree`.
  - The committer reported fcd8fe1e859ca34b63c6b82e2d4f593c8bfd422a2d8b04f24d056f82bb6b194c
    over 750 files. Treat that as a claim to check, not as proof.
- Read AGENTS.md from disk first. Then read docs/08 (governance scope) and the
  GOV-SKILL-REMOVE and GOV-SKILL-REMOVE-FREEZE results.
- Read-only for source and governance files.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path; plain `node` resolves v26.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-GATE` for TEMP/TMP, the export and all
    raw output. Put only masked copies in the evidence directory.
  - Delete only files you created; never remove folders recursively.
  - Never kill processes by PID. Never write into the repository root. Never redirect
    to /dev/null or nul.
  - If a call is denied by a permission check, stop and report. Do not retry or
    rephrase it.
  - Write your results into this brief with the Edit tool.

## Checks (record each command and its exit code)

1. HEAD and origin/main equal the freeze commit, and the working tree is clean outside
   handoff/.
2. Diff scope: `git diff --name-status <freeze>^ <freeze>`. Outside handoff/ it must list
   exactly three `D` entries:
   - `.claude/skills/readme-md/SKILL.md`;
   - `.claude/skills/readme-md/references/markdown.md`;
   - `.claude/skills/readme-md/references/outlines.md`.
3. No path under `.claude/skills/readme-md/` exists in the freeze tree
   (`git ls-tree -r <freeze> -- .claude/skills/readme-md` prints nothing). Nothing
   outside handoff/ in the freeze tree mentions `readme-md`
   (`git grep -n readme-md <freeze> -- . ':!handoff'` finds no match).
4. Hygiene: `git diff --check <freeze>^ <freeze>` exits 0.
5. On a clean export of the freeze (`git archive`): `npm ci`, then `npm run verify` with
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation`.
   - Both must exit 0, with 0 deprecation lines.
   - The test count must equal the WP4-T12A figure, 70 files and 1589 tests, because
     no source or test changed since then.
   - Run both from Git Bash with Node 24 first on PATH.
6. Run `validate_orchestration.py`, `check_recovery.py` and `validate_package.py
   --preflight` in the project folder against the live board, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   All must exit 0. Write `<user>` in the evidence.
7. Compute the digest of record on the export.
   - It must equal the `git ls-tree` form at the freeze: exclude handoff/, sort with
     `LC_ALL=C`, then sha256.
   - Compare it with the parent's ls-tree listing (digest 65247d70…, 753 files). The
     only difference must be the three removed skill files; list them.

## Output

Write results in this file. Write masked, LF `.txt` evidence in
handoff/delivery/evidence/GOV-SKILL-REMOVE-GATE/. Decide PASS or FAIL, naming every
failing check. Leave no process running.

Return at most 120 words, beginning with your self-reported model.

## Results

Verifier: claude-sonnet-5-5. Decision: **PASS**. No check failed.

HEAD and origin/main (after `git fetch`) both equal a92335184e7dc09b2114ec30a46979ecd02ab92a before and after.
Source digest before and after is fcd8fe1e859ca34b63c6b82e2d4f593c8bfd422a2d8b04f24d056f82bb6b194c.

1. HEAD == origin/main == freeze; no status entry outside handoff/ (grep exit 1 = none). OK.
2. `git diff --name-status <freeze>^ <freeze>`: exactly three `D` entries outside handoff/ (SKILL.md, references/markdown.md, references/outlines.md). OK.
3. `git ls-tree -r <freeze> -- .claude/skills/readme-md` prints nothing (exit 0); `git grep -n readme-md <freeze> -- . ':!handoff'` exit 1 (no match). OK.
4. `git diff --check <freeze>^ <freeze>` exit 0. OK.
5. Clean `git archive` export, Node v24.21.0 portable, TEMP/TMP in the scratch dir: `npm ci` exit 0; `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation` exit 0; 70 files, 1589 tests passed; 0 deprecation lines in either log. OK.
6. `validate_orchestration.py`, `check_recovery.py`, `validate_package.py --preflight` (workflow Python at C:\Users\<user>\.cache\codex-runtimes\...) all exit 0. OK.
7. Digest of record (export blob IDs, `git hash-object --no-filters`, 750 files, LC_ALL=C sort) is byte-identical to the freeze ls-tree listing, sha256 fcd8fe1e… — the committer's claim is confirmed. Parent ls-tree gives 65247d70f5569f09dda4d328b455a4e39836223f81de5227a3f19a83bd64c23c (753 files). The only difference is the three removed files:
   - .claude/skills/readme-md/SKILL.md 3f457942db64399372ad10fd2b6177fd5824cee0
   - .claude/skills/readme-md/references/markdown.md 56f5eed2787e7f6e5b62af6302bd318b123fa3ce
   - .claude/skills/readme-md/references/outlines.md 64de9ad834e66aac906c43fabf83fbbcb9cd4b9c

Evidence (masked, LF): handoff/delivery/evidence/GOV-SKILL-REMOVE-GATE/ (summary, verify, npm_ci, validate_orchestration, check_recovery, validate_package). Raw output and export remain in D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-GATE. No process left running; no source or governance file modified.
