# WP4-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T01-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T01.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (source, configuration example, audit records), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  3bdffbec685599b02c41c0a1f85931c8d90242f2. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T01-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell. Never kill processes by PID.

## Expected working-tree set

Changed or new paths outside handoff/ may only be among these:
- `src/server/app.ts`, `src/server/config.ts`, `src/server/index.ts`,
  `src/server/routes/auth.ts`;
- `src/server/http/clientAddress.ts` (new);
- `.env.example` (new);
- `scripts/smoke-built-server.mjs`;
- `tests/integration/auth.test.ts`, `tests/integration/config.test.ts`,
  `tests/integration/sharing-matrix.test.ts`;
- `tests/integration/health.test.ts` (new).

`.env.example` must contain placeholders only, with no secret value. Check this with the
Grep tool for password, token or key values, without printing them. There must be no
change under `.claude/`, docs/, migrations, `package.json` or the lock file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 1c57dbae49f4b69785b4e4df41321019b686f789903b972fb403987b4d4dae60.

Handoff files to stage:
- New:
  - handoff/delivery/GOV_SKILL_REVIEW.md and .vi.md;
  - handoff/delivery/tasks/WP4-T01.md and this brief (as it stands before you append
    results);
  - every file under handoff/delivery/evidence/: GOV-SKILL-FREEZE/, GOV-SKILL-GATE/,
    GOV-SKILL-AUDIT/, WP4-PLAN/ and WP4-T01/.
- Modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/tasks/: GOV-SKILL-FREEZE.md, GOV-SKILL-GATE.md,
    GOV-SKILL-AUDIT.md and WP4-PLAN.md (results).

Your appended results and your evidence in handoff/delivery/evidence/WP4-T01-FREEZE/
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under evidence/;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content;
- any `.env` file other than `.env.example`.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, remove exactly that line and re-stage it. If the precommit check blocks an
email address or the Windows user name in an evidence log, replace it with `<email>` or
`<user>` in that evidence file only, then re-stage and rerun. A block in a source, test,
`.env.example` or review file stops the commit.

If any call is denied by a permission check, stop at once; do not retry, split or
rephrase it. Never write into the repository root, and never redirect to /dev/null or
nul. Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add container-ready configuration, readiness check and trusted-proxy handling

- feat(config): production requires absolute DATA_DIR and DATABASE_PATH; the data
  directory is created at start
- feat(http): TRUSTED_PROXY_ADDRESSES (default none); X-Forwarded-For is used for the
  login limiter only from a trusted proxy (right-most untrusted hop)
- feat(health): /api/ready returns allowlisted readiness keys only, 503 when the schema
  or data directory is not usable; the smoke test checks it
- docs(config): .env.example with safe placeholders and no secrets
- docs(handoff): GOV-SKILL gate PASS and audit FIX REQUIRED with owner questions, WP4
  plan, WP4-T01 records, board and checkpoint (+ vi)

Task: WP4-T01-FREEZE

## Push and report

Push per the profile. Append these results:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the `.env.example` scan result;
- the check exit codes;
- any blockers.

Write evidence to handoff/delivery/evidence/WP4-T01-FREEZE/ as `.txt` files only.
Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1: pre-HEAD 3bdffbe; commit a1dc01b98f3c8be7478384adf73d9c194bf9a105; pushed yes;
remote SHA a1dc01b98f3c8be7478384adf73d9c194bf9a105; digest matched; staged 50;
.env.example scan clean (placeholders only); all checks exit 0 (Node v24.21.0); no
blockers. Evidence: handoff/delivery/evidence/WP4-T01-FREEZE/commit-evidence.txt.
